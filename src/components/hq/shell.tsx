"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "cn";
import { toast } from "sonner";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ArrowRight, Bell, Bot, Check, ChevronsUpDown, CornerDownLeft, Menu, Plus, Search, Sparkles, X } from "lucide-react";
import { Logo } from "@/components/funnel/logo";
import { CopilotPanel, RunAgentSheet } from "../desk/agent";
import { DeskRootContext, Field, Modal, inputClass, useDeskRoot } from "../desk/ui";
import { useNow, clockLabel } from "../desk/hooks";
import type { AgentRun, AskPrompt } from "../desk/types";
import { hqHref, hqModuleById, hqModules } from "./nav";
import { HQProvider, useHQ } from "./store";
import { PersonAvatar } from "./kit";
import { personById, team } from "./data";
import type { Task } from "./types";

const tokens = {
  "--d-paper": "#f7f3ec",
  "--d-panel": "#fffdf9",
  "--d-sunk": "#f1ebe1",
  "--d-ink": "#1d1714",
  "--d-mute": "#7a6f64",
  "--d-line": "#e8dfd2",
  "--d-accent": "#6e2b36",
  "--d-accent-ink": "#ffffff",
  "--d-soft": "#f3e6e6",
  "--d-ok": "#2f7d5b",
  "--d-warn": "#b7791f",
  "--d-late": "#b3412f",
  "--d-info": "#2f5d8a",
  "--d-brand": "#6e2b36",
  "--d-gold": "#b8862f",
  "--d-radius": "14px",
} as React.CSSProperties;

const asks: AskPrompt[] = [
  { q: "How did we do yesterday?", a: "Yesterday: ₹6.4 L collected across 11 payments.\n• Accelerator: 5 enrolments (₹3.75 L)\n• Launchpad: 7 (₹1.75 L)\n• Done-for-you milestone from Apollo Pharma: ₹82k\n\nCalls: 146 dialled, 61 connected (42%), 19 booked consultations. Close rate on qualified calls was 16.8%, up from 14.2% last month. Ad spend ₹43,800 for 1,152 workshop registrations (CPL ₹38).", sources: ["Revenue Center", "Sales Day Reports", "ROAS Calculator"] },
  { q: "Which leads should I call first?", a: "Top 5 by AI score and timing:\n1. Harish Patel, Kaveri Weaves (94): attended both days, asked about done-for-you\n2. Sunil Agarwal, Om Engineering (91): ₹25-50 Cr, call back promised for 11 AM\n3. Rekha Shetty, Care Dental (88): wants the chair-map demo\n4. Vivek Jain, Balaji Distributors (86): partner joining at 4 PM\n5. Pooja Reddy, Shubh Jewellers (84): budget approved\n\nAll five are in your Calling CRM queue, in this order.", sources: ["Lead Qualifier", "Calling CRM"] },
  { q: "Who is behind on target this month?", a: "Month to date (20 of 31 days, so 65% of the way):\n• Rohan: 71% of ₹22 L, ahead\n• Sneha: 68% of ₹16 L, on pace\n• Arjun: 49% of ₹12 L, behind by about ₹1.9 L\n• Kavya: 41% of ₹12 L, behind; 6 proposals pending\n• Imran: 3,410 leads qualified, 58% of booked-call target\n\nSuggestion: move 8 of Kavya's warm proposals to a joint call with Rohan this week.", sources: ["Revenue Center", "Accountability Board"] },
  { q: "What's blocking client builds?", a: "One blocked, one at risk:\n• Spice Route Restaurants (blocked): Swiggy API keys still not shared by the client. Vikram has a fix ready; go-live slips past 16 days without the keys.\n• Precision Auto Parts (at risk): blueprint sign-off pending 9 days; 30% advance received.\n\nBalaji Distributors goes live Friday; Apollo Pharma goes live tomorrow.", sources: ["Client Builds"] },
  { q: "Which ad campaign makes the most money?", a: "Over the last 14 days:\n• 'Can't take a holiday' Reels (owners 35-55): CPL ₹31, 6.1% become paid students, ROAS 7.8x\n• Webinar retargeting: CPL ₹52, ROAS 5.2x\n• Broad lookalike: CPL ₹74, ROAS 1.9x (pause candidate)\n\nMeera has already scaled the Reels set by 20%.", sources: ["ROAS Calculator", "Meta Ads"] },
  { q: "Summarise Batch 14 so far", a: "Batch 14 (13–14 Oct): 1,248 registered, 812 showed up on day 1 (65%), 604 stayed to the Q&A on day 2.\n• 143 booked consultation calls\n• 38 enrolled in a paid program so far (₹21.4 L)\n• 38 attendees still need their blueprint pack (Access Readiness)\n• NPS 71 from 418 responses", sources: ["Student Search", "Access Readiness", "Revenue Center"] },
];

