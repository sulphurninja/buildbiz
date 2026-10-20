"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Boxes,
  Calculator,
  CheckCheck,
  ChevronsRight,
  ClipboardList,
  Cog,
  Factory,
  FileText,
  Flag,
  Gauge as GaugeIcon,
  Hammer,
  IndianRupee,
  Info,
  Microscope,
  Package,
  Pause,
  PenTool,
  Play,
  Plug,
  Plus,
  Receipt,
  RotateCcw,
  Ruler,
  Scissors,
  Send,
  ShieldCheck,
  Timer,
  TriangleAlert,
  Truck,
  Users,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { DeskShell, useDesk } from "../shell";
import { AreaChart, Bars, Donut, HBars, HeatGrid } from "../charts";
import { AgingBar, Board, Checklist, Countdown, DataTable } from "../data";
import { AgentsModule, ConnectionsModule, IndependenceModule, PeopleModule } from "../common";
import { Btn, Field, inputClass, inr, KV, Meter, Modal, Panel, Pill, Segmented, Sheet, Stat, num, toneVar } from "../ui";
import { clockLabel, useDrift, useNow } from "../hooks";
import type { Decision, DeskConfig, DeskModule, IndependenceData, Integration, TeamMember, Tone, WorkforceAgent } from "../types";

/* ============================================================
   Data — Kaveri Precision Works, Hosur (SIPCOT Phase II).
   Fictional fabrication + CNC job-shop, 46 people, 2 shifts.
   Due dates are in hours from when the desk opened.
   ============================================================ */

const STATIONS = ["Design", "Cut", "Fabricate", "Assemble", "Test", "Dispatch"] as const;
type Station = (typeof STATIONS)[number];
const WIP: Record<Station, number> = { Design: 4, Cut: 3, Fabricate: 4, Assemble: 3, Test: 2, Dispatch: 5 };
const stationMeta: Record<Station, { icon: LucideIcon; cell: string; who: string }> = {
  Design: { icon: PenTool, cell: "CAD / CAM desk", who: "Meena" },
  Cut: { icon: Scissors, cell: "Fibre laser · bandsaw", who: "Ravi" },
  Fabricate: { icon: Hammer, cell: "VMC · lathes · weld bays", who: "Arul" },
  Assemble: { icon: Wrench, cell: "Fitting bay 1–2", who: "Arul" },
  Test: { icon: Microscope, cell: "CMM · test bench", who: "Deepa" },
  Dispatch: { icon: Truck, cell: "Paint · pack · load", who: "Vignesh" },
};

type Kind = "fab" | "machined" | "fixture";
type Job = {
  id: string;
  part: string;
  customer: string;
  qty: number;
  station: Station;
  dueH: number;
  value: number;
  expedite: boolean;
  rework: number;
  rev: string;
  kind: Kind;
  scale: number;
  over: number;
  extra: number;
  po: string;
  material: string;
};

const customers: Record<string, { city: string; st: "TN" | "KA"; short: string }> = {
  "Krishnagiri Dairy Equipment": { city: "Krishnagiri", st: "TN", short: "Krishnagiri Dairy" },
  "Sipcot Pumps & Valves": { city: "Hosur", st: "TN", short: "Sipcot Pumps" },
  "Bagalur Hydraulics": { city: "Bagalur", st: "TN", short: "Bagalur Hyd." },
  "Anchetty Auto Components": { city: "Hosur", st: "TN", short: "Anchetty Auto" },
  "Rayakottai Food Processing": { city: "Rayakottai", st: "TN", short: "Rayakottai Food" },
  "Attibele Packaging Systems": { city: "Attibele", st: "KA", short: "Attibele Pack" },
  "Shoolagiri Forgings": { city: "Shoolagiri", st: "TN", short: "Shoolagiri Forg." },
  "Zuzuvadi Tooling": { city: "Hosur", st: "TN", short: "Zuzuvadi Tooling" },
  "Kelamangalam Textile Mills": { city: "Kelamangalam", st: "TN", short: "Kelamangalam Mills" },
  "Mathigiri Electricals": { city: "Hosur", st: "TN", short: "Mathigiri Elec." },
  "Thally Wind Components": { city: "Thally", st: "TN", short: "Thally Wind" },
  "Denkanikottai Agro Machines": { city: "Denkanikottai", st: "TN", short: "Denkanikottai Agro" },
  "Bommasandra Robotics": { city: "Bengaluru", st: "KA", short: "Bommasandra Robotics" },
};

function J(id: string, part: string, customer: string, qty: number, station: Station, dueH: number, value: number, kind: Kind, scale: number, over: number, rev: string, material: string, extra: Partial<Job> = {}): Job {
  return { id, part, customer, qty, station, dueH, value, kind, scale, over, rev, material, expedite: false, rework: 0, extra: 0, po: `PO/${customers[customer]?.short.split(" ")[0].toUpperCase().slice(0, 4)}/${id.slice(3)}`, ...extra };
}

const seedJobs: Job[] = [
  J("JC-2474", "Agitator assembly, SS316", "Krishnagiri Dairy Equipment", 1, "Dispatch", 20, 412000, "fab", 1.4, 1.08, "D", "SS316 sheet 3 mm, shaft Ø60"),
  J("JC-2477", "Pump base plate, MS 25 mm", "Sipcot Pumps & Valves", 6, "Dispatch", 26, 138000, "fab", 0.6, 0.95, "B", "IS 2062 E250 plate 25 mm"),
  J("JC-2479", "Hydraulic test fixture", "Bagalur Hydraulics", 1, "Test", 18, 268000, "fixture", 1, 1.12, "C", "EN24 block, MS base 20 mm"),
  J("JC-2480", "Gearbox mounting bracket", "Anchetty Auto Components", 40, "Test", 44, 176000, "machined", 0.9, 1, "B", "Al 6061-T6 plate 30 mm"),
  J("JC-2481", "SS304 conveyor frame, 3.2 m", "Rayakottai Food Processing", 2, "Assemble", 30, 386000, "fab", 1.6, 1.15, "C", "SS304 tube 40×40×2"),
  J("JC-2483", "Weld fixture, swing arm", "Anchetty Auto Components", 1, "Assemble", 52, 315000, "fixture", 1.2, 0.9, "A", "EN8 + MS plate 16 mm"),
  J("JC-2484", "Packaging machine guard set", "Attibele Packaging Systems", 4, "Assemble", 66, 154000, "fab", 0.8, 1, "B", "CRCA 1.6 mm + polycarbonate"),
  J("JC-2485", "Shaft EN8, ground Ø45 h6", "Shoolagiri Forgings", 120, "Fabricate", 40, 228000, "machined", 1.3, 1.05, "C", "EN8 round Ø50"),
  J("JC-2486", "Bending die set, 90°", "Zuzuvadi Tooling", 2, "Fabricate", 96, 192000, "machined", 1.1, 0.9, "B", "D2 tool steel, HRC 58–60"),
  J("JC-2488", "Bale press platen", "Kelamangalam Textile Mills", 1, "Fabricate", 120, 244000, "fab", 1.2, 1, "A", "IS 2062 plate 40 mm"),
  J("JC-2490", "Motor base frame, 75 kW", "Mathigiri Electricals", 3, "Fabricate", 58, 96000, "fab", 0.7, 1.2, "B", "ISMC 100 channel", { rework: 1 }),
  J("JC-2493", "Hydraulic manifold block, 6-port", "Bagalur Hydraulics", 8, "Fabricate", 22, 240000, "machined", 1.2, 1.1, "D", "EN8 block 120×90", { expedite: true }),
  J("JC-2494", "Tower flange drilling jig", "Thally Wind Components", 1, "Cut", 110, 360000, "fixture", 1.4, 1, "B", "MS plate 32 mm, EN31 bushes"),
  J("JC-2495", "Feed hopper, SS304 1.2 m³", "Rayakottai Food Processing", 2, "Cut", 134, 218000, "fab", 1.1, 1, "A", "SS304 sheet 2 mm"),
  J("JC-2496", "Cam follower bracket", "Denkanikottai Agro Machines", 60, "Cut", 150, 84000, "machined", 0.5, 1, "A", "EN8 flat 25×75"),
  J("JC-2497", "Robot gripper base plate", "Bommasandra Robotics", 10, "Design", 170, 132000, "machined", 0.7, 1, "A", "Al 6082 plate 20 mm"),
  J("JC-2498", "Control panel enclosure, IP55", "Mathigiri Electricals", 5, "Design", 190, 118000, "fab", 0.6, 1, "A", "CRCA 2 mm, powder coat RAL 7035"),
  J("JC-2499", "Inspection gauge, go/no-go", "Shoolagiri Forgings", 4, "Design", 210, 72000, "fixture", 0.4, 1, "A", "OHNS, hardened and ground"),
];

const ROUTES: Record<Kind, { op: string; machine: string; at: Station; h: number }[]> = {
  fab: [
    { op: "Drawing, nesting & BOM", machine: "SolidWorks + SigmaNEST", at: "Design", h: 3 },
    { op: "Laser cutting", machine: "Fibre laser 3 kW", at: "Cut", h: 1.5 },
    { op: "Bending", machine: "Press brake 100 T", at: "Cut", h: 1 },
    { op: "MIG / TIG welding", machine: "Weld bay 2", at: "Fabricate", h: 5 },
    { op: "Fitment & assembly", machine: "Fitting bay 1", at: "Assemble", h: 3 },
    { op: "Dimensional + load test", machine: "Test bench", at: "Test", h: 1 },
    { op: "Paint, pack & DC", machine: "Paint booth", at: "Dispatch", h: 1.5 },
  ],
  machined: [
    { op: "CAM programming", machine: "Mastercam", at: "Design", h: 2 },
    { op: "Bandsaw cutting", machine: "Bandsaw H-260", at: "Cut", h: 0.5 },
    { op: "CNC turning", machine: "LMW Smarturn", at: "Fabricate", h: 2.5 },
    { op: "VMC milling & drilling", machine: "BFW Gaurav 850", at: "Fabricate", h: 3.5 },
    { op: "Deburr & sub-assembly", machine: "Fitting bay 2", at: "Assemble", h: 1 },
    { op: "CMM / height gauge", machine: "Accurate CMM", at: "Test", h: 0.8 },
    { op: "Oil, pack & DC", machine: "Pack table", at: "Dispatch", h: 0.5 },
  ],
  fixture: [
    { op: "Fixture design + customer sign-off", machine: "SolidWorks", at: "Design", h: 8 },
    { op: "Laser + saw cutting", machine: "Fibre laser 3 kW", at: "Cut", h: 2 },
    { op: "VMC machining", machine: "Jyoti RDX 30", at: "Fabricate", h: 12 },
    { op: "Welding & stress relieve", machine: "Weld bay 1", at: "Fabricate", h: 4 },
    { op: "Assembly, dowelling", machine: "Fitting bay 1", at: "Assemble", h: 8 },
    { op: "Trial with customer part", machine: "Test bench", at: "Test", h: 3 },
    { op: "Pack & DC", machine: "Pack table", at: "Dispatch", h: 1 },
  ],
};

const revNotes = ["First issue from customer RFQ", "Hole pattern moved 12 mm per customer mark-up", "Weld symbols added, bore tightened to H7", "Material changed on customer request, new MTC needed"];

function half(n: number) {
  return Math.max(0.5, Math.round(n * 2) / 2);
}
function routing(j: Job) {
  const si = STATIONS.indexOf(j.station);
  return ROUTES[j.kind].map((r, i) => {
    const ri = STATIONS.indexOf(r.at);
    const plan = half(r.h * j.scale * (r.at === "Design" || r.at === "Dispatch" ? 1 : Math.max(1, Math.pow(j.qty, 0.35))));
    const booked = ri < si ? plan * j.over : ri === si ? plan * 0.45 * j.over + (ROUTES[j.kind].findIndex((x) => x.at === j.station) === i ? j.extra : 0) : 0;
    return { no: `${(i + 1) * 10}`, ...r, plan, booked: Math.round(booked * 10) / 10, state: ri < si ? "done" : ri === si ? "running" : "next" };
  });
}
function hoursOf(j: Job) {
  const r = routing(j);
  const earned = r.reduce((a, x) => a + (x.state === "done" ? x.plan : x.state === "running" ? x.plan * 0.45 : 0), 0);
  return { plan: r.reduce((a, x) => a + x.plan, 0), booked: r.reduce((a, x) => a + x.booked, 0), earned };
}
function dueLabel(h: number) {
  if (h <= 0) return "overdue";
  if (h < 24) return `${Math.round(h)}h`;
  return `${Math.floor(h / 24)}d ${Math.round(h % 24)}h`;
}
function dueTone(h: number): Tone {
  return h < 24 ? "late" : h < 48 ? "warn" : "neutral";
}
function nextStation(s: Station): Station | null {
  const i = STATIONS.indexOf(s);
  return i < STATIONS.length - 1 ? STATIONS[i + 1] : null;
}

type NcrStage = "Open" | "Containment" | "Root cause" | "CAPA" | "Closed";
type Ncr = { id: string; job: string; part: string; customer: string; defect: string; stage: NcrStage; found: string; qty: number; cost: number; owner: string; cause: string; disposition: "Rework" | "Use as is" | "Scrap" | "Pending" };
const seedNcrs: Ncr[] = [
  { id: "NCR-126", job: "JC-2481", part: "SS304 conveyor frame", customer: "Rayakottai Food Processing", defect: "Weld porosity on 3 cross-members", stage: "Root cause", found: "Test · today 9:40", qty: 3, cost: 14200, owner: "Deepa", cause: "ER308L wire lot 2207 stored open; moisture suspected", disposition: "Rework" },
  { id: "NCR-125", job: "JC-2490", part: "Motor base frame", customer: "Mathigiri Electricals", defect: "Flatness 0.6 mm vs 0.3 mm allowed", stage: "CAPA", found: "Test · yesterday", qty: 1, cost: 6800, owner: "Arul", cause: "No tack sequence on drawing; frame pulled during welding", disposition: "Rework" },
  { id: "NCR-124", job: "JC-2480", part: "Gearbox mounting bracket", customer: "Anchetty Auto Components", defect: "Ø22 H7 bore oversize +0.03 on 4 pcs", stage: "Containment", found: "CMM · 18 Oct", qty: 4, cost: 9600, owner: "Murugan", cause: "Boring bar insert worn; tool life counter not set", disposition: "Pending" },
  { id: "NCR-123", job: "JC-2477", part: "Pump base plate", customer: "Sipcot Pumps & Valves", defect: "M16 tapped holes: 2 failed NoGo gauge", stage: "Closed", found: "Final · 16 Oct", qty: 1, cost: 1900, owner: "Deepa", cause: "Wrong tap drill (13.5 vs 14.0) picked from rack", disposition: "Rework" },
  { id: "NCR-122", job: "JC-2474", part: "Agitator assembly", customer: "Krishnagiri Dairy Equipment", defect: "Surface finish Ra 1.6 not met on shaft", stage: "Closed", found: "Final · 15 Oct", qty: 1, cost: 4200, owner: "Murugan", cause: "Feed too high on finish pass", disposition: "Rework" },
  { id: "NCR-121", job: "JC-2466", part: "Chute liner set", customer: "Kelamangalam Textile Mills", defect: "Customer complaint: 2 liners 5 mm short", stage: "CAPA", found: "Customer · 12 Oct", qty: 2, cost: 11800, owner: "Meena", cause: "Drawing rev B used on floor instead of rev C", disposition: "Scrap" },
  { id: "NCR-120", job: "JC-2463", part: "Fixture plate, 6-station", customer: "Anchetty Auto Components", defect: "Paint DFT 45 µm vs 60 µm", stage: "Open", found: "Final · 19 Oct", qty: 1, cost: 2100, owner: "Vignesh", cause: "", disposition: "Pending" },
];

type Shipped = { id: string; part: string; customer: string; value: number; at: string; invoiced: boolean };
const seedShipped: Shipped[] = [
  { id: "JC-2468", part: "Spray booth exhaust duct", customer: "Kelamangalam Textile Mills", value: 182000, at: "Yesterday 6:10 PM", invoiced: false },
  { id: "JC-2471", part: "Fixture plate, 6-station", customer: "Anchetty Auto Components", value: 96000, at: "Today 9:05 AM", invoiced: false },
];

/* ---------------- Shared shop state ---------------- */

type Shop = {
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  ncrs: Ncr[];
  setNcrs: React.Dispatch<React.SetStateAction<Ncr[]>>;
  shipped: Shipped[];
  setShipped: React.Dispatch<React.SetStateAction<Shipped[]>>;
  live: boolean;
  setLive: React.Dispatch<React.SetStateAction<boolean>>;
};
const ShopContext = React.createContext<Shop | null>(null);
function useShop() {
  const c = React.useContext(ShopContext);
  if (!c) throw new Error("ShopContext missing");
  return c;
}

function useShopActions() {
  const desk = useDesk();
  const shop = useShop();
  const { jobs, setJobs, ncrs, setNcrs, setShipped } = shop;

  const move = (id: string, to: Station, quiet = false) => {
    const job = jobs.find((j) => j.id === id);
    if (!job || job.station === to) return false;
    const load = jobs.filter((j) => j.station === to).length;
    if (load >= WIP[to] && !job.expedite) {
      if (!quiet) toast.warning(`${to} is at its WIP limit`, { description: `${load} of ${WIP[to]} jobs. Flag ${id} as expedite to push it through anyway.` });
      return false;
    }
    setJobs((cur) => cur.map((j) => (j.id === id ? { ...j, station: to } : j)));
    if (!quiet) toast.success(`${id} → ${to}`, { description: `${job.part} · ${stationMeta[to].who} told on WhatsApp` });
    desk.log(`${quiet ? "Floor: " : ""}${id} ${job.part} moved to ${to}${load >= WIP[to] ? " (expedite, over WIP)" : ""}`, load >= WIP[to] ? "warn" : "info");
    return true;
  };
  const ship = (id: string) => {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;
    setJobs((cur) => cur.filter((j) => j.id !== id));
    setShipped((cur) => [{ id, part: job.part, customer: job.customer, value: job.value, at: `Today ${clockLabel(new Date())}`, invoiced: false }, ...cur]);
    toast.success(`${id} dispatched`, { description: `${job.part} to ${job.customer}. Ready for invoice and e-way bill.` });
    desk.log(`${id} dispatched to ${job.customer}, ${inr(job.value, { compact: true })}`, "ok");
  };
  const advance = (id: string) => {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;
    const to = nextStation(job.station);
    if (!to) ship(id);
    else move(id, to);
  };
  const expedite = (id: string) => {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;
    setJobs((cur) => cur.map((j) => (j.id === id ? { ...j, expedite: !j.expedite } : j)));
    toast(job.expedite ? `${id} back to normal priority` : `${id} flagged expedite`, { description: job.expedite ? "It waits for WIP like everyone else." : "It can jump WIP limits and goes first on every machine." });
    desk.log(`${id} ${job.expedite ? "expedite removed" : "flagged expedite"}`, job.expedite ? "info" : "warn");
  };
  const rework = (id: string, defect: string) => {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;
    setJobs((cur) => cur.map((j) => (j.id === id ? { ...j, station: "Fabricate", rework: j.rework + 1 } : j)));
    const ncrId = `NCR-${127 + ncrs.length - seedNcrs.length}`;
    setNcrs((cur) => [{ id: ncrId, job: id, part: job.part, customer: job.customer, defect, stage: "Open", found: `${job.station} · ${clockLabel(new Date())}`, qty: Math.max(1, Math.round(job.qty / 4)), cost: Math.round(job.value * 0.03), owner: "Deepa", cause: "", disposition: "Rework" }, ...cur]);
    toast.error(`${id} sent back to Fabricate`, { description: `${defect}. ${ncrId} raised for Deepa.` });
    desk.log(`${id} into the rework loop: ${defect} (${ncrId})`, "late");
  };
  const bookHour = (id: string) => {
    setJobs((cur) => cur.map((j) => (j.id === id ? { ...j, extra: j.extra + 1 } : j)));
    desk.log(`1 h booked on ${id}`);
  };
  return { ...shop, move, advance, expedite, rework, ship, bookHour };
}

