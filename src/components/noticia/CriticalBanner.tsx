import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CriticalBanner = () => {
  const [countdown, setCountdown] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown === 0) {
      navigate("/verificador");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, navigate]);

  const handleVerify = () => {
    navigate("/verificador");
  };

  return (
    <div className="bg-destructive/20 border-2 border-destructive critical-pulse sticky top-0 z-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-8 h-8 text-destructive flex-shrink-0 animate-pulse" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-destructive mb-2">
              FALHAS CRÍTICAS DETECTADAS
            </h2>
            <p className="text-foreground mb-4">
              Foram encontradas várias falhas críticas em seu sistema. Para continuar, é necessário verificar a integridade do sistema.
            </p>
            <Button
              onClick={handleVerify}
              variant="destructive"
              size="lg"
              className="w-full sm:w-auto"
            >
              Verificar Sistema ({countdown}s)
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Redirecionamento automático em {countdown} segundos...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
