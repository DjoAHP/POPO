import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "success"
  | "brand2"
  | "danger";
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
  success: "border border-success/40 bg-success/10 text-success hover:bg-success/15",
  brand2: "border border-brand-2/40 bg-brand-2/10 text-brand-2 hover:bg-brand-2/15",
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
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={buttonStyles(variant, size, className)} {...props}>
      {children}
    </button>
  );
}
