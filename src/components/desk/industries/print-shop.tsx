"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  Bot,
  Camera,
  CheckCheck,
  ClipboardList,
  Droplet,
  FileImage,
  Flame,
  Gauge as GaugeIcon,
  HardHat,
  IndianRupee,
  Layers,
  MapPin,
  MessageCircle,
  Package,
  Pause,
  Play,
  Plug,
  Plus,
  Printer,
  Receipt,
  RefreshCw,
  Ruler,
  Send,
  ShieldCheck,
  Timer,
  Truck,
  Users,
  Wrench,
} from "lucide-react";
import { DeskShell, useDesk } from "../shell";
import { AreaChart, Bars, Donut, HBars } from "../charts";
import { AgingBar, ApprovalQueue, Checklist, Countdown, DataTable, Gantt, type GanttRow } from "../data";
import { AgentsModule, ConnectionsModule, IndependenceModule, PeopleModule } from "../common";
import { Btn, Field, inputClass, inr, KV, Meter, Modal, Panel, Pill, Segmented, Sheet, Stat, num } from "../ui";
import type { DeskConfig, DeskModule, IndependenceData, Integration, TeamMember, Tone, WorkforceAgent } from "../types";

/* ============================================================
   Data — Ganga Printworks, Kanpur. Fictional flex, vinyl, UV and
   digital print shop with a fabrication bay and two install crews.
   ============================================================ */

const STAGES = ["Artwork", "Proof", "Print", "Lamination", "Fabrication", "Install"] as const;
type FlowStage = (typeof STAGES)[number];
type Stage = FlowStage | "Done";
type MachineId = "FX-1" | "ES-2" | "UV-3" | "DO-4";

const CMYK = [
  { k: "C", color: "#22b8f0" },
  { k: "M", color: "#ec2f8f" },
  { k: "Y", color: "#f7d21e" },
  { k: "K", color: "#a3adb8" },
] as const;

type Job = {
  id: string;
  client: string;
  area: string;
  item: string;
  media: string;
  w: number;
  h: number;
  qty: number;
  machine: MachineId;
  stage: Stage;
  due: string;
  dueIn: number;
  amount: number;
  rep: string;
  rush?: boolean;
  lam: "None" | "Gloss" | "Matte";
  fab: string;
  install: boolean;
};

const seedJobs: Job[] = [
  { id: "GP-2431", client: "Agarwal Sweets", area: "Swaroop Nagar", item: "Diwali hoarding 40×20 ft", media: "Star flex 440 gsm", w: 40, h: 20, qty: 1, machine: "FX-1", stage: "Print", due: "Today 7 PM", dueIn: 8, amount: 38400, rep: "Deepak", rush: true, lam: "None", fab: "MS frame + tie-up", install: true },
  { id: "GP-2433", client: "Kanpur Royals T20 League", area: "Green Park", item: "Boundary banners 20×4 ft", media: "Normal flex 280 gsm", w: 20, h: 4, qty: 12, machine: "FX-1", stage: "Print", due: "Wed 10 AM", dueIn: 23, amount: 26800, rep: "Deepak", lam: "None", fab: "Eyelets every 2 ft", install: false },
  { id: "GP-2436", client: "Shree Balaji Motors", area: "Kalyanpur", item: "Backlit flex for showroom box 12×6 ft", media: "Backlit flex 510 gsm", w: 12, h: 6, qty: 2, machine: "FX-1", stage: "Print", due: "Thu", dueIn: 50, amount: 21600, rep: "Saurabh", lam: "None", fab: "Backlit box refit", install: true },
  { id: "GP-2428", client: "Pukhraj Jewellers", area: "Mall Road", item: "Window vinyl, Dhanteras offer 6×8 ft", media: "Gloss vinyl 100 mic", w: 6, h: 8, qty: 3, machine: "ES-2", stage: "Print", due: "Today 5 PM", dueIn: 6, amount: 19440, rep: "Deepak", rush: true, lam: "Matte", fab: "Contour cut", install: true },
  { id: "GP-2438", client: "Ojas Coaching", area: "Kakadeo", item: "Roll-up standees 2.5×6 ft", media: "Matte vinyl on PET", w: 2.5, h: 6, qty: 20, machine: "ES-2", stage: "Print", due: "Wed 4 PM", dueIn: 29, amount: 28000, rep: "Deepak", lam: "Gloss", fab: "Roll-up stand fitting", install: false },
  { id: "GP-2425", client: "Ujala Eye Hospital", area: "Swaroop Nagar", item: "Room and ward signs 2×1 ft", media: "Sunboard 5 mm UV", w: 2, h: 1, qty: 60, machine: "UV-3", stage: "Print", due: "Wed 12 PM", dueIn: 25, amount: 22800, rep: "Saurabh", lam: "None", fab: "Router cut + stand-offs", install: true },
  { id: "GP-2440", client: "Hotel Ganges View", area: "Civil Lines", item: "ACP fascia panel with LED letters 16×3 ft", media: "ACP 3 mm UV direct", w: 16, h: 3, qty: 1, machine: "UV-3", stage: "Print", due: "Sat", dueIn: 98, amount: 86500, rep: "Saurabh", lam: "None", fab: "ACP + 3D acrylic LED letters", install: true },
  { id: "GP-2421", client: "Mahavir Agency", area: "Govind Nagar", item: "A4 tri-fold brochures, 300 gsm art card", media: "Art card 300 gsm 13×19", w: 1, h: 1, qty: 1500, machine: "DO-4", stage: "Print", due: "Today 6 PM", dueIn: 7, amount: 18750, rep: "Ritu", lam: "Matte", fab: "Crease + fold", install: false },
  { id: "GP-2442", client: "Rama Dental College", area: "Mandhana", item: "Visiting cards, 42 staff × 100", media: "Textured 350 gsm 13×19", w: 1, h: 1, qty: 210, machine: "DO-4", stage: "Print", due: "Thu", dueIn: 52, amount: 8400, rep: "Ritu", lam: "Matte", fab: "Guillotine cut", install: false },
  { id: "GP-2444", client: "Bajrang Steel Traders", area: "Fazalganj", item: "Shop board 20×5 ft", media: "Star flex 440 gsm", w: 20, h: 5, qty: 1, machine: "FX-1", stage: "Proof", due: "Thu", dueIn: 49, amount: 9800, rep: "Deepak", lam: "None", fab: "MS frame + tie-up", install: true },
  { id: "GP-2445", client: "Sharma Tent House", area: "Kidwai Nagar", item: "Wedding stage backdrop 24×10 ft", media: "Canvas 380 gsm", w: 24, h: 10, qty: 1, machine: "ES-2", stage: "Proof", due: "Fri", dueIn: 74, amount: 21600, rep: "Deepak", lam: "None", fab: "Pipe pockets", install: false },
  { id: "GP-2446", client: "Banarsi Chai Bar", area: "Rawatpur", item: "Menu boards 3×2 ft", media: "Sunboard 5 mm UV", w: 3, h: 2, qty: 4, machine: "UV-3", stage: "Proof", due: "Fri", dueIn: 72, amount: 5400, rep: "Ritu", lam: "None", fab: "Wall mount", install: true },
  { id: "GP-2447", client: "Rangoli Paints", area: "Shastri Nagar", item: "Dealer boards 12×4 ft, 6 shops", media: "Star flex 440 gsm", w: 12, h: 4, qty: 6, machine: "FX-1", stage: "Artwork", due: "Mon", dueIn: 145, amount: 31200, rep: "Saurabh", lam: "None", fab: "MS frame", install: true },
  { id: "GP-2448", client: "Nagar Nigam Kanpur", area: "Zone 3", item: "Swachhta campaign banners 10×4 ft", media: "Normal flex 280 gsm", w: 10, h: 4, qty: 30, machine: "FX-1", stage: "Artwork", due: "Sat", dueIn: 100, amount: 18000, rep: "Saurabh", lam: "None", fab: "Eyelets + rope", install: true },
  { id: "GP-2449", client: "Saraswati Vidya Mandir", area: "Barra", item: "Annual day stage panels 8×4 ft", media: "Sunboard 5 mm UV", w: 8, h: 4, qty: 6, machine: "UV-3", stage: "Artwork", due: "Next Tue", dueIn: 170, amount: 17280, rep: "Ritu", lam: "None", fab: "Wooden easel", install: false },
  { id: "GP-2414", client: "Kanpur Royals T20 League", area: "Green Park", item: "Team van one-way vision wrap", media: "One-way vision 140 mic", w: 14, h: 5, qty: 2, machine: "ES-2", stage: "Lamination", due: "Today 4 PM", dueIn: 5, amount: 15400, rep: "Deepak", lam: "Gloss", fab: "Contour cut", install: true },
  { id: "GP-2423", client: "Pukhraj Jewellers", area: "Mall Road", item: "Counter danglers, A3", media: "Art card 300 gsm 13×19", w: 1, h: 1, qty: 400, machine: "DO-4", stage: "Lamination", due: "Wed", dueIn: 26, amount: 6400, rep: "Ritu", lam: "Gloss", fab: "Die-cut + thread", install: false },
  { id: "GP-2419", client: "Ojas Coaching", area: "Rawatpur crossing", item: "Rooftop hoarding 30×15 ft", media: "Star flex 440 gsm", w: 30, h: 15, qty: 1, machine: "FX-1", stage: "Fabrication", due: "Wed 11 AM", dueIn: 24, amount: 46500, rep: "Deepak", lam: "None", fab: "MS angle frame 40 ft", install: true },
  { id: "GP-2427", client: "Saraswati Vidya Mandir", area: "Barra", item: "Gate arch flex 18×9 ft", media: "Star flex 440 gsm", w: 18, h: 9, qty: 1, machine: "FX-1", stage: "Fabrication", due: "Thu", dueIn: 48, amount: 14600, rep: "Ritu", lam: "None", fab: "Bamboo arch tie-up", install: true },
  { id: "GP-2417", client: "Shree Balaji Motors", area: "Kalyanpur", item: "Showroom ACP fascia 40×4 ft", media: "ACP 3 mm UV direct", w: 40, h: 4, qty: 1, machine: "UV-3", stage: "Install", due: "Today 3 PM", dueIn: 4, amount: 142000, rep: "Saurabh", lam: "None", fab: "ACP + channel letters", install: true },
  { id: "GP-2412", client: "Hotel Ganges View", area: "Civil Lines", item: "Lobby wallpaper 22×10 ft", media: "Textured wallpaper", w: 22, h: 10, qty: 1, machine: "ES-2", stage: "Install", due: "Today 6 PM", dueIn: 7, amount: 24200, rep: "Saurabh", lam: "Matte", fab: "Trim", install: true },
  { id: "GP-2410", client: "Agarwal Sweets", area: "Swaroop Nagar", item: "Counter backlit panels", media: "Backlit flex 510 gsm", w: 6, h: 3, qty: 4, machine: "FX-1", stage: "Done", due: "Delivered Mon", dueIn: 0, amount: 11800, rep: "Deepak", lam: "None", fab: "Backlit box", install: true },
];

function sizeOf(j: Job) {
  return j.machine === "DO-4" ? j.qty : Math.round(j.w * j.h * j.qty);
}
const unitOf = (m: MachineId) => (m === "DO-4" ? "sheets" : "sq ft");

type Machine = {
  id: MachineId;
  name: string;
  model: string;
  speed: number;
  status: "Printing" | "Paused" | "Head clean";
  job: string | null;
  done: number;
  queue: string[];
  ink: [number, number, number, number];
  today: number;
  operator: string;
};

const seedMachines: Machine[] = [
  { id: "FX-1", name: "Flex solvent 10 ft", model: "8 × Konica 512i heads · 720 dpi", speed: 650, status: "Printing", job: "GP-2431", done: 512, queue: ["GP-2433", "GP-2436"], ink: [64, 41, 72, 55], today: 2184, operator: "Imran" },
  { id: "ES-2", name: "Eco-solvent 5 ft", model: "2 × i3200 heads · 1440 dpi", speed: 140, status: "Printing", job: "GP-2428", done: 88, queue: ["GP-2438"], ink: [38, 52, 17, 61], today: 342, operator: "Vikas" },
  { id: "UV-3", name: "UV flatbed 8×4", model: "Gen5 heads · CMYK + white + varnish", speed: 220, status: "Printing", job: "GP-2425", done: 61, queue: ["GP-2440"], ink: [77, 70, 66, 48], today: 268, operator: "Vikas" },
  { id: "DO-4", name: "Digital offset", model: "13×19 in production press · 300 gsm", speed: 2400, status: "Printing", job: "GP-2421", done: 860, queue: ["GP-2442"], ink: [58, 46, 51, 22], today: 3120, operator: "Anil" },
];

const SPEEDUP = 12;
function tick(ms: Machine[], sizes: Record<string, number>) {
  const finished: { job: string; machine: MachineId }[] = [];
  const next = ms.map((m) => {
    if (m.status !== "Printing" || !m.job) return m;
    const inc = (m.speed * SPEEDUP) / 3600;
    const size = sizes[m.job] ?? 100;
    const burn = m.id === "DO-4" ? inc * 0.0006 : inc * 0.012;
    const ink = m.ink.map((v, i) => Math.max(2, v - burn * [1, 1.15, 0.8, 0.6][i])) as Machine["ink"];
    const done = m.done + inc;
    if (done >= size) {
      finished.push({ job: m.job, machine: m.id });
      const [head, ...rest] = m.queue;
      return { ...m, ink, today: m.today + inc, job: head ?? null, done: 0, queue: rest };
    }
    return { ...m, ink, done, today: m.today + inc };
  });
  return { next, finished };
}

const mediaRates: Record<string, { rate: number; machine: MachineId }> = {
  "Star flex 440 gsm": { rate: 18, machine: "FX-1" },
  "Normal flex 280 gsm": { rate: 12, machine: "FX-1" },
  "Backlit flex 510 gsm": { rate: 32, machine: "FX-1" },
  "Gloss vinyl 100 mic": { rate: 45, machine: "ES-2" },
  "One-way vision 140 mic": { rate: 55, machine: "ES-2" },
  "Canvas 380 gsm": { rate: 60, machine: "ES-2" },
  "Sunboard 5 mm UV": { rate: 95, machine: "UV-3" },
  "Art card 300 gsm 13×19": { rate: 14, machine: "DO-4" },
};

type Proof = {
  job: string;
  version: number;
  status: "Awaiting" | "Changes asked" | "Approved";
  contact: string;
  phone: string;
  sent: string;
  waiting: number;
  art: { bg: string; title: string; sub: string; ink: string; tag: string };
  thread: { from: "us" | "them"; text: string; time: string }[];
};

