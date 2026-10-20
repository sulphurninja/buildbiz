"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  Check,
  CheckCircle2,
  ExternalLink,
  FileText,
  GitPullRequest,
  Hammer,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  Radar,
  Send,
  Users,
  Wallet,
  X,
} from "lucide-react";
import {
  AgentNote,
  AgingBar,
  AIMark,
  Board,
  Btn,
  Checklist,
  Countdown,
  Feed,
  Field,
  Gantt,
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
  SectionLabel,
  Segmented,
  Sheet,
} from "../kit";
import type { GanttRow } from "../../desk/data";
import type { Tone } from "../../desk/types";
import { useHQ } from "../store";
import { clientBuilds, personById } from "../data";
import type { ClientBuild } from "../types";

/* ============================================================
   Timeline: day 0 = 1 Sep 2026, today = day 49 (20 Oct).
   ============================================================ */

const TODAY = 49;
const STAGES = ["Discovery", "Blueprint", "Build", "UAT", "Go-live", "Live"] as const;
type Stage = ClientBuild["stage"];
const stageIndex = (s: Stage) => STAGES.indexOf(s);
const STAGE_TONE: Record<Stage, Tone> = { Discovery: "neutral", Blueprint: "info", Build: "accent", UAT: "warn", "Go-live": "ok", Live: "ok" };
/** weekly hours a build needs from its lead, by stage */
const STAGE_HOURS: Record<Stage, number> = { Discovery: 6, Blueprint: 9, Build: 16, UAT: 12, "Go-live": 14, Live: 2 };
const CAPACITY: Record<string, number> = { neha: 44, vikram: 40 };
const HEALTH_TONE: Record<ClientBuild["health"], Tone> = { "On track": "ok", "At risk": "warn", Blocked: "late" };

function dayLabel(day: number) {
  const months = [
    { name: "Sep", start: 0, len: 30 },
    { name: "Oct", start: 30, len: 31 },
    { name: "Nov", start: 61, len: 30 },
    { name: "Dec", start: 91, len: 31 },
    { name: "Jan", start: 122, len: 31 },
  ];
  const m = [...months].reverse().find((x) => day >= x.start) ?? months[0];
  return `${day - m.start + 1} ${m.name}`;
}

type Contact = { name: string; role: string; phone: string; email: string; decides?: boolean };
type ChangeRequest = { id: string; title: string; by: string; hours: number; cost: number; status: "Open" | "Approved" | "Declined" };
type BuildRisk = { title: string; tone: Tone; owner: string; mitigation: string };
type Detail = {
  started: number;
  /** end day of Discovery, Blueprint, Build, UAT, Go-live */
  plan: [number, number, number, number, number];
  contacts: Contact[];
  changes: ChangeRequest[];
  risks: BuildRisk[];
  uat: string[];
  summary: string;
  slip?: { from: number; to: number; label: string };
};

