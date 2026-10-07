import { Check, X } from "lucide-react";
import { site } from "@/content/site";
import { Reveal } from "@/components/funnel/reveal";
import { CtaBlock } from "@/components/funnel/cta-button";
import { Em, Section, SectionHeading } from "@/components/sections/section-heading";

export function Qualify() {
  return (
    <Section tone="deep">
      <SectionHeading
        eyebrow="Before you register"
        title={
          <>
            This workshop is not for everyone. <Em>Read this honestly.</Em>
          </>
        }
      />

      <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-2">
        <Reveal className="rounded-3xl border border-gold/45 bg-gold-soft p-7">
          <p className="eyebrow text-gold">✦ Register if —</p>
          <ul className="mt-5 space-y-3.5">
            {site.registerIf.map((r) => (
              <li key={r} className="flex items-start gap-3 text-[15.5px] leading-snug text-cream">
                <Check className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={3} />
                {r}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={100} className="rounded-3xl border border-line bg-wine-2/50 p-7">
          <p className="eyebrow text-flame">✕ Do not register if —</p>
          <ul className="mt-5 space-y-3.5">
            {site.dontRegisterIf.map((r) => (
              <li key={r} className="flex items-start gap-3 text-[15.5px] leading-snug text-cream/60">
                <X className="mt-0.5 size-4 shrink-0 text-flame" strokeWidth={3} />
                {r}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <Reveal className="mt-12">
        <CtaBlock source="qualify">Yes! I qualify — reserve my seat @ ₹{site.event.price}</CtaBlock>
      </Reveal>
    </Section>
  );
}
