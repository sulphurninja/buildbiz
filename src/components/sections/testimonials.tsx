import Image from "next/image";
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

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {site.testimonials.map((t, i) => (
          <Reveal
            key={t.name}
            delay={i * 80}
            className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-wine-2/70 shadow-deep"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={t.image}
                alt={t.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-wine-ink/60 to-transparent" />
              <p className="absolute bottom-2.5 left-3.5 text-[13px] tracking-[0.2em] text-gold-bright">★★★★★</p>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="flex-1 font-display text-[1.15rem] font-bold leading-snug text-cream">“{t.headline}”</h3>
              <div className="mt-4 border-t border-line pt-3 leading-tight">
                <p className="text-[13.5px] font-semibold text-cream">{t.name}</p>
                <p className="mt-0.5 text-[12px] text-cream/55">{t.meta}</p>
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
