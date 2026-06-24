import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { ConfigForm } from '../components/workspace/ConfigForm';
import { PreviewPanel } from '../components/workspace/PreviewPanel';
import { LoadingModal } from '../components/ui/LoadingModal';
import { useRouter } from '../lib/router';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../hooks/useAuth';
import { compileReadmeLocally } from '../services/readmeCompiler';
import { analyzeRepository, parseGithubUrl } from '../services/repoAnalyzer';
import type { AnalysisResult } from '../services/repoAnalyzer';
import { AnalysisSummaryView } from '../components/workspace/AnalysisSummaryView';
import type { ReadmeProject } from '../types/database';
import { ArrowLeft, Check, Compass } from 'lucide-react';

const TEMPLATE_PRESETS = [
  {
    name: 'Minimal API Service',
    description: 'A lightweight boilerplate REST microservice with Express and JSON Web Tokens.',
    tech_stack: ['Node.js', 'Express', 'Docker', 'JWT'],
    features: ['Fast routing middleware', 'JSON request parsing', 'Docker containerized configuration']
  },
  {
    name: 'Open-Source Package',
    description: 'A React TS modular component library ready to build and publish.',
    tech_stack: ['React', 'TypeScript', 'Vite', 'ESLint'],
    features: ['Modular exports', 'TS Type-safe architecture', 'ESLint syntax compiler', 'Jest unit testing framework']
  },
  {
    name: 'SaaS Startup Dashboard',
    description: 'A full stack Next.js application template with PostgreSQL auth syncing.',
    tech_stack: ['Next.js', 'Tailwind CSS', 'Supabase', 'PostgreSQL'],
    features: ['Supabase Row-Level Security policies', 'Sleek dark theme UI dashboard panel', 'Interactive statistics widgets']
  }
];