/* ---------------- Machines, quotes, materials, billing ---------------- */

type MStatus = "Running" | "Setup" | "Idle" | "Breakdown";
type Machine = { id: string; name: string; make: string; status: MStatus; job: string; operator: string; a: number; p: number; q: number; load: number; hoursToday: number; week: number[] };
const seedMachines: Machine[] = [
  { id: "VMC-1", name: "VMC-1", make: "BFW Gaurav 850", status: "Running", job: "JC-2493 manifold", operator: "Murugan", a: 88, p: 84, q: 97, load: 78, hoursToday: 6.4, week: [96, 104, 92, 88, 72, 40, 0] },
  { id: "VMC-2", name: "VMC-2", make: "Jyoti RDX 30", status: "Running", job: "JC-2486 die set", operator: "Saravanan", a: 91, p: 80, q: 99, load: 71, hoursToday: 6.8, week: [88, 92, 96, 81, 76, 52, 0] },
  { id: "CNC-1", name: "CNC-1", make: "LMW Smarturn", status: "Running", job: "JC-2485 shafts 62/120", operator: "Prakash", a: 93, p: 88, q: 96, load: 82, hoursToday: 7.1, week: [102, 110, 98, 70, 64, 30, 0] },
  { id: "CNC-2", name: "CNC-2", make: "Ace Jobber XL", status: "Setup", job: "JC-2496 brackets", operator: "Karthikeyan", a: 74, p: 82, q: 98, load: 22, hoursToday: 4.2, week: [64, 88, 90, 92, 60, 24, 0] },
  { id: "LSR-1", name: "Laser", make: "Bodor fibre laser 3 kW", status: "Running", job: "JC-2495 hopper nest", operator: "Ravi", a: 86, p: 90, q: 99, load: 66, hoursToday: 5.9, week: [70, 76, 84, 58, 66, 20, 0] },
  { id: "PB-1", name: "Press brake", make: "Hindustan Hydraulics 100 T", status: "Idle", job: "Waiting on laser", operator: "Ravi", a: 62, p: 78, q: 99, load: 0, hoursToday: 2.1, week: [40, 48, 52, 36, 44, 10, 0] },
  { id: "WLD-1", name: "Weld bay 1", make: "ESAB MIG 400 + TIG", status: "Running", job: "JC-2488 platen", operator: "Arul", a: 90, p: 76, q: 94, load: 74, hoursToday: 6.6, week: [92, 98, 100, 94, 80, 46, 0] },
  { id: "WLD-2", name: "Weld bay 2", make: "Kemppi MIG 350", status: "Breakdown", job: "JC-2490 frame (stopped)", operator: "Selvam", a: 58, p: 80, q: 91, load: 0, hoursToday: 3.0, week: [108, 112, 104, 96, 88, 50, 0] },
  { id: "GRD-1", name: "Grinder", make: "Praga surface grinder", status: "Running", job: "JC-2485 shaft seats", operator: "Prakash", a: 84, p: 86, q: 99, load: 58, hoursToday: 5.2, week: [60, 70, 72, 54, 50, 18, 0] },
  { id: "DRL-1", name: "Radial drill", make: "Batliboi BR-618", status: "Idle", job: "—", operator: "Selvam", a: 70, p: 72, q: 100, load: 0, hoursToday: 1.4, week: [30, 44, 50, 62, 40, 12, 0] },
];
const weekCols = ["Tue 20", "Wed 21", "Thu 22", "Fri 23", "Sat 24", "Sun 25", "Mon 26"];

type Breakdown = { id: string; date: string; machine: string; issue: string; mins: number; cause: "Electrical" | "Hydraulic" | "Spindle" | "Tooling" | "Coolant" | "Wire feed"; fixedBy: string; cost: number; open: boolean };
const seedBreakdowns: Breakdown[] = [
  { id: "BD-061", date: "Today 10:20", machine: "Weld bay 2", issue: "Wire feeder motor not pulling, arc dropping", mins: 95, cause: "Wire feed", fixedBy: "Kemppi service, Bengaluru", cost: 0, open: true },
  { id: "BD-060", date: "18 Oct", machine: "VMC-1", issue: "Spindle vibration alarm at 6,000 rpm", mins: 140, cause: "Spindle", fixedBy: "In-house + BFW remote", cost: 4800, open: false },
  { id: "BD-059", date: "16 Oct", machine: "CNC-2", issue: "Turret indexing fault, alarm 2041", mins: 210, cause: "Electrical", fixedBy: "Ace Micromatic service", cost: 12600, open: false },
  { id: "BD-058", date: "14 Oct", machine: "Press brake", issue: "Hydraulic oil leak at ram seal", mins: 320, cause: "Hydraulic", fixedBy: "Sri Murugan Hydraulics", cost: 8900, open: false },
  { id: "BD-057", date: "11 Oct", machine: "Laser", issue: "Nozzle crash, protective lens cracked", mins: 60, cause: "Tooling", fixedBy: "Ravi (in-house)", cost: 3200, open: false },
  { id: "BD-056", date: "9 Oct", machine: "VMC-2", issue: "Coolant pump tripping, MCB", mins: 45, cause: "Coolant", fixedBy: "Electrician Babu", cost: 1800, open: false },
  { id: "BD-055", date: "6 Oct", machine: "CNC-1", issue: "Chuck pressure low, jaws slipping", mins: 85, cause: "Hydraulic", fixedBy: "In-house", cost: 2400, open: false },
  { id: "BD-054", date: "3 Oct", machine: "Weld bay 1", issue: "Earth cable burnt at clamp", mins: 30, cause: "Electrical", fixedBy: "Arul (in-house)", cost: 900, open: false },
  { id: "BD-053", date: "1 Oct", machine: "VMC-1", issue: "ATC tool drop, pocket 14", mins: 180, cause: "Spindle", fixedBy: "BFW service engineer", cost: 15400, open: false },
];

type QStatus = "Drafting" | "Sent" | "Negotiating" | "Won" | "Lost";
type Quote = { id: string; customer: string; part: string; qty: number; value: number; margin: number; ageH: number; status: QStatus; by: string; source: "Email" | "WhatsApp" | "IndiaMART" | "Visit"; replyBy: number; reason?: string };
const seedQuotes: Quote[] = [
  { id: "Q-0921", customer: "Thally Wind Components", part: "Nacelle lifting frame ×2", qty: 2, value: 680000, margin: 24, ageH: 76, status: "Negotiating", by: "Meena", source: "Email", replyBy: 6 },
  { id: "Q-0924", customer: "Bommasandra Robotics", part: "Gripper plates, 4 variants", qty: 40, value: 212000, margin: 31, ageH: 30, status: "Sent", by: "Meena", source: "Email", replyBy: 42 },
  { id: "Q-0925", customer: "Sipcot Pumps & Valves", part: "Impeller casing machining", qty: 150, value: 465000, margin: 22, ageH: 50, status: "Sent", by: "Senthil", source: "Visit", replyBy: 22 },
  { id: "Q-0926", customer: "Attibele Packaging Systems", part: "Guard set repeat + 2 new", qty: 6, value: 236000, margin: 27, ageH: 8, status: "Drafting", by: "Meena", source: "WhatsApp", replyBy: 16 },
  { id: "Q-0927", customer: "Hosur Agro Implements", part: "Rotavator side plates", qty: 300, value: 318000, margin: 18, ageH: 4, status: "Drafting", by: "Meena", source: "IndiaMART", replyBy: 20 },
  { id: "Q-0918", customer: "Krishnagiri Dairy Equipment", part: "Milk silo agitator ×3", qty: 3, value: 1140000, margin: 26, ageH: 140, status: "Negotiating", by: "Senthil", source: "Visit", replyBy: 30 },
  { id: "Q-0919", customer: "Denkanikottai Agro Machines", part: "Cam bracket repeat", qty: 200, value: 262000, margin: 21, ageH: 96, status: "Sent", by: "Meena", source: "WhatsApp", replyBy: -4 },
  { id: "Q-0915", customer: "Anchetty Auto Components", part: "Weld fixture, swing arm", qty: 1, value: 315000, margin: 29, ageH: 312, status: "Won", by: "Senthil", source: "Visit", replyBy: 0 },
  { id: "Q-0914", customer: "Mathigiri Electricals", part: "Panel enclosures IP55", qty: 5, value: 118000, margin: 25, ageH: 290, status: "Won", by: "Meena", source: "Email", replyBy: 0 },
  { id: "Q-0912", customer: "Electronic City Precision", part: "Aluminium housings", qty: 500, value: 890000, margin: 15, ageH: 360, status: "Lost", by: "Senthil", source: "IndiaMART", replyBy: 0, reason: "Price: Peenya shop at 11% lower" },
  { id: "Q-0911", customer: "Kelamangalam Textile Mills", part: "Bale press platen", qty: 1, value: 244000, margin: 23, ageH: 400, status: "Won", by: "Senthil", source: "WhatsApp", replyBy: 0 },
  { id: "Q-0909", customer: "Shoolagiri Forgings", part: "Trim die set", qty: 1, value: 520000, margin: 20, ageH: 430, status: "Lost", by: "Meena", source: "Email", replyBy: 0, reason: "Lead time: needed in 10 days" },
  { id: "Q-0907", customer: "Bagalur Hydraulics", part: "Manifold blocks, 6-port", qty: 8, value: 240000, margin: 28, ageH: 470, status: "Won", by: "Meena", source: "Email", replyBy: 0 },
];
const qTone: Record<QStatus, Tone> = { Drafting: "neutral", Sent: "info", Negotiating: "warn", Won: "ok", Lost: "late" };

type Mat = { code: string; item: string; unit: "kg" | "nos" | "m" | "L"; stock: number; need: number; rate: number; supplier: string; lead: string; mtc: boolean; jobs: string };
const seedMats: Mat[] = [
  { code: "RM-101", item: "EN8 round bar Ø50", unit: "kg", stock: 420, need: 1260, rate: 82, supplier: "Sri Balaji Steels, Hosur", lead: "2 days", mtc: true, jobs: "JC-2485, JC-2493" },
  { code: "RM-104", item: "IS 2062 E250 plate 25 mm", unit: "kg", stock: 2150, need: 1480, rate: 68, supplier: "Krishna Metals, Bengaluru", lead: "1 day", mtc: true, jobs: "JC-2477, JC-2488" },
  { code: "RM-107", item: "IS 2062 plate 40 mm", unit: "kg", stock: 600, need: 940, rate: 71, supplier: "Krishna Metals, Bengaluru", lead: "2 days", mtc: true, jobs: "JC-2488" },
  { code: "RM-112", item: "SS304 sheet 2 mm (2B)", unit: "kg", stock: 380, need: 520, rate: 248, supplier: "Sakthi Alloys, Coimbatore", lead: "3 days", mtc: true, jobs: "JC-2495" },
  { code: "RM-113", item: "SS304 tube 40×40×2", unit: "m", stock: 84, need: 72, rate: 610, supplier: "Sakthi Alloys, Coimbatore", lead: "3 days", mtc: true, jobs: "JC-2481" },
  { code: "RM-120", item: "Al 6082 plate 20 mm", unit: "kg", stock: 0, need: 96, rate: 395, supplier: "Hindalco stockist, Peenya", lead: "4 days", mtc: false, jobs: "JC-2497" },
  { code: "RM-125", item: "D2 tool steel block", unit: "kg", stock: 140, need: 110, rate: 540, supplier: "Bohler Udd dealer, Bengaluru", lead: "5 days", mtc: true, jobs: "JC-2486" },
  { code: "RM-131", item: "CRCA sheet 2 mm", unit: "kg", stock: 260, need: 410, rate: 74, supplier: "Krishna Metals, Bengaluru", lead: "1 day", mtc: false, jobs: "JC-2498, JC-2484" },
  { code: "CN-201", item: "ER308L TIG wire 2.4 mm", unit: "kg", stock: 6, need: 18, rate: 1150, supplier: "Ador Welding, Hosur", lead: "1 day", mtc: true, jobs: "JC-2481, JC-2495" },
  { code: "CN-204", item: "MIG wire ER70S-6 1.2 mm", unit: "kg", stock: 90, need: 60, rate: 128, supplier: "Ador Welding, Hosur", lead: "1 day", mtc: false, jobs: "Weld bays" },
  { code: "TL-301", item: "CNMG 120408 inserts", unit: "nos", stock: 24, need: 60, rate: 420, supplier: "Taegutec dealer, Peenya", lead: "2 days", mtc: false, jobs: "CNC-1, CNC-2" },
  { code: "TL-305", item: "Ø10 carbide end mill, 4F", unit: "nos", stock: 5, need: 8, rate: 2650, supplier: "Taegutec dealer, Peenya", lead: "2 days", mtc: false, jobs: "VMC-1, VMC-2" },
  { code: "CN-210", item: "Servo cut coolant", unit: "L", stock: 140, need: 80, rate: 210, supplier: "Hosur Lubes & Tools", lead: "same day", mtc: false, jobs: "All CNC" },
  { code: "HW-401", item: "M16 × 60 HT bolts, 8.8", unit: "nos", stock: 180, need: 240, rate: 22, supplier: "Hosur Fasteners", lead: "same day", mtc: false, jobs: "JC-2481, JC-2488" },
];
type PO = { no: string; supplier: string; item: string; qty: number; unit: string; amount: number; eta: string; status: "Sent" | "Confirmed" | "In transit" | "Received" };
const seedPOs: PO[] = [
  { no: "KPW/PO/1184", supplier: "Sakthi Alloys, Coimbatore", item: "SS304 sheet 2 mm", qty: 300, unit: "kg", amount: 87792, eta: "Thu", status: "In transit" },
  { no: "KPW/PO/1183", supplier: "Ador Welding, Hosur", item: "MIG wire ER70S-6", qty: 75, unit: "kg", amount: 11328, eta: "Today", status: "Confirmed" },
  { no: "KPW/PO/1181", supplier: "Bohler Udd dealer, Bengaluru", item: "D2 tool steel block", qty: 120, unit: "kg", amount: 76464, eta: "Received 17 Oct", status: "Received" },
];

type Inv = { no: string; customer: string; job: string; taxable: number; days: number; terms: string; eway: string; promise?: string };
const seedInvoices: Inv[] = [
  { no: "KPW/26-27/0412", customer: "Bagalur Hydraulics", job: "JC-2458 fixture", taxable: 348000, days: 74, terms: "45 days", eway: "EWB 3318 4402 9917" },
  { no: "KPW/26-27/0419", customer: "Krishnagiri Dairy Equipment", job: "JC-2461 agitator", taxable: 395000, days: 52, terms: "60 days", eway: "EWB 3318 4511 0274", promise: "RTGS on 25 Oct" },
  { no: "KPW/26-27/0423", customer: "Anchetty Auto Components", job: "JC-2463 fixture plate", taxable: 92000, days: 41, terms: "30 days", eway: "EWB 3318 4620 7731" },
  { no: "KPW/26-27/0426", customer: "Sipcot Pumps & Valves", job: "JC-2464 base plates", taxable: 126000, days: 36, terms: "45 days", eway: "EWB 3318 4688 1502" },
  { no: "KPW/26-27/0428", customer: "Attibele Packaging Systems", job: "JC-2465 guards", taxable: 148000, days: 33, terms: "30 days", eway: "EWB 2918 1104 6623", promise: "Cheque Friday" },
  { no: "KPW/26-27/0430", customer: "Kelamangalam Textile Mills", job: "JC-2466 chute liners", taxable: 204000, days: 29, terms: "30 days", eway: "EWB 3318 4791 2280" },
  { no: "KPW/26-27/0402", customer: "Thally Wind Components", job: "JC-2449 lifting lugs", taxable: 288000, days: 96, terms: "60 days", eway: "EWB 3318 3907 4419" },
  { no: "KPW/26-27/0434", customer: "Shoolagiri Forgings", job: "JC-2469 gauges", taxable: 58000, days: 18, terms: "30 days", eway: "—" },
  { no: "KPW/26-27/0436", customer: "Mathigiri Electricals", job: "JC-2470 frames", taxable: 84000, days: 12, terms: "30 days", eway: "EWB 3318 4905 6612" },
  { no: "KPW/26-27/0397", customer: "Denkanikottai Agro Machines", job: "JC-2441 brackets", taxable: 168000, days: 112, terms: "45 days", eway: "EWB 3318 3720 8801", promise: "Half now, half Diwali" },
  { no: "KPW/26-27/0438", customer: "Bommasandra Robotics", job: "JC-2472 sample plates", taxable: 46000, days: 6, terms: "Advance 50%", eway: "—" },
];
function gstFor(customer: string, taxable: number) {
  const inter = customers[customer]?.st === "KA";
  return inter ? { label: "IGST 18%", igst: taxable * 0.18, cgst: 0, sgst: 0, total: taxable * 1.18, inter } : { label: "CGST 9% + SGST 9%", igst: 0, cgst: taxable * 0.09, sgst: taxable * 0.09, total: taxable * 1.18, inter };
}

