import { useState, useEffect, useCallback } from 'react';
import { useLocalization } from './useLocalization';

// Cache de traduções na sessão (limpa ao fechar o navegador)
const translationCache = new Map<string, string>();

export const useTranslate = () => {
  const { currentLanguage } = useLocalization();
  const [isTranslating, setIsTranslating] = useState(false);

  // Função para traduzir um texto individual
  const translate = useCallback(async (text: string): Promise<string> => {
    // Se for português ou texto vazio, não traduzir
    if (!text || currentLanguage === 'pt') {
      return text;
    }

    // Gerar chave de cache única
    const cacheKey = `${text}_${currentLanguage}`;

    // Verificar cache em memória
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    // Verificar cache no sessionStorage
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      translationCache.set(cacheKey, cached);
      return cached;
    }

    // Traduzir via Edge Function
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-translate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            targetLang: currentLanguage,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        const translated = data.translatedText;
        
        // Salvar em ambos os caches
        translationCache.set(cacheKey, translated);
        sessionStorage.setItem(cacheKey, translated);
        
        return translated;
      }
    } catch (error) {
      console.error('Translation error:', error);
    }

    // Fallback: retornar texto original
    return text;
  }, [currentLanguage]);

  // Função para traduzir múltiplos textos de uma vez (batch)
  const translateBatch = useCallback(async (texts: string[]): Promise<string[]> => {
    setIsTranslating(true);
    
    try {
      const translations = await Promise.all(
        texts.map(text => translate(text))
      );
      return translations;
    } finally {
      setIsTranslating(false);
    }
  }, [translate]);

  // Hook para traduzir um texto específico com estado
  const useTranslatedText = (originalText: string) => {
    const [translatedText, setTranslatedText] = useState(originalText);

    useEffect(() => {
      if (currentLanguage === 'pt') {
        setTranslatedText(originalText);
        return;
      }

      translate(originalText).then(setTranslatedText);
    }, [originalText, currentLanguage, translate]);

    return translatedText;
  };

  return {
    translate,
    translateBatch,
    useTranslatedText,
    isTranslating,
    currentLanguage,
  };
};
