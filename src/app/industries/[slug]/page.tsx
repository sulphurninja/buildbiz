import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findIndustry, industries } from "@/content/industries";
import { deskLoaders } from "@/components/desk/registry";
import { shareImage } from "@/content/site-url";

export const instant = false;

export function generateStaticParams() {
  return industries.map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const industry = findIndustry(slug);
  if (!industry) return {};
  const title = `${industry.name} software, live dashboard`;
  const description = `${industry.summary} A live, working demo of BuildBizAI for ${industry.name.toLowerCase()} businesses, with AI agents and a copilot built in.`;
  return {
    title,
    description,
    alternates: { canonical: `/industries/${industry.slug}` },
    openGraph: { title: `${title} | BuildBizAI`, description, url: `/industries/${industry.slug}`, type: "website", locale: "en_IN", siteName: "BuildBizAI", images: [shareImage] },
    twitter: { card: "summary_large_image", title: `${title} | BuildBizAI`, description, images: [shareImage.url] },
  };
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const load = deskLoaders[slug];
  if (!findIndustry(slug) || !load) notFound();
  const { default: Desk } = await load();
  return <Desk />;
}
