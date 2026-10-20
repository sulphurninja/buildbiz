"use client";

import * as React from "react";
import { cn } from "cn";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Copy, Download, Heart, ListPlus, Megaphone, MessageSquare, Search, Send, Sparkles, Wand2 } from "lucide-react";
import {
  AgentNote,
  AIMark,
  AreaChart,
  Btn,
  DataTable,
  HBars,
  inputClass,
  Metric,
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
import { useHQ } from "../store";
import { leads, personById, programById, team } from "../data";
import type { Person, Role } from "../types";
import type { Tone } from "../../desk/types";

/* ============================================================
   30 days of daily reports, 21 Sep – 20 Oct 2026 (IST).
   Day 0 is Monday 21 Sep; day 29 is today, Tuesday 20 Oct.
   ============================================================ */

function h(n: number, salt = 3) {
  let t = Math.imul(n + 29, 0x9e3779b1) ^ Math.imul(salt + 13, 0x85ebca6b);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const pick = <T,>(list: readonly T[], n: number, salt: number) => list[Math.floor(h(n, salt) * list.length)];

const DAYS = 30;
const TODAY = 29;
const WEEKDAY = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
function dateOf(i: number) {
  const d = 21 + i;
  return d > 30 ? { day: d - 30, mon: "Oct" } : { day: d, mon: "Sep" };
}
const dateLabel = (i: number) => {
  const { day, mon } = dateOf(i);
  return `${WEEKDAY[i % 7]} ${day} ${mon}`;
};
const shortDate = (i: number) => {
  const { day, mon } = dateOf(i);
  return `${day} ${mon}`;
};

const HOLIDAYS: Record<number, string> = { 11: "Gandhi Jayanti" };
const MARKERS: { from: number; to: number; label: string; tone: Tone }[] = [
  { from: 11, to: 11, label: "Gandhi Jayanti", tone: "neutral" },
  { from: 20, to: 28, label: "Navratri", tone: "warn" },
  { from: 22, to: 23, label: "Batch 14 live", tone: "accent" },
];

type Win = { text: string; theme: string; only?: string[] };
const WINS: Record<Role, Win[]> = {
  sales: [
    { text: "{lead} ({co}) closed on {prog}, {amt}", theme: "Closes" },
    { text: "{lead} ji ne EMI plan pe haan bola, {prog} confirmed", theme: "Closes" },
    { text: "Booked {n} consults from Batch 14 attendees", theme: "Batch 14" },
    { text: "Follow-up list clear kar di before 7 PM", theme: "Follow-ups" },
    { text: "Connect rate {p}% today, best this week", theme: "Calling" },
    { text: "{lead} ka payment aa gaya, full {amt}", theme: "Collections" },
    { text: "Demo of the {ind} desk landed; {lead} wants a proposal", theme: "Pipeline" },
  ],
  delivery: [
    { text: "Balaji UAT at {p}%, client is happy with van stock", theme: "Client builds" },
    { text: "Shipped the Swiggy webhook fix to Spice Route staging", theme: "Client builds" },
    { text: "Batch 14 doubt-clearing session, {n}0 attendees stayed till the end", theme: "Batch 14" },
    { text: "At-risk students ko call kiya, {n} back on track", theme: "Student success" },
    { text: "Blueprint pack sent to all 1,240 attendees", theme: "Batch 14" },
    { text: "Apollo Pharma expiry radar demo went smoothly", theme: "Client builds" },
    { text: "Collected 3 video testimonials from Batch 12", theme: "Student success" },
  ],
  ops: [
    { text: "CPL down to ₹{cpl} on the owner-story creative", theme: "Ads", only: ["meera"] },
    { text: "Reconciled {n}6 Razorpay settlements, zero mismatches", theme: "Collections", only: ["sahil"] },
    { text: "Zoom 3,000-seat licence quote locked at ₹1.2 L/yr", theme: "Batch 14", only: ["aditya"] },
    { text: "GST working shared with the CA, filing on track", theme: "Compliance", only: ["sahil"] },
    { text: "Shortlisted {n} business advisors for Thursday interviews", theme: "Hiring", only: ["aditya"] },
    { text: "Scaled the Reels ad set by 20%, ROAS holding at 4.1x", theme: "Ads", only: ["meera"] },
    { text: "Diwali leave calendar 80% filled, coverage plan ready", theme: "People", only: ["aditya"] },
    { text: "Owner-story reel crossed 2.1 L views, 640 workshop registrations", theme: "Ads", only: ["meera"] },
    { text: "Skyline Realty milestone 2 invoice sent, ₹78k due Friday", theme: "Collections", only: ["sahil"] },
    { text: "TDS ka data CA ko bhej diya, return ready by Thursday", theme: "Compliance", only: ["sahil"] },
    { text: "Vendor contracts for Interakt and Zoom renewed at last year rates", theme: "Ops", only: ["aditya"] },
  ],
  founder: [
    { text: "Batch 14 day-2 pitch converted 3.1% to programs", theme: "Batch 14" },
    { text: "Recorded Agent Factory module {n}", theme: "Content" },
    { text: "Shubh Jewellers DFY verbally closed, proposal kal jayega", theme: "Pipeline" },
    { text: "Leadership review done, Q4 targets locked", theme: "People" },
    { text: "Two 1:1s; Rohan ready to run the closing drill solo", theme: "People" },
  ],
};

type Blocker = { key: string; text: string; roles: Role[]; from?: number; to?: number; people?: string[] };
const BLOCKERS: Blocker[] = [
  { key: "Swiggy API keys", text: "Spice Route ne abhi tak Swiggy API keys nahi bheje", roles: ["delivery"], from: 12, people: ["vikram", "neha"] },
  { key: "Zoom seat limit", text: "Zoom seats at 92%; Batch 15 needs the 3,000 licence", roles: ["ops", "delivery"], from: 14 },
  { key: "Late-evening no-answers", text: "Leads not picking up after 7 PM", roles: ["sales"] },
  { key: "Razorpay EMI failures", text: "Razorpay EMI link failing on some HDFC cards", roles: ["sales", "ops"], from: 8 },
  { key: "Discount approvals", text: "Discount approvals waiting on Amit sir", roles: ["sales"] },
  { key: "Client inputs pending", text: "Precision Auto plant head hasn't shared the PPAP formats", roles: ["delivery"], people: ["neha"] },
  { key: "Tally export mismatch", text: "CA needs the purchase register; Tally export doesn't match", roles: ["ops"], people: ["sahil"], from: 16 },
  { key: "Too many meetings", text: "Too many internal meetings, calling block got cut", roles: ["sales"], from: 18 },
  { key: "Creative bandwidth", text: "Editor bandwidth: only 2 edits a day", roles: ["ops"], people: ["meera"] },
];

const PLANS: Record<Role, string[]> = {
  sales: ["Call back the hot leads from yesterday's workshop", "Send EMI breakup to 3 Accelerator prospects", "Proposal for the {ind} owner, follow up by 4 PM", "Clear every follow-up due before lunch"],
  delivery: ["Close UAT punch list with Balaji", "Push the Spice Route fix to prod after sign-off", "Nudge the at-risk students on WhatsApp", "Blueprint session with Precision Auto Parts"],
  ops: ["Scale the winning ad set if CPL stays under ₹45", "Finish settlement reconciliation", "Book Zoom licence for November", "Interview round 1 for advisors"],
  founder: ["Weekly leadership review", "Record next Agent Factory module", "Workshop slide refresh for Batch 15", "Close the Shubh Jewellers proposal"],
};

const NUMS: Record<Role, { key: string; label: string; money?: boolean }[]> = {
  sales: [
    { key: "dialled", label: "Dialled" },
    { key: "connected", label: "Connected" },
    { key: "booked", label: "Booked" },
    { key: "closes", label: "Closes" },
    { key: "revenue", label: "Revenue", money: true },
  ],
  delivery: [
    { key: "students", label: "Students" },
    { key: "sessions", label: "Sessions" },
    { key: "tickets", label: "Tickets" },
    { key: "shipped", label: "Shipped" },
  ],
  ops: [
    { key: "tasks", label: "Tasks" },
    { key: "spend", label: "Ad spend", money: true },
    { key: "regs", label: "Regs" },
    { key: "recon", label: "Reconciled" },
  ],
  founder: [
    { key: "collected", label: "Collected", money: true },
    { key: "prospects", label: "Prospects" },
    { key: "oneones", label: "1:1s" },
  ],
};

type Report = {
  id: string;
  who: string;
  day: number;
  at: string;
  late: boolean;
  wins: Win[];
  blockers: Blocker[];
  plan: string[];
  nums: Record<string, number>;
  mood: number;
  energy: number;
};
type Cell = "on" | "late" | "miss" | "off" | "holiday" | "pending";

const TODAY_FILED: Record<string, string> = { aditya: "6:31 PM", sneha: "6:58 PM", imran: "7:05 PM", neha: "7:12 PM", meera: "7:20 PM", vikram: "7:41 PM" };
const RELIABILITY: Record<string, number> = { kavya: 0.66, sahil: 0.76, arjun: 0.86, amit: 0.82 };
const MOOD_BIAS: Record<string, number> = { sneha: 0.6, rohan: 0.3, kavya: -0.5, sahil: -0.2, vikram: 0.2, priya: 0.1 };

function fill(text: string, seed: number) {
  const lead = leads[Math.floor(h(seed, 41) * leads.length)];
  const prog = programById[lead.interest === "dfy" || lead.interest === "agents" ? "accelerator" : lead.interest];
  return text
    .replace("{lead}", lead.name.split(" ")[0] + " " + lead.name.split(" ")[1])
    .replace("{co}", lead.company)
    .replace("{prog}", prog.short)
    .replace("{amt}", `₹${prog.price.toLocaleString("en-IN")}`)
    .replace("{ind}", lead.industry.toLowerCase())
    .replace("{n}", String(3 + Math.floor(h(seed, 42) * 6)))
    .replace("{p}", String(40 + Math.floor(h(seed, 43) * 45)))
    .replace("{cpl}", String(36 + Math.floor(h(seed, 44) * 9)));
}

function buildAll() {
  const reports: Report[] = [];
  const cells: Record<string, Cell[]> = {};
  team.forEach((p, pi) => {
    const row: Cell[] = [];
    for (let i = 0; i < DAYS; i++) {
      const seed = pi * 100 + i;
      if (i % 7 === 6) {
        row.push("off");
        continue;
      }
      if (HOLIDAYS[i]) {
        row.push("holiday");
        continue;
      }
      let state: Cell;
      if (i === TODAY) state = TODAY_FILED[p.id] ? "on" : "pending";
      else {
        const r = h(seed, 7);
        const rel = RELIABILITY[p.id] ?? 0.93;
        state = r < rel - 0.1 ? "on" : r < rel ? "late" : "miss";
      }
      row.push(state);
      if (state !== "on" && state !== "late") continue;
      const role = p.role;
      const nWins = 2 + Math.floor(h(seed, 8) * 2);
      const wins = Array.from({ length: nWins }, (_, k) => {
        const pool = WINS[role].filter((x) => !x.only || x.only.includes(p.id));
        const w = pick(pool.length ? pool : WINS[role], seed * 3 + k, 9);
        return { text: fill(w.text, seed * 5 + k), theme: w.theme };
      }).filter((w, k, arr) => arr.findIndex((x) => x.text === w.text) === k);
      const eligible = BLOCKERS.filter((b) => b.roles.includes(role) && (b.from ?? 0) <= i && (b.to ?? 99) >= i && (!b.people || b.people.includes(p.id)));
      const blockers = eligible.filter((b, k) => h(seed + k * 7, 10) < (b.people ? 0.5 : 0.15)).slice(0, 2);
      const plan = Array.from({ length: 3 }, (_, k) => fill(PLANS[role][(Math.floor(h(seed, 11) * 4) + k) % 4], seed + k));
      const batch = i === 22 || i === 23;
      const nums: Record<string, number> = {};
      if (role === "sales") {
        const dialled = Math.round(32 + h(seed, 12) * 26 + (batch ? 30 : 0));
        const connected = Math.round(dialled * (0.34 + h(seed, 13) * 0.16));
        const closes = h(seed, 14) > 0.55 ? 1 + (h(seed, 15) > 0.8 ? 1 : 0) : 0;
        Object.assign(nums, { dialled, connected, booked: Math.round(connected * 0.22), closes, revenue: closes * (h(seed, 16) > 0.5 ? 74999 : 24999) });
      } else if (role === "delivery") Object.assign(nums, { students: Math.round(14 + h(seed, 12) * 30 + (batch ? 60 : 0)), sessions: 1 + Math.floor(h(seed, 13) * 4), tickets: Math.round(4 + h(seed, 14) * 9), shipped: Math.floor(h(seed, 15) * 4) });
      else if (role === "ops") Object.assign(nums, { tasks: 2 + Math.floor(h(seed, 12) * 5), spend: Math.round(38000 + h(seed, 13) * 9000), regs: Math.round(70 + h(seed, 14) * 90 + (i > 15 && i < 23 ? 120 : 0)), recon: Math.floor(h(seed, 15) * 30) });
      else Object.assign(nums, { collected: Math.round(150000 + h(seed, 12) * 420000 + (batch ? 600000 : 0)), prospects: 2 + Math.floor(h(seed, 13) * 4), oneones: Math.floor(h(seed, 14) * 4) });
      const dayBias = batch ? 0.8 : i >= 24 && i <= 26 ? -0.5 : i >= 20 ? 0.2 : 0;
      const mood = Math.max(1, Math.min(5, Math.round(3.4 + (MOOD_BIAS[p.id] ?? 0) + dayBias - blockers.length * 0.35 + (h(seed, 17) - 0.5) * 1.4)));
      const lateMin = state === "late" ? 15 + Math.floor(h(seed, 18) * 100) : 0;
      const minute = state === "on" ? 18 * 60 + 5 + Math.floor(h(seed, 19) * 95) : 21 * 60 + lateMin;
      const hh = Math.floor(minute / 60);
      reports.push({
        id: `R-${p.id}-${i}`,
        who: p.id,
        day: i,
        at: i === TODAY ? TODAY_FILED[p.id] : `${hh > 12 ? hh - 12 : hh}:${String(minute % 60).padStart(2, "0")} PM`,
        late: state === "late",
        wins,
        blockers,
        plan,
        nums,
        mood,
        energy: Math.max(2, Math.min(10, Math.round(mood * 1.6 + h(seed, 20) * 3))),
      });
    }
    cells[p.id] = row;
  });
  return { reports, cells };
}
const { reports: REPORTS, cells: CELLS } = buildAll();
const reportById = Object.fromEntries(REPORTS.map((r) => [r.id, r]));

const MOOD_WORD = ["", "Drained", "Low", "Steady", "Good", "Flying"];
const moodTone = (m: number): Tone => (m >= 4 ? "ok" : m === 3 ? "neutral" : "late");

const WEEKS = [
  { id: "w4", label: "12–18 Oct", from: 21, to: 27 },
  { id: "w3", label: "5–11 Oct", from: 14, to: 20 },
  { id: "w2", label: "28 Sep–4 Oct", from: 7, to: 13 },
  { id: "w1", label: "21–27 Sep", from: 0, to: 6 },
  { id: "w5", label: "This week", from: 28, to: 29 },
] as const;
type WeekId = (typeof WEEKS)[number]["id"];

type Digest = {
  week: (typeof WEEKS)[number];
  filed: number;
  expected: number;
  themes: { theme: string; count: number; sample: string }[];
  blockers: { key: string; count: number; people: string[]; first: number }[];
  mood: number;
  prevMood: number;
  sales: { dialled: number; closes: number; revenue: number };
  missed: { who: string; n: number }[];
  low: { who: string; days: number }[];
};

function buildDigest(weekId: WeekId): Digest {
  const week = WEEKS.find((w) => w.id === weekId) ?? WEEKS[0];
  const inWeek = REPORTS.filter((r) => r.day >= week.from && r.day <= week.to);
  const prev = REPORTS.filter((r) => r.day >= week.from - 7 && r.day < week.from);
  const themes = new Map<string, { count: number; sample: string }>();
  inWeek.forEach((r) => r.wins.forEach((w) => themes.set(w.theme, { count: (themes.get(w.theme)?.count ?? 0) + 1, sample: themes.get(w.theme)?.sample ?? w.text })));
  const blockers = new Map<string, { count: number; people: Set<string>; first: number }>();
  inWeek.forEach((r) =>
    r.blockers.forEach((b) => {
      const cur = blockers.get(b.key) ?? { count: 0, people: new Set<string>(), first: r.day };
      cur.count += 1;
      cur.people.add(r.who);
      cur.first = Math.min(cur.first, r.day);
      blockers.set(b.key, cur);
    }),
  );
  let expected = 0;
  const missed: Digest["missed"] = [];
  team.forEach((p) => {
    let m = 0;
    for (let i = week.from; i <= week.to; i++) {
      const c = CELLS[p.id][i];
      if (c !== "off" && c !== "holiday") expected += 1;
      if (c === "miss") m += 1;
    }
    if (m) missed.push({ who: p.id, n: m });
  });
  const avg = (list: Report[]) => (list.length ? list.reduce((a, r) => a + r.mood, 0) / list.length : 0);
  const low = team
    .map((p) => ({ who: p.id, days: inWeek.filter((r) => r.who === p.id && r.mood <= 2).length }))
    .filter((x) => x.days >= 2)
    .sort((a, b) => b.days - a.days);
  const sales = inWeek.reduce((a, r) => ({ dialled: a.dialled + (r.nums.dialled ?? 0), closes: a.closes + (r.nums.closes ?? 0), revenue: a.revenue + (r.nums.revenue ?? 0) }), { dialled: 0, closes: 0, revenue: 0 });
  return {
    week,
    filed: inWeek.length,
    expected,
    themes: [...themes.entries()].map(([theme, v]) => ({ theme, ...v })).sort((a, b) => b.count - a.count).slice(0, 5),
    blockers: [...blockers.entries()].map(([key, v]) => ({ key, count: v.count, people: [...v.people], first: v.first })).sort((a, b) => b.count - a.count).slice(0, 5),
    mood: avg(inWeek),
    prevMood: avg(prev),
    sales,
    missed: missed.sort((a, b) => b.n - a.n),
    low,
  };
}

function digestText(d: Digest) {
  const lines = [
    `BuildBiz weekly digest · ${d.week.label}`,
    `${d.filed} of ${d.expected} reports filed (${Math.round((d.filed / Math.max(1, d.expected)) * 100)}%). Team mood ${d.mood.toFixed(1)}/5 (${d.mood >= d.prevMood ? "up" : "down"} from ${d.prevMood.toFixed(1)}).`,
    "",
    "Themes",
    ...d.themes.map((t) => `- ${t.theme} (${t.count}): e.g. ${t.sample}`),
    "",
    "Repeated blockers",
    ...d.blockers.map((b) => `- ${b.key}: ${b.count} mentions by ${b.people.map((p) => personById[p].first).join(", ")}, since ${shortDate(b.first)}`),
    "",
    `Sales: ${d.sales.dialled} dials, ${d.sales.closes} closes, ${rupees(d.sales.revenue)} booked.`,
    d.missed.length ? `Missed reports: ${d.missed.map((m) => `${personById[m.who].first} (${m.n})`).join(", ")}.` : "No missed reports.",
  ];
  return lines.join("\n");
}

/* ---------------- module ---------------- */

type Range = "7" | "14" | "30";

export default function ReportHistory() {
  const hq = useHQ();
  const [query, setQuery] = React.useState("");
  const [who, setWho] = React.useState("all");
  const [role, setRole] = React.useState<"all" | Role>("all");
  const [range, setRange] = React.useState<Range>("30");
  const [day, setDay] = React.useState<number | null>(null);
  const [onlyBlocked, setOnlyBlocked] = React.useState(false);
  const [lowMood, setLowMood] = React.useState(false);
  const [blockerKey, setBlockerKey] = React.useState<string | null>(null);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [week, setWeek] = React.useState<WeekId>("w4");
  const [digest, setDigest] = React.useState<{ step: number; data?: Digest } | null>(null);
  const [tasked, setTasked] = React.useState<Set<string>>(new Set());
  const timers = React.useRef<number[]>([]);
  React.useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const from = DAYS - Number(range);
  const needle = query.trim().toLowerCase();
  const filtered = REPORTS.filter((r) => {
    if (day !== null ? r.day !== day : r.day < from) return false;
    if (who !== "all" && r.who !== who) return false;
    if (role !== "all" && personById[r.who].role !== role) return false;
    if (onlyBlocked && !r.blockers.length) return false;
    if (lowMood && r.mood > 2) return false;
    if (blockerKey && !r.blockers.some((b) => b.key === blockerKey)) return false;
    if (needle) {
      const hay = `${personById[r.who].name} ${r.wins.map((w) => w.text).join(" ")} ${r.blockers.map((b) => b.text).join(" ")} ${r.plan.join(" ")}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  }).sort((a, b) => b.day - a.day || a.who.localeCompare(b.who));

  const windowReports = REPORTS.filter((r) => r.day >= from);
  const expected = team.reduce((a, p) => a + CELLS[p.id].slice(from).filter((c) => c !== "off" && c !== "holiday").length, 0);
  const lateCount = windowReports.filter((r) => r.late).length;
  const blockerCounts = BLOCKERS.map((b) => ({ b, n: windowReports.filter((r) => r.blockers.some((x) => x.key === b.key)).length, people: new Set(windowReports.filter((r) => r.blockers.some((x) => x.key === b.key)).map((r) => r.who)) }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n);
  const moodByDay = Array.from({ length: DAYS }, (_, i) => {
    const list = REPORTS.filter((r) => r.day === i);
    return list.length ? Math.round((list.reduce((a, r) => a + r.mood, 0) / list.length) * 100) / 100 : 0;
  });
  const workIdx = Array.from({ length: DAYS }, (_, i) => i).filter((i) => i >= from && moodByDay[i] > 0);
  const energyByDay = workIdx.map((i) => {
    const list = REPORTS.filter((r) => r.day === i);
    return Math.round((list.reduce((a, r) => a + r.energy, 0) / list.length / 2) * 100) / 100;
  });
  const top = blockerCounts[0];

  const current = openId ? reportById[openId] : null;

  function runDigest() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setDigest({ step: 0 });
    [1, 2, 3].forEach((s) => timers.current.push(window.setTimeout(() => setDigest({ step: s }), s * 400)));
    timers.current.push(window.setTimeout(() => setDigest({ step: 4, data: buildDigest(week) }), 1650));
    hq.log("generated the weekly report digest", "accent");
  }

  function openCell(personId: string, i: number) {
    const r = REPORTS.find((x) => x.who === personId && x.day === i);
    if (r) setOpenId(r.id);
    else toast(`${personById[personId].first} · ${dateLabel(i)}`, { description: CELLS[personId][i] === "holiday" ? HOLIDAYS[i] : CELLS[personId][i] === "off" ? "Sunday, no report expected" : CELLS[personId][i] === "pending" ? "Not filed yet today" : "No report filed" });
  }

  const columns: Column<Report>[] = [
    { key: "day", label: "Date", render: (r) => <span className="whitespace-nowrap font-mono text-[12px]">{dateLabel(r.day)}</span>, sort: (r) => r.day },
    { key: "who", label: "Person", render: (r) => <PersonChip id={r.who} sub={personById[r.who].title} />, sort: (r) => personById[r.who].first },
    { key: "win", label: "Headline win", render: (r) => <span className="line-clamp-1 max-w-[420px]">{r.wins[0]?.text}</span> },
    {
      key: "blk",
      label: "Blockers",
      render: (r) => (r.blockers.length ? <Pill tone="warn">{r.blockers[0].key}{r.blockers.length > 1 ? ` +${r.blockers.length - 1}` : ""}</Pill> : <span className="text-d-mute">None</span>),
      sort: (r) => r.blockers.length,
      wide: true,
    },
    { key: "mood", label: "Mood", render: (r) => <Pill tone={moodTone(r.mood)}>{MOOD_WORD[r.mood]}</Pill>, sort: (r) => r.mood },
    { key: "at", label: "Filed", align: "right", render: (r) => <span className={cn("font-mono text-[12px]", r.late ? "text-d-warn" : "text-d-mute")}>{r.at}{r.late ? " · late" : ""}</span>, sort: (r) => (r.late ? 1 : 0) },
  ];

  const filters = (who !== "all" ? 1 : 0) + (role !== "all" ? 1 : 0) + (day !== null ? 1 : 0) + (onlyBlocked ? 1 : 0) + (lowMood ? 1 : 0) + (blockerKey ? 1 : 0) + (needle ? 1 : 0);

  return (
    <div>
      <PageHeader
        kicker="Operations"
        title="Report History"
        sub={`${REPORTS.length} daily reports from ${team.length} people since 21 September. Search them, read them, and see what keeps coming up.`}
        actions={
          <>
            <Btn icon={Search} onClick={() => hq.openAsk(`Across the last ${range} days of daily reports, what did the sales team say about ${top?.b.key.toLowerCase() ?? "blockers"}?`)}>
              Ask the reports
            </Btn>
            <Btn variant="solid" icon={Wand2} onClick={runDigest}>
              Weekly digest
            </Btn>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label={`Filed · ${range}d`} value={`${Math.round((windowReports.length / Math.max(1, expected)) * 100)}%`} hint={`${windowReports.length} of ${expected} expected`} />
        <Metric label="Filed late" value={lateCount} hint="after 9 PM IST" />
        <Metric label="Top blocker" value={top?.n ?? 0} hint={top ? `${top.b.key} · ${top.people.size} people` : "none"} onClick={() => top && setBlockerKey(top.b.key)} />
        <Metric label="Team mood" value={`${(workIdx.reduce((a, i) => a + moodByDay[i], 0) / Math.max(1, workIdx.length)).toFixed(1)}`} hint="out of 5, last working day included" />
      </div>

      {digest && <DigestPanel digest={digest} week={week} onWeek={(w) => { setWeek(w); setDigest({ step: 4, data: buildDigest(w) }); }} onClose={() => setDigest(null)} />}

      {/* heat grid */}
      <Panel
        className="mt-4"
        title="Submissions calendar"
        sub="Every person, every day. Click a square to read that report."
        action={
          day !== null ? (
            <Btn size="sm" variant="soft" onClick={() => setDay(null)}>
              Showing {shortDate(day)} · clear
            </Btn>
          ) : (
            <span className="flex flex-wrap gap-3 text-[11px] text-d-mute">
              {(["on", "late", "miss", "holiday"] as Cell[]).map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-[3px]" style={cellStyle(c)} />
                  {c === "on" ? "On time" : c === "late" ? "Late" : c === "miss" ? "Missed" : "Holiday"}
                </span>
              ))}
            </span>
          )
        }
      >
        <HeatCalendar onCell={openCell} onDay={(i) => setDay(day === i ? null : i)} selectedDay={day} highlight={who} />
      </Panel>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_1fr]">
        <Panel title="Mood and energy" sub="Team average per working day, out of 5" action={<AIMark label="Read by AI" />}>
          <AreaChart
            height={190}
            labels={workIdx.map((i) => shortDate(i))}
            series={[
              { name: "Mood", data: workIdx.map((i) => moodByDay[i]), tone: "accent" },
              { name: "Energy (÷2)", data: energyByDay, tone: "info", dashed: true },
            ]}
            format={(v) => v.toFixed(1)}
          />
          <p className="mt-3 text-[12.5px] leading-relaxed text-d-mute">
            <Sparkles className="mr-1 inline h-3 w-3 text-[var(--d-gold)]" />
            Mood peaked on Batch 14 (13–14 Oct) and dipped 15–17 Oct as follow-up volume tripled. Sales recovers fastest; delivery stays flat while Spice Route is blocked.
          </p>
          <SectionLabel className="mb-2 mt-4">Mood by person · last 7 days · click to filter</SectionLabel>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {team
              .map((p) => {
                const list = REPORTS.filter((r) => r.who === p.id && r.day >= DAYS - 7);
                return { p, avg: list.length ? list.reduce((a, r) => a + r.mood, 0) / list.length : 0 };
              })
              .sort((a, b) => a.avg - b.avg)
              .map(({ p, avg }) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setWho(who === p.id ? "all" : p.id)}
                  className={cn("flex items-center gap-2 rounded-[10px] border px-2 py-1.5 text-left hover:bg-d-sunk", who === p.id ? "border-d-accent" : "border-d-line")}
                >
                  <PersonAvatar id={p.id} size={20} />
                  <span className="min-w-0 flex-1 truncate text-[12px] font-medium">{p.first}</span>
                  <span className="font-mono text-[11.5px] font-semibold" style={{ color: avg < 3 ? "var(--d-late)" : avg >= 3.8 ? "var(--d-ok)" : "var(--d-mute)" }}>
                    {avg.toFixed(1)}
                  </span>
                </button>
              ))}
          </div>
        </Panel>
        <Panel title="Blockers mentioned most" sub={`Last ${range} days · click one to filter`}>
          <HBars data={blockerCounts.slice(0, 7).map((x) => ({ label: x.b.key, value: x.n, sub: `${x.people.size} ${x.people.size === 1 ? "person" : "people"}`, tone: (x.b.key === blockerKey ? "accent" : x.n > 12 ? "late" : "warn") as Tone }))} onSelect={(l) => setBlockerKey(blockerKey === l ? null : l)} />
          {top && (
            <AgentNote
              className="mt-4"
              title={`“${top.b.key}” is now a pattern, not a one-off`}
              action={
                tasked.has(top.b.key) ? (
                  <Pill tone="ok">Task created for {personById[top.b.people?.[0] ?? (top.b.roles[0] === "sales" ? "rohan" : top.b.roles[0] === "delivery" ? "neha" : "aditya")].first}</Pill>
                ) : (
                  <Btn
                    size="sm"
                    variant="solid"
                    icon={ListPlus}
                    onClick={() => {
                      const owner = top.b.people?.[0] ?? (top.b.roles[0] === "sales" ? "rohan" : top.b.roles[0] === "delivery" ? "neha" : "aditya");
                      hq.addTask({ title: `Fix the root cause: ${top.b.text}`, owner, area: top.b.roles[0] === "sales" ? "Sales" : top.b.roles[0] === "delivery" ? "Delivery" : "Ops", priority: "P1", status: "Todo", dueIn: 2, due: "in 2d", aiDrafted: true });
                      hq.log(`turned the repeated blocker "${top.b.key}" into a task`, "accent");
                      setTasked((s) => new Set(s).add(top.b.key));
                      toast.success("Task created", { description: `Owner ${personById[owner].first}, due in 2 days` });
                    }}
                  >
                    Make it a task
                  </Btn>
                )
              }
            >
              {top.n} mentions from {[...top.people].map((p) => personById[p].first).join(", ")}{top.b.from ? ` since ${shortDate(top.b.from)}` : ""}. Nobody owns fixing it yet. Latest wording: &ldquo;{top.b.text}&rdquo;.
            </AgentNote>
          )}
        </Panel>
      </div>

      {/* filters + table */}
      <Panel className="mt-4" title="All reports" sub={`${filtered.length} match`}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <SearchBox value={query} onChange={setQuery} placeholder="Search wins, blockers, plans (try “EMI” or “Swiggy”)" className="w-full sm:w-80" />
          <label className={cn("inline-flex h-9 items-center rounded-[8px] border bg-d-panel pl-3 text-[13px]", who !== "all" ? "border-d-accent" : "border-d-line")}>
            <span className="text-d-mute">Person</span>
            <select value={who} onChange={(e) => setWho(e.target.value)} className="h-full cursor-pointer bg-transparent pl-1.5 pr-2 font-medium outline-none">
              <option value="all">Everyone</option>
              {team.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <Segmented size="sm" options={[{ value: "all", label: "All roles" }, { value: "sales", label: "Sales" }, { value: "delivery", label: "Delivery" }, { value: "ops", label: "Ops" }, { value: "founder", label: "Founder" }]} value={role} onChange={setRole} />
          <Segmented size="sm" options={[{ value: "7", label: "7 days" }, { value: "14", label: "14 days" }, { value: "30", label: "30 days" }]} value={range} onChange={(v) => { setRange(v); setDay(null); }} />
          <Toggle on={onlyBlocked} onClick={() => setOnlyBlocked((v) => !v)}>Has blockers</Toggle>
          <Toggle on={lowMood} onClick={() => setLowMood((v) => !v)}>Low mood</Toggle>
          {blockerKey && (
            <Pill tone="accent" className="h-7">
              {blockerKey}
              <button type="button" onClick={() => setBlockerKey(null)} className="ml-1 opacity-70 hover:opacity-100" aria-label="Clear blocker filter">
                ×
              </button>
            </Pill>
          )}
          {filters > 0 && (
            <Btn size="sm" variant="ghost" onClick={() => { setQuery(""); setWho("all"); setRole("all"); setDay(null); setOnlyBlocked(false); setLowMood(false); setBlockerKey(null); }}>
              Clear all
            </Btn>
          )}
        </div>
        <DataTable rows={filtered} columns={columns} rowKey={(r) => r.id} onRow={(r) => setOpenId(r.id)} pageSize={15} dense empty="No reports match these filters." />
      </Panel>

      {current && <ReaderSheet r={current} onClose={() => setOpenId(null)} onNav={setOpenId} />}
    </div>
  );
}

/* ---------------- pieces ---------------- */

function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={cn("h-7 rounded-[7px] border px-2.5 text-[12px] font-medium", on ? "border-d-accent bg-d-accent text-d-accent-ink" : "border-d-line bg-d-panel hover:bg-d-sunk")}>
      {children}
    </button>
  );
}

function cellStyle(c: Cell): React.CSSProperties {
  switch (c) {
    case "on":
      return { background: "var(--d-ok)" };
    case "late":
      return { background: "color-mix(in oklab, var(--d-warn) 70%, var(--d-panel))" };
    case "miss":
      return { background: "color-mix(in oklab, var(--d-late) 75%, var(--d-panel))" };
    case "holiday":
      return { background: "repeating-linear-gradient(45deg, color-mix(in oklab, var(--d-gold) 45%, var(--d-panel)) 0 2px, var(--d-panel) 2px 5px)" };
    case "pending":
      return { background: "var(--d-panel)", boxShadow: "inset 0 0 0 1.5px var(--d-accent)" };
    default:
      return { background: "var(--d-sunk)" };
  }
}

function HeatCalendar({ onCell, onDay, selectedDay, highlight }: { onCell: (p: string, i: number) => void; onDay: (i: number) => void; selectedDay: number | null; highlight: string }) {
  return (
    <div className="desk-scroll -mx-5 overflow-x-auto px-5">
      <div className="min-w-[980px]">
        <div className="relative ml-[150px] mr-[64px] h-10">
          {MARKERS.map((m) => (
            <span
              key={m.label}
              className="absolute whitespace-nowrap rounded-full px-1.5 text-[10px] font-semibold leading-[18px]"
              style={{ top: m.tone === "accent" ? 20 : 0, left: `${(m.from / DAYS) * 100}%`, minWidth: `${((m.to - m.from + 1) / DAYS) * 100}%`, color: m.tone === "neutral" ? "var(--d-mute)" : `var(--d-${m.tone === "warn" ? "gold" : m.tone})`, background: `color-mix(in oklab, ${m.tone === "warn" ? "var(--d-gold)" : m.tone === "neutral" ? "var(--d-mute)" : `var(--d-${m.tone})`} 12%, transparent)` }}
            >
              {m.label}
            </span>
          ))}
        </div>
        <div className="mt-1 flex items-end">
          <div className="w-[150px] shrink-0" />
          <div className="grid flex-1 gap-[3px]" style={{ gridTemplateColumns: `repeat(${DAYS}, minmax(0, 1fr))` }}>
            {Array.from({ length: DAYS }, (_, i) => (
              <button key={i} type="button" onClick={() => onDay(i)} className={cn("rounded py-0.5 text-center font-mono text-[9.5px] leading-tight hover:bg-d-sunk", selectedDay === i ? "bg-d-accent text-d-accent-ink" : i % 7 === 6 ? "text-d-line" : "text-d-mute")}>
                {WEEKDAY[i % 7][0]}
                <br />
                {dateOf(i).day}
              </button>
            ))}
          </div>
          <div className="w-[64px] shrink-0 pb-0.5 text-right text-[10px] uppercase tracking-[0.12em] text-d-mute">Rate</div>
        </div>
        <div className="mt-1.5 space-y-[3px]">
          {team.map((p: Person) => {
            const row = CELLS[p.id];
            const exp = row.filter((c) => c !== "off" && c !== "holiday" && c !== "pending").length;
            const got = row.filter((c) => c === "on" || c === "late").length - (row[TODAY] === "on" ? 1 : 0);
            const rate = Math.round((got / Math.max(1, exp - (row[TODAY] === "on" ? 1 : 0))) * 100);
            return (
              <div key={p.id} className={cn("flex items-center rounded-md transition-opacity", highlight !== "all" && highlight !== p.id && "opacity-35")}>
                <div className="flex w-[150px] shrink-0 items-center gap-2 pr-2">
                  <PersonAvatar id={p.id} size={22} />
                  <span className="truncate text-[12.5px] font-medium">{p.first}</span>
                  <span className="truncate text-[10.5px] text-d-mute">{p.role}</span>
                </div>
                <div className="grid flex-1 gap-[3px]" style={{ gridTemplateColumns: `repeat(${DAYS}, minmax(0, 1fr))` }}>
                  {row.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onCell(p.id, i)}
                      title={`${p.first} · ${dateLabel(i)} · ${c === "holiday" ? HOLIDAYS[i] : c}`}
                      className={cn("h-[22px] rounded-[4px] transition-transform hover:scale-110", selectedDay === i && "ring-2 ring-d-accent/60")}
                      style={cellStyle(c)}
                    />
                  ))}
                </div>
                <div className={cn("w-[64px] shrink-0 text-right font-mono text-[12px] font-semibold", rate < 80 ? "text-d-late" : rate < 92 ? "text-d-warn" : "text-d-ok")}>{rate}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DigestPanel({ digest, week, onWeek, onClose }: { digest: { step: number; data?: Digest }; week: WeekId; onWeek: (w: WeekId) => void; onClose: () => void }) {
  const hq = useHQ();
  const [posted, setPosted] = React.useState(false);
  const d = digest.data;
  const steps = ["Reading every report in the week", "Clustering wins into themes", "Counting repeated blockers", "Writing the digest"];
  return (
    <section className="desk-rise mt-4 rounded-[18px] border border-[color-mix(in_oklab,var(--d-gold)_35%,var(--d-line))] bg-[color-mix(in_oklab,var(--d-gold)_6%,var(--d-panel))] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <AIMark label="Report Summariser" />
          <h3 className="mt-2 font-serif text-[24px] font-medium leading-tight">{d ? `Week of ${d.week.label}` : "Writing the weekly digest…"}</h3>
          {d && (
            <p className="mt-1 text-[13px] text-d-mute">
              {d.filed} of {d.expected} reports filed · mood {d.mood.toFixed(1)}/5 <span style={{ color: d.mood >= d.prevMood ? "var(--d-ok)" : "var(--d-late)" }}>({d.mood >= d.prevMood ? "+" : ""}{(d.mood - d.prevMood).toFixed(1)} vs the week before)</span>
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented size="sm" options={WEEKS.map((w) => ({ value: w.id, label: w.label }))} value={week} onChange={onWeek} />
          <Btn size="sm" variant="ghost" onClick={onClose}>
            Close
          </Btn>
        </div>
      </div>
      {!d && (
        <ul className="mt-3 space-y-1.5">
          {steps.map((s, i) => (
            <li key={s} className={cn("flex items-center gap-2 text-[13px]", i > digest.step && "opacity-35")}>
              <span className={cn("h-3.5 w-3.5 rounded-full border-2 border-[var(--d-gold)]", i === digest.step && "animate-spin border-t-transparent", i < digest.step && "bg-[var(--d-gold)]")} />
              {s}
            </li>
          ))}
        </ul>
      )}
      {d && (
        <>
          <div className="mt-4 grid gap-5 lg:grid-cols-3">
            <div>
              <SectionLabel>Themes</SectionLabel>
              <ul className="space-y-2">
                {d.themes.map((t) => (
                  <li key={t.theme} className="rounded-[10px] bg-d-panel px-3 py-2 shadow-[0_0_0_1px_var(--d-line)]">
                    <p className="flex items-center justify-between text-[13px] font-semibold">
                      {t.theme}
                      <span className="font-mono text-[11px] text-d-mute">{t.count}×</span>
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-[12px] text-d-mute">{t.sample}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <SectionLabel>Repeated blockers</SectionLabel>
              <ul className="space-y-2">
                {d.blockers.map((b) => (
                  <li key={b.key} className="rounded-[10px] bg-d-panel px-3 py-2 shadow-[0_0_0_1px_var(--d-line)]">
                    <p className="flex items-center justify-between text-[13px] font-semibold">
                      {b.key}
                      <Pill tone={b.count >= 5 ? "late" : "warn"} mono>
                        {b.count}
                      </Pill>
                    </p>
                    <p className="mt-1 flex items-center gap-1">
                      {b.people.map((p) => (
                        <PersonAvatar key={p} id={p} size={18} />
                      ))}
                      <span className="ml-1 text-[11.5px] text-d-mute">since {shortDate(b.first)}</span>
                    </p>
                  </li>
                ))}
                {d.blockers.length === 0 && <li className="text-[13px] text-d-mute">No blockers repeated this week.</li>}
              </ul>
            </div>
            <div>
              <SectionLabel>Numbers and people</SectionLabel>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { k: "Dials", v: d.sales.dialled.toLocaleString("en-IN") },
                  { k: "Closes", v: d.sales.closes },
                  { k: "Booked", v: rupees(d.sales.revenue) },
                ].map((x) => (
                  <div key={x.k} className="rounded-[10px] bg-d-panel px-2.5 py-2 shadow-[0_0_0_1px_var(--d-line)]">
                    <p className="text-[10.5px] uppercase tracking-[0.12em] text-d-mute">{x.k}</p>
                    <p className="tnum font-serif text-[20px] leading-tight">{x.v}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[12.5px] leading-relaxed">
                {d.missed.length ? (
                  <>
                    Missed reports: {d.missed.map((m) => `${personById[m.who].first} (${m.n})`).join(", ")}.{" "}
                  </>
                ) : (
                  "Everyone filed every working day. "
                )}
                {d.low.length ? `${d.low.map((l) => personById[l.who].first).join(" and ")} logged low mood on ${d.low[0].days}+ days; worth a check-in before Diwali rush.` : "No one logged low mood more than once."}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-[color-mix(in_oklab,var(--d-gold)_25%,var(--d-line))] pt-3">
            <Btn
              size="sm"
              icon={Copy}
              onClick={() => {
                void navigator.clipboard?.writeText(digestText(d)).catch(() => undefined);
                toast.success("Digest copied", { description: "Paste it into WhatsApp or email" });
              }}
            >
              Copy text
            </Btn>
            <Btn
              size="sm"
              icon={Download}
              onClick={() => {
                const blob = new Blob([digestText(d)], { type: "text/markdown" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = `buildbiz-digest-${d.week.label.replace(/[^\w]+/g, "-")}.md`;
                a.click();
                URL.revokeObjectURL(a.href);
                toast("Exported", { description: `${a.download}` });
              }}
            >
              Export .md
            </Btn>
            <Btn
              size="sm"
              variant="solid"
              icon={Megaphone}
              disabled={posted}
              onClick={() => {
                hq.setAnnouncements((cur) => [{ id: `A-digest-${d.week.id}`, title: `Weekly digest · ${d.week.label}`, body: digestText(d).split("\n").slice(1).join("\n"), by: hq.me.id, at: "Just now", audience: "Everyone", reactions: {}, acks: [] }, ...cur.filter((a) => a.id !== `A-digest-${d.week.id}`)]);
                hq.log(`posted the ${d.week.label} weekly digest to Announcements`, "info");
                setPosted(true);
                toast.success("Posted to Announcements");
              }}
            >
              {posted ? "Posted" : "Post to Announcements"}
            </Btn>
          </div>
        </>
      )}
    </section>
  );
}

function ReaderSheet({ r, onClose, onNav }: { r: Report; onClose: () => void; onNav: (id: string) => void }) {
  const hq = useHQ();
  const p = personById[r.who];
  const mine = REPORTS.filter((x) => x.who === r.who).sort((a, b) => a.day - b.day);
  const idx = mine.findIndex((x) => x.id === r.id);
  const prev = mine[idx - 1];
  const next = mine[idx + 1];
  const [reply, setReply] = React.useState("");
  const [replies, setReplies] = React.useState<Record<string, string[]>>({});
  const [kudos, setKudos] = React.useState<Set<string>>(new Set());
  const avgMood = mine.reduce((a, x) => a + x.mood, 0) / Math.max(1, mine.length);
  const repeat = r.blockers.map((b) => ({ b, n: mine.filter((x) => x.day <= r.day && x.blockers.some((y) => y.key === b.key)).length }));
  const numDefs = NUMS[p.role];
  const avgOf = (k: string) => mine.reduce((a, x) => a + (x.nums[k] ?? 0), 0) / Math.max(1, mine.length);
  const best = numDefs.map((n) => ({ n, ratio: avgOf(n.key) ? (r.nums[n.key] ?? 0) / avgOf(n.key) : 1 })).sort((a, b) => b.ratio - a.ratio)[0];

  return (
    <Sheet
      open
      onOpenChange={(o) => !o && onClose()}
      width={580}
      eyebrow={`${dateLabel(r.day)} · filed ${r.at}${r.late ? " (late)" : ""}`}
      title={`${p.name}`}
      sub={p.title}
      footer={
        <>
          <Btn icon={ChevronLeft} disabled={!prev} onClick={() => prev && onNav(prev.id)}>
            {prev ? shortDate(prev.day) : "Earlier"}
          </Btn>
          <Btn disabled={!next} onClick={() => next && onNav(next.id)}>
            {next ? shortDate(next.day) : "Later"}
            <ChevronRight className="h-4 w-4" />
          </Btn>
        </>
      }
    >
      <div className="space-y-5">
        <AgentNote title="In one line">
          {r.wins[0]?.text}.{" "}
          {best && best.ratio > 1.15 ? `${best.n.label} ran ${Math.round((best.ratio - 1) * 100)}% above ${p.first}'s 30-day average. ` : ""}
          {repeat.some((x) => x.n >= 3) ? `“${repeat.find((x) => x.n >= 3)?.b.key}” has now come up ${repeat.find((x) => x.n >= 3)?.n} times in their reports. ` : ""}
          Mood {MOOD_WORD[r.mood].toLowerCase()}, {r.mood > avgMood + 0.4 ? "above" : r.mood < avgMood - 0.4 ? "below" : "close to"} their usual.
        </AgentNote>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {numDefs.map((n) => (
            <div key={n.key} className="rounded-[10px] bg-d-sunk/70 px-2.5 py-2">
              <p className="text-[10.5px] uppercase tracking-[0.12em] text-d-mute">{n.label}</p>
              <p className="tnum font-serif text-[20px] leading-tight">{n.money ? rupees(r.nums[n.key] ?? 0) : (r.nums[n.key] ?? 0).toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>

        <div>
          <SectionLabel>Wins</SectionLabel>
          <ul className="space-y-1.5">
            {r.wins.map((w) => (
              <li key={w.text} className="flex gap-2 text-[13.5px] leading-snug">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-d-ok" />
                <span className="flex-1">{w.text}</span>
                <span className="shrink-0 text-[11px] text-d-mute">{w.theme}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <SectionLabel>Blockers</SectionLabel>
          {r.blockers.length === 0 ? (
            <p className="text-[13px] text-d-mute">None reported.</p>
          ) : (
            <ul className="space-y-1.5">
              {repeat.map(({ b, n }) => (
                <li key={b.key} className="flex gap-2 text-[13.5px] leading-snug">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-d-warn" />
                  <span className="flex-1">{b.text}</span>
                  {n > 1 && <Pill tone={n >= 4 ? "late" : "warn"} mono>{n}× so far</Pill>}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <SectionLabel>Plan for the next day</SectionLabel>
          <ol className="list-decimal space-y-1 pl-5 text-[13.5px]">
            {r.plan.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ol>
        </div>
        <div className="flex items-center gap-4 rounded-[12px] bg-d-sunk/70 px-3 py-2.5 text-[13px]">
          <span>
            Mood <b>{MOOD_WORD[r.mood]}</b> ({r.mood}/5)
          </span>
          <span>
            Energy <b>{r.energy}/10</b>
          </span>
          <span className="ml-auto text-[12px] text-d-mute">their avg {avgMood.toFixed(1)}</span>
        </div>

        <div>
          <SectionLabel
            action={
              <Btn
                size="sm"
                variant={kudos.has(r.id) ? "soft" : "outline"}
                icon={Heart}
                disabled={kudos.has(r.id)}
                onClick={() => {
                  setKudos((s) => new Set(s).add(r.id));
                  hq.notify({ kind: "task", title: `${hq.me.first} liked your report`, body: `${dateLabel(r.day)}: ${r.wins[0]?.text}`, href: "/hq/history" }, { toast: false });
                  hq.log(`sent kudos to ${p.first} for the ${shortDate(r.day)} report (+5 pts)`, "ok");
                  toast.success(`Kudos sent to ${p.first}`, { description: "+5 points" });
                }}
              >
                {kudos.has(r.id) ? "Kudos sent" : "Kudos"}
              </Btn>
            }
          >
            Feedback
          </SectionLabel>
          <ul className="space-y-2">
            {(replies[r.id] ?? []).map((t, i) => (
              <li key={`${r.id}-r${i}`} className="flex gap-2">
                <PersonAvatar id={hq.me.id} size={24} />
                <p className="flex-1 rounded-[10px] bg-d-sunk px-3 py-2 text-[13px]">{t}</p>
              </li>
            ))}
          </ul>
          <form
            className="mt-2 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!reply.trim()) return;
              setReplies((cur) => ({ ...cur, [r.id]: [...(cur[r.id] ?? []), reply.trim()] }));
              hq.notify({ kind: "task", title: `${hq.me.first} replied to your report`, body: reply.trim(), href: "/hq/history" }, { toast: false });
              toast(`Reply sent to ${p.first}`);
              setReply("");
            }}
          >
            <input className={cn(inputClass, "h-9")} value={reply} onChange={(e) => setReply(e.target.value)} placeholder={`Reply to ${p.first}`} />
            <Btn type="submit" variant="solid" icon={Send} aria-label="Send reply" />
            <Btn icon={MessageSquare} onClick={() => setReply(r.blockers[0] ? `On "${r.blockers[0].key}": I'll take this up today. Ping me if it is still stuck by 5 PM.` : `Great day, ${p.first}. ${r.wins[0]?.text.split(",")[0]} is exactly the kind of thing we want more of.`)}>
              Suggest
            </Btn>
          </form>
        </div>
      </div>
    </Sheet>
  );
}
