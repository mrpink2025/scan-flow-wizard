import { useState, useEffect } from 'react';

interface LocationData {
  country: string;
  language: string;
  detected: boolean;
}

export const useLocalization = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isDetecting, setIsDetecting] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState('pt');
  const [languageVersion, setLanguageVersion] = useState(0);

  useEffect(() => {
    const detectLocation = async () => {
      // 1. Verificar se já tem idioma salvo
      const savedLocale = localStorage.getItem('user_locale');
      if (savedLocale) {
        setCurrentLanguage(savedLocale);
        setLocation({ country: '', language: savedLocale, detected: true });
        setIsDetecting(false);
        return;
      }

      // 2. Tentar detectar pelo navegador
      const browserLang = navigator.language || 'pt-BR';
      const langCode = browserLang.split('-')[0]; // 'pt-BR' -> 'pt'
      
      // 3. Fallback: detectar por IP (via Edge Function)
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/detect-location`
        );
        
        if (response.ok) {
          const data = await response.json();
          const detectedLang = data.language || langCode;
          
          setCurrentLanguage(detectedLang);
          localStorage.setItem('user_locale', detectedLang);
          
          setLocation({
            country: data.country,
            language: detectedLang,
            detected: true,
          });
        } else {
          // Fallback para idioma do navegador
          setCurrentLanguage(langCode);
          localStorage.setItem('user_locale', langCode);
          setLocation({ country: '', language: langCode, detected: true });
        }
      } catch (error) {
        console.error('Error detecting location:', error);
        // Fallback para idioma do navegador
        setCurrentLanguage(langCode);
        localStorage.setItem('user_locale', langCode);
        setLocation({ country: '', language: langCode, detected: true });
      }

      setIsDetecting(false);
    };

    detectLocation();
  }, []);

  const changeLanguage = (lang: string) => {
    setCurrentLanguage(lang);
    localStorage.setItem('user_locale', lang);
    setLocation(prev => prev ? { ...prev, language: lang } : null);
    
    // Limpar cache de traduções ao trocar idioma
    sessionStorage.clear();
    
    // Forçar re-render de todos os componentes
    setLanguageVersion(prev => prev + 1);
  };

  return { location, isDetecting, changeLanguage, currentLanguage, languageVersion };
};
