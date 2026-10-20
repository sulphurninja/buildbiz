"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CalendarClock,
  CheckCheck,
  ClipboardList,
  Factory,
  FileSpreadsheet,
  Gauge as GaugeIcon,
  IndianRupee,
  MessageCircle,
  PackageCheck,
  Plus,
  Receipt,
  Send,
  Shirt,
  Timer,
  Truck,
  Users,
} from "lucide-react";
import { DeskShell, useDesk } from "../shell";
import { AreaChart, Bars, Donut, HBars, HeatGrid } from "../charts";
import { AgingBar, ApprovalQueue, Countdown, DataTable, Gantt, type GanttRow } from "../data";
import { AgentsModule, ConnectionsModule, IndependenceModule, PeopleModule } from "../common";
import { Btn, Field, IconBtn, inputClass, inr, KV, Meter, Modal, Panel, Pill, Segmented, Sheet, Stat } from "../ui";
import { useDrift } from "../hooks";
import type { DeskConfig, DeskModule, IndependenceData, Integration, TeamMember, Tone, WorkforceAgent } from "../types";

/* ============================================================
   Data — Godavari Weaves, Surat. Fictional rainwear & outerwear unit.
   Timeline x-axis: day 0 = 8 Oct, today = day 12 (20 Oct).
   ============================================================ */

const TODAY = 12;
const STAGES = ["Fabric in", "Cut", "Stitch", "Finish", "Inspect", "Pack"] as const;
type Stage = (typeof STAGES)[number];
type MilestoneState = "done" | "late" | "open";

type Style = {
  id: string;
  name: string;
  buyer: string;
  qty: number;
  made: number;
  swatch: string;
  season: "NE monsoon" | "Winter drop" | "Corporate";
  buyerDate: number;
  fob: number;
  merchant: string;
  plan: Record<Stage, number>;
  state: Record<Stage, MilestoneState>;
};

const swatches = {
  ripstop: "repeating-linear-gradient(90deg,#5c9db0 0 2px,#a9d0db 2px 5px),#7fb6c6",
  cape: "repeating-linear-gradient(0deg,#4f8fb3 0 3px,#b8dbe9 3px 7px)",
  rider: "repeating-linear-gradient(45deg,#2d6f86 0 4px,#93c7d6 4px 9px)",
  trench: "repeating-linear-gradient(90deg,#9cc3d6 0 1px,#dbeaf1 1px 4px)",
  pack: "radial-gradient(circle at 30% 30%,#7d8fdc 0 2px,transparent 2.5px) 0 0/6px 6px,#4a5fc0",
  hood: "repeating-linear-gradient(90deg,#33449a 0 3px,#5568c7 3px 6px),#3b4fae",
  school: "radial-gradient(circle,#ffffff 0 1.4px,transparent 1.8px) 0 0/7px 7px,#3a4ea8",
  corp: "repeating-linear-gradient(0deg,#e6a46a 0 2px,transparent 2px 6px),repeating-linear-gradient(90deg,#e6a46a 0 2px,#f5d9bd 2px 6px)",
};

function plan(start: number, gaps: number[]): Record<Stage, number> {
  let at = start;
  const out = {} as Record<Stage, number>;
  STAGES.forEach((s, i) => {
    at += gaps[i] ?? 4;
    out[s] = at;
  });
  return out;
}
function states(...list: MilestoneState[]): Record<Stage, MilestoneState> {
  const out = {} as Record<Stage, MilestoneState>;
  STAGES.forEach((s, i) => (out[s] = list[i] ?? "open"));
  return out;
}

const seedStyles: Style[] = [
  { id: "RP-14", name: "RP-14 ripstop poncho", buyer: "Mazhai Retail", qty: 6400, made: 2900, swatch: swatches.ripstop, season: "NE monsoon", buyerDate: 30, fob: 312, merchant: "Hetal", plan: plan(0, [0, 6, 7, 5, 4, 4]), state: states("done", "done", "open", "open", "open", "open") },
  { id: "KC-08", name: "KC-08 kids cape raincoat", buyer: "Chinnu Kids Stores", qty: 4800, made: 3457, swatch: swatches.cape, season: "NE monsoon", buyerDate: 26, fob: 268, merchant: "Hetal", plan: plan(1, [0, 3, 4, 7, 4, 4]), state: states("done", "done", "late", "open", "open", "open") },
  { id: "RS-22", name: "RS-22 rider rain suit", buyer: "Vaigai Riders Gear", qty: 3600, made: 2390, swatch: swatches.rider, season: "NE monsoon", buyerDate: 29, fob: 645, merchant: "Kunal", plan: plan(1, [0, 4, 4, 8, 5, 4]), state: states("done", "done", "late", "open", "open", "open") },
  { id: "LT-05", name: "LT-05 long trench raincoat", buyer: "Kayal Fashions", qty: 2600, made: 1610, swatch: swatches.trench, season: "NE monsoon", buyerDate: 36, fob: 890, merchant: "Kunal", plan: plan(0, [0, 6, 6, 10, 4, 4]), state: states("done", "done", "done", "open", "open", "open") },
  { id: "WC-31", name: "WC-31 packable windcheater", buyer: "Northpeak Outfitters", qty: 5500, made: 820, swatch: swatches.pack, season: "Winter drop", buyerDate: 51, fob: 540, merchant: "Rhea", plan: plan(0, [2, 7, 16, 6, 6, 6]), state: states("done", "done", "open", "open", "open", "open") },
  { id: "WC-27", name: "WC-27 hooded windcheater", buyer: "Shivalik Trail Sports", qty: 4200, made: 610, swatch: swatches.hood, season: "Winter drop", buyerDate: 51, fob: 585, merchant: "Rhea", plan: plan(1, [2, 6, 15, 7, 6, 5]), state: states("done", "done", "open", "open", "open", "open") },
  { id: "SW-12", name: "SW-12 school windcheater", buyer: "Satluj Uniform House", qty: 7800, made: 0, swatch: swatches.school, season: "Winter drop", buyerDate: 57, fob: 410, merchant: "Rhea", plan: plan(0, [5, 13, 15, 9, 7, 5]), state: states("late", "open", "open", "open", "open", "open") },
  { id: "CJ-09", name: "CJ-09 corporate rain jacket", buyer: "Brightline Corporate Gifts", qty: 1900, made: 0, swatch: swatches.corp, season: "Corporate", buyerDate: 64, fob: 760, merchant: "Kunal", plan: plan(10, [3, 10, 15, 6, 5, 4]), state: states("open", "open", "open", "open", "open", "open") },
];

/** Days a style will slip past buyer date, given late milestones push the remaining chain. */
function slipOf(style: Style) {
  const lateAt = STAGES.find((s) => style.state[s] === "late");
  if (!lateAt) return 0;
  const lateDays = Math.max(0, TODAY - style.plan[lateAt]) + 1;
  const last = style.plan.Pack + lateDays;
  return Math.max(0, last + 1 - style.buyerDate);
}
function lateLabel(style: Style) {
  const s = STAGES.find((st) => style.state[st] === "late");
  if (!s) return null;
  return { stage: s, days: Math.max(1, TODAY - style.plan[s] + 1) };
}

type Trim = { po: string; supplier: string; item: string; style: string; qty: string; amount: number; need: string };
const trimsPOs: Trim[] = [
  { po: "TP-2207", supplier: "Sealwell Tapes, Bhiwandi", item: "Seam-sealing tape 22mm", style: "KC-08", qty: "14,000 m", amount: 38600, need: "Stitch line 2 runs out Thursday" },
  { po: "TP-2209", supplier: "Ruchi Zips, Ahmedabad", item: "#5 waterproof zip, 68cm", style: "WC-31", qty: "5,600 pcs", amount: 22120, need: "Cutting starts 24 Oct" },
  { po: "TP-2211", supplier: "Kothari Snaps, Mumbai", item: "Press buttons, 15mm antique", style: "RS-22", qty: "29,000 pcs", amount: 9880, need: "Finishing short by 6,000" },
  { po: "TP-2214", supplier: "Bharat Labels, Tiruppur", item: "Care + size labels, woven", style: "SW-12", qty: "16,000 pcs", amount: 13417, need: "Buyer approved artwork yesterday" },
];

type Bom = { item: string; supplier: string; perPc: string; need: number; store: number; unit: string };
const bom: Record<string, Bom[]> = {
  "KC-08": [
    { item: "PU-coated polyester 190T", supplier: "Venus Fabrics, Surat", perPc: "1.35 m", need: 6480, store: 6620, unit: "m" },
    { item: "Seam-sealing tape 22mm", supplier: "Sealwell Tapes", perPc: "2.9 m", need: 13920, store: 4100, unit: "m" },
    { item: "Press buttons 12mm", supplier: "Kothari Snaps", perPc: "5", need: 24000, store: 25500, unit: "pcs" },
    { item: "Reflective piping", supplier: "Lumo Trims, Delhi", perPc: "0.8 m", need: 3840, store: 2900, unit: "m" },
    { item: "Kids hood toggle", supplier: "Ruchi Zips", perPc: "2", need: 9600, store: 9600, unit: "pcs" },
    { item: "Poly bag + header card", supplier: "Prakash Pack", perPc: "1", need: 4800, store: 1200, unit: "pcs" },
  ],
  "WC-31": [
    { item: "Nylon taslan 228T", supplier: "Venus Fabrics, Surat", perPc: "1.6 m", need: 8800, store: 9100, unit: "m" },
    { item: "#5 waterproof zip 68cm", supplier: "Ruchi Zips", perPc: "1", need: 5500, store: 0, unit: "pcs" },
    { item: "Mesh lining", supplier: "Shreeji Knits", perPc: "1.1 m", need: 6050, store: 6400, unit: "m" },
    { item: "Elastic cord + stopper", supplier: "Lumo Trims", perPc: "1 set", need: 5500, store: 3000, unit: "sets" },
    { item: "Stuff-sack pouch", supplier: "Prakash Pack", perPc: "1", need: 5500, store: 5500, unit: "pcs" },
  ],
  "RS-22": [
    { item: "PVC-backed oxford 210D", supplier: "Arvind Coated", perPc: "2.4 m", need: 8640, store: 8900, unit: "m" },
    { item: "Press buttons 15mm", supplier: "Kothari Snaps", perPc: "8", need: 28800, store: 22800, unit: "pcs" },
    { item: "Seam-sealing tape 22mm", supplier: "Sealwell Tapes", perPc: "4.2 m", need: 15120, store: 15120, unit: "m" },
    { item: "Reflective tape 50mm", supplier: "Lumo Trims", perPc: "1.2 m", need: 4320, store: 4500, unit: "m" },
  ],
};

