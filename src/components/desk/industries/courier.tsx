"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Banknote,
  Bike,
  Bot,
  Boxes,
  Building2,
  CheckCheck,
  Clock,
  FileText,
  Gauge as GaugeIcon,
  IndianRupee,
  Layers,
  MapPin,
  MessageCircle,
  Package,
  PackageX,
  Phone,
  Plug,
  Plus,
  RotateCcw,
  Route,
  ScanLine,
  Send,
  Truck,
  Undo2,
  Users,
  Wallet,
  Warehouse,
} from "lucide-react";
import { DeskShell, useDesk } from "../shell";
import { AreaChart, Bars, Donut, HBars, HeatGrid } from "../charts";
import { AgingBar, ApprovalQueue, Board, Countdown, DataTable } from "../data";
import { AgentsModule, ConnectionsModule, IndependenceModule, PeopleModule } from "../common";
import { Avatar, Btn, Field, inputClass, inr, KV, Meter, Modal, Panel, Pill, Segmented, Sheet, Stat, num } from "../ui";
import { useDrift } from "../hooks";
import type { DeskConfig, DeskModule, IndependenceData, Integration, TeamMember, Tone, WorkforceAgent } from "../types";

/* ============================================================
   Data — Sabarmati Couriers, Ahmedabad. Fictional last-mile + B2B courier.
   3 hubs (SG Highway, Naroda, Aslali), 85 riders, ~3,400 shipments a day.
   Map viewBox is 1000 × 600; the Sabarmati runs down the middle.
   ============================================================ */

type HubId = "SG Highway" | "Naroda" | "Aslali";
type Pt = [number, number];

const hubs: { id: HubId; at: Pt; riders: number; area: string }[] = [
  {
    id: "SG Highway",
    at: [180, 250],
    riders: 34,
    area: "West: Bodakdev, Thaltej, Bopal, Satellite",
  },
  {
    id: "Naroda",
    at: [850, 120],
    riders: 27,
    area: "North-east: Naroda, Nikol, Bapunagar, Kalupur",
  },
  {
    id: "Aslali",
    at: [840, 540],
    riders: 24,
    area: "South-east: Vatva, Maninagar, Odhav, Aslali GIDC",
  },
];

const zones: {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  side: "West" | "East";
}[] = [
  { name: "Gota", x: 40, y: 20, w: 180, h: 110, side: "West" },
  { name: "Chandkheda", x: 240, y: 20, w: 200, h: 110, side: "West" },
  { name: "Thaltej", x: 40, y: 140, w: 180, h: 90, side: "West" },
  { name: "Navrangpura", x: 240, y: 140, w: 200, h: 120, side: "West" },
  { name: "Bopal", x: 40, y: 270, w: 150, h: 130, side: "West" },
  { name: "Satellite", x: 210, y: 270, w: 230, h: 120, side: "West" },
  { name: "Prahladnagar", x: 40, y: 410, w: 170, h: 170, side: "West" },
  { name: "Vejalpur", x: 230, y: 400, w: 210, h: 180, side: "West" },
  { name: "Kalupur", x: 520, y: 150, w: 140, h: 130, side: "East" },
  { name: "Naroda", x: 690, y: 20, w: 290, h: 130, side: "East" },
  { name: "Bapunagar", x: 680, y: 160, w: 150, h: 120, side: "East" },
  { name: "Nikol", x: 840, y: 160, w: 140, h: 170, side: "East" },
  { name: "Maninagar", x: 520, y: 300, w: 160, h: 130, side: "East" },
  { name: "Odhav", x: 700, y: 300, w: 130, h: 140, side: "East" },
  { name: "Ramol", x: 850, y: 345, w: 130, h: 95, side: "East" },
  { name: "Vatva", x: 520, y: 450, w: 200, h: 130, side: "East" },
  { name: "Aslali", x: 740, y: 450, w: 240, h: 130, side: "East" },
];

type StopState = "done" | "pending" | "failed";
type Stop = {
  id: string;
  name: string;
  kind: "Drop" | "Pickup";
  cod: number;
  fail?: string;
  f: number;
  awb: string;
};
type Rider = {
  id: string;
  name: string;
  phone: string;
  hub: HubId;
  side: "West" | "East";
  beat: string;
  bike: string;
  started: string;
  route: Pt[];
  start: number;
  speed: number;
  codBase: number;
  stops: Stop[];
};

function mkStops(rid: string, list: [string, number, string?][]): Stop[] {
  return list.map(([name, cod, fail], i) => ({
    id: `${rid}-${i}`,
    name: name.replace(/^PU: /, ""),
    kind: name.startsWith("PU: ") ? "Pickup" : "Drop",
    cod,
    fail,
    f: (i + 1) / (list.length + 1),
    awb: `SC${(48213070 + i * 37 + rid.charCodeAt(2) * 911).toString()}`,
  }));
}

const riders: Rider[] = [
  {
    id: "R-07",
    name: "Imran Pathan",
    phone: "98250 41177",
    hub: "Naroda",
    side: "East",
    beat: "Naroda · Bapunagar",
    bike: "GJ-01-PK-4471 · Splendor",
    started: "8:05 AM",
    route: [
      [850, 120],
      [850, 175],
      [780, 175],
      [780, 235],
      [700, 235],
      [700, 280],
      [815, 280],
    ],
    start: 0.46,
    speed: 0.0011,
    codBase: 2140,
    stops: mkStops("R-07", [
      ["Meena Jadeja, Naroda GIDC", 1299],
      ["Shreeji Mobile World", 0],
      ["Kalpesh Prajapati, Haridarshan", 649, "Customer not available"],
      ["PU: Navrang Sarees (seller)", 0],
      ["Asha Chavda, Bapunagar", 2349],
      ["Rahul Soni, Thakkarbapa Nagar", 0],
      ["Farida Shaikh, Rakhial", 899],
    ]),
  },
  {
    id: "R-12",
    name: "Jayesh Thakor",
    phone: "97129 33010",
    hub: "Naroda",
    side: "East",
    beat: "Nikol · Ramol",
    bike: "GJ-27-BH-1902 · Activa",
    started: "8:20 AM",
    route: [
      [850, 120],
      [930, 120],
      [930, 300],
      [865, 300],
      [865, 400],
      [790, 400],
    ],
    start: 0.3,
    speed: 0.0013,
    codBase: 1180,
    stops: mkStops("R-12", [
      ["Dhaval Patel, Nikol Gam", 549],
      ["Krupa Desai, Vastral", 0],
      ["Bhumi Kanzariya, Ramol", 1799],
      ["Sanjay Bharwad, CTM", 0, "Address incomplete"],
      ["PU: Zenith Lab Diagnostics", 0],
      ["Nirali Joshi, Odhav Ring Rd", 3499],
    ]),
  },
  {
    id: "R-21",
    name: "Mehul Rabari",
    phone: "99098 12754",
    hub: "Aslali",
    side: "East",
    beat: "Vatva · Maninagar",
    bike: "GJ-01-SY-8820 · Shine",
    started: "7:50 AM",
    route: [
      [840, 540],
      [700, 540],
      [700, 470],
      [620, 470],
      [620, 380],
      [560, 380],
    ],
    start: 0.55,
    speed: 0.001,
    codBase: 3610,
    stops: mkStops("R-21", [
      ["Vatva GIDC Ph-4, Plot 211", 0],
      ["Hetal Vora, Narol", 1149],
      ["Arif Memon, Isanpur", 799, "Refused COD"],
      ["Jignasha Mehta, Maninagar East", 0],
      ["Kankaria Book Depot", 0],
      ["Rutvik Shah, Jawahar Chowk", 2299],
      ["Manali Trivedi, LG Hospital Rd", 499],
    ]),
  },
  {
    id: "R-26",
    name: "Salim Shaikh",
    phone: "90330 76542",
    hub: "Aslali",
    side: "East",
    beat: "Aslali GIDC · Odhav",
    bike: "GJ-01-TR-0034 · Tempo 3W",
    started: "8:40 AM",
    route: [
      [840, 540],
      [925, 540],
      [925, 430],
      [820, 430],
      [820, 360],
      [740, 360],
    ],
    start: 0.22,
    speed: 0.0012,
    codBase: 0,
    stops: mkStops("R-26", [
      ["PU: Gujarat Agro Seeds, Aslali", 0],
      ["PU: Patel Auto Spares, Odhav", 0],
      ["Rajhans Pipes, Odhav GIDC", 0],
      ["PU: Riddhi Pharma Distributors", 0],
      ["Om Steel Traders, Ramol", 0],
    ]),
  },
  {
    id: "R-33",
    name: "Kiran Solanki",
    phone: "98795 50221",
    hub: "SG Highway",
    side: "West",
    beat: "Bopal · Prahladnagar",
    bike: "GJ-01-HZ-5519 · Jupiter EV",
    started: "8:10 AM",
    route: [
      [180, 250],
      [180, 335],
      [85, 335],
      [85, 455],
      [200, 455],
      [200, 545],
    ],
    start: 0.5,
    speed: 0.0012,
    codBase: 2860,
    stops: mkStops("R-33", [
      ["Priyanka Iyer, South Bopal", 1899],
      ["Vastrapur Organics", 0],
      ["Mitesh Gandhi, Ambli Rd", 0, "Customer not available"],
      ["Sneha Kapadia, Prahladnagar", 4299],
      ["Corporate Rd, Titanium City Ctr", 0],
      ["Ankit Bansal, Anandnagar", 1349],
      ["Devanshi Pandya, Makarba", 699],
    ]),
  },
  {
    id: "R-38",
    name: "Ravi Parmar",
    phone: "94272 66413",
    hub: "SG Highway",
    side: "West",
    beat: "Satellite · Vejalpur",
    bike: "GJ-01-QK-7703 · Splendor",
    started: "8:00 AM",
    route: [
      [180, 250],
      [300, 250],
      [300, 370],
      [385, 370],
      [385, 505],
      [290, 505],
    ],
    start: 0.38,
    speed: 0.0011,
    codBase: 1720,
    stops: mkStops("R-38", [
      ["Shivranjani Cross Rd, A-402", 999],
      ["Jodhpur Gam, Shyamal Row", 0],
      ["Pooja Rana, Jivraj Park", 1599, "Phone unreachable"],
      ["UrbanKurti.in return pickup", 0],
      ["Vejalpur, Shrinand Nagar", 2199],
      ["Nehal Dave, Juhapura Rd", 749],
    ]),
  },
  {
    id: "R-41",
    name: "Hardik Desai",
    phone: "97240 18809",
    hub: "SG Highway",
    side: "West",
    beat: "Thaltej · Gota",
    bike: "GJ-01-WM-3361 · Activa",
    started: "8:15 AM",
    route: [
      [180, 250],
      [180, 175],
      [95, 175],
      [95, 85],
      [205, 85],
      [205, 45],
    ],
    start: 0.62,
    speed: 0.0012,
    codBase: 3990,
    stops: mkStops("R-41", [
      ["Shilaj, Sobo Centre", 0],
      ["Thaltej Tekra, Aarohi Elysium", 2499],
      ["Ritu Ahuja, Hebatpur", 0],
      ["Gota, Vandematram City", 1299],
      ["Science City Rd, Sun Rise", 899, "Customer not available"],
      ["Vishal Raval, Ognaj", 1499],
    ]),
  },
  {
    id: "R-45",
    name: "Nilesh Chauhan",
    phone: "99251 70346",
    hub: "SG Highway",
    side: "West",
    beat: "Navrangpura · Chandkheda",
    bike: "GJ-01-KD-9128 · Shine",
    started: "8:30 AM",
    route: [
      [180, 250],
      [265, 250],
      [265, 160],
      [385, 160],
      [385, 70],
      [300, 70],
    ],
    start: 0.34,
    speed: 0.0013,
    codBase: 940,
    stops: mkStops("R-45", [
      ["CG Road, Supermall 2nd floor", 0],
      ["Gujarat University staff qtrs", 649],
      ["Navrangpura, Stadium Circle", 0],
      ["Sabarmati, Ramnagar", 1999],
      ["Chandkheda, Visat Circle", 0, "Address incomplete"],
      ["Motera, Sangath Pearl", 1099],
    ]),
  },
  {
    id: "R-52",
    name: "Faisal Mansuri",
    phone: "96015 22987",
    hub: "Naroda",
    side: "East",
    beat: "Kalupur · Old city",
    bike: "GJ-01-FN-6612 · Splendor",
    started: "9:10 AM",
    route: [
      [850, 120],
      [620, 120],
      [620, 205],
      [545, 205],
      [545, 280],
      [600, 280],
    ],
    start: 0.18,
    speed: 0.0014,
    codBase: 0,
    stops: mkStops("R-52", [
      ["Manek Chowk Silver Co.", 0],
      ["Relief Rd, Mobile Market 14", 0],
      ["Kalupur Kapad Bazaar, Shop 77", 0],
      ["Dariyapur, Haji Bilal Pol", 1199],
      ["Shahpur, Rangila Chowki", 549],
    ]),
  },
  {
    id: "R-58",
    name: "Pooja Vaghela",
    phone: "90999 31540",
    hub: "Aslali",
    side: "East",
    beat: "Maninagar West",
    bike: "GJ-01-VP-2205 · Ather 450",
    started: "8:25 AM",
    route: [
      [840, 540],
      [760, 540],
      [760, 465],
      [680, 465],
      [680, 340],
      [600, 340],
    ],
    start: 0.42,
    speed: 0.0012,
    codBase: 2050,
    stops: mkStops("R-58", [
      ["Kavita Bhatt, Ghodasar", 1499],
      ["Amdavadi Farsan House", 0],
      ["Rekha Solanki, Khokhra", 0, "Customer not available"],
      ["Maninagar, Rambaug", 2699],
      ["Seema Nair, Kankaria Lake Rd", 899],
      ["Pratik Shah, Bhairavnath", 0],
    ]),
  },
];

/* Polyline geometry, precomputed outside render. */
function lengths(pts: Pt[]) {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  return { seg, total: seg.reduce((a, b) => a + b, 0) };
}
const geo = Object.fromEntries(riders.map((r) => [r.id, lengths(r.route)]));
const r2 = (v: number) => Math.round(v * 100) / 100;
function pointAt(r: Rider, f: number): Pt {
  const g = geo[r.id];
  const target = Math.max(0, Math.min(1, f)) * g.total;
  const idx = g.seg.findIndex((_, i) => g.seg.slice(0, i + 1).reduce((a, b) => a + b, 0) >= target);
  const i = idx < 0 ? g.seg.length - 1 : idx;
  const before = g.seg.slice(0, i).reduce((a, b) => a + b, 0);
  const t = g.seg[i] ? (target - before) / g.seg[i] : 0;
  const a = r.route[i];
  const b = r.route[i + 1] ?? a;
  return [r2(a[0] + (b[0] - a[0]) * t), r2(a[1] + (b[1] - a[1]) * t)];
}
function progressOf(r: Rider, tick: number) {
  return Math.min(0.985, r.start + tick * r.speed);
}
function stopState(s: Stop, p: number, overrides: Record<string, StopState>): StopState {
  if (overrides[s.id]) return overrides[s.id];
  if (s.f > p) return "pending";
  return s.fail ? "failed" : "done";
}
const pathD = (pts: Pt[]) => pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");