const DETAIL: Record<string, Detail> = {
  "B-301": {
    started: 2,
    plan: [10, 22, 54, 59, 61],
    summary: "Style calendar and trims POs are in staging and the merchandisers use them daily. Line efficiency is waiting on the floor tablets (arrive Thursday). On course for 1 Nov.",
    contacts: [
      { name: "Hitesh Desai", role: "Owner", phone: "+91 98251 44017", email: "hitesh@kaveriweaves.in", decides: true },
      { name: "Komal Desai", role: "Merchandising head", phone: "+91 98795 20831", email: "komal@kaveriweaves.in" },
      { name: "Jayesh Patel", role: "Accounts", phone: "+91 99099 31275", email: "accounts@kaveriweaves.in" },
    ],
    changes: [
      { id: "CR-1", title: "Add buyer-wise shade approval tracker", by: "Komal Desai", hours: 14, cost: 28000, status: "Open" },
      { id: "CR-2", title: "Hindi labels on the floor tablet view", by: "Hitesh Desai", hours: 6, cost: 0, status: "Approved" },
    ],
    risks: [
      { title: "Floor tablets delivered late", tone: "warn", owner: "vikram", mitigation: "Line-efficiency screens tested on phones until Thursday" },
      { title: "Tally export has 2019 duplicate ledgers", tone: "info", owner: "vikram", mitigation: "Cleanup script runs before migration" },
    ],
    uat: ["Style order flows from buyer PO to TNA calendar", "Trims PO approval from owner's WhatsApp", "Line efficiency updates every 15 minutes", "Dues ageing matches Tally to the rupee", "Merchandiser role sees only own buyers"],
  },
  "B-302": {
    started: 0,
    plan: [4, 14, 42, 51, 53],
    summary: "UAT is 84% complete. 5 test cases are open, 2 of them on van-stock reconciliation. Cut-over is planned for Friday with Vikram and Neha on site.",
    contacts: [
      { name: "Ramesh Agarwal", role: "Owner", phone: "+91 98220 61540", email: "ramesh@balajidist.in", decides: true },
      { name: "Sanjay Kulkarni", role: "Operations head", phone: "+91 97644 18822", email: "ops@balajidist.in" },
      { name: "Rekha Bhatt", role: "Accounts", phone: "+91 90110 27459", email: "accounts@balajidist.in" },
    ],
    changes: [
      { id: "CR-1", title: "Scheme claim export for HUL", by: "Sanjay Kulkarni", hours: 10, cost: 18000, status: "Approved" },
      { id: "CR-2", title: "Salesman leaderboard on the TV in godown", by: "Ramesh Agarwal", hours: 5, cost: 0, status: "Open" },
    ],
    risks: [
      { title: "Van stock mismatch on 2 of 11 vans", tone: "warn", owner: "neha", mitigation: "Re-count on Wednesday evening before cut-over" },
      { title: "Salesmen not yet trained on the beat app", tone: "warn", owner: "priya", mitigation: "Priya runs a 40-minute session Thursday 8 AM" },
    ],
    uat: ["Beat plan loads for all 23 salesmen", "Van stock closes to zero variance", "Collections post to the right outlet ledger", "Owner morning brief at 8 AM", "Offline mode works on Jio 4G", "Scheme claim export matches HUL format"],
  },
  "B-303": {
    started: 0,
    plan: [6, 14, 30, 36, 38],
    summary: "Live since 9 Oct. Recall reminders brought back 41 patients in 11 days. In hypercare until 9 Nov, then moves to the support retainer.",
    contacts: [
      { name: "Dr. Swati Kulkarni", role: "Owner, chief dentist", phone: "+91 98230 77412", email: "swati@caredental.in", decides: true },
      { name: "Pooja Menon", role: "Front desk lead", phone: "+91 90960 14728", email: "frontdesk@caredental.in" },
    ],
    changes: [{ id: "CR-1", title: "Lab work tracker for crowns", by: "Dr. Swati Kulkarni", hours: 12, cost: 24000, status: "Open" }],
    risks: [{ title: "Front desk still double-entering in the old register", tone: "info", owner: "priya", mitigation: "Old register retired from 25 Oct" }],
    uat: ["Chair map reflects walk-ins within a minute", "Recall reminders go at 10 AM", "Billing matches the day's cash and UPI", "Doctor view hides revenue"],
  },
  "B-304": {
    started: 36,
    plan: [44, 52, 72, 78, 80],
    slip: { from: 52, to: 56, label: "+4d" },
    summary: "Blueprint was sent on 8 Oct and is still unsigned. Gurpreet is at a trade fair in Stuttgart until Thursday. Milestone 2 (₹1.56 L) is tied to the sign-off.",
    contacts: [
      { name: "Gurpreet Singh Gill", role: "Managing director", phone: "+91 98140 22659", email: "gurpreet@precisionauto.in", decides: true },
      { name: "Alok Saxena", role: "Export manager", phone: "+91 98722 40391", email: "exports@precisionauto.in" },
      { name: "Neelam Gill", role: "Finance", phone: "+91 98157 66120", email: "finance@precisionauto.in" },
    ],
    changes: [{ id: "CR-1", title: "German buyer portal integration", by: "Alok Saxena", hours: 40, cost: 95000, status: "Open" }],
    risks: [
      { title: "Blueprint sign-off 12 days late", tone: "late", owner: "neha", mitigation: "Video walk-through for Gurpreet from Stuttgart" },
      { title: "PPAP documents live in personal email", tone: "warn", owner: "vikram", mitigation: "Shared drive migration in week 1 of build" },
    ],
    uat: ["OEM part number search under 1 second", "Export lot packing list prints", "PPAP status per customer", "Buyer RFQ inbox"],
  },
  "B-305": {
    started: 44,
    plan: [52, 62, 84, 90, 93],
    summary: "Discovery calls done with the owner and the showroom manager. Tray-by-tray gram counts captured from 3 counters. Blueprint draft due 1 Nov.",
    contacts: [
      { name: "Prakash Menon", role: "Owner", phone: "+91 94470 33815", email: "prakash@shubhjewellers.in", decides: true },
      { name: "Divya Menon", role: "Showroom manager", phone: "+91 94461 70254", email: "store@shubhjewellers.in" },
    ],
    changes: [],
    risks: [{ title: "Karigar data is only on paper", tone: "info", owner: "vikram", mitigation: "Photograph 6 months of order books this week" }],
    uat: ["Tray tally balances to the gram", "Scheme instalments reminder", "Karigar order due dates", "Gold rate updates at 10 AM"],
  },
  "B-306": {
    started: 18,
    plan: [24, 33, 58, 63, 65],
    slip: { from: 65, to: 71, label: "+6d" },
    summary: "Kitchen pass and wastage modules are done. Aggregators is stuck: Swiggy partner API keys requested on 9 Oct have not arrived. Zomato integration is complete.",
    contacts: [
      { name: "Farhan Qureshi", role: "Founder", phone: "+91 98490 51127", email: "farhan@spiceroute.in", decides: true },
      { name: "Lata Reddy", role: "Operations manager", phone: "+91 99630 48210", email: "ops@spiceroute.in" },
      { name: "Kiran Naidu", role: "Swiggy account manager", phone: "+91 80 6746 0000", email: "kiran.n@swiggy.in" },
    ],
    changes: [
      { id: "CR-1", title: "Third outlet (Gachibowli) added to scope", by: "Farhan Qureshi", hours: 18, cost: 36000, status: "Approved" },
      { id: "CR-2", title: "Daily food-cost email to chefs", by: "Lata Reddy", hours: 4, cost: 0, status: "Open" },
    ],
    risks: [
      { title: "Swiggy API keys not issued", tone: "late", owner: "neha", mitigation: "Farhan to escalate with Swiggy account manager" },
      { title: "Third outlet adds 18 build hours", tone: "warn", owner: "vikram", mitigation: "Covered by approved CR-1" },
    ],
    uat: ["KOTs land on the kitchen rail in under 5 s", "Swiggy orders sync with prep time", "Zomato orders sync with prep time", "Wastage entries by chef", "Outlet P&L each night"],
  },
  "B-307": {
    started: 5,
    plan: [11, 20, 40, 47, 50],
    summary: "Go-live tomorrow 9 AM. 2 of 14 cold-chain loggers are offline at the Dewas godown; Vikram is replacing the SIMs tonight. Fully paid.",
    contacts: [
      { name: "Sanjay Jain", role: "Owner", phone: "+91 98260 18734", email: "sanjay@apollopharma.in", decides: true },
      { name: "Meenakshi Rathi", role: "Purchase head", phone: "+91 99260 43381", email: "purchase@apollopharma.in" },
    ],
    changes: [{ id: "CR-1", title: "Chemist credit limit approvals on WhatsApp", by: "Sanjay Jain", hours: 8, cost: 0, status: "Approved" }],
    risks: [{ title: "2 cold-chain loggers offline", tone: "warn", owner: "vikram", mitigation: "SIM swap tonight, test at 7 AM" }],
    uat: ["Expiry radar flags 90-day batches", "Chemist credit blocks over-limit orders", "Cold-chain alert within 2 minutes", "Scheme claims reconcile", "Purchase head approvals on mobile"],
  },
  "B-308": {
    started: 38,
    plan: [44, 54, 68, 74, 76],
    summary: "Blueprint review is on Thursday. Milestone 2 (₹78k) is 6 days overdue; the accountant asked for a GST invoice in the company's new name.",
    contacts: [
      { name: "Vivek Malhotra", role: "Owner", phone: "+91 98111 52046", email: "vivek@skylinerealty.in", decides: true },
      { name: "Bhavna Khanna", role: "Sales head", phone: "+91 98731 09946", email: "sales@skylinerealty.in" },
      { name: "Tarun Goyal", role: "Accountant", phone: "+91 98999 40217", email: "accounts@skylinerealty.in" },
    ],
    changes: [{ id: "CR-1", title: "RERA document vault per project", by: "Vivek Malhotra", hours: 12, cost: 22000, status: "Open" }],
    risks: [{ title: "Milestone 2 overdue 6 days", tone: "warn", owner: "sahil", mitigation: "Re-issue invoice in new company name" }],
    uat: ["Buyer matched to inventory on the corridor map", "Site visit booking with cab", "Commission split per broker", "Token money receipt"],
  },
};

/* ---------------- risk radar ---------------- */

type RadarItem = {
  id: string;
  build: string;
  tone: Tone;
  title: string;
  signals: string[];
  draft: { channel: "Email" | "WhatsApp" | "Task"; to: string; subject: string; body: string };
  status: "open" | "sent" | "dismissed";
};

