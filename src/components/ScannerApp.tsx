import { useState } from "react";
import { ScanningScreen } from "./scanner/ScanningScreen";
import { ResultScreen } from "./scanner/ResultScreen";

type AppState = "scanning" | "result";

export interface ScanResult {
  totalIssues: number;
  criticalIssues: number;
  logs: Array<{ text: string; type: "info" | "warning" | "critical"; category?: string }>;
}

export const ScannerApp = () => {
  const [appState, setAppState] = useState<AppState>("scanning");
  const [scanResult, setScanResult] = useState<ScanResult>({
    totalIssues: 0,
    criticalIssues: 0,
    logs: [],
  });

  const handleScanComplete = (result: ScanResult) => {
    setScanResult(result);
    setAppState("result");
  };

  const handleRestart = () => {
    setAppState("scanning");
    setScanResult({
      totalIssues: 0,
      criticalIssues: 0,
      logs: [],
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {appState === "scanning" && <ScanningScreen onComplete={handleScanComplete} />}
        {appState === "result" && <ResultScreen result={scanResult} onRestart={handleRestart} />}
      </div>
    </div>
  );
};
