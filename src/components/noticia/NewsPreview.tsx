import { Card } from "@/components/ui/card";
import { Video, Calendar, User } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NewsPreviewProps {
  title: string;
  description?: string;
  source: string;
  imageUrl?: string;
  publishedDate?: string;
  author?: string;
  category?: string;
  url: string;
}

export const NewsPreview = ({ 
  title,
  description,
  source,
  imageUrl,
  publishedDate,
  author,
  category,
  url 
}: NewsPreviewProps) => {
  return (
    <Card className="overflow-hidden backdrop-blur-sm bg-card/50">
      <div className="aspect-video bg-muted flex items-center justify-center relative overflow-hidden">
        {imageUrl ? (
          <>
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 backdrop-blur-sm"></div>
          </>
        ) : (
          <>
            <Video className="w-16 h-16 text-muted-foreground/30" />
            <div className="absolute inset-0 backdrop-blur-sm"></div>
          </>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <span className="font-semibold text-primary">{source}</span>
          {publishedDate && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <time>{format(new Date(publishedDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</time>
              </div>
            </>
          )}
          {category && (
            <>
              <span>•</span>
              <span className="font-medium">{category}</span>
            </>
          )}
        </div>
        
        <h1 className="text-2xl font-bold mb-4 text-foreground">
          {title}
        </h1>
        
        {description && (
          <p className="text-muted-foreground mb-4 line-clamp-3">
            {description}
          </p>
        )}
        
        {author && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>{author}</span>
          </div>
        )}
      </div>
    </Card>
  );
};