const run: AgentRun = {
  label: "Runs every morning at 8 AM; you can run it now",
  title: "Morning operator",
  steps: [
    { text: "Read yesterday's payments, calls and reports", result: "₹6.4 L collected, 146 calls, 11 reports filed" },
    { text: "Score overnight leads from Meta, website and WhatsApp", result: "34 new leads, 9 scored hot" },
    { text: "Build each advisor's call queue for today", result: "5 queues, 212 calls, best leads first" },
    { text: "Check client builds and student access", result: "1 build blocked, 38 blueprint packs pending" },
    { text: "Draft the morning brief and nudges", result: "Brief posted to My Today, 3 nudges ready" },
  ],
  outcome: "Today's call queues are ready, 9 hot leads are at the top, and the Spice Route build needs a nudge to the client for Swiggy keys. Three overdue tasks are flagged to their owners.",
  actions: ["Post brief to Announcements", "Send nudges to owners", "Email Spice Route for API keys"],
};

/* ---------------- Shell ---------------- */

export function HQShell({ children }: { children: React.ReactNode }) {
  const [root, setRoot] = React.useState<HTMLDivElement | null>(null);
  const [askOpen, setAskOpen] = React.useState(false);
  const [askSeed, setAskSeed] = React.useState({ n: 0, q: "" });
  const [runOpen, setRunOpen] = React.useState(false);
  const [runSeed, setRunSeed] = React.useState(0);

  const openAsk = React.useCallback((q?: string) => {
    setAskSeed((s) => ({ n: s.n + 1, q: q ?? "" }));
    setAskOpen(true);
  }, []);
  const runAgent = React.useCallback(() => {
    setRunSeed((s) => s + 1);
    setRunOpen(true);
  }, []);

  return (
    <div ref={setRoot} className="desk hq relative min-h-screen" data-variant="hq" data-heading="serif" style={tokens}>
      <DeskRootContext.Provider value={root}>
        <HQProvider openAsk={openAsk} runAgent={runAgent}>
          <Frame>{children}</Frame>
          <CopilotPanel key={`ask-${askSeed.n}`} open={askOpen} onOpenChange={setAskOpen} brand="HQ" company="BuildBiz" prompts={asks} initial={askSeed.q} />
          <RunAgentSheet key={`run-${runSeed}`} open={runOpen} onOpenChange={setRunOpen} run={run} />
        </HQProvider>
      </DeskRootContext.Provider>
    </div>
  );
}

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

