"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  BadgePercent,
  Boxes,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileCheck2,
  FileText,
  Gauge as GaugeIcon,
  HandCoins,
  IndianRupee,
  Lock,
  MessageCircle,
  Package,
  PackageCheck,
  Phone,
  Plus,
  Radar,
  Receipt,
  RotateCcw,
  Send,
  ShieldCheck,
  ShoppingCart,
  Snowflake,
  Thermometer,
  Timer,
  Truck,
  Unlock,
  Users,
  Wallet,
} from "lucide-react";
import { DeskShell, useDesk } from "../shell";
import { AreaChart, Bars, Donut, HBars } from "../charts";
import { AgingBar, Board, Checklist, Countdown, DataTable } from "../data";
import { AgentsModule, ConnectionsModule, IndependenceModule, PeopleModule } from "../common";
import { useDrift } from "../hooks";
import { Btn, Dot, Feed, Field, inputClass, inr, KV, Meter, Modal, Panel, Pill, Segmented, Sheet, Stat } from "../ui";
import type { DeskConfig, DeskModule, IndependenceData, Integration, TeamMember, Tone, WorkforceAgent } from "../types";

/* ============================================================
   Data: Sahyog Pharma Distributors, Indore. Fictional stockist
   for 14 companies, ~900 chemists, nursing homes and hospitals
   across Malwa. Today is Tue 20 Oct 2026.
   ============================================================ */

const round2 = (v: number) => Math.round(v * 100) / 100;
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** Pharma expiry is printed as a month; base is Oct 2026. */
function expLabel(m: number) {
  const idx = 2026 * 12 + 9 + Math.round(m);
  return `${MON[idx % 12]} ${Math.floor(idx / 12)}`;
}

type Company = { id: string; name: string; short: string; window: number; post: number; pct: number; cnf: string };
const COS: Company[] = [
  { id: "CIP", name: "Cipla", short: "Cipla", window: 3, post: 6, pct: 100, cnf: "Cipla C&F, Sanwer Road" },
  { id: "SUN", name: "Sun Pharma", short: "Sun", window: 3, post: 6, pct: 100, cnf: "Sun C&F, Pithampur" },
  { id: "LUP", name: "Lupin", short: "Lupin", window: 3, post: 6, pct: 90, cnf: "Lupin C&F, Dewas Naka" },
  { id: "ALK", name: "Alkem", short: "Alkem", window: 3, post: 6, pct: 100, cnf: "Alkem C&F, Palda" },
  { id: "MAN", name: "Mankind", short: "Mankind", window: 6, post: 3, pct: 80, cnf: "Mankind depot, Lasudia" },
  { id: "TOR", name: "Torrent", short: "Torrent", window: 3, post: 6, pct: 100, cnf: "Torrent C&F, Pithampur" },
  { id: "ZYD", name: "Zydus Lifesciences", short: "Zydus", window: 3, post: 6, pct: 90, cnf: "Zydus C&F, Sanwer Road" },
  { id: "GLN", name: "Glenmark", short: "Glenmark", window: 2, post: 6, pct: 100, cnf: "Glenmark C&F, Palda" },
  { id: "INT", name: "Intas", short: "Intas", window: 3, post: 6, pct: 100, cnf: "Intas C&F, Rau" },
  { id: "ABT", name: "Abbott India", short: "Abbott", window: 1, post: 3, pct: 100, cnf: "Abbott C&F, Pithampur" },
  { id: "DRL", name: "Dr. Reddy's", short: "DRL", window: 3, post: 6, pct: 85, cnf: "DRL C&F, Sanwer Road" },
  { id: "MAC", name: "Macleods", short: "Macleods", window: 4, post: 3, pct: 75, cnf: "Macleods depot, Palda" },
  { id: "NOV", name: "Novo Nordisk", short: "Novo", window: 1, post: 0, pct: 100, cnf: "Novo cold depot, Bhopal" },
  { id: "SAN", name: "Sanofi", short: "Sanofi", window: 2, post: 3, pct: 100, cnf: "Sanofi C&F, Pithampur" },
];
const coById = (id: string) => COS.find((c) => c.id === id)!;

type Division = "Chronic" | "Acute" | "Cold chain" | "OTC";
type BatchStatus = "In stock" | "Scheme push" | "Return raised" | "Quarantined";
type Batch = { id: string; co: string; div: Division; product: string; pack: string; batch: string; m: number; mrp: number; ptr: number; qty: number; rack: string; status: BatchStatus; scheme?: string };

function B(id: string, co: string, div: Division, product: string, pack: string, batch: string, m: number, mrp: number, qty: number, rack: string, status: BatchStatus = "In stock"): Batch {
  return { id, co, div, product, pack, batch, m, mrp, ptr: round2(mrp * 0.78), qty, rack, status };
}

const BATCH_SEED: Batch[] = [
  B("b01", "CIP", "Acute", "Azee 500", "3 tab strip", "AZ4K217", 2.4, 119.5, 1400, "A-03"),
  B("b02", "CIP", "Chronic", "Budecort 0.5 Respules", "5 respules", "BR2309C", 7.5, 132, 900, "C-11"),
  B("b03", "CIP", "Chronic", "Seroflo 250 Rotacaps", "30 caps", "SF6611", 14, 389, 320, "C-12"),
  B("b04", "CIP", "Chronic", "Foracort 200 Inhaler", "120 MD", "FC0942", -1.2, 476, 180, "X-01"),
  B("b05", "SUN", "Chronic", "Rosuvas 10", "15 tab strip", "RSV2281", 9, 236, 820, "B-07"),
  B("b06", "SUN", "Acute", "Pantocid 40", "15 tab strip", "PTC8840", 1.6, 179, 1600, "A-14"),
  B("b07", "SUN", "OTC", "Volini Gel 30 g", "tube", "VG3315", 4.4, 160, 600, "D-02"),
  B("b08", "LUP", "Chronic", "Gluconorm-G2", "15 tab strip", "GLG2-4471", 2.1, 152, 1100, "B-02"),
  B("b09", "LUP", "Chronic", "Tonact 10", "15 tab strip", "TN1027", 16, 98, 700, "B-03"),
  B("b10", "ALK", "Acute", "Taxim-O 200", "10 tab strip", "TXO-3392", 4.1, 112, 1500, "A-08"),
  B("b11", "ALK", "Acute", "Clavam 625", "10 tab strip", "CLV5520", 0.8, 223, 650, "A-09"),
  B("b12", "ALK", "Acute", "Pan 40", "15 tab strip", "PAN7713", 11, 155, 2200, "A-10"),
  B("b13", "MAN", "OTC", "Manforce 50", "4 tab strip", "MF9038", 5.2, 64, 1800, "D-07"),
  B("b14", "MAN", "OTC", "Prega News", "1 kit", "PN2214", -0.4, 55, 1200, "X-02"),
  B("b15", "MAN", "OTC", "Unwanted-72", "1 tab", "UW4407", 18, 110, 400, "D-08"),
  B("b16", "TOR", "OTC", "Shelcal 500", "15 tab strip", "SH6632", 3.6, 131, 900, "D-04"),
  B("b17", "TOR", "Chronic", "Nikoran 5", "15 tab strip", "NK1182", 13, 298, 220, "B-11"),
  B("b18", "ZYD", "Chronic", "Deriphyllin Retard 150", "30 tab strip", "DR5530", 6.8, 34, 2400, "C-04"),
  B("b19", "ZYD", "Cold chain", "VaxiFlu-4 vaccine", "0.5 ml PFS", "VF4-2610", 1.1, 1290, 85, "F1-2"),
  B("b20", "ZYD", "OTC", "Sporlac Plus", "10 sachets", "SPL7719", 2.7, 120, 500, "D-05"),
  B("b21", "GLN", "Chronic", "Telma 40", "15 tab strip", "TL4021", 8.2, 256, 950, "B-05"),
  B("b22", "GLN", "OTC", "Candid-B Cream 15 g", "tube", "CB8804", -2.5, 140, 300, "X-03"),
  B("b23", "INT", "Chronic", "Glimisave M2", "15 tab strip", "GSM2-118", 1.2, 145, 760, "B-09"),
  B("b24", "INT", "Acute", "Neksium 40", "15 tab strip", "NKS6650", 22, 210, 520, "A-12"),
  B("b25", "ABT", "Chronic", "Thyronorm 50", "120 tab bottle", "TH50-771", 10.5, 205, 600, "B-14"),
  B("b26", "ABT", "OTC", "Digene Gel 200 ml", "bottle", "DGL3398", 0.3, 165, 480, "D-10"),
  B("b27", "ABT", "Chronic", "Duphaston 10", "10 tab strip", "DP1044", 5.6, 1061, 90, "B-15"),
  B("b28", "DRL", "Acute", "Omez 20", "15 cap strip", "OMZ2207", 3.2, 69, 1300, "A-05"),
  B("b29", "DRL", "Acute", "Razo-D", "10 cap strip", "RZD9921", 15, 172, 520, "A-06"),
  B("b30", "MAC", "Acute", "Macpod 200", "10 tab strip", "MCP4418", 2.9, 138, 840, "A-16"),
  B("b31", "MAC", "Chronic", "Akurit-4", "10 tab strip", "AK4-0623", 6.4, 410, 140, "H1-02"),
  B("b32", "NOV", "Cold chain", "Human Mixtard 30 Penfill", "3 ml cartridge", "MX30-PB771", 4.9, 181, 960, "F3-1"),
  B("b33", "NOV", "Cold chain", "Ryzodeg FlexTouch", "3 ml pen", "RZ-FT2290", 9.5, 1950, 110, "F2-3"),
  B("b34", "SAN", "Cold chain", "Lantus SoloStar", "3 ml pen", "LS-6K118", 2.6, 789, 240, "F3-2"),
  B("b35", "SAN", "Acute", "Allegra 120", "10 tab strip", "AL1203", 7, 241, 600, "A-18"),
  B("b36", "TOR", "Chronic", "Deplatt-A 75", "15 cap strip", "DPA5512", 0.6, 112, 980, "B-12"),
];
const bValue = (b: Batch) => Math.round(b.ptr * b.qty);
/** Strips sold a month from this batch, deterministic per batch. */
const velocityOf = (b: Batch) => Math.max(20, Math.round(b.qty / (2.5 + (b.batch.charCodeAt(1) % 5))));
const unsoldOf = (b: Batch) => Math.max(0, b.qty - velocityOf(b) * Math.max(0, b.m));

type Elig = { label: string; tone: Tone; eligible: boolean; short: string };
function eligibility(b: Batch): Elig {
  const c = coById(b.co);
  if (b.m < 0) {
    if (-b.m <= c.post) return { label: `Expired · expiry claim at ${c.pct - 10}% of PTR`, short: `Expiry claim ${c.pct - 10}%`, tone: "warn", eligible: true };
    return { label: "Past claim window · send for destruction", short: "Destroy", tone: "late", eligible: false };
  }
  if (b.m <= c.window) return { label: `Return now · ${c.pct}% PTR credit note`, short: `CN ${c.pct}%`, tone: "ok", eligible: true };
  if (b.m <= 6) return { label: `Return window opens in ${Math.ceil(b.m - c.window)} mo · push to retailers`, short: `Opens in ${Math.ceil(b.m - c.window)} mo`, tone: "info", eligible: false };
  return { label: "Saleable · pick by FEFO", short: "Saleable", tone: "neutral", eligible: false };
}
const statusTone: Record<BatchStatus, Tone> = { "In stock": "neutral", "Scheme push": "accent", "Return raised": "ok", Quarantined: "late" };

/* ---------------- Shared state ---------------- */

type PharmaState = { batches: Batch[]; update: (id: string, patch: Partial<Batch>) => void; holds: Set<string>; toggleHold: (id: string, on: boolean) => void };
const PharmaCtx = React.createContext<PharmaState | null>(null);
function usePharma() {
  return React.useContext(PharmaCtx)!;
}

/* ---------------- Radar geometry ---------------- */

const C = 280;
const RINGS = [
  { label: "Expired", from: 0, to: 48, color: "#b83250", band: "rgba(217,79,107,0.16)" },
  { label: "Under 3 mo", from: 48, to: 104, color: "#d94f6b", band: "rgba(217,79,107,0.08)" },
  { label: "3–6 mo", from: 104, to: 158, color: "#d98a1f", band: "rgba(217,138,31,0.07)" },
  { label: "6–12 mo", from: 158, to: 208, color: "#1f6fb2", band: "rgba(31,111,178,0.05)" },
  { label: "Over 12 mo", from: 208, to: 250, color: "#6d8fb3", band: "rgba(31,111,178,0.025)" },
];
function ringOf(m: number) {
  if (m < 0) return 0;
  if (m < 3) return 1;
  if (m < 6) return 2;
  if (m < 12) return 3;
  return 4;
}
function radiusOf(m: number) {
  if (m < 0) return 16 + (Math.min(-m, 6) / 6) * 26;
  if (m < 3) return 54 + (m / 3) * 46;
  if (m < 6) return 108 + ((m - 3) / 3) * 46;
  if (m < 12) return 162 + ((m - 6) / 6) * 42;
  return 214 + (Math.min(m - 12, 12) / 12) * 30;
}
function polar(r: number, deg: number) {
  const a = (deg * Math.PI) / 180;
  return { x: round2(C + r * Math.sin(a)), y: round2(C - r * Math.cos(a)) };
}
const SECTOR = 360 / COS.length;
const MAXV = Math.max(...BATCH_SEED.map(bValue));
const BLIP: Record<string, { deg: number }> = Object.fromEntries(
  COS.flatMap((c, ci) => {
    const list = BATCH_SEED.filter((b) => b.co === c.id);
    return list.map((b, k) => [b.id, { deg: round2(ci * SECTOR + (SECTOR * (k + 1)) / (list.length + 1)) }]);
  }),
);

/* ---------------- Orders ---------------- */

type Source = "Salesman app" | "WhatsApp" | "PharmaRack" | "Phone";
type OrderCol = "received" | "picking" | "packed" | "dispatched" | "delivered";
type Order = { id: string; retailer: string; town: string; kind: "Chemist" | "Nursing home" | "Hospital"; source: Source; salesman: string; lines: number; value: number; col: OrderCol; route: string; at: string; cold?: boolean; h1?: boolean };

const ROUTES = [
  { id: "CA", name: "Indore City A", span: "Rajwada · Siyaganj · MG Road", van: "MP09 GH 4412", departs: "11:30 AM", inH: 1.5, base: 38, cap: 60 },
  { id: "CB", name: "Indore City B", span: "Vijay Nagar · AB Road · Bhanwarkuan", van: "MP09 GH 4413", departs: "12:00 PM", inH: 2, base: 41, cap: 60 },
  { id: "DW", name: "Dewas", span: "Dewas · Sonkatch · Bagli", van: "MP09 LK 2291", departs: "1:30 PM", inH: 3.5, base: 27, cap: 45 },
  { id: "UJ", name: "Ujjain", span: "Ujjain · Nagda · Tarana", van: "MP13 ZB 7720", departs: "2:00 PM", inH: 4, base: 31, cap: 50 },
  { id: "DH", name: "Dhar–Pithampur", span: "Pithampur · Dhar · Badnawar", van: "MP09 LK 2295", departs: "3:00 PM", inH: 5, base: 22, cap: 40 },
  { id: "KB", name: "Khargone–Barwani", span: "Khargone · Sanawad · Barwani", van: "Hans Travels bus parcel", departs: "4:30 PM", inH: 6.5, base: 18, cap: 35 },
  { id: "MW", name: "Mhow–Mandleshwar", span: "Mhow · Manpur · Mandleshwar", van: "MP09 GH 4419", departs: "5:00 PM", inH: 7, base: 14, cap: 30 },
];
const routeName = (id: string) => ROUTES.find((r) => r.id === id)?.name ?? id;

const ordersSeed: Order[] = [
  { id: "SPD-O-8851", retailer: "Jain Medical Agencies", town: "Rajwada, Indore", kind: "Chemist", source: "Salesman app", salesman: "Mahesh Yadav", lines: 34, value: 48260, col: "received", route: "CA", at: "10:41 AM", h1: true },
  { id: "SPD-O-8850", retailer: "Arihant Medicos", town: "Vijay Nagar, Indore", kind: "Chemist", source: "PharmaRack", salesman: "Rohit Malviya", lines: 22, value: 31480, col: "received", route: "CB", at: "10:38 AM" },
  { id: "SPD-O-8849", retailer: "Malwa Multispeciality Hospital", town: "Bhanwarkuan, Indore", kind: "Hospital", source: "Phone", salesman: "Amit Patidar", lines: 61, value: 186400, col: "received", route: "CB", at: "10:30 AM", cold: true, h1: true },
  { id: "SPD-O-8847", retailer: "Mahakal Medical Hall", town: "Freeganj, Ujjain", kind: "Chemist", source: "WhatsApp", salesman: "Vikas Chouhan", lines: 18, value: 22740, col: "picking", route: "UJ", at: "10:12 AM" },
  { id: "SPD-O-8846", retailer: "Rathi Drug House", town: "Siyaganj, Indore", kind: "Chemist", source: "Salesman app", salesman: "Mahesh Yadav", lines: 47, value: 71950, col: "picking", route: "CA", at: "10:05 AM", h1: true },
  { id: "SPD-O-8842", retailer: "Shree Ganesh Medical Stores", town: "AB Road, Dewas", kind: "Chemist", source: "Salesman app", salesman: "Sunil Parmar", lines: 39, value: 62180, col: "picking", route: "DW", at: "9:48 AM" },
  { id: "SPD-O-8840", retailer: "Gupta Nursing Home", town: "Dhar", kind: "Nursing home", source: "WhatsApp", salesman: "Arif Khan", lines: 26, value: 54300, col: "packed", route: "DH", at: "9:31 AM", cold: true },
  { id: "SPD-O-8838", retailer: "Sai Kripa Pharmacy", town: "Sector 1, Pithampur", kind: "Chemist", source: "PharmaRack", salesman: "Arif Khan", lines: 15, value: 17820, col: "packed", route: "DH", at: "9:20 AM" },
  { id: "SPD-O-8835", retailer: "Om Sai Medical", town: "Main Street, Mhow", kind: "Chemist", source: "Phone", salesman: "Rohit Malviya", lines: 12, value: 13460, col: "packed", route: "MW", at: "9:02 AM" },
  { id: "SPD-O-8829", retailer: "Life Line Nursing Home", town: "Station Road, Dewas", kind: "Nursing home", source: "Salesman app", salesman: "Sunil Parmar", lines: 31, value: 66900, col: "dispatched", route: "DW", at: "Yesterday 6:40 PM", cold: true, h1: true },
  { id: "SPD-O-8827", retailer: "Nayak Medicos", town: "Radha Vallabh Market, Khargone", kind: "Chemist", source: "WhatsApp", salesman: "Lokesh Patel", lines: 28, value: 39150, col: "dispatched", route: "KB", at: "Yesterday 5:55 PM" },
  { id: "SPD-O-8825", retailer: "Kothari Medical", town: "Tower Chowk, Ujjain", kind: "Chemist", source: "PharmaRack", salesman: "Vikas Chouhan", lines: 20, value: 27630, col: "delivered", route: "UJ", at: "Yesterday 4:20 PM" },
  { id: "SPD-O-8822", retailer: "Shubham Medicals", town: "Sanwer", kind: "Chemist", source: "Salesman app", salesman: "Mahesh Yadav", lines: 16, value: 19840, col: "delivered", route: "CA", at: "Yesterday 3:10 PM" },
  { id: "SPD-O-8819", retailer: "Patidar Medical", town: "Barwani", kind: "Chemist", source: "Phone", salesman: "Lokesh Patel", lines: 24, value: 33210, col: "delivered", route: "KB", at: "Yesterday 2:30 PM" },
];
const orderCols: { id: OrderCol; label: string; tone: Tone; hint: string }[] = [
  { id: "received", label: "Received", tone: "warn", hint: "Credit check, then pick list" },
  { id: "picking", label: "Picking (FEFO)", tone: "info", hint: "Scanner picks earliest expiry first" },
  { id: "packed", label: "Packed & billed", tone: "accent", hint: "Invoice, e-way bill if over ₹50k" },
  { id: "dispatched", label: "On the van", tone: "info", hint: "Route van or bus parcel" },
  { id: "delivered", label: "Delivered", tone: "ok", hint: "POD signed on app" },
];
const SEED_TODAY = ordersSeed.filter((o) => !o.at.startsWith("Yesterday")).reduce((a, o) => a + o.value, 0);
const NEXT_COL: Record<OrderCol, OrderCol | null> = { received: "picking", picking: "packed", packed: "dispatched", dispatched: "delivered", delivered: null };
const sourceTone: Record<Source, Tone> = { "Salesman app": "accent", WhatsApp: "ok", PharmaRack: "info", Phone: "neutral" };
const SALEABLE = BATCH_SEED.filter((b) => b.m > 0.5);
function itemsFor(o: Order) {
  const seed = Number(o.id.slice(-2));
  return Array.from({ length: Math.min(o.lines, 5) }, (_, j) => {
    const b = SALEABLE[(seed * 5 + j * 7) % SALEABLE.length];
    return { key: `${o.id}-${j}`, product: b.product, co: coById(b.co).short, batch: b.batch, exp: expLabel(b.m), qty: (((seed + j * 3) % 6) + 1) * 5 };
  });
}

