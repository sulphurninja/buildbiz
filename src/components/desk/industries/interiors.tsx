"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Bot,
  Calculator,
  CalendarClock,
  CheckCheck,
  ClipboardList,
  Eye,
  EyeOff,
  Factory,
  FileText,
  Gauge as GaugeIcon,
  Hammer,
  IndianRupee,
  MapPin,
  MessageCircle,
  Move,
  Package,
  Phone,
  Plug,
  Plus,
  RotateCcw,
  Ruler,
  Save,
  Send,
  Sofa,
  Trash,
  TriangleAlert,
  Truck,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import { DeskShell, useDesk } from "../shell";
import { Bars, Donut, HBars } from "../charts";
import { AgingBar, ApprovalQueue, Board, Checklist, Countdown, DataTable, Gantt, type GanttRow } from "../data";
import { AgentsModule, ConnectionsModule, IndependenceModule, PeopleModule } from "../common";
import { Avatar, Btn, Field, IconBtn, inputClass, inr, KV, Meter, Modal, Panel, Pill, Segmented, Sheet, Stat } from "../ui";
import { useDrift } from "../hooks";
import type { DeskConfig, DeskModule, IndependenceData, Integration, TeamMember, Tone, WorkforceAgent } from "../types";

/* ============================================================
   Data — Cauvery Interiors, Coimbatore. Fictional uPVC windows,
   modular kitchens and wardrobes. Showroom on Avinashi Road,
   factory at Kurichi SIDCO. Today = Tue 20 Oct.
   ============================================================ */

type Kind = "window" | "door" | "wardrobe" | "kitchen" | "unit";
type PlanItem = { id: string; kind: Kind; label: string; room: string; x: number; y: number; w: number; d: number; h: number; axis?: "x" | "y"; variant: number; on: boolean };

const FLAT_W = 40;
const FLAT_D = 28;
const S = 20; // px per foot

const OPTIONS: Record<Kind, { name: string; rate: number }[]> = {
  window: [
    { name: "Sliding 2-track · 5mm clear", rate: 520 },
    { name: "Sliding 3-track · SS mesh · 6mm toughened", rate: 690 },
    { name: "Casement 70mm · DGU 5+12+5", rate: 940 },
  ],
  door: [
    { name: "Slide & fold 60mm · toughened", rate: 880 },
    { name: "French casement · DGU", rate: 1080 },
    { name: "Lift & slide 88mm · laminated", rate: 1420 },
  ],
  wardrobe: [
    { name: "BWR ply + 1mm laminate", rate: 1450 },
    { name: "Acrylic high-gloss shutters", rate: 1950 },
    { name: "Walnut veneer · PU matte", rate: 2650 },
  ],
  kitchen: [
    { name: "Marine ply · laminate · SS baskets", rate: 3900 },
    { name: "Acrylic shutters · soft-close", rate: 5400 },
    { name: "PU lacquer · quartz-ready carcass", rate: 6900 },
  ],
  unit: [
    { name: "Laminate on BWR ply", rate: 1300 },
    { name: "Fluted veneer + profile light", rate: 1850 },
    { name: "Veneer + back-painted glass", rate: 2400 },
  ],
};
const KIND_LABEL: Record<Kind, string> = { window: "Window", door: "Door", wardrobe: "Wardrobe", kitchen: "Kitchen", unit: "Unit" };
const PACKAGES = ["Essential", "Signature", "Luxe"] as const;
type Pkg = (typeof PACKAGES)[number];

const lengthOf = (it: PlanItem) => Math.max(it.w, it.d);
const basisOf = (it: PlanItem) => (it.kind === "kitchen" ? lengthOf(it) : lengthOf(it) * it.h);
const unitOf = (it: PlanItem) => (it.kind === "kitchen" ? "rft" : "sq ft");
const priceOf = (it: PlanItem) => Math.round(basisOf(it) * OPTIONS[it.kind][it.variant].rate);
const layerOf = (k: Kind) => (k === "window" || k === "door" ? "Windows" : k === "kitchen" ? "Kitchen" : "Furniture");
const ft = (v: number) => {
  const f = Math.floor(v + 1e-6);
  const inch = Math.round((v - f) * 12);
  return `${f}'${inch ? ` ${inch}"` : ""}`;
};

const rooms = [
  { name: "Living & dining", x: 0, y: 0, w: 22, d: 16, fill: "#f6eee2" },
  { name: "Kitchen", x: 22, y: 0, w: 12, d: 10, fill: "#efe5d6" },
  { name: "Utility", x: 34, y: 0, w: 6, d: 10, fill: "#e8eef0" },
  { name: "Bath 2", x: 22, y: 10, w: 6, d: 6, fill: "#e5edf0" },
  { name: "Bedroom 2", x: 28, y: 10, w: 12, d: 18, fill: "#f3ebdf" },
  { name: "Bedroom 1", x: 0, y: 16, w: 14, d: 12, fill: "#f3ebdf" },
  { name: "Bath 1", x: 14, y: 16, w: 6, d: 6, fill: "#e5edf0" },
  { name: "Pooja", x: 14, y: 22, w: 6, d: 6, fill: "#f4e7d2" },
  { name: "Passage", x: 20, y: 16, w: 8, d: 12, fill: "#f8f3ec" },
];

const seedItems: PlanItem[] = [
  { id: "W1", kind: "window", label: "Living front window", room: "Living & dining", x: 4, y: -0.25, w: 8, d: 0.5, h: 5, axis: "x", variant: 1, on: true },
  { id: "D1", kind: "door", label: "Balcony door", room: "Living & dining", x: -0.25, y: 3, w: 0.5, d: 7, h: 7, axis: "y", variant: 0, on: true },
  { id: "W2", kind: "window", label: "Kitchen window", room: "Kitchen", x: 25, y: -0.25, w: 4, d: 0.5, h: 4, axis: "x", variant: 0, on: true },
  { id: "W3", kind: "window", label: "Utility ventilator", room: "Utility", x: 35.5, y: -0.25, w: 3, d: 0.5, h: 2.5, axis: "x", variant: 0, on: true },
  { id: "W4", kind: "window", label: "Bedroom 1 window", room: "Bedroom 1", x: -0.25, y: 18, w: 0.5, d: 6, h: 5, axis: "y", variant: 1, on: true },
  { id: "W5", kind: "window", label: "Bedroom 2 side window", room: "Bedroom 2", x: 39.75, y: 12, w: 0.5, d: 6, h: 5, axis: "y", variant: 1, on: true },
  { id: "W6", kind: "window", label: "Bedroom 2 rear window", room: "Bedroom 2", x: 31, y: 27.75, w: 6, d: 0.5, h: 4, axis: "x", variant: 1, on: true },
  { id: "WR1", kind: "wardrobe", label: "Bedroom 1 wardrobe", room: "Bedroom 1", x: 4, y: 26, w: 8, d: 2, h: 7, variant: 0, on: true },
  { id: "WR2", kind: "wardrobe", label: "Bedroom 2 wardrobe", room: "Bedroom 2", x: 38, y: 19.5, w: 2, d: 7.5, h: 7, variant: 1, on: true },
  { id: "K1", kind: "kitchen", label: "Base + wall run", room: "Kitchen", x: 22.2, y: 0, w: 11.8, d: 2, h: 3, variant: 1, on: true },
  { id: "K2", kind: "kitchen", label: "L-return with hob", room: "Kitchen", x: 32, y: 2, w: 2, d: 6, h: 3, variant: 1, on: true },
  { id: "T1", kind: "unit", label: "Tall pantry", room: "Kitchen", x: 22.2, y: 7, w: 3, d: 2, h: 7, variant: 0, on: true },
  { id: "TV1", kind: "unit", label: "TV unit with storage", room: "Living & dining", x: 8, y: 14.6, w: 8, d: 1.4, h: 4, variant: 1, on: true },
  { id: "CR1", kind: "unit", label: "Crockery unit", room: "Living & dining", x: 0, y: 11, w: 1.5, d: 4.5, h: 6, variant: 0, on: true },
  { id: "ST1", kind: "unit", label: "Study desk + loft", room: "Bedroom 2", x: 29, y: 10.2, w: 5, d: 2, h: 3, variant: 0, on: false },
  { id: "PJ1", kind: "unit", label: "Pooja unit, CNC jaali", room: "Pooja", x: 15, y: 26.4, w: 4, d: 1.5, h: 5, variant: 2, on: true },
];

function quoteTotals(items: PlanItem[], discount = 0) {
  const sub = items.filter((i) => i.on).reduce((a, i) => a + priceOf(i), 0);
  const disc = Math.round(sub * discount);
  const install = Math.round((sub - disc) * 0.04);
  const taxable = sub - disc + install;
  const gst = Math.round(taxable * 0.18);
  return { sub, disc, install, taxable, gst, total: taxable + gst };
}
const SENT_R2 = 712600;

/* ---------------- Leads ---------------- */

const LEAD_STAGES = ["New", "Measure booked", "Measured", "Quote sent", "Negotiation", "Won", "Lost"] as const;
type LeadStage = (typeof LEAD_STAGES)[number];
type Lead = { id: string; name: string; area: string; flat: string; source: string; need: string; budget: number; stage: LeadStage; owner: string; next: string; age: number; phone: string };

const seedLeads: Lead[] = [
  { id: "L-2141", name: "Dr. Anitha Raghavan", area: "Saravanampatti", flat: "3BHK, Noyyal Heights C-702", source: "Instagram", need: "7 windows, 2 wardrobes, kitchen", budget: 750000, stage: "Negotiation", owner: "Divya", next: "Walk through R3 on the planner, 11 AM", age: 9, phone: "98430 21187" },
  { id: "L-2156", name: "Prabhu Venkatesan", area: "Vadavalli", flat: "Independent villa, Marudham Enclave", source: "Referral", need: "14 uPVC windows, 3 French doors", budget: 940000, stage: "Measured", owner: "Prakash", next: "Quote due tomorrow", age: 4, phone: "94431 66520" },
  { id: "L-2160", name: "Meenakshi Sundaram", area: "RS Puram", flat: "2BHK resale, Siruvani Residency", source: "Walk-in", need: "Kitchen + 2 wardrobes", budget: 520000, stage: "Measure booked", owner: "Divya", next: "Site measure 9:30 AM today", age: 2, phone: "99940 18833" },
  { id: "L-2133", name: "Ar. Kavitha Menon (for client)", area: "Race Course", flat: "Office floor, 4,200 sq ft", source: "Architect", need: "Partitions + 22 windows", budget: 2650000, stage: "Quote sent", owner: "Karthik", next: "Viewed twice, follow up Thu", age: 15, phone: "98422 70415" },
  { id: "L-2162", name: "Sathish & Nandhini", area: "Kalapatti", flat: "3BHK, Velliangiri Towers 5C", source: "JustDial", need: "Full interiors", budget: 1500000, stage: "New", owner: "Fathima", next: "Call back before 1 PM", age: 0, phone: "90036 44120" },
  { id: "L-2128", name: "Ramesh Gounder", area: "Sulur", flat: "Farmhouse, 6 rooms", source: "Referral", need: "18 casement windows, mosquito mesh", budget: 780000, stage: "Won", owner: "Prakash", next: "Advance received, drawing sign-off", age: 21, phone: "94860 31277" },
  { id: "L-2149", name: "Jayashree Iyer", area: "Saibaba Colony", flat: "Old bungalow renovation", source: "Google", need: "Replace 11 wooden windows with uPVC", budget: 610000, stage: "Quote sent", owner: "Divya", next: "Wants woodgrain sample", age: 7, phone: "98946 05512" },
  { id: "L-2158", name: "Mohammed Rafiq", area: "Ukkadam", flat: "Shop + upstairs 2BHK", source: "Walk-in", need: "Shop front glazing + 1 kitchen", budget: 430000, stage: "Measured", owner: "Prakash", next: "Waiting on landlord OK", age: 5, phone: "99525 77801" },
  { id: "L-2163", name: "Lakshmi Priya", area: "Ganapathy", flat: "2BHK, Kovai Greens B-204", source: "Instagram", need: "Wardrobes + TV unit", budget: 280000, stage: "New", owner: "Fathima", next: "Send catalogue on WhatsApp", age: 0, phone: "97890 12046" },
  { id: "L-2117", name: "Senthil Nathan", area: "Thudiyalur", flat: "Duplex, 4BHK", source: "Google", need: "Windows only", budget: 690000, stage: "Lost", owner: "Divya", next: "Went with aluminium, ₹1.4 L cheaper", age: 28, phone: "94424 80091" },
  { id: "L-2152", name: "Bhuvana Krishnan", area: "Peelamedu", flat: "3BHK, Marudham Enclave", source: "Referral", need: "Kitchen PU + 3 wardrobes", budget: 1050000, stage: "Negotiation", owner: "Karthik", next: "Wants 10% off; floor is 8%", age: 11, phone: "98430 55267" },
  { id: "L-2161", name: "Arul Selvan", area: "Singanallur", flat: "1BHK rental upgrade", source: "JustDial", need: "Sliding windows x4", budget: 95000, stage: "Measure booked", owner: "Prakash", next: "Measure Thu 4 PM", age: 1, phone: "90805 33218" },
  { id: "L-2145", name: "Gayathri Ramanathan", area: "Kovaipudur", flat: "Villa, Siruvani Hills", source: "Architect", need: "Lift & slide doors, 3 nos", budget: 840000, stage: "Quote sent", owner: "Karthik", next: "Price check against German profile", age: 8, phone: "98940 61128" },
  { id: "L-2164", name: "Dinesh Kumar", area: "Podanur", flat: "2BHK, railway quarters lease", source: "Walk-in", need: "Modular kitchen only", budget: 210000, stage: "New", owner: "Fathima", next: "Book site measure", age: 0, phone: "93617 20944" },
];
const stageTone: Record<LeadStage, Tone> = { New: "info", "Measure booked": "accent", Measured: "accent", "Quote sent": "warn", Negotiation: "warn", Won: "ok", Lost: "late" };

type Opening = { id: string; room: string; type: string; w: number; h: number; sill: number; note: string; verified: boolean };
const seedOpenings: Opening[] = [
  { id: "O1", room: "Living", type: "Sliding 3-track", w: 2440, h: 1520, sill: 760, note: "Chajja above, 150mm projection", verified: true },
  { id: "O2", room: "Living", type: "Slide & fold door", w: 2130, h: 2135, sill: 0, note: "Floor level not true, 12mm slope", verified: true },
  { id: "O3", room: "Kitchen", type: "Casement + vent", w: 1220, h: 1220, sill: 1060, note: "Over sink, exhaust cut-out 150Ø", verified: true },
  { id: "O4", room: "Bedroom 1", type: "Sliding 2-track", w: 1830, h: 1520, sill: 760, note: "Grill to be removed by client", verified: false },
  { id: "O5", room: "Bedroom 2", type: "Sliding 2-track", w: 1830, h: 1520, sill: 760, note: "Out of square by 8mm", verified: false },
  { id: "O6", room: "Bedroom 2", type: "Casement", w: 1520, h: 1220, sill: 900, note: "AC pipe through frame side", verified: false },
  { id: "O7", room: "Bath 1", type: "Top-hung ventilator", w: 610, h: 460, sill: 1830, note: "Frosted glass", verified: true },
  { id: "O8", room: "Bath 2", type: "Top-hung ventilator", w: 610, h: 460, sill: 1830, note: "Frosted glass", verified: true },
  { id: "O9", room: "Utility", type: "Fixed + louvre", w: 915, h: 760, sill: 1220, note: "Washing machine below", verified: false },
];

/* ---------------- Quotes ---------------- */

