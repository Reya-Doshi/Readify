export interface AnalysisResult {
  stats: {
    stars: number;
    forks: number;
    issues: number;
    size: number;
  };
  languages: string[];
  frameworks: string[];
  libraries: string[];
  databases: string[];
  authProviders: string[];
  aiServices: string[];
  deploymentConfigs: string[];
  suggestedFeatures: string[];
}

// Parse owner and repo name from GitHub URL
export const parseGithubUrl = (url: string) => {
  const match = url.match(/github\.com[\/:]([^\/]+)\/([^\/\.#\?]+)/);
  if (match) {
    return { owner: match[1], repo: match[2] };
  }
  return null;
};

// Main analyze function
export const analyzeRepository = async (
  owner: string,
  repo: string,
  token: string | null
): Promise<AnalysisResult> => {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Base structures
  let stars = 0;
  let forks = 0;
  let issues = 0;
  let size = 0;
  let languagesList: string[] = [];
  let frameworks: string[] = [];
  let libraries: string[] = [];
  let databases: string[] = [];
  let authProviders: string[] = [];
  let aiServices: string[] = [];
  let deploymentConfigs: string[] = [];

  try {
    // 1. Fetch Repository Metadata
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (repoResponse.ok) {
      const repoData = await repoResponse.json();
      stars = repoData.stargazers_count || 0;
      forks = repoData.forks_count || 0;
      issues = repoData.open_issues_count || 0;
      size = repoData.size || 0;
      if (repoData.language && !languagesList.includes(repoData.language)) {
        languagesList.push(repoData.language);
      }
    }
  } catch (err) {
    console.error('Error fetching repo metadata:', err);
  }

  try {
    // 2. Fetch Languages
    const langResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers });
    if (langResponse.ok) {
      const langData = await langResponse.json();
      const detectedLangs = Object.keys(langData);
      detectedLangs.forEach(l => {
        if (!languagesList.includes(l)) {
          languagesList.push(l);
        }
      });
    }
  } catch (err) {
    console.error('Error fetching repo languages:', err);
  }

  // 3. Fetch Root Contents
  let rootFiles: any[] = [];
  try {
    const contentsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, { headers });
    if (contentsResponse.ok) {
      rootFiles = await contentsResponse.json();
    }
  } catch (err) {
    console.error('Error fetching root contents:', err);
  }

  // Check file presence
  const fileMap = new Map<string, string>();
  rootFiles.forEach(file => {
    if (file.type === 'file') {
      fileMap.set(file.name.toLowerCase(), file.download_url || file.url);
    }
  });

  // Check specific files for stack detection
  if (fileMap.has('dockerfile') || fileMap.has('docker-compose.yml')) {
    deploymentConfigs.push('Docker');
  }
  if (fileMap.has('vercel.json')) {
    deploymentConfigs.push('Vercel');
  }
  if (fileMap.has('netlify.toml')) {
    deploymentConfigs.push('Netlify');
  }
  if (fileMap.has('go.mod')) {
    if (!languagesList.includes('Go')) languagesList.push('Go');
  }
  if (fileMap.has('cargo.toml')) {
    if (!languagesList.includes('Rust')) languagesList.push('Rust');
  }
  if (fileMap.has('requirements.txt') || fileMap.has('pyproject.toml')) {
    if (!languagesList.includes('Python')) languagesList.push('Python');
  }

  // Analyze package.json dependencies
  const packageJsonUrl = fileMap.get('package.json');
  if (packageJsonUrl) {
    try {
      const pkgResponse = await fetch(packageJsonUrl, { headers });
      if (pkgResponse.ok) {
        const pkgData = await pkgResponse.json();
        const deps = { ...pkgData.dependencies, ...pkgData.devDependencies };
        
        // Run package check
        Object.keys(deps).forEach(name => {
          // Frameworks
          if (name === 'react' && !frameworks.includes('React')) frameworks.push('React');
          if (name === 'next' && !frameworks.includes('Next.js')) frameworks.push('Next.js');
          if (name === 'express' && !frameworks.includes('Express')) frameworks.push('Express');
          if (name.includes('nestjs') && !frameworks.includes('NestJS')) frameworks.push('NestJS');
          if (name === 'vue' && !frameworks.includes('Vue')) frameworks.push('Vue');
          if (name === 'nuxt' && !frameworks.includes('Nuxt')) frameworks.push('Nuxt');
          if ((name === 'svelte' || name.includes('svelte-kit')) && !frameworks.includes('Svelte')) frameworks.push('Svelte');
          if (name.includes('astro') && !frameworks.includes('Astro')) frameworks.push('Astro');
          if (name.includes('remix-run') && !frameworks.includes('Remix')) frameworks.push('Remix');

          // Libraries
          if (name === 'tailwindcss' && !libraries.includes('Tailwind CSS')) libraries.push('Tailwind CSS');
          if (name === 'bootstrap' && !libraries.includes('Bootstrap')) libraries.push('Bootstrap');
          if (name === 'framer-motion' && !libraries.includes('Framer Motion')) libraries.push('Framer Motion');
          if (name === 'lucide-react' && !libraries.includes('Lucide React')) libraries.push('Lucide React');
          if ((name === 'redux' || name.includes('redux-toolkit')) && !libraries.includes('Redux')) libraries.push('Redux');
          if (name === 'zustand' && !libraries.includes('Zustand')) libraries.push('Zustand');
          if (name === 'axios' && !libraries.includes('Axios')) libraries.push('Axios');
          if (name === 'lodash' && !libraries.includes('Lodash')) libraries.push('Lodash');

          // Database
          if ((name === 'pg' || name === 'postgres') && !databases.includes('PostgreSQL')) databases.push('PostgreSQL');
          if ((name === 'mysql' || name === 'mysql2') && !databases.includes('MySQL')) databases.push('MySQL');
          if ((name === 'mongodb' || name === 'mongoose') && !databases.includes('MongoDB')) databases.push('MongoDB');
          if (name === 'redis' && !databases.includes('Redis')) databases.push('Redis');
          if (name === 'sqlite3' && !databases.includes('SQLite')) databases.push('SQLite');
          if ((name === '@prisma/client' || name === 'prisma') && !databases.includes('Prisma (ORM)')) databases.push('Prisma (ORM)');
          if (name === 'sequelize' && !databases.includes('Sequelize (ORM)')) databases.push('Sequelize (ORM)');
          if (name === 'typeorm' && !databases.includes('TypeORM')) databases.push('TypeORM');

          // Auth
          if ((name === 'next-auth' || name.includes('@auth/')) && !authProviders.includes('NextAuth')) authProviders.push('NextAuth');
          if (name === '@supabase/supabase-js' && !authProviders.includes('Supabase Auth')) authProviders.push('Supabase Auth');
          if (name.includes('firebase') && !authProviders.includes('Firebase Auth')) authProviders.push('Firebase Auth');
          if (name === 'jsonwebtoken' && !authProviders.includes('JWT')) authProviders.push('JWT');
          if (name.includes('passport') && !authProviders.includes('Passport.js')) authProviders.push('Passport.js');
          if (name.includes('clerk') && !authProviders.includes('Clerk')) authProviders.push('Clerk');
          if (name.includes('auth0') && !authProviders.includes('Auth0')) authProviders.push('Auth0');

          // AI
          if (name === '@google/generative-ai' && !aiServices.includes('Gemini AI')) aiServices.push('Gemini AI');
          if (name === 'openai' && !aiServices.includes('OpenAI')) aiServices.push('OpenAI');
          if (name.includes('langchain') && !aiServices.includes('LangChain')) aiServices.push('LangChain');
          if (name.includes('pinecone') && !aiServices.includes('Pinecone')) aiServices.push('Pinecone');

          // Deployment
          if (name === 'vercel' && !deploymentConfigs.includes('Vercel')) deploymentConfigs.push('Vercel');
          if (name === 'netlify' && !deploymentConfigs.includes('Netlify')) deploymentConfigs.push('Netlify');
          if (name === 'pm2' && !deploymentConfigs.includes('PM2')) deploymentConfigs.push('PM2');
        });
      }
    } catch (err) {
      console.error('Error reading package.json:', err);
    }
  }

  // Suggest features based on stack elements
  const suggestedFeatures: string[] = [];
  if (frameworks.includes('React') || frameworks.includes('Vue') || frameworks.includes('Svelte') || frameworks.includes('Next.js')) {
    suggestedFeatures.push('Responsive, state-driven client user interface');
    suggestedFeatures.push('Component-driven frontend layout architecture');
  }
  if (frameworks.includes('Next.js') || frameworks.includes('Nuxt') || frameworks.includes('Remix')) {
    suggestedFeatures.push('Server-Side Rendering (SSR) and Static Site Generation (SSG)');
    suggestedFeatures.push('Integrated serverless API endpoints and route optimization');
  }
  if (frameworks.includes('Express') || frameworks.includes('NestJS') || frameworks.includes('FastAPI') || languagesList.includes('Go') || languagesList.includes('Rust')) {
    suggestedFeatures.push('RESTful API controllers and server router logic');
  }
  if (databases.length > 0) {
    suggestedFeatures.push('Persistent structured data modeling and indexing');
  }
  if (authProviders.length > 0) {
    suggestedFeatures.push('Secure user registration, password hashing, and session authentication');
  }
  if (aiServices.length > 0) {
    suggestedFeatures.push('Generative AI integration and large language model prompts execution');
  }
  if (deploymentConfigs.includes('Docker')) {
    suggestedFeatures.push('Containerized Docker and local environment setup files');
  }
  if (languagesList.includes('TypeScript')) {
    suggestedFeatures.push('Strict compile-time type-checking and interface validation');
  }

  // Fallback features if empty
  if (suggestedFeatures.length === 0) {
    suggestedFeatures.push('Clean directory structuring and separation of concerns');
    suggestedFeatures.push('Flexible environment configurations for localized builds');
  }

  return {
    stats: { stars, forks, issues, size },
    languages: languagesList,
    frameworks,
    libraries,
    databases,
    authProviders,
    aiServices,
    deploymentConfigs,
    suggestedFeatures,
  };
};
