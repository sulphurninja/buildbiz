"use client";

import * as React from "react";
import { cn } from "cn";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Check, ChevronLeft, ChevronRight, GripVertical, Pause, RotateCcw } from "lucide-react";
import type { Tone } from "./types";
import { Btn, Pill, SearchBox, Segmented, toneVar } from "./ui";
import { useNow } from "./hooks";

/* ---------------- DataTable ---------------- */

export type Column<T> = {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
  sort?: (row: T) => number | string;
  align?: "left" | "right" | "center";
  className?: string;
  /** hide below the md breakpoint */
  wide?: boolean;
};

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  search,
  searchPlaceholder = "Search",
  filter,
  onRow,
  toolbar,
  pageSize = 10,
  bulk,
  empty = "Nothing matches.",
  dense,
}: {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  search?: (row: T) => string;
  searchPlaceholder?: string;
  filter?: { get: (row: T) => string; options: string[]; all?: string };
  onRow?: (row: T) => void;
  toolbar?: React.ReactNode;
  pageSize?: number;
  bulk?: { label: string; run: (keys: string[]) => void }[];
  empty?: string;
  dense?: boolean;
}) {
  const [query, setQuery] = React.useState("");
  const allLabel = filter?.all ?? "All";
  const [chip, setChip] = React.useState(allLabel);
  const [sort, setSort] = React.useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [page, setPage] = React.useState(0);
  const [picked, setPicked] = React.useState<Set<string>>(new Set());

  const needle = query.trim().toLowerCase();
  let shown = rows.filter((row) => (!needle || !search || search(row).toLowerCase().includes(needle)) && (!filter || chip === allLabel || filter.get(row) === chip));
  if (sort) {
    const col = columns.find((c) => c.key === sort.key);
    if (col?.sort) {
      const get = col.sort;
      shown = [...shown].sort((a, b) => {
        const va = get(a);
        const vb = get(b);
        return (va > vb ? 1 : va < vb ? -1 : 0) * sort.dir;
      });
    }
  }
  const pages = Math.max(1, Math.ceil(shown.length / pageSize));
  const safePage = Math.min(page, pages - 1);
  const slice = shown.slice(safePage * pageSize, safePage * pageSize + pageSize);

  function toggle(key: string) {
    setPicked((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="min-w-0">
      {(search || filter || toolbar) && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {search && <SearchBox value={query} onChange={(v) => { setQuery(v); setPage(0); }} placeholder={searchPlaceholder} className="w-full sm:w-64" />}
          {filter && (
            <Segmented
              size="sm"
              options={[allLabel, ...filter.options].map((o) => ({ value: o, label: o, count: o === allLabel ? rows.length : rows.filter((r) => filter.get(r) === o).length }))}
              value={chip}
              onChange={(v) => { setChip(v); setPage(0); }}
            />
          )}
          <div className="ml-auto flex items-center gap-2">{toolbar}</div>
        </div>
      )}
      {bulk && picked.size > 0 && (
        <div className="desk-rise mb-2 flex flex-wrap items-center gap-2 rounded-xl bg-d-soft px-3 py-2 text-[12.5px] text-d-accent">
          <span className="font-medium">{picked.size} selected</span>
          {bulk.map((b) => (
            <Btn key={b.label} size="sm" variant="solid" onClick={() => { b.run([...picked]); setPicked(new Set()); }}>
              {b.label}
            </Btn>
          ))}
          <Btn size="sm" variant="ghost" onClick={() => setPicked(new Set())}>
            Clear
          </Btn>
        </div>
      )}
      <div className="desk-scroll -mx-5 overflow-x-auto px-5">
        <table className="w-full min-w-[560px] border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-d-line text-left">
              {bulk && <th className="w-8 pb-2" />}
              {columns.map((col) => {
                const active = sort?.key === col.key;
                return (
                  <th
                    key={col.key}
                    className={cn(
                      "whitespace-nowrap pb-2 pr-3 text-[11.5px] font-medium text-d-mute",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      col.wide && "hidden md:table-cell",
                    )}
                  >
                    {col.sort ? (
                      <button
                        type="button"
                        onClick={() => setSort(active ? (sort.dir === 1 ? { key: col.key, dir: -1 } : null) : { key: col.key, dir: 1 })}
                        className={cn("inline-flex items-center gap-1 hover:text-d-ink", active && "text-d-ink")}
                      >
                        {col.label}
                        {active && (sort.dir === 1 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {slice.map((row, i) => {
              const key = rowKey(row);
              return (
                <tr
                  key={key}
                  onClick={() => onRow?.(row)}
                  className={cn("desk-rise border-b border-d-line/70 transition-colors last:border-0", onRow && "cursor-pointer hover:bg-d-sunk/70", picked.has(key) && "bg-d-soft/60")}
                  style={{ animationDelay: `${i * 18}ms` }}
                >
                  {bulk && (
                    <td className="py-2.5" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={picked.has(key)} onChange={() => toggle(key)} className="h-4 w-4 accent-[var(--d-accent)]" aria-label="Select row" />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        dense ? "py-2" : "py-3",
                        "pr-3 align-middle",
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center",
                        col.wide && "hidden md:table-cell",
                        col.className,
                      )}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        {slice.length === 0 && <p className="py-10 text-center text-[13px] text-d-mute">{empty}</p>}
      </div>
      {pages > 1 && (
        <div className="mt-3 flex items-center justify-between text-[12px] text-d-mute">
          <span className="font-mono">
            {safePage * pageSize + 1}–{Math.min(shown.length, (safePage + 1) * pageSize)} of {shown.length}
          </span>
          <div className="flex gap-1">
            <Btn size="sm" variant="outline" icon={ChevronLeft} disabled={safePage === 0} onClick={() => setPage(safePage - 1)} aria-label="Previous page" />
            <Btn size="sm" variant="outline" icon={ChevronRight} disabled={safePage >= pages - 1} onClick={() => setPage(safePage + 1)} aria-label="Next page" />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Kanban board ---------------- */

export function Board<T>({
  columns,
  items,
  itemKey,
  getColumn,
  renderCard,
  onMove,
  minColumnWidth = 240,
}: {
  columns: { id: string; label: string; tone?: Tone; limit?: number; hint?: string }[];
  items: T[];
  itemKey: (item: T) => string;
  getColumn: (item: T) => string;
  renderCard: (item: T) => React.ReactNode;
  onMove?: (key: string, column: string) => void;
  minColumnWidth?: number;
}) {
  const [drag, setDrag] = React.useState<string | null>(null);
  const [over, setOver] = React.useState<string | null>(null);
  return (
    <div className="desk-scroll -mx-5 overflow-x-auto px-5 pb-2">
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(${minColumnWidth}px, 1fr))` }}>
        {columns.map((col) => {
          const list = items.filter((item) => getColumn(item) === col.id);
          const overLimit = col.limit !== undefined && list.length > col.limit;
          return (
            <div
              key={col.id}
              onDragOver={(e) => {
                if (!onMove) return;
                e.preventDefault();
                setOver(col.id);
              }}
              onDragLeave={() => setOver((o) => (o === col.id ? null : o))}
              onDrop={(e) => {
                e.preventDefault();
                if (drag && onMove) onMove(drag, col.id);
                setDrag(null);
                setOver(null);
              }}
              className={cn("flex min-h-[220px] flex-col rounded-[calc(var(--d-radius,18px)*0.8)] bg-d-sunk/70 p-2 transition-colors", over === col.id && "bg-d-soft ring-2 ring-d-accent/40")}
            >
              <div className="flex items-center justify-between px-1.5 pb-2 pt-1">
                <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold">
                  <span className="h-2 w-2 rounded-full" style={{ background: toneVar(col.tone ?? "accent") }} />
                  {col.label}
                </span>
                <span className={cn("font-mono text-[11px]", overLimit ? "text-d-late" : "text-d-mute")}>
                  {list.length}
                  {col.limit !== undefined && ` / ${col.limit}`}
                </span>
              </div>
              {col.hint && <p className="px-1.5 pb-2 text-[11px] text-d-mute">{col.hint}</p>}
              <div className="flex flex-1 flex-col gap-2">
                {list.map((item) => {
                  const key = itemKey(item);
                  return (
                    <div
                      key={key}
                      draggable={!!onMove}
                      onDragStart={() => setDrag(key)}
                      onDragEnd={() => setDrag(null)}
                      className={cn("desk-rise group relative rounded-[calc(var(--d-radius,18px)*0.6)] border border-d-line bg-d-panel p-3 shadow-[0_8px_20px_-18px_rgba(0,0,0,0.5)] transition-all", onMove && "cursor-grab active:cursor-grabbing", drag === key && "opacity-40")}
                    >
                      {onMove && <GripVertical className="absolute right-1.5 top-2.5 h-3.5 w-3.5 text-d-mute opacity-0 transition-opacity group-hover:opacity-100" />}
                      {renderCard(item)}
                    </div>
                  );
                })}
                {list.length === 0 && <p className="rounded-lg border border-dashed border-d-line py-6 text-center text-[11.5px] text-d-mute">Drop here</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Gantt / timeline ---------------- */

export type GanttRow = {
  id: string;
  title: string;
  sub?: string;
  swatch?: string;
  bars?: { from: number; to: number; tone?: Tone; dashed?: boolean; label?: string }[];
  points?: { at: number; state: "done" | "late" | "open" | "key"; label?: string }[];
  flag?: number;
  slip?: { from: number; to: number; label: string };
  badge?: { at: number; label: string; tone?: Tone };
};

export function Gantt({
  rows,
  days,
  ticks,
  today,
  markers = [],
  onRow,
  actions,
  labelWidth = 230,
}: {
  rows: GanttRow[];
  /** total days drawn, x is 0..days */
  days: number;
  ticks: { at: number; label: string }[];
  today?: { at: number; label: string };
  markers?: { at: number; label: string; tone?: Tone }[];
  onRow?: (row: GanttRow) => void;
  actions?: (row: GanttRow) => React.ReactNode;
  labelWidth?: number;
}) {
  const pct = (d: number) => `${(d / days) * 100}%`;
  const bands = ticks.map((t, i) => ({ from: t.at, to: ticks[i + 1]?.at ?? days }));
  return (
    <div className="desk-scroll -mx-5 overflow-x-auto px-5">
      <div className="min-w-[720px]">
        <div className="flex items-end pb-2">
          <div className="shrink-0" style={{ width: labelWidth }} />
          <div className="relative h-9 flex-1">
            {ticks.map((t) => (
              <span key={t.label} className="absolute top-0 whitespace-nowrap pl-1.5 text-[11.5px] font-medium text-d-mute" style={{ left: pct(t.at) }}>
                {t.label}
              </span>
            ))}
            {markers.map((m) => (
              <span
                key={m.label}
                className="absolute bottom-0 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] font-semibold"
                style={{ left: pct(m.at), color: toneVar(m.tone ?? "info"), background: `color-mix(in oklab, ${toneVar(m.tone ?? "info")} 12%, var(--d-panel))` }}
              >
                {m.label}
              </span>
            ))}
            {today && (
              <span className="absolute bottom-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--d-brand)] px-2 py-0.5 text-[10.5px] font-semibold text-white" style={{ left: pct(today.at) }}>
                {today.label}
              </span>
            )}
          </div>
          {actions && <div className="w-[84px] shrink-0" />}
        </div>
        <div className="relative space-y-1.5">
          {rows.map((row, i) => {
            const pts = [...(row.points ?? [])].sort((a, b) => a.at - b.at);
            return (
              <div key={row.id} className="desk-rise group flex items-center rounded-[14px] transition-colors hover:bg-d-sunk/60" style={{ animationDelay: `${i * 35}ms` }}>
                <button type="button" onClick={() => onRow?.(row)} className="flex shrink-0 items-center gap-3 py-2 pl-2 pr-3 text-left" style={{ width: labelWidth }}>
                  {row.swatch && <span className="h-9 w-9 shrink-0 rounded-full ring-2 ring-d-panel shadow-[0_0_0_1px_var(--d-line)]" style={{ background: row.swatch }} />}
                  <span className="min-w-0">
                    <span className="block truncate text-[13.5px] font-semibold">{row.title}</span>
                    {row.sub && <span className="block truncate text-[12px] text-d-mute">{row.sub}</span>}
                  </span>
                </button>
                <div className="relative h-12 flex-1">
                  {bands.map((b, bi) => (
                    <span key={b.from} className={cn("absolute inset-y-0", bi % 2 === 0 ? "bg-d-sunk/50" : "")} style={{ left: pct(b.from), width: pct(b.to - b.from) }} />
                  ))}
                  {markers.map((m) => (
                    <span key={m.label} className="absolute inset-y-0 w-px" style={{ left: pct(m.at), background: `color-mix(in oklab, ${toneVar(m.tone ?? "info")} 45%, transparent)` }} />
                  ))}
                  {pts.length === 0 &&
                    row.bars?.map((b, bi) => (
                      <span key={bi} className="desk-growx absolute top-1/2 h-2 -translate-y-1/2 rounded-full" style={{ left: pct(b.from), width: pct(b.to - b.from), background: toneVar(b.tone ?? "accent"), opacity: b.dashed ? 0.45 : 1 }} />
                    ))}
                  {pts.map((p, pi) => {
                    const from = pi === 0 ? p.at - 2 : pts[pi - 1].at;
                    const color = p.state === "done" ? "var(--d-accent)" : p.state === "late" ? "var(--d-late)" : `color-mix(in oklab, var(--d-accent) 16%, var(--d-panel))`;
                    return (
                      <span
                        key={pi}
                        title={p.label}
                        className="desk-growx absolute top-1/2 h-[18px] -translate-y-1/2 rounded-full border-2 border-d-panel transition-[left,width] duration-500"
                        style={{ left: pct(from), width: pct(Math.max(0.6, p.at - from)), background: color, animationDelay: `${pi * 40}ms` }}
                      />
                    );
                  })}
                  {row.slip && (
                    <>
                      <span
                        className="absolute top-1/2 h-[18px] -translate-y-1/2 rounded-r-full"
                        style={{ left: pct(row.slip.from), width: pct(row.slip.to - row.slip.from), background: `color-mix(in oklab, var(--d-late) 22%, transparent)`, boxShadow: "inset 0 0 0 1.5px color-mix(in oklab, var(--d-late) 55%, transparent)" }}
                      />
                      <span className="absolute top-1/2 ml-1.5 -translate-y-1/2 rounded-full bg-d-late px-1.5 py-px font-mono text-[10.5px] font-semibold text-white" style={{ left: pct(row.slip.to) }}>
                        {row.slip.label}
                      </span>
                    </>
                  )}
                  {row.flag !== undefined && (
                    <span className="absolute inset-y-1 z-[2] w-[2.5px] -translate-x-1/2 rounded-full bg-[var(--d-brand)]" style={{ left: pct(row.flag) }}>
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 rounded-full bg-[var(--d-brand)] px-1 text-[8.5px] font-bold uppercase leading-[13px] tracking-wide text-white">due</span>
                    </span>
                  )}
                  {today && <span className="absolute inset-y-0 z-[3] w-[1.5px] bg-[var(--d-brand)]/70" style={{ left: pct(today.at) }} />}
                  {row.badge && (
                    <span
                      className="absolute bottom-0 z-[3] -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-px text-[10.5px] font-semibold"
                      style={{ left: pct(row.badge.at), color: toneVar(row.badge.tone ?? "late"), background: `color-mix(in oklab, ${toneVar(row.badge.tone ?? "late")} 12%, var(--d-panel))` }}
                    >
                      {row.badge.label}
                    </span>
                  )}
                </div>
                {actions && <div className="flex w-[84px] shrink-0 justify-end gap-1 pr-1">{actions(row)}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Countdown ---------------- */

/** Pass `to` for a fixed moment, or `inHours` for a target relative to when the desk opened. */
export function Countdown({ to, inHours, compact }: { to?: Date; inHours?: number; compact?: boolean }) {
  const now = useNow(1000);
  const [opened] = React.useState(() => (typeof window === "undefined" ? 0 : performance.timeOrigin));
  const target = to ? to.getTime() : opened + (inHours ?? 0) * 36e5;
  const diff = now ? Math.max(0, target - now.getTime()) : 0;
  const d = Math.floor(diff / 864e5);
  const h = Math.floor((diff % 864e5) / 36e5);
  const m = Math.floor((diff % 36e5) / 6e4);
  const sec = Math.floor((diff % 6e4) / 1e3);
  const pad = (v: number) => (now ? String(v).padStart(2, "0") : "--");
  if (compact) {
    return (
      <span className="tnum font-mono">
        {now ? d : "--"}d {pad(h)}:{pad(m)}:{pad(sec)}
      </span>
    );
  }
  const cells = [
    { v: now ? String(d) : "--", l: "d" },
    { v: pad(h), l: "h" },
    { v: pad(m), l: "m" },
    { v: pad(sec), l: "s" },
  ];
  return (
    <span className="desk-h tnum inline-flex items-baseline gap-2 text-[34px] font-semibold leading-none tracking-tight">
      {cells.map((c) => (
        <span key={c.l} className="inline-flex items-baseline">
          {c.v}
          <span className="ml-0.5 text-[15px] font-medium text-d-mute">{c.l}</span>
        </span>
      ))}
    </span>
  );
}

/* ---------------- Approval queue ---------------- */

export type ApprovalItem = { id: string; title: string; sub?: string; amount?: string; meta?: string; tone?: Tone };

export function ApprovalQueue({
  items,
  approveLabel = "Approve",
  holdLabel = "Hold",
  onDecide,
}: {
  items: ApprovalItem[];
  approveLabel?: string;
  holdLabel?: string;
  onDecide?: (id: string, decision: "approved" | "held" | null) => void;
}) {
  const [state, setState] = React.useState<Record<string, "approved" | "held">>({});
  function decide(item: ApprovalItem, decision: "approved" | "held" | null) {
    setState((current) => {
      const next = { ...current };
      if (decision) next[item.id] = decision;
      else delete next[item.id];
      return next;
    });
    onDecide?.(item.id, decision);
    if (decision) toast.success(`${item.title} ${decision === "approved" ? "approved" : "put on hold"}`, { description: item.amount ? `${item.amount} · logged to the audit trail` : "Logged to the audit trail" });
  }
  return (
    <ul className="divide-y divide-d-line">
      {items.map((item) => {
        const s = state[item.id];
        return (
          <li key={item.id} className={cn("flex flex-wrap items-center gap-3 py-3 transition-opacity", s && "opacity-60")}>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-[13.5px] font-medium">
                <span className="truncate">{item.title}</span>
                {item.meta && <Pill tone={item.tone ?? "warn"}>{item.meta}</Pill>}
              </p>
              {item.sub && <p className="truncate text-[12px] text-d-mute">{item.sub}</p>}
            </div>
            {item.amount && <span className="tnum font-mono text-[13px] font-semibold">{item.amount}</span>}
            {s ? (
              <span className="inline-flex items-center gap-2">
                <Pill tone={s === "approved" ? "ok" : "warn"}>{s === "approved" ? "Approved" : "On hold"}</Pill>
                <button type="button" onClick={() => decide(item, null)} className="rounded p-1 text-d-mute hover:text-d-ink" aria-label="Undo">
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </span>
            ) : (
              <span className="inline-flex gap-1.5">
                <Btn size="sm" variant="outline" icon={Pause} onClick={() => decide(item, "held")}>
                  {holdLabel}
                </Btn>
                <Btn size="sm" variant="solid" icon={Check} onClick={() => decide(item, "approved")}>
                  {approveLabel}
                </Btn>
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* ---------------- Checklist ---------------- */

export function Checklist({ items, onToggle }: { items: { id: string; label: string; sub?: string; done: boolean }[]; onToggle: (id: string) => void }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.id}>
          <button type="button" onClick={() => onToggle(item.id)} className="flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left hover:bg-d-sunk">
            <span
              className={cn("mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors", item.done ? "border-d-accent bg-d-accent text-d-accent-ink" : "border-d-line bg-d-panel")}
            >
              {item.done && <Check className="h-3 w-3" strokeWidth={3} />}
            </span>
            <span className="min-w-0">
              <span className={cn("block text-[13px]", item.done && "text-d-mute line-through")}>{item.label}</span>
              {item.sub && <span className="block text-[11.5px] text-d-mute">{item.sub}</span>}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ---------------- Aging buckets ---------------- */

export function AgingBar({ buckets, format }: { buckets: { label: string; value: number; tone: Tone }[]; format: (v: number) => string }) {
  const total = buckets.reduce((a, b) => a + b.value, 0) || 1;
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full">
        {buckets.map((b) => (
          <span key={b.label} className="desk-growx h-full" style={{ width: `${(b.value / total) * 100}%`, background: toneVar(b.tone) }} title={`${b.label}: ${format(b.value)}`} />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {buckets.map((b) => (
          <span key={b.label} className="inline-flex items-center gap-1.5 text-[12.5px]">
            <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: toneVar(b.tone) }} />
            {b.label}
            <span className="tnum font-mono text-d-mute">{format(b.value)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
