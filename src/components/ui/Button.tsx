import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-control font-medium transition-all disabled:pointer-events-none disabled:opacity-50";

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-br from-accent to-brand-2 text-on-brand shadow-[var(--glow-brand)] hover:brightness-110",
  secondary: "border border-line/70 bg-glass text-ink backdrop-blur hover:bg-surface-2",
  ghost: "text-ink-muted hover:bg-glass hover:text-ink",
  danger: "border border-danger/40 bg-danger/10 text-danger hover:bg-danger/15",
};

/** Classes réutilisables pour les liens stylés comme des boutons. */
export function buttonStyles(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className = "",
) {
  return [base, sizes[size], variants[variant], className].filter(Boolean).join(" ");
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={buttonStyles(variant, size, className)} {...props}>
      {children}
    </button>
  );
}
