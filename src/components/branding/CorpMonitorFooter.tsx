import { Badge } from '@/components/ui/badge';

export const CorpMonitorFooter = () => {
  return (
    <footer className="border-t mt-12 pt-8 pb-6 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <Badge variant="secondary" className="text-xs">
            🔒 ISO 27001:2022
          </Badge>
          <Badge variant="secondary" className="text-xs">
            ✓ SOC 2 Type II
          </Badge>
          <Badge variant="secondary" className="text-xs">
            🇪🇺 GDPR Compliant
          </Badge>
          <Badge variant="secondary" className="text-xs">
            🏆 Gartner Magic Quadrant 2025
          </Badge>
        </div>
        
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground">
            CorpMonitor Inc. | San Francisco, CA | CNPJ 12.345.678/0001-90
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
          <a href="#terms" className="hover:text-foreground transition-colors">
            Termos de Uso
          </a>
          <a href="#privacy" className="hover:text-foreground transition-colors">
            Política de Privacidade
          </a>
          <a href="#support" className="hover:text-foreground transition-colors">
            Suporte Técnico
          </a>
          <a href="#docs" className="hover:text-foreground transition-colors">
            Documentação
          </a>
        </div>
        
        <div className="text-center mt-4 text-xs text-muted-foreground/60">
          <p>© 2025 CorpMonitor Inc. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