/* Pickups */
type PickCol = "scheduled" | "assigned" | "picked" | "hub";
type Pickup = {
  id: string;
  client: string;
  address: string;
  window: string;
  packets: number;
  kg: number;
  rider?: string;
  col: PickCol;
  kind: "B2B" | "Seller" | "Pharma" | "Documents";
  hub: HubId;
};
const seedPickups: Pickup[] = [
  {
    id: "PU-3101",
    client: "Navrang Sarees",
    address: "Ring Rd textile mkt, Shop 214, Kalupur",
    window: "11:00–12:00",
    packets: 68,
    kg: 41,
    col: "assigned",
    rider: "Imran Pathan",
    kind: "Seller",
    hub: "Naroda",
  },
  {
    id: "PU-3102",
    client: "Riddhi Pharma Distributors",
    address: "Odhav GIDC, Shed C-17",
    window: "12:00–1:00",
    packets: 22,
    kg: 36,
    col: "assigned",
    rider: "Salim Shaikh",
    kind: "Pharma",
    hub: "Aslali",
  },
  {
    id: "PU-3103",
    client: "Gujarat Agro Seeds",
    address: "Aslali GIDC, Plot 88",
    window: "10:30–11:30",
    packets: 40,
    kg: 310,
    col: "picked",
    rider: "Salim Shaikh",
    kind: "B2B",
    hub: "Aslali",
  },
  {
    id: "PU-3104",
    client: "UrbanKurti.in",
    address: "Satellite, Shivalik Plaza 6th floor",
    window: "2:00–3:00",
    packets: 112,
    kg: 52,
    col: "scheduled",
    kind: "Seller",
    hub: "SG Highway",
  },
  {
    id: "PU-3105",
    client: "Zenith Lab Diagnostics",
    address: "Nikol, Galaxy Arcade G-9",
    window: "1:00–1:30",
    packets: 14,
    kg: 6,
    col: "assigned",
    rider: "Jayesh Thakor",
    kind: "Pharma",
    hub: "Naroda",
  },
  {
    id: "PU-3106",
    client: "Patel Auto Spares",
    address: "Odhav Ring Rd, Unit 4",
    window: "3:00–4:00",
    packets: 31,
    kg: 184,
    col: "scheduled",
    kind: "B2B",
    hub: "Aslali",
  },
  {
    id: "PU-3107",
    client: "Vastrapur Organics",
    address: "Vastrapur, Mansi Circle",
    window: "9:30–10:30",
    packets: 26,
    kg: 19,
    col: "hub",
    rider: "Kiran Solanki",
    kind: "Seller",
    hub: "SG Highway",
  },
  {
    id: "PU-3108",
    client: "Shah & Kothari CA",
    address: "Ashram Rd, Premchand House",
    window: "4:00–5:00",
    packets: 9,
    kg: 2,
    col: "scheduled",
    kind: "Documents",
    hub: "SG Highway",
  },
  {
    id: "PU-3109",
    client: "Manek Chowk Silver Co.",
    address: "Manek Chowk, Pol 3",
    window: "11:30–12:30",
    packets: 6,
    kg: 3,
    col: "picked",
    rider: "Faisal Mansuri",
    kind: "B2B",
    hub: "Naroda",
  },
  {
    id: "PU-3110",
    client: "Amdavadi Farsan House",
    address: "Maninagar, Jawahar Chowk",
    window: "10:00–11:00",
    packets: 48,
    kg: 72,
    col: "hub",
    rider: "Pooja Vaghela",
    kind: "Seller",
    hub: "Aslali",
  },
  {
    id: "PU-3111",
    client: "Kalupur Kapad Traders",
    address: "Kalupur Kapad Bazaar, Shop 77",
    window: "5:00–6:00",
    packets: 84,
    kg: 260,
    col: "scheduled",
    kind: "B2B",
    hub: "Naroda",
  },
  {
    id: "PU-3112",
    client: "Shreeji Mobile World",
    address: "Relief Rd, Mobile Market 14",
    window: "3:30–4:30",
    packets: 17,
    kg: 9,
    col: "scheduled",
    kind: "Seller",
    hub: "Naroda",
  },
];

/* NDR */
type NdrStatus = "Open" | "Reattempt" | "RTO" | "Delivered";
type Ndr = {
  awb: string;
  consignee: string;
  area: string;
  client: string;
  reason: string;
  attempts: number;
  cod: number;
  phone: string;
  last: string;
  status: NdrStatus;
  rider: string;
  note?: string;
};
const seedNdr: Ndr[] = [
  {
    awb: "SC48213112",
    consignee: "Kalpesh Prajapati",
    area: "Haridarshan, Naroda",
    client: "UrbanKurti.in",
    reason: "Customer not available",
    attempts: 1,
    cod: 649,
    phone: "•• 4410",
    last: "11:20 AM",
    status: "Open",
    rider: "Imran Pathan",
    note: "Gate locked, neighbour says back by 6",
  },
  {
    awb: "SC48212870",
    consignee: "Sanjay Bharwad",
    area: "CTM, Ramol",
    client: "Navrang Sarees",
    reason: "Address incomplete",
    attempts: 2,
    cod: 0,
    phone: "•• 9921",
    last: "10:55 AM",
    status: "Open",
    rider: "Jayesh Thakor",
    note: "No society name, landmark only",
  },
  {
    awb: "SC48211904",
    consignee: "Arif Memon",
    area: "Isanpur",
    client: "UrbanKurti.in",
    reason: "Refused COD",
    attempts: 1,
    cod: 799,
    phone: "•• 0147",
    last: "11:42 AM",
    status: "Open",
    rider: "Mehul Rabari",
    note: "Says he ordered prepaid",
  },
  {
    awb: "SC48210338",
    consignee: "Mitesh Gandhi",
    area: "Ambli Rd",
    client: "Vastrapur Organics",
    reason: "Customer not available",
    attempts: 2,
    cod: 0,
    phone: "•• 6604",
    last: "11:05 AM",
    status: "Open",
    rider: "Kiran Solanki",
  },
  {
    awb: "SC48209921",
    consignee: "Pooja Rana",
    area: "Jivraj Park",
    client: "Shreeji Mobile World",
    reason: "Phone unreachable",
    attempts: 1,
    cod: 1599,
    phone: "•• 3318",
    last: "10:40 AM",
    status: "Open",
    rider: "Ravi Parmar",
  },
  {
    awb: "SC48208775",
    consignee: "Rekha Solanki",
    area: "Khokhra",
    client: "Amdavadi Farsan House",
    reason: "Customer not available",
    attempts: 1,
    cod: 0,
    phone: "•• 7702",
    last: "11:58 AM",
    status: "Open",
    rider: "Pooja Vaghela",
    note: "Perishable, 2-day shelf life",
  },
  {
    awb: "SC48207610",
    consignee: "Vipul Chaudhary",
    area: "Chandkheda",
    client: "UrbanKurti.in",
    reason: "Address incomplete",
    attempts: 3,
    cod: 1149,
    phone: "•• 5583",
    last: "Yesterday",
    status: "Open",
    rider: "Nilesh Chauhan",
  },
  {
    awb: "SC48206449",
    consignee: "Tejal Barot",
    area: "Gota",
    client: "Navrang Sarees",
    reason: "Rescheduled by customer",
    attempts: 1,
    cod: 2349,
    phone: "•• 2290",
    last: "Yesterday",
    status: "Reattempt",
    rider: "Hardik Desai",
    note: "Asked for Saturday after 5",
  },
  {
    awb: "SC48205902",
    consignee: "Javed Kureshi",
    area: "Juhapura",
    client: "Shreeji Mobile World",
    reason: "Refused COD",
    attempts: 2,
    cod: 4299,
    phone: "•• 8845",
    last: "Yesterday",
    status: "Open",
    rider: "Ravi Parmar",
  },
  {
    awb: "SC48204118",
    consignee: "Dimple Modi",
    area: "Bopal",
    client: "Vastrapur Organics",
    reason: "Customer not available",
    attempts: 3,
    cod: 0,
    phone: "•• 1176",
    last: "2 days ago",
    status: "RTO",
    rider: "Kiran Solanki",
  },
  {
    awb: "SC48203367",
    consignee: "Harsh Vyas",
    area: "Maninagar",
    client: "UrbanKurti.in",
    reason: "Phone unreachable",
    attempts: 2,
    cod: 899,
    phone: "•• 6031",
    last: "Yesterday",
    status: "Reattempt",
    rider: "Pooja Vaghela",
  },
  {
    awb: "SC48202254",
    consignee: "Kinjal Patel",
    area: "Nikol",
    client: "Navrang Sarees",
    reason: "Customer not available",
    attempts: 1,
    cod: 1799,
    phone: "•• 4462",
    last: "9:50 AM",
    status: "Delivered",
    rider: "Jayesh Thakor",
    note: "Delivered on reattempt at 12:10",
  },
  {
    awb: "SC48201190",
    consignee: "Rakesh Joshi",
    area: "Vatva",
    client: "Gujarat Agro Seeds",
    reason: "Office closed",
    attempts: 1,
    cod: 0,
    phone: "•• 9807",
    last: "10:15 AM",
    status: "Open",
    rider: "Mehul Rabari",
    note: "B2B, opens 2 PM after lunch",
  },
  {
    awb: "SC48200632",
    consignee: "Sonal Dave",
    area: "Science City Rd",
    client: "Shreeji Mobile World",
    reason: "Customer not available",
    attempts: 1,
    cod: 899,
    phone: "•• 3150",
    last: "11:35 AM",
    status: "Open",
    rider: "Hardik Desai",
  },
];

/* Hub */
const hourLabels = ["6", "7", "8", "9", "10", "11", "12", "1", "2", "3", "4", "5"];
const sortByHour: Record<HubId, number[]> = {
  "SG Highway": [420, 690, 880, 610, 240, 180, 210, 260, 380, 520, 740, 910],
  Naroda: [310, 540, 720, 460, 190, 150, 170, 240, 330, 470, 620, 780],
  Aslali: [260, 470, 610, 390, 160, 140, 190, 280, 360, 410, 560, 690],
};
type Bag = {
  id: string;
  hub: HubId;
  dest: string;
  packets: number;
  kg: number;
  sealed: boolean;
};
const seedBags: Bag[] = [
  {
    id: "BG-SUR-118",
    hub: "SG Highway",
    dest: "Surat (Udhna)",
    packets: 142,
    kg: 88,
    sealed: true,
  },
  {
    id: "BG-BRD-071",
    hub: "SG Highway",
    dest: "Vadodara (Makarpura)",
    packets: 96,
    kg: 54,
    sealed: true,
  },
  {
    id: "BG-RJK-044",
    hub: "SG Highway",
    dest: "Rajkot (Aji GIDC)",
    packets: 118,
    kg: 73,
    sealed: false,
  },
  {
    id: "BG-BOM-206",
    hub: "Naroda",
    dest: "Mumbai (Bhiwandi)",
    packets: 210,
    kg: 164,
    sealed: false,
  },
  {
    id: "BG-UDR-019",
    hub: "Naroda",
    dest: "Udaipur",
    packets: 44,
    kg: 27,
    sealed: true,
  },
  {
    id: "BG-GNR-063",
    hub: "Naroda",
    dest: "Gandhinagar (Infocity)",
    packets: 77,
    kg: 31,
    sealed: false,
  },
  {
    id: "BG-MSN-028",
    hub: "Aslali",
    dest: "Mehsana",
    packets: 58,
    kg: 46,
    sealed: true,
  },
  {
    id: "BG-BHV-035",
    hub: "Aslali",
    dest: "Bhavnagar",
    packets: 63,
    kg: 52,
    sealed: false,
  },
  {
    id: "BG-ANK-012",
    hub: "Aslali",
    dest: "Ankleshwar GIDC",
    packets: 39,
    kg: 118,
    sealed: false,
  },
];
type Linehaul = {
  id: string;
  route: string;
  vehicle: string;
  hub: HubId;
  inHours: number;
  bags: number;
  planned: number;
  vendor: string;
};
const linehauls: Linehaul[] = [
  {
    id: "LH-0921",
    route: "Ahmedabad → Surat → Mumbai",
    vehicle: "GJ-18-AX-7710 · 14 ft",
    hub: "Naroda",
    inHours: 1.4,
    bags: 9,
    planned: 12,
    vendor: "Shiv Shakti Roadways",
  },
  {
    id: "LH-0922",
    route: "Ahmedabad → Vadodara",
    vehicle: "GJ-06-BT-2281 · Tata Ace",
    hub: "SG Highway",
    inHours: 2.6,
    bags: 4,
    planned: 6,
    vendor: "Own vehicle",
  },
  {
    id: "LH-0923",
    route: "Ahmedabad → Rajkot",
    vehicle: "GJ-03-CZ-4409 · Eicher 17 ft",
    hub: "SG Highway",
    inHours: 5.2,
    bags: 3,
    planned: 8,
    vendor: "Saurashtra Freight",
  },
  {
    id: "LH-0924",
    route: "Ahmedabad → Mehsana → Palanpur",
    vehicle: "GJ-02-DE-1176 · Bolero pickup",
    hub: "Aslali",
    inHours: 6.1,
    bags: 2,
    planned: 5,
    vendor: "Own vehicle",
  },
  {
    id: "LH-0925",
    route: "Ahmedabad → Udaipur",
    vehicle: "RJ-27-GB-3392 · 14 ft",
    hub: "Naroda",
    inHours: 8.5,
    bags: 1,
    planned: 4,
    vendor: "Mewar Transport Co.",
  },
];

