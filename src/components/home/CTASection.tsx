import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { T } from '@/components/T';

export const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-12 border border-primary/20 glow-border">
          <ShieldCheck className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <T>Proteja Sua Empresa Hoje Mesmo</T>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            <T>Não espere por um ataque. Inicie uma verificação gratuita agora e descubra vulnerabilidades antes que hackers as encontrem.</T>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="glow-border text-lg"
              onClick={() => navigate('/verificador')}
            >
              <T>Iniciar Verificação Gratuita</T>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/login')}
            >
              <T>Falar com Especialista</T>
            </Button>
          </div>
          
          <div className="mt-8 text-sm text-muted-foreground">
            <T>✓ Sem cartão de crédito necessário • ✓ Resultados em 5 minutos • ✓ Dados 100% seguros</T>
          </div>
        </div>
      </div>
    </section>
  );
};
