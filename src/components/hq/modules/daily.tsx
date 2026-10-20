"use client";

import * as React from "react";
import { cn } from "cn";
import { toast } from "sonner";
import { BellRing, Check, CheckCircle2, Flame, Lock, Pencil, PhoneCall, Send, Sparkles, Timer, Wand2 } from "lucide-react";
import { AgentNote, AIMark, Btn, Field, inputClass, Meter, PageHeader, Panel, PersonAvatar, Pill, rupees, SectionLabel } from "../kit";
import { useHQ } from "../store";
import { personById, revenueDaily, team } from "../data";
import type { Person, Role } from "../types";
import type { Tone } from "../../desk/types";

/* ---------------- config ---------------- */

type NumField = { key: string; label: string; unit?: "₹" | "%"; hint?: string };

const FIELDS: Record<Role, NumField[]> = {
  sales: [
    { key: "dialled", label: "Calls dialled" },
    { key: "connected", label: "Connected" },
    { key: "booked", label: "Consults booked" },
    { key: "closes", label: "Closes" },
    { key: "revenue", label: "Revenue booked", unit: "₹" },
    { key: "followups", label: "Follow-ups pending", hint: "for tomorrow" },
  ],
  delivery: [
    { key: "students", label: "Students touched" },
    { key: "sessions", label: "Sessions / calls run" },
    { key: "tickets", label: "Tickets closed" },
    { key: "builds", label: "Build items shipped" },
    { key: "atrisk", label: "At-risk nudged" },
    { key: "nps", label: "Session rating", hint: "avg of 5" },
  ],
  ops: [
    { key: "tasks", label: "Tasks closed" },
    { key: "spend", label: "Ad spend", unit: "₹" },
    { key: "cpl", label: "Cost per lead", unit: "₹" },
    { key: "regs", label: "Registrations" },
    { key: "recon", label: "Payments reconciled" },
    { key: "vendors", label: "Vendor items cleared" },
  ],
  founder: [
    { key: "collected", label: "Collected today", unit: "₹" },
    { key: "prospects", label: "Prospect calls" },
    { key: "oneones", label: "Team 1:1s" },
    { key: "decisions", label: "Decisions made" },
    { key: "content", label: "Content recorded", hint: "minutes" },
    { key: "approvals", label: "Approvals cleared" },
  ],
};

const MOODS = [
  { v: 1, label: "Drained" },
  { v: 2, label: "Low" },
  { v: 3, label: "Steady" },
  { v: 4, label: "Good" },
  { v: 5, label: "Flying" },
];

const COMMON_BLOCKERS = ["Waiting on client inputs", "Zoom seats running out", "Leads not picking up", "Payment link failing", "Need Amit's approval", "Too many internal meetings"];

type Status = { state: "submitted" | "drafting" | "pending"; at?: string; nudged?: boolean };
const SEED_STATUS: Record<string, Status> = {
  aditya: { state: "submitted", at: "6:31 PM" },
  sneha: { state: "submitted", at: "6:58 PM" },
  imran: { state: "submitted", at: "7:05 PM" },
  neha: { state: "submitted", at: "7:12 PM" },
  meera: { state: "submitted", at: "7:20 PM" },
  vikram: { state: "submitted", at: "7:41 PM" },
  rohan: { state: "drafting" },
  priya: { state: "drafting" },
  arjun: { state: "pending" },
  kavya: { state: "pending" },
  sahil: { state: "pending" },
  amit: { state: "pending" },
};

