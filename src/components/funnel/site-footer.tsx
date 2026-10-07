import { site } from "@/content/site";
import { Logo } from "@/components/funnel/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-wine-deep pb-32 pt-12 text-center">
      <div className="mx-auto max-w-4xl px-5">
        <div className="flex flex-col items-center gap-3">
          <Logo />
          <p className="font-display text-2xl font-bold text-cream">{site.brand.name}</p>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-gold/80">{site.brand.tagline}</p>
          <p className="mt-2 text-[15px] text-cream/60">BUILD → AUTOMATE → SYSTEMIZE → SCALE</p>
        </div>
        <p className="mt-8 text-[13px] text-cream/50">
          🇮🇳 © 2026 · {site.event.title} · {site.brand.company}
        </p>
        <p className="mt-2 text-[12.5px] leading-relaxed text-cream/40">
          Live on {site.event.platform} · {site.event.dateLabel} · {site.event.timeLabel} · Seats are limited · Results depend on implementation and business context ·
          Individual outcomes vary
        </p>
      </div>
    </footer>
  );
}
