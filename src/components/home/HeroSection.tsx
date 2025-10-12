import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { StatsCounter } from './StatsCounter';

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background gradient animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
      
      <div className="container mx-auto px-4 py-20 text-center relative z-10">
        {/* Ícone principal */}
        <div className="relative inline-block mb-8 animate-fade-in">
          <ShieldCheck className="w-32 h-32 mx-auto text-primary" />
          <div className="absolute inset-0 glow-border rounded-full opacity-50" />
        </div>
        
        {/* Título */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
          Proteja Sua Empresa Contra<br />
          <span className="text-primary">Ameaças Cibernéticas</span>
        </h1>
        
        {/* Subtítulo */}
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
          Monitoramento 24/7, detecção automática de vulnerabilidades e 
          correção em tempo real. Confie na plataforma líder de segurança corporativa.
        </p>
        
        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in">
          <Button 
            size="lg" 
            className="glow-border text-lg"
            onClick={() => navigate('/verificador')}
          >
            Verificar Meu Sistema
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate('/noticias')}
          >
            Ver Alertas de Segurança
          </Button>
        </div>
        
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto animate-fade-in">
          <StatsCounter value={500000} suffix="+" label="Empresas Protegidas" />
          <StatsCounter value={2000000} suffix="+" label="Ameaças Bloqueadas/Semana" />
          <StatsCounter value={99.9} suffix="%" label="Uptime" />
        </div>
      </div>
    </section>
  );
};
