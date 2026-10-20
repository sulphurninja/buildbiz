"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  BadgeIndianRupee,
  CalendarClock,
  CircleDot,
  Disc3,
  FileCheck2,
  Fuel,
  Gauge as GaugeIcon,
  LayoutGrid,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Plug,
  Plus,
  Route,
  ShieldAlert,
  Timer,
  Truck,
  Users,
  Wrench,
} from "lucide-react";
import { DeskShell, useDesk } from "../shell";
import { AreaChart, Bars, Donut, HBars } from "../charts";
import { AgingBar, Board, Countdown, DataTable } from "../data";
import { AgentsModule, ConnectionsModule, IndependenceModule, PeopleModule } from "../common";
import { Avatar, Btn, Field, inputClass, inr, KV, Meter, Modal, Panel, Pill, SearchBox, Segmented, Sheet, Stat, toneVar } from "../ui";
import { useTicker } from "../hooks";
import type { DeskConfig, DeskModule, IndependenceData, Integration, TeamMember, Tone, WorkforceAgent } from "../types";

/* ============================================================
   Data — Palar Roadlines, Namakkal. Fictional 60-truck fleet:
   trailers, Taurus multi-axles and tippers. Today = Tue 20 Oct.
   ============================================================ */

type Status = "On trip" | "Loading" | "Idle" | "Workshop" | "Permit expired";
type Kind = "Trailer 40ft" | "Taurus 16W" | "Tipper 10W";
type DocKey = "Insurance" | "FC" | "National permit" | "Road tax" | "PUC";
const DOCS: DocKey[] = ["Insurance", "FC", "National permit", "Road tax", "PUC"];
const STATUSES: Status[] = ["On trip", "Loading", "Idle", "Workshop", "Permit expired"];
const statusTone: Record<Status, Tone> = { "On trip": "accent", Loading: "info", Idle: "neutral", Workshop: "warn", "Permit expired": "late" };

type Truck = {
  id: string;
  plate: string;
  kind: Kind;
  status: Status;
  driver: string;
  phone: string;
  from: string;
  to: string;
  load: string;
  party: string;
  odo: number;
  kmToday: number;
  speed: number;
  eta: number;
  kmpl: number;
  tank: number;
  docs: Record<DocKey, number>;
  freight: number;
  advance: number;
  note: string;
};

function lcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}
const rnd = lcg(2826);

const DRIVERS = ["Murugan K", "Selvam R", "Senthil P", "Karthik M", "Arumugam S", "Palanisamy V", "Velu T", "Ganesan A", "Saravanan N", "Mani K", "Rajendran P", "Kumaresan S", "Anbu R", "Sivakumar M", "Prakash D", "Sakthivel K", "Thangaraj E", "Duraisamy V", "Elango R", "Manikandan S"];
const LANES: Record<Kind, { from: string; to: string; load: string; party: string; freight: number }[]> = {
  "Trailer 40ft": [
    { from: "Salem", to: "Bhiwandi", load: "Steel coils 28 T", party: "Bhavani Steel Coils", freight: 118000 },
    { from: "Tuticorin", to: "Namakkal", load: "Imported maize 30 T", party: "Kaveri Feeds", freight: 46000 },
    { from: "Namakkal", to: "Hyderabad", load: "Poultry feed 29 T", party: "Kaveri Feeds", freight: 72000 },
    { from: "Ariyalur", to: "Kochi", load: "Cement 32 T", party: "Thiru Cements", freight: 58000 },
    { from: "Hosur", to: "Chennai port", load: "Auto parts, 2 x 20ft", party: "Hosur Auto Components", freight: 31000 },
  ],
  "Taurus 16W": [
    { from: "Namakkal", to: "Kolkata", load: "Eggs 1.2 L trays", party: "Annai Egg Traders", freight: 142000 },
    { from: "Davangere", to: "Namakkal", load: "Maize 25 T", party: "Deccan Agro", freight: 52000 },
    { from: "Tiruppur", to: "Bengaluru", load: "Knitwear cartons", party: "Sri Murugan Textiles", freight: 28000 },
    { from: "Salem", to: "Visakhapatnam", load: "Sago 24 T", party: "Salem Sago Serve", freight: 88000 },
    { from: "Ariyalur", to: "Madurai", load: "Cement 25 T", party: "Thiru Cements", freight: 26000 },
  ],
  "Tipper 10W": [
    { from: "Paramathi quarry", to: "Karur bypass site", load: "Blue metal 20mm", party: "Velan Blue Metals", freight: 9500 },
    { from: "Mohanur", to: "Namakkal ring road", load: "M-sand 18 T", party: "Velan Blue Metals", freight: 8200 },
    { from: "Ariyalur mines", to: "Thiru Cements kiln", load: "Limestone 22 T", party: "Thiru Cements", freight: 7400 },
  ],
};
const SERIES = ["AK", "BZ", "AX", "CM", "BD", "AV", "CJ", "BP"];
const RTO = ["TN 28", "TN 28", "TN 34", "TN 88"];

function buildTrucks(): Truck[] {
  const plan: Status[] = [];
  const counts: [Status, number][] = [["On trip", 32], ["Loading", 8], ["Idle", 9], ["Workshop", 7], ["Permit expired", 4]];
  counts.forEach(([s, n]) => {
    for (let k = 0; k < n; k++) plan.push(s);
  });
  for (let i = plan.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [plan[i], plan[j]] = [plan[j], plan[i]];
  }
  return plan.map((status, i) => {
    const kind: Kind = i % 5 === 4 ? "Tipper 10W" : i % 3 === 1 ? "Taurus 16W" : "Trailer 40ft";
    const lanes = LANES[kind];
    const lane = lanes[i % lanes.length];
    const std = kind === "Tipper 10W" ? 2.7 : kind === "Taurus 16W" ? 3.9 : 3.4;
    const docs = {} as Record<DocKey, number>;
    DOCS.forEach((d, k) => (docs[d] = Math.round(k === 4 ? 16 + rnd() * 160 : 18 + rnd() * 330)));
    if (i % 9 === 2) docs.Insurance = 3 + (i % 7);
    if (i % 11 === 5) docs.FC = 6 + (i % 5);
    if (i % 26 === 7) docs.PUC = -2;
    if (status === "Permit expired") docs["National permit"] = -1 - (i % 8);
    const num = 1000 + Math.floor(rnd() * 8999);
    const moving = status === "On trip";
    return {
      id: `T${String(i + 1).padStart(2, "0")}`,
      plate: `${RTO[i % RTO.length]} ${SERIES[i % SERIES.length]} ${num}`,
      kind,
      status,
      driver: DRIVERS[i % DRIVERS.length],
      phone: `98${String(4300000 + i * 7919).slice(0, 8)}`,
      from: lane.from,
      to: status === "Idle" || status === "Workshop" ? "Namakkal yard" : lane.to,
      load: status === "Idle" || status === "Workshop" ? "Empty" : lane.load,
      party: lane.party,
      odo: 180000 + Math.floor(rnd() * 520000),
      kmToday: moving ? Math.round(80 + rnd() * 340) : status === "Loading" ? Math.round(rnd() * 30) : 0,
      speed: moving ? Math.round(38 + rnd() * 24) : 0,
      eta: moving ? Math.round(3 + rnd() * 50) : 0,
      kmpl: Number((std * (0.84 + rnd() * 0.24)).toFixed(2)),
      tank: Math.round(18 + rnd() * 78),
      docs,
      freight: lane.freight,
      advance: Math.round((lane.freight * (0.25 + rnd() * 0.2)) / 500) * 500,
      note: status === "Workshop" ? ["Clutch plate", "Turbo leak", "Brake liner + drum", "Gearbox noise", "Spring leaf broken", "Radiator", "Self motor"][i % 7] : status === "Permit expired" ? "National permit lapsed, parked at yard" : moving ? "GPS ping fine" : status === "Loading" ? "At party gate since morning" : "Waiting for a load",
    };
  });
}
const seedTrucks = buildTrucks();
const STD_KMPL: Record<Kind, number> = { "Tipper 10W": 2.7, "Taurus 16W": 3.9, "Trailer 40ft": 3.4 };
function kmFor(t: Truck) {
  return t.status === "Workshop" || t.status === "Permit expired" ? 1800 + (t.odo % 1400) : 6200 + (t.odo % 3800);
}
const fleetKmplSeed = seedTrucks.reduce((a, t) => a + kmFor(t), 0) / seedTrucks.reduce((a, t) => a + Math.round(kmFor(t) / t.kmpl), 0);

const loadsWaiting = [
  { id: "LD-771", party: "Kaveri Feeds", lane: "Namakkal → Hyderabad", from: "Namakkal", to: "Hyderabad", load: "Poultry feed 29 T", freight: 72000, need: "Trailer 40ft" as Kind, by: "Today 4 PM", via: "Direct" },
  { id: "LD-772", party: "Annai Egg Traders", lane: "Namakkal → Guwahati", from: "Namakkal", to: "Guwahati", load: "Eggs 1.4 L trays", freight: 168000, need: "Taurus 16W" as Kind, by: "Today 9 PM", via: "Direct" },
  { id: "LD-773", party: "Thiru Cements", lane: "Ariyalur → Kochi", from: "Ariyalur", to: "Kochi", load: "Cement 32 T", freight: 58000, need: "Trailer 40ft" as Kind, by: "Wed 6 AM", via: "Ganesh Broker, Sankari" },
  { id: "LD-774", party: "Velan Blue Metals", lane: "Paramathi → Erode", from: "Paramathi quarry", to: "Erode", load: "Blue metal 40mm", freight: 10800, need: "Tipper 10W" as Kind, by: "Today 2 PM", via: "Direct" },
  { id: "LD-775", party: "Sri Murugan Textiles", lane: "Tiruppur → Bengaluru", from: "Tiruppur", to: "Bengaluru", load: "Knitwear cartons", freight: 28000, need: "Taurus 16W" as Kind, by: "Wed 10 AM", via: "Load board" },
];

type Trip = {
  no: string;
  plate: string;
  driver: string;
  party: string;
  lane: string;
  load: string;
  started: string;
  km: number;
  freight: number;
  advance: number;
  dieselAdv: number;
  toll: number;
  halts: { place: string; hrs: number; reason: string }[];
  status: "Running" | "Unloading" | "POD pending" | "Settled";
};
const tripSeed: Trip[] = [
  { no: "PR/2410-118", plate: seedTrucks[0].plate, driver: "Murugan K", party: "Bhavani Steel Coils", lane: "Salem → Bhiwandi", load: "Steel coils 28 T", started: "17 Oct", km: 1210, freight: 118000, advance: 32000, dieselAdv: 41000, toll: 9800, halts: [{ place: "Krishnagiri", hrs: 2, reason: "Meal + rest" }, { place: "Kolhapur RTO check", hrs: 3.5, reason: "Checkpost" }], status: "Running" },
  { no: "PR/2410-121", plate: seedTrucks[1].plate, driver: "Selvam R", party: "Annai Egg Traders", lane: "Namakkal → Kolkata", load: "Eggs 1.2 L trays", started: "16 Oct", km: 1980, freight: 142000, advance: 38000, dieselAdv: 52000, toll: 14200, halts: [{ place: "Vijayawada", hrs: 6, reason: "Driver rest" }, { place: "Bhubaneswar", hrs: 9, reason: "Waiting unload slot" }], status: "Running" },
  { no: "PR/2410-124", plate: seedTrucks[2].plate, driver: "Senthil P", party: "Kaveri Feeds", lane: "Namakkal → Hyderabad", load: "Poultry feed 29 T", started: "18 Oct", km: 820, freight: 72000, advance: 18000, dieselAdv: 26000, toll: 6100, halts: [{ place: "Kurnool", hrs: 1.5, reason: "Puncture" }], status: "Unloading" },
  { no: "PR/2410-109", plate: seedTrucks[3].plate, driver: "Karthik M", party: "Thiru Cements", lane: "Ariyalur → Kochi", load: "Cement 32 T", started: "12 Oct", km: 560, freight: 58000, advance: 15000, dieselAdv: 19000, toll: 3900, halts: [{ place: "Walayar", hrs: 7, reason: "Checkpost queue" }], status: "POD pending" },
  { no: "PR/2410-112", plate: seedTrucks[4].plate, driver: "Arumugam S", party: "Deccan Agro", lane: "Davangere → Namakkal", load: "Maize 25 T", started: "14 Oct", km: 640, freight: 52000, advance: 14000, dieselAdv: 18500, toll: 4200, halts: [{ place: "Hosur", hrs: 2, reason: "Meal + rest" }], status: "POD pending" },
  { no: "PR/2410-101", plate: seedTrucks[5].plate, driver: "Palanisamy V", party: "Salem Sago Serve", lane: "Salem → Visakhapatnam", load: "Sago 24 T", started: "9 Oct", km: 1150, freight: 88000, advance: 24000, dieselAdv: 33000, toll: 7600, halts: [{ place: "Ongole", hrs: 4, reason: "Driver rest" }, { place: "Rajahmundry", hrs: 11, reason: "Party holiday, no unload" }], status: "Settled" },
  { no: "PR/2410-126", plate: seedTrucks[6].plate, driver: "Velu T", party: "Sri Murugan Textiles", lane: "Tiruppur → Bengaluru", load: "Knitwear cartons", started: "19 Oct", km: 310, freight: 28000, advance: 6000, dieselAdv: 9500, toll: 2300, halts: [], status: "Running" },
  { no: "PR/2410-127", plate: seedTrucks[7].plate, driver: "Ganesan A", party: "Hosur Auto Components", lane: "Hosur → Chennai port", load: "Auto parts, 2 x 20ft", started: "19 Oct", km: 280, freight: 31000, advance: 7000, dieselAdv: 9000, toll: 2900, halts: [{ place: "Sriperumbudur", hrs: 5, reason: "Port gate queue" }], status: "Running" },
  { no: "PR/2410-104", plate: seedTrucks[8].plate, driver: "Saravanan N", party: "Kaveri Feeds", lane: "Tuticorin → Namakkal", load: "Imported maize 30 T", started: "11 Oct", km: 410, freight: 46000, advance: 12000, dieselAdv: 14000, toll: 2800, halts: [{ place: "Tuticorin port", hrs: 14, reason: "Customs release" }], status: "Settled" },
  { no: "PR/2410-115", plate: seedTrucks[9].plate, driver: "Mani K", party: "Bhavani Steel Coils", lane: "Salem → Bhiwandi", load: "Steel coils 27 T", started: "15 Oct", km: 1210, freight: 118000, advance: 30000, dieselAdv: 41000, toll: 9800, halts: [{ place: "Pune bypass", hrs: 3, reason: "Traffic block" }], status: "Unloading" },
  { no: "PR/2410-119", plate: seedTrucks[10].plate, driver: "Rajendran P", party: "Annai Egg Traders", lane: "Namakkal → Guwahati", load: "Eggs 1.4 L trays", started: "17 Oct", km: 2640, freight: 168000, advance: 45000, dieselAdv: 68000, toll: 18600, halts: [{ place: "Nagpur", hrs: 5, reason: "Driver rest" }, { place: "Siliguri", hrs: 8, reason: "Permit check" }], status: "Running" },
  { no: "PR/2410-098", plate: seedTrucks[11].plate, driver: "Kumaresan S", party: "Thiru Cements", lane: "Ariyalur → Madurai", load: "Cement 25 T", started: "8 Oct", km: 220, freight: 26000, advance: 6000, dieselAdv: 7500, toll: 1400, halts: [], status: "Settled" },
  { no: "PR/2410-107", plate: seedTrucks[12].plate, driver: "Anbu R", party: "Deccan Agro", lane: "Davangere → Namakkal", load: "Maize 25 T", started: "11 Oct", km: 640, freight: 52000, advance: 14000, dieselAdv: 18000, toll: 4200, halts: [{ place: "Chitradurga", hrs: 2.5, reason: "Weighbridge dispute" }], status: "POD pending" },
  { no: "PR/2410-128", plate: seedTrucks[13].plate, driver: "Sivakumar M", party: "Velan Blue Metals", lane: "Paramathi → Karur", load: "Blue metal 20mm", started: "20 Oct", km: 46, freight: 9500, advance: 1500, dieselAdv: 2500, toll: 0, halts: [], status: "Running" },
];

