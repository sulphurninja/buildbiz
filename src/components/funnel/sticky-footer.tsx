"use client";

import * as React from "react";
import { Flame } from "lucide-react";
import { cn } from "cn";
import { site } from "@/content/site";
import { CountdownInline } from "@/components/funnel/countdown";
import { CtaButton } from "@/components/funnel/cta-button";
import { useFunnel } from "@/components/funnel/funnel-provider";

export function StickyFooter() {
  const { seatsLeft } = useFunnel();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t border-gold/20 bg-wine-deep/95 text-cream shadow-[0_-20px_60px_-20px_rgba(0,0,0,.8)] backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(.2,.7,.2,1)]",
        visible ? "translate-y-0" : "translate-y-full",
      )}
      aria-hidden={!visible}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-col gap-0.5 leading-tight">
          <span className="inline-flex items-center gap-2 text-[14px] font-bold">
            <Flame className="size-4 text-flame" />
            <span className="tabular-nums">{seatsLeft} Seats Left</span>
            <span className="text-cream/40">·</span>
            <span className="text-gold">₹{site.event.price}</span>
          </span>
          <span className="truncate text-[13px] text-cream/65">
            📅 {site.event.dateLabel} · {site.event.timeLabel} · LIVE
            <span className="hidden sm:inline">
              {" "}
              · Starts in <CountdownInline className="font-semibold text-cream" />
            </span>
          </span>
        </div>
        <CtaButton source="sticky-footer" size="md" className="h-12 shrink-0 px-5 sm:h-13 sm:px-7">
          Reserve seat @ ₹{site.event.price}
        </CtaButton>
      </div>
    </div>
  );
}
