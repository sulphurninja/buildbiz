import type { Metadata } from "next";
import { IBM_Plex_Sans, Poppins } from "next/font/google";
import { site } from "@/content/site";

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-gs-head",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-gs-body",
});

export const metadata: Metadata = {
  title: `${site.event.title} — ${site.brand.name}`,
  description: `2 live nights. 6 working systems. Build the AI operating system that runs your team, sales, ops & follow-ups — at ₹${site.event.price}.`,
};

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return <div className={`${plex.variable} ${poppins.variable} gs-root`}>{children}</div>;
}
