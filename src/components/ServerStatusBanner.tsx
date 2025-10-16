import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { WifiOff, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { testServerConnection } from "../utils/api";

export function ServerStatusBanner() {
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkServer();
    // Check every 30 seconds
    const interval = setInterval(checkServer, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkServer = async () => {
    const result = await testServerConnection();
    setServerStatus(result.ok ? 'online' : 'offline');
    if (result.ok) {
      setDismissed(true); // Auto-dismiss when online
    }
  };

  if (serverStatus !== 'offline' || dismissed) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-2xl w-full px-4">
      <Alert className="rounded-2xl border-yellow-500/50 bg-yellow-500/10 shadow-lg">
        <WifiOff size={16} className="text-yellow-500" />
        <AlertDescription>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="mb-2">
                <strong>Backend server is offline</strong>
              </p>
              <p className="text-sm mb-3">
                The Supabase Edge Function needs to be deployed to enable app search and data fetching.
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={checkServer}
                  className="rounded-xl"
                >
                  <RefreshCw size={14} className="mr-2" />
                  Retry
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                  className="rounded-xl"
                >
                  <ExternalLink size={14} className="mr-2" />
                  Open Supabase
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setDismissed(true)}
                  className="rounded-xl"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