type Alert = { id: string; plate: string; driver: string; what: string; litres: number; where: string; when: string; severity: Tone };
const theftSeed: Alert[] = [
  { id: "FA-1", plate: seedTrucks[14].plate, driver: seedTrucks[14].driver, what: "Tank level dropped with ignition off", litres: 62, where: "Near Krishnagiri toll, NH44", when: "2:14 AM", severity: "late" },
  { id: "FA-2", plate: seedTrucks[2].plate, driver: seedTrucks[2].driver, what: "Bill 210 L, sensor shows 168 L added", litres: 42, where: "Highway Fuels, Kurnool", when: "Yesterday 7:40 PM", severity: "late" },
  { id: "FA-3", plate: seedTrucks[20].plate, driver: seedTrucks[20].driver, what: "km/l fell to 2.6 on an empty return", litres: 35, where: "Davangere → Namakkal", when: "Mon", severity: "warn" },
  { id: "FA-4", plate: seedTrucks[27].plate, driver: seedTrucks[27].driver, what: "Two fills 90 km apart", litres: 120, where: "Salem and Dharmapuri", when: "Sun", severity: "warn" },
  { id: "FA-5", plate: seedTrucks[33].plate, driver: seedTrucks[33].driver, what: "Idle 3 h 40 m with engine on", litres: 11, where: "Thiru Cements gate, Ariyalur", when: "Today 8:10 AM", severity: "info" },
];

const fuelCards = [
  { name: "IOCL XTRAPOWER", balance: 412000, limit: 900000, cards: 34, spent: 1860000 },
  { name: "BPCL SmartFleet", balance: 96000, limit: 500000, cards: 18, spent: 940000 },
  { name: "HPCL DriveTrack Plus", balance: 151000, limit: 300000, cards: 8, spent: 410000 },
];

type Job = { id: string; plate: string; job: string; where: string; cost: number; col: "Reported" | "In workshop" | "Waiting parts" | "Ready" };
const jobSeed: Job[] = seedTrucks
  .filter((t) => t.status === "Workshop")
  .map((t, i): Job => ({ id: `WJ-${310 + i}`, plate: t.plate, job: t.note, where: ["Own bay, Namakkal", "Sri Balaji Motors, Salem", "Own bay, Namakkal", "Tata ASC, Karur", "Kongu Springs, Namakkal", "Own bay, Namakkal", "Ashok Leyland ASC, Erode"][i % 7], cost: [18500, 42000, 9600, 36000, 7800, 12400, 6900][i % 7], col: (["In workshop", "Waiting parts", "In workshop", "Waiting parts", "Ready", "Reported", "In workshop"] as const)[i % 7] }))
  .concat([
    { id: "WJ-320", plate: seedTrucks[3].plate, job: "Air leak reported by driver", where: "On route, Walayar", cost: 0, col: "Reported" },
    { id: "WJ-321", plate: seedTrucks[16].plate, job: "Tail lamp + reflector tape (FC prep)", where: "Own bay, Namakkal", cost: 2400, col: "Reported" },
  ]);

type Party = { name: string; town: string; invoices: number; amount: number; days: number; pod: number; promise?: string; contact: string };
const parties: Party[] = [
  { name: "Bhavani Steel Coils", town: "Salem", invoices: 6, amount: 612000, days: 38, pod: 1, promise: "RTGS Friday", contact: "Jayaraman (accounts)" },
  { name: "Annai Egg Traders", town: "Namakkal", invoices: 9, amount: 884000, days: 52, pod: 2, contact: "Annai Ravi" },
  { name: "Kaveri Feeds", town: "Namakkal", invoices: 7, amount: 418000, days: 27, pod: 0, promise: "Cheque on 25 Oct", contact: "Logesh" },
  { name: "Thiru Cements", town: "Ariyalur", invoices: 11, amount: 726000, days: 74, pod: 3, contact: "Logistics desk" },
  { name: "Deccan Agro", town: "Davangere", invoices: 4, amount: 208000, days: 96, pod: 2, contact: "Basavaraj" },
  { name: "Salem Sago Serve", town: "Salem", invoices: 3, amount: 176000, days: 18, pod: 0, contact: "Kannan" },
  { name: "Hosur Auto Components", town: "Hosur", invoices: 5, amount: 155000, days: 44, pod: 1, contact: "Priya (SCM)" },
  { name: "Sri Murugan Textiles", town: "Tiruppur", invoices: 6, amount: 98000, days: 63, pod: 0, contact: "Murugesan" },
  { name: "Velan Blue Metals", town: "Paramathi", invoices: 22, amount: 241000, days: 33, pod: 0, promise: "Weekly Saturday", contact: "Velan" },
  { name: "Ganesh Transport Broker", town: "Sankari", invoices: 8, amount: 332000, days: 81, pod: 1, contact: "Ganesh" },
  { name: "Coastal Shipping Agencies", town: "Tuticorin", invoices: 2, amount: 92000, days: 112, pod: 0, contact: "Antony" },
];

const team: TeamMember[] = [
  { name: "R. Senthilkumar", role: "Owner", status: "Busy", load: 92, focus: "Two permit renewals and the Annai Guwahati rate", tasks: [{ title: "Sign 4 permit renewals", due: "11:00" }, { title: "Annai rate for Guwahati", due: "12:30" }, { title: "Bank: 3 new chassis loan", due: "4:00" }], week: [1, 1, 1, 1, 1, 1], since: "2004" },
  { name: "Kavitha Senthilkumar", role: "Accounts + freight billing", status: "On floor", load: 74, focus: "Raising bills on 6 PODs that came in by courier", tasks: [{ title: "Bill 6 PODs in Tally", due: "1:00" }, { title: "TDS 194C reconciliation", due: "Fri" }], week: [1, 1, 1, 1, 1, 0], since: "2009" },
  { name: "Balamurugan S", role: "Traffic in-charge", status: "Busy", load: 90, focus: "Finding return loads for 7 trucks emptying in the north", tasks: [{ title: "Return load for Kolkata truck", due: "now" }, { title: "Place 2 trucks at Kaveri Feeds", due: "2:00" }, { title: "Broker call with Ganesh", due: "5:00", done: true }], week: [1, 1, 1, 1, 1, 1], since: "2013" },
  { name: "Ilango M", role: "Workshop head", status: "On floor", load: 81, focus: "7 trucks in, gearbox job waiting on Leyland parts", tasks: [{ title: "Clutch plate job", due: "3:00" }, { title: "Chase Leyland ASC for gearbox kit", due: "11:30" }], week: [1, 1, 1, 1, 1, 1], since: "2011" },
  { name: "Pandian R", role: "Tyre + battery man", status: "On floor", load: 58, focus: "Rotation on two trailers, 4 casings to retread", tasks: [{ title: "Send 4 casings to Kongu Retreads", due: "12:00" }, { title: "Tread depth round, yard", due: "5:00" }], week: [1, 1, 1, 0, 1, 1], since: "2016" },
  { name: "Yamuna D", role: "Documents + RTO", status: "In field", load: 66, focus: "At Namakkal RTO for 2 FCs and a permit", tasks: [{ title: "FC inspection slot 11:15", due: "11:15" }, { title: "Insurance quotes, 3 trucks", due: "4:00" }], week: [1, 1, 1, 1, 1, 0], since: "2019" },
  { name: "Muthu Krishnan", role: "Driver supervisor", status: "In field", load: 70, focus: "Two drivers on leave, arranging relief at Hosur", tasks: [{ title: "Relief driver to Hosur", due: "1:00" }, { title: "Bhatta settlement 9 drivers", due: "6:00" }], week: [1, 1, 1, 1, 1, 1], since: "2015" },
  { name: "Divya P", role: "GPS + diesel desk", status: "Off", load: 34, focus: "Night shift; flagged the Krishnagiri tank drop at 2:14 AM", tasks: [{ title: "Night diesel report", due: "done", done: true }], week: [1, 1, 1, 1, 1, 0], since: "2021" },
];

const agents: WorkforceAgent[] = [
  { name: "Trip Tracker", role: "Watches every truck's GPS against its trip sheet", icon: Navigation, status: "Running", runsToday: 96, hoursSaved: 7, accuracy: 97, last: "just now", skills: ["AIS-140 GPS", "Geofence", "WhatsApp"], schedule: "Every 10 min, 24 hours", log: ["Bhubaneswar halt crossed 9 h, told party", "3 trucks entered Namakkal geofence", "Sent ETA to Kaveri Feeds"] },
  { name: "Diesel Auditor", role: "Matches fuel bills, tank sensors and km run", icon: Fuel, status: "Needs you", runsToday: 18, hoursSaved: 5.5, accuracy: 92, last: "6 min ago", skills: ["Tank sensor", "Fuel cards", "km/l"], schedule: "After every fill + nightly", inbox: [{ title: "62 L drop near Krishnagiri, ignition off", detail: "Driver says nothing happened. Sensor shows a 4-minute drop. Recommend deducting from bhatta and changing the tank lock." }], log: ["Kurnool bill short 42 L, raised with pump", "BPCL card under ₹1 L, top-up drafted", "Weekly km/l ranking sent to supervisor"] },
  { name: "Doc Renewer", role: "Renews insurance, FC, permits and PUC on time", icon: FileCheck2, status: "Needs you", runsToday: 4, hoursSaved: 4, accuracy: 95, last: "40 min ago", skills: ["Vahan", "Insurance quotes", "Reminders"], schedule: "Daily 7 AM", inbox: [{ title: "4 national permits expired, trucks parked", detail: "Renewal fees ₹16,500 each. Yamuna can file today if you approve." }], log: ["Booked FC slot 11:15 at Namakkal RTO", "Got 3 insurance quotes, cheapest New India", "PUC expired on 1 truck, booked test"] },
  { name: "Dues Collector", role: "Follows up parties for freight against PODs", icon: BadgeIndianRupee, status: "Running", runsToday: 11, hoursSaved: 5, accuracy: 90, last: "1 h ago", skills: ["Tally", "POD scans", "WhatsApp"], schedule: "Daily 10 AM and 5 PM", log: ["Kaveri promised cheque on 25 Oct", "Coastal Shipping 112 days, escalated", "Matched 6 PODs to bills"] },
  { name: "Load Finder", role: "Finds return loads from brokers and load boards", icon: Route, status: "Running", runsToday: 23, hoursSaved: 6, accuracy: 84, last: "12 min ago", skills: ["Broker groups", "Rate history", "Lanes"], schedule: "When a truck is 6 h from unloading", log: ["Kolkata → Coimbatore jute, ₹96k offered", "Rejected Bhiwandi return at ₹38k (below cost)", "Shortlisted 2 loads for Hyderabad truck"] },
  { name: "Tyre Watch", role: "Tracks every tyre by serial, km and tread", icon: Disc3, status: "Idle", runsToday: 2, hoursSaved: 2, accuracy: 93, last: "3 h ago", skills: ["Tread depth", "Retread cycles", "Claims"], schedule: "After every yard round", log: ["9 tyres under 4 mm, rotation list ready", "MRF warranty claim drafted for burst casing", "Retread batch of 4 to Kongu Retreads"] },
];