const lines = [
  { id: "L1", name: "Line 1", style: "RP-14", ops: 28, present: 28, target: 120, eff: 81, bottleneck: "Hood attach", hourly: [62, 74, 79, 83, 80, 84, 86, 82, 81, 79, 83, 81] },
  { id: "L2", name: "Line 2", style: "KC-08", ops: 26, present: 24, target: 110, eff: 73, bottleneck: "Seam taping", hourly: [70, 72, 69, 66, 71, 74, 72, 73, 70, 73, 73, 73] },
  { id: "L3", name: "Line 3", style: "RS-22", ops: 32, present: 31, target: 85, eff: 68, bottleneck: "Pant fly zip", hourly: [58, 61, 64, 66, 62, 70, 71, 69, 67, 68, 69, 68] },
  { id: "L4", name: "Line 4", style: "LT-05", ops: 22, present: 22, target: 60, eff: 88, bottleneck: "Collar", hourly: [80, 84, 86, 88, 87, 90, 89, 88, 86, 89, 88, 88] },
];
const hoursLabels = ["9", "10", "11", "12", "1", "2", "3", "4", "5", "6", "7", "8"];

type Invoice = { no: string; buyer: string; style: string; amount: number; raised: string; days: number; terms: string; promise?: string };
const invoices: Invoice[] = [
  { no: "GW/24-25/318", buyer: "Mazhai Retail", style: "RP-11", amount: 486000, raised: "2 Sep", days: 48, terms: "45 days", promise: "Fri, after their GRN" },
  { no: "GW/24-25/322", buyer: "Chinnu Kids Stores", style: "KC-06", amount: 312400, raised: "9 Sep", days: 41, terms: "30 days" },
  { no: "GW/24-25/301", buyer: "Vaigai Riders Gear", style: "RS-19", amount: 742000, raised: "12 Aug", days: 69, terms: "45 days", promise: "Cheque on 25 Oct" },
  { no: "GW/24-25/287", buyer: "Kayal Fashions", style: "LT-03", amount: 198600, raised: "28 Jul", days: 84, terms: "60 days" },
  { no: "GW/24-25/266", buyer: "Coastline Stores", style: "RP-09", amount: 264800, raised: "4 Jul", days: 108, terms: "60 days" },
  { no: "GW/24-25/329", buyer: "Northpeak Outfitters", style: "WC-22 sample", amount: 42500, raised: "26 Sep", days: 24, terms: "30 days" },
  { no: "GW/24-25/331", buyer: "Shivalik Trail Sports", style: "WC-27 advance", amount: 735000, raised: "30 Sep", days: 20, terms: "Advance 30%" },
  { no: "GW/24-25/309", buyer: "Mazhai Retail", style: "RP-12", amount: 391200, raised: "21 Aug", days: 60, terms: "45 days" },
  { no: "GW/24-25/296", buyer: "Coastline Stores", style: "KC-04", amount: 157300, raised: "6 Aug", days: 75, terms: "60 days" },
  { no: "GW/24-25/334", buyer: "Brightline Corporate Gifts", style: "CJ-09 advance", amount: 433200, raised: "8 Oct", days: 12, terms: "Advance 30%" },
  { no: "GW/24-25/312", buyer: "Chinnu Kids Stores", style: "KC-07", amount: 228900, raised: "26 Aug", days: 55, terms: "30 days" },
];

const team: TeamMember[] = [
  { name: "Jignesh Patel", role: "Owner", status: "Busy", load: 94, focus: "Signing trims POs and the Northpeak price call at 12", tasks: [{ title: "Approve 4 trims POs", due: "10:30" }, { title: "Northpeak price call", due: "12:00" }, { title: "Bank visit for packing credit", due: "3:00", done: false }], week: [1, 1, 1, 1, 1, 1], since: "2006" },
  { name: "Hetal Desai", role: "Merchandiser, monsoon buyers", status: "On floor", load: 82, focus: "Chasing KC-08 seam tape; buyer wants revised ex-factory", tasks: [{ title: "Revised TNA to Chinnu Kids", due: "11:00" }, { title: "Shade band approval RP-14", due: "2:00", done: true }, { title: "Size set photos to Mazhai", due: "4:00" }], week: [1, 1, 1, 1, 0, 1], since: "2017" },
  { name: "Rhea Shah", role: "Merchandiser, winter buyers", status: "Busy", load: 76, focus: "SW-12 fabric delay: mill promised Thursday", tasks: [{ title: "Call Venus Fabrics on SW-12 lot", due: "10:00", done: true }, { title: "PP sample WC-27 to Shivalik", due: "5:00" }], week: [1, 1, 1, 1, 1, 1], since: "2020" },
  { name: "Kunal Mehta", role: "Merchandiser, export + corporate", status: "In field", load: 64, focus: "At Brightline for CJ-09 logo approval", tasks: [{ title: "Logo strike-off sign-off", due: "1:00" }, { title: "LT-05 inline inspection", due: "4:30" }], week: [1, 1, 0, 1, 1, 1], since: "2021" },
  { name: "Ramesh Yadav", role: "Production manager", status: "On floor", load: 88, focus: "Line 2 short 2 operators; Line 3 zip bottleneck", tasks: [{ title: "Shift 2 tapers from Line 4 to Line 2", due: "now" }, { title: "Line balancing for RS-22 pants", due: "11:30" }, { title: "Overtime list for Saturday", due: "6:00" }], week: [1, 1, 1, 1, 1, 1], since: "2011" },
  { name: "Sunita Rathod", role: "QC head", status: "On floor", load: 71, focus: "Inline audit on RS-22, DHU at 4.1%", tasks: [{ title: "Water-column test KC-08 lot 3", due: "12:30" }, { title: "AQL 2.5 final for LT-05", due: "Thu" }], week: [1, 1, 1, 1, 1, 0], since: "2015" },
  { name: "Imran Shaikh", role: "Store + trims", status: "On floor", load: 58, focus: "Receiving Sealwell tape, 9,800 m dispatched", tasks: [{ title: "GRN for Sealwell dispatch", due: "3:00" }, { title: "Issue zips to cutting WC-31", due: "Thu" }], week: [1, 1, 1, 1, 1, 1], since: "2018" },
  { name: "Priya Nair", role: "Accounts", status: "Off", load: 30, focus: "Half day; dues reminders queued for 5 PM", tasks: [{ title: "Reconcile Vaigai cheque", due: "tomorrow" }], week: [1, 1, 1, 1, 1, 0], since: "2019" },
];

const agents: WorkforceAgent[] = [
  { name: "TNA Chaser", role: "Watches every milestone against buyer dates", icon: CalendarClock, status: "Needs you", runsToday: 14, hoursSaved: 6.5, accuracy: 93, last: "4 min ago", skills: ["TNA", "WhatsApp", "Critical path"], schedule: "Every 30 min, 8 AM – 9 PM", inbox: [{ title: "Tell Chinnu Kids KC-08 ships 3 days late?", detail: "Stitching is 4 days behind. Drafted a revised ex-factory with an air-freight option for 600 pcs." }], log: ["Flagged SW-12 fabric 7 days late, buyer date at risk", "Moved RS-22 finishing 2 days right", "Sent 6 merchandisers their morning list"] },
  { name: "Trims Buyer", role: "Raises trims POs from BOM shortfalls", icon: Boxes, status: "Needs you", runsToday: 6, hoursSaved: 4, accuracy: 89, last: "18 min ago", skills: ["BOM", "Vendor rates", "Tally PO"], schedule: "After every cutting plan", inbox: [{ title: "4 POs, ₹84,017 total", detail: "Lowest of 3 quotes on each. Sealwell tape is urgent for Line 2." }], log: ["Drafted TP-2214 labels from approved artwork", "Compared 3 zip quotes, picked Ruchi at ₹3.95", "Matched Sealwell dispatch to TP-2198"] },
  { name: "Line Watcher", role: "Reads hourly output boards from the floor", icon: GaugeIcon, status: "Running", runsToday: 11, hoursSaved: 3.5, accuracy: 96, last: "just now", skills: ["Hourly boards", "Efficiency", "Absentee"], schedule: "Every hour on the hour", log: ["Line 2 at 73% for 3 hours, 2 operators absent", "Line 4 crossed 88%, best this week", "Suggested 2 tapers move from Line 4"] },
  { name: "Dues Collector", role: "Follows up buyer payments politely and on time", icon: IndianRupee, status: "Running", runsToday: 4, hoursSaved: 5, accuracy: 91, last: "1 h ago", skills: ["Ageing", "WhatsApp", "Tally"], schedule: "Daily 5 PM", log: ["Queued 6 reminders for 5 PM", "Logged Vaigai promise: cheque 25 Oct", "Escalated Coastline 108 days to owner"] },
  { name: "QC Recorder", role: "Turns inline audit photos into DHU reports", icon: CheckCheck, status: "Running", runsToday: 9, hoursSaved: 2.5, accuracy: 94, last: "22 min ago", skills: ["Photos", "AQL", "Defect codes"], schedule: "On every audit upload", log: ["RS-22 DHU 4.1%, top defect open seam", "KC-08 water test lot 2 passed", "LT-05 inline clean, 0.9% DHU"] },
  { name: "Buyer Desk", role: "Answers buyer status questions from live data", icon: MessageCircle, status: "Idle", runsToday: 3, hoursSaved: 1.5, accuracy: 88, last: "2 h ago", skills: ["Buyer portal", "Email", "Photos"], schedule: "On incoming message", log: ["Sent Mazhai the RP-14 size set photos", "Replied Northpeak: PP sample Friday", "Shared LT-05 inline report with Kayal"] },
];

