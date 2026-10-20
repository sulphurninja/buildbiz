"use client";

import * as React from "react";
import { toast } from "sonner";
import { cn } from "cn";
import { Flame, MessageCircle, Minus, Plus, Send, Sparkles, Target, Wand2 } from "lucide-react";
import { useHQ } from "../store";
import { personById, team } from "../data";
import type { Person, Task } from "../types";
import { AIMark, AgentNote, Board, Btn, Field, Meter, Metric, Modal, PageHeader, Panel, PersonAvatar, PersonChip, Pill, SearchBox, SectionLabel, Segmented, Sheet, Sparkline, inputClass } from "../kit";

/* ------------------------------------------------------------------ */
/* Local data: week of Mon 19 – Sat 24 Oct 2026, today is Tue (idx 1)   */
/* ------------------------------------------------------------------ */

const DAYS = ["Mon 19", "Tue 20", "Wed 21", "Thu 22", "Fri 23", "Sat 24"];
const TODAY = 1;

type Status = "Committed" | "In progress" | "At risk" | "Done" | "Missed";
const STATUSES: Status[] = ["Committed", "In progress", "At risk", "Done", "Missed"];
const statusTone = { Committed: "info", "In progress": "accent", "At risk": "warn", Done: "ok", Missed: "late" } as const;

type Checkin = { at: string; by: string; text: string };
type Commitment = {
  id: string;
  owner: string;
  text: string;
  unit: string;
  target: number;
  current: number;
  due: number;
  status: Status;
  area: Task["area"];
  checkins: Checkin[];
};

const seed: [string, string, string, number, number, number, Status, Task["area"], string?][] = [
  ["amit", "Record Agent Factory modules 7 and 8", "modules", 2, 1, 3, "In progress", "Delivery", "Module 7 shot, editing chal raha hai"],
  ["amit", "Close 2 done-for-you builds personally", "deals", 2, 0, 4, "At risk", "Sales", "Shubh Jewellers wants Dhanteras go-live; pricing call pending"],
  ["amit", "Run Batch 15 content review with Meera", "reviews", 1, 1, 1, "Done", "Marketing"],
  ["rohan", "Close ₹6 L in Accelerator and Systems", "₹ lakh", 6, 3.7, 5, "In progress", "Sales", "Sunita Bansal closed, 2 proposals out"],
  ["rohan", "Run 3 close-rate drills with the floor", "drills", 3, 1, 5, "In progress", "Sales"],
  ["rohan", "Send Shubh Jewellers DFY proposal", "proposal", 1, 0, 0, "Missed", "Sales", "Owner travelling to Thrissur, moved to Wed"],
  ["sneha", "Close 4 Accelerator deals", "deals", 4, 3, 5, "In progress", "Sales", "3 down, Harish Patel EMI pe convert ho raha hai"],
  ["sneha", "Collect 3 video testimonials from Batch 12", "videos", 3, 3, 2, "Done", "Marketing"],
  ["sneha", "Zero overdue follow-ups by Friday", "overdue", 0, 2, 4, "In progress", "Sales"],
  ["arjun", "Book 12 demo calls from Batch 14", "calls", 12, 4, 4, "At risk", "Sales", "Connect rate low on day 2 attendees"],
  ["arjun", "Learn the distributor desk demo end to end", "demo", 1, 1, 1, "Done", "Sales"],
  ["arjun", "Close 2 Launchpad deals", "deals", 2, 0, 5, "Committed", "Sales"],
  ["kavya", "Hand over 18 leads before leave", "leads", 18, 18, 0, "Done", "Sales"],
  ["imran", "Qualify 300 Meta leads", "leads", 300, 142, 5, "In progress", "Sales", "34 overnight scored by the agent, reviewing"],
  ["imran", "Keep qualifier SLA under 15 min", "minutes", 15, 22, 5, "At risk", "Sales", "Lunch-time spike, need cover 1–2 PM"],
  ["neha", "Balaji Distributors go-live Friday", "go-live", 1, 0, 4, "In progress", "Delivery", "UAT 84%, cut-over plan shared"],
  ["neha", "Precision Auto Parts blueprint sign-off", "sign-off", 1, 0, 3, "At risk", "Delivery", "Client wants PPAP module in phase 1"],
  ["neha", "Weekly delivery review with Amit", "review", 1, 1, 0, "Done", "Delivery"],
  ["vikram", "Fix Swiggy sync on Spice Route", "fix", 1, 0, 1, "At risk", "Delivery", "Blocked on client API keys"],
  ["vikram", "Ship Apollo Pharma expiry radar to production", "release", 1, 1, 0, "Done", "Delivery"],
  ["vikram", "Write cut-over runbook for Balaji", "runbook", 1, 0, 2, "In progress", "Delivery"],
  ["priya", "Get 18 at-risk Batch 13 students back on track", "students", 18, 7, 5, "In progress", "Delivery", "WhatsApp sequence approved, 7 replied"],
  ["priya", "Send Batch 14 blueprint pack", "pack", 1, 1, 0, "Done", "Delivery"],
  ["priya", "Run 2 office hours for Batch 14", "sessions", 2, 0, 3, "Committed", "Delivery"],
  ["aditya", "Shortlist 2 business advisors", "hires", 2, 1, 4, "In progress", "Ops"],
  ["aditya", "Book Zoom 3,000-seat licence", "licence", 1, 0, 0, "Missed", "Ops", "Finance approval pending from Sahil"],
  ["aditya", "Publish Diwali leave roster", "roster", 1, 0, 5, "Committed", "Ops"],
  ["meera", "Bring CPL under ₹40 for Batch 15", "₹ CPL", 40, 38, 5, "In progress", "Marketing", "Owner-story Reel at ₹38"],
  ["meera", "Ship 4 new Reels creatives", "creatives", 4, 1, 4, "At risk", "Marketing", "Editor on leave till Wed"],
  ["sahil", "File September GST", "return", 1, 0, 0, "Missed", "Finance", "CA ne documents maange the, ab mil gaye"],
  ["sahil", "Reconcile October Razorpay settlements", "settlements", 152, 148, 3, "In progress", "Finance"],
  ["sahil", "Collect ₹78k Skyline milestone 2", "₹", 78000, 0, 4, "Committed", "Finance"],
];

