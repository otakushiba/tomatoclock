import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Project } from '@/types/project';

export function useProjects() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user!.id);
      if (error) throw error;
      return data as Project[];
    },
    enabled: !!user,
  });
}

export function useCreateProject() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; color: string; description: string }) => {
      const { error } = await supabase
        .from('projects')
        .insert({
          owner_id: user!.id,
          name: input.name,
          color: input.color,
          description: input.description || null,
        });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects', user?.id] }),
  });
}

export function useUpdateProject() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; name: string; color: string; description: string }) => {
      const { error } = await supabase
        .from('projects')
        .update({ name: input.name, color: input.color, description: input.description || null })
        .eq('id', input.id)
        .eq('owner_id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects', user?.id] }),
  });
}

export function useDeleteProject() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('owner_id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    },
  });
}
