"use client";

import * as React from "react";
import { toast } from "sonner";
import { BellRing, CalendarCheck, ChevronLeft, ChevronRight, ClipboardEdit, Download, MessageCircle, Phone, Sparkles, ThumbsUp, Wand2 } from "lucide-react";
import {
  AgentNote,
  AIMark,
  Btn,
  DataTable,
  Field,
  HBars,
  HeatGrid,
  IconBtn,
  KV,
  Metric,
  Modal,
  PageHeader,
  Panel,
  PersonAvatar,
  PersonChip,
  Pill,
  Segmented,
  SectionLabel,
  Sheet,
  Sparkline,
  inputClass,
  rupees,
  type Column,
} from "../kit";
import { useHQ } from "../store";
import { personById, programById, salesTeam } from "../data";
import type { Lead, ProgramId } from "../types";
import type { Tone } from "../../desk/types";

/* ============================================================
   Local data. Today is Tue 20 Oct 2026, 8:51 PM IST. Reports due 8:00 PM.
   Batch 14 ran 13–14 Oct; calls peak 15–17 Oct.
   ============================================================ */

function h(n: number, salt = 7) {
  let t = Math.imul(n + 1, 0x9e3779b1) ^ Math.imul(salt + 3, 0x85ebca6b);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const DATES = [
  { id: "20 Oct", day: "Tue", note: "Today" },
  { id: "19 Oct", day: "Mon", note: "" },
  { id: "17 Oct", day: "Sat", note: "" },
  { id: "16 Oct", day: "Fri", note: "" },
  { id: "15 Oct", day: "Thu", note: "Post-workshop day 1" },
  { id: "14 Oct", day: "Wed", note: "Batch 14 day 2" },
  { id: "13 Oct", day: "Tue", note: "Batch 14 day 1" },
  { id: "12 Oct", day: "Mon", note: "" },
  { id: "10 Oct", day: "Sat", note: "" },
  { id: "9 Oct", day: "Fri", note: "" },
  { id: "8 Oct", day: "Thu", note: "" },
  { id: "7 Oct", day: "Wed", note: "" },
];
const MULT: Record<string, number> = { "13 Oct": 0.55, "14 Oct": 0.6, "15 Oct": 1.45, "16 Oct": 1.35, "17 Oct": 1.15, "10 Oct": 0.8, "17 Oct ": 1 };

type Profile = { dial: number; conn: number; mins: number; consult: number; propose: number; close: number; prog: ProgramId[] };
const PROFILE: Record<string, Profile> = {
  rohan: { dial: 54, conn: 0.46, mins: 7.8, consult: 0.16, propose: 0.55, close: 0.42, prog: ["dfy", "systems", "agents", "accelerator"] },
  sneha: { dial: 72, conn: 0.41, mins: 6.4, consult: 0.17, propose: 0.5, close: 0.38, prog: ["accelerator", "accelerator", "systems", "agents"] },
  arjun: { dial: 88, conn: 0.33, mins: 5.1, consult: 0.13, propose: 0.42, close: 0.3, prog: ["accelerator", "launchpad", "systems"] },
  kavya: { dial: 76, conn: 0.3, mins: 5.6, consult: 0.12, propose: 0.4, close: 0.28, prog: ["launchpad", "accelerator", "launchpad"] },
  imran: { dial: 132, conn: 0.36, mins: 2.9, consult: 0.11, propose: 0.15, close: 0.2, prog: ["launchpad", "launchpad"] },
};
const OBJECTIONS = [
  "Wants EMI / price too high",
  "Needs partner or family approval",
  "Busy with Diwali dealer orders",
  "Already uses Tally / Zoho, sees overlap",
  "Wants to see their own industry demo first",
  "Team won't adopt new software",
  "Will decide after Diwali",
];
const NOTES = [
  "Post-workshop calls converting well when I open with their day-2 question.",
  "Lots of 'call after Diwali'. Logged all of them with a 10 Nov follow-up.",
  "Two textile owners from Surat want a joint demo with their CA on Thursday.",
  "Connect rate dropped after 6 PM; owners are at the shop. Moving my block to 11–1.",
  "EMI ask on almost every Accelerator call. Bajaj Finserv link is closing it.",
  "One done-for-you proposal needs Vikram on the call for the scoping questions.",
  "WhatsApp voice notes before the call are getting better pick-up.",
];

type Report = {
  id: string;
  advisor: string;
  date: string;
  dialled: number;
  connected: number;
  talk: number;
  consults: number;
  proposals: number;
  closes: number;
  revenue: number;
  objection: string;
  notes: string;
  submittedAt: string;
  aiDrafted: boolean;
  acked?: boolean;
};

function genReport(advisor: string, di: number): Report {
  const d = DATES[di];
  const p = PROFILE[advisor];
  const seed = di * 31 + advisor.charCodeAt(0) * 7 + advisor.charCodeAt(1);
  const sat = d.day === "Sat" ? 0.7 : 1;
  const m = (MULT[d.id] ?? 1) * sat * (0.85 + h(seed, 1) * 0.3);
  const dialled = Math.round(p.dial * m);
  const connected = Math.round(dialled * p.conn * (0.88 + h(seed, 2) * 0.24));
  const talk = Math.round(connected * p.mins * (0.85 + h(seed, 3) * 0.3));
  const consults = Math.round(connected * p.consult * (0.7 + h(seed, 4) * 0.6) * ((MULT[d.id] ?? 1) > 1.1 ? 1.4 : 1));
  const proposals = Math.round(consults * p.propose + (h(seed, 5) > 0.6 ? 1 : 0));
  const closes = advisor === "imran" ? (h(seed, 6) > 0.7 ? 1 : 0) : Math.round(Math.max(0, proposals * p.close + (h(seed, 6) > 0.55 ? 1 : 0) - 0.3));
  const revenue = Array.from({ length: closes }, (_, k) => programById[p.prog[Math.floor(h(seed + k, 7) * p.prog.length)]].price).reduce((a, b) => a + b, 0);
  const hr = 19 + Math.floor(h(seed, 8) * 2);
  const mm = String(Math.floor(h(seed, 9) * 60)).padStart(2, "0");
  return {
    id: `R-${d.id.replace(" ", "")}-${advisor}`,
    advisor,
    date: d.id,
    dialled,
    connected,
    talk,
    consults,
    proposals,
    closes,
    revenue,
    objection: OBJECTIONS[Math.floor(h(seed, 10) * (d.id.includes("Oct") && di < 5 ? OBJECTIONS.length : 5))],
    notes: NOTES[Math.floor(h(seed, 11) * NOTES.length)],
    submittedAt: `${hr > 20 ? 8 : hr - 12}:${mm} PM`,
    aiDrafted: h(seed, 12) > 0.35,
  };
}

// Who has not filed: today Arjun and Kavya are late; on 19 Oct Kavya never filed; 12 Oct Imran.
const MISSING = new Set(["20 Oct:arjun", "20 Oct:kavya", "19 Oct:kavya", "12 Oct:imran"]);
const seedReports: Report[] = DATES.flatMap((d, di) =>
  salesTeam.filter((p) => !MISSING.has(`${d.id}:${p.id}`)).map((p) => {
    const r = genReport(p.id, di);
    if (d.id === "20 Oct") return { ...r, submittedAt: p.id === "imran" ? "5:04 PM" : p.id === "sneha" ? "7:38 PM" : "8:12 PM" };
    return r;
  }),
);

const OUTCOMES = ["Consult booked", "Proposal sent", "Closed", "Call back", "Not interested", "WhatsApp follow-up", "Consult booked", "Proposal sent"] as const;
type Outcome = (typeof OUTCOMES)[number];
const OUTCOME_TONE: Record<Outcome, Tone> = { "Consult booked": "info", "Proposal sent": "accent", Closed: "ok", "Call back": "warn", "Not interested": "late", "WhatsApp follow-up": "neutral" };

const HOURS = ["10", "11", "12", "13", "14", "15", "16", "17", "18", "19"];

const fmtTalk = (m: number) => `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
const sumBy = <T,>(a: T[], f: (x: T) => number) => a.reduce((s, x) => s + f(x), 0);

/* ============================================================ */

export default function SalesReports() {
  const hq = useHQ();
  const [di, setDi] = React.useState(0);
  const [reports, setReports] = React.useState(seedReports);
  const [open, setOpen] = React.useState<string | null>(null);
  const [submitOpen, setSubmitOpen] = React.useState(false);
  const [reminded, setReminded] = React.useState<Record<string, boolean>>({});
  const [metric, setMetric] = React.useState<"Revenue" | "Dials" | "Connect %" | "Consults">("Revenue");

  const date = DATES[di];
  const dayReports = reports.filter((r) => r.date === date.id);
  const missing = salesTeam.filter((p) => !dayReports.some((r) => r.advisor === p.id));
  const prevDayReports = di + 1 < DATES.length ? reports.filter((r) => r.date === DATES[di + 1].id) : [];

  const totals = {
    dialled: sumBy(dayReports, (r) => r.dialled),
    connected: sumBy(dayReports, (r) => r.connected),
    talk: sumBy(dayReports, (r) => r.talk),
    consults: sumBy(dayReports, (r) => r.consults),
    proposals: sumBy(dayReports, (r) => r.proposals),
    closes: sumBy(dayReports, (r) => r.closes),
    revenue: sumBy(dayReports, (r) => r.revenue),
  };
  const prevRev = sumBy(prevDayReports, (r) => r.revenue);
  const prevDial = sumBy(prevDayReports, (r) => r.dialled);
  const connectRate = totals.dialled ? totals.connected / totals.dialled : 0;
  const delta = (a: number, b: number) => (b ? `${a >= b ? "+" : ""}${Math.round(((a - b) / b) * 100)}%` : undefined);

  // trends: oldest → newest over all report days
  const trendOf = (advisor: string) => {
    const list = [...DATES].reverse().map((d) => reports.find((r) => r.date === d.id && r.advisor === advisor));
    const pick = (r?: Report) => (!r ? 0 : metric === "Revenue" ? r.revenue : metric === "Dials" ? r.dialled : metric === "Consults" ? r.consults : Math.round((r.connected / Math.max(1, r.dialled)) * 100));
    return list.map(pick);
  };

  // anomaly: connect rate vs that advisor's own average over other days
  const anomalies = dayReports
    .map((r) => {
      const others = reports.filter((x) => x.advisor === r.advisor && x.date !== r.date);
      const avg = sumBy(others, (x) => x.connected / Math.max(1, x.dialled)) / Math.max(1, others.length);
      const now = r.connected / Math.max(1, r.dialled);
      return { r, avg, now, drop: avg ? (avg - now) / avg : 0 };
    })
    .filter((x) => x.drop > 0.12)
    .sort((a, b) => b.drop - a.drop);

  const best = [...dayReports].sort((a, b) => b.revenue - a.revenue || b.consults - a.consults)[0];
  const objectionCounts = Object.entries(
    dayReports.reduce<Record<string, number>>((acc, r) => {
      acc[r.objection] = (acc[r.objection] ?? 0) + 2;
      return acc;
    }, {}),
  )
    .concat(OBJECTIONS.filter((o) => !dayReports.some((r) => r.objection === o)).slice(0, 2).map((o, i) => [o, i + 1] as [string, number]))
    .map(([label, v], i) => ({ label, value: v + Math.round(h(di * 13 + i, 40) * 5) }))
    .sort((a, b) => b.value - a.value);

  // connect rate heat by hour for submitted advisors
  const heat = dayReports.map((r, ri) =>
    HOURS.map((hr, hi) => {
      const shape = [0.75, 1.1, 1.2, 0.7, 0.8, 0.95, 1.05, 1.0, 0.72, 0.55][hi];
      return Math.max(5, Math.min(78, Math.round((r.connected / Math.max(1, r.dialled)) * 100 * shape * (0.85 + h(di * 97 + ri * 11 + hi, 41) * 0.3))));
    }),
  );

  // notable outcomes for the day, linked to real CRM leads
  const outcomes = (() => {
    const pool = hq.leads.filter((l) => l.stage !== "New" && !missing.some((p) => p.id === l.owner));
    const offset = pool.length ? (di * 11) % pool.length : 0;
    const rotated = [...pool.slice(offset), ...pool.slice(0, offset)].slice(0, 26);
    const closesLeft = Object.fromEntries(dayReports.map((r) => [r.advisor, r.closes]));
    return rotated
      .map((lead, k) => {
        const raw = OUTCOMES[Math.floor(h(di * 50 + k, 42) * OUTCOMES.length)];
        const canClose = (closesLeft[lead.owner] ?? 0) > 0;
        const outcome: Outcome = raw === "Closed" && !canClose ? "Proposal sent" : raw;
        if (outcome === "Closed") closesLeft[lead.owner] -= 1;
        const hr = 10 + Math.floor(h(di * 50 + k, 43) * 10);
        const mm = String(Math.floor(h(di * 50 + k, 44) * 60)).padStart(2, "0");
        return { id: `${date.id}-${lead.id}`, lead, outcome, time: `${hr > 12 ? hr - 12 : hr}:${mm} ${hr >= 12 ? "PM" : "AM"}`, sortTime: hr * 60 + Number(mm), mins: 2 + Math.floor(h(di * 50 + k, 45) * 22) };
      })
      .sort((a, b) => b.sortTime - a.sortTime);
  })();

  const openReport = reports.find((r) => r.id === open) ?? null;

  function remind(ids: string[]) {
    setReminded((cur) => ({ ...cur, ...Object.fromEntries(ids.map((id) => [`${date.id}:${id}`, true])) }));
    const names = ids.map((id) => personById[id]?.first).join(" and ");
    hq.log(`nudged ${names} on WhatsApp to file the ${date.id} sales report`, "warn");
    hq.notify({ kind: "task", title: `Report reminder sent to ${names}`, body: `${date.day} ${date.id} day report is ${date.id === "20 Oct" ? "past the 8:00 PM cut-off" : "missing"}. AI draft attached so it takes 2 minutes.`, href: "/hq/sales-reports" });
  }

  function acknowledge(r: Report) {
    setReports((cur) => cur.map((x) => (x.id === r.id ? { ...x, acked: true } : x)));
    hq.log(`acknowledged ${personById[r.advisor]?.first}'s ${r.date} sales report`, "ok");
    toast.success("Acknowledged", { description: `${personById[r.advisor]?.first} sees your thumbs-up on the report.` });
  }

  const columns: Column<Report>[] = [
    { key: "who", label: "Advisor", sort: (r) => personById[r.advisor]?.first ?? "", render: (r) => <PersonChip id={r.advisor} sub={`${r.submittedAt}${r.aiDrafted ? " · AI draft" : ""}`} /> },
    { key: "dial", label: "Dialled", align: "right", sort: (r) => r.dialled, render: (r) => <N>{r.dialled}</N> },
    { key: "conn", label: "Connected", align: "right", sort: (r) => r.connected / Math.max(1, r.dialled), render: (r) => <N>{r.connected}<span className="ml-1 text-[10.5px] text-d-mute">{Math.round((r.connected / Math.max(1, r.dialled)) * 100)}%</span></N> },
    { key: "talk", label: "Talk time", align: "right", sort: (r) => r.talk, render: (r) => <N>{fmtTalk(r.talk)}</N> },
    { key: "cons", label: "Consults", align: "right", sort: (r) => r.consults, render: (r) => <N>{r.consults}</N> },
    { key: "prop", label: "Proposals", align: "right", sort: (r) => r.proposals, render: (r) => <N>{r.proposals}</N> },
    { key: "close", label: "Closes", align: "right", sort: (r) => r.closes, render: (r) => <N strong={r.closes > 0}>{r.closes}</N> },
    { key: "rev", label: "Revenue", align: "right", sort: (r) => r.revenue, render: (r) => <N strong>{r.revenue ? rupees(r.revenue) : "-"}</N> },
    { key: "obj", label: "Top objection", wide: true, render: (r) => <span className="block max-w-[200px] truncate text-[12px] text-d-mute" title={r.objection}>{r.objection}</span> },
    { key: "ack", label: "", render: (r) => (r.acked ? <Pill tone="ok">Acked</Pill> : <Pill tone="neutral">New</Pill>) },
  ];

  type OutcomeRow = (typeof outcomes)[number];
  const outcomeCols: Column<OutcomeRow>[] = [
    { key: "t", label: "Time (IST)", sort: (o) => o.sortTime, render: (o) => <span className="font-mono text-[12px]">{o.time}</span> },
    { key: "lead", label: "Lead", sort: (o) => o.lead.name, render: (o) => <span className="block min-w-0"><span className="block truncate font-medium">{o.lead.name}</span><span className="block truncate text-[11.5px] text-d-mute">{o.lead.company} · {o.lead.city}</span></span> },
    { key: "by", label: "Advisor", render: (o) => <PersonChip id={o.lead.owner} /> },
    { key: "o", label: "Outcome", render: (o) => <Pill tone={OUTCOME_TONE[o.outcome]}>{o.outcome}</Pill> },
    { key: "p", label: "Program", wide: true, render: (o) => <span className="text-[12px]">{programById[o.lead.interest].short}</span> },
    { key: "m", label: "Mins", align: "right", sort: (o) => o.mins, render: (o) => <N>{o.mins}</N> },
    { key: "v", label: "Value", align: "right", sort: (o) => o.lead.value, render: (o) => <N>{rupees(o.lead.value)}</N> },
  ];

  const isToday = di === 0;

  return (
    <div>
      <PageHeader
        kicker="Revenue"
        icon={CalendarCheck}
        title="Sales Day Reports"
        sub="Every advisor files an end-of-day report by 8:00 PM IST. The agent drafts it from Exotel call data and CRM outcomes; the advisor edits and submits."
        actions={
          <>
            <Btn icon={Download} onClick={() => { hq.log(`exported ${date.id} sales day reports`, "info"); toast.success("Exported", { description: `sales-day-${date.id.replace(" ", "-").toLowerCase()}.csv` }); }}>Export</Btn>
            <Btn variant="solid" icon={ClipboardEdit} onClick={() => setSubmitOpen(true)}>{hq.me.role === "sales" ? "Submit my report" : "File a report"}</Btn>
          </>
        }
      />

      {/* Date control */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <IconBtn icon={ChevronLeft} label="Earlier day" disabled={di >= DATES.length - 1} onClick={() => setDi((v) => Math.min(DATES.length - 1, v + 1))} />
        <Segmented
          options={DATES.slice(Math.max(0, Math.min(di - 3, DATES.length - 7)), Math.max(0, Math.min(di - 3, DATES.length - 7)) + 7).map((d) => ({ value: d.id, label: `${d.day} ${d.id}`, count: reports.filter((r) => r.date === d.id).length }))}
          value={date.id}
          onChange={(id) => setDi(DATES.findIndex((d) => d.id === id))}
        />
        <IconBtn icon={ChevronRight} label="Later day" disabled={di === 0} onClick={() => setDi((v) => Math.max(0, v - 1))} />
        {date.note && <Pill tone={isToday ? "accent" : "info"}>{date.note}</Pill>}
        <span className="ml-auto text-[12px] text-d-mute">{dayReports.length} of {salesTeam.length} filed{isToday ? " · cut-off 8:00 PM passed" : ""}</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <Metric label="Dialled" value={totals.dialled.toLocaleString("en-IN")} delta={delta(totals.dialled, prevDial)} hint={`${Math.round(connectRate * 100)}% connected`} />
        <Metric label="Talk time" value={fmtTalk(totals.talk)} hint={`${Math.round(totals.talk / Math.max(1, totals.connected))} min per connect`} />
        <Metric label="Consults booked" value={String(totals.consults)} hint="for the next 3 days" />
        <Metric label="Proposals" value={String(totals.proposals)} hint={`${Math.round((totals.proposals / Math.max(1, totals.consults)) * 100)}% of consults`} />
        <Metric label="Closes" value={String(totals.closes)} hint={`${Math.round((totals.closes / Math.max(1, totals.proposals)) * 100)}% of proposals`} />
        <Metric label="Revenue" value={rupees(totals.revenue)} delta={delta(totals.revenue, prevRev)} hint="vs previous report day" />
      </div>

      {/* AI summary + missing */}
      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <AgentNote
          className="self-start"
          title={<span className="flex flex-wrap items-center gap-2">Team summary for {date.day} {date.id} <AIMark label="Sales agent" /></span>}
          action={
            <>
              <Btn size="sm" variant="solid" icon={MessageCircle} onClick={() => { hq.log(`posted the ${date.id} AI sales summary to the #sales WhatsApp group`, "accent"); hq.notify({ kind: "agent", title: "Sales summary posted", body: `${date.id}: ${totals.closes} closes, ${rupees(totals.revenue)}. Sent to the Sales WhatsApp group.`, href: "/hq/sales-reports" }); }}>Post to Sales group</Btn>
              <Btn size="sm" icon={Wand2} onClick={() => { hq.addTask({ title: `Objection drill: "${objectionCounts[0]?.label}" (from ${date.id} reports)`, owner: "rohan", status: "Todo", priority: "P2", due: "Tomorrow", dueIn: 1, area: "Sales", aiDrafted: true }); hq.log(`created an objection-handling drill task for Rohan`, "accent"); toast.success("Drill scheduled for Rohan", { description: "In Task Manager, due tomorrow." }); }}>Schedule objection drill</Btn>
              <Btn size="sm" variant="ghost" onClick={() => hq.openAsk(`Summarise the ${date.id} sales reports and tell me who needs coaching`)}>Ask HQ</Btn>
            </>
          }
        >
          {dayReports.length === 0 ? (
            "No reports filed for this day yet."
          ) : (
            <>
              {dayReports.length} of {salesTeam.length} advisors filed. The team dialled {totals.dialled.toLocaleString("en-IN")} and connected {Math.round(connectRate * 100)}%, booking {totals.consults} consultations and closing {totals.closes} for {rupees(totals.revenue)}
              {prevRev ? ` (${delta(totals.revenue, prevRev)} vs ${DATES[di + 1].id})` : ""}.{" "}
              {best && best.revenue > 0 && <>{personById[best.advisor]?.first} led with {rupees(best.revenue)} from {best.closes} close{best.closes === 1 ? "" : "s"}. </>}
              The most common objection was <b>&ldquo;{objectionCounts[0]?.label}&rdquo;</b>
              {objectionCounts[0]?.label.includes("Diwali") ? "; Diwali is 8 Nov, so offer a post-Diwali start date with today's price locked" : objectionCounts[0]?.label.includes("EMI") ? "; the Bajaj Finserv 0% EMI link closed 3 of 4 such calls last week" : "; Rohan's 11 AM drill covers it"}.{" "}
              {anomalies[0] && <>{personById[anomalies[0].r.advisor]?.first}&apos;s connect rate fell to {Math.round(anomalies[0].now * 100)}% from a usual {Math.round(anomalies[0].avg * 100)}%. </>}
              {missing.length > 0 && <>Still missing: {missing.map((p) => p.first).join(", ")}.</>}
            </>
          )}
        </AgentNote>

        <Panel title="Missing reports" sub={missing.length ? `${missing.length} not filed for ${date.id}` : "Everyone filed"} action={missing.length > 1 ? <Btn size="sm" variant="solid" icon={BellRing} onClick={() => remind(missing.map((p) => p.id))}>Remind all</Btn> : undefined}>
          {missing.length === 0 ? (
            <p className="flex items-center gap-2 text-[13px] text-d-mute"><ThumbsUp className="h-4 w-4 text-d-ok" /> All {salesTeam.length} reports are in.</p>
          ) : (
            <ul className="space-y-2.5">
              {missing.map((p) => {
                const key = `${date.id}:${p.id}`;
                return (
                  <li key={p.id} className="flex items-center gap-3">
                    <PersonAvatar id={p.id} size={30} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-medium">{p.name}</span>
                      <span className="block text-[11.5px] text-d-mute">{isToday ? "51 min past cut-off" : "never filed"} · {p.online ? "online" : "offline"} · AI draft ready</span>
                    </span>
                    <Btn size="sm" icon={MessageCircle} disabled={reminded[key]} onClick={() => remind([p.id])}>{reminded[key] ? "Nudged" : "WhatsApp"}</Btn>
                  </li>
                );
              })}
              <li className="pt-1">
                <Btn size="sm" variant="ghost" onClick={() => setSubmitOpen(true)}>File on their behalf from the AI draft</Btn>
              </li>
            </ul>
          )}
          {anomalies.length > 0 && (
            <div className="mt-4 border-t border-d-line pt-3">
              <SectionLabel>Anomalies</SectionLabel>
              {anomalies.slice(0, 2).map((a) => (
                <button key={a.r.id} type="button" onClick={() => setOpen(a.r.id)} className="flex w-full items-center gap-2 py-1 text-left text-[12.5px] hover:underline">
                  <span className="h-2 w-2 rounded-full bg-d-warn" />
                  {personById[a.r.advisor]?.first}: connect {Math.round(a.now * 100)}% vs usual {Math.round(a.avg * 100)}%
                  <AIMark className="ml-auto" label="Flag" />
                </button>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* Team table */}
      <Panel className="mt-4" title="Team reports" sub={`${date.day} ${date.id} · click a row to read the full report`}>
        <DataTable rows={dayReports} columns={columns} rowKey={(r) => r.id} onRow={(r) => setOpen(r.id)} empty="No reports filed for this day." bulk={[{ label: "Acknowledge", run: (ids) => { setReports((cur) => cur.map((x) => (ids.includes(x.id) ? { ...x, acked: true } : x))); hq.log(`acknowledged ${ids.length} sales reports for ${date.id}`, "ok"); toast.success(`${ids.length} reports acknowledged`); } }]} />
      </Panel>

      {/* Trends + objections + heat */}
      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Panel title="Trends by advisor" sub={`Last ${DATES.length} report days, oldest to newest`} action={<Segmented size="sm" options={["Revenue", "Dials", "Connect %", "Consults"] as const} value={metric} onChange={setMetric} />}>
          <ul className="grid gap-3 sm:grid-cols-2">
            {salesTeam.map((p) => {
              const t = trendOf(p.id);
              const last = t[t.length - 1 - di];
              const avg = Math.round(t.reduce((a, b) => a + b, 0) / t.length);
              const fmt = (v: number) => (metric === "Revenue" ? rupees(v) : metric === "Connect %" ? `${v}%` : String(v));
              return (
                <li key={p.id} className="rounded-xl border border-d-line p-3">
                  <div className="flex items-center justify-between gap-2">
                    <PersonChip id={p.id} sub={p.title} />
                    <span className="text-right">
                      <span className="tnum block font-mono text-[13px] font-semibold">{fmt(last)}</span>
                      <span className="block text-[11px] text-d-mute">avg {fmt(avg)}</span>
                    </span>
                  </div>
                  <Sparkline data={t} tone={last >= avg ? "ok" : "warn"} height={38} className="mt-2" />
                </li>
              );
            })}
            <li className="flex flex-col justify-center rounded-xl border border-dashed border-d-line p-3 text-[12.5px] leading-snug text-d-mute">
              <AIMark className="mb-1.5 self-start" />
              Revenue peaks two days after each workshop and decays within a week. Sneha holds her connect rate best through the dip.
              <button type="button" className="mt-1.5 self-start font-medium text-d-accent hover:underline" onClick={() => hq.openAsk("How does each advisor's performance change in the week after a workshop?")}>Ask why</button>
            </li>
          </ul>
        </Panel>

        <div className="space-y-4">
          <Panel title="Objections heard" sub={`Mentions across ${date.id} reports and call notes`}>
            <HBars data={objectionCounts.slice(0, 6).map((o, i) => ({ ...o, tone: (i === 0 ? "accent" : "info") as Tone }))} onSelect={(label) => hq.openAsk(`Best rebuttal for the objection "${label}" from our call recordings`)} />
            <p className="mt-3 text-[11.5px] text-d-mute">Click an objection to ask HQ for the best rebuttal from call recordings.</p>
          </Panel>
          <Panel title="Connect rate by hour" sub="% of dials answered, IST">
            {dayReports.length ? (
              <HeatGrid rows={dayReports.map((r) => personById[r.advisor]?.first ?? r.advisor)} cols={HOURS} values={heat} format={(v) => `${v}`} onCell={(ri, ci) => toast(`${personById[dayReports[ri].advisor]?.first} at ${HOURS[ci]}:00`, { description: `${heat[ri][ci]}% connect rate on ${date.id}. Best team hour: 12:00.` })} />
            ) : (
              <p className="text-[13px] text-d-mute">No data.</p>
            )}
          </Panel>
        </div>
      </div>

      {/* Outcomes */}
      <Panel className="mt-4" title="Outcomes logged" sub={`Notable call outcomes on ${date.id}, from the Calling CRM`} icon={Phone}>
        <DataTable
          rows={outcomes}
          columns={outcomeCols}
          rowKey={(o) => o.id}
          search={(o) => `${o.lead.name} ${o.lead.company} ${o.lead.city} ${personById[o.lead.owner]?.first}`}
          searchPlaceholder="Lead, company, advisor"
          filter={{ get: (o) => o.outcome, options: ["Consult booked", "Proposal sent", "Closed", "Call back", "Not interested"] }}
          pageSize={12}
          dense
        />
      </Panel>

      <ReportSheet report={openReport} reports={reports} onClose={() => setOpen(null)} onAck={acknowledge} />
      <SubmitModal
        open={submitOpen}
        onOpenChange={setSubmitOpen}
        date={date.id}
        missing={missing.map((p) => p.id)}
        onSubmit={(r) => {
          setReports((cur) => [...cur.filter((x) => x.id !== r.id), r]);
          const who = personById[r.advisor]?.first;
          hq.log(`submitted ${who}'s ${r.date} sales day report (${r.closes} closes, ${rupees(r.revenue)})`, "ok");
          hq.notify({ kind: "task", title: `${who} filed the ${r.date} day report`, body: `${r.dialled} dials, ${r.consults} consults, ${r.closes} closes, ${rupees(r.revenue)}.`, href: "/hq/sales-reports" });
        }}
      />
    </div>
  );
}

/* ============================================================ */

function N({ children, strong }: { children: React.ReactNode; strong?: boolean }) {
  return <span className={`tnum whitespace-nowrap font-mono text-[12.5px] ${strong ? "font-semibold" : ""}`}>{children}</span>;
}

function ReportSheet({ report, reports, onClose, onAck }: { report: Report | null; reports: Report[]; onClose: () => void; onAck: (r: Report) => void }) {
  const hq = useHQ();
  const r = report;
  const p = r ? personById[r.advisor] : undefined;
  const history = r ? [...DATES].reverse().map((d) => reports.find((x) => x.date === d.id && x.advisor === r.advisor)) : [];
  const series = (f: (x: Report) => number) => history.map((x) => (x ? f(x) : 0));
  const target = p?.target ? Math.round(p.target / 26) : 0;
  return (
    <Sheet
      open={!!r}
      onOpenChange={(o) => !o && onClose()}
      eyebrow={r ? `Day report · ${r.date} · filed ${r.submittedAt}` : ""}
      title={p?.name ?? ""}
      sub={p?.title}
      width={540}
      footer={
        r && (
          <>
            <Btn icon={MessageCircle} onClick={() => { hq.log(`replied to ${p?.first}'s ${r.date} report`, "info"); toast.success(`Reply sent to ${p?.first}`, { description: "On WhatsApp, threaded under the report." }); }}>Reply</Btn>
            <Btn variant="solid" icon={ThumbsUp} disabled={r.acked} onClick={() => onAck(r)}>{r.acked ? "Acknowledged" : "Acknowledge"}</Btn>
          </>
        )
      }
    >
      {r && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {r.aiDrafted && <AIMark label="Drafted by AI, edited by advisor" />}
            {r.acked && <Pill tone="ok">Acknowledged</Pill>}
          </div>
          <KV
            cols={3}
            items={[
              { k: "Dialled", v: r.dialled },
              { k: "Connected", v: `${r.connected} (${Math.round((r.connected / Math.max(1, r.dialled)) * 100)}%)` },
              { k: "Talk time", v: fmtTalk(r.talk) },
              { k: "Consults booked", v: r.consults },
              { k: "Proposals", v: r.proposals },
              { k: "Closes", v: r.closes },
              { k: "Revenue", v: r.revenue ? rupees(r.revenue) : "-" },
              { k: "Daily target", v: target ? rupees(target) : "-" },
              { k: "vs target", v: target ? `${Math.round((r.revenue / target) * 100)}%` : "-" },
            ]}
          />
          <div>
            <SectionLabel>Top objection</SectionLabel>
            <p className="text-[13.5px]">{r.objection}</p>
          </div>
          <div>
            <SectionLabel>Notes</SectionLabel>
            <p className="rounded-xl bg-d-sunk px-3 py-2.5 text-[13.5px] leading-relaxed">{r.notes}</p>
          </div>
          <div>
            <SectionLabel>Last {DATES.length} report days</SectionLabel>
            <div className="grid grid-cols-3 gap-3">
              {[
                { k: "Dials", d: series((x) => x.dialled) },
                { k: "Connect %", d: series((x) => Math.round((x.connected / Math.max(1, x.dialled)) * 100)) },
                { k: "Revenue", d: series((x) => x.revenue) },
              ].map((s) => (
                <div key={s.k} className="rounded-xl border border-d-line p-2.5">
                  <p className="text-[11px] text-d-mute">{s.k}</p>
                  <Sparkline data={s.d} height={34} className="mt-1" />
                </div>
              ))}
            </div>
          </div>
          <AgentNote title="Coaching note" action={<Btn size="sm" variant="ghost" onClick={() => hq.openAsk(`Coach ${p?.first} on their ${r.date} calls: what should change tomorrow?`)}>Ask HQ</Btn>}>
            {r.connected / Math.max(1, r.dialled) < 0.33
              ? `${p?.first}'s connect rate is low. Move the calling block to 11 AM–1 PM, when owners pick up 30% more, and send a WhatsApp voice note before each dial.`
              : r.consults > 0 && r.proposals / r.consults < 0.35
                ? `${p?.first} books consults but few become proposals. Open with the prospect's industry desk in the first 5 minutes; it lifted Sneha's proposal rate to 52%.`
                : `Strong day. ${r.objection} came up again; the 3-line rebuttal from Rohan's drill is in the Resource Library.`}
          </AgentNote>
        </div>
      )}
    </Sheet>
  );
}

function draftFor(advisor: string, leads: Lead[], date: string): Omit<Report, "id" | "submittedAt"> {
  const own = leads.filter((l) => l.owner === advisor);
  const calls = own.flatMap((l) => l.calls.filter((c) => c.by === advisor).map((c) => ({ ...c, lead: l })));
  const connected = calls.filter((c) => c.outcome !== "No answer" && c.outcome !== "Busy");
  const p = PROFILE[advisor] ?? PROFILE.arjun;
  const won = own.filter((l) => l.stage === "Won");
  const text = calls.map((c) => c.note.toLowerCase()).join(" ");
  const objection = text.includes("emi") ? OBJECTIONS[0] : text.includes("partner") ? OBJECTIONS[1] : text.includes("gst") || text.includes("busy") ? "Busy with GST filing" : OBJECTIONS[4];
  const dialled = Math.max(calls.length, Math.round(p.dial * 0.95));
  return {
    advisor,
    date,
    dialled,
    connected: Math.max(connected.length, Math.round(dialled * p.conn)),
    talk: Math.max(sumBy(calls, (c) => c.minutes), Math.round(dialled * p.conn * p.mins)),
    consults: calls.filter((c) => c.outcome === "Booked").length + own.filter((l) => l.stage === "Call booked").length,
    proposals: own.filter((l) => l.stage === "Proposal").length,
    closes: Math.min(2, won.length),
    revenue: sumBy(won.slice(0, 2), (l) => l.value),
    objection,
    notes: `${connected.length} connects logged in the CRM. ${own.filter((l) => l.tags.includes("Hot")).length} hot leads in my book; ${own.filter((l) => l.followUpIn < 0).length} follow-ups overdue, clearing them first tomorrow. ${calls[0]?.note ?? ""}`.trim(),
    aiDrafted: true,
  };
}

function SubmitModal({ open, onOpenChange, date, missing, onSubmit }: { open: boolean; onOpenChange: (o: boolean) => void; date: string; missing: string[]; onSubmit: (r: Report) => void }) {
  const hq = useHQ();
  const mine = hq.me.role === "sales";
  const [pickedAdvisor, setPickedAdvisor] = React.useState<string | null>(null);
  const advisor = mine ? hq.me.id : (pickedAdvisor ?? missing[0] ?? salesTeam[0].id);
  const [form, setForm] = React.useState<Omit<Report, "id" | "submittedAt"> | null>(null);
  const [drafting, setDrafting] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const draft = form && form.advisor === advisor && form.date === date ? form : null;

  function generate() {
    setDrafting(true);
    timer.current = setTimeout(() => {
      setForm(draftFor(advisor, hq.leads, date));
      setDrafting(false);
    }, 650);
  }
  function setField<K extends keyof Report>(k: K, v: Report[K]) {
    setForm((cur) => (cur ? { ...cur, [k]: v } : cur));
  }
  const calls = hq.leads.filter((l) => l.owner === advisor).reduce((a, l) => a + l.calls.length, 0);

  return (
    <Modal open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setForm(null); }} title={mine ? "Submit my day report" : "File a day report"} sub={`${date} · due 8:00 PM IST`} width={640}>
      <div className="space-y-4">
        {!mine && (
          <Field label="Filing for">
            <select value={advisor} onChange={(e) => { setPickedAdvisor(e.target.value); setForm(null); }} className={inputClass}>
              {salesTeam.map((p) => (
                <option key={p.id} value={p.id}>{p.name}{missing.includes(p.id) ? " (missing)" : ""}</option>
              ))}
            </select>
          </Field>
        )}
        {!draft ? (
          <div className="rounded-[14px] border border-dashed border-[color-mix(in_oklab,var(--d-gold)_45%,var(--d-line))] p-5 text-center">
            <p className="text-[13.5px]">The agent reads {personById[advisor]?.first}&apos;s {calls} CRM call logs and today&apos;s Exotel dialer data, then drafts the report.</p>
            <Btn className="mt-3" variant="solid" icon={Sparkles} onClick={generate} disabled={drafting}>{drafting ? "Drafting from call logs…" : "Draft with AI"}</Btn>
          </div>
        ) : (
          <>
            <p className="flex items-center gap-2 text-[12.5px] text-d-mute"><AIMark label="Prefilled" /> From {calls} CRM call logs. Edit anything before submitting.</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(
                [
                  ["dialled", "Dialled"],
                  ["connected", "Connected"],
                  ["talk", "Talk mins"],
                  ["consults", "Consults"],
                  ["proposals", "Proposals"],
                  ["closes", "Closes"],
                  ["revenue", "Revenue ₹"],
                ] as const
              ).map(([k, label]) => (
                <Field key={k} label={label}>
                  <input type="number" min={0} value={draft[k]} onChange={(e) => setField(k, Math.max(0, Number(e.target.value) || 0))} className={`${inputClass} font-mono`} />
                </Field>
              ))}
            </div>
            <Field label="Top objection">
              <select value={draft.objection} onChange={(e) => setField("objection", e.target.value)} className={inputClass}>
                {[...new Set([draft.objection, ...OBJECTIONS])].map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Notes">
              <textarea value={draft.notes} onChange={(e) => setField("notes", e.target.value)} rows={3} className={`${inputClass} h-auto! py-2 leading-relaxed`} />
            </Field>
            <div className="flex justify-between gap-2">
              <Btn variant="ghost" icon={Sparkles} onClick={generate}>Redraft</Btn>
              <span className="flex gap-2">
                <Btn onClick={() => { onOpenChange(false); setForm(null); }}>Cancel</Btn>
                <Btn
                  variant="solid"
                  icon={CalendarCheck}
                  onClick={() => {
                    onSubmit({ ...draft, id: `R-${date.replace(" ", "")}-${advisor}`, submittedAt: "8:53 PM" });
                    onOpenChange(false);
                    setForm(null);
                    toast.success("Report submitted", { description: `${personById[advisor]?.first} · ${date}` });
                  }}
                >
                  Submit report
                </Btn>
              </span>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