/* ---------------- Stock & POs ---------------- */

type Shortage = { id: string; product: string; co: string; onHand: number; perDay: number; shortLines: number; ptr: number; suggest: number };
const shortagesSeed: Shortage[] = [
  { id: "s1", product: "Pantocid DSR", co: "SUN", onHand: 0, perDay: 140, shortLines: 41, ptr: 168, suggest: 2000 },
  { id: "s2", product: "Rosuvas 20", co: "SUN", onHand: 60, perDay: 45, shortLines: 12, ptr: 312, suggest: 600 },
  { id: "s3", product: "Glycomet GP 1", co: "SUN", onHand: 120, perDay: 90, shortLines: 9, ptr: 92, suggest: 1500 },
  { id: "s4", product: "Augmentin 625 Duo", co: "ABT", onHand: 0, perDay: 70, shortLines: 23, ptr: 176, suggest: 900 },
  { id: "s5", product: "Montair LC", co: "CIP", onHand: 85, perDay: 60, shortLines: 7, ptr: 154, suggest: 800 },
  { id: "s6", product: "Mixtard 30/70 vial 10 ml", co: "NOV", onHand: 14, perDay: 11, shortLines: 6, ptr: 128, suggest: 150 },
  { id: "s7", product: "Dolo 650", co: "MAC", onHand: 300, perDay: 260, shortLines: 4, ptr: 24, suggest: 5000 },
];
type POStatus = "Draft" | "Sent" | "Confirmed" | "In transit" | "GRN done";
type PO = { id: string; co: string; lines: number; value: number; status: POStatus; eta: string };
const poSeed: PO[] = [
  { id: "PO-2610-118", co: "CIP", lines: 46, value: 842000, status: "In transit", eta: "Today 4 PM" },
  { id: "PO-2610-117", co: "ALK", lines: 31, value: 516400, status: "Confirmed", eta: "Wed" },
  { id: "PO-2610-116", co: "MAN", lines: 22, value: 284900, status: "Sent", eta: "Thu" },
  { id: "PO-2610-114", co: "LUP", lines: 38, value: 611200, status: "GRN done", eta: "Yesterday" },
  { id: "PO-2610-113", co: "TOR", lines: 19, value: 233700, status: "GRN done", eta: "Sat" },
  { id: "PO-2610-112", co: "ZYD", lines: 27, value: 398500, status: "In transit", eta: "Tomorrow" },
];
const PO_NEXT: Record<POStatus, POStatus | null> = { Draft: "Sent", Sent: "Confirmed", Confirmed: "In transit", "In transit": "GRN done", "GRN done": null };
const poTone: Record<POStatus, Tone> = { Draft: "neutral", Sent: "warn", Confirmed: "info", "In transit": "accent", "GRN done": "ok" };
const stockByCo = [
  { co: "Sun Pharma", v: 7140000 },
  { co: "Cipla", v: 6320000 },
  { co: "Alkem", v: 5480000 },
  { co: "Mankind", v: 4410000 },
  { co: "Lupin", v: 3960000 },
  { co: "Abbott India", v: 3720000 },
  { co: "Torrent", v: 3150000 },
  { co: "Novo Nordisk", v: 2840000 },
  { co: "Zydus", v: 2760000 },
  { co: "Others (5)", v: 8420000 },
];

/* ---------------- Schemes & claims ---------------- */

type Scheme = { id: string; co: string; product: string; offer: string; till: string; sold: number; target: number; reach: number };
const schemesSeed: Scheme[] = [
  { id: "SC-41", co: "MAN", product: "Manforce 50 / 100", offer: "12+2 free", till: "31 Oct", sold: 1840, target: 2400, reach: 214 },
  { id: "SC-40", co: "ALK", product: "Taxim-O 200 / Clavam 625", offer: "10+1 free (liquidation)", till: "15 Nov", sold: 610, target: 1500, reach: 96 },
  { id: "SC-39", co: "CIP", product: "Budecort Respules", offer: "Extra 6% off PTR", till: "30 Nov", sold: 1220, target: 1800, reach: 131 },
  { id: "SC-38", co: "SUN", product: "Volini range", offer: "Display ₹500 + 10+1", till: "31 Oct", sold: 940, target: 1000, reach: 178 },
  { id: "SC-37", co: "TOR", product: "Shelcal 500 / HD", offer: "15+3 free", till: "20 Nov", sold: 720, target: 1400, reach: 122 },
  { id: "SC-36", co: "GLN", product: "Telma 40 / 40-H", offer: "Rate difference ₹9/strip", till: "31 Dec", sold: 2150, target: 3000, reach: 241 },
  { id: "SC-35", co: "LUP", product: "Gluconorm range", offer: "Net rate PTR −8%", till: "31 Oct", sold: 1310, target: 1500, reach: 167 },
  { id: "SC-34", co: "ZYD", product: "Sporlac / Deriphyllin", offer: "10+1 free", till: "10 Nov", sold: 480, target: 1200, reach: 74 },
  { id: "SC-33", co: "ABT", product: "Digene Gel", offer: "Buy 12 get 2 + gift", till: "31 Oct", sold: 360, target: 600, reach: 58 },
  { id: "SC-32", co: "DRL", product: "Omez / Razo-D", offer: "Extra 5% on 50+ strips", till: "30 Nov", sold: 1090, target: 2000, reach: 112 },
];
type ClaimCol = "prepared" | "submitted" | "review" | "cn" | "disputed";
type Claim = { id: string; co: string; scheme: string; kind: "Free goods" | "Rate difference" | "Expiry return" | "Breakage" | "Display"; amount: number; age: number; col: ClaimCol; note: string };
const claimsSeed: Claim[] = [
  { id: "CL-2290", co: "MAN", scheme: "Manforce & Prega News 12+2, Jul–Aug", kind: "Free goods", amount: 264000, age: 118, col: "disputed", note: "14 invoices without retailer GSTIN" },
  { id: "CL-2302", co: "GLN", scheme: "Telma rate difference, Sep", kind: "Rate difference", amount: 193500, age: 41, col: "review", note: "RSM approved, at HO accounts" },
  { id: "CL-2305", co: "LUP", scheme: "Near-expiry return, Gluconorm Aug batch", kind: "Expiry return", amount: 88400, age: 33, col: "review", note: "Goods received at C&F 24 Sep" },
  { id: "CL-2311", co: "CIP", scheme: "Budecort extra 6%, Sep", kind: "Rate difference", amount: 142800, age: 26, col: "submitted", note: "Uploaded on Cipla DMS" },
  { id: "CL-2313", co: "SUN", scheme: "Volini display, Sep", kind: "Display", amount: 41500, age: 22, col: "submitted", note: "83 shop photos attached" },
  { id: "CL-2316", co: "ALK", scheme: "Expiry claim, Q2 returns", kind: "Expiry return", amount: 116700, age: 19, col: "submitted", note: "Debit note SPD/DN/0418" },
  { id: "CL-2319", co: "TOR", scheme: "Shelcal 15+3, Sep", kind: "Free goods", amount: 67200, age: 15, col: "cn", note: "CN TOR/CN/88214 received" },
  { id: "CL-2320", co: "ZYD", scheme: "Breakage in transit, inward 2 Oct", kind: "Breakage", amount: 12900, age: 18, col: "disputed", note: "Transporter LR not signed" },
  { id: "CL-2324", co: "DRL", scheme: "Omez extra 5%, Sep", kind: "Rate difference", amount: 58300, age: 12, col: "cn", note: "CN DRL/7741 received" },
  { id: "CL-2328", co: "MAN", scheme: "Manforce 12+2, Sep", kind: "Free goods", amount: 131600, age: 8, col: "prepared", note: "Statement ready in Marg" },
  { id: "CL-2330", co: "ABT", scheme: "Digene Buy 12 get 2, Sep", kind: "Free goods", amount: 38900, age: 6, col: "prepared", note: "Needs retailer-wise sale list" },
  { id: "CL-2331", co: "CIP", scheme: "Near-expiry return, Foracort FC0942", kind: "Expiry return", amount: 66800, age: 2, col: "prepared", note: "180 inhalers, expired Aug 2026" },
];
const claimCols: { id: ClaimCol; label: string; tone: Tone; hint: string }[] = [
  { id: "prepared", label: "Prepared", tone: "neutral", hint: "Statement built from Marg" },
  { id: "submitted", label: "Submitted", tone: "warn", hint: "On the company portal or mailed" },
  { id: "review", label: "Company review", tone: "info", hint: "RSM or HO accounts" },
  { id: "cn", label: "Credit note in", tone: "ok", hint: "Matched in Tally" },
  { id: "disputed", label: "Disputed", tone: "late", hint: "Needs papers or a call" },
];
const reconSeed = [
  { id: "r1", co: "Torrent", ref: "CN TOR/CN/88214", claimed: 67200, cn: 67200 },
  { id: "r2", co: "Dr. Reddy's", ref: "CN DRL/7741", claimed: 58300, cn: 52470 },
  { id: "r3", co: "Lupin", ref: "CN LUP/IND/3392 (Aug)", claimed: 74100, cn: 66690 },
  { id: "r4", co: "Sun Pharma", ref: "CN SUN/P/11820 (Aug)", claimed: 128600, cn: 121900 },
  { id: "r5", co: "Cipla", ref: "CN CIP/DMS/40917 (Aug)", claimed: 96200, cn: 96200 },
];

/* ---------------- Chemist credit ---------------- */

type CreditStatus = "Active" | "Watch" | "Hold";
type Chemist = { id: string; name: string; town: string; kind: "Chemist" | "Nursing home" | "Hospital"; limit: number; out: number; days: number; bounces: number; status: CreditStatus; salesman: string; lastPay: string; terms: number };
const chemistsSeed: Chemist[] = [
  { id: "c01", name: "Shree Ganesh Medical Stores", town: "Dewas", kind: "Chemist", limit: 300000, out: 342000, days: 78, bounces: 2, status: "Watch", salesman: "Sunil Parmar", lastPay: "₹40,000 on 22 Sep", terms: 30 },
  { id: "c02", name: "Jain Medical Agencies", town: "Rajwada, Indore", kind: "Chemist", limit: 500000, out: 286400, days: 21, bounces: 0, status: "Active", salesman: "Mahesh Yadav", lastPay: "₹1.2 L on 16 Oct", terms: 30 },
  { id: "c03", name: "Arihant Medicos", town: "Vijay Nagar, Indore", kind: "Chemist", limit: 400000, out: 194800, days: 18, bounces: 0, status: "Active", salesman: "Rohit Malviya", lastPay: "₹86,000 on 18 Oct", terms: 30 },
  { id: "c04", name: "Malwa Multispeciality Hospital", town: "Bhanwarkuan, Indore", kind: "Hospital", limit: 1500000, out: 1164000, days: 52, bounces: 0, status: "Active", salesman: "Amit Patidar", lastPay: "₹4.5 L on 5 Oct", terms: 60 },
  { id: "c05", name: "Mahakal Medical Hall", town: "Ujjain", kind: "Chemist", limit: 250000, out: 231900, days: 44, bounces: 0, status: "Watch", salesman: "Vikas Chouhan", lastPay: "₹30,000 on 2 Oct", terms: 30 },
  { id: "c06", name: "Gupta Nursing Home", town: "Dhar", kind: "Nursing home", limit: 350000, out: 318700, days: 67, bounces: 1, status: "Watch", salesman: "Arif Khan", lastPay: "₹50,000 on 19 Sep", terms: 45 },
  { id: "c07", name: "Sai Kripa Pharmacy", town: "Pithampur", kind: "Chemist", limit: 150000, out: 61200, days: 12, bounces: 0, status: "Active", salesman: "Arif Khan", lastPay: "₹48,000 on 15 Oct", terms: 21 },
  { id: "c08", name: "Nayak Medicos", town: "Khargone", kind: "Chemist", limit: 200000, out: 211400, days: 96, bounces: 1, status: "Hold", salesman: "Lokesh Patel", lastPay: "₹25,000 on 28 Aug", terms: 30 },
  { id: "c09", name: "Patidar Medical", town: "Barwani", kind: "Chemist", limit: 180000, out: 92300, days: 27, bounces: 0, status: "Active", salesman: "Lokesh Patel", lastPay: "₹60,000 on 10 Oct", terms: 30 },
  { id: "c10", name: "Om Sai Medical", town: "Mhow", kind: "Chemist", limit: 120000, out: 48900, days: 9, bounces: 0, status: "Active", salesman: "Rohit Malviya", lastPay: "₹35,000 on 17 Oct", terms: 21 },
  { id: "c11", name: "Rathi Drug House", town: "Siyaganj, Indore", kind: "Chemist", limit: 600000, out: 412600, days: 33, bounces: 0, status: "Active", salesman: "Mahesh Yadav", lastPay: "₹2 L on 14 Oct", terms: 30 },
  { id: "c12", name: "Kothari Medical", town: "Ujjain", kind: "Chemist", limit: 200000, out: 188300, days: 71, bounces: 0, status: "Hold", salesman: "Vikas Chouhan", lastPay: "₹20,000 on 12 Sep", terms: 30 },
  { id: "c13", name: "Life Line Nursing Home", town: "Dewas", kind: "Nursing home", limit: 300000, out: 156400, days: 38, bounces: 0, status: "Active", salesman: "Sunil Parmar", lastPay: "₹70,000 on 8 Oct", terms: 45 },
  { id: "c14", name: "Shubham Medicals", town: "Sanwer", kind: "Chemist", limit: 100000, out: 34800, days: 6, bounces: 0, status: "Active", salesman: "Mahesh Yadav", lastPay: "₹28,000 on 19 Oct", terms: 21 },
];
function billsFor(c: Chemist) {
  const parts = [0.38, 0.27, 0.21, 0.14];
  const n = Number(c.id.slice(1));
  return parts.map((p, i) => ({ no: `SPD/26-27/${String(4180 + n * 37 + i * 211).padStart(5, "0")}`, amount: Math.round(c.out * p), days: Math.max(2, c.days - i * 13) }));
}
const collections = [
  { name: "Mahesh Yadav", beat: "Indore City A", target: 320000, got: 248000 },
  { name: "Rohit Malviya", beat: "Indore City B", target: 280000, got: 191500 },
  { name: "Sunil Parmar", beat: "Dewas", target: 180000, got: 62000 },
  { name: "Vikas Chouhan", beat: "Ujjain", target: 200000, got: 118400 },
  { name: "Arif Khan", beat: "Dhar–Pithampur", target: 150000, got: 98000 },
  { name: "Lokesh Patel", beat: "Khargone–Barwani", target: 140000, got: 41000 },
];

/* ---------------- Cold chain ---------------- */

type Fridge = { id: string; name: string; model: string; base: number; spread: number; contents: string; value: number; logger: string; doors: number; power: string };
const FRIDGES: Fridge[] = [
  { id: "F1", name: "Vaccine fridge", model: "Haier HYC-610, 610 L", base: 4.6, spread: 0.1, contents: "VaxiFlu-4, Rotavac, hepatitis B", value: 640000, logger: "LogTag TRIX-8 #44121", doors: 9, power: "Inverter + 2 h battery" },
  { id: "F2", name: "Insulin fridge A", model: "Blue Star CF3-400, 400 L", base: 5.1, spread: 0.12, contents: "Ryzodeg, NovoRapid, Basalog", value: 910000, logger: "LogTag TRIX-8 #44124", doors: 14, power: "Inverter" },
  { id: "F3", name: "Insulin fridge B", model: "Blue Star CF3-400, 400 L", base: 7.4, spread: 0.15, contents: "Mixtard 30 Penfill, Lantus SoloStar", value: 820000, logger: "LogTag TRIX-8 #44127", doors: 17, power: "Inverter (changeover fault)" },
  { id: "F4", name: "Walk-in cold room", model: "Voltas 12 m³, twin compressor", base: 4.2, spread: 0.08, contents: "Bulk insulin, biologicals, eye drops", value: 1260000, logger: "Sensitech TempTale #8812", doors: 22, power: "DG set + inverter" },
  { id: "F5", name: "Dispatch staging chiller", model: "Western SRC 300, 300 L", base: 6.1, spread: 0.14, contents: "Packed cold orders for today's vans", value: 220000, logger: "LogTag TRIX-8 #44130", doors: 31, power: "Inverter" },
  { id: "F6", name: "Godown 2 fridge, Ujjain Road", model: "Haier HYC-390, 390 L", base: 3.8, spread: 0.1, contents: "Overflow vaccines, Clexane", value: 170000, logger: "LogTag TRIX-8 #44133", doors: 4, power: "Inverter" },
];
function loggerSeries(f: Fridge, fi: number) {
  return Array.from({ length: 24 }, (_, h) => Math.round((f.base + Math.sin((h + fi * 3) / 3.2) * 0.45 + (f.id === "F3" && h === 16 ? 2.0 : 0) + (f.id === "F3" && h === 17 ? 0.9 : 0)) * 10) / 10);
}
type ExStatus = "Open" | "With company" | "Closed";
type Excursion = { id: string; fridge: string; when: string; mins: number; peak: number; cause: string; batches: string[]; status: ExStatus };
const excursionsSeed: Excursion[] = [
  { id: "EX-311", fridge: "F3", when: "Today 3:10 AM", mins: 22, peak: 9.4, cause: "Power cut, inverter changeover failed", batches: ["b32", "b34"], status: "Open" },
  { id: "EX-309", fridge: "F5", when: "Yesterday 6:15 PM", mins: 9, peak: 8.6, cause: "Door held open during van loading", batches: [], status: "Closed" },
  { id: "EX-306", fridge: "F3", when: "Sat 2:40 PM", mins: 14, peak: 8.9, cause: "Overloaded after Novo inward", batches: ["b32"], status: "With company" },
  { id: "EX-301", fridge: "F2", when: "14 Oct 11:05 AM", mins: 6, peak: 8.2, cause: "Defrost cycle", batches: [], status: "Closed" },
  { id: "EX-297", fridge: "F1", when: "9 Oct 1:20 AM", mins: 31, peak: 1.4, cause: "Thermostat set too low, freeze risk", batches: ["b19"], status: "Closed" },
  { id: "EX-292", fridge: "F6", when: "3 Oct 4:50 PM", mins: 11, peak: 8.4, cause: "Power cut, DG start delayed", batches: [], status: "Closed" },
];
const exTone: Record<ExStatus, Tone> = { Open: "late", "With company": "warn", Closed: "ok" };

/* ---------------- Compliance ---------------- */

