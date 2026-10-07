import { ArrowRight } from "lucide-react";
import { site } from "@/content/site";
import { Reveal } from "@/components/funnel/reveal";
import { Em, Section, SectionHeading } from "@/components/sections/section-heading";

export function Framework() {
  return (
    <Section id="framework">
      <SectionHeading
        eyebrow="The BuildBiz method"
        title={
          <>
            We don&apos;t teach small businesses AI. <Em>We help them build, automate and scale with it.</Em>
          </>
        }
        lead="Thousands of people teach prompts. This is an operating method — the same four moves, in the same order, for every business."
      />

      <Reveal className="mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-display text-[1.6rem] font-bold sm:text-[2rem]" delay={60}>
        {site.framework.map((f, i) => (
          <span key={f.name} className="inline-flex items-center gap-3">
            <span className="text-gold">{f.name}</span>
            {i < site.framework.length - 1 && <ArrowRight className="size-5 text-cream/35" />}
          </span>
        ))}
      </Reveal>

      <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {site.framework.map((f, i) => (
          <Reveal as="li" key={f.name} delay={i * 90} className="rounded-3xl border border-line bg-wine-2/70 p-6 text-center">
            <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-gold font-display text-lg font-bold text-wine-deep">{f.step}</span>
            <h3 className="mt-4 font-display text-[1.6rem] font-bold text-cream">{f.name}</h3>
            <p className="mt-2 text-[14.5px] font-semibold leading-snug text-cream/90">{f.headline}</p>
            <p className="mt-2 text-[14px] leading-relaxed text-cream/60">{f.body}</p>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
