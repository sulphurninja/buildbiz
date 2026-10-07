import { Check } from "lucide-react";
import { site } from "@/content/site";
import { Reveal } from "@/components/funnel/reveal";
import { CtaBlock } from "@/components/funnel/cta-button";
import { Em, Section, SectionHeading } from "@/components/sections/section-heading";

export function WhoFor() {
  return (
    <Section tone="deep">
      <SectionHeading
        eyebrow="Who this is for"
        title={
          <>
            It doesn&apos;t matter what business you run. <Em>It matters how it runs.</Em>
          </>
        }
        lead="Manufacturer ho ya consultant, retailer ho ya agency owner, doctor ho ya exporter — the trap is the same. A business that depends on the owner."
      />

      <ul className="mx-auto mt-12 max-w-3xl space-y-3">
        {site.whoFor.map((w, i) => (
          <Reveal as="li" key={w} delay={i * 60} className="flex items-start gap-4 rounded-2xl border border-line bg-wine-2/60 px-5 py-4">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-gold text-wine-deep">
              <Check className="size-3.5" strokeWidth={3} />
            </span>
            <p className="text-[15.5px] leading-relaxed text-cream/85">{w}</p>
          </Reveal>
        ))}
      </ul>

      <Reveal delay={300} className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-2">
        {site.industries.map((ind) => (
          <span key={ind} className="rounded-full border border-line px-3.5 py-1.5 text-[13px] text-cream/70">
            {ind}
          </span>
        ))}
      </Reveal>
      <p className="mt-4 text-center text-[14px] italic text-cream/55">If it has a team and customers, this works.</p>

      <Reveal className="mt-12">
        <CtaBlock source="who-for">Yes! This is my business — reserve my seat</CtaBlock>
      </Reveal>
    </Section>
  );
}
