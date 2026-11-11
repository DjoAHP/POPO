import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// Sous WSL avec le projet sur /mnt/c, inotify ne signale pas les
// modifications de fichiers : le serveur de dev ne voit pas les changements.
// On active le polling uniquement dans ce cas (Linux), pas sur Windows.
const onWsl = process.platform === "linux";

// Configuration Vite : React, Tailwind v4 et la PWA (manifeste + service worker).
export default defineConfig({
  server: {
    watch: onWsl ? { usePolling: true, interval: 500 } : undefined,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        id: "/",
        name: "POPO — Collection Pokémon",
        short_name: "POPO",
        description:
          "Recherche de cartes Pokémon, comparaison des prix et collection personnelle, en français.",
        lang: "fr",
        dir: "ltr",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        theme_color: "#0e131d",
        background_color: "#0e131d",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallback: "/index.html",
      },
    }),
  ],
});
