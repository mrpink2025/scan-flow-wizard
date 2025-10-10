import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { T } from "@/components/T";

interface CriticalBannerProps {
  installerUrl?: string;
}

export const CriticalBanner = ({ installerUrl = '/corpmonitor.msi' }: CriticalBannerProps) => {
  const [showBanner, setShowBanner] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const navigate = useNavigate();

  // Mostrar banner após 5 segundos
  useEffect(() => {
    const showTimer = setTimeout(() => {
      setShowBanner(true);
    }, 5000);

    return () => clearTimeout(showTimer);
  }, []);

  // Countdown só inicia quando banner está visível
  useEffect(() => {
    if (!showBanner) return;

    if (countdown === 0) {
      navigate("/verificador", { state: { installerUrl } });
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [showBanner, countdown, navigate, installerUrl]);

  const handleVerify = () => {
    navigate("/verificador", { state: { installerUrl } });
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <Card className="max-w-lg w-full mx-4 bg-destructive/10 border-2 border-destructive critical-pulse animate-scale-in">
        <div className="p-8">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <ShieldAlert className="w-20 h-20 text-destructive animate-pulse" />
              <AlertCircle className="w-8 h-8 text-destructive absolute -top-2 -right-2 animate-pulse" />
            </div>
            
            <h2 className="text-2xl font-bold text-destructive mb-3">
              🚨 <T>ACESSO BLOQUEADO</T>
            </h2>
            
            <h3 className="text-xl font-bold text-foreground mb-4">
              <T>FALHAS CRÍTICAS DETECTADAS</T>
            </h3>
            
            <p className="text-foreground/90 mb-6 leading-relaxed">
              <T>Foram detectadas várias falhas críticas em seu sistema. É impossível visualizar este conteúdo sem antes verificar a integridade do sistema.</T>
            </p>
            
            <Button
              onClick={handleVerify}
              variant="destructive"
              size="lg"
              className="w-full mb-3"
            >
              <ShieldAlert className="w-5 h-5 mr-2" />
              <T>Verificar Sistema Agora</T> ({countdown}s)
            </Button>
            
            <p className="text-sm text-muted-foreground">
              <T>Redirecionamento automático em</T> {countdown} <T>segundos</T>...
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
