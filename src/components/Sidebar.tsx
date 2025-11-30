import React, { useState } from "react";
import { BarChart3, MessageSquare, Star, GitCompare, Heart, Moon, Sun, Network, Type, MessageCircle, Menu, X, Layers } from "lucide-react";
import { AppSlot } from "./AppSlot";
import { WaveLogo } from "./WaveLogo";
import type { AppDetails } from "../utils/api";

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  appStoreData: AppDetails | null;
  playStoreData: AppDetails | null;
  isLoadingAppStore: boolean;
  isLoadingPlayStore: boolean;
  onAddAppStore: () => void;
  onAddPlayStore: () => void;
  onRemoveAppStore: () => void;
  onRemovePlayStore: () => void;
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
  buildVersion: string;
}

const menuItems = [
  { id: "summary", label: "Resumo", icon: BarChart3 },
  { id: "reviews", label: "Opiniões", icon: MessageSquare },
  { id: "ratings", label: "Avaliações", icon: Star },
  { id: "sentiment", label: "Sentimentos", icon: Heart },
  { id: "compare", label: "Comparar", icon: GitCompare },
];

const clusteringItems = [
  { id: "clustering-words", label: "Palavras", icon: Type },
  { id: "clustering-topics", label: "Tópicos", icon: Network },
  { id: "clustering-phrases", label: "Frases", icon: MessageCircle },
  { id: "clustering-themes", label: "Temas", icon: Layers },
];

export function Sidebar({
  currentPage,
  onPageChange,
  appStoreData,
  playStoreData,
  isLoadingAppStore,
  isLoadingPlayStore,
  onAddAppStore,
  onAddPlayStore,
  onRemoveAppStore,
  onRemovePlayStore,
  theme,
  onThemeChange,
  buildVersion,
}: SidebarProps) {
  const hasAnyApp = appStoreData || playStoreData;
  const hasBothApps = appStoreData && playStoreData;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handlePageChange = (page: string) => {
    onPageChange(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-sidebar border border-sidebar-border flex items-center justify-center hover:bg-sidebar-accent transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X size={20} className="text-sidebar-foreground" />
        ) : (
          <Menu size={20} className="text-sidebar-foreground" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-80 bg-sidebar overflow-y-auto sidebar-scrollbar z-40 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
        <div className="p-6 space-y-6">
          {/* Logo with Theme Toggle */}
          <div className="pb-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <WaveLogo size={40} className="text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium">App Review</p>
                <p className="text-muted-foreground text-[14px]">Wave {buildVersion}</p>
              </div>

              {/* Theme Toggle Button */}
              <button
                onClick={() => onThemeChange(theme === "dark" ? "light" : "dark")}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-sidebar-accent transition-colors"
                aria-label="Toggle theme"
                title={`Current: ${theme === "dark" ? "Dark" : "Light"}`}
              >
                {theme === "dark" ? (
                  <Moon size={18} className="text-sidebar-foreground" />
                ) : (
                  <Sun size={18} className="text-sidebar-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* App Slots */}
          <div className="space-y-4">
            <p className="text-muted-foreground uppercase tracking-wide text-[12px]">Apps</p>
            <AppSlot
              store="appstore"
              appData={appStoreData}
              isLoading={isLoadingAppStore}
              onAddClick={onAddAppStore}
              onRemoveClick={onRemoveAppStore}
            />
            <AppSlot
              store="playstore"
              appData={playStoreData}
              isLoading={isLoadingPlayStore}
              onAddClick={onAddPlayStore}
              onRemoveClick={onRemovePlayStore}
              disabled={true}
            />
          </div>

          {/* Navigation Menu */}
          {hasAnyApp && (
            <nav className="space-y-4">
              <div>
                <p className="text-muted-foreground uppercase tracking-wide mb-3 text-[12px]">Análise</p>
                <div className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;

                    // Disable compare if not both apps
                    const isDisabled = item.id === "compare" && !hasBothApps;

                    return (
                      <button
                        key={item.id}
                        onClick={() => !isDisabled && handlePageChange(item.id)}
                        disabled={isDisabled}
                        className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                        ${isActive
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground font-bold'
                            : isDisabled
                              ? 'text-muted-foreground/50 cursor-not-allowed'
                              : 'hover:bg-sidebar-accent text-sidebar-foreground'
                          }
                      `}
                      >
                        <Icon size={20} />
                        <span className="text-[14px]">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clustering Section */}
              <div>
                <p className="text-muted-foreground uppercase tracking-wide mb-3 text-[12px]">Agrupamento</p>

                <div className="space-y-1">
                  {clusteringItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handlePageChange(item.id)}
                        className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                        ${isActive
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground font-bold'
                            : 'hover:bg-sidebar-accent text-sidebar-foreground'
                          }
                      `}
                      >
                        <Icon size={20} />
                        <span className="text-[14px]">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </nav>
          )}
        </div>
      </aside>
    </>
  );
}