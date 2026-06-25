import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const isGeminiConfigured = !!apiKey && apiKey !== "YOUR_GEMINI_API_KEY";

const genAI = isGeminiConfigured ? new GoogleGenerativeAI(apiKey) : null;

const model = genAI ? genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
}) : null;

export async function generateReadme(data) {
  if (!isGeminiConfigured || !model) {
    throw new Error("Gemini API key is not configured on the server.");
  }

  const profile = data.repoProfile || {};

  const prompt = `
  You are an expert technical writer and developer. Generate a premium‑grade README.md for the repository.

  ## Repository Context
  - Name: ${data.name}
  - Repo: ${data.owner}/${data.repo}
  - Description: ${data.description || profile.description || "N/A"}
  - Languages: ${profile.languages?.join(", ") || "N/A"}
  - Tech Stack: ${[profile.frontendFramework, profile.backendFramework, profile.database, profile.aiServices].filter(Boolean).join(", ")}
  - Package Manager: ${profile.packageManager || "N/A"}
  ${data.instruction ? `\n- Special Instructions: ${data.instruction}` : ''}

  ## Instructions for generation
  1. Use **skillicons.dev** for all technology icons, centered with allowed HTML.
  2. Begin with a **Hero** section (title, value proposition, badges).
  3. If a file tree is available, include a **Project Structure** section rendered as a plain‑text tree.
  4. Add **Feature** cards (concise, ≤3 lines each), not a simple list.
  5. Add an **Architecture** section containing a Mermaid diagram block.
  6. Add a **Tech Stack** section using separate headings (Frontend, Backend, Database, AI, etc.) and bullet lists; avoid large tables.
  7. Add **Installation** and **Usage** sections that are repository‑aware (e.g., npm/yarn/pnpm for Node, pip/poetry for Python). Do not output generic commands.
  8. Add a **Repository Statistics** section if data is present.
  9. For **Startup / Hackathon / Academic / Portfolio** projects, include: Overview, Problem Statement, Solution, Features, Tech Stack, Architecture, Project Structure, Installation, Usage.
 10. For **Open‑source library** projects, additionally include: Contributing, Code of Conduct, Support, Community, Open Collective, Sponsorship.
 11. Do NOT generate any placeholder or filler content such as "Coming Soon", "TBD", "No screenshots available", etc.
 12. Do NOT use disallowed HTML tags (e.g., <script>, <style>, <div>, <h1>, <h2>, <h3>).
 13. Omit any section that would be empty for the given repo.
 14. Output ONLY raw markdown (no surrounding triple backticks).

  Generate the README now:
  `;

  const result = await model.generateContent(prompt);
  let readmeText = result.response.text();

  // Strip potential wrapping backticks if Gemini includes them
  if (readmeText.startsWith("```markdown")) {
    readmeText = readmeText.replace(/^```markdown\n/, "").replace(/\n```$/, "");
  } else if (readmeText.startsWith("```")) {
    readmeText = readmeText.replace(/^```\n/, "").replace(/\n```$/, "");
  }

  return readmeText;
}