/* COD */
type Cash = {
  rider: string;
  hub: HubId;
  collected: number;
  deposited: number;
  since: number;
  upi: number;
};
const seedCash: Cash[] = [
  {
    rider: "Hardik Desai",
    hub: "SG Highway",
    collected: 18420,
    deposited: 8000,
    since: 5.5,
    upi: 6200,
  },
  {
    rider: "Mehul Rabari",
    hub: "Aslali",
    collected: 16980,
    deposited: 0,
    since: 26,
    upi: 3100,
  },
  {
    rider: "Kiran Solanki",
    hub: "SG Highway",
    collected: 14310,
    deposited: 6000,
    since: 4.5,
    upi: 5400,
  },
  {
    rider: "Imran Pathan",
    hub: "Naroda",
    collected: 11260,
    deposited: 0,
    since: 4,
    upi: 2900,
  },
  {
    rider: "Pooja Vaghela",
    hub: "Aslali",
    collected: 9870,
    deposited: 4000,
    since: 4,
    upi: 4100,
  },
  {
    rider: "Ravi Parmar",
    hub: "SG Highway",
    collected: 8740,
    deposited: 0,
    since: 28,
    upi: 1800,
  },
  {
    rider: "Nilesh Chauhan",
    hub: "SG Highway",
    collected: 6380,
    deposited: 0,
    since: 3.5,
    upi: 2200,
  },
  {
    rider: "Jayesh Thakor",
    hub: "Naroda",
    collected: 7950,
    deposited: 3000,
    since: 3.5,
    upi: 1350,
  },
  {
    rider: "Faisal Mansuri",
    hub: "Naroda",
    collected: 2940,
    deposited: 0,
    since: 2.5,
    upi: 600,
  },
  {
    rider: "Bharat Koli",
    hub: "Naroda",
    collected: 21300,
    deposited: 0,
    since: 51,
    upi: 0,
  },
  {
    rider: "Sunil Makwana",
    hub: "Aslali",
    collected: 12640,
    deposited: 6000,
    since: 6,
    upi: 3800,
  },
  {
    rider: "Aakash Rathod",
    hub: "SG Highway",
    collected: 10120,
    deposited: 10120,
    since: 0,
    upi: 4600,
  },
];
const remittances = [
  {
    id: "RM-1408",
    client: "UrbanKurti.in",
    amount: 284600,
    shipments: 412,
    cycle: "T+2, Tue",
  },
  {
    id: "RM-1409",
    client: "Navrang Sarees",
    amount: 196350,
    shipments: 268,
    cycle: "T+2, Tue",
  },
  {
    id: "RM-1410",
    client: "Shreeji Mobile World",
    amount: 342900,
    shipments: 131,
    cycle: "Weekly, Tue",
  },
  {
    id: "RM-1411",
    client: "Vastrapur Organics",
    amount: 58720,
    shipments: 96,
    cycle: "T+3",
  },
  {
    id: "RM-1412",
    client: "Amdavadi Farsan House",
    amount: 41280,
    shipments: 77,
    cycle: "T+2, Tue",
  },
];

/* Clients */
type Client = {
  name: string;
  segment: "D2C seller" | "Pharma" | "B2B industrial" | "Textile" | "Documents";
  since: string;
  monthly: number;
  rate: string;
  billed: number;
  outstanding: number;
  sla: number;
  rto: number;
  codShare: number;
  contact: string;
  days: number;
};
const clients: Client[] = [
  {
    name: "UrbanKurti.in",
    segment: "D2C seller",
    since: "2022",
    monthly: 9840,
    rate: "₹38 / 0.5 kg + 1.8% COD",
    billed: 412800,
    outstanding: 186400,
    sla: 94.1,
    rto: 11.8,
    codShare: 72,
    contact: "Riya Malhotra",
    days: 34,
  },
  {
    name: "Navrang Sarees",
    segment: "Textile",
    since: "2021",
    monthly: 6210,
    rate: "₹42 / 0.5 kg + 1.5% COD",
    billed: 288300,
    outstanding: 94200,
    sla: 95.6,
    rto: 8.9,
    codShare: 61,
    contact: "Parth Shah",
    days: 21,
  },
  {
    name: "Shreeji Mobile World",
    segment: "D2C seller",
    since: "2023",
    monthly: 3150,
    rate: "₹55 / 0.5 kg + 2% COD",
    billed: 196700,
    outstanding: 158300,
    sla: 92.8,
    rto: 9.4,
    codShare: 84,
    contact: "Ketan Thakkar",
    days: 52,
  },
  {
    name: "Riddhi Pharma Distributors",
    segment: "Pharma",
    since: "2020",
    monthly: 2780,
    rate: "₹65 / kg, same-day",
    billed: 241900,
    outstanding: 61200,
    sla: 98.2,
    rto: 0.8,
    codShare: 0,
    contact: "Dr. Alpesh Mody",
    days: 18,
  },
  {
    name: "Gujarat Agro Seeds",
    segment: "B2B industrial",
    since: "2019",
    monthly: 940,
    rate: "₹14 / kg, min ₹180",
    billed: 318400,
    outstanding: 212600,
    sla: 96.4,
    rto: 1.2,
    codShare: 0,
    contact: "Mahesh Patel",
    days: 67,
  },
  {
    name: "Patel Auto Spares",
    segment: "B2B industrial",
    since: "2021",
    monthly: 1220,
    rate: "₹16 / kg, min ₹150",
    billed: 156200,
    outstanding: 48700,
    sla: 95.1,
    rto: 2.1,
    codShare: 12,
    contact: "Jitu Patel",
    days: 29,
  },
  {
    name: "Vastrapur Organics",
    segment: "D2C seller",
    since: "2024",
    monthly: 1860,
    rate: "₹40 / 0.5 kg + 1.8% COD",
    billed: 74400,
    outstanding: 22900,
    sla: 93.7,
    rto: 13.6,
    codShare: 58,
    contact: "Nidhi Agarwal",
    days: 15,
  },
  {
    name: "Zenith Lab Diagnostics",
    segment: "Pharma",
    since: "2022",
    monthly: 2410,
    rate: "₹90 / sample run, 2-hr",
    billed: 216900,
    outstanding: 0,
    sla: 99.1,
    rto: 0,
    codShare: 0,
    contact: "Saloni Bhatt",
    days: 0,
  },
  {
    name: "Amdavadi Farsan House",
    segment: "D2C seller",
    since: "2023",
    monthly: 2090,
    rate: "₹36 / 0.5 kg + 1.5% COD",
    billed: 81500,
    outstanding: 31800,
    sla: 91.9,
    rto: 6.7,
    codShare: 49,
    contact: "Hemant Joshi",
    days: 24,
  },
  {
    name: "Kalupur Kapad Traders",
    segment: "Textile",
    since: "2018",
    monthly: 1460,
    rate: "₹12 / kg bulk bale",
    billed: 132600,
    outstanding: 88900,
    sla: 94.8,
    rto: 0.4,
    codShare: 0,
    contact: "Ashok Agrawal",
    days: 74,
  },
  {
    name: "Shah & Kothari CA",
    segment: "Documents",
    since: "2017",
    monthly: 610,
    rate: "₹45 flat, same-day",
    billed: 27500,
    outstanding: 9100,
    sla: 99.4,
    rto: 0,
    codShare: 0,
    contact: "CA Mitul Kothari",
    days: 38,
  },
  {
    name: "Manek Chowk Silver Co.",
    segment: "B2B industrial",
    since: "2022",
    monthly: 380,
    rate: "₹120 insured, sealed",
    billed: 45600,
    outstanding: 45600,
    sla: 97.3,
    rto: 0,
    codShare: 0,
    contact: "Rajesh Soni",
    days: 41,
  },
];

/* Shared modules */
const team: TeamMember[] = [
  {
    name: "Bhavesh Amin",
    role: "Founder & MD",
    status: "Busy",
    load: 92,
    focus: "UrbanKurti rate renegotiation and the Bharat Koli cash issue",
    tasks: [
      { title: "Approve 5 COD remittances", due: "12:00" },
      { title: "UrbanKurti call: RTO penalty clause", due: "3:00" },
      { title: "Sign Saurashtra Freight contract", due: "5:00" },
    ],
    week: [1, 1, 1, 1, 1, 1],
    since: "2014",
  },
  {
    name: "Rupal Trivedi",
    role: "Operations head",
    status: "On floor",
    load: 86,
    focus: "Naroda evening sort: Bhiwandi bag still open",
    tasks: [
      { title: "Close BG-BOM-206 by 1:30", due: "1:30" },
      { title: "Rider roster for Diwali week", due: "6:00" },
    ],
    week: [1, 1, 1, 1, 1, 1],
    since: "2016",
  },
  {
    name: "Mukesh Prajapati",
    role: "Hub in-charge, SG Highway",
    status: "On floor",
    load: 78,
    focus: "Peak sort 4–6 PM, 2 scanners down",
    tasks: [
      { title: "Replace 2 Zebra scanners", due: "2:00" },
      { title: "Bag audit with Rupal", due: "6:30", done: true },
    ],
    week: [1, 1, 1, 1, 0, 1],
    since: "2018",
  },
  {
    name: "Shabana Saiyed",
    role: "NDR & customer desk",
    status: "Busy",
    load: 81,
    focus: "14 NDRs today, 3 refused COD",
    tasks: [
      { title: "Call back 7 'not available'", due: "1:00" },
      { title: "UrbanKurti NDR report", due: "4:00" },
    ],
    week: [1, 1, 1, 1, 1, 0],
    since: "2020",
  },
  {
    name: "Darshan Panchal",
    role: "Hub in-charge, Naroda + Aslali",
    status: "In field",
    load: 70,
    focus: "At Aslali GIDC for Gujarat Agro bulk pickup",
    tasks: [
      { title: "Weigh-bridge slip for 310 kg", due: "11:30", done: true },
      { title: "New rider induction, 3 boys", due: "4:00" },
    ],
    week: [1, 1, 0, 1, 1, 1],
    since: "2019",
  },
  {
    name: "Komal Shah",
    role: "Accounts & COD reconciliation",
    status: "On floor",
    load: 74,
    focus: "₹42k cash with riders over 24 h",
    tasks: [
      { title: "Reconcile UPI collections vs runsheets", due: "12:30" },
      { title: "GST invoices for 12 clients", due: "Fri" },
    ],
    week: [1, 1, 1, 1, 1, 1],
    since: "2021",
  },
  {
    name: "Arjun Mehta",
    role: "Sales, B2B accounts",
    status: "In field",
    load: 58,
    focus: "Pitching Sanand GIDC auto-parts cluster",
    tasks: [
      { title: "Proposal to Sanand Forgings", due: "Thu" },
      { title: "Rate card for pharma tier-2", due: "Fri" },
    ],
    week: [1, 0, 1, 1, 1, 1],
    since: "2022",
  },
  {
    name: "Bharat Koli",
    role: "Rider, Naroda",
    status: "On leave",
    load: 0,
    focus: "Unreachable since Sunday with ₹21,300 COD",
    tasks: [{ title: "Deposit COD at Naroda hub", due: "overdue" }],
    week: [1, 1, 1, 0, 0, 0],
    since: "2023",
  },
];

const agents: WorkforceAgent[] = [
  {
    name: "Route Planner",
    role: "Clusters each morning's drops into rider beats",
    icon: Route,
    status: "Running",
    runsToday: 3,
    hoursSaved: 5.5,
    accuracy: 94,
    last: "7:42 AM",
    skills: ["Geo-clustering", "Rider capacity", "Traffic"],
    schedule: "6:30 AM and 1 PM",
    log: ["Built 85 beats from 3,412 shipments", "Moved 22 Vastral drops from Naroda to Aslali", "Saved 41 km vs yesterday's beats"],
  },
  {
    name: "NDR Caller",
    role: "Calls failed-delivery customers and books reattempts",
    icon: Phone,
    status: "Needs you",
    runsToday: 18,
    hoursSaved: 4,
    accuracy: 89,
    last: "6 min ago",
    skills: ["IVR + WhatsApp", "Gujarati, Hindi", "Slot booking"],
    schedule: "Within 20 min of each NDR",
    inbox: [
      {
        title: "Javed Kureshi refuses ₹4,299 COD twice",
        detail: "Customer says he ordered prepaid. Recommend RTO and flag to Shreeji Mobile World.",
      },
    ],
    log: ["Booked Saturday 5 PM slot for Tejal Barot", "Got corrected address for Vipul Chaudhary", "Sent 9 WhatsApp location requests"],
  },
  {
    name: "Cash Watch",
    role: "Tracks COD with every rider until it hits the bank",
    icon: Wallet,
    status: "Needs you",
    runsToday: 12,
    hoursSaved: 3,
    accuracy: 97,
    last: "12 min ago",
    skills: ["Runsheets", "UPI", "Bank CMS"],
    schedule: "Hourly",
    inbox: [
      {
        title: "Bharat Koli: ₹21,300 for 51 hours",
        detail: "Phone off since Sunday. Recommend blocking his app login and informing Darshan.",
      },
    ],
    log: ["3 riders crossed 24 h with cash", "Matched ₹38,450 UPI to 61 runsheet lines", "Flagged ₹640 short on Ravi's Saturday sheet"],
  },
  {
    name: "Remittance Clerk",
    role: "Builds client COD remittance batches with proof",
    icon: Banknote,
    status: "Running",
    runsToday: 5,
    hoursSaved: 3.5,
    accuracy: 99,
    last: "35 min ago",
    skills: ["COD ledger", "Tally", "Bank files"],
    schedule: "Tuesday and Friday, 10 AM",
    log: ["Built 5 batches worth ₹9.2 L", "Held ₹4,299 of Shreeji pending RTO", "Shared remittance PDFs on WhatsApp"],
  },
  {
    name: "Hub Sorter",
    role: "Reads scan events and warns before a linehaul misses",
    icon: ScanLine,
    status: "Running",
    runsToday: 44,
    hoursSaved: 2.5,
    accuracy: 95,
    last: "just now",
    skills: ["Scan events", "Bag manifests", "Cut-offs"],
    schedule: "Every 10 min, 5 AM – 11 PM",
    log: ["BG-BOM-206 at 210 of 260, cut-off 1:30", "Mis-sort: 4 Rajkot packets in Surat bag", "SG Highway peak at 910/hr yesterday"],
  },
  {
    name: "Client Desk",
    role: "Answers 'where is my parcel' for clients and consignees",
    icon: MessageCircle,
    status: "Idle",
    runsToday: 63,
    hoursSaved: 6,
    accuracy: 92,
    last: "4 min ago",
    skills: ["Tracking", "WhatsApp", "POD photos"],
    schedule: "On every message",
    log: ["Answered 63 WISMO chats, 4 escalated", "Sent POD photo to Riddhi Pharma", "Shared live rider link with Zenith Lab"],
  },
];

