"use client";

import * as React from "react";
import { cn } from "cn";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  Boxes,
  CalendarClock,
  CircleDot,
  ClipboardCheck,
  Droplets,
  FileText,
  Fish,
  Flame,
  FlaskConical,
  Gauge as GaugeIcon,
  HeartPulse,
  IndianRupee,
  MessageCircle,
  PackagePlus,
  Plus,
  Receipt,
  RotateCcw,
  ScanLine,
  Send,
  ShieldCheck,
  Skull,
  Snowflake,
  TestTubes,
  Thermometer,
  Timer,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { DeskShell, useDesk } from "../shell";
import { AreaChart, Bars, Donut, HBars, Sparkline } from "../charts";
import { AgingBar, ApprovalQueue, Board, Checklist, Countdown, DataTable } from "../data";
import { AgentsModule, ConnectionsModule, IndependenceModule, PeopleModule } from "../common";
import { Btn, Field, inputClass, inr, KV, Meter, Modal, Panel, Pill, SearchBox, Segmented, Sheet, Stat } from "../ui";
import { useDrift, useTicker } from "../hooks";
import type { DeskConfig, DeskModule, IndependenceData, Integration, TeamMember, Tone, WorkforceAgent } from "../types";

/* ============================================================
   Data — Narmada Lab Supply, Vapi. Fictional distributor of lab
   chemicals, reagents and solvents to pharma and industrial QC labs.
   Day 0 = today, 20 Oct 2026. Expiry is in days from today.
   ============================================================ */

type Ghs = "GHS02" | "GHS03" | "GHS05" | "GHS06" | "GHS07" | "GHS08" | "GHS09";
type Hazard = "Flammable" | "Oxidiser" | "Toxic" | "Corrosive" | "Irritant" | "Non-haz";
type Grade = "AR" | "HPLC" | "GR" | "LR" | "CRM";
type Family = "Acids" | "Solvents" | "Salts & bases" | "Reagents" | "Standards";
type ColourMode = "Stock" | "Expiry" | "Hazard";

type Sku = {
  idx: number;
  sym: string;
  name: string;
  grade: Grade;
  pack: string;
  stock: number;
  min: number;
  exp: number;
  ghs: Ghs[];
  row: number;
  col: number;
  cas: string;
  price: number;
  principal: string;
  monthly: number;
  family: Family;
  cold: boolean;
  msds: boolean;
  peso?: "A" | "B";
  onOrder: number;
};

const PRINCIPALS = ["Vasudha Fine Chemicals, Tarapur", "Kesar Solvents, Ankleshwar", "Indus Analytical, Mumbai", "Nilkanth Reagents, Vadodara", "Spectra Standards, Hyderabad"];

type Raw = [string, string, Grade, string, number, number, number, string, number, number, string, number, number, number, string?];
const raw: Raw[] = [
  ["HCl", "Hydrochloric acid 35%", "AR", "2.5 L", 42, 30, 410, "05 07", 1, 1, "7647-01-0", 640, 0, 38],
  ["H₂SO₄", "Sulphuric acid 98%", "AR", "2.5 L", 36, 24, 520, "05", 1, 2, "7664-93-9", 720, 0, 26],
  ["HNO₃", "Nitric acid 69%", "GR", "2.5 L", 9, 16, 380, "03 05", 2, 1, "7697-37-2", 1180, 0, 14],
  ["AcOH", "Glacial acetic acid", "AR", "2.5 L", 28, 20, 30, "02 05", 2, 2, "64-19-7", 890, 0, 18, "B"],
  ["H₃PO₄", "Ortho-phosphoric acid 88%", "HPLC", "500 mL", 54, 40, 600, "05", 3, 1, "7664-38-2", 760, 2, 44],
  ["HClO₄", "Perchloric acid 70%", "AR", "500 mL", 6, 6, 290, "03 05", 3, 2, "7601-90-3", 1960, 0, 4],
  ["HCOOH", "Formic acid 98%", "HPLC", "500 mL", 0, 12, 0, "02 05 06", 4, 1, "64-18-6", 1240, 2, 10, "B"],
  ["TFA", "Trifluoroacetic acid", "HPLC", "100 mL", 14, 10, 22, "05 09", 4, 2, "76-05-1", 2850, 2, 9, "c"],
  ["ACN", "Acetonitrile", "HPLC", "2.5 L", 64, 80, 340, "02 07", 1, 11, "75-05-8", 3180, 1, 96, "A"],
  ["MeOH", "Methanol", "HPLC", "2.5 L", 118, 90, 450, "02 06 08", 1, 12, "67-56-1", 1450, 1, 110, "A"],
  ["THF", "Tetrahydrofuran", "HPLC", "2.5 L", 11, 12, 120, "02 07 08", 2, 7, "109-99-9", 4120, 1, 8, "A"],
  ["EtOAc", "Ethyl acetate", "AR", "2.5 L", 46, 30, 500, "02 07", 2, 8, "141-78-6", 1320, 1, 28, "A"],
  ["Hex", "n-Hexane 95%", "HPLC", "2.5 L", 22, 20, 41, "02 07 08 09", 2, 9, "110-54-3", 2240, 1, 19, "A"],
  ["DCM", "Dichloromethane", "AR", "2.5 L", 31, 24, 380, "07 08", 2, 10, "75-09-2", 1580, 1, 22],
  ["IPA", "Isopropyl alcohol", "HPLC", "2.5 L", 58, 40, 610, "02 07", 2, 11, "67-63-0", 1260, 1, 36, "A"],
  ["DMSO", "Dimethyl sulfoxide", "GR", "500 mL", 19, 10, 700, "", 2, 12, "67-68-5", 980, 3, 6],
  ["NaOH", "Sodium hydroxide pellets", "AR", "500 g", 48, 30, 800, "05", 3, 3, "1310-73-2", 420, 0, 30],
  ["KOH", "Potassium hydroxide flakes", "AR", "500 g", 17, 15, 720, "05 07", 3, 4, "1310-58-3", 560, 0, 12],
  ["NH₃", "Ammonia solution 25%", "AR", "2.5 L", 8, 12, 64, "05 07 09", 3, 5, "1336-21-6", 610, 0, 10],
  ["Na₂CO₃", "Sodium carbonate anhydrous", "AR", "500 g", 40, 15, 900, "07", 3, 6, "497-19-8", 310, 3, 9],
  ["KH₂PO₄", "Potassium dihydrogen phosphate", "HPLC", "500 g", 33, 25, 560, "", 3, 7, "7778-77-0", 880, 3, 22],
  ["NaCl", "Sodium chloride", "AR", "500 g", 60, 20, 1100, "", 3, 8, "7647-14-5", 190, 3, 14],
  ["KBr", "Potassium bromide, IR grade", "GR", "100 g", 7, 6, 640, "07", 4, 3, "7758-02-3", 1650, 2, 5],
  ["Na₂SO₄", "Sodium sulphate anhydrous", "AR", "500 g", 29, 15, 820, "", 4, 4, "7757-82-6", 280, 3, 8],
  ["NH₄OAc", "Ammonium acetate", "HPLC", "500 g", 4, 10, 210, "", 4, 5, "631-61-8", 1340, 2, 11],
  ["Tris", "Tris buffer base", "GR", "500 g", 12, 8, 18, "07", 4, 6, "77-86-1", 2140, 3, 5, "c"],
  ["KMnO₄", "Potassium permanganate", "AR", "500 g", 15, 10, 940, "03 07 09", 4, 7, "7722-64-7", 690, 0, 7],
  ["AgNO₃", "Silver nitrate", "AR", "25 g", 7, 8, 760, "03 05 09", 4, 8, "7761-88-8", 3980, 0, 6],
  ["KFR", "Karl Fischer reagent, pyridine-free", "AR", "1 L", 21, 24, 26, "02 06 08", 3, 9, "—", 3650, 3, 20, "cA"],
  ["Nin", "Ninhydrin", "AR", "25 g", 3, 4, 150, "07", 3, 10, "485-47-2", 1450, 3, 2, "c"],
  ["PhP", "Phenolphthalein indicator", "AR", "125 mL", 26, 10, 480, "02 08", 3, 11, "77-09-8", 240, 3, 6],
  ["MO", "Methyl orange indicator", "AR", "125 mL", 18, 8, 400, "06", 3, 12, "547-58-0", 220, 3, 4, "m"],
  ["EDTA", "Disodium EDTA", "AR", "500 g", 24, 12, 900, "07", 4, 9, "6381-92-6", 760, 3, 7],
  ["EBT", "Eriochrome black T", "AR", "25 g", 3, 4, 330, "07", 4, 10, "1787-61-7", 680, 3, 2],
  ["I₂", "Iodine resublimed", "AR", "100 g", 6, 5, 700, "07 08 09", 4, 11, "7553-56-2", 2460, 0, 3, "m"],
  ["Stc", "Starch soluble", "LR", "500 g", 14, 6, 12, "", 4, 12, "9005-84-9", 340, 3, 4],
  ["pH4", "Buffer pH 4.00 ± 0.02", "CRM", "500 mL", 22, 12, 95, "", 6, 3, "—", 520, 4, 10, "c"],
  ["pH7", "Buffer pH 7.00 ± 0.02", "CRM", "500 mL", 8, 12, 58, "", 6, 4, "—", 520, 4, 12, "c"],
  ["pH10", "Buffer pH 10.01 ± 0.02", "CRM", "500 mL", 16, 12, 9, "", 6, 5, "—", 540, 4, 9, "c"],
  ["Pb", "Lead standard 1000 ppm", "CRM", "100 mL", 7, 4, 260, "05 06 08", 6, 6, "—", 2850, 4, 2],
  ["Fe", "Iron standard 1000 ppm", "CRM", "100 mL", 9, 4, 300, "05", 6, 7, "—", 2650, 4, 2],
  ["KHP", "Potassium hydrogen phthalate", "CRM", "100 g", 11, 6, 880, "", 6, 8, "877-24-7", 1980, 4, 3],
  ["TOC", "TOC standard 500 ppm", "CRM", "100 mL", 0, 3, 0, "", 6, 9, "—", 3420, 4, 2, "m"],
  ["Cond", "Conductivity standard 1413 µS", "CRM", "500 mL", 13, 6, 140, "", 6, 10, "—", 1180, 4, 4, "c"],
];

function familyOf(row: number, col: number): Family {
  if (row === 6) return "Standards";
  if (col <= 2) return "Acids";
  if (row <= 2) return "Solvents";
  if (col >= 9) return "Reagents";
  return "Salts & bases";
}

const seedSkus: Sku[] = raw.map((r, i) => {
  const flags = r[14] ?? "";
  return {
    idx: i + 1,
    sym: r[0],
    name: r[1],
    grade: r[2],
    pack: r[3],
    stock: r[4],
    min: r[5],
    exp: r[6],
    ghs: r[7] ? (r[7].split(" ").map((g) => `GHS${g}`) as Ghs[]) : [],
    row: r[8],
    col: r[9],
    cas: r[10],
    price: r[11],
    principal: PRINCIPALS[r[12]],
    monthly: r[13],
    family: familyOf(r[8], r[9]),
    cold: flags.includes("c"),
    msds: !flags.includes("m"),
    peso: flags.includes("A") ? "A" : flags.includes("B") ? "B" : undefined,
    onOrder: 0,
  };
});

const ghsInfo: Record<Ghs, { label: string; icon: LucideIcon }> = {
  GHS02: { label: "Flammable", icon: Flame },
  GHS03: { label: "Oxidiser", icon: CircleDot },
  GHS05: { label: "Corrosive", icon: Droplets },
  GHS06: { label: "Acute toxicity", icon: Skull },
  GHS07: { label: "Irritant", icon: AlertTriangle },
  GHS08: { label: "Health hazard", icon: HeartPulse },
  GHS09: { label: "Aquatic hazard", icon: Fish },
};

function hazardOf(s: Sku): Hazard {
  if (s.ghs.includes("GHS02")) return "Flammable";
  if (s.ghs.includes("GHS03")) return "Oxidiser";
  if (s.ghs.includes("GHS06")) return "Toxic";
  if (s.ghs.includes("GHS05")) return "Corrosive";
  if (s.ghs.length) return "Irritant";
  return "Non-haz";
}

const hazardColour: Record<Hazard, string> = {
  Flammable: "#d4502f",
  Oxidiser: "#d39a1b",
  Toxic: "#8b3d8f",
  Corrosive: "#4d63c4",
  Irritant: "#2f8fa6",
  "Non-haz": "#7d918b",
};

type Status = "Out" | "Expiring" | "Low" | "Healthy";
function statusOf(s: Sku): Status {
  if (s.stock <= 0) return "Out";
  if (s.exp <= 45) return "Expiring";
  if (s.stock < s.min) return "Low";
  return "Healthy";
}

function tileColour(s: Sku, mode: ColourMode) {
  if (mode === "Hazard") return hazardColour[hazardOf(s)];
  if (mode === "Expiry") {
    if (s.stock <= 0) return "var(--d-mute)";
    return s.exp <= 30 ? "var(--d-late)" : s.exp <= 90 ? "var(--d-warn)" : s.exp <= 365 ? "var(--d-info)" : "var(--d-ok)";
  }
  if (s.stock <= 0) return "var(--d-late)";
  return s.stock < s.min ? "var(--d-warn)" : "var(--d-ok)";
}

function dayLabel(d: number, year = false) {
  const date = new Date(Date.UTC(2026, 9, 20 + Math.round(d)));
  const m = date.toLocaleString("en-IN", { month: "short", timeZone: "UTC" });
  return `${date.getUTCDate()} ${m}${year ? ` ${String(date.getUTCFullYear()).slice(2)}` : ""}`;
}

type Lot = { no: string; sku: number; sym: string; name: string; grade: Grade; exp: number; qty: number; rack: string; mfg: string; value: number };

function lotsFor(s: Sku): Lot[] {
  if (s.stock <= 0) return [];
  const n = s.stock > 30 ? 3 : s.stock > 8 ? 2 : 1;
  const shares = n === 3 ? [0.2, 0.35, 0.45] : n === 2 ? [0.35, 0.65] : [1];
  const code = s.sym.replace(/[^A-Za-z0-9]/g, "").slice(0, 4).toUpperCase();
  const qtys = shares.map((sh) => Math.max(1, Math.round(s.stock * sh)));
  qtys[n - 1] = Math.max(1, s.stock - qtys.slice(0, n - 1).reduce((a, q) => a + q, 0));
  return qtys.map((qty, i) => {
    const exp = s.exp + (i === 0 ? 0 : i * 170 + 40);
    return {
      no: `${code}-${2400 + s.idx * 13 + i * 7}`,
      sku: s.idx,
      sym: s.sym,
      name: s.name,
      grade: s.grade,
      exp,
      qty,
      rack: s.cold ? `CR-${(s.idx % 3) + 1}${"ABC"[i]}` : `${s.peso ? "SS" : "R"}${(s.idx % 6) + 1}-${"ABCD"[i]}${(s.idx % 4) + 1}`,
      mfg: dayLabel(exp - (s.family === "Standards" ? 540 : 1080), true),
      value: qty * s.price,
    };
  });
}

