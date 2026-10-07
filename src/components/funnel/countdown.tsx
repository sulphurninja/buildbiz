"use client";

import { cn } from "cn";
import { site } from "@/content/site";
import { pad, useCountdown } from "@/components/funnel/use-countdown";

export function CountdownInline({ className }: { className?: string }) {
  const c = useCountdown(site.event.startsAt);
  const text = !c.ready ? "--d --h --m" : c.done ? "Live now" : `${c.days}d ${pad(c.hours)}h ${pad(c.minutes)}m`;
  return (
    <span className={cn("tabular-nums", className)} suppressHydrationWarning>
      {text}
    </span>
  );
}

export function CountdownBlocks({ className }: { className?: string }) {
  const c = useCountdown(site.event.startsAt);
  const items = [
    { v: c.days, l: "Days" },
    { v: c.hours, l: "Hours" },
    { v: c.minutes, l: "Mins" },
    { v: c.seconds, l: "Secs" },
  ];
  return (
    <div className={cn("flex items-center gap-2 sm:gap-3", className)}>
      {items.map((it, i) => (
        <div key={it.l} className="flex items-center gap-2 sm:gap-3">
          <div className="flex min-w-[3.75rem] flex-col items-center rounded-xl border border-gold/25 bg-wine-deep/60 px-3 py-2 sm:min-w-[4.25rem]">
            <span className="font-display text-[1.75rem] font-bold tabular-nums leading-none text-gold" suppressHydrationWarning>
              {c.ready ? pad(it.v) : "--"}
            </span>
            <span className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-cream/50">{it.l}</span>
          </div>
          {i < items.length - 1 && <span className="font-display text-xl text-gold/50">:</span>}
        </div>
      ))}
    </div>
  );
}