const team: TeamMember[] = [
  { name: "Senthil Rajendran", role: "Owner, MD", status: "Busy", load: 92, focus: "Thally Wind counter-offer and the Bagalur dues call", tasks: [{ title: "Counter on Q-0921", due: "11:30" }, { title: "Call Bagalur accounts", due: "2:00" }, { title: "Sign EN8 PO", due: "2:00" }], week: [1, 1, 1, 1, 1, 1], since: "2004" },
  { name: "Meena Ramachandran", role: "Planning & quotes", status: "Busy", load: 84, focus: "5 quotes to send, CAM for JC-2497", tasks: [{ title: "Q-0926 Attibele guards", due: "12:00" }, { title: "Q-0927 rotavator plates", due: "4:00" }, { title: "CAM JC-2497", due: "6:00", done: false }], week: [1, 1, 1, 1, 1, 0], since: "2014" },
  { name: "Karthik Gowda", role: "Production supervisor, shift A", status: "On floor", load: 88, focus: "Fabricate over WIP; re-sequencing VMC-1 for the manifold", tasks: [{ title: "Re-sequence VMC-1", due: "now" }, { title: "Night shift plan", due: "5:30" }], week: [1, 1, 1, 1, 1, 1], since: "2012" },
  { name: "Murugan P", role: "VMC setter, shift A", status: "On floor", load: 80, focus: "JC-2493 manifold, op 40 of 70", tasks: [{ title: "Insert change, boring bar", due: "11:00", done: true }, { title: "First-off to CMM", due: "1:00" }], week: [1, 1, 1, 1, 1, 1], since: "2016" },
  { name: "Arul Selvam", role: "Fabrication foreman", status: "On floor", load: 90, focus: "Weld bay 2 down; moving JC-2490 to bay 1", tasks: [{ title: "Re-weld NCR-126 frames", due: "3:00" }, { title: "Tack sequence sheet for frames", due: "Thu" }], week: [1, 1, 1, 1, 1, 1], since: "2009" },
  { name: "Deepa Sundaram", role: "Quality engineer", status: "Busy", load: 76, focus: "NCR-126 root cause, wire lot 2207", tasks: [{ title: "CMM report JC-2480", due: "12:30" }, { title: "Wire lot quarantine", due: "now", done: true }, { title: "CAPA NCR-125", due: "Fri" }], week: [1, 1, 1, 1, 1, 0], since: "2019" },
  { name: "Vignesh R", role: "Stores, purchase & dispatch", status: "In field", load: 64, focus: "At Sri Balaji Steels for EN8 lot inspection", tasks: [{ title: "EN8 MTC check", due: "11:00" }, { title: "Book tempo for Krishnagiri", due: "3:00" }], week: [1, 1, 0, 1, 1, 1], since: "2018" },
  { name: "Lakshmi Narayanan", role: "Accounts & billing", status: "Busy", load: 70, focus: "2 invoices + e-way bills; GSTR-1 for October", tasks: [{ title: "Invoice JC-2468, JC-2471", due: "1:00" }, { title: "Dues call list", due: "4:30" }], week: [1, 1, 1, 1, 1, 0], since: "2015" },
];

const agents: WorkforceAgent[] = [
  { name: "Job Router", role: "Sequences every job card through the stations and machines", icon: Cog, status: "Needs you", runsToday: 18, hoursSaved: 5.5, accuracy: 92, last: "3 min ago", skills: ["Routing", "WIP limits", "Machine load"], schedule: "Every 20 min, both shifts", inbox: [{ title: "Expedite the Bagalur manifold through VMC-1 tonight?", detail: "JC-2488 platen has 3 days of float and can wait 6 hours. Fabricate goes over WIP by 1 until 9 PM." }], log: ["Moved JC-2490 from weld bay 2 to bay 1", "Flagged Fabricate at 5 of 4", "Re-planned CNC-1: shafts before brackets"] },
  { name: "Quote Desk", role: "Builds cost sheets from drawings and chases replies", icon: Calculator, status: "Needs you", runsToday: 7, hoursSaved: 6, accuracy: 88, last: "25 min ago", skills: ["Drawing read", "Machine-hour rates", "WhatsApp"], schedule: "On every RFQ, follow-ups at 10 and 4", inbox: [{ title: "Q-0919 has gone past its reply date", detail: "Denkanikottai Agro last opened it 2 days ago. Drafted a nudge with a 7-day price hold." }], log: ["Drafted cost sheet for Q-0927 from PDF", "Compared Q-0921 to last 4 frame jobs: margin 24%", "Sent 3 follow-ups"] },
  { name: "Material Planner", role: "Matches open jobs to stock and drafts POs", icon: Boxes, status: "Running", runsToday: 5, hoursSaved: 3.5, accuracy: 94, last: "40 min ago", skills: ["BOM", "MTC tracking", "Tally PO"], schedule: "After every new job card", log: ["EN8 Ø50 short 840 kg for 2 jobs", "Al 6082 nil stock for JC-2497", "TIG wire below 1 week of cover"] },
  { name: "Spindle Watch", role: "Reads machine sensors and flags OEE losses", icon: GaugeIcon, status: "Running", runsToday: 24, hoursSaved: 2.5, accuracy: 96, last: "just now", skills: ["IoT sensors", "OEE", "Vibration"], schedule: "Live, summary every hour", log: ["VMC-1 vibration +18% this week", "Press brake idle 2 h, waiting on laser", "CNC-2 setup 70 min, target 40"] },
  { name: "NCR Scribe", role: "Turns inspection photos and notes into NCRs and 8D drafts", icon: ShieldCheck, status: "Running", runsToday: 6, hoursSaved: 3, accuracy: 90, last: "1 h ago", skills: ["Photos", "5-why", "CAPA"], schedule: "On every reject at Test", log: ["Raised NCR-126 from Deepa's photos", "Linked NCR-121 to drawing rev mix-up", "CAPA reminder for NCR-125"] },
  { name: "Billing Clerk", role: "Raises GST invoices, e-way bills and chases dues", icon: Receipt, status: "Idle", runsToday: 3, hoursSaved: 4, accuracy: 93, last: "2 h ago", skills: ["Tally", "E-way bill", "WhatsApp"], schedule: "On dispatch, dues daily 5 PM", log: ["E-way bill for JC-2466", "Logged Krishnagiri RTGS promise", "Escalated Denkanikottai at 112 days"] },
];

const independence: IndependenceData = {
  score: 31,
  history: [18, 20, 22, 24, 26, 29, 31],
  quote: "Every quote above two lakh still goes through me, because once we quoted a fixture at half the machine hours and lost money for three months.",
  pillars: [
    { name: "Quotes & pricing", score: 24, note: "Senthil prices anything above ₹2 L himself. Average reply 3.1 days.", fixes: [{ title: "Machine-hour rate card in Quote Desk", gain: 4 }, { title: "Margin floor 20%, auto-approve above", gain: 3 }] },
    { name: "Planning & routing", score: 33, note: "Karthik sequences machines from memory and a whiteboard.", fixes: [{ title: "Job Router owns sequencing", gain: 3 }, { title: "WIP limits on every station", gain: 2 }] },
    { name: "Quality", score: 41, note: "Deepa raises NCRs, but CAPA closure waits for the owner.", fixes: [{ title: "CAPA owner is the foreman", gain: 2 }] },
    { name: "Purchase", score: 28, note: "Every steel PO needs a signature; EN8 stockouts twice this month.", fixes: [{ title: "Auto-approve under ₹50k from approved vendors", gain: 3 }, { title: "Min-max for 8 fast movers", gain: 2 }] },
    { name: "Money & dues", score: 30, note: "₹23 L outstanding; follow-ups happen when Senthil remembers.", fixes: [{ title: "Billing Clerk chases daily", gain: 3 }] },
    { name: "Maintenance", score: 36, note: "Breakdowns are fixed fast, but there is no PM calendar.", fixes: [{ title: "PM plan from Spindle Watch", gain: 2 }] },
    { name: "Owner time", score: 25, note: "Owner spends 16 hours a week on quotes and floor fire-fighting.", fixes: [{ title: "Two decision windows a day", gain: 2 }] },
  ],
  ownerHours: [
    { label: "Quotes", hours: 10 },
    { label: "Floor", hours: 9 },
    { label: "Customers", hours: 8 },
    { label: "Purchase", hours: 5 },
    { label: "Dues", hours: 4 },
    { label: "Hiring", hours: 2 },
    { label: "Strategy", hours: 1 },
  ],
};

const integrations: Integration[] = [
  { name: "Tally Prime", category: "Accounts", status: "Connected", detail: "Invoices, POs, stock ledgers and customer outstanding.", synced: "4 min ago", records: "9,420 vouchers", mark: "T", color: "#1c4f9c" },
  { name: "WhatsApp Business", category: "Messaging", status: "Connected", detail: "Floor groups, drawing approvals, quote follow-ups.", synced: "just now", records: "1,860 chats", mark: "W", color: "#1f9d55" },
  { name: "E-way bill (NIC)", category: "Compliance", status: "Connected", detail: "E-way bills generated on dispatch above ₹50,000.", synced: "1 h ago", records: "312 this year", mark: "EW", color: "#6b4f2a" },
  { name: "Spindle sensors", category: "Machines", status: "Syncing", detail: "Current + vibration clamps on 10 machines.", synced: "live", records: "10 machines", mark: "IoT", color: "#b4532a" },
  { name: "SolidWorks PDM", category: "Drawings", status: "Connected", detail: "Drawing numbers and revisions, read-only on the floor.", synced: "15 min ago", records: "2,140 drawings", mark: "SW", color: "#c8102e" },
  { name: "Accurate CMM", category: "Quality", status: "Connected", detail: "Inspection reports attach to the job card.", synced: "22 min ago", records: "84 reports", mark: "CMM", color: "#2f5d8a" },
  { name: "eSSL biometric", category: "People", status: "Connected", detail: "Shift punches for 46 people.", synced: "8:52 AM", records: "41 punches", mark: "B", color: "#7a3fa0" },
  { name: "IndiaMART", category: "Leads", status: "Error", detail: "Lead API key expired; RFQs not flowing to Quote Desk.", synced: "3 days ago", records: "—", mark: "IM", color: "#2e3192" },
  { name: "Gmail", category: "Messaging", status: "Connected", detail: "Customer POs and drawings parsed into job cards.", synced: "9 min ago", records: "1,120 threads", mark: "G", color: "#ea4335" },
  { name: "V-Trans / local tempo", category: "Logistics", status: "Available", detail: "Book trucks and share LR numbers with customers.", synced: "—", records: "—", mark: "VT", color: "#d97706" },
];

/* ============================================================
   Config
   ============================================================ */

const decisions: Decision[] = [
  { id: "d1", kind: "Approve", title: "Expedite JC-2493 manifold blocks for Bagalur Hydraulics", context: "Their press line is down waiting on these 8 blocks. Fabricate is already at 5 of 4 and VMC-1 is booked till Thursday.", recommendation: "Run it on VMC-1 tonight in shift B. JC-2488 platen has 3 days of float and slips only 6 hours.", impact: "₹2.4 L", from: "Job Router", module: "jobs", approveLabel: "Expedite tonight" },
  { id: "d2", kind: "Reply", title: "Thally Wind wants 6% off the ₹6.8 L lifting-frame quote", context: "Q-0921 is at 24% margin. They quoted a Coimbatore shop as the alternative.", recommendation: "Counter at 3% with 30-day payment instead of 60. Margin stays at 21% and cash comes a month earlier.", impact: "₹6.8 L", from: "Quote Desk", module: "quotes", approveLabel: "Send counter" },
  { id: "d3", kind: "Money", title: "Bagalur Hydraulics owes ₹4.1 L at 74 days", context: "Terms are 45 days. They have a new manifold order on the belt right now.", recommendation: "Send a firm reminder today and hold the JC-2493 dispatch until half is paid. Lakshmi has the draft.", impact: "₹4.1 L", from: "Billing Clerk", module: "dispatch", approveLabel: "Send reminder" },
  { id: "d4", kind: "Risk", title: "VMC-1 spindle vibration is up 18% this week", context: "Same pattern as before the ATC failure on 1 Oct, which cost 3 hours and ₹15,400.", recommendation: "Book BFW for a bearing check on Sunday, when the machine is free. ₹6,500 visit.", from: "Spindle Watch", module: "machines", approveLabel: "Book Sunday" },
  { id: "d5", kind: "Approve", title: "PO for 900 kg of EN8 round bar, ₹87,084", context: "Two jobs need 1,260 kg; 420 kg in stock. Sri Balaji Steels is the lowest of 3 quotes at ₹82/kg with MTC.", recommendation: "Approve. Delivery by Thursday keeps the shafts on plan.", impact: "₹87k", from: "Material Planner", module: "materials", approveLabel: "Approve PO" },
  { id: "d6", kind: "Risk", title: "NCR-126: weld porosity on 3 conveyor frames", context: "Rayakottai's frames are due in 30 hours. Deepa traced it to TIG wire lot 2207, stored open.", recommendation: "Quarantine lot 2207, re-weld on bay 1 today, and add a wire-oven rule to the weld SOP.", impact: "₹14k", from: "NCR Scribe", module: "quality", approveLabel: "Quarantine + re-weld" },
  { id: "d7", kind: "People", title: "Murugan asks for Saturday off for a family function", context: "He is the only VMC setter on shift A. Saturday has the manifold first-off.", recommendation: "Approve. Saravanan covers VMC-1 if Murugan proves the program on Friday.", from: "Karthik Gowda", module: "team", approveLabel: "Approve leave" },
];

const config: DeskConfig = {
  slug: "job-shop",
  company: "Kaveri Precision Works",
  brand: "Kaveri",
  city: "Hosur",
  state: "TN",
  icon: Factory,
  tagline: "Fabrication, CNC machining and fixtures for 30 OEMs · 10 machines · 46 people, 2 shifts",
  owner: { name: "Senthil Rajendran", first: "Senthil", initials: "SR", role: "Owner, MD" },
  theme: {
    variant: "inbox",
    paper: "#f6f3ee",
    panel: "#fffdf9",
    sunk: "#eee8df",
    ink: "#2b221c",
    mute: "#77695d",
    line: "#e4dacd",
    accent: "#b4532a",
    accentInk: "#fffaf5",
    soft: "#f7e6dc",
    ok: "#3f7d4e",
    warn: "#b9821c",
    late: "#b3372b",
    info: "#2f5d8a",
    heading: "display",
    radius: 14,
  },
  brief:
    "Fabricate is over its WIP limit and two jobs will miss dispatch unless it clears today; the Bagalur manifold is the one to push. VMC-1's vibration is climbing, ₹4.1 L from Bagalur is past 70 days, and Thally Wind is waiting on your counter for a ₹6.8 L order.",
  pulse: [
    { label: "Jobs on time", value: "15 of 18", delta: "-1", good: false, trend: [17, 17, 16, 16, 16, 15, 15], module: "jobs" },
    { label: "Spindle utilisation", value: "71%", delta: "+4%", trend: [61, 64, 66, 65, 68, 70, 71], tone: "ok", module: "machines" },
    { label: "Quotes open", value: "₹33.1 L", delta: "+₹5 L", trend: [21, 24, 26, 25, 29, 31, 33], tone: "info", module: "quotes" },
    { label: "Receivables", value: "₹23.1 L", delta: "+6%", good: false, trend: [18, 19, 19, 20, 21, 22, 23.1], tone: "warn", module: "dispatch" },
    { label: "First-pass yield", value: "93.4%", delta: "-1.2%", good: false, trend: [95, 95.4, 94.8, 94.6, 94.1, 93.8, 93.4], tone: "late", module: "quality" },
  ],
  decisions,
  agenda: [
    { at: 8.5, title: "Floor stand-up", detail: "Fabricate 5 of 4, weld bay 2 down", tone: "warn", module: "jobs" },
    { at: 10, title: "Quote review with Meena", detail: "5 open, 1 past reply date", count: 5, tone: "info", module: "quotes" },
    { at: 11.5, title: "Thally Wind call", detail: "Q-0921, they want 6% off", tone: "accent", module: "quotes" },
    { at: 14, title: "Purchase window", detail: "EN8, TIG wire, inserts", count: 3, tone: "neutral", module: "materials" },
    { at: 16, title: "Quality huddle: NCR-126", detail: "Weld porosity, wire lot 2207", count: 4, tone: "late", module: "quality" },
    { at: 18, title: "Dispatch & invoicing close", detail: "2 to ship, 2 to invoice", count: 4, tone: "ok", module: "dispatch" },
  ],
  activity: [
    { time: "11:42 AM", text: "Spindle Watch: weld bay 2 wire feeder fault, 95 min down", tone: "late" },
    { time: "11:15 AM", text: "JC-2480 brackets: 36 of 40 passed CMM, 4 bores oversize", tone: "warn" },
    { time: "10:50 AM", text: "Krishnagiri Dairy promised RTGS of ₹4.66 L on 25 Oct", tone: "info" },
    { time: "10:22 AM", text: "Customer approved drawing rev D for JC-2493 on WhatsApp", tone: "ok" },
    { time: "9:40 AM", text: "NCR Scribe raised NCR-126 from Deepa's photos", tone: "late" },
    { time: "8:52 AM", text: "Shift A in: 22 of 23 present, Selvam late", tone: "neutral" },
  ],
  asks: [
    { q: "Which jobs will miss their dispatch date?", a: "Two, if Fabricate doesn't clear today.\n\n• JC-2493 manifold blocks (Bagalur): due in 22 h, still on VMC-1 op 40 of 70. Needs the night shift.\n• JC-2481 conveyor frames (Rayakottai): due in 30 h, 3 frames back for re-weld on NCR-126.\n\nThe fix: run JC-2493 on VMC-1 in shift B and push JC-2488 platen by 6 hours (it has 3 days of float). Re-weld the frames on bay 1 since bay 2 is down.", sources: ["Job cards", "Machine load", "NCR-126"] },
    { q: "How much did we make on the last five fixtures?", a: "Average margin 22% against a 28% quote.\n\n• Swing-arm weld fixture: quoted 29%, running at 31% (on plan)\n• Hydraulic test fixture: quoted 26%, at 18% (VMC hours 40% over)\n• Gauge set: quoted 24%, at 25%\n• Drilling jig (Thally): quoted 27%, at 20% (design rework)\n• Fixture plate, 6-station: quoted 30%, at 19% (paint NCR + re-machining)\n\nVMC hours are the leak: we quote 12 h on average and book 16.", sources: ["Hours booked", "Quotes", "Tally"] },
    { q: "Who owes us money and for how long?", a: "₹23.1 L across 11 invoices (with GST).\n\n• Denkanikottai Agro: ₹1.98 L at 112 days, promised half now and half by Diwali\n• Thally Wind: ₹3.4 L at 96 days\n• Bagalur Hydraulics: ₹4.1 L at 74 days, with a new order on the belt\n\nKrishnagiri Dairy has promised ₹4.66 L by RTGS on 25 Oct. Reminders go out at 5 PM.", sources: ["Tally outstanding", "Billing Clerk log"] },
    { q: "Why is OEE low on the press brake?", a: "Availability is 62% because it waits on the laser. It was idle 2 hours today and 9 hours this week with no parts. Performance (78%) and quality (99%) are fine.\n\nFix: nest the bending parts first on the laser each morning, or move small brackets to the shearing machine.", sources: ["Spindle sensors", "Laser nest log"] },
    { q: "What steel do we need to buy this week?", a: "Three items are short against open jobs:\n\n• EN8 round Ø50: short 840 kg (shafts + manifolds), Sri Balaji at ₹82/kg\n• IS 2062 plate 40 mm: short 340 kg (bale press platen)\n• Al 6082 plate 20 mm: nil stock, 96 kg for the Bommasandra plates\n\nTIG wire ER308L is also down to 6 kg, under a week of cover.", sources: ["Materials", "Job BOMs"] },
    { q: "Draft a reply to Thally Wind on Q-0921", a: "Draft (not sent):\n\n“Dear Mr. Prabhu, thank you for considering Kaveri for the nacelle lifting frames. We can offer 3% off, ₹6,59,600 + GST, if payment is within 30 days of delivery. This includes load testing at 1.25× SWL with a certificate, and dispatch in 18 working days from drawing approval. Regards, Senthil Rajendran, Kaveri Precision Works”", sources: ["Q-0921 cost sheet", "Last 4 frame jobs"] },
  ],
  run: {
    label: "Runs every 20 minutes across both shifts. You can also run it now.",
    title: "Job Router",
    steps: [
      { text: "Read 18 job cards and 126 routing operations", result: "Fabricate at 5 of 4, Test full" },
      { text: "Pull live load from 10 machine sensors", result: "Weld bay 2 down, press brake idle" },
      { text: "Check material against the next 3 days of operations", result: "EN8 short 840 kg, TIG wire 6 kg" },
      { text: "Re-sequence machines by due date and expedite flags", result: "JC-2493 to VMC-1 night shift" },
      { text: "Draft owner approvals and customer updates", result: "1 expedite, 1 PO, 1 customer note" },
    ],
    outcome: "Moving JC-2493 to VMC-1 tonight and re-welding NCR-126 frames on bay 1 keeps both urgent jobs on their dispatch date. JC-2488 slips 6 hours and still ships with 2 days to spare.",
    actions: ["Expedite JC-2493 on VMC-1 tonight", "Move JC-2490 to weld bay 1", "Approve the EN8 PO", "Tell Rayakottai the frames ship tomorrow 4 PM"],
  },
  signature: { title: "Shop-floor conveyor", sub: "Every open job card riding the line from drawing to truck. Click a card to send it on, drag it to any station, flag it to jump the queue.", module: "jobs", render: () => <Conveyor /> },
  homeExtras: () => <HomeExtras />,
};