const independence: IndependenceData = {
  score: 37,
  history: [22, 25, 27, 29, 31, 34, 37],
  quote: "Every driver has my number. If a truck stops at 2 AM, my phone rings, not the supervisor's.",
  pillars: [
    { name: "Loads & parties", score: 34, note: "Big parties like Annai and Thiru Cements only negotiate with Senthil.", fixes: [{ title: "Rate card per lane, shared", gain: 3 }, { title: "Balamurugan owns 3 parties", gain: 2 }] },
    { name: "Trips & drivers", score: 41, note: "Drivers call the owner for advances and breakdowns.", fixes: [{ title: "Advance limits per lane", gain: 4 }, { title: "Breakdown line to supervisor", gain: 2 }] },
    { name: "Diesel & cost", score: 30, note: "Diesel is 46% of cost and checked only when the owner asks.", fixes: [{ title: "Nightly diesel audit", gain: 3 }] },
    { name: "Documents", score: 28, note: "4 permits lapsed because renewal sat on the owner's table.", fixes: [{ title: "Auto-renew under ₹20k", gain: 4 }, { title: "Expiry board for Yamuna", gain: 2 }] },
    { name: "Money & dues", score: 39, note: "₹39.4 L outstanding; Kavitha chases, parties wait for Senthil's call.", fixes: [{ title: "POD-to-bill same day", gain: 3 }] },
    { name: "Workshop & tyres", score: 45, note: "Ilango runs the bay well but every part over ₹5k needs a call.", fixes: [{ title: "Parts approval up to ₹25k", gain: 2 }] },
    { name: "Owner time", score: 42, note: "Owner spends 13 hours a week on calls from drivers.", fixes: [{ title: "Driver app instead of calls", gain: 3 }] },
  ],
  ownerHours: [
    { label: "Driver calls", hours: 13 },
    { label: "Party rates", hours: 9 },
    { label: "Advances", hours: 6 },
    { label: "RTO + docs", hours: 4 },
    { label: "Dues", hours: 5 },
    { label: "Workshop", hours: 3 },
    { label: "Strategy", hours: 1 },
  ],
};

const integrations: Integration[] = [
  { name: "Tally Prime", category: "Accounts", status: "Connected", detail: "Freight bills, advances, TDS 194C and party ledgers.", synced: "4 min ago", records: "18,420 vouchers", mark: "T", color: "#1c4f9c" },
  { name: "AIS-140 GPS", category: "Tracking", status: "Connected", detail: "Live location, speed and ignition from 58 of 60 trucks.", synced: "live", records: "60 devices", mark: "GPS", color: "#3f9f6b" },
  { name: "Fuel tank sensors", category: "Diesel", status: "Syncing", detail: "Capacitive sensors on 41 trucks, level every 2 min.", synced: "live", records: "41 tanks", mark: "FS", color: "#d08a1f" },
  { name: "IOCL XTRAPOWER", category: "Diesel", status: "Connected", detail: "Fuel card transactions with pump and litres.", synced: "18 min ago", records: "34 cards", mark: "IO", color: "#f37021" },
  { name: "FASTag (ICICI)", category: "Tolls", status: "Connected", detail: "Toll crossings confirm route and timing.", synced: "9 min ago", records: "2,140 crossings", mark: "FT", color: "#b02a30" },
  { name: "Vahan / Parivahan", category: "Compliance", status: "Connected", detail: "Insurance, FC, permit and tax validity per truck.", synced: "7:00 AM", records: "300 documents", mark: "V", color: "#2d5fa8" },
  { name: "E-way bill (NIC)", category: "Compliance", status: "Connected", detail: "Part-B updates and validity extension.", synced: "22 min ago", records: "37 active", mark: "EW", color: "#5b6c8f" },
  { name: "WhatsApp Business", category: "Messaging", status: "Connected", detail: "Driver groups, party ETAs, POD photos and reminders.", synced: "just now", records: "3,880 chats", mark: "W", color: "#1f9d55" },
  { name: "eChallan", category: "Compliance", status: "Error", detail: "Captcha changed; 5 pending challans not refreshed.", synced: "2 days ago", records: "—", mark: "EC", color: "#c0473a" },
  { name: "BPCL SmartFleet", category: "Diesel", status: "Available", detail: "Bring the 18 BPCL cards into the diesel audit.", synced: "—", records: "—", mark: "BP", color: "#0a5aa8" },
];

/* ============================================================
   Config
   ============================================================ */

const config: DeskConfig = {
  slug: "fleet",
  company: "Palar Roadlines",
  brand: "Palar",
  city: "Namakkal",
  state: "TN",
  icon: Truck,
  tagline: "60 trucks · trailers, Taurus multi-axles and tippers · 74 drivers",
  owner: { name: "R. Senthilkumar", first: "Senthil", initials: "RS", role: "Owner" },
  theme: {
    variant: "control",
    paper: "#0b1310",
    panel: "#121d19",
    sunk: "#0e1714",
    ink: "#e6efe1",
    mute: "#8aa094",
    line: "#22322c",
    accent: "#b7d37a",
    accentInk: "#142010",
    soft: "#1c2a1d",
    ok: "#6fcf8e",
    warn: "#e9b850",
    late: "#f06b5c",
    info: "#6bb7d8",
    heading: "mono",
  },
  pulse: [
    { label: "Trucks rolling", value: "32 / 60", delta: "+3", trend: [26, 28, 27, 29, 30, 29, 32], module: "matrix" },
    { label: "Freight this month", value: "₹1.42 Cr", delta: "+9%", trend: [0.3, 0.5, 0.7, 0.9, 1.1, 1.3, 1.42], tone: "ok", module: "trips" },
    { label: "Fleet km/l", value: fleetKmplSeed.toFixed(2), delta: "-0.08", good: false, trend: [3.42, 3.4, 3.38, 3.36, 3.35, 3.33, 3.31], tone: "warn", module: "diesel" },
    { label: "Docs due 15d", value: String(seedTrucks.reduce((a, t) => a + DOCS.filter((d) => t.docs[d] <= 15).length, 0)), delta: "+4", good: false, trend: [5, 6, 6, 8, 9, 10, 11], tone: "late", module: "permits" },
    { label: "Freight dues", value: "₹39.4 L", delta: "-6%", good: true, trend: [46, 45, 44, 43, 41, 40, 39.4], tone: "info", module: "dues" },
  ],
  agenda: [
    { at: 8.5, title: "Yard round", detail: "9 idle, 7 in workshop", count: 16, tone: "info", module: "matrix" },
    { at: 10, title: "Diesel audit", detail: "2 theft alerts overnight", count: 5, tone: "late", module: "diesel" },
    { at: 11.25, title: "RTO: FC inspection", detail: "2 trucks, Yamuna at Namakkal RTO", count: 2, tone: "warn", module: "permits" },
    { at: 12.5, title: "Annai Guwahati rate", detail: "They want ₹1.58 L, we quote ₹1.68 L", tone: "accent", module: "trips" },
    { at: 15, title: "Workshop review", detail: "Gearbox job waiting parts", count: 9, tone: "neutral", module: "tyres" },
    { at: 17, title: "Dues call list", detail: "11 parties, 3 over 80 days", count: 11, tone: "late", module: "dues" },
  ],
  activity: [
    { time: "11:42 AM", text: "Trip Tracker: Kolkata truck crossed Bhubaneswar, ETA 9 PM", tone: "ok" },
    { time: "11:05 AM", text: "Kaveri Feeds promised a ₹4.2 L cheque on 25 Oct", tone: "info" },
    { time: "10:30 AM", text: "Diesel Auditor flagged 42 L short at Kurnool pump", tone: "late" },
    { time: "9:50 AM", text: "Load Finder: Kolkata → Coimbatore jute offered at ₹96k", tone: "accent" },
    { time: "9:12 AM", text: "Tyre Watch: 9 tyres under 4 mm, rotation list ready", tone: "warn" },
    { time: "7:00 AM", text: "Vahan sync: 4 national permits expired, trucks held at yard", tone: "late" },
  ],
  asks: [
    { q: "Which trucks are earning nothing today?", a: "20 of 60 trucks are not on a trip.\n\n• 9 idle at Namakkal yard, 5 of them trailers that fit Kaveri Feeds' Hyderabad load (₹72k) today.\n• 7 in workshop: 2 waiting on Leyland gearbox parts, 1 ready to go out.\n• 4 parked with expired national permits. ₹66,000 in fees gets all four back on the road.\n\nEvery idle trailer costs about ₹6,800 a day in EMI, driver and insurance.", sources: ["Fleet matrix", "Vahan", "Workshop board"] },
    { q: "Where is diesel leaking?", a: "Three places this week, about 260 L (₹23,900).\n\n• 62 L dropped near Krishnagiri at 2:14 AM with the ignition off.\n• Kurnool pump billed 210 L but the sensor saw 168 L.\n• Two fills 90 km apart on a Salem trailer.\n\nFleet km/l slipped from 3.42 to 3.31 in seven weeks. The bottom 6 trucks account for 58% of the gap.", sources: ["Tank sensors", "IOCL card", "GPS"] },
    { q: "What expires in the next 15 days?", a: "11 documents across 9 trucks:\n• 4 national permits already expired (trucks parked)\n• 5 insurance policies, 3 of them within 7 days\n• 2 FCs, inspection booked today 11:15\n\nIf you approve renewals under ₹20k automatically, Yamuna can file 8 of these today without coming to you.", sources: ["Vahan", "Insurance register"] },
    { q: "Who owes us the most?", a: "₹39.4 L across 11 parties.\n\n• Annai Egg Traders ₹8.8 L, 52 days, 2 PODs not yet billed\n• Thiru Cements ₹7.3 L, 74 days, 3 PODs pending from Kochi\n• Bhavani Steel ₹6.1 L, RTGS promised Friday\n\nCoastal Shipping (₹92k, 112 days) and Deccan Agro (₹2.1 L, 96 days) need your call.", sources: ["Tally", "POD register"] },
    { q: "Is the Guwahati egg load worth it at ₹1.58 L?", a: "Barely. Round trip is about 5,400 km and 11 days.\n\n• Diesel at 3.9 km/l: ₹1.24 L\n• Tolls ₹38k, driver bhatta ₹16k, permits + misc ₹9k\n• Cost ₹1.87 L before EMI\n\nAt ₹1.58 L you need a return load of at least ₹45k. Load Finder has two Guwahati → Chennai offers at ₹62k–₹70k, so ₹1.62 L with a confirmed return is fine. Quote ₹1.68 L and settle at ₹1.62 L.", sources: ["Trip history", "Load Finder", "Diesel rates"] },
    { q: "Draft a message to Thiru Cements on dues", a: "Draft (not sent):\n\n“Vanakkam sir, Palar Roadlines here. 11 bills for ₹7.26 L are open, the oldest 74 days. Three Kochi PODs reached your Ariyalur office on 14 Oct by courier (DTDC 77812). Kindly release at least the 60-day bills this week. Statement attached. Kavitha, Accounts, 98430 11872”", sources: ["Tally ledger", "POD courier log"] },
  ],
  run: {
    label: "Runs every 30 minutes. You can also run it now.",
    title: "Fleet Watch",
    steps: [
      { text: "Read GPS and ignition for 60 trucks", result: "32 rolling, 2 devices offline" },
      { text: "Compare halts with trip sheets", result: "Bhubaneswar halt 9 h, party notified" },
      { text: "Reconcile diesel bills against tank sensors", result: "2 fills short, 1 night drop of 62 L" },
      { text: "Check documents due in 30 days on Vahan", result: "11 due, 4 already expired" },
      { text: "Match idle trucks to loads waiting", result: "5 loads, 4 can be placed today" },
    ],
    outcome: "Placing 4 idle trucks on waiting loads adds ₹1.68 L of freight today. Renewing the 4 permits (₹66k) gets ₹27k a day of capacity back. The Krishnagiri tank drop needs a word with the driver.",
    actions: ["Place 4 idle trucks", "Approve 4 permit renewals", "Deduct 62 L from bhatta", "Send Bhubaneswar halt note to Annai"],
  },
};

/* ============================================================
   Desk
   ============================================================ */