function h(n: number, salt = 3) {
  let t = Math.imul(n + 17, 0x9e3779b1) ^ Math.imul(salt + 7, 0x85ebca6b);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const pIndex = (id: string) => Math.max(0, team.findIndex((p) => p.id === id));

/** last 35 days of filing for a person, oldest first; last cell is today (unknown) */
function history(id: string) {
  const n = pIndex(id);
  const reliability = id === "kavya" ? 0.62 : id === "sahil" ? 0.74 : 0.9;
  return Array.from({ length: 29 }, (_, d) => {
    const dow = d % 7; // grid starts on a Monday; 6 = Sunday
    if (dow === 6 || d === 11) return "off" as const; // Sundays and Gandhi Jayanti (Fri 2 Oct)
    // keep the last stretch unbroken so streaks look earned
    if (d > 29 - (8 + (n % 5) * 3)) return "on" as const;
    const r = h(n * 50 + d, 81);
    return r < reliability - 0.12 ? ("on" as const) : r < reliability ? ("late" as const) : ("miss" as const);
  });
}
function streakOf(cells: ReturnType<typeof history>) {
  let s = 0;
  for (let i = cells.length - 1; i >= 0; i--) {
    if (cells[i] === "off") continue;
    if (cells[i] === "miss") break;
    s += 1;
  }
  return s;
}
function bestStreak(cells: ReturnType<typeof history>) {
  let best = 0;
  let cur = 0;
  for (const c of cells) {
    if (c === "off") continue;
    if (c === "miss") cur = 0;
    else cur += 1;
    best = Math.max(best, cur);
  }
  return best;
}

function stamp() {
  return new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });
}

type Draft = { wins: string; blockers: string; plan: string; nums: Record<string, string>; mood: number; energy: number };
const empty = (): Draft => ({ wins: "", blockers: "", plan: "", nums: {}, mood: 0, energy: 6 });

/* ---------------- module ---------------- */

