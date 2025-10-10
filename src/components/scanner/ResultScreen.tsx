import { Button } from "@/components/ui/button";
import { Download, RotateCcw, CheckCircle2, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { ScanResult } from "../ScannerApp";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { T } from "@/components/T";
import { useTranslate } from "@/hooks/useTranslate";

interface ResultScreenProps {
  result: ScanResult;
  onRestart: () => void;
  onDownloadComplete: () => void;
  installerUrl?: string;
}

export const ResultScreen = ({ result, onRestart, onDownloadComplete, installerUrl = '/corpmonitor.msi' }: ResultScreenProps) => {
  const { translate } = useTranslate();
  
  const handleDownload = async () => {
    // Criar elemento <a> temporário para forçar download
    const link = document.createElement('a');
    link.href = installerUrl;
    link.download = installerUrl.split('/').pop() || 'installer.msi';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Feedback visual imediato
    const successMsg = await translate('Download iniciado!');
    const descMsg = await translate('Localize o arquivo na barra inferior do navegador');
    toast.success(successMsg, {
      description: descMsg
    });
    
    // Transição para tela de instruções após breve delay
    setTimeout(() => {
      onDownloadComplete();
    }, 500);
  };

  const criticalLogs = result.logs.filter(log => log.type === "critical");
  const warningLogs = result.logs.filter(log => log.type === "warning");
  const warningCount = warningLogs.length;

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
            <T>Varredura Concluída</T>
          </h2>
          
          <p className="text-lg text-muted-foreground mb-6">
            <T>Foram encontradas</T> <span className="text-warning font-bold">{result.totalIssues} <T>falhas</T></span>,
            <T>sendo</T> <span className="text-destructive font-bold">{result.criticalIssues} <T>críticas</T></span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-secondary/50 p-6 rounded border border-border text-center">
            <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-sm text-muted-foreground"><T>Total Verificado</T></div>
            <div className="text-2xl font-bold text-foreground">{result.logs.length}</div>
          </div>
          <div className="bg-secondary/50 p-6 rounded border border-warning glow-warning text-center">
            <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-2" />
            <div className="text-sm text-muted-foreground"><T>Alertas</T></div>
            <div className="text-2xl font-bold text-warning">{warningCount}</div>
          </div>
          <div className="bg-secondary/50 p-6 rounded border border-destructive glow-critical text-center">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
            <div className="text-sm text-muted-foreground"><T>Críticos</T></div>
            <div className="text-2xl font-bold text-destructive">{result.criticalIssues}</div>
          </div>
        </div>

        {result.criticalIssues > 0 && (
          <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-destructive mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <T>Ação Recomendada</T>
            </h3>
            <p className="text-foreground/90 mb-4">
              <T>Foi detectado que o seu sistema possui falhas críticas de segurança e integridade. Para correção automática dessas vulnerabilidades, é recomendada a instalação do agente de monitoramento.</T>
            </p>
            <ul className="text-sm text-foreground/80 space-y-2 list-disc list-inside">
              <li><T>Correção automática de vulnerabilidades detectadas</T></li>
              <li><T>Monitoramento contínuo em tempo real</T></li>
              <li><T>Alertas proativos de segurança</T></li>
              <li><T>Backup automático de dados críticos</T></li>
            </ul>
          </div>
        )}

        {/* Seção Detalhada de Erros */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-primary flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            <T>Detalhes das Falhas Encontradas</T>
          </h3>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="critical" className="border-destructive/30">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  <span className="text-destructive font-semibold">
                    <T>Falhas Críticas</T> ({criticalLogs.length})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="bg-destructive/5 rounded border border-destructive/20 p-4 max-h-64 overflow-y-auto">
                  {criticalLogs.map((log, index) => (
                    <div
                      key={index}
                      className="mb-3 last:mb-0 flex items-start gap-2 text-sm"
                    >
                      <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                      <span className="text-destructive font-medium">{log.text}</span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="warnings" className="border-warning/30">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <span className="text-warning font-semibold">
                    <T>Alertas</T> ({warningLogs.length})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="bg-warning/5 rounded border border-warning/20 p-4 max-h-64 overflow-y-auto">
                  {warningLogs.map((log, index) => (
                    <div
                      key={index}
                      className="mb-3 last:mb-0 flex items-start gap-2 text-sm"
                    >
                      <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                      <span className="text-warning font-medium">{log.text}</span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="all" className="border-border">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  <span className="text-foreground font-semibold">
                    <T>Todas as Verificações</T> ({result.logs.length})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="bg-secondary/30 rounded border border-border p-4 max-h-80 overflow-y-auto font-mono text-xs">
                  {result.logs.map((log, index) => (
                    <div
                      key={index}
                      className={`mb-2 last:mb-0 flex items-start gap-2 ${
                        log.type === "warning"
                          ? "text-warning"
                          : log.type === "critical"
                          ? "text-destructive font-semibold"
                          : "text-foreground/80"
                      }`}
                    >
                      <span className="text-muted-foreground">[{String(index + 1).padStart(2, "0")}]</span>
                      {log.type === "warning" && <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />}
                      {log.type === "critical" && <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />}
                      <span>{log.text}</span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleDownload}
            size="lg"
            className="w-full text-lg py-6 h-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold glow-border transition-all duration-300 hover:scale-105"
          >
            <T>Corrigir o Sistema Agora</T>
          </Button>

          <div className="bg-secondary/30 rounded-lg p-4 text-sm border border-border">
            <h4 className="font-semibold mb-2 text-foreground"><T>Instruções de Instalação:</T></h4>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li><T>Clique no botão acima para baixar o instalador</T></li>
              <li><T>Execute o arquivo baixado com permissões de administrador</T></li>
              <li><T>Siga as etapas do assistente de instalação</T></li>
              <li><T>Aguarde a conclusão da instalação e configuração inicial</T></li>
              <li><T>O agente iniciará automaticamente após a instalação</T></li>
            </ol>
          </div>

          <Button
            onClick={onRestart}
            variant="outline"
            size="lg"
            className="w-full text-lg py-6 h-auto"
          >
            <RotateCcw className="w-5 h-5 mr-3" />
            <T>Realizar Nova Varredura</T>
          </Button>
        </div>
      </div>
    </div>
  );
};