type Licence = { id: string; name: string; no: string; authority: string; expires: string; days: number; status: "Valid" | "Renew now" | "Renewal filed" };
const licencesSeed: Licence[] = [
  { id: "l1", name: "Drug licence, Form 20B (wholesale)", no: "20B/IND/2016/4471", authority: "FDA Madhya Pradesh, Indore", expires: "12 Nov 2026", days: 23, status: "Renew now" },
  { id: "l2", name: "Drug licence, Form 21B (biologicals, vaccines)", no: "21B/IND/2016/4472", authority: "FDA Madhya Pradesh, Indore", expires: "12 Nov 2026", days: 23, status: "Renew now" },
  { id: "l3", name: "Fire NOC, main godown", no: "IMC/FIRE/2025/1182", authority: "Indore Municipal Corporation", expires: "29 Oct 2026", days: 9, status: "Renew now" },
  { id: "l4", name: "FSSAI licence (nutraceuticals)", no: "21425010001882", authority: "FSSAI, MP", expires: "20 Dec 2026", days: 61, status: "Valid" },
  { id: "l5", name: "GST registration", no: "23AAKFS4471M1Z8", authority: "CBIC / MP Commercial Tax", expires: "No expiry", days: 999, status: "Valid" },
  { id: "l6", name: "Trade licence", no: "IMC/TL/Z-08/22610", authority: "Indore Municipal Corporation", expires: "31 Mar 2027", days: 162, status: "Valid" },
  { id: "l7", name: "Competent person: Neha Dubey, B.Pharm", no: "MPPC Reg. 21876", authority: "MP Pharmacy Council", expires: "31 Dec 2027", days: 437, status: "Valid" },
  { id: "l8", name: "Shops & Establishment", no: "SE/IND/2016/88104", authority: "Labour Dept, MP", expires: "No expiry", days: 999, status: "Valid" },
];
type H1Row = { id: string; time: string; inv: string; drug: string; batch: string; qty: number; buyer: string; dl: string; ok: boolean };
const h1Seed: H1Row[] = [
  { id: "h01", time: "10:52 AM", inv: "SPD/26-27/18842", drug: "Taxim-O 200 (cefixime)", batch: "TXO-3392", qty: 60, buyer: "Rathi Drug House", dl: "20B/IND/3318", ok: true },
  { id: "h02", time: "10:47 AM", inv: "SPD/26-27/18840", drug: "Akurit-4 (anti-TB FDC)", batch: "AK4-0623", qty: 20, buyer: "Malwa Multispeciality Hospital", dl: "20B/IND/1102", ok: true },
  { id: "h03", time: "10:31 AM", inv: "SPD/26-27/18836", drug: "Alprax 0.25 (alprazolam)", batch: "ALX2207", qty: 30, buyer: "Jain Medical Agencies", dl: "20B/IND/0884", ok: true },
  { id: "h04", time: "10:18 AM", inv: "SPD/26-27/18833", drug: "Clavam 625 (amoxyclav)", batch: "CLV5520", qty: 40, buyer: "Gupta Nursing Home", dl: "20/DHR/0412", ok: true },
  { id: "h05", time: "10:02 AM", inv: "SPD/26-27/18829", drug: "Moxif 400 (moxifloxacin)", batch: "MXF1180", qty: 25, buyer: "Life Line Nursing Home", dl: "20/DEW/0233", ok: true },
  { id: "h06", time: "9:44 AM", inv: "SPD/26-27/18825", drug: "Zolfresh 10 (zolpidem)", batch: "ZF6641", qty: 15, buyer: "Mahakal Medical Hall", dl: "20B/UJN/0719", ok: false },
  { id: "h07", time: "9:38 AM", inv: "SPD/26-27/18824", drug: "Taxim-O 200 (cefixime)", batch: "TXO-3392", qty: 50, buyer: "Arihant Medicos", dl: "20B/IND/2950", ok: true },
  { id: "h08", time: "9:21 AM", inv: "SPD/26-27/18820", drug: "Levoflox 500 (levofloxacin)", batch: "LVF3307", qty: 30, buyer: "Sai Kripa Pharmacy", dl: "20/DHR/0890", ok: true },
  { id: "h09", time: "9:05 AM", inv: "SPD/26-27/18817", drug: "Clavam 625 (amoxyclav)", batch: "CLV5520", qty: 60, buyer: "Nayak Medicos", dl: "20/KHG/0157", ok: true },
  { id: "h10", time: "Yesterday 6:30 PM", inv: "SPD/26-27/18802", drug: "Akurit-4 (anti-TB FDC)", batch: "AK4-0623", qty: 30, buyer: "Life Line Nursing Home", dl: "20/DEW/0233", ok: true },
];
type Ewb = { id: string; no: string; inv: string; to: string; value: number; vehicle: string; valid: string; status: "Generated" | "Pending" };
const ewbSeed: Ewb[] = [
  { id: "e1", no: "3214 8870 4412", inv: "SPD/26-27/18840", to: "Malwa Multispeciality Hospital, Indore", value: 186400, vehicle: "MP09 GH 4413", valid: "Till 21 Oct", status: "Generated" },
  { id: "e2", no: "3214 8870 4398", inv: "SPD/26-27/18842", to: "Rathi Drug House, Indore", value: 71950, vehicle: "MP09 GH 4412", valid: "Till 21 Oct", status: "Generated" },
  { id: "e3", no: "—", inv: "SPD/26-27/18846", to: "Shree Ganesh Medical Stores, Dewas", value: 62180, vehicle: "MP09 LK 2291", valid: "—", status: "Pending" },
  { id: "e4", no: "—", inv: "SPD/26-27/18848", to: "Gupta Nursing Home, Dhar", value: 54300, vehicle: "MP09 LK 2295", valid: "—", status: "Pending" },
  { id: "e5", no: "3214 8869 9910", inv: "SPD/26-27/18811", to: "Life Line Nursing Home, Dewas", value: 66900, vehicle: "MP09 LK 2291", valid: "Till 20 Oct", status: "Generated" },
  { id: "e6", no: "—", inv: "SPD/26-27/18850", to: "Nayak Medicos, Khargone", value: 51200, vehicle: "Hans Travels MP09 P 7718", valid: "—", status: "Pending" },
];

/* ---------------- Shared modules data ---------------- */

const team: TeamMember[] = [
  { name: "Sanjay Agrawal", role: "Owner", status: "Busy", load: 90, focus: "Lupin return window, Sun PO cut-off, Dewas credit call", tasks: [{ title: "Approve Lupin near-expiry return", due: "11:00" }, { title: "Call Shree Ganesh Medical, Dewas", due: "12:30" }, { title: "Mankind RSM meeting on claims", due: "5:00" }], week: [1, 1, 1, 1, 1, 1], since: "1997" },
  { name: "Ritu Agrawal", role: "Finance, credit & collections", status: "Busy", load: 84, focus: "Overdue above 60 days: ₹41 L across 23 chemists", tasks: [{ title: "Bounced cheque letters, 3 chemists", due: "now" }, { title: "Bank reco, HDFC CC account", due: "3:00", done: true }, { title: "GSTR-1 draft for October", due: "Fri" }], week: [1, 1, 1, 1, 1, 0], since: "2004" },
  { name: "Neha Dubey", role: "Registered pharmacist, compliance", status: "On floor", load: 72, focus: "Form 20B/21B renewal papers, H1 register check", tasks: [{ title: "Affidavit for FDA renewal", due: "2:00" }, { title: "Verify 6 H1 buyer DLs", due: "4:00" }], week: [1, 1, 1, 1, 1, 1], since: "2019" },
  { name: "Ravi Choudhary", role: "Godown head, FEFO & returns", status: "On floor", load: 81, focus: "Pulling Lupin and Cipla returns, 3 racks to re-sort by expiry", tasks: [{ title: "Pack Gluconorm return, 640 strips", due: "1:00" }, { title: "Move expired stock to X-rack", due: "done", done: true }, { title: "Cipla inward GRN, 46 lines", due: "4:30" }], week: [1, 1, 1, 1, 1, 1], since: "2008" },
  { name: "Imran Sheikh", role: "Dispatch & route vans", status: "In field", load: 76, focus: "7 routes today, 2 cold boxes on Dewas and Dhar vans", tasks: [{ title: "Load City A and City B vans", due: "11:15" }, { title: "Hans Travels parcel booking", due: "4:00" }], week: [1, 1, 1, 0, 1, 1], since: "2012" },
  { name: "Amit Patidar", role: "Sales head, 11 salesmen", status: "In field", load: 70, focus: "CHL Hospital rate contract, Ujjain beat review", tasks: [{ title: "Rate contract offer to hospital", due: "3:00" }, { title: "Weekly beat plan to salesmen", due: "6:00" }], week: [1, 1, 1, 1, 1, 1], since: "2010" },
  { name: "Deepak Solanki", role: "Schemes, claims & Marg ERP", status: "Busy", load: 79, focus: "Mankind dispute papers, Abbott retailer-wise sale list", tasks: [{ title: "Fix GSTIN on 14 Mankind invoices", due: "1:00" }, { title: "Reconcile DRL CN short ₹5,830", due: "5:00" }], week: [1, 1, 1, 1, 1, 0], since: "2014" },
  { name: "Kavita Rathore", role: "Order desk & WhatsApp", status: "On floor", load: 66, focus: "62 WhatsApp orders since 8 AM, 9 waiting for stock", tasks: [{ title: "Tell 41 chemists Pantocid DSR ETA", due: "12:00" }, { title: "Key in phone orders from Barwani", due: "2:00" }], week: [1, 1, 1, 1, 0, 1], since: "2021" },
];

const agents: WorkforceAgent[] = [
  { name: "Expiry Watch", role: "Sweeps every batch against company return windows", icon: Radar, status: "Needs you", runsToday: 4, hoursSaved: 6, accuracy: 95, last: "18 min ago", skills: ["Marg batches", "Return policies", "Sell-through"], schedule: "Daily 7 AM and 2 PM", inbox: [{ title: "Raise Lupin Gluconorm-G2 return?", detail: "640 strips will not sell before Lupin's 2-month cut-off. 90% PTR credit note if raised by 31 Oct." }, { title: "Push Taxim-O with 10+1?", detail: "4.1 months left, 1,500 strips. Alkem co-funds half the free goods." }], log: ["Flagged 9 batches under 3 months", "Moved Prega News PN2214 to expiry claim", "Built Cipla Foracort return list, 180 inhalers"] },
  { name: "Order Taker", role: "Reads WhatsApp and PharmaRack orders into Marg", icon: MessageCircle, status: "Running", runsToday: 62, hoursSaved: 7.5, accuracy: 93, last: "1 min ago", skills: ["WhatsApp", "PharmaRack", "Marg", "Brand-to-SKU match"], schedule: "Always on, hands odd ones to Kavita", log: ["Keyed 18-line order from Mahakal Medical", "Matched 'pan d' to Pan-D 40 caps for 3 chemists", "Told 41 chemists Pantocid DSR is short"] },
  { name: "Claim Chaser", role: "Builds scheme statements and chases credit notes", icon: BadgePercent, status: "Needs you", runsToday: 3, hoursSaved: 5, accuracy: 91, last: "1 h ago", skills: ["Scheme rules", "Company portals", "Tally CN match"], schedule: "Daily 6 PM", inbox: [{ title: "Mankind claim 118 days old", detail: "14 invoices lack retailer GSTIN. Corrected list is ready; re-submit?" }], log: ["Matched Torrent CN ₹67,200", "DRL credit note short by ₹5,830", "Prepared Manforce Sep statement"] },
  { name: "Credit Guard", role: "Checks limits and ageing before every order is picked", icon: CreditCard, status: "Needs you", runsToday: 211, hoursSaved: 4, accuracy: 89, last: "3 min ago", skills: ["Limits", "Ageing", "Cheque bounces", "UPI links"], schedule: "On every order", inbox: [{ title: "Hold Shree Ganesh Medical, Dewas?", detail: "₹3.42 L against ₹3 L limit, 78 days, 2 bounces. ₹62k order waiting." }], log: ["Parked Nayak Medicos order, 96 days", "Sent 23 UPI reminders", "Released Patidar Medical after ₹60k RTGS"] },
  { name: "Cold Sentinel", role: "Watches every fridge logger and opens excursions", icon: Snowflake, status: "Running", runsToday: 288, hoursSaved: 3, accuracy: 98, last: "just now", skills: ["LogTag", "2–8 °C rules", "Company stability notes"], schedule: "Every 5 minutes", log: ["Opened EX-311 on F3, 9.4 °C peak", "Called Imran at 3:12 AM", "F5 door alarm during loading, closed"] },
  { name: "Compliance Clerk", role: "Keeps licences, H1 register and GST filings current", icon: ShieldCheck, status: "Idle", runsToday: 2, hoursSaved: 2.5, accuracy: 96, last: "8:00 AM", skills: ["FDA MP portal", "Schedule H1", "e-way bill", "GSTR"], schedule: "Daily 8 AM", log: ["Fire NOC expires in 9 days", "1 H1 buyer DL unverified", "4 e-way bills pending for today"] },
];

const independence: IndependenceData = {
  score: 44,
  history: [29, 31, 34, 36, 39, 42, 44],
  quote: "Every chemist who wants an extra week of credit calls me, not Ritu. And every company man wants to meet the malik, not Deepak.",
  pillars: [
    { name: "Orders & dispatch", score: 61, note: "Order desk and vans run without Sanjay; only hospital orders wait for him.", fixes: [{ title: "Hospital rate contracts in Marg", gain: 3 }, { title: "Order Taker on PharmaRack", gain: 2 }] },
    { name: "Stock & expiry", score: 42, note: "Return windows live in Ravi's memory. ₹7.8 L went to destruction last year.", fixes: [{ title: "Expiry Watch on every batch", gain: 4 }, { title: "Monthly expiry review with companies", gain: 2 }] },
    { name: "Schemes & claims", score: 31, note: "Claims older than 90 days need Sanjay to call the RSM.", fixes: [{ title: "Claim Chaser with portal uploads", gain: 4 }, { title: "Claims register per company", gain: 1 }] },
    { name: "Chemist credit", score: 35, note: "Limits exist in Marg but holds are lifted on the owner's phone call.", fixes: [{ title: "Credit Guard rules, owner only above ₹5 L", gain: 4 }, { title: "UPI links on every reminder", gain: 2 }] },
    { name: "Cold chain", score: 58, note: "Loggers are in place; nobody owns the night alarm.", fixes: [{ title: "Night escalation to Imran then Ravi", gain: 2 }] },
    { name: "Compliance", score: 49, note: "Neha handles the register; renewals are found late.", fixes: [{ title: "Renewal calendar 60 days ahead", gain: 3 }] },
    { name: "Owner time", score: 33, note: "Sanjay spends 19 hours a week on calls that should be rules.", fixes: [{ title: "Two decision windows a day", gain: 2 }] },
  ],
  ownerHours: [
    { label: "Credit calls", hours: 7 },
    { label: "Company RSMs", hours: 5 },
    { label: "Expiry & returns", hours: 3 },
    { label: "Hospital orders", hours: 2 },
    { label: "Banks", hours: 1 },
    { label: "Licences", hours: 1 },
    { label: "Strategy", hours: 1 },
  ],
};

const integrations: Integration[] = [
  { name: "Marg ERP 9+", category: "Billing & stock", status: "Connected", detail: "Batches, FEFO picking, sales bills and purchase GRNs.", synced: "2 min ago", records: "6,840 SKUs · 21,400 batches", mark: "M", color: "#c8102e" },
  { name: "Tally Prime", category: "Accounts", status: "Connected", detail: "Ledgers, credit notes from companies, bank reco.", synced: "12 min ago", records: "2.1 L vouchers", mark: "T", color: "#1c4f9c" },
  { name: "WhatsApp Business", category: "Orders & reminders", status: "Connected", detail: "Chemist orders, scheme pushes, UPI reminders.", synced: "just now", records: "9,860 chats", mark: "W", color: "#1fa855" },
  { name: "PharmaRack", category: "Retailer orders", status: "Syncing", detail: "Chemist app orders mapped to our SKUs.", synced: "live", records: "118 orders today", mark: "PR", color: "#0f766e" },
  { name: "Salesman app (Marg mOrder)", category: "Field", status: "Connected", detail: "Orders and collections from 11 salesmen.", synced: "4 min ago", records: "196 orders today", mark: "SA", color: "#1f6fb2" },
  { name: "NIC e-way bill", category: "Compliance", status: "Connected", detail: "E-way bills for invoices above ₹50,000.", synced: "20 min ago", records: "31 today", mark: "EW", color: "#334155" },
  { name: "GST e-invoice (IRP)", category: "Compliance", status: "Connected", detail: "IRN and QR on every B2B invoice.", synced: "6 min ago", records: "412 IRNs today", mark: "IRN", color: "#0b5394" },
  { name: "LogTag Analyzer", category: "Cold chain", status: "Connected", detail: "6 fridge loggers, 5-minute readings.", synced: "live", records: "1,728 readings today", mark: "LT", color: "#0891b2" },
  { name: "Company DMS portals", category: "Claims", status: "Error", detail: "Cipla DMS password expired; Sun and Lupin fine.", synced: "yesterday", records: "3 of 4 portals", mark: "DMS", color: "#d94f6b" },
  { name: "Razorpay UPI links", category: "Payments", status: "Available", detail: "Pay-now links inside every reminder.", synced: "—", records: "—", mark: "R", color: "#2563eb" },
];

/* ============================================================
   Config
   ============================================================ */

