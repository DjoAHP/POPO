/**
 * Fond de l'application (docs/DESIGN.md §1.6) :
 * deux halos radiaux diffus + une trame de points quasi invisible.
 * Aucune animation : coût nul pendant le défilement.
 */
export function BrandBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-32 -top-32 h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle,var(--glow-1)_0%,transparent_70%)] opacity-[0.13]" />
      <div className="absolute -bottom-40 -right-32 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,var(--glow-2)_0%,transparent_70%)] opacity-[0.11]" />
      <div className="absolute inset-0 opacity-[0.10] [background-image:radial-gradient(var(--line)_1px,transparent_1px)] [background-size:24px_24px]" />
    </div>
  );
}
