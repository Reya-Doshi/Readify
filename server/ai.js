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
 Create a professional, recruiter-quality GitHub README.md for the following repository.

 Project Name: ${data.name}
 GitHub Repo: ${data.owner && data.repo ? `${data.owner}/${data.repo}` : "Not specified"}
 Description: ${data.description || profile.description || "Not specified"}

 Detected Technologies:
 - Languages: ${profile.languages ? profile.languages.join(", ") : (data.techStack ? data.techStack.join(", ") : "Not specified")}
 - Frontend Framework: ${profile.frontendFramework || "None"}
 - Backend Framework: ${profile.backendFramework || "None"}
 - Database: ${profile.database || "None"}
 - ORM: ${profile.orm || "None"}
 - Authentication: ${profile.authentication || "None"}
 - AI Services: ${profile.aiServices || "None"}
 - Deployment Platform: ${profile.deploymentPlatform || "None"}
 - Testing Framework: ${profile.testingFramework || "None"}
 - Package Manager: ${profile.packageManager || "None"}

 Project Type: ${profile.projectType || "Unknown"}
 File Tree Layout:
 ${profile.fileTree ? profile.fileTree.join("\n") : "Not provided"}

 Config Files Found:
 ${profile.configFiles ? profile.configFiles.join(", ") : "None"}

 Suggested Features:
 ${data.features ? data.features.map(f => `- ${f}`).join("\n") : ""}

 Default Installation Sequence:
 ${profile.installationInstructions || ""}

 Default Usage Sequence:
 ${profile.usageInstructions || ""}

 ${data.instruction ? `Apply the following improvement instruction to the document: "${data.instruction}"` : ''}

 Generate the README with the following exact section headers:
 1. # Project Title & Overview: A concise, recruiter-quality project introduction (do not copy-paste or repeat descriptions verbatim).
 2. ## Features: Convert description and suggested features into actionable, high-quality product capabilities.
 3. ## Tech Stack: Display the detected tech stack beautifully (using tables, lists, or clean markdown badges).
 4. ## Architecture: Describe the project folder structure based on the File Tree Layout provided above. Explain key directories.
 5. ## Installation: Provide precise clone commands and setup instructions using the correct package manager. Do NOT use placeholders like "your-username" or "your-repository". Use "git clone https://github.com/${data.owner || 'owner'}/${data.repo || 'repo'}.git".
 6. ## Usage: Show real usage commands and examples.
 7. ## Environment Variables: List any required/optional keys based on the stack (e.g. DATABASE_URL if Prisma is used, NEXTAUTH_SECRET if NextAuth is used, etc.).
 8. ## Contributing: Clean, standard contributing guides.
 9. ## License: Standard MIT License unless otherwise specified.

 Critical Rules:
 - Never use placeholders like "your-username", "<placeholder>", or "your-repository".
 - Never invent or assume technologies that are not detected in the profile or stack list.
 - Never output generic setup commands (e.g. do not show 'npm install' or 'npm run dev' unless the project type is Node.js/Vite/Next.js).
 - Output ONLY raw markdown content. Do NOT wrap the entire output in triple backticks (e.g. do not wrap in \`\`\`markdown and \`\`\`).
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
