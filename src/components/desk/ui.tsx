"use client";

import * as React from "react";
import { cn } from "cn";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ArrowDownRight, ArrowUpRight, Search, X, type LucideIcon } from "lucide-react";
import type { Tone } from "./types";

export function toneVar(tone: Tone = "neutral") {
  switch (tone) {
    case "ok":
      return "var(--d-ok)";
    case "warn":
      return "var(--d-warn)";
    case "late":
      return "var(--d-late)";
    case "info":
      return "var(--d-info)";
    case "accent":
      return "var(--d-accent)";
    default:
      return "var(--d-mute)";
  }
}

export function inr(value: number, opts: { compact?: boolean } = {}) {
  if (opts.compact) {
    if (Math.abs(value) >= 1e7) return `₹${(value / 1e7).toFixed(2).replace(/\.?0+$/, "")} Cr`;
    if (Math.abs(value) >= 1e5) return `₹${(value / 1e5).toFixed(1).replace(/\.0$/, "")} L`;
    if (Math.abs(value) >= 1e3) return `₹${(value / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export function num(value: number) {
  return value.toLocaleString("en-IN");
}

/* ---------------- Surfaces ---------------- */

export function Panel({
  title,
  sub,
  icon: Icon,
  action,
  children,
  className,
  bodyClassName,
  live,
}: {
  title?: React.ReactNode;
  sub?: React.ReactNode;
  icon?: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  live?: boolean;
}) {
  return (
    <section className={cn("desk-card desk-rise min-w-0", className)}>
      {(title || action) && (
        <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4">
          <div className="flex min-w-0 items-start gap-2.5">
            {live && <span className="desk-ping mt-2 h-2 w-2 shrink-0 rounded-full bg-d-ok" />}
            {Icon && !live && <Icon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-d-accent" strokeWidth={1.8} />}
            <div className="min-w-0">
              {title && <h3 className="desk-h text-[17px] font-semibold leading-tight tracking-tight">{title}</h3>}
              {sub && <p className="mt-0.5 text-[12.5px] text-d-mute">{sub}</p>}
            </div>
          </div>
          {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
        </header>
      )}
      <div className={cn("p-5 pt-4", bodyClassName)}>{children}</div>
    </section>
  );
}

export function Btn({
  children,
  icon: Icon,
  variant = "outline",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: LucideIcon;
  variant?: "solid" | "outline" | "soft" | "ghost" | "danger";
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap font-medium transition-all active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45",
        "rounded-[calc(var(--d-radius,18px)*0.55)]",
        size === "sm" ? "h-8 px-2.5 text-[12.5px]" : "h-9 px-3.5 text-[13.5px]",
        variant === "solid" && "bg-d-accent text-d-accent-ink shadow-[0_6px_16px_-8px_var(--d-accent)] hover:brightness-110",
        variant === "outline" && "border border-d-line bg-d-panel text-d-ink hover:bg-d-sunk",
        variant === "soft" && "bg-d-soft text-d-accent hover:brightness-[0.97]",
        variant === "ghost" && "text-d-mute hover:bg-d-sunk hover:text-d-ink",
        variant === "danger" && "bg-d-late text-white hover:brightness-110",
        className,
      )}
    >
      {Icon && <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={1.9} />}
      {children}
    </button>
  );
}

export function IconBtn({
  icon: Icon,
  label,
  active,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon: LucideIcon; label: string; active?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...props}
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[calc(var(--d-radius,18px)*0.55)] border transition-all active:scale-95",
        active ? "border-d-accent bg-d-accent text-d-accent-ink" : "border-d-line bg-d-panel text-d-ink hover:bg-d-sunk",
        className,
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={1.9} />
    </button>
  );
}

export function Pill({ children, tone = "neutral", className, mono }: { children: React.ReactNode; tone?: Tone; className?: string; mono?: boolean }) {
  const color = toneVar(tone);
  return (
    <span
      className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11.5px] font-medium", mono && "font-mono text-[11px]", className)}
      style={{ color: tone === "neutral" ? "var(--d-ink)" : color, background: `color-mix(in oklab, ${tone === "neutral" ? "var(--d-ink)" : color} 11%, transparent)` }}
    >
      {children}
    </span>
  );
}

export function Dot({ tone = "neutral", pulse, className }: { tone?: Tone; pulse?: boolean; className?: string }) {
  return <span className={cn("inline-block h-2 w-2 shrink-0 rounded-full", pulse && "desk-ping", className)} style={{ background: toneVar(tone) }} />;
}

export function Avatar({ name, size = 32, tone = "accent" }: { name: string; size?: number; tone?: Tone }) {
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const color = toneVar(tone);
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.36, color, background: `color-mix(in oklab, ${color} 14%, var(--d-panel))`, boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${color} 25%, transparent)` }}
    >
      {initials}
    </span>
  );
}

