import React, { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { SummaryPage } from "./components/SummaryPage";
import { ReviewsPageNew } from "./components/ReviewsPageNew";
import { RatingsPage } from "./components/RatingsPage";
import { SentimentPage } from "./components/SentimentPage";
import { ClusteringWordsPage } from "./components/ClusteringWordsPage";
import { ClusteringTopicsPage } from "./components/ClusteringTopicsPage";
import { ClusteringPhrasesPage } from "./components/ClusteringPhrasesPage";
import { ClusteringThemesPage } from "./components/ClusteringThemesPage";
import { ComparisonView } from "./components/ComparisonView";
import { AddAppDialog } from "./components/AddAppDialog";
import { ServerStatusBanner } from "./components/ServerStatusBanner";
import {
  getAppDetails,
  AppResult,
  AppDetails,
} from "./utils/api";
import { Card } from "./components/ui/card";

type Page =
  | "summary"
  | "reviews"
  | "ratings"
  | "sentiment"
  | "clustering-words"
  | "clustering-topics"
  | "clustering-phrases"
  | "clustering-themes"
  | "compare";

export default function App() {
  const [currentPage, setCurrentPage] =
    useState<Page>("summary");
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    const saved = localStorage.getItem("theme");
    return (saved as "light" | "dark" | "system") || "system";
  });
  const [isUserOverride, setIsUserOverride] = useState(() => {
    return localStorage.getItem("theme") !== null;
  });
  const [actualTheme, setActualTheme] = useState<"light" | "dark">(() => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme;
  });

  // App slots
  const [appStoreData, setAppStoreData] =
    useState<AppDetails | null>(null);
  const [playStoreData, setPlayStoreData] =
    useState<AppDetails | null>(null);

  // Loading states
  const [isLoadingAppStore, setIsLoadingAppStore] =
    useState(false);
  const [isLoadingPlayStore, setIsLoadingPlayStore] =
    useState(false);

  // Dialog states
  const [showAppStoreDialog, setShowAppStoreDialog] =
    useState(false);
  const [showPlayStoreDialog, setShowPlayStoreDialog] =
    useState(false);

  // Function to get the actual theme (resolves system preference)
  const getActualTheme = (): "light" | "dark" => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme;
  };

  // Function to apply theme to document
  const applyTheme = () => {
    const currentActualTheme = getActualTheme();
    setActualTheme(currentActualTheme);
    if (currentActualTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    // Apply theme on mount and when theme changes
    applyTheme();
    
    // Listen for system theme changes when using system preference
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    setIsUserOverride(true);
    localStorage.setItem("theme", newTheme);
    applyTheme();
  };

  const handleAppStoreSelect = async (app: AppResult) => {
    setIsLoadingAppStore(true);
    try {
      const appData = await getAppDetails(app.store, app.id);
      setAppStoreData(appData);
      setShowAppStoreDialog(false);
    } catch (err) {
      console.error("Error loading app:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Failed to load app data",
      );
    } finally {
      setIsLoadingAppStore(false);
    }
  };

  const handlePlayStoreSelect = async (app: AppResult) => {
    setIsLoadingPlayStore(true);
    try {
      const appData = await getAppDetails(app.store, app.id);
      setPlayStoreData(appData);
      setShowPlayStoreDialog(false);
    } catch (err) {
      console.error("Error loading app:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Failed to load app data",
      );
    } finally {
      setIsLoadingPlayStore(false);
    }
  };

  const hasAnyApp = appStoreData || playStoreData;

  return (
    <div className="min-h-screen w-full bg-background flex">
      {/* Server Status Banner */}
      <ServerStatusBanner />

      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onPageChange={(page) => setCurrentPage(page as Page)}
        appStoreData={appStoreData}
        playStoreData={playStoreData}
        isLoadingAppStore={isLoadingAppStore}
        isLoadingPlayStore={isLoadingPlayStore}
        onAddAppStore={() => setShowAppStoreDialog(true)}
        onAddPlayStore={() => setShowPlayStoreDialog(true)}
        onRemoveAppStore={() => setAppStoreData(null)}
        onRemovePlayStore={() => setPlayStoreData(null)}
        theme={actualTheme}
        onThemeChange={handleThemeChange}
      />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 mt-[80px] mx-2 mb-2 lg:mt-[16px] lg:mr-[16px] lg:mb-[16px] lg:ml-[336px] rounded-lg lg:rounded-[16px] bg-card border border-border/50 h-[calc(100vh-84px)] lg:h-[calc(100vh-32px)] overflow-y-auto main-scrollbar">
        <div className="max-w-[1200px] mx-auto">
          {!hasAnyApp ? (
            <div className="space-y-6">
              <div>
                <h1>Boas-vindas</h1>
                <p className="text-muted-foreground mt-2">
                  Comece adicionando um app pela barra lateral
                </p>
              </div>
              <Card className="p-12 rounded-2xl text-center">
                <h3 className="mb-2">Nenhum App Adicionado</h3>
                <p className="text-muted-foreground">
                  Use a barra lateral para adicionar apps da App
                  Store e começar a analisar reviews
                </p>
              </Card>
            </div>
          ) : (
            <>
              {currentPage === "summary" && (
                <SummaryPage
                  appStoreData={appStoreData}
                  playStoreData={playStoreData}
                />
              )}
              {currentPage === "reviews" && (
                <ReviewsPageNew
                  appStoreData={appStoreData}
                  playStoreData={playStoreData}
                />
              )}
              {currentPage === "ratings" && (
                <RatingsPage
                  appStoreData={appStoreData}
                  playStoreData={playStoreData}
                />
              )}
              {currentPage === "sentiment" && (
                <SentimentPage
                  appStoreData={appStoreData}
                  playStoreData={playStoreData}
                />
              )}
              {currentPage === "clustering-words" && (
                <ClusteringWordsPage
                  appStoreData={appStoreData}
                  playStoreData={playStoreData}
                />
              )}
              {currentPage === "clustering-topics" && (
                <ClusteringTopicsPage
                  appStoreData={appStoreData}
                  playStoreData={playStoreData}
                />
              )}
              {currentPage === "clustering-phrases" && (
                <ClusteringPhrasesPage
                  appStoreData={appStoreData}
                  playStoreData={playStoreData}
                />
              )}
              {currentPage === "clustering-themes" && (
                <ClusteringThemesPage
                  appStoreData={appStoreData}
                  playStoreData={playStoreData}
                />
              )}
              {currentPage === "compare" && (
                <div className="space-y-6">
                  <div>
                    <h1>Comparar</h1>
                    <p className="text-muted-foreground mt-2">
                      Comparação lado a lado de ambos os apps
                    </p>
                  </div>
                  <ComparisonView
                    appStoreData={appStoreData}
                    playStoreData={playStoreData}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Add App Dialogs */}
      <AddAppDialog
        open={showAppStoreDialog}
        onClose={() => setShowAppStoreDialog(false)}
        store="appstore"
        onAppSelect={handleAppStoreSelect}
      />
      <AddAppDialog
        open={showPlayStoreDialog}
        onClose={() => setShowPlayStoreDialog(false)}
        store="playstore"
        onAppSelect={handlePlayStoreSelect}
      />
    </div>
  );
}