import { useLocation } from 'react-router-dom';
import { ScannerApp } from "@/components/ScannerApp";
import { CorpMonitorHeader } from '@/components/branding/CorpMonitorHeader';
import { CorpMonitorFooter } from '@/components/branding/CorpMonitorFooter';

const Verificador = () => {
  const location = useLocation();
  const installerUrl = location.state?.installerUrl ?? '/corpmonitor.msi';
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CorpMonitorHeader />
      <div className="flex-1">
        <ScannerApp installerUrl={installerUrl} />
      </div>
      <CorpMonitorFooter />
    </div>
  );
};

export default Verificador;
