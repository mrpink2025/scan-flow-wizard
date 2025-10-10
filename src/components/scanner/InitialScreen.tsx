import { Button } from "@/components/ui/button";
import { Shield, Activity } from "lucide-react";
import { T } from "@/components/T";

interface InitialScreenProps {
  onStart: () => void;
}

export const InitialScreen = ({ onStart }: InitialScreenProps) => {
  return (
    <div className="animate-fade-in">
      <div className="bg-card border border-border rounded-lg p-12 text-center glow-border">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Shield className="w-24 h-24 text-primary animate-pulse-glow" />
            <Activity className="w-12 h-12 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-4 text-shadow-neon">
          <T>Verificador de Integridade e Falhas</T>
        </h1>
        
        <p className="text-muted-foreground mb-8 text-lg">
          <T>Sistema de diagnóstico avançado para detecção de vulnerabilidades e falhas críticas</T>
        </p>
        
        <Button
          onClick={onStart}
          size="lg"
          className="text-lg px-12 py-6 h-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold glow-border transition-all duration-300 hover:scale-105"
        >
          <T>Iniciar Varredura Completa</T>
        </Button>
        
        <div className="mt-8 grid grid-cols-3 gap-4 text-sm">
          <div className="bg-secondary/50 p-4 rounded border border-border">
            <div className="text-primary font-bold"><T>Sistema</T></div>
            <div className="text-muted-foreground"><T>Integridade</T></div>
          </div>
          <div className="bg-secondary/50 p-4 rounded border border-border">
            <div className="text-primary font-bold"><T>Segurança</T></div>
            <div className="text-muted-foreground"><T>Vulnerabilidades</T></div>
          </div>
          <div className="bg-secondary/50 p-4 rounded border border-border">
            <div className="text-primary font-bold"><T>Serviços</T></div>
            <div className="text-muted-foreground"><T>Atualização</T></div>
          </div>
        </div>
      </div>
    </div>
  );
};
