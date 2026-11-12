import { Route, Routes } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { AppShell } from "./components/AppShell";
import { PageTransition, ZoomTransition } from "./components/PageTransition";
import HomePage from "./features/dashboard/HomePage";
import SearchPage from "./features/search/SearchPage";
import CollectionPage from "./features/collection/CollectionPage";
import WishlistPage from "./features/wishlist/WishlistPage";
import SetsPage from "./features/sets/SetsPage";
import SetDetailPage from "./features/sets/SetDetailPage";
import CardPage from "./features/card/CardPage";
import SettingsPage from "./features/settings/SettingsPage";

/**
 * Routage de l'application. Les URLs sont en français pour rester cohérents
 * avec l'interface (section 1).
 */
export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<PageTransition><HomePage /></PageTransition>} />
          <Route path="recherche" element={<PageTransition><SearchPage /></PageTransition>} />
          <Route path="collection" element={<PageTransition><CollectionPage /></PageTransition>} />
          <Route path="wishlist" element={<PageTransition><WishlistPage /></PageTransition>} />
          <Route path="sets" element={<PageTransition><SetsPage /></PageTransition>} />
          <Route path="set/:id" element={<PageTransition><SetDetailPage /></PageTransition>} />
          {/* Fiche carte : /carte/{id TCGdex} — zoom transition */}
          <Route
            path="carte/:id"
            element={
              <PageTransition>
                <ZoomTransition>
                  <CardPage />
                </ZoomTransition>
              </PageTransition>
            }
          />
          {/* Réglages : thème, export/import */}
          <Route path="reglages" element={<PageTransition><SettingsPage /></PageTransition>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}
