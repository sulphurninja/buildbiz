import Image from "next/image";
import { site } from "@/content/site";
import { Reveal } from "@/components/funnel/reveal";
import { CtaBlock } from "@/components/funnel/cta-button";
import { Em, Section, SectionHeading } from "@/components/sections/section-heading";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function Bonuses() {
  return (
    <Section id="offer">
      <SectionHeading
        eyebrow="Register today & get"
        title={
          <>
            A ₹{site.event.price} seat. <Em>Plus {inr(site.event.bonusValue)} of bonuses, free.</Em>
          </>
        }
      />

      <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {site.bonuses.map((b, i) => (
          <Reveal key={b.name} delay={i * 70} className="group overflow-hidden rounded-3xl border border-line bg-wine-2/70 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40">
            <div className="relative overflow-hidden">
              <Image
                src={b.image}
                alt={b.name}
                width={512}
                height={512}
                className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute right-3 top-3 rounded-full border border-gold/40 bg-wine-deep/90 px-2.5 py-1 font-display text-[13px] font-bold text-gold backdrop-blur">
                {inr(b.value)}
              </span>
            </div>
            <div className="p-5">
              <p className="font-display text-[1.1rem] font-bold leading-tight text-cream">{b.name}</p>
              <p className="mt-1.5 text-[13.5px] leading-snug text-cream/60">{b.body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={300} className="mx-auto mt-6 max-w-2xl rounded-3xl border border-gold/45 bg-gold-soft p-7 text-center glow-gold">
        <p className="text-[14px] text-cream/75">
          Total value <s className="text-cream/50">{inr(site.event.priceOriginal + site.event.bonusValue)}</s> · Your investment today
        </p>
        <p className="mt-2 font-display text-[3.4rem] font-bold leading-none text-gradient-gold">
          {inr(site.event.price)} <span className="font-sans text-[15px] font-medium text-cream/60">{site.event.gstNote}</span>
        </p>
      </Reveal>

      <Reveal className="mt-10">
        <CtaBlock source="bonuses">Yes! Reserve my seat + {inr(site.event.bonusValue)} bonuses</CtaBlock>
      </Reveal>
    </Section>
  );
}