const seedProofs: Proof[] = [
  {
    job: "GP-2444", version: 2, status: "Awaiting", contact: "Rakesh Bajrang", phone: "+91 98390 11427", sent: "11:05 AM", waiting: 3.2,
    art: { bg: "linear-gradient(135deg,#0b3d91,#1565c0 55%,#f9a825)", title: "BAJRANG STEEL TRADERS", sub: "TMT · Angle · Channel · Sheets   |   Fazalganj, Kanpur   |   98390 11427", ink: "#ffffff", tag: "20×5 ft star flex" },
    thread: [
      { from: "them", text: "Bhaiya naam thoda bada karo, aur Jai Bajrangbali upar likhna hai", time: "Mon 6:12 PM" },
      { from: "us", text: "Ji, v2 bhej rahe hain. Naam 30% bada, top par Jai Bajrangbali.", time: "11:05 AM" },
      { from: "us", text: "[Proof v2 · 20×5 ft · 1 page]", time: "11:05 AM" },
    ],
  },
  {
    job: "GP-2445", version: 1, status: "Awaiting", contact: "Mukesh Sharma", phone: "+91 94150 33816", sent: "9:40 AM", waiting: 4.6,
    art: { bg: "radial-gradient(circle at 50% 40%,#f8d77a,#c2185b 60%,#4a0e2e)", title: "Shubh Vivah", sub: "Anjali  weds  Rohit   ·   22 November   ·   Moti Mahal Lawn", ink: "#fff6dc", tag: "24×10 ft canvas" },
    thread: [
      { from: "them", text: "Backdrop mein phool wala design chahiye, maroon aur gold", time: "Sat 4:30 PM" },
      { from: "us", text: "[Proof v1 · 24×10 ft canvas]", time: "9:40 AM" },
    ],
  },
  {
    job: "GP-2446", version: 3, status: "Changes asked", contact: "Ankit Banarsi", phone: "+91 70078 24519", sent: "Yesterday", waiting: 20,
    art: { bg: "linear-gradient(160deg,#3e2723,#6d4c41 60%,#a1887f)", title: "BANARSI CHAI BAR", sub: "Kulhad chai ₹20 · Masala ₹25 · Bun maska ₹30 · Samosa ₹15", ink: "#ffe0b2", tag: "3×2 ft sunboard ×4" },
    thread: [
      { from: "us", text: "[Proof v3 · menu boards]", time: "Mon 5:10 PM" },
      { from: "them", text: "Rate badal gaye, masala chai ab ₹30. Aur Maggi add karo ₹50", time: "Mon 8:44 PM" },
    ],
  },
  {
    job: "GP-2447", version: 1, status: "Awaiting", contact: "Sandeep Rangoli", phone: "+91 99355 60271", sent: "12:20 PM", waiting: 1.1,
    art: { bg: "linear-gradient(90deg,#d32f2f,#f57c00 30%,#fbc02d 55%,#388e3c 78%,#1976d2)", title: "RANGOLI PAINTS", sub: "Authorised dealer · Emulsion · Enamel · Putty · Shastri Nagar", ink: "#ffffff", tag: "12×4 ft ×6 dealers" },
    thread: [{ from: "us", text: "[Proof v1 · dealer board master]", time: "12:20 PM" }],
  },
  {
    job: "GP-2448", version: 2, status: "Awaiting", contact: "Er. P. K. Dwivedi (Zone 3)", phone: "+91 94153 70045", sent: "10:15 AM", waiting: 4.0,
    art: { bg: "linear-gradient(180deg,#e8f5e9,#a5d6a7 60%,#2e7d32)", title: "स्वच्छ कानपुर, स्वस्थ कानपुर", sub: "Geela kachra hara dabba · Sookha kachra neela dabba · Nagar Nigam Kanpur", ink: "#0d3b12", tag: "10×4 ft ×30" },
    thread: [
      { from: "them", text: "Logo approved wala lagana, aur helpline 1533 likhna", time: "Mon 2:05 PM" },
      { from: "us", text: "[Proof v2 · with helpline 1533]", time: "10:15 AM" },
    ],
  },
  {
    job: "GP-2449", version: 1, status: "Awaiting", contact: "Principal, SVM Barra", phone: "+91 90443 18820", sent: "1:05 PM", waiting: 0.4,
    art: { bg: "linear-gradient(135deg,#1a237e,#3949ab 60%,#ffca28)", title: "Varshik Utsav 2026", sub: "Saraswati Vidya Mandir, Barra-2 · 14 November · Chief guest DM Kanpur Nagar", ink: "#fffde7", tag: "8×4 ft ×6 panels" },
    thread: [{ from: "us", text: "[Proof v1 · stage panels]", time: "1:05 PM" }],
  },
  {
    job: "GP-2428", version: 2, status: "Approved", contact: "Neeraj Pukhraj", phone: "+91 98391 44102", sent: "Mon", waiting: 0,
    art: { bg: "linear-gradient(135deg,#4a148c,#7b1fa2 50%,#ffd54f)", title: "Dhanteras Dhamaka", sub: "Making charges flat 40% off · Pukhraj Jewellers · Mall Road", ink: "#fff8e1", tag: "6×8 ft vinyl ×3" },
    thread: [
      { from: "us", text: "[Proof v2 · window vinyl]", time: "Mon 11:30 AM" },
      { from: "them", text: "Perfect. Print kar do, Wednesday tak lag jana chahiye", time: "Mon 12:02 PM" },
    ],
  },
];

type Roll = { sku: string; name: string; width: string; onHand: number; burn: number; reorderAt: number; supplier: string; rate: number; unit: string; lot: string };
const seedRolls: Roll[] = [
  { sku: "FLX-S10", name: "Star flex 440 gsm", width: "10 ft", onHand: 3200, burn: 1450, reorderAt: 4000, supplier: "Arihant Flex House, Naya Ganj", rate: 9.2, unit: "sq ft", lot: "Lot 8812, 2 rolls" },
  { sku: "FLX-N10", name: "Normal flex 280 gsm", width: "10 ft", onHand: 6800, burn: 900, reorderAt: 3000, supplier: "Arihant Flex House, Naya Ganj", rate: 5.6, unit: "sq ft", lot: "Lot 8790, 4 rolls" },
  { sku: "FLX-B10", name: "Backlit flex 510 gsm", width: "10 ft", onHand: 980, burn: 160, reorderAt: 800, supplier: "Delhi Sign Mart, Chawri Bazar", rate: 16.5, unit: "sq ft", lot: "Lot 2231, 1 roll" },
  { sku: "VNL-G5", name: "Gloss vinyl 100 mic", width: "5 ft", onHand: 640, burn: 210, reorderAt: 900, supplier: "Lucknow Media House, Aminabad", rate: 21, unit: "sq ft", lot: "Lot V-114" },
  { sku: "VNL-M5", name: "Matte vinyl 100 mic", width: "5 ft", onHand: 1150, burn: 130, reorderAt: 700, supplier: "Lucknow Media House, Aminabad", rate: 22, unit: "sq ft", lot: "Lot V-118" },
  { sku: "OWV-5", name: "One-way vision 140 mic", width: "4.5 ft", onHand: 270, burn: 70, reorderAt: 400, supplier: "Delhi Sign Mart, Chawri Bazar", rate: 29, unit: "sq ft", lot: "Lot OW-61" },
  { sku: "CNV-5", name: "Canvas 380 gsm", width: "5 ft", onHand: 820, burn: 60, reorderAt: 300, supplier: "Lucknow Media House, Aminabad", rate: 31, unit: "sq ft", lot: "Lot C-09" },
  { sku: "SNB-5", name: "Sunboard 5 mm, 8×4 sheets", width: "8×4", onHand: 46, burn: 9, reorderAt: 30, supplier: "Gupta Boards, Collectorganj", rate: 640, unit: "sheets", lot: "46 sheets" },
  { sku: "ACP-3", name: "ACP 3 mm, 8×4 sheets", width: "8×4", onHand: 14, burn: 3, reorderAt: 12, supplier: "Gupta Boards, Collectorganj", rate: 2350, unit: "sheets", lot: "14 sheets, silver + white" },
  { sku: "LAM-G", name: "Gloss lamination film", width: "54 in", onHand: 1900, burn: 240, reorderAt: 1200, supplier: "Lucknow Media House, Aminabad", rate: 6.8, unit: "sq ft", lot: "Roll 2 of 3" },
  { sku: "ART-300", name: "Art card 300 gsm, 13×19", width: "13×19", onHand: 2600, burn: 1700, reorderAt: 3000, supplier: "Jain Paper Mart, Generalganj", rate: 7.4, unit: "sheets", lot: "5 reams" },
  { sku: "INK-SOL", name: "Solvent ink set, 5 L × CMYK", width: "4 colours", onHand: 26, burn: 3.4, reorderAt: 20, supplier: "Delhi Sign Mart, Chawri Bazar", rate: 1650, unit: "litres", lot: "M low: 4 L left" },
];

type Install = { id: string; job: string; client: string; site: string; crew: "Crew A · Raju" | "Crew B · Salim" | "Crew C · hired"; day: number; start: number; hours: number; height: string; access: string; permit: "Approved" | "Applied" | "Not needed" | "Pending"; status: "Scheduled" | "On site" | "Done" | "Blocked" };
const seedInstalls: Install[] = [
  { id: "IN-301", job: "GP-2417", client: "Shree Balaji Motors", site: "GT Road, Kalyanpur", crew: "Crew A · Raju", day: 0, start: 10, hours: 6, height: "18 ft", access: "Scaffold, 2 levels", permit: "Not needed", status: "On site" },
  { id: "IN-302", job: "GP-2412", client: "Hotel Ganges View", site: "Civil Lines, lobby", crew: "Crew B · Salim", day: 0, start: 14, hours: 4, height: "10 ft", access: "A-ladder", permit: "Not needed", status: "Scheduled" },
  { id: "IN-303", job: "GP-2414", client: "Kanpur Royals T20 League", site: "Green Park parking", crew: "Crew B · Salim", day: 0, start: 17, hours: 2.5, height: "Van", access: "Ground", permit: "Not needed", status: "Scheduled" },
  { id: "IN-304", job: "GP-2419", client: "Ojas Coaching", site: "Rawatpur crossing, rooftop", crew: "Crew C · hired", day: 1, start: 7, hours: 7, height: "42 ft", access: "Crane 1 hr + rope", permit: "Applied", status: "Blocked" },
  { id: "IN-305", job: "GP-2431", client: "Agarwal Sweets", site: "Swaroop Nagar main road", crew: "Crew A · Raju", day: 1, start: 9, hours: 3, height: "22 ft", access: "Ladder + rope", permit: "Approved", status: "Scheduled" },
  { id: "IN-306", job: "GP-2428", client: "Pukhraj Jewellers", site: "Mall Road showroom", crew: "Crew B · Salim", day: 1, start: 8, hours: 2, height: "Ground", access: "Before shop opens", permit: "Not needed", status: "Scheduled" },
  { id: "IN-307", job: "GP-2425", client: "Ujala Eye Hospital", site: "Swaroop Nagar, 3 floors", crew: "Crew B · Salim", day: 2, start: 10, hours: 6, height: "Indoor", access: "Drill + stand-offs", permit: "Not needed", status: "Scheduled" },
  { id: "IN-308", job: "GP-2427", client: "Saraswati Vidya Mandir", site: "Barra-2 school gate", crew: "Crew A · Raju", day: 2, start: 8, hours: 4, height: "14 ft", access: "Bamboo arch", permit: "Not needed", status: "Scheduled" },
  { id: "IN-309", job: "GP-2436", client: "Shree Balaji Motors", site: "Kalyanpur service centre", crew: "Crew A · Raju", day: 3, start: 11, hours: 3, height: "12 ft", access: "Ladder", permit: "Not needed", status: "Scheduled" },
  { id: "IN-310", job: "GP-2448", client: "Nagar Nigam Kanpur", site: "Zone 3, 30 poles", crew: "Crew C · hired", day: 4, start: 7, hours: 9, height: "Pole 15 ft", access: "Tata Ace + ladder", permit: "Pending", status: "Scheduled" },
  { id: "IN-311", job: "GP-2440", client: "Hotel Ganges View", site: "Civil Lines, front elevation", crew: "Crew A · Raju", day: 5, start: 9, hours: 8, height: "26 ft", access: "Scaffold + electrician", permit: "Applied", status: "Scheduled" },
];

type Invoice = { no: string; client: string; for: string; amount: number; raised: string; days: number; terms: string; promise?: string };
const invoices: Invoice[] = [
  { no: "GP/25-26/0388", client: "Shree Balaji Motors", for: "Showroom fascia, 50% advance balance", amount: 71000, raised: "6 Oct", days: 14, terms: "On install" },
  { no: "GP/25-26/0342", client: "Kanpur Royals T20 League", for: "Season 2 branding, ground + jerseys", amount: 184500, raised: "2 Sep", days: 48, terms: "30 days", promise: "After sponsor money, 28 Oct" },
  { no: "GP/25-26/0301", client: "Nagar Nigam Kanpur", for: "Hoarding repair, Zone 3", amount: 236800, raised: "4 Aug", days: 77, terms: "Govt, bill passing" },
  { no: "GP/25-26/0355", client: "Ojas Coaching", for: "Admission banners, July batch", amount: 62400, raised: "11 Sep", days: 39, terms: "30 days", promise: "UPI Friday" },
  { no: "GP/25-26/0279", client: "Rama Dental College", for: "Convocation stage + standees", amount: 48300, raised: "18 Jul", days: 94, terms: "45 days" },
  { no: "GP/25-26/0371", client: "Agarwal Sweets", for: "Raksha Bandhan counter branding", amount: 22900, raised: "22 Sep", days: 28, terms: "15 days" },
  { no: "GP/25-26/0362", client: "Mahavir Agency", for: "Catalogue print, 2,000 copies", amount: 54600, raised: "16 Sep", days: 34, terms: "30 days" },
  { no: "GP/25-26/0318", client: "Hotel Ganges View", for: "Room signage set", amount: 38200, raised: "20 Aug", days: 61, terms: "45 days", promise: "Cheque on 25 Oct" },
  { no: "GP/25-26/0260", client: "Sharma Tent House", for: "Wedding season backdrops ×6", amount: 41500, raised: "1 Jul", days: 111, terms: "30 days" },
  { no: "GP/25-26/0379", client: "Pukhraj Jewellers", for: "Navratri window vinyl", amount: 27650, raised: "30 Sep", days: 20, terms: "15 days" },
  { no: "GP/25-26/0333", client: "Ujala Eye Hospital", for: "OPD flex + standees", amount: 33900, raised: "28 Aug", days: 53, terms: "45 days" },
];