const initial: Commitment[] = seed.map(([owner, text, unit, target, current, due, status, area, note], i) => ({
  id: `C-${310 + i}`,
  owner,
  text,
  unit,
  target,
  current,
  due,
  status,
  area,
  checkins: note ? [{ at: due === 0 ? "Mon, 6:40 PM" : "Today, 10:12 AM", by: owner, text: note }] : [],
}));

/** daily check-in grid, Mon and Tue known. h=hit p=partial m=miss l=leave */
const grid: Record<string, string> = {
  amit: "hp", rohan: "mp", sneha: "hh", arjun: "pm", kavya: "hl", imran: "hp",
  neha: "hh", vikram: "pm", priya: "hh", aditya: "mp", meera: "hp", sahil: "mm",
};
/** weekly hit rate, last 8 weeks, and current streak in weeks at 80%+ */
const history: Record<string, { weeks: number[]; streak: number }> = {
  amit: { weeks: [82, 90, 76, 88, 92, 85, 90, 84], streak: 4 },
  rohan: { weeks: [88, 92, 95, 90, 84, 86, 80, 72], streak: 0 },
  sneha: { weeks: [80, 86, 92, 94, 96, 92, 98, 95], streak: 7 },
  arjun: { weeks: [70, 74, 78, 81, 84, 79, 70, 62], streak: 0 },
  kavya: { weeks: [84, 82, 86, 88, 90, 86, 88, 92], streak: 6 },
  imran: { weeks: [76, 80, 84, 86, 82, 88, 85, 81], streak: 3 },
  neha: { weeks: [90, 92, 94, 88, 96, 94, 92, 90], streak: 9 },
  vikram: { weeks: [92, 90, 86, 88, 84, 82, 76, 70], streak: 0 },
  priya: { weeks: [78, 82, 86, 88, 90, 92, 90, 94], streak: 5 },
  aditya: { weeks: [80, 84, 82, 86, 80, 78, 74, 66], streak: 0 },
  meera: { weeks: [86, 88, 84, 90, 92, 94, 90, 88], streak: 8 },
  sahil: { weeks: [84, 80, 76, 72, 74, 70, 64, 58], streak: 0 },
};

const pct = (c: Commitment) => {
  if (c.status === "Done") return 100;
  // "lower is better" commitments (CPL, SLA, overdue)
  if (c.unit === "₹ CPL" || c.unit === "minutes" || c.unit === "overdue") return c.current <= c.target ? 100 : Math.max(0, Math.round((c.target / Math.max(c.current, 1)) * 100));
  return Math.min(100, Math.round((c.current / (c.target || 1)) * 100));
};
const fmtVal = (c: Commitment, v: number) => (c.unit === "₹" ? `₹${v.toLocaleString("en-IN")}` : c.unit === "₹ lakh" ? `₹${v} L` : c.unit === "₹ CPL" ? `₹${v}` : `${v}`);
const unitLabel = (c: Commitment) => (c.unit.startsWith("₹") ? "" : ` ${c.unit}`);

