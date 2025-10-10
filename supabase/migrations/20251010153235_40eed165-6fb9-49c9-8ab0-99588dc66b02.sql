-- Adicionar campo de conteúdo completo da notícia
ALTER TABLE blocked_news 
ADD COLUMN IF NOT EXISTS content TEXT;

-- Adicionar campo para legenda da imagem
ALTER TABLE blocked_news 
ADD COLUMN IF NOT EXISTS image_caption TEXT;

-- Adicionar campo para tempo de leitura estimado (em minutos)
ALTER TABLE blocked_news 
ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 5;