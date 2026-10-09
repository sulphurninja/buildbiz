import { cn } from "cn";
import { site } from "@/content/site";
import { Reveal } from "@/components/funnel/reveal";
import { CtaBlock } from "@/components/funnel/cta-button";
import { Em, Section, SectionHeading } from "@/components/sections/section-heading";

export function TechTimeline() {
  return (
    <Section>
      <SectionHeading
        eyebrow="“But I'm not a tech person…”"
        title={
          <>
            That&apos;s exactly what every business owner said — <Em>right before they got left behind.</Em>
          </>
        }
      />

      <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {site.timeline.map((t, i) => (
          <Reveal
            as="li"
            key={t.year}
            delay={i * 90}
            className={cn("rounded-3xl border p-6 text-center", t.now ? "border-gold/50 bg-gold-soft" : "border-line bg-wine-2/70")}
          >
            <p className={cn("font-display text-[2.6rem] font-bold leading-none", t.now ? "text-gold" : "text-cream/60")}>{t.year}</p>
            <p className="mt-3 eyebrow text-cream/55">{t.tech}</p>
            <p className={cn("mt-4 font-accent text-[1.35rem] italic leading-snug", t.now ? "text-cream" : "text-cream/70")}>{t.quote}</p>
          </Reveal>
        ))}
      </ol>

      <Reveal className="mx-auto mt-12 max-w-2xl text-center">
        <p className="text-[16px] leading-relaxed text-cream/70">
          <strong className="font-semibold text-cream">AI in 2026 is where WhatsApp was in 2015.</strong>
        </p>
        <p className="mt-2 font-accent text-[1.5rem] italic text-gold">Agar aap WhatsApp chala sakte ho, toh aap ye system bana sakte ho.</p>
      </Reveal>

      <Reveal className="mt-12">
        <CtaBlock source="timeline">Yes! I&apos;m ready to adopt early</CtaBlock>
      </Reveal>
    </Section>
  );
}
