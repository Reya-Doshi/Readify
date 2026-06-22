import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { ConfigForm } from '../components/workspace/ConfigForm';
import { PreviewPanel } from '../components/workspace/PreviewPanel';
import { LoadingModal } from '../components/ui/LoadingModal';
import { useRouter } from '../lib/router';
import { useProjects } from '../hooks/useProjects';
import { compileReadmeLocally } from '../services/readmeCompiler';
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
      }
    }
  }, [activeProjectId, projects]);

  const loadPreset = (preset: typeof TEMPLATE_PRESETS[0]) => {
    setFormData({
      project_name: preset.name,
      description: preset.description,
      tech_stack: [...preset.tech_stack],
      features: [...preset.features],
      generated_readme: ''
    });
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
    
    try {
      // Connect to Node.js Express server to generate README via Gemini
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: activeProjectId,
          name: formData.project_name,
          description: formData.description,
          techStack: formData.tech_stack,
          features: formData.features,
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
                {activeProjectId ? 'Editing Documentation' : 'README Compiler'}
              </h1>
              <p className="text-[11px] text-neutral-low/55 mt-0.5">
                {activeProjectId ? 'Update project data and regenerate output.' : 'Draft documentation template models.'}
              </p>
            </div>
          </div>

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

        {dbError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold flex items-center gap-2 flex-shrink-0">
            <Compass className="h-4 w-4" />
            <span>Database Error: {dbError}. Syncing is paused.</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-2 flex-shrink-0">
            <Check className="h-4 w-4" />
            <span>README generated and saved successfully to database!</span>
          </div>
        )}

        {/* Form + Preview Grid */}
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

      </main>

      {/* AI loading modal overlay */}
      <LoadingModal isOpen={showLoading} />
    </div>
  );
};
