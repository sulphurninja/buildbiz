"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "cn";
import { toast } from "sonner";
import {
  ArrowRight,
  Bell,
  Bot,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock3,
  Expand,
  Inbox,
  Keyboard,
  LayoutGrid,
  Menu,
  MonitorPlay,
  MoreHorizontal,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  UserRoundPlus,
  Waves,
  X,
} from "lucide-react";
import { industries, sectors } from "@/content/industries";
import type { AgendaItem, Decision, DeskConfig, DeskModule, DeskVariant, Tone } from "./types";
import { CopilotPanel, RunAgentSheet } from "./agent";
import { CommandPalette, shortcuts } from "./command";
import { clockLabel, istParts, longDate, useNow } from "./hooks";
import { DeskRootContext, Modal, Pill, toneVar } from "./ui";
import { Sparkline } from "./charts";

/* ---------------- Context ---------------- */

type DeskApi = {
  /** add a line to the activity feed */
  log: (text: string, tone?: Tone) => void;
  goTab: (id: string) => void;
  openAsk: (question?: string) => void;
  runAgent: () => void;
  brand: string;
  company: string;
  variant: DeskVariant;
};

const DeskContext = React.createContext<DeskApi>({ log: () => {}, goTab: () => {}, openAsk: () => {}, runAgent: () => {}, brand: "", company: "", variant: "atelier" });

export function useDesk() {
  return React.useContext(DeskContext);
}

const HOME = "home";

