import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { generateReadme } from "./ai.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// POST /api/generate
app.post("/api/generate", async (req, res) => {
  const { name, description, techStack, features, instruction, owner, repo, repoProfile } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Project name is required" });
  }

  try {
    // 1. Generate README with Gemini
    const markdown = await generateReadme({
      name,
      description,
      techStack,
      features,
      instruction,
      owner,
      repo,
      repoProfile
    });

    // 2. Return generated markdown (database saving is handled on the client side to comply with RLS)
    res.json({
      readme: markdown,
      project: null
    });
  } catch (err) {
    console.error("Error generating README:", err);
    res.status(500).json({ error: err.message || "Failed to generate README" });
  }
});

// Simple in-memory cache for GitHub API responses
const githubCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache

// Proxy GitHub requests to cache results and avoid rate limits
app.get("/api/github-proxy", async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  // Only proxy api.github.com URLs for security
  if (!url.startsWith("https://api.github.com/")) {
    return res.status(400).json({ error: "Only github api requests can be proxied" });
  }

  const authHeader = req.headers["authorization"];

  // Cache key combines URL and Auth header
  const cacheKey = `${url}_${authHeader || ""}`;

  const cached = githubCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[Cache Hit] Serving from cache: ${url}`);
    return res.status(cached.status).set(cached.headers).send(cached.data);
  }

  try {
    console.log(`[Cache Miss] Fetching from GitHub: ${url}`);
    const headers = {};
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }
    headers["Accept"] = req.headers["accept"] || "application/vnd.github.v3+json";

    const response = await fetch(url, { headers });
    const status = response.status;
    const responseHeaders = {
      "content-type": response.headers.get("content-type") || "application/json"
    };

    let data;
    if (responseHeaders["content-type"].includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Cache successful responses (2xx)
    if (status >= 200 && status < 300) {
      githubCache.set(cacheKey, {
        timestamp: Date.now(),
        data,
        status,
        headers: responseHeaders
      });
    }

    res.status(status).set(responseHeaders).send(data);
  } catch (err) {
    console.error(`Proxy error for ${url}:`, err);
    res.status(500).json({ error: "Failed to proxy GitHub request" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Readify backend server running on http://localhost:${PORT}`);
});

