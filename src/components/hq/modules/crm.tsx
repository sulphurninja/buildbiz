"use client";

import * as React from "react";
import { cn } from "cn";
import {
  ArrowRight,
  Building2,
  CalendarClock,
  Check,
  ChevronRight,
  Flame,
  Keyboard,
  MapPin,
  MessageCircle,
  Mic,
  MicOff,
  Pause,
  Phone,
  PhoneCall,
  PhoneOff,
  Play,
  Send,
  SkipForward,
  Sparkles,
  Timer,
  Users,
  Wand2,
  Zap,
} from "lucide-react";
import { AgentNote, AIMark, Btn, Field, IconBtn, inputClass, Metric, Modal, PageHeader, PersonAvatar, Pill, rupees, SearchBox, SectionLabel, Segmented, Sheet } from "../kit";
import { useHQ } from "../store";
import { personById, programById } from "../data";
import type { CallLog, Lead, LeadStage, ProgramId } from "../types";
import type { Tone } from "../../desk/types";

/* ============================================================
   Calling CRM: the power-dialer the sales floor works from.
   ============================================================ */

type Outcome = CallLog["outcome"];
const OUTCOMES: { id: Outcome; tone: Tone; hint: string }[] = [
  { id: "Connected", tone: "ok", hint: "Spoke, moving forward" },
  { id: "Booked", tone: "accent", hint: "Strategy call booked" },
  { id: "Call back", tone: "info", hint: "Asked to call later" },
  { id: "No answer", tone: "neutral", hint: "Rang out" },
  { id: "Busy", tone: "warn", hint: "Cut or engaged" },
  { id: "Not interested", tone: "late", hint: "Close it out" },
];
const outcomeTone = (o: Outcome): Tone => OUTCOMES.find((x) => x.id === o)?.tone ?? "neutral";

const OPEN_STAGES: LeadStage[] = ["New", "Contacted", "Qualified", "Call booked", "Proposal"];
const ALL_STAGES: LeadStage[] = ["New", "Contacted", "Qualified", "Call booked", "Proposal", "Won", "Lost"];
const stageTone: Record<LeadStage, Tone> = { New: "info", Contacted: "neutral", Qualified: "accent", "Call booked": "warn", Proposal: "warn", Won: "ok", Lost: "late" };

const FOLLOW_UPS = [
  { label: "In 2 hours", h: 2 },
  { label: "This evening", h: 6 },
  { label: "Tomorrow AM", h: 18 },
  { label: "In 3 days", h: 72 },
  { label: "Next week", h: 168 },
];

const bandRank: Record<string, number> = { "₹1-3 Cr": 0, "₹3-5 Cr": 1, "₹5-10 Cr": 2, "₹10-25 Cr": 3, "₹25-50 Cr": 4, "₹50 Cr+": 5 };
const idNum = (id: string) => Number(id.replace(/\D/g, "")) || 0;

function recommend(l: Lead): { id: ProgramId; why: string } {
  const b = bandRank[l.revenue] ?? 0;
  if (b >= 4 && l.teamSize >= 80) return { id: "dfy", why: `${l.revenue} and ${l.teamSize} staff: they need it built for them, not a course` };
  if (b >= 3) return l.teamSize >= 120 ? { id: "dfy", why: `${l.teamSize} people across teams; a done-for-you command center pays back fastest` } : { id: "agents", why: `${l.revenue} with a lean ${l.teamSize}-person team; agents replace the next 3 hires` };
  if (b === 2) return { id: "systems", why: `${l.revenue} is the sweet spot for AI Business Systems: 4 departments wired in 90 days` };
  if (b === 1) return l.teamSize > 40 ? { id: "systems", why: `${l.teamSize} staff at ${l.revenue}; process debt is the bottleneck` } : { id: "accelerator", why: `${l.revenue}, ${l.teamSize} staff; automation of sales + collections first` };
  return l.teamSize > 25 ? { id: "accelerator", why: `Team of ${l.teamSize} at ${l.revenue}; start with follow-up and reporting automations` } : { id: "launchpad", why: `${l.revenue} owner-led business; Launchpad gets the basics live in 30 days` };
}

function priorityOf(l: Lead) {
  const reasons: string[] = [];
  let p = l.score;
  if (l.followUpIn < 0) {
    p += Math.min(18, 6 + Math.round(-l.followUpIn / 3));
    reasons.push(`Follow-up ${-l.followUpIn}h overdue`);
  }
  if (l.stage === "Proposal") {
    p += 12;
    reasons.push("Proposal out, waiting on decision");
  } else if (l.stage === "Call booked") {
    p += 9;
    reasons.push("Strategy call booked");
  } else if (l.stage === "Qualified") p += 5;
  if (l.attendedWorkshop) {
    p += 6;
    reasons.push("Attended Batch 14 live");
  }
  if (l.tags.includes("Decision maker")) {
    p += 4;
    reasons.push("Is the decision maker");
  }
  if (l.tags.includes("EMI ask")) reasons.push("Asked about EMI");
  if (l.score >= 80) reasons.unshift(`AI score ${l.score}`);
  return { p, reasons: reasons.slice(0, 3) };
}

function dueLabel(h: number) {
  if (h < 0) {
    const a = -h;
    return a >= 24 ? `${Math.floor(a / 24)}d ${a % 24}h overdue` : `${a}h overdue`;
  }
  if (h === 0) return "due now";
  return h >= 24 ? `in ${Math.floor(h / 24)}d ${h % 24}h` : `in ${h}h`;
}

function attendance(l: Lead) {
  if (l.attendedWorkshop) return idNum(l.id) % 3 === 0 ? { label: "Batch 14 · Day 1 only", tone: "warn" as Tone, both: false } : { label: "Batch 14 · both days", tone: "ok" as Tone, both: true };
  if (l.source === "Workshop") return { label: "Registered, didn't join", tone: "late" as Tone, both: false };
  return { label: "Not registered", tone: "neutral" as Tone, both: false };
}

const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const first = (name: string) => name.split(" ")[0];
const lc = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/* ---------------- Script content ---------------- */

const DISCOVERY: Record<string, string[]> = {
  "Owner approves every purchase order; team waits": [
    "How many POs cross your desk in a normal week, and how long does each one wait?",
    "Which approvals could your purchase head take alone if you had a live view of spend?",
    "What happened the last time you were travelling for a week?",
  ],
  "Leads come from 4 places and nobody tracks follow-ups": [
    "Where do enquiries land today: IndiaMART, WhatsApp, calls, website?",
    "Of 100 enquiries last month, how many got a second follow-up?",
    "Who owns a lead once it comes in, and how do you know they called?",
  ],
  "Sales team reports on WhatsApp, no single view of the pipeline": [
    "If I asked you right now what's closing this month, how long would it take to answer?",
    "How many salespeople send updates on WhatsApp groups today?",
    "Which number do you check first every morning?",
  ],
  "Collections slip because reminders depend on one accountant": [
    "What's outstanding beyond 60 days right now, roughly?",
    "If your accountant takes leave, who sends payment reminders?",
    "Do customers get reminders on WhatsApp, or only calls?",
  ],
  "Can't take a holiday without the business stalling": [
    "When did you last take 7 days off without calls from the team?",
    "Which 3 decisions only you can make today?",
    "If those were rules in a system, which one would you hand over first?",
  ],
  "Inventory in Tally and Excel never match": [
    "How often do Tally and the floor stock sheet disagree, and by how much?",
    "Who reconciles them, and how many hours does it take?",
    "Have you ever lost an order because stock looked available but wasn't?",
  ],
  "Hiring more people but output isn't growing": [
    "How many people did you add this year, and what did revenue do?",
    "Where does a new hire spend their first two weeks: learning or waiting?",
    "Which roles are mostly copying data between sheets?",
  ],
  "No idea which ad campaign actually brings paying customers": [
    "What did you spend on ads last month, and how many became paying customers?",
    "Does your sales team mark which campaign a customer came from?",
    "If you could cut one channel tomorrow, which would it be?",
  ],
};

