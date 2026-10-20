"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Anchor,
  AlertTriangle,
  ArrowRight,
  Bot,
  CalendarClock,
  CheckCheck,
  FileCheck2,
  FlaskConical,
  Gavel,
  Gauge as GaugeIcon,
  IndianRupee,
  Landmark,
  Leaf,
  Mail,
  MessageCircle,
  Plug,
  Plus,
  Receipt,
  RotateCcw,
  ScrollText,
  Send,
  Ship,
  Timer,
  TrendingUp,
  Users,
} from "lucide-react";
import { DeskShell, useDesk } from "../shell";
import { AreaChart, Bars, Donut, HBars } from "../charts";
import { AgingBar, ApprovalQueue, Board, Checklist, Countdown, DataTable, Gantt, type GanttRow } from "../data";
import { AgentsModule, ConnectionsModule, IndependenceModule, PeopleModule } from "../common";
import { Btn, Field, inputClass, inr, KV, Meter, Modal, Panel, Pill, Segmented, Sheet, Stat } from "../ui";
import { useDrift } from "../hooks";
import type { DeskConfig, DeskModule, IndependenceData, Integration, TeamMember, Tone, WorkforceAgent } from "../types";

/* ============================================================
   Data — Malabar Spice House, Kochi. Fictional spice exporter.
   Cardamom, black pepper, turmeric and chilli to the Gulf, Europe,
   the US and Malaysia. Today = Tue 20 Oct 2026. USD/INR ≈ 84.1.
   ============================================================ */

const FX = 84.1;
const usd = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;
const usdK = (v: number) => (v >= 1e6 ? `$${(v / 1e6).toFixed(2)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(1)}k` : `$${Math.round(v)}`);

/* ---------------- Sea map geometry ---------------- */

type Pt = [number, number];
type PortId = "JEA" | "JED" | "RTM" | "HAM" | "SAV" | "PKG";
type Region = "Gulf" | "Europe" | "Americas" | "Asia";

const KOCHI: Pt = [617, 334];
const GULF_OF_ADEN: Pt[] = [KOCHI, [566, 322], [510, 314], [490, 300], [480, 270], [468, 238]];
const SUEZ_TO_GIB: Pt[] = [...GULF_OF_ADEN, [456, 200], [452, 174], [420, 164], [360, 160], [310, 164], [284, 170]];
const NORTH_SEA: Pt[] = [...SUEZ_TO_GIB, [244, 148], [226, 90], [224, 40], [250, 10], [300, 8], [314, 28]];

const ROUTES: Record<PortId, Pt[]> = {
  JEA: [KOCHI, [596, 300], [580, 262], [575, 231]],
  JED: [...GULF_OF_ADEN, [471, 222]],
  RTM: [...NORTH_SEA, [306, 44], [303, 58]],
  HAM: [...NORTH_SEA, [326, 44], [338, 60]],
  SAV: [...SUEZ_TO_GIB, [250, 182], [190, 196], [134, 200]],
  PKG: [KOCHI, [628, 368], [668, 386], [720, 380], [760, 362], [779, 350]],
};

const ports: Record<PortId, { name: string; country: string; region: Region; code: string; dwell: string }> = {
  JEA: { name: "Jebel Ali", country: "UAE", region: "Gulf", code: "AEJEA", dwell: "Dubai Municipality sampling 2–4 days" },
  JED: { name: "Jeddah", country: "Saudi Arabia", region: "Gulf", code: "SAJED", dwell: "SFDA lab release 3–5 days" },
  RTM: { name: "Rotterdam", country: "Netherlands", region: "Europe", code: "NLRTM", dwell: "NVWA checks on 10% of pepper lots" },
  HAM: { name: "Hamburg", country: "Germany", region: "Europe", code: "DEHAM", dwell: "Port health, ETO spot checks" },
  SAV: { name: "Savannah", country: "USA", region: "Americas", code: "USSAV", dwell: "FDA prior notice, 1-in-12 sampling" },
  PKG: { name: "Port Klang", country: "Malaysia", region: "Asia", code: "MYPKG", dwell: "MAQIS clearance in 24 h" },
};

