import { useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  Database,
  Download,
  Heart,
  Library,
  Palette,
  Upload,
  Wallet,
} from "lucide-react";
import { BackLink } from "../../components/BackLink";
import { PageHeader } from "../../components/PageHeader";
import { BottomSheet } from "../../components/BottomSheet";
import { Button } from "../../components/ui/Button";
import { StatTile } from "../../components/ui/StatTile";
import { Surface } from "../../components/ui/Surface";
import { useTheme, type Theme } from "../../lib/theme";
import { db } from "../../db/database";
import { collectionValue } from "../../db/collection";
import {
  applyImport,
  downloadExport,
  getSyncDates,
  ImportValidationError,
  parseExport,
  type PopoExport,
} from "../../db/exportImport";
import { formatDate, formatEur } from "../../lib/format";
import { t } from "../../i18n";

/**
 * Écran Réglages (section 5) : thème avec aperçus, export/import de la
 * collection et résumé des données locales (docs/DESIGN.md §4.5).
 */
export default function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PopoExport | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { theme, toggle } = useTheme();
  const collection = useLiveQuery(() => db.collection.toArray(), []);
  const wishlist = useLiveQuery(() => db.wishlist.toArray(), []);
  const syncDates = useLiveQuery(() => getSyncDates(), []);

  const value = collectionValue(collection ?? []);

  /** Lecture du fichier choisi : validation AVANT toute écriture. */
  async function handleFile(file: File) {
    setError(null);
    setMessage(null);
    try {
      const text = await file.text();
      setPending(parseExport(text)); // montre la confirmation
    } catch (err) {
      setError(
        err instanceof ImportValidationError
          ? err.message
          : "Impossible de lire ce fichier.",
      );
    } finally {
      // Permet de re-sélectionner le même fichier plus tard.
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function confirmImport() {
    if (!pending) return;
    await applyImport(pending);
    setPending(null);
    setMessage(t.settings.importDone);
  }

  return (
    <div>
      <BackLink to="/" label={t.nav.home} />

      <PageHeader
        eyebrow={t.settings.eyebrow}
        title={t.settings.title}
        description={t.settings.description}
      />

      {/* Thème */}
      <SettingsSection
        icon={Palette}
        title={t.settings.appearanceTitle}
        text={t.settings.appearanceText}
      >
        <div className="mt-4 grid grid-cols-2 gap-3">
          <ThemePreview
            value="dark"
            label={t.theme.dark}
            active={theme === "dark"}
            onSelect={() => theme !== "dark" && toggle()}
          />
          <ThemePreview
            value="light"
            label={t.theme.light}
            active={theme === "light"}
            onSelect={() => theme !== "light" && toggle()}
          />
        </div>
      </SettingsSection>

      {/* Mes données */}
      <SettingsSection icon={Database} title={t.settings.dataTitle}>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatTile
            icon={Library}
            label={t.settings.dataCards}
            value={collection?.length ?? 0}
            tone="accent"
          />
          <StatTile
            icon={Wallet}
            label={t.settings.dataValue}
            value={formatEur(value.total)}
            tone="gold"
          />
          <StatTile
            icon={Heart}
            label={t.settings.dataWishlist}
            value={wishlist?.length ?? 0}
            tone="cyan"
          />
        </div>
      </SettingsSection>

      {/* Sauvegarde */}
      <SettingsSection
        icon={Download}
        title={t.settings.backupTitle}
        text={t.settings.backupText}
      >
        <div className="mt-4 grid gap-2">
          <Button
            onClick={() => {
              setError(null);
              setMessage(null);
              void downloadExport()
                .then(() => setMessage(t.settings.exportDone))
                .catch(() => setError(t.settings.exportError));
            }}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {t.settings.exportButton}
          </Button>

          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" aria-hidden="true" />
            {t.settings.importButton}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
        </div>

        <p className="mt-3 text-xs text-ink-muted">
          {t.settings.lastExport} : {formatDate(syncDates?.lastExport ?? null) ?? t.settings.never}
          {" · "}
          {t.settings.lastImport} : {formatDate(syncDates?.lastImport ?? null) ?? t.settings.never}
        </p>

        {message && <p className="mt-2 text-sm text-success">{message}</p>}
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      </SettingsSection>

      {/* Confirmation d'import */}
      <BottomSheet
        open={pending !== null}
        title={t.settings.importTitle}
        onClose={() => setPending(null)}
      >
        {pending && (
          <>
            <p className="text-sm text-ink-muted">{t.settings.importWarning}</p>
            <p className="mt-2 text-sm">
              {t.settings.importSummary(pending.collection.length, pending.wishlist.length)}
            </p>
            <div className="mt-4 grid gap-2">
              <Button variant="danger" onClick={() => void confirmImport()}>
                {t.settings.importConfirm}
              </Button>
              <Button variant="secondary" onClick={() => setPending(null)}>
                {t.settings.importCancel}
              </Button>
            </div>
          </>
        )}
      </BottomSheet>
    </div>
  );
}

/** Panneau de réglage : icône en pastille + titre + contenu. */
function SettingsSection({
  icon: Icon,
  title,
  text,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text?: string;
  children: React.ReactNode;
}) {
  return (
    <Surface className="mb-4 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-gradient-to-br from-accent/15 to-brand-2/15 text-accent"
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">{title}</h2>
          {text && <p className="mt-0.5 text-xs text-ink-muted">{text}</p>}
        </div>
      </div>
      {children}
    </Surface>
  );
}

/** Carte de choix de thème avec mini-aperçu. */
function ThemePreview({
  value,
  label,
  active,
  onSelect,
}: {
  value: Theme;
  label: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={[
        "rounded-card border p-2 text-left transition-colors",
        active
          ? "border-accent/60 ring-2 ring-accent/70"
          : "border-line/70 hover:border-accent/40",
      ].join(" ")}
    >
      <span className={`theme-preview theme-preview-${value}`} aria-hidden="true">
        <span className="theme-preview-bar theme-preview-bar-brand" />
        <span className="theme-preview-bar theme-preview-bar-muted" />
        <span className="theme-preview-bar theme-preview-bar-cyan" />
        <span className="theme-preview-bar theme-preview-bar-accent" />
      </span>
      <span className="mt-2 flex items-center justify-between px-1">
        <span className="text-xs font-medium">{label}</span>
        {active && (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-cyan">
            {t.theme.active}
          </span>
        )}
      </span>
    </button>
  );
}
