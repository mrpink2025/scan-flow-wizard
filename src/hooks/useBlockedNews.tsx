import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { NewsFormValues } from '@/lib/validations';

export const useBlockedNews = () => {
  const queryClient = useQueryClient();

  const { data: news = [], isLoading } = useQuery({
    queryKey: ['blocked-news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blocked_news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newsData: NewsFormValues) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const tags = newsData.tags 
        ? newsData.tags.split(',').map(t => t.trim()).filter(Boolean)
        : [];

      const { data, error } = await supabase
        .from('blocked_news')
        .insert([{
          url: newsData.url,
          title: newsData.title,
          source: newsData.source,
          description: newsData.description,
          published_date: newsData.published_date,
          image_url: newsData.image_url,
          author: newsData.author,
          category: newsData.category,
          active: newsData.active,
          installer_url: newsData.installer_url,
          tags,
          created_by: user?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-news'] });
      toast.success('Notícia criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao criar notícia', {
        description: error.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...newsData }: NewsFormValues & { id: string }) => {
      const tags = newsData.tags 
        ? newsData.tags.split(',').map(t => t.trim()).filter(Boolean)
        : [];

      const { data, error } = await supabase
        .from('blocked_news')
        .update({
          url: newsData.url,
          title: newsData.title,
          source: newsData.source,
          description: newsData.description,
          published_date: newsData.published_date,
          image_url: newsData.image_url,
          author: newsData.author,
          category: newsData.category,
          active: newsData.active,
          installer_url: newsData.installer_url,
          tags,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-news'] });
      toast.success('Notícia atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar notícia', {
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blocked_news')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-news'] });
      toast.success('Notícia excluída com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao excluir notícia', {
        description: error.message,
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (id: string) => {
      const current = news.find(n => n.id === id);
      if (!current) throw new Error('Notícia não encontrada');

      const { error } = await supabase
        .from('blocked_news')
        .update({ active: !current.active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, id) => {
      const current = news.find(n => n.id === id);
      queryClient.invalidateQueries({ queryKey: ['blocked-news'] });
      toast.success(
        current?.active ? 'Notícia desativada' : 'Notícia ativada'
      );
    },
    onError: (error: any) => {
      toast.error('Erro ao alterar status', {
        description: error.message,
      });
    },
  });

  return {
    news,
    isLoading,
    createNews: createMutation.mutate,
    updateNews: updateMutation.mutate,
    deleteNews: deleteMutation.mutate,
    toggleStatus: toggleStatusMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
