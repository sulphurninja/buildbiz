import Image from "next/image";
import { site } from "@/content/site";
import { Reveal } from "@/components/funnel/reveal";
import { CtaBlock } from "@/components/funnel/cta-button";
import { Em, Section, SectionHeading } from "@/components/sections/section-heading";

export function Curriculum() {
  return (
    <Section id="curriculum" tone="deep">
      <SectionHeading
        eyebrow="What you build — with your own hands"
        title={
          <>
            Two days. Six systems. <Em>One business that runs without you.</Em>
          </>
        }
        lead={
          <>
            We don&apos;t build it for you. <strong className="font-semibold text-cream">We help you build it yourself</strong> — screen share open, step by step, hands on.
          </>
        }
      />

      <Reveal className="relative mx-auto mt-12 max-w-5xl">
        <Image
          src="/owner-build.jpg"
          alt="Hands assembling a business machine from modular blocks"
          width={1024}
          height={576}
          className="w-full rounded-3xl border border-gold/20 shadow-deep"
        />
        <p className="absolute bottom-4 left-1/2 w-max max-w-[90%] -translate-x-1/2 rounded-full border border-gold/30 bg-wine-deep/90 px-4 py-1.5 text-center font-accent text-[15px] italic text-gold backdrop-blur">
          Your hands. Your laptop. Your system.
        </p>
      </Reveal>

      <div className="mx-auto mt-8 grid max-w-5xl gap-5 lg:grid-cols-2">
        {site.days.map((d, di) => (
          <Reveal key={d.label} delay={di * 100} className="rounded-3xl border border-line bg-wine-2/70 p-7">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-gold px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-paper">{d.label}</span>
              <span className="text-[13px] font-medium text-cream/55">{d.date}</span>
            </div>
            <h3 className="mt-3 font-display text-[1.4rem] font-bold leading-tight text-cream">{d.theme}</h3>
            <ol className="mt-5 space-y-4">
              {d.modules.map((m) => (
                <li key={m.n} className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-gold/40 font-display text-base font-bold text-gold">{m.n}</span>
                  <div>
                    <p className="text-[15.5px] font-semibold text-cream">{m.title}</p>
                    <p className="mt-0.5 text-[13.5px] leading-snug text-cream/55">{m.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        ))}
      </div>

      <Reveal delay={120} className="mx-auto mt-5 max-w-5xl rounded-3xl border border-gold/40 bg-gold-soft p-6 text-center">
        <p className="text-[15.5px] text-cream/85">
          <strong className="font-semibold text-gold">Then — full integration:</strong> all six connect into one command center. One screen. Your whole business, running.
        </p>
      </Reveal>

      <Reveal className="mt-12">
        <CtaBlock source="curriculum">Yes! I want to build all 6 systems</CtaBlock>
      </Reveal>
    </Section>
  );
}
