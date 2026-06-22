import React from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { useProjects } from '../hooks/useProjects';
import { useRouter } from '../lib/router';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { GlassCard } from '../components/ui/GlassCard';
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

export const DashboardPage: React.FC = () => {
  const { 
    projects, 
    isLoading, 
    deleteProject, 
    duplicateProject,
    error
  } = useProjects();
  const { navigateTo } = useRouter();

  // Compute metrics
  const totalProjects = projects.length;
  
  // Get all unique tech tags used across projects
  const uniqueTech = Array.from(
    new Set(projects.flatMap(p => p.tech_stack || []))
  ).slice(0, 5);

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
          
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => navigateTo('workspace')}
            className="self-start sm:self-center"
          >
            Create README
          </Button>
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
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-emerald-400">PostgreSQL Connected</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-center text-emerald-500">
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
    </div>
  );
};