const independence: IndependenceData = {
  score: 34,
  history: [21, 23, 24, 27, 28, 30, 31],
  quote: "I sign every trims PO myself because the last time I didn't, we bought 40,000 wrong buttons.",
  pillars: [
    { name: "Sales & buyers", score: 38, note: "Three buyers only talk to Jignesh. Merchandisers forward, he answers.", fixes: [{ title: "Buyer Desk answers status", gain: 3 }, { title: "Weekly buyer TNA auto-share", gain: 2 }] },
    { name: "Operations & floor", score: 31, note: "Line balancing happens in Ramesh's head. Hourly boards are on paper.", fixes: [{ title: "Hourly boards on tablet", gain: 3 }, { title: "Line balancing template", gain: 2 }] },
    { name: "Purchase & trims", score: 22, note: "Every PO waits for the owner's signature, average 1.6 days.", fixes: [{ title: "Auto-approve under ₹15k", gain: 4 }, { title: "Approved vendor list", gain: 2 }] },
    { name: "Money & dues", score: 36, note: "₹39.9 L outstanding; follow-ups depend on who remembers.", fixes: [{ title: "Daily dues agent", gain: 3 }] },
    { name: "Team & roles", score: 41, note: "Merchandisers own buyers but not dates. QC reports to the owner directly.", fixes: [{ title: "Merchandiser owns TNA", gain: 3 }, { title: "QC reports to production", gain: 1 }] },
    { name: "Numbers & reporting", score: 29, note: "Efficiency is computed on Saturday in Excel.", fixes: [{ title: "Live efficiency board", gain: 2 }] },
    { name: "Owner time", score: 40, note: "Owner spends 14 hours a week on trims and approvals.", fixes: [{ title: "Two approval windows a day", gain: 2 }] },
  ],
  ownerHours: [
    { label: "Trims POs", hours: 9 },
    { label: "Buyer calls", hours: 11 },
    { label: "Floor rounds", hours: 7 },
    { label: "Dues", hours: 5 },
    { label: "Bank", hours: 3 },
    { label: "Hiring", hours: 2 },
    { label: "Strategy", hours: 1 },
  ],
};

const integrations: Integration[] = [
  { name: "Tally Prime", category: "Accounts", status: "Connected", detail: "Invoices, POs and buyer ledgers, both ways.", synced: "6 min ago", records: "12,840 vouchers", mark: "T", color: "#1c4f9c" },
  { name: "WhatsApp Business", category: "Messaging", status: "Connected", detail: "Merchandiser groups, buyer updates, dues reminders.", synced: "just now", records: "2,310 chats", mark: "W", color: "#1f9d55" },
  { name: "Floor tablets", category: "Production", status: "Syncing", detail: "Hourly output from 4 stitching lines.", synced: "live", records: "48 boards today", mark: "FT", color: "#8a5cf6" },
  { name: "Biometric attendance", category: "People", status: "Connected", detail: "eSSL devices at both gates.", synced: "9:14 AM", records: "212 punches", mark: "B", color: "#c0473a" },
  { name: "Google Sheets", category: "Planning", status: "Connected", detail: "Legacy TNA sheets, read-only while you move over.", synced: "1 h ago", records: "8 sheets", mark: "GS", color: "#0f9d58" },
  { name: "Buyer portal (Mazhai)", category: "Buyers", status: "Error", detail: "Login expired. ASN upload paused.", synced: "2 days ago", records: "—", mark: "MZ", color: "#d97706" },
  { name: "Gmail", category: "Messaging", status: "Connected", detail: "Buyer POs and tech packs parsed into styles.", synced: "12 min ago", records: "940 threads", mark: "G", color: "#ea4335" },
  { name: "Razorpay", category: "Accounts", status: "Available", detail: "Payment links for sample and small-lot buyers.", synced: "—", records: "—", mark: "R", color: "#2563eb" },
  { name: "Shiprocket", category: "Logistics", status: "Available", detail: "Courier samples and size sets with tracking.", synced: "—", records: "—", mark: "S", color: "#7c3aed" },
];

/* ============================================================
   Config
   ============================================================ */

const config: DeskConfig = {
  slug: "textile",
  company: "Godavari Weaves",
  brand: "Godavari",
  city: "Surat",
  state: "GJ",
  icon: Shirt,
  tagline: "Rainwear and outerwear for 9 buyers · 4 stitching lines · 212 people",
  owner: { name: "Jignesh Patel", first: "Jignesh", initials: "JP", role: "Owner" },
  theme: {
    variant: "atelier",
    paper: "#f5f6fa",
    panel: "#ffffff",
    sunk: "#eceef5",
    ink: "#18203a",
    mute: "#666d88",
    line: "#e1e4ee",
    accent: "#3d5a99",
    accentInk: "#ffffff",
    soft: "#e8edf7",
    ok: "#2f8a73",
    warn: "#c58a2a",
    late: "#bd4a3c",
    info: "#3f8f8a",
    heading: "display",
  },
  brief:
    "Three style orders will miss their buyer date if nothing changes; KC-08 is the one you can still save today by moving two tapers to Line 2. Four trims POs are waiting on you and ₹7.4 L from Vaigai is promised for Friday.",
  pulse: [
    { label: "Orders on plan", value: "5 of 8", delta: "-1", good: false, trend: [8, 8, 7, 7, 6, 6, 5], module: "plan" },
    { label: "Pieces stitched today", value: "1,842", delta: "+6%", trend: [220, 480, 760, 1010, 1260, 1500, 1842], tone: "ok", module: "floor" },
    { label: "Floor efficiency", value: "78%", delta: "+2%", trend: [70, 72, 75, 74, 77, 76, 78], module: "floor" },
    { label: "Buyer dues", value: "₹39.9 L", delta: "-7%", good: true, trend: [46, 44, 45, 43, 42, 41, 40], tone: "warn", module: "dues" },
    { label: "Order book", value: "₹2.1 Cr", delta: "+12%", trend: [1.4, 1.5, 1.7, 1.8, 1.9, 2.0, 2.1], module: "orders" },
  ],
  agenda: [
    { at: 9, title: "Line huddle", detail: "Line 2 short 2 operators", tone: "warn", module: "floor" },
    { at: 10.5, title: "Trims PO window", detail: "4 POs, ₹84,017", count: 4, tone: "info", module: "trims" },
    { at: 12, title: "Northpeak price call", detail: "WC-31 repeat, they want ₹520 FOB", tone: "accent", module: "orders" },
    { at: 14, title: "Collections review with Priya", detail: "11 invoices, 3 over 75 days", count: 11, tone: "late", module: "dues" },
    { at: 15.5, title: "Bank: packing credit", detail: "₹18 L against the Northpeak LC", tone: "neutral" },
    { at: 18, title: "Day close", detail: "Output, defects and tomorrow's plan", tone: "ok", module: "floor" },
  ],
  activity: [
    { time: "11:40 AM", text: "Sealwell Tapes dispatched 9,800 m of seam tape", tone: "ok" },
    { time: "11:12 AM", text: "Plan Watcher re-planned RS-22 finishing 2 days right", tone: "warn" },
    { time: "10:55 AM", text: "KC-08 water-column test lot 2 passed at 1,500 mm", tone: "ok" },
    { time: "10:20 AM", text: "Line Watcher: Line 2 at 73% for 3 hours", tone: "late" },
    { time: "9:48 AM", text: "Vaigai Riders promised a cheque for ₹7.4 L on 25 Oct", tone: "info" },
    { time: "9:15 AM", text: "Attendance closed: 105 of 108 operators in", tone: "neutral" },
  ],
  asks: [
    { q: "Which orders will miss their buyer date?", a: "Three, if nothing changes.\n\n• KC-08 kids cape (Chinnu Kids): stitching 5 days late, ships about 3 days after 3 Nov.\n• RS-22 rider suit (Vaigai): stitching 4 days late, about 2 days past 6 Nov.\n• SW-12 school windcheater (Satluj): fabric 8 days late, about 6 days past 4 Dec.\n\nThe fastest fix is to move 2 tapers from Line 4 (running at 88%) to Line 2 and run Saturday overtime on Line 3. That brings KC-08 back on its date and RS-22 to 1 day late.", sources: ["Production plan", "Line boards 9–10 AM", "Buyer POs"] },
    { q: "What is waiting for my signature?", a: "4 trims POs worth ₹84,017:\n• TP-2207 Sealwell seam tape: ₹38,600 (urgent, Line 2 runs out Thursday)\n• TP-2209 Ruchi zips: ₹22,120\n• TP-2214 Bharat labels: ₹13,417\n• TP-2211 Kothari snaps: ₹9,880\n\nAll four are the lowest of three quotes. With auto-approve under ₹15k, two of them would never have reached you.", sources: ["Trims & BOM", "Vendor quotes"] },
    { q: "How much money is stuck with buyers?", a: "₹39.9 L across 11 invoices. ₹8.0 L of it is over 75 days: Coastline Stores (₹4.2 L, at 108 and 75 days) and Kayal Fashions (₹2.0 L, 84 days). Vaigai has promised ₹7.4 L by cheque on 25 Oct. Reminders to 6 buyers go out at 5 PM unless you stop them.", sources: ["Tally ledgers", "Collections agent log"] },
    { q: "Why is Line 2 slow today?", a: "Two operators are absent (biometric shows 24 of 26), and both are tapers. Seam taping is the bottleneck on KC-08, so it paces the whole line: 73% for three hours straight. Line 4 has spare taping capacity at 88%.", sources: ["Biometric", "Floor tablets"] },
    { q: "How is the winter drop looking?", a: "17,500 pcs across 3 orders, shipping 28 Nov. Cutting is done for WC-31 and WC-27; SW-12 is blocked on fabric. The WC-31 zips (TP-2209) need your approval before cutting issue on Thursday.", sources: ["Shelf dates", "Production plan"] },
    { q: "Draft a message to Chinnu Kids about KC-08", a: "Draft (not sent):\n\n“Namaste Ravi ji, a quick update on KC-08 kids cape. Stitching is running behind because of a seam-tape shortage, which is now resolved. We can ship 4,200 pcs on 3 Nov as planned and the balance 600 by air on 6 Nov at our cost. Shall we go ahead? Hetal, Godavari Weaves”", sources: ["KC-08 plan", "Sealwell dispatch"] },
  ],
  run: {
    label: "Runs every 30 minutes. You can also run it now.",
    title: "Plan Watcher",
    steps: [
      { text: "Read 8 style orders and 48 milestones", result: "3 milestones overdue, 3 orders at risk" },
      { text: "Pull hourly output from 4 stitching lines", result: "Line 2 at 73%, Line 4 at 88%" },
      { text: "Check trims against the BOM for the next 10 days", result: "Seam tape short 9,820 m for KC-08" },
      { text: "Re-plan the chain for late styles", result: "KC-08 +3d, RS-22 +2d, SW-12 +6d" },
      { text: "Draft buyer updates and owner approvals", result: "2 buyer drafts, 1 PO nudge" },
    ],
    outcome: "Moving 2 tapers to Line 2 and approving TP-2207 today brings KC-08 back to its buyer date. RS-22 needs Saturday overtime on Line 3. SW-12 needs a call to Venus Fabrics.",
    actions: ["Move 2 tapers to Line 2", "Approve TP-2207 seam tape", "Schedule Saturday OT on Line 3", "Send KC-08 draft to Hetal"],
  },
};

