"use client";

import * as React from "react";
import { cn } from "cn";
import type { Tone } from "./types";
import { toneVar } from "./ui";

export function Sparkline({ data, tone = "accent", height = 36, className }: { data: number[]; tone?: Tone; height?: number; className?: string }) {
  const id = React.useId().replace(/:/g, "");
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * 100, height - 2 - ((v - min) / span) * (height - 6)]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ");
  const color = toneVar(tone);
  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className={cn("w-full overflow-visible", className)} style={{ height }}>
      <defs>
        <linearGradient id={`sp${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L100,${height} L0,${height} Z`} fill={`url(#sp${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export type Series = { name: string; data: number[]; tone?: Tone; dashed?: boolean };

/** Multi-series area/line chart with a hover crosshair and tooltip. */
export function AreaChart({
  series,
  labels,
  height = 220,
  format = (v: number) => v.toLocaleString("en-IN"),
  marker,
  className,
}: {
  series: Series[];
  labels: string[];
  height?: number;
  format?: (value: number) => string;
  marker?: { index: number; label: string };
  className?: string;
}) {
  const id = React.useId().replace(/:/g, "");
  const [hover, setHover] = React.useState<number | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);
  const all = series.flatMap((s) => s.data);
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  // zoom in when every value sits far from zero, so the lines don't hug the top
  const min = lo > 0 && lo > hi * 0.35 ? lo - (hi - lo) * 0.35 : Math.min(0, lo);
  const max = hi + (hi - min) * 0.08 || 1;
  const W = 600;
  const H = height;
  const pad = { t: 10, b: 24, l: 0, r: 0 };
  const n = labels.length;
  const x = (i: number) => pad.l + (i / Math.max(1, n - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - min) / (max - min)) * (H - pad.t - pad.b);
  const smooth = (data: number[]) =>
    data
      .map((v, i) => {
        if (i === 0) return `M${x(0)},${y(v)}`;
        const x0 = x(i - 1);
        const x1 = x(i);
        const cx = (x0 + x1) / 2;
        return `C${cx},${y(data[i - 1])} ${cx},${y(v)} ${x1},${y(v)}`;
      })
      .join(" ");

  function onMove(event: React.PointerEvent) {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    const ratio = (event.clientX - box.left) / box.width;
    setHover(Math.max(0, Math.min(n - 1, Math.round(ratio * (n - 1)))));
  }

  const grid = [0.25, 0.5, 0.75, 1].map((f) => min + (max - min) * f);
  const step = Math.ceil(n / 8);

  return (
    <div className={cn("relative", className)}>
      <div className="mb-3 flex flex-wrap gap-4">
        {series.map((s) => (
          <span key={s.name} className="inline-flex items-center gap-1.5 text-[12px] text-d-mute">
            <span className="h-[3px] w-4 rounded-full" style={{ background: toneVar(s.tone ?? "accent"), opacity: s.dashed ? 0.6 : 1 }} />
            {s.name}
          </span>
        ))}
      </div>
      <div ref={ref} className="relative" onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
          <defs>
            {series.map((s, i) => (
              <linearGradient key={s.name} id={`ac${id}${i}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={toneVar(s.tone ?? "accent")} stopOpacity="0.22" />
                <stop offset="100%" stopColor={toneVar(s.tone ?? "accent")} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>
          {grid.map((g) => (
            <line key={g} x1="0" x2={W} y1={y(g)} y2={y(g)} stroke="var(--d-line)" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
          ))}
          {marker && (
            <g>
              <line x1={x(marker.index)} x2={x(marker.index)} y1={pad.t} y2={H - pad.b} stroke="var(--d-accent)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
            </g>
          )}
          {series.map((s, i) => (
            <g key={s.name}>
              {!s.dashed && (series.length <= 2 || i === 0) && <path d={`${smooth(s.data)} L${x(s.data.length - 1)},${H - pad.b} L${x(0)},${H - pad.b} Z`} fill={`url(#ac${id}${i})`} />}
              <path
                d={smooth(s.data)}
                fill="none"
                stroke={toneVar(s.tone ?? "accent")}
                strokeWidth={s.dashed ? 1.5 : 2}
                strokeDasharray={s.dashed ? "5 5" : undefined}
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
              />
            </g>
          ))}
          {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="var(--d-ink)" strokeOpacity="0.25" vectorEffect="non-scaling-stroke" />}
        </svg>
        {hover !== null &&
          series.map((s) => (
            <span
              key={s.name}
              className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-d-panel"
              style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(s.data[hover] ?? 0) / H) * 100}%`, background: toneVar(s.tone ?? "accent") }}
            />
          ))}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between font-mono text-[10.5px] text-d-mute">
          {labels.map((label, i) => (
            <span key={`${label}-${i}`} className={cn((i === n - 1 ? false : i % step !== 0 || n - 1 - i < step) && "invisible")}>
              {label}
            </span>
          ))}
        </div>
        {marker && (
          <span className="pointer-events-none absolute top-0 -translate-x-1/2 rounded bg-d-accent px-1.5 py-0.5 font-mono text-[10px] text-d-accent-ink" style={{ left: `${(x(marker.index) / W) * 100}%` }}>
            {marker.label}
          </span>
        )}
        {hover !== null && (
          <div
            className="pointer-events-none absolute top-6 z-10 min-w-[140px] rounded-lg border border-d-line bg-d-panel px-3 py-2 text-[12px] shadow-xl"
            style={{ left: `${(x(hover) / W) * 100}%`, transform: `translateX(${hover > n / 2 ? "-110%" : "10%"})` }}
          >
            <p className="font-mono text-[11px] text-d-mute">{labels[hover]}</p>
            {series.map((s) => (
              <p key={s.name} className="mt-0.5 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: toneVar(s.tone ?? "accent") }} />
                  {s.name}
                </span>
                <span className="tnum font-semibold">{format(s.data[hover] ?? 0)}</span>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export type BarDatum = { label: string; value: number; tone?: Tone; note?: string; stack?: { value: number; tone: Tone; name: string }[] };

/** Vertical bars with optional stacks, value labels and hover detail. */
export function Bars({
  data,
  height = 200,
  format = (v: number) => v.toLocaleString("en-IN"),
  showValues = true,
  onSelect,
  selected,
  className,
}: {
  data: BarDatum[];
  height?: number;
  format?: (value: number) => string;
  showValues?: boolean;
  onSelect?: (label: string) => void;
  selected?: string | null;
  className?: string;
}) {
  const [hover, setHover] = React.useState<number | null>(null);
  const max = Math.max(...data.map((d) => (d.stack ? d.stack.reduce((a, s) => a + s.value, 0) : d.value))) || 1;
  return (
    <div className={cn("relative", className)}>
      <div className="flex items-end gap-[6px]" style={{ height }}>
        {data.map((d, i) => {
          const total = d.stack ? d.stack.reduce((a, s) => a + s.value, 0) : d.value;
          const dim = selected && selected !== d.label;
          return (
            <button
              key={`${d.label}-${i}`}
              type="button"
              onClick={() => onSelect?.(d.label)}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
              className={cn("group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end", !onSelect && "cursor-default")}
            >
              {showValues && <span className="tnum mb-1 whitespace-nowrap font-mono text-[10.5px] text-d-mute">{format(total)}</span>}
              <span
                className="desk-grow flex w-full max-w-[56px] flex-col-reverse overflow-hidden rounded-t-[5px] transition-opacity"
                style={{ height: `${(total / max) * 100}%`, opacity: dim ? 0.35 : 1, animationDelay: `${i * 35}ms` }}
              >
                {d.stack ? (
                  d.stack.map((s) => <span key={s.name} style={{ height: `${(s.value / total) * 100}%`, background: toneVar(s.tone) }} />)
                ) : (
                  <span className="h-full" style={{ background: toneVar(d.tone ?? "accent") }} />
                )}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex gap-[6px]">
        {data.map((d, i) => (
          <span key={`${d.label}-${i}`} className="min-w-0 flex-1 truncate text-center text-[11px] text-d-mute">
            {d.label}
          </span>
        ))}
      </div>
      {hover !== null && data[hover] && (data[hover].note || data[hover].stack) && (
        <div className="pointer-events-none absolute -top-2 left-1/2 z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-d-line bg-d-panel px-3 py-2 text-[12px] shadow-xl">
          <p className="font-semibold">{data[hover].label}</p>
          {data[hover].note && <p className="text-d-mute">{data[hover].note}</p>}
          {data[hover].stack?.map((s) => (
            <p key={s.name} className="flex justify-between gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: toneVar(s.tone) }} />
                {s.name}
              </span>
              <span className="tnum">{format(s.value)}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

/** Horizontal ranked bars. */
export function HBars({
  data,
  format = (v: number) => v.toLocaleString("en-IN"),
  max,
  onSelect,
}: {
  data: { label: string; value: number; tone?: Tone; sub?: string }[];
  format?: (value: number) => string;
  max?: number;
  onSelect?: (label: string) => void;
}) {
  const top = max ?? Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="space-y-2.5">
      {data.map((d, i) => (
        <li key={`${d.label}-${i}`}>
          <button type="button" onClick={() => onSelect?.(d.label)} className={cn("block w-full text-left", !onSelect && "cursor-default")}>
            <div className="flex items-baseline justify-between gap-3 text-[12.5px]">
              <span className="truncate">
                {d.label}
                {d.sub && <span className="text-d-mute"> · {d.sub}</span>}
              </span>
              <span className="tnum shrink-0 font-mono text-[12px] font-medium">{format(d.value)}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-d-sunk">
              <div className="desk-growx h-full rounded-full" style={{ width: `${Math.max(0, d.value / (top || 1)) * 100}%`, background: toneVar(d.tone ?? "accent"), animationDelay: `${i * 40}ms` }} />
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function Donut({
  segments,
  size = 160,
  thickness = 18,
  center,
  sub,
}: {
  segments: { label: string; value: number; tone: Tone }[];
  size?: number;
  thickness?: number;
  center?: React.ReactNode;
  sub?: React.ReactNode;
}) {
  const [hover, setHover] = React.useState<number | null>(null);
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const offsets = segments.reduce<number[]>((acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1] + (segments[i - 1].value / total) * c], []);
  return (
    <div className="flex flex-wrap items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--d-sunk)" strokeWidth={thickness} />
          {segments.map((s, i) => {
            const len = (s.value / total) * c;
            return (
              <circle
                key={s.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={toneVar(s.tone)}
                strokeWidth={hover === i ? thickness + 4 : thickness}
                strokeDasharray={`${Math.max(0, len - 2)} ${c}`}
                strokeDashoffset={-offsets[i]}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                className="transition-all"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {hover !== null ? (
            <>
              <span className="desk-h tnum text-[22px] font-semibold">{Math.round((segments[hover].value / total) * 100)}%</span>
              <span className="max-w-[90px] truncate text-[11px] text-d-mute">{segments[hover].label}</span>
            </>
          ) : (
            <>
              <span className="desk-h tnum text-[22px] font-semibold">{center}</span>
              {sub && <span className="text-[11px] text-d-mute">{sub}</span>}
            </>
          )}
        </div>
      </div>
      <ul className="min-w-[140px] flex-1 space-y-1.5">
        {segments.map((s, i) => (
          <li key={s.label} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)} className="flex items-center justify-between gap-3 text-[12.5px]">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: toneVar(s.tone) }} />
              {s.label}
            </span>
            <span className="tnum font-mono text-[12px] text-d-mute">{s.value.toLocaleString("en-IN")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Half-circle gauge, 0–100. */
export function Gauge({ value, size = 220, label, tone = "accent" }: { value: number; size?: number; label?: React.ReactNode; tone?: Tone }) {
  const r = size / 2 - 14;
  const c = Math.PI * r;
  const pct = Math.max(0, Math.min(100, value)) / 100;
  return (
    <div className="relative" style={{ width: size, height: size / 2 + 18 }}>
      <svg viewBox={`0 0 ${size} ${size / 2 + 10}`} className="w-full overflow-visible">
        <path d={`M14,${size / 2} A${r},${r} 0 0 1 ${size - 14},${size / 2}`} fill="none" stroke="var(--d-sunk)" strokeWidth="16" strokeLinecap="round" />
        <path
          d={`M14,${size / 2} A${r},${r} 0 0 1 ${size - 14},${size / 2}`}
          fill="none"
          stroke={toneVar(tone)}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`}
          style={{ transition: "stroke-dasharray 900ms cubic-bezier(.2,.7,.2,1)" }}
        />
        {[0, 25, 50, 75, 100].map((t) => {
          const a = Math.PI * (1 - t / 100);
          return (
            <line
              key={t}
              x1={size / 2 + Math.cos(a) * (r - 14)}
              y1={size / 2 - Math.sin(a) * (r - 14)}
              x2={size / 2 + Math.cos(a) * (r - 20)}
              y2={size / 2 - Math.sin(a) * (r - 20)}
              stroke="var(--d-mute)"
              strokeOpacity="0.5"
            />
          );
        })}
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
        <span className="desk-h tnum text-[44px] font-semibold leading-none tracking-tight">{Math.round(value)}</span>
        {label && <span className="mt-1 text-[12px] text-d-mute">{label}</span>}
      </div>
    </div>
  );
}

