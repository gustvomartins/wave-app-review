import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { AppSearchBar } from "./AppSearchBar";
import { GooglePlaySearchHelp } from "./GooglePlaySearchHelp";
import { searchApps, AppResult } from "../utils/api";
import { Card } from "./ui/card";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface AddAppDialogProps {
  open: boolean;
  onClose: () => void;
  store: "appstore" | "playstore";
  onAppSelect: (app: AppResult) => void;
}

export function AddAppDialog({ open, onClose, store, onAppSelect }: AddAppDialogProps) {
  const [searchResults, setSearchResults] = useState<AppResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    setSearchResults([]);

    try {
      console.log("Searching for:", query, "in", store);
      const results = await searchApps(query, store);
      
      // Filter results by the selected store
      const filteredResults = results.filter(r => 
        store === "appstore" ? r.store === "App Store" : r.store === "Google Play"
      );
      
      setSearchResults(filteredResults);

      if (filteredResults.length === 0) {
        setError(`Nenhum app encontrado ${store === "appstore" ? "na App Store" : "no Google Play"}. Tente outro termo de busca.`);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(err instanceof Error ? err.message : "Falha ao buscar apps");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectApp = (app: AppResult) => {
    onAppSelect(app);
    onClose();
    setSearchResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle>
            Adicionar App {store === "appstore" ? "da App Store" : "do Google Play"}
          </DialogTitle>
          <DialogDescription>
            {store === "playstore" 
              ? "Busque por nome ou digite o package ID (ex: br.com.empresa.app)"
              : "Busque um app para adicionar e analisar seus reviews"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {store === "playstore" && <GooglePlaySearchHelp />}
          
          <AppSearchBar 
            onSearch={handleSearch} 
            placeholder={store === "playstore" 
              ? "Nome do app ou package ID (br.com.empresa.app)..." 
              : "Buscar app..."
            }
          />

          {error && (
            <Alert variant="destructive" className="rounded-2xl">
              <AlertCircle size={16} className="inline mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isSearching && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-3">
              {searchResults.map((app) => (
                <Card 
                  key={app.id} 
                  className="p-4 rounded-2xl hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => handleSelectApp(app)}
                >
                  <div className="flex items-center gap-4">
                    <img 
                      src={app.icon} 
                      alt={app.name}
                      className="w-12 h-12 rounded-xl shadow-sm"
                    />
                    <div className="flex-1">
                      <h4>{app.name}</h4>
                      <p className="text-muted-foreground">{app.developer}</p>
                    </div>
                    <ArrowRight size={20} className="text-muted-foreground" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
