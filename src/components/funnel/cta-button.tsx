"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "cn";
import { useFunnel } from "@/components/funnel/funnel-provider";

type Props = {
  children?: React.ReactNode;
  source: string;
  size?: "md" | "lg" | "xl";
  tone?: "gold" | "outline";
  className?: string;
  fullWidth?: boolean;
};

export function CtaButton({ children, source, size = "lg", tone = "gold", className, fullWidth }: Props) {
  const { openReserve } = useFunnel();

  const sizes = {
    md: "h-10 px-5 text-[12.5px]",
    lg: "h-13 px-7 text-[14px]",
    xl: "h-14 px-8 text-[14.5px] sm:h-15 sm:px-10 sm:text-[15px]",
  }[size];

  const tones = {
    gold: "bg-gradient-to-b from-[oklch(0.72_0.14_75)] via-gold to-gold-deep text-paper glow-gold hover:brightness-105",
    outline: "border border-gold/40 bg-transparent text-cream hover:bg-gold/10",
  }[tone];

  return (
    <button
      type="button"
      onClick={() => openReserve(source)}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full font-bold uppercase tracking-[0.06em] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/40",
        sizes,
        tones,
        fullWidth && "w-full",
        className,
      )}
    >
      {tone === "gold" && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent animate-shine"
        />
      )}
      <span className="relative text-balance">{children ?? "Reserve my seat @ ₹51"}</span>
      <ArrowRight className="relative size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
    </button>
  );
}

/** "date · time · seats" line that sits under CTAs. */
export function CtaMeta({ className }: { className?: string }) {
  const { seatsLeft } = useFunnel();
  return (
    <p className={cn("flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13px] text-cream/60", className)}>
      <span>
        📅 <span className="font-semibold text-cream">13th & 14th October</span> · 9:00 PM · Live on Zoom
      </span>
      <span className="hidden h-3 w-px bg-cream/20 sm:block" />
      <span className="inline-flex items-center gap-2">
        <span className="inline-flex size-2 rounded-full bg-flame animate-pulse-dot" />
        Only <span className="font-bold tabular-nums text-cream">{seatsLeft}</span> seats left
      </span>
    </p>
  );
}

/** Standard CTA block: button + meta, centered. */
export function CtaBlock({ source, children, className }: { source: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <CtaButton source={source} size="xl">
        {children}
      </CtaButton>
      <CtaMeta />
    </div>
  );
}
