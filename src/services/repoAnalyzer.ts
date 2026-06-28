export interface RepoProfile {
  name: string;
  owner: string;
  description: string;
  githubUrl: string;
  stats: {
    stars: number;
    forks: number;
    issues: number;
    size: number;
  };
  languages: string[];
  packageManager: string | null;
  projectType: 'static' | 'react-vite' | 'nextjs' | 'nodejs' | 'python' | 'java' | 'rust' | 'php' | 'docker' | 'unknown';
  
  // Structured categories
  frontendFramework: string | null;
  backendFramework: string | null;
  database: string | null;
  orm: string | null;
  authentication: string | null;
  aiServices: string | null;
  deploymentPlatform: string | null;
  testingFramework: string | null;
  
  // Repository structure
  fileTree: string[];
  configFiles: string[];
  
  // Custom generated metadata
  suggestedFeatures: string[];
  installationInstructions: string;
  usageInstructions: string;
}

// Parse owner and repo name from GitHub URL
export const parseGithubUrl = (url: string) => {
  const match = url.match(/github\.com[\/:]([^\/]+)\/([^\/\.#\?]+)/);
  if (match) {
    return { owner: match[1], repo: match[2] };
  }
  return null;
};

// Helper to proxy GitHub requests through our backend cache
const fetchGithub = async (url: string, init?: RequestInit): Promise<Response> => {
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const normalizedApiBase = apiBase.endsWith('/') ? apiBase : `${apiBase}/`;
  const proxyUrl = `${normalizedApiBase}github-proxy?url=${encodeURIComponent(url)}`;
  return fetch(proxyUrl, init);
};

// Helper to fetch file content raw from GitHub API
export const fetchFileContentRaw = async (
  owner: string,
  repo: string,
  path: string,
  token: string | null
): Promise<string | null> => {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3.raw',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  try {
    const res = await fetchGithub(url, { headers });
    if (res.ok) {
      return await res.text();
    }
  } catch (err) {
    console.error(`Error fetching file content for ${path}:`, err);
  }
  return null;
};

// Main analyze function
export const analyzeRepository = async (
  owner: string,
  repo: string,
  token: string | null
): Promise<RepoProfile> => {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Baseline variables
  let repoName = repo;
  let description = '';
  let githubUrl = `https://github.com/${owner}/${repo}`;
  let stars = 0;
  let forks = 0;
  let issues = 0;
  let size = 0;
  let defaultBranch = 'main';
  let languagesList: string[] = [];
  
  // Category detections
  let frontendFramework: string | null = null;
  let backendFramework: string | null = null;
  let database: string | null = null;
  let orm: string | null = null;
  let authentication: string | null = null;
  let aiServices: string | null = null;
  let deploymentPlatform: string | null = null;
  let testingFramework: string | null = null;
  let packageManager: string | null = null;
  let projectType: RepoProfile['projectType'] = 'unknown';

  // 1. Fetch Repository Metadata
  try {
    const repoResponse = await fetchGithub(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (repoResponse.ok) {
      const repoData = await repoResponse.json();
      repoName = repoData.name || repo;
      description = repoData.description || '';
      stars = repoData.stargazers_count || 0;
      forks = repoData.forks_count || 0;
      issues = repoData.open_issues_count || 0;
      size = repoData.size || 0;
      defaultBranch = repoData.default_branch || 'main';
      if (repoData.language && !languagesList.includes(repoData.language)) {
        languagesList.push(repoData.language);
      }
    }
  } catch (err) {
    console.error('Error fetching repo metadata:', err);
  }

  // 2. Fetch Languages
  try {
    const langResponse = await fetchGithub(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers });
    if (langResponse.ok) {
      const langData = await langResponse.json();
      Object.keys(langData).forEach(l => {
        if (!languagesList.includes(l)) {
          languagesList.push(l);
        }
      });
    }
  } catch (err) {
    console.error('Error fetching repo languages:', err);
  }

  // 3. Fetch File Tree (Try recursive tree first)
  let fileTreePaths: string[] = [];
  let gitTreeFetched = false;
  try {
    const treeResponse = await fetchGithub(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, { headers });
    if (treeResponse.ok) {
      const treeData = await treeResponse.json();
      if (treeData.tree && Array.isArray(treeData.tree)) {
        fileTreePaths = treeData.tree.map((node: any) => node.path);
        gitTreeFetched = true;
      }
    }
  } catch (err) {
    console.error('Error fetching recursive git tree:', err);
  }

  // Fallback to root contents if Git Trees failed or was truncated
  if (!gitTreeFetched) {
    try {
      const contentsResponse = await fetchGithub(`https://api.github.com/repos/${owner}/${repo}/contents`, { headers });
      if (contentsResponse.ok) {
        const rootContents = await contentsResponse.json();
        fileTreePaths = rootContents.map((node: any) => node.path);
      }
    } catch (err) {
      console.error('Error fetching root contents fallback:', err);
    }
  }

  // Convert file list to lower case set for instant checks
  const fileSet = new Set<string>(fileTreePaths.map(p => p.toLowerCase()));
  const configFiles: string[] = [];

  // Lockfile scans to detect Package Manager
  if (fileSet.has('package-lock.json')) {
    packageManager = 'npm';
    configFiles.push('package-lock.json');
  } else if (fileSet.has('yarn.lock')) {
    packageManager = 'yarn';
    configFiles.push('yarn.lock');
  } else if (fileSet.has('pnpm-lock.yaml')) {
    packageManager = 'pnpm';
    configFiles.push('pnpm-lock.yaml');
  }

  // Scan root config files
  const possibleConfigs = [
    'package.json', 'requirements.txt', 'pyproject.toml', 'cargo.toml', 
    'pom.xml', 'build.gradle', 'composer.json', 'dockerfile', 
    'docker-compose.yml', 'tsconfig.json', 'vite.config.ts', 
    'vite.config.js', 'next.config.js', 'next.config.mjs', 
    'next.config.ts', 'tailwind.config.js', 'tailwind.config.ts', 
    'prisma/schema.prisma', 'readme.md'
  ];
  possibleConfigs.forEach(cfg => {
    // Check if the set contains the config path
    if (fileSet.has(cfg)) {
      configFiles.push(cfg);
    }
  });

  // Check subdirectories or full paths for Prisma and other configs
  fileTreePaths.forEach(p => {
    const lower = p.toLowerCase();
    if (lower.endsWith('schema.prisma') && !configFiles.includes(p)) {
      configFiles.push(p);
      orm = 'Prisma';
    }
    if (lower.endsWith('dockerfile') && !configFiles.includes(p)) {
      configFiles.push(p);
      deploymentPlatform = 'Docker';
    }
    if (lower.includes('docker-compose') && !configFiles.includes(p)) {
      configFiles.push(p);
      deploymentPlatform = 'Docker';
    }
  });

  // Read manifest file contents if present to identify specific packages
  if (fileSet.has('package.json')) {
    const content = await fetchFileContentRaw(owner, repo, 'package.json', token);
    if (content) {
      try {
        const pkg = JSON.parse(content);
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };

        // Frameworks
        if (deps['next']) {
          frontendFramework = 'Next.js';
          projectType = 'nextjs';
        } else if (deps['react']) {
          frontendFramework = 'React';
          if (fileSet.has('vite.config.ts') || fileSet.has('vite.config.js') || fileSet.has('vite.config.mjs')) {
            projectType = 'react-vite';
          } else {
            projectType = 'nodejs';
          }
        } else if (deps['vue']) {
          frontendFramework = 'Vue';
          if (deps['nuxt']) frontendFramework = 'Nuxt.js';
          projectType = 'nodejs';
        } else if (deps['svelte'] || deps['@sveltejs/kit']) {
          frontendFramework = 'Svelte';
          projectType = 'nodejs';
        }

        if (deps['express']) {
          backendFramework = 'Express';
          if (projectType === 'unknown') projectType = 'nodejs';
        } else if (deps['@nestjs/core']) {
          backendFramework = 'NestJS';
          if (projectType === 'unknown') projectType = 'nodejs';
        } else if (deps['koa']) {
          backendFramework = 'Koa';
          if (projectType === 'unknown') projectType = 'nodejs';
        }

        // Databases
        if (deps['pg'] || deps['postgres']) database = 'PostgreSQL';
        else if (deps['mysql'] || deps['mysql2']) database = 'MySQL';
        else if (deps['mongodb'] || deps['mongoose']) database = 'MongoDB';
        else if (deps['redis']) database = 'Redis';
        else if (deps['sqlite3']) database = 'SQLite';

        // ORMs
        if (deps['prisma'] || deps['@prisma/client']) orm = 'Prisma';
        else if (deps['sequelize']) orm = 'Sequelize';
        else if (deps['typeorm']) orm = 'TypeORM';
        else if (deps['mongoose']) orm = 'Mongoose';

        // Authentication
        if (deps['next-auth'] || deps['@auth/core']) authentication = 'NextAuth';
        else if (deps['@supabase/supabase-js']) authentication = 'Supabase Auth';
        else if (deps['firebase'] || deps['firebase-admin']) authentication = 'Firebase Auth';
        else if (deps['jsonwebtoken']) authentication = 'JWT';
        else if (deps['clerk'] || deps['@clerk/nextjs']) authentication = 'Clerk';
        else if (deps['auth0'] || deps['@auth0/nextjs-auth0']) authentication = 'Auth0';
        else if (deps['passport']) authentication = 'Passport.js';

        // AI Services
        if (deps['@google/generative-ai']) aiServices = 'Gemini AI';
        else if (deps['openai']) aiServices = 'OpenAI';
        else if (deps['langchain']) aiServices = 'LangChain';
        else if (deps['@pinecone-database/pinecone']) aiServices = 'Pinecone';

        // Deployment Platform
        if (deps['vercel']) deploymentPlatform = 'Vercel';
        else if (deps['netlify'] || deps['netlify-cli']) deploymentPlatform = 'Netlify';

        // Testing
        if (deps['jest']) testingFramework = 'Jest';
        else if (deps['vitest']) testingFramework = 'Vitest';
        else if (deps['cypress']) testingFramework = 'Cypress';
        else if (deps['playwright'] || deps['@playwright/test']) testingFramework = 'Playwright';
        else if (deps['mocha']) testingFramework = 'Mocha';

        if (projectType === 'unknown') {
          projectType = 'nodejs';
        }
      } catch (err) {
        console.error('Failed to parse package.json dependencies:', err);
      }
    }
  }

  // Python Detections
  if (projectType === 'unknown' && (fileSet.has('requirements.txt') || fileSet.has('pyproject.toml'))) {
    projectType = 'python';
    packageManager = 'pip';
    let requirementsContent = '';
    
    if (fileSet.has('requirements.txt')) {
      const content = await fetchFileContentRaw(owner, repo, 'requirements.txt', token);
      requirementsContent = content || '';
    } else if (fileSet.has('pyproject.toml')) {
      const content = await fetchFileContentRaw(owner, repo, 'pyproject.toml', token);
      requirementsContent = content || '';
      if (requirementsContent.includes('poetry')) {
        packageManager = 'poetry';
      }
    }

    if (requirementsContent) {
      const reqLower = requirementsContent.toLowerCase();
      if (reqLower.includes('django')) backendFramework = 'Django';
      else if (reqLower.includes('flask')) backendFramework = 'Flask';
      else if (reqLower.includes('fastapi')) backendFramework = 'FastAPI';

      if (reqLower.includes('psycopg2') || reqLower.includes('postgresql')) database = 'PostgreSQL';
      else if (reqLower.includes('pymongo')) database = 'MongoDB';
      else if (reqLower.includes('mysqlclient')) database = 'MySQL';
      else if (reqLower.includes('redis')) database = 'Redis';

      if (reqLower.includes('sqlalchemy')) orm = 'SQLAlchemy';
      else if (reqLower.includes('django.db')) orm = 'Django ORM';

      if (reqLower.includes('google-generativeai')) aiServices = 'Gemini AI';
      else if (reqLower.includes('openai')) aiServices = 'OpenAI';
      else if (reqLower.includes('langchain')) aiServices = 'LangChain';

      if (reqLower.includes('pytest')) testingFramework = 'pytest';
      else if (reqLower.includes('unittest')) testingFramework = 'unittest';
    }
  }

  // Rust Detections
  if (projectType === 'unknown' && fileSet.has('cargo.toml')) {
    projectType = 'rust';
    packageManager = 'cargo';
    const content = await fetchFileContentRaw(owner, repo, 'cargo.toml', token);
    if (content) {
      const cargoLower = content.toLowerCase();
      if (cargoLower.includes('actix-web')) backendFramework = 'Actix-web';
      else if (cargoLower.includes('axum')) backendFramework = 'Axum';
      else if (cargoLower.includes('rocket')) backendFramework = 'Rocket';

      if (cargoLower.includes('postgres') || cargoLower.includes('tokio-postgres')) database = 'PostgreSQL';
      else if (cargoLower.includes('mysql')) database = 'MySQL';
      else if (cargoLower.includes('redis')) database = 'Redis';

      if (cargoLower.includes('sqlx')) orm = 'SQLx';
      else if (cargoLower.includes('diesel')) orm = 'Diesel';
    }
  }

  // Java Detections
  if (projectType === 'unknown' && (fileSet.has('pom.xml') || fileSet.has('build.gradle'))) {
    projectType = 'java';
    let content = '';
    if (fileSet.has('pom.xml')) {
      packageManager = 'mvn';
      content = (await fetchFileContentRaw(owner, repo, 'pom.xml', token)) || '';
    } else {
      packageManager = 'gradle';
      content = (await fetchFileContentRaw(owner, repo, 'build.gradle', token)) || '';
    }

    if (content) {
      const javaLower = content.toLowerCase();
      if (javaLower.includes('spring-boot')) backendFramework = 'Spring Boot';
      else if (javaLower.includes('micronaut')) backendFramework = 'Micronaut';
      else if (javaLower.includes('quarkus')) backendFramework = 'Quarkus';

      if (javaLower.includes('postgresql') || javaLower.includes('r2dbc-postgresql')) database = 'PostgreSQL';
      else if (javaLower.includes('mysql-connector')) database = 'MySQL';
      else if (javaLower.includes('h2')) database = 'H2 (In-Memory)';

      if (javaLower.includes('hibernate') || javaLower.includes('spring-data-jpa')) orm = 'Hibernate / JPA';

      if (javaLower.includes('junit')) testingFramework = 'JUnit';
      else if (javaLower.includes('testng')) testingFramework = 'TestNG';
    }
  }

  // PHP Detections
  if (projectType === 'unknown' && fileSet.has('composer.json')) {
    projectType = 'php';
    packageManager = 'composer';
    const content = await fetchFileContentRaw(owner, repo, 'composer.json', token);
    if (content) {
      try {
        const composer = JSON.parse(content);
        const reqs = composer.require || {};
        if (reqs['laravel/framework']) backendFramework = 'Laravel';
        else if (reqs['symfony/symfony']) backendFramework = 'Symfony';
        
        if (reqs['phpunit/phpunit']) testingFramework = 'PHPUnit';
      } catch (err) {
        console.error('Failed to parse composer.json:', err);
      }
    }
  }

  // Static HTML project identification
  if (projectType === 'unknown' && fileSet.has('index.html')) {
    // If it has index.html and none of the other backend/build config files are present
    const hasBackendsOrFrameworks = 
      fileSet.has('package.json') || 
      fileSet.has('requirements.txt') || 
      fileSet.has('pyproject.toml') || 
      fileSet.has('cargo.toml') || 
      fileSet.has('pom.xml') || 
      fileSet.has('build.gradle') || 
      fileSet.has('composer.json') || 
      fileSet.has('go.mod');
      
    if (!hasBackendsOrFrameworks) {
      projectType = 'static';
      packageManager = null;
    }
  }

  // Dockerized project override
  if (fileSet.has('dockerfile') || fileSet.has('docker-compose.yml')) {
    deploymentPlatform = 'Docker';
  }

  // Default package manager fallback if Node.js detected but no lockfiles
  if (projectType === 'nodejs' || projectType === 'react-vite' || projectType === 'nextjs') {
    if (!packageManager) packageManager = 'npm';
  }

  // Ensure default fallback language if empty
  if (languagesList.length === 0) {
    if (projectType === 'nodejs' || projectType === 'react-vite' || projectType === 'nextjs') {
      languagesList = ['JavaScript'];
    } else if (projectType === 'python') {
      languagesList = ['Python'];
    } else if (projectType === 'java') {
      languagesList = ['Java'];
    } else if (projectType === 'rust') {
      languagesList = ['Rust'];
    } else if (projectType === 'php') {
      languagesList = ['PHP'];
    } else if (projectType === 'static') {
      languagesList = ['HTML', 'CSS'];
    } else {
      languagesList = ['JavaScript'];
    }
  }

  // Feature suggestions list
  const suggestedFeatures: string[] = [];
  if (frontendFramework === 'Next.js' || frontendFramework === 'Nuxt.js') {
    suggestedFeatures.push('Static Site Generation (SSG) and Server-Side Rendering (SSR) options');
    suggestedFeatures.push('Route optimization and dynamic layout rendering');
  } else if (frontendFramework === 'React' || frontendFramework === 'Vue' || frontendFramework === 'Svelte') {
    suggestedFeatures.push('Single-page application layout with state-driven rendering');
    suggestedFeatures.push('Modular component hierarchy for reusable visual structures');
  }

  if (backendFramework) {
    suggestedFeatures.push(`REST API controllers built on top of ${backendFramework}`);
  }

  if (database) {
    suggestedFeatures.push(`Persistent data storage layer matching ${database}`);
  }

  if (orm) {
    suggestedFeatures.push(`Structured schema modeling and automated queries using ${orm}`);
  }

  if (authentication) {
    suggestedFeatures.push(`Secure routing, credential checks, and authentication via ${authentication}`);
  }

  if (aiServices) {
    suggestedFeatures.push(`AI-powered prompt execution and content synthesis via ${aiServices}`);
  }

  if (deploymentPlatform === 'Docker') {
    suggestedFeatures.push('Multi-container local setups via Docker Compose configurations');
  }

  if (testingFramework) {
    suggestedFeatures.push(`Automated unit and integration test assertions using ${testingFramework}`);
  }

  if (languagesList.includes('TypeScript')) {
    suggestedFeatures.push('Strict compile-time type validations and type-safe interfaces');
  }

  // Base fallbacks if features list is empty
  if (suggestedFeatures.length === 0) {
    suggestedFeatures.push('Clean directory layout separating code logical concerns');
    suggestedFeatures.push('Environment configuration file templates for localized setup');
  }

  // Generate Installation & Usage instructions
  let installationInstructions = '';
  let usageInstructions = '';

  if (projectType === 'static') {
    installationInstructions = `git clone https://github.com/${owner}/${repo}.git\ncd ${repo}`;
    usageInstructions = 'Open `index.html` directly in any web browser to view the application.';
  } else if (projectType === 'react-vite' || projectType === 'nextjs' || projectType === 'nodejs') {
    const installCmd = packageManager === 'yarn' ? 'yarn install' : packageManager === 'pnpm' ? 'pnpm install' : 'npm install';
    const devCmd = packageManager === 'yarn' ? 'yarn dev' : packageManager === 'pnpm' ? 'pnpm dev' : 'npm run dev';
    const startCmd = packageManager === 'yarn' ? 'yarn start' : packageManager === 'pnpm' ? 'pnpm start' : 'npm start';
    
    installationInstructions = `git clone https://github.com/${owner}/${repo}.git\ncd ${repo}\n${installCmd}`;
    usageInstructions = projectType === 'nodejs' 
      ? `Run the application server:\n\`\`\`bash\n${startCmd}\n\`\`\``
      : `Run the development server:\n\`\`\`bash\n${devCmd}\n\`\`\``;
  } else if (projectType === 'python') {
    if (packageManager === 'poetry') {
      installationInstructions = `git clone https://github.com/${owner}/${repo}.git\ncd ${repo}\npoetry install`;
      usageInstructions = 'Run the primary application script:\n```bash\npoetry run python main.py\n```';
    } else {
      installationInstructions = `git clone https://github.com/${owner}/${repo}.git\ncd ${repo}\n# Setup virtual environment\npython -m venv venv\nsource venv/bin/activate  # On Windows use venv\\Scripts\\activate\npip install -r requirements.txt`;
      usageInstructions = 'Run the application:\n```bash\npython main.py\n```';
    }
  } else if (projectType === 'java') {
    if (packageManager === 'mvn') {
      installationInstructions = `git clone https://github.com/${owner}/${repo}.git\ncd ${repo}\nmvn clean install`;
      usageInstructions = 'Run the project:\n```bash\nmvn spring-boot:run\n```';
    } else {
      installationInstructions = `git clone https://github.com/${owner}/${repo}.git\ncd ${repo}\n./gradlew build`;
      usageInstructions = 'Run the project:\n```bash\n./gradlew bootRun\n```';
    }
  } else if (projectType === 'rust') {
    installationInstructions = `git clone https://github.com/${owner}/${repo}.git\ncd ${repo}\ncargo build --release`;
    usageInstructions = 'Run the project binary:\n```bash\ncargo run\n```';
  } else if (projectType === 'php') {
    installationInstructions = `git clone https://github.com/${owner}/${repo}.git\ncd ${repo}\ncomposer install`;
    usageInstructions = 'Start a local PHP development server:\n```bash\nphp -S localhost:8000\n```';
  } else if (deploymentPlatform === 'Docker') {
    installationInstructions = `git clone https://github.com/${owner}/${repo}.git\ncd ${repo}\ndocker-compose build`;
    usageInstructions = 'Start all services containerized:\n```bash\ndocker-compose up\n```';
  } else {
    installationInstructions = `git clone https://github.com/${owner}/${repo}.git\ncd ${repo}`;
    usageInstructions = 'Setup details depend on your localized environment environment.';
  }

  // Format file tree structure (take first 40 files to avoid context size explosion)
  const slicedTree = fileTreePaths.slice(0, 45);

  return {
    name: repoName,
    owner,
    description,
    githubUrl,
    stats: { stars, forks, issues, size },
    languages: languagesList,
    packageManager,
    projectType,
    frontendFramework,
    backendFramework,
    database,
    orm,
    authentication,
    aiServices,
    deploymentPlatform,
    testingFramework,
    fileTree: slicedTree,
    configFiles,
    suggestedFeatures,
    installationInstructions,
    usageInstructions
  };
};
