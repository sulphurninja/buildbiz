import { site } from "@/content/site";
import { Reveal } from "@/components/funnel/reveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CtaBlock } from "@/components/funnel/cta-button";
import { Em, Section, SectionHeading } from "@/components/sections/section-heading";

export function Faq() {
  return (
    <Section id="faq">
      <SectionHeading
        eyebrow="Before you hesitate"
        title={
          <>
            The questions every serious business owner <Em>asks first.</Em>
          </>
        }
      />

      <Reveal delay={60} className="mx-auto mt-12 max-w-3xl">
        <Accordion type="single" collapsible defaultValue="item-0" className="space-y-3">
          {site.faq.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`} className="rounded-2xl border border-line bg-wine-2/70 px-6 last:border-b">
              <AccordionTrigger className="py-5 text-left font-display text-[1.3rem] font-bold leading-snug text-cream hover:no-underline [&>svg]:size-5 [&>svg]:text-gold">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-[15px] leading-relaxed text-cream/65">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>

      <Reveal className="mt-12">
        <CtaBlock source="faq">I&apos;m ready — reserve my seat @ ₹{site.event.price}</CtaBlock>
      </Reveal>
    </Section>
  );
}
