import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { ReadmeProject } from '../types/database';

// Helper to format Postgres and PostgREST schema mismatch errors
const handleDbError = (err: any, fallbackMessage: string): string => {
  console.error('Supabase query error details:', err);
  const code = err.code;
  if (code === 'PGRST204' || code === '42703') {
    return 'Database Schema Mismatch: The requested column does not exist in the Supabase table. Please verify your table migrations.';
  }
  if (code === 'PGRST205' || code === '42P01') {
    return 'Database Schema Mismatch: The table "readmes" was not found in Supabase. Please verify your database schema.';
  }
  return err.message || fallbackMessage;
};

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
          .select('id, created_at, user_id, repo_name, github_url, markdown_content')
          .order('created_at', { ascending: false });

        if (dbError) throw dbError;

        // Map database columns to client properties (supplying blank state for local-only components)
        const mappedList: ReadmeProject[] = (data || []).map((row: any) => ({
          id: row.id,
          project_name: row.repo_name || 'Unnamed Repository',
          description: '', // Omitted from actual schema
          tech_stack: [], // Omitted from actual schema
          features: [], // Omitted from actual schema
          generated_readme: row.markdown_content || '',
          github_url: row.github_url || null,
          created_at: row.created_at,
        }));

        setProjects(mappedList);
      } catch (err: any) {
        const msg = handleDbError(err, 'Failed to fetch database projects.');
        setError(msg);
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
          setProjects([]);
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
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error: dbError } = await supabase
          .from('readmes')
          .insert({
            repo_name: projectData.project_name,
            github_url: projectData.github_url || null,
            markdown_content: projectData.generated_readme,
            user_id: user?.id || null
          })
          .select('id, created_at, user_id, repo_name, github_url, markdown_content')
          .single();

        if (dbError) throw dbError;

        const mapped: ReadmeProject = {
          id: data.id,
          project_name: data.repo_name || 'Unnamed Repository',
          description: '',
          tech_stack: [],
          features: [],
          generated_readme: data.markdown_content || '',
          github_url: data.github_url || null,
          created_at: data.created_at,
        };

        setProjects((prev) => [mapped, ...prev]);
        return { error: null, data: mapped };
      } catch (err: any) {
        const msg = handleDbError(err, 'Failed to save project.');
        setError(msg);
        return { error: msg, data: null };
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
        const dbUpdates: any = {};
        if (updates.project_name !== undefined) {
          dbUpdates.repo_name = updates.project_name;
        }
        if (updates.generated_readme !== undefined) {
          dbUpdates.markdown_content = updates.generated_readme;
        }
        if (updates.github_url !== undefined) {
          dbUpdates.github_url = updates.github_url;
        }

        const { data, error: dbError } = await supabase
          .from('readmes')
          .update(dbUpdates)
          .eq('id', id)
          .select('id, created_at, user_id, repo_name, github_url, markdown_content')
          .single();

        if (dbError) throw dbError;

        const mapped: ReadmeProject = {
          id: data.id,
          project_name: data.repo_name || 'Unnamed Repository',
          description: '',
          tech_stack: [],
          features: [],
          generated_readme: data.markdown_content || '',
          github_url: data.github_url || null,
          created_at: data.created_at,
        };

        setProjects((prev) => prev.map((p) => (p.id === id ? mapped : p)));
        return { error: null, data: mapped };
      } catch (err: any) {
        const msg = handleDbError(err, 'Failed to update project.');
        setError(msg);
        return { error: msg, data: null };
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
        const msg = handleDbError(err, 'Failed to delete project.');
        setError(msg);
        return { error: msg };
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
      github_url: target.github_url || null,
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
