import { t } from "../i18n";

export interface FilterSelectOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  id: string;
  label: string;
  /** Option « Tous » = valeur "". */
  value: string;
  options: FilterSelectOption[];
  onChange: (value: string) => void;
}

/**
 * Filtre déroulant (select natif : le meilleur comportement tactile
 * sur mobile, avec le menu système du téléphone).
 */
export function FilterSelect({ id, label, value, options, onChange }: FilterSelectProps) {
  return (
    <label htmlFor={id} className="flex min-w-0 flex-col gap-1">
      <span className="text-xs font-medium text-ink-muted">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-standard border border-line bg-surface px-2.5 text-sm"
      >
        <option value="">{t.search.filterAll}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
