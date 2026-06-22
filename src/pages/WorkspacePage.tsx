import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { ConfigForm } from '../components/workspace/ConfigForm';
import { PreviewPanel } from '../components/workspace/PreviewPanel';
import { LoadingModal } from '../components/ui/LoadingModal';
import { useRouter } from '../lib/router';
import { useProjects } from '../hooks/useProjects';
import { compileReadmeLocally } from '../services/readmeCompiler';
import type { Project } from '../types/database';
import { ArrowLeft, Check } from 'lucide-react';

const TEMPLATE_PRESETS = [
  {
    name: 'Minimal API Service',
    description: 'Boilerplate REST microservice with Express',
    tech_stack: ['Node.js', 'Express', 'Docker', 'JWT'],
    features: ['Fast routing middleware', 'JSON request parsing', 'Docker containerized'],
    template_style: 'minimal' as const,
    installation: 'npm install\ncp .env.example .env\nnpm run dev',
    usage: 'const express = require("express");\nconst app = express();\napp.listen(5000);',
    advanced_options: {
      includeBadges: true,
      includeInstallation: true,
      includeApiDocs: true,
      includeArchitecture: false,
      includeContribution: false,
      includeLicense: true
    }
  },
  {
    name: 'Open-Source Package',
    description: 'React TS component library ready to publish',
    tech_stack: ['React', 'TypeScript', 'Vite', 'ESLint'],
    features: ['Modular components export', 'TS Type-safe design', 'Vite compiler', 'Jest unit testing'],
    template_style: 'open-source' as const,
    installation: 'npm install\nnpm run build\nnpm test',
    usage: 'import { Card } from "my-lib";\nexport default () => <Card>Hello</Card>;',
    advanced_options: {
      includeBadges: true,
      includeInstallation: true,
      includeApiDocs: false,
      includeArchitecture: true,
      includeContribution: true,
      includeLicense: true
    }
  },
  {
    name: 'SaaS Startup Dashboard',
    description: 'Full stack Next.js app with authentication',
    tech_stack: ['Next.js', 'Tailwind CSS', 'Supabase', 'PostgreSQL'],
    features: ['Supabase Row-Level Security', 'Sleek dark theme UI dashboard', 'Interactive statistics widgets'],
    template_style: 'startup' as const,
    installation: 'npm install\nnpm run dev',
    usage: 'import { createClient } from "@supabase/supabase-js";\nconst db = createClient(URL, KEY);',
    advanced_options: {
      includeBadges: true,
      includeInstallation: true,
      includeApiDocs: true,
      includeArchitecture: true,
      includeContribution: false,
      includeLicense: true
    }
  }
];

export const WorkspacePage: React.FC = () => {
  const { activeProjectId, navigateTo } = useRouter();
  const { projects, createProject, updateProject } = useProjects();

  const [formData, setFormData] = useState<Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>>({
    project_name: '',
    description: '',
    tech_stack: [],
    features: [],
    template_style: 'minimal',
    is_favorite: false,
    installation: '',
    usage: '',
    advanced_options: {
      includeBadges: true,
      includeInstallation: true,
      includeApiDocs: false,
      includeArchitecture: false,
      includeContribution: false,
      includeLicense: true
    },
    readme_content: ''
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
          template_style: activeProj.template_style || 'minimal',
          is_favorite: activeProj.is_favorite || false,
          installation: activeProj.installation || '',
          usage: activeProj.usage || '',
          advanced_options: activeProj.advanced_options || {
            includeBadges: true,
            includeInstallation: true,
            includeApiDocs: false,
            includeArchitecture: false,
            includeContribution: false,
            includeLicense: true
          },
          readme_content: activeProj.readme_content || ''
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
      template_style: preset.template_style,
      is_favorite: false,
      installation: preset.installation,
      usage: preset.usage,
      advanced_options: { ...preset.advanced_options },
      readme_content: ''
    });
  };

  const handleGenerate = async () => {
    if (!formData.project_name.trim()) {
      alert('Please enter a project name first.');
      return;
    }

    setIsGenerating(true);
    setShowLoading(true);

    // AI loader overlay runs for 6 seconds (message rotation)
    setTimeout(async () => {
      // Compile content locally or request API server
      const compiledMarkdown = compileReadmeLocally(formData);

      // Simulated typing effect or section reveal
      
      setShowLoading(false);

      // Save/update project in database
      if (activeProjectId) {
        await updateProject(activeProjectId, {
          ...formData,
          readme_content: compiledMarkdown
        });
        setFormData(prev => ({ ...prev, readme_content: compiledMarkdown }));
      } else {
        const { data: newProj } = await createProject({
          ...formData,
          readme_content: compiledMarkdown
        });
        if (newProj) {
          navigateTo('workspace', newProj.id);
        }
      }

      setIsGenerating(false);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    }, 6000);
  };

  const handleImprove = async (instruction: string) => {
    setIsGenerating(true);
    
    // Simulate AI improving the README
    setTimeout(() => {
      let suffix = `\n\n## 🛡️ Security Audit Note\n*This documentation has been enhanced based on instruction: "${instruction}"*\n\n- Cryptographic hashes checked weekly.\n- Zero-dependency verification enforced.`;
      const improvedContent = formData.readme_content + suffix;
      
      if (activeProjectId) {
        updateProject(activeProjectId, { readme_content: improvedContent });
      }
      setFormData(prev => ({ ...prev, readme_content: improvedContent }));
      setIsGenerating(false);
    }, 2000);
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
              formData={formData}
              setFormData={setFormData}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>

          {/* Right: Realistic Output Preview */}
          <div className="lg:col-span-7 h-full overflow-hidden">
            <PreviewPanel
              content={formData.readme_content}
              setContent={(val) => setFormData(prev => ({ ...prev, readme_content: val }))}
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
