"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Ban,
  Bot,
  Boxes,
  CalendarClock,
  CheckCheck,
  ClipboardList,
  Factory,
  Gauge as GaugeIcon,
  HandCoins,
  IndianRupee,
  Layers,
  MessageCircle,
  Mountain,
  Phone,
  PhoneCall,
  Plug,
  Plus,
  Scale,
  Send,
  TrendingUp,
  Truck,
  Users,
  Wrench,
} from "lucide-react";
import { DeskShell, useDesk } from "../shell";
import { AreaChart, Bars, Donut, HBars, Sparkline } from "../charts";
import { AgingBar, ApprovalQueue, Board, Countdown, DataTable } from "../data";
import { AgentsModule, ConnectionsModule, IndependenceModule, PeopleModule } from "../common";
import { Avatar, Btn, Field, inputClass, inr, KV, Meter, Modal, Panel, Pill, Segmented, Sheet, Stat } from "../ui";
import { useDrift } from "../hooks";
import type { DeskConfig, DeskModule, IndependenceData, Integration, TeamMember, Tone, WorkforceAgent } from "../types";

/* ============================================================
   Data — Aravalli Stone Yard, Kishangarh. Fictional marble, granite
   and sandstone processor with 4 cutting units. Today = Tue 20 Oct.
   ============================================================ */

const L = 1e5;
const REGIONS = ["Rajasthan", "Gujarat", "Madhya Pradesh", "Delhi NCR"] as const;
type Region = (typeof REGIONS)[number];

/** Age strata, youngest first. Colours are stone, not traffic lights. */
const AGE = [
  { key: "0-30", label: "0–30 days", stone: "Makrana white", color: "#eadfca", ink: "#4a3826", tone: "ok" as Tone },
  { key: "31-60", label: "31–60 days", stone: "Dholpur beige", color: "#d7a86d", ink: "#3b2612", tone: "info" as Tone },
  { key: "61-90", label: "61–90 days", stone: "Terracotta", color: "#b2613a", ink: "#fff5ea", tone: "warn" as Tone },
  { key: "90+", label: "90+ days", stone: "Laterite", color: "#74281b", ink: "#fbe8da", tone: "late" as Tone },
] as const;

type Dealer = {
  id: string;
  name: string;
  town: string;
  region: Region;
  contact: string;
  phone: string;
  salesman: string;
  limit: number;
  buckets: [number, number, number, number];
  oldest: number;
  lastPay: { date: string; amount: number; mode: string };
  terms: number;
  gstin: string;
  note: string;
  hold?: boolean;
  dispute?: string;
};

function d(id: string, name: string, town: string, region: Region, contact: string, salesman: string, limitL: number, b: [number, number, number, number], oldest: number, lastPay: Dealer["lastPay"], note: string, extra: Partial<Dealer> = {}): Dealer {
  return {
    id,
    name,
    town,
    region,
    contact,
    phone: `+91 9${(id.charCodeAt(0) * 7919 + id.charCodeAt(1) * 104729).toString().slice(0, 9).padEnd(9, "4")}`,
    salesman,
    limit: limitL * L,
    buckets: b.map((x) => Math.round(x * L)) as Dealer["buckets"],
    oldest,
    lastPay,
    terms: 45,
    gstin: `${region === "Rajasthan" ? "08" : region === "Gujarat" ? "24" : region === "Madhya Pradesh" ? "23" : "07"}AA${id.toUpperCase()}${oldest}F1Z${oldest % 9}`,
    note,
    ...extra,
  };
}

const seedDealers: Dealer[] = [
  d("SB", "Shree Balaji Marbles", "Jaipur", "Rajasthan", "Mukesh Goyal", "Rajendra", 15, [4.2, 5.1, 3.4, 1.5], 104, { date: "6 Oct", amount: 2.5 * L, mode: "RTGS" }, "Big repeat buyer, pays in chunks after every site handover."),
  d("MS", "Mewar Stone Gallery", "Udaipur", "Rajasthan", "Hemant Paliwal", "Devendra", 8, [2.8, 4.0, 0, 0], 44, { date: "12 Oct", amount: 1.8 * L, mode: "UPI" }, "Clean record, slightly slow in Navratri season."),
  d("MG", "Marudhar Granites", "Jodhpur", "Rajasthan", "Om Prakash Bishnoi", "Rajendra", 8, [1.6, 2.2, 3.1, 2.5], 118, { date: "21 Aug", amount: 1.1 * L, mode: "Cheque" }, "Over limit. Two cheques bounced this year.", { hold: true }),
  d("AT", "Ajmer Tiles & Sanitary", "Ajmer", "Rajasthan", "Salim Khan", "Devendra", 5, [3.1, 0, 0, 0], 19, { date: "15 Oct", amount: 0.9 * L, mode: "UPI" }, "Small, regular, always within terms."),
  d("HB", "Hadoti Building Mart", "Kota", "Rajasthan", "Vikas Jain", "Devendra", 6, [1.2, 1.9, 2.5, 0], 77, { date: "28 Sep", amount: 1.4 * L, mode: "NEFT" }, "Broke yesterday's promise of ₹1.2 L."),
  d("BB", "Bhilwara Build Point", "Bhilwara", "Rajasthan", "Naresh Daga", "Devendra", 4, [1.9, 0, 0, 0], 8, { date: "18 Oct", amount: 1.2 * L, mode: "UPI" }, "New dealer since July, advance-paying."),
  d("SD", "Sabarmati Stone Depot", "Ahmedabad", "Gujarat", "Jayesh Patel", "Devendra", 20, [6.4, 5.8, 4.1, 2.4], 96, { date: "9 Oct", amount: 4 * L, mode: "RTGS" }, "Biggest Gujarat account. Builder projects in SG Highway belt."),
  d("SM", "Surya Marble House", "Surat", "Gujarat", "Bhavesh Desai", "Devendra", 12, [5.5, 3.6, 2.2, 0], 71, { date: "3 Oct", amount: 2.2 * L, mode: "Cheque" }, "Pays after Diwali bookings every year."),
  d("KG", "Kathiawar Granite Co.", "Rajkot", "Gujarat", "Hitesh Sorathiya", "Devendra", 6, [0.9, 1.4, 2.0, 3.6], 141, { date: "30 Jul", amount: 0.8 * L, mode: "Cheque" }, "Disputes ₹1.4 L for breakage on truck RJ-01 GB 4471.", { hold: true, dispute: "Breakage claim ₹1.4 L, 62 slabs Jalore granite" }),
  d("VT", "Vishwamitri Tiles", "Vadodara", "Gujarat", "Ketan Shah", "Devendra", 6, [2.6, 1.6, 0, 0], 39, { date: "14 Oct", amount: 1.3 * L, mode: "UPI" }, "Within terms."),
  d("MM", "Malwa Marble Mart", "Indore", "Madhya Pradesh", "Sanjay Khandelwal", "Rajendra", 15, [4.8, 4.4, 3.9, 2.5], 99, { date: "1 Oct", amount: 3 * L, mode: "RTGS" }, "Just over limit. Wants 60-day terms on the new Pithampur order."),
  d("BS", "Bhoj Stone Traders", "Bhopal", "Madhya Pradesh", "Anil Raghuwanshi", "Rajendra", 10, [2.1, 3.0, 3.0, 0], 82, { date: "26 Sep", amount: 1.5 * L, mode: "NEFT" }, "Promised ₹1.5 L by 6 PM today."),
  d("MK", "Mahakal Granites", "Ujjain", "Madhya Pradesh", "Pawan Joshi", "Rajendra", 5, [2.7, 0, 0, 0], 11, { date: "16 Oct", amount: 1.2 * L, mode: "RTGS" }, "Paid ₹1.2 L by RTGS on Friday."),
  d("GS", "Gwalior Stone Point", "Gwalior", "Madhya Pradesh", "Rakesh Tomar", "Karan", 6, [0.8, 1.1, 1.6, 2.5], 128, { date: "4 Aug", amount: 0.6 * L, mode: "Cash deposit" }, "Owner unwell; son handling the shop."),
  d("RM", "Raj Marble Bazaar", "Kirti Nagar, Delhi", "Delhi NCR", "Rajiv Malhotra", "Karan", 25, [7.2, 6.1, 4.9, 3.2], 109, { date: "11 Oct", amount: 5 * L, mode: "RTGS" }, "Largest account. Promised ₹8 L RTGS on Friday."),
  d("CC", "Cyber City Stone Studio", "Gurugram", "Delhi NCR", "Ankit Yadav", "Karan", 15, [6.8, 4.1, 1.9, 0], 66, { date: "8 Oct", amount: 3.4 * L, mode: "NEFT" }, "Premium Makrana buyer for farmhouses."),
  d("NN", "Noida Natural Stones", "Noida", "Delhi NCR", "Deepak Bhati", "Karan", 10, [3.0, 2.6, 2.4, 1.9], 93, { date: "29 Sep", amount: 1.6 * L, mode: "Cheque" }, "Promised ₹2 L tomorrow."),
  d("FG", "Faridabad Granite Hub", "Faridabad", "Delhi NCR", "Sunny Nagar", "Karan", 6, [1.4, 1.2, 1.3, 1.3], 101, { date: "22 Aug", amount: 0.7 * L, mode: "Cheque" }, "Pays only when Karan visits."),
];

const owed = (x: Dealer) => x.buckets.reduce((a, b) => a + b, 0);
const ageIdx = (x: Dealer) => (x.buckets[3] > 0 ? 3 : x.buckets[2] > 0 ? 2 : x.buckets[1] > 0 ? 1 : 0);
const regionShort: Record<Region, string> = { Rajasthan: "RJ", Gujarat: "GJ", "Madhya Pradesh": "MP", "Delhi NCR": "NCR" };