function coaFor(s: Sku): { test: string; spec: string; result: string; pass: boolean }[] {
  if (s.family === "Solvents")
    return [
      { test: "Assay (GC)", spec: "≥ 99.9%", result: "99.97%", pass: true },
      { test: "Water (KF)", spec: "≤ 0.02%", result: "0.006%", pass: true },
      { test: "UV cut-off", spec: s.idx === 13 ? "≤ 195 nm" : "≤ 205 nm", result: s.idx === 13 ? "197 nm" : "191 nm", pass: s.idx !== 13 },
      { test: "Residue on evaporation", spec: "≤ 2 ppm", result: "0.8 ppm", pass: true },
      { test: "Gradient suitability", spec: "Passes", result: "Passes", pass: true },
    ];
  if (s.family === "Acids")
    return [
      { test: "Assay", spec: "Per label ±0.5%", result: "Within", pass: true },
      { test: "Iron (Fe)", spec: "≤ 0.5 ppm", result: "0.12 ppm", pass: true },
      { test: "Heavy metals (as Pb)", spec: "≤ 1 ppm", result: "< 0.5 ppm", pass: true },
      { test: "Residue on ignition", spec: "≤ 5 ppm", result: "2 ppm", pass: true },
    ];
  if (s.family === "Standards")
    return [
      { test: "Certified value", spec: s.name.split(" ").slice(-3).join(" "), result: "Certified", pass: true },
      { test: "Expanded uncertainty (k=2)", spec: "Stated", result: "± 0.01", pass: true },
      { test: "Traceability", spec: "NIST SRM", result: "Traceable", pass: true },
      { test: "Producer accreditation", spec: "ISO 17034", result: "Valid to Mar 27", pass: true },
    ];
  return [
    { test: "Assay", spec: "≥ 99.0%", result: "99.6%", pass: true },
    { test: "Loss on drying", spec: "≤ 0.5%", result: "0.21%", pass: true },
    { test: "Chloride (Cl)", spec: "≤ 0.005%", result: "0.002%", pass: true },
    { test: "Heavy metals (as Pb)", spec: "≤ 5 ppm", result: "< 2 ppm", pass: true },
  ];
}

/* ---------- Purchase orders ---------- */

type POStatus = "Awaiting approval" | "Confirmed" | "In transit" | "Received" | "On hold";
type PO = { no: string; principal: string; sku: number; qty: number; amount: number; status: POStatus; eta: string; raised: string; needsApproval?: boolean; note: string };

function poFor(no: string, sku: number, qty: number, status: POStatus, eta: string, raised: string, note: string, needsApproval = false): PO {
  const s = seedSkus[sku - 1];
  return { no, principal: s.principal, sku, qty, amount: Math.round(qty * s.price * 0.72), status, eta, raised, note, needsApproval };
}

const seedPOs: PO[] = [
  poFor("PO-3318", 9, 120, "Awaiting approval", "26 Oct", "Today", "ACN below min; 4 HPLC labs ordering weekly", true),
  poFor("PO-3317", 25, 20, "Awaiting approval", "29 Oct", "Today", "Sarigam Bulk Drugs mobile-phase demand", true),
  poFor("PO-3316", 34, 10, "Awaiting approval", "27 Oct", "Yesterday", "Hardness titration labs, 3 left", true),
  poFor("PO-3319", 38, 24, "Awaiting approval", "24 Oct", "Today", "Valsad Analytical quarterly calibration", true),
  poFor("PO-3314", 7, 24, "In transit", "21 Oct", "14 Oct", "Out of stock since Friday"),
  poFor("PO-3310", 19, 24, "In transit", "23 Oct", "15 Oct", "LR via Vapi–Tarapur milk run"),
  poFor("PO-3311", 10, 40, "In transit", "22 Oct", "16 Oct", "Part of monthly MeOH, CoA received"),
  poFor("PO-3312", 3, 24, "Confirmed", "24 Oct", "17 Oct", "Nitric for Ankleshwar dye labs"),
  poFor("PO-3315", 43, 6, "Confirmed", "28 Oct", "17 Oct", "TOC std backorder at Spectra"),
  poFor("PO-3309", 5, 36, "Received", "16 Oct", "9 Oct", "GRN 2291, matched in Tally"),
  poFor("PO-3308", 29, 24, "Received", "16 Oct", "8 Oct", "Cold chain, logger OK"),
  poFor("PO-3307", 1, 48, "Received", "15 Oct", "8 Oct", "GRN 2286"),
  poFor("PO-3306", 15, 60, "Received", "14 Oct", "6 Oct", "GRN 2283"),
];

function withOnOrder(skus: Sku[], pos: PO[]) {
  return skus.map((s) => ({ ...s, onOrder: pos.filter((p) => p.sku === s.idx && p.status !== "Received" && p.status !== "On hold").reduce((a, p) => a + p.qty, 0) }));
}

/* ---------- Customer orders ---------- */

type OStage = "new" | "pick" | "docs" | "out" | "done";
type Order = { no: string; lab: string; town: string; lines: { sku: number; qty: number }[]; need: string; stage: OStage; hazmat: boolean; note?: string };

const seedOrders: Order[] = [
  { no: "SO-5821", lab: "Damanganga Pharma QC", town: "Daman", lines: [{ sku: 9, qty: 12 }, { sku: 10, qty: 10 }, { sku: 5, qty: 6 }], need: "Today 4 PM", stage: "pick", hazmat: true },
  { no: "SO-5822", lab: "Vapi Organics Ltd", town: "Vapi", lines: [{ sku: 1, qty: 8 }, { sku: 17, qty: 6 }], need: "Tomorrow", stage: "new", hazmat: true },
  { no: "SO-5823", lab: "Shree Pharmachem", town: "Ankleshwar", lines: [{ sku: 29, qty: 6 }, { sku: 10, qty: 8 }], need: "Tomorrow", stage: "docs", hazmat: true, note: "Wants principal CoA + our CoC" },
  { no: "SO-5824", lab: "Coastal Generics", town: "Daman", lines: [{ sku: 8, qty: 4 }, { sku: 9, qty: 6 }], need: "22 Oct", stage: "new", hazmat: true },
  { no: "SO-5825", lab: "Valsad Analytical Services", town: "Valsad", lines: [{ sku: 37, qty: 4 }, { sku: 38, qty: 4 }, { sku: 39, qty: 4 }, { sku: 42, qty: 2 }], need: "Today 6 PM", stage: "pick", hazmat: false, note: "NABL lab, cold box" },
  { no: "SO-5826", lab: "Kalpataru Polymers", town: "Sarigam", lines: [{ sku: 11, qty: 4 }, { sku: 14, qty: 6 }], need: "22 Oct", stage: "docs", hazmat: true },
  { no: "SO-5827", lab: "Ankleshwar Dyestuff Labs", town: "Ankleshwar", lines: [{ sku: 2, qty: 10 }, { sku: 3, qty: 4 }], need: "Today", stage: "out", hazmat: true },
  { no: "SO-5828", lab: "Panoli Intermediates", town: "Panoli", lines: [{ sku: 12, qty: 12 }, { sku: 13, qty: 6 }], need: "Today", stage: "out", hazmat: true },
  { no: "SO-5829", lab: "Umbergaon Paints QC", town: "Umbergaon", lines: [{ sku: 15, qty: 8 }, { sku: 16, qty: 2 }], need: "19 Oct", stage: "done", hazmat: true },
  { no: "SO-5830", lab: "Silvassa Agro Chem", town: "Silvassa", lines: [{ sku: 27, qty: 4 }, { sku: 2, qty: 4 }], need: "23 Oct", stage: "new", hazmat: true, note: "KMnO₄ is NDPS-controlled: end-use declaration pending" },
  { no: "SO-5831", lab: "Bharuch Fluoro Chem", town: "Dahej", lines: [{ sku: 28, qty: 2 }, { sku: 40, qty: 1 }, { sku: 41, qty: 1 }], need: "18 Oct", stage: "done", hazmat: true },
  { no: "SO-5832", lab: "Sarigam Bulk Drugs", town: "Sarigam", lines: [{ sku: 25, qty: 6 }, { sku: 21, qty: 4 }, { sku: 9, qty: 8 }], need: "21 Oct", stage: "pick", hazmat: true },
];

const orderValue = (o: Order, skus: Sku[]) => o.lines.reduce((a, l) => a + l.qty * (skus[l.sku - 1]?.price ?? 0), 0);

/* ---------- Dues ---------- */

type Invoice = { no: string; lab: string; amount: number; raised: string; days: number; terms: number; promise?: string };
const invoices: Invoice[] = [
  { no: "NLS/26-27/1102", lab: "Damanganga Pharma QC", amount: 284600, raised: "18 Aug", days: 63, terms: 45, promise: "RTGS on Thursday" },
  { no: "NLS/26-27/1121", lab: "Vapi Organics Ltd", amount: 112400, raised: "2 Sep", days: 48, terms: 30 },
  { no: "NLS/26-27/1088", lab: "Kalpataru Polymers", amount: 96800, raised: "4 Aug", days: 77, terms: 60 },
  { no: "NLS/26-27/1064", lab: "Silvassa Agro Chem", amount: 58200, raised: "12 Jul", days: 100, terms: 45 },
  { no: "NLS/26-27/1135", lab: "Shree Pharmachem", amount: 186300, raised: "16 Sep", days: 34, terms: 45 },
  { no: "NLS/26-27/1140", lab: "Coastal Generics", amount: 74900, raised: "22 Sep", days: 28, terms: 30 },
  { no: "NLS/26-27/1097", lab: "Panoli Intermediates", amount: 142700, raised: "12 Aug", days: 69, terms: 60, promise: "Cheque on 25 Oct" },
  { no: "NLS/26-27/1151", lab: "Valsad Analytical Services", amount: 38400, raised: "1 Oct", days: 19, terms: 30 },
  { no: "NLS/26-27/1157", lab: "Bharuch Fluoro Chem", amount: 206500, raised: "6 Oct", days: 14, terms: 45 },
  { no: "NLS/26-27/1079", lab: "Umbergaon Paints QC", amount: 44600, raised: "28 Jul", days: 84, terms: 30 },
  { no: "NLS/26-27/1162", lab: "Sarigam Bulk Drugs", amount: 129800, raised: "10 Oct", days: 10, terms: 30 },
  { no: "NLS/26-27/1144", lab: "Ankleshwar Dyestuff Labs", amount: 91300, raised: "25 Sep", days: 25, terms: 30 },
];

/* ---------- Shared modules ---------- */

const team: TeamMember[] = [
  { name: "Ketan Shah", role: "Owner", status: "Busy", load: 92, focus: "4 principal POs and the Class A headroom question on ACN", since: "2004", tasks: [{ title: "Approve 4 principal POs", due: "10:00" }, { title: "Call Kesar on split ACN delivery", due: "11:00" }, { title: "Damanganga rate contract renewal", due: "4:00" }], week: [1, 1, 1, 1, 1, 1] },
  { name: "Dr. Rupal Mehta", role: "Technical & QA", status: "On floor", load: 78, focus: "n-Hexane lot HEX-2569 UV cut-off failed CoA check", since: "2016", tasks: [{ title: "Quarantine HEX-2569", due: "now" }, { title: "CoC for Shree Pharmachem", due: "12:00", done: true }, { title: "MSDS gap: TOC, MO, I₂", due: "Thu" }], week: [1, 1, 1, 1, 1, 0] },
  { name: "Sanjay Patel", role: "Godown in-charge, PESO competent person", status: "On floor", load: 84, focus: "Solvent store at 68% of Class A licence", since: "2009", tasks: [{ title: "Cold-room log sign-off", due: "9:30", done: true }, { title: "Stock register for PESO", due: "5:30" }, { title: "Shift AcOH lot to FEFO front", due: "2:00" }], week: [1, 1, 1, 1, 1, 1] },
  { name: "Firoz Mansuri", role: "Dispatch & hazmat transport", status: "In field", load: 70, focus: "Tempo to Ankleshwar and Panoli with TREM cards", since: "2014", tasks: [{ title: "Deliver SO-5827, SO-5828", due: "3:00" }, { title: "Damanganga run", due: "4:00" }], week: [1, 1, 1, 0, 1, 1] },
  { name: "Nidhi Joshi", role: "Sales coordinator, Ankleshwar & Dahej", status: "Busy", load: 76, focus: "KF reagent shortfall for Shree Pharmachem", since: "2019", tasks: [{ title: "Confirm SO-5823 docs", due: "11:30" }, { title: "Quote Bharuch Fluoro for CRMs", due: "3:30" }], week: [1, 1, 1, 1, 1, 1] },
  { name: "Bhavesh Rana", role: "Field sales, Daman & Silvassa", status: "In field", load: 64, focus: "Silvassa Agro's NDPS end-use declaration", since: "2021", tasks: [{ title: "Collect declaration from Silvassa Agro", due: "1:00" }, { title: "Coastal Generics TFA trial", due: "4:30" }], week: [1, 1, 0, 1, 1, 1] },
  { name: "Komal Parmar", role: "Accounts & Tally", status: "On floor", load: 58, focus: "Dues reminders and e-way bills", since: "2018", tasks: [{ title: "E-way bills for 3 dispatches", due: "2:30" }, { title: "Reconcile Panoli cheque", due: "tomorrow" }], week: [1, 1, 1, 1, 1, 1] },
  { name: "Arjun Halpati", role: "Packing & repack helper", status: "On floor", load: 66, focus: "Picking SO-5821 with FEFO lot slips", since: "2023", tasks: [{ title: "Pick SO-5821", due: "now" }, { title: "Label cold box for Valsad", due: "5:00" }], week: [1, 1, 1, 1, 1, 0] },
];

const agents: WorkforceAgent[] = [
  { name: "Expiry Watch", role: "Picks first-expiry lots and finds buyers before they lapse", icon: CalendarClock, status: "Needs you", runsToday: 6, hoursSaved: 4.5, accuracy: 95, last: "12 min ago", skills: ["FEFO", "Lot ledger", "WhatsApp offers"], schedule: "Daily 8 AM and on every GRN", inbox: [{ title: "Offer pH 10 buffer at 20% off?", detail: "16 bottles expire in 9 days. Valsad Analytical and 2 college labs use it weekly." }, { title: "Return Starch lot to Nilkanth?", detail: "14 packs, 12 days left. Nilkanth accepts returns 15+ days before expiry." }], log: ["Moved AcOH lot ACOH-2452 to the pick face", "Flagged 7 lots expiring within 45 days", "Sent Valsad Analytical a buffer offer draft"] },
  { name: "Reorder Planner", role: "Min–max from 90-day sales; drafts principal POs", icon: PackagePlus, status: "Needs you", runsToday: 4, hoursSaved: 5, accuracy: 91, last: "25 min ago", skills: ["Sales velocity", "Lead times", "Tally PO"], schedule: "Daily 9 AM", inbox: [{ title: "4 POs waiting, ₹3.1 L", detail: "ACN is the big one. Splitting it keeps Class A storage under the PESO limit." }], log: ["Raised ACN min from 60 to 80 after 4 new HPLC labs", "Drafted PO-3319 for pH 7 buffer", "Skipped DMSO: 3 months of cover"] },
  { name: "CoA Clerk", role: "Matches principal CoAs to lots and attaches them to dispatches", icon: FileText, status: "Running", runsToday: 18, hoursSaved: 3.5, accuracy: 97, last: "just now", skills: ["PDF reading", "Spec check", "Gmail"], schedule: "On every principal email", log: ["HEX-2569 UV cut-off 197 nm vs spec 195: flagged", "Attached 3 CoAs to SO-5823", "Filed 22 CoAs from Kesar's Monday mail"] },
  { name: "Compliance Keeper", role: "PESO register, NDPS returns, MSDS coverage", icon: ShieldCheck, status: "Running", runsToday: 3, hoursSaved: 2.5, accuracy: 93, last: "1 h ago", skills: ["PESO", "NCB Form D", "MSDS"], schedule: "Daily 6 PM and on every GRN", log: ["Class A at 68% of licence, 102% if ACN lands in one lot", "NDPS quarterly return draft ready, due 31 Oct", "3 SKUs without current MSDS"] },
  { name: "Cold Room Sentinel", role: "Reads the 2–8 °C logger and door sensor every minute", icon: Thermometer, status: "Running", runsToday: 1440, hoursSaved: 2, accuracy: 99, last: "just now", skills: ["IoT logger", "Alarms", "Excursion log"], schedule: "Every minute", log: ["Door open 3 min 40 s at 10:12, peak 7.1 °C", "Within range for 23 h 52 m", "Logger battery 64%"] },
  { name: "Dues Collector", role: "Polite, persistent payment follow-ups", icon: IndianRupee, status: "Idle", runsToday: 2, hoursSaved: 3, accuracy: 90, last: "2 h ago", skills: ["Ageing", "WhatsApp", "Tally"], schedule: "Daily 5 PM", log: ["Logged Damanganga promise: RTGS Thursday", "Suggested credit hold on Silvassa Agro (100 days)", "Queued 5 reminders for 5 PM"] },
];

