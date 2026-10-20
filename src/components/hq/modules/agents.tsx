"use client";

import * as React from "react";
import { cn } from "cn";
import { toast } from "sonner";
import {
  BarChart3,
  Bot,
  Check,
  ClipboardList,
  Filter,
  GraduationCap,
  IndianRupee,
  MessageCircle,
  Mic,
  Pause,
  Play,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sun,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  AgentNote,
  AIMark,
  Btn,
  Field,
  inputClass,
  Metric,
  PageHeader,
  Panel,
  PersonAvatar,
  Pill,
  rupees,
  SectionLabel,
  Segmented,
  Sheet,
  Sparkline,
} from "../kit";
import { useHQ } from "../store";
import { personById } from "../data";
import type { Tone } from "../../desk/types";

/* ---------------- agents ---------------- */

type AgentId = "qualifier" | "nudger" | "operator" | "ads" | "summariser" | "payments" | "success" | "calls";
type Tone3 = "Warm Hinglish" | "Professional English" | "Crisp";

type Agent = {
  id: AgentId;
  name: string;
  icon: LucideIcon;
  job: string;
  owner: string;
  schedule: string;
  schedules: string[];
  runsToday: number;
  actions: number;
  hoursMonth: number;
  success: number;
  trend: number[];
  steps: string[];
  triggers: { label: string; on: boolean }[];
  guardrails: { label: string; value: number; unit: string; min: number; max: number }[];
  escalations: string[];
  tone: Tone3;
  approval: boolean;
  logPool: string[];
};

