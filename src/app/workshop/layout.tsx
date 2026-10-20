import type { Metadata } from "next";
import { site } from "@/content/site";
import { shareImage } from "@/content/site-url";

const title = `${site.brand.name}: Steal the Business Operating System India's Smartest Founders Use | Live ₹${site.event.price} Workshop`;
const description = `Live 2-day workshop (${site.event.dateLabel}, ${site.event.timeLabel}) where you build the AI system that runs your team, sales, operations and follow-ups. No code. No IT team. ₹${site.event.price} + GST, both days included.`;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  openGraph: { title, description, url: "/workshop", type: "website", locale: "en_IN", siteName: site.brand.name, images: [shareImage] },
  twitter: { card: "summary_large_image", title, description, images: [shareImage.url] },
};

export default function WorkshopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
