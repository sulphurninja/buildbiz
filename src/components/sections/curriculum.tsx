import { site } from "@/content/site";
import { Reveal } from "@/components/funnel/reveal";
import { CtaBlock } from "@/components/funnel/cta-button";
import { Em, Section, SectionHeading } from "@/components/sections/section-heading";

export function Curriculum() {
  return (
    <Section id="curriculum" tone="deep">
      <SectionHeading
        eyebrow="What you build — live, not theory"
        title={
          <>
            Two days. Six systems. <Em>One business that runs without you.</Em>
          </>
        }
        lead="Every session ends with a working system. You don't take notes. You build."
      />

      <div className="mt-14 grid gap-5 lg:grid-cols-2">
        {site.days.map((d, di) => (
          <Reveal key={d.label} delay={di * 100} className="rounded-3xl border border-line bg-wine-2/70 p-7 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-gold px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-wine-deep">{d.label}</span>
              <span className="text-[13px] font-medium text-cream/55">{d.date}</span>
            </div>
            <h3 className="mt-4 font-display text-[1.6rem] font-bold leading-tight text-cream">{d.theme}</h3>
            <ol className="mt-6 space-y-5">
              {d.modules.map((m) => (
                <li key={m.n} className="flex gap-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-gold/40 font-display text-lg font-bold text-gold">{m.n}</span>
                  <div>
                    <p className="text-[16px] font-semibold text-cream">{m.title}</p>
                    <p className="mt-1 text-[14.5px] leading-relaxed text-cream/60">{m.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        ))}
      </div>

      <Reveal delay={120} className="mt-5 rounded-3xl border border-gold/40 bg-gold-soft p-6 text-center sm:p-7">
        <p className="eyebrow text-gold">Then — full integration</p>
        <p className="mx-auto mt-2 max-w-2xl text-[16px] leading-relaxed text-cream/85">
          All six systems connect into <strong className="font-semibold text-cream">one command center</strong>. One screen. Your entire business, visible and running — without
          you asking anyone.
        </p>
      </Reveal>

      <Reveal className="mt-12">
        <CtaBlock source="curriculum">Yes! I want to build all 6 systems</CtaBlock>
      </Reveal>
    </Section>
  );
}
