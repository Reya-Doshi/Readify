import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from './useAuth';
import type { Project } from '../types/database';

export const useProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('updated_at', { ascending: false });

        if (error) throw error;
        setProjects(data as Project[] || []);
      } catch (err) {
        console.error('Error fetching Supabase projects:', err);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Sandbox implementation
      const savedProjects = localStorage.getItem(`readify_sandbox_projects_${user.id}`);
      if (savedProjects) {
        setProjects(JSON.parse(savedProjects));
      } else {
        // Seed default sandbox project
        const defaultProj: Project = {
          id: 'sandbox-proj-1',
          user_id: user.id,
          project_name: 'Express Microservice API',
          description: 'A scalable boilerplate for building Node.js microservices with JSON Web Tokens.',
          tech_stack: ['Node.js', 'Express', 'JWT', 'MongoDB'],
          features: ['Secure route guard middleware', 'Robust input sanitization', 'Graceful server shutdown'],
          template_style: 'professional',
          is_favorite: true,
          installation: 'npm install\ncp .env.example .env\nnpm run dev',
          usage: 'const express = require(\"express\");\nconst app = express();\napp.listen(5000);',
          advanced_options: {
            includeBadges: true,
            includeInstallation: true,
            includeApiDocs: true,
            includeArchitecture: false,
            includeContribution: false,
            includeLicense: true,
          },
          readme_content: `# Express Microservice API\n\n[![build: passing](https://img.shields.io/badge/build-passing-brightgreen)](#) [![license: MIT](https://img.shields.io/badge/license-MIT-blue)](#)\n\nA scalable boilerplate for building Node.js microservices with JSON Web Tokens.\n\n## Tech Stack\n* Node.js\n* Express\n* JWT\n* MongoDB\n\n## Features\n* Secure route guard middleware\n* Robust input sanitization\n* Graceful server shutdown\n\n## Installation\n\`\`\`bash\nnpm install\ncp .env.example .env\nnpm run dev\n\`\`\`\n\n## Usage\n\`\`\`javascript\nconst express = require(\"express\");\nconst app = express();\napp.listen(5000);\n\`\`\``,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        localStorage.setItem(`readify_sandbox_projects_${user.id}`, JSON.stringify([defaultProj]));
        setProjects([defaultProj]);
      }
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const saveProjectsLocal = (updatedList: Project[]) => {
    if (user) {
      localStorage.setItem(`readify_sandbox_projects_${user.id}`, JSON.stringify(updatedList));
    }
    setProjects(updatedList);
  };

  const createProject = async (projectData: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: 'Not authenticated', data: null };

    const newId = Math.random().toString(36).substring(2, 11);
    const now = new Date().toISOString();
    const newProject: Project = {
      ...projectData,
      id: isSupabaseConfigured ? undefined as any : newId,
      user_id: user.id,
      created_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .insert(newProject)
          .select()
          .single();

        if (error) throw error;
        setProjects((prev) => [data as Project, ...prev]);
        return { error: null, data: data as Project };
      } catch (err: any) {
        console.error('Error creating Supabase project:', err);
        return { error: err.message, data: null };
      }
    } else {
      // Sandbox
      newProject.id = 'sandbox-proj-' + newId;
      const newList = [newProject, ...projects];
      saveProjectsLocal(newList);
      return { error: null, data: newProject };
    }
  };

  const updateProject = async (id: string, updates: Partial<Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return { error: 'Not authenticated', data: null };

    const now = new Date().toISOString();
    const updatedFields = {
      ...updates,
      updated_at: now,
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .update(updatedFields)
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        setProjects((prev) => prev.map((p) => (p.id === id ? (data as Project) : p)));
        return { error: null, data: data as Project };
      } catch (err: any) {
        console.error('Error updating Supabase project:', err);
        return { error: err.message, data: null };
      }
    } else {
      // Sandbox
      const newList = projects.map((p) => {
        if (p.id === id) {
          return { ...p, ...updatedFields };
        }
        return p;
      });
      saveProjectsLocal(newList);
      const updatedItem = newList.find((p) => p.id === id) || null;
      return { error: null, data: updatedItem };
    }
  };

  const deleteProject = async (id: string) => {
    if (!user) return { error: 'Not authenticated' };

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
        setProjects((prev) => prev.filter((p) => p.id !== id));
        return { error: null };
      } catch (err: any) {
        console.error('Error deleting Supabase project:', err);
        return { error: err.message };
      }
    } else {
      // Sandbox
      const newList = projects.filter((p) => p.id !== id);
      saveProjectsLocal(newList);
      return { error: null };
    }
  };

  const duplicateProject = async (id: string) => {
    const target = projects.find((p) => p.id === id);
    if (!target) return { error: 'Project not found' };

    const duplicatedData = {
      project_name: `${target.project_name} (Copy)`,
      description: target.description,
      tech_stack: [...target.tech_stack],
      features: [...target.features],
      readme_content: target.readme_content,
      template_style: target.template_style,
      is_favorite: false,
      installation: target.installation || '',
      usage: target.usage || '',
      advanced_options: target.advanced_options ? { ...target.advanced_options } : undefined,
    };

    return createProject(duplicatedData);
  };

  const toggleFavoriteProject = async (id: string) => {
    const target = projects.find((p) => p.id === id);
    if (!target) return { error: 'Project not found' };
    return updateProject(id, { is_favorite: !target.is_favorite });
  };

  return {
    projects,
    isLoading,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    duplicateProject,
    toggleFavoriteProject,
  };
};
