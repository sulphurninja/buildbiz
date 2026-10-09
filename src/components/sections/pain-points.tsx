import Image from "next/image";
import { Reveal } from "@/components/funnel/reveal";
import { CtaBlock } from "@/components/funnel/cta-button";
import { PainChecklist } from "@/components/sections/pain-checklist";
import { Em, Section, SectionHeading } from "@/components/sections/section-heading";

export function PainPoints() {
  return (
    <Section id="problem">
      <SectionHeading
        eyebrow="Does this sound like you?"
        title={
          <>
            Tick every line that feels true. <Em>Each one is a gap this system closes.</Em>
          </>
        }
      />

      <div className="mx-auto mt-14 grid max-w-5xl items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
        <Reveal className="relative">
          <Image
            src="/owner-chaos.jpg"
            alt="Business owner buried under WhatsApp messages, calls and paperwork"
            width={1024}
            height={768}
            className="w-full rounded-3xl border border-gold/20 shadow-deep"
          />
          <p className="absolute bottom-4 left-1/2 w-max -translate-x-1/2 rounded-full border border-gold/30 bg-wine-deep/90 px-4 py-1.5 font-accent text-[15px] italic text-gold backdrop-blur">
            Your average Tuesday, 7:00 AM
          </p>
        </Reveal>

        <PainChecklist />
      </div>

      <Reveal className="mt-14">
        <CtaBlock source="pains">Yes! This is exactly my problem</CtaBlock>
      </Reveal>
    </Section>
  );
}