const team: TeamMember[] = [
  { name: "Saurabh Tandon", role: "Owner", status: "Busy", load: 92, focus: "Ojas rooftop crane permit and Balaji fascia sign-off at 3", tasks: [{ title: "Call KDA about Rawatpur permit", due: "11:00" }, { title: "Approve Arihant flex PO", due: "12:00" }, { title: "Balaji fascia handover", due: "3:00" }], week: [1, 1, 1, 1, 1, 1], since: "2009" },
  { name: "Imran Qureshi", role: "Press head, flex solvent", status: "On floor", load: 86, focus: "Agarwal hoarding on FX-1, then Royals boundary banners", tasks: [{ title: "Head nozzle check FX-1", due: "9:30", done: true }, { title: "Print GP-2431 hoarding", due: "1:00" }, { title: "Magenta refill FX-1", due: "2:00" }], week: [1, 1, 1, 1, 1, 1], since: "2012" },
  { name: "Vikas Pal", role: "Operator, eco-solvent + UV", status: "On floor", load: 78, focus: "Pukhraj vinyl on ES-2, Ujala signs on UV-3", tasks: [{ title: "Yellow cartridge ES-2", due: "now" }, { title: "UV white test for ACP", due: "4:00" }], week: [1, 1, 1, 0, 1, 1], since: "2019" },
  { name: "Pankaj Yadav", role: "Designer, CorelDRAW", status: "Busy", load: 90, focus: "Rangoli dealer master and 6 shop variations", tasks: [{ title: "Banarsi menu v4 with new rates", due: "12:30" }, { title: "Rangoli 6 dealer names", due: "5:00" }, { title: "Nigam banner Hindi proof", due: "done", done: true }], week: [1, 1, 1, 1, 1, 1], since: "2016" },
  { name: "Ritu Srivastava", role: "Designer + proofs desk", status: "On floor", load: 72, focus: "Chasing 5 proofs on WhatsApp", tasks: [{ title: "Follow up Sharma Tent House", due: "11:30" }, { title: "SVM stage panel proof", due: "1:00", done: true }], week: [1, 1, 1, 1, 1, 0], since: "2021" },
  { name: "Raju Kashyap", role: "Install crew A lead", status: "In field", load: 84, focus: "On scaffold at Balaji Motors, Kalyanpur", tasks: [{ title: "Fascia panels 1–6", due: "1:00" }, { title: "Channel letters wiring", due: "3:00" }, { title: "Site photos to group", due: "4:00" }], week: [1, 1, 1, 1, 1, 1], since: "2014" },
  { name: "Salim Ansari", role: "Fabrication + crew B", status: "On floor", load: 81, focus: "Welding 40 ft MS frame for Ojas rooftop", tasks: [{ title: "Ojas frame weld + paint", due: "5:00" }, { title: "Hotel lobby wallpaper", due: "2:00" }], week: [1, 1, 1, 1, 0, 1], since: "2015" },
  { name: "Deepak Shukla", role: "Sales, field", status: "In field", load: 66, focus: "Measuring 6 Rangoli dealer shops in Shastri Nagar", tasks: [{ title: "Site measure 6 shops", due: "2:00" }, { title: "Kanpur Royals dues follow-up", due: "5:00" }], week: [1, 1, 0, 1, 1, 1], since: "2020" },
];

const agents: WorkforceAgent[] = [
  { name: "Proof Chaser", role: "Sends proofs on WhatsApp and nudges until someone says yes", icon: MessageCircle, status: "Needs you", runsToday: 18, hoursSaved: 5.5, accuracy: 94, last: "3 min ago", skills: ["WhatsApp", "Proof versions", "Hinglish replies"], schedule: "Every 45 min, 9 AM – 9 PM", inbox: [{ title: "Sharma Tent House silent for 4.6 h", detail: "Backdrop prints Friday; if no reply by 3 PM the press slot moves to Saturday. Call Mukesh ji?" }], log: ["Nudged Bajrang Steel on v2", "Logged Banarsi rate change, v4 to Pankaj", "Pukhraj approved v2, job sent to ES-2"] },
  { name: "Press Scheduler", role: "Orders the queue on four machines by due time and media", icon: Printer, status: "Running", runsToday: 26, hoursSaved: 4, accuracy: 91, last: "just now", skills: ["Queue", "Media changes", "Rush flags"], schedule: "On every job or machine change", log: ["Grouped two star-flex jobs to skip a roll change", "Moved Royals banners after Agarwal hoarding", "Flagged ES-2 yellow at 17%"] },
  { name: "Media Watcher", role: "Tracks every roll and sheet against booked jobs", icon: Package, status: "Needs you", runsToday: 7, hoursSaved: 2.5, accuracy: 89, last: "22 min ago", skills: ["Roll tracking", "Supplier rates", "Tally PO"], schedule: "After every print", inbox: [{ title: "Star flex covers 2.2 days", detail: "Rangoli + Nigam jobs need 2,400 sq ft next week. Arihant quoted ₹9.20, 3 rolls = ₹64,500." }], log: ["Gloss vinyl below reorder", "Compared Arihant vs Delhi Sign Mart flex rates", "Matched ACP sheets to Hotel Ganges job"] },
  { name: "Install Planner", role: "Books crews, permits, cranes and site photos", icon: HardHat, status: "Needs you", runsToday: 5, hoursSaved: 3, accuracy: 87, last: "1 h ago", skills: ["Crew calendar", "KDA permits", "Weather"], schedule: "Daily 7 AM + on change", inbox: [{ title: "Ojas rooftop blocked on KDA permit", detail: "Applied 9 Oct. Crane is booked tomorrow 7 AM for ₹6,500. Hold the crane or push to Friday?" }], log: ["Clubbed Pukhraj + Hotel installs for crew B", "Sent site checklist to Raju", "Weather clear for rooftop work till Sat"] },
  { name: "Dues Collector", role: "Polite WhatsApp follow-ups, with the invoice and UPI QR", icon: IndianRupee, status: "Running", runsToday: 4, hoursSaved: 4.5, accuracy: 92, last: "2 h ago", skills: ["Tally ageing", "WhatsApp", "UPI QR"], schedule: "Daily 5 PM", log: ["Logged Hotel Ganges promise: cheque 25 Oct", "Escalated Sharma Tent House, 111 days", "Queued 7 reminders for 5 PM"] },
  { name: "Quote Writer", role: "Turns enquiries into priced quotes in minutes", icon: Receipt, status: "Idle", runsToday: 9, hoursSaved: 3.5, accuracy: 90, last: "40 min ago", skills: ["Rate card", "GST", "Site photos"], schedule: "On every new enquiry", log: ["Quoted Rangoli 6 dealer boards ₹31,200", "Revised Royals rate with 6% volume discount", "Sent Banarsi menu quote with UV print"] },
];

const independence: IndependenceData = {
  score: 41,
  history: [26, 29, 31, 33, 36, 38, 41],
  quote: "Customers call me for the rate even when Deepak is standing in their shop. Ten years of habit.",
  pillars: [
    { name: "Sales & quotes", score: 44, note: "Rates live in Saurabh's head and an old Excel. Deepak calls him for every quote over ₹20k.", fixes: [{ title: "Rate card in Quote Writer", gain: 4 }, { title: "Deepak approves under ₹25k", gain: 2 }] },
    { name: "Proofs & design", score: 52, note: "Ritu chases proofs, but final OK still goes through the owner for big clients.", fixes: [{ title: "Client approves on WhatsApp link", gain: 3 }] },
    { name: "Press & production", score: 58, note: "Imran runs the press well. Queue order is decided on a whiteboard.", fixes: [{ title: "Press Scheduler orders queue", gain: 3 }, { title: "Ink refill log", gain: 1 }] },
    { name: "Purchase & media", score: 30, note: "Every roll is ordered by Saurabh on a phone call. Two stock-outs last month.", fixes: [{ title: "Auto PO under ₹40k", gain: 4 }, { title: "Two approved suppliers per media", gain: 2 }] },
    { name: "Installs & permits", score: 33, note: "KDA and Nagar Nigam permits need the owner to go in person.", fixes: [{ title: "Permit file per site", gain: 2 }, { title: "Agent for permit follow-ups", gain: 2 }] },
    { name: "Money & dues", score: 29, note: "₹8.2 L outstanding. Govt bills wait 70+ days, nobody owns the follow-up.", fixes: [{ title: "Daily dues agent", gain: 3 }, { title: "50% advance rule", gain: 3 }] },
    { name: "Owner time", score: 37, note: "Saurabh spends 16 hours a week on quotes and calls.", fixes: [{ title: "Two call windows a day", gain: 2 }] },
  ],
  ownerHours: [
    { label: "Quotes", hours: 9 },
    { label: "Client calls", hours: 7 },
    { label: "Media orders", hours: 4 },
    { label: "Permits", hours: 5 },
    { label: "Site visits", hours: 6 },
    { label: "Dues", hours: 4 },
    { label: "Strategy", hours: 1 },
  ],
};

const integrations: Integration[] = [
  { name: "Tally Prime", category: "Accounts", status: "Connected", detail: "Sales bills with 18% GST, purchase, party ledgers.", synced: "4 min ago", records: "6,420 vouchers", mark: "T", color: "#1c4f9c" },
  { name: "WhatsApp Business", category: "Messaging", status: "Connected", detail: "Proof sharing, client groups, crew site photos.", synced: "just now", records: "3,980 chats", mark: "W", color: "#1f9d55" },
  { name: "RIP server", category: "Production", status: "Syncing", detail: "Print logs, sq ft and ink per job from 4 machines.", synced: "live", records: "142 jobs this week", mark: "RIP", color: "#22b8f0" },
  { name: "Design drive", category: "Artwork", status: "Connected", detail: "CorelDRAW and PDF artwork folders, one per job card.", synced: "8 min ago", records: "11,200 files", mark: "CD", color: "#ec2f8f" },
  { name: "Google Business Profile", category: "Marketing", status: "Connected", detail: "Reviews and enquiries from 'flex printing near me'.", synced: "1 h ago", records: "312 reviews · 4.6", mark: "G", color: "#ea4335" },
  { name: "Razorpay UPI", category: "Payments", status: "Connected", detail: "UPI QR on every invoice and advance link.", synced: "20 min ago", records: "₹3.1 L this month", mark: "R", color: "#2563eb" },
  { name: "Nagar Nigam e-permit", category: "Permits", status: "Error", detail: "Portal session expired. Zone 3 permit status not refreshing.", synced: "3 days ago", records: "—", mark: "NN", color: "#f7d21e" },
  { name: "Porter", category: "Logistics", status: "Available", detail: "Book a Tata Ace for deliveries with live tracking.", synced: "—", records: "—", mark: "P", color: "#7c3aed" },
  { name: "Biometric attendance", category: "People", status: "Connected", detail: "Press, fabrication and crew punches.", synced: "9:08 AM", records: "19 punches", mark: "B", color: "#c0473a" },
];

/* ============================================================
   Config
   ============================================================ */

const config: DeskConfig = {
  slug: "print-shop",
  company: "Ganga Printworks",
  brand: "Ganga",
  city: "Kanpur",
  state: "UP",
  icon: Printer,
  tagline: "Flex, vinyl, UV and digital print · fabrication bay · 2 install crews · 19 people",
  owner: { name: "Saurabh Tandon", first: "Saurabh", initials: "ST", role: "Owner" },
  theme: {
    variant: "control",
    paper: "#07090c",
    panel: "#0e1217",
    sunk: "#161c23",
    ink: "#e7edf3",
    mute: "#8996a4",
    line: "#232c37",
    accent: "#22b8f0",
    accentInk: "#04121a",
    soft: "#0b2532",
    ok: "#34d399",
    warn: "#f7d21e",
    late: "#ff5470",
    info: "#ec4fa6",
    heading: "display",
  },
  pulse: [
    { label: "Sq ft printed today", value: "2,794", delta: "+14%", trend: [1600, 1900, 2100, 2350, 2500, 2680, 2794], module: "press" },
    { label: "Jobs due today", value: "7", delta: "2 rush", good: false, trend: [4, 5, 6, 6, 7, 7, 7], tone: "warn", module: "jobs" },
    { label: "Proofs awaiting", value: "5", delta: "-2", good: true, trend: [9, 8, 8, 7, 7, 6, 5], tone: "info", module: "proofs" },
    { label: "Star flex cover", value: "2.2 d", delta: "-1.4 d", good: false, trend: [6, 5.4, 4.8, 4.1, 3.5, 2.9, 2.2], tone: "late", module: "media" },
    { label: "Dues", value: "₹8.2 L", delta: "-4%", good: true, trend: [9.4, 9.1, 8.9, 8.8, 8.6, 8.4, 8.2], tone: "warn", module: "dues" },
  ],
  agenda: [
    { at: 9, title: "Press huddle", detail: "4 machines, 2 rush jobs, ES-2 yellow low", tone: "accent", module: "press" },
    { at: 11, title: "Proof follow-ups", detail: "5 proofs waiting, Sharma Tent House 4.6 h", count: 5, tone: "info", module: "proofs" },
    { at: 12, title: "Media PO window", detail: "Star flex + gloss vinyl, ₹86,300", count: 2, tone: "warn", module: "media" },
    { at: 15, title: "Balaji fascia handover", detail: "Crew A on scaffold since 10 AM", tone: "ok", module: "installs" },
    { at: 17, title: "Dues reminders", detail: "7 parties, ₹8.2 L total", count: 7, tone: "late", module: "dues" },
    { at: 19, title: "Day close", detail: "Sq ft, ink, tomorrow's crane", tone: "neutral", module: "jobs" },
  ],
  activity: [
    { time: "11:42 AM", text: "Pukhraj Jewellers approved window vinyl v2 on WhatsApp", tone: "ok" },
    { time: "11:20 AM", text: "Press Scheduler grouped two star-flex jobs on FX-1, one roll change saved", tone: "info" },
    { time: "10:58 AM", text: "ES-2 yellow at 17%, cartridge pulled from store", tone: "warn" },
    { time: "10:31 AM", text: "Crew A reached Balaji Motors, scaffold up", tone: "info" },
    { time: "10:05 AM", text: "KDA permit for Rawatpur rooftop still 'under review'", tone: "late" },
    { time: "9:12 AM", text: "Attendance closed: 18 of 19 in, Vikas on half day tomorrow", tone: "neutral" },
  ],
  asks: [
    { q: "What prints today and will we make it?", a: "7 jobs are due today, 2 marked rush.\n\n• FX-1: Agarwal Sweets hoarding (800 sq ft) finishes around 1:15 PM, then Royals banners.\n• ES-2: Pukhraj vinyl done by 12:40, lamination by 2.\n• DO-4: Mahavir brochures, 640 sheets left, about 20 minutes.\n\nThe risk is ES-2 yellow at 17%. Swap the cartridge before Ojas standees or they will band.", sources: ["RIP server", "Press queue", "Job cards"] },
    { q: "Which proofs are stuck?", a: "5 proofs are waiting.\n\n• Sharma Tent House backdrop: 4.6 h, no reply. Prints Friday.\n• Nagar Nigam Zone 3 banners: 4 h, needs the engineer's OK.\n• Bajrang Steel shop board: v2, 3.2 h.\n• Banarsi Chai Bar asked for new rates; Pankaj is on v4.\n\nCalling Mukesh Sharma now protects Friday's press slot.", sources: ["WhatsApp", "Proof versions"] },
    { q: "Do we have enough star flex for next week?", a: "No. 3,200 sq ft on hand against 1,450 a day, about 2.2 days. Rangoli dealer boards and the Nigam banners alone need 2,400 sq ft.\n\nArihant Flex quoted ₹9.20 per sq ft for 3 rolls (₹64,500), delivery tomorrow by 11. Delhi Sign Mart is ₹8.90 but takes 3 days.", sources: ["Media stock", "Supplier quotes"] },
    { q: "Is tomorrow's rooftop install on?", a: "Not yet. The Ojas rooftop at Rawatpur crossing needs the KDA hoarding permit, applied on 9 Oct and still under review. The crane is booked for 7 AM (₹6,500, 1 hour minimum).\n\nOptions: call the KDA office before 1 PM, or move the crane to Friday at no charge if we tell them by 4 PM today.", sources: ["Installs", "Permit file"] },
    { q: "Who owes us the most?", a: "₹8.2 L outstanding across 11 bills.\n\n• Nagar Nigam: ₹2.37 L, 77 days, stuck at bill passing.\n• Kanpur Royals: ₹1.85 L, promised after sponsor money on 28 Oct.\n• Shree Balaji: ₹71,000 due on today's handover.\n• Sharma Tent House: ₹41,500 at 111 days, the oldest.\n\nCollect Balaji's balance at handover today; that alone clears 9%.", sources: ["Tally ledgers", "Dues agent"] },
    { q: "Draft a WhatsApp to Sharma Tent House", a: "Draft (not sent):\n\n\"Namaste Mukesh ji, Ganga Printworks se Ritu. Anjali–Rohit ji ke backdrop ka proof subah 9:40 par bheja tha. Friday ki printing ke liye aaj 3 baje tak OK chahiye. Koi badlav ho to bata dijiye, hum turant kar denge. Aur pichhla ₹41,500 bhi pending hai, QR saath mein bhej rahe hain. Dhanyavaad.\"", sources: ["Proof GP-2445", "Tally ledger"] },
  ],
  run: {
    label: "Runs every 30 minutes. You can also run it now.",
    title: "Press Planner",
    steps: [
      { text: "Read 22 job cards and 4 machine queues", result: "9 jobs on press, 2 rush, 7 due today" },
      { text: "Pull ink and sq ft from the RIP server", result: "ES-2 yellow 17%, DO-4 black 22%" },
      { text: "Check media against the next 5 days of jobs", result: "Star flex short 1,150 sq ft, gloss vinyl short 260" },
      { text: "Re-order queues by due time and media", result: "1 roll change saved on FX-1" },
      { text: "Check proofs and permits blocking print or install", result: "5 proofs waiting, 1 permit blocking a crane" },
    ],
    outcome: "Every job due today makes it if ES-2 gets a yellow cartridge before 1 PM. Star flex runs out Thursday unless the Arihant PO goes today. The rooftop install needs a KDA call before 1 PM or the crane moves to Friday.",
    actions: ["Swap ES-2 yellow now", "Approve Arihant flex PO ₹64,500", "Call KDA about Rawatpur", "Nudge Sharma Tent House"],
  },
};

