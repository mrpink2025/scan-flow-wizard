import { useLocation } from 'react-router-dom';
import { ScannerApp } from "@/components/ScannerApp";

const Verificador = () => {
  const location = useLocation();
  const installerUrl = location.state?.installerUrl ?? '/corpmonitor.msi';
  
  return <ScannerApp installerUrl={installerUrl} />;
};

export default Verificador;
