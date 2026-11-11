import { Moon, Sun } from "lucide-react";
import { useTheme } from "../lib/theme";
import { t } from "../i18n";

/**
 * Bouton de bascule du thème (fonctionnalité 10 de la spec).
 * Le choix est mémorisé par le hook useTheme (localStorage).
 */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? t.theme.toLight : t.theme.toDark}
      title={isDark ? t.theme.toLight : t.theme.toDark}
      className="flex h-11 w-11 items-center justify-center rounded-standard border border-line bg-surface text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
    >
      {isDark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
}
