"use client";

import { cn } from "cn";
import { ArrowRight } from "lucide-react";
import { site } from "@/content/site";
import { useFunnel } from "@/components/funnel/funnel-provider";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** Red announcement marquee strip. */
export function GsTopStrip() {
  const messages = [
    `2 live nights · ${site.event.dateLabel}`,
    `${inr(site.event.priceOriginal)} → ₹${site.event.price} today`,
    "6 systems built live on Zoom",
    `Only ${site.event.seatsInitial} seats this batch`,
  ];
  return (
    <div className="overflow-hidden bg-[#e8402a] py-2">
      <div className="marquee-track flex w-max items-center animate-marquee [animation-duration:26s]">
        {Array.from({ length: 4 }).flatMap((_, r) =>
          messages.map((m, i) => (
            <span key={`${r}-${i}`} className="flex shrink-0 items-center gap-3 pr-3 text-[13px] font-semibold">
              <span className="text-[#ffd43b]">✦</span>
              <span className={i % 2 ? "text-[#ffd43b]" : "text-white"}>{m}</span>
            </span>
          ))
        )}
      </div>
    </div>
  );
}

/** Flat royal-blue rectangular CTA, GS-style. */
export function GsCta({
  children,
  source,
  className,
  arrow,
}: {
  children: React.ReactNode;
  source: string;
  className?: string;
  arrow?: boolean;
}) {
  const { openReserve } = useFunnel();
  return (
    <button
      type="button"
      onClick={() => openReserve(source)}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-[4px] bg-[#1e40af] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#1a379a] active:bg-[#16307f]",
        className
      )}
    >
      {children}
      {arrow && <ArrowRight className="size-4" />}
    </button>
  );
}

/** Black sticky bottom price bar, GS-style. */
export function GsStickyBar() {
  const { seatsLeft } = useFunnel();
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0d0d0f]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="gs-head text-xl font-bold text-white sm:text-2xl">{inr(site.event.price)}</span>
            <span className="text-sm text-white/40 line-through">{inr(site.event.priceOriginal)}</span>
          </div>
          <p className="text-[11px] text-white/50" suppressHydrationWarning>
            {seatsLeft} seats left · {site.event.dateLabel} · live on {site.event.platform}
          </p>
        </div>
        <GsCta source="gs-sticky" className="h-11 shrink-0 px-5">
          Reserve my Seat
        </GsCta>
      </div>
    </div>
  );
}

/** Mini footer. */
export function GsFooter() {
  return (
    <footer className="border-t border-black/10 bg-[#fdf8ee] pb-24 pt-10">
      <div className="mx-auto max-w-6xl px-5 text-center sm:px-8">
        <p className="gs-head text-sm font-bold">{site.brand.name}</p>
        <p className="mt-1 text-xs text-black/50">{site.brand.tagline} · {site.event.dateLabel} · {site.event.timeLabel} · Live on {site.event.platform}</p>
        <p className="mt-3 text-[11px] text-black/35">© {site.brand.company}. All rights reserved.</p>
      </div>
    </footer>
  );
}
