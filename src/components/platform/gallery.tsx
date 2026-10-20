"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "cn";
import { ArrowUpRight, Search } from "lucide-react";
import { industries, sectors } from "@/content/industries";
import { LivePreview, previewSpecs } from "@/components/platform/live-preview";

/** Gallery order: strongest visuals first, dark desks spread out so no two sit side by side. */
const showcaseOrder = [
  "textile", "restaurant", "d2c",
  "stone-yard", "dental", "fleet",
  "auto-parts", "jewellery", "realty",
  "agency", "print-shop", "dairy-fpo",
  "solar-epc", "electronics-retail", "courier",
  "industrial-supply", "spice-export", "pharma-distribution",
  "interiors", "job-shop", "lab-supply",
  "tours", "design-studio", "fmcg-route",
  "learning-kits", "advisory",
];
const rank = (slug: string) => {
  const i = showcaseOrder.indexOf(slug);
  return i < 0 ? showcaseOrder.length : i;
};
const ordered = [...industries].sort((a, b) => rank(a.slug) - rank(b.slug));

export function IndustryGallery() {
  const [sector, setSector] = React.useState("All");
  const [query, setQuery] = React.useState("");
  const needle = query.trim().toLowerCase();
  const shown = ordered.filter((industry) => {
    const inSector = sector === "All" || industry.sector === sector;
    const haystack = `${industry.name} ${industry.company} ${industry.city} ${industry.sector} ${industry.signature}`.toLowerCase();
    return inSector && haystack.includes(needle);
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-2xl">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#6e2b36]">The industries</p>
          <h2 className="font-display mt-2 text-[36px] font-semibold leading-[1.05] tracking-tight text-[#1c1917] sm:text-[44px]">
            Pick a business. <span className="font-accent font-normal italic text-[#6e2b36]">It&apos;s already running.</span>
          </h2>
          <p className="mt-2 text-[14.5px] text-[#5c564e]">
            Showing {shown.length} of {industries.length}. Every card is the real dashboard, live and moving. Click one to work inside it.
          </p>
        </div>
        <label className="flex h-11 w-full max-w-xs items-center gap-2 rounded-full bg-white px-4 ring-1 ring-black/10 focus-within:ring-[#6e2b36]">
          <Search className="h-4 w-4 text-[#8a8175]" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search industry, business, city" className="h-full flex-1 bg-transparent text-[13.5px] outline-none" />
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-1.5" role="tablist" aria-label="Filter by sector">
        {["All", ...sectors].map((item) => {
          const count = item === "All" ? industries.length : industries.filter((industry) => industry.sector === item).length;
          const on = sector === item;
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setSector(item)}
              className={cn("h-7 rounded-full px-2.5 text-[12px] font-medium transition-colors", on ? "bg-[#1c1917] text-white" : "bg-white text-[#3a332c] ring-1 ring-black/10 hover:bg-[#faf7f2]")}
            >
              {item} <span className={cn("ml-0.5 font-mono text-[11px]", on ? "text-white/60" : "text-[#8a8175]")}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((industry) => {
          const spec = previewSpecs[industry.slug];
          return (
            <Link
              key={industry.slug}
              href={`/industries/${industry.slug}`}
              className="group flex flex-col rounded-[24px] bg-white p-2.5 shadow-[0_18px_44px_-34px_rgba(28,25,23,0.55)] ring-1 ring-black/[0.06] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-34px_rgba(28,25,23,0.6)]"
            >
              <div className="relative overflow-hidden rounded-[17px] ring-1 ring-black/[0.06]">
                <div className="transition-transform duration-500 group-hover:scale-[1.03]">
                  <LivePreview slug={industry.slug} />
                </div>
                <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[10.5px] font-medium text-white backdrop-blur">
                  <span className="bb-pulse h-1.5 w-1.5 rounded-full" style={{ background: spec?.accent ?? "#e4c27a" }} />
                  live
                </span>
              </div>
              <div className="flex flex-1 flex-col px-2 pb-1.5 pt-3.5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-[18px] font-semibold leading-tight tracking-tight text-[#1c1917]">{industry.name}</h3>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ring-black/10 transition-colors group-hover:bg-[#6e2b36] group-hover:text-white group-hover:ring-[#6e2b36]">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-[#6b645c]">
                  {industry.company} · {industry.city}
                </p>
                <p className="mt-2 line-clamp-2 text-[13px] leading-snug text-[#3f3a34]">{industry.summary}</p>
                <div className="mt-auto flex items-center gap-2 pt-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold" style={{ color: spec?.accent, background: `${spec?.accent ?? "#6e2b36"}14` }}>
                    {industry.signature}
                  </span>
                  <span className="text-[11.5px] text-[#8a8175]">{industry.sector}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {shown.length === 0 && <p className="mt-8 text-[14px] text-[#5c564e]">Nothing matches. Try a city, or clear the search.</p>}
    </div>
  );
}
