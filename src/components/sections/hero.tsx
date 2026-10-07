"use client";

import { Lock, MessageCircle } from "lucide-react";
import { site } from "@/content/site";
import { CountdownBlocks } from "@/components/funnel/countdown";
import { CtaButton } from "@/components/funnel/cta-button";
import { useFunnel } from "@/components/funnel/funnel-provider";
import { HeroDashboard } from "@/components/sections/hero-dashboard";

export function Hero() {
  const { seatsLeft } = useFunnel();
  return (
    <section id="top" className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[640px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--gold) 16%, transparent), transparent)" }}
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-5 pb-10 pt-10 text-center sm:px-8 sm:pt-14">
        <div className="flex flex-wrap items-center justify-center gap-2 animate-rise">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-wine-deep/60 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-cream/85">
            <span className="size-1.5 rounded-full bg-flame animate-pulse-dot" />
            Live 2-Day Online Workshop · India · ₹{site.event.price} + GST
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-wine-2/70 px-3.5 py-1.5 text-[12px] text-cream/80">
            <span className="font-semibold text-gold tabular-nums">{seatsLeft}</span> seats left · closes when full
          </span>
        </div>

        <h1 className="mt-7 font-display text-[2.6rem] font-bold leading-[1.05] text-balance text-cream animate-rise [animation-delay:80ms] sm:text-[3.4rem] lg:text-[4rem]">
          Steal the Exact <em className="italic font-semibold text-gold">“Business Operating System”</em> India&apos;s Smartest Founders Use to Run Their Companies —{" "}
          <em className="italic font-semibold text-gold">Without Being Needed Every Day</em>
        </h1>

        <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-pretty text-cream/75 animate-rise [animation-delay:160ms] sm:text-[18px]">
          In this live 2-day workshop, you build the exact AI system that runs your <strong className="font-semibold text-cream">team, sales, operations and follow-ups</strong> —
          for just ₹{site.event.price}. No code. No IT team. No developer. Just your laptop and 2 days.
        </p>

        <div className="mt-9 w-full max-w-2xl rounded-3xl border border-gold/25 bg-wine-deep/60 p-6 shadow-deep animate-rise [animation-delay:240ms] sm:p-7">
          <p className="eyebrow text-gold">Workshop dates</p>
          <p className="mt-2 font-display text-[1.9rem] font-bold leading-none text-cream sm:text-[2.2rem]">{site.event.dateLabel}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[14px] text-cream/75">
            <span>
              ⏰ <strong className="font-semibold text-cream">{site.event.timeLabel}</strong>
            </span>
            <span>
              ⌛ <strong className="font-semibold text-cream">{site.event.durationLabel}</strong> · {site.event.dayLabel}
            </span>
            <span>
              💻 LIVE on <strong className="font-semibold text-cream">{site.event.platform}</strong>
            </span>
          </div>

          <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

          <div className="flex items-end justify-center gap-3">
            <span className="pb-1 font-display text-xl text-cream/40 line-through">₹{site.event.priceOriginal.toLocaleString("en-IN")}</span>
            <span className="font-display text-[3.6rem] font-bold leading-none text-gradient-gold">₹{site.event.price}</span>
            <span className="pb-1.5 text-[14px] font-medium text-cream/60">{site.event.gstNote}</span>
          </div>
          <p className="mt-2 text-[13px] text-cream/60">
            One-time entry · Both days included · <span className="font-semibold text-gold">₹{site.event.bonusValue.toLocaleString("en-IN")} bonuses free</span>
          </p>

          <div className="mt-6 flex flex-col items-center gap-3">
            <CtaButton source="hero" size="xl" className="w-full sm:w-auto">
              Yes! Steal the system — reserve my seat
            </CtaButton>
            <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12.5px] text-cream/55">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="size-3.5" /> Secure checkout
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MessageCircle className="size-3.5" /> WhatsApp confirmation instant
              </span>
            </p>
          </div>
        </div>

        <div className="mt-7 animate-rise [animation-delay:320ms]">
          <CountdownBlocks />
        </div>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-[13px] font-medium text-cream/65 animate-rise [animation-delay:380ms]">
          <li>🇮🇳 Built in India, for Indian businesses</li>
          <li>👨‍⚕️ Taught by {site.mentor.name}</li>
          <li>⚙️ 6 systems built live</li>
        </ul>
      </div>

      <div className="relative mx-auto max-w-5xl px-5 pb-16 sm:px-8 animate-rise [animation-delay:440ms]">
        <p className="mb-4 text-center text-[12px] font-semibold uppercase tracking-[0.2em] text-cream/45">What your Monday 7:00 AM looks like after Day 2</p>
        <HeroDashboard />
      </div>
    </section>
  );
}
