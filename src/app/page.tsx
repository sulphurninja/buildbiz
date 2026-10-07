import { FunnelProvider } from "@/components/funnel/funnel-provider";
import { PurchaseToasts } from "@/components/funnel/purchase-toasts";
import { SiteFooter } from "@/components/funnel/site-footer";
import { SiteHeader } from "@/components/funnel/site-header";
import { StickyFooter } from "@/components/funnel/sticky-footer";
import { BeforeAfter } from "@/components/sections/before-after";
import { Bonuses } from "@/components/sections/bonuses";
import { Curriculum } from "@/components/sections/curriculum";
import { Ecosystem } from "@/components/sections/ecosystem";
import { Faq } from "@/components/sections/faq";
import { FinalCta } from "@/components/sections/final-cta";
import { Framework } from "@/components/sections/framework";
import { Hero } from "@/components/sections/hero";
import { JobTitles } from "@/components/sections/job-titles";
import { Mentor } from "@/components/sections/mentor";
import { PainPoints } from "@/components/sections/pain-points";
import { Qualify } from "@/components/sections/qualify";
import { TechTimeline } from "@/components/sections/tech-timeline";
import { Testimonials } from "@/components/sections/testimonials";
import { TrustStrip } from "@/components/sections/trust-strip";
import { WhoFor } from "@/components/sections/who-for";

export default function Page() {
  return (
    <FunnelProvider>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <TrustStrip />
        <PainPoints />
        <JobTitles />
        <TechTimeline />
        <BeforeAfter />
        <Framework />
        <Curriculum />
        <Ecosystem />
        <WhoFor />
        <Mentor />
        <Testimonials />
        <Bonuses />
        <Qualify />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
      <StickyFooter />
      <PurchaseToasts />
    </FunnelProvider>
  );
}
