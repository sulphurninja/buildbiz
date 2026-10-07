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

      <div className="mx-auto mt-14 grid max-w-4xl gap-3 sm:grid-cols-2">
        {site.jobTitles.map((t, i) => (
          <Reveal
            as="div"
            key={t}
            delay={i * 80}
            className="flex items-center gap-4 rounded-2xl border border-line bg-wine-2/70 px-6 py-5 text-left"
          >
            <span className="font-display text-2xl font-bold text-gold">◆</span>
            <p className="font-display text-[1.35rem] font-bold leading-tight text-cream sm:text-[1.5rem]">{t}</p>
          </Reveal>
        ))}
      </div>

      <Reveal delay={200} className="mx-auto mt-12 max-w-3xl text-center">
        <p className="text-[16px] leading-relaxed text-cream/70 sm:text-[17px]">
          Every fire, every dropped ball, every <em className="text-cream">“sir ye approve kar do”</em> — lands on you. You didn&apos;t build a company. You built a job with no
          fixed hours, no leave policy, and nobody to report to except every problem in the building.
        </p>
        <p className="mt-6 text-[16px] leading-relaxed text-cream/70 sm:text-[17px]">
          <strong className="font-bold text-cream">This workshop takes all of these job titles and hands them to a system</strong> — so you can finally do the one job you were
          meant to do.
        </p>
        <p className="mt-6 font-display text-[1.8rem] font-bold italic text-gold sm:text-[2.1rem]">Own the business. Not operate it.</p>
      </Reveal>

      <Reveal className="mt-12">
        <CtaBlock source="job-titles">Yes! I want to fire myself from these jobs</CtaBlock>
      </Reveal>
    </Section>
  );
}