/* ============================================================
   Desk
   ============================================================ */

const ticks = [
  { at: 4, label: "12 Oct" },
  { at: 11, label: "19 Oct" },
  { at: 18, label: "26 Oct" },
  { at: 25, label: "2 Nov" },
  { at: 32, label: "9 Nov" },
  { at: 39, label: "16 Nov" },
  { at: 46, label: "23 Nov" },
  { at: 53, label: "30 Nov" },
  { at: 60, label: "7 Dec" },
  { at: 67, label: "14 Dec" },
];
function dayLabel(d: number) {
  const date = new Date(Date.UTC(2026, 9, 8 + Math.round(d)));
  return `${date.getUTCDate()} ${date.toLocaleString("en-IN", { month: "short", timeZone: "UTC" })}`;
}

export default function TextileDesk() {
  const [styles, setStyles] = React.useState(seedStyles);
  const [pendingPOs, setPendingPOs] = React.useState(trimsPOs.length);
  const late = styles.filter((s) => STAGES.some((st) => s.state[st] === "late"));

  const setStage = React.useCallback((id: string, stage: Stage, state: MilestoneState) => {
    setStyles((cur) => cur.map((s) => (s.id === id ? { ...s, state: { ...s.state, [stage]: state } } : s)));
  }, []);

  const modules: DeskModule[] = [
    {
      id: "season",
      label: "Season",
      title: "Season at a glance",
      blurb: "Every style order against its buyer date, the floor today and what's waiting on Jignesh",
      icon: CalendarClock,
      notes: ["Each track is a style order; the blocks are its stages and the wine pin is the buyer's due date.", "A red block is late and pushes everything after it. The pill on the right shows how far past the due date it lands.", "Tick a style to mark its next stage done; the plan re-flows everywhere."],
      render: () => <SeasonOverview styles={styles} setStyles={setStyles} setStage={setStage} onPOs={setPendingPOs} />,
    },
    { id: "plan", label: "Production plan", count: late.length, title: "Production plan", blurb: "Every milestone for every style. Mark one done or late and the whole plan re-flows.", icon: ClipboardList, render: () => <TnaMatrix styles={styles} setStage={setStage} /> },
    { id: "trims", label: "Trims & BOM", count: pendingPOs, title: "Trims & BOM", blurb: "What each style consumes, what's in store and what's short", icon: Boxes, render: () => <TrimsTab onPOs={setPendingPOs} /> },
    { id: "floor", label: "Stitching floor", count: 2, title: "Stitching floor", blurb: "Four lines, hourly output, operators and the bottleneck on each", icon: Factory, render: () => <FloorTab /> },
    { id: "orders", label: "Buyer orders", count: 20, title: "Buyer orders", blurb: "Every PO, its FOB, its ex-factory date and where it stands", icon: FileSpreadsheet, render: () => <OrdersTab styles={styles} /> },
    { id: "dues", label: "Collections", count: invoices.length, title: "Collections", blurb: "Who owes what, for how long, and what they promised", icon: Receipt, render: () => <DuesTab /> },
    { id: "team", label: "People", title: "People", blurb: "Merchandisers, floor and store: who is carrying what today", icon: Users, render: () => <PeopleModule members={team} /> },
    { id: "agents", label: "Agents", title: "Agents", blurb: "Six AI agents doing the chasing, so the owner doesn't have to", icon: Timer, render: () => <AgentsModule agents={agents} /> },
    { id: "independence", label: "Independence", title: "Owner independence", blurb: "How much of Godavari runs without Jignesh in the room", icon: GaugeIcon, render: () => <IndependenceModule data={independence} /> },
    { id: "connections", label: "Connections", title: "Connections", blurb: "Tally, WhatsApp, floor tablets and the buyer portals", icon: Send, render: () => <ConnectionsModule items={integrations} /> },
  ];

  return <DeskShell config={config} modules={modules} />;
}

function SeasonOverview({
  styles,
  setStyles,
  setStage,
  onPOs,
}: {
  styles: Style[];
  setStyles: React.Dispatch<React.SetStateAction<Style[]>>;
  setStage: (id: string, stage: Stage, state: MilestoneState) => void;
  onPOs: React.Dispatch<React.SetStateAction<number>>;
}) {
  const late = styles.filter((s) => STAGES.some((st) => s.state[st] === "late"));
  const stitched = useDrift(1842, 6, 2200);
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Orders on plan" value={`${styles.length - late.length} / ${styles.length}`} delta="-1" deltaGood hint="since Friday" icon={CalendarClock} trend={[8, 8, 7, 7, 6, 6, 5, styles.length - late.length]} />
        <Stat label="Running late" value={late.length} delta="+1" deltaGood={false} hint="SW-12 fabric slipped" icon={AlertTriangle} tone="late" trend={[1, 1, 2, 2, 2, 3, 3, late.length]} />
        <Stat label="Pieces stitched today" value={Math.round(stitched).toLocaleString("en-IN")} delta="+6%" hint="target 2,960 by 8 PM" icon={Shirt} tone="ok" trend={[220, 480, 760, 1010, 1260, 1500, 1700, stitched]} />
        <Stat label="Order book this season" value={inr(styles.reduce((a, s) => a + s.qty * s.fob, 0), { compact: true })} delta="+12%" hint="vs last season" icon={IndianRupee} trend={[1.1, 1.3, 1.4, 1.6, 1.8, 1.9, 2.0, 2.1]} />
      </div>
      <Panel live title="Style calendar" sub={`${styles.length} style orders against their buyer dates · ${late.length} running late`}>
        <StyleCalendar styles={styles} setStyles={setStyles} setStage={setStage} />
      </Panel>
      <HomeExtras styles={styles} />
      <Panel icon={Boxes} title="Waiting on Jignesh" sub="Trims POs, lowest of three quotes on each. Approved POs go to Tally and the supplier on WhatsApp." action={<Pill tone="warn" mono>4 · ₹84,017</Pill>}>
        <ApprovalQueue
          items={trimsPOs.map((t) => ({ id: t.po, title: `${t.po} · ${t.item}`, sub: `${t.supplier} · ${t.qty} · ${t.need}`, amount: inr(t.amount), meta: t.style }))}
          onDecide={(_, d) => onPOs((n) => Math.max(0, n + (d ? -1 : 1)))}
        />
      </Panel>
    </div>
  );
}

/* ---------------- Home: style calendar ---------------- */