function useOutside(ref: React.RefObject<HTMLElement | null>, onOut: () => void, active: boolean) {
  React.useEffect(() => {
    if (!active) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOut();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [ref, onOut, active]);
}

/** Dashboards are titled by industry; the fictional company is the subtitle. */
function titleOf(config: DeskConfig) {
  return industries.find((i) => i.slug === config.slug)?.name ?? config.company;
}

function fmtTime(at: number) {
  const h = Math.floor(at);
  const m = Math.round((at - h) * 60);
  return `${h > 12 ? h - 12 : h}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

/* ---------------- Shell ---------------- */

export function DeskShell({ config, modules }: { config: DeskConfig; modules: DeskModule[] }) {
  const router = useRouter();
  const t = config.theme;
  const v = t.variant;
  const isInbox = v === "inbox";
  const [root, setRoot] = React.useState<HTMLDivElement | null>(null);
  const order = React.useMemo(() => (isInbox ? [HOME, ...modules.map((m) => m.id)] : modules.map((m) => m.id)), [modules, isInbox]);
  const [active, setActive] = React.useState(order[0]);
  const [visited, setVisited] = React.useState<Set<string>>(() => new Set([order[0]]));
  const [handled, setHandled] = React.useState<Record<string, string>>({});
  const [activity, setActivity] = React.useState(config.activity);
  const [unread, setUnread] = React.useState(0);
  const [askOpen, setAskOpen] = React.useState(false);
  const [askSeed, setAskSeed] = React.useState({ n: 0, q: "" });
  const [runOpen, setRunOpenState] = React.useState(false);
  const [runSeed, setRunSeed] = React.useState(0);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [keysOpen, setKeysOpen] = React.useState(false);
  const [notes, setNotes] = React.useState(false);
  const [calm, setCalm] = React.useState(false);
  const [touring, setTouring] = React.useState(false);
  const [navOpen, setNavOpen] = React.useState(false);

  const index = Math.max(0, order.indexOf(active));
  const current = modules.find((m) => m.id === active) ?? null;
  const position = Math.max(0, industries.findIndex((i) => i.slug === config.slug));
  const prev = industries[(position - 1 + industries.length) % industries.length];
  const next = industries[(position + 1) % industries.length];

  const goTab = React.useCallback(
    (id: string) => {
      if (!order.includes(id)) return;
      setActive(id);
      setNavOpen(false);
      setVisited((s) => (s.has(id) ? s : new Set(s).add(id)));
      window.history.replaceState(null, "", id === order[0] ? window.location.pathname : `#${id}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [order],
  );

  const log = React.useCallback((text: string, tone?: Tone) => {
    setActivity((cur) => [{ time: clockLabel(new Date()), text, tone }, ...cur].slice(0, 40));
    setUnread((n) => n + 1);
  }, []);

  const openAsk = React.useCallback((q?: string) => {
    setAskSeed((s) => ({ n: s.n + 1, q: q ?? "" }));
    setAskOpen(true);
  }, []);

  const setRunOpen = React.useCallback((open: boolean) => {
    if (open) setRunSeed((s) => s + 1);
    setRunOpenState(open);
  }, []);
  const runAgent = React.useCallback(() => setRunOpen(true), [setRunOpen]);

  React.useEffect(() => {
    const id = window.setTimeout(() => {
      const hash = window.location.hash.replace("#", "");
      if (hash && order.includes(hash)) {
        setActive(hash);
        setVisited((s) => new Set(s).add(hash));
      }
      if (new URLSearchParams(window.location.search).get("tour") === "1") setTouring(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, [order]);

  React.useEffect(() => {
    if (!touring) return;
    const id = window.setTimeout(() => {
      if (index < order.length - 1) goTab(order[index + 1]);
      else router.push(`/industries/${next.slug}?tour=1`);
    }, 7000);
    return () => window.clearTimeout(id);
  }, [touring, index, order, goTab, router, next.slug]);

  const fullscreen = React.useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.();
  }, []);

  React.useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (document.querySelector("[role=dialog]")) return;
      const k = event.key;
      if (/^[0-9]$/.test(k)) {
        const n = k === "0" ? 9 : Number(k) - 1;
        if (order[n]) goTab(order[n]);
      } else if (k === "]") goTab(order[(index + 1) % order.length]);
      else if (k === "[") goTab(order[(index - 1 + order.length) % order.length]);
      else if (k === ".") router.push(`/industries/${next.slug}`);
      else if (k === ",") router.push(`/industries/${prev.slug}`);
      else if (k === "/") {
        event.preventDefault();
        openAsk();
      } else if (k === "r" || k === "R") runAgent();
      else if (k === "t" || k === "T") setTouring((x) => !x);
      else if (k === "n" || k === "N") setNotes((x) => !x);
      else if (k === "c" || k === "C") setCalm((x) => !x);
      else if (k === "f" || k === "F") fullscreen();
      else if (k === "?") setKeysOpen(true);
      else if (k === "Escape") {
        setTouring(false);
        setNotes(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [order, index, goTab, router, next.slug, prev.slug, runAgent, openAsk, fullscreen]);

  const style = {
    "--d-paper": t.paper,
    "--d-panel": t.panel,
    "--d-sunk": t.sunk,
    "--d-ink": t.ink,
    "--d-mute": t.mute,
    "--d-line": t.line,
    "--d-accent": t.accent,
    "--d-accent-ink": t.accentInk,
    "--d-soft": t.soft,
    "--d-ok": t.ok,
    "--d-warn": t.warn,
    "--d-late": t.late,
    "--d-info": t.info,
    "--d-brand": t.accent,
    "--d-gold": t.warn,
    "--d-radius": `${t.radius ?? (v === "ledger" ? 4 : v === "control" ? 10 : 18)}px`,
  } as React.CSSProperties;

  const api = React.useMemo<DeskApi>(
    () => ({ log, goTab, openAsk, runAgent, brand: config.brand, company: config.company, variant: v }),
    [log, goTab, openAsk, runAgent, config.brand, config.company, v],
  );

  function decide(d: Decision, verdict: string | null) {
    setHandled((cur) => {
      const nextState = { ...cur };
      if (verdict) nextState[d.id] = verdict;
      else delete nextState[d.id];
      return nextState;
    });
    if (verdict) log(`${verdict}: ${d.title}`, verdict.startsWith("Approved") ? "ok" : "info");
  }

  const actions = <Actions config={config} activity={activity} unread={unread} onSeen={() => setUnread(0)} onAsk={() => openAsk()} onRun={runAgent} variant={v} />;

  const content = (
    <>
      {isInbox && visited.has(HOME) && (
        <div hidden={active !== HOME} className={cn(active === HOME && "desk-rise")}>
          <InboxHome config={config} handled={handled} onDecide={decide} onModule={goTab} />
        </div>
      )}
      {modules.map((m) =>
        visited.has(m.id) ? (
          <div key={m.id} hidden={m.id !== active} className={cn(m.id === active && "desk-rise")}>
            <ModuleHead module={m} variant={v} />
            {m.render()}
          </div>
        ) : null,
      )}
    </>
  );

  const frameProps: FrameProps = {
    config,
    modules,
    active,
    onPick: goTab,
    actions,
    content,
    navOpen,
    setNavOpen,
    openCount: (config.decisions ?? []).filter((d) => !handled[d.id]).length,
    onSearch: () => setPaletteOpen(true),
  };

  return (
    <DeskContext.Provider value={api}>
      <div
        ref={setRoot}
        className={cn("desk relative min-h-screen", v === "control" && "[color-scheme:dark]")}
        data-variant={v}
        data-heading={t.heading ?? (v === "control" ? "mono" : v === "ledger" ? "serif" : "display")}
        data-calm={calm ? "true" : "false"}
        style={style}
      >
        <DeskRootContext.Provider value={root}>
          {v === "atelier" && <AtelierFrame {...frameProps} />}
          {v === "ledger" && <LedgerFrame {...frameProps} />}
          {v === "control" && <ControlFrame {...frameProps} />}
          {v === "inbox" && <InboxFrame {...frameProps} />}

          <IndustrySwitch
            slug={config.slug}
            prevSlug={prev.slug}
            nextSlug={next.slug}
            dark={v === "control"}
            inset={v === "ledger" ? 260 : v === "control" ? 84 : v === "inbox" ? 256 : 0}
            touring={touring}
            calm={calm}
            notes={notes}
            onTour={() => setTouring((x) => !x)}
            onCalm={() => setCalm((x) => !x)}
            onNotes={() => setNotes((x) => !x)}
            onFullscreen={fullscreen}
            onKeys={() => setKeysOpen(true)}
            onAsk={() => openAsk()}
          />

          {notes && <TalkingPoints module={current} config={config} onClose={() => setNotes(false)} />}
          {touring && (
            <div className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-full bg-d-ink px-3 py-1.5 text-[12px] font-medium text-d-paper shadow-lg">
              <span className="bb-pulse h-1.5 w-1.5 rounded-full bg-d-accent" />
              Tour · {index + 1}/{order.length} · Esc to stop
            </div>
          )}

          <CopilotPanel key={`ask-${askSeed.n}`} open={askOpen} onOpenChange={setAskOpen} brand={config.brand} company={config.company} prompts={config.asks} initial={askSeed.q} />
          <RunAgentSheet key={`run-${runSeed}`} open={runOpen} onOpenChange={setRunOpen} run={config.run} onFinished={(text) => log(`Agent finished: ${text}`, "ok")} />
          <CommandPalette
            key={paletteOpen ? "palette-open" : "palette-closed"}
            open={paletteOpen}
            onOpenChange={setPaletteOpen}
            slug={config.slug}
            modules={[...(isInbox ? [{ id: HOME, label: "Inbox", blurb: "Decisions waiting for you" }] : []), ...modules]}
            onTab={goTab}
            actions={[
              { label: `Ask about ${config.brand}`, hint: "Open the copilot", run: () => openAsk() },
              { label: config.run.title, hint: "Run the agent now", run: runAgent },
              { label: touring ? "Stop tour" : "Start tour", hint: "Every module, then the next business", run: () => setTouring((x) => !x) },
              { label: calm ? "Motion on" : "Calm mode", hint: "Stops animation", run: () => setCalm((x) => !x) },
            ]}
          />
          <Modal open={keysOpen} onOpenChange={setKeysOpen} title="Keyboard" sub="Every part of the desk works without a mouse." width={520}>
            <ul className="divide-y divide-d-line">
              {shortcuts.map((s) => (
                <li key={s.label} className="flex items-center justify-between gap-4 py-2.5 text-[13.5px]">
                  <span>{s.label}</span>
                  <span className="flex gap-1">
                    {s.keys.map((k) => (
                      <kbd key={k} className="min-w-[24px] rounded-md border border-d-line bg-d-paper px-1.5 py-0.5 text-center font-mono text-[11.5px]">
                        {k}
                      </kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </Modal>
        </DeskRootContext.Provider>
      </div>
    </DeskContext.Provider>
  );
}

type FrameProps = {
  config: DeskConfig;
  modules: DeskModule[];
  active: string;
  onPick: (id: string) => void;
  actions: React.ReactNode;
  content: React.ReactNode;
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
  openCount: number;
  onSearch: () => void;
};

/* ---------------- Header actions (shared) ---------------- */

function Actions({
  config,
  activity,
  unread,
  onSeen,
  onAsk,
  onRun,
  variant,
}: {
  config: DeskConfig;
  activity: DeskConfig["activity"];
  unread: number;
  onSeen: () => void;
  onAsk: () => void;
  onRun: () => void;
  variant: DeskVariant;
}) {
  const now = useNow(1000);
  const [syncing, setSyncing] = React.useState(false);
  const [bell, setBell] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const close = React.useCallback(() => setBell(false), []);
  useOutside(ref, close, bell);
  const pill = variant === "ledger" ? "rounded-[3px]" : "rounded-full";

  function sync() {
    if (syncing) return;
    setSyncing(true);
    window.setTimeout(() => {
      setSyncing(false);
      toast.success("Up to date", { description: `${config.company}: every connected source synced.` });
    }, 1200);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={sync} className={cn("hidden h-9 items-center gap-2 border border-d-line bg-d-panel px-3 text-[12.5px] sm:inline-flex", pill)} title="Sync now">
        <span className="desk-ping h-1.5 w-1.5 rounded-full bg-d-ok" />
        <span className="tnum font-mono">{now ? clockLabel(now, variant === "control") : "--:--"}</span>
        <RefreshCw className={cn("h-3.5 w-3.5 text-d-mute", syncing && "animate-spin")} />
      </button>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => {
            setBell((b) => !b);
            onSeen();
          }}
          className={cn("relative flex h-9 w-9 items-center justify-center border border-d-line bg-d-panel hover:bg-d-sunk", pill)}
          aria-label="Activity"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-d-accent px-1 font-mono text-[9.5px] font-semibold text-d-accent-ink">{unread}</span>}
        </button>
        {bell && (
          <div className="desk-rise absolute right-0 top-full z-50 mt-2 w-[360px] max-w-[calc(100vw-24px)] overflow-hidden rounded-[14px] border border-d-line bg-d-panel shadow-[0_24px_60px_-20px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between border-b border-d-line px-4 py-3">
              <p className="text-[14px] font-semibold">Activity</p>
              <span className="text-[11.5px] text-d-mute">agents and your team, today</span>
            </div>
            <ul className="desk-scroll max-h-[420px] divide-y divide-d-line overflow-y-auto">
              {activity.map((a, i) => (
                <li key={`${a.time}-${i}`} className="flex gap-3 px-4 py-2.5">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: toneVar(a.tone ?? "accent") }} />
                  <div className="min-w-0">
                    <p className="text-[13px] leading-snug">{a.text}</p>
                    <p className="font-mono text-[11px] text-d-mute">{a.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <button type="button" onClick={onRun} className={cn("inline-flex h-9 items-center gap-2 border border-d-line bg-d-panel px-3.5 text-[13px] font-medium hover:bg-d-sunk active:scale-[0.97]", pill)}>
        <Bot className="h-4 w-4" />
        <span className="hidden sm:inline">Run agent</span>
      </button>
      <button type="button" onClick={onAsk} className={cn("inline-flex h-9 items-center gap-2 bg-d-accent px-3.5 text-[13px] font-semibold text-d-accent-ink shadow-[0_8px_20px_-10px_var(--d-accent)] hover:brightness-110 active:scale-[0.97]", pill)}>
        <Sparkles className="h-4 w-4" />
        Ask {config.brand}
      </button>
    </div>
  );
}

/* ---------------- Frame: Atelier ---------------- */

function AtelierFrame({ config, modules, active, onPick, actions, content }: FrameProps) {
  const Icon = config.icon;
  return (
    <div className="min-h-screen pb-32">
      <header className="mx-auto flex max-w-[1520px] flex-wrap items-center justify-between gap-4 px-4 pb-4 pt-6 sm:px-6 lg:px-10">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-d-accent text-d-accent-ink shadow-[0_14px_30px_-14px_var(--d-accent)]">
            <Icon className="h-7 w-7" strokeWidth={1.7} />
          </span>
          <div className="min-w-0">
            <h1 className="desk-h truncate text-[26px] font-semibold leading-tight sm:text-[30px]">{titleOf(config)}</h1>
            <p className="truncate text-[13.5px] text-d-mute">
              {config.company} · {config.city}, {config.state} · {config.tagline}
            </p>
          </div>
        </div>
        {actions}
      </header>
      <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-10">
        <DayRibbon items={config.agenda} onJump={onPick} />
      </div>
      <nav className="sticky top-0 z-30 mt-4 bg-[color-mix(in_oklab,var(--d-paper)_86%,transparent)] py-2.5 backdrop-blur-xl">
        <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-10">
          <PillTabs modules={modules} active={active} onPick={onPick} />
        </div>
      </nav>
      <main className="mx-auto max-w-[1520px] px-4 pt-4 sm:px-6 lg:px-10">{content}</main>
    </div>
  );
}

function PillTabs({ modules, active, onPick }: { modules: DeskModule[]; active: string; onPick: (id: string) => void }) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    ref.current?.querySelector<HTMLElement>(`[data-tab="${active}"]`)?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [active]);
  return (
    <div ref={ref} role="tablist" className="desk-noscroll flex max-w-full gap-1 overflow-x-auto rounded-full border border-d-line bg-d-sunk p-1 [mask-image:linear-gradient(90deg,#000_92%,transparent)]">
      {modules.map((m) => {
        const on = m.id === active;
        const Icon = m.icon;
        return (
          <button
            key={m.id}
            data-tab={m.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onPick(m.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-[13.5px] transition-all",
              on ? "bg-d-panel font-semibold text-d-ink shadow-[0_4px_14px_-6px_rgba(0,0,0,0.25)]" : "text-d-mute hover:text-d-ink",
            )}
          >
            <Icon className={cn("h-4 w-4", on && "text-d-accent")} strokeWidth={1.9} />
            {m.label}
            {m.count !== undefined && m.count > 0 && <span className={cn("rounded-full px-1.5 font-mono text-[10.5px] font-semibold", on ? "bg-d-accent text-d-accent-ink" : "bg-d-panel text-d-ink")}>{m.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

const RIBBON_START = 8;
const RIBBON_END = 20;

function DayRibbon({ items, onJump }: { items: AgendaItem[]; onJump: (id: string) => void }) {
  const now = useNow(30000);
  const [open, setOpen] = React.useState<AgendaItem | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);
  const close = React.useCallback(() => setOpen(null), []);
  useOutside(ref, close, !!open);
  const span = RIBBON_END - RIBBON_START;
  const x = (at: number) => `${(Math.max(0, Math.min(span, at - RIBBON_START)) / span) * 100}%`;
  const at = now ? istParts(now).decimal : RIBBON_START;
  const sorted = [...items].sort((a, b) => a.at - b.at);
  const done = now ? sorted.filter((i) => i.at <= at).length : 0;
  const upcoming = sorted.find((i) => i.at > at);
  return (
    <section ref={ref} className="desk-card relative px-5 pb-4 pt-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[13px] font-semibold">
          Your day <span className="font-normal text-d-mute">· {done} of {sorted.length} done</span>
        </p>
        <p className="text-[12px] text-d-mute">{upcoming ? `Next: ${upcoming.title} at ${fmtTime(upcoming.at)}` : "Nothing else scheduled"}</p>
      </div>
      <div className="relative mt-7 h-[58px]">
        <div className="absolute inset-x-0 top-[14px] h-[6px] rounded-full bg-d-sunk" />
        <div className="absolute left-0 top-[14px] h-[6px] rounded-full transition-[width] duration-1000" style={{ width: x(at), background: "linear-gradient(90deg, color-mix(in oklab, var(--d-accent) 30%, transparent), var(--d-accent))" }} />
        {Array.from({ length: span + 1 }, (_, i) => RIBBON_START + i).map((h) => (
          <span key={h} className="absolute top-[38px] -translate-x-1/2 font-mono text-[10.5px] text-d-mute" style={{ left: x(h) }}>
            {h === 12 ? "12p" : h > 12 ? `${h - 12}p` : `${h}a`}
          </span>
        ))}
        {sorted.map((ev) => {
          const past = now && ev.at <= at;
          return (
            <button
              key={`${ev.at}-${ev.title}`}
              type="button"
              onClick={() => setOpen(open?.title === ev.title ? null : ev)}
              className="group absolute top-[17px] z-[2] -translate-x-1/2 -translate-y-1/2"
              style={{ left: x(ev.at) }}
              aria-label={ev.title}
            >
              <span
                className={cn("flex h-7 min-w-7 items-center justify-center rounded-full border-[2.5px] border-d-panel px-1 font-mono text-[10.5px] font-bold transition-transform group-hover:scale-110", past ? "text-d-accent-ink" : "text-d-ink")}
                style={{ background: past ? "var(--d-accent)" : `color-mix(in oklab, ${toneVar(ev.tone ?? "accent")} 22%, var(--d-panel))`, boxShadow: `0 0 0 1px ${past ? "var(--d-accent)" : toneVar(ev.tone ?? "accent")}` }}
              >
                {ev.count ?? (past ? <Check className="h-3 w-3" strokeWidth={3} /> : "")}
              </span>
              <span className={cn("pointer-events-none absolute left-1/2 top-[-22px] hidden -translate-x-1/2 whitespace-nowrap text-[11px] font-medium md:block", past ? "text-d-mute" : "text-d-ink")}>
                {ev.title.length > 22 ? `${ev.title.slice(0, 21)}…` : ev.title}
              </span>
            </button>
          );
        })}
        {now && (
          <span className="absolute top-0 z-[3] h-[34px] w-[2px] -translate-x-1/2 rounded-full bg-d-ink" style={{ left: x(at) }}>
            <span className="absolute -bottom-[21px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-d-ink px-1.5 py-px font-mono text-[10px] font-semibold text-d-paper">{clockLabel(now)}</span>
          </span>
        )}
        {open && (
          <div className="desk-rise absolute top-[46px] z-[5] w-[260px] -translate-x-1/2 rounded-[14px] border border-d-line bg-d-panel p-3 shadow-2xl" style={{ left: `clamp(130px, ${x(open.at)}, calc(100% - 130px))` }}>
            <p className="font-mono text-[11px] text-d-mute">{fmtTime(open.at)}</p>
            <p className="mt-0.5 text-[13.5px] font-semibold leading-snug">{open.title}</p>
            {open.detail && <p className="mt-1 text-[12.5px] leading-snug text-d-mute">{open.detail}</p>}
            {open.module && (
              <button
                type="button"
                onClick={() => {
                  onJump(open.module!);
                  setOpen(null);
                }}
                className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-medium text-d-accent hover:underline"
              >
                Open <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------------- Frame: Ledger ---------------- */

function LedgerFrame({ config, modules, active, onPick, actions, content, navOpen, setNavOpen }: FrameProps) {
  const now = useNow(1000);
  const groups = Array.from(new Set(modules.map((m) => m.group ?? "")));
  const sorted = [...config.agenda].sort((a, b) => a.at - b.at);
  const Icon = config.icon;
  return (
    <div className="min-h-screen lg:pl-[260px]">
      {navOpen && <button type="button" aria-label="Close contents" onClick={() => setNavOpen(false)} className="fixed inset-0 z-40 bg-black/30 lg:hidden" />}
      <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-d-line bg-d-paper transition-transform lg:translate-x-0", navOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full")}>
        <div className="px-6 pb-6 pt-7">
          <span className="flex h-11 w-11 items-center justify-center border-2 border-d-ink text-d-accent">
            <Icon className="h-5 w-5" strokeWidth={1.6} />
          </span>
          <p className="desk-h mt-3 text-[20px] font-semibold leading-tight">{titleOf(config)}</p>
          <p className="font-serif text-[13px] italic text-d-mute">{config.company} daybook</p>
        </div>
        <nav className="desk-scroll flex-1 overflow-y-auto px-6 pb-6">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-d-mute">Contents</p>
          {groups.map((g) => (
            <div key={g || "main"} className="mb-4">
              {g && <p className="mb-1 font-serif text-[13px] italic text-d-mute">{g}</p>}
              {modules
                .filter((m) => (m.group ?? "") === g)
                .map((m) => {
                  const on = m.id === active;
                  return (
                    <button key={m.id} type="button" onClick={() => onPick(m.id)} className={cn("flex w-full items-baseline gap-2 py-1.5 text-left text-[14.5px]", on ? "font-semibold text-d-ink" : "text-d-ink/75 hover:text-d-ink")}>
                      <span className={cn("w-3 shrink-0 text-d-accent transition-opacity", on ? "opacity-100" : "opacity-0")}>›</span>
                      <span className="desk-h shrink-0">{m.label}</span>
                      <span className="mb-1 min-w-4 flex-1 border-b border-dotted border-d-mute/50" />
                      <span className="tnum shrink-0 font-mono text-[12px] text-d-mute">{m.count ?? "·"}</span>
                    </button>
                  );
                })}
            </div>
          ))}
        </nav>
        <div className="border-t border-d-line px-6 py-4 font-mono text-[11.5px] text-d-mute">
          {config.owner.name} · {config.owner.role}
        </div>
      </aside>
      <div className="desk-paper min-h-screen pb-32">
        <header className="mx-auto max-w-[1240px] px-4 pt-6 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-d-ink pb-3">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setNavOpen(true)} className="rounded p-1.5 lg:hidden" aria-label="Contents">
                <Menu className="h-5 w-5" />
              </button>
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.2em] text-d-mute">
                {config.city} · {now ? longDate(now) : " "}
              </p>
            </div>
            {actions}
          </div>
          <div className="grid gap-6 py-7 md:grid-cols-[1fr_340px] md:items-end">
            <div>
              <h1 className="desk-h text-[44px] font-semibold leading-[0.98] tracking-[-0.02em] sm:text-[64px]">{titleOf(config)}</h1>
              <p className="mt-3 max-w-[640px] font-serif text-[18px] italic leading-snug text-d-mute">
                {config.company}, {config.city}. {config.tagline}
              </p>
            </div>
            <div className="border-l-2 border-d-accent pl-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-d-accent">On today&apos;s page</p>
              <ul className="mt-2 space-y-1.5">
                {sorted.slice(0, 4).map((a) => (
                  <li key={a.title}>
                    <button type="button" onClick={() => a.module && onPick(a.module)} className="flex w-full items-baseline gap-2 text-left text-[13.5px] hover:text-d-accent">
                      <span className="tnum w-[62px] shrink-0 font-mono text-[11.5px] text-d-mute">{fmtTime(a.at)}</span>
                      <span className="min-w-0 flex-1 truncate">{a.title}</span>
                      {a.count !== undefined && <span className="font-mono text-[11.5px] font-semibold text-d-accent">{a.count}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1240px] px-4 sm:px-8">{content}</main>
      </div>
    </div>
  );
}

/* ---------------- Frame: Control ---------------- */

function ControlFrame({ config, modules, active, onPick, actions, content }: FrameProps) {
  const now = useNow(1000);
  const Icon = config.icon;
  const sorted = [...config.agenda].sort((a, b) => a.at - b.at);
  const at = now ? istParts(now).decimal : 0;
  const nextUp = sorted.filter((a) => a.at > at).slice(0, 3);
  return (
    <div className="min-h-screen pb-32 sm:pl-[84px]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[84px] flex-col items-center border-r border-d-line bg-d-panel py-4 sm:flex">
        <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-d-accent text-d-accent-ink">
          <Icon className="h-5 w-5" />
        </span>
        <nav className="desk-noscroll mt-5 flex w-full flex-1 flex-col items-center gap-1 overflow-y-auto px-2">
          {modules.map((m) => {
            const on = m.id === active;
            const MIcon = m.icon;
            return (
              <button key={m.id} type="button" onClick={() => onPick(m.id)} title={m.label} className={cn("relative flex w-full flex-col items-center gap-1 rounded-[10px] px-1 py-2 transition-colors", on ? "bg-d-soft text-d-accent" : "text-d-mute hover:bg-d-sunk hover:text-d-ink")}>
                {on && <span className="absolute -left-2 bottom-2 top-2 w-[3px] rounded-r bg-d-accent" />}
                <MIcon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                <span className="w-full truncate text-center font-mono text-[9.5px] uppercase tracking-wide">{m.label.split(" ")[0]}</span>
                {m.count !== undefined && m.count > 0 && <span className="absolute right-1.5 top-1 rounded-full bg-d-warn px-1 font-mono text-[9px] font-bold text-black">{m.count}</span>}
              </button>
            );
          })}
        </nav>
      </aside>
      <header className="desk-scan border-b border-d-line">
        <div className="mx-auto max-w-[1560px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-d-line py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-d-mute">
            <span className="inline-flex items-center gap-2">
              <span className="desk-ping h-1.5 w-1.5 rounded-full bg-d-ok" /> online
              <span className="text-d-line">/</span> {config.company}
              <span className="text-d-line">/</span> {config.city}, {config.state}
            </span>
            <span className="tnum">{now ? `${clockLabel(now, true)} IST` : "--"}</span>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4 py-4">
            <div className="min-w-0">
              <h1 className="desk-h text-[26px] font-semibold uppercase leading-none sm:text-[32px]">{titleOf(config)}</h1>
              <p className="mt-2 font-mono text-[12px] text-d-mute">next: {nextUp.length ? nextUp.map((a) => `${fmtTime(a.at)} ${a.title}`).join("  ·  ") : "nothing scheduled"}</p>
            </div>
            {actions}
          </div>
          {config.pulse && (
            <div className="desk-noscroll -mx-1 flex overflow-x-auto border-t border-d-line">
              {config.pulse.map((p) => (
                <button key={p.label} type="button" onClick={() => p.module && onPick(p.module)} className="min-w-[170px] flex-1 border-r border-d-line px-3 py-3 text-left last:border-r-0 hover:bg-d-sunk">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-d-mute">{p.label}</p>
                  <p className="mt-1 flex items-baseline gap-2">
                    <span className="tnum font-mono text-[22px] font-semibold">{p.value}</span>
                    {p.delta && (
                      <span className="font-mono text-[11px]" style={{ color: (p.good ?? p.delta.startsWith("+")) ? "var(--d-ok)" : "var(--d-late)" }}>
                        {p.delta}
                      </span>
                    )}
                  </p>
                  {p.trend && <Sparkline data={p.trend} tone={p.tone ?? "accent"} height={20} className="mt-1" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>
      <nav className="desk-noscroll sticky top-0 z-30 flex gap-1 overflow-x-auto border-b border-d-line bg-d-paper/95 px-3 py-2 backdrop-blur sm:hidden">
        {modules.map((m) => (
          <button key={m.id} type="button" onClick={() => onPick(m.id)} className={cn("shrink-0 rounded-md px-2.5 py-1.5 font-mono text-[11.5px]", m.id === active ? "bg-d-accent text-d-accent-ink" : "text-d-mute")}>
            {m.label}
          </button>
        ))}
      </nav>
      <main className="mx-auto max-w-[1560px] px-4 pt-6 sm:px-6 lg:px-8">{content}</main>
    </div>
  );
}

/* ---------------- Frame: Inbox ---------------- */

function InboxFrame({ config, modules, active, onPick, actions, content, navOpen, setNavOpen, openCount, onSearch }: FrameProps) {
  const groups = Array.from(new Set(modules.map((m) => m.group ?? "Modules")));
  const Icon = config.icon;
  const current = modules.find((m) => m.id === active);
  return (
    <div className="min-h-screen lg:pl-[256px]">
      {navOpen && <button type="button" aria-label="Close menu" onClick={() => setNavOpen(false)} className="fixed inset-0 z-40 bg-black/30 lg:hidden" />}
      <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-[256px] flex-col border-r border-d-line bg-d-panel transition-transform lg:translate-x-0", navOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full")}>
        <div className="flex items-center gap-3 px-4 pb-4 pt-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-d-accent text-d-accent-ink">
            <Icon className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[14.5px] font-semibold">{titleOf(config)}</p>
            <p className="truncate text-[12px] text-d-mute">
              {config.company} · {config.city}
            </p>
          </div>
        </div>
        <nav className="desk-scroll flex-1 overflow-y-auto px-3 pb-4">
          <RailItem icon={Inbox} label="Inbox" count={openCount} on={active === HOME} onClick={() => onPick(HOME)} hot />
          {groups.map((g) => (
            <div key={g} className="mt-4">
              <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-d-mute/80">{g}</p>
              {modules
                .filter((m) => (m.group ?? "Modules") === g)
                .map((m) => (
                  <RailItem key={m.id} icon={m.icon} label={m.label} count={m.count} on={active === m.id} onClick={() => onPick(m.id)} />
                ))}
            </div>
          ))}
        </nav>
        <div className="flex items-center gap-3 border-t border-d-line px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-d-soft text-[12.5px] font-semibold text-d-accent">{config.owner.initials}</span>
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-medium">{config.owner.name}</p>
            <p className="truncate text-[12px] text-d-mute">{config.owner.role}</p>
          </div>
        </div>
      </aside>
      <header className="sticky top-0 z-30 border-b border-d-line bg-[color-mix(in_oklab,var(--d-paper)_88%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex h-[64px] max-w-[1480px] items-center gap-3 px-4 sm:px-6 lg:px-10">
          <button type="button" onClick={() => setNavOpen(true)} className="-ml-1 rounded-lg p-2 lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <p className="min-w-0 truncate text-[14px]">
            <span className="text-d-mute">{current?.group ?? config.company} / </span>
            <span className="font-semibold">{current ? current.label : "Inbox"}</span>
          </p>
          <button type="button" onClick={onSearch} className="ml-auto hidden h-9 w-[240px] items-center gap-2 whitespace-nowrap rounded-full border border-d-line bg-d-panel px-3.5 text-[13px] text-d-mute xl:flex">
            <Search className="h-4 w-4" />
            <span className="truncate">Search anything</span>
            <kbd className="ml-auto rounded border border-d-line px-1.5 font-mono text-[10.5px]">⌘K</kbd>
          </button>
          <div className="ml-auto xl:ml-0">{actions}</div>
        </div>
      </header>
      <main className="mx-auto max-w-[1480px] px-4 pb-32 pt-6 sm:px-6 lg:px-10">{content}</main>
    </div>
  );
}

function RailItem({ icon: Icon, label, count, on, onClick, hot }: { icon: DeskModule["icon"]; label: string; count?: number; on: boolean; onClick: () => void; hot?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("group relative flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left text-[14px] transition-colors", on ? "bg-d-soft font-semibold text-d-accent" : "text-d-ink/80 hover:bg-d-sunk hover:text-d-ink")}
    >
      <Icon className="h-[17px] w-[17px] shrink-0" strokeWidth={on ? 2.1 : 1.8} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count !== undefined && count > 0 && <span className={cn("rounded-full px-1.5 py-px font-mono text-[11px] font-medium", hot ? "bg-d-accent text-d-accent-ink" : "bg-d-sunk text-d-mute")}>{count}</span>}
    </button>
  );
}

const kindLabel: Record<Decision["kind"], string> = { Approve: "Approval", Risk: "Risk", Money: "Money", Reply: "Reply", People: "People" };
const kindTone: Record<Decision["kind"], Tone> = { Approve: "info", Risk: "late", Money: "warn", Reply: "accent", People: "ok" };

function greeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function InboxHome({ config, handled, onDecide, onModule }: { config: DeskConfig; handled: Record<string, string>; onDecide: (d: Decision, verdict: string | null) => void; onModule: (id: string) => void }) {
  const now = useNow(30000);
  const p = now ? istParts(now) : null;
  const decisions = config.decisions ?? [];
  const [kind, setKind] = React.useState<"All" | Decision["kind"]>("All");
  const open = decisions.filter((d) => !handled[d.id]);
  const done = decisions.filter((d) => handled[d.id]);
  const kinds = Array.from(new Set(decisions.map((d) => d.kind)));
  const shown = open.filter((d) => kind === "All" || d.kind === kind);

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-[760px]">
          <p className="text-[13px] font-medium text-d-mute">
            {p ? `${p.weekday}, ${p.day} ${p.month}` : " "} · {config.city}
          </p>
          <h1 className="desk-h mt-1 text-[36px] font-semibold leading-[1.05] tracking-tight sm:text-[44px]">
            {p ? greeting(p.hour) : "Hello"}, <span className="text-d-accent">{config.owner.first}</span>.
          </h1>
          {config.brief && (
            <p className="mt-3 text-[15.5px] leading-relaxed text-d-ink/80">
              <Sparkles className="mr-1.5 inline h-4 w-4 -translate-y-px text-d-accent" />
              {config.brief}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 rounded-[16px] border border-d-line bg-d-panel px-4 py-3">
          <div className="relative h-12 w-12">
            <svg viewBox="0 0 48 48" className="-rotate-90">
              <circle cx="24" cy="24" r="20" fill="none" stroke="var(--d-sunk)" strokeWidth="5" />
              <circle cx="24" cy="24" r="20" fill="none" stroke="var(--d-accent)" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${(done.length / Math.max(1, decisions.length)) * 125.6} 125.6`} style={{ transition: "stroke-dasharray 600ms ease" }} />
            </svg>
            <span className="tnum absolute inset-0 flex items-center justify-center font-mono text-[13px] font-semibold">{open.length}</span>
          </div>
          <div>
            <p className="text-[14px] font-semibold">{open.length ? `${open.length} need you` : "Inbox clear"}</p>
            <p className="text-[12px] text-d-mute">{done.length} handled today</p>
          </div>
        </div>
      </section>

      {config.pulse && <PulseStrip metrics={config.pulse} onModule={onModule} />}

      <div className="grid items-start gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
        <div className="space-y-6">
          <section>
            <h2 className="desk-h text-[19px] font-semibold">Needs you</h2>
            <div className="desk-noscroll -mx-1 mb-3 mt-2 flex gap-1 overflow-x-auto px-1">
              {(["All", ...kinds] as const).map((k) => (
                <button key={k} type="button" onClick={() => setKind(k)} className={cn("h-7 shrink-0 rounded-full px-2.5 text-[12px] font-medium", kind === k ? "bg-d-ink text-d-paper" : "text-d-mute hover:bg-d-sunk")}>
                  {k === "All" ? `All ${open.length}` : kindLabel[k]}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {shown.map((d, i) => (
                <DecisionCard key={d.id} d={d} delay={i * 50} onDecide={onDecide} onModule={onModule} />
              ))}
              {open.length === 0 && (
                <div className="desk-rise flex flex-col items-center rounded-[20px] border border-dashed border-d-line bg-d-panel px-6 py-10 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-d-soft text-d-ok">
                    <Check className="h-6 w-6" strokeWidth={2.5} />
                  </span>
                  <p className="mt-3 text-[16px] font-semibold">Nothing needs you right now.</p>
                  <p className="mt-1 text-[14px] text-d-mute">{config.brand} is running on its own.</p>
                </div>
              )}
            </div>
            {done.length > 0 && (
              <details className="mt-3 rounded-[16px] border border-d-line bg-d-panel px-4 py-2.5">
                <summary className="cursor-pointer text-[13px] font-medium text-d-mute">Handled today · {done.length}</summary>
                <ul className="mt-2 divide-y divide-d-line">
                  {done.map((d) => (
                    <li key={d.id} className="flex items-center gap-3 py-2 text-[13px]">
                      <Check className="h-3.5 w-3.5 text-d-ok" />
                      <span className="min-w-0 flex-1 truncate">{d.title}</span>
                      <span className="shrink-0 text-[11.5px] text-d-mute">{handled[d.id]}</span>
                      <button type="button" onClick={() => onDecide(d, null)} className="rounded p-1 text-d-mute hover:text-d-ink" aria-label="Undo">
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </section>
          <AgendaList items={config.agenda} onModule={onModule} />
        </div>
        <div className="min-w-0 space-y-6">
          {config.signature && (
            <section className="desk-card desk-rise min-w-0 overflow-hidden">
              <header className="flex flex-wrap items-start justify-between gap-3 border-b border-d-line px-5 py-4">
                <div>
                  <p className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-d-accent">
                    <span className="desk-ping h-1.5 w-1.5 rounded-full bg-d-accent" /> Live
                  </p>
                  <h2 className="desk-h mt-1 text-[21px] font-semibold">{config.signature.title}</h2>
                  <p className="mt-0.5 text-[13px] text-d-mute">{config.signature.sub}</p>
                </div>
                {config.signature.module && (
                  <button type="button" onClick={() => onModule(config.signature!.module!)} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-d-line px-3 text-[12.5px] font-medium hover:bg-d-sunk">
                    Open module <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </header>
              <div className="p-5">{config.signature.render()}</div>
            </section>
          )}
          {config.homeExtras?.()}
        </div>
      </div>
    </div>
  );
}

function DecisionCard({ d, delay, onDecide, onModule }: { d: Decision; delay: number; onDecide: (d: Decision, verdict: string | null) => void; onModule: (id: string) => void }) {
  const [menu, setMenu] = React.useState<"delegate" | "snooze" | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);
  const close = React.useCallback(() => setMenu(null), []);
  useOutside(ref, close, !!menu);
  const tone = d.tone ?? kindTone[d.kind];
  return (
    <article ref={ref} className="desk-rise relative rounded-[18px] border border-d-line bg-d-panel p-4 transition-shadow hover:shadow-[0_16px_40px_-28px_rgba(0,0,0,0.4)]" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-2 text-[11.5px]">
        <span className="rounded-full px-2 py-0.5 font-semibold" style={{ color: toneVar(tone), background: `color-mix(in oklab, ${toneVar(tone)} 11%, transparent)` }}>
          {kindLabel[d.kind]}
        </span>
        <span className="truncate text-d-mute">from {d.from}</span>
        {d.impact && <span className="tnum ml-auto shrink-0 font-mono text-[12px] font-semibold">{d.impact}</span>}
      </div>
      <h3 className="mt-2 text-[15px] font-semibold leading-snug">{d.title}</h3>
      <p className="mt-1 text-[13px] leading-snug text-d-mute">{d.context}</p>
      <div className="mt-3 flex gap-2 rounded-[12px] bg-d-soft px-3 py-2 text-[12.5px] leading-snug">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-d-accent" />
        <span>{d.recommendation}</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            onDecide(d, `Approved${d.approveLabel ? ` · ${d.approveLabel}` : ""}`);
            toast.success(d.approveLabel ?? "Approved", { description: d.title, action: { label: "Undo", onClick: () => onDecide(d, null) } });
          }}
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-d-accent px-3.5 text-[12.5px] font-semibold text-d-accent-ink hover:brightness-110 active:scale-[0.97]"
        >
          <Check className="h-3.5 w-3.5" /> {d.approveLabel ?? "Approve"}
        </button>
        <div className="relative">
          <button type="button" onClick={() => setMenu(menu === "delegate" ? null : "delegate")} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-d-line px-3 text-[12.5px] font-medium hover:bg-d-sunk">
            <UserRoundPlus className="h-3.5 w-3.5" /> Delegate
          </button>
          {menu === "delegate" && (
            <PopMenu
              items={["Team lead on this", "Accounts", "Supervisor", "Let the agent handle it"]}
              onPick={(item) => {
                setMenu(null);
                onDecide(d, `Handed to ${item.toLowerCase()}`);
                toast(`Handed to ${item.toLowerCase()}`, { description: d.title });
              }}
            />
          )}
        </div>
        <div className="relative">
          <button type="button" onClick={() => setMenu(menu === "snooze" ? null : "snooze")} className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[12.5px] font-medium text-d-mute hover:bg-d-sunk">
            <Clock3 className="h-3.5 w-3.5" /> Later
          </button>
          {menu === "snooze" && (
            <PopMenu
              items={["In 1 hour", "After lunch", "Tomorrow 9 AM", "Next Monday"]}
              onPick={(item) => {
                setMenu(null);
                onDecide(d, `Snoozed · ${item}`);
                toast(`Snoozed: ${item.toLowerCase()}`, { description: d.title });
              }}
            />
          )}
        </div>
        {d.module && (
          <button type="button" onClick={() => onModule(d.module!)} className="ml-auto inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-[12.5px] font-medium text-d-mute hover:text-d-ink">
            Details <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </article>
  );
}

function PopMenu({ items, onPick }: { items: string[]; onPick: (item: string) => void }) {
  return (
    <div className="desk-rise absolute left-0 top-full z-20 mt-1 w-[220px] overflow-hidden rounded-[12px] border border-d-line bg-d-panel p-1 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.35)]">
      {items.map((item) => (
        <button key={item} type="button" onClick={() => onPick(item)} className="block w-full rounded-[8px] px-2.5 py-1.5 text-left text-[12.5px] hover:bg-d-sunk">
          {item}
        </button>
      ))}
    </div>
  );
}

function PulseStrip({ metrics, onModule }: { metrics: NonNullable<DeskConfig["pulse"]>; onModule: (id: string) => void }) {
  return (
    <section className="desk-noscroll -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      {metrics.map((m, i) => {
        const good = m.good ?? m.delta?.trim().startsWith("+");
        return (
          <button key={m.label} type="button" onClick={() => m.module && onModule(m.module)} className="desk-rise flex min-w-[190px] flex-1 flex-col rounded-[18px] border border-d-line bg-d-panel px-4 pb-3 pt-3.5 text-left transition-all hover:-translate-y-0.5" style={{ animationDelay: `${i * 40}ms` }}>
            <span className="flex items-center justify-between gap-2 text-[12px] text-d-mute">
              {m.label}
              {m.delta && (
                <span className="font-mono text-[11px] font-semibold" style={{ color: good ? "var(--d-ok)" : "var(--d-late)" }}>
                  {m.delta}
                </span>
              )}
            </span>
            <span className="desk-h tnum mt-1 text-[24px] font-semibold leading-tight">{m.value}</span>
            {m.trend && (
              <span className="mt-1.5 block">
                <Sparkline data={m.trend} tone={m.tone ?? "accent"} height={26} />
              </span>
            )}
          </button>
        );
      })}
    </section>
  );
}

function AgendaList({ items, onModule }: { items: AgendaItem[]; onModule: (id: string) => void }) {
  const now = useNow(30000);
  const at = now ? istParts(now).decimal : 0;
  const sorted = [...items].sort((a, b) => a.at - b.at);
  const nowIndex = sorted.findIndex((i) => i.at > at);
  return (
    <section className="desk-card desk-rise p-5">
      <h2 className="desk-h text-[17px] font-semibold">Today</h2>
      <ol className="mt-3">
        {sorted.map((item, i) => (
          <React.Fragment key={`${item.at}-${item.title}`}>
            {now && i === nowIndex && (
              <li className="my-1 flex items-center gap-2">
                <span className="tnum rounded-full bg-d-accent px-2 py-0.5 font-mono text-[10.5px] font-semibold text-d-accent-ink">{clockLabel(now)}</span>
                <span className="h-px flex-1 bg-d-accent/40" />
              </li>
            )}
            <li>
              <button type="button" onClick={() => item.module && onModule(item.module)} className={cn("flex w-full items-start gap-3 rounded-[12px] px-2 py-2 text-left hover:bg-d-sunk", now && item.at <= at && "opacity-55")}>
                <span className="tnum w-[62px] shrink-0 pt-0.5 font-mono text-[11.5px] text-d-mute">{fmtTime(item.at)}</span>
                <span className="mt-0.5 w-[3px] shrink-0 self-stretch rounded-full" style={{ background: toneVar(item.tone ?? "accent") }} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-medium leading-snug">{item.title}</span>
                  {item.detail && <span className="block text-[12px] leading-snug text-d-mute">{item.detail}</span>}
                </span>
                {item.count !== undefined && (
                  <Pill tone={item.tone ?? "accent"} mono>
                    {item.count}
                  </Pill>
                )}
              </button>
            </li>
          </React.Fragment>
        ))}
      </ol>
    </section>
  );
}

/* ---------------- Module head ---------------- */

function ModuleHead({ module, variant }: { module: DeskModule; variant: DeskVariant }) {
  const Icon = module.icon;
  if (variant === "ledger") {
    return (
      <div className="mb-7 border-b border-d-line pb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-d-accent">{module.group ?? "Section"}</p>
        <h2 className="desk-h mt-1 text-[38px] font-semibold leading-none tracking-[-0.02em] sm:text-[46px]">{module.title}</h2>
        <p className="mt-2 max-w-[720px] font-serif text-[17px] italic text-d-mute">{module.blurb}</p>
      </div>
    );
  }
  if (variant === "control") {
    return (
      <div className="mb-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-d-accent">{"//"} {module.label}</p>
        <h2 className="desk-h text-[22px] font-semibold">{module.title}</h2>
        <p className="text-[13px] text-d-mute">{module.blurb}</p>
      </div>
    );
  }
  return (
    <div className="mb-5 mt-1 flex items-start gap-3.5">
      {variant === "inbox" && (
        <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-d-soft text-d-accent">
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </span>
      )}
      <div>
        <h2 className="desk-h text-[24px] font-semibold leading-tight sm:text-[28px]">{module.title}</h2>
        <p className="mt-0.5 max-w-[760px] text-[14.5px] text-d-mute">{module.blurb}</p>
      </div>
    </div>
  );
}

/* ---------------- Floating industry switch ---------------- */

function IndustrySwitch({
  slug,
  prevSlug,
  nextSlug,
  dark,
  inset,
  touring,
  calm,
  notes,
  onTour,
  onCalm,
  onNotes,
  onFullscreen,
  onKeys,
  onAsk,
}: {
  slug: string;
  prevSlug: string;
  nextSlug: string;
  dark: boolean;
  inset: number;
  touring: boolean;
  calm: boolean;
  notes: boolean;
  onTour: () => void;
  onCalm: () => void;
  onNotes: () => void;
  onFullscreen: () => void;
  onKeys: () => void;
  onAsk: () => void;
}) {
  const [deck, setDeck] = React.useState(false);
  const [more, setMore] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [sector, setSector] = React.useState<string>("All");
  const ref = React.useRef<HTMLDivElement>(null);
  const close = React.useCallback(() => {
    setDeck(false);
    setMore(false);
  }, []);
  useOutside(ref, close, deck || more);
  const meta = industries.find((i) => i.slug === slug) ?? industries[0];
  const needle = q.trim().toLowerCase();
  const list = industries.filter((i) => (sector === "All" || i.sector === sector) && `${i.name} ${i.company} ${i.city} ${i.signature}`.toLowerCase().includes(needle));
  const glass = dark ? "bg-[#14181d]/90 text-white ring-white/12" : "bg-white/90 text-[#1d1a17] ring-black/10";
  const hover = dark ? "hover:bg-white/10" : "hover:bg-black/[0.05]";
  const sub = dark ? "text-white/55" : "text-black/50";
  const on = dark ? "bg-white/10" : "bg-black/[0.05]";

  React.useEffect(() => {
    if (!deck) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDeck(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deck]);

  return (
    <div ref={ref} className="pointer-events-none fixed bottom-0 right-0 z-50 flex flex-col items-center px-3 pb-4" style={{ left: inset ? `max(0px, ${inset}px)` : 0 }}>
      {deck && (
        <div className={cn("desk-rise pointer-events-auto mb-3 w-full max-w-[980px] overflow-hidden rounded-[26px] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.5)] ring-1 backdrop-blur-2xl", glass)}>
          <div className="flex flex-wrap items-center gap-3 px-5 pb-3 pt-4">
            <div className="mr-auto">
              <p className="text-[16px] font-semibold">Switch business</p>
              <p className={cn("text-[12.5px]", sub)}>{industries.length} desks, each built around a different way of working</p>
            </div>
            <label className={cn("flex h-9 w-full items-center gap-2 rounded-full px-3 ring-1 sm:w-64", dark ? "bg-white/5 ring-white/15" : "bg-black/[0.03] ring-black/10")}>
              <Search className={cn("h-4 w-4", sub)} />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Industry, company or city" className="h-full flex-1 bg-transparent text-[13px] outline-none" />
            </label>
          </div>
          <div className="desk-noscroll flex gap-1.5 overflow-x-auto px-5 pb-3">
            {["All", ...sectors].map((s) => (
              <button key={s} type="button" onClick={() => setSector(s)} className={cn("h-7 shrink-0 rounded-full px-3 text-[12px] font-medium", sector === s ? (dark ? "bg-white text-black" : "bg-[#1d1a17] text-white") : cn(sub, hover))}>
                {s}
              </button>
            ))}
          </div>
          <div className="desk-scroll grid max-h-[52vh] gap-2 overflow-y-auto px-4 pb-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((i) => (
              <Link key={i.slug} href={`/industries/${i.slug}`} onClick={() => setDeck(false)} className={cn("group flex items-center gap-3 rounded-[16px] p-2.5 transition-colors", hover, i.slug === slug && on)}>
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[13px]" style={{ background: i.swatch[1] }}>
                  <span className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${i.swatch[0]} 0 55%, transparent 55%)` }} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-semibold">{i.company}</span>
                  <span className={cn("block truncate text-[12px]", sub)}>{i.name}</span>
                  <span className={cn("block truncate text-[11.5px]", sub)}>
                    {i.city} · {i.signature}
                  </span>
                </span>
                {i.slug === slug ? <Check className="h-4 w-4 shrink-0" /> : <ArrowRight className={cn("h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100", sub)} />}
              </Link>
            ))}
            {list.length === 0 && <p className={cn("col-span-full py-8 text-center text-[13px]", sub)}>Nothing matches “{q}”.</p>}
          </div>
          <div className={cn("flex items-center justify-between border-t px-5 py-2.5 text-[12px]", dark ? "border-white/10" : "border-black/10")}>
            <Link href="/#industries" className="inline-flex items-center gap-1.5 font-medium hover:underline">
              <LayoutGrid className="h-3.5 w-3.5" /> Back to the gallery
            </Link>
            <span className={sub}>
              <kbd className="font-mono">,</kbd> and <kbd className="font-mono">.</kbd> step through businesses
            </span>
          </div>
        </div>
      )}
      <div className="pointer-events-auto relative">
        {more && (
          <div className={cn("desk-rise absolute bottom-full right-0 mb-2 w-[220px] overflow-hidden rounded-[16px] p-1.5 shadow-2xl ring-1 backdrop-blur-2xl", glass)}>
            {[
              { icon: MonitorPlay, label: "Talking points", k: "N", run: onNotes, on: notes },
              { icon: Waves, label: "Calm mode", k: "C", run: onCalm, on: calm },
              { icon: Expand, label: "Fullscreen", k: "F", run: onFullscreen, on: false },
              { icon: Keyboard, label: "Keyboard", k: "?", run: onKeys, on: false },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  item.run();
                  setMore(false);
                }}
                className={cn("flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left text-[13px]", hover)}
              >
                <item.icon className={cn("h-4 w-4", sub)} />
                <span className="flex-1">{item.label}</span>
                {item.on && <Check className="h-3.5 w-3.5" />}
                <kbd className={cn("font-mono text-[10.5px]", sub)}>{item.k}</kbd>
              </button>
            ))}
          </div>
        )}
        <div className={cn("flex max-w-[calc(100vw-24px)] items-center gap-1 rounded-[22px] p-1.5 shadow-[0_22px_60px_-18px_rgba(0,0,0,0.45)] ring-1 backdrop-blur-2xl", glass)}>
          <Link href={`/industries/${prevSlug}`} className={cn("flex h-10 w-10 items-center justify-center rounded-[16px]", hover)} aria-label="Previous business">
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => {
              setDeck((d) => !d);
              setMore(false);
            }}
            className={cn("flex min-w-0 items-center gap-2.5 rounded-[16px] py-1 pl-1 pr-3 text-left", hover, deck && on)}
          >
            <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-[10px]" style={{ background: meta.swatch[1] }}>
              <span className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${meta.swatch[0]} 0 55%, transparent 55%)` }} />
            </span>
            <span className="min-w-0">
              <span className="block max-w-[38vw] truncate text-[13.5px] font-semibold leading-tight sm:max-w-[260px]">{meta.name}</span>
              <span className={cn("block max-w-[38vw] truncate text-[11.5px] leading-tight sm:max-w-[260px]", sub)}>
                {industries.indexOf(meta) + 1} of {industries.length} · switch business
              </span>
            </span>
            <ChevronUp className={cn("h-4 w-4 shrink-0 transition-transform", sub, !deck && "rotate-180")} />
          </button>
          <Link href={`/industries/${nextSlug}`} className={cn("flex h-10 w-10 items-center justify-center rounded-[16px]", hover)} aria-label="Next business">
            <ChevronRight className="h-4 w-4" />
          </Link>
          <span className={cn("mx-0.5 hidden h-6 w-px sm:block", dark ? "bg-white/15" : "bg-black/10")} />
          <button type="button" onClick={onTour} title="Tour (T)" aria-label={touring ? "Stop tour" : "Start tour"} className={cn("hidden h-10 w-10 items-center justify-center rounded-[16px] sm:flex", hover, touring && on)}>
            {touring ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button type="button" onClick={onAsk} title="Ask (/)" aria-label="Ask the copilot" className={cn("hidden h-10 w-10 items-center justify-center rounded-[16px] sm:flex", hover)}>
            <Sparkles className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setMore((m) => !m);
              setDeck(false);
            }}
            aria-label="More"
            className={cn("flex h-10 w-10 items-center justify-center rounded-[16px]", hover)}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function TalkingPoints({ module, config, onClose }: { module: DeskModule | null; config: DeskConfig; onClose: () => void }) {
  const notes = module ? (module.notes?.length ? module.notes : [module.blurb]) : [config.brief ?? config.tagline];
  return (
    <aside className="desk-rise fixed bottom-28 right-4 z-50 w-[min(360px,calc(100vw-32px))] rounded-[18px] border border-d-line bg-d-panel p-4 shadow-[0_30px_70px_-25px_rgba(0,0,0,0.45)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-d-accent">Talking points</p>
          <p className="desk-h mt-0.5 text-[16px] font-semibold">{module ? module.title : "Inbox"}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded p-1 text-d-mute hover:text-d-ink">
          <X className="h-4 w-4" />
        </button>
      </div>
      <ul className="mt-2 space-y-2">
        {notes.map((n) => (
          <li key={n} className="flex gap-2 text-[13px] leading-snug">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-d-accent" />
            {n}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export type { Tone };
