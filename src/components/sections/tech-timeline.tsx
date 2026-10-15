import { cn } from "cn";
import { site } from "@/content/site";
import { Reveal } from "@/components/funnel/reveal";
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

      <Reveal className="mx-auto mt-10 max-w-2xl text-center">
        <p className="font-accent text-[1.5rem] italic text-gold">Agar aap WhatsApp chala sakte ho, toh aap ye system bana sakte ho.</p>
      </Reveal>
    </Section>
  );
}