function StyleCalendar({
  styles,
  setStyles,
  setStage,
}: {
  styles: Style[];
  setStyles: React.Dispatch<React.SetStateAction<Style[]>>;
  setStage: (id: string, stage: Stage, state: MilestoneState) => void;
}) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);
  const [season, setSeason] = React.useState<"All" | Style["season"]>("All");
  const style = styles.find((s) => s.id === open) ?? null;
  const shown = styles.filter((s) => season === "All" || s.season === season);

  const rows: GanttRow[] = shown.map((s) => {
    const lateInfo = lateLabel(s);
    const slip = slipOf(s);
    const shift = lateInfo ? lateInfo.days : 0;
    const lateIdx = lateInfo ? STAGES.indexOf(lateInfo.stage) : 99;
    return {
      id: s.id,
      title: s.name,
      sub: `${s.buyer} · ${s.made ? `${s.made.toLocaleString("en-IN")} of ${s.qty.toLocaleString("en-IN")}` : `${s.qty.toLocaleString("en-IN")} pcs`}`,
      swatch: s.swatch,
      points: STAGES.map((st, i) => ({ at: s.plan[st] + (i >= lateIdx ? shift : 0), state: s.state[st] === "done" ? "done" : i === lateIdx ? "late" : "open", label: `${st} · ${dayLabel(s.plan[st])}` })),
      flag: s.buyerDate,
      slip: slip > 0 ? { from: s.buyerDate, to: s.buyerDate + slip, label: `+${slip}d` } : undefined,
      badge: lateInfo ? { at: s.plan[lateInfo.stage] + shift / 2, label: `${lateInfo.stage} ${lateInfo.days}d late` } : undefined,
    };
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented size="sm" options={["All", "NE monsoon", "Winter drop", "Corporate"] as const} value={season} onChange={setSeason} />
        <Btn size="sm" variant="solid" icon={Plus} onClick={() => setAdding(true)}>
          New style order
        </Btn>
      </div>
      <Gantt
        rows={rows}
        days={72}
        ticks={ticks}
        today={{ at: TODAY, label: "Today" }}
        markers={[
          { at: 30, label: "Monsoon shelves", tone: "info" },
          { at: 51, label: "Winter drop", tone: "info" },
        ]}
        onRow={(r) => setOpen(r.id)}
        actions={(r) => {
          const s = styles.find((x) => x.id === r.id)!;
          const next = STAGES.find((st) => s.state[st] !== "done");
          return (
            <>
              <IconBtn
                icon={CheckCheck}
                label={next ? `Mark ${next} done` : "All done"}
                onClick={() => {
                  if (!next) return;
                  setStage(s.id, next, "done");
                  toast.success(`${s.id}: ${next} done`, { description: "The plan re-flowed from today." });
                  desk.log(`${s.id} ${next} marked done`, "ok");
                }}
              />
              <IconBtn icon={CalendarClock} label="Open plan" onClick={() => setOpen(s.id)} />
            </>
          );
        }}
      />
      <div className="mt-4 flex flex-wrap items-center gap-4 text-[12px] text-d-mute">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded-full bg-d-accent" /> done
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded-full" style={{ background: "color-mix(in oklab, var(--d-accent) 16%, white)" }} /> planned
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded-full bg-d-late" /> late, pushes the rest
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-[2.5px] rounded-full bg-[var(--d-brand)]" /> buyer due date
        </span>
      </div>
      <StyleSheet style={style} onClose={() => setOpen(null)} setStage={setStage} />
      <NewStyle
        open={adding}
        onOpenChange={setAdding}
        onAdd={(s) => {
          setStyles((cur) => [...cur, s]);
          desk.log(`New style order ${s.name} for ${s.buyer}, ${s.qty.toLocaleString("en-IN")} pcs`, "info");
          toast.success("Style order added", { description: `${s.name} · planned back from ${dayLabel(s.buyerDate)}` });
        }}
      />
    </div>
  );
}

