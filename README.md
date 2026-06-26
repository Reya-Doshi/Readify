# <p align="center"><img src="./public/logo.png" alt="Readify Logo" width="150" /><br>Readify</p>

An AI-powered repository documentation engine that turns raw codebase evidence—dependencies, files, languages, and structure—into developer-ready README files. Readify analyzes your live codebase structure and configuration files to build a rich repository profile, mapping dependencies to exact tech stack versions, and then lets you compile premium-grade documentation in real-time.

---

## 📌 Problem

Developers, open-source maintainers, and students spend countless hours writing documentation from scratch or copy-pasting outdated templates. 

Existing documentation tools often:
* **Generates generic advice:** Writes filler descriptions that lack true technical details.
* **Fails to detect stack details:** Requires manual listing of versions, config files, and languages.
* **Lacks consistency:** Fails to provide proper visual layouts (e.g., skill icons, folder structures, or Mermaid charts).
* **Demands too much input:** Requires users to write paragraphs of boilerplate configuration before generating anything useful.

Readify was built to bridge this gap.

---

## ✨ What Readify Does

### Automated Repository Scanning
By pointing Readify to any public GitHub repository, it recursively scans the file tree, parses config files (`package.json`, `requirements.txt`, etc.), and detects exact framework versions, libraries, package managers, and databases.

### Context‑Aware Template Selection
Readify maps your project type (such as static landing page, fullstack Next.js web application, Node.js microservice, Python package, or Docker composition) to custom-fit template models that ensure the final documentation structures match standard industry patterns.

### Live Markdown Preview & Editing
Provides a split-screen experience where developers can adjust project properties, toggle features, specify special instructions, and edit generated content in a side-by-side rich markdown renderer.

### Seamless Project Management
Features deep integration with Supabase, allowing users to save their project metadata history, keep track of generated documentation revisions, and download or copy ready-to-use markdown assets instantly.

---

## 🧠 Core Idea

You direct; the AI analyzes, detects, and presents options. 

Readify shifts the documentation process from *writing boilerplate* to *refining evidence*. The application collects direct evidence from the repository, maps out dependencies, and creates a clear schema of your project's technology choices. The generator translates these structures into functional README blocks, including correct install scripts, dependency charts, and project file trees.

---

## 🏗️ How it Works

### Step 1 — Inputs
The user provides a GitHub repository URL or selects a predefined template preset (e.g., *Minimal API Service*, *Open-Source Package*, or *SaaS Startup Dashboard*). The frontend calls the GitHub API (with optional authentication to prevent rate-limiting) to fetch repository metadata, directory structures, and primary language details.

### Step 2 — AI + Scoring Pipeline
Readify's backend maps the repository profile and configuration flags to a structured context prompt. The system uses a Gemini-powered API pipeline (specifically `gemini-2.5-flash`) to generate structured markdown blocks. The generation follows strict specifications for technology badges, dependency mappings, installation procedures, and visual Mermaid architecture flowcharts.

### Step 3 — Live Output & Refining
The generated README is loaded directly into the workspace's interactive playground. The user can view the markdown dynamically compiled into HTML, update the project features, adjust metadata values in the config form, and regenerate sections to fit special guidelines.

---

## 📊 Repository Profiling Philosophy

Instead of asking you what database or backend framework you use, Readify derives the truth from the codebase's signature:
1. **Config Signatures:** Detecting `package.json` tags, `pom.xml` namespaces, or `requirements.txt` dependencies.
2. **Structural Fingerprints:** Scanning for directory conventions like `/src/components`, `/server`, `/tests`, or `docker-compose.yml`.
3. **Language Distributions:** Calculating language bytes to identify primary, secondary, and supplementary tech stack elements.

This profile ensures the generated installer commands (e.g., `npm run dev` vs. `python manage.py runserver`) match the actual project setup.

---

## 🧩 Key Features

* **Instant GitHub Scanner:** Real-time GitHub recursive tree parsing and metadata extraction.
* **Premium Preset Engine:** Templates designed for APIs, library packages, and full-stack web applications.
* **Interactive Split Editor:** Real-time side-by-side raw markdown editor and rendered preview.
* **Mermaid Integration:** Visual layout and architecture diagrams generated on the fly.
* **Supabase Integration:** Row-Level Security (RLS) protected cloud sync for your generated READMEs.

---

## 🛠️ Tech Stack

