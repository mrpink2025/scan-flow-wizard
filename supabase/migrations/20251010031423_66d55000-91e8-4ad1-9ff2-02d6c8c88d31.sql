-- Adicionar coluna de contagem de cliques
ALTER TABLE public.blocked_news 
ADD COLUMN click_count INTEGER DEFAULT 0 NOT NULL;

-- Adicionar índice para melhor performance em queries de estatísticas
CREATE INDEX idx_blocked_news_click_count ON public.blocked_news(click_count DESC);

-- Comentário explicativo
COMMENT ON COLUMN public.blocked_news.click_count IS 'Número de vezes que a notícia foi visualizada (indicador de instalações)';

-- Função para incrementar o contador de forma atômica
CREATE OR REPLACE FUNCTION public.increment_news_click(news_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE public.blocked_news
  SET click_count = click_count + 1,
      updated_at = now()
  WHERE id = news_id AND active = true
  RETURNING click_count INTO new_count;
  
  RETURN new_count;
END;
$$;

-- Permitir que usuários anônimos chamem esta função
GRANT EXECUTE ON FUNCTION public.increment_news_click(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_news_click(UUID) TO authenticated;