export function Stat({
  label,
  value,
  delta,
  deltaGood = true,
  hint,
  icon: Icon,
  trend,
  tone = "accent",
  className,
  onClick,
}: {
  label: string;
  value: React.ReactNode;
  delta?: string;
  deltaGood?: boolean;
  hint?: React.ReactNode;
  icon?: LucideIcon;
  trend?: number[];
  tone?: Tone;
  className?: string;
  onClick?: () => void;
}) {
  const up = delta?.trim().startsWith("+");
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn("desk-card desk-rise group relative flex min-w-0 flex-col p-4 text-left", onClick && "transition-transform hover:-translate-y-0.5", className)}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12.5px] text-d-mute">{label}</p>
        {Icon && (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-d-soft text-d-accent">
            <Icon className="h-4 w-4" strokeWidth={1.8} />
          </span>
        )}
      </div>
      <p className="desk-h tnum mt-1 text-[30px] font-semibold leading-none tracking-tight">{value}</p>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        {delta && (
          <span
            className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono text-[11px] font-medium"
            style={{
              color: (up ? deltaGood : !deltaGood) ? "var(--d-ok)" : "var(--d-late)",
              background: `color-mix(in oklab, ${(up ? deltaGood : !deltaGood) ? "var(--d-ok)" : "var(--d-late)"} 12%, transparent)`,
            }}
          >
            {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {delta}
          </span>
        )}
        {hint && <span className="text-[11.5px] text-d-mute">{hint}</span>}
      </div>
      {trend && trend.length > 1 && (
        <div className="mt-3 h-9">
          <SparkInline data={trend} tone={tone} />
        </div>
      )}
    </Wrapper>
  );
}

