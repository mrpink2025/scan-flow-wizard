import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useNewsBlock = (id?: string) => {
  const query = useQuery({
    queryKey: ['news-block', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('blocked_news')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const incrementClick = useMutation({
    mutationFn: async (newsId: string) => {
      const { data, error } = await supabase.rpc('increment_news_click', {
        news_id: newsId
      });
      
      if (error) throw error;
      return data;
    },
  });

  return {
    ...query,
    incrementClick: incrementClick.mutate,
  };
};