/* ============================================================
   Desk
   ============================================================ */

export default function JobShopDesk() {
  const [jobs, setJobs] = React.useState(seedJobs);
  const [ncrs, setNcrs] = React.useState(seedNcrs);
  const [shipped, setShipped] = React.useState(seedShipped);
  const [live, setLive] = React.useState(true);
  const shop = React.useMemo<Shop>(() => ({ jobs, setJobs, ncrs, setNcrs, shipped, setShipped, live, setLive }), [jobs, ncrs, shipped, live]);
  const openNcr = ncrs.filter((n) => n.stage !== "Closed").length;

  const modules: DeskModule[] = [
    { id: "jobs", label: "Job cards", group: "Shop floor", count: jobs.length, title: "Job cards", blurb: "Every open job, its routing, drawing revision and hours booked against plan", icon: ClipboardList, render: () => <JobsTab /> },
    { id: "machines", label: "Machines", group: "Shop floor", count: 1, title: "Machines", blurb: "Ten machines: what they're cutting, their load for the week, OEE and the breakdown log", icon: Cog, render: () => <MachinesTab /> },
    { id: "quality", label: "Quality", group: "Shop floor", count: openNcr, title: "Quality", blurb: "Rework, NCRs and CAPA, from the first reject to the closed root cause", icon: ShieldCheck, render: () => <QualityTab /> },
    { id: "quotes", label: "Quotes", group: "Commercial", count: 6, title: "Quotes", blurb: "Every RFQ on a clock, a margin calculator, and why we win or lose", icon: Calculator, render: () => <QuotesTab /> },
    { id: "materials", label: "Materials", group: "Commercial", count: seedMats.filter((m) => m.stock < m.need).length, title: "Materials", blurb: "Steel, consumables and tools against what the open jobs need", icon: Boxes, render: () => <MaterialsTab /> },
    { id: "dispatch", label: "Dispatch & billing", group: "Commercial", count: shipped.filter((s) => !s.invoiced).length + jobs.filter((j) => j.station === "Dispatch").length, title: "Dispatch & billing", blurb: "Pack, ship, GST invoice and e-way bill, then the money", icon: Truck, render: () => <DispatchTab /> },
    { id: "team", label: "People", group: "Company", title: "People", blurb: "Planning, floor, quality and accounts: who is carrying what today", icon: Users, render: () => <PeopleModule members={team} /> },
    { id: "agents", label: "Agents", group: "Company", title: "Agents", blurb: "Six AI agents routing jobs, pricing quotes and chasing dues", icon: Zap, render: () => <AgentsModule agents={agents} /> },
    { id: "independence", label: "Independence", group: "Company", title: "Owner independence", blurb: "How much of Kaveri runs without Senthil on the floor", icon: GaugeIcon, render: () => <IndependenceModule data={independence} /> },
    { id: "connections", label: "Connections", group: "Company", title: "Connections", blurb: "Tally, WhatsApp, e-way bills, PDM and the machine sensors", icon: Plug, render: () => <ConnectionsModule items={integrations} /> },
  ];

  return (
    <ShopContext.Provider value={shop}>
      <DeskShell config={config} modules={modules} />
    </ShopContext.Provider>
  );
}

/* ---------------- Signature: shop-floor conveyor ---------------- */

const defects = ["Weld porosity", "Bore oversize Ø+0.04", "Flatness out by 0.3 mm", "Thread NoGo gauge fail", "Paint DFT low", "Leak at manifold port", "Wrong drawing revision used"];

function Roller({ delay }: { delay: number }) {
  return (
    <svg viewBox="0 0 14 14" className="h-3.5 w-3.5 shrink-0">
      <g className="bb-spin" style={{ animationDuration: "1.4s", animationDelay: `${delay}ms`, transformOrigin: "7px 7px" }}>
        <circle cx="7" cy="7" r="6" fill="#57504a" stroke="#8a8178" strokeWidth="1" />
        <line x1="7" y1="2" x2="7" y2="12" stroke="#b8aea3" strokeWidth="1.2" />
      </g>
    </svg>
  );
}

function Conveyor() {
  const s = useShopActions();
  const desk = useDesk();
  const [drag, setDrag] = React.useState<string | null>(null);
  const [over, setOver] = React.useState<Station | null>(null);
  const [open, setOpen] = React.useState<string | null>(null);
  const [reworkFor, setReworkFor] = React.useState<Job | null>(null);
  const [focus, setFocus] = React.useState<"All" | "Expedite" | "Due < 48h" | "Rework">("All");
  const pph = useDrift(46, 1.5, 2400);
  const jobsRef = React.useRef(s.jobs);
  const moveRef = React.useRef(s.move);
  React.useEffect(() => {
    jobsRef.current = s.jobs;
    moveRef.current = s.move;
  });
  React.useEffect(() => {
    if (!s.live) return;
    const id = window.setInterval(() => {
      const cur = jobsRef.current;
      const movable = cur.filter((j) => {
        if (!["Design", "Cut", "Fabricate", "Assemble"].includes(j.station)) return false;
        const to = nextStation(j.station)!;
        return cur.filter((x) => x.station === to).length < WIP[to];
      });
      if (!movable.length) return;
      const pick = movable[Math.floor(Math.random() * movable.length)];
      moveRef.current(pick.id, nextStation(pick.station)!, true);
    }, 16000);
    return () => window.clearInterval(id);
  }, [s.live]);

  const job = s.jobs.find((j) => j.id === open) ?? null;
  const matches = (j: Job) => focus === "All" || (focus === "Expedite" && j.expedite) || (focus === "Due < 48h" && j.dueH < 48) || (focus === "Rework" && j.rework > 0);
  const reworkCount = s.jobs.filter((j) => j.rework > 0).length;
  const dispatchJobs = s.jobs.filter((j) => j.station === "Dispatch");
  const todayShipped = s.shipped.filter((x) => x.at.startsWith("Today")).length;

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {[
          { l: "On the belt", v: String(s.jobs.length), t: "neutral" as Tone },
          { l: "Shipped today", v: String(todayShipped), t: "ok" as Tone },
          { l: "Expedites", v: String(s.jobs.filter((j) => j.expedite).length), t: "late" as Tone },
          { l: "In rework loop", v: String(reworkCount), t: "warn" as Tone },
          { l: "Parts / hour", v: pph.toFixed(1), t: "info" as Tone },
        ].map((m) => (
          <div key={m.l} className="rounded-[12px] border border-d-line bg-d-paper px-3 py-2">
            <p className="text-[11px] text-d-mute">{m.l}</p>
            <p className="desk-h tnum text-[22px] font-semibold leading-tight" style={{ color: m.t === "neutral" ? undefined : toneVar(m.t) }}>
              {m.v}
            </p>
          </div>
        ))}
      </div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Segmented size="sm" options={["All", "Expedite", "Due < 48h", "Rework"] as const} value={focus} onChange={setFocus} />
        <div className="flex items-center gap-2">
          <Btn size="sm" variant={s.live ? "soft" : "outline"} icon={s.live ? Pause : Play} onClick={() => { s.setLive((x) => !x); desk.log(s.live ? "Live floor feed paused" : "Live floor feed resumed"); }}>
            {s.live ? "Live floor" : "Paused"}
          </Btn>
          <Btn
            size="sm"
            variant="solid"
            icon={Truck}
            disabled={!dispatchJobs.length}
            onClick={() => dispatchJobs.forEach((j) => s.ship(j.id))}
          >
            Load truck · {dispatchJobs.length}
          </Btn>
        </div>
      </div>

      <div className="desk-scroll -mx-5 overflow-x-auto px-5 pb-1">
        <div className="relative min-w-[760px]">
          {/* rework loop */}
          <div className="relative h-11">
            <svg viewBox="0 0 600 44" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
              <path d="M450,42 C450,6 250,6 250,42" fill="none" stroke="var(--d-warn)" strokeOpacity="0.25" strokeWidth="6" vectorEffect="non-scaling-stroke" />
              <path d="M450,42 C450,6 250,6 250,42" fill="none" stroke="var(--d-warn)" strokeWidth="2" className="desk-flow" vectorEffect="non-scaling-stroke" style={{ animationDirection: "reverse" }} />
            </svg>
            <span className="absolute left-[41.66%] top-[2px] -translate-x-1/2 whitespace-nowrap rounded-full border border-d-line bg-d-panel px-2 py-0.5 text-[10.5px] font-semibold text-d-warn">
              <RotateCcw className="mr-1 inline h-3 w-3 -translate-y-px" />
              Rework loop · {reworkCount} job{reworkCount === 1 ? "" : "s"}
            </span>
            <span className="absolute bottom-0 left-[41.66%] h-2 w-2 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-d-warn" />
          </div>
          {/* station headers */}
          <div className="grid grid-cols-6 gap-1.5">
            {STATIONS.map((st, i) => {
              const count = s.jobs.filter((j) => j.station === st).length;
              const lim = WIP[st];
              const Icon = stationMeta[st].icon;
              const state: Tone = count > lim ? "late" : count === lim ? "warn" : "ok";
              return (
                <div key={st} className="relative rounded-t-[12px] border border-b-0 border-d-line bg-d-panel px-2 pb-2 pt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-[7px] bg-d-soft text-d-accent">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="truncate text-[12.5px] font-semibold">{st}</span>
                    <span className="tnum ml-auto font-mono text-[11px] font-semibold" style={{ color: toneVar(state) }}>
                      {count}/{lim}
                    </span>
                  </div>
                  <div className="mt-1.5 flex gap-[3px]">
                    {Array.from({ length: Math.max(lim, count) }, (_, k) => (
                      <span key={k} className="h-1.5 flex-1 rounded-full" style={{ background: k < count ? (k >= lim ? "var(--d-late)" : toneVar(state)) : "var(--d-sunk)" }} />
                    ))}
                  </div>
                  <p className="mt-1 truncate text-[10.5px] text-d-mute">{count > lim ? "Over WIP limit" : stationMeta[st].cell}</p>
                  {i < STATIONS.length - 1 && <ChevronsRight className="absolute -right-[13px] top-3 z-[2] h-4 w-4 text-d-mute" />}
                </div>
              );
            })}
          </div>
          {/* the belt */}
          <div className="relative overflow-hidden rounded-b-[14px] bg-[#35302b]">
            <div className="desk-belt absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 20px)" }} />
            <div className="relative flex justify-between px-2 pt-1.5">
              {Array.from({ length: 34 }, (_, k) => (
                <Roller key={k} delay={k * 37} />
              ))}
            </div>
            <div className="relative grid min-h-[330px] grid-cols-6 gap-1.5 px-0 py-2">
              {STATIONS.map((st) => {
                const list = s.jobs.filter((j) => j.station === st).sort((a, b) => Number(b.expedite) - Number(a.expedite) || a.dueH - b.dueH);
                return (
                  <div
                    key={st}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setOver(st);
                    }}
                    onDragLeave={() => setOver((o) => (o === st ? null : o))}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (drag) s.move(drag, st);
                      setDrag(null);
                      setOver(null);
                    }}
                    className="flex flex-col gap-2 rounded-[10px] px-1.5 py-1 transition-colors"
                    style={{ background: over === st ? "rgba(255,255,255,0.12)" : undefined, boxShadow: over === st ? "inset 0 0 0 2px var(--d-accent)" : undefined }}
                  >
                    {list.map((j) => (
                      <JobChip
                        key={j.id}
                        job={j}
                        dim={!matches(j)}
                        dragging={drag === j.id}
                        onDragStart={() => setDrag(j.id)}
                        onDragEnd={() => setDrag(null)}
                        onAdvance={() => s.advance(j.id)}
                        onFlag={() => s.expedite(j.id)}
                        onRework={() => setReworkFor(j)}
                        onInfo={() => setOpen(j.id)}
                      />
                    ))}
                    {list.length === 0 && <p className="rounded-[8px] border border-dashed border-white/20 py-6 text-center text-[11px] text-white/50">Drop a job here</p>}
                  </div>
                );
              })}
            </div>
            <div className="relative flex justify-between px-2 pb-1.5">
              {Array.from({ length: 34 }, (_, k) => (
                <Roller key={k} delay={k * 29} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-[11.5px] text-d-mute">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-1 rounded-full bg-d-late" /> expedite, can jump WIP
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-1 rounded-full bg-d-warn" /> came back from rework
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ChevronsRight className="h-3.5 w-3.5" /> click a card to send it on
        </span>
        <span className="inline-flex items-center gap-1.5">
          <RotateCcw className="h-3.5 w-3.5" /> at Assemble or Test, send it back
        </span>
      </div>

      <Modal open={!!reworkFor} onOpenChange={(o) => !o && setReworkFor(null)} title={`Send ${reworkFor?.id ?? ""} back for rework`} sub="It goes back to Fabricate, skips the WIP limit, and an NCR is raised for Deepa." width={460}>
        <div className="grid gap-2">
          {defects.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                if (reworkFor) s.rework(reworkFor.id, d);
                setReworkFor(null);
              }}
              className="flex items-center justify-between rounded-[10px] border border-d-line px-3 py-2.5 text-left text-[13.5px] hover:border-d-accent hover:bg-d-soft"
            >
              {d}
              <ArrowRight className="h-4 w-4 text-d-mute" />
            </button>
          ))}
        </div>
      </Modal>
      <JobSheet job={job} onClose={() => setOpen(null)} />
    </div>
  );
}

function JobChip({
  job,
  dim,
  dragging,
  onDragStart,
  onDragEnd,
  onAdvance,
  onFlag,
  onRework,
  onInfo,
}: {
  job: Job;
  dim: boolean;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onAdvance: () => void;
  onFlag: () => void;
  onRework: () => void;
  onInfo: () => void;
}) {
  const h = hoursOf(job);
  const next = nextStation(job.station);
  const edge = job.expedite ? "var(--d-late)" : job.rework ? "var(--d-warn)" : "color-mix(in oklab, var(--d-accent) 45%, var(--d-line))";
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onAdvance}
      title={next ? `Click to send to ${next}` : "Click to dispatch"}
      className="desk-rise group relative cursor-grab rounded-[9px] bg-d-panel p-2 text-[11.5px] shadow-[0_6px_14px_-6px_rgba(0,0,0,0.6)] transition-all hover:-translate-y-0.5 active:cursor-grabbing"
      style={{ borderLeft: `3px solid ${edge}`, opacity: dragging ? 0.35 : dim ? 0.35 : 1 }}
    >
      <div className="flex items-center gap-1 whitespace-nowrap">
        <span className="font-mono text-[10.5px] font-semibold">{job.id}</span>
        {job.expedite && <Flag className="h-3 w-3 text-d-late" fill="currentColor" />}
        {job.rework > 0 && <span className="rounded bg-[color-mix(in_oklab,var(--d-warn)_16%,transparent)] px-1 font-mono text-[9.5px] font-semibold text-d-warn">R{job.rework}</span>}
        <span className="tnum ml-auto shrink-0 rounded-full px-1 font-mono text-[9.5px] font-semibold" style={{ color: dueTone(job.dueH) === "neutral" ? "var(--d-mute)" : toneVar(dueTone(job.dueH)), background: dueTone(job.dueH) === "neutral" ? "var(--d-sunk)" : `color-mix(in oklab, ${toneVar(dueTone(job.dueH))} 12%, transparent)` }}>
          {dueLabel(job.dueH)}
        </span>
      </div>
      <p className="mt-1 line-clamp-2 font-medium leading-tight">{job.part}</p>
      <p className="mt-0.5 truncate text-[10.5px] text-d-mute">
        {customers[job.customer]?.short ?? job.customer} · {job.qty} nos
      </p>
      <div className="mt-1.5 flex items-center gap-1.5">
        <Meter value={h.booked} max={h.plan} height={4} tone={h.booked > h.plan * 0.85 ? "late" : "accent"} />
        <span className="tnum shrink-0 font-mono text-[9.5px] text-d-mute">
          {Math.round(h.booked)}/{Math.round(h.plan)}h
        </span>
      </div>
      <div className="mt-1.5 flex items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100">
        {[
          { icon: Flag, label: job.expedite ? "Remove expedite" : "Expedite", run: onFlag, on: job.expedite },
          ...(job.station === "Assemble" || job.station === "Test" ? [{ icon: RotateCcw, label: "Send back for rework", run: onRework, on: false }] : []),
          { icon: Info, label: "Routing sheet", run: onInfo, on: false },
        ].map((b) => (
          <button
            key={b.label}
            type="button"
            aria-label={b.label}
            title={b.label}
            onClick={(e) => {
              e.stopPropagation();
              b.run();
            }}
            className="flex h-5 w-5 items-center justify-center rounded-[5px] border border-d-line hover:bg-d-sunk"
            style={{ color: b.on ? "var(--d-late)" : undefined }}
          >
            <b.icon className="h-3 w-3" />
          </button>
        ))}
        <span className="ml-auto inline-flex items-center text-d-accent" title={next ?? "Ship"}>
          <ChevronsRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
}