function buildScript(l: Lead, me: string) {
  const prog = programById[recommend(l).id];
  const att = attendance(l);
  const emi6 = Math.round(prog.price / 6 / 100) * 100;
  const emi3 = Math.round(prog.price / 3 / 100) * 100;
  const fn = first(l.name);
  return {
    opening: att.both
      ? `Namaste ${fn} ji, ${me} here from Dr. Amit Moga's team at BuildBiz AI. You were with us for both days of the Batch 14 workshop, thank you. On Day 2 you wrote down "${lc(l.pain)}". I'm calling to see whether you've made progress on that, and if a 15-minute plan would help. Is now a good time?`
      : att.label.startsWith("Batch")
        ? `Namaste ${fn} ji, ${me} from BuildBiz AI. You joined Day 1 of the Business OS workshop on 13 Oct. We covered the Day 2 operating-system blueprint after you dropped, so I wanted to share the key part and hear about ${l.company}. Two minutes?`
        : `Namaste ${fn} ji, ${me} from BuildBiz AI, Dr. Amit Moga's team. You reached us through ${l.source.toLowerCase()} about running ${l.company} with less dependence on you. I have a quick question about how things run today. Is this a good time?`,
    discovery: DISCOVERY[l.pain] ?? ["What does a typical day look like for you?", "Where does work get stuck?", "What would you fix first?"],
    objections: [
      { q: "It's too expensive", a: `Fair. Let's size it against the problem: if "${lc(l.pain)}" costs you even 2 hours a day across a ${l.teamSize}-person team, that's more than ${rupees(prog.price)} a quarter. ${prog.short} is built to pay for itself inside 90 days, and if it doesn't we keep working with you at no cost.` },
      { q: "Can I pay in EMI?", a: `Yes. ${prog.short} is ${rupees(prog.price)}, and we can do 6 no-cost EMIs of ${rupees(emi6)} on any credit card, or 3 instalments of ${rupees(emi3)} by UPI. Most owners at ${l.revenue} pick the 3-part plan. Shall I send the link for the first one?` },
      { q: "Partner se baat karni hai", a: `Bilkul ji, partner ko saath lena chahiye. Rather than you explaining it secondhand, let's put 20 minutes on the calendar with both of you and I'll walk through the ${l.industry.toLowerCase()} examples. Kal 11 baje ya shaam 6 baje, which works for them?` },
      { q: "Details WhatsApp pe bhej do", a: `Zaroor, I'll send the one-page outline right after we hang up. So I send the right thing: is it the ${prog.short} curriculum, the case study from a ${l.industry.toLowerCase()} business, or the payment plan you'd want to see first? And can I call you back tomorrow at 7 PM once you've seen it?` },
      { q: "GST invoice milega?", a: `Yes, a proper GST invoice in ${l.company}'s name with 18% GST, so you claim the full input credit. Effective cost on ${rupees(prog.price)} is the base price only. Share the GSTIN on WhatsApp and accounts will issue it the same day.` },
      { q: "Abhi season hai, baad mein dekhte hain", a: `Samajh sakta hoon. That's exactly when ${lc(l.pain)} hurts most. The November cohort starts on the 4th and the first 2 weeks are 3 hours total. Let me hold a seat at today's price till Friday, no payment needed.` },
    ],
    pitch: { prog, why: recommend(l).why },
    openingHi: att.both
      ? `Namaste ${fn} ji, main ${me} bol raha hoon, Dr. Amit Moga ki team se, BuildBiz AI. Aap Batch 14 workshop mein dono din the, bahut shukriya. Day 2 pe aapne likha tha "${lc(l.pain)}". Uspe kuch progress hua? 15 minute ka plan banake dein, abhi baat ho sakti hai?`
      : `Namaste ${fn} ji, ${me} bol raha hoon BuildBiz AI se. Aapne ${l.company} ke liye enquiry ki thi, ki business aap pe kam depend kare. Bas do minute chahiye, ek sawaal poochna tha. Abhi theek time hai?`,
    closeHi: `Jo aapne bataya, uske hisaab se next step ek 30 minute ki strategy call hai, jismein hum ${l.company} ke pehle teen systems map karenge. Budhvaar 11 baje ya Guruvaar 4 baje, aapke liye kya theek rahega?`,
    close: `Based on what you've told me, the next step is a 30-minute strategy call where we map ${l.company}'s first three systems. I have Wednesday 11 AM or Thursday 4 PM. Which suits you?`,
  };
}

function buildTranscript(l: Lead, me: string) {
  const fn = first(l.name);
  const prog = programById[recommend(l).id];
  return [
    { at: 3, who: me, text: `Namaste ${fn} ji, ${me} from BuildBiz AI. Is this a good time?` },
    { at: 8, who: fn, text: "Haan, bolo. I have 5 minutes." },
    { at: 14, who: me, text: "You mentioned at the workshop that work gets stuck. What's the biggest one?" },
    { at: 21, who: fn, text: `Honestly, ${lc(l.pain)}. It's been like this for two years.`, flag: { label: "Pain confirmed", tone: "ok" as Tone } },
    { at: 29, who: me, text: "How much of your week goes into that?" },
    { at: 36, who: fn, text: "Easily 10, 12 hours. My manager also." },
    { at: 44, who: fn, text: `What does the ${prog.short} cost? These programs are usually expensive.`, flag: { label: "Price objection", tone: "warn" as Tone, tab: "objections" } },
    { at: 53, who: me, text: `It's ${rupees(prog.price)}, and we can split it into EMIs. Let me explain what you get first.` },
    { at: 62, who: fn, text: "Okay. I'll need to discuss with my brother, he handles accounts.", flag: { label: "Partner involved", tone: "info" as Tone, tab: "objections" } },
    { at: 70, who: me, text: "Makes sense. Shall we do a call with both of you this week?" },
    { at: 77, who: fn, text: "Thursday evening works.", flag: { label: "Buying signal", tone: "ok" as Tone, tab: "close" } },
  ];
}

/* ---------------- WhatsApp drafting ---------------- */

type WaTemplate = "recap" | "missed" | "emi" | "recording";
const WA_TEMPLATES: { id: WaTemplate; label: string }[] = [
  { id: "recap", label: "Post-call recap" },
  { id: "missed", label: "Missed you" },
  { id: "emi", label: "EMI plan" },
  { id: "recording", label: "Workshop recording" },
];

