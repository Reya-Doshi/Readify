import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { generateReadme } from "./ai.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey && supabaseUrl !== "YOUR_SUPABASE_URL";

const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!isSupabaseConfigured) {
  console.warn("Server warning: Supabase credentials are not set. Database operations will be skipped.");
}

// POST /api/generate
app.post("/api/generate", async (req, res) => {
  const { id, name, description, techStack, features, instruction } = req.body;

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

    let projectRecord = null;

    // 2. Save generated README to Supabase if connected
    if (supabase) {
      if (id) {
        // Update existing project
        const { data, error } = await supabase
          .from("readmes")
          .update({
            repo_name: name,
            markdown_content: markdown
          })
          .eq("id", id)
          .select()
          .single();

        if (error) {
          console.error("Supabase update error:", error);
        } else {
          projectRecord = data;
        }
      } else {
        // Insert new project
        const { data, error } = await supabase
          .from("readmes")
          .insert({
            repo_name: name,
            markdown_content: markdown
          })
          .select()
          .single();

        if (error) {
          console.error("Supabase insert error:", error);
        } else {
          projectRecord = data;
        }
      }
    }

    res.json({
      readme: markdown,
      project: projectRecord
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