### Frontend
* **React 19 / TypeScript:** Type-safe components and interface rendering.
* **Vite 8:** Lightning-fast HMR build tool.
* **Tailwind CSS 3:** Clean, utility-first layout styling.
* **Framer Motion 12:** Smooth, premium UI micro-animations and page transitions.
* **React Markdown 10:** Lightweight AST markdown-to-HTML parser.

### Backend
* **Node.js / Express:** REST endpoints for parsing inputs and communicating with upstream services.
* **CORS / Dotenv:** Cross-Origin Request Sharing and environment configuration middleware.

### Database
* **Supabase / PostgreSQL:** Client-side database sync and project version control.

### AI / APIs
* **Google Gemini API (`@google/generative-ai`):** Contextual generation and document layout structuring.
* **GitHub REST API:** Codebase scanning and directory parsing.

### File / Upload Handling
* **Client-Side File Downloader:** Direct generation and injection of standard `.md` file download streams.

### Deployment
* **GitHub Pages / Releases:** Exclusive static deployment pathways and source hosting.

---

## 📂 Project Structure

```
Readify/
├── public/                 # Static assets
├── server/                 # Express backend server
│   ├── ai.js               # Gemini API prompt pipeline
│   ├── index.js            # Express server and endpoints
│   └── package.json        # Backend configuration
├── src/                    # Frontend source folder
│   ├── components/         # Workspace and dashboard components
│   │   ├── dashboard/      # Project management & listing
│   │   ├── workspace/      # Config forms, previews, and analysis views
│   │   └── ui/             # Core UI components (buttons, modals, tooltips)
│   ├── hooks/              # Custom React hooks (auth, database)
│   ├── lib/                # Shared utilities & routers
│   ├── pages/              # Main view entrypoints (Dashboard, Workspace)
│   ├── services/           # Repository analyzer & compiler services
│   ├── types/              # TS interface definitions
│   ├── App.tsx             # Root React component
│   └── main.tsx            # Application entrypoint
├── package.json            # Frontend workspace configurations
└── tailwind.config.js      # Tailwind layout specifications
```

---

## ⚙️ Local Setup

### 1) Clone the repo
```bash
git clone https://github.com/Reya-Doshi/Readify.git
cd Readify
```

### 2) Backend setup
Create a `.env` file in the `server` directory:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
```
Install dependencies and run:
```bash
cd server
npm install
npm start
```

### 3) Frontend setup
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
Install dependencies and run:
```bash
# Return to project root directory
cd ..
npm install
npm run dev
```

---

## 🌍 Deployment

Readify is configured to run locally or be hosted directly as a static client on **GitHub Pages** with the backend hosted on an Express-compatible platform (like Render or Vercel). The database sync works out-of-the-box thanks to Supabase's global CDN endpoints.

---

## 🔐 Environment Variables

### Backend
* `PORT`: Port number the backend server runs on (Default: `5000`).
* `GEMINI_API_KEY`: API key for accessing Google Gemini generative models.

### Frontend
* `VITE_SUPABASE_URL`: Supabase project host endpoint URL.
* `VITE_SUPABASE_ANON_KEY`: Public client key for authenticating and fetching database records.

---

## 🧪 Example User Flow

1. **Connect Repository:** Paste your GitHub repository URL into the project creator.
2. **Analysis Proceed:** Review Readify's structural analysis (stars, size, frontend frameworks, database, languages).
3. **Configure & Guide:** Select key features to highlight, adjust the target description, and add custom instructions (e.g., "Add a troubleshooting section").
4. **Compile & Live Edit:** Click "Generate README." Review the output inside the split markdown workspace, make minor manual edits, and copy or download the code.

---

## 🎯 Why Readify is Different

Unlike general-purpose chatbots, Readify:
* **Analyzes Before Writing:** Starts from repository code evidence rather than assumptions.
* **Avoids Hallucinated Steps:** Detects actual project configuration files to formulate correct setup steps.
* **Understands Standard Document Layouts:** Automatically styles and groups information (e.g., H2/H3 layouts, tech-badges, and code snippets) using proper conventions.

---

## ⚠️ Current Limitations / Future Work

* **Rate Limiting:** Public API calls are limited if no GitHub token is provided.
* **Private Repositories:** Requires GitHub authentication token setup.
* **Local Parsing:** Future updates will support local codebase folder drops (via Web File System APIs).

---

## 📜 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 🙌 Acknowledgements

* **Google Gemini:** For powering the contextual markdown generation.
* **Supabase:** For database structure sync and authentication.
* **Tailwind CSS & Lucide Icons:** For the premium interface assets.