const RADAR: RadarItem[] = [
  {
    id: "R1",
    build: "B-306",
    tone: "late",
    title: "Spice Route is blocked on Swiggy API keys",
    signals: ["Keys requested 9 Oct, nothing in 11 days", "Aggregators module idle for 3 days", "5 Nov go-live slips ~6 days if keys miss Friday"],
    draft: {
      channel: "Email",
      to: "Farhan Qureshi <farhan@spiceroute.in>",
      subject: "Swiggy API keys needed to hold the 5 Nov go-live",
      body: "Hi Farhan,\n\nQuick update on your command center. Kitchen pass, wastage and the Zomato sync are done and tested. The one thing holding us is the Swiggy partner API keys we requested on 9 Oct.\n\nCould you ask Kiran Naidu (your Swiggy account manager) to issue the keys for all three outlets? If they reach us by Friday, we hold the 5 Nov go-live. If not, we will move go-live to 11 Nov.\n\nI've attached the one-line request Swiggy needs from you.\n\nThanks,\nNeha Gupta\nHead of Delivery, BuildBiz AI",
    },
    status: "open",
  },
  {
    id: "R2",
    build: "B-304",
    tone: "warn",
    title: "Precision Auto Parts blueprint still unsigned",
    signals: ["Sent 8 Oct, 2 reminders unread", "Gurpreet in Stuttgart until Thursday", "₹1.56 L milestone tied to sign-off"],
    draft: {
      channel: "WhatsApp",
      to: "Gurpreet Singh Gill · +91 98140 22659",
      subject: "Blueprint sign-off",
      body: "Sat sri akal Gurpreet ji. Hope the fair is going well. I've made a 6-minute video walking through your blueprint (part match, export lots, PPAP) so you can review it on your phone. One tap to approve here. If you sign off by Friday we start the build on Monday and keep the 19 Nov go-live. – Neha, BuildBiz",
    },
    status: "open",
  },
  {
    id: "R3",
    build: "B-302",
    tone: "warn",
    title: "Balaji has 5 open UAT cases, 4 days to go-live",
    signals: ["2 cases on van-stock reconciliation", "Salesman training not scheduled", "Cut-over Friday with Vikram on site"],
    draft: {
      channel: "Email",
      to: "Sanjay Kulkarni <ops@balajidist.in>",
      subject: "Friday cut-over: 30-minute walk-through Thursday 4 PM",
      body: "Hi Sanjay,\n\nWe're on track for Friday. Five UAT items are still open, two of them on van stock for vans MH-31 4417 and MH-31 9022. Can your team re-count those two vans on Wednesday evening?\n\nPriya will train the salesmen on the beat app Thursday 8 AM at the godown, and we'd like 30 minutes with you at 4 PM the same day to walk through the cut-over plan.\n\nRegards,\nNeha",
    },
    status: "open",
  },
  {
    id: "R4",
    build: "B-308",
    tone: "warn",
    title: "Skyline Realty milestone 2 overdue 6 days",
    signals: ["₹78,000 due since 14 Oct", "Accountant asked for invoice in new company name", "Blueprint review Thursday"],
    draft: {
      channel: "Email",
      to: "Tarun Goyal <accounts@skylinerealty.in>",
      subject: "Revised invoice BB/DFY/308-02 for ₹78,000",
      body: "Dear Tarun ji,\n\nAs requested, the attached invoice is re-issued to Skyline Realty Developers LLP with the new GSTIN. Amount ₹78,000 plus GST, against blueprint milestone 2.\n\nWe'd be grateful if this could be released before Thursday's blueprint review.\n\nRegards,\nSahil Verma\nFinance, BuildBiz AI",
    },
    status: "open",
  },
  {
    id: "R5",
    build: "B-307",
    tone: "info",
    title: "Apollo: 2 cold-chain loggers offline before go-live",
    signals: ["Dewas godown loggers 7 and 11", "Go-live tomorrow 9 AM", "SIM swap needed"],
    draft: {
      channel: "Task",
      to: "Vikram Rao",
      subject: "Swap SIMs on Dewas loggers 7 and 11, test by 7 AM",
      body: "Replace the Airtel SIMs on loggers 7 and 11 with the Jio spares, confirm both report temperatures to the expiry radar, and post a screenshot in #apollo-golive before 7 AM.",
    },
    status: "open",
  },
];

/* ---------------- helpers ---------------- */

function milestones(b: ClientBuild) {
  const parts = [
    { name: "Kickoff", pct: 0.3, gate: 0 },
    { name: "Blueprint sign-off", pct: 0.3, gate: 1 },
    { name: "UAT sign-off", pct: 0.3, gate: 3 },
    { name: "Go-live", pct: 0.1, gate: 4 },
  ];
  let left = b.paid;
  const si = stageIndex(b.stage);
  return parts.map((p) => {
    const value = Math.round(b.value * p.pct);
    const paid = Math.min(value, left);
    left -= paid;
    const status: "Paid" | "Part paid" | "Due" | "Upcoming" = paid >= value ? "Paid" : paid > 0 ? "Part paid" : si >= p.gate ? "Due" : "Upcoming";
    return { ...p, value, paid, status };
  });
}

function moduleStates(b: ClientBuild) {
  const n = b.modules.length;
  return b.modules.map((name, i) => {
    const pct = Math.max(0, Math.min(100, Math.round(((b.progress / 100) * n - i) * 100)));
    return { name, pct, state: pct >= 100 ? "Done" : pct > 0 ? "In build" : "Not started" };
  });
}

function hoursFor(list: ClientBuild[], who: string, advance = false) {
  return list
    .filter((b) => b.lead === who)
    .reduce((sum, b) => {
      const si = stageIndex(b.stage);
      const stage = advance && b.goLiveIn <= 7 && si < 5 ? STAGES[Math.min(5, si + 1)] : b.stage;
      return sum + STAGE_HOURS[stage];
    }, 0);
}

/* ============================================================ */