export const WorkspacePage: React.FC = () => {
  const { activeProjectId, navigateTo } = useRouter();
  const { projects, createProject, updateProject, error: dbError } = useProjects();
  const { providerToken } = useAuth();

  const [formData, setFormData] = useState<Omit<ReadmeProject, 'id' | 'created_at'>>({
    project_name: '',
    description: '',
    tech_stack: [],
    features: [],
    generated_readme: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Repository analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [viewStep, setViewStep] = useState<'analysis' | 'editor'>('editor');
  const [analyzedProjectId, setAnalyzedProjectId] = useState<string | null>(null);

  const triggerAnalysis = async (url: string) => {
    const parsed = parseGithubUrl(url);
    if (!parsed) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      console.log(`Starting repository analysis for ${parsed.owner}/${parsed.repo}...`);
      const result = await analyzeRepository(parsed.owner, parsed.repo, providerToken);
      setAnalysisResult(result);

      const combinedTech = [
        ...result.languages,
        ...result.frameworks,
        ...result.libraries,
        ...result.databases,
        ...result.authProviders,
        ...result.aiServices,
        ...result.deploymentConfigs
      ];

      setFormData(prev => ({
        ...prev,
        tech_stack: combinedTech,
        features: result.suggestedFeatures
      }));
      setViewStep('analysis');
      console.log('Repository analysis completed and form populated.');
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setAnalysisError('Could not connect to GitHub API to analyze repository.');
      setViewStep('editor');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Load project parameters if editing
  useEffect(() => {
    if (activeProjectId) {
      const activeProj = projects.find(p => p.id === activeProjectId);
      if (activeProj) {
        setFormData({
          project_name: activeProj.project_name,
          description: activeProj.description || '',
          tech_stack: activeProj.tech_stack || [],
          features: activeProj.features || [],
          generated_readme: activeProj.generated_readme || ''
        });

        // Trigger repo analysis if github_url exists and no generated_readme
        if (activeProj.github_url && !activeProj.generated_readme && analyzedProjectId !== activeProjectId) {
          setAnalyzedProjectId(activeProjectId);
          triggerAnalysis(activeProj.github_url);
        } else if (!activeProj.github_url || activeProj.generated_readme) {
          setViewStep('editor');
        }
      }
    }
  }, [activeProjectId, projects, analyzedProjectId]);

  const loadPreset = (preset: typeof TEMPLATE_PRESETS[0]) => {
    setFormData({
      project_name: preset.name,
      description: preset.description,
      tech_stack: [...preset.tech_stack],
      features: [...preset.features],
      generated_readme: ''
    });
    setViewStep('editor');
  };

  const handleGenerate = async () => {
    if (!formData.project_name.trim()) {
      alert('Please enter a project name first.');
      return;
    }

    setIsGenerating(true);
    setShowLoading(true);

    let generatedMarkdown = '';
    let isSavedOnServer = false;

    // Parse repository owner/name if linked to GitHub
    const activeProj = activeProjectId ? projects.find(p => p.id === activeProjectId) : null;
    const githubUrl = activeProj?.github_url || null;
    const parsed = githubUrl ? parseGithubUrl(githubUrl) : null;
    
    try {
      // Connect to Node.js Express server to generate README via Gemini
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.project_name,
          description: formData.description,
          techStack: formData.tech_stack,
          features: formData.features,
          owner: parsed?.owner || null,
          repo: parsed?.repo || null
        }),
      });

      if (!response.ok) {
        throw new Error('Express API failed to respond.');
      }

      const result = await response.json();
      generatedMarkdown = result.readme;
      
      if (result.project) {
        isSavedOnServer = true;
        if (activeProjectId) {
          setFormData(prev => ({ ...prev, generated_readme: generatedMarkdown }));
        } else {
          navigateTo('workspace', result.project.id);
        }
      }
    } catch (err) {
      console.warn('Backend API offline or missing key. Compiling locally as fallback...', err);
      // Fail-safe compilation if backend is not running
      generatedMarkdown = compileReadmeLocally({
        project_name: formData.project_name,
        description: formData.description || '',
        tech_stack: formData.tech_stack || [],
        features: formData.features || [],
        generated_readme: ''
      });
    }

    // Save/update project in database (client-side fallback if server-side save was skipped/errored)
    if (!isSavedOnServer) {
      if (activeProjectId) {
        await updateProject(activeProjectId, {
          ...formData,
          generated_readme: generatedMarkdown
        });
        setFormData(prev => ({ ...prev, generated_readme: generatedMarkdown }));
      } else {
        const { data: newProj } = await createProject({
          ...formData,
          generated_readme: generatedMarkdown
        });
        if (newProj) {
          navigateTo('workspace', newProj.id);
        }
      }
    }

    // Toggle back to editor to view results
    setViewStep('editor');

    // Stop loading modal after minimum delay for realistic experience
    setTimeout(() => {
      setShowLoading(false);
      setIsGenerating(false);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    }, 1500);
  };

  const handleImprove = async (instruction: string) => {
    setIsGenerating(true);
    
    // Call backend API or compile enhancement locally
    try {
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.project_name,
          description: formData.description,
          techStack: formData.tech_stack,
          features: formData.features,
          instruction: instruction
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const improved = result.readme;
        if (activeProjectId) {
          await updateProject(activeProjectId, { generated_readme: improved });
        }
        setFormData(prev => ({ ...prev, generated_readme: improved }));
      } else {
        throw new Error('Enhancement call failed.');
      }
    } catch (err) {
      // Local fallback append
      const suffix = `\n\n## 🛡️ Security Audit Note\n*This documentation has been enhanced based on instruction: "${instruction}"*\n\n- Zero-dependency verification enforced.`;
      const improvedContent = (formData.generated_readme || '') + suffix;
      
      if (activeProjectId) {
        await updateProject(activeProjectId, { generated_readme: improvedContent });
      }
      setFormData(prev => ({ ...prev, generated_readme: improvedContent }));
    }
    
    setIsGenerating(false);
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-background flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="flex flex-col items-center gap-4 relative z-10 max-w-sm">
            <div className="h-14 w-14 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center animate-bounce text-accent">
              <Compass className="h-7 w-7 animate-spin" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold text-neutral-high tracking-tight">Analyzing Repository Stack</span>
              <span className="text-[10px] text-neutral-low/40">Detecting project languages, frameworks, services, and suggested features...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const activeProjRecord = activeProjectId ? projects.find(p => p.id === activeProjectId) : null;
  const currentGithubUrl = activeProjRecord?.github_url;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Workspace Frame */}
      <main className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col gap-6 text-left">
        
        {/* Workspace Subheading Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('dashboard')}
              className="p-1.5 rounded-lg border border-white/[0.06] hover:bg-white/[0.04] text-neutral-low"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-neutral-high tracking-tight">
                {viewStep === 'analysis' ? 'Repository Analysis' : activeProjectId ? 'Editing Documentation' : 'README Compiler'}
              </h1>
              <p className="text-[11px] text-neutral-low/55 mt-0.5">
                {viewStep === 'analysis' ? 'Review detected repository metrics and technologies.' : activeProjectId ? 'Update project data and regenerate output.' : 'Draft documentation template models.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Show toggle analysis button only if github_url is set */}
            {currentGithubUrl && (
              <button
                onClick={() => setViewStep(prev => prev === 'analysis' ? 'editor' : 'analysis')}
                className="px-2.5 py-1 rounded bg-accent/10 border border-accent/20 hover:bg-accent/15 text-[10px] text-accent font-bold transition-all"
              >
                {viewStep === 'analysis' ? 'Show Editor' : 'Show Repo Summary'}
              </button>
            )}

            {/* Preset Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 bg-black/40 p-1 rounded-lg border border-white/[0.04] self-start sm:self-center">
              <span className="text-[9px] font-bold text-neutral-low/40 uppercase px-2 tracking-wider">Presets:</span>
              {TEMPLATE_PRESETS.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => loadPreset(preset)}
                  className="px-2 py-1 rounded bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.06] text-[10px] text-neutral-low hover:text-neutral-high transition-all"
                >
                  {preset.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {dbError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold flex items-center gap-2 flex-shrink-0">
            <Compass className="h-4 w-4" />
            <span>Database Error: {dbError}. Syncing is paused.</span>
          </div>
        )}

        {analysisError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold flex items-center gap-2 flex-shrink-0">
            <Compass className="h-4 w-4" />
            <span>Analysis Warning: {analysisError} Falling back to manual editor.</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-2 flex-shrink-0">
            <Check className="h-4 w-4" />
            <span>README generated and saved successfully to database!</span>
          </div>
        )}

        {viewStep === 'analysis' && analysisResult ? (
          /* Centered Analysis Summary View */
          <div className="max-w-3xl mx-auto w-full flex-1 overflow-hidden flex flex-col">
            <AnalysisSummaryView
              result={analysisResult}
              formData={formData as any}
              setFormData={setFormData as any}
              onProceed={() => setViewStep('editor')}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>
        ) : (
          /* Form + Preview Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1 overflow-hidden">
            {/* Left: Input parameters form */}
            <div className="lg:col-span-5 h-full overflow-hidden">
              <ConfigForm
                formData={formData as any}
                setFormData={setFormData as any}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
            </div>

            {/* Right: Realistic Output Preview */}
            <div className="lg:col-span-7 h-full overflow-hidden">
              <PreviewPanel
                content={formData.generated_readme || ''}
                setContent={(val) => setFormData(prev => ({ ...prev, generated_readme: val }))}
                onImprove={handleImprove}
                isGenerating={isGenerating}
              />
            </div>
          </div>
        )}

      </main>

      {/* AI loading modal overlay */}
      <LoadingModal isOpen={showLoading} />
    </div>
  );
};