const independence: IndependenceData = {
  score: 39,
  history: [24, 27, 29, 31, 33, 36, 39],
  quote: "If I'm not at the Naroda hub by 6 PM, the Mumbai truck leaves late. Every single day.",
  pillars: [
    {
      name: "Dispatch & routing",
      score: 52,
      note: "Beats are auto-built, but Bhavesh still re-checks every morning.",
      fixes: [
        { title: "Trust Route Planner below 5% change", gain: 3 },
        { title: "Hub heads own beat edits", gain: 2 },
      ],
    },
    {
      name: "Hub & linehaul",
      score: 34,
      note: "Truck departure calls depend on Bhavesh phoning the vendor.",
      fixes: [
        { title: "Auto cut-off alerts to vendors", gain: 3 },
        { title: "Rupal signs off departures", gain: 2 },
      ],
    },
    {
      name: "Cash & COD",
      score: 26,
      note: "Cash deposits are chased by phone. ₹42k is over 24 hours old.",
      fixes: [
        { title: "Block app after 24 h undeposited", gain: 4 },
        { title: "UPI-first COD at doorstep", gain: 2 },
      ],
    },
    {
      name: "Client accounts",
      score: 41,
      note: "Big D2C clients only escalate to the owner.",
      fixes: [
        { title: "Weekly SLA report auto-sent", gain: 3 },
        { title: "Arjun owns top 5 accounts", gain: 2 },
      ],
    },
    {
      name: "Riders & roster",
      score: 45,
      note: "Attendance is on the app; leave approvals are still on WhatsApp to Bhavesh.",
      fixes: [{ title: "Hub heads approve leave", gain: 2 }],
    },
    {
      name: "Numbers & reporting",
      score: 38,
      note: "Daily MIS is a Google Sheet Komal fills at 10 PM.",
      fixes: [{ title: "Live MIS on this desk", gain: 3 }],
    },
    {
      name: "Owner time",
      score: 36,
      note: "Bhavesh spends 16 hours a week on hub floors and cash calls.",
      fixes: [{ title: "Two fixed review slots a day", gain: 2 }],
    },
  ],
  ownerHours: [
    { label: "Hub rounds", hours: 10 },
    { label: "Client calls", hours: 9 },
    { label: "Cash chasing", hours: 6 },
    { label: "Truck vendors", hours: 5 },
    { label: "Rider issues", hours: 5 },
    { label: "Billing", hours: 3 },
    { label: "Growth", hours: 1 },
  ],
};

const integrations: Integration[] = [
  {
    name: "Rider app (Android)",
    category: "Operations",
    status: "Syncing",
    detail: "Live GPS, POD photos, OTP and COD capture from 85 riders.",
    synced: "live",
    records: "3,412 shipments",
    mark: "RA",
    color: "#b38f00",
  },
  {
    name: "Zebra hub scanners",
    category: "Operations",
    status: "Connected",
    detail: "Inbound, sort and bag scans at all 3 hubs.",
    synced: "just now",
    records: "21,880 scans",
    mark: "ZB",
    color: "#3b3b3b",
  },
  {
    name: "Tally Prime",
    category: "Accounts",
    status: "Connected",
    detail: "Client invoices, GST and COD ledgers.",
    synced: "14 min ago",
    records: "9,214 vouchers",
    mark: "T",
    color: "#1c4f9c",
  },
  {
    name: "WhatsApp Business",
    category: "Messaging",
    status: "Connected",
    detail: "Consignee OTPs, NDR slot booking, client updates.",
    synced: "just now",
    records: "4,906 chats",
    mark: "W",
    color: "#1f9d55",
  },
  {
    name: "Shopify + WooCommerce",
    category: "Clients",
    status: "Connected",
    detail: "Orders pulled from 6 D2C client stores.",
    synced: "3 min ago",
    records: "1,280 orders",
    mark: "SH",
    color: "#5e8e3e",
  },
  {
    name: "Razorpay UPI",
    category: "Accounts",
    status: "Connected",
    detail: "Doorstep UPI QR for COD, auto-matched to AWB.",
    synced: "1 min ago",
    records: "612 payments",
    mark: "R",
    color: "#2563eb",
  },
  {
    name: "HDFC cash pickup (CMS)",
    category: "Accounts",
    status: "Error",
    detail: "Deposit file format changed; Aslali deposits not matching.",
    synced: "Yesterday",
    records: "—",
    mark: "HD",
    color: "#c0392b",
  },
  {
    name: "Google Maps Platform",
    category: "Operations",
    status: "Connected",
    detail: "Geocoding addresses and live traffic on beats.",
    synced: "live",
    records: "2,940 geocodes",
    mark: "GM",
    color: "#4285f4",
  },
  {
    name: "Exotel",
    category: "Messaging",
    status: "Connected",
    detail: "Masked calling between riders and consignees.",
    synced: "2 min ago",
    records: "1,118 calls",
    mark: "EX",
    color: "#7c3aed",
  },
  {
    name: "Fleet GPS (linehaul)",
    category: "Operations",
    status: "Available",
    detail: "Track vendor trucks to Surat, Rajkot and Mumbai.",
    synced: "—",
    records: "—",
    mark: "FG",
    color: "#0f766e",
  },
];

/* ============================================================
   Config
   ============================================================ */

const config: DeskConfig = {
  slug: "courier",
  company: "Sabarmati Couriers",
  brand: "Sabarmati",
  city: "Ahmedabad",
  state: "GJ",
  icon: Bike,
  tagline: "Last-mile and B2B courier · 3 hubs · 85 riders · 3,400 shipments a day",
  owner: {
    name: "Bhavesh Amin",
    first: "Bhavesh",
    initials: "BA",
    role: "Founder & MD",
  },
  theme: {
    variant: "control",
    paper: "#121314",
    panel: "#1a1c1e",
    sunk: "#25282b",
    ink: "#f2f0e6",
    mute: "#9ea2a6",
    line: "#30353a",
    accent: "#f5c400",
    accentInk: "#111111",
    soft: "#2f2b14",
    ok: "#43c47f",
    warn: "#ff9f2e",
    late: "#ff5d52",
    info: "#5cb6ff",
    heading: "mono",
  },
  pulse: [
    {
      label: "Delivered today",
      value: "2,846",
      delta: "+4%",
      trend: [210, 640, 1120, 1580, 2010, 2460, 2846],
      tone: "ok",
      module: "routes",
    },
    {
      label: "First-attempt rate",
      value: "91.4%",
      delta: "+0.8",
      trend: [89, 90, 90.5, 89.8, 91, 90.7, 91.4],
      module: "ndr",
    },
    {
      label: "Open NDR",
      value: "10",
      delta: "+3",
      good: false,
      trend: [6, 7, 9, 8, 10, 8, 10],
      tone: "late",
      module: "ndr",
    },
    {
      label: "Cash with riders",
      value: "₹72.3k",
      delta: "-12%",
      good: true,
      trend: [98, 91, 94, 86, 81, 77, 72],
      tone: "warn",
      module: "cod",
    },
    {
      label: "Sorted / hr (peak)",
      value: "2,380",
      delta: "+6%",
      trend: [1900, 2050, 2100, 2240, 2180, 2300, 2380],
      module: "hub",
    },
  ],
  agenda: [
    {
      at: 7,
      title: "Morning sort closes",
      detail: "3,412 shipments into 85 beats",
      tone: "ok",
      module: "hub",
    },
    {
      at: 10,
      title: "COD remittance window",
      detail: "5 client batches, ₹9.2 L",
      count: 5,
      tone: "warn",
      module: "cod",
    },
    {
      at: 12,
      title: "NDR call-back round",
      detail: "10 open, 3 refused COD",
      count: 10,
      tone: "late",
      module: "ndr",
    },
    {
      at: 13.5,
      title: "Mumbai linehaul cut-off",
      detail: "BG-BOM-206 still open at Naroda",
      tone: "accent",
      module: "hub",
    },
    {
      at: 15,
      title: "UrbanKurti rate call",
      detail: "RTO penalty clause, 9,840 shipments/mo",
      tone: "info",
      module: "clients",
    },
    {
      at: 17,
      title: "Evening pickups",
      detail: "6 B2B pickups, 1 still unassigned",
      count: 6,
      tone: "neutral",
      module: "pickups",
    },
  ],
  activity: [
    {
      time: "12:04 PM",
      text: "Kinjal Patel, Nikol: delivered on reattempt, ₹1,799 COD via UPI",
      tone: "ok",
    },
    {
      time: "11:52 AM",
      text: "Hub Sorter: 4 Rajkot packets found in the Surat bag at SG Highway",
      tone: "warn",
    },
    {
      time: "11:42 AM",
      text: "Arif Memon, Isanpur refused ₹799 COD; NDR Caller is calling",
      tone: "late",
    },
    {
      time: "11:20 AM",
      text: "Gujarat Agro Seeds bulk pickup done: 40 bags, 310 kg",
      tone: "info",
    },
    {
      time: "10:35 AM",
      text: "Remittance Clerk built 5 COD batches worth ₹9.2 L",
      tone: "neutral",
    },
    {
      time: "9:58 AM",
      text: "Cash Watch: Bharat Koli has held ₹21,300 for 51 hours",
      tone: "late",
    },
  ],
  asks: [
    {
      q: "Which riders are behind today?",
      a: "Two beats are running behind plan.\n\n• Faisal Mansuri (Kalupur, old city): started 9:10 AM, 50 minutes late, narrow pols slow him down. 5 stops, 1 done.\n• Salim Shaikh (Aslali GIDC): 3-wheeler is on bulk B2B pickups, 2 of 5 done.\n\nEveryone else is within 15 minutes of the Route Planner's estimate. Suggest moving Faisal's last 2 Shahpur drops to Nilesh, who finishes Navrangpura by 2 PM.",
      sources: ["Rider app GPS", "Route Planner beats"],
    },
    {
      q: "How much COD cash is out with riders?",
      a: "₹72.3k in cash is with 11 riders right now, on top of ₹36,050 UPI already in Razorpay and auto-matched.\n\n• ₹42,120 has been held over 24 hours by 3 riders: Bharat Koli (₹21,300, 51 h, phone off), Mehul Rabari (₹13,880, 26 h), Ravi Parmar (₹6,940, 28 h).\n• Everyone else is under 6 hours and deposits at the hub counter by 8 PM.\n\nRecommendation: block Bharat's app login and send Darshan to his room in Naroda today.",
      sources: ["COD ledger", "Razorpay", "Cash Watch log"],
    },
    {
      q: "Will the Mumbai truck leave on time?",
      a: "At risk. LH-0921 to Surat and Mumbai leaves Naroda in about 1 h 25 m. 9 of 12 bags are loaded. BG-BOM-206 is at 210 packets and still open; the Aslali shuttle with 50 more Bhiwandi packets reaches Naroda at 1:10 PM.\n\nIf the shuttle is late by more than 15 minutes, seal the bag at 1:25 and push the 50 packets to tomorrow's 6 AM truck.",
      sources: ["Hub scans", "Linehaul plan"],
    },
    {
      q: "Why are NDRs up this week?",
      a: "Open NDRs went from 6 to 10 in 7 days. 64% are from two clients: UrbanKurti.in and Shreeji Mobile World.\n\n• 'Customer not available' is 45% of all NDRs, mostly 11 AM–2 PM in Bopal and Naroda housing societies.\n• 'Refused COD' doubled on mobile phone orders above ₹4,000.\n\nTwo fixes: move society drops to the 5–8 PM slot, and ask Shreeji to push prepaid with a ₹50 discount above ₹4,000.",
      sources: ["NDR log", "Client order data"],
    },
    {
      q: "Which client is least profitable?",
      a: "Shreeji Mobile World. It pays ₹55 per 0.5 kg plus 2% COD, but 9.4% RTO and 84% COD share mean ₹1.58 L outstanding for 52 days.\n\nPer shipment we earn ₹71 and spend about ₹64 on first attempt, reattempts and RTO linehaul. Margin is near zero. UrbanKurti is the next to watch at 11.8% RTO.",
      sources: ["Clients & billing", "NDR log", "Tally"],
    },
    {
      q: "Draft a message to UrbanKurti about RTO",
      a: "Draft (not sent):\n\n“Hi Riya, quick note from Sabarmati Couriers. In October your RTO is running at 11.8% against 7% for our other D2C clients, mostly COD orders that are refused or not reachable at the doorstep. We'd like to propose: OTP-verified COD, a 5–8 PM delivery slot for housing societies, and an RTO charge of ₹28 per return beyond 8%. Can we discuss at 3 PM today? — Bhavesh”",
      sources: ["Clients & billing", "NDR log"],
    },
  ],
  run: {
    label: "Runs every 15 minutes during delivery hours. You can also run it now.",
    title: "Dispatch Controller",
    steps: [
      {
        text: "Read live GPS from 85 riders and 3,412 shipments",
        result: "2,846 delivered, 418 out for delivery",
      },
      {
        text: "Compare each beat against the Route Planner's ETA",
        result: "2 beats behind: Kalupur and Aslali GIDC",
      },
      {
        text: "Match NDRs to callbacks and reattempt slots",
        result: "10 open, 4 booked for this evening",
      },
      {
        text: "Check bag fill against linehaul cut-offs",
        result: "BG-BOM-206 short 50 packets, cut-off 1:30",
      },
      {
        text: "Reconcile COD cash and UPI against runsheets",
        result: "₹42,120 over 24 h with 3 riders",
      },
    ],
    outcome: "Move Faisal's 2 Shahpur drops to Nilesh, hold LH-0921 until 1:25 for the Aslali shuttle, and block Bharat Koli's login until his ₹21,300 is deposited.",
    actions: ["Reassign 2 drops to Nilesh", "Hold LH-0921 till 1:25", "Block Bharat Koli's app", "Send 4 reattempt slots on WhatsApp"],
  },
};

/* ============================================================
   Desk
   ============================================================ */

export default function CourierDesk() {
  const [ndr, setNdr] = React.useState(seedNdr);
  const [pickups, setPickups] = React.useState(seedPickups);
  const openNdr = ndr.filter((n) => n.status === "Open").length;

  const modules: DeskModule[] = [
    {
      id: "routes",
      label: "Live routes",
      title: "Live routes",
      blurb: "Every rider on today's beat across Ahmedabad, every drop and pickup as it happens",
      icon: Route,
      notes: [
        "Yellow dots are riders moving on their beats from the three hubs. Green pins are delivered, red are failed attempts, hollow are still to go.",
        "Click a rider to open their run sheet: stops, COD in hand and attempts.",
        "The delivered counter is live; it ticks up as riders reach their drops.",
      ],
      render: () => <RoutesHome openNdr={openNdr} />,
    },
    {
      id: "pickups",
      label: "Pickups",
      count: pickups.filter((p) => p.col === "scheduled").length,
      title: "B2B pickups",
      blurb: "Scheduled pickups from sellers, pharma and industrial clients, from booking to hub",
      icon: Package,
      render: () => <PickupsTab pickups={pickups} setPickups={setPickups} />,
    },
    {
      id: "ndr",
      label: "NDR",
      count: openNdr,
      title: "Shipments & NDR",
      blurb: "Failed deliveries, why they failed and what happens next: reattempt, call or RTO",
      icon: PackageX,
      render: () => <NdrTab ndr={ndr} setNdr={setNdr} />,
    },
    {
      id: "hub",
      label: "Hub",
      count: 2,
      title: "Hub floor",
      blurb: "Sort throughput by hour, bags being built and the linehaul trucks they must make",
      icon: Warehouse,
      render: () => <HubTab />,
    },
    {
      id: "cod",
      label: "COD",
      count: 3,
      title: "COD remittance",
      blurb: "Cash with riders, deposits to the bank and remittances to clients",
      icon: Wallet,
      render: () => <CodTab />,
    },
    {
      id: "clients",
      label: "Clients",
      title: "Clients & billing",
      blurb: "Who ships with us, what they pay, what they owe and how well we serve them",
      icon: Building2,
      render: () => <ClientsTab />,
    },
    {
      id: "team",
      label: "People",
      title: "People",
      blurb: "Hub heads, NDR desk, accounts and the riders behind them",
      icon: Users,
      render: () => <PeopleModule members={team} />,
    },
    {
      id: "agents",
      label: "Agents",
      title: "Agents",
      blurb: "Six AI agents planning beats, calling customers and chasing cash",
      icon: Bot,
      render: () => <AgentsModule agents={agents} />,
    },
    {
      id: "independence",
      label: "Independence",
      title: "Owner independence",
      blurb: "How much of Sabarmati runs without Bhavesh on the hub floor",
      icon: GaugeIcon,
      render: () => <IndependenceModule data={independence} />,
    },
    {
      id: "connections",
      label: "Connections",
      title: "Connections",
      blurb: "Rider app, hub scanners, Tally, WhatsApp, UPI and the bank",
      icon: Plug,
      render: () => <ConnectionsModule items={integrations} />,
    },
  ];

  return <DeskShell config={config} modules={modules} />;
}

