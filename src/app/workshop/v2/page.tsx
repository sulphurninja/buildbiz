import { FunnelProvider } from "@/components/funnel/funnel-provider";
import { PurchaseToasts } from "@/components/funnel/purchase-toasts";
import { GsFooter, GsStickyBar, GsTopStrip } from "@/components/gs/gs-chrome";
import { GsChecklist } from "@/components/gs/gs-checklist";
import { GsFaq } from "@/components/gs/gs-faq";
import { GsHero } from "@/components/gs/gs-hero";
import {
  GsBonuses,
  GsFramework,
  GsIndustries,
  GsMentor,
  GsPricing,
  GsSchedule,
  GsTestimonials,
  GsTimeline,
  GsWhyCheap,
} from "@/components/gs/gs-sections";

export default function V2Page() {
  return (
    <FunnelProvider>
      <GsTopStrip />
      <main>
        <GsHero />
        <GsChecklist />
        <GsTimeline />
        <GsSchedule />
        <GsFramework />
        <GsIndustries />
        <GsTestimonials />
        <GsMentor />
        <GsBonuses />
        <GsPricing />
        <GsWhyCheap />
        <GsFaq />
      </main>
      <GsFooter />
      <GsStickyBar />
      <PurchaseToasts />
    </FunnelProvider>
  );
}
