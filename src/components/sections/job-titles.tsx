import { site } from "@/content/site";
import { Reveal } from "@/components/funnel/reveal";
import { CtaBlock } from "@/components/funnel/cta-button";
import { Em, Section, SectionHeading } from "@/components/sections/section-heading";

export function JobTitles() {
  return (
    <Section tone="deep">
      <SectionHeading
        eyebrow="Your real job title"
        title={
          <>
            You think you&apos;re the CEO. <Em>Your calendar says otherwise.</Em>
          </>
        }
      />

      <Reveal className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-3">
        {site.jobTitles.map((t) => (
          <span
            key={t}
            className="rounded-full border border-gold/30 bg-wine-2/70 px-6 py-3 font-display text-[1.05rem] font-bold text-cream sm:text-[1.2rem]"
          >
            ◆ {t}
          </span>
        ))}
      </Reveal>

      <Reveal delay={150} className="mx-auto mt-10 max-w-2xl text-center">
        <p className="text-[16px] leading-relaxed text-cream/70">
          This workshop hands every one of these jobs to a system — so you can do the one job you were meant to do.
        </p>
        <p className="mt-5 font-accent text-[2rem] italic leading-tight text-gold sm:text-[2.5rem]">Own the business. Not operate it.</p>
      </Reveal>

      <Reveal className="mt-12">
        <CtaBlock source="job-titles">Yes! I want to fire myself from these jobs</CtaBlock>
      </Reveal>
    </Section>
  );
}
