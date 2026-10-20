"use client";

/**
 * BuildBiz HQ design system.
 *
 * Surfaces: cream paper, warm-white panels, hairline warm borders, 16px radius.
 * Type: serif (Newsreader) for page and panel titles, Inter for UI, JetBrains Mono for figures.
 * Colour: ink for text, wine (accent) for primary actions and focus, gold for AI and highlights,
 *         green/amber/red only for state. Never colour for decoration.
 * Labels: small caps, tracked, muted ("QUICK ACCESS"), used to name every section.
 * AI: anything an agent produced carries the gold spark mark so people know where it came from.
 *
 * Modules should build from these plus the shared widgets in ../desk (ui, charts, data).
 */

import * as React from "react";
import { cn } from "cn";
import { Sparkles, type LucideIcon } from "lucide-react";
import { personById } from "./data";

export * from "../desk/ui";
export { AreaChart, Bars, Donut, Gauge, HBars, HeatGrid, Sparkline } from "../desk/charts";
export { AgingBar, ApprovalQueue, Board, Checklist, Countdown, DataTable, Gantt } from "../desk/data";
export type { Column } from "../desk/data";
export type { Tone } from "../desk/types";

export function SectionLabel({ children, className, action }: { children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <div className={cn("mb-3 flex items-center justify-between gap-3", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-d-mute">{children}</p>
      {action}
    </div>
  );
}

export function PageHeader({ kicker, title, sub, actions, icon: Icon }: { kicker?: string; title: React.ReactNode; sub?: React.ReactNode; actions?: React.ReactNode; icon?: LucideIcon }) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {kicker && (
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-d-accent">
            {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={2} />}
            {kicker}
          </p>
        )}
        <h1 className="mt-1.5 font-serif text-[34px] font-medium leading-[1.05] tracking-[-0.01em] sm:text-[40px]">{title}</h1>
        {sub && <p className="mt-2 max-w-[720px] text-[14.5px] leading-relaxed text-d-mute">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/** Avatar coloured by teammate; falls back to initials for anyone else. */
export function PersonAvatar({ id, name, size = 28, ring }: { id?: string; name?: string; size?: number; ring?: boolean }) {
  const p = id ? personById[id] : undefined;
  const label = p?.initials ?? (name ?? "?").split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  const color = p?.color ?? "#8a8175";
  if (id === "agent") {
    return (
      <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#1d1714] text-[#e4c27a]" style={{ width: size, height: size }}>
        <Sparkles style={{ width: size * 0.5, height: size * 0.5 }} />
      </span>
    );
  }
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-semibold", ring && "ring-2 ring-d-panel")}
      style={{ width: size, height: size, fontSize: size * 0.38, color, background: `color-mix(in oklab, ${color} 14%, var(--d-panel))`, boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${color} 30%, transparent)` }}
      title={p?.name ?? name}
    >
      {label}
    </span>
  );
}

export function PersonChip({ id, sub }: { id: string; sub?: React.ReactNode }) {
  const p = personById[id];
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <PersonAvatar id={id} size={24} />
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-medium leading-tight">{p?.first ?? id}</span>
        {sub && <span className="block truncate text-[11.5px] leading-tight text-d-mute">{sub}</span>}
      </span>
    </span>
  );
}

/** Gold "made by AI" mark. */
export function AIMark({ label = "AI", className }: { label?: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-[color-mix(in_oklab,var(--d-gold)_16%,var(--d-panel))] px-1.5 py-0.5 text-[10.5px] font-semibold text-[color-mix(in_oklab,var(--d-gold)_75%,black)]", className)}>
      <Sparkles className="h-3 w-3" /> {label}
    </span>
  );
}

/** A suggestion or summary written by an agent. */
export function AgentNote({ title, children, action, className }: { title?: React.ReactNode; children: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-[14px] border border-[color-mix(in_oklab,var(--d-gold)_35%,var(--d-line))] bg-[color-mix(in_oklab,var(--d-gold)_8%,var(--d-panel))] p-3.5", className)}>
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1d1714] text-[#e4c27a]">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          {title && <p className="text-[13.5px] font-semibold leading-snug">{title}</p>}
          <div className={cn("text-[13px] leading-relaxed text-d-ink/85", title && "mt-0.5")}>{children}</div>
          {action && <div className="mt-2.5 flex flex-wrap gap-2">{action}</div>}
        </div>
      </div>
    </div>
  );
}

/** Compact KPI tile used in HQ stat rows. */
export function Metric({
  label,
  value,
  delta,
  good,
  hint,
  className,
  onClick,
}: {
  label: string;
  value: React.ReactNode;
  delta?: string;
  /** whether the delta is good news; defaults to "a rise is good" */
  good?: boolean;
  hint?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const isGood = good ?? delta?.trim().startsWith("+");
  const Tag = onClick ? "button" : "div";
  return (
    <Tag type={onClick ? "button" : undefined} onClick={onClick} className={cn("desk-card min-w-0 px-4 py-3.5 text-left", onClick && "transition-transform hover:-translate-y-0.5", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-d-mute">{label}</p>
      <p className="mt-1.5 flex items-baseline gap-2">
        <span className="tnum font-serif text-[30px] font-medium leading-none tracking-tight">{value}</span>
        {delta && (
          <span className="font-mono text-[11.5px] font-semibold" style={{ color: isGood ? "var(--d-ok)" : "var(--d-late)" }}>
            {delta}
          </span>
        )}
      </p>
      {hint && <p className="mt-1.5 truncate text-[12px] text-d-mute">{hint}</p>}
    </Tag>
  );
}

export function rupees(v: number) {
  if (Math.abs(v) >= 1e7) return `₹${(v / 1e7).toFixed(2).replace(/\.?0+$/, "")} Cr`;
  if (Math.abs(v) >= 1e5) return `₹${(v / 1e5).toFixed(1).replace(/\.0$/, "")} L`;
  if (Math.abs(v) >= 1e3) return `₹${(v / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
  return `₹${v.toLocaleString("en-IN")}`;
}