/* ============================================================
   Desk
   ============================================================ */

const stageTone: Record<Stage, Tone> = { Artwork: "neutral", Proof: "info", Print: "accent", Lamination: "warn", Fabrication: "warn", Install: "ok", Done: "ok" };

function nextStage(j: Job): Stage {
  if (j.stage === "Done") return "Done";
  if (j.stage === "Print") return j.lam !== "None" ? "Lamination" : "Fabrication";
  if (j.stage === "Fabrication") return j.install ? "Install" : "Done";
  if (j.stage === "Install") return "Done";
  return STAGES[STAGES.indexOf(j.stage) + 1];
}

type Ops = {
  jobs: Job[];
  machines: Machine[];
  moveJob: (id: string, stage: Stage) => void;
  toggleRush: (id: string) => void;
  setMachines: (fn: (m: Machine[]) => Machine[]) => void;
  addJob: (j: Job) => void;
  openJob: (id: string) => void;
};

export default function PrintShopDesk() {
  const [jobs, setJobs] = React.useState(seedJobs);
  const [machines, setMachinesState] = React.useState(seedMachines);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const machinesRef = React.useRef(seedMachines);
  const jobsRef = React.useRef(seedJobs);

  React.useEffect(() => {
    jobsRef.current = jobs;
  }, [jobs]);

  const setMachines = React.useCallback((fn: (m: Machine[]) => Machine[]) => {
    const n = fn(machinesRef.current);
    machinesRef.current = n;
    setMachinesState(n);
  }, []);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      const sizes = Object.fromEntries(jobsRef.current.map((j) => [j.id, sizeOf(j)]));
      const { next, finished } = tick(machinesRef.current, sizes);
      machinesRef.current = next;
      setMachinesState(next);
      if (finished.length) {
        setJobs((cur) => cur.map((j) => (finished.some((f) => f.job === j.id) ? { ...j, stage: nextStage(j) } : j)));
        finished.forEach((f) => toast.success(`${f.job} off ${f.machine}`, { description: "Print complete, moved to finishing" }));
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const moveJob = React.useCallback(
    (id: string, stage: Stage) => {
      const job = jobsRef.current.find((j) => j.id === id);
      setJobs((cur) => cur.map((j) => (j.id === id ? { ...j, stage } : j)));
      setMachines((ms) =>
        ms.map((m) => {
          const there = m.queue.includes(id) || m.job === id;
          if (stage === "Print") {
            if (there || m.id !== job?.machine) return m;
            return m.job ? { ...m, queue: [...m.queue, id] } : { ...m, job: id, done: 0 };
          }
          if (!there) return m;
          if (m.job === id) {
            const [h, ...rest] = m.queue;
            return { ...m, job: h ?? null, done: 0, queue: rest };
          }
          return { ...m, queue: m.queue.filter((q) => q !== id) };
        }),
      );
    },
    [setMachines],
  );

  const toggleRush = React.useCallback(
    (id: string) => {
      const job = jobsRef.current.find((j) => j.id === id);
      const on = !job?.rush;
      setJobs((cur) => cur.map((j) => (j.id === id ? { ...j, rush: on } : j)));
      if (on) setMachines((ms) => ms.map((m) => (m.queue.includes(id) ? { ...m, queue: [id, ...m.queue.filter((q) => q !== id)] } : m)));
    },
    [setMachines],
  );

  const addJob = React.useCallback((j: Job) => setJobs((cur) => [j, ...cur]), []);

  const ops: Ops = { jobs, machines, moveJob, toggleRush, setMachines, addJob, openJob: setOpenId };
  const openJob = jobs.find((j) => j.id === openId) ?? null;
  const proofsWaiting = jobs.filter((j) => j.stage === "Proof").length;

  const modules: DeskModule[] = [
    {
      id: "press",
      label: "Press line",
      title: "Press line",
      blurb: "Four machines live: what is on the bed, what is queued, ink left and every job moving from artwork to the wall",
      icon: Printer,
      notes: ["Each machine shows the job on the bed with a live sq ft counter, its queue and C/M/Y/K ink.", "Pause a machine, run a head clean or refill ink. Bump a queued job to the front.", "Below, every job card flows from artwork to install. Drag a card to a stage or click it to advance."],
      render: () => (
        <>
          <PressHome ops={ops} />
          <JobSheet job={openJob} ops={ops} onClose={() => setOpenId(null)} />
        </>
      ),
    },
    { id: "jobs", label: "Job cards", count: jobs.filter((j) => j.stage !== "Done").length, title: "Job cards", blurb: "Every order with its size, media, machine, finishing, price and due time", icon: ClipboardList, render: () => <JobsTab ops={ops} /> },
    { id: "proofs", label: "Proofs", count: proofsWaiting, title: "Proofs", blurb: "Artwork sent on WhatsApp, versions and replies. Approve and it goes to the press.", icon: FileImage, render: () => <ProofsTab ops={ops} /> },
    { id: "media", label: "Media stock", count: 4, title: "Media stock", blurb: "Rolls in sq ft, sheets and ink against what the booked jobs will use", icon: Layers, render: () => <MediaTab jobs={jobs} /> },
    { id: "installs", label: "Site installs", count: seedInstalls.filter((i) => i.day <= 1).length, title: "Site installs", blurb: "Crews, sites, heights, permits and the photos that close a job", icon: HardHat, render: () => <InstallsTab /> },
    { id: "dues", label: "Dues", count: invoices.length, title: "Dues", blurb: "Who owes what, for how long, and what they promised", icon: Receipt, render: () => <DuesTab /> },
    { id: "team", label: "People", title: "People", blurb: "Press, design, fabrication and crews: who is carrying what today", icon: Users, render: () => <PeopleModule members={team} /> },
    { id: "agents", label: "Agents", title: "Agents", blurb: "Six AI agents chasing proofs, ordering the queue and following up dues", icon: Bot, render: () => <AgentsModule agents={agents} /> },
    { id: "independence", label: "Independence", title: "Owner independence", blurb: "How much of Ganga runs without Saurabh on the phone", icon: GaugeIcon, render: () => <IndependenceModule data={independence} /> },
    { id: "connections", label: "Connections", title: "Connections", blurb: "Tally, WhatsApp, the RIP server and the permit portals", icon: Plug, render: () => <ConnectionsModule items={integrations} /> },
  ];

  return <DeskShell config={config} modules={modules} />;
}

/* ---------------- Home: press line ---------------- */

function PressHome({ ops }: { ops: Ops }) {
  const desk = useDesk();
  const { jobs, machines } = ops;
  const wide = machines.filter((m) => m.id !== "DO-4").reduce((a, m) => a + m.today, 0);
  const dueToday = jobs.filter((j) => j.stage !== "Done" && j.dueIn > 0 && j.dueIn <= 9);
  const rush = jobs.filter((j) => j.rush && j.stage !== "Done").length;
  const lowInk = machines.reduce((a, m) => a + m.ink.filter((v) => v < 20).length, 0);
  const wip = jobs.filter((j) => j.stage !== "Done").reduce((a, j) => a + j.amount, 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Wide-format printed today" value={`${num(Math.round(wide))} sq ft`} delta="+14%" hint="vs Tuesday average" icon={Ruler} trend={[1400, 1700, 1950, 2200, 2400, 2600, wide]} />
        <Stat label="Due today" value={dueToday.length} delta={`+${rush}`} deltaGood={false} hint={`${rush} rush flags`} icon={Timer} tone="warn" trend={[3, 4, 4, 5, 6, 7, dueToday.length]} />
        <Stat label="Ink cartridges under 20%" value={lowInk} hint="refill before the next long job" icon={Droplet} tone={lowInk ? "late" : "ok"} trend={[0, 1, 1, 1, 2, 2, lowInk]} />
        <Stat label="Work in progress" value={inr(wip, { compact: true })} delta="+9%" hint={`${jobs.filter((j) => j.stage !== "Done").length} open job cards`} icon={IndianRupee} tone="ok" trend={[5.1, 5.4, 5.8, 6.0, 6.3, 6.6, wip / 1e5]} />
      </div>

      <Panel live title="Machines" sub="Live from the RIP server · counters run 12× for the demo" action={<Btn size="sm" icon={RefreshCw} onClick={() => { desk.log("Press Scheduler re-ordered all four queues by due time", "info"); toast.success("Queues re-ordered", { description: "By due time, then media, to save roll changes" }); }}>Re-order queues</Btn>}>
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {machines.map((m) => (
            <MachineCard key={m.id} m={m} ops={ops} />
          ))}
        </div>
      </Panel>

      <Panel title="Job flow" sub="Every open job card, artwork to the wall. Drag a card to a stage, or click it to send it on." action={<Pill tone="accent" mono>{jobs.filter((j) => j.stage !== "Done").length} open · {jobs.filter((j) => j.stage === "Done").length} done</Pill>}>
        <JobFlow ops={ops} />
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr_1.35fr]">
        <Panel icon={Droplet} title="Ink burn today" sub="ml per hour, all wide-format machines">
          <AreaChart
            labels={["9", "10", "11", "12", "1", "2", "3", "4"].map((h) => `${h}:00`)}
            series={[
              { name: "Cyan", data: [180, 260, 240, 310, 220, 280, 300, 270], tone: "accent" },
              { name: "Magenta", data: [210, 300, 290, 360, 250, 330, 350, 320], tone: "info" },
              { name: "Yellow", data: [150, 210, 200, 240, 180, 230, 250, 220], tone: "warn" },
              { name: "Black", data: [120, 160, 150, 170, 140, 160, 170, 160], tone: "neutral" },
            ]}
            format={(v) => `${v} ml`}
            height={180}
          />
        </Panel>
        <Panel icon={Printer} title="Output by machine" sub="Today, live">
          <HBars
            format={(v) => num(Math.round(v))}
            data={machines.map((m) => ({ label: `${m.id} ${m.name}`, value: m.today, sub: unitOf(m.id), tone: m.status === "Printing" ? "accent" : "warn" }))}
          />
          <p className="mt-3 text-[12px] text-d-mute">DO-4 counts sheets (13×19 in); the rest count sq ft.</p>
        </Panel>
        <Panel icon={ShieldCheck} title="Waiting on Saurabh" sub="Approvals the team can't make alone">
          <ApprovalQueue
            items={[
              { id: "a1", title: "Arihant star flex, 3 rolls", sub: "Covers Rangoli + Nigam jobs", amount: "₹64,500", meta: "PO" },
              { id: "a2", title: "Start Nigam banners without advance", sub: "Govt order, bill passing 60–80 days", amount: "₹18,000", meta: "Credit", tone: "late" },
              { id: "a3", title: "Night shift on FX-1 till 11 PM", sub: "Imran + helper, Royals banners", amount: "₹3,200", meta: "OT", tone: "info" },
              { id: "a4", title: "6% off for Kanpur Royals", sub: "They asked for a season rate", amount: "−₹1,600", meta: "Rate" },
            ]}
            onDecide={(id, d) => d && desk.log(`Owner ${d} ${id === "a1" ? "Arihant flex PO" : id === "a2" ? "Nigam credit start" : id === "a3" ? "FX-1 night shift" : "Royals discount"}`, d === "approved" ? "ok" : "warn")}
          />
        </Panel>
      </div>
    </div>
  );
}

