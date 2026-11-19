interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  options: readonly SegmentedOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
}

/**
 * Contrôle segmenté en pilules (tri, filtres, onglets).
 * Scroll horizontal autorisé sur mobile.
 */
export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={[
        "inline-flex max-w-full gap-1 overflow-x-auto rounded-pill border border-line/70 bg-glass p-1",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={[
              "shrink-0 rounded-pill px-3.5 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-gradient-to-br from-accent to-brand-2 text-on-brand shadow-[var(--glow-brand)]"
                : "text-ink-muted hover:text-ink",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