const independence: IndependenceData = {
  score: 38,
  history: [24, 26, 29, 30, 33, 35, 36],
  quote: "If I'm not at the godown, nobody will sign for a perchloric acid drum. Last year a new boy stacked it next to the solvents.",
  pillars: [
    { name: "Sales & customers", score: 44, note: "Big QC labs still call Ketan for rates; Nidhi and Bhavesh relay.", fixes: [{ title: "Rate card per customer in the desk", gain: 3 }, { title: "Auto-quote from the SKU wall", gain: 2 }] },
    { name: "Godown & FEFO", score: 41, note: "FEFO works because Sanjay remembers. Lot slips are handwritten.", fixes: [{ title: "Scan lots at pick", gain: 4 }, { title: "Pick slips print FEFO lot", gain: 2 }] },
    { name: "Purchase & principals", score: 27, note: "Every principal PO waits for the owner; average 1.4 days.", fixes: [{ title: "Auto-approve POs under ₹50k", gain: 4 }, { title: "Planner-set min–max", gain: 2 }] },
    { name: "Compliance", score: 35, note: "PESO and NDPS returns live in Ketan's head and a green register.", fixes: [{ title: "Compliance Keeper owns the calendar", gain: 3 }, { title: "Sanjay signs the daily register", gain: 2 }] },
    { name: "Money & dues", score: 39, note: "₹14.7 L outstanding; follow-ups happen when Ketan asks Komal.", fixes: [{ title: "Daily dues agent", gain: 3 }] },
    { name: "Quality & CoA", score: 52, note: "Dr. Rupal checks CoAs, but only for pharma customers.", fixes: [{ title: "CoA Clerk checks every lot", gain: 2 }] },
    { name: "Owner time", score: 30, note: "Owner spends 11 hours a week signing POs and answering rate calls.", fixes: [{ title: "Two approval windows a day", gain: 2 }] },
  ],
  ownerHours: [
    { label: "PO approvals", hours: 7 },
    { label: "Rate calls", hours: 9 },
    { label: "Godown rounds", hours: 6 },
    { label: "Compliance", hours: 4 },
    { label: "Dues", hours: 4 },
    { label: "Principals", hours: 3 },
    { label: "Strategy", hours: 1 },
  ],
};

const integrations: Integration[] = [
  { name: "Tally Prime", category: "Accounts", status: "Connected", detail: "Sales, purchase, batch-wise stock and ledgers.", synced: "4 min ago", records: "18,420 vouchers", mark: "T", color: "#1c4f9c" },
  { name: "WhatsApp Business", category: "Messaging", status: "Connected", detail: "Lab orders, CoA sharing and dues reminders.", synced: "just now", records: "3,140 chats", mark: "W", color: "#1f9d55" },
  { name: "Cold-room logger", category: "Godown", status: "Syncing", detail: "2–8 °C probe and door sensor, minute readings.", synced: "live", records: "1,440 readings today", mark: "CR", color: "#0f6b5c" },
  { name: "Godown barcode scanners", category: "Godown", status: "Connected", detail: "Lot scans at GRN and pick.", synced: "2 min ago", records: "612 scans today", mark: "BC", color: "#475569" },
  { name: "Gmail", category: "Documents", status: "Connected", detail: "Principal CoAs and MSDS PDFs read into lots.", synced: "9 min ago", records: "2,210 PDFs", mark: "G", color: "#ea4335" },
  { name: "GST e-way bill", category: "Compliance", status: "Connected", detail: "E-way bills for every dispatch over ₹50k.", synced: "38 min ago", records: "96 this month", mark: "EW", color: "#b45309" },
  { name: "PESO online", category: "Compliance", status: "Error", detail: "DSC expired; licence renewal upload paused.", synced: "6 days ago", records: "—", mark: "P", color: "#c0392b" },
  { name: "Google Sheets", category: "Planning", status: "Connected", detail: "Old min–max sheet, read-only while you move over.", synced: "1 h ago", records: "3 sheets", mark: "GS", color: "#0f9d58" },
  { name: "IndiaMART", category: "Leads", status: "Available", detail: "Pull chemical enquiries straight into quotes.", synced: "—", records: "—", mark: "IM", color: "#2e3192" },
  { name: "Razorpay", category: "Accounts", status: "Available", detail: "Payment links for college and walk-in labs.", synced: "—", records: "—", mark: "R", color: "#2563eb" },
];

/* ============================================================
   Config
   ============================================================ */

const config: DeskConfig = {
  slug: "lab-supply",
  company: "Narmada Lab Supply",
  brand: "Narmada",
  city: "Vapi",
  state: "GJ",
  icon: FlaskConical,
  tagline: "Lab chemicals, reagents and solvents · 44 SKUs from 5 principals · 63 QC labs from Vapi to Dahej",
  owner: { name: "Ketan Shah", first: "Ketan", initials: "KS", role: "Owner" },
  theme: {
    variant: "atelier",
    paper: "#eff4f2",
    panel: "#ffffff",
    sunk: "#e3ece8",
    ink: "#0e2622",
    mute: "#5b706a",
    line: "#d3e0db",
    accent: "#0f6b5c",
    accentInk: "#ffffff",
    soft: "#dbeee8",
    ok: "#2e8a4f",
    warn: "#c27d12",
    late: "#c23b2c",
    info: "#3567a3",
    heading: "mono",
    radius: 12,
  },
  brief: "ACN is below minimum and the PO to fix it would breach the PESO Class A limit if it lands in one go. Seven lots expire inside 45 days; the n-Hexane lot failed its CoA check.",
  agenda: [
    { at: 9, title: "Cold-room & godown round", detail: "Logger OK; one door excursion at 10:12", tone: "ok", module: "compliance" },
    { at: 10, title: "Principal PO window", detail: "4 POs, ₹3.1 L, ACN needs a split delivery", count: 4, tone: "info", module: "purchase" },
    { at: 11.5, title: "Damanganga dispatch", detail: "SO-5821 hazmat run to Daman, TREM cards ready", count: 3, tone: "warn", module: "orders" },
    { at: 13, title: "Expiry review with Rupal", detail: "7 lots inside 45 days, 1 failed CoA", count: 7, tone: "late", module: "batches" },
    { at: 15, title: "Collections call", detail: "12 invoices, Silvassa Agro at 100 days", count: 12, tone: "accent", module: "dues" },
    { at: 17.5, title: "PESO register close", detail: "Day's Class A and B movements signed by Sanjay", tone: "neutral", module: "compliance" },
  ],
  activity: [
    { time: "11:42 AM", text: "CoA Clerk: HEX-2569 UV cut-off 197 nm, spec ≤ 195. Lot flagged.", tone: "late" },
    { time: "11:10 AM", text: "Kesar Solvents dispatched 100 × MeOH 2.5 L, LR 88213", tone: "ok" },
    { time: "10:16 AM", text: "Cold room peaked at 7.1 °C after a 3 min 40 s door opening", tone: "warn" },
    { time: "9:55 AM", text: "Damanganga Pharma promised RTGS of ₹2.85 L on Thursday", tone: "info" },
    { time: "9:30 AM", text: "Sanjay signed the cold-room log and the solvent store check", tone: "ok" },
    { time: "9:02 AM", text: "Reorder Planner raised the ACN minimum from 60 to 80 packs", tone: "neutral" },
  ],
  asks: [
    { q: "What will run out this week?", a: "Three SKUs, at current pick rates:\n\n• Acetonitrile HPLC 2.5 L: 64 packs, selling 22 a week. 96 a month across 4 new HPLC labs. PO-3318 (120 packs) is waiting on you.\n• Ammonium acetate HPLC: 4 left, 6 going to Sarigam Bulk Drugs tomorrow. PO-3317 waiting.\n• Formic acid HPLC: already out. PO-3314 lands tomorrow.\n\nApproving PO-3318 as two deliveries of 60 keeps the solvent store under its PESO limit.", sources: ["SKU wall", "90-day sales from Tally", "Open POs"] },
    { q: "Can we take the full ACN delivery?", a: "Not in one go. Class A held today is 819 L against a 1,200 L licence, and 100 L of MeOH lands Thursday (PO-3311). 120 × 2.5 L of ACN adds 300 L, which takes you to 1,219 L, just over the licence.\n\nSplit it: 60 packs on 26 Oct (1,069 L, 89%) and 60 on 2 Nov. By then about 90 L of MeOH and ACN will have gone out to labs, so the second lot fits.", sources: ["PESO licence P/HQ/GJ/15/4471", "Solvent store register"] },
    { q: "Which lots expire soon and who can use them?", a: "7 lots within 45 days, ₹2.2 L at list price:\n• pH 10.01 buffer, 9 days (16 btl): Valsad Analytical uses 4 a week\n• Starch soluble, 12 days: return to Nilkanth, still inside their 15-day window\n• Tris base, 18 days: Coastal Generics' biology lab\n• TFA, 22 days: offer at 15% off to Damanganga's peptide line\n• KF reagent, 26 days: Shree Pharmachem takes 6 tomorrow\n• Glacial acetic, 30 days, and n-Hexane, 41 days.", sources: ["Batches & expiry", "Customer order history"] },
    { q: "Is the n-Hexane lot safe to sell?", a: "Not to HPLC customers. Kesar's CoA for HEX-2569 shows UV cut-off 197 nm against our spec of 195 nm. Everything else passes.\n\nRupal suggests quarantining it for HPLC and offering it as AR grade for extraction work (Panoli Intermediates buys 6 a month), or returning it to Kesar under the quality clause.", sources: ["CoA Clerk", "Kesar CoA PDF, 14 Oct"] },
    { q: "How much money is stuck with labs?", a: "₹14.7 L across 12 invoices, ₹7.4 L of it past terms on 6 invoices. The worst: Silvassa Agro (₹58k, 100 days on 45-day terms), Umbergaon Paints (₹44.6k, 84 days on 30), Kalpataru Polymers (₹96.8k, 77 days on 60) and Damanganga (₹2.85 L, 63 days, RTGS promised Thursday).\n\nSilvassa Agro also has a new KMnO₄ order waiting. I'd hold it until they pay.", sources: ["Tally ledgers", "Dues Collector"] },
    { q: "Draft the NDPS quarterly return", a: "Draft ready for Form D, Jul–Sep 2026:\n\n• Potassium permanganate: opening 18 kg, received 12.5 kg, sold 23 kg to 6 registered buyers, closing 7.5 kg\n• Hydrochloric acid and sulphuric acid: per register, all buyers with end-use declarations on file\n\nOne buyer (Silvassa Agro) has an expired declaration. Due to the NCB zonal unit by 31 Oct.", sources: ["Controlled substances register", "Sales from Tally"] },
  ],
  run: {
    label: "Runs every morning at 8 and after every GRN. You can run it now.",
    title: "Stock & compliance sweep",
    steps: [
      { text: "Read 44 SKUs, 92 lots and 13 open POs", result: "4 below minimum, 2 out of stock" },
      { text: "Re-rank lots first-expiry-first", result: "7 lots inside 45 days, ₹2.2 L" },
      { text: "Check principal CoAs against our specs", result: "HEX-2569 fails UV cut-off" },
      { text: "Project PESO storage after inbound POs", result: "Class A would reach 102% with PO-3318 in one lot" },
      { text: "Draft POs, offers and customer messages", result: "2 POs, 3 expiry offers, 1 quarantine" },
    ],
    outcome: "Approve PO-3318 as two deliveries to stay inside the Class A licence, quarantine HEX-2569 for HPLC use, and offer the pH 10 buffer to Valsad Analytical before it expires on 29 Oct.",
    actions: ["Split PO-3318 into 2 deliveries", "Quarantine HEX-2569", "Send buffer offer to Valsad", "Raise POs for THF and KF reagent"],
  },
};

/* ============================================================
   Desk
   ============================================================ */

export default function LabSupplyDesk() {
  const [pos, setPOs] = React.useState(seedPOs);
  const [skus, setSkus] = React.useState(() => withOnOrder(seedSkus, seedPOs));
  const [orders, setOrders] = React.useState(seedOrders);
  const [lotFlags, setLotFlags] = React.useState<Record<string, string>>({ "HEX-2569": "Quarantined" });

  const nextNo = React.useRef(3320);
  const raisePO = React.useCallback((sku: Sku, qty: number) => {
    const no = `PO-${nextNo.current++}`;
    const po: PO = { no, principal: sku.principal, sku: sku.idx, qty, amount: Math.round(qty * sku.price * 0.72), status: "Awaiting approval", eta: "in 5–7 days", raised: "Today", note: "Raised from the SKU wall", needsApproval: true };
    setPOs((cur) => [po, ...cur]);
    setSkus((cur) => cur.map((s) => (s.idx === sku.idx ? { ...s, onOrder: s.onOrder + qty } : s)));
    return po;
  }, []);

  const setPOStatus = (no: string, status: POStatus) => {
    const po = pos.find((p) => p.no === no);
    if (!po || po.status === status) return;
    const open = (st: POStatus) => st !== "Received" && st !== "On hold";
    const delta = (open(status) ? po.qty : 0) - (open(po.status) ? po.qty : 0);
    const received = status === "Received" ? po.qty : 0;
    setSkus((cur) => cur.map((x) => (x.idx === po.sku ? { ...x, stock: x.stock + received, onOrder: Math.max(0, x.onOrder + delta), exp: received && x.stock <= 0 ? 720 : x.exp } : x)));
    setPOs((cur) => cur.map((p) => (p.no === no ? { ...p, status } : p)));
  };

  const lots = React.useMemo(() => skus.flatMap(lotsFor).sort((a, b) => a.exp - b.exp), [skus]);
  const short = skus.filter((s) => (s.stock <= 0 || s.stock < s.min) && s.onOrder === 0).length;
  const awaiting = pos.filter((p) => p.status === "Awaiting approval").length;

  const modules: DeskModule[] = [
    {
      id: "wall",
      label: "SKU wall",
      count: short,
      title: "Periodic SKU wall",
      blurb: "Every SKU as a tile: symbol, grade, pack, stock and nearest expiry. Filter by hazard or grade; tap one for batches, CoA and reorder.",
      icon: TestTubes,
      notes: ["The wall is laid out like a periodic table: acids on the left, solvents top right, salts and reagents in the middle, standards in the detached row.", "Switch colour between stock, expiry and hazard. A ringed tile is being picked on the godown floor right now.", "Tap any tile for its FEFO lots, CoA results and GHS pictograms, and to raise a PO to the principal."],
      render: () => <WallHome skus={skus} lots={lots} onRaise={raisePO} />,
    },
    { id: "batches", label: "Batches & expiry", count: lots.filter((l) => l.exp <= 45).length, title: "Batches & expiry", blurb: "Every lot first-expiry-first, with what to sell, return or quarantine before it lapses", icon: CalendarClock, render: () => <BatchesTab lots={lots} flags={lotFlags} setFlags={setLotFlags} /> },
    { id: "orders", label: "Customer orders", count: orders.filter((o) => o.stage !== "done").length, title: "Customer orders", blurb: "QC lab orders from Vapi, Ankleshwar, Daman and Sarigam, from pick to delivery", icon: Truck, render: () => <OrdersTab orders={orders} setOrders={setOrders} skus={skus} /> },
    { id: "compliance", label: "Compliance", count: 3, title: "Compliance", blurb: "PESO storage limits, licences, MSDS coverage, NDPS returns and the cold room", icon: ShieldCheck, render: () => <ComplianceTab skus={skus} pos={pos} /> },
    { id: "purchase", label: "Purchase", count: awaiting, title: "Principal purchase", blurb: "POs to principals, what is in transit and what is waiting on Ketan", icon: Boxes, render: () => <PurchaseTab pos={pos} skus={skus} setStatus={setPOStatus} onRaise={raisePO} /> },
    { id: "dues", label: "Dues", count: invoices.filter((i) => i.days > i.terms).length, title: "Dues", blurb: "Which labs owe what, for how long, and whose dispatches are on hold", icon: Receipt, render: () => <DuesTab /> },
    { id: "team", label: "People", title: "People", blurb: "Godown, QA, dispatch and sales: who is carrying what today", icon: Users, render: () => <PeopleModule members={team} /> },
    { id: "agents", label: "Agents", title: "Agents", blurb: "Six AI agents watching expiry, stock, CoAs, compliance and the cold room", icon: Timer, render: () => <AgentsModule agents={agents} /> },
    { id: "independence", label: "Independence", title: "Owner independence", blurb: "How much of Narmada runs without Ketan at the godown", icon: GaugeIcon, render: () => <IndependenceModule data={independence} /> },
    { id: "connections", label: "Connections", title: "Connections", blurb: "Tally, WhatsApp, the cold-room logger, scanners and the compliance portals", icon: Send, render: () => <ConnectionsModule items={integrations} /> },
  ];

  return <DeskShell config={config} modules={modules} />;
}

