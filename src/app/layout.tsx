import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, Instrument_Serif, JetBrains_Mono, Newsreader } from "next/font/google";
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

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const serif = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

const title = "BuildBizAI — Industry software you own";
const description =
  "Industry software you can open and work. Twenty-three live desks, each built for a different kind of business, with fictional companies and working controls.";

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
    <html lang="en-IN" data-scroll-behavior="smooth" className={`${sans.variable} ${display.variable} ${accent.variable} ${mono.variable} ${serif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster theme="light" position="bottom-left" offset={{ bottom: 96, left: 16 }} mobileOffset={{ bottom: 88, left: 12, right: 12 }} visibleToasts={2} />
      </body>
    </html>
  );
}
