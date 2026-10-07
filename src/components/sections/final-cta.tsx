import { Lock, MessageCircle } from "lucide-react";
import { site } from "@/content/site";
import { Reveal } from "@/components/funnel/reveal";
import { CountdownBlocks } from "@/components/funnel/countdown";
import { CtaButton, CtaMeta } from "@/components/funnel/cta-button";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-line bg-wine-deep">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[860px] -translate-x-1/2 -translate-y-1/3 rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--gold) 18%, transparent), transparent)" }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl px-5 py-20 text-center sm:px-8 lg:py-28">
        <Reveal>
          <p className="eyebrow text-gold">The only question left</p>
          <h2 className="mt-4 font-display text-[2.3rem] font-bold leading-[1.08] text-balance text-cream sm:text-[3rem] lg:text-[3.5rem]">
            You can keep being the system. <em className="italic font-semibold text-gold">Or you can build one. In 2 days.</em>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-[16px] leading-relaxed text-cream/70 sm:text-[17px]">
            You didn&apos;t start this business to answer WhatsApp messages at 11 PM. You started it to be free. That freedom is two days away — a live, working, AI-powered
            Business OS, built by you, for your company.
          </p>
        </Reveal>

        <Reveal delay={120} className="mt-10 flex flex-col items-center gap-6">
          <CountdownBlocks />
          <CtaButton source="final" size="xl">
            Yes! Reserve my seat for ₹{site.event.price}
          </CtaButton>
          <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12.5px] text-cream/55">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="size-3.5" /> Secure checkout
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="size-3.5" /> WhatsApp confirmation sent instantly
            </span>
          </p>
          <CtaMeta />
        </Reveal>
      </div>
    </section>
  );
}
