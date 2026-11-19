import { useCallback, useEffect, useState } from "react";

/** Thèmes disponibles. Le sombre est le défaut (section 6 de la spec). */
export type Theme = "dark" | "light";

const STORAGE_KEY = "popo:theme";

/** Couleur de la barre système du téléphone, synchronisée avec le thème. */
const THEME_COLOR: Record<Theme, string> = {
  dark: "#0c0e18",
  light: "#f5f6f9",
};

/** Lit le thème courant depuis l'attribut posé par le script inline de index.html. */
function readInitialTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

/**
 * Hook de thème : applique l'attribut sur <html>, mémorise le choix dans
 * localStorage et met à jour la couleur de la barre système.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* stockage indisponible : le choix ne sera juste pas mémorisé */
    }
    document
      .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
      .forEach((meta) => (meta.content = THEME_COLOR[theme]));
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  return { theme, toggle };
}
