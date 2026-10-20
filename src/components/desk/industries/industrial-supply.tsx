"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlarmClock,
  AlertTriangle,
  ArrowRight,
  Bot,
  Boxes,
  CheckCheck,
  Cog,
  CreditCard,
  FileText,
  Gauge as GaugeIcon,
  Hourglass,
  IndianRupee,
  Mail,
  MessageCircle,
  Package,
  PackageCheck,
  Percent,
  Phone,
  Plug,
  Plus,
  ScrollText,
  Send,
  ShieldAlert,
  Target,
  TrendingUp,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";
import { DeskShell, useDesk } from "../shell";
import { AreaChart, Bars, Donut, HBars, HeatGrid } from "../charts";
import { AgingBar, ApprovalQueue, Board, Countdown, DataTable } from "../data";
import { AgentsModule, ConnectionsModule, IndependenceModule, PeopleModule } from "../common";
import { Btn, Feed, Field, inputClass, inr, KV, Meter, Modal, Panel, Pill, Segmented, Sheet, Stat } from "../ui";
import { useDrift, useNow } from "../hooks";
import type { DeskConfig, DeskModule, IndependenceData, Integration, TeamMember, Tone, WorkforceAgent } from "../types";

/** trig rounded so server and browser render identical SVG coordinates */
const trig = { cos: (a: number) => Math.round(Math.cos(a) * 1e6) / 1e6, sin: (a: number) => Math.round(Math.sin(a) * 1e6) / 1e6 };

/* ============================================================
   Data — Coromandel Industrial Supply, Ambattur, Chennai.
   Fictional MRO distributor: bearings, fasteners, power tools,
   belts, abrasives and adhesives to factories in the
   Ambattur–Sriperumbudur–Oragadam–Hosur belt.
   ============================================================ */

type Godown = "AMB" | "SPB" | "HSR";
const GODOWNS: { id: Godown; name: string; area: string; sqft: number; staff: number }[] = [
  { id: "AMB", name: "Ambattur main", area: "SIDCO Industrial Estate, Ambattur", sqft: 14000, staff: 11 },
  { id: "SPB", name: "Sriperumbudur", area: "SIPCOT, near Oragadam junction", sqft: 6500, staff: 5 },
  { id: "HSR", name: "Hosur", area: "SIPCOT Phase II, Hosur", sqft: 4200, staff: 3 },
];

type Sku = {
  code: string;
  desc: string;
  brand: string;
  cat: "Bearings" | "Fasteners" | "Power tools" | "Belts" | "Abrasives" | "Adhesives" | "Hand tools";
  unit: string;
  cost: number;
  list: number;
  stock: Record<Godown, number>;
  monthly: number;
  reorder: number;
  lastSale: number; // days ago
  hsn: string;
};

const skus: Sku[] = [
  { code: "KB-6205-2RS", desc: "Ball bearing 6205-2RS, sealed", brand: "Kavach", cat: "Bearings", unit: "pcs", cost: 142, list: 198, stock: { AMB: 840, SPB: 220, HSR: 60 }, monthly: 610, reorder: 600, lastSale: 0, hsn: "8482" },
  { code: "KB-6306-ZZ", desc: "Ball bearing 6306-ZZ, shielded", brand: "Kavach", cat: "Bearings", unit: "pcs", cost: 268, list: 362, stock: { AMB: 190, SPB: 40, HSR: 0 }, monthly: 260, reorder: 300, lastSale: 1, hsn: "8482" },
  { code: "KB-22212-EK", desc: "Spherical roller 22212 EK, taper bore", brand: "Kavach", cat: "Bearings", unit: "pcs", cost: 3860, list: 4920, stock: { AMB: 14, SPB: 6, HSR: 2 }, monthly: 18, reorder: 16, lastSale: 3, hsn: "8482" },
  { code: "KB-UCP208", desc: "Pillow block UCP 208, cast iron", brand: "Kavach", cat: "Bearings", unit: "pcs", cost: 610, list: 820, stock: { AMB: 66, SPB: 30, HSR: 12 }, monthly: 70, reorder: 60, lastSale: 0, hsn: "8483" },
  { code: "VF-HB-M12x50", desc: "Hex bolt M12×50, 8.8 HDG", brand: "Vajra", cat: "Fasteners", unit: "box/100", cost: 1180, list: 1540, stock: { AMB: 320, SPB: 140, HSR: 44 }, monthly: 380, reorder: 300, lastSale: 0, hsn: "7318" },
  { code: "VF-SHCS-M8x25", desc: "Socket cap screw M8×25, 12.9", brand: "Vajra", cat: "Fasteners", unit: "box/100", cost: 640, list: 860, stock: { AMB: 210, SPB: 90, HSR: 30 }, monthly: 240, reorder: 200, lastSale: 0, hsn: "7318" },
  { code: "VF-NYL-M10", desc: "Nyloc nut M10, zinc", brand: "Vajra", cat: "Fasteners", unit: "box/200", cost: 520, list: 690, stock: { AMB: 46, SPB: 12, HSR: 8 }, monthly: 120, reorder: 110, lastSale: 1, hsn: "7318" },
  { code: "VF-ANC-M16", desc: "Wedge anchor M16×150", brand: "Vajra", cat: "Fasteners", unit: "box/25", cost: 1420, list: 1880, stock: { AMB: 8, SPB: 0, HSR: 0 }, monthly: 4, reorder: 6, lastSale: 64, hsn: "7318" },
  { code: "TQ-AG4-850", desc: "Angle grinder 4\", 850 W", brand: "Torqon", cat: "Power tools", unit: "pcs", cost: 2340, list: 3150, stock: { AMB: 38, SPB: 14, HSR: 6 }, monthly: 42, reorder: 30, lastSale: 0, hsn: "8467" },
  { code: "TQ-RH26", desc: "Rotary hammer 26 mm SDS-plus", brand: "Torqon", cat: "Power tools", unit: "pcs", cost: 6480, list: 8650, stock: { AMB: 9, SPB: 3, HSR: 1 }, monthly: 11, reorder: 10, lastSale: 2, hsn: "8467" },
  { code: "TQ-IW18-BL", desc: "Impact wrench 18V brushless kit", brand: "Torqon", cat: "Power tools", unit: "kit", cost: 11200, list: 14900, stock: { AMB: 4, SPB: 0, HSR: 0 }, monthly: 2, reorder: 3, lastSale: 41, hsn: "8467" },
  { code: "SB-B58", desc: "V-belt B-58, classical", brand: "Sudarshan", cat: "Belts", unit: "pcs", cost: 286, list: 395, stock: { AMB: 120, SPB: 60, HSR: 25 }, monthly: 140, reorder: 120, lastSale: 0, hsn: "4010" },
  { code: "SB-SPB2120", desc: "Wedge belt SPB 2120 LW", brand: "Sudarshan", cat: "Belts", unit: "pcs", cost: 690, list: 920, stock: { AMB: 18, SPB: 4, HSR: 0 }, monthly: 36, reorder: 32, lastSale: 1, hsn: "4010" },
  { code: "NA-FD-100", desc: "Flap disc 100 mm, Z60 zirconia", brand: "Nilam", cat: "Abrasives", unit: "box/10", cost: 690, list: 940, stock: { AMB: 260, SPB: 80, HSR: 40 }, monthly: 300, reorder: 250, lastSale: 0, hsn: "6805" },
  { code: "NA-CW-355", desc: "Chop-saw wheel 355 mm", brand: "Nilam", cat: "Abrasives", unit: "box/5", cost: 820, list: 1090, stock: { AMB: 70, SPB: 22, HSR: 10 }, monthly: 64, reorder: 60, lastSale: 0, hsn: "6804" },
  { code: "AB-TL243", desc: "Threadlocker medium, 50 ml", brand: "Agnibond", cat: "Adhesives", unit: "pcs", cost: 410, list: 560, stock: { AMB: 140, SPB: 50, HSR: 20 }, monthly: 150, reorder: 120, lastSale: 0, hsn: "3506" },
  { code: "AB-RT-SIL", desc: "RTV silicone gasket, 300 g", brand: "Agnibond", cat: "Adhesives", unit: "pcs", cost: 365, list: 480, stock: { AMB: 12, SPB: 0, HSR: 0 }, monthly: 9, reorder: 15, lastSale: 72, hsn: "3214" },
  { code: "PH-TW-SET", desc: "Torque wrench 40–200 Nm", brand: "Pratap", cat: "Hand tools", unit: "pcs", cost: 4150, list: 5400, stock: { AMB: 11, SPB: 4, HSR: 2 }, monthly: 8, reorder: 8, lastSale: 4, hsn: "8204" },
  { code: "PH-SP-12", desc: "Spanner set 6–32 mm, 12 pc", brand: "Pratap", cat: "Hand tools", unit: "set", cost: 1260, list: 1690, stock: { AMB: 54, SPB: 18, HSR: 9 }, monthly: 40, reorder: 35, lastSale: 0, hsn: "8204" },
  { code: "PH-AL-HEX", desc: "Allen key set, ball end, 9 pc", brand: "Pratap", cat: "Hand tools", unit: "set", cost: 380, list: 520, stock: { AMB: 6, SPB: 0, HSR: 0 }, monthly: 3, reorder: 10, lastSale: 96, hsn: "8204" },
];
const skuBy = (code: string) => skus.find((s) => s.code === code)!;
const onHand = (s: Sku) => s.stock.AMB + s.stock.SPB + s.stock.HSR;
const moveClass = (s: Sku): "Fast" | "Normal" | "Slow" | "Dead" => (s.lastSale > 60 ? "Dead" : s.lastSale > 30 ? "Slow" : s.monthly >= 100 ? "Fast" : "Normal");

/* ---------------- RFQs ---------------- */

type RfqStatus = "New" | "Drafting" | "Sent" | "Won" | "Lost";
type Rfq = {
  id: string;
  customer: string;
  plant: string;
  contact: string;
  via: "WhatsApp" | "Email" | "Portal" | "Phone";
  lines: [string, number][];
  /** SLA promised to this customer, in minutes */
  sla: number;
  /** minutes left on the SLA when the desk opened (negative = already breached) */
  left: number;
  status: RfqStatus;
  owner: string;
  contract?: string;
  note?: string;
};

const seedRfqs: Rfq[] = [
  { id: "RFQ-4471", customer: "Oragadam Auto Stampings", plant: "Oragadam, Unit 2", contact: "Balaji, Maintenance", via: "WhatsApp", lines: [["KB-6205-2RS", 400], ["KB-UCP208", 24], ["AB-TL243", 40]], sla: 120, left: 14, status: "Drafting", owner: "Arun", contract: "RC-OAS-26", note: "Press line 4 breakdown, wants dispatch today" },
  { id: "RFQ-4472", customer: "Sriperumbudur Precision Castings", plant: "SIPCOT Sriperumbudur", contact: "Nandhini, Purchase", via: "Portal", lines: [["KB-22212-EK", 6], ["SB-SPB2120", 12], ["VF-HB-M12x50", 20], ["NA-CW-355", 10]], sla: 240, left: 37, status: "New", owner: "Lakshmi", note: "Portal closes bids at 4 PM" },
  { id: "RFQ-4469", customer: "Ambattur Gear Works", plant: "Ambattur OT", contact: "Ramesh, Stores", via: "Phone", lines: [["SB-B58", 30], ["VF-SHCS-M8x25", 15]], sla: 60, left: -8, status: "New", owner: "Arun", contract: "RC-AGW-25", note: "Called twice already" },
  { id: "RFQ-4475", customer: "Hosur Electrotech", plant: "Hosur SIPCOT II", contact: "Vignesh, Projects", via: "Email", lines: [["TQ-RH26", 6], ["TQ-AG4-850", 12], ["NA-FD-100", 30], ["PH-SP-12", 8], ["PH-TW-SET", 3]], sla: 480, left: 205, status: "New", owner: "Farhan", note: "New project line, could become a rate contract" },
  { id: "RFQ-4476", customer: "Padi Pumps & Motors", plant: "Padi, Chennai", contact: "Selvam, Purchase", via: "WhatsApp", lines: [["KB-6306-ZZ", 120], ["KB-6205-2RS", 200]], sla: 120, left: 62, status: "New", owner: "Arun" },
  { id: "RFQ-4466", customer: "Guindy Forge & Press", plant: "Guindy Industrial Estate", contact: "Mr. Iyer, GM", via: "Email", lines: [["VF-HB-M12x50", 60], ["VF-NYL-M10", 30], ["VF-ANC-M16", 10]], sla: 240, left: 118, status: "Drafting", owner: "Lakshmi", contract: "RC-GFP-26" },
  { id: "RFQ-4478", customer: "Maraimalai Nagar Plastics", plant: "MM Nagar", contact: "Kavitha, Admin", via: "WhatsApp", lines: [["AB-RT-SIL", 20], ["AB-TL243", 30], ["PH-AL-HEX", 10]], sla: 240, left: 226, status: "New", owner: "Arun" },
  { id: "RFQ-4463", customer: "Irungattukottai Wheels", plant: "Irungattukottai SIPCOT", contact: "Prabhu, Maintenance", via: "Portal", lines: [["KB-22212-EK", 4], ["KB-UCP208", 16], ["SB-SPB2120", 16]], sla: 480, left: 31, status: "Drafting", owner: "Farhan", note: "L1 last time by ₹40 on 22212" },
  { id: "RFQ-4479", customer: "Thirumazhisai Steel Fab", plant: "Thirumazhisai", contact: "Anwar, Owner", via: "Phone", lines: [["NA-CW-355", 40], ["NA-FD-100", 50], ["TQ-AG4-850", 6]], sla: 120, left: 98, status: "New", owner: "Arun" },
  { id: "RFQ-4458", customer: "Ranipet Tannery Machines", plant: "Ranipet SIPCOT", contact: "Dinesh, Purchase", via: "Email", lines: [["SB-B58", 60], ["KB-6306-ZZ", 40]], sla: 480, left: 0, status: "Sent", owner: "Lakshmi" },
  { id: "RFQ-4455", customer: "Oragadam Auto Stampings", plant: "Oragadam, Unit 1", contact: "Balaji, Maintenance", via: "WhatsApp", lines: [["VF-SHCS-M8x25", 40], ["AB-TL243", 20]], sla: 120, left: 0, status: "Won", owner: "Arun", contract: "RC-OAS-26" },
  { id: "RFQ-4481", customer: "Kanchi Textile Machinery", plant: "Kanchipuram", contact: "Suresh, Maintenance", via: "WhatsApp", lines: [["KB-6205-2RS", 150], ["SB-B58", 40], ["PH-SP-12", 4]], sla: 240, left: 171, status: "New", owner: "Farhan" },
  { id: "RFQ-4460", customer: "Hosur Electrotech", plant: "Hosur SIPCOT II", contact: "Vignesh, Projects", via: "Email", lines: [["TQ-IW18-BL", 3]], sla: 480, left: 0, status: "Lost", owner: "Farhan", note: "Lost on price to online, ₹1,200 lower" },
  { id: "RFQ-4482", customer: "Vellore Agro Implements", plant: "Katpadi", contact: "Ganesan, Proprietor", via: "Phone", lines: [["VF-HB-M12x50", 12], ["SB-B58", 20], ["KB-6306-ZZ", 30]], sla: 480, left: 402, status: "New", owner: "Lakshmi" },
];

