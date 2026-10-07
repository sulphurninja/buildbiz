import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import { site } from "@/content/site";
import { Reveal } from "@/components/funnel/reveal";
import { CtaBlock } from "@/components/funnel/cta-button";
import { Em, Section, SectionHeading } from "@/components/sections/section-heading";

export function Mentor() {
  const m = site.mentor;
  return (
    <Section id="mentor">
      <SectionHeading
        eyebrow="Who is teaching this"
        title={
          <>
            Not a theory collector. <Em>An architect who runs businesses on these exact systems.</Em>
          </>
        }
      />

      <div className="mx-auto mt-14 grid max-w-5xl items-center gap-10 md:grid-cols-[0.8fr_1.2fr]">
        <Reveal className="mx-auto w-full max-w-sm">
          <div className="relative flex aspect-[4/5] items-end overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-b from-wine-3 to-wine-deep shadow-deep">
            <Image
              src="/amit-moga.webp"
              alt={m.name}
              fill
              sizes="(min-width: 768px) 384px, 90vw"
              className="object-cover object-top"
            />
            <div className="relative w-full bg-gradient-to-t from-wine-deep via-wine-deep/80 to-transparent px-6 pb-6 pt-16 text-center">
              <p className="font-display text-[2rem] font-bold text-cream">{m.name}</p>
              <p className="eyebrow mt-1 text-gold">{m.role}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {m.credentials.map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[12.5px] text-cream/80">
                <BadgeCheck className="size-3.5 text-gold" />
                {c}
              </span>
            ))}
          </div>
        </Reveal>

        <div className="text-center md:text-left">
          <Reveal delay={80}>
            <p className="font-display text-[1.6rem] italic leading-snug text-gold sm:text-[1.8rem]">“{m.quote}”</p>
          </Reveal>
          <Reveal delay={140} className="mt-6 space-y-4 text-[15.5px] leading-relaxed text-cream/70">
            {m.bio.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </Reveal>
          <Reveal delay={200} className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {m.stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-line bg-wine-2/60 px-3 py-4 text-center">
                <p className="font-display text-[2rem] font-bold leading-none text-gold">{s.value}</p>
                <p className="mt-1.5 text-[12px] leading-tight text-cream/60">{s.label}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </div>

      <Reveal className="mt-14">
        <CtaBlock source="mentor">Yes! I want to learn from someone who built it</CtaBlock>
      </Reveal>
    </Section>
  );
}
