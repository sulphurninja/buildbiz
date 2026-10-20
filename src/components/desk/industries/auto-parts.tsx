"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Bot,
  CheckCheck,
  ClipboardCheck,
  Cog,
  Container,
  Crosshair,
  DollarSign,
  Factory,
  FileQuestion,
  Flame,
  Gauge as GaugeIcon,
  Globe,
  Hammer,
  IndianRupee,
  Mail,
  MessageCircle,
  Plug,
  Plus,
  Ruler,
  ScanLine,
  Send,
  ShieldCheck,
  Ship,
  Timer,
  TrainFront,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import { DeskShell, useDesk } from "../shell";
import { AreaChart, Bars, Donut, HBars, HeatGrid } from "../charts";
import { ApprovalQueue, Board, Checklist, Countdown, DataTable } from "../data";
import { AgentsModule, ConnectionsModule, IndependenceModule, PeopleModule } from "../common";
import { Btn, Field, inputClass, inr, KV, Meter, Modal, num, Panel, Pill, Segmented, Sheet, Stat } from "../ui";
import { useDrift } from "../hooks";
import type { DeskConfig, DeskModule, IndependenceData, Integration, TeamMember, Tone, WorkforceAgent } from "../types";

/* ============================================================
   Data — Sutlej Auto Components, Ludhiana. Fictional forged and
   machined driveline parts exporter. OEM and aftermarket part
   numbers below are illustrative, not real catalogue numbers.
   ============================================================ */

type DimKey = "bore" | "od" | "len" | "spl";
const DIMS: { key: DimKey; label: string; unit: string }[] = [
  { key: "bore", label: "Pilot bore", unit: "mm" },
  { key: "od", label: "Outer diameter", unit: "mm" },
  { key: "len", label: "Overall length", unit: "mm" },
  { key: "spl", label: "Spline count", unit: "teeth" },
];
type Dims = Record<DimKey, number>;
const d = (bore: number, od: number, len: number, spl: number): Dims => ({ bore, od, len, spl });

type Alt = { brand: string; no: string; country: string; off: Partial<Dims> };
type Part = {
  id: string;
  name: string;
  family: "Driveline" | "Axle" | "Gearbox" | "Tractor" | "Wheel end";
  material: string;
  oem: { maker: string; no: string; model: string };
  alts: Alt[];
  nom: Dims;
  tol: Dims;
  ours: Dims;
  fit: number;
  kg: number;
  fob: number;
  ppap: number;
  buyers: string[];
  cpk: number;
  note: string;
};

const parts: Part[] = [
  {
    id: "SAC-FY-1310", name: "Flange yoke, 1310 series", family: "Driveline", material: "EN19 forged, Q&T", oem: { maker: "Tata Motors", no: "2650 2512 0112", model: "Ace / Super Ace propshaft" },
    alts: [{ brand: "Vortex Driveline", no: "VD-1310-FY", country: "UK", off: { od: 0.01 } }, { brand: "Kaiser Teile", no: "KT 40.1310.16", country: "DE", off: { len: 0.05 } }, { brand: "Pampas Repuestos", no: "PR-FY1310", country: "AR", off: { bore: 0.008 } }],
    nom: d(28, 95, 62, 16), tol: d(0.021, 0.05, 0.2, 0), ours: d(28.006, 95.012, 62.06, 16), fit: 1, kg: 1.84, fob: 6.4, ppap: 3, buyers: ["Kaiser Teile", "Vortex Driveline"], cpk: 1.71, note: "Running part, 11 years. Same forging die as SAC-SY-1410.",
  },
  {
    id: "SAC-CV-2214", name: "CV joint outer stub, 22-spline", family: "Driveline", material: "20MnCr5, case-carburised", oem: { maker: "Maruti Suzuki", no: "44102M79F00", model: "Wagon R / Celerio LH" },
    alts: [{ brand: "Ridgeline Auto", no: "RA-CV2214", country: "US", off: { len: 0.1 } }, { brand: "Norte Parts", no: "NP-44102-22", country: "MX", off: {} }, { brand: "Pampas Repuestos", no: "PR-CV-2114", country: "AR", off: { spl: -1, od: 0.03 } }],
    nom: d(24, 78, 196, 22), tol: d(0.02, 0.05, 0.3, 0), ours: d(24.011, 78.02, 196.12, 22), fit: 2, kg: 2.31, fob: 9.8, ppap: 3, buyers: ["Ridgeline Auto", "Norte Parts"], cpk: 1.48, note: "Pampas lists a 21-spline variant under a similar number. Do not cross.",
  },
  {
    id: "SAC-AS-3360", name: "Rear axle half-shaft, 30-spline", family: "Axle", material: "42CrMo4, induction hardened", oem: { maker: "Ashok Leyland", no: "F2RE03801", model: "Dost+ rear axle" },
    alts: [{ brand: "Kaiser Teile", no: "KT 22.3360.30", country: "DE", off: { len: 0.2 } }, { brand: "Gulf Motor Spares", no: "GMS-AL-3801", country: "AE", off: {} }],
    nom: d(18, 38, 812, 30), tol: d(0.018, 0.04, 0.5, 0), ours: d(18.009, 38.031, 812.22, 30), fit: 2, kg: 7.9, fob: 21.5, ppap: 3, buyers: ["Gulf Motor Spares"], cpk: 1.36, note: "OD near the top of tolerance on lot 0914. Grinding offset corrected.",
  },
  {
    id: "SAC-PT-1386", name: "Tractor PTO shaft, 6-spline 1⅜\"", family: "Tractor", material: "EN8D, induction hardened", oem: { maker: "TAFE", no: "008 0421 6S", model: "MF 241 / 245 PTO" },
    alts: [{ brand: "Agrimek Parts", no: "AM-PTO-6S-35", country: "ZA", off: {} }, { brand: "Ridgeline Auto", no: "RA-PTO1386", country: "US", off: { len: 0.1 } }, { brand: "Campo Recambios", no: "CR 6S 1386", country: "ES", off: { od: 0.01 } }],
    nom: d(12, 34.925, 286, 6), tol: d(0.02, 0.03, 0.4, 0), ours: d(12.004, 34.93, 286.05, 6), fit: 0, kg: 2.62, fob: 7.2, ppap: 2, buyers: ["Agrimek Parts", "Campo Recambios"], cpk: 1.92, note: "Best Cpk in the plant. Spline rolled, not hobbed.",
  },
  {
    id: "SAC-SY-1410", name: "Slip yoke, 1410 series 16-spline", family: "Driveline", material: "EN19 forged, Q&T", oem: { maker: "Eicher", no: "EIC-2120-1410-16", model: "Pro 2049 propshaft" },
    alts: [{ brand: "Vortex Driveline", no: "VD-1410-SY", country: "UK", off: {} }, { brand: "Kaiser Teile", no: "KT 40.1410.16", country: "DE", off: { bore: 0.01 } }],
    nom: d(31.75, 63.5, 148, 16), tol: d(0.025, 0.05, 0.3, 0), ours: d(31.758, 63.515, 148.09, 16), fit: 1, kg: 2.05, fob: 8.1, ppap: 3, buyers: ["Vortex Driveline"], cpk: 1.58, note: "Shares the 1600T forging die family with SAC-FY-1310.",
  },
  {
    id: "SAC-HB-4108", name: "Front wheel hub, splined", family: "Wheel end", material: "C45 forged, normalised", oem: { maker: "Tata Motors", no: "2786 3360 0119", model: "Yodha pick-up 4x4" },
    alts: [{ brand: "Gulf Motor Spares", no: "GMS-TT-3360", country: "AE", off: { od: 0.02 } }, { brand: "Savanna Motor Parts", no: "SMP-HB4108", country: "KE", off: {} }],
    nom: d(52, 134, 88, 24), tol: d(0.025, 0.05, 0.25, 0), ours: d(52.01, 134.046, 88.08, 24), fit: 4, kg: 3.7, fob: 12.6, ppap: 3, buyers: ["Gulf Motor Spares", "Savanna Motor Parts"], cpk: 1.21, note: "OD runs close to the upper limit. Cpk under 1.33, on watch.",
  },
  {
    id: "SAC-IS-2723", name: "Gearbox input shaft, 23-spline", family: "Gearbox", material: "20MnCr5, case-carburised", oem: { maker: "Mahindra", no: "0302CAB00041N", model: "Bolero Pik-Up gearbox" },
    alts: [{ brand: "Norte Parts", no: "NP-MH-2723", country: "MX", off: {} }, { brand: "Savanna Motor Parts", no: "SMP-IS2723", country: "KE", off: { len: 0.1 } }],
    nom: d(16, 28.6, 231, 23), tol: d(0.018, 0.025, 0.3, 0), ours: d(16.007, 28.611, 231.11, 23), fit: 2, kg: 1.9, fob: 11.4, ppap: 3, buyers: ["Norte Parts"], cpk: 1.44, note: "Hobbed and shaved. Heat-treat distortion checked every lot.",
  },
  {
    id: "SAC-PN-4110", name: "Hypoid pinion blank, 10-spline", family: "Axle", material: "20MnCr5 forged blank", oem: { maker: "Ashok Leyland", no: "F8100410", model: "Partner rear axle" },
    alts: [{ brand: "Gulf Motor Spares", no: "GMS-AL-0410", country: "AE", off: { len: 0.2 } }, { brand: "Kaiser Teile", no: "KT 22.4110.10", country: "DE", off: {} }],
    nom: d(22, 46, 174, 10), tol: d(0.02, 0.04, 0.25, 0), ours: d(22.008, 46.016, 174.27, 10), fit: 4, kg: 3.1, fob: 10.9, ppap: 2, buyers: ["Kaiser Teile"], cpk: 1.12, note: "Length runs 0.27 over nominal against ±0.25. Needs engineering sign-off before crossing.",
  },
  {
    id: "SAC-SS-2508", name: "Synchro sleeve, 25-spline", family: "Gearbox", material: "16MnCr5 forged ring", oem: { maker: "Maruti Suzuki", no: "24411M68K00", model: "Swift / Dzire 3rd-4th" },
    alts: [{ brand: "Ridgeline Auto", no: "RA-SS2508", country: "US", off: {} }, { brand: "Norte Parts", no: "NP-24411", country: "MX", off: { od: 0.01 } }, { brand: "Campo Recambios", no: "CR 25 2508", country: "ES", off: {} }],
    nom: d(41, 62, 22, 25), tol: d(0.02, 0.03, 0.1, 0), ours: d(41.009, 62.012, 22.03, 25), fit: 2, kg: 0.42, fob: 3.9, ppap: 3, buyers: ["Ridgeline Auto", "Norte Parts"], cpk: 1.52, note: "Ring-rolled blank from Sahnewal forging partner.",
  },
  {
    id: "SAC-DS-2826", name: "Drive shaft stub, 28-spline", family: "Tractor", material: "EN19, induction hardened", oem: { maker: "Sonalika", no: "SON 1060 2826", model: "DI 745 rear axle" },
    alts: [{ brand: "Agrimek Parts", no: "AM-SON-2826", country: "ZA", off: {} }, { brand: "Campo Recambios", no: "CR 28 2826", country: "ES", off: { len: 0.2 } }],
    nom: d(20, 44.45, 318, 28), tol: d(0.02, 0.04, 0.4, 0), ours: d(20.009, 44.476, 318.16, 28), fit: 3, kg: 4.6, fob: 13.2, ppap: 2, buyers: ["Agrimek Parts"], cpk: 1.39, note: "Same bar stock as SAC-PT-1386.",
  },
];

function dev(p: Part, k: DimKey, v: number) {
  if (k === "spl") return v === p.nom.spl ? 0 : 9;
  return Math.abs(v - p.nom[k]) / p.tol[k];
}
function penalty(x: number) {
  if (x >= 9) return 45;
  return x <= 0.5 ? x * 4 : x <= 1 ? 2 + (x - 0.5) * 14 : 9 + (x - 1) * 40;
}
function confidence(p: Part, vals: Dims, fit = p.fit) {
  const pen = DIMS.reduce((a, dm) => a + penalty(dev(p, dm.key, vals[dm.key])), 0);
  return Math.max(0, Math.min(99, Math.round(100 - pen - fit)));
}
function altDims(p: Part, a: Alt): Dims {
  return { bore: p.nom.bore + (a.off.bore ?? 0), od: p.nom.od + (a.off.od ?? 0), len: p.nom.len + (a.off.len ?? 0), spl: p.nom.spl + (a.off.spl ?? 0) };
}
const norm = (s: string) => s.replace(/[\s\-./]/g, "").toUpperCase();
type Ref = { no: string; kind: "OEM" | "Aftermarket" | "Sutlej"; brand: string; part: string; alt?: number };
const refs: Ref[] = parts.flatMap((p) => [
  { no: p.oem.no, kind: "OEM" as const, brand: p.oem.maker, part: p.id },
  ...p.alts.map((a, i) => ({ no: a.no, kind: "Aftermarket" as const, brand: a.brand, part: p.id, alt: i })),
  { no: p.id, kind: "Sutlej" as const, brand: "Sutlej", part: p.id },
]);

