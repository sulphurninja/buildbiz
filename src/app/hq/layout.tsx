import type { Metadata } from "next";
import { HQShell } from "@/components/hq/shell";

export const metadata: Metadata = {
  title: { default: "Command center", template: "%s | BuildBizAI command center" },
  description: "The command center BuildBizAI runs its own business on.",
  robots: { index: false, follow: false },
};

export default function HQLayout({ children }: { children: React.ReactNode }) {
  return <HQShell>{children}</HQShell>;
}
