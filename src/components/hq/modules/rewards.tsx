"use client";

import * as React from "react";
import { cn } from "cn";
import { toast } from "sonner";
import {
  Award,
  CalendarHeart,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
  Gift,
  HandHeart,
  Megaphone,
  Minus,
  Pause,
  PhoneCall,
  ShoppingBag,
  Sparkles,
  Target,
  Trophy,
  UtensilsCrossed,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import {
  AgentNote,
  AIMark,
  Btn,
  DataTable,
  Field,
  HBars,
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
import type { Tone } from "../../desk/types";

/* ---------------- data ---------------- */

function h(n: number, salt = 3) {
  let t = Math.imul(n + 37, 0x9e3779b1) ^ Math.imul(salt + 19, 0x85ebca6b);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const players = team.filter((p) => p.role !== "founder");

type LedgerType = "Calls" | "Close" | "Report on time" | "Task done" | "Kudos" | "Streak bonus" | "Redemption";
const TYPE_TONE: Record<LedgerType, Tone> = { Calls: "info", Close: "ok", "Report on time": "neutral", "Task done": "neutral", Kudos: "accent", "Streak bonus": "warn", Redemption: "late" };
const RULES: { type: LedgerType; pts: string; how: string }[] = [
  { type: "Calls", pts: "+1 per connect", how: "from the dialler, capped at 60/day" },
  { type: "Close", pts: "+150 / +400", how: "Launchpad / Accelerator and above" },
  { type: "Report on time", pts: "+15", how: "+5 under three minutes" },
  { type: "Task done", pts: "+10", how: "+15 for P0" },
  { type: "Kudos", pts: "+10 to +50", how: "given by anyone, 3 a week" },
  { type: "Streak bonus", pts: "+5 a day", how: "report streaks of 5+" },
];

type Entry = { id: string; who: string; type: LedgerType; pts: number; at: string; note: string; by?: string };

const SEED_LEDGER: Entry[] = [
  { id: "E1", who: "sneha", type: "Close", pts: 400, at: "Today, 9:52 AM", note: "Sunita Bansal · Accelerator ₹74,999" },
  { id: "E2", who: "imran", type: "Calls", pts: 58, at: "Today, 1:10 PM", note: "58 connects on the morning block" },
  { id: "E3", who: "vikram", type: "Task done", pts: 15, at: "Today, 9:31 AM", note: "P0 · Swiggy sync fix on Spice Route staging" },
  { id: "E4", who: "neha", type: "Kudos", pts: 25, at: "Today, 11:05 AM", note: "“Balaji UAT ko 84% tak le aayi in 3 days”", by: "amit" },
  { id: "E5", who: "meera", type: "Task done", pts: 10, at: "Today, 9:15 AM", note: "Paused 2 ad sets with CPL above ₹90" },
  { id: "E6", who: "aditya", type: "Report on time", pts: 20, at: "Today, 6:31 PM", note: "Filed in 1m 48s" },
  { id: "E7", who: "rohan", type: "Close", pts: 150, at: "Today, 12:40 PM", note: "Pooja Pandey · Launchpad ₹24,999" },
  { id: "E8", who: "arjun", type: "Calls", pts: 41, at: "Today, 2:20 PM", note: "41 connects, 7 consults booked" },
  { id: "E9", who: "priya", type: "Kudos", pts: 50, at: "Today, 10:30 AM", note: "“Called all 18 at-risk students before lunch. Asli hero.”", by: "neha" },
  { id: "E10", who: "sneha", type: "Streak bonus", pts: 5, at: "Today, 6:58 PM", note: "Report streak 27 days" },
  { id: "E11", who: "kavya", type: "Calls", pts: 33, at: "Today, 4:05 PM", note: "33 connects" },
  { id: "E12", who: "sahil", type: "Task done", pts: 10, at: "Yesterday, 5:40 PM", note: "Razorpay settlements for 16–18 Oct" },
  { id: "E13", who: "imran", type: "Kudos", pts: 25, at: "Yesterday, 7:20 PM", note: "“Qualified 34 Meta leads before 1 PM, mast speed”", by: "rohan" },
  { id: "E14", who: "rohan", type: "Calls", pts: 47, at: "Yesterday, 7:00 PM", note: "47 connects on Batch 14 attendees" },
  { id: "E15", who: "sneha", type: "Close", pts: 400, at: "Yesterday, 4:12 PM", note: "Harish Patel · Accelerator ₹74,999 (EMI)" },
  { id: "E16", who: "vikram", type: "Report on time", pts: 15, at: "Yesterday, 7:14 PM", note: "Filed in 3m 20s" },
  { id: "E17", who: "meera", type: "Kudos", pts: 25, at: "Yesterday, 11:00 AM", note: "“Owner-story creative = best CPL ever, ₹38”", by: "amit" },
  { id: "E18", who: "neha", type: "Task done", pts: 15, at: "Yesterday, 3:30 PM", note: "P0 · Apollo Pharma go-live checklist" },
  { id: "E19", who: "arjun", type: "Close", pts: 150, at: "Yesterday, 1:05 PM", note: "Alok Bansal · Launchpad ₹24,999" },
  { id: "E20", who: "priya", type: "Task done", pts: 10, at: "Yesterday, 12:10 PM", note: "Batch 14 recordings shared" },
  { id: "E21", who: "aditya", type: "Task done", pts: 10, at: "Mon, 6:00 PM", note: "Zoom licence quote for November" },
  { id: "E22", who: "kavya", type: "Report on time", pts: 15, at: "Mon, 8:52 PM", note: "Filed in 4m 10s" },
  { id: "E23", who: "imran", type: "Streak bonus", pts: 5, at: "Mon, 7:05 PM", note: "Report streak 31 days" },
  { id: "E24", who: "sneha", type: "Calls", pts: 52, at: "Mon, 7:30 PM", note: "52 connects" },
  { id: "E25", who: "vikram", type: "Kudos", pts: 25, at: "Mon, 5:15 PM", note: "“Night shift on the Swiggy webhook, respect”", by: "neha" },
  { id: "E26", who: "rohan", type: "Report on time", pts: 15, at: "Mon, 7:25 PM", note: "Filed in 2m 05s" },
  { id: "E27", who: "sahil", type: "Report on time", pts: 15, at: "Mon, 7:50 PM", note: "Filed in 2m 40s" },
  { id: "E28", who: "meera", type: "Calls", pts: 0, at: "Mon, 9:00 AM", note: "No dialler activity (marketing)" },
  { id: "E29", who: "arjun", type: "Redemption", pts: -600, at: "Sat, 4:00 PM", note: "Swiggy voucher ₹500 · approved by Amit" },
  { id: "E30", who: "neha", type: "Close", pts: 400, at: "Sat, 2:30 PM", note: "Upsell · Balaji DFY phase 2 ₹1.9 L" },
  { id: "E31", who: "priya", type: "Report on time", pts: 20, at: "Sat, 6:40 PM", note: "Filed in 1m 30s" },
  { id: "E32", who: "kavya", type: "Close", pts: 150, at: "Sat, 12:00 PM", note: "Payal Shetty · Launchpad ₹24,999" },
  { id: "E33", who: "imran", type: "Calls", pts: 60, at: "Sat, 1:45 PM", note: "Cap hit · 60 connects" },
  { id: "E34", who: "aditya", type: "Kudos", pts: 10, at: "Fri, 5:00 PM", note: "“Diwali leave sheet sorted in 1 day”", by: "sahil" },
  { id: "E35", who: "sahil", type: "Task done", pts: 15, at: "Fri, 4:20 PM", note: "P0 · TDS return data to CA" },
  { id: "E36", who: "vikram", type: "Close", pts: 400, at: "Fri, 11:10 AM", note: "Upsell · Care Dental recall agent ₹60k" },
];

/** Base totals before anything that happens on this page. */
const BASE: Record<string, { week: number; month: number; lastRank: number; streak: number }> = {
  sneha: { week: 1480, month: 5210, lastRank: 1, streak: 27 },
  imran: { week: 1310, month: 4630, lastRank: 4, streak: 31 },
  rohan: { week: 1190, month: 4480, lastRank: 2, streak: 11 },
  arjun: { week: 1020, month: 3390, lastRank: 3, streak: 8 },
  kavya: { week: 860, month: 2710, lastRank: 5, streak: 4 },
  neha: { week: 690, month: 2480, lastRank: 8, streak: 19 },
  vikram: { week: 640, month: 2150, lastRank: 6, streak: 14 },
  priya: { week: 610, month: 2290, lastRank: 10, streak: 22 },
  meera: { week: 560, month: 2060, lastRank: 7, streak: 23 },
  aditya: { week: 520, month: 1980, lastRank: 9, streak: 16 },
  sahil: { week: 430, month: 1640, lastRank: 11, streak: 6 },
};
function pIdx(id: string) {
  return team.findIndex((p) => p.id === id);
}

type Badge = { id: string; name: string; icon: LucideIcon; how: string; holders: string[]; progress?: (id: string) => number };
const BADGES: Badge[] = [
  { id: "century", name: "Century Caller", icon: PhoneCall, how: "100 connects in a day", holders: ["imran", "sneha"], progress: (id) => (id === "rohan" ? 82 : id === "arjun" ? 64 : 30) },
  { id: "closer", name: "Closer of the Week", icon: Trophy, how: "Most revenue booked this week", holders: ["sneha"] },
  { id: "streak30", name: "30-Day Streak", icon: Flame, how: "A report every working day for 30 days", holders: ["imran"], progress: (id) => Math.min(100, Math.round(((BASE[id]?.streak ?? 0) / 30) * 100)) },
  { id: "batch14", name: "Batch 14 Hero", icon: Award, how: "Went above and beyond on Batch 14", holders: ["priya", "meera", "rohan", "aditya"] },
  { id: "zero", name: "Zero Overdue", icon: Check, how: "No overdue tasks for 14 days", holders: ["neha", "aditya"], progress: (id) => (id === "sahil" ? 20 : 70) },
  { id: "saver", name: "Student Saver", icon: HandHeart, how: "Brought 10 at-risk students back", holders: ["priya"] },
  { id: "cpl", name: "CPL Crusher", icon: Target, how: "CPL under ₹40 for a full week", holders: ["meera"] },
  { id: "early", name: "Early Bird", icon: Clock, how: "Report filed before 7 PM, 10 days running", holders: ["aditya", "sneha", "priya"] },
];

type Reward = { id: string; name: string; cost: number; icon: LucideIcon; note: string; stock?: string };
const CATALOGUE: Reward[] = [
  { id: "amazon1k", name: "Amazon voucher ₹1,000", cost: 1200, icon: ShoppingBag, note: "Delivered on email within an hour" },
  { id: "swiggy500", name: "Swiggy voucher ₹500", cost: 600, icon: UtensilsCrossed, note: "Team favourite for late calling nights" },
  { id: "amazon25", name: "Amazon voucher ₹2,500", cost: 2800, icon: ShoppingBag, note: "Diwali shopping, sorted" },
  { id: "leave", name: "Extra leave day before Diwali", cost: 2500, icon: CalendarHeart, note: "Any day 2–6 Nov · needs coverage", stock: "4 left" },
  { id: "dinner", name: "Dinner with Amit sir", cost: 4000, icon: UtensilsCrossed, note: "One-on-one, his pick of restaurant", stock: "1 a month" },
  { id: "wfh", name: "Work-from-home Friday", cost: 900, icon: Gift, note: "Not on workshop weeks" },
  { id: "mithai", name: "Haldiram's Diwali hamper for family", cost: 1500, icon: Gift, note: "Shipped to your home address" },
  { id: "course", name: "Free Launchpad seat for a friend", cost: 3200, icon: Award, note: "Worth ₹24,999" },
];

type Request = { id: string; who: string; reward: string; at: string; state: "pending" | "approved" | "held" };
const SEED_REQUESTS: Request[] = [
  { id: "Q1", who: "priya", reward: "leave", at: "Today, 10:42 AM", state: "pending" },
  { id: "Q2", who: "imran", reward: "amazon1k", at: "Today, 8:15 AM", state: "pending" },
  { id: "Q3", who: "sneha", reward: "dinner", at: "Yesterday, 9:30 PM", state: "pending" },
];

const VALUES = ["Ownership", "Customer first", "Speed", "Teamwork", "Hustle", "Craft"] as const;
const KUDOS_LINES: Record<string, string[]> = {
  sneha: ["Two Accelerator closes in two days, including Harish ji on EMI. Closing machine.", "Batch 14 follow-ups pe full focus, aur results dikh rahe hain."],
  imran: ["34 Meta leads qualified before 1 PM, and 9 of them hot. Pipeline is full because of you.", "31-day report streak. Consistency ka doosra naam."],
  priya: ["Called all 18 at-risk students and got 11 back on track. That is retention we can bank.", "Batch 14 recordings and blueprint pack out on time, zero complaints."],
  vikram: ["Late night on the Swiggy webhook so Spice Route could keep moving. Ownership.", "Apollo Pharma go-live without a single rollback."],
  neha: ["Balaji UAT from 40% to 84% in three days. Client is already talking about phase 2.", "Kept two go-lives on track in the same week."],
  meera: ["CPL at ₹38 on the owner-story creative, best we've ever had.", "Scaled to ₹45k/day without CPL slipping."],
  rohan: ["Ran the closing drill and the team's close rate moved to 16.8%.", "Every Batch 14 attendee got a call within 24 hours."],
  arjun: ["Distributor desk demo landed the Balaji referral.", "Seven consults booked in one afternoon."],
  kavya: ["Payal Shetty ka Launchpad close after four follow-ups. Patience pays.", "Picked up Rohan's callbacks without being asked."],
  aditya: ["Diwali leave calendar and coverage plan done in a day.", "Zoom licence negotiated down for November."],
  sahil: ["TDS data to the CA ahead of time, and October settlements reconciled.", "Chased Skyline's milestone 2 without letting it get awkward."],
};

const TEAM_GOALS = [
  { id: "points", label: "October team points", target: 40000, unit: "pts", reward: "Team offsite at Lonavala, 21–22 Nov" },
  { id: "regs", label: "Batch 15 registrations", target: 1500, current: 1066, unit: "regs", reward: "Pizza party on workshop night" },
  { id: "bookings", label: "October bookings", target: 6000000, current: 4130000, unit: "₹", reward: "₹2,000 Amazon voucher each" },
];

/* ---------------- module ---------------- */

type Range = "week" | "month";

export default function OperationsRewards() {
  const hq = useHQ();
  const [range, setRange] = React.useState<Range>("week");
  const [roleFilter, setRoleFilter] = React.useState<"all" | "sales" | "delivery" | "ops">("all");
  const [ledger, setLedger] = React.useState<Entry[]>(SEED_LEDGER);
  const [requests, setRequests] = React.useState<Request[]>(SEED_REQUESTS);
  const [kudosFor, setKudosFor] = React.useState<{ to: string; value?: string; note?: string } | null>(null);
  const [personSheet, setPersonSheet] = React.useState<string | null>(null);
  const [redeemAs, setRedeemAs] = React.useState<string | null>(null);
  const [confirm, setConfirm] = React.useState<Reward | null>(null);
  const [goal, setGoal] = React.useState("points");
  const [pick, setPick] = React.useState<{ step: number; done: boolean } | null>(null);
  const [fair, setFair] = React.useState<"idle" | "applied">("idle");
  const [shouted, setShouted] = React.useState<Set<string>>(new Set());
  const seq = React.useRef(100);
  const timers = React.useRef<number[]>([]);
  React.useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const live = ledger.filter((e) => !SEED_LEDGER.includes(e));
  const extra = (id: string) => live.filter((e) => e.who === id && e.type !== "Redemption").reduce((a, e) => a + e.pts, 0);
  const spent = (id: string) => ledger.filter((e) => e.who === id && e.type === "Redemption").reduce((a, e) => a - e.pts, 0);
  const points = (id: string, r: Range) => (BASE[id]?.[r] ?? 0) + extra(id) + (fair === "applied" && personById[id].role !== "sales" ? (r === "week" ? 60 : 180) : 0);
  const balance = (id: string) => points(id, "month") + 1400 + Math.round(h(pIdx(id), 9) * 2200) - spent(id);

  const board = players
    .filter((p) => roleFilter === "all" || p.role === roleFilter)
    .map((p) => ({ p, pts: points(p.id, range) }))
    .sort((a, b) => b.pts - a.pts);
  const overallRank = Object.fromEntries([...players].map((p) => ({ id: p.id, pts: points(p.id, "week") })).sort((a, b) => b.pts - a.pts).map((x, i) => [x.id, i + 1]));
  const teamMonth = players.reduce((a, p) => a + points(p.id, "month"), 0);
  const kudosWeek = ledger.filter((e) => e.type === "Kudos").length;
  const pending = requests.filter((r) => r.state === "pending");
  const isFounder = hq.me.role === "founder";
  const redeemer = redeemAs ?? (isFounder ? board[0]?.p.id ?? "sneha" : hq.me.id);

  const salesAvg = players.filter((p) => p.role === "sales").reduce((a, p) => a + points(p.id, "week"), 0) / players.filter((p) => p.role === "sales").length;
  const otherAvg = players.filter((p) => p.role !== "sales").reduce((a, p) => a + points(p.id, "week"), 0) / players.filter((p) => p.role !== "sales").length;

  const picks = [
    { id: "priya", headline: "Brought 11 of 18 at-risk students back", reasons: ["Called every at-risk student from Batch 13 before lunch on Tuesday", "Batch 14 recordings and blueprint pack shipped on time", "Delivery work rarely shows on the points board; she's 8th by points, 1st on impact"], value: "Customer first" },
    { id: "imran", headline: "31-day report streak and the fullest pipeline", reasons: ["Qualified 34 Meta leads before 1 PM, 9 scored hot", "Hit the 60-connect cap on Saturday", "Not had public kudos from Amit in 6 weeks"], value: "Hustle" },
    { id: "vikram", headline: "Unblocked Spice Route on his own time", reasons: ["Swiggy sync fix landed Monday night", "Apollo Pharma go-live with zero rollbacks", "Mentioned as the reason for progress in 3 teammates' reports"], value: "Ownership" },
  ];

  function addEntry(e: Omit<Entry, "id">) {
    seq.current += 1;
    const entry = { ...e, id: `E-n${seq.current}` };
    setLedger((cur) => [entry, ...cur]);
    return entry;
  }

  function giveKudos(to: string, pts: number, value: string, note: string, announce: boolean) {
    addEntry({ who: to, type: "Kudos", pts, at: "Just now", note: `“${note}”`, by: hq.me.id });
    hq.log(`gave ${personById[to].first} kudos for ${value.toLowerCase()} (+${pts} pts): ${note}`, "accent");
    hq.notify({ kind: "announcement", title: `${hq.me.first} sent you kudos · +${pts}`, body: note, href: "/hq/rewards" }, { toast: false });
    if (announce)
      hq.setAnnouncements((cur) => [{ id: `A-kudos-${seq.current}`, title: `Kudos to ${personById[to].first}: ${value}`, body: note, by: hq.me.id, at: "Just now", audience: "Everyone", reactions: { "👏": 1 }, acks: [] }, ...cur]);
    toast.success(`Kudos sent to ${personById[to].first}`, { description: `+${pts} points${announce ? " · posted to Announcements" : " · in the activity feed"}` });
  }

  function decide(req: Request, state: "approved" | "held") {
    const reward = CATALOGUE.find((c) => c.id === req.reward)!;
    setRequests((cur) => cur.map((r) => (r.id === req.id ? { ...r, state } : r)));
    if (state === "approved") {
      addEntry({ who: req.who, type: "Redemption", pts: -reward.cost, at: "Just now", note: `${reward.name} · approved by ${hq.me.first}` });
      hq.notify({ kind: "announcement", title: `Approved: ${reward.name}`, body: `${hq.me.first} approved your redemption. ${reward.note}.`, href: "/hq/rewards" }, { toast: false });
      hq.log(`approved ${personById[req.who].first}'s redemption: ${reward.name}`, "ok");
      toast.success(`Approved for ${personById[req.who].first}`, { description: `${reward.name} · −${reward.cost.toLocaleString("en-IN")} pts` });
    } else {
      hq.log(`put ${personById[req.who].first}'s redemption on hold: ${reward.name}`, "warn");
      toast(`On hold`, { description: `${reward.name} for ${personById[req.who].first}` });
    }
  }

  function runPick() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setPick({ step: 0, done: false });
    [1, 2, 3].forEach((s) => timers.current.push(window.setTimeout(() => setPick({ step: s, done: false }), s * 380)));
    timers.current.push(window.setTimeout(() => setPick({ step: 4, done: true }), 1500));
  }

  const ledgerColumns: Column<Entry>[] = [
    { key: "who", label: "Person", render: (e) => <PersonChip id={e.who} />, sort: (e) => personById[e.who].first },
    { key: "type", label: "Type", render: (e) => <Pill tone={TYPE_TONE[e.type]}>{e.type}</Pill>, sort: (e) => e.type },
    { key: "note", label: "For", render: (e) => <span className="line-clamp-1 max-w-[380px] text-[12.5px]">{e.note}{e.by && <span className="text-d-mute"> · from {personById[e.by].first}</span>}</span> },
    { key: "at", label: "When", render: (e) => <span className="whitespace-nowrap font-mono text-[11.5px] text-d-mute">{e.at}</span>, wide: true },
    { key: "pts", label: "Points", align: "right", render: (e) => <span className={cn("tnum font-mono text-[13px] font-semibold", e.pts < 0 ? "text-d-late" : "text-d-ok")}>{e.pts > 0 ? "+" : ""}{e.pts.toLocaleString("en-IN")}</span>, sort: (e) => e.pts },
  ];

  const goalMeta = TEAM_GOALS.find((g) => g.id === goal)!;
  const goalCurrent = goal === "points" ? teamMonth : goalMeta.current ?? 0;

  return (
    <div>
      <PageHeader
        kicker="Operations"
        title="Operations Rewards"
        sub="Points for the work that moves the business: calls, closes, reports on time, tasks done and kudos from teammates. Redeem them for things people actually want."
        actions={
          <>
            <Btn icon={Wand2} onClick={runPick}>
              Who deserves recognition?
            </Btn>
            <Btn variant="solid" icon={HandHeart} onClick={() => setKudosFor({ to: "priya" })}>
              Give kudos
            </Btn>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label="Points this month" value={teamMonth.toLocaleString("en-IN")} delta="+12%" hint="vs September, same day" />
        <Metric label="Kudos this week" value={kudosWeek} hint={`${new Set(ledger.filter((e) => e.type === "Kudos").map((e) => e.by)).size} people giving`} />
        <Metric label="Redemptions waiting" value={pending.length} hint={pending.length ? "needs Amit's approval" : "all clear"} onClick={() => document.getElementById("approvals")?.scrollIntoView({ behavior: "smooth", block: "center" })} />
        <Metric label="Longest streak" value={`${Math.max(...players.map((p) => BASE[p.id].streak))}d`} hint={`${personById[players.reduce((a, p) => (BASE[p.id].streak > BASE[a.id].streak ? p : a)).id].first}, daily reports`} />
      </div>

      {pick && (
        <section className="desk-rise mt-4 rounded-[18px] border border-[color-mix(in_oklab,var(--d-gold)_35%,var(--d-line))] bg-[color-mix(in_oklab,var(--d-gold)_6%,var(--d-panel))] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <AIMark label="Recognition pick" />
              <h3 className="mt-2 font-serif text-[22px] font-medium">{pick.done ? "Three people who earned a public thank-you this week" : "Reading the week…"}</h3>
            </div>
            <Btn size="sm" variant="ghost" onClick={() => setPick(null)}>
              Dismiss
            </Btn>
          </div>
          {!pick.done ? (
            <ul className="mt-3 space-y-1.5">
              {["Scanning 63 daily reports for mentions of teammates", "Comparing impact against points earned", "Checking who hasn't been recognised lately", "Writing reasons"].map((s, i) => (
                <li key={s} className={cn("flex items-center gap-2 text-[13px]", i > pick.step && "opacity-35")}>
                  {i < pick.step ? <Check className="h-3.5 w-3.5 text-d-ok" /> : <span className={cn("h-3.5 w-3.5 rounded-full border-2 border-[var(--d-gold)]", i === pick.step && "animate-spin border-t-transparent")} />}
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {picks.map((x, i) => (
                <div key={x.id} className="flex flex-col rounded-[14px] bg-d-panel p-4 shadow-[0_0_0_1px_var(--d-line)]">
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-[28px] leading-none text-d-mute">{i + 1}</span>
                    <PersonAvatar id={x.id} size={34} />
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold">{personById[x.id].name}</p>
                      <p className="text-[11.5px] text-d-mute">{personById[x.id].title}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-[13.5px] font-medium">{x.headline}</p>
                  <ul className="mt-2 flex-1 space-y-1">
                    {x.reasons.map((r) => (
                      <li key={r} className="flex gap-2 text-[12.5px] leading-snug text-d-mute">
                        <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-[var(--d-gold)]" />
                        {r}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex gap-2">
                    <Btn size="sm" variant="solid" icon={HandHeart} onClick={() => setKudosFor({ to: x.id, value: x.value, note: KUDOS_LINES[x.id][0] })}>
                      Give kudos
                    </Btn>
                    <Btn
                      size="sm"
                      icon={Megaphone}
                      disabled={shouted.has(x.id)}
                      onClick={() => {
                        hq.setAnnouncements((cur) => [{ id: `A-shout-${x.id}`, title: `Shout-out: ${personById[x.id].first}`, body: `${x.headline}. ${x.reasons[0]}.`, by: hq.me.id, at: "Just now", audience: "Everyone", reactions: { "👏": 1 }, acks: [] }, ...cur]);
                        hq.log(`gave ${personById[x.id].first} a shout-out in Announcements`, "accent");
                        setShouted((s) => new Set(s).add(x.id));
                        toast.success("Posted to Announcements");
                      }}
                    >
                      {shouted.has(x.id) ? "Posted" : "Shout-out"}
                    </Btn>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_1fr]">
        {/* leaderboard */}
        <Panel
          title="Leaderboard"
          icon={Trophy}
          sub={range === "week" ? "Mon 19 – Sun 25 Oct" : "October so far"}
          action={<Segmented size="sm" options={[{ value: "week", label: "Week" }, { value: "month", label: "Month" }]} value={range} onChange={setRange} />}
        >
          <Segmented size="sm" className="mb-3" options={[{ value: "all", label: "Everyone" }, { value: "sales", label: "Sales" }, { value: "delivery", label: "Delivery" }, { value: "ops", label: "Ops" }]} value={roleFilter} onChange={setRoleFilter} />
          <ol className="space-y-1">
            {board.map(({ p, pts }, i) => {
              const move = BASE[p.id].lastRank - overallRank[p.id];
              const max = board[0]?.pts || 1;
              return (
                <li key={p.id}>
                  <button type="button" onClick={() => setPersonSheet(p.id)} className={cn("flex w-full items-center gap-3 rounded-[12px] px-2.5 py-2 text-left transition-colors hover:bg-d-sunk", i === 0 && "bg-[color-mix(in_oklab,var(--d-gold)_9%,var(--d-panel))]")}>
                    <span className={cn("w-6 text-center font-serif text-[20px] leading-none", i < 3 ? "text-d-ink" : "text-d-mute")}>{i + 1}</span>
                    <PersonAvatar id={p.id} size={30} ring={i === 0} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[13.5px] font-semibold">{p.name}</span>
                        {BADGES.filter((b) => b.holders.includes(p.id))
                          .slice(0, 2)
                          .map((b) => (
                            <b.icon key={b.id} className="h-3.5 w-3.5 shrink-0 text-[var(--d-gold)]" aria-label={b.name} />
                          ))}
                      </span>
                      <span className="mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-d-sunk">
                        <span className="desk-growx block h-full rounded-full bg-d-accent" style={{ width: `${(pts / max) * 100}%`, opacity: 0.35 + 0.65 * (pts / max) }} />
                      </span>
                    </span>
                    <span className="inline-flex w-12 items-center justify-end gap-0.5 font-mono text-[11px]" title="Rank change vs last week">
                      {move > 0 ? <ChevronUp className="h-3.5 w-3.5 text-d-ok" /> : move < 0 ? <ChevronDown className="h-3.5 w-3.5 text-d-late" /> : <Minus className="h-3 w-3 text-d-mute" />}
                      <span className={move > 0 ? "text-d-ok" : move < 0 ? "text-d-late" : "text-d-mute"}>{move !== 0 ? Math.abs(move) : ""}</span>
                    </span>
                    <span className="inline-flex w-12 items-center justify-end gap-1 font-mono text-[11.5px] text-d-mute">
                      <Flame className="h-3 w-3 text-d-warn" />
                      {BASE[p.id].streak}
                    </span>
                    <span className="tnum w-16 text-right font-serif text-[19px]">{pts.toLocaleString("en-IN")}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          {fair === "idle" && otherAvg < salesAvg * 0.75 && (
            <AgentNote
              className="mt-4"
              title="Fairness check: delivery and ops trail sales by design"
              action={
                <Btn size="sm" variant="solid" onClick={() => { setFair("applied"); hq.log("applied the impact multiplier for delivery and ops points", "accent"); toast.success("Rule applied", { description: "+60 pts/week to delivery and ops for client and student outcomes" }); }}>
                  Apply impact bonus
                </Btn>
              }
            >
              Sales averages {Math.round(salesAvg)} pts a week, everyone else {Math.round(otherAvg)}. Calls and closes are counted automatically; go-lives and student saves are not. A +60/week impact bonus for outcomes closes half the gap without touching sales.
            </AgentNote>
          )}
          {fair === "applied" && (
            <p className="mt-3 flex items-center gap-2 text-[12px] text-d-mute">
              <AIMark label="Rule" /> Impact bonus active for delivery and ops.
              <button type="button" className="text-d-accent hover:underline" onClick={() => setFair("idle")}>
                Undo
              </button>
            </p>
          )}
        </Panel>

        <div className="space-y-4">
          {/* team goals */}
          <Panel title="Team goals" icon={Target} sub="Everyone wins these together">
            <div className="space-y-3">
              {TEAM_GOALS.map((g) => {
                const cur = g.id === "points" ? teamMonth : g.current ?? 0;
                const pct = Math.round((cur / g.target) * 100);
                return (
                  <button key={g.id} type="button" onClick={() => setGoal(g.id)} className={cn("block w-full rounded-[12px] border p-3 text-left transition-colors", goal === g.id ? "border-d-accent bg-d-soft/40" : "border-d-line hover:bg-d-sunk")}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[13px] font-semibold">{g.label}</span>
                      <span className="font-mono text-[12px]">
                        {g.unit === "₹" ? `₹${(cur / 1e5).toFixed(1)} L / ₹${(g.target / 1e5).toFixed(0)} L` : `${cur.toLocaleString("en-IN")} / ${g.target.toLocaleString("en-IN")}`}
                      </span>
                    </div>
                    <Meter value={cur} max={g.target} tone={pct >= 100 ? "ok" : pct >= 70 ? "accent" : "warn"} className="mt-2" />
                    <p className="mt-1.5 flex justify-between text-[11.5px] text-d-mute">
                      <span>
                        <Gift className="mr-1 inline h-3 w-3" />
                        {g.reward}
                      </span>
                      <span className="font-mono">{pct}%</span>
                    </p>
                  </button>
                );
              })}
            </div>
            <SectionLabel className="mb-2 mt-4">{goalMeta.label} · who&rsquo;s contributing</SectionLabel>
            <HBars
              data={(goal === "points"
                ? players.map((p) => ({ label: p.first, value: points(p.id, "month") }))
                : goal === "regs"
                  ? [{ label: "Meera · Meta ads", value: 702 }, { label: "Workshop referrals", value: 188 }, { label: "Instagram organic", value: 121 }, { label: "Imran · WhatsApp", value: 55 }]
                  : players.filter((p) => p.role === "sales" || p.id === "neha" || p.id === "vikram").map((p, i) => ({ label: p.first, value: Math.round((goalCurrent / 7) * (0.5 + h(i, 31))) }))
              )
                .sort((a, b) => b.value - a.value)
                .slice(0, 5)}
              format={(v) => (goal === "bookings" ? `₹${(v / 1e5).toFixed(1)} L` : v.toLocaleString("en-IN"))}
            />
            <p className="mt-3 text-[12px] text-d-mute">
              <Sparkles className="mr-1 inline h-3 w-3 text-[var(--d-gold)]" />
              {goal === "points"
                ? `At this pace the team lands at ${Math.round((teamMonth / 20) * 31).toLocaleString("en-IN")} points by 31 Oct. Lonavala is on.`
                : goal === "regs"
                  ? "Needs 434 more in 11 days, about 40 a day. Current run-rate is 52; on track if CPL holds."
                  : "₹16.2 L to go. Three Accelerator closes a day for the rest of the month gets there."}
            </p>
          </Panel>
        </div>
      </div>

      {/* catalogue + approvals */}
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel
          title="Rewards catalogue"
          icon={Gift}
          sub={`${personById[redeemer].first}'s balance: ${balance(redeemer).toLocaleString("en-IN")} pts`}
          action={
            <label className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-d-line bg-d-panel pl-1.5 text-[12.5px]">
              <PersonAvatar id={redeemer} size={20} />
              <select value={redeemer} onChange={(e) => setRedeemAs(e.target.value)} className="h-full cursor-pointer bg-transparent pr-1 font-medium outline-none">
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    Redeem as {p.first}
                  </option>
                ))}
              </select>
            </label>
          }
        >
          <div className="grid gap-2.5 sm:grid-cols-2">
            {CATALOGUE.map((c) => {
              const bal = balance(redeemer);
              const can = bal >= c.cost;
              const asked = requests.some((r) => r.who === redeemer && r.reward === c.id && r.state === "pending");
              return (
                <div key={c.id} className="flex items-start gap-3 rounded-[12px] border border-d-line p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-d-sunk text-d-accent">
                    <c.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold leading-snug">{c.name}</p>
                    <p className="text-[11.5px] text-d-mute">
                      {c.note}
                      {c.stock && <span> · {c.stock}</span>}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-mono text-[12px] font-semibold">{c.cost.toLocaleString("en-IN")} pts</span>
                      {asked ? (
                        <Pill tone="warn" className="ml-auto">
                          Awaiting approval
                        </Pill>
                      ) : can ? (
                        <Btn size="sm" variant="soft" className="ml-auto" onClick={() => setConfirm(c)}>
                          Redeem
                        </Btn>
                      ) : (
                        <span className="ml-auto font-mono text-[11px] text-d-mute">{(c.cost - bal).toLocaleString("en-IN")} to go</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <div id="approvals">
          <Panel title="Approvals" sub={isFounder ? "Redemptions waiting on you" : "Redemptions waiting on Amit"} action={pending.length > 0 && <Pill tone="warn" mono>{pending.length}</Pill>}>
            <ul className="divide-y divide-d-line">
              {requests.map((r) => {
                const reward = CATALOGUE.find((c) => c.id === r.reward)!;
                return (
                  <li key={r.id} className={cn("py-3", r.state !== "pending" && "opacity-60")}>
                    <div className="flex items-start gap-2.5">
                      <PersonAvatar id={r.who} size={28} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium">
                          {personById[r.who].first} · {reward.name}
                        </p>
                        <p className="text-[11.5px] text-d-mute">
                          {r.at} · {reward.cost.toLocaleString("en-IN")} pts of {balance(r.who).toLocaleString("en-IN")}
                        </p>
                        {r.state === "pending" && (
                          <p className="mt-1 flex items-start gap-1.5 text-[11.5px] leading-snug text-[color-mix(in_oklab,var(--d-gold)_70%,black)]">
                            <Sparkles className="mt-0.5 h-3 w-3 shrink-0" />
                            {reward.id === "leave" ? "Coverage OK: Neha can take her 4 Nov student calls. Not a workshop week." : reward.id === "dinner" ? "Top closer two weeks running. Your Thursday 8 PM is free." : "Within balance, no redemptions in the last 30 days."}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end gap-1.5">
                      {r.state === "pending" ? (
                        isFounder ? (
                          <>
                            <Btn size="sm" icon={Pause} onClick={() => decide(r, "held")}>
                              Hold
                            </Btn>
                            <Btn size="sm" variant="solid" icon={Check} onClick={() => decide(r, "approved")}>
                              Approve
                            </Btn>
                          </>
                        ) : (
                          <Pill tone="warn">With Amit</Pill>
                        )
                      ) : (
                        <Pill tone={r.state === "approved" ? "ok" : "warn"}>{r.state === "approved" ? "Approved" : "On hold"}</Pill>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>
      </div>

      {/* badges */}
      <Panel className="mt-4" title="Badges and streaks" icon={Award} sub="Earned, not given. Click a badge to see who holds it.">
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {BADGES.map((b) => (
            <BadgeCard key={b.id} b={b} meId={redeemer} />
          ))}
        </div>
      </Panel>

      {/* ledger */}
      <Panel className="mt-4" title="Points ledger" sub="Every point, where it came from. Kudos and redemptions from this session appear at the top.">
        <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1.5 rounded-[12px] bg-d-sunk/60 px-3 py-2.5">
          {RULES.map((r) => (
            <span key={r.type} className="text-[11.5px]">
              <b className="font-semibold">{r.type}</b> <span className="font-mono">{r.pts}</span> <span className="text-d-mute">· {r.how}</span>
            </span>
          ))}
        </div>
        <DataTable
          rows={ledger}
          columns={ledgerColumns}
          rowKey={(e) => e.id}
          search={(e) => `${personById[e.who].name} ${e.note} ${e.type}`}
          searchPlaceholder="Search ledger"
          filter={{ get: (e) => e.type, options: ["Calls", "Close", "Report on time", "Task done", "Kudos", "Streak bonus", "Redemption"] }}
          onRow={(e) => setPersonSheet(e.who)}
          pageSize={15}
          dense
        />
      </Panel>

      {kudosFor && (
        <KudosModal
          key={`${kudosFor.to}-${kudosFor.value ?? ""}`}
          seed={kudosFor}
          onClose={() => setKudosFor(null)}
          meId={hq.me.id}
          onSend={(to, pts, value, note, announce) => {
            giveKudos(to, pts, value, note, announce);
            setKudosFor(null);
          }}
        />
      )}

      <Modal open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)} title={`Redeem ${confirm?.name ?? ""}`} sub={`${personById[redeemer].first} · ${confirm?.cost.toLocaleString("en-IN")} of ${balance(redeemer).toLocaleString("en-IN")} pts. Amit approves every redemption.`}>
        {confirm && (
          <div>
            <p className="rounded-[12px] bg-d-sunk px-3 py-2.5 text-[13px]">{confirm.note}.</p>
            <div className="mt-4 flex justify-end gap-2">
              <Btn onClick={() => setConfirm(null)}>Cancel</Btn>
              <Btn
                variant="solid"
                icon={Gift}
                onClick={() => {
                  seq.current += 1;
                  setRequests((cur) => [{ id: `Q-n${seq.current}`, who: redeemer, reward: confirm.id, at: "Just now", state: "pending" }, ...cur]);
                  hq.notify({ kind: "announcement", title: `Redemption request: ${personById[redeemer].first}`, body: `${confirm.name} · ${confirm.cost.toLocaleString("en-IN")} pts`, href: "/hq/rewards" }, { toast: false });
                  hq.log(`requested ${confirm.name} for ${personById[redeemer].first}`, "info");
                  toast.success("Sent for approval", { description: `${confirm.name} · Amit gets a notification` });
                  setConfirm(null);
                }}
              >
                Request
              </Btn>
            </div>
          </div>
        )}
      </Modal>

      {personSheet && (
        <PersonSheet
          id={personSheet}
          onClose={() => setPersonSheet(null)}
          ledger={ledger.filter((e) => e.who === personSheet)}
          week={points(personSheet, "week")}
          month={points(personSheet, "month")}
          balance={balance(personSheet)}
          rank={overallRank[personSheet]}
          onKudos={() => {
            const id = personSheet;
            setPersonSheet(null);
            setKudosFor({ to: id });
          }}
        />
      )}
    </div>
  );
}

/* ---------------- pieces ---------------- */

function BadgeCard({ b, meId }: { b: Badge; meId: string }) {
  const [open, setOpen] = React.useState(false);
  const held = b.holders.includes(meId);
  const prog = !held && b.progress ? b.progress(meId) : null;
  return (
    <button type="button" onClick={() => setOpen((o) => !o)} className={cn("rounded-[14px] border p-3 text-left transition-colors hover:bg-d-sunk", held ? "border-[color-mix(in_oklab,var(--d-gold)_45%,var(--d-line))] bg-[color-mix(in_oklab,var(--d-gold)_7%,var(--d-panel))]" : "border-d-line")}>
      <div className="flex items-center gap-2.5">
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-full", held ? "bg-[#1d1714] text-[#e4c27a]" : "bg-d-sunk text-d-mute")}>
          <b.icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold">{b.name}</p>
          <p className="truncate text-[11.5px] text-d-mute">{b.how}</p>
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-1">
        {b.holders.map((id) => (
          <PersonAvatar key={id} id={id} size={20} />
        ))}
        <span className="ml-auto text-[11px] text-d-mute">{held ? `${personById[meId].first} holds this` : prog !== null ? `${personById[meId].first} ${prog}%` : `${b.holders.length} holder${b.holders.length > 1 ? "s" : ""}`}</span>
      </div>
      {prog !== null && <Meter value={prog} className="mt-2" height={4} tone="warn" />}
      {open && <p className="mt-2 border-t border-d-line pt-2 text-[11.5px] text-d-mute">Held by {b.holders.map((id) => personById[id].first).join(", ")}.</p>}
    </button>
  );
}

function KudosModal({ seed, onClose, onSend, meId }: { seed: { to: string; value?: string; note?: string }; onClose: () => void; onSend: (to: string, pts: number, value: string, note: string, announce: boolean) => void; meId: string }) {
  const [to, setTo] = React.useState(seed.to);
  const [value, setValue] = React.useState<string>(seed.value ?? "Ownership");
  const [pts, setPts] = React.useState(25);
  const [note, setNote] = React.useState(seed.note ?? "");
  const [announce, setAnnounce] = React.useState(false);
  const [variant, setVariant] = React.useState(seed.note ? 1 : 0);
  const [written, setWritten] = React.useState(!!seed.note);
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title="Give kudos" sub="Adds points and posts to the activity feed. You have 3 kudos a week; this is your 2nd." width={580}>
      <div className="space-y-3">
        <Field label="To">
          <div className="flex flex-wrap gap-1.5">
            {players
              .filter((p) => p.id !== meId)
              .map((p) => (
                <button key={p.id} type="button" onClick={() => { setTo(p.id); setWritten(false); }} className={cn("inline-flex items-center gap-1.5 rounded-full border py-0.5 pl-0.5 pr-2.5 text-[12.5px]", to === p.id ? "border-d-accent bg-d-soft" : "border-d-line hover:bg-d-sunk")}>
                  <PersonAvatar id={p.id} size={22} />
                  {p.first}
                </button>
              ))}
          </div>
        </Field>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Field label="For">
            <Segmented size="sm" options={VALUES} value={value as (typeof VALUES)[number]} onChange={setValue} />
          </Field>
          <Field label="Points">
            <Segmented size="sm" options={[{ value: "10", label: "+10" }, { value: "25", label: "+25" }, { value: "50", label: "+50" }]} value={String(pts) as "10" | "25" | "50"} onChange={(v) => setPts(Number(v))} />
          </Field>
        </div>
        <Field label="What did they do?">
          <textarea rows={3} value={note} onChange={(e) => { setNote(e.target.value); setWritten(false); }} placeholder="Be specific. What happened, and why it mattered." className={cn(inputClass, "h-auto py-2.5 leading-relaxed")} />
        </Field>
        <div className="flex flex-wrap items-center gap-2">
          <Btn
            size="sm"
            icon={Sparkles}
            onClick={() => {
              const lines = KUDOS_LINES[to] ?? ["Thank you for the push this week."];
              setNote(lines[variant % lines.length]);
              setVariant((v) => v + 1);
              setWritten(true);
            }}
          >
            {written ? "Another version" : "Write it from their reports"}
          </Btn>
          {written && <AIMark label="Drafted from this week's reports" />}
        </div>
        <label className="flex items-center gap-2 text-[13px]">
          <input type="checkbox" checked={announce} onChange={(e) => setAnnounce(e.target.checked)} className="h-4 w-4 accent-[var(--d-accent)]" />
          Also post to Announcements for everyone
        </label>
        <div className="flex justify-end gap-2 border-t border-d-line pt-3">
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="solid" icon={HandHeart} disabled={!note.trim()} onClick={() => onSend(to, pts, value, note.trim(), announce)}>
            Send +{pts} to {personById[to].first}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

function PersonSheet({ id, onClose, ledger, week, month, balance, rank, onKudos }: { id: string; onClose: () => void; ledger: Entry[]; week: number; month: number; balance: number; rank: number; onKudos: () => void }) {
  const p = personById[id];
  const byType = (["Calls", "Close", "Report on time", "Task done", "Kudos", "Streak bonus"] as LedgerType[]).map((t) => ({ label: t, value: ledger.filter((e) => e.type === t).reduce((a, e) => a + e.pts, 0), tone: TYPE_TONE[t] })).filter((x) => x.value > 0);
  const top = [...byType].sort((a, b) => b.value - a.value)[0];
  return (
    <Sheet
      open
      onOpenChange={(o) => !o && onClose()}
      eyebrow={`Rank #${rank} this week`}
      title={p.name}
      sub={p.title}
      width={520}
      footer={
        <Btn variant="solid" icon={HandHeart} onClick={onKudos}>
          Give {p.first} kudos
        </Btn>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-4 gap-2">
          {[
            { k: "Week", v: week },
            { k: "Month", v: month },
            { k: "Balance", v: balance },
            { k: "Streak", v: `${BASE[id]?.streak ?? 0}d` },
          ].map((x) => (
            <div key={x.k} className="rounded-[10px] bg-d-sunk/70 px-2.5 py-2">
              <p className="text-[10.5px] uppercase tracking-[0.12em] text-d-mute">{x.k}</p>
              <p className="tnum font-serif text-[20px]">{typeof x.v === "number" ? x.v.toLocaleString("en-IN") : x.v}</p>
            </div>
          ))}
        </div>
        {top && (
          <AgentNote title={`${p.first} earns most from ${top.label.toLowerCase()}`}>
            {p.role === "sales"
              ? `Closes are ${Math.round((byType.find((x) => x.label === "Close")?.value ?? 0) / Math.max(1, byType.reduce((a, x) => a + x.value, 0)) * 100)}% of recent points. One more Accelerator this week moves ${p.first} up a place.`
              : `Most of ${p.first}'s impact (go-lives, student saves) isn't auto-scored. Kudos is how it shows up here.`}
          </AgentNote>
        )}
        <div>
          <SectionLabel>Where the points came from</SectionLabel>
          {byType.length ? <HBars data={byType} /> : <p className="text-[13px] text-d-mute">No entries this week.</p>}
        </div>
        <div>
          <SectionLabel>Badges</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {BADGES.filter((b) => b.holders.includes(id)).map((b) => (
              <Pill key={b.id} tone="accent">
                <b.icon className="h-3 w-3" /> {b.name}
              </Pill>
            ))}
            {BADGES.every((b) => !b.holders.includes(id)) && <span className="text-[12.5px] text-d-mute">None yet.</span>}
          </div>
        </div>
        <div>
          <SectionLabel>Recent entries</SectionLabel>
          <ul className="divide-y divide-d-line">
            {ledger.map((e) => (
              <li key={e.id} className="flex items-start gap-3 py-2">
                <Pill tone={TYPE_TONE[e.type]}>{e.type}</Pill>
                <span className="min-w-0 flex-1 text-[12.5px]">
                  {e.note}
                  <span className="block font-mono text-[10.5px] text-d-mute">{e.at}</span>
                </span>
                <span className={cn("font-mono text-[12.5px] font-semibold", e.pts < 0 ? "text-d-late" : "text-d-ok")}>
                  {e.pts > 0 ? "+" : ""}
                  {e.pts}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Sheet>
  );
}
