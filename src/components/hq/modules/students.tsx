"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  CalendarPlus,
  Download,
  GraduationCap,
  MessageCircle,
  PlayCircle,
  Send,
  Sparkles,
  UserCog,
  Wand2,
} from "lucide-react";
import {
  AgentNote,
  AIMark,
  Bars,
  Btn,
  Checklist,
  DataTable,
  Donut,
  Feed,
  Field,
  HBars,
  HeatGrid,
  inputClass,
  KV,
  Meter,
  Metric,
  Modal,
  PageHeader,
  Panel,
  PersonAvatar,
  PersonChip,
  Pill,
  rupees,
  SearchBox,
  SectionLabel,
  Segmented,
  Sheet,
  type Column,
} from "../kit";
import type { Tone } from "../../desk/types";
import { useHQ } from "../store";
import { personById, programById, students as seedStudents } from "../data";
import type { ProgramId, Student } from "../types";

/* ---------------- constants ---------------- */

const COHORTS = ["Oct '26 · Batch 14", "Sep '26 · Batch 13", "Aug '26 · Batch 12", "Jul '26 · Batch 11"];
const COHORT_SHORT: Record<string, string> = { "Oct '26 · Batch 14": "Batch 14", "Sep '26 · Batch 13": "Batch 13", "Aug '26 · Batch 12": "Batch 12", "Jul '26 · Batch 11": "Batch 11" };
const PROGRAMS: ProgramId[] = ["workshop", "launchpad", "accelerator", "systems", "agents"];
const STATUSES: Student["status"][] = ["Active", "At risk", "Completed", "Paused"];
const COACHES = ["priya", "neha", "vikram"];
const STATUS_TONE: Record<Student["status"], Tone> = { Active: "info", "At risk": "late", Completed: "ok", Paused: "neutral" };
const PROGRAM_TONE: Record<ProgramId, Tone> = { workshop: "neutral", launchpad: "info", accelerator: "accent", systems: "warn", agents: "ok", dfy: "neutral" };
const ACCESS_LABEL: Record<keyof Student["access"], string> = { zoom: "Zoom webinar link", community: "Community (Circle)", portal: "Learning portal", blueprint: "Blueprint pack", whatsapp: "Cohort WhatsApp group" };

/** Live sessions per program; times are IST. */
const SESSIONS: Record<string, string[]> = {
  workshop: ["Day 1 · 7:00 PM IST", "Day 2 · 7:00 PM IST"],
  program: ["Wk 1 · Business OS map", "Wk 2 · Delegation", "Wk 3 · Sales system", "Wk 4 · AI follow-ups", "Wk 5 · Dashboards", "Wk 6 · Hiring SOPs", "Wk 7 · Agents", "Wk 8 · Demo day"],
};
const HELD: Record<string, number> = { "Oct '26 · Batch 14": 2, "Sep '26 · Batch 13": 5, "Aug '26 · Batch 12": 8, "Jul '26 · Batch 11": 8 };