const AGENTS: Agent[] = [
  {
    id: "qualifier",
    name: "Lead Qualifier",
    icon: Filter,
    job: "Scores every inbound lead 0–100 and routes it to the right advisor",
    owner: "imran",
    schedule: "On every new lead",
    schedules: ["On every new lead", "Every 15 min", "Hourly"],
    runsToday: 142,
    actions: 168,
    hoursMonth: 46,
    success: 96,
    trend: [88, 96, 102, 91, 110, 98, 121, 134, 129, 186, 240, 151, 138, 142],
    steps: ["Pulling 12 new leads from Meta and the workshop form", "Enriching with GST and company size", "Scoring against 1,900 past closes", "Routing 4 hot leads to Sneha and Rohan", "Posting summary to Imran's queue"],
    triggers: [
      { label: "New Meta lead form", on: true },
      { label: "Workshop registration (₹51)", on: true },
      { label: "Website enquiry", on: true },
      { label: "WhatsApp first message", on: false },
    ],
    guardrails: [
      { label: "Hot threshold", value: 80, unit: "score", min: 60, max: 95 },
      { label: "Max leads per advisor per day", value: 25, unit: "leads", min: 10, max: 60 },
    ],
    escalations: ["Revenue band ₹25 Cr+ goes straight to Rohan", "Duplicate phone number: hold for Imran"],
    tone: "Professional English",
    approval: false,
    logPool: ["Scored Ramesh Agarwal (Ganesh Agencies, Nagpur) 87, routed to Sneha", "Scored Divya Reddy (Bright Minds Academy) 54, nurture track", "Flagged duplicate: +91 98xxxx4410 already with Arjun", "Scored Tarun Jain (Om Engineering, Rajkot) 91, routed to Rohan", "Enriched Kiran Saxena: ₹10-25 Cr, 64 employees"],
  },
  {
    id: "nudger",
    name: "Follow-up Nudger",
    icon: MessageCircle,
    job: "Sends WhatsApp follow-ups to leads and attendees who went quiet",
    owner: "rohan",
    schedule: "10 AM, 1 PM, 6 PM",
    schedules: ["10 AM, 1 PM, 6 PM", "Every 2 hours", "10 AM and 6 PM"],
    runsToday: 3,
    actions: 214,
    hoursMonth: 61,
    success: 91,
    trend: [140, 160, 120, 180, 175, 90, 60, 210, 230, 320, 410, 260, 240, 214],
    steps: ["Finding leads with no reply in 48 hours", "Writing personal nudges from call notes", "Checking quiet hours and opt-outs", "Sending 62 WhatsApp messages via Interakt", "Booking replies into advisors' calendars"],
    triggers: [
      { label: "No reply for 48 hours", on: true },
      { label: "Left workshop before the Q&A", on: true },
      { label: "Proposal opened, not paid", on: true },
      { label: "Missed booked consult", on: false },
    ],
    guardrails: [
      { label: "Max nudges per lead per week", value: 3, unit: "msgs", min: 1, max: 6 },
      { label: "Quiet hours start", value: 21, unit: ":00 IST", min: 18, max: 23 },
    ],
    escalations: ["Lead replies 'call me': create a P1 task for the owner", "Angry or unsubscribe reply: stop and alert Rohan"],
    tone: "Warm Hinglish",
    approval: true,
    logPool: ["Sent “Namaste Harish ji, EMI breakup bhej raha hoon…” to Harish Patel", "Neelam Gill replied “call me at 7” → task for Kavya", "Skipped 4 leads in quiet hours", "Sent Batch 14 replay link to 18 attendees who left early", "Pooja Desai opened the proposal twice; nudged with the payment link"],
  },
  {
    id: "operator",
    name: "Morning Operator",
    icon: Sun,
    job: "Reads every system at 8 AM and writes the founder's brief and the day's tasks",
    owner: "amit",
    schedule: "Daily 8:00 AM",
    schedules: ["Daily 8:00 AM", "Daily 7:30 AM", "Weekdays 8:00 AM"],
    runsToday: 1,
    actions: 23,
    hoursMonth: 18,
    success: 100,
    trend: [18, 21, 19, 24, 22, 0, 17, 23, 26, 31, 29, 20, 22, 23],
    steps: ["Reading CRM, Razorpay, Meta Ads and the build tracker", "Comparing yesterday to targets", "Finding what slipped overnight", "Drafting tasks and owner nudges", "Writing the brief"],
    triggers: [
      { label: "Every morning at the scheduled time", on: true },
      { label: "After a workshop day ends", on: true },
      { label: "Revenue drops 30% day on day", on: false },
    ],
    guardrails: [{ label: "Max tasks it can create", value: 12, unit: "tasks", min: 3, max: 25 }],
    escalations: ["Any P0 blocker older than 2 days: message Amit directly"],
    tone: "Crisp",
    approval: true,
    logPool: ["Brief ready: ₹6.4 L collected yesterday, 3 things need you", "Drafted 6 tasks from overnight signals"],
  },
  {
    id: "ads",
    name: "Ad Optimiser",
    icon: BarChart3,
    job: "Watches Meta ad sets hourly; pauses losers, proposes scaling winners",
    owner: "meera",
    schedule: "Hourly, 7 AM – 11 PM",
    schedules: ["Hourly, 7 AM – 11 PM", "Every 30 min", "Every 3 hours"],
    runsToday: 14,
    actions: 9,
    hoursMonth: 22,
    success: 89,
    trend: [6, 8, 5, 9, 11, 7, 4, 10, 12, 15, 14, 8, 7, 9],
    steps: ["Pulling spend and leads for 18 live ad sets", "Computing CPL and seat-to-sale rate", "Pausing 2 ad sets above ₹90 CPL", "Proposing +20% on the owner-story Reels set", "Posting changes to Meera"],
    triggers: [
      { label: "CPL above ceiling for 3 hours", on: true },
      { label: "Frequency above 3.5", on: true },
      { label: "Daily budget 90% spent before 6 PM", on: true },
    ],
    guardrails: [
      { label: "CPL ceiling", value: 90, unit: "₹", min: 40, max: 150 },
      { label: "Max budget increase per day", value: 20, unit: "%", min: 5, max: 50 },
    ],
    escalations: ["Any budget increase: needs Meera's approval", "Account spend above ₹55k/day: alert Amit"],
    tone: "Crisp",
    approval: true,
    logPool: ["Paused “Lookalike 3% · Surat” at ₹112 CPL", "Owner-story Reels: CPL ₹37, frequency 2.1, healthy", "Proposed +20% on Reels 35–55 owners", "Rotated creative on “Can you take a holiday?” set"],
  },
  {
    id: "summariser",
    name: "Report Summariser",
    icon: ClipboardList,
    job: "Reads every daily report and writes the team digest and blocker radar",
    owner: "aditya",
    schedule: "Daily 9:30 PM, Sunday digest",
    schedules: ["Daily 9:30 PM, Sunday digest", "Daily 11 PM", "Sunday only"],
    runsToday: 1,
    actions: 12,
    hoursMonth: 14,
    success: 98,
    trend: [10, 11, 12, 11, 12, 0, 13, 12, 12, 12, 11, 12, 12, 12],
    steps: ["Collecting 12 daily reports", "Clustering wins and blockers", "Spotting repeated blockers", "Writing the digest", "Sending to Amit and team leads"],
    triggers: [
      { label: "Reports lock at 9 PM", on: true },
      { label: "Sunday weekly digest", on: true },
    ],
    guardrails: [{ label: "Repeated blocker threshold", value: 3, unit: "mentions", min: 2, max: 8 }],
    escalations: ["Same blocker 5+ times: create a P1 task"],
    tone: "Professional English",
    approval: false,
    logPool: ["“Razorpay EMI failures” now 19 mentions; flagged", "Digest sent: 87% filed, mood 3.4"],
  },
  {
    id: "payments",
    name: "Payment Reminder",
    icon: IndianRupee,
    job: "Chases EMI instalments and build milestones on WhatsApp and email",
    owner: "sahil",
    schedule: "Daily 11 AM",
    schedules: ["Daily 11 AM", "Daily 10 AM and 4 PM", "Mon / Wed / Fri"],
    runsToday: 1,
    actions: 37,
    hoursMonth: 27,
    success: 93,
    trend: [22, 30, 28, 35, 31, 0, 12, 33, 38, 41, 36, 30, 34, 37],
    steps: ["Reading Razorpay and the invoice sheet", "Finding 37 dues within 3 days or overdue", "Writing reminders by relationship", "Holding 2 sensitive accounts for Sahil", "Sending and logging"],
    triggers: [
      { label: "EMI due in 3 days", on: true },
      { label: "Milestone invoice overdue", on: true },
      { label: "Failed auto-debit", on: true },
    ],
    guardrails: [
      { label: "Auto-send below", value: 25000, unit: "₹", min: 5000, max: 100000 },
      { label: "Max reminders per due", value: 3, unit: "msgs", min: 1, max: 5 },
    ],
    escalations: ["Overdue 15+ days: Sahil calls personally", "Client on a live build: copy the delivery lead"],
    tone: "Warm Hinglish",
    approval: true,
    logPool: ["Reminder sent: Payal Shetty, EMI 2 of 3 · ₹8,333", "Razorpay: auto-debit failed for Manoj Kulkarni, sent new link", "Paid after reminder: Gaurav Bhatt ₹24,999"],
  },
  {
    id: "success",
    name: "Student Success",
    icon: GraduationCap,
    job: "Spots students drifting (attendance, logins) and starts a rescue sequence",
    owner: "priya",
    schedule: "Daily 7 PM",
    schedules: ["Daily 7 PM", "After every live session", "Daily 9 AM"],
    runsToday: 1,
    actions: 26,
    hoursMonth: 19,
    success: 87,
    trend: [12, 14, 11, 18, 20, 6, 9, 22, 30, 41, 33, 24, 25, 26],
    steps: ["Reading Zoom attendance and portal logins", "Scoring 140 students for drift", "Writing check-ins for 18 at risk", "Booking 1:1 slots on Priya's calendar", "Updating Student Search"],
    triggers: [
      { label: "Missed 2 live sessions", on: true },
      { label: "No portal login for 7 days", on: true },
      { label: "Blueprint not downloaded", on: false },
    ],
    guardrails: [{ label: "Max rescues per day", value: 25, unit: "students", min: 5, max: 60 }],
    escalations: ["Refund mention: hand to Neha immediately"],
    tone: "Warm Hinglish",
    approval: false,
    logPool: ["Check-in sent to Rekha Menon (missed day 2)", "Booked 1:1 for Sanjay Rathi with Priya, Thu 5 PM", "Deepak Goyal back online after nudge"],
  },
  {
    id: "calls",
    name: "Call Notes",
    icon: Mic,
    job: "Transcribes advisor calls, writes the CRM note, next step and objection tags",
    owner: "rohan",
    schedule: "After every call",
    schedules: ["After every call", "Every 30 min batch"],
    runsToday: 118,
    actions: 118,
    hoursMonth: 52,
    success: 95,
    trend: [90, 102, 88, 110, 120, 30, 40, 115, 130, 160, 170, 125, 121, 118],
    steps: ["Fetching the last call recording", "Transcribing Hindi + English", "Extracting objections and next step", "Writing the CRM note", "Creating the follow-up task"],
    triggers: [
      { label: "Call longer than 2 minutes", on: true },
      { label: "Consult call ends", on: true },
    ],
    guardrails: [{ label: "Min call length", value: 2, unit: "min", min: 1, max: 10 }],
    escalations: ["Competitor mentioned: tag Rohan", "Price objection 3x in a call: suggest EMI script"],
    tone: "Professional English",
    approval: false,
    logPool: ["Note written: Harish Patel, “wants partner on next call”, task for Sneha", "Objection tagged: price (EMI ask) on 6 calls today", "Transcribed 14-min consult with Sunita Bansal"],
  },
];
const agentById = Object.fromEntries(AGENTS.map((a) => [a.id, a])) as Record<AgentId, Agent>;

