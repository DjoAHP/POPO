import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import "@fontsource-variable/outfit";
import "@fontsource-variable/inter";
import "./styles/index.css";

// Service worker : maintient l'app à jour et permet le mode hors ligne.
registerSW({ immediate: true });

// TanStack Query : préparé dès maintenant, utilisé à partir de la phase 1.
// Données « stables » (cartes, PokéAPI) : cache long ; on affinera par requête.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Hors ligne, inutile de réessayer : on affiche tout de suite l'état
      // d'erreur honnête (message « Tu es hors ligne ») plutôt que de faire
      // attendre l'utilisateur pendant les temporisations de réessai.
      retry: (failureCount) =>
        typeof navigator !== "undefined" && !navigator.onLine ? false : failureCount < 2,
      refetchOnWindowFocus: false,
      staleTime: 60 * 60 * 1000,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
