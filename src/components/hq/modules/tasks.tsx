"use client";

import * as React from "react";
import { cn } from "cn";
import { toast } from "sonner";
import {
  AlarmClock,
  ArrowRightLeft,
  CalendarClock,
  Check,
  CheckCheck,
  Columns3,
  ListChecks,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Table2,
  UserRound,
  Users,
  Wand2,
} from "lucide-react";
import {
  AgentNote,
  AIMark,
  Board,
  Btn,
  DataTable,
  Field,
  inputClass,
  Meter,
  Metric,
  Modal,
  PageHeader,
  Panel,
  PersonAvatar,
  PersonChip,
  Pill,
  SectionLabel,
  Segmented,
  Sheet,
  type Column,
} from "../kit";
import { useHQ } from "../store";
import { personById, team } from "../data";
import type { Task, TaskStatus } from "../types";
import type { Tone } from "../../desk/types";

/* ---------------- helpers ---------------- */

function h(n: number, salt = 3) {
  let t = Math.imul(n + 11, 0x9e3779b1) ^ Math.imul(salt + 5, 0x85ebca6b);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const idNum = (id: string) => Number(id.replace(/\D/g, "")) || id.length;

const STATUSES: TaskStatus[] = ["Todo", "In progress", "Review", "Done"];
const AREAS: Task["area"][] = ["Sales", "Delivery", "Marketing", "Ops", "Finance"];
const PRIORITIES: Task["priority"][] = ["P0", "P1", "P2", "P3"];
const PRI_RANK: Record<Task["priority"], number> = { P0: 0, P1: 1, P2: 2, P3: 3 };
const PRI_WEIGHT: Record<Task["priority"], number> = { P0: 3, P1: 2, P2: 1, P3: 0.5 };
const PRI_TONE: Record<Task["priority"], Tone> = { P0: "late", P1: "warn", P2: "info", P3: "neutral" };
const STATUS_TONE: Record<TaskStatus, Tone> = { Todo: "neutral", "In progress": "info", Review: "warn", Done: "ok" };
const CAPACITY = 9;

function dueText(d: number) {
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  if (d < 0) return `${-d}d overdue`;
  return `in ${d}d`;
}
function dueDate(d: number) {
  // today is Tue 20 Oct
  const day = 20 + d;
  if (day > 31) return `${day - 31} Nov`;
  if (day < 1) return `${30 + day} Sep`;
  return `${day} Oct`;
}
function dueTone(t: Task): Tone {
  if (t.status === "Done") return "neutral";
  if (t.dueIn < 0) return "late";
  if (t.dueIn === 0) return "warn";
  return "neutral";
}
const isOpen = (t: Task) => t.status !== "Done";
function stamp() {
  return new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });
}
function estimate(t: Task) {
  const base = t.priority === "P0" ? 75 : t.priority === "P1" ? 60 : 40;
  return Math.round((base + h(idNum(t.id), 9) * 50) / 15) * 15;
}
function clock(mins: number) {
  const hh = Math.floor(mins / 60);
  const mm = mins % 60;
  const h12 = hh > 12 ? hh - 12 : hh;
  return `${h12}:${String(mm).padStart(2, "0")} ${hh >= 12 ? "PM" : "AM"}`;
}

/** Who naturally owns an area of work. */
const AREA_OWNERS: Record<Task["area"], string[]> = {
  Sales: ["imran", "arjun", "kavya", "sneha", "rohan"],
  Delivery: ["priya", "vikram", "neha"],
  Marketing: ["meera", "priya"],
  Ops: ["aditya"],
  Finance: ["sahil", "aditya"],
};
const FOUNDER_ONLY = /record|leadership|investor|hire|interview|pricing/i;

type Comment = { id: string; who: string; at: string; text: string };
type Trail = { id: string; who: string; at: string; text: string };

const commentPool: Record<Task["area"], string[]> = {
  Sales: ["Called twice, he wants the EMI breakup on WhatsApp first.", "Booked 4 of the 9 so far. Rest after 6 PM.", "Can we offer the Batch 14 bonus pack here?"],
  Delivery: ["Waiting on API keys from the client's tech guy.", "Staging is green, prod deploy after UAT sign-off.", "Pushed the fix, please re-test the Swiggy webhook."],
  Marketing: ["Hook test: 'Can you take a holiday?' is beating the control by 31%.", "Need 3 more owner clips for the cutdown.", "CPL holding at ₹38 after the scale-up."],
  Ops: ["Vendor quote attached, ₹1.2 L for the year.", "Shortlist is down to 6, interviews Thursday.", "Done for the Mumbai office, Pune next."],
  Finance: ["CA needs the purchase register by tomorrow.", "Razorpay payout for 16 Oct is still pending.", "Milestone invoice sent, follow-up on Friday."],
};

function seedComments(t: Task): Comment[] {
  const n = idNum(t.id);
  const count = Math.floor(h(n, 21) * 3);
  const pool = commentPool[t.area];
  const voices = [t.owner, ...AREA_OWNERS[t.area].filter((p) => p !== t.owner), "amit"];
  return Array.from({ length: count }, (_, k) => ({
    id: `${t.id}-c${k}`,
    who: voices[(k + Math.floor(h(n, 22) * 3)) % voices.length],
    at: k === 0 ? "Yesterday, 6:10 PM" : `Today, ${9 + k}:${String(Math.floor(h(n + k, 23) * 50) + 5).padStart(2, "0")} AM`,
    text: pool[(n + k) % pool.length],
  }));
}
function seedTrail(t: Task): Trail[] {
  const out: Trail[] = [{ id: `${t.id}-t0`, who: t.aiDrafted ? "agent" : "amit", at: "Mon, 9:12 AM", text: t.aiDrafted ? "Morning Operator drafted this task from the daily brief" : `created and assigned to ${personById[t.owner]?.first}` }];
  if (t.status !== "Todo") out.unshift({ id: `${t.id}-t1`, who: t.owner, at: "Yesterday, 4:40 PM", text: `moved to ${t.status === "Done" ? "In progress" : t.status}` });
  if (t.status === "Done") out.unshift({ id: `${t.id}-t2`, who: t.owner, at: "Today, 10:05 AM", text: "marked done" });
  return out;
}

