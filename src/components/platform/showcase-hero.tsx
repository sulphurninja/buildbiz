"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "cn";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { industries, sectors } from "@/content/industries";
import { LivePreview, previewSpecs } from "@/components/platform/live-preview";

const reel = ["textile", "solar-epc", "restaurant", "auto-parts", "stone-yard", "d2c", "fleet", "jewellery", "courier", "dental", "agency", "spice-export", "interiors", "dairy-fpo"];

export function ShowcaseHero() {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const slug = reel[index];
  const industry = industries.find((i) => i.slug === slug)!;
  const spec = previewSpecs[slug];

  React.useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % reel.length), 5200);
    return () => window.clearTimeout(timer);
  }, [paused, index]);

  const step = (d: number) => setIndex((i) => (i + d + reel.length) % reel.length);

  return (
    <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[12px] font-medium text-[#6e2b36] ring-1 ring-black/10">
          <span className="bb-pulse h-1.5 w-1.5 rounded-full bg-[#3f8f5a]" />
          AI-native operating systems for Indian business
        </p>
        <h1 className="font-display mt-5 text-[46px] font-semibold leading-[0.98] tracking-tight text-[#1c1917] sm:text-[68px]">
          Built for your industry.
          <span className="font-accent block font-normal italic text-[#6e2b36]">Not bent to fit it.</span>
        </h1>
        <p className="mt-5 max-w-[31rem] text-[17px] leading-relaxed text-[#4f4942]">
          One live command centre for operations, money and people, designed around how your business actually runs. AI agents chase, draft and flag alongside your team, so decisions reach you ready to approve.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#industries" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#6e2b36] px-6 text-[14.5px] font-semibold text-white shadow-[0_14px_30px_-14px_#6e2b36] transition-transform hover:-translate-y-0.5">
            Explore {industries.length} industries <ArrowRight className="h-4 w-4" />
          </a>
          <Link href={`/industries/${slug}`} className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[14.5px] font-semibold text-[#1c1917] ring-1 ring-black/10 transition-transform hover:-translate-y-0.5">
            Launch live demo
          </Link>
        </div>
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-[#5c564e]">
          {["Industry-native, not a template", "AI agents on every desk", "Your data, your accounts"].map((item) => (
            <li key={item} className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-[#3f8f5a]" strokeWidth={2.6} />
              {item}
            </li>
          ))}
        </ul>
        <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-black/10 pt-6">
          {[
            [String(industries.length), "industries live"],
            [String(sectors.length), "sectors"],
            ["24/7", "AI agents at work"],
          ].map(([n, l]) => (
            <div key={l}>
              <dt className="font-display text-[28px] font-semibold leading-none text-[#1c1917]">{n}</dt>
              <dd className="mt-1 text-[12.5px] text-[#6b645c]">{l}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="absolute -inset-6 -z-10 rounded-[40px] opacity-60 blur-3xl transition-colors duration-700" style={{ background: `radial-gradient(60% 60% at 60% 40%, ${spec.accent}44, transparent)` }} />
        <div className="rounded-[22px] bg-white p-2.5 shadow-[0_40px_90px_-40px_rgba(28,25,23,0.55)] ring-1 ring-black/10">
          <div className="flex items-center gap-2 px-2 pb-2 pt-0.5 text-[11.5px] text-[#8a8175]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#e7b3a2]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ead48a]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#b7d3b0]" />
            <span className="mx-auto flex items-center gap-1.5 truncate rounded-full bg-[#f4efe7] px-3 py-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3f8f5a]" />
              buildbiz.ai/industries/{slug}
            </span>
          </div>
          <Link href={`/industries/${slug}`} className="group relative block overflow-hidden rounded-[14px] ring-1 ring-black/5">
            <div>
              <LivePreview slug={slug} speed={900} />
            </div>
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1.5 text-[12px] font-medium text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
              Open the live dashboard <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <button type="button" onClick={() => step(-1)} aria-label="Previous" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-black/10 hover:bg-[#faf7f2]">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold text-[#1c1917]">
              {industry.name}
            </p>
            <p className="truncate text-[12.5px] text-[#6b645c]">
              {industry.company}, {industry.city} · {industry.signature}
            </p>
            <div className="mt-2 flex gap-1">
              {reel.map((s, i) => (
                <button key={s} type="button" aria-label={s} onClick={() => setIndex(i)} className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#1c1917]/10">
                  <span className={cn("block h-full rounded-full bg-[#6e2b36]", i < index ? "w-full" : i === index ? (paused ? "w-1/2" : "hero-progress") : "w-0")} />
                </button>
              ))}
            </div>
          </div>
          <button type="button" onClick={() => setPaused((p) => !p)} aria-label={paused ? "Play" : "Pause"} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-black/10 hover:bg-[#faf7f2]">
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Next" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-black/10 hover:bg-[#faf7f2]">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
