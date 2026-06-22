import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ReadmeProject } from '../types/database';

export const useProjects = () => {
  const [projects, setProjects] = useState<ReadmeProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('readmes')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;
      setProjects(data as ReadmeProject[] || []);
    } catch (err: any) {
      console.error('Error fetching readmes:', err);
      setError(err.message || 'Failed to fetch projects.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProjectInDb = async (projectData: Omit<ReadmeProject, 'id' | 'created_at'>) => {
    setError(null);
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
  };

  const updateProjectInDb = async (
    id: string,
    updates: Partial<Omit<ReadmeProject, 'id' | 'created_at'>>
  ) => {
    setError(null);
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
      console.error('Error updating readme:', err);
      return { error: err.message || 'Failed to update project.', data: null };
    }
  };

  const deleteProject = async (id: string) => {
    setError(null);
    try {
      const { error: dbError } = await supabase
        .from('readmes')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;
      setProjects((prev) => prev.filter((p) => p.id !== id));
      return { error: null };
    } catch (err: any) {
      console.error('Error deleting readme:', err);
      return { error: err.message || 'Failed to delete project.' };
    }
  };

  const duplicateProject = async (id: string) => {
    const target = projects.find((p) => p.id === id);
    if (!target) return { error: 'Project not found', data: null };

    return createProjectInDb({
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
    createProject: createProjectInDb,
    updateProject: updateProjectInDb,
    deleteProject,
    duplicateProject,
  };
};
