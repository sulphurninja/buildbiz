"use client";

import Image from "next/image";
import { Lock, MessageCircle, Play } from "lucide-react";
import { site } from "@/content/site";
import { CountdownBlocks } from "@/components/funnel/countdown";
import { CtaButton } from "@/components/funnel/cta-button";
import { useFunnel } from "@/components/funnel/funnel-provider";

export function Hero() {
  const { seatsLeft, openReserve } = useFunnel();
  return (
    <section id="top" className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--gold-bright) 28%, transparent), transparent)" }}
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-5 pb-6 pt-12 text-center sm:px-8 sm:pt-16">
        {/* Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 animate-rise">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-wine-2 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-cream/80 shadow-deep">
            <span className="size-1.5 rounded-full bg-flame animate-pulse-dot" />
            Live · {site.event.dateLabel} · {site.event.timeLabel} · Zoom
          </span>
          <span className="inline-flex items-center rounded-full border border-line bg-wine-2 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-cream/80 shadow-deep">
            🛠️ 100% hands-on · You build it
          </span>
        </div>

        {/* Headline */}
        <h1 className="mt-8 font-display text-[2.5rem] font-bold leading-[1.04] text-balance text-cream animate-rise [animation-delay:80ms] sm:text-[3.3rem] lg:text-[3.9rem]">
          Steal the <em className="font-accent italic font-normal text-gold [font-size:1.06em]">Business Operating System</em> India&apos;s smartest founders use —{" "}
          <em className="font-accent italic font-normal text-gold [font-size:1.06em]">without being needed every day</em>
        </h1>

        <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-pretty text-cream/70 animate-rise [animation-delay:160ms] sm:text-[17.5px]">
          In 2 live nights, <strong className="font-semibold text-cream">you build it yourself</strong> — the AI system that runs your team, sales, ops & follow-ups. No code. No
          IT team. No vendor.
        </p>

        {/* Offer + CTA */}
        <div className="mt-8 flex flex-col items-center gap-3 animate-rise [animation-delay:240ms]">
          <div className="flex items-end gap-2.5">
            <span className="pb-1 text-[15px] font-medium text-cream/40 line-through">₹{site.event.priceOriginal.toLocaleString("en-IN")}</span>
            <span className="font-display text-[3.2rem] font-bold leading-none text-gradient-gold">₹{site.event.price}</span>
            <span className="pb-1.5 text-[13.5px] font-medium text-cream/50">{site.event.gstNote} · both days</span>
          </div>
          <CtaButton source="hero" size="xl">
            Yes! Steal the system — reserve my seat
          </CtaButton>
          <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12.5px] text-cream/55">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="size-3.5" /> Secure checkout
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="size-3.5" /> WhatsApp confirmation instant
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-flame animate-pulse-dot" />
              <span className="font-semibold tabular-nums text-cream">{seatsLeft}</span> seats left
            </span>
          </p>
        </div>

        <div className="mt-8 animate-rise [animation-delay:320ms]">
          <CountdownBlocks />
        </div>
      </div>

      {/* Media card — what you'll do, hands-on */}
      <div className="relative mx-auto max-w-4xl px-5 pb-16 pt-8 sm:px-8 animate-rise [animation-delay:400ms]">
        <button
          type="button"
          onClick={() => openReserve("hero-video")}
          aria-label="Watch what you'll build in the workshop"
          className="group relative block w-full overflow-hidden rounded-3xl border border-gold/25 shadow-deep transition-transform duration-300 hover:-translate-y-1"
        >
          <Image
            src="/owner-build.jpg"
            alt="A business owner building his own dashboard, hands on the keyboard"
            width={1600}
            height={900}
            priority
            className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-wine-ink/70 via-transparent to-transparent" />
          <span className="absolute left-1/2 top-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-paper/95 text-wine-ink shadow-deep transition-transform duration-300 group-hover:scale-110">
            <Play className="ml-1 size-8 fill-current" />
          </span>
          <span className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-2 p-5 text-left sm:p-6">
            <span>
              <span className="block font-display text-[1.15rem] font-bold text-paper sm:text-[1.3rem]">Watch: what you&apos;ll build in 2 nights</span>
              <span className="mt-0.5 block text-[13px] text-paper/75">Your hands. Your laptop. Your system — we guide, you build.</span>
            </span>
            <span className="rounded-full bg-gold-bright px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-wine-ink">90 sec</span>
          </span>
        </button>
      </div>
    </section>
  );
}
