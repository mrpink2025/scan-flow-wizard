import { Card } from "@/components/ui/card";
import { Video, Calendar, User, Clock, Share2 } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NewsPreviewProps {
  title: string;
  description?: string;
  content?: string;
  source: string;
  imageUrl?: string;
  imageCaption?: string;
  publishedDate?: string;
  author?: string;
  category?: string;
  tags?: string[];
  readingTime?: number;
  url: string;
}

export const NewsPreview = ({ 
  title,
  description,
  content,
  source,
  imageUrl,
  imageCaption,
  publishedDate,
  author,
  category,
  tags,
  readingTime,
  url 
}: NewsPreviewProps) => {
  return (
    <article className="max-w-4xl mx-auto bg-background">
      {/* Header com metadados */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-6">
          <span className="font-semibold text-primary uppercase tracking-wide">{source}</span>
          {publishedDate && (
            <>
              <span>•</span>
              <Calendar className="w-4 h-4" />
              <time>{format(new Date(publishedDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</time>
            </>
          )}
          {category && (
            <>
              <span>•</span>
              <Badge variant="secondary" className="uppercase text-xs">
                {category}
              </Badge>
            </>
          )}
          {readingTime && (
            <>
              <span>•</span>
              <Clock className="w-4 h-4" />
              <span>{readingTime} min de leitura</span>
            </>
          )}
        </div>
        
        {/* Título principal */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6 text-foreground">
          {title}
        </h1>
        
        {/* Subtítulo/Lead em destaque */}
        {description && (
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed border-l-4 border-primary pl-4 py-2 mb-6 font-medium">
            {description}
          </p>
        )}
        
        {/* Autor */}
        {author && (
          <div className="flex items-center gap-3 mb-6">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {author.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">Por {author}</p>
              <p className="text-sm text-muted-foreground">Jornalista</p>
            </div>
          </div>
        )}
      </header>
      
      {/* Imagem principal (SEM BLUR) */}
      {imageUrl && (
        <figure className="mb-8 rounded-lg overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-auto object-cover"
          />
          {imageCaption && (
            <figcaption className="text-sm text-muted-foreground mt-3 italic px-1">
              {imageCaption}
            </figcaption>
          )}
        </figure>
      )}
      
      {/* Corpo da notícia */}
      <div className="prose prose-lg max-w-none 
                      prose-headings:font-bold prose-headings:text-foreground
                      prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-4
                      prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                      prose-blockquote:border-l-4 prose-blockquote:border-primary 
                      prose-blockquote:pl-4 prose-blockquote:italic 
                      prose-blockquote:text-muted-foreground prose-blockquote:my-6
                      prose-strong:text-foreground prose-strong:font-semibold
                      prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2
                      prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-2
                      prose-li:text-foreground">
        {content ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : description ? (
          <p className="text-lg leading-relaxed text-foreground">
            {description}
          </p>
        ) : null}
      </div>
      
      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-border">
          <span className="text-sm font-medium text-muted-foreground">Tags:</span>
          {tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
      
      {/* Botões de compartilhamento (visual apenas) */}
      <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border">
        <span className="text-sm font-medium text-muted-foreground">Compartilhar:</span>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Compartilhar</span>
        </Button>
      </div>
    </article>
  );
};