function Frame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hq = useHQ();
  const [navOpen, setNavOpen] = React.useState(false);
  const [palette, setPalette] = React.useState(false);
  const [newTask, setNewTask] = React.useState(false);
  const activeId = pathname === "/hq" ? "today" : pathname.split("/")[2] ?? "today";
  const active = hqModuleById[activeId];

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((o) => !o);
        return;
      }
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || document.querySelector("[role=dialog]")) return;
      if (e.key === "/") {
        e.preventDefault();
        hq.openAsk();
      } else if ((e.key === "n" || e.key === "N") && !window.location.pathname.startsWith("/hq/crm")) setNewTask(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hq]);

  const unread = hq.notifications.filter((n) => !n.read).length;
  const badges: Record<string, number> = {
    notifications: unread,
    tasks: hq.tasks.filter((t) => t.owner === hq.me.id && t.status !== "Done").length,
    followups: hq.leads.filter((l) => l.followUpIn < 0 && l.stage !== "Won" && l.stage !== "Lost").length,
    crm: hq.leads.filter((l) => (hq.me.role !== "sales" || l.owner === hq.me.id) && l.score >= 80 && l.stage !== "Won" && l.stage !== "Lost").length,
    qualifier: hq.leads.filter((l) => l.stage === "New").length,
    announcements: hq.announcements.filter((a) => {
      const mine = a.audience === "Everyone" || hq.me.role === "founder" || a.audience.toLowerCase() === hq.me.role;
      return mine && a.by !== hq.me.id && !a.acks.includes(hq.me.id);
    }).length,
  };
  const groups = Array.from(new Set(hqModules.map((m) => m.group)));

  return (
    <div className="min-h-screen lg:pl-[264px]">
      {navOpen && <button type="button" aria-label="Close menu" onClick={() => setNavOpen(false)} className="fixed inset-0 z-40 bg-black/30 lg:hidden" />}
      <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-d-line bg-[#fbf8f2] transition-transform lg:translate-x-0", navOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full")}>
        <div className="flex items-center gap-3 px-5 pb-4 pt-5">
          <Logo className="size-9" />
          <div className="min-w-0 leading-none">
            <p className="font-display text-[17px] font-bold tracking-tight">
              BuildBiz<span className="text-d-accent">AI</span>
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-d-mute">Command center</p>
          </div>
        </div>
        <div className="px-3 pb-3">
          <button type="button" onClick={() => setPalette(true)} className="flex h-9 w-full items-center gap-2 whitespace-nowrap rounded-[10px] border border-d-line bg-d-panel px-3 text-[13px] text-d-mute hover:border-[color-mix(in_oklab,var(--d-accent)_30%,var(--d-line))]">
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Search anything</span>
            <kbd className="ml-auto rounded border border-d-line px-1 font-mono text-[10px]">⌘K</kbd>
          </button>
        </div>
        <nav className="desk-scroll flex-1 overflow-y-auto px-3 pb-4">
          {groups.map((g) => (
            <div key={g} className="mb-4">
              <p className="px-2.5 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-d-mute/80">{g}</p>
              {hqModules
                .filter((m) => m.group === g)
                .map((m) => {
                  const on = m.id === activeId;
                  const Icon = m.icon;
                  const badge = badges[m.id];
                  return (
                    <Link
                      key={m.id}
                      href={hqHref(m.id)}
                      onClick={() => setNavOpen(false)}
                      className={cn("group relative flex items-center gap-2.5 rounded-[9px] px-2.5 py-[7px] text-[13.5px] transition-colors", on ? "bg-d-panel font-semibold text-d-ink shadow-[0_1px_0_var(--d-line),0_6px_16px_-12px_rgba(60,30,20,0.4)]" : "text-d-ink/75 hover:bg-d-sunk hover:text-d-ink")}
                    >
                      {on && <span className="absolute -left-3 bottom-1.5 top-1.5 w-[3px] rounded-r-full bg-d-accent" />}
                      <Icon className={cn("h-[16px] w-[16px] shrink-0", on ? "text-d-accent" : "text-d-mute group-hover:text-d-ink")} strokeWidth={1.8} />
                      <span className="min-w-0 flex-1 truncate">{m.label}</span>
                      {badge ? (
                        <span className={cn("min-w-[20px] rounded-full px-1.5 text-center font-mono text-[10.5px] font-semibold leading-[18px]", m.id === "notifications" || m.id === "followups" ? "bg-d-late text-white" : "bg-d-sunk text-d-mute")}>{badge}</span>
                      ) : null}
                    </Link>
                  );
                })}
            </div>
          ))}
        </nav>
        <ProfileSwitcher />
      </aside>

      <header className="sticky top-0 z-30 border-b border-d-line bg-[color-mix(in_oklab,var(--d-paper)_88%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex h-[60px] max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-9">
          <button type="button" onClick={() => setNavOpen(true)} className="-ml-1 rounded-lg p-2 lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <p className="min-w-0 truncate text-[13.5px]">
            <span className="text-d-mute">{active?.group ?? "Workspace"} / </span>
            <span className="font-semibold">{active?.label ?? "My Today"}</span>
          </p>
          <div className="ml-auto flex items-center gap-1.5">
            <OnlineStack />
            <Clock />
            <QuickAdd onNewTask={() => setNewTask(true)} />
            <BellMenu />
            <button type="button" onClick={() => hq.runAgent()} className="hidden h-9 items-center gap-1.5 rounded-full border border-d-line bg-d-panel px-3 text-[12.5px] font-medium hover:bg-d-sunk sm:inline-flex">
              <Bot className="h-4 w-4" /> Run agent
            </button>
            <button type="button" onClick={() => hq.openAsk()} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#1d1714] px-3.5 text-[12.5px] font-semibold text-[#f5e6c8] hover:bg-black">
              <Sparkles className="h-4 w-4 text-[#e4c27a]" /> Ask HQ
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 pb-24 pt-7 sm:px-6 lg:px-9">{children}</main>

      <Palette open={palette} onOpenChange={setPalette} onNavigate={(href) => router.push(href)} onNewTask={() => setNewTask(true)} />
      <NewTaskModal open={newTask} onOpenChange={setNewTask} />
    </div>
  );
}