type Approval = { id: string; agent: AgentId; title: string; detail: string; preview?: string; amount?: string; risk: "low" | "medium" | "high" };
const SEED_APPROVALS: Approval[] = [
  { id: "P1", agent: "payments", title: "Final reminder to Skyline Realty", detail: "Milestone 2 · ₹78,000 · 9 days overdue", preview: "Namaste Gokul ji, milestone 2 ka invoice (₹78,000) 9 din se pending hai. Payment link: rzp.io/l/sky-m2. Koi issue ho to bataiye, hum call kar lete hain.", amount: "₹78,000", risk: "medium" },
  { id: "P2", agent: "ads", title: "Scale Reels · owners 35–55 by 20%", detail: "₹45,000 → ₹54,000/day · CPL ₹37 over 72 hours", amount: "+₹9,000/day", risk: "medium" },
  { id: "P3", agent: "nudger", title: "WhatsApp to Harish Patel", detail: "Accelerator EMI · proposal opened 3 times", preview: "Harish ji, aapne EMI ke baare mein poocha tha: ₹74,999 teen instalments mein, ₹24,999 se start. Sneha kal 11 baje call kar sakti hai?", risk: "low" },
  { id: "P4", agent: "operator", title: "Create 6 tasks from today's brief", detail: "2 P0, 3 P1, 1 P2 · owners Sahil, Neha, Rohan, Meera", risk: "low" },
  { id: "P5", agent: "payments", title: "Reminder batch: 11 Launchpad EMIs", detail: "All under ₹8,500 · due in 3 days", amount: "₹91,663", risk: "low" },
  { id: "P6", agent: "ads", title: "Pause “Lookalike 3% · Surat”", detail: "CPL ₹112 for 5 hours, 0 seats sold", risk: "low" },
  { id: "P7", agent: "nudger", title: "Batch 14 replay to 214 early leavers", detail: "Left before the Q&A on day 2", preview: "Kal ka Q&A miss ho gaya? Replay yahan hai, 48 ghante ke liye: bb.ai/b14. Dr. Amit ne 3 naye templates bhi share kiye hain.", risk: "low" },
  { id: "P8", agent: "operator", title: "Message Sahil: GST filing 2 days overdue", detail: "Escalation rule: P0 blocker older than 2 days", risk: "medium" },
  { id: "P9", agent: "payments", title: "Hold reminders for Spice Route", detail: "Build is blocked on our side; reminder could sour the relationship", risk: "high" },
];

type Log = { id: string; at: string; agent: AgentId; text: string; tone?: Tone };
const SEED_LOG: Log[] = [
  { id: "L1", at: "8:52 PM", agent: "calls", text: "Note written: Kavya × Neelam Gill, “call back at 7, wants Launchpad”", tone: "info" },
  { id: "L2", at: "8:47 PM", agent: "qualifier", text: "Scored 6 new Batch 15 registrations; 2 hot → Sneha", tone: "accent" },
  { id: "L3", at: "8:31 PM", agent: "ads", text: "Paused “Broad · Tier 2 · Video 4” at ₹96 CPL", tone: "warn" },
  { id: "L4", at: "7:58 PM", agent: "success", text: "Rescue sequence started for 18 students who missed day 2", tone: "info" },
  { id: "L5", at: "7:12 PM", agent: "summariser", text: "6 of 12 daily reports in; nudge queued for Arjun, Kavya, Sahil", tone: "neutral" },
  { id: "L6", at: "6:02 PM", agent: "nudger", text: "Evening run: 62 WhatsApp nudges sent, 11 replies, 4 consults booked", tone: "ok" },
  { id: "L7", at: "4:40 PM", agent: "payments", text: "Paid after reminder: Gaurav Bhatt, Launchpad ₹24,999", tone: "ok" },
  { id: "L8", at: "2:15 PM", agent: "calls", text: "Objection pattern: price/EMI on 6 of 14 consults today", tone: "warn" },
  { id: "L9", at: "1:03 PM", agent: "nudger", text: "Midday run: 48 nudges, 7 replies", tone: "ok" },
  { id: "L10", at: "11:00 AM", agent: "payments", text: "37 reminders sent; 2 held for Sahil (Spice Route, Skyline)", tone: "info" },
  { id: "L11", at: "9:40 AM", agent: "qualifier", text: "Scored 34 overnight Meta leads; 9 hot", tone: "accent" },
  { id: "L12", at: "8:00 AM", agent: "operator", text: "Morning brief: ₹6.4 L collected, 3 decisions for Amit, 6 tasks drafted", tone: "accent" },
];