const SUBTASK_TEMPLATES: Record<Task["area"], string[]> = {
  Sales: ["Pull lead history and last call notes", "Call and log outcome in the CRM", "Send WhatsApp recap with payment link", "Book the next step on the calendar"],
  Delivery: ["Confirm scope with the client lead", "Build and test on staging", "Walk the client through it on Zoom", "Get written sign-off"],
  Marketing: ["Write 3 hook variations", "Cut the creative (9:16 and 1:1)", "Launch with ₹5k test budget", "Review CPL after 48 hours"],
  Ops: ["Collect quotes or inputs", "Compare and shortlist", "Get Amit's approval", "Close it out and inform the team"],
  Finance: ["Export statements for the period", "Reconcile against invoices", "Flag mismatches to the owner", "File and archive the workings"],
};

function loadOf(tasks: Task[], id: string) {
  return tasks.filter((t) => t.owner === id && isOpen(t)).reduce((a, t) => a + PRI_WEIGHT[t.priority], 0);
}

type Plan = {
  order: { task: Task; at: string; mins: number; why: string }[];
  delegate: { task: Task; to: string; why: string }[];
  minutes: number;
};

function buildPlan(all: Task[], meId: string): Plan {
  const mine = all.filter((t) => t.owner === meId && isOpen(t));
  const score = (t: Task) => PRI_RANK[t.priority] * 10 + Math.max(-4, Math.min(t.dueIn, 7)) * 3 + (t.status === "Review" ? -6 : t.status === "In progress" ? -3 : 0);
  const sorted = [...mine].sort((a, b) => score(a) - score(b));
  const delegate: Plan["delegate"] = [];
  for (const t of [...sorted].reverse()) {
    if (delegate.length >= 3) break;
    if (FOUNDER_ONLY.test(t.title) || t.priority === "P0") continue;
    const candidates = AREA_OWNERS[t.area].filter((p) => p !== meId);
    if (!candidates.length) continue;
    const best = [...candidates].sort((a, b) => loadOf(all, a) - loadOf(all, b))[0];
    const theirLoad = loadOf(all, best);
    const myLoad = loadOf(all, meId);
    if (theirLoad >= myLoad + 2 && meId !== "amit") continue;
    delegate.push({
      task: t,
      to: best,
      why: `${personById[best].first} owns ${t.area.toLowerCase()} work and carries ${theirLoad} load points to your ${myLoad}. ${t.priority} ${t.dueIn > 1 ? `with ${t.dueIn} days of slack` : "but routine enough to hand off"}.`,
    });
  }
  const skip = new Set(delegate.map((d) => d.task.id));
  let at = 9 * 60 + 30;
  const order: Plan["order"] = [];
  for (const t of sorted.filter((x) => !skip.has(x.id))) {
    const mins = estimate(t);
    if (at < 13 * 60 && at + mins > 13 * 60) at = 14 * 60; // lunch
    const why =
      t.dueIn < 0
        ? `${-t.dueIn}d overdue; clear it before anything new`
        : t.priority === "P0"
          ? "P0, blocks revenue or a client go-live"
          : t.status === "Review"
            ? "Already in review, one push closes it"
            : t.dueIn === 0
              ? "Due today"
              : t.status === "In progress"
                ? "Half done, finish while the context is warm"
                : `Due ${dueText(t.dueIn)}, fits the afternoon block`;
    order.push({ task: t, at: clock(at), mins, why });
    at += mins + 15;
  }
  return { order, delegate, minutes: order.reduce((a, o) => a + o.mins, 0) };
}

function aiGuess(title: string): Partial<Pick<Task, "area" | "owner" | "priority">> & { dueIn?: number } {
  const s = title.toLowerCase();
  const out: Partial<Pick<Task, "area" | "owner" | "priority">> & { dueIn?: number } = {};
  if (/gst|tds|invoice|razorpay|settle|payment|reconcil|milestone/.test(s)) Object.assign(out, { area: "Finance", owner: "sahil" });
  else if (/ad |ads|creative|cpl|reel|campaign|testimonial|case study/.test(s)) Object.assign(out, { area: "Marketing", owner: "meera" });
  else if (/student|batch|recording|uat|build|fix|deploy|blueprint|onboard/.test(s)) Object.assign(out, { area: "Delivery", owner: /student|batch|recording/.test(s) ? "priya" : "vikram" });
  else if (/lead|call|demo|proposal|emi|follow|close/.test(s)) Object.assign(out, { area: "Sales", owner: /qualif|new lead/.test(s) ? "imran" : "sneha" });
  else if (/zoom|licence|hire|vendor|office|renew/.test(s)) Object.assign(out, { area: "Ops", owner: "aditya" });
  if (/urgent|today|asap|overdue|blocked|go-?live/.test(s)) Object.assign(out, { priority: "P0", dueIn: 0 });
  else if (/tomorrow/.test(s)) Object.assign(out, { priority: "P1", dueIn: 1 });
  else if (/next week|someday|later/.test(s)) Object.assign(out, { priority: "P3", dueIn: 7 });
  return out;
}

type DueFilter = "all" | "overdue" | "today" | "week";
type View = "board" | "list" | "people";

/* ---------------- module ---------------- */

