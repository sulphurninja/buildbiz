import type { Metadata } from "next";
import { hqLoaders } from "@/components/hq/modules/registry";
import { ModulePlaceholder } from "@/components/hq/placeholder";

export const metadata: Metadata = { title: "My Today" };

export default async function HQHome() {
  const load = hqLoaders.today;
  if (!load) return <ModulePlaceholder id="today" />;
  const { default: Today } = await load();
  return <Today />;
}
