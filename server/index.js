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
  const { name, description, techStack, features, instruction } = req.body;

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
      instruction
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

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Readify backend server running on http://localhost:${PORT}`);
});

