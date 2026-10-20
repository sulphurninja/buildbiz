"use client";

import * as React from "react";
import { cn } from "cn";
import { toast } from "sonner";
import { Check, Clock, Loader2, Phone, Plug, Power, RefreshCw, Sparkles, TrendingUp, UserRoundCog, Zap } from "lucide-react";
import type { IndependenceData, Integration, TeamMember, WorkforceAgent } from "./types";
import { Bars, Gauge, Sparkline } from "./charts";
import { Avatar, Btn, KV, Meter, Panel, Pill, Segmented, Sheet, Stat } from "./ui";
import { useDesk } from "./shell";

/* ---------------- Team ---------------- */

const statusTone = { "On floor": "ok", "In field": "info", Busy: "warn", "On leave": "late", Off: "neutral" } as const;

export function PeopleModule({ members, unit = "tasks" }: { members: TeamMember[]; unit?: string }) {
  const desk = useDesk();
  const [people, setPeople] = React.useState(members);
  const [open, setOpen] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState("Everyone");
  const person = people.find((p) => p.name === open) ?? null;
  const shown = people.filter((p) => filter === "Everyone" || p.status === filter);
  const openTasks = people.reduce((a, p) => a + p.tasks.filter((t) => !t.done).length, 0);
  const avgLoad = Math.round(people.reduce((a, p) => a + p.load, 0) / Math.max(1, people.length));
  const present = people.filter((p) => p.status !== "On leave" && p.status !== "Off").length;

  function toggleTask(name: string, title: string) {
    setPeople((cur) =>
      cur.map((p) => (p.name === name ? { ...p, tasks: p.tasks.map((t) => (t.title === title ? { ...t, done: !t.done } : t)) } : p)),
    );
    desk.log(`${name.split(" ")[0]} ticked off: ${title}`);
  }

  function reassign(from: string, title: string) {
    const target = [...people].filter((p) => p.name !== from && p.status !== "On leave" && p.status !== "Off").sort((a, b) => a.load - b.load)[0];
    if (!target) return;
    setPeople((cur) =>
      cur.map((p) => {
        if (p.name === from) return { ...p, load: Math.max(0, p.load - 8), tasks: p.tasks.filter((t) => t.title !== title) };
        if (p.name === target.name) return { ...p, load: Math.min(100, p.load + 8), tasks: [...p.tasks, { title, due: "today" }] };
        return p;
      }),
    );
    toast.success(`Moved to ${target.name}`, { description: title });
    desk.log(`${title} reassigned to ${target.name.split(" ")[0]}`);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="In today" value={`${present} / ${people.length}`} hint="marked by 9:15 AM" icon={UserRoundCog} />
        <Stat label={`Open ${unit}`} value={openTasks} hint="across the team" icon={Clock} />
        <Stat label="Average load" value={`${avgLoad}%`} delta={avgLoad > 80 ? "+9%" : "-3%"} deltaGood={false} hint="vs last week" icon={TrendingUp} />
        <Stat label="Owner hours saved" value="11.5 h" delta="+2.5 h" hint="this week, from delegation" icon={Sparkles} />
      </div>
      <Panel
        title="Who is doing what"
        sub="Tap a person to see their day. Tick tasks off or hand them to whoever is lightest."
        action={<Segmented size="sm" options={["Everyone", "On floor", "In field", "Busy", "On leave"]} value={filter} onChange={setFilter} />}
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((p) => (
            <button key={p.name} type="button" onClick={() => setOpen(p.name)} className="desk-rise rounded-[calc(var(--d-radius,18px)*0.75)] border border-d-line bg-d-paper/60 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-d-accent/50">
              <div className="flex items-start gap-3">
                <Avatar name={p.name} size={40} tone={statusTone[p.status]} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14.5px] font-semibold">{p.name}</p>
                  <p className="truncate text-[12.5px] text-d-mute">{p.role}</p>
                </div>
                <Pill tone={statusTone[p.status]}>{p.status}</Pill>
              </div>
              <p className="mt-3 line-clamp-2 text-[13px] leading-snug">{p.focus}</p>
              <div className="mt-3 flex items-center gap-3">
                <Meter value={p.load} tone={p.load > 85 ? "late" : p.load > 65 ? "warn" : "ok"} />
                <span className="tnum font-mono text-[11.5px] text-d-mute">{p.load}%</span>
              </div>
              <p className="mt-2 text-[11.5px] text-d-mute">
                {p.tasks.filter((t) => !t.done).length} open · {p.tasks.filter((t) => t.done).length} done today
              </p>
            </button>
          ))}
        </div>
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Load by person" sub="Above 85% means someone is carrying too much">
          <Bars data={people.map((p) => ({ label: p.name.split(" ")[0], value: p.load, tone: p.load > 85 ? "late" : p.load > 65 ? "warn" : "ok" }))} format={(v) => `${v}%`} height={180} />
        </Panel>
        <Panel title="This week" sub="Attendance, Monday to today">
          <div className="space-y-2">
            {people.slice(0, 7).map((p) => (
              <div key={p.name} className="flex items-center gap-3 text-[12.5px]">
                <span className="w-24 truncate">{p.name.split(" ")[0]}</span>
                <div className="flex flex-1 gap-1">
                  {(p.week ?? [1, 1, 1, 1, 1, 1]).map((d, i) => (
                    <span key={i} className="h-5 flex-1 rounded-[4px]" style={{ background: d ? "var(--d-ok)" : "var(--d-late)", opacity: d ? 0.75 : 0.55 }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <Sheet
        open={!!person}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={person?.role}
        title={person?.name ?? ""}
        sub={person?.focus}
        footer={
          <>
            <Btn variant="outline" icon={Phone} onClick={() => toast(`Calling ${person?.name}`, { description: person?.phone ?? "+91 98xxx xxxxx" })}>
              Call
            </Btn>
            <Btn variant="solid" onClick={() => setOpen(null)}>
              Done
            </Btn>
          </>
        }
      >
        {person && (
          <div className="space-y-5">
            <KV items={[{ k: "Status", v: person.status }, { k: "Load", v: `${person.load}%` }, { k: "Phone", v: person.phone ?? "+91 98xxx xxxxx" }, { k: "With us since", v: person.since ?? "2019" }]} />
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Today</p>
              <ul className="space-y-1.5">
                {person.tasks.map((t) => (
                  <li key={t.title} className="flex items-center gap-2 rounded-lg border border-d-line px-3 py-2">
                    <button type="button" onClick={() => toggleTask(person.name, t.title)} className={cn("flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border", t.done ? "border-d-accent bg-d-accent text-d-accent-ink" : "border-d-line")} aria-label="Toggle task">
                      {t.done && <Check className="h-3 w-3" strokeWidth={3} />}
                    </button>
                    <span className={cn("min-w-0 flex-1 text-[13px]", t.done && "text-d-mute line-through")}>{t.title}</span>
                    <span className="font-mono text-[11px] text-d-mute">{t.due}</span>
                    {!t.done && (
                      <button type="button" onClick={() => reassign(person.name, t.title)} className="text-[11.5px] font-medium text-d-accent hover:underline">
                        Hand off
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- AI Workforce ---------------- */

export function AgentsModule({ agents }: { agents: WorkforceAgent[] }) {
  const desk = useDesk();
  const [list, setList] = React.useState(agents);
  const [running, setRunning] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState<string | null>(null);
  const agent = list.find((a) => a.name === open) ?? null;
  const hours = list.reduce((a, b) => a + b.hoursSaved, 0);
  const runs = list.reduce((a, b) => a + b.runsToday, 0);
  const waiting = list.reduce((a, b) => a + (b.inbox?.length ?? 0), 0);

  function runNow(name: string) {
    setRunning(name);
    window.setTimeout(() => {
      setRunning(null);
      setList((cur) => cur.map((a) => (a.name === name ? { ...a, runsToday: a.runsToday + 1, last: "just now", status: a.status === "Idle" ? "Running" : a.status } : a)));
      const a = list.find((x) => x.name === name);
      toast.success(`${name} finished`, { description: a?.log[0] ?? "Run complete" });
      desk.log(`${name}: ${a?.log[0] ?? "run complete"}`);
    }, 1800);
  }

  function toggle(name: string) {
    setList((cur) => cur.map((a) => (a.name === name ? { ...a, status: a.status === "Idle" ? "Running" : "Idle" } : a)));
  }

  function clearInbox(name: string, title: string, approve: boolean) {
    setList((cur) => cur.map((a) => (a.name === name ? { ...a, inbox: a.inbox?.filter((i) => i.title !== title), status: (a.inbox?.length ?? 0) <= 1 ? "Running" : a.status } : a)));
    toast.success(approve ? "Approved" : "Sent back", { description: title });
    desk.log(`${approve ? "Approved" : "Sent back"}: ${title}`);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Agents working" value={`${list.filter((a) => a.status !== "Idle").length} / ${list.length}`} icon={Zap} hint="always on, never on leave" />
        <Stat label="Runs today" value={runs} delta="+18%" hint="vs last Tuesday" icon={RefreshCw} trend={[12, 18, 15, 22, 26, 24, 31, runs]} />
        <Stat label="Hours saved this week" value={`${hours.toFixed(1)} h`} delta="+4.2 h" icon={Clock} trend={[8, 11, 14, 13, 17, 19, hours]} tone="ok" />
        <Stat label="Waiting on you" value={waiting} hint="approvals in agent inboxes" icon={Sparkles} tone="warn" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((a) => {
          const Icon = a.icon;
          const isRunning = running === a.name;
          return (
            <article key={a.name} className="desk-card desk-rise relative flex flex-col overflow-hidden p-4">
              {isRunning && <span className="desk-shimmer absolute inset-x-0 top-0 h-[3px]" />}
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-d-soft text-d-accent">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold">{a.name}</p>
                  <p className="text-[12.5px] text-d-mute">{a.role}</p>
                </div>
                <Pill tone={a.status === "Running" ? "ok" : a.status === "Needs you" ? "warn" : "neutral"}>
                  {a.status === "Running" && <span className="desk-ping h-1.5 w-1.5 rounded-full bg-d-ok" />}
                  {a.status}
                </Pill>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 rounded-[12px] bg-d-sunk/70 p-2.5 text-center">
                <div>
                  <p className="tnum font-mono text-[16px] font-semibold">{a.runsToday}</p>
                  <p className="text-[11px] text-d-mute">runs today</p>
                </div>
                <div>
                  <p className="tnum font-mono text-[16px] font-semibold">{a.hoursSaved}h</p>
                  <p className="text-[11px] text-d-mute">saved / wk</p>
                </div>
                <div>
                  <p className="tnum font-mono text-[16px] font-semibold">{a.accuracy}%</p>
                  <p className="text-[11px] text-d-mute">accepted</p>
                </div>
              </div>
              <p className="mt-3 text-[12.5px] text-d-mute">
                <span className="font-medium text-d-ink">Last:</span> {a.log[0]} · {a.last}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {a.skills.map((s) => (
                  <span key={s} className="rounded-md bg-d-sunk px-1.5 py-0.5 text-[11px]">
                    {s}
                  </span>
                ))}
              </div>
              {a.inbox && a.inbox.length > 0 && (
                <div className="mt-3 rounded-[12px] border border-d-warn/40 bg-d-warn/5 p-2.5">
                  <p className="text-[11.5px] font-semibold text-d-warn">{a.inbox.length} waiting on you</p>
                  <p className="mt-0.5 truncate text-[12.5px]">{a.inbox[0].title}</p>
                </div>
              )}
              <div className="mt-auto flex items-center gap-2 pt-4">
                <Btn size="sm" variant="solid" icon={isRunning ? Loader2 : Zap} disabled={isRunning} onClick={() => runNow(a.name)} className={isRunning ? "[&_svg]:animate-spin" : ""}>
                  {isRunning ? "Running" : "Run now"}
                </Btn>
                <Btn size="sm" variant="outline" onClick={() => setOpen(a.name)}>
                  Open
                </Btn>
                <button type="button" onClick={() => toggle(a.name)} aria-label={a.status === "Idle" ? "Switch on" : "Pause"} className={cn("ml-auto flex h-8 w-8 items-center justify-center rounded-full border", a.status === "Idle" ? "border-d-line text-d-mute" : "border-d-ok/40 bg-d-ok/10 text-d-ok")}>
                  <Power className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
      <Sheet open={!!agent} onOpenChange={(o) => !o && setOpen(null)} eyebrow="AI agent" title={agent?.name ?? ""} sub={agent?.role}>
        {agent && (
          <div className="space-y-5">
            <KV items={[{ k: "Schedule", v: agent.schedule }, { k: "Accepted", v: `${agent.accuracy}% of suggestions` }, { k: "Runs today", v: agent.runsToday }, { k: "Hours saved", v: `${agent.hoursSaved} h this week` }]} />
            {agent.inbox && agent.inbox.length > 0 && (
              <div>
                <p className="mb-2 text-[12px] font-medium text-d-mute">Waiting on you</p>
                <ul className="space-y-2">
                  {agent.inbox.map((i) => (
                    <li key={i.title} className="rounded-[12px] border border-d-line p-3">
                      <p className="text-[13.5px] font-medium">{i.title}</p>
                      <p className="mt-0.5 text-[12.5px] text-d-mute">{i.detail}</p>
                      <div className="mt-2 flex gap-2">
                        <Btn size="sm" variant="solid" onClick={() => clearInbox(agent.name, i.title, true)}>
                          Approve
                        </Btn>
                        <Btn size="sm" variant="outline" onClick={() => clearInbox(agent.name, i.title, false)}>
                          Send back
                        </Btn>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Run log</p>
              <ol className="space-y-2 border-l border-d-line pl-4">
                {agent.log.map((l, i) => (
                  <li key={l} className="relative text-[13px]">
                    <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-d-accent" />
                    <span className="font-mono text-[11px] text-d-mute">{i === 0 ? agent.last : `${(i + 1) * 23} min ago`}</span>
                    <p>{l}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Owner Independence ---------------- */

function band(score: number) {
  if (score < 35) return { name: "Hands-on", tone: "late" as const, line: "Most decisions still wait for you." };
  if (score < 60) return { name: "Stretched", tone: "warn" as const, line: "The team runs the day; you run the exceptions, and there are many." };
  if (score < 80) return { name: "Delegating", tone: "info" as const, line: "Systems and people carry most days without you." };
  return { name: "Independent", tone: "ok" as const, line: "You decide where your week goes." };
}

export function IndependenceModule({ data }: { data: IndependenceData }) {
  const desk = useDesk();
  const [done, setDone] = React.useState<Set<string>>(new Set());
  const gain = data.pillars.reduce((acc, p) => acc + p.fixes.filter((f) => done.has(f.title)).reduce((a, f) => a + f.gain, 0), 0);
  const score = Math.min(100, data.score + gain);
  const b = band(score);
  const totalHours = data.ownerHours.reduce((a, h) => a + h.hours, 0);

  function toggle(title: string, g: number) {
    setDone((cur) => {
      const next = new Set(cur);
      if (next.has(title)) next.delete(title);
      else {
        next.add(title);
        toast.success(`+${g} points`, { description: title });
        desk.log(`Independence plan: ${title} (+${g})`);
      }
      return next;
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid items-start gap-5 xl:grid-cols-[1fr_1.35fr]">
        <Panel title="Owner Independence Index" sub="How many of this week's decisions could have happened without you">
          <div className="flex flex-col items-center py-2">
            <Gauge value={score} tone={b.tone} label={`out of 100 · ${b.name}`} />
            <p className="mt-4 text-center text-[14px]">{b.line}</p>
            {gain > 0 && <p className="desk-rise mt-1 font-mono text-[12px] text-d-ok">+{gain} from the plan you just ticked</p>}
            <div className="mt-5 grid w-full grid-cols-4 gap-1 text-center text-[11px]">
              {["Hands-on", "Stretched", "Delegating", "Independent"].map((n, i) => (
                <div key={n}>
                  <div className="h-1.5 rounded-full" style={{ background: ["var(--d-late)", "var(--d-warn)", "var(--d-info)", "var(--d-ok)"][i], opacity: b.name === n ? 1 : 0.3 }} />
                  <p className={cn("mt-1", b.name === n ? "font-semibold" : "text-d-mute")}>{n}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 border-t border-d-line pt-4">
            <p className="mb-1 text-[12px] text-d-mute">Last 8 weeks</p>
            <Sparkline data={[...data.history, score]} tone={b.tone} height={48} />
          </div>
          <blockquote className="mt-4 border-l-2 border-d-accent pl-3 font-serif text-[15px] italic leading-snug">“{data.quote}”</blockquote>
        </Panel>
        <Panel title="Where the owner is still the bottleneck" sub="Pick a fix to see what it does to the index">
          <div className="space-y-4">
            {data.pillars.map((p) => {
              const g = p.fixes.filter((f) => done.has(f.title)).reduce((a, f) => a + f.gain, 0);
              const s = Math.min(100, p.score + g * 3);
              return (
                <div key={p.name} className="rounded-[12px] border border-d-line p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[14px] font-semibold">{p.name}</p>
                    <span className="tnum font-mono text-[13px] font-semibold" style={{ color: s < 35 ? "var(--d-late)" : s < 60 ? "var(--d-warn)" : "var(--d-ok)" }}>
                      {s}
                    </span>
                  </div>
                  <Meter value={s} tone={s < 35 ? "late" : s < 60 ? "warn" : "ok"} className="mt-2" />
                  <p className="mt-2 text-[12.5px] text-d-mute">{p.note}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {p.fixes.map((f) => {
                      const on = done.has(f.title);
                      return (
                        <button
                          key={f.title}
                          type="button"
                          onClick={() => toggle(f.title, f.gain)}
                          className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] transition-colors", on ? "border-d-ok bg-d-ok/10 text-d-ok" : "border-d-line hover:border-d-accent")}
                        >
                          {on ? <Check className="h-3 w-3" /> : <span className="font-mono text-[10.5px] text-d-mute">+{f.gain}</span>}
                          {f.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
      <Panel title="Where the owner's week goes" sub={`${totalHours} hours logged last week. The tall bars are the ones to hand off.`}>
        <Bars data={data.ownerHours.map((h) => ({ label: h.label, value: h.hours, tone: h.hours >= 10 ? "late" : h.hours >= 6 ? "warn" : "ok" }))} format={(v) => `${v}h`} height={190} />
      </Panel>
    </div>
  );
}

/* ---------------- Integrations ---------------- */

export function ConnectionsModule({ items }: { items: Integration[] }) {
  const desk = useDesk();
  const [list, setList] = React.useState(items);
  const [busy, setBusy] = React.useState<string | null>(null);
  const cats = ["All", ...Array.from(new Set(items.map((i) => i.category)))];
  const [cat, setCat] = React.useState("All");
  const shown = list.filter((i) => cat === "All" || i.category === cat);
  const connected = list.filter((i) => i.status === "Connected" || i.status === "Syncing").length;

  function act(name: string) {
    const item = list.find((i) => i.name === name);
    if (!item) return;
    setBusy(name);
    window.setTimeout(() => {
      setBusy(null);
      setList((cur) => cur.map((i) => (i.name === name ? { ...i, status: "Connected", synced: "just now" } : i)));
      const verb = item.status === "Available" ? "Connected" : item.status === "Error" ? "Reconnected" : "Synced";
      toast.success(`${verb} ${name}`, { description: item.detail });
      desk.log(`${name} ${verb.toLowerCase()}`);
    }, 1400);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Connected" value={`${connected} / ${list.length}`} icon={Plug} hint="sources feeding this desk" />
        <Stat label="Records synced today" value="18,420" delta="+6%" icon={RefreshCw} trend={[9, 12, 11, 14, 15, 16, 18]} />
        <Stat label="Typing saved" value="6.4 h" hint="no re-entry from Tally, WhatsApp, sheets" icon={Clock} tone="ok" />
        <Stat label="Needs attention" value={list.filter((i) => i.status === "Error").length} hint="tokens expired or paused" icon={Zap} tone="late" />
      </div>
      <Panel title="Connected tools" sub="Your data stays in your own accounts. BuildBiz reads from them; it does not keep copies." action={<Segmented size="sm" options={cats} value={cat} onChange={setCat} />}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((i) => (
            <div key={i.name} className="desk-rise flex flex-col rounded-[calc(var(--d-radius,18px)*0.75)] border border-d-line bg-d-paper/50 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] font-mono text-[13px] font-bold text-white" style={{ background: i.color }}>
                  {i.mark}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14.5px] font-semibold">{i.name}</p>
                  <p className="text-[12px] text-d-mute">{i.category}</p>
                </div>
                <Pill tone={i.status === "Connected" ? "ok" : i.status === "Syncing" ? "info" : i.status === "Error" ? "late" : "neutral"}>
                  {i.status === "Syncing" && <Loader2 className="h-3 w-3 animate-spin" />}
                  {i.status}
                </Pill>
              </div>
              <p className="mt-3 text-[13px] leading-snug">{i.detail}</p>
              <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                <p className="font-mono text-[11px] text-d-mute">
                  {i.status === "Available" ? "Not connected" : `${i.records} · ${i.synced}`}
                </p>
                <Btn size="sm" variant={i.status === "Available" || i.status === "Error" ? "solid" : "outline"} icon={busy === i.name ? Loader2 : i.status === "Available" ? Plug : RefreshCw} disabled={busy === i.name} onClick={() => act(i.name)} className={busy === i.name ? "[&_svg]:animate-spin" : ""}>
                  {i.status === "Available" ? "Connect" : i.status === "Error" ? "Reconnect" : "Sync"}
                </Btn>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
