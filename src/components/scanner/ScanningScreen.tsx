import { useState, useEffect, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { ScanResult } from "../ScannerApp";

interface ScanningScreenProps {
  onComplete: (result: ScanResult) => void;
}

const generateScanLogs = () => {
  const logs = [
    { text: "Iniciando verificação do sistema...", type: "info" as const },
    { text: "Verificando integridade de arquivos do kernel...", type: "info" as const },
    { text: "Analisando permissões de diretórios críticos...", type: "info" as const },
    { text: "Verificando serviços em execução...", type: "info" as const },
    { text: "[ALERTA] Serviço SSH usando porta padrão 22", type: "warning" as const },
    { text: "Escaneando portas abertas...", type: "info" as const },
    { text: "[CRÍTICO] Porta de administração 8080 exposta sem autenticação", type: "critical" as const },
    { text: "Verificando certificados SSL...", type: "info" as const },
    { text: "[ALERTA] Certificado SSL expira em 15 dias", type: "warning" as const },
    { text: "Analisando configurações de firewall...", type: "info" as const },
    { text: "Verificando atualizações de segurança...", type: "info" as const },
    { text: "[CRÍTICO] 3 atualizações críticas de segurança pendentes", type: "critical" as const },
    { text: "Analisando logs de sistema...", type: "info" as const },
    { text: "[ALERTA] Tentativas de acesso não autorizado detectadas", type: "warning" as const },
    { text: "Verificando integridade de banco de dados...", type: "info" as const },
    { text: "[CRÍTICO] Backup do banco de dados desatualizado (90 dias)", type: "critical" as const },
    { text: "Escaneando malware e ameaças...", type: "info" as const },
    { text: "Verificando políticas de senha...", type: "info" as const },
    { text: "[ALERTA] Senhas fracas detectadas em 2 contas", type: "warning" as const },
    { text: "Analisando tráfego de rede...", type: "info" as const },
    { text: "Verificando dependencies de software...", type: "info" as const },
    { text: "[ALERTA] 5 pacotes desatualizados encontrados", type: "warning" as const },
    { text: "Finalizando varredura...", type: "info" as const },
    { text: "Gerando relatório de diagnóstico...", type: "info" as const },
  ];

  return logs;
};

export const ScanningScreen = ({ onComplete }: ScanningScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<Array<{ text: string; type: "info" | "warning" | "critical" }>>([]);
  const [warnings, setWarnings] = useState(0);
  const [critical, setCritical] = useState(0);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const allLogs = generateScanLogs();
    const totalSteps = allLogs.length;
    let currentStep = 0;

    const interval = setInterval(() => {
      if (currentStep < totalSteps) {
        const currentLog = allLogs[currentStep];
        setLogs((prev) => [...prev, currentLog]);
        
        if (currentLog.type === "warning") {
          setWarnings((prev) => prev + 1);
        } else if (currentLog.type === "critical") {
          setCritical((prev) => prev + 1);
        }

        setProgress(Math.round(((currentStep + 1) / totalSteps) * 100));
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          onComplete({
            totalIssues: warnings + critical,
            criticalIssues: critical,
            logs: allLogs,
          });
        }, 1000);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="animate-fade-in">
      <div className="bg-card border border-border rounded-lg p-8 glow-border">
        <h2 className="text-3xl font-bold mb-6 text-center text-shadow-neon">
          Varredura em Andamento
        </h2>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-secondary/50 p-4 rounded border border-border text-center">
            <div className="flex items-center justify-center mb-2">
              <Info className="w-5 h-5 text-primary mr-2" />
              <span className="text-sm text-muted-foreground">Progresso</span>
            </div>
            <div className="text-3xl font-bold text-primary">{progress}%</div>
          </div>
          <div className="bg-secondary/50 p-4 rounded border border-warning glow-warning text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="w-5 h-5 text-warning mr-2" />
              <span className="text-sm text-muted-foreground">Alertas</span>
            </div>
            <div className="text-3xl font-bold text-warning">{warnings}</div>
          </div>
          <div className="bg-secondary/50 p-4 rounded border border-destructive glow-critical text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertCircle className="w-5 h-5 text-destructive mr-2" />
              <span className="text-sm text-muted-foreground">Críticos</span>
            </div>
            <div className="text-3xl font-bold text-destructive">{critical}</div>
          </div>
        </div>

        <div className="mb-6">
          <Progress value={progress} className="h-3" />
        </div>

        <div className="bg-secondary/30 rounded border border-border p-4 h-96 overflow-y-auto font-mono text-sm">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`mb-2 flex items-start gap-2 animate-fade-in ${
                log.type === "warning"
                  ? "text-warning"
                  : log.type === "critical"
                  ? "text-destructive font-semibold"
                  : "text-foreground/80"
              }`}
            >
              <span className="text-muted-foreground">[{String(index + 1).padStart(2, "0")}]</span>
              {log.type === "warning" && <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
              {log.type === "critical" && <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
              <span>{log.text}</span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};