const rfqValue = (r: Rfq) => r.lines.reduce((a, [c, q]) => a + skuBy(c).list * q, 0);

/** Seconds since the desk opened. Never reads the clock during render. */
function useElapsed() {
  const now = useNow(1000);
  const [opened] = React.useState(() => (typeof window === "undefined" ? 0 : performance.timeOrigin));
  return now ? Math.max(0, (now.getTime() - opened) / 1000) : 0;
}
const isOpen = (r: Rfq) => r.status === "New" || r.status === "Drafting";
const secsLeft = (r: Rfq, elapsed: number) => r.left * 60 - elapsed;
function fmtLeft(sec: number) {
  const s = Math.abs(Math.round(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const body = h ? `${h}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}` : `${m}:${String(ss).padStart(2, "0")}`;
  return sec < 0 ? `-${body}` : body;
}
function urgencyTone(r: Rfq, elapsed: number): Tone {
  if (!isOpen(r)) return r.status === "Lost" ? "neutral" : "ok";
  const sec = secsLeft(r, elapsed);
  const frac = sec / (r.sla * 60);
  return sec <= 0 ? "late" : frac < 0.25 ? "late" : frac < 0.5 ? "warn" : "ok";
}

/* ---------------- Rate contracts ---------------- */

type Contract = {
  id: string;
  customer: string;
  items: number;
  annual: number;
  used: number;
  from: string;
  till: string;
  daysLeft: number;
  clause: string;
  escalation: number;
  status: "Active" | "Renewal due" | "Escalation due" | "Draft";
  lastRev: string;
};
const contracts: Contract[] = [
  { id: "RC-OAS-26", customer: "Oragadam Auto Stampings", items: 142, annual: 8400000, used: 4920000, from: "1 Apr 26", till: "31 Mar 27", daysLeft: 162, clause: "Steel index ±5%, quarterly", escalation: 3.2, status: "Escalation due", lastRev: "Jul 26" },
  { id: "RC-AGW-25", customer: "Ambattur Gear Works", items: 64, annual: 3100000, used: 2780000, from: "1 Nov 25", till: "31 Oct 26", daysLeft: 11, clause: "Fixed, renew yearly", escalation: 0, status: "Renewal due", lastRev: "Nov 25" },
  { id: "RC-GFP-26", customer: "Guindy Forge & Press", items: 88, annual: 4600000, used: 2210000, from: "1 Jun 26", till: "31 May 27", daysLeft: 223, clause: "Principal price list linked", escalation: 4.5, status: "Escalation due", lastRev: "Jun 26" },
  { id: "RC-SPC-26", customer: "Sriperumbudur Precision Castings", items: 51, annual: 2700000, used: 1180000, from: "1 Apr 26", till: "31 Mar 27", daysLeft: 162, clause: "Fixed for 12 months", escalation: 0, status: "Active", lastRev: "Apr 26" },
  { id: "RC-PPM-26", customer: "Padi Pumps & Motors", items: 36, annual: 1900000, used: 1340000, from: "1 Jan 26", till: "31 Dec 26", daysLeft: 72, clause: "Bearing steel index, half-yearly", escalation: 2.1, status: "Active", lastRev: "Jul 26" },
  { id: "RC-IWL-26", customer: "Irungattukottai Wheels", items: 47, annual: 3500000, used: 1620000, from: "1 May 26", till: "30 Apr 27", daysLeft: 192, clause: "Principal price list linked", escalation: 4.5, status: "Escalation due", lastRev: "May 26" },
  { id: "RC-HET-27", customer: "Hosur Electrotech", items: 58, annual: 2400000, used: 0, from: "1 Nov 26", till: "31 Oct 27", daysLeft: 376, clause: "Fixed, 6-month review", escalation: 0, status: "Draft", lastRev: "—" },
  { id: "RC-KTM-26", customer: "Kanchi Textile Machinery", items: 29, annual: 1200000, used: 860000, from: "1 Feb 26", till: "31 Jan 27", daysLeft: 103, clause: "Fixed for 12 months", escalation: 0, status: "Active", lastRev: "Feb 26" },
  { id: "RC-RTM-25", customer: "Ranipet Tannery Machines", items: 22, annual: 900000, used: 810000, from: "1 Dec 25", till: "30 Nov 26", daysLeft: 41, clause: "Fixed, renew yearly", escalation: 0, status: "Renewal due", lastRev: "Dec 25" },
  { id: "RC-MNP-26", customer: "Maraimalai Nagar Plastics", items: 18, annual: 650000, used: 240000, from: "1 Jul 26", till: "30 Jun 27", daysLeft: 253, clause: "Fixed for 12 months", escalation: 0, status: "Active", lastRev: "Jul 26" },
];

/* ---------------- Orders ---------------- */

type Stage = "picking" | "packed" | "billed" | "dispatched" | "delivered";
type Order = { no: string; customer: string; lines: number; value: number; stage: Stage; godown: Godown; vehicle?: string; eway?: string; promised: string; po: string; rush?: boolean };
const seedOrders: Order[] = [
  { no: "SO-8812", customer: "Oragadam Auto Stampings", lines: 6, value: 186400, stage: "picking", godown: "SPB", promised: "Today 4 PM", po: "OAS/PO/2241", rush: true },
  { no: "SO-8813", customer: "Padi Pumps & Motors", lines: 3, value: 42800, stage: "picking", godown: "AMB", promised: "Today", po: "PPM/1187" },
  { no: "SO-8809", customer: "Guindy Forge & Press", lines: 11, value: 238900, stage: "packed", godown: "AMB", promised: "Today 6 PM", po: "GFP-26-0912" },
  { no: "SO-8810", customer: "Kanchi Textile Machinery", lines: 4, value: 61200, stage: "packed", godown: "AMB", promised: "Tomorrow", po: "KTM/PO/77" },
  { no: "SO-8805", customer: "Sriperumbudur Precision Castings", lines: 8, value: 312600, stage: "billed", godown: "SPB", eway: "EWB 3819 2245 6610", promised: "Today", po: "SPC/4410" },
  { no: "SO-8806", customer: "Hosur Electrotech", lines: 5, value: 97400, stage: "billed", godown: "HSR", eway: "EWB 3819 2245 7042", promised: "Today", po: "HET/PRJ/19" },
  { no: "SO-8801", customer: "Ambattur Gear Works", lines: 7, value: 54300, stage: "dispatched", godown: "AMB", vehicle: "TN 05 BX 4417 (own)", promised: "Delivered by 1 PM", po: "AGW/3390" },
  { no: "SO-8802", customer: "Irungattukottai Wheels", lines: 9, value: 268100, stage: "dispatched", godown: "SPB", vehicle: "TN 21 AQ 9032 (Sri Murugan Transports)", eway: "EWB 3819 2244 9981", promised: "Today 3 PM", po: "IWL/PO/5521" },
  { no: "SO-8803", customer: "Thirumazhisai Steel Fab", lines: 3, value: 38600, stage: "dispatched", godown: "AMB", vehicle: "Porter tempo", promised: "Today", po: "Verbal, Anwar" },
  { no: "SO-8796", customer: "Ranipet Tannery Machines", lines: 5, value: 81200, stage: "delivered", godown: "AMB", vehicle: "VRL parcel", eway: "EWB 3819 2241 1173", promised: "Yesterday", po: "RTM/889" },
  { no: "SO-8797", customer: "Maraimalai Nagar Plastics", lines: 4, value: 23900, stage: "delivered", godown: "AMB", vehicle: "TN 05 BX 4417 (own)", promised: "Yesterday", po: "MNP/0091" },
  { no: "SO-8798", customer: "Oragadam Auto Stampings", lines: 12, value: 422500, stage: "delivered", godown: "SPB", vehicle: "TN 21 AQ 9032", eway: "EWB 3819 2241 0420", promised: "Yesterday", po: "OAS/PO/2236" },
];
const STAGE_COLS: { id: Stage; label: string; tone: Tone; hint: string; limit?: number }[] = [
  { id: "picking", label: "Picking", tone: "warn", hint: "Pick list printed at godown", limit: 4 },
  { id: "packed", label: "Packed & checked", tone: "info", hint: "Weighed, labelled, photo sent" },
  { id: "billed", label: "Invoiced", tone: "accent", hint: "Tally invoice + e-way over ₹50k" },
  { id: "dispatched", label: "On the road", tone: "ok", hint: "Vehicle + LR shared on WhatsApp" },
  { id: "delivered", label: "Delivered", tone: "neutral", hint: "Signed DC / GRN photo in" },
];

/* ---------------- Credit ---------------- */

type Account = { customer: string; limit: number; used: number; overdue: number; days: number; terms: number; status: "Hold" | "Watch" | "Clear"; bounces: number; buckets: [number, number, number, number]; promise?: string };
const accounts: Account[] = [
  { customer: "Thirumazhisai Steel Fab", limit: 400000, used: 462000, overdue: 238000, days: 96, terms: 30, status: "Hold", bounces: 1, buckets: [86000, 138000, 0, 238000], promise: "₹1 L by NEFT Friday" },
  { customer: "Vellore Agro Implements", limit: 250000, used: 241000, overdue: 128000, days: 74, terms: 30, status: "Hold", bounces: 0, buckets: [62000, 51000, 128000, 0] },
  { customer: "Kanchi Textile Machinery", limit: 600000, used: 512000, overdue: 96000, days: 52, terms: 45, status: "Watch", bounces: 0, buckets: [298000, 118000, 96000, 0], promise: "Cheque 24 Oct" },
  { customer: "Ambattur Gear Works", limit: 900000, used: 618000, overdue: 54000, days: 48, terms: 45, status: "Watch", bounces: 0, buckets: [402000, 162000, 54000, 0] },
  { customer: "Oragadam Auto Stampings", limit: 3000000, used: 1840000, overdue: 0, days: 38, terms: 60, status: "Clear", bounces: 0, buckets: [1120000, 720000, 0, 0] },
  { customer: "Sriperumbudur Precision Castings", limit: 1500000, used: 1120000, overdue: 210000, days: 66, terms: 60, status: "Watch", bounces: 0, buckets: [610000, 300000, 210000, 0], promise: "After MSME portal approval" },
  { customer: "Guindy Forge & Press", limit: 1800000, used: 940000, overdue: 0, days: 29, terms: 45, status: "Clear", bounces: 0, buckets: [700000, 240000, 0, 0] },
  { customer: "Padi Pumps & Motors", limit: 700000, used: 388000, overdue: 22000, days: 34, terms: 30, status: "Clear", bounces: 0, buckets: [268000, 98000, 22000, 0] },
  { customer: "Irungattukottai Wheels", limit: 2000000, used: 1460000, overdue: 0, days: 41, terms: 60, status: "Clear", bounces: 0, buckets: [980000, 480000, 0, 0] },
  { customer: "Ranipet Tannery Machines", limit: 300000, used: 296000, overdue: 81000, days: 63, terms: 30, status: "Watch", bounces: 2, buckets: [81000, 134000, 81000, 0] },
  { customer: "Hosur Electrotech", limit: 800000, used: 214000, overdue: 0, days: 22, terms: 45, status: "Clear", bounces: 0, buckets: [214000, 0, 0, 0] },
  { customer: "Maraimalai Nagar Plastics", limit: 200000, used: 84000, overdue: 0, days: 18, terms: 30, status: "Clear", bounces: 0, buckets: [84000, 0, 0, 0] },
];

/* ---------------- Principals ---------------- */

const principals = [
  { brand: "Kavach Bearings", cat: "Bearings", target: 12500000, achieved: 9860000, scheme: "2% back-end at 100% of target", rebate: 250000, color: "accent" as Tone, monthly: [3.1, 3.4, 3.36] },
  { brand: "Vajra Fasteners", cat: "Fasteners", target: 6800000, achieved: 6120000, scheme: "Diwali slab: extra 1.5% on ₹8 L+ in Oct", rebate: 102000, color: "info" as Tone, monthly: [1.9, 2.1, 2.12] },
  { brand: "Torqon Power Tools", cat: "Power tools", target: 5400000, achieved: 3020000, scheme: "Display + demo van support at 80%", rebate: 81000, color: "warn" as Tone, monthly: [1.1, 0.92, 1.0] },
  { brand: "Sudarshan Belts", cat: "Belts", target: 2600000, achieved: 2380000, scheme: "1% quarterly on target", rebate: 26000, color: "ok" as Tone, monthly: [0.78, 0.81, 0.79] },
  { brand: "Nilam Abrasives", cat: "Abrasives", target: 3200000, achieved: 3340000, scheme: "Over-achievement 3% above 100%", rebate: 100200, color: "ok" as Tone, monthly: [1.05, 1.12, 1.17] },
  { brand: "Agnibond Adhesives", cat: "Adhesives", target: 1800000, achieved: 1210000, scheme: "Free stock 5% at 90%", rebate: 0, color: "late" as Tone, monthly: [0.42, 0.38, 0.41] },
  { brand: "Pratap Hand Tools", cat: "Hand tools", target: 2200000, achieved: 1690000, scheme: "Counter-top display at 85%", rebate: 0, color: "neutral" as Tone, monthly: [0.55, 0.58, 0.56] },
];

type Claim = { id: string; brand: string; kind: "Rate difference" | "Scheme" | "Damage" | "Price protection"; amount: number; filed: string; age: number; status: "Filed" | "Query" | "Approved" | "Credited" };
const claims: Claim[] = [
  { id: "CL-311", brand: "Kavach Bearings", kind: "Rate difference", amount: 184200, filed: "12 Sep", age: 38, status: "Query" },
  { id: "CL-318", brand: "Vajra Fasteners", kind: "Scheme", amount: 96000, filed: "2 Oct", age: 18, status: "Filed" },
  { id: "CL-302", brand: "Torqon Power Tools", kind: "Damage", amount: 22400, filed: "21 Aug", age: 60, status: "Approved" },
  { id: "CL-320", brand: "Kavach Bearings", kind: "Price protection", amount: 141000, filed: "6 Oct", age: 14, status: "Filed" },
  { id: "CL-296", brand: "Nilam Abrasives", kind: "Scheme", amount: 68400, filed: "2 Aug", age: 79, status: "Credited" },
  { id: "CL-309", brand: "Sudarshan Belts", kind: "Rate difference", amount: 31800, filed: "9 Sep", age: 41, status: "Query" },
  { id: "CL-322", brand: "Agnibond Adhesives", kind: "Damage", amount: 9600, filed: "14 Oct", age: 6, status: "Filed" },
  { id: "CL-305", brand: "Pratap Hand Tools", kind: "Scheme", amount: 28500, filed: "28 Aug", age: 53, status: "Approved" },
  { id: "CL-315", brand: "Torqon Power Tools", kind: "Price protection", amount: 74000, filed: "24 Sep", age: 26, status: "Filed" },
];

/* ---------------- Shared modules ---------------- */

const team: TeamMember[] = [
  { name: "Senthil Natarajan", role: "Owner", status: "Busy", load: 92, focus: "Approving 3 below-floor quotes and the Kavach quarter review call", tasks: [{ title: "Approve margin exceptions", due: "11:00" }, { title: "Kavach quarterly review", due: "3:00" }, { title: "Sign RC renewal, Ambattur Gear", due: "5:00" }], week: [1, 1, 1, 1, 1, 1], since: "1998" },
  { name: "Lakshmi Prabhakar", role: "Inside sales head", status: "Busy", load: 86, focus: "SPC portal bid closes 4 PM; 22212 price needs Senthil's nod", tasks: [{ title: "Submit SPC portal bid", due: "3:30" }, { title: "Guindy Forge escalation letter", due: "12:00", done: true }, { title: "Weekly quote review", due: "6:00" }], week: [1, 1, 1, 1, 1, 1], since: "2009" },
  { name: "Arun Kumar S", role: "Quote desk", status: "On floor", load: 94, focus: "6 open RFQs, Ambattur Gear already breached", tasks: [{ title: "Call back Ambattur Gear", due: "now" }, { title: "OAS breakdown quote", due: "10:45" }, { title: "Padi Pumps bearings", due: "12:00" }], week: [1, 1, 1, 1, 1, 0], since: "2019" },
  { name: "Farhan Basha", role: "Key accounts, Hosur & Oragadam", status: "In field", load: 70, focus: "At Hosur Electrotech for the new project line", tasks: [{ title: "Demo rotary hammer at HET", due: "11:30" }, { title: "Draft RC-HET-27", due: "Thu" }], week: [1, 1, 0, 1, 1, 1], since: "2016" },
  { name: "Murugan Pillai", role: "Godown in-charge, Ambattur", status: "On floor", load: 78, focus: "Guindy Forge 11-line pack; cycle count of Bay C", tasks: [{ title: "Pack SO-8809", due: "2:00" }, { title: "Bay C cycle count", due: "5:00" }, { title: "GRN Vajra lorry", due: "11:00", done: true }], week: [1, 1, 1, 1, 1, 1], since: "2004" },
  { name: "Divya Ramesh", role: "Accounts & credit", status: "On floor", load: 74, focus: "Two holds to decide; Thirumazhisai cheque bounced", tasks: [{ title: "Credit hold review with Senthil", due: "12:30" }, { title: "Ranipet cheque re-present", due: "Wed" }, { title: "GSTR-1 reconciliation", due: "Fri" }], week: [1, 1, 1, 1, 1, 1], since: "2014" },
  { name: "Prakash Velu", role: "Dispatch & e-way", status: "In field", load: 62, focus: "Own tempo on Ambattur–Padi loop, 3 drops", tasks: [{ title: "Drop SO-8801 Ambattur Gear", due: "1:00", done: true }, { title: "Collect cheque from Padi Pumps", due: "3:00" }], week: [1, 1, 1, 1, 1, 1], since: "2017" },
  { name: "Revathi Sundar", role: "Purchase & principal coordinator", status: "Off", load: 40, focus: "Half day; Kavach indent sent, Torqon scheme claim pending", tasks: [{ title: "Follow up CL-311 query", due: "tomorrow" }], week: [1, 1, 1, 1, 1, 0], since: "2020" },
];

const agents: WorkforceAgent[] = [
  { name: "RFQ Reader", role: "Turns WhatsApp, email and portal RFQs into priced drafts", icon: FileText, status: "Running", runsToday: 23, hoursSaved: 7.5, accuracy: 94, last: "1 min ago", skills: ["WhatsApp", "PDF parse", "SKU match"], schedule: "On every incoming RFQ", log: ["Matched 'SKF 6205 2RS' to KB-6205-2RS", "Parsed SPC portal RFQ, 4 lines", "Pulled last 3 prices for Padi Pumps"] },
  { name: "Margin Guard", role: "Holds quotes under the floor margin for owner approval", icon: Percent, status: "Needs you", runsToday: 9, hoursSaved: 2, accuracy: 97, last: "6 min ago", skills: ["Floor margin", "Rate contracts", "Last price"], schedule: "Before every quote is sent", inbox: [{ title: "3 quotes under 12% margin", detail: "SPC 22212 at 9.8%, IWL belts at 10.5%, OAS bearings at 11.2%. All three are L1 chases." }], log: ["Blocked IWL quote at 10.5%", "Approved OAS repeat at rate contract", "Flagged Torqon price list change"] },
  { name: "Reorder Planner", role: "Suggests indents to principals from movement and lead time", icon: Boxes, status: "Needs you", runsToday: 2, hoursSaved: 3, accuracy: 90, last: "7:30 AM", skills: ["Min-max", "Lead time", "Transfers"], schedule: "Daily 7:30 AM", inbox: [{ title: "Kavach indent ₹6.8 L", detail: "6306-ZZ, 22212 EK and UCP208 below reorder. Also move 40 pcs 6205 from AMB to HSR." }], log: ["Suggested AMB → HSR transfer, 3 SKUs", "Flagged 4 dead SKUs worth ₹1.1 L", "Indent draft for Sudarshan belts"] },
  { name: "Credit Sentinel", role: "Watches limits, overdue and bounces before an order is billed", icon: ShieldAlert, status: "Running", runsToday: 14, hoursSaved: 2.5, accuracy: 95, last: "12 min ago", skills: ["Tally ledger", "Ageing", "Cheque status"], schedule: "Before every invoice", log: ["Held SO for Thirumazhisai, 96 days", "Released Padi Pumps after NEFT", "Ranipet second bounce logged"] },
  { name: "Dispatch Runner", role: "Raises e-way bills and shares LR, vehicle and photos", icon: Truck, status: "Running", runsToday: 11, hoursSaved: 3.5, accuracy: 98, last: "4 min ago", skills: ["E-way bill", "WhatsApp", "LR"], schedule: "On every invoice", log: ["EWB generated for SO-8805", "Shared vehicle TN 21 AQ 9032 with IWL", "POD photo matched for SO-8796"] },
  { name: "Claims Clerk", role: "Files and chases principal claims and scheme credits", icon: ScrollText, status: "Idle", runsToday: 1, hoursSaved: 1.5, accuracy: 88, last: "Yesterday", skills: ["Scheme rules", "Debit notes", "Email"], schedule: "Weekly Monday", log: ["Filed CL-322 Agnibond damage", "Reminded Kavach on CL-311 query", "Nilam CL-296 credited ₹68,400"] },
];

const independence: IndependenceData = {
  score: 41,
  history: [28, 30, 31, 34, 36, 39, 41],
  quote: "Every customer thinks they have my mobile number for a reason. If I don't pick up, they think the price is going up.",
  pillars: [
    { name: "Quoting & pricing", score: 33, note: "Anything over ₹1 L or under 15% margin waits for Senthil. Average wait 2.4 hours.", fixes: [{ title: "Margin bands by customer tier", gain: 4 }, { title: "Auto-approve at rate contract", gain: 3 }] },
    { name: "Key accounts", score: 38, note: "Oragadam and Guindy Forge escalate straight to the owner.", fixes: [{ title: "Farhan owns OAS weekly review", gain: 3 }] },
    { name: "Stock & purchase", score: 52, note: "Indents are planned, but principal calls still need Senthil.", fixes: [{ title: "Revathi signs indents under ₹5 L", gain: 2 }] },
    { name: "Credit & collections", score: 36, note: "Every hold release is a phone call to the owner.", fixes: [{ title: "Divya releases up to 10% over limit", gain: 3 }, { title: "Daily dues agent", gain: 2 }] },
    { name: "Dispatch", score: 64, note: "Runs on its own; e-way and LR are automated.", fixes: [{ title: "POD photo to auto-close", gain: 1 }] },
    { name: "Numbers & reporting", score: 39, note: "Principal targets are tracked in a notebook in Senthil's drawer.", fixes: [{ title: "Live principal scorecard", gain: 2 }] },
    { name: "Owner time", score: 27, note: "Senthil takes 60+ customer calls a day.", fixes: [{ title: "Quote status on WhatsApp bot", gain: 3 }] },
  ],
  ownerHours: [
    { label: "Price approvals", hours: 12 },
    { label: "Customer calls", hours: 14 },
    { label: "Credit calls", hours: 6 },
    { label: "Principals", hours: 5 },
    { label: "Godown rounds", hours: 4 },
    { label: "Bank", hours: 2 },
    { label: "Strategy", hours: 1 },
  ],
};

const integrations: Integration[] = [
  { name: "Tally Prime", category: "Accounts", status: "Connected", detail: "Sales orders, invoices, ledgers and stock, both ways.", synced: "3 min ago", records: "48,210 vouchers", mark: "T", color: "#1c4f9c" },
  { name: "WhatsApp Business", category: "Messaging", status: "Connected", detail: "RFQs in, quotes and dispatch updates out.", synced: "just now", records: "6,840 chats", mark: "W", color: "#1f9d55" },
  { name: "E-way bill portal", category: "Compliance", status: "Connected", detail: "Auto-generate EWB for invoices over ₹50,000.", synced: "4 min ago", records: "312 this month", mark: "EW", color: "#b45309" },
  { name: "GST e-invoice (IRP)", category: "Compliance", status: "Connected", detail: "IRN and QR on every B2B invoice.", synced: "4 min ago", records: "1,104 IRNs", mark: "IRN", color: "#7c3aed" },
  { name: "Gmail", category: "Messaging", status: "Connected", detail: "RFQ PDFs and customer POs parsed into drafts.", synced: "8 min ago", records: "2,960 threads", mark: "G", color: "#ea4335" },
  { name: "SPC supplier portal", category: "Customers", status: "Syncing", detail: "Sriperumbudur Precision Castings bid portal.", synced: "live", records: "14 open bids", mark: "SP", color: "#0e7490" },
  { name: "OAS vendor portal", category: "Customers", status: "Error", detail: "Password rotated; ASN upload paused.", synced: "1 day ago", records: "—", mark: "OA", color: "#d97706" },
  { name: "Kavach dealer portal", category: "Principals", status: "Connected", detail: "Price lists, indents and scheme statements.", synced: "7:30 AM", records: "2,140 SKUs", mark: "K", color: "#2563eb" },
  { name: "ICICI CIB", category: "Banking", status: "Connected", detail: "NEFT credits matched to customer ledgers.", synced: "15 min ago", records: "86 credits", mark: "IC", color: "#9a3412" },
  { name: "Razorpay", category: "Banking", status: "Available", detail: "Payment links for walk-in and new accounts.", synced: "—", records: "—", mark: "R", color: "#3b82f6" },
];

/* ============================================================
   Config
   ============================================================ */

const config: DeskConfig = {
  slug: "industrial-supply",
  company: "Coromandel Industrial Supply",
  brand: "Coromandel",
  city: "Chennai (Ambattur)",
  state: "TN",
  icon: Cog,
  tagline: "Bearings, fasteners, power tools and MRO to 340 factories · 3 godowns · 7 principals",
  owner: { name: "Senthil Natarajan", first: "Senthil", initials: "SN", role: "Owner" },
  theme: {
    variant: "control",
    paper: "#0d1520",
    panel: "#142030",
    sunk: "#0a111a",
    ink: "#e7edf5",
    mute: "#8797ac",
    line: "#233349",
    accent: "#f2b233",
    accentInk: "#1b1405",
    soft: "#2a2617",
    ok: "#4cc38a",
    warn: "#ec8c3a",
    late: "#ef5f5f",
    info: "#5aa9e6",
    heading: "mono",
  },
  pulse: [
    { label: "RFQs on the clock", value: "11", delta: "+3", good: false, trend: [6, 7, 9, 8, 10, 9, 11], tone: "warn", module: "wall" },
    { label: "Median response", value: "1h 42m", delta: "-18m", good: true, trend: [3.1, 2.8, 2.6, 2.4, 2.1, 1.9, 1.7], tone: "ok", module: "wall" },
    { label: "Win rate, 30d", value: "38%", delta: "+4%", trend: [30, 31, 33, 34, 35, 36, 38], module: "wall" },
    { label: "Orders to dispatch", value: "6", delta: "+2", good: false, trend: [4, 5, 3, 6, 5, 4, 6], tone: "info", module: "orders" },
    { label: "Overdue receivables", value: "₹8.3 L", delta: "+11%", good: false, trend: [6.1, 6.4, 6.9, 7.2, 7.5, 7.9, 8.3], tone: "late", module: "credit" },
  ],
  agenda: [
    { at: 9.5, title: "Quote stand-up", detail: "11 RFQs open, 1 breached", count: 11, tone: "warn", module: "wall" },
    { at: 11, title: "Margin exceptions", detail: "3 quotes under 12%", count: 3, tone: "accent", module: "wall" },
    { at: 12.5, title: "Credit holds with Divya", detail: "2 holds, 1 bounce", count: 2, tone: "late", module: "credit" },
    { at: 15, title: "Kavach quarterly review", detail: "79% of target, 72 days left", tone: "info", module: "principals" },
    { at: 16, title: "SPC portal bid closes", detail: "4 lines, ₹1.0 L", count: 1, tone: "late", module: "wall" },
    { at: 17.5, title: "Dispatch close", detail: "6 orders still in the godown", count: 6, tone: "ok", module: "orders" },
  ],
  activity: [
    { time: "10:52 AM", text: "RFQ Reader parsed RFQ-4482 from Vellore Agro, 3 lines", tone: "info" },
    { time: "10:31 AM", text: "Ambattur Gear Works RFQ-4469 crossed its 60-minute SLA", tone: "late" },
    { time: "10:14 AM", text: "Dispatch Runner generated EWB for SO-8805, ₹3.1 L", tone: "ok" },
    { time: "9:48 AM", text: "Credit Sentinel held order for Thirumazhisai Steel Fab, 96 days", tone: "warn" },
    { time: "9:20 AM", text: "Kavach price list effective 1 Nov: +4.5% on spherical rollers", tone: "info" },
    { time: "9:05 AM", text: "Vajra lorry GRN done at Ambattur, 38 cartons", tone: "ok" },
  ],
  asks: [
    { q: "Which RFQs will breach their SLA in the next hour?", a: "Four, if nobody touches them.\n\n• RFQ-4469 Ambattur Gear Works: already 8 min past its 60-min SLA. Two lines, both at rate contract, can go in 5 minutes.\n• RFQ-4471 Oragadam Auto Stampings: 14 min left, breakdown order, ₹1.1 L.\n• RFQ-4463 Irungattukottai Wheels: 31 min left; Margin Guard is holding it at 10.5%.\n• RFQ-4472 SPC: 37 min left on our SLA, portal closes 4 PM.\n\nArun has 6 open; move RFQ-4476 Padi Pumps to Lakshmi to free him for OAS.", sources: ["Quote wall", "RFQ Reader log"] },
    { q: "What margin are we quoting at this month?", a: "Blended 18.6% on 214 quotes sent, down from 20.1% in September.\n\n• Bearings 15.2% (Kavach L1 chases at SPC and IWL pulled it down)\n• Fasteners 22.4%\n• Power tools 19.8%\n• Abrasives 24.1%\n\nThree quotes are waiting for you under the 12% floor. Approving all three adds ₹1.9 L of revenue at ₹19,800 margin.", sources: ["Tally sales register", "Margin Guard"] },
    { q: "Who should I put on credit hold today?", a: "Thirumazhisai Steel Fab and Vellore Agro are already on hold.\n\nWatch Ranipet Tannery Machines: two cheque bounces this year, ₹2.96 L used of a ₹3 L limit and ₹81,000 over 60 days. Credit Sentinel suggests advance-only until the cheque clears on Wednesday.\n\nSPC is 66 days on ₹2.1 L but has raised it on the MSME Samadhaan-style portal approval cycle; don't hold, they are your second-largest account.", sources: ["Tally ledgers", "ICICI CIB", "Credit Sentinel"] },
    { q: "Are we going to hit the Kavach target?", a: "At the current run rate, no. ₹98.6 L of ₹1.25 Cr (79%), 72 days left in the quarter. You need ₹26.4 L more, about ₹11 L a month against a ₹10.1 L average.\n\nThe gap closes if you win RFQ-4472 SPC (22212 rollers, ₹30k) and renew Ambattur Gear's contract with the bearings line. The 2% back-end rebate is worth ₹2.5 L, so a sharper price on two L1 chases pays for itself.", sources: ["Principal scorecard", "Kavach dealer portal"] },
    { q: "Which stock is dead and what is it worth?", a: "4 SKUs, ₹1.12 L at cost.\n\n• TQ-IW18-BL impact wrench kits: 4 kits, ₹44,800, last sold 41 days ago\n• PH-AL-HEX allen key sets: 6 sets, 96 days\n• AB-RT-SIL silicone: 12 tubes, 72 days, expiry Feb 27\n• VF-ANC-M16 wedge anchors: 8 boxes, 64 days\n\nHosur Electrotech's project RFQ is a good home for the impact wrenches; offer them at 8% off.", sources: ["Tally stock summary", "Reorder Planner"] },
    { q: "Draft a reply to Ambattur Gear about their late quote", a: "Draft (not sent):\n\n“Vanakkam Ramesh sir, sorry for the delay on this morning's enquiry. As per our rate contract RC-AGW-25: B-58 V-belt ₹395 × 30 and M8×25 socket cap screws ₹860/box × 15. Total ₹24,750 + GST 18%. Stock is ready at Ambattur; we can drop it with today's 3 PM tempo. Also, your contract ends 31 Oct; Lakshmi will share the renewal tomorrow. Arun, Coromandel Industrial Supply”", sources: ["RFQ-4469", "RC-AGW-25"] },
  ],
  run: {
    label: "Runs every 15 minutes during business hours. You can also run it now.",
    title: "Quote Desk sweep",
    steps: [
      { text: "Read new RFQs from WhatsApp, Gmail and 2 portals", result: "3 new, 14 lines matched to SKUs" },
      { text: "Price each line from rate contracts and last-quoted price", result: "9 at contract, 5 from price list" },
      { text: "Check stock across Ambattur, Sriperumbudur and Hosur", result: "2 lines need AMB → SPB transfer" },
      { text: "Run Margin Guard and credit check", result: "3 under floor, 1 customer on hold" },
      { text: "Re-rank the wall by SLA left", result: "4 RFQs breach within the hour" },
    ],
    outcome: "Ambattur Gear can be sent now at contract rates. OAS breakdown quote is drafted and in stock at Sriperumbudur. Three L1 chases need your margin call before 11.",
    actions: ["Send RFQ-4469 at contract", "Approve 3 margin exceptions", "Move RFQ-4476 to Lakshmi", "Transfer 40 × 6205 to SPB"],
  },
};

/* ============================================================
   Desk
   ============================================================ */

export default function IndustrialSupplyDesk() {
  const [rfqs, setRfqs] = React.useState(seedRfqs);
  const [orders, setOrders] = React.useState(seedOrders);
  const openCount = rfqs.filter(isOpen).length;

  const modules: DeskModule[] = [
    {
      id: "wall",
      label: "Quote wall",
      title: "Quote clock wall",
      blurb: "Every open RFQ on its own clock. The ring drains as the promised response time runs out.",
      icon: AlarmClock,
      count: openCount,
      notes: ["Each tile is an RFQ; the ring is the SLA we promised that customer, draining in real time.", "Red tiles have breached or have under a quarter of their time left. Sort by urgency to work the wall top-down.", "Click a tile to build the quote: pick lines, set price and margin, send on WhatsApp."],
      render: () => <WallHome rfqs={rfqs} setRfqs={setRfqs} />,
    },
    { id: "contracts", label: "Rate contracts", count: contracts.filter((c) => c.status !== "Active").length, title: "Rate contracts", blurb: "Fixed-price agreements with factories, their consumption and the escalations due", icon: ScrollText, render: () => <ContractsTab /> },
    { id: "stock", label: "Stock", count: skus.filter((s) => onHand(s) < s.reorder).length, title: "Stock across godowns", blurb: "Ambattur, Sriperumbudur and Hosur: fast and slow movers, reorder points and transfers", icon: Warehouse, render: () => <StockTab /> },
    { id: "orders", label: "Orders & dispatch", count: orders.filter((o) => o.stage !== "delivered" && o.stage !== "dispatched").length, title: "Orders & dispatch", blurb: "Drag an order across as it is picked, packed, invoiced and put on the road", icon: Truck, render: () => <OrdersTab orders={orders} setOrders={setOrders} /> },
    { id: "credit", label: "Credit control", count: accounts.filter((a) => a.status === "Hold").length, title: "Credit control", blurb: "Limits, ageing, bounces and the orders waiting on a credit decision", icon: CreditCard, render: () => <CreditTab /> },
    { id: "principals", label: "Principals & targets", title: "Principals & targets", blurb: "Quarterly targets from each brand, what's achieved, schemes and claims due back", icon: Target, render: () => <PrincipalsTab /> },
    { id: "team", label: "People", title: "People", blurb: "Quote desk, key accounts, godowns and accounts: who is carrying what", icon: Users, render: () => <PeopleModule members={team} /> },
    { id: "agents", label: "Agents", title: "Agents", blurb: "Six AI agents reading RFQs, guarding margin and chasing claims", icon: Bot, render: () => <AgentsModule agents={agents} /> },
    { id: "independence", label: "Independence", title: "Owner independence", blurb: "How much of Coromandel runs without Senthil on the phone", icon: GaugeIcon, render: () => <IndependenceModule data={independence} /> },
    { id: "connections", label: "Connections", title: "Connections", blurb: "Tally, WhatsApp, e-way, IRP, customer portals and principal portals", icon: Plug, render: () => <ConnectionsModule items={integrations} /> },
  ];

  return <DeskShell config={config} modules={modules} />;
}

/* ---------------- Home: quote clock wall ---------------- */

type SortKey = "Urgency" | "Value" | "Customer";
type WallFilter = "On the clock" | "Breaching" | "Sent" | "All";

function WallHome({ rfqs, setRfqs }: { rfqs: Rfq[]; setRfqs: React.Dispatch<React.SetStateAction<Rfq[]>> }) {
  const desk = useDesk();
  const elapsed = useElapsed();
  const [sort, setSort] = React.useState<SortKey>("Urgency");
  const [filter, setFilter] = React.useState<WallFilter>("On the clock");
  const [open, setOpen] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);
  const rfq = rfqs.find((r) => r.id === open) ?? null;

  const live = rfqs.filter(isOpen);
  const breaching = live.filter((r) => secsLeft(r, elapsed) < 30 * 60);
  const breached = live.filter((r) => secsLeft(r, elapsed) <= 0);
  const pipeline = live.reduce((a, r) => a + rfqValue(r), 0);
  const quotedToday = useDrift(23, 0.6, 4000);

  const shown = rfqs
    .filter((r) => (filter === "All" ? true : filter === "Sent" ? !isOpen(r) : filter === "Breaching" ? isOpen(r) && secsLeft(r, elapsed) < 30 * 60 : isOpen(r)))
    .sort((a, b) => {
      if (sort === "Value") return rfqValue(b) - rfqValue(a);
      if (sort === "Customer") return a.customer.localeCompare(b.customer);
      const ao = isOpen(a) ? 0 : 1;
      const bo = isOpen(b) ? 0 : 1;
      return ao - bo || secsLeft(a, elapsed) / (a.sla * 60) - secsLeft(b, elapsed) / (b.sla * 60);
    });

  function update(id: string, patch: Partial<Rfq>) {
    setRfqs((cur) => cur.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="RFQs on the clock" value={live.length} delta="+3" deltaGood={false} hint="since 9 AM" icon={AlarmClock} tone="warn" trend={[6, 7, 9, 8, 10, 9, live.length]} />
        <Stat label="Breaching in 30 min" value={breaching.length} delta={breached.length ? `+${breached.length}` : "-1"} deltaGood={false} hint={`${breached.length} already past SLA`} icon={Hourglass} tone="late" trend={[1, 2, 1, 3, 2, 3, breaching.length]} onClick={() => setFilter("Breaching")} />
        <Stat label="Open pipeline" value={inr(pipeline, { compact: true })} delta="+14%" hint="list value, before discount" icon={IndianRupee} trend={[3.1, 3.6, 4.2, 4.0, 4.6, 5.1, pipeline / 1e5]} />
        <Stat label="Quotes sent today" value={Math.round(quotedToday)} delta="+5" hint="median 1h 42m to respond" icon={Send} tone="ok" trend={[4, 8, 11, 14, 17, 20, quotedToday]} />
      </div>

      <Panel
        live
        title="Quote clock wall"
        sub={`${live.length} RFQs ticking · ${breached.length} past SLA · click any tile to build its quote`}
        action={
          <>
            <Segmented size="sm" options={["On the clock", "Breaching", "Sent", "All"] as const} value={filter} onChange={setFilter} />
            <Segmented size="sm" options={["Urgency", "Value", "Customer"] as const} value={sort} onChange={setSort} />
            <Btn size="sm" variant="solid" icon={Plus} onClick={() => setAdding(true)}>
              Log RFQ
            </Btn>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {shown.map((r, i) => (
            <QuoteTile key={r.id} r={r} elapsed={elapsed} delay={i * 30} onOpen={() => setOpen(r.id)} />
          ))}
        </div>
        {shown.length === 0 && <p className="py-10 text-center font-mono text-[12.5px] text-d-mute">Wall is clear. Nothing in this view.</p>}
        <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-[11px] uppercase tracking-wider text-d-mute">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-d-ok" /> over half the SLA left</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-d-warn" /> under half</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-d-late" /> under a quarter or breached</span>
          <span className="ml-auto normal-case tracking-normal">Clocks count from when the RFQ landed, not when we saw it.</span>
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr_1fr]">
        <Panel icon={TrendingUp} title="Speed wins orders" sub="Win rate by how fast we replied, last 90 days, 1,186 quotes">
          <Bars
            height={170}
            format={(v) => `${v}%`}
            data={[
              { label: "< 30m", value: 61, tone: "ok", note: "212 quotes" },
              { label: "30m–1h", value: 48, tone: "ok", note: "301 quotes" },
              { label: "1–2h", value: 36, tone: "accent", note: "288 quotes" },
              { label: "2–4h", value: 24, tone: "warn", note: "214 quotes" },
              { label: "4–8h", value: 15, tone: "late", note: "119 quotes" },
              { label: "> 8h", value: 7, tone: "late", note: "52 quotes" },
            ]}
          />
        </Panel>
        <Panel icon={Users} title="Who is on the wall" sub="Open RFQs by owner, value in brackets">
          <HBars
            format={(v) => `${v} open`}
            data={["Arun", "Lakshmi", "Farhan"].map((o) => {
              const mine = live.filter((r) => r.owner === o);
              return { label: o, value: mine.length, sub: inr(mine.reduce((a, r) => a + rfqValue(r), 0), { compact: true }), tone: mine.length > 4 ? "late" : mine.length > 2 ? "warn" : "ok" };
            })}
          />
          <Btn
            size="sm"
            variant="soft"
            className="mt-4"
            icon={ArrowRight}
            onClick={() => {
              const target = rfqs.find((r) => r.id === "RFQ-4476");
              if (!target || target.owner === "Lakshmi") return toast("RFQ-4476 is already with Lakshmi");
              update("RFQ-4476", { owner: "Lakshmi" });
              toast.success("RFQ-4476 moved to Lakshmi", { description: "Arun is freed up for the OAS breakdown quote." });
              desk.log("RFQ-4476 Padi Pumps reassigned Arun → Lakshmi", "info");
            }}
          >
            Balance: move Padi Pumps to Lakshmi
          </Btn>
        </Panel>
        <Panel icon={MessageCircle} title="Where RFQs come from" sub="This month, 486 RFQs">
          <Donut
            size={140}
            center="486"
            sub="RFQs"
            segments={[
              { label: "WhatsApp", value: 238, tone: "ok" },
              { label: "Email + PDF", value: 131, tone: "info" },
              { label: "Customer portals", value: 72, tone: "accent" },
              { label: "Phone", value: 45, tone: "warn" },
            ]}
          />
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Panel icon={Percent} title="Waiting on Senthil: margin under 12%" sub="Margin Guard holds these until you decide. All three are L1 chases against known competitors." action={<Pill tone="warn" mono>3 · ₹1.9 L</Pill>}>
          <ApprovalQueue
            items={[
              { id: "m1", title: "RFQ-4472 · SPC 22212 EK at ₹4,280", sub: "9.8% margin · competitor quoted ₹4,310 last bid · helps Kavach target", amount: inr(102480), meta: "9.8%", tone: "late" },
              { id: "m2", title: "RFQ-4463 · IWL wedge belts SPB 2120", sub: "10.5% margin · last PO went to a Coimbatore dealer by ₹40", amount: inr(46200), meta: "10.5%" },
              { id: "m3", title: "RFQ-4471 · OAS 6205-2RS × 400", sub: "11.2% at contract minus 3% · breakdown, they will pay for speed", amount: inr(41200), meta: "11.2%" },
            ]}
            onDecide={(id, d) => d && desk.log(`Margin exception ${id} ${d}`, d === "approved" ? "ok" : "warn")}
          />
        </Panel>
        <Panel icon={FileText} title="Landing now" sub="Read by RFQ Reader from WhatsApp, Gmail and portals">
          <Feed
            max={6}
            items={[
              { time: "10:52", who: "WhatsApp", text: "Vellore Agro: 'M12 bolts 12 box, B58 belt 20, 6306 bearing 30, rate pls'", tone: "info" },
              { time: "10:40", who: "Phone", text: "Thirumazhisai Steel Fab asked for chop-saw wheels, account on credit hold", tone: "warn" },
              { time: "10:18", who: "WhatsApp", text: "Kanchi Textile: photo of a 6205 with 'same 150 nos urgent'", tone: "info" },
              { time: "9:57", who: "Email", text: "Maraimalai Nagar Plastics sent a 3-line PDF enquiry", tone: "accent" },
              { time: "9:31", who: "Portal", text: "SPC published bid #SPC-MRO-1182, closes 4 PM", tone: "late" },
              { time: "9:12", who: "Email", text: "Hosur Electrotech project BOM, 5 lines, tools for a new cell", tone: "ok" },
            ]}
          />
        </Panel>
      </div>

      <QuoteBuilder
        rfq={rfq}
        onClose={() => setOpen(null)}
        onSend={(id, total, margin, via) => {
          update(id, { status: "Sent" });
          toast.success(`${id} quote sent on ${via}`, { description: `${inr(total)} + GST · ${margin.toFixed(1)}% margin` });
          desk.log(`${id} quoted ${inr(total, { compact: true })} at ${margin.toFixed(1)}% via ${via}`, "ok");
          setOpen(null);
        }}
        onStatus={(id, status) => {
          update(id, { status });
          desk.log(`${id} marked ${status}`, status === "Won" ? "ok" : status === "Lost" ? "late" : "info");
        }}
      />
      <NewRfq
        open={adding}
        onOpenChange={setAdding}
        onAdd={(r) => {
          setRfqs((cur) => [r, ...cur]);
          toast.success(`${r.id} on the wall`, { description: `${r.customer} · ${r.sla / 60}h SLA` });
          desk.log(`New RFQ ${r.id} from ${r.customer} via ${r.via}`, "info");
        }}
      />
    </div>
  );
}

function SlaRing({ frac, tone, label, size = 64 }: { frac: number; tone: Tone; label: React.ReactNode; size?: number }) {
  const r = size / 2 - 5;
  const c = 2 * Math.PI * r;
  const color = `var(--d-${tone === "neutral" ? "mute" : tone})`;
  const f = Math.max(0, Math.min(1, frac));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--d-sunk)" strokeWidth="5" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const p = (v: number) => v.toFixed(2);
          return <line key={i} x1={p(size / 2 + trig.cos(a) * (r + 3.5))} y1={p(size / 2 + trig.sin(a) * (r + 3.5))} x2={p(size / 2 + trig.cos(a) * (r + 1))} y2={p(size / 2 + trig.sin(a) * (r + 1))} stroke="var(--d-line)" strokeWidth="1" />;
        })}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${f * c} ${c}`} style={{ transition: "stroke-dasharray 900ms linear" }} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">{label}</span>
    </div>
  );
}

function QuoteTile({ r, elapsed, delay, onOpen }: { r: Rfq; elapsed: number; delay: number; onOpen: () => void }) {
  const sec = secsLeft(r, elapsed);
  const tone = urgencyTone(r, elapsed);
  const open = isOpen(r);
  const breached = open && sec <= 0;
  const value = rfqValue(r);
  const ViaIcon = r.via === "WhatsApp" ? MessageCircle : r.via === "Email" ? Mail : r.via === "Phone" ? Phone : FileText;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="desk-rise group relative overflow-hidden rounded-[10px] border bg-d-sunk/60 p-3.5 text-left transition-all hover:-translate-y-0.5 hover:bg-d-sunk"
      style={{ animationDelay: `${delay}ms`, borderColor: open ? `color-mix(in oklab, ${`var(--d-${tone})`} ${breached ? 70 : 35}%, var(--d-line))` : "var(--d-line)", opacity: open ? 1 : 0.72 }}
    >
      {breached && <span className="bb-pulse absolute inset-x-0 top-0 h-[3px] bg-d-late" />}
      <div className="flex items-start gap-3">
        <SlaRing
          frac={open ? sec / (r.sla * 60) : r.status === "Lost" ? 0 : 1}
          tone={tone}
          label={
            open ? (
              <span className="flex flex-col items-center leading-none">
                <span className={`tnum font-mono font-semibold ${fmtLeft(sec).length > 6 ? "text-[9.5px]" : "text-[11.5px]"}`} style={{ color: `var(--d-${tone})` }}>{fmtLeft(sec)}</span>
                <span className="mt-0.5 font-mono text-[8.5px] uppercase text-d-mute">{breached ? "over" : "left"}</span>
              </span>
            ) : (
              <span className="font-mono text-[10px] font-semibold uppercase" style={{ color: r.status === "Lost" ? "var(--d-mute)" : "var(--d-ok)" }}>{r.status}</span>
            )
          }
        />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-wider text-d-mute">
            {r.id}
            <ViaIcon className="h-3 w-3" />
            {r.status === "Drafting" && <span className="text-d-accent">· drafting</span>}
          </p>
          <p className="mt-0.5 truncate text-[14px] font-semibold leading-tight">{r.customer}</p>
          <p className="truncate text-[11.5px] text-d-mute">{r.plant} · {r.contact}</p>
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-mono text-[11px] text-d-mute">
            {r.lines.length} lines · {r.lines.map(([c]) => skuBy(c).cat).filter((v, i, a) => a.indexOf(v) === i).join(", ")}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px]">
            <span className="text-d-mute">SLA {r.sla >= 60 ? `${r.sla / 60}h` : `${r.sla}m`}</span>
            <span className="text-d-line">|</span>
            <span>{r.owner}</span>
            {r.contract && <Pill tone="info" mono>{r.contract}</Pill>}
          </p>
        </div>
        <span className="tnum shrink-0 font-mono text-[16px] font-semibold">{inr(value, { compact: true })}</span>
      </div>
      {r.note && <p className="mt-2 truncate border-t border-d-line pt-2 text-[11.5px] text-d-mute">{r.note}</p>}
    </button>
  );
}

type QLine = { code: string; qty: number; price: number; on: boolean };

function QuoteBuilder({
  rfq,
  onClose,
  onSend,
  onStatus,
}: {
  rfq: Rfq | null;
  onClose: () => void;
  onSend: (id: string, total: number, margin: number, via: string) => void;
  onStatus: (id: string, status: RfqStatus) => void;
}) {
  return (
    <Sheet open={!!rfq} onOpenChange={(o) => !o && onClose()} width={620} eyebrow={rfq ? `${rfq.id} · via ${rfq.via} · owner ${rfq.owner}` : ""} title={rfq?.customer ?? ""} sub={rfq ? `${rfq.plant} · ${rfq.contact}${rfq.contract ? ` · rate contract ${rfq.contract}` : ""}` : ""}>
      {rfq && <QuoteBuilderBody key={rfq.id} rfq={rfq} onSend={onSend} onStatus={onStatus} />}
    </Sheet>
  );
}

function QuoteBuilderBody({ rfq, onSend, onStatus }: { rfq: Rfq; onSend: (id: string, total: number, margin: number, via: string) => void; onStatus: (id: string, status: RfqStatus) => void }) {
  const elapsed = useElapsed();
  const [lines, setLines] = React.useState<QLine[]>(() => rfq.lines.map(([code, qty]) => ({ code, qty, price: rfq.contract ? Math.round(skuBy(code).list * 0.94) : skuBy(code).list, on: true })));
  const [via, setVia] = React.useState<"WhatsApp" | "Email">(rfq.via === "Email" || rfq.via === "Portal" ? "Email" : "WhatsApp");
  const [validity, setValidity] = React.useState("7 days");
  const picked = lines.filter((l) => l.on);
  const total = picked.reduce((a, l) => a + l.price * l.qty, 0);
  const cost = picked.reduce((a, l) => a + skuBy(l.code).cost * l.qty, 0);
  const margin = total ? ((total - cost) / total) * 100 : 0;
  const gst = total * 0.18;
  const open = isOpen(rfq);
  const sec = secsLeft(rfq, elapsed);

  function setAll(m: number) {
    setLines((cur) => cur.map((l) => ({ ...l, price: Math.round(skuBy(l.code).cost / (1 - m / 100)) })));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 rounded-[10px] border border-d-line bg-d-sunk/60 p-3">
        <SlaRing size={72} frac={open ? sec / (rfq.sla * 60) : 1} tone={urgencyTone(rfq, elapsed)} label={<span className="tnum font-mono text-[12px] font-semibold">{open ? fmtLeft(sec) : rfq.status}</span>} />
        <div className="min-w-0 flex-1 text-[12.5px]">
          <p className="font-medium">{open ? (sec <= 0 ? "SLA breached. Send now and apologise." : "Time left on the promised response") : `Quote ${rfq.status.toLowerCase()}`}</p>
          {rfq.note && <p className="mt-1 text-d-mute">{rfq.note}</p>}
        </div>
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-[11px] uppercase tracking-wider text-d-mute">Lines · tick to include</p>
          <div className="flex items-center gap-1.5">
            <span className="text-[11.5px] text-d-mute">Price all at</span>
            {[12, 18, 24].map((m) => (
              <Btn key={m} size="sm" variant="outline" onClick={() => setAll(m)}>
                {m}%
              </Btn>
            ))}
          </div>
        </div>
        <ul className="space-y-2">
          {lines.map((l, i) => {
            const s = skuBy(l.code);
            const m = l.price ? ((l.price - s.cost) / l.price) * 100 : 0;
            const stock = onHand(s);
            return (
              <li key={l.code} className={`rounded-[10px] border border-d-line p-3 transition-opacity ${l.on ? "" : "opacity-45"}`}>
                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={l.on} onChange={() => setLines((cur) => cur.map((x, j) => (j === i ? { ...x, on: !x.on } : x)))} className="mt-1 h-4 w-4 accent-[var(--d-accent)]" aria-label={`Include ${s.code}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium">{s.desc}</p>
                    <p className="font-mono text-[11px] text-d-mute">
                      {s.code} · {s.brand} · HSN {s.hsn} · stock {stock} {s.unit}
                      {stock < l.qty && <span className="text-d-late"> · short {l.qty - stock}</span>}
                    </p>
                  </div>
                  <Pill tone={m < 12 ? "late" : m < 18 ? "warn" : "ok"} mono>
                    {m.toFixed(1)}%
                  </Pill>
                </div>
                <div className="mt-2.5 grid grid-cols-[1fr_1fr_1.2fr] items-end gap-2 pl-7">
                  <label className="text-[11px] text-d-mute">
                    Qty ({s.unit})
                    <input className={`${inputClass} mt-0.5 h-8 font-mono`} inputMode="numeric" value={l.qty} onChange={(e) => setLines((cur) => cur.map((x, j) => (j === i ? { ...x, qty: Number(e.target.value.replace(/\D/g, "")) || 0 } : x)))} />
                  </label>
                  <label className="text-[11px] text-d-mute">
                    Unit price ₹
                    <input className={`${inputClass} mt-0.5 h-8 font-mono`} inputMode="numeric" value={l.price} onChange={(e) => setLines((cur) => cur.map((x, j) => (j === i ? { ...x, price: Number(e.target.value.replace(/\D/g, "")) || 0 } : x)))} />
                  </label>
                  <div className="text-right">
                    <p className="font-mono text-[10.5px] text-d-mute">cost {inr(s.cost)} · list {inr(s.list)}</p>
                    <p className="tnum font-mono text-[14px] font-semibold">{inr(l.price * l.qty)}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rounded-[10px] border border-d-line p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[12.5px] text-d-mute">Quote margin</span>
          <span className="tnum font-mono text-[13px] font-semibold" style={{ color: margin < 12 ? "var(--d-late)" : margin < 18 ? "var(--d-warn)" : "var(--d-ok)" }}>
            {margin.toFixed(1)}% · {inr(total - cost)}
          </span>
        </div>
        <div className="relative">
          <Meter value={Math.max(0, margin)} max={35} tone={margin < 12 ? "late" : margin < 18 ? "warn" : "ok"} height={8} />
          <span className="absolute top-[-3px] h-[14px] w-[2px] bg-d-ink/70" style={{ left: `${(12 / 35) * 100}%` }} title="12% floor" />
        </div>
        <p className="mt-1.5 font-mono text-[10.5px] text-d-mute">Floor 12% · below that, Margin Guard sends it to Senthil</p>
        <div className="mt-4">
          <KV
            cols={3}
            items={[
              { k: "Taxable", v: inr(total) },
              { k: "GST 18%", v: inr(gst) },
              { k: "Grand total", v: <span className="text-d-accent">{inr(total + gst)}</span> },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Send via">
          <Segmented size="sm" options={["WhatsApp", "Email"] as const} value={via} onChange={setVia} />
        </Field>
        <Field label="Validity">
          <select className={`${inputClass} h-8`} value={validity} onChange={(e) => setValidity(e.target.value)}>
            {["3 days", "7 days", "15 days", "Till 31 Oct (price list change)"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-d-line pt-4">
        {!open && (
          <>
            <Btn size="sm" icon={CheckCheck} onClick={() => { onStatus(rfq.id, "Won"); toast.success(`${rfq.id} marked won`, { description: "Sales order drafted in Tally." }); }}>
              Mark won
            </Btn>
            <Btn size="sm" variant="ghost" onClick={() => { onStatus(rfq.id, "Lost"); toast(`${rfq.id} marked lost`); }}>
              Mark lost
            </Btn>
          </>
        )}
        <Btn
          variant="solid"
          icon={Send}
          disabled={!picked.length}
          onClick={() => {
            if (margin < 12) {
              toast.warning("Below 12% floor", { description: "Sent to Senthil's approval queue first." });
            }
            onSend(rfq.id, total, margin, via);
          }}
        >
          {open ? `Send quote on ${via}` : "Re-send revised quote"}
        </Btn>
      </div>
    </div>
  );
}

function NewRfq({ open, onOpenChange, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (r: Rfq) => void }) {
  const [customer, setCustomer] = React.useState("Padi Pumps & Motors");
  const [via, setVia] = React.useState<Rfq["via"]>("WhatsApp");
  const [sla, setSla] = React.useState("120");
  const [sku, setSku] = React.useState(skus[0].code);
  const [qty, setQty] = React.useState("50");
  const [seq, setSeq] = React.useState(4483);
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Log an RFQ" sub="For phone and walk-in enquiries. The clock starts now.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const mins = Number(sla) || 120;
          onAdd({ id: `RFQ-${seq}`, customer, plant: "—", contact: "Logged by desk", via, lines: [[sku, Number(qty) || 1]], sla: mins, left: mins, status: "New", owner: "Arun" });
          setSeq((s) => s + 1);
          onOpenChange(false);
        }}
      >
        <Field label="Customer">
          <select className={inputClass} value={customer} onChange={(e) => setCustomer(e.target.value)}>
            {accounts.map((a) => (
              <option key={a.customer}>{a.customer}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Came in via">
            <select className={inputClass} value={via} onChange={(e) => setVia(e.target.value as Rfq["via"])}>
              {["WhatsApp", "Email", "Portal", "Phone"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Promised response">
            <select className={inputClass} value={sla} onChange={(e) => setSla(e.target.value)}>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="240">4 hours</option>
              <option value="480">Same day</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-[1fr_110px] gap-3">
          <Field label="First line">
            <select className={inputClass} value={sku} onChange={(e) => setSku(e.target.value)}>
              {skus.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} · {s.desc}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Qty">
            <input className={inputClass} inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Btn onClick={() => onOpenChange(false)}>Cancel</Btn>
          <Btn variant="solid" type="submit" icon={AlarmClock}>
            Start the clock
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Rate contracts ---------------- */

const contractTone: Record<Contract["status"], Tone> = { Active: "ok", "Renewal due": "late", "Escalation due": "warn", Draft: "info" };

function ContractsTab() {
  const desk = useDesk();
  const [rows, setRows] = React.useState(contracts);
  const [open, setOpen] = React.useState<Contract | null>(null);
  const current = open ? rows.find((r) => r.id === open.id) ?? open : null;
  const annual = rows.reduce((a, c) => a + c.annual, 0);
  const used = rows.reduce((a, c) => a + c.used, 0);

  function apply(c: Contract) {
    setRows((cur) => cur.map((r) => (r.id === c.id ? { ...r, status: "Active", lastRev: "Oct 26", annual: Math.round(r.annual * (1 + r.escalation / 100)) } : r)));
    toast.success(`${c.id}: +${c.escalation}% escalation applied`, { description: `Revised price list sent to ${c.customer} for sign-off.` });
    desk.log(`Escalation ${c.escalation}% applied on ${c.id} (${c.customer})`, "ok");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Contracts live" value={rows.filter((r) => r.status !== "Draft").length} hint={`${rows.reduce((a, r) => a + r.items, 0)} SKUs locked`} icon={ScrollText} />
        <Stat label="Contracted value / yr" value={inr(annual, { compact: true })} delta="+9%" hint="vs last year" icon={IndianRupee} trend={[2.2, 2.4, 2.5, 2.7, 2.8, 2.9, annual / 1e7]} />
        <Stat label="Consumed so far" value={`${Math.round((used / annual) * 100)}%`} hint={inr(used, { compact: true })} icon={TrendingUp} tone="ok" trend={[18, 26, 34, 41, 48, 54, Math.round((used / annual) * 100)]} />
        <Stat label="Escalations unclaimed" value={rows.filter((r) => r.status === "Escalation due").length} delta="+₹4.2 L" deltaGood={false} hint="steel index moved +5.8%" icon={AlertTriangle} tone="warn" />
      </div>
      <Panel title="Rate contracts" sub="Click a contract for its price list, consumption and escalation clause">
        <DataTable
          rows={rows}
          rowKey={(r) => r.id}
          search={(r) => `${r.id} ${r.customer}`}
          searchPlaceholder="Search customer or contract"
          filter={{ get: (r) => r.status, options: ["Active", "Escalation due", "Renewal due", "Draft"] }}
          onRow={setOpen}
          bulk={[{ label: "Send renewal reminders", run: (k) => { toast.success(`Renewal note sent for ${k.length} contracts`); desk.log(`Renewal reminders sent for ${k.length} rate contracts`); } }]}
          columns={[
            { key: "id", label: "Contract", render: (r) => <span className="font-mono text-[12px]">{r.id}</span>, sort: (r) => r.id },
            { key: "c", label: "Customer", render: (r) => <span className="font-medium">{r.customer}</span>, sort: (r) => r.customer },
            { key: "items", label: "SKUs", align: "right", render: (r) => <span className="tnum font-mono">{r.items}</span>, sort: (r) => r.items },
            { key: "use", label: "Consumed", render: (r) => <div className="flex min-w-[130px] items-center gap-2"><Meter value={r.used} max={r.annual} tone={r.used / r.annual > 0.85 ? "warn" : "accent"} /><span className="font-mono text-[11px] text-d-mute">{Math.round((r.used / r.annual) * 100)}%</span></div>, sort: (r) => r.used / r.annual },
            { key: "val", label: "Annual", align: "right", render: (r) => <span className="tnum font-mono">{inr(r.annual, { compact: true })}</span>, sort: (r) => r.annual },
            { key: "clause", label: "Price clause", render: (r) => <span className="text-[12px] text-d-mute">{r.clause}</span>, wide: true },
            { key: "till", label: "Ends", render: (r) => <span className="font-mono text-[12px]" style={{ color: r.daysLeft < 45 ? "var(--d-late)" : undefined }}>{r.till} · {r.daysLeft}d</span>, sort: (r) => r.daysLeft },
            { key: "st", label: "Status", render: (r) => <Pill tone={contractTone[r.status]}>{r.status}</Pill> },
          ]}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <Panel icon={TrendingUp} title="Input price index vs contract price" sub="Bearing steel and fastener wire rod, indexed to April = 100">
          <AreaChart
            height={190}
            labels={["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"]}
            series={[
              { name: "Bearing steel", data: [100, 101.4, 102.2, 103.9, 104.6, 105.1, 105.8], tone: "late" },
              { name: "Wire rod", data: [100, 99.2, 100.8, 102.5, 103.1, 103.4, 104.2], tone: "warn" },
              { name: "Our contract price", data: [100, 100, 100, 101.6, 101.6, 101.6, 101.6], tone: "accent", dashed: true },
            ]}
            format={(v) => v.toFixed(1)}
          />
        </Panel>
        <Panel icon={AlertTriangle} title="Escalations you can claim" sub="Clause allows it; customer gets 15 days' notice">
          <ul className="space-y-2">
            {rows
              .filter((r) => r.status === "Escalation due")
              .map((r) => (
                <li key={r.id} className="flex items-center gap-3 rounded-[10px] border border-d-line p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold">{r.customer}</p>
                    <p className="font-mono text-[11px] text-d-mute">{r.id} · {r.clause}</p>
                  </div>
                  <span className="tnum font-mono text-[13px] text-d-warn">+{r.escalation}%</span>
                  <Btn size="sm" variant="solid" onClick={() => apply(r)}>
                    Apply
                  </Btn>
                </li>
              ))}
            {rows.every((r) => r.status !== "Escalation due") && <p className="py-6 text-center text-[12.5px] text-d-mute">All escalations claimed.</p>}
          </ul>
        </Panel>
      </div>
      <Sheet
        open={!!current}
        onOpenChange={(o) => !o && setOpen(null)}
        width={560}
        eyebrow={current ? `${current.id} · last revised ${current.lastRev}` : ""}
        title={current?.customer ?? ""}
        sub={current ? `${current.from} to ${current.till} · ${current.clause}` : ""}
        footer={
          <>
            {current?.status === "Escalation due" && <Btn icon={TrendingUp} onClick={() => current && apply(current)}>Apply +{current.escalation}%</Btn>}
            <Btn
              variant="solid"
              icon={Send}
              onClick={() => {
                toast.success("Price list shared", { description: `${current?.customer} gets a PDF on WhatsApp and email.` });
                desk.log(`${current?.id} price list shared with ${current?.customer}`);
              }}
            >
              Share price list
            </Btn>
          </>
        }
      >
        {current && (
          <div className="space-y-5">
            <KV
              items={[
                { k: "Annual value", v: inr(current.annual, { compact: true }) },
                { k: "Consumed", v: `${inr(current.used, { compact: true })} · ${Math.round((current.used / current.annual) * 100)}%` },
                { k: "SKUs", v: current.items },
                { k: "Status", v: <Pill tone={contractTone[current.status]}>{current.status}</Pill> },
              ]}
            />
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-d-mute">Top lines on this contract</p>
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="border-b border-d-line text-left text-[11px] text-d-mute">
                    <th className="pb-1.5 font-medium">SKU</th>
                    <th className="pb-1.5 text-right font-medium">List</th>
                    <th className="pb-1.5 text-right font-medium">Contract</th>
                    <th className="pb-1.5 text-right font-medium">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {skus.slice(0, 8).map((s, i) => {
                    const cp = Math.round(s.list * (0.9 + (i % 3) * 0.02));
                    const m = ((cp - s.cost) / cp) * 100;
                    return (
                      <tr key={s.code} className="border-b border-d-line/60">
                        <td className="py-1.5"><span className="font-mono text-[11.5px]">{s.code}</span><span className="block truncate text-[11px] text-d-mute">{s.desc}</span></td>
                        <td className="tnum py-1.5 text-right font-mono text-d-mute">{inr(s.list)}</td>
                        <td className="tnum py-1.5 text-right font-mono">{inr(cp)}</td>
                        <td className="tnum py-1.5 text-right font-mono" style={{ color: m < 15 ? "var(--d-warn)" : "var(--d-ok)" }}>{m.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-d-mute">Monthly drawdown, ₹ lakh</p>
              <Bars height={110} format={(v) => `${v}`} data={["May", "Jun", "Jul", "Aug", "Sep", "Oct"].map((m, i) => ({ label: m, value: Math.round(((current.used / 6) * (0.75 + ((i * 7) % 5) * 0.12)) / 1e4) / 10, tone: "accent" as Tone }))} />
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Stock ---------------- */

function StockTab() {
  const desk = useDesk();
  const [godown, setGodown] = React.useState<"All" | Godown>("All");
  const [open, setOpen] = React.useState<Sku | null>(null);
  const [indented, setIndented] = React.useState<Set<string>>(new Set());
  const qtyAt = (s: Sku) => (godown === "All" ? onHand(s) : s.stock[godown]);
  const value = skus.reduce((a, s) => a + qtyAt(s) * s.cost, 0);
  const below = skus.filter((s) => onHand(s) < s.reorder);
  const dead = skus.filter((s) => moveClass(s) === "Dead" || moveClass(s) === "Slow");
  const cats = ["Bearings", "Fasteners", "Power tools", "Belts", "Abrasives", "Adhesives", "Hand tools"] as const;
  const moveTone = { Fast: "ok", Normal: "info", Slow: "warn", Dead: "late" } as const;

  function indent(s: Sku) {
    setIndented((cur) => new Set(cur).add(s.code));
    const q = Math.max(s.reorder * 2 - onHand(s), s.reorder);
    toast.success(`Indent drafted: ${s.code}`, { description: `${q} ${s.unit} to ${s.brand}, ${inr(q * s.cost, { compact: true })} at cost` });
    desk.log(`Indent drafted for ${q} ${s.unit} ${s.code} to ${s.brand}`, "info");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Stock value at cost" value={inr(value, { compact: true })} delta="-3%" deltaGood={false} hint={godown === "All" ? "3 godowns" : GODOWNS.find((g) => g.id === godown)?.name} icon={Warehouse} trend={[2.9, 2.8, 3.0, 2.9, 2.8, 2.7, value / 1e6]} />
        <Stat label="Below reorder point" value={below.length} delta="+2" deltaGood={false} hint="indent before Kavach cut-off Thu" icon={AlertTriangle} tone="late" />
        <Stat label="Slow + dead stock" value={inr(dead.reduce((a, s) => a + onHand(s) * s.cost, 0), { compact: true })} hint={`${dead.length} SKUs, no sale 30d+`} icon={Hourglass} tone="warn" />
        <Stat label="Fill rate, 30d" value="93.4%" delta="+1.2%" hint="lines shipped from stock" icon={PackageCheck} tone="ok" trend={[89, 90, 91, 91.5, 92, 92.8, 93.4]} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {GODOWNS.map((g) => {
          const v = skus.reduce((a, s) => a + s.stock[g.id] * s.cost, 0);
          const zero = skus.filter((s) => s.stock[g.id] === 0).length;
          const on = godown === g.id;
          return (
            <button key={g.id} type="button" onClick={() => setGodown(on ? "All" : g.id)} className={`desk-card desk-rise overflow-hidden p-4 text-left transition-all hover:-translate-y-0.5 ${on ? "ring-2 ring-d-accent" : ""}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[10.5px] uppercase tracking-wider text-d-accent">{g.id}</p>
                  <p className="text-[15px] font-semibold">{g.name}</p>
                  <p className="text-[11.5px] text-d-mute">{g.area}</p>
                </div>
                <Warehouse className="h-5 w-5 text-d-mute" />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 font-mono">
                <div><p className="text-[10px] uppercase text-d-mute">Value</p><p className="tnum text-[15px] font-semibold">{inr(v, { compact: true })}</p></div>
                <div><p className="text-[10px] uppercase text-d-mute">Zero SKUs</p><p className="tnum text-[15px] font-semibold" style={{ color: zero > 4 ? "var(--d-late)" : undefined }}>{zero}</p></div>
                <div><p className="text-[10px] uppercase text-d-mute">Area</p><p className="tnum text-[15px] font-semibold">{(g.sqft / 1000).toFixed(1)}k ft²</p></div>
              </div>
              <Meter className="mt-3" value={v} max={skus.reduce((a, s) => a + onHand(s) * s.cost, 0)} />
            </button>
          );
        })}
      </div>
      <Panel title="SKU register" sub={`${godown === "All" ? "All godowns" : GODOWNS.find((g) => g.id === godown)?.name} · click a row for godown split and history`} action={<Segmented size="sm" options={["All", "AMB", "SPB", "HSR"] as const} value={godown} onChange={setGodown} />}>
        <DataTable
          rows={skus}
          rowKey={(s) => s.code}
          search={(s) => `${s.code} ${s.desc} ${s.brand}`}
          searchPlaceholder="Search SKU, item or brand"
          filter={{ get: moveClass, options: ["Fast", "Normal", "Slow", "Dead"] }}
          onRow={setOpen}
          pageSize={10}
          bulk={[{ label: "Draft indents", run: (k) => { k.forEach((c) => indent(skuBy(c))); } }]}
          columns={[
            { key: "code", label: "SKU", render: (s) => <span className="font-mono text-[12px]">{s.code}</span>, sort: (s) => s.code },
            { key: "desc", label: "Item", render: (s) => <span><span className="font-medium">{s.desc}</span><span className="block text-[11px] text-d-mute">{s.brand} · {s.cat}</span></span>, sort: (s) => s.desc },
            { key: "qty", label: "On hand", align: "right", render: (s) => <span className="tnum font-mono">{qtyAt(s)} <span className="text-d-mute">{s.unit}</span></span>, sort: qtyAt },
            { key: "cover", label: "Cover", render: (s) => { const days = Math.round((onHand(s) / Math.max(1, s.monthly)) * 30); return <div className="flex min-w-[110px] items-center gap-2"><Meter value={Math.min(60, days)} max={60} tone={onHand(s) < s.reorder ? "late" : days > 45 ? "info" : "ok"} /><span className="font-mono text-[11px] text-d-mute">{days}d</span></div>; }, sort: (s) => onHand(s) / Math.max(1, s.monthly) },
            { key: "mv", label: "Movement", render: (s) => <Pill tone={moveTone[moveClass(s)]}>{moveClass(s)}</Pill>, wide: true },
            { key: "act", label: "", align: "right", render: (s) => (onHand(s) >= s.reorder ? <span className="font-mono text-[11px] text-d-mute">ROP {s.reorder}</span> : indented.has(s.code) ? <Pill tone="info">Indented</Pill> : <Btn size="sm" variant="soft" onClick={(e) => { e.stopPropagation(); indent(s); }}>Indent</Btn>) },
          ]}
        />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <Panel title="Value by godown and category" sub="₹ thousand at cost. Click a cell to see the SKUs behind it.">
          <HeatGrid
            rows={GODOWNS.map((g) => g.name)}
            cols={cats.map((c) => c)}
            values={GODOWNS.map((g) => cats.map((c) => Math.round(skus.filter((s) => s.cat === c).reduce((a, s) => a + s.stock[g.id] * s.cost, 0) / 1000)))}
            format={(v) => `${v}`}
            onCell={(r, c) => toast(`${GODOWNS[r].name} · ${cats[c]}`, { description: skus.filter((s) => s.cat === cats[c] && s.stock[GODOWNS[r].id] > 0).map((s) => `${s.code} ×${s.stock[GODOWNS[r].id]}`).join(", ") || "Nothing here" })}
          />
        </Panel>
        <Panel title="Slow and dead stock" sub="No sale in 30+ days, at cost">
          <HBars format={(v) => inr(v, { compact: true })} data={dead.map((s) => ({ label: s.code, sub: `${s.lastSale}d`, value: onHand(s) * s.cost, tone: moveClass(s) === "Dead" ? "late" : "warn" }))} />
          <Btn size="sm" variant="soft" className="mt-4" icon={Send} onClick={() => { toast.success("Clearance offer sent", { description: "8% off to 14 regular buyers on WhatsApp" }); desk.log("Clearance offer for slow stock sent to 14 buyers"); }}>
            Offer to regular buyers at 8% off
          </Btn>
        </Panel>
      </div>
      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)} eyebrow={open ? `${open.brand} · ${open.cat} · HSN ${open.hsn}` : ""} title={open?.desc ?? ""} sub={open ? `${open.code} · ${moveClass(open)} mover · last sold ${open.lastSale === 0 ? "today" : `${open.lastSale} days ago`}` : ""}
        footer={
          <>
            <Btn icon={Truck} onClick={() => { toast.success("Transfer note raised", { description: `${open?.code}: 20 ${open?.unit} AMB → SPB on today's tempo` }); desk.log(`Stock transfer AMB → SPB raised for ${open?.code}`); }}>Transfer AMB → SPB</Btn>
            <Btn variant="solid" icon={Package} onClick={() => open && indent(open)}>Indent to {open?.brand}</Btn>
          </>
        }
      >
        {open && (
          <div className="space-y-5">
            <KV items={[{ k: "Cost", v: inr(open.cost) }, { k: "List", v: inr(open.list) }, { k: "Monthly offtake", v: `${open.monthly} ${open.unit}` }, { k: "Reorder point", v: `${open.reorder} ${open.unit}` }]} />
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-d-mute">By godown</p>
              <HBars data={GODOWNS.map((g) => ({ label: g.name, value: open.stock[g.id], sub: open.unit, tone: open.stock[g.id] === 0 ? "late" : "accent" }))} />
            </div>
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-d-mute">Sales, last 6 months</p>
              <Bars height={110} data={["May", "Jun", "Jul", "Aug", "Sep", "Oct"].map((m, i) => ({ label: m, value: Math.max(0, Math.round(open.monthly * (0.8 + ((i * 5) % 4) * 0.1) * (open.lastSale > 30 ? Math.max(0, 1 - i * 0.2) : 1))) }))} />
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Orders & dispatch ---------------- */

function OrdersTab({ orders, setOrders }: { orders: Order[]; setOrders: React.Dispatch<React.SetStateAction<Order[]>> }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<string | null>(null);
  const order = orders.find((o) => o.no === open) ?? null;
  const inHouse = orders.filter((o) => o.stage === "picking" || o.stage === "packed" || o.stage === "billed");
  const road = orders.filter((o) => o.stage === "dispatched");

  function move(no: string, stage: Stage) {
    const o = orders.find((x) => x.no === no);
    if (!o || o.stage === stage) return;
    const patch: Partial<Order> = { stage };
    let note = "";
    if ((stage === "billed" || stage === "dispatched") && !o.eway && o.value > 50000) {
      patch.eway = `EWB 3819 2246 ${String(1000 + (o.value % 9000)).slice(0, 4)}`;
      note = " · e-way bill generated";
    }
    if (stage === "dispatched" && !o.vehicle) {
      patch.vehicle = o.godown === "AMB" ? "TN 05 BX 4417 (own)" : "TN 21 AQ 9032 (Sri Murugan Transports)";
      note += " · vehicle shared on WhatsApp";
    }
    setOrders((cur) => cur.map((x) => (x.no === no ? { ...x, ...patch } : x)));
    const label = STAGE_COLS.find((c) => c.id === stage)?.label;
    toast.success(`${no} → ${label}`, { description: `${o.customer}${note}` });
    desk.log(`${no} moved to ${label}${note}`, stage === "delivered" ? "ok" : "info");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="In the godowns" value={inHouse.length} hint={inr(inHouse.reduce((a, o) => a + o.value, 0), { compact: true })} icon={Package} tone="warn" trend={[5, 7, 6, 8, 7, 6, inHouse.length]} />
        <Stat label="On the road" value={road.length} hint="2 own vehicles, 1 transporter, 1 Porter" icon={Truck} tone="info" />
        <Stat label="Same-day dispatch, 30d" value="82%" delta="+6%" hint="orders before 1 PM" icon={AlarmClock} tone="ok" trend={[71, 73, 74, 77, 79, 80, 82]} />
        <Stat label="E-way bills today" value={orders.filter((o) => o.eway).length} hint="auto from Tally invoices" icon={FileText} />
      </div>
      <Panel title="Dispatch board" sub="Drag a card to the next column. Moving to Invoiced or On the road raises the e-way bill if it's over ₹50,000." action={<Pill tone="warn" mono>Picking limit 4</Pill>}>
        <Board
          columns={STAGE_COLS}
          items={orders}
          itemKey={(o) => o.no}
          getColumn={(o) => o.stage}
          onMove={(k, c) => move(k, c as Stage)}
          minColumnWidth={220}
          renderCard={(o) => (
            <button type="button" onClick={() => setOpen(o.no)} className="block w-full text-left">
              <p className="flex items-center gap-1.5 font-mono text-[10.5px] text-d-mute">
                {o.no} · {o.godown}
                {o.rush && <Pill tone="late">rush</Pill>}
              </p>
              <p className="mt-1 text-[13px] font-semibold leading-tight">{o.customer}</p>
              <p className="mt-1 flex items-center justify-between font-mono text-[11.5px]">
                <span className="text-d-mute">{o.lines} lines</span>
                <span className="tnum font-semibold">{inr(o.value, { compact: true })}</span>
              </p>
              <p className="mt-1.5 truncate text-[11px] text-d-mute">{o.vehicle ?? o.promised}</p>
              {o.eway && <p className="mt-1 truncate font-mono text-[10px] text-d-accent">{o.eway}</p>}
            </button>
          )}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <Panel icon={Truck} title="Vehicles today" sub="Own tempo, transporter and Porter">
          <ul className="divide-y divide-d-line">
            {[
              { v: "TN 05 BX 4417", who: "Own Tata Ace · Prakash", route: "Ambattur → Padi → Ambattur OT → Mogappair", drops: "3 of 4", t: "ok" as Tone },
              { v: "TN 21 AQ 9032", who: "Sri Murugan Transports", route: "Sriperumbudur → Irungattukottai → Oragadam", drops: "1 of 3", t: "info" as Tone },
              { v: "TN 70 C 2281", who: "Hosur local carrier", route: "Hosur SIPCOT II, 2 drops", drops: "loading", t: "warn" as Tone },
              { v: "Porter", who: "Booked 10:40", route: "Ambattur → Thirumazhisai", drops: "en route", t: "info" as Tone },
            ].map((x) => (
              <li key={x.v} className="flex items-center gap-3 py-2.5">
                <span className="rounded-[4px] border border-d-line bg-d-sunk px-1.5 py-0.5 font-mono text-[11px] font-semibold">{x.v}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-medium">{x.who}</p>
                  <p className="truncate text-[11.5px] text-d-mute">{x.route}</p>
                </div>
                <Pill tone={x.t}>{x.drops}</Pill>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel icon={TrendingUp} title="Orders by hour booked" sub="Today vs last Tuesday · most land before lunch">
          <AreaChart
            height={170}
            labels={["9", "10", "11", "12", "1", "2", "3", "4", "5", "6"]}
            series={[
              { name: "Today", data: [4, 9, 12, 8, 5, 6, 7, 4, 2, 1], tone: "accent" },
              { name: "Last Tuesday", data: [3, 7, 10, 9, 6, 5, 6, 5, 3, 1], tone: "info", dashed: true },
            ]}
          />
        </Panel>
      </div>
      <Sheet
        open={!!order}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={order ? `${order.no} · customer PO ${order.po}` : ""}
        title={order?.customer ?? ""}
        sub={order ? `${order.lines} lines · ${inr(order.value)} + GST · from ${GODOWNS.find((g) => g.id === order.godown)?.name}` : ""}
        footer={
          order && order.stage !== "delivered" ? (
            <Btn variant="solid" icon={ArrowRight} onClick={() => { const i = STAGE_COLS.findIndex((c) => c.id === order.stage); move(order.no, STAGE_COLS[i + 1].id); }}>
              Move to {STAGE_COLS[STAGE_COLS.findIndex((c) => c.id === order.stage) + 1]?.label}
            </Btn>
          ) : (
            <Btn variant="solid" onClick={() => setOpen(null)}>Done</Btn>
          )
        }
      >
        {order && (
          <div className="space-y-5">
            <KV items={[{ k: "Stage", v: <Pill tone={STAGE_COLS.find((c) => c.id === order.stage)?.tone}>{STAGE_COLS.find((c) => c.id === order.stage)?.label}</Pill> }, { k: "Promised", v: order.promised }, { k: "Vehicle", v: order.vehicle ?? "Not assigned" }, { k: "E-way bill", v: order.eway ?? (order.value > 50000 ? "Due on invoice" : "Not needed") }]} />
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-d-mute">Progress</p>
              <ol className="space-y-1.5">
                {STAGE_COLS.map((c, i) => {
                  const at = STAGE_COLS.findIndex((x) => x.id === order.stage);
                  const done = i <= at;
                  return (
                    <li key={c.id} className="flex items-center gap-3 rounded-[8px] border border-d-line px-3 py-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${done ? "bg-d-accent" : "bg-d-sunk ring-1 ring-d-line"}`} />
                      <span className={`flex-1 text-[13px] ${done ? "font-medium" : "text-d-mute"}`}>{c.label}</span>
                      <span className="text-[11px] text-d-mute">{c.hint}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Credit control ---------------- */

function CreditTab() {
  const desk = useDesk();
  const [rows, setRows] = React.useState(accounts);
  const [open, setOpen] = React.useState<string | null>(null);
  const acct = rows.find((r) => r.customer === open) ?? null;
  const outstanding = rows.reduce((a, r) => a + r.used, 0);
  const overdue = rows.reduce((a, r) => a + r.overdue, 0);
  const sum = (i: number) => rows.reduce((a, r) => a + r.buckets[i], 0);
  const statusTone = { Hold: "late", Watch: "warn", Clear: "ok" } as const;

  function setStatus(customer: string, status: Account["status"], limitBump = 0) {
    setRows((cur) => cur.map((r) => (r.customer === customer ? { ...r, status, limit: r.limit + limitBump } : r)));
    toast.success(`${customer}: ${status === "Clear" ? "hold released" : status === "Hold" ? "put on hold" : "on watch"}`, { description: limitBump ? `Temporary limit +${inr(limitBump, { compact: true })} for 7 days` : "Tally credit flag updated" });
    desk.log(`Credit ${status} for ${customer}${limitBump ? `, +${inr(limitBump, { compact: true })} temp limit` : ""}`, status === "Hold" ? "late" : "ok");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Receivables" value={inr(outstanding, { compact: true })} delta="+4%" deltaGood={false} hint="342 customers, top 12 shown" icon={IndianRupee} trend={[78, 80, 79, 83, 85, 86, outstanding / 1e5]} />
        <Stat label="Overdue" value={inr(overdue, { compact: true })} delta="+11%" deltaGood={false} hint="past agreed terms" icon={AlertTriangle} tone="late" trend={[6.1, 6.4, 6.9, 7.2, 7.5, 7.9, overdue / 1e5]} />
        <Stat label="On credit hold" value={rows.filter((r) => r.status === "Hold").length} hint={`${rows.filter((r) => r.status === "Watch").length} on watch`} icon={ShieldAlert} tone="warn" />
        <Stat label="DSO" value="47 days" delta="+3" deltaGood={false} hint="target 42" icon={Hourglass} />
      </div>
      <Panel title="Ageing" sub="All customers, from Tally. Overdue reminders go out at 4 PM.">
        <AgingBar buckets={[{ label: "Not due", value: sum(0), tone: "ok" }, { label: "1–30 over", value: sum(1), tone: "info" }, { label: "31–60 over", value: sum(2), tone: "warn" }, { label: "60+ over", value: sum(3), tone: "late" }]} format={(v) => inr(v, { compact: true })} />
      </Panel>
      <div className="grid gap-5 2xl:grid-cols-[1fr_520px]">
        <Panel title="Customer limits" sub="Click a customer to release, hold or extend">
          <DataTable
            rows={rows}
            rowKey={(r) => r.customer}
            search={(r) => r.customer}
            searchPlaceholder="Search customer"
            filter={{ get: (r) => r.status, options: ["Hold", "Watch", "Clear"] }}
            onRow={(r) => setOpen(r.customer)}
            bulk={[{ label: "Send statement", run: (k) => { toast.success(`Statements sent to ${k.length} customers`); desk.log(`Ledger statements sent to ${k.length} customers`); } }]}
            columns={[
              { key: "c", label: "Customer", render: (r) => <span className="font-medium">{r.customer}</span>, sort: (r) => r.customer },
              { key: "lim", label: "Limit used", render: (r) => <div className="flex min-w-[150px] items-center gap-2"><Meter value={r.used} max={r.limit} tone={r.used > r.limit ? "late" : r.used / r.limit > 0.85 ? "warn" : "ok"} /><span className="font-mono text-[11px] text-d-mute">{Math.round((r.used / r.limit) * 100)}%</span></div>, sort: (r) => r.used / r.limit },
              { key: "lv", label: "Limit", align: "right", render: (r) => <span className="tnum font-mono">{inr(r.limit, { compact: true })}</span>, sort: (r) => r.limit, wide: true },
              { key: "od", label: "Overdue", align: "right", render: (r) => <span className="tnum font-mono" style={{ color: r.overdue ? "var(--d-late)" : "var(--d-mute)" }}>{r.overdue ? inr(r.overdue, { compact: true }) : "—"}</span>, sort: (r) => r.overdue },
              { key: "d", label: "Days", align: "right", render: (r) => <span className="tnum font-mono">{r.days}<span className="text-d-mute">/{r.terms}</span></span>, sort: (r) => r.days },
              { key: "st", label: "Status", render: (r) => <Pill tone={statusTone[r.status]}>{r.status}</Pill> },
            ]}
          />
        </Panel>
        <Panel icon={ShieldAlert} title="Orders waiting on credit" sub="Credit Sentinel stopped these before invoicing" action={<Pill tone="late" mono>3</Pill>}>
          <ApprovalQueue
            approveLabel="Release"
            items={[
              { id: "ch1", title: "Thirumazhisai Steel Fab · chop-saw wheels", sub: "96 days, cheque bounced 14 Oct · promise ₹1 L Friday", amount: inr(38600), meta: "Hold", tone: "late" },
              { id: "ch2", title: "Vellore Agro Implements · bolts + belts", sub: "74 days, ₹1.28 L over 60 · no promise", amount: inr(29400), meta: "Hold", tone: "late" },
              { id: "ch3", title: "Ranipet Tannery Machines · bearings", sub: "2 bounces this year · 99% of limit", amount: inr(21800), meta: "Watch" },
            ]}
            onDecide={(id, d) => d && desk.log(`Credit decision ${id}: ${d}`, d === "approved" ? "ok" : "warn")}
          />
        </Panel>
      </div>
      <Sheet
        open={!!acct}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={acct ? `Terms ${acct.terms} days · ${acct.bounces} bounces this year` : ""}
        title={acct?.customer ?? ""}
        sub={acct ? `${inr(acct.used)} used of ${inr(acct.limit)} · ${acct.days} days average` : ""}
        footer={
          acct && (
            <>
              {acct.status !== "Hold" && <Btn variant="danger" onClick={() => setStatus(acct.customer, "Hold")}>Put on hold</Btn>}
              <Btn onClick={() => setStatus(acct.customer, "Clear", Math.round(acct.limit * 0.1))}>+10% for 7 days</Btn>
              {acct.status !== "Clear" && <Btn variant="solid" onClick={() => setStatus(acct.customer, "Clear")}>Release</Btn>}
            </>
          )
        }
      >
        {acct && (
          <div className="space-y-5">
            <KV items={[{ k: "Status", v: <Pill tone={statusTone[acct.status]}>{acct.status}</Pill> }, { k: "Overdue", v: inr(acct.overdue) }, { k: "Last promise", v: acct.promise ?? "None" }, { k: "Cheque bounces", v: acct.bounces }]} />
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-d-mute">Ageing</p>
              <AgingBar buckets={[{ label: "Not due", value: acct.buckets[0], tone: "ok" }, { label: "1–30", value: acct.buckets[1], tone: "info" }, { label: "31–60", value: acct.buckets[2], tone: "warn" }, { label: "60+", value: acct.buckets[3], tone: "late" }]} format={(v) => inr(v, { compact: true })} />
            </div>
            <div className="rounded-[10px] border border-d-line bg-d-sunk/60 p-4 text-[13px] leading-relaxed">
              <p className="mb-1 font-mono text-[10.5px] uppercase tracking-wider text-d-accent">WhatsApp draft · Divya</p>
              Vanakkam, a reminder from Coromandel Industrial Supply. {inr(acct.overdue || acct.buckets[1])} is past our {acct.terms}-day terms on your account. Kindly arrange NEFT to ICICI A/c ending 4471 so we can keep your orders moving. Statement attached.
            </div>
            <Btn
              icon={MessageCircle}
              onClick={() => {
                toast.success("Reminder sent on WhatsApp", { description: acct.customer });
                desk.log(`Dues reminder sent to ${acct.customer}`);
              }}
            >
              Send reminder
            </Btn>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Principals ---------------- */

function PrincipalsTab() {
  const desk = useDesk();
  const [rows, setRows] = React.useState(claims);
  const [open, setOpen] = React.useState<Claim | null>(null);
  const target = principals.reduce((a, p) => a + p.target, 0);
  const achieved = principals.reduce((a, p) => a + p.achieved, 0);
  const pending = rows.filter((c) => c.status !== "Credited").reduce((a, c) => a + c.amount, 0);
  const claimTone = { Filed: "info", Query: "warn", Approved: "accent", Credited: "ok" } as const;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Q3 achieved" value={`${Math.round((achieved / target) * 100)}%`} hint={`${inr(achieved, { compact: true })} of ${inr(target, { compact: true })}`} icon={Target} trend={[22, 34, 46, 55, 63, 71, Math.round((achieved / target) * 100)]} />
        <Stat label="Quarter closes in" value={<span className="text-[22px]"><Countdown compact inHours={72 * 24 - 11} /></span>} hint="31 Dec · Q3 FY26-27" icon={AlarmClock} tone="warn" />
        <Stat label="Rebates in reach" value={inr(principals.reduce((a, p) => a + p.rebate, 0), { compact: true })} delta="+₹1.0 L" hint="if all slabs are hit" icon={TrendingUp} tone="ok" />
        <Stat label="Claims pending" value={inr(pending, { compact: true })} delta="+₹96k" deltaGood={false} hint={`${rows.filter((c) => c.status !== "Credited").length} claims, oldest 60 days`} icon={ScrollText} tone="late" />
      </div>
      <Panel title="Brand scorecard" sub="Quarter-to-date sales against each principal's target, with what's needed per month to close">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {principals.map((p) => {
            const pct = (p.achieved / p.target) * 100;
            const gap = Math.max(0, p.target - p.achieved);
            return (
              <div key={p.brand} className="rounded-[10px] border border-d-line bg-d-sunk/50 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold">{p.brand}</p>
                    <p className="text-[11.5px] text-d-mute">{p.cat}</p>
                  </div>
                  <span className="tnum font-mono text-[20px] font-semibold" style={{ color: pct >= 100 ? "var(--d-ok)" : pct >= 85 ? "var(--d-accent)" : pct >= 65 ? "var(--d-warn)" : "var(--d-late)" }}>
                    {Math.round(pct)}%
                  </span>
                </div>
                <div className="relative mt-3">
                  <Meter value={Math.min(pct, 100)} tone={pct >= 100 ? "ok" : pct >= 85 ? "accent" : pct >= 65 ? "warn" : "late"} height={8} />
                  <span className="absolute top-[-3px] h-[14px] w-[2px] bg-d-ink/60" style={{ left: "79%" }} title="Where you should be today" />
                </div>
                <p className="mt-2 flex justify-between font-mono text-[11px] text-d-mute">
                  <span>{inr(p.achieved, { compact: true })} / {inr(p.target, { compact: true })}</span>
                  <span>{gap ? `need ${inr(gap / 2.4, { compact: true })}/mo` : "target hit"}</span>
                </p>
                <p className="mt-2 border-t border-d-line pt-2 text-[12px]">{p.scheme}</p>
              </div>
            );
          })}
        </div>
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
        <Panel icon={TrendingUp} title="Monthly sales by principal" sub="₹ lakh, July to September">
          <Bars
            height={300}
            format={(v) => `${v.toFixed(1)}`}
            data={["Jul", "Aug", "Sep"].map((m, i) => ({
              label: m,
              value: principals.reduce((a, p) => a + p.monthly[i] * 10, 0),
              stack: principals.map((p) => ({ name: p.brand, value: p.monthly[i] * 10, tone: p.color })),
            }))}
          />
        </Panel>
        <Panel title="Claims with principals" sub="Rate difference, scheme, damage and price protection">
          <DataTable
            rows={rows}
            rowKey={(c) => c.id}
            dense
            pageSize={6}
            filter={{ get: (c) => c.status, options: ["Filed", "Query", "Approved", "Credited"] }}
            onRow={setOpen}
            columns={[
              { key: "id", label: "Claim", render: (c) => <span className="font-mono text-[12px]">{c.id}</span> },
              { key: "b", label: "Principal", render: (c) => <span><span className="font-medium">{c.brand}</span><span className="block text-[11px] text-d-mute">{c.kind}</span></span>, sort: (c) => c.brand },
              { key: "a", label: "Amount", align: "right", render: (c) => <span className="tnum font-mono">{inr(c.amount)}</span>, sort: (c) => c.amount },
              { key: "age", label: "Age", align: "right", render: (c) => <span className="tnum font-mono" style={{ color: c.age > 45 && c.status !== "Credited" ? "var(--d-late)" : undefined }}>{c.age}d</span>, sort: (c) => c.age },
              { key: "s", label: "Status", render: (c) => <Pill tone={claimTone[c.status]}>{c.status}</Pill> },
            ]}
          />
        </Panel>
      </div>
      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={open ? `${open.id} · filed ${open.filed}` : ""}
        title={open?.brand ?? ""}
        sub={open ? `${open.kind} claim · ${inr(open.amount)} · ${open.age} days old` : ""}
        footer={
          open && open.status !== "Credited" ? (
            <>
              <Btn icon={Mail} onClick={() => { toast.success("Chaser sent to principal", { description: `${open.brand} regional office, cc ASM` }); desk.log(`Claim ${open.id} chased with ${open.brand}`); }}>Chase</Btn>
              <Btn variant="solid" icon={CheckCheck} onClick={() => { setRows((cur) => cur.map((c) => (c.id === open.id ? { ...c, status: "Credited" } : c))); toast.success(`${open.id} credited`, { description: `${inr(open.amount)} credit note booked in Tally` }); desk.log(`Claim ${open.id} credited ${inr(open.amount)}`, "ok"); setOpen(null); }}>Mark credited</Btn>
            </>
          ) : (
            <Btn variant="solid" onClick={() => setOpen(null)}>Done</Btn>
          )
        }
      >
        {open && (
          <div className="space-y-4">
            <KV items={[{ k: "Status", v: <Pill tone={claimTone[open.status]}>{open.status}</Pill> }, { k: "Amount", v: inr(open.amount) }, { k: "Filed", v: open.filed }, { k: "Age", v: `${open.age} days` }]} />
            <div className="rounded-[10px] border border-d-line bg-d-sunk/60 p-4 text-[13px] leading-relaxed">
              {open.kind === "Rate difference" && "Supplied to Oragadam Auto Stampings at the principal's special project price; difference between dealer price and project price is claimable against the approval mail."}
              {open.kind === "Scheme" && "Slab scheme earned on the monthly purchase statement. Principal statement and our Tally purchase register are attached."}
              {open.kind === "Damage" && "Cartons received crushed at Ambattur; GRN photo and transporter remark attached."}
              {open.kind === "Price protection" && "Price list dropped on stock already in our godowns; protection claimed on closing stock as on the effective date."}
            </div>
            <ul className="space-y-1.5 text-[12.5px]">
              {["Debit note PDF", "Supporting invoices", "Principal approval mail", "Stock statement"].map((d) => (
                <li key={d} className="flex items-center justify-between rounded-[8px] border border-d-line px-3 py-2">
                  {d}
                  <span className="font-mono text-[10.5px] text-d-mute">attached</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Sheet>
    </div>
  );
}