/* ---------------- Job routing sheet (shared) ---------------- */

function DrawingThumb({ job }: { job: Job }) {
  const holes = job.kind === "machined" ? 6 : job.kind === "fixture" ? 4 : 8;
  return (
    <svg viewBox="0 0 220 120" className="w-full rounded-[10px] border border-d-line" style={{ background: "#eef3f8" }}>
      <defs>
        <pattern id={`grid-${job.id}`} width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M10 0H0V10" fill="none" stroke="#2f5d8a" strokeOpacity="0.08" />
        </pattern>
      </defs>
      <rect width="220" height="120" fill={`url(#grid-${job.id})`} />
      <rect x="30" y="24" width="130" height="66" fill="none" stroke="#2f5d8a" strokeWidth="1.4" rx={job.kind === "fab" ? 0 : 4} />
      {Array.from({ length: holes }, (_, i) => (
        <circle key={i} cx={42 + (i % (holes / 2)) * (106 / (holes / 2 - 0.5 || 1))} cy={i < holes / 2 ? 36 : 78} r="4" fill="none" stroke="#2f5d8a" strokeWidth="1" />
      ))}
      <line x1="30" y1="100" x2="160" y2="100" stroke="#b4532a" strokeWidth="0.8" />
      <text x="95" y="111" textAnchor="middle" fontSize="8" fill="#b4532a" fontFamily="monospace">
        {job.kind === "fab" ? "3200" : job.kind === "fixture" ? "640" : "120"} ±0.2
      </text>
      <rect x="168" y="70" width="46" height="44" fill="#fff" stroke="#2f5d8a" strokeWidth="0.8" />
      <text x="191" y="84" textAnchor="middle" fontSize="7" fill="#2f5d8a" fontFamily="monospace">
        KPW-{job.id.slice(3)}
      </text>
      <text x="191" y="98" textAnchor="middle" fontSize="11" fontWeight="700" fill="#b4532a" fontFamily="monospace">
        REV {job.rev}
      </text>
      <text x="191" y="109" textAnchor="middle" fontSize="6" fill="#2f5d8a" fontFamily="monospace">
        1:{job.kind === "fab" ? 20 : 2}
      </text>
    </svg>
  );
}

