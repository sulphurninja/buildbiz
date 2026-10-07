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

      <div className="mx-auto mt-12 max-w-3xl space-y-3">
        {site.bonuses.map((b, i) => (
          <Reveal key={b.name} delay={i * 70} className="flex items-center gap-4 rounded-2xl border border-line bg-wine-2/70 p-5">
            <span className="text-2xl">🎁</span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[1.3rem] font-bold leading-tight text-cream">{b.name}</p>
              <p className="mt-1 text-[14px] text-cream/60">{b.body}</p>
            </div>
            <span className="shrink-0 font-display text-[1.4rem] font-bold text-gold">{inr(b.value)}</span>
          </Reveal>
        ))}

        <Reveal delay={300} className="rounded-3xl border border-gold/45 bg-gold-soft p-7 text-center glow-gold">
          <p className="text-[15px] text-cream/75">
            Total bonus value — <span className="font-semibold text-gold">{inr(site.event.bonusValue)}</span> yours free
          </p>
          <p className="mt-3 text-[13px] font-semibold uppercase tracking-[0.18em] text-cream/55">Your investment today</p>
          <p className="mt-1 font-display text-[3.5rem] font-bold leading-none text-gradient-gold">
            {inr(site.event.price)} <span className="font-sans text-[15px] font-medium text-cream/60">{site.event.gstNote}</span>
          </p>
        </Reveal>
      </div>

      <Reveal className="mt-10">
        <CtaBlock source="bonuses">Yes! Reserve my seat + {inr(site.event.bonusValue)} bonuses</CtaBlock>
      </Reveal>
    </Section>
  );
}
