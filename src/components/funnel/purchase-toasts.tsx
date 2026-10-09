"use client";

import * as React from "react";
import { BadgeCheck, MapPin } from "lucide-react";
import { toast } from "sonner";
import { site } from "@/content/site";
import { useFunnel } from "@/components/funnel/funnel-provider";

const FIRST_DELAY = 6_000;
const MIN_GAP = 14_000;
const MAX_GAP = 26_000;
const MAX_TOASTS = 14;

function pick<T>(arr: readonly T[], exclude?: T): T {
  let item = arr[Math.floor(Math.random() * arr.length)];
  if (arr.length > 1) {
    while (item === exclude) item = arr[Math.floor(Math.random() * arr.length)];
  }
  return item;
}

export function PurchaseToasts() {
  const { takeSeat } = useFunnel();
  const lastRef = React.useRef<(typeof site.recentBuyers)[number] | undefined>(undefined);
  const countRef = React.useRef(0);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer: number;
    const schedule = (ms: number) => {
      timer = window.setTimeout(() => {
        if (document.visibilityState === "visible" && countRef.current < MAX_TOASTS) {
          const buyer = pick(site.recentBuyers, lastRef.current);
          lastRef.current = buyer;
          countRef.current += 1;
          const minutesAgo = 1 + Math.floor(Math.random() * 6);
          toast.custom(
            () => (
              <div className="flex w-[340px] max-w-[calc(100vw-2rem)] items-center gap-3 rounded-2xl border border-gold/30 bg-wine-2 p-3 pr-4 shadow-deep">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gold font-display text-base font-bold text-paper">
                  {buyer.name
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14.5px] font-bold text-cream">
                    {buyer.name} <span className="font-medium text-cream/60">just reserved a seat 🎉</span>
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-[12.5px] text-cream/55">
                    <MapPin className="size-3" />
                    {buyer.city} · {buyer.industry}
                    <span className="mx-1 text-cream/25">|</span>
                    {minutesAgo}m ago
                  </p>
                </div>
                <BadgeCheck className="size-5 shrink-0 text-mint" />
              </div>
            ),
            { duration: 5_000 },
          );
          if (countRef.current % 3 === 0) takeSeat();
        }
        schedule(MIN_GAP + Math.random() * (MAX_GAP - MIN_GAP));
      }, ms);
    };

    schedule(FIRST_DELAY);
    return () => window.clearTimeout(timer);
  }, [takeSeat]);

  return null;
}