function hash(n: number, salt = 7) {
  let t = Math.imul(n + 1, 0x9e3779b1) ^ Math.imul(salt + 3, 0x85ebca6b);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const idx = (s: Student) => Number(s.id.slice(2)) - 10421;

function sessionsFor(s: Student) {
  const list = s.program === "workshop" ? SESSIONS.workshop : SESSIONS.program;
  const held = s.program === "workshop" ? 2 : HELD[s.cohort];
  return list.map((name, i) => {
    const date = s.program === "workshop" ? `${["13", "14"][i]} ${COHORT_SHORT[s.cohort] === "Batch 14" ? "Oct" : COHORT_SHORT[s.cohort] === "Batch 13" ? "Sep" : COHORT_SHORT[s.cohort] === "Batch 12" ? "Aug" : "Jul"}` : `Wed, 8:00 PM IST`;
    if (i >= held) return { name, date, state: "upcoming" as const };
    const present = hash(idx(s) * 13 + i, 91) * 100 < s.attendance;
    return { name, date, state: present ? ("present" as const) : ("missed" as const) };
  });
}

function lastLogin(s: Student) {
  return s.status === "At risk" ? 6 + Math.floor(hash(idx(s), 92) * 12) : Math.floor(hash(idx(s), 92) * 4);
}

function emis(s: Student) {
  if (s.due <= 0) return [];
  const n = s.due > 60000 ? 4 : 3;
  const each = Math.round(s.due / n);
  const overdue = hash(idx(s), 93) > 0.55;
  const dates = overdue ? ["5 Oct", "5 Nov", "5 Dec", "5 Jan"] : ["25 Oct", "25 Nov", "25 Dec", "25 Jan"];
  return Array.from({ length: n }, (_, i) => ({ no: i + 1, date: dates[i], amount: i === n - 1 ? s.due - each * (n - 1) : each, state: i === 0 && overdue ? "Overdue" : "Upcoming" }));
}

function riskReasons(s: Student) {
  const r: string[] = [];
  const sess = sessionsFor(s);
  const missedLast = sess.filter((x) => x.state !== "upcoming").slice(-2).filter((x) => x.state === "missed").length;
  if (missedLast) r.push(missedLast === 2 ? "missed the last 2 live sessions" : "missed the last session");
  r.push(`attendance ${s.attendance}%`);
  const ll = lastLogin(s);
  if (ll > 5) r.push(`no portal login in ${ll} days`);
  const e = emis(s)[0];
  if (e) r.push(`EMI ${rupees(e.amount)} ${e.state === "Overdue" ? "overdue since" : "due"} ${e.date}`);
  return r;
}

function nudge(s: Student) {
  const first = s.name.split(" ")[0];
  const sess = sessionsFor(s).filter((x) => x.state === "missed").slice(-1)[0];
  const coach = personById[s.coach]?.first ?? "Priya";
  const e = emis(s)[0];
  return `Namaste ${first} ji 🙏 ${sess ? `"${sess.name.startsWith("Day") ? sess.name.split(" · ")[0] : sess.name.split(" · ")[1]}" wali session miss ho gayi thi` : "Aapki kami mehsoos hui"} — recording yahan hai: buildbiz.ai/r/${s.id.toLowerCase()}. Sirf 20 minute ka exercise hai, ${s.business} ke liye delegation map bana lijiye. ${coach} aapko Thursday 7 PM IST call ${coach === "Vikram" ? "karenge" : "karengi"}.${e?.state === "Overdue" ? ` EMI ka payment link bhi bhej rahe hain.` : ""} Koi dikkat ho toh yahin reply kariye.`;
}

/* ---------------- smart search ---------------- */

type Filters = { program: ProgramId | "all"; cohort: string; status: Student["status"] | "all"; coach: string; dues: boolean };
const NO_FILTERS: Filters = { program: "all", cohort: "all", status: "all", coach: "all", dues: false };

/** Turns "at risk in batch 13 with dues" into filters plus a leftover search term. */
function interpret(q: string): { filters: Partial<Filters>; rest: string; chips: string[] } | null {
  const text = q.toLowerCase();
  const filters: Partial<Filters> = {};
  const chips: string[] = [];
  let rest = text;
  const take = (re: RegExp) => {
    rest = rest.replace(re, " ");
  };
  if (/at[- ]?risk/.test(text)) {
    filters.status = "At risk";
    chips.push("Status: At risk");
    take(/at[- ]?risk/g);
  } else if (/completed|graduat/.test(text)) {
    filters.status = "Completed";
    chips.push("Status: Completed");
    take(/completed|graduated?/g);
  } else if (/paused/.test(text)) {
    filters.status = "Paused";
    chips.push("Status: Paused");
    take(/paused/g);
  }
  const b = text.match(/batch\s*(1[1-4])/);
  if (b) {
    const c = COHORTS.find((x) => x.endsWith(`Batch ${b[1]}`));
    if (c) {
      filters.cohort = c;
      chips.push(`Cohort: Batch ${b[1]}`);
      take(/batch\s*1[1-4]/g);
    }
  }
  for (const p of PROGRAMS) {
    const name = programById[p].short.toLowerCase();
    if (text.includes(name) || (p === "agents" && text.includes("agent factory"))) {
      filters.program = p;
      chips.push(`Program: ${programById[p].short}`);
      take(new RegExp(name, "g"));
    }
  }
  if (/\b(dues?|emi|owes?|pending payment|balance)\b/.test(text)) {
    filters.dues = true;
    chips.push("Has dues");
    take(/\b(with|has|have)?\s*(dues?|emi|owes?|pending payment|balance)\b/g);
  }
  for (const c of COACHES) {
    if (new RegExp(`\\b${c}('s)?\\b`).test(text)) {
      filters.coach = c;
      chips.push(`Coach: ${personById[c].first}`);
      take(new RegExp(`\\b${c}('s)?\\b`, "g"));
    }
  }
  if (!chips.length) return null;
  rest = rest.replace(/\b(in|with|from|and|students?|who|are|show|me|all|the|of|coached|by|coach)\b/g, " ").replace(/\s+/g, " ").trim();
  return { filters, rest, chips };
}

function matches(s: Student, needle: string) {
  if (!needle) return true;
  const digits = needle.replace(/\D/g, "");
  if (digits.length >= 3 && s.phone.replace(/\D/g, "").includes(digits)) return true;
  const hay = `${s.name} ${s.business} ${s.email} ${s.city} ${s.cohort} ${s.industry} ${s.id}`.toLowerCase();
  return needle.split(/\s+/).every((w) => hay.includes(w));
}

function Hi({ text, q }: { text: string; q: string }) {
  const w = q.trim().split(/\s+/).filter((x) => x.length > 1)[0];
  if (!w) return <>{text}</>;
  const i = text.toLowerCase().indexOf(w.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-[3px] bg-[color-mix(in_oklab,var(--d-gold)_30%,transparent)] px-0.5 text-d-ink">{text.slice(i, i + w.length)}</mark>
      {text.slice(i + w.length)}
    </>
  );
}

/* ---------------- extras kept per student ---------------- */

type Extra = { notes: { at: string; by: string; text: string }[]; timeline: { time: string; who?: string; text: string; tone?: Tone }[]; accessUntil?: string; recordingSent?: boolean; nudged?: boolean };

function seedTimeline(s: Student): Extra["timeline"] {
  const items: Extra["timeline"] = [
    { time: s.joined, who: "Razorpay", text: `Enrolled in ${programById[s.program].short}, paid ${rupees(s.paid)}`, tone: "ok" },
    { time: s.joined, who: "Onboarding agent", text: "Sent Zoom link, portal invite and the cohort WhatsApp group", tone: "accent" },
  ];
  if (s.status === "At risk") items.unshift({ time: "Yesterday", who: "Engagement agent", text: `Flagged at risk: ${riskReasons(s).slice(0, 2).join(", ")}`, tone: "late" });
  if (s.status === "Completed") items.unshift({ time: "Last week", who: personById[s.coach]?.first, text: "Completed the program and submitted the Business OS map", tone: "ok" });
  if (s.due > 0) items.unshift({ time: "3 days ago", who: "Collections agent", text: `EMI reminder sent on WhatsApp for ${rupees(emis(s)[0]?.amount ?? 0)}`, tone: "warn" });
  return items;
}

/* ============================================================ */

export default function StudentSearch() {
  const hq = useHQ();
  const [list, setList] = React.useState<Student[]>(seedStudents);
  const [extra, setExtra] = React.useState<Record<string, Extra>>({});
  const [query, setQuery] = React.useState("");
  const [filters, setFilters] = React.useState<Filters>(NO_FILTERS);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [cohortPick, setCohortPick] = React.useState<string | null>(null);
  const searchRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement;
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(el.tagName)) {
        e.preventDefault();
        searchRef.current?.querySelector("input")?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const open = params.get("open");
    const t = window.setTimeout(() => {
      if (q) setQuery(q);
      if (open) setOpenId(open);
    }, 0);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, []);

  const ai = interpret(query);
  const eff: Filters = ai ? { ...filters, ...ai.filters } : filters;
  const needle = (ai ? ai.rest : query).trim().toLowerCase();
  const rows = list.filter(
    (s) =>
      matches(s, needle) &&
      (eff.program === "all" || s.program === eff.program) &&
      (eff.cohort === "all" || s.cohort === eff.cohort) &&
      (eff.status === "all" || s.status === eff.status) &&
      (eff.coach === "all" || s.coach === eff.coach) &&
      (!eff.dues || s.due > 0),
  );
  const open = list.find((s) => s.id === openId) ?? null;
  const filtered = JSON.stringify(filters) !== JSON.stringify(NO_FILTERS) || query;

  function patch(id: string, p: Partial<Student>) {
    setList((cur) => cur.map((s) => (s.id === id ? { ...s, ...p } : s)));
  }
  function addEvent(id: string, text: string, tone: Tone = "info", who = hq.me.first) {
    setExtra((cur) => {
      const s = list.find((x) => x.id === id);
      const base = cur[id] ?? { notes: [], timeline: s ? seedTimeline(s) : [] };
      return { ...cur, [id]: { ...base, timeline: [{ time: "Just now", who, text, tone }, ...base.timeline] } };
    });
  }
  function patchExtra(id: string, p: Partial<Extra>) {
    setExtra((cur) => {
      const s = list.find((x) => x.id === id);
      const base = cur[id] ?? { notes: [], timeline: s ? seedTimeline(s) : [] };
      return { ...cur, [id]: { ...base, ...p } };
    });
  }

  const actions = {
    sendRecording(ids: string[]) {
      ids.forEach((id) => {
        patchExtra(id, { recordingSent: true });
        addEvent(id, "Sent the latest session recording on WhatsApp", "info");
      });
      hq.log(`sent session recordings to ${ids.length} student${ids.length > 1 ? "s" : ""}`, "info");
      toast.success(`Recording sent to ${ids.length} student${ids.length > 1 ? "s" : ""}`, { description: "WhatsApp from the delivery number, with the portal link" });
    },
    markRisk(ids: string[]) {
      ids.forEach((id) => {
        patch(id, { status: "At risk" });
        addEvent(id, "Marked at risk", "late");
      });
      hq.notify({ kind: "student", title: `${ids.length} student${ids.length > 1 ? "s" : ""} marked at risk`, body: "Engagement agent will draft nudges for the coach.", href: "/hq/students" }, { toast: true });
    },
    assign(ids: string[], coach: string) {
      ids.forEach((id) => {
        patch(id, { coach });
        addEvent(id, `Assigned to coach ${personById[coach].first}`, "info");
      });
      toast.success(`${ids.length} student${ids.length > 1 ? "s" : ""} assigned to ${personById[coach].first}`);
    },
    nudge(ids: string[]) {
      ids.forEach((id) => {
        patchExtra(id, { nudged: true });
        addEvent(id, "Engagement nudge sent on WhatsApp", "accent", "Engagement agent");
      });
      hq.log(`sent ${ids.length} AI-drafted WhatsApp nudges to at-risk students`, "accent");
    },
  };

  /* overview numbers */
  const atRisk = list.filter((s) => s.status === "At risk");
  const dues = list.reduce((a, s) => a + s.due, 0);
  const avgAtt = Math.round(list.reduce((a, s) => a + s.attendance, 0) / list.length);
  const overdueCount = list.filter((s) => emis(s)[0]?.state === "Overdue").length;

  const columns: Column<Student>[] = [
    {
      key: "name",
      label: "Student",
      sort: (s) => s.name,
      render: (s) => (
        <span className="flex min-w-0 items-center gap-2.5">
          <PersonAvatar name={s.name} size={30} />
          <span className="min-w-0">
            <span className="block truncate font-medium">
              <Hi text={s.name} q={needle} />
            </span>
            <span className="block truncate text-[11.5px] text-d-mute">
              <Hi text={s.business} q={needle} /> · <Hi text={s.city} q={needle} />{needle.replace(/\D/g, "").length >= 3 && <span className="font-mono"> · {s.phone}</span>}
            </span>
          </span>
        </span>
      ),
    },
    { key: "program", label: "Program", sort: (s) => programById[s.program].price, render: (s) => <Pill tone={PROGRAM_TONE[s.program]}>{programById[s.program].short}</Pill> },
    { key: "cohort", label: "Cohort", wide: true, sort: (s) => s.cohort, render: (s) => <span className="whitespace-nowrap text-[12.5px] text-d-mute">{COHORT_SHORT[s.cohort]}</span> },
    {
      key: "att",
      label: "Attendance",
      sort: (s) => s.attendance,
      render: (s) => (
        <span className="flex w-[92px] items-center gap-1.5">
          <Meter value={s.attendance} tone={s.attendance < 45 ? "late" : s.attendance < 65 ? "warn" : "ok"} height={5} />
          <span className="tnum w-8 text-right font-mono text-[11px]">{s.attendance}%</span>
        </span>
      ),
    },
    {
      key: "prog",
      label: "Progress",
      sort: (s) => s.progress,
      render: (s) => (
        <span className="flex w-[92px] items-center gap-1.5">
          <Meter value={s.progress} tone="accent" height={5} />
          <span className="tnum w-8 text-right font-mono text-[11px]">{s.progress}%</span>
        </span>
      ),
    },
    { key: "due", label: "Dues", align: "right", sort: (s) => s.due, render: (s) => (s.due > 0 ? <span className={`tnum whitespace-nowrap font-mono text-[12px] ${emis(s)[0]?.state === "Overdue" ? "text-d-late" : ""}`}>{rupees(s.due)}</span> : <span className="text-[12px] text-d-mute">Paid</span>) },
    { key: "status", label: "Status", sort: (s) => s.status, render: (s) => <Pill tone={STATUS_TONE[s.status]}>{s.status}</Pill> },
    { key: "coach", label: "Coach", wide: true, render: (s) => <PersonAvatar id={s.coach} size={22} /> },
  ];

  const select = (label: string, value: string, onChange: (v: string) => void, options: { value: string; label: string }[]) => (
    <label className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-d-line bg-d-panel pl-2.5 text-[12.5px]">
      <span className="text-d-mute">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-full cursor-pointer rounded-[8px] bg-transparent pr-1.5 font-medium outline-none">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div>
      <PageHeader
        kicker="Delivery"
        icon={GraduationCap}
        title="Student Search"
        sub="Every workshop attendee and program student across Batches 11 to 14. Search by name, business, phone, email or city, or just describe who you're looking for."
        actions={
          <>
            <Btn icon={MessageCircle} onClick={() => hq.openAsk("Which Batch 13 students are most likely to drop out, and what should Priya do this week?")}>
              Ask about students
            </Btn>
            <Btn icon={Download} onClick={() => toast.success(`Exported ${rows.length} students`, { description: "batch-students.csv · phone numbers masked" })}>
              Export {rows.length}
            </Btn>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Metric label="Students" value={list.length} hint="Batches 11–14 · 1,248 in Batch 14 workshop" />
        <Metric label="Active" value={list.filter((s) => s.status === "Active").length} hint={`${list.filter((s) => s.status === "Paused").length} paused · ${list.filter((s) => s.due > 0).length} on EMI`} />
        <Metric label="At risk" value={atRisk.length} delta={`${Math.round((atRisk.length / list.length) * 100)}%`} good={false} hint="attendance under 45%" onClick={() => setQuery("at risk")} />
        <Metric label="Dues outstanding" value={rupees(dues)} hint={`${overdueCount} EMIs overdue`} onClick={() => setQuery("with dues")} />
        <Metric label="Avg attendance" value={`${avgAtt}%`} delta="+4 pts" hint="vs Batch 12" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <Panel bodyClassName="p-5">
          <div ref={searchRef} className="relative">
            <SearchBox value={query} onChange={setQuery} placeholder='Search 140 students… try "at risk in batch 13 with dues" or "98251"' className="h-11 [&_input]:text-[14.5px]" />
            <kbd className="pointer-events-none absolute right-9 top-1/2 hidden -translate-y-1/2 rounded border border-d-line px-1.5 font-mono text-[10.5px] text-d-mute sm:block">/</kbd>
          </div>
          {ai && (
            <div className="desk-rise mt-2.5 flex flex-wrap items-center gap-1.5 text-[12px]">
              <AIMark label="Understood as" />
              {ai.chips.map((c) => (
                <span key={c} className="rounded-full border border-[color-mix(in_oklab,var(--d-gold)_40%,var(--d-line))] px-2 py-0.5">
                  {c}
                </span>
              ))}
              {ai.rest && <span className="rounded-full border border-d-line px-2 py-0.5">“{ai.rest}”</span>}
            </div>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Segmented
              size="sm"
              value={filters.program}
              onChange={(v) => setFilters({ ...filters, program: v })}
              options={[{ value: "all" as const, label: "All programs" }, ...PROGRAMS.map((p) => ({ value: p, label: programById[p].short, count: list.filter((s) => s.program === p).length }))]}
            />
            {select("Cohort", filters.cohort, (v) => setFilters({ ...filters, cohort: v }), [{ value: "all", label: "All" }, ...COHORTS.map((c) => ({ value: c, label: COHORT_SHORT[c] }))])}
            {select("Status", filters.status, (v) => setFilters({ ...filters, status: v as Filters["status"] }), [{ value: "all", label: "All" }, ...STATUSES.map((s) => ({ value: s, label: s }))])}
            {select("Coach", filters.coach, (v) => setFilters({ ...filters, coach: v }), [{ value: "all", label: "All" }, ...COACHES.map((c) => ({ value: c, label: personById[c].first }))])}
            <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[8px] border border-d-line bg-d-panel px-2.5 text-[12.5px]">
              <input type="checkbox" checked={filters.dues} onChange={(e) => setFilters({ ...filters, dues: e.target.checked })} className="h-3.5 w-3.5 accent-[var(--d-accent)]" />
              Has dues
            </label>
            {filtered && (
              <Btn
                size="sm"
                variant="ghost"
                onClick={() => {
                  setFilters(NO_FILTERS);
                  setQuery("");
                }}
              >
                Clear
              </Btn>
            )}
          </div>
          <p className="mb-2 mt-4 text-[12px] text-d-mute">
            <span className="font-semibold text-d-ink">{rows.length}</span> of {list.length} students{rows.length ? ` · ${rupees(rows.reduce((a, s) => a + s.due, 0))} dues · ${Math.round(rows.reduce((a, s) => a + s.attendance, 0) / rows.length)}% avg attendance` : ""}
          </p>
          <DataTable
            rows={rows}
            columns={columns}
            rowKey={(s) => s.id}
            onRow={(s) => setOpenId(s.id)}
            pageSize={12}
            dense
            empty="No student matches. Try a phone number, a city, or “batch 12 accelerator”."
            bulk={[
              { label: "Send recording", run: (ids) => actions.sendRecording(ids) },
              { label: "WhatsApp nudge", run: (ids) => { actions.nudge(ids); toast.success(`${ids.length} nudges sent`, { description: "Drafted per student by the engagement agent" }); } },
              { label: "Assign to Priya", run: (ids) => actions.assign(ids, "priya") },
              { label: "Mark at-risk", run: (ids) => actions.markRisk(ids) },
            ]}
          />
        </Panel>

        <AtRisk list={list} extra={extra} onOpen={setOpenId} onNudge={(ids) => actions.nudge(ids)} />
      </div>

      <CohortOverview list={list} onPick={(c) => setCohortPick(c)} picked={cohortPick} onFilter={(c) => { setFilters({ ...NO_FILTERS, cohort: c }); setQuery(""); window.scrollTo({ top: 0, behavior: "smooth" }); }} />

      <ProfileSheet
        student={open}
        extra={open ? (extra[open.id] ?? { notes: [], timeline: seedTimeline(open) }) : null}
        onClose={() => setOpenId(null)}
        onPatch={patch}
        onPatchExtra={patchExtra}
        onEvent={addEvent}
        actions={actions}
      />
    </div>
  );
}

/* ---------------- AI at-risk list ---------------- */

function AtRisk({ list, extra, onOpen, onNudge }: { list: Student[]; extra: Record<string, Extra>; onOpen: (id: string) => void; onNudge: (ids: string[]) => void }) {
  const ranked = list
    .filter((s) => s.status === "At risk")
    .map((s) => ({ s, score: Math.min(99, Math.round(100 - s.attendance * 0.6 - s.progress * 0.25 + lastLogin(s) * 1.5 + (emis(s)[0]?.state === "Overdue" ? 12 : 0))) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 9);
  const [expanded, setExpanded] = React.useState<string | null>(ranked[0]?.s.id ?? null);
  const pending = ranked.filter((r) => !extra[r.s.id]?.nudged);
  return (
    <Panel
      title={
        <span className="inline-flex items-center gap-2">
          Likely to drop off <AIMark label="Engagement agent" />
        </span>
      }
      sub="Ranked on attendance, portal logins, progress and EMI status"
      icon={AlertTriangle}
      action={
        <Btn
          size="sm"
          variant="solid"
          icon={Send}
          disabled={!pending.length}
          onClick={() => {
            onNudge(pending.map((r) => r.s.id));
            toast.success(`${pending.length} WhatsApp nudges sent`, { description: "Each one personalised in Hinglish; coaches get the reply thread." });
          }}
        >
          Send {pending.length}
        </Btn>
      }
    >
      <ul className="space-y-2">
        {ranked.map(({ s, score }) => {
          const sent = extra[s.id]?.nudged;
          const on = expanded === s.id;
          return (
            <li key={s.id} className={`rounded-[12px] border p-3 transition-colors ${on ? "border-[color-mix(in_oklab,var(--d-gold)_40%,var(--d-line))] bg-[color-mix(in_oklab,var(--d-gold)_5%,var(--d-panel))]" : "border-d-line"}`}>
              <button type="button" onClick={() => setExpanded(on ? null : s.id)} className="flex w-full items-start gap-2.5 text-left">
                <PersonAvatar name={s.name} size={28} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] font-semibold">{s.name}</span>
                    <span className="tnum shrink-0 font-mono text-[11px] text-d-late">{score} risk</span>
                  </span>
                  <span className="block truncate text-[11.5px] text-d-mute">
                    {s.business} · {COHORT_SHORT[s.cohort]} · {programById[s.program].short}
                  </span>
                </span>
              </button>
              {on && (
                <div className="desk-rise mt-2.5 space-y-2 pl-[38px]">
                  <p className="text-[11.5px] text-d-mute">{riskReasons(s).join(" · ")}</p>
                  <p className="rounded-[10px] bg-[#e7f6e9] px-3 py-2 text-[12.5px] leading-relaxed text-[#1d3b23]">{nudge(s)}</p>
                  <div className="flex gap-1.5">
                    {sent ? (
                      <Pill tone="ok">Nudge sent</Pill>
                    ) : (
                      <Btn
                        size="sm"
                        variant="solid"
                        icon={Send}
                        onClick={() => {
                          onNudge([s.id]);
                          toast.success(`Nudge sent to ${s.name.split(" ")[0]}`, { description: s.phone });
                        }}
                      >
                        Send on WhatsApp
                      </Btn>
                    )}
                    <Btn size="sm" onClick={() => onOpen(s.id)}>
                      Profile
                    </Btn>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

/* ---------------- cohort overview ---------------- */

function CohortOverview({ list, picked, onPick, onFilter }: { list: Student[]; picked: string | null; onPick: (c: string | null) => void; onFilter: (c: string) => void }) {
  const hq = useHQ();
  const scope = picked ? list.filter((s) => COHORT_SHORT[s.cohort] === picked) : list;
  const byCohort = [...COHORTS].reverse().map((c) => {
    const l = list.filter((s) => s.cohort === c);
    return {
      label: COHORT_SHORT[c],
      value: l.length,
      stack: STATUSES.map((st) => ({ name: st, value: l.filter((s) => s.status === st).length, tone: STATUS_TONE[st] })),
    };
  });
  const heatCols = SESSIONS.program.map((_, i) => `W${i + 1}`);
  const heatRows = [...COHORTS].reverse();
  const heat = heatRows.map((c) => {
    const l = list.filter((s) => s.cohort === c && s.program !== "workshop");
    return heatCols.map((_, i) => {
      if (i >= HELD[c]) return 0;
      const present = l.filter((s) => sessionsFor(s)[i]?.state === "present").length;
      return l.length ? Math.round((present / l.length) * 100) : 0;
    });
  });
  const worst = heatRows
    .flatMap((c, ri) => heat[ri].map((v, ci) => ({ c, ci, v })))
    .filter((x) => x.v > 0)
    .sort((a, b) => a.v - b.v)[0];

  return (
    <div className="mt-5">
      <SectionLabel
        action={
          <Segmented
            size="sm"
            value={picked ?? "All"}
            onChange={(v) => onPick(v === "All" ? null : v)}
            options={["All", "Batch 14", "Batch 13", "Batch 12", "Batch 11"]}
          />
        }
      >
        Cohort overview
      </SectionLabel>
      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-6">
        <Panel className="xl:col-span-2" title="Students by cohort" sub="Click a bar to filter the table">
          <Bars data={byCohort} height={170} selected={picked} onSelect={(l) => onFilter(COHORTS.find((c) => COHORT_SHORT[c] === l) ?? COHORTS[0])} />
        </Panel>
        <Panel className="xl:col-span-2" title="Program mix" sub={picked ?? "All cohorts"}>
          <div className="flex justify-center">
            <Donut
              size={150}
              segments={PROGRAMS.map((p) => ({ label: programById[p].short, value: scope.filter((s) => s.program === p).length, tone: PROGRAM_TONE[p] }))}
              center={scope.length}
              sub="students"
            />
          </div>
        </Panel>
        <Panel className="xl:col-span-2" title="Attendance and progress" sub={picked ?? "By cohort"}>
          <HBars
            max={100}
            format={(v) => `${v}%`}
            data={(picked ? [picked] : ["Batch 14", "Batch 13", "Batch 12", "Batch 11"]).flatMap((c) => {
              const l = list.filter((s) => COHORT_SHORT[s.cohort] === c);
              const att = Math.round(l.reduce((a, s) => a + s.attendance, 0) / Math.max(1, l.length));
              const pr = Math.round(l.reduce((a, s) => a + s.progress, 0) / Math.max(1, l.length));
              return picked
                ? [
                    { label: "Attendance", value: att, tone: "ok" as Tone },
                    { label: "Progress", value: pr, tone: "accent" as Tone },
                    { label: "Portal active (7d)", value: Math.round((l.filter((s) => lastLogin(s) <= 5).length / Math.max(1, l.length)) * 100), tone: "info" as Tone },
                  ]
                : [{ label: c, value: att, sub: `progress ${pr}%`, tone: (att < 62 ? "warn" : "ok") as Tone }];
            })}
          />
        </Panel>
        <Panel className="xl:col-span-3" title="Live session attendance" sub="% present, program students">
          <HeatGrid rows={heatRows.map((c) => COHORT_SHORT[c])} cols={heatCols} values={heat} tone="ok" format={(v) => (v ? String(v) : "·")} onCell={(r, c) => toast(`${COHORT_SHORT[heatRows[r]]} · ${SESSIONS.program[c]}`, { description: heat[r][c] ? `${heat[r][c]}% attended live. Recording views add ~18 pts.` : "Not held yet" })} />
          {worst && (
            <p className="mt-3 flex items-start gap-1.5 text-[11.5px] leading-snug text-d-mute">
              <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-[var(--d-gold)]" />
              Lowest: {COHORT_SHORT[worst.c]} {SESSIONS.program[worst.ci]} at {worst.v}%.{" "}
              <button type="button" className="font-medium text-d-accent hover:underline" onClick={() => hq.openAsk(`Why was attendance low for ${COHORT_SHORT[worst.c]} ${SESSIONS.program[worst.ci]}?`)}>
                Why?
              </button>
            </p>
          )}
        </Panel>
        <CohortAnalyst list={list} />
      </div>
    </div>
  );
}

function CohortAnalyst({ list }: { list: Student[] }) {
  const hq = useHQ();
  const [done, setDone] = React.useState<Set<string>>(new Set());
  const b13 = list.filter((s) => s.cohort === "Sep '26 · Batch 13");
  const b13Risk = b13.filter((s) => s.status === "At risk").length;
  const upsell = list.filter((s) => s.program === "launchpad" && s.progress >= 70 && s.attendance >= 70);
  const noBlueprint = list.filter((s) => s.cohort === "Oct '26 · Batch 14" && !s.access.blueprint);
  const overdue = list.filter((s) => emis(s)[0]?.state === "Overdue");
  const insights = [
    {
      id: "i1",
      title: `Batch 13 has ${b13Risk} students at risk going into week 6`,
      body: "Drop-off concentrates in Wednesday 8 PM sessions that clash with month-end closing. A Sunday 11 AM IST repeat of week 5 recovered 40% of similar students in Batch 11.",
      cta: "Schedule Sunday repeat",
      run: () => hq.addTask({ title: "Schedule Sunday 11 AM IST repeat of Batch 13 week 5", owner: "priya", status: "Todo", priority: "P1", due: "Tomorrow", dueIn: 1, area: "Delivery", aiDrafted: true }),
    },
    {
      id: "i2",
      title: `${upsell.length} Launchpad students are ready for the Accelerator`,
      body: `Progress above 70% and attendance above 70%. At a 22% upgrade rate that is about ${rupees(Math.round(upsell.length * 0.22) * 74999)} in bookings. Hand them to Sneha with the student's own wins as the opener.`,
      cta: "Send list to Sneha",
      run: () => hq.notify({ kind: "lead", title: `${upsell.length} upgrade-ready students sent to Sneha`, body: "Launchpad → Accelerator, sorted by progress", href: "/hq/crm" }),
    },
    {
      id: "i3",
      title: `${overdue.length} EMIs overdue · ${rupees(overdue.reduce((a, s) => a + (emis(s)[0]?.amount ?? 0), 0))}`,
      body: `Mostly failed auto-debit mandates. A fresh Razorpay UPI link on WhatsApp clears about 60% within 48 hours. ${noBlueprint.length} Batch 14 students are also still missing their blueprint pack.`,
      cta: "Send payment links",
      run: () => hq.notify({ kind: "payment", title: `${overdue.length} EMI payment links sent`, body: "Razorpay UPI links on WhatsApp, Sahil copied", href: "/hq/students" }),
    },
  ];
  return (
    <Panel
      className="xl:col-span-3"
      title={
        <span className="inline-flex items-center gap-2">
          Cohort analyst <AIMark />
        </span>
      }
      sub="What changed across Batches 11 to 14 this week"
    >
      <ul className="space-y-3">
        {insights.map((i) => (
          <li key={i.id} className="rounded-[12px] border border-d-line p-3">
            <p className="text-[13.5px] font-semibold leading-snug">{i.title}</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-d-mute">{i.body}</p>
            <div className="mt-2">
              {done.has(i.id) ? (
                <Pill tone="ok">Done</Pill>
              ) : (
                <Btn
                  size="sm"
                  variant="soft"
                  onClick={() => {
                    i.run();
                    setDone((cur) => new Set(cur).add(i.id));
                    toast.success(i.cta);
                  }}
                >
                  {i.cta}
                </Btn>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ---------------- profile sheet ---------------- */

type Actions = {
  sendRecording: (ids: string[]) => void;
  markRisk: (ids: string[]) => void;
  assign: (ids: string[], coach: string) => void;
  nudge: (ids: string[]) => void;
};

function ProfileSheet({
  student,
  extra,
  onClose,
  onPatch,
  onPatchExtra,
  onEvent,
  actions,
}: {
  student: Student | null;
  extra: Extra | null;
  onClose: () => void;
  onPatch: (id: string, p: Partial<Student>) => void;
  onPatchExtra: (id: string, p: Partial<Extra>) => void;
  onEvent: (id: string, text: string, tone?: Tone, who?: string) => void;
  actions: Actions;
}) {
  const [extend, setExtend] = React.useState(false);
  const [coachPick, setCoachPick] = React.useState(false);
  return (
    <>
      <Sheet
        open={!!student}
        onOpenChange={(v) => !v && onClose()}
        width={600}
        eyebrow={student ? `${student.id} · ${student.cohort}` : ""}
        title={student?.name ?? ""}
        sub={student ? `${student.business} · ${student.industry} · ${student.city}` : undefined}
        footer={
          student && (
            <>
              <Btn icon={PlayCircle} onClick={() => actions.sendRecording([student.id])}>
                Send recording
              </Btn>
              <Btn icon={CalendarPlus} onClick={() => setExtend(true)}>
                Extend access
              </Btn>
              <Btn icon={UserCog} onClick={() => setCoachPick(true)}>
                Assign coach
              </Btn>
              <Btn variant={student.status === "At risk" ? "outline" : "danger"} icon={AlertTriangle} disabled={student.status === "At risk"} onClick={() => actions.markRisk([student.id])}>
                {student.status === "At risk" ? "At risk" : "Mark at-risk"}
              </Btn>
            </>
          )
        }
      >
        {student && extra && <ProfileBody key={student.id} s={student} extra={extra} onPatch={onPatch} onPatchExtra={onPatchExtra} onEvent={onEvent} actions={actions} />}
      </Sheet>

      <Modal open={extend} onOpenChange={setExtend} title="Extend access" sub={student ? `${student.name} · portal, recordings and community` : ""} width={460}>
        {student && (
          <ExtendForm
            onDone={(days, reason) => {
              const until = days === 7 ? "27 Oct 2026" : days === 14 ? "3 Nov 2026" : days === 30 ? "19 Nov 2026" : "20 Jan 2027";
              onPatchExtra(student.id, { accessUntil: until });
              onEvent(student.id, `Access extended by ${days} days to ${until}${reason ? ` (${reason})` : ""}`, "ok");
              toast.success(`Access extended to ${until}`, { description: "Portal, Circle and recordings updated" });
              setExtend(false);
            }}
          />
        )}
      </Modal>

      <Modal open={coachPick} onOpenChange={setCoachPick} title="Assign coach" sub={student?.name} width={460}>
        {student && (
          <div className="space-y-2">
            {COACHES.map((c) => {
              const load = [24, 31, 12][COACHES.indexOf(c)];
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    actions.assign([student.id], c);
                    setCoachPick(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-[12px] border p-3 text-left hover:border-d-accent ${student.coach === c ? "border-d-accent bg-d-soft/40" : "border-d-line"}`}
                >
                  <PersonChip id={c} sub={personById[c].title} />
                  <span className="text-right text-[11.5px] text-d-mute">
                    {load} students · {c === "vikram" ? "Systems & Agent Factory" : c === "neha" ? "Accelerator" : "Launchpad & workshop"}
                    {c === "priya" && student.program !== "systems" && student.program !== "agents" && (
                      <span className="mt-0.5 block">
                        <AIMark label="Best fit" />
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </Modal>
    </>
  );
}

function ExtendForm({ onDone }: { onDone: (days: number, reason: string) => void }) {
  const [days, setDays] = React.useState("14");
  const [reason, setReason] = React.useState("Missed sessions due to GST filing");
  return (
    <div className="space-y-3">
      <Segmented value={days} onChange={setDays} options={[{ value: "7", label: "7 days" }, { value: "14", label: "14 days" }, { value: "30", label: "30 days" }, { value: "90", label: "Next batch" }]} />
      <Field label="Reason (shown in the audit log)">
        <input value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass} />
      </Field>
      <div className="flex justify-end">
        <Btn variant="solid" onClick={() => onDone(Number(days), reason)}>
          Extend access
        </Btn>
      </div>
    </div>
  );
}

type PTab = "Overview" | "Payments" | "Attendance" | "Access" | "Notes";

function ProfileBody({ s, extra, onPatch, onPatchExtra, onEvent, actions }: { s: Student; extra: Extra; onPatch: (id: string, p: Partial<Student>) => void; onPatchExtra: (id: string, p: Partial<Extra>) => void; onEvent: (id: string, text: string, tone?: Tone, who?: string) => void; actions: Actions }) {
  const hq = useHQ();
  const [tab, setTab] = React.useState<PTab>("Overview");
  const [note, setNote] = React.useState("");
  const sess = sessionsFor(s);
  const held = sess.filter((x) => x.state !== "upcoming");
  const present = held.filter((x) => x.state === "present").length;
  const e = emis(s);
  const price = programById[s.program].price;
  const modulesDone = Math.round((s.progress / 100) * (s.program === "workshop" ? 4 : 12));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Pill tone={PROGRAM_TONE[s.program]}>{programById[s.program].name}</Pill>
        <Pill tone={STATUS_TONE[s.status]}>{s.status}</Pill>
        {extra.accessUntil && <Pill tone="ok">Access until {extra.accessUntil}</Pill>}
        {extra.recordingSent && <Pill tone="info">Recording sent</Pill>}
      </div>
      <Segmented size="sm" value={tab} onChange={setTab} options={(["Overview", "Payments", "Attendance", "Access", "Notes"] as const).map((t) => ({ value: t, label: t }))} className="mb-4" />

      {tab === "Overview" && (
        <div className="space-y-4">
          <AgentNote
            title="Coach brief"
            action={
              s.status === "At risk" ? (
                <Btn
                  size="sm"
                  variant="solid"
                  icon={Wand2}
                  disabled={extra.nudged}
                  onClick={() => {
                    actions.nudge([s.id]);
                    toast.success("Nudge sent", { description: nudge(s).slice(0, 90) + "…" });
                  }}
                >
                  {extra.nudged ? "Nudge sent" : "Send drafted nudge"}
                </Btn>
              ) : undefined
            }
          >
            {s.status === "At risk"
              ? `${s.name.split(" ")[0]} ${riskReasons(s).join(", ")}. Runs ${s.business} in ${s.city}; most likely blocker is time, not interest. A 10-minute call from ${personById[s.coach]?.first} plus the recording usually recovers students like this within a week.`
              : s.status === "Completed"
                ? `Finished ${programById[s.program].short} with ${s.attendance}% attendance. Good candidate for a testimonial and the next program up (${programById[s.program === "launchpad" ? "accelerator" : s.program === "accelerator" ? "systems" : "agents"].short}).`
                : `On track: ${present} of ${held.length} live sessions attended and ${modulesDone} modules done. ${s.due > 0 ? `Next EMI ${rupees(e[0]?.amount ?? 0)} on ${e[0]?.date}.` : "Fully paid."}`}
          </AgentNote>
          <KV
            items={[
              { k: "Phone", v: <span className="font-mono text-[12.5px]">{s.phone}</span> },
              { k: "Email", v: s.email },
              { k: "Program", v: `${programById[s.program].short} · ${rupees(price)}` },
              { k: "Joined", v: s.joined },
              { k: "Coach", v: <PersonChip id={s.coach} /> },
              { k: "Last portal login", v: `${lastLogin(s) === 0 ? "Today" : `${lastLogin(s)} days ago`}` },
            ]}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-1 flex justify-between text-[12px] text-d-mute">
                <span>Attendance</span>
                <span className="tnum font-mono">{s.attendance}%</span>
              </div>
              <Meter value={s.attendance} tone={s.attendance < 45 ? "late" : "ok"} height={7} />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-[12px] text-d-mute">
                <span>Progress · {modulesDone} modules</span>
                <span className="tnum font-mono">{s.progress}%</span>
              </div>
              <Meter value={s.progress} height={7} />
            </div>
          </div>
          <div>
            <SectionLabel>Timeline</SectionLabel>
            <Feed items={extra.timeline} max={7} />
          </div>
        </div>
      )}

      {tab === "Payments" && (
        <div>
          <div className="mb-4 grid grid-cols-3 gap-2">
            <Metric label="Fee" value={rupees(price)} />
            <Metric label="Paid" value={rupees(s.paid)} />
            <Metric label="Due" value={rupees(s.due)} />
          </div>
          <Meter value={s.paid} max={price} tone="ok" height={7} />
          <SectionLabel className="mt-5">{e.length ? "EMI schedule · Razorpay" : "Payments"}</SectionLabel>
          <ul className="divide-y divide-d-line">
            <li className="flex items-center justify-between py-2.5 text-[13px]">
              <span>
                <span className="block font-medium">{s.due > 0 ? "Down payment" : "Paid in full"}</span>
                <span className="text-[11.5px] text-d-mute">{s.joined} · UPI</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="tnum font-mono">{rupees(s.paid)}</span>
                <Pill tone="ok">Paid</Pill>
              </span>
            </li>
            {e.map((x) => (
              <li key={x.no} className="flex items-center justify-between gap-2 py-2.5 text-[13px]">
                <span>
                  <span className="block font-medium">EMI {x.no} of {e.length}</span>
                  <span className="text-[11.5px] text-d-mute">{x.date} · auto-debit mandate {x.state === "Overdue" ? "failed" : "active"}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="tnum font-mono">{rupees(x.amount)}</span>
                  <Pill tone={x.state === "Overdue" ? "late" : "neutral"}>{x.state}</Pill>
                </span>
              </li>
            ))}
          </ul>
          {s.due > 0 && (
            <Btn
              className="mt-3"
              variant="solid"
              icon={Send}
              onClick={() => {
                onEvent(s.id, `Razorpay link for ${rupees(e[0].amount)} sent on WhatsApp`, "warn");
                hq.notify({ kind: "payment", title: `Payment link sent to ${s.name}`, body: `${rupees(e[0].amount)} · EMI 1 of ${e.length}`, href: "/hq/students" });
              }}
            >
              Send payment link · {rupees(e[0].amount)}
            </Btn>
          )}
        </div>
      )}

      {tab === "Attendance" && (
        <div>
          <p className="mb-3 text-[13px] text-d-mute">
            {present} of {held.length} live sessions attended · recordings watched: {Math.min(held.length, present + 1)}
          </p>
          <ul className="grid grid-cols-2 gap-2">
            {sess.map((x) => (
              <li key={x.name} className="rounded-[10px] border border-d-line px-3 py-2">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-[12.5px] font-medium">{x.name}</span>
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: x.state === "present" ? "var(--d-ok)" : x.state === "missed" ? "var(--d-late)" : "var(--d-sunk)", boxShadow: x.state === "upcoming" ? "inset 0 0 0 1px var(--d-line)" : undefined }} />
                </span>
                <span className="text-[11px] text-d-mute">
                  {x.date} · {x.state === "present" ? `joined ${s.program === "workshop" ? "7:04 PM" : "8:02 PM"}` : x.state === "missed" ? "missed" : "upcoming"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "Access" && (
        <div>
          <Checklist
            items={(Object.keys(ACCESS_LABEL) as (keyof Student["access"])[]).map((k) => ({ id: k, label: ACCESS_LABEL[k], sub: s.access[k] ? "Granted · confirmed" : "Not granted yet", done: s.access[k] }))}
            onToggle={(k) => {
              const key = k as keyof Student["access"];
              onPatch(s.id, { access: { ...s.access, [key]: !s.access[key] } });
              onEvent(s.id, `${s.access[key] ? "Revoked" : "Granted"} ${ACCESS_LABEL[key]}`, s.access[key] ? "warn" : "ok");
            }}
          />
          {Object.values(s.access).some((v) => !v) && (
            <AgentNote className="mt-3" title="Missing access" action={<Btn size="sm" variant="solid" onClick={() => { onPatch(s.id, { access: { zoom: true, community: true, portal: true, blueprint: true, whatsapp: true } }); onEvent(s.id, "Granted all pending access", "ok", "Onboarding agent"); toast.success("All access granted"); }}>Grant all</Btn>}>
              {(Object.keys(s.access) as (keyof Student["access"])[]).filter((k) => !s.access[k]).map((k) => ACCESS_LABEL[k]).join(", ")} still pending. The onboarding agent can send them now.
            </AgentNote>
          )}
        </div>
      )}

      {tab === "Notes" && (
        <div>
          <form
            onSubmit={(ev) => {
              ev.preventDefault();
              if (!note.trim()) return;
              onPatchExtra(s.id, { notes: [{ at: "Just now", by: hq.me.id, text: note.trim() }, ...extra.notes] });
              setNote("");
            }}
          >
            <textarea value={note} onChange={(ev) => setNote(ev.target.value)} rows={3} placeholder="Add a note for the coach…" className={`${inputClass} h-auto py-2`} />
            <div className="mt-2 flex justify-between">
              <Btn
                size="sm"
                icon={Sparkles}
                onClick={() => setNote(`Spoke with ${s.name.split(" ")[0]} ji. ${s.status === "At risk" ? "Busy with Diwali season orders, will watch recordings this weekend." : "Implementing the delegation map with 2 managers."} Next check-in Thursday 7 PM IST.`)}
              >
                Draft from last call
              </Btn>
              <Btn size="sm" variant="solid" type="submit">
                Save note
              </Btn>
            </div>
          </form>
          <ul className="mt-4 space-y-2">
            {[...extra.notes, { at: s.joined, by: s.coach, text: `Onboarding call done. Owner of ${s.business}; goal is to step out of daily operations by March.` }].map((n, i) => (
              <li key={`${n.at}-${i}`} className="rounded-[10px] bg-d-sunk/60 p-3">
                <p className="flex items-center gap-2 text-[11.5px] text-d-mute">
                  <PersonAvatar id={n.by} size={18} /> {personById[n.by]?.first} · {n.at}
                </p>
                <p className="mt-1 text-[13px]">{n.text}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