type QuoteRow = { no: string; client: string; scope: string; value: number; margin: number; sent: string; rev: string; status: "Draft" | "Sent" | "Viewed" | "Revised" | "Accepted" | "Expired"; validDays: number };
const quotes: QuoteRow[] = [
  { no: "CI/Q/26-27/418", client: "Dr. Anitha Raghavan", scope: "Windows + wardrobes + kitchen", value: 712600, margin: 31, sent: "16 Oct", rev: "R2", status: "Revised", validDays: 11 },
  { no: "CI/Q/26-27/412", client: "Ar. Kavitha Menon", scope: "Office partitions + 22 windows", value: 2618000, margin: 27, sent: "6 Oct", rev: "R1", status: "Viewed", validDays: 1 },
  { no: "CI/Q/26-27/421", client: "Jayashree Iyer", scope: "11 windows, woodgrain", value: 598200, margin: 34, sent: "14 Oct", rev: "R1", status: "Sent", validDays: 9 },
  { no: "CI/Q/26-27/415", client: "Bhuvana Krishnan", scope: "PU kitchen + 3 wardrobes", value: 1064000, margin: 29, sent: "10 Oct", rev: "R3", status: "Revised", validDays: 5 },
  { no: "CI/Q/26-27/423", client: "Gayathri Ramanathan", scope: "3 lift & slide doors", value: 826500, margin: 26, sent: "13 Oct", rev: "R1", status: "Viewed", validDays: 8 },
  { no: "CI/Q/26-27/409", client: "Ramesh Gounder", scope: "18 casement + mesh", value: 772400, margin: 33, sent: "29 Sep", rev: "R2", status: "Accepted", validDays: 0 },
  { no: "CI/Q/26-27/401", client: "Senthil Nathan", scope: "Windows only", value: 688000, margin: 30, sent: "21 Sep", rev: "R1", status: "Expired", validDays: 0 },
  { no: "CI/Q/26-27/425", client: "Prabhu Venkatesan", scope: "14 windows + 3 French doors", value: 948600, margin: 32, sent: "—", rev: "R0", status: "Draft", validDays: 15 },
  { no: "CI/Q/26-27/419", client: "Mohammed Rafiq", scope: "Shop glazing + kitchen", value: 418900, margin: 28, sent: "15 Oct", rev: "R1", status: "Sent", validDays: 10 },
  { no: "CI/Q/26-27/406", client: "Kovai Greens RWA", scope: "Clubhouse windows, 26 nos", value: 1340000, margin: 22, sent: "25 Sep", rev: "R2", status: "Accepted", validDays: 0 },
  { no: "CI/Q/26-27/422", client: "Sathish & Nandhini", scope: "Full interiors, budget pack", value: 1460000, margin: 30, sent: "—", rev: "R0", status: "Draft", validDays: 15 },
];
const quoteTone: Record<QuoteRow["status"], Tone> = { Draft: "neutral", Sent: "info", Viewed: "accent", Revised: "warn", Accepted: "ok", Expired: "late" };

const WIN_TYPES = [
  { name: "Sliding 2-track", rate: 420, panes: 2, style: "slide" },
  { name: "Sliding 3-track (mesh)", rate: 520, panes: 3, style: "slide" },
  { name: "Casement 60mm", rate: 610, panes: 2, style: "case" },
  { name: "Casement 70mm multi-chamber", rate: 720, panes: 2, style: "case" },
  { name: "French door", rate: 780, panes: 2, style: "door" },
  { name: "Fixed + top-hung vent", rate: 380, panes: 1, style: "vent" },
] as const;
const GLASS = [
  { name: "5mm clear", rate: 0 },
  { name: "6mm toughened", rate: 85 },
  { name: "6.38mm laminated", rate: 160 },
  { name: "DGU 5+12+5", rate: 240 },
  { name: "Reflective 6mm", rate: 110 },
];
const HARDWARE = [
  { name: "Standard zinc handles", rate: 900 },
  { name: "Multipoint locking", rate: 2600 },
  { name: "Concealed premium", rate: 4200 },
];
const COLOURS = [
  { name: "White", mult: 1, swatch: "#f4f4f2" },
  { name: "Walnut woodgrain", mult: 1.18, swatch: "repeating-linear-gradient(100deg,#6b442c 0 3px,#87583b 3px 6px)" },
  { name: "Golden oak", mult: 1.18, swatch: "repeating-linear-gradient(100deg,#b07a3f 0 3px,#c89257 3px 6px)" },
  { name: "Anthracite grey", mult: 1.22, swatch: "#3d4246" },
];
const MESH = [
  { name: "No mesh", rate: 0 },
  { name: "SS 304 mesh", rate: 95 },
  { name: "Pleated mesh", rate: 150 },
];
type Config = { type: number; glass: number; hw: number; colour: number; mesh: number; w: number; h: number; qty: number; room: string };
type QLine = Config & { id: string };
function lineArea(c: Config) {
  return Math.max(10, (c.w * c.h) / 92903);
}
function linePrice(c: Config) {
  const area = lineArea(c);
  const per = area * (WIN_TYPES[c.type].rate + GLASS[c.glass].rate + MESH[c.mesh].rate) * COLOURS[c.colour].mult + HARDWARE[c.hw].rate;
  return Math.round(per * c.qty);
}

/* ---------------- Factory ---------------- */

const FSTAGES = [
  { id: "drawing", label: "Drawing signed", tone: "info" as Tone, limit: 4, hint: "Cut-list goes to the saw" },
  { id: "cutting", label: "Cutting", tone: "accent" as Tone, limit: 3, hint: "Profile saw · panel saw" },
  { id: "weld", label: "Weld / edge band", tone: "accent" as Tone, limit: 3, hint: "4-head welder · edge bander" },
  { id: "glaze", label: "Glazing & hardware", tone: "warn" as Tone, limit: 3, hint: "Beading, gaskets, hinges" },
  { id: "qc", label: "QC & pack", tone: "warn" as Tone, limit: 2, hint: "Water test, squareness" },
  { id: "ready", label: "Ready to dispatch", tone: "ok" as Tone, hint: "Bubble-wrapped, tagged" },
];
type FOrder = { id: string; client: string; item: string; line: "Windows" | "Furniture"; stage: string; due: string; units: number; rush?: boolean; hold?: string };
const seedOrders: FOrder[] = [
  { id: "FO-0931", client: "Ramesh Gounder", item: "18 casement, SS mesh", line: "Windows", stage: "weld", due: "24 Oct", units: 18 },
  { id: "FO-0934", client: "Kovai Greens RWA", item: "26 sliding, clubhouse", line: "Windows", stage: "glaze", due: "22 Oct", units: 26, rush: true },
  { id: "FO-0936", client: "Dr. Anitha Raghavan", item: "Kitchen carcass, acrylic", line: "Furniture", stage: "drawing", due: "2 Nov", units: 14, hold: "R3 not signed" },
  { id: "FO-0927", client: "Harini Balaji", item: "3 wardrobes, laminate", line: "Furniture", stage: "qc", due: "21 Oct", units: 9 },
  { id: "FO-0929", client: "Vignesh Textiles office", item: "Partition frames", line: "Windows", stage: "ready", due: "20 Oct", units: 11 },
  { id: "FO-0938", client: "Bhuvana Krishnan", item: "PU kitchen shutters", line: "Furniture", stage: "drawing", due: "6 Nov", units: 22 },
  { id: "FO-0932", client: "Suresh & Co, Tiruppur", item: "12 sliding, 3-track", line: "Windows", stage: "cutting", due: "27 Oct", units: 12 },
  { id: "FO-0933", client: "Malini Arumugam", item: "TV unit + crockery", line: "Furniture", stage: "cutting", due: "28 Oct", units: 6 },
  { id: "FO-0925", client: "Sri Ganesh Hospital", item: "Ward windows, DGU", line: "Windows", stage: "qc", due: "21 Oct", units: 16, rush: true },
  { id: "FO-0937", client: "Kumaravel Villa", item: "French doors x3", line: "Windows", stage: "weld", due: "29 Oct", units: 3 },
  { id: "FO-0930", client: "Revathi Hari", item: "Kitchen + loft, marine ply", line: "Furniture", stage: "glaze", due: "25 Oct", units: 18 },
  { id: "FO-0926", client: "Arun Prasad", item: "Wardrobe + study", line: "Furniture", stage: "ready", due: "20 Oct", units: 7 },
  { id: "FO-0939", client: "Jayashree Iyer", item: "11 casement, walnut foil", line: "Windows", stage: "drawing", due: "8 Nov", units: 11, hold: "Awaiting quote OK" },
];

/* ---------------- Installs ---------------- */

type Install = { id: string; client: string; area: string; crew: string; scope: string; from: number; to: number; status: "Scheduled" | "On site" | "Done" | "Snag"; kind: "Windows" | "Furniture" };
const seedInstalls: Install[] = [
  { id: "IN-311", client: "Vignesh Textiles office", area: "Avinashi Rd", crew: "Crew A · Murugan", scope: "11 partition frames", from: 0, to: 2, status: "On site", kind: "Windows" },
  { id: "IN-312", client: "Arun Prasad", area: "Thudiyalur", crew: "Crew C · Joseph", scope: "Wardrobe + study", from: 1, to: 3, status: "On site", kind: "Furniture" },
  { id: "IN-314", client: "Harini Balaji", area: "Vadavalli", crew: "Crew C · Joseph", scope: "3 wardrobes", from: 3.5, to: 5.5, status: "Scheduled", kind: "Furniture" },
  { id: "IN-315", client: "Sri Ganesh Hospital", area: "Ramanathapuram", crew: "Crew B · Selvam", scope: "16 DGU windows, 3rd floor", from: 2.5, to: 5, status: "Scheduled", kind: "Windows" },
  { id: "IN-316", client: "Kovai Greens RWA", area: "Ganapathy", crew: "Crew A · Murugan", scope: "26 sliding, clubhouse", from: 3, to: 7, status: "Scheduled", kind: "Windows" },
  { id: "IN-309", client: "Lalitha Mohan", area: "RS Puram", crew: "Crew B · Selvam", scope: "Kitchen, 1 snag", from: 0, to: 1, status: "Snag", kind: "Furniture" },
  { id: "IN-317", client: "Ramesh Gounder", area: "Sulur", crew: "Crew B · Selvam", scope: "18 casement + mesh", from: 6, to: 8.5, status: "Scheduled", kind: "Windows" },
  { id: "IN-318", client: "Revathi Hari", area: "Singanallur", crew: "Crew D · Imran", scope: "Kitchen + loft", from: 7, to: 10, status: "Scheduled", kind: "Furniture" },
  { id: "IN-319", client: "Suresh & Co, Tiruppur", area: "Tiruppur", crew: "Crew A · Murugan", scope: "12 sliding", from: 8, to: 10, status: "Scheduled", kind: "Windows" },
  { id: "IN-320", client: "Kumaravel Villa", area: "Kovaipudur", crew: "Crew D · Imran", scope: "3 French doors", from: 10.5, to: 12, status: "Scheduled", kind: "Windows" },
  { id: "IN-321", client: "Malini Arumugam", area: "Peelamedu", crew: "Crew C · Joseph", scope: "TV + crockery", from: 9, to: 10.5, status: "Scheduled", kind: "Furniture" },
];
const installTone: Record<Install["status"], Tone> = { Scheduled: "accent", "On site": "info", Done: "ok", Snag: "late" };

type Snag = { id: string; client: string; issue: string; crew: string; raised: string; age: number; fixed: boolean };
const seedSnags: Snag[] = [
  { id: "SN-88", client: "Lalitha Mohan", issue: "Hob cut-out 6mm off, granite chipped", crew: "Selvam", raised: "18 Oct", age: 2, fixed: false },
  { id: "SN-87", client: "Priya Natarajan", issue: "Sliding sash heavy, roller misaligned", crew: "Murugan", raised: "16 Oct", age: 4, fixed: false },
  { id: "SN-85", client: "Kannan Stores", issue: "Silicone gap at sill, water seepage", crew: "Murugan", raised: "12 Oct", age: 8, fixed: false },
  { id: "SN-84", client: "Arun Prasad", issue: "Wardrobe shutter colour batch mismatch", crew: "Joseph", raised: "11 Oct", age: 9, fixed: false },
  { id: "SN-83", client: "Divakar Flats", issue: "Mesh pleat torn in transit", crew: "Imran", raised: "9 Oct", age: 11, fixed: true },
  { id: "SN-81", client: "Usha Ravi", issue: "Soft-close hinge not closing", crew: "Joseph", raised: "6 Oct", age: 14, fixed: false },
  { id: "SN-80", client: "Shankar Mills guesthouse", issue: "Handle scratch, replace", crew: "Selvam", raised: "4 Oct", age: 16, fixed: true },
  { id: "SN-79", client: "Rekha Sivakumar", issue: "Loft shutter sagging", crew: "Imran", raised: "2 Oct", age: 18, fixed: false },
];

/* ---------------- Payments ---------------- */

type Project = { id: string; client: string; scope: string; value: number; paid: [boolean, boolean, boolean]; stage: string; nextDue: string; overdue: number };
const seedProjects: Project[] = [
  { id: "CI-P-188", client: "Ramesh Gounder", scope: "18 casement windows", value: 772400, paid: [true, false, false], stage: "In factory", nextDue: "Before dispatch, 24 Oct", overdue: 0 },
  { id: "CI-P-184", client: "Kovai Greens RWA", scope: "Clubhouse windows", value: 1340000, paid: [true, false, false], stage: "Glazing", nextDue: "40% before dispatch, 22 Oct", overdue: 0 },
  { id: "CI-P-179", client: "Vignesh Textiles office", scope: "Partitions", value: 486000, paid: [true, true, false], stage: "Installing", nextDue: "10% on handover", overdue: 0 },
  { id: "CI-P-176", client: "Arun Prasad", scope: "Wardrobe + study", value: 214000, paid: [true, true, false], stage: "Installing", nextDue: "10% on handover", overdue: 0 },
  { id: "CI-P-171", client: "Lalitha Mohan", scope: "Kitchen", value: 438000, paid: [true, true, false], stage: "Snag open", nextDue: "10% held till snag", overdue: 12 },
  { id: "CI-P-168", client: "Priya Natarajan", scope: "9 sliding windows", value: 362000, paid: [true, true, false], stage: "Handed over", nextDue: "10% overdue", overdue: 21 },
  { id: "CI-P-165", client: "Kannan Stores", scope: "Shop front", value: 298000, paid: [true, false, false], stage: "Handed over", nextDue: "40% + 10% overdue", overdue: 34 },
  { id: "CI-P-181", client: "Sri Ganesh Hospital", scope: "Ward windows DGU", value: 912000, paid: [true, false, false], stage: "QC", nextDue: "40% before dispatch, 21 Oct", overdue: 0 },
  { id: "CI-P-185", client: "Harini Balaji", scope: "3 wardrobes", value: 268000, paid: [true, true, false], stage: "QC", nextDue: "10% on handover", overdue: 0 },
  { id: "CI-P-162", client: "Usha Ravi", scope: "Kitchen + wardrobes", value: 724000, paid: [true, true, false], stage: "Snag open", nextDue: "10% held till snag", overdue: 26 },
  { id: "CI-P-159", client: "Rekha Sivakumar", scope: "Full 2BHK interiors", value: 1186000, paid: [true, true, false], stage: "Handed over", nextDue: "10% overdue", overdue: 48 },
  { id: "CI-P-190", client: "Revathi Hari", scope: "Kitchen + loft", value: 396000, paid: [true, false, false], stage: "Glazing", nextDue: "40% before dispatch, 25 Oct", overdue: 0 },
];
const MS = [
  { name: "Advance", pct: 0.5, when: "On order" },
  { name: "Pre-dispatch", pct: 0.4, when: "Before material leaves Kurichi" },
  { name: "Handover", pct: 0.1, when: "After install & snag sign-off" },
];
const dueOf = (p: Project) => MS.reduce((a, m, i) => a + (p.paid[i] ? 0 : p.value * m.pct), 0);

/* ---------------- Shared modules ---------------- */

const team: TeamMember[] = [
  { name: "Karthikeyan Ramasamy", role: "Owner", status: "Busy", load: 92, focus: "Signing discounts above 8% and the Anitha R3 walk-through", tasks: [{ title: "R3 walk-through with Dr. Anitha", due: "11:00" }, { title: "Approve Bhuvana 10% ask", due: "12:00" }, { title: "Profile supplier call on price hike", due: "4:00" }], week: [1, 1, 1, 1, 1, 1], since: "2009", phone: "98430 10021" },
  { name: "Divya Shanmugam", role: "Design consultant", status: "Busy", load: 84, focus: "Room plans for 3 flats; Anitha's kitchen in acrylic", tasks: [{ title: "Planner R3 for Noyyal Heights", due: "10:30", done: true }, { title: "3D render for Bhuvana", due: "3:00" }, { title: "Woodgrain samples to Jayashree", due: "5:00" }], week: [1, 1, 1, 1, 1, 0], since: "2018" },
  { name: "Prakash Velu", role: "Site measurement", status: "In field", load: 78, focus: "Measuring Siruvani Residency, 9 openings", tasks: [{ title: "Measure Meenakshi, RS Puram", due: "9:30" }, { title: "Recheck Vadavalli villa doors", due: "2:00" }], week: [1, 1, 1, 1, 1, 1], since: "2016" },
  { name: "Murugan Pandi", role: "Window crew lead (A)", status: "In field", load: 88, focus: "Partition frames at Vignesh Textiles", tasks: [{ title: "Glaze last 3 frames", due: "1:00" }, { title: "Fix SN-87 roller", due: "5:00" }], week: [1, 1, 1, 1, 1, 1], since: "2012" },
  { name: "Joseph Antony", role: "Furniture crew lead (C)", status: "In field", load: 74, focus: "Wardrobe install at Thudiyalur", tasks: [{ title: "Hinge adjust SN-81", due: "4:30" }, { title: "Shutter swap SN-84", due: "Thu" }], week: [1, 1, 1, 0, 1, 1], since: "2015" },
  { name: "Arun Kumar", role: "Factory supervisor, Kurichi", status: "On floor", load: 90, focus: "Welding is over WIP; Kovai Greens glazing rush", tasks: [{ title: "Move 2 welders to glazing", due: "now" }, { title: "QC Sri Ganesh DGU", due: "3:00" }], week: [1, 1, 1, 1, 1, 1], since: "2014" },
  { name: "Revathi Manickam", role: "Accounts & GST", status: "Busy", load: 66, focus: "₹22.3 L in pre-dispatch and handover dues", tasks: [{ title: "UPI links for 4 handovers", due: "11:30" }, { title: "GSTR-1 draft", due: "Fri" }], week: [1, 1, 1, 1, 1, 0], since: "2019" },
  { name: "Fathima Begum", role: "Showroom & leads", status: "On floor", load: 58, focus: "3 new leads today from JustDial and Instagram", tasks: [{ title: "Call Sathish & Nandhini", due: "12:30" }, { title: "Catalogue to Lakshmi Priya", due: "2:00", done: true }], week: [1, 1, 1, 1, 1, 1], since: "2021" },
];