function draftWa(l: Lead, t: WaTemplate, style: "Standard" | "Short" | "Hinglish", me: string) {
  const fn = first(l.name);
  const prog = programById[recommend(l).id];
  const emi = rupees(Math.round(prog.price / 6 / 100) * 100);
  if (style === "Short") {
    return {
      recap: `Hi ${fn} ji, thanks for the call. ${prog.short} outline: buildbiz.ai/p/${prog.id}. Speak Thursday. – ${me}`,
      missed: `Hi ${fn} ji, ${me} from BuildBiz AI. Tried calling about your workshop plan. 10 mins today?`,
      emi: `Hi ${fn} ji, ${prog.short}: ${rupees(prog.price)} or 6 x ${emi} no-cost EMI. Link: buildbiz.ai/pay/${prog.id}`,
      recording: `Hi ${fn} ji, Batch 14 Day 2 recording + blueprint: buildbiz.ai/b14. – ${me}`,
    }[t];
  }
  if (style === "Hinglish") {
    return {
      recap: `Namaste ${fn} ji! Aaj baat karke accha laga. Aapne bataya "${lc(l.pain)}", isi ke liye ${prog.short} ka outline bhej raha hoon: buildbiz.ai/p/${prog.id}\n\nThursday ko aapke partner ke saath call fix karte hain? 🙏\n– ${me}, BuildBiz AI`,
      missed: `Namaste ${fn} ji, ${me} BuildBiz AI se. Workshop ke baad aapka action plan discuss karna tha, call nahi lag paaya. Aaj 10 minute mil sakte hain?`,
      emi: `Namaste ${fn} ji, ${prog.short} ki fees ${rupees(prog.price)} hai. Aap 6 no-cost EMI (${emi}/month) mein bhi le sakte hain. Payment link: buildbiz.ai/pay/${prog.id}`,
      recording: `Namaste ${fn} ji, Batch 14 Day 2 ki recording aur Business OS blueprint yahan hai: buildbiz.ai/b14. Dekh ke bataiye kaunsa system pehle lagana hai!`,
    }[t];
  }
  return {
    recap: `Hi ${fn} ji, thank you for the time today.\n\nYou mentioned "${lc(l.pain)}". That is exactly what ${prog.name} fixes first. Here's the outline and a case study from a ${l.industry.toLowerCase()} business: buildbiz.ai/p/${prog.id}\n\nI've pencilled in Thursday 6 PM for a call with you and your partner. Does that still work?\n\n– ${me}, BuildBiz AI`,
    missed: `Hi ${fn} ji, ${me} here from Dr. Amit Moga's team at BuildBiz AI. I tried calling about your action plan from the Batch 14 workshop.\n\nWhen would 10 minutes suit you today? Reply with a time and I'll call then.`,
    emi: `Hi ${fn} ji, as promised, the payment options for ${prog.name}:\n\n• Full: ${rupees(prog.price)}\n• 6 no-cost EMIs of ${emi} on any credit card\n• 3 instalments by UPI\n\nSecure link: buildbiz.ai/pay/${prog.id}\nYour seat in the November cohort is held till Friday.`,
    recording: `Hi ${fn} ji, here's the Day 2 recording from the Batch 14 Business OS workshop and the blueprint template Dr. Amit shared: buildbiz.ai/b14\n\nStart with the "owner dependency" worksheet on page 3. Happy to go through it on a call.`,
  }[t];
}

/* ---------------- Small parts ---------------- */

function ScoreRing({ score, size = 76 }: { score: number; size?: number }) {
  const r = Math.round(size / 2 - 6);
  const c = Math.round(2 * Math.PI * r);
  const len = Math.round((score / 100) * c);
  const tone = score >= 80 ? "var(--d-ok)" : score >= 60 ? "var(--d-gold)" : "var(--d-late)";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--d-sunk)" strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${len} ${c}`} className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="tnum font-serif text-[24px] font-medium leading-none">{score}</span>
        <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-d-mute">AI score</span>
      </div>
    </div>
  );
}

