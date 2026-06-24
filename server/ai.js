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

  const prompt = `
 Create a professional GitHub README.

 Project:
 ${data.name}
 ${data.owner && data.repo ? `GitHub Repository: ${data.owner}/${data.repo}` : ""}

 Description:
 ${data.description}

 Technologies:
 ${data.techStack ? data.techStack.join(", ") : ""}

 Features:
 ${data.features ? data.features.join(", ") : ""}

 ${data.instruction ? `Apply the following improvement instruction to the document: "${data.instruction}"` : ''}

 Include:
 - Title
 - Description
 - Features (Focusing on the detected feature items)
 - Installation (Generate actual setup and clone commands like \`git clone https://github.com/${data.owner || 'owner'}/${data.repo || 'repo'}.git\` based on the technologies)
 - Usage
 - Tech Stack
 - License

 Formatting rules:
 - Return ONLY raw markdown content. Do NOT wrap the entire output in triple backticks (e.g. do not wrap in \`\`\`markdown and \`\`\`).
 - Use standard markdown formatting (headers, tables, badges, codeblocks).
 - Tone should be minimal, premium and professional.
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
