import { ExternalLink, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface NewsPreviewProps {
  url: string;
}

export const NewsPreview = ({ url }: NewsPreviewProps) => {
  const handleOpenNews = () => {
    window.open(url, "_blank");
  };

  return (
    <Card className="p-6 bg-card">
      <div className="flex items-start gap-4 mb-4">
        <Video className="w-6 h-6 text-primary flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2">
            Vídeo - CNN Portugal
          </p>
          <h3 className="text-xl font-bold text-foreground mb-3">
            É bom lembrar Luís Montenegro que já caiu um executivo por causa deste padrão de comportamento
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Fonte: cnnportugal.iol.pt
          </p>
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <p className="text-xs text-muted-foreground break-all">
              {url}
            </p>
          </div>
          <Button
            onClick={handleOpenNews}
            variant="default"
            size="lg"
            className="w-full sm:w-auto"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Assistir Vídeo Completo
          </Button>
        </div>
      </div>
    </Card>
  );
};