const WAVE = Array.from({ length: 46 }, (_, i) => ({ h: 18 + ((i * 37) % 70), d: 520 + ((i * 131) % 600), delay: (i * 73) % 500 }));
function Waveform({ live, muted }: { live: boolean; muted: boolean }) {
  return (
    <div className="flex h-10 items-center gap-[3px]" aria-hidden>
      {WAVE.map((b, i) => (
        <span
          key={`w${i}`}
          className="w-[3px] rounded-full"
          style={{
            height: `${live && !muted ? b.h : 10}%`,
            background: i % 9 === 0 ? "var(--d-gold)" : "var(--d-accent)",
            opacity: live ? 0.55 + (i % 4) * 0.12 : 0.25,
            animation: live && !muted ? `crm-wave ${b.d}ms ease-in-out ${b.delay}ms infinite alternate` : undefined,
          }}
        />
      ))}
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded border border-current/25 px-1 font-mono text-[10px] font-semibold opacity-80">{children}</kbd>;
}

type SessionStats = { dialled: number; connected: number; talk: number; booked: number };
type LiveCall = { leadId: string; started: number };

/* ============================================================ */

export default function CallingCRM() {
  const hq = useHQ();
  const { me, leads } = hq;
  const isFounder = me.role === "founder";

  const [scopeOverride, setScopeOverride] = React.useState<"mine" | "all" | null>(null);
  const scope = scopeOverride ?? (isFounder ? "all" : "mine");
  const [stageF, setStageF] = React.useState<"All" | LeadStage>("All");
  const [sourceF, setSourceF] = React.useState("All");
  const [hotOnly, setHotOnly] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [done, setDone] = React.useState<Record<string, Outcome>>({});

  const [call, setCall] = React.useState<LiveCall | null>(null);
  const [elapsed, setElapsed] = React.useState(0);
  const [muted, setMuted] = React.useState(false);
  const [held, setHeld] = React.useState(false);
  const [liveNote, setLiveNote] = React.useState("");
  const [lang, setLang] = React.useState<"English" | "Hinglish">("Hinglish");
  const [tab, setTab] = React.useState<"opening" | "discovery" | "objections" | "pitch" | "close">("opening");

  const [logOpen, setLogOpen] = React.useState(false);
  const [logSecs, setLogSecs] = React.useState(0);
  const [outcome, setOutcome] = React.useState<Outcome>("Connected");
  const [note, setNote] = React.useState("");
  const [nextH, setNextH] = React.useState(18);
  const [nextStage, setNextStage] = React.useState<LeadStage>("Contacted");

  const [waOpen, setWaOpen] = React.useState(false);
  const [waT, setWaT] = React.useState<WaTemplate>("recap");
  const [waStyle, setWaStyle] = React.useState<"Standard" | "Short" | "Hinglish">("Standard");
  const [waText, setWaText] = React.useState("");

  const [autoDial, setAutoDial] = React.useState(false);
  const [dialIn, setDialIn] = React.useState<{ id: string; n: number } | null>(null);
  const [stats, setStats] = React.useState<SessionStats>({ dialled: 18, connected: 9, talk: 3140, booked: 2 });

  /* ---------- queue ---------- */
  const sources = React.useMemo(() => ["All", ...Array.from(new Set(leads.map((l) => l.source)))], [leads]);
  const queue = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    return leads
      .filter((l) => OPEN_STAGES.includes(l.stage))
      .filter((l) => scope === "all" || l.owner === me.id)
      .filter((l) => stageF === "All" || l.stage === stageF)
      .filter((l) => sourceF === "All" || l.source === sourceF)
      .filter((l) => !hotOnly || l.score >= 80)
      .filter((l) => !term || `${l.name} ${l.company} ${l.city} ${l.industry} ${l.id}`.toLowerCase().includes(term))
      .map((l) => ({ lead: l, ...priorityOf(l) }))
      .sort((a, b) => Number(!!done[a.lead.id]) - Number(!!done[b.lead.id]) || b.p - a.p);
  }, [leads, scope, me.id, stageF, sourceF, hotOnly, q, done]);

  const active = leads.find((l) => l.id === activeId) ?? queue[0]?.lead ?? null;
  const remaining = queue.filter((x) => !done[x.lead.id]).length;
  const onCall = !!call && call.leadId === active?.id;

  const nextInQueue = React.useCallback(
    (fromId: string | undefined, skipDone: Record<string, Outcome>) => {
      const open = queue.filter((x) => !skipDone[x.lead.id] && x.lead.id !== fromId);
      const idx = queue.findIndex((x) => x.lead.id === fromId);
      const after = open.find((x) => queue.indexOf(x) > idx);
      return (after ?? open[0])?.lead ?? null;
    },
    [queue],
  );

  /* ---------- effects ---------- */
  React.useEffect(() => {
    if (!call) return;
    const t = window.setInterval(() => setElapsed(Math.floor((Date.now() - call.started) / 1000)), 250);
    return () => window.clearInterval(t);
  }, [call]);

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("lead");
      if (id) {
        setActiveId(id);
        setScopeOverride("all");
        if (params.get("call") === "1") {
          setCall({ leadId: id, started: Date.now() - 80000 });
          setElapsed(80);
        }
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  React.useEffect(() => {
    if (!dialIn) return;
    const t = window.setTimeout(() => {
      if (dialIn.n <= 1) {
        setDialIn(null);
        setActiveId(dialIn.id);
        setCall({ leadId: dialIn.id, started: Date.now() });
        setElapsed(0);
        setStats((s) => ({ ...s, dialled: s.dialled + 1 }));
      } else setDialIn({ ...dialIn, n: dialIn.n - 1 });
    }, 1000);
    return () => window.clearTimeout(t);
  }, [dialIn]);

  /* ---------- actions ---------- */
  const startCall = React.useCallback(() => {
    if (!active || call) return;
    setDialIn(null);
    setCall({ leadId: active.id, started: Date.now() });
    setElapsed(0);
    setMuted(false);
    setHeld(false);
    setLiveNote("");
    setTab("opening");
    setStats((s) => ({ ...s, dialled: s.dialled + 1 }));
    hq.log(`started a call with ${active.name} (${active.company})`, "info");
  }, [active, call, hq]);

  const endCall = React.useCallback(() => {
    if (!call || !active) return;
    const secs = Math.max(1, Math.floor((Date.now() - call.started) / 1000));
    setCall(null);
    setLogSecs(secs);
    const guess: Outcome = secs < 12 ? "No answer" : secs > 70 ? "Booked" : "Connected";
    setOutcome(guess);
    setNextH(guess === "No answer" ? 2 : guess === "Booked" ? 48 : 18);
    setNextStage(guessStage(active.stage, guess));
    setNote(liveNote);
    setLogOpen(true);
  }, [call, active, liveNote]);

  const goNext = React.useCallback(() => {
    if (call) return;
    const n = nextInQueue(active?.id, done);
    if (n) setActiveId(n.id);
  }, [call, active, done, nextInQueue]);

  function pickOutcome(o: Outcome) {
    setOutcome(o);
    if (active) setNextStage(guessStage(active.stage, o));
    setNextH(o === "No answer" || o === "Busy" ? 2 : o === "Call back" ? 18 : o === "Booked" ? 48 : o === "Not interested" ? 720 : 24);
  }

  function aiNote() {
    if (!active) return;
    const prog = programById[recommend(active).id];
    const texts: Record<Outcome, string> = {
      Connected: `Spoke ${Math.max(1, Math.round(logSecs / 60))} min. Confirmed pain: ${lc(active.pain)}. ~10-12 hrs/week lost across owner + manager. Raised price; positioned ${prog.short} with 6-month EMI. Brother (accounts) needs to join next call.`,
      Booked: `Booked strategy call. Pain: ${lc(active.pain)}. Fit for ${prog.short} (${rupees(prog.price)}). Partner joining; send EMI plan + ${active.industry.toLowerCase()} case study before the call.`,
      "Call back": `Asked to call back. Was in a meeting; sounded open. Retry with the workshop Day 2 hook.`,
      "No answer": `No answer. Sent missed-call WhatsApp. Retry after 6 PM; owners at ${active.revenue} pick up evenings.`,
      Busy: `Line busy / call cut. Retry in 2 hours.`,
      "Not interested": `Not a fit right now: timing. Revisit in Q1 with the next workshop batch invite.`,
    };
    setNote(texts[outcome]);
  }

  function saveOutcome() {
    if (!active) return;
    const lead = active;
    const minutes = Math.max(1, Math.round(logSecs / 60));
    const now = new Date();
    const at = `${now.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" })}, ${now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })}`;
    const entry: CallLog = { at, by: me.id, outcome, minutes, note: note.trim() || `${outcome}.` };
    hq.updateLead(lead.id, (l) => ({
      calls: [...l.calls, entry],
      stage: nextStage,
      followUpIn: nextH,
      tags: outcome === "Booked" && !l.tags.includes("Call booked") ? [...l.tags, "Call booked"] : l.tags,
    }));
    const connected = outcome === "Connected" || outcome === "Booked" || outcome === "Call back" || outcome === "Not interested";
    setStats((s) => ({ dialled: s.dialled, connected: s.connected + (connected ? 1 : 0), talk: s.talk + (connected ? logSecs : 0), booked: s.booked + (outcome === "Booked" ? 1 : 0) }));
    hq.log(`logged ${outcome.toLowerCase()} with ${lead.name} (${lead.company}), ${lead.stage === nextStage ? `stays ${nextStage}` : `${lead.stage} → ${nextStage}`}`, outcome === "Booked" ? "ok" : outcome === "Not interested" ? "late" : "info");
    hq.notify({ kind: "lead", title: `${outcome}: ${lead.name}`, body: `${lead.company} · next follow-up ${FOLLOW_UPS.find((f) => f.h === nextH)?.label.toLowerCase() ?? dueLabel(nextH)}`, href: `/hq/crm?lead=${lead.id}` });
    if (outcome === "Booked") {
      hq.addTask({ title: `Prep strategy call: ${lead.name}, ${lead.company}`, owner: lead.owner, status: "Todo", priority: "P1", due: "In 2 days", dueIn: 2, area: "Sales", linked: lead.id, aiDrafted: true, subtasks: [{ title: "Send EMI plan on WhatsApp", done: false }, { title: `Pull ${lead.industry.toLowerCase()} case study`, done: false }] });
    }
    const nextDone = { ...done, [lead.id]: outcome };
    setDone(nextDone);
    setLogOpen(false);
    const n = nextInQueue(lead.id, nextDone);
    if (n) {
      setActiveId(n.id);
      if (autoDial) setDialIn({ id: n.id, n: 3 });
    }
  }

  function openWa(t?: WaTemplate) {
    if (!active) return;
    const last = active.calls[active.calls.length - 1];
    const pickT: WaTemplate = t ?? (last?.outcome === "No answer" || last?.outcome === "Busy" ? "missed" : active.tags.includes("EMI ask") ? "emi" : last ? "recap" : "recording");
    setWaT(pickT);
    setWaStyle("Standard");
    setWaText(draftWa(active, pickT, "Standard", me.first));
    setWaOpen(true);
  }
  function redraft(t: WaTemplate, s: "Standard" | "Short" | "Hinglish") {
    if (!active) return;
    setWaT(t);
    setWaStyle(s);
    setWaText(draftWa(active, t, s, me.first));
  }
  function sendWa() {
    if (!active) return;
    hq.updateLead(active.id, (l) => ({ tags: l.tags.includes("WhatsApp sent") ? l.tags : [...l.tags, "WhatsApp sent"], followUpIn: Math.max(l.followUpIn, 24) }));
    hq.log(`sent a WhatsApp ${WA_TEMPLATES.find((x) => x.id === waT)?.label.toLowerCase()} to ${active.name}`, "info");
    hq.notify({ kind: "lead", title: `WhatsApp sent to ${active.name}`, body: `${WA_TEMPLATES.find((x) => x.id === waT)?.label} · delivered via BuildBiz Business API`, href: `/hq/crm?lead=${active.id}` });
    setWaOpen(false);
  }

  /* ---------- keyboard ---------- */
  const keys = React.useRef({ startCall, endCall, goNext });
  React.useEffect(() => {
    keys.current = { startCall, endCall, goNext };
  });
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey || document.querySelector("[role=dialog]")) return;
      const k = e.key.toLowerCase();
      if (k !== "c" && k !== "e" && k !== "n") return;
      e.preventDefault();
      e.stopPropagation();
      if (k === "c") keys.current.startCall();
      else if (k === "e") keys.current.endCall();
      else keys.current.goNext();
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  /* ---------- derived ---------- */
  const script = active ? buildScript(active, me.first) : null;
  const transcript = active ? buildTranscript(active, me.first) : [];
  const shown = onCall ? transcript.filter((x) => x.at <= elapsed) : [];
  const flags = shown.filter((x) => x.flag);
  const transcriptRef = React.useRef<HTMLOListElement>(null);
  const shownCount = shown.length;
  React.useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [shownCount]);
  const rec = active ? recommend(active) : null;
  const att = active ? attendance(active) : null;
  const pr = active ? priorityOf(active) : null;
  const connectRate = stats.dialled ? Math.round((stats.connected / stats.dialled) * 100) : 0;
  const scoreReasons = active
    ? [
        { t: `${active.revenue} revenue band`, good: (bandRank[active.revenue] ?? 0) >= 2 },
        { t: `${active.teamSize} staff`, good: active.teamSize >= 25 },
        { t: att!.label, good: att!.both },
        { t: `Source: ${active.source}`, good: ["Workshop", "Referral"].includes(active.source) },
        { t: active.tags.includes("Decision maker") ? "Decision maker on the call" : "Decision maker not confirmed", good: active.tags.includes("Decision maker") },
      ]
    : [];

  return (
    <div>
      <style>{`@keyframes crm-wave{from{transform:scaleY(.35)}to{transform:scaleY(1)}}@keyframes crm-ring{0%{box-shadow:0 0 0 0 color-mix(in oklab,var(--d-accent) 45%,transparent)}100%{box-shadow:0 0 0 18px transparent}}`}</style>
      <PageHeader
        kicker="Revenue"
        title="Calling CRM"
        sub={`${isFounder ? "Every advisor's queue" : `${me.first}'s queue`}, ranked by the AI on score, follow-up urgency and workshop intent. Call, log, and the next lead is ready.`}
        actions={
          <>
            <span className="hidden items-center gap-1.5 text-[12px] text-d-mute xl:inline-flex">
              <Keyboard className="h-3.5 w-3.5" /> <Kbd>C</Kbd> call <Kbd>E</Kbd> end <Kbd>N</Kbd> next
            </span>
            <Btn icon={Zap} variant={autoDial ? "solid" : "outline"} onClick={() => setAutoDial((v) => !v)}>
              Auto-dial {autoDial ? "on" : "off"}
            </Btn>
            <Btn icon={Sparkles} onClick={() => hq.openAsk("Who should I call first today and why?")}>
              Ask copilot
            </Btn>
          </>
        }
      />

      {/* session strip */}
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Metric label="Dialled today" value={stats.dialled} hint="target 60 · 9:30 AM start" />
        <Metric label="Connected" value={stats.connected} delta={`${connectRate}%`} good={connectRate >= 40} hint="connect rate" />
        <Metric label="Talk time" value={`${Math.floor(stats.talk / 60)}m`} hint={`avg ${stats.connected ? fmtTime(Math.round(stats.talk / stats.connected)) : "00:00"} per connect`} />
        <Metric label="Booked today" value={stats.booked} delta={stats.booked > 2 ? `+${stats.booked - 2}` : undefined} hint="strategy calls" />
        <Metric label="Queue left" value={remaining} hint={`${queue.filter((x) => x.lead.followUpIn < 0 && !done[x.lead.id]).length} overdue · ${queue.filter((x) => x.lead.score >= 80 && !done[x.lead.id]).length} hot`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* ---------------- queue ---------------- */}
        <aside className="desk-card flex min-w-0 flex-col self-start overflow-hidden lg:sticky lg:top-[84px] lg:max-h-[calc(100vh-100px)]">
          <div className="space-y-2.5 border-b border-d-line p-3.5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-d-mute">Call queue</p>
              <span className="inline-flex items-center gap-1"><AIMark label="AI ranked" /></span>
            </div>
            <Segmented size="sm" value={scope} onChange={(v) => setScopeOverride(v)} options={[{ value: "mine", label: "My leads", count: leads.filter((l) => l.owner === me.id && OPEN_STAGES.includes(l.stage)).length }, { value: "all", label: "All advisors", count: leads.filter((l) => OPEN_STAGES.includes(l.stage)).length }]} />
            <SearchBox value={q} onChange={setQ} placeholder="Name, company, city" />
            <div className="flex gap-2">
              <select aria-label="Stage" value={stageF} onChange={(e) => setStageF(e.target.value as "All" | LeadStage)} className={cn(inputClass, "h-8 flex-1 px-2 text-[12.5px]")}>
                <option value="All">All stages</option>
                {OPEN_STAGES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <select aria-label="Source" value={sourceF} onChange={(e) => setSourceF(e.target.value)} className={cn(inputClass, "h-8 flex-1 px-2 text-[12.5px]")}>
                {sources.map((s) => (
                  <option key={s} value={s}>
                    {s === "All" ? "All sources" : s}
                  </option>
                ))}
              </select>
              <IconBtn icon={Flame} label="Hot only (80+)" active={hotOnly} onClick={() => setHotOnly((v) => !v)} className="h-8 w-8" />
            </div>
          </div>
          <ol className="desk-scroll min-h-0 flex-1 overflow-y-auto p-1.5" style={{ maxHeight: 720 }}>
            {queue.length === 0 && <li className="px-4 py-10 text-center text-[13px] text-d-mute">Nothing matches these filters.</li>}
            {queue.map((x, i) => {
              const l = x.lead;
              const on = l.id === active?.id;
              const d = done[l.id];
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    disabled={!!call && !onCall}
                    onClick={() => !call && setActiveId(l.id)}
                    className={cn(
                      "group relative flex w-full items-start gap-2.5 rounded-[10px] px-2.5 py-2.5 text-left transition-colors",
                      on ? "bg-d-soft" : "hover:bg-d-sunk",
                      d && "opacity-55",
                    )}
                  >
                    {on && <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-d-accent" />}
                    <span className="tnum mt-0.5 w-5 shrink-0 text-right font-mono text-[11px] text-d-mute">{d ? <Check className="ml-auto h-3.5 w-3.5 text-d-ok" /> : i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[13.5px] font-semibold">{l.name}</span>
                        {l.score >= 80 && <Flame className="h-3 w-3 shrink-0 text-d-late" />}
                      </span>
                      <span className="block truncate text-[12px] text-d-mute">
                        {l.company} · {l.city}
                      </span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <Pill tone={stageTone[l.stage]} className="px-1.5 py-0 text-[10.5px]">
                          {l.stage}
                        </Pill>
                        {d ? (
                          <span className="text-[11px] font-medium" style={{ color: `var(--d-${outcomeTone(d) === "neutral" ? "mute" : outcomeTone(d)})` }}>{d}</span>
                        ) : (
                          <span className={cn("font-mono text-[10.5px]", l.followUpIn < 0 ? "font-semibold text-d-late" : "text-d-mute")}>{dueLabel(l.followUpIn)}</span>
                        )}
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1.5">
                      <span className={cn("tnum rounded-md px-1.5 py-0.5 font-mono text-[11.5px] font-semibold", l.score >= 80 ? "bg-[color-mix(in_oklab,var(--d-ok)_12%,transparent)] text-d-ok" : l.score >= 60 ? "bg-d-sunk text-d-ink" : "bg-d-sunk text-d-mute")}>{l.score}</span>
                      {scope === "all" && <PersonAvatar id={l.owner} size={18} />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        {/* ---------------- active lead ---------------- */}
        {active && script && rec && att && pr ? (
          <div className="min-w-0 space-y-4">
            <section className={cn("desk-card overflow-hidden", onCall && "ring-2 ring-[color-mix(in_oklab,var(--d-accent)_35%,transparent)]")}>
              <div className="flex flex-wrap items-start gap-5 p-5">
                <PersonAvatar name={active.name} size={56} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-serif text-[28px] font-medium leading-none tracking-tight">{active.name}</h2>
                    <Pill tone={stageTone[active.stage]}>{active.stage}</Pill>
                    <span className="font-mono text-[11.5px] text-d-mute">{active.id}</span>
                  </div>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] text-d-mute">
                    <span className="inline-flex items-center gap-1.5 font-medium text-d-ink">
                      <Building2 className="h-3.5 w-3.5" /> {active.company}
                    </span>
                    <span>{active.industry}</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {active.city}
                    </span>
                    <span className="font-mono text-[12.5px] text-d-ink">{active.phone}</span>
                  </p>
                  <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2.5 sm:grid-cols-4">
                    {[
                      { k: "Revenue", v: active.revenue },
                      { k: "Team", v: `${active.teamSize} people` },
                      { k: "Workshop", v: <span style={{ color: att.tone === "neutral" ? undefined : `var(--d-${att.tone})` }}>{att.label}</span> },
                      { k: "Owner", v: <span className="inline-flex items-center gap-1.5"><PersonAvatar id={active.owner} size={18} />{personById[active.owner]?.first}</span> },
                    ].map((x) => (
                      <div key={x.k} className="min-w-0">
                        <dt className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-d-mute">{x.k}</dt>
                        <dd className="mt-0.5 text-[13.5px] font-medium leading-snug">{x.v}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    <Pill>{active.source}</Pill>
                    {active.tags.map((t) => (
                      <Pill key={t} tone={t === "Hot" ? "late" : t === "Warm" ? "warn" : t === "EMI ask" ? "info" : t === "Decision maker" ? "ok" : "neutral"}>
                        {t}
                      </Pill>
                    ))}
                    <Pill tone={active.followUpIn < 0 ? "late" : "neutral"} mono>
                      <CalendarClock className="h-3 w-3" /> {dueLabel(active.followUpIn)}
                    </Pill>
                  </div>
                </div>
                <div className="flex w-full shrink-0 items-start gap-4 rounded-[12px] border border-d-line bg-d-sunk/50 p-3.5 sm:w-[300px]">
                  <ScoreRing score={active.score} />
                  <ul className="min-w-0 flex-1 space-y-1">
                    {scoreReasons.map((r) => (
                      <li key={r.t} className="flex items-start gap-1.5 text-[12px] leading-snug">
                        <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: r.good ? "var(--d-ok)" : "var(--d-warn)" }} />
                        <span className={r.good ? "" : "text-d-mute"}>{r.t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* call bar */}
              <div className={cn("flex flex-wrap items-center gap-4 border-t border-d-line px-5 py-4", onCall ? "bg-[#1d1714] text-[#f7f3ec]" : "bg-d-sunk/40")}>
                {onCall ? (
                  <>
                    <span className="inline-flex items-center gap-2.5">
                      <span className="desk-ping h-2.5 w-2.5 rounded-full bg-[#4ade80]" />
                      <span>
                        <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#e4c27a]">{held ? "On hold" : muted ? "Muted" : "Live call"}</span>
                        <span className="tnum block font-mono text-[26px] font-medium leading-none">{fmtTime(elapsed)}</span>
                      </span>
                    </span>
                    <div className="min-w-[160px] flex-1 overflow-hidden">
                      <Waveform live={!held} muted={muted} />
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setMuted((v) => !v)} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label={muted ? "Unmute" : "Mute"}>
                        {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </button>
                      <button type="button" onClick={() => setHeld((v) => !v)} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label={held ? "Resume" : "Hold"}>
                        {held ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                      </button>
                      <button type="button" onClick={endCall} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#c4472f] px-5 text-[14px] font-semibold text-white hover:brightness-110">
                        <PhoneOff className="h-4 w-4" /> End call <Kbd>E</Kbd>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={startCall}
                      disabled={!!call}
                      className="inline-flex h-12 items-center gap-2.5 rounded-full bg-d-accent px-7 text-[15px] font-semibold text-d-accent-ink shadow-[0_10px_24px_-10px_var(--d-accent)] transition-transform hover:brightness-110 active:scale-[0.97] disabled:opacity-40"
                      style={dialIn ? { animation: "crm-ring 1s ease-out infinite" } : undefined}
                    >
                      <Phone className="h-[18px] w-[18px]" /> {dialIn ? `Dialling in ${dialIn.n}…` : `Call ${first(active.name)}`} <Kbd>C</Kbd>
                    </button>
                    {dialIn && (
                      <Btn variant="ghost" onClick={() => setDialIn(null)}>
                        Cancel auto-dial
                      </Btn>
                    )}
                    <Btn icon={MessageCircle} onClick={() => openWa()}>
                      WhatsApp
                    </Btn>
                    <Btn icon={SkipForward} variant="ghost" onClick={goNext}>
                      Skip <Kbd>N</Kbd>
                    </Btn>
                    <p className="ml-auto max-w-[360px] text-right text-[12px] leading-snug text-d-mute">
                      <span className="font-semibold text-d-ink">Why now: </span>
                      {pr.reasons.join(" · ") || "Next in priority order"}
                    </p>
                  </>
                )}
              </div>
              {onCall && (
                <div className="border-t border-white/10 bg-[#241c18] px-5 py-3">
                  <input
                    value={liveNote}
                    onChange={(e) => setLiveNote(e.target.value)}
                    placeholder="Type notes while you talk; they carry into the call log…"
                    className="h-9 w-full rounded-[8px] border border-white/10 bg-white/5 px-3 text-[13px] text-[#f7f3ec] outline-none placeholder:text-white/40 focus:border-[#e4c27a]/60"
                  />
                </div>
              )}
            </section>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
              {/* script */}
              <div className="min-w-0 space-y-4">
                {onCall && (
                  <section className="desk-card p-5">
                    <SectionLabel action={<AIMark label="Live copilot" />}>Live transcript</SectionLabel>
                    {shown.length === 0 ? (
                      <p className="flex items-center gap-2 text-[13px] text-d-mute">
                        <span className="desk-ping h-2 w-2 rounded-full bg-d-gold" /> Ringing {active.phone}…
                      </p>
                    ) : (
                      <ol ref={transcriptRef} className="desk-scroll max-h-[230px] space-y-2 overflow-y-auto scroll-smooth pr-1">
                        {shown.map((line) => (
                          <li key={`t${line.at}`} className="desk-rise flex items-start gap-2.5">
                            <span className="tnum w-10 shrink-0 pt-0.5 font-mono text-[10.5px] text-d-mute">{fmtTime(line.at)}</span>
                            <span className={cn("w-16 shrink-0 pt-px text-[12px] font-semibold", line.who === me.first ? "text-d-accent" : "text-d-ink")}>{line.who}</span>
                            <span className="min-w-0 flex-1 text-[13px] leading-snug">
                              {line.text}
                              {line.flag && (
                                <button type="button" onClick={() => line.flag?.tab && setTab(line.flag.tab as typeof tab)} className="ml-2 inline-flex translate-y-[-1px] items-center gap-1 rounded-full px-1.5 py-px text-[10.5px] font-semibold" style={{ color: `var(--d-${line.flag.tone})`, background: `color-mix(in oklab, var(--d-${line.flag.tone}) 12%, transparent)` }}>
                                  <Sparkles className="h-2.5 w-2.5" /> {line.flag.label}
                                  {line.flag.tab && <ChevronRight className="h-2.5 w-2.5" />}
                                </button>
                              )}
                            </span>
                          </li>
                        ))}
                      </ol>
                    )}
                    {flags.length > 0 && (
                      <p className="mt-3 border-t border-d-line pt-2.5 text-[12px] text-d-mute">
                        <span className="font-semibold text-d-ink">Copilot: </span>
                        {flags[flags.length - 1].flag?.label === "Price objection"
                          ? `Lead with the 6-EMI option (${rupees(Math.round(rec ? programById[rec.id].price / 6 / 100 : 0) * 100)}/month) before defending the price.`
                          : flags[flags.length - 1].flag?.label === "Partner involved"
                            ? "Don't let them carry the pitch to the partner. Book a joint call now."
                            : flags[flags.length - 1].flag?.label === "Buying signal"
                              ? "Lock the slot now and say you'll send the calendar invite on WhatsApp."
                              : "Pain is confirmed. Quantify it in hours per week before you pitch."}
                      </p>
                    )}
                  </section>
                )}

                <section className="desk-card p-5">
                  <SectionLabel
                    action={
                      <span className="flex items-center gap-2">
                        <Segmented size="sm" value={lang} onChange={setLang} options={["English", "Hinglish"] as const} />
                        <AIMark label="Written for this lead" />
                      </span>
                    }
                  >
                    Call script
                  </SectionLabel>
                  <Segmented
                    size="sm"
                    value={tab}
                    onChange={setTab}
                    options={[
                      { value: "opening", label: "Opening" },
                      { value: "discovery", label: "Discovery" },
                      { value: "objections", label: "Objections" },
                      { value: "pitch", label: `Pitch · ${programById[rec.id].short}` },
                      { value: "close", label: "Close" },
                    ]}
                  />
                  <div className="mt-4 min-h-[200px]">
                    {tab === "opening" && (
                      <div className="desk-rise">
                        <p className="font-serif text-[19px] leading-[1.55] text-d-ink">&ldquo;{lang === "Hinglish" ? script.openingHi : script.opening}&rdquo;</p>
                        <p className="mt-3 text-[12px] text-d-mute">Hook: {att.both ? "their own Day 2 worksheet answer" : att.label.startsWith("Batch") ? "the Day 2 content they missed" : `the ${active.source.toLowerCase()} enquiry`}. Keep it under 20 seconds.</p>
                      </div>
                    )}
                    {tab === "discovery" && (
                      <ol className="desk-rise space-y-3">
                        <p className="text-[12.5px] text-d-mute">
                          Stated pain: <span className="font-medium text-d-ink">{active.pain}</span>
                        </p>
                        {script.discovery.map((d, i) => (
                          <li key={d} className="flex gap-3 rounded-[10px] border border-d-line p-3">
                            <span className="tnum font-serif text-[20px] leading-none text-d-gold">{i + 1}</span>
                            <span className="text-[14px] leading-snug">{d}</span>
                          </li>
                        ))}
                        <li className="rounded-[10px] bg-d-sunk/60 p-3 text-[12.5px] text-d-mute">Then quantify: &ldquo;So roughly how many hours a week does that cost you and your team?&rdquo; Write the number down; you&apos;ll use it in the pitch.</li>
                      </ol>
                    )}
                    {tab === "objections" && (
                      <div className="desk-rise grid gap-2.5 md:grid-cols-2">
                        {script.objections.map((o) => (
                          <div key={o.q} className="rounded-[12px] border border-d-line p-3.5">
                            <p className="text-[13px] font-semibold">&ldquo;{o.q}&rdquo;</p>
                            <p className="mt-1.5 text-[13px] leading-relaxed text-d-ink/80">{o.a}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {tab === "pitch" && (
                      <div className="desk-rise space-y-3">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <p className="font-serif text-[22px] font-medium">{script.pitch.prog.name}</p>
                          <p className="tnum font-mono text-[15px] font-semibold">{rupees(script.pitch.prog.price)}</p>
                        </div>
                        <AgentNote title="Why this program">
                          {script.pitch.why}.{rec.id !== active.interest && ` They enquired about ${programById[active.interest].short}; pitch ${programById[rec.id].short} first, keep ${programById[active.interest].short} as the fallback.`}
                        </AgentNote>
                        <ul className="grid gap-2 sm:grid-cols-3">
                          {[
                            { k: "Problem", v: active.pain },
                            { k: "What we build", v: rec.id === "dfy" || rec.id === "agents" ? `A ${active.industry.toLowerCase()} command center + AI agents, live in 8 weeks` : `Your follow-up, reporting and approval systems, with weekly live builds` },
                            { k: "Proof", v: rec.id === "dfy" ? "Precision Auto Parts, Ludhiana: owner approvals down 70%" : "Batch 11 owners: 9.4 hrs/week back on average" },
                          ].map((x) => (
                            <li key={x.k} className="rounded-[10px] border border-d-line p-3">
                              <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-d-mute">{x.k}</p>
                              <p className="mt-1 text-[13px] leading-snug">{x.v}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {tab === "close" && (
                      <div className="desk-rise">
                        <p className="font-serif text-[19px] leading-[1.55]">&ldquo;{lang === "Hinglish" ? script.closeHi : script.close}&rdquo;</p>
                        <p className="mt-3 text-[12px] text-d-mute">Offer two slots, never an open question. If they hesitate, offer the EMI link on WhatsApp and book the call anyway.</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* right rail */}
              <div className="min-w-0 space-y-4">
                <AgentNote
                  title="Next best action"
                  action={
                    <>
                      <Btn size="sm" variant="solid" icon={PhoneCall} onClick={startCall} disabled={!!call}>
                        Call now
                      </Btn>
                      <Btn size="sm" icon={MessageCircle} onClick={() => openWa()}>
                        Draft WhatsApp
                      </Btn>
                    </>
                  }
                >
                  {active.calls.length === 0
                    ? `First touch. Open with the ${att.both ? "Day 2 worksheet" : "workshop"} hook and qualify revenue and team; recommend ${programById[rec.id].short}.`
                    : (() => {
                        const last = active.calls[active.calls.length - 1];
                        return last.outcome === "No answer" || last.outcome === "Busy"
                          ? `${active.calls.filter((c) => c.outcome === "No answer" || c.outcome === "Busy").length} unanswered attempts. Send the missed-you WhatsApp first; reply rates double before a 3rd dial.`
                          : `Last call (${last.at}): "${last.note}". Pick up from there and push for a booked strategy call.`;
                      })()}
                </AgentNote>

                <section className="desk-card p-5">
                  <SectionLabel action={<span className="font-mono text-[11px] text-d-mute">{active.calls.length} calls · {active.calls.reduce((a, c) => a + c.minutes, 0)} min</span>}>Call history</SectionLabel>
                  {active.calls.length === 0 ? (
                    <p className="rounded-[10px] border border-dashed border-d-line px-3 py-6 text-center text-[12.5px] text-d-mute">No calls yet. You&apos;re the first touch.</p>
                  ) : (
                    <ol className="relative space-y-3.5 before:absolute before:bottom-1 before:left-[5px] before:top-1 before:w-px before:bg-d-line">
                      {[...active.calls].reverse().map((c, i) => (
                        <li key={`${c.at}-${i}`} className="desk-rise relative pl-6">
                          <span className="absolute left-0 top-1 h-[11px] w-[11px] rounded-full border-2 border-d-panel" style={{ background: outcomeTone(c.outcome) === "neutral" ? "var(--d-mute)" : `var(--d-${outcomeTone(c.outcome)})` }} />
                          <p className="flex items-center gap-1.5 text-[12px]">
                            <span className="font-semibold">{c.outcome}</span>
                            <span className="text-d-mute">· {c.minutes} min · {personById[c.by]?.first ?? c.by}</span>
                            <span className="ml-auto font-mono text-[10.5px] text-d-mute">{c.at}</span>
                          </p>
                          <p className="mt-0.5 text-[12.5px] leading-snug text-d-ink/80">{c.note}</p>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>

                <section className="desk-card p-5">
                  <SectionLabel>Quick WhatsApp</SectionLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {WA_TEMPLATES.map((t) => (
                      <button key={t.id} type="button" onClick={() => openWa(t.id)} className="rounded-[10px] border border-d-line px-3 py-2.5 text-left text-[12.5px] font-medium transition-colors hover:border-d-accent/40 hover:bg-d-sunk">
                        <MessageCircle className="mb-1 h-3.5 w-3.5 text-[#2f7d5b]" />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        ) : (
          <div className="desk-card flex min-h-[400px] flex-col items-center justify-center p-10 text-center">
            <Check className="h-8 w-8 text-d-ok" />
            <p className="mt-3 font-serif text-[24px]">Queue clear</p>
            <p className="mt-1 text-[13.5px] text-d-mute">Every lead matching these filters has been worked. Widen the filters or switch to all advisors.</p>
          </div>
        )}
      </div>

      {/* ---------------- outcome logger ---------------- */}
      <Modal open={logOpen} onOpenChange={(o) => !o && setLogOpen(false)} title={active ? `Log call · ${active.name}` : "Log call"} sub={`${fmtTime(logSecs)} on the line · ${active?.company ?? ""}`} width={600}>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {OUTCOMES.map((o) => {
              const on = outcome === o.id;
              const c = o.tone === "neutral" ? "var(--d-ink)" : `var(--d-${o.tone})`;
              return (
                <button key={o.id} type="button" onClick={() => pickOutcome(o.id)} className={cn("rounded-[10px] border px-3 py-2.5 text-left transition-all", on ? "border-transparent" : "border-d-line hover:bg-d-sunk")} style={on ? { background: `color-mix(in oklab, ${c} 12%, var(--d-panel))`, boxShadow: `inset 0 0 0 1.5px ${c}` } : undefined}>
                  <span className="block text-[13.5px] font-semibold" style={on ? { color: c } : undefined}>
                    {o.id}
                  </span>
                  <span className="block text-[11.5px] text-d-mute">{o.hint}</span>
                </button>
              );
            })}
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[12px] font-medium text-d-mute">Note</span>
              <button type="button" onClick={aiNote} className="inline-flex items-center gap-1 text-[12px] font-medium text-[color-mix(in_oklab,var(--d-gold)_80%,black)] hover:underline">
                <Wand2 className="h-3.5 w-3.5" /> Draft from call
              </button>
            </div>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="What happened, what they said, what's next" className={cn(inputClass, "h-auto py-2 leading-relaxed")} />
          </div>
          <div>
            <span className="text-[12px] font-medium text-d-mute">Next follow-up</span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {[...FOLLOW_UPS, ...(outcome === "Not interested" ? [{ label: "In 30 days", h: 720 }] : [])].map((f) => (
                <button key={f.label} type="button" onClick={() => setNextH(f.h)} className={cn("h-8 rounded-full border px-3 text-[12.5px] font-medium", nextH === f.h ? "border-d-accent bg-d-accent text-d-accent-ink" : "border-d-line hover:bg-d-sunk")}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <Field label="Move stage">
            <select value={nextStage} onChange={(e) => setNextStage(e.target.value as LeadStage)} className={inputClass}>
              {ALL_STAGES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <div className="flex items-center justify-between gap-3 border-t border-d-line pt-4">
            <p className="text-[12px] text-d-mute">
              {active?.stage !== nextStage ? (
                <>
                  {active?.stage} <ArrowRight className="inline h-3 w-3" /> <span className="font-semibold text-d-ink">{nextStage}</span> ·{" "}
                </>
              ) : null}
              then {autoDial ? "auto-dials" : "opens"} the next lead
            </p>
            <div className="flex gap-2">
              <Btn variant="ghost" onClick={() => setLogOpen(false)}>
                Cancel
              </Btn>
              <Btn variant="solid" icon={Check} onClick={saveOutcome}>
                Save &amp; next
              </Btn>
            </div>
          </div>
        </div>
      </Modal>

      {/* ---------------- WhatsApp drawer ---------------- */}
      <Sheet
        open={waOpen}
        onOpenChange={setWaOpen}
        eyebrow="WhatsApp · Business API"
        title={active ? `Message ${active.name}` : "Message"}
        sub={active ? `${active.phone} · ${active.company}` : undefined}
        width={500}
        footer={
          <>
            <span className="mr-auto text-[11.5px] text-d-mute">{waText.length} chars · sends from +91 80 4718 2200</span>
            <Btn variant="ghost" onClick={() => setWaOpen(false)}>
              Cancel
            </Btn>
            <Btn variant="solid" icon={Send} onClick={sendWa} disabled={!waText.trim()}>
              Send
            </Btn>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <SectionLabel>Template</SectionLabel>
            <Segmented size="sm" value={waT} onChange={(t) => redraft(t, waStyle)} options={WA_TEMPLATES.map((t) => ({ value: t.id, label: t.label }))} />
          </div>
          <div>
            <SectionLabel action={<AIMark label="Drafted" />}>Voice</SectionLabel>
            <Segmented size="sm" value={waStyle} onChange={(s) => redraft(waT, s)} options={["Standard", "Short", "Hinglish"] as const} />
          </div>
          <textarea value={waText} onChange={(e) => setWaText(e.target.value)} rows={9} className={cn(inputClass, "h-auto py-2.5 leading-relaxed")} />
          <div>
            <SectionLabel>Preview</SectionLabel>
            <div className="rounded-[14px] bg-[#e9e2d6] p-4" style={{ backgroundImage: "radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)", backgroundSize: "10px 10px" }}>
              <div className="ml-auto max-w-[88%] whitespace-pre-line rounded-[12px] rounded-tr-[4px] bg-[#dcf3d0] px-3 py-2 text-[13px] leading-relaxed text-[#1d1714] shadow-sm">
                {waText}
                <span className="mt-1 block text-right font-mono text-[10px] text-[#5d7a55]">now ✓✓</span>
              </div>
            </div>
          </div>
          {active && (
            <p className="flex items-start gap-2 text-[12px] text-d-mute">
              <Timer className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Sending pushes the follow-up to at least 24h and tags the lead. {active.name.split(" ")[0]} usually replies in the evening.
            </p>
          )}
          <p className="flex items-center gap-2 text-[12px] text-d-mute">
            <Users className="h-3.5 w-3.5" /> Owner: {active ? personById[active.owner]?.name : ""}
          </p>
        </div>
      </Sheet>
    </div>
  );
}

function guessStage(cur: LeadStage, o: Outcome): LeadStage {
  if (o === "Booked") return cur === "Proposal" ? "Proposal" : "Call booked";
  if (o === "Not interested") return "Lost";
  if (o === "Connected") return cur === "New" || cur === "Contacted" ? "Qualified" : cur;
  if (cur === "New") return "Contacted";
  return cur;
}
