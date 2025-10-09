import { Video } from "lucide-react";
import { Card } from "@/components/ui/card";

interface NewsPreviewProps {
  url: string;
}

export const NewsPreview = ({ url }: NewsPreviewProps) => {
  return (
    <Card className="overflow-hidden bg-card border-border">
      {/* Video Preview Area */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/20 via-background to-destructive/10">
        <div className="absolute inset-0 flex items-center justify-center blur-sm">
          <div className="text-center">
            <Video className="w-24 h-24 mx-auto mb-4 text-primary opacity-50" />
            <p className="text-2xl font-bold text-foreground/50">Vídeo CNN Portugal</p>
          </div>
        </div>
      </div>
      
      {/* Video Info */}
      <div className="p-6">
        <div className="flex items-start gap-3 mb-3">
          <Video className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
              Vídeo - CNN Portugal
            </p>
            <h2 className="text-xl font-bold text-foreground mb-3 leading-tight">
              É bom lembrar Luís Montenegro que já caiu um executivo por causa deste padrão de comportamento
            </h2>
            <p className="text-sm text-muted-foreground">
              Fonte: cnnportugal.iol.pt
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
