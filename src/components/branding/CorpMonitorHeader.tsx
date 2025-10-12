import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { T } from '@/components/T';

export const CorpMonitorHeader = () => {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShieldCheck className="w-10 h-10 text-primary" />
              <div className="absolute inset-0 glow-border rounded-full opacity-50" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">CorpMonitor</h1>
              <p className="text-xs text-muted-foreground">Enterprise Security Platform</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <a href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <T>Início</T>
            </a>
            <a href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
              <T>Recursos</T>
            </a>
            <a href="/verificador" className="text-muted-foreground hover:text-foreground transition-colors">
              <T>Verificador</T>
            </a>
            <LanguageSwitcher />
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/login'}>
              <T>Entrar</T>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};
