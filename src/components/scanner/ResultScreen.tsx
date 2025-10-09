import { Button } from "@/components/ui/button";
import { Download, RotateCcw, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { ScanResult } from "../ScannerApp";
import { toast } from "sonner";

interface ResultScreenProps {
  result: ScanResult;
  onRestart: () => void;
}

export const ResultScreen = ({ result, onRestart }: ResultScreenProps) => {
  const handleDownload = () => {
    toast.success("Download iniciado! Siga as instruções de instalação.");
    // Simula o download
    window.open("/download?installer=monitor", "_blank");
  };

  const warningCount = result.logs.filter((log) => log.type === "warning").length;

  return (
    <div className="animate-fade-in">
      <div className="bg-card border border-border rounded-lg p-8 glow-border">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {result.criticalIssues > 0 ? (
              <AlertCircle className="w-20 h-20 text-destructive animate-pulse-glow glow-critical" />
            ) : (
              <CheckCircle2 className="w-20 h-20 text-primary animate-pulse-glow" />
            )}
          </div>
          
          <h2 className="text-3xl font-bold mb-4 text-shadow-neon">
            Varredura Concluída
          </h2>
          
          <p className="text-lg text-muted-foreground mb-6">
            Foram encontradas <span className="text-warning font-bold">{result.totalIssues} falhas</span>,
            sendo <span className="text-destructive font-bold">{result.criticalIssues} críticas</span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-secondary/50 p-6 rounded border border-border text-center">
            <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">Total Verificado</div>
            <div className="text-2xl font-bold text-foreground">{result.logs.length}</div>
          </div>
          <div className="bg-secondary/50 p-6 rounded border border-warning glow-warning text-center">
            <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">Alertas</div>
            <div className="text-2xl font-bold text-warning">{warningCount}</div>
          </div>
          <div className="bg-secondary/50 p-6 rounded border border-destructive glow-critical text-center">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">Críticos</div>
            <div className="text-2xl font-bold text-destructive">{result.criticalIssues}</div>
          </div>
        </div>

        {result.criticalIssues > 0 && (
          <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-destructive mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Ação Recomendada
            </h3>
            <p className="text-foreground/90 mb-4">
              Foi detectado que o seu sistema possui falhas críticas de segurança e integridade.
              Para correção automática dessas vulnerabilidades, é recomendada a instalação do
              agente de monitoramento.
            </p>
            <ul className="text-sm text-foreground/80 space-y-2 list-disc list-inside">
              <li>Correção automática de vulnerabilidades detectadas</li>
              <li>Monitoramento contínuo em tempo real</li>
              <li>Alertas proativos de segurança</li>
              <li>Backup automático de dados críticos</li>
            </ul>
          </div>
        )}

        <div className="space-y-4">
          <Button
            onClick={handleDownload}
            size="lg"
            className="w-full text-lg py-6 h-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold glow-border transition-all duration-300 hover:scale-105"
          >
            <Download className="w-6 h-6 mr-3" />
            Baixar Instalador e Organizar Instalação
          </Button>

          <div className="bg-secondary/30 rounded-lg p-4 text-sm border border-border">
            <h4 className="font-semibold mb-2 text-foreground">Instruções de Instalação:</h4>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Clique no botão acima para baixar o instalador</li>
              <li>Execute o arquivo baixado com permissões de administrador</li>
              <li>Siga as etapas do assistente de instalação</li>
              <li>Aguarde a conclusão da instalação e configuração inicial</li>
              <li>O agente iniciará automaticamente após a instalação</li>
            </ol>
          </div>

          <Button
            onClick={onRestart}
            variant="outline"
            size="lg"
            className="w-full text-lg py-6 h-auto"
          >
            <RotateCcw className="w-5 h-5 mr-3" />
            Realizar Nova Varredura
          </Button>
        </div>
      </div>
    </div>
  );
};