/** Apply a receipt to the oldest strata first, the way Tally's bill-wise does. */
function applyReceipt(x: Dealer, amount: number): Dealer {
  const b = [...x.buckets] as Dealer["buckets"];
  [3, 2, 1, 0].reduce((left, i) => {
    const take = Math.min(left, b[i]);
    b[i] -= take;
    return left - take;
  }, amount);
  return { ...x, buckets: b };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function ago(days: number) {
  let dd = 20 - days;
  let m = 9;
  while (dd <= 0) {
    m -= 1;
    dd += MONTH_DAYS[(m + 12) % 12];
  }
  return `${dd} ${MONTHS[(m + 12) % 12]}`;
}

const ITEMS = [
  "Makrana Albeta 18mm · 1,840 sq ft",
  "Udaipur pink 16mm · 3,200 sq ft",
  "Jalore Rosy Pink granite 18mm · 2,450 sq ft",
  "Kishangarh green tiles 2×2 · 4,100 sq ft",
  "Rajasthan black granite 20mm · 1,260 sq ft",
  "Dholpur beige sandstone 25mm · 2,900 sq ft",
  "Jaisalmer yellow 18mm · 2,200 sq ft",
  "Kota stone 25mm · 6,800 sq ft",
  "Banswara white 18mm · 1,500 sq ft",
];

type LedgerRow = { date: string; vch: string; particulars: string; dr: number; cr: number; bal: number };
function ledgerOf(x: Dealer, idx: number): LedgerRow[] {
  const days = [9 + (idx % 17), 36 + (idx % 21), 64 + (idx % 22), x.oldest];
  const raw: Omit<LedgerRow, "bal">[] = [{ date: "1 Apr", vch: "Opening", particulars: "Balance b/f", dr: x.lastPay.amount, cr: 0 }];
  [3, 2, 1, 0].forEach((i) => {
    if (x.buckets[i] > 0) raw.push({ date: ago(days[i]), vch: `AS/26-27/${1180 - days[i] * 3 - idx}`, particulars: `Sales · ${ITEMS[(idx + i) % ITEMS.length]}`, dr: x.buckets[i], cr: 0 });
  });
  raw.push({ date: x.lastPay.date, vch: `RCPT-${4400 + idx * 7}`, particulars: `By ${x.lastPay.mode}`, dr: 0, cr: x.lastPay.amount });
  return raw.reduce<LedgerRow[]>((acc, r) => [...acc, { ...r, bal: (acc[acc.length - 1]?.bal ?? 0) + r.dr - r.cr }], []);
}

type Promise_ = { id: string; dealer: string; amount: number; due: string; inHours: number; mode: string; status: "open" | "kept" | "broken" };
const seedPromises: Promise_[] = [
  { id: "P1", dealer: "BS", amount: 1.5 * L, due: "Today 6 PM", inHours: 6.2, mode: "NEFT", status: "open" },
  { id: "P2", dealer: "NN", amount: 2 * L, due: "Wed", inHours: 22, mode: "Cheque", status: "open" },
  { id: "P3", dealer: "SB", amount: 3 * L, due: "Thu", inHours: 46, mode: "RTGS", status: "open" },
  { id: "P4", dealer: "RM", amount: 8 * L, due: "Fri", inHours: 70, mode: "RTGS", status: "open" },
  { id: "P5", dealer: "SD", amount: 5 * L, due: "Sat", inHours: 94, mode: "PDC cheque", status: "open" },
  { id: "P6", dealer: "HB", amount: 1.2 * L, due: "Mon (missed)", inHours: 0, mode: "NEFT", status: "broken" },
];

type Outcome = "Promise" | "No answer" | "Dispute" | "Paid" | "Call back";
type Call = { id: string; when: string; dealer: string; by: string; outcome: Outcome; amount?: number; note: string };
const seedCalls: Call[] = [
  { id: "C14", when: "Today 11:40", dealer: "RM", by: "Kavita", outcome: "Promise", amount: 8 * L, note: "Rajiv ji confirmed RTGS Friday, after their Dwarka site bill clears." },
  { id: "C13", when: "Today 11:12", dealer: "KG", by: "Rajendra", outcome: "Dispute", note: "Still holding ₹1.4 L for breakage. Wants photos from loading." },
  { id: "C12", when: "Today 10:55", dealer: "BS", by: "Kavita", outcome: "Promise", amount: 1.5 * L, note: "Anil ji: NEFT by 6 PM, UTR on WhatsApp." },
  { id: "C11", when: "Today 10:31", dealer: "GS", by: "Kavita", outcome: "No answer", note: "Third try. Son's number also switched off." },
  { id: "C10", when: "Today 10:05", dealer: "MG", by: "Rajendra", outcome: "Call back", note: "Om Prakash ji in court, call after 4." },
  { id: "C9", when: "Today 9:48", dealer: "NN", by: "Karan", outcome: "Promise", amount: 2 * L, note: "Cheque tomorrow, will hand to transporter." },
  { id: "C8", when: "Mon 5:40 PM", dealer: "HB", by: "Kavita", outcome: "No answer", note: "Promise of ₹1.2 L missed. Not picking up." },
  { id: "C7", when: "Mon 4:15 PM", dealer: "MK", by: "Rajendra", outcome: "Paid", amount: 1.2 * L, note: "RTGS received, thanked Pawan ji." },
  { id: "C6", when: "Mon 3:02 PM", dealer: "SD", by: "Devendra", outcome: "Promise", amount: 5 * L, note: "Post-dated cheque for Saturday, Jayesh bhai." },
  { id: "C5", when: "Mon 12:20 PM", dealer: "FG", by: "Karan", outcome: "Call back", note: "Will pay when Karan visits on Thursday." },
  { id: "C4", when: "Mon 11:05 AM", dealer: "SB", by: "Rajendra", outcome: "Promise", amount: 3 * L, note: "After Mansarovar site handover on Thursday." },
  { id: "C3", when: "Sat 6:10 PM", dealer: "MM", by: "Rajendra", outcome: "Dispute", note: "Wants 60-day terms before clearing 90+ bills." },
  { id: "C2", when: "Sat 4:44 PM", dealer: "SM", by: "Devendra", outcome: "Call back", note: "Bhavesh bhai: after Dhanteras." },
  { id: "C1", when: "Sat 2:30 PM", dealer: "CC", by: "Karan", outcome: "Paid", amount: 3.4 * L, note: "NEFT credited, UTR matched in Tally." },
];
const outcomeTone: Record<Outcome, Tone> = { Promise: "ok", Paid: "accent", "No answer": "late", Dispute: "warn", "Call back": "info" };

/* ---- Orders ---- */
type OrderStage = "enquiry" | "quoted" | "advance" | "cutting" | "loaded";
type Order = { id: string; dealer: string; variety: string; sqft: number; rate: number; truck?: string; stage: OrderStage; site: string; eta: string };
const seedOrders: Order[] = [
  { id: "SO-2291", dealer: "CC", variety: "Makrana Albeta 18mm", sqft: 2400, rate: 410, stage: "enquiry", site: "Farmhouse, Sohna Rd", eta: "—" },
  { id: "SO-2290", dealer: "VT", variety: "Kishangarh green 2×2", sqft: 5200, rate: 74, stage: "enquiry", site: "Showroom stock", eta: "—" },
  { id: "SO-2289", dealer: "MM", variety: "Jalore Rosy Pink granite", sqft: 6800, rate: 68, stage: "quoted", site: "Pithampur plant", eta: "Awaiting PO" },
  { id: "SO-2287", dealer: "AT", variety: "Udaipur pink 16mm", sqft: 3100, rate: 56, stage: "quoted", site: "Vaishali Nagar flats", eta: "Quote sent Sat" },
  { id: "SO-2286", dealer: "SD", variety: "Dholpur beige 25mm", sqft: 4600, rate: 72, stage: "advance", site: "SG Highway villas", eta: "Cut by Thu" },
  { id: "SO-2285", dealer: "BB", variety: "Kota stone 25mm", sqft: 9000, rate: 29, stage: "advance", site: "Textile mill floor", eta: "Cut by Wed" },
  { id: "SO-2283", dealer: "RM", variety: "Banswara white 18mm", sqft: 3600, rate: 96, stage: "cutting", truck: "", site: "Rajouri Garden kothi", eta: "Gang saw 2, 62%" },
  { id: "SO-2282", dealer: "SB", variety: "Makrana Dungri 18mm", sqft: 2200, rate: 285, stage: "cutting", site: "Mansarovar temple", eta: "Polishing line" },
  { id: "SO-2281", dealer: "NN", variety: "Rajasthan black granite", sqft: 1800, rate: 112, stage: "cutting", site: "Sector 150 lobby", eta: "Multiwire, 40%" },
  { id: "SO-2279", dealer: "MS", variety: "Jaisalmer yellow 18mm", sqft: 2700, rate: 61, stage: "loaded", truck: "RJ-01 GC 8823", site: "Fateh Sagar hotel", eta: "Udaipur by 7 PM" },
  { id: "SO-2278", dealer: "KG", variety: "Jalore Rosy Pink granite", sqft: 3300, rate: 66, stage: "loaded", truck: "GJ-03 BV 1190", site: "Rajkot depot", eta: "Held at gate" },
  { id: "SO-2276", dealer: "BS", variety: "Udaipur pink 16mm", sqft: 4200, rate: 55, stage: "loaded", truck: "RJ-36 GA 2047", site: "Bhopal depot", eta: "Dispatched 8:10 AM" },
];
const ORDER_COLS: { id: OrderStage; label: string; tone: Tone; hint: string }[] = [
  { id: "enquiry", label: "Enquiry", tone: "neutral", hint: "WhatsApp and IndiaMART" },
  { id: "quoted", label: "Quoted", tone: "info", hint: "Rate card + freight" },
  { id: "advance", label: "Advance in", tone: "accent", hint: "30% before cutting" },
  { id: "cutting", label: "Cutting", tone: "warn", hint: "On a saw or polishing" },
  { id: "loaded", label: "Loaded", tone: "ok", hint: "E-way bill raised" },
];

/* ---- Yard ---- */
type Saw = { id: string; unit: string; kind: string; status: "Running" | "Blade change" | "Idle" | "Breakdown"; block?: string; variety?: string; pct: number; hoursLeft: number; amps: number; bladeLife: number; operator: string };
const seedSaws: Saw[] = [
  { id: "GS-1", unit: "Unit 1", kind: "Gang saw · 80 blades", status: "Running", block: "MK-2417", variety: "Makrana Albeta", pct: 71, hoursLeft: 9.5, amps: 182, bladeLife: 64, operator: "Bhanwar Lal" },
  { id: "GS-2", unit: "Unit 1", kind: "Gang saw · 72 blades", status: "Running", block: "BW-1186", variety: "Banswara white", pct: 62, hoursLeft: 13, amps: 176, bladeLife: 41, operator: "Ramesh Gurjar" },
  { id: "MW-1", unit: "Unit 2", kind: "Multiwire · granite", status: "Running", block: "RB-0938", variety: "Rajasthan black", pct: 40, hoursLeft: 21, amps: 94, bladeLife: 77, operator: "Sohan Singh" },
  { id: "BC-1", unit: "Unit 3", kind: "Block cutter · 3 m", status: "Blade change", pct: 0, hoursLeft: 1.5, amps: 0, bladeLife: 6, operator: "Imran Qureshi" },
  { id: "BR-1", unit: "Unit 3", kind: "Bridge cutter", status: "Idle", pct: 0, hoursLeft: 0, amps: 0, bladeLife: 58, operator: "—" },
  { id: "TL-1", unit: "Unit 4", kind: "Tile line · calibrate + polish", status: "Breakdown", variety: "Kishangarh green 2×2", pct: 34, hoursLeft: 0, amps: 0, bladeLife: 81, operator: "Mohan Kumawat" },
];

type Block = { no: string; quarry: string; variety: string; size: string; m3: number; cost: number; status: "In yard" | "On saw" | "Reserved" | "Arriving" };
const blocks: Block[] = [
  { no: "MK-2417", quarry: "Makrana, Dungri hill", variety: "Makrana Albeta", size: "2.9 × 1.7 × 1.6", m3: 7.89, cost: 6.3 * L, status: "On saw" },
  { no: "MK-2421", quarry: "Makrana, Ulodi", variety: "Makrana Albeta", size: "2.6 × 1.5 × 1.4", m3: 5.46, cost: 4.6 * L, status: "In yard" },
  { no: "MK-2424", quarry: "Makrana, Dungri hill", variety: "Makrana Dungri", size: "2.4 × 1.6 × 1.3", m3: 4.99, cost: 3.9 * L, status: "Reserved" },
  { no: "BW-1186", quarry: "Banswara, Tripura Sundari", variety: "Banswara white", size: "3.0 × 1.8 × 1.7", m3: 9.18, cost: 2.8 * L, status: "On saw" },
  { no: "BW-1190", quarry: "Banswara, Tripura Sundari", variety: "Banswara white", size: "2.8 × 1.7 × 1.5", m3: 7.14, cost: 2.2 * L, status: "In yard" },
  { no: "UP-3312", quarry: "Udaipur, Babarmal", variety: "Udaipur pink", size: "2.7 × 1.6 × 1.5", m3: 6.48, cost: 0.95 * L, status: "In yard" },
  { no: "UP-3315", quarry: "Udaipur, Babarmal", variety: "Udaipur pink", size: "2.5 × 1.5 × 1.4", m3: 5.25, cost: 0.8 * L, status: "Arriving" },
  { no: "JL-0712", quarry: "Jalore, Bishangarh", variety: "Jalore Rosy Pink", size: "3.1 × 1.9 × 1.8", m3: 10.6, cost: 2.4 * L, status: "Reserved" },
  { no: "RB-0938", quarry: "Jalore, Siwana", variety: "Rajasthan black", size: "2.6 × 1.6 × 1.5", m3: 6.24, cost: 3.1 * L, status: "On saw" },
  { no: "JY-0451", quarry: "Jaisalmer, Moolsagar", variety: "Jaisalmer yellow", size: "2.4 × 1.5 × 1.3", m3: 4.68, cost: 0.9 * L, status: "In yard" },
  { no: "KG-5520", quarry: "Rishabhdev, Kesariyaji", variety: "Kishangarh green", size: "2.5 × 1.4 × 1.4", m3: 4.9, cost: 1.1 * L, status: "Arriving" },
  { no: "DH-0287", quarry: "Dholpur, Bari", variety: "Dholpur beige", size: "2.8 × 1.6 × 1.2", m3: 5.38, cost: 0.85 * L, status: "In yard" },
];

type SlabRow = { variety: string; rack: string; thick: string; slabs: number; sqft: number; reserved: number; grade: string; texture: string };
const slabRows: SlabRow[] = [
  { variety: "Makrana Albeta", rack: "A-01 to A-06", thick: "18 mm", slabs: 142, sqft: 6820, reserved: 2400, grade: "Premium", texture: "linear-gradient(118deg,#f7f3ea 0 40%,#dcd6c9 41%,#f7f3ea 43% 70%,#cfc8b8 71%,#f4efe4 73%)" },
  { variety: "Makrana Dungri", rack: "A-07, A-08", thick: "18 mm", slabs: 64, sqft: 3010, reserved: 2200, grade: "Std", texture: "linear-gradient(105deg,#ece6d8 0 35%,#c9bfa9 36%,#ece6d8 39% 66%,#bdb39b 67%,#e8e1d1 70%)" },
  { variety: "Kishangarh green", rack: "B-01 to B-04", thick: "2×2 tile", slabs: 3800, sqft: 15200, reserved: 5200, grade: "Std", texture: "linear-gradient(125deg,#2f5a45 0 30%,#3f7a5c 31%,#244a38 45%,#4d8a6a 60%,#2a5240 80%)" },
  { variety: "Udaipur pink", rack: "B-05 to B-07", thick: "16 mm", slabs: 210, sqft: 9450, reserved: 4200, grade: "Std", texture: "linear-gradient(115deg,#e7b9a6 0 30%,#d99d86 31%,#efcbbc 50%,#d48f78 70%,#e9bfae 85%)" },
  { variety: "Jalore Rosy Pink", rack: "C-01 to C-05", thick: "18 mm", slabs: 188, sqft: 10340, reserved: 3300, grade: "Export", texture: "radial-gradient(circle at 20% 30%,#7d5a55 0 1.5px,transparent 2px) 0 0/7px 7px,radial-gradient(circle at 60% 70%,#f2d6cf 0 1.5px,transparent 2px) 0 0/9px 9px,#c99a90" },
  { variety: "Rajasthan black", rack: "C-06, C-07", thick: "20 mm", slabs: 72, sqft: 3240, reserved: 1800, grade: "Premium", texture: "radial-gradient(circle at 30% 40%,#4a4a4a 0 1px,transparent 1.5px) 0 0/6px 6px,#151515" },
  { variety: "Jaisalmer yellow", rack: "D-01, D-02", thick: "18 mm", slabs: 96, sqft: 4320, reserved: 2700, grade: "Std", texture: "linear-gradient(120deg,#e3be6c 0 30%,#d4a64c 31%,#ecd090 55%,#c9973d 75%,#e2bb66 90%)" },
  { variety: "Dholpur beige", rack: "D-03 to D-05", thick: "25 mm", slabs: 160, sqft: 7680, reserved: 4600, grade: "Std", texture: "repeating-linear-gradient(0deg,#e1c59b 0 4px,#d6b585 4px 6px,#e6cda7 6px 11px)" },
  { variety: "Kota stone", rack: "Ground E", thick: "25 mm", slabs: 1100, sqft: 22000, reserved: 9000, grade: "Rough", texture: "linear-gradient(135deg,#6f7d72 0 40%,#5d6b61 41%,#7a887c 70%,#64726a 100%)" },
  { variety: "Banswara white", rack: "A-09, A-10", thick: "18 mm", slabs: 58, sqft: 2610, reserved: 3600, grade: "Premium", texture: "linear-gradient(110deg,#f5f5f2 0 45%,#dfe2e2 46%,#f5f5f2 49% 80%,#d6d9d8 81%,#f2f2ee 84%)" },
];

/* ---- Rates ---- */
type Rate = { variety: string; grade: string; unit: string; ours: number; mandi: number; yday: number; trend: number[]; freight: number };
function trendOf(base: number, seed: number) {
  return Array.from({ length: 14 }, (_, i) => Math.round(base * (0.94 + 0.06 * Math.sin((i + seed) / 2.3) + i * 0.004)));
}
const seedRates: Rate[] = [
  { variety: "Makrana Albeta", grade: "Premium 18mm", unit: "sq ft", ours: 410, mandi: 395, yday: 390, trend: trendOf(392, 1), freight: 14 },
  { variety: "Makrana Dungri", grade: "Std 18mm", unit: "sq ft", ours: 285, mandi: 280, yday: 282, trend: trendOf(278, 3), freight: 14 },
  { variety: "Banswara white", grade: "Premium 18mm", unit: "sq ft", ours: 96, mandi: 92, yday: 91, trend: trendOf(90, 5), freight: 9 },
  { variety: "Kishangarh green", grade: "2×2 tile", unit: "sq ft", ours: 74, mandi: 70, yday: 71, trend: trendOf(70, 2), freight: 7 },
  { variety: "Udaipur pink", grade: "Std 16mm", unit: "sq ft", ours: 56, mandi: 54, yday: 55, trend: trendOf(54, 6), freight: 6 },
  { variety: "Jalore Rosy Pink", grade: "Export 18mm", unit: "sq ft", ours: 68, mandi: 66, yday: 64, trend: trendOf(63, 4), freight: 6 },
  { variety: "Rajasthan black", grade: "Premium 20mm", unit: "sq ft", ours: 112, mandi: 118, yday: 116, trend: trendOf(113, 7), freight: 8 },
  { variety: "Jaisalmer yellow", grade: "Std 18mm", unit: "sq ft", ours: 61, mandi: 60, yday: 60, trend: trendOf(59, 8), freight: 6 },
  { variety: "Dholpur beige", grade: "25mm sawn", unit: "sq ft", ours: 72, mandi: 69, yday: 70, trend: trendOf(69, 9), freight: 8 },
  { variety: "Kota stone", grade: "25mm rough", unit: "sq ft", ours: 29, mandi: 28, yday: 28, trend: trendOf(28, 10), freight: 4 },
  { variety: "Makrana block", grade: "Raw, per tonne", unit: "tonne", ours: 31500, mandi: 30800, yday: 30500, trend: trendOf(30200, 11), freight: 0 },
];

const freightLanes = [
  { lane: "Kishangarh → Jaipur", km: 105, perTonne: 520, trucks: 3 },
  { lane: "Kishangarh → Ahmedabad", km: 590, perTonne: 1650, trucks: 2 },
  { lane: "Kishangarh → Indore", km: 520, perTonne: 1500, trucks: 1 },
  { lane: "Kishangarh → Delhi NCR", km: 410, perTonne: 1320, trucks: 4 },
  { lane: "Kishangarh → Surat", km: 840, perTonne: 2150, trucks: 1 },
];

/* ---- Shared modules ---- */
const team: TeamMember[] = [
  { name: "Rajendra Agarwal", role: "Owner", status: "Busy", load: 96, focus: "Calling the four biggest dealers himself; Malwa terms decision", tasks: [{ title: "Call Om Prakash ji after 4", due: "4:00" }, { title: "Decide Malwa 60-day terms", due: "12:30" }, { title: "Bank: CC limit renewal papers", due: "3:00" }], week: [1, 1, 1, 1, 1, 1], since: "1998" },
  { name: "Pooja Agarwal", role: "Accounts head, Tally", status: "Busy", load: 84, focus: "Bill-wise matching of 9 receipts from last week", tasks: [{ title: "Match RTGS from Mahakal", due: "11:00", done: true }, { title: "GSTR-1 draft for October", due: "Thu" }, { title: "Ledger confirmations to 6 dealers", due: "5:00" }], week: [1, 1, 1, 1, 1, 0], since: "2012" },
  { name: "Kavita Choudhary", role: "Calling desk, recovery", status: "Busy", load: 78, focus: "24 calls on today's sheet, 9 done", tasks: [{ title: "Hadoti broken promise follow-up", due: "now" }, { title: "Gwalior: try son's second number", due: "2:00" }], week: [1, 1, 1, 1, 1, 1], since: "2021" },
  { name: "Imran Qureshi", role: "Yard supervisor", status: "On floor", load: 88, focus: "Block cutter blade change, tile line breakdown", tasks: [{ title: "BC-1 blade change", due: "12:00" }, { title: "Shift 40 slabs to rack A-09", due: "3:00" }, { title: "Crane service log", due: "6:00" }], week: [1, 1, 1, 1, 1, 1], since: "2009" },
  { name: "Bhanwar Lal Jat", role: "Gang saw in-charge, Unit 1", status: "On floor", load: 72, focus: "GS-1 on Makrana block MK-2417, 71% through", tasks: [{ title: "Slurry tank clean", due: "1:00" }, { title: "Blade tension check GS-2", due: "4:30" }], week: [1, 1, 1, 1, 1, 1], since: "2004" },
  { name: "Devendra Sharma", role: "Sales, Gujarat & south Rajasthan", status: "In field", load: 70, focus: "At Sabarmati Stone Depot to collect the PDC", tasks: [{ title: "Collect ₹5 L PDC", due: "Sat" }, { title: "Rate card to 4 Surat dealers", due: "5:00" }], week: [1, 1, 0, 1, 1, 1], since: "2016" },
  { name: "Karan Rathore", role: "Sales, Delhi NCR & Gwalior", status: "In field", load: 66, focus: "Kirti Nagar market rounds, Raj Marble Bazaar visit", tasks: [{ title: "Visit Faridabad Granite Hub", due: "Thu" }, { title: "Sample slabs to Cyber City", due: "Wed" }], week: [1, 1, 1, 0, 1, 1], since: "2019" },
  { name: "Sunil Meena", role: "Dispatch, weighbridge, e-way bills", status: "On floor", load: 58, focus: "3 trucks out today, GJ-03 BV 1190 held at gate", tasks: [{ title: "E-way bill for SO-2276", due: "8:00", done: true }, { title: "Weighbridge slip for RJ-01 GC 8823", due: "11:00", done: true }, { title: "Release or unload GJ-03 BV 1190", due: "owner call" }], week: [1, 1, 1, 1, 1, 1], since: "2017" },
];

const agents: WorkforceAgent[] = [
  { name: "Baqaya Caller", role: "Builds the daily call sheet and sends polite reminders", icon: PhoneCall, status: "Needs you", runsToday: 6, hoursSaved: 7, accuracy: 92, last: "6 min ago", skills: ["Tally bill-wise", "WhatsApp", "Hindi + Gujarati"], schedule: "8 AM sheet, 5 PM reminders", inbox: [{ title: "Send 9 reminders for 90+ bills?", detail: "Drafted in Hindi with ledger PDFs. Kathiawar left out because of the open breakage dispute." }], log: ["Built today's call sheet: 24 dealers, ranked by ₹ × days", "Logged Raj Marble Bazaar promise ₹8 L for Friday", "Flagged Hadoti broken promise to Kavita"] },
  { name: "Credit Guard", role: "Holds dispatch when a dealer is over limit or 90+", icon: Ban, status: "Needs you", runsToday: 4, hoursSaved: 3, accuracy: 96, last: "28 min ago", skills: ["Credit limits", "Gate pass", "E-way bill"], schedule: "On every loading slip", inbox: [{ title: "Release GJ-03 BV 1190 for Kathiawar?", detail: "Over limit by ₹1.9 L with ₹3.6 L above 90 days. Recommend release only against a ₹2 L RTGS." }], log: ["Held SO-2278 at gate, Kathiawar over limit", "Cleared SO-2276 for Bhoj, within limit", "Warned Malwa will cross limit with SO-2289"] },
  { name: "Rate Watcher", role: "Reads Kishangarh mandi rates and competitor price lists", icon: TrendingUp, status: "Running", runsToday: 3, hoursSaved: 2, accuracy: 89, last: "1 h ago", skills: ["Mandi rates", "Dealer groups", "Price lists"], schedule: "9 AM and 3 PM", log: ["Rajasthan black up ₹2 in mandi, we are ₹6 below", "Makrana Albeta firm at ₹395", "Jalore granite up 3% this week"] },
  { name: "Saw Monitor", role: "Watches amps, coolant and blade life on every saw", icon: GaugeIcon, status: "Running", runsToday: 48, hoursSaved: 4, accuracy: 94, last: "just now", skills: ["Saw PLC", "Blade life", "Downtime"], schedule: "Every 15 min", log: ["TL-1 tile line stopped: calibrator belt", "BC-1 blade at 6% life, change started", "GS-1 steady at 182 A"] },
  { name: "Dispatch Clerk", role: "Weighbridge slips, e-way bills and LR to dealers", icon: Truck, status: "Running", runsToday: 5, hoursSaved: 3.5, accuracy: 97, last: "40 min ago", skills: ["E-way bill", "Weighbridge", "LR"], schedule: "On every loading", log: ["E-way bill 2817 4410 9921 for SO-2276", "LR photo sent to Bhoj Stone Traders", "Weighbridge 18.4 t matched invoice"] },
  { name: "Order Desk", role: "Turns WhatsApp and IndiaMART enquiries into quotes", icon: MessageCircle, status: "Idle", runsToday: 2, hoursSaved: 1.5, accuracy: 87, last: "2 h ago", skills: ["Rate card", "Freight", "Stock check"], schedule: "On new enquiry", log: ["Quoted Ajmer Tiles 3,100 sq ft Udaipur pink", "Checked rack A-01 for Cyber City Albeta", "Added freight to Gurugram at ₹1,320/t"] },
];

const independence: IndependenceData = {
  score: 31,
  history: [18, 20, 22, 24, 26, 29, 31],
  quote: "Dealers pay when I call, not when Kavita calls. That's the whole problem, and it's my fault.",
  pillars: [
    { name: "Collections", score: 22, note: "Top 6 dealers (₹93 L) only settle after Rajendra calls personally.", fixes: [{ title: "Daily call sheet with scripts", gain: 4 }, { title: "Auto ledger confirmations", gain: 2 }] },
    { name: "Credit decisions", score: 18, note: "Every dispatch to an over-limit dealer waits on a phone call to the owner.", fixes: [{ title: "Credit Guard rules", gain: 5 }, { title: "Limits reviewed monthly", gain: 2 }] },
    { name: "Pricing", score: 34, note: "Rates change by WhatsApp voice note; dealers get different prices.", fixes: [{ title: "One published rate card", gain: 3 }] },
    { name: "Yard & saws", score: 47, note: "Imran runs the yard well; blade orders still need owner sign-off.", fixes: [{ title: "Blade auto-reorder under ₹50k", gain: 2 }] },
    { name: "Dispatch", score: 42, note: "E-way bills are clean, but gate release needs the owner for 1 in 5 trucks.", fixes: [{ title: "Gate rules by limit", gain: 2 }] },
    { name: "Numbers", score: 26, note: "बकाया is known on the 1st of the month, from Tally export.", fixes: [{ title: "Live बकाया board", gain: 3 }] },
    { name: "Owner time", score: 28, note: "Owner spends 19 hours a week on the phone for money.", fixes: [{ title: "Hand top 6 to Kavita, script + backup", gain: 3 }] },
  ],
  ownerHours: [
    { label: "Dues calls", hours: 19 },
    { label: "Credit OKs", hours: 6 },
    { label: "Rates", hours: 4 },
    { label: "Yard rounds", hours: 7 },
    { label: "Bank", hours: 3 },
    { label: "New dealers", hours: 2 },
    { label: "Strategy", hours: 1 },
  ],
};

const integrations: Integration[] = [
  { name: "Tally Prime", category: "Accounts", status: "Connected", detail: "Bill-wise dealer ledgers, sales and receipts, both ways.", synced: "4 min ago", records: "18,420 vouchers", mark: "T", color: "#1c4f9c" },
  { name: "WhatsApp Business", category: "Messaging", status: "Connected", detail: "Dealer groups, reminders, rate cards, LR photos.", synced: "just now", records: "3,880 chats", mark: "W", color: "#1f9d55" },
  { name: "E-way bill (NIC)", category: "Compliance", status: "Connected", detail: "Generate and extend e-way bills from loading slips.", synced: "40 min ago", records: "612 this FY", mark: "EW", color: "#334155" },
  { name: "GST portal", category: "Compliance", status: "Connected", detail: "GSTR-1 and 2B reconciliation.", synced: "Yesterday", records: "Oct draft", mark: "GST", color: "#7c4a1e" },
  { name: "Saw PLCs (4 units)", category: "Yard", status: "Syncing", detail: "Amps, coolant flow and run hours from 6 machines.", synced: "live", records: "6 machines", mark: "PLC", color: "#a4532c" },
  { name: "Kishangarh weighbridge", category: "Yard", status: "Connected", detail: "Gross and tare weights, matched to invoices.", synced: "11:02 AM", records: "3 trucks today", mark: "WB", color: "#6b5b2e" },
  { name: "ICICI current account", category: "Bank", status: "Connected", detail: "RTGS, NEFT and UPI credits matched to dealers.", synced: "9 min ago", records: "1,240 credits", mark: "IC", color: "#b02a30" },
  { name: "Truck GPS (FASTag)", category: "Logistics", status: "Error", detail: "Token expired. Truck locations paused since yesterday.", synced: "1 day ago", records: "—", mark: "GPS", color: "#d97706" },
  { name: "IndiaMART leads", category: "Sales", status: "Available", detail: "Pull buyer enquiries straight into the order board.", synced: "—", records: "—", mark: "IM", color: "#2563eb" },
];

/* ============================================================
   Config
   ============================================================ */

const config: DeskConfig = {
  slug: "stone-yard",
  company: "Aravalli Stone Yard",
  brand: "Aravalli",
  city: "Kishangarh",
  state: "RJ",
  icon: Mountain,
  tagline: "Marble, granite and sandstone · 4 cutting units · 18 dealers across Rajasthan, Gujarat, MP and Delhi NCR",
  owner: { name: "Rajendra Agarwal", first: "Rajendra", initials: "RA", role: "Owner" },
  theme: {
    variant: "ledger",
    paper: "#f6efe3",
    panel: "#fbf7f0",
    sunk: "#ece2d1",
    ink: "#2a1d14",
    mute: "#7b6552",
    line: "#dccab2",
    accent: "#a4532c",
    accentInk: "#fff8f1",
    soft: "#f3dfcf",
    ok: "#4d7a3c",
    warn: "#c08326",
    late: "#a3302a",
    info: "#4b6d86",
    heading: "sans",
    radius: 6,
  },
  pulse: [
    { label: "बकाया", value: "₹1.65 Cr", delta: "-3%", good: true, trend: [1.78, 1.76, 1.74, 1.72, 1.7, 1.68, 1.65], module: "baqaya" },
    { label: "90+ days", value: "₹21.4 L", delta: "+8%", good: false, trend: [17, 18, 18, 19, 20, 21, 21.4], tone: "late", module: "baqaya" },
    { label: "Saws running", value: "3 of 6", trend: [5, 5, 4, 4, 3, 3, 3], module: "yard" },
  ],
  agenda: [
    { at: 9, title: "Call sheet out", detail: "24 dealers ranked by ₹ × days", count: 24, tone: "accent", module: "calls" },
    { at: 10, title: "Mandi rates", detail: "Rajasthan black up ₹2", count: 11, tone: "info", module: "rates" },
    { at: 12, title: "Gate hold: Kathiawar truck", detail: "GJ-03 BV 1190 waiting", count: 1, tone: "late", module: "orders" },
    { at: 12.5, title: "Malwa 60-day terms", detail: "₹15.6 L outstanding, over limit", tone: "warn", module: "dealers" },
    { at: 16, title: "Owner's 4 calls", detail: "Marudhar, Gwalior, Faridabad, Malwa", count: 4, tone: "late", module: "calls" },
    { at: 18, title: "Bhoj NEFT due", detail: "₹1.5 L promised by 6 PM", count: 1, tone: "ok", module: "baqaya" },
  ],
  activity: [
    { time: "11:40 AM", text: "Raj Marble Bazaar promised ₹8 L by RTGS on Friday", tone: "ok" },
    { time: "11:12 AM", text: "Kathiawar still disputes ₹1.4 L breakage on Jalore granite", tone: "warn" },
    { time: "11:02 AM", text: "Weighbridge: RJ-01 GC 8823 at 18.4 t, matched to invoice", tone: "info" },
    { time: "10:20 AM", text: "Tile line TL-1 stopped: calibrator belt snapped", tone: "late" },
    { time: "9:35 AM", text: "Credit Guard held SO-2278 at the gate", tone: "late" },
    { time: "9:05 AM", text: "Mahakal Granites RTGS ₹1.2 L matched in Tally", tone: "ok" },
  ],
  asks: [
    { q: "Kitna बकाया hai, and where is it stuck?", a: "₹1.65 Cr across 18 dealers.\n\n• Delhi NCR ₹49.3 L, Gujarat ₹42.1 L, Rajasthan ₹41 L, MP ₹32.4 L.\n• ₹21.4 L is above 90 days, spread over 9 dealers. The worst are Kathiawar Granite (₹3.6 L, 141 days, under dispute), Raj Marble Bazaar (₹3.2 L) and Gwalior Stone Point (₹2.5 L, 128 days).\n• Three dealers are over their credit limit: Marudhar, Kathiawar and Malwa.\n\nThis week ₹19.5 L is promised, ₹8 L of it from Raj Marble Bazaar on Friday.", sources: ["Tally bill-wise", "Call sheet", "Promises"] },
    { q: "Who should I call personally today?", a: "Four dealers only move when you call:\n\n1. Marudhar Granites, Jodhpur: ₹9.4 L, 118 days, two bounced cheques. Om Prakash ji asked for a call after 4.\n2. Malwa Marble Mart, Indore: ₹15.6 L, wants 60-day terms. Offer 45 days on the new order only if he clears the ₹2.5 L above 90 days.\n3. Gwalior Stone Point: ₹6 L, 128 days. Owner unwell, speak to his son.\n4. Faridabad Granite Hub: ₹5.2 L, pays only on visits. Karan is there Thursday.\n\nKavita can handle the other 20.", sources: ["Call sheet", "Call log"] },
    { q: "Should I release the Kathiawar truck at the gate?", a: "Not yet. Kathiawar is ₹1.9 L over its ₹6 L limit and ₹3.6 L is older than 90 days. They also dispute ₹1.4 L for breakage.\n\nSuggested: release GJ-03 BV 1190 against a ₹2 L RTGS today, and settle the breakage claim at 50% with the loading photos. That keeps a ₹2.2 L order moving and brings 90+ down.", sources: ["Credit Guard", "Loading photos", "Tally"] },
    { q: "Which saw is losing me money today?", a: "The tile line TL-1 in Unit 4. It stopped at 10:20 AM when the calibrator belt snapped, with 34% of the Kishangarh green 2×2 batch done. Every idle hour costs about 620 sq ft, roughly ₹46,000 of tiles.\n\nBC-1 is in a planned blade change (1.5 h). BR-1 is idle because no block is reserved for it. Moving block JY-0451 to BR-1 would use the idle time.", sources: ["Saw PLCs", "Yard log"] },
    { q: "Are my rates in line with the mandi?", a: "Mostly, slightly above. Two to act on:\n\n• Rajasthan black: we sell at ₹112, the mandi is at ₹118 and rising. Raise to ₹116.\n• Makrana Albeta: ₹410 against a mandi rate of ₹395. Fine for premium slabs, but Cyber City wants 2,400 sq ft and may push back.\n\nThe others are within ₹4 of the mandi.", sources: ["Kishangarh mandi", "Rate card"] },
    { q: "Draft a reminder for Gwalior Stone Point", a: "Draft (not sent):\n\n“Namaste Tomar ji, hope uncle ji is recovering well. A small reminder from Aravalli Stone Yard: ₹6.0 L बकाया hai, the oldest bill is from June (128 days). Even ₹2 L this week would help us keep your next Kota stone order moving. Ledger PDF attached. — Kavita, Aravalli Stone Yard”", sources: ["Tally ledger", "Call log"] },
  ],
  run: {
    label: "Runs every morning at 8. You can also run it now.",
    title: "Baqaya Caller",
    steps: [
      { text: "Pull bill-wise outstanding for 18 dealers from Tally", result: "₹1.65 Cr, 74 open bills" },
      { text: "Match yesterday's bank credits to dealer bills", result: "3 receipts matched, ₹6.1 L" },
      { text: "Check promises due and broken", result: "5 open, 1 broken (Hadoti)" },
      { text: "Rank dealers by ₹ × days and credit limit", result: "4 for owner, 20 for Kavita" },
      { text: "Draft reminders and ledger PDFs", result: "9 WhatsApp drafts in Hindi" },
    ],
    outcome: "₹19.5 L is promised this week. Calling Marudhar and Malwa yourself today could bring in another ₹6 L above 90 days. Kathiawar's truck should go only against a ₹2 L RTGS.",
    actions: ["Send 9 reminders", "Give Kavita the 20-dealer sheet", "Hold Kathiawar truck", "Schedule owner calls at 4 PM"],
  },
};

/* ============================================================
   Desk
   ============================================================ */

export default function StoneYardDesk() {
  const [dealers, setDealers] = React.useState(seedDealers);
  const [promises, setPromises] = React.useState(seedPromises);
  const [calls, setCalls] = React.useState(seedCalls);
  const [orders, setOrders] = React.useState(seedOrders);
  const [collected, setCollected] = React.useState(4.3 * L);
  const [openDealer, setOpenDealer] = React.useState<string | null>(null);
  const [logFor, setLogFor] = React.useState<string | null>(null);

  const receive = React.useCallback((id: string, amount: number) => {
    setDealers((cur) => cur.map((x) => (x.id === id ? applyReceipt(x, amount) : x)));
    setCollected((c) => c + amount);
  }, []);

  const ctx: Ctx = { dealers, setDealers, promises, setPromises, calls, setCalls, orders, setOrders, collected, receive, openDealer: setOpenDealer, logCall: setLogFor };
  const total = dealers.reduce((a, x) => a + owed(x), 0);

  const modules: DeskModule[] = [
    {
      id: "baqaya",
      label: "बकाया board",
      group: "Money",
      title: "बकाया board",
      blurb: `${inr(total, { compact: true })} owed by ${dealers.length} dealers. Every slab is a dealer, its height is what they owe and its layers show how old the money is.`,
      icon: IndianRupee,
      count: dealers.filter((x) => x.buckets[3] > 0).length,
      notes: ["Each standing slab on the racks is one dealer. Taller means more money owed.", "The layers inside a slab are its age: cream is fresh, laterite red is over 90 days, at the base.", "Click a slab for the Tally ledger, promises, call log and a WhatsApp reminder."],
      render: () => (
        <>
          <BaqayaHome ctx={ctx} />
          {/* The home is always mounted, so the dealer sheet and call form live here and every module can open them. */}
          <DealerSheet ctx={ctx} id={openDealer} onClose={() => setOpenDealer(null)} />
          <LogCallModal ctx={ctx} dealerId={logFor} onClose={() => setLogFor(null)} />
        </>
      ),
    },
    { id: "calls", label: "Call sheet", group: "Money", count: calls.filter((c) => c.when.startsWith("Today")).length, title: "Call sheet", blurb: "Who to call, in what order, and what they said last time", icon: Phone, render: () => <CallsTab ctx={ctx} /> },
    { id: "dealers", label: "Dealers", group: "Trade", count: dealers.length, title: "Dealers", blurb: "Credit limits, terms and behaviour for every dealer across four states", icon: Users, render: () => <DealersTab ctx={ctx} /> },
    { id: "orders", label: "Dealer orders", group: "Trade", count: orders.filter((o) => o.stage !== "loaded").length, title: "Dealer orders", blurb: "From WhatsApp enquiry to a loaded truck. Credit Guard checks every gate pass.", icon: ClipboardList, render: () => <OrdersTab ctx={ctx} /> },
    { id: "rates", label: "Mandi rates", group: "Trade", count: seedRates.length, title: "Mandi rates", blurb: "Today's Kishangarh mandi against our rate card, and the freight to each market", icon: Scale, render: () => <RatesTab /> },
    { id: "yard", label: "Yard & saws", group: "Yard", count: 6, title: "Yard & saws", blurb: "Six machines across four cutting units, blocks in the yard and slabs on the racks", icon: Factory, render: () => <YardTab /> },
    { id: "team", label: "People", group: "Office", title: "People", blurb: "Yard, calling desk, sales and accounts: who is carrying what today", icon: Users, render: () => <PeopleModule members={team} /> },
    { id: "agents", label: "Agents", group: "Office", title: "Agents", blurb: "Six AI agents doing the calling, checking and paperwork", icon: Bot, render: () => <AgentsModule agents={agents} /> },
    { id: "independence", label: "Independence", group: "Office", title: "Owner independence", blurb: "How much of Aravalli runs without Rajendra on the phone", icon: GaugeIcon, render: () => <IndependenceModule data={independence} /> },
    { id: "connections", label: "Connections", group: "Office", title: "Connections", blurb: "Tally, WhatsApp, e-way bills, the weighbridge and the saw PLCs", icon: Plug, render: () => <ConnectionsModule items={integrations} /> },
  ];

  return <DeskShell config={config} modules={modules} />;
}

type Ctx = {
  dealers: Dealer[];
  setDealers: React.Dispatch<React.SetStateAction<Dealer[]>>;
  promises: Promise_[];
  setPromises: React.Dispatch<React.SetStateAction<Promise_[]>>;
  calls: Call[];
  setCalls: React.Dispatch<React.SetStateAction<Call[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  collected: number;
  receive: (id: string, amount: number) => void;
  openDealer: (id: string | null) => void;
  logCall: (id: string | null) => void;
};

const nameOf = (dealers: Dealer[], id: string) => dealers.find((x) => x.id === id)?.name ?? id;

/* ---------------- Home: बकाया board ---------------- */

function BaqayaHome({ ctx }: { ctx: Ctx }) {
  const desk = useDesk();
  const { dealers, promises } = ctx;
  const [region, setRegion] = React.useState<"All" | Region>("All");
  const [age, setAge] = React.useState<number | null>(null);
  const shown = dealers.filter((x) => region === "All" || x.region === region);
  const total = shown.reduce((a, x) => a + owed(x), 0);
  const strata = AGE.map((a, i) => shown.reduce((s, x) => s + x.buckets[i], 0));
  const count = useCountUp(total);
  const open = promises.filter((p) => p.status === "open");
  const overLimit = dealers.filter((x) => owed(x) > x.limit);

  return (
    <div className="space-y-8">
      {/* Headline + strata + region index */}
      <section className="desk-rise grid gap-8 lg:grid-cols-[1.35fr_1fr]">
        <div>
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.22em] text-d-accent">कुल बकाया · total outstanding{region !== "All" && ` · ${region}`}</p>
          <p className="desk-h tnum mt-2 text-[64px] font-bold leading-none tracking-[-0.04em] sm:text-[84px]">{inr(count, { compact: true })}</p>
          <p className="mt-2 text-[14px] text-d-mute">
            {shown.length} dealers · {inr(strata[3], { compact: true })} older than 90 days · collected today <b className="text-d-ok">{inr(ctx.collected, { compact: true })}</b>
          </p>
          <div className="mt-5">
            <div className="flex h-[54px] overflow-hidden rounded-[6px] shadow-[inset_0_-6px_0_rgba(0,0,0,0.08)]">
              {AGE.map((a, i) => {
                const pct = total ? (strata[i] / total) * 100 : 0;
                const on = age === null || age === i;
                return (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() => setAge(age === i ? null : i)}
                    className="desk-growx relative flex flex-col justify-end overflow-hidden px-2 pb-1.5 text-left transition-opacity"
                    style={{ width: `${pct}%`, background: `repeating-linear-gradient(170deg, transparent 0 7px, rgba(255,255,255,0.12) 7px 8px), ${a.color}`, color: a.ink, opacity: on ? 1 : 0.35, animationDelay: `${i * 90}ms` }}
                    title={`${a.label}: ${inr(strata[i])}`}
                  >
                    {pct > 9 && <span className="tnum font-mono text-[12px] font-semibold">{inr(strata[i], { compact: true })}</span>}
                    {pct > 13 && <span className="truncate text-[10.5px] opacity-80">{a.label}</span>}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[12px] text-d-mute">Tap a layer to light up the dealers who owe money that old.</p>
          </div>
        </div>
        <div>
          <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-[0.22em] text-d-mute">By market</p>
          <ul className="divide-y divide-d-line border-y border-d-line">
            {(["All", ...REGIONS] as const).map((r) => {
              const list = dealers.filter((x) => r === "All" || x.region === r);
              const sum = list.reduce((a, x) => a + owed(x), 0);
              const old = list.reduce((a, x) => a + x.buckets[3], 0);
              const on = region === r;
              return (
                <li key={r}>
                  <button type="button" onClick={() => setRegion(r)} className={`flex w-full items-center gap-3 px-2 py-2.5 text-left transition-colors ${on ? "bg-d-soft" : "hover:bg-d-sunk/60"}`}>
                    <span className={`w-2 self-stretch rounded-full ${on ? "bg-d-accent" : "bg-transparent"}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-semibold">{r === "All" ? "All four markets" : r}</span>
                      <span className="block text-[11.5px] text-d-mute">
                        {list.length} dealers · 90+ {inr(old, { compact: true })}
                      </span>
                    </span>
                    <span className="tnum font-mono text-[14px] font-semibold">{inr(sum, { compact: true })}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Promised this week" value={inr(open.reduce((a, p) => a + p.amount, 0), { compact: true })} delta="+₹8 L" hint={`${open.length} promises open`} icon={HandCoins} tone="ok" trend={[6, 8, 9, 11, 14, 17, 19.5]} onClick={() => desk.goTab("calls")} />
        <Stat label="Older than 90 days" value={inr(dealers.reduce((a, x) => a + x.buckets[3], 0), { compact: true })} delta="+8%" deltaGood={false} hint={`${dealers.filter((x) => x.buckets[3] > 0).length} dealers`} icon={AlertTriangle} tone="late" trend={[15, 16, 17, 18, 19, 20, 21.4]} />
        <Stat label="Over credit limit" value={overLimit.length} hint={overLimit.map((x) => x.name.split(" ")[0]).join(", ")} icon={Ban} tone="warn" trend={[1, 1, 2, 2, 3, 3, overLimit.length]} onClick={() => desk.goTab("dealers")} />
        <Stat label="Days to collect (DSO)" value="68" delta="+5" deltaGood={false} hint="terms are 45 days" icon={CalendarClock} trend={[58, 60, 61, 63, 64, 66, 68]} />
      </div>

      <Panel live title="Dealer racks" sub="Each slab is a dealer. Height = money owed, layers = age, oldest at the base. A notch on top means a promise is open." action={<Segmented size="sm" options={["All", ...REGIONS] as const} value={region} onChange={setRegion} />}>
        <SlabRacks dealers={dealers} region={region} age={age} promises={promises} onPick={(id) => ctx.openDealer(id)} />
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <PromisesPanel ctx={ctx} />
        <Panel icon={TrendingUp} title="Receipts by week" sub="RTGS, NEFT, UPI and cheques matched in Tally">
          <Bars
            height={200}
            format={(v) => `₹${v}L`}
            data={[
              { label: "8 Sep", value: 21.4 },
              { label: "15 Sep", value: 18.2 },
              { label: "22 Sep", value: 24.8 },
              { label: "29 Sep", value: 16.1 },
              { label: "6 Oct", value: 19.6 },
              { label: "13 Oct", value: 14.3, tone: "warn" },
              { label: "This wk", value: Math.round((ctx.collected / L) * 10) / 10, tone: "ok", note: "so far" },
            ]}
          />
          <p className="mt-3 text-[12.5px] text-d-mute">Sales in the same period were ₹1.38 Cr, so बकाया is growing about ₹3 L a week.</p>
        </Panel>
      </div>
    </div>
  );
}

function useCountUp(target: number) {
  const [value, setValue] = React.useState(0);
  const from = React.useRef(0);
  React.useEffect(() => {
    const start = performance.now();
    const begin = from.current;
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / 900);
      const v = begin + (target - begin) * (1 - Math.pow(1 - k, 3));
      setValue(v);
      from.current = v;
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return value;
}

function SlabRacks({ dealers, region, age, promises, onPick }: { dealers: Dealer[]; region: "All" | Region; age: number | null; promises: Promise_[]; onPick: (id: string) => void }) {
  const [hover, setHover] = React.useState<string | null>(null);
  const [sort, setSort] = React.useState<"owed" | "age">("owed");
  const max = Math.max(...dealers.map(owed));
  const H = 250;
  const focus = dealers.find((x) => x.id === hover) ?? null;
  const promised = new Set(promises.filter((p) => p.status === "open").map((p) => p.dealer));
  const racks = REGIONS.filter((r) => region === "All" || r === region);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-[11.5px] text-d-mute">
          {AGE.map((a) => (
            <span key={a.key} className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-[2px] ring-1 ring-black/10" style={{ background: a.color }} /> {a.label}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-4 rounded-full bg-d-ok" /> promise open
          </span>
        </div>
        <Segmented size="sm" options={[{ value: "owed", label: "Tallest first" }, { value: "age", label: "Oldest first" }] as const} value={sort} onChange={setSort} />
      </div>
      <div className="desk-scroll -mx-5 overflow-x-auto px-5">
        <div className="flex min-w-[760px] items-end gap-5">
          {racks.map((r) => {
            const list = dealers.filter((x) => x.region === r).sort((a, b) => (sort === "owed" ? owed(b) - owed(a) : b.oldest - a.oldest));
            const sum = list.reduce((a, x) => a + owed(x), 0);
            return (
              <div key={r} className="flex flex-1 flex-col items-stretch">
                <div className="flex items-end justify-center gap-[7px] px-3" style={{ height: H + 34 }}>
                  {list.map((x, i) => {
                    const h = Math.max(30, (owed(x) / max) * H);
                    const lit = age === null || x.buckets[age] > 0;
                    const tilt = i % 2 === 0 ? -2.2 : 1.6;
                    return (
                      <button
                        key={x.id}
                        type="button"
                        onMouseEnter={() => setHover(x.id)}
                        onMouseLeave={() => setHover((h0) => (h0 === x.id ? null : h0))}
                        onFocus={() => setHover(x.id)}
                        onClick={() => onPick(x.id)}
                        aria-label={`${x.name}, ${inr(owed(x))}`}
                        className="group relative flex w-[38px] shrink-0 flex-col transition-[transform,opacity] duration-300 hover:-translate-y-1.5"
                        style={{ height: h + 22, opacity: lit ? 1 : 0.22, transform: `rotate(${tilt}deg)`, transformOrigin: "bottom center" }}
                      >
                        <span className="tnum mb-1 h-4 whitespace-nowrap text-center font-mono text-[10px] font-semibold text-d-ink">{inr(owed(x), { compact: true }).replace("₹", "").replace(" L", "L")}</span>
                        <span
                          className="desk-grow relative flex flex-1 flex-col-reverse overflow-hidden rounded-t-[3px] shadow-[2px_0_0_rgba(0,0,0,0.18),0_10px_14px_-10px_rgba(0,0,0,0.5)] ring-1 ring-black/15 group-hover:ring-2 group-hover:ring-d-accent"
                          style={{ animationDelay: `${i * 50}ms` }}
                        >
                          {[3, 2, 1, 0].map((bi) =>
                            x.buckets[bi] > 0 ? (
                              <span
                                key={bi}
                                style={{
                                  height: `${(x.buckets[bi] / owed(x)) * 100}%`,
                                  background: `repeating-linear-gradient(${105 + bi * 9}deg, transparent 0 6px, rgba(255,255,255,0.16) 6px 7px, transparent 7px 15px), ${AGE[bi].color}`,
                                  borderTop: "1px solid rgba(0,0,0,0.12)",
                                }}
                              />
                            ) : null,
                          )}
                          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <span className="whitespace-nowrap rounded-[2px] bg-[#fbf6ee]/85 px-[1px] py-1 text-[10px] font-semibold tracking-wide text-d-ink [writing-mode:vertical-rl] rotate-180">
                              {h > 70 ? x.name.split(" ").slice(0, 2).join(" ") : x.id}
                            </span>
                          </span>
                          {promised.has(x.id) && <span className="absolute left-1 right-1 top-1 h-1.5 rounded-full bg-d-ok shadow-[0_0_0_1.5px_rgba(255,255,255,0.8)]" />}
                          {x.hold && <span className="absolute top-3.5 left-1/2 -translate-x-1/2 rounded-[2px] bg-d-late px-0.5 text-[8px] font-bold uppercase leading-[11px] text-white">hold</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {/* A-frame base */}
                <div className="relative h-5">
                  <div className="absolute inset-x-0 top-0 h-[5px] rounded-[2px] bg-d-ink/80" />
                  <div className="absolute left-[12%] top-[5px] h-[14px] w-[4px] -skew-x-[18deg] bg-d-ink/60" />
                  <div className="absolute right-[12%] top-[5px] h-[14px] w-[4px] skew-x-[18deg] bg-d-ink/60" />
                </div>
                <div className="mt-1 flex items-baseline justify-between border-t border-dashed border-d-line px-1 pt-1.5">
                  <span className="text-[12.5px] font-semibold">{r}</span>
                  <span className="tnum font-mono text-[12px] text-d-mute">{inr(sum, { compact: true })}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-4 min-h-[64px] rounded-[6px] border border-d-line bg-d-panel/70 px-4 py-3">
        {focus ? (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="min-w-[180px]">
              <p className="text-[14.5px] font-semibold">{focus.name}</p>
              <p className="text-[12px] text-d-mute">
                {focus.town} · {focus.contact} · {focus.salesman}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {AGE.map((a, i) => (
                <span key={a.key} className="tnum rounded-[3px] px-2 py-0.5 font-mono text-[11.5px]" style={{ background: a.color, color: a.ink }}>
                  {a.key}: {inr(focus.buckets[i], { compact: true })}
                </span>
              ))}
            </div>
            <span className="ml-auto text-[12.5px]">
              Limit {inr(focus.limit, { compact: true })} · <span style={{ color: owed(focus) > focus.limit ? "var(--d-late)" : "var(--d-ok)" }}>{Math.round((owed(focus) / focus.limit) * 100)}% used</span>
            </span>
          </div>
        ) : (
          <p className="text-[12.5px] text-d-mute">Hover a slab to read it. Click it for the full ledger, promises and a reminder.</p>
        )}
      </div>
    </div>
  );
}

function PromisesPanel({ ctx }: { ctx: Ctx }) {
  const desk = useDesk();
  const { promises, setPromises, dealers } = ctx;
  function settle(p: Promise_, kept: boolean) {
    setPromises((cur) => cur.map((x) => (x.id === p.id ? { ...x, status: kept ? "kept" : "broken" } : x)));
    if (kept) {
      ctx.receive(p.dealer, p.amount);
      toast.success(`${inr(p.amount, { compact: true })} received`, { description: `${nameOf(dealers, p.dealer)} · applied to oldest bills in Tally` });
      desk.log(`${nameOf(dealers, p.dealer)} paid ${inr(p.amount, { compact: true })} by ${p.mode}`, "ok");
    } else {
      toast.error("Promise marked broken", { description: `${nameOf(dealers, p.dealer)} moves to the top of tomorrow's call sheet` });
      desk.log(`${nameOf(dealers, p.dealer)} broke a ${inr(p.amount, { compact: true })} promise`, "late");
    }
  }
  return (
    <Panel icon={HandCoins} title="Promises (वादे) this week" sub="Mark kept when the money lands; the board updates instantly" action={<Btn size="sm" icon={Phone} onClick={() => desk.goTab("calls")}>Call sheet</Btn>}>
      <ul className="divide-y divide-d-line">
        {promises.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-3 py-2.5">
            <Avatar name={nameOf(dealers, p.dealer)} size={30} tone={p.status === "broken" ? "late" : p.status === "kept" ? "ok" : "accent"} />
            <button type="button" onClick={() => ctx.openDealer(p.dealer)} className="min-w-0 flex-1 text-left">
              <p className="truncate text-[13.5px] font-semibold hover:text-d-accent">{nameOf(dealers, p.dealer)}</p>
              <p className="text-[12px] text-d-mute">
                {p.mode} · {p.due}
                {p.status === "open" && p.inHours > 0 && (
                  <>
                    {" · "}
                    <Countdown compact inHours={p.inHours} />
                  </>
                )}
              </p>
            </button>
            <span className="tnum font-mono text-[13.5px] font-semibold">{inr(p.amount, { compact: true })}</span>
            {p.status === "open" ? (
              <span className="flex gap-1.5">
                <Btn size="sm" variant="ghost" onClick={() => settle(p, false)}>
                  Broken
                </Btn>
                <Btn size="sm" variant="solid" icon={CheckCheck} onClick={() => settle(p, true)}>
                  Kept
                </Btn>
              </span>
            ) : (
              <Pill tone={p.status === "kept" ? "ok" : "late"}>{p.status === "kept" ? "Received" : "Broken"}</Pill>
            )}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ---------------- Dealer sheet (shared) ---------------- */

function DealerSheet({ ctx, id, onClose }: { ctx: Ctx; id: string | null; onClose: () => void }) {
  const desk = useDesk();
  const idx = ctx.dealers.findIndex((x) => x.id === id);
  const x = idx >= 0 ? ctx.dealers[idx] : null;
  const [tab, setTab] = React.useState<"Ledger" | "Promises" | "Calls">("Ledger");
  const [draft, setDraft] = React.useState(false);
  if (!x)
    return (
      <Sheet open={false} onOpenChange={() => onClose()} title="">
        {null}
      </Sheet>
    );
  const ledger = ledgerOf(x, idx);
  const pr = ctx.promises.filter((p) => p.dealer === x.id);
  const cl = ctx.calls.filter((c) => c.dealer === x.id);
  const kept = pr.filter((p) => p.status === "kept").length;
  return (
    <Sheet
      open={!!x}
      onOpenChange={(o) => {
        if (!o) {
          onClose();
          setDraft(false);
        }
      }}
      width={560}
      eyebrow={`${x.town}, ${regionShort[x.region]} · GSTIN ${x.gstin}`}
      title={x.name}
      sub={`${x.contact} · ${x.phone} · salesman ${x.salesman}`}
      footer={
        <>
          <Btn
            icon={x.hold ? CheckCheck : Ban}
            onClick={() => {
              ctx.setDealers((cur) => cur.map((d0) => (d0.id === x.id ? { ...d0, hold: !d0.hold } : d0)));
              toast(x.hold ? "Dispatch released" : "Dispatch on hold", { description: `${x.name} · Credit Guard and Sunil at the gate notified` });
              desk.log(`${x.name}: dispatch ${x.hold ? "released" : "put on hold"}`, x.hold ? "ok" : "warn");
            }}
          >
            {x.hold ? "Release dispatch" : "Hold dispatch"}
          </Btn>
          <Btn icon={Phone} onClick={() => ctx.logCall(x.id)}>
            Log call
          </Btn>
          <Btn variant="solid" icon={MessageCircle} onClick={() => setDraft(true)}>
            Send reminder
          </Btn>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11.5px] text-d-mute">बकाया</p>
            <p className="desk-h tnum text-[36px] font-bold leading-none">{inr(owed(x), { compact: true })}</p>
          </div>
          <div className="w-[52%]">
            <div className="flex justify-between text-[11.5px] text-d-mute">
              <span>Credit limit {inr(x.limit, { compact: true })}</span>
              <span style={{ color: owed(x) > x.limit ? "var(--d-late)" : undefined }}>{Math.round((owed(x) / x.limit) * 100)}%</span>
            </div>
            <Meter value={owed(x)} max={x.limit} tone={owed(x) > x.limit ? "late" : owed(x) / x.limit > 0.8 ? "warn" : "ok"} height={8} className="mt-1" />
          </div>
        </div>
        <AgingBar buckets={AGE.map((a, i) => ({ label: a.label, value: x.buckets[i], tone: a.tone }))} format={(v) => inr(v, { compact: true })} />
        {x.dispute && (
          <p className="flex items-start gap-2 rounded-[6px] border border-d-warn/40 bg-[color-mix(in_oklab,var(--d-warn)_10%,var(--d-panel))] px-3 py-2 text-[12.5px]">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-d-warn" /> Dispute: {x.dispute}
          </p>
        )}
        <KV
          cols={3}
          items={[
            { k: "Oldest bill", v: `${x.oldest} days` },
            { k: "Terms", v: `${x.terms} days` },
            { k: "Last payment", v: `${inr(x.lastPay.amount, { compact: true })} · ${x.lastPay.date}` },
            { k: "Promises kept", v: pr.length ? `${kept} of ${pr.length}` : "—" },
            { k: "Calls logged", v: cl.length },
            { k: "Dispatch", v: x.hold ? <Pill tone="late">On hold</Pill> : <Pill tone="ok">Open</Pill> },
          ]}
        />
        <p className="text-[12.5px] italic text-d-mute">{x.note}</p>
        {draft && (
          <div className="desk-rise space-y-2">
            <div className="rounded-[10px] bg-[#e7f6e9] p-3.5 text-[13px] leading-relaxed text-[#1d3b22]">
              Namaste {x.contact.split(" ")[0]} ji, Aravalli Stone Yard, Kishangarh se. Aapka {inr(owed(x))} बकाया hai, the oldest bill is {x.oldest} days old against {x.terms}-day terms. Ledger PDF attached. Kindly arrange at least {inr(Math.max(x.buckets[3], x.buckets[2]) || owed(x) / 2, { compact: true })} this week. Dhanyavaad. — Kavita, Accounts
            </div>
            <div className="flex justify-end gap-2">
              <Btn size="sm" variant="ghost" onClick={() => setDraft(false)}>
                Cancel
              </Btn>
              <Btn
                size="sm"
                variant="solid"
                icon={Send}
                onClick={() => {
                  setDraft(false);
                  toast.success("Reminder sent on WhatsApp", { description: `${x.name} · ledger PDF from Tally attached` });
                  desk.log(`Reminder sent to ${x.name} for ${inr(owed(x), { compact: true })}`, "info");
                }}
              >
                Send now
              </Btn>
            </div>
          </div>
        )}
        <Segmented size="sm" options={[{ value: "Ledger", label: "Ledger", count: ledger.length }, { value: "Promises", label: "Promises", count: pr.length }, { value: "Calls", label: "Call log", count: cl.length }] as const} value={tab} onChange={setTab} />
        {tab === "Ledger" && (
          <div className="desk-scroll overflow-x-auto">
            <table className="w-full min-w-[460px] text-[12.5px]">
              <thead>
                <tr className="border-b border-d-ink text-left text-[11px] uppercase tracking-wider text-d-mute">
                  <th className="py-1.5 pr-2 font-medium">Date</th>
                  <th className="py-1.5 pr-2 font-medium">Particulars</th>
                  <th className="py-1.5 pr-2 text-right font-medium">Dr</th>
                  <th className="py-1.5 pr-2 text-right font-medium">Cr</th>
                  <th className="py-1.5 text-right font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((r) => (
                  <tr key={r.vch} className="border-b border-dotted border-d-line">
                    <td className="py-1.5 pr-2 font-mono text-[11.5px] text-d-mute">{r.date}</td>
                    <td className="py-1.5 pr-2">
                      <span className="block">{r.particulars}</span>
                      <span className="font-mono text-[10.5px] text-d-mute">{r.vch}</span>
                    </td>
                    <td className="tnum py-1.5 pr-2 text-right font-mono">{r.dr ? inr(r.dr) : ""}</td>
                    <td className="tnum py-1.5 pr-2 text-right font-mono text-d-ok">{r.cr ? inr(r.cr) : ""}</td>
                    <td className="tnum py-1.5 text-right font-mono font-semibold">{inr(r.bal)}</td>
                  </tr>
                ))}
                {owed(x) < ledger[ledger.length - 1].bal && (
                  <tr className="border-b border-dotted border-d-line">
                    <td className="py-1.5 pr-2 font-mono text-[11.5px] text-d-mute">Today</td>
                    <td className="py-1.5 pr-2">By receipt (this session)</td>
                    <td />
                    <td className="tnum py-1.5 pr-2 text-right font-mono text-d-ok">{inr(ledger[ledger.length - 1].bal - owed(x))}</td>
                    <td className="tnum py-1.5 text-right font-mono font-semibold">{inr(owed(x))}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {tab === "Promises" && (
          <ul className="space-y-2">
            {pr.length === 0 && <li className="text-[12.5px] text-d-mute">No promises on record. Log a call to add one.</li>}
            {pr.map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-[6px] border border-d-line px-3 py-2 text-[13px]">
                <span>
                  {inr(p.amount, { compact: true })} by {p.mode} · {p.due}
                </span>
                <Pill tone={p.status === "kept" ? "ok" : p.status === "broken" ? "late" : "info"}>{p.status}</Pill>
              </li>
            ))}
          </ul>
        )}
        {tab === "Calls" && (
          <ul className="space-y-2">
            {cl.length === 0 && <li className="text-[12.5px] text-d-mute">No calls logged yet.</li>}
            {cl.map((c) => (
              <li key={c.id} className="rounded-[6px] border border-d-line px-3 py-2">
                <p className="flex items-center justify-between text-[12px] text-d-mute">
                  <span className="font-mono">
                    {c.when} · {c.by}
                  </span>
                  <Pill tone={outcomeTone[c.outcome]}>{c.outcome}</Pill>
                </p>
                <p className="mt-1 text-[13px]">{c.note}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Sheet>
  );
}

function LogCallModal({ ctx, dealerId, onClose }: { ctx: Ctx; dealerId: string | null; onClose: () => void }) {
  return dealerId !== null ? <LogCallForm key={dealerId} ctx={ctx} dealerId={dealerId} onClose={onClose} /> : null;
}

function LogCallForm({ ctx, dealerId, onClose }: { ctx: Ctx; dealerId: string; onClose: () => void }) {
  const desk = useDesk();
  const [dealer, setDealer] = React.useState(dealerId || ctx.dealers[0].id);
  const [outcome, setOutcome] = React.useState<Outcome>("Promise");
  const [amount, setAmount] = React.useState("150000");
  const [when, setWhen] = React.useState("Thu");
  const [by, setBy] = React.useState("Kavita");
  const [note, setNote] = React.useState("");
  const name = nameOf(ctx.dealers, dealer);
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title="Log call" sub="Goes into the dealer's call log, and a promise lands on the बकाया board.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const amt = Number(amount) || 0;
          const id = `C${ctx.calls.length + 1}-${dealer}`;
          ctx.setCalls((cur) => [{ id, when: "Today, just now", dealer, by, outcome, amount: amt || undefined, note: note || `${outcome}${amt ? ` · ${inr(amt, { compact: true })}` : ""}` }, ...cur]);
          if (outcome === "Promise" && amt) ctx.setPromises((cur) => [...cur, { id: `P-${id}`, dealer, amount: amt, due: when, inHours: when === "Today" ? 5 : when === "Wed" ? 22 : when === "Thu" ? 46 : when === "Fri" ? 70 : 94, mode: "RTGS", status: "open" }]);
          if (outcome === "Paid" && amt) ctx.receive(dealer, amt);
          toast.success("Call logged", { description: `${name} · ${outcome}${amt && outcome !== "No answer" ? ` · ${inr(amt, { compact: true })}` : ""}` });
          desk.log(`${by} called ${name}: ${outcome}${amt && (outcome === "Promise" || outcome === "Paid") ? ` ${inr(amt, { compact: true })}` : ""}`, outcomeTone[outcome]);
          onClose();
        }}
      >
        <Field label="Dealer">
          <select className={inputClass} value={dealer} onChange={(e) => setDealer(e.target.value)}>
            {ctx.dealers.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}, {x.town} · {inr(owed(x), { compact: true })}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Outcome">
          <Segmented size="sm" options={["Promise", "Paid", "Call back", "No answer", "Dispute"] as const} value={outcome} onChange={setOutcome} />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Amount (₹)">
            <input className={inputClass} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} />
          </Field>
          <Field label="Promised by">
            <select className={inputClass} value={when} onChange={(e) => setWhen(e.target.value)}>
              {["Today", "Wed", "Thu", "Fri", "Sat"].map((w) => (
                <option key={w}>{w}</option>
              ))}
            </select>
          </Field>
          <Field label="Called by">
            <select className={inputClass} value={by} onChange={(e) => setBy(e.target.value)}>
              {["Kavita", "Rajendra", "Devendra", "Karan", "Pooja"].map((w) => (
                <option key={w}>{w}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Note">
          <input className={inputClass} placeholder="What did they say?" value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="solid" type="submit" icon={Plus}>
            Save call
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Call sheet ---------------- */

function CallsTab({ ctx }: { ctx: Ctx }) {
  const { dealers, calls } = ctx;
  const sheet = [...dealers].sort((a, b) => owed(b) * b.oldest - owed(a) * a.oldest).slice(0, 10);
  const ownerCalls = new Set(["MG", "MM", "GS", "FG"]);
  const today = calls.filter((c) => c.when.startsWith("Today"));
  const outcomes = (Object.keys(outcomeTone) as Outcome[]).map((o) => ({ label: o, value: calls.filter((c) => c.outcome === o).length, tone: outcomeTone[o] }));
  const pace = useDrift(9, 0.3, 4000);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Calls today" value={`${today.length} / 24`} hint={`${Math.round(pace * 10) / 10} calls an hour`} icon={PhoneCall} trend={[0, 2, 3, 5, 6, today.length]} />
        <Stat label="Promised on calls" value={inr(calls.filter((c) => c.outcome === "Promise").reduce((a, c) => a + (c.amount ?? 0), 0), { compact: true })} delta="+₹9.5 L" hint="this week" icon={HandCoins} tone="ok" trend={[4, 6, 9, 11, 15, 19.5]} />
        <Stat label="Promise kept rate" value="71%" delta="-4%" hint="last 30 days" icon={CheckCheck} tone="warn" trend={[78, 77, 75, 74, 72, 71]} />
        <Stat label="Not picking up" value={calls.filter((c) => c.outcome === "No answer").length} hint="Gwalior, Hadoti" icon={AlertTriangle} tone="late" />
      </div>
      <Panel icon={ClipboardList} title="Today's call sheet" sub="Ranked by ₹ × days. Owner calls are marked; everything else is Kavita's." action={<Btn size="sm" variant="solid" icon={Plus} onClick={() => ctx.logCall("")}>Log call</Btn>}>
        <ol className="divide-y divide-d-line">
          {sheet.map((x, i) => {
            const last = calls.find((c) => c.dealer === x.id);
            return (
              <li key={x.id} className="flex flex-wrap items-center gap-3 py-2.5">
                <span className="tnum w-6 text-right font-mono text-[13px] font-semibold text-d-mute">{i + 1}</span>
                <button type="button" onClick={() => ctx.openDealer(x.id)} className="min-w-[200px] flex-1 text-left">
                  <p className="text-[13.5px] font-semibold hover:text-d-accent">
                    {x.name} <span className="font-normal text-d-mute">· {x.town}</span>
                  </p>
                  <p className="truncate text-[12px] text-d-mute">{last ? `${last.when}: ${last.note}` : "No call this week"}</p>
                </button>
                {ownerCalls.has(x.id) && <Pill tone="late">Owner</Pill>}
                <span className="tnum w-20 text-right font-mono text-[13px] font-semibold">{inr(owed(x), { compact: true })}</span>
                <span className="tnum w-14 text-right font-mono text-[12px]" style={{ color: x.oldest > 90 ? "var(--d-late)" : x.oldest > 60 ? "var(--d-warn)" : "var(--d-mute)" }}>
                  {x.oldest}d
                </span>
                <Btn size="sm" icon={Phone} onClick={() => ctx.logCall(x.id)}>
                  Log
                </Btn>
              </li>
            );
          })}
        </ol>
      </Panel>
      <div className="grid gap-6 xl:grid-cols-[1fr_330px]">
        <Panel title="Call log" sub="Every call, its outcome and what was said">
          <DataTable
            rows={calls}
            rowKey={(c) => c.id}
            search={(c) => `${nameOf(dealers, c.dealer)} ${c.note} ${c.by}`}
            searchPlaceholder="Search dealer or note"
            filter={{ get: (c) => c.outcome, options: ["Promise", "Paid", "Call back", "No answer", "Dispute"] }}
            onRow={(c) => ctx.openDealer(c.dealer)}
            pageSize={8}
            columns={[
              { key: "when", label: "When", render: (c) => <span className="whitespace-nowrap font-mono text-[11.5px] text-d-mute">{c.when}</span> },
              { key: "dealer", label: "Dealer", render: (c) => <span className="font-medium">{nameOf(dealers, c.dealer)}</span>, sort: (c) => nameOf(dealers, c.dealer) },
              { key: "by", label: "By", render: (c) => c.by, sort: (c) => c.by },
              { key: "out", label: "Outcome", render: (c) => <Pill tone={outcomeTone[c.outcome]}>{c.outcome}</Pill> },
              { key: "amt", label: "₹", align: "right", render: (c) => <span className="tnum font-mono">{c.amount ? inr(c.amount, { compact: true }) : "—"}</span>, sort: (c) => c.amount ?? 0 },
              { key: "note", label: "Note", wide: true, render: (c) => <span className="line-clamp-1 text-[12px] text-d-mute">{c.note}</span> },
            ]}
          />
        </Panel>
        <div className="space-y-6">
          <Panel title="Outcomes" sub="All logged calls">
            <Donut center={calls.length} sub="calls" segments={outcomes} size={170} />
          </Panel>
          <Panel title="Promises kept, by caller" sub="Last 30 days">
            <HBars
              format={(v) => `${v}%`}
              max={100}
              data={[
                { label: "Rajendra", value: 86, tone: "ok", sub: "14 promises" },
                { label: "Karan", value: 74, tone: "accent", sub: "19" },
                { label: "Devendra", value: 69, tone: "accent", sub: "16" },
                { label: "Kavita", value: 61, tone: "warn", sub: "42" },
              ]}
            />
          </Panel>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Dealers ---------------- */

function DealersTab({ ctx }: { ctx: Ctx }) {
  const desk = useDesk();
  const { dealers } = ctx;
  const byRegion = REGIONS.map((r) => ({ label: r, value: dealers.filter((x) => x.region === r).reduce((a, x) => a + owed(x), 0), sub: `${dealers.filter((x) => x.region === r).length} dealers` }));
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Active dealers" value={dealers.length} delta="+2" hint="Bhilwara, Vishwamitri this year" icon={Users} trend={[12, 13, 14, 15, 16, 16, 18]} />
        <Stat label="Credit extended" value={inr(dealers.reduce((a, x) => a + x.limit, 0), { compact: true })} hint={`${Math.round((dealers.reduce((a, x) => a + owed(x), 0) / dealers.reduce((a, x) => a + x.limit, 0)) * 100)}% used`} icon={IndianRupee} />
        <Stat label="Dispatch on hold" value={dealers.filter((x) => x.hold).length} hint={dealers.filter((x) => x.hold).map((x) => x.name.split(" ")[0]).join(", ") || "none"} icon={Ban} tone="late" />
        <Stat label="Sales this FY" value="₹6.4 Cr" delta="+14%" hint="Apr–Oct" icon={TrendingUp} tone="ok" trend={[0.8, 1.7, 2.6, 3.4, 4.3, 5.4, 6.4]} />
      </div>
      <Panel title="Dealer book" sub="Click a dealer for the ledger. Select several to send ledger confirmations.">
        <DataTable
          rows={dealers}
          rowKey={(x) => x.id}
          search={(x) => `${x.name} ${x.town} ${x.contact}`}
          searchPlaceholder="Search dealer, town or contact"
          filter={{ get: (x) => x.region, options: [...REGIONS] }}
          onRow={(x) => ctx.openDealer(x.id)}
          pageSize={10}
          bulk={[
            { label: "Send ledger confirmations", run: (k) => { toast.success(`Ledger confirmations sent to ${k.length} dealers`, { description: "Tally PDFs on WhatsApp, reply to confirm" }); desk.log(`Ledger confirmations sent to ${k.length} dealers`); } },
            { label: "Hold dispatch", run: (k) => { ctx.setDealers((cur) => cur.map((x) => (k.includes(x.id) ? { ...x, hold: true } : x))); toast(`Dispatch held for ${k.length} dealers`); desk.log(`Dispatch held for ${k.length} dealers`, "warn"); } },
          ]}
          columns={[
            { key: "name", label: "Dealer", render: (x) => (<span className="flex items-center gap-2.5"><span className="h-6 w-2.5 shrink-0 rounded-[2px]" style={{ background: AGE[ageIdx(x)].color, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.15)" }} /><span><span className="block font-semibold">{x.name}</span><span className="block text-[11.5px] text-d-mute">{x.town} · {x.contact}</span></span></span>), sort: (x) => x.name },
            { key: "sales", label: "Salesman", wide: true, render: (x) => x.salesman, sort: (x) => x.salesman },
            { key: "owed", label: "बकाया", align: "right", render: (x) => <span className="tnum font-mono font-semibold">{inr(owed(x), { compact: true })}</span>, sort: (x) => owed(x) },
            { key: "lim", label: "Limit used", render: (x) => (<div className="flex min-w-[120px] items-center gap-2"><Meter value={owed(x)} max={x.limit} tone={owed(x) > x.limit ? "late" : owed(x) / x.limit > 0.8 ? "warn" : "ok"} /><span className="tnum w-9 text-right font-mono text-[11px] text-d-mute">{Math.round((owed(x) / x.limit) * 100)}%</span></div>), sort: (x) => owed(x) / x.limit },
            { key: "old", label: "Oldest", align: "right", render: (x) => <span className="tnum font-mono" style={{ color: x.oldest > 90 ? "var(--d-late)" : x.oldest > 60 ? "var(--d-warn)" : undefined }}>{x.oldest}d</span>, sort: (x) => x.oldest },
            { key: "last", label: "Last paid", wide: true, render: (x) => <span className="text-[12px] text-d-mute">{inr(x.lastPay.amount, { compact: true })} · {x.lastPay.date}</span> },
            { key: "st", label: "", render: (x) => (x.hold ? <Pill tone="late">Hold</Pill> : x.dispute ? <Pill tone="warn">Dispute</Pill> : <Pill tone="ok">Open</Pill>) },
          ]}
        />
      </Panel>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <Panel title="Outstanding by market" sub="Delhi NCR is the biggest book and the slowest">
          <HBars format={(v) => inr(v, { compact: true })} data={byRegion} />
        </Panel>
        <Panel icon={Scale} title="Credit requests waiting on Rajendra" sub="Raised by salesmen this week">
          <ApprovalQueue
            items={[
              { id: "CR1", title: "Malwa Marble Mart · 60-day terms", sub: "On SO-2289 Jalore granite, ₹4.6 L. Clear 90+ ₹2.5 L first?", amount: "₹4.6 L", meta: "Rajendra", tone: "warn" },
              { id: "CR2", title: "Cyber City Stone · limit ₹15 L → ₹20 L", sub: "Pays in 52 days on average, 3 farmhouse projects lined up", amount: "+₹5 L", meta: "Karan", tone: "info" },
              { id: "CR3", title: "Bhilwara Build Point · limit ₹4 L → ₹6 L", sub: "New since July, always advance, Kota stone mill floor", amount: "+₹2 L", meta: "Devendra", tone: "info" },
              { id: "CR4", title: "Kathiawar Granite · release truck", sub: "GJ-03 BV 1190 at gate, over limit by ₹1.9 L", amount: "₹2.2 L", meta: "Credit Guard", tone: "late" },
            ]}
            onDecide={(id, dec) => dec && desk.log(`Credit request ${id} ${dec}`, dec === "approved" ? "ok" : "warn")}
          />
        </Panel>
      </div>
    </div>
  );
}

/* ---------------- Dealer orders ---------------- */

function OrdersTab({ ctx }: { ctx: Ctx }) {
  const desk = useDesk();
  const { orders, setOrders, dealers } = ctx;
  const [open, setOpen] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);
  const order = orders.find((o) => o.id === open) ?? null;
  const value = (o: Order) => o.sqft * o.rate;
  const order_ = ORDER_COLS.map((c) => c.id);

  function move(id: string, to: OrderStage) {
    const o = orders.find((x) => x.id === id);
    if (!o || o.stage === to) return;
    const dl = dealers.find((x) => x.id === o.dealer);
    if (to === "loaded" && dl && (dl.hold || owed(dl) > dl.limit)) {
      toast.error("Credit Guard stopped this", { description: `${dl.name} is ${dl.hold ? "on hold" : "over limit"}. Release from the dealer sheet first.` });
      desk.log(`Credit Guard blocked loading ${o.id} for ${dl.name}`, "late");
      return;
    }
    setOrders((cur) => cur.map((x) => (x.id === id ? { ...x, stage: to, truck: to === "loaded" && !x.truck ? "RJ-01 GD 3150" : x.truck, eta: to === "loaded" ? "E-way bill raised" : x.eta } : x)));
    const col = ORDER_COLS.find((c) => c.id === to)!;
    toast.success(`${o.id} → ${col.label}`, { description: `${nameOf(dealers, o.dealer)} · ${o.variety}` });
    desk.log(`${o.id} moved to ${col.label}`, col.tone);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open orders" value={orders.filter((o) => o.stage !== "loaded").length} hint={`${orders.filter((o) => o.stage === "enquiry").length} fresh enquiries`} icon={ClipboardList} />
        <Stat label="Order book" value={inr(orders.filter((o) => o.stage !== "loaded").reduce((a, o) => a + value(o), 0), { compact: true })} delta="+18%" icon={IndianRupee} trend={[22, 25, 24, 28, 31, 33, 36]} />
        <Stat label="Sq ft on saws" value={orders.filter((o) => o.stage === "cutting").reduce((a, o) => a + o.sqft, 0).toLocaleString("en-IN")} hint="3 orders" icon={Factory} tone="warn" />
        <Stat label="Trucks out today" value={orders.filter((o) => o.stage === "loaded").length} hint="1 held at gate" icon={Truck} tone="ok" />
      </div>
      <Panel title="Order board" sub="Drag a card to move it. Loading checks the dealer's credit first." action={<Btn size="sm" variant="solid" icon={Plus} onClick={() => setAdding(true)}>New enquiry</Btn>}>
        <Board
          columns={ORDER_COLS.map((c) => ({ ...c }))}
          items={orders}
          itemKey={(o) => o.id}
          getColumn={(o) => o.stage}
          onMove={(k, c) => move(k, c as OrderStage)}
          minColumnWidth={200}
          renderCard={(o) => {
            const dl = dealers.find((x) => x.id === o.dealer);
            const next = order_[order_.indexOf(o.stage) + 1] as OrderStage | undefined;
            return (
              <div>
                <button type="button" onClick={() => setOpen(o.id)} className="block w-full text-left">
                  <p className="flex items-center justify-between font-mono text-[11px] text-d-mute">
                    {o.id}
                    {dl?.hold && <Pill tone="late">hold</Pill>}
                  </p>
                  <p className="mt-0.5 text-[13px] font-semibold leading-snug">{nameOf(dealers, o.dealer)}</p>
                  <p className="text-[12px] text-d-mute">{o.variety}</p>
                  <p className="mt-1.5 flex items-baseline justify-between text-[12px]">
                    <span className="tnum font-mono">{o.sqft.toLocaleString("en-IN")} sq ft</span>
                    <span className="tnum font-mono font-semibold">{inr(value(o), { compact: true })}</span>
                  </p>
                  <p className="mt-1 truncate text-[11px] text-d-mute">{o.truck ? `${o.truck} · ` : ""}{o.eta}</p>
                </button>
                {next && (
                  <button type="button" onClick={() => move(o.id, next)} className="mt-2 w-full rounded-[4px] border border-dashed border-d-line py-1 text-[11px] font-medium text-d-accent hover:bg-d-soft">
                    Move to {ORDER_COLS.find((c) => c.id === next)?.label} →
                  </button>
                )}
              </div>
            );
          }}
        />
      </Panel>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Panel icon={Truck} title="Trucks today" sub="Weighbridge, e-way bill and LR, read by the Dispatch Clerk">
          <DataTable
            dense
            rows={[
              { v: "RJ-36 GA 2047", d: "BS", t: 18.9, ewb: "2817 4410 9921", route: "Kishangarh → Bhopal", st: "On road" },
              { v: "RJ-01 GC 8823", d: "MS", t: 18.4, ewb: "2817 4411 0356", route: "Kishangarh → Udaipur", st: "On road" },
              { v: "GJ-03 BV 1190", d: "KG", t: 21.2, ewb: "Not generated", route: "Kishangarh → Rajkot", st: "Held at gate" },
              { v: "RJ-01 GB 4471", d: "SD", t: 0, ewb: "—", route: "Kishangarh → Ahmedabad", st: "Loading Thu" },
              { v: "HR-55 AK 7302", d: "RM", t: 0, ewb: "—", route: "Kishangarh → Delhi", st: "Booked Fri" },
            ]}
            rowKey={(r) => r.v}
            columns={[
              { key: "v", label: "Vehicle", render: (r) => <span className="font-mono text-[12px] font-medium">{r.v}</span> },
              { key: "d", label: "Dealer", render: (r) => nameOf(dealers, r.d) },
              { key: "t", label: "Tonnes", align: "right", render: (r) => <span className="tnum font-mono">{r.t ? r.t.toFixed(1) : "—"}</span> },
              { key: "ewb", label: "E-way bill", wide: true, render: (r) => <span className="font-mono text-[11.5px] text-d-mute">{r.ewb}</span> },
              { key: "st", label: "Status", render: (r) => <Pill tone={r.st === "On road" ? "ok" : r.st.startsWith("Held") ? "late" : "info"}>{r.st}</Pill> },
            ]}
          />
        </Panel>
        <Panel title="Orders by variety" sub="Open order book, sq ft">
          <HBars
            format={(v) => `${(v / 1000).toFixed(1)}k`}
            data={Object.entries(orders.filter((o) => o.stage !== "loaded").reduce<Record<string, number>>((acc, o) => ({ ...acc, [o.variety]: (acc[o.variety] ?? 0) + o.sqft }), {}))
              .sort((a, b) => b[1] - a[1])
              .map(([label, v]) => ({ label, value: v }))}
          />
        </Panel>
      </div>
      <Sheet
        open={!!order}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={order ? `${order.id} · ${ORDER_COLS.find((c) => c.id === order.stage)?.label}` : ""}
        title={order ? nameOf(dealers, order.dealer) : ""}
        sub={order ? `${order.variety} · ${order.site}` : ""}
        footer={
          order && (
            <>
              <Btn icon={Send} onClick={() => { toast.success("Proforma sent on WhatsApp", { description: `${order.id} with GST @ 18% and freight` }); desk.log(`Proforma sent for ${order.id}`); }}>
                Send proforma
              </Btn>
              {order.stage !== "loaded" && (
                <Btn variant="solid" onClick={() => { move(order.id, order_[order_.indexOf(order.stage) + 1] as OrderStage); setOpen(null); }}>
                  Move to {ORDER_COLS[order_.indexOf(order.stage) + 1]?.label}
                </Btn>
              )}
            </>
          )
        }
      >
        {order && (
          <div className="space-y-5">
            <KV
              items={[
                { k: "Quantity", v: `${order.sqft.toLocaleString("en-IN")} sq ft` },
                { k: "Rate", v: `${inr(order.rate)} / sq ft` },
                { k: "Basic value", v: inr(value(order)) },
                { k: "GST @ 18%", v: inr(value(order) * 0.18) },
                { k: "Approx weight", v: `${(order.sqft * 0.0045).toFixed(1)} t` },
                { k: "Truck", v: order.truck || "Not booked" },
              ]}
            />
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Progress</p>
              <ol className="flex gap-1">
                {ORDER_COLS.map((c, i) => (
                  <li key={c.id} className="flex-1">
                    <span className="block h-2 rounded-full" style={{ background: i <= order_.indexOf(order.stage) ? "var(--d-accent)" : "var(--d-sunk)" }} />
                    <span className="mt-1 block text-[10.5px] text-d-mute">{c.label}</span>
                  </li>
                ))}
              </ol>
            </div>
            <p className="text-[12.5px] text-d-mute">Status: {order.eta}</p>
          </div>
        )}
      </Sheet>
      <NewEnquiry
        open={adding}
        onOpenChange={setAdding}
        dealers={dealers}
        onAdd={(o) => {
          setOrders((cur) => [o, ...cur]);
          toast.success("Enquiry added", { description: `${o.id} · ${nameOf(dealers, o.dealer)} · ${o.sqft.toLocaleString("en-IN")} sq ft` });
          desk.log(`New enquiry ${o.id} from ${nameOf(dealers, o.dealer)}`, "info");
        }}
        nextId={`SO-${2292 + orders.length - seedOrders.length}`}
      />
    </div>
  );
}

function NewEnquiry({ open, onOpenChange, dealers, onAdd, nextId }: { open: boolean; onOpenChange: (o: boolean) => void; dealers: Dealer[]; onAdd: (o: Order) => void; nextId: string }) {
  const [dealer, setDealer] = React.useState("AT");
  const [variety, setVariety] = React.useState(seedRates[0].variety);
  const [sqft, setSqft] = React.useState("2500");
  const [site, setSite] = React.useState("Showroom stock");
  const rate = seedRates.find((r) => r.variety === variety)?.ours ?? 60;
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="New enquiry" sub="Priced from today's rate card. Order Desk adds freight and sends the quote.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onAdd({ id: nextId, dealer, variety, sqft: Number(sqft) || 1000, rate, stage: "enquiry", site, eta: "—" });
          onOpenChange(false);
        }}
      >
        <Field label="Dealer">
          <select className={inputClass} value={dealer} onChange={(e) => setDealer(e.target.value)}>
            {dealers.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}, {x.town}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Variety">
            <select className={inputClass} value={variety} onChange={(e) => setVariety(e.target.value)}>
              {seedRates.slice(0, 10).map((r) => (
                <option key={r.variety}>{r.variety}</option>
              ))}
            </select>
          </Field>
          <Field label="Sq ft">
            <input className={inputClass} inputMode="numeric" value={sqft} onChange={(e) => setSqft(e.target.value.replace(/\D/g, ""))} />
          </Field>
        </div>
        <Field label="Site / use">
          <input className={inputClass} value={site} onChange={(e) => setSite(e.target.value)} />
        </Field>
        <p className="text-[12.5px] text-d-mute">
          At {inr(rate)}/sq ft: <b className="text-d-ink">{inr((Number(sqft) || 0) * rate)}</b> + GST
        </p>
        <div className="flex justify-end gap-2 pt-1">
          <Btn onClick={() => onOpenChange(false)}>Cancel</Btn>
          <Btn variant="solid" type="submit" icon={Plus}>
            Add enquiry
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Mandi rates ---------------- */

function RatesTab() {
  const desk = useDesk();
  const [rates, setRates] = React.useState(seedRates);
  const [editing, setEditing] = React.useState<Rate | null>(null);
  const [val, setVal] = React.useState("");
  const [pick, setPick] = React.useState("Rajasthan black");
  const focus = rates.find((r) => r.variety === pick) ?? rates[0];
  const days = ["7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"].map((x) => `${x} Oct`);
  const above = rates.filter((r) => r.ours > r.mandi).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Varieties on rate card" value={rates.length} hint="published to 18 dealers" icon={Layers} />
        <Stat label="Priced above mandi" value={`${above} of ${rates.length}`} hint="premium for cut-to-size" icon={TrendingUp} tone="accent" />
        <Stat label="Biggest move today" value="+₹2" hint="Rajasthan black, mandi ₹118" icon={AlertTriangle} tone="warn" trend={focus.trend} />
        <Stat label="Diesel, Kishangarh" value="₹92.4/L" delta="+0.6%" deltaGood={false} hint="freight revised Mon" icon={Truck} trend={[90.8, 91.1, 91.4, 91.4, 92.0, 92.1, 92.4]} />
      </div>
      <Panel title="Rate board" sub="Kishangarh mandi at 10 AM against our card. Click a row to chart it, or the rate to change it." action={<Btn size="sm" variant="solid" icon={Send} onClick={() => { toast.success("Rate card sent to 18 dealers", { description: "PDF on WhatsApp, valid till Saturday" }); desk.log("Rate card published to 18 dealers", "info"); }}>Publish rate card</Btn>}>
        <div className="desk-scroll -mx-5 overflow-x-auto px-5">
          <table className="w-full min-w-[760px] text-[13px]">
            <thead>
              <tr className="border-b-2 border-d-ink text-left text-[11px] uppercase tracking-[0.12em] text-d-mute">
                <th className="py-2 pr-3 font-semibold">Variety</th>
                <th className="py-2 pr-3 font-semibold">Grade</th>
                <th className="py-2 pr-3 text-right font-semibold">Mandi</th>
                <th className="py-2 pr-3 text-right font-semibold">Change</th>
                <th className="py-2 pr-3 font-semibold">14 days</th>
                <th className="py-2 pr-3 text-right font-semibold">Ours</th>
                <th className="py-2 text-right font-semibold">Gap</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((r) => {
                const ch = r.mandi - r.yday;
                const gap = r.ours - r.mandi;
                const tex = slabRows.find((s) => s.variety === r.variety)?.texture ?? slabRows[0].texture;
                return (
                  <tr key={r.variety} onClick={() => setPick(r.variety)} className={`cursor-pointer border-b border-d-line transition-colors hover:bg-d-sunk/60 ${pick === r.variety ? "bg-d-soft/70" : ""}`}>
                    <td className="py-2.5 pr-3">
                      <span className="flex items-center gap-2.5">
                        <span className="h-7 w-7 shrink-0 rounded-[3px] ring-1 ring-black/10" style={{ background: tex }} />
                        <span className="font-semibold">{r.variety}</span>
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-d-mute">{r.grade}</td>
                    <td className="tnum py-2.5 pr-3 text-right font-mono">{inr(r.mandi)}</td>
                    <td className="tnum py-2.5 pr-3 text-right font-mono" style={{ color: ch > 0 ? "var(--d-ok)" : ch < 0 ? "var(--d-late)" : "var(--d-mute)" }}>
                      {ch > 0 ? "▲" : ch < 0 ? "▼" : "·"} {Math.abs(ch).toLocaleString("en-IN")}
                    </td>
                    <td className="w-[110px] py-1 pr-3">
                      <Sparkline data={r.trend} tone={ch >= 0 ? "ok" : "late"} height={26} />
                    </td>
                    <td className="py-2.5 pr-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditing(r);
                          setVal(String(r.ours));
                        }}
                        className="tnum rounded-[4px] border border-d-line bg-d-panel px-2 py-0.5 font-mono font-semibold hover:border-d-accent"
                      >
                        {inr(r.ours)}
                      </button>
                      <span className="ml-1 text-[11px] text-d-mute">/{r.unit}</span>
                    </td>
                    <td className="tnum py-2.5 text-right font-mono text-[12px]" style={{ color: gap < 0 ? "var(--d-late)" : "var(--d-mute)" }}>
                      {gap > 0 ? "+" : ""}
                      {gap.toLocaleString("en-IN")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Panel title={`${focus.variety}: mandi vs ours`} sub={`${focus.grade}, last 14 days`}>
          <AreaChart
            labels={days}
            series={[
              { name: "Mandi", data: focus.trend, tone: "accent" },
              { name: "Ours", data: focus.trend.map(() => focus.ours), tone: "info", dashed: true },
            ]}
            format={(v) => inr(v)}
            height={200}
          />
        </Panel>
        <Panel icon={Truck} title="Freight lanes" sub="Per tonne, 21 t truck, includes toll">
          <ul className="divide-y divide-d-line">
            {freightLanes.map((f) => (
              <li key={f.lane} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-medium">{f.lane}</p>
                  <p className="text-[11.5px] text-d-mute">
                    {f.km} km · {f.trucks} trucks this week
                  </p>
                </div>
                <span className="tnum font-mono text-[13px] font-semibold">{inr(f.perTonne)}</span>
                <span className="w-20 whitespace-nowrap text-right font-mono text-[11px] text-d-mute">≈ ₹{(f.perTonne / 220).toFixed(1)}/ft²</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <Modal open={!!editing} onOpenChange={(o) => !o && setEditing(null)} title={`Change rate: ${editing?.variety ?? ""}`} sub={editing ? `Mandi today ${inr(editing.mandi)}. Dealers see the new rate on the next rate card.` : ""} width={440}>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!editing) return;
            const n = Number(val) || editing.ours;
            setRates((cur) => cur.map((r) => (r.variety === editing.variety ? { ...r, ours: n } : r)));
            toast.success(`${editing.variety} now ${inr(n)}/${editing.unit}`, { description: `was ${inr(editing.ours)}` });
            desk.log(`Rate changed: ${editing.variety} ${inr(editing.ours)} → ${inr(n)}`, "info");
            setEditing(null);
          }}
        >
          <Field label={`Our rate (₹ / ${editing?.unit ?? "sq ft"})`}>
            <input className={inputClass} inputMode="numeric" value={val} onChange={(e) => setVal(e.target.value.replace(/\D/g, ""))} autoFocus />
          </Field>
          <div className="flex justify-end gap-2">
            <Btn onClick={() => setEditing(null)}>Cancel</Btn>
            <Btn variant="solid" type="submit">
              Save rate
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ---------------- Yard & saws ---------------- */

function YardTab() {
  const desk = useDesk();
  const [saws, setSaws] = React.useState(seedSaws);
  const [blockList, setBlockList] = React.useState(blocks);
  const [openBlock, setOpenBlock] = React.useState<Block | null>(null);
  const [reserved, setReserved] = React.useState<Record<string, number>>({});
  const a1 = useDrift(182, 3, 1500);
  const a2 = useDrift(176, 3, 1700);
  const a3 = useDrift(94, 2, 1600);
  const amps: Record<string, number> = { "GS-1": a1, "GS-2": a2, "MW-1": a3 };
  const running = saws.filter((s) => s.status === "Running").length;
  const stTone: Record<Saw["status"], Tone> = { Running: "ok", "Blade change": "warn", Idle: "neutral", Breakdown: "late" };
  const units = Array.from(new Set(saws.map((s) => s.unit)));

  function loadBlock(saw: Saw) {
    const b = blockList.find((x) => x.status === "In yard");
    if (!b) return;
    setSaws((cur) => cur.map((s) => (s.id === saw.id ? { ...s, status: "Running", block: b.no, variety: b.variety, pct: 1, hoursLeft: 26, amps: 120, operator: "Imran Qureshi" } : s)));
    setBlockList((cur) => cur.map((x) => (x.no === b.no ? { ...x, status: "On saw" } : x)));
    toast.success(`${b.no} loaded on ${saw.id}`, { description: `${b.variety} · ${b.m3} m³ · crane slot booked` });
    desk.log(`${b.no} (${b.variety}) loaded on ${saw.id}`, "ok");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Machines running" value={`${running} / ${saws.length}`} hint="TL-1 broken down 10:20 AM" icon={Factory} tone={running >= 4 ? "ok" : "warn"} trend={[5, 5, 4, 4, 3, running]} />
        <Stat label="Sq ft cut today" value="3,860" delta="-12%" deltaGood={false} hint="target 4,400" icon={Layers} trend={[0, 600, 1300, 2100, 2900, 3400, 3860]} />
        <Stat label="Blocks in yard" value={blockList.filter((b) => b.status !== "On saw").length} hint={`${blockList.reduce((a, b) => a + b.m3, 0).toFixed(0)} m³ incl. on saws`} icon={Boxes} />
        <Stat label="Slab stock" value={`${(slabRows.reduce((a, s) => a + s.sqft, 0) / 1000).toFixed(0)}k sq ft`} hint={`${slabRows.length} varieties on racks`} icon={Mountain} tone="accent" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {units.map((u) => (
          <section key={u} className="desk-card desk-rise p-5">
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="desk-h text-[17px] font-semibold">Cutting {u}</h3>
              <span className="font-mono text-[11.5px] text-d-mute">{saws.filter((s) => s.unit === u && s.status === "Running").length} running</span>
            </div>
            <div className="space-y-3">
              {saws
                .filter((s) => s.unit === u)
                .map((s) => (
                  <article key={s.id} className="overflow-hidden rounded-[6px] border border-d-line bg-d-panel">
                    <div className={`h-2 ${s.status === "Running" ? "desk-belt" : ""}`} style={{ background: s.status === "Running" ? undefined : `color-mix(in oklab, ${s.status === "Breakdown" ? "var(--d-late)" : "var(--d-sunk)"} 70%, transparent)` }} />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-mono text-[15px] font-semibold">{s.id}</p>
                          <p className="text-[12px] text-d-mute">{s.kind}</p>
                        </div>
                        <Pill tone={stTone[s.status]}>{s.status}</Pill>
                      </div>
                      {s.status === "Running" ? (
                        <>
                          <p className="mt-3 text-[13px]">
                            <b>{s.block}</b> · {s.variety}
                          </p>
                          <Meter value={s.pct} tone="accent" className="mt-2" height={8} />
                          <div className="mt-3 grid grid-cols-3 gap-2 text-[12px]">
                            <div>
                              <p className="text-d-mute">Done</p>
                              <p className="tnum font-mono font-semibold">{s.pct}%</p>
                            </div>
                            <div>
                              <p className="text-d-mute">Left</p>
                              <p className="tnum font-mono font-semibold">{s.hoursLeft} h</p>
                            </div>
                            <div>
                              <p className="text-d-mute">Load</p>
                              <p className="tnum font-mono font-semibold">{Math.round(amps[s.id] ?? s.amps)} A</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="mt-3 text-[12.5px] text-d-mute">
                          {s.status === "Breakdown" ? `Stopped at ${s.pct}% of ${s.variety}. Calibrator belt snapped; spare from Ajmer by 3 PM.` : s.status === "Blade change" ? `Blade at ${s.bladeLife}% life. Change takes about ${s.hoursLeft} h.` : "No block reserved for this machine."}
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-dashed border-d-line pt-2.5 text-[12px]">
                        <span className="text-d-mute">
                          Blade life <b className="font-mono" style={{ color: s.bladeLife < 15 ? "var(--d-late)" : undefined }}>{s.bladeLife}%</b> · {s.operator}
                        </span>
                        {s.status === "Idle" && (
                          <Btn size="sm" variant="solid" icon={Plus} onClick={() => loadBlock(s)}>
                            Load next block
                          </Btn>
                        )}
                        {s.status === "Breakdown" && (
                          <Btn size="sm" icon={Wrench} onClick={() => { setSaws((cur) => cur.map((x) => (x.id === s.id ? { ...x, status: "Running", hoursLeft: 7, amps: 60 } : x))); toast.success(`${s.id} back up`, { description: "Belt replaced, batch resumed" }); desk.log(`${s.id} repaired and running`, "ok"); }}>
                            Mark repaired
                          </Btn>
                        )}
                        {s.status === "Blade change" && (
                          <Btn size="sm" icon={CheckCheck} onClick={() => { setSaws((cur) => cur.map((x) => (x.id === s.id ? { ...x, status: "Idle", bladeLife: 100, hoursLeft: 0 } : x))); toast.success(`${s.id} blade changed`); desk.log(`${s.id} blade changed`, "ok"); }}>
                            Blade done
                          </Btn>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
            </div>
          </section>
        ))}
      </div>

      <Panel icon={Layers} title="Slab racks by variety" sub="Stock on A-frames, with what's already promised to dealers">
        <ul className="space-y-3">
          {slabRows.map((s) => {
            const res = s.reserved + (reserved[s.variety] ?? 0);
            const free = s.sqft - res;
            return (
              <li key={s.variety} className="grid items-center gap-3 sm:grid-cols-[200px_1fr_190px]">
                <div className="flex items-center gap-3">
                  <span className="h-10 w-10 shrink-0 rounded-[3px] shadow-[2px_2px_0_rgba(0,0,0,0.15)] ring-1 ring-black/10" style={{ background: s.texture }} />
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-semibold">{s.variety}</p>
                    <p className="text-[11.5px] text-d-mute">
                      {s.thick} · {s.rack}
                    </p>
                  </div>
                </div>
                <div>
                  <div className="flex h-5 overflow-hidden rounded-[3px] bg-d-sunk">
                    <span className="desk-growx h-full" style={{ width: `${Math.min(100, (res / s.sqft) * 100)}%`, background: "var(--d-accent)", opacity: 0.85 }} />
                    <span className="desk-growx h-full" style={{ width: `${Math.max(0, (free / s.sqft) * 100)}%`, background: s.texture }} />
                  </div>
                  <p className="mt-1 text-[11.5px] text-d-mute">
                    <span className="tnum font-mono">{s.sqft.toLocaleString("en-IN")}</span> sq ft · {s.slabs.toLocaleString("en-IN")} {s.thick.includes("tile") ? "tiles" : "slabs"} ·{" "}
                    <span style={{ color: free < 0 ? "var(--d-late)" : undefined }}>{free < 0 ? `short ${Math.abs(free).toLocaleString("en-IN")} sq ft` : `${free.toLocaleString("en-IN")} free`}</span>
                  </p>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Pill tone={s.grade === "Premium" || s.grade === "Export" ? "accent" : "neutral"}>{s.grade}</Pill>
                  <Btn
                    size="sm"
                    disabled={free < 500}
                    onClick={() => {
                      setReserved((r) => ({ ...r, [s.variety]: (r[s.variety] ?? 0) + 500 }));
                      toast.success(`500 sq ft ${s.variety} reserved`, { description: `Rack ${s.rack.split(" ")[0]} tagged` });
                      desk.log(`Reserved 500 sq ft of ${s.variety}`);
                    }}
                  >
                    Reserve 500
                  </Btn>
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel title="Block inventory" sub="Raw blocks from quarries. Click a block for its quarry slip and yield.">
        <DataTable
          rows={blockList}
          rowKey={(b) => b.no}
          search={(b) => `${b.no} ${b.variety} ${b.quarry}`}
          searchPlaceholder="Search block, quarry or variety"
          filter={{ get: (b) => b.status, options: ["In yard", "On saw", "Reserved", "Arriving"] }}
          onRow={setOpenBlock}
          columns={[
            { key: "no", label: "Block", render: (b) => <span className="font-mono text-[12.5px] font-semibold">{b.no}</span>, sort: (b) => b.no },
            { key: "var", label: "Variety", render: (b) => b.variety, sort: (b) => b.variety },
            { key: "q", label: "Quarry", wide: true, render: (b) => <span className="text-d-mute">{b.quarry}</span> },
            { key: "size", label: "Size (m)", render: (b) => <span className="font-mono text-[12px]">{b.size}</span> },
            { key: "m3", label: "m³", align: "right", render: (b) => <span className="tnum font-mono">{b.m3.toFixed(2)}</span>, sort: (b) => b.m3 },
            { key: "t", label: "Tonnes", align: "right", wide: true, render: (b) => <span className="tnum font-mono">{(b.m3 * 2.7).toFixed(1)}</span>, sort: (b) => b.m3 },
            { key: "cost", label: "Cost", align: "right", render: (b) => <span className="tnum font-mono">{inr(b.cost, { compact: true })}</span>, sort: (b) => b.cost },
            { key: "st", label: "Status", render: (b) => <Pill tone={b.status === "On saw" ? "ok" : b.status === "Reserved" ? "accent" : b.status === "Arriving" ? "info" : "neutral"}>{b.status}</Pill> },
          ]}
        />
      </Panel>

      <Sheet
        open={!!openBlock}
        onOpenChange={(o) => !o && setOpenBlock(null)}
        eyebrow={openBlock ? `Block ${openBlock.no}` : ""}
        title={openBlock?.variety ?? ""}
        sub={openBlock ? `${openBlock.quarry} · ${openBlock.size} m` : ""}
        footer={
          openBlock && openBlock.status === "In yard" ? (
            <Btn
              variant="solid"
              onClick={() => {
                setBlockList((cur) => cur.map((x) => (x.no === openBlock.no ? { ...x, status: "Reserved" } : x)));
                toast.success(`${openBlock.no} reserved for next gang saw slot`);
                desk.log(`${openBlock.no} reserved for cutting`);
                setOpenBlock(null);
              }}
            >
              Reserve for next saw slot
            </Btn>
          ) : (
            <Btn variant="solid" onClick={() => setOpenBlock(null)}>
              Done
            </Btn>
          )
        }
      >
        {openBlock && (
          <div className="space-y-5">
            <KV
              items={[
                { k: "Volume", v: `${openBlock.m3.toFixed(2)} m³` },
                { k: "Weight", v: `${(openBlock.m3 * 2.7).toFixed(1)} t` },
                { k: "Landed cost", v: inr(openBlock.cost) },
                { k: "Cost per m³", v: inr(openBlock.cost / openBlock.m3) },
                { k: "Expected yield", v: `${Math.round(openBlock.m3 * 410).toLocaleString("en-IN")} sq ft at 18mm` },
                { k: "Status", v: openBlock.status },
              ]}
            />
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Yield from this quarry, last 6 blocks (sq ft per m³)</p>
              <Bars height={120} data={[392, 405, 371, 418, 399, 410].map((v, i) => ({ label: `#${i + 1}`, value: v, tone: v < 380 ? "warn" : "accent" }))} />
            </div>
            <p className="text-[12.5px] text-d-mute">Royalty paid and rawanna (transit pass) on file. Weighbridge slip matched on arrival.</p>
          </div>
        )}
      </Sheet>
    </div>
  );
}
