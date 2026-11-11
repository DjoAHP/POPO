import { Outlet } from "react-router-dom";
import { TabBar } from "./TabBar";

/**
 * Coquille commune : fond, navigation, et zone de contenu.
 * - pb-28 : laisse la place à la barre d'onglets du bas (mobile) ;
 * - lg:pl-16 : décale le contenu à droite de la barre latérale (w-16 = 4rem).
 */
export function AppShell() {
  return (
    <div className="min-h-dvh bg-bg text-ink">
      <TabBar />
      <main className="pb-28 pt-6 lg:pb-12 lg:pl-16">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