/* ---------------- Top-bar pieces ---------------- */

function Clock() {
  const now = useNow(30000);
  return <span className="tnum hidden px-2 font-mono text-[12px] text-d-mute md:inline">{now ? clockLabel(now) : "--:--"}</span>;
}

function OnlineStack() {
  const online = team.filter((p) => p.online);
  return (
    <div className="mr-1 hidden items-center xl:flex" title={`${online.length} teammates online`}>
      <div className="flex -space-x-2">
        {online.slice(0, 5).map((p) => (
          <span key={p.id} className="relative">
            <PersonAvatar id={p.id} size={26} ring />
          </span>
        ))}
      </div>
      <span className="ml-2 inline-flex items-center gap-1 text-[12px] text-d-mute">
        <span className="desk-ping h-1.5 w-1.5 rounded-full bg-d-ok" />
        {online.length} online
      </span>
    </div>
  );
}

function QuickAdd({ onNewTask }: { onNewTask: () => void }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const close = React.useCallback(() => setOpen(false), []);
  useOutside(ref, close, open);
  const router = useRouter();
  const items = [
    { label: "New task", hint: "N", run: onNewTask },
    { label: "Log a call", hint: "Calling CRM", run: () => router.push("/hq/crm") },
    { label: "Post announcement", hint: "Announcements", run: () => router.push("/hq/announcements") },
    { label: "File today's report", hint: "Daily Reporting", run: () => router.push("/hq/daily") },
  ];
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-label="Create" className="flex h-9 w-9 items-center justify-center rounded-full border border-d-line bg-d-panel hover:bg-d-sunk">
        <Plus className="h-4 w-4" />
      </button>
      {open && (
        <div className="desk-rise absolute right-0 top-full z-50 mt-2 w-[230px] overflow-hidden rounded-[14px] border border-d-line bg-d-panel p-1.5 shadow-[0_24px_60px_-20px_rgba(40,20,10,0.35)]">
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              onClick={() => {
                setOpen(false);
                it.run();
              }}
              className="flex w-full items-center justify-between rounded-[9px] px-2.5 py-2 text-left text-[13px] hover:bg-d-sunk"
            >
              {it.label}
              <span className="text-[11px] text-d-mute">{it.hint}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BellMenu() {
  const hq = useHQ();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const close = React.useCallback(() => setOpen(false), []);
  useOutside(ref, close, open);
  const unread = hq.notifications.filter((n) => !n.read).length;
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-label="Notifications" className="relative flex h-9 w-9 items-center justify-center rounded-full border border-d-line bg-d-panel hover:bg-d-sunk">
        <Bell className="h-4 w-4" />
        {unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-d-late px-1 font-mono text-[9.5px] font-bold text-white">{unread}</span>}
      </button>
      {open && (
        <div className="desk-rise absolute right-0 top-full z-50 mt-2 w-[380px] max-w-[calc(100vw-24px)] overflow-hidden rounded-[16px] border border-d-line bg-d-panel shadow-[0_24px_60px_-20px_rgba(40,20,10,0.35)]">
          <div className="flex items-center justify-between border-b border-d-line px-4 py-3">
            <p className="font-serif text-[16px] font-medium">Notifications</p>
            <button type="button" onClick={() => hq.markRead()} className="text-[12px] font-medium text-d-accent hover:underline">
              Mark all read
            </button>
          </div>
          <ul className="desk-scroll max-h-[400px] divide-y divide-d-line overflow-y-auto">
            {hq.notifications.slice(0, 8).map((n) => (
              <li key={n.id}>
                <Link
                  href={n.href ?? "/hq/notifications"}
                  onClick={() => {
                    hq.markRead(n.id);
                    setOpen(false);
                  }}
                  className={cn("flex gap-3 px-4 py-3 hover:bg-d-sunk", !n.read && "bg-[color-mix(in_oklab,var(--d-accent)_4%,transparent)]")}
                >
                  <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-d-line" : "bg-d-accent")} />
                  <span className="min-w-0">
                    <span className="block text-[13px] font-medium leading-snug">{n.title}</span>
                    <span className="block text-[12px] leading-snug text-d-mute">{n.body}</span>
                    <span className="mt-0.5 block font-mono text-[10.5px] text-d-mute">{n.at}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/hq/notifications" onClick={() => setOpen(false)} className="flex items-center justify-center gap-1 border-t border-d-line py-2.5 text-[12.5px] font-medium text-d-accent hover:bg-d-sunk">
            Open inbox <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

function ProfileSwitcher() {
  const hq = useHQ();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const close = React.useCallback(() => setOpen(false), []);
  useOutside(ref, close, open);
  const options = ["amit", "rohan", "sneha", "neha", "priya", "aditya", "meera"];
  return (
    <div ref={ref} className="relative border-t border-d-line p-3">
      {open && (
        <div className="desk-rise absolute bottom-full left-3 right-3 z-50 mb-2 overflow-hidden rounded-[14px] border border-d-line bg-d-panel p-1.5 shadow-[0_24px_60px_-20px_rgba(40,20,10,0.35)]">
          <p className="px-2.5 pb-1 pt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-d-mute">View HQ as</p>
          {options.map((id) => {
            const p = personById[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  hq.setMe(id);
                  setOpen(false);
                  toast(`Viewing as ${p.first}`, { description: p.title });
                }}
                className="flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-1.5 text-left hover:bg-d-sunk"
              >
                <PersonAvatar id={id} size={26} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium">{p.name}</span>
                  <span className="block truncate text-[11.5px] text-d-mute">{p.title}</span>
                </span>
                {hq.me.id === id && <Check className="h-3.5 w-3.5 text-d-accent" />}
              </button>
            );
          })}
        </div>
      )}
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 rounded-[12px] px-2 py-2 text-left hover:bg-d-sunk">
        <span className="relative">
          <PersonAvatar id={hq.me.id} size={36} />
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#fbf8f2] bg-d-ok" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-semibold">{hq.me.name}</span>
          <span className="block truncate text-[12px] text-d-mute">{hq.me.title}</span>
        </span>
        <ChevronsUpDown className="h-4 w-4 text-d-mute" />
      </button>
    </div>
  );
}

/* ---------------- Command palette ---------------- */

type PaletteItem = { id: string; group: string; label: string; sub?: string; run: () => void };

function Palette({ open, onOpenChange, onNavigate, onNewTask }: { open: boolean; onOpenChange: (o: boolean) => void; onNavigate: (href: string) => void; onNewTask: () => void }) {
  const root = useDeskRoot();
  const hq = useHQ();
  const [q, setQ] = React.useState("");
  const [cursor, setCursor] = React.useState(0);
  const needle = q.trim().toLowerCase();
  const items: PaletteItem[] = [
    { id: "act-ask", group: "Actions", label: "Ask HQ", sub: "Copilot over every module", run: () => hq.openAsk(q || undefined) },
    { id: "act-task", group: "Actions", label: "New task", sub: "Assign to anyone", run: onNewTask },
    { id: "act-run", group: "Actions", label: "Run morning operator", sub: "Agent", run: () => hq.runAgent() },
    ...hqModules.map((m) => ({ id: `m-${m.id}`, group: "Tools", label: m.label, sub: m.blurb, run: () => onNavigate(hqHref(m.id)) })),
    ...(needle.length >= 2
      ? hq.leads
          .filter((l) => `${l.name} ${l.company} ${l.city} ${l.phone}`.toLowerCase().includes(needle))
          .slice(0, 6)
          .map((l) => ({ id: `l-${l.id}`, group: "Leads", label: `${l.name} · ${l.company}`, sub: `${l.stage} · score ${l.score} · ${l.city}`, run: () => onNavigate(`/hq/crm?lead=${l.id}`) }))
      : []),
  ];
  const shown = needle ? items.filter((i) => i.group === "Leads" || `${i.label} ${i.sub ?? ""}`.toLowerCase().includes(needle)) : items;
  const safe = Math.min(cursor, Math.max(0, shown.length - 1));
  function pick(item?: PaletteItem) {
    if (!item) return;
    onOpenChange(false);
    setQ("");
    item.run();
  }
  let last = "";
  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) {
          setQ("");
          setCursor(0);
        }
      }}
    >
      <DialogPrimitive.Portal container={root}>
        <DialogPrimitive.Overlay className="bb-overlay fixed inset-0 z-[80] bg-[#1d1714]/35 backdrop-blur-[3px]" />
        <DialogPrimitive.Content className="desk-rise fixed left-1/2 top-[11vh] z-[81] w-[calc(100vw-32px)] max-w-[620px] -translate-x-1/2 overflow-hidden rounded-[18px] border border-d-line bg-d-panel text-d-ink shadow-[0_40px_120px_-30px_rgba(40,20,10,0.5)] outline-none">
          <DialogPrimitive.Title className="sr-only">Search HQ</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">Jump to a tool, find a lead or run an action</DialogPrimitive.Description>
          <div className="flex items-center gap-3 border-b border-d-line px-4">
            <Search className="h-4 w-4 text-d-mute" />
            <input
              autoFocus
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setCursor(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setCursor((c) => Math.min(shown.length - 1, c + 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setCursor((c) => Math.max(0, c - 1));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  pick(shown[safe]);
                }
              }}
              placeholder="Search a lead, a tool, or ask anything…"
              className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-d-mute"
            />
            <DialogPrimitive.Close className="rounded p-1 text-d-mute hover:text-d-ink" aria-label="Close">
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>
          <div className="desk-scroll max-h-[54vh] overflow-y-auto p-2">
            {shown.map((item, i) => {
              const header = item.group !== last ? item.group : null;
              last = item.group;
              return (
                <React.Fragment key={item.id}>
                  {header && <p className="px-3 pb-1 pt-3 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-d-mute">{header}</p>}
                  <button type="button" onMouseMove={() => setCursor(i)} onClick={() => pick(item)} className={cn("flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left", i === safe && "bg-d-sunk")}>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-medium">{item.label}</span>
                      {item.sub && <span className="block truncate text-[12px] text-d-mute">{item.sub}</span>}
                    </span>
                    {i === safe && <CornerDownLeft className="h-3.5 w-3.5 text-d-mute" />}
                  </button>
                </React.Fragment>
              );
            })}
            {shown.length === 0 && <p className="px-3 py-8 text-center text-[13px] text-d-mute">No match. Press Enter on “Ask HQ” to ask the copilot.</p>}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/* ---------------- New task ---------------- */

function NewTaskModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const hq = useHQ();
  const [title, setTitle] = React.useState("");
  const [owner, setOwner] = React.useState("rohan");
  const [priority, setPriority] = React.useState<Task["priority"]>("P1");
  const [area, setArea] = React.useState<Task["area"]>("Sales");
  const [dueIn, setDueIn] = React.useState(1);
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="New task" sub="It lands in Task Manager and on the owner's My Today.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          hq.addTask({ title: title.trim(), owner, priority, area, status: "Todo", dueIn, due: dueIn === 0 ? "Today" : dueIn === 1 ? "Tomorrow" : `in ${dueIn}d` });
          hq.log(`assigned "${title.trim()}" to ${personById[owner].first}`, "info");
          hq.notify({ kind: "task", title: `New task for ${personById[owner].first}`, body: title.trim(), href: "/hq/tasks" });
          setTitle("");
          onOpenChange(false);
        }}
      >
        <Field label="Task">
          <input autoFocus className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Call back the 9 hot leads from Batch 14" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Owner">
            <select className={inputClass} value={owner} onChange={(e) => setOwner(e.target.value)}>
              {team.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Area">
            <select className={inputClass} value={area} onChange={(e) => setArea(e.target.value as Task["area"])}>
              {["Sales", "Delivery", "Marketing", "Ops", "Finance"].map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <select className={inputClass} value={priority} onChange={(e) => setPriority(e.target.value as Task["priority"])}>
              {["P0", "P1", "P2", "P3"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="Due">
            <select className={inputClass} value={dueIn} onChange={(e) => setDueIn(Number(e.target.value))}>
              <option value={0}>Today</option>
              <option value={1}>Tomorrow</option>
              <option value={3}>In 3 days</option>
              <option value={7}>Next week</option>
            </select>
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={() => onOpenChange(false)} className="h-9 rounded-[10px] border border-d-line px-3.5 text-[13px] font-medium hover:bg-d-sunk">
            Cancel
          </button>
          <button type="submit" className="h-9 rounded-[10px] bg-d-accent px-3.5 text-[13px] font-semibold text-white hover:brightness-110">
            Create task
          </button>
        </div>
      </form>
    </Modal>
  );
}
