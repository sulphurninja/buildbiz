"use client";

import * as React from "react";
import { Flame } from "lucide-react";
import { cn } from "cn";
import { site } from "@/content/site";
import { CountdownInline } from "@/components/funnel/countdown";
import { CtaButton } from "@/components/funnel/cta-button";
import { useFunnel } from "@/components/funnel/funnel-provider";
import { Logo } from "@/components/funnel/logo";

export function SiteHeader() {
  const { seatsLeft } = useFunnel();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="sticky top-0 z-50">
      {/* Top bar — dark accent band */}
      <div className="bg-wine-ink text-paper">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-center gap-3 px-4 text-[12px] font-semibold uppercase tracking-[0.16em]">
          <span className="hidden text-gold-bright sm:inline">🇮🇳</span>
          <span className="truncate text-gold-bright">{site.event.kicker}</span>
          <span className="hidden text-paper/30 md:inline">·</span>
          <span className="hidden truncate text-paper/70 md:inline">{site.event.audience}</span>
          <span className="hidden text-gold-bright sm:inline">🇮🇳</span>
        </div>
      </div>

      {/* Header */}
      <header
        className={cn(
          "border-b transition-all duration-300",
          scrolled ? "border-line bg-wine/85 shadow-[0_10px_40px_-20px_rgba(0,0,0,.8)] backdrop-blur-xl" : "border-transparent bg-wine",
        )}
      >
        <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label={`${site.brand.name} home`}>
            <Logo />
            <span className="flex flex-col leading-none">
              <span className="font-display text-[21px] font-bold text-cream">{site.brand.name}</span>
              <span className="mt-1 hidden text-[10px] font-bold uppercase tracking-[0.22em] text-gold/80 sm:block">{site.brand.tagline}</span>
            </span>
          </a>

          <div className="hidden items-center gap-6 text-[13.5px] lg:flex">
            <span className="inline-flex items-center gap-2 text-flame">
              <Flame className="size-4" />
              <span className="font-bold tabular-nums">{seatsLeft} seats left</span>
            </span>
            <span className="h-4 w-px bg-cream/15" />
            <span className="text-cream/75">
              📅 <span className="font-semibold text-cream">{site.event.dateLabel}</span> · {site.event.timeLabel}
            </span>
            <span className="h-4 w-px bg-cream/15" />
            <span className="text-cream/75">
              Starts in <CountdownInline className="font-bold text-gold" />
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden items-baseline gap-1.5 md:flex">
              <span className="text-[13px] text-cream/45 line-through">₹{site.event.priceOriginal.toLocaleString("en-IN")}</span>
              <span className="font-display text-xl font-bold text-gold">₹{site.event.price}</span>
            </span>
            <CtaButton source="header" size="md">
              Reserve seat
            </CtaButton>
          </div>
        </div>
      </header>
    </div>
  );
}
