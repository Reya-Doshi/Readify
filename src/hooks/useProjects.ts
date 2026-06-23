import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { ReadmeProject } from '../types/database';

export const useProjects = () => {
  const [projects, setProjects] = useState<ReadmeProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error: dbError } = await supabase
          .from('readmes')
          .select('*')
          .order('created_at', { ascending: false });

        if (dbError) throw dbError;
        setProjects(data as ReadmeProject[] || []);
      } catch (err: any) {
        console.error('Error fetching Supabase readmes:', err);
        setError(err.message || 'Failed to fetch database projects.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Sandbox (LocalStorage fallback)
      try {
        const savedProjects = localStorage.getItem('readify_sandbox_readmes');
        if (savedProjects) {
          setProjects(JSON.parse(savedProjects));
        } else {
          // Seed initial default project
          const defaultProj: ReadmeProject = {
            id: 'sandbox-readme-1',
            project_name: 'Express Microservice API',
            description: 'A boilerplate REST API with JSON Web Tokens and Express routing.',
            tech_stack: ['Node.js', 'Express', 'JWT', 'MongoDB'],
            features: ['Secure route guards', 'Input validation', 'Graceful shutdown'],
            generated_readme: `# Express Microservice API\n\nA boilerplate REST API with JSON Web Tokens.\n\n## Tech Stack\n* Node.js\n* Express\n* JWT\n* MongoDB\n\n## Features\n* Secure route guards\n* Input validation\n* Graceful shutdown`,
            created_at: new Date().toISOString(),
          };
          localStorage.setItem('readify_sandbox_readmes', JSON.stringify([defaultProj]));
          setProjects([defaultProj]);
        }
      } catch (err) {
        console.error('LocalStorage fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const saveProjectsLocal = (updatedList: ReadmeProject[]) => {
    localStorage.setItem('readify_sandbox_readmes', JSON.stringify(updatedList));
    setProjects(updatedList);
  };

  const createProject = async (projectData: Omit<ReadmeProject, 'id' | 'created_at'>) => {
    setError(null);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error: dbError } = await supabase
          .from('readmes')
          .insert({
            project_name: projectData.project_name,
            description: projectData.description,
            tech_stack: projectData.tech_stack,
            features: projectData.features,
            generated_readme: projectData.generated_readme,
          })
          .select()
          .single();

        if (dbError) throw dbError;
        setProjects((prev) => [data as ReadmeProject, ...prev]);
        return { error: null, data: data as ReadmeProject };
      } catch (err: any) {
        console.error('Error inserting readme:', err);
        return { error: err.message || 'Failed to save project.', data: null };
      }
    } else {
      // Sandbox
      const newId = 'sandbox-uid-' + Math.random().toString(36).substring(2, 9);
      const newProject: ReadmeProject = {
        ...projectData,
        id: newId,
        created_at: new Date().toISOString()
      };
      const newList = [newProject, ...projects];
      saveProjectsLocal(newList);
      return { error: null, data: newProject };
    }
  };

  const updateProject = async (
    id: string,
    updates: Partial<Omit<ReadmeProject, 'id' | 'created_at'>>
  ) => {
    setError(null);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error: dbError } = await supabase
          .from('readmes')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (dbError) throw dbError;
        setProjects((prev) => prev.map((p) => (p.id === id ? (data as ReadmeProject) : p)));
        return { error: null, data: data as ReadmeProject };
      } catch (err: any) {
        console.error('Error updating Supabase readme:', err);
        return { error: err.message || 'Failed to update project.', data: null };
      }
    } else {
      // Sandbox
      const newList = projects.map((p) => {
        if (p.id === id) {
          return { ...p, ...updates };
        }
        return p;
      });
      saveProjectsLocal(newList);
      const updatedItem = newList.find((p) => p.id === id) || null;
      return { error: null, data: updatedItem };
    }
  };

  const deleteProject = async (id: string) => {
    setError(null);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error: dbError } = await supabase
          .from('readmes')
          .delete()
          .eq('id', id);

        if (dbError) throw dbError;
        setProjects((prev) => prev.filter((p) => p.id !== id));
        return { error: null };
      } catch (err: any) {
        console.error('Error deleting Supabase readme:', err);
        return { error: err.message || 'Failed to delete project.' };
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
    if (!target) return { error: 'Project not found', data: null };

    return createProject({
      project_name: `${target.project_name} (Copy)`,
      description: target.description || '',
      tech_stack: target.tech_stack || [],
      features: target.features || [],
      generated_readme: target.generated_readme || '',
    });
  };

  return {
    projects,
    isLoading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    duplicateProject,
  };
};