function JobSheet({ job, onClose }: { job: Job | null; onClose: () => void }) {
  const s = useShopActions();
  const desk = useDesk();
  const ops = job ? routing(job) : [];
  const h = job ? hoursOf(job) : { plan: 0, booked: 0 };
  const revs = job ? "ABCD".slice(0, "ABCD".indexOf(job.rev) + 1).split("") : [];
  return (
    <Sheet
      open={!!job}
      onOpenChange={(o) => !o && onClose()}
      width={560}
      eyebrow={job ? `${job.id} · ${job.po} · at ${job.station}` : ""}
      title={job?.part ?? ""}
      sub={job ? `${job.customer}, ${customers[job.customer]?.city ?? ""} · ${job.qty} nos · due in ${dueLabel(job.dueH)}` : ""}
      footer={
        job && (
          <>
            <Btn icon={Flag} onClick={() => s.expedite(job.id)}>
              {job.expedite ? "Remove expedite" : "Expedite"}
            </Btn>
            <Btn
              icon={Send}
              onClick={() => {
                toast.success("Drawing sent to the floor group", { description: `KPW-${job.id.slice(3)} rev ${job.rev} · ${stationMeta[job.station].who} acknowledged` });
                desk.log(`Drawing KPW-${job.id.slice(3)} rev ${job.rev} shared on WhatsApp`);
              }}
            >
              Drawing to floor
            </Btn>
            <Btn variant="solid" icon={ChevronsRight} onClick={() => s.advance(job.id)}>
              {nextStation(job.station) ? `Send to ${nextStation(job.station)}` : "Dispatch"}
            </Btn>
          </>
        )
      }
    >
      {job && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
            <KV
              items={[
                { k: "Order value", v: inr(job.value) },
                { k: "Drawing", v: <span className="font-mono">KPW-{job.id.slice(3)} rev {job.rev}</span> },
                { k: "Material", v: job.material },
                { k: "Priority", v: job.expedite ? <Pill tone="late">Expedite</Pill> : <Pill>Normal</Pill> },
                { k: "Rework loops", v: job.rework ? <span className="text-d-warn">{job.rework}</span> : "None" },
                { k: "Hours", v: <span className={h.booked > h.plan ? "text-d-late" : ""}>{h.booked.toFixed(1)} of {h.plan.toFixed(1)} planned</span> },
              ]}
            />
            <DrawingThumb job={job} />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[12px] font-medium text-d-mute">Routing · hours booked vs plan</p>
              <Btn size="sm" variant="soft" icon={Timer} onClick={() => s.bookHour(job.id)}>
                Book 1 h on current op
              </Btn>
            </div>
            <ul className="space-y-1.5">
              {ops.map((o) => {
                const pct = o.plan ? o.booked / o.plan : 0;
                return (
                  <li key={o.no} className="rounded-[10px] border border-d-line px-3 py-2" style={{ background: o.state === "running" ? "var(--d-soft)" : undefined }}>
                    <div className="flex items-center gap-2 text-[13px]">
                      <span className="w-7 font-mono text-[11px] text-d-mute">{o.no}</span>
                      <span className="min-w-0 flex-1 truncate font-medium">{o.op}</span>
                      <Pill tone={o.state === "done" ? "ok" : o.state === "running" ? "accent" : "neutral"}>{o.state === "done" ? "Done" : o.state === "running" ? "Running" : o.at}</Pill>
                    </div>
                    <div className="mt-1 flex items-center gap-2 pl-9">
                      <span className="w-[130px] shrink-0 truncate text-[11.5px] text-d-mute">{o.machine}</span>
                      <Meter value={Math.min(o.booked, o.plan)} max={o.plan} height={5} tone={pct > 1 ? "late" : o.state === "done" ? "ok" : "accent"} />
                      <span className="tnum w-[74px] shrink-0 text-right font-mono text-[11px]" style={{ color: pct > 1 ? "var(--d-late)" : undefined }}>
                        {o.booked.toFixed(1)}/{o.plan.toFixed(1)}h
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-[12px] font-medium text-d-mute">Drawing revisions</p>
            <ol className="space-y-1.5">
              {revs.reverse().map((r, i) => (
                <li key={r} className="flex items-start gap-3 text-[12.5px]">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] font-mono text-[11px] font-bold ${i === 0 ? "bg-d-accent text-d-accent-ink" : "bg-d-sunk text-d-mute"}`}>{r}</span>
                  <span className={i === 0 ? "" : "text-d-mute line-through decoration-d-mute/40"}>
                    {revNotes["ABCD".indexOf(r)]}
                    {i === 0 && <span className="ml-1 text-d-ok no-underline">· on the floor</span>}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </Sheet>
  );
}

/* ---------------- Home extras ---------------- */

function HomeExtras() {
  const s = useShopActions();
  const desk = useDesk();
  const spindle = useDrift(48.6, 0.4, 2600);
  const urgent = [...s.jobs].sort((a, b) => a.dueH - b.dueH).slice(0, 5);
  const book = s.jobs.reduce((a, j) => a + j.value, 0);
  const quotesCold = seedQuotes.filter((q) => q.status === "Sent" || q.status === "Negotiating").sort((a, b) => a.replyBy - b.replyBy).slice(0, 3);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat label="Order book on the belt" value={inr(book, { compact: true })} delta="+9%" hint="vs last month" icon={IndianRupee} trend={[28, 30, 31, 33, 34, 36, book / 1e5]} />
        <Stat label="On-time dispatch, 30 days" value="86%" delta="-3%" deltaGood hint="target 92%" icon={Truck} tone="warn" trend={[91, 90, 90, 89, 88, 87, 86]} />
        <Stat label="Spindle hours today" value={spindle.toFixed(1)} delta="+5.2" hint="10 machines, 2 shifts" icon={Cog} tone="ok" trend={[18, 24, 30, 36, 41, 45, spindle]} />
        <Stat label="Rework hours, this week" value="31 h" delta="+12 h" deltaGood={false} hint="NCR-126 frames" icon={RotateCcw} tone="late" trend={[12, 14, 16, 19, 22, 26, 31]} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel icon={Timer} title="Due next" sub="Live clocks to the promised dispatch">
          <ul className="space-y-2">
            {urgent.map((j) => (
              <li key={j.id} className="flex items-center gap-3 rounded-[12px] border border-d-line px-3 py-2">
                {j.expedite ? <Flag className="h-4 w-4 shrink-0 text-d-late" fill="currentColor" /> : <Package className="h-4 w-4 shrink-0 text-d-mute" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">
                    <span className="font-mono text-[11.5px] text-d-mute">{j.id}</span> {j.part}
                  </p>
                  <p className="text-[11.5px] text-d-mute">
                    at {j.station} · <span style={{ color: toneVar(dueTone(j.dueH)) }}><Countdown compact inHours={j.dueH} /></span>
                  </p>
                </div>
                {!j.expedite && j.dueH < 48 && (
                  <Btn size="sm" variant="soft" onClick={() => s.expedite(j.id)}>
                    Expedite
                  </Btn>
                )}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel icon={Cog} title="Machines now" sub="From the spindle sensors" action={<Btn size="sm" icon={ArrowRight} onClick={() => desk.goTab("machines")}>All</Btn>}>
          <ul className="divide-y divide-d-line">
            {seedMachines.slice(0, 7).map((m) => (
              <li key={m.id} className="flex items-center gap-3 py-2">
                <span className={`h-2 w-2 shrink-0 rounded-full ${m.status === "Running" ? "desk-ping" : ""}`} style={{ background: toneVar(mTone[m.status]) }} />
                <span className="w-[86px] shrink-0 text-[13px] font-medium">{m.name}</span>
                <span className="min-w-0 flex-1 truncate text-[12px] text-d-mute">{m.job}</span>
                <span className="w-16 shrink-0">
                  <Meter value={m.load} tone={mTone[m.status]} height={5} />
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <Panel icon={Calculator} title="Quotes about to go cold" sub="Reply-by clocks the Quote Desk is watching" action={<Btn size="sm" icon={ArrowRight} onClick={() => desk.goTab("quotes")}>Quotes</Btn>}>
        <div className="grid gap-3 md:grid-cols-3">
          {quotesCold.map((q) => (
            <div key={q.id} className="rounded-[12px] border border-d-line p-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11.5px] text-d-mute">{q.id}</span>
                <Pill tone={qTone[q.status]}>{q.status}</Pill>
              </div>
              <p className="mt-1 truncate text-[13.5px] font-semibold">{q.customer}</p>
              <p className="truncate text-[12px] text-d-mute">{q.part}</p>
              <p className="mt-2 flex items-baseline justify-between">
                <span className="desk-h tnum text-[18px] font-semibold">{inr(q.value, { compact: true })}</span>
                <span className="font-mono text-[11.5px]" style={{ color: q.replyBy < 12 ? "var(--d-late)" : "var(--d-mute)" }}>
                  {q.replyBy <= 0 ? "past reply date" : <Countdown compact inHours={q.replyBy} />}
                </span>
              </p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ---------------- Job cards ---------------- */

function JobsTab() {
  const s = useShopActions();
  const desk = useDesk();
  const [open, setOpen] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);
  const job = s.jobs.find((j) => j.id === open) ?? null;
  const totals = s.jobs.map((j) => ({ j, ...hoursOf(j) }));
  const overrun = totals.filter((t) => t.earned > 0 && t.booked > t.earned * 1.05);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open job cards" value={s.jobs.length} hint={`${s.jobs.filter((j) => j.dueH < 72).length} due in 3 days`} icon={ClipboardList} trend={[14, 15, 17, 16, 18, 17, s.jobs.length]} />
        <Stat label="Hours booked vs plan" value={`${Math.round((totals.reduce((a, t) => a + t.booked, 0) / Math.max(1, totals.reduce((a, t) => a + t.earned, 0))) * 100)}%`} delta="+6%" deltaGood={false} hint="of started work" icon={Timer} tone="warn" trend={[96, 98, 101, 99, 103, 104, 106]} />
        <Stat label="Expedites" value={s.jobs.filter((j) => j.expedite).length} hint="jump WIP and machine queues" icon={Flag} tone="late" />
        <Stat label="Value on the belt" value={inr(s.jobs.reduce((a, j) => a + j.value, 0), { compact: true })} delta="+9%" icon={IndianRupee} tone="ok" trend={[28, 30, 31, 33, 34, 36, 38]} />
      </div>
      <Panel
        title="All job cards"
        sub="Click a row for the routing sheet, drawing revision and hours"
        action={
          <Btn size="sm" variant="solid" icon={Plus} onClick={() => setAdding(true)}>
            New job card
          </Btn>
        }
      >
        <DataTable
          rows={s.jobs}
          rowKey={(j) => j.id}
          search={(j) => `${j.id} ${j.part} ${j.customer} ${j.po}`}
          searchPlaceholder="Search job, part, customer or PO"
          filter={{ get: (j) => j.station, options: [...STATIONS] }}
          onRow={(j) => setOpen(j.id)}
          pageSize={10}
          bulk={[
            { label: "Flag expedite", run: (k) => { s.setJobs((cur) => cur.map((j) => (k.includes(j.id) ? { ...j, expedite: true } : j))); toast.success(`${k.length} jobs flagged expedite`); desk.log(`${k.length} jobs flagged expedite`, "warn"); } },
            { label: "Status to customers", run: (k) => { toast.success(`Status sent for ${k.length} jobs`, { description: "WhatsApp, with photo from the floor" }); desk.log(`Job status sent to customers for ${k.length} jobs`); } },
          ]}
          columns={[
            { key: "id", label: "Job", render: (j) => <span className="inline-flex items-center gap-1 font-mono text-[12.5px] font-medium">{j.expedite && <Flag className="h-3 w-3 text-d-late" fill="currentColor" />}{j.id}</span>, sort: (j) => j.id },
            { key: "part", label: "Part", render: (j) => <span className="font-medium">{j.part}</span>, sort: (j) => j.part },
            { key: "cust", label: "Customer", render: (j) => <span className="text-d-mute">{customers[j.customer]?.short}</span>, wide: true, sort: (j) => j.customer },
            { key: "rev", label: "Rev", align: "center", render: (j) => <span className="rounded bg-d-sunk px-1.5 font-mono text-[11.5px]">{j.rev}</span> },
            { key: "st", label: "Station", render: (j) => <Pill tone={j.station === "Dispatch" ? "ok" : j.station === "Test" ? "info" : "accent"}>{j.station}</Pill>, sort: (j) => STATIONS.indexOf(j.station) },
            {
              key: "hrs",
              label: "Hours booked / plan",
              render: (j) => {
                const h = hoursOf(j);
                return (
                  <div className="flex min-w-[130px] items-center gap-2">
                    <Meter value={h.booked} max={h.plan} tone={h.booked > h.plan * 0.9 ? "late" : "accent"} />
                    <span className="tnum font-mono text-[11px] text-d-mute">{Math.round(h.booked)}/{Math.round(h.plan)}</span>
                  </div>
                );
              },
              sort: (j) => hoursOf(j).booked / hoursOf(j).plan,
            },
            { key: "due", label: "Due", align: "right", render: (j) => <span className="tnum font-mono text-[12px]" style={{ color: dueTone(j.dueH) === "neutral" ? undefined : toneVar(dueTone(j.dueH)) }}>{dueLabel(j.dueH)}</span>, sort: (j) => j.dueH },
            { key: "val", label: "Value", align: "right", render: (j) => <span className="tnum font-mono">{inr(j.value, { compact: true })}</span>, sort: (j) => j.value, wide: true },
          ]}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <Panel title="Hours booked by job" sub="Started jobs only. Red is booking more than the quote allowed so far.">
          <Bars
            height={210}
            data={totals
              .filter((t) => t.booked > 0)
              .slice(0, 10)
              .map((t) => ({ label: t.j.id.slice(3), value: Math.round(t.booked), tone: (t.booked > t.earned * 1.05 ? "late" : "accent") as Tone, note: `${Math.round(t.booked)} h booked, ${Math.round(t.earned)} h earned` }))}
          />
        </Panel>
        <Panel title="Running over" sub="More hours booked than the finished operations were quoted for">
          {overrun.length ? (
            <ul className="space-y-2">
              {overrun.map((t) => (
                <li key={t.j.id} className="flex items-center gap-3 rounded-[12px] border border-d-line p-3">
                  <TriangleAlert className="h-4 w-4 shrink-0 text-d-late" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold">{t.j.id} · {t.j.part}</p>
                    <p className="text-[12px] text-d-mute">
                      {t.booked.toFixed(1)} h booked against {t.earned.toFixed(1)} h earned (+{Math.round((t.booked / t.earned - 1) * 100)}%), at {t.j.station}
                    </p>
                  </div>
                  <Btn size="sm" variant="soft" onClick={() => setOpen(t.j.id)}>
                    Routing
                  </Btn>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-[13px] text-d-mute">Every job is inside its hours.</p>
          )}
        </Panel>
      </div>
      <JobSheet job={job} onClose={() => setOpen(null)} />
      <NewJob
        open={adding}
        onOpenChange={setAdding}
        nextId={`JC-${2500 + s.jobs.length - seedJobs.length + s.shipped.length - seedShipped.length}`}
        onAdd={(j) => {
          s.setJobs((cur) => [...cur, j]);
          toast.success(`${j.id} on the belt`, { description: `${j.part} entered Design. Meena has the drawing.` });
          desk.log(`New job card ${j.id}: ${j.part} for ${j.customer}`, "info");
        }}
      />
    </div>
  );
}

function NewJob({ open, onOpenChange, onAdd, nextId }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (j: Job) => void; nextId: string }) {
  const [part, setPart] = React.useState("Hydraulic cylinder clevis");
  const [customer, setCustomer] = React.useState("Bagalur Hydraulics");
  const [qty, setQty] = React.useState("24");
  const [value, setValue] = React.useState("86000");
  const [kind, setKind] = React.useState<Kind>("machined");
  const [days, setDays] = React.useState("12");
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="New job card" sub="It enters Design with a routing built from the job type. Meena gets the drawing on WhatsApp.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onAdd(J(nextId, part, customer, Number(qty) || 1, "Design", (Number(days) || 10) * 24, Number(value) || 50000, kind, 0.8, 1, "A", kind === "fab" ? "IS 2062 plate" : kind === "machined" ? "EN8 round" : "MS + EN31"));
          onOpenChange(false);
        }}
      >
        <Field label="Part">
          <input className={inputClass} value={part} onChange={(e) => setPart(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Customer">
            <select className={inputClass} value={customer} onChange={(e) => setCustomer(e.target.value)}>
              {Object.keys(customers).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Job type">
            <select className={inputClass} value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
              <option value="machined">Machined part</option>
              <option value="fab">Fabrication</option>
              <option value="fixture">Fixture / jig</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Qty (nos)">
            <input className={inputClass} inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))} />
          </Field>
          <Field label="PO value (₹)">
            <input className={inputClass} inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))} />
          </Field>
          <Field label="Dispatch in (days)">
            <input className={inputClass} inputMode="numeric" value={days} onChange={(e) => setDays(e.target.value.replace(/\D/g, ""))} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Btn onClick={() => onOpenChange(false)}>Cancel</Btn>
          <Btn variant="solid" type="submit" icon={Plus}>
            Put on the belt
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Machines ---------------- */

const mTone: Record<MStatus, Tone> = { Running: "ok", Setup: "info", Idle: "warn", Breakdown: "late" };

function MachineCard({ m, onToggle }: { m: Machine; onToggle: () => void }) {
  const load = useDrift(m.load, m.load ? 2.5 : 0, 2100 + m.id.length * 130);
  const oee = Math.round((m.a * m.p * m.q) / 10000);
  return (
    <article className="desk-card desk-rise flex flex-col overflow-hidden">
      <div className={m.status === "Running" ? "desk-belt h-1.5" : "h-1.5"} style={{ background: m.status === "Running" ? undefined : toneVar(mTone[m.status]), opacity: m.status === "Running" ? 1 : 0.6 }} />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="desk-h text-[16px] font-semibold">{m.name}</p>
            <p className="truncate text-[12px] text-d-mute">{m.make}</p>
          </div>
          <Pill tone={mTone[m.status]}>{m.status}</Pill>
        </div>
        <p className="mt-2 truncate text-[12.5px]">
          <span className="text-d-mute">On:</span> {m.job}
        </p>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-[11px] text-d-mute">Spindle load</p>
            <p className="tnum font-mono text-[22px] font-semibold">{Math.max(0, Math.round(load))}%</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-d-mute">OEE</p>
            <p className="tnum font-mono text-[22px] font-semibold" style={{ color: oee >= 70 ? "var(--d-ok)" : oee >= 55 ? "var(--d-warn)" : "var(--d-late)" }}>
              {oee}%
            </p>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5 text-center font-mono text-[10.5px]">
          {[
            { k: "A", v: m.a },
            { k: "P", v: m.p },
            { k: "Q", v: m.q },
          ].map((x) => (
            <span key={x.k} className="rounded-[6px] bg-d-sunk py-1">
              {x.k} {x.v}
            </span>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-d-line pt-3 text-[11.5px] text-d-mute">
          <span>
            {m.operator} · {m.hoursToday} h today
          </span>
          <Btn size="sm" variant={m.status === "Breakdown" ? "solid" : "ghost"} onClick={onToggle}>
            {m.status === "Breakdown" ? "Back up" : "Log stop"}
          </Btn>
        </div>
      </div>
    </article>
  );
}

function MachinesTab() {
  const desk = useDesk();
  const [machines, setMachines] = React.useState(seedMachines);
  const [log, setLog] = React.useState(seedBreakdowns);
  const [logging, setLogging] = React.useState<Machine | null>(null);
  const [openBd, setOpenBd] = React.useState<Breakdown | null>(null);
  const [issue, setIssue] = React.useState("Spindle overheating alarm");
  const [cause, setCause] = React.useState<Breakdown["cause"]>("Spindle");
  const [kind, setKind] = React.useState<"All" | "Cutting" | "Welding" | "Finishing">("All");
  const group = (m: Machine) => (["VMC-1", "VMC-2", "CNC-1", "CNC-2", "LSR-1", "PB-1"].includes(m.id) ? "Cutting" : m.id.startsWith("WLD") ? "Welding" : "Finishing");
  const shown = machines.filter((m) => kind === "All" || group(m) === kind);
  const avgOee = Math.round(machines.reduce((a, m) => a + (m.a * m.p * m.q) / 10000, 0) / machines.length);
  const downMins = log.reduce((a, b) => a + b.mins, 0);

  function toggle(m: Machine) {
    if (m.status === "Breakdown") {
      setMachines((cur) => cur.map((x) => (x.id === m.id ? { ...x, status: "Running", load: 60 } : x)));
      setLog((cur) => cur.map((b) => (b.machine === m.name && b.open ? { ...b, open: false } : b)));
      toast.success(`${m.name} back up`, { description: "Job Router re-planned the queue." });
      desk.log(`${m.name} back in production`, "ok");
    } else setLogging(m);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Plant OEE today" value={`${avgOee}%`} delta="+2%" hint="world class is 85%" icon={GaugeIcon} trend={[58, 60, 61, 59, 62, 63, avgOee]} />
        <Stat label="Machines running" value={`${machines.filter((m) => m.status === "Running").length} / ${machines.length}`} hint={`${machines.filter((m) => m.status === "Breakdown").length} down`} icon={Cog} tone="ok" />
        <Stat label="Downtime this month" value={`${Math.round(downMins / 60)} h`} delta="+3 h" deltaGood={false} hint={`${log.length} stops`} icon={TriangleAlert} tone="late" trend={[2, 4, 6, 9, 12, 14, downMins / 60]} />
        <Stat label="Mean time to repair" value={`${Math.round(downMins / log.length)} min`} delta="-18" deltaGood={false} hint="vs September" icon={Wrench} tone="info" />
      </div>
      <Panel title="Machines" sub="Live load from the spindle clamps. Log a stop and the Job Router re-plans." action={<Segmented size="sm" options={["All", "Cutting", "Welding", "Finishing"] as const} value={kind} onChange={setKind} />}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {shown.map((m) => (
            <MachineCard key={m.id} m={m} onToggle={() => toggle(m)} />
          ))}
        </div>
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <Panel title="Load for the week" sub="% of available hours booked. Over 100 means overtime or a slip. Click a cell.">
          <HeatGrid
            rows={machines.map((m) => m.name)}
            cols={weekCols}
            values={machines.map((m) => m.week)}
            onCell={(r, c) => toast(`${machines[r].name} · ${weekCols[c]}`, { description: `${machines[r].week[c]}% booked${machines[r].week[c] > 100 ? ", needs overtime or a move" : ""}` })}
          />
        </Panel>
        <Panel title="Where OEE goes" sub="Hours lost this week, all machines">
          <Donut
            center={`${avgOee}%`}
            sub="OEE"
            segments={[
              { label: "Waiting for material", value: 14, tone: "warn" },
              { label: "Setup / changeover", value: 11, tone: "info" },
              { label: "Breakdowns", value: 9, tone: "late" },
              { label: "Slow cycles", value: 7, tone: "accent" },
              { label: "Rejects & rework", value: 5, tone: "neutral" },
            ]}
          />
        </Panel>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        <Panel title="Breakdown log" sub="Click a stop for the details">
          <DataTable
            rows={log}
            rowKey={(b) => b.id}
            search={(b) => `${b.machine} ${b.issue} ${b.fixedBy}`}
            searchPlaceholder="Search machine or issue"
            filter={{ get: (b) => b.cause, options: ["Spindle", "Electrical", "Hydraulic", "Tooling", "Coolant", "Wire feed"] }}
            onRow={setOpenBd}
            pageSize={8}
            columns={[
              { key: "id", label: "Stop", render: (b) => <span className="font-mono text-[12px]">{b.id}</span> },
              { key: "date", label: "When", render: (b) => <span className="text-d-mute">{b.date}</span> },
              { key: "m", label: "Machine", render: (b) => <span className="font-medium">{b.machine}</span>, sort: (b) => b.machine },
              { key: "issue", label: "Issue", render: (b) => <span className="text-d-mute">{b.issue}</span>, wide: true },
              { key: "mins", label: "Down", align: "right", render: (b) => <span className="tnum font-mono">{b.mins} min</span>, sort: (b) => b.mins },
              { key: "st", label: "", render: (b) => (b.open ? <Pill tone="late">Open</Pill> : <Pill tone="ok">Fixed</Pill>) },
            ]}
          />
        </Panel>
        <Panel title="Stops by cause" sub="Minutes, last 30 days">
          <HBars
            format={(v) => `${v} min`}
            data={(["Spindle", "Hydraulic", "Electrical", "Wire feed", "Tooling", "Coolant"] as const).map((c) => ({ label: c, value: log.filter((b) => b.cause === c).reduce((a, b) => a + b.mins, 0), tone: (c === "Spindle" ? "late" : c === "Hydraulic" ? "warn" : "accent") as Tone }))}
          />
        </Panel>
      </div>
      <Modal open={!!logging} onOpenChange={(o) => !o && setLogging(null)} title={`Log a stop on ${logging?.name ?? ""}`} sub="The machine goes red, its queue is re-planned and maintenance is told on WhatsApp." width={480}>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!logging) return;
            setMachines((cur) => cur.map((x) => (x.id === logging.id ? { ...x, status: "Breakdown", load: 0 } : x)));
            setLog((cur) => [{ id: `BD-0${62 + cur.length - seedBreakdowns.length}`, date: `Today ${clockLabel(new Date())}`, machine: logging.name, issue, mins: 0, cause, fixedBy: "Pending", cost: 0, open: true }, ...cur]);
            toast.error(`${logging.name} stopped`, { description: `${issue}. Job Router is moving its queue.` });
            desk.log(`${logging.name} breakdown: ${issue}`, "late");
            setLogging(null);
          }}
        >
          <Field label="What happened">
            <input className={inputClass} value={issue} onChange={(e) => setIssue(e.target.value)} />
          </Field>
          <Field label="Cause">
            <select className={inputClass} value={cause} onChange={(e) => setCause(e.target.value as Breakdown["cause"])}>
              {["Spindle", "Electrical", "Hydraulic", "Tooling", "Coolant", "Wire feed"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Btn onClick={() => setLogging(null)}>Cancel</Btn>
            <Btn variant="danger" type="submit" icon={TriangleAlert}>
              Log breakdown
            </Btn>
          </div>
        </form>
      </Modal>
      <Sheet
        open={!!openBd}
        onOpenChange={(o) => !o && setOpenBd(null)}
        eyebrow={openBd ? `${openBd.id} · ${openBd.cause}` : ""}
        title={openBd?.machine ?? ""}
        sub={openBd?.issue}
        footer={
          openBd?.open ? (
            <Btn
              variant="solid"
              icon={CheckCheck}
              onClick={() => {
                if (!openBd) return;
                setLog((cur) => cur.map((b) => (b.id === openBd.id ? { ...b, open: false, mins: b.mins || 40 } : b)));
                setMachines((cur) => cur.map((m) => (m.name === openBd.machine ? { ...m, status: "Running", load: 60 } : m)));
                toast.success(`${openBd.machine} fixed`);
                desk.log(`${openBd.id} closed, ${openBd.machine} running`, "ok");
                setOpenBd(null);
              }}
            >
              Mark fixed
            </Btn>
          ) : (
            <Btn variant="solid" onClick={() => setOpenBd(null)}>
              Done
            </Btn>
          )
        }
      >
        {openBd && (
          <div className="space-y-5">
            <KV items={[{ k: "When", v: openBd.date }, { k: "Downtime", v: `${openBd.mins} min` }, { k: "Fixed by", v: openBd.fixedBy }, { k: "Cost", v: openBd.cost ? inr(openBd.cost) : "Under warranty / in-house" }]} />
            <div className="rounded-[12px] bg-d-soft p-3 text-[13px] leading-relaxed">
              <b>Spindle Watch:</b> {openBd.machine} has had {log.filter((b) => b.machine === openBd.machine).length} stops in 30 days. {openBd.cause === "Spindle" ? "Vibration trend matches a bearing going. Book a check before it seizes." : "No repeating pattern yet."}
            </div>
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Jobs that waited</p>
              <ul className="space-y-1.5 text-[13px]">
                {seedJobs.slice(7, 10).map((j) => (
                  <li key={j.id} className="flex items-center justify-between rounded-[10px] border border-d-line px-3 py-2">
                    {j.id} · {j.part}
                    <span className="font-mono text-[11px] text-d-mute">+{Math.round(openBd.mins / 3)} min</span>
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

/* ---------------- Quotes ---------------- */

function AgeClock({ hours }: { hours: number }) {
  const now = useNow(1000);
  const [opened] = React.useState(() => (typeof window === "undefined" ? 0 : performance.timeOrigin));
  const t = hours + (now && opened ? (now.getTime() - opened) / 36e5 : 0);
  const d = Math.floor(t / 24);
  const h = Math.floor(t % 24);
  const m = Math.floor((t * 60) % 60);
  const sec = Math.floor((t * 3600) % 60);
  const pad = (v: number) => String(v).padStart(2, "0");
  return (
    <span className="tnum font-mono text-[12px]" style={{ color: t > 72 ? "var(--d-late)" : t > 36 ? "var(--d-warn)" : undefined }}>
      {d}d {pad(h)}:{pad(m)}{now ? `:${pad(sec)}` : ""}
    </span>
  );
}

function QuotesTab() {
  const desk = useDesk();
  const [quotes, setQuotes] = React.useState(seedQuotes);
  const [open, setOpen] = React.useState<Quote | null>(null);
  const [reason, setReason] = React.useState("Price");
  // margin calculator
  const [cust, setCust] = React.useState("Hosur Agro Implements");
  const [qty, setQty] = React.useState(300);
  const [kg, setKg] = React.useState(3.4);
  const [rate, setRate] = React.useState(68);
  const [vmc, setVmc] = React.useState(0.25);
  const [lathe, setLathe] = React.useState(0.1);
  const [fab, setFab] = React.useState(0.15);
  const [outside, setOutside] = React.useState(18);
  const [overhead, setOverhead] = React.useState(12);
  const [margin, setMargin] = React.useState(22);
  const rates = { vmc: 950, lathe: 650, fab: 480 };
  const material = kg * rate * 1.08;
  const machining = vmc * rates.vmc + lathe * rates.lathe + fab * rates.fab;
  const cost = (material + machining + outside) * (1 + overhead / 100);
  const price = cost / (1 - margin / 100);
  const total = price * qty;
  const live = quotes.filter((q) => q.status !== "Won" && q.status !== "Lost");
  const won = quotes.filter((q) => q.status === "Won").length;
  const lost = quotes.filter((q) => q.status === "Lost").length;

  function decide(q: Quote, status: QStatus, why?: string) {
    setQuotes((cur) => cur.map((x) => (x.id === q.id ? { ...x, status, reason: why } : x)));
    if (status === "Won") toast.success(`${q.id} won`, { description: `${q.customer} · ${inr(q.value, { compact: true })}. Job card drafted for Meena.` });
    else toast(`${q.id} marked ${status.toLowerCase()}`, { description: why ?? q.customer });
    desk.log(`${q.id} ${q.customer}: ${status}${why ? ` (${why})` : ""}`, status === "Won" ? "ok" : status === "Lost" ? "late" : "info");
    setOpen(null);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open quote value" value={inr(live.reduce((a, q) => a + q.value, 0), { compact: true })} delta="+₹5 L" hint={`${live.length} quotes`} icon={Calculator} trend={[21, 24, 26, 25, 29, 31, live.reduce((a, q) => a + q.value, 0) / 1e5]} />
        <Stat label="Win rate, 90 days" value={`${Math.round((won / Math.max(1, won + lost)) * 100)}%`} delta="+4%" hint={`${won} won, ${lost} lost`} icon={CheckCheck} tone="ok" trend={[48, 52, 50, 55, 58, 57, 60]} />
        <Stat label="Average quoted margin" value={`${Math.round(quotes.reduce((a, q) => a + q.margin, 0) / quotes.length)}%`} delta="-2%" deltaGood hint="floor is 20%" icon={IndianRupee} tone="warn" />
        <Stat label="RFQ to quote" value="3.1 days" delta="-0.8" deltaGood={false} hint="target 1 day" icon={Timer} tone="info" trend={[4.6, 4.2, 4.1, 3.8, 3.5, 3.3, 3.1]} />
      </div>
      <Panel title="Quote register" sub="Age runs from the RFQ. Click a quote for the cost sheet and to mark it won or lost.">
        <DataTable
          rows={quotes}
          rowKey={(q) => q.id}
          search={(q) => `${q.id} ${q.customer} ${q.part}`}
          searchPlaceholder="Search quote, customer or part"
          filter={{ get: (q) => q.status, options: ["Drafting", "Sent", "Negotiating", "Won", "Lost"] }}
          onRow={setOpen}
          bulk={[{ label: "Send follow-up", run: (k) => { toast.success(`${k.length} follow-ups sent`, { description: "WhatsApp + email, with a 7-day price hold" }); desk.log(`Quote Desk sent ${k.length} follow-ups`); } }]}
          columns={[
            { key: "id", label: "Quote", render: (q) => <span className="font-mono text-[12.5px] font-medium">{q.id}</span>, sort: (q) => q.id },
            { key: "c", label: "Customer", render: (q) => <span className="font-medium">{q.customer}</span>, sort: (q) => q.customer },
            { key: "p", label: "Part", render: (q) => <span className="text-d-mute">{q.part}</span>, wide: true },
            { key: "v", label: "Value", align: "right", render: (q) => <span className="tnum font-mono">{inr(q.value, { compact: true })}</span>, sort: (q) => q.value },
            { key: "m", label: "Margin", align: "right", render: (q) => <span className="tnum font-mono" style={{ color: q.margin < 20 ? "var(--d-late)" : undefined }}>{q.margin}%</span>, sort: (q) => q.margin },
            { key: "age", label: "Age", render: (q) => (q.status === "Won" || q.status === "Lost" ? <span className="font-mono text-[12px] text-d-mute">{Math.round(q.ageH / 24)}d</span> : <AgeClock hours={q.ageH} />), sort: (q) => q.ageH },
            { key: "st", label: "Status", render: (q) => <Pill tone={qTone[q.status]}>{q.status}</Pill> },
          ]}
        />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
        <Panel icon={Calculator} title="Margin calculator" sub="Machine-hour rates from the last 90 days of actuals. Change anything; the price follows.">
          <div className="grid gap-5 md:grid-cols-[1fr_230px]">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Customer">
                  <input className={inputClass} value={cust} onChange={(e) => setCust(e.target.value)} />
                </Field>
                <Field label="Quantity">
                  <input className={inputClass} inputMode="numeric" value={qty} onChange={(e) => setQty(Number(e.target.value.replace(/\D/g, "")) || 0)} />
                </Field>
              </div>
              {[
                { l: `Steel per piece (kg) · ₹${rate}/kg + 8% scrap`, v: kg, set: setKg, min: 0.2, max: 40, step: 0.1, fmt: (x: number) => `${x.toFixed(1)} kg` },
                { l: "Steel rate (₹/kg)", v: rate, set: setRate, min: 50, max: 600, step: 1, fmt: (x: number) => `₹${x}` },
                { l: "VMC hours per piece · ₹950/h", v: vmc, set: setVmc, min: 0, max: 6, step: 0.05, fmt: (x: number) => `${x.toFixed(2)} h` },
                { l: "Lathe hours per piece · ₹650/h", v: lathe, set: setLathe, min: 0, max: 4, step: 0.05, fmt: (x: number) => `${x.toFixed(2)} h` },
                { l: "Fabrication hours per piece · ₹480/h", v: fab, set: setFab, min: 0, max: 8, step: 0.05, fmt: (x: number) => `${x.toFixed(2)} h` },
                { l: "Outside work per piece (heat treat, plating)", v: outside, set: setOutside, min: 0, max: 2000, step: 1, fmt: (x: number) => `₹${x}` },
                { l: "Overhead", v: overhead, set: setOverhead, min: 0, max: 30, step: 1, fmt: (x: number) => `${x}%` },
                { l: "Target margin", v: margin, set: setMargin, min: 5, max: 45, step: 1, fmt: (x: number) => `${x}%` },
              ].map((f) => (
                <label key={f.l} className="block">
                  <span className="flex items-baseline justify-between text-[12px] text-d-mute">
                    {f.l}
                    <span className="tnum font-mono text-[12px] font-semibold text-d-ink">{f.fmt(f.v)}</span>
                  </span>
                  <input type="range" min={f.min} max={f.max} step={f.step} value={f.v} onChange={(e) => f.set(Number(e.target.value))} className="mt-1 w-full accent-[var(--d-accent)]" />
                </label>
              ))}
            </div>
            <div className="flex flex-col rounded-[14px] bg-d-sunk p-4">
              <p className="text-[12px] text-d-mute">Price per piece</p>
              <p className="desk-h tnum text-[32px] font-semibold leading-tight">{inr(price)}</p>
              <ul className="mt-3 space-y-1.5 text-[12.5px]">
                {[
                  { k: "Material", v: material },
                  { k: "Machining", v: machining },
                  { k: "Outside work", v: outside },
                  { k: "Overhead", v: (material + machining + outside) * (overhead / 100) },
                  { k: "Margin", v: price - cost },
                ].map((r) => (
                  <li key={r.k} className="flex justify-between">
                    <span className="text-d-mute">{r.k}</span>
                    <span className="tnum font-mono">{inr(r.v)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex h-2.5 overflow-hidden rounded-full">
                {[
                  { v: material, t: "info" as Tone },
                  { v: machining, t: "accent" as Tone },
                  { v: outside + (material + machining + outside) * (overhead / 100), t: "neutral" as Tone },
                  { v: price - cost, t: "ok" as Tone },
                ].map((b, i) => (
                  <span key={i} style={{ width: `${(b.v / price) * 100}%`, background: toneVar(b.t) }} />
                ))}
              </div>
              <div className="mt-4 border-t border-d-line pt-3 text-[12.5px]">
                <p className="flex justify-between">
                  <span className="text-d-mute">{qty} nos, taxable</span>
                  <span className="tnum font-mono">{inr(total, { compact: true })}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-d-mute">GST 18%</span>
                  <span className="tnum font-mono">{inr(total * 0.18, { compact: true })}</span>
                </p>
                <p className="mt-1 flex justify-between font-semibold">
                  <span>Quote total</span>
                  <span className="tnum font-mono">{inr(total * 1.18, { compact: true })}</span>
                </p>
              </div>
              {margin < 20 && <p className="mt-2 text-[11.5px] text-d-late">Below the 20% floor: needs Senthil.</p>}
              <Btn
                variant="solid"
                icon={FileText}
                className="mt-auto"
                onClick={() => {
                  const id = `Q-0${928 + quotes.length - seedQuotes.length}`;
                  setQuotes((cur) => [{ id, customer: cust, part: "From calculator", qty, value: Math.round(total), margin, ageH: 0, status: margin < 20 ? "Drafting" : "Sent", by: "Meena", source: "Email", replyBy: 48 }, ...cur]);
                  toast.success(`${id} ${margin < 20 ? "drafted for approval" : "sent"}`, { description: `${cust} · ${inr(total, { compact: true })} + GST at ${margin}% margin` });
                  desk.log(`${id} for ${cust}: ${inr(total, { compact: true })} at ${margin}%`, "info");
                }}
              >
                {margin < 20 ? "Draft for approval" : "Create & send quote"}
              </Btn>
            </div>
          </div>
        </Panel>
        <div className="space-y-5">
          <Panel title="Won and lost by month" sub="Value, ₹ lakh">
            <Bars
              height={170}
              format={(v) => `₹${v}L`}
              data={[
                { label: "May", value: 22, stack: [{ name: "Won", value: 12, tone: "ok" }, { name: "Lost", value: 10, tone: "late" }] },
                { label: "Jun", value: 26, stack: [{ name: "Won", value: 15, tone: "ok" }, { name: "Lost", value: 11, tone: "late" }] },
                { label: "Jul", value: 31, stack: [{ name: "Won", value: 19, tone: "ok" }, { name: "Lost", value: 12, tone: "late" }] },
                { label: "Aug", value: 24, stack: [{ name: "Won", value: 14, tone: "ok" }, { name: "Lost", value: 10, tone: "late" }] },
                { label: "Sep", value: 34, stack: [{ name: "Won", value: 21, tone: "ok" }, { name: "Lost", value: 13, tone: "late" }] },
                { label: "Oct", value: 29, stack: [{ name: "Won", value: 18, tone: "ok" }, { name: "Lost", value: 11, tone: "late" }] },
              ]}
            />
          </Panel>
          <Panel title="Why we lose" sub="Last 40 lost quotes">
            <Donut
              center="40"
              sub="lost"
              segments={[
                { label: "Price", value: 17, tone: "late" },
                { label: "Lead time", value: 11, tone: "warn" },
                { label: "Replied too late", value: 7, tone: "accent" },
                { label: "Spec / capability", value: 5, tone: "info" },
              ]}
            />
          </Panel>
        </div>
      </div>
      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={open ? `${open.id} · via ${open.source} · by ${open.by}` : ""}
        title={open?.customer ?? ""}
        sub={open ? `${open.part} · ${open.qty} nos` : ""}
        footer={
          open && open.status !== "Won" && open.status !== "Lost" ? (
            <>
              <select className={`${inputClass} h-9 w-auto`} value={reason} onChange={(e) => setReason(e.target.value)}>
                {["Price", "Lead time", "Replied too late", "Spec / capability"].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              <Btn variant="danger" onClick={() => decide(open, "Lost", reason)}>
                Lost
              </Btn>
              <Btn variant="solid" icon={CheckCheck} onClick={() => decide(open, "Won")}>
                Won
              </Btn>
            </>
          ) : (
            <Btn variant="solid" onClick={() => setOpen(null)}>
              Done
            </Btn>
          )
        }
      >
        {open && (
          <div className="space-y-5">
            <KV
              items={[
                { k: "Value", v: inr(open.value) },
                { k: "With GST", v: inr(open.value * 1.18) },
                { k: "Margin", v: `${open.margin}%` },
                { k: "Age", v: <AgeClock hours={open.ageH} /> },
                { k: "Status", v: <Pill tone={qTone[open.status]}>{open.status}</Pill> },
                { k: "Reply by", v: open.replyBy > 0 ? <Countdown compact inHours={open.replyBy} /> : open.reason ?? "—" },
              ]}
            />
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Cost sheet</p>
              <HBars
                format={(v) => inr(v, { compact: true })}
                data={[
                  { label: "Material", value: Math.round(open.value * 0.34), tone: "info" },
                  { label: "Machining", value: Math.round(open.value * 0.27), tone: "accent" },
                  { label: "Fabrication", value: Math.round(open.value * 0.09), tone: "accent" },
                  { label: "Outside + overhead", value: Math.round(open.value * (0.3 - open.margin / 100)), tone: "neutral" },
                  { label: "Margin", value: Math.round(open.value * (open.margin / 100)), tone: "ok" },
                ]}
              />
            </div>
            <div className="rounded-[12px] bg-d-soft p-3 text-[13px] leading-relaxed">
              <b>Quote Desk:</b> {open.customer} has awarded us {open.margin > 25 ? "3 of the last 5" : "2 of the last 6"} jobs. {open.status === "Negotiating" ? "They usually settle within 3% of our first number." : "They respond best to a call from Senthil after day 3."}
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Materials ---------------- */

function MaterialsTab() {
  const desk = useDesk();
  const [mats, setMats] = React.useState(seedMats);
  const [pos, setPos] = React.useState(seedPOs);
  const [raising, setRaising] = React.useState<Mat | null>(null);
  const [qty, setQty] = React.useState("0");
  const [rate, setRate] = React.useState("0");
  const short = mats.filter((m) => m.stock < m.need);

  function openPO(m: Mat) {
    setRaising(m);
    setQty(String(Math.ceil((m.need - m.stock) * 1.1)));
    setRate(String(m.rate));
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Items short for open jobs" value={short.length} delta="+2" deltaGood={false} hint="next 7 days" icon={TriangleAlert} tone="late" />
        <Stat label="Stock value" value={inr(mats.reduce((a, m) => a + m.stock * m.rate, 0), { compact: true })} hint="steel, consumables, tools" icon={Boxes} trend={[6.2, 6.8, 7.1, 6.6, 6.4, 6.9, 7.2]} />
        <Stat label="POs open" value={pos.filter((p) => p.status !== "Received").length} hint={`${inr(pos.filter((p) => p.status !== "Received").reduce((a, p) => a + p.amount, 0), { compact: true })} with suppliers`} icon={FileText} tone="info" />
        <Stat label="Steel price, EN8" value="₹82/kg" delta="+₹3" deltaGood={false} hint="Sri Balaji, this week" icon={IndianRupee} tone="warn" trend={[76, 77, 78, 78, 79, 80, 82]} />
      </div>
      <Panel title="Stock against job needs" sub="What the open job cards will consume, from their BOMs. Raise a PO in one click.">
        <DataTable
          rows={mats}
          rowKey={(m) => m.code}
          search={(m) => `${m.code} ${m.item} ${m.supplier} ${m.jobs}`}
          searchPlaceholder="Search item, supplier or job"
          filter={{ get: (m) => (m.stock >= m.need ? "Covered" : m.stock / m.need > 0.5 ? "Low" : "Short"), options: ["Short", "Low", "Covered"] }}
          pageSize={10}
          columns={[
            { key: "code", label: "Code", render: (m) => <span className="font-mono text-[12px] text-d-mute">{m.code}</span> },
            { key: "item", label: "Item", render: (m) => <span className="font-medium">{m.item}</span>, sort: (m) => m.item },
            { key: "jobs", label: "For", render: (m) => <span className="text-[12px] text-d-mute">{m.jobs}</span>, wide: true },
            { key: "stock", label: "Stock", align: "right", render: (m) => <span className="tnum font-mono">{num(m.stock)} {m.unit}</span>, sort: (m) => m.stock },
            { key: "need", label: "Need", align: "right", render: (m) => <span className="tnum font-mono">{num(m.need)}</span>, sort: (m) => m.need },
            {
              key: "cover",
              label: "Cover",
              render: (m) => (
                <div className="flex min-w-[110px] items-center gap-2">
                  <Meter value={Math.min(m.stock, m.need)} max={m.need} tone={m.stock >= m.need ? "ok" : m.stock / m.need > 0.5 ? "warn" : "late"} />
                  <span className="tnum font-mono text-[11px] text-d-mute">{Math.round(Math.min(1, m.stock / m.need) * 100)}%</span>
                </div>
              ),
              sort: (m) => m.stock / m.need,
            },
            { key: "mtc", label: "MTC", align: "center", render: (m) => (m.mtc ? <Pill tone="ok">Yes</Pill> : <span className="text-d-mute">—</span>), wide: true },
            {
              key: "act",
              label: "",
              align: "right",
              render: (m) =>
                m.stock >= m.need ? (
                  <Pill tone="ok">Covered</Pill>
                ) : pos.some((p) => p.item === m.item && p.status !== "Received") ? (
                  <Pill tone="info">PO raised</Pill>
                ) : (
                  <Btn
                    size="sm"
                    variant="soft"
                    onClick={(e) => {
                      e.stopPropagation();
                      openPO(m);
                    }}
                  >
                    Raise PO
                  </Btn>
                ),
            },
          ]}
        />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1fr_1.1fr]">
        <Panel title="Shortfall" sub="Units short against open jobs">
          {short.length ? <HBars data={short.map((m) => ({ label: m.item, value: m.need - m.stock, sub: m.unit, tone: (m.stock / m.need < 0.5 ? "late" : "warn") as Tone }))} /> : <p className="py-6 text-center text-[13px] text-d-mute">Everything is covered.</p>}
        </Panel>
        <Panel title="Purchase orders" sub="Mark a delivery received and stock goes up">
          <ul className="divide-y divide-d-line">
            {pos.map((p) => (
              <li key={p.no} className="flex flex-wrap items-center gap-3 py-2.5">
                <Package className="h-4 w-4 text-d-mute" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-medium">
                    {p.item} <span className="font-mono text-[11.5px] text-d-mute">· {num(p.qty)} {p.unit}</span>
                  </p>
                  <p className="truncate text-[12px] text-d-mute">
                    {p.no} · {p.supplier} · {inr(p.amount)}
                  </p>
                </div>
                <span className="font-mono text-[12px] text-d-mute">{p.eta}</span>
                {p.status === "Received" ? (
                  <Pill tone="ok">Received</Pill>
                ) : (
                  <Btn
                    size="sm"
                    variant="outline"
                    icon={CheckCheck}
                    onClick={() => {
                      setPos((cur) => cur.map((x) => (x.no === p.no ? { ...x, status: "Received", eta: "Received today" } : x)));
                      setMats((cur) => cur.map((m) => (m.item.startsWith(p.item.split(" ").slice(0, 2).join(" ")) ? { ...m, stock: m.stock + p.qty } : m)));
                      toast.success(`${p.no} received`, { description: `${num(p.qty)} ${p.unit} of ${p.item} · GRN in Tally` });
                      desk.log(`GRN: ${p.item}, ${num(p.qty)} ${p.unit} from ${p.supplier}`, "ok");
                    }}
                  >
                    {p.status} · Receive
                  </Btn>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <Panel title="Steel consumed per week" sub="kg, all grades">
        <AreaChart
          labels={["W36", "W37", "W38", "W39", "W40", "W41", "W42", "W43"]}
          series={[
            { name: "Mild steel", data: [3800, 4200, 3900, 4600, 5100, 4700, 5300, 4900], tone: "accent" },
            { name: "Stainless", data: [600, 720, 540, 880, 940, 820, 1020, 1100], tone: "info" },
            { name: "Alloy & tool steel", data: [900, 1100, 1300, 1000, 1250, 1400, 1380, 1520], tone: "warn" },
          ]}
          format={(v) => `${num(Math.round(v))} kg`}
          height={180}
        />
      </Panel>
      <Modal open={!!raising} onOpenChange={(o) => !o && setRaising(null)} title={`Raise PO · ${raising?.item ?? ""}`} sub={raising ? `${raising.supplier} · lead time ${raising.lead}. Goes to Tally and the supplier on WhatsApp.` : ""} width={500}>
        {raising && (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const amount = Math.round(Number(qty) * Number(rate) * 1.18);
              const no = `KPW/PO/${1185 + pos.length - seedPOs.length}`;
              setPos((cur) => [{ no, supplier: raising.supplier, item: raising.item, qty: Number(qty), unit: raising.unit, amount, eta: raising.lead, status: amount > 50000 ? "Sent" : "Confirmed" }, ...cur]);
              toast.success(`${no} ${amount > 50000 ? "sent for Senthil's approval" : "auto-approved and sent"}`, { description: `${num(Number(qty))} ${raising.unit} · ${inr(amount)} incl. GST` });
              desk.log(`${no}: ${raising.item}, ${inr(amount)}`, "info");
              setRaising(null);
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <Field label={`Quantity (${raising.unit})`}>
                <input className={inputClass} inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))} />
              </Field>
              <Field label={`Rate (₹/${raising.unit})`}>
                <input className={inputClass} inputMode="numeric" value={rate} onChange={(e) => setRate(e.target.value.replace(/[^\d.]/g, ""))} />
              </Field>
            </div>
            <div className="rounded-[12px] bg-d-sunk p-3 text-[13px]">
              <p className="flex justify-between">
                <span className="text-d-mute">Taxable</span>
                <span className="tnum font-mono">{inr(Number(qty) * Number(rate))}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-d-mute">GST 18%</span>
                <span className="tnum font-mono">{inr(Number(qty) * Number(rate) * 0.18)}</span>
              </p>
              <p className="mt-1 flex justify-between font-semibold">
                <span>PO total</span>
                <span className="tnum font-mono">{inr(Number(qty) * Number(rate) * 1.18)}</span>
              </p>
              <p className="mt-2 text-[11.5px] text-d-mute">{Number(qty) * Number(rate) * 1.18 > 50000 ? "Over ₹50,000: goes to Senthil to approve." : "Under ₹50,000 from an approved vendor: auto-approved."}</p>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Btn onClick={() => setRaising(null)}>Cancel</Btn>
              <Btn variant="solid" type="submit" icon={Send}>
                Raise PO
              </Btn>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

/* ---------------- Dispatch & billing ---------------- */

function DispatchTab() {
  const s = useShopActions();
  const desk = useDesk();
  const [invoices, setInvoices] = React.useState(seedInvoices);
  const [billing, setBilling] = React.useState<Shipped | null>(null);
  const [remind, setRemind] = React.useState<Inv | null>(null);
  const [sent, setSent] = React.useState<Set<string>>(new Set());
  const atBay = s.jobs.filter((j) => j.station === "Dispatch");
  const toBill = s.shipped.filter((x) => !x.invoiced);
  const grossOf = (i: Inv) => i.taxable * 1.18;
  const total = invoices.reduce((a, i) => a + grossOf(i), 0);
  const bucket = (d: number) => (d <= 30 ? "0-30 days" : d <= 60 ? "31-60 days" : d <= 90 ? "61-90 days" : "90+ days");
  const buckets = ["0-30 days", "31-60 days", "61-90 days", "90+ days"].map((label, i) => ({ label, value: invoices.filter((x) => bucket(x.days) === label).reduce((a, x) => a + grossOf(x), 0), tone: (["ok", "info", "warn", "late"] as const)[i] }));
  const g = billing ? gstFor(billing.customer, billing.value) : null;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="At the dispatch bay" value={atBay.length} hint={inr(atBay.reduce((a, j) => a + j.value, 0), { compact: true })} icon={Truck} />
        <Stat label="Shipped, not invoiced" value={toBill.length} hint={inr(toBill.reduce((a, x) => a + x.value, 0), { compact: true })} icon={Receipt} tone="warn" />
        <Stat label="Receivables (with GST)" value={inr(total, { compact: true })} delta="+6%" deltaGood={false} hint="vs last month" icon={IndianRupee} tone="late" trend={[18, 19, 19, 20, 21, 22, total / 1e5]} />
        <Stat label="Average days to collect" value="58" delta="+7" deltaGood={false} hint="terms average 42" icon={Timer} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel icon={Package} title="Ready at the bay" sub="Packed and tested. Ship it and it moves to billing.">
          {atBay.length ? (
            <ul className="space-y-2">
              {atBay.map((j) => (
                <li key={j.id} className="flex items-center gap-3 rounded-[12px] border border-d-line p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold">
                      <span className="font-mono text-[12px] text-d-mute">{j.id}</span> {j.part}
                    </p>
                    <p className="text-[12px] text-d-mute">
                      {j.customer}, {customers[j.customer]?.city} · {inr(j.value, { compact: true })} · due <Countdown compact inHours={j.dueH} />
                    </p>
                  </div>
                  <Btn size="sm" variant="solid" icon={Truck} onClick={() => s.ship(j.id)}>
                    Ship
                  </Btn>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-[13px] text-d-mute">Nothing at the bay. Jobs arrive here from Test.</p>
          )}
        </Panel>
        <Panel icon={Receipt} title="Shipped, waiting for an invoice" sub="Tax invoice and e-way bill in one go">
          {toBill.length ? (
            <ul className="space-y-2">
              {toBill.map((x) => (
                <li key={x.id} className="flex items-center gap-3 rounded-[12px] border border-d-line p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold">
                      <span className="font-mono text-[12px] text-d-mute">{x.id}</span> {x.part}
                    </p>
                    <p className="text-[12px] text-d-mute">
                      {x.customer} · {inr(x.value)} · {x.at}
                    </p>
                  </div>
                  <Btn size="sm" variant="soft" icon={FileText} onClick={() => setBilling(x)}>
                    Invoice
                  </Btn>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-[13px] text-d-mute">Everything shipped is invoiced.</p>
          )}
        </Panel>
      </div>
      <Panel title="Ageing" sub="From Tally, with GST. Reminders go out at 5 PM unless you stop them.">
        <AgingBar buckets={buckets} format={(v) => inr(v, { compact: true })} />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <Panel title="Invoices outstanding" sub="Select rows to remind in one go; click one for the WhatsApp draft">
          <DataTable
            rows={invoices}
            rowKey={(i) => i.no}
            search={(i) => `${i.no} ${i.customer} ${i.job}`}
            searchPlaceholder="Search invoice or customer"
            filter={{ get: (i) => bucket(i.days), options: ["0-30 days", "31-60 days", "61-90 days", "90+ days"] }}
            onRow={setRemind}
            bulk={[{ label: "Send WhatsApp reminders", run: (k) => { setSent((cur) => new Set([...cur, ...k])); toast.success(`${k.length} reminders sent`); desk.log(`${k.length} payment reminders sent`, "info"); } }]}
            columns={[
              { key: "no", label: "Invoice", render: (i) => <span className="font-mono text-[12px]">{i.no}</span> },
              { key: "c", label: "Customer", render: (i) => <span className="font-medium">{i.customer}</span>, sort: (i) => i.customer },
              { key: "j", label: "For", render: (i) => <span className="text-d-mute">{i.job}</span>, wide: true },
              { key: "amt", label: "With GST", align: "right", render: (i) => <span className="tnum font-mono">{inr(grossOf(i))}</span>, sort: (i) => grossOf(i) },
              { key: "d", label: "Days", align: "right", render: (i) => <span className="tnum font-mono" style={{ color: i.days > 90 ? "var(--d-late)" : i.days > 60 ? "var(--d-warn)" : undefined }}>{i.days}</span>, sort: (i) => i.days },
              { key: "p", label: "Promise", render: (i) => (sent.has(i.no) ? <Pill tone="info">Reminded</Pill> : i.promise ? <Pill tone="ok">{i.promise}</Pill> : <span className="text-d-mute">—</span>) },
            ]}
          />
        </Panel>
        <Panel title="Collections forecast" sub="Promises + each customer's habit">
          <Bars height={200} format={(v) => `₹${v}L`} data={[{ label: "This wk", value: 6.4, tone: "ok" }, { label: "Next wk", value: 5.1, tone: "accent" }, { label: "Wk 3", value: 4.2, tone: "accent" }, { label: "Wk 4", value: 3.0, tone: "info" }, { label: "Later", value: 4.1, tone: "late" }]} />
        </Panel>
      </div>
      <Sheet
        open={!!billing}
        onOpenChange={(o) => !o && setBilling(null)}
        width={520}
        eyebrow={billing ? `Tax invoice · ${billing.id}` : ""}
        title={billing?.customer ?? ""}
        sub={billing ? `${customers[billing.customer]?.city}, ${customers[billing.customer]?.st === "KA" ? "Karnataka (inter-state)" : "Tamil Nadu"} · ${billing.part}` : ""}
        footer={
          billing && (
            <Btn
              variant="solid"
              icon={Send}
              onClick={() => {
                const no = `KPW/26-27/0${439 + invoices.length - seedInvoices.length}`;
                s.setShipped((cur) => cur.map((x) => (x.id === billing.id ? { ...x, invoiced: true } : x)));
                setInvoices((cur) => [{ no, customer: billing.customer, job: `${billing.id} ${billing.part.split(",")[0].toLowerCase()}`, taxable: billing.value, days: 0, terms: "45 days", eway: billing.value > 50000 ? "EWB 3318 5012 7781" : "—" }, ...cur]);
                toast.success(`${no} raised`, { description: `${inr(billing.value * 1.18)} with GST${billing.value > 50000 ? " · e-way bill generated" : ""} · sent on WhatsApp` });
                desk.log(`Invoice ${no} to ${billing.customer}, ${inr(billing.value * 1.18, { compact: true })}`, "ok");
                setBilling(null);
              }}
            >
              Raise invoice{billing.value > 50000 ? " + e-way bill" : ""}
            </Btn>
          )
        }
      >
        {billing && g && (
          <div className="space-y-4">
            <div className="rounded-[14px] border border-d-line p-4 font-mono text-[12px]">
              <div className="flex justify-between border-b border-dashed border-d-line pb-2">
                <span>Kaveri Precision Works</span>
                <span className="text-d-mute">GSTIN 33AAKFK4821M1Z7</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-d-mute">HSN</span>
                <span>{billing.part.includes("Fixture") || billing.part.includes("fixture") ? "8466" : billing.part.includes("duct") ? "7308" : "8479"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-d-mute">Taxable value</span>
                <span>{inr(billing.value)}</span>
              </div>
              {g.inter ? (
                <div className="flex justify-between">
                  <span className="text-d-mute">IGST 18%</span>
                  <span>{inr(g.igst)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-d-mute">CGST 9%</span>
                    <span>{inr(g.cgst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-d-mute">SGST 9%</span>
                    <span>{inr(g.sgst)}</span>
                  </div>
                </>
              )}
              <div className="mt-2 flex justify-between border-t border-dashed border-d-line pt-2 text-[14px] font-semibold">
                <span>Invoice total</span>
                <span>{inr(g.total)}</span>
              </div>
            </div>
            <KV items={[{ k: "Place of supply", v: g.inter ? "29 – Karnataka" : "33 – Tamil Nadu" }, { k: "Tax", v: g.label }, { k: "E-way bill", v: billing.value > 50000 ? "Required, will generate" : "Not needed" }, { k: "Vehicle", v: "TN 70 AK 4412 (tempo)" }]} />
            <p className="rounded-[12px] bg-d-soft p-3 text-[12.5px] leading-relaxed">The Billing Clerk posts this to Tally, generates the e-way bill on the NIC portal and sends the PDF with the inspection report to the customer on WhatsApp.</p>
          </div>
        )}
      </Sheet>
      <Sheet
        open={!!remind}
        onOpenChange={(o) => !o && setRemind(null)}
        eyebrow={remind?.no}
        title={remind?.customer ?? ""}
        sub={remind ? `${inr(grossOf(remind))} · ${remind.days} days · terms ${remind.terms}` : ""}
        footer={
          <Btn
            variant="solid"
            icon={Send}
            onClick={() => {
              if (!remind) return;
              setSent((cur) => new Set(cur).add(remind.no));
              toast.success("Reminder sent on WhatsApp", { description: remind.customer });
              desk.log(`Reminder to ${remind.customer} for ${inr(grossOf(remind), { compact: true })}`, "info");
              setRemind(null);
            }}
          >
            Send on WhatsApp
          </Btn>
        }
      >
        {remind && (
          <div className="space-y-4">
            <div className="rounded-[14px] bg-[#e7f6e9] p-4 text-[13.5px] leading-relaxed text-[#1d3b22]">
              Vanakkam, a gentle reminder from Kaveri Precision Works. Invoice {remind.no} for {remind.job}, {inr(grossOf(remind))} including GST, is {remind.days} days old against {remind.terms} terms. Bank: HDFC Hosur, A/c 50200048211903, IFSC HDFC0001722. Thank you. — Lakshmi, Accounts
            </div>
            <KV items={[{ k: "E-way bill", v: remind.eway }, { k: "Terms", v: remind.terms }, { k: "Last promise", v: remind.promise ?? "None" }, { k: "Reminders so far", v: remind.days > 60 ? "3" : "1" }]} />
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Quality ---------------- */

const ncrCols: { id: NcrStage; label: string; tone: Tone; limit?: number; hint: string }[] = [
  { id: "Open", label: "Open", tone: "late", hint: "Found, not yet contained" },
  { id: "Containment", label: "Containment", tone: "warn", hint: "Stock checked, parts held" },
  { id: "Root cause", label: "Root cause", tone: "info", limit: 3, hint: "5-why in progress" },
  { id: "CAPA", label: "CAPA", tone: "accent", hint: "Fix on the floor + SOP" },
  { id: "Closed", label: "Closed", tone: "ok", hint: "Verified on next lot" },
];

function QualityTab() {
  const s = useShopActions();
  const desk = useDesk();
  const [open, setOpen] = React.useState<string | null>(null);
  const [checks, setChecks] = React.useState([
    { id: "c1", label: "JC-2480 brackets: CMM on 40 pcs", sub: "36 OK, 4 bores oversize, NCR-124", done: true },
    { id: "c2", label: "JC-2479 test fixture: trial with Bagalur part", sub: "Clamp force + locating pins", done: false },
    { id: "c3", label: "JC-2474 agitator: run-out on shaft", sub: "≤ 0.05 mm TIR", done: true },
    { id: "c4", label: "JC-2477 base plates: thread gauge M16", sub: "Go / NoGo on 48 holes", done: false },
    { id: "c5", label: "Weld bay 1: wire oven at 120 °C", sub: "After NCR-126", done: false },
    { id: "c6", label: "Calibration: Mitutoyo micrometer set", sub: "Due 22 Oct", done: false },
  ]);
  const ncr = s.ncrs.find((n) => n.id === open) ?? null;
  const openCount = s.ncrs.filter((n) => n.stage !== "Closed").length;
  const cost = s.ncrs.reduce((a, n) => a + n.cost, 0);
  const update = (id: string, patch: Partial<Ncr>) => s.setNcrs((cur) => cur.map((n) => (n.id === id ? { ...n, ...patch } : n)));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="First-pass yield" value="93.4%" delta="-1.2%" deltaGood hint="target 97%" icon={CheckCheck} tone="warn" trend={[95.8, 95.4, 95, 94.8, 94.1, 93.8, 93.4]} />
        <Stat label="NCRs open" value={openCount} delta={`+${Math.max(0, openCount - 4)}`} deltaGood={false} hint="2 past 7 days" icon={ShieldCheck} tone="late" />
        <Stat label="Cost of poor quality, Oct" value={inr(cost, { compact: true })} hint="rework hours + scrap" icon={IndianRupee} tone="late" trend={[22, 28, 31, 36, 40, 45, cost / 1000]} />
        <Stat label="Customer complaints" value="1" delta="-2" deltaGood={false} hint="NCR-121, Kelamangalam" icon={TriangleAlert} tone="info" />
      </div>
      <Panel title="NCR board" sub="Drag an NCR as it moves from found to fixed. Jobs sent back on the conveyor land in Open.">
        <Board
          columns={ncrCols}
          items={s.ncrs}
          itemKey={(n) => n.id}
          getColumn={(n) => n.stage}
          minColumnWidth={210}
          onMove={(id, col) => {
            update(id, { stage: col as NcrStage });
            toast.success(`${id} → ${col}`);
            desk.log(`${id} moved to ${col}`, col === "Closed" ? "ok" : "info");
          }}
          renderCard={(n) => (
            <button type="button" onClick={() => setOpen(n.id)} className="block w-full text-left">
              <p className="flex items-center gap-2">
                <span className="font-mono text-[11.5px] font-semibold">{n.id}</span>
                <span className="font-mono text-[11px] text-d-mute">{n.job}</span>
              </p>
              <p className="mt-1 text-[13px] font-medium leading-snug">{n.defect}</p>
              <p className="mt-0.5 truncate text-[11.5px] text-d-mute">
                {n.part} · {n.qty} pcs
              </p>
              <p className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-d-mute">{n.owner}</span>
                <span className="tnum font-mono font-semibold">{inr(n.cost, { compact: true })}</span>
              </p>
            </button>
          )}
        />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title="Defects, last 90 days" sub="Pareto by type">
          <HBars
            data={[
              { label: "Weld porosity / cracks", value: 21, tone: "late" },
              { label: "Bore / dia out of tolerance", value: 16, tone: "warn" },
              { label: "Flatness / distortion", value: 12, tone: "warn" },
              { label: "Wrong drawing revision", value: 7, tone: "accent" },
              { label: "Thread gauge fail", value: 6, tone: "info" },
              { label: "Paint / finish", value: 5, tone: "neutral" },
            ]}
          />
        </Panel>
        <Panel title="First-pass yield by week" sub="Parts passing Test the first time">
          <AreaChart
            labels={["W37", "W38", "W39", "W40", "W41", "W42", "W43"]}
            series={[
              { name: "FPY", data: [96.1, 95.8, 95.4, 95.0, 94.6, 93.9, 93.4], tone: "accent" },
              { name: "Target", data: [97, 97, 97, 97, 97, 97, 97], tone: "ok", dashed: true },
            ]}
            format={(v) => `${v.toFixed(1)}%`}
            height={180}
          />
        </Panel>
        <Panel title="Today's inspections" sub="Deepa's list, ticks go on the job card">
          <Checklist
            items={checks}
            onToggle={(id) => {
              const c = checks.find((x) => x.id === id);
              setChecks((cur) => cur.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
              if (c && !c.done) desk.log(`Inspection done: ${c.label}`, "ok");
            }}
          />
        </Panel>
      </div>
      <Sheet
        open={!!ncr}
        onOpenChange={(o) => !o && setOpen(null)}
        width={520}
        eyebrow={ncr ? `${ncr.id} · ${ncr.job} · found at ${ncr.found}` : ""}
        title={ncr?.defect ?? ""}
        sub={ncr ? `${ncr.part} · ${ncr.customer} · ${ncr.qty} pcs` : ""}
        footer={
          ncr && (
            <>
              <Btn
                icon={Ruler}
                onClick={() => {
                  toast("8D report drafted", { description: `${ncr.id} · NCR Scribe filled D1–D5 from the photos` });
                  desk.log(`8D draft for ${ncr.id}`);
                }}
              >
                Draft 8D
              </Btn>
              <Btn
                variant="solid"
                icon={ArrowRight}
                disabled={ncr.stage === "Closed"}
                onClick={() => {
                  const nextStage = ncrCols[Math.min(ncrCols.length - 1, ncrCols.findIndex((c) => c.id === ncr.stage) + 1)].id;
                  update(ncr.id, { stage: nextStage });
                  toast.success(`${ncr.id} → ${nextStage}`);
                  desk.log(`${ncr.id} moved to ${nextStage}`, nextStage === "Closed" ? "ok" : "info");
                }}
              >
                {ncr.stage === "Closed" ? "Closed" : `Move to ${ncrCols[ncrCols.findIndex((c) => c.id === ncr.stage) + 1]?.id}`}
              </Btn>
            </>
          )
        }
      >
        {ncr && (
          <div className="space-y-5">
            <KV items={[{ k: "Stage", v: <Pill tone={ncrCols.find((c) => c.id === ncr.stage)?.tone}>{ncr.stage}</Pill> }, { k: "Owner", v: ncr.owner }, { k: "Cost", v: inr(ncr.cost) }, { k: "Quantity", v: `${ncr.qty} pcs` }]} />
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Disposition</p>
              <Segmented
                size="sm"
                options={["Pending", "Rework", "Use as is", "Scrap"] as const}
                value={ncr.disposition}
                onChange={(v) => {
                  update(ncr.id, { disposition: v });
                  desk.log(`${ncr.id} disposition: ${v}`);
                }}
              />
              {ncr.disposition === "Use as is" && <p className="mt-2 text-[12px] text-d-warn">Needs a concession signed by the customer.</p>}
            </div>
            <Field label="Root cause (5-why)">
              <textarea className={`${inputClass} h-24 py-2`} value={ncr.cause} placeholder="Why did it happen? Why was it not caught?" onChange={(e) => update(ncr.id, { cause: e.target.value })} />
            </Field>
            <div className="rounded-[12px] bg-d-soft p-3 text-[13px] leading-relaxed">
              <b>NCR Scribe:</b> {ncr.defect.toLowerCase().includes("weld") ? "3 of the last 5 weld NCRs came from consumables stored open. Suggested CAPA: wire oven at 120 °C, log on the job card." : ncr.defect.toLowerCase().includes("revision") ? "Floor printouts outlive revisions. Suggested CAPA: drawings only from PDM on the floor tablet." : "Similar defects in the last 90 days point to tool life. Suggested CAPA: tool life counters on the CNC."}
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