/** Catmull-Rom sampled into a dense polyline so markers sit exactly on the drawn curve. */
function densify(pts: Pt[], per = 14): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    for (let k = 0; k < per; k++) {
      const t = k / per;
      const u = 1 - t;
      out.push([
        u * u * u * p1[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p2[0],
        u * u * u * p1[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p2[1],
      ]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

const DENSE: Record<PortId, { pts: Pt[]; cum: number[] }> = Object.fromEntries(
  (Object.keys(ROUTES) as PortId[]).map((id) => {
    const pts = densify(ROUTES[id]);
    const cum = pts.map(() => 0);
    pts.forEach((p, i) => {
      if (i) cum[i] = cum[i - 1] + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]);
    });
    return [id, { pts, cum }];
  }),
) as Record<PortId, { pts: Pt[]; cum: number[] }>;

function pathD(pts: Pt[]) {
  return pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
}

const r2 = (v: number) => Math.round(v * 100) / 100;
function along(port: PortId, t: number) {
  const { pts, cum } = DENSE[port];
  const total = cum[cum.length - 1];
  const want = Math.max(0, Math.min(1, t)) * total;
  const i = Math.max(1, cum.findIndex((c) => c >= want));
  const a = pts[i - 1];
  const b = pts[i] ?? a;
  const seg = cum[i] - cum[i - 1] || 1;
  const f = (want - cum[i - 1]) / seg;
  const x = r2(a[0] + (b[0] - a[0]) * f);
  const y = r2(a[1] + (b[1] - a[1]) * f);
  return { x, y, angle: r2((Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI), trail: [...pts.slice(0, i), [x, y] as Pt] };
}

const LAND = [
  "0,36 150,28 176,118 136,168 128,214 92,266 66,330 36,420 0,470",
  "240,30 300,24 300,70 330,74 360,40 430,28 478,72 458,126 404,142 344,146 300,156 268,134 282,98",
  "292,192 382,184 436,194 456,238 482,292 470,362 432,440 384,470 352,420 332,332 292,262",
  "468,168 528,168 568,204 576,246 536,282 496,296 478,236",
  "582,188 684,178 704,228 664,282 644,338 626,352 604,292 588,240",
  "732,198 862,188 902,248 862,292 822,332 794,372 772,334 752,282",
  "812,432 902,420 952,468 904,510 826,506",
  "540,60 640,40 760,50 860,90 840,150 720,170 600,160 520,120",
];

/* ---------------- Shipments ---------------- */

type ShipStatus = "Loading" | "At sea" | "Transshipment" | "Arriving" | "Customs hold" | "Delivered";
type Shipment = {
  id: string;
  vessel: string;
  voyage: string;
  product: string;
  grade: string;
  mt: number;
  usd: number;
  buyer: string;
  port: PortId;
  container: string;
  seal: string;
  bl: string;
  lc: string;
  incoterm: "FOB Kochi" | "CIF" | "CFR";
  etd: string;
  etaDays: number;
  progress: number;
  status: ShipStatus;
  risk?: string;
  tag?: "up" | "down";
};

const seedShipments: Shipment[] = [
  { id: "MSH-2611", vessel: "MV Arabian Lark", voyage: "042W", product: "Cardamom", grade: "8 mm bold AGEB", mt: 6, usd: 174600, buyer: "Al Noor Foodstuff Trading LLC", port: "JEA", container: "TGHU 482193-1", seal: "MSH 77120", bl: "SBL/COK/JEA/88214", lc: "LC 0457/ENBD", incoterm: "CFR", etd: "13 Oct", etaDays: 3, progress: 0.64, status: "At sea" },
  { id: "MSH-2604", vessel: "MV Nordic Clove", voyage: "118E", product: "Black pepper", grade: "MG1 550 GL", mt: 18, usd: 136800, buyer: "Van der Berg Specerijen BV", port: "RTM", container: "MSKU 702264-8", seal: "MSH 77098", bl: "SBL/COK/RTM/88190", lc: "LC 2291/ABN", incoterm: "CIF", etd: "2 Oct", etaDays: 12, progress: 0.52, status: "At sea" },
  { id: "MSH-2598", vessel: "MV Hanse Meridian", voyage: "067W", product: "Turmeric", grade: "Alleppey finger, 5% curcumin", mt: 24, usd: 62400, buyer: "Hanseatic Gewürz GmbH", port: "HAM", container: "CMAU 315540-2", seal: "MSH 77041", bl: "SBL/COK/HAM/88152", lc: "CAD via Commerzbank", incoterm: "CIF", etd: "24 Sep", etaDays: 6, progress: 0.79, status: "At sea" },
  { id: "MSH-2615", vessel: "MV Savannah Bay", voyage: "009A", product: "Red chilli", grade: "Teja S17 stemless", mt: 14, usd: 43400, buyer: "Coastal Spice Importers Inc", port: "SAV", container: "OOLU 640012-5", seal: "MSH 77134", bl: "SBL/COK/SAV/88231", lc: "LC 7718/TRU", incoterm: "CFR", etd: "16 Oct", etaDays: 27, progress: 0.14, status: "Transshipment", risk: "Rolled at Colombo, next feeder 22 Oct", tag: "up" },
  { id: "MSH-2617", vessel: "MV Straits Lumen", voyage: "201S", product: "Black pepper", grade: "500 GL ASTA", mt: 12, usd: 86400, buyer: "Sinar Rempah Sdn Bhd", port: "PKG", container: "WHLU 228871-0", seal: "MSH 77140", bl: "SBL/COK/PKG/88240", lc: "Advance 30% + CAD", incoterm: "FOB Kochi", etd: "15 Oct", etaDays: 4, progress: 0.46, status: "At sea" },
  { id: "MSH-2620", vessel: "MV Red Sea Pilgrim", voyage: "033N", product: "Cardamom", grade: "7 mm green", mt: 4, usd: 104000, buyer: "Al Rawabi Spices Co", port: "JED", container: "TGHU 482650-4", seal: "MSH 77151", bl: "SBL/COK/JED/88252", lc: "LC 1180/SNB", incoterm: "CFR", etd: "17 Oct", etaDays: 8, progress: 0.18, status: "At sea", risk: "Lot L-2620-A over chlorpyrifos limit" },
  { id: "MSH-2601", vessel: "MV Nordic Saffron", voyage: "116E", product: "Turmeric powder", grade: "Steam sterilised, ETO-free", mt: 16, usd: 49600, buyer: "Van der Berg Specerijen BV", port: "RTM", container: "MSKU 699013-3", seal: "MSH 77022", bl: "SBL/COK/RTM/88131", lc: "LC 2274/ABN", incoterm: "CIF", etd: "19 Sep", etaDays: 2, progress: 0.93, status: "Arriving", risk: "ETO-free certificate still a scan, original couriered" },
  { id: "MSH-2622", vessel: "MV Atlantic Pepper", voyage: "011A", product: "Black pepper", grade: "MG1 ASTA cleaned", mt: 18, usd: 140400, buyer: "Coastal Spice Importers Inc", port: "SAV", container: "OOLU 641107-9", seal: "—", bl: "Draft", lc: "LC 7731/TRU", incoterm: "CFR", etd: "23 Oct", etaDays: 34, progress: 0, status: "Loading" },
  { id: "MSH-2609", vessel: "MV Gulf Cinnamon", voyage: "039W", product: "Chilli powder", grade: "Byadgi blend, 80 ASTA", mt: 10, usd: 38200, buyer: "Al Noor Foodstuff Trading LLC", port: "JEA", container: "TGHU 481120-7", seal: "MSH 77066", bl: "SBL/COK/JEA/88177", lc: "DA 60 days", incoterm: "CFR", etd: "3 Oct", etaDays: 0, progress: 1, status: "Customs hold", risk: "Dubai Municipality pulled a Sudan-dye sample" },
  { id: "MSH-2613", vessel: "MV Hanse Coriander", voyage: "070W", product: "Cardamom", grade: "8 mm bold", mt: 5, usd: 145500, buyer: "Hanseatic Gewürz GmbH", port: "HAM", container: "CMAU 316022-6", seal: "MSH 77127", bl: "SBL/COK/HAM/88207", lc: "LC 5520/CBK", incoterm: "CIF", etd: "9 Oct", etaDays: 17, progress: 0.33, status: "At sea" },
];

const statusTone: Record<ShipStatus, Tone> = { Loading: "neutral", "At sea": "accent", Transshipment: "warn", Arriving: "info", "Customs hold": "late", Delivered: "ok" };

/* ---------------- Contracts & LC ---------------- */

type Contract = {
  no: string;
  buyer: string;
  product: string;
  mt: number;
  price: number;
  terms: string;
  lc: string;
  bank: string;
  lcDay: number;
  from: number;
  to: number;
  status: "LC received" | "LC awaited" | "Amendment asked" | "Shipped" | "Docs at bank";
  shipment?: string;
  note: string;
};

/** Gantt x-axis: day 0 = 13 Oct, today = day 7. */
const CTODAY = 7;
const contracts: Contract[] = [
  { no: "MSH/C/26-118", buyer: "Coastal Spice Importers Inc", product: "Pepper MG1 ASTA", mt: 18, price: 7800, terms: "LC at sight", lc: "LC 7731/TRU", bank: "Truist, Atlanta", lcDay: 12, from: 6, to: 11, status: "Amendment asked", shipment: "MSH-2622", note: "LC says 'shipment from Cochin'; BL will say 'Kochi (INCOK1)'. Amendment asked 16 Oct." },
  { no: "MSH/C/26-121", buyer: "Al Rawabi Spices Co", product: "Cardamom 7 mm", mt: 4, price: 26000, terms: "LC at sight", lc: "LC 1180/SNB", bank: "Saudi National Bank", lcDay: 15, from: 2, to: 8, status: "Shipped", shipment: "MSH-2620", note: "Presentation due within 21 days of BL, by 7 Nov." },
  { no: "MSH/C/26-124", buyer: "Van der Berg Specerijen BV", product: "Pepper MG1 550 GL", mt: 36, price: 7600, terms: "LC 30 days", lc: "LC 2302/ABN", bank: "ABN AMRO, Rotterdam", lcDay: 31, from: 18, to: 28, status: "LC received", note: "Second of three lifts. EU MRL certificate per lot is a document condition." },
  { no: "MSH/C/26-125", buyer: "Hanseatic Gewürz GmbH", product: "Turmeric finger", mt: 48, price: 2600, terms: "CAD", lc: "—", bank: "Commerzbank, Hamburg", lcDay: 40, from: 22, to: 36, status: "LC awaited", note: "Buyer wants steam-sterilised; price revision of $120/MT under discussion." },
  { no: "MSH/C/26-119", buyer: "Al Noor Foodstuff Trading LLC", product: "Cardamom 8 mm AGEB", mt: 6, price: 29100, terms: "LC at sight", lc: "LC 0462/ENBD", bank: "Emirates NBD, Dubai", lcDay: 10, from: 4, to: 9, status: "LC received", note: "Ramadan-season stock. Buyer wants loading photos on WhatsApp." },
  { no: "MSH/C/26-126", buyer: "Sinar Rempah Sdn Bhd", product: "Pepper 500 GL", mt: 24, price: 7200, terms: "Advance 30% + CAD", lc: "—", bank: "Maybank, Klang", lcDay: 44, from: 25, to: 38, status: "LC awaited", note: "Advance of $51,840 not yet received; do not book space." },
  { no: "MSH/C/26-127", buyer: "Coastal Spice Importers Inc", product: "Chilli Teja S17", mt: 28, price: 3100, terms: "LC 60 days", lc: "LC 7744/TRU", bank: "Truist, Atlanta", lcDay: 52, from: 32, to: 45, status: "LC received", note: "Aflatoxin B1 under 5 µg/kg is a document condition (lab certificate)." },
  { no: "MSH/C/26-112", buyer: "Van der Berg Specerijen BV", product: "Turmeric powder ETO-free", mt: 16, price: 3100, terms: "LC 30 days", lc: "LC 2274/ABN", bank: "ABN AMRO, Rotterdam", lcDay: 9, from: -10, to: -3, status: "Docs at bank", shipment: "MSH-2601", note: "Docs presented 8 Oct. Bank flagged one discrepancy: ETO certificate dated after BL." },
  { no: "MSH/C/26-129", buyer: "Al Rawabi Spices Co", product: "Cardamom 8 mm", mt: 6, price: 28800, terms: "LC at sight", lc: "LC 1194/SNB", bank: "Saudi National Bank", lcDay: 38, from: 27, to: 34, status: "LC received", note: "Repeat order. SFDA wants chlorpyrifos under 0.05 mg/kg on every lot." },
  { no: "MSH/C/26-130", buyer: "Hanseatic Gewürz GmbH", product: "Cardamom 8 mm bold", mt: 5, price: 29400, terms: "LC at sight", lc: "LC 5531/CBK", bank: "Commerzbank, Hamburg", lcDay: 47, from: 30, to: 42, status: "LC received", note: "Christmas baking season; must land Hamburg by 5 Dec." },
  { no: "MSH/C/26-131", buyer: "Al Noor Foodstuff Trading LLC", product: "Chilli powder 80 ASTA", mt: 12, price: 3850, terms: "DA 60 days", lc: "—", bank: "Emirates NBD, Dubai", lcDay: 50, from: 35, to: 48, status: "LC awaited", note: "On hold until the Sudan-dye sample on MSH-2609 clears." },
  { no: "MSH/C/26-114", buyer: "Hanseatic Gewürz GmbH", product: "Cardamom 8 mm bold", mt: 5, price: 29100, terms: "LC at sight", lc: "LC 5520/CBK", bank: "Commerzbank, Hamburg", lcDay: 19, from: -6, to: 1, status: "Shipped", shipment: "MSH-2613", note: "Docs to bank by 30 Oct." },
];

const contractTone: Record<Contract["status"], Tone> = { "LC received": "ok", "LC awaited": "warn", "Amendment asked": "late", Shipped: "info", "Docs at bank": "accent" };

/* ---------------- Lab ---------------- */

type Param = "ETO" | "Chlorpyrifos" | "Aflatoxin B1" | "Total aflatoxin" | "Ochratoxin A" | "Sudan I–IV" | "Moisture";
const LIMITS: Record<Param, { limit: number; unit: string }> = {
  ETO: { limit: 0.1, unit: "mg/kg" },
  Chlorpyrifos: { limit: 0.05, unit: "mg/kg" },
  "Aflatoxin B1": { limit: 5, unit: "µg/kg" },
  "Total aflatoxin": { limit: 10, unit: "µg/kg" },
  "Ochratoxin A": { limit: 15, unit: "µg/kg" },
  "Sudan I–IV": { limit: 0.5, unit: "mg/kg" },
  Moisture: { limit: 12, unit: "%" },
};

type Lot = { id: string; product: string; shipment: string; market: string; lab: string; sampled: string; values: Partial<Record<Param, number>>; retesting?: boolean; released?: boolean };

const seedLots: Lot[] = [
  { id: "L-2611-A", product: "Cardamom 8 mm", shipment: "MSH-2611", market: "UAE", lab: "Periyar Analytical, Kakkanad", sampled: "9 Oct", values: { ETO: 0.02, Chlorpyrifos: 0.031, "Aflatoxin B1": 0.4, Moisture: 10.8 } },
  { id: "L-2604-B", product: "Pepper MG1", shipment: "MSH-2604", market: "EU", lab: "Periyar Analytical, Kakkanad", sampled: "26 Sep", values: { Chlorpyrifos: 0.042, "Aflatoxin B1": 1.2, "Ochratoxin A": 4.1, Moisture: 11.2 } },
  { id: "L-2598-A", product: "Turmeric finger", shipment: "MSH-2598", market: "EU", lab: "Spices Board QEL, Kochi", sampled: "18 Sep", values: { ETO: 0.008, Chlorpyrifos: 0.018, "Aflatoxin B1": 2.1, "Total aflatoxin": 3.4, "Sudan I–IV": 0 } },
  { id: "L-2601-C", product: "Turmeric powder", shipment: "MSH-2601", market: "EU", lab: "Spices Board QEL, Kochi", sampled: "12 Sep", values: { ETO: 0.14, "Aflatoxin B1": 1.8, "Sudan I–IV": 0, Moisture: 9.6 } },
  { id: "L-2615-A", product: "Chilli Teja", shipment: "MSH-2615", market: "US", lab: "Periyar Analytical, Kakkanad", sampled: "10 Oct", values: { "Aflatoxin B1": 4.6, "Ochratoxin A": 12.8, "Sudan I–IV": 0, Moisture: 10.9 } },
  { id: "L-2622-A", product: "Pepper MG1 ASTA", shipment: "MSH-2622", market: "US", lab: "Periyar Analytical, Kakkanad", sampled: "16 Oct", values: { Chlorpyrifos: 0.012, "Aflatoxin B1": 0.9, Moisture: 11.4 } },
  { id: "L-2617-A", product: "Pepper 500 GL", shipment: "MSH-2617", market: "Malaysia", lab: "Spices Board QEL, Kochi", sampled: "8 Oct", values: { Chlorpyrifos: 0.02, "Aflatoxin B1": 1.1, Moisture: 11.0 } },
  { id: "L-2620-A", product: "Cardamom 7 mm", shipment: "MSH-2620", market: "Saudi", lab: "Periyar Analytical, Kakkanad", sampled: "11 Oct", values: { Chlorpyrifos: 0.071, ETO: 0.01, Moisture: 10.4 } },
  { id: "L-2613-A", product: "Cardamom 8 mm bold", shipment: "MSH-2613", market: "EU", lab: "Periyar Analytical, Kakkanad", sampled: "2 Oct", values: { Chlorpyrifos: 0.046, ETO: 0.03, Moisture: 10.7 } },
  { id: "L-2609-A", product: "Chilli powder", shipment: "MSH-2609", market: "UAE", lab: "Spices Board QEL, Kochi", sampled: "28 Sep", values: { "Sudan I–IV": 0, "Aflatoxin B1": 3.1, "Ochratoxin A": 9.2 } },
  { id: "L-2627-A", product: "Pepper MG1", shipment: "C/26-124", market: "EU", lab: "Periyar Analytical, Kakkanad", sampled: "17 Oct", values: { Chlorpyrifos: 0.022, "Aflatoxin B1": 1.4, Moisture: 12.6 } },
  { id: "L-2628-A", product: "Cardamom 8 mm", shipment: "C/26-129", market: "Saudi", lab: "Periyar Analytical, Kakkanad", sampled: "18 Oct", values: { Chlorpyrifos: 0.028, ETO: 0.01, Moisture: 10.2 } },
  { id: "L-2629-A", product: "Chilli Teja S17", shipment: "C/26-127", market: "US", lab: "Spices Board QEL, Kochi", sampled: "18 Oct", values: { "Aflatoxin B1": 5.8, "Ochratoxin A": 11.4, "Sudan I–IV": 0 } },
  { id: "L-2630-A", product: "Turmeric finger", shipment: "C/26-125", market: "EU", lab: "Spices Board QEL, Kochi", sampled: "19 Oct", values: { ETO: 0.01, Chlorpyrifos: 0.015, "Aflatoxin B1": 2.6, "Total aflatoxin": 4.2 } },
];

/** Share of the limit used. Moisture is a spec band (9–12%), not a residue, so it is scaled within the band. */
function ratioOf(p: Param, v: number) {
  const { limit } = LIMITS[p];
  if (p === "Moisture") return v <= limit ? (Math.max(0, v - 9) / (limit - 9)) * 0.75 : v / limit;
  return v / limit;
}
function worst(lot: Lot) {
  let top: { p: Param; ratio: number } = { p: "Moisture", ratio: 0 };
  (Object.keys(lot.values) as Param[]).forEach((p) => {
    const r = ratioOf(p, lot.values[p] ?? 0);
    if (r > top.ratio) top = { p, ratio: r };
  });
  return top;
}
function verdict(lot: Lot): "Pass" | "Watch" | "Fail" | "Re-testing" {
  if (lot.retesting) return "Re-testing";
  const r = worst(lot).ratio;
  return r > 1 ? "Fail" : r > 0.8 ? "Watch" : "Pass";
}
const verdictTone = { Pass: "ok", Watch: "warn", Fail: "late", "Re-testing": "info" } as const;

/* ---------------- Procurement ---------------- */

type Auction = { id: string; date: string; centre: "Puttady" | "Bodinayakanur"; auctioneer: string; lots: number; arrived: number; sold: number; avg: number; max: number; ours: number };
const auctions: Auction[] = [
  { id: "A-1020-1", date: "20 Oct", centre: "Bodinayakanur", auctioneer: "Cumbum Valley Traders", lots: 214, arrived: 68420, sold: 65110, avg: 2486, max: 3112, ours: 1850 },
  { id: "A-1020-2", date: "20 Oct", centre: "Puttady", auctioneer: "Idukki Cardamom Growers Co-op", lots: 188, arrived: 59200, sold: 57900, avg: 2512, max: 3040, ours: 0 },
  { id: "A-1019-1", date: "19 Oct", centre: "Puttady", auctioneer: "Sahyadri Spice Auctions", lots: 241, arrived: 77130, sold: 74420, avg: 2470, max: 2988, ours: 2400 },
  { id: "A-1019-2", date: "19 Oct", centre: "Bodinayakanur", auctioneer: "Highrange Cardamom Exchange", lots: 176, arrived: 54880, sold: 52300, avg: 2455, max: 2960, ours: 1200 },
  { id: "A-1018-1", date: "18 Oct", centre: "Puttady", auctioneer: "Vandanmedu Planters Mktg", lots: 229, arrived: 73600, sold: 70120, avg: 2441, max: 3015, ours: 0 },
  { id: "A-1017-1", date: "17 Oct", centre: "Bodinayakanur", auctioneer: "Cumbum Valley Traders", lots: 198, arrived: 62300, sold: 59870, avg: 2428, max: 2940, ours: 2100 },
  { id: "A-1017-2", date: "17 Oct", centre: "Puttady", auctioneer: "Periyar Planters Mktg", lots: 205, arrived: 66010, sold: 63100, avg: 2435, max: 2902, ours: 0 },
  { id: "A-1016-1", date: "16 Oct", centre: "Puttady", auctioneer: "Idukki Cardamom Growers Co-op", lots: 236, arrived: 75420, sold: 71900, avg: 2402, max: 2875, ours: 3000 },
  { id: "A-1015-1", date: "15 Oct", centre: "Bodinayakanur", auctioneer: "Sahyadri Spice Auctions", lots: 182, arrived: 58100, sold: 55020, avg: 2398, max: 2860, ours: 0 },
  { id: "A-1014-1", date: "14 Oct", centre: "Puttady", auctioneer: "Highrange Cardamom Exchange", lots: 219, arrived: 70240, sold: 67400, avg: 2386, max: 2831, ours: 1600 },
  { id: "A-1013-1", date: "13 Oct", centre: "Bodinayakanur", auctioneer: "Vandanmedu Planters Mktg", lots: 193, arrived: 61770, sold: 58800, avg: 2372, max: 2810, ours: 0 },
  { id: "A-1012-1", date: "12 Oct", centre: "Puttady", auctioneer: "Periyar Planters Mktg", lots: 224, arrived: 71500, sold: 68330, avg: 2361, max: 2795, ours: 2200 },
];

type Rate = { id: string; name: string; market: string; unit: string; now: number; trend: number[] };
const rates: Rate[] = [
  { id: "card", name: "Cardamom, auction avg", market: "Puttady / Bodi", unit: "₹/kg", now: 2486, trend: [2318, 2330, 2361, 2372, 2386, 2398, 2402, 2428, 2435, 2441, 2455, 2470, 2479, 2486] },
  { id: "ung", name: "Pepper ungarbled", market: "Kochi terminal", unit: "₹/qtl", now: 64200, trend: [65800, 65600, 65500, 65100, 64900, 65000, 64800, 64700, 64500, 64600, 64400, 64300, 64100, 64200] },
  { id: "mg1", name: "Pepper garbled MG1", market: "Kochi terminal", unit: "₹/qtl", now: 66200, trend: [67800, 67600, 67500, 67100, 66900, 67000, 66800, 66700, 66500, 66600, 66400, 66300, 66100, 66200] },
  { id: "tur", name: "Turmeric finger", market: "Erode mandi", unit: "₹/qtl", now: 13450, trend: [12900, 12950, 13010, 13080, 13120, 13100, 13180, 13240, 13300, 13290, 13360, 13400, 13420, 13450] },
  { id: "chl", name: "Chilli Teja S17", market: "Guntur yard", unit: "₹/qtl", now: 17200, trend: [18100, 18000, 17900, 17950, 17800, 17700, 17650, 17600, 17500, 17450, 17400, 17300, 17250, 17200] },
  { id: "byd", name: "Chilli Byadgi", market: "Byadgi APMC", unit: "₹/qtl", now: 24800, trend: [23900, 24000, 24150, 24100, 24300, 24350, 24400, 24500, 24480, 24600, 24650, 24700, 24760, 24800] },
];
const rateDays = ["7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"].map((d) => `${d} Oct`);

/* ---------------- Documents ---------------- */

type DocCol = "prep" | "cha" | "issued" | "bank";
type DocCard = { id: string; ship: string; doc: string; by: string; due: string; col: DocCol };
const seedDocs: DocCard[] = [
  { id: "D1", ship: "MSH-2622", doc: "Phytosanitary certificate", by: "Plant Quarantine, Kochi", due: "22 Oct", col: "prep" },
  { id: "D2", ship: "MSH-2622", doc: "ISF 10+2 filing", by: "Seabridge Logistics", due: "21 Oct", col: "cha" },
  { id: "D3", ship: "MSH-2622", doc: "FDA prior notice", by: "Joseph", due: "22 Oct", col: "prep" },
  { id: "D4", ship: "MSH-2622", doc: "Fumigation certificate (ALP)", by: "Pest Guard, Willingdon Is.", due: "21 Oct", col: "cha" },
  { id: "D5", ship: "MSH-2622", doc: "Shipping bill (ICEGATE)", by: "CHA Kochi Clearing Co", due: "22 Oct", col: "prep" },
  { id: "D6", ship: "MSH-2620", doc: "Certificate of origin, legalised", by: "Kerala Chamber + consulate", due: "24 Oct", col: "cha" },
  { id: "D7", ship: "MSH-2620", doc: "Health certificate", by: "Spices Board, Kochi", due: "Done", col: "issued" },
  { id: "D8", ship: "MSH-2620", doc: "Bill of lading (original x3)", by: "Shipping line", due: "Done", col: "issued" },
  { id: "D9", ship: "MSH-2613", doc: "Full LC document set", by: "Anitha", due: "30 Oct", col: "issued" },
  { id: "D10", ship: "MSH-2613", doc: "EU MRL lab certificate", by: "Periyar Analytical", due: "Done", col: "issued" },
  { id: "D11", ship: "MSH-2601", doc: "ETO-free certificate (original)", by: "Spices Board QEL", due: "Courier 21 Oct", col: "cha" },
  { id: "D12", ship: "MSH-2601", doc: "LC document set", by: "Sreeja", due: "Presented", col: "bank" },
  { id: "D13", ship: "MSH-2611", doc: "LC document set", by: "Sreeja", due: "Presented", col: "bank" },
  { id: "D14", ship: "MSH-2617", doc: "COO Form AI (AIFTA)", by: "EIC Kochi", due: "Done", col: "issued" },
  { id: "D15", ship: "MSH-2617", doc: "CAD docs via Federal route", by: "Sreeja", due: "23 Oct", col: "prep" },
  { id: "D16", ship: "MSH-2615", doc: "Switch BL after Colombo roll", by: "Seabridge Logistics", due: "22 Oct", col: "prep" },
];
const docCols: { id: DocCol; label: string; tone: Tone; hint: string }[] = [
  { id: "prep", label: "To prepare", tone: "warn", hint: "Drafts and filings not yet sent" },
  { id: "cha", label: "With CHA / agency", tone: "info", hint: "Plant Quarantine, EIC, chamber, forwarder" },
  { id: "issued", label: "Issued", tone: "ok", hint: "Original in hand" },
  { id: "bank", label: "At bank", tone: "accent", hint: "Presented under LC / CAD" },
];

const marketDocs: Record<Region, string[]> = {
  Europe: ["Commercial invoice + packing list", "Bill of lading", "Phytosanitary certificate", "Certificate of origin", "EU MRL lab certificate", "ETO-free declaration", "Insurance certificate (CIF)"],
  Americas: ["Commercial invoice + packing list", "Bill of lading", "Phytosanitary certificate", "Fumigation certificate", "ISF 10+2 filing", "FDA prior notice", "Certificate of origin"],
  Gulf: ["Commercial invoice + packing list", "Bill of lading", "Health certificate", "Certificate of origin, legalised", "Phytosanitary certificate", "Halal declaration"],
  Asia: ["Commercial invoice + packing list", "Bill of lading", "Phytosanitary certificate", "COO Form AI (AIFTA)", "MAQIS import permit copy"],
};

/* ---------------- Dues ---------------- */

type Invoice = { no: string; buyer: string; country: string; ship: string; amount: number; raised: string; days: number; terms: string; status: "Awaiting docs acceptance" | "Accepted, due" | "Overdue" | "Discrepancy" | "Paid part"; promise?: string };
const invoices: Invoice[] = [
  { no: "MSH/EXP/26-311", buyer: "Al Noor Foodstuff Trading LLC", country: "UAE", ship: "MSH-2609 chilli powder", amount: 38200, raised: "3 Oct", days: 17, terms: "DA 60", status: "Accepted, due", promise: "Due 2 Dec" },
  { no: "MSH/EXP/26-306", buyer: "Van der Berg Specerijen BV", country: "Netherlands", ship: "MSH-2601 turmeric powder", amount: 49600, raised: "19 Sep", days: 31, terms: "LC 30 days", status: "Discrepancy", promise: "Waiver asked 14 Oct" },
  { no: "MSH/EXP/26-298", buyer: "Hanseatic Gewürz GmbH", country: "Germany", ship: "MSH-2598 turmeric finger", amount: 62400, raised: "24 Sep", days: 26, terms: "CAD", status: "Awaiting docs acceptance" },
  { no: "MSH/EXP/26-284", buyer: "Coastal Spice Importers Inc", country: "USA", ship: "MSH-2577 pepper MG1", amount: 128900, raised: "21 Aug", days: 60, terms: "LC 60 days", status: "Accepted, due", promise: "Maturity 20 Oct" },
  { no: "MSH/EXP/26-271", buyer: "Sinar Rempah Sdn Bhd", country: "Malaysia", ship: "MSH-2561 pepper 500 GL", amount: 41200, raised: "4 Aug", days: 77, terms: "CAD", status: "Overdue" },
  { no: "MSH/EXP/26-265", buyer: "Al Rawabi Spices Co", country: "Saudi Arabia", ship: "MSH-2552 cardamom", amount: 22800, raised: "28 Jul", days: 84, terms: "DA 45", status: "Paid part", promise: "Balance by 31 Oct" },
  { no: "MSH/EXP/26-302", buyer: "Al Noor Foodstuff Trading LLC", country: "UAE", ship: "MSH-2599 cardamom", amount: 151200, raised: "22 Sep", days: 28, terms: "LC at sight", status: "Awaiting docs acceptance" },
  { no: "MSH/EXP/26-249", buyer: "Coastal Spice Importers Inc", country: "USA", ship: "MSH-2530 chilli", amount: 36700, raised: "9 Jul", days: 103, terms: "DA 60", status: "Overdue", promise: "Wire 'next week' (3rd time)" },
  { no: "MSH/EXP/26-292", buyer: "Van der Berg Specerijen BV", country: "Netherlands", ship: "MSH-2584 pepper MG1", amount: 132000, raised: "6 Sep", days: 44, terms: "LC 30 days", status: "Accepted, due", promise: "Value date 23 Oct" },
  { no: "MSH/EXP/26-318", buyer: "Al Rawabi Spices Co", country: "Saudi Arabia", ship: "MSH-2620 cardamom", amount: 104000, raised: "17 Oct", days: 3, terms: "LC at sight", status: "Awaiting docs acceptance" },
  { no: "MSH/EXP/26-258", buyer: "Hanseatic Gewürz GmbH", country: "Germany", ship: "MSH-2541 cardamom", amount: 18400, raised: "18 Jul", days: 94, terms: "CAD", status: "Overdue", promise: "Quality claim, 2% shortage" },
  { no: "MSH/EXP/26-315", buyer: "Sinar Rempah Sdn Bhd", country: "Malaysia", ship: "MSH-2617 pepper 500 GL", amount: 60480, raised: "15 Oct", days: 5, terms: "Advance 30% + CAD", status: "Paid part", promise: "Advance received" },
];

/* ---------------- Shared modules ---------------- */

const team: TeamMember[] = [
  { name: "Thomas Kurian", role: "Managing partner", status: "Busy", load: 92, focus: "LC amendment call with Coastal Spice and today's Bodi bids", tasks: [{ title: "Approve 3 auction buys", due: "11:00" }, { title: "Call Coastal Spice on LC 7731", due: "10:30" }, { title: "Sign packing credit drawdown", due: "4:00" }], week: [1, 1, 1, 1, 1, 1], since: "1998" },
  { name: "Anitha Menon", role: "Export manager, contracts & LC", status: "Busy", load: 86, focus: "LC 7731 port-name discrepancy before 23 Oct loading", tasks: [{ title: "Chase amendment MT707", due: "12:00" }, { title: "Draft docs for MSH-2613", due: "Thu", done: true }, { title: "Discrepancy waiver, Van der Berg", due: "3:00" }], week: [1, 1, 1, 1, 1, 0], since: "2009" },
  { name: "Faisal Rahman", role: "Procurement, auctions", status: "In field", load: 78, focus: "At Bodinayakanur e-auction; 214 lots today", tasks: [{ title: "Bid on 8 mm lots, cap ₹2,540", due: "now" }, { title: "Pepper sample from Kattappana dealer", due: "2:00" }], week: [1, 1, 1, 1, 1, 1], since: "2014" },
  { name: "Dr. Lekha Nair", role: "QA head", status: "On floor", load: 81, focus: "Chlorpyrifos fail on L-2620-A; re-test plan for Saudi", tasks: [{ title: "Send L-2620-A to re-test", due: "11:30" }, { title: "Steam-sterilise L-2601 retained", due: "Wed" }, { title: "Moisture re-dry L-2627-A", due: "4:00" }], week: [1, 1, 1, 1, 1, 1], since: "2012" },
  { name: "Joseph Varghese", role: "Documentation & CHA", status: "In field", load: 74, focus: "At Plant Quarantine, Willingdon Island, for MSH-2622 phyto", tasks: [{ title: "Phyto for MSH-2622", due: "1:00" }, { title: "Legalise COO at consulate", due: "Thu" }], week: [1, 1, 1, 0, 1, 1], since: "2016" },
  { name: "Sreeja P.", role: "Accounts, bank & FIRC", status: "On floor", load: 66, focus: "Value date 23 Oct on Van der Berg; eBRC backlog of 6", tasks: [{ title: "Generate 6 eBRCs on DGFT", due: "5:00" }, { title: "Packing credit interest entry in Tally", due: "Fri", done: true }], week: [1, 1, 1, 1, 1, 0], since: "2019" },
  { name: "Murugan K.", role: "Warehouse & processing, Kalamassery", status: "On floor", load: 71, focus: "Stuffing MSH-2622 container 23 Oct; steam steriliser run", tasks: [{ title: "Grade & pack 18 MT MG1", due: "Wed" }, { title: "Fumigation slot, ALP", due: "Tue 6 PM" }], week: [1, 1, 1, 1, 1, 1], since: "2008" },
  { name: "Rinu Mathew", role: "Buyer desk, Europe & US", status: "Off", load: 34, focus: "Comp off; Van der Berg questions queued for tomorrow", tasks: [{ title: "Hanseatic price revision reply", due: "tomorrow" }], week: [1, 1, 1, 1, 0, 0], since: "2021" },
];

const agents: WorkforceAgent[] = [
  { name: "LC Sentinel", role: "Reads every LC and amendment against our documents", icon: Landmark, status: "Needs you", runsToday: 7, hoursSaved: 5.5, accuracy: 95, last: "8 min ago", skills: ["UCP 600", "SWIFT MT700", "Discrepancy check"], schedule: "On every LC / amendment received", inbox: [{ title: "LC 7731 loads on 23 Oct but still says 'Cochin'", detail: "Amendment asked 16 Oct, no MT707 yet. Draft chaser to Coastal Spice is ready; alternatively add 'Cochin (Kochi)' on BL." }], log: ["Flagged ETO certificate dated after BL on LC 2274", "Matched LC 1194 terms to contract C/26-129", "Expiry watch: 3 LCs inside 7 days"] },
  { name: "Residue Watch", role: "Compares every lab result to EU and buyer MRLs", icon: FlaskConical, status: "Needs you", runsToday: 9, hoursSaved: 4, accuracy: 97, last: "22 min ago", skills: ["EU MRL", "SFDA", "FDA"], schedule: "On every lab PDF", inbox: [{ title: "L-2620-A chlorpyrifos 0.071 vs 0.05", detail: "Container already sailed to Jeddah. Recommend re-test on retained sample and a word with Al Rawabi before SFDA samples it." }], log: ["L-2629-A aflatoxin B1 5.8, failed for US contract", "L-2627-A moisture 12.6%, sent for re-drying", "L-2630-A cleared for Hanseatic"] },
  { name: "Auction Scout", role: "Watches Puttady and Bodi e-auctions for our grades", icon: Gavel, status: "Running", runsToday: 4, hoursSaved: 3, accuracy: 90, last: "just now", skills: ["Spices Board e-auction", "Grade match", "Price cap"], schedule: "Live during auctions", log: ["Bodi avg ₹2,486/kg, up ₹16", "Flagged 11 lots of 8 mm bold under our cap", "Bought 1,850 kg at ₹2,512 avg"] },
  { name: "Doc Runner", role: "Builds document sets per shipment and market", icon: ScrollText, status: "Running", runsToday: 12, hoursSaved: 6, accuracy: 93, last: "4 min ago", skills: ["ICEGATE", "Phyto", "COO", "ISF"], schedule: "Every 2 hours", log: ["MSH-2622 ISF filed with Seabridge", "COO for MSH-2620 sent for legalisation", "Reminded Joseph: phyto by 1 PM"] },
  { name: "Vessel Tracker", role: "Follows every container from CFS to buyer's gate", icon: Ship, status: "Running", runsToday: 18, hoursSaved: 2.5, accuracy: 96, last: "just now", skills: ["Carrier APIs", "AIS", "Buyer alerts"], schedule: "Every 30 min", log: ["MSH-2615 rolled at Colombo, next feeder 22 Oct", "MSH-2601 2 days from Rotterdam", "Arrival notice drafted for Al Noor"] },
  { name: "Dues Collector", role: "Chases buyer payments and FIRCs, in their timezone", icon: IndianRupee, status: "Idle", runsToday: 2, hoursSaved: 3.5, accuracy: 89, last: "3 h ago", skills: ["Ageing", "Email", "eBRC"], schedule: "Daily 2 PM IST (Europe morning)", log: ["Reminded Coastal Spice for invoice 26-249", "Logged Van der Berg value date 23 Oct", "6 eBRCs pending on DGFT"] },
];

const independence: IndependenceData = {
  score: 41,
  history: [26, 28, 31, 33, 35, 38, 41],
  quote: "Every LC comes to my desk first because one wrong port name cost us $9,000 in 2019. I still read them at 11 at night.",
  pillars: [
    { name: "Buyers & contracts", score: 44, note: "Four of six buyers negotiate only with Thomas. Rinu handles mail, not price.", fixes: [{ title: "Price bands Rinu can quote within", gain: 3 }, { title: "Buyer status links", gain: 2 }] },
    { name: "LC & banking", score: 29, note: "Every LC is read by the owner. Anitha checks it again. Nobody uses a checklist.", fixes: [{ title: "LC Sentinel first pass", gain: 4 }, { title: "UCP checklist per LC", gain: 2 }] },
    { name: "Procurement", score: 38, note: "Faisal bids, but caps come from Thomas by phone each morning.", fixes: [{ title: "Weekly price-cap sheet", gain: 3 }] },
    { name: "Quality & lab", score: 57, note: "Lekha runs QA well; release decisions still wait for the owner.", fixes: [{ title: "Lekha signs release under 0.8× MRL", gain: 3 }] },
    { name: "Documents", score: 49, note: "Joseph knows every office in Willingdon Island. Nothing is written down.", fixes: [{ title: "Market-wise doc checklists", gain: 2 }, { title: "Doc Runner builds sets", gain: 2 }] },
    { name: "Money & dues", score: 34, note: "$0.85M outstanding, 3 buyers over 75 days, eBRCs months behind.", fixes: [{ title: "Daily dues agent", gain: 3 }] },
    { name: "Owner time", score: 36, note: "Thomas spends 16 hours a week reading LCs and lab PDFs.", fixes: [{ title: "Two decision windows a day", gain: 2 }] },
  ],
  ownerHours: [
    { label: "LCs & bank", hours: 10 },
    { label: "Buyer calls", hours: 12 },
    { label: "Auctions", hours: 7 },
    { label: "Lab results", hours: 6 },
    { label: "Dues", hours: 4 },
    { label: "Warehouse", hours: 3 },
    { label: "Strategy", hours: 1 },
  ],
};

const integrations: Integration[] = [
  { name: "Tally Prime", category: "Accounts", status: "Connected", detail: "Export invoices, packing credit and buyer ledgers in USD and INR.", synced: "5 min ago", records: "9,412 vouchers", mark: "T", color: "#1c4f9c" },
  { name: "ICEGATE", category: "Customs", status: "Connected", detail: "Shipping bills, LEO and drawback status.", synced: "20 min ago", records: "312 shipping bills", mark: "IG", color: "#0f5c8a" },
  { name: "DGFT eBRC", category: "Compliance", status: "Syncing", detail: "Bank realisation certificates against shipping bills.", synced: "live", records: "6 pending", mark: "DG", color: "#8a5a12" },
  { name: "Spices Board e-auction", category: "Procurement", status: "Connected", detail: "Puttady and Bodinayakanur lot lists and results.", synced: "just now", records: "402 lots today", mark: "SB", color: "#3f6b3a" },
  { name: "WhatsApp Business", category: "Messaging", status: "Connected", detail: "Dealers, CHA, warehouse and Gulf buyers.", synced: "just now", records: "1,860 chats", mark: "W", color: "#1f9d55" },
  { name: "Gmail", category: "Messaging", status: "Connected", detail: "Buyer contracts, LC copies and lab PDFs parsed.", synced: "9 min ago", records: "2,240 threads", mark: "G", color: "#ea4335" },
  { name: "Periyar Analytical LIMS", category: "Quality", status: "Connected", detail: "Residue, mycotoxin and moisture results per lot.", synced: "22 min ago", records: "640 reports", mark: "PA", color: "#6b4fa0" },
  { name: "Seabridge Logistics", category: "Logistics", status: "Connected", detail: "Bookings, container tracking and ISF filings.", synced: "12 min ago", records: "10 live containers", mark: "SL", color: "#0e4a52" },
  { name: "Bank trade portal", category: "Banking", status: "Error", detail: "SWIFT MT700/707 feed: certificate expired, LC copies coming by email.", synced: "3 days ago", records: "—", mark: "BT", color: "#a63d2a" },
  { name: "Google Sheets", category: "Planning", status: "Available", detail: "Import the old shipment register.", synced: "—", records: "—", mark: "GS", color: "#0f9d58" },
];

/* ============================================================
   Config
   ============================================================ */

const config: DeskConfig = {
  slug: "spice-export",
  company: "Malabar Spice House",
  brand: "Malabar",
  city: "Kochi",
  state: "KL",
  icon: Leaf,
  tagline: "Cardamom, pepper, turmeric and chilli to 6 ports in 5 countries · 10 containers on the water",
  owner: { name: "Thomas Kurian", first: "Thomas", initials: "TK", role: "Managing partner" },
  theme: {
    variant: "ledger",
    paper: "#f2ecdc",
    panel: "#fbf7ec",
    sunk: "#e8e0c9",
    ink: "#1b1d17",
    mute: "#6a6754",
    line: "#d6cdb2",
    accent: "#3f6b3a",
    accentInk: "#fbf7ec",
    soft: "#dfe7d2",
    ok: "#2e7a4c",
    warn: "#b77d22",
    late: "#a43b27",
    info: "#2c6577",
    heading: "serif",
  },
  agenda: [
    { at: 9, title: "Bodinayakanur auction opens", detail: "214 lots, cap ₹2,540/kg for 8 mm", count: 214, tone: "accent", module: "procurement" },
    { at: 10.5, title: "Coastal Spice: LC 7731 amendment", detail: "Port name must say Kochi before 23 Oct", count: 1, tone: "late", module: "contracts" },
    { at: 11.5, title: "Lab results review with Lekha", detail: "2 fails, 3 on watch", count: 5, tone: "warn", module: "lab" },
    { at: 13, title: "Phyto cut-off, Plant Quarantine", detail: "MSH-2622 papers for Savannah", count: 5, tone: "info", module: "documents" },
    { at: 15, title: "Dues call: Van der Berg", detail: "Discrepancy waiver and 23 Oct value date", count: 2, tone: "neutral", module: "dues" },
    { at: 17, title: "Vessel arrivals check", detail: "Rotterdam in 2 days, Jebel Ali in 3", count: 3, tone: "ok", module: "atlas" },
  ],
  activity: [
    { time: "11:42 AM", text: "Auction Scout bought 1,850 kg of 8 mm bold at ₹2,512 avg, Bodi", tone: "ok" },
    { time: "11:20 AM", text: "Residue Watch: L-2629-A aflatoxin B1 5.8 µg/kg, over EU limit", tone: "late" },
    { time: "10:58 AM", text: "Vessel Tracker: MSH-2615 rolled at Colombo, next feeder 22 Oct", tone: "warn" },
    { time: "10:30 AM", text: "ISF 10+2 filed for MSH-2622 by Seabridge", tone: "info" },
    { time: "9:47 AM", text: "Van der Berg confirmed value date 23 Oct for $132,000", tone: "ok" },
    { time: "9:10 AM", text: "Bank portal SWIFT feed failed again; LC copies via email", tone: "late" },
  ],
  asks: [
    { q: "Which containers need attention today?", a: "Three of ten:\n\n• MSH-2609 chilli powder at Jebel Ali: on customs hold, Dubai Municipality pulled a Sudan-dye sample. Our lab report L-2609-A shows Sudan I–IV not detected; send it to Al Noor's clearing agent now.\n• MSH-2615 chilli to Savannah: rolled at Colombo, next feeder 22 Oct, ETA slips about 5 days. LC 7718 latest arrival is not a condition, so no amendment needed.\n• MSH-2620 cardamom to Jeddah: lot L-2620-A tested 0.071 mg/kg chlorpyrifos against a 0.05 limit. Re-test the retained sample before SFDA samples it on arrival in 8 days.", sources: ["Seabridge tracking", "Lab LIMS", "Dubai Municipality notice"] },
    { q: "Which LCs expire this week?", a: "Two inside 7 days, one more at 8:\n• LC 2274/ABN (Van der Berg, turmeric powder): expires 22 Oct. Docs already at bank with one discrepancy; waiver requested.\n• LC 0462/ENBD (Al Noor, cardamom 8 mm): expires 23 Oct; shipment window 17–22 Oct. Container must gate in at ICTT Vallarpadam by Wed 6 PM.\n• LC 7731/TRU (Coastal Spice, pepper MG1): expires 25 Oct, amendment still pending on port name.", sources: ["Contracts & LC", "LC Sentinel"] },
    { q: "Should we buy cardamom at today's auction?", a: "Yes, but only 8 mm bold up to ₹2,540/kg.\n\nAverage is ₹2,486/kg, up 7% in two weeks. Our open contracts need 11 MT of cardamom (Al Rawabi 6 MT, Hanseatic 5 MT) priced at an average landed equivalent of ₹2,610/kg, so buying under ₹2,540 keeps a margin of about 6%. We hold 3.2 MT in Kalamassery. Recommend 4,500 kg across Bodi today and Puttady tomorrow.", sources: ["Spices Board e-auction", "Open contracts", "Warehouse stock"] },
    { q: "How much money is stuck with buyers?", a: "$845,880 (≈ ₹7.1 Cr) across 12 invoices.\n• Over 75 days: $119,100: Coastal Spice $36,700 (103 days, promised 'next week' three times), Hanseatic $18,400 (94 days, 2% shortage claim), Sinar Rempah $41,200 (77 days), Al Rawabi balance $22,800.\n• Coming in: Coastal Spice $128,900 matures today, Van der Berg $132,000 on 23 Oct.\n\nSix eBRCs are pending on DGFT for money already received.", sources: ["Tally ledgers", "Bank statements", "DGFT"] },
    { q: "Why did L-2601-C fail ETO?", a: "Ethylene oxide was 0.14 mg/kg against the EU limit of 0.1. That lot was sterilised at a job-worker in Aluva before we commissioned our own steam steriliser. The shipment (MSH-2601) sailed on a pre-shipment certificate from a different sample, which is why the bank flagged the date mismatch. Recommend: hold back retained stock, steam-sterilise in-house, and send Van der Berg the re-test before the container lands in 2 days.", sources: ["Lab LIMS", "LC 2274 discrepancy notice"] },
    { q: "Draft a note to Al Rawabi about the chlorpyrifos result", a: "Draft (not sent):\n\n“Dear Mr. Khalid, a transparent update on container TGHU 482650-4 (cardamom 7 mm, 4 MT). Our routine pre-arrival check shows chlorpyrifos at 0.071 mg/kg on one lot. We are re-testing the retained sample at an accredited lab today and will share the report within 48 hours, before the vessel reaches Jeddah on 28 Oct. If the re-test confirms, we will replace the lot from fresh stock at our cost. — Thomas Kurian, Malabar Spice House”", sources: ["L-2620-A report", "Contract C/26-121"] },
  ],
  run: {
    label: "Runs every morning at 7 AM IST. You can also run it now.",
    title: "Export Watch",
    steps: [
      { text: "Track 10 containers across 6 ports", result: "1 customs hold, 1 rolled at Colombo, 2 arriving in 3 days" },
      { text: "Read 12 contracts and their LCs", result: "3 LCs expire within 8 days, 1 amendment pending" },
      { text: "Compare 14 lab lots to EU and buyer MRLs", result: "3 fails, 3 on watch" },
      { text: "Match open contracts to stock and today's auctions", result: "Short 7.8 MT cardamom; buy 4,500 kg under ₹2,540" },
      { text: "Age buyer dues and draft reminders", result: "$119k over 75 days, 3 reminders drafted" },
    ],
    outcome: "Chase the LC 7731 amendment before Thursday's loading, send the L-2609-A Sudan-dye report to Al Noor's agent to release the Jebel Ali container, and re-test L-2620-A before the Jeddah vessel arrives. Cardamom buying is cleared up to ₹2,540/kg.",
    actions: ["Send LC 7731 chaser to Coastal Spice", "Share L-2609-A with Al Noor's agent", "Re-test L-2620-A", "Approve 4,500 kg cardamom buy"],
  },
};

/* ============================================================
   Desk
   ============================================================ */

export default function SpiceExportDesk() {
  const [ships, setShips] = React.useState(seedShipments);
  const [lots, setLots] = React.useState(seedLots);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setShips((cur) => cur.map((s) => (s.progress > 0.02 && s.progress < 0.995 && s.status !== "Customs hold" ? { ...s, progress: Math.min(0.995, s.progress + 0.0012) } : s)));
    }, 2500);
    return () => window.clearInterval(id);
  }, []);

  const failing = lots.filter((l) => verdict(l) === "Fail").length;
  const lcSoon = contracts.filter((c) => c.lcDay - CTODAY <= 8 && c.status !== "Shipped").length;

  const modules: DeskModule[] = [
    {
      id: "atlas",
      label: "Shipment atlas",
      group: "Sea",
      count: ships.filter((s) => s.status !== "Delivered").length,
      title: "Shipment atlas",
      blurb: "Every container that left Kochi, where it is on the water, and what is waiting for it at the other end",
      icon: Ship,
      notes: ["Each dashed line is a live sailing from ICTT Vallarpadam; the solid part is the distance already covered.", "Click any vessel for its container, BL, LC and buyer. A pulsing ring means something needs action.", "Filter by region or click a port to see only those sailings."],
      render: () => <AtlasHome ships={ships} setShips={setShips} lots={lots} />,
    },
    { id: "contracts", label: "Contracts & LC", group: "Trade", count: lcSoon, title: "Contracts & letters of credit", blurb: "Every sale contract, its LC, the shipment window and the day the LC dies", icon: Landmark, render: () => <ContractsTab /> },
    { id: "procurement", label: "Procurement", group: "Trade", count: 3, title: "Procurement", blurb: "Cardamom e-auctions at Puttady and Bodinayakanur, mandi rates and what to buy today", icon: Gavel, render: () => <ProcurementTab /> },
    { id: "lab", label: "Lab & quality", group: "Quality", count: failing, title: "Lab & quality", blurb: "Residues, mycotoxins and moisture on every lot, against the EU limit and the buyer's spec", icon: FlaskConical, render: () => <LabTab lots={lots} setLots={setLots} /> },
    { id: "documents", label: "Documents", group: "Sea", count: 6, title: "Shipping documents", blurb: "Phyto, origin, fumigation, BL and bank sets for every shipment, by market", icon: FileCheck2, render: () => <DocumentsTab ships={ships} /> },
    { id: "dues", label: "Buyers & dues", group: "Money", count: invoices.filter((i) => i.days > 60).length, title: "Buyers & dues", blurb: "Who owes what in dollars, on which terms, and what they have promised", icon: Receipt, render: () => <DuesTab /> },
    { id: "team", label: "People", group: "House", title: "People", blurb: "Trade desk, QA, documents and warehouse: who is carrying what today", icon: Users, render: () => <PeopleModule members={team} /> },
    { id: "agents", label: "Agents", group: "House", title: "Agents", blurb: "Six AI agents reading LCs, lab PDFs and auction boards so Thomas doesn't have to", icon: Bot, render: () => <AgentsModule agents={agents} /> },
    { id: "independence", label: "Independence", group: "House", title: "Owner independence", blurb: "How much of Malabar runs without Thomas reading every LC himself", icon: GaugeIcon, render: () => <IndependenceModule data={independence} /> },
    { id: "connections", label: "Connections", group: "House", title: "Connections", blurb: "Tally, ICEGATE, DGFT, the Spices Board auctions and the forwarder", icon: Plug, render: () => <ConnectionsModule items={integrations} /> },
  ];

  return <DeskShell config={config} modules={modules} />;
}

