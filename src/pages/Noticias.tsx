import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CorpMonitorHeader } from '@/components/branding/CorpMonitorHeader';
import { CorpMonitorFooter } from '@/components/branding/CorpMonitorFooter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Noticias = () => {
  const navigate = useNavigate();

  const { data: news, isLoading } = useQuery({
    queryKey: ['all-news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blocked_news')
        .select('*')
        .eq('active', true)
        .order('published_date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <CorpMonitorHeader />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Alertas de Segurança
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Acompanhe as últimas vulnerabilidades e ameaças descobertas pela nossa equipe de segurança
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-32 bg-secondary/20" />
                <CardContent className="h-40 bg-secondary/10" />
              </Card>
            ))}
          </div>
        ) : !news || news.length === 0 ? (
          <div className="text-center py-20">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl text-muted-foreground">
              Nenhum alerta disponível no momento
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <Card 
                key={item.id} 
                className="hover:scale-105 transition-transform duration-300 hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
                onClick={() => navigate(`/noticia/${item.id}`)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="destructive" className="critical-pulse">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      CRÍTICO
                    </Badge>
                    {item.published_date && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(item.published_date), 'dd MMM yyyy', { locale: ptBR })}
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {item.description}
                  </p>
                  <Button variant="ghost" size="sm" className="w-full group">
                    Ler Mais
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <CorpMonitorFooter />
    </div>
  );
};

export default Noticias;
