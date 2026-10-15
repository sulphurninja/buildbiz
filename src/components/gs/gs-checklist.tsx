"use client";

import * as React from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { site } from "@/content/site";

/** GS-style "This Workshop is For You If" — user-tickable checkboxes, unticked by default. */
export function GsChecklist() {
  const [ticked, setTicked] = React.useState<boolean[]>(() => site.pains.map(() => false));
  const count = ticked.filter(Boolean).length;

  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex items-end justify-between gap-8">
          <div>
            <h2 className="gs-head text-[26px] font-bold sm:text-[32px]">Tick What Sounds Like Your Average Tuesday</h2>
            <p className="mt-2 text-sm text-black/50">Be honest. Nobody&apos;s watching.</p>
          </div>
          <Image
            src="/gs/photo-chaos.jpg"
            alt="Business owner juggling calls, chats and fires"
            width={360}
            height={360}
            className="hidden w-36 shrink-0 rounded-xl border border-black/10 sm:block lg:w-44"
          />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {site.pains.map((p, i) => (
            <button
              key={p.title}
              type="button"
              aria-pressed={ticked[i]}
              onClick={() => setTicked((t) => t.map((v, j) => (j === i ? !v : v)))}
              className={`flex items-start gap-3.5 rounded-lg border p-4 text-left transition-colors ${
                ticked[i] ? "border-[#1e40af]/40 bg-[#eef2ff]" : "border-black/10 bg-[#fdf8ee] hover:border-black/25"
              }`}
            >
              <span
                className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
                  ticked[i] ? "border-[#1e40af] bg-[#1e40af]" : "border-black/30 bg-white"
                }`}
              >
                {ticked[i] && <Check className="size-3.5 text-white" strokeWidth={3} />}
              </span>
              <span>
                <span className="block text-[15px] font-semibold leading-snug">{p.title}</span>
                <span className="mt-1 block text-[13px] leading-relaxed text-black/55">{p.body}</span>
              </span>
            </button>
          ))}
        </div>

        <p className="mt-6 text-sm text-black/50" aria-live="polite">
          {count >= 2 ? (
            <>
              {count} ticked — <span className="font-semibold text-black">this is exactly what you&apos;ll fix, live, with us.</span>
            </>
          ) : (
            <>Ticked two or more? This workshop was built for you.</>
          )}
        </p>
      </div>
    </section>
  );
}