function usd(v: number, compact = false) {
  if (compact) {
    if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(2).replace(/\.?0+$/, "")}M`;
    if (Math.abs(v) >= 1e3) return `$${(v / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return `$${v.toLocaleString("en-US", { minimumFractionDigits: v < 100 ? 2 : 0, maximumFractionDigits: 2 })}`;
}

/* ---------------- RFQs ---------------- */

type RfqStage = "New" | "Costing" | "Sample" | "Quoted" | "Won" | "Lost";
type Rfq = { id: string; buyer: string; country: string; cc: string; part: string; lines: number; volume: number; target: number; inHours: number; stage: RfqStage; owner: string; channel: "Email" | "WhatsApp" | "Portal" | "Trade fair"; note: string; kg: number; grade: Grade };
type Grade = "EN8D" | "EN19" | "20MnCr5" | "42CrMo4" | "C45";
const steel: Record<Grade, number> = { EN8D: 68, EN19: 84, "20MnCr5": 92, "42CrMo4": 98, C45: 71 };

const seedRfqs: Rfq[] = [
  { id: "RFQ-2611", buyer: "Kaiser Teile GmbH", country: "Germany", cc: "DE", part: "SAC-PN-4110", lines: 14, volume: 38000, target: 9.6, inHours: 5.5, stage: "Costing", owner: "Vikas", channel: "Email", note: "Pinion blanks and yokes for their Eastern Europe programme. Want PPAP L3.", kg: 3.4, grade: "20MnCr5" },
  { id: "RFQ-2614", buyer: "Ridgeline Auto Supply", country: "USA", cc: "US", part: "SAC-CV-2214", lines: 6, volume: 52000, target: 9.1, inHours: 9, stage: "Costing", owner: "Vikas", channel: "Portal", note: "Repeat of last year with +20% volume. Price target 7% under last PO.", kg: 2.6, grade: "20MnCr5" },
  { id: "RFQ-2617", buyer: "Gulf Motor Spares LLC", country: "UAE", cc: "AE", part: "SAC-HB-4108", lines: 9, volume: 14000, target: 12.0, inHours: 22, stage: "New", owner: "Manpreet", channel: "WhatsApp", note: "Hubs and half-shafts for Tata and Leyland LCVs in the GCC.", kg: 4.1, grade: "C45" },
  { id: "RFQ-2618", buyer: "Agrimek Parts (Pty) Ltd", country: "South Africa", cc: "ZA", part: "SAC-PT-1386", lines: 11, volume: 26000, target: 6.9, inHours: 30, stage: "New", owner: "Manpreet", channel: "Email", note: "Tractor PTO and stub shafts, MF and Sonalika fitment.", kg: 2.9, grade: "EN8D" },
  { id: "RFQ-2603", buyer: "Norte Parts SA de CV", country: "Mexico", cc: "MX", part: "SAC-IS-2723", lines: 4, volume: 9000, target: 10.8, inHours: 2.2, stage: "Sample", owner: "Vikas", channel: "Email", note: "Samples dispatched by DHL, they test fit next week.", kg: 2.1, grade: "20MnCr5" },
  { id: "RFQ-2620", buyer: "Campo Recambios SL", country: "Spain", cc: "ES", part: "SAC-SS-2508", lines: 7, volume: 18000, target: 3.6, inHours: 46, stage: "New", owner: "Manpreet", channel: "Trade fair", note: "Met at Automechanika. Price-sensitive, want CIF Valencia.", kg: 0.5, grade: "EN19" },
  { id: "RFQ-2598", buyer: "Vortex Driveline Ltd", country: "UK", cc: "GB", part: "SAC-SY-1410", lines: 5, volume: 12000, target: 8.3, inHours: 0, stage: "Quoted", owner: "Vikas", channel: "Email", note: "Quoted $8.05 FOB. Awaiting their board on Friday.", kg: 2.2, grade: "EN19" },
  { id: "RFQ-2622", buyer: "Savanna Motor Parts", country: "Kenya", cc: "KE", part: "SAC-HB-4108", lines: 8, volume: 7000, target: 13.5, inHours: 64, stage: "New", owner: "Manpreet", channel: "WhatsApp", note: "First enquiry. Wants LC at sight via KCB.", kg: 4.0, grade: "C45" },
  { id: "RFQ-2591", buyer: "Pampas Repuestos SRL", country: "Argentina", cc: "AR", part: "SAC-FY-1310", lines: 3, volume: 6000, target: 6.1, inHours: 0, stage: "Won", owner: "Vikas", channel: "Email", note: "PO received 14 Oct, first lot in December.", kg: 2.0, grade: "EN19" },
  { id: "RFQ-2585", buyer: "Autoteile Brenner", country: "Austria", cc: "AT", part: "SAC-AS-3360", lines: 2, volume: 4000, target: 18.2, inHours: 0, stage: "Lost", owner: "Manpreet", channel: "Portal", note: "Lost to a Turkish forger at $17.40.", kg: 8.4, grade: "42CrMo4" },
  { id: "RFQ-2624", buyer: "Kaiser Teile GmbH", country: "Germany", cc: "DE", part: "SAC-AS-3360", lines: 3, volume: 8000, target: 20.9, inHours: 70, stage: "New", owner: "Vikas", channel: "Email", note: "Half-shafts as a second package after the pinions.", kg: 8.4, grade: "42CrMo4" },
  { id: "RFQ-2609", buyer: "Ridgeline Auto Supply", country: "USA", cc: "US", part: "SAC-PT-1386", lines: 2, volume: 15000, target: 7.0, inHours: 15, stage: "Costing", owner: "Vikas", channel: "Portal", note: "Ag aftermarket, Midwest dealers.", kg: 2.9, grade: "EN8D" },
];

/* ---------------- Export lots ---------------- */

const LOT_STAGES = ["Packing", "At ICD", "On rail", "Sailed", "Delivered"] as const;
type LotStage = (typeof LOT_STAGES)[number];
const DOCS = ["Commercial invoice", "Packing list", "Certificate of origin", "Shipping bill", "ISPM-15 crate cert", "Bill of lading"] as const;
type Lot = { id: string; buyer: string; cc: string; country: string; port: string; box: "20' GP" | "40' HC"; stage: LotStage; crates: number; cbm: number; kg: number; fob: number; etdIn: number; line: string; docs: number; parts: string };

const seedLots: Lot[] = [
  { id: "EXL-0931", buyer: "Kaiser Teile", cc: "DE", country: "Germany", port: "Hamburg", box: "20' GP", stage: "Packing", crates: 18, cbm: 19.4, kg: 16800, fob: 61200, etdIn: 6 * 24, line: "Hapag-Lloyd", docs: 2, parts: "FY-1310, SY-1410, PN-4110" },
  { id: "EXL-0932", buyer: "Ridgeline Auto", cc: "US", country: "USA", port: "Savannah", box: "40' HC", stage: "Packing", crates: 31, cbm: 48.2, kg: 21900, fob: 118400, etdIn: 8 * 24, line: "MSC", docs: 1, parts: "CV-2214, SS-2508" },
  { id: "EXL-0927", buyer: "Gulf Motor Spares", cc: "AE", country: "UAE", port: "Jebel Ali", box: "20' GP", stage: "At ICD", crates: 22, cbm: 24.1, kg: 18200, fob: 74900, etdIn: 2.5 * 24, line: "ONE", docs: 4, parts: "HB-4108, AS-3360" },
  { id: "EXL-0928", buyer: "Norte Parts", cc: "MX", country: "Mexico", port: "Manzanillo", box: "40' HC", stage: "At ICD", crates: 26, cbm: 52.6, kg: 19400, fob: 96300, etdIn: 3 * 24, line: "CMA CGM", docs: 3, parts: "IS-2723, CV-2214" },
  { id: "EXL-0924", buyer: "Agrimek Parts", cc: "ZA", country: "South Africa", port: "Durban", box: "20' GP", stage: "On rail", crates: 20, cbm: 22.8, kg: 17600, fob: 52800, etdIn: 1.5 * 24, line: "Maersk", docs: 5, parts: "PT-1386, DS-2826" },
  { id: "EXL-0925", buyer: "Vortex Driveline", cc: "GB", country: "UK", port: "Felixstowe", box: "20' GP", stage: "On rail", crates: 16, cbm: 17.9, kg: 14100, fob: 49700, etdIn: 1 * 24, line: "Maersk", docs: 5, parts: "FY-1310, SY-1410" },
  { id: "EXL-0919", buyer: "Campo Recambios", cc: "ES", country: "Spain", port: "Valencia", box: "20' GP", stage: "Sailed", crates: 14, cbm: 15.2, kg: 9800, fob: 33600, etdIn: 0, line: "MSC", docs: 6, parts: "SS-2508, PT-1386" },
  { id: "EXL-0920", buyer: "Kaiser Teile", cc: "DE", country: "Germany", port: "Hamburg", box: "40' HC", stage: "Sailed", crates: 29, cbm: 50.4, kg: 22600, fob: 128900, etdIn: 0, line: "Hapag-Lloyd", docs: 6, parts: "AS-3360, PN-4110, FY-1310" },
  { id: "EXL-0921", buyer: "Savanna Motor Parts", cc: "KE", country: "Kenya", port: "Mombasa", box: "20' GP", stage: "Sailed", crates: 12, cbm: 13.6, kg: 11200, fob: 41800, etdIn: 0, line: "ONE", docs: 6, parts: "HB-4108" },
  { id: "EXL-0914", buyer: "Ridgeline Auto", cc: "US", country: "USA", port: "Savannah", box: "40' HC", stage: "Delivered", crates: 30, cbm: 47.1, kg: 21300, fob: 112600, etdIn: 0, line: "MSC", docs: 6, parts: "CV-2214" },
  { id: "EXL-0912", buyer: "Gulf Motor Spares", cc: "AE", country: "UAE", port: "Jebel Ali", box: "20' GP", stage: "Delivered", crates: 21, cbm: 23.3, kg: 17900, fob: 70100, etdIn: 0, line: "ONE", docs: 6, parts: "HB-4108, AS-3360" },
];
const boxCap = (b: Lot["box"]) => (b === "20' GP" ? { cbm: 28, kg: 21800 } : { cbm: 68, kg: 26500 });

/* ---------------- Quality ---------------- */

const PPAP_ELEMENTS = [
  "Design records", "Engineering change documents", "Customer engineering approval", "Design FMEA", "Process flow diagram", "Process FMEA", "Control plan", "MSA studies", "Dimensional results",
  "Material and performance tests", "Initial process studies", "Qualified lab documentation", "Appearance approval report", "Sample production parts", "Master sample", "Checking aids", "Customer-specific requirements", "Part submission warrant",
];
type PpapStatus = "Approved" | "Submitted" | "In prep" | "Interim" | "Rejected";
type Ppap = { id: string; part: string; customer: string; level: number; done: number; status: PpapStatus; due: string; eng: string; reason: string };
const seedPpaps: Ppap[] = [
  { id: "PP-118", part: "SAC-PN-4110", customer: "Kaiser Teile", level: 3, done: 13, status: "In prep", due: "28 Oct", eng: "Amandeep", reason: "New part, RFQ-2611 depends on it" },
  { id: "PP-117", part: "SAC-CV-2214", customer: "Ridgeline Auto", level: 3, done: 18, status: "Submitted", due: "22 Oct", eng: "Amandeep", reason: "Annual re-validation" },
  { id: "PP-116", part: "SAC-HB-4108", customer: "Gulf Motor Spares", level: 3, done: 16, status: "Interim", due: "25 Oct", eng: "Jaspreet", reason: "Cpk 1.21 under 1.33, interim approval for 3 lots" },
  { id: "PP-115", part: "SAC-IS-2723", customer: "Norte Parts", level: 3, done: 15, status: "In prep", due: "30 Oct", eng: "Jaspreet", reason: "Sample lot for RFQ-2603" },
  { id: "PP-114", part: "SAC-PT-1386", customer: "Agrimek Parts", level: 2, done: 18, status: "Approved", due: "—", eng: "Amandeep", reason: "Approved 9 Oct" },
  { id: "PP-113", part: "SAC-SY-1410", customer: "Vortex Driveline", level: 3, done: 18, status: "Approved", due: "—", eng: "Jaspreet", reason: "Approved 2 Oct" },
  { id: "PP-112", part: "SAC-AS-3360", customer: "Gulf Motor Spares", level: 3, done: 18, status: "Approved", due: "—", eng: "Amandeep", reason: "Approved after grinding offset fix" },
  { id: "PP-111", part: "SAC-DS-2826", customer: "Agrimek Parts", level: 2, done: 11, status: "Rejected", due: "24 Oct", eng: "Jaspreet", reason: "Hardness depth report on wrong format" },
  { id: "PP-110", part: "SAC-SS-2508", customer: "Ridgeline Auto", level: 3, done: 18, status: "Approved", due: "—", eng: "Amandeep", reason: "Approved 18 Sep" },
  { id: "PP-109", part: "SAC-FY-1310", customer: "Pampas Repuestos", level: 2, done: 9, status: "In prep", due: "6 Nov", eng: "Jaspreet", reason: "New buyer, first lot in December" },
  { id: "PP-108", part: "SAC-FY-1310", customer: "Kaiser Teile", level: 3, done: 18, status: "Approved", due: "—", eng: "Amandeep", reason: "Approved 2 Sep" },
  { id: "PP-107", part: "SAC-SS-2508", customer: "Campo Recambios", level: 1, done: 4, status: "In prep", due: "12 Nov", eng: "Jaspreet", reason: "Level 1 warrant only" },
];
const ppapTone: Record<PpapStatus, Tone> = { Approved: "ok", Submitted: "info", "In prep": "warn", Interim: "accent", Rejected: "late" };

/* ---------------- Production ---------------- */

type Line = { id: string; name: string; kind: "Forging" | "Machining" | "Heat treat"; part: string; oee: number; perHr: number; base: number; die: number; operator: string; status: "Running" | "Die change" | "Down"; hourly: number[] };
const lines: Line[] = [
  { id: "F1", name: "1600T forging press", kind: "Forging", part: "SAC-FY-1310", oee: 74, perHr: 210, base: 1384, die: 22, operator: "Sukhwinder", status: "Running", hourly: [62, 70, 76, 79, 72, 74, 77, 75, 73, 74] },
  { id: "F2", name: "1000T forging press", kind: "Forging", part: "SAC-HB-4108", oee: 68, perHr: 140, base: 902, die: 61, operator: "Balwinder", status: "Running", hourly: [58, 66, 69, 71, 64, 70, 68, 67, 69, 68] },
  { id: "F3", name: "Upsetter 4\"", kind: "Forging", part: "SAC-AS-3360", oee: 0, perHr: 90, base: 312, die: 8, operator: "Gurmeet", status: "Die change", hourly: [71, 74, 72, 70, 66, 0, 0, 0, 0, 0] },
  { id: "M1", name: "CNC cell A, turning", kind: "Machining", part: "SAC-CV-2214", oee: 82, perHr: 64, base: 548, die: 74, operator: "Rakesh", status: "Running", hourly: [78, 81, 84, 83, 80, 82, 85, 83, 82, 82] },
  { id: "M2", name: "CNC cell B, VMC", kind: "Machining", part: "SAC-FY-1310", oee: 79, perHr: 72, base: 604, die: 55, operator: "Pardeep", status: "Running", hourly: [74, 77, 80, 81, 78, 79, 80, 79, 78, 79] },
  { id: "M3", name: "Spline rolling", kind: "Machining", part: "SAC-PT-1386", oee: 86, perHr: 120, base: 1062, die: 47, operator: "Harjit", status: "Running", hourly: [84, 86, 88, 87, 85, 86, 87, 86, 86, 86] },
  { id: "H1", name: "Induction hardening", kind: "Heat treat", part: "SAC-AS-3360", oee: 71, perHr: 80, base: 522, die: 90, operator: "Deepak", status: "Running", hourly: [66, 70, 72, 74, 69, 71, 72, 70, 71, 71] },
  { id: "H2", name: "Sealed quench furnace", kind: "Heat treat", part: "SAC-CV-2214", oee: 0, perHr: 600, base: 1440, die: 100, operator: "Ajay", status: "Down", hourly: [80, 82, 81, 80, 0, 0, 0, 0, 0, 0] },
];
const hours = ["8", "9", "10", "11", "12", "1", "2", "3", "4", "5"];

type Die = { id: string; part: string; press: string; used: number; life: number; resinks: number; last: string; spot: string };
const seedDies: Die[] = [
  { id: "D-1310-A", part: "SAC-FY-1310", press: "1600T", used: 15600, life: 20000, resinks: 3, last: "12 Sep", spot: "On press" },
  { id: "D-1310-B", part: "SAC-FY-1310", press: "1600T", used: 4200, life: 20000, resinks: 1, last: "4 Oct", spot: "Die store, rack 3" },
  { id: "D-4108-A", part: "SAC-HB-4108", press: "1000T", used: 7800, life: 20000, resinks: 2, last: "20 Sep", spot: "On press" },
  { id: "D-3360-U", part: "SAC-AS-3360", press: "Upsetter", used: 13800, life: 15000, resinks: 4, last: "28 Aug", spot: "Being changed" },
  { id: "D-1410-A", part: "SAC-SY-1410", press: "1600T", used: 9100, life: 20000, resinks: 2, last: "16 Sep", spot: "Die store, rack 1" },
  { id: "D-4110-A", part: "SAC-PN-4110", press: "1000T", used: 1100, life: 18000, resinks: 0, last: "new", spot: "Die store, rack 2" },
  { id: "D-2826-A", part: "SAC-DS-2826", press: "Upsetter", used: 11900, life: 15000, resinks: 3, last: "2 Sep", spot: "Die store, rack 4" },
  { id: "D-2214-T", part: "SAC-CV-2214", press: "1000T", used: 17200, life: 18000, resinks: 5, last: "5 Aug", spot: "Die store, rack 2" },
  { id: "D-2508-R", part: "SAC-SS-2508", press: "Ring roller", used: 6300, life: 25000, resinks: 1, last: "30 Sep", spot: "Die store, rack 5" },
  { id: "D-2723-A", part: "SAC-IS-2723", press: "1000T", used: 3900, life: 18000, resinks: 0, last: "new", spot: "Die store, rack 2" },
];

/* ---------------- Forex ---------------- */

type Cur = "USD" | "EUR" | "GBP";
const baseRate: Record<Cur, number> = { USD: 84.12, EUR: 91.64, GBP: 109.38 };
type Recv = { inv: string; buyer: string; cur: Cur; amt: number; dueIn: number; status: "Awaiting" | "Overdue" | "Realised"; ebrc: boolean; bank: string };
const seedRecv: Recv[] = [
  { inv: "SAC/EX/24-25/188", buyer: "Kaiser Teile", cur: "EUR", amt: 118200, dueIn: 12, status: "Awaiting", ebrc: false, bank: "SBI Ludhiana" },
  { inv: "SAC/EX/24-25/184", buyer: "Ridgeline Auto", cur: "USD", amt: 112600, dueIn: -9, status: "Overdue", ebrc: false, bank: "HDFC Ferozepur Rd" },
  { inv: "SAC/EX/24-25/186", buyer: "Gulf Motor Spares", cur: "USD", amt: 70100, dueIn: 4, status: "Awaiting", ebrc: false, bank: "SBI Ludhiana" },
  { inv: "SAC/EX/24-25/181", buyer: "Vortex Driveline", cur: "GBP", amt: 38400, dueIn: -2, status: "Overdue", ebrc: false, bank: "HDFC Ferozepur Rd" },
  { inv: "SAC/EX/24-25/179", buyer: "Norte Parts", cur: "USD", amt: 88300, dueIn: 0, status: "Realised", ebrc: true, bank: "SBI Ludhiana" },
  { inv: "SAC/EX/24-25/190", buyer: "Campo Recambios", cur: "EUR", amt: 30900, dueIn: 41, status: "Awaiting", ebrc: false, bank: "SBI Ludhiana" },
  { inv: "SAC/EX/24-25/191", buyer: "Kaiser Teile", cur: "EUR", amt: 117800, dueIn: 52, status: "Awaiting", ebrc: false, bank: "SBI Ludhiana" },
  { inv: "SAC/EX/24-25/192", buyer: "Savanna Motor Parts", cur: "USD", amt: 41800, dueIn: 28, status: "Awaiting", ebrc: false, bank: "HDFC Ferozepur Rd" },
  { inv: "SAC/EX/24-25/175", buyer: "Agrimek Parts", cur: "USD", amt: 49600, dueIn: 0, status: "Realised", ebrc: true, bank: "HDFC Ferozepur Rd" },
  { inv: "SAC/EX/24-25/176", buyer: "Gulf Motor Spares", cur: "USD", amt: 66200, dueIn: 0, status: "Realised", ebrc: false, bank: "SBI Ludhiana" },
  { inv: "SAC/EX/24-25/193", buyer: "Agrimek Parts", cur: "USD", amt: 52800, dueIn: 60, status: "Awaiting", ebrc: false, bank: "HDFC Ferozepur Rd" },
  { inv: "SAC/EX/24-25/172", buyer: "Ridgeline Auto", cur: "USD", amt: 104900, dueIn: 0, status: "Realised", ebrc: true, bank: "HDFC Ferozepur Rd" },
];
type Fwd = { id: string; bank: string; cur: Cur; amt: number; rate: number; maturity: string };
const seedFwd: Fwd[] = [
  { id: "FC-0412", bank: "SBI Treasury", cur: "USD", amt: 150000, rate: 84.46, maturity: "15 Nov" },
  { id: "FC-0409", bank: "HDFC Bank", cur: "USD", amt: 100000, rate: 84.21, maturity: "29 Nov" },
  { id: "FC-0411", bank: "SBI Treasury", cur: "EUR", amt: 120000, rate: 92.1, maturity: "5 Dec" },
  { id: "FC-0405", bank: "HDFC Bank", cur: "GBP", amt: 40000, rate: 108.9, maturity: "2 Nov" },
  { id: "FC-0414", bank: "Kotak Mahindra", cur: "USD", amt: 75000, rate: 84.62, maturity: "20 Dec" },
];

/* ---------------- Shared ---------------- */

const team: TeamMember[] = [
  { name: "Gurpreet Singh Sandhu", role: "Owner", status: "Busy", load: 92, focus: "Kaiser pinion price, SBI forward cover, 1600T die decision", tasks: [{ title: "Sign off RFQ-2611 pricing", due: "11:00" }, { title: "Forward cover call with SBI", due: "2:30" }, { title: "Approve die resink for D-2214-T", due: "4:00" }], week: [1, 1, 1, 1, 1, 1], since: "1998" },
  { name: "Manpreet Kaur", role: "Export manager", status: "Busy", load: 84, focus: "Two containers stuffing at ICD Dhandari Kalan; Gulf hub RFQ", tasks: [{ title: "Shipping bill for EXL-0927", due: "12:00" }, { title: "Reply Gulf Motor Spares", due: "3:00" }, { title: "Book MSC slot for EXL-0932", due: "5:00", done: true }], week: [1, 1, 1, 1, 1, 1], since: "2012" },
  { name: "Rajiv Bansal", role: "Plant head", status: "On floor", load: 88, focus: "Sealed quench furnace down since 12; Upsetter die change", tasks: [{ title: "Furnace thermocouple replacement", due: "now" }, { title: "Shift plan for Saturday", due: "6:00" }], week: [1, 1, 1, 1, 1, 1], since: "2009" },
  { name: "Amandeep Saini", role: "Quality and PPAP engineer", status: "On floor", load: 79, focus: "PP-118 Kaiser pinion: 5 elements left", tasks: [{ title: "Dimensional results PN-4110", due: "1:00" }, { title: "MSA study on spline gauge", due: "Thu" }, { title: "8D reply to Ridgeline", due: "5:00" }], week: [1, 1, 1, 0, 1, 1], since: "2016" },
  { name: "Vikas Arora", role: "Costing and RFQs", status: "Busy", load: 90, focus: "RFQ-2611 and RFQ-2614 costing due today", tasks: [{ title: "Kaiser pinion cost sheet", due: "10:30" }, { title: "Ridgeline CV stub reprice", due: "4:00" }], week: [1, 1, 1, 1, 1, 0], since: "2018" },
  { name: "Sukhwinder Singh", role: "Forge shop in-charge", status: "On floor", load: 74, focus: "1600T at 74% OEE, die D-1310-A at 78% life", tasks: [{ title: "Upsetter die change", due: "11:30" }, { title: "Billet shear blade change", due: "3:00", done: true }], week: [1, 1, 1, 1, 1, 1], since: "2004" },
  { name: "Neha Malhotra", role: "Accounts and EXIM documents", status: "In field", load: 62, focus: "At SBI for the Ridgeline overdue and eBRC batch", tasks: [{ title: "File RoDTEP claim, Sept shipping bills", due: "today" }, { title: "IGST refund mismatch, 2 SBs", due: "Fri" }], week: [1, 1, 0, 1, 1, 1], since: "2019" },
  { name: "Ravinder Kumar", role: "Dispatch and packing", status: "On floor", load: 70, focus: "VCI wrapping and ISPM-15 crates for EXL-0931", tasks: [{ title: "Crate stencils for Kaiser", due: "2:00" }, { title: "Truck to ICD for EXL-0928", due: "6:00" }], week: [1, 1, 1, 1, 1, 1], since: "2014" },
];

const agents: WorkforceAgent[] = [
  { name: "Cross-ref Clerk", role: "Answers buyer part-number queries with a match sheet", icon: ScanLine, status: "Running", runsToday: 47, hoursSaved: 7.5, accuracy: 96, last: "2 min ago", skills: ["OEM catalogues", "Drawings", "CMM data"], schedule: "On every buyer email or WhatsApp", log: ["Matched KT 30.2214.22 to SAC-CV-2214 at 92%", "Flagged PR-CV-2114: 21 splines, not our part", "Sent 6 match sheets to Ridgeline"] },
  { name: "RFQ Costing", role: "Drafts cost sheets from drawings and today's steel rates", icon: FileQuestion, status: "Needs you", runsToday: 5, hoursSaved: 6, accuracy: 89, last: "14 min ago", skills: ["Forging weight", "Cycle times", "Steel index"], schedule: "On every new RFQ", inbox: [{ title: "RFQ-2611 lands at $9.84, target $9.60", detail: "Kaiser wants 2.5% lower. Dropping to 14% margin meets it; the 20MnCr5 price rise last week is the gap." }], log: ["Costed RFQ-2614 at $9.06 vs target $9.10", "Pulled JSW 20MnCr5 at ₹92/kg", "Queued RFQ-2617 for Manpreet"] },
  { name: "Lot Packer", role: "Plans crates, VCI and container fill for every lot", icon: Container, status: "Running", runsToday: 8, hoursSaved: 3, accuracy: 94, last: "38 min ago", skills: ["Crate plans", "Payload", "ISPM-15"], schedule: "When a lot is released", log: ["EXL-0932 fits 31 crates in one 40' HC", "EXL-0931 at 69% fill, room for 4 crates", "Stencils sent to Ravinder"] },
  { name: "PPAP Tracker", role: "Chases the 18 elements and buyer deadlines", icon: ShieldCheck, status: "Needs you", runsToday: 6, hoursSaved: 4, accuracy: 92, last: "1 h ago", skills: ["PPAP", "Control plans", "Cpk"], schedule: "Daily 9 AM and 3 PM", inbox: [{ title: "PP-111 rejected by Agrimek", detail: "Case-depth report must be on their template. Draft ready, needs Amandeep's signature." }], log: ["PP-117 submitted to Ridgeline portal", "PP-116 interim approval for 3 lots", "Reminded Amandeep on PN-4110 dimensional"] },
  { name: "Die Life Watch", role: "Counts strokes and books resinks before dies crack", icon: Hammer, status: "Running", runsToday: 12, hoursSaved: 2.5, accuracy: 97, last: "6 min ago", skills: ["Stroke counters", "Die store", "Toolroom"], schedule: "Every 15 min", log: ["D-2214-T at 96% life, resink booked", "D-1310-A crosses 78%", "Upsetter die change logged at 11:12"] },
  { name: "Forex Desk", role: "Tracks receivables, covers and export incentives", icon: Banknote, status: "Idle", runsToday: 3, hoursSaved: 3.5, accuracy: 91, last: "2 h ago", skills: ["SBI treasury", "ICEGATE", "eBRC"], schedule: "Daily 10 AM and 4 PM", log: ["USD exposure unhedged at 29%", "RoDTEP for 9 shipping bills ready to file", "Ridgeline 9 days overdue, nudged"] },
];

const independence: IndependenceData = {
  score: 41,
  history: [26, 29, 31, 33, 36, 38, 41],
  quote: "Buyers in Germany still send the drawing to my personal email, because twenty years ago that was the only email we had.",
  pillars: [
    { name: "Sales & buyers", score: 44, note: "Kaiser and Ridgeline still expect Gurpreet on every price call.", fixes: [{ title: "Cross-ref sheets go out without the owner", gain: 3 }, { title: "Manpreet owns the GCC and Africa buyers", gain: 2 }] },
    { name: "Costing & RFQs", score: 36, note: "Vikas builds the sheet, but the margin is decided in the owner's head.", fixes: [{ title: "Margin floors by part family", gain: 4 }, { title: "Live steel index in the cost sheet", gain: 2 }] },
    { name: "Plant & dies", score: 48, note: "Die changes and resinks happen on time, but the call to scrap a die is the owner's.", fixes: [{ title: "Resink rules by stroke count", gain: 2 }] },
    { name: "Quality & PPAP", score: 52, note: "Amandeep runs PPAP well. Customer complaints still go to Gurpreet first.", fixes: [{ title: "8D owner by customer", gain: 2 }] },
    { name: "Exports & docs", score: 45, note: "Manpreet and Neha do the papers; the owner signs every shipping bill.", fixes: [{ title: "Digital signature for Neha on ICEGATE", gain: 3 }] },
    { name: "Money & forex", score: 28, note: "Every forward cover is booked by the owner on the phone.", fixes: [{ title: "Hedging policy: 60% of 90-day exposure", gain: 4 }, { title: "Forex Desk books within the band", gain: 3 }] },
    { name: "Owner time", score: 34, note: "Gurpreet spends 13 hours a week on pricing and treasury.", fixes: [{ title: "Two pricing windows a week", gain: 2 }] },
  ],
  ownerHours: [
    { label: "Pricing", hours: 8 },
    { label: "Buyer calls", hours: 10 },
    { label: "Treasury", hours: 5 },
    { label: "Plant rounds", hours: 6 },
    { label: "Doc signing", hours: 4 },
    { label: "Hiring", hours: 2 },
    { label: "New buyers", hours: 2 },
  ],
};

const integrations: Integration[] = [
  { name: "Tally Prime", category: "Accounts", status: "Connected", detail: "Export invoices, purchase of steel, buyer ledgers in three currencies.", synced: "4 min ago", records: "18,420 vouchers", mark: "T", color: "#1c4f9c" },
  { name: "ICEGATE", category: "Customs", status: "Connected", detail: "Shipping bills, LEO status, IGST refund scrolls.", synced: "22 min ago", records: "312 shipping bills", mark: "IG", color: "#0f766e" },
  { name: "DGFT portal", category: "Incentives", status: "Syncing", detail: "RoDTEP scrips, EPCG obligation and IEC profile.", synced: "running", records: "48 scrips", mark: "DG", color: "#b45309" },
  { name: "WhatsApp Business", category: "Messaging", status: "Connected", detail: "Buyer queries from the GCC and Africa, dispatch updates.", synced: "just now", records: "1,860 chats", mark: "W", color: "#1f9d55" },
  { name: "Outlook (exports@)", category: "Messaging", status: "Connected", detail: "RFQs, drawings and PPAP threads parsed into the desk.", synced: "3 min ago", records: "6,240 threads", mark: "O", color: "#2563eb" },
  { name: "Zeiss CMM export", category: "Quality", status: "Connected", detail: "CMM reports from the metrology room, per part and lot.", synced: "18 min ago", records: "2,104 reports", mark: "Z", color: "#4b5563" },
  { name: "Press stroke counters", category: "Plant", status: "Syncing", detail: "Live strokes from 1600T, 1000T and the upsetter.", synced: "live", records: "3 presses", mark: "PC", color: "#ea580c" },
  { name: "SBI Trade Finance", category: "Banking", status: "Error", detail: "Forward contract feed: certificate expired, renew in net banking.", synced: "3 days ago", records: "—", mark: "SB", color: "#1e3a8a" },
  { name: "Ridgeline supplier portal", category: "Buyers", status: "Connected", detail: "POs, ASNs and PPAP uploads for Ridgeline Auto.", synced: "1 h ago", records: "84 POs", mark: "RA", color: "#7c3aed" },
  { name: "ShipmentLink", category: "Logistics", status: "Available", detail: "Container tracking across Maersk, MSC, Hapag and ONE.", synced: "—", records: "—", mark: "SL", color: "#0891b2" },
];

/* ============================================================
   Config
   ============================================================ */

const config: DeskConfig = {
  slug: "auto-parts",
  company: "Sutlej Auto Components",
  brand: "Sutlej Auto",
  city: "Ludhiana",
  state: "PB",
  icon: Cog,
  tagline: "Forged and machined driveline parts to 11 countries · 3 presses · 6 machining cells · 186 people",
  owner: { name: "Gurpreet Singh Sandhu", first: "Gurpreet", initials: "GS", role: "Managing partner" },
  theme: {
    variant: "control",
    paper: "#111316",
    panel: "#181b1f",
    sunk: "#22262b",
    ink: "#eceef1",
    mute: "#8e959e",
    line: "#2b3036",
    accent: "#ff7a1a",
    accentInk: "#1a0c02",
    soft: "#2e2117",
    ok: "#4cc38a",
    warn: "#f2c14e",
    late: "#ff5d5d",
    info: "#5aa9e6",
    heading: "mono",
  },
  pulse: [
    { label: "Cross-ref matches today", value: "47", delta: "+12", trend: [21, 26, 30, 28, 35, 41, 47], module: "match" },
    { label: "RFQ pipeline / yr", value: "$1.81M", delta: "+8%", trend: [1.3, 1.4, 1.5, 1.6, 1.7, 1.75, 1.81], module: "rfqs" },
    { label: "Containers moving", value: "9", delta: "+2", trend: [5, 6, 6, 7, 8, 7, 9], tone: "info", module: "lots" },
    { label: "Customer ppm", value: "182", delta: "-34", good: true, trend: [260, 241, 230, 222, 210, 216, 182], tone: "ok", module: "quality" },
    { label: "Export receivables", value: "₹5.2 Cr", delta: "+4%", good: false, trend: [4.4, 4.6, 4.7, 4.9, 5.0, 4.9, 5.2], tone: "warn", module: "forex" },
  ],
  agenda: [
    { at: 9, title: "Forge shop round", detail: "Upsetter die change, furnace down", tone: "warn", module: "production" },
    { at: 10.5, title: "RFQ pricing window", detail: "Kaiser and Ridgeline due today", count: 3, tone: "accent", module: "rfqs" },
    { at: 12, title: "PPAP review", detail: "PP-118 pinion, 5 elements left", count: 5, tone: "info", module: "quality" },
    { at: 14.5, title: "Forward cover call, SBI", detail: "29% of 90-day USD unhedged", tone: "warn", module: "forex" },
    { at: 16, title: "Container stuffing at ICD", detail: "EXL-0927 and EXL-0928", count: 2, tone: "info", module: "lots" },
    { at: 18, title: "Day close", detail: "Strokes, rejections and lookups", tone: "ok", module: "match" },
  ],
  activity: [
    { time: "11:42 AM", text: "Cross-ref Clerk matched KT 30.2214.22 to SAC-CV-2214 at 92%", tone: "ok" },
    { time: "11:20 AM", text: "Sealed quench furnace tripped on zone-3 thermocouple", tone: "late" },
    { time: "11:12 AM", text: "Upsetter die D-3360-U change started", tone: "warn" },
    { time: "10:46 AM", text: "Ridgeline uploaded PO 4471-22 for 26,000 CV stubs", tone: "info" },
    { time: "10:05 AM", text: "EXL-0925 railed out of ICD Dhandari Kalan to Mundra", tone: "ok" },
    { time: "9:30 AM", text: "USD/INR opened at 84.12, forward premium 1.9%", tone: "neutral" },
  ],
  asks: [
    { q: "Do we make an equivalent for Kaiser KT 30.2214.22?", a: "Yes: SAC-CV-2214, our CV joint outer stub, 22-spline.\n\n• OEM: Maruti Suzuki 44102M79F00 (Wagon R / Celerio LH).\n• Our CMM means: bore 24.011 (±0.020), OD 78.020 (±0.050), length 196.12 (±0.30), 22 splines.\n• Match confidence 92%; the lowest margin is the bore at 55% of tolerance.\n\nCareful: Pampas PR-CV-2114 looks similar but is 21-spline. Do not cross it.", sources: ["Part-match engine", "Zeiss CMM lot 1012", "Kaiser catalogue 2026"] },
    { q: "Which RFQs need a price from me today?", a: "Three are under 12 hours:\n• RFQ-2603 Norte Parts, samples out, reply due in about 2 h.\n• RFQ-2611 Kaiser Teile pinions: costed at $9.84 vs target $9.60. At 14% margin we meet it.\n• RFQ-2614 Ridgeline CV stubs: costed at $9.06 vs target $9.10, can go as is.\n\nRidgeline is +20% volume on last year, worth about $470k a year.", sources: ["RFQs", "RFQ Costing agent", "JSW steel price list"] },
    { q: "Why is the furnace down and what does it hold up?", a: "The sealed quench furnace tripped at 11:20 on the zone-3 thermocouple. Rajiv has a spare; restart and soak take about 3 hours.\n\nIt holds 3,600 CV stubs for EXL-0932 (Ridgeline, MSC slot on the 28th). If it is back by 3 PM the lot still makes the rail on Friday. If not, move 1,200 pcs to the outside heat-treater in Focal Point Phase 8.", sources: ["Production", "Plant log 11:20"] },
    { q: "How much forex is unhedged?", a: "90-day exposure is about ₹5.2 Cr across USD, EUR and GBP. Forward covers total $3.25L USD, €1.2L and £40k.\n\n• USD: 29% unhedged\n• EUR: 0% unhedged on what is due before 5 Dec\n• GBP: Vortex £38.4k is 2 days overdue, already covered\n\nAt today's 84.12 spot and the 1.9% premium, a 60-day USD cover locks about 84.65.", sources: ["Forex & payments", "SBI treasury rate sheet"] },
    { q: "Which parts are close to a quality problem?", a: "Two parts have Cpk under 1.33:\n• SAC-HB-4108 front hub, Cpk 1.21, with OD near the top limit. Gulf Motor Spares gave interim approval for 3 lots.\n• SAC-PN-4110 pinion blank, Cpk 1.12, with length 0.27 over nominal against ±0.25. It needs engineering sign-off before we cross it for Kaiser.\n\nCustomer ppm is 182 against a target of 250.", sources: ["Quality & PPAP", "CMM reports"] },
    { q: "Draft a reply to Gulf Motor Spares on their hub RFQ", a: "Draft (not sent):\n\n“Dear Mr Khalid, thank you for RFQ-2617. We make 7 of the 9 hubs and half-shafts on your list today; cross-reference sheets with CMM data are attached. The two Leyland half-shafts need a new die, 6 weeks. Indicative FOB Mundra: $12.40 for the Yodha hub at 14,000 pcs a year. PPAP Level 3 is already approved for SAC-AS-3360. Regards, Manpreet Kaur, Sutlej Auto Components”", sources: ["Part-match engine", "RFQs", "PPAP register"] },
  ],
  run: {
    label: "Runs every morning at 8 and again at 2. You can also run it now.",
    title: "Export Desk Sweep",
    steps: [
      { text: "Read 9 new buyer emails and WhatsApp queries", result: "14 part numbers to cross-reference" },
      { text: "Run every number through the part-match engine", result: "12 matched above 85%, 1 needs sign-off, 1 not ours" },
      { text: "Re-cost open RFQs on today's steel index", result: "RFQ-2611 is $0.24 over target" },
      { text: "Check lots against rail and vessel cut-offs", result: "EXL-0932 at risk if the furnace stays down past 3 PM" },
      { text: "Mark receivables to today's spot", result: "$1.51L-equivalent overdue, 29% of USD exposure unhedged" },
    ],
    outcome: "Send the 12 match sheets, price Kaiser at 14% margin to meet $9.60, push the furnace restart before 3 PM or route 1,200 stubs outside, and book a $1L 60-day cover at about 84.65.",
    actions: ["Send 12 match sheets", "Approve Kaiser at 14% margin", "Route 1,200 stubs to outside HT", "Book $1L forward with SBI"],
  },
};

/* ============================================================
   Desk
   ============================================================ */

type Lookup = { time: string; text: string; tone: Tone };

export default function AutoPartsDesk() {
  const [rfqs, setRfqs] = React.useState(seedRfqs);
  const [lots, setLots] = React.useState(seedLots);
  const [lookups, setLookups] = React.useState<Lookup[]>([
    { time: "11:42", text: "Kaiser Teile · KT 30.2214.22 → SAC-CV-2214 · 92%", tone: "ok" },
    { time: "11:18", text: "Gulf Motor Spares · GMS-TT-3360 → SAC-HB-4108 · 85%", tone: "warn" },
    { time: "10:51", text: "Campo Recambios · CR 6S 1386 → SAC-PT-1386 · 97%", tone: "ok" },
    { time: "10:22", text: "Pampas · PR-CV-2114 · 21 splines, not ours", tone: "late" },
    { time: "9:47", text: "Ridgeline · RA-SS2508 → SAC-SS-2508 · 92%", tone: "ok" },
  ]);
  const openRfqs = rfqs.filter((r) => r.inHours > 0 && !["Won", "Lost", "Quoted"].includes(r.stage)).length;

  const modules: DeskModule[] = [
    {
      id: "match",
      label: "Part match",
      title: "Part-match engine",
      blurb: "Type any OEM, aftermarket or Sutlej number. We cross-reference it and compare dimensions against the CMM data.",
      icon: Crosshair,
      notes: ["Type a number or pick a recent buyer query. The engine decodes it, finds every aftermarket equivalent and lands on our part.", "Each bar is the tolerance band; the orange dot is our CMM mean and the blue dot the selected aftermarket part.", "Confidence drops as measurements drift toward the limits, and collapses on a spline mismatch."],
      render: () => <MatchHome lookups={lookups} setLookups={setLookups} rfqs={rfqs} lots={lots} />,
    },
    { id: "lots", label: "Export lots", count: lots.filter((l) => l.stage === "Packing" || l.stage === "At ICD").length, title: "Export lots", blurb: "Every container from packing to the buyer's port, with crates, fill and documents", icon: Ship, render: () => <LotsTab lots={lots} setLots={setLots} /> },
    { id: "rfqs", label: "RFQs", count: openRfqs, title: "Buyer RFQs", blurb: "Every enquiry on a response clock, costed on today's steel price", icon: FileQuestion, render: () => <RfqTab rfqs={rfqs} setRfqs={setRfqs} /> },
    { id: "quality", label: "Quality & PPAP", count: seedPpaps.filter((p) => p.status === "In prep" || p.status === "Rejected").length, title: "Quality & PPAP", blurb: "PPAP submissions, CMM results, Cpk and customer ppm", icon: ShieldCheck, render: () => <QualityTab /> },
    { id: "production", label: "Production", count: 2, title: "Forge and machine shop", blurb: "Presses, CNC cells and heat treatment, live strokes and die life", icon: Factory, render: () => <ProductionTab /> },
    { id: "forex", label: "Forex & payments", count: seedRecv.filter((r) => r.status === "Overdue").length, title: "Forex & payments", blurb: "Receivables in three currencies, forward covers and export incentives", icon: Banknote, render: () => <ForexTab /> },
    { id: "team", label: "People", title: "People", blurb: "Export, costing, plant and quality: who is carrying what today", icon: Users, render: () => <PeopleModule members={team} /> },
    { id: "agents", label: "Agents", title: "Agents", blurb: "Six AI agents doing the cross-referencing, costing and chasing", icon: Bot, render: () => <AgentsModule agents={agents} /> },
    { id: "independence", label: "Independence", title: "Owner independence", blurb: "How much of Sutlej Auto runs without Gurpreet on the phone", icon: GaugeIcon, render: () => <IndependenceModule data={independence} /> },
    { id: "connections", label: "Connections", title: "Connections", blurb: "Tally, ICEGATE, DGFT, CMM and the buyer portals", icon: Plug, render: () => <ConnectionsModule items={integrations} /> },
  ];

  return <DeskShell config={config} modules={modules} />;
}

/* ============================================================
   Home: part-match engine
   ============================================================ */

function MatchHome({ lookups, setLookups, rfqs, lots }: { lookups: Lookup[]; setLookups: React.Dispatch<React.SetStateAction<Lookup[]>>; rfqs: Rfq[]; lots: Lot[] }) {
  const desk = useDesk();
  const live = useDrift(47, 0.6, 3500);
  const avg = Math.round(parts.reduce((a, p) => a + confidence(p, p.ours), 0) / parts.length);
  const pipeline = rfqs.filter((r) => !["Won", "Lost"].includes(r.stage)).reduce((a, r) => a + r.volume * r.target, 0);
  const moving = lots.filter((l) => l.stage !== "Delivered").length;
  const signOff = parts.filter((p) => confidence(p, p.ours) < 86);
  const makers = Object.entries(parts.reduce<Record<string, number>>((acc, p) => ((acc[p.oem.maker] = (acc[p.oem.maker] ?? 0) + 1 + p.alts.length), acc), {})).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Lookups today" value={Math.round(live) + lookups.length - 5} delta="+12" hint="vs yesterday" icon={ScanLine} trend={[21, 26, 30, 28, 35, 41, 47]} />
        <Stat label="Average match confidence" value={`${avg}%`} delta="+2%" hint="across 10 running parts" icon={Crosshair} tone="ok" trend={[86, 87, 87, 88, 89, 89, avg]} />
        <Stat label="Open RFQ pipeline" value={usd(pipeline, true)} delta="+8%" hint="annualised" icon={DollarSign} trend={[1.3, 1.4, 1.5, 1.6, 1.7, 1.75, pipeline / 1e6]} onClick={() => desk.goTab("rfqs")} />
        <Stat label="Containers moving" value={moving} delta="+2" hint="to 9 ports" icon={Ship} tone="info" trend={[5, 6, 6, 7, 8, 7, moving]} onClick={() => desk.goTab("lots")} />
      </div>
      <Panel live title="Part-match engine" sub="OEM ↔ aftermarket ↔ Sutlej · dimensions from the Zeiss CMM, last 5 lots">
        <PartMatch
          onMatch={(r, p, score) => {
            const t = new Date();
            const time = t.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });
            const tone: Tone = score >= 90 ? "ok" : score >= 85 ? "warn" : "late";
            const text = score === 0 ? `${r.brand} · ${r.no} · spline mismatch, not ours` : `${r.brand} · ${r.no} → ${p.id} · ${score}%`;
            setLookups((cur) => [{ time, text, tone }, ...cur].slice(0, 9));
          }}
          onMiss={(q) => {
            const t = new Date();
            const time = t.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });
            setLookups((cur) => [{ time, text: `${q} · no cross-reference on file`, tone: "late" as Tone }, ...cur].slice(0, 9));
          }}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel icon={ScanLine} title="Lookups today" sub="From buyer emails, WhatsApp and this console">
          <ul className="space-y-2">
            {lookups.map((l, i) => (
              <li key={`${l.time}-${l.text}`} className="desk-rise flex items-start gap-2.5 rounded-[8px] border border-d-line bg-d-sunk/50 px-3 py-2" style={{ animationDelay: `${i * 30}ms` }}>
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: `var(--d-${l.tone})` }} />
                <span className="font-mono text-[11px] text-d-mute">{l.time}</span>
                <span className="min-w-0 flex-1 text-[12.5px] leading-snug">{l.text}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel icon={Globe} title="Cross-ref coverage" sub="Numbers on file per OEM, incl. aftermarket equivalents">
          <HBars data={makers.map(([label, value], i) => ({ label, value, tone: i === 0 ? "accent" : "info" }))} format={(v) => `${v} nos`} />
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              { l: "OEM nos", v: parts.length },
              { l: "Aftermarket", v: parts.reduce((a, p) => a + p.alts.length, 0) },
              { l: "Buyers", v: new Set(parts.flatMap((p) => p.buyers)).size },
            ].map((x) => (
              <div key={x.l} className="rounded-[8px] bg-d-sunk px-2 py-2">
                <p className="tnum font-mono text-[18px] font-semibold">{x.v}</p>
                <p className="text-[11px] text-d-mute">{x.l}</p>
              </div>
            ))}
          </div>
        </Panel>
        <Panel icon={AlertTriangle} title="Needs engineering sign-off" sub="Matches under 86% stay off match sheets until Amandeep signs">
          <ApprovalQueue
            approveLabel="Sign off"
            items={signOff.map((p) => ({ id: p.id, title: `${p.id}`, sub: `${p.oem.maker} ${p.oem.no} · Cpk ${p.cpk}`, meta: `${confidence(p, p.ours)}%`, tone: "late" as Tone }))}
            onDecide={(id, v) => v && desk.log(`${id} match ${v === "approved" ? "signed off by engineering" : "held for re-measure"}`, v === "approved" ? "ok" : "warn")}
          />
          <p className="mt-3 text-[12px] leading-snug text-d-mute">{signOff.map((p) => p.note).join(" ")}</p>
        </Panel>
      </div>
    </div>
  );
}