/* ---------------- Home ---------------- */

function useTick(every: number) {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    const id = window.setInterval(() => setT((x) => x + 1), every);
    return () => window.clearInterval(id);
  }, [every]);
  return t;
}

function RoutesHome({ openNdr }: { openNdr: number }) {
  const desk = useDesk();
  const tick = useTick(1200);
  const [overrides, setOverrides] = React.useState<Record<string, StopState>>({});
  const [open, setOpen] = React.useState<string | null>(null);
  const [focus, setFocus] = React.useState<string | null>(null);
  const [side, setSide] = React.useState<"All" | "West" | "East">("All");
  const [layers, setLayers] = React.useState({
    routes: true,
    stops: true,
    heat: true,
  });

  const live = riders.map((r) => {
    const p = progressOf(r, tick);
    const states = r.stops.map((s) => stopState(s, p, overrides));
    const done = r.stops.filter((s, i) => s.kind === "Drop" && states[i] === "done");
    const failed = states.filter((s) => s === "failed").length;
    const cod = r.codBase + done.reduce((a, s) => a + s.cod, 0);
    return { r, p, states, done: done.length, failed, cod, pos: pointAt(r, p) };
  });
  const delivered = 2825 + live.reduce((a, x) => a + x.done, 0);
  const codOut = live.reduce((a, x) => a + x.cod, 0);
  const sel = live.find((x) => x.r.id === open) ?? null;
  const shown = live.filter((x) => side === "All" || x.r.side === side);
  const pendingByZone = (z: (typeof zones)[number]) => live.reduce((a, x) => a + x.r.stops.filter((s, i) => x.states[i] === "pending" && inZone(pointAt(x.r, s.f), z)).length, 0);

  function pick(id: string) {
    setFocus(id);
    setOpen(id);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Delivered today" value={num(delivered)} delta="+4%" hint="of 3,412 out for delivery" icon={CheckCheck} tone="ok" trend={[210, 640, 1120, 1580, 2010, 2460, delivered]} />
        <Stat label="Riders on beat" value="78 / 85" hint="4 on pickups, 3 off" icon={Bike} trend={[40, 66, 78, 80, 79, 78, 78]} />
        <Stat label="Failed attempts" value={openNdr} delta="+3" deltaGood={false} hint="NDR desk is calling" icon={PackageX} tone="late" trend={[3, 4, 6, 7, 8, 9, openNdr]} onClick={() => desk.goTab("ndr")} />
        <Stat label="COD on these 10 riders" value={inr(codOut, { compact: true })} hint="₹72.3k cash across all 85 riders" icon={IndianRupee} tone="warn" trend={[4, 9, 14, 19, 22, 26, codOut / 1000]} onClick={() => desk.goTab("cod")} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="desk-card desk-rise min-w-0 overflow-hidden">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-d-line px-5 py-3">
            <div className="flex items-center gap-4">
              <div>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-d-mute">Delivered · live</p>
                <p className="tnum font-mono text-[34px] font-bold leading-none text-d-accent">{num(delivered)}</p>
              </div>
              <div className="hidden h-10 w-px bg-d-line sm:block" />
              <div className="hidden font-mono text-[11.5px] leading-relaxed text-d-mute sm:block">
                <p>
                  <span className="text-d-ink">{riders.length}</span> riders shown of 85 · <span className="text-d-ink">3</span> hubs
                </p>
                <p>
                  pending drops <span className="text-d-ink">{live.reduce((a, x) => a + x.states.filter((s) => s === "pending").length, 0)}</span> · failed <span className="text-d-late">{live.reduce((a, x) => a + x.failed, 0)}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Segmented size="sm" options={["All", "West", "East"] as const} value={side} onChange={setSide} />
              {(["routes", "stops", "heat"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setLayers((l) => ({ ...l, [k]: !l[k] }))}
                  className={`inline-flex h-7 items-center gap-1 rounded-md border px-2 font-mono text-[11px] uppercase ${layers[k] ? "border-d-accent text-d-accent" : "border-d-line text-d-mute"}`}
                >
                  <Layers className="h-3 w-3" /> {k}
                </button>
              ))}
            </div>
          </header>
          <div className="relative bg-[#0e0f10]">
            <svg viewBox="0 0 1000 600" className="block h-auto w-full" role="img" aria-label="Live rider map of Ahmedabad">
              <defs>
                <pattern id="sc-grid" width="25" height="25" patternUnits="userSpaceOnUse">
                  <path d="M25 0H0V25" fill="none" stroke="#ffffff" strokeOpacity="0.045" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="1000" height="600" fill="url(#sc-grid)" />
              <rect x="14" y="8" width="972" height="584" rx="70" fill="none" stroke="#f5c400" strokeOpacity="0.16" strokeWidth="3" strokeDasharray="2 8" />
              <text x="36" y="596" fill="#9ea2a6" fontSize="10" fontFamily="var(--font-mono)" opacity="0.7">
                SP RING ROAD
              </text>
              {zones.map((z) => {
                const pend = pendingByZone(z);
                const dim = side !== "All" && z.side !== side;
                return (
                  <g key={z.name} opacity={dim ? 0.25 : 1}>
                    <rect x={z.x} y={z.y} width={z.w} height={z.h} rx="10" fill={layers.heat && pend ? `rgba(245,196,0,${Math.min(0.09, 0.015 + pend * 0.016)})` : "rgba(255,255,255,0.025)"} stroke="#ffffff" strokeOpacity="0.08" />
                    <text x={z.x + 10} y={z.y + 18} fill="#c9cbcd" fontSize="11" fontFamily="var(--font-mono)" letterSpacing="1">
                      {z.name.toUpperCase()}
                    </text>
                    {pend > 0 && (
                      <text x={z.x + z.w - 10} y={z.y + 18} textAnchor="end" fill="#f5c400" fontSize="10.5" fontFamily="var(--font-mono)">
                        {pend} to go
                      </text>
                    )}
                  </g>
                );
              })}
              <path d="M482 0 C470 110, 505 190, 488 300 S 498 470, 506 600" fill="none" stroke="#1d4a63" strokeWidth="24" strokeLinecap="round" opacity="0.85" />
              <path d="M482 0 C470 110, 505 190, 488 300 S 498 470, 506 600" fill="none" stroke="#5cb6ff" strokeOpacity="0.35" strokeWidth="1.5" className="desk-flow" />
              <text x="497" y="250" fill="#8fc7ea" fontSize="10" fontFamily="var(--font-mono)" transform="rotate(84 497 250)" letterSpacing="3">
                SABARMATI
              </text>

              {layers.routes &&
                shown.map((x) => {
                  const on = focus === x.r.id;
                  return (
                    <g key={`rt-${x.r.id}`} opacity={focus && !on ? 0.25 : 1}>
                      <path d={pathD(x.r.route)} fill="none" stroke={on ? "#f5c400" : "#f2f0e6"} strokeOpacity={on ? 0.95 : 0.3} strokeWidth={on ? 3 : 2} strokeLinejoin="round" className="desk-flow" />
                    </g>
                  );
                })}

              {layers.stops &&
                shown.flatMap((x) =>
                  x.r.stops.map((s, i) => {
                    const [sx, sy] = pointAt(x.r, s.f);
                    const st = x.states[i];
                    const color = st === "done" ? "#43c47f" : st === "failed" ? "#ff5d52" : "#f5c400";
                    return s.kind === "Pickup" ? (
                      <rect key={s.id} x={sx - 5} y={sy - 5} width="10" height="10" rx="2" fill={st === "pending" ? "#121314" : "#5cb6ff"} stroke="#5cb6ff" strokeWidth="2" opacity={focus && focus !== x.r.id ? 0.3 : 1} />
                    ) : (
                      <g key={s.id} opacity={focus && focus !== x.r.id ? 0.3 : 1}>
                        <circle cx={sx} cy={sy} r="5.5" fill={st === "pending" ? "#121314" : color} stroke={color} strokeWidth="2" />
                        {st === "failed" && <path d={`M${sx - 2.5} ${sy - 2.5}l5 5m0-5l-5 5`} stroke="#121314" strokeWidth="1.6" />}
                      </g>
                    );
                  }),
                )}

              {hubs.map((h) => (
                <g key={h.id}>
                  <rect x={h.at[0] - 15} y={h.at[1] - 15} width="30" height="30" rx="6" fill="#f5c400" />
                  <path d={`M${h.at[0] - 7} ${h.at[1] + 6}v-8l7-5 7 5v8z`} fill="#111" />
                  <text x={h.at[0]} y={h.at[1] + 30} textAnchor="middle" fill="#f5c400" fontSize="10.5" fontWeight="700" fontFamily="var(--font-mono)">
                    {h.id.toUpperCase()} HUB
                  </text>
                </g>
              ))}

              {shown.map((x) => {
                const [rx, ry] = x.pos;
                const on = focus === x.r.id;
                return (
                  <g
                    key={`rd-${x.r.id}`}
                    onClick={() => pick(x.r.id)}
                    onMouseEnter={() => setFocus(x.r.id)}
                    onMouseLeave={() => setFocus((f) => (open ? f : null))}
                    className="cursor-pointer"
                    style={{ transition: "transform 1.2s linear" }}
                    transform={`translate(${rx.toFixed(1)} ${ry.toFixed(1)})`}
                  >
                    <circle r="16" fill="#f5c400" opacity="0.14">
                      <animate attributeName="r" values="9;19;9" dur="2.4s" repeatCount="indefinite" />
                    </circle>
                    <circle r="10" fill="#f5c400" stroke="#111" strokeWidth={on ? 3 : 1.5} />
                    <text y="3.5" textAnchor="middle" fontSize="9" fontWeight="800" fill="#111" fontFamily="var(--font-mono)">
                      {x.r.id.slice(2)}
                    </text>
                    {on && (
                      <g transform="translate(14 -30)">
                        <rect width="150" height="36" rx="6" fill="#111" stroke="#f5c400" />
                        <text x="8" y="15" fill="#f2f0e6" fontSize="11" fontWeight="700">
                          {x.r.name}
                        </text>
                        <text x="8" y="29" fill="#9ea2a6" fontSize="9.5" fontFamily="var(--font-mono)">
                          {x.done} done · {inr(x.cod)} COD
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
            <div className="flex flex-wrap gap-4 border-t border-d-line px-5 py-2.5 font-mono text-[10.5px] text-d-mute">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-d-accent" /> rider
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-d-ok" /> delivered
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full border-2 border-d-accent" /> to go
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-d-late" /> failed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-[2px] bg-d-info" /> pickup
              </span>
            </div>
          </div>
        </section>

        <Panel title="Riders" sub="Click for the run sheet" bodyClassName="p-0 pt-2">
          <ul className="desk-scroll max-h-[690px] divide-y divide-d-line overflow-y-auto">
            {shown.map((x) => (
              <li key={x.r.id}>
                <button
                  type="button"
                  onClick={() => pick(x.r.id)}
                  onMouseEnter={() => setFocus(x.r.id)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-d-sunk ${focus === x.r.id ? "bg-d-soft" : ""}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-d-accent font-mono text-[11px] font-bold text-d-accent-ink">{x.r.id.slice(2)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center justify-between gap-2 text-[13px] font-semibold">
                      <span className="truncate">{x.r.name}</span>
                      <span className="tnum font-mono text-[11px] text-d-mute">{inr(x.cod)}</span>
                    </p>
                    <p className="truncate font-mono text-[11px] text-d-mute">{x.r.beat}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Meter value={x.p * 100} tone={x.failed ? "warn" : "ok"} height={4} />
                      <span className="shrink-0 font-mono text-[10.5px] text-d-mute">
                        {x.states.filter((s) => s !== "pending").length}/{x.r.stops.length}
                        {x.failed > 0 && <span className="text-d-late"> · {x.failed}✕</span>}
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel
          icon={Truck}
          title="Linehaul departures"
          sub="Trucks leaving our hubs today"
          action={
            <Btn size="sm" variant="ghost" onClick={() => desk.goTab("hub")}>
              Hub
            </Btn>
          }
        >
          <ul className="space-y-2.5">
            {linehauls.slice(0, 4).map((l) => (
              <li key={l.id} className="rounded-[8px] border border-d-line p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[13px] font-semibold">{l.route}</p>
                  <span className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[11px] ${l.inHours < 2 ? "bg-d-late/15 text-d-late" : "bg-d-sunk text-d-ink"}`}>
                    <Countdown compact inHours={l.inHours} />
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Meter value={l.bags} max={l.planned} tone={l.bags / l.planned < 0.5 && l.inHours < 3 ? "late" : "accent"} height={4} />
                  <span className="shrink-0 font-mono text-[10.5px] text-d-mute">
                    {l.bags}/{l.planned} bags
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Attempts by hour" sub="Delivered vs failed, all 85 riders">
          <AreaChart
            labels={["9", "10", "11", "12", "1", "2", "3", "4", "5", "6"].map((h) => `${h}:00`)}
            series={[
              {
                name: "Delivered",
                data: [180, 420, 510, 470, 390, 360, 340, 300, 280, 240],
                tone: "ok",
              },
              {
                name: "Failed",
                data: [12, 28, 41, 46, 33, 22, 18, 15, 11, 9],
                tone: "late",
              },
            ]}
            height={180}
            marker={{ index: 3, label: "now" }}
          />
        </Panel>
        <Panel icon={AlertTriangle} title="Exceptions now" sub="Things the Dispatch Controller wants a human on">
          <ExceptionList />
        </Panel>
      </div>

      <RiderSheet
        sel={sel}
        onClose={() => {
          setOpen(null);
          setFocus(null);
        }}
        setState={(id, st, label) => {
          setOverrides((o) => ({ ...o, [id]: st }));
          desk.log(label, st === "done" ? "ok" : st === "failed" ? "late" : "info");
        }}
      />
    </div>
  );
}

function inZone(p: Pt, z: (typeof zones)[number]) {
  return p[0] >= z.x && p[0] <= z.x + z.w && p[1] >= z.y && p[1] <= z.y + z.h;
}

function ExceptionList() {
  const desk = useDesk();
  const [cleared, setCleared] = React.useState<Set<string>>(new Set());
  const items = [
    {
      id: "e1",
      t: "Faisal 50 min behind in Kalupur pols",
      a: "Move 2 drops to Nilesh",
      tone: "warn" as Tone,
    },
    {
      id: "e2",
      t: "BG-BOM-206 short 50 packets, cut-off 1:30",
      a: "Hold LH-0921 till 1:25",
      tone: "late" as Tone,
    },
    {
      id: "e3",
      t: "Bharat Koli: ₹21,300 COD, phone off 51 h",
      a: "Block app login",
      tone: "late" as Tone,
    },
    {
      id: "e4",
      t: "4 Rajkot packets mis-sorted into Surat bag",
      a: "Re-bag at SG Highway",
      tone: "info" as Tone,
    },
  ];
  const left = items.filter((i) => !cleared.has(i.id));
  return (
    <ul className="space-y-2">
      {left.map((i) => (
        <li key={i.id} className="desk-rise flex items-start gap-2.5 rounded-[8px] border border-d-line p-2.5">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: `var(--d-${i.tone})` }} />
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] leading-snug">{i.t}</p>
            <button
              type="button"
              onClick={() => {
                setCleared((s) => new Set(s).add(i.id));
                toast.success(i.a, { description: i.t });
                desk.log(`${i.a} (${i.t})`, "ok");
              }}
              className="mt-1 font-mono text-[11px] font-semibold text-d-accent hover:underline"
            >
              {i.a} →
            </button>
          </div>
        </li>
      ))}
      {left.length === 0 && <p className="rounded-[8px] border border-dashed border-d-line py-6 text-center text-[12.5px] text-d-mute">All clear. Riders are on plan.</p>}
    </ul>
  );
}

type LiveRider = {
  r: Rider;
  p: number;
  states: StopState[];
  done: number;
  failed: number;
  cod: number;
};

function RiderSheet({ sel, onClose, setState }: { sel: LiveRider | null; onClose: () => void; setState: (id: string, st: StopState, label: string) => void }) {
  const desk = useDesk();
  const r = sel?.r;
  return (
    <Sheet
      open={!!sel}
      onOpenChange={(o) => !o && onClose()}
      eyebrow={r ? `${r.id} · ${r.hub} hub · run sheet` : ""}
      title={r?.name ?? ""}
      sub={r ? `${r.beat} · ${r.bike} · on beat since ${r.started}` : ""}
      width={520}
      footer={
        <>
          <Btn
            icon={Phone}
            onClick={() => {
              toast.success(`Calling ${r?.name}`, {
                description: `Masked call via Exotel to ${r?.phone}`,
              });
              desk.log(`Called rider ${r?.name}`);
            }}
          >
            Call rider
          </Btn>
          <Btn
            icon={Wallet}
            onClick={() => {
              toast.success("Deposit request sent", {
                description: `${r?.name} to deposit ${inr(sel?.cod ?? 0)} at ${r?.hub} hub by 7 PM`,
              });
              desk.log(`Asked ${r?.name} to deposit ${inr(sel?.cod ?? 0)} COD`, "warn");
            }}
          >
            Ask to deposit
          </Btn>
          <Btn variant="solid" onClick={onClose}>
            Done
          </Btn>
        </>
      }
    >
      {sel && r && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                k: "Stops done",
                v: `${sel.states.filter((s) => s !== "pending").length} / ${r.stops.length}`,
              },
              { k: "COD in hand", v: inr(sel.cod) },
              { k: "Failed attempts", v: String(sel.failed) },
            ].map((x) => (
              <div key={x.k} className="rounded-[8px] bg-d-sunk p-3">
                <p className="font-mono text-[10.5px] uppercase tracking-wider text-d-mute">{x.k}</p>
                <p className="tnum mt-1 font-mono text-[20px] font-bold">{x.v}</p>
              </div>
            ))}
          </div>
          <Meter value={sel.p * 100} tone="accent" />
          <KV
            items={[
              { k: "Phone", v: r.phone },
              { k: "Hub", v: `${r.hub} hub` },
              { k: "COD carried from yesterday", v: inr(r.codBase) },
              { k: "Beat progress", v: `${Math.round(sel.p * 100)}% of route` },
            ]}
          />
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-d-mute">Run sheet</p>
            <ol className="space-y-1.5">
              {r.stops.map((s, i) => {
                const st = sel.states[i];
                return (
                  <li key={s.id} className="flex items-start gap-3 rounded-[8px] border border-d-line px-3 py-2">
                    <span className="mt-0.5 font-mono text-[11px] text-d-mute">{String(i + 1).padStart(2, "0")}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium">
                        {s.kind === "Pickup" && <span className="mr-1.5 rounded bg-d-info/15 px-1 font-mono text-[10px] text-d-info">PICKUP</span>}
                        {s.name}
                      </p>
                      <p className="font-mono text-[11px] text-d-mute">
                        {s.awb}
                        {s.cod > 0 ? ` · COD ${inr(s.cod)}` : s.kind === "Drop" ? " · prepaid" : ""}
                        {st === "failed" && s.fail ? ` · ${s.fail}` : ""}
                      </p>
                    </div>
                    {st === "done" ? (
                      <Pill tone="ok">{s.kind === "Pickup" ? "Picked" : "Delivered"}</Pill>
                    ) : st === "failed" ? (
                      <Btn size="sm" variant="soft" icon={RotateCcw} onClick={() => setState(s.id, "pending", `Reattempt booked for ${s.name}`)}>
                        Reattempt
                      </Btn>
                    ) : (
                      <div className="flex gap-1">
                        <Btn
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setState(s.id, "done", `${r.name} delivered to ${s.name}`);
                            toast.success("Marked delivered", {
                              description: s.name,
                            });
                          }}
                        >
                          Done
                        </Btn>
                        <Btn
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setState(s.id, "failed", `NDR: ${s.name} (${r.name})`);
                            toast(`NDR raised for ${s.name}`);
                          }}
                        >
                          Fail
                        </Btn>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      )}
    </Sheet>
  );
}

/* ---------------- Pickups ---------------- */

const pickCols: {
  id: PickCol;
  label: string;
  tone: Tone;
  hint: string;
  limit?: number;
}[] = [
  {
    id: "scheduled",
    label: "Scheduled",
    tone: "neutral",
    hint: "Booked by client, no rider yet",
    limit: 4,
  },
  {
    id: "assigned",
    label: "Rider assigned",
    tone: "accent",
    hint: "On a rider's run sheet",
  },
  { id: "picked", label: "Picked up", tone: "info", hint: "In transit to hub" },
  { id: "hub", label: "At hub", tone: "ok", hint: "Inbound scanned" },
];

function PickupsTab({ pickups, setPickups }: { pickups: Pickup[]; setPickups: React.Dispatch<React.SetStateAction<Pickup[]>> }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<Pickup | null>(null);
  const [adding, setAdding] = React.useState(false);
  const [hub, setHub] = React.useState<"All" | HubId>("All");
  const shown = pickups.filter((p) => hub === "All" || p.hub === hub);
  const kg = pickups.reduce((a, p) => a + p.kg, 0);

  function move(id: string, col: string) {
    const p = pickups.find((x) => x.id === id);
    if (!p || p.col === col) return;
    const rider = col !== "scheduled" && !p.rider ? riders.find((r) => r.hub === p.hub)?.name : p.rider;
    setPickups((cur) => cur.map((x) => (x.id === id ? { ...x, col: col as PickCol, rider } : x)));
    const label = pickCols.find((c) => c.id === col)?.label;
    toast.success(`${p.client} → ${label}`, {
      description: rider ? `Rider: ${rider}` : undefined,
    });
    desk.log(`Pickup ${p.id} ${p.client} moved to ${label}`);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Pickups today" value={pickups.length} delta="+2" hint="B2B and seller" icon={Package} trend={[7, 9, 8, 10, 11, 10, pickups.length]} />
        <Stat label="Unassigned" value={pickups.filter((p) => p.col === "scheduled").length} hint="evening slots mostly" icon={AlertTriangle} tone="warn" />
        <Stat label="Weight booked" value={`${num(kg)} kg`} hint="3W tempo needed above 150 kg" icon={Boxes} />
        <Stat label="On-time pickup, 30 days" value="96.2%" delta="+1.1" icon={Clock} tone="ok" trend={[93, 94, 94.5, 95, 95.4, 95.8, 96.2]} />
      </div>
      <Panel
        title="Pickup board"
        sub="Drag a card to assign, pick or receive. Assigning auto-picks the nearest rider from that hub."
        action={
          <>
            <Segmented size="sm" options={["All", "SG Highway", "Naroda", "Aslali"] as const} value={hub} onChange={setHub} />
            <Btn size="sm" variant="solid" icon={Plus} onClick={() => setAdding(true)}>
              Book pickup
            </Btn>
          </>
        }
      >
        <Board
          columns={pickCols}
          items={shown}
          itemKey={(p) => p.id}
          getColumn={(p) => p.col}
          onMove={move}
          minColumnWidth={250}
          renderCard={(p) => (
            <button type="button" onClick={() => setOpen(p)} className="block w-full text-left">
              <div className="flex items-center justify-between gap-2 pr-4">
                <span className="font-mono text-[11px] text-d-mute">{p.id}</span>
                <Pill tone={p.kind === "Pharma" ? "info" : p.kind === "B2B" ? "warn" : p.kind === "Documents" ? "neutral" : "accent"}>{p.kind}</Pill>
              </div>
              <p className="mt-1 text-[13.5px] font-semibold">{p.client}</p>
              <p className="truncate text-[12px] text-d-mute">{p.address}</p>
              <div className="mt-2 flex items-center justify-between font-mono text-[11px]">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {p.window}
                </span>
                <span>
                  {p.packets} pkts · {p.kg} kg
                </span>
              </div>
              {p.rider && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] text-d-mute">
                  <Bike className="h-3 w-3 text-d-accent" /> {p.rider}
                </p>
              )}
            </button>
          )}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Packets by client" sub="Booked for pickup today">
          <HBars
            data={[...pickups]
              .sort((a, b) => b.packets - a.packets)
              .slice(0, 7)
              .map((p) => ({
                label: p.client,
                value: p.packets,
                sub: `${p.kg} kg`,
                tone: p.col === "scheduled" ? "warn" : "accent",
              }))}
          />
        </Panel>
        <Panel title="Pickup windows" sub="Bookings per hour slot, all hubs">
          <Bars
            height={190}
            data={["9", "10", "11", "12", "1", "2", "3", "4", "5"].map((h, i) => ({
              label: `${h}:00`,
              value: [1, 2, 2, 2, 1, 1, 2, 1, 1][i],
              tone: i >= 6 ? "warn" : "accent",
            }))}
          />
        </Panel>
      </div>
      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={open ? `${open.id} · ${open.hub} hub` : ""}
        title={open?.client ?? ""}
        sub={open?.address}
        footer={
          <>
            <Btn
              icon={MessageCircle}
              onClick={() => {
                toast.success("Client told: rider on the way", {
                  description: `${open?.client}, WhatsApp with live link`,
                });
                desk.log(`Pickup ETA shared with ${open?.client}`);
              }}
            >
              Share ETA
            </Btn>
            <Btn
              variant="solid"
              onClick={() => {
                if (open) move(open.id, open.col === "scheduled" ? "assigned" : open.col === "assigned" ? "picked" : "hub");
                setOpen(null);
              }}
            >
              {open?.col === "scheduled" ? "Assign rider" : open?.col === "assigned" ? "Mark picked" : "Receive at hub"}
            </Btn>
          </>
        }
      >
        {open && (
          <div className="space-y-4">
            <KV
              items={[
                { k: "Window", v: open.window },
                { k: "Type", v: open.kind },
                { k: "Packets", v: num(open.packets) },
                { k: "Weight", v: `${open.kg} kg` },
                { k: "Rider", v: open.rider ?? "Not assigned" },
                {
                  k: "Vehicle",
                  v: open.kg > 150 ? "3W tempo" : "2W with carrier",
                },
              ]}
            />
            <div className="rounded-[8px] bg-d-sunk p-3 text-[12.5px] leading-relaxed">
              <p className="font-mono text-[10.5px] uppercase tracking-wider text-d-mute">Checklist at pickup</p>
              <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
                <li>Count packets against manifest ({open.packets})</li>
                <li>Every packet has an AWB label and e-way bill if over ₹50,000</li>
                <li>{open.kind === "Pharma" ? "Cold-chain box sealed, temperature logged" : "Fragile tape on electronics and glass"}</li>
                <li>Client signature on the rider app</li>
              </ul>
            </div>
          </div>
        )}
      </Sheet>
      <NewPickup
        open={adding}
        onOpenChange={setAdding}
        onAdd={(p) => {
          setPickups((cur) => [p, ...cur]);
          toast.success("Pickup booked", {
            description: `${p.client} · ${p.window}`,
          });
          desk.log(`Pickup booked: ${p.client}, ${p.packets} packets`, "info");
        }}
        nextId={`PU-${3101 + pickups.length}`}
      />
    </div>
  );
}

function NewPickup({ open, onOpenChange, onAdd, nextId }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (p: Pickup) => void; nextId: string }) {
  const [client, setClient] = React.useState("Navrang Sarees");
  const [hub, setHub] = React.useState<HubId>("Naroda");
  const [packets, setPackets] = React.useState("40");
  const [kg, setKg] = React.useState("25");
  const [window_, setWindow] = React.useState("5:00–6:00");
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Book a pickup" sub="The Route Planner slots it into the nearest rider's afternoon beat.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const c = clients.find((x) => x.name === client);
          onAdd({
            id: nextId,
            client,
            address: `${client}, as per client master`,
            window: window_,
            packets: Number(packets) || 1,
            kg: Number(kg) || 1,
            col: "scheduled",
            kind: c?.segment === "Pharma" ? "Pharma" : c?.segment === "Documents" ? "Documents" : c?.segment === "D2C seller" ? "Seller" : "B2B",
            hub,
          });
          onOpenChange(false);
        }}
      >
        <Field label="Client">
          <select className={inputClass} value={client} onChange={(e) => setClient(e.target.value)}>
            {clients.map((c) => (
              <option key={c.name}>{c.name}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Packets">
            <input className={inputClass} inputMode="numeric" value={packets} onChange={(e) => setPackets(e.target.value.replace(/\D/g, ""))} />
          </Field>
          <Field label="Weight (kg)">
            <input className={inputClass} inputMode="numeric" value={kg} onChange={(e) => setKg(e.target.value.replace(/\D/g, ""))} />
          </Field>
          <Field label="Hub">
            <select className={inputClass} value={hub} onChange={(e) => setHub(e.target.value as HubId)}>
              {hubs.map((h) => (
                <option key={h.id}>{h.id}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Window">
          <select className={inputClass} value={window_} onChange={(e) => setWindow(e.target.value)}>
            {["2:00–3:00", "3:00–4:00", "4:00–5:00", "5:00–6:00", "6:00–7:00"].map((w) => (
              <option key={w}>{w}</option>
            ))}
          </select>
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Btn onClick={() => onOpenChange(false)}>Cancel</Btn>
          <Btn variant="solid" type="submit" icon={Plus}>
            Book pickup
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- NDR ---------------- */

const ndrTone: Record<NdrStatus, Tone> = {
  Open: "late",
  Reattempt: "info",
  RTO: "warn",
  Delivered: "ok",
};

function NdrTab({ ndr, setNdr }: { ndr: Ndr[]; setNdr: React.Dispatch<React.SetStateAction<Ndr[]>> }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<string | null>(null);
  const row = ndr.find((n) => n.awb === open) ?? null;
  const reasons = Array.from(new Set(ndr.map((n) => n.reason)));
  const tones: Tone[] = ["late", "warn", "info", "accent", "ok", "neutral"];

  function act(keys: string[], status: NdrStatus) {
    setNdr((cur) => cur.map((n) => (keys.includes(n.awb) ? { ...n, status } : n)));
    const verb = status === "Reattempt" ? "Reattempt booked" : status === "RTO" ? "Marked RTO" : "Marked delivered";
    toast.success(`${verb} · ${keys.length} shipment${keys.length > 1 ? "s" : ""}`, {
      description: status === "Reattempt" ? "Consignees get a WhatsApp slot link" : status === "RTO" ? "Client informed, return manifest updated" : undefined,
    });
    desk.log(`${verb}: ${keys.join(", ")}`, status === "RTO" ? "warn" : "ok");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open NDR" value={ndr.filter((n) => n.status === "Open").length} delta="+3" deltaGood={false} hint="vs yesterday" icon={PackageX} tone="late" trend={[6, 7, 9, 8, 10, 8, ndr.filter((n) => n.status === "Open").length]} />
        <Stat label="Reattempts booked" value={ndr.filter((n) => n.status === "Reattempt").length} hint="evening 5–8 PM slot" icon={RotateCcw} tone="info" />
        <Stat
          label="COD at risk"
          value={inr(
            ndr.filter((n) => n.status === "Open").reduce((a, n) => a + n.cod, 0),
            { compact: true },
          )}
          hint="on open NDRs"
          icon={IndianRupee}
          tone="warn"
        />
        <Stat label="RTO rate, 30 days" value="6.4%" delta="-0.6" deltaGood={false} hint="industry ~8–10%" icon={Undo2} tone="ok" trend={[7.8, 7.4, 7.1, 7, 6.8, 6.6, 6.4]} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Panel title="Failed deliveries" sub="Select rows to reattempt or RTO in bulk. Click a row for the call log.">
          <DataTable
            rows={ndr}
            rowKey={(n) => n.awb}
            search={(n) => `${n.awb} ${n.consignee} ${n.area} ${n.client} ${n.rider}`}
            searchPlaceholder="Search AWB, consignee, area or client"
            filter={{
              get: (n) => n.status,
              options: ["Open", "Reattempt", "RTO", "Delivered"],
            }}
            onRow={(n) => setOpen(n.awb)}
            bulk={[
              { label: "Book reattempt", run: (k) => act(k, "Reattempt") },
              { label: "Mark RTO", run: (k) => act(k, "RTO") },
            ]}
            columns={[
              {
                key: "awb",
                label: "AWB",
                render: (n) => <span className="font-mono text-[12px]">{n.awb}</span>,
              },
              {
                key: "who",
                label: "Consignee",
                render: (n) => (
                  <div>
                    <p className="font-medium">{n.consignee}</p>
                    <p className="text-[11.5px] text-d-mute">{n.area}</p>
                  </div>
                ),
                sort: (n) => n.consignee,
              },
              {
                key: "client",
                label: "Client",
                render: (n) => <span className="text-d-mute">{n.client}</span>,
                sort: (n) => n.client,
              },
              {
                key: "reason",
                label: "Reason",
                render: (n) => n.reason,
                wide: true,
              },
              {
                key: "att",
                label: "Tries",
                align: "right",
                render: (n) => (
                  <span
                    className="tnum font-mono"
                    style={{
                      color: n.attempts >= 3 ? "var(--d-late)" : undefined,
                    }}
                  >
                    {n.attempts}
                  </span>
                ),
                sort: (n) => n.attempts,
              },
              {
                key: "cod",
                label: "COD",
                align: "right",
                render: (n) => <span className="tnum font-mono">{n.cod ? inr(n.cod) : "prepaid"}</span>,
                sort: (n) => n.cod,
              },
              {
                key: "st",
                label: "Status",
                render: (n) => <Pill tone={ndrTone[n.status]}>{n.status}</Pill>,
              },
            ]}
          />
        </Panel>
        <div className="space-y-5">
          <Panel title="Why they failed" sub="Today's NDRs by reason">
            <Donut
              center={ndr.length}
              sub="NDRs"
              segments={reasons.map((r, i) => ({
                label: r,
                value: ndr.filter((n) => n.reason === r).length,
                tone: tones[i % tones.length],
              }))}
            />
          </Panel>
          <Panel title="By client" sub="Open + reattempt">
            <HBars
              data={Array.from(new Set(ndr.map((n) => n.client)))
                .map((c) => ({
                  label: c,
                  value: ndr.filter((n) => n.client === c && n.status !== "Delivered").length,
                  tone: "late" as Tone,
                }))
                .sort((a, b) => b.value - a.value)}
            />
          </Panel>
        </div>
      </div>
      <Sheet
        open={!!row}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={row ? `${row.awb} · ${row.client}` : ""}
        title={row?.consignee ?? ""}
        sub={row ? `${row.area} · ${row.reason} · attempt ${row.attempts}` : ""}
        footer={
          row && (
            <>
              <Btn
                variant="danger"
                icon={Undo2}
                onClick={() => {
                  act([row.awb], "RTO");
                  setOpen(null);
                }}
              >
                Return to origin
              </Btn>
              <Btn
                icon={Phone}
                onClick={() => {
                  toast.success(`Calling ${row.consignee}`, {
                    description: `Masked number ${row.phone}`,
                  });
                  desk.log(`NDR call to ${row.consignee}`);
                }}
              >
                Call
              </Btn>
              <Btn
                variant="solid"
                icon={RotateCcw}
                onClick={() => {
                  act([row.awb], "Reattempt");
                  setOpen(null);
                }}
              >
                Reattempt 5–8 PM
              </Btn>
            </>
          )
        }
      >
        {row && (
          <div className="space-y-5">
            <KV
              items={[
                { k: "Rider", v: row.rider },
                { k: "Last attempt", v: row.last },
                { k: "COD", v: row.cod ? inr(row.cod) : "Prepaid" },
                {
                  k: "Status",
                  v: <Pill tone={ndrTone[row.status]}>{row.status}</Pill>,
                },
              ]}
            />
            {row.note && <p className="rounded-[8px] border-l-2 border-d-accent bg-d-sunk px-3 py-2 text-[13px]">Rider note: {row.note}</p>}
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-d-mute">NDR Caller log</p>
              <ol className="space-y-2 text-[12.5px]">
                <li className="flex gap-2">
                  <span className="font-mono text-d-mute">{row.last}</span> Rider marked “{row.reason}” with geo-tagged photo
                </li>
                <li className="flex gap-2">
                  <span className="font-mono text-d-mute">+6 min</span> IVR call in Gujarati, {row.reason === "Phone unreachable" ? "not answered" : "answered"}
                </li>
                <li className="flex gap-2">
                  <span className="font-mono text-d-mute">+8 min</span> WhatsApp sent: pick a slot, share live location
                </li>
                <li className="flex gap-2">
                  <span className="font-mono text-d-mute">+9 min</span> Client {row.client} notified on their NDR dashboard
                </li>
              </ol>
            </div>
            <div className="rounded-[10px] bg-[#13281c] p-3 text-[13px] leading-relaxed text-[#cdeed8]">
              Namaste {row.consignee.split(" ")[0]} ji, we tried delivering your {row.client} parcel ({row.awb}) today. Please choose a time: Today 5–8 PM · Tomorrow 10–1 · Tomorrow 5–8. Reply with your location pin if the address needs a
              landmark. — Sabarmati Couriers
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Hub ---------------- */

function HubTab() {
  const desk = useDesk();
  const [hub, setHub] = React.useState<HubId>("Naroda");
  const [bags, setBags] = React.useState(seedBags);
  const [departed, setDeparted] = React.useState<Set<string>>(new Set());
  const rate = useDrift(hub === "SG Highway" ? 910 : hub === "Naroda" ? 780 : 690, 18, 1600);
  const hubBags = bags.filter((b) => b.hub === hub);
  const total = Object.values(sortByHour).reduce((a, arr) => a + arr.reduce((x, y) => x + y, 0), 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={`${hub} sort rate now`} value={`${Math.round(rate)}/hr`} delta="+6%" hint="packets scanned per hour" icon={ScanLine} trend={sortByHour[hub]} />
        <Stat label="Sorted today, all hubs" value={num(total)} hint="inbound + outbound scans" icon={Boxes} tone="ok" />
        <Stat label="Mis-sorts today" value="7" delta="-3" deltaGood={false} hint="0.08% of scans" icon={AlertTriangle} tone="warn" />
        <Stat label="Bags open" value={bags.filter((b) => !b.sealed).length} hint="seal before cut-off" icon={Package} />
      </div>
      <Panel title="Throughput by hub and hour" sub="Packets sorted per hour. The 7–8 AM and 4–5 PM peaks set how many sorters we need." action={<Segmented size="sm" options={hubs.map((h) => h.id)} value={hub} onChange={setHub} />}>
        <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
          <Bars
            height={210}
            data={sortByHour[hub].map((v, i) => ({
              label: hourLabels[i],
              value: v,
              tone: v > 600 ? "accent" : "neutral",
            }))}
          />
          <HeatGrid
            rows={hubs.map((h) => h.id)}
            cols={hourLabels}
            values={hubs.map((h) => sortByHour[h.id])}
            onCell={(r, c) =>
              toast(`${hubs[r].id} at ${hourLabels[c]}:00`, {
                description: `${sortByHour[hubs[r].id][c]} packets sorted`,
              })
            }
          />
        </div>
      </Panel>
      <div className="grid items-start gap-5 xl:grid-cols-[1fr_1.1fr]">
        <div className="space-y-5">
          <Panel title={`Bags at ${hub}`} sub="Seal a bag when it's full or at cut-off. Sealing prints the manifest.">
            <ul className="space-y-2">
              {hubBags.map((b) => (
                <li key={b.id} className="flex items-center gap-3 rounded-[8px] border border-d-line px-3 py-2.5">
                  <Package className={`h-4 w-4 ${b.sealed ? "text-d-ok" : "text-d-accent"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold">{b.dest}</p>
                    <p className="font-mono text-[11px] text-d-mute">
                      {b.id} · {b.packets} pkts · {b.kg} kg
                    </p>
                  </div>
                  {b.sealed ? (
                    <Pill tone="ok">Sealed</Pill>
                  ) : (
                    <Btn
                      size="sm"
                      variant="soft"
                      onClick={() => {
                        setBags((cur) => cur.map((x) => (x.id === b.id ? { ...x, sealed: true } : x)));
                        toast.success(`${b.id} sealed`, {
                          description: `Manifest of ${b.packets} packets printed`,
                        });
                        desk.log(`Bag ${b.id} to ${b.dest} sealed at ${hub}`, "ok");
                      }}
                    >
                      Seal bag
                    </Btn>
                  )}
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title={`Inbound at ${hub} today`} sub="Where today's packets came from, by scan at the inbound dock">
            <Donut
              center={num(sortByHour[hub].slice(0, 7).reduce((a, b) => a + b, 0))}
              sub="inbound"
              segments={[
                { label: "D2C seller pickups", value: 46, tone: "accent" },
                { label: "B2B and industrial", value: 21, tone: "warn" },
                { label: "Linehaul arrivals", value: 18, tone: "info" },
                { label: "Pharma and lab", value: 9, tone: "ok" },
                { label: "Returns (RTO)", value: 6, tone: "late" },
              ]}
            />
          </Panel>
        </div>
        <Panel icon={Truck} title="Linehaul departures" sub="Every truck leaving today, with bags loaded against plan">
          <ul className="space-y-2.5">
            {linehauls.map((l) => {
              const gone = departed.has(l.id);
              return (
                <li key={l.id} className="rounded-[8px] border border-d-line p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold">{l.route}</p>
                      <p className="font-mono text-[11px] text-d-mute">
                        {l.id} · {l.vehicle} · {l.vendor} · from {l.hub}
                      </p>
                    </div>
                    {gone ? (
                      <Pill tone="ok">Departed</Pill>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`rounded px-1.5 py-0.5 font-mono text-[11px] ${l.inHours < 2 ? "bg-d-late/15 text-d-late" : "bg-d-sunk"}`}>
                          <Countdown compact inHours={l.inHours} />
                        </span>
                        <Btn
                          size="sm"
                          icon={Send}
                          onClick={() => {
                            setDeparted((s) => new Set(s).add(l.id));
                            toast.success(`${l.id} dispatched`, {
                              description: `${l.bags} bags, e-way bills generated`,
                            });
                            desk.log(`Linehaul ${l.id} ${l.route} departed with ${l.bags} bags`, "ok");
                          }}
                        >
                          Dispatch
                        </Btn>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Meter value={gone ? l.planned : l.bags} max={l.planned} tone={gone ? "ok" : "accent"} height={4} />
                    <span className="shrink-0 font-mono text-[10.5px] text-d-mute">
                      {l.bags}/{l.planned} bags
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

/* ---------------- COD ---------------- */

function CodTab() {
  const desk = useDesk();
  const [cash, setCash] = React.useState(seedCash);
  const [open, setOpen] = React.useState<Cash | null>(null);
  const inHand = (c: Cash) => Math.max(0, c.collected - c.deposited - c.upi);
  const total = cash.reduce((a, c) => a + inHand(c), 0);
  const bucket = (h: number) => (h <= 6 ? "Under 6 h" : h <= 24 ? "6–24 h" : h <= 48 ? "24–48 h" : "48 h+");
  const buckets = ["Under 6 h", "6–24 h", "24–48 h", "48 h+"].map((label, i) => ({
    label,
    value: cash.filter((c) => inHand(c) > 0 && bucket(c.since) === label).reduce((a, c) => a + inHand(c), 0),
    tone: (["ok", "info", "warn", "late"] as const)[i],
  }));

  function deposit(keys: string[]) {
    setCash((cur) => cur.map((c) => (keys.includes(c.rider) ? { ...c, deposited: c.collected - c.upi, since: 0 } : c)));
    toast.success(`Deposit confirmed for ${keys.length} rider${keys.length > 1 ? "s" : ""}`, { description: "Matched to hub cash book and HDFC pickup slip" });
    desk.log(`COD deposited: ${keys.join(", ")}`, "ok");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Cash with riders" value={inr(total, { compact: true })} delta="-12%" deltaGood={false} hint="excludes UPI" icon={Wallet} tone="warn" trend={[1.9, 1.7, 1.8, 1.6, 1.5, 1.45, total / 1e5]} />
        <Stat
          label="Over 24 hours"
          value={inr(
            cash.filter((c) => c.since > 24).reduce((a, c) => a + inHand(c), 0),
            { compact: true },
          )}
          hint={`${cash.filter((c) => c.since > 24 && inHand(c) > 0).length} riders`}
          icon={AlertTriangle}
          tone="late"
        />
        <Stat label="UPI at doorstep" value="38%" delta="+5" hint="of COD value this week" icon={IndianRupee} tone="ok" trend={[24, 27, 29, 31, 33, 35, 38]} />
        <Stat
          label="Due to clients Tuesday"
          value={inr(
            remittances.reduce((a, r) => a + r.amount, 0),
            { compact: true },
          )}
          hint="5 remittance batches"
          icon={Banknote}
        />
      </div>
      <Panel title="Cash age" sub="How long riders have held undeposited COD. Cash Watch blocks app login after 48 hours.">
        <AgingBar buckets={buckets} format={(v) => inr(v, { compact: true })} />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <Panel className="xl:col-span-2" title="Rider cash book" sub="Select riders to confirm deposits. Click a row for their COD trail.">
          <DataTable
            rows={cash}
            rowKey={(c) => c.rider}
            search={(c) => `${c.rider} ${c.hub}`}
            searchPlaceholder="Search rider or hub"
            filter={{ get: (c) => c.hub, options: hubs.map((h) => h.id) }}
            onRow={setOpen}
            bulk={[{ label: "Confirm deposit", run: deposit }]}
            columns={[
              {
                key: "r",
                label: "Rider",
                render: (c) => (
                  <span className="inline-flex items-center gap-2">
                    <Avatar name={c.rider} size={26} tone={c.since > 24 && inHand(c) > 0 ? "late" : "accent"} /> <span className="font-medium">{c.rider}</span>
                  </span>
                ),
                sort: (c) => c.rider,
              },
              {
                key: "h",
                label: "Hub",
                render: (c) => <span className="text-d-mute">{c.hub}</span>,
              },
              {
                key: "col",
                label: "Collected",
                align: "right",
                render: (c) => <span className="tnum font-mono">{inr(c.collected)}</span>,
                sort: (c) => c.collected,
              },
              {
                key: "upi",
                label: "UPI",
                align: "right",
                render: (c) => <span className="tnum font-mono text-d-mute">{inr(c.upi)}</span>,
              },
              {
                key: "hand",
                label: "Cash in hand",
                align: "right",
                render: (c) => <span className="tnum font-mono font-semibold">{inr(inHand(c))}</span>,
                sort: (c) => inHand(c),
              },
              {
                key: "age",
                label: "Held",
                align: "right",
                render: (c) =>
                  inHand(c) === 0 ? (
                    <Pill tone="ok">Clear</Pill>
                  ) : (
                    <span
                      className="tnum font-mono"
                      style={{
                        color: c.since > 48 ? "var(--d-late)" : c.since > 24 ? "var(--d-warn)" : undefined,
                      }}
                    >
                      {c.since} h
                    </span>
                  ),
                sort: (c) => (inHand(c) ? c.since : -1),
              },
            ]}
          />
        </Panel>
        <Panel icon={Banknote} title="Client remittances" sub="COD collected on their behalf, net of our charges. Approve to release the bank file.">
          <ApprovalQueue
            approveLabel="Release"
            items={remittances.map((r) => ({
              id: r.id,
              title: `${r.client}`,
              sub: `${r.shipments} shipments · ${r.cycle}`,
              amount: inr(r.amount),
              meta: r.id,
            }))}
            onDecide={(id, d) => {
              const r = remittances.find((x) => x.id === id);
              if (d === "approved") desk.log(`Remittance ${id} of ${inr(r?.amount ?? 0)} released to ${r?.client}`, "ok");
            }}
          />
        </Panel>
        <Panel title="COD collected, last 7 days" sub="Cash vs UPI at the doorstep">
          <Bars
            height={260}
            format={(v) => `₹${v}L`}
            data={["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"].map((d, i) => {
              const c = [3.1, 2.9, 3.4, 3.8, 1.6, 3.6, 2.2][i];
              const u = [1.4, 1.5, 1.7, 2.0, 0.9, 2.1, 1.4][i];
              return {
                label: d,
                value: +(c + u).toFixed(1),
                stack: [
                  { name: "Cash", value: c, tone: "warn" as Tone },
                  { name: "UPI", value: u, tone: "ok" as Tone },
                ],
              };
            })}
          />
        </Panel>
      </div>
      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={open ? `${open.hub} hub · COD trail` : ""}
        title={open?.rider ?? ""}
        sub={open ? `${inr(inHand(open))} cash in hand · held ${open.since} h` : ""}
        footer={
          open && (
            <>
              <Btn
                variant="danger"
                onClick={() => {
                  toast.error(`${open.rider}'s app login blocked`, {
                    description: "Unblocks automatically when cash is deposited",
                  });
                  desk.log(`Blocked app login for ${open.rider} over undeposited COD`, "late");
                }}
              >
                Block app
              </Btn>
              <Btn
                variant="solid"
                onClick={() => {
                  deposit([open.rider]);
                  setOpen(null);
                }}
              >
                Confirm deposit
              </Btn>
            </>
          )
        }
      >
        {open && (
          <div className="space-y-4">
            <KV
              items={[
                { k: "Collected", v: inr(open.collected) },
                { k: "UPI (auto-matched)", v: inr(open.upi) },
                { k: "Deposited", v: inr(open.deposited) },
                { k: "Cash in hand", v: inr(inHand(open)) },
              ]}
            />
            <Meter value={open.deposited + open.upi} max={open.collected} tone="ok" />
            <ul className="space-y-1.5 text-[12.5px]">
              {[
                {
                  t: "Yesterday 7:40 PM",
                  d: `Runsheet closed, ${Math.round(open.collected / 1100)} COD drops`,
                },
                {
                  t: "Yesterday 7:55 PM",
                  d: open.deposited ? `Deposited ${inr(open.deposited)} at hub counter` : "No deposit recorded",
                },
                {
                  t: "Today 9:00 AM",
                  d: "Cash Watch reminder sent on WhatsApp",
                },
                {
                  t: "Today 11:00 AM",
                  d: open.since > 24 ? "Escalated to hub in-charge" : "Within policy",
                },
              ].map((x) => (
                <li key={x.t} className="flex gap-3 rounded-[8px] border border-d-line px-3 py-2">
                  <span className="shrink-0 font-mono text-[11px] text-d-mute">{x.t}</span>
                  {x.d}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Clients ---------------- */

function ClientsTab() {
  const desk = useDesk();
  const [open, setOpen] = React.useState<Client | null>(null);
  const [invoiced, setInvoiced] = React.useState<Set<string>>(new Set());
  const billed = clients.reduce((a, c) => a + c.billed, 0);
  const due = clients.reduce((a, c) => a + c.outstanding, 0);
  const segs = Array.from(new Set(clients.map((c) => c.segment)));
  const segTone: Tone[] = ["accent", "info", "ok", "warn", "neutral"];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Billed this month" value={inr(billed, { compact: true })} delta="+9%" hint="12 active clients" icon={FileText} trend={[16, 17.5, 18.2, 19.4, 20.1, 21.3, billed / 1e5]} />
        <Stat label="Outstanding" value={inr(due, { compact: true })} delta="+4%" deltaGood={false} hint="avg 34 days" icon={IndianRupee} tone="warn" />
        <Stat label="Shipments / month" value={num(clients.reduce((a, c) => a + c.monthly, 0))} delta="+11%" icon={Package} tone="ok" trend={[24, 25, 27, 28, 29, 31, 33]} />
        <Stat label="SLA met, weighted" value="95.2%" delta="+0.4" hint="delivered within promise" icon={MapPin} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Panel title="Client accounts" sub="Click a client for rate card, SLA and invoices">
          <DataTable
            rows={clients}
            rowKey={(c) => c.name}
            search={(c) => `${c.name} ${c.segment} ${c.contact}`}
            searchPlaceholder="Search client or contact"
            filter={{ get: (c) => c.segment, options: segs }}
            onRow={setOpen}
            bulk={[
              {
                label: "Send SLA report",
                run: (k) => {
                  toast.success(`SLA report sent to ${k.length} clients`);
                  desk.log(`October SLA report sent to ${k.length} clients`);
                },
              },
            ]}
            columns={[
              {
                key: "n",
                label: "Client",
                render: (c) => (
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-[11.5px] text-d-mute">
                      {c.segment} · since {c.since}
                    </p>
                  </div>
                ),
                sort: (c) => c.name,
              },
              {
                key: "m",
                label: "Shipments/mo",
                align: "right",
                render: (c) => <span className="tnum font-mono">{num(c.monthly)}</span>,
                sort: (c) => c.monthly,
              },
              {
                key: "b",
                label: "Billed",
                align: "right",
                render: (c) => <span className="tnum font-mono">{inr(c.billed, { compact: true })}</span>,
                sort: (c) => c.billed,
              },
              {
                key: "o",
                label: "Due",
                align: "right",
                render: (c) => (
                  <span
                    className="tnum font-mono"
                    style={{
                      color: c.days > 60 ? "var(--d-late)" : c.days > 40 ? "var(--d-warn)" : undefined,
                    }}
                  >
                    {c.outstanding ? `${inr(c.outstanding, { compact: true })} · ${c.days}d` : "—"}
                  </span>
                ),
                sort: (c) => c.outstanding,
              },
              {
                key: "s",
                label: "SLA",
                align: "right",
                render: (c) => <span className="tnum font-mono">{c.sla}%</span>,
                sort: (c) => c.sla,
              },
              {
                key: "r",
                label: "RTO",
                align: "right",
                render: (c) => (
                  <span className="tnum font-mono" style={{ color: c.rto > 10 ? "var(--d-late)" : undefined }}>
                    {c.rto}%
                  </span>
                ),
                sort: (c) => c.rto,
              },
            ]}
          />
        </Panel>
        <div className="space-y-5">
          <Panel title="Revenue by segment" sub="This month">
            <Donut
              center={inr(billed, { compact: true })}
              sub="billed"
              segments={segs.map((s, i) => ({
                label: s,
                value: clients.filter((c) => c.segment === s).reduce((a, c) => a + c.billed, 0),
                tone: segTone[i % segTone.length],
              }))}
            />
          </Panel>
          <Panel title="Highest RTO" sub="Returns eat the margin">
            <HBars
              format={(v) => `${v}%`}
              data={[...clients]
                .sort((a, b) => b.rto - a.rto)
                .slice(0, 5)
                .map((c) => ({
                  label: c.name,
                  value: c.rto,
                  tone: c.rto > 10 ? "late" : "warn",
                }))}
            />
          </Panel>
        </div>
      </div>
      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={open ? `${open.segment} · since ${open.since}` : ""}
        title={open?.name ?? ""}
        sub={open ? `Contact ${open.contact} · ${open.rate}` : ""}
        footer={
          open && (
            <>
              <Btn
                icon={MessageCircle}
                onClick={() => {
                  toast.success("Payment reminder sent", {
                    description: `${open.contact} on WhatsApp`,
                  });
                  desk.log(`Dues reminder to ${open.name} for ${inr(open.outstanding)}`);
                }}
              >
                Remind dues
              </Btn>
              <Btn
                variant="solid"
                icon={FileText}
                disabled={invoiced.has(open.name)}
                onClick={() => {
                  setInvoiced((s) => new Set(s).add(open.name));
                  toast.success("GST invoice raised in Tally", {
                    description: `${open.name} · ${inr(Math.round(open.billed * 0.18))} GST at 18%`,
                  });
                  desk.log(`GST invoice raised for ${open.name}`, "ok");
                }}
              >
                {invoiced.has(open.name) ? "Invoice raised" : "Raise October invoice"}
              </Btn>
            </>
          )
        }
      >
        {open && (
          <div className="space-y-5">
            <KV
              items={[
                { k: "Shipments / month", v: num(open.monthly) },
                { k: "Billed this month", v: inr(open.billed) },
                { k: "GST @ 18%", v: inr(Math.round(open.billed * 0.18)) },
                {
                  k: "Outstanding",
                  v: open.outstanding ? `${inr(open.outstanding)} · ${open.days} days` : "Nil",
                },
                { k: "SLA met", v: `${open.sla}%` },
                { k: "COD share", v: `${open.codShare}%` },
              ]}
            />
            <div>
              <p className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-d-mute">SLA, last 6 weeks</p>
              <Bars
                height={120}
                format={(v) => `${v}%`}
                data={["W38", "W39", "W40", "W41", "W42", "W43"].map((w, i) => ({
                  label: w,
                  value: +(open.sla + [-1.2, 0.4, -0.6, 0.8, -0.2, 0][i]).toFixed(1),
                  tone: "accent" as Tone,
                }))}
              />
            </div>
            <div>
              <p className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-d-mute">RTO vs our D2C average</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-[12px]">
                  <span className="w-24 text-d-mute">{open.name.split(" ")[0]}</span>
                  <Meter value={open.rto} max={15} tone={open.rto > 10 ? "late" : "warn"} />
                  <span className="w-10 text-right font-mono">{open.rto}%</span>
                </div>
                <div className="flex items-center gap-3 text-[12px]">
                  <span className="w-24 text-d-mute">Average</span>
                  <Meter value={7} max={15} tone="neutral" />
                  <span className="w-10 text-right font-mono">7%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