function SparkInline({ data, tone }: { data: number[]; tone: Tone }) {
  const id = React.useId().replace(/:/g, "");
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * 100, 34 - ((v - min) / span) * 30]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ");
  const color = toneVar(tone);
  return (
    <svg viewBox="0 0 100 36" preserveAspectRatio="none" className="h-full w-full overflow-visible">
      <defs>
        <linearGradient id={`sg${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L100,36 L0,36 Z`} fill={`url(#sg${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.2" fill={color} />
    </svg>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  size = "md",
}: {
  options: readonly (T | { value: T; label: React.ReactNode; count?: number })[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <div className={cn("desk-noscroll inline-flex max-w-full items-center gap-1 overflow-x-auto", className)} role="tablist">
      {options.map((option) => {
        const item = typeof option === "string" ? { value: option, label: option, count: undefined } : option;
        const on = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(item.value)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[calc(var(--d-radius,18px)*0.5)] border font-medium transition-colors",
              size === "sm" ? "h-7 px-2.5 text-[12px]" : "h-9 px-3.5 text-[13px]",
              on ? "border-d-accent bg-d-accent text-d-accent-ink" : "border-d-line bg-d-panel text-d-ink hover:bg-d-sunk",
            )}
          >
            {item.label}
            {item.count !== undefined && <span className={cn("font-mono text-[11px]", on ? "opacity-80" : "text-d-mute")}>{item.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder, className }: { value: string; onChange: (value: string) => void; placeholder: string; className?: string }) {
  return (
    <label className={cn("relative flex h-9 min-w-0 items-center", className)}>
      <Search className="pointer-events-none absolute left-3 h-4 w-4 text-d-mute" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-full w-full rounded-[calc(var(--d-radius,18px)*0.55)] border border-d-line bg-d-panel pl-9 pr-8 text-[13px] text-d-ink outline-none placeholder:text-d-mute focus:border-d-accent"
      />
      {value && (
        <button type="button" onClick={() => onChange("")} aria-label="Clear search" className="absolute right-2 rounded p-0.5 text-d-mute hover:text-d-ink">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </label>
  );
}

export function Meter({ value, max = 100, tone = "accent", className, height = 6 }: { value: number; max?: number; tone?: Tone; className?: string; height?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cn("w-full overflow-hidden rounded-full bg-d-sunk", className)} style={{ height }}>
      <div className="desk-growx h-full rounded-full transition-[width] duration-700" style={{ width: `${pct}%`, background: toneVar(tone) }} />
    </div>
  );
}

export function KV({ items, cols = 2 }: { items: { k: string; v: React.ReactNode }[]; cols?: 1 | 2 | 3 }) {
  return (
    <dl className={cn("grid gap-x-6 gap-y-3", cols === 1 && "grid-cols-1", cols === 2 && "grid-cols-2", cols === 3 && "grid-cols-3")}>
      {items.map((item) => (
        <div key={item.k} className="min-w-0">
          <dt className="text-[11.5px] text-d-mute">{item.k}</dt>
          <dd className="mt-0.5 truncate text-[13.5px] font-medium">{item.v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-dashed border-d-line px-4 py-8 text-center text-[13px] text-d-mute">{children}</p>;
}

export function Feed({ items, max }: { items: { time: string; who?: string; text: string; tone?: Tone }[]; max?: number }) {
  return (
    <ol className="relative space-y-3.5 before:absolute before:bottom-1 before:left-[5px] before:top-1 before:w-px before:bg-d-line">
      {items.slice(0, max).map((item, index) => (
        <li key={`${item.time}-${index}`} className="desk-rise relative pl-6" style={{ animationDelay: `${index * 40}ms` }}>
          <span className="absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border-2 border-d-panel" style={{ background: toneVar(item.tone ?? "accent") }} />
          <p className="font-mono text-[11px] text-d-mute">
            {item.time}
            {item.who && <span> · {item.who}</span>}
          </p>
          <p className="mt-0.5 text-[13px] leading-snug">{item.text}</p>
        </li>
      ))}
    </ol>
  );
}

/* ---------------- Sheets ---------------- */

export function Sheet({
  open,
  onOpenChange,
  title,
  eyebrow,
  sub,
  children,
  footer,
  width = 480,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  eyebrow?: React.ReactNode;
  sub?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
}) {
  const portalRoot = useDeskRoot();
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal container={portalRoot}>
        <DialogPrimitive.Overlay className="bb-overlay fixed inset-0 z-[60] bg-black/35 backdrop-blur-[2px]" />
        <DialogPrimitive.Content
          className="bb-sheet fixed inset-y-0 right-0 z-[61] flex w-full flex-col bg-d-panel text-d-ink shadow-[-30px_0_80px_rgba(0,0,0,0.22)] outline-none"
          style={{ maxWidth: width }}
        >
          <header className="flex items-start justify-between gap-3 border-b border-d-line px-5 py-4">
            <div className="min-w-0">
              {eyebrow && <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-d-mute">{eyebrow}</p>}
              <DialogPrimitive.Title className="desk-h mt-0.5 text-[20px] font-semibold leading-tight tracking-tight">{title}</DialogPrimitive.Title>
              {sub ? <DialogPrimitive.Description className="mt-1 text-[13px] text-d-mute">{sub}</DialogPrimitive.Description> : <DialogPrimitive.Description className="sr-only">Details</DialogPrimitive.Description>}
            </div>
            <DialogPrimitive.Close className="rounded-lg p-1.5 text-d-mute hover:bg-d-sunk hover:text-d-ink" aria-label="Close">
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </header>
          <div className="desk-scroll flex-1 overflow-y-auto px-5 py-4">{children}</div>
          {footer && <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-d-line px-5 py-3">{footer}</footer>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** Dialogs portal into the desk root so they inherit the industry's CSS variables. */
export const DeskRootContext = React.createContext<HTMLElement | null>(null);
export function useDeskRoot() {
  return React.useContext(DeskRootContext) ?? undefined;
}

export function Modal({
  open,
  onOpenChange,
  title,
  sub,
  children,
  width = 560,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  sub?: React.ReactNode;
  children: React.ReactNode;
  width?: number;
}) {
  const portalRoot = useDeskRoot();
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal container={portalRoot}>
        <DialogPrimitive.Overlay className="bb-overlay fixed inset-0 z-[70] bg-black/40 backdrop-blur-[3px]" />
        <DialogPrimitive.Content
          className="desk-rise fixed left-1/2 top-[12vh] z-[71] w-[calc(100vw-32px)] -translate-x-1/2 overflow-hidden rounded-[calc(var(--d-radius,18px)*1.1)] border border-d-line bg-d-panel text-d-ink shadow-[0_40px_120px_-30px_rgba(0,0,0,0.45)] outline-none"
          style={{ maxWidth: width }}
        >
          <div className="flex items-start justify-between gap-3 px-5 pt-4">
            <div>
              <DialogPrimitive.Title className="desk-h text-[18px] font-semibold tracking-tight">{title}</DialogPrimitive.Title>
              {sub ? <DialogPrimitive.Description className="mt-0.5 text-[13px] text-d-mute">{sub}</DialogPrimitive.Description> : <DialogPrimitive.Description className="sr-only">Dialog</DialogPrimitive.Description>}
            </div>
            <DialogPrimitive.Close className="rounded-lg p-1.5 text-d-mute hover:bg-d-sunk hover:text-d-ink" aria-label="Close">
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>
          <div className="px-5 pb-5 pt-3">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium text-d-mute">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export const inputClass =
  "h-10 w-full rounded-[calc(var(--d-radius,18px)*0.5)] border border-d-line bg-d-panel px-3 text-[13.5px] text-d-ink outline-none placeholder:text-d-mute focus:border-d-accent";
