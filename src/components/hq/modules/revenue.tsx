"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowUpRight, BellRing, Copy, Download, FileText, IndianRupee, Mail, MessageCircle, Receipt, Send, Sparkles, Target } from "lucide-react";
import {
  AgentNote,
  AgingBar,
  AIMark,
  AreaChart,
  Btn,
  DataTable,
  Gauge,
  KV,
  Meter,
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
  rupees,
  type Column,
} from "../kit";
import { useHQ } from "../store";
import { clientBuilds, personById, programById, salesTeam } from "../data";
import { hqHref } from "../nav";
import type { ClientBuild, Lead, LeadStage, ProgramId } from "../types";
import type { Tone } from "../../desk/types";

/* ============================================================
   Local data. Today is Tue 20 Oct 2026; month target ₹60 L.
   ============================================================ */

function h(n: number, salt = 7) {
  let t = Math.imul(n + 1, 0x9e3779b1) ^ Math.imul(salt + 3, 0x85ebca6b);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const TARGET = 6000000;
const FORECAST = 5480000;
const DAYS_LEFT = 11;
const RUN_RATE = 81000;

const MONTHS: [string, number][] = [["Apr", 30], ["May", 31], ["Jun", 30], ["Jul", 31], ["Aug", 31], ["Sep", 30], ["Oct", 20]];
const allDays = MONTHS.flatMap(([m, n], mi) => Array.from({ length: n }, (_, d) => ({ label: `${d + 1} ${m}`, month: m, day: d + 1, mi })));
const DAYS = allDays.slice(-180);
// Workshop day-2 dates; bookings spike for six days after each one.
const batchEnds = ["28 Apr", "27 May", "24 Jun", "22 Jul", "19 Aug", "16 Sep", "14 Oct"];
const batchIdx = batchEnds.map((l) => DAYS.findIndex((d) => d.label === l)).filter((i) => i >= 0);
// 1 Jan 2026 was a Thursday; day-of-year gives the weekday without Date.
function weekday(mi: number, day: number) {
  const before = 31 + 28 + 31 + MONTHS.slice(0, mi).reduce((a, [, n], i) => a + (i === 6 ? 31 : n), 0);
  return (before + day - 1 + 4) % 7; // 0 = Sunday
}
const rawBooked = DAYS.map((d, i) => {
  const sunday = weekday(d.mi, d.day) === 0;
  const base = (62000 + h(i, 11) * 92000) * (sunday ? 0.3 : 1);
  const spike = batchIdx.reduce((acc, b) => {
    const k = i - b;
    return k >= 1 && k <= 6 ? acc + 560000 * Math.pow(0.58, k - 1) : acc;
  }, 0);
  return base + spike + i * 260;
});
const octStart = DAYS.findIndex((d) => d.label === "1 Oct");
const rawOct = rawBooked.slice(octStart).reduce((a, b) => a + b, 0);
const BOOKED_MTD = 4130000;
const booked = rawBooked.map((v) => Math.round((v * BOOKED_MTD) / rawOct / 100) * 100);
const collected = booked.map((v, i) => {
  const prior = booked.slice(Math.max(0, i - 30), i);
  const avg = prior.length ? prior.reduce((a, b) => a + b, 0) / prior.length : v;
  return Math.round((v * 0.64 + avg * 0.26 * (0.85 + h(i, 12) * 0.3)) / 100) * 100;
});

type Range = "7D" | "MTD" | "30D" | "90D";
const RANGE_LEN: Record<Range, number> = { "7D": 7, MTD: DAYS.length - octStart, "30D": 30, "90D": 90 };
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

// Month-to-date by program; other ranges scale from this mix.
const PROGRAM_MTD: { id: ProgramId; amount: number; units: number }[] = [
  { id: "accelerator", amount: 1049986, units: 14 },
  { id: "dfy", amount: 1141366, units: 3 },
  { id: "systems", amount: 899994, units: 6 },
  { id: "agents", amount: 749997, units: 3 },
  { id: "launchpad", amount: 224991, units: 9 },
  { id: "workshop", amount: 63666, units: 1248 },
];
const ADVISOR_MTD: Record<string, { amount: number; deals: number }> = {
  rohan: { amount: 1262000, deals: 9 },
  sneha: { amount: 1184000, deals: 11 },
  arjun: { amount: 641000, deals: 6 },
  kavya: { amount: 428000, deals: 5 },
  imran: { amount: 187000, deals: 4 },
};
const DIRECT_MTD = 428000;

/* EMI and instalment schedule */
type Instalment = {
  id: string;
  name: string;
  business: string;
  city: string;
  program: ProgramId;
  n: number;
  of: number;
  amount: number;
  /** days until due; negative = overdue */
  dueIn: number;
  via: "Razorpay EMI link" | "UPI Autopay" | "Bajaj Finserv" | "NACH mandate";
  owner: string;
  lastReminder?: string;
};
const seedInstalments: Instalment[] = [
  { id: "EMI-7741", name: "Harish Patel", business: "Nandini Textiles", city: "Surat", program: "accelerator", n: 2, of: 3, amount: 25000, dueIn: -38, via: "Razorpay EMI link", owner: "sneha", lastReminder: "12 Oct" },
  { id: "EMI-7746", name: "Meenakshi Reddy", business: "LifeLine Diagnostics", city: "Hyderabad", program: "systems", n: 2, of: 3, amount: 50000, dueIn: -24, via: "NACH mandate", owner: "rohan", lastReminder: "16 Oct" },
  { id: "EMI-7752", name: "Gaurav Jain", business: "Om Engineering", city: "Rajkot", program: "accelerator", n: 3, of: 3, amount: 25000, dueIn: -19, via: "UPI Autopay", owner: "arjun" },
  { id: "EMI-7758", name: "Swati Kulkarni", business: "Excel Coaching", city: "Pune", program: "launchpad", n: 2, of: 2, amount: 12500, dueIn: -11, via: "Razorpay EMI link", owner: "kavya", lastReminder: "15 Oct" },
  { id: "EMI-7763", name: "Ashok Goyal", business: "Royal Traders", city: "Jaipur", program: "agents", n: 2, of: 4, amount: 62500, dueIn: -8, via: "NACH mandate", owner: "rohan" },
  { id: "EMI-7769", name: "Rekha Saxena", business: "Kitchen Kart", city: "Lucknow", program: "accelerator", n: 2, of: 3, amount: 25000, dueIn: -6, via: "UPI Autopay", owner: "sneha" },
  { id: "EMI-7771", name: "Tarun Khanna", business: "Swift Logistics", city: "Delhi", program: "systems", n: 3, of: 3, amount: 50000, dueIn: -3, via: "Razorpay EMI link", owner: "arjun" },
  { id: "EMI-7774", name: "Divya Menon", business: "Hotel Green Park", city: "Kochi", program: "accelerator", n: 2, of: 3, amount: 25000, dueIn: -2, via: "Bajaj Finserv", owner: "kavya" },
  { id: "EMI-7780", name: "Prakash Bhatt", business: "Ganesh Agencies", city: "Ahmedabad", program: "systems", n: 2, of: 3, amount: 50000, dueIn: 2, via: "NACH mandate", owner: "rohan" },
  { id: "EMI-7782", name: "Neelam Chopra", business: "Fashion Hub", city: "Ludhiana", program: "accelerator", n: 3, of: 3, amount: 25000, dueIn: 4, via: "UPI Autopay", owner: "sneha" },
  { id: "EMI-7785", name: "Vivek Shetty", business: "Pixel Media", city: "Bengaluru", program: "launchpad", n: 2, of: 2, amount: 12500, dueIn: 6, via: "Razorpay EMI link", owner: "imran" },
  { id: "EMI-7790", name: "Bhavna Desai", business: "Shree Fabrics", city: "Surat", program: "agents", n: 3, of: 4, amount: 62500, dueIn: 9, via: "NACH mandate", owner: "rohan" },
  { id: "EMI-7794", name: "Mahesh Naidu", business: "Sai Polymers", city: "Chennai", program: "accelerator", n: 2, of: 3, amount: 25000, dueIn: 12, via: "Bajaj Finserv", owner: "arjun" },
  { id: "EMI-7799", name: "Lata Agarwal", business: "Balaji Distributors", city: "Nagpur", program: "systems", n: 2, of: 3, amount: 50000, dueIn: 14, via: "UPI Autopay", owner: "sneha" },
  { id: "EMI-7802", name: "Sanjay Rathi", business: "Unique Castings", city: "Indore", program: "accelerator", n: 2, of: 3, amount: 25000, dueIn: 21, via: "Razorpay EMI link", owner: "kavya" },
  { id: "EMI-7806", name: "Ritu Pandey", business: "Vidya Learning", city: "Lucknow", program: "launchpad", n: 2, of: 2, amount: 12500, dueIn: 26, via: "UPI Autopay", owner: "imran" },
];

/* Razorpay payments */
type Payment = {
  id: string;
  at: string;
  name: string;
  business: string;
  city: string;
  gstin?: string;
  program: ProgramId;
  amount: number;
  method: "UPI" | "Card" | "Netbanking" | "EMI" | "NACH";
  status: "Captured" | "Settled" | "Refunded" | "Failed";
  invoice: string;
  note: string;
  by: string;
};
const payments: Payment[] = [
  { id: "pay_PqK7wN2xLmR4tA", at: "Today, 9:48 AM", name: "Sunita Bansal", business: "Laxmi Garments", city: "Surat", gstin: "24AAHFL6612M1ZQ", program: "accelerator", amount: 74999, method: "UPI", status: "Captured", invoice: "BB/26-27/1184", note: "Paid in full after day-2 Q&A", by: "sneha" },
  { id: "pay_PqJ3vB8sYtE1kD", at: "Today, 9:12 AM", name: "Prakash Bhatt", business: "Ganesh Agencies", city: "Ahmedabad", gstin: "24AABFG3390R1Z8", program: "systems", amount: 50000, method: "NACH", status: "Captured", invoice: "BB/26-27/1183", note: "Instalment 1 of 3", by: "rohan" },
  { id: "pay_PqHx2dQ9mWc6nF", at: "Yesterday, 7:41 PM", name: "Kiran Malhotra", business: "Urban Nest Builders", city: "Delhi", gstin: "07AAICU2287P1ZK", program: "dfy", amount: 114000, method: "Netbanking", status: "Settled", invoice: "BB/26-27/1182", note: "30% advance, custom command center", by: "rohan" },
  { id: "pay_PqGr5kT1aZv8pH", at: "Yesterday, 6:05 PM", name: "Deepak Sinha", business: "Mobile World", city: "Mumbai", program: "launchpad", amount: 24999, method: "Card", status: "Settled", invoice: "BB/26-27/1181", note: "Workshop attendee, Batch 14", by: "kavya" },
  { id: "pay_PqF9cM4hJb2sLq", at: "Yesterday, 3:22 PM", name: "Anita Shetty", business: "Care Dental Clinic", city: "Pune", gstin: "27AAPFC1180D1Z2", program: "agents", amount: 249999, method: "Netbanking", status: "Settled", invoice: "BB/26-27/1180", note: "Agent Factory, paid in full", by: "sneha" },
  { id: "pay_PqE6yR7nGd3vWx", at: "Yesterday, 1:10 PM", name: "Manoj Kulkarni", business: "Precision Auto Parts", city: "Ludhiana", gstin: "03AAFCP7741E1ZM", program: "dfy", amount: 156000, method: "Netbanking", status: "Settled", invoice: "BB/26-27/1179", note: "Milestone 1 of 4", by: "rohan" },
  { id: "pay_PqD2tW5pKs9fYe", at: "Yesterday, 11:46 AM", name: "Pooja Agarwal", business: "Kaveri Weaves", city: "Surat", program: "accelerator", amount: 25000, method: "EMI", status: "Settled", invoice: "BB/26-27/1178", note: "EMI 1 of 3 via Razorpay", by: "arjun" },
  { id: "pay_PqC8uE1zNq4hBr", at: "18 Oct, 8:30 PM", name: "Nitin Reddy", business: "Swift Logistics", city: "Hyderabad", program: "accelerator", amount: 74999, method: "UPI", status: "Refunded", invoice: "BB/26-27/1177", note: "Refund within 7-day window; joined wrong program", by: "arjun" },
  { id: "pay_PqB4sF6xHj1mKt", at: "18 Oct, 5:15 PM", name: "Geeta Patel", business: "Shubh Jewellers", city: "Rajkot", gstin: "24AAGFS8813K1ZT", program: "systems", amount: 149999, method: "Netbanking", status: "Settled", invoice: "BB/26-27/1176", note: "Paid in full", by: "rohan" },
  { id: "pay_PqA1rG3wLc7nVu", at: "17 Oct, 9:02 PM", name: "Alok Menon", business: "Annapurna Caterers", city: "Kochi", program: "launchpad", amount: 24999, method: "UPI", status: "Settled", invoice: "BB/26-27/1175", note: "Workshop attendee, Batch 14", by: "imran" },
  { id: "pay_Pq9yH8vMk2pQwS", at: "17 Oct, 4:44 PM", name: "Shalini Gill", business: "Bright Minds Academy", city: "Chandigarh", program: "accelerator", amount: 74999, method: "Card", status: "Failed", invoice: "-", note: "Card declined (bank OTP timeout); retry link sent", by: "kavya" },
  { id: "pay_Pq8wJ5tNb6rXyZ", at: "17 Oct, 12:20 PM", name: "Ramesh Jain", business: "Om Engineering", city: "Rajkot", gstin: "24AACFO5521B1ZD", program: "agents", amount: 62500, method: "NACH", status: "Settled", invoice: "BB/26-27/1174", note: "Instalment 1 of 4", by: "rohan" },
  { id: "pay_Pq7vK1sPc9tAeY", at: "16 Oct, 7:58 PM", name: "Payal Desai", business: "Prime Interiors", city: "Mumbai", program: "accelerator", amount: 74999, method: "UPI", status: "Settled", invoice: "BB/26-27/1173", note: "Paid in full", by: "sneha" },
  { id: "pay_Pq6tL7rQd3uBfX", at: "16 Oct, 2:31 PM", name: "Suresh Naidu", business: "Royal Traders", city: "Chennai", program: "systems", amount: 50000, method: "EMI", status: "Settled", invoice: "BB/26-27/1172", note: "EMI 1 of 3 via Bajaj Finserv", by: "arjun" },
  { id: "pay_Pq4rN9pSg2wDhV", at: "15 Oct, 9:40 PM", name: "Vivek Saxena", business: "Sanjeevani Hospital", city: "Lucknow", gstin: "09AAQFS4410H1ZB", program: "systems", amount: 149999, method: "Card", status: "Settled", invoice: "BB/26-27/1171", note: "HDFC credit card EMI, 6 months (no-cost)", by: "sneha" },
  { id: "pay_Pq3qP5nTh7xEjU", at: "15 Oct, 6:12 PM", name: "Rajesh Goyal", business: "Surya Enterprises", city: "Indore", program: "accelerator", amount: 74999, method: "EMI", status: "Settled", invoice: "BB/26-27/1170", note: "Bajaj Finserv 0% EMI, 3 months", by: "kavya" },
  { id: "pay_Pq2pQ1mUj4yFkT", at: "15 Oct, 11:30 AM", name: "Harish Patel", business: "Nandini Textiles", city: "Surat", gstin: "24AAKFN2203C1Z5", program: "accelerator", amount: 24999, method: "UPI", status: "Settled", invoice: "BB/26-27/1169", note: "EMI 1 of 3", by: "sneha" },
  { id: "pay_Pq1nR7kVk9zGmS", at: "14 Oct, 11:58 PM", name: "Swati Chopra", business: "Gokul Properties", city: "Jaipur", program: "launchpad", amount: 24999, method: "UPI", status: "Settled", invoice: "BB/26-27/1168", note: "Bought during Batch 14 day-2 live offer", by: "imran" },
  { id: "pay_Pq0mS3jWm5aHnR", at: "14 Oct, 11:41 PM", name: "Tarun Reddy", business: "Hotel Green Park", city: "Hyderabad", program: "launchpad", amount: 24999, method: "Card", status: "Settled", invoice: "BB/26-27/1167", note: "Bought during Batch 14 day-2 live offer", by: "imran" },
  { id: "pay_PpZkT9hXn1bJpQ", at: "14 Oct, 11:36 PM", name: "Bhavna Iyer", business: "Kitchen Kart", city: "Chennai", program: "accelerator", amount: 74999, method: "Card", status: "Settled", invoice: "BB/26-27/1166", note: "ICICI credit card EMI, 9 months", by: "sneha" },
  { id: "pay_PpYjU5gYp7cKqP", at: "14 Oct, 11:22 PM", name: "Mahesh Pandey", business: "Vidya Learning", city: "Lucknow", program: "launchpad", amount: 24999, method: "UPI", status: "Failed", invoice: "-", note: "UPI collect request expired; paid next morning on retry", by: "imran" },
  { id: "pay_PpXiV1fZq3dLrN", at: "13 Oct, 4:05 PM", name: "Ritu Menon", business: "Pixel Media", city: "Bengaluru", gstin: "29AAMFP9902L1ZC", program: "agents", amount: 249999, method: "Netbanking", status: "Settled", invoice: "BB/26-27/1165", note: "Agent Factory, paid in full before Diwali", by: "rohan" },
  { id: "pay_Pq5sM3qRf8vCgW", at: "15 Oct, 10:15 PM", name: "Batch 14 seats", business: "1,248 registrations", city: "Mumbai", program: "workshop", amount: 63648, method: "UPI", status: "Settled", invoice: "BB/26-27/W14", note: "Consolidated settlement for ₹51 workshop tickets", by: "meera" },
];

const STATE_CODE: Record<string, [string, string]> = {
  Mumbai: ["27", "Maharashtra"], Pune: ["27", "Maharashtra"], Nagpur: ["27", "Maharashtra"],
  Surat: ["24", "Gujarat"], Ahmedabad: ["24", "Gujarat"], Rajkot: ["24", "Gujarat"],
  Delhi: ["07", "Delhi"], Ludhiana: ["03", "Punjab"], Chandigarh: ["04", "Chandigarh"],
  Hyderabad: ["36", "Telangana"], Kochi: ["32", "Kerala"], Chennai: ["33", "Tamil Nadu"], Bengaluru: ["29", "Karnataka"],
  Jaipur: ["08", "Rajasthan"], Lucknow: ["09", "Uttar Pradesh"], Indore: ["23", "Madhya Pradesh"],
};

/* Done-for-you milestone plan: 30 / 30 / 30 / 10 */
const MILESTONES = [
  { name: "Advance", pct: 0.3, at: "Discovery" },
  { name: "Blueprint sign-off", pct: 0.3, at: "Build" },
  { name: "UAT complete", pct: 0.3, at: "Go-live" },
  { name: "Go-live + 30 days", pct: 0.1, at: "Live" },
] as const;
const STAGE_ORDER: ClientBuild["stage"][] = ["Discovery", "Blueprint", "Build", "UAT", "Go-live", "Live"];

function milestonesOf(b: ClientBuild) {
  const reached = STAGE_ORDER.indexOf(b.stage);
  return MILESTONES.reduce<{ name: string; amount: number; state: "Paid" | "Invoiceable" | "Upcoming"; trigger: string }[]>((acc, m) => {
    const amount = Math.round(b.value * m.pct);
    const paidBefore = acc.reduce((a, x) => a + x.amount, 0);
    const paid = b.paid >= paidBefore + amount - 1;
    const hit = STAGE_ORDER.indexOf(m.at) <= reached || (m.at === "Go-live" && b.stage === "UAT" && b.progress >= 80);
    acc.push({ name: m.name, amount, state: paid ? "Paid" : hit ? "Invoiceable" : "Upcoming", trigger: m.at });
    return acc;
  }, []);
}

const STAGE_WEIGHT: Partial<Record<LeadStage, number>> = { New: 0.05, Contacted: 0.1, Qualified: 0.25, "Call booked": 0.4, Proposal: 0.65 };
const OPEN_STAGES: LeadStage[] = ["New", "Contacted", "Qualified", "Call booked", "Proposal"];

const bucketOf = (dueIn: number) => (dueIn >= 0 ? "Not yet due" : dueIn >= -15 ? "1–15 days" : dueIn >= -30 ? "16–30 days" : "31+ days");
const BUCKETS: { label: string; tone: Tone }[] = [
  { label: "Not yet due", tone: "ok" },
  { label: "1–15 days", tone: "warn" },
  { label: "16–30 days", tone: "late" },
  { label: "31+ days", tone: "accent" },
];

/* ============================================================ */

export default function RevenueCenter() {
  const hq = useHQ();
  const router = useRouter();
  const [range, setRange] = React.useState<Range>("MTD");
  const [series, setSeries] = React.useState<"Both" | "Booked" | "Collected">("Both");
  const [instalments, setInstalments] = React.useState(seedInstalments);
  const [emiFilter, setEmiFilter] = React.useState<"Overdue" | "Due in 14 days" | "All">("Overdue");
  const [payment, setPayment] = React.useState<Payment | null>(null);
  const [stage, setStage] = React.useState<LeadStage | null>(null);
  const [build, setBuild] = React.useState<ClientBuild | null>(null);
  const [raised, setRaised] = React.useState<Record<string, boolean>>({});
  const [advisor, setAdvisor] = React.useState<string | null>(null);
  const [gapOpen, setGapOpen] = React.useState(false);
  const [flagged, setFlagged] = React.useState(false);

  /* ----- range maths ----- */
  const len = RANGE_LEN[range];
  const end = DAYS.length;
  const slice = (a: number[], from: number, to: number) => a.slice(Math.max(0, from), to);
  const bookedR = sum(slice(booked, end - len, end));
  const collectedR = sum(slice(collected, end - len, end));
  const bookedPrev = sum(slice(booked, end - 2 * len, end - len));
  const collectedPrev = sum(slice(collected, end - 2 * len, end - len));
  const pct = (a: number, b: number) => (b ? `${a >= b ? "+" : ""}${(((a - b) / b) * 100).toFixed(1)}%` : undefined);
  const scale = bookedR / BOOKED_MTD;

  const chartLen = Math.max(len, 14);
  const labels = DAYS.slice(end - chartLen).map((d) => d.label);
  const markerIdx = labels.indexOf("14 Oct");
  const chartSeries = [
    ...(series !== "Collected" ? [{ name: "Booked", data: booked.slice(end - chartLen), tone: "accent" as Tone }] : []),
    ...(series !== "Booked" ? [{ name: "Collected", data: collected.slice(end - chartLen), tone: "ok" as Tone }] : []),
  ];

  /* ----- receivables ----- */
  const openInst = instalments.filter((i) => i.dueIn !== 999);
  const emiOutstanding = sum(openInst.map((i) => i.amount));
  const overdue = openInst.filter((i) => i.dueIn < 0);
  const buildRows = clientBuilds.map((b) => {
    const ms = milestonesOf(b);
    const next = ms.find((m) => m.state !== "Paid");
    return { b, ms, next, open: b.value - b.paid };
  });
  const dfyOutstanding = sum(buildRows.map((r) => r.open));
  const invoiceable = buildRows.filter((r) => r.next?.state === "Invoiceable" && !raised[r.b.id]);

  /* ----- pipeline from the live CRM ----- */
  const pipeline = OPEN_STAGES.map((s) => {
    const list = hq.leads.filter((l) => l.stage === s);
    const value = sum(list.map((l) => l.value));
    return { stage: s, count: list.length, value, weighted: Math.round(value * (STAGE_WEIGHT[s] ?? 0)) };
  });
  const pipeTotal = sum(pipeline.map((p) => p.value));
  const pipeWeighted = sum(pipeline.map((p) => p.weighted));
  const pipeMax = Math.max(1, ...pipeline.map((p) => p.value));
  const wonMTD = hq.leads.filter((l) => l.stage === "Won");

  const gap = TARGET - FORECAST;
  const gapLeads = React.useMemo(() => {
    const rank = (l: Lead) => l.value * (l.score / 100) * (l.stage === "Proposal" ? 1.4 : 1);
    return hq.leads
      .filter((l) => l.stage === "Proposal" || l.stage === "Call booked")
      .sort((a, b) => rank(b) - rank(a))
      .slice(0, 6);
  }, [hq.leads]);
  const gapValue = sum(gapLeads.map((l) => l.value));
  const gapExpected = sum(gapLeads.map((l) => Math.round(l.value * Math.min(0.9, l.score / 100))));

  /* ----- advisors ----- */
  const prorate = Math.min(1, len / 31);
  const board = salesTeam
    .map((p) => {
      const a = ADVISOR_MTD[p.id] ?? { amount: 0, deals: 0 };
      const amount = Math.round(a.amount * scale);
      const target = Math.round((p.target ?? 0) * (range === "MTD" ? 1 : prorate));
      return { p, amount, deals: Math.max(0, Math.round(a.deals * scale)), target, pct: target ? amount / target : 0 };
    })
    .sort((a, b) => b.amount - a.amount);

  /* ----- actions ----- */
  function remind(ids: string[]) {
    const list = instalments.filter((i) => ids.includes(i.id));
    if (!list.length) return;
    setInstalments((cur) => cur.map((i) => (ids.includes(i.id) ? { ...i, lastReminder: "Today" } : i)));
    const total = sum(list.map((i) => i.amount));
    hq.log(`sent ${list.length} EMI reminder${list.length > 1 ? "s" : ""} with Razorpay links (${rupees(total)})`, "warn");
    hq.notify({ kind: "payment", title: list.length > 1 ? `${list.length} payment reminders sent` : `Reminder sent to ${list[0].name}`, body: `WhatsApp + email with a Razorpay pay link, ${rupees(total)} outstanding. Collections agent will follow up in 48 h.`, href: "/hq/revenue" });
  }
  function markPaid(i: Instalment) {
    setInstalments((cur) => cur.map((x) => (x.id === i.id ? { ...x, dueIn: 999 } : x)));
    hq.log(`marked ${i.name}'s ${programById[i.program].short} instalment ${i.n}/${i.of} as paid (${rupees(i.amount)})`, "ok");
    toast.success(`${i.id} reconciled`, { description: `${rupees(i.amount)} matched to a Razorpay settlement.` });
  }
  function raiseInvoice(row: (typeof buildRows)[number]) {
    if (!row.next) return;
    setRaised((cur) => ({ ...cur, [row.b.id]: true }));
    hq.log(`raised milestone invoice "${row.next.name}" for ${row.b.client} (${rupees(row.next.amount)})`, "accent");
    hq.notify({ kind: "payment", title: `Invoice raised: ${row.b.client.split(",")[0]}`, body: `${row.next.name}, ${rupees(row.next.amount)} + GST. Razorpay link sent to the client's finance contact.`, href: "/hq/revenue" });
  }
  function openGapInCrm() {
    gapLeads.forEach((l) => hq.updateLead(l.id, (cur) => ({ tags: cur.tags.includes("Gap closer") ? cur.tags : [...cur.tags, "Gap closer"], followUpIn: Math.min(cur.followUpIn, 4) })));
    hq.log(`tagged ${gapLeads.length} proposals "Gap closer" to close the ${rupees(gap)} October gap`, "accent");
    hq.notify({ kind: "agent", title: "6 gap-closing proposals queued", body: `Tagged in the CRM and pulled to the top of today's dial queue. Worth ${rupees(gapValue)} at list.`, href: "/hq/crm" }, { toast: false });
    toast.success("Opening in Calling CRM", { description: `${gapLeads.length} leads tagged "Gap closer".` });
    router.push(`${hqHref("crm")}?focus=${gapLeads.map((l) => l.id).join(",")}`);
  }

  /* ----- columns ----- */
  const emiShown = openInst
    .filter((i) => (emiFilter === "Overdue" ? i.dueIn < 0 : emiFilter === "Due in 14 days" ? i.dueIn >= 0 && i.dueIn <= 14 : true))
    .sort((a, b) => a.dueIn - b.dueIn);

  const payColumns: Column<Payment>[] = [
    { key: "id", label: "Razorpay ID", render: (r) => <span className="font-mono text-[11.5px]">{r.id}</span> },
    {
      key: "who",
      label: "Customer",
      sort: (r) => r.name,
      render: (r) => (
        <span className="block min-w-0">
          <span className="block truncate font-medium">{r.name}</span>
          <span className="block truncate text-[11.5px] text-d-mute">{r.business} · {r.city}</span>
        </span>
      ),
    },
    { key: "prog", label: "Program", render: (r) => <ProgramTag id={r.program} /> },
    { key: "method", label: "Method", wide: true, render: (r) => <span className="text-d-mute">{r.method}</span> },
    { key: "at", label: "When", wide: true, render: (r) => <span className="whitespace-nowrap text-[12px] text-d-mute">{r.at}</span> },
    { key: "status", label: "Status", render: (r) => <Pill tone={r.status === "Settled" ? "ok" : r.status === "Captured" ? "info" : r.status === "Refunded" ? "warn" : "late"}>{r.status}</Pill> },
    { key: "amt", label: "Amount", align: "right", sort: (r) => r.amount, render: (r) => <span className={`tnum font-mono font-medium ${r.status === "Refunded" || r.status === "Failed" ? "text-d-mute line-through" : ""}`}>₹{r.amount.toLocaleString("en-IN")}</span> },
  ];

  const settledToday = payments.filter((p) => p.at.startsWith("Today") && p.status !== "Failed");

  return (
    <div>
      <PageHeader
        kicker="Revenue"
        icon={IndianRupee}
        title="Revenue Center"
        sub="Bookings, collections, pipeline and forecast across every program. Razorpay settles into this view every 15 minutes."
        actions={
          <>
            <Segmented options={["7D", "MTD", "30D", "90D"] as const} value={range} onChange={setRange} />
            <Btn icon={Download} onClick={() => { hq.log(`exported revenue ledger (${range}) for Sahil`, "info"); toast.success("Ledger exported", { description: `revenue-${range.toLowerCase()}-20oct.xlsx with GST split, ready for Tally.` }); }}>Export</Btn>
            <Btn variant="solid" icon={Sparkles} onClick={() => hq.openAsk("Why is collected revenue lagging bookings this month, and who owes us the most?")}>Ask about revenue</Btn>
          </>
        }
      />

      {/* Hero */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.35fr)]">
        <Metric label={`Booked · ${range}`} value={rupees(bookedR)} delta={pct(bookedR, bookedPrev)} hint={range === "MTD" ? "vs the 20 days before" : "vs previous period"} />
        <Metric label={`Collected · ${range}`} value={rupees(collectedR)} delta={pct(collectedR, collectedPrev)} hint={`${Math.round((collectedR / bookedR) * 100)}% of booked has landed`} />
        <Metric label="Outstanding" value={rupees(emiOutstanding + dfyOutstanding)} delta={`${overdue.length} overdue`} good={false} hint={`${rupees(emiOutstanding)} EMIs · ${rupees(dfyOutstanding)} builds`} onClick={() => document.getElementById("collections")?.scrollIntoView({ behavior: "smooth" })} />
        <Metric label="October forecast" value={rupees(FORECAST)} delta={`-${rupees(gap)}`} good={false} hint="vs ₹60 L target" />
        <div className="desk-card flex items-center gap-4 px-4 py-3">
          <div className="shrink-0">
            <Gauge value={(FORECAST / TARGET) * 100} size={112} tone="warn" />
          </div>
          <div className="min-w-0 text-[12.5px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-d-mute">Pace to target</p>
            <p className="mt-1 leading-snug">Booked {rupees(BOOKED_MTD)} in 20 days. Need {rupees(Math.round((TARGET - BOOKED_MTD) / DAYS_LEFT))}/day for the last {DAYS_LEFT}.</p>
          </div>
        </div>
      </div>

      {/* AI forecast */}
      <AgentNote
        className="mt-4"
        title={
          <span className="flex flex-wrap items-center gap-2">
            On current pace October lands at {rupees(FORECAST)}, {rupees(gap)} short of target <AIMark label="Forecast agent" />
          </span>
        }
        action={
          <>
            <Btn size="sm" variant="solid" icon={ArrowUpRight} onClick={openGapInCrm}>Open the 6 in CRM</Btn>
            <Btn size="sm" icon={Target} onClick={() => setGapOpen(true)}>See the math</Btn>
            <Btn size="sm" variant="ghost" onClick={() => hq.openAsk("Which 6 proposals close the October revenue gap, and what's the best next step on each?")}>Ask why</Btn>
          </>
        }
      >
        Booked {rupees(BOOKED_MTD)} so far; the Batch 14 spike (15–17 Oct) has faded to a {rupees(RUN_RATE)}/day run rate, worth {rupees(RUN_RATE * DAYS_LEFT)} by month end, plus {rupees(FORECAST - BOOKED_MTD - RUN_RATE * DAYS_LEFT)} expected from weighted pipeline. These {gapLeads.length} proposals are worth {rupees(gapValue)} at list ({rupees(gapExpected)} score-weighted) and close the gap if
        {" "}{gapLeads.slice(0, 3).map((l) => l.name.split(" ")[0]).join(", ")} and one more sign before 31 Oct. Diwali falls on 8 Nov: last year owners went quiet from Dhanteras onward, so anything not signed by 28 Oct likely slips to mid-November.
      </AgentNote>

      {/* Over time + by program */}
      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <Panel
          title="Revenue over time"
          sub={`Daily, last ${chartLen} days. Marker is Batch 14 day 2.`}
          action={<Segmented size="sm" options={["Both", "Booked", "Collected"] as const} value={series} onChange={setSeries} />}
        >
          <AreaChart series={chartSeries} labels={labels} height={250} format={(v) => rupees(v)} marker={markerIdx >= 0 ? { index: markerIdx, label: "Batch 14" } : undefined} />
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-d-line pt-3 text-[12.5px]">
            <MiniStat label="Best day" value={rupees(Math.max(...booked.slice(end - len)))} sub={DAYS[end - len + booked.slice(end - len).indexOf(Math.max(...booked.slice(end - len)))].label} />
            <MiniStat label="Avg / day booked" value={rupees(Math.round(bookedR / len))} sub={`${len} days`} />
            <MiniStat label="Collection ratio" value={`${Math.round((collectedR / bookedR) * 100)}%`} sub="collected ÷ booked" />
          </div>
        </Panel>

        <Panel title="By program" sub={`${range} bookings, ${rupees(bookedR)}`}>
          <div className="flex h-3 overflow-hidden rounded-full">
            {PROGRAM_MTD.map((p) => (
              <span key={p.id} className="desk-growx h-full" style={{ width: `${(p.amount / BOOKED_MTD) * 100}%`, background: programById[p.id].color }} title={programById[p.id].short} />
            ))}
          </div>
          <ul className="mt-4 space-y-2.5">
            {PROGRAM_MTD.map((p) => {
              const prog = programById[p.id];
              const amount = Math.round(p.amount * scale);
              const units = Math.max(p.id === "workshop" ? 0 : 1, Math.round(p.units * scale));
              return (
                <li key={p.id} className="flex items-center gap-3 text-[13px]">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: prog.color }} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{prog.short}</span>
                    <span className="block text-[11.5px] text-d-mute">
                      {p.id === "workshop" ? `${units.toLocaleString("en-IN")} seats at ₹51` : `${units} ${p.id === "dfy" ? "builds" : "enrolments"} · list ${rupees(prog.price)}`}
                    </span>
                  </span>
                  <span className="tnum font-mono text-[12.5px] font-medium">{rupees(amount)}</span>
                  <span className="tnum w-10 text-right font-mono text-[11.5px] text-d-mute">{Math.round((p.amount / BOOKED_MTD) * 100)}%</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-d-sunk px-3 py-2.5 text-[12.5px] leading-snug">
            <AIMark className="mt-px shrink-0" />
            Accelerator plus done-for-you make up 53% of bookings. Systems is converting at its best rate since July: 6 enrolments from 41 calls.
          </p>
        </Panel>
      </div>

      {/* Advisors + pipeline */}
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Panel title="By advisor" sub={range === "MTD" ? "Month to date vs monthly target" : `${range} vs prorated target`} action={<Btn size="sm" variant="ghost" onClick={() => router.push(hqHref("sales-reports"))}>Day reports</Btn>}>
          <ol className="space-y-3">
            {board.map((r, i) => (
              <li key={r.p.id}>
                <button type="button" onClick={() => setAdvisor(r.p.id)} className="flex w-full items-center gap-3 rounded-xl px-1 py-0.5 text-left hover:bg-d-sunk/60">
                  <span className="tnum w-4 font-mono text-[12px] text-d-mute">{i + 1}</span>
                  <PersonAvatar id={r.p.id} size={30} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2 text-[13px]">
                      <span className="truncate font-medium">{r.p.name} <span className="font-normal text-d-mute">· {r.deals} deals</span></span>
                      <span className="tnum shrink-0 font-mono text-[12.5px]">{rupees(r.amount)} <span className="text-d-mute">/ {rupees(r.target)}</span></span>
                    </span>
                    <span className="mt-1.5 flex items-center gap-2">
                      <Meter value={r.pct * 100} tone={r.pct >= 0.7 ? "ok" : r.pct >= 0.45 ? "warn" : "late"} />
                      <span className="tnum w-10 shrink-0 text-right font-mono text-[11.5px] text-d-mute">{Math.round(r.pct * 100)}%</span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
            <li className="flex items-center gap-3 border-t border-d-line px-1 pt-3 text-[13px]">
              <span className="w-4" />
              <PersonAvatar name="Online" size={30} />
              <span className="flex-1 text-d-mute">Direct checkout (workshop page, no advisor)</span>
              <span className="tnum font-mono text-[12.5px]">{rupees(Math.round(DIRECT_MTD * scale))}</span>
            </li>
          </ol>
        </Panel>

        <Panel title="Pipeline by stage" sub={`Live from the CRM · ${hq.leads.filter((l) => OPEN_STAGES.includes(l.stage)).length} open leads`} live>
          <div className="mb-4 grid grid-cols-3 gap-3">
            <MiniStat label="Open pipeline" value={rupees(pipeTotal)} sub="at list price" />
            <MiniStat label="Weighted" value={rupees(pipeWeighted)} sub="stage probability" />
            <MiniStat label="Won this month" value={String(wonMTD.length)} sub={rupees(sum(wonMTD.map((l) => l.value)))} />
          </div>
          <ul className="space-y-2">
            {pipeline.map((p) => (
              <li key={p.stage}>
                <button type="button" onClick={() => setStage(p.stage)} className="group grid w-full grid-cols-[96px_minmax(0,1fr)_112px] items-center gap-3 text-left text-[12.5px]">
                  <span className="truncate font-medium">{p.stage}</span>
                  <span className="relative h-7 overflow-hidden rounded-md bg-d-sunk">
                    <span className="desk-growx absolute inset-y-0 left-0 rounded-md bg-[color-mix(in_oklab,var(--d-accent)_22%,var(--d-panel))]" style={{ width: `${(p.value / pipeMax) * 100}%` }} />
                    <span className="desk-growx absolute inset-y-0 left-0 rounded-md bg-d-accent" style={{ width: `${(p.weighted / pipeMax) * 100}%` }} />
                    <span className="absolute inset-y-0 left-2 flex items-center font-mono text-[11px] text-d-ink mix-blend-normal">
                      <span className="rounded bg-d-panel/85 px-1">{p.count} · {Math.round((STAGE_WEIGHT[p.stage] ?? 0) * 100)}%</span>
                    </span>
                  </span>
                  <span className="tnum whitespace-nowrap text-right font-mono">
                    <span className="block">{rupees(p.weighted)}</span>
                    <span className="block text-[11px] text-d-mute">of {rupees(p.value)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-center gap-3 text-[11.5px] text-d-mute">
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-d-accent" /> weighted</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-[color-mix(in_oklab,var(--d-accent)_22%,var(--d-panel))]" /> list value</span>
            <span className="ml-auto">Click a stage for its leads</span>
          </p>
        </Panel>
      </div>

      {/* Collections */}
      <section id="collections" className="mt-4 scroll-mt-24">
        <Panel
          title="Collections and EMI schedule"
          sub={`${openInst.length} open instalments · ${rupees(emiOutstanding)} · ${overdue.length} overdue worth ${rupees(sum(overdue.map((i) => i.amount)))}`}
          action={
            <>
              <Segmented size="sm" options={["Overdue", "Due in 14 days", "All"] as const} value={emiFilter} onChange={setEmiFilter} />
              <Btn size="sm" variant="solid" icon={BellRing} disabled={!overdue.length} onClick={() => remind(overdue.map((i) => i.id))}>Remind all overdue</Btn>
            </>
          }
        >
          <AgingBar buckets={BUCKETS.map((b) => ({ ...b, value: sum(openInst.filter((i) => bucketOf(i.dueIn) === b.label).map((i) => i.amount)) }))} format={(v) => rupees(v)} />
          <div className="desk-scroll -mx-5 mt-4 overflow-x-auto px-5">
            <table className="w-full min-w-[760px] border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-d-line text-left text-[11.5px] text-d-mute">
                  <th className="pb-2 pr-3 font-medium">Student</th>
                  <th className="pb-2 pr-3 font-medium">Program</th>
                  <th className="pb-2 pr-3 font-medium">Instalment</th>
                  <th className="pb-2 pr-3 font-medium">Via</th>
                  <th className="pb-2 pr-3 font-medium">Due</th>
                  <th className="pb-2 pr-3 font-medium">Owner</th>
                  <th className="pb-2 pr-3 text-right font-medium">Amount</th>
                  <th className="pb-2 text-right font-medium" />
                </tr>
              </thead>
              <tbody>
                {emiShown.map((i) => (
                  <tr key={i.id} className="border-b border-d-line/70 last:border-0">
                    <td className="py-2.5 pr-3">
                      <span className="block font-medium">{i.name}</span>
                      <span className="block text-[11.5px] text-d-mute">{i.business} · {i.city}</span>
                    </td>
                    <td className="py-2.5 pr-3"><ProgramTag id={i.program} /></td>
                    <td className="py-2.5 pr-3 font-mono text-[12px]">{i.n} of {i.of}</td>
                    <td className="py-2.5 pr-3 text-[12px] text-d-mute">{i.via}</td>
                    <td className="py-2.5 pr-3">
                      {i.dueIn < 0 ? <Pill tone={i.dueIn < -15 ? "late" : "warn"} mono>{-i.dueIn}d overdue</Pill> : <Pill tone="ok" mono>in {i.dueIn}d</Pill>}
                      {i.lastReminder && <span className="mt-0.5 block text-[11px] text-d-mute">reminded {i.lastReminder}</span>}
                    </td>
                    <td className="py-2.5 pr-3"><PersonChip id={i.owner} /></td>
                    <td className="tnum py-2.5 pr-3 text-right font-mono font-medium">₹{i.amount.toLocaleString("en-IN")}</td>
                    <td className="py-2.5 text-right">
                      <span className="inline-flex gap-1.5">
                        <Btn size="sm" icon={MessageCircle} disabled={i.lastReminder === "Today"} onClick={() => remind([i.id])}>{i.lastReminder === "Today" ? "Sent" : "Remind"}</Btn>
                        <Btn size="sm" variant="ghost" onClick={() => markPaid(i)}>Mark paid</Btn>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!emiShown.length && <p className="py-8 text-center text-[13px] text-d-mute">Nothing here. Every instalment in this view is settled.</p>}
          </div>
          <AgentNote className="mt-4" title="Collections agent">
            Reminders sent before 11 AM on a weekday are paid 2.3× faster than evening ones. Harish Patel (38 days) has opened the last two links without paying; it is worth a call from Sneha rather than a fourth WhatsApp.
            {" "}
            <button type="button" className="font-medium text-d-accent underline-offset-2 hover:underline" onClick={() => { hq.addTask({ title: "Call Harish Patel about overdue Accelerator EMI 2/3 (₹25,000, 38d)", owner: "sneha", status: "Todo", priority: "P1", due: "Today", dueIn: 0, area: "Finance", aiDrafted: true }); hq.log("created a task for Sneha to call Harish Patel about his overdue EMI", "accent"); toast.success("Task created for Sneha", { description: "Due today, in Task Manager." }); }}>
              Create the task for Sneha
            </button>
          </AgentNote>
        </Panel>
      </section>

      {/* Payments + builds */}
      <div className="mt-4 grid gap-4 grid-cols-1">
        <Panel title="Recent payments" sub={`Razorpay · ${settledToday.length} today worth ${rupees(sum(settledToday.map((p) => p.amount)))} · click a row for the GST invoice`} icon={Receipt}>
          <DataTable
            rows={payments}
            columns={payColumns}
            rowKey={(r) => r.id}
            search={(r) => `${r.id} ${r.name} ${r.business} ${r.invoice} ${programById[r.program].short}`}
            searchPlaceholder="Payment ID, name or invoice"
            filter={{ get: (r) => r.status, options: ["Settled", "Captured", "Refunded", "Failed"] }}
            onRow={setPayment}
            pageSize={8}
            dense
          />
        </Panel>

        <Panel title="Done-for-you receivables" sub={`${clientBuilds.length} builds · ${rupees(dfyOutstanding)} still to bill or collect`}>
          <ul className="grid gap-x-8 gap-y-3 md:grid-cols-2">
            {buildRows.map((r) => (
              <li key={r.b.id} className="border-b border-d-line pb-3">
                <div className="flex items-start gap-3">
                  <button type="button" onClick={() => setBuild(r.b)} className="min-w-0 flex-1 text-left">
                    <span className="flex items-center gap-2 text-[13px] font-medium">
                      <span className="truncate">{r.b.client}</span>
                      {r.b.health !== "On track" && <Pill tone={r.b.health === "Blocked" ? "late" : "warn"}>{r.b.health}</Pill>}
                    </span>
                    <span className="mt-1.5 flex gap-1">
                      {r.ms.map((m) => (
                        <span key={m.name} className="h-1.5 flex-1 rounded-full" style={{ flexGrow: m.amount, background: m.state === "Paid" ? "var(--d-ok)" : m.state === "Invoiceable" ? "var(--d-warn)" : "var(--d-sunk)" }} title={`${m.name}: ${m.state}`} />
                      ))}
                    </span>
                    <span className="mt-1 block text-[11.5px] text-d-mute">
                      {r.next ? <>Next: {r.next.name} · {rupees(r.next.amount)}</> : "Fully collected"} · {r.b.stage}
                    </span>
                  </button>
                  <span className="shrink-0 text-right">
                    <span className="tnum block font-mono text-[12.5px]">{rupees(r.b.paid)}<span className="text-d-mute"> / {rupees(r.b.value)}</span></span>
                    {r.next?.state === "Invoiceable" && !raised[r.b.id] ? (
                      <Btn size="sm" variant="soft" className="mt-1" icon={FileText} onClick={() => raiseInvoice(r)}>Raise invoice</Btn>
                    ) : raised[r.b.id] ? (
                      <Pill tone="info" className="mt-1.5">Invoice sent</Pill>
                    ) : null}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          {invoiceable.length > 0 && (
            <AgentNote className="mt-4">
              {invoiceable.length} milestone{invoiceable.length > 1 ? "s are" : " is"} billable today but not invoiced: {rupees(sum(invoiceable.map((r) => r.next?.amount ?? 0)))} sitting on the table.
              {" "}
              <button type="button" className="font-medium text-d-accent hover:underline" onClick={() => invoiceable.forEach(raiseInvoice)}>Raise all</button>
            </AgentNote>
          )}
        </Panel>
      </div>

      {/* Anomaly strip */}
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Signal tone="late" title="Refund rate up" body="1 Accelerator refund in 7 days (wrong-program join). Usual is 1 a month. Pre-sale fit check skipped on that call." ask="Show me refunds this quarter and what the calls had in common" />
        <Signal tone="warn" title="Card failures at checkout" body="3 card declines on 17 Oct, all HDFC OTP timeouts. Retry links sent; 1 recovered." ask="How many checkout failures did we have this week and how many recovered?" />
        <Signal tone="ok" title="UPI share rising" body="UPI is 46% of October collections, up from 31% in July. Lower fees saved ₹18.4k this month." ask="What did we pay in Razorpay fees this month by method?" />
      </div>

      {/* Sheets and modals */}
      <PaymentSheet payment={payment} onClose={() => setPayment(null)} />

      <Sheet open={!!stage} onOpenChange={(o) => !o && setStage(null)} eyebrow="Pipeline" title={stage ?? ""} sub={stage ? `${hq.leads.filter((l) => l.stage === stage).length} leads · weighted at ${Math.round((STAGE_WEIGHT[stage] ?? 0) * 100)}%` : undefined} footer={<Btn variant="solid" icon={ArrowUpRight} onClick={() => router.push(hqHref("followups"))}>Open Follow-up Board</Btn>}>
        <ul className="divide-y divide-d-line">
          {hq.leads
            .filter((l) => l.stage === stage)
            .sort((a, b) => b.value - a.value)
            .map((l) => (
              <li key={l.id} className="flex items-center gap-3 py-2.5">
                <PersonAvatar id={l.owner} size={26} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium">{l.name} · {l.company}</span>
                  <span className="block truncate text-[11.5px] text-d-mute">{programById[l.interest].short} · score {l.score} · {l.city}</span>
                </span>
                <span className="tnum font-mono text-[12.5px]">{rupees(l.value)}</span>
              </li>
            ))}
        </ul>
      </Sheet>

      <Sheet open={!!build} onOpenChange={(o) => !o && setBuild(null)} eyebrow={build?.id} title={build?.client ?? ""} sub={build ? `${build.industry} · ${build.stage} · ${build.progress}% built` : undefined}>
        {build && (
          <div className="space-y-5">
            <KV items={[{ k: "Contract value", v: rupees(build.value) }, { k: "Collected", v: rupees(build.paid) }, { k: "Outstanding", v: rupees(build.value - build.paid) }, { k: "Delivery lead", v: personById[build.lead]?.name }, { k: "Go-live", v: build.goLiveIn ? `in ${build.goLiveIn} days` : "Live" }, { k: "Health", v: build.health }]} />
            <div>
              <SectionLabel>Milestones</SectionLabel>
              <ol className="space-y-2">
                {milestonesOf(build).map((m, i) => (
                  <li key={m.name} className="flex items-center gap-3 rounded-xl border border-d-line px-3 py-2.5 text-[13px]">
                    <span className="tnum font-mono text-[11px] text-d-mute">M{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{m.name}</span>
                      <span className="block text-[11.5px] text-d-mute">Triggers at {m.trigger}</span>
                    </span>
                    <span className="tnum font-mono">{rupees(m.amount)}</span>
                    <Pill tone={m.state === "Paid" ? "ok" : m.state === "Invoiceable" ? "warn" : "neutral"}>{m.state}</Pill>
                  </li>
                ))}
              </ol>
            </div>
            <AgentNote>
              {build.health === "Blocked"
                ? "Build is blocked on the Swiggy sync. Hold the next invoice until the fix ships, or the client will dispute it."
                : build.health === "At risk"
                  ? "Blueprint sign-off is slipping. Bill the advance balance now; the next milestone is at least 3 weeks out."
                  : "On track. The next invoice can go the day the milestone is signed off; the client pays in about 6 days on average."}
            </AgentNote>
          </div>
        )}
      </Sheet>

      <Sheet open={!!advisor} onOpenChange={(o) => !o && setAdvisor(null)} eyebrow="Advisor" title={advisor ? personById[advisor]?.name : ""} sub={advisor ? personById[advisor]?.title : undefined} footer={<Btn variant="solid" onClick={() => router.push(hqHref("sales-reports"))}>Open day reports</Btn>}>
        {advisor && (() => {
          const row = board.find((b) => b.p.id === advisor);
          const own = hq.leads.filter((l) => l.owner === advisor);
          return (
            <div className="space-y-5">
              <KV items={[{ k: `Booked · ${range}`, v: rupees(row?.amount ?? 0) }, { k: "Target", v: rupees(row?.target ?? 0) }, { k: "Deals", v: row?.deals ?? 0 }, { k: "Open leads", v: own.filter((l) => OPEN_STAGES.includes(l.stage)).length }, { k: "Proposals out", v: own.filter((l) => l.stage === "Proposal").length }, { k: "Weighted pipeline", v: rupees(sum(own.map((l) => Math.round(l.value * (STAGE_WEIGHT[l.stage] ?? 0))))) }]} />
              <div>
                <SectionLabel>Biggest open deals</SectionLabel>
                <ul className="space-y-1.5">
                  {own.filter((l) => OPEN_STAGES.includes(l.stage)).sort((a, b) => b.value - a.value).slice(0, 6).map((l) => (
                    <li key={l.id} className="flex justify-between gap-3 text-[13px]">
                      <span className="truncate">{l.name} · <span className="text-d-mute">{l.stage}</span></span>
                      <span className="tnum font-mono">{rupees(l.value)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Btn icon={Sparkles} onClick={() => hq.openAsk(`How can ${personById[advisor]?.first} close the gap to target this month?`)}>Ask how {personById[advisor]?.first} closes the gap</Btn>
            </div>
          );
        })()}
      </Sheet>

      <Modal open={gapOpen} onOpenChange={setGapOpen} title="How the forecast is built" sub="Forecast agent · refreshed 9:45 AM" width={620}>
        <div className="space-y-2 text-[13px]">
          {[
            ["Booked, 1–20 Oct", BOOKED_MTD],
            [`Run rate, ${DAYS_LEFT} days × ${rupees(RUN_RATE)}`, RUN_RATE * DAYS_LEFT],
            ["Weighted pipeline expected to sign in October", FORECAST - BOOKED_MTD - RUN_RATE * DAYS_LEFT],
          ].map(([k, v]) => (
            <div key={k as string} className="flex justify-between border-b border-d-line pb-2">
              <span>{k}</span>
              <span className="tnum font-mono">{rupees(v as number)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-1 font-semibold">
            <span>Forecast</span>
            <span className="tnum font-mono">{rupees(FORECAST)}</span>
          </div>
          <div className="flex justify-between text-d-late">
            <span>Gap to ₹60 L</span>
            <span className="tnum font-mono">-{rupees(gap)}</span>
          </div>
        </div>
        <SectionLabel className="mt-5">The 6 proposals that close it</SectionLabel>
        <ul className="space-y-1.5">
          {gapLeads.map((l) => (
            <li key={l.id} className="flex items-center gap-3 text-[13px]">
              <PersonAvatar id={l.owner} size={22} />
              <span className="min-w-0 flex-1 truncate">{l.name} · <span className="text-d-mute">{l.company} · {l.stage}</span></span>
              <span className="font-mono text-[11.5px] text-d-mute">{l.score}</span>
              <span className="tnum w-16 text-right font-mono">{rupees(l.value)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex justify-end gap-2">
          <Btn onClick={() => setGapOpen(false)}>Close</Btn>
          <Btn variant="solid" icon={ArrowUpRight} onClick={() => { setGapOpen(false); openGapInCrm(); }}>Open them in CRM</Btn>
        </div>
      </Modal>

      {!flagged && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[14px] border border-dashed border-d-line px-4 py-3 text-[12.5px] text-d-mute">
          <AIMark />
          <span className="flex-1">Sahil reconciles Razorpay settlements against Tally every Friday. 2 settlements this week (₹1.4 L) have no matching invoice yet.</span>
          <Btn size="sm" icon={Send} onClick={() => { setFlagged(true); hq.notify({ kind: "payment", title: "2 settlements need invoices", body: "₹1.4 L settled on 17–18 Oct without matching GST invoices. Flagged for Sahil.", href: "/hq/revenue" }); hq.log("flagged 2 unmatched Razorpay settlements to Sahil", "warn"); }}>Flag to Sahil</Btn>
        </div>
      )}
    </div>
  );
}

/* ============================================================ */

function ProgramTag({ id }: { id: ProgramId }) {
  const p = programById[id];
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[12.5px]">
      <span className="h-2 w-2 rounded-[2px]" style={{ background: p.color }} />
      {p.short}
    </span>
  );
}

function MiniStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-d-mute">{label}</p>
      <p className="tnum mt-0.5 font-serif text-[20px] font-medium leading-tight">{value}</p>
      {sub && <p className="truncate text-[11.5px] text-d-mute">{sub}</p>}
    </div>
  );
}

function Signal({ tone, title, body, ask }: { tone: Tone; title: string; body: string; ask: string }) {
  const hq = useHQ();
  return (
    <div className="desk-card p-4">
      <p className="flex items-center gap-2 text-[13px] font-semibold">
        <span className="h-2 w-2 rounded-full" style={{ background: `var(--d-${tone})` }} />
        {title}
        <AIMark label="Anomaly" className="ml-auto" />
      </p>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-d-mute">{body}</p>
      <button type="button" onClick={() => hq.openAsk(ask)} className="mt-2 text-[12.5px] font-medium text-d-accent hover:underline">Ask HQ</button>
    </div>
  );
}

function PaymentSheet({ payment, onClose }: { payment: Payment | null; onClose: () => void }) {
  const hq = useHQ();
  const p = payment;
  const [code, stateName] = p ? (STATE_CODE[p.city] ?? ["27", "Maharashtra"]) : ["27", "Maharashtra"];
  const intra = code === "27";
  const taxable = p ? Math.round((p.amount / 1.18) * 100) / 100 : 0;
  const tax = p ? Math.round((p.amount - taxable) * 100) / 100 : 0;
  const sac = p?.program === "dfy" ? "998314" : "999293";
  const fee = p ? Math.round(p.amount * (p.method === "UPI" ? 0 : p.method === "EMI" ? 0.03 : 0.02)) : 0;
  const fmt = (v: number) => `₹${v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return (
    <Sheet
      open={!!p}
      onOpenChange={(o) => !o && onClose()}
      eyebrow={p?.invoice !== "-" ? `Tax invoice ${p?.invoice}` : "Failed payment"}
      title={p ? `${p.name}` : ""}
      sub={p ? `${programById[p.program].name} · ${p.at}` : undefined}
      width={540}
      footer={
        p && (
          <>
            <Btn icon={Copy} onClick={() => { void navigator.clipboard?.writeText(p.id); toast("Payment ID copied", { description: p.id }); }}>Copy ID</Btn>
            {p.status === "Failed" ? (
              <Btn variant="solid" icon={Send} onClick={() => { hq.log(`resent Razorpay retry link to ${p.name}`, "warn"); hq.notify({ kind: "payment", title: `Retry link sent to ${p.name}`, body: `${rupees(p.amount)} ${programById[p.program].short}; link valid 48 h.`, href: "/hq/revenue" }); }}>Send retry link</Btn>
            ) : (
              <>
                <Btn icon={Download} onClick={() => toast.success("Invoice PDF ready", { description: `${p.invoice.replace(/\//g, "-")}.pdf` })}>PDF</Btn>
                <Btn variant="solid" icon={Mail} onClick={() => { hq.log(`emailed GST invoice ${p.invoice} to ${p.name}`, "info"); toast.success("Invoice emailed", { description: `${p.invoice} sent to ${p.name.split(" ")[0].toLowerCase()}@${p.business.toLowerCase().replace(/[^a-z]/g, "").slice(0, 12)}.in` }); }}>Email invoice</Btn>
              </>
            )}
          </>
        )
      }
    >
      {p && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={p.status === "Settled" ? "ok" : p.status === "Captured" ? "info" : p.status === "Refunded" ? "warn" : "late"}>{p.status}</Pill>
            <span className="font-mono text-[12px] text-d-mute">{p.id}</span>
          </div>

          <div className="rounded-[14px] border border-d-line bg-d-paper p-4 text-[12.5px]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-serif text-[17px] font-medium">BuildBiz AI Solutions Pvt. Ltd.</p>
                <p className="text-d-mute">Andheri East, Mumbai 400069 · Maharashtra (27)</p>
                <p className="font-mono text-[11.5px] text-d-mute">GSTIN 27AAJCB4821K1Z6</p>
              </div>
              <p className="text-right font-mono text-[11.5px] text-d-mute">{p.invoice}<br />{p.at.replace("Today", "20 Oct").replace("Yesterday", "19 Oct")}</p>
            </div>
            <div className="mt-4 border-t border-d-line pt-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-d-mute">Billed to</p>
              <p className="mt-0.5 font-medium">{p.business} <span className="font-normal text-d-mute">({p.name})</span></p>
              <p className="text-d-mute">{p.city}, {stateName} ({code}) · {p.gstin ? <span className="font-mono">GSTIN {p.gstin}</span> : "Unregistered (B2C)"}</p>
            </div>
            <table className="mt-4 w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-d-line text-left text-[11px] text-d-mute">
                  <th className="pb-1.5 font-medium">Description</th>
                  <th className="pb-1.5 font-medium">SAC</th>
                  <th className="pb-1.5 text-right font-medium">Taxable</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-d-line">
                  <td className="py-2 pr-2">{programById[p.program].name}<span className="block text-[11px] text-d-mute">{p.note}</span></td>
                  <td className="py-2 font-mono">{sac}</td>
                  <td className="tnum py-2 text-right font-mono">{fmt(taxable)}</td>
                </tr>
                {intra ? (
                  <>
                    <tr><td className="pt-2 text-d-mute" colSpan={2}>CGST 9%</td><td className="tnum pt-2 text-right font-mono">{fmt(tax / 2)}</td></tr>
                    <tr><td className="text-d-mute" colSpan={2}>SGST 9%</td><td className="tnum text-right font-mono">{fmt(tax / 2)}</td></tr>
                  </>
                ) : (
                  <tr><td className="pt-2 text-d-mute" colSpan={2}>IGST 18% (inter-state)</td><td className="tnum pt-2 text-right font-mono">{fmt(tax)}</td></tr>
                )}
                <tr className="border-t border-d-line font-semibold"><td className="pt-2" colSpan={2}>Total</td><td className="tnum pt-2 text-right font-mono">{fmt(p.amount)}</td></tr>
              </tbody>
            </table>
            <p className="mt-3 text-[11px] text-d-mute">Place of supply: {stateName}. {p.gstin ? "B2B, eligible for input tax credit." : "B2C invoice."} E-invoice IRN generated on settlement.</p>
          </div>

          <KV items={[{ k: "Method", v: p.method }, { k: "Razorpay fee + GST", v: p.status === "Failed" ? "-" : rupees(fee) }, { k: "Net settlement", v: p.status === "Failed" ? "-" : rupees(p.amount - fee) }, { k: "Closed by", v: personById[p.by]?.name ?? p.by }]} />
          {p.gstin && <AgentNote>GSTIN verified against the GST portal: active, regular taxpayer, legal name matches {p.business}.</AgentNote>}
        </div>
      )}
    </Sheet>
  );
}
