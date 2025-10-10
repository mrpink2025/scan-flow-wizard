import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle, XCircle, TrendingUp, MousePointerClick } from 'lucide-react';

interface AdminStatsProps {
  news: any[];
}

export const AdminStats = ({ news }: AdminStatsProps) => {
  const total = news.length;
  const active = news.filter(n => n.active).length;
  const inactive = news.filter(n => !n.active).length;
  const activationRate = total > 0 ? ((active / total) * 100).toFixed(1) : '0';
  const totalClicks = news.reduce((sum, item) => sum + (item.click_count || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
          <FileText className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
          <p className="text-xs text-muted-foreground">Notícias cadastradas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Ativas</CardTitle>
          <CheckCircle className="w-4 h-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{active}</div>
          <p className="text-xs text-muted-foreground">Em circulação</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Inativas</CardTitle>
          <XCircle className="w-4 h-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inactive}</div>
          <p className="text-xs text-muted-foreground">Desativadas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Taxa</CardTitle>
          <TrendingUp className="w-4 h-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activationRate}%</div>
          <p className="text-xs text-muted-foreground">De ativação</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Instalações</CardTitle>
          <MousePointerClick className="w-4 h-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalClicks.toLocaleString('pt-BR')}</div>
          <p className="text-xs text-muted-foreground">Total de cliques</p>
        </CardContent>
      </Card>
    </div>
  );
};