// yesterday evening, so every agent has history in its run log
SEED_LOG.push(
  ...AGENTS.flatMap((a, ai) =>
    a.logPool.slice(0, 4).map((text, i) => ({ id: `Y-${a.id}-${i}`, at: `Yest ${9 - i - (ai % 2)}:${String(10 + ai * 6).padStart(2, "0")} PM`, agent: a.id, text, tone: "neutral" as Tone })),
  ),
);
const RATE = 650; // ₹ per hour of team time, blended

function stamp() {
  return new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }).toUpperCase();
}

type Live = { running: boolean; runsToday: number; actions: number; schedule: string; tone: Tone3; approval: boolean; triggers: boolean[]; guard: number[] };

/* ---------------- module ---------------- */

export default function AIAgents() {
  const hq = useHQ();
  const [live, setLive] = React.useState<Record<AgentId, Live>>(() =>
    Object.fromEntries(AGENTS.map((a) => [a.id, { running: true, runsToday: a.runsToday, actions: a.actions, schedule: a.schedule, tone: a.tone, approval: a.approval, triggers: a.triggers.map((t) => t.on), guard: a.guardrails.map((g) => g.value) }])) as Record<AgentId, Live>,
  );
  const [selected, setSelected] = React.useState<AgentId>("nudger");
  const [runs, setRuns] = React.useState<Partial<Record<AgentId, { step: number; done: boolean }>>>({});
  const [log, setLog] = React.useState<Log[]>(SEED_LOG);
  const approvals = SEED_APPROVALS;
  const [decided, setDecided] = React.useState<Record<string, "approved" | "rejected">>({});
  const [editing, setEditing] = React.useState<Record<string, string>>({});
  const [config, setConfig] = React.useState<AgentId | null>(null);
  const [filter, setFilter] = React.useState<"all" | AgentId>("all");
  const [advice, setAdvice] = React.useState<Set<string>>(new Set());
  const [autoPay, setAutoPay] = React.useState(false);
  const tick = React.useRef(0);
  const timers = React.useRef<number[]>([]);
  const liveRef = React.useRef(live);
  React.useEffect(() => {
    liveRef.current = live;
  }, [live]);

  // a live trickle of agent work while the page is open
  React.useEffect(() => {
    const id = window.setInterval(() => {
      tick.current += 1;
      const running = AGENTS.filter((a) => liveRef.current[a.id].running && a.logPool.length > 2);
      if (!running.length) return;
      const a = running[tick.current % running.length];
      const text = a.logPool[tick.current % a.logPool.length];
      setLog((cur) => [{ id: `L-t${tick.current}`, at: stamp(), agent: a.id, text, tone: "info" as Tone }, ...cur].slice(0, 80));
      setLive((cur) => ({ ...cur, [a.id]: { ...cur[a.id], actions: cur[a.id].actions + 1 } }));
    }, 4200);
    const t = timers.current;
    return () => {
      window.clearInterval(id);
      t.forEach((x) => window.clearTimeout(x));
    };
  }, []);

  const pending = approvals.filter((p) => !decided[p.id]);
  const totalHours = AGENTS.reduce((a, x) => a + x.hoursMonth, 0) + Math.round(log.length / 6);
  const actionsToday = AGENTS.reduce((a, x) => a + live[x.id].actions, 0);
  const avgSuccess = Math.round(AGENTS.reduce((a, x) => a + x.success, 0) / AGENTS.length);
  const agent = agentById[selected];
  const st = live[selected];

  function addLog(agentId: AgentId, text: string, tone: Tone = "accent") {
    tick.current += 1;
    setLog((cur) => [{ id: `L-x${tick.current}`, at: stamp(), agent: agentId, text, tone }, ...cur].slice(0, 80));
  }

  function toggle(id: AgentId) {
    const next = !live[id].running;
    setLive((cur) => ({ ...cur, [id]: { ...cur[id], running: next } }));
    addLog(id, next ? `Resumed by ${hq.me.first}` : `Paused by ${hq.me.first}`, next ? "ok" : "warn");
    hq.log(`${next ? "resumed" : "paused"} the ${agentById[id].name} agent`, next ? "ok" : "warn");
    toast(`${agentById[id].name} ${next ? "running" : "paused"}`);
  }

  function runNow(id: AgentId) {
    if (id === "operator") {
      hq.runAgent("operator");
      setLive((cur) => ({ ...cur, operator: { ...cur.operator, runsToday: cur.operator.runsToday + 1 } }));
      addLog("operator", `Manual run started by ${hq.me.first}`);
      return;
    }
    const a = agentById[id];
    setSelected(id);
    setRuns((cur) => ({ ...cur, [id]: { step: 0, done: false } }));
    a.steps.forEach((_, i) => timers.current.push(window.setTimeout(() => setRuns((cur) => ({ ...cur, [id]: { step: i + 1, done: i + 1 === a.steps.length } })), (i + 1) * 650)));
    timers.current.push(
      window.setTimeout(() => {
        const n = id === "nudger" ? 62 : id === "qualifier" ? 12 : id === "payments" ? 37 : id === "calls" ? 4 : id === "success" ? 18 : 3;
        setLive((cur) => ({ ...cur, [id]: { ...cur[id], runsToday: cur[id].runsToday + 1, actions: cur[id].actions + n } }));
        addLog(id, `Manual run finished: ${a.steps[a.steps.length - 2].toLowerCase()}`, "ok");
        hq.log(`ran the ${a.name} agent (${n} actions)`, "accent");
        toast.success(`${a.name} finished`, { description: `${n} actions · ${a.steps[a.steps.length - 1]}` });
      }, a.steps.length * 650 + 200),
    );
  }

  function decide(p: Approval, d: "approved" | "rejected") {
    setDecided((cur) => ({ ...cur, [p.id]: d }));
    const a = agentById[p.agent];
    if (d === "approved") {
      setLive((cur) => ({ ...cur, [p.agent]: { ...cur[p.agent], actions: cur[p.agent].actions + 1 } }));
      addLog(p.agent, `Approved by ${hq.me.first}: ${p.title}${editing[p.id] ? " (edited)" : ""}`, "ok");
      hq.log(`approved ${a.name}: ${p.title}`, "ok");
      if (p.agent === "operator" && p.id === "P4") {
        hq.addTask({ title: "Chase Spice Route for Swiggy API keys", owner: "neha", area: "Delivery", priority: "P0", status: "Todo", dueIn: 0, due: "Today", aiDrafted: true });
        hq.addTask({ title: "File September GST today", owner: "sahil", area: "Finance", priority: "P0", status: "In progress", dueIn: 0, due: "Today", aiDrafted: true });
      }
      toast.success("Approved", { description: `${a.name} · ${p.title}` });
    } else {
      addLog(p.agent, `Rejected by ${hq.me.first}: ${p.title}`, "late");
      toast(`Rejected`, { description: `${a.name} will learn from this` });
    }
  }

  const shownLog = log.filter((l) => filter === "all" || l.agent === filter);

  return (
    <div>
      <PageHeader
        kicker="Intelligence"
        title="AI Agents"
        sub={`${AGENTS.filter((a) => live[a.id].running).length} of ${AGENTS.length} agents running alongside the team. Every action is logged; anything risky waits for a human.`}
        actions={
          <>
            <Btn icon={Sparkles} onClick={() => hq.openAsk("Which agent saved us the most money this month, and what should we automate next?")}>
              Ask about agents
            </Btn>
            <Btn variant="solid" icon={Sun} onClick={() => runNow("operator")}>
              Run morning operator
            </Btn>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Metric label="Hours saved · Oct" value={totalHours} delta="+38%" hint="vs September" />
        <Metric label="Cost avoided · Oct" value={rupees(totalHours * RATE)} hint={`at ₹${RATE}/hr blended · API spend ₹18.4k`} />
        <Metric label="Actions today" value={actionsToday.toLocaleString("en-IN")} hint="across 8 agents" />
        <Metric label="Waiting on you" value={pending.length} good={false} hint="approvals inbox" onClick={() => document.getElementById("inbox")?.scrollIntoView({ behavior: "smooth", block: "start" })} />
        <Metric label="Success rate" value={`${avgSuccess}%`} hint="actions not reverted or rejected" />
      </div>

      {/* agent grid */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {AGENTS.map((a) => {
          const s = live[a.id];
          const r = runs[a.id];
          const on = selected === a.id;
          return (
            <div
              key={a.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelected(a.id)}
              onKeyDown={(e) => e.key === "Enter" && setSelected(a.id)}
              className={cn("desk-card desk-rise cursor-pointer p-4 text-left outline-none transition-all", on ? "ring-2 ring-d-accent" : "hover:-translate-y-0.5", !s.running && "opacity-70")}
            >
              <div className="flex items-start gap-3">
                <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]", s.running ? "bg-[#1d1714] text-[#e4c27a]" : "bg-d-sunk text-d-mute")}>
                  <a.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold">{a.name}</p>
                  <p className="flex items-center gap-1.5 text-[11.5px] text-d-mute">
                    <span className={cn("h-1.5 w-1.5 rounded-full", s.running ? (r && !r.done ? "desk-ping bg-[var(--d-gold)]" : "desk-ping bg-d-ok") : "bg-d-mute")} />
                    {r && !r.done ? "Running now…" : s.running ? "Running" : "Paused"} · {s.schedule}
                  </p>
                </div>
                <Switch on={s.running} onChange={() => toggle(a.id)} label={`Toggle ${a.name}`} />
              </div>
              <div className="mt-3 grid grid-cols-4 gap-1 text-center">
                {[
                  { k: "Runs", v: s.runsToday },
                  { k: "Actions", v: s.actions },
                  { k: "Hrs/mo", v: a.hoursMonth },
                  { k: "Success", v: `${a.success}%` },
                ].map((x) => (
                  <div key={x.k}>
                    <p className="tnum font-serif text-[18px] leading-tight">{x.v}</p>
                    <p className="text-[10px] uppercase tracking-[0.1em] text-d-mute">{x.k}</p>
                  </div>
                ))}
              </div>
              <Sparkline data={a.trend} height={28} tone={s.running ? "accent" : "neutral"} className="mt-2" />
              <div className="mt-2 flex items-center gap-1.5">
                <PersonAvatar id={a.owner} size={20} />
                <span className="text-[11.5px] text-d-mute">{personById[a.owner].first}</span>
                {pending.filter((p) => p.agent === a.id).length > 0 && (
                  <Pill tone="warn" className="ml-1">
                    {pending.filter((p) => p.agent === a.id).length} waiting
                  </Pill>
                )}
                <span className="ml-auto flex gap-1">
                  <button type="button" onClick={(e) => { e.stopPropagation(); setConfig(a.id); }} className="rounded-md p-1.5 text-d-mute hover:bg-d-sunk hover:text-d-ink" aria-label={`Configure ${a.name}`}>
                    <Settings2 className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" disabled={!s.running || (!!r && !r.done)} onClick={(e) => { e.stopPropagation(); runNow(a.id); }} className="inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-d-soft px-2 py-1 text-[11.5px] font-semibold text-d-accent hover:brightness-95 disabled:opacity-40">
                    <Play className="h-3 w-3" /> Run
                  </button>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* detail */}
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_1fr] xl:items-start">
        <Panel
          live={st.running}
          title={agent.name}
          sub={agent.job}
          action={
            <>
              <Btn size="sm" icon={Settings2} onClick={() => setConfig(agent.id)}>
                Configure
              </Btn>
              <Btn size="sm" variant="solid" icon={Play} disabled={!st.running || (!!runs[agent.id] && !runs[agent.id]!.done)} onClick={() => runNow(agent.id)}>
                Run now
              </Btn>
            </>
          }
        >
          {runs[agent.id] ? (
            <div className="mb-4 rounded-[14px] bg-[#1d1714] p-4 font-mono text-[12px] text-[#e9dfcf]">
              <p className="mb-2 flex items-center gap-2 text-[10.5px] uppercase tracking-[0.16em] text-[#e4c27a]">
                <Zap className="h-3 w-3" /> {runs[agent.id]!.done ? "Run complete" : "Running"} · {agent.name}
              </p>
              <ol className="space-y-1.5">
                {agent.steps.map((s, i) => {
                  const step = runs[agent.id]!.step;
                  return (
                    <li key={s} className={cn("flex items-center gap-2 transition-opacity", i > step && "opacity-25")}>
                      {i < step ? <Check className="h-3.5 w-3.5 text-[#7fc29b]" /> : i === step ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#e4c27a] border-t-transparent" /> : <span className="h-3.5 w-3.5 rounded-full border border-[#6b5f55]" />}
                      <span>{s}</span>
                      {i < step && <span className="ml-auto text-[10.5px] text-[#9a8d80]">{(0.4 + i * 0.37).toFixed(1)}s</span>}
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : null}
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <SectionLabel action={<span className="inline-flex items-center gap-1 text-[11px] text-d-ok"><span className="desk-ping h-1.5 w-1.5 rounded-full bg-d-ok" />live</span>}>Run log</SectionLabel>
              <ul className="desk-scroll max-h-[300px] space-y-2 overflow-y-auto pr-1">
                {log.filter((l) => l.agent === agent.id).slice(0, 14).map((l) => (
                  <li key={l.id} className="desk-rise flex gap-2.5 text-[12.5px] leading-snug">
                    <span className="w-[76px] shrink-0 whitespace-nowrap pt-px font-mono text-[10.5px] text-d-mute">{l.at}</span>
                    <span>{l.text}</span>
                  </li>
                ))}
                {log.filter((l) => l.agent === agent.id).length === 0 && <li className="text-[12.5px] text-d-mute">Nothing logged yet today.</li>}
              </ul>
            </div>
            <div>
              <SectionLabel>How it&rsquo;s set up</SectionLabel>
              <dl className="space-y-2 text-[12.5px]">
                <div className="flex justify-between gap-3">
                  <dt className="text-d-mute">Schedule</dt>
                  <dd className="text-right font-medium">{st.schedule}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-d-mute">Tone</dt>
                  <dd className="font-medium">{st.tone}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-d-mute">Human approval</dt>
                  <dd className="font-medium">{st.approval ? "Required for risky actions" : "Not required"}</dd>
                </div>
                {agent.guardrails.map((g, i) => (
                  <div key={g.label} className="flex justify-between gap-3">
                    <dt className="text-d-mute">{g.label}</dt>
                    <dd className="font-mono font-medium">{g.unit === "₹" ? `₹${st.guard[i].toLocaleString("en-IN")}` : `${st.guard[i]}${g.unit.startsWith(":") ? "" : " "}${g.unit}`}</dd>
                  </div>
                ))}
              </dl>
              <SectionLabel className="mb-1.5 mt-4">Escalates when</SectionLabel>
              <ul className="space-y-1">
                {agent.escalations.map((e) => (
                  <li key={e} className="flex gap-2 text-[12.5px]">
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-d-accent" />
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Hours saved this month" sub={`${totalHours} hours · ${rupees(totalHours * RATE)} of team time`}>
            <ul className="space-y-2">
              {[...AGENTS].sort((a, b) => b.hoursMonth - a.hoursMonth).map((a) => (
                <li key={a.id}>
                  <button type="button" onClick={() => setSelected(a.id)} className="block w-full text-left">
                    <div className="flex items-baseline justify-between text-[12.5px]">
                      <span className={cn(selected === a.id && "font-semibold")}>{a.name}</span>
                      <span className="font-mono text-[11.5px] text-d-mute">
                        {a.hoursMonth}h · {rupees(a.hoursMonth * RATE)}
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-d-sunk">
                      <div className="desk-growx h-full rounded-full" style={{ width: `${(a.hoursMonth / 61) * 100}%`, background: selected === a.id ? "var(--d-accent)" : "color-mix(in oklab, var(--d-accent) 45%, var(--d-panel))" }} />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[12px] text-d-mute">That is roughly 1.6 full-time teammates. Agents cost ₹18,400 in API and WhatsApp fees this month.</p>
          </Panel>

          {!advice.has("nudger-time") && (
            <AgentNote
              title="Move the Follow-up Nudger's evening run to 6:30 PM"
              action={
                <>
                  <Btn
                    size="sm"
                    variant="solid"
                    onClick={() => {
                      setLive((cur) => ({ ...cur, nudger: { ...cur.nudger, schedule: "10 AM, 1 PM, 6:30 PM" } }));
                      addLog("nudger", "Schedule changed to 10 AM, 1 PM, 6:30 PM (advisor suggestion)", "accent");
                      hq.log("moved the Follow-up Nudger evening run to 6:30 PM", "accent");
                      setAdvice((s) => new Set(s).add("nudger-time"));
                      toast.success("Schedule updated");
                    }}
                  >
                    Apply
                  </Btn>
                  <Btn size="sm" variant="ghost" onClick={() => setAdvice((s) => new Set(s).add("nudger-time"))}>
                    Ignore
                  </Btn>
                </>
              }
            >
              Replies to the 6 PM run are 31% higher when they land after people leave the shop floor. Owners reply most between 6:30 and 8 PM IST; after 9 PM replies drop to 4%.
            </AgentNote>
          )}
          {!advice.has("autopay") && (
            <AgentNote
              title="Let Payment Reminder auto-send under ₹25k"
              action={
                <>
                  <Btn
                    size="sm"
                    variant="solid"
                    onClick={() => {
                      setAutoPay(true);
                      const batch = approvals.filter((p) => p.agent === "payments" && p.risk === "low" && !decided[p.id]);
                      batch.forEach((p) => decide(p, "approved"));
                      setAdvice((s) => new Set(s).add("autopay"));
                      hq.log("allowed Payment Reminder to auto-send reminders under ₹25,000", "accent");
                    }}
                  >
                    Allow and clear {approvals.filter((p) => p.agent === "payments" && p.risk === "low" && !decided[p.id]).length}
                  </Btn>
                  <Btn size="sm" variant="ghost" onClick={() => setAdvice((s) => new Set(s).add("autopay"))}>
                    Keep approving
                  </Btn>
                </>
              }
            >
              You approved 14 of 14 small reminders this week without edits. Anything above ₹25k, or a client on a live build, would still come to you.
            </AgentNote>
          )}
          {autoPay && (
            <p className="flex items-center gap-2 text-[12px] text-d-mute">
              <AIMark label="Rule" /> Payment reminders under ₹25k now auto-send.
            </p>
          )}
        </div>
      </div>

      {/* approvals + timeline */}
      <div id="inbox" className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_1fr] xl:items-start">
        <Panel title="Approvals inbox" sub="Actions the agents prepared, waiting on a human" action={<Pill tone={pending.length ? "warn" : "ok"} mono>{pending.length} waiting</Pill>}>
          <ul className="divide-y divide-d-line">
            {approvals.map((p) => {
              const a = agentById[p.agent];
              const d = decided[p.id];
              const text = editing[p.id] ?? p.preview;
              return (
                <li key={p.id} className={cn("py-3.5", d && "opacity-55")}>
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-[#1d1714] text-[#e4c27a]">
                      <a.icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-[13.5px] font-medium">
                        {p.title}
                        <Pill tone={p.risk === "high" ? "late" : p.risk === "medium" ? "warn" : "neutral"}>{p.risk} risk</Pill>
                      </p>
                      <p className="text-[12px] text-d-mute">
                        {a.name} · {p.detail}
                      </p>
                      {text !== undefined && (
                        <textarea
                          value={text}
                          disabled={!!d}
                          onChange={(e) => setEditing((cur) => ({ ...cur, [p.id]: e.target.value }))}
                          rows={2}
                          className="mt-2 w-full resize-none rounded-[10px] border border-[color-mix(in_oklab,var(--d-gold)_30%,var(--d-line))] bg-[color-mix(in_oklab,var(--d-gold)_5%,var(--d-panel))] px-3 py-2 text-[12.5px] leading-relaxed outline-none focus:border-d-accent"
                        />
                      )}
                    </div>
                    {p.amount && <span className="shrink-0 font-mono text-[12.5px] font-semibold">{p.amount}</span>}
                  </div>
                  <div className="mt-2 flex justify-end gap-1.5">
                    {d ? (
                      <Pill tone={d === "approved" ? "ok" : "late"}>{d === "approved" ? "Approved" : "Rejected"}</Pill>
                    ) : (
                      <>
                        <Btn size="sm" variant="ghost" icon={X} onClick={() => decide(p, "rejected")}>
                          Reject
                        </Btn>
                        <Btn size="sm" variant="solid" icon={Check} onClick={() => decide(p, "approved")}>
                          {editing[p.id] ? "Approve edited" : "Approve"}
                        </Btn>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          {pending.length > 1 && (
            <div className="mt-2 flex justify-end">
              <Btn
                size="sm"
                onClick={() => {
                  pending.filter((p) => p.risk === "low").forEach((p) => decide(p, "approved"));
                }}
              >
                Approve all low-risk ({pending.filter((p) => p.risk === "low").length})
              </Btn>
            </div>
          )}
        </Panel>

        <Panel title="Agent activity" sub="Everything the workforce did today, newest first" action={<Bot className="h-4 w-4 text-d-mute" />}>
          <div className="mb-3">
            <select value={filter} onChange={(e) => setFilter(e.target.value as "all" | AgentId)} className={cn(inputClass, "h-8 w-auto text-[12.5px]")}>
              <option value="all">All agents</option>
              {AGENTS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <ol className="desk-scroll relative max-h-[620px] space-y-3 overflow-y-auto pr-1 before:absolute before:bottom-1 before:left-[11px] before:top-1 before:w-px before:bg-d-line">
            {shownLog.slice(0, 30).map((l) => {
              const a = agentById[l.agent];
              return (
                <li key={l.id} className="desk-rise relative flex gap-3 pl-0">
                  <span className="relative z-[1] flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-d-panel" style={{ background: l.tone === "ok" ? "var(--d-ok)" : l.tone === "warn" ? "var(--d-warn)" : l.tone === "late" ? "var(--d-late)" : "#1d1714", color: l.tone && l.tone !== "accent" && l.tone !== "info" && l.tone !== "neutral" ? "#fff" : "#e4c27a" }}>
                    <a.icon className="h-3 w-3" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10.5px] text-d-mute">
                      {l.at} · {a.name}
                    </p>
                    <p className="text-[12.5px] leading-snug">{l.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Panel>
      </div>

      {config && (
        <ConfigSheet
          a={agentById[config]}
          s={live[config]}
          onClose={() => setConfig(null)}
          onSave={(next) => {
            setLive((cur) => ({ ...cur, [config]: next }));
            addLog(config, `Config updated by ${hq.me.first}: ${next.schedule}, ${next.tone.toLowerCase()} tone`, "accent");
            hq.log(`updated the ${agentById[config].name} agent's config`, "info");
            toast.success("Config saved", { description: `${agentById[config].name} picks it up on the next run` });
            setConfig(null);
          }}
        />
      )}
    </div>
  );
}

/* ---------------- pieces ---------------- */

function Switch({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors", on ? "bg-d-ok" : "bg-d-line")}
    >
      <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all", on ? "left-[18px]" : "left-0.5")} />
    </button>
  );
}

function ConfigSheet({ a, s, onClose, onSave }: { a: Agent; s: Live; onClose: () => void; onSave: (s: Live) => void }) {
  const [draft, setDraft] = React.useState<Live>(s);
  const [esc, setEsc] = React.useState(a.escalations.join("\n"));
  const [preview, setPreview] = React.useState(false);
  const sample =
    draft.tone === "Warm Hinglish"
      ? "Namaste Harish ji, kal aapne EMI ke baare mein poocha tha. ₹74,999 teen aasaan instalments mein ho jayega. Sneha kal 11 baje call kar le?"
      : draft.tone === "Crisp"
        ? "Harish, EMI option: 3 × ₹24,999 for the Accelerator. Want a call tomorrow at 11?"
        : "Hello Mr. Patel, following up on your EMI question. The Accelerator is available in three instalments of ₹24,999. Would 11 AM tomorrow work for a call with Sneha?";
  return (
    <Sheet
      open
      onOpenChange={(o) => !o && onClose()}
      width={560}
      eyebrow="Agent config"
      title={a.name}
      sub={a.job}
      footer={
        <>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="solid" icon={Check} onClick={() => onSave(draft)}>
            Save config
          </Btn>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <SectionLabel>Status</SectionLabel>
          <div className="flex items-center gap-3">
            <Switch on={draft.running} onChange={() => setDraft((d) => ({ ...d, running: !d.running }))} label="Running" />
            <span className="text-[13px]">{draft.running ? "Running on schedule" : "Paused, won't run until resumed"}</span>
          </div>
        </div>
        <Field label="Schedule">
          <select className={inputClass} value={draft.schedule} onChange={(e) => setDraft((d) => ({ ...d, schedule: e.target.value }))}>
            {Array.from(new Set([draft.schedule, ...a.schedules])).map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </Field>
        <div>
          <SectionLabel>Triggers</SectionLabel>
          <ul className="space-y-1">
            {a.triggers.map((t, i) => (
              <li key={t.label}>
                <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 text-[13px] hover:bg-d-sunk">
                  <input type="checkbox" checked={draft.triggers[i]} onChange={() => setDraft((d) => ({ ...d, triggers: d.triggers.map((x, k) => (k === i ? !x : x)) }))} className="h-4 w-4 accent-[var(--d-accent)]" />
                  {t.label}
                </label>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <SectionLabel>Guardrails</SectionLabel>
          <div className="space-y-4">
            {a.guardrails.map((g, i) => (
              <div key={g.label}>
                <div className="flex justify-between text-[12.5px]">
                  <span>{g.label}</span>
                  <span className="font-mono font-semibold">{g.unit === "₹" ? `₹${draft.guard[i].toLocaleString("en-IN")}` : `${draft.guard[i]} ${g.unit}`}</span>
                </div>
                <input
                  type="range"
                  min={g.min}
                  max={g.max}
                  step={g.max > 1000 ? 1000 : 1}
                  value={draft.guard[i]}
                  onChange={(e) => setDraft((d) => ({ ...d, guard: d.guard.map((x, k) => (k === i ? Number(e.target.value) : x)) }))}
                  className="mt-1.5 w-full accent-[var(--d-accent)]"
                />
              </div>
            ))}
            <label className="flex items-center gap-2.5 text-[13px]">
              <input type="checkbox" checked={draft.approval} onChange={() => setDraft((d) => ({ ...d, approval: !d.approval }))} className="h-4 w-4 accent-[var(--d-accent)]" />
              Require human approval for money, budget or client-facing actions
            </label>
          </div>
        </div>
        <div>
          <SectionLabel action={<Btn size="sm" variant="ghost" icon={Sparkles} onClick={() => setPreview((p) => !p)}>{preview ? "Hide sample" : "Preview a message"}</Btn>}>Tone</SectionLabel>
          <Segmented size="sm" options={["Warm Hinglish", "Professional English", "Crisp"] as const} value={draft.tone} onChange={(v) => setDraft((d) => ({ ...d, tone: v }))} />
          {preview && (
            <div className="mt-3 rounded-[12px] border border-[color-mix(in_oklab,var(--d-gold)_35%,var(--d-line))] bg-[color-mix(in_oklab,var(--d-gold)_6%,var(--d-panel))] p-3 text-[13px] leading-relaxed">
              <AIMark label="Sample" className="mb-1.5" />
              <p>{sample}</p>
            </div>
          )}
        </div>
        <Field label="Escalation rules (one per line)">
          <textarea rows={4} value={esc} onChange={(e) => setEsc(e.target.value)} className={cn(inputClass, "h-auto py-2.5 leading-relaxed")} />
        </Field>
        <p className="flex items-center gap-2 text-[12px] text-d-mute">
          <Pause className="h-3.5 w-3.5" /> Changes apply on the next run. Every action stays in the activity log for 90 days.
        </p>
      </div>
    </Sheet>
  );
}
