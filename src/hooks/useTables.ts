import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableStatus } from '@/types/database';
import { toast } from 'sonner';

export function useTables() {
  const queryClient = useQueryClient();

  const tablesQuery = useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('identifier');
      
      if (error) throw error;
      return data as Table[];
    },
  });

  const createTable = useMutation({
    mutationFn: async (identifier: string) => {
      const { data, error } = await supabase
        .from('tables')
        .insert({ identifier })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Mesa criada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar mesa: ' + error.message);
    },
  });

  const updateTableStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TableStatus }) => {
      const { data, error } = await supabase
        .from('tables')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
    onError: (error) => {
      toast.error('Erro ao atualizar mesa: ' + error.message);
    },
  });

  const deleteTable = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Mesa removida com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao remover mesa: ' + error.message);
    },
  });

  return {
    tables: tablesQuery.data ?? [],
    isLoading: tablesQuery.isLoading,
    createTable,
    updateTableStatus,
    deleteTable,
  };
}
