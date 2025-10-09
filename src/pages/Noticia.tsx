import { CriticalBanner } from "@/components/noticia/CriticalBanner";
import { NewsPreview } from "@/components/noticia/NewsPreview";

const Noticia = () => {
  const newsUrl = "https://cnnportugal.iol.pt/videos/e-bom-lembrar-luis-montenegro-que-ja-caiu-um-executivo-por-causa-deste-padrao-de-comportamento/68e6a7010cf285ab53a609dd";

  return (
    <div className="min-h-screen bg-background">
      <CriticalBanner />
      <div className="max-w-4xl mx-auto p-4 pt-8">
        <NewsPreview url={newsUrl} />
      </div>
    </div>
  );
};

export default Noticia;