export default function DailyReporting() {
  const hq = useHQ();
  const [asId, setAsId] = React.useState<string | null>(null);
  const person: Person = personById[asId ?? hq.me.id] ?? hq.me;
  const role = person.role;
  const [drafts, setDrafts] = React.useState<Record<string, Draft>>({});
  const d = drafts[person.id] ?? empty();
  const [aiFields, setAiFields] = React.useState<Set<string>>(new Set());
  const [drafting, setDrafting] = React.useState<{ step: number } | null>(null);
  const [sources, setSources] = React.useState<{ activity: number; tasks: number; calls: number } | null>(null);
  const [statuses, setStatuses] = React.useState<Record<string, Status>>(SEED_STATUS);
  const [submitted, setSubmitted] = React.useState<Record<string, { at: string; points: number }>>({});
  const [editing, setEditing] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const timers = React.useRef<number[]>([]);

  React.useEffect(() => {
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  React.useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const set = (patch: Partial<Draft>, fromUser = true) => {
    setDrafts((cur) => ({ ...cur, [person.id]: { ...(cur[person.id] ?? empty()), ...patch } }));
    if (fromUser) setAiFields((s) => {
      const next = new Set(s);
      Object.keys(patch).forEach((k) => next.delete(k));
      return next;
    });
  };
  const setNum = (key: string, v: string) => set({ nums: { ...d.nums, [key]: v.replace(/[^\d.]/g, "") } }, false);

  const cells = history(person.id);
  const done = submitted[person.id];
  const streak = streakOf(cells) + (done ? 1 : 0);
  const best = Math.max(bestStreak(cells), streak);
  const filed = cells.filter((c) => c === "on" || c === "late").length;
  const workdays = cells.filter((c) => c !== "off").length;

  const teamStatus = team.map((p) => {
    if (submitted[p.id]) return { p, s: { state: "submitted", at: submitted[p.id].at } as Status };
    const seeded = statuses[p.id] ?? { state: "pending" };
    if (p.id === person.id) return { p, s: { ...seeded, state: d.wins || d.plan ? "drafting" : seeded.state === "submitted" ? "pending" : seeded.state } as Status };
    return { p, s: seeded };
  });
  const nSubmitted = teamStatus.filter((x) => x.s.state === "submitted").length;
  const pending = teamStatus.filter((x) => x.s.state !== "submitted" && x.p.id !== person.id);

  /* AI draft from activity */
  function aiDraft() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setDrafting({ step: 0 });
    [1, 2, 3].forEach((s) => timers.current.push(window.setTimeout(() => setDrafting({ step: s }), s * 380)));
    timers.current.push(
      window.setTimeout(() => {
        const mineActivity = hq.activity.filter((a) => a.who === person.id);
        const doneTasks = hq.tasks.filter((t) => t.owner === person.id && t.status === "Done");
        const openTasks = hq.tasks.filter((t) => t.owner === person.id && t.status !== "Done");
        const calls = hq.leads.flatMap((l) => l.calls.filter((c) => c.by === person.id).map((c) => ({ ...c, lead: l })));
        const connected = calls.filter((c) => c.outcome === "Connected" || c.outcome === "Booked").length;
        const booked = calls.filter((c) => c.outcome === "Booked").length;
        const closesFromActivity = mineActivity.filter((a) => /closed/i.test(a.text)).length;
        const won = hq.leads.filter((l) => l.owner === person.id && l.stage === "Won");
        const n = pIndex(person.id);

        const winLines = [
          ...mineActivity.slice(0, 3).map((a) => a.text.charAt(0).toUpperCase() + a.text.slice(1)),
          ...doneTasks.slice(0, 2).map((t) => `Closed task: ${t.title}`),
        ];
        if (role === "sales" && booked) winLines.push(`Booked ${booked} consults; best one ${calls.find((c) => c.outcome === "Booked")?.lead.name} (${calls.find((c) => c.outcome === "Booked")?.lead.company})`);
        if (role === "delivery") winLines.push("Batch 14 blueprint pack opened by 812 of 1,240 attendees");
        if (role === "ops" && person.id === "meera") winLines.push("Owner-story creative held CPL at ₹38 after the budget scale-up");
        if (role === "founder") winLines.push("Batch 14 day-2 pitch converted 3.1% to programs, best yet. Team ne kamaal kar diya");
        if (!winLines.length) winLines.push("Cleared the morning queue before 11 AM");

        const blockerLines = [
          ...openTasks.filter((t) => t.dueIn < 0).slice(0, 2).map((t) => `${t.title} is ${-t.dueIn}d overdue`),
          ...(role === "sales" ? [`${hq.leads.filter((l) => l.owner === person.id && l.followUpIn < 0 && l.stage !== "Won" && l.stage !== "Lost").length} CRM follow-ups slipped past their slot`] : []),
          ...(person.id === "vikram" || person.id === "neha" ? ["Spice Route still hasn't shared Swiggy API keys"] : []),
        ];

        const planLines = openTasks
          .filter((t) => t.dueIn <= 1)
          .sort((a, b) => a.priority.localeCompare(b.priority))
          .slice(0, 4)
          .map((t) => `${t.priority} · ${t.title}`);
        if (!planLines.length) planLines.push(...openTasks.slice(0, 3).map((t) => `${t.priority} · ${t.title}`));

        const nums: Record<string, string> = {};
        if (role === "sales") {
          Object.assign(nums, {
            dialled: String(calls.length + 34 + Math.round(h(n, 3) * 14)),
            connected: String(connected + 13 + Math.round(h(n, 4) * 6)),
            booked: String(booked + 3),
            closes: String(closesFromActivity + Math.round(h(n, 5) * 1)),
            revenue: String(closesFromActivity ? 74999 : won.length ? won[0].value : 24999),
            followups: String(hq.leads.filter((l) => l.owner === person.id && l.stage !== "Won" && l.stage !== "Lost").length),
          });
        } else if (role === "delivery") {
          Object.assign(nums, { students: String(18 + Math.round(h(n, 3) * 30)), sessions: String(2 + Math.round(h(n, 4) * 4)), tickets: String(5 + Math.round(h(n, 5) * 9)), builds: String(doneTasks.length + 2), atrisk: String(person.id === "priya" ? 18 : 4), nps: "4.7" });
        } else if (role === "ops") {
          Object.assign(nums, { tasks: String(doneTasks.length + 3), spend: "43800", cpl: "38", regs: "1152", recon: String(person.id === "sahil" ? 46 : 11), vendors: String(2 + Math.round(h(n, 6) * 3)) });
        } else {
          Object.assign(nums, { collected: String(revenueDaily[revenueDaily.length - 1]), prospects: "4", oneones: "3", decisions: "6", content: "35", approvals: "9" });
        }

        set({ wins: winLines.map((l) => `• ${l}`).join("\n"), blockers: blockerLines.filter(Boolean).map((l) => `• ${l}`).join("\n"), plan: planLines.map((l) => `• ${l}`).join("\n"), nums, mood: d.mood || 4, energy: 7 }, false);
        setAiFields(new Set(["wins", "blockers", "plan", "nums"]));
        setSources({ activity: mineActivity.length, tasks: doneTasks.length + openTasks.length, calls: calls.length });
        setDrafting(null);
        toast("Draft ready", { description: "Read it, fix anything wrong, then submit." });
      }, 1550),
    );
  }

  function submit() {
    if (!d.wins.trim() || !d.plan.trim() || !d.mood) {
      toast.error("Almost there", { description: !d.mood ? "Pick how today felt." : "Wins and tomorrow's plan are required." });
      return;
    }
    const at = stamp();
    const points = 15 + (streak + 1 >= 5 ? 5 : 0) + (elapsed <= 180 ? 5 : 0);
    setSubmitted((cur) => ({ ...cur, [person.id]: { at, points } }));
    setStatuses((cur) => ({ ...cur, [person.id]: { state: "submitted", at } }));
    setEditing(false);
    hq.log(`submitted today's daily report (+${points} pts)`, "ok");
    if (person.id !== "amit") hq.notify({ kind: "task", title: `${person.first} filed the daily report`, body: d.wins.split("\n")[0]?.replace(/^• /, "") ?? "", href: "/hq/history" }, { toast: false });
    toast.success(`Report filed · +${points} points`, { description: `${editing ? "Updated. " : ""}Streak now ${streak + 1} days. ${person.id === "amit" ? "Shared with the team." : "Amit has been notified."}` });
  }

  function nudge(ids: string[]) {
    setStatuses((cur) => {
      const next = { ...cur };
      ids.forEach((id) => (next[id] = { ...(next[id] ?? { state: "pending" }), nudged: true }));
      return next;
    });
    ids.forEach((id) => hq.notify({ kind: "task", title: `Reminder from ${hq.me.first}: daily report`, body: `${personById[id].first}, today's report is due by 9 PM. The AI draft takes 30 seconds.`, href: "/hq/daily" }, { toast: false }));
    hq.log(`nudged ${ids.map((id) => personById[id].first).join(", ")} to file the daily report`, "warn");
    toast(`Nudged ${ids.length === 1 ? personById[ids[0]].first : `${ids.length} people`}`, { description: "On HQ and WhatsApp" });
  }

  const locked = !!done && !editing;
  const mm = Math.floor(elapsed / 60);
  const ss = String(elapsed % 60).padStart(2, "0");
  const fields = FIELDS[role];
  const draftSteps = ["Reading your activity feed", "Pulling tasks closed and due", role === "sales" ? "Counting today's call logs" : "Matching numbers to your role", "Writing the draft"];

  return (
    <div>
      <PageHeader
        kicker="Operations"
        title="Daily Reporting"
        sub={`Tuesday, 20 October · due by 9:00 PM. ${nSubmitted} of ${team.length} filed so far.`}
        actions={
          <>
            <label className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-d-line bg-d-panel pl-2 pr-1 text-[13px]">
              <PersonAvatar id={person.id} size={22} />
              <select value={person.id} onChange={(e) => { setAsId(e.target.value); setSources(null); setAiFields(new Set()); setEditing(false); }} className="h-full cursor-pointer bg-transparent pr-1 font-medium outline-none">
                {team.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id === hq.me.id ? `${p.first} (you)` : p.first} · {p.title}
                  </option>
                ))}
              </select>
            </label>
            <Btn icon={Wand2} onClick={aiDraft} disabled={!!drafting || locked}>
              AI draft from my activity
            </Btn>
            <Btn variant="solid" icon={Send} onClick={submit} disabled={locked}>
              {editing ? "Update report" : "Submit"}
            </Btn>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        {/* ---------- form ---------- */}
        <div className="min-w-0 space-y-4">
          {done && !editing ? (
            <Panel>
              <div className="flex flex-wrap items-start gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--d-ok)_14%,var(--d-panel))] text-d-ok">
                  <CheckCircle2 className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-[24px] leading-tight">Filed at {done.at}</p>
                  <p className="mt-1 text-[13.5px] text-d-mute">
                    +{done.points} points · streak {streak} days · {person.id === "amit" ? "visible to the team in Report History" : "Amit has it in his inbox"}
                  </p>
                </div>
                <Btn icon={Pencil} onClick={() => setEditing(true)}>
                  Edit report
                </Btn>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {[
                  { k: "Wins", v: d.wins },
                  { k: "Blockers", v: d.blockers || "None" },
                  { k: "Tomorrow", v: d.plan },
                ].map((b) => (
                  <div key={b.k} className="rounded-[12px] bg-d-sunk/70 p-3">
                    <SectionLabel className="mb-1.5">{b.k}</SectionLabel>
                    <p className="whitespace-pre-line text-[13px] leading-relaxed">{b.v}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
                {fields.map((f) => (
                  <div key={f.key}>
                    <p className="text-[11px] text-d-mute">{f.label}</p>
                    <p className="tnum font-serif text-[20px]">{f.unit === "₹" ? rupees(Number(d.nums[f.key] || 0)) : d.nums[f.key] || "–"}</p>
                  </div>
                ))}
              </div>
            </Panel>
          ) : (
            <>
              {drafting && (
                <AgentNote title="Drafting from your day…">
                  <ul className="mt-1 space-y-1">
                    {draftSteps.map((s, i) => (
                      <li key={s} className={cn("flex items-center gap-2 text-[12.5px]", i > drafting.step && "opacity-35")}>
                        {i < drafting.step ? <Check className="h-3.5 w-3.5 text-d-ok" /> : <span className={cn("h-3 w-3 rounded-full border-2 border-[var(--d-gold)]", i === drafting.step && "animate-spin border-t-transparent")} />}
                        {s}
                      </li>
                    ))}
                  </ul>
                </AgentNote>
              )}
              {sources && !drafting && (
                <AgentNote title="Drafted from your activity. Edit anything; it's yours." action={<Btn size="sm" variant="ghost" onClick={aiDraft}>Redraft</Btn>}>
                  Used {sources.activity} activity item{sources.activity === 1 ? "" : "s"}, {sources.tasks} of your tasks{role === "sales" ? ` and ${sources.calls} call logs from the CRM` : ""}. Numbers marked <AIMark className="mx-0.5" /> came from systems, not memory.
                </AgentNote>
              )}

              <Panel
                title={`${person.first}'s numbers`}
                sub={role === "sales" ? "From the dialler and CRM" : role === "delivery" ? "Students, sessions and builds" : role === "founder" ? "The founder's day" : "Marketing, finance and ops"}
                action={aiFields.has("nums") ? <AIMark label="From systems" /> : <Pill>{role}</Pill>}
              >
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {fields.map((f) => (
                    <Field key={f.key} label={f.hint ? `${f.label} · ${f.hint}` : f.label}>
                      <div className="relative">
                        {f.unit === "₹" && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-d-mute">₹</span>}
                        <input
                          inputMode="decimal"
                          value={d.nums[f.key] ?? ""}
                          onChange={(e) => setNum(f.key, e.target.value)}
                          placeholder="0"
                          className={cn(inputClass, "tnum font-mono", f.unit === "₹" && "pl-7", aiFields.has("nums") && d.nums[f.key] && "border-[color-mix(in_oklab,var(--d-gold)_45%,var(--d-line))] bg-[color-mix(in_oklab,var(--d-gold)_5%,var(--d-panel))]")}
                        />
                      </div>
                    </Field>
                  ))}
                </div>
                {role === "sales" && Number(d.nums.dialled) > 0 && (
                  <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11.5px] text-d-mute">
                    <span>
                      <PhoneCall className="mr-1 inline h-3 w-3" />
                      connect {Math.round((Number(d.nums.connected || 0) / Number(d.nums.dialled)) * 100)}%
                    </span>
                    <span>book {Math.round((Number(d.nums.booked || 0) / Math.max(1, Number(d.nums.connected || 0))) * 100)}% of connects</span>
                    <span>team avg connect 42%</span>
                  </p>
                )}
              </Panel>

              <Panel title="Wins" sub="What moved today. One line each." action={aiFields.has("wins") && <AIMark label="Drafted" />}>
                <textarea rows={4} value={d.wins} onChange={(e) => set({ wins: e.target.value })} placeholder="• Closed Sunita Bansal on the Accelerator, ₹74,999" className={cn(inputClass, "h-auto py-2.5 leading-relaxed")} />
              </Panel>

              <div className="grid gap-4 lg:grid-cols-2">
                <Panel title="Blockers" sub="What is stuck, and on whom" action={aiFields.has("blockers") && <AIMark label="Drafted" />}>
                  <textarea rows={4} value={d.blockers} onChange={(e) => set({ blockers: e.target.value })} placeholder="• Waiting on client inputs" className={cn(inputClass, "h-auto py-2.5 leading-relaxed")} />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {COMMON_BLOCKERS.map((b) => (
                      <button key={b} type="button" onClick={() => set({ blockers: d.blockers.includes(b) ? d.blockers : `${d.blockers ? `${d.blockers}\n` : ""}• ${b}` })} className="rounded-full border border-d-line px-2 py-0.5 text-[11.5px] text-d-mute hover:border-d-accent hover:text-d-ink">
                        + {b}
                      </button>
                    ))}
                  </div>
                </Panel>
                <Panel
                  title="Tomorrow's plan"
                  sub="The 3 to 4 things you will finish"
                  action={
                    aiFields.has("plan") ? (
                      <AIMark label="From your tasks" />
                    ) : (
                      <Btn
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const lines = hq.tasks.filter((t) => t.owner === person.id && t.status !== "Done").sort((a, b) => a.dueIn - b.dueIn).slice(0, 4).map((t) => `• ${t.priority} · ${t.title}`);
                          set({ plan: lines.join("\n") || "• " }, false);
                          setAiFields((s) => new Set(s).add("plan"));
                        }}
                      >
                        Pull from my tasks
                      </Btn>
                    )
                  }
                >
                  <textarea rows={4} value={d.plan} onChange={(e) => set({ plan: e.target.value })} placeholder="• P0 · Call back the 9 hot leads" className={cn(inputClass, "h-auto py-2.5 leading-relaxed")} />
                </Panel>
              </div>

              <Panel title="How did today feel?" sub="Private to you and Amit. Patterns, not judgement.">
                <div className="grid gap-5 md:grid-cols-[1.3fr_1fr]">
                  <div>
                    <SectionLabel>Mood</SectionLabel>
                    <div className="grid grid-cols-5 gap-1.5">
                      {MOODS.map((m) => (
                        <button
                          key={m.v}
                          type="button"
                          onClick={() => set({ mood: m.v })}
                          className={cn("rounded-[10px] border px-2 py-2.5 text-center transition-colors", d.mood === m.v ? "border-d-accent bg-d-soft" : "border-d-line hover:bg-d-sunk")}
                        >
                          <MoodFace v={m.v} on={d.mood === m.v} />
                          <span className="mt-1 block text-[11.5px] font-medium">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <SectionLabel action={<span className="font-mono text-[12px]">{d.energy}/10</span>}>Energy</SectionLabel>
                    <input type="range" min={1} max={10} value={d.energy} onChange={(e) => set({ energy: Number(e.target.value) })} className="mt-3 w-full accent-[var(--d-accent)]" />
                    <div className="mt-1 flex justify-between text-[11px] text-d-mute">
                      <span>Running on fumes</span>
                      <span>Full tank</span>
                    </div>
                  </div>
                </div>
              </Panel>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-d-line bg-d-panel px-4 py-3">
                <span className="inline-flex items-center gap-2 text-[12.5px] text-d-mute">
                  <Timer className="h-4 w-4" />
                  <span className={cn("tnum font-mono", elapsed > 120 ? "text-d-warn" : "text-d-ink")}>
                    {mm}:{ss}
                  </span>
                  on this report · two-minute target · +5 bonus under three
                </span>
                <div className="flex gap-2">
                  {editing && <Btn onClick={() => setEditing(false)}>Cancel</Btn>}
                  <Btn variant="solid" icon={Send} onClick={submit}>
                    {editing ? "Update report" : "Submit report"}
                  </Btn>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ---------- side ---------- */}
        <div className="min-w-0 space-y-4">
          <Panel title="My streak" icon={Flame} sub={`${person.first} · last 5 weeks`}>
            <div className="flex items-end gap-5">
              <div>
                <p className="tnum font-serif text-[52px] leading-none">{streak}</p>
                <p className="mt-1 text-[12px] text-d-mute">working days in a row</p>
              </div>
              <div className="ml-auto grid grid-cols-2 gap-x-5 gap-y-1 text-right">
                <span className="text-[11px] text-d-mute">Best</span>
                <span className="font-mono text-[13px] font-semibold">{best}d</span>
                <span className="text-[11px] text-d-mute">Filed</span>
                <span className="font-mono text-[13px] font-semibold">
                  {filed + (done ? 1 : 0)}/{workdays + 1}
                </span>
                <span className="text-[11px] text-d-mute">On time</span>
                <span className="font-mono text-[13px] font-semibold">{Math.round((cells.filter((c) => c === "on").length / workdays) * 100)}%</span>
              </div>
            </div>
            <div className="mt-4 mx-auto grid max-w-[300px] grid-cols-7 gap-1">
              {["M", "T", "W", "T", "F", "S", "S"].map((l, i) => (
                <span key={`${l}-${i}`} className="text-center text-[10px] text-d-mute">
                  {l}
                </span>
              ))}
              {[...cells, done ? ("on" as const) : ("today" as const), ...Array.from({ length: 5 }, () => "future" as const)].map((c, i) => (
                <span
                  key={i}
                  title={c}
                  className={cn("aspect-square rounded-[5px]", c === "today" && "ring-2 ring-inset ring-d-accent", c === "future" && "opacity-40")}
                  style={{
                    background:
                      c === "on" ? "var(--d-ok)" : c === "late" ? "color-mix(in oklab, var(--d-ok) 45%, var(--d-panel))" : c === "miss" ? "color-mix(in oklab, var(--d-late) 70%, var(--d-panel))" : c === "off" ? "transparent" : "var(--d-sunk)",
                    boxShadow: c === "off" ? "inset 0 0 0 1px var(--d-line)" : undefined,
                  }}
                />
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-d-mute">
              <Legend color="var(--d-ok)">On time</Legend>
              <Legend color="color-mix(in oklab, var(--d-ok) 45%, var(--d-panel))">Late</Legend>
              <Legend color="color-mix(in oklab, var(--d-late) 70%, var(--d-panel))">Missed</Legend>
            </div>
            {streak >= 4 && !done && <p className="mt-3 rounded-[10px] bg-d-sunk px-3 py-2 text-[12px]">File today to hit {streak + 1} days. Streaks of 5+ earn a +5 bonus each day.</p>}
          </Panel>

          <Panel
            title="Team today"
            sub={`${nSubmitted} of ${team.length} filed`}
            action={
              pending.length > 0 && (
                <Btn size="sm" icon={BellRing} onClick={() => nudge(pending.filter((x) => !x.s.nudged).map((x) => x.p.id))} disabled={pending.every((x) => x.s.nudged)}>
                  Nudge all
                </Btn>
              )
            }
          >
            <Meter value={nSubmitted} max={team.length} tone={nSubmitted / team.length > 0.8 ? "ok" : "accent"} />
            <ul className="mt-3 divide-y divide-d-line">
              {[...teamStatus]
                .sort((a, b) => rank(a.s.state) - rank(b.s.state))
                .map(({ p, s }) => (
                  <li key={p.id} className="flex items-center gap-2.5 py-2">
                    <PersonAvatar id={p.id} size={26} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium">
                        {p.first}
                        {p.id === person.id && <span className="text-d-mute"> (filing)</span>}
                      </span>
                      <span className="block truncate text-[11.5px] text-d-mute">{p.title}</span>
                    </span>
                    {s.state === "submitted" ? (
                      <Pill tone="ok" mono>
                        <Check className="h-3 w-3" /> {s.at}
                      </Pill>
                    ) : s.nudged ? (
                      <Pill tone="info">Nudged</Pill>
                    ) : (
                      <>
                        <Pill tone={stateTone(s.state)}>{s.state === "drafting" ? "Drafting" : "Pending"}</Pill>
                        {p.id !== person.id && (
                          <button type="button" onClick={() => nudge([p.id])} className="rounded-md px-1.5 py-1 text-[11.5px] font-medium text-d-accent hover:bg-d-soft">
                            Nudge
                          </button>
                        )}
                      </>
                    )}
                  </li>
                ))}
            </ul>
          </Panel>

          <AgentNote title="Pattern worth a word">
            Kavya has filed late or missed {history("kavya").filter((c) => c === "late" || c === "miss").length} of the last {history("kavya").filter((c) => c !== "off").length} working days, mostly Tuesdays after the evening calling block. Sahil&rsquo;s gaps line up with GST week. Suggest moving their report reminder to 6:30 PM.
          </AgentNote>

          <div className="flex items-center gap-2 rounded-[14px] border border-dashed border-d-line px-3 py-2.5 text-[12px] text-d-mute">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            Reports lock at 11:59 PM and roll into Report History. The weekly digest runs Sunday night.
            <Sparkles className="ml-auto h-3.5 w-3.5 shrink-0 text-[var(--d-gold)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function rank(s: Status["state"]) {
  return s === "pending" ? 0 : s === "drafting" ? 1 : 2;
}
function stateTone(s: Status["state"]): Tone {
  return s === "submitted" ? "ok" : s === "drafting" ? "warn" : "late";
}

function Legend({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: color }} />
      {children}
    </span>
  );
}

/** Small line-drawn face; mouth curve follows the mood. */
function MoodFace({ v, on }: { v: number; on: boolean }) {
  const curve = (v - 3) * 3; // -6..6
  const color = on ? "var(--d-accent)" : "var(--d-mute)";
  return (
    <svg viewBox="0 0 32 32" className="mx-auto h-7 w-7" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
      <circle cx="16" cy="16" r="13" />
      <circle cx="11.5" cy="13" r="1.2" fill={color} stroke="none" />
      <circle cx="20.5" cy="13" r="1.2" fill={color} stroke="none" />
      <path d={`M10.5 ${20 - curve / 3} Q16 ${20 + curve} 21.5 ${20 - curve / 3}`} />
    </svg>
  );
}
