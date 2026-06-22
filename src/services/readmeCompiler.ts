
export const compileReadmeLocally = (project: any): string => {
  const {
    project_name,
    description,
    tech_stack = [],
    features = []
  } = project;

  let md = '';

  // 1. Header & Badges
  md += `# 🌐 ${project_name}\n\n`;
  md += `![build: passing](https://img.shields.io/badge/build-passing-brightgreen) `;
  md += `![license: MIT](https://img.shields.io/badge/license-MIT-blue) `;
  md += `![pr: welcomes](https://img.shields.io/badge/PRs-welcome-orange)\n\n`;

  if (description) {
    md += `> ${description}\n\n`;
  }

  // 2. Tech Stack
  if (tech_stack && tech_stack.length > 0) {
    md += `## 🛠️ Technology Stack\n\n`;
    md += `This application is built using the following core tools:\n\n`;
    tech_stack.forEach((tech: string) => {
      md += `- **${tech}**\n`;
    });
    md += `\n`;
  }

  // 3. Features
  if (features && features.length > 0) {
    md += `## ✨ Key Features\n\n`;
    features.forEach((feat: string) => {
      md += `- **${feat}**\n`;
    });
    md += `\n`;
  }

  // 4. Installation
  md += `## 📦 Installation\n\n`;
  md += `Follow these steps to set up the project locally:\n\n`;
  md += `\`\`\`bash\n# Clone the repository\ngit clone https://github.com/your-username/${project_name.toLowerCase().replace(/\s+/g, '-')}.git\n\n# Navigate to project root\ncd ${project_name.toLowerCase().replace(/\s+/g, '-')}\n\n# Install dependencies\nnpm install\n\`\`\`\n\n`;

  // 5. Usage
  md += `## 🚀 Usage Guide\n\n`;
  md += `To start the application in development mode, run:\n\n`;
  md += `\`\`\`bash\nnpm run dev\n\`\`\`\n\n`;

  // 6. License
  md += `## 📄 License\n\n`;
  md += `This project is licensed under the terms of the MIT License. See [LICENSE](LICENSE) for details.\n`;

  return md;
};
