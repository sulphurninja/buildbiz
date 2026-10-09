import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, Instrument_Serif } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { site } from "@/content/site";
import "./globals.css";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const accent = Instrument_Serif({
  variable: "--font-accent",
  subsets: ["latin"],
  display: "swap",
  weight: "400",
  style: ["normal", "italic"],
});

const title = `${site.brand.name} — Steal the Business Operating System India's Smartest Founders Use | Live ₹${site.event.price} Workshop`;
const description = `Live 2-day workshop (${site.event.dateLabel}, ${site.event.timeLabel}) where you build the AI system that runs your team, sales, operations and follow-ups. No code. No IT team. ₹${site.event.price} + GST, both days included.`;

export const metadata: Metadata = {
  metadataBase: new URL(site.brand.url),
  title,
  description,
  openGraph: { title, description, type: "website", locale: "en_IN", siteName: site.brand.name },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#faf6f0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${sans.variable} ${display.variable} ${accent.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster theme="light" position="bottom-left" offset={{ bottom: 96, left: 16 }} mobileOffset={{ bottom: 88, left: 12, right: 12 }} visibleToasts={2} />
      </body>
    </html>
  );
}