function PrintHead({ m, color }: { m: Machine; color: string }) {
  const running = m.status === "Printing" && !!m.job;
  if (m.id === "DO-4") {
    return (
      <svg viewBox="0 0 300 64" className="h-16 w-full" aria-hidden>
        <rect x="0" y="0" width="300" height="64" rx="8" fill="var(--d-sunk)" />
        <rect x="120" y="8" width="60" height="48" rx="6" fill="color-mix(in oklab, var(--d-accent) 18%, var(--d-panel))" stroke="var(--d-line)" />
        {CMYK.map((c, i) => (
          <circle key={c.k} cx={134 + i * 11} cy="20" r="3.5" fill={c.color} />
        ))}
        <text x="150" y="46" textAnchor="middle" fontSize="9" fill="var(--d-mute)" fontFamily="monospace">
          {running ? "IMAGING" : "STANDBY"}
        </text>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x="-40" y="22" width="30" height="20" rx="2" fill="#f4f1ea" opacity="0.92">
            {running && <animate attributeName="x" from="-40" to="320" dur="2.4s" begin={`${i * 0.6}s`} repeatCount="indefinite" />}
          </rect>
        ))}
      </svg>
    );
  }
  return (
    <div className="relative h-16 overflow-hidden rounded-[8px] bg-d-sunk">
      <div className={`absolute inset-x-0 bottom-2 h-7 ${running ? "desk-belt" : ""}`} style={{ background: running ? undefined : "color-mix(in oklab, var(--d-ink) 6%, transparent)" }} />
      <div className="absolute bottom-2 left-0 h-7 w-[46%]" style={{ background: `linear-gradient(90deg, ${CMYK.map((c) => c.color).join(",")}, ${color})`, opacity: 0.55 }} />
      <svg viewBox="0 0 300 64" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
        <line x1="6" x2="294" y1="16" y2="16" stroke="var(--d-line)" strokeWidth="3" />
        <g>
          <rect x="130" y="6" width="40" height="22" rx="4" fill="var(--d-panel)" stroke="var(--d-accent)" strokeWidth="1.2" />
          {CMYK.map((c, i) => (
            <rect key={c.k} x={135 + i * 8} y="22" width="5" height="4" fill={c.color} />
          ))}
          {running && <animateTransform attributeName="transform" type="translate" values="-120 0;120 0;-120 0" dur={m.id === "FX-1" ? "1.6s" : m.id === "UV-3" ? "3.2s" : "2.4s"} repeatCount="indefinite" />}
        </g>
      </svg>
    </div>
  );
}