const agents: WorkforceAgent[] = [
  { name: "Measure Scribe", role: "Turns laser-measure readings and site photos into an opening schedule", icon: Ruler, status: "Running", runsToday: 7, hoursSaved: 3.5, accuracy: 95, last: "12 min ago", skills: ["Laser meter", "Photos", "Opening schedule"], schedule: "On every site upload", log: ["Siruvani Residency: 9 openings, 4 to verify", "Flagged 8mm out-of-square in Bedroom 2", "Vadavalli doors re-check booked"] },
  { name: "Quote Writer", role: "Builds the quote from the room plan with GST and milestones", icon: Calculator, status: "Needs you", runsToday: 5, hoursSaved: 6, accuracy: 91, last: "6 min ago", skills: ["Room planner", "Rate card", "GST"], schedule: "When a plan changes", inbox: [{ title: "Bhuvana Krishnan wants 10% off", detail: "Floor is 8%. Swapping the loft to laminate gets her to the same total at 8%." }], log: ["Drafted R3 for Dr. Anitha, ₹6.9 L", "Prabhu villa quote ready for review", "Margin check: 2 quotes under 25%"] },
  { name: "Quote Chaser", role: "Follows viewed quotes before they expire", icon: MessageCircle, status: "Running", runsToday: 9, hoursSaved: 4, accuracy: 88, last: "25 min ago", skills: ["WhatsApp", "Read receipts", "Validity"], schedule: "Daily 10 AM and 5 PM", log: ["Ar. Kavitha viewed quote twice, expires tomorrow", "Sent woodgrain photos to Jayashree", "Gayathri asked for German profile comparison"] },
  { name: "Cut-list Planner", role: "Sends optimised cut-lists to the profile and panel saws", icon: Factory, status: "Running", runsToday: 4, hoursSaved: 3, accuracy: 97, last: "1 h ago", skills: ["Cut optimisation", "Sheet nesting", "Offcuts"], schedule: "After drawing sign-off", log: ["FO-0932 nested on 6 bars, 3.1% waste", "FO-0933 on 7 sheets of 18mm BWR", "Offcut rack: 41 usable pieces"] },
  { name: "Crew Router", role: "Plans install crews by site, scope and travel", icon: Truck, status: "Needs you", runsToday: 3, hoursSaved: 2.5, accuracy: 90, last: "40 min ago", skills: ["Calendar", "Maps", "Crew skills"], schedule: "Every evening 7 PM", inbox: [{ title: "Crew A is double-booked Thu", detail: "Kovai Greens and Sri Ganesh overlap. Move Sri Ganesh to Crew B from Thu noon." }], log: ["Tomorrow: 4 crews, 5 sites, 86 km", "Tiruppur trip combined with Sulur", "Snag SN-87 added to Murugan's route"] },
  { name: "Milestone Collector", role: "Asks for 50/40/10 payments at the right moment", icon: IndianRupee, status: "Running", runsToday: 6, hoursSaved: 4.5, accuracy: 93, last: "18 min ago", skills: ["Tally", "UPI links", "WhatsApp"], schedule: "On stage change + daily 11 AM", log: ["Pre-dispatch ask sent to Kovai Greens, ₹5.4 L", "Rekha Sivakumar 10% at 48 days, escalated", "Matched ₹1.07 L UPI from Arun Prasad"] },
];

const independence: IndependenceData = {
  score: 41,
  history: [26, 29, 31, 33, 36, 38, 41],
  quote: "Every quote passes my table because once a 6% discount became 16% on the phone, and we lost money on that kitchen.",
  pillars: [
    { name: "Sales & quotes", score: 37, note: "Divya designs, but only Karthik finalises price and discount.", fixes: [{ title: "Discount bands by role", gain: 4 }, { title: "Rate card in the planner", gain: 2 }] },
    { name: "Site measurement", score: 58, note: "Prakash's sheets are good; rechecks happen on 1 in 5 jobs.", fixes: [{ title: "Laser meter sync", gain: 3 }] },
    { name: "Factory", score: 44, note: "Arun runs the floor, but priorities change when the owner calls.", fixes: [{ title: "WIP limits on the board", gain: 3 }, { title: "Rush flag needs a reason", gain: 1 }] },
    { name: "Installation", score: 46, note: "Crews are planned by phone the night before.", fixes: [{ title: "Crew Router plans by 7 PM", gain: 3 }] },
    { name: "Money & milestones", score: 31, note: "Handover 10% is often forgotten; ₹7.6 L sits there.", fixes: [{ title: "Auto UPI link on handover", gain: 4 }, { title: "Pre-dispatch gate", gain: 2 }] },
    { name: "Team & roles", score: 42, note: "Showroom staff can't promise dates without calling the factory.", fixes: [{ title: "Live factory dates in leads", gain: 2 }] },
    { name: "Owner time", score: 29, note: "Karthik spends 12 hours a week on discounts and client calls.", fixes: [{ title: "Two quote review slots a day", gain: 2 }] },
  ],
  ownerHours: [
    { label: "Quotes & discounts", hours: 12 },
    { label: "Client calls", hours: 9 },
    { label: "Factory rounds", hours: 6 },
    { label: "Site visits", hours: 5 },
    { label: "Collections", hours: 4 },
    { label: "Suppliers", hours: 3 },
    { label: "Strategy", hours: 1 },
  ],
};

const integrations: Integration[] = [
  { name: "Tally Prime", category: "Accounts", status: "Connected", detail: "Quotes become sales orders; milestone receipts post to ledgers.", synced: "4 min ago", records: "8,412 vouchers", mark: "T", color: "#1c4f9c" },
  { name: "WhatsApp Business", category: "Messaging", status: "Connected", detail: "Quotes, room plans, crew updates and payment asks.", synced: "just now", records: "3,980 chats", mark: "W", color: "#1f9d55" },
  { name: "Laser distance meter", category: "Site", status: "Connected", detail: "Bluetooth readings land in the opening schedule.", synced: "12 min ago", records: "1,206 openings", mark: "LM", color: "#c2410c" },
  { name: "Meta lead forms", category: "Leads", status: "Connected", detail: "Instagram and Facebook enquiries land as new leads.", synced: "20 min ago", records: "214 this month", mark: "M", color: "#2563eb" },
  { name: "JustDial", category: "Leads", status: "Syncing", detail: "Enquiries pulled every 15 minutes.", synced: "live", records: "88 this month", mark: "JD", color: "#f59e0b" },
  { name: "Google Calendar", category: "Crews", status: "Connected", detail: "Site measures and crew bookings, both ways.", synced: "2 min ago", records: "4 calendars", mark: "GC", color: "#0f9d58" },
  { name: "Panel saw cut-list", category: "Factory", status: "Connected", detail: "Optimised CSV cut-lists to the Kurichi saws.", synced: "1 h ago", records: "62 lists", mark: "PS", color: "#6b442c" },
  { name: "Razorpay", category: "Payments", status: "Connected", detail: "UPI links for milestone payments.", synced: "18 min ago", records: "₹38.2 L this FY", mark: "R", color: "#3b5bdb" },
  { name: "Google Business Profile", category: "Reviews", status: "Error", detail: "Token expired; review replies paused.", synced: "3 days ago", records: "—", mark: "G", color: "#ea4335" },
  { name: "Google Drive", category: "Drawings", status: "Available", detail: "Store signed drawings and site photos per client.", synced: "—", records: "—", mark: "D", color: "#64748b" },
];

/* ============================================================
   Config
   ============================================================ */

const config: DeskConfig = {
  slug: "interiors",
  company: "Cauvery Interiors",
  brand: "Cauvery",
  city: "Coimbatore",
  state: "TN",
  icon: Sofa,
  tagline: "uPVC windows, modular kitchens and wardrobes · Avinashi Road showroom · Kurichi factory · 46 people",
  owner: { name: "Karthikeyan Ramasamy", first: "Karthik", initials: "KR", role: "Owner" },
  theme: {
    variant: "atelier",
    paper: "#f7f2eb",
    panel: "#fffdf9",
    sunk: "#efe6da",
    ink: "#2b2018",
    mute: "#7b6b5d",
    line: "#e6dacb",
    accent: "#6b442c",
    accentInk: "#fffaf3",
    soft: "#f2e7da",
    ok: "#4d7a4c",
    warn: "#c08a2e",
    late: "#b0442f",
    info: "#3f7189",
    heading: "serif",
    radius: 14,
  },
  agenda: [
    { at: 9.5, title: "Site measure, RS Puram", detail: "Meenakshi Sundaram · Siruvani Residency · 9 openings", count: 9, tone: "info", module: "leads" },
    { at: 11, title: "R3 walk-through", detail: "Dr. Anitha on the room planner, ₹6.9 L", tone: "accent", module: "planner" },
    { at: 12, title: "Discount approvals", detail: "3 quotes asking above 8%", count: 3, tone: "warn", module: "quote" },
    { at: 14, title: "Factory huddle, Kurichi", detail: "Welding over WIP, Kovai Greens rush", count: 4, tone: "late", module: "factory" },
    { at: 16, title: "Crew plan for Thursday", detail: "Crew A double-booked", tone: "warn", module: "installs" },
    { at: 17.5, title: "Collections with Revathi", detail: "7 milestones due, ₹22.3 L", count: 7, tone: "ok", module: "payments" },
  ],
  activity: [
    { time: "11:38 AM", text: "Dr. Anitha opened room plan R3 on WhatsApp", tone: "info" },
    { time: "11:10 AM", text: "Kovai Greens paid pre-dispatch ₹5.36 L by NEFT", tone: "ok" },
    { time: "10:46 AM", text: "Measure Scribe: Siruvani Residency, 4 openings to verify", tone: "warn" },
    { time: "10:20 AM", text: "Welding at 4 of 3 WIP, FO-0937 waiting", tone: "late" },
    { time: "9:52 AM", text: "New Instagram lead: Lakshmi Priya, Kovai Greens B-204", tone: "info" },
    { time: "9:15 AM", text: "Crews A, B, C and D checked in on site", tone: "neutral" },
  ],
  asks: [
    { q: "Where is Dr. Anitha's quote now?", a: "R3 is at ₹6.9 L incl. 18% GST, ₹24,500 below R2.\n\n• Divya moved the Bedroom 2 study desk out and changed the kitchen to acrylic.\n• Windows stay on 3-track with SS mesh; balcony door is slide & fold.\n• Milestones: ₹3.4 L advance, ₹2.8 L pre-dispatch, ₹69k on handover.\n\nShe opened the plan at 11:38. Margin is 31%, above the 28% floor.", sources: ["Room planner R3", "Quote CI/Q/26-27/418", "WhatsApp read receipts"] },
    { q: "Which discounts need my approval today?", a: "Three quotes ask for more than the 8% Divya can give:\n• Bhuvana Krishnan: 10% on ₹10.6 L (margin drops to 26%)\n• Gayathri Ramanathan: 9% on ₹8.3 L lift & slide doors\n• Ar. Kavitha Menon: 12% on ₹26.2 L office (margin 21%, below floor)\n\nSuggestion: give Bhuvana 8% plus a laminate loft, which lands at her number, and hold Kavitha at 9% with free mesh.", sources: ["Quotes", "Rate card", "Margin rules"] },
    { q: "What's stuck in the factory?", a: "Welding has 4 jobs against a limit of 3, so FO-0937 French doors are waiting. Kovai Greens (26 windows) is in glazing for Thursday's install. Two orders can't start: FO-0936 needs Dr. Anitha's R3 signature and FO-0939 waits for Jayashree's quote OK.\n\nArun suggests moving 2 welders to glazing until 3 PM.", sources: ["Factory board", "Cut-list Planner"] },
    { q: "How much money is pending on milestones?", a: "₹22.3 L across 12 projects.\n• Pre-dispatch 40%: ₹13.9 L total, due before material leaves Kurichi (Kovai Greens paid ₹5.36 L today).\n• Handover 10%: ₹7.6 L, of which ₹3.5 L is overdue past 20 days.\n\nThe biggest is Rekha Sivakumar, ₹1.19 L at 48 days. Her loft snag SN-79 is still open, which is probably why.", sources: ["Tally", "Milestone Collector"] },
    { q: "Is any crew double-booked this week?", a: "Yes. Crew A (Murugan) has Kovai Greens clubhouse from Thu and was also pencilled for Sri Ganesh Hospital. Crew B (Selvam) is free from Thu noon after the Lalitha snag. Crew Router recommends moving Sri Ganesh to Crew B; travel drops by 22 km.", sources: ["Installations", "Google Calendar"] },
    { q: "Draft a WhatsApp to Rekha Sivakumar about the 10%", a: "Draft (not sent):\n\n“Vanakkam Rekha madam, this is Revathi from Cauvery Interiors. Joseph will come on Thursday at 11 AM to fix the loft shutter. Once you're happy, could you please release the handover 10% (₹1,18,600)? The UPI link is below. Thank you for choosing us. — Revathi”", sources: ["Snag SN-79", "Project CI-P-159"] },
  ],
  run: {
    label: "Runs after every plan change and at 7 PM. You can also run it now.",
    title: "Plan-to-Site agent",
    steps: [
      { text: "Read 16 items from room plan R3 and the rate card", result: "15 items in quote, ₹5.9 L before GST" },
      { text: "Check margins and discount bands on open quotes", result: "3 asks above 8%, 1 below margin floor" },
      { text: "Match signed drawings to factory capacity", result: "Welding over WIP by 1; 2 orders blocked on signatures" },
      { text: "Route install crews for the next 7 days", result: "Crew A double-booked Thu, fix found" },
      { text: "Prepare 50/40/10 asks from stage changes", result: "4 UPI links ready, ₹6.8 L" },
    ],
    outcome: "Approve Bhuvana at 8% with a laminate loft, move Sri Ganesh to Crew B, and send 4 milestone links. That clears ₹6.8 L of dues and keeps Thursday's installs on time.",
    actions: ["Approve Bhuvana at 8% + laminate loft", "Move Sri Ganesh to Crew B", "Send 4 UPI milestone links", "Nudge Dr. Anitha to sign R3"],
  },
};

/* ============================================================
   Desk
   ============================================================ */

export default function InteriorsDesk() {
  const [items, setItems] = React.useState(seedItems);
  const [leads, setLeads] = React.useState(seedLeads);
  const [orders, setOrders] = React.useState(seedOrders);
  const [installs, setInstalls] = React.useState(seedInstalls);
  const [projects, setProjects] = React.useState(seedProjects);
  const due = projects.reduce((a, p) => a + (dueOf(p) > 0 ? 1 : 0), 0);

  const modules: DeskModule[] = [
    {
      id: "planner",
      label: "Room planner",
      title: "Room planner",
      blurb: "Dr. Anitha Raghavan's flat at Noyyal Heights. Drag, toggle or upgrade any window, wardrobe or kitchen unit and the quote re-prices live.",
      icon: Sofa,
      notes: ["This is the client's measured flat. Every window, wardrobe and kitchen run is a priced item.", "Drag a wardrobe, slide a window along its wall, or switch it off. The quote on the right updates instantly with GST.", "Switch the package to show the client three price points in one meeting."],
      render: () => <PlannerHome items={items} setItems={setItems} leads={leads} orders={orders} />,
    },
    { id: "leads", label: "Leads & measures", count: leads.filter((l) => l.stage === "New").length, title: "Leads & site measures", blurb: "Every enquiry from the showroom, Instagram and JustDial, and the openings Prakash measured on site", icon: Ruler, render: () => <LeadsTab leads={leads} setLeads={setLeads} /> },
    { id: "quote", label: "Quote builder", count: 3, title: "Quote builder", blurb: "Profile, glass, hardware and colour to a price with GST, plus every quote in play", icon: Calculator, render: () => <QuoteTab /> },
    { id: "factory", label: "Factory orders", count: orders.filter((o) => o.stage !== "ready").length, title: "Factory orders", blurb: "Kurichi factory: windows and furniture from signed drawing to dispatch. Drag a card to move it.", icon: Factory, render: () => <FactoryTab orders={orders} setOrders={setOrders} /> },
    { id: "installs", label: "Installations", count: installs.filter((i) => i.status === "Snag").length + seedSnags.filter((s) => !s.fixed).length, title: "Installations", blurb: "Four crews over the next two weeks, today's site checklists and open snags", icon: Hammer, render: () => <InstallsTab installs={installs} setInstalls={setInstalls} /> },
    { id: "payments", label: "Payments", count: due, title: "Payments", blurb: "Every project on 50 / 40 / 10: advance, pre-dispatch and handover", icon: Wallet, render: () => <PaymentsTab projects={projects} setProjects={setProjects} /> },
    { id: "team", label: "People", title: "People", blurb: "Showroom, site, factory and crews: who is carrying what today", icon: Users, render: () => <PeopleModule members={team} /> },
    { id: "agents", label: "Agents", title: "Agents", blurb: "Six AI agents measuring, quoting, chasing and routing so Karthik doesn't have to", icon: Bot, render: () => <AgentsModule agents={agents} /> },
    { id: "independence", label: "Independence", title: "Owner independence", blurb: "How much of Cauvery runs without Karthik on the phone", icon: GaugeIcon, render: () => <IndependenceModule data={independence} /> },
    { id: "connections", label: "Connections", title: "Connections", blurb: "Tally, WhatsApp, the laser meter, lead sources and the factory saws", icon: Plug, render: () => <ConnectionsModule items={integrations} /> },
  ];

  return <DeskShell config={config} modules={modules} />;
}