function ShelfRing({ done, total, tone }: { done: number; total: number; tone: Tone }) {
  const pct = total ? done / total : 0;
  return (
    <div className="relative h-[72px] w-[72px] shrink-0">
      <svg viewBox="0 0 72 72" className="-rotate-90">
        <circle cx="36" cy="36" r="30" fill="none" stroke="var(--d-sunk)" strokeWidth="7" />
        <circle cx="36" cy="36" r="30" fill="none" stroke={`var(--d-${tone === "accent" ? "accent" : tone})`} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${pct * 188.5} 188.5`} />
      </svg>
      <span className="tnum absolute inset-0 flex items-center justify-center font-mono text-[13px] font-semibold">{Math.round(pct * 100)}%</span>
    </div>
  );
}

function HomeExtras({ styles }: { styles: Style[] }) {
  const desk = useDesk();
  const seasons = [
    { name: "Monsoon shelves", where: "Tamil Nadu and Kerala", date: "7 Nov", inHours: 18 * 24 + 14, list: styles.filter((s) => s.season === "NE monsoon"), tone: "warn" as const },
    { name: "Winter drop", where: "North India windcheaters", date: "28 Nov", inHours: 39 * 24 + 14, list: styles.filter((s) => s.season === "Winter drop"), tone: "info" as const },
  ];
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
      <Panel icon={CalendarClock} title="Shelf dates" sub="The two dates every plan works back from">
        <div className="space-y-4">
          {seasons.map((s) => {
            const done = s.list.reduce((a, x) => a + x.made, 0);
            const total = s.list.reduce((a, x) => a + x.qty, 0);
            const atRisk = s.list.filter((x) => slipOf(x) > 0).length;
            return (
              <div key={s.name} className="flex items-center gap-4 rounded-[14px] border border-d-line p-3">
                <ShelfRing done={done} total={total} tone={s.tone} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-baseline justify-between gap-2">
                    <span className="text-[14.5px] font-semibold">{s.name}</span>
                    <span className="font-mono text-[12px] text-d-mute">{s.date}</span>
                  </p>
                  <p className="text-[12.5px] text-d-mute">
                    {s.where} · {done.toLocaleString("en-IN")} of {total.toLocaleString("en-IN")} pcs
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-[12.5px]">
                    <span className="inline-flex items-center gap-1 rounded-full bg-d-sunk px-2 py-0.5 font-medium">
                      <Timer className="h-3 w-3" /> <Countdown compact inHours={s.inHours} />
                    </span>
                    {atRisk > 0 ? (
                      <span className="inline-flex items-center gap-1 text-d-late">
                        <AlertTriangle className="h-3.5 w-3.5" /> {atRisk} at risk
                      </span>
                    ) : (
                      <span className="text-d-ok">all on plan</span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
      <Panel icon={Factory} title="Line efficiency today" sub="From the hourly boards on the floor" action={<Btn size="sm" icon={ArrowRight} onClick={() => desk.goTab("floor")}>Floor</Btn>}>
        <AreaChart
          labels={hoursLabels.map((h) => `${h}:00`)}
          series={[
            { name: "Line 2", data: lines[1].hourly, tone: "late" },
            { name: "Line 4", data: lines[3].hourly, tone: "ok" },
            { name: "Target 80%", data: hoursLabels.map(() => 80), tone: "neutral", dashed: true },
          ]}
          format={(v) => `${v}%`}
          height={170}
        />
      </Panel>
    </div>
  );
}

function StyleSheet({ style, onClose, setStage }: { style: Style | null; onClose: () => void; setStage: (id: string, stage: Stage, state: MilestoneState) => void }) {
  const desk = useDesk();
  return (
    <Sheet
      open={!!style}
      onOpenChange={(o) => !o && onClose()}
      eyebrow={style ? `${style.season} · merchandiser ${style.merchant}` : ""}
      title={style?.name ?? ""}
      sub={style ? `${style.buyer} · ${style.qty.toLocaleString("en-IN")} pcs · buyer date ${dayLabel(style.buyerDate)}` : ""}
      footer={
        <>
          <Btn
            icon={Send}
            onClick={() => {
              toast.success("TNA shared with buyer", { description: `${style?.buyer} gets a live link, no login.` });
              desk.log(`${style?.id} TNA shared with ${style?.buyer}`);
            }}
          >
            Share TNA with buyer
          </Btn>
          <Btn variant="solid" onClick={onClose}>
            Done
          </Btn>
        </>
      }
    >
      {style && (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <span className="h-16 w-16 shrink-0 rounded-[12px] ring-1 ring-black/10" style={{ background: style.swatch }} />
            <KV
              items={[
                { k: "FOB", v: inr(style.fob) },
                { k: "Order value", v: inr(style.fob * style.qty, { compact: true }) },
                { k: "Made", v: `${style.made.toLocaleString("en-IN")} pcs` },
                { k: "Slip", v: slipOf(style) ? <span className="text-d-late">+{slipOf(style)} days</span> : <span className="text-d-ok">On time</span> },
              ]}
            />
          </div>
          <Meter value={style.made} max={style.qty} />
          <div>
            <p className="mb-2 text-[12px] font-medium text-d-mute">Milestones</p>
            <ul className="space-y-1.5">
              {STAGES.map((st) => {
                const s = style.state[st];
                return (
                  <li key={st} className="flex items-center gap-3 rounded-[10px] border border-d-line px-3 py-2">
                    <span className={`h-3 w-3 rotate-45 border ${s === "done" ? "border-d-accent bg-d-accent" : s === "late" ? "border-d-late bg-d-late" : "border-d-mute bg-d-panel"}`} />
                    <span className="flex-1 text-[13.5px] font-medium">{st}</span>
                    <span className="font-mono text-[12px] text-d-mute">{dayLabel(style.plan[st])}</span>
                    <Segmented
                      size="sm"
                      options={[
                        { value: "open", label: "Plan" },
                        { value: "late", label: "Late" },
                        { value: "done", label: "Done" },
                      ]}
                      value={s}
                      onChange={(v) => {
                        setStage(style.id, st, v as MilestoneState);
                        desk.log(`${style.id} ${st} → ${v}`);
                      }}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </Sheet>
  );
}

function NewStyle({ open, onOpenChange, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (s: Style) => void }) {
  const [name, setName] = React.useState("PJ-03 printed kids poncho");
  const [buyer, setBuyer] = React.useState("Mazhai Retail");
  const [qty, setQty] = React.useState("3000");
  const [date, setDate] = React.useState("52");
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="New style order" sub="We plan the TNA backwards from the buyer date. You can move any milestone later.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const buyerDate = Number(date) || 52;
          const id = name.split(" ")[0] || `NS-${Math.floor(Math.random() * 90 + 10)}`;
          onAdd({
            id,
            name,
            buyer,
            qty: Number(qty) || 1000,
            made: 0,
            swatch: "repeating-linear-gradient(135deg,#f2b84b 0 4px,#fbe3ae 4px 9px)",
            season: buyerDate <= 35 ? "NE monsoon" : "Winter drop",
            buyerDate,
            fob: 295,
            merchant: "Hetal",
            plan: plan(buyerDate - 30, [0, 5, 6, 7, 5, 4]),
            state: states(),
          });
          onOpenChange(false);
        }}
      >
        <Field label="Style">
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Buyer">
            <select className={inputClass} value={buyer} onChange={(e) => setBuyer(e.target.value)}>
              {["Mazhai Retail", "Chinnu Kids Stores", "Northpeak Outfitters", "Kayal Fashions", "Satluj Uniform House"].map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </Field>
          <Field label="Quantity (pcs)">
            <input className={inputClass} inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))} />
          </Field>
        </div>
        <Field label="Buyer shelf date">
          <select className={inputClass} value={date} onChange={(e) => setDate(e.target.value)}>
            {[32, 39, 46, 52, 60, 66].map((d) => (
              <option key={d} value={d}>
                {dayLabel(d)}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Btn onClick={() => onOpenChange(false)}>Cancel</Btn>
          <Btn variant="solid" type="submit" icon={Plus}>
            Add and plan TNA
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- 02 TNA matrix ---------------- */

function TnaMatrix({ styles, setStage }: { styles: Style[]; setStage: (id: string, stage: Stage, state: MilestoneState) => void }) {
  const desk = useDesk();
  const [only, setOnly] = React.useState<"All" | "Late" | "This week">("All");
  const shown = styles.filter((s) => (only === "Late" ? STAGES.some((st) => s.state[st] === "late") : only === "This week" ? STAGES.some((st) => s.state[st] !== "done" && s.plan[st] <= TODAY + 7) : true));
  const cycle: Record<MilestoneState, MilestoneState> = { open: "done", done: "late", late: "open" };
  const counts = STAGES.map((st) => ({ st, done: styles.filter((s) => s.state[st] === "done").length, late: styles.filter((s) => s.state[st] === "late").length }));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { l: "Milestones done", v: styles.reduce((a, s) => a + STAGES.filter((st) => s.state[st] === "done").length, 0), t: "ok" as const },
          { l: "Overdue", v: styles.reduce((a, s) => a + STAGES.filter((st) => s.state[st] === "late").length, 0), t: "late" as const },
          { l: "Due in the next 7 days", v: styles.reduce((a, s) => a + STAGES.filter((st) => s.state[st] === "open" && s.plan[st] <= TODAY + 7 && s.plan[st] >= TODAY).length, 0), t: "warn" as const },
        ].map((x) => (
          <Stat key={x.l} label={x.l} value={x.v} tone={x.t} />
        ))}
      </div>
      <Panel title="Milestones by style" sub="Click a cell to cycle planned, done and late. Buyer-date risk updates everywhere, including the inbox." action={<Segmented size="sm" options={["All", "Late", "This week"] as const} value={only} onChange={setOnly} />}>
        <div className="desk-scroll -mx-5 overflow-x-auto px-5">
          <table className="w-full min-w-[900px] border-separate border-spacing-y-1.5 text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] text-d-mute">
                <th className="pb-1 font-medium">Style</th>
                {counts.map((c) => (
                  <th key={c.st} className="pb-1 text-center font-medium">
                    {c.st}
                    <span className="block font-mono text-[10.5px]">
                      {c.done}/{styles.length}
                      {c.late ? <span className="text-d-late"> · {c.late} late</span> : null}
                    </span>
                  </th>
                ))}
                <th className="pb-1 text-right font-medium">Buyer date</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((s) => {
                const slip = slipOf(s);
                return (
                  <tr key={s.id} className="desk-rise">
                    <td className="rounded-l-[10px] bg-d-sunk/60 py-2 pl-3 pr-3">
                      <div className="flex items-center gap-2.5">
                        <span className="h-7 w-7 shrink-0 rounded-[6px]" style={{ background: s.swatch }} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{s.name}</p>
                          <p className="truncate text-[11.5px] text-d-mute">{s.buyer}</p>
                        </div>
                      </div>
                    </td>
                    {STAGES.map((st) => {
                      const v = s.state[st];
                      const overdue = v === "open" && s.plan[st] < TODAY;
                      return (
                        <td key={st} className="bg-d-sunk/60 px-1 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setStage(s.id, st, cycle[v]);
                              desk.log(`${s.id} ${st} → ${cycle[v]}`);
                            }}
                            className="tnum inline-flex min-w-[78px] flex-col items-center rounded-[8px] border px-2 py-1 font-mono text-[11.5px] transition-transform hover:scale-105"
                            style={{
                              borderColor: v === "done" ? "var(--d-accent)" : v === "late" || overdue ? "var(--d-late)" : "var(--d-line)",
                              background: v === "done" ? "var(--d-soft)" : v === "late" ? "color-mix(in oklab, var(--d-late) 10%, var(--d-panel))" : "var(--d-panel)",
                              color: v === "late" || overdue ? "var(--d-late)" : v === "done" ? "var(--d-accent)" : "var(--d-ink)",
                            }}
                          >
                            {dayLabel(s.plan[st])}
                            <span className="text-[10px] opacity-80">{v === "done" ? "done" : v === "late" ? "late" : overdue ? "overdue" : "plan"}</span>
                          </button>
                        </td>
                      );
                    })}
                    <td className="rounded-r-[10px] bg-d-sunk/60 py-2 pr-3 text-right">
                      <p className="font-mono text-[12px]">{dayLabel(s.buyerDate)}</p>
                      {slip > 0 ? <Pill tone="late">+{slip}d</Pill> : <Pill tone="ok">on time</Pill>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Critical path" sub="Styles where any slip moves the buyer date">
          <ul className="space-y-3">
            {styles
              .filter((s) => lateLabel(s))
              .map((s) => {
                const l = lateLabel(s)!;
                return (
                  <li key={s.id} className="flex items-start gap-3 rounded-[12px] border border-d-line p-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-d-late" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-semibold">{s.name}</p>
                      <p className="text-[12.5px] text-d-mute">
                        {l.stage} {l.days} days late → ships {slipOf(s)} days after {dayLabel(s.buyerDate)}
                      </p>
                    </div>
                    <Btn size="sm" variant="soft" onClick={() => { setStage(s.id, l.stage, "done"); toast.success(`${s.id} recovered`, { description: `${l.stage} marked done, chain re-planned` }); }}>
                      Mark recovered
                    </Btn>
                  </li>
                );
              })}
          </ul>
        </Panel>
        <Panel title="Milestones due by week" sub="Planned vs done, all styles">
          <Bars
            height={190}
            data={["This wk", "Next wk", "Wk 3", "Wk 4", "Wk 5", "Wk 6"].map((label, w) => {
              const from = TODAY + w * 7 - 7;
              const to = from + 7;
              const all = styles.flatMap((s) => STAGES.filter((st) => s.plan[st] >= from && s.plan[st] < to).map((st) => s.state[st]));
              return { label, value: all.length, stack: [{ name: "Done", value: all.filter((x) => x === "done").length, tone: "accent" as const }, { name: "Late", value: all.filter((x) => x === "late").length, tone: "late" as const }, { name: "Planned", value: all.filter((x) => x === "open").length, tone: "neutral" as const }] };
            })}
          />
        </Panel>
      </div>
    </div>
  );
}

/* ---------------- 03 Trims & BOM ---------------- */

function TrimsTab({ onPOs }: { onPOs: React.Dispatch<React.SetStateAction<number>> }) {
  const desk = useDesk();
  const [style, setStyle] = React.useState<keyof typeof bom>("KC-08");
  const [raised, setRaised] = React.useState<Set<string>>(new Set());
  const rowsFor = bom[style];
  const short = rowsFor.filter((r) => r.store < r.need);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="POs waiting on owner" value="4" hint="₹84,017 · oldest 1.6 days" icon={ClipboardList} tone="warn" />
        <Stat label="Trims short, next 10 days" value="7 items" delta="+2" deltaGood={false} icon={AlertTriangle} tone="late" />
        <Stat label="In transit" value="5 lots" hint="Sealwell 9,800 m arriving 3 PM" icon={Truck} />
        <Stat label="Trims spend this season" value="₹11.8 L" delta="-4%" deltaGood={false} hint="vs plan" icon={IndianRupee} trend={[2, 3.4, 5.1, 6.8, 8.2, 9.9, 11.8]} />
      </div>
      <Panel icon={ClipboardList} title="POs waiting on Jignesh" sub="Lowest of three quotes on each. Approved POs go to Tally and to the supplier on WhatsApp." action={<Pill tone="warn" mono>4 · ₹84,017</Pill>}>
        <ApprovalQueue
          items={trimsPOs.map((t) => ({ id: t.po, title: `${t.po} · ${t.item}`, sub: `${t.supplier} · ${t.qty} · ${t.need}`, amount: inr(t.amount), meta: t.style }))}
          onDecide={(_, d) => onPOs((n) => Math.max(0, n + (d ? -1 : 1)))}
        />
      </Panel>
      <Panel
        title="Bill of materials"
        sub="Per-piece consumption × order quantity against what the store holds"
        action={<Segmented size="sm" options={Object.keys(bom) as (keyof typeof bom)[]} value={style} onChange={setStyle} />}
      >
        <DataTable
          rows={rowsFor}
          rowKey={(r) => r.item}
          columns={[
            { key: "item", label: "Item", render: (r) => <span className="font-medium">{r.item}</span>, sort: (r) => r.item },
            { key: "supplier", label: "Supplier", render: (r) => <span className="text-d-mute">{r.supplier}</span>, wide: true },
            { key: "per", label: "Per piece", render: (r) => <span className="font-mono text-[12px]">{r.perPc}</span> },
            { key: "need", label: "Needed", align: "right", render: (r) => <span className="tnum font-mono">{r.need.toLocaleString("en-IN")} {r.unit}</span>, sort: (r) => r.need },
            { key: "store", label: "In store", align: "right", render: (r) => <span className="tnum font-mono">{r.store.toLocaleString("en-IN")}</span>, sort: (r) => r.store },
            {
              key: "cover",
              label: "Cover",
              render: (r) => (
                <div className="flex min-w-[120px] items-center gap-2">
                  <Meter value={Math.min(r.store, r.need)} max={r.need} tone={r.store >= r.need ? "ok" : r.store / r.need > 0.6 ? "warn" : "late"} />
                  <span className="font-mono text-[11px] text-d-mute">{Math.round(Math.min(1, r.store / r.need) * 100)}%</span>
                </div>
              ),
              sort: (r) => r.store / r.need,
            },
            {
              key: "act",
              label: "",
              align: "right",
              render: (r) =>
                r.store >= r.need ? (
                  <Pill tone="ok">Covered</Pill>
                ) : raised.has(`${style}-${r.item}`) ? (
                  <Pill tone="info">PO drafted</Pill>
                ) : (
                  <Btn
                    size="sm"
                    variant="soft"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRaised((s) => new Set(s).add(`${style}-${r.item}`));
                      onPOs((n) => n + 1);
                      toast.success("PO drafted for approval", { description: `${(r.need - r.store).toLocaleString("en-IN")} ${r.unit} of ${r.item} from ${r.supplier}` });
                      desk.log(`Trims Buyer drafted PO: ${r.item} for ${style}`);
                    }}
                  >
                    Raise PO for {(r.need - r.store).toLocaleString("en-IN")}
                  </Btn>
                ),
            },
          ]}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <Panel title={`Shortfall on ${style}`} sub={short.length ? `${short.length} items below what cutting needs` : "Everything is covered"}>
          <HBars data={short.map((r) => ({ label: r.item, value: r.need - r.store, sub: r.unit, tone: r.store / r.need < 0.5 ? "late" : "warn" }))} />
        </Panel>
        <Panel title="Supplier dispatches" sub="Read from WhatsApp and transporter LRs">
          <ul className="divide-y divide-d-line">
            {[
              { s: "Sealwell Tapes", i: "Seam tape 22mm · 9,800 m", eta: "Today 3 PM", t: "ok" as const, st: "Out for delivery" },
              { s: "Venus Fabrics", i: "Nylon taslan 228T · 4,200 m", eta: "Thu", t: "warn" as const, st: "Dyeing" },
              { s: "Lumo Trims", i: "Reflective piping · 1,000 m", eta: "Wed", t: "info" as const, st: "Dispatched" },
              { s: "Prakash Pack", i: "Poly bags + header · 3,600", eta: "Fri", t: "neutral" as const, st: "Printing" },
              { s: "Kothari Snaps", i: "Press buttons 15mm · 6,000", eta: "Awaiting PO", t: "late" as const, st: "Blocked" },
            ].map((d) => (
              <li key={d.s} className="flex items-center gap-3 py-2.5">
                <PackageCheck className="h-4 w-4 text-d-mute" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-medium">{d.s}</p>
                  <p className="truncate text-[12px] text-d-mute">{d.i}</p>
                </div>
                <span className="font-mono text-[12px] text-d-mute">{d.eta}</span>
                <Pill tone={d.t}>{d.st}</Pill>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

/* ---------------- 04 Floor ---------------- */

function FloorTab() {
  const desk = useDesk();
  const [moved, setMoved] = React.useState<string | null>(null);
  const l1 = useDrift(118, 2, 1800);
  const l2 = useDrift(80, 2, 2000);
  const l3 = useDrift(58, 2, 2100);
  const l4 = useDrift(53, 1.5, 1900);
  const live = [l1, l2, l3, l4];
  const data = lines.map((l) => (moved && l.id === "L2" ? { ...l, present: 26, eff: 81 } : moved && l.id === "L4" ? { ...l, present: 20, eff: 85 } : l)).map((l, i) => ({ ...l, out: Math.round(live[i] * (moved && l.id === "L2" ? 1.1 : 1)) }));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Operators present" value={`${data.reduce((a, l) => a + l.present, 0)} / ${data.reduce((a, l) => a + l.ops, 0)}`} hint="3 absent, 2 on Line 2" icon={Users} />
        <Stat label="Floor efficiency now" value={`${Math.round(data.reduce((a, l) => a + l.eff, 0) / 4)}%`} delta="+2%" hint="vs yesterday" icon={GaugeIcon} tone="ok" trend={lines[0].hourly} />
        <Stat label="DHU (defects per 100)" value="3.2" delta="-0.6" deltaGood={false} hint="target under 3.5" icon={CheckCheck} />
        <Stat label="WIP on floor" value="6,140 pcs" hint="1.9 days of stitching" icon={Boxes} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.map((l) => (
          <article key={l.id} className="desk-card desk-rise overflow-hidden">
            <div className="desk-belt h-2" />
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[16px] font-semibold">{l.name}</p>
                  <p className="text-[12.5px] text-d-mute">{seedStyles.find((s) => s.id === l.style)?.name}</p>
                </div>
                <Pill tone={l.eff >= 80 ? "ok" : l.eff >= 72 ? "warn" : "late"} mono>
                  {l.eff}%
                </Pill>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11.5px] text-d-mute">Output this hour</p>
                  <p className="tnum font-mono text-[24px] font-semibold">
                    {l.out}
                    <span className="text-[13px] text-d-mute"> / {l.target}</span>
                  </p>
                </div>
                <div>
                  <p className="text-[11.5px] text-d-mute">Operators</p>
                  <p className="tnum font-mono text-[24px] font-semibold">
                    {l.present}
                    <span className="text-[13px] text-d-mute"> / {l.ops}</span>
                  </p>
                </div>
              </div>
              <Meter value={l.out} max={l.target} tone={l.out / l.target >= 0.8 ? "ok" : "warn"} className="mt-3" />
              <p className="mt-3 text-[12.5px]">
                <span className="text-d-mute">Bottleneck:</span> <b>{l.bottleneck}</b>
              </p>
              <div className="mt-3 flex h-10 items-end gap-[3px]">
                {l.hourly.map((h, i) => (
                  <span key={i} className="desk-grow flex-1 rounded-t-[2px]" style={{ height: `${h}%`, background: h >= 80 ? "var(--d-ok)" : h >= 72 ? "var(--d-warn)" : "var(--d-late)", opacity: 0.8, animationDelay: `${i * 30}ms` }} />
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Efficiency by line and hour" sub="Hover a cell. Under 72% is where the line stops paying for itself.">
          <HeatGrid rows={lines.map((l) => l.name)} cols={hoursLabels} values={lines.map((l) => l.hourly)} format={(v) => `${v}`} onCell={(r, c) => toast(`${lines[r].name} at ${hoursLabels[c]}:00`, { description: `${lines[r].hourly[c]}% efficiency · bottleneck ${lines[r].bottleneck}` })} />
        </Panel>
        <Panel title="Today's defects" sub="From QC inline audits, 1,240 pieces checked">
          <Donut
            center="3.2"
            sub="DHU"
            segments={[
              { label: "Open seam", value: 14, tone: "late" },
              { label: "Tape lifting", value: 9, tone: "warn" },
              { label: "Uneven hem", value: 7, tone: "info" },
              { label: "Snap misaligned", value: 6, tone: "accent" },
              { label: "Stain / mark", value: 4, tone: "neutral" },
            ]}
          />
        </Panel>
      </div>
      <Panel title="Suggested move" sub="Line Watcher found spare taping capacity" live>
        <div className="flex flex-wrap items-center gap-4">
          <p className="min-w-[260px] flex-1 text-[14px] leading-relaxed">
            Move <b>2 tapers from Line 4</b> (88%, ahead of plan) to <b>Line 2</b> (73%, short 2). Expected: Line 2 to ~81%, KC-08 back on its buyer date, Line 4 drops to ~85%.
          </p>
          {moved ? (
            <Pill tone="ok">Moved at {moved}</Pill>
          ) : (
            <Btn
              variant="solid"
              onClick={() => {
                setMoved(new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }));
                toast.success("2 tapers moved to Line 2", { description: "Ramesh notified on WhatsApp." });
                desk.log("2 tapers moved from Line 4 to Line 2");
              }}
            >
              Move operators
            </Btn>
          )}
        </div>
      </Panel>
    </div>
  );
}

/* ---------------- 05 Buyer orders ---------------- */

type PO = { no: string; buyer: string; style: string; qty: number; fob: number; exf: string; status: "Cutting" | "Stitching" | "Finishing" | "Fabric awaited" | "Shipped" | "Booked"; merchant: string; port: string };

function OrdersTab({ styles }: { styles: Style[] }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<PO | null>(null);
  const statusFor = (s: Style): PO["status"] => (s.state["Fabric in"] !== "done" ? "Fabric awaited" : s.state.Cut !== "done" ? "Cutting" : s.state.Stitch !== "done" ? "Stitching" : "Finishing");
  const pos: PO[] = [
    ...styles.flatMap((s, i) => {
      const splits = s.qty > 5000 ? 3 : s.qty > 3000 ? 2 : 1;
      return Array.from({ length: splits }, (_, k) => ({
        no: `PO-${4410 + i * 3 + k}`,
        buyer: s.buyer,
        style: s.name,
        qty: Math.round(s.qty / splits),
        fob: s.fob,
        exf: dayLabel(s.buyerDate - 4 + k),
        status: statusFor(s),
        merchant: s.merchant,
        port: k === 0 ? "Road, Chennai DC" : "Road, Kochi DC",
      }));
    }),
    { no: "PO-4392", buyer: "Coastline Stores", style: "RP-09 poncho repeat", qty: 2400, fob: 298, exf: "14 Oct", status: "Shipped", merchant: "Hetal", port: "Road, Mangaluru" },
    { no: "PO-4388", buyer: "Mazhai Retail", style: "RP-12 poncho print", qty: 3100, fob: 305, exf: "9 Oct", status: "Shipped", merchant: "Hetal", port: "Road, Chennai DC" },
  ];
  const value = pos.reduce((a, p) => a + p.qty * p.fob, 0);
  const tone: Record<PO["status"], Tone> = { Shipped: "ok", Finishing: "info", Stitching: "accent", Cutting: "warn", "Fabric awaited": "late", Booked: "neutral" };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open POs" value={pos.filter((p) => p.status !== "Shipped").length} hint="9 buyers" icon={FileSpreadsheet} />
        <Stat label="Order value" value={inr(value, { compact: true })} delta="+12%" icon={IndianRupee} trend={[1.4, 1.5, 1.7, 1.8, 1.9, 2.1, 2.2]} />
        <Stat label="Average FOB" value={inr(Math.round(value / pos.reduce((a, p) => a + p.qty, 0)))} delta="+₹21" hint="mix moved to suits" icon={Receipt} />
        <Stat label="Shipped this month" value="5,500 pcs" hint="2 POs, both on time" icon={Truck} tone="ok" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Panel title="Purchase orders" sub="Click a row for the PO, its TNA and the documents">
          <DataTable
            rows={pos}
            rowKey={(p) => p.no}
            search={(p) => `${p.no} ${p.buyer} ${p.style}`}
            searchPlaceholder="Search PO, buyer or style"
            filter={{ get: (p) => p.status, options: ["Fabric awaited", "Cutting", "Stitching", "Finishing", "Shipped"] }}
            onRow={setOpen}
            bulk={[{ label: "Send status to buyers", run: (k) => { toast.success(`Status sent for ${k.length} POs`); desk.log(`Status update sent for ${k.length} POs`); } }]}
            columns={[
              { key: "no", label: "PO", render: (p) => <span className="font-mono text-[12.5px] font-medium">{p.no}</span>, sort: (p) => p.no },
              { key: "buyer", label: "Buyer", render: (p) => p.buyer, sort: (p) => p.buyer },
              { key: "style", label: "Style", render: (p) => <span className="text-d-mute">{p.style}</span>, wide: true },
              { key: "qty", label: "Qty", align: "right", render: (p) => <span className="tnum font-mono">{p.qty.toLocaleString("en-IN")}</span>, sort: (p) => p.qty },
              { key: "val", label: "Value", align: "right", render: (p) => <span className="tnum font-mono">{inr(p.qty * p.fob, { compact: true })}</span>, sort: (p) => p.qty * p.fob },
              { key: "exf", label: "Ex-factory", render: (p) => <span className="font-mono text-[12px]">{p.exf}</span> },
              { key: "st", label: "Status", render: (p) => <Pill tone={tone[p.status]}>{p.status}</Pill> },
            ]}
          />
        </Panel>
        <Panel title="By buyer" sub="Open order value">
          <HBars
            format={(v) => inr(v, { compact: true })}
            data={Object.entries(
              pos.filter((p) => p.status !== "Shipped").reduce<Record<string, number>>((acc, p) => {
                acc[p.buyer] = (acc[p.buyer] ?? 0) + p.qty * p.fob;
                return acc;
              }, {}),
            )
              .sort((a, b) => b[1] - a[1])
              .map(([label, value]) => ({ label, value }))}
          />
        </Panel>
      </div>
      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={open?.no}
        title={open?.style ?? ""}
        sub={open ? `${open.buyer} · merchandiser ${open.merchant}` : ""}
        footer={
          <>
            <Btn icon={Send} onClick={() => toast.success("Packing list sent", { description: open?.buyer })}>
              Packing list
            </Btn>
            <Btn variant="solid" onClick={() => setOpen(null)}>
              Done
            </Btn>
          </>
        }
      >
        {open && (
          <div className="space-y-5">
            <KV
              items={[
                { k: "Quantity", v: `${open.qty.toLocaleString("en-IN")} pcs` },
                { k: "FOB", v: inr(open.fob) },
                { k: "Value", v: inr(open.qty * open.fob) },
                { k: "Ex-factory", v: open.exf },
                { k: "Ship mode", v: open.port },
                { k: "Status", v: <Pill tone={tone[open.status]}>{open.status}</Pill> },
              ]}
            />
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Size break-up</p>
              <Bars height={120} data={["XS", "S", "M", "L", "XL", "XXL"].map((s, i) => ({ label: s, value: Math.round(open.qty * [0.08, 0.18, 0.27, 0.24, 0.15, 0.08][i]) }))} />
            </div>
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Documents</p>
              <ul className="space-y-1.5 text-[13px]">
                {["Buyer PO (PDF)", "Tech pack rev 3", "Approved PP sample photos", "Shade band", "Inline inspection report"].map((d) => (
                  <li key={d} className="flex items-center justify-between rounded-[10px] border border-d-line px-3 py-2">
                    {d}
                    <span className="font-mono text-[11px] text-d-mute">synced from Gmail</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- 06 Buyer dues ---------------- */

function DuesTab() {
  const desk = useDesk();
  const [reminder, setReminder] = React.useState<Invoice | null>(null);
  const [sent, setSent] = React.useState<Set<string>>(new Set());
  const total = invoices.reduce((a, i) => a + i.amount, 0);
  const bucket = (d: number) => (d <= 30 ? "0-30 days" : d <= 60 ? "31-60 days" : d <= 90 ? "61-90 days" : "90+ days");
  const buckets = ["0-30 days", "31-60 days", "61-90 days", "90+ days"].map((label, i) => ({ label, value: invoices.filter((x) => bucket(x.days) === label).reduce((a, x) => a + x.amount, 0), tone: (["ok", "info", "warn", "late"] as const)[i] }));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Outstanding" value={inr(total, { compact: true })} delta="-7%" deltaGood={false} hint="vs last month" icon={IndianRupee} trend={[46, 44, 45, 43, 42, 41, 40]} tone="warn" />
        <Stat label="Over 60 days" value={inr(invoices.filter((i) => i.days > 60).reduce((a, i) => a + i.amount, 0), { compact: true })} hint={`${invoices.filter((i) => i.days > 60).length} invoices`} icon={AlertTriangle} tone="late" />
        <Stat label="Promised this week" value="₹12.3 L" hint="Vaigai cheque, Mazhai after GRN" icon={CalendarClock} tone="ok" />
        <Stat label="Average days to collect" value="54" delta="+6" deltaGood={false} hint="terms average 42" icon={Timer} />
      </div>
      <Panel title="Ageing" sub="Buyer-wise, from Tally. Reminders go out at 5 PM unless you stop them.">
        <AgingBar buckets={buckets} format={(v) => inr(v, { compact: true })} />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Panel title="Invoices" sub="Select rows to send reminders in one go">
          <DataTable
            rows={invoices}
            rowKey={(i) => i.no}
            search={(i) => `${i.no} ${i.buyer} ${i.style}`}
            searchPlaceholder="Search invoice or buyer"
            filter={{ get: (i) => bucket(i.days), options: ["0-30 days", "31-60 days", "61-90 days", "90+ days"] }}
            onRow={setReminder}
            bulk={[{ label: "Send WhatsApp reminders", run: (keys) => { setSent((s) => new Set([...s, ...keys])); toast.success(`${keys.length} reminders sent`); desk.log(`${keys.length} dues reminders sent on WhatsApp`); } }]}
            columns={[
              { key: "no", label: "Invoice", render: (i) => <span className="font-mono text-[12px]">{i.no}</span> },
              { key: "buyer", label: "Buyer", render: (i) => <span className="font-medium">{i.buyer}</span>, sort: (i) => i.buyer },
              { key: "style", label: "For", render: (i) => <span className="text-d-mute">{i.style}</span>, wide: true },
              { key: "amt", label: "Amount", align: "right", render: (i) => <span className="tnum font-mono">{inr(i.amount)}</span>, sort: (i) => i.amount },
              { key: "days", label: "Days", align: "right", render: (i) => <span className="tnum font-mono" style={{ color: i.days > 90 ? "var(--d-late)" : i.days > 60 ? "var(--d-warn)" : undefined }}>{i.days}</span>, sort: (i) => i.days },
              { key: "promise", label: "Promise", render: (i) => (sent.has(i.no) ? <Pill tone="info">Reminded</Pill> : i.promise ? <Pill tone="ok">{i.promise}</Pill> : <span className="text-d-mute">—</span>) },
            ]}
          />
        </Panel>
        <Panel title="Collections forecast" sub="Promises + typical buyer behaviour">
          <Bars height={200} format={(v) => `₹${v}L`} data={[{ label: "This wk", value: 12.3, tone: "ok" }, { label: "Next wk", value: 8.6, tone: "accent" }, { label: "Wk 3", value: 6.2, tone: "accent" }, { label: "Wk 4", value: 4.9, tone: "info" }, { label: "Later", value: 7.9, tone: "late" }]} />
        </Panel>
      </div>
      <Sheet
        open={!!reminder}
        onOpenChange={(o) => !o && setReminder(null)}
        eyebrow={reminder?.no}
        title={reminder?.buyer ?? ""}
        sub={reminder ? `${inr(reminder.amount)} · ${reminder.days} days · terms ${reminder.terms}` : ""}
        footer={
          <Btn
            variant="solid"
            icon={MessageCircle}
            onClick={() => {
              if (!reminder) return;
              setSent((s) => new Set(s).add(reminder.no));
              toast.success("Reminder sent on WhatsApp", { description: reminder.buyer });
              desk.log(`Reminder sent to ${reminder.buyer} for ${inr(reminder.amount)}`);
              setReminder(null);
            }}
          >
            Send on WhatsApp
          </Btn>
        }
      >
        {reminder && (
          <div className="space-y-4">
            <div className="rounded-[14px] bg-[#e7f6e9] p-4 text-[13.5px] leading-relaxed text-[#1d3b22]">
              Namaste, a gentle reminder from Godavari Weaves. Invoice {reminder.no} for {reminder.style}, {inr(reminder.amount)}, raised on {reminder.raised}, is {reminder.days} days old against {reminder.terms} terms. UPI and bank details below. Thank you for the business. — Priya, Accounts
            </div>
            <KV items={[{ k: "Raised", v: reminder.raised }, { k: "Terms", v: reminder.terms }, { k: "Last promise", v: reminder.promise ?? "None" }, { k: "Previous reminders", v: reminder.days > 60 ? "3" : "1" }]} />
          </div>
        )}
      </Sheet>
    </div>
  );
}
