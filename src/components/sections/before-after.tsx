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

      <div className="mx-auto mt-14 grid max-w-5xl gap-5 md:grid-cols-2">
        <Reveal className="rounded-3xl border border-line bg-wine-2/50 p-7 sm:p-8">
          <p className="eyebrow text-flame">✕ Before — right now</p>
          <ul className="mt-5 space-y-3.5">
            {site.before.map((b) => (
              <li key={b} className="flex items-center gap-3 text-[15.5px] text-cream/60">
                <X className="size-4 shrink-0 text-flame" strokeWidth={2.5} />
                {b}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120} className="rounded-3xl border border-gold/45 bg-gold-soft p-7 glow-gold sm:p-8">
          <p className="eyebrow text-gold">✦ After — within weeks</p>
          <ul className="mt-5 space-y-3.5">
            {site.after.map((a) => (
              <li key={a} className="flex items-center gap-3 text-[15.5px] font-medium text-cream">
                <Check className="size-4 shrink-0 text-gold" strokeWidth={3} />
                {a}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <Reveal className="mt-12">
        <CtaBlock source="before-after">Yes! I want the “after” version</CtaBlock>
      </Reveal>
    </Section>
  );
}
