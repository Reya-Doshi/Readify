import type { Project } from '../types/database';

export const compileReadmeLocally = (project: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>): string => {
  const {
    project_name,
    description,
    tech_stack = [],
    features = [],
    template_style = 'minimal',
    installation = '',
    usage = '',
    advanced_options = {
      includeBadges: true,
      includeInstallation: true,
      includeApiDocs: false,
      includeArchitecture: false,
      includeContribution: false,
      includeLicense: true,
    }
  } = project;

  let md = '';

  // 1. HEADER SECTIONS
  if (template_style === 'minimal') {
    md += `# ${project_name}\n\n`;
    if (description) md += `${description}\n\n`;
  } else if (template_style === 'open-source') {
    md += `# 🌐 ${project_name}\n\n`;
    if (advanced_options.includeBadges) {
      md += `![build: passing](https://img.shields.io/badge/build-passing-brightgreen) `;
      md += `![license: MIT](https://img.shields.io/badge/license-MIT-blue) `;
      md += `![pr: welcomes](https://img.shields.io/badge/PRs-welcome-orange)\n\n`;
    }
    if (description) md += `> ${description}\n\n`;
  } else if (template_style === 'professional') {
    md += `# ${project_name}\n\n`;
    if (advanced_options.includeBadges) {
      md += `[![npm version](https://img.shields.io/badge/npm-v1.0.0-blue.svg)](#) `;
      md += `[![build status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#) `;
      md += `[![coverage](https://img.shields.io/badge/coverage-98%25-emerald.svg)](#)\n\n`;
    }
    if (description) md += `${description}\n\n`;
  } else if (template_style === 'startup') {
    md += `# 🚀 ${project_name}\n\n`;
    md += `### *Write README files developers actually want to read.*\n\n`;
    if (advanced_options.includeBadges) {
      md += `[![Vercel Deployment](https://img.shields.io/badge/deploy-vercel-black.svg)](#) `;
      md += `[![Stack](https://img.shields.io/badge/stack-modern-blue.svg)](#)\n\n`;
    }
    if (description) md += `${description}\n\n`;
  } else if (template_style === 'enterprise') {
    md += `# ${project_name.toUpperCase()}\n\n`;
    md += `**Enterprise Repository & Integration Service**\n\n`;
    if (advanced_options.includeBadges) {
      md += `[![Security: Compliant](https://img.shields.io/badge/security-compliant-emerald.svg)](#) `;
      md += `[![License: Proprietary](https://img.shields.io/badge/license-proprietary-red.svg)](#)\n\n`;
    }
    if (description) md += `${description}\n\n`;
  }

  // 2. TECH STACK SECTION
  if (tech_stack.length > 0) {
    md += `## 🛠️ Technology Stack\n\n`;
    if (template_style === 'enterprise' || template_style === 'professional') {
      // Table layout
      md += `| Technology | Purpose | Category |\n`;
      md += `| :--- | :--- | :--- |\n`;
      tech_stack.forEach(tech => {
        md += `| **${tech}** | Core component layer | Framework/Library |\n`;
      });
      md += `\n`;
    } else {
      // List layout
      md += `This project utilizes the following technologies:\n\n`;
      tech_stack.forEach(tech => {
        md += `* **${tech}**\n`;
      });
      md += `\n`;
    }
  }

  // 3. FEATURES SECTION
  if (features.length > 0) {
    md += `## ✨ Key Features\n\n`;
    if (template_style === 'startup') {
      // Grid table layout for startups
      md += `| Feature | Description |\n`;
      md += `| :--- | :--- |\n`;
      features.forEach(feat => {
        md += `| 🚀 **${feat}** | Implemented as a high-performance system capability. |\n`;
      });
      md += `\n`;
    } else {
      features.forEach(feat => {
        md += `- **${feat}**: Ready-to-use module component.\n`;
      });
      md += `\n`;
    }
  }

  // 4. INSTALLATION GUIDE
  if (advanced_options.includeInstallation && installation) {
    md += `## 📦 Installation\n\n`;
    md += `Follow these steps to configure your local runtime:\n\n`;
    md += `\`\`\`bash\n${installation}\n\`\`\`\n\n`;
  }

  // 5. USAGE SECTION
  if (usage) {
    md += `## 🚀 Usage Guide\n\n`;
    md += `Here is a basic code example to help you initialize the project:\n\n`;
    const lang = tech_stack.includes('Python') ? 'python' : 'javascript';
    md += `\`\`\`${lang}\n${usage}\n\`\`\`\n\n`;
  }

  // 6. ADVANCED OPTIONAL SECTIONS
  if (advanced_options.includeApiDocs) {
    md += `## 🔌 API Reference\n\n`;
    md += `### Endpoints Specification\n\n`;
    md += `| Method | Route | Description | Auth |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    md += `| \`GET\` | \`/api/health\` | Verifies server runtime health | None |\n`;
    md += `| \`POST\` | \`/api/v1/auth/login\` | Authenticates user & returns JWT | None |\n`;
    md += `| \`GET\` | \`/api/v1/projects\` | Fetches user repository folders | JWT |\n`;
    md += `\n`;
  }

  if (advanced_options.includeArchitecture) {
    md += `## 🏗️ System Architecture\n\n`;
    md += `Below is a structured flow diagram representing the modular layer stacks:\n\n`;
    md += `\`\`\`mermaid\ngraph TD\n    Client[Frontend UI Layer] -->|API Requests| ExpressServer[Express API Router]\n    ExpressServer -->|Database Queries| Database[(Supabase PostgreSQL)]\n\`\`\`\n\n`;
  }

  if (advanced_options.includeContribution) {
    md += `## 🤝 Contributing Guidelines\n\n`;
    md += `We welcome contributions from open-source developers! To submit a contribution:\n\n`;
    md += `1. Fork this repository.\n`;
    md += `2. Create a feature branch (\`git checkout -b feature/AmazingFeature\`).\n`;
    md += `3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`).\n`;
    md += `4. Push the branch (\`git push origin feature/AmazingFeature\`).\n`;
    md += `5. Submit a new Pull Request.\n\n`;
  }

  if (advanced_options.includeLicense) {
    md += `## 📄 License\n\n`;
    if (template_style === 'enterprise') {
      md += `Proprietary License. All rights reserved. Reproduction or redistribution of codebase components is restricted.\n`;
    } else {
      md += `This project is licensed under the terms of the **MIT License**. Check out the [LICENSE](LICENSE) file for more information.\n`;
    }
  }

  return md;
};