const config: DeskConfig = {
  slug: "pharma-distribution",
  company: "Sahyog Pharma Distributors",
  brand: "Sahyog",
  city: "Indore",
  state: "MP",
  icon: Package,
  tagline: "Stockist for 14 companies · ~900 chemists, nursing homes and hospitals across Malwa",
  owner: { name: "Sanjay Agrawal", first: "Sanjay", initials: "SA", role: "Proprietor" },
  theme: {
    variant: "inbox",
    paper: "#f2f6fa",
    panel: "#ffffff",
    sunk: "#e5edf5",
    ink: "#0f2238",
    mute: "#5a6b80",
    line: "#d5dfea",
    accent: "#1f6fb2",
    accentInk: "#ffffff",
    soft: "#dceaf6",
    ok: "#1f8a5b",
    warn: "#c98516",
    late: "#d94f6b",
    info: "#5a56b5",
    heading: "sans",
    radius: 14,
  },
  brief:
    "₹18.7 L of stock expires within six months and Lupin's return window on Gluconorm-G2 shuts in 11 days. Fridge F3 went to 9.4 °C for 22 minutes at 3 AM with 1,200 insulin units inside. Shree Ganesh Medical in Dewas is ₹42k over limit with a ₹62k order in picking.",
  pulse: [
    { label: "Orders today", value: "412", delta: "+8%", trend: [344, 361, 372, 390, 381, 398, 412], module: "orders" },
    { label: "Fill rate", value: "96.2%", delta: "-0.9%", good: false, trend: [97.4, 97.1, 97.3, 96.9, 96.8, 96.5, 96.2], tone: "warn", module: "stock" },
    { label: "Expiring < 6 mo", value: "₹18.7 L", delta: "-6%", good: true, trend: [22.1, 21.4, 20.6, 20.2, 19.5, 19.0, 18.7], tone: "info", module: "stock" },
    { label: "Overdue > 60 days", value: "₹41 L", delta: "+₹3 L", good: false, trend: [33, 34, 36, 37, 38, 38, 41], tone: "late", module: "credit" },
    { label: "Fridges in range", value: "5 / 6", delta: "-1", good: false, trend: [6, 6, 6, 6, 6, 6, 5], tone: "late", module: "cold" },
  ],
  decisions: [
    { id: "d1", kind: "Money", title: "Return 640 strips of Gluconorm-G2 to Lupin", context: "Batch GLG2-4471 expires Jan 2027. Lupin takes returns from 3 months before expiry at 90% of PTR, and its October return cycle closes on 31 Oct. At current sell-through 640 of the 1,100 strips will be left.", recommendation: "Raise the return for 640 today; keep 460 for City A chemists who reorder weekly.", impact: "≈ ₹68k credit note protected", from: "Expiry Watch", module: "stock", approveLabel: "Raise return", tone: "warn" },
    { id: "d2", kind: "Approve", title: "Push Taxim-O 200 to 96 chemists with 10+1", context: "Alkem batch TXO-3392 has 4.1 months left and 1,500 strips (₹1.31 L at PTR). Alkem opens returns only at 3 months; our pace clears about 900 by then.", recommendation: "Run 10+1 free for City A, City B and Dewas for 10 days. Alkem's October liquidation scheme reimburses half the free goods.", impact: "≈ ₹52k of stock saved from expiry", from: "Expiry Watch", module: "stock", approveLabel: "Start push" },
    { id: "d3", kind: "Risk", title: "Put Shree Ganesh Medical, Dewas on credit hold", context: "₹3.42 L outstanding against a ₹3 L limit, oldest bill 78 days, two cheques bounced in September (₹48,200 and ₹31,650). Their ₹62k order SPD-O-8842 is in picking.", recommendation: "Hold new credit. Release today's order against a ₹1 L RTGS; Sunil Parmar collects the bounced amount.", impact: "₹62k exposure avoided", from: "Credit Guard", module: "credit", approveLabel: "Hold & call", tone: "late" },
    { id: "d4", kind: "Risk", title: "Fridge F3 hit 9.4 °C for 22 minutes at 3:10 AM", context: "Insulin fridge B holds 960 Mixtard 30 Penfill cartridges and 240 Lantus SoloStar pens. Power cut at 3:04 AM; the inverter changeover failed for 18 minutes.", recommendation: "Quarantine both batches and send the LogTag file to Novo Nordisk and Sanofi for a stability opinion. Both usually clear short excursions below 25 °C.", impact: "₹2.8 L stock at stake", from: "Cold Sentinel", module: "cold", approveLabel: "Quarantine & send", tone: "late" },
    { id: "d5", kind: "Approve", title: "File drug licence renewal, Form 20B and 21B", context: "Both licences expire on 12 Nov, 23 days away. The MP FDA portal needs Neha Dubey's competent-person affidavit, the godown rent agreement and ₹6,000 challan each.", recommendation: "File today. FDA Indore is taking 15–18 days for inspection this quarter.", from: "Compliance Clerk", module: "compliance", approveLabel: "Start filing" },
    { id: "d6", kind: "Money", title: "Mankind free-goods claim is 118 days old", context: "₹2.64 L for July–August Manforce and Prega News 12+2. Mankind's area manager says 14 invoices in the statement had no retailer GSTIN.", recommendation: "Re-submit with the 14 invoices corrected from Marg and ask the RSM for a credit note by 31 Oct.", impact: "₹2.64 L recovery", from: "Claim Chaser", module: "schemes", approveLabel: "Re-submit claim" },
    { id: "d7", kind: "Approve", title: "Send ₹6.4 L PO to Sun Pharma for 3 shortages", context: "Pantocid DSR has been out for 3 days and 41 chemist orders were short-supplied. Rosuvas 20 and Glycomet GP 1 are under 2 days of cover.", recommendation: "Send before 4 PM; Sun's C&F in Pithampur dispatches next morning.", impact: "62 short lines filled", from: "Ravi Choudhary", module: "stock", approveLabel: "Send PO" },
    { id: "d8", kind: "Reply", title: "Malwa Multispeciality wants a rate contract for 38 molecules", context: "₹11.6 L outstanding, pays in 52 days on 60-day terms. Their purchase head wants PTR −6% for a year.", recommendation: "Offer PTR −4% with 45-day credit; exclude cold chain and H1 items.", from: "Amit Patidar", module: "orders" },
  ],
  agenda: [
    { at: 9.5, title: "Van loading, City A and B", detail: "79 orders across two vans", tone: "info", count: 79, module: "orders" },
    { at: 11, title: "Return window review", detail: "Lupin and Alkem batches under 3 months", tone: "warn", count: 9, module: "stock" },
    { at: 12.5, title: "Credit call: Dewas chemists", detail: "Shree Ganesh Medical, Life Line", tone: "late", module: "credit" },
    { at: 15.5, title: "Sun Pharma PO cut-off", detail: "C&F Pithampur, next-day dispatch", tone: "accent", module: "stock" },
    { at: 17, title: "Mankind RSM visit", detail: "₹3.96 L claims, Manforce target", tone: "neutral", module: "schemes" },
    { at: 19.5, title: "Day close", detail: "Collections, H1 register, e-way bills", tone: "neutral", module: "compliance" },
  ],
  activity: [
    { time: "10:52 AM", text: "H1 sale logged: 60 strips Taxim-O to Rathi Drug House", tone: "info" },
    { time: "10:41 AM", text: "Mahesh Yadav booked a 34-line order at Jain Medical Agencies", tone: "ok" },
    { time: "10:20 AM", text: "Credit Guard parked Nayak Medicos order, 96 days overdue", tone: "late" },
    { time: "9:58 AM", text: "Torrent credit note ₹67,200 matched in Tally", tone: "ok" },
    { time: "9:15 AM", text: "Cipla inward truck left the C&F, 46 lines, ETA 4 PM", tone: "info" },
    { time: "3:12 AM", text: "Cold Sentinel opened EX-311 on F3 and called Imran", tone: "warn" },
  ],
  asks: [
    { q: "Which batches will expire before we can sell them?", a: "At current sell-through, 7 batches will be left with stock at expiry:\n\n• Lupin Gluconorm-G2 GLG2-4471: 640 strips, Lupin cut-off in 11 days (90% CN)\n• Sun Pantocid 40 PTC8840: 520 strips, return now at 100%\n• Alkem Clavam 625 CLV5520: 410 strips, return now at 100%\n• Torrent Deplatt-A 75 DPA5512: 560 strips, return now\n• Intas Glimisave M2: 300 strips, return now\n• Sanofi Lantus SoloStar: 90 pens, also under excursion review\n• Abbott Digene Gel: 330 bottles, Abbott window is only 1 month\n\nReturning all seven now recovers about ₹4.1 L in credit notes. Click any rose blip on the Expiry radar to raise it.", sources: ["Marg batch stock", "Company return policies", "90-day sell-through"] },
    { q: "Who should go on credit hold this week?", a: "Four chemists cross two of our three rules (over limit, over 60 days, a bounced cheque):\n\n• Shree Ganesh Medical, Dewas: ₹3.42 L vs ₹3 L, 78 days, 2 bounces\n• Gupta Nursing Home, Dhar: 91% used, 67 days, 1 bounce\n• Nayak Medicos, Khargone: already on hold, 96 days\n• Kothari Medical, Ujjain: already on hold, 71 days\n\nMahakal Medical Hall is close (93% used, 44 days) but pays every fortnight. I would watch, not hold.", sources: ["Tally ledgers", "Marg credit limits", "Bank return memos"] },
    { q: "How much scheme money are companies holding back?", a: "₹11.2 L across 12 open claims:\n\n• Disputed: ₹2.77 L (Mankind ₹2.64 L, Zydus breakage ₹12,900)\n• Company review: ₹2.82 L (Glenmark, Lupin)\n• Submitted: ₹3.01 L (Cipla, Sun, Alkem)\n• Prepared, not sent: ₹2.37 L (Manforce Sep, Digene, Foracort return)\n\nThe credit notes that did arrive this month were short by ₹19,170 in total, mostly DRL and Lupin deducting 10% handling.", sources: ["Claims register", "Tally credit notes", "Company DMS"] },
    { q: "Was the F3 insulin excursion serious?", a: "Probably not, but it needs the company's word before we sell.\n\n• Peak 9.4 °C, 22 minutes above 8 °C, never above 10 °C\n• Novo Nordisk and Sanofi both allow short excursions up to 25 °C for insulin in use, but unopened stock needs a written stability note\n• Stock inside: 960 Mixtard Penfill (₹1.35 L) and 240 Lantus SoloStar (₹1.48 L)\n\nRoot cause is the inverter changeover on F3's circuit. It also failed on Saturday. An electrician is booked for 4 PM.", sources: ["LogTag TRIX-8 #44127", "Novo cold chain SOP", "Excursion log"] },
    { q: "What do I need for the drug licence renewal?", a: "For Form 20B and 21B on the MP FDA online portal:\n\n1. Competent person affidavit, Neha Dubey (B.Pharm, MPPC 21876)\n2. Godown rent agreement, valid till Mar 2028 ✓\n3. Refrigerator and cold room list with logger certificates ✓\n4. Challan of ₹6,000 per form\n5. Fire NOC, which expires on 29 Oct, so renew that first\n\nInspection is running 15–18 days in Indore, so file this week to stay inside the 12 Nov expiry.", sources: ["Licence register", "MP FDA circular, Aug 2026"] },
    { q: "Draft a WhatsApp scheme push for Taxim-O", a: "Draft (not sent):\n\n\"Namaste! Sahyog Pharma se: Alkem Taxim-O 200 par 10+1 free, sirf 31 Oct tak. Batch TXO-3392, expiry Feb 2027. Order ke liye reply karein ya apne salesman ko bolein. Same-day delivery Indore city, next-day Dewas aur Ujjain. 🙏\"\n\nGoing to 96 chemists who bought cefixime in the last 60 days. Expected uptake about 600 strips in 10 days.", sources: ["Scheme SC-40", "Marg sale history"] },
  ],
  run: {
    label: "Runs at 7 AM and 2 PM every day. You can also run it now.",
    title: "Expiry & return sweep",
    steps: [
      { text: "Read every batch from Marg with stock above zero", result: "21,400 batches, 312 under 6 months" },
      { text: "Compare each against its company's return window", result: "9 inside the window now, 4 closing this month" },
      { text: "Project sell-through from 90 days of chemist sales", result: "7 batches will be left with stock" },
      { text: "Pick the cheaper exit: scheme push or credit note", result: "3 pushes, 4 returns" },
      { text: "Draft return lists, debit notes and WhatsApp offers", result: "4 debit notes, 3 offers to 211 chemists" },
    ],
    outcome: "Returning 4 batches and pushing 3 with schemes recovers about ₹4.1 L that would otherwise go to destruction, and keeps Lupin's 11-day window from closing on us.",
    actions: ["Raise Lupin Gluconorm return", "Start Taxim-O 10+1 push", "Send Cipla Foracort expiry claim", "Message godown to pull stock"],
  },
  signature: {
    title: "Expiry radar",
    sub: "Every batch in the godown, placed by months to expiry and sized by stock value. Click a blip to return it or push it to retailers.",
    module: "stock",
    render: () => <ExpiryRadar />,
  },
  homeExtras: () => <HomeExtras />,
};

/* ============================================================
   Desk
   ============================================================ */

const modules: DeskModule[] = [
  { id: "orders", group: "Sell & move", label: "Orders", count: 3, title: "Orders", blurb: "Chemist orders from salesmen, WhatsApp, PharmaRack and phone, from credit check to POD", icon: ShoppingCart, notes: ["Drag a card or press Next to move it through pick, pack and dispatch.", "Orders from chemists on credit hold are parked automatically.", "Click any order for its lines and batches."], render: () => <OrdersModule /> },
  { id: "stock", group: "Sell & move", label: "Stock & batches", count: 7, title: "Stock & batches", blurb: "FEFO batches, near-expiry returns, shortages and purchase orders to companies", icon: Boxes, notes: ["Batches are sorted earliest expiry first, the order the scanner picks them.", "Add a shortage to a PO; one draft per company."], render: () => <StockModule /> },
  { id: "schemes", group: "Money", label: "Schemes & claims", count: 2, title: "Schemes & claims", blurb: "Company schemes running with chemists, every claim until the credit note lands, and reconciliation", icon: BadgePercent, render: () => <SchemesModule /> },
  { id: "credit", group: "Money", label: "Chemist credit", count: 4, title: "Chemist credit", blurb: "Limits, ageing, holds and collections for every chemist, nursing home and hospital", icon: Wallet, render: () => <CreditModule /> },
  { id: "cold", group: "Quality", label: "Cold chain", count: 1, title: "Cold chain", blurb: "Vaccine and insulin fridges with live temperature, data-logger history and excursions", icon: Snowflake, render: () => <ColdModule /> },
  { id: "compliance", group: "Quality", label: "Compliance", count: 3, title: "Compliance", blurb: "Drug licences, Schedule H1 register, GST filings and e-way bills", icon: ShieldCheck, render: () => <ComplianceModule /> },
  { id: "team", group: "Business", label: "People", title: "People", blurb: "Godown, dispatch, sales, credit and compliance: who is carrying what today", icon: Users, render: () => <PeopleModule members={team} /> },
  { id: "agents", group: "Business", label: "Agents", title: "Agents", blurb: "Six AI agents watching expiry, orders, claims, credit, fridges and licences", icon: Timer, render: () => <AgentsModule agents={agents} /> },
  { id: "independence", group: "Business", label: "Independence", title: "Owner independence", blurb: "How much of Sahyog runs without Sanjay on the phone", icon: GaugeIcon, render: () => <IndependenceModule data={independence} /> },
  { id: "connections", group: "Business", label: "Connections", title: "Connections", blurb: "Marg, Tally, PharmaRack, e-way bill, IRP and fridge loggers", icon: Send, render: () => <ConnectionsModule items={integrations} /> },
];