/* ---------------- Home: planner + quote ---------------- */

function PlannerHome({ items, setItems, leads, orders }: { items: PlanItem[]; setItems: React.Dispatch<React.SetStateAction<PlanItem[]>>; leads: Lead[]; orders: FOrder[] }) {
  const desk = useDesk();
  const [selected, setSelected] = React.useState<string | null>("WR2");
  const [discount, setDiscount] = React.useState(0.05);
  const [rev, setRev] = React.useState(3);
  const t = quoteTotals(items, discount);
  const visitors = useDrift(14, 1, 3000);
  const pipeline = leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost").reduce((a, l) => a + l.budget, 0);

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel
          live
          title="Flat C-702, Noyyal Heights · Saravanampatti"
          sub="Dr. Anitha Raghavan · 3BHK, 1,180 sq ft carpet · measured by Prakash on 12 Oct"
          action={<Pill tone="accent" mono>R{rev} · live</Pill>}
        >
          <RoomPlanner items={items} setItems={setItems} selected={selected} setSelected={setSelected} />
        </Panel>
        <LiveQuote
          items={items}
          totals={t}
          discount={discount}
          setDiscount={setDiscount}
          rev={rev}
          onSave={() => {
            setRev((r) => r + 1);
            toast.success(`Saved as R${rev + 1}`, { description: `${inr(t.total)} incl. GST · Tally sales order updated` });
            desk.log(`Room plan saved as R${rev + 1} for Dr. Anitha, ${inr(t.total, { compact: true })}`, "ok");
          }}
          onSelect={setSelected}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open pipeline" value={inr(pipeline, { compact: true })} delta="+14%" hint={`${leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost").length} live leads`} icon={IndianRupee} trend={[62, 68, 71, 74, 80, 86, 92, pipeline / 1e5]} />
        <Stat label="Quote to order" value="38%" delta="+4%" hint="last 90 days" icon={FileText} tone="ok" trend={[29, 31, 30, 33, 35, 34, 38]} />
        <Stat label="Factory WIP" value={orders.filter((o) => o.stage !== "ready").length} delta="+2" deltaGood={false} hint="welding over limit" icon={Factory} tone="warn" trend={[8, 9, 9, 10, 11, 10, 11]} />
        <Stat label="Showroom visitors today" value={Math.round(visitors)} delta="+3" hint="Avinashi Road" icon={Users} trend={[6, 8, 9, 11, 12, 13, Math.round(visitors)]} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel icon={MapPin} title="Site measures this week" sub="Prakash and the laser meter" action={<Btn size="sm" onClick={() => desk.goTab("leads")}>All leads</Btn>}>
          <ul className="space-y-2.5">
            {[
              { d: "Today 9:30", n: "Meenakshi Sundaram", a: "RS Puram", o: 9, s: "On site", t: "info" as Tone },
              { d: "Today 2:00", n: "Prabhu Venkatesan (re-check)", a: "Vadavalli", o: 3, s: "Booked", t: "accent" as Tone },
              { d: "Thu 4:00", n: "Arul Selvan", a: "Singanallur", o: 4, s: "Booked", t: "accent" as Tone },
              { d: "Fri 10:00", n: "Sathish & Nandhini", a: "Kalapatti", o: 14, s: "To confirm", t: "warn" as Tone },
              { d: "Sat 11:30", n: "Dinesh Kumar", a: "Podanur", o: 1, s: "To book", t: "neutral" as Tone },
            ].map((m) => (
              <li key={m.n} className="flex items-center gap-3 rounded-[12px] border border-d-line px-3 py-2">
                <span className="w-[68px] shrink-0 font-mono text-[11.5px] text-d-mute">{m.d}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium">{m.n}</p>
                  <p className="text-[12px] text-d-mute">
                    {m.a} · {m.o} openings
                  </p>
                </div>
                <Pill tone={m.t}>{m.s}</Pill>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="What clients pick" sub="Package mix on the last 40 quotes">
          <Donut
            center="40"
            sub="quotes"
            segments={[
              { label: "Essential", value: 14, tone: "info" },
              { label: "Signature", value: 19, tone: "accent" },
              { label: "Luxe", value: 7, tone: "warn" },
            ]}
          />
          <p className="mt-3 text-[12.5px] leading-relaxed text-d-mute">
            Showing three packages in the planner lifts the average ticket by <b className="text-d-ink">₹1.7 L</b>; most clients settle on Signature.
          </p>
        </Panel>
        <Panel icon={TriangleAlert} title="Waiting on Karthik" sub="Discounts above the 8% Divya can give">
          <ApprovalQueue
            items={[
              { id: "d1", title: "Bhuvana Krishnan · 10%", sub: "PU kitchen + 3 wardrobes · margin 26%", amount: inr(106400), meta: "R3", tone: "warn" },
              { id: "d2", title: "Gayathri R · 9%", sub: "3 lift & slide doors · margin 25%", amount: inr(74400), meta: "R1", tone: "warn" },
              { id: "d3", title: "Ar. Kavitha Menon · 12%", sub: "Office, below 22% floor", amount: inr(314200), meta: "Risk", tone: "late" },
            ]}
            onDecide={(id, d) => d && desk.log(`Discount ${id === "d1" ? "Bhuvana" : id === "d2" ? "Gayathri" : "Kavitha"} ${d}`, d === "approved" ? "ok" : "warn")}
          />
        </Panel>
      </div>
    </div>
  );
}

function RoomPlanner({ items, setItems, selected, setSelected }: { items: PlanItem[]; setItems: React.Dispatch<React.SetStateAction<PlanItem[]>>; selected: string | null; setSelected: (id: string | null) => void }) {
  const desk = useDesk();
  const uid = React.useId().replace(/:/g, "");
  const svgRef = React.useRef<SVGSVGElement>(null);
  const drag = React.useRef<{ id: string; sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);
  const [layer, setLayer] = React.useState<"All" | "Windows" | "Furniture" | "Kitchen">("All");
  const [pkg, setPkg] = React.useState<Pkg | "Custom">("Custom");
  const [added, setAdded] = React.useState(0);
  const sel = items.find((i) => i.id === selected) ?? null;

  function toFt(e: React.PointerEvent) {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!svg || !m) return null;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(m.inverse());
    return { x: p.x / S, y: p.y / S };
  }
  function place(it: PlanItem, x: number, y: number): PlanItem {
    const snap = (v: number) => Math.round(v * 4) / 4;
    if (it.axis === "x") return { ...it, x: Math.max(0.5, Math.min(FLAT_W - it.w - 0.5, snap(x))) };
    if (it.axis === "y") return { ...it, y: Math.max(0.5, Math.min(FLAT_D - it.d - 0.5, snap(y))) };
    return { ...it, x: Math.max(0, Math.min(FLAT_W - it.w, snap(x))), y: Math.max(0, Math.min(FLAT_D - it.d, snap(y))) };
  }
  function update(id: string, patch: Partial<PlanItem>) {
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    setPkg("Custom");
  }
  function setLength(it: PlanItem, L: number) {
    if (it.w >= it.d) update(it.id, it.axis === "x" || !it.axis ? { w: Math.min(L, FLAT_W - it.x) } : { w: L });
    else update(it.id, { d: Math.min(L, FLAT_D - it.y) });
  }
  function applyPackage(p: Pkg) {
    const v = PACKAGES.indexOf(p);
    setItems((cur) => cur.map((i) => ({ ...i, variant: v })));
    setPkg(p);
    desk.log(`Planner switched to ${p} package`, "info");
  }
  function addItem(kind: Kind) {
    const n = added + 1;
    setAdded(n);
    const base: Record<Kind, Omit<PlanItem, "id" | "variant" | "on">> = {
      window: { kind: "window", label: `New window ${n}`, room: "Bedroom 2", x: 39.75, y: 22, w: 0.5, d: 4, h: 4, axis: "y" },
      door: { kind: "door", label: `New door ${n}`, room: "Living & dining", x: 14, y: -0.25, w: 6, d: 0.5, h: 7, axis: "x" },
      wardrobe: { kind: "wardrobe", label: `Wardrobe ${n}`, room: "Living & dining", x: 10, y: 6, w: 6, d: 2, h: 7 },
      kitchen: { kind: "kitchen", label: `Base run ${n}`, room: "Kitchen", x: 26, y: 5, w: 5, d: 2, h: 3 },
      unit: { kind: "unit", label: `Unit ${n}`, room: "Living & dining", x: 12, y: 8, w: 4, d: 1.5, h: 4 },
    };
    const it: PlanItem = { ...base[kind], id: `N${n}`, variant: 1, on: true };
    setItems((cur) => [...cur, it]);
    setSelected(it.id);
    toast.success(`${KIND_LABEL[kind]} added`, { description: `${inr(priceOf(it))} · drag it into place` });
    desk.log(`Added ${it.label} to the room plan`, "info");
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Segmented size="sm" options={["All", "Windows", "Furniture", "Kitchen"] as const} value={layer} onChange={setLayer} />
        <span className="mx-1 hidden h-5 w-px bg-d-line sm:block" />
        <Segmented size="sm" options={[...PACKAGES, "Custom"] as const} value={pkg} onChange={(v) => v !== "Custom" && applyPackage(v)} />
        <div className="ml-auto flex gap-1.5">
          <Btn size="sm" icon={Plus} onClick={() => addItem("window")}>Window</Btn>
          <Btn size="sm" icon={Plus} onClick={() => addItem("wardrobe")}>Wardrobe</Btn>
          <Btn size="sm" icon={Plus} onClick={() => addItem("unit")}>Unit</Btn>
          <IconBtn
            icon={RotateCcw}
            label="Reset to R2"
            onClick={() => {
              setItems(seedItems);
              setPkg("Custom");
              toast("Plan reset to the measured R2 layout");
            }}
          />
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[12px] border border-d-line bg-[#fbf7f1]">
        <svg
          ref={svgRef}
          viewBox={`-36 -40 ${FLAT_W * S + 72} ${FLAT_D * S + 80}`}
          className="block w-full touch-none select-none outline-none"
          tabIndex={0}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
          onPointerMove={(e) => {
            const dr = drag.current;
            if (!dr) return;
            const p = toFt(e);
            if (!p) return;
            const dx = p.x - dr.sx;
            const dy = p.y - dr.sy;
            if (Math.abs(dx) + Math.abs(dy) > 0.15) dr.moved = true;
            setItems((cur) => cur.map((i) => (i.id === dr.id ? place(i, dr.ox + dx, dr.oy + dy) : i)));
          }}
          onPointerUp={() => {
            const dr = drag.current;
            drag.current = null;
            if (dr?.moved) {
              const it = items.find((i) => i.id === dr.id);
              desk.log(`Moved ${it?.label ?? dr.id} on the plan`);
            }
          }}
          onKeyDown={(e) => {
            if (!sel) return;
            const step = e.shiftKey ? 1 : 0.25;
            const m: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
            const v = m[e.key];
            if (!v) return;
            e.preventDefault();
            setItems((cur) => cur.map((i) => (i.id === sel.id ? place(i, i.x + v[0], i.y + v[1]) : i)));
          }}
        >
          <defs>
            <pattern id={`g${uid}`} width={S} height={S} patternUnits="userSpaceOnUse">
              <path d={`M${S} 0H0V${S}`} fill="none" stroke="#e9dfd2" strokeWidth="0.7" />
            </pattern>
            <pattern id={`w${uid}`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
              <rect width="7" height="7" fill="#9b6b48" />
              <line x1="0" y1="0" x2="0" y2="7" stroke="#7d4f31" strokeWidth="2.4" />
            </pattern>
            <pattern id={`k${uid}`} width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="#e8dccb" />
              <circle cx="5" cy="5" r="0.9" fill="#c9b49a" />
            </pattern>
          </defs>

          {/* rooms */}
          {rooms.map((r) => (
            <g key={r.name} pointerEvents="none">
              <rect x={r.x * S} y={r.y * S} width={r.w * S} height={r.d * S} fill={r.fill} />
              <rect x={r.x * S} y={r.y * S} width={r.w * S} height={r.d * S} fill={`url(#g${uid})`} opacity="0.7" />
            </g>
          ))}
          {rooms.map((r) => (
            <rect key={`wall-${r.name}`} x={r.x * S} y={r.y * S} width={r.w * S} height={r.d * S} fill="none" stroke="#3b2c21" strokeWidth="3" pointerEvents="none" />
          ))}
          <rect x="0" y="0" width={FLAT_W * S} height={FLAT_D * S} fill="none" stroke="#2b2018" strokeWidth="8" pointerEvents="none" />
          {/* door swings */}
          {[
            { x: 14, y: 24, r: 2.5, a: "M0,0 v-2.5 a2.5,2.5 0 0 1 2.5,2.5" },
            { x: 28, y: 20, r: 2.5, a: "M0,0 h2.5 a2.5,2.5 0 0 1 -2.5,2.5" },
            { x: 20, y: 18, r: 2, a: "M0,0 h-2 a2,2 0 0 0 2,2" },
            { x: 22, y: 12, r: 2, a: "M0,0 v2 a2,2 0 0 0 2,-2" },
          ].map((d) => (
            <path key={`${d.x}-${d.y}`} d={d.a.replace(/(-?\d+(\.\d+)?)/g, (n) => String(Number(n) * S))} transform={`translate(${d.x * S},${d.y * S})`} fill="none" stroke="#a8927c" strokeWidth="1.2" strokeDasharray="3 3" pointerEvents="none" />
          ))}
          {/* main door gap */}
          <rect x={24 * S} y={FLAT_D * S - 5} width={3 * S} height="10" fill="#fbf7f1" pointerEvents="none" />
          <text x={25.5 * S} y={FLAT_D * S + 22} textAnchor="middle" className="fill-d-mute font-mono" fontSize="10">
            MAIN DOOR
          </text>

          {rooms.map((r) => (
            <g key={`lbl-${r.name}`} pointerEvents="none">
              <text x={(r.x + r.w / 2) * S} y={(r.y + r.d / 2) * S} textAnchor="middle" className="fill-d-ink font-serif" fontSize={r.w > 8 ? 15 : 11} fontStyle="italic" opacity="0.75">
                {r.name}
              </text>
              <text x={(r.x + r.w / 2) * S} y={(r.y + r.d / 2) * S + 15} textAnchor="middle" className="fill-d-mute font-mono" fontSize="9.5">
                {r.w}&apos; × {r.d}&apos;
              </text>
            </g>
          ))}

          {/* overall dimension */}
          <g pointerEvents="none" className="fill-d-mute" stroke="#a8927c">
            <line x1="0" y1="-24" x2={FLAT_W * S} y2="-24" strokeWidth="1" />
            <line x1="0" y1="-30" x2="0" y2="-18" />
            <line x1={FLAT_W * S} y1="-30" x2={FLAT_W * S} y2="-18" />
            <text x={(FLAT_W * S) / 2} y="-29" textAnchor="middle" fontSize="10" stroke="none" className="font-mono">
              40&apos; 0&quot; · 12.19 m
            </text>
          </g>

          {/* items */}
          {items.map((it) => {
            const dim = layer !== "All" && layerOf(it.kind) !== layer;
            const on = it.id === selected;
            const x = it.x * S;
            const y = it.y * S;
            const w = it.w * S;
            const h = it.d * S;
            const horiz = it.w >= it.d;
            const isWin = it.kind === "window" || it.kind === "door";
            const fill = isWin ? "#d9ebf2" : it.kind === "wardrobe" ? `url(#w${uid})` : it.kind === "kitchen" ? `url(#k${uid})` : "#d8bfa4";
            const stroke = isWin ? "var(--d-info)" : "var(--d-accent)";
            const L = lengthOf(it);
            const divs = it.kind === "wardrobe" ? Math.max(2, Math.round(L / 1.8)) : 0;
            return (
              <g
                key={it.id}
                opacity={dim ? 0.18 : it.on ? 1 : 0.42}
                pointerEvents={dim ? "none" : "auto"}
                className="cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setSelected(it.id);
                  const p = toFt(e);
                  if (!p) return;
                  drag.current = { id: it.id, sx: p.x, sy: p.y, ox: it.x, oy: it.y, moved: false };
                  svgRef.current?.setPointerCapture(e.pointerId);
                }}
                onDoubleClick={() => {
                  update(it.id, { on: !it.on });
                  desk.log(`${it.label} ${it.on ? "removed from" : "added back to"} the quote`, it.on ? "warn" : "ok");
                }}
              >
                {isWin && <rect x={x - (horiz ? 0 : 3)} y={y - (horiz ? 3 : 0)} width={w + (horiz ? 0 : 6)} height={h + (horiz ? 6 : 0)} fill="#fbf7f1" />}
                <rect x={x} y={y} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={isWin ? 2 : 1.6} strokeDasharray={it.on ? undefined : "4 3"} rx={isWin ? 1 : 2} />
                {isWin && (horiz ? <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke={stroke} strokeWidth="1" /> : <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke={stroke} strokeWidth="1" />)}
                {isWin && it.kind === "door" && <path d={horiz ? `M${x},${y + h} a${w / 2},${w / 2} 0 0 0 ${w / 2},${w / 2}` : `M${x + w},${y} a${h / 2},${h / 2} 0 0 1 ${h / 2},${h / 2}`} fill="none" stroke={stroke} strokeWidth="1" strokeDasharray="3 3" />}
                {divs > 0 &&
                  Array.from({ length: divs - 1 }, (_, k) => {
                    const t = ((k + 1) / divs) * (horiz ? w : h);
                    return horiz ? <line key={k} x1={x + t} y1={y} x2={x + t} y2={y + h} stroke="#f7efe4" strokeWidth="1.2" /> : <line key={k} x1={x} y1={y + t} x2={x + w} y2={y + t} stroke="#f7efe4" strokeWidth="1.2" />;
                  })}
                {it.kind === "kitchen" && it.id === "K2" && (
                  <g fill="none" stroke="#7b6b5d" strokeWidth="1">
                    <circle cx={x + w / 2} cy={y + h * 0.35} r="5" />
                    <circle cx={x + w / 2} cy={y + h * 0.62} r="5" />
                  </g>
                )}
                {it.kind === "kitchen" && it.id === "K1" && <rect x={(it.x + 3.2) * S} y={y + 6} width={2.6 * S} height={h - 12} rx="4" fill="#f6f2ec" stroke="#7b6b5d" strokeWidth="1" />}
                <text
                  x={isWin ? (horiz ? x + w / 2 : it.x < 1 ? x + w + 8 : x - 8) : x + w / 2}
                  y={isWin ? (horiz ? (it.y < 1 ? y + h + 14 : y - 7) : y + h / 2 + 4) : y + h / 2 + 4}
                  textAnchor={isWin && !horiz ? (it.x < 1 ? "start" : "end") : "middle"}
                  fontSize="10.5"
                  fontWeight="600"
                  className="font-mono"
                  fill={isWin ? "var(--d-info)" : it.kind === "wardrobe" ? "#fffaf3" : "var(--d-ink)"}
                  pointerEvents="none"
                >
                  {it.id}
                </text>
                {on && (
                  <>
                    <rect x={x - 5} y={y - 5} width={w + 10} height={h + 10} fill="none" stroke="var(--d-accent)" strokeWidth="1.8" className="desk-flow" rx="4" />
                    {[
                      [x - 5, y - 5],
                      [x + w + 5, y - 5],
                      [x - 5, y + h + 5],
                      [x + w + 5, y + h + 5],
                    ].map(([cx, cy]) => (
                      <rect key={`${cx}-${cy}`} x={cx - 3.5} y={cy - 3.5} width="7" height="7" fill="#fffdf9" stroke="var(--d-accent)" strokeWidth="1.5" />
                    ))}
                  </>
                )}
              </g>
            );
          })}

          {/* selected tag, drawn last so it sits on top */}
          {sel &&
            (() => {
              const tx = Math.max(60, Math.min(FLAT_W * S - 60, (sel.x + sel.w / 2) * S));
              const below = sel.y < 3;
              const ty = below ? (sel.y + sel.d) * S + 26 : sel.y * S - 22;
              return (
                <g pointerEvents="none" className="desk-rise">
                  <rect x={tx - 62} y={ty - 13} width="124" height="22" rx="11" fill="var(--d-accent)" />
                  <text x={tx} y={ty + 2} textAnchor="middle" fontSize="10.5" fill="var(--d-accent-ink)" className="font-mono" fontWeight="600">
                    {ft(lengthOf(sel))} · {sel.on ? inr(priceOf(sel), { compact: true }) : "off"}
                  </text>
                </g>
              );
            })()}
        </svg>
        <div className="pointer-events-none absolute bottom-2 left-3 flex flex-wrap gap-3 font-mono text-[10.5px] text-d-mute">
          <span className="inline-flex items-center gap-1">
            <Move className="h-3 w-3" /> drag · arrows nudge · double-click toggles
          </span>
        </div>
      </div>

      {sel ? (
        <div key={sel.id} className="desk-rise mt-4 grid gap-4 rounded-[12px] border border-d-line bg-d-sunk/50 p-4 md:grid-cols-[1.1fr_1fr_auto]">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-d-mute">
              {sel.id} · {KIND_LABEL[sel.kind]} · {sel.room}
            </p>
            <p className="desk-h mt-0.5 truncate text-[18px] font-semibold">{sel.label}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {OPTIONS[sel.kind].map((o, i) => (
                <button
                  key={o.name}
                  type="button"
                  onClick={() => {
                    update(sel.id, { variant: i });
                    desk.log(`${sel.id} changed to ${o.name}`);
                  }}
                  className={`rounded-full border px-2.5 py-1 text-[11.5px] transition-colors ${sel.variant === i ? "border-d-accent bg-d-accent text-d-accent-ink" : "border-d-line bg-d-panel hover:bg-d-soft"}`}
                >
                  {o.name} <span className="font-mono opacity-75">₹{o.rate}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <label className="block">
              <span className="flex justify-between text-[12px] text-d-mute">
                Length <b className="font-mono text-d-ink">{ft(lengthOf(sel))}</b>
              </span>
              <input type="range" min={sel.kind === "window" ? 2 : 1.5} max={sel.kind === "kitchen" ? 14 : 12} step={0.25} value={lengthOf(sel)} onChange={(e) => setLength(sel, Number(e.target.value))} className="mt-1 w-full accent-[var(--d-accent)]" />
            </label>
            <label className="block">
              <span className="flex justify-between text-[12px] text-d-mute">
                Height <b className="font-mono text-d-ink">{ft(sel.h)}</b>
              </span>
              <input type="range" min={2} max={sel.kind === "kitchen" ? 3 : 8} step={0.25} value={sel.h} disabled={sel.kind === "kitchen"} onChange={(e) => update(sel.id, { h: Number(e.target.value) })} className="mt-1 w-full accent-[var(--d-accent)]" />
            </label>
          </div>
          <div className="flex flex-col items-end justify-between gap-2">
            <div className="text-right">
              <p className="text-[11.5px] text-d-mute">
                {basisOf(sel).toFixed(1)} {unitOf(sel)} × ₹{OPTIONS[sel.kind][sel.variant].rate}
              </p>
              <p key={priceOf(sel)} className="desk-h desk-rise tnum text-[24px] font-semibold">{sel.on ? inr(priceOf(sel)) : <span className="text-d-mute line-through">{inr(priceOf(sel))}</span>}</p>
            </div>
            <div className="flex gap-1.5">
              <IconBtn
                icon={sel.on ? EyeOff : Eye}
                label={sel.on ? "Leave out of quote" : "Include in quote"}
                onClick={() => {
                  update(sel.id, { on: !sel.on });
                  toast(sel.on ? `${sel.label} left out` : `${sel.label} back in`, { description: inr(priceOf(sel)) });
                  desk.log(`${sel.label} ${sel.on ? "left out of" : "added to"} the quote`, sel.on ? "warn" : "ok");
                }}
              />
              <IconBtn
                icon={Trash}
                label="Delete item"
                onClick={() => {
                  setItems((cur) => cur.filter((i) => i.id !== sel.id));
                  setSelected(null);
                  toast(`${sel.label} deleted`);
                  desk.log(`${sel.label} deleted from the plan`, "warn");
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-4 rounded-[12px] border border-dashed border-d-line px-4 py-5 text-center text-[13px] text-d-mute">Click any window, wardrobe or unit to change its finish, size or leave it out.</p>
      )}
    </div>
  );
}

function LiveQuote({
  items,
  totals,
  discount,
  setDiscount,
  rev,
  onSave,
  onSelect,
}: {
  items: PlanItem[];
  totals: ReturnType<typeof quoteTotals>;
  discount: number;
  setDiscount: (v: number) => void;
  rev: number;
  onSave: () => void;
  onSelect: (id: string) => void;
}) {
  const desk = useDesk();
  const byRoom = Array.from(new Set(items.map((i) => i.room))).map((room) => ({ room, list: items.filter((i) => i.room === room) }));
  const diff = totals.total - SENT_R2;
  const overBand = discount > 0.08;
  return (
    <section className="desk-card desk-rise overflow-hidden xl:sticky xl:top-[76px]">
      <div className="bg-d-accent px-5 pb-4 pt-4 text-d-accent-ink">
        <p className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] opacity-80">
          Live quote · R{rev}
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f2d3a8] bb-pulse" /> pricing
          </span>
        </p>
        <p key={totals.total} className="desk-h desk-rise tnum mt-2 text-[38px] font-semibold leading-none">{inr(totals.total)}</p>
        <p className="mt-1.5 text-[12.5px] opacity-85">
          incl. 18% GST · {diff === 0 ? "same as R2" : `${diff > 0 ? "+" : "−"}${inr(Math.abs(diff))} vs R2 sent 16 Oct`}
        </p>
      </div>
      <div className="desk-scroll max-h-[300px] overflow-y-auto px-5 py-3">
        {byRoom.map((g) => (
          <div key={g.room} className="py-1.5">
            <p className="font-serif text-[13px] italic text-d-mute">{g.room}</p>
            <ul>
              {g.list.map((i) => (
                <li key={i.id}>
                  <button type="button" onClick={() => onSelect(i.id)} className={`flex w-full items-baseline gap-2 rounded px-1 py-0.5 text-left text-[12.5px] hover:bg-d-sunk ${i.on ? "" : "text-d-mute line-through"}`}>
                    <span className="w-8 shrink-0 font-mono text-[11px] text-d-mute">{i.id}</span>
                    <span className="min-w-0 flex-1 truncate">{OPTIONS[i.kind][i.variant].name}</span>
                    <span className="tnum font-mono">{inr(priceOf(i), { compact: true })}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="space-y-1.5 border-t border-d-line px-5 py-3 text-[12.5px]">
        {[
          { k: "Items", v: inr(totals.sub) },
          { k: `Discount ${(discount * 100).toFixed(0)}%`, v: `− ${inr(totals.disc)}` },
          { k: "Install & transport 4%", v: inr(totals.install) },
          { k: "CGST 9% + SGST 9%", v: inr(totals.gst) },
        ].map((r) => (
          <p key={r.k} className="flex justify-between">
            <span className="text-d-mute">{r.k}</span>
            <span className="tnum font-mono">{r.v}</span>
          </p>
        ))}
        <label className="block pt-1">
          <span className="flex items-center justify-between text-[12px] text-d-mute">
            Discount {overBand ? <Pill tone="late">needs owner</Pill> : <span className="font-mono">Divya can give up to 8%</span>}
          </span>
          <input type="range" min={0} max={0.15} step={0.01} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="mt-1 w-full accent-[var(--d-accent)]" />
        </label>
      </div>
      <div className="border-t border-d-line px-5 py-3">
        <p className="mb-2 text-[11.5px] font-medium text-d-mute">Milestones</p>
        <div className="flex h-2.5 overflow-hidden rounded-full">
          <span className="bg-d-accent" style={{ width: "50%" }} />
          <span className="bg-[#a77a57]" style={{ width: "40%" }} />
          <span className="bg-[#d9bc9b]" style={{ width: "10%" }} />
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-[11.5px]">
          {MS.map((m) => (
            <div key={m.name}>
              <p className="text-d-mute">
                {m.name} {Math.round(m.pct * 100)}%
              </p>
              <p className="tnum font-mono font-semibold">{inr(totals.total * m.pct, { compact: true })}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2 border-t border-d-line px-5 py-3">
        <Btn size="sm" icon={Save} onClick={onSave} className="flex-1">
          Save R{rev + 1}
        </Btn>
        <Btn
          size="sm"
          variant="solid"
          icon={Send}
          className="flex-1"
          onClick={() => {
            if (overBand) {
              toast.warning("Discount above 8% sent to Karthik for approval");
              desk.log(`Discount ${(discount * 100).toFixed(0)}% on Anitha quote sent for owner approval`, "warn");
              return;
            }
            toast.success("Quote sent on WhatsApp", { description: `Dr. Anitha · ${inr(totals.total)} · plan PDF attached` });
            desk.log(`Quote R${rev} sent to Dr. Anitha on WhatsApp, ${inr(totals.total, { compact: true })}`, "ok");
          }}
        >
          Send
        </Btn>
      </div>
    </section>
  );
}

/* ---------------- Leads & measures ---------------- */

function LeadsTab({ leads, setLeads }: { leads: Lead[]; setLeads: React.Dispatch<React.SetStateAction<Lead[]>> }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<string | null>(null);
  const [booking, setBooking] = React.useState<Lead | null>(null);
  const [adding, setAdding] = React.useState(false);
  const [openings, setOpenings] = React.useState(seedOpenings);
  const lead = leads.find((l) => l.id === open) ?? null;
  const live = leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost");
  const sources = Object.entries(leads.reduce<Record<string, number>>((acc, l) => ({ ...acc, [l.source]: (acc[l.source] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1]);
  const verified = openings.filter((o) => o.verified).length;

  function setStage(id: string, stage: LeadStage) {
    setLeads((cur) => cur.map((l) => (l.id === id ? { ...l, stage } : l)));
    const l = leads.find((x) => x.id === id);
    desk.log(`${l?.name} moved to ${stage}`, stage === "Won" ? "ok" : stage === "Lost" ? "late" : "info");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Live leads" value={live.length} delta="+3" hint="3 new today" icon={Users} trend={[8, 9, 9, 10, 11, 10, live.length]} />
        <Stat label="Pipeline value" value={inr(live.reduce((a, l) => a + l.budget, 0), { compact: true })} delta="+14%" icon={IndianRupee} trend={[70, 72, 78, 81, 86, 90, 98]} />
        <Stat label="Measures this week" value="5" hint="31 openings" icon={Ruler} tone="info" />
        <Stat label="Avg. days to quote" value="2.4" delta="-0.6" deltaGood hint="target 2 days" icon={CalendarClock} tone="ok" trend={[4.1, 3.6, 3.4, 3.0, 2.9, 2.6, 2.4]} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Panel title="Enquiries" sub="Click a lead for details, the call log and next step" action={<Btn size="sm" variant="solid" icon={Plus} onClick={() => setAdding(true)}>New lead</Btn>}>
          <DataTable
            rows={leads}
            rowKey={(l) => l.id}
            search={(l) => `${l.name} ${l.area} ${l.flat} ${l.need}`}
            searchPlaceholder="Search name, area or flat"
            filter={{ get: (l) => l.stage, options: ["New", "Measure booked", "Measured", "Quote sent", "Negotiation", "Won"] }}
            onRow={(l) => setOpen(l.id)}
            bulk={[{ label: "Send catalogue on WhatsApp", run: (k) => { toast.success(`Catalogue sent to ${k.length} leads`); desk.log(`Catalogue sent to ${k.length} leads on WhatsApp`); } }]}
            columns={[
              { key: "name", label: "Client", render: (l) => (<div className="min-w-0"><p className="font-medium">{l.name}</p><p className="text-[11.5px] text-d-mute">{l.area}</p></div>), sort: (l) => l.name },
              { key: "need", label: "Requirement", render: (l) => <span className="text-d-mute">{l.need}</span>, wide: true },
              { key: "src", label: "Source", render: (l) => <span className="text-[12px]">{l.source}</span>, sort: (l) => l.source },
              { key: "budget", label: "Budget", align: "right", render: (l) => <span className="tnum font-mono">{inr(l.budget, { compact: true })}</span>, sort: (l) => l.budget },
              { key: "stage", label: "Stage", render: (l) => <Pill tone={stageTone[l.stage]}>{l.stage}</Pill>, sort: (l) => LEAD_STAGES.indexOf(l.stage) },
              { key: "own", label: "Owner", render: (l) => <Avatar name={l.owner} size={26} />, wide: true },
            ]}
          />
        </Panel>
        <div className="space-y-5">
          <Panel title="Where leads come from" sub="This month">
            <HBars data={sources.map(([label, value]) => ({ label, value, tone: label === "Referral" || label === "Architect" ? "ok" : "accent" }))} />
          </Panel>
          <Panel title="Funnel" sub="Leads at each stage">
            <Bars height={150} data={LEAD_STAGES.slice(0, 6).map((s) => ({ label: s.split(" ")[0], value: leads.filter((l) => l.stage === s).length, tone: stageTone[s] }))} />
          </Panel>
        </div>
      </div>

      <Panel
        icon={Ruler}
        title="Measure sheet · Siruvani Residency, RS Puram"
        sub={`Meenakshi Sundaram · Prakash on site now · ${verified} of ${openings.length} openings verified`}
        action={
          <Btn
            size="sm"
            variant="solid"
            icon={CheckCheck}
            disabled={verified < openings.length}
            onClick={() => {
              toast.success("Measure sheet sent to Divya", { description: "Room plan and quote can start" });
              desk.log("Siruvani Residency measure sheet handed to design", "ok");
            }}
          >
            Hand to design
          </Btn>
        }
      >
        <Meter value={verified} max={openings.length} tone={verified === openings.length ? "ok" : "warn"} className="mb-4" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {openings.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => {
                setOpenings((cur) => cur.map((x) => (x.id === o.id ? { ...x, verified: !x.verified } : x)));
                if (!o.verified) desk.log(`${o.room} ${o.type} verified at ${o.w}×${o.h} mm`, "ok");
              }}
              className={`desk-rise flex gap-3 rounded-[12px] border p-3 text-left transition-colors ${o.verified ? "border-d-ok/50 bg-[color-mix(in_oklab,var(--d-ok)_7%,var(--d-panel))]" : "border-d-line bg-d-panel hover:bg-d-sunk"}`}
            >
              <svg viewBox="0 0 60 60" className="h-14 w-14 shrink-0">
                {(() => {
                  const k = 44 / Math.max(o.w, o.h + o.sill * 0.4);
                  const w = o.w * k;
                  const h = o.h * k;
                  return (
                    <>
                      <rect x={30 - w / 2} y={52 - h - o.sill * k * 0.4} width={w} height={h} fill="#d9ebf2" stroke="var(--d-info)" strokeWidth="1.5" />
                      <line x1="4" y1="54" x2="56" y2="54" stroke="var(--d-mute)" strokeWidth="1" />
                    </>
                  );
                })()}
              </svg>
              <div className="min-w-0 flex-1">
                <p className="flex items-center justify-between gap-2 text-[13px] font-semibold">
                  {o.room} <span className="font-mono text-[11px] text-d-mute">{o.id}</span>
                </p>
                <p className="text-[12px] text-d-mute">{o.type}</p>
                <p className="tnum mt-0.5 font-mono text-[12.5px]">
                  {o.w} × {o.h} mm <span className="text-d-mute">· sill {o.sill}</span>
                </p>
                <p className="mt-0.5 truncate text-[11.5px] text-d-mute">{o.note}</p>
              </div>
              {o.verified ? <CheckCheck className="h-4 w-4 shrink-0 text-d-ok" /> : <span className="h-4 w-4 shrink-0 rounded-full border border-d-line" />}
            </button>
          ))}
        </div>
      </Panel>

      <Sheet
        open={!!lead}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={lead ? `${lead.id} · ${lead.source}` : ""}
        title={lead?.name ?? ""}
        sub={lead ? `${lead.flat} · ${lead.area}` : ""}
        footer={
          <>
            <Btn icon={Phone} onClick={() => { toast(`Calling ${lead?.name}`, { description: lead?.phone }); desk.log(`Called ${lead?.name}`); }}>Call</Btn>
            <Btn icon={CalendarClock} onClick={() => lead && setBooking(lead)}>Book measure</Btn>
            <Btn variant="solid" onClick={() => setOpen(null)}>Done</Btn>
          </>
        }
      >
        {lead && (
          <div className="space-y-5">
            <KV items={[{ k: "Requirement", v: lead.need }, { k: "Budget", v: inr(lead.budget) }, { k: "Owner", v: lead.owner }, { k: "Phone", v: lead.phone }, { k: "Age", v: `${lead.age} days` }, { k: "Next step", v: lead.next }]} />
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Stage</p>
              <div className="flex flex-wrap gap-1.5">
                {LEAD_STAGES.map((s) => (
                  <button key={s} type="button" onClick={() => setStage(lead.id, s)} className={`rounded-full border px-2.5 py-1 text-[12px] ${lead.stage === s ? "border-d-accent bg-d-accent text-d-accent-ink" : "border-d-line hover:bg-d-sunk"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Conversation</p>
              <ul className="space-y-2 text-[13px]">
                {[
                  { t: `${lead.age + 1}d ago`, x: `Enquiry via ${lead.source}: "${lead.need}"` },
                  { t: `${Math.max(0, lead.age - 1)}d ago`, x: `${lead.owner} shared catalogue and 3 site photos` },
                  { t: "today", x: lead.next },
                ].map((c) => (
                  <li key={c.t + c.x} className="rounded-[10px] bg-d-sunk px-3 py-2">
                    <span className="font-mono text-[11px] text-d-mute">{c.t}</span>
                    <p>{c.x}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Sheet>
      <BookMeasure
        lead={booking}
        onClose={() => setBooking(null)}
        onBook={(l, when, who) => {
          setStage(l.id, "Measure booked");
          toast.success("Site measure booked", { description: `${l.name} · ${when} · ${who}. Google Calendar and WhatsApp updated.` });
          desk.log(`Site measure booked for ${l.name}, ${when}`, "info");
        }}
      />
      <NewLead
        open={adding}
        onOpenChange={setAdding}
        onAdd={(l) => {
          setLeads((cur) => [l, ...cur]);
          toast.success("Lead added", { description: `${l.name} · ${l.area}` });
          desk.log(`New lead ${l.name} from ${l.source}`, "info");
        }}
        count={leads.length}
      />
    </div>
  );
}

function BookMeasure({ lead, onClose, onBook }: { lead: Lead | null; onClose: () => void; onBook: (l: Lead, when: string, who: string) => void }) {
  const [when, setWhen] = React.useState("Thu 22 Oct, 10:00 AM");
  const [who, setWho] = React.useState("Prakash Velu");
  return (
    <Modal open={!!lead} onOpenChange={(o) => !o && onClose()} title="Book a site measure" sub={lead ? `${lead.name} · ${lead.flat}` : ""}>
      <div className="space-y-3">
        <Field label="Slot">
          <select className={inputClass} value={when} onChange={(e) => setWhen(e.target.value)}>
            {["Wed 21 Oct, 4:00 PM", "Thu 22 Oct, 10:00 AM", "Thu 22 Oct, 3:30 PM", "Fri 23 Oct, 11:00 AM", "Sat 24 Oct, 9:30 AM"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Measurer">
          <select className={inputClass} value={who} onChange={(e) => setWho(e.target.value)}>
            {["Prakash Velu", "Divya Shanmugam", "Murugan Pandi"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <p className="rounded-[10px] bg-d-soft px-3 py-2 text-[12.5px]">Client gets a WhatsApp with the slot and a reminder to clear window grills and lofts.</p>
        <div className="flex justify-end gap-2 pt-1">
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn
            variant="solid"
            icon={CalendarClock}
            onClick={() => {
              if (lead) onBook(lead, when, who);
              onClose();
            }}
          >
            Book
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

function NewLead({ open, onOpenChange, onAdd, count }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (l: Lead) => void; count: number }) {
  const [name, setName] = React.useState("Hari Prasath");
  const [area, setArea] = React.useState("Saibaba Colony");
  const [need, setNeed] = React.useState("5 sliding windows + wardrobe");
  const [source, setSource] = React.useState("Walk-in");
  const [budget, setBudget] = React.useState("350000");
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="New lead" sub="Fathima will call within 30 minutes; the agent sends the catalogue now.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onAdd({ id: `L-${2165 + count - seedLeads.length}`, name, area, flat: "To be measured", source, need, budget: Number(budget) || 200000, stage: "New", owner: "Fathima", next: "First call", age: 0, phone: "—" });
          onOpenChange(false);
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Area">
            <input className={inputClass} value={area} onChange={(e) => setArea(e.target.value)} />
          </Field>
        </div>
        <Field label="Requirement">
          <input className={inputClass} value={need} onChange={(e) => setNeed(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Source">
            <select className={inputClass} value={source} onChange={(e) => setSource(e.target.value)}>
              {["Walk-in", "Instagram", "JustDial", "Google", "Referral", "Architect"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Budget (₹)">
            <input className={inputClass} inputMode="numeric" value={budget} onChange={(e) => setBudget(e.target.value.replace(/\D/g, ""))} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Btn onClick={() => onOpenChange(false)}>Cancel</Btn>
          <Btn variant="solid" type="submit" icon={Plus}>
            Add lead
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Quote builder ---------------- */

function WindowPreview({ c }: { c: Config }) {
  const t = WIN_TYPES[c.type];
  const k = 200 / Math.max(c.w, c.h);
  const w = c.w * k;
  const h = c.h * k;
  const x = 110 - w / 2;
  const y = 112 - h / 2;
  const frame = COLOURS[c.colour].name === "White" ? "#f4f4f2" : COLOURS[c.colour].name === "Anthracite grey" ? "#3d4246" : COLOURS[c.colour].name === "Golden oak" ? "#b07a3f" : "#6b442c";
  const glass = GLASS[c.glass].name.startsWith("Reflective") ? "#9fb8c4" : GLASS[c.glass].name.startsWith("DGU") ? "#cfe6ef" : "#e3f1f6";
  const panes = t.panes;
  return (
    <svg viewBox="0 0 220 240" className="mx-auto h-[240px] w-full max-w-[260px]">
      <rect x={x - 6} y={y - 6} width={w + 12} height={h + 12} fill={frame} stroke="#2b2018" strokeWidth="1.5" rx="2" />
      {t.style === "vent" ? (
        <>
          <rect x={x} y={y} width={w} height={h * 0.3} fill={glass} stroke={frame === "#f4f4f2" ? "#bbb" : frame} strokeWidth="4" />
          <path d={`M${x},${y + h * 0.3} L${x + w / 2},${y} L${x + w},${y + h * 0.3}`} fill="none" stroke="#7b6b5d" strokeDasharray="3 3" />
          <rect x={x} y={y + h * 0.3} width={w} height={h * 0.7} fill={glass} stroke={frame === "#f4f4f2" ? "#bbb" : frame} strokeWidth="4" />
        </>
      ) : (
        Array.from({ length: panes }, (_, i) => {
          const pw = w / panes;
          const px = x + i * pw;
          return (
            <g key={i}>
              <rect x={px} y={y} width={pw} height={h} fill={glass} stroke={frame === "#f4f4f2" ? "#bbb" : frame} strokeWidth="4" />
              <line x1={px + 6} y1={y + 10} x2={px + 18} y2={y + 22} stroke="#fff" strokeWidth="2" opacity="0.8" />
              {t.style === "slide" && <path d={`M${px + pw / 2 - 12},${y + h / 2} h24 m-6,-5 l6,5 l-6,5`} fill="none" stroke="#7b6b5d" strokeWidth="1.4" />}
              {(t.style === "case" || t.style === "door") && <path d={i % 2 === 0 ? `M${px + pw},${y} L${px},${y + h / 2} L${px + pw},${y + h}` : `M${px},${y} L${px + pw},${y + h / 2} L${px},${y + h}`} fill="none" stroke="#7b6b5d" strokeDasharray="4 3" strokeWidth="1" />}
            </g>
          );
        })
      )}
      {MESH[c.mesh].rate > 0 && <rect x={x} y={y} width={w} height={h} fill="url(#none)" stroke="#7b6b5d" strokeWidth="0.6" strokeDasharray="1 2" />}
      <text x="110" y={y + h + 26} textAnchor="middle" fontSize="11" className="fill-d-mute font-mono">
        {c.w} × {c.h} mm · {lineArea(c).toFixed(1)} sq ft
      </text>
    </svg>
  );
}

function QuoteTab() {
  const desk = useDesk();
  const [c, setC] = React.useState<Config>({ type: 1, glass: 1, hw: 1, colour: 1, mesh: 1, w: 1830, h: 1520, qty: 3, room: "Bedrooms" });
  const [lines, setLines] = React.useState<QLine[]>([
    { id: "a", type: 1, glass: 1, hw: 1, colour: 1, mesh: 1, w: 2440, h: 1520, qty: 2, room: "Living" },
    { id: "b", type: 4, glass: 3, hw: 2, colour: 1, mesh: 0, w: 2130, h: 2135, qty: 1, room: "Balcony" },
    { id: "c", type: 5, glass: 1, hw: 0, colour: 0, mesh: 0, w: 610, h: 460, qty: 3, room: "Baths" },
  ]);
  const [disc, setDisc] = React.useState(0.05);
  const [open, setOpen] = React.useState<QuoteRow | null>(null);
  const [n, setN] = React.useState(0);
  const price = linePrice(c);
  const sub = lines.reduce((a, l) => a + linePrice(l), 0);
  const discount = Math.round(sub * disc);
  const taxable = sub - discount;
  const gst = Math.round(taxable * 0.18);
  const margin = Math.round(((taxable - sub * 0.66) / Math.max(1, taxable)) * 100);
  const set = <K extends keyof Config>(k: K, v: Config[K]) => setC((cur) => ({ ...cur, [k]: v }));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Quotes out" value={quotes.filter((q) => ["Sent", "Viewed", "Revised"].includes(q.status)).length} hint={inr(quotes.filter((q) => ["Sent", "Viewed", "Revised"].includes(q.status)).reduce((a, q) => a + q.value, 0), { compact: true })} icon={FileText} />
        <Stat label="Win rate, 90 days" value="38%" delta="+4%" icon={CheckCheck} tone="ok" trend={[30, 32, 31, 34, 36, 35, 38]} />
        <Stat label="Average margin" value="29.6%" delta="-1.2%" deltaGood={false} hint="profile price hike in Sept" icon={GaugeIcon} tone="warn" trend={[32, 31.5, 31, 30.4, 30.1, 29.8, 29.6]} />
        <Stat label="Expiring in 3 days" value="2" hint="Ar. Kavitha tomorrow" icon={CalendarClock} tone="late" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Panel icon={Calculator} title="Window configurator" sub="Prabhu Venkatesan · Marudham Enclave villa · draft CI/Q/26-27/425">
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_240px]">
            <div className="space-y-3">
              <Field label="System">
                <select className={inputClass} value={c.type} onChange={(e) => set("type", Number(e.target.value))}>
                  {WIN_TYPES.map((t, i) => (
                    <option key={t.name} value={i}>
                      {t.name} · ₹{t.rate}/sq ft
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Glass">
                <div className="flex flex-wrap gap-1.5">
                  {GLASS.map((g, i) => (
                    <button key={g.name} type="button" onClick={() => set("glass", i)} className={`rounded-full border px-2.5 py-1 text-[12px] ${c.glass === i ? "border-d-accent bg-d-accent text-d-accent-ink" : "border-d-line hover:bg-d-sunk"}`}>
                      {g.name}
                      {g.rate ? <span className="ml-1 font-mono opacity-70">+{g.rate}</span> : null}
                    </button>
                  ))}
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Hardware">
                  <select className={inputClass} value={c.hw} onChange={(e) => set("hw", Number(e.target.value))}>
                    {HARDWARE.map((h, i) => (
                      <option key={h.name} value={i}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Mesh">
                  <select className={inputClass} value={c.mesh} onChange={(e) => set("mesh", Number(e.target.value))}>
                    {MESH.map((h, i) => (
                      <option key={h.name} value={i}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Profile colour">
                <div className="flex flex-wrap gap-2">
                  {COLOURS.map((col, i) => (
                    <button key={col.name} type="button" onClick={() => set("colour", i)} className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-2.5 text-[12px] ${c.colour === i ? "border-d-accent ring-2 ring-d-accent/30" : "border-d-line"}`}>
                      <span className="h-5 w-5 rounded-full ring-1 ring-black/10" style={{ background: col.swatch }} />
                      {col.name}
                      {col.mult > 1 && <span className="font-mono text-[10.5px] text-d-mute">+{Math.round((col.mult - 1) * 100)}%</span>}
                    </button>
                  ))}
                </div>
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Width mm">
                  <input className={inputClass} inputMode="numeric" value={c.w} onChange={(e) => set("w", Math.min(4000, Number(e.target.value.replace(/\D/g, "")) || 0))} />
                </Field>
                <Field label="Height mm">
                  <input className={inputClass} inputMode="numeric" value={c.h} onChange={(e) => set("h", Math.min(3000, Number(e.target.value.replace(/\D/g, "")) || 0))} />
                </Field>
                <Field label="Qty">
                  <input className={inputClass} inputMode="numeric" value={c.qty} onChange={(e) => set("qty", Math.max(1, Number(e.target.value.replace(/\D/g, "")) || 1))} />
                </Field>
              </div>
            </div>
            <div className="flex flex-col rounded-[12px] bg-d-sunk/60 p-3">
              <WindowPreview c={{ ...c, w: Math.max(300, c.w), h: Math.max(300, c.h) }} />
              <p className="text-center text-[12px] text-d-mute">{c.qty} × per unit {inr(price / c.qty)}</p>
              <p key={price} className="desk-h desk-rise tnum text-center text-[28px] font-semibold">{inr(price)}</p>
              <Btn
                variant="solid"
                icon={Plus}
                className="mt-2"
                onClick={() => {
                  setN((x) => x + 1);
                  setLines((cur) => [...cur, { ...c, id: `n${n}` }]);
                  toast.success("Added to quote", { description: `${c.qty} × ${WIN_TYPES[c.type].name} · ${inr(price)}` });
                  desk.log(`Added ${c.qty} × ${WIN_TYPES[c.type].name} to Prabhu's quote`);
                }}
              >
                Add to quote
              </Btn>
            </div>
          </div>
        </Panel>

        <Panel title="Quote draft" sub="CI/Q/26-27/425 · valid 15 days · prices incl. installation" action={<Pill tone={margin >= 28 ? "ok" : "late"} mono>margin {margin}%</Pill>}>
          <ul className="divide-y divide-d-line">
            {lines.map((l) => (
              <li key={l.id} className="flex items-center gap-3 py-2.5">
                <span className="h-8 w-8 shrink-0 rounded-[8px] ring-1 ring-black/10" style={{ background: COLOURS[l.colour].swatch }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium">
                    {l.qty} × {WIN_TYPES[l.type].name} <span className="text-d-mute">· {l.room}</span>
                  </p>
                  <p className="truncate text-[11.5px] text-d-mute">
                    {l.w}×{l.h} · {GLASS[l.glass].name} · {HARDWARE[l.hw].name} · {MESH[l.mesh].name}
                  </p>
                </div>
                <span className="tnum font-mono text-[13px]">{inr(linePrice(l))}</span>
                <IconBtn icon={Trash} label="Remove line" onClick={() => setLines((cur) => cur.filter((x) => x.id !== l.id))} />
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-1.5 rounded-[12px] bg-d-sunk/60 p-3 text-[13px]">
            {[
              { k: "Sub-total", v: inr(sub) },
              { k: `Discount ${Math.round(disc * 100)}%`, v: `− ${inr(discount)}` },
              { k: "Taxable value", v: inr(taxable) },
              { k: "CGST 9%", v: inr(gst / 2) },
              { k: "SGST 9%", v: inr(gst / 2) },
            ].map((r) => (
              <p key={r.k} className="flex justify-between">
                <span className="text-d-mute">{r.k}</span>
                <span className="tnum font-mono">{r.v}</span>
              </p>
            ))}
            <p className="flex justify-between border-t border-d-line pt-2 text-[15px] font-semibold">
              <span>Total</span>
              <span className="tnum font-mono">{inr(taxable + gst)}</span>
            </p>
            <input type="range" min={0} max={0.15} step={0.01} value={disc} onChange={(e) => setDisc(Number(e.target.value))} className="w-full accent-[var(--d-accent)]" aria-label="Discount" />
            <p className="text-[11.5px] text-d-mute">{disc > 0.08 ? "Above 8% goes to Karthik for approval." : "Within Divya's 8% band."} Milestones: 50% {inr((taxable + gst) * 0.5, { compact: true })} · 40% {inr((taxable + gst) * 0.4, { compact: true })} · 10% {inr((taxable + gst) * 0.1, { compact: true })}</p>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Btn icon={FileText} onClick={() => toast("PDF ready", { description: "Letterhead, GSTIN 33AAKFC4821M1Z6, drawing per window" })}>PDF</Btn>
            <Btn
              variant="solid"
              icon={Send}
              onClick={() => {
                if (disc > 0.08) {
                  toast.warning("Sent to Karthik for discount approval");
                  desk.log(`Prabhu quote: ${Math.round(disc * 100)}% discount waiting on owner`, "warn");
                } else {
                  toast.success("Quote sent to Prabhu on WhatsApp", { description: inr(taxable + gst) });
                  desk.log(`Quote sent to Prabhu Venkatesan, ${inr(taxable + gst, { compact: true })}`, "ok");
                }
              }}
            >
              Send quote
            </Btn>
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Panel title="All quotes" sub="Click a quote for its revisions and validity">
          <DataTable
            rows={quotes}
            rowKey={(q) => q.no}
            search={(q) => `${q.no} ${q.client} ${q.scope}`}
            searchPlaceholder="Search quote or client"
            filter={{ get: (q) => q.status, options: ["Draft", "Sent", "Viewed", "Revised", "Accepted", "Expired"] }}
            onRow={setOpen}
            columns={[
              { key: "no", label: "Quote", render: (q) => <span className="font-mono text-[12px]">{q.no.slice(-3)} {q.rev}</span>, sort: (q) => q.no },
              { key: "client", label: "Client", render: (q) => <span className="font-medium">{q.client}</span>, sort: (q) => q.client },
              { key: "scope", label: "Scope", render: (q) => <span className="text-d-mute">{q.scope}</span>, wide: true },
              { key: "value", label: "Value", align: "right", render: (q) => <span className="tnum font-mono">{inr(q.value, { compact: true })}</span>, sort: (q) => q.value },
              { key: "m", label: "Margin", align: "right", render: (q) => <span className="tnum font-mono" style={{ color: q.margin < 25 ? "var(--d-late)" : undefined }}>{q.margin}%</span>, sort: (q) => q.margin },
              { key: "valid", label: "Valid", render: (q) => (q.validDays ? <span className="inline-flex items-center gap-1 font-mono text-[11.5px]"><span className="h-1.5 w-1.5 rounded-full" style={{ background: q.validDays <= 2 ? "var(--d-late)" : "var(--d-ok)" }} /><Countdown compact inHours={q.validDays * 24 - 9} /></span> : <span className="text-d-mute">—</span>) },
              { key: "st", label: "Status", render: (q) => <Pill tone={quoteTone[q.status]}>{q.status}</Pill> },
            ]}
          />
        </Panel>
        <Panel title="Won vs lost, by month" sub="₹ lakh, windows and furniture">
          <Bars
            height={210}
            format={(v) => `₹${v}L`}
            data={[
              { label: "May", value: 0, stack: [{ name: "Won", value: 18, tone: "ok" as const }, { name: "Lost", value: 22, tone: "late" as const }] },
              { label: "Jun", value: 0, stack: [{ name: "Won", value: 24, tone: "ok" as const }, { name: "Lost", value: 19, tone: "late" as const }] },
              { label: "Jul", value: 0, stack: [{ name: "Won", value: 21, tone: "ok" as const }, { name: "Lost", value: 26, tone: "late" as const }] },
              { label: "Aug", value: 0, stack: [{ name: "Won", value: 29, tone: "ok" as const }, { name: "Lost", value: 20, tone: "late" as const }] },
              { label: "Sep", value: 0, stack: [{ name: "Won", value: 34, tone: "ok" as const }, { name: "Lost", value: 23, tone: "late" as const }] },
              { label: "Oct", value: 0, stack: [{ name: "Won", value: 21, tone: "ok" as const }, { name: "Lost", value: 9, tone: "late" as const }] },
            ].map((d) => ({ ...d, value: d.stack.reduce((a, s) => a + s.value, 0) }))}
          />
          <p className="mt-2 text-[12px] text-d-mute">Top loss reason: aluminium quoted 18–22% cheaper (6 of 14 lost).</p>
        </Panel>
      </div>

      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={open ? `${open.no} · ${open.rev}` : ""}
        title={open?.client ?? ""}
        sub={open?.scope}
        footer={
          <>
            <Btn icon={MessageCircle} onClick={() => { toast.success("Follow-up sent", { description: open?.client }); desk.log(`Quote follow-up sent to ${open?.client}`); }}>Follow up</Btn>
            <Btn variant="solid" onClick={() => setOpen(null)}>Done</Btn>
          </>
        }
      >
        {open && (
          <div className="space-y-5">
            <KV items={[{ k: "Value", v: inr(open.value) }, { k: "Margin", v: `${open.margin}%` }, { k: "Sent", v: open.sent }, { k: "Status", v: <Pill tone={quoteTone[open.status]}>{open.status}</Pill> }, { k: "GST (18%)", v: inr(open.value - open.value / 1.18) }, { k: "Advance 50%", v: inr(open.value * 0.5) }]} />
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Revisions</p>
              <ul className="space-y-1.5">
                {Array.from({ length: Number(open.rev.slice(1)) + 1 }, (_, i) => (
                  <li key={i} className="flex items-center justify-between rounded-[10px] border border-d-line px-3 py-2 text-[13px]">
                    <span>R{i}</span>
                    <span className="tnum font-mono">{inr(open.value * (1 + (Number(open.rev.slice(1)) - i) * 0.035), { compact: true })}</span>
                    <span className="text-[11.5px] text-d-mute">{i === 0 ? "first cut" : i === 1 ? "client changes" : "discount"}</span>
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

/* ---------------- Factory ---------------- */

function FactoryTab({ orders, setOrders }: { orders: FOrder[]; setOrders: React.Dispatch<React.SetStateAction<FOrder[]>> }) {
  const desk = useDesk();
  const [line, setLine] = React.useState<"All" | "Windows" | "Furniture">("All");
  const [open, setOpen] = React.useState<string | null>(null);
  const order = orders.find((o) => o.id === open) ?? null;
  const shown = orders.filter((o) => line === "All" || o.line === line);
  const over = FSTAGES.filter((s) => s.limit !== undefined && orders.filter((o) => o.stage === s.id).length > s.limit);
  const welder = useDrift(82, 2, 2400);

  function move(id: string, stage: string) {
    const o = orders.find((x) => x.id === id);
    if (!o || o.stage === stage) return;
    if (o.hold && stage !== "drawing") {
      toast.error(`${o.id} is on hold`, { description: o.hold });
      return;
    }
    setOrders((cur) => cur.map((x) => (x.id === id ? { ...x, stage } : x)));
    const label = FSTAGES.find((s) => s.id === stage)?.label;
    toast.success(`${o.id} → ${label}`, { description: `${o.client} · ${o.item}` });
    desk.log(`${o.id} moved to ${label}`, stage === "ready" ? "ok" : "info");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Orders on the floor" value={orders.filter((o) => o.stage !== "ready").length} hint={`${orders.reduce((a, o) => a + o.units, 0)} units`} icon={Factory} />
        <Stat label="Over WIP limit" value={over.length} hint={over.map((s) => s.label).join(", ") || "all clear"} icon={TriangleAlert} tone={over.length ? "late" : "ok"} />
        <Stat label="Ready to dispatch" value={orders.filter((o) => o.stage === "ready").length} hint="2 trucks booked" icon={Truck} tone="ok" />
        <Stat label="Welder uptime" value={`${Math.round(welder)}%`} delta="+3%" hint="4-head welder" icon={GaugeIcon} trend={[74, 77, 79, 80, 78, 81, Math.round(welder)]} />
      </div>
      <Panel title="Kurichi floor" sub="Drag a card to the next station. Over-limit stations turn red; held orders can't leave drawing." action={<Segmented size="sm" options={["All", "Windows", "Furniture"] as const} value={line} onChange={setLine} />}>
        <Board
          columns={FSTAGES}
          items={shown}
          itemKey={(o) => o.id}
          getColumn={(o) => o.stage}
          onMove={move}
          minColumnWidth={210}
          renderCard={(o) => (
            <button type="button" onClick={() => setOpen(o.id)} className="block w-full text-left">
              <p className="flex items-center gap-1.5 font-mono text-[11px] text-d-mute">
                {o.id}
                {o.rush && <Pill tone="late">rush</Pill>}
                <span className="ml-auto">{o.due}</span>
              </p>
              <p className="mt-1 text-[13px] font-semibold leading-snug">{o.client}</p>
              <p className="text-[12px] text-d-mute">{o.item}</p>
              <p className="mt-2 flex items-center justify-between text-[11.5px]">
                <Pill tone={o.line === "Windows" ? "info" : "accent"}>{o.line}</Pill>
                <span className="font-mono text-d-mute">{o.units} units</span>
              </p>
              {o.hold && <p className="mt-2 rounded-[8px] bg-[color-mix(in_oklab,var(--d-warn)_14%,transparent)] px-2 py-1 text-[11.5px] text-d-warn">Hold: {o.hold}</p>}
            </button>
          )}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Station load today" sub="Hours booked vs available">
          <HBars
            format={(v) => `${v}%`}
            max={120}
            data={[
              { label: "Profile saw", value: 76, tone: "accent" },
              { label: "4-head welder", value: 112, tone: "late", sub: "over" },
              { label: "Corner cleaner", value: 88, tone: "warn" },
              { label: "Glazing bench", value: 94, tone: "warn" },
              { label: "Panel saw", value: 64, tone: "accent" },
              { label: "Edge bander", value: 71, tone: "accent" },
              { label: "CNC boring", value: 58, tone: "ok" },
            ]}
          />
        </Panel>
        <Panel title="Raw material watch" sub="Against signed drawings for the next 10 days">
          <ul className="space-y-3">
            {[
              { m: "70mm casement frame profile, white", have: 128, need: 164, u: "bars" },
              { m: "Walnut foil sash profile", have: 22, need: 48, u: "bars" },
              { m: "18mm BWR ply", have: 86, need: 72, u: "sheets" },
              { m: "1mm laminate, Linen Oak", have: 40, need: 52, u: "sheets" },
              { m: "DGU units 5+12+5", have: 31, need: 34, u: "nos" },
              { m: "Soft-close hinges", have: 420, need: 260, u: "pcs" },
            ].map((r) => (
              <li key={r.m}>
                <div className="flex items-baseline justify-between gap-2 text-[13px]">
                  <span className="truncate">{r.m}</span>
                  <span className="tnum shrink-0 font-mono text-[12px] text-d-mute">
                    {r.have}/{r.need} {r.u}
                  </span>
                </div>
                <Meter value={Math.min(r.have, r.need)} max={r.need} tone={r.have >= r.need ? "ok" : r.have / r.need > 0.75 ? "warn" : "late"} className="mt-1" />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <Sheet
        open={!!order}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={order ? `${order.id} · ${order.line}` : ""}
        title={order?.client ?? ""}
        sub={order ? `${order.item} · due ${order.due}` : ""}
        footer={
          <>
            <Btn
              icon={TriangleAlert}
              onClick={() => {
                if (!order) return;
                setOrders((cur) => cur.map((x) => (x.id === order.id ? { ...x, rush: !x.rush } : x)));
                desk.log(`${order.id} rush flag ${order.rush ? "removed" : "set"}`, "warn");
              }}
            >
              {order?.rush ? "Remove rush" : "Mark rush"}
            </Btn>
            <Btn
              variant="solid"
              onClick={() => {
                if (!order) return;
                const i = FSTAGES.findIndex((s) => s.id === order.stage);
                if (i < FSTAGES.length - 1) move(order.id, FSTAGES[i + 1].id);
              }}
            >
              Next station
            </Btn>
          </>
        }
      >
        {order && (
          <div className="space-y-5">
            <KV items={[{ k: "Units", v: order.units }, { k: "Due", v: order.due }, { k: "Station", v: FSTAGES.find((s) => s.id === order.stage)?.label }, { k: "Hold", v: order.hold ?? "None" }]} />
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Route</p>
              <ol className="space-y-1.5">
                {FSTAGES.map((s, i) => {
                  const at = FSTAGES.findIndex((x) => x.id === order.stage);
                  return (
                    <li key={s.id} className="flex items-center gap-3 rounded-[10px] border border-d-line px-3 py-2 text-[13px]">
                      <span className={`h-3 w-3 rounded-full ${i < at ? "bg-d-ok" : i === at ? "bg-d-accent desk-ping" : "bg-d-sunk"}`} />
                      <span className="flex-1">{s.label}</span>
                      <span className="font-mono text-[11px] text-d-mute">{i < at ? "done" : i === at ? "now" : s.hint}</span>
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

/* ---------------- Installs ---------------- */

const DAYS = ["Mon 19", "Tue 20", "Wed 21", "Thu 22", "Fri 23", "Sat 24", "Sun 25", "Mon 26", "Tue 27", "Wed 28", "Thu 29", "Fri 30", "Sat 31", "Sun 1"];

function InstallsTab({ installs, setInstalls }: { installs: Install[]; setInstalls: React.Dispatch<React.SetStateAction<Install[]>> }) {
  const desk = useDesk();
  const [crew, setCrew] = React.useState<"All" | "A" | "B" | "C" | "D">("All");
  const [open, setOpen] = React.useState<string | null>(null);
  const [snags, setSnags] = React.useState(seedSnags);
  const [snag, setSnag] = React.useState<Snag | null>(null);
  const [checks, setChecks] = React.useState([
    { id: "c1", label: "Site ready: grills removed, area cleared", sub: "Client confirmed on WhatsApp", done: true },
    { id: "c2", label: "Openings re-checked against drawing", sub: "Tolerance ±5 mm", done: true },
    { id: "c3", label: "Frames fixed, packers and anchors", done: true },
    { id: "c4", label: "Silicone outside, PU foam inside", done: false },
    { id: "c5", label: "Sash adjust, handles and locks tested", done: false },
    { id: "c6", label: "Water test with hose, 10 minutes", done: false },
    { id: "c7", label: "Clean-up and client sign-off photo", sub: "Triggers the 10% handover ask", done: false },
  ]);
  const inst = installs.find((i) => i.id === open) ?? null;
  const shown = installs.filter((i) => crew === "All" || i.crew.startsWith(`Crew ${crew}`));

  const rows: GanttRow[] = shown.map((i) => ({
    id: i.id,
    title: i.client,
    sub: `${i.crew} · ${i.area}`,
    swatch: i.kind === "Windows" ? "linear-gradient(135deg,#d9ebf2,#3f7189)" : "repeating-linear-gradient(35deg,#9b6b48 0 3px,#7d4f31 3px 5px)",
    bars: [{ from: i.from, to: i.to, tone: installTone[i.status], label: i.scope }],
    badge: i.status === "Snag" ? { at: (i.from + i.to) / 2, label: "snag", tone: "late" } : undefined,
  }));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Crews on site now" value={installs.filter((i) => i.status === "On site").length} hint="of 4 crews" icon={Hammer} tone="info" />
        <Stat label="Installs next 14 days" value={installs.filter((i) => i.status === "Scheduled").length} hint="2 overlap on Crew A" icon={CalendarClock} />
        <Stat label="Open snags" value={snags.filter((s) => !s.fixed).length} delta="-2" deltaGood hint="oldest 18 days" icon={Wrench} tone="late" trend={[9, 9, 8, 8, 7, 7, snags.filter((s) => !s.fixed).length]} />
        <Stat label="First-time-right" value="84%" delta="+5%" hint="no snag at handover" icon={CheckCheck} tone="ok" trend={[71, 74, 76, 79, 80, 82, 84]} />
      </div>
      <Panel title="Crew calendar" sub="Two weeks from Mon 19 Oct. Click a job for its site sheet." action={<Segmented size="sm" options={["All", "A", "B", "C", "D"] as const} value={crew} onChange={setCrew} />}>
        <Gantt
          rows={rows}
          days={14}
          ticks={DAYS.map((d, i) => ({ at: i, label: d }))}
          today={{ at: 1.45, label: "Now" }}
          markers={[{ at: 3, label: "Crew A clash", tone: "late" }]}
          onRow={(r) => setOpen(r.id)}
          labelWidth={250}
          actions={(r) => {
            const i = installs.find((x) => x.id === r.id)!;
            return (
              <>
                <IconBtn
                  icon={CheckCheck}
                  label="Mark handed over"
                  onClick={() => {
                    setInstalls((cur) => cur.map((x) => (x.id === i.id ? { ...x, status: "Done" } : x)));
                    toast.success(`${i.client} handed over`, { description: "10% handover ask queued for Revathi" });
                    desk.log(`${i.client} install handed over`, "ok");
                  }}
                />
                <IconBtn icon={ClipboardList} label="Site sheet" onClick={() => setOpen(i.id)} />
              </>
            );
          }}
        />
        <div className="mt-3 flex flex-wrap gap-4 text-[12px] text-d-mute">
          {(Object.keys(installTone) as Install["status"][]).map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span className="h-2 w-5 rounded-full" style={{ background: `var(--d-${installTone[s]})` }} /> {s}
            </span>
          ))}
        </div>
      </Panel>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <Panel live title="Live site · Vignesh Textiles office" sub="Crew A, Murugan + 3 · Avinashi Road · started 9:10 AM">
          <Meter value={checks.filter((c) => c.done).length} max={checks.length} tone="ok" className="mb-3" />
          <Checklist
            items={checks}
            onToggle={(id) => {
              setChecks((cur) => cur.map((c) => (c.id === id ? { ...c, done: !c.done } : c)));
              const c = checks.find((x) => x.id === id);
              if (c && !c.done) desk.log(`Vignesh site: ${c.label}`, "ok");
            }}
          />
        </Panel>
        <Panel title="Snags" sub="Every snag holds the 10% handover payment">
          <DataTable
            rows={snags}
            rowKey={(s) => s.id}
            dense
            pageSize={6}
            filter={{ get: (s) => (s.fixed ? "Fixed" : "Open"), options: ["Open", "Fixed"] }}
            onRow={setSnag}
            columns={[
              { key: "client", label: "Client", render: (s) => <span className="font-medium">{s.client}</span>, sort: (s) => s.client },
              { key: "issue", label: "Issue", render: (s) => <span className="text-d-mute">{s.issue}</span>, wide: true },
              { key: "crew", label: "Crew", render: (s) => s.crew },
              { key: "age", label: "Age", align: "right", render: (s) => <span className="tnum font-mono" style={{ color: s.age > 10 && !s.fixed ? "var(--d-late)" : undefined }}>{s.age}d</span>, sort: (s) => s.age },
              { key: "st", label: "", render: (s) => <Pill tone={s.fixed ? "ok" : "warn"}>{s.fixed ? "Fixed" : "Open"}</Pill> },
            ]}
          />
        </Panel>
      </div>
      <Sheet
        open={!!inst}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={inst ? `${inst.id} · ${inst.kind}` : ""}
        title={inst?.client ?? ""}
        sub={inst ? `${inst.scope} · ${inst.area}` : ""}
        footer={
          <>
            <Btn icon={MessageCircle} onClick={() => { toast.success("Crew ETA sent to client"); desk.log(`ETA sent to ${inst?.client}`); }}>Send ETA</Btn>
            <Btn variant="solid" onClick={() => setOpen(null)}>Done</Btn>
          </>
        }
      >
        {inst && (
          <div className="space-y-5">
            <KV items={[{ k: "Crew", v: inst.crew }, { k: "Status", v: <Pill tone={installTone[inst.status]}>{inst.status}</Pill> }, { k: "From", v: DAYS[Math.floor(inst.from)] }, { k: "To", v: DAYS[Math.min(13, Math.floor(inst.to))] }]} />
            <Field label="Reassign crew">
              <select
                className={inputClass}
                value={inst.crew}
                onChange={(e) => {
                  const v = e.target.value;
                  setInstalls((cur) => cur.map((x) => (x.id === inst.id ? { ...x, crew: v } : x)));
                  toast.success(`${inst.client} moved to ${v}`);
                  desk.log(`${inst.client} reassigned to ${v}`, "info");
                }}
              >
                {["Crew A · Murugan", "Crew B · Selvam", "Crew C · Joseph", "Crew D · Imran"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Carry list</p>
              <ul className="grid grid-cols-2 gap-1.5 text-[12.5px]">
                {["Drill + SDS bits", "PU foam × 6", "Silicone, clear × 12", "Packers, 3/5/10mm", "Laser level", "Ladder 8 ft", "Glass suction cups", "Client sign-off sheet"].map((c) => (
                  <li key={c} className="rounded-[8px] bg-d-sunk px-2.5 py-1.5">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Sheet>
      <Sheet
        open={!!snag}
        onOpenChange={(o) => !o && setSnag(null)}
        eyebrow={snag?.id}
        title={snag?.client ?? ""}
        sub={snag ? `${snag.issue} · raised ${snag.raised}` : ""}
        footer={
          <Btn
            variant="solid"
            icon={CheckCheck}
            onClick={() => {
              if (!snag) return;
              setSnags((cur) => cur.map((s) => (s.id === snag.id ? { ...s, fixed: !s.fixed } : s)));
              toast.success(snag.fixed ? "Snag reopened" : "Snag fixed", { description: `${snag.client} · handover 10% can be asked` });
              desk.log(`Snag ${snag.id} ${snag.fixed ? "reopened" : "fixed"} at ${snag.client}`, snag.fixed ? "warn" : "ok");
              setSnag(null);
            }}
          >
            {snag?.fixed ? "Reopen" : "Mark fixed"}
          </Btn>
        }
      >
        {snag && <KV items={[{ k: "Crew", v: snag.crew }, { k: "Age", v: `${snag.age} days` }, { k: "Raised", v: snag.raised }, { k: "Status", v: snag.fixed ? "Fixed" : "Open" }]} />}
      </Sheet>
    </div>
  );
}

/* ---------------- Payments ---------------- */

function PaymentsTab({ projects, setProjects }: { projects: Project[]; setProjects: React.Dispatch<React.SetStateAction<Project[]>> }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<string | null>(null);
  const p = projects.find((x) => x.id === open) ?? null;
  const pending = projects.reduce((a, x) => a + dueOf(x), 0);
  const received = projects.reduce((a, x) => a + MS.reduce((b, m, i) => b + (x.paid[i] ? x.value * m.pct : 0), 0), 0);
  const overdue = projects.filter((x) => x.overdue > 0);
  const bucket = (d: number) => (d === 0 ? "Not yet due" : d <= 15 ? "1–15 days" : d <= 30 ? "16–30 days" : "30+ days");
  const buckets = ["Not yet due", "1–15 days", "16–30 days", "30+ days"].map((label, i) => ({ label, value: projects.filter((x) => bucket(x.overdue) === label).reduce((a, x) => a + dueOf(x), 0), tone: (["ok", "info", "warn", "late"] as const)[i] }));

  function markPaid(id: string, idx: number) {
    const x = projects.find((y) => y.id === id);
    if (!x) return;
    setProjects((cur) => cur.map((y) => (y.id === id ? { ...y, paid: y.paid.map((v, i) => (i === idx ? !v : v)) as Project["paid"], overdue: idx === 2 && !y.paid[2] ? 0 : y.overdue } : y)));
    const amt = x.value * MS[idx].pct;
    if (!x.paid[idx]) {
      toast.success(`${MS[idx].name} received`, { description: `${x.client} · ${inr(amt)} · receipt posted to Tally` });
      desk.log(`${x.client}: ${MS[idx].name} ${inr(amt, { compact: true })} received`, "ok");
    } else desk.log(`${x.client}: ${MS[idx].name} marked unpaid`, "warn");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Pending milestones" value={inr(pending, { compact: true })} delta="-6%" deltaGood hint={`${projects.filter((x) => dueOf(x) > 0).length} projects`} icon={Wallet} tone="warn" trend={[22, 21, 19, 20, 18, 17, pending / 1e5]} />
        <Stat label="Collected this FY" value={inr(received + 18400000, { compact: true })} delta="+22%" icon={IndianRupee} tone="ok" trend={[0.4, 0.6, 0.9, 1.1, 1.4, 1.7, 2.0]} />
        <Stat label="Overdue" value={inr(overdue.reduce((a, x) => a + dueOf(x), 0), { compact: true })} hint={`${overdue.length} projects, mostly the 10%`} icon={TriangleAlert} tone="late" />
        <Stat label="Pre-dispatch gate" value="100%" hint="no material left unpaid this month" icon={Package} tone="ok" />
      </div>
      <Panel title="Overdue ageing" sub="Days past the milestone trigger">
        <AgingBar buckets={buckets} format={(v) => inr(v, { compact: true })} />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Panel title="Projects on 50 / 40 / 10" sub="Click a project to record a payment or send a UPI link">
          <DataTable
            rows={projects}
            rowKey={(x) => x.id}
            search={(x) => `${x.client} ${x.scope} ${x.id}`}
            searchPlaceholder="Search client or project"
            filter={{ get: (x) => (x.overdue > 0 ? "Overdue" : dueOf(x) > 0 ? "Due" : "Paid"), options: ["Overdue", "Due", "Paid"] }}
            onRow={(x) => setOpen(x.id)}
            bulk={[{ label: "Send UPI links", run: (k) => { toast.success(`${k.length} UPI links sent`); desk.log(`${k.length} milestone UPI links sent on WhatsApp`, "info"); } }]}
            columns={[
              { key: "c", label: "Client", render: (x) => (<div><p className="font-medium">{x.client}</p><p className="text-[11.5px] text-d-mute">{x.scope}</p></div>), sort: (x) => x.client },
              { key: "v", label: "Value", align: "right", render: (x) => <span className="tnum font-mono">{inr(x.value, { compact: true })}</span>, sort: (x) => x.value },
              {
                key: "ms",
                label: "50 · 40 · 10",
                render: (x) => (
                  <div className="flex h-2.5 w-[120px] gap-0.5">
                    {MS.map((m, i) => (
                      <span key={m.name} className="h-full rounded-[2px]" style={{ width: `${m.pct * 100}%`, background: x.paid[i] ? "var(--d-accent)" : i === 2 && x.overdue ? "var(--d-late)" : "var(--d-sunk)", boxShadow: "inset 0 0 0 1px var(--d-line)" }} />
                    ))}
                  </div>
                ),
              },
              { key: "stage", label: "Stage", render: (x) => <span className="text-[12px] text-d-mute">{x.stage}</span>, wide: true },
              { key: "due", label: "Due", align: "right", render: (x) => <span className="tnum font-mono">{dueOf(x) ? inr(dueOf(x), { compact: true }) : "—"}</span>, sort: (x) => dueOf(x) },
              { key: "od", label: "", render: (x) => (x.overdue ? <Pill tone="late">{x.overdue}d over</Pill> : dueOf(x) ? <Pill tone="info">due</Pill> : <Pill tone="ok">paid</Pill>) },
            ]}
          />
        </Panel>
        <Panel title="Expected in" sub="₹ lakh, from milestone triggers">
          <Bars height={210} format={(v) => `₹${v}L`} data={[{ label: "This wk", value: 9.4, tone: "ok" }, { label: "Next wk", value: 6.1, tone: "accent" }, { label: "Wk 3", value: 4.3, tone: "accent" }, { label: "Wk 4", value: 2.7, tone: "info" }, { label: "Held", value: 3.5, tone: "late" }]} />
          <p className="mt-2 text-[12px] text-d-mute">“Held” is the 10% stuck behind open snags.</p>
        </Panel>
      </div>
      <Sheet
        open={!!p}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={p?.id}
        title={p?.client ?? ""}
        sub={p ? `${p.scope} · ${inr(p.value)} incl. GST` : ""}
        footer={
          <>
            <Btn
              icon={MessageCircle}
              onClick={() => {
                toast.success("UPI link sent on WhatsApp", { description: `${p?.client} · ${inr(p ? dueOf(p) : 0)}` });
                desk.log(`UPI link sent to ${p?.client}`, "info");
              }}
            >
              Send UPI link
            </Btn>
            <Btn variant="solid" onClick={() => setOpen(null)}>
              Done
            </Btn>
          </>
        }
      >
        {p && (
          <div className="space-y-5">
            <ol className="space-y-2">
              {MS.map((m, i) => (
                <li key={m.name} className={`flex items-center gap-3 rounded-[12px] border p-3 ${p.paid[i] ? "border-d-accent/40 bg-d-soft" : "border-d-line"}`}>
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-[12px] font-semibold ${p.paid[i] ? "bg-d-accent text-d-accent-ink" : "bg-d-sunk"}`}>{Math.round(m.pct * 100)}%</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-semibold">{m.name}</p>
                    <p className="text-[12px] text-d-mute">{m.when}</p>
                  </div>
                  <span className="tnum font-mono text-[13px]">{inr(p.value * m.pct)}</span>
                  <Btn size="sm" variant={p.paid[i] ? "ghost" : "solid"} onClick={() => markPaid(p.id, i)}>
                    {p.paid[i] ? "Undo" : "Received"}
                  </Btn>
                </li>
              ))}
            </ol>
            <KV items={[{ k: "Stage", v: p.stage }, { k: "Next", v: p.nextDue }, { k: "Taxable", v: inr(p.value / 1.18) }, { k: "GST", v: inr(p.value - p.value / 1.18) }]} />
            <div className="rounded-[14px] bg-[#e7f6e9] p-4 text-[13px] leading-relaxed text-[#1d3b22]">
              Vanakkam, this is Revathi from Cauvery Interiors. As per our 50/40/10 terms, {inr(dueOf(p))} is now due for {p.scope.toLowerCase()}. Please use the UPI link below. Thank you!
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