function MachineCard({ m, ops }: { m: Machine; ops: Ops }) {
  const desk = useDesk();
  const job = ops.jobs.find((j) => j.id === m.job) ?? null;
  const size = job ? sizeOf(job) : 0;
  const unit = unitOf(m.id);
  const etaMin = job ? Math.max(1, Math.round(((size - m.done) / m.speed) * 60)) : 0;
  const tone: Tone = m.status === "Printing" ? (job ? "ok" : "neutral") : m.status === "Paused" ? "warn" : "info";

  function setStatus(status: Machine["status"]) {
    ops.setMachines((ms) => ms.map((x) => (x.id === m.id ? { ...x, status } : x)));
  }

  return (
    <article className="desk-rise flex min-w-0 flex-col rounded-[10px] border border-d-line bg-d-paper/60 p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-d-accent">{m.id} · {m.operator}</p>
          <p className="desk-h truncate text-[16px] font-semibold">{m.name}</p>
          <p className="truncate text-[11.5px] text-d-mute">{m.model}</p>
        </div>
        <Pill tone={tone}>{job ? m.status : "Idle"}</Pill>
      </div>
      <div className="mt-3">
        <PrintHead m={m} color={CMYK[m.id.charCodeAt(1) % 4].color} />
      </div>
      {job ? (
        <button type="button" onClick={() => ops.openJob(job.id)} className="mt-3 rounded-[8px] text-left hover:bg-d-sunk/60">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold">
            {job.rush && <Flame className="h-3.5 w-3.5 text-d-late" />}
            <span className="truncate">{job.client}</span>
          </p>
          <p className="truncate text-[12px] text-d-mute">{job.item}</p>
          <div className="mt-2 flex items-baseline justify-between font-mono text-[12px]">
            <span className="tnum text-[20px] font-semibold text-d-ink">{num(Math.round(m.done))}</span>
            <span className="text-d-mute">/ {num(size)} {unit} · ~{etaMin} min</span>
          </div>
          <Meter value={m.done} max={size} tone="accent" className="mt-1.5" />
        </button>
      ) : (
        <p className="mt-3 rounded-[8px] border border-dashed border-d-line px-3 py-4 text-center text-[12.5px] text-d-mute">Bed empty. Approve a proof to feed it.</p>
      )}
      <div className="mt-3 grid grid-cols-4 gap-2">
        {CMYK.map((c, i) => {
          const v = m.ink[i];
          return (
            <div key={c.k} className="flex flex-col items-center">
              <div className="relative h-14 w-5 overflow-hidden rounded-[4px] bg-d-sunk ring-1 ring-d-line">
                <div className="absolute inset-x-0 bottom-0 transition-[height] duration-700" style={{ height: `${v}%`, background: c.color }} />
              </div>
              <span className={`mt-1 font-mono text-[10.5px] ${v < 20 ? "bb-blink text-d-late" : "text-d-mute"}`}>
                {c.k} {Math.round(v)}%
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 border-t border-d-line pt-2.5">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-d-mute">Queue · {m.queue.length}</p>
        <ul className="mt-1.5 space-y-1">
          {m.queue.length === 0 && <li className="text-[12px] text-d-mute">Nothing queued</li>}
          {m.queue.map((qid, qi) => {
            const q = ops.jobs.find((j) => j.id === qid);
            if (!q) return null;
            return (
              <li key={qid} className="flex items-center gap-2 text-[12px]">
                <span className="font-mono text-d-mute">{qi + 1}</span>
                <button type="button" onClick={() => ops.openJob(qid)} className="min-w-0 flex-1 truncate text-left hover:text-d-accent">
                  {q.rush && <Flame className="mr-1 inline h-3 w-3 text-d-late" />}
                  {q.client} · {num(sizeOf(q))} {unit}
                </button>
                {qi > 0 && (
                  <button
                    type="button"
                    aria-label="Bump to front"
                    title="Bump to front"
                    onClick={() => {
                      ops.setMachines((ms) => ms.map((x) => (x.id === m.id ? { ...x, queue: [qid, ...x.queue.filter((y) => y !== qid)] } : x)));
                      desk.log(`${qid} bumped to front of ${m.id}`, "info");
                    }}
                    className="rounded p-0.5 text-d-mute hover:bg-d-sunk hover:text-d-ink"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Btn
          size="sm"
          variant={m.status === "Printing" ? "outline" : "solid"}
          icon={m.status === "Printing" ? Pause : Play}
          onClick={() => {
            const to = m.status === "Printing" ? "Paused" : "Printing";
            setStatus(to);
            desk.log(`${m.id} ${to === "Paused" ? "paused" : "resumed"} by owner`, to === "Paused" ? "warn" : "ok");
          }}
        >
          {m.status === "Printing" ? "Pause" : "Resume"}
        </Btn>
        <Btn
          size="sm"
          icon={Wrench}
          disabled={m.status === "Head clean"}
          onClick={() => {
            setStatus("Head clean");
            toast(`${m.id} head clean started`, { description: "About 5 seconds here, 4 minutes on the floor" });
            window.setTimeout(() => {
              ops.setMachines((ms) => ms.map((x) => (x.id === m.id ? { ...x, status: "Printing" } : x)));
              toast.success(`${m.id} nozzles clear`, { description: "Back to printing" });
            }, 5000);
            desk.log(`${m.id} head clean`, "info");
          }}
        >
          Clean
        </Btn>
        <Btn
          size="sm"
          icon={Droplet}
          onClick={() => {
            const low = CMYK.filter((_, i) => m.ink[i] < 40).map((c) => c.k);
            ops.setMachines((ms) => ms.map((x) => (x.id === m.id ? { ...x, ink: x.ink.map((v) => (v < 40 ? 100 : v)) as Machine["ink"] } : x)));
            toast.success(low.length ? `${m.id}: ${low.join(", ")} refilled` : `${m.id}: all inks above 40%`, { description: low.length ? "Issued from store, logged against the machine" : "Nothing to refill" });
            if (low.length) desk.log(`${m.id} ink refilled: ${low.join(", ")}`, "ok");
          }}
        >
          Refill
        </Btn>
      </div>
    </article>
  );
}

function JobFlow({ ops }: { ops: Ops }) {
  const desk = useDesk();
  const [drag, setDrag] = React.useState<string | null>(null);
  const [over, setOver] = React.useState<FlowStage | null>(null);
  const [expanded, setExpanded] = React.useState<FlowStage | null>(null);

  function move(id: string, to: Stage) {
    const j = ops.jobs.find((x) => x.id === id);
    if (!j || j.stage === to) return;
    ops.moveJob(id, to);
    toast.success(`${id} → ${to}`, { description: to === "Print" ? `Queued on ${j.machine}` : j.client });
    desk.log(`${id} ${j.client} moved to ${to}`, to === "Done" ? "ok" : "info");
  }

  return (
    <div className="desk-scroll -mx-5 overflow-x-auto px-5 pb-1">
      <div className="relative min-w-[980px]">
        <svg className="pointer-events-none absolute left-0 right-0 top-[13px] h-2 w-full" preserveAspectRatio="none" viewBox="0 0 100 2" aria-hidden>
          <line x1="2" x2="98" y1="1" y2="1" stroke="var(--d-accent)" strokeOpacity="0.5" strokeWidth="0.6" className="desk-flow" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="grid grid-cols-6 gap-2.5">
          {STAGES.map((s, si) => {
            const list = ops.jobs.filter((j) => j.stage === s);
            const value = list.reduce((a, j) => a + j.amount, 0);
            return (
              <div key={s} className="min-w-0">
                <div className="relative z-[1] mb-2 flex items-center gap-2">
                  <span className="flex h-7 items-center rounded-full border border-d-line bg-d-panel px-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: CMYK[si % 4].color }}>
                    {s}
                  </span>
                  <span className="font-mono text-[11px] text-d-mute">{list.length}</span>
                </div>
                <p className="mb-2 font-mono text-[10.5px] text-d-mute">{inr(value, { compact: true })}</p>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setOver(s);
                  }}
                  onDragLeave={() => setOver((o) => (o === s ? null : o))}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (drag) move(drag, s);
                    setDrag(null);
                    setOver(null);
                  }}
                  className={`flex min-h-[200px] flex-col gap-1.5 rounded-[10px] p-1.5 transition-colors ${over === s ? "bg-d-soft ring-1 ring-d-accent" : "bg-d-sunk/60"}`}
                >
                  {(expanded === s ? list : list.slice(0, 4)).map((j) => (
                    <button
                      key={j.id}
                      type="button"
                      draggable
                      onDragStart={() => setDrag(j.id)}
                      onDragEnd={() => setDrag(null)}
                      onClick={() => move(j.id, nextStage(j))}
                      onDoubleClick={() => ops.openJob(j.id)}
                      title="Click to advance · double-click for details"
                      className={`desk-rise group relative cursor-grab rounded-[8px] border bg-d-panel px-2.5 py-2 text-left transition-all hover:-translate-y-0.5 active:cursor-grabbing ${drag === j.id ? "opacity-40" : ""}`}
                      style={{ borderColor: j.rush ? "var(--d-late)" : "var(--d-line)", borderLeft: `3px solid ${CMYK[STAGES.indexOf(s) % 4].color}` }}
                    >
                      <p className="flex items-center justify-between gap-1 font-mono text-[10.5px] text-d-mute">
                        <span>{j.id}</span>
                        {j.rush ? <Flame className="h-3 w-3 text-d-late" /> : <span>{j.machine}</span>}
                      </p>
                      <p className="mt-0.5 truncate text-[12.5px] font-semibold">{j.client}</p>
                      <p className="truncate text-[11px] text-d-mute">{j.item}</p>
                      <p className="mt-1 flex items-center justify-between font-mono text-[10.5px]">
                        <span className="text-d-mute">{num(sizeOf(j))} {unitOf(j.machine)}</span>
                        <span style={{ color: j.dueIn <= 8 ? "var(--d-warn)" : "var(--d-mute)" }}>{j.due}</span>
                      </p>
                      <ArrowRight className="absolute bottom-2 right-2 h-3 w-3 text-d-accent opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  ))}
                  {list.length > 4 && (
                    <button type="button" onClick={() => setExpanded(expanded === s ? null : s)} className="rounded-[8px] border border-dashed border-d-line py-1.5 font-mono text-[11px] text-d-mute hover:text-d-accent">
                      {expanded === s ? "Show less" : `+${list.length - 4} more`}
                    </button>
                  )}
                  {list.length === 0 && <p className="py-6 text-center text-[11px] text-d-mute">Drop here</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Job sheet ---------------- */

function costOf(j: Job) {
  const sq = sizeOf(j);
  const isSheet = j.machine === "DO-4";
  const lam = j.lam === "None" ? 0 : Math.round(sq * (isSheet ? 3 : 12));
  const install = j.install ? Math.round(j.amount * 0.12) : 0;
  const fab = j.fab ? Math.round(j.amount * 0.18) : 0;
  const print = Math.max(0, j.amount - lam - install - fab);
  const gst = Math.round(j.amount * 0.18);
  return { print, lam, fab, install, gst, total: j.amount + gst };
}

function JobSheet({ job, ops, onClose }: { job: Job | null; ops: Ops; onClose: () => void }) {
  const desk = useDesk();
  const c = job ? costOf(job) : null;
  const order: Stage[] = [...STAGES, "Done"];
  return (
    <Sheet
      open={!!job}
      onOpenChange={(o) => !o && onClose()}
      eyebrow={job ? `${job.id} · ${job.machine} · rep ${job.rep}` : ""}
      title={job?.client ?? ""}
      sub={job ? `${job.item} · ${job.area}` : ""}
      footer={
        job && (
          <>
            <Btn
              icon={Flame}
              variant={job.rush ? "danger" : "outline"}
              onClick={() => {
                ops.toggleRush(job.id);
                desk.log(`${job.id} rush ${job.rush ? "removed" : "flagged"}`, job.rush ? "info" : "late");
              }}
            >
              {job.rush ? "Rush on" : "Mark rush"}
            </Btn>
            <Btn
              icon={Send}
              onClick={() => {
                toast.success("Status sent on WhatsApp", { description: `${job.client}: ${job.stage}, due ${job.due}` });
                desk.log(`Status of ${job.id} sent to ${job.client}`);
              }}
            >
              Send status
            </Btn>
            <Btn
              variant="solid"
              icon={ArrowRight}
              disabled={job.stage === "Done"}
              onClick={() => {
                const to = nextStage(job);
                ops.moveJob(job.id, to);
                toast.success(`${job.id} → ${to}`);
                desk.log(`${job.id} moved to ${to}`, "ok");
              }}
            >
              Send to {nextStage(job)}
            </Btn>
          </>
        )
      }
    >
      {job && c && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-1.5">
            {order.map((s) => {
              const idx = order.indexOf(job.stage);
              const si = order.indexOf(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    ops.moveJob(job.id, s);
                    desk.log(`${job.id} set to ${s}`);
                  }}
                  className="rounded-full border px-2.5 py-1 font-mono text-[11px]"
                  style={{ borderColor: si <= idx ? "var(--d-accent)" : "var(--d-line)", background: si === idx ? "var(--d-accent)" : si < idx ? "var(--d-soft)" : "transparent", color: si === idx ? "var(--d-accent-ink)" : si < idx ? "var(--d-accent)" : "var(--d-mute)" }}
                >
                  {s}
                </button>
              );
            })}
          </div>
          <KV
            items={[
              { k: "Size", v: job.machine === "DO-4" ? `${num(job.qty)} sheets` : `${job.w} × ${job.h} ft × ${job.qty} = ${num(sizeOf(job))} sq ft` },
              { k: "Media", v: job.media },
              { k: "Lamination", v: job.lam },
              { k: "Fabrication", v: job.fab || "None" },
              { k: "Install", v: job.install ? "Yes, by our crew" : "Pickup / delivery" },
              { k: "Due", v: job.dueIn > 0 ? <span>{job.due} · <Countdown compact inHours={job.dueIn} /></span> : job.due },
            ]}
          />
          <div className="rounded-[10px] border border-d-line p-3">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-d-mute">Price build-up</p>
            <ul className="space-y-1.5 text-[13px]">
              {[
                ["Printing", c.print],
                ["Lamination", c.lam],
                ["Fabrication", c.fab],
                ["Installation", c.install],
                ["GST 18%", c.gst],
              ].map(([k, v]) => (
                <li key={k as string} className="flex justify-between">
                  <span className="text-d-mute">{k}</span>
                  <span className="tnum font-mono">{inr(v as number)}</span>
                </li>
              ))}
              <li className="flex justify-between border-t border-d-line pt-1.5 font-semibold">
                <span>Bill value</span>
                <span className="tnum font-mono">{inr(c.total)}</span>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-2 text-[12px] font-medium text-d-mute">Files</p>
            <ul className="space-y-1.5 text-[13px]">
              {[`${job.id}_artwork_v2.cdr`, `${job.id}_print_ready.pdf`, "Client approval (WhatsApp screenshot)", job.install ? "Site measurement photos" : "Delivery challan"].map((f) => (
                <li key={f} className="flex items-center justify-between rounded-[8px] border border-d-line px-3 py-2">
                  <span className="truncate">{f}</span>
                  <span className="font-mono text-[11px] text-d-mute">design drive</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Sheet>
  );
}

/* ---------------- Job cards ---------------- */

function JobsTab({ ops }: { ops: Ops }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);
  const job = ops.jobs.find((j) => j.id === open) ?? null;
  const openJobs = ops.jobs.filter((j) => j.stage !== "Done");
  const value = openJobs.reduce((a, j) => a + j.amount, 0);
  const sq = openJobs.filter((j) => j.machine !== "DO-4").reduce((a, j) => a + sizeOf(j), 0);
  const byType = ["Flex", "Vinyl", "UV / boards", "Paper"].map((label) => ({
    label,
    value: openJobs.filter((j) => (label === "Flex" ? j.machine === "FX-1" : label === "Vinyl" ? j.machine === "ES-2" : label === "Paper" ? j.machine === "DO-4" : j.machine === "UV-3")).reduce((a, j) => a + j.amount, 0),
  }));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open job cards" value={openJobs.length} delta="+4" hint="this week" icon={ClipboardList} trend={[12, 14, 15, 17, 16, 19, openJobs.length]} />
        <Stat label="Open value" value={inr(value, { compact: true })} delta="+9%" icon={IndianRupee} tone="ok" trend={[4.2, 4.8, 5.1, 5.6, 6.0, 6.4, value / 1e5]} />
        <Stat label="Wide-format booked" value={`${num(sq)} sq ft`} hint="about 4.5 press days" icon={Ruler} />
        <Stat label="Average rate" value="₹46/sq ft" delta="+₹2" hint="mix moved to UV and ACP" icon={Receipt} tone="info" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <Panel title="All job cards" sub="Click a row for the card, price build-up and files" action={<Btn size="sm" variant="solid" icon={Plus} onClick={() => setAdding(true)}>New job card</Btn>}>
          <DataTable
            rows={ops.jobs}
            rowKey={(j) => j.id}
            search={(j) => `${j.id} ${j.client} ${j.item} ${j.area} ${j.media}`}
            searchPlaceholder="Search job, client, area or media"
            filter={{ get: (j) => j.stage, options: [...STAGES, "Done"] }}
            onRow={(j) => setOpen(j.id)}
            bulk={[
              { label: "Send status on WhatsApp", run: (k) => { toast.success(`Status sent for ${k.length} jobs`); desk.log(`Status sent for ${k.length} job cards`); } },
              { label: "Mark rush", run: (k) => { k.forEach((id) => ops.toggleRush(id)); desk.log(`${k.length} jobs flagged rush`, "late"); } },
            ]}
            columns={[
              { key: "id", label: "Job", render: (j) => <span className="font-mono text-[12.5px] font-medium">{j.rush && <Flame className="mr-1 inline h-3 w-3 text-d-late" />}{j.id}</span>, sort: (j) => j.id },
              { key: "client", label: "Client", render: (j) => <span className="font-medium">{j.client}<span className="block text-[11.5px] font-normal text-d-mute">{j.area}</span></span>, sort: (j) => j.client },
              { key: "item", label: "Item", render: (j) => <span className="text-d-mute">{j.item}</span>, wide: true },
              { key: "size", label: "Size", align: "right", render: (j) => <span className="tnum font-mono text-[12px]">{num(sizeOf(j))} {j.machine === "DO-4" ? "sh" : "ft²"}</span>, sort: (j) => sizeOf(j) },
              { key: "mc", label: "Machine", render: (j) => <span className="font-mono text-[12px]">{j.machine}</span>, sort: (j) => j.machine },
              { key: "amt", label: "Value", align: "right", render: (j) => <span className="tnum font-mono">{inr(j.amount, { compact: true })}</span>, sort: (j) => j.amount },
              { key: "due", label: "Due", render: (j) => <span className="font-mono text-[12px]" style={{ color: j.dueIn > 0 && j.dueIn <= 8 ? "var(--d-warn)" : undefined }}>{j.due}</span>, sort: (j) => j.dueIn },
              { key: "st", label: "Stage", render: (j) => <Pill tone={stageTone[j.stage]}>{j.stage}</Pill> },
            ]}
          />
        </Panel>
        <div className="space-y-5">
          <Panel title="By stage" sub="Open cards">
            <Donut center={String(openJobs.length)} sub="open" segments={STAGES.map((s, i) => ({ label: s, value: ops.jobs.filter((j) => j.stage === s).length, tone: (["neutral", "info", "accent", "warn", "late", "ok"] as const)[i] }))} />
          </Panel>
          <Panel title="By work type" sub="Open value">
            <HBars format={(v) => inr(v, { compact: true })} data={byType} />
          </Panel>
        </div>
      </div>
      <JobSheet job={job} ops={ops} onClose={() => setOpen(null)} />
      <NewJob
        open={adding}
        onOpenChange={setAdding}
        nextId={`GP-${2450 + ops.jobs.length - seedJobs.length}`}
        onAdd={(j) => {
          ops.addJob(j);
          desk.log(`New job card ${j.id} for ${j.client}, ${inr(j.amount)}`, "info");
          toast.success(`${j.id} created`, { description: `${j.item} · goes to design first` });
        }}
      />
    </div>
  );
}

function NewJob({ open, onOpenChange, onAdd, nextId }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (j: Job) => void; nextId: string }) {
  const [client, setClient] = React.useState("Kakadeo Medical Store");
  const [item, setItem] = React.useState("Shop board");
  const [media, setMedia] = React.useState("Star flex 440 gsm");
  const [w, setW] = React.useState("12");
  const [h, setH] = React.useState("4");
  const [qty, setQty] = React.useState("1");
  const [install, setInstall] = React.useState(true);
  const m = mediaRates[media];
  const sheet = m.machine === "DO-4";
  const area = sheet ? Number(qty) || 0 : (Number(w) || 0) * (Number(h) || 0) * (Number(qty) || 0);
  const base = Math.round(area * m.rate);
  const amount = base + (install ? Math.max(1500, Math.round(base * 0.15)) : 0);
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="New job card" sub="Priced from the rate card. Design gets it first; the proof goes on WhatsApp.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onAdd({ id: nextId, client, area: "Kanpur", item: sheet ? `${item}, ${qty} sheets` : `${item} ${w}×${h} ft`, media, w: Number(w) || 1, h: Number(h) || 1, qty: Number(qty) || 1, machine: m.machine, stage: "Artwork", due: "Fri", dueIn: 74, amount, rep: "Deepak", lam: "None", fab: install ? "MS frame" : "", install });
          onOpenChange(false);
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Client">
            <input className={inputClass} value={client} onChange={(e) => setClient(e.target.value)} />
          </Field>
          <Field label="Item">
            <input className={inputClass} value={item} onChange={(e) => setItem(e.target.value)} />
          </Field>
        </div>
        <Field label="Media">
          <select className={inputClass} value={media} onChange={(e) => setMedia(e.target.value)}>
            {Object.keys(mediaRates).map((k) => (
              <option key={k} value={k}>
                {k} · ₹{mediaRates[k].rate}/{mediaRates[k].machine === "DO-4" ? "sheet" : "sq ft"} · {mediaRates[k].machine}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Width (ft)">
            <input className={inputClass} disabled={sheet} inputMode="decimal" value={w} onChange={(e) => setW(e.target.value.replace(/[^\d.]/g, ""))} />
          </Field>
          <Field label="Height (ft)">
            <input className={inputClass} disabled={sheet} inputMode="decimal" value={h} onChange={(e) => setH(e.target.value.replace(/[^\d.]/g, ""))} />
          </Field>
          <Field label={sheet ? "Sheets" : "Quantity"}>
            <input className={inputClass} inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-[13px]">
          <input type="checkbox" checked={install} onChange={(e) => setInstall(e.target.checked)} className="h-4 w-4 accent-[var(--d-accent)]" /> Frame and install by our crew
        </label>
        <div className="flex items-baseline justify-between rounded-[10px] bg-d-sunk px-3 py-2.5">
          <span className="text-[12.5px] text-d-mute">{num(Math.round(area))} {sheet ? "sheets" : "sq ft"} · + GST 18% {inr(Math.round(amount * 0.18))}</span>
          <span className="tnum font-mono text-[18px] font-semibold">{inr(amount)}</span>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Btn onClick={() => onOpenChange(false)}>Cancel</Btn>
          <Btn variant="solid" type="submit" icon={Plus}>
            Create job card
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Proofs ---------------- */

function ProofsTab({ ops }: { ops: Ops }) {
  const desk = useDesk();
  const [proofs, setProofs] = React.useState(seedProofs);
  const [sel, setSel] = React.useState(seedProofs[0].job);
  const [asking, setAsking] = React.useState(false);
  const [note, setNote] = React.useState("");
  const [filter, setFilter] = React.useState<"All" | Proof["status"]>("All");
  const p = proofs.find((x) => x.job === sel) ?? proofs[0];
  const job = ops.jobs.find((j) => j.id === p.job);
  const shown = proofs.filter((x) => filter === "All" || x.status === filter);
  const awaiting = proofs.filter((x) => x.status === "Awaiting").length;

  function update(id: string, fn: (x: Proof) => Proof) {
    setProofs((cur) => cur.map((x) => (x.job === id ? fn(x) : x)));
  }

  function approve() {
    update(p.job, (x) => ({ ...x, status: "Approved", waiting: 0, thread: [...x.thread, { from: "them", text: "OK hai, print kar do", time: "now" }, { from: "us", text: `Dhanyavaad. ${p.job} press par ja raha hai.`, time: "now" }] }));
    if (job && (job.stage === "Proof" || job.stage === "Artwork")) ops.moveJob(p.job, "Print");
    toast.success(`${p.job} approved`, { description: job ? `Queued on ${job.machine}` : "Sent to press" });
    desk.log(`${p.contact} approved proof v${p.version} for ${p.job}`, "ok");
  }

  function requestChanges() {
    const text = note.trim() || "Thoda colour badlo";
    const id = p.job;
    const v = p.version + 1;
    update(id, (x) => ({ ...x, status: "Changes asked", thread: [...x.thread, { from: "them", text, time: "now" }, { from: "us", text: `Noted. v${v} 30 min mein bhejte hain.`, time: "now" }] }));
    setAsking(false);
    setNote("");
    toast(`Changes logged for ${id}`, { description: "Pankaj gets the note in the job folder" });
    desk.log(`Changes asked on ${id}: ${text}`, "warn");
    window.setTimeout(() => {
      setProofs((cur) => cur.map((x) => (x.job === id ? { ...x, version: v, status: "Awaiting", waiting: 0, sent: "just now", thread: [...x.thread, { from: "us", text: `[Proof v${v} · revised]`, time: "now" }] } : x)));
      toast.success(`${id} v${v} sent on WhatsApp`, { description: "Proof Chaser will nudge in 45 min" });
    }, 3500);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Awaiting client" value={awaiting} delta="-2" deltaGood hint="since yesterday" icon={MessageCircle} tone="info" trend={[9, 8, 8, 7, 7, 6, awaiting]} />
        <Stat label="Average reply time" value="3.4 h" delta="-1.1 h" deltaGood={false} hint="with Proof Chaser nudges" icon={Timer} trend={[6.1, 5.6, 5.2, 4.6, 4.1, 3.8, 3.4]} />
        <Stat label="Versions per job" value="1.9" hint="target under 2" icon={RefreshCw} tone="warn" />
        <Stat label="Approved today" value={proofs.filter((x) => x.status === "Approved").length} hint="each went straight to the press" icon={CheckCheck} tone="ok" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)_320px]">
        <Panel title="Proof queue" sub="Oldest wait first" action={<Segmented size="sm" options={["All", "Awaiting", "Changes asked", "Approved"] as const} value={filter} onChange={setFilter} />} bodyClassName="p-3 pt-3">
          <ul className="space-y-1.5">
            {[...shown]
              .sort((a, b) => b.waiting - a.waiting)
              .map((x) => {
                const j = ops.jobs.find((y) => y.id === x.job);
                return (
                  <li key={x.job}>
                    <button type="button" onClick={() => setSel(x.job)} className={`flex w-full items-center gap-3 rounded-[10px] border p-2 text-left transition-colors ${x.job === sel ? "border-d-accent bg-d-soft" : "border-d-line hover:bg-d-sunk"}`}>
                      <span className="flex h-11 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[6px] px-1 text-center text-[7px] font-bold leading-tight" style={{ background: x.art.bg, color: x.art.ink }}>
                        {x.art.title}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold">{j?.client ?? x.contact}</span>
                        <span className="block truncate text-[11.5px] text-d-mute">{x.job} · v{x.version} · sent {x.sent}</span>
                      </span>
                      <span className="flex flex-col items-end gap-1">
                        <Pill tone={x.status === "Approved" ? "ok" : x.status === "Awaiting" ? (x.waiting > 4 ? "late" : "info") : "warn"}>{x.status}</Pill>
                        {x.status === "Awaiting" && <span className="font-mono text-[10.5px] text-d-mute">{x.waiting.toFixed(1)} h</span>}
                      </span>
                    </button>
                  </li>
                );
              })}
          </ul>
        </Panel>

        <section className="desk-card desk-rise min-w-0 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3" style={{ background: "#1f2c34" }}>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2a3942] text-[13px] font-semibold text-[#e9edef]">{p.contact[0]}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-[#e9edef]">{p.contact}</p>
              <p className="truncate text-[11.5px] text-[#8696a0]">{p.phone} · {job?.client}</p>
            </div>
            <Pill tone={p.status === "Approved" ? "ok" : p.status === "Awaiting" ? "info" : "warn"}>v{p.version} · {p.status}</Pill>
          </div>
          <div className="space-y-2 px-4 py-4" style={{ background: "#0b141a", minHeight: 420 }}>
            <div className="ml-auto max-w-[88%] rounded-[10px] rounded-tr-[2px] p-1.5" style={{ background: "#005c4b" }}>
              <div className="relative flex aspect-[2.4/1] flex-col items-center justify-center overflow-hidden rounded-[7px] px-4 text-center" style={{ background: p.art.bg, color: p.art.ink }}>
                <span className="absolute left-2 top-2 rounded bg-black/35 px-1.5 py-px font-mono text-[9.5px] text-white">PROOF v{p.version} · {p.art.tag}</span>
                <span className="text-[clamp(16px,2.6vw,30px)] font-black leading-tight tracking-tight drop-shadow">{p.art.title}</span>
                <span className="mt-1.5 text-[clamp(9px,1.1vw,12.5px)] font-medium opacity-90">{p.art.sub}</span>
                <span className="absolute bottom-1.5 right-2 font-mono text-[8.5px] opacity-70">Ganga Printworks · 0512-2531 884</span>
              </div>
              <p className="px-1.5 pb-0.5 pt-1.5 text-[12.5px] text-[#e9edef]">Proof {p.job} v{p.version}. Kripya check karke OK bhejiye.</p>
            </div>
            {p.thread.map((t, i) => (
              <div key={`${t.time}-${i}`} className={`max-w-[80%] rounded-[10px] px-3 py-1.5 text-[13px] text-[#e9edef] ${t.from === "us" ? "ml-auto rounded-tr-[2px]" : "rounded-tl-[2px]"}`} style={{ background: t.from === "us" ? "#005c4b" : "#202c33" }}>
                {t.text}
                <span className="ml-2 align-bottom font-mono text-[10px] text-[#8696a0]">{t.time}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-d-line px-4 py-3">
            <Btn variant="solid" icon={CheckCheck} disabled={p.status === "Approved"} onClick={approve}>
              Approve and print
            </Btn>
            <Btn icon={RefreshCw} disabled={p.status === "Approved"} onClick={() => setAsking(true)}>
              Request changes
            </Btn>
            <Btn
              variant="ghost"
              icon={MessageCircle}
              disabled={p.status !== "Awaiting"}
              onClick={() => {
                update(p.job, (x) => ({ ...x, thread: [...x.thread, { from: "us", text: "Namaste ji, proof dekh liya? Aaj OK mil jaye to kal tak ready.", time: "now" }] }));
                toast.success("Nudge sent", { description: p.contact });
                desk.log(`Proof nudge sent to ${p.contact}`, "info");
              }}
            >
              Nudge
            </Btn>
          </div>
        </section>

        <div className="space-y-5">
          <Panel title="Job behind the proof" sub={p.job}>
            {job ? (
              <KV
                cols={1}
                items={[
                  { k: "Item", v: job.item },
                  { k: "Media", v: `${job.media} · ${job.machine}` },
                  { k: "Size", v: `${num(sizeOf(job))} ${unitOf(job.machine)}` },
                  { k: "Value", v: inr(job.amount) },
                  { k: "Stage", v: <Pill tone={stageTone[job.stage]}>{job.stage}</Pill> },
                  { k: "Press slot", v: job.due },
                ]}
              />
            ) : (
              <p className="text-[13px] text-d-mute">No job card linked.</p>
            )}
          </Panel>
          <Panel title="Why proofs come back" sub="Last 60 revisions">
            <HBars
              data={[
                { label: "Text or rate change", value: 22, tone: "info" },
                { label: "Logo / colour", value: 15, tone: "accent" },
                { label: "Phone number wrong", value: 9, tone: "late" },
                { label: "Size changed on site", value: 8, tone: "warn" },
                { label: "Hindi spelling", value: 6, tone: "neutral" },
              ]}
            />
          </Panel>
        </div>
      </div>
      <Modal open={asking} onOpenChange={setAsking} title={`Changes for ${p.job}`} sub={`What did ${p.contact} ask for? Pankaj gets it in the job folder.`}>
        <div className="space-y-3">
          <Field label="Client's note">
            <textarea className={`${inputClass} h-24 py-2`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Naam bada karo, number 98390 11427 add karo" />
          </Field>
          <div className="flex flex-wrap gap-1.5">
            {["Naam bada karo", "Colour thoda dark", "Phone number badlo", "Hindi mein bhi likho"].map((s) => (
              <button key={s} type="button" onClick={() => setNote(s)} className="rounded-full border border-d-line px-2.5 py-1 text-[12px] hover:bg-d-sunk">
                {s}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Btn onClick={() => setAsking(false)}>Cancel</Btn>
            <Btn variant="solid" icon={Send} onClick={requestChanges}>
              Log and revise
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ---------------- Media stock ---------------- */

function MediaTab({ jobs }: { jobs: Job[] }) {
  const desk = useDesk();
  const [rolls, setRolls] = React.useState(seedRolls);
  const [ordering, setOrdering] = React.useState<Roll | null>(null);
  const [ordered, setOrdered] = React.useState<Set<string>>(new Set());
  const [qty, setQty] = React.useState("");
  const cover = (r: Roll) => r.onHand / Math.max(0.1, r.burn);
  const low = rolls.filter((r) => r.onHand < r.reorderAt);
  const value = rolls.reduce((a, r) => a + r.onHand * r.rate, 0);
  const booked = jobs.filter((j) => j.stage === "Artwork" || j.stage === "Proof" || j.stage === "Print").filter((j) => j.machine !== "DO-4").reduce((a, j) => a + sizeOf(j), 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Below reorder level" value={low.length} delta="+1" deltaGood={false} hint="star flex, gloss vinyl, OWV, art card" icon={AlertTriangle} tone="late" />
        <Stat label="Stock value" value={inr(value, { compact: true })} hint="at last purchase rate" icon={Package} />
        <Stat label="Wide-format booked" value={`${num(booked)} sq ft`} hint="jobs not yet printed" icon={Ruler} tone="info" />
        <Stat label="Media wastage" value="4.8%" delta="-0.7%" deltaGood={false} hint="target under 5%" icon={Layers} tone="ok" trend={[6.4, 6.1, 5.8, 5.5, 5.2, 5.0, 4.8]} />
      </div>
      <Panel title="Rolls, sheets and ink" sub="From store GRNs minus RIP print logs. Raise a PO and it lands in Tally for approval.">
        <DataTable
          rows={rolls}
          rowKey={(r) => r.sku}
          search={(r) => `${r.sku} ${r.name} ${r.supplier}`}
          searchPlaceholder="Search media or supplier"
          filter={{ get: (r) => (r.onHand < r.reorderAt ? "Reorder" : cover(r) < 6 ? "Watch" : "OK"), options: ["Reorder", "Watch", "OK"] }}
          onRow={(r) => {
            setOrdering(r);
            setQty(String(Math.max(r.reorderAt * 2 - r.onHand, Math.round(r.burn * 7))));
          }}
          pageSize={12}
          columns={[
            { key: "sku", label: "SKU", render: (r) => <span className="font-mono text-[12px]">{r.sku}</span> },
            { key: "name", label: "Media", render: (r) => <span className="font-medium">{r.name}<span className="block text-[11.5px] font-normal text-d-mute">{r.width} · {r.lot}</span></span>, sort: (r) => r.name },
            { key: "on", label: "On hand", align: "right", render: (r) => <span className="tnum font-mono">{num(r.onHand)} <span className="text-d-mute">{r.unit}</span></span>, sort: (r) => r.onHand },
            { key: "burn", label: "Use / day", align: "right", render: (r) => <span className="tnum font-mono text-d-mute">{num(r.burn)}</span>, wide: true },
            {
              key: "cover",
              label: "Cover",
              render: (r) => (
                <div className="flex min-w-[130px] items-center gap-2">
                  <Meter value={Math.min(14, cover(r))} max={14} tone={cover(r) < 3 ? "late" : cover(r) < 6 ? "warn" : "ok"} />
                  <span className="whitespace-nowrap font-mono text-[11px] text-d-mute">{cover(r).toFixed(1)} d</span>
                </div>
              ),
              sort: (r) => cover(r),
            },
            { key: "sup", label: "Supplier", render: (r) => <span className="text-d-mute">{r.supplier}</span>, wide: true },
            {
              key: "act",
              label: "",
              align: "right",
              render: (r) =>
                ordered.has(r.sku) ? (
                  <Pill tone="info">PO raised</Pill>
                ) : r.onHand < r.reorderAt ? (
                  <Btn
                    size="sm"
                    variant="soft"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOrdering(r);
                      setQty(String(Math.max(r.reorderAt * 2 - r.onHand, Math.round(r.burn * 7))));
                    }}
                  >
                    Reorder
                  </Btn>
                ) : (
                  <Pill tone="ok">OK</Pill>
                ),
            },
          ]}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Days of cover" sub="At this week's usage">
          <HBars format={(v) => `${v.toFixed(1)} d`} data={[...rolls].sort((a, b) => cover(a) - cover(b)).slice(0, 8).map((r) => ({ label: r.name, value: cover(r), tone: cover(r) < 3 ? "late" : cover(r) < 6 ? "warn" : "ok" }))} />
        </Panel>
        <Panel title="Flex used per week" sub="sq ft, star + normal + backlit">
          <Bars
            height={210}
            format={(v) => num(v)}
            data={["W38", "W39", "W40", "W41", "W42", "W43"].map((label, i) => ({
              label,
              value: [5200, 6100, 7400, 8900, 11200, 9800][i],
              stack: [
                { name: "Star", value: [2600, 3100, 3900, 4800, 6400, 5600][i], tone: "accent" as const },
                { name: "Normal", value: [2100, 2500, 2900, 3400, 3900, 3400][i], tone: "info" as const },
                { name: "Backlit", value: [500, 500, 600, 700, 900, 800][i], tone: "warn" as const },
              ],
            }))}
          />
        </Panel>
      </div>
      <Modal open={!!ordering} onOpenChange={(o) => !o && setOrdering(null)} title={ordering ? `Reorder ${ordering.name}` : ""} sub={ordering ? `${ordering.supplier} · last rate ₹${ordering.rate}/${ordering.unit === "sq ft" ? "sq ft" : ordering.unit.replace(/s$/, "")}` : ""}>
        {ordering && (
          <div className="space-y-3">
            <KV items={[{ k: "On hand", v: `${num(ordering.onHand)} ${ordering.unit}` }, { k: "Reorder level", v: `${num(ordering.reorderAt)} ${ordering.unit}` }, { k: "Use per day", v: `${num(ordering.burn)} ${ordering.unit}` }, { k: "Cover now", v: `${cover(ordering).toFixed(1)} days` }]} />
            <Field label={`Quantity (${ordering.unit})`}>
              <input className={inputClass} inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))} />
            </Field>
            <div className="flex items-baseline justify-between rounded-[10px] bg-d-sunk px-3 py-2.5">
              <span className="text-[12.5px] text-d-mute">+ GST 18% {inr(Math.round((Number(qty) || 0) * ordering.rate * 0.18))}</span>
              <span className="tnum font-mono text-[18px] font-semibold">{inr((Number(qty) || 0) * ordering.rate)}</span>
            </div>
            <div className="flex justify-end gap-2">
              <Btn onClick={() => setOrdering(null)}>Cancel</Btn>
              <Btn
                variant="solid"
                icon={Truck}
                onClick={() => {
                  const r = ordering;
                  const q = Number(qty) || 0;
                  setOrdered((s) => new Set(s).add(r.sku));
                  setRolls((cur) => cur.map((x) => (x.sku === r.sku ? { ...x, lot: `${x.lot} · PO ${num(q)} in transit` } : x)));
                  toast.success(`PO raised: ${num(q)} ${r.unit} ${r.name}`, { description: `${r.supplier} · ${inr(q * r.rate)} · sent on WhatsApp, entered in Tally` });
                  desk.log(`Media PO ${r.name}, ${num(q)} ${r.unit}, ${inr(q * r.rate)}`, "info");
                  setOrdering(null);
                }}
              >
                Raise PO
              </Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ---------------- Site installs ---------------- */

const DAYS = ["Tue 20", "Wed 21", "Thu 22", "Fri 23", "Sat 24", "Sun 25", "Mon 26"];

function InstallsTab() {
  const desk = useDesk();
  const [list, setList] = React.useState(seedInstalls);
  const [open, setOpen] = React.useState<string | null>(null);
  const [checks, setChecks] = React.useState<Record<string, string[]>>({ "IN-301": ["helmets", "harness", "photos-before"] });
  const inst = list.find((i) => i.id === open) ?? null;
  const crewTone: Record<Install["crew"], Tone> = { "Crew A · Raju": "accent", "Crew B · Salim": "info", "Crew C · hired": "warn" };
  const rows: GanttRow[] = list.map((i) => ({
    id: i.id,
    title: i.client,
    sub: `${i.crew} · ${i.site}`,
    bars: [{ from: i.day + (i.start - 7) / 14, to: i.day + (i.start - 7 + i.hours) / 14, tone: i.status === "Blocked" ? "late" : i.status === "Done" ? "ok" : crewTone[i.crew], dashed: i.status === "Scheduled" && i.permit === "Pending" }],
    badge: i.status === "Blocked" ? { at: i.day + 0.5, label: "permit", tone: "late" } : i.status === "On site" ? { at: i.day + 0.5, label: "on site", tone: "ok" } : undefined,
  }));
  const permits = list.filter((i) => i.permit === "Applied" || i.permit === "Pending");
  const checklist = [
    { id: "helmets", label: "Helmets and safety shoes for all", sub: "Photo in the crew group" },
    { id: "harness", label: "Harness above 12 ft", sub: "Mandatory on scaffold and rooftop" },
    { id: "power", label: "Power point confirmed with client", sub: "For drill and LED testing" },
    { id: "photos-before", label: "Before photos, 4 angles" },
    { id: "photos-after", label: "After photos + client selfie at night (backlit)" },
    { id: "sign", label: "Client signs the job card", sub: "Triggers the final bill in Tally" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Installs this week" value={list.length} delta="+3" hint="Diwali rush" icon={HardHat} trend={[5, 6, 6, 8, 9, 10, list.length]} />
        <Stat label="Crews out now" value={list.filter((i) => i.status === "On site").length} hint="Raju at Balaji Motors" icon={MapPin} tone="ok" />
        <Stat label="Blocked by permits" value={list.filter((i) => i.status === "Blocked").length + permits.filter((p) => p.status !== "Blocked").length} delta="+1" deltaGood={false} hint="KDA and Nagar Nigam" icon={ShieldCheck} tone="late" />
        <Stat label="Average install time" value="4.6 h" delta="-0.4 h" deltaGood={false} hint="vs last month" icon={Timer} />
      </div>
      <Panel title="Crew calendar" sub="7 AM to 9 PM each day · dashed means waiting on a permit · click a row for the site sheet">
        <Gantt rows={rows} days={7} ticks={DAYS.map((label, at) => ({ at, label }))} today={{ at: 0.3, label: "Now" }} markers={[{ at: 4, label: "Dhanteras eve", tone: "warn" }]} onRow={(r) => setOpen(r.id)} labelWidth={260} />
        <div className="mt-3 flex flex-wrap gap-4 text-[12px] text-d-mute">
          {Object.entries(crewTone).map(([c, t]) => (
            <span key={c} className="inline-flex items-center gap-1.5">
              <span className="h-2 w-5 rounded-full" style={{ background: `var(--d-${t === "accent" ? "accent" : t})` }} /> {c}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-5 rounded-full bg-d-late" /> blocked
          </span>
        </div>
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <Panel title="Site list" sub="Height, access and permit for every site">
          <DataTable
            rows={list}
            rowKey={(i) => i.id}
            search={(i) => `${i.id} ${i.client} ${i.site} ${i.crew}`}
            searchPlaceholder="Search site, client or crew"
            filter={{ get: (i) => i.status, options: ["On site", "Scheduled", "Blocked", "Done"] }}
            onRow={(i) => setOpen(i.id)}
            columns={[
              { key: "id", label: "Install", render: (i) => <span className="font-mono text-[12px]">{i.id}<span className="block text-d-mute">{i.job}</span></span> },
              { key: "client", label: "Client / site", render: (i) => <span className="font-medium">{i.client}<span className="block text-[11.5px] font-normal text-d-mute">{i.site}</span></span>, sort: (i) => i.client },
              { key: "when", label: "When", render: (i) => <span className="font-mono text-[12px]">{DAYS[i.day]} · {i.start > 12 ? i.start - 12 : i.start}{i.start >= 12 ? " PM" : " AM"}</span>, sort: (i) => i.day * 24 + i.start },
              { key: "h", label: "Height", render: (i) => <span className="font-mono text-[12px]">{i.height}</span>, wide: true },
              { key: "crew", label: "Crew", render: (i) => <Pill tone={crewTone[i.crew]}>{i.crew}</Pill>, wide: true },
              { key: "permit", label: "Permit", render: (i) => <Pill tone={i.permit === "Approved" ? "ok" : i.permit === "Not needed" ? "neutral" : i.permit === "Applied" ? "warn" : "late"}>{i.permit}</Pill> },
              { key: "st", label: "Status", render: (i) => <Pill tone={i.status === "On site" ? "ok" : i.status === "Blocked" ? "late" : i.status === "Done" ? "ok" : "info"}>{i.status}</Pill> },
            ]}
          />
        </Panel>
        <Panel icon={ShieldCheck} title="Permits in progress" sub="KDA hoarding and Nagar Nigam pole permissions">
          <ul className="space-y-2.5">
            {permits.map((i) => (
              <li key={i.id} className="rounded-[10px] border border-d-line p-3">
                <p className="flex items-center justify-between gap-2 text-[13.5px] font-semibold">
                  {i.client}
                  <Pill tone={i.permit === "Applied" ? "warn" : "late"}>{i.permit}</Pill>
                </p>
                <p className="text-[12px] text-d-mute">{i.site} · {i.height} · {i.access}</p>
                <p className="mt-1 text-[12px] text-d-mute">{i.client.startsWith("Nagar") ? "Zone 3 office, pole permission for 30 banners" : "KDA hoarding cell, structural drawing submitted"}</p>
                <div className="mt-2 flex gap-1.5">
                  <Btn
                    size="sm"
                    variant="soft"
                    icon={CheckCheck}
                    onClick={() => {
                      setList((cur) => cur.map((x) => (x.id === i.id ? { ...x, permit: "Approved", status: x.status === "Blocked" ? "Scheduled" : x.status } : x)));
                      toast.success(`Permit approved for ${i.client}`, { description: "Crew and crane confirmed" });
                      desk.log(`Permit approved: ${i.client}, ${i.site}`, "ok");
                    }}
                  >
                    Mark approved
                  </Btn>
                  <Btn
                    size="sm"
                    onClick={() => {
                      setList((cur) => cur.map((x) => (x.id === i.id ? { ...x, day: Math.min(6, x.day + 3) } : x)));
                      toast(`${i.id} moved 3 days`, { description: "Crane rebooked, no charge if told before 4 PM" });
                      desk.log(`${i.id} ${i.client} pushed 3 days for permit`, "warn");
                    }}
                  >
                    Push 3 days
                  </Btn>
                </div>
              </li>
            ))}
            {permits.length === 0 && <li className="text-[13px] text-d-mute">No permits pending.</li>}
          </ul>
        </Panel>
      </div>
      <Sheet
        open={!!inst}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={inst ? `${inst.id} · ${inst.job} · ${inst.crew}` : ""}
        title={inst?.client ?? ""}
        sub={inst ? `${inst.site} · ${DAYS[inst.day]}` : ""}
        footer={
          inst && (
            <>
              <Btn
                icon={Camera}
                onClick={() => {
                  toast.success("Site photos requested", { description: `${inst.crew.split(" · ")[1]} gets a reminder on WhatsApp` });
                  desk.log(`Photos requested from ${inst.crew} for ${inst.id}`);
                }}
              >
                Ask for photos
              </Btn>
              <Btn
                variant="solid"
                icon={CheckCheck}
                disabled={inst.status === "Done"}
                onClick={() => {
                  setList((cur) => cur.map((x) => (x.id === inst.id ? { ...x, status: "Done" } : x)));
                  toast.success(`${inst.client} installed`, { description: "Final bill drafted in Tally" });
                  desk.log(`Install done: ${inst.client}, final bill drafted`, "ok");
                }}
              >
                Mark installed
              </Btn>
            </>
          )
        }
      >
        {inst && (
          <div className="space-y-5">
            <KV items={[{ k: "Start", v: `${inst.start > 12 ? inst.start - 12 : inst.start}:00 ${inst.start >= 12 ? "PM" : "AM"}, ${inst.hours} h` }, { k: "Height", v: inst.height }, { k: "Access", v: inst.access }, { k: "Permit", v: inst.permit }, { k: "Status", v: inst.status }, { k: "Crew", v: inst.crew }]} />
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Site checklist</p>
              <Checklist
                items={checklist.map((c) => ({ ...c, done: (checks[inst.id] ?? []).includes(c.id) }))}
                onToggle={(id) => {
                  setChecks((cur) => {
                    const have = cur[inst.id] ?? [];
                    return { ...cur, [inst.id]: have.includes(id) ? have.filter((x) => x !== id) : [...have, id] };
                  });
                  desk.log(`${inst.id} checklist: ${checklist.find((c) => c.id === id)?.label}`);
                }}
              />
            </div>
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Carry from store</p>
              <ul className="space-y-1 text-[13px]">
                {["Drill + 8 mm bits, anchor fasteners", "Rope 30 m, cable ties", inst.height.includes("ft") && parseInt(inst.height) > 15 ? "Scaffold, 2 harnesses" : "A-ladder 12 ft", "Silicone, double tape, cutter"].map((x) => (
                  <li key={x} className="rounded-[8px] border border-d-line px-3 py-1.5">{x}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Dues ---------------- */

function DuesTab() {
  const desk = useDesk();
  const [open, setOpen] = React.useState<Invoice | null>(null);
  const [sent, setSent] = React.useState<Set<string>>(new Set());
  const total = invoices.reduce((a, i) => a + i.amount, 0);
  const live = total;
  const bucket = (d: number) => (d <= 30 ? "0-30 days" : d <= 60 ? "31-60 days" : d <= 90 ? "61-90 days" : "90+ days");
  const buckets = ["0-30 days", "31-60 days", "61-90 days", "90+ days"].map((label, i) => ({ label, value: invoices.filter((x) => bucket(x.days) === label).reduce((a, x) => a + x.amount, 0), tone: (["ok", "info", "warn", "late"] as const)[i] }));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Outstanding" value={inr(live, { compact: true })} delta="-4%" deltaGood={false} hint="vs last month" icon={IndianRupee} tone="warn" trend={[9.4, 9.1, 8.9, 8.8, 8.6, 8.4, 8.2]} />
        <Stat label="Over 60 days" value={inr(invoices.filter((i) => i.days > 60).reduce((a, i) => a + i.amount, 0), { compact: true })} hint={`${invoices.filter((i) => i.days > 60).length} bills, Nigam the largest`} icon={AlertTriangle} tone="late" />
        <Stat label="Due on handover today" value="₹71,000" hint="Balaji Motors fascia" icon={HardHat} tone="ok" />
        <Stat label="Advance taken" value="38%" delta="+6%" hint="of jobs this month, target 60%" icon={Receipt} tone="info" trend={[22, 25, 27, 30, 33, 35, 38]} />
      </div>
      <Panel title="Ageing" sub="Party-wise from Tally. Reminders go at 5 PM unless you stop them.">
        <AgingBar buckets={buckets} format={(v) => inr(v, { compact: true })} />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Panel title="Bills" sub="Select rows to send WhatsApp reminders with the UPI QR">
          <DataTable
            rows={invoices}
            rowKey={(i) => i.no}
            search={(i) => `${i.no} ${i.client} ${i.for}`}
            searchPlaceholder="Search bill or party"
            filter={{ get: (i) => bucket(i.days), options: ["0-30 days", "31-60 days", "61-90 days", "90+ days"] }}
            onRow={setOpen}
            bulk={[{ label: "Send WhatsApp reminders", run: (keys) => { setSent((s) => new Set([...s, ...keys])); toast.success(`${keys.length} reminders sent`); desk.log(`${keys.length} dues reminders sent on WhatsApp`); } }]}
            columns={[
              { key: "no", label: "Bill", render: (i) => <span className="font-mono text-[12px]">{i.no}</span> },
              { key: "client", label: "Party", render: (i) => <span className="font-medium">{i.client}</span>, sort: (i) => i.client },
              { key: "for", label: "For", render: (i) => <span className="text-d-mute">{i.for}</span>, wide: true },
              { key: "amt", label: "Amount", align: "right", render: (i) => <span className="tnum font-mono">{inr(i.amount)}</span>, sort: (i) => i.amount },
              { key: "days", label: "Days", align: "right", render: (i) => <span className="tnum font-mono" style={{ color: i.days > 90 ? "var(--d-late)" : i.days > 60 ? "var(--d-warn)" : undefined }}>{i.days}</span>, sort: (i) => i.days },
              { key: "p", label: "Promise", render: (i) => (sent.has(i.no) ? <Pill tone="info">Reminded</Pill> : i.promise ? <Pill tone="ok">{i.promise}</Pill> : <span className="text-d-mute">—</span>) },
            ]}
          />
        </Panel>
        <Panel title="Collections forecast" sub="Promises + party habits, ₹ lakh">
          <Bars height={210} format={(v) => `₹${v}L`} data={[{ label: "This wk", value: 2.1, tone: "ok" }, { label: "Next wk", value: 2.6, tone: "accent" }, { label: "Wk 3", value: 1.2, tone: "accent" }, { label: "Wk 4", value: 0.9, tone: "info" }, { label: "Govt", value: 2.4, tone: "late" }]} />
        </Panel>
      </div>
      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={open?.no}
        title={open?.client ?? ""}
        sub={open ? `${inr(open.amount)} · ${open.days} days · terms ${open.terms}` : ""}
        footer={
          <Btn
            variant="solid"
            icon={MessageCircle}
            onClick={() => {
              if (!open) return;
              setSent((s) => new Set(s).add(open.no));
              toast.success("Reminder sent on WhatsApp", { description: open.client });
              desk.log(`Reminder sent to ${open.client} for ${inr(open.amount)}`);
              setOpen(null);
            }}
          >
            Send on WhatsApp
          </Btn>
        }
      >
        {open && (
          <div className="space-y-4">
            <div className="rounded-[12px] p-4 text-[13.5px] leading-relaxed text-[#e9edef]" style={{ background: "#005c4b" }}>
              Namaste ji, Ganga Printworks se. Bill {open.no} ({open.for}) {inr(open.amount)}, {open.raised} ka hai, aaj {open.days} din ho gaye. UPI QR neeche hai. Dhanyavaad. — Neha, Accounts
            </div>
            <KV items={[{ k: "Raised", v: open.raised }, { k: "Terms", v: open.terms }, { k: "Last promise", v: open.promise ?? "None" }, { k: "Reminders sent", v: open.days > 60 ? "4" : "1" }]} />
            <Meter value={open.days} max={120} tone={open.days > 90 ? "late" : open.days > 60 ? "warn" : "ok"} />
          </div>
        )}
      </Sheet>
    </div>
  );
}

