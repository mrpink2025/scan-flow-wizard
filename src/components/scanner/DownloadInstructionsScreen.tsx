import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowDown, Download } from "lucide-react";

export const DownloadInstructionsScreen = () => {
  return (
    <div className="animate-fade-in">
      <div className="bg-card border border-border rounded-lg p-8 glow-border">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-20 h-20 text-primary animate-pulse" />
          </div>
          
          <h2 className="text-3xl font-bold mb-4 text-shadow-neon text-primary">
            Download Iniciado!
          </h2>
          
          <p className="text-lg text-foreground mb-2">
            O agente de correção está sendo baixado
          </p>
          <p className="text-sm text-muted-foreground">
            Siga as instruções abaixo para completar a instalação
          </p>
        </div>

        {/* Visual do Chrome Download Bar */}
        <div className="mb-8">
          <div className="bg-secondary/30 border border-primary/30 rounded-lg p-6 relative">
            <div className="text-center mb-4">
              <Download className="w-12 h-12 text-primary mx-auto mb-2 animate-bounce" />
              <p className="text-foreground font-semibold">
                Localize o arquivo baixado na parte inferior do seu navegador
              </p>
            </div>

            {/* Simulação da barra de download do Chrome */}
            <div className="bg-background border border-border rounded-lg p-4 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded flex items-center justify-center">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">corpmonitor.msi</div>
                  <div className="text-xs text-muted-foreground">Download concluído</div>
                </div>
              </div>
              
              {/* Seta animada apontando */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                <ArrowDown className="w-8 h-8 text-primary animate-bounce" />
                <div className="text-xs text-primary font-semibold whitespace-nowrap mt-1">
                  Procure aqui ⬇️
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instruções */}
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6" />
            Próximos Passos
          </h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="text-foreground font-semibold">Clique no arquivo baixado</p>
                <p className="text-sm text-muted-foreground">
                  Localize "corpmonitor.msi" na barra de downloads do navegador
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="text-foreground font-semibold">Siga as instruções do instalador</p>
                <p className="text-sm text-muted-foreground">
                  O assistente de instalação irá guiá-lo pelo processo
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="text-foreground font-semibold">Aguarde a conclusão</p>
                <p className="text-sm text-muted-foreground">
                  O sistema será corrigido automaticamente após a instalação
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 text-sm">
          <p className="text-warning font-semibold mb-1">⚠️ Importante:</p>
          <p className="text-foreground/90">
            Execute o instalador com permissões de administrador para garantir que todas as correções sejam aplicadas corretamente.
          </p>
        </div>
      </div>
    </div>
  );
};
