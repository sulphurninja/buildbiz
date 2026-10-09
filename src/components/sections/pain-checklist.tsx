"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "cn";
import { site } from "@/content/site";
import { Reveal } from "@/components/funnel/reveal";

export function PainChecklist() {
  const [ticked, setTicked] = React.useState<boolean[]>(() => site.pains.map(() => false));
  const count = ticked.filter(Boolean).length;

  const toggle = (i: number) => setTicked((t) => t.map((v, k) => (k === i ? !v : v)));

  return (
    <div>
      <ul className="space-y-3">
        {site.pains.map((p, i) => (
          <Reveal as="li" key={p.title} delay={i * 60}>
            <button
              type="button"
              onClick={() => toggle(i)}
              aria-pressed={ticked[i]}
              className={cn(
                "flex w-full items-start gap-4 rounded-2xl border px-5 py-4 text-left transition-all duration-200",
                ticked[i] ? "border-gold/60 bg-gold-soft" : "border-line bg-wine-2/60 hover:border-gold/35",
              )}
            >
              <span
                className={cn(
                  "mt-1 flex size-6 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200",
                  ticked[i] ? "border-gold bg-gold text-paper" : "border-cream/30 bg-transparent",
                )}
              >
                {ticked[i] && <Check className="size-4" strokeWidth={3.5} />}
              </span>
              <span>
                <span className={cn("block font-display text-[1.15rem] font-bold leading-snug", ticked[i] ? "text-cream" : "text-cream/90")}>{p.title}</span>
                <span className="mt-0.5 block text-[13.5px] leading-snug text-cream/55">{p.body}</span>
              </span>
            </button>
          </Reveal>
        ))}
      </ul>

      <div
        className={cn(
          "mt-5 overflow-hidden rounded-2xl border text-center transition-all duration-300",
          count > 0 ? "max-h-24 border-gold/50 bg-gold-soft px-5 py-4 opacity-100" : "max-h-0 border-transparent p-0 opacity-0",
        )}
        aria-live="polite"
      >
        <p className="text-[15px] font-semibold text-cream">
          {count} of {site.pains.length} ticked —{" "}
          <span className="font-accent text-[1.15rem] italic text-gold">{count >= 3 ? "this workshop was built for you." : "each one is a gap this system closes."}</span>
        </p>
      </div>
    </div>
  );
}