/* ---------------- Live helpers ---------------- */

function useCounter(start: number, every: number) {
  const [n, setN] = React.useState(start);
  React.useEffect(() => {
    const id = window.setInterval(() => setN((x) => x + 1), every);
    return () => window.clearInterval(id);
  }, [every]);
  return n;
}

const coldSeed = [4.4, 4.5, 4.3, 4.6, 4.8, 4.7, 5.1, 7.1, 6.2, 5.3, 4.9, 4.6, 4.5, 4.4, 4.6, 4.5, 4.7, 4.6, 4.4, 4.5];

function useColdRoom() {
  const t = useDrift(4.6, 0.09, 1600);
  const ref = React.useRef(t);
  const [hist, setHist] = React.useState(coldSeed);
  React.useEffect(() => {
    ref.current = t;
  }, [t]);
  React.useEffect(() => {
    const id = window.setInterval(() => setHist((h) => [...h.slice(1), Math.round(ref.current * 100) / 100]), 3200);
    return () => window.clearInterval(id);
  }, []);
  return { t, hist };
}

const picks = [
  { sku: 9, qty: 6, lab: "Damanganga Pharma QC", order: "SO-5821" },
  { sku: 37, qty: 4, lab: "Valsad Analytical", order: "SO-5825" },
  { sku: 10, qty: 10, lab: "Damanganga Pharma QC", order: "SO-5821" },
  { sku: 25, qty: 4, lab: "Sarigam Bulk Drugs", order: "SO-5832" },
  { sku: 39, qty: 4, lab: "Valsad Analytical", order: "SO-5825" },
  { sku: 5, qty: 6, lab: "Damanganga Pharma QC", order: "SO-5821" },
  { sku: 21, qty: 4, lab: "Sarigam Bulk Drugs", order: "SO-5832" },
];

/* ---------------- Home: periodic wall ---------------- */

function WallHome({ skus, lots, onRaise }: { skus: Sku[]; lots: Lot[]; onRaise: (s: Sku, qty: number) => PO }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<number | null>(null);
  const tick = useTicker(picks.length, 3600);
  const picked = useCounter(214, 3600);
  const pick = picks[tick];
  const inStock = skus.filter((s) => s.stock > 0).length;
  const below = skus.filter((s) => s.stock > 0 && s.stock < s.min).length;
  const expiring = lots.filter((l) => l.exp <= 45);
  const value = skus.reduce((a, s) => a + s.stock * s.price, 0);
  const sku = skus.find((s) => s.idx === open) ?? null;

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Panel live title="Periodic SKU wall" sub={`${skus.length} SKUs in ${PRINCIPALS.length} principal families · tile = symbol, grade, pack, stock`} action={<Pill tone="accent" mono>{picked} packs picked today</Pill>}>
          <PeriodicWall skus={skus} pickSku={pick.sku} pick={pick} picked={picked} onOpen={setOpen} />
        </Panel>
        <div className="grid content-start gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <Stat label="SKUs in stock" value={`${inStock} / ${skus.length}`} delta="-1" deltaGood hint="HCOOH and TOC out" icon={TestTubes} trend={[44, 44, 43, 44, 43, 43, 42, inStock]} />
          <Stat label="Below reorder level" value={below} delta="+2" deltaGood={false} hint={`${skus.filter((s) => s.stock < s.min && s.onOrder > 0).length} already on a PO`} icon={PackagePlus} tone="warn" trend={[3, 4, 3, 5, 6, 6, 7, below]} />
          <Stat label="Lots expiring ≤ 45 days" value={expiring.length} delta="+3" deltaGood={false} hint={inr(expiring.reduce((a, l) => a + l.value, 0), { compact: true })} icon={CalendarClock} tone="late" trend={[3, 3, 4, 4, 5, 6, 6, expiring.length]} />
          <Stat label="Stock value at list" value={inr(value, { compact: true })} delta="+4%" hint="vs last month" icon={IndianRupee} tone="ok" trend={[11.2, 11.6, 11.9, 12.1, 12.4, 12.2, 12.5, value / 1e5]} />
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <ColdRoomPanel />
        <Panel icon={Timer} title="Expiring first" sub="FEFO: these leave the godown before anything newer" action={<Btn size="sm" icon={ArrowRight} onClick={() => desk.goTab("batches")}>All lots</Btn>}>
          <ul className="space-y-2">
            {expiring.slice(0, 6).map((l) => (
              <li key={l.no} className="flex items-center gap-3 rounded-[10px] border border-d-line px-3 py-2">
                <span className="w-12 shrink-0 font-mono text-[14px] font-bold">{l.sym}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-medium">{l.no} · {l.qty} packs</span>
                  <span className="block font-mono text-[11px] text-d-mute">expires {dayLabel(l.exp)}</span>
                </span>
                <span className="rounded-full px-2 py-0.5 font-mono text-[11px] font-medium" style={{ color: l.exp <= 15 ? "var(--d-late)" : "var(--d-warn)", background: `color-mix(in oklab, ${l.exp <= 15 ? "var(--d-late)" : "var(--d-warn)"} 11%, transparent)` }}>
                  <Countdown compact inHours={l.exp * 24 - 11} />
                </span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel icon={PackagePlus} title="Reorder suggestions" sub="Below minimum with nothing on order. Qty covers 6 weeks.">
          <ReorderList skus={skus} onRaise={onRaise} />
        </Panel>
      </div>
      <SkuSheet sku={sku} lots={lots} onClose={() => setOpen(null)} onRaise={onRaise} />
    </div>
  );
}

function ReorderList({ skus, onRaise }: { skus: Sku[]; onRaise: (s: Sku, qty: number) => PO }) {
  const desk = useDesk();
  const list = skus.filter((s) => (s.stock <= 0 || s.stock < s.min) && s.onOrder === 0);
  const qtyFor = (s: Sku) => Math.max(s.min * 2 - s.stock, Math.ceil(s.monthly * 1.5));
  if (!list.length) return <p className="rounded-[10px] border border-dashed border-d-line py-8 text-center text-[13px] text-d-mute">Every short SKU has a PO. Nothing to raise.</p>;
  return (
    <div>
      <ul className="divide-y divide-d-line">
        {list.map((s) => (
          <li key={s.idx} className="flex items-center gap-3 py-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-d-sunk font-mono text-[12px] font-bold">{s.sym}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium">{s.name}</span>
              <span className="block truncate text-[11.5px] text-d-mute">
                {s.stock} of min {s.min} · {s.principal.split(",")[0]}
              </span>
            </span>
            <Btn
              size="sm"
              variant="soft"
              onClick={() => {
                const po = onRaise(s, qtyFor(s));
                toast.success(`${po.no} drafted`, { description: `${qtyFor(s)} × ${s.sym} ${s.pack} to ${s.principal.split(",")[0]} · ${inr(po.amount)}` });
                desk.log(`Reorder Planner drafted ${po.no}: ${qtyFor(s)} × ${s.sym}`, "info");
              }}
            >
              +{qtyFor(s)}
            </Btn>
          </li>
        ))}
      </ul>
      <Btn
        className="mt-3 w-full"
        variant="solid"
        icon={PackagePlus}
        onClick={() => {
          list.forEach((s) => onRaise(s, qtyFor(s)));
          toast.success(`${list.length} POs drafted for approval`, { description: "They are waiting in Purchase." });
          desk.log(`${list.length} reorder POs drafted from the wall`, "info");
        }}
      >
        Draft all {list.length}
      </Btn>
    </div>
  );
}

const hazards = ["All", "Flammable", "Corrosive", "Oxidiser", "Toxic", "Irritant", "Non-haz"] as const;
const grades = ["All", "AR", "HPLC", "GR", "LR", "CRM"] as const;

function PeriodicWall({ skus, pickSku, pick, picked, onOpen }: { skus: Sku[]; pickSku: number; pick: (typeof picks)[number]; picked: number; onOpen: (idx: number) => void }) {
  const [hazard, setHazard] = React.useState<(typeof hazards)[number]>("All");
  const [grade, setGrade] = React.useState<(typeof grades)[number]>("All");
  const [mode, setMode] = React.useState<ColourMode>("Stock");
  const [query, setQuery] = React.useState("");
  const [hover, setHover] = React.useState<number | null>(null);
  const needle = query.trim().toLowerCase();
  const match = (s: Sku) => (hazard === "All" || hazardOf(s) === hazard) && (grade === "All" || s.grade === grade) && (!needle || `${s.sym} ${s.name} ${s.cas}`.toLowerCase().includes(needle));
  const matched = skus.filter(match).length;
  const focus = skus.find((s) => s.idx === (hover ?? pickSku)) ?? skus[8];
  const pickedSku = skus[pick.sku - 1];

  const legend: { label: string; colour: string; n: number }[] =
    mode === "Hazard"
      ? (Object.keys(hazardColour) as Hazard[]).map((h) => ({ label: h, colour: hazardColour[h], n: skus.filter((s) => hazardOf(s) === h).length }))
      : mode === "Expiry"
        ? [
            { label: "≤ 30 d", colour: "var(--d-late)", n: skus.filter((s) => s.stock > 0 && s.exp <= 30).length },
            { label: "31–90 d", colour: "var(--d-warn)", n: skus.filter((s) => s.stock > 0 && s.exp > 30 && s.exp <= 90).length },
            { label: "≤ 1 yr", colour: "var(--d-info)", n: skus.filter((s) => s.stock > 0 && s.exp > 90 && s.exp <= 365).length },
            { label: "> 1 yr", colour: "var(--d-ok)", n: skus.filter((s) => s.stock > 0 && s.exp > 365).length },
          ]
        : [
            { label: "Healthy", colour: "var(--d-ok)", n: skus.filter((s) => s.stock >= s.min).length },
            { label: "Below min", colour: "var(--d-warn)", n: skus.filter((s) => s.stock > 0 && s.stock < s.min).length },
            { label: "Out", colour: "var(--d-late)", n: skus.filter((s) => s.stock <= 0).length },
          ];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SearchBox value={query} onChange={setQuery} placeholder="Symbol, name or CAS" className="w-full sm:w-56" />
        <Segmented size="sm" options={hazards.map((h) => ({ value: h, label: h, count: h === "All" ? undefined : skus.filter((s) => hazardOf(s) === h).length }))} value={hazard} onChange={setHazard} />
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Segmented size="sm" options={grades} value={grade} onChange={setGrade} />
        <div className="flex items-center gap-2 text-[12px] text-d-mute">
          Colour by <Segmented size="sm" options={["Stock", "Expiry", "Hazard"] as const} value={mode} onChange={setMode} />
        </div>
      </div>
      <div className="desk-scroll -mx-5 overflow-x-auto px-5 pb-1">
        <div className="grid min-w-[960px] grid-cols-12 gap-1.5" style={{ gridTemplateRows: "repeat(4, 98px) 12px 98px" }}>
          {/* key: magnified tile */}
          <div className="relative flex flex-col rounded-[10px] border-2 border-dashed border-d-line p-3" style={{ gridRow: "1 / span 2", gridColumn: "3 / span 2" }}>
            <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-d-mute">Key · {hover ? "hover" : "picking"}</span>
            <div className="mt-2 flex-1 rounded-[8px] p-2.5" style={{ background: `color-mix(in oklab, ${tileColour(focus, mode)} 15%, var(--d-panel))`, boxShadow: `inset 0 0 0 1.5px color-mix(in oklab, ${tileColour(focus, mode)} 50%, transparent)` }}>
              <div className="flex justify-between font-mono text-[10px]">
                <span>{focus.idx}</span>
                <span className="font-semibold" style={{ color: tileColour(focus, mode) }}>{focus.grade}</span>
              </div>
              <p className="mt-1 font-mono text-[32px] font-bold leading-none tracking-tight">{focus.sym}</p>
              <p className="mt-1 truncate text-[11px] text-d-mute">{focus.name}</p>
              <div className="mt-2 flex justify-between font-mono text-[10.5px]">
                <span>{focus.pack}</span>
                <span className="font-semibold">{focus.stock} / {focus.min}</span>
              </div>
              <p className="mt-1 truncate font-mono text-[10px] text-d-mute">{focus.stock > 0 ? `exp ${dayLabel(focus.exp, true)}` : "no stock"} · {hazardOf(focus)}</p>
            </div>
          </div>
          {/* picking now */}
          <div className="relative flex flex-col overflow-hidden rounded-[10px] bg-d-ink p-3 text-d-paper" style={{ gridRow: "1 / span 2", gridColumn: "5 / span 2" }}>
            <span className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-d-paper/70">
              <span className="desk-ping h-1.5 w-1.5 rounded-full bg-d-ok" /> Picking now
            </span>
            <p key={pick.order + pick.sku} className="desk-rise mt-2 font-mono text-[30px] font-bold leading-none">
              {pickedSku.sym}
              <span className="ml-1 text-[15px] font-medium text-d-paper/70">×{pick.qty}</span>
            </p>
            <p className="mt-1 truncate text-[11.5px] text-d-paper/80">{pick.lab}</p>
            <p className="truncate font-mono text-[10.5px] text-d-paper/60">{pick.order} · lot {lotsFor(pickedSku)[0]?.no ?? "—"}</p>
            <div className="desk-belt mt-auto h-1.5 rounded-full opacity-70" />
            <p className="mt-1.5 flex items-center gap-1 font-mono text-[10px] text-d-paper/70">
              <ScanLine className="h-3 w-3" /> {picked} scans · FEFO first
            </p>
          </div>
          {/* legend */}
          <div className="flex flex-col justify-center gap-1.5 rounded-[10px] bg-d-sunk/70 px-3" style={{ gridRow: "1", gridColumn: "7 / span 4" }}>
            <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-d-mute">
              {mode} · {matched} of {skus.length} shown
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {legend.map((l) => (
                <span key={l.label} className="inline-flex items-center gap-1.5 text-[11.5px]">
                  <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: l.colour }} />
                  {l.label}
                  <span className="font-mono text-[10.5px] text-d-mute">{l.n}</span>
                </span>
              ))}
            </div>
          </div>
          {skus.map((s) => (
            <Tile key={s.idx} s={s} mode={mode} dim={!match(s)} picking={s.idx === pickSku} onOpen={() => onOpen(s.idx)} onHover={(on) => setHover(on ? s.idx : null)} />
          ))}
          <div className="flex items-center justify-end pr-2 text-right" style={{ gridRow: "6", gridColumn: "1 / span 2" }}>
            <span className="font-mono text-[10px] uppercase leading-tight tracking-[0.14em] text-d-mute">
              Standards
              <br />& CRMs <ArrowRight className="inline h-3 w-3" />
            </span>
          </div>
          <div className="flex flex-col justify-center rounded-[10px] border border-d-line px-3" style={{ gridRow: "6", gridColumn: "11 / span 2" }}>
            <span className="flex items-center gap-1.5 text-[12px] font-medium">
              <Snowflake className="h-3.5 w-3.5 text-d-info" /> {skus.filter((s) => s.cold).length} cold-chain SKUs
            </span>
            <span className="mt-0.5 flex items-center gap-1.5 text-[12px] font-medium">
              <Flame className="h-3.5 w-3.5" style={{ color: hazardColour.Flammable }} /> {skus.filter((s) => s.peso === "A").length} PESO Class A
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11.5px] text-d-mute">
        <span className="inline-flex items-center gap-1"><Timer className="h-3 w-3" /> nearest lot ≤ 45 days</span>
        <span className="inline-flex items-center gap-1"><Snowflake className="h-3 w-3" /> 2–8 °C</span>
        <span className="inline-flex items-center gap-1"><span className="rounded bg-d-info px-1 font-mono text-[9px] font-bold text-white">PO</span> on order</span>
        <span className="inline-flex items-center gap-1"><span className="h-2.5 w-4 rounded-[2px]" style={{ background: "repeating-linear-gradient(135deg,var(--d-late) 0 2px,transparent 2px 5px)" }} /> out of stock</span>
      </div>
    </div>
  );
}