export default function ClientBuilds() {
  const hq = useHQ();
  const [builds, setBuilds] = React.useState<ClientBuild[]>(clientBuilds);
  const [radar, setRadar] = React.useState<RadarItem[]>(RADAR);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [draftId, setDraftId] = React.useState<string | null>(null);
  const [digest, setDigest] = React.useState(false);
  const [scanning, setScanning] = React.useState(false);
  const [lens, setLens] = React.useState<"all" | "attention">("all");

  React.useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("open");
    if (!id) return;
    const t = window.setTimeout(() => setOpenId(id), 0);
    return () => window.clearTimeout(t);
  }, []);

  const open = builds.find((b) => b.id === openId) ?? null;
  const draft = radar.find((r) => r.id === draftId) ?? null;

  const total = builds.reduce((a, b) => a + b.value, 0);
  const paid = builds.reduce((a, b) => a + b.paid, 0);
  const goingLive = builds.filter((b) => b.stage !== "Live" && b.goLiveIn <= 7).length;
  const attention = builds.filter((b) => b.health !== "On track").length;
  const inFlight = builds.filter((b) => b.stage !== "Live");
  const avgProgress = Math.round(inFlight.reduce((a, b) => a + b.progress, 0) / Math.max(1, inFlight.length));
  const shown = lens === "all" ? builds : builds.filter((b) => b.health !== "On track" || (b.goLiveIn <= 7 && b.stage !== "Live"));

  function advance(id: string) {
    const b = builds.find((x) => x.id === id);
    if (!b) return;
    const si = stageIndex(b.stage);
    if (si >= 5) return;
    moveTo(id, STAGES[si + 1]);
  }

  function moveTo(id: string, stage: Stage) {
    const b = builds.find((x) => x.id === id);
    if (!b || b.stage === stage) return;
    setBuilds((cur) =>
      cur.map((x) =>
        x.id === id
          ? { ...x, stage, progress: stage === "Live" ? 100 : Math.max(x.progress, [10, 25, 50, 82, 95, 100][stageIndex(stage)]), goLiveIn: stage === "Live" ? 0 : x.goLiveIn, health: stage === "Live" ? "On track" : x.health }
          : x,
      ),
    );
    hq.log(`moved ${b.client.split(",")[0]} to ${stage}`, stage === "Live" ? "ok" : "info");
    toast.success(`${b.client.split(",")[0]} moved to ${stage}`, { description: stage === "Live" ? "Client notified. Hypercare starts today." : "Client contacts get the stage update on WhatsApp." });
  }

  function reassign(id: string, lead: string) {
    setBuilds((cur) => cur.map((x) => (x.id === id ? { ...x, lead } : x)));
  }

  function sendDraft(item: RadarItem, body: string) {
    setRadar((cur) => cur.map((r) => (r.id === item.id ? { ...r, status: "sent", draft: { ...r.draft, body } } : r)));
    const b = builds.find((x) => x.id === item.build);
    if (item.draft.channel === "Task") {
      hq.addTask({ title: item.draft.subject, owner: "vikram", status: "Todo", priority: "P0", due: "Today", dueIn: 0, area: "Delivery", linked: item.build, aiDrafted: true });
      toast.success("Task created for Vikram", { description: item.draft.subject });
    } else {
      hq.notify({ kind: "agent", title: `${item.draft.channel} sent to ${item.draft.to.split(/[<·]/)[0].trim()}`, body: item.draft.subject, href: "/hq/builds" });
    }
    hq.log(`sent the risk-radar ${item.draft.channel.toLowerCase()} for ${b?.client.split(",")[0] ?? item.build}`, "accent");
    setDraftId(null);
  }

  function rescan() {
    setScanning(true);
    window.setTimeout(() => {
      setScanning(false);
      toast("Risk radar refreshed", { description: "Read 8 build channels, 214 commits, 31 client emails and the payment ledger. No new risks." });
    }, 1400);
  }

  const openRadar = radar.filter((r) => r.status === "open");

  return (
    <div>
      <PageHeader
        kicker="Delivery"
        icon={Hammer}
        title="Client Builds"
        sub="Every done-for-you command center we are delivering, from discovery call to hypercare. Delivery agents watch build channels, commits, client email and the payment ledger."
        actions={
          <>
            <Btn icon={MessageCircle} onClick={() => hq.openAsk("Which client builds are at risk this week and why?")}>
              Ask about builds
            </Btn>
            <Btn variant="solid" icon={FileText} onClick={() => setDigest(true)}>
              Weekly client updates
            </Btn>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Metric label="Portfolio value" value={rupees(total)} hint={`${builds.length} builds · 3 in proposal`} />
        <Metric label="Collected" value={rupees(paid)} delta={`${Math.round((paid / total) * 100)}%`} good hint={`${rupees(total - paid)} still to bill`} />
        <Metric label="Going live ≤ 7 days" value={goingLive} hint="Apollo tomorrow · Balaji Friday" />
        <Metric label="Needs attention" value={attention} delta={attention ? `${attention} flagged` : undefined} good={false} hint="1 blocked · 1 at risk" onClick={() => setLens(lens === "attention" ? "all" : "attention")} />
        <Metric label="Avg progress in flight" value={`${avgProgress}%`} delta="+9 pts" hint="vs last Monday" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title={
            <span className="inline-flex items-center gap-2">
              Risk radar <AIMark label="Delivery agent" />
            </span>
          }
          sub={`${openRadar.length} open · drafted from build channels, client email and the ledger`}
          icon={Radar}
          action={
            <Btn size="sm" icon={Radar} onClick={rescan} disabled={scanning}>
              {scanning ? "Scanning…" : "Rescan"}
            </Btn>
          }
        >
          <ul className="space-y-2.5">
            {radar.map((r) => {
              const b = builds.find((x) => x.id === r.build);
              return (
                <li
                  key={r.id}
                  className="desk-rise rounded-[12px] border border-d-line bg-d-panel p-3.5 transition-opacity data-[done=true]:opacity-55"
                  data-done={r.status !== "open"}
                >
                  <div className="flex flex-wrap items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: `var(--d-${r.tone === "neutral" ? "mute" : r.tone})` }} />
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-[14px] font-semibold leading-snug">
                        {r.title}
                        <button type="button" onClick={() => setOpenId(r.build)} className="font-mono text-[11px] font-medium text-d-mute hover:text-d-accent">
                          {r.build}
                        </button>
                      </p>
                      <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[12px] text-d-mute">
                        {r.signals.map((s) => (
                          <span key={s} className="inline-flex items-center gap-1">
                            <span className="h-1 w-1 rounded-full bg-d-mute/60" />
                            {s}
                          </span>
                        ))}
                      </p>
                      <p className="mt-2 text-[12.5px]">
                        <span className="font-medium text-[color-mix(in_oklab,var(--d-gold)_75%,black)]">Drafted {r.draft.channel === "Task" ? "a task" : `a ${r.draft.channel === "Email" ? "client email" : "WhatsApp"}`}</span>
                        <span className="text-d-mute"> → {r.draft.to} · “{r.draft.subject}”</span>
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {r.status === "open" ? (
                        <>
                          <Btn size="sm" variant="ghost" icon={X} onClick={() => setRadar((cur) => cur.map((x) => (x.id === r.id ? { ...x, status: "dismissed" } : x)))} aria-label="Dismiss" />
                          <Btn size="sm" variant="solid" icon={r.draft.channel === "Task" ? Plus : Send} onClick={() => setDraftId(r.id)}>
                            {r.draft.channel === "Task" ? "Create task" : "Review & send"}
                          </Btn>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          <Pill tone={r.status === "sent" ? "ok" : "neutral"}>{r.status === "sent" ? (r.draft.channel === "Task" ? "Task created" : "Sent just now") : "Dismissed"}</Pill>
                          <button type="button" onClick={() => setRadar((cur) => cur.map((x) => (x.id === r.id ? { ...x, status: "open" } : x)))} className="text-[11.5px] text-d-mute hover:text-d-ink">
                            Undo
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                  {b && r.status === "open" && (
                    <div className="mt-2.5 flex items-center gap-3 pl-[22px] text-[11.5px] text-d-mute">
                      <PersonAvatar id={b.lead} size={18} />
                      <span>{personById[b.lead]?.first} leads</span>
                      <span>·</span>
                      <span>{b.stage}</span>
                      <span>·</span>
                      <span>{b.stage === "Live" ? "live" : `go-live ${dayLabel(TODAY + b.goLiveIn)}`}</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel title="Go-live clock" sub="Health and time to cut-over" icon={CalendarClock}>
          <ul className="divide-y divide-d-line">
            {[...builds]
              .filter((b) => b.stage !== "Live")
              .sort((a, b) => a.goLiveIn - b.goLiveIn)
              .map((b) => (
                <li key={b.id}>
                  <button type="button" onClick={() => setOpenId(b.id)} className="flex w-full items-center gap-3 py-2.5 text-left hover:bg-d-sunk/50">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-medium">{b.client.split(",")[0]}</span>
                      <span className="mt-0.5 flex items-center gap-2 text-[11.5px] text-d-mute">
                        <Pill tone={HEALTH_TONE[b.health]}>{b.health}</Pill>
                        {b.stage} · {dayLabel(TODAY + b.goLiveIn)}
                      </span>
                    </span>
                    <span className={`text-right text-[12.5px] ${b.goLiveIn <= 4 ? "font-semibold text-d-ink" : "text-d-mute"}`}>
                      {b.goLiveIn <= 4 ? <Countdown inHours={b.goLiveIn * 24 - 11} compact /> : <span className="tnum font-mono">{b.goLiveIn}d</span>}
                    </span>
                  </button>
                </li>
              ))}
          </ul>
          <div className="mt-3 flex items-center justify-between rounded-[10px] bg-d-sunk/70 px-3 py-2 text-[12px]">
            <span className="text-d-mute">Live and in hypercare</span>
            <span className="font-medium">{builds.filter((b) => b.stage === "Live").map((b) => b.client.split(",")[0]).join(", ") || "None"}</span>
          </div>
        </Panel>
      </div>

      <Panel
        className="mt-5"
        title="Stage pipeline"
        sub="Drag a card to move the build. Clients get the stage update automatically."
        action={
          <Segmented
            size="sm"
            value={lens}
            onChange={setLens}
            options={[
              { value: "all", label: "All builds", count: builds.length },
              { value: "attention", label: "Needs attention", count: builds.filter((b) => b.health !== "On track" || (b.goLiveIn <= 7 && b.stage !== "Live")).length },
            ]}
          />
        }
      >
        <Board
          columns={STAGES.map((s) => ({ id: s, label: s, tone: STAGE_TONE[s], hint: `${STAGE_HOURS[s]}h/wk from the lead` }))}
          items={shown}
          itemKey={(b) => b.id}
          getColumn={(b) => b.stage}
          onMove={(key, col) => moveTo(key, col as Stage)}
          minColumnWidth={172}
          renderCard={(b) => (
            <button type="button" onClick={() => setOpenId(b.id)} className="block w-full text-left">
              <p className="pr-3 text-[13px] font-semibold leading-snug">{b.client.split(",")[0]}</p>
              <p className="mt-0.5 truncate text-[11.5px] text-d-mute">
                {b.client.split(",")[1]?.trim()} · {rupees(b.value)}
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <Meter value={b.progress} tone={b.health === "Blocked" ? "late" : b.health === "At risk" ? "warn" : "accent"} height={5} />
                <span className="tnum font-mono text-[11px] text-d-mute">{b.progress}%</span>
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <PersonAvatar id={b.lead} size={20} />
                {b.health !== "On track" ? <Pill tone={HEALTH_TONE[b.health]}>{b.health}</Pill> : <span className="font-mono text-[11px] text-d-mute">{b.stage === "Live" ? "live" : `${b.goLiveIn}d`}</span>}
              </div>
            </button>
          )}
        />
      </Panel>

      <Panel className="mt-5" title="Build timelines" sub="Phase by phase against the go-live date. Red is late; the shaded tail is the slip if nothing changes." icon={CalendarClock}>
        <Gantt
          days={122}
          labelWidth={250}
          ticks={[
            { at: 0, label: "Sep" },
            { at: 30, label: "Oct" },
            { at: 61, label: "Nov" },
            { at: 91, label: "Dec" },
          ]}
          today={{ at: TODAY, label: "Today 20 Oct" }}
          markers={[
            { at: 62, label: "Diwali freeze", tone: "warn" },
            { at: 72, label: "Batch 15", tone: "info" },
          ]}
          onRow={(row) => setOpenId(row.id)}
          rows={builds.map<GanttRow>((b) => {
            const d = DETAIL[b.id];
            const si = stageIndex(b.stage);
            const late = b.health === "Blocked" || b.health === "At risk";
            return {
              id: b.id,
              title: b.client.split(",")[0],
              sub: `${personById[b.lead]?.first} · ${b.stage}`,
              points: [
                { at: d.started + 2, state: "done" as const, label: "Kickoff" },
                ...d.plan.map((at, i) => ({
                  at,
                  state: (i < si ? "done" : i === si && late ? "late" : "open") as "done" | "late" | "open",
                  label: `${STAGES[i]} · ends ${dayLabel(at)}`,
                })),
              ],
              flag: d.plan[4],
              slip: b.stage !== "Live" ? d.slip : undefined,
              badge: b.health === "Blocked" ? { at: Math.min(TODAY + 8, 110), label: "Blocked · Swiggy keys", tone: "late" } : undefined,
            };
          })}
        />
      </Panel>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <Capacity builds={builds} onReassign={reassign} onOpen={setOpenId} />
        <Panel title="Milestone billing" sub="Across all builds" icon={Wallet}>
          <Billing builds={builds} />
        </Panel>
      </div>

      <BuildSheet build={open} onClose={() => setOpenId(null)} onAdvance={advance} />

      <Modal open={!!draft} onOpenChange={(v) => !v && setDraftId(null)} title={draft ? (draft.draft.channel === "Task" ? "Create task" : `Send ${draft.draft.channel.toLowerCase()}`) : ""} sub={draft?.title} width={620}>
        {draft && <DraftEditor key={draft.id} item={draft} onSend={sendDraft} onCancel={() => setDraftId(null)} />}
      </Modal>

      <Modal open={digest} onOpenChange={setDigest} title="Weekly client updates" sub="One status note per client, drafted from this week's build activity" width={680}>
        <Digest builds={builds} onDone={() => setDigest(false)} />
      </Modal>
    </div>
  );
}

/* ---------------- draft editor ---------------- */

function DraftEditor({ item, onSend, onCancel }: { item: RadarItem; onSend: (item: RadarItem, body: string) => void; onCancel: () => void }) {
  const [body, setBody] = React.useState(item.draft.body);
  const [tone, setTone] = React.useState<"As drafted" | "Shorter" | "Firmer">("As drafted");
  function retone(t: typeof tone) {
    setTone(t);
    if (t === "As drafted") setBody(item.draft.body);
    if (t === "Shorter") setBody(item.draft.body.split("\n\n").filter((_, i, arr) => i === 0 || i === 1 || i === arr.length - 1).join("\n\n"));
    if (t === "Firmer") setBody(item.draft.body.replace(/Could you ask/g, "Please ask").replace(/We'd be grateful if this could be released/g, "Please release this").replace(/Can your team/g, "Please have your team"));
  }
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="To">
          <input className={inputClass} defaultValue={item.draft.to} />
        </Field>
        <Field label={item.draft.channel === "Task" ? "Title" : "Subject"}>
          <input className={inputClass} defaultValue={item.draft.subject} />
        </Field>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-[12px] font-medium text-d-mute">
            Message <AIMark label="Drafted" />
          </span>
          <Segmented size="sm" value={tone} onChange={retone} options={["As drafted", "Shorter", "Firmer"] as const} />
        </div>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={11} className={`${inputClass} h-auto py-2.5 font-[inherit] leading-relaxed`} />
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11.5px] text-d-mute">{item.draft.channel === "WhatsApp" ? "Sends from the delivery WhatsApp number" : item.draft.channel === "Email" ? "Sends from neha@buildbiz.ai, CC the build channel" : "Lands in Task Manager as P0, due today"}</span>
        <div className="flex gap-2">
          <Btn onClick={onCancel}>Cancel</Btn>
          <Btn variant="solid" icon={item.draft.channel === "Task" ? Plus : Send} onClick={() => onSend(item, body)}>
            {item.draft.channel === "Task" ? "Create task" : "Send now"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ---------------- weekly digest ---------------- */

function Digest({ builds, onDone }: { builds: ClientBuild[]; onDone: () => void }) {
  const hq = useHQ();
  const list = builds.filter((b) => b.stage !== "Live" || b.id === "B-303");
  const [picked, setPicked] = React.useState<Set<string>>(() => new Set(list.map((b) => b.id)));
  function line(b: ClientBuild) {
    const d = DETAIL[b.id];
    const ms = moduleStates(b);
    const done = ms.filter((m) => m.state === "Done").map((m) => m.name);
    const next = ms.find((m) => m.state !== "Done");
    if (b.stage === "Live") return `${d.summary.split(".")[0]}. Hypercare continues; reply here for anything you need changed.`;
    return `This week: ${done.length ? `${done.join(" and ")} ${done.length > 1 ? "are" : "is"} complete` : `${b.stage.toLowerCase()} work is under way`}${next ? `, ${next.name.toLowerCase()} is next` : ""}. ${b.health === "On track" ? `Go-live stays on ${dayLabel(TODAY + b.goLiveIn)}.` : `Go-live on ${dayLabel(TODAY + b.goLiveIn)} needs one thing from you: ${d.risks[0]?.mitigation.toLowerCase()}.`}`;
  }
  return (
    <div>
      <ul className="desk-scroll max-h-[52vh] space-y-2 overflow-y-auto pr-1">
        {list.map((b) => {
          const on = picked.has(b.id);
          const c = DETAIL[b.id].contacts.find((x) => x.decides);
          return (
            <li key={b.id} className="rounded-[12px] border border-d-line p-3">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() =>
                    setPicked((cur) => {
                      const next = new Set(cur);
                      if (next.has(b.id)) next.delete(b.id);
                      else next.add(b.id);
                      return next;
                    })
                  }
                  className="mt-1 h-4 w-4 accent-[var(--d-accent)]"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2 text-[13.5px] font-semibold">
                    {b.client.split(",")[0]}
                    <span className="text-[12px] font-normal text-d-mute">to {c?.name}</span>
                    <Pill tone={HEALTH_TONE[b.health]}>{b.health}</Pill>
                  </span>
                  <span className="mt-1 block text-[13px] leading-relaxed text-d-ink/85">{line(b)}</span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-[12px] text-d-mute">
          <AIMark label="Drafted from 214 commits and 31 emails" />
        </span>
        <Btn
          variant="solid"
          icon={Send}
          disabled={picked.size === 0}
          onClick={() => {
            hq.notify({ kind: "agent", title: `Weekly updates sent to ${picked.size} clients`, body: "WhatsApp to each decision maker, with the email copy to the build channel.", href: "/hq/builds" });
            hq.log(`sent weekly status updates to ${picked.size} build clients`, "accent");
            onDone();
          }}
        >
          Send {picked.size} updates
        </Btn>
      </div>
    </div>
  );
}

/* ---------------- capacity ---------------- */

function Capacity({ builds, onReassign, onOpen }: { builds: ClientBuild[]; onReassign: (id: string, lead: string) => void; onOpen: (id: string) => void }) {
  const hq = useHQ();
  const [applied, setApplied] = React.useState(false);
  const people = ["neha", "vikram"];
  const rows = people.map((id) => {
    const now = hoursFor(builds, id);
    const next = hoursFor(builds, id, true);
    return { id, now, next, cap: CAPACITY[id], list: builds.filter((b) => b.lead === id) };
  });
  const neha = rows[0];
  return (
    <Panel className="xl:col-span-2" title="Delivery capacity" sub="Weekly hours each lead owes their builds, this week and next" icon={Users}>
      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((r) => {
          const pct = Math.round((r.now / r.cap) * 100);
          const nextPct = Math.round((r.next / r.cap) * 100);
          const tone: Tone = nextPct > 105 || pct > 105 ? "late" : pct > 90 ? "warn" : "ok";
          return (
            <div key={r.id} className="rounded-[12px] border border-d-line p-4">
              <div className="flex items-center justify-between">
                <PersonChip id={r.id} sub={personById[r.id]?.title} />
                <span className="tnum font-serif text-[26px] leading-none">
                  {pct}
                  <span className="text-[14px] text-d-mute">%</span>
                </span>
              </div>
              <div className="mt-3 space-y-2">
                <div>
                  <div className="mb-1 flex justify-between text-[11.5px] text-d-mute">
                    <span>This week</span>
                    <span className="tnum font-mono">
                      {r.now}h / {r.cap}h
                    </span>
                  </div>
                  <Meter value={r.now} max={r.cap} tone={pct > 105 ? "late" : pct > 90 ? "warn" : "ok"} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-[11.5px] text-d-mute">
                    <span>Next week (after go-lives)</span>
                    <span className="tnum font-mono">
                      {r.next}h · {nextPct}%
                    </span>
                  </div>
                  <Meter value={r.next} max={r.cap} tone={tone} />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {r.list.map((b) => (
                  <button key={b.id} type="button" onClick={() => onOpen(b.id)} className="rounded-full border border-d-line px-2 py-0.5 text-[11.5px] hover:border-d-accent">
                    {b.client.split(" ")[0]} <span className="text-d-mute">· {STAGE_HOURS[b.stage]}h</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <AgentNote
        className="mt-4"
        title={applied ? "Skyline Realty moved to Vikram" : `Neha is booked ${neha.now}h against ${neha.cap}h, with Balaji's cut-over on Friday`}
        action={
          applied ? (
            <Btn
              size="sm"
              onClick={() => {
                onReassign("B-308", "neha");
                setApplied(false);
              }}
            >
              Undo
            </Btn>
          ) : (
            <>
              <Btn
                size="sm"
                variant="solid"
                icon={Check}
                onClick={() => {
                  onReassign("B-308", "vikram");
                  setApplied(true);
                  hq.log("reassigned Skyline Realty blueprint to Vikram", "info");
                  hq.notify({ kind: "task", title: "Skyline Realty is now Vikram's build", body: "Blueprint review Thursday 3 PM is on his calendar.", href: "/hq/builds" });
                }}
              >
                Move Skyline to Vikram
              </Btn>
              <Btn size="sm" onClick={() => hq.openAsk("Rebalance delivery capacity across Neha and Vikram for the next two weeks")}>
                Other options
              </Btn>
            </>
          )
        }
      >
        {applied
          ? "Neha keeps Balaji, Spice Route and Precision. Vikram takes the Thursday blueprint review once Apollo is live tomorrow; both leads stay under 100% next week."
          : "Vikram frees up 12 hours a week once Apollo Pharma goes live tomorrow. Moving the Skyline Realty blueprint review (Thursday) to him keeps Neha on the Balaji cut-over and the Spice Route escalation."}
      </AgentNote>
    </Panel>
  );
}

function Billing({ builds }: { builds: ClientBuild[] }) {
  const all = builds.flatMap((b) => milestones(b).map((m) => ({ ...m, build: b })));
  const paid = all.reduce((a, m) => a + m.paid, 0);
  const due = all.filter((m) => m.status === "Due" || m.status === "Part paid").reduce((a, m) => a + (m.value - m.paid), 0);
  const upcoming = all.filter((m) => m.status === "Upcoming").reduce((a, m) => a + m.value, 0);
  const dueList = all.filter((m) => m.status === "Due" || m.status === "Part paid");
  return (
    <div>
      <AgingBar
        format={rupees}
        buckets={[
          { label: "Collected", value: paid, tone: "ok" },
          { label: "Due now", value: due, tone: "warn" },
          { label: "Upcoming", value: upcoming, tone: "neutral" },
        ]}
      />
      <SectionLabel className="mt-5">Due now</SectionLabel>
      <ul className="divide-y divide-d-line">
        {dueList.map((m) => (
          <li key={`${m.build.id}-${m.name}`} className="flex items-center justify-between gap-3 py-2 text-[12.5px]">
            <span className="min-w-0">
              <span className="block truncate font-medium">{m.build.client.split(",")[0]}</span>
              <span className="block text-[11.5px] text-d-mute">{m.name}</span>
            </span>
            <span className="tnum shrink-0 font-mono">{rupees(m.value - m.paid)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- per-build sheet ---------------- */

type Tab = "Overview" | "Modules" | "Payments" | "Risks" | "People" | "Changes" | "UAT";

function BuildSheet({ build, onClose, onAdvance }: { build: ClientBuild | null; onClose: () => void; onAdvance: (id: string) => void }) {
  return (
    <Sheet
      open={!!build}
      onOpenChange={(v) => !v && onClose()}
      width={620}
      eyebrow={build ? `${build.id} · ${build.industry}` : ""}
      title={build?.client ?? ""}
      sub={build ? `${personById[build.lead]?.first} leads · ${build.stage} · ${build.stage === "Live" ? "live since 9 Oct" : `go-live ${dayLabel(TODAY + build.goLiveIn)}`}` : undefined}
      footer={
        build && (
          <>
            {build.desk && (
              <Link href={`/industries/${build.desk}`} target="_blank" className="mr-auto inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-d-line px-3.5 text-[13.5px] font-medium hover:bg-d-sunk">
                <ExternalLink className="h-4 w-4" /> Open demo desk
              </Link>
            )}
            {build.stage !== "Live" ? (
              <Btn variant="solid" icon={ArrowRight} onClick={() => onAdvance(build.id)}>
                Advance to {STAGES[stageIndex(build.stage) + 1]}
              </Btn>
            ) : (
              <Pill tone="ok">Live · hypercare</Pill>
            )}
          </>
        )
      }
    >
      {build && <BuildBody key={build.id} build={build} />}
    </Sheet>
  );
}

function BuildBody({ build }: { build: ClientBuild }) {
  const hq = useHQ();
  const d = DETAIL[build.id];
  const [tab, setTab] = React.useState<Tab>("Overview");
  const si = stageIndex(build.stage);
  const uatDefault = si > 3 ? d.uat.length : si === 3 ? Math.ceil(d.uat.length * 0.6) : 0;
  const [uat, setUat] = React.useState(() => d.uat.map((label, i) => ({ id: `u${i}`, label, sub: i < uatDefault ? "Passed · signed by client" : si >= 3 ? "Open" : "Scheduled for UAT", done: i < uatDefault })));
  const [changes, setChanges] = React.useState(d.changes);
  const [crTitle, setCrTitle] = React.useState("");
  const ms = milestones(build);
  const mods = moduleStates(build);
  const uatDone = uat.filter((u) => u.done).length;

  return (
    <div>
      <div className="mb-4 flex items-center gap-1">
        {STAGES.map((s, i) => (
          <div key={s} className="min-w-0 flex-1">
            <div className="h-1.5 rounded-full" style={{ background: i < si ? "var(--d-accent)" : i === si ? (build.health === "Blocked" ? "var(--d-late)" : "color-mix(in oklab, var(--d-accent) 55%, var(--d-panel))") : "var(--d-sunk)" }} />
            <p className={`mt-1 truncate text-[10.5px] ${i === si ? "font-semibold text-d-ink" : "text-d-mute"}`}>{s}</p>
          </div>
        ))}
      </div>
      <Segmented size="sm" value={tab} onChange={setTab} options={(["Overview", "Modules", "Payments", "Risks", "People", "Changes", "UAT"] as const).map((t) => ({ value: t, label: t }))} className="mb-4" />

      {tab === "Overview" && (
        <div className="space-y-4">
          <AgentNote title="Build summary">{d.summary}</AgentNote>
          <KV
            items={[
              { k: "Contract value", v: rupees(build.value) },
              { k: "Collected", v: `${rupees(build.paid)} (${Math.round((build.paid / build.value) * 100)}%)` },
              { k: "Health", v: <Pill tone={HEALTH_TONE[build.health]}>{build.health}</Pill> },
              { k: "Go-live", v: build.stage === "Live" ? "Live since 9 Oct" : `${dayLabel(TODAY + build.goLiveIn)} · in ${build.goLiveIn}d` },
              { k: "Kicked off", v: dayLabel(d.started) },
              { k: "Lead", v: personById[build.lead]?.name },
            ]}
          />
          <div>
            <div className="mb-1 flex justify-between text-[12px] text-d-mute">
              <span>Overall progress</span>
              <span className="tnum font-mono">{build.progress}%</span>
            </div>
            <Meter value={build.progress} tone={build.health === "Blocked" ? "late" : "accent"} height={8} />
          </div>
          {build.desk && (
            <Link href={`/industries/${build.desk}`} target="_blank" className="flex items-center justify-between rounded-[12px] border border-d-line bg-d-sunk/50 px-4 py-3 hover:border-d-accent">
              <span>
                <span className="block text-[13.5px] font-semibold">Demo desk: /industries/{build.desk}</span>
                <span className="block text-[12px] text-d-mute">The reference command center this build is configured from</span>
              </span>
              <ExternalLink className="h-4 w-4 text-d-mute" />
            </Link>
          )}
          <div>
            <SectionLabel>Recent activity</SectionLabel>
            <Feed
              items={[
                { time: "Today, 9:31 AM", who: personById[build.lead]?.first, text: d.risks[0] ? `Updated risk: ${d.risks[0].title.toLowerCase()}` : "Posted the daily build note", tone: d.risks[0]?.tone ?? "info" },
                { time: "Yesterday, 6:40 PM", who: "Delivery agent", text: `Summarised ${3 + (build.progress % 5)} client messages and ${12 + (build.progress % 9)} commits into the build note`, tone: "accent" },
                { time: "Yesterday, 3:10 PM", who: d.contacts[0].name.split(" ")[0], text: d.changes[0] ? `Raised ${d.changes[0].id}: ${d.changes[0].title}` : "Joined the weekly review call", tone: "info" },
                { time: dayLabel(d.started + 1), who: personById[build.lead]?.first, text: `Kickoff with ${d.contacts.map((c) => c.name.split(" ")[0]).join(", ")}`, tone: "ok" },
              ]}
            />
          </div>
        </div>
      )}

      {tab === "Modules" && (
        <ul className="space-y-3">
          {mods.map((m) => (
            <li key={m.name} className="rounded-[12px] border border-d-line p-3">
              <div className="flex items-center justify-between">
                <span className="text-[13.5px] font-medium">{m.name}</span>
                <Pill tone={m.state === "Done" ? "ok" : m.state === "In build" ? (build.health === "Blocked" && m.name === "Aggregators" ? "late" : "accent") : "neutral"}>
                  {build.health === "Blocked" && m.name === "Aggregators" ? "Blocked" : m.state}
                </Pill>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Meter value={m.pct} tone={m.state === "Done" ? "ok" : "accent"} height={5} />
                <span className="tnum w-9 text-right font-mono text-[11px] text-d-mute">{m.pct}%</span>
              </div>
            </li>
          ))}
          <li className="rounded-[12px] border border-dashed border-d-line p-3 text-[12.5px] text-d-mute">Included in every build: owner morning brief, WhatsApp alerts, role-based access, Tally sync.</li>
        </ul>
      )}

      {tab === "Payments" && (
        <div>
          <div className="mb-4 grid grid-cols-3 gap-2">
            <Metric label="Value" value={rupees(build.value)} />
            <Metric label="Paid" value={rupees(build.paid)} />
            <Metric label="Balance" value={rupees(build.value - build.paid)} />
          </div>
          <ul className="divide-y divide-d-line">
            {ms.map((m) => (
              <li key={m.name} className="flex items-center gap-3 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-medium">{m.name}</span>
                  <span className="block text-[11.5px] text-d-mute">
                    {Math.round(m.pct * 100)}% · {rupees(m.paid)} of {rupees(m.value)}
                  </span>
                  <Meter className="mt-1.5" value={m.paid} max={m.value} tone={m.status === "Paid" ? "ok" : "warn"} height={4} />
                </span>
                <Pill tone={m.status === "Paid" ? "ok" : m.status === "Upcoming" ? "neutral" : "warn"}>{m.status}</Pill>
                {(m.status === "Due" || m.status === "Part paid") && (
                  <Btn
                    size="sm"
                    icon={Send}
                    onClick={() => {
                      hq.notify({ kind: "payment", title: `Payment link sent: ${rupees(m.value - m.paid)}`, body: `${build.client.split(",")[0]} · ${m.name}, Razorpay link on WhatsApp`, href: "/hq/builds" });
                      hq.log(`sent a ${rupees(m.value - m.paid)} payment link to ${build.client.split(",")[0]}`, "info");
                    }}
                  >
                    Payment link
                  </Btn>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "Risks" && (
        <ul className="space-y-2.5">
          {d.risks.map((r) => (
            <li key={r.title} className="rounded-[12px] border border-d-line p-3">
              <p className="flex items-center gap-2 text-[13.5px] font-medium">
                <AlertTriangle className="h-4 w-4" style={{ color: `var(--d-${r.tone === "neutral" ? "mute" : r.tone})` }} />
                {r.title}
              </p>
              <p className="mt-1 text-[12.5px] text-d-mute">Mitigation: {r.mitigation}</p>
              <div className="mt-2 flex items-center justify-between">
                <PersonChip id={r.owner} sub="owner" />
                <Btn
                  size="sm"
                  icon={Plus}
                  onClick={() => {
                    hq.addTask({ title: `${build.client.split(",")[0]}: ${r.mitigation}`, owner: r.owner, status: "Todo", priority: r.tone === "late" ? "P0" : "P1", due: "Tomorrow", dueIn: 1, area: "Delivery", linked: build.id });
                    toast.success("Task created", { description: `${personById[r.owner]?.first} · ${r.mitigation}` });
                  }}
                >
                  Task
                </Btn>
              </div>
            </li>
          ))}
        </ul>
      )}

      {tab === "People" && (
        <div className="space-y-4">
          <div>
            <SectionLabel>Client contacts</SectionLabel>
            <ul className="divide-y divide-d-line">
              {d.contacts.map((c) => (
                <li key={c.name} className="flex items-center gap-3 py-2.5">
                  <PersonAvatar name={c.name} size={32} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-[13.5px] font-medium">
                      {c.name} {c.decides && <Pill tone="accent">Decision maker</Pill>}
                    </span>
                    <span className="block truncate text-[11.5px] text-d-mute">
                      {c.role} · {c.phone} · {c.email}
                    </span>
                  </span>
                  <a href={`tel:${c.phone.replace(/\s/g, "")}`} aria-label={`Call ${c.name}`} className="rounded-lg p-2 text-d-mute hover:bg-d-sunk hover:text-d-ink">
                    <Phone className="h-4 w-4" />
                  </a>
                  <a href={`mailto:${c.email}`} aria-label={`Email ${c.name}`} className="rounded-lg p-2 text-d-mute hover:bg-d-sunk hover:text-d-ink">
                    <Mail className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionLabel>BuildBiz team</SectionLabel>
            <div className="flex flex-wrap gap-4">
              <PersonChip id={build.lead} sub="Build lead" />
              <PersonChip id={build.lead === "neha" ? "vikram" : "neha"} sub={build.lead === "neha" ? "Architect" : "Delivery head"} />
              <PersonChip id="priya" sub="Client training" />
              <PersonChip id="sahil" sub="Invoices" />
            </div>
          </div>
        </div>
      )}

      {tab === "Changes" && (
        <div>
          <ul className="space-y-2">
            {changes.length === 0 && <li className="rounded-[12px] border border-dashed border-d-line p-4 text-center text-[12.5px] text-d-mute">No change requests yet.</li>}
            {changes.map((c) => (
              <li key={c.id} className="rounded-[12px] border border-d-line p-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-[13.5px] font-medium">
                      <GitPullRequest className="h-3.5 w-3.5 text-d-mute" />
                      {c.title}
                    </span>
                    <span className="mt-0.5 block text-[11.5px] text-d-mute">
                      {c.id} · raised by {c.by} · {c.hours}h · {c.cost ? rupees(c.cost) : "no charge"}
                    </span>
                  </span>
                  {c.status === "Open" ? (
                    <span className="flex shrink-0 gap-1">
                      <Btn size="sm" variant="ghost" onClick={() => setChanges((cur) => cur.map((x) => (x.id === c.id ? { ...x, status: "Declined" } : x)))}>
                        Decline
                      </Btn>
                      <Btn
                        size="sm"
                        variant="solid"
                        onClick={() => {
                          setChanges((cur) => cur.map((x) => (x.id === c.id ? { ...x, status: "Approved" } : x)));
                          hq.log(`approved ${c.id} on ${build.client.split(",")[0]}: ${c.title}`, "info");
                        }}
                      >
                        Approve
                      </Btn>
                    </span>
                  ) : (
                    <Pill tone={c.status === "Approved" ? "ok" : "neutral"}>{c.status}</Pill>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!crTitle.trim()) return;
              const hours = 4 + (crTitle.length % 9) * 2;
              setChanges((cur) => [...cur, { id: `CR-${cur.length + 1}`, title: crTitle.trim(), by: "BuildBiz", hours, cost: hours * 2000, status: "Open" }]);
              setCrTitle("");
              toast("Change request logged", { description: `AI estimate: ${hours}h, ${rupees(hours * 2000)} at the standard rate` });
            }}
          >
            <input value={crTitle} onChange={(e) => setCrTitle(e.target.value)} placeholder="Log a change request" className={inputClass} />
            <Btn variant="outline" icon={Plus} type="submit">
              Log
            </Btn>
          </form>
          <p className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] text-d-mute">
            <AIMark /> Hours and cost are estimated from similar requests on past builds.
          </p>
        </div>
      )}

      {tab === "UAT" && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[13px] text-d-mute">
              {uatDone} of {uat.length} test cases passed
            </span>
            {uatDone === uat.length ? (
              <Pill tone="ok">
                <CheckCircle2 className="h-3 w-3" /> Ready to sign off
              </Pill>
            ) : (
              <Pill tone="warn">{uat.length - uatDone} open</Pill>
            )}
          </div>
          <Meter value={uatDone} max={uat.length} tone="ok" className="mb-3" />
          <Checklist items={uat} onToggle={(id) => setUat((cur) => cur.map((u) => (u.id === id ? { ...u, done: !u.done, sub: !u.done ? "Passed · marked just now" : "Open" } : u)))} />
          <Btn
            className="mt-3"
            size="sm"
            icon={Send}
            disabled={uatDone < uat.length}
            onClick={() => {
              hq.notify({ kind: "task", title: `UAT sign-off requested from ${d.contacts[0].name}`, body: `${build.client.split(",")[0]} · ${uat.length} test cases passed`, href: "/hq/builds" });
            }}
          >
            Request client sign-off
          </Btn>
        </div>
      )}
    </div>
  );
}
