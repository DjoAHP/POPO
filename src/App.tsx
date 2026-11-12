import { Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
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
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="recherche" element={<SearchPage />} />
        <Route path="collection" element={<CollectionPage />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="sets" element={<SetsPage />} />
        <Route path="set/:id" element={<SetDetailPage />} />
        {/* Fiche carte : /carte/{id TCGdex} */}
        <Route path="carte/:id" element={<CardPage />} />
        {/* Réglages : thème, export/import */}
        <Route path="reglages" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
