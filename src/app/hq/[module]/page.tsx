import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hqModuleById, hqModules } from "@/components/hq/nav";
import { hqLoaders } from "@/components/hq/modules/registry";
import { ModulePlaceholder } from "@/components/hq/placeholder";

export function generateStaticParams() {
  return hqModules.filter((m) => m.id !== "today").map((m) => ({ module: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ module: string }> }): Promise<Metadata> {
  const { module: id } = await params;
  return { title: hqModuleById[id]?.label ?? "Command center" };
}

export default async function HQModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module: id } = await params;
  if (!hqModuleById[id] || id === "today") notFound();
  const load = hqLoaders[id];
  if (!load) return <ModulePlaceholder id={id} />;
  const { default: Module } = await load();
  return <Module />;
}