export default function PharmaDistributionDesk() {
  const [batches, setBatches] = React.useState(BATCH_SEED);
  const [holds, setHolds] = React.useState<Set<string>>(() => new Set(chemistsSeed.filter((c) => c.status === "Hold").map((c) => c.id)));
  const update = React.useCallback((id: string, patch: Partial<Batch>) => {
    setBatches((cur) => cur.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }, []);
  const toggleHold = React.useCallback((id: string, on: boolean) => {
    setHolds((cur) => {
      const next = new Set(cur);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);
  const value = React.useMemo(() => ({ batches, update, holds, toggleHold }), [batches, update, holds, toggleHold]);
  return (
    <PharmaCtx.Provider value={value}>
      <DeskShell config={config} modules={modules} />
    </PharmaCtx.Provider>
  );
}

const smallSelect = "h-8 rounded-[8px] border border-d-line bg-d-panel px-2 text-[12.5px] text-d-ink outline-none focus:border-d-accent";

/* ---------------- Signature: Expiry radar ---------------- */

const RADAR_CSS = `
@keyframes pdx-sweep { to { transform: rotate(360deg); } }
@keyframes pdx-ping { 0% { opacity: .9; transform: scale(1); } 16% { opacity: 0; transform: scale(2.9); } 100% { opacity: 0; transform: scale(2.9); } }
@keyframes pdx-glow { 0% { opacity: 1; } 30% { opacity: .62; } 100% { opacity: .62; } }
.pdx-sweep { animation: pdx-sweep 6s linear infinite; }
.pdx-ping { opacity: 0; transform-box: fill-box; transform-origin: center; animation: pdx-ping 6s linear infinite; }
.pdx-glow { animation: pdx-glow 6s linear infinite; }
`;

function ExpiryRadar() {
  const { batches } = usePharma();
  const [co, setCo] = React.useState("All");
  const [div, setDiv] = React.useState<"All" | Division>("All");
  const [ring, setRing] = React.useState<number | null>(null);
  const [hover, setHover] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState<string | null>(null);

  const base = batches.filter((b) => (co === "All" || b.co === co) && (div === "All" || b.div === div));
  const match = (b: Batch) => base.includes(b) && (ring === null || ringOf(b.m) === ring);
  const ringStats = RINGS.map((r, i) => {
    const list = base.filter((b) => ringOf(b.m) === i);
    return { ...r, i, n: list.length, v: list.reduce((a, b) => a + bValue(b), 0) };
  });
  const under6 = base.filter((b) => b.m < 6 && b.m >= 0).reduce((a, b) => a + bValue(b), 0);
  const cnNow = base.filter((b) => eligibility(b).eligible && b.status === "In stock").reduce((a, b) => a + bValue(b), 0);
  const actList = base
    .filter((b) => b.m < 6 && b.status === "In stock")
    .sort((a, b) => unsoldOf(b) * b.ptr - unsoldOf(a) * a.ptr)
    .slice(0, 5);
  const hb = hover ? batches.find((b) => b.id === hover) : null;

  return (
    <div className="space-y-4">
      <style>{RADAR_CSS}</style>
      <div className="flex flex-wrap items-center gap-2">
        <select aria-label="Company" className={smallSelect} value={co} onChange={(e) => setCo(e.target.value)}>
          <option value="All">All 14 companies</option>
          {COS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <Segmented size="sm" options={["All", "Chronic", "Acute", "Cold chain", "OTC"] as const} value={div} onChange={setDiv} />
        {(co !== "All" || div !== "All" || ring !== null) && (
          <Btn
            size="sm"
            variant="ghost"
            icon={RotateCcw}
            onClick={() => {
              setCo("All");
              setDiv("All");
              setRing(null);
            }}
          >
            Clear
          </Btn>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {[
          { l: "Batches on radar", v: String(base.length), t: "var(--d-ink)" },
          { l: "Expiring < 6 months", v: inr(under6, { compact: true }), t: "#d94f6b" },
          { l: "Credit-note eligible now", v: inr(cnNow, { compact: true }), t: "var(--d-ok)" },
          { l: "Expired on shelf", v: inr(ringStats[0].v, { compact: true }), t: "#b83250" },
        ].map((k) => (
          <div key={k.l} className="rounded-[12px] bg-d-sunk/70 px-3 py-2">
            <p className="text-[11.5px] text-d-mute">{k.l}</p>
            <p className="desk-h tnum text-[19px] font-semibold leading-tight" style={{ color: k.t }}>
              {k.v}
            </p>
          </div>
        ))}
      </div>

      <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_250px]">
        <div className="relative mx-auto aspect-square w-full max-w-[540px]">
          <svg viewBox="0 0 560 560" className="absolute inset-0 h-full w-full">
            <defs>
              <radialGradient id="pdx-bg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#eaf2fa" />
              </radialGradient>
            </defs>
            <circle cx={C} cy={C} r={250} fill="url(#pdx-bg)" />
            {[...RINGS].reverse().map((r) => (
              <circle key={`band-${r.label}`} cx={C} cy={C} r={r.to} fill={r.band} stroke="color-mix(in oklab, var(--d-accent) 22%, transparent)" strokeWidth="1" />
            ))}
            {RINGS.map((r, i) => (
              <circle key={`hl-${r.label}`} cx={C} cy={C} r={(r.from + r.to) / 2} fill="none" stroke={r.color} strokeOpacity={ring === i ? 0.5 : 0} strokeWidth={r.to - r.from} />
            ))}
            {COS.map((c, ci) => {
              const a = polar(48, ci * SECTOR);
              const b = polar(250, ci * SECTOR);
              const t = polar(266, ci * SECTOR + SECTOR / 2);
              return (
                <g key={`sec-${c.id}`}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="color-mix(in oklab, var(--d-accent) 14%, transparent)" strokeWidth="1" strokeDasharray="2 4" />
                  <text x={t.x} y={t.y + 4} textAnchor="middle" fontSize="11.5" fontWeight={co === c.id ? 700 : 500} fill={co === c.id ? "var(--d-accent)" : "var(--d-mute)"} className="cursor-pointer" onClick={() => setCo(co === c.id ? "All" : c.id)}>
                    {c.short}
                  </text>
                </g>
              );
            })}
            {RINGS.slice(1).map((r) => (
              <text key={`rl-${r.label}`} x={C + 5} y={C - r.to + 13} fontSize="10" fill={r.color} fontWeight="700" stroke="#fff" strokeWidth="3" paintOrder="stroke" pointerEvents="none">
                {r.label}
              </text>
            ))}
            <text x={C} y={C + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#b83250" opacity="0.8">
              EXPIRED
            </text>
          </svg>

          <div className="pointer-events-none absolute overflow-hidden rounded-full" style={{ left: "5.357%", top: "5.357%", width: "89.286%", height: "89.286%" }}>
            <div className="pdx-sweep absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 0deg, transparent 0deg, transparent 280deg, rgba(31,111,178,0.04) 300deg, rgba(31,111,178,0.3) 359deg, transparent 360deg)" }}>
              <span className="absolute left-1/2 top-0 h-1/2 w-[2px] -translate-x-1/2" style={{ background: "linear-gradient(to bottom, rgba(31,111,178,0.9), rgba(31,111,178,0.1))" }} />
            </div>
          </div>

          <svg viewBox="0 0 560 560" className="absolute inset-0 h-full w-full">
            {batches.map((b) => {
              const r = radiusOf(b.m);
              const deg = BLIP[b.id]?.deg ?? 0;
              const p = polar(r, deg);
              const size = round2(4 + Math.sqrt(bValue(b) / MAXV) * 11);
              const color = RINGS[ringOf(b.m)].color;
              const on = match(b);
              const delay = `${round2((deg / 360) * 6)}s`;
              return (
                <g
                  key={b.id}
                  opacity={on ? 1 : 0.13}
                  className="cursor-pointer"
                  onClick={() => setOpen(b.id)}
                  onMouseEnter={() => setHover(b.id)}
                  onMouseLeave={() => setHover((h) => (h === b.id ? null : h))}
                >
                  <title>{`${b.product} · ${coById(b.co).short} · ${b.batch} · exp ${expLabel(b.m)}`}</title>
                  {on && <circle className="pdx-ping" cx={p.x} cy={p.y} r={size} fill="none" stroke={color} strokeWidth="2" style={{ animationDelay: delay }} />}
                  <circle className={on ? "pdx-glow" : undefined} cx={p.x} cy={p.y} r={size} fill={color} fillOpacity={b.status === "Return raised" ? 0.15 : 0.85} stroke={hover === b.id || open === b.id ? "var(--d-ink)" : "#fff"} strokeWidth={hover === b.id || open === b.id ? 2.5 : 1.5} style={{ animationDelay: delay }} />
                  {b.status === "Scheme push" && <circle cx={p.x} cy={p.y} r={size + 4} fill="none" stroke="var(--d-accent)" strokeWidth="1.6" strokeDasharray="3 2.5" />}
                  {b.status === "Quarantined" && (
                    <path d={`M${round2(p.x - size * 0.5)},${round2(p.y - size * 0.5)} L${round2(p.x + size * 0.5)},${round2(p.y + size * 0.5)} M${round2(p.x + size * 0.5)},${round2(p.y - size * 0.5)} L${round2(p.x - size * 0.5)},${round2(p.y + size * 0.5)}`} stroke="#fff" strokeWidth="2" />
                  )}
                </g>
              );
            })}
          </svg>

          {hb && (
            <div className="pointer-events-none absolute bottom-1 left-1 max-w-[230px] rounded-[12px] border border-d-line bg-d-panel/95 px-3 py-2 text-[12px] shadow-lg">
              <p className="font-semibold leading-tight">{hb.product}</p>
              <p className="text-d-mute">
                {coById(hb.co).name} · <span className="font-mono">{hb.batch}</span>
              </p>
              <p className="mt-1 flex justify-between gap-3 font-mono text-[11.5px]">
                <span>exp {expLabel(hb.m)}</span>
                <span>{inr(bValue(hb), { compact: true })}</span>
              </p>
              <p className="mt-0.5 text-[11.5px]" style={{ color: `var(--d-${eligibility(hb).tone === "neutral" ? "mute" : eligibility(hb).tone})` }}>
                {eligibility(hb).short}
              </p>
            </div>
          )}
          <div className="pointer-events-none absolute bottom-1 right-1 rounded-full bg-d-panel/90 px-2.5 py-1 text-[10.5px] text-d-mute">
            blip size = stock value · <span className="text-d-accent">◌</span> scheme push
          </div>
        </div>

        <div className="min-w-0 space-y-4">
          <div>
            <p className="mb-2 text-[11.5px] font-medium uppercase tracking-[0.1em] text-d-mute">Rings · click to isolate</p>
            <ul className="space-y-1">
              {ringStats.map((r) => (
                <li key={r.label}>
                  <button
                    type="button"
                    onClick={() => setRing(ring === r.i ? null : r.i)}
                    className="flex w-full items-center gap-2 rounded-[10px] px-2 py-1.5 text-left text-[12.5px] transition-colors hover:bg-d-sunk"
                    style={{ background: ring === r.i ? "color-mix(in oklab, var(--d-accent) 10%, transparent)" : undefined }}
                  >
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: r.color }} />
                    <span className="min-w-0 flex-1 font-medium">{r.label}</span>
                    <span className="font-mono text-[11px] text-d-mute">{r.n}</span>
                    <span className="tnum w-[64px] text-right font-mono text-[11.5px]">{inr(r.v, { compact: true })}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-[11.5px] font-medium uppercase tracking-[0.1em] text-d-mute">Act this week · unsold at expiry</p>
            {actList.length === 0 ? (
              <p className="text-[12.5px] text-d-ok">Nothing at risk in this filter.</p>
            ) : (
              <ul className="space-y-1.5">
                {actList.map((b) => {
                  const e = eligibility(b);
                  return (
                    <li key={b.id}>
                      <button type="button" onClick={() => setOpen(b.id)} className="w-full rounded-[10px] border border-d-line px-2.5 py-1.5 text-left hover:border-d-accent">
                        <p className="flex items-center justify-between gap-2 text-[12.5px] font-medium">
                          <span className="truncate">{b.product}</span>
                          <span className="shrink-0 font-mono text-[11px] text-d-mute">{expLabel(b.m)}</span>
                        </p>
                        <p className="flex items-center justify-between gap-2 text-[11.5px] text-d-mute">
                          <span>
                            {coById(b.co).short} · {Math.round(unsoldOf(b))} unsold
                          </span>
                          <Pill tone={e.tone}>{e.short}</Pill>
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
      <BatchSheet id={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function BatchSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const desk = useDesk();
  const { batches, update } = usePharma();
  const [push, setPush] = React.useState(false);
  const b = id ? batches.find((x) => x.id === id) ?? null : null;
  const c = b ? coById(b.co) : null;
  const e = b ? eligibility(b) : null;
  const vel = b ? velocityOf(b) : 0;
  const unsold = b ? Math.round(unsoldOf(b)) : 0;

  function act(status: BatchStatus, msg: string, desc: string, tone: Tone = "info") {
    if (!b) return;
    update(b.id, { status });
    toast.success(msg, { description: desc });
    desk.log(msg, tone);
  }

  return (
    <Sheet
      open={!!b}
      onOpenChange={(o) => !o && onClose()}
      eyebrow={b && c ? `${c.name} · ${b.div} · rack ${b.rack}` : ""}
      title={b ? b.product : ""}
      sub={b ? `Batch ${b.batch} · ${b.pack} · expiry ${expLabel(b.m)}` : ""}
      width={540}
      footer={
        b && (
          <>
            {b.m < 0 && b.status !== "Quarantined" && (
              <Btn icon={Lock} onClick={() => act("Quarantined", `${b.product} ${b.batch} moved to expiry rack`, "Blocked for billing in Marg", "warn")}>
                Quarantine
              </Btn>
            )}
            {e?.eligible && b.status !== "Return raised" && (
              <Btn icon={RotateCcw} onClick={() => act("Return raised", `Return raised: ${b.product} ${b.batch}`, `Debit note to ${c?.name} for ${inr(Math.round(bValue(b) * ((c?.pct ?? 100) / 100)))}`, "ok")}>
                Raise return / CN
              </Btn>
            )}
            {b.m >= 0 && (
              <Btn variant="solid" icon={Send} onClick={() => setPush(true)}>
                Push to retailers with scheme
              </Btn>
            )}
          </>
        )
      }
    >
      {b && c && e && (
        <div className="space-y-5">
          <div className="rounded-[12px] border px-3.5 py-3" style={{ borderColor: `color-mix(in oklab, var(--d-${e.tone === "neutral" ? "line" : e.tone}) 45%, transparent)`, background: `color-mix(in oklab, var(--d-${e.tone === "neutral" ? "sunk" : e.tone}) 8%, transparent)` }}>
            <p className="flex items-center gap-2 text-[13.5px] font-semibold">
              {e.eligible ? <CheckCircle2 className="h-4 w-4 text-d-ok" /> : <CalendarClock className="h-4 w-4 text-d-info" />}
              {e.label}
            </p>
            <p className="mt-1 text-[12.5px] text-d-mute">
              {c.name} takes near-expiry returns {c.window} month{c.window > 1 ? "s" : ""} before expiry{c.post ? ` and up to ${c.post} months after` : ", none after"}, at {c.pct}% of PTR as a credit note via {c.cnf}.
            </p>
          </div>
          <KV
            cols={3}
            items={[
              { k: "MRP", v: inr(b.mrp) },
              { k: "PTR", v: `₹${b.ptr.toFixed(2)}` },
              { k: "Months left", v: b.m < 0 ? `expired ${Math.abs(b.m).toFixed(1)} mo ago` : b.m.toFixed(1) },
              { k: "Stock", v: `${b.qty.toLocaleString("en-IN")} units` },
              { k: "Stock value", v: inr(bValue(b)) },
              { k: "Status", v: <Pill tone={statusTone[b.status]}>{b.status}</Pill> },
            ]}
          />
          <div>
            <p className="mb-1.5 text-[12px] font-medium text-d-mute">Sell-through before expiry</p>
            <Meter value={b.qty - unsold} max={b.qty} tone={unsold > b.qty * 0.4 ? "late" : unsold > 0 ? "warn" : "ok"} height={8} />
            <p className="mt-1.5 text-[12.5px]">
              Sells about <b>{vel.toLocaleString("en-IN")}</b> a month. {b.m < 0 ? "Already past expiry." : unsold > 0 ? <>At this pace <b className="text-d-late">{unsold.toLocaleString("en-IN")}</b> will be left at expiry, worth {inr(unsold * b.ptr, { compact: true })}.</> : "Will sell out before expiry."}
            </p>
          </div>
          {b.scheme && (
            <p className="rounded-[10px] bg-d-soft px-3 py-2 text-[12.5px] text-d-accent">
              Scheme running: <b>{b.scheme}</b>
            </p>
          )}
          <div>
            <p className="mb-2 text-[12px] font-medium text-d-mute">Top buyers of this batch, last 60 days</p>
            <ul className="divide-y divide-d-line rounded-[10px] border border-d-line">
              {chemistsSeed.slice(Number(b.id.slice(1)) % 6, (Number(b.id.slice(1)) % 6) + 4).map((ch, i) => (
                <li key={ch.id} className="flex items-center justify-between px-3 py-2 text-[12.5px]">
                  <span>
                    {ch.name} <span className="text-d-mute">· {ch.town}</span>
                  </span>
                  <span className="font-mono text-d-mute">{Math.round(vel * (0.32 - i * 0.06))}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {push && b && (
        <PushModal
          batch={b}
          onClose={() => setPush(false)}
          onDone={(scheme, reach, qty) => {
            update(b.id, { status: "Scheme push", scheme });
            setPush(false);
            toast.success(`${scheme} on ${b.product} sent to ${reach} retailers`, { description: `Target ${qty.toLocaleString("en-IN")} units in 10 days. WhatsApp and salesman app.` });
            desk.log(`Scheme push: ${b.product} ${b.batch}, ${scheme} to ${reach} retailers`, "info");
          }}
        />
      )}
    </Sheet>
  );
}

const SEGMENTS = [
  { id: "cityA", label: "Indore City A chemists", n: 212 },
  { id: "cityB", label: "Indore City B chemists", n: 198 },
  { id: "nh", label: "Nursing homes & hospitals", n: 64 },
  { id: "dewas", label: "Dewas & Ujjain", n: 188 },
  { id: "rural", label: "Dhar, Khargone & Barwani", n: 151 },
];
const SCHEMES = [
  { id: "10+1 free", cost: 1 / 11 },
  { id: "15+3 free", cost: 3 / 18 },
  { id: "Extra 8% off PTR", cost: 0.08 },
  { id: "Net rate PTR −12%", cost: 0.12 },
];

function PushModal({ batch, onClose, onDone }: { batch: Batch; onClose: () => void; onDone: (scheme: string, reach: number, qty: number) => void }) {
  const [scheme, setScheme] = React.useState(SCHEMES[0].id);
  const [segs, setSegs] = React.useState<Set<string>>(new Set(["cityA", "dewas"]));
  const [qty, setQty] = React.useState(String(Math.max(50, Math.round(unsoldOf(batch) || batch.qty * 0.4))));
  const c = coById(batch.co);
  const reach = SEGMENTS.filter((s) => segs.has(s.id)).reduce((a, s) => a + s.n, 0);
  const n = Math.min(Number(qty) || 0, batch.qty);
  const cost = Math.round(n * batch.ptr * (SCHEMES.find((s) => s.id === scheme)?.cost ?? 0));
  const writeOff = Math.round(n * batch.ptr * (1 - c.pct / 100) + (batch.m > c.window ? n * batch.ptr * 0.15 : 0));
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title={`Push ${batch.product} to retailers`} sub={`${c.name} · batch ${batch.batch} · expiry ${expLabel(batch.m)} · ${batch.qty.toLocaleString("en-IN")} in stock`}>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!reach || n < 1) {
            toast.error(!reach ? "Pick at least one retailer group" : "Enter a quantity");
            return;
          }
          onDone(scheme, reach, n);
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Scheme">
            <select className={inputClass} value={scheme} onChange={(e) => setScheme(e.target.value)}>
              {SCHEMES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Units to clear">
            <input className={inputClass} inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))} />
          </Field>
        </div>
        <div>
          <p className="mb-1.5 text-[12px] font-medium text-d-mute">Send to</p>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {SEGMENTS.map((s) => (
              <label key={s.id} className="flex cursor-pointer items-center gap-2 rounded-[10px] border border-d-line px-2.5 py-2 text-[12.5px] hover:bg-d-sunk">
                <input
                  type="checkbox"
                  checked={segs.has(s.id)}
                  onChange={(e) =>
                    setSegs((cur) => {
                      const next = new Set(cur);
                      if (e.target.checked) next.add(s.id);
                      else next.delete(s.id);
                      return next;
                    })
                  }
                  className="accent-[var(--d-accent)]"
                />
                <span className="min-w-0 flex-1">{s.label}</span>
                <span className="font-mono text-[11px] text-d-mute">{s.n}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-[12px] bg-d-sunk/70 p-3 text-[12px]">
          <div>
            <p className="text-d-mute">Retailers</p>
            <p className="desk-h text-[17px] font-semibold">{reach}</p>
          </div>
          <div>
            <p className="text-d-mute">Scheme cost</p>
            <p className="desk-h text-[17px] font-semibold text-d-accent">{inr(cost, { compact: true })}</p>
          </div>
          <div>
            <p className="text-d-mute">Loss if left to expire</p>
            <p className="desk-h text-[17px] font-semibold text-d-late">{inr(writeOff, { compact: true })}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="solid" type="submit" icon={Send}>
            Send on WhatsApp & app
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Home extras ---------------- */

const INCOMING = [
  { who: "Rathi Drug House", text: "26 lines · Pan 40, Telma 40, Rosuvas 10", src: "Salesman app" },
  { who: "Kothari Medical", text: "9 lines · parked, account on hold", src: "WhatsApp" },
  { who: "Om Sai Medical", text: "14 lines · Shelcal, Volini, Digene", src: "PharmaRack" },
  { who: "Life Line Nursing Home", text: "Cold box: 40 Mixtard, 12 Lantus", src: "Phone" },
  { who: "Arihant Medicos", text: "18 lines · Taxim-O 10+1 taken", src: "WhatsApp" },
  { who: "Patidar Medical", text: "22 lines · Glimisave, Gluconorm", src: "Salesman app" },
];

function HomeExtras() {
  const desk = useDesk();
  const [feed, setFeed] = React.useState(() =>
    [
      { time: "10:52 AM", who: "Jain Medical Agencies", text: "34 lines · ₹48,260 · Salesman app", tone: "ok" as Tone },
      { time: "10:38 AM", who: "Arihant Medicos", text: "22 lines · ₹31,480 · PharmaRack", tone: "info" as Tone },
      { time: "10:30 AM", who: "Malwa Multispeciality", text: "61 lines · ₹1.86 L · cold + H1", tone: "accent" as Tone },
      { time: "10:12 AM", who: "Mahakal Medical Hall", text: "18 lines · ₹22,740 · WhatsApp", tone: "ok" as Tone },
    ],
  );
  React.useEffect(() => {
    let n = 0;
    const id = window.setInterval(() => {
      const item = INCOMING[n % INCOMING.length];
      n += 1;
      const time = new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }).toUpperCase();
      setFeed((cur) => [{ time, who: item.who, text: `${item.text} · ${item.src}`, tone: (item.text.includes("hold") ? "late" : "ok") as Tone }, ...cur].slice(0, 7));
    }, 5200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel icon={Truck} title="Route vans today" sub="Orders loaded against van capacity" action={<Btn size="sm" variant="ghost" icon={ArrowRight} onClick={() => desk.goTab("orders")}>Orders</Btn>}>
        <ul className="space-y-3">
          {ROUTES.map((r) => (
            <li key={r.id}>
              <div className="mb-1 flex items-center justify-between gap-2 text-[12.5px]">
                <span className="min-w-0 truncate font-medium">
                  {r.name} <span className="font-normal text-d-mute">· {r.departs}</span>
                </span>
                <span className="shrink-0 font-mono text-[11.5px] text-d-mute">
                  {r.base}/{r.cap} · <Countdown compact inHours={r.inH} />
                </span>
              </div>
              <Meter value={r.base} max={r.cap} tone={r.base / r.cap > 0.85 ? "late" : r.base / r.cap > 0.6 ? "accent" : "info"} />
            </li>
          ))}
        </ul>
      </Panel>
      <Panel live title="Orders as they land" sub="Salesman app, WhatsApp, PharmaRack and phone">
        <Feed items={feed} />
      </Panel>
    </div>
  );
}

/* ---------------- Orders ---------------- */

function OrdersModule() {
  const desk = useDesk();
  const { holds } = usePharma();
  const [orders, setOrders] = React.useState(ordersSeed);
  const [open, setOpen] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);
  const o = orders.find((x) => x.id === open) ?? null;
  const today = orders.filter((x) => !x.at.startsWith("Yesterday"));
  const value = today.reduce((a, x) => a + x.value, 0);
  const bySource = (["Salesman app", "WhatsApp", "PharmaRack", "Phone"] as Source[]).map((s) => ({ s, n: { "Salesman app": 196, WhatsApp: 62, PharmaRack: 118, Phone: 36 }[s] + orders.filter((x) => x.source === s && x.at === "Just now").length }));

  function move(id: string, col: OrderCol) {
    const ord = orders.find((x) => x.id === id);
    if (!ord || ord.col === col) return;
    const ch = chemistsSeed.find((c) => c.name === ord.retailer);
    if (ch && holds.has(ch.id) && col !== "received") {
      toast.error(`${ord.retailer} is on credit hold`, { description: "Release the hold in Chemist credit or take payment first." });
      return;
    }
    setOrders((cur) => cur.map((x) => (x.id === id ? { ...x, col } : x)));
    const label = orderCols.find((c) => c.id === col)?.label ?? col;
    toast.success(`${ord.id} → ${label}`, { description: `${ord.retailer}, ${ord.town}` });
    desk.log(`${ord.id} ${ord.retailer} moved to ${label}`, col === "delivered" ? "ok" : "info");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Orders today" value={412 + orders.length - ordersSeed.length} delta="+8%" hint="vs last Tuesday" icon={ShoppingCart} trend={[344, 361, 372, 390, 381, 398, 412]} />
        <Stat label="Order value today" value={inr(3864000 + value - SEED_TODAY, { compact: true })} delta="+11%" hint="avg ₹9,380" icon={IndianRupee} tone="info" trend={[29, 31, 33, 35, 34, 37, 38.6]} />
        <Stat label="Fill rate" value="96.2%" delta="-0.9%" hint="62 lines short today" icon={PackageCheck} tone="warn" trend={[97.4, 97.1, 97.3, 96.9, 96.8, 96.5, 96.2]} />
        <Stat label="Order to dispatch" value="47 min" delta="-6 min" deltaGood={false} hint="median, city routes" icon={Timer} tone="ok" trend={[61, 58, 55, 54, 52, 53, 47]} />
      </div>
      <Panel title="Pick, pack, dispatch" sub="Drag a card across or press Next. Cold orders go into the staging chiller after packing." action={<Btn size="sm" variant="solid" icon={Plus} onClick={() => setAdding(true)}>New order</Btn>}>
        <Board
          columns={orderCols}
          items={orders}
          itemKey={(x) => x.id}
          getColumn={(x) => x.col}
          onMove={(k, c) => move(k, c as OrderCol)}
          minColumnWidth={210}
          renderCard={(x) => {
            const next = NEXT_COL[x.col];
            const ch = chemistsSeed.find((c) => c.name === x.retailer);
            const held = ch ? holds.has(ch.id) : false;
            return (
              <div>
                <p className="font-mono text-[10.5px] text-d-mute">
                  {x.id} · {x.at}
                </p>
                <button type="button" onClick={() => setOpen(x.id)} className="mt-0.5 block text-left text-[13px] font-semibold leading-tight hover:text-d-accent">
                  {x.retailer}
                </button>
                <p className="text-[11.5px] text-d-mute">
                  {x.town} · {routeName(x.route)}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1">
                  <Pill tone={sourceTone[x.source]}>{x.source}</Pill>
                  {x.cold && (
                    <Pill tone="info">
                      <Snowflake className="h-3 w-3" /> cold
                    </Pill>
                  )}
                  {x.h1 && <Pill tone="warn">H1</Pill>}
                  {held && <Pill tone="late">credit hold</Pill>}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="tnum font-mono text-[12px]">
                    {x.lines} lines · {inr(x.value, { compact: true })}
                  </span>
                  {next && (
                    <button type="button" onClick={() => move(x.id, next)} className="inline-flex items-center gap-0.5 rounded-full bg-d-soft px-2 py-0.5 text-[11px] font-medium text-d-accent hover:brightness-95">
                      Next <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          }}
        />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1fr_1.3fr]">
        <Panel title="Where orders come from" sub="Today, all routes">
          <Donut
            center={String(bySource.reduce((a, s) => a + s.n, 0))}
            sub="orders"
            segments={bySource.map((s) => ({ label: s.s, value: s.n, tone: sourceTone[s.s] === "neutral" ? "warn" : sourceTone[s.s] }))}
          />
        </Panel>
        <Panel title="Route vans" sub="Orders loaded per route, including the board above">
          <HBars
            data={ROUTES.map((r) => {
              const extra = orders.filter((x) => x.route === r.id && (x.col === "packed" || x.col === "dispatched")).length;
              return { label: r.name, value: r.base + extra, sub: `${r.departs} · ${r.van}`, tone: (r.base + extra) / r.cap > 0.85 ? ("late" as Tone) : ("accent" as Tone) };
            })}
            format={(v) => `${v} orders`}
            max={60}
            onSelect={(l) => toast(l, { description: ROUTES.find((r) => r.name === l)?.span })}
          />
        </Panel>
      </div>
      <Panel title="All orders" sub="Search a chemist or order number. Click a row for lines and batches.">
        <DataTable
          rows={orders}
          rowKey={(x) => x.id}
          search={(x) => `${x.id} ${x.retailer} ${x.town} ${x.salesman}`}
          searchPlaceholder="Search order, chemist, town or salesman"
          filter={{ get: (x) => x.source, options: ["Salesman app", "WhatsApp", "PharmaRack", "Phone"] }}
          onRow={(x) => setOpen(x.id)}
          bulk={[
            { label: "Print pick lists", run: (k) => { toast.success(`${k.length} FEFO pick lists sent to the godown printer`); desk.log(`${k.length} pick lists printed`); } },
            { label: "SMS dispatch details", run: (k) => { toast.success(`${k.length} chemists told their van and ETA`); desk.log(`Dispatch SMS to ${k.length} chemists`); } },
          ]}
          columns={[
            { key: "id", label: "Order", render: (x) => <span className="font-mono text-[12px]">{x.id}</span> },
            { key: "r", label: "Chemist", render: (x) => <span className="font-medium">{x.retailer}</span>, sort: (x) => x.retailer },
            { key: "t", label: "Town", render: (x) => <span className="text-d-mute">{x.town}</span> },
            { key: "s", label: "Source", render: (x) => <Pill tone={sourceTone[x.source]}>{x.source}</Pill> },
            { key: "sm", label: "Salesman", render: (x) => x.salesman },
            { key: "l", label: "Lines", align: "right", render: (x) => <span className="font-mono">{x.lines}</span>, sort: (x) => x.lines },
            { key: "v", label: "Value", align: "right", render: (x) => <span className="tnum font-mono">{inr(x.value)}</span>, sort: (x) => x.value },
            { key: "c", label: "Stage", render: (x) => { const c = orderCols.find((z) => z.id === x.col)!; return <Pill tone={c.tone}>{c.label}</Pill>; } },
          ]}
        />
      </Panel>
      <Sheet
        open={!!o}
        onOpenChange={(v) => !v && setOpen(null)}
        eyebrow={o ? `${o.id} · ${o.source} · ${o.at}` : ""}
        title={o?.retailer ?? ""}
        sub={o ? `${o.town} · ${o.kind} · ${routeName(o.route)} van` : ""}
        width={540}
        footer={
          o && (
            <>
              <Btn icon={Phone} onClick={() => { toast.success(`Calling ${o.salesman}`); desk.log(`Called ${o.salesman} about ${o.id}`); }}>
                Call salesman
              </Btn>
              {NEXT_COL[o.col] && (
                <Btn variant="solid" icon={ArrowRight} onClick={() => move(o.id, NEXT_COL[o.col]!)}>
                  Move to {orderCols.find((c) => c.id === NEXT_COL[o.col])?.label}
                </Btn>
              )}
            </>
          )
        }
      >
        {o && (
          <div className="space-y-5">
            <KV
              items={[
                { k: "Lines", v: o.lines },
                { k: "Value", v: inr(o.value) },
                { k: "Salesman", v: o.salesman },
                { k: "Stage", v: orderCols.find((c) => c.id === o.col)?.label },
                { k: "E-way bill", v: o.value > 50000 ? "Needed (over ₹50,000)" : "Not needed" },
                { k: "Handling", v: [o.cold ? "Cold box" : null, o.h1 ? "H1 register" : null].filter(Boolean).join(" · ") || "Standard" },
              ]}
            />
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Top lines, picked FEFO</p>
              <ul className="divide-y divide-d-line rounded-[10px] border border-d-line">
                {itemsFor(o).map((it) => (
                  <li key={it.key} className="flex items-center gap-3 px-3 py-2 text-[12.5px]">
                    <span className="min-w-0 flex-1">
                      <b>{it.product}</b> <span className="text-d-mute">· {it.co}</span>
                      <span className="block font-mono text-[11px] text-d-mute">
                        {it.batch} · exp {it.exp}
                      </span>
                    </span>
                    <span className="font-mono">×{it.qty}</span>
                  </li>
                ))}
              </ul>
              {o.lines > 5 && <p className="mt-1.5 text-[11.5px] text-d-mute">+ {o.lines - 5} more lines in Marg</p>}
            </div>
          </div>
        )}
      </Sheet>
      {adding && (
        <NewOrderModal
          onClose={() => setAdding(false)}
          onAdd={(ord) => {
            setOrders((cur) => [ord, ...cur]);
            setAdding(false);
            const ch = chemistsSeed.find((c) => c.name === ord.retailer);
            if (ch && holds.has(ch.id)) {
              toast.warning(`${ord.id} parked: ${ord.retailer} is on credit hold`, { description: "It stays in Received until the hold is released." });
              desk.log(`${ord.id} parked by Credit Guard, ${ord.retailer} on hold`, "late");
            } else {
              toast.success(`${ord.id} booked for ${ord.retailer}`, { description: `${ord.lines} lines · ${inr(ord.value)} · ${routeName(ord.route)} van` });
              desk.log(`New order ${ord.id} for ${ord.retailer}, ${inr(ord.value)}`, "ok");
            }
          }}
          nextNo={8852 + orders.length - ordersSeed.length}
        />
      )}
    </div>
  );
}

const routeOfTown = (town: string) => (town.includes("Dewas") ? "DW" : town.includes("Ujjain") ? "UJ" : town.includes("Dhar") || town.includes("Pithampur") ? "DH" : town.includes("Khargone") || town.includes("Barwani") ? "KB" : town.includes("Mhow") ? "MW" : town.includes("Vijay") || town.includes("Bhanwar") ? "CB" : "CA");

function NewOrderModal({ onClose, onAdd, nextNo }: { onClose: () => void; onAdd: (o: Order) => void; nextNo: number }) {
  const [chem, setChem] = React.useState(chemistsSeed[1].id);
  const [source, setSource] = React.useState<Source>("WhatsApp");
  const [lines, setLines] = React.useState("12");
  const [value, setValue] = React.useState("18500");
  const [cold, setCold] = React.useState(false);
  const ch = chemistsSeed.find((c) => c.id === chem)!;
  return (
    <Modal open onOpenChange={(v) => !v && onClose()} title="Book a chemist order" sub="Credit Guard checks the limit before the pick list prints.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const v = Number(value) || 0;
          if (v < 1) {
            toast.error("Enter the order value");
            return;
          }
          onAdd({ id: `SPD-O-${nextNo}`, retailer: ch.name, town: ch.town, kind: ch.kind, source, salesman: ch.salesman, lines: Number(lines) || 1, value: v, col: "received", route: routeOfTown(ch.town), at: "Just now", cold });
        }}
      >
        <Field label="Chemist">
          <select className={inputClass} value={chem} onChange={(e) => setChem(e.target.value)}>
            {chemistsSeed.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}, {c.town}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Source">
            <select className={inputClass} value={source} onChange={(e) => setSource(e.target.value as Source)}>
              {(["Salesman app", "WhatsApp", "PharmaRack", "Phone"] as Source[]).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Lines">
            <input className={inputClass} inputMode="numeric" value={lines} onChange={(e) => setLines(e.target.value.replace(/\D/g, ""))} />
          </Field>
          <Field label="Value ₹">
            <input className={inputClass} inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-[13px]">
          <input type="checkbox" checked={cold} onChange={(e) => setCold(e.target.checked)} className="accent-[var(--d-accent)]" /> Contains cold-chain items (insulin, vaccines)
        </label>
        <div className="rounded-[10px] bg-d-sunk/70 px-3 py-2 text-[12.5px]">
          Limit {inr(ch.limit, { compact: true })} · outstanding {inr(ch.out, { compact: true })} · oldest bill {ch.days} days ·{" "}
          <b className={ch.out + (Number(value) || 0) > ch.limit ? "text-d-late" : "text-d-ok"}>{ch.out + (Number(value) || 0) > ch.limit ? "goes over limit" : "within limit"}</b>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="solid" type="submit" icon={Plus}>
            Book order
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Stock & batches ---------------- */

function StockModule() {
  const desk = useDesk();
  const { batches, update } = usePharma();
  const [open, setOpen] = React.useState<string | null>(null);
  const [shorts, setShorts] = React.useState(shortagesSeed.map((s) => ({ ...s, onPO: false })));
  const [pos, setPos] = React.useState(poSeed);
  const [poOpen, setPoOpen] = React.useState<string | null>(null);
  const sorted = [...batches].sort((a, b) => a.m - b.m);
  const near = batches.filter((b) => b.m >= 0 && b.m < 3).reduce((a, b) => a + bValue(b), 0);
  const po = pos.find((p) => p.id === poOpen) ?? null;

  function addToPO(s: (typeof shorts)[number]) {
    const val = s.suggest * s.ptr;
    const draft = pos.find((p) => p.co === s.co && p.status === "Draft");
    if (draft) setPos((cur) => cur.map((p) => (p.id === draft.id ? { ...p, lines: p.lines + 1, value: p.value + val } : p)));
    else setPos((cur) => [{ id: `PO-2610-${119 + cur.length - poSeed.length}`, co: s.co, lines: 1, value: val, status: "Draft", eta: "—" }, ...cur]);
    setShorts((cur) => cur.map((x) => (x.id === s.id ? { ...x, onPO: true } : x)));
    toast.success(`${s.product} added to ${coById(s.co).name} PO`, { description: `${s.suggest.toLocaleString("en-IN")} units · ${inr(val, { compact: true })}` });
    desk.log(`Shortage ${s.product} added to ${coById(s.co).short} PO draft`, "info");
  }
  function advancePO(id: string) {
    const p = pos.find((x) => x.id === id);
    const next = p ? PO_NEXT[p.status] : null;
    if (!p || !next) return;
    setPos((cur) => cur.map((x) => (x.id === id ? { ...x, status: next, eta: next === "Sent" ? "Tomorrow" : next === "GRN done" ? "Just now" : x.eta } : x)));
    toast.success(`${p.id} ${next === "Sent" ? "sent to " + coById(p.co).cnf : "marked " + next}`);
    desk.log(`${p.id} (${coById(p.co).short}) → ${next}`, next === "GRN done" ? "ok" : "info");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Stock value" value="₹4.82 Cr" delta="+3%" hint="at PTR, 6,840 SKUs" icon={Boxes} trend={[4.51, 4.6, 4.66, 4.7, 4.74, 4.79, 4.82]} />
        <Stat label="Expiring under 3 months" value={inr(near, { compact: true })} delta="-8%" deltaGood={false} hint="tracked batches" icon={CalendarClock} tone="late" trend={[9.1, 8.8, 8.6, 8.2, 8.0, 7.7, 7.4]} />
        <Stat label="FEFO pick compliance" value="98.4%" delta="+0.6%" hint="scanner overrides 7" icon={PackageCheck} tone="ok" trend={[96.9, 97.2, 97.6, 97.8, 98.1, 98.0, 98.4]} />
        <Stat label="Shortages" value={shorts.filter((s) => !s.onPO).length} delta="+2" deltaGood={false} hint="62 chemist lines short" icon={AlertTriangle} tone="warn" trend={[3, 4, 4, 5, 5, 6, 7]} />
      </div>
      <Panel title="Batches by expiry (FEFO)" sub="Earliest expiry first, the order the scanner picks. Click a batch to return it or push it.">
        <DataTable
          rows={sorted}
          rowKey={(b) => b.id}
          search={(b) => `${b.product} ${b.batch} ${coById(b.co).name}`}
          searchPlaceholder="Search product, batch or company"
          filter={{ get: (b) => b.div, options: ["Chronic", "Acute", "Cold chain", "OTC"] }}
          onRow={(b) => setOpen(b.id)}
          pageSize={10}
          bulk={[
            {
              label: "Raise returns for eligible",
              run: (keys) => {
                const ok = batches.filter((b) => keys.includes(b.id) && eligibility(b).eligible && b.status === "In stock");
                ok.forEach((b) => update(b.id, { status: "Return raised" }));
                toast.success(`${ok.length} return${ok.length === 1 ? "" : "s"} raised`, { description: ok.length < keys.length ? `${keys.length - ok.length} not inside a return window` : "Debit notes drafted in Marg" });
                desk.log(`${ok.length} near-expiry returns raised`, "ok");
              },
            },
          ]}
          columns={[
            { key: "p", label: "Product", render: (b) => <span className="font-medium">{b.product}</span>, sort: (b) => b.product, wide: true },
            { key: "co", label: "Company", render: (b) => coById(b.co).short, sort: (b) => b.co },
            { key: "b", label: "Batch", render: (b) => <span className="font-mono text-[12px]">{b.batch}</span> },
            { key: "e", label: "Expiry", render: (b) => <Pill tone={b.m < 0 ? "late" : b.m < 3 ? "late" : b.m < 6 ? "warn" : "neutral"} mono>{expLabel(b.m)}</Pill>, sort: (b) => b.m },
            { key: "q", label: "Stock", align: "right", render: (b) => <span className="font-mono">{b.qty.toLocaleString("en-IN")}</span>, sort: (b) => b.qty },
            { key: "v", label: "Value", align: "right", render: (b) => <span className="tnum font-mono">{inr(bValue(b), { compact: true })}</span>, sort: (b) => bValue(b) },
            { key: "el", label: "Return", render: (b) => <Pill tone={eligibility(b).tone}>{eligibility(b).short}</Pill> },
            { key: "s", label: "Status", render: (b) => <Pill tone={statusTone[b.status]}>{b.status}</Pill>, sort: (b) => b.status },
          ]}
        />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <Panel icon={AlertTriangle} title="Shortages" sub="Days of cover at today's demand. Add to a PO; one draft per company.">
          <ul className="space-y-2">
            {shorts.map((s) => {
              const cover = s.onHand / s.perDay;
              return (
                <li key={s.id} className="flex flex-wrap items-center gap-3 rounded-[12px] border border-d-line px-3 py-2">
                  <div className="min-w-[160px] flex-1">
                    <p className="text-[13px] font-medium">
                      {s.product} <span className="font-normal text-d-mute">· {coById(s.co).short}</span>
                    </p>
                    <p className="text-[11.5px] text-d-mute">
                      {s.onHand} on hand · {s.perDay}/day · {s.shortLines} lines short
                    </p>
                  </div>
                  <div className="w-[110px]">
                    <Meter value={Math.min(cover, 7)} max={7} tone={cover < 1 ? "late" : cover < 3 ? "warn" : "ok"} />
                    <p className="mt-0.5 font-mono text-[10.5px] text-d-mute">{cover < 0.1 ? "out of stock" : `${cover.toFixed(1)} days cover`}</p>
                  </div>
                  {s.onPO ? (
                    <Pill tone="ok">On PO</Pill>
                  ) : (
                    <Btn size="sm" variant="soft" icon={Plus} onClick={() => addToPO(s)}>
                      Add to PO
                    </Btn>
                  )}
                </li>
              );
            })}
          </ul>
        </Panel>
        <Panel icon={Building2} title="Stock by company" sub="At PTR, ₹ across all batches">
          <HBars data={stockByCo.map((s) => ({ label: s.co, value: s.v, tone: "accent" as Tone }))} format={(v) => inr(v, { compact: true })} onSelect={(l) => toast(l, { description: "Filter the batch table by searching the company name." })} />
        </Panel>
      </div>
      <Panel icon={FileText} title="Purchase orders to companies" sub="Draft → Sent to C&F → Confirmed → In transit → GRN">
        <ul className="divide-y divide-d-line">
          {pos.map((p) => {
            const next = PO_NEXT[p.status];
            return (
              <li key={p.id} className="flex flex-wrap items-center gap-3 py-2.5">
                <button type="button" onClick={() => setPoOpen(p.id)} className="min-w-[180px] flex-1 text-left">
                  <p className="text-[13px] font-medium hover:text-d-accent">
                    {coById(p.co).name} <span className="font-mono text-[11.5px] text-d-mute">{p.id}</span>
                  </p>
                  <p className="text-[11.5px] text-d-mute">
                    {p.lines} lines · {coById(p.co).cnf} · ETA {p.eta}
                  </p>
                </button>
                <span className="tnum font-mono text-[13px] font-semibold">{inr(p.value, { compact: true })}</span>
                <Pill tone={poTone[p.status]}>{p.status}</Pill>
                {next ? (
                  <Btn size="sm" variant={p.status === "Draft" ? "solid" : "outline"} onClick={() => advancePO(p.id)}>
                    {p.status === "Draft" ? "Send PO" : `Mark ${next}`}
                  </Btn>
                ) : (
                  <span className="w-[88px] text-right text-[11.5px] text-d-ok">Stocked</span>
                )}
              </li>
            );
          })}
        </ul>
      </Panel>
      <BatchSheet id={open} onClose={() => setOpen(null)} />
      <Sheet open={!!po} onOpenChange={(v) => !v && setPoOpen(null)} eyebrow={po ? `${po.id} · ${po.status}` : ""} title={po ? coById(po.co).name : ""} sub={po ? coById(po.co).cnf : ""}>
        {po && (
          <div className="space-y-4">
            <KV items={[{ k: "Lines", v: po.lines }, { k: "Value at PTR", v: inr(po.value) }, { k: "ETA", v: po.eta }, { k: "Credit terms", v: "21 days from GRN" }]} />
            <p className="rounded-[10px] bg-d-sunk/70 px-3 py-2 text-[12.5px]">
              Order cut-off for next-day dispatch is 4 PM. The C&F sends the e-way bill and invoice by email; GRN is scanned into Marg batch-wise with expiry.
            </p>
            {PO_NEXT[po.status] && (
              <Btn variant="solid" onClick={() => advancePO(po.id)}>
                {po.status === "Draft" ? "Send PO" : `Mark ${PO_NEXT[po.status]}`}
              </Btn>
            )}
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Schemes & claims ---------------- */

function SchemesModule() {
  const desk = useDesk();
  const [claims, setClaims] = React.useState(claimsSeed);
  const [scheme, setScheme] = React.useState<Scheme | null>(null);
  const [claimOpen, setClaimOpen] = React.useState<string | null>(null);
  const [recon, setRecon] = React.useState<Record<string, "accepted" | "disputed">>({});
  const [proof, setProof] = React.useState<Record<string, boolean>>({ p1: true, p2: true });
  const claim = claims.find((c) => c.id === claimOpen) ?? null;
  const pending = claims.filter((c) => c.col !== "cn").reduce((a, c) => a + c.amount, 0);
  const received = claims.filter((c) => c.col === "cn").reduce((a, c) => a + c.amount, 0);
  const oldest = Math.max(...claims.filter((c) => c.col !== "cn").map((c) => c.age));
  const byCo = COS.map((c) => ({ label: c.short, value: claims.filter((x) => x.co === c.id && x.col !== "cn").reduce((a, x) => a + x.amount, 0) })).filter((x) => x.value > 0).sort((a, b) => b.value - a.value);

  function moveClaim(id: string, col: ClaimCol) {
    const c = claims.find((x) => x.id === id);
    if (!c || c.col === col) return;
    setClaims((cur) => cur.map((x) => (x.id === id ? { ...x, col, age: col === "submitted" ? 0 : x.age } : x)));
    const label = claimCols.find((z) => z.id === col)?.label;
    toast.success(`${c.id} → ${label}`, { description: `${coById(c.co).name} · ${inr(c.amount)}` });
    desk.log(`Claim ${c.id} (${coById(c.co).short}) moved to ${label}`, col === "cn" ? "ok" : "info");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Active schemes" value="37" delta="+5" hint="across 14 companies" icon={BadgePercent} trend={[28, 30, 31, 33, 32, 35, 37]} />
        <Stat label="Claims pending" value={inr(pending, { compact: true })} delta="+₹1.3 L" deltaGood={false} hint={`${claims.filter((c) => c.col !== "cn").length} claims`} icon={Receipt} tone="warn" trend={[8.2, 8.9, 9.4, 9.8, 10.1, 10.6, pending / 1e5]} />
        <Stat label="Credit notes in, this month" value={inr(received + 501000, { compact: true })} delta="+18%" hint="matched in Tally" icon={HandCoins} tone="ok" trend={[3.1, 3.6, 4.0, 4.5, 5.1, 5.6, (received + 501000) / 1e5]} />
        <Stat label="Oldest open claim" value={`${oldest} days`} delta="+7" deltaGood={false} hint="Mankind free goods" icon={Timer} tone="late" trend={[84, 91, 98, 104, 111, 118, oldest]} />
      </div>
      <Panel title="Claims pipeline" sub="Drag a claim as the company moves it. Click the title for papers and proof.">
        <Board
          columns={claimCols}
          items={claims}
          itemKey={(c) => c.id}
          getColumn={(c) => c.col}
          onMove={(k, col) => moveClaim(k, col as ClaimCol)}
          minColumnWidth={200}
          renderCard={(c) => (
            <div>
              <p className="flex items-center justify-between font-mono text-[10.5px] text-d-mute">
                <span>{c.id}</span>
                <span className={c.age > 60 ? "text-d-late" : undefined}>{c.age} d</span>
              </p>
              <button type="button" onClick={() => setClaimOpen(c.id)} className="mt-0.5 block text-left text-[12.5px] font-semibold leading-tight hover:text-d-accent">
                {coById(c.co).name}: {c.scheme}
              </button>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <Pill tone={c.kind === "Expiry return" ? "late" : c.kind === "Free goods" ? "accent" : "info"}>{c.kind}</Pill>
                <span className="tnum font-mono text-[12px] font-semibold">{inr(c.amount, { compact: true })}</span>
              </div>
              <p className="mt-1 text-[11px] text-d-mute">{c.note}</p>
            </div>
          )}
        />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
        <Panel title="Pending by company" sub="Everything not yet a credit note">
          <Bars data={byCo.map((x) => ({ ...x, tone: x.value > 200000 ? ("late" as Tone) : ("accent" as Tone) }))} format={(v) => inr(v, { compact: true })} height={190} showValues />
        </Panel>
        <Panel icon={ClipboardList} title="Credit note reconciliation" sub="Company credit notes against what we claimed">
          <ul className="divide-y divide-d-line">
            {reconSeed.map((r) => {
              const diff = r.claimed - r.cn;
              const s = recon[r.id];
              return (
                <li key={r.id} className="flex flex-wrap items-center gap-3 py-2.5">
                  <div className="min-w-[150px] flex-1">
                    <p className="text-[13px] font-medium">{r.co}</p>
                    <p className="font-mono text-[11px] text-d-mute">{r.ref}</p>
                  </div>
                  <span className="text-right font-mono text-[12px]">
                    {inr(r.cn)}
                    <span className="block text-[10.5px] text-d-mute">of {inr(r.claimed)}</span>
                  </span>
                  {diff === 0 ? (
                    <Pill tone="ok">Matched</Pill>
                  ) : s ? (
                    <Pill tone={s === "accepted" ? "neutral" : "warn"}>{s === "accepted" ? `Wrote off ${inr(diff)}` : "Dispute raised"}</Pill>
                  ) : (
                    <span className="inline-flex gap-1.5">
                      <Btn size="sm" variant="ghost" onClick={() => { setRecon((c) => ({ ...c, [r.id]: "accepted" })); toast(`Accepted ${inr(diff)} short from ${r.co}`); desk.log(`Accepted ${inr(diff)} CN short from ${r.co}`); }}>
                        Accept
                      </Btn>
                      <Btn size="sm" variant="soft" onClick={() => { setRecon((c) => ({ ...c, [r.id]: "disputed" })); toast.success(`Dispute sent to ${r.co}`, { description: `${inr(diff)} short on ${r.ref}` }); desk.log(`Disputed ${inr(diff)} short on ${r.ref}`, "warn"); }}>
                        Dispute {inr(diff, { compact: true })}
                      </Btn>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
      <Panel title="Company schemes running" sub="What chemists can get this month. Click to broadcast.">
        <DataTable
          rows={schemesSeed}
          rowKey={(s) => s.id}
          search={(s) => `${s.product} ${coById(s.co).name} ${s.offer}`}
          searchPlaceholder="Search product, company or offer"
          onRow={setScheme}
          columns={[
            { key: "co", label: "Company", render: (s) => coById(s.co).short, sort: (s) => s.co },
            { key: "p", label: "Product", render: (s) => <span className="font-medium">{s.product}</span>, wide: true },
            { key: "o", label: "Offer", render: (s) => <Pill tone="accent">{s.offer}</Pill> },
            { key: "t", label: "Till", render: (s) => <span className="font-mono text-[12px]">{s.till}</span> },
            { key: "u", label: "Uptake", render: (s) => <span className="flex w-[130px] items-center gap-2"><Meter value={s.sold} max={s.target} tone={s.sold / s.target > 0.8 ? "ok" : "accent"} /><span className="font-mono text-[11px] text-d-mute">{Math.round((s.sold / s.target) * 100)}%</span></span>, sort: (s) => s.sold / s.target },
            { key: "r", label: "Chemists", align: "right", render: (s) => <span className="font-mono">{s.reach}</span>, sort: (s) => s.reach },
          ]}
        />
      </Panel>
      <Sheet
        open={!!scheme}
        onOpenChange={(v) => !v && setScheme(null)}
        eyebrow={scheme ? `${scheme.id} · ${coById(scheme.co).name}` : ""}
        title={scheme?.product ?? ""}
        sub={scheme ? `${scheme.offer} · valid till ${scheme.till}` : ""}
        footer={
          scheme && (
            <Btn variant="solid" icon={MessageCircle} onClick={() => { toast.success(`${scheme.offer} on ${scheme.product} broadcast`, { description: "Sent to 763 chemists on WhatsApp and the salesman app" }); desk.log(`Scheme broadcast: ${scheme.product} ${scheme.offer}`, "info"); setScheme(null); }}>
              Broadcast to chemists
            </Btn>
          )
        }
      >
        {scheme && (
          <div className="space-y-4">
            <KV items={[{ k: "Sold under scheme", v: `${scheme.sold.toLocaleString("en-IN")} units` }, { k: "Company target", v: `${scheme.target.toLocaleString("en-IN")} units` }, { k: "Chemists who took it", v: scheme.reach }, { k: "Claim basis", v: scheme.offer.includes("free") ? "Free goods statement" : "Rate difference statement" }]} />
            <Meter value={scheme.sold} max={scheme.target} height={8} />
            <p className="text-[12.5px] text-d-mute">{(scheme.target - scheme.sold).toLocaleString("en-IN")} units to go. Claim Chaser builds the statement from Marg bills on the last day of the scheme.</p>
          </div>
        )}
      </Sheet>
      <Sheet
        open={!!claim}
        onOpenChange={(v) => !v && setClaimOpen(null)}
        eyebrow={claim ? `${claim.id} · ${claim.kind} · ${claim.age} days` : ""}
        title={claim ? coById(claim.co).name : ""}
        sub={claim?.scheme}
        footer={
          claim && (
            <>
              <Btn icon={Phone} onClick={() => { toast.success(`Reminder sent to ${coById(claim.co).short} RSM`); desk.log(`Chased ${coById(claim.co).short} on ${claim.id}`); }}>
                Chase company
              </Btn>
              {claim.col === "prepared" || claim.col === "disputed" ? (
                <Btn variant="solid" icon={Send} onClick={() => moveClaim(claim.id, "submitted")}>
                  {claim.col === "disputed" ? "Re-submit" : "Submit claim"}
                </Btn>
              ) : claim.col !== "cn" ? (
                <Btn variant="solid" icon={CheckCircle2} onClick={() => moveClaim(claim.id, "cn")}>
                  Credit note received
                </Btn>
              ) : null}
            </>
          )
        }
      >
        {claim && (
          <div className="space-y-4">
            <KV items={[{ k: "Amount", v: inr(claim.amount) }, { k: "Stage", v: claimCols.find((c) => c.id === claim.col)?.label }, { k: "Age", v: `${claim.age} days` }, { k: "Note", v: claim.note }]} />
            <div>
              <p className="mb-1 text-[12px] font-medium text-d-mute">Proof attached</p>
              <Checklist
                items={[
                  { id: "p1", label: "Scheme circular from company", done: !!proof.p1 },
                  { id: "p2", label: "Retailer-wise sale statement from Marg", done: !!proof.p2 },
                  { id: "p3", label: "Retailer GSTIN on every invoice", sub: claim.co === "MAN" ? "14 invoices missing, fixed by Deepak" : undefined, done: !!proof.p3 },
                  { id: "p4", label: "Debit note signed and stamped", done: !!proof.p4 },
                ]}
                onToggle={(pid) => setProof((p) => ({ ...p, [pid]: !p[pid] }))}
              />
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Chemist credit ---------------- */

function CreditModule() {
  const desk = useDesk();
  const { holds, toggleHold } = usePharma();
  const [chems, setChems] = React.useState(chemistsSeed);
  const [open, setOpen] = React.useState<string | null>(null);
  const [reminded, setReminded] = React.useState<Set<string>>(new Set());
  const ch = chems.find((c) => c.id === open) ?? null;
  const statusOf = (c: Chemist): CreditStatus => (holds.has(c.id) ? "Hold" : c.status === "Hold" ? "Watch" : c.status);
  const totalOut = chems.reduce((a, c) => a + c.out, 0);

  function setHold(c: Chemist, on: boolean) {
    toggleHold(c.id, on);
    toast[on ? "warning" : "success"](`${c.name} ${on ? "put on credit hold" : "released"}`, { description: on ? "New orders park in Received; salesman told." : "Orders will pick normally." });
    desk.log(`${c.name} ${on ? "on credit hold" : "released from hold"}`, on ? "late" : "ok");
  }
  function remind(keys: string[]) {
    setReminded((cur) => new Set([...cur, ...keys]));
    toast.success(`${keys.length} reminder${keys.length > 1 ? "s" : ""} sent with UPI link`, { description: "WhatsApp with ledger PDF attached" });
    desk.log(`Payment reminders to ${keys.length} chemists`, "info");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Outstanding" value="₹2.14 Cr" delta="+4%" deltaGood={false} hint="~900 accounts" icon={Wallet} trend={[1.96, 2.0, 2.03, 2.05, 2.08, 2.1, 2.14]} />
        <Stat label="Overdue above 60 days" value="₹41 L" delta="+₹3 L" deltaGood={false} hint="23 accounts" icon={AlertTriangle} tone="late" trend={[33, 34, 36, 37, 38, 38, 41]} />
        <Stat label="On credit hold" value={holds.size} delta={holds.size > 2 ? `+${holds.size - 2}` : "0"} deltaGood={false} hint="orders park automatically" icon={Lock} tone="warn" trend={[3, 2, 2, 3, 2, 2, holds.size]} />
        <Stat label="Collected today" value="₹7.6 L" delta="+12%" hint="cash, cheque, UPI, RTGS" icon={HandCoins} tone="ok" trend={[4.1, 5.0, 6.2, 5.8, 6.9, 7.1, 7.6]} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <Panel title="Ageing of receivables" sub="By oldest bill. DSO 34 days against 30-day terms.">
          <AgingBar
            buckets={[
              { label: "0–30 days", value: 11200000, tone: "ok" },
              { label: "31–60 days", value: 6100000, tone: "info" },
              { label: "61–90 days", value: 2700000, tone: "warn" },
              { label: "90+ days", value: 1400000, tone: "late" },
            ]}
            format={(v) => inr(v, { compact: true })}
          />
          <div className="mt-5 grid grid-cols-3 gap-3 text-[12.5px]">
            <div className="rounded-[10px] bg-d-sunk/70 px-3 py-2">
              <p className="text-d-mute">Cheques in hand</p>
              <p className="desk-h text-[17px] font-semibold">₹3.9 L</p>
            </div>
            <div className="rounded-[10px] bg-d-sunk/70 px-3 py-2">
              <p className="text-d-mute">Bounced, Sep–Oct</p>
              <p className="desk-h text-[17px] font-semibold text-d-late">5 · ₹1.6 L</p>
            </div>
            <div className="rounded-[10px] bg-d-sunk/70 px-3 py-2">
              <p className="text-d-mute">PDCs due this week</p>
              <p className="desk-h text-[17px] font-semibold">₹5.2 L</p>
            </div>
          </div>
        </Panel>
        <Panel icon={HandCoins} title="Collections by salesman" sub="Today against beat target">
          <ul className="space-y-3">
            {collections.map((s) => (
              <li key={s.name}>
                <div className="mb-1 flex justify-between text-[12.5px]">
                  <span className="font-medium">
                    {s.name} <span className="font-normal text-d-mute">· {s.beat}</span>
                  </span>
                  <span className="font-mono text-d-mute">
                    {inr(s.got, { compact: true })} / {inr(s.target, { compact: true })}
                  </span>
                </div>
                <Meter value={s.got} max={s.target} tone={s.got / s.target > 0.7 ? "ok" : s.got / s.target > 0.45 ? "warn" : "late"} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <Panel title="Chemist accounts" sub={`Showing ${chems.length} of ~900 by risk · ${inr(totalOut, { compact: true })} outstanding here. Click for bills and actions.`}>
        <DataTable
          rows={[...chems].sort((a, b) => b.days - a.days)}
          rowKey={(c) => c.id}
          search={(c) => `${c.name} ${c.town} ${c.salesman}`}
          searchPlaceholder="Search chemist, town or salesman"
          filter={{ get: (c) => statusOf(c), options: ["Active", "Watch", "Hold"] }}
          onRow={(c) => setOpen(c.id)}
          bulk={[
            { label: "Send reminders with UPI link", run: remind },
            { label: "Put on hold", run: (keys) => { keys.forEach((k) => toggleHold(k, true)); toast.warning(`${keys.length} accounts put on hold`); desk.log(`${keys.length} chemists put on credit hold`, "late"); } },
          ]}
          columns={[
            { key: "n", label: "Chemist", render: (c) => <span className="font-medium">{c.name}</span>, sort: (c) => c.name, wide: true },
            { key: "t", label: "Town", render: (c) => <span className="text-d-mute">{c.town}</span> },
            { key: "o", label: "Outstanding", align: "right", render: (c) => <span className="tnum font-mono">{inr(c.out, { compact: true })}</span>, sort: (c) => c.out },
            { key: "u", label: "Limit used", render: (c) => <span className="flex w-[120px] items-center gap-2"><Meter value={c.out} max={c.limit} tone={c.out > c.limit ? "late" : c.out / c.limit > 0.85 ? "warn" : "ok"} /><span className="font-mono text-[11px] text-d-mute">{Math.round((c.out / c.limit) * 100)}%</span></span>, sort: (c) => c.out / c.limit },
            { key: "d", label: "Oldest bill", align: "right", render: (c) => <span className={`font-mono ${c.days > 60 ? "text-d-late" : c.days > c.terms ? "text-d-warn" : ""}`}>{c.days} d</span>, sort: (c) => c.days },
            { key: "b", label: "Bounces", align: "center", render: (c) => (c.bounces ? <Pill tone="late">{c.bounces}</Pill> : <span className="text-d-mute">—</span>), sort: (c) => c.bounces },
            { key: "s", label: "Status", render: (c) => (reminded.has(c.id) ? <Pill tone="info">Reminded</Pill> : <Pill tone={statusOf(c) === "Hold" ? "late" : statusOf(c) === "Watch" ? "warn" : "ok"}>{statusOf(c)}</Pill>) },
          ]}
        />
      </Panel>
      <Sheet
        open={!!ch}
        onOpenChange={(v) => !v && setOpen(null)}
        eyebrow={ch ? `${ch.kind} · ${ch.salesman} · ${ch.terms}-day terms` : ""}
        title={ch?.name ?? ""}
        sub={ch ? `${ch.town} · last paid ${ch.lastPay}` : ""}
        width={540}
        footer={
          ch && (
            <>
              <Btn icon={MessageCircle} onClick={() => remind([ch.id])}>
                Remind with UPI link
              </Btn>
              {holds.has(ch.id) ? (
                <Btn variant="solid" icon={Unlock} onClick={() => setHold(ch, false)}>
                  Release hold
                </Btn>
              ) : (
                <Btn variant="danger" icon={Lock} onClick={() => setHold(ch, true)}>
                  Put on hold
                </Btn>
              )}
            </>
          )
        }
      >
        {ch && (
          <div className="space-y-5">
            <KV
              cols={3}
              items={[
                { k: "Limit", v: inr(ch.limit, { compact: true }) },
                { k: "Outstanding", v: inr(ch.out, { compact: true }) },
                { k: "Oldest bill", v: `${ch.days} days` },
                { k: "Cheque bounces", v: ch.bounces },
                { k: "Status", v: <Pill tone={statusOf(ch) === "Hold" ? "late" : statusOf(ch) === "Watch" ? "warn" : "ok"}>{statusOf(ch)}</Pill> },
                { k: "Salesman", v: ch.salesman },
              ]}
            />
            <Meter value={ch.out} max={ch.limit} tone={ch.out > ch.limit ? "late" : "accent"} height={8} />
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Open bills</p>
              <ul className="divide-y divide-d-line rounded-[10px] border border-d-line">
                {billsFor(ch).map((b) => (
                  <li key={b.no} className="flex items-center justify-between px-3 py-2 text-[12.5px]">
                    <span className="font-mono">{b.no}</span>
                    <span className={`font-mono ${b.days > 60 ? "text-d-late" : "text-d-mute"}`}>{b.days} d</span>
                    <span className="tnum font-mono font-semibold">{inr(b.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Change credit limit</p>
              <div className="flex flex-wrap gap-2">
                {[-50000, 25000, 50000, 100000].map((d) => (
                  <Btn
                    key={d}
                    size="sm"
                    variant={d < 0 ? "outline" : "soft"}
                    onClick={() => {
                      setChems((cur) => cur.map((x) => (x.id === ch.id ? { ...x, limit: Math.max(50000, x.limit + d) } : x)));
                      toast.success(`Limit ${d < 0 ? "cut" : "raised"} to ${inr(Math.max(50000, ch.limit + d), { compact: true })}`, { description: ch.name });
                      desk.log(`Credit limit for ${ch.name} ${d < 0 ? "cut" : "raised"} by ${inr(Math.abs(d), { compact: true })}`);
                    }}
                  >
                    {d < 0 ? "−" : "+"}
                    {inr(Math.abs(d), { compact: true })}
                  </Btn>
                ))}
              </div>
            </div>
            <Btn
              icon={Receipt}
              onClick={() => {
                const amt = Math.round(ch.out * 0.3);
                setChems((cur) => cur.map((x) => (x.id === ch.id ? { ...x, out: x.out - amt, lastPay: `${inr(amt)} today` } : x)));
                toast.success(`${inr(amt)} received from ${ch.name}`, { description: "Posted against oldest bills in Tally" });
                desk.log(`Collection ${inr(amt)} from ${ch.name}`, "ok");
              }}
            >
              Log a payment (30% of dues)
            </Btn>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Cold chain ---------------- */

function FridgeCard({ f, idx, onOpen, selected }: { f: Fridge; idx: number; onOpen: () => void; selected: boolean }) {
  const t = useDrift(f.base, f.spread, 2100 + idx * 170);
  const temp = Math.round(t * 10) / 10;
  const tone: Tone = temp > 8 || temp < 2 ? "late" : temp > 7.2 ? "warn" : "ok";
  return (
    <button
      type="button"
      onClick={onOpen}
      className="desk-card group relative flex min-w-0 flex-col p-4 text-left transition-transform hover:-translate-y-0.5"
      style={{ boxShadow: selected ? "0 0 0 2px var(--d-accent)" : undefined }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-[10.5px] text-d-mute">{f.id}</p>
          <p className="truncate text-[13px] font-semibold">{f.name}</p>
        </div>
        <Dot tone={tone} pulse />
      </div>
      <p className="desk-h tnum mt-2 text-[32px] font-semibold leading-none" style={{ color: `var(--d-${tone})` }}>
        {temp.toFixed(1)}
        <span className="text-[15px] text-d-mute"> °C</span>
      </p>
      <div className="relative mt-3 h-2.5 rounded-full bg-d-sunk">
        <span className="absolute inset-y-0 rounded-full" style={{ left: `${(2 / 12) * 100}%`, width: `${(6 / 12) * 100}%`, background: "color-mix(in oklab, var(--d-ok) 28%, transparent)" }} />
        <span className="absolute top-1/2 h-4 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[left] duration-700" style={{ left: `${Math.min(100, (temp / 12) * 100)}%`, background: `var(--d-${tone})` }} />
      </div>
      <p className="mt-1 flex justify-between font-mono text-[10px] text-d-mute">
        <span>0</span>
        <span>2–8 °C</span>
        <span>12</span>
      </p>
      <p className="mt-2 line-clamp-1 text-[11.5px] text-d-mute">{f.contents}</p>
      <p className="mt-0.5 font-mono text-[11px]">
        {inr(f.value, { compact: true })} · {f.doors} door opens
      </p>
    </button>
  );
}

function ColdModule() {
  const desk = useDesk();
  const { batches, update } = usePharma();
  const [sel, setSel] = React.useState("F3");
  const [ex, setEx] = React.useState(excursionsSeed);
  const [exOpen, setExOpen] = React.useState<string | null>(null);
  const [check, setCheck] = React.useState<Record<string, boolean>>({ c1: true, c2: true });
  const fi = FRIDGES.findIndex((f) => f.id === sel);
  const f = FRIDGES[fi];
  const series = loggerSeries(f, fi);
  const e = ex.find((x) => x.id === exOpen) ?? null;
  const hoursL = Array.from({ length: 24 }, (_, h) => `${(h + 11) % 24}:00`);

  function setStatus(id: string, status: ExStatus) {
    setEx((cur) => cur.map((x) => (x.id === id ? { ...x, status } : x)));
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Fridges in 2–8 °C" value="5 of 6" delta="-1" hint="F3 recovering" icon={Thermometer} tone="warn" trend={[6, 6, 6, 6, 6, 6, 5]} />
        <Stat label="Excursions this week" value={ex.filter((x) => !x.when.includes("Oct")).length} delta="+2" deltaGood={false} hint={`${ex.filter((x) => x.status === "Open").length} open`} icon={AlertTriangle} tone="late" trend={[1, 0, 1, 2, 1, 2, 3]} />
        <Stat label="Cold stock value" value="₹40.2 L" delta="+6%" hint="insulin, vaccines, biologicals" icon={Snowflake} tone="info" trend={[34, 35, 36.5, 37, 38.2, 39, 40.2]} />
        <Stat label="Cold dispatches today" value="11" delta="+3" hint="gel packs + logger in box" icon={Truck} tone="ok" trend={[6, 8, 7, 9, 8, 10, 11]} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {FRIDGES.map((fr, i) => (
          <FridgeCard key={fr.id} f={fr} idx={i} selected={sel === fr.id} onOpen={() => setSel(fr.id)} />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Panel
          icon={Thermometer}
          title={`${f.id} · ${f.name}, last 24 hours`}
          sub={`${f.model} · ${f.logger} · ${f.power}`}
          action={<Segmented size="sm" options={FRIDGES.map((x) => x.id)} value={sel} onChange={setSel} />}
        >
          <AreaChart
            labels={hoursL}
            series={[
              { name: "Temperature", data: series, tone: "accent" },
              { name: "Upper 8 °C", data: Array(24).fill(8), tone: "late", dashed: true },
              { name: "Lower 2 °C", data: Array(24).fill(2), tone: "info", dashed: true },
            ]}
            format={(v) => `${v.toFixed(1)}°`}
            height={220}
            marker={f.id === "F3" ? { index: 16, label: "EX-311 · 9.4°" } : undefined}
          />
        </Panel>
        <Panel icon={ClipboardList} title="Cold box checklist" sub="Today's 2 PM insulin dispatch to Dewas and Dhar">
          <Checklist
            items={[
              { id: "c1", label: "Gel packs conditioned 24 h at 5 °C", done: !!check.c1 },
              { id: "c2", label: "Box pre-cooled in F5 for 30 minutes", done: !!check.c2 },
              { id: "c3", label: "Single-use logger started and tagged to invoice", done: !!check.c3 },
              { id: "c4", label: "Insulin not touching gel packs (bubble wrap)", done: !!check.c4 },
              { id: "c5", label: "Chemist told to put it in the fridge on arrival", done: !!check.c5 },
            ]}
            onToggle={(id) => {
              setCheck((c) => ({ ...c, [id]: !c[id] }));
              if (!check[id]) desk.log(`Cold box check done: ${id.toUpperCase()}`);
            }}
          />
          <Btn
            size="sm"
            variant="solid"
            className="mt-3"
            icon={PackageCheck}
            onClick={() => {
              const left = 5 - Object.values(check).filter(Boolean).length;
              if (left > 0) {
                toast.error(`${left} check${left > 1 ? "s" : ""} still open`);
                return;
              }
              toast.success("Cold boxes sealed and handed to Imran");
              desk.log("Cold boxes for Dewas and Dhar sealed", "ok");
            }}
          >
            Seal boxes
          </Btn>
        </Panel>
      </div>
      <Panel title="Excursion log" sub="Every reading outside 2–8 °C. Click for affected stock and actions.">
        <DataTable
          rows={ex}
          rowKey={(x) => x.id}
          onRow={(x) => setExOpen(x.id)}
          filter={{ get: (x) => x.status, options: ["Open", "With company", "Closed"] }}
          columns={[
            { key: "id", label: "Excursion", render: (x) => <span className="font-mono text-[12px]">{x.id}</span> },
            { key: "f", label: "Fridge", render: (x) => `${x.fridge} · ${FRIDGES.find((z) => z.id === x.fridge)?.name}` },
            { key: "w", label: "When", render: (x) => <span className="text-d-mute">{x.when}</span> },
            { key: "m", label: "Minutes", align: "right", render: (x) => <span className="font-mono">{x.mins}</span>, sort: (x) => x.mins },
            { key: "p", label: "Peak", align: "right", render: (x) => <span className={`font-mono ${x.peak > 9 || x.peak < 2 ? "text-d-late" : ""}`}>{x.peak.toFixed(1)} °C</span>, sort: (x) => x.peak },
            { key: "c", label: "Cause", render: (x) => <span className="text-d-mute">{x.cause}</span>, wide: true },
            { key: "s", label: "Status", render: (x) => <Pill tone={exTone[x.status]}>{x.status}</Pill> },
          ]}
        />
      </Panel>
      <Sheet
        open={!!e}
        onOpenChange={(v) => !v && setExOpen(null)}
        eyebrow={e ? `${e.id} · ${e.fridge} · ${e.when}` : ""}
        title={e ? `${e.peak.toFixed(1)} °C for ${e.mins} minutes` : ""}
        sub={e?.cause}
        width={520}
        footer={
          e && (
            <>
              {e.status === "Open" && (
                <Btn
                  icon={Lock}
                  onClick={() => {
                    e.batches.forEach((id) => update(id, { status: "Quarantined" }));
                    setStatus(e.id, "With company");
                    toast.warning(`${e.batches.length} batch${e.batches.length === 1 ? "" : "es"} quarantined`, { description: "Logger file sent to the company for a stability opinion" });
                    desk.log(`${e.id}: quarantined ${e.batches.length} batches, logger file sent`, "warn");
                  }}
                >
                  Quarantine & send to company
                </Btn>
              )}
              {e.status !== "Closed" && (
                <Btn
                  variant="solid"
                  icon={CheckCircle2}
                  onClick={() => {
                    e.batches.forEach((id) => update(id, { status: "In stock" }));
                    setStatus(e.id, "Closed");
                    toast.success(`${e.id} closed`, { description: "Company cleared the stock; released for sale" });
                    desk.log(`${e.id} closed, stock released`, "ok");
                  }}
                >
                  Company cleared · release
                </Btn>
              )}
            </>
          )
        }
      >
        {e && (
          <div className="space-y-4">
            <KV items={[{ k: "Fridge", v: FRIDGES.find((z) => z.id === e.fridge)?.name }, { k: "Logger", v: FRIDGES.find((z) => z.id === e.fridge)?.logger }, { k: "Duration", v: `${e.mins} min` }, { k: "Status", v: <Pill tone={exTone[e.status]}>{e.status}</Pill> }]} />
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Stock affected</p>
              {e.batches.length === 0 ? (
                <p className="text-[12.5px] text-d-mute">No saleable stock exposed; packed orders were moved to F4.</p>
              ) : (
                <ul className="divide-y divide-d-line rounded-[10px] border border-d-line">
                  {e.batches.map((id) => {
                    const b = batches.find((x) => x.id === id)!;
                    return (
                      <li key={id} className="flex items-center justify-between gap-3 px-3 py-2 text-[12.5px]">
                        <span>
                          <b>{b.product}</b> <span className="text-d-mute">· {coById(b.co).short} · {b.batch}</span>
                        </span>
                        <span className="font-mono">{b.qty}</span>
                        <Pill tone={statusTone[b.status]}>{b.status}</Pill>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <p className="rounded-[10px] bg-d-sunk/70 px-3 py-2 text-[12.5px]">
              Rule: any reading above 8 °C for more than 15 minutes, or below 2 °C at all, blocks the batch in Marg until the company sends a written stability opinion.
            </p>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Compliance ---------------- */

function ComplianceModule() {
  const desk = useDesk();
  const [lic, setLic] = React.useState(licencesSeed);
  const [h1, setH1] = React.useState(h1Seed);
  const [ewb, setEwb] = React.useState(ewbSeed);
  const [licOpen, setLicOpen] = React.useState<string | null>(null);
  const [h1Open, setH1Open] = React.useState<H1Row | null>(null);
  const [gst, setGst] = React.useState<Record<string, boolean>>({ g1: true, g2: true, g3: true });
  const l = lic.find((x) => x.id === licOpen) ?? null;
  const due = lic.filter((x) => x.status === "Renew now").length;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Licences & registrations" value={lic.length} hint={`${due} need renewal`} delta={due ? `+${due}` : "0"} deltaGood={false} icon={FileCheck2} tone={due ? "late" : "ok"} trend={[1, 1, 2, 2, 2, 3, due]} />
        <Stat label="H1 entries today" value={h1.length + 36} delta="+4" hint={`${h1.filter((x) => !x.ok).length} DL to verify`} icon={ClipboardList} tone="warn" trend={[38, 41, 39, 44, 42, 43, h1.length + 36]} />
        <Stat label="E-way bills today" value={ewb.filter((x) => x.status === "Generated").length + 28} delta="+3" hint={`${ewb.filter((x) => x.status === "Pending").length} pending`} icon={Truck} tone="info" trend={[24, 27, 25, 29, 28, 30, 31]} />
        <Stat label="GST filings, October" value={`${Object.values(gst).filter(Boolean).length} / 6`} hint="GSTR-1 due 11 Nov" icon={Receipt} tone="ok" trend={[1, 2, 2, 3, 3, 3, Object.values(gst).filter(Boolean).length]} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Panel icon={ShieldCheck} title="Licence register" sub="Renewals start 60 days ahead. Click a licence for papers.">
          <ul className="divide-y divide-d-line">
            {[...lic].sort((a, b) => a.days - b.days).map((x) => (
              <li key={x.id} className="flex flex-wrap items-center gap-3 py-2.5">
                <button type="button" onClick={() => setLicOpen(x.id)} className="min-w-[200px] flex-1 text-left">
                  <p className="text-[13px] font-medium hover:text-d-accent">{x.name}</p>
                  <p className="font-mono text-[11px] text-d-mute">
                    {x.no} · {x.authority}
                  </p>
                </button>
                <span className="w-[96px] text-right text-[12px]">
                  <span className="block font-mono">{x.expires}</span>
                  {x.days < 999 && <span className={`block font-mono text-[11px] ${x.days < 30 ? "text-d-late" : "text-d-mute"}`}>{x.days} days</span>}
                </span>
                {x.status === "Renew now" ? (
                  <Btn
                    size="sm"
                    variant="solid"
                    onClick={() => {
                      setLic((cur) => cur.map((z) => (z.id === x.id ? { ...z, status: "Renewal filed" } : z)));
                      toast.success(`Renewal filed: ${x.name}`, { description: `${x.authority} · acknowledgement saved` });
                      desk.log(`Renewal filed: ${x.name}`, "ok");
                    }}
                  >
                    File renewal
                  </Btn>
                ) : (
                  <Pill tone={x.status === "Renewal filed" ? "info" : "ok"}>{x.status}</Pill>
                )}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel icon={Receipt} title="GST & returns, October" sub="Marg to Tally to the GST portal">
          <Checklist
            items={[
              { id: "g1", label: "E-invoice IRN on all B2B bills", sub: "412 IRNs today, 0 failed", done: !!gst.g1 },
              { id: "g2", label: "GSTR-2B matched with company invoices", sub: "14 companies, 2 mismatches cleared", done: !!gst.g2 },
              { id: "g3", label: "September GSTR-3B filed", sub: "Paid ₹4.18 L on 18 Oct", done: !!gst.g3 },
              { id: "g4", label: "Credit notes from companies in GSTR-1", sub: "Torrent, DRL this month", done: !!gst.g4 },
              { id: "g5", label: "October GSTR-1", sub: "Due 11 Nov", done: !!gst.g5 },
              { id: "g6", label: "TDS on rent and freight, Form 26Q", sub: "Due 31 Oct", done: !!gst.g6 },
            ]}
            onToggle={(id) => {
              setGst((g) => ({ ...g, [id]: !g[id] }));
              if (!gst[id]) {
                toast.success("Marked done");
                desk.log(`GST checklist: ${id.toUpperCase()} done`);
              }
            }}
          />
        </Panel>
      </div>
      <Panel title="Schedule H1 register" sub="Every sale of an H1 drug with buyer, batch and buyer licence. Kept 3 years for FDA inspection.">
        <DataTable
          rows={h1}
          rowKey={(x) => x.id}
          search={(x) => `${x.drug} ${x.buyer} ${x.batch} ${x.inv}`}
          searchPlaceholder="Search drug, buyer, batch or invoice"
          filter={{ get: (x) => (x.ok ? "DL verified" : "Verify DL"), options: ["DL verified", "Verify DL"] }}
          onRow={setH1Open}
          bulk={[{ label: "Export register PDF", run: (k) => { toast.success(`${k.length} H1 entries exported`, { description: "Signed by Neha Dubey, competent person" }); desk.log(`H1 register exported, ${k.length} entries`); } }]}
          columns={[
            { key: "t", label: "Time", render: (x) => <span className="font-mono text-[12px] text-d-mute">{x.time}</span> },
            { key: "i", label: "Invoice", render: (x) => <span className="font-mono text-[12px]">{x.inv}</span> },
            { key: "d", label: "Drug", render: (x) => <span className="font-medium">{x.drug}</span>, wide: true, sort: (x) => x.drug },
            { key: "b", label: "Batch", render: (x) => <span className="font-mono text-[12px]">{x.batch}</span> },
            { key: "q", label: "Qty", align: "right", render: (x) => <span className="font-mono">{x.qty}</span>, sort: (x) => x.qty },
            { key: "by", label: "Buyer", render: (x) => x.buyer, sort: (x) => x.buyer },
            { key: "dl", label: "Buyer DL", render: (x) => (x.ok ? <span className="font-mono text-[12px]">{x.dl}</span> : <Pill tone="late">Verify {x.dl}</Pill>) },
          ]}
        />
      </Panel>
      <Panel icon={Truck} title="E-way bills" sub="Needed for every invoice above ₹50,000 leaving the godown">
        <ul className="divide-y divide-d-line">
          {ewb.map((x) => (
            <li key={x.id} className="flex flex-wrap items-center gap-3 py-2.5">
              <div className="min-w-[200px] flex-1">
                <p className="text-[13px] font-medium">{x.to}</p>
                <p className="font-mono text-[11px] text-d-mute">
                  {x.inv} · {x.vehicle}
                </p>
              </div>
              <span className="tnum font-mono text-[12.5px]">{inr(x.value)}</span>
              <span className="w-[120px] font-mono text-[11.5px] text-d-mute">{x.no}</span>
              {x.status === "Pending" ? (
                <Btn
                  size="sm"
                  variant="soft"
                  onClick={() => {
                    const no = `3214 8871 ${String(4400 + Number(x.id.slice(1)) * 13)}`;
                    setEwb((cur) => cur.map((z) => (z.id === x.id ? { ...z, status: "Generated", no, valid: "Till 21 Oct" } : z)));
                    toast.success(`E-way bill ${no} generated`, { description: `${x.inv} · ${x.vehicle}` });
                    desk.log(`E-way bill generated for ${x.inv}`, "ok");
                  }}
                >
                  Generate
                </Btn>
              ) : (
                <Pill tone="ok">{x.valid}</Pill>
              )}
            </li>
          ))}
        </ul>
      </Panel>
      <Sheet
        open={!!l}
        onOpenChange={(v) => !v && setLicOpen(null)}
        eyebrow={l ? l.authority : ""}
        title={l?.name ?? ""}
        sub={l ? `${l.no} · expires ${l.expires}` : ""}
        footer={
          l &&
          l.status === "Renew now" && (
            <Btn
              variant="solid"
              icon={FileCheck2}
              onClick={() => {
                setLic((cur) => cur.map((z) => (z.id === l.id ? { ...z, status: "Renewal filed" } : z)));
                toast.success(`Renewal filed: ${l.name}`);
                desk.log(`Renewal filed: ${l.name}`, "ok");
              }}
            >
              File renewal
            </Btn>
          )
        }
      >
        {l && (
          <div className="space-y-4">
            <KV items={[{ k: "Number", v: l.no }, { k: "Status", v: <Pill tone={l.status === "Renew now" ? "late" : l.status === "Renewal filed" ? "info" : "ok"}>{l.status}</Pill> }, { k: "Expires", v: l.expires }, { k: "Days left", v: l.days < 999 ? l.days : "—" }]} />
            {l.days < 999 && <Meter value={Math.max(0, 365 - l.days)} max={365} tone={l.days < 30 ? "late" : "ok"} height={8} />}
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Papers on file</p>
              <ul className="space-y-1.5 text-[12.5px]">
                {["Previous licence copy", "Godown rent agreement (till Mar 2028)", "Competent person affidavit", "Fridge and cold room list with logger certificates", "Fee challan"].map((p, i) => (
                  <li key={p} className="flex items-center gap-2">
                    {i < 3 || l.status === "Renewal filed" ? <CheckCircle2 className="h-4 w-4 text-d-ok" /> : <AlertTriangle className="h-4 w-4 text-d-warn" />}
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Sheet>
      <Sheet
        open={!!h1Open}
        onOpenChange={(v) => !v && setH1Open(null)}
        eyebrow={h1Open ? `${h1Open.inv} · ${h1Open.time}` : ""}
        title={h1Open?.drug ?? ""}
        sub={h1Open ? `${h1Open.qty} units to ${h1Open.buyer}` : ""}
        footer={
          h1Open &&
          !h1Open.ok && (
            <Btn
              variant="solid"
              icon={CheckCircle2}
              onClick={() => {
                setH1((cur) => cur.map((z) => (z.id === h1Open.id ? { ...z, ok: true } : z)));
                toast.success(`Buyer DL ${h1Open.dl} verified`, { description: "Checked on the MP FDA licence search" });
                desk.log(`H1 buyer DL ${h1Open.dl} verified for ${h1Open.buyer}`, "ok");
                setH1Open(null);
              }}
            >
              Mark DL verified
            </Btn>
          )
        }
      >
        {h1Open && (
          <div className="space-y-4">
            <KV items={[{ k: "Batch", v: h1Open.batch }, { k: "Quantity", v: h1Open.qty }, { k: "Buyer", v: h1Open.buyer }, { k: "Buyer DL", v: h1Open.dl }, { k: "Entered by", v: "Marg, auto" }, { k: "Checked by", v: h1Open.ok ? "Neha Dubey" : "Pending" }]} />
            <p className="rounded-[10px] bg-d-sunk/70 px-3 py-2 text-[12.5px]">
              Schedule H1 sales must record the buyer, drug, batch and quantity, and be kept for three years. Sales to chemists without a valid DL are blocked in Marg.
            </p>
          </div>
        )}
      </Sheet>
    </div>
  );
}
