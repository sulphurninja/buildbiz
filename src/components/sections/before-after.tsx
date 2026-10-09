import Image from "next/image";
import { Check, X } from "lucide-react";
import { site } from "@/content/site";
import { Reveal } from "@/components/funnel/reveal";
import { CtaBlock } from "@/components/funnel/cta-button";
import { Em, Section, SectionHeading } from "@/components/sections/section-heading";

export function BeforeAfter() {
  return (
    <Section tone="deep">
      <SectionHeading
        eyebrow="The shift"
        title={
          <>
            Two business owners. Same business. <Em>One has a system.</Em>
          </>
        }
      />

      <div className="mx-auto mt-14 grid max-w-5xl items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
        <Reveal className="relative order-last lg:order-first">
          <Image
            src="/owner-freedom.jpg"
            alt="Business owner relaxing on holiday while his dashboard runs the business"
            width={1024}
            height={768}
            className="w-full rounded-3xl border border-gold/20 shadow-deep"
          />
          <p className="absolute bottom-4 left-1/2 w-max -translate-x-1/2 rounded-full border border-gold/30 bg-wine-deep/90 px-4 py-1.5 font-accent text-[15px] italic text-gold backdrop-blur">
            Within weeks of Day 2
          </p>
        </Reveal>

        <div className="space-y-5">
          <Reveal className="rounded-3xl border border-line bg-wine-2/50 p-6">
            <p className="eyebrow text-flame">✕ Before</p>
            <ul className="mt-4 space-y-2.5">
              {site.before.slice(0, 5).map((b) => (
                <li key={b} className="flex items-center gap-3 text-[15px] text-cream/60">
                  <X className="size-4 shrink-0 text-flame" strokeWidth={2.5} />
                  {b}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={100} className="rounded-3xl border border-gold/45 bg-gold-soft p-6 glow-gold">
            <p className="eyebrow text-gold">✦ After</p>
            <ul className="mt-4 space-y-2.5">
              {site.after.slice(0, 5).map((a) => (
                <li key={a} className="flex items-center gap-3 text-[15px] font-medium text-cream">
                  <Check className="size-4 shrink-0 text-gold" strokeWidth={3} />
                  {a}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>

      <Reveal className="mt-12">
        <CtaBlock source="before-after">Yes! I want the “after” version</CtaBlock>
      </Reveal>
    </Section>
  );
}
