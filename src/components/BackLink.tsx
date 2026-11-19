import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface BackLinkProps {
  to: string;
  label: string;
}

/** Retour cohérent sur toutes les pages de détail. */
export function BackLink({ to, label }: BackLinkProps) {
  return (
    <Link
      to={to}
      className="mb-5 inline-flex min-h-11 items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      {label}
    </Link>
  );
}
