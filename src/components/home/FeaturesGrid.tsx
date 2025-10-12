import { Shield, Search, BarChart3, Lock, Zap, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: Shield,
    title: 'Monitoramento 24/7',
    description: 'Detecção contínua de ameaças em tempo real com alertas instantâneos'
  },
  {
    icon: Search,
    title: 'Análise de Vulnerabilidades',
    description: 'Scan profundo do sistema identificando falhas antes de serem exploradas'
  },
  {
    icon: BarChart3,
    title: 'Relatórios em Tempo Real',
    description: 'Dashboard executivo com métricas e insights acionáveis'
  },
  {
    icon: Lock,
    title: 'Compliance Automático',
    description: 'Conformidade com ISO 27001, SOC 2 Type II e GDPR garantida'
  },
  {
    icon: Zap,
    title: 'Resposta Automatizada',
    description: 'Correção automática de falhas críticas em minutos, não horas'
  },
  {
    icon: Globe,
    title: 'Inteligência Global',
    description: 'Base de dados com 50M+ CVEs e padrões de ataque atualizados'
  }
];

export const FeaturesGrid = () => {
  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Recursos da Plataforma
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tecnologia de ponta para proteger sua empresa contra as ameaças mais sofisticadas
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="hover:scale-105 transition-transform duration-300 hover:shadow-lg hover:shadow-primary/20"
              >
                <CardHeader>
                  <div className="mb-4">
                    <div className="inline-flex p-3 rounded-lg bg-primary/10 text-primary">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
