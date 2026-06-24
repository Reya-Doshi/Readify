import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { GlassCard } from '../ui/GlassCard';
import { 
  Star, GitFork, Bug, HardDrive, 
  Cpu, Layout, Play, ArrowRight, Plus, Trash2, 
  Database, Terminal 
} from 'lucide-react';
import type { AnalysisResult } from '../../services/repoAnalyzer';
import type { ReadmeProject } from '../../types/database';

interface AnalysisSummaryProps {
  result: AnalysisResult;
  formData: Omit<ReadmeProject, 'id' | 'created_at'>;
  setFormData: React.Dispatch<React.SetStateAction<Omit<ReadmeProject, 'id' | 'created_at'>>>;
  onProceed: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const AnalysisSummaryView: React.FC<AnalysisSummaryProps> = ({
  result,
  formData,
  setFormData,
  onProceed,
  onGenerate,
  isGenerating
}) => {
  const [newFeature, setNewFeature] = useState('');

  // Handle suggested features checkbox toggle
  const toggleFeature = (feature: string) => {
    const currentFeatures = formData.features || [];
    if (currentFeatures.includes(feature)) {
      setFormData(prev => ({
        ...prev,
        features: currentFeatures.filter(f => f !== feature)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        features: [...currentFeatures, feature]
      }));
    }
  };

  const addCustomFeature = () => {
    const clean = newFeature.trim();
    if (clean && formData.features && !formData.features.includes(clean)) {
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), clean]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: (formData.features || []).filter(f => f !== feature)
    }));
  };

  const formatSize = (kb: number) => {
    if (kb > 1024) {
      return `${(kb / 1024).toFixed(1)} MB`;
    }
    return `${kb} KB`;
  };

  return (
    <div className="w-full flex flex-col gap-6 text-left overflow-y-auto pr-2 pb-6 max-h-[85vh]">
      
      {/* Introduction & Quick Setup Details */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-extrabold text-neutral-high tracking-tight flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-accent animate-ping shrink-0" />
          Repository Analysis Summary
        </h2>
        <p className="text-xs text-neutral-low/55 leading-relaxed">
          We analyzed your repository configuration and inferred the following technical profile. Review and customize this metadata before generation.
        </p>
      </div>

      {/* Grid: Stats & Repository Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <GlassCard className="p-3.5 border-white/[0.04] bg-white/[0.01] flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-neutral-low/40 tracking-wider flex items-center gap-1.5">
            <Star className="h-3 w-3 text-yellow-500/80" /> Stars
          </span>
          <span className="text-lg font-black text-neutral-high mt-1">{result.stats.stars}</span>
        </GlassCard>

        <GlassCard className="p-3.5 border-white/[0.04] bg-white/[0.01] flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-neutral-low/40 tracking-wider flex items-center gap-1.5">
            <GitFork className="h-3 w-3 text-blue-400/80" /> Forks
          </span>
          <span className="text-lg font-black text-neutral-high mt-1">{result.stats.forks}</span>
        </GlassCard>

        <GlassCard className="p-3.5 border-white/[0.04] bg-white/[0.01] flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-neutral-low/40 tracking-wider flex items-center gap-1.5">
            <Bug className="h-3 w-3 text-red-400/80" /> Open Issues
          </span>
          <span className="text-lg font-black text-neutral-high mt-1">{result.stats.issues}</span>
        </GlassCard>

        <GlassCard className="p-3.5 border-white/[0.04] bg-white/[0.01] flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-neutral-low/40 tracking-wider flex items-center gap-1.5">
            <HardDrive className="h-3 w-3 text-emerald-400/80" /> Size
          </span>
          <span className="text-lg font-black text-neutral-high mt-1">{formatSize(result.stats.size)}</span>
        </GlassCard>
      </div>

      {/* Row: Main Info Editing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard className="p-5 border-white/[0.05] flex flex-col gap-4">
          <h3 className="text-xs font-bold text-neutral-high uppercase tracking-wider border-b border-white/[0.06] pb-2">
            Editable Project Info
          </h3>
          <Input
            label="Project Name"
            type="text"
            value={formData.project_name}
            onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))}
            required
          />
          <Textarea
            label="Repository Description"
            value={formData.description || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
          />
        </GlassCard>

        {/* Stack Overview */}
        <GlassCard className="p-5 border-white/[0.05] flex flex-col gap-4">
          <h3 className="text-xs font-bold text-neutral-high uppercase tracking-wider border-b border-white/[0.06] pb-2">
            Detected Stack & Services
          </h3>
          
          <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
            {/* Tech stack category items */}
            {result.languages.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-neutral-low/50 uppercase tracking-wider flex items-center gap-1">
                  <Terminal className="h-3 w-3 text-accent" /> Languages
                </span>
                <div className="flex flex-wrap gap-1">
                  {result.languages.map(lang => (
                    <span key={lang} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] text-neutral-high">{lang}</span>
                  ))}
                </div>
              </div>
            )}

            {(result.frameworks.length > 0 || result.libraries.length > 0) && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-neutral-low/50 uppercase tracking-wider flex items-center gap-1">
                  <Layout className="h-3 w-3 text-cyan-400" /> Frameworks & UI Libraries
                </span>
                <div className="flex flex-wrap gap-1">
                  {[...result.frameworks, ...result.libraries].map(item => (
                    <span key={item} className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">{item}</span>
                  ))}
                </div>
              </div>
            )}

            {result.databases.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-neutral-low/50 uppercase tracking-wider flex items-center gap-1">
                  <Database className="h-3 w-3 text-indigo-400" /> Database & Storage
                </span>
                <div className="flex flex-wrap gap-1">
                  {result.databases.map(db => (
                    <span key={db} className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">{db}</span>
                  ))}
                </div>
              </div>
            )}

            {(result.authProviders.length > 0 || result.aiServices.length > 0 || result.deploymentConfigs.length > 0) && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-neutral-low/50 uppercase tracking-wider flex items-center gap-1">
                  <Cpu className="h-3 w-3 text-emerald-400" /> Services & Devops
                </span>
                <div className="flex flex-wrap gap-1">
                  {[...result.authProviders, ...result.aiServices, ...result.deploymentConfigs].map(svc => (
                    <span key={svc} className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">{svc}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Suggested Features Checklist */}
      <GlassCard className="p-5 border-white/[0.05] flex flex-col gap-4">
        <h3 className="text-xs font-bold text-neutral-high uppercase tracking-wider border-b border-white/[0.06] pb-2">
          Suggested Features
        </h3>

        {/* Feature toggles */}
        <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1">
          {result.suggestedFeatures.map((feat) => {
            const isChecked = formData.features?.includes(feat) || false;
            return (
              <label 
                key={feat}
                className="flex items-start gap-3 p-2.5 rounded-lg bg-white/[0.01] border border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer select-none"
              >
                <input 
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleFeature(feat)}
                  className="mt-0.5 rounded border-white/[0.12] bg-black/40 text-accent focus:ring-0"
                />
                <span className="text-xs text-neutral-low leading-normal">{feat}</span>
              </label>
            );
          })}
        </div>

        {/* Manual additions to checklist */}
        <div className="flex gap-2 border-t border-white/[0.06] pt-3.5 mt-1.5">
          <Input
            placeholder="Add custom suggested feature..."
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomFeature(); }}}
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={addCustomFeature}
            className="px-3"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </GlassCard>

      {/* Custom Feature Badges (If any are custom added outside defaults) */}
      {formData.features && formData.features.some(f => !result.suggestedFeatures.includes(f)) && (
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-neutral-low/55 uppercase tracking-wider">Custom Added Features</span>
          <div className="flex flex-wrap gap-1.5">
            {formData.features
              .filter(f => !result.suggestedFeatures.includes(f))
              .map(customF => (
                <span 
                  key={customF}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs bg-white/[0.03] border border-white/[0.08] text-neutral-low"
                >
                  <span className="truncate max-w-[200px]">{customF}</span>
                  <button 
                    type="button"
                    onClick={() => removeFeature(customF)}
                    className="text-neutral-low/40 hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))
            }
          </div>
        </div>
      )}

      {/* Bottom Actions Row */}
      <div className="flex items-center gap-3 border-t border-white/[0.06] pt-5">
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onGenerate}
          isLoading={isGenerating}
          leftIcon={<Play className="h-4.5 w-4.5 fill-current" />}
          className="flex-1 bg-accent hover:bg-accent-dark text-white border-none shadow-lg shadow-accent/15"
        >
          Generate README.md
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onProceed}
          rightIcon={<ArrowRight className="h-4.5 w-4.5" />}
          className="px-6 text-neutral-low border-white/[0.08] hover:bg-white/[0.04]"
        >
          Skip to Editor
        </Button>
      </div>

    </div>
  );
};
