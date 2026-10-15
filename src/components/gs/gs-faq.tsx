import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { site } from "@/content/site";

export function GsFaq() {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <h2 className="gs-head text-[26px] font-bold sm:text-[32px]">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="mt-8 space-y-3">
          {site.faq.map((f, i) => (
            <AccordionItem
              key={f.q}
              value={`q-${i}`}
              className="rounded-lg border border-black/10 bg-white px-5 last:border-b"
            >
              <AccordionTrigger className="py-4 text-left text-[15px] font-semibold hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-[13px] leading-relaxed text-black/60">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
