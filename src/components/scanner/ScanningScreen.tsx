import { useState, useEffect, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { ScanResult } from "../ScannerApp";
import { T } from "@/components/T";

interface ScanningScreenProps {
  onComplete: (result: ScanResult) => void;
}

const generateScanLogs = () => {
  const logs = [
    // Inicialização
    { text: "Iniciando verificação do sistema...", type: "info" as const, category: "system" },
    { text: "Carregando módulos de diagnóstico...", type: "info" as const, category: "system" },
    
    // Kernel e Sistema Operacional
    { text: "Verificando versão do kernel Linux 5.4.0-152...", type: "info" as const, category: "kernel" },
    { text: "Analisando módulos do kernel carregados...", type: "info" as const, category: "kernel" },
    { text: "[CRÍTICO] Kernel desatualizado - CVE-2023-32629 não corrigido", type: "critical" as const, category: "kernel" },
    { text: "Verificando integridade de arquivos do sistema...", type: "info" as const, category: "kernel" },
    { text: "[ALERTA] 3 arquivos críticos do sistema modificados em /lib/modules", type: "warning" as const, category: "kernel" },
    
    // Permissões e Arquivos
    { text: "Analisando permissões de diretórios críticos...", type: "info" as const, category: "permissions" },
    { text: "[CRÍTICO] Diretório /etc/shadow com permissões 644 (deve ser 600)", type: "critical" as const, category: "permissions" },
    { text: "[ALERTA] Arquivo /var/www/html/.env exposto publicamente", type: "warning" as const, category: "permissions" },
    { text: "Verificando proprietários de arquivos de configuração...", type: "info" as const, category: "permissions" },
    { text: "[ALERTA] 12 arquivos em /tmp com permissões inseguras (777)", type: "warning" as const, category: "permissions" },
    
    // Serviços e Processos
    { text: "Verificando serviços em execução...", type: "info" as const, category: "services" },
    { text: "Detectados 47 processos ativos no sistema", type: "info" as const, category: "services" },
    { text: "[ALERTA] Serviço SSH usando porta padrão 22", type: "warning" as const, category: "services" },
    { text: "[CRÍTICO] Serviço Telnet ativo na porta 23 (protocolo inseguro)", type: "critical" as const, category: "services" },
    { text: "Analisando uso de memória e CPU...", type: "info" as const, category: "services" },
    { text: "[ALERTA] Processo desconhecido 'cryptominer' consumindo 85% CPU", type: "warning" as const, category: "services" },
    
    // Portas e Rede
    { text: "Escaneando portas abertas no host 192.168.1.100...", type: "info" as const, category: "network" },
    { text: "Detectadas 15 portas abertas", type: "info" as const, category: "network" },
    { text: "[CRÍTICO] Porta de administração 8080 exposta sem autenticação", type: "critical" as const, category: "network" },
    { text: "[CRÍTICO] Porta MySQL 3306 acessível externamente", type: "critical" as const, category: "network" },
    { text: "[ALERTA] Porta FTP 21 aberta (protocolo não criptografado)", type: "warning" as const, category: "network" },
    { text: "[ALERTA] Porta Redis 6379 sem autenticação configurada", type: "warning" as const, category: "network" },
    { text: "Analisando tráfego de rede...", type: "info" as const, category: "network" },
    { text: "[ALERTA] Detectadas 237 conexões de saída para IPs suspeitos", type: "warning" as const, category: "network" },
    
    // Certificados SSL/TLS
    { text: "Verificando certificados SSL/TLS...", type: "info" as const, category: "ssl" },
    { text: "[CRÍTICO] Certificado SSL expirado há 45 dias (*.exemplo.com)", type: "critical" as const, category: "ssl" },
    { text: "[ALERTA] Certificado SSL expira em 15 dias (api.exemplo.com)", type: "warning" as const, category: "ssl" },
    { text: "[ALERTA] Protocolo TLS 1.0 ainda habilitado (vulnerável)", type: "warning" as const, category: "ssl" },
    { text: "Verificando cifras SSL suportadas...", type: "info" as const, category: "ssl" },
    { text: "[ALERTA] Cifras fracas detectadas: RC4, 3DES", type: "warning" as const, category: "ssl" },
    
    // Firewall e Segurança de Rede
    { text: "Analisando configurações de firewall...", type: "info" as const, category: "firewall" },
    { text: "[CRÍTICO] Firewall desabilitado ou com regras muito permissivas", type: "critical" as const, category: "firewall" },
    { text: "[ALERTA] 8 regras de firewall com origem 0.0.0.0/0", type: "warning" as const, category: "firewall" },
    { text: "Verificando proteção contra DDoS...", type: "info" as const, category: "firewall" },
    { text: "[ALERTA] Nenhuma proteção contra ataques DDoS configurada", type: "warning" as const, category: "firewall" },
    
    // Updates e Patches
    { text: "Verificando atualizações de segurança...", type: "info" as const, category: "updates" },
    { text: "[CRÍTICO] 18 atualizações críticas de segurança pendentes", type: "critical" as const, category: "updates" },
    { text: "[CRÍTICO] Sistema operacional sem patches há 127 dias", type: "critical" as const, category: "updates" },
    { text: "[ALERTA] Última atualização do sistema: 2024-06-15", type: "warning" as const, category: "updates" },
    
    // Logs de Sistema
    { text: "Analisando logs de sistema (/var/log)...", type: "info" as const, category: "logs" },
    { text: "[CRÍTICO] 1.247 tentativas de acesso SSH com falha nas últimas 24h", type: "critical" as const, category: "logs" },
    { text: "[ALERTA] 89 tentativas de escalação de privilégios detectadas", type: "warning" as const, category: "logs" },
    { text: "[ALERTA] Logs de auditoria não configurados (ausente auditd)", type: "warning" as const, category: "logs" },
    { text: "Verificando rotação de logs...", type: "info" as const, category: "logs" },
    { text: "[ALERTA] Logs de sistema ocupando 4.2GB sem rotação", type: "warning" as const, category: "logs" },
    
    // Banco de Dados
    { text: "Verificando integridade de banco de dados...", type: "info" as const, category: "database" },
    { text: "[CRÍTICO] Backup do banco de dados PostgreSQL desatualizado (127 dias)", type: "critical" as const, category: "database" },
    { text: "[CRÍTICO] Senha padrão detectada no usuário 'postgres'", type: "critical" as const, category: "database" },
    { text: "[ALERTA] Banco MySQL acessível sem SSL/TLS", type: "warning" as const, category: "database" },
    { text: "Analisando índices e performance...", type: "info" as const, category: "database" },
    { text: "[ALERTA] 15 consultas lentas detectadas (>5s)", type: "warning" as const, category: "database" },
    
    // Dependências de Software
    { text: "Escaneando dependências de software...", type: "info" as const, category: "dependencies" },
    { text: "[CRÍTICO] OpenSSL 1.0.2k vulnerável (CVE-2023-0286)", type: "critical" as const, category: "dependencies" },
    { text: "[CRÍTICO] Apache 2.4.29 com vulnerabilidade conhecida (CVE-2023-25690)", type: "critical" as const, category: "dependencies" },
    { text: "[ALERTA] 23 pacotes NPM desatualizados com vulnerabilidades", type: "warning" as const, category: "dependencies" },
    { text: "[ALERTA] Python 3.6 sem suporte oficial desde 2021", type: "warning" as const, category: "dependencies" },
    { text: "Verificando bibliotecas compartilhadas...", type: "info" as const, category: "dependencies" },
    
    // Malware e Ameaças
    { text: "Escaneando malware e ameaças...", type: "info" as const, category: "malware" },
    { text: "[CRÍTICO] Script malicioso detectado em /var/www/html/uploads/shell.php", type: "critical" as const, category: "malware" },
    { text: "[ALERTA] 3 arquivos suspeitos na quarentena", type: "warning" as const, category: "malware" },
    { text: "Verificando assinaturas de vírus...", type: "info" as const, category: "malware" },
    
    // Usuários e Senhas
    { text: "Verificando políticas de senha...", type: "info" as const, category: "users" },
    { text: "[CRÍTICO] 4 contas de usuário sem senha configurada", type: "critical" as const, category: "users" },
    { text: "[ALERTA] Senhas fracas detectadas em 7 contas de usuário", type: "warning" as const, category: "users" },
    { text: "[ALERTA] Usuário 'admin' com senha '123456'", type: "warning" as const, category: "users" },
    { text: "Analisando contas privilegiadas...", type: "info" as const, category: "users" },
    { text: "[CRÍTICO] 2 contas com UID 0 além do root", type: "critical" as const, category: "users" },
    { text: "[ALERTA] 5 contas de usuário inativas há mais de 90 dias", type: "warning" as const, category: "users" },
    
    // Aplicações Web
    { text: "Verificando segurança de aplicações web...", type: "info" as const, category: "webapp" },
    { text: "[CRÍTICO] HTTPS não configurado - site usando HTTP puro", type: "critical" as const, category: "webapp" },
    { text: "[ALERTA] Headers de segurança ausentes (CSP, X-Frame-Options)", type: "warning" as const, category: "webapp" },
    { text: "[ALERTA] CORS configurado com wildcard (*) muito permissivo", type: "warning" as const, category: "webapp" },
    { text: "Testando proteção contra injeções...", type: "info" as const, category: "webapp" },
    
    // Containers e Virtualização
    { text: "Analisando containers Docker...", type: "info" as const, category: "containers" },
    { text: "[CRÍTICO] 3 containers rodando como root", type: "critical" as const, category: "containers" },
    { text: "[ALERTA] Imagem Docker 'nginx:latest' desatualizada há 8 meses", type: "warning" as const, category: "containers" },
    { text: "Verificando volumes e redes...", type: "info" as const, category: "containers" },
    
    // Finalização
    { text: "Compilando dados de segurança...", type: "info" as const, category: "system" },
    { text: "Finalizando varredura de vulnerabilidades...", type: "info" as const, category: "system" },
    { text: "Gerando relatório detalhado de diagnóstico...", type: "info" as const, category: "system" },
    { text: "Análise completa - 78 verificações realizadas", type: "info" as const, category: "system" },
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
          const criticalCount = allLogs.filter(log => log.type === "critical").length;
          const warningCount = allLogs.filter(log => log.type === "warning").length;
          
          onComplete({
            totalIssues: warningCount + criticalCount,
            criticalIssues: criticalCount,
            logs: allLogs,
          });
        }, 1000);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="animate-fade-in">
      <div className="bg-card border border-border rounded-lg p-8 glow-border">
        <h2 className="text-3xl font-bold mb-6 text-center text-shadow-neon">
          <T>Varredura em Andamento</T>
        </h2>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-secondary/50 p-4 rounded border border-border text-center">
            <div className="flex items-center justify-center mb-2">
              <Info className="w-5 h-5 text-primary mr-2" />
              <span className="text-sm text-muted-foreground"><T>Progresso</T></span>
            </div>
            <div className="text-3xl font-bold text-primary">{progress}%</div>
          </div>
          <div className="bg-secondary/50 p-4 rounded border border-warning glow-warning text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="w-5 h-5 text-warning mr-2" />
              <span className="text-sm text-muted-foreground"><T>Alertas</T></span>
            </div>
            <div className="text-3xl font-bold text-warning">{warnings}</div>
          </div>
          <div className="bg-secondary/50 p-4 rounded border border-destructive glow-critical text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertCircle className="w-5 h-5 text-destructive mr-2" />
              <span className="text-sm text-muted-foreground"><T>Críticos</T></span>
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
