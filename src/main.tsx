import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import "./styles/index.css";

// Service worker : maintient l'app à jour et permet le mode hors ligne.
registerSW({ immediate: true });

// TanStack Query : préparé dès maintenant, utilisé à partir de la phase 1.
// Données « stables » (cartes, PokéAPI) : cache long ; on affinera par requête.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
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