/** Rows × columns intensity grid. */
export function HeatGrid({
  rows,
  cols,
  values,
  tone = "accent",
  format = (v: number) => String(v),
  onCell,
}: {
  rows: string[];
  cols: string[];
  values: number[][];
  tone?: Tone;
  format?: (value: number) => string;
  onCell?: (row: number, col: number) => void;
}) {
  const max = Math.max(...values.flat()) || 1;
  return (
    <div className="desk-scroll overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-[11.5px]">
        <thead>
          <tr>
            <th />
            {cols.map((col) => (
              <th key={col} className="px-1 text-center font-mono font-normal text-d-mute">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={row}>
              <th className="whitespace-nowrap pr-2 text-left font-normal text-d-mute">{row}</th>
              {cols.map((col, ci) => {
                const v = values[ri]?.[ci] ?? 0;
                return (
                  <td key={col} className="p-0">
                    <button
                      type="button"
                      onClick={() => onCell?.(ri, ci)}
                      title={`${row} · ${col}: ${format(v)}`}
                      className="tnum flex h-8 w-full min-w-[34px] items-center justify-center rounded-[5px] font-mono text-[10.5px] transition-transform hover:scale-105"
                      style={{
                        background: `color-mix(in oklab, ${toneVar(tone)} ${Math.round((v / max) * 85) + 5}%, var(--d-panel))`,
                        color: v / max > 0.55 ? "var(--d-accent-ink)" : "var(--d-ink)",
                      }}
                    >
                      {format(v)}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
