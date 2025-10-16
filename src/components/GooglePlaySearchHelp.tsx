import { Alert, AlertDescription } from "./ui/alert";
import { Info } from "lucide-react";

export function GooglePlaySearchHelp() {
  return (
    <Alert className="rounded-2xl bg-blue-500/10 border-blue-500/20">
      <Info size={18} className="text-blue-500" />
      <AlertDescription>
        <p className="mb-2"><strong>Dica:</strong> Para Google Play, você pode buscar por:</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Package ID</strong> (recomendado): ex: <code className="bg-muted px-1 py-0.5 rounded">br.com.sabesp.android</code></li>
          <li><strong>Nome do app</strong>: ex: "Sabesp Mobile"</li>
        </ul>
        <p className="mt-3 text-sm">
          💡 Encontre o package ID abrindo o app no Google Play pelo navegador e olhando a URL: 
        </p>
        <code className="bg-muted px-2 py-1 rounded text-xs block mt-1 break-all">
          play.google.com/store/apps/details?id=<strong className="text-blue-600">br.com.sabesp.android.sabespmobile</strong>
        </code>
      </AlertDescription>
    </Alert>
  );
}
