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
        categories: ["entertainment", "utilities"],
        screenshots: [],
        shortcuts: [
          {
            name: "Rechercher une carte",
            short_name: "Recherche",
            description: "Ouvre la recherche de cartes",
            url: "/recherche",
            icons: [{ src: "pwa-192x192.png", sizes: "192x192" }],
          },
          {
            name: "Ma collection",
            short_name: "Collection",
            description: "Affiche ta collection",
            url: "/collection",
            icons: [{ src: "pwa-192x192.png", sizes: "192x192" }],
          },
        ],
        icons: [
          { src: "pwa-72x72.png", sizes: "72x72", type: "image/png", purpose: "any" },
          { src: "pwa-96x96.png", sizes: "96x96", type: "image/png", purpose: "any" },
          { src: "pwa-128x128.png", sizes: "128x128", type: "image/png", purpose: "any" },
          { src: "pwa-144x144.png", sizes: "144x144", type: "image/png", purpose: "any" },
          { src: "pwa-152x152.png", sizes: "152x152", type: "image/png", purpose: "any" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "pwa-384x384.png", sizes: "384x384", type: "image/png", purpose: "any" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          {
            src: "pwa-512x512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,webp,woff2}"],
        navigateFallback: "/index.html",
        // Cache des images distantes : indispensable pour consulter sa
        // collection hors ligne (les visuels viennent du CDN TCGdex et des
        // sprites PokéAPI). CacheFirst : une image ne change jamais.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/assets\.tcgdex\.net\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "tcgdex-images",
              expiration: { maxEntries: 600, maxAgeSeconds: 30 * 24 * 3600 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/PokeAPI\/sprites\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "pokeapi-sprites",
              expiration: { maxEntries: 300, maxAgeSeconds: 30 * 24 * 3600 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
