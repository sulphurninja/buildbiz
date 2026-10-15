"use client";

import Image from "next/image";
import { Armchair, CalendarDays, Clock3 } from "lucide-react";
import { site } from "@/content/site";
import { useFunnel } from "@/components/funnel/funnel-provider";
import { Logo } from "@/components/funnel/logo";
import { CountdownInline } from "@/components/funnel/countdown";
import { GsCta } from "@/components/gs/gs-chrome";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function GsHero() {
  const { seatsLeft } = useFunnel();
  const totalChairs = 12;

  return (
    <section className="bg-[#fdf8ee]">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
        {/* Left */}
        <div>
          <div className="flex items-center gap-2.5">
            <Logo className="size-9" />
            <div className="gs-head text-sm font-bold leading-tight">
              BuildBiz
              <br />
              AI
            </div>
          </div>

          <h1 className="gs-head mt-7 text-[34px] font-bold leading-[1.15] sm:text-[42px]">
            {site.event.title}
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-black/60">
            In 2 live nights, you build the AI system that runs your team, sales, ops &amp; follow-ups — yourself. No
            code. No IT team. No vendor.
          </p>

          <div className="mt-7 grid max-w-xl grid-cols-2 gap-4">
            <div className="flex items-center justify-center gap-3 rounded-lg bg-[#0b1120] px-4 py-3 text-white">
              <CalendarDays className="size-4 shrink-0 text-white/70" />
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-wide">{site.event.dateLabel}</p>
                <p className="text-[11px] text-white/60">Live on {site.event.platform}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 rounded-lg bg-[#0b1120] px-4 py-3 text-white">
              <Clock3 className="size-4 shrink-0 text-white/70" />
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-wide">{site.event.dayLabel}</p>
                <p className="text-[11px] text-white/60">{site.event.timeLabel}</p>
              </div>
            </div>
          </div>

          <GsCta source="gs-hero" className="mt-5 w-full max-w-xl text-base">
            Reserve Seat for {site.event.dateLabel} - ₹{site.event.price}
          </GsCta>
          <p className="mt-3 text-center text-xs text-black/45 lg:max-w-xl">
            {site.event.audience} · Starts in <CountdownInline className="font-semibold text-[#1e40af]" />
          </p>
        </div>

        {/* Right */}
        <div className="flex flex-col items-center gap-7 border-black/10 lg:border-l lg:border-dashed lg:pl-12">
          <Image
            src="/gs/illo-system.jpg"
            alt="The system runs the business while the owner relaxes"
            width={720}
            height={540}
            priority
            className="w-full max-w-sm rounded-xl border border-black/10"
          />

          <div className="text-center">
            <p className="text-sm text-black/60">
              This batch is kept small on purpose —{" "}
              <span className="font-semibold text-black" suppressHydrationWarning>{seatsLeft} seats left</span>.
            </p>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-black/40">Available seats</p>
            <div className="mt-1.5 flex items-center justify-center gap-1" suppressHydrationWarning>
              {Array.from({ length: totalChairs }).map((_, i) => (
                <Armchair
                  key={i}
                  className={`size-5 ${i < seatsLeft ? "text-[#1e40af]" : "text-black/20"}`}
                  strokeWidth={i < seatsLeft ? 2.4 : 1.8}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-[11px] text-black/45">Today&apos;s price</p>
              <p className="gs-head text-2xl font-bold">{inr(site.event.price)}</p>
            </div>
            <div className="h-10 w-px bg-black/15" />
            <div className="text-center">
              <p className="text-[11px] text-black/45">Total Value</p>
              <p className="gs-head text-2xl font-bold text-black/70">{inr(site.event.priceOriginal)}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