export default function FleetDesk() {
  const [trucks, setTrucks] = React.useState(seedTrucks);
  const update = React.useCallback((id: string, patch: Partial<Truck>) => {
    setTrucks((cur) => cur.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);
  const expiringCount = trucks.reduce((a, t) => a + DOCS.filter((d) => t.docs[d] <= 15).length, 0);

  const modules: DeskModule[] = [
    {
      id: "matrix",
      label: "Fleet matrix",
      title: "Fleet matrix",
      blurb: "All 60 trucks on one wall: where each one is, what it carries and what's stopping it",
      icon: LayoutGrid,
      notes: ["Each tile is a truck, coloured by status. Rolling trucks count kilometres live from GPS.", "Pick a waiting load, then click an idle truck that fits to place it.", "Click any truck for its trip, driver, diesel and documents."],
      render: () => <MatrixHome trucks={trucks} update={update} />,
    },
    { id: "trips", label: "Trips", count: tripSeed.filter((t) => t.status === "POD pending").length, title: "Trip sheets", blurb: "Freight, advances, diesel, tolls and every halt on the way", icon: Route, render: () => <TripsTab /> },
    { id: "diesel", label: "Diesel", count: theftSeed.length, title: "Diesel", blurb: "km per litre for every truck, fuel cards and anything that looks like theft", icon: Fuel, render: () => <DieselTab trucks={trucks} /> },
    { id: "tyres", label: "Tyres & maintenance", count: jobSeed.length, title: "Tyres & maintenance", blurb: "Tread on every position, services due and the workshop board", icon: Wrench, render: () => <TyresTab trucks={trucks} update={update} /> },
    { id: "permits", label: "Permits & compliance", count: expiringCount, title: "Permits & compliance", blurb: "Insurance, FC, permits, tax, PUC and e-way bills, before they lapse", icon: ShieldAlert, render: () => <PermitsTab trucks={trucks} update={update} /> },
    { id: "dues", label: "Freight dues", count: parties.length, title: "Freight dues", blurb: "Who owes freight, how old it is and which PODs are holding it", icon: BadgeIndianRupee, render: () => <DuesTab /> },
    { id: "team", label: "People", title: "People", blurb: "Traffic, workshop, documents and accounts: who is carrying what", icon: Users, render: () => <PeopleModule members={team} /> },
    { id: "agents", label: "Agents", title: "Agents", blurb: "Six AI agents watching trucks, diesel and papers around the clock", icon: Timer, render: () => <AgentsModule agents={agents} /> },
    { id: "independence", label: "Independence", title: "Owner independence", blurb: "How much of Palar runs without Senthil's phone ringing", icon: GaugeIcon, render: () => <IndependenceModule data={independence} /> },
    { id: "connections", label: "Connections", title: "Connections", blurb: "GPS, tank sensors, fuel cards, FASTag, Vahan and Tally", icon: Plug, render: () => <ConnectionsModule items={integrations} /> },
  ];

  return <DeskShell config={config} modules={modules} />;
}

/* ---------------- Shared bits ---------------- */

function Plate({ plate, size = "md" }: { plate: string; size?: "sm" | "md" | "lg" }) {
  const fs = size === "lg" ? 17 : size === "sm" ? 10.5 : 12.5;
  return (
    <span className="inline-flex shrink-0 items-stretch overflow-hidden rounded-[4px] border-[1.5px] border-[#1a1a1a] bg-[#f7cd23] text-[#111] shadow-[0_1px_0_rgba(255,255,255,0.4)_inset]" style={{ fontSize: fs }}>
      <span className="flex flex-col items-center justify-center bg-[#2d58b8] px-[3px] font-sans text-[6.5px] font-bold leading-[7px] text-white" style={{ fontSize: fs * 0.48 }}>
        IND
      </span>
      <span className="whitespace-nowrap px-1.5 py-[1px] font-mono font-bold tracking-[0.04em]">{plate}</span>
    </span>
  );
}

function docTone(days: number): Tone {
  return days < 0 ? "late" : days <= 7 ? "late" : days <= 30 ? "warn" : "ok";
}
function dayLabel(offset: number) {
  const date = new Date(Date.UTC(2026, 9, 20 + offset));
  return `${date.getUTCDate()} ${date.toLocaleString("en-IN", { month: "short", timeZone: "UTC" })}`;
}

/* ---------------- Home: fleet matrix ---------------- */

function MatrixHome({ trucks, update }: { trucks: Truck[]; update: (id: string, patch: Partial<Truck>) => void }) {
  const desk = useDesk();
  const tick = useTicker(100000, 1500);
  const [filter, setFilter] = React.useState<"All" | Status>("All");
  const [kind, setKind] = React.useState<"All" | Kind>("All");
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState<string | null>(null);
  const [picked, setPicked] = React.useState<string | null>(null);
  const [placed, setPlaced] = React.useState<Set<string>>(new Set());
  const load = loadsWaiting.find((l) => l.id === picked) ?? null;
  const truck = trucks.find((t) => t.id === open) ?? null;
  const needle = q.trim().toLowerCase();
  const shown = trucks.filter((t) => (filter === "All" || t.status === filter) && (kind === "All" || t.kind === kind) && (!needle || `${t.plate} ${t.driver} ${t.to} ${t.party}`.toLowerCase().includes(needle)));
  const count = (s: Status) => trucks.filter((t) => t.status === s).length;
  const rolling = trucks.filter((t) => t.status === "On trip");
  const kmLive = rolling.reduce((a, t) => a + t.kmToday + (tick * t.speed) / 220, 0);
  const idleCost = (count("Idle") + count("Permit expired")) * 6800;

  function clickTruck(t: Truck) {
    if (load && t.status === "Idle") {
      if (t.kind !== load.need) {
        toast.error(`${t.plate} is a ${t.kind}`, { description: `${load.party} needs a ${load.need}.` });
        return;
      }
      update(t.id, { status: "Loading", from: load.from, to: load.to, load: load.load, party: load.party, freight: load.freight, note: `Placed for ${load.id}, reporting by ${load.by}` });
      setPlaced((s) => new Set(s).add(load.id));
      setPicked(null);
      toast.success(`${t.plate} placed on ${load.lane}`, { description: `${inr(load.freight)} freight · ${t.driver} told on WhatsApp` });
      desk.log(`${t.plate} placed for ${load.party}, ${load.lane}`, "ok");
      return;
    }
    setOpen(t.id);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Trucks rolling" value={`${count("On trip")} / ${trucks.length}`} delta="+3" hint="vs yesterday 10 AM" icon={Truck} trend={[26, 28, 27, 29, 30, 29, 31, count("On trip")]} />
        <Stat label="km run today, live" value={Math.round(kmLive).toLocaleString("en-IN")} delta="+4%" hint="GPS, all rolling trucks" icon={Navigation} tone="ok" trend={[1200, 2600, 3900, 5200, 6300, 7400, 8100, kmLive]} />
        <Stat label="Idle cost today" value={inr(idleCost, { compact: true })} delta="+2" deltaGood={false} hint={`${count("Idle")} idle, ${count("Permit expired")} permit lapsed`} icon={AlertTriangle} tone="late" trend={[9, 8, 10, 11, 9, 12, 13, count("Idle") + count("Permit expired")]} />
        <Stat label="Freight on the road" value={inr(rolling.reduce((a, t) => a + t.freight, 0), { compact: true })} delta="+11%" hint="booked on trucks rolling now" icon={BadgeIndianRupee} trend={[18, 19, 21, 20, 22, 24, 25, 27]} />
      </div>

      <Panel
        live
        title="Fleet matrix"
        sub={load ? `Placing ${load.id}: click an idle ${load.need} (pulsing)` : "Every truck, live. Click a tile for trip, driver, diesel and documents."}
        action={<SearchBox value={q} onChange={setQ} placeholder="Plate, driver, town" className="w-52" />}
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Segmented size="sm" options={[{ value: "All" as const, label: "All", count: trucks.length }, ...STATUSES.map((s) => ({ value: s, label: s, count: count(s) }))]} value={filter} onChange={setFilter} />
          <Segmented size="sm" className="ml-auto" options={["All", "Trailer 40ft", "Taurus 16W", "Tipper 10W"] as const} value={kind} onChange={setKind} />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6">
          {shown.map((t, i) => {
            const tone = statusTone[t.status];
            const color = toneVar(tone);
            const target = load && t.status === "Idle" && t.kind === load.need;
            const km = t.kmToday + (tick * t.speed) / 220;
            const speed = t.status === "On trip" ? Math.max(0, t.speed + (((tick * 7 + i * 13) % 9) - 4)) : 0;
            const worst = Math.min(...DOCS.map((d) => t.docs[d]));
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => clickTruck(t)}
                className={`desk-rise group relative overflow-hidden rounded-[8px] border bg-d-sunk p-2.5 text-left transition-all hover:-translate-y-0.5 ${target ? "border-d-accent ring-2 ring-d-accent/60" : "border-d-line hover:border-d-accent/50"}`}
                style={{ animationDelay: `${Math.min(i, 30) * 12}ms` }}
              >
                <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: color }} />
                {target && <span className="desk-ping absolute right-2 top-2 h-2 w-2 rounded-full bg-d-accent" />}
                <div className="flex items-center justify-between gap-1">
                  <Plate plate={t.plate} size="sm" />
                  <span className="font-mono text-[9.5px] text-d-mute">{t.kind.split(" ")[1]}</span>
                </div>
                <p className="mt-2 flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-wide" style={{ color: tone === "neutral" ? "var(--d-mute)" : color }}>
                  {t.status === "On trip" ? <span className="desk-ping h-1.5 w-1.5 rounded-full" style={{ background: color }} /> : <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />}
                  {t.status}
                </p>
                <p className="mt-0.5 truncate text-[12px] font-medium">{t.status === "On trip" || t.status === "Loading" ? `${t.from.split(" ")[0]} → ${t.to}` : t.note}</p>
                <div className="mt-1.5 flex items-baseline justify-between gap-2 font-mono text-[10.5px] text-d-mute">
                  {t.status === "On trip" ? (
                    <>
                      <span className="tnum text-d-ink">
                        {km.toFixed(1)}
                        <span className="text-d-mute"> km</span>
                      </span>
                      <span className="tnum">{speed} km/h</span>
                    </>
                  ) : (
                    <>
                      <span className="truncate">{t.driver}</span>
                      {worst < 0 ? <span className="text-d-late">doc lapsed</span> : worst <= 15 ? <span className="text-d-warn">doc {worst}d</span> : <span>{t.tank}% tank</span>}
                    </>
                  )}
                </div>
                {t.status === "On trip" && (
                  <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-d-line">
                    <div className="h-full rounded-full bg-d-accent transition-[width] duration-1000" style={{ width: `${Math.min(96, (km / (km + t.eta * 45)) * 100)}%` }} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {shown.length === 0 && <p className="py-10 text-center text-[13px] text-d-mute">No truck matches.</p>}
        <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-[11px] text-d-mute">
          {STATUSES.map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: toneVar(statusTone[s]) }} /> {s}
            </span>
          ))}
          <span className="ml-auto">GPS refresh every 10 s · 2 devices offline</span>
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
        <Panel icon={MapPin} title="Lanes running now" sub="Trucks on each lane out of the Namakkal hub" action={<Pill tone="accent" mono>{rolling.length} rolling</Pill>}>
          <LaneMap trucks={trucks} />
        </Panel>
        <Panel icon={Route} title="Loads waiting" sub="From parties, brokers and the load board. Pick one, then click an idle truck." action={picked ? <Btn size="sm" variant="ghost" onClick={() => setPicked(null)}>Cancel</Btn> : null}>
          <ul className="space-y-2">
            {loadsWaiting.map((l) => {
              const done = placed.has(l.id);
              const fits = trucks.filter((t) => t.status === "Idle" && t.kind === l.need).length;
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    disabled={done}
                    onClick={() => setPicked(picked === l.id ? null : l.id)}
                    className={`flex w-full items-center gap-3 rounded-[8px] border px-3 py-2.5 text-left transition-colors disabled:opacity-50 ${picked === l.id ? "border-d-accent bg-d-soft" : "border-d-line hover:bg-d-sunk"}`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-[13px] font-semibold">
                        <span className="truncate">{l.lane}</span>
                        <span className="font-mono text-[10.5px] font-normal text-d-mute">{l.id}</span>
                      </p>
                      <p className="truncate text-[11.5px] text-d-mute">
                        {l.party} · {l.load} · {l.need} · by {l.by}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="tnum font-mono text-[13px] font-semibold">{inr(l.freight, { compact: true })}</p>
                      {done ? <Pill tone="ok">Placed</Pill> : <span className="font-mono text-[10.5px] text-d-mute">{fits} idle fit</span>}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
        <Panel title="Fleet by status" sub="Click a slice in the matrix filter to drill in">
          <Donut center={trucks.length} sub="trucks" segments={STATUSES.map((s) => ({ label: s, value: count(s), tone: statusTone[s] }))} />
        </Panel>
        <Panel icon={AlertTriangle} title="Needs Senthil today" sub="Raised by the agents overnight">
          <ul className="divide-y divide-d-line">
            {[
              { t: "4 national permits expired, trucks parked", s: "₹66,000 renewal · Doc Renewer", tone: "late" as const, go: "permits" },
              { t: "62 L tank drop near Krishnagiri, ignition off", s: `${theftSeed[0].plate} · Diesel Auditor`, tone: "late" as const, go: "diesel" },
              { t: "Bhubaneswar halt crossing 9 hours", s: "Annai eggs, unloading slot not given", tone: "warn" as const, go: "trips" },
              { t: "Coastal Shipping ₹92k at 112 days", s: "Needs an owner call", tone: "warn" as const, go: "dues" },
              { t: "Gearbox kit delayed at Leyland ASC", s: "2 trucks off road since Friday", tone: "info" as const, go: "tyres" },
            ].map((x) => (
              <li key={x.t} className="flex items-center gap-3 py-2.5">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: toneVar(x.tone) }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">{x.t}</p>
                  <p className="truncate text-[11.5px] text-d-mute">{x.s}</p>
                </div>
                <Btn size="sm" variant="soft" onClick={() => desk.goTab(x.go)}>
                  Open
                </Btn>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <TruckSheet truck={truck} onClose={() => setOpen(null)} update={update} />
    </div>
  );
}

const NODES: Record<string, [number, number]> = {
  Namakkal: [300, 250],
  Chennai: [470, 160],
  Bengaluru: [250, 140],
  Hyderabad: [300, 30],
  Kochi: [130, 330],
  Madurai: [300, 345],
  Tuticorin: [330, 395],
  Coimbatore: [175, 280],
  Bhiwandi: [70, 30],
  Kolkata: [560, 20],
  Visakhapatnam: [520, 60],
  Karur: [260, 290],
};
function nodeFor(place: string): string {
  const p = place.toLowerCase();
  if (p.includes("bhiwandi")) return "Bhiwandi";
  if (p.includes("kolkata") || p.includes("guwahati")) return "Kolkata";
  if (p.includes("visakha")) return "Visakhapatnam";
  if (p.includes("hyderabad") || p.includes("davangere")) return "Hyderabad";
  if (p.includes("chennai") || p.includes("hosur")) return "Chennai";
  if (p.includes("bengaluru") || p.includes("tiruppur")) return "Bengaluru";
  if (p.includes("kochi")) return "Kochi";
  if (p.includes("madurai")) return "Madurai";
  if (p.includes("tuticorin")) return "Tuticorin";
  if (p.includes("karur") || p.includes("erode")) return "Karur";
  return "Coimbatore";
}

function LaneMap({ trucks }: { trucks: Truck[] }) {
  const lanes = new Map<string, number>();
  trucks
    .filter((t) => t.status === "On trip")
    .forEach((t) => {
      const key = t.to.toLowerCase().includes("namakkal") ? nodeFor(t.from) : nodeFor(t.to);
      lanes.set(key, (lanes.get(key) ?? 0) + 1);
    });
  const hub = NODES.Namakkal;
  return (
    <div className="relative">
      <svg viewBox="0 0 620 420" className="h-auto w-full">
        <defs>
          <radialGradient id="fleet-hub" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--d-accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--d-accent)" stopOpacity="0" />
          </radialGradient>
        </defs>
        {Array.from({ length: 11 }, (_, i) => (
          <line key={`gx${i}`} x1={i * 62} x2={i * 62} y1="0" y2="420" stroke="var(--d-line)" strokeOpacity="0.5" />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`gy${i}`} x1="0" x2="620" y1={i * 60} y2={i * 60} stroke="var(--d-line)" strokeOpacity="0.5" />
        ))}
        {[...lanes.entries()].map(([name, n], i) => {
          const [x, y] = NODES[name];
          const mx = (hub[0] + x) / 2 + (i % 2 ? 30 : -30);
          const my = (hub[1] + y) / 2 - 20;
          const d = `M${hub[0]},${hub[1]} Q${mx},${my} ${x},${y}`;
          return (
            <g key={name}>
              <path d={d} fill="none" stroke="var(--d-accent)" strokeOpacity="0.18" strokeWidth={2 + n * 1.6} strokeLinecap="round" />
              <path d={d} fill="none" stroke="var(--d-accent)" strokeWidth="1.6" className="desk-flow" />
              {Array.from({ length: Math.min(n, 4) }, (_, k) => (
                <circle key={k} r="4" fill="var(--d-accent)" stroke="var(--d-paper)" strokeWidth="1.5">
                  <animateMotion dur={`${7 + i + k * 1.3}s`} repeatCount="indefinite" path={d} begin={`${k * -2.1}s`} />
                </circle>
              ))}
            </g>
          );
        })}
        {Object.entries(NODES).map(([name, [x, y]]) => {
          const n = lanes.get(name) ?? 0;
          const isHub = name === "Namakkal";
          return (
            <g key={name}>
              {isHub && <circle cx={x} cy={y} r="46" fill="url(#fleet-hub)" />}
              <circle cx={x} cy={y} r={isHub ? 9 : n ? 5.5 : 3.5} fill={isHub ? "var(--d-accent)" : n ? "var(--d-ink)" : "var(--d-mute)"} stroke="var(--d-paper)" strokeWidth="2" />
              <text x={x + 10} y={y + 4} fontSize="12" fontFamily="var(--font-mono, monospace)" fill={isHub ? "var(--d-accent)" : n ? "var(--d-ink)" : "var(--d-mute)"} fontWeight={isHub ? 700 : 500}>
                {name}
                {n ? ` · ${n}` : ""}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-1 font-mono text-[11px] text-d-mute">Schematic, not to scale. Dot size = trucks on the lane; dots move with GPS heading.</p>
    </div>
  );
}

function TruckSheet({ truck, onClose, update }: { truck: Truck | null; onClose: () => void; update: (id: string, patch: Partial<Truck>) => void }) {
  const desk = useDesk();
  const t = truck;
  const std = t ? STD_KMPL[t.kind] : 1;
  return (
    <Sheet
      open={!!t}
      onOpenChange={(o) => !o && onClose()}
      width={520}
      eyebrow={t ? `${t.id} · ${t.kind} · odo ${t.odo.toLocaleString("en-IN")} km` : ""}
      title={t ? <Plate plate={t.plate} size="lg" /> : ""}
      sub={t ? `${t.status} · ${t.status === "On trip" || t.status === "Loading" ? `${t.from} → ${t.to}` : t.note}` : ""}
      footer={
        t && (
          <>
            <Btn
              icon={Phone}
              onClick={() => {
                toast(`Calling ${t.driver}`, { description: `+91 ${t.phone} via the office line` });
                desk.log(`Called ${t.driver} on ${t.plate}`);
              }}
            >
              Call driver
            </Btn>
            {t.status !== "Workshop" ? (
              <Btn
                icon={Wrench}
                onClick={() => {
                  update(t.id, { status: "Workshop", note: "Sent to bay for inspection", to: "Namakkal yard", load: "Empty" });
                  toast.success(`${t.plate} sent to workshop`, { description: "Ilango notified" });
                  desk.log(`${t.plate} sent to workshop`, "warn");
                }}
              >
                To workshop
              </Btn>
            ) : (
              <Btn
                icon={Truck}
                onClick={() => {
                  update(t.id, { status: "Idle", note: "Released from workshop" });
                  toast.success(`${t.plate} released`, { description: "Back in the idle pool" });
                  desk.log(`${t.plate} released from workshop`, "ok");
                }}
              >
                Release
              </Btn>
            )}
            <Btn variant="solid" onClick={onClose}>
              Done
            </Btn>
          </>
        )
      }
    >
      {t && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-[10px] border border-d-line p-3">
            <Avatar name={t.driver} size={42} />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold">{t.driver}</p>
              <p className="font-mono text-[11.5px] text-d-mute">+91 {t.phone} · DL valid · 9 yrs with Palar</p>
            </div>
            <Pill tone={statusTone[t.status]}>{t.status}</Pill>
          </div>
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-d-mute">Trip</p>
            <KV
              items={[
                { k: "Party", v: t.party },
                { k: "Load", v: t.load },
                { k: "Freight", v: inr(t.freight) },
                { k: "Advance given", v: inr(t.advance) },
                { k: "km today", v: `${t.kmToday} km` },
                { k: "ETA", v: t.status === "On trip" ? <Countdown compact inHours={t.eta} /> : "—" },
              ]}
            />
          </div>
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-d-mute">Diesel</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[10px] bg-d-sunk p-3">
                <p className="text-[11.5px] text-d-mute">Tank</p>
                <p className="tnum font-mono text-[20px] font-semibold">{t.tank}%</p>
                <Meter value={t.tank} tone={t.tank < 25 ? "late" : "accent"} className="mt-1.5" />
              </div>
              <div className="rounded-[10px] bg-d-sunk p-3">
                <p className="text-[11.5px] text-d-mute">km/l, 30 days</p>
                <p className="tnum font-mono text-[20px] font-semibold" style={{ color: t.kmpl < std * 0.92 ? "var(--d-late)" : undefined }}>
                  {t.kmpl.toFixed(2)}
                </p>
                <p className="font-mono text-[11px] text-d-mute">standard {std.toFixed(1)}</p>
              </div>
            </div>
          </div>
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-d-mute">Documents</p>
            <ul className="space-y-1.5">
              {DOCS.map((d) => {
                const days = t.docs[d];
                return (
                  <li key={d} className="flex items-center gap-3 rounded-[8px] border border-d-line px-3 py-2">
                    <FileCheck2 className="h-4 w-4 text-d-mute" />
                    <span className="flex-1 text-[13px] font-medium">{d}</span>
                    <span className="font-mono text-[11.5px] text-d-mute">{dayLabel(days)}</span>
                    <Pill tone={docTone(days)} mono>
                      {days < 0 ? `lapsed ${-days}d` : `${days}d`}
                    </Pill>
                    {days <= 30 && (
                      <button
                        type="button"
                        className="font-mono text-[11px] text-d-accent hover:underline"
                        onClick={() => {
                          const docs = { ...t.docs, [d]: d === "PUC" ? 180 : 365 };
                          update(t.id, { docs, ...(d === "National permit" && t.status === "Permit expired" ? { status: "Idle" as Status, note: "Permit renewed, ready for load" } : {}) });
                          toast.success(`${d} renewal filed`, { description: `${t.plate} · Yamuna will collect the copy` });
                          desk.log(`${d} renewed for ${t.plate}`, "ok");
                        }}
                      >
                        renew
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </Sheet>
  );
}

/* ---------------- Trips ---------------- */

const tripTone: Record<Trip["status"], Tone> = { Running: "accent", Unloading: "info", "POD pending": "warn", Settled: "ok" };

function TripsTab() {
  const desk = useDesk();
  const [trips, setTrips] = React.useState(tripSeed);
  const [open, setOpen] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);
  const trip = trips.find((t) => t.no === open) ?? null;
  const freight = trips.reduce((a, t) => a + t.freight, 0);
  const adv = trips.filter((t) => t.status !== "Settled").reduce((a, t) => a + t.advance + t.dieselAdv, 0);
  const halts = trips.flatMap((t) => t.halts);
  const reasons = Object.entries(halts.reduce<Record<string, number>>((acc, h) => ((acc[h.reason] = (acc[h.reason] ?? 0) + h.hrs), acc), {})).sort((a, b) => b[1] - a[1]);
  const margin = (t: Trip) => t.freight - t.dieselAdv - t.toll - Math.round(t.km * 2.6);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Trips this month" value="118" delta="+9" hint="14 open below" icon={Route} trend={[62, 71, 80, 88, 97, 106, 118]} />
        <Stat label="Freight on these sheets" value={inr(freight, { compact: true })} delta="+12%" icon={BadgeIndianRupee} tone="ok" trend={[4, 5, 6.2, 7.1, 8, 9.1, 9.8]} />
        <Stat label="Advances outstanding" value={inr(adv, { compact: true })} hint="driver + diesel, unsettled trips" icon={Fuel} tone="warn" />
        <Stat label="Avg halt per trip" value={`${(halts.reduce((a, h) => a + h.hrs, 0) / trips.length).toFixed(1)} h`} delta="+0.8 h" deltaGood={false} hint="checkposts and unload queues" icon={Timer} tone="late" />
      </div>
      <Panel
        title="Trip sheets"
        sub="Click a trip for halts, cost and settlement"
        action={
          <Btn size="sm" variant="solid" icon={Plus} onClick={() => setAdding(true)}>
            New trip sheet
          </Btn>
        }
      >
        <DataTable
          rows={trips}
          rowKey={(t) => t.no}
          search={(t) => `${t.no} ${t.plate} ${t.driver} ${t.party} ${t.lane}`}
          searchPlaceholder="Trip, plate, driver, party"
          filter={{ get: (t) => t.status, options: ["Running", "Unloading", "POD pending", "Settled"] }}
          onRow={(t) => setOpen(t.no)}
          bulk={[
            {
              label: "Chase PODs on WhatsApp",
              run: (k) => {
                toast.success(`POD reminder sent for ${k.length} trips`, { description: "Drivers asked to photo the signed LR" });
                desk.log(`POD reminders for ${k.length} trips`);
              },
            },
          ]}
          columns={[
            { key: "no", label: "Trip", render: (t) => <span className="font-mono text-[12px]">{t.no}</span>, sort: (t) => t.no },
            { key: "plate", label: "Truck", render: (t) => <Plate plate={t.plate} size="sm" /> },
            { key: "lane", label: "Lane", render: (t) => <span className="font-medium">{t.lane}</span>, sort: (t) => t.lane },
            { key: "party", label: "Party", render: (t) => <span className="text-d-mute">{t.party}</span>, wide: true },
            { key: "fr", label: "Freight", align: "right", render: (t) => <span className="tnum font-mono">{inr(t.freight, { compact: true })}</span>, sort: (t) => t.freight },
            { key: "adv", label: "Advances", align: "right", render: (t) => <span className="tnum font-mono text-d-mute">{inr(t.advance + t.dieselAdv, { compact: true })}</span>, sort: (t) => t.advance + t.dieselAdv, wide: true },
            { key: "halt", label: "Halts", align: "right", render: (t) => <span className="tnum font-mono" style={{ color: t.halts.reduce((a, h) => a + h.hrs, 0) > 8 ? "var(--d-late)" : undefined }}>{t.halts.reduce((a, h) => a + h.hrs, 0)} h</span>, sort: (t) => t.halts.reduce((a, h) => a + h.hrs, 0) },
            { key: "st", label: "Status", render: (t) => <Pill tone={tripTone[t.status]}>{t.status}</Pill> },
          ]}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Freight by lane" sub="On open and recent trip sheets">
          <HBars
            format={(v) => inr(v, { compact: true })}
            data={Object.entries(trips.reduce<Record<string, number>>((acc, t) => ((acc[t.lane] = (acc[t.lane] ?? 0) + t.freight), acc), {}))
              .sort((a, b) => b[1] - a[1])
              .slice(0, 7)
              .map(([label, value]) => ({ label, value }))}
          />
        </Panel>
        <Panel title="Where the hours go" sub="Halt hours by reason, these trips">
          <Donut center={`${halts.reduce((a, h) => a + h.hrs, 0)}h`} sub="halted" segments={reasons.map(([label, value], i) => ({ label, value, tone: (["late", "warn", "info", "accent", "ok", "neutral"] as const)[i % 6] }))} />
        </Panel>
      </div>

      <Sheet
        open={!!trip}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={trip ? `${trip.no} · started ${trip.started}` : ""}
        title={trip?.lane ?? ""}
        sub={trip ? `${trip.party} · ${trip.load} · ${trip.driver}` : ""}
        footer={
          trip && (
            <>
              {trip.status !== "Settled" && trip.status !== "Running" && (
                <Btn
                  variant="solid"
                  icon={FileCheck2}
                  onClick={() => {
                    setTrips((cur) => cur.map((x) => (x.no === trip.no ? { ...x, status: x.status === "POD pending" ? "Settled" : "POD pending" } : x)));
                    toast.success(trip.status === "POD pending" ? "Trip settled, bill raised in Tally" : "Unloaded, waiting for POD", { description: trip.no });
                    desk.log(`${trip.no} ${trip.status === "POD pending" ? "settled and billed" : "unloaded"}`, "ok");
                  }}
                >
                  {trip.status === "POD pending" ? "POD received, settle" : "Mark unloaded"}
                </Btn>
              )}
              <Btn onClick={() => setOpen(null)}>Close</Btn>
            </>
          )
        }
      >
        {trip && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <Plate plate={trip.plate} size="lg" />
              <Pill tone={tripTone[trip.status]}>{trip.status}</Pill>
            </div>
            <KV
              items={[
                { k: "Freight", v: inr(trip.freight) },
                { k: "Driver advance", v: inr(trip.advance) },
                { k: "Diesel advance", v: inr(trip.dieselAdv) },
                { k: "Tolls (FASTag)", v: inr(trip.toll) },
                { k: "Distance", v: `${trip.km.toLocaleString("en-IN")} km` },
                { k: "Trip margin (est.)", v: <span style={{ color: margin(trip) > 0 ? "var(--d-ok)" : "var(--d-late)" }}>{inr(margin(trip))}</span> },
              ]}
            />
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-d-mute">Halts on the way</p>
              {trip.halts.length === 0 ? (
                <p className="rounded-[8px] border border-dashed border-d-line py-4 text-center text-[12.5px] text-d-mute">No halts over an hour</p>
              ) : (
                <ul className="space-y-1.5">
                  {trip.halts.map((h) => (
                    <li key={h.place} className="flex items-center gap-3 rounded-[8px] border border-d-line px-3 py-2">
                      <CircleDot className="h-4 w-4" style={{ color: h.hrs > 6 ? "var(--d-late)" : "var(--d-mute)" }} />
                      <span className="flex-1 text-[13px]">
                        <b>{h.place}</b> <span className="text-d-mute">· {h.reason}</span>
                      </span>
                      <span className="tnum font-mono text-[12px]">{h.hrs} h</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-d-mute">Cost split</p>
              <Bars
                height={110}
                format={(v) => inr(v, { compact: true })}
                data={[
                  { label: "Diesel", value: trip.dieselAdv, tone: "warn" },
                  { label: "Tolls", value: trip.toll, tone: "info" },
                  { label: "Bhatta", value: Math.round(trip.km * 2.6), tone: "neutral" },
                  { label: "Margin", value: Math.max(0, margin(trip)), tone: "ok" },
                ]}
              />
            </div>
          </div>
        )}
      </Sheet>
      <NewTrip
        open={adding}
        onOpenChange={setAdding}
        onAdd={(t) => {
          setTrips((cur) => [t, ...cur]);
          toast.success("Trip sheet opened", { description: `${t.no} · ${t.lane} · advance ${inr(t.advance)}` });
          desk.log(`Trip ${t.no} opened on ${t.lane}`, "info");
        }}
      />
    </div>
  );
}

function NewTrip({ open, onOpenChange, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (t: Trip) => void }) {
  const idle = seedTrucks.filter((t) => t.status === "Idle");
  const [plate, setPlate] = React.useState(idle[0]?.plate ?? "");
  const [lane, setLane] = React.useState("Namakkal → Hyderabad");
  const [party, setParty] = React.useState("Kaveri Feeds");
  const [freight, setFreight] = React.useState("72000");
  const [advance, setAdvance] = React.useState("15000");
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="New trip sheet" sub="LR number and e-way bill Part-B are generated when the truck leaves the gate.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const f = Number(freight) || 0;
          onAdd({ no: `PR/2410-${130 + (plate.length % 9)}`, plate, driver: seedTrucks.find((t) => t.plate === plate)?.driver ?? "—", party, lane, load: "As per LR", started: "20 Oct", km: 0, freight: f, advance: Number(advance) || 0, dieselAdv: Math.round(f * 0.35), toll: 0, halts: [], status: "Running" });
          onOpenChange(false);
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Truck (idle)">
            <select className={inputClass} value={plate} onChange={(e) => setPlate(e.target.value)}>
              {idle.map((t) => (
                <option key={t.id} value={t.plate}>
                  {t.plate} · {t.kind}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Party">
            <select className={inputClass} value={party} onChange={(e) => setParty(e.target.value)}>
              {parties.map((p) => (
                <option key={p.name}>{p.name}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Lane">
          <input className={inputClass} value={lane} onChange={(e) => setLane(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Freight (₹)">
            <input className={inputClass} inputMode="numeric" value={freight} onChange={(e) => setFreight(e.target.value.replace(/\D/g, ""))} />
          </Field>
          <Field label="Driver advance (₹)">
            <input className={inputClass} inputMode="numeric" value={advance} onChange={(e) => setAdvance(e.target.value.replace(/\D/g, ""))} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Btn onClick={() => onOpenChange(false)}>Cancel</Btn>
          <Btn variant="solid" type="submit" icon={Plus}>
            Open trip
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Diesel ---------------- */

function DieselTab({ trucks }: { trucks: Truck[] }) {
  const desk = useDesk();
  const [alerts, setAlerts] = React.useState<Record<string, string>>({});
  const [cards, setCards] = React.useState(fuelCards);
  const [topup, setTopup] = React.useState<string | null>(null);
  const [amount, setAmount] = React.useState("200000");
  const [open, setOpen] = React.useState<string | null>(null);
  const rows = trucks.map((t) => {
    const km = kmFor(t);
    return { ...t, km, litres: Math.round(km / t.kmpl), gap: t.kmpl / STD_KMPL[t.kind] };
  });
  const totalL = rows.reduce((a, r) => a + r.litres, 0);
  const fleetKmpl = rows.reduce((a, r) => a + r.km, 0) / totalL;
  const truck = rows.find((r) => r.id === open) ?? null;
  const worst = [...rows].sort((a, b) => a.gap - b.gap).slice(0, 8);
  const days = ["7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"];

  function decide(a: Alert, v: string) {
    setAlerts((s) => ({ ...s, [a.id]: v }));
    toast.success(`${a.plate}: ${v}`, { description: `${a.litres} L · ${a.where}` });
    desk.log(`Diesel alert ${a.plate} → ${v}`, v.startsWith("Deduct") ? "late" : "info");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Fleet km/l, 30 days" value={fleetKmpl.toFixed(2)} delta="-0.08" deltaGood={false} hint="target 3.45" icon={GaugeIcon} tone="warn" trend={[3.42, 3.41, 3.38, 3.37, 3.35, 3.33, fleetKmpl]} />
        <Stat label="Diesel this month" value={inr(totalL * 92.4, { compact: true })} hint={`${totalL.toLocaleString("en-IN")} L at ₹92.4`} icon={Fuel} trend={[8, 16, 25, 33, 41, 50, 57]} />
        <Stat label="Suspected loss, week" value={`${theftSeed.reduce((a, x) => a + x.litres, 0)} L`} delta="+120 L" deltaGood={false} hint={inr(theftSeed.reduce((a, x) => a + x.litres, 0) * 92.4)} icon={AlertTriangle} tone="late" />
        <Stat label="Fuel card balance" value={inr(cards.reduce((a, c) => a + c.balance, 0), { compact: true })} hint="IOCL, BPCL, HPCL" icon={BadgeIndianRupee} tone="info" />
      </div>
      <Panel icon={AlertTriangle} title="Theft and leakage alerts" sub="Tank sensors, fuel bills and GPS disagree here. Decide each one; the driver gets the outcome on WhatsApp.">
        <ul className="divide-y divide-d-line">
          {theftSeed.map((a) => {
            const v = alerts[a.id];
            return (
              <li key={a.id} className={`flex flex-wrap items-center gap-3 py-3 ${v ? "opacity-60" : ""}`}>
                <span className="h-9 w-1 shrink-0 rounded-full" style={{ background: toneVar(a.severity) }} />
                <Plate plate={a.plate} size="sm" />
                <div className="min-w-[220px] flex-1">
                  <p className="text-[13.5px] font-medium">{a.what}</p>
                  <p className="text-[12px] text-d-mute">
                    {a.where} · {a.when} · driver {a.driver}
                  </p>
                </div>
                <span className="tnum font-mono text-[14px] font-semibold" style={{ color: toneVar(a.severity) }}>
                  {a.litres} L
                </span>
                {v ? (
                  <Pill tone={v.startsWith("Deduct") ? "late" : "ok"}>{v}</Pill>
                ) : (
                  <span className="flex gap-1.5">
                    <Btn size="sm" variant="ghost" onClick={() => decide(a, "Explained, OK")}>
                      OK
                    </Btn>
                    <Btn size="sm" onClick={() => decide(a, "Asked driver")}>
                      Ask driver
                    </Btn>
                    <Btn size="sm" variant="danger" onClick={() => decide(a, `Deduct ${inr(a.litres * 92.4)} from bhatta`)}>
                      Deduct
                    </Btn>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="km per litre, every truck" sub="Against the standard for its body type. Click for the truck.">
          <DataTable
            rows={rows}
            rowKey={(r) => r.id}
            pageSize={10}
            dense
            search={(r) => `${r.plate} ${r.driver}`}
            searchPlaceholder="Plate or driver"
            filter={{ get: (r) => r.kind, options: ["Trailer 40ft", "Taurus 16W", "Tipper 10W"] }}
            onRow={(r) => setOpen(r.id)}
            columns={[
              { key: "plate", label: "Truck", render: (r) => <Plate plate={r.plate} size="sm" /> },
              { key: "driver", label: "Driver", render: (r) => r.driver, sort: (r) => r.driver, wide: true },
              { key: "km", label: "km, 30d", align: "right", render: (r) => <span className="tnum font-mono">{r.km.toLocaleString("en-IN")}</span>, sort: (r) => r.km },
              { key: "l", label: "Litres", align: "right", render: (r) => <span className="tnum font-mono text-d-mute">{r.litres.toLocaleString("en-IN")}</span>, sort: (r) => r.litres },
              { key: "kmpl", label: "km/l", align: "right", render: (r) => <span className="tnum font-mono font-semibold" style={{ color: r.gap < 0.92 ? "var(--d-late)" : r.gap > 1.02 ? "var(--d-ok)" : undefined }}>{r.kmpl.toFixed(2)}</span>, sort: (r) => r.kmpl },
              { key: "gap", label: "vs std", render: (r) => <div className="flex min-w-[90px] items-center gap-2"><Meter value={Math.min(1.15, r.gap)} max={1.15} tone={r.gap < 0.92 ? "late" : r.gap < 0.98 ? "warn" : "ok"} /><span className="font-mono text-[11px] text-d-mute">{Math.round(r.gap * 100)}%</span></div>, sort: (r) => r.gap },
            ]}
          />
        </Panel>
        <div className="space-y-5">
          <Panel title="Fuel cards" sub="Balances from the oil company portals">
            <ul className="space-y-3">
              {cards.map((c) => (
                <li key={c.name} className="rounded-[8px] border border-d-line p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13.5px] font-semibold">{c.name}</p>
                    <Btn size="sm" variant="soft" onClick={() => setTopup(c.name)}>
                      Top up
                    </Btn>
                  </div>
                  <p className="mt-1 font-mono text-[11.5px] text-d-mute">
                    {inr(c.balance)} of {inr(c.limit, { compact: true })} · {c.cards} cards · {inr(c.spent, { compact: true })} this month
                  </p>
                  <Meter value={c.balance} max={c.limit} tone={c.balance / c.limit < 0.25 ? "late" : "accent"} className="mt-2" />
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Worst 8 against standard" sub="Where the km/l gap is">
            <HBars data={worst.map((r) => ({ label: r.plate, sub: r.driver, value: Math.round((1 - r.gap) * 100), tone: r.gap < 0.9 ? "late" : "warn" }))} format={(v) => `${v}% short`} />
          </Panel>
        </div>
      </div>
      <Panel title="Daily diesel vs km" sub="Litres filled and km run, last 14 days (fleet)">
        <AreaChart
          height={180}
          labels={days.map((d) => `${d} Oct`)}
          series={[
            { name: "km run (÷10)", data: [1180, 1240, 1210, 1290, 1320, 1190, 1060, 1250, 1310, 1280, 1340, 1300, 1170, 1230], tone: "accent" },
            { name: "Litres", data: [3540, 3690, 3620, 3880, 4010, 3610, 3320, 3800, 4060, 3920, 4170, 4080, 3700, 3880], tone: "warn" },
          ]}
        />
      </Panel>

      <Modal open={!!topup} onOpenChange={(o) => !o && setTopup(null)} title={`Top up ${topup ?? ""}`} sub="Paid by NEFT from the HDFC current account; the portal credits in about 20 minutes.">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const a = Number(amount) || 0;
            setCards((cur) => cur.map((c) => (c.name === topup ? { ...c, balance: c.balance + a } : c)));
            toast.success(`${inr(a)} top-up requested`, { description: topup ?? "" });
            desk.log(`Fuel card ${topup} topped up by ${inr(a, { compact: true })}`, "ok");
            setTopup(null);
          }}
        >
          <Field label="Amount (₹)">
            <input className={inputClass} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} />
          </Field>
          <div className="flex flex-wrap gap-2">
            {["100000", "200000", "300000"].map((v) => (
              <Btn key={v} size="sm" variant={amount === v ? "solid" : "outline"} onClick={() => setAmount(v)}>
                {inr(Number(v), { compact: true })}
              </Btn>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn onClick={() => setTopup(null)}>Cancel</Btn>
            <Btn variant="solid" type="submit">
              Pay and top up
            </Btn>
          </div>
        </form>
      </Modal>
      <Sheet open={!!truck} onOpenChange={(o) => !o && setOpen(null)} eyebrow={truck ? `${truck.kind} · ${truck.driver}` : ""} title={truck ? <Plate plate={truck.plate} size="lg" /> : ""} sub={truck ? `${truck.kmpl.toFixed(2)} km/l against a standard of ${STD_KMPL[truck.kind].toFixed(1)}` : ""}>
        {truck && (
          <div className="space-y-5">
            <KV items={[{ k: "km, 30 days", v: truck.km.toLocaleString("en-IN") }, { k: "Litres", v: truck.litres.toLocaleString("en-IN") }, { k: "Diesel cost", v: inr(truck.litres * 92.4) }, { k: "Excess vs standard", v: <span className="text-d-late">{Math.max(0, Math.round(truck.litres - truck.km / STD_KMPL[truck.kind]))} L</span> }]} />
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-d-mute">Last 6 fills</p>
              <ul className="space-y-1.5 text-[12.5px]">
                {["Highway Fuels, Kurnool", "IOCL Krishnagiri", "BPCL Salem bypass", "IOCL Namakkal", "HPCL Dharmapuri", "IOCL Namakkal"].map((p, i) => (
                  <li key={`${p}-${i}`} className="flex items-center justify-between rounded-[8px] border border-d-line px-3 py-2">
                    <span>{p}</span>
                    <span className="tnum font-mono text-d-mute">
                      {180 + ((truck.odo + i * 37) % 140)} L · sensor {i === 0 && truck.gap < 0.92 ? <span className="text-d-late">−{12 + i * 4} L</span> : "match"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <Btn
              variant="solid"
              icon={MessageCircle}
              onClick={() => {
                toast.success("Driver coaching note sent", { description: `${truck.driver}: idling and over-speed tips` });
                desk.log(`km/l note sent to ${truck.driver}`);
              }}
            >
              Send km/l note to driver
            </Btn>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Tyres & maintenance ---------------- */

const LAYOUT: Record<Kind, number[]> = { "Tipper 10W": [2, 4, 4], "Taurus 16W": [2, 2, 4, 4, 4], "Trailer 40ft": [2, 4, 4, 4, 4, 4] };
const BRANDS = ["MRF Steel Muscle", "Apollo EnduRace", "JK Jetsteel", "CEAT Winmile", "Bridgestone M840"];
type Tyre = { pos: string; brand: string; serial: string; km: number; tread: number; retreads: number };

function tyresFor(t: Truck, idx: number): Tyre[] {
  const out: Tyre[] = [];
  LAYOUT[t.kind].forEach((n, axle) => {
    for (let k = 0; k < n; k++) {
      const seed = idx * 7 + axle * 11 + k * 5;
      out.push({ pos: `A${axle + 1}-${n === 2 ? (k ? "R" : "L") : ["LO", "LI", "RI", "RO"][k]}`, brand: BRANDS[seed % BRANDS.length], serial: `${["MR", "AP", "JK", "CT", "BS"][seed % 5]}${(seed * 7919) % 900000 + 100000}`, km: 18000 + ((seed * 3571) % 76000), tread: 3.5 + ((seed * 13) % 120) / 10, retreads: seed % 3 });
    }
  });
  return out;
}

function TyresTab({ trucks, update }: { trucks: Truck[]; update: (id: string, patch: Partial<Truck>) => void }) {
  const desk = useDesk();
  const choices = trucks.slice(0, 8);
  const [sel, setSel] = React.useState(choices[0].id);
  const [fix, setFix] = React.useState<Record<string, number>>({});
  const [tyre, setTyre] = React.useState<string | null>(null);
  const [jobs, setJobs] = React.useState(jobSeed);
  const [booked, setBooked] = React.useState<Set<string>>(new Set());
  const idx = trucks.findIndex((t) => t.id === sel);
  const truck = trucks[idx];
  const tyres = tyresFor(truck, idx).map((ty) => ({ ...ty, tread: fix[`${sel}-${ty.pos}`] ?? ty.tread }));
  const picked = tyres.find((ty) => ty.pos === tyre) ?? null;
  const low = trucks.slice(0, 30).reduce((a, t, i) => a + tyresFor(t, i).filter((ty) => ty.tread < 4).length, 0);
  const treadTone = (mm: number): Tone => (mm < 4 ? "late" : mm < 7 ? "warn" : "ok");

  const services = trucks.slice(0, 16).map((t, i) => ({
    id: t.id,
    plate: t.plate,
    kind: t.kind,
    item: ["Engine oil + filter", "Greasing, all points", "Brake liner check", "Clutch adjustment", "Air filter", "Gear oil", "Wheel alignment", "Battery check"][i % 8],
    dueKm: ((t.odo * 7) % 6000) - 1200,
    at: ["Own bay", "Tata ASC, Karur", "Own bay", "Ashok Leyland ASC, Erode"][i % 4],
    cost: [6800, 1200, 3400, 900, 1600, 4200, 1800, 600][i % 8],
  }));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Tyres under 4 mm" value={low} delta="+3" deltaGood={false} hint="first 30 trucks checked" icon={Disc3} tone="late" />
        <Stat label="Tyre cost per km" value="₹0.94" delta="-₹0.05" deltaGood hint="retreads on rear axles" icon={BadgeIndianRupee} trend={[1.08, 1.04, 1.02, 0.99, 0.97, 0.95, 0.94]} tone="ok" />
        <Stat label="In workshop" value={jobs.filter((j) => j.col !== "Ready").length} hint={`${jobs.filter((j) => j.col === "Waiting parts").length} waiting on parts`} icon={Wrench} tone="warn" />
        <Stat label="Services overdue" value={services.filter((s) => s.dueKm < 0).length} hint="by odometer, from GPS" icon={CalendarClock} tone="late" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <Panel title="Tyre map" sub="Every position by tread depth. Click a tyre to rotate, retread or replace." action={<select className={`${inputClass} h-8 w-auto text-[12.5px]`} value={sel} onChange={(e) => { setSel(e.target.value); setTyre(null); }}>{choices.map((t) => <option key={t.id} value={t.id}>{t.plate} · {t.kind}</option>)}</select>}>
          <div className="flex flex-col items-center gap-3 rounded-[10px] bg-d-sunk py-5">
            <div className="flex items-center gap-2">
              <Plate plate={truck.plate} />
              <span className="font-mono text-[11px] text-d-mute">front</span>
            </div>
            {LAYOUT[truck.kind].map((n, axle) => {
              const row = tyres.filter((ty) => ty.pos.startsWith(`A${axle + 1}-`));
              return (
                <div key={axle} className="relative flex items-center gap-1.5">
                  <span className="absolute left-1/2 top-1/2 h-[3px] w-[190px] -translate-x-1/2 -translate-y-1/2 rounded bg-d-line" />
                  {row.map((ty, k) => (
                    <React.Fragment key={ty.pos}>
                      {n === 4 && k === 2 && <span className="w-[86px]" />}
                      {n === 2 && k === 1 && <span className="w-[150px]" />}
                      <button
                        type="button"
                        onClick={() => setTyre(ty.pos)}
                        title={`${ty.pos} · ${ty.tread.toFixed(1)} mm`}
                        className={`relative z-[1] flex h-[46px] w-[22px] items-end justify-center rounded-[5px] border-2 pb-0.5 font-mono text-[8.5px] font-bold transition-transform hover:scale-110 ${tyre === ty.pos ? "ring-2 ring-d-accent" : ""}`}
                        style={{ background: `color-mix(in oklab, ${toneVar(treadTone(ty.tread))} 70%, #000)`, borderColor: "#050806", color: "#fff" }}
                      >
                        {Math.round(ty.tread)}
                      </button>
                    </React.Fragment>
                  ))}
                  <span className="absolute -right-16 font-mono text-[10px] text-d-mute">axle {axle + 1}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-4 font-mono text-[11px] text-d-mute">
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[2px] bg-d-ok" /> 7 mm+</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[2px] bg-d-warn" /> 4–7 mm</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[2px] bg-d-late" /> under 4 mm, pull out</span>
          </div>
        </Panel>
        <Panel title={picked ? `Tyre ${picked.pos}` : "Pick a tyre"} sub={picked ? `${picked.brand} · serial ${picked.serial}` : "Tread, km run and retread history appear here"}>
          {picked ? (
            <div className="space-y-4">
              <KV items={[{ k: "Tread", v: <span style={{ color: toneVar(treadTone(picked.tread)) }}>{picked.tread.toFixed(1)} mm</span> }, { k: "km on this tyre", v: picked.km.toLocaleString("en-IN") }, { k: "Retreads", v: picked.retreads }, { k: "Cost per km", v: `₹${(38000 / (picked.km + 1) * (picked.retreads + 1)).toFixed(2)}` }]} />
              <Meter value={picked.tread} max={16} tone={treadTone(picked.tread)} height={8} />
              <div className="flex flex-wrap gap-2">
                {[
                  { l: "Rotate to front", mm: Math.min(16, picked.tread + 0.01), msg: "rotated" },
                  { l: "Send for retread", mm: 12, msg: "sent to Kongu Retreads" },
                  { l: "Replace new", mm: 16, msg: "replaced with new MRF" },
                ].map((a) => (
                  <Btn
                    key={a.l}
                    size="sm"
                    variant={a.mm === 16 ? "solid" : "outline"}
                    onClick={() => {
                      setFix((s) => ({ ...s, [`${sel}-${picked.pos}`]: a.mm }));
                      toast.success(`${truck.plate} ${picked.pos} ${a.msg}`, { description: `Pandian gets the job on WhatsApp` });
                      desk.log(`Tyre ${picked.pos} on ${truck.plate} ${a.msg}`);
                    }}
                  >
                    {a.l}
                  </Btn>
                ))}
              </div>
            </div>
          ) : (
            <HBars data={BRANDS.map((b, i) => ({ label: b, value: [0.86, 0.92, 0.98, 1.04, 0.89][i], tone: i === 0 ? "ok" : "accent" }))} format={(v) => `₹${v.toFixed(2)}/km`} />
          )}
        </Panel>
      </div>
      <Panel title="Workshop board" sub="Drag a job across as it moves. Ready jobs release the truck to the idle pool.">
        <Board
          columns={[
            { id: "Reported", label: "Reported", tone: "neutral" },
            { id: "In workshop", label: "In workshop", tone: "warn", limit: 4 },
            { id: "Waiting parts", label: "Waiting parts", tone: "late" },
            { id: "Ready", label: "Ready", tone: "ok" },
          ]}
          items={jobs}
          itemKey={(j) => j.id}
          getColumn={(j) => j.col}
          onMove={(key, col) => {
            const j = jobs.find((x) => x.id === key);
            if (!j || j.col === col) return;
            setJobs((cur) => cur.map((x) => (x.id === key ? { ...x, col: col as Job["col"] } : x)));
            if (col === "Ready") {
              const t = trucks.find((x) => x.plate === j.plate);
              if (t && t.status === "Workshop") update(t.id, { status: "Idle", note: "Out of workshop, ready" });
            }
            toast.success(`${j.plate} → ${col}`, { description: j.job });
            desk.log(`Workshop: ${j.plate} ${j.job} → ${col}`, col === "Ready" ? "ok" : "info");
          }}
          renderCard={(j) => (
            <div>
              <Plate plate={j.plate} size="sm" />
              <p className="mt-2 text-[13px] font-medium">{j.job}</p>
              <p className="text-[11.5px] text-d-mute">{j.where}</p>
              {j.cost > 0 && <p className="mt-1 font-mono text-[11.5px]">{inr(j.cost)} est.</p>}
            </div>
          )}
        />
      </Panel>
      <Panel title="Services due" sub="By odometer from GPS. Negative is overdue.">
        <DataTable
          rows={services}
          rowKey={(s) => s.id}
          dense
          filter={{ get: (s) => (s.dueKm < 0 ? "Overdue" : s.dueKm < 1500 ? "Due soon" : "Later"), options: ["Overdue", "Due soon", "Later"] }}
          columns={[
            { key: "plate", label: "Truck", render: (s) => <Plate plate={s.plate} size="sm" /> },
            { key: "item", label: "Service", render: (s) => <span className="font-medium">{s.item}</span>, sort: (s) => s.item },
            { key: "due", label: "Due in", align: "right", render: (s) => <span className="tnum font-mono" style={{ color: s.dueKm < 0 ? "var(--d-late)" : s.dueKm < 1500 ? "var(--d-warn)" : undefined }}>{s.dueKm < 0 ? `${(-s.dueKm).toLocaleString("en-IN")} km over` : `${s.dueKm.toLocaleString("en-IN")} km`}</span>, sort: (s) => s.dueKm },
            { key: "at", label: "Where", render: (s) => <span className="text-d-mute">{s.at}</span>, wide: true },
            { key: "cost", label: "Est.", align: "right", render: (s) => <span className="tnum font-mono">{inr(s.cost)}</span> },
            {
              key: "b",
              label: "",
              align: "right",
              render: (s) =>
                booked.has(s.id) ? (
                  <Pill tone="ok">Booked</Pill>
                ) : (
                  <Btn
                    size="sm"
                    variant="soft"
                    onClick={() => {
                      setBooked((b) => new Set(b).add(s.id));
                      toast.success(`${s.item} booked`, { description: `${s.plate} · ${s.at}` });
                      desk.log(`Service booked: ${s.item} for ${s.plate}`);
                    }}
                  >
                    Book
                  </Btn>
                ),
            },
          ]}
        />
      </Panel>
    </div>
  );
}

/* ---------------- Permits & compliance ---------------- */

function PermitsTab({ trucks, update }: { trucks: Truck[]; update: (id: string, patch: Partial<Truck>) => void }) {
  const desk = useDesk();
  const [ewb, setEwb] = React.useState<Set<string>>(new Set());
  const fees: Record<DocKey, number> = { Insurance: 48500, FC: 4200, "National permit": 16500, "Road tax": 11800, PUC: 400 };
  const rows = trucks
    .flatMap((t) => DOCS.map((d) => ({ key: `${t.id}-${d}`, t, doc: d, days: t.docs[d] })))
    .filter((r) => r.days <= 45)
    .sort((a, b) => a.days - b.days);

  function renew(keys: string[]) {
    keys.forEach((k) => {
      const r = rows.find((x) => x.key === k);
      if (!r) return;
      const docs = { ...r.t.docs, [r.doc]: r.doc === "PUC" ? 180 : 365 };
      update(r.t.id, { docs, ...(r.doc === "National permit" && r.t.status === "Permit expired" ? { status: "Idle" as Status, note: "Permit renewed, ready for load" } : {}) });
    });
    toast.success(`${keys.length} renewal${keys.length > 1 ? "s" : ""} filed`, { description: `Yamuna files on Vahan; ${inr(keys.reduce((a, k) => a + (fees[rows.find((x) => x.key === k)?.doc ?? "PUC"] ?? 0), 0))} from the HDFC account` });
    desk.log(`${keys.length} document renewals filed`, "ok");
  }

  const matrixTrucks = [...trucks].sort((a, b) => Math.min(...DOCS.map((d) => a.docs[d])) - Math.min(...DOCS.map((d) => b.docs[d]))).slice(0, 14);
  const eways = [
    { no: "3318 7742 9015", plate: trucks[1].plate, to: "Kolkata", left: 5, km: 420 },
    { no: "3318 7743 1120", plate: trucks[10].plate, to: "Guwahati", left: 9, km: 960 },
    { no: "3318 7736 4410", plate: trucks[0].plate, to: "Bhiwandi", left: 14, km: 380 },
    { no: "3318 7745 0087", plate: trucks[6].plate, to: "Bengaluru", left: 21, km: 120 },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Lapsed now" value={rows.filter((r) => r.days < 0).length} hint="trucks can't legally run" icon={ShieldAlert} tone="late" />
        <Stat label="Due in 15 days" value={rows.filter((r) => r.days >= 0 && r.days <= 15).length} delta="+4" deltaGood={false} icon={CalendarClock} tone="warn" />
        <Stat label="Renewal spend, 45 days" value={inr(rows.reduce((a, r) => a + fees[r.doc], 0), { compact: true })} hint="insurance is the big one" icon={BadgeIndianRupee} />
        <Stat label="Pending e-challans" value="5" hint="₹7,500 · portal sync failing" icon={AlertTriangle} tone="info" />
      </div>
      <Panel title="Expiring and lapsed" sub="Select rows to renew together. Fees come from the HDFC current account." action={<Pill tone="late" mono>{rows.length} in 45 days</Pill>}>
        <DataTable
          rows={rows}
          rowKey={(r) => r.key}
          search={(r) => `${r.t.plate} ${r.doc}`}
          searchPlaceholder="Plate or document"
          filter={{ get: (r) => r.doc, options: DOCS }}
          bulk={[{ label: "Renew selected", run: renew }]}
          columns={[
            { key: "plate", label: "Truck", render: (r) => <Plate plate={r.t.plate} size="sm" /> },
            { key: "doc", label: "Document", render: (r) => <span className="font-medium">{r.doc}</span>, sort: (r) => r.doc },
            { key: "exp", label: "Expires", render: (r) => <span className="font-mono text-[12px]">{dayLabel(r.days)}</span>, sort: (r) => r.days },
            { key: "cd", label: "Clock", render: (r) => (r.days < 0 ? <span className="font-mono text-[12px] text-d-late">lapsed {-r.days}d ago</span> : <span className="text-[12px]" style={{ color: toneVar(docTone(r.days)) }}><Countdown compact inHours={r.days * 24 + 9} /></span>) },
            { key: "fee", label: "Fee", align: "right", render: (r) => <span className="tnum font-mono text-d-mute">{inr(fees[r.doc])}</span>, wide: true },
            { key: "st", label: "", align: "right", render: (r) => (r.days > 45 ? <Pill tone="ok">Renewed</Pill> : <Btn size="sm" variant={r.days < 0 ? "solid" : "soft"} onClick={(e) => { e.stopPropagation(); renew([r.key]); }}>Renew</Btn>) },
          ]}
        />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <Panel title="Compliance wall" sub="14 trucks closest to a lapse, every document. Number is days left.">
          <div className="desk-scroll overflow-x-auto">
            <table className="w-full min-w-[520px] border-separate border-spacing-1 text-[11.5px]">
              <thead>
                <tr>
                  <th />
                  {DOCS.map((d) => (
                    <th key={d} className="px-1 text-center font-mono font-normal text-d-mute">
                      {d === "National permit" ? "Permit" : d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixTrucks.map((t) => (
                  <tr key={t.id}>
                    <td className="pr-2">
                      <Plate plate={t.plate} size="sm" />
                    </td>
                    {DOCS.map((d) => {
                      const v = t.docs[d];
                      const tone = docTone(v);
                      return (
                        <td key={d} className="p-0">
                          <span className="tnum flex h-7 items-center justify-center rounded-[4px] font-mono text-[11px]" style={{ background: `color-mix(in oklab, ${toneVar(tone)} ${tone === "ok" ? 12 : 30}%, var(--d-panel))`, color: tone === "ok" ? "var(--d-mute)" : toneVar(tone) }}>
                            {v < 0 ? "LAPSED" : v > 99 ? "99+" : v}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="E-way bills running out" sub="Validity is 1 day per 200 km. Extend before it lapses on the road.">
          <ul className="space-y-2">
            {eways.map((e) => (
              <li key={e.no} className="rounded-[8px] border border-d-line p-3">
                <div className="flex items-center justify-between gap-2">
                  <Plate plate={e.plate} size="sm" />
                  <span className="font-mono text-[11px] text-d-mute">EWB {e.no}</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-[12.5px]">
                    to {e.to} · {e.km} km left ·{" "}
                    <span style={{ color: e.left < 8 ? "var(--d-late)" : "var(--d-warn)" }}>
                      <Countdown compact inHours={ewb.has(e.no) ? e.left + 24 : e.left} />
                    </span>
                  </p>
                  {ewb.has(e.no) ? (
                    <Pill tone="ok">Extended</Pill>
                  ) : (
                    <Btn
                      size="sm"
                      variant="soft"
                      onClick={() => {
                        setEwb((s) => new Set(s).add(e.no));
                        toast.success(`EWB ${e.no} extended 1 day`, { description: "Reason: transhipment delay · Part-B updated" });
                        desk.log(`E-way bill ${e.no} extended`, "ok");
                      }}
                    >
                      Extend
                    </Btn>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

/* ---------------- Freight dues ---------------- */

function DuesTab() {
  const desk = useDesk();
  const [open, setOpen] = React.useState<Party | null>(null);
  const [sent, setSent] = React.useState<Set<string>>(new Set());
  const total = parties.reduce((a, p) => a + p.amount, 0);
  const bucket = (d: number) => (d <= 30 ? "0-30 days" : d <= 60 ? "31-60 days" : d <= 90 ? "61-90 days" : "90+ days");
  const labels = ["0-30 days", "31-60 days", "61-90 days", "90+ days"];
  const buckets = labels.map((label, i) => ({ label, value: parties.filter((x) => bucket(x.days) === label).reduce((a, x) => a + x.amount, 0), tone: (["ok", "info", "warn", "late"] as const)[i] }));
  const podBlocked = parties.reduce((a, p) => a + p.pod * 52000, 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Freight outstanding" value={inr(total, { compact: true })} delta="-6%" deltaGood={false} hint="vs last month" icon={BadgeIndianRupee} trend={[46, 45, 44, 43, 41, 40, 39.4]} tone="warn" />
        <Stat label="Over 60 days" value={inr(parties.filter((p) => p.days > 60).reduce((a, p) => a + p.amount, 0), { compact: true })} hint={`${parties.filter((p) => p.days > 60).length} parties`} icon={AlertTriangle} tone="late" />
        <Stat label="Held by missing PODs" value={inr(podBlocked, { compact: true })} hint={`${parties.reduce((a, p) => a + p.pod, 0)} PODs not back`} icon={FileCheck2} tone="info" />
        <Stat label="TDS 194C receivable" value="₹2.8 L" hint="26AS matched to Q2" icon={CalendarClock} />
      </div>
      <Panel title="Ageing" sub="Party-wise from Tally. Reminders go at 10 AM and 5 PM unless you stop them.">
        <AgingBar buckets={buckets} format={(v) => inr(v, { compact: true })} />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Panel title="Parties" sub="Click for the statement and a WhatsApp reminder">
          <DataTable
            rows={parties}
            rowKey={(p) => p.name}
            search={(p) => `${p.name} ${p.town}`}
            searchPlaceholder="Search party"
            filter={{ get: (p) => bucket(p.days), options: labels }}
            onRow={setOpen}
            bulk={[
              {
                label: "Send WhatsApp reminders",
                run: (k) => {
                  setSent((s) => new Set([...s, ...k]));
                  toast.success(`${k.length} reminders sent`);
                  desk.log(`${k.length} freight reminders sent`);
                },
              },
            ]}
            columns={[
              { key: "name", label: "Party", render: (p) => <span className="font-medium">{p.name}</span>, sort: (p) => p.name },
              { key: "town", label: "Town", render: (p) => <span className="text-d-mute">{p.town}</span>, wide: true },
              { key: "inv", label: "Bills", align: "right", render: (p) => <span className="tnum font-mono">{p.invoices}</span>, sort: (p) => p.invoices },
              { key: "amt", label: "Amount", align: "right", render: (p) => <span className="tnum font-mono">{inr(p.amount)}</span>, sort: (p) => p.amount },
              { key: "days", label: "Days", align: "right", render: (p) => <span className="tnum font-mono" style={{ color: p.days > 90 ? "var(--d-late)" : p.days > 60 ? "var(--d-warn)" : undefined }}>{p.days}</span>, sort: (p) => p.days },
              { key: "pod", label: "PODs out", align: "right", render: (p) => (p.pod ? <Pill tone="warn" mono>{p.pod}</Pill> : <span className="text-d-mute">—</span>), wide: true },
              { key: "pr", label: "Promise", render: (p) => (sent.has(p.name) ? <Pill tone="info">Reminded</Pill> : p.promise ? <Pill tone="ok">{p.promise}</Pill> : <span className="text-d-mute">—</span>) },
            ]}
          />
        </Panel>
        <Panel title="Collections forecast" sub="Promises plus how each party usually pays">
          <Bars height={200} format={(v) => `₹${v}L`} data={[{ label: "This wk", value: 11.4, tone: "ok" }, { label: "Next wk", value: 9.2, tone: "accent" }, { label: "Wk 3", value: 7.1, tone: "accent" }, { label: "Wk 4", value: 5.6, tone: "info" }, { label: "Later", value: 6.1, tone: "late" }]} />
        </Panel>
      </div>
      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={open ? `${open.town} · ${open.contact}` : ""}
        title={open?.name ?? ""}
        sub={open ? `${inr(open.amount)} · ${open.invoices} bills · oldest ${open.days} days` : ""}
        footer={
          <Btn
            variant="solid"
            icon={MessageCircle}
            onClick={() => {
              if (!open) return;
              setSent((s) => new Set(s).add(open.name));
              toast.success("Reminder sent on WhatsApp", { description: `${open.name} · statement attached` });
              desk.log(`Freight reminder to ${open.name} for ${inr(open.amount, { compact: true })}`);
              setOpen(null);
            }}
          >
            Send on WhatsApp
          </Btn>
        }
      >
        {open && (
          <div className="space-y-4">
            <div className="rounded-[10px] rounded-tl-[2px] bg-[#1d3a2a] p-4 text-[13.5px] leading-relaxed text-[#dff3e4]">
              Vanakkam, Palar Roadlines here. {open.invoices} freight bills for {inr(open.amount)} are open, the oldest {open.days} days.{open.pod ? ` ${open.pod} POD${open.pod > 1 ? "s" : ""} reached your office by courier; please confirm receipt.` : ""} Statement attached. Kindly arrange payment by NEFT. Nandri. Kavitha, Accounts
            </div>
            <KV items={[{ k: "Contact", v: open.contact }, { k: "Last promise", v: open.promise ?? "None" }, { k: "PODs not back", v: open.pod }, { k: "Reminders this month", v: open.days > 60 ? "4" : "1" }]} />
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-d-mute">Bills</p>
              <ul className="space-y-1.5 text-[12.5px]">
                {Array.from({ length: Math.min(open.invoices, 5) }, (_, i) => (
                  <li key={i} className="flex items-center justify-between rounded-[8px] border border-d-line px-3 py-2">
                    <span className="font-mono">PR/FB/{2410 - i * 3}</span>
                    <span className="tnum font-mono text-d-mute">
                      {inr(Math.round(open.amount / open.invoices))} · {Math.max(4, open.days - i * 9)}d
                    </span>
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