const quickPicks = ["KT 30.2214.22", "44102M79F00", "GMS-TT-3360", "PR-CV-2114", "008 0421 6S", "F8100410", "VD-1410-SY"];

function PartMatch({ onMatch, onMiss }: { onMatch: (r: Ref, p: Part, score: number) => void; onMiss: (q: string) => void }) {
  const desk = useDesk();
  const [q, setQ] = React.useState("");
  const [focus, setFocus] = React.useState(false);
  const [hit, setHit] = React.useState<Ref>(refs[0]);
  const [phase, setPhase] = React.useState(4);
  const [alt, setAlt] = React.useState(0);
  const [miss, setMiss] = React.useState<string | null>(null);
  const timers = React.useRef<number[]>([]);
  React.useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const part = parts.find((p) => p.id === hit.part)!;
  const altSel = part.alts[Math.min(alt, part.alts.length - 1)];
  const score = confidence(part, part.ours);
  const altScore = confidence(part, altDims(part, altSel), 0);
  const needle = norm(q);
  const sugg = needle ? refs.filter((r) => norm(r.no).includes(needle) || r.brand.toUpperCase().includes(needle)).slice(0, 7) : [];

  function run(r: Ref) {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    const p = parts.find((x) => x.id === r.part)!;
    setHit(r);
    setMiss(null);
    setAlt(r.alt ?? 0);
    setQ(r.no);
    setFocus(false);
    setPhase(1);
    [2, 3, 4].forEach((ph, i) => timers.current.push(window.setTimeout(() => setPhase(ph), 420 * (i + 1))));
    const finalScore = r.alt !== undefined && altDims(p, p.alts[r.alt]).spl !== p.nom.spl ? 0 : confidence(p, p.ours);
    timers.current.push(
      window.setTimeout(() => {
        onMatch(r, p, finalScore);
        desk.log(finalScore === 0 ? `${r.no}: spline mismatch, not crossed to ${p.id}` : `Matched ${r.no} to ${p.id} at ${finalScore}%`, finalScore >= 90 ? "ok" : finalScore === 0 ? "late" : "warn");
      }, 1700),
    );
  }
  function submit() {
    if (sugg[0]) return run(sugg[0]);
    if (!q.trim()) return;
    setMiss(q.trim());
    setFocus(false);
    onMiss(q.trim());
    desk.log(`No cross-reference for ${q.trim()}`, "late");
  }

  const altMismatch = altDims(part, altSel).spl !== part.nom.spl;
  const verdict = altMismatch && hit.kind === "Aftermarket" && hit.alt === alt ? "Not interchangeable" : score >= 90 ? "Drop-in equivalent" : score >= 85 ? "Equivalent, watch tolerance" : "Engineering sign-off needed";
  const vTone: Tone = verdict === "Not interchangeable" ? "late" : score >= 90 ? "ok" : score >= 85 ? "warn" : "late";

  return (
    <div>
      <div className="relative">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex flex-wrap items-center gap-2"
        >
          <label className="relative flex h-12 min-w-[260px] flex-1 items-center rounded-[10px] border border-d-line bg-d-sunk focus-within:border-d-accent">
            <ScanLine className="pointer-events-none absolute left-3.5 h-5 w-5 text-d-accent" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setFocus(true);
              }}
              onFocus={() => setFocus(true)}
              onBlur={() => window.setTimeout(() => setFocus(false), 150)}
              placeholder="OEM, aftermarket or Sutlej part number, e.g. 44102M79F00"
              className="h-full w-full bg-transparent pl-11 pr-3 font-mono text-[15px] tracking-wide text-d-ink outline-none placeholder:font-sans placeholder:text-[13px] placeholder:tracking-normal placeholder:text-d-mute"
            />
          </label>
          <Btn variant="solid" type="submit" icon={Crosshair} className="h-12 px-5">
            Match
          </Btn>
        </form>
        {focus && sugg.length > 0 && (
          <ul className="desk-rise absolute inset-x-0 top-[52px] z-20 overflow-hidden rounded-[10px] border border-d-line bg-d-panel shadow-2xl">
            {sugg.map((r) => (
              <li key={`${r.kind}-${r.no}`}>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => run(r)} className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left hover:bg-d-sunk">
                  <Pill tone={r.kind === "OEM" ? "info" : r.kind === "Sutlej" ? "accent" : "neutral"} mono>
                    {r.kind}
                  </Pill>
                  <span className="font-mono text-[13px] font-semibold">{r.no}</span>
                  <span className="truncate text-[12px] text-d-mute">{r.brand}</span>
                  <span className="ml-auto font-mono text-[11.5px] text-d-mute">→ {r.part}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-d-mute">buyer queries</span>
        {quickPicks.map((n) => {
          const r = refs.find((x) => x.no === n)!;
          return (
            <button key={n} type="button" onClick={() => run(r)} className={`rounded-[6px] border px-2 py-1 font-mono text-[11.5px] transition-colors ${hit.no === n ? "border-d-accent bg-d-soft text-d-accent" : "border-d-line text-d-mute hover:border-d-accent/60 hover:text-d-ink"}`}>
              {n}
            </button>
          );
        })}
      </div>

      {miss ? (
        <div className="desk-rise mt-5 flex flex-wrap items-center gap-4 rounded-[10px] border border-dashed border-d-late/60 p-5">
          <AlertTriangle className="h-6 w-6 text-d-late" />
          <div className="min-w-[220px] flex-1">
            <p className="font-mono text-[15px] font-semibold">{miss}</p>
            <p className="text-[13px] text-d-mute">No OEM, aftermarket or Sutlej number on file matches this. Ask the buyer for a drawing or a sample piece.</p>
          </div>
          <Btn
            variant="solid"
            icon={Ruler}
            onClick={() => {
              toast.success("Reverse-engineering request raised", { description: `${miss} · Amandeep will measure the buyer sample` });
              desk.log(`Reverse-engineering request raised for ${miss}`, "info");
              setMiss(null);
            }}
          >
            Request sample and drawing
          </Btn>
        </div>
      ) : (
        <div className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_1fr]">
          <div className="min-w-0">
            <DecodeStrip key={`${hit.no}-${phase === 1}`} hit={hit} part={part} phase={phase} />
            <CrossRefMap part={part} hit={hit} phase={phase} alt={alt} onAlt={setAlt} />
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <KvBox k="Material" v={part.material} />
              <KvBox k="Fitment" v={part.oem.model} />
              <KvBox k="Our FOB / weight" v={`${usd(part.fob)} · ${part.kg} kg`} />
            </div>
          </div>
          <div className="min-w-0 space-y-4">
            <div className="flex items-center gap-4 rounded-[10px] border border-d-line bg-d-sunk/50 p-4">
              <ConfidenceRing value={phase >= 4 ? score : 0} on={phase >= 4} />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-d-mute">match confidence</p>
                <p className="mt-1 text-[16px] font-semibold">{phase >= 4 ? verdict : "Comparing…"}</p>
                <p className="mt-1 text-[12px] leading-snug text-d-mute">{phase >= 4 ? part.note : "Reading CMM means from the last 5 lots"}</p>
                {phase >= 4 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Pill tone={vTone}>{verdict === "Not interchangeable" ? "spline mismatch" : `Cpk ${part.cpk}`}</Pill>
                    <Pill tone="info">PPAP L{part.ppap}</Pill>
                    <Pill tone="neutral">{part.family}</Pill>
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-[10px] border border-d-line p-4">
              <div className="mb-3 flex items-baseline justify-between gap-2">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-d-mute">dimension compare</p>
                <p className="flex items-center gap-3 text-[11px] text-d-mute">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-d-accent" /> Sutlej CMM
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-d-info" /> {altSel.brand}
                  </span>
                </p>
              </div>
              <div className="space-y-3.5">
                {DIMS.map((dm, i) => (
                  <TolBar key={dm.key} dim={dm} part={part} alt={altDims(part, altSel)} show={phase >= 3} delay={i * 90} />
                ))}
              </div>
              <p className="mt-3 border-t border-d-line pt-2 text-[11.5px] text-d-mute">
                {altSel.brand} {altSel.no} vs OEM: <b className={altMismatch ? "text-d-late" : "text-d-ink"}>{altMismatch ? "not interchangeable" : `${altScore}% equivalent`}</b>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Btn
                variant="solid"
                icon={Send}
                disabled={phase < 4}
                onClick={() => {
                  toast.success("Match sheet sent", { description: `${hit.no} → ${part.id}, with CMM summary and drawing` });
                  desk.log(`Match sheet ${hit.no} → ${part.id} sent to buyer`, "ok");
                }}
              >
                Send match sheet
              </Btn>
              <Btn icon={FileQuestion} onClick={() => desk.goTab("rfqs")}>
                Open RFQs
              </Btn>
              <Btn icon={ShieldCheck} onClick={() => desk.goTab("quality")}>
                PPAP status
              </Btn>
              <Btn variant="ghost" icon={MessageCircle} onClick={() => desk.openAsk(`Do we make an equivalent for ${hit.no}?`)}>
                Ask
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KvBox({ k, v }: { k: string; v: string }) {
  return (
    <div className="min-w-0 rounded-[8px] bg-d-sunk px-3 py-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-d-mute">{k}</p>
      <p className="mt-0.5 truncate text-[12.5px] font-medium">{v}</p>
    </div>
  );
}

function DecodeStrip({ hit, part, phase }: { hit: Ref; part: Part; phase: number }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-3 rounded-[10px] border border-d-line bg-d-sunk/60 px-3 py-2.5">
      <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-d-mute">{hit.kind === "OEM" ? "oem no" : hit.kind === "Sutlej" ? "our no" : "aftermarket no"}</span>
      <span className="flex flex-wrap gap-[3px]">
        {hit.no.split("").map((c, i) => (
          <span key={`${c}-${i}`} className="desk-rise inline-flex h-7 min-w-[18px] items-center justify-center rounded-[4px] bg-d-panel px-1 font-mono text-[13px] font-semibold text-d-accent ring-1 ring-d-line" style={{ animationDelay: `${i * 35}ms` }}>
            {c === " " ? "·" : c}
          </span>
        ))}
      </span>
      <span className="ml-auto font-mono text-[11.5px] text-d-mute">
        {phase < 4 ? <span className="bb-blink">decoding…</span> : `${hit.brand} · ${part.family.toLowerCase()} · ${part.alts.length + 1} equivalents`}
      </span>
    </div>
  );
}

function CrossRefMap({ part, hit, phase, alt, onAlt }: { part: Part; hit: Ref; phase: number; alt: number; onAlt: (i: number) => void }) {
  const n = part.alts.length;
  const ys = part.alts.map((_, i) => 130 - ((n - 1) * 62) / 2 + i * 62);
  const W = 720;
  const nodeW = 196;
  const midX = 262;
  const ourX = W - nodeW - 10;
  return (
    <div className="relative overflow-hidden rounded-[10px] border border-d-line bg-[radial-gradient(circle_at_1px_1px,color-mix(in_oklab,var(--d-ink)_9%,transparent)_1px,transparent_0)] [background-size:18px_18px]">
      {phase > 0 && phase < 4 && <div className="desk-shimmer pointer-events-none absolute inset-0" />}
      <svg viewBox={`0 0 ${W} 260`} className="block w-full">
        <defs>
          <marker id="ap-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="var(--d-accent)" />
          </marker>
        </defs>
        <text x="12" y="20" fill="var(--d-mute)" fontSize="10" fontFamily="var(--font-mono, monospace)" letterSpacing="1.5">
          OEM
        </text>
        <text x={midX} y="20" fill="var(--d-mute)" fontSize="10" fontFamily="var(--font-mono, monospace)" letterSpacing="1.5">
          AFTERMARKET
        </text>
        <text x={ourX} y="20" fill="var(--d-mute)" fontSize="10" fontFamily="var(--font-mono, monospace)" letterSpacing="1.5">
          SUTLEJ
        </text>
        {/* direct OEM to ours */}
        <path d={`M${10 + nodeW},118 C${W / 2},40 ${W / 2},40 ${ourX},118`} fill="none" stroke="var(--d-accent)" strokeOpacity={phase >= 3 ? 0.5 : 0} strokeWidth="1.4" className="desk-flow" style={{ transition: "stroke-opacity 400ms" }} markerEnd={phase >= 3 ? "url(#ap-arrow)" : undefined} />
        {part.alts.map((a, i) => {
          const y = ys[i];
          const bad = altDims(part, a).spl !== part.nom.spl;
          const on = i === alt;
          const color = bad ? "var(--d-late)" : on ? "var(--d-info)" : "var(--d-mute)";
          return (
            <g key={a.no}>
              <path d={`M${10 + nodeW},130 C${midX - 30},130 ${midX - 40},${y} ${midX},${y}`} fill="none" stroke={color} strokeOpacity={phase >= 2 ? (on ? 0.95 : 0.45) : 0} strokeWidth={on ? 2 : 1.3} className={phase >= 2 ? "desk-flow" : undefined} style={{ transition: "stroke-opacity 350ms" }} />
              <path
                d={`M${midX + nodeW},${y} C${ourX - 30},${y} ${ourX - 40},142 ${ourX},142`}
                fill="none"
                stroke={bad ? "var(--d-late)" : "var(--d-accent)"}
                strokeOpacity={phase >= 3 ? (bad ? 0.35 : on ? 0.95 : 0.4) : 0}
                strokeWidth={on ? 2 : 1.3}
                strokeDasharray={bad ? "2 5" : undefined}
                className={phase >= 3 && !bad ? "desk-flow" : undefined}
                style={{ transition: "stroke-opacity 350ms" }}
              />
              <g onClick={() => onAlt(i)} style={{ cursor: "pointer", opacity: phase >= 2 ? 1 : 0.15, transition: "opacity 350ms" }}>
                <rect x={midX} y={y - 21} width={nodeW} height="42" rx="7" fill={on ? "color-mix(in oklab, var(--d-info) 14%, var(--d-panel))" : "var(--d-panel)"} stroke={bad ? "var(--d-late)" : on ? "var(--d-info)" : "var(--d-line)"} strokeWidth={on ? 1.6 : 1} />
                <text x={midX + 12} y={y - 3} fill="var(--d-ink)" fontSize="12.5" fontWeight="600" fontFamily="var(--font-mono, monospace)">
                  {a.no}
                </text>
                <text x={midX + 12} y={y + 13} fill="var(--d-mute)" fontSize="10.5">
                  {a.brand} · {a.country}
                  {bad ? " · spline ≠" : ""}
                </text>
                {hit.kind === "Aftermarket" && hit.alt === i && <circle cx={midX + nodeW - 12} cy={y} r="4" fill="var(--d-accent)" className="bb-pulse" />}
              </g>
            </g>
          );
        })}
        {/* OEM node */}
        <g style={{ opacity: phase >= 1 ? 1 : 0.2, transition: "opacity 300ms" }}>
          <rect x="10" y="94" width={nodeW} height="72" rx="8" fill="var(--d-panel)" stroke={hit.kind === "OEM" ? "var(--d-accent)" : "var(--d-info)"} strokeWidth="1.6" />
          <text x="24" y="116" fill="var(--d-mute)" fontSize="10.5">
            {part.oem.maker}
          </text>
          <text x="24" y="136" fill="var(--d-ink)" fontSize="14" fontWeight="700" fontFamily="var(--font-mono, monospace)">
            {part.oem.no}
          </text>
          <text x="24" y="154" fill="var(--d-mute)" fontSize="10">
            {part.oem.model.length > 30 ? `${part.oem.model.slice(0, 29)}…` : part.oem.model}
          </text>
        </g>
        {/* Our node */}
        <g style={{ opacity: phase >= 3 ? 1 : 0.15, transition: "opacity 400ms" }}>
          <rect x={ourX} y="100" width={nodeW} height="84" rx="8" fill="color-mix(in oklab, var(--d-accent) 16%, var(--d-panel))" stroke="var(--d-accent)" strokeWidth="2" />
          <text x={ourX + 14} y="122" fill="var(--d-accent)" fontSize="10.5" fontWeight="600" letterSpacing="1">
            SUTLEJ AUTO
          </text>
          <text x={ourX + 14} y="143" fill="var(--d-ink)" fontSize="15" fontWeight="700" fontFamily="var(--font-mono, monospace)">
            {part.id}
          </text>
          <text x={ourX + 14} y="161" fill="var(--d-mute)" fontSize="10.5">
            {part.name.length > 30 ? `${part.name.slice(0, 29)}…` : part.name}
          </text>
          <text x={ourX + 14} y="176" fill="var(--d-mute)" fontSize="10">
            {part.buyers.length} buyers · PPAP L{part.ppap}
          </text>
        </g>
      </svg>
      <p className="absolute bottom-2 left-3 font-mono text-[10px] text-d-mute">click an aftermarket node to compare it</p>
    </div>
  );
}

function ConfidenceRing({ value, on }: { value: number; on: boolean }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  const tone = value >= 90 ? "var(--d-ok)" : value >= 85 ? "var(--d-warn)" : "var(--d-late)";
  return (
    <div className="relative h-[104px] w-[104px] shrink-0">
      <svg viewBox="0 0 104 104" className="-rotate-90">
        <circle cx="52" cy="52" r={r} fill="none" stroke="var(--d-line)" strokeWidth="9" />
        {Array.from({ length: 40 }, (_, i) => (
          <line key={i} x1="52" y1="4" x2="52" y2="8" stroke="var(--d-mute)" strokeOpacity="0.35" transform={`rotate(${i * 9} 52 52)`} />
        ))}
        <circle cx="52" cy="52" r={r} fill="none" stroke={tone} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${(value / 100) * c} ${c}`} style={{ transition: "stroke-dasharray 900ms cubic-bezier(.2,.7,.2,1)" }} />
      </svg>
      <span className="tnum absolute inset-0 flex flex-col items-center justify-center font-mono">
        <span className="text-[24px] font-bold leading-none">{on ? value : "--"}</span>
        <span className="text-[10px] text-d-mute">%</span>
      </span>
    </div>
  );
}

function TolBar({ dim, part, alt, show, delay }: { dim: (typeof DIMS)[number]; part: Part; alt: Dims; show: boolean; delay: number }) {
  const k = dim.key;
  if (k === "spl") {
    const same = alt.spl === part.nom.spl;
    return (
      <div>
        <div className="flex items-baseline justify-between text-[12px]">
          <span>{dim.label}</span>
          <span className="font-mono text-[11px] text-d-mute">OEM {part.nom.spl}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          {Array.from({ length: Math.max(part.nom.spl, alt.spl) }, (_, i) => (
            <span
              key={i}
              className="h-3 flex-1 rounded-[2px] transition-colors duration-500"
              style={{ background: !show ? "var(--d-sunk)" : i < part.ours.spl ? (i < alt.spl ? "var(--d-accent)" : "var(--d-late)") : "var(--d-info)", transitionDelay: `${delay + i * 12}ms` }}
            />
          ))}
        </div>
        <p className="mt-1 font-mono text-[11px] text-d-mute">
          ours {part.ours.spl} · alt <span className={same ? "" : "text-d-late"}>{alt.spl}</span> {same ? "· match" : "· mismatch"}
        </p>
      </div>
    );
  }
  const nom = part.nom[k];
  const tol = part.tol[k];
  const span = tol * 2.2;
  const pos = (v: number) => Math.max(2, Math.min(98, 50 + ((v - nom) / span) * 50));
  const ours = part.ours[k];
  const dv = dev(part, k, ours);
  const band = 50 / 2.2;
  return (
    <div>
      <div className="flex items-baseline justify-between text-[12px]">
        <span>{dim.label}</span>
        <span className="font-mono text-[11px] text-d-mute">
          {nom.toFixed(k === "len" ? 1 : 3)} ±{tol} {dim.unit}
        </span>
      </div>
      <div className="relative mt-1.5 h-4 rounded-[3px] bg-d-sunk">
        <span className="absolute inset-y-0 rounded-[3px]" style={{ left: `${50 - band}%`, width: `${band * 2}%`, background: "color-mix(in oklab, var(--d-ok) 20%, transparent)", boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--d-ok) 45%, transparent)" }} />
        <span className="absolute inset-y-[-3px] left-1/2 w-px bg-d-ink/60" />
        <span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-d-panel bg-d-info transition-[left] duration-700" style={{ left: show ? `${pos(alt[k])}%` : "50%", transitionDelay: `${delay}ms` }} />
        <span className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-d-panel bg-d-accent shadow-[0_0_10px_var(--d-accent)] transition-[left] duration-700" style={{ left: show ? `${pos(ours)}%` : "50%", transitionDelay: `${delay + 60}ms` }} />
      </div>
      <p className="mt-1 flex justify-between font-mono text-[11px] text-d-mute">
        <span>
          ours {ours.toFixed(k === "len" ? 2 : 3)} <span style={{ color: dv > 1 ? "var(--d-late)" : dv > 0.7 ? "var(--d-warn)" : "var(--d-ok)" }}>({Math.round(dv * 100)}% of tol)</span>
        </span>
        <span>alt {alt[k].toFixed(k === "len" ? 2 : 3)}</span>
      </p>
    </div>
  );
}

/* ============================================================
   Export lots
   ============================================================ */

function LotsTab({ lots, setLots }: { lots: Lot[]; setLots: React.Dispatch<React.SetStateAction<Lot[]>> }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<string | null>(null);
  const [docs, setDocs] = React.useState<Record<string, number>>(() => Object.fromEntries(seedLots.map((l) => [l.id, l.docs])));
  const lot = lots.find((l) => l.id === open) ?? null;
  const moving = lots.filter((l) => l.stage !== "Delivered");
  const fobMonth = lots.reduce((a, l) => a + l.fob, 0);
  const byCountry = Object.entries(lots.reduce<Record<string, number>>((acc, l) => ((acc[l.country] = (acc[l.country] ?? 0) + l.fob), acc), {})).sort((a, b) => b[1] - a[1]);
  const tones: Tone[] = ["accent", "info", "ok", "warn", "late", "neutral"];
  const stageTone: Record<LotStage, Tone> = { Packing: "warn", "At ICD": "accent", "On rail": "info", Sailed: "ok", Delivered: "neutral" };

  function move(id: string, stage: LotStage) {
    setLots((cur) => cur.map((l) => (l.id === id ? { ...l, stage } : l)));
    const l = lots.find((x) => x.id === id);
    toast.success(`${id} → ${stage}`, { description: l ? `${l.buyer}, ${l.port}` : undefined });
    desk.log(`${id} moved to ${stage}`, stage === "Sailed" ? "ok" : "info");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Lots in flight" value={moving.length} delta="+2" hint={`${lots.filter((l) => l.stage === "Packing").length} still packing`} icon={Container} trend={[5, 6, 6, 7, 8, 7, moving.length]} />
        <Stat label="FOB this month" value={usd(fobMonth, true)} delta="+11%" hint={`≈ ${inr(fobMonth * 84.12, { compact: true })}`} icon={DollarSign} tone="ok" trend={[0.62, 0.68, 0.71, 0.74, 0.79, 0.83, fobMonth / 1e6]} />
        <Stat label="Next rail cut-off" value={<Countdown compact inHours={26} />} hint="ICD Dhandari Kalan → Mundra" icon={TrainFront} tone="warn" />
        <Stat label="Average container fill" value={`${Math.round((lots.reduce((a, l) => a + l.cbm / boxCap(l.box).cbm, 0) / lots.length) * 100)}%`} delta="+4%" hint="by volume" icon={Ship} tone="info" />
      </div>
      <Panel title="Lot board" sub="Drag a lot to its next stage. Click a card for crates, fill and documents." action={<Pill tone="info" mono>{lots.length} lots</Pill>}>
        <Board
          columns={LOT_STAGES.map((s) => ({ id: s, label: s, tone: stageTone[s], hint: s === "At ICD" ? "Stuffing and customs at Dhandari Kalan" : s === "On rail" ? "CONCOR rake to Mundra, 2 days" : undefined }))}
          items={lots}
          itemKey={(l) => l.id}
          getColumn={(l) => l.stage}
          onMove={(id, col) => move(id, col as LotStage)}
          minColumnWidth={220}
          renderCard={(l) => {
            const cap = boxCap(l.box);
            const fill = l.cbm / cap.cbm;
            return (
              <button type="button" onClick={() => setOpen(l.id)} className="block w-full text-left">
                <div className="flex items-center justify-between gap-2 pr-4">
                  <span className="font-mono text-[12.5px] font-semibold">{l.id}</span>
                  <span className="rounded-[4px] bg-d-sunk px-1.5 py-0.5 font-mono text-[10.5px] font-semibold">{l.cc}</span>
                </div>
                <p className="mt-1 truncate text-[13px] font-medium">{l.buyer}</p>
                <p className="truncate text-[11.5px] text-d-mute">
                  {l.box} · {l.port} · {l.line}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Meter value={fill * 100} tone={fill > 0.85 ? "ok" : fill > 0.65 ? "accent" : "warn"} height={5} />
                  <span className="font-mono text-[10.5px] text-d-mute">{Math.round(fill * 100)}%</span>
                </div>
                <p className="mt-2 flex items-center justify-between font-mono text-[11px]">
                  <span>{usd(l.fob, true)}</span>
                  <span className="text-d-mute">
                    docs {docs[l.id]}/{DOCS.length}
                  </span>
                </p>
              </button>
            );
          }}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <Panel icon={Globe} title="FOB by destination" sub="This month, all lots">
          <Donut size={150} center={usd(fobMonth, true)} sub="FOB" segments={byCountry.slice(0, 6).map(([label, value], i) => ({ label, value: Math.round(value), tone: tones[i] }))} />
        </Panel>
        <Panel icon={TrainFront} title="Cut-offs this week" sub="Rail rake and vessel gate-in for lots not yet sailed">
          <ul className="divide-y divide-d-line">
            {lots
              .filter((l) => l.etdIn > 0)
              .sort((a, b) => a.etdIn - b.etdIn)
              .map((l) => (
                <li key={l.id} className="flex flex-wrap items-center gap-3 py-2.5">
                  <span className="rounded-[4px] bg-d-sunk px-1.5 py-0.5 font-mono text-[11px] font-semibold">{l.cc}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium">
                      {l.id} · {l.buyer}
                    </p>
                    <p className="text-[11.5px] text-d-mute">
                      {l.line} to {l.port} · {l.stage}
                    </p>
                  </div>
                  <span className="rounded-[6px] bg-d-sunk px-2 py-1 text-[12px]">
                    <Countdown compact inHours={l.etdIn} />
                  </span>
                  <Pill tone={docs[l.id] >= DOCS.length - 1 ? "ok" : docs[l.id] >= 3 ? "warn" : "late"}>
                    {docs[l.id]}/{DOCS.length} docs
                  </Pill>
                </li>
              ))}
          </ul>
        </Panel>
      </div>
      <Sheet
        open={!!lot}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={lot ? `${lot.box} · ${lot.line}` : ""}
        title={lot ? `${lot.id} · ${lot.buyer}` : ""}
        sub={lot ? `${lot.parts} · to ${lot.port}, ${lot.country}` : ""}
        width={520}
        footer={
          lot && (
            <>
              <Btn
                icon={Mail}
                onClick={() => {
                  toast.success("Document set sent", { description: `${docs[lot.id]} documents to ${lot.buyer}` });
                  desk.log(`${lot.id} documents sent to ${lot.buyer}`);
                }}
              >
                Send docs to buyer
              </Btn>
              <Btn
                variant="solid"
                icon={ArrowRight}
                disabled={lot.stage === "Delivered"}
                onClick={() => {
                  const i = LOT_STAGES.indexOf(lot.stage);
                  move(lot.id, LOT_STAGES[Math.min(LOT_STAGES.length - 1, i + 1)]);
                }}
              >
                Move to {LOT_STAGES[Math.min(LOT_STAGES.length - 1, LOT_STAGES.indexOf(lot.stage) + 1)]}
              </Btn>
            </>
          )
        }
      >
        {lot && (
          <div className="space-y-5">
            <KV
              items={[
                { k: "FOB", v: `${usd(lot.fob)} · ${inr(lot.fob * 84.12, { compact: true })}` },
                { k: "Stage", v: <Pill tone={stageTone[lot.stage]}>{lot.stage}</Pill> },
                { k: "Crates", v: `${lot.crates} ISPM-15, VCI wrapped` },
                { k: "Gross weight", v: `${num(lot.kg)} kg of ${num(boxCap(lot.box).kg)}` },
                { k: "Volume", v: `${lot.cbm} of ${boxCap(lot.box).cbm} cbm` },
                { k: "Cut-off", v: lot.etdIn > 0 ? <Countdown compact inHours={lot.etdIn} /> : "Sailed" },
              ]}
            />
            <div>
              <p className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-d-mute">container plan, top view</p>
              <ContainerPlan lot={lot} />
            </div>
            <div>
              <p className="mb-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-d-mute">documents</p>
              <Checklist
                items={DOCS.map((name, i) => ({ id: name, label: name, sub: i === 3 ? "ICEGATE, LEO after stuffing" : i === 5 ? `${lot.line} issues after sailing` : undefined, done: i < docs[lot.id] }))}
                onToggle={(name) => {
                  const i = DOCS.indexOf(name as (typeof DOCS)[number]);
                  setDocs((cur) => ({ ...cur, [lot.id]: cur[lot.id] > i ? i : i + 1 }));
                  desk.log(`${lot.id}: ${name} updated`);
                }}
              />
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

function ContainerPlan({ lot }: { lot: Lot }) {
  const cap = lot.box === "20' GP" ? 22 : 40;
  return (
    <div className="rounded-[8px] border-2 border-d-line bg-d-sunk p-2">
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cap / 2}, minmax(0, 1fr))` }}>
        {Array.from({ length: cap }, (_, i) => (
          <span key={i} className="desk-rise aspect-square rounded-[2px]" style={{ background: i < lot.crates ? "color-mix(in oklab, var(--d-accent) 70%, var(--d-panel))" : "transparent", boxShadow: "inset 0 0 0 1px var(--d-line)", animationDelay: `${i * 12}ms` }} />
        ))}
      </div>
      <p className="mt-2 flex justify-between font-mono text-[10.5px] text-d-mute">
        <span>door end</span>
        <span>
          {lot.crates} of {cap} crate slots
        </span>
      </p>
    </div>
  );
}

/* ============================================================
   RFQs
   ============================================================ */

const rfqTone: Record<RfqStage, Tone> = { New: "info", Costing: "accent", Sample: "warn", Quoted: "neutral", Won: "ok", Lost: "late" };

function RfqTab({ rfqs, setRfqs }: { rfqs: Rfq[]; setRfqs: React.Dispatch<React.SetStateAction<Rfq[]>> }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<string | null>(null);
  const rfq = rfqs.find((r) => r.id === open) ?? null;
  const live = rfqs.filter((r) => !["Won", "Lost", "Quoted"].includes(r.stage));
  const due24 = live.filter((r) => r.inHours <= 24).length;
  const pipe = rfqs.filter((r) => !["Won", "Lost"].includes(r.stage)).reduce((a, r) => a + r.volume * r.target, 0);

  function setStage(id: string, stage: RfqStage, msg: string) {
    setRfqs((cur) => cur.map((r) => (r.id === id ? { ...r, stage } : r)));
    toast.success(msg);
    desk.log(msg, stage === "Won" ? "ok" : "info");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open RFQs" value={live.length} delta="+3" hint="this week" icon={FileQuestion} trend={[5, 6, 6, 7, 8, 8, live.length]} />
        <Stat label="Due in 24 hours" value={due24} hint="3 need the owner's price" icon={Timer} tone="late" />
        <Stat label="Pipeline, annual" value={usd(pipe, true)} delta="+8%" icon={DollarSign} tone="ok" trend={[1.3, 1.4, 1.5, 1.6, 1.7, 1.75, pipe / 1e6]} />
        <Stat label="Win rate, 90 days" value="38%" delta="+6%" hint="first reply under 24 h wins 2×" icon={TrendingUp} trend={[28, 30, 31, 33, 35, 36, 38]} />
      </div>
      <Panel title="RFQ register" sub="Sorted by the response clock. Click a row to cost it on today's steel price and send.">
        <DataTable
          rows={[...rfqs].sort((a, b) => (a.inHours || 999) - (b.inHours || 999))}
          rowKey={(r) => r.id}
          search={(r) => `${r.id} ${r.buyer} ${r.country} ${r.part}`}
          searchPlaceholder="Search RFQ, buyer or part"
          filter={{ get: (r) => r.stage, options: ["New", "Costing", "Sample", "Quoted", "Won", "Lost"] }}
          onRow={(r) => setOpen(r.id)}
          bulk={[{ label: "Send acknowledgement", run: (k) => { toast.success(`Acknowledged ${k.length} RFQs`, { description: "Buyers get a reply date and the match sheets" }); desk.log(`${k.length} RFQ acknowledgements sent`); } }]}
          columns={[
            { key: "id", label: "RFQ", render: (r) => <span className="font-mono text-[12.5px] font-semibold">{r.id}</span>, sort: (r) => r.id },
            { key: "buyer", label: "Buyer", render: (r) => (<span className="inline-flex items-center gap-2"><span className="rounded-[4px] bg-d-sunk px-1.5 font-mono text-[10.5px] font-semibold">{r.cc}</span><span className="font-medium">{r.buyer}</span></span>), sort: (r) => r.buyer },
            { key: "part", label: "Lead part", render: (r) => <span className="font-mono text-[12px] text-d-mute">{r.part}</span>, wide: true },
            { key: "lines", label: "Lines", align: "right", render: (r) => <span className="tnum font-mono">{r.lines}</span>, sort: (r) => r.lines },
            { key: "vol", label: "Pcs / yr", align: "right", render: (r) => <span className="tnum font-mono">{num(r.volume)}</span>, sort: (r) => r.volume },
            { key: "tgt", label: "Target", align: "right", render: (r) => <span className="tnum font-mono">{usd(r.target)}</span>, sort: (r) => r.target },
            {
              key: "clock",
              label: "Response clock",
              render: (r) =>
                r.inHours > 0 && !["Won", "Lost", "Quoted"].includes(r.stage) ? (
                  <span className={`inline-flex items-center gap-1.5 rounded-[6px] px-2 py-0.5 text-[12px] ${r.inHours <= 6 ? "bg-d-late/15 text-d-late" : r.inHours <= 24 ? "bg-d-warn/15 text-d-warn" : "bg-d-sunk"}`}>
                    <Timer className="h-3 w-3" /> <Countdown compact inHours={r.inHours} />
                  </span>
                ) : (
                  <span className="text-d-mute">—</span>
                ),
              sort: (r) => r.inHours || 999,
            },
            { key: "st", label: "Stage", render: (r) => <Pill tone={rfqTone[r.stage]}>{r.stage}</Pill> },
            { key: "ch", label: "Via", render: (r) => <span className="text-[12px] text-d-mute">{r.channel}</span>, wide: true },
          ]}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="Hours to first quote" sub="Weekly median, last 12 weeks">
          <AreaChart labels={["W31", "W32", "W33", "W34", "W35", "W36", "W37", "W38", "W39", "W40", "W41", "W42"]} series={[{ name: "Median hours", data: [71, 66, 64, 58, 61, 52, 47, 44, 39, 36, 31, 28], tone: "accent" }, { name: "Target 24 h", data: Array(12).fill(24), tone: "neutral", dashed: true }]} format={(v) => `${v} h`} height={170} />
        </Panel>
        <Panel title="Win rate by region" sub="Last 12 months, quoted RFQs">
          <Bars height={170} format={(v) => `${v}%`} data={[{ label: "EU", value: 41, tone: "accent" }, { label: "US", value: 36, tone: "accent" }, { label: "GCC", value: 52, tone: "ok" }, { label: "Africa", value: 47, tone: "ok" }, { label: "LatAm", value: 29, tone: "warn" }]} />
        </Panel>
        <Panel title="Gap to target price" sub="Our cost-sheet price vs buyer target, open RFQs">
          <HBars
            format={(v) => `${v.toFixed(1)}%`}
            max={6}
            data={live.slice(0, 7).map((r) => {
              const g = ((costOf(r, 16) - r.target) / r.target) * 100;
              return { label: r.id, sub: `${r.buyer.split(" ")[0]} · ${g > 0 ? "over" : "under"} target`, value: Math.max(0.1, Math.abs(g)), tone: g > 2 ? "late" : g > 0 ? "warn" : "ok" };
            })}
          />
        </Panel>
      </div>
      <CostSheet rfq={rfq} onClose={() => setOpen(null)} onStage={setStage} />
    </div>
  );
}

const FX = 84.12;
const rfqBias: Record<string, number> = { "RFQ-2611": 0.025, "RFQ-2614": -0.0044, "RFQ-2617": 0.03, "RFQ-2618": 0.012, "RFQ-2603": -0.018, "RFQ-2620": 0.045, "RFQ-2622": -0.01, "RFQ-2624": 0.02, "RFQ-2609": 0.008 };
function baseCosts(kg: number, grade: Grade, conv = 38, ht = 22, pack = 18) {
  return { steelRs: kg * 1.12 * steel[grade], convRs: kg * conv, htRs: kg * ht, packRs: pack };
}
/** Machining is the part-specific cost; calibrated so each RFQ's default sheet lands near the buyer's target. */
function defaultMach(r: Rfq) {
  const b = baseCosts(r.kg, r.grade);
  const target = ((r.target * FX) / 1.16) * (1 + (rfqBias[r.id] ?? 0.01));
  return Math.max(40, Math.round(target - b.steelRs - b.convRs - b.htRs - b.packRs));
}
function costParts(r: Rfq, o: { grade?: Grade; kg?: number; mach?: number } = {}) {
  const b = baseCosts(o.kg ?? r.kg, o.grade ?? r.grade);
  const machRs = o.mach ?? defaultMach(r);
  return { ...b, machRs, total: b.steelRs + b.convRs + b.htRs + machRs + b.packRs };
}
function costOf(r: Rfq, margin: number) {
  return (costParts(r).total / FX) * (1 + margin / 100);
}

function CostSheet({ rfq, onClose, onStage }: { rfq: Rfq | null; onClose: () => void; onStage: (id: string, s: RfqStage, msg: string) => void }) {
  return (
    <Sheet open={!!rfq} onOpenChange={(o) => !o && onClose()} eyebrow={rfq ? `${rfq.id} · ${rfq.channel} · owner ${rfq.owner}` : ""} title={rfq?.buyer ?? ""} sub={rfq ? `${rfq.lines} lines · ${num(rfq.volume)} pcs a year · lead part ${rfq.part}` : ""} width={540}>
      {rfq && <CostBody key={rfq.id} rfq={rfq} onClose={onClose} onStage={onStage} />}
    </Sheet>
  );
}

function CostBody({ rfq, onClose, onStage }: { rfq: Rfq; onClose: () => void; onStage: (id: string, s: RfqStage, msg: string) => void }) {
  const [grade, setGrade] = React.useState<Grade>(rfq.grade);
  const [kg, setKg] = React.useState(String(rfq.kg));
  const [mach, setMach] = React.useState(String(defaultMach(rfq)));
  const [margin, setMargin] = React.useState(16);
  const c = costParts(rfq, { grade, kg: Number(kg) || rfq.kg, mach: Number(mach) || 0 });
  const price = (c.total / FX) * (1 + margin / 100);
  const gap = ((price - rfq.target) / rfq.target) * 100;
  const rows = [
    { k: `Steel ${grade} @ ₹${steel[grade]}/kg, 12% yield loss`, v: c.steelRs },
    { k: "Forging conversion @ ₹38/kg", v: c.convRs },
    { k: "Heat treatment @ ₹22/kg", v: c.htRs },
    { k: "Machining and spline", v: c.machRs },
    { k: "VCI, crate, ISPM-15 share", v: c.packRs },
  ];
  return (
    <div className="space-y-5">
      <p className="rounded-[8px] bg-d-sunk px-3 py-2 text-[13px] leading-snug">{rfq.note}</p>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Steel grade">
          <select className={inputClass} value={grade} onChange={(e) => setGrade(e.target.value as Grade)}>
            {(Object.keys(steel) as Grade[]).map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </Field>
        <Field label="Net weight, kg">
          <input className={inputClass} inputMode="decimal" value={kg} onChange={(e) => setKg(e.target.value.replace(/[^\d.]/g, ""))} />
        </Field>
        <Field label="Machining ₹/pc">
          <input className={inputClass} inputMode="numeric" value={mach} onChange={(e) => setMach(e.target.value.replace(/\D/g, ""))} />
        </Field>
      </div>
      <div className="rounded-[10px] border border-d-line">
        {rows.map((r) => (
          <div key={r.k} className="flex items-center justify-between border-b border-d-line px-3 py-2 text-[12.5px] last:border-0">
            <span className="text-d-mute">{r.k}</span>
            <span className="tnum font-mono">{inr(r.v)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between bg-d-sunk px-3 py-2 text-[13px] font-semibold">
          <span>Ex-works cost</span>
          <span className="tnum font-mono">
            {inr(c.total)} · {usd(c.total / FX)}
          </span>
        </div>
      </div>
      <div>
        <div className="flex items-baseline justify-between">
          <span className="text-[12px] font-medium text-d-mute">Margin</span>
          <span className="tnum font-mono text-[13px] font-semibold">{margin}%</span>
        </div>
        <input type="range" min={6} max={28} value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="mt-1 w-full accent-[var(--d-accent)]" />
        <div className="flex justify-between font-mono text-[10.5px] text-d-mute">
          <span>6% floor</span>
          <span>owner band 14–20%</span>
          <span>28%</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[10px] border border-d-accent/50 bg-d-soft p-3">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-d-mute">our price, FOB Mundra</p>
          <p className="tnum mt-1 font-mono text-[26px] font-bold text-d-accent">{usd(Number(price.toFixed(2)))}</p>
        </div>
        <div className="rounded-[10px] border border-d-line p-3">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-d-mute">buyer target</p>
          <p className="tnum mt-1 font-mono text-[26px] font-bold">{usd(rfq.target)}</p>
          <Pill tone={gap > 2 ? "late" : gap > 0 ? "warn" : "ok"} mono>
            {gap > 0 ? "+" : ""}
            {gap.toFixed(1)}% vs target
          </Pill>
        </div>
      </div>
      <p className="text-[12.5px] text-d-mute">
        Annual value at this price: <b className="text-d-ink">{usd(price * rfq.volume, true)}</b> · {inr(price * rfq.volume * FX, { compact: true })} · USD/INR {FX}
      </p>
      <div className="flex flex-wrap justify-end gap-2 border-t border-d-line pt-4">
        <Btn
          onClick={() => {
            onStage(rfq.id, "Sample", `${rfq.id}: samples offered to ${rfq.buyer}`);
            onClose();
          }}
        >
          Offer samples
        </Btn>
        <Btn
          variant="solid"
          icon={Send}
          onClick={() => {
            onStage(rfq.id, "Quoted", `${rfq.id} quoted at ${usd(Number(price.toFixed(2)))} FOB to ${rfq.buyer}`);
            onClose();
          }}
        >
          Send quote
        </Btn>
      </div>
    </div>
  );
}

/* ============================================================
   Quality & PPAP
   ============================================================ */

const cmm: Record<string, { ch: string; nom: string; tol: number; reads: number[]; cpk: number }[]> = {
  "SAC-CV-2214": [
    { ch: "Stub OD Ø24.00", nom: "24.000", tol: 0.02, reads: [24.011, 24.009, 24.013, 24.01, 24.012], cpk: 1.48 },
    { ch: "Bell OD Ø78.00", nom: "78.000", tol: 0.05, reads: [78.02, 78.018, 78.024, 78.019, 78.021], cpk: 1.62 },
    { ch: "Overall length", nom: "196.00", tol: 0.3, reads: [196.12, 196.1, 196.15, 196.11, 196.12], cpk: 1.71 },
    { ch: "Case depth (mm)", nom: "0.90", tol: 0.2, reads: [0.94, 0.92, 0.96, 0.93, 0.95], cpk: 1.55 },
    { ch: "Surface HRC", nom: "60", tol: 2, reads: [60.4, 60.9, 59.8, 60.6, 60.2], cpk: 1.39 },
  ],
  "SAC-HB-4108": [
    { ch: "Bearing bore Ø52.00", nom: "52.000", tol: 0.025, reads: [52.01, 52.012, 52.008, 52.011, 52.009], cpk: 1.41 },
    { ch: "Flange OD Ø134.0", nom: "134.000", tol: 0.05, reads: [134.046, 134.042, 134.049, 134.044, 134.047], cpk: 1.21 },
    { ch: "Overall length", nom: "88.00", tol: 0.25, reads: [88.08, 88.06, 88.1, 88.07, 88.09], cpk: 1.58 },
    { ch: "Stud PCD Ø139.7", nom: "139.700", tol: 0.1, reads: [139.71, 139.72, 139.69, 139.71, 139.7], cpk: 1.66 },
  ],
  "SAC-PN-4110": [
    { ch: "Pilot Ø22.00", nom: "22.000", tol: 0.02, reads: [22.008, 22.009, 22.006, 22.01, 22.007], cpk: 1.49 },
    { ch: "Head OD Ø46.00", nom: "46.000", tol: 0.04, reads: [46.016, 46.018, 46.014, 46.017, 46.015], cpk: 1.52 },
    { ch: "Overall length", nom: "174.00", tol: 0.25, reads: [174.27, 174.24, 174.29, 174.26, 174.28], cpk: 1.12 },
    { ch: "Grain flow (macro-etch)", nom: "OK", tol: 0, reads: [1, 1, 1, 1, 1], cpk: 0 },
  ],
};

function QualityTab() {
  const desk = useDesk();
  const [ppaps, setPpaps] = React.useState(seedPpaps);
  const [doneMap, setDoneMap] = React.useState<Record<string, number[]>>(() => Object.fromEntries(seedPpaps.map((p) => [p.id, Array.from({ length: p.done }, (_, i) => i)])));
  const [open, setOpen] = React.useState<string | null>(null);
  const [cmmPart, setCmmPart] = React.useState<keyof typeof cmm>("SAC-HB-4108");
  const [eights, setEights] = React.useState([
    { id: "8D-061", cust: "Ridgeline Auto", issue: "Burr on spline end, 46 pcs in lot 0914", age: 9, step: "D5 corrective action" },
    { id: "8D-060", cust: "Gulf Motor Spares", issue: "Rust spots on 2 crates, VCI torn", age: 14, step: "D7 prevent recurrence" },
    { id: "8D-058", cust: "Kaiser Teile", issue: "Label shows old part rev", age: 21, step: "D8 closure pending" },
  ]);
  const ppap = ppaps.find((p) => p.id === open) ?? null;
  const done = ppap ? doneMap[ppap.id] ?? [] : [];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Customer ppm, 90 days" value="182" delta="-34" deltaGood={false} hint="target under 250" icon={ShieldCheck} tone="ok" trend={[260, 241, 230, 222, 210, 216, 182]} />
        <Stat label="PPAPs open" value={ppaps.filter((p) => p.status !== "Approved").length} hint={`${ppaps.filter((p) => p.status === "Rejected").length} rejected, re-submit`} icon={ClipboardCheck} tone="warn" />
        <Stat label="Parts under Cpk 1.33" value="2" hint="HB-4108, PN-4110" icon={Ruler} tone="late" />
        <Stat label="Open 8Ds" value={eights.length} delta="-1" deltaGood={false} hint="oldest 21 days" icon={AlertTriangle} />
      </div>
      <Panel title="PPAP register" sub="18 elements per submission. Click a row to tick elements and submit the warrant.">
        <DataTable
          rows={ppaps}
          rowKey={(p) => p.id}
          search={(p) => `${p.id} ${p.part} ${p.customer}`}
          searchPlaceholder="Search part or customer"
          filter={{ get: (p) => p.status, options: ["In prep", "Submitted", "Interim", "Rejected", "Approved"] }}
          onRow={(p) => setOpen(p.id)}
          columns={[
            { key: "id", label: "PPAP", render: (p) => <span className="font-mono text-[12.5px] font-semibold">{p.id}</span>, sort: (p) => p.id },
            { key: "part", label: "Part", render: (p) => <span className="font-mono text-[12px]">{p.part}</span>, sort: (p) => p.part },
            { key: "cust", label: "Customer", render: (p) => p.customer, sort: (p) => p.customer },
            { key: "lvl", label: "Level", align: "center", render: (p) => <span className="rounded-[4px] bg-d-sunk px-1.5 font-mono text-[11.5px] font-semibold">L{p.level}</span>, sort: (p) => p.level },
            {
              key: "el",
              label: "Elements",
              render: (p) => {
                const n = (doneMap[p.id] ?? []).length;
                return (
                  <div className="flex min-w-[130px] items-center gap-2">
                    <Meter value={n} max={18} tone={n === 18 ? "ok" : n >= 14 ? "accent" : "warn"} />
                    <span className="font-mono text-[11px] text-d-mute">{n}/18</span>
                  </div>
                );
              },
              sort: (p) => (doneMap[p.id] ?? []).length,
            },
            { key: "due", label: "Due", render: (p) => <span className="font-mono text-[12px]">{p.due}</span>, wide: true },
            { key: "st", label: "Status", render: (p) => <Pill tone={ppapTone[p.status]}>{p.status}</Pill> },
          ]}
        />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
        <Panel title="CMM results" sub="Last 5 lots from the Zeiss CMM. Under 1.33 Cpk goes on watch." action={<Segmented size="sm" options={Object.keys(cmm) as (keyof typeof cmm)[]} value={cmmPart} onChange={setCmmPart} />}>
          <div className="desk-scroll -mx-5 overflow-x-auto px-5">
            <table className="w-full min-w-[560px] text-[12.5px]">
              <thead>
                <tr className="border-b border-d-line text-left text-[11px] text-d-mute">
                  <th className="pb-2 font-medium">Characteristic</th>
                  <th className="pb-2 font-medium">Nominal</th>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <th key={i} className="pb-2 text-center font-medium">
                      Lot {i}
                    </th>
                  ))}
                  <th className="pb-2 text-right font-medium">Cpk</th>
                </tr>
              </thead>
              <tbody>
                {cmm[cmmPart].map((r) => (
                  <tr key={r.ch} className="border-b border-d-line/60 last:border-0">
                    <td className="py-2 pr-2 font-medium">{r.ch}</td>
                    <td className="py-2 font-mono text-d-mute">
                      {r.nom}
                      {r.tol ? ` ±${r.tol}` : ""}
                    </td>
                    {r.reads.map((v, i) => {
                      const nomN = Number(r.nom);
                      const frac = r.tol ? Math.abs(v - nomN) / r.tol : 0;
                      return (
                        <td key={i} className="py-2 text-center">
                          <span className="tnum rounded-[4px] px-1.5 py-0.5 font-mono text-[11.5px]" style={{ background: `color-mix(in oklab, ${frac > 1 ? "var(--d-late)" : frac > 0.8 ? "var(--d-warn)" : "var(--d-ok)"} 16%, transparent)` }}>
                            {r.tol ? v.toFixed(r.tol < 0.1 ? 3 : 2) : "OK"}
                          </span>
                        </td>
                      );
                    })}
                    <td className="py-2 text-right">{r.cpk ? <Pill tone={r.cpk >= 1.33 ? "ok" : "late"} mono>{r.cpk.toFixed(2)}</Pill> : <Pill tone="ok">pass</Pill>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="ppm by customer" sub="90 days, against each buyer's agreed target">
          <Bars
            height={190}
            format={(v) => `${v}`}
            data={[
              { label: "Kaiser", value: 120, tone: "ok", note: "target 150" },
              { label: "Ridgeline", value: 310, tone: "late", note: "target 250, spline burr 8D" },
              { label: "Gulf MS", value: 190, tone: "warn", note: "target 200" },
              { label: "Vortex", value: 80, tone: "ok", note: "target 150" },
              { label: "Agrimek", value: 140, tone: "ok", note: "target 300" },
              { label: "Norte", value: 210, tone: "warn", note: "target 250" },
            ]}
          />
        </Panel>
      </div>
      <Panel icon={AlertTriangle} title="Customer complaints, 8D" sub="Close when the buyer accepts D8">
        <ul className="divide-y divide-d-line">
          {eights.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center gap-3 py-2.5">
              <span className="font-mono text-[12px] font-semibold">{e.id}</span>
              <div className="min-w-[200px] flex-1">
                <p className="text-[13px] font-medium">
                  {e.cust} · {e.issue}
                </p>
                <p className="text-[11.5px] text-d-mute">{e.step}</p>
              </div>
              <Pill tone={e.age > 14 ? "late" : "warn"} mono>
                {e.age} days
              </Pill>
              <Btn
                size="sm"
                variant="soft"
                icon={CheckCheck}
                onClick={() => {
                  setEights((cur) => cur.filter((x) => x.id !== e.id));
                  toast.success(`${e.id} closed`, { description: `${e.cust} accepted D8` });
                  desk.log(`${e.id} closed with ${e.cust}`, "ok");
                }}
              >
                Close 8D
              </Btn>
            </li>
          ))}
          {eights.length === 0 && <li className="py-6 text-center text-[13px] text-d-mute">No open complaints.</li>}
        </ul>
      </Panel>
      <Sheet
        open={!!ppap}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={ppap ? `${ppap.id} · Level ${ppap.level} · ${ppap.eng}` : ""}
        title={ppap ? `${ppap.part} for ${ppap.customer}` : ""}
        sub={ppap ? ppap.reason : ""}
        width={520}
        footer={
          ppap && (
            <Btn
              variant="solid"
              icon={Send}
              disabled={done.length < 18 || ppap.status === "Submitted" || ppap.status === "Approved"}
              onClick={() => {
                setPpaps((cur) => cur.map((p) => (p.id === ppap.id ? { ...p, status: "Submitted" } : p)));
                toast.success("Part submission warrant sent", { description: `${ppap.customer} portal, Level ${ppap.level}` });
                desk.log(`${ppap.id} PSW submitted to ${ppap.customer}`, "ok");
              }}
            >
              {ppap.status === "Approved" ? "Approved" : ppap.status === "Submitted" ? "Submitted" : `Submit PSW (${done.length}/18)`}
            </Btn>
          )
        }
      >
        {ppap && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Meter value={done.length} max={18} tone={done.length === 18 ? "ok" : "accent"} height={8} />
              <span className="font-mono text-[12px]">{done.length}/18</span>
            </div>
            <Checklist
              items={PPAP_ELEMENTS.map((el, i) => ({ id: String(i), label: `${String(i + 1).padStart(2, "0")} ${el}`, done: done.includes(i) }))}
              onToggle={(id) => {
                const i = Number(id);
                setDoneMap((cur) => {
                  const list = cur[ppap.id] ?? [];
                  return { ...cur, [ppap.id]: list.includes(i) ? list.filter((x) => x !== i) : [...list, i] };
                });
                desk.log(`${ppap.id}: ${PPAP_ELEMENTS[i]} updated`);
              }}
            />
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ============================================================
   Production
   ============================================================ */

function ProductionTab() {
  const desk = useDesk();
  const [state, setState] = React.useState<Record<string, Line["status"]>>(() => Object.fromEntries(lines.map((l) => [l.id, l.status])));
  const [dies, setDies] = React.useState(seedDies);
  const [openDie, setOpenDie] = React.useState<string | null>(null);
  const die = dies.find((x) => x.id === openDie) ?? null;
  const running = lines.filter((l) => state[l.id] === "Running");
  const oee = Math.round(running.reduce((a, l) => a + l.oee, 0) / Math.max(1, running.length));

  function toggle(l: Line) {
    const next: Line["status"] = state[l.id] === "Running" ? "Die change" : "Running";
    setState((cur) => ({ ...cur, [l.id]: next }));
    toast.success(`${l.name}: ${next === "Running" ? "back running" : "stopped for die change"}`);
    desk.log(`${l.name} ${next === "Running" ? "restarted" : "stopped for die change"}`, next === "Running" ? "ok" : "warn");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Plant OEE, running lines" value={`${oee}%`} delta="+3%" hint="vs last week" icon={GaugeIcon} tone="ok" trend={[68, 70, 71, 73, 72, 74, oee]} />
        <Stat label="Lines down" value={lines.length - running.length} hint="furnace, upsetter die change" icon={AlertTriangle} tone="late" />
        <Stat label="Forgings today" value="2,598" delta="+6%" hint="target 3,400 by 10 PM" icon={Hammer} trend={[310, 690, 1040, 1420, 1790, 2210, 2598]} />
        <Stat label="Steel on hand" value="186 t" hint="≈ 19 days at current burn" icon={Flame} tone="info" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {lines.map((l) => (
          <LineCard key={l.id} line={l} status={state[l.id]} onToggle={() => toggle(l)} />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Die register" sub="Strokes from the press counters. Resink before 90% or risk a cracked die.">
          <DataTable
            rows={dies}
            rowKey={(x) => x.id}
            search={(x) => `${x.id} ${x.part} ${x.press}`}
            searchPlaceholder="Search die or part"
            filter={{ get: (x) => x.press, options: ["1600T", "1000T", "Upsetter", "Ring roller"] }}
            onRow={(x) => setOpenDie(x.id)}
            dense
            columns={[
              { key: "id", label: "Die", render: (x) => <span className="font-mono text-[12.5px] font-semibold">{x.id}</span>, sort: (x) => x.id },
              { key: "part", label: "Part", render: (x) => <span className="font-mono text-[12px] text-d-mute">{x.part}</span>, wide: true },
              { key: "press", label: "Press", render: (x) => x.press },
              {
                key: "life",
                label: "Life used",
                render: (x) => {
                  const p = x.used / x.life;
                  return (
                    <div className="flex min-w-[140px] items-center gap-2">
                      <Meter value={p * 100} tone={p > 0.9 ? "late" : p > 0.75 ? "warn" : "ok"} />
                      <span className="font-mono text-[11px] text-d-mute">{Math.round(p * 100)}%</span>
                    </div>
                  );
                },
                sort: (x) => x.used / x.life,
              },
              { key: "rs", label: "Resinks", align: "right", render: (x) => <span className="tnum font-mono">{x.resinks}</span>, sort: (x) => x.resinks },
              { key: "spot", label: "Where", render: (x) => <span className="text-[12px] text-d-mute">{x.spot}</span>, wide: true },
            ]}
          />
        </Panel>
        <Panel title="OEE by line and hour" sub="From press counters and CNC controllers">
          <HeatGrid rows={lines.map((l) => l.id)} cols={hours} values={lines.map((l) => l.hourly)} format={(v) => (v ? `${v}` : "–")} onCell={(r, c) => toast(`${lines[r].name} at ${hours[c]}:00`, { description: lines[r].hourly[c] ? `${lines[r].hourly[c]}% OEE` : "Stopped" })} />
          <div className="mt-4">
            <Donut size={120} thickness={14} center="6.4 h" sub="lost today" segments={[{ label: "Die change", value: 38, tone: "warn" }, { label: "Furnace trip", value: 31, tone: "late" }, { label: "Billet shortage", value: 12, tone: "info" }, { label: "Tool wear", value: 11, tone: "accent" }, { label: "Power cut", value: 8, tone: "neutral" }]} />
          </div>
        </Panel>
      </div>
      <Panel icon={Flame} title="Steel stock" sub="Days of cover at this week's burn. Orders go to JSW and Mukand through the Ludhiana stockist.">
        <HBars
          format={(v) => `${v} days`}
          data={[
            { label: "EN19 Ø50 round", sub: "52 t", value: 24, tone: "ok" },
            { label: "20MnCr5 Ø40 round", sub: "38 t", value: 11, tone: "warn" },
            { label: "42CrMo4 Ø45 round", sub: "21 t", value: 7, tone: "late" },
            { label: "EN8D Ø38 round", sub: "44 t", value: 31, tone: "ok" },
            { label: "C45 Ø60 round", sub: "31 t", value: 18, tone: "info" },
          ]}
        />
      </Panel>
      <Sheet
        open={!!die}
        onOpenChange={(o) => !o && setOpenDie(null)}
        eyebrow={die ? `${die.press} · ${die.spot}` : ""}
        title={die?.id ?? ""}
        sub={die ? `${die.part} · last resink ${die.last}` : ""}
        footer={
          die && (
            <Btn
              variant="solid"
              icon={Wrench}
              onClick={() => {
                setDies((cur) => cur.map((x) => (x.id === die.id ? { ...x, used: 0, resinks: x.resinks + 1, last: "today", spot: "Toolroom, resinking" } : x)));
                toast.success(`${die.id} sent for resinking`, { description: "Toolroom picks it up after this shift" });
                desk.log(`${die.id} sent for resinking`, "info");
                setOpenDie(null);
              }}
            >
              Send for resinking
            </Btn>
          )
        }
      >
        {die && (
          <div className="space-y-5">
            <KV items={[{ k: "Strokes", v: `${num(die.used)} of ${num(die.life)}` }, { k: "Resinks", v: `${die.resinks} of 6 allowed` }, { k: "Life left", v: `${num(die.life - die.used)} strokes` }, { k: "Days left at current rate", v: `${Math.max(0, Math.round((die.life - die.used) / 1650))}` }]} />
            <Meter value={die.used} max={die.life} tone={die.used / die.life > 0.9 ? "late" : "accent"} height={10} />
            <div>
              <p className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-d-mute">strokes per day, last 10 days</p>
              <Bars height={110} showValues={false} data={[1620, 1710, 1540, 1690, 1580, 0, 1720, 1660, 1610, 1700].map((v, i) => ({ label: `${11 + i}`, value: v, tone: v ? "accent" : "neutral" }))} />
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

function LineCard({ line, status, onToggle }: { line: Line; status: Line["status"]; onToggle: () => void }) {
  const out = useDrift(line.base, status === "Running" ? line.perHr / 60 : 0.0001, 2600);
  const tone: Tone = status === "Running" ? (line.oee >= 80 ? "ok" : line.oee >= 70 ? "accent" : "warn") : "late";
  const Icon = line.kind === "Forging" ? Hammer : line.kind === "Heat treat" ? Flame : Cog;
  return (
    <article className="desk-card desk-rise overflow-hidden">
      <div className={status === "Running" ? "desk-belt h-1.5" : "h-1.5 bg-d-late/60"} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-d-mute">
              <Icon className="h-3.5 w-3.5" /> {line.id} · {line.kind}
            </p>
            <p className="mt-0.5 truncate text-[14.5px] font-semibold">{line.name}</p>
            <p className="truncate font-mono text-[11.5px] text-d-mute">{line.part}</p>
          </div>
          <Pill tone={tone} mono>
            {status === "Running" ? `${line.oee}%` : status}
          </Pill>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="tnum font-mono text-[26px] font-bold">{num(Math.round(out))}</span>
          <span className="text-[11.5px] text-d-mute">pcs today · {line.perHr}/h</span>
        </div>
        <div className="mt-2">
          <div className="flex justify-between text-[11px] text-d-mute">
            <span>{line.kind === "Forging" ? "Die life used" : line.kind === "Heat treat" ? "Load" : "Tool life used"}</span>
            <span className="font-mono">{line.die}%</span>
          </div>
          <Meter value={line.die} tone={line.die > 85 && line.kind !== "Heat treat" ? "late" : "accent"} height={5} className="mt-1" />
        </div>
        <div className="mt-3 flex h-8 items-end gap-[3px]">
          {line.hourly.map((h, i) => (
            <span key={i} className="desk-grow flex-1 rounded-t-[2px]" style={{ height: `${Math.max(6, h)}%`, background: h === 0 ? "var(--d-late)" : h >= 80 ? "var(--d-ok)" : h >= 70 ? "var(--d-accent)" : "var(--d-warn)", opacity: h === 0 ? 0.4 : 0.85, animationDelay: `${i * 25}ms` }} />
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11.5px] text-d-mute">{line.operator}</span>
          {line.kind !== "Heat treat" ? (
            <Btn size="sm" variant={status === "Running" ? "outline" : "solid"} onClick={onToggle}>
              {status === "Running" ? "Log die change" : "Mark running"}
            </Btn>
          ) : status === "Down" ? (
            <Btn size="sm" variant="solid" onClick={onToggle}>
              Restart furnace
            </Btn>
          ) : (
            <span className="font-mono text-[11px] text-d-ok">soak OK</span>
          )}
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   Forex & payments
   ============================================================ */

function ForexTab() {
  const desk = useDesk();
  const spot = useDrift(84.12, 0.012, 2400);
  const [recv, setRecv] = React.useState(seedRecv);
  const [fwd, setFwd] = React.useState(seedFwd);
  const [open, setOpen] = React.useState<string | null>(null);
  const [booking, setBooking] = React.useState(false);
  const [claims, setClaims] = React.useState([
    { id: "rodtep", name: "RoDTEP scrips", sub: "9 shipping bills, Sept, 0.9% of FOB", amt: 512000, state: "Ready to file" },
    { id: "dbk", name: "Duty drawback", sub: "All-industry rate, 14 SBs", amt: 386000, state: "Credited to SBI" },
    { id: "igst", name: "IGST refund", sub: "2 SBs stuck on invoice mismatch", amt: 241000, state: "Mismatch" },
    { id: "ies", name: "Interest equalisation", sub: "3% on packing credit, Q2", amt: 168000, state: "Claim with bank" },
  ]);
  const rate = (c: Cur) => baseRate[c] * (spot / 84.12);
  const r = recv.find((x) => x.inv === open) ?? null;
  const pending = recv.filter((x) => x.status !== "Realised");
  const inrPending = pending.reduce((a, x) => a + x.amt * rate(x.cur), 0);
  const usdPending = pending.filter((x) => x.cur === "USD").reduce((a, x) => a + x.amt, 0);
  const usdCovered = fwd.filter((f) => f.cur === "USD").reduce((a, f) => a + f.amt, 0);
  const unhedged = Math.max(0, Math.round((1 - usdCovered / (usdPending + 180000)) * 100));
  const curSym: Record<Cur, string> = { USD: "$", EUR: "€", GBP: "£" };
  const fmt = (c: Cur, v: number) => `${curSym[c]}${v.toLocaleString("en-US")}`;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="USD / INR spot" value={spot.toFixed(3)} delta="+0.06" hint="SBI card rate, live" icon={DollarSign} tone="info" trend={[83.71, 83.8, 83.92, 84.01, 83.97, 84.06, spot]} />
        <Stat label="Receivables outstanding" value={inr(inrPending, { compact: true })} delta="+4%" deltaGood={false} hint={`${pending.length} invoices, 3 currencies`} icon={IndianRupee} tone="warn" trend={[3.6, 3.9, 4.1, 4.4, 4.6, 4.8, inrPending / 1e7]} />
        <Stat label="USD exposure unhedged" value={`${unhedged}%`} hint="policy: under 40%" icon={TrendingUp} tone={unhedged > 40 ? "late" : "ok"} />
        <Stat label="Incentives pending" value={inr(claims.filter((c) => c.state !== "Credited to SBI").reduce((a, c) => a + c.amt, 0), { compact: true })} hint="RoDTEP, IGST, interest equalisation" icon={Banknote} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Export receivables" sub="Marked to live spot. Click a row to realise or chase.">
          <DataTable
            rows={recv}
            rowKey={(x) => x.inv}
            search={(x) => `${x.inv} ${x.buyer}`}
            searchPlaceholder="Search invoice or buyer"
            filter={{ get: (x) => x.status, options: ["Overdue", "Awaiting", "Realised"] }}
            onRow={(x) => setOpen(x.inv)}
            bulk={[{ label: "Chase on email", run: (k) => { toast.success(`${k.length} payment reminders sent`); desk.log(`${k.length} export payment reminders sent`); } }]}
            columns={[
              { key: "inv", label: "Invoice", render: (x) => <span className="font-mono text-[11.5px]">{x.inv.replace("SAC/EX/24-25/", "EX-")}</span>, sort: (x) => x.inv },
              { key: "buyer", label: "Buyer", render: (x) => <span className="font-medium">{x.buyer}</span>, sort: (x) => x.buyer },
              { key: "amt", label: "Amount", align: "right", render: (x) => <span className="tnum font-mono">{fmt(x.cur, x.amt)}</span>, sort: (x) => x.amt * baseRate[x.cur] },
              { key: "inr", label: "₹ at spot", align: "right", render: (x) => <span className="tnum font-mono text-d-mute">{inr(x.amt * rate(x.cur), { compact: true })}</span>, wide: true },
              { key: "due", label: "Due", align: "right", render: (x) => (x.status === "Realised" ? <span className="text-d-mute">—</span> : <span className="tnum font-mono" style={{ color: x.dueIn < 0 ? "var(--d-late)" : x.dueIn <= 7 ? "var(--d-warn)" : undefined }}>{x.dueIn < 0 ? `${-x.dueIn}d over` : `${x.dueIn}d`}</span>), sort: (x) => (x.status === "Realised" ? 999 : x.dueIn) },
              { key: "st", label: "Status", render: (x) => <Pill tone={x.status === "Overdue" ? "late" : x.status === "Realised" ? "ok" : "info"}>{x.status}</Pill> },
              { key: "ebrc", label: "eBRC", render: (x) => (x.ebrc ? <Pill tone="ok">issued</Pill> : x.status === "Realised" ? <Pill tone="warn">pending</Pill> : <span className="text-d-mute">—</span>), wide: true },
            ]}
          />
        </Panel>
        <Panel
          title="Forward covers"
          sub="Mark-to-market against live spot"
          action={
            <Btn size="sm" variant="solid" icon={Plus} onClick={() => setBooking(true)}>
              Book
            </Btn>
          }
        >
          <ul className="space-y-2">
            {fwd.map((f) => {
              const mtm = (f.rate - rate(f.cur)) * f.amt;
              return (
                <li key={f.id} className="rounded-[8px] border border-d-line px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[12.5px] font-semibold">
                      {f.id} · {fmt(f.cur, f.amt)}
                    </span>
                    <span className="tnum font-mono text-[12.5px]" style={{ color: mtm >= 0 ? "var(--d-ok)" : "var(--d-late)" }}>
                      {mtm >= 0 ? "+" : "−"}
                      {inr(Math.abs(mtm), { compact: true })}
                    </span>
                  </div>
                  <p className="mt-0.5 flex justify-between text-[11.5px] text-d-mute">
                    <span>
                      {f.bank} · booked {f.rate.toFixed(2)}
                    </span>
                    <span>matures {f.maturity}</span>
                  </p>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Panel title="USD/INR, 30 sessions" sub="RBI reference rate against our average booked forward">
          <AreaChart
            labels={Array.from({ length: 30 }, (_, i) => `${i + 1}`)}
            series={[
              { name: "USD/INR", data: [83.42, 83.45, 83.51, 83.49, 83.56, 83.6, 83.58, 83.64, 83.7, 83.66, 83.72, 83.75, 83.8, 83.78, 83.84, 83.88, 83.86, 83.9, 83.95, 83.93, 83.98, 84.02, 84.0, 84.05, 84.04, 84.09, 84.07, 84.1, 84.11, Number(spot.toFixed(2))], tone: "accent" },
              { name: "Avg booked forward", data: Array(30).fill(84.43), tone: "ok", dashed: true },
            ]}
            format={(v) => v.toFixed(2)}
            height={180}
          />
        </Panel>
        <Panel icon={Banknote} title="Export incentives" sub="DGFT, ICEGATE and the bank">
          <ul className="divide-y divide-d-line">
            {claims.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3 py-2.5">
                <div className="min-w-[150px] flex-1">
                  <p className="text-[13px] font-medium">{c.name}</p>
                  <p className="text-[11.5px] text-d-mute">{c.sub}</p>
                </div>
                <span className="tnum font-mono text-[12.5px]">{inr(c.amt, { compact: true })}</span>
                {c.state === "Credited to SBI" || c.state === "Filed" ? (
                  <Pill tone="ok">{c.state}</Pill>
                ) : (
                  <Btn
                    size="sm"
                    variant={c.state === "Mismatch" ? "outline" : "soft"}
                    onClick={() => {
                      setClaims((cur) => cur.map((x) => (x.id === c.id ? { ...x, state: "Filed" } : x)));
                      toast.success(`${c.name} ${c.state === "Mismatch" ? "correction filed" : "filed"}`, { description: inr(c.amt) });
                      desk.log(`${c.name} filed for ${inr(c.amt, { compact: true })}`, "ok");
                    }}
                  >
                    {c.state === "Mismatch" ? "Fix and refile" : c.state === "Claim with bank" ? "Claim" : "File"}
                  </Btn>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-3 rounded-[8px] bg-d-sunk p-3">
            <div className="flex justify-between text-[12px]">
              <span>EPCG export obligation, 1600T press</span>
              <span className="font-mono">₹14.2 Cr of ₹21.6 Cr</span>
            </div>
            <Meter value={14.2} max={21.6} tone="accent" className="mt-1.5" />
            <p className="mt-1 text-[11px] text-d-mute">Block 1 of 2 ends Mar 2027 · on track</p>
          </div>
        </Panel>
      </div>
      <Sheet
        open={!!r}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={r ? `${r.bank} · ${r.cur}` : ""}
        title={r ? `${r.buyer}` : ""}
        sub={r ? `${r.inv} · ${fmt(r.cur, r.amt)} · ${inr(r.amt * rate(r.cur))} at spot` : ""}
        footer={
          r && (
            <>
              <Btn
                icon={Mail}
                onClick={() => {
                  toast.success("Reminder sent", { description: `${r.buyer} · accounts payable` });
                  desk.log(`Payment reminder to ${r.buyer} for ${fmt(r.cur, r.amt)}`);
                }}
              >
                Chase buyer
              </Btn>
              <Btn
                variant="solid"
                icon={CheckCheck}
                disabled={r.status === "Realised"}
                onClick={() => {
                  setRecv((cur) => cur.map((x) => (x.inv === r.inv ? { ...x, status: "Realised" } : x)));
                  toast.success(`${fmt(r.cur, r.amt)} realised`, { description: `Converted at ${rate(r.cur).toFixed(2)} · eBRC requested` });
                  desk.log(`${r.inv} realised at ${rate(r.cur).toFixed(2)}`, "ok");
                  setOpen(null);
                }}
              >
                Mark realised
              </Btn>
            </>
          )
        }
      >
        {r && (
          <div className="space-y-4">
            <KV
              items={[
                { k: "Status", v: <Pill tone={r.status === "Overdue" ? "late" : r.status === "Realised" ? "ok" : "info"}>{r.status}</Pill> },
                { k: "Due", v: r.status === "Realised" ? "Paid" : r.dueIn < 0 ? `${-r.dueIn} days overdue` : `in ${r.dueIn} days` },
                { k: "Live rate", v: rate(r.cur).toFixed(3) },
                { k: "eBRC", v: r.ebrc ? "Issued" : "Not yet" },
                { k: "FEMA limit", v: "9 months from export" },
                { k: "Covered", v: fwd.some((f) => f.cur === r.cur) ? "Partly, by forward" : "Open" },
              ]}
            />
            <div className="rounded-[10px] border border-d-line p-3 text-[13px] leading-relaxed">
              Dear {r.buyer} accounts team, invoice {r.inv} for {fmt(r.cur, r.amt)} {r.dueIn < 0 ? `fell due ${-r.dueIn} days ago` : `falls due in ${r.dueIn} days`}. Remittance details: {r.bank}, SWIFT SBININBB419. Please quote the invoice number. Regards, Neha Malhotra, Sutlej Auto Components.
            </div>
          </div>
        )}
      </Sheet>
      <BookForward
        open={booking}
        onOpenChange={setBooking}
        spot={spot}
        onBook={(f) => {
          setFwd((cur) => [f, ...cur]);
          toast.success(`${f.id} booked`, { description: `${fmt(f.cur, f.amt)} at ${f.rate.toFixed(2)} with ${f.bank}` });
          desk.log(`Forward ${f.id} booked: ${fmt(f.cur, f.amt)} at ${f.rate.toFixed(2)}`, "ok");
        }}
      />
    </div>
  );
}

function BookForward({ open, onOpenChange, spot, onBook }: { open: boolean; onOpenChange: (o: boolean) => void; spot: number; onBook: (f: Fwd) => void }) {
  const [cur, setCur] = React.useState<Cur>("USD");
  const [amt, setAmt] = React.useState("100000");
  const [tenor, setTenor] = React.useState("60");
  const [bank, setBank] = React.useState("SBI Treasury");
  const [seq, setSeq] = React.useState(415);
  const premium = (Number(tenor) / 365) * 0.019;
  const r = baseRate[cur] * (spot / 84.12) * (1 + premium);
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Book a forward cover" sub="Indicative rate = live spot plus forward premium. The bank confirms on the recorded line.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onBook({ id: `FC-0${seq}`, bank, cur, amt: Number(amt) || 0, rate: Number(r.toFixed(2)), maturity: `${tenor} days` });
          setSeq((s) => s + 1);
          onOpenChange(false);
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Currency">
            <select className={inputClass} value={cur} onChange={(e) => setCur(e.target.value as Cur)}>
              {(["USD", "EUR", "GBP"] as Cur[]).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Amount">
            <input className={inputClass} inputMode="numeric" value={amt} onChange={(e) => setAmt(e.target.value.replace(/\D/g, ""))} />
          </Field>
          <Field label="Tenor">
            <select className={inputClass} value={tenor} onChange={(e) => setTenor(e.target.value)}>
              {["30", "60", "90", "120"].map((t) => (
                <option key={t} value={t}>
                  {t} days
                </option>
              ))}
            </select>
          </Field>
          <Field label="Bank">
            <select className={inputClass} value={bank} onChange={(e) => setBank(e.target.value)}>
              {["SBI Treasury", "HDFC Bank", "Kotak Mahindra"].map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="rounded-[8px] bg-d-sunk p-3 font-mono text-[13px]">
          indicative {r.toFixed(3)} · premium {(premium * 100).toFixed(2)}% · ≈ {inr((Number(amt) || 0) * r, { compact: true })}
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Btn onClick={() => onOpenChange(false)}>Cancel</Btn>
          <Btn variant="solid" type="submit" icon={Banknote}>
            Book cover
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