export default function TaskManager() {
  const hq = useHQ();
  const { tasks, me } = hq;
  const [view, setView] = React.useState<View>("board");
  const [owner, setOwner] = React.useState("all");
  const [area, setArea] = React.useState("all");
  const [priority, setPriority] = React.useState("all");
  const [due, setDue] = React.useState<DueFilter>("all");
  const [mine, setMine] = React.useState(false);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [bulkReassign, setBulkReassign] = React.useState<string[] | null>(null);
  const [comments, setComments] = React.useState<Record<string, Comment[]>>({});
  const [trail, setTrail] = React.useState<Record<string, Trail[]>>({});
  const [plan, setPlan] = React.useState<{ state: "idle" | "thinking" | "done"; step: number; data?: Plan; meId?: string }>({ state: "idle", step: 0 });
  const timers = React.useRef<number[]>([]);
  React.useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const commentsFor = (t: Task) => comments[t.id] ?? seedComments(t);
  const trailFor = (t: Task) => trail[t.id] ?? seedTrail(t);
  function track(t: Task, text: string) {
    setTrail((cur) => ({ ...cur, [t.id]: [{ id: `${t.id}-x${Object.keys(cur).length}-${(cur[t.id] ?? []).length}`, who: me.id, at: `Today, ${stamp()}`, text }, ...(cur[t.id] ?? seedTrail(t))] }));
  }

  function patch(t: Task, p: Partial<Task>, what?: string) {
    const next = { ...p };
    if (p.dueIn !== undefined) next.due = dueText(p.dueIn);
    hq.updateTask(t.id, next);
    if (what) track(t, what);
  }
  function setStatus(t: Task, s: TaskStatus) {
    if (t.status === s) return;
    patch(t, { status: s }, `moved to ${s}`);
    hq.log(`${s === "Done" ? "completed" : `moved to ${s}`}: "${t.title}"`, s === "Done" ? "ok" : "info");
    if (s === "Done") toast.success("Task done", { description: `${t.title} · +10 points to ${personById[t.owner]?.first}` });
  }
  function reassign(t: Task, to: string, why?: string) {
    if (t.owner === to) return;
    patch(t, { owner: to }, `reassigned from ${personById[t.owner]?.first} to ${personById[to]?.first}`);
    hq.log(`reassigned "${t.title}" to ${personById[to].first}`, "info");
    hq.notify({ kind: "task", title: `${me.first} handed you a task`, body: why ? `${t.title}. ${why}` : t.title, href: "/hq/tasks" }, { toast: false });
    toast.success(`Reassigned to ${personById[to].first}`, { description: t.title });
  }

  /* filtering */
  const filtered = tasks.filter((t) => {
    if (mine && t.owner !== me.id) return false;
    if (!mine && owner !== "all" && t.owner !== owner) return false;
    if (area !== "all" && t.area !== area) return false;
    if (priority !== "all" && t.priority !== priority) return false;
    if (due === "overdue" && !(t.dueIn < 0 && isOpen(t))) return false;
    if (due === "today" && t.dueIn !== 0) return false;
    if (due === "week" && !(t.dueIn >= 0 && t.dueIn <= 6)) return false;
    return true;
  });
  const open = tasks.filter(isOpen);
  const overdue = open.filter((t) => t.dueIn < 0).sort((a, b) => a.dueIn - b.dueIn || PRI_RANK[a.priority] - PRI_RANK[b.priority]);
  const dueToday = open.filter((t) => t.dueIn === 0);
  const done = tasks.filter((t) => t.status === "Done");
  const active = (mine ? 1 : 0) + (owner !== "all" ? 1 : 0) + (area !== "all" ? 1 : 0) + (priority !== "all" ? 1 : 0) + (due !== "all" ? 1 : 0);
  const current = openId ? tasks.find((t) => t.id === openId) ?? null : null;

  function runPlan() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setPlan({ state: "thinking", step: 0 });
    [1, 2, 3].forEach((s) => timers.current.push(window.setTimeout(() => setPlan((p) => ({ ...p, step: s })), s * 420)));
    timers.current.push(
      window.setTimeout(() => {
        setPlan({ state: "done", step: 4, data: buildPlan(tasks, me.id), meId: me.id });
        hq.log("asked the planner to order today's work", "accent");
      }, 1700),
    );
  }

  const planSteps = ["Reading your open tasks and due dates", "Checking teammates' load", "Estimating time per task", "Ordering by impact and urgency"];

  return (
    <div>
      <PageHeader
        kicker="Operations"
        title="Task Manager"
        sub={`${open.length} open across ${new Set(open.map((t) => t.owner)).size} people. ${overdue.length} overdue, ${dueToday.length} due today.`}
        actions={
          <>
            <Btn icon={Wand2} onClick={runPlan}>
              Plan my day
            </Btn>
            <Btn variant="solid" icon={Plus} onClick={() => setCreating(true)}>
              New task
            </Btn>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Metric label="Open" value={open.length} hint={`${open.filter((t) => t.priority === "P0").length} at P0`} />
        <Metric label="Due today" value={dueToday.length} hint="across the team" onClick={() => { setDue("today"); setView("list"); }} />
        <Metric label="Overdue" value={overdue.length} delta={overdue.length ? `${overdue.reduce((a, t) => a - t.dueIn, 0)}d total` : undefined} good={false} hint="click to filter" onClick={() => { setDue("overdue"); setView("list"); }} />
        <Metric label="Done this week" value={done.length} hint={`${done.length * 10} points earned`} />
        <Metric label="On-time rate" value={`${Math.round(((tasks.length - overdue.length) / Math.max(1, tasks.length)) * 100)}%`} hint="target 90%" />
        <Metric label="Drafted by agents" value={tasks.filter((t) => t.aiDrafted).length} hint="from briefs and call notes" />
      </div>

      {overdue.length > 0 && (
        <div className="desk-rise mt-4 overflow-hidden rounded-[16px] border border-[color-mix(in_oklab,var(--d-late)_30%,var(--d-line))] bg-[color-mix(in_oklab,var(--d-late)_5%,var(--d-panel))]">
          <div className="flex items-center gap-2 px-4 pt-3">
            <AlarmClock className="h-4 w-4 text-d-late" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-d-late">Overdue · {overdue.length}</p>
            <span className="ml-auto text-[12px] text-d-mute">Oldest first</span>
          </div>
          <div className="desk-scroll flex gap-2.5 overflow-x-auto px-4 pb-3 pt-2.5">
            {overdue.map((t) => (
              <div key={t.id} className="flex w-[290px] shrink-0 flex-col rounded-[12px] border border-d-line bg-d-panel p-3">
                <button type="button" onClick={() => setOpenId(t.id)} className="text-left">
                  <p className="flex items-center gap-1.5">
                    <Pill tone="late" mono>
                      {-t.dueIn}d late
                    </Pill>
                    <Pill tone={PRI_TONE[t.priority]} mono>
                      {t.priority}
                    </Pill>
                  </p>
                  <p className="mt-1.5 line-clamp-1 text-[13px] font-medium">{t.title}</p>
                </button>
                <div className="mt-2 flex items-center gap-1.5">
                  <PersonChip id={t.owner} />
                  <span className="ml-auto flex gap-1">
                    <Btn size="sm" variant="ghost" onClick={() => { patch(t, { dueIn: 1 }, "due moved to tomorrow"); toast(`Moved to tomorrow`, { description: t.title }); }}>
                      +1d
                    </Btn>
                    <Btn
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        hq.notify({ kind: "task", title: `Nudge from ${me.first}`, body: `"${t.title}" is ${-t.dueIn} days overdue. Can you close it today?`, href: "/hq/tasks" }, { toast: false });
                        hq.log(`nudged ${personById[t.owner].first} on "${t.title}"`, "warn");
                        toast(`Nudged ${personById[t.owner].first}`, { description: "Sent on HQ and WhatsApp" });
                      }}
                    >
                      Nudge
                    </Btn>
                    <Btn size="sm" variant="soft" icon={Check} onClick={() => setStatus(t, "Done")} aria-label="Mark done" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {plan.state !== "idle" && (
        <PlanPanel
          plan={plan}
          steps={planSteps}
          onClose={() => setPlan({ state: "idle", step: 0 })}
          onOpen={(id) => setOpenId(id)}
          onReassign={(t, to, why) => reassign(t, to, why)}
          tasks={tasks}
          meFirst={me.first}
          onStart={(t) => setStatus(t, "In progress")}
        />
      )}

      {/* filter bar */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Segmented
          options={[
            { value: "board", label: <span className="inline-flex items-center gap-1.5"><Columns3 className="h-3.5 w-3.5" />Board</span> },
            { value: "list", label: <span className="inline-flex items-center gap-1.5"><Table2 className="h-3.5 w-3.5" />List</span> },
            { value: "people", label: <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />By person</span> },
          ]}
          value={view}
          onChange={setView}
        />
        <span className="mx-1 hidden h-6 w-px bg-d-line sm:block" />
        <button
          type="button"
          onClick={() => setMine((m) => !m)}
          className={cn("inline-flex h-9 items-center gap-1.5 rounded-[8px] border px-3 text-[13px] font-medium", mine ? "border-d-accent bg-d-accent text-d-accent-ink" : "border-d-line bg-d-panel hover:bg-d-sunk")}
        >
          <UserRound className="h-3.5 w-3.5" /> Mine
          <span className="font-mono text-[11px] opacity-75">{tasks.filter((t) => t.owner === me.id && isOpen(t)).length}</span>
        </button>
        <FilterSelect label="Owner" value={mine ? me.id : owner} onChange={(v) => { setMine(false); setOwner(v); }} options={team.map((p) => ({ value: p.id, label: p.name }))} />
        <FilterSelect label="Area" value={area} onChange={setArea} options={AREAS.map((a) => ({ value: a, label: a }))} />
        <FilterSelect label="Priority" value={priority} onChange={setPriority} options={PRIORITIES.map((p) => ({ value: p, label: p }))} />
        <Segmented
          size="sm"
          options={[
            { value: "all", label: "Any due" },
            { value: "overdue", label: "Overdue", count: overdue.length },
            { value: "today", label: "Today", count: tasks.filter((t) => t.dueIn === 0).length },
            { value: "week", label: "This week" },
          ]}
          value={due}
          onChange={setDue}
        />
        {active > 0 && (
          <Btn size="sm" variant="ghost" onClick={() => { setMine(false); setOwner("all"); setArea("all"); setPriority("all"); setDue("all"); }}>
            Clear {active} filter{active > 1 ? "s" : ""}
          </Btn>
        )}
        <span className="ml-auto font-mono text-[12px] text-d-mute">{filtered.length} shown</span>
      </div>

      <div className="mt-4">
        {view === "board" && (
          <Panel bodyClassName="p-5">
            <Board
              columns={[
                { id: "Todo", label: "To do", tone: "neutral" },
                { id: "In progress", label: "In progress", tone: "info", limit: 10 },
                { id: "Review", label: "Review", tone: "warn", limit: 6 },
                { id: "Done", label: "Done", tone: "ok" },
              ]}
              items={[...filtered].sort((a, b) => PRI_RANK[a.priority] - PRI_RANK[b.priority] || a.dueIn - b.dueIn)}
              itemKey={(t) => t.id}
              getColumn={(t) => t.status}
              onMove={(id, col) => {
                const t = tasks.find((x) => x.id === id);
                if (t) setStatus(t, col as TaskStatus);
              }}
              renderCard={(t) => <TaskCard t={t} onOpen={() => setOpenId(t.id)} comments={commentsFor(t).length} />}
              minColumnWidth={250}
            />
          </Panel>
        )}
        {view === "list" && (
          <Panel bodyClassName="p-5">
            <ListView
              rows={filtered}
              onRow={(t) => setOpenId(t.id)}
              bulk={[
                { label: "Mark done", run: (keys) => { keys.forEach((k) => { const t = tasks.find((x) => x.id === k); if (t) patch(t, { status: "Done" }, "marked done (bulk)"); }); hq.log(`closed ${keys.length} tasks in bulk`, "ok"); toast.success(`${keys.length} tasks done`); } },
                { label: "Start", run: (keys) => { keys.forEach((k) => { const t = tasks.find((x) => x.id === k); if (t) patch(t, { status: "In progress" }, "started (bulk)"); }); toast(`${keys.length} tasks started`); } },
                { label: "Push +1 day", run: (keys) => { keys.forEach((k) => { const t = tasks.find((x) => x.id === k); if (t) patch(t, { dueIn: t.dueIn < 0 ? 1 : t.dueIn + 1 }, "due pushed a day (bulk)"); }); toast(`${keys.length} due dates moved`); } },
                { label: "Raise to P0", run: (keys) => { keys.forEach((k) => { const t = tasks.find((x) => x.id === k); if (t) patch(t, { priority: "P0" }, "priority raised to P0 (bulk)"); }); toast(`${keys.length} tasks now P0`); } },
                { label: "Reassign…", run: (keys) => setBulkReassign(keys) },
              ]}
            />
          </Panel>
        )}
        {view === "people" && <PeopleView tasks={filtered} all={tasks} onOpen={(id) => setOpenId(id)} onReassign={reassign} />}
      </div>

      {current && (
        <TaskSheet
          t={current}
          onClose={() => setOpenId(null)}
          comments={commentsFor(current)}
          trail={trailFor(current)}
          onStatus={(s) => setStatus(current, s)}
          onPatch={(p, what) => patch(current, p, what)}
          onReassign={(to) => reassign(current, to)}
          onComment={(text) => {
            setComments((cur) => ({ ...cur, [current.id]: [...(cur[current.id] ?? seedComments(current)), { id: `${current.id}-n${(cur[current.id] ?? []).length + 9}`, who: me.id, at: `Today, ${stamp()}`, text }] }));
            track(current, "commented");
            if (current.owner !== me.id) hq.notify({ kind: "task", title: `${me.first} commented on your task`, body: `${current.title}: ${text}`, href: "/hq/tasks" }, { toast: false });
          }}
        />
      )}

      <CreateModal
        open={creating}
        onOpenChange={setCreating}
        meId={me.id}
        onCreate={(draft) => {
          const t = hq.addTask(draft);
          hq.log(`assigned "${t.title}" to ${personById[t.owner].first}`, "info");
          if (t.owner !== me.id) hq.notify({ kind: "task", title: `New task for ${personById[t.owner].first}`, body: t.title, href: "/hq/tasks" }, { toast: false });
          toast.success("Task created", { description: `${t.title} · ${personById[t.owner].first} · ${t.due}` });
        }}
      />

      <Modal open={!!bulkReassign} onOpenChange={(o) => !o && setBulkReassign(null)} title={`Reassign ${bulkReassign?.length ?? 0} tasks`} sub="Owners are notified on HQ and WhatsApp.">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {team.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                (bulkReassign ?? []).forEach((k) => {
                  const t = tasks.find((x) => x.id === k);
                  if (t) reassign(t, p.id);
                });
                setBulkReassign(null);
              }}
              className="flex items-center gap-2 rounded-[10px] border border-d-line px-2.5 py-2 text-left hover:border-d-accent hover:bg-d-sunk"
            >
              <PersonAvatar id={p.id} size={26} />
              <span className="min-w-0">
                <span className="block truncate text-[12.5px] font-medium">{p.first}</span>
                <span className="block font-mono text-[10.5px] text-d-mute">load {loadOf(tasks, p.id)}</span>
              </span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}

/* ---------------- pieces ---------------- */

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className={cn("relative inline-flex h-9 items-center rounded-[8px] border bg-d-panel pl-3 text-[13px]", value !== "all" ? "border-d-accent" : "border-d-line")}>
      <span className="text-d-mute">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-full cursor-pointer appearance-none bg-transparent pl-1.5 pr-3 font-medium outline-none">
        <option value="all">All</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TaskCard({ t, onOpen, comments }: { t: Task; onOpen: () => void; comments: number }) {
  const subs = t.subtasks ?? [];
  const doneSubs = subs.filter((s) => s.done).length;
  return (
    <div role="button" tabIndex={0} onClick={onOpen} onKeyDown={(e) => e.key === "Enter" && onOpen()} className="cursor-pointer outline-none">
      <div className="flex items-center gap-1.5 pr-4">
        <Pill tone={PRI_TONE[t.priority]} mono>
          {t.priority}
        </Pill>
        <span className="font-mono text-[10.5px] text-d-mute">{t.id}</span>
        {t.aiDrafted && <AIMark label="Drafted" className="ml-auto" />}
      </div>
      <p className={cn("mt-2 text-[13.5px] font-medium leading-snug", t.status === "Done" && "text-d-mute line-through decoration-d-line")}>{t.title}</p>
      {subs.length > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <Meter value={doneSubs} max={subs.length} height={4} tone={doneSubs === subs.length ? "ok" : "accent"} />
          <span className="shrink-0 font-mono text-[10.5px] text-d-mute">
            {doneSubs}/{subs.length}
          </span>
        </div>
      )}
      <div className="mt-2.5 flex items-center gap-2 text-[11.5px]">
        <PersonAvatar id={t.owner} size={22} />
        <span className="text-d-mute">{t.area}</span>
        {comments > 0 && (
          <span className="inline-flex items-center gap-0.5 text-d-mute">
            <MessageSquare className="h-3 w-3" />
            {comments}
          </span>
        )}
        <span className="ml-auto font-mono text-[11px] font-medium" style={{ color: dueTone(t) === "neutral" ? "var(--d-mute)" : `var(--d-${dueTone(t)})` }}>
          {t.status === "Done" ? "Closed" : dueText(t.dueIn)}
        </span>
      </div>
    </div>
  );
}

function ListView({ rows, onRow, bulk }: { rows: Task[]; onRow: (t: Task) => void; bulk: { label: string; run: (keys: string[]) => void }[] }) {
  const columns: Column<Task>[] = [
    { key: "id", label: "ID", render: (t) => <span className="font-mono text-[11.5px] text-d-mute">{t.id}</span>, sort: (t) => idNum(t.id), wide: true },
    {
      key: "title",
      label: "Task",
      render: (t) => (
        <span className="flex items-center gap-2">
          <span className={cn("font-medium", t.status === "Done" && "text-d-mute line-through")}>{t.title}</span>
          {t.aiDrafted && <Sparkles className="h-3 w-3 shrink-0 text-[var(--d-gold)]" />}
        </span>
      ),
      sort: (t) => t.title,
    },
    { key: "owner", label: "Owner", render: (t) => <PersonChip id={t.owner} />, sort: (t) => personById[t.owner]?.first ?? "" },
    { key: "area", label: "Area", render: (t) => <span className="text-d-mute">{t.area}</span>, sort: (t) => t.area, wide: true },
    { key: "pri", label: "Priority", render: (t) => <Pill tone={PRI_TONE[t.priority]} mono>{t.priority}</Pill>, sort: (t) => PRI_RANK[t.priority] },
    { key: "status", label: "Status", render: (t) => <Pill tone={STATUS_TONE[t.status]}>{t.status}</Pill>, sort: (t) => STATUSES.indexOf(t.status) },
    {
      key: "due",
      label: "Due",
      render: (t) => (
        <span className="font-mono text-[12px]" style={{ color: dueTone(t) === "neutral" ? undefined : `var(--d-${dueTone(t)})` }}>
          {dueText(t.dueIn)} <span className="text-d-mute">· {dueDate(t.dueIn)}</span>
        </span>
      ),
      sort: (t) => t.dueIn,
    },
    {
      key: "subs",
      label: "Subtasks",
      align: "right",
      wide: true,
      render: (t) => (t.subtasks?.length ? <span className="font-mono text-[11.5px] text-d-mute">{t.subtasks.filter((s) => s.done).length}/{t.subtasks.length}</span> : <span className="text-d-mute">–</span>),
      sort: (t) => t.subtasks?.length ?? 0,
    },
  ];
  return <DataTable rows={rows} columns={columns} rowKey={(t) => t.id} search={(t) => `${t.title} ${t.id} ${personById[t.owner]?.name} ${t.area}`} searchPlaceholder="Search tasks, people, IDs" onRow={onRow} pageSize={12} bulk={bulk} dense />;
}

function PeopleView({ tasks, all, onOpen, onReassign }: { tasks: Task[]; all: Task[]; onOpen: (id: string) => void; onReassign: (t: Task, to: string, why?: string) => void }) {
  const people = team
    .map((p) => {
      const list = tasks.filter((t) => t.owner === p.id && isOpen(t)).sort((a, b) => PRI_RANK[a.priority] - PRI_RANK[b.priority] || a.dueIn - b.dueIn);
      return { p, list, load: loadOf(all, p.id), overdue: list.filter((t) => t.dueIn < 0).length, done: all.filter((t) => t.owner === p.id && t.status === "Done").length };
    })
    .sort((a, b) => b.load - a.load);
  const heavy = people[0];
  const light = [...people].reverse().find((x) => x.p.role === heavy?.p.role && x.p.id !== heavy.p.id);
  const moveCandidate = heavy?.list.filter((t) => t.priority !== "P0" && !FOUNDER_ONLY.test(t.title)).slice(-1)[0];
  return (
    <div>
      {heavy && light && moveCandidate && heavy.load > CAPACITY * 0.6 && (
        <AgentNote
          className="mb-4"
          title={`${heavy.p.first} is at ${Math.round((heavy.load / CAPACITY) * 100)}% of capacity; ${light.p.first} is at ${Math.round((light.load / CAPACITY) * 100)}%`}
          action={
            <Btn size="sm" variant="solid" icon={ArrowRightLeft} onClick={() => onReassign(moveCandidate, light.p.id, "Rebalanced by the workload agent.")}>
              Move &ldquo;{moveCandidate.title.slice(0, 38)}
              {moveCandidate.title.length > 38 ? "…" : ""}&rdquo; to {light.p.first}
            </Btn>
          }
        >
          Same role, {heavy.load - light.load} load points apart. Moving one {moveCandidate.priority} task evens the week without touching anything client-facing that is due today.
        </AgentNote>
      )}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {people.map(({ p, list, load, overdue, done }) => {
          const pct = Math.round((load / CAPACITY) * 100);
          return (
            <section key={p.id} className="desk-card desk-rise p-4">
              <div className="flex items-center gap-3">
                <PersonAvatar id={p.id} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold">{p.name}</p>
                  <p className="truncate text-[12px] text-d-mute">{p.title}</p>
                </div>
                <div className="text-right">
                  <p className="tnum font-serif text-[24px] leading-none">{list.length}</p>
                  <p className="text-[10.5px] uppercase tracking-[0.14em] text-d-mute">open</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Meter value={load} max={CAPACITY} tone={pct > 100 ? "late" : pct > 75 ? "warn" : "ok"} />
                <span className="w-10 shrink-0 text-right font-mono text-[11px] text-d-mute">{pct}%</span>
              </div>
              <p className="mt-1.5 flex gap-3 text-[11.5px] text-d-mute">
                <span>
                  load <b className="font-mono text-d-ink">{load}</b>/{CAPACITY}
                </span>
                {overdue > 0 && <span className="text-d-late">{overdue} overdue</span>}
                <span>{done} done</span>
              </p>
              <ul className="mt-3 space-y-1 border-t border-d-line pt-2.5">
                {list.slice(0, 4).map((t) => (
                  <li key={t.id}>
                    <button type="button" onClick={() => onOpen(t.id)} className="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left text-[12.5px] hover:bg-d-sunk">
                      <Pill tone={PRI_TONE[t.priority]} mono>
                        {t.priority}
                      </Pill>
                      <span className="min-w-0 flex-1 truncate">{t.title}</span>
                      <span className="shrink-0 font-mono text-[10.5px]" style={{ color: dueTone(t) === "neutral" ? "var(--d-mute)" : `var(--d-${dueTone(t)})` }}>
                        {dueText(t.dueIn)}
                      </span>
                    </button>
                  </li>
                ))}
                {list.length === 0 && <li className="px-1 py-1 text-[12px] text-d-mute">Nothing open in this filter.</li>}
                {list.length > 4 && <li className="px-1 text-[11.5px] text-d-mute">+{list.length - 4} more</li>}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function PlanPanel({
  plan,
  steps,
  onClose,
  onOpen,
  onReassign,
  onStart,
  tasks,
  meFirst,
}: {
  plan: { state: "idle" | "thinking" | "done"; step: number; data?: Plan; meId?: string };
  steps: string[];
  onClose: () => void;
  onOpen: (id: string) => void;
  onReassign: (t: Task, to: string, why: string) => void;
  onStart: (t: Task) => void;
  tasks: Task[];
  meFirst: string;
}) {
  const [handed, setHanded] = React.useState<Set<string>>(new Set());
  const d = plan.data;
  return (
    <section className="desk-rise mt-4 rounded-[18px] border border-[color-mix(in_oklab,var(--d-gold)_35%,var(--d-line))] bg-[color-mix(in_oklab,var(--d-gold)_6%,var(--d-panel))] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2">
            <AIMark label="Day planner" />
            {plan.state === "done" && d && <span className="font-mono text-[11.5px] text-d-mute">{d.order.length} tasks · {Math.floor(d.minutes / 60)}h {d.minutes % 60}m focused · {d.delegate.length} to hand off</span>}
          </p>
          <h3 className="mt-2 font-serif text-[22px] font-medium leading-tight">{plan.state === "done" ? `${meFirst}, here is today in order` : "Planning your day…"}</h3>
        </div>
        <Btn size="sm" variant="ghost" onClick={onClose}>
          Dismiss
        </Btn>
      </div>
      {plan.state === "thinking" && (
        <ul className="mt-3 space-y-1.5">
          {steps.map((s, i) => (
            <li key={s} className={cn("flex items-center gap-2 text-[13px] transition-opacity", i > plan.step && "opacity-35")}>
              {i < plan.step ? <Check className="h-3.5 w-3.5 text-d-ok" /> : <span className={cn("h-3.5 w-3.5 rounded-full border-2 border-[var(--d-gold)]", i === plan.step && "animate-spin border-t-transparent")} />}
              {s}
            </li>
          ))}
        </ul>
      )}
      {plan.state === "done" && d && (
        <div className="mt-4 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <SectionLabel>Order of work</SectionLabel>
            {d.order.length === 0 && <p className="text-[13px] text-d-mute">Nothing left on your plate. Everything open is either delegated or done.</p>}
            <ol className="space-y-1.5">
              {d.order.map((o, i) => {
                const live = tasks.find((t) => t.id === o.task.id) ?? o.task;
                return (
                  <li key={o.task.id} className="flex items-start gap-3 rounded-[12px] bg-d-panel px-3 py-2.5 shadow-[0_0_0_1px_var(--d-line)]">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-d-ink font-mono text-[11px] font-semibold text-d-paper">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <button type="button" onClick={() => onOpen(o.task.id)} className="block w-full truncate text-left text-[13.5px] font-medium hover:underline">
                        {live.title}
                      </button>
                      <p className="text-[12px] text-d-mute">{o.why}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-mono text-[12px] font-medium">{o.at}</p>
                      <p className="font-mono text-[10.5px] text-d-mute">{o.mins} min</p>
                    </div>
                    {live.status === "Todo" && i === 0 && (
                      <Btn size="sm" variant="soft" onClick={() => onStart(live)}>
                        Start
                      </Btn>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
          <div>
            <SectionLabel>Hand these off</SectionLabel>
            {d.delegate.length === 0 && <p className="text-[13px] text-d-mute">Everything on your list needs you. Nothing to delegate today.</p>}
            <ul className="space-y-2">
              {d.delegate.map((x) => {
                const done = handed.has(x.task.id);
                return (
                  <li key={x.task.id} className="rounded-[12px] bg-d-panel p-3 shadow-[0_0_0_1px_var(--d-line)]">
                    <p className="text-[13px] font-medium">{x.task.title}</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-d-mute">{x.why}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <PersonChip id={x.to} sub={personById[x.to].title} />
                      {done ? (
                        <Pill tone="ok" className="ml-auto">
                          <CheckCheck className="h-3 w-3" /> Handed to {personById[x.to].first}
                        </Pill>
                      ) : (
                        <Btn
                          size="sm"
                          variant="solid"
                          className="ml-auto"
                          icon={ArrowRightLeft}
                          onClick={() => {
                            onReassign(x.task, x.to, "Suggested by the day planner.");
                            setHanded((s) => new Set(s).add(x.task.id));
                          }}
                        >
                          Reassign
                        </Btn>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

function TaskSheet({
  t,
  onClose,
  comments,
  trail,
  onStatus,
  onPatch,
  onReassign,
  onComment,
}: {
  t: Task;
  onClose: () => void;
  comments: Comment[];
  trail: Trail[];
  onStatus: (s: TaskStatus) => void;
  onPatch: (p: Partial<Task>, what?: string) => void;
  onReassign: (to: string) => void;
  onComment: (text: string) => void;
}) {
  const [draft, setDraft] = React.useState("");
  const [newSub, setNewSub] = React.useState("");
  const [tab, setTab] = React.useState<"comments" | "activity">("comments");
  const subs = t.subtasks ?? [];
  const doneSubs = subs.filter((s) => s.done).length;
  const lastComment = comments[comments.length - 1];
  return (
    <Sheet
      open
      onOpenChange={(o) => !o && onClose()}
      width={560}
      eyebrow={`${t.id} · ${t.area}`}
      title={t.title}
      sub={`Owned by ${personById[t.owner]?.name} · due ${dueText(t.dueIn).toLowerCase()} (${dueDate(t.dueIn)})`}
      footer={
        <>
          {t.status !== "Done" ? (
            <Btn variant="solid" icon={Check} onClick={() => onStatus("Done")}>
              Mark done
            </Btn>
          ) : (
            <Btn onClick={() => onStatus("In progress")}>Reopen</Btn>
          )}
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <SectionLabel>Status</SectionLabel>
          <Segmented size="sm" options={STATUSES} value={t.status} onChange={onStatus} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Owner (reassign)">
            <select className={inputClass} value={t.owner} onChange={(e) => onReassign(e.target.value)}>
              {team.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Due">
            <select className={inputClass} value={t.dueIn} onChange={(e) => onPatch({ dueIn: Number(e.target.value) }, `due changed to ${dueText(Number(e.target.value)).toLowerCase()}`)}>
              {Array.from(new Set([t.dueIn, 0, 1, 2, 3, 5, 7, 14])).sort((a, b) => a - b).map((d) => (
                <option key={d} value={d}>
                  {dueText(d)} · {dueDate(d)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <select className={inputClass} value={t.priority} onChange={(e) => onPatch({ priority: e.target.value as Task["priority"] }, `priority set to ${e.target.value}`)}>
              {PRIORITIES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="Area">
            <select className={inputClass} value={t.area} onChange={(e) => onPatch({ area: e.target.value as Task["area"] }, `area set to ${e.target.value}`)}>
              {AREAS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </Field>
        </div>

        <AgentNote
          title="Where this stands"
          action={
            subs.length === 0 ? (
              <Btn size="sm" variant="solid" icon={Wand2} onClick={() => { onPatch({ subtasks: SUBTASK_TEMPLATES[t.area].map((s) => ({ title: s, done: false })) }, "AI broke it into subtasks"); toast("Broken into 4 subtasks", { description: t.title }); }}>
                Break into subtasks
              </Btn>
            ) : undefined
          }
        >
          {t.status === "Done"
            ? `Closed. ${personById[t.owner]?.first} earned 10 points for it.`
            : `${subs.length ? `${doneSubs} of ${subs.length} steps done. ` : ""}${t.dueIn < 0 ? `It is ${-t.dueIn} days late; ` : ""}${lastComment ? `last word from ${personById[lastComment.who]?.first ?? "the team"}: “${lastComment.text}” ` : ""}Next step: ${subs.find((s) => !s.done)?.title.toLowerCase() ?? (t.status === "Review" ? "get it reviewed and close" : "start and post an update by 5 PM")}.`}
        </AgentNote>

        <div>
          <SectionLabel action={subs.length > 0 && <span className="font-mono text-[11px] text-d-mute">{doneSubs}/{subs.length}</span>}>Subtasks</SectionLabel>
          {subs.length > 0 && <Meter value={doneSubs} max={subs.length} tone={doneSubs === subs.length ? "ok" : "accent"} className="mb-2" />}
          <ul className="space-y-0.5">
            {subs.map((s, i) => (
              <li key={`${s.title}-${i}`}>
                <button
                  type="button"
                  onClick={() => onPatch({ subtasks: subs.map((x, k) => (k === i ? { ...x, done: !x.done } : x)) }, `${s.done ? "reopened" : "ticked"} “${s.title}”`)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13px] hover:bg-d-sunk"
                >
                  <span className={cn("flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[5px] border", s.done ? "border-d-accent bg-d-accent text-white" : "border-d-line bg-d-panel")}>{s.done && <Check className="h-3 w-3" strokeWidth={3} />}</span>
                  <span className={cn(s.done && "text-d-mute line-through")}>{s.title}</span>
                </button>
              </li>
            ))}
          </ul>
          <form
            className="mt-1.5 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!newSub.trim()) return;
              onPatch({ subtasks: [...subs, { title: newSub.trim(), done: false }] }, `added subtask “${newSub.trim()}”`);
              setNewSub("");
            }}
          >
            <input className={cn(inputClass, "h-9")} value={newSub} onChange={(e) => setNewSub(e.target.value)} placeholder="Add a subtask" />
            <Btn type="submit" size="md" icon={Plus} aria-label="Add subtask" />
          </form>
        </div>

        <div>
          <Segmented size="sm" options={[{ value: "comments", label: "Comments", count: comments.length }, { value: "activity", label: "Activity", count: trail.length }]} value={tab} onChange={setTab} />
          {tab === "comments" ? (
            <div className="mt-3">
              <ul className="space-y-3">
                {comments.map((c) => (
                  <li key={c.id} className="flex gap-2.5">
                    <PersonAvatar id={c.who} size={26} />
                    <div className="min-w-0 flex-1 rounded-[12px] bg-d-sunk px-3 py-2">
                      <p className="text-[11.5px]">
                        <b className="font-semibold">{personById[c.who]?.first}</b> <span className="text-d-mute">· {c.at}</span>
                      </p>
                      <p className="mt-0.5 text-[13px] leading-snug">{c.text}</p>
                    </div>
                  </li>
                ))}
                {comments.length === 0 && <li className="text-[12.5px] text-d-mute">No comments yet.</li>}
              </ul>
              <form
                className="mt-3 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!draft.trim()) return;
                  onComment(draft.trim());
                  setDraft("");
                }}
              >
                <input className={cn(inputClass, "h-9")} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Comment, or @${personById[t.owner]?.first} for an update`} />
                <Btn type="submit" variant="solid" icon={Send} aria-label="Post comment" />
              </form>
            </div>
          ) : (
            <ol className="mt-3 space-y-2.5">
              {trail.map((a) => (
                <li key={a.id} className="flex items-start gap-2.5 text-[12.5px]">
                  <PersonAvatar id={a.who} size={22} />
                  <span className="min-w-0 flex-1">
                    <b className="font-medium">{a.who === "agent" ? "Agent" : personById[a.who]?.first}</b> {a.text}
                  </span>
                  <span className="shrink-0 font-mono text-[10.5px] text-d-mute">{a.at}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </Sheet>
  );
}

function CreateModal({ open, onOpenChange, meId, onCreate }: { open: boolean; onOpenChange: (o: boolean) => void; meId: string; onCreate: (t: Omit<Task, "id">) => void }) {
  const [title, setTitle] = React.useState("");
  const [owner, setOwner] = React.useState(meId);
  const [priority, setPriority] = React.useState<Task["priority"]>("P1");
  const [area, setArea] = React.useState<Task["area"]>("Ops");
  const [dueIn, setDueIn] = React.useState(1);
  const [withSubs, setWithSubs] = React.useState(true);
  const [guessed, setGuessed] = React.useState<string | null>(null);

  function autofill() {
    const g = aiGuess(title);
    if (g.area) setArea(g.area);
    if (g.owner) setOwner(g.owner);
    if (g.priority) setPriority(g.priority);
    if (g.dueIn !== undefined) setDueIn(g.dueIn);
    const parts = [g.area && `${g.area}`, g.owner && `owner ${personById[g.owner].first}`, g.priority && g.priority, g.dueIn !== undefined && dueText(g.dueIn).toLowerCase()].filter(Boolean);
    setGuessed(parts.length ? `Set ${parts.join(", ")} from the wording.` : "Couldn't infer much; defaults kept.");
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="New task" sub="Lands on the board and on the owner's My Today." width={600}>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          onCreate({ title: title.trim(), owner, priority, area, status: "Todo", dueIn, due: dueText(dueIn), subtasks: withSubs ? SUBTASK_TEMPLATES[area].map((s) => ({ title: s, done: false })) : undefined, aiDrafted: !!guessed });
          setTitle("");
          setGuessed(null);
          onOpenChange(false);
        }}
      >
        <Field label="Task">
          <div className="flex gap-2">
            <input autoFocus className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => title.trim().length > 8 && !guessed && autofill()} placeholder="e.g. Reconcile Razorpay settlements for 16 Oct, urgent" />
            <Btn icon={Sparkles} onClick={autofill} disabled={!title.trim()} className="h-10">
              Auto-fill
            </Btn>
          </div>
        </Field>
        {guessed && (
          <p className="flex items-center gap-2 text-[12.5px] text-d-mute">
            <AIMark /> {guessed}
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Owner">
            <select className={inputClass} value={owner} onChange={(e) => setOwner(e.target.value)}>
              {team.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Area">
            <select className={inputClass} value={area} onChange={(e) => setArea(e.target.value as Task["area"])}>
              {AREAS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <Segmented size="sm" options={PRIORITIES} value={priority} onChange={setPriority} />
          </Field>
          <Field label="Due">
            <select className={inputClass} value={dueIn} onChange={(e) => setDueIn(Number(e.target.value))}>
              {[0, 1, 2, 3, 5, 7, 14].map((d) => (
                <option key={d} value={d}>
                  {dueText(d)} · {dueDate(d)}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <label className="flex items-center gap-2 text-[13px]">
          <input type="checkbox" checked={withSubs} onChange={(e) => setWithSubs(e.target.checked)} className="h-4 w-4 accent-[var(--d-accent)]" />
          Add the standard {area.toLowerCase()} checklist as subtasks
          <ListChecks className="h-3.5 w-3.5 text-d-mute" />
        </label>
        <div className="flex items-center justify-between gap-2 border-t border-d-line pt-3">
          <span className="inline-flex items-center gap-1.5 text-[12px] text-d-mute">
            <CalendarClock className="h-3.5 w-3.5" /> {personById[owner]?.first} is notified on HQ and WhatsApp.
          </span>
          <div className="flex gap-2">
            <Btn onClick={() => onOpenChange(false)}>Cancel</Btn>
            <Btn type="submit" variant="solid" disabled={!title.trim()}>
              Create task
            </Btn>
          </div>
        </div>
      </form>
    </Modal>
  );
}
