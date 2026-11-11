import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft, Download, Upload } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { BottomSheet } from "../../components/BottomSheet";
import { ThemeToggle } from "../../components/ThemeToggle";
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
 * Écran Réglages (section 5) : thème, export/import de la collection,
 * et résumé des données locales. Accessible depuis l'Accueil.
 */
export default function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PopoExport | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      <nav className="mb-5" aria-label="Fil d'ariane">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t.nav.home}
        </Link>
      </nav>

      <PageHeader title={t.settings.title} description={t.settings.description} />

      {/* Thème */}
      <section className="mb-4 rounded-standard border border-line bg-surface p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-medium">{t.settings.appearanceTitle}</h2>
            <p className="mt-1 text-xs text-ink-muted">{t.settings.appearanceText}</p>
          </div>
          <ThemeToggle />
        </div>
      </section>

      {/* Mes données */}
      <section className="mb-4 rounded-standard border border-line bg-surface p-4">
        <h2 className="text-sm font-medium">{t.settings.dataTitle}</h2>
        <dl className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-ink-muted">{t.settings.dataCards}</dt>
          <dd>{collection?.length ?? 0}</dd>
          <dt className="text-ink-muted">{t.settings.dataValue}</dt>
          <dd>{formatEur(value.total)}</dd>
          <dt className="text-ink-muted">{t.settings.dataWishlist}</dt>
          <dd>{wishlist?.length ?? 0}</dd>
        </dl>
      </section>

      {/* Sauvegarde */}
      <section className="rounded-standard border border-line bg-surface p-4">
        <h2 className="text-sm font-medium">{t.settings.backupTitle}</h2>
        <p className="mt-1 text-xs text-ink-muted">{t.settings.backupText}</p>

        <div className="mt-3 grid gap-2">
          <button
            type="button"
            onClick={() => {
              setError(null);
              setMessage(null);
              void downloadExport()
                .then(() => setMessage(t.settings.exportDone))
                .catch(() => setError(t.settings.exportError));
            }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-standard bg-accent text-sm font-medium text-accent-ink hover:opacity-90"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {t.settings.exportButton}
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-standard border border-line text-sm hover:bg-surface-2"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            {t.settings.importButton}
          </button>
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

        {message && <p className="mt-2 text-sm text-accent">{message}</p>}
        {error && <p className="mt-2 text-sm text-ink">{error}</p>}
      </section>

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
              <button
                type="button"
                onClick={() => void confirmImport()}
                className="inline-flex h-11 items-center justify-center rounded-standard bg-accent text-sm font-medium text-accent-ink hover:opacity-90"
              >
                {t.settings.importConfirm}
              </button>
              <button
                type="button"
                onClick={() => setPending(null)}
                className="inline-flex h-11 items-center justify-center rounded-standard border border-line text-sm hover:bg-surface-2"
              >
                {t.settings.importCancel}
              </button>
            </div>
          </>
        )}
      </BottomSheet>
    </div>
  );
}