/* ---------------- Home: Shipment atlas ---------------- */

function AtlasHome({ ships, setShips, lots }: { ships: Shipment[]; setShips: React.Dispatch<React.SetStateAction<Shipment[]>>; lots: Lot[] }) {
  const desk = useDesk();
  const [region, setRegion] = React.useState<"All" | Region>("All");
  const [port, setPort] = React.useState<PortId | null>(null);
  const [open, setOpen] = React.useState<string | null>(null);
  const [hover, setHover] = React.useState<string | null>(null);
  const fx = useDrift(FX, 0.03, 3000);
  const sailing = ships.filter((s) => s.status !== "Delivered" && s.status !== "Loading");
  const onWater = sailing.reduce((a, s) => a + s.usd, 0);
  const shown = ships.filter((s) => (region === "All" || ports[s.port].region === region) && (!port || s.port === port));
  const ship = ships.find((s) => s.id === open) ?? null;
  const holds = lots.filter((l) => verdict(l) === "Fail").length;
  const usedPorts = Array.from(new Set(ships.map((s) => s.port)));

  return (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Cargo on the water" value={inr(onWater * fx, { compact: true })} delta="+9%" hint={`${usdK(onWater)} at ₹${fx.toFixed(2)}`} icon={Ship} trend={[5.1, 5.6, 6.0, 6.4, 6.9, 7.2, 7.5, (onWater * fx) / 1e7]} />
        <Stat label="Containers sailing" value={sailing.length} delta="+2" hint="1 loading Thursday" icon={Anchor} tone="info" trend={[5, 6, 6, 7, 8, 8, 9, sailing.length]} />
        <Stat label="LCs expiring in 8 days" value={contracts.filter((c) => c.lcDay - CTODAY <= 8 && c.status !== "Shipped").length} delta="+1" deltaGood={false} hint="LC 2274 dies Thursday" icon={Landmark} tone="warn" onClick={() => desk.goTab("contracts")} />
        <Stat label="Lots failing MRL" value={holds} delta={holds > 2 ? "+1" : "-1"} deltaGood={holds <= 2} hint="tap to open the lab" icon={FlaskConical} tone="late" onClick={() => desk.goTab("lab")} />
      </div>

      <Panel
        live
        title="Shipment atlas"
        sub={`${sailing.length} containers out of Kochi · ${usdK(onWater)} at sea · positions refresh from the carrier every 30 min`}
        action={
          <Segmented
            size="sm"
            options={(["All", "Gulf", "Europe", "Americas", "Asia"] as const).map((r) => ({ value: r, label: r, count: r === "All" ? ships.length : ships.filter((s) => ports[s.port].region === r).length }))}
            value={region}
            onChange={(r) => {
              setRegion(r);
              setPort(null);
            }}
          />
        }
      >
        <div className="grid gap-5 xl:grid-cols-[1fr_310px]">
          <div className="relative overflow-hidden border border-d-line" style={{ background: "color-mix(in oklab, var(--d-info) 9%, var(--d-panel))" }}>
            <SeaMap ships={ships} region={region} port={port} hover={hover} setHover={setHover} onPort={(p) => setPort((cur) => (cur === p ? null : p))} onShip={setOpen} usedPorts={usedPorts} />
            <div className="pointer-events-none absolute bottom-2 left-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-serif text-[11.5px] italic text-d-mute">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-[2px] w-5 bg-d-accent" /> sailed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-0 w-5 border-t border-dashed border-d-ink/50" /> to go
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full border-2 border-d-late" /> needs action
              </span>
            </div>
          </div>
          <div className="min-w-0">
            <div className="mb-2 flex items-baseline justify-between">
              <p className="font-serif text-[15px] italic">{port ? `Bound for ${ports[port].name}` : region === "All" ? "Every sailing" : `${region} sailings`}</p>
              {port && (
                <button type="button" onClick={() => setPort(null)} className="text-[12px] text-d-accent underline underline-offset-2">
                  clear
                </button>
              )}
            </div>
            <ul className="desk-scroll max-h-[440px] divide-y divide-d-line overflow-y-auto pr-1">
              {[...shown]
                .sort((a, b) => a.etaDays - b.etaDays)
                .map((s) => (
                  <li key={s.id}>
                    <button type="button" onMouseEnter={() => setHover(s.id)} onMouseLeave={() => setHover(null)} onClick={() => setOpen(s.id)} className="w-full py-2.5 text-left transition-colors hover:bg-d-sunk/60">
                      <p className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[13.5px] font-semibold">{s.vessel}</span>
                        <Pill tone={statusTone[s.status]}>{s.status}</Pill>
                      </p>
                      <p className="truncate text-[12px] text-d-mute">
                        {s.product} · {s.mt} MT → {ports[s.port].name}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Meter value={s.progress * 100} tone={s.risk ? "late" : "accent"} height={4} />
                        <span className="shrink-0 font-mono text-[11px] text-d-mute">{s.etaDays > 0 ? <Countdown compact inHours={s.etaDays * 24 - 6} /> : "in port"}</span>
                      </div>
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </Panel>

      <div className="grid gap-7 lg:grid-cols-[1.1fr_1fr]">
        <Panel icon={CalendarClock} title="Landing in the next fortnight" sub="Arrival, the buyer's clearance and the money that follows">
          <ul className="space-y-3">
            {ships
              .filter((s) => s.etaDays > 0 && s.etaDays <= 14)
              .sort((a, b) => a.etaDays - b.etaDays)
              .map((s) => (
                <li key={s.id} className="grid grid-cols-[64px_1fr_auto] items-center gap-3 border-b border-d-line pb-3 last:border-0">
                  <div className="text-center">
                    <p className="desk-h text-[30px] font-semibold leading-none">{s.etaDays}</p>
                    <p className="text-[10.5px] uppercase tracking-[0.16em] text-d-mute">days</p>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-semibold">
                      {ports[s.port].name} · {s.buyer}
                    </p>
                    <p className="truncate text-[12px] text-d-mute">
                      {s.grade} · {ports[s.port].dwell}
                    </p>
                    {s.risk && (
                      <p className="mt-0.5 flex items-center gap-1 text-[12px] text-d-late">
                        <AlertTriangle className="h-3 w-3" /> {s.risk}
                      </p>
                    )}
                  </div>
                  <span className="tnum font-mono text-[13px] font-semibold">{usdK(s.usd)}</span>
                </li>
              ))}
          </ul>
        </Panel>
        <div className="space-y-7">
          <Panel icon={TrendingUp} title="Freight and the rupee" sub={`Kochi → Rotterdam, $ per 20' container, last 8 weeks · USD/INR ₹${fx.toFixed(2)} now`}>
            <AreaChart
              labels={["1 Sep", "8 Sep", "15 Sep", "22 Sep", "29 Sep", "6 Oct", "13 Oct", "20 Oct"]}
              series={[
                { name: "Kochi → Rotterdam", data: [1860, 1920, 2040, 2130, 2100, 2220, 2310, 2370], tone: "warn" },
                { name: "Kochi → Jebel Ali", data: [610, 620, 640, 650, 660, 655, 670, 690], tone: "accent" },
              ]}
              format={(v) => `$${Math.round(v).toLocaleString("en-US")}`}
              height={150}
            />
            <p className="mt-2 text-[12.5px] text-d-mute">
              Red Sea diversions keep Europe freight up 27% since August. Every 10 paise on the rupee moves our open book by <b className="text-d-ink">₹1.6 L</b>.
            </p>
          </Panel>
          <Panel icon={Timer} title="Gate-in cut-offs, ICTT Vallarpadam" sub="Miss these and the container rolls a week">
            <ul className="space-y-2.5">
              {[
                { s: "MSH-2622 · MV Atlantic Pepper", d: "Pepper MG1 18 MT to Savannah", h: 30, t: "warn" as Tone },
                { s: "C/26-119 · MV Arabian Wren", d: "Cardamom 6 MT to Jebel Ali", h: 54, t: "info" as Tone },
                { s: "C/26-124 · MV Nordic Anise", d: "Pepper MG1 18 MT to Rotterdam", h: 9 * 24, t: "neutral" as Tone },
              ].map((c) => (
                <li key={c.s} className="flex items-center gap-3">
                  <span className="h-8 w-1 shrink-0" style={{ background: c.t === "neutral" ? "var(--d-line)" : `var(--d-${c.t})` }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold">{c.s}</p>
                    <p className="truncate text-[12px] text-d-mute">{c.d}</p>
                  </div>
                  <span className="text-[12.5px]">
                    <Countdown compact inHours={c.h} />
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <ShipSheet
        ship={ship}
        onClose={() => setOpen(null)}
        onDelivered={(id) => {
          setShips((cur) => cur.map((s) => (s.id === id ? { ...s, status: "Delivered", progress: 1, risk: undefined } : s)));
          desk.log(`${id} released and delivered to buyer`, "ok");
          toast.success(`${id} marked delivered`, { description: "Buyer's FIRC follow-up starts in Buyers & dues." });
        }}
      />
    </div>
  );
}

function SeaMap({
  ships,
  region,
  port,
  hover,
  setHover,
  onPort,
  onShip,
  usedPorts,
}: {
  ships: Shipment[];
  region: "All" | Region;
  port: PortId | null;
  hover: string | null;
  setHover: (id: string | null) => void;
  onPort: (p: PortId) => void;
  onShip: (id: string) => void;
  usedPorts: PortId[];
}) {
  const inFocus = (p: PortId) => (region === "All" || ports[p].region === region) && (!port || port === p);
  return (
    <svg viewBox="0 -26 1000 546" className="block h-auto w-full select-none" role="img" aria-label="Map of sailings from Kochi">
      {[60, 140, 220, 300, 380, 460].map((y) => (
        <line key={`lat${y}`} x1="0" x2="1000" y1={y} y2={y} stroke="var(--d-ink)" strokeOpacity="0.07" strokeDasharray="2 6" />
      ))}
      {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((x) => (
        <line key={`lon${x}`} y1="0" y2="520" x1={x} x2={x} stroke="var(--d-ink)" strokeOpacity="0.07" strokeDasharray="2 6" />
      ))}
      {LAND.map((pts) => (
        <polygon key={pts} points={pts} fill="color-mix(in oklab, var(--d-accent) 13%, var(--d-sunk))" stroke="color-mix(in oklab, var(--d-ink) 25%, transparent)" strokeWidth="1" strokeLinejoin="round" />
      ))}
      <ellipse cx="652" cy="362" rx="7" ry="10" fill="color-mix(in oklab, var(--d-accent) 13%, var(--d-sunk))" stroke="color-mix(in oklab, var(--d-ink) 25%, transparent)" />
      {[
        { t: "Arabian Sea", x: 548, y: 372 },
        { t: "Indian Ocean", x: 640, y: 470 },
        { t: "North Atlantic", x: 150, y: 120 },
        { t: "Bay of Bengal", x: 716, y: 268 },
        { t: "Red Sea", x: 474, y: 206, r: 70 },
        { t: "Mediterranean", x: 330, y: 172 },
      ].map((l) => (
        <text key={l.t} x={l.x} y={l.y} fill="var(--d-mute)" fontSize={l.r ? 10 : 13} fontStyle="italic" fontFamily="var(--font-serif)" textAnchor="middle" transform={l.r ? `rotate(${l.r} ${l.x} ${l.y})` : undefined} opacity="0.8">
          {l.t}
        </text>
      ))}
      <text x="452" y="186" fill="var(--d-mute)" fontSize="9.5" fontFamily="var(--font-mono)" textAnchor="end">
        Suez
      </text>
      <text x="656" y="384" fill="var(--d-mute)" fontSize="9.5" fontFamily="var(--font-mono)">
        Colombo
      </text>

      {usedPorts.map((p) => (
        <path key={`route-${p}`} d={pathD(DENSE[p].pts)} fill="none" stroke={inFocus(p) ? "var(--d-ink)" : "var(--d-mute)"} strokeOpacity={inFocus(p) ? 0.45 : 0.12} strokeWidth="1.4" className="desk-flow" strokeLinecap="round" />
      ))}

      {ships.map((s) => {
        if (s.progress <= 0) return null;
        const pos = along(s.port, s.progress);
        const focus = inFocus(s.port);
        return <path key={`trail-${s.id}`} d={pathD(pos.trail)} fill="none" stroke="var(--d-accent)" strokeOpacity={focus ? (hover === s.id ? 1 : 0.7) : 0.12} strokeWidth={hover === s.id ? 3.4 : 2.2} strokeLinecap="round" />;
      })}

      {(Object.keys(ports) as PortId[]).map((p) => {
        const end = ROUTES[p][ROUTES[p].length - 1];
        const on = port === p;
        const count = ships.filter((s) => s.port === p).length;
        const left = p === "SAV" || p === "JED" || p === "RTM";
        return (
          <g key={p} className="cursor-pointer" onClick={() => onPort(p)} opacity={inFocus(p) ? 1 : 0.35}>
            <circle cx={end[0]} cy={end[1]} r={on ? 8 : 6} fill={on ? "var(--d-accent)" : "var(--d-panel)"} stroke="var(--d-ink)" strokeWidth="1.6" />
            <text x={end[0] + (left ? -12 : 12)} y={end[1] + 4} textAnchor={left ? "end" : "start"} fontSize="13" fontFamily="var(--font-serif)" fontWeight="600" fill="var(--d-ink)">
              {ports[p].name}
              <tspan fontFamily="var(--font-mono)" fontSize="10" fontWeight="400" fill="var(--d-mute)">
                {" "}
                ·{count}
              </tspan>
            </text>
          </g>
        );
      })}

      <g>
        <circle cx={KOCHI[0]} cy={KOCHI[1]} r="16" fill="var(--d-accent)" opacity="0.12">
          <animate attributeName="r" values="10;20;10" dur="3s" repeatCount="indefinite" />
        </circle>
        <rect x={KOCHI[0] - 6} y={KOCHI[1] - 6} width="12" height="12" fill="var(--d-accent)" stroke="var(--d-panel)" strokeWidth="2" transform={`rotate(45 ${KOCHI[0]} ${KOCHI[1]})`} />
        <text x={KOCHI[0] + 14} y={KOCHI[1] - 8} fontSize="14" fontWeight="700" fontFamily="var(--font-serif)" fill="var(--d-ink)">
          Kochi
        </text>
        <text x={KOCHI[0] + 14} y={KOCHI[1] + 5} fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--d-mute)">
          ICTT Vallarpadam
        </text>
      </g>

      {ships.map((s, i) => {
        if (s.progress <= 0 || s.status === "Delivered") return null;
        const pos = along(s.port, s.progress);
        const focus = inFocus(s.port);
        const hot = hover === s.id;
        const up = s.tag ? s.tag === "up" : i % 2 === 0;
        const tone = s.risk ? "var(--d-late)" : s.status === "Arriving" || s.status === "Customs hold" ? "var(--d-info)" : "var(--d-accent)";
        const label = `${s.vessel.replace("MV ", "")} · ${s.etaDays > 0 ? `${s.etaDays}d` : "in port"}`;
        const w = label.length * 6.1 + 12;
        return (
          <g key={s.id} className="cursor-pointer" opacity={focus ? 1 : 0.18} onMouseEnter={() => setHover(s.id)} onMouseLeave={() => setHover(null)} onClick={() => onShip(s.id)}>
            {s.risk && (
              <circle cx={pos.x} cy={pos.y} r="9" fill="none" stroke="var(--d-late)" strokeWidth="1.6">
                <animate attributeName="r" values="7;16;7" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.9;0;0.9" dur="1.8s" repeatCount="indefinite" />
              </circle>
            )}
            <circle cx={pos.x} cy={pos.y} r="13" fill="transparent" />
            <g transform={`translate(${pos.x.toFixed(1)} ${pos.y.toFixed(1)}) rotate(${pos.angle.toFixed(1)}) scale(${hot ? 1.35 : 1})`}>
              <path d="M-8,-3.6 L4,-3.6 L9.5,0 L4,3.6 L-8,3.6 Z" fill={tone} stroke="var(--d-panel)" strokeWidth="1.2" />
              <rect x="-5" y="-2" width="5" height="4" fill="var(--d-panel)" opacity="0.85" />
            </g>
            {(hot || (focus && (region !== "All" || port || s.risk || s.etaDays <= 4))) && (
              <g transform={`translate(${pos.x.toFixed(1)} ${(pos.y + (up ? -22 : 14)).toFixed(1)})`}>
                <rect x={-w / 2} y="0" width={w} height="16" rx="2" fill={hot ? "var(--d-ink)" : "var(--d-panel)"} stroke="var(--d-line)" />
                <text x="0" y="11.5" textAnchor="middle" fontSize="10.5" fontFamily="var(--font-mono)" fill={hot ? "var(--d-panel)" : "var(--d-ink)"}>
                  {label}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function ShipSheet({ ship, onClose, onDelivered }: { ship: Shipment | null; onClose: () => void; onDelivered: (id: string) => void }) {
  const desk = useDesk();
  const steps = ship
    ? [
        { l: "Stuffed at Kalamassery warehouse", d: true },
        { l: "Gated in, ICTT Vallarpadam", d: ship.progress > 0 || ship.status === "Loading" },
        { l: `Sailed ${ship.etd}`, d: ship.progress > 0.02 },
        { l: ship.port === "PKG" || ship.port === "JEA" ? "Mid-voyage" : "Transshipment, Colombo", d: ship.progress > 0.25 },
        { l: `Arrived ${ports[ship.port].name}`, d: ship.progress >= 1 },
        { l: "Cleared and delivered to buyer", d: ship.status === "Delivered" },
      ]
    : [];
  return (
    <Sheet
      open={!!ship}
      onOpenChange={(o) => !o && onClose()}
      width={520}
      eyebrow={ship ? `${ship.id} · ${ship.vessel} voy. ${ship.voyage}` : ""}
      title={ship ? `${ship.product}, ${ship.mt} MT to ${ports[ship.port].name}` : ""}
      sub={ship ? `${ship.buyer} · ${ship.grade}` : ""}
      footer={
        ship && (
          <>
            <Btn
              icon={Send}
              onClick={() => {
                toast.success("Tracking link sent", { description: `${ship.buyer} gets live position and documents, no login.` });
                desk.log(`Tracking shared with ${ship.buyer} for ${ship.id}`, "info");
              }}
            >
              Share tracking
            </Btn>
            {ship.progress >= 1 && ship.status !== "Delivered" ? (
              <Btn
                variant="solid"
                icon={CheckCheck}
                onClick={() => {
                  onDelivered(ship.id);
                  onClose();
                }}
              >
                Mark released
              </Btn>
            ) : (
              <Btn
                variant="solid"
                icon={Mail}
                onClick={() => {
                  toast.success("Arrival notice drafted", { description: `To ${ship.buyer}, with BL ${ship.bl}` });
                  desk.log(`Arrival notice drafted for ${ship.id}`);
                }}
              >
                Arrival notice
              </Btn>
            )}
          </>
        )
      }
    >
      {ship && (
        <div className="space-y-5">
          {ship.risk && (
            <div className="flex items-start gap-2 border-l-2 border-d-late bg-d-late/10 px-3 py-2 text-[13px]">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-d-late" />
              {ship.risk}
            </div>
          )}
          <div>
            <div className="mb-1.5 flex items-baseline justify-between text-[12px] text-d-mute">
              <span>Kochi</span>
              <span className="font-mono">{Math.round(ship.progress * 100)}% of the voyage</span>
              <span>{ports[ship.port].name}</span>
            </div>
            <Meter value={ship.progress * 100} tone={ship.risk ? "late" : "accent"} height={8} />
            <p className="mt-2 text-[13px]">
              {ship.etaDays > 0 ? (
                <>
                  ETA in <Countdown compact inHours={ship.etaDays * 24 - 6} />
                </>
              ) : (
                <span className="text-d-late">At the port. {ports[ship.port].dwell}.</span>
              )}
            </p>
          </div>
          <KV
            items={[
              { k: "Container", v: <span className="font-mono">{ship.container}</span> },
              { k: "Seal", v: <span className="font-mono">{ship.seal}</span> },
              { k: "Bill of lading", v: <span className="font-mono">{ship.bl}</span> },
              { k: "Payment", v: ship.lc },
              { k: "Incoterm", v: ship.incoterm },
              { k: "Sailed", v: ship.etd },
              { k: "Invoice value", v: usd(ship.usd) },
              { k: "In rupees", v: inr(ship.usd * FX, { compact: true }) },
              { k: "Port of discharge", v: `${ports[ship.port].name} (${ports[ship.port].code})` },
              { k: "Status", v: <Pill tone={statusTone[ship.status]}>{ship.status}</Pill> },
            ]}
          />
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-d-mute">Milestones</p>
            <ol className="space-y-1.5">
              {steps.map((s) => (
                <li key={s.l} className="flex items-center gap-3 text-[13px]">
                  <span className={`h-3 w-3 rotate-45 border ${s.d ? "border-d-accent bg-d-accent" : "border-d-mute bg-d-panel"}`} />
                  <span className={s.d ? "" : "text-d-mute"}>{s.l}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </Sheet>
  );
}

/* ---------------- Contracts & LC ---------------- */

const cticks = [
  { at: 0, label: "13 Oct" },
  { at: 7, label: "20 Oct" },
  { at: 14, label: "27 Oct" },
  { at: 21, label: "3 Nov" },
  { at: 28, label: "10 Nov" },
  { at: 35, label: "17 Nov" },
  { at: 42, label: "24 Nov" },
  { at: 49, label: "1 Dec" },
];
function cday(d: number) {
  const date = new Date(Date.UTC(2026, 9, 13 + d));
  return `${date.getUTCDate()} ${date.toLocaleString("en-IN", { month: "short", timeZone: "UTC" })}`;
}

function ContractsTab() {
  const desk = useDesk();
  const [rows, setRows] = React.useState(contracts);
  const [open, setOpen] = React.useState<Contract | null>(null);
  const [amend, setAmend] = React.useState(false);
  const soon = [...rows].filter((c) => c.status !== "Shipped").sort((a, b) => a.lcDay - b.lcDay).slice(0, 4);
  const book = rows.reduce((a, c) => a + c.mt * c.price, 0);

  const gantt: GanttRow[] = rows
    .filter((c) => c.to >= 0)
    .sort((a, b) => a.from - b.from)
    .map((c) => ({
      id: c.no,
      title: `${c.product}`,
      sub: `${c.buyer.replace(/ (Specerijen BV|Foodstuff Trading LLC|Spice Importers Inc|Spices Co|Gewürz GmbH|Rempah Sdn Bhd)$/, "")} · ${c.mt} MT`,
      bars: [
        { from: Math.max(0, c.from), to: c.to, tone: contractTone[c.status], label: "Shipment window" },
        { from: c.to, to: c.lcDay, tone: "neutral", dashed: true, label: "Presentation" },
      ],
      flag: c.lcDay,
      badge: c.lcDay - CTODAY <= 8 && c.status !== "Shipped" ? { at: c.lcDay, label: `LC dies ${cday(c.lcDay)}`, tone: "late" } : undefined,
    }));

  return (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open contract book" value={usdK(book)} delta="+14%" hint={inr(book * FX, { compact: true })} icon={ScrollText} trend={[0.9, 1.0, 1.1, 1.0, 1.2, 1.3, 1.35, book / 1e6]} />
        <Stat label="LCs in hand" value={`${rows.filter((c) => c.status === "LC received" || c.status === "Docs at bank").length} / ${rows.length}`} hint="3 awaited, 1 being amended" icon={Landmark} tone="ok" />
        <Stat label="Expiring in 8 days" value={rows.filter((c) => c.lcDay - CTODAY <= 8 && c.status !== "Shipped").length} delta="+1" deltaGood={false} icon={Timer} tone="late" />
        <Stat label="Discrepancies this year" value="4" delta="-3" deltaGood={false} hint="cost $2,140 in fees" icon={AlertTriangle} tone="warn" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {soon.map((c) => (
          <button key={c.no} type="button" onClick={() => setOpen(c)} className="desk-card desk-rise p-4 text-left transition-transform hover:-translate-y-0.5">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-d-mute">{c.lc === "—" ? c.no : c.lc}</p>
            <p className="mt-1 truncate text-[14px] font-semibold">{c.buyer}</p>
            <p className="truncate text-[12px] text-d-mute">
              {c.product} · {c.mt} MT
            </p>
            <div className="mt-3 text-d-ink">
              <Countdown compact inHours={(c.lcDay - CTODAY) * 24 + 9} />
            </div>
            <p className="mt-1 flex items-center justify-between text-[12px]">
              <span className="text-d-mute">LC expiry {cday(c.lcDay)}</span>
              <Pill tone={contractTone[c.status]}>{c.status}</Pill>
            </p>
          </button>
        ))}
      </div>

      <Panel title="Shipment windows" sub="Solid: window to ship. Dashed: time left to present documents. Pin: LC expiry.">
        <Gantt rows={gantt} days={56} ticks={cticks} today={{ at: CTODAY, label: "Today" }} onRow={(r) => setOpen(rows.find((c) => c.no === r.id) ?? null)} labelWidth={240} />
      </Panel>

      <Panel title="Contract register" sub="Click a contract for LC terms and the document conditions">
        <DataTable
          rows={rows}
          rowKey={(c) => c.no}
          search={(c) => `${c.no} ${c.buyer} ${c.product} ${c.lc}`}
          searchPlaceholder="Search contract, buyer or LC"
          filter={{ get: (c) => c.status, options: ["LC received", "LC awaited", "Amendment asked", "Shipped", "Docs at bank"] }}
          onRow={setOpen}
          bulk={[{ label: "Send LC status to buyers", run: (k) => { toast.success(`LC status sent for ${k.length} contracts`); desk.log(`LC status sent to buyers for ${k.length} contracts`); } }]}
          columns={[
            { key: "no", label: "Contract", render: (c) => <span className="font-mono text-[12px]">{c.no}</span>, sort: (c) => c.no },
            { key: "buyer", label: "Buyer", render: (c) => <span className="font-medium">{c.buyer}</span>, sort: (c) => c.buyer },
            { key: "prod", label: "Product", render: (c) => <span className="text-d-mute">{c.product}</span>, wide: true },
            { key: "mt", label: "MT", align: "right", render: (c) => <span className="tnum font-mono">{c.mt}</span>, sort: (c) => c.mt },
            { key: "val", label: "Value", align: "right", render: (c) => <span className="tnum font-mono">{usdK(c.mt * c.price)}</span>, sort: (c) => c.mt * c.price },
            { key: "terms", label: "Terms", render: (c) => <span className="text-[12px]">{c.terms}</span>, wide: true },
            { key: "exp", label: "LC expiry", render: (c) => <span className="font-mono text-[12px]" style={{ color: c.lcDay - CTODAY <= 8 && c.status !== "Shipped" ? "var(--d-late)" : undefined }}>{cday(c.lcDay)}</span>, sort: (c) => c.lcDay },
            { key: "st", label: "Status", render: (c) => <Pill tone={contractTone[c.status]}>{c.status}</Pill> },
          ]}
        />
      </Panel>

      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={open ? `${open.no} · ${open.bank}` : ""}
        title={open ? `${open.product}, ${open.mt} MT` : ""}
        sub={open ? `${open.buyer} · ${usd(open.price)}/MT · ${open.terms}` : ""}
        footer={
          open && (
            <>
              <Btn icon={RotateCcw} onClick={() => setAmend(true)}>
                Request amendment
              </Btn>
              <Btn
                variant="solid"
                icon={CheckCheck}
                onClick={() => {
                  setRows((cur) => cur.map((c) => (c.no === open.no ? { ...c, status: c.status === "LC awaited" || c.status === "Amendment asked" ? "LC received" : c.status } : c)));
                  toast.success("LC terms accepted", { description: `${open.lc} checked against ${open.no}` });
                  desk.log(`${open.lc} accepted for ${open.buyer}`, "ok");
                  setOpen(null);
                }}
              >
                Accept LC
              </Btn>
            </>
          )
        }
      >
        {open && (
          <div className="space-y-5">
            <div className="text-d-ink">
              <p className="text-[12px] text-d-mute">Time left on the LC</p>
              <Countdown inHours={(open.lcDay - CTODAY) * 24 + 9} />
            </div>
            <KV
              items={[
                { k: "LC number", v: <span className="font-mono">{open.lc}</span> },
                { k: "Issuing bank", v: open.bank },
                { k: "Shipment window", v: `${cday(Math.max(0, open.from))} – ${cday(open.to)}` },
                { k: "LC expiry", v: cday(open.lcDay) },
                { k: "Contract value", v: usd(open.mt * open.price) },
                { k: "Linked shipment", v: open.shipment ?? "Not booked" },
              ]}
            />
            <p className="border-l-2 border-d-accent pl-3 font-serif text-[14.5px] italic leading-relaxed">{open.note}</p>
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-d-mute">LC Sentinel checks</p>
              <ul className="space-y-1.5 text-[13px]">
                {[
                  { t: "Port of loading matches BL wording", ok: open.status !== "Amendment asked" },
                  { t: "Latest shipment date after our window", ok: true },
                  { t: "Presentation period ≥ 21 days", ok: open.lcDay - open.to >= 7 },
                  { t: "Lab certificate wording matches our lab's format", ok: !open.note.includes("ETO certificate dated") },
                  { t: "Partial shipments allowed", ok: open.mt > 20 || open.terms !== "LC at sight" },
                ].map((c) => (
                  <li key={c.t} className="flex items-center justify-between border-b border-d-line pb-1.5">
                    {c.t}
                    {c.ok ? <Pill tone="ok">OK</Pill> : <Pill tone="late">Check</Pill>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Sheet>
      <AmendModal
        open={amend}
        contract={open}
        onOpenChange={setAmend}
        onSend={(text) => {
          if (!open) return;
          setRows((cur) => cur.map((c) => (c.no === open.no ? { ...c, status: "Amendment asked" } : c)));
          toast.success("Amendment request sent", { description: text });
          desk.log(`Amendment requested on ${open.lc}: ${text}`, "warn");
        }}
      />
    </div>
  );
}

function AmendModal({ open, contract, onOpenChange, onSend }: { open: boolean; contract: Contract | null; onOpenChange: (o: boolean) => void; onSend: (text: string) => void }) {
  const [field, setField] = React.useState("Port of loading");
  const [to, setTo] = React.useState("Cochin (Kochi), India — INCOK1");
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Request LC amendment" sub={contract ? `${contract.lc} · ${contract.buyer}` : ""}>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSend(`${field} → ${to}`);
          onOpenChange(false);
        }}
      >
        <Field label="Clause">
          <select className={inputClass} value={field} onChange={(e) => setField(e.target.value)}>
            {["Port of loading", "Latest shipment date", "LC expiry date", "Partial shipments", "Lab certificate wording", "Tolerance ±5%"].map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </Field>
        <Field label="Amend to">
          <input className={inputClass} value={to} onChange={(e) => setTo(e.target.value)} />
        </Field>
        <p className="text-[12px] text-d-mute">Sent to the buyer by email with a copy to the advising bank. Amendment charges are for the buyer&apos;s account per contract.</p>
        <div className="flex justify-end gap-2 pt-1">
          <Btn onClick={() => onOpenChange(false)}>Cancel</Btn>
          <Btn variant="solid" type="submit" icon={Send}>
            Send request
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Lab & quality ---------------- */

function LabTab({ lots, setLots }: { lots: Lot[]; setLots: React.Dispatch<React.SetStateAction<Lot[]>> }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<string | null>(null);
  const lot = lots.find((l) => l.id === open) ?? null;
  const counts = { Pass: 0, Watch: 0, Fail: 0, "Re-testing": 0 };
  lots.forEach((l) => (counts[verdict(l)] += 1));
  const timers = React.useRef<number[]>([]);
  React.useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  function retest(l: Lot) {
    const w = worst(l);
    setLots((cur) => cur.map((x) => (x.id === l.id ? { ...x, retesting: true } : x)));
    toast("Retained sample sent for re-test", { description: `${l.id} · ${w.p} · results in a few seconds (demo)` });
    desk.log(`${l.id} sent for re-test on ${w.p}`, "info");
    timers.current.push(
      window.setTimeout(() => {
        setLots((cur) => cur.map((x) => (x.id === l.id ? { ...x, retesting: false, values: { ...x.values, [w.p]: +(LIMITS[w.p].limit * 0.62).toFixed(3) } } : x)));
        toast.success(`${l.id} re-test passed`, { description: `${w.p} now ${(LIMITS[w.p].limit * 0.62).toFixed(3)} ${LIMITS[w.p].unit}` });
        desk.log(`${l.id} re-test passed on ${w.p}`, "ok");
      }, 3200),
    );
  }

  return (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Lots tested this month" value={lots.length + 27} delta="+6" hint="2 labs, NABL accredited" icon={FlaskConical} trend={[22, 26, 29, 31, 35, 38, 41]} />
        <Stat label="Failing a limit" value={counts.Fail} delta={counts.Fail > 2 ? "+1" : "-1"} deltaGood={counts.Fail <= 2} icon={AlertTriangle} tone="late" />
        <Stat label="On watch (> 0.8× limit)" value={counts.Watch} hint="cardamom chlorpyrifos mostly" icon={Timer} tone="warn" />
        <Stat label="EU rejections (RASFF) this year" value="0" hint="industry: 31 for Indian spices" icon={CheckCheck} tone="ok" />
      </div>

      <Panel title="Lot results" sub="Worst parameter against its limit. Click a lot for the full report, re-test or release.">
        <DataTable
          rows={lots}
          rowKey={(l) => l.id}
          search={(l) => `${l.id} ${l.product} ${l.shipment} ${l.market}`}
          searchPlaceholder="Search lot, product or shipment"
          filter={{ get: (l) => verdict(l), options: ["Fail", "Watch", "Pass", "Re-testing"] }}
          onRow={(l) => setOpen(l.id)}
          bulk={[{ label: "Share reports with buyers", run: (k) => { toast.success(`${k.length} lab reports shared`); desk.log(`${k.length} lab reports shared with buyers`); } }]}
          columns={[
            { key: "id", label: "Lot", render: (l) => <span className="font-mono text-[12px] font-medium">{l.id}</span>, sort: (l) => l.id },
            { key: "prod", label: "Product", render: (l) => <span className="font-medium">{l.product}</span>, sort: (l) => l.product },
            { key: "mkt", label: "Market", render: (l) => l.market, sort: (l) => l.market },
            { key: "lab", label: "Lab", render: (l) => <span className="text-[12px] text-d-mute">{l.lab}</span>, wide: true },
            { key: "worst", label: "Worst parameter", render: (l) => <span className="text-[12.5px]">{worst(l).p}</span> },
            {
              key: "ratio",
              label: "× limit",
              render: (l) => {
                const r = worst(l).ratio;
                return (
                  <div className="flex min-w-[130px] items-center gap-2">
                    <Meter value={Math.min(r, 1.5)} max={1.5} tone={r > 1 ? "late" : r > 0.8 ? "warn" : "ok"} />
                    <span className="tnum font-mono text-[11.5px]">{r.toFixed(2)}</span>
                  </div>
                );
              },
              sort: (l) => worst(l).ratio,
            },
            { key: "v", label: "Verdict", render: (l) => <Pill tone={verdictTone[verdict(l)]}>{verdict(l)}</Pill> },
          ]}
        />
      </Panel>

      <div className="grid gap-7 lg:grid-cols-[1.3fr_1fr]">
        <Panel title="Closest to the line" sub="Every lot's worst result as a share of its limit; the rule is 1.0">
          <HBars
            max={1.5}
            format={(v) => `${v.toFixed(2)}×`}
            data={[...lots]
              .sort((a, b) => worst(b).ratio - worst(a).ratio)
              .slice(0, 8)
              .map((l) => ({ label: `${l.id} ${l.product}`, value: +worst(l).ratio.toFixed(2), sub: worst(l).p, tone: worst(l).ratio > 1 ? "late" : worst(l).ratio > 0.8 ? "warn" : "ok" }))}
          />
        </Panel>
        <Panel title="This month's verdicts" sub="Re-tests come back in 36 hours at Periyar Analytical">
          <div className="flex justify-center">
            <Donut
              center={`${Math.round((counts.Pass / lots.length) * 100)}%`}
              sub="clean"
              segments={[
                { label: "Pass", value: counts.Pass, tone: "ok" },
                { label: "Watch", value: counts.Watch, tone: "warn" },
                { label: "Fail", value: counts.Fail, tone: "late" },
                { label: "Re-testing", value: counts["Re-testing"], tone: "info" },
              ]}
            />
          </div>
        </Panel>
      </div>

      <Sheet
        open={!!lot}
        onOpenChange={(o) => !o && setOpen(null)}
        width={520}
        eyebrow={lot ? `${lot.id} · ${lot.lab}` : ""}
        title={lot ? `${lot.product} for ${lot.market}` : ""}
        sub={lot ? `Sampled ${lot.sampled} · against ${lot.shipment}` : ""}
        footer={
          lot && (
            <>
              <Btn
                icon={RotateCcw}
                disabled={lot.retesting || verdict(lot) === "Pass"}
                onClick={() => retest(lot)}
              >
                {lot.retesting ? "Re-testing…" : "Re-test retained sample"}
              </Btn>
              <Btn
                variant="solid"
                icon={CheckCheck}
                disabled={verdict(lot) === "Fail" || lot.retesting || lot.released}
                onClick={() => {
                  setLots((cur) => cur.map((x) => (x.id === lot.id ? { ...x, released: true } : x)));
                  toast.success(`${lot.id} released for shipment`, { description: "Certificate attached to the document set." });
                  desk.log(`${lot.id} released by QA`, "ok");
                }}
              >
                {lot.released ? "Released" : "Release lot"}
              </Btn>
            </>
          )
        }
      >
        {lot && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Pill tone={verdictTone[verdict(lot)]}>{verdict(lot)}</Pill>
              <span className="text-[13px] text-d-mute">
                Worst: {worst(lot).p} at {worst(lot).ratio.toFixed(2)}× the limit
              </span>
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-d-ink text-left text-[11.5px] text-d-mute">
                  <th className="pb-1.5 font-medium">Parameter</th>
                  <th className="pb-1.5 text-right font-medium">Result</th>
                  <th className="pb-1.5 text-right font-medium">Limit</th>
                  <th className="pb-1.5 pl-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {(Object.keys(lot.values) as Param[]).map((p) => {
                  const v = lot.values[p] ?? 0;
                  const r = ratioOf(p, v);
                  return (
                    <tr key={p} className="border-b border-d-line">
                      <td className="py-2">{p}</td>
                      <td className="tnum py-2 text-right font-mono" style={{ color: r > 1 ? "var(--d-late)" : undefined }}>
                        {p === "Sudan I–IV" && v === 0 ? "ND" : v}
                      </td>
                      <td className="tnum py-2 text-right font-mono text-d-mute">
                        {LIMITS[p].limit} {LIMITS[p].unit}
                      </td>
                      <td className="w-[110px] py-2 pl-3">
                        <Meter value={Math.min(r, 1.5)} max={1.5} tone={r > 1 ? "late" : r > 0.8 ? "warn" : "ok"} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="border-l-2 border-d-accent pl-3 font-serif text-[14px] italic leading-relaxed">
              {verdict(lot) === "Fail"
                ? `Options: re-test the retained sample, re-process (${worst(lot).p === "Moisture" ? "re-dry at Kalamassery" : worst(lot).p === "ETO" ? "steam-sterilise in-house" : "re-clean and blend with a clean lot"}), or divert to the domestic market.`
                : verdict(lot) === "Watch"
                  ? "Within limits but close. Fine for this buyer; keep it away from EU contracts with a 0.8× buyer spec."
                  : "Clean on every parameter. Certificate can go into the bank set."}
            </p>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Procurement ---------------- */

type Bid = { id: string; centre: string; grade: string; kg: number; cap: number; status: "Bid placed" | "Won" | "Lost" };

function ProcurementTab() {
  const desk = useDesk();
  const [rate, setRate] = React.useState(rates[0].id);
  const [bidOpen, setBidOpen] = React.useState(false);
  const [bids, setBids] = React.useState<Bid[]>([
    { id: "B-1", centre: "Bodinayakanur", grade: "8 mm bold", kg: 1850, cap: 2540, status: "Won" },
    { id: "B-2", centre: "Bodinayakanur", grade: "7 mm green", kg: 1200, cap: 2380, status: "Lost" },
  ]);
  const [openAuction, setOpenAuction] = React.useState<Auction | null>(null);
  const live = useDrift(2486, 4, 2200);
  const sel = rates.find((r) => r.id === rate) ?? rates[0];
  const bought = auctions.reduce((a, x) => a + x.ours, 0);

  return (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Bodi auction, live avg" value={`₹${Math.round(live).toLocaleString("en-IN")}`} delta="+0.6%" hint="per kg, 214 lots" icon={Gavel} trend={rates[0].trend} />
        <Stat label="Cardamom bought, 9 days" value={`${(bought / 1000).toFixed(1)} MT`} hint={`avg ₹2,451/kg`} icon={Leaf} tone="ok" />
        <Stat label="Cardamom short vs contracts" value="7.8 MT" delta="-1.9" deltaGood={false} hint="11 MT sold, 3.2 MT in stock" icon={AlertTriangle} tone="warn" />
        <Stat label="Pepper MG1, Kochi" value="₹662/kg" delta="-2.4%" deltaGood={false} hint="buyers' market, wait" icon={TrendingUp} trend={rates[2].trend} tone="info" />
      </div>

      <div className="grid gap-7 xl:grid-cols-[1fr_1.15fr]">
        <Panel title="Rate board" sub="This morning's mandi and auction prices. Click a row for its fortnight.">
          <ul className="divide-y divide-d-line">
            {rates.map((r) => {
              const d = r.now - r.trend[r.trend.length - 2];
              const on = r.id === rate;
              return (
                <li key={r.id}>
                  <button type="button" onClick={() => setRate(r.id)} className={`grid w-full grid-cols-[1fr_auto_auto] items-baseline gap-3 px-2 py-2.5 text-left transition-colors ${on ? "bg-d-soft" : "hover:bg-d-sunk/60"}`}>
                    <span className="min-w-0">
                      <span className="block truncate text-[13.5px] font-semibold">{r.name}</span>
                      <span className="block truncate font-serif text-[12px] italic text-d-mute">{r.market}</span>
                    </span>
                    <span className="tnum font-mono text-[15px] font-semibold">
                      ₹{r.now.toLocaleString("en-IN")}
                      <span className="ml-1 text-[10.5px] font-normal text-d-mute">{r.unit.replace("₹", "")}</span>
                    </span>
                    <span className="tnum w-[64px] text-right font-mono text-[12px]" style={{ color: d >= 0 ? "var(--d-ok)" : "var(--d-late)" }}>
                      {d >= 0 ? "▲" : "▼"} {Math.abs(d).toLocaleString("en-IN")}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>
        <Panel title={sel.name} sub={`${sel.market} · ${sel.unit} · last 14 days`}>
          <AreaChart labels={rateDays} series={[{ name: sel.name, data: sel.trend, tone: "accent" }, ...(sel.id === "card" ? [{ name: "Our contract break-even", data: sel.trend.map(() => 2540), tone: "late" as Tone, dashed: true }] : [])]} format={(v) => `₹${Math.round(v).toLocaleString("en-IN")}`} height={210} />
          <p className="mt-3 font-serif text-[14px] italic text-d-mute">
            {sel.id === "card"
              ? "Up 7% in a fortnight on lower Idukki arrivals. Still ₹54 under our break-even for open contracts."
              : sel.id === "chl"
                ? "Guntur arrivals rising with the new crop; Teja will soften another 4–5% by November."
                : "Watch for the Vietnam crop news on Thursday before committing."}
          </p>
        </Panel>
      </div>

      <div className="grid gap-7 xl:grid-cols-[1.2fr_1fr]">
        <Panel icon={Gavel} title="Buy recommendations" sub="Auction Scout matched open contracts to today's lots. Approved buys go to Faisal on WhatsApp.">
          <ApprovalQueue
            approveLabel="Buy"
            items={[
              { id: "R1", title: "Cardamom 8 mm bold · 2,500 kg", sub: "Bodinayakanur lots 41–58, cap ₹2,540/kg, for Al Rawabi C/26-129", amount: inr(2500 * 2525, { compact: true }), meta: "Today", tone: "accent" },
              { id: "R2", title: "Cardamom 8 mm bold · 2,000 kg", sub: "Puttady tomorrow, cap ₹2,540/kg, for Hanseatic C/26-130", amount: inr(2000 * 2520, { compact: true }), meta: "Wed" },
              { id: "R3", title: "Turmeric finger · 24 MT", sub: "Erode, Shri Murugan Traders, ₹13,300/qtl delivered Kochi", amount: inr(24 * 133000, { compact: true }), meta: "This week" },
              { id: "R4", title: "Pepper MG1 · hold", sub: "Kochi falling ₹200/qtl a day; Van der Berg covered till 10 Nov", meta: "Wait", tone: "info" },
            ]}
            onDecide={(id, d) => d && desk.log(`Buy recommendation ${id} ${d}`, d === "approved" ? "ok" : "info")}
          />
        </Panel>
        <Panel
          title="Our bids today"
          sub="Placed through the e-auction terminal at Bodi"
          action={
            <Btn size="sm" variant="solid" icon={Plus} onClick={() => setBidOpen(true)}>
              Place bid
            </Btn>
          }
        >
          <ul className="space-y-2">
            {bids.map((b) => (
              <li key={b.id} className="desk-rise flex items-center gap-3 border-b border-d-line pb-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-semibold">
                    {b.grade} · {b.kg.toLocaleString("en-IN")} kg
                  </p>
                  <p className="text-[12px] text-d-mute">
                    {b.centre} · cap ₹{b.cap.toLocaleString("en-IN")}/kg
                  </p>
                </div>
                <Pill tone={b.status === "Won" ? "ok" : b.status === "Lost" ? "late" : "info"}>{b.status}</Pill>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Auction results" sub="Spices Board e-auctions, last 9 days. Click a sale for the lot detail.">
        <DataTable
          rows={auctions}
          rowKey={(a) => a.id}
          search={(a) => `${a.auctioneer} ${a.centre} ${a.date}`}
          searchPlaceholder="Search auctioneer or centre"
          filter={{ get: (a) => a.centre, options: ["Puttady", "Bodinayakanur"] }}
          onRow={setOpenAuction}
          columns={[
            { key: "date", label: "Date", render: (a) => <span className="font-mono text-[12px]">{a.date}</span> },
            { key: "centre", label: "Centre", render: (a) => a.centre, sort: (a) => a.centre },
            { key: "auc", label: "Auctioneer", render: (a) => <span className="text-d-mute">{a.auctioneer}</span>, wide: true },
            { key: "lots", label: "Lots", align: "right", render: (a) => <span className="tnum font-mono">{a.lots}</span>, sort: (a) => a.lots },
            { key: "arr", label: "Arrived kg", align: "right", render: (a) => <span className="tnum font-mono">{a.arrived.toLocaleString("en-IN")}</span>, sort: (a) => a.arrived, wide: true },
            { key: "avg", label: "Avg ₹/kg", align: "right", render: (a) => <span className="tnum font-mono">{a.avg.toLocaleString("en-IN")}</span>, sort: (a) => a.avg },
            { key: "max", label: "Max ₹/kg", align: "right", render: (a) => <span className="tnum font-mono text-d-mute">{a.max.toLocaleString("en-IN")}</span>, sort: (a) => a.max },
            { key: "ours", label: "We bought", align: "right", render: (a) => (a.ours ? <Pill tone="ok" mono>{a.ours.toLocaleString("en-IN")} kg</Pill> : <span className="text-d-mute">—</span>), sort: (a) => a.ours },
          ]}
        />
      </Panel>

      <BidModal
        open={bidOpen}
        onOpenChange={setBidOpen}
        onPlace={(b) => {
          setBids((cur) => [b, ...cur]);
          toast.success("Bid placed", { description: `${b.kg.toLocaleString("en-IN")} kg ${b.grade} at up to ₹${b.cap}/kg, ${b.centre}` });
          desk.log(`Bid placed: ${b.kg} kg ${b.grade} cap ₹${b.cap}/kg`, "info");
        }}
      />
      <Sheet
        open={!!openAuction}
        onOpenChange={(o) => !o && setOpenAuction(null)}
        eyebrow={openAuction ? `${openAuction.id} · ${openAuction.date}` : ""}
        title={openAuction?.auctioneer ?? ""}
        sub={openAuction ? `${openAuction.centre} e-auction · ${openAuction.lots} lots` : ""}
      >
        {openAuction && (
          <div className="space-y-5">
            <KV
              items={[
                { k: "Arrived", v: `${openAuction.arrived.toLocaleString("en-IN")} kg` },
                { k: "Sold", v: `${openAuction.sold.toLocaleString("en-IN")} kg (${Math.round((openAuction.sold / openAuction.arrived) * 100)}%)` },
                { k: "Average", v: `₹${openAuction.avg.toLocaleString("en-IN")}/kg` },
                { k: "Highest", v: `₹${openAuction.max.toLocaleString("en-IN")}/kg` },
                { k: "We bought", v: openAuction.ours ? `${openAuction.ours.toLocaleString("en-IN")} kg` : "Nothing" },
                { k: "Value sold", v: inr(openAuction.sold * openAuction.avg, { compact: true }) },
              ]}
            />
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-d-mute">Price by grade</p>
              <Bars
                height={140}
                format={(v) => `₹${v}`}
                data={[
                  { label: "6 mm", value: Math.round(openAuction.avg * 0.86), tone: "neutral" },
                  { label: "7 mm", value: Math.round(openAuction.avg * 0.95), tone: "info" },
                  { label: "7.5 mm", value: Math.round(openAuction.avg * 1.0), tone: "accent" },
                  { label: "8 mm", value: Math.round(openAuction.avg * 1.08), tone: "accent" },
                  { label: "8 mm+", value: Math.round(openAuction.max * 0.97), tone: "ok" },
                ]}
              />
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

function BidModal({ open, onOpenChange, onPlace }: { open: boolean; onOpenChange: (o: boolean) => void; onPlace: (b: Bid) => void }) {
  const [centre, setCentre] = React.useState("Bodinayakanur");
  const [grade, setGrade] = React.useState("8 mm bold");
  const [kg, setKg] = React.useState("1500");
  const [cap, setCap] = React.useState("2540");
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Place an auction bid" sub="Faisal places it on the terminal; the cap is the most we pay per kg.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onPlace({ id: `B-${centre}-${grade}-${kg}-${cap}`, centre, grade, kg: Number(kg) || 1000, cap: Number(cap) || 2500, status: "Bid placed" });
          onOpenChange(false);
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Centre">
            <select className={inputClass} value={centre} onChange={(e) => setCentre(e.target.value)}>
              <option>Bodinayakanur</option>
              <option>Puttady</option>
            </select>
          </Field>
          <Field label="Grade">
            <select className={inputClass} value={grade} onChange={(e) => setGrade(e.target.value)}>
              {["8 mm bold", "7.5 mm", "7 mm green", "6 mm", "Fruit / rejections"].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </Field>
          <Field label="Quantity (kg)">
            <input className={inputClass} inputMode="numeric" value={kg} onChange={(e) => setKg(e.target.value.replace(/\D/g, ""))} />
          </Field>
          <Field label="Cap (₹/kg)">
            <input className={inputClass} inputMode="numeric" value={cap} onChange={(e) => setCap(e.target.value.replace(/\D/g, ""))} />
          </Field>
        </div>
        <p className="text-[12px] text-d-mute">At this cap the bid is worth up to {inr((Number(kg) || 0) * (Number(cap) || 0), { compact: true })}.</p>
        <div className="flex justify-end gap-2 pt-1">
          <Btn onClick={() => onOpenChange(false)}>Cancel</Btn>
          <Btn variant="solid" type="submit" icon={Gavel}>
            Place bid
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Documents ---------------- */

function DocumentsTab({ ships }: { ships: Shipment[] }) {
  const desk = useDesk();
  const [docs, setDocs] = React.useState(seedDocs);
  const live = ships.filter((s) => s.status !== "Delivered");
  const [pick, setPick] = React.useState(live[0]?.id ?? ships[0].id);
  const [done, setDone] = React.useState<Record<string, string[]>>(() =>
    Object.fromEntries(ships.map((s) => [s.id, marketDocs[ports[s.port].region].slice(0, s.progress >= 1 ? 99 : s.progress > 0.3 ? 5 : s.progress > 0 ? 3 : 1)])),
  );
  const ship = ships.find((s) => s.id === pick) ?? ships[0];
  const required = marketDocs[ports[ship.port].region];
  const readiness = (s: Shipment) => {
    const req = marketDocs[ports[s.port].region];
    return Math.round(((done[s.id] ?? []).filter((d) => req.includes(d)).length / req.length) * 100);
  };

  return (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Documents open" value={docs.filter((d) => d.col === "prep" || d.col === "cha").length} hint="across 6 shipments" icon={FileCheck2} tone="warn" />
        <Stat label="Sets at bank" value={docs.filter((d) => d.col === "bank").length} hint="awaiting payment" icon={Landmark} />
        <Stat label="Average days, BL to bank" value="4.2" delta="-1.1" deltaGood={false} hint="LCs allow 21" icon={Timer} tone="ok" trend={[7.1, 6.4, 6.0, 5.6, 5.1, 4.6, 4.2]} />
        <Stat label="Phyto cut-off today" value="1 PM" hint="Plant Quarantine, Willingdon Is." icon={CalendarClock} tone="late" />
      </div>

      <Panel title="Document desk" sub="Drag a card as it moves: drafted, with the agency, original in hand, presented to the bank.">
        <Board
          columns={docCols}
          items={docs}
          itemKey={(d) => d.id}
          getColumn={(d) => d.col}
          minColumnWidth={220}
          onMove={(key, col) => {
            const d = docs.find((x) => x.id === key);
            setDocs((cur) => cur.map((x) => (x.id === key ? { ...x, col: col as DocCol } : x)));
            const label = docCols.find((c) => c.id === col)?.label;
            if (d) {
              toast.success(`${d.doc} → ${label}`, { description: d.ship });
              desk.log(`${d.ship}: ${d.doc} moved to ${label}`);
            }
          }}
          renderCard={(d) => (
            <div>
              <p className="pr-4 text-[13px] font-semibold leading-snug">{d.doc}</p>
              <p className="mt-0.5 font-mono text-[11px] text-d-accent">{d.ship}</p>
              <p className="mt-1.5 flex items-center justify-between gap-2 text-[11.5px] text-d-mute">
                <span className="truncate">{d.by}</span>
                <span className="shrink-0 font-mono">{d.due}</span>
              </p>
            </div>
          )}
        />
      </Panel>

      <div className="grid gap-7 lg:grid-cols-[1fr_1fr]">
        <Panel title="Checklist by shipment" sub={`${ports[ship.port].region} rules · ${ship.buyer}`} action={<Pill tone="accent" mono>{readiness(ship)}%</Pill>}>
          <div className="mb-3">
            <select className={inputClass} value={pick} onChange={(e) => setPick(e.target.value)}>
              {ships.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} · {s.product} → {ports[s.port].name}
                </option>
              ))}
            </select>
          </div>
          <Checklist
            items={required.map((r) => ({ id: r, label: r, sub: r.includes("lab") || r.includes("ETO") ? "From Lab & quality" : r.includes("Bill of lading") ? ship.bl : undefined, done: (done[ship.id] ?? []).includes(r) }))}
            onToggle={(id) => {
              const has = (done[ship.id] ?? []).includes(id);
              setDone((cur) => ({ ...cur, [ship.id]: has ? (cur[ship.id] ?? []).filter((x) => x !== id) : [...(cur[ship.id] ?? []), id] }));
              if (!has) desk.log(`${ship.id}: ${id} ticked`, "ok");
            }}
          />
        </Panel>
        <Panel title="Readiness" sub="Share of required documents in hand per shipment">
          <ul className="space-y-3">
            {ships.map((s) => {
              const r = readiness(s);
              return (
                <li key={s.id}>
                  <button type="button" onClick={() => setPick(s.id)} className="w-full text-left">
                    <p className="mb-1 flex items-baseline justify-between text-[12.5px]">
                      <span className={s.id === pick ? "font-semibold" : ""}>
                        {s.id} · {ports[s.port].name}
                      </span>
                      <span className="tnum font-mono text-d-mute">{r}%</span>
                    </p>
                    <Meter value={r} tone={r === 100 ? "ok" : r >= 60 ? "accent" : "warn"} />
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

/* ---------------- Buyers & dues ---------------- */

function DuesTab() {
  const desk = useDesk();
  const [rows, setRows] = React.useState(invoices);
  const [open, setOpen] = React.useState<Invoice | null>(null);
  const [sent, setSent] = React.useState<Set<string>>(new Set());
  const total = rows.reduce((a, i) => a + i.amount, 0);
  const bucket = (d: number) => (d <= 30 ? "0–30 days" : d <= 60 ? "31–60 days" : d <= 90 ? "61–90 days" : "90+ days");
  const buckets = ["0–30 days", "31–60 days", "61–90 days", "90+ days"].map((label, i) => ({ label, value: rows.filter((x) => bucket(x.days) === label).reduce((a, x) => a + x.amount, 0), tone: (["ok", "info", "warn", "late"] as const)[i] }));
  const tone: Record<Invoice["status"], Tone> = { "Awaiting docs acceptance": "info", "Accepted, due": "accent", Overdue: "late", Discrepancy: "warn", "Paid part": "ok" };

  return (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Outstanding" value={usdK(total)} hint={inr(total * FX, { compact: true })} delta="-6%" deltaGood={false} icon={Receipt} trend={[0.98, 0.95, 0.93, 0.9, 0.88, 0.86, total / 1e6]} />
        <Stat label="Over 75 days" value={usdK(rows.filter((i) => i.days > 75).reduce((a, i) => a + i.amount, 0))} hint={`${rows.filter((i) => i.days > 75).length} invoices, ${new Set(rows.filter((i) => i.days > 75).map((i) => i.buyer)).size} buyers`} icon={AlertTriangle} tone="late" />
        <Stat label="Landing this week" value="$260,900" hint="Coastal Spice today, Van der Berg 23 Oct" icon={CalendarClock} tone="ok" />
        <Stat label="eBRCs pending" value="6" hint="₹1.9 Cr realised, not yet on DGFT" icon={ScrollText} tone="warn" />
      </div>
      <Panel title="Ageing" sub="Days since invoice, all terms. Reminders go out at 2 PM IST, Europe's morning.">
        <AgingBar buckets={buckets} format={(v) => usdK(v)} />
      </Panel>
      <div className="grid gap-7 xl:grid-cols-[1fr_340px]">
        <Panel title="Export invoices" sub="Select rows to send reminders; click one for the draft">
          <DataTable
            rows={rows}
            rowKey={(i) => i.no}
            search={(i) => `${i.no} ${i.buyer} ${i.ship} ${i.country}`}
            searchPlaceholder="Search invoice, buyer or shipment"
            filter={{ get: (i) => bucket(i.days), options: ["0–30 days", "31–60 days", "61–90 days", "90+ days"] }}
            onRow={setOpen}
            bulk={[{ label: "Send email reminders", run: (k) => { setSent((s) => new Set([...s, ...k])); toast.success(`${k.length} reminders sent`); desk.log(`${k.length} dues reminders emailed`); } }]}
            columns={[
              { key: "no", label: "Invoice", render: (i) => <span className="font-mono text-[12px]">{i.no}</span> },
              { key: "buyer", label: "Buyer", render: (i) => <span className="font-medium">{i.buyer}</span>, sort: (i) => i.buyer },
              { key: "terms", label: "Terms", render: (i) => <span className="text-[12px] text-d-mute">{i.terms}</span>, wide: true },
              { key: "amt", label: "Amount", align: "right", render: (i) => <span className="tnum font-mono">{usd(i.amount)}</span>, sort: (i) => i.amount },
              { key: "days", label: "Days", align: "right", render: (i) => <span className="tnum font-mono" style={{ color: i.days > 90 ? "var(--d-late)" : i.days > 60 ? "var(--d-warn)" : undefined }}>{i.days}</span>, sort: (i) => i.days },
              { key: "st", label: "Status", render: (i) => (sent.has(i.no) ? <Pill tone="info">Reminded</Pill> : <Pill tone={tone[i.status]}>{i.status}</Pill>) },
            ]}
          />
        </Panel>
        <div className="space-y-7">
          <Panel title="By buyer" sub="Outstanding, USD">
            <HBars
              format={(v) => usdK(v)}
              data={Object.entries(rows.reduce<Record<string, number>>((acc, i) => ({ ...acc, [i.buyer]: (acc[i.buyer] ?? 0) + i.amount }), {}))
                .sort((a, b) => b[1] - a[1])
                .map(([label, value]) => ({ label: label.replace(/ (LLC|BV|GmbH|Inc|Sdn Bhd|Co)$/, ""), value }))}
            />
          </Panel>
          <Panel title="Expected receipts" sub="Maturities and promises, $k">
            <Bars height={150} format={(v) => `$${v}k`} data={[{ label: "This wk", value: 261, tone: "ok" }, { label: "Next wk", value: 104, tone: "accent" }, { label: "Wk 3", value: 214, tone: "accent" }, { label: "Wk 4", value: 62, tone: "info" }, { label: "Later", value: 205, tone: "late" }]} />
          </Panel>
        </div>
      </div>
      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={open?.no}
        title={open?.buyer ?? ""}
        sub={open ? `${usd(open.amount)} · ${open.days} days · ${open.terms} · ${open.country}` : ""}
        footer={
          open && (
            <>
              <Btn
                icon={CheckCheck}
                onClick={() => {
                  setRows((cur) => cur.filter((i) => i.no !== open.no));
                  toast.success("Marked realised", { description: `${usd(open.amount)} · eBRC queued on DGFT` });
                  desk.log(`${open.no} realised, eBRC queued`, "ok");
                  setOpen(null);
                }}
              >
                Mark realised
              </Btn>
              <Btn
                variant="solid"
                icon={MessageCircle}
                onClick={() => {
                  setSent((s) => new Set(s).add(open.no));
                  toast.success("Reminder sent", { description: `${open.buyer}, email + WhatsApp` });
                  desk.log(`Reminder sent to ${open.buyer} for ${usd(open.amount)}`);
                  setOpen(null);
                }}
              >
                Send reminder
              </Btn>
            </>
          )
        }
      >
        {open && (
          <div className="space-y-5">
            <div className="border-l-2 border-d-accent bg-d-soft/60 p-4 font-serif text-[14px] leading-relaxed">
              Dear team at {open.buyer}, a gentle note from Malabar Spice House on invoice {open.no} for {open.ship}, {usd(open.amount)}, dated {open.raised}. It is {open.days} days old against {open.terms} terms. Our bank details and the shipping documents are attached again for convenience. With warm regards from Kochi, Sreeja P., Accounts.
            </div>
            <KV
              items={[
                { k: "Raised", v: open.raised },
                { k: "Terms", v: open.terms },
                { k: "Status", v: <Pill tone={tone[open.status]}>{open.status}</Pill> },
                { k: "Promise", v: open.promise ?? "None yet" },
                { k: "In rupees", v: inr(open.amount * FX, { compact: true }) },
                { k: "Shipment", v: open.ship },
              ]}
            />
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-d-mute">History</p>
              <ul className="space-y-1.5 text-[13px]">
                {[
                  `${open.raised}: invoice and documents sent`,
                  open.days > 30 ? "Day 30: first reminder, acknowledged" : "Documents acknowledged by the buyer",
                  ...(open.days > 60 ? ["Day 60: call with buyer's finance team"] : []),
                  ...(open.promise ? [`Latest: ${open.promise}`] : []),
                ].map((h) => (
                  <li key={h} className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-d-accent" /> {h}
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