/** AI risk score from progress vs time left and the owner's recent trend. */
function aiRisk(c: Commitment) {
  if (c.status === "Done") return { score: 0, reason: "Delivered" };
  if (c.status === "Missed") return { score: 100, reason: "Due date passed" };
  const daysLeft = c.due - TODAY;
  const expected = Math.min(100, Math.round(((TODAY + 1) / (c.due + 1)) * 100));
  const gap = expected - pct(c);
  const h = history[c.owner]?.weeks ?? [];
  const trend = h.length > 1 ? h[h.length - 1] - h[h.length - 4] : 0;
  const score = Math.max(4, Math.min(96, Math.round(30 + gap * 0.6 - daysLeft * 4 - trend * 0.8 + (c.status === "At risk" ? 25 : 0))));
  const reason = gap > 20 ? `${pct(c)}% done, ${expected}% expected by today` : trend < -8 ? `${personById[c.owner]?.first}'s hit rate fell ${-trend} pts in 3 weeks` : daysLeft <= 1 ? "Due within a day" : "On pace";
  return { score, reason };
}

const groupOf = (p: Person) => p.role;

/* ------------------------------------------------------------------ */

export default function Accountability() {
  const hq = useHQ();
  const [items, setItems] = React.useState(initial);
  const [cells, setCells] = React.useState(grid);
  const [teamFilter, setTeamFilter] = React.useState<"all" | Person["role"]>("all");
  const [q, setQ] = React.useState("");
  const [mine, setMine] = React.useState(false);
  const [open, setOpen] = React.useState<string | null>(null);
  const [commitOpen, setCommitOpen] = React.useState(false);
  const [nudgeFor, setNudgeFor] = React.useState<string | null>(null);
  const [view, setView] = React.useState<"board" | "people">("board");

  const people = team.filter((p) => (teamFilter === "all" || groupOf(p) === teamFilter) && (!mine || p.id === hq.me.id));
  const pids = new Set(people.map((p) => p.id));
  const shown = items.filter((c) => pids.has(c.owner) && (!q || `${c.text} ${personById[c.owner]?.name}`.toLowerCase().includes(q.toLowerCase())));

  const count = (s: Status) => shown.filter((c) => c.status === s).length;
  const donePct = Math.round((count("Done") / (shown.length || 1)) * 100);
  const longest = Math.max(...people.map((p) => history[p.id]?.streak ?? 0), 0);
  const longestWho = people.find((p) => (history[p.id]?.streak ?? 0) === longest);

  const update = (id: string, patch: Partial<Commitment>, msg?: string) => {
    setItems((cur) => cur.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    if (msg) {
      hq.log(msg, patch.status === "Done" ? "ok" : patch.status === "At risk" || patch.status === "Missed" ? "warn" : "info");
    }
  };
  const move = (id: string, status: Status) => {
    const c = items.find((x) => x.id === id);
    if (!c || c.status === status) return;
    update(id, { status, current: status === "Done" ? Math.max(c.current, c.target) : c.current }, `moved "${c.text}" to ${status}`);
    toast(`${status}: ${c.text}`, { description: personById[c.owner]?.name });
    if (status === "Done" && c.owner !== hq.me.id) hq.notify({ kind: "task", title: `${personById[c.owner]?.first} delivered a commitment`, body: c.text, href: "/hq/accountability" }, { toast: false });
  };

  /* AI weekly review */
  const slipping = people
    .map((p) => {
      const list = items.filter((c) => c.owner === p.id);
      const risky = list.filter((c) => c.status === "At risk").length;
      const missed = list.filter((c) => c.status === "Missed").length;
      const h = history[p.id]?.weeks ?? [];
      const drop = h.length ? h[h.length - 4] - h[h.length - 1] : 0;
      const missDays = (cells[p.id] ?? "").split("").filter((x) => x === "m").length;
      const score = risky * 2 + missed * 3 + Math.max(0, drop) / 4 + missDays * 1.5;
      return { p, list, risky, missed, drop, missDays, score };
    })
    .filter((x) => x.score >= 4)
    .sort((a, b) => b.score - a.score);

  const current = items.find((c) => c.id === open) ?? null;

  return (
    <div>
      <PageHeader
        kicker="Workspace"
        title="Accountability Board"
        sub="Week 43 · Mon 19 to Sat 24 Oct. What each person committed to on Monday, where it stands, and who needs a hand before Friday."
        actions={
          <>
            <Btn icon={MessageCircle} onClick={() => hq.openAsk("Who is slipping on their commitments this week and why?")}>
              Ask who is slipping
            </Btn>
            <Btn variant="solid" icon={Plus} onClick={() => setCommitOpen(true)}>
              Commit
            </Btn>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <Metric label="Commitments" value={shown.length} hint={`${people.length} people · week 43`} />
        <Metric label="Delivered" value={`${donePct}%`} delta={`${count("Done")} done`} hint="Tuesday norm is 25%" />
        <Metric label="In progress" value={count("In progress")} hint={`${count("Committed")} not started`} />
        <Metric label="At risk" value={count("At risk")} delta={count("At risk") ? "needs help" : "clear"} good={!count("At risk")} hint="Flagged by owner or AI" />
        <Metric label="Missed" value={count("Missed")} delta={count("Missed") ? `${count("Missed")} carried` : "none"} good={!count("Missed")} hint="Due Monday, not delivered" />
        <Metric label="Longest streak" value={`${longest} wk`} hint={longestWho ? `${longestWho.first} · 80%+ every week` : "—"} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel
          title="AI weekly review"
          sub="Read every commitment, check-in and the daily grid at 9 AM"
          icon={Sparkles}
          action={<AIMark label="Reviewer" />}
        >
          <p className="max-w-[760px] text-[14px] leading-relaxed text-d-ink/85">
            The team is at <b>{donePct}%</b> delivered on a Tuesday, {donePct >= 25 ? "ahead of" : "a little behind"} a normal week (25%). {slipping.length ? `${slipping.length} people are slipping` : "Nobody is slipping"}
            {slipping.length ? `, mostly because of blockers outside their control (client API keys, approvals, an editor on leave) rather than effort. ` : ". "}
            Sneha and Neha are carrying the week; both are worth a public thank-you in Friday&apos;s review.
          </p>
          <ul className="mt-4 grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {slipping.slice(0, 6).map((s) => (
              <li key={s.p.id} className="rounded-[14px] border border-d-line p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <PersonChip id={s.p.id} sub={s.p.title} />
                  <Pill tone={s.score >= 7 ? "late" : "warn"} mono>
                    slip {Math.round(s.score)}
                  </Pill>
                </div>
                <ul className="mt-2.5 space-y-1 text-[12.5px] text-d-ink/80">
                  {s.missed > 0 && <li>· {s.missed} missed: {s.list.find((c) => c.status === "Missed")?.text}</li>}
                  {s.risky > 0 && <li>· {s.risky} at risk: {s.list.find((c) => c.status === "At risk")?.text}</li>}
                  {s.drop > 5 && <li>· Weekly hit rate down {s.drop} pts over 3 weeks</li>}
                  {s.missDays > 0 && <li>· Missed {s.missDays} daily check-in{s.missDays > 1 ? "s" : ""}</li>}
                </ul>
                <div className="mt-3 flex gap-1.5">
                  <Btn size="sm" variant="soft" icon={Wand2} onClick={() => setNudgeFor(s.p.id)}>
                    Draft nudge
                  </Btn>
                  <Btn
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      hq.addTask({ title: `15-min check-in with ${s.p.first} on this week's commitments`, owner: hq.me.id, priority: "P1", area: "Ops", status: "Todo", dueIn: 0, due: "Today", aiDrafted: true });
                      hq.log(`scheduled a check-in with ${s.p.first}`, "info");
                      toast.success(`Check-in with ${s.p.first} added to your tasks`);
                    }}
                  >
                    Add check-in
                  </Btn>
                </div>
              </li>
            ))}
            {slipping.length === 0 && <li className="text-[13px] text-d-mute">Nobody in this filter is slipping.</li>}
          </ul>
        </Panel>

        <Panel title="Streaks" sub="Weeks in a row at 80%+ delivered" icon={Flame}>
          <ul className="space-y-2.5">
            {[...people]
              .sort((a, b) => (history[b.id]?.streak ?? 0) - (history[a.id]?.streak ?? 0))
              .map((p) => {
                const h = history[p.id];
                const last = h?.weeks[h.weeks.length - 1] ?? 0;
                return (
                  <li key={p.id} className="flex items-center gap-3">
                    <PersonAvatar id={p.id} size={26} />
                    <span className="w-16 truncate text-[13px] font-medium">{p.first}</span>
                    <span className="flex w-14 items-center gap-1 font-mono text-[12px]" style={{ color: h?.streak ? "var(--d-warn)" : "var(--d-mute)" }}>
                      <Flame className="h-3.5 w-3.5" />
                      {h?.streak ?? 0}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Sparkline data={h?.weeks ?? [0, 0]} height={22} tone={last >= 80 ? "ok" : last >= 70 ? "warn" : "late"} />
                    </div>
                    <span className="w-10 text-right font-mono text-[11.5px] text-d-mute">{last}%</span>
                  </li>
                );
              })}
          </ul>
        </Panel>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <Segmented
          size="sm"
          value={teamFilter}
          onChange={setTeamFilter}
          options={[
            { value: "all", label: "Everyone", count: team.length },
            { value: "founder", label: "Founder", count: 1 },
            { value: "sales", label: "Sales", count: team.filter((p) => p.role === "sales").length },
            { value: "delivery", label: "Delivery", count: team.filter((p) => p.role === "delivery").length },
            { value: "ops", label: "Ops & finance", count: team.filter((p) => p.role === "ops").length },
          ]}
        />
        <Btn size="sm" variant={mine ? "solid" : "outline"} onClick={() => setMine((m) => !m)}>
          Only mine
        </Btn>
        <SearchBox value={q} onChange={setQ} placeholder="Search commitments or people" className="w-full sm:w-64" />
        <div className="ml-auto">
          <Segmented size="sm" value={view} onChange={setView} options={[{ value: "board", label: "Status board" }, { value: "people", label: "By person" }]} />
        </div>
      </div>

      <div className="mt-4">
        {view === "board" ? (
          <Board
            columns={STATUSES.map((s) => ({ id: s, label: s, tone: statusTone[s], hint: s === "At risk" ? "AI flags anything 20 pts behind pace" : undefined }))}
            items={shown}
            itemKey={(c) => c.id}
            getColumn={(c) => c.status}
            onMove={(id, col) => move(id, col as Status)}
            minColumnWidth={232}
            renderCard={(c) => <CommitCard c={c} onOpen={() => setOpen(c.id)} />}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {people.map((p) => {
              const list = shown.filter((c) => c.owner === p.id);
              const done = list.filter((c) => c.status === "Done").length;
              return (
                <Panel key={p.id} title={p.name} sub={`${p.title} · ${done}/${list.length} delivered`} action={<PersonAvatar id={p.id} size={30} />}>
                  <ul className="space-y-2.5">
                    {list.map((c) => (
                      <li key={c.id}>
                        <button type="button" onClick={() => setOpen(c.id)} className="w-full rounded-[10px] p-1.5 text-left hover:bg-d-sunk">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-[13px]">{c.text}</span>
                            <Pill tone={statusTone[c.status]}>{c.status}</Pill>
                          </div>
                          <Meter className="mt-1.5" value={pct(c)} tone={statusTone[c.status]} height={4} />
                        </button>
                      </li>
                    ))}
                    {list.length === 0 && <li className="text-[12.5px] text-d-mute">No commitments match.</li>}
                  </ul>
                </Panel>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-7">
        <SectionLabel action={<span className="text-[12px] text-d-mute">Click a past or today cell to change it</span>}>Daily check-ins · person × weekday</SectionLabel>
        <div className="desk-card desk-scroll overflow-x-auto p-4">
          <table className="w-full min-w-[720px] border-separate border-spacing-1 text-[12px]">
            <thead>
              <tr>
                <th className="w-48 text-left font-normal text-d-mute">Person</th>
                {DAYS.map((d, i) => (
                  <th key={d} className={cn("text-center font-mono font-normal", i === TODAY ? "text-d-accent" : "text-d-mute")}>
                    {d}
                    {i === TODAY && <span className="ml-1 text-[10px]">today</span>}
                  </th>
                ))}
                <th className="w-24 text-right font-normal text-d-mute">Week</th>
              </tr>
            </thead>
            <tbody>
              {people.map((p) => {
                const row = cells[p.id] ?? "";
                const list = items.filter((c) => c.owner === p.id);
                return (
                  <tr key={p.id}>
                    <td className="pr-2">
                      <PersonChip id={p.id} sub={p.title} />
                    </td>
                    {DAYS.map((d, i) => {
                      const v = row[i] ?? (i <= TODAY ? "p" : "");
                      const dueHere = list.filter((c) => c.due === i);
                      const style =
                        v === "h" ? { background: "color-mix(in oklab, var(--d-ok) 22%, var(--d-panel))", color: "var(--d-ok)" }
                        : v === "p" ? { background: "color-mix(in oklab, var(--d-warn) 18%, var(--d-panel))", color: "var(--d-warn)" }
                        : v === "m" ? { background: "color-mix(in oklab, var(--d-late) 16%, var(--d-panel))", color: "var(--d-late)" }
                        : v === "l" ? { background: "var(--d-sunk)", color: "var(--d-mute)" }
                        : { background: "transparent", color: "var(--d-mute)", boxShadow: "inset 0 0 0 1px var(--d-line)" };
                      const label = v === "h" ? "Hit" : v === "p" ? "Partial" : v === "m" ? "Missed" : v === "l" ? "Leave" : dueHere.length ? `${dueHere.length} due` : "";
                      return (
                        <td key={d} className="p-0">
                          <button
                            type="button"
                            disabled={i > TODAY}
                            title={dueHere.map((c) => c.text).join("\n") || undefined}
                            onClick={() => {
                              const order = ["h", "p", "m", "l"];
                              const next = order[(order.indexOf(v) + 1) % order.length];
                              const chars = (row.padEnd(TODAY + 1, "p")).split("");
                              chars[i] = next;
                              setCells((c) => ({ ...c, [p.id]: chars.join("") }));
                              toast(`${p.first} · ${d}: ${next === "h" ? "hit" : next === "p" ? "partial" : next === "m" ? "missed" : "on leave"}`);
                            }}
                            className="flex h-10 w-full min-w-[72px] items-center justify-center rounded-[8px] font-mono text-[11px] font-medium transition-transform enabled:hover:scale-[1.03] disabled:cursor-default"
                            style={style}
                          >
                            {label}
                          </button>
                        </td>
                      );
                    })}
                    <td className="text-right font-mono text-[12px]">
                      {list.filter((c) => c.status === "Done").length}/{list.length}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <DetailSheet c={current} onClose={() => setOpen(null)} onUpdate={update} onMove={move} />
      <CommitModal
        open={commitOpen}
        onOpenChange={setCommitOpen}
        onCreate={(c) => {
          setItems((cur) => [c, ...cur]);
          hq.log(`committed to "${c.text}" by ${DAYS[c.due]}`, "accent");
          if (c.owner !== hq.me.id) hq.notify({ kind: "task", title: `New commitment for ${personById[c.owner]?.first}`, body: `${c.text} · due ${DAYS[c.due]}`, href: "/hq/accountability" });
          else toast.success("Committed", { description: `${c.text} · due ${DAYS[c.due]}` });
        }}
      />
      <NudgeModal personId={nudgeFor} items={items} onClose={() => setNudgeFor(null)} />
    </div>
  );
}

/* ---------------- Card ---------------- */

function CommitCard({ c, onOpen }: { c: Commitment; onOpen: () => void }) {
  const r = aiRisk(c);
  const p = pct(c);
  return (
    <button type="button" onClick={onOpen} className="block w-full text-left">
      <div className="flex items-center gap-2 pr-4">
        <PersonAvatar id={c.owner} size={22} />
        <span className="text-[12px] font-medium">{personById[c.owner]?.first}</span>
        <span className="ml-auto font-mono text-[10.5px] text-d-mute">{DAYS[c.due].split(" ")[0]}</span>
      </div>
      <p className="mt-2 text-[13px] font-medium leading-snug">{c.text}</p>
      <div className="mt-2.5 flex items-center gap-2">
        <Meter value={p} tone={statusTone[c.status]} height={4} className="flex-1" />
        <span className="tnum font-mono text-[10.5px] text-d-mute">
          {fmtVal(c, c.current)}/{fmtVal(c, c.target)}
        </span>
      </div>
      {c.status !== "Done" && c.status !== "Missed" && r.score >= 50 && (
        <p className="mt-2 flex items-center gap-1 text-[11px] text-[color-mix(in_oklab,var(--d-gold)_75%,black)]">
          <Sparkles className="h-3 w-3" /> Risk {r.score} · {r.reason}
        </p>
      )}
      {c.checkins.length > 0 && <p className="mt-1.5 truncate text-[11.5px] italic text-d-mute">“{c.checkins[0].text}”</p>}
    </button>
  );
}

/* ---------------- Detail ---------------- */

function DetailSheet({ c, onClose, onUpdate, onMove }: { c: Commitment | null; onClose: () => void; onUpdate: (id: string, patch: Partial<Commitment>, msg?: string) => void; onMove: (id: string, s: Status) => void }) {
  const hq = useHQ();
  const [note, setNote] = React.useState("");
  if (!c) return <Sheet open={false} onOpenChange={() => onClose()} title="">{null}</Sheet>;
  const r = aiRisk(c);
  const step = c.unit === "₹" ? 10000 : c.unit === "₹ lakh" ? 0.5 : c.target >= 100 ? 10 : 1;
  const coach =
    c.status === "Done"
      ? `Delivered. Worth calling out in Friday's review; ${personById[c.owner]?.first} has a ${history[c.owner]?.streak ?? 0}-week streak.`
      : r.score >= 60
        ? `Split it: get ${fmtVal(c, Math.round((c.target - c.current) / 2 + c.current))}${unitLabel(c)} done by Thursday, and ask for one specific unblock today. ${c.checkins[0] ? `Last check-in says: "${c.checkins[0].text}".` : ""}`
        : "On pace. A short check-in on Thursday morning is enough.";
  return (
    <Sheet
      open={!!c}
      onOpenChange={(o) => !o && onClose()}
      eyebrow={`${c.id} · ${c.area} · due ${DAYS[c.due]}`}
      title={c.text}
      sub={`${personById[c.owner]?.name} · ${personById[c.owner]?.title}`}
      width={520}
      footer={
        <>
          <Btn variant="ghost" onClick={() => onMove(c.id, "At risk")}>Flag at risk</Btn>
          <Btn variant="solid" onClick={() => onMove(c.id, "Done")}>Mark delivered</Btn>
        </>
      }
    >
      <SectionLabel>Status</SectionLabel>
      <Segmented size="sm" value={c.status} onChange={(s) => onMove(c.id, s)} options={STATUSES} />

      <SectionLabel className="mt-6">Progress</SectionLabel>
      <div className="desk-card p-4">
        <div className="flex items-baseline justify-between">
          <span className="tnum font-serif text-[30px] font-medium leading-none">
            {fmtVal(c, c.current)}
            <span className="ml-1 font-mono text-[13px] text-d-mute">/ {fmtVal(c, c.target)}{unitLabel(c)}</span>
          </span>
          <div className="flex gap-1.5">
            <Btn size="sm" icon={Minus} aria-label="Decrease" onClick={() => onUpdate(c.id, { current: Math.max(0, +(c.current - step).toFixed(2)) })} />
            <Btn
              size="sm"
              icon={Plus}
              aria-label="Increase"
              onClick={() => {
                const next = +(c.current + step).toFixed(2);
                onUpdate(c.id, { current: next, status: c.status === "Committed" ? "In progress" : c.status }, `logged progress on "${c.text}": ${fmtVal(c, next)}`);
              }}
            />
          </div>
        </div>
        <Meter className="mt-3" value={pct(c)} tone={statusTone[c.status]} />
      </div>

      <AgentNote className="mt-5" title={<span className="flex items-center gap-2">AI risk {r.score}/100 <span className="font-normal text-d-mute">· {r.reason}</span></span>}>
        {coach}
      </AgentNote>

      <SectionLabel className="mt-6">Check-ins</SectionLabel>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!note.trim()) return;
          onUpdate(c.id, { checkins: [{ at: "just now", by: hq.me.id, text: note.trim() }, ...c.checkins] }, `checked in on "${c.text}"`);
          setNote("");
          toast.success("Check-in added");
        }}
        className="flex gap-2"
      >
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="What moved, what's blocking?" className={inputClass} />
        <Btn type="submit" icon={Send} variant="solid">Add</Btn>
      </form>
      <ul className="mt-3 space-y-3">
        {c.checkins.map((k, i) => (
          <li key={`${k.at}-${i}`} className="flex gap-2.5">
            <PersonAvatar id={k.by} size={24} />
            <div>
              <p className="text-[11.5px] text-d-mute">{personById[k.by]?.first} · {k.at}</p>
              <p className="text-[13px]">{k.text}</p>
            </div>
          </li>
        ))}
        {c.checkins.length === 0 && <li className="text-[12.5px] text-d-mute">No check-ins yet.</li>}
      </ul>
    </Sheet>
  );
}

/* ---------------- Commit modal ---------------- */

const smart: Record<Task["area"], (first: string, day: string) => { text: string; unit: string; target: number }> = {
  Sales: (_f, day) => ({ text: `Close 3 Accelerator deals (₹2.25 L) from Batch 14 attendees by ${day}`, unit: "deals", target: 3 }),
  Delivery: (_f, day) => ({ text: `Get UAT sign-off on 2 modules with the client by ${day}`, unit: "sign-offs", target: 2 }),
  Marketing: (_f, day) => ({ text: `Ship 3 Reels creatives and keep CPL under ₹40 by ${day}`, unit: "creatives", target: 3 }),
  Ops: (_f, day) => ({ text: `Close 5 open ops tickets and publish the Diwali roster by ${day}`, unit: "tickets", target: 5 }),
  Finance: (_f, day) => ({ text: `Collect ₹2 L of overdue EMI dues via Razorpay links by ${day}`, unit: "₹", target: 200000 }),
};

function CommitModal({ open, onOpenChange, onCreate }: { open: boolean; onOpenChange: (o: boolean) => void; onCreate: (c: Commitment) => void }) {
  const hq = useHQ();
  const [owner, setOwner] = React.useState(hq.me.id);
  const [text, setText] = React.useState("");
  const [unit, setUnit] = React.useState("deals");
  const [target, setTarget] = React.useState(1);
  const [due, setDue] = React.useState(4);
  const [area, setArea] = React.useState<Task["area"]>("Sales");
  const [thinking, setThinking] = React.useState(false);
  const seq = React.useRef(0);

  const vague = text.trim().length > 0 && !/\d/.test(text);
  const draftRisk = aiRisk({ id: "x", owner, text, unit, target, current: 0, due, status: "Committed", area, checkins: [] });

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Make a commitment" sub="One measurable outcome for this week. It shows on the board, in the owner's My Today and in Friday's review.">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          seq.current += 1;
          onCreate({ id: `C-new${seq.current}`, owner, text: text.trim(), unit, target, current: 0, due, status: "Committed", area, checkins: [] });
          setText("");
          onOpenChange(false);
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Who">
            <select value={owner} onChange={(e) => setOwner(e.target.value)} className={inputClass}>
              {team.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Area">
            <select value={area} onChange={(e) => setArea(e.target.value as Task["area"])} className={inputClass}>
              {(["Sales", "Delivery", "Marketing", "Ops", "Finance"] as const).map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Commitment">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="e.g. follow up with Batch 14 leads" className={cn(inputClass, "h-auto py-2.5")} />
        </Field>
        {vague && (
          <AgentNote
            title="This is hard to measure"
            action={
              <Btn
                size="sm"
                variant="soft"
                icon={Wand2}
                disabled={thinking}
                onClick={() => {
                  setThinking(true);
                  window.setTimeout(() => {
                    const s = smart[area](personById[owner]?.first ?? "", DAYS[due].split(" ")[0]);
                    setText(s.text);
                    setUnit(s.unit);
                    setTarget(s.target);
                    setThinking(false);
                  }, 700);
                }}
              >
                {thinking ? "Rewriting…" : "Make it measurable"}
              </Btn>
            }
          >
            Commitments with a number and a day get delivered 2.3× more often on this team.
          </AgentNote>
        )}
        <div className="grid grid-cols-3 gap-3">
          <Field label="Target">
            <input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} className={inputClass} />
          </Field>
          <Field label="Unit">
            <input value={unit} onChange={(e) => setUnit(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Due">
            <select value={due} onChange={(e) => setDue(Number(e.target.value))} className={inputClass}>
              {DAYS.map((d, i) => (
                <option key={d} value={i} disabled={i < TODAY}>{d}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-d-line pt-4">
          <span className="flex items-center gap-1.5 text-[12px] text-d-mute">
            <Target className="h-3.5 w-3.5" /> AI starting risk <b className="font-mono text-d-ink">{draftRisk.score}</b> based on {personById[owner]?.first}&apos;s last 8 weeks
          </span>
          <Btn type="submit" variant="solid" disabled={!text.trim()}>Commit</Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Nudge modal ---------------- */

function draftNudge(p: Person, list: Commitment[], fromFirst: string) {
  const risky = list.find((c) => c.status === "Missed") ?? list.find((c) => c.status === "At risk");
  const win = list.find((c) => c.status === "Done");
  return `Hi ${p.first}, quick one from ${fromFirst}. ${win ? `First, great work on "${win.text}", that helped the whole team. ` : ""}I noticed "${risky?.text ?? "this week's commitments"}" is slipping${risky?.checkins[0] ? ` (you mentioned: ${risky.checkins[0].text})` : ""}. Koi pressure nahi, I just want to unblock it. What is the one thing I can do today to help? If the date needs to move, let's agree a new one by tomorrow 11 AM. You've got this.`;
}

function NudgeModal({ personId, items, onClose }: { personId: string | null; items: Commitment[]; onClose: () => void }) {
  const hq = useHQ();
  const p = personId ? personById[personId] : null;
  const [text, setText] = React.useState("");
  const [channel, setChannel] = React.useState<"HQ" | "WhatsApp">("HQ");
  const [lastFor, setLastFor] = React.useState<string | null>(null);
  if (p && lastFor !== p.id) {
    setLastFor(p.id);
    setText(draftNudge(p, items.filter((c) => c.owner === p.id), hq.me.first));
  }
  return (
    <Modal open={!!p} onOpenChange={(o) => !o && onClose()} title={p ? `Nudge ${p.first}` : "Nudge"} sub="Drafted by the reviewer to be supportive, specific and short. Edit before sending.">
      {p && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <PersonChip id={p.id} sub={p.title} />
            <AIMark label="AI draft" />
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={7} className={cn(inputClass, "h-auto py-2.5 leading-relaxed")} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Segmented size="sm" value={channel} onChange={setChannel} options={["HQ", "WhatsApp"]} />
            <div className="flex gap-2">
              <Btn variant="ghost" icon={Wand2} onClick={() => setText(draftNudge(p, items.filter((c) => c.owner === p.id), hq.me.first).replace("Koi pressure nahi, I", "No pressure at all; I"))}>
                Redraft
              </Btn>
              <Btn
                variant="solid"
                icon={Send}
                onClick={() => {
                  hq.notify({ kind: "task", title: `Nudge sent to ${p.first}`, body: text.slice(0, 90) + "…", href: "/hq/accountability" }, { toast: false });
                  hq.log(`sent ${p.first} a supportive nudge on ${channel}`, "info");
                  toast.success(`Sent to ${p.first} on ${channel}`);
                  onClose();
                }}
              >
                Send
              </Btn>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
