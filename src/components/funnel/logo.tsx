import { cn } from "cn";

/** Monogram: three rising blocks (Build → Automate → Scale). */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gold", className)} aria-hidden>
      <svg viewBox="0 0 36 36" className="size-10" fill="none">
        <rect x="8" y="22" width="20" height="5" rx="1.5" className="fill-paper/45" />
        <rect x="8" y="15" width="16" height="5" rx="1.5" className="fill-paper/70" />
        <rect x="8" y="8" width="12" height="5" rx="1.5" className="fill-paper" />
        <circle cx="26" cy="10.5" r="2.2" className="fill-paper" />
      </svg>
    </span>
  );
}