function Tile({ s, mode, dim, picking, onOpen, onHover }: { s: Sku; mode: ColourMode; dim: boolean; picking: boolean; onOpen: () => void; onHover: (on: boolean) => void }) {
  const c = tileColour(s, mode);
  const out = s.stock <= 0;
  return (
    <button
      type="button"
      onClick={onOpen}
      onPointerEnter={() => onHover(true)}
      onPointerLeave={() => onHover(false)}
      title={`${s.name} · ${s.grade} · ${s.pack}`}
      className={cn("desk-rise group relative flex min-w-0 flex-col rounded-[9px] p-[7px] text-left transition-all duration-300 hover:z-10 hover:scale-[1.08] hover:shadow-[0_14px_30px_-12px_rgba(0,0,0,0.35)]", dim && "pointer-events-none scale-95 opacity-[0.16] grayscale")}
      style={{
        gridRow: s.row,
        gridColumn: s.col,
        animationDelay: `${(s.row * 12 + s.col) * 9}ms`,
        background: out ? `repeating-linear-gradient(135deg, color-mix(in oklab, ${c} 16%, var(--d-panel)) 0 3px, var(--d-panel) 3px 8px)` : `color-mix(in oklab, ${c} 15%, var(--d-panel))`,
        boxShadow: picking ? `0 0 0 2.5px var(--d-ink), 0 0 0 5px color-mix(in oklab, var(--d-accent) 35%, transparent)` : `inset 0 0 0 1px color-mix(in oklab, ${c} 42%, transparent)`,
      }}
    >
      <span className="flex items-center justify-between font-mono text-[9.5px] leading-none text-d-mute">
        <span className="inline-flex items-center gap-0.5">
          {s.idx}
          {s.stock > 0 && s.exp <= 45 && <Timer className="h-2.5 w-2.5 text-d-late" />}
          {s.cold && <Snowflake className="h-2.5 w-2.5 text-d-info" />}
        </span>
        <span className="font-semibold" style={{ color: c }}>{s.grade}</span>
      </span>
      <span className="mt-1.5 block truncate font-mono text-[19px] font-bold leading-none tracking-tight text-d-ink">{s.sym}</span>
      <span className="mt-1 block truncate text-[9.5px] leading-tight text-d-mute">{s.name}</span>
      <span className="mt-auto flex items-baseline justify-between font-mono text-[10px]">
        <span className="text-d-mute">{s.pack}</span>
        <span className={cn("font-semibold", out && "text-d-late")}>{out ? "OUT" : s.stock}</span>
      </span>
      <span className="mt-1 block h-[3px] overflow-hidden rounded-full bg-d-ink/10">
        <span className="block h-full rounded-full transition-[width] duration-700" style={{ width: `${Math.min(100, (s.stock / Math.max(1, s.min * 2)) * 100)}%`, background: c }} />
      </span>
      {s.onOrder > 0 && <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 rounded bg-d-info px-1 font-mono text-[8.5px] font-bold leading-[13px] text-white">PO</span>}
      {picking && <span className="desk-ping absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full bg-d-accent" />}
    </button>
  );
}

function Pictogram({ code }: { code: Ghs }) {
  const g = ghsInfo[code];
  const Icon = g.icon;
  return (
    <div className="flex w-[72px] flex-col items-center gap-1.5">
      <span className="flex h-11 w-11 rotate-45 items-center justify-center border-[3px] border-[#d62b20] bg-white">
        <Icon className="h-5 w-5 -rotate-45 text-black" strokeWidth={2.2} />
      </span>
      <span className="mt-1 text-center text-[10.5px] leading-tight text-d-mute">{g.label}</span>
      <span className="font-mono text-[9.5px] text-d-mute">{code}</span>
    </div>
  );
}

function SkuSheet({ sku, lots, onClose, onRaise }: { sku: Sku | null; lots: Lot[]; onClose: () => void; onRaise: (s: Sku, qty: number) => PO }) {
  const desk = useDesk();
  const [qty, setQty] = React.useState("");
  const mine = sku ? lots.filter((l) => l.sku === sku.idx) : [];
  const coa = sku ? coaFor(sku) : [];
  const suggested = sku ? Math.max(sku.min * 2 - sku.stock, Math.ceil(sku.monthly * 1.5)) : 0;
  const n = Number(qty) || suggested;
  const c = sku ? tileColour(sku, "Stock") : "var(--d-ok)";
  return (
    <Sheet
      open={!!sku}
      onOpenChange={(o) => {
        if (!o) {
          onClose();
          setQty("");
        }
      }}
      width={540}
      eyebrow={sku ? `#${sku.idx} · ${sku.family} · CAS ${sku.cas}` : ""}
      title={sku ? `${sku.sym} · ${sku.name}` : ""}
      sub={sku ? `${sku.grade} grade · ${sku.pack} · ${sku.principal}` : ""}
      footer={
        <>
          <Btn
            icon={Send}
            onClick={() => {
              toast.success("CoA and MSDS shared on WhatsApp", { description: `${sku?.sym} lot ${mine[0]?.no ?? "—"}` });
              desk.log(`CoA + MSDS for ${sku?.sym} shared with a customer`);
            }}
          >
            Share CoA + MSDS
          </Btn>
          <Btn variant="solid" onClick={onClose}>
            Done
          </Btn>
        </>
      }
    >
      {sku && (
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-[104px] shrink-0 rounded-[10px] p-2.5" style={{ background: `color-mix(in oklab, ${c} 15%, var(--d-panel))`, boxShadow: `inset 0 0 0 1.5px color-mix(in oklab, ${c} 45%, transparent)` }}>
              <div className="flex justify-between font-mono text-[10px]">
                <span>{sku.idx}</span>
                <span className="font-semibold" style={{ color: c }}>{sku.grade}</span>
              </div>
              <p className="mt-1 font-mono text-[26px] font-bold leading-none">{sku.sym}</p>
              <p className="mt-2 font-mono text-[10.5px] text-d-mute">{sku.pack}</p>
            </div>
            <KV
              items={[
                { k: "List price", v: inr(sku.price) },
                { k: "HSN · GST", v: `${sku.family === "Reagents" || sku.family === "Standards" ? "3822 · 12%" : sku.family === "Solvents" ? "2905 · 18%" : sku.family === "Acids" ? "2806 · 18%" : "2836 · 18%"}` },
                { k: "Storage", v: sku.cold ? "Cold room, 2–8 °C" : sku.peso ? `Solvent store, PESO Class ${sku.peso}` : hazardOf(sku) === "Corrosive" || hazardOf(sku) === "Oxidiser" ? "Acid store, bunded" : "Rack, ambient" },
                { k: "Sells", v: `${sku.monthly} packs / month` },
                { k: "Status", v: <Pill tone={({ Out: "late", Expiring: "late", Low: "warn", Healthy: "ok" } as const)[statusOf(sku)]}>{statusOf(sku)}</Pill> },
                { k: "Hazard class", v: hazardOf(sku) },
              ]}
            />
          </div>
          <div>
            <p className="mb-1.5 flex justify-between text-[12px] text-d-mute">
              <span>Stock {sku.stock} · min {sku.min}{sku.onOrder ? ` · ${sku.onOrder} on order` : ""}</span>
              <span className="font-mono">{Math.round((sku.stock / Math.max(1, sku.monthly)) * 30)} days of cover</span>
            </p>
            <Meter value={sku.stock} max={sku.min * 2} tone={sku.stock <= 0 ? "late" : sku.stock < sku.min ? "warn" : "ok"} height={8} />
          </div>
          <div>
            <p className="mb-2 text-[12px] font-medium text-d-mute">GHS hazard pictograms {sku.msds ? "· MSDS rev. 2025 on file" : "· MSDS missing"}</p>
            {sku.ghs.length ? (
              <div className="flex flex-wrap gap-2">
                {sku.ghs.map((g) => (
                  <Pictogram key={g} code={g} />
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-d-mute">Not classified as hazardous under GHS.</p>
            )}
          </div>
          <div>
            <p className="mb-2 text-[12px] font-medium text-d-mute">Lots, first-expiry-first</p>
            {mine.length ? (
              <ul className="space-y-1.5">
                {mine.map((l, i) => (
                  <li key={l.no} className={cn("flex items-center gap-3 rounded-[10px] border px-3 py-2 text-[13px]", i === 0 ? "border-d-accent bg-d-soft" : "border-d-line")}>
                    <span className="font-mono font-medium">{l.no}</span>
                    <span className="text-d-mute">mfg {l.mfg}</span>
                    <span className="ml-auto font-mono text-[12px]" style={{ color: l.exp <= 45 ? "var(--d-late)" : undefined }}>
                      exp {dayLabel(l.exp, true)}
                    </span>
                    <span className="w-10 text-right font-mono">{l.qty}</span>
                    <span className="w-14 text-right font-mono text-[11px] text-d-mute">{l.rack}</span>
                    {i === 0 && <Pill tone="accent">Pick first</Pill>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-[10px] border border-dashed border-d-late/50 px-3 py-4 text-center text-[13px] text-d-late">No stock. {sku.onOrder ? `${sku.onOrder} packs on order.` : "Nothing on order."}</p>
            )}
          </div>
          <div>
            <p className="mb-2 text-[12px] font-medium text-d-mute">Certificate of analysis · {mine[0]?.no ?? "last lot"}</p>
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-d-line text-left text-[11px] text-d-mute">
                  <th className="pb-1.5 font-medium">Test</th>
                  <th className="pb-1.5 font-medium">Spec</th>
                  <th className="pb-1.5 text-right font-medium">Result</th>
                </tr>
              </thead>
              <tbody>
                {coa.map((r) => (
                  <tr key={r.test} className="border-b border-d-line/60 last:border-0">
                    <td className="py-1.5">{r.test}</td>
                    <td className="py-1.5 font-mono text-[11.5px] text-d-mute">{r.spec}</td>
                    <td className="py-1.5 text-right font-mono text-[11.5px]" style={{ color: r.pass ? "var(--d-ok)" : "var(--d-late)" }}>
                      {r.result} {r.pass ? "✓" : "✗"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-[12px] bg-d-sunk p-4">
            <p className="text-[13px] font-semibold">Reorder from {sku.principal.split(",")[0]}</p>
            <p className="mt-0.5 text-[12px] text-d-mute">Suggested {suggested} packs: six weeks of sales plus safety stock. Lead time about 6 days.</p>
            <div className="mt-3 flex items-end gap-2">
              <Field label="Packs">
                <input className={cn(inputClass, "w-28")} inputMode="numeric" placeholder={String(suggested)} value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))} />
              </Field>
              <span className="pb-2.5 font-mono text-[12.5px] text-d-mute">≈ {inr(Math.round(n * sku.price * 0.72))}</span>
              <Btn
                variant="solid"
                icon={PackagePlus}
                className="ml-auto"
                onClick={() => {
                  const po = onRaise(sku, n);
                  toast.success(`${po.no} drafted for approval`, { description: `${n} × ${sku.sym} ${sku.pack} · ${inr(po.amount)}` });
                  desk.log(`${po.no} drafted: ${n} × ${sku.sym} to ${sku.principal.split(",")[0]}`, "info");
                  setQty("");
                }}
              >
                Raise PO
              </Btn>
            </div>
          </div>
        </div>
      )}
    </Sheet>
  );
}

function ColdRoomPanel() {
  const desk = useDesk();
  const { t, hist } = useColdRoom();
  const [acked, setAcked] = React.useState(false);
  return (
    <Panel live title="Cold room · live" sub="2–8 °C · 9 SKUs · probe CR-1 and door sensor">
      <div className="flex items-end justify-between gap-3">
        <p className="desk-h tnum text-[44px] font-semibold leading-none">
          {t.toFixed(1)}
          <span className="text-[18px] text-d-mute"> °C</span>
        </p>
        <div className="text-right text-[12px] text-d-mute">
          <p>min 4.3 · max 7.1</p>
          <p>14 door openings today</p>
        </div>
      </div>
      <div className="mt-4">
        <Sparkline data={hist} tone={t > 7 ? "late" : "info"} height={70} />
        <p className="mt-1 flex justify-between font-mono text-[10.5px] text-d-mute">
          <span>-1 h</span>
          <span>last {hist.length} readings · band 2–8 °C</span>
          <span>now</span>
        </p>
      </div>
      <div className="mt-3 flex items-center gap-3 rounded-[10px] border border-d-line px-3 py-2 text-[12.5px]">
        <AlertTriangle className="h-4 w-4 shrink-0 text-d-warn" />
        <span className="min-w-0 flex-1">10:12 door open 3 min 40 s, peaked 7.1 °C. Inside range.</span>
        {acked ? (
          <Pill tone="ok">Signed</Pill>
        ) : (
          <Btn
            size="sm"
            variant="soft"
            onClick={() => {
              setAcked(true);
              toast.success("Excursion acknowledged", { description: "Added to the cold-room log with Sanjay's sign-off." });
              desk.log("Cold-room excursion at 10:12 acknowledged", "ok");
            }}
          >
            Sign
          </Btn>
        )}
      </div>
    </Panel>
  );
}

/* ---------------- Batches & expiry ---------------- */

const bucketOf = (d: number) => (d <= 30 ? "≤ 30 days" : d <= 90 ? "31–90 days" : d <= 365 ? "91–365 days" : "> 1 year");

function BatchesTab({ lots, flags, setFlags }: { lots: Lot[]; flags: Record<string, string>; setFlags: React.Dispatch<React.SetStateAction<Record<string, string>>> }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<Lot | null>(null);
  const near = lots.filter((l) => l.exp <= 45);
  const value90 = lots.filter((l) => l.exp <= 90).reduce((a, l) => a + l.value, 0);
  const flag = (keys: string[], state: string) => {
    setFlags((f) => {
      const next = { ...f };
      keys.forEach((k) => (next[k] = state));
      return next;
    });
    toast.success(`${keys.length} lot${keys.length > 1 ? "s" : ""}: ${state.toLowerCase()}`);
    desk.log(`${keys.join(", ")} → ${state}`, state === "Quarantined" ? "late" : "info");
  };
  const windows = [[0, 30, "≤ 30 d"], [30, 90, "1–3 mo"], [90, 180, "3–6 mo"], [180, 365, "6–12 mo"], [365, 730, "1–2 yr"], [730, 9999, "2 yr +"]] as const;
  const months = windows.map(([from, to, m]) => {
    const inMonth = lots.filter((l) => l.exp > from && l.exp <= to);
    const fam = (f: Family) => inMonth.filter((l) => seedSkus[l.sku - 1].family === f).reduce((a, l) => a + l.value, 0) / 1000;
    return { label: m, value: 0, stack: [{ name: "Solvents", value: fam("Solvents"), tone: "accent" as Tone }, { name: "Acids", value: fam("Acids"), tone: "info" as Tone }, { name: "Reagents & salts", value: fam("Reagents") + fam("Salts & bases"), tone: "warn" as Tone }, { name: "Standards", value: fam("Standards"), tone: "late" as Tone }] };
  });

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Lots tracked" value={lots.length} hint={`${new Set(lots.map((l) => l.sku)).size} SKUs`} icon={Boxes} trend={[84, 86, 88, 87, 90, 91, lots.length]} />
        <Stat label="Expiring ≤ 45 days" value={near.length} delta="+3" deltaGood={false} hint={inr(near.reduce((a, l) => a + l.value, 0), { compact: true })} icon={CalendarClock} tone="late" />
        <Stat label="Value expiring ≤ 90 days" value={inr(value90, { compact: true })} delta="-12%" deltaGood={false} hint="vs last quarter" icon={IndianRupee} tone="warn" trend={[1.7, 1.5, 1.4, 1.2, 1.1, value90 / 1e5]} />
        <Stat label="FEFO pick compliance" value="97.4%" delta="+1.8%" hint="from scans, last 30 days" icon={ScanLine} tone="ok" trend={[92, 93, 94, 95, 96, 96.5, 97.4]} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {near.slice(0, 4).map((l) => (
          <article key={l.no} className="desk-card desk-rise overflow-hidden">
            <div className="h-1.5" style={{ background: l.exp <= 15 ? "var(--d-late)" : "var(--d-warn)" }} />
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[22px] font-bold leading-none">{l.sym}</p>
                  <p className="mt-1 text-[12px] text-d-mute">{l.name}</p>
                </div>
                <Pill tone={flags[l.no] ? "info" : "late"}>{flags[l.no] ?? `${l.qty} packs`}</Pill>
              </div>
              <div className="mt-4">
                <Countdown inHours={l.exp * 24 - 11} />
              </div>
              <p className="mt-2 font-mono text-[11.5px] text-d-mute">
                {l.no} · {l.rack} · {inr(l.value, { compact: true })}
              </p>
              <div className="mt-3 flex gap-1.5">
                <Btn size="sm" variant="soft" onClick={() => flag([l.no], "Offer sent")}>
                  Offer 15% off
                </Btn>
                <Btn size="sm" onClick={() => setOpen(l)}>
                  Details
                </Btn>
              </div>
            </div>
          </article>
        ))}
      </div>
      <Panel title="Lot ledger" sub="First-expiry-first. Select lots to offer, return or quarantine in one go.">
        <DataTable
          rows={lots}
          rowKey={(l) => l.no}
          search={(l) => `${l.no} ${l.sym} ${l.name} ${l.rack}`}
          searchPlaceholder="Search lot, symbol or rack"
          filter={{ get: (l) => bucketOf(l.exp), options: ["≤ 30 days", "31–90 days", "91–365 days", "> 1 year"] }}
          onRow={setOpen}
          bulk={[
            { label: "Offer to customers", run: (k) => flag(k, "Offer sent") },
            { label: "Return to principal", run: (k) => flag(k, "Return requested") },
            { label: "Quarantine", run: (k) => flag(k, "Quarantined") },
          ]}
          columns={[
            { key: "no", label: "Lot", render: (l) => <span className="font-mono text-[12.5px] font-medium">{l.no}</span>, sort: (l) => l.no },
            { key: "sym", label: "SKU", render: (l) => <span><b className="font-mono">{l.sym}</b> <span className="text-d-mute">{l.name}</span></span>, sort: (l) => l.sym },
            { key: "grade", label: "Grade", render: (l) => <Pill mono>{l.grade}</Pill>, wide: true },
            { key: "qty", label: "Packs", align: "right", render: (l) => <span className="tnum font-mono">{l.qty}</span>, sort: (l) => l.qty },
            { key: "exp", label: "Expires", render: (l) => <span className="font-mono text-[12px]">{dayLabel(l.exp, true)}</span>, sort: (l) => l.exp },
            { key: "days", label: "Days", align: "right", render: (l) => <span className="tnum font-mono" style={{ color: l.exp <= 30 ? "var(--d-late)" : l.exp <= 90 ? "var(--d-warn)" : undefined }}>{l.exp}</span>, sort: (l) => l.exp },
            { key: "rack", label: "Rack", render: (l) => <span className="font-mono text-[12px] text-d-mute">{l.rack}</span>, wide: true },
            { key: "state", label: "", align: "right", render: (l) => (flags[l.no] ? <Pill tone={flags[l.no] === "Quarantined" ? "late" : "info"}>{flags[l.no]}</Pill> : null) },
          ]}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <Panel title="When stock expires" sub="List value in ₹ thousand, by family and expiry window">
          <Bars height={190} format={(v) => `₹${Math.round(v)}k`} data={months} />
        </Panel>
        <Panel title="Written off, last 6 months" sub="Value lost to expiry. The agent started on 1 Aug.">
          <HBars format={(v) => inr(v, { compact: true })} data={[{ label: "May", value: 61400, tone: "late" }, { label: "Jun", value: 54800, tone: "late" }, { label: "Jul", value: 47200, tone: "warn" }, { label: "Aug", value: 22100, tone: "warn" }, { label: "Sep", value: 14600, tone: "ok" }, { label: "Oct (so far)", value: 6200, tone: "ok" }]} />
        </Panel>
      </div>
      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={open ? `${open.rack} · ${open.grade}` : ""}
        title={open ? `${open.no} · ${open.sym}` : ""}
        sub={open ? `${open.name} · ${open.qty} packs · expires ${dayLabel(open.exp, true)}` : ""}
        footer={
          <>
            <Btn icon={Ban} onClick={() => open && (flag([open.no], "Quarantined"), setOpen(null))}>
              Quarantine
            </Btn>
            <Btn icon={RotateCcw} onClick={() => open && (flag([open.no], "Return requested"), setOpen(null))}>
              Return
            </Btn>
            <Btn variant="solid" icon={MessageCircle} onClick={() => open && (flag([open.no], "Offer sent"), setOpen(null))}>
              Offer to labs
            </Btn>
          </>
        }
      >
        {open && (
          <div className="space-y-5">
            <KV items={[{ k: "Manufactured", v: open.mfg }, { k: "Expires", v: dayLabel(open.exp, true) }, { k: "Value at list", v: inr(open.value) }, { k: "State", v: flags[open.no] ?? "In stock" }, { k: "Principal", v: seedSkus[open.sku - 1].principal.split(",")[0] }, { k: "Return window", v: open.exp >= 15 ? "Open (15+ days)" : "Closed" }]} />
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Labs that bought this SKU in the last 90 days</p>
              <ul className="space-y-1.5 text-[13px]">
                {seedOrders
                  .filter((o) => o.lines.some((x) => x.sku === open.sku))
                  .concat(seedOrders.slice(0, 2))
                  .slice(0, 3)
                  .map((o) => (
                    <li key={o.no} className="flex items-center justify-between rounded-[10px] border border-d-line px-3 py-2">
                      <span>
                        {o.lab} <span className="text-d-mute">· {o.town}</span>
                      </span>
                      <span className="font-mono text-[11.5px] text-d-mute">{o.no}</span>
                    </li>
                  ))}
              </ul>
            </div>
            <div className="rounded-[12px] bg-[#e7f6e9] p-4 text-[13px] leading-relaxed text-[#1d3b22]">
              Namaste, Narmada Lab Supply here. We have {open.qty} × {open.sym} {open.grade} ({open.name}), lot {open.no}, valid till {dayLabel(open.exp, true)}, with CoA. Special price at 15% off list this week. Reply YES to book. — Nidhi
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Customer orders ---------------- */

const stages: { id: OStage; label: string; tone: Tone; hint: string }[] = [
  { id: "new", label: "New", tone: "info", hint: "WhatsApp, email and IndiaMART" },
  { id: "pick", label: "Picking (FEFO)", tone: "accent", hint: "Lot slips printed first-expiry-first" },
  { id: "docs", label: "CoA & docs", tone: "warn", hint: "CoA, MSDS, TREM card, e-way bill" },
  { id: "out", label: "Dispatched", tone: "ok", hint: "Own tempo or hazmat transporter" },
  { id: "done", label: "Delivered", tone: "neutral", hint: "POD on WhatsApp" },
];

function OrdersTab({ orders, setOrders, skus }: { orders: Order[]; setOrders: React.Dispatch<React.SetStateAction<Order[]>>; skus: Sku[] }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<string | null>(null);
  const order = orders.find((o) => o.no === open) ?? null;
  const live = orders.filter((o) => o.stage !== "done");
  const move = (no: string, stage: OStage) => {
    const o = orders.find((x) => x.no === no);
    if (!o || o.stage === stage) return;
    setOrders((cur) => cur.map((x) => (x.no === no ? { ...x, stage } : x)));
    const label = stages.find((s) => s.id === stage)?.label;
    toast.success(`${no} → ${label}`, { description: stage === "out" && o.hazmat ? "TREM card and e-way bill generated, lab told on WhatsApp." : stage === "docs" ? "CoA Clerk is attaching certificates." : o.lab });
    desk.log(`${no} (${o.lab}) moved to ${label}`, stage === "done" ? "ok" : "info");
  };
  const byTown = Object.entries(orders.reduce<Record<string, number>>((acc, o) => ((acc[o.town] = (acc[o.town] ?? 0) + orderValue(o, skus)), acc), {})).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open orders" value={live.length} hint={`${new Set(live.map((o) => o.lab)).size} labs`} icon={ClipboardCheck} trend={[7, 9, 8, 10, 9, 11, live.length]} />
        <Stat label="Open order value" value={inr(live.reduce((a, o) => a + orderValue(o, skus), 0), { compact: true })} delta="+9%" icon={IndianRupee} trend={[2.1, 2.4, 2.2, 2.8, 2.6, 3.1, 3.4]} />
        <Stat label="Dispatched same day" value="86%" delta="+4%" hint="target 90%" icon={Truck} tone="ok" trend={[78, 80, 79, 83, 82, 84, 86]} />
        <Stat label="Hazmat runs today" value={orders.filter((o) => o.hazmat && (o.stage === "out" || o.stage === "pick")).length} hint="TREM cards with Firoz" icon={Flame} tone="warn" />
      </div>
      <Panel title="Order board" sub="Drag a card to move it. Moving to Dispatched creates the TREM card and e-way bill.">
        <Board
          columns={stages.map((s) => ({ id: s.id, label: s.label, tone: s.tone, hint: s.hint }))}
          items={orders}
          itemKey={(o) => o.no}
          getColumn={(o) => o.stage}
          onMove={(k, c) => move(k, c as OStage)}
          minColumnWidth={226}
          renderCard={(o) => (
            <button type="button" onClick={() => setOpen(o.no)} className="block w-full text-left">
              <p className="flex items-center gap-1.5 font-mono text-[11px] text-d-mute">
                {o.no}
                {o.hazmat && <Flame className="h-3 w-3" style={{ color: hazardColour.Flammable }} />}
                <span className="ml-auto">{o.need}</span>
              </p>
              <p className="mt-1 text-[13.5px] font-semibold leading-snug">{o.lab}</p>
              <p className="text-[12px] text-d-mute">{o.town}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {o.lines.map((l) => (
                  <span key={l.sku} className="rounded-[5px] bg-d-sunk px-1.5 py-0.5 font-mono text-[10.5px]">
                    {skus[l.sku - 1].sym}×{l.qty}
                  </span>
                ))}
              </div>
              <p className="mt-2 flex items-center justify-between text-[12px]">
                <span className="tnum font-mono font-semibold">{inr(orderValue(o, skus), { compact: true })}</span>
                {o.note && <AlertTriangle className="h-3.5 w-3.5 text-d-warn" />}
              </p>
            </button>
          )}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <Panel title="Order value by town" sub="This board, at list price">
          <HBars format={(v) => inr(v, { compact: true })} data={byTown.map(([label, value], i) => ({ label, value, tone: i === 0 ? "accent" : "info" }))} />
        </Panel>
        <Panel title="Top labs this quarter" sub="From Tally, with their usual basket">
          <DataTable
            dense
            pageSize={6}
            rows={[
              { lab: "Damanganga Pharma QC", town: "Daman", qtr: 1284000, basket: "ACN, MeOH, H₃PO₄", credit: "45 days" },
              { lab: "Shree Pharmachem", town: "Ankleshwar", qtr: 942000, basket: "KFR, MeOH, IPA", credit: "45 days" },
              { lab: "Bharuch Fluoro Chem", town: "Dahej", qtr: 715000, basket: "AgNO₃, CRMs", credit: "45 days" },
              { lab: "Sarigam Bulk Drugs", town: "Sarigam", qtr: 598000, basket: "NH₄OAc, ACN", credit: "30 days" },
              { lab: "Panoli Intermediates", town: "Panoli", qtr: 486000, basket: "EtOAc, Hex", credit: "60 days" },
              { lab: "Vapi Organics Ltd", town: "Vapi", qtr: 412000, basket: "HCl, NaOH", credit: "30 days" },
              { lab: "Valsad Analytical Services", town: "Valsad", qtr: 228000, basket: "Buffers, KHP", credit: "30 days" },
            ]}
            rowKey={(r) => r.lab}
            columns={[
              { key: "lab", label: "Lab", render: (r) => <span className="font-medium">{r.lab}</span>, sort: (r) => r.lab },
              { key: "town", label: "Town", render: (r) => <span className="text-d-mute">{r.town}</span> },
              { key: "basket", label: "Usual basket", render: (r) => <span className="font-mono text-[11.5px]">{r.basket}</span>, wide: true },
              { key: "qtr", label: "Quarter", align: "right", render: (r) => <span className="tnum font-mono">{inr(r.qtr, { compact: true })}</span>, sort: (r) => r.qtr },
            ]}
          />
        </Panel>
      </div>
      <Sheet
        open={!!order}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={order ? `${order.no} · need by ${order.need}` : ""}
        title={order?.lab ?? ""}
        sub={order ? `${order.town} · ${order.lines.length} lines · ${inr(orderValue(order, skus))} + GST` : ""}
        footer={
          order && (
            <>
              <Btn
                icon={FileText}
                onClick={() => {
                  toast.success("Docs pack attached", { description: "CoA per lot, MSDS, TREM card and e-way bill." });
                  desk.log(`Docs pack attached to ${order.no}`);
                }}
              >
                Attach docs
              </Btn>
              {order.stage !== "done" && (
                <Btn variant="solid" icon={ArrowRight} onClick={() => move(order.no, stages[stages.findIndex((s) => s.id === order.stage) + 1].id)}>
                  Move to {stages[stages.findIndex((s) => s.id === order.stage) + 1].label}
                </Btn>
              )}
            </>
          )
        }
      >
        {order && (
          <div className="space-y-5">
            {order.note && (
              <p className="flex gap-2 rounded-[10px] bg-[color-mix(in_oklab,var(--d-warn)_12%,transparent)] px-3 py-2 text-[13px]">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-d-warn" /> {order.note}
              </p>
            )}
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-d-line text-left text-[11px] text-d-mute">
                  <th className="pb-1.5 font-medium">SKU</th>
                  <th className="pb-1.5 font-medium">FEFO lot</th>
                  <th className="pb-1.5 text-right font-medium">Qty</th>
                  <th className="pb-1.5 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.lines.map((l) => {
                  const s = skus[l.sku - 1];
                  const lot = lotsFor(s)[0];
                  return (
                    <tr key={l.sku} className="border-b border-d-line/60">
                      <td className="py-2">
                        <b className="font-mono">{s.sym}</b> <span className="text-d-mute">{s.grade} {s.pack}</span>
                        {s.stock < l.qty && <Pill tone="late" className="ml-1">short {l.qty - s.stock}</Pill>}
                      </td>
                      <td className="py-2 font-mono text-[11.5px] text-d-mute">{lot?.no ?? "—"}</td>
                      <td className="py-2 text-right font-mono">{l.qty}</td>
                      <td className="py-2 text-right font-mono">{inr(l.qty * s.price)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Checklist
              items={[
                { id: "coa", label: "CoA per lot attached", sub: "From the principal, checked by Dr. Rupal", done: order.stage !== "new" && order.stage !== "pick" },
                { id: "msds", label: "MSDS (16 sections) attached", done: order.stage !== "new" },
                { id: "trem", label: "TREM card for the driver", sub: order.hazmat ? "Hazmat: required" : "Not hazmat", done: order.stage === "out" || order.stage === "done" },
                { id: "ewb", label: "E-way bill", sub: orderValue(order, skus) > 50000 ? "Over ₹50k: required" : "Under ₹50k", done: order.stage === "out" || order.stage === "done" },
              ]}
              onToggle={(id) => toast(`Checklist: ${id.toUpperCase()} updated`, { description: order.no })}
            />
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Compliance ---------------- */

type Licence = { name: string; no: string; issuer: string; until: string; days: number; owner: string };
const licences: Licence[] = [
  { name: "PESO storage licence (Class A & B)", no: "P/HQ/GJ/15/4471", issuer: "PESO, Vadodara circle", until: "31 Dec 2026", days: 72, owner: "Ketan" },
  { name: "NDPS controlled substances registration", no: "NCB/AZU/CS/2207", issuer: "NCB Ahmedabad zonal unit", until: "31 Mar 2027", days: 162, owner: "Sanjay" },
  { name: "GPCB consent to operate", no: "AWH-118842", issuer: "GPCB Vapi", until: "14 Feb 2027", days: 117, owner: "Ketan" },
  { name: "Fire NOC", no: "VMC/FIRE/2025/0931", issuer: "Vapi Municipal Fire", until: "8 Nov 2026", days: 19, owner: "Sanjay" },
  { name: "Weights & measures (balances)", no: "LM/VLS/6620", issuer: "Legal Metrology, Valsad", until: "2 Jan 2027", days: 74, owner: "Rupal" },
  { name: "Shop & establishment", no: "VAPI/SE/44190", issuer: "Vapi Nagarpalika", until: "31 Mar 2028", days: 528, owner: "Komal" },
];

function ComplianceTab({ skus, pos }: { skus: Sku[]; pos: PO[] }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<Licence | null>(null);
  const [asked, setAsked] = React.useState<Set<number>>(new Set());
  const [audit, setAudit] = React.useState([
    { id: "a1", label: "Earthing and flameproof fittings, solvent store", sub: "Monthly, Sanjay", done: true },
    { id: "a2", label: "Spill kits and eye-wash stations checked", sub: "Weekly", done: true },
    { id: "a3", label: "Acids and oxidisers kept apart", sub: "HClO₄ and HNO₃ away from solvents", done: false },
    { id: "a4", label: "Fire extinguishers within refill date", sub: "8 of 9; one CO₂ due 2 Nov", done: false },
    { id: "a5", label: "NDPS register reconciled with Tally", sub: "Quarterly return due 31 Oct", done: false },
    { id: "a6", label: "Cold-room logger calibration certificate", sub: "Valid to Jan 2027", done: true },
  ]);
  const { t, hist } = useColdRoom();
  const litres = (s: Sku) => s.stock * (s.pack === "2.5 L" ? 2.5 : s.pack === "1 L" ? 1 : 0.5);
  const classA = skus.filter((s) => s.peso === "A").reduce((a, s) => a + litres(s), 0);
  const classB = skus.filter((s) => s.peso === "B").reduce((a, s) => a + litres(s), 0);
  const inboundA = pos.filter((p) => p.status !== "Received" && p.status !== "On hold" && skus[p.sku - 1].peso === "A").reduce((a, p) => a + p.qty * 2.5, 0);
  const missing = skus.filter((s) => !s.msds);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="PESO Class A held" value={`${Math.round(classA)} L`} hint="licence 1,200 L" icon={Flame} tone={classA > 1080 ? "late" : "warn"} trend={[690, 720, 760, 740, 790, 810, classA]} />
        <Stat label="MSDS coverage" value={`${skus.length - missing.length + asked.size} / ${skus.length}`} delta="+2" hint="rev. within 3 years" icon={FileText} tone="ok" />
        <Stat label="Cold room now" value={`${t.toFixed(1)} °C`} hint="23 h 52 m in range today" icon={Thermometer} tone="info" trend={hist} />
        <Stat label="Licences due ≤ 90 days" value={licences.filter((l) => l.days <= 90).length} hint="Fire NOC in 19 days" icon={ShieldCheck} tone="late" />
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
        <Panel icon={Flame} title="PESO storage limits" sub="Licensed quantity vs held in the solvent store, with inbound POs">
          <div className="space-y-5">
            {[
              { label: "Class A (flash point < 23 °C)", held: classA, inbound: inboundA, limit: 1200 },
              { label: "Class B (23–65 °C)", held: classB, inbound: 0, limit: 500 },
            ].map((c) => {
              const after = c.held + c.inbound;
              return (
                <div key={c.label}>
                  <p className="flex items-baseline justify-between text-[13px]">
                    <span className="font-medium">{c.label}</span>
                    <span className="tnum font-mono text-[12px]">
                      {Math.round(c.held)} L <span className="text-d-mute">/ {c.limit.toLocaleString("en-IN")} L</span>
                    </span>
                  </p>
                  <div className="relative mt-2 h-4 overflow-hidden rounded-full bg-d-sunk">
                    <div className="desk-growx absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.min(100, (c.held / c.limit) * 100)}%`, background: c.held / c.limit > 0.9 ? "var(--d-late)" : "var(--d-warn)" }} />
                    {c.inbound > 0 && <div className="desk-shimmer absolute inset-y-0 rounded-r-full" style={{ left: `${Math.min(100, (c.held / c.limit) * 100)}%`, width: `${Math.min(100 - (c.held / c.limit) * 100, (c.inbound / c.limit) * 100)}%`, background: "repeating-linear-gradient(135deg, color-mix(in oklab, var(--d-late) 45%, transparent) 0 4px, transparent 4px 8px)" }} />}
                  </div>
                  {c.inbound > 0 && (
                    <p className="mt-1.5 text-[12px]" style={{ color: after > c.limit ? "var(--d-late)" : "var(--d-mute)" }}>
                      + {Math.round(c.inbound)} L inbound → {Math.round(after)} L ({Math.round((after / c.limit) * 100)}%){after > c.limit ? ". Over the licence: split or delay a delivery." : ""}
                    </p>
                  )}
                </div>
              );
            })}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {skus
                .filter((s) => s.peso === "A")
                .map((s) => (
                  <div key={s.idx} className="rounded-[8px] bg-d-sunk px-2.5 py-1.5">
                    <p className="font-mono text-[13px] font-bold">{s.sym}</p>
                    <p className="font-mono text-[11px] text-d-mute">{Math.round(litres(s))} L</p>
                  </div>
                ))}
            </div>
          </div>
        </Panel>
        <Panel live title="Cold room, last hour" sub="Probe CR-1, readings every 3 minutes. Green band is 2–8 °C.">
          <AreaChart
            height={180}
            labels={hist.map((_, i) => `-${(hist.length - 1 - i) * 3}m`)}
            series={[
              { name: "Cold room °C", data: hist, tone: "info" },
              { name: "Upper limit 8 °C", data: hist.map(() => 8), tone: "late", dashed: true },
              { name: "Lower limit 2 °C", data: hist.map(() => 2), tone: "late", dashed: true },
            ]}
            format={(v) => `${v.toFixed(1)} °C`}
          />
          <ul className="mt-3 divide-y divide-d-line text-[12.5px]">
            {[
              { at: "10:12", t: "Door open 3 min 40 s, peak 7.1 °C", tone: "warn" as Tone },
              { at: "Yesterday 18:40", t: "Compressor defrost cycle, peak 6.4 °C", tone: "info" as Tone },
              { at: "12 Oct", t: "Power cut 22 min, DG took over, peak 8.6 °C (excursion)", tone: "late" as Tone },
            ].map((e) => (
              <li key={e.at} className="flex items-center gap-3 py-2">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: `var(--d-${e.tone})` }} />
                <span className="w-[110px] shrink-0 font-mono text-[11.5px] text-d-mute">{e.at}</span>
                <span>{e.t}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <Panel title="Licences & registrations" sub="Click a row for renewal steps. The agent starts each renewal 60 days ahead.">
        <DataTable
          rows={licences}
          rowKey={(l) => l.no}
          onRow={setOpen}
          columns={[
            { key: "name", label: "Licence", render: (l) => <span className="font-medium">{l.name}</span>, sort: (l) => l.name },
            { key: "no", label: "Number", render: (l) => <span className="font-mono text-[12px]">{l.no}</span>, wide: true },
            { key: "issuer", label: "Issued by", render: (l) => <span className="text-d-mute">{l.issuer}</span>, wide: true },
            { key: "until", label: "Valid until", render: (l) => <span className="font-mono text-[12px]">{l.until}</span>, sort: (l) => l.days },
            { key: "days", label: "Status", align: "right", render: (l) => <Pill tone={l.days <= 30 ? "late" : l.days <= 90 ? "warn" : "ok"}>{l.days} days</Pill>, sort: (l) => l.days },
          ]}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel icon={FileText} title="MSDS gaps" sub="SKUs without a current 16-section MSDS on file">
          <ul className="divide-y divide-d-line">
            {missing.map((s) => (
              <li key={s.idx} className="flex items-center gap-3 py-2.5">
                <span className="w-12 font-mono text-[14px] font-bold">{s.sym}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px]">{s.name}</span>
                  <span className="block text-[11.5px] text-d-mute">{s.principal}</span>
                </span>
                {asked.has(s.idx) ? (
                  <Pill tone="info">Requested</Pill>
                ) : (
                  <Btn
                    size="sm"
                    variant="soft"
                    onClick={() => {
                      setAsked((a) => new Set(a).add(s.idx));
                      toast.success("MSDS requested", { description: `Email to ${s.principal.split(",")[0]} with CAS and lot.` });
                      desk.log(`MSDS requested for ${s.sym} from ${s.principal.split(",")[0]}`);
                    }}
                  >
                    Request
                  </Btn>
                )}
              </li>
            ))}
          </ul>
          <Meter className="mt-3" value={skus.length - missing.length + asked.size} max={skus.length} tone="ok" />
          <NdpsRegister skus={skus} />
        </Panel>
        <Panel icon={ClipboardCheck} title="Monthly safety audit" sub="October · tick as Sanjay walks the godown">
          <Checklist
            items={audit}
            onToggle={(id) => {
              setAudit((cur) => cur.map((a) => (a.id === id ? { ...a, done: !a.done } : a)));
              desk.log(`Safety audit item updated: ${audit.find((a) => a.id === id)?.label}`);
            }}
          />
          <p className="mt-2 text-right font-mono text-[11.5px] text-d-mute">
            {audit.filter((a) => a.done).length} of {audit.length} done
          </p>
        </Panel>
      </div>
      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={open?.no}
        title={open?.name ?? ""}
        sub={open ? `${open.issuer} · valid until ${open.until}` : ""}
        footer={
          <Btn
            variant="solid"
            icon={CalendarClock}
            onClick={() => {
              toast.success("Renewal started", { description: `${open?.owner} gets the checklist on WhatsApp.` });
              desk.log(`Renewal started: ${open?.name}`, "info");
              setOpen(null);
            }}
          >
            Start renewal
          </Btn>
        }
      >
        {open && (
          <div className="space-y-5">
            <KV items={[{ k: "Days left", v: <span style={{ color: open.days <= 30 ? "var(--d-late)" : undefined }}>{open.days}</span> }, { k: "Owner", v: open.owner }, { k: "Last renewed", v: "2025" }, { k: "Portal", v: open.name.startsWith("PESO") ? "PESO online (DSC expired)" : "Offline / email" }]} />
            <Checklist
              items={[
                { id: "1", label: "Download last licence and site plan", done: true },
                { id: "2", label: "Updated stock statement from the register", done: open.days > 60 },
                { id: "3", label: "Fee challan", done: false },
                { id: "4", label: "Inspection slot booked", done: false },
              ]}
              onToggle={() => toast("Step updated")}
            />
          </div>
        )}
      </Sheet>
    </div>
  );
}

function NdpsRegister({ skus }: { skus: Sku[] }) {
  const desk = useDesk();
  const [filed, setFiled] = React.useState(false);
  const rows = [
    { sku: 27, unit: "kg", per: 0.5, buyers: 6 },
    { sku: 1, unit: "L", per: 2.5, buyers: 14 },
    { sku: 2, unit: "L", per: 2.5, buyers: 11 },
  ];
  return (
    <div className="mt-5 rounded-[12px] border border-d-line p-3.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-semibold">NDPS controlled substances · Form D</p>
        <Pill tone={filed ? "ok" : "warn"}>{filed ? "Draft filed" : "Due 31 Oct"}</Pill>
      </div>
      <ul className="mt-2 divide-y divide-d-line text-[12.5px]">
        {rows.map((r) => {
          const s = skus[r.sku - 1];
          return (
            <li key={r.sku} className="flex items-center gap-3 py-1.5">
              <span className="w-14 font-mono font-bold">{s.sym}</span>
              <span className="min-w-0 flex-1 truncate text-d-mute">{s.name}</span>
              <span className="font-mono">{(s.stock * r.per).toLocaleString("en-IN")} {r.unit}</span>
              <span className="w-20 text-right text-[11.5px] text-d-mute">{r.buyers} buyers</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-1.5 text-[11.5px] text-d-late">Silvassa Agro&apos;s end-use declaration has expired. Their KMnO₄ order is held.</p>
      <Btn
        size="sm"
        variant={filed ? "outline" : "solid"}
        className="mt-2.5"
        icon={FileText}
        disabled={filed}
        onClick={() => {
          setFiled(true);
          toast.success("Form D draft sent to Ketan", { description: "Jul–Sep 2026 quarterly return, ready to sign and email to NCB Ahmedabad." });
          desk.log("NDPS Form D quarterly return drafted", "info");
        }}
      >
        {filed ? "Draft sent" : "Prepare quarterly return"}
      </Btn>
    </div>
  );
}

/* ---------------- Purchase ---------------- */

const poTone: Record<POStatus, Tone> = { "Awaiting approval": "warn", Confirmed: "info", "In transit": "accent", Received: "ok", "On hold": "late" };

function PurchaseTab({ pos, skus, setStatus, onRaise }: { pos: PO[]; skus: Sku[]; setStatus: (no: string, s: POStatus) => void; onRaise: (s: Sku, qty: number) => PO }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);
  const [skuPick, setSkuPick] = React.useState("11");
  const [qty, setQty] = React.useState("12");
  const po = pos.find((p) => p.no === open) ?? null;
  const approvals = pos.filter((p) => p.needsApproval);
  const openPOs = pos.filter((p) => p.status !== "Received");
  const spend = PRINCIPALS.map((pr, i) => ({ label: pr.split(",")[0], value: pos.filter((p) => p.principal === pr).reduce((a, p) => a + p.amount, 0), tone: (["accent", "info", "warn", "ok", "late"] as Tone[])[i] }));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Waiting on Ketan" value={pos.filter((p) => p.status === "Awaiting approval").length} hint={inr(pos.filter((p) => p.status === "Awaiting approval").reduce((a, p) => a + p.amount, 0), { compact: true })} icon={ClipboardCheck} tone="warn" />
        <Stat label="In transit" value={pos.filter((p) => p.status === "In transit").length} hint="MeOH lands Thursday" icon={Truck} />
        <Stat label="Open PO value" value={inr(openPOs.reduce((a, p) => a + p.amount, 0), { compact: true })} delta="+18%" deltaGood={false} icon={IndianRupee} trend={[2.6, 3.1, 2.9, 3.4, 3.8, 4.1, openPOs.reduce((a, p) => a + p.amount, 0) / 1e5]} />
        <Stat label="Avg principal lead time" value="6.4 d" delta="-0.8" deltaGood={false} hint="Spectra slowest at 11 d" icon={Timer} tone="ok" />
      </div>
      <Panel icon={ClipboardCheck} title="Waiting on Ketan" sub="Approved POs go to Tally and to the principal's sales desk on WhatsApp" action={<Btn size="sm" variant="solid" icon={Plus} onClick={() => setAdding(true)}>New PO</Btn>}>
        <ApprovalQueue
          items={approvals.map((p) => ({ id: p.no, title: `${p.no} · ${p.qty} × ${skus[p.sku - 1].sym} ${skus[p.sku - 1].pack}`, sub: `${p.principal} · ${p.note}`, amount: inr(p.amount), meta: p.sku === 9 ? "PESO: split" : skus[p.sku - 1].grade, tone: p.sku === 9 ? "late" : "info" }))}
          onDecide={(id, d) => {
            setStatus(id, d === "approved" ? "Confirmed" : d === "held" ? "On hold" : "Awaiting approval");
            if (d) desk.log(`${id} ${d === "approved" ? "approved and sent to principal" : "put on hold"}`, d === "approved" ? "ok" : "warn");
          }}
        />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Panel title="All principal POs" sub="Click a row for lines, CoA status and to mark it received">
          <DataTable
            rows={pos}
            rowKey={(p) => p.no}
            search={(p) => `${p.no} ${p.principal} ${skus[p.sku - 1].sym} ${skus[p.sku - 1].name}`}
            searchPlaceholder="Search PO, principal or SKU"
            filter={{ get: (p) => p.status, options: ["Awaiting approval", "Confirmed", "In transit", "Received", "On hold"] }}
            onRow={(p) => setOpen(p.no)}
            columns={[
              { key: "no", label: "PO", render: (p) => <span className="font-mono text-[12.5px] font-medium">{p.no}</span>, sort: (p) => p.no },
              { key: "pr", label: "Principal", render: (p) => p.principal.split(",")[0], sort: (p) => p.principal },
              { key: "sku", label: "SKU", render: (p) => <span><b className="font-mono">{skus[p.sku - 1].sym}</b> <span className="text-d-mute">× {p.qty}</span></span> },
              { key: "amt", label: "Amount", align: "right", render: (p) => <span className="tnum font-mono">{inr(p.amount)}</span>, sort: (p) => p.amount },
              { key: "eta", label: "ETA", render: (p) => <span className="font-mono text-[12px]">{p.eta}</span>, wide: true },
              { key: "st", label: "Status", render: (p) => <Pill tone={poTone[p.status]}>{p.status}</Pill> },
            ]}
          />
        </Panel>
        <div className="space-y-5">
          <Panel title="Spend by principal" sub="This list of POs">
            <Donut center={inr(spend.reduce((a, s) => a + s.value, 0), { compact: true })} sub="POs" size={140} segments={spend.map((s) => ({ ...s, tone: s.tone }))} />
          </Panel>
          <Panel title="Lead time, days" sub="PO to GRN, last 90 days">
            <HBars data={[{ label: "Kesar Solvents", value: 4.2, tone: "ok" }, { label: "Vasudha Fine Chem", value: 5.1, tone: "ok" }, { label: "Nilkanth Reagents", value: 6.0, tone: "info" }, { label: "Indus Analytical", value: 7.8, tone: "warn" }, { label: "Spectra Standards", value: 11.3, tone: "late" }]} format={(v) => `${v} d`} />
          </Panel>
        </div>
      </div>
      <Sheet
        open={!!po}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={po ? `${po.no} · raised ${po.raised}` : ""}
        title={po ? `${po.qty} × ${skus[po.sku - 1].sym} ${skus[po.sku - 1].pack}` : ""}
        sub={po ? `${po.principal} · ${inr(po.amount)} + GST` : ""}
        footer={
          po && (
            <>
              <Btn icon={MessageCircle} onClick={() => { toast.success("Chased on WhatsApp", { description: po.principal }); desk.log(`${po.no} chased with ${po.principal.split(",")[0]}`); }}>
                Chase principal
              </Btn>
              {po.status !== "Received" && (
                <Btn
                  variant="solid"
                  icon={PackagePlus}
                  onClick={() => {
                    setStatus(po.no, "Received");
                    toast.success(`${po.no} received`, { description: `${po.qty} packs added to ${skus[po.sku - 1].sym}. GRN posted to Tally.` });
                    desk.log(`GRN for ${po.no}: +${po.qty} × ${skus[po.sku - 1].sym}`, "ok");
                  }}
                >
                  Mark received
                </Btn>
              )}
            </>
          )
        }
      >
        {po && (
          <div className="space-y-5">
            <KV items={[{ k: "Status", v: <Pill tone={poTone[po.status]}>{po.status}</Pill> }, { k: "ETA", v: po.eta }, { k: "Rate", v: `${inr(Math.round(po.amount / po.qty))} / pack` }, { k: "GST", v: inr(Math.round(po.amount * 0.18)) }, { k: "Note", v: po.note }, { k: "Stock now", v: `${skus[po.sku - 1].stock} (min ${skus[po.sku - 1].min})` }]} />
            {po.sku === 9 && po.status !== "Received" && (
              <p className="flex gap-2 rounded-[10px] bg-[color-mix(in_oklab,var(--d-late)_10%,transparent)] px-3 py-2 text-[13px]">
                <Flame className="mt-0.5 h-4 w-4 shrink-0 text-d-late" /> 300 L of Class A in one delivery, plus the MeOH in transit, takes the solvent store to 1,219 L against a 1,200 L PESO licence. Ask Kesar for 60 + 60.
              </p>
            )}
            <Checklist
              items={[
                { id: "1", label: "PO acknowledged by principal", done: po.status !== "Awaiting approval" },
                { id: "2", label: "CoA received for the lot", done: po.status === "In transit" || po.status === "Received" },
                { id: "3", label: "LR / transporter details", done: po.status === "In transit" || po.status === "Received" },
                { id: "4", label: "GRN and lot scan", done: po.status === "Received" },
              ]}
              onToggle={() => toast("Updated")}
            />
          </div>
        )}
      </Sheet>
      <Modal open={adding} onOpenChange={setAdding} title="New principal PO" sub="Goes to approval first. The principal and rate come from the SKU.">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const s = skus[Number(skuPick) - 1];
            const p = onRaise(s, Number(qty) || 1);
            toast.success(`${p.no} created`, { description: `${qty} × ${s.sym} · ${inr(p.amount)} · waiting for approval` });
            desk.log(`${p.no} created for ${qty} × ${s.sym}`, "info");
            setAdding(false);
          }}
        >
          <Field label="SKU">
            <select className={inputClass} value={skuPick} onChange={(e) => setSkuPick(e.target.value)}>
              {skus.map((s) => (
                <option key={s.idx} value={s.idx}>
                  {s.sym} · {s.name} · {s.grade} {s.pack} (stock {s.stock})
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Packs">
              <input className={inputClass} inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))} />
            </Field>
            <Field label="Principal">
              <input className={inputClass} readOnly value={skus[Number(skuPick) - 1]?.principal.split(",")[0] ?? ""} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn onClick={() => setAdding(false)}>Cancel</Btn>
            <Btn variant="solid" type="submit" icon={Plus}>
              Create PO
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ---------------- Dues ---------------- */

function DuesTab() {
  const desk = useDesk();
  const [open, setOpen] = React.useState<Invoice | null>(null);
  const [sent, setSent] = React.useState<Set<string>>(new Set());
  const [holds, setHolds] = React.useState<Record<string, boolean>>({ "Silvassa Agro Chem": true });
  const total = invoices.reduce((a, i) => a + i.amount, 0);
  const over = (i: Invoice) => i.days - i.terms;
  const bucket = (i: Invoice) => (over(i) <= 0 ? "Within terms" : over(i) <= 30 ? "1–30 over" : over(i) <= 60 ? "31–60 over" : "60+ over");
  const buckets = ["Within terms", "1–30 over", "31–60 over", "60+ over"].map((label, i) => ({ label, value: invoices.filter((x) => bucket(x) === label).reduce((a, x) => a + x.amount, 0), tone: (["ok", "info", "warn", "late"] as const)[i] }));
  const labs = Array.from(new Set(invoices.filter((i) => over(i) > 15).map((i) => i.lab)));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Outstanding" value={inr(total, { compact: true })} delta="-6%" deltaGood={false} hint="vs last month" icon={IndianRupee} trend={[17.2, 16.4, 16.9, 15.8, 15.3, 15.1, 14.7]} tone="warn" />
        <Stat label="Past terms" value={inr(invoices.filter((i) => over(i) > 0).reduce((a, i) => a + i.amount, 0), { compact: true })} hint={`${invoices.filter((i) => over(i) > 0).length} invoices`} icon={AlertTriangle} tone="late" />
        <Stat label="Promised this week" value="₹4.3 L" hint="Damanganga RTGS, Panoli cheque" icon={CalendarClock} tone="ok" />
        <Stat label="Days sales outstanding" value="47" delta="+3" deltaGood={false} hint="terms average 40" icon={Timer} />
      </div>
      <Panel title="Ageing past terms" sub="From Tally. Reminders go out at 5 PM unless you stop them.">
        <AgingBar buckets={buckets} format={(v) => inr(v, { compact: true })} />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Panel title="Invoices" sub="Select rows to send WhatsApp reminders together">
          <DataTable
            rows={invoices}
            rowKey={(i) => i.no}
            search={(i) => `${i.no} ${i.lab}`}
            searchPlaceholder="Search invoice or lab"
            filter={{ get: bucket, options: ["Within terms", "1–30 over", "31–60 over", "60+ over"] }}
            onRow={setOpen}
            bulk={[{ label: "Send WhatsApp reminders", run: (k) => { setSent((s) => new Set([...s, ...k])); toast.success(`${k.length} reminders sent`); desk.log(`${k.length} dues reminders sent on WhatsApp`); } }]}
            columns={[
              { key: "no", label: "Invoice", render: (i) => <span className="font-mono text-[12px]">{i.no}</span> },
              { key: "lab", label: "Lab", render: (i) => <span className="font-medium">{i.lab}</span>, sort: (i) => i.lab },
              { key: "amt", label: "Amount", align: "right", render: (i) => <span className="tnum font-mono">{inr(i.amount)}</span>, sort: (i) => i.amount },
              { key: "days", label: "Days / terms", align: "right", render: (i) => <span className="tnum font-mono" style={{ color: over(i) > 30 ? "var(--d-late)" : over(i) > 0 ? "var(--d-warn)" : undefined }}>{i.days} / {i.terms}</span>, sort: (i) => over(i) },
              { key: "pr", label: "Promise", render: (i) => (sent.has(i.no) ? <Pill tone="info">Reminded</Pill> : i.promise ? <Pill tone="ok">{i.promise}</Pill> : <span className="text-d-mute">—</span>), wide: true },
            ]}
          />
        </Panel>
        <div className="space-y-5">
          <Panel icon={Ban} title="Dispatch holds" sub="Labs more than 15 days past terms">
            <ul className="space-y-2">
              {labs.map((l) => (
                <li key={l} className="flex items-center gap-2 rounded-[10px] border border-d-line px-3 py-2">
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{l}</span>
                  <Segmented
                    size="sm"
                    options={[
                      { value: "ship", label: "Ship" },
                      { value: "hold", label: "Hold" },
                    ]}
                    value={holds[l] ? "hold" : "ship"}
                    onChange={(v) => {
                      setHolds((h) => ({ ...h, [l]: v === "hold" }));
                      toast(v === "hold" ? `Dispatch on hold: ${l}` : `Dispatch released: ${l}`);
                      desk.log(`${l}: dispatch ${v === "hold" ? "held" : "released"}`, v === "hold" ? "warn" : "ok");
                    }}
                  />
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Collections forecast" sub="Promises plus each lab's usual habit">
            <Bars height={170} format={(v) => `₹${v}L`} data={[{ label: "This wk", value: 4.3, tone: "ok" }, { label: "Next wk", value: 3.6, tone: "accent" }, { label: "Wk 3", value: 2.9, tone: "accent" }, { label: "Wk 4", value: 2.2, tone: "info" }, { label: "Later", value: 1.7, tone: "late" }]} />
          </Panel>
        </div>
      </div>
      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={open?.no}
        title={open?.lab ?? ""}
        sub={open ? `${inr(open.amount)} · ${open.days} days · ${open.terms}-day terms` : ""}
        footer={
          <Btn
            variant="solid"
            icon={MessageCircle}
            onClick={() => {
              if (!open) return;
              setSent((s) => new Set(s).add(open.no));
              toast.success("Reminder sent on WhatsApp", { description: open.lab });
              desk.log(`Reminder sent to ${open.lab} for ${inr(open.amount)}`);
              setOpen(null);
            }}
          >
            Send on WhatsApp
          </Btn>
        }
      >
        {open && (
          <div className="space-y-4">
            <div className="rounded-[14px] bg-[#e7f6e9] p-4 text-[13.5px] leading-relaxed text-[#1d3b22]">
              Namaste, a gentle reminder from Narmada Lab Supply, Vapi. Invoice {open.no} for {inr(open.amount)}, raised on {open.raised}, is {open.days} days old against {open.terms}-day terms. Bank and UPI details below. Thank you for trusting us with your QC lab. — Komal, Accounts
            </div>
            <KV items={[{ k: "Raised", v: open.raised }, { k: "Terms", v: `${open.terms} days` }, { k: "Promise", v: open.promise ?? "None" }, { k: "Dispatch", v: holds[open.lab] ? <span className="text-d-late">On hold</span> : "Open" }]} />
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Payment habit, last 6 invoices (days to pay)</p>
              <Bars height={90} data={[38, 44, 41, 52, 47, open.days].map((v, i) => ({ label: i === 5 ? "Now" : `#${i + 1}`, value: v, tone: v > open.terms ? "warn" : "ok" }))} />
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
