import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Dropdown } from '../ui/Dropdown';
import { Switch } from '../ui/Switch';
import { Plus, X, Trash2 } from 'lucide-react';
import type { Project } from '../../types/database';

interface ConfigFormProps {
  formData: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
  setFormData: React.Dispatch<React.SetStateAction<Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>>>;
  onGenerate: () => void;
  isGenerating: boolean;
}

const QUICK_TECH_OPTIONS = [
  'React', 'Next.js', 'Node.js', 'TypeScript', 'Python', 'Go', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS'
];

const STYLE_OPTIONS = [
  { value: 'minimal', label: 'Minimal Style', description: 'Clean bullet points, no badges, straight text.' },
  { value: 'open-source', label: 'Open Source Style', description: 'Extensive badges, details, contribution rules.' },
  { value: 'professional', label: 'Professional Style', description: 'Clean layout, API specs, modular tags.' },
  { value: 'startup', label: 'Startup Style', description: 'Feature grid showcase, rich emojis, structure.' },
  { value: 'enterprise', label: 'Enterprise Style', description: 'Formal outline, compliance notices, licenses.' },
];

export const ConfigForm: React.FC<ConfigFormProps> = ({
  formData,
  setFormData,
  onGenerate,
  isGenerating
}) => {
  const [techInput, setTechInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');

  // Tech Stack Handlers
  const addTechTag = (tag: string) => {
    const cleanTag = tag.trim();
    if (cleanTag && !formData.tech_stack.includes(cleanTag)) {
      setFormData(prev => ({
        ...prev,
        tech_stack: [...prev.tech_stack, cleanTag]
      }));
    }
  };

  const removeTechTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.filter(t => t !== tag)
    }));
  };

  const handleTechKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTechTag(techInput);
      setTechInput('');
    }
  };

  // Feature List Handlers
  const addFeature = () => {
    const cleanFeature = featureInput.trim();
    if (cleanFeature && !formData.features.includes(cleanFeature)) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, cleanFeature]
      }));
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleFeatureKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFeature();
    }
  };

  // Advanced Option toggle
  const toggleAdvancedOption = (key: keyof NonNullable<Project['advanced_options']>) => {
    setFormData(prev => ({
      ...prev,
      advanced_options: {
        ...prev.advanced_options!,
        [key]: !prev.advanced_options![key]
      }
    }));
  };

  return (
    <div className="flex flex-col gap-6 text-left max-h-[82vh] overflow-y-auto pr-2">
      
      {/* 1. Basic Info */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-neutral-high uppercase tracking-wider border-b border-white/[0.06] pb-2">
          Basic Information
        </h3>
        
        <Input
          label="Project Name"
          type="text"
          placeholder="e.g. readify-core"
          value={formData.project_name}
          onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))}
          required
        />

        <Textarea
          label="Short Description"
          placeholder="Briefly summarize what your project does..."
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      {/* 2. Technology Stack */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-neutral-high uppercase tracking-wider border-b border-white/[0.06] pb-2">
          Technology Stack
        </h3>
        
        <div className="flex gap-2">
          <Input
            placeholder="Type technology and press Enter..."
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={handleTechKeyDown}
          />
          <Button
            type="button"
            variant="outline"
            className="px-3"
            onClick={() => { addTechTag(techInput); setTechInput(''); }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Current stack tags */}
        <div className="flex flex-wrap gap-1.5 py-1">
          {formData.tech_stack.length > 0 ? (
            formData.tech_stack.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTechTag(tag)}
                  className="hover:bg-accent/20 p-0.5 rounded-full text-accent"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-xs text-neutral-low/40">No tags added. Use quick adds below.</span>
          )}
        </div>

        {/* Quick Suggestion chips */}
        <div className="flex flex-wrap gap-1 items-center">
          <span className="text-[10px] text-neutral-low/55 uppercase mr-1">Quick Add:</span>
          {QUICK_TECH_OPTIONS.map((tech) => {
            const hasTech = formData.tech_stack.includes(tech);
            return (
              <button
                key={tech}
                type="button"
                onClick={() => (hasTech ? removeTechTag(tech) : addTechTag(tech))}
                className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                  hasTech
                    ? 'bg-accent/15 border-accent/35 text-accent font-medium'
                    : 'bg-white/[0.02] border-white/[0.08] text-neutral-low/60 hover:border-white/[0.15]'
                }`}
              >
                {tech}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Project Features */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-neutral-high uppercase tracking-wider border-b border-white/[0.06] pb-2">
          Project Features
        </h3>

        <div className="flex gap-2">
          <Input
            placeholder="Type a key feature and press Enter..."
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            onKeyDown={handleFeatureKeyDown}
          />
          <Button
            type="button"
            variant="outline"
            className="px-3"
            onClick={addFeature}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* List of features */}
        <ul className="space-y-2 max-h-40 overflow-y-auto py-1">
          {formData.features.length > 0 ? (
            formData.features.map((feature, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs text-neutral-low"
              >
                <span className="truncate pr-4">{feature}</span>
                <button
                  type="button"
                  onClick={() => removeFeature(idx)}
                  className="text-neutral-low/40 hover:text-red-400 p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))
          ) : (
            <span className="text-xs text-neutral-low/40">Add features list to showcase in the README.</span>
          )}
        </ul>
      </div>

      {/* 4. Setup & Usage */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-neutral-high uppercase tracking-wider border-b border-white/[0.06] pb-2">
          Setup Instructions
        </h3>
        
        <Textarea
          label="Installation Commands"
          placeholder="npm install&#10;cp .env.example .env&#10;npm run dev"
          value={formData.installation}
          onChange={(e) => setFormData(prev => ({ ...prev, installation: e.target.value }))}
          rows={3}
        />

        <Textarea
          label="Usage Code Example"
          placeholder="const core = require('readify');&#10;core.init();"
          value={formData.usage}
          onChange={(e) => setFormData(prev => ({ ...prev, usage: e.target.value }))}
          rows={3}
        />
      </div>

      {/* 5. Styles Dropdown */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-neutral-high uppercase tracking-wider border-b border-white/[0.06] pb-2">
          Documentation Style
        </h3>
        
        <Dropdown
          options={STYLE_OPTIONS}
          value={formData.template_style}
          onChange={(val) => setFormData(prev => ({ ...prev, template_style: val as any }))}
        />
      </div>

      {/* 6. Advanced Checkboxes */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-neutral-high uppercase tracking-wider border-b border-white/[0.06] pb-2">
          Advanced Layout Options
        </h3>

        <div className="grid grid-cols-1 gap-1">
          <Switch
            label="Include Badges"
            description="Add status badges (build, license, version) in header"
            checked={!!formData.advanced_options?.includeBadges}
            onChange={() => toggleAdvancedOption('includeBadges')}
          />
          <Switch
            label="Include Installation"
            description="Add code setup segments"
            checked={!!formData.advanced_options?.includeInstallation}
            onChange={() => toggleAdvancedOption('includeInstallation')}
          />
          <Switch
            label="Include API Specs"
            description="Table detailing routing paths"
            checked={!!formData.advanced_options?.includeApiDocs}
            onChange={() => toggleAdvancedOption('includeApiDocs')}
          />
          <Switch
            label="Include Architecture Schema"
            description="Mermaid diagram depicting dependencies"
            checked={!!formData.advanced_options?.includeArchitecture}
            onChange={() => toggleAdvancedOption('includeArchitecture')}
          />
          <Switch
            label="Include Contribution Rules"
            description="Contributing checklist instructions"
            checked={!!formData.advanced_options?.includeContribution}
            onChange={() => toggleAdvancedOption('includeContribution')}
          />
          <Switch
            label="Include License Section"
            description="MIT/Proprietary licensing paragraph"
            checked={!!formData.advanced_options?.includeLicense}
            onChange={() => toggleAdvancedOption('includeLicense')}
          />
        </div>
      </div>

      {/* Large Generate Button */}
      <Button
        type="button"
        variant="primary"
        size="lg"
        onClick={onGenerate}
        isLoading={isGenerating}
        className="w-full mt-4 bg-accent hover:bg-accent-dark text-white border-none shadow-lg shadow-accent/15"
      >
        Generate README
      </Button>

    </div>
  );
};
