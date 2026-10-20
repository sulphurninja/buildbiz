import Link from "next/link";
import { faqs, ownership, steps } from "@/content/platform";
import { PlatformNav } from "@/components/platform/nav";
import { Logo } from "@/components/funnel/logo";
import { IndustryGallery } from "@/components/platform/gallery";
import { industries } from "@/content/industries";
import { ShowcaseHero } from "@/components/platform/showcase-hero";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function HomePage() {
  return (
    <div id="top" className="lp-bg relative min-h-screen overflow-x-clip text-[#1c1917]">
      <div aria-hidden className="lp-aurora pointer-events-none absolute inset-x-0 top-0 h-[1100px]">
        <span className="lp-blob lp-blob-a" />
        <span className="lp-blob lp-blob-b" />
        <span className="lp-blob lp-blob-c" />
      </div>
      <PlatformNav />
      <main className="relative">
        <section className="mx-auto max-w-7xl px-5 pb-16 pt-12 lg:pb-24 lg:pt-16">
          <ShowcaseHero />
        </section>

        <section aria-label="Industries" className="overflow-hidden border-y border-black/10 bg-white/60 py-4">
          <div className="bb-x flex w-max gap-10 whitespace-nowrap" style={{ animationDuration: "90s" }}>
            {[...industries, ...industries].map((industry, i) => (
              <span key={`${industry.slug}-${i}`} className="inline-flex items-center gap-2.5 text-[14px] text-[#3f3a34]">
                <span className="h-3 w-3 rounded-[4px]" style={{ background: `linear-gradient(135deg, ${industry.swatch[0]} 50%, ${industry.swatch[1]} 50%)` }} />
                <span className="font-medium text-[#1c1917]">{industry.name}</span>
                <span className="text-[#8a8175]">{industry.signature}</span>
              </span>
            ))}
          </div>
        </section>


        <section id="industries" className="pb-10 pt-16">
          <div className="mx-auto max-w-7xl px-5">
            <IndustryGallery />
          </div>
        </section>

        <section id="how" className="mx-auto max-w-7xl px-5 py-16">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#6e2b36]">How it works</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <article key={step.n} className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
                <p className="font-accent text-[28px] text-[#6e2b36]">{step.n}</p>
                <h2 className="font-display mt-2 text-[20px] font-semibold">{step.title}</h2>
                <p className="mt-2 text-[14px] leading-relaxed text-[#5c564e]">{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="py-4">
          <div className="mx-auto grid max-w-7xl gap-4 px-5 md:grid-cols-2">
            {ownership.map((item) => (
              <article key={item.title} className="rounded-2xl bg-white p-5 ring-1 ring-black/8">
                <h2 className="font-display text-[20px] font-semibold">{item.title}</h2>
                <p className="mt-2 text-[14.5px] leading-relaxed text-[#5c564e]">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="py-16">
          <div className="mx-auto max-w-3xl px-5">
            <h2 className="font-display text-[32px] font-semibold tracking-tight">Questions</h2>
            <Accordion type="single" collapsible className="mt-4">
              {faqs.map((faq) => (
                <AccordionItem key={faq.q} value={faq.q}>
                  <AccordionTrigger className="text-[15px] hover:no-underline">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-[14px] leading-relaxed text-[#5c564e]">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>
      <footer className="relative border-t border-black/10 px-5 py-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-[12.5px] text-[#6b645c]">
          <div className="flex items-center gap-3">
            <Logo className="size-8" />
            <p>
              <span className="font-display text-[15px] font-bold text-[#1c1917]">BuildBizAI</span>
              <span className="ml-2">Dashboards use fictional companies.</span>
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/workshop" className="hover:text-[#1c1917]">
              Workshop
            </Link>
            <Link href="/workshop/v2" className="hover:text-[#1c1917]">
              Workshop, second page
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
