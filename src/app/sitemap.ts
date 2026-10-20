import type { MetadataRoute } from "next";
import { industries } from "@/content/industries";
import { siteUrl } from "@/content/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl;
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    ...industries.map((industry) => ({ url: `${base}/industries/${industry.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: `${base}/workshop`, changeFrequency: "weekly", priority: 0.6 },
  ];
}
