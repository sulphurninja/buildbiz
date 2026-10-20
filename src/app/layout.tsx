import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, Instrument_Serif, JetBrains_Mono, Newsreader } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { shareImage, siteUrl } from "@/content/site-url";
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

const title = "BuildBizAI | AI operating systems built for every industry";
const description =
  "Industry-native business software with AI agents on every desk. Run operations, money and people from one live command centre, designed around how your business actually works. Explore 26 live industry dashboards.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: "%s | BuildBizAI" },
  description,
  applicationName: "BuildBizAI",
  keywords: [
    "AI business software",
    "industry software India",
    "business operating system",
    "AI agents for business",
    "ERP for SMEs",
    "MSME software",
    "manufacturing dashboard",
    "distributor software",
    "restaurant management software",
    "pharma distribution software",
    "solar EPC software",
    "BuildBiz AI",
  ],
  authors: [{ name: "BuildBizAI" }],
  creator: "BuildBizAI",
  alternates: { canonical: "/" },
  openGraph: { title, description, url: "/", type: "website", locale: "en_IN", siteName: "BuildBizAI", images: [shareImage] },
  twitter: { card: "summary_large_image", title, description, images: [shareImage.url] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  category: "business software",
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
