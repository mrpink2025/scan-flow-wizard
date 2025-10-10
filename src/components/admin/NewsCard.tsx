import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Power, Trash2, Download, MousePointerClick } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NewsCardProps {
  news: any;
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NewsCard = ({ news, onView, onEdit, onToggleStatus, onDelete }: NewsCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {news.image_url && (
            <div className="w-32 h-24 flex-shrink-0 rounded-md overflow-hidden bg-muted">
              <img
                src={news.image_url}
                alt={news.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold line-clamp-2">{news.title}</h3>
              <Badge variant={news.active ? 'default' : 'secondary'}>
                {news.active ? 'Ativa' : 'Inativa'}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3 text-sm text-muted-foreground">
              <span>{news.source}</span>
              {news.published_date && (
                <>
                  <span>•</span>
                  <span>
                    {format(new Date(news.published_date), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </>
              )}
              {news.category && (
                <>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs">
                    {news.category}
                  </Badge>
                </>
              )}
              {news.installer_url && (
                <Badge variant="outline" className="gap-1 text-xs">
                  <Download className="w-3 h-3" />
                  Instalador Custom
                </Badge>
              )}
              {typeof news.click_count === 'number' && (
                <Badge variant="outline" className="gap-1 text-xs">
                  <MousePointerClick className="w-3 h-3" />
                  {news.click_count} {news.click_count === 1 ? 'visualização' : 'visualizações'}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => onView(news.id)}>
                <Eye className="w-4 h-4 mr-1" />
                Ver
              </Button>
              {onEdit && (
                <Button size="sm" variant="outline" onClick={() => onEdit(news.id)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
              )}
              <Button
                size="sm"
                variant={news.active ? 'secondary' : 'default'}
                onClick={() => onToggleStatus(news.id)}
              >
                <Power className="w-4 h-4 mr-1" />
                {news.active ? 'Desativar' : 'Ativar'}
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onDelete(news.id)}>
                <Trash2 className="w-4 h-4 mr-1" />
                Excluir
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
