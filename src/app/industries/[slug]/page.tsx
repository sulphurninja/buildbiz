import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findIndustry, industries } from "@/content/industries";
import { deskLoaders } from "@/components/desk/registry";

export const instant = false;

export function generateStaticParams() {
  return industries.map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const industry = findIndustry(slug);
  if (!industry) return {};
  return {
    title: `${industry.name} · BuildBizAI`,
    description: industry.summary,
  };
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const load = deskLoaders[slug];
  if (!findIndustry(slug) || !load) notFound();
  const { default: Desk } = await load();
  return <Desk />;
}
