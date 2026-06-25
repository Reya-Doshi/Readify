import React, { useState } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { useProjects } from '../hooks/useProjects';
import { useRouter } from '../lib/router';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { GlassCard } from '../components/ui/GlassCard';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { GithubImportModal } from '../components/dashboard/GithubImportModal';
import { 
  FileText, 
  Layers, 
  ExternalLink, 
  Trash2, 
  Copy, 
  Plus,
  Compass,
  Database
} from 'lucide-react';

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);


export const DashboardPage: React.FC = () => {
  const { 
    projects, 
    isLoading, 
    deleteProject, 
    duplicateProject,
    createProject,
    error
  } = useProjects();
  const { navigateTo } = useRouter();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Compute metrics
  const totalProjects = projects.length;
  
  // Get all unique tech tags used across projects
  const uniqueTech = Array.from(
    new Set(projects.flatMap(p => p.tech_stack || []))
  );

  const totalTech = uniqueTech.length;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };

  const handleImportRepo = async (repo: any) => {
    const { error: saveError, data: newProj } = await createProject({
      project_name: repo.name,
      description: repo.description || `GitHub repository for ${repo.name}.`,
      tech_stack: repo.language ? [repo.language] : [],
      features: [],
      generated_readme: '',
      github_url: repo.html_url
    });

    if (saveError) {
      throw new Error(saveError);
    }

    if (newProj) {
      navigateTo('workspace', newProj.id);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Panel Content */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8 overflow-y-auto">
        
        {/* Dashboard Title & Actions Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
          <div className="text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-high tracking-tight">
              Developer Workspace
            </h1>
            <p className="text-xs text-neutral-low/55 mt-1">
              Manage your repository documentation and compile markdown README structures.
            </p>
          </div>
          
          <div className="flex items-center gap-3 self-start sm:self-center">
            <Button
              variant="outline"
              size="md"
              leftIcon={<GithubIcon className="h-4 w-4" />}
              onClick={() => setIsImportModalOpen(true)}
            >
              Import Repo
            </Button>
            <Button
              variant="primary"
              size="md"
              className="text-black"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => navigateTo('workspace')}
            >
              Create README
            </Button>
          </div>
        </div>

        {/* Database Error Banner */}
        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold flex items-center gap-2">
            <Compass className="h-4.5 w-4.5 shrink-0" />
            <span>Database Error: {error}. Please verify VITE_SUPABASE_URL and credentials in your .env configuration.</span>
          </div>
        )}

        {/* Statistics Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Stat 1: Total Generated */}
          <GlassCard className="p-5 border-white/[0.04] hover:border-white/[0.08] flex items-center justify-between">
            <div className="text-left space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-low/50 tracking-wider">
                Total READMEs
              </span>
              <p className="text-3xl font-extrabold text-neutral-high">{totalProjects}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-accent/5 border border-accent/15 flex items-center justify-center text-accent">
              <FileText className="h-5 w-5" />
            </div>
          </GlassCard>

          {/* Stat 2: Technologies */}
          <GlassCard className="p-5 border-white/[0.04] hover:border-white/[0.08] flex items-center justify-between">
            <div className="text-left space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-low/50 tracking-wider">
                Active Technologies
              </span>
              <p className="text-3xl font-extrabold text-neutral-high">{totalTech}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-indigo-500/5 border border-indigo-500/15 flex items-center justify-center text-indigo-400">
              <Layers className="h-5 w-5" />
            </div>
          </GlassCard>

          {/* Stat 3: Tech Scope */}
          <GlassCard className="p-5 border-white/[0.04] hover:border-white/[0.08] flex items-center justify-between">
            <div className="text-left space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-low/50 tracking-wider">
                Supabase Sync
              </span>
              <div className="flex items-center gap-1.5 mt-2">
                <span className={`flex h-2 w-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                <span className={`text-xs font-semibold ${isSupabaseConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isSupabaseConfigured ? 'PostgreSQL Connected' : 'Sandbox Mode (Local)'}
                </span>
              </div>
            </div>
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isSupabaseConfigured ? 'bg-emerald-500/5 border border-emerald-500/15 text-emerald-500' : 'bg-amber-500/5 border border-amber-500/15 text-amber-500'}`}>
              <Database className="h-5 w-5" />
            </div>
          </GlassCard>
        </div>

        {/* Projects Listing Area */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-neutral-high uppercase tracking-wider text-left">
            Recent Project Collections
          </h2>

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="h-6 w-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-neutral-low/50">Fetching workspace projects...</span>
            </div>
          ) : projects.length === 0 ? (
            /* Premium Empty State */
            <div className="py-16 px-6 border border-dashed border-white/[0.08] rounded-xl flex flex-col items-center text-center gap-6 max-w-xl mx-auto bg-white/[0.01]">
              <div className="h-12 w-12 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-neutral-low">
                <Compass className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-neutral-high">No documentation files found</h3>
                <p className="text-xs text-neutral-low/50 leading-relaxed">
                  Start configuring your repository parameters to generate structured markdown README blocks.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => navigateTo('workspace')}
              >
                Create README.md
              </Button>
            </div>
          ) : (
            /* Projects Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project) => (
                <GlassCard
                  key={project.id}
                  className="border-white/[0.06] hover:border-white/[0.12] flex flex-col justify-between gap-6 transition-all duration-300 relative group"
                >
                  {/* Top Header info */}
                  <div className="flex flex-col gap-2 text-left">
                    <h3 className="text-base font-bold text-neutral-high group-hover:text-accent transition-colors duration-200">
                      {project.project_name}
                    </h3>
                    <p className="text-xs text-neutral-low/70 line-clamp-2 mt-1 leading-relaxed">
                      {project.description || 'No project description added.'}
                    </p>
                  </div>

                  {/* Tech stack badge tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {project.tech_stack && project.tech_stack.slice(0, 4).map((tech) => (
                      <Badge key={tech} variant="outline" className="text-[10px]">
                        {tech}
                      </Badge>
                    ))}
                    {project.tech_stack && project.tech_stack.length > 4 && (
                      <span className="text-[9px] text-neutral-low/40 self-center font-medium pl-1">
                        +{project.tech_stack.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Card Bottom Panel / Actions */}
                  <div className="flex items-center justify-between border-t border-white/[0.04] pt-4 mt-auto">
                    <span className="text-[10px] text-neutral-low/40">
                      Created {formatDate(project.created_at)}
                    </span>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-2"
                        title="Duplicate Project"
                        onClick={() => duplicateProject(project.id)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-2 text-neutral-low hover:text-red-400"
                        title="Delete Project"
                        onClick={() => deleteProject(project.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        rightIcon={<ExternalLink className="h-3.5 w-3.5" />}
                        onClick={() => navigateTo('workspace', project.id)}
                      >
                        Open Workspace
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>

      </main>

      <GithubImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onSelect={handleImportRepo} 
      />
    </div>
  );
};
