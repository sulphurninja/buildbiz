import { Check } from "lucide-react";
import { site } from "@/content/site";
import { Reveal } from "@/components/funnel/reveal";
import { CtaBlock } from "@/components/funnel/cta-button";
import { Em, Section, SectionHeading } from "@/components/sections/section-heading";

export function PainPoints() {
  return (
    <Section id="problem">
      <SectionHeading
        eyebrow="Does this sound like you?"
        title={
          <>
            Tick every line that feels true. <Em>Each one is a gap this system closes.</Em>
          </>
        }
      />

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {site.pains.map((p, i) => (
          <Reveal
            key={p.title}
            delay={i * 60}
            className="rounded-3xl border border-line bg-wine-2/70 p-7 text-left transition-all duration-300 hover:-translate-y-1 hover:border-gold/40"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-gold text-wine-deep">
              <Check className="size-5" strokeWidth={3} />
            </span>
            <h3 className="mt-5 font-display text-[1.4rem] font-bold leading-snug text-cream">{p.title}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-cream/65">{p.body}</p>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-14">
        <CtaBlock source="pains">Yes! This is exactly my problem</CtaBlock>
      </Reveal>
    </Section>
  );
}
