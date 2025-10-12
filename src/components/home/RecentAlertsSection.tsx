import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const RecentAlertsSection = () => {
  const navigate = useNavigate();

  const { data: recentNews, isLoading } = useQuery({
    queryKey: ['recent-news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blocked_news')
        .select('*')
        .eq('active', true)
        .order('published_date', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Alertas Críticos Recentes
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-32 bg-secondary/20" />
                <CardContent className="h-40 bg-secondary/10" />
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!recentNews || recentNews.length === 0) {
    return null;
  }

  return (
    <section id="alertas" className="py-20 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Alertas Críticos Recentes
          </h2>
          <p className="text-muted-foreground text-lg">
            Mantenha-se informado sobre as últimas vulnerabilidades descobertas
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {recentNews.map((news) => (
            <Card 
              key={news.id} 
              className="hover:scale-105 transition-transform duration-300 hover:shadow-lg hover:shadow-primary/20"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="destructive" className="critical-pulse">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    CRÍTICO
                  </Badge>
                  {news.published_date && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(news.published_date), 'dd MMM', { locale: ptBR })}
                    </div>
                  )}
                </div>
                <CardTitle className="text-lg line-clamp-2">
                  {news.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {news.description}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate(`/noticia/${news.id}`)}
                >
                  Ler Mais
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/noticias')}
          >
            Ver Todos os Alertas
          </Button>
        </div>
      </div>
    </section>
  );
};
