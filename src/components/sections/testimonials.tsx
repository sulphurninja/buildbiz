import { site } from "@/content/site";
import { Reveal } from "@/components/funnel/reveal";
import { CtaBlock } from "@/components/funnel/cta-button";
import { Em, Section, SectionHeading } from "@/components/sections/section-heading";

export function Testimonials() {
  return (
    <Section tone="deep">
      <SectionHeading
        eyebrow="From business owners who attended"
        title={
          <>
            Real owners. Real numbers. <Em>Real freedom.</Em>
          </>
        }
      />

      <div className="mt-14 grid gap-5 md:grid-cols-2">
        {site.testimonials.map((t, i) => (
          <Reveal key={t.name} delay={i * 80} className="flex flex-col rounded-3xl border border-line bg-wine-2/70 p-7">
            <p className="text-[15px] tracking-[0.2em] text-gold">★★★★★</p>
            <h3 className="mt-3 font-display text-[1.5rem] font-bold leading-snug text-cream">“{t.headline}”</h3>
            <p className="mt-3 flex-1 text-[15px] leading-relaxed text-cream/65">{t.body}</p>
            <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
              <span className="flex size-10 items-center justify-center rounded-full bg-gold font-display text-[15px] font-bold text-paper">
                {t.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")}
              </span>
              <div className="leading-tight">
                <p className="text-[14.5px] font-semibold text-cream">{t.name}</p>
                <p className="mt-0.5 text-[12.5px] text-cream/55">{t.meta}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-12">
        <CtaBlock source="testimonials">Yes! I want results like these</CtaBlock>
      </Reveal>
    </Section>
  );
}
