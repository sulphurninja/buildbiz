"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  BadgePercent,
  Banknote,
  Boxes,
  CheckCheck,
  ClipboardList,
  Gauge as GaugeIcon,
  IndianRupee,
  MapPin,
  MessageCircle,
  Navigation,
  PackageCheck,
  Pause,
  Phone,
  Play,
  Plus,
  Receipt,
  Route,
  Send,
  ShoppingBasket,
  Smartphone,
  Store,
  Timer,
  Truck,
  Users,
  Wallet,
  Warehouse,
} from "lucide-react";
import { DeskShell, useDesk } from "../shell";
import { AreaChart, Bars, Donut, HBars, HeatGrid } from "../charts";
import { AgingBar, ApprovalQueue, Board, Checklist, DataTable } from "../data";
import { AgentsModule, ConnectionsModule, IndependenceModule, PeopleModule } from "../common";
import { Avatar, Btn, Field, IconBtn, inputClass, inr, KV, Meter, Modal, Panel, Pill, Segmented, Sheet, Stat, num } from "../ui";
import type { DeskConfig, DeskModule, IndependenceData, Integration, TeamMember, Tone, WorkforceAgent } from "../types";

/* ============================================================
   Data — Deccan Route Sales, Nagpur. Fictional FMCG distributor for
   six principals. 14 salesmen, 2,100 outlets, 6 vans out of Kalamna.
   Map coordinates are a stylised 1000 × 620 plan of the city.
   ============================================================ */

type Pt = [number, number];
type Zone = "North" | "Central" | "East" | "South" | "West";

const LOC: Record<string, Pt> = {
  Gorewada: [318, 112],
  "Koradi Road": [505, 82],
  Gittikhadan: [352, 192],
  "Katol Road": [246, 150],
  Mankapur: [448, 186],
  Jaripatka: [548, 168],
  Indora: [604, 226],
  "Kamptee Road": [694, 148],
  Futala: [372, 262],
  Sadar: [480, 248],
  Dharampeth: [402, 322],
  Sitabuldi: [486, 330],
  Gandhibagh: [566, 316],
  Itwari: [616, 286],
  Mahal: [576, 372],
  Kalamna: [744, 276],
  Pardi: [846, 318],
  "Wardhaman Nagar": [694, 352],
  Wathoda: [796, 410],
  Nandanvan: [662, 440],
  Dighori: [734, 522],
  "Medical Square": [562, 442],
  Ajni: [482, 428],
  Hudkeshwar: [612, 540],
  "Manish Nagar": [470, 512],
  Besa: [540, 578],
  Somalwada: [418, 560],
  Khamla: [400, 478],
  "Pratap Nagar": [366, 428],
  "Trimurti Nagar": [298, 446],
  Ambazari: [300, 352],
  Hingna: [158, 482],
  Wadi: [128, 268],
};

type Salesman = {
  id: string;
  name: string;
  beat: string;
  zone: Zone;
  color: string;
  stops: string[];
  calls: number;
  base: number;
  speed: number;
  strike: number;
  lpcBase: number;
  ticket: number;
  target: number;
  cash: number;
  upi: number;
  van: string;
  mtd: number;
  phone: string;
  idle?: string;
  offBeat?: string;
};

const salesmen: Salesman[] = [
  { id: "S01", name: "Imran Qureshi", beat: "Itwari wholesale", zone: "Central", color: "#1d6b3a", stops: ["Gandhibagh", "Itwari", "Mahal"], calls: 30, base: 0.62, speed: 0.0032, strike: 84, lpcBase: 8, ticket: 6400, target: 140000, cash: 61200, upi: 38400, van: "V1", mtd: 104, phone: "98230 11842" },
  { id: "S02", name: "Ganesh Bawankar", beat: "Sitabuldi – Sadar", zone: "Central", color: "#c4781a", stops: ["Sitabuldi", "Sadar", "Mankapur"], calls: 36, base: 0.55, speed: 0.0036, strike: 71, lpcBase: 6, ticket: 2600, target: 72000, cash: 24800, upi: 19600, van: "V2", mtd: 91, phone: "97640 22381" },
  { id: "S03", name: "Sachin Dhote", beat: "Jaripatka – Indora", zone: "North", color: "#2e6e8e", stops: ["Mankapur", "Jaripatka", "Indora", "Kamptee Road"], calls: 40, base: 0.48, speed: 0.0038, strike: 66, lpcBase: 5, ticket: 1900, target: 56000, cash: 21400, upi: 9800, van: "V3", mtd: 86, phone: "90110 48127" },
  { id: "S04", name: "Rahul Gajbhiye", beat: "Koradi Road", zone: "North", color: "#b9472f", stops: ["Gorewada", "Koradi Road", "Jaripatka"], calls: 38, base: 0.39, speed: 0.0034, strike: 58, lpcBase: 4, ticket: 1700, target: 50000, cash: 9600, upi: 4200, van: "V3", mtd: 71, phone: "88050 61290", idle: "Idle 38 min at Koradi Naka, no order punched" },
  { id: "S05", name: "Nitin Kolte", beat: "Katol Road – Wadi", zone: "West", color: "#7a5c1e", stops: ["Gittikhadan", "Katol Road", "Wadi"], calls: 37, base: 0.51, speed: 0.0035, strike: 69, lpcBase: 5, ticket: 2100, target: 60000, cash: 18700, upi: 12100, van: "V2", mtd: 88, phone: "98500 73316" },
  { id: "S06", name: "Vaibhav Tidke", beat: "Futala – Hingna", zone: "West", color: "#5b8c2a", stops: ["Futala", "Ambazari", "Hingna"], calls: 35, base: 0.46, speed: 0.0033, strike: 63, lpcBase: 5, ticket: 2300, target: 58000, cash: 15200, upi: 11900, van: "V2", mtd: 82, phone: "77200 94418" },
  { id: "S07", name: "Akash Bhagat", beat: "Pratap Nagar – Khamla", zone: "South", color: "#8a4f9e", stops: ["Trimurti Nagar", "Pratap Nagar", "Khamla", "Somalwada"], calls: 39, base: 0.57, speed: 0.0037, strike: 74, lpcBase: 6, ticket: 2800, target: 80000, cash: 22600, upi: 27400, van: "V5", mtd: 97, phone: "98901 25570" },
  { id: "S08", name: "Prashant Lanjewar", beat: "Manish Nagar – Besa", zone: "South", color: "#2a7f7a", stops: ["Ajni", "Manish Nagar", "Besa"], calls: 36, base: 0.53, speed: 0.0035, strike: 70, lpcBase: 6, ticket: 2400, target: 66000, cash: 19900, upi: 16700, van: "V5", mtd: 93, phone: "93700 81145" },
  { id: "S09", name: "Mohsin Sheikh", beat: "Kalamna – Pardi", zone: "East", color: "#c0392b", stops: ["Kalamna", "Pardi", "Wathoda"], calls: 41, base: 0.6, speed: 0.0039, strike: 77, lpcBase: 5, ticket: 1800, target: 62000, cash: 28800, upi: 8400, van: "V4", mtd: 99, phone: "95520 30871" },
  { id: "S10", name: "Rupesh Nandanwar", beat: "Nandanvan – Dighori", zone: "East", color: "#b98a12", stops: ["Wardhaman Nagar", "Nandanvan", "Dighori"], calls: 38, base: 0.44, speed: 0.0034, strike: 68, lpcBase: 5, ticket: 2000, target: 58000, cash: 16300, upi: 10200, van: "V4", mtd: 84, phone: "99220 47719" },
  { id: "S11", name: "Swapnil Chaudhari", beat: "Medical Sq – Hudkeshwar", zone: "South", color: "#3d5a99", stops: ["Mahal", "Medical Square", "Hudkeshwar"], calls: 37, base: 0.5, speed: 0.0035, strike: 72, lpcBase: 6, ticket: 2200, target: 64000, cash: 20100, upi: 14800, van: "V1", mtd: 90, phone: "90280 16654" },
  { id: "S12", name: "Deepak Sahu", beat: "Dharampeth modern trade", zone: "Central", color: "#4e6b1d", stops: ["Dharampeth", "Sitabuldi", "Ajni"], calls: 32, base: 0.59, speed: 0.003, strike: 79, lpcBase: 9, ticket: 3900, target: 98000, cash: 8900, upi: 52300, van: "V1", mtd: 101, phone: "98221 70093" },
  { id: "S13", name: "Yogesh Kharabe", beat: "Kamptee Road", zone: "North", color: "#9c3d5c", stops: ["Indora", "Kamptee Road", "Kalamna"], calls: 36, base: 0.42, speed: 0.0033, strike: 61, lpcBase: 4, ticket: 1900, target: 54000, cash: 13800, upi: 6100, van: "V3", mtd: 76, phone: "86980 55212", offBeat: "GPS 1.2 km off beat near Kamptee bus stand" },
  { id: "S14", name: "Anil Borkar", beat: "Ambazari – Trimurti", zone: "West", color: "#6b4a2f", stops: ["Dharampeth", "Ambazari", "Trimurti Nagar"], calls: 33, base: 0.49, speed: 0.0032, strike: 65, lpcBase: 5, ticket: 2500, target: 61000, cash: 14400, upi: 13300, van: "V2", mtd: 85, phone: "70280 39906" },
];

const shopNames = [
  "Shree Ganesh Kirana", "Jai Bhavani Provision", "Sai Krupa General", "Mahalaxmi Stores", "New Durga Kirana", "Om Sai Traders", "Gajanan Provision", "Balaji Super Shoppe", "Anand Kirana", "Royal Pan Bhandar",
  "Shivam General Stores", "Patel Kirana & Dairy", "Laxmi Narayan Stores", "Ambika Provision", "Gurukrupa Traders", "Ekvira Kirana", "Swami Samarth Stores", "Al-Habib General", "Jagdamba Kirana", "Vitthal Rukmini Stores",
  "Shubham Provision", "Kalpana Medical & General", "Hanuman Kirana", "Prakash Stores", "Ganga Jamuna Provision", "Siddhivinayak Mart", "Raju Pan & Cold Drinks", "Annapurna Kirana", "Navkar Traders", "Datta Kirana",
  "Gayatri Provision", "Mauli Stores", "Noor General Stores", "Renuka Kirana", "Sakhi Mini Mart", "Ashok Provision", "Saraswati Stores", "Tirupati Traders", "Chintamani Kirana", "Krishna Dairy & General",
];
const noOrderReasons = ["Stock still full", "Owner not at counter", "Wants Diwali scheme first", "Bought from wholesaler", "Credit hold, dues pending"];
const skipReasons = ["Shop shut", "Weekly off", "Road dug up, no access", "Owner at a wedding"];

function hash(a: number, b: number) {
  let x = (a * 374761393 + b * 668265263) | 0;
  x = Math.imul(x ^ (x >>> 13), 1274126177);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

type Fate = "ordered" | "visited" | "skipped";
type OutletState = Fate | "pending";
type BeatOutlet = { key: string; name: string; locality: string; at: number; x: number; y: number; fate: Fate; value: number; lines: number; reason: string };
type Beat = Salesman & { pts: Pt[]; cum: number[]; len: number; outlets: BeatOutlet[] };

function locate(pts: Pt[], cum: number[], len: number, t: number) {
  const d = Math.max(0, Math.min(1, t)) * len;
  let k = 0;
  while (k < pts.length - 2 && cum[k + 1] < d) k++;
  const segLen = cum[k + 1] - cum[k] || 1;
  const local = (d - cum[k]) / segLen;
  const [x0, y0] = pts[k];
  const [x1, y1] = pts[k + 1];
  return { x: x0 + (x1 - x0) * local, y: y0 + (y1 - y0) * local, k, local, ang: Math.atan2(y1 - y0, x1 - x0) };
}

const beats: Beat[] = salesmen.map((s, bi) => {
  const pts = s.stops.map((n) => LOC[n]);
  const cum = pts.reduce<number[]>((acc, p, i) => (i === 0 ? [0] : [...acc, acc[i - 1] + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1])]), []);
  const len = cum[cum.length - 1];
  const outlets = Array.from({ length: s.calls }, (_, i) => {
    const at = (i + 0.5) / s.calls;
    const p = locate(pts, cum, len, at);
    const off = (hash(bi * 3 + 1, i) - 0.5) * 34;
    const r = hash(bi * 7 + 3, i * 11 + 5) * 100;
    const fate: Fate = r < s.strike ? "ordered" : r > 91 ? "skipped" : "visited";
    const locality = p.local < 0.5 ? s.stops[p.k] : s.stops[p.k + 1];
    return {
      key: `${s.id}-${i}`,
      name: shopNames[(bi * 7 + i * 3) % shopNames.length],
      locality,
      at,
      x: Math.round((p.x + Math.cos(p.ang + Math.PI / 2) * off) * 10) / 10,
      y: Math.round((p.y + Math.sin(p.ang + Math.PI / 2) * off) * 10) / 10,
      fate,
      value: Math.round((s.ticket * (0.45 + hash(bi, i * 5 + 2) * 1.1)) / 10) * 10,
      lines: Math.max(1, Math.round(s.lpcBase - 2 + hash(i, bi * 13) * 4)),
      reason: fate === "skipped" ? skipReasons[i % skipReasons.length] : noOrderReasons[(i + bi) % noOrderReasons.length],
    };
  });
  return { ...s, pts, cum, len, outlets };
});

function stateOf(o: BeatOutlet, p: number): OutletState {
  return o.at > p ? "pending" : o.fate;
}

function statsOf(b: Beat, p: number) {
  const seen = b.outlets.filter((o) => o.at <= p);
  const ordered = seen.filter((o) => o.fate === "ordered");
  const lines = ordered.reduce((a, o) => a + o.lines, 0);
  return {
    done: seen.length,
    ordered: ordered.length,
    skipped: seen.filter((o) => o.fate === "skipped").length,
    visited: seen.filter((o) => o.fate === "visited").length,
    value: ordered.reduce((a, o) => a + o.value, 0),
    lines,
    strike: seen.length ? Math.round((ordered.length / seen.length) * 100) : 0,
    lpc: ordered.length ? lines / ordered.length : 0,
  };
}

const ptsD = (pts: Pt[]) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

/* ---------------- Live clock for the beat simulation ---------------- */

type Live = { tick: number; playing: boolean; setPlaying: (v: boolean) => void; rate: "1×" | "4×"; setRate: (r: "1×" | "4×") => void; resumed: Record<string, number>; resume: (id: string) => void };
const LiveCtx = React.createContext<Live>({ tick: 0, playing: false, setPlaying: () => {}, rate: "1×", setRate: () => {}, resumed: {}, resume: () => {} });
const useLive = () => React.useContext(LiveCtx);

function LiveProvider({ children }: { children: React.ReactNode }) {
  const [tick, setTick] = React.useState(0);
  const [playing, setPlaying] = React.useState(true);
  const [rate, setRate] = React.useState<"1×" | "4×">("1×");
  const [resumed, setResumed] = React.useState<Record<string, number>>({});
  React.useEffect(() => {
    if (!playing) return;
    const step = rate === "4×" ? 4 : 1;
    const id = window.setInterval(() => setTick((t) => Math.min(t + step, 900)), 1400);
    return () => window.clearInterval(id);
  }, [playing, rate]);
  const resume = React.useCallback((id: string) => setResumed((r) => (id in r ? r : { ...r, [id]: tick })), [tick]);
  const value = React.useMemo(() => ({ tick, playing, setPlaying, rate, setRate, resumed, resume }), [tick, playing, rate, resumed, resume]);
  return <LiveCtx.Provider value={value}>{children}</LiveCtx.Provider>;
}

function progressOf(b: Beat, live: Live) {
  if (b.idle && !(b.id in live.resumed)) return b.base;
  const from = live.resumed[b.id] ?? 0;
  return Math.min(1, b.base + b.speed * (live.tick - from));
}

function useBeats() {
  const live = useLive();
  return beats.map((b) => {
    const p = progressOf(b, live);
    return { b, p, st: statsOf(b, p) };
  });
}

/* ---------------- Outlets, vans, schemes, dues ---------------- */

type OutletType = "Kirana" | "Wholesaler" | "Medical" | "Pan shop" | "Supermarket" | "Hotel / canteen" | "Sweet mart";
type Outlet = { id: string; name: string; owner: string; locality: string; type: OutletType; cls: "A" | "B" | "C"; salesman: string; limit: number; due: number; last: number; avg: number; gst: boolean; phone: string; days: string; hold?: boolean };

const seedOutlets: Outlet[] = [
  { id: "OT-0412", name: "Shree Balaji Traders", owner: "Ramesh Jaiswal", locality: "Itwari", type: "Wholesaler", cls: "A", salesman: "Imran Qureshi", limit: 150000, due: 186400, last: 2, avg: 42000, gst: true, phone: "98231 40127", days: "Mon, Thu" },
  { id: "OT-0587", name: "Agrawal Kirana Stores", owner: "Sunil Agrawal", locality: "Dharampeth", type: "Kirana", cls: "A", salesman: "Deepak Sahu", limit: 60000, due: 38200, last: 1, avg: 9800, gst: true, phone: "97663 18420", days: "Tue, Fri" },
  { id: "OT-1123", name: "Sai Medical & General", owner: "Pooja Wasnik", locality: "Manish Nagar", type: "Medical", cls: "B", salesman: "Prashant Lanjewar", limit: 25000, due: 12400, last: 4, avg: 3600, gst: true, phone: "90490 77213", days: "Tue" },
  { id: "OT-0931", name: "Jai Ambe Provision", owner: "Kishor Bante", locality: "Jaripatka", type: "Kirana", cls: "B", salesman: "Sachin Dhote", limit: 30000, due: 31800, last: 6, avg: 4200, gst: false, phone: "88884 20916", days: "Tue, Sat" },
  { id: "OT-1450", name: "Rahul Pan Bhandar", owner: "Rahul Shahu", locality: "Sitabuldi", type: "Pan shop", cls: "C", salesman: "Ganesh Bawankar", limit: 5000, due: 2100, last: 3, avg: 1150, gst: false, phone: "70209 61174", days: "Tue" },
  { id: "OT-0218", name: "Mahalaxmi Super Bazaar", owner: "Vijay Khandelwal", locality: "Pratap Nagar", type: "Supermarket", cls: "A", salesman: "Akash Bhagat", limit: 200000, due: 142000, last: 2, avg: 36500, gst: true, phone: "98220 55031", days: "Tue, Fri" },
  { id: "OT-1702", name: "Gajanan Kirana", owner: "Dnyaneshwar Ingle", locality: "Koradi Road", type: "Kirana", cls: "C", salesman: "Rahul Gajbhiye", limit: 15000, due: 9600, last: 27, avg: 2300, gst: false, phone: "95453 08812", days: "Tue" },
  { id: "OT-0766", name: "New Bombay Stores", owner: "Hussain Lakdawala", locality: "Sadar", type: "Kirana", cls: "A", salesman: "Ganesh Bawankar", limit: 75000, due: 54000, last: 3, avg: 12400, gst: true, phone: "98810 23347", days: "Tue, Fri" },
  { id: "OT-1288", name: "Shiv Shakti General", owner: "Manoj Dhurve", locality: "Pardi", type: "Kirana", cls: "B", salesman: "Mohsin Sheikh", limit: 25000, due: 6200, last: 1, avg: 3900, gst: false, phone: "93259 44160", days: "Tue, Sat" },
  { id: "OT-1934", name: "Annapurna Bhojnalaya", owner: "Sheela Raut", locality: "Wadi", type: "Hotel / canteen", cls: "C", salesman: "Nitin Kolte", limit: 20000, due: 18800, last: 9, avg: 5600, gst: true, phone: "77093 51288", days: "Tue" },
  { id: "OT-0349", name: "Mohammadi Wholesale", owner: "Aslam Ansari", locality: "Mahal", type: "Wholesaler", cls: "A", salesman: "Imran Qureshi", limit: 120000, due: 64000, last: 5, avg: 28000, gst: true, phone: "98600 72215", days: "Mon, Thu" },
  { id: "OT-1561", name: "Shubham Sweets & Namkeen", owner: "Shubham Haldikar", locality: "Nandanvan", type: "Sweet mart", cls: "B", salesman: "Rupesh Nandanwar", limit: 30000, due: 41500, last: 12, avg: 6800, gst: true, phone: "90110 39928", days: "Tue" },
  { id: "OT-0874", name: "Om Sai Kirana", owner: "Ganpat Chafle", locality: "Hingna", type: "Kirana", cls: "B", salesman: "Vaibhav Tidke", limit: 25000, due: 11200, last: 2, avg: 3400, gst: false, phone: "88301 66047", days: "Tue, Fri" },
  { id: "OT-2016", name: "Fresh Mart Mini", owner: "Neeraj Bhatia", locality: "Trimurti Nagar", type: "Supermarket", cls: "B", salesman: "Anil Borkar", limit: 80000, due: 22000, last: 1, avg: 14900, gst: true, phone: "97300 81652", days: "Tue, Fri" },
  { id: "OT-1377", name: "Laxmi Narayan Provision", owner: "Prakash Tiwari", locality: "Kamptee Road", type: "Kirana", cls: "B", salesman: "Yogesh Kharabe", limit: 20000, due: 19700, last: 33, avg: 2900, gst: false, phone: "94221 07734", days: "Tue" },
  { id: "OT-0655", name: "Vidarbha Medicos", owner: "Dr. Amit Kale", locality: "Medical Square", type: "Medical", cls: "A", salesman: "Swapnil Chaudhari", limit: 40000, due: 15600, last: 3, avg: 7200, gst: true, phone: "98505 92381", days: "Tue, Sat" },
  { id: "OT-1819", name: "Gurukrupa Pan & Cold Drinks", owner: "Sanjay Meshram", locality: "Besa", type: "Pan shop", cls: "C", salesman: "Prashant Lanjewar", limit: 6000, due: 0, last: 22, avg: 1400, gst: false, phone: "70582 13390", days: "Tue" },
  { id: "OT-1046", name: "Patel Kirana & Dairy", owner: "Jayesh Patel", locality: "Wathoda", type: "Kirana", cls: "B", salesman: "Mohsin Sheikh", limit: 25000, due: 8900, last: 2, avg: 4100, gst: false, phone: "99700 18245", days: "Tue, Sat" },
];

type Sku = { sku: string; principal: string; rate: number; godown: number; reorder: number };
const skus: Sku[] = [
  { sku: "Sahyadri Glucose ₹5 (144)", principal: "Sahyadri Foods", rate: 620, godown: 84, reorder: 220 },
  { sku: "Sahyadri Marie 250g (36)", principal: "Sahyadri Foods", rate: 1180, godown: 210, reorder: 120 },
  { sku: "Sahyadri Rusk 300g (24)", principal: "Sahyadri Foods", rate: 960, godown: 96, reorder: 80 },
  { sku: "Godhuli Detergent 1kg (20)", principal: "Godhuli Consumer", rate: 1640, godown: 140, reorder: 150 },
  { sku: "Godhuli Neem Soap 4×100g (24)", principal: "Godhuli Consumer", rate: 2280, godown: 188, reorder: 90 },
  { sku: "Godhuli Dishwash Bar (60)", principal: "Godhuli Consumer", rate: 1320, godown: 58, reorder: 100 },
  { sku: "Vidarbha Chakki Atta 5kg (4)", principal: "Vidarbha Agro", rate: 860, godown: 410, reorder: 300 },
  { sku: "Vidarbha Soya Oil 1L pouch (10)", principal: "Vidarbha Agro", rate: 1290, godown: 120, reorder: 200 },
  { sku: "Kesari Garam Masala 100g (48)", principal: "Kesari Masala", rate: 2880, godown: 74, reorder: 60 },
  { sku: "Kesari Haldi 200g (40)", principal: "Kesari Masala", rate: 1720, godown: 42, reorder: 70 },
  { sku: "Nimbus Mango Drink 200ml (30)", principal: "Nimbus Beverages", rate: 360, godown: 520, reorder: 250 },
  { sku: "Shubhra Floor Cleaner 500ml (24)", principal: "Shubhra Home Care", rate: 1560, godown: 66, reorder: 50 },
];

type VanStatus = "Loading" | "Loaded" | "On beat" | "Back";
type Van = { id: string; reg: string; type: string; driver: string; zone: string; status: VanStatus; out: string; km: number };
const seedVans: Van[] = [
  { id: "V1", reg: "MH-31-FC-4417", type: "Tata Ace Gold", driver: "Shankar Meshram", zone: "Central + Medical Sq", status: "On beat", out: "9:10 AM", km: 38 },
  { id: "V2", reg: "MH-31-EQ-2290", type: "Mahindra Jeeto", driver: "Babulal Uikey", zone: "West + Sitabuldi", status: "On beat", out: "9:25 AM", km: 51 },
  { id: "V3", reg: "MH-40-BG-7713", type: "Tata Ace", driver: "Sunil Dongre", zone: "North", status: "On beat", out: "9:40 AM", km: 44 },
  { id: "V4", reg: "MH-31-FT-0582", type: "Bolero Pik-Up", driver: "Ravi Pande", zone: "East", status: "On beat", out: "9:05 AM", km: 29 },
  { id: "V5", reg: "MH-31-DS-9154", type: "Mahindra Jeeto", driver: "Kailash Shende", zone: "South", status: "Loaded", out: "—", km: 0 },
  { id: "V6", reg: "MH-31-GK-3368", type: "Tata Ace", driver: "Firoz Khan", zone: "Godown top-ups", status: "Loading", out: "—", km: 0 },
];

function loadSheet(vanIdx: number) {
  return skus.map((s, i) => {
    const loaded = Math.round(6 + hash(vanIdx + 2, i) * 26);
    const soldFrac = vanIdx >= 4 ? 0 : 0.35 + hash(i, vanIdx * 9) * 0.5;
    const sold = Math.min(loaded, Math.round(loaded * soldFrac));
    const damaged = hash(vanIdx * 5, i + 1) > 0.86 ? 1 : 0;
    return { ...s, loaded, sold, damaged, balance: loaded - sold - damaged };
  });
}

type Scheme = { id: string; principal: string; name: string; mechanic: string; ends: string; qualified: number; target: number; claim: number; kind: "Trade" | "Consumer" | "QPS" | "Visibility" };
const schemes: Scheme[] = [
  { id: "SC-101", principal: "Sahyadri Foods", name: "Glucose ₹5 Diwali push", mechanic: "Buy 10 cases, get 1 free", ends: "31 Oct", qualified: 214, target: 300, claim: 62400, kind: "Trade" },
  { id: "SC-102", principal: "Godhuli Consumer", name: "Detergent 1kg trade discount", mechanic: "₹6 per unit off invoice", ends: "31 Oct", qualified: 388, target: 420, claim: 91200, kind: "Trade" },
  { id: "SC-103", principal: "Kesari Masala", name: "Diwali dhamaka", mechanic: "₹1,000 bill → steel tiffin for retailer", ends: "5 Nov", qualified: 126, target: 250, claim: 50400, kind: "Trade" },
  { id: "SC-104", principal: "Vidarbha Agro", name: "Atta QPS", mechanic: "2% on 50+ bags a month", ends: "31 Oct", qualified: 41, target: 60, claim: 38900, kind: "QPS" },
  { id: "SC-105", principal: "Nimbus Beverages", name: "Chiller visibility", mechanic: "₹300/month per placed chiller", ends: "31 Mar", qualified: 63, target: 80, claim: 18900, kind: "Visibility" },
  { id: "SC-106", principal: "Shubhra Home Care", name: "Floor cleaner 2+1", mechanic: "Consumer pack, ₹38 per free unit", ends: "15 Nov", qualified: 172, target: 200, claim: 27600, kind: "Consumer" },
  { id: "SC-107", principal: "Sahyadri Foods", name: "Rusk launch rack", mechanic: "Free display rack on 6 cases", ends: "30 Nov", qualified: 38, target: 120, claim: 22800, kind: "Visibility" },
  { id: "SC-108", principal: "Godhuli Consumer", name: "Dishwash slab", mechanic: "5% over ₹10k monthly billing", ends: "31 Oct", qualified: 57, target: 70, claim: 21300, kind: "QPS" },
  { id: "SC-109", principal: "Kesari Masala", name: "Haldi 12 + 1", mechanic: "1 free on every 12", ends: "31 Oct", qualified: 149, target: 180, claim: 33500, kind: "Trade" },
  { id: "SC-110", principal: "Vidarbha Agro", name: "Soya oil margin support", mechanic: "₹4/L to distributor on 8,000 L", ends: "31 Oct", qualified: 1, target: 1, claim: 44000, kind: "QPS" },
  { id: "SC-111", principal: "Nimbus Beverages", name: "Summer target close-out", mechanic: "₹2/case over 1,800 cases", ends: "30 Sep", qualified: 1, target: 1, claim: 56200, kind: "QPS" },
];

type ClaimStage = "Draft" | "Submitted" | "Audit" | "Approved" | "Credited";
type Claim = { id: string; principal: string; month: string; scheme: string; amount: number; age: number; stage: ClaimStage; docs: number };
const seedClaims: Claim[] = [
  { id: "CL-0931", principal: "Sahyadri Foods", month: "Sep", scheme: "Glucose 10+1", amount: 58200, age: 6, stage: "Draft", docs: 2 },
  { id: "CL-0932", principal: "Kesari Masala", month: "Sep", scheme: "Haldi 12+1", amount: 29800, age: 6, stage: "Draft", docs: 3 },
  { id: "CL-0928", principal: "Godhuli Consumer", month: "Sep", scheme: "Detergent ₹6 off", amount: 86400, age: 14, stage: "Submitted", docs: 4 },
  { id: "CL-0924", principal: "Vidarbha Agro", month: "Sep", scheme: "Atta QPS", amount: 36100, age: 19, stage: "Submitted", docs: 4 },
  { id: "CL-0915", principal: "Nimbus Beverages", month: "Aug", scheme: "Summer target", amount: 56200, age: 48, stage: "Audit", docs: 3 },
  { id: "CL-0909", principal: "Sahyadri Foods", month: "Aug", scheme: "Glucose 10+1", amount: 61900, age: 52, stage: "Audit", docs: 4 },
  { id: "CL-0897", principal: "Shubhra Home Care", month: "Jul", scheme: "Floor cleaner 2+1", amount: 24300, age: 74, stage: "Audit", docs: 2 },
  { id: "CL-0902", principal: "Godhuli Consumer", month: "Aug", scheme: "Dishwash slab", amount: 19600, age: 41, stage: "Approved", docs: 4 },
  { id: "CL-0889", principal: "Kesari Masala", month: "Jul", scheme: "Masala display", amount: 14800, age: 66, stage: "Approved", docs: 4 },
  { id: "CL-0871", principal: "Vidarbha Agro", month: "Jul", scheme: "Soya margin", amount: 41200, age: 81, stage: "Credited", docs: 4 },
];

type Due = { bill: string; outlet: string; locality: string; salesman: string; amount: number; days: number; mode: "Cash" | "UPI" | "Cheque"; promise?: string };
const dues: Due[] = [
  { bill: "DRS/2627/08812", outlet: "Shree Balaji Traders", locality: "Itwari", salesman: "Imran Qureshi", amount: 86400, days: 18, mode: "Cheque", promise: "PDC dated 24 Oct" },
  { bill: "DRS/2627/08544", outlet: "Mahalaxmi Super Bazaar", locality: "Pratap Nagar", salesman: "Akash Bhagat", amount: 72800, days: 26, mode: "UPI", promise: "Friday, after GRN" },
  { bill: "DRS/2627/08120", outlet: "Shubham Sweets & Namkeen", locality: "Nandanvan", salesman: "Rupesh Nandanwar", amount: 41500, days: 47, mode: "Cash" },
  { bill: "DRS/2627/07961", outlet: "Jai Ambe Provision", locality: "Jaripatka", salesman: "Sachin Dhote", amount: 31800, days: 52, mode: "Cash", promise: "₹10k today, rest Sunday" },
  { bill: "DRS/2627/08702", outlet: "New Bombay Stores", locality: "Sadar", salesman: "Ganesh Bawankar", amount: 29600, days: 9, mode: "UPI" },
  { bill: "DRS/2627/07688", outlet: "Laxmi Narayan Provision", locality: "Kamptee Road", salesman: "Yogesh Kharabe", amount: 19700, days: 63, mode: "Cash" },
  { bill: "DRS/2627/08391", outlet: "Annapurna Bhojnalaya", locality: "Wadi", salesman: "Nitin Kolte", amount: 18800, days: 33, mode: "UPI" },
  { bill: "DRS/2627/08655", outlet: "Mohammadi Wholesale", locality: "Mahal", salesman: "Imran Qureshi", amount: 64000, days: 12, mode: "Cheque" },
  { bill: "DRS/2627/07433", outlet: "Gajanan Kirana", locality: "Koradi Road", salesman: "Rahul Gajbhiye", amount: 9600, days: 71, mode: "Cash" },
  { bill: "DRS/2627/08802", outlet: "Agrawal Kirana Stores", locality: "Dharampeth", salesman: "Deepak Sahu", amount: 38200, days: 7, mode: "UPI", promise: "Auto-pay on Saturday" },
  { bill: "DRS/2627/08277", outlet: "Vidarbha Medicos", locality: "Medical Square", salesman: "Swapnil Chaudhari", amount: 15600, days: 21, mode: "Cheque" },
  { bill: "DRS/2627/07815", outlet: "Om Sai Kirana", locality: "Hingna", salesman: "Vaibhav Tidke", amount: 11200, days: 38, mode: "Cash" },
  { bill: "DRS/2627/08718", outlet: "Fresh Mart Mini", locality: "Trimurti Nagar", salesman: "Anil Borkar", amount: 22000, days: 8, mode: "UPI" },
  { bill: "DRS/2627/07562", outlet: "Sai Medical & General", locality: "Manish Nagar", salesman: "Prashant Lanjewar", amount: 12400, days: 44, mode: "UPI" },
];

type Cheque = { no: string; bank: string; outlet: string; amount: number; deposited: string; state: "Clearing" | "Cleared" | "Bounced" };
const seedCheques: Cheque[] = [
  { no: "004418", bank: "Nagpur Nagrik Sahakari Bank", outlet: "Mohammadi Wholesale", amount: 48000, deposited: "18 Oct", state: "Clearing" },
  { no: "771203", bank: "Bank of Maharashtra, Itwari", outlet: "Shree Balaji Traders", amount: 62500, deposited: "17 Oct", state: "Cleared" },
  { no: "120944", bank: "SBI, Sadar", outlet: "New Bombay Stores", amount: 24800, deposited: "19 Oct", state: "Clearing" },
  { no: "558016", bank: "Central Bank, Mahal", outlet: "Vidarbha Medicos", amount: 15600, deposited: "16 Oct", state: "Bounced" },
  { no: "302775", bank: "Canara Bank, Dharampeth", outlet: "Agrawal Kirana Stores", amount: 21400, deposited: "19 Oct", state: "Clearing" },
  { no: "889120", bank: "Union Bank, Pratap Nagar", outlet: "Mahalaxmi Super Bazaar", amount: 54000, deposited: "15 Oct", state: "Cleared" },
];

/* ---------------- Team, agents, independence, connections ---------------- */

const team: TeamMember[] = [
  { name: "Rajesh Bhutada", role: "Owner", status: "Busy", load: 92, focus: "Credit overrides, Sahyadri claim call, cash count at 6", tasks: [{ title: "4 credit overrides", due: "11:00" }, { title: "Sahyadri ASM on Sept claims", due: "1:00" }, { title: "Count cash handover", due: "6:00" }], week: [1, 1, 1, 1, 1, 1], since: "2004" },
  { name: "Sameer Deshmukh", role: "Sales manager, 14 salesmen", status: "In field", load: 86, focus: "Riding with Rahul on Koradi Road: strike rate 58%", tasks: [{ title: "Joint working, Koradi beat", due: "now" }, { title: "Beat plan for Diwali week", due: "4:00" }, { title: "DSR review", due: "7:00" }], week: [1, 1, 1, 1, 1, 1], since: "2014" },
  { name: "Kavita Wankhede", role: "Accounts + Tally", status: "Busy", load: 78, focus: "Cheque 558016 bounced; Vidarbha Medicos ledger", tasks: [{ title: "Bounce entry + ₹350 charge", due: "12:00" }, { title: "GSTR-1 data for Oct", due: "Thu" }, { title: "Cash handover tally", due: "6:30" }], week: [1, 1, 1, 1, 1, 0], since: "2016" },
  { name: "Pandurang Thakre", role: "Godown in-charge, Kalamna", status: "On floor", load: 74, focus: "V6 top-up load; Glucose ₹5 down to 84 cases", tasks: [{ title: "Load V6 for top-ups", due: "now" }, { title: "GRN Vidarbha Agro truck", due: "3:00", done: true }, { title: "Damages for return", due: "Fri" }], week: [1, 1, 1, 1, 1, 1], since: "2009" },
  { name: "Neha Khandelwal", role: "Scheme & claims executive", status: "Busy", load: 69, focus: "Sept claims: Sahyadri and Kesari drafts need outlet bills", tasks: [{ title: "Attach 214 outlet bills to CL-0931", due: "5:00" }, { title: "Chase Shubhra on CL-0897 (74 days)", due: "2:00" }], week: [1, 1, 1, 1, 0, 1], since: "2021" },
  { name: "Amol Raut", role: "Supervisor, North + East", status: "In field", load: 64, focus: "Checking Yogesh off-beat GPS on Kamptee Road", tasks: [{ title: "Meet Yogesh at Kamptee Rd", due: "12:30" }, { title: "Outlet census, Pardi", due: "Wed" }], week: [1, 1, 0, 1, 1, 1], since: "2018" },
  { name: "Shankar Meshram", role: "Van lead, V1", status: "In field", load: 58, focus: "Central beat drops; 2 cases short on Marie", tasks: [{ title: "Drop at Mohammadi Wholesale", due: "1:00" }, { title: "Return slip by 6", due: "6:00" }], week: [1, 1, 1, 1, 1, 1], since: "2012" },
  { name: "Imran Qureshi", role: "Senior salesman, Itwari", status: "In field", load: 81, focus: "104% MTD; Shree Balaji order over limit waiting", tasks: [{ title: "Collect PDC from Shree Balaji", due: "3:00" }, { title: "Rusk rack at 3 wholesalers", due: "Fri" }], week: [1, 1, 1, 1, 1, 1], since: "2015" },
];

const agents: WorkforceAgent[] = [
  { name: "Beat Planner", role: "Builds tomorrow's beats from outlet history and dues", icon: Route, status: "Needs you", runsToday: 3, hoursSaved: 5, accuracy: 92, last: "12 min ago", skills: ["Beat plan", "Outlet frequency", "Google Maps"], schedule: "Daily 7 PM, plus on demand", inbox: [{ title: "Move 6 Nandanvan outlets to Wednesday?", detail: "They were shut today (Tuesday weekly off). Wednesday beat has room for 6 calls." }], log: ["Built 14 beats for Wednesday, 512 calls", "Added 9 collection calls from 45+ day dues", "Re-sequenced Koradi Road to cut 3.4 km"] },
  { name: "Order Taker", role: "Turns retailer WhatsApp messages into orders", icon: MessageCircle, status: "Running", runsToday: 46, hoursSaved: 4.5, accuracy: 95, last: "just now", skills: ["WhatsApp", "SKU matching", "Tally"], schedule: "On every incoming message", log: ["Booked 46 WhatsApp orders worth ₹1.9 L", "Matched 'parle wala 5 rs' to Sahyadri Glucose ₹5", "Asked Fresh Mart to confirm 12 or 21 cases"] },
  { name: "Credit Guard", role: "Holds orders that cross a retailer's limit", icon: Wallet, status: "Needs you", runsToday: 18, hoursSaved: 3, accuracy: 90, last: "6 min ago", skills: ["Credit limits", "Ageing", "Tally"], schedule: "On every order", inbox: [{ title: "4 orders over limit, ₹1.07 L", detail: "Shree Balaji has a PDC for 24 Oct; the other three have 45+ day dues." }], log: ["Held Jai Ambe order: 52-day dues", "Released Agrawal Kirana after UPI ₹21,400", "Flagged Vidarbha Medicos bounce"] },
  { name: "Scheme Claimer", role: "Builds principal claims from billed outlets", icon: BadgePercent, status: "Running", runsToday: 5, hoursSaved: 6, accuracy: 88, last: "40 min ago", skills: ["Scheme rules", "Bill matching", "Principal DMS"], schedule: "Daily 4 PM, month-end full run", log: ["Drafted CL-0931 Sahyadri ₹58,200 from 214 bills", "Found 9 outlets given 10+1 on 9 cases", "Reminded Shubhra ASM on CL-0897"] },
  { name: "Dues Collector", role: "Sends polite reminders and UPI links", icon: IndianRupee, status: "Running", runsToday: 4, hoursSaved: 3.5, accuracy: 91, last: "1 h ago", skills: ["Ageing", "UPI links", "WhatsApp"], schedule: "Daily 11 AM and 5 PM", log: ["Sent 22 reminders with UPI links", "Logged Jai Ambe promise: ₹10k today", "Escalated Gajanan Kirana, 71 days"] },
  { name: "Van Reconciler", role: "Matches van load, sales and returns every evening", icon: Truck, status: "Idle", runsToday: 1, hoursSaved: 2, accuracy: 94, last: "Yesterday 8:10 PM", skills: ["Load slips", "Returns", "Damages"], schedule: "Daily 7 PM", log: ["V3 short 2 cases Marie, signed by Sunil", "₹6,240 damages booked to Godhuli return", "All 6 vans tallied by 8:10 PM"] },
];

const independence: IndependenceData = {
  score: 37,
  history: [22, 25, 27, 29, 31, 34, 37],
  quote: "If I don't count the cash myself at 6, I don't sleep. And every order over limit still comes to my phone.",
  pillars: [
    { name: "Beats & salesmen", score: 44, note: "Beats are planned by Sameer from memory; supervisors join only when Rajesh asks.", fixes: [{ title: "Beat Planner builds the week", gain: 3 }, { title: "Strike-rate alerts to supervisors", gain: 2 }] },
    { name: "Credit & dues", score: 26, note: "Every over-limit order needs Rajesh. Average wait is 47 minutes, salesman stands at the counter.", fixes: [{ title: "Auto-release with PDC on file", gain: 4 }, { title: "Limits by outlet class", gain: 2 }] },
    { name: "Van & godown", score: 41, note: "Load slips are on paper; shortages are found the next morning.", fixes: [{ title: "Scan-to-load at Kalamna", gain: 3 }] },
    { name: "Schemes & claims", score: 23, note: "₹4.3 L of claims older than 40 days. Only Neha knows each principal's format.", fixes: [{ title: "Claims built from bills nightly", gain: 4 }, { title: "Principal claim calendar", gain: 1 }] },
    { name: "Cash handling", score: 30, note: "₹3.4 L cash comes back daily; owner counts it.", fixes: [{ title: "UPI-first collections", gain: 3 }, { title: "Kavita counts, owner spot-checks", gain: 2 }] },
    { name: "Numbers & reporting", score: 48, note: "DSR comes on WhatsApp at 9 PM as photos.", fixes: [{ title: "Live strike rate and LPC", gain: 2 }] },
    { name: "Principals & buying", score: 45, note: "Purchase orders to principals are placed by Rajesh on calls.", fixes: [{ title: "Reorder suggestions from godown", gain: 2 }] },
  ],
  ownerHours: [
    { label: "Credit calls", hours: 10 },
    { label: "Cash count", hours: 6 },
    { label: "Principal calls", hours: 8 },
    { label: "Claims chasing", hours: 5 },
    { label: "Beat fixes", hours: 6 },
    { label: "Bank", hours: 3 },
    { label: "New principals", hours: 1 },
  ],
};

const integrations: Integration[] = [
  { name: "Tally Prime", category: "Accounts", status: "Connected", detail: "Sales bills, receipts, outlet ledgers and GST, both ways.", synced: "4 min ago", records: "38,210 vouchers", mark: "T", color: "#1c4f9c" },
  { name: "WhatsApp Business", category: "Messaging", status: "Connected", detail: "Retailer orders, dues reminders, scheme broadcasts.", synced: "just now", records: "4,860 chats", mark: "W", color: "#1f9d55" },
  { name: "Salesman order app", category: "Field", status: "Syncing", detail: "14 Android phones: orders, GPS pings, outlet photos.", synced: "live", records: "312 orders today", mark: "SA", color: "#1d6b3a" },
  { name: "Google Maps", category: "Field", status: "Connected", detail: "Outlet pins and beat distances.", synced: "1 h ago", records: "2,100 pins", mark: "GM", color: "#4285f4" },
  { name: "Sahyadri DMS portal", category: "Principals", status: "Error", detail: "Password reset by principal; claim upload paused.", synced: "3 days ago", records: "—", mark: "SF", color: "#d08a1f" },
  { name: "Godhuli distributor portal", category: "Principals", status: "Connected", detail: "Secondary sales and scheme claims.", synced: "Yesterday", records: "11 claims", mark: "GC", color: "#7a5c1e" },
  { name: "PhonePe Business UPI", category: "Payments", status: "Connected", detail: "Outlet UPI payments matched to bills.", synced: "2 min ago", records: "₹1.2 L today", mark: "UP", color: "#5f259f" },
  { name: "GST portal (e-way bill)", category: "Compliance", status: "Connected", detail: "E-way bills for loads above ₹50k.", synced: "9:02 AM", records: "6 today", mark: "GST", color: "#b9472f" },
  { name: "Godown barcode scanners", category: "Warehouse", status: "Available", detail: "Scan-to-load at Kalamna instead of paper slips.", synced: "—", records: "—", mark: "BC", color: "#2e6e8e" },
  { name: "Bank statement feed", category: "Accounts", status: "Connected", detail: "Cheque clearing and deposits from 2 current accounts.", synced: "8:30 AM", records: "62 entries", mark: "BK", color: "#3d5a99" },
];

/* ============================================================
   Config
   ============================================================ */

const config: DeskConfig = {
  slug: "fmcg-route",
  company: "Deccan Route Sales",
  brand: "Deccan Route",
  city: "Nagpur",
  state: "MH",
  icon: Route,
  tagline: "Distributor for 6 principals · 14 salesmen · 2,100 outlets · 6 vans out of Kalamna",
  owner: { name: "Rajesh Bhutada", first: "Rajesh", initials: "RB", role: "Owner" },
  theme: {
    variant: "atelier",
    paper: "#f8f4e4",
    panel: "#fffdf4",
    sunk: "#f0e8cc",
    ink: "#1e2a1a",
    mute: "#69684f",
    line: "#e4d9b6",
    accent: "#1d6b3a",
    accentInk: "#ffffff",
    soft: "#e2eed9",
    ok: "#3a8a3e",
    warn: "#d08a1f",
    late: "#b9472f",
    info: "#2e6e8e",
    heading: "sans",
    radius: 14,
  },
  brief: "Orders are tracking 6% above last Tuesday, but Koradi Road is at 58% strike rate with Rahul idle for 38 minutes. Four orders are waiting on your credit call and Sahyadri's September claim is due Thursday.",
  pulse: [
    { label: "Orders today", value: "312", delta: "+6%", trend: [210, 240, 268, 281, 296, 312], module: "beat" },
    { label: "Strike rate", value: "71%", delta: "+2%", trend: [66, 68, 69, 70, 70, 71], module: "salesmen" },
    { label: "Lines per call", value: "5.6", delta: "+0.3", trend: [5.1, 5.2, 5.3, 5.4, 5.5, 5.6], module: "salesmen" },
    { label: "Collected today", value: "₹4.1 L", delta: "+9%", trend: [2.1, 2.6, 3.1, 3.5, 3.8, 4.1], tone: "ok", module: "collections" },
    { label: "Claims pending", value: "₹4.3 L", delta: "+11%", good: false, trend: [3.2, 3.4, 3.7, 3.9, 4.1, 4.3], tone: "warn", module: "schemes" },
  ],
  agenda: [
    { at: 8.5, title: "Van loading", detail: "6 vans, ₹9.6 L of stock from Kalamna", count: 6, tone: "info", module: "van" },
    { at: 9.5, title: "Beats start", detail: "14 salesmen, 508 calls planned", count: 14, tone: "accent", module: "beat" },
    { at: 11, title: "Credit overrides", detail: "4 orders over limit, ₹1.07 L", count: 4, tone: "warn", module: "outlets" },
    { at: 13, title: "Sahyadri claim call", detail: "Sept claim ₹58,200, cut-off Thursday", count: 2, tone: "warn", module: "schemes" },
    { at: 18, title: "Cash handover", detail: "₹2.96 L cash with salesmen", count: 14, tone: "late", module: "collections" },
    { at: 19.5, title: "Day close & DSR", detail: "Strike rate, LPC and tomorrow's beats", tone: "ok", module: "salesmen" },
  ],
  activity: [
    { time: "1:42 PM", text: "Order Taker booked Fresh Mart Mini, 14 lines, ₹14,860 on WhatsApp", tone: "ok" },
    { time: "1:20 PM", text: "Credit Guard held Jai Ambe Provision: 52-day dues of ₹31,800", tone: "warn" },
    { time: "12:55 PM", text: "Cheque 558016 from Vidarbha Medicos bounced, ₹15,600", tone: "late" },
    { time: "12:10 PM", text: "Rahul Gajbhiye idle at Koradi Naka for 38 minutes", tone: "late" },
    { time: "11:35 AM", text: "Vidarbha Agro truck unloaded at Kalamna: 600 bags atta", tone: "info" },
    { time: "9:40 AM", text: "Last van V3 left Kalamna; 5 of 6 on beat", tone: "neutral" },
  ],
  asks: [
    { q: "Which beats are underperforming today?", a: "Two, both in the North.\n\n• Koradi Road (Rahul Gajbhiye): 58% strike rate, idle 38 min at Koradi Naka, 15 of 38 calls done.\n• Kamptee Road (Yogesh Kharabe): 61% strike rate and his GPS is 1.2 km off beat near the bus stand.\n\nItwari wholesale (Imran) is the best at 84% and ₹6,400 average ticket. Sameer is riding with Rahul right now; Amol meets Yogesh at 12:30.", sources: ["Salesman app GPS", "Today's orders"] },
    { q: "What is waiting on my approval?", a: "4 orders over credit limit, ₹1.07 L in all:\n• Shree Balaji Traders, Itwari: ₹48,600 order, ₹1.86 L due, but PDC for ₹86,400 dated 24 Oct is on file. Safe to release.\n• Jai Ambe Provision, Jaripatka: ₹8,900, 52-day dues. Hold until ₹10k comes today.\n• Shubham Sweets, Nandanvan: ₹12,400, ₹41,500 due at 47 days. Hold.\n• New Bombay Stores, Sadar: ₹37,200, within 10% of limit and pays by UPI in 9 days. Release.", sources: ["Credit Guard", "Tally ledgers"] },
    { q: "How much cash is with salesmen right now?", a: "₹2.96 L in cash and ₹2.46 L by UPI collected so far today.\n\nLargest cash in hand: Imran ₹61,200, Mohsin ₹28,800, Ganesh ₹24,800, Akash ₹22,600. Cheques collected: 3, worth ₹1.29 L.\n\nCash handover is at 6 PM at Kalamna. Moving Itwari and Kalamna wholesalers to UPI would take about ₹90k a day out of cash.", sources: ["Collections", "PhonePe Business"] },
    { q: "Where are our scheme claims stuck?", a: "₹4.29 L is pending with principals across 9 claims.\n\n• Audit: ₹1.42 L. Sahyadri Aug ₹61,900 (52 days), Nimbus summer ₹56,200 (48 days), Shubhra Jul ₹24,300 (74 days).\n• Submitted: ₹1.23 L with Godhuli and Vidarbha Agro.\n• Draft: ₹88,000 for Sahyadri and Kesari, needs outlet bills attached before Thursday.\n\nThe Sahyadri portal login has failed for 3 days, so the Sept claim cannot be uploaded yet.", sources: ["Scheme Claimer", "Principal portals"] },
    { q: "What should go on V6 for top-ups?", a: "Salesmen reported 9 outlets asking for Sahyadri Glucose ₹5 that V3 doesn't have.\n\nSuggested V6 load: 18 cases Glucose ₹5, 6 cases Kesari Haldi, 8 cases Godhuli Dishwash, 10 cases Soya oil pouch. Value ₹43,600. Route: Kalamna → Indora → Jaripatka → Koradi Road, back by 4:30 PM.", sources: ["Van stock", "Salesman app notes"] },
    { q: "Draft a WhatsApp for Shubham Sweets on dues", a: "Draft (not sent):\n\n“Namaskar Shubham bhau, Deccan Route Sales here. Bill DRS/2627/08120 of ₹41,500 is now 47 days old. Rupesh will come on Thursday's beat; you can also pay on the UPI link below and he will give you the receipt. Your Diwali order is ready to dispatch once this is cleared. Dhanyavaad! — Kavita, Accounts”", sources: ["Tally", "Collections"] },
  ],
  run: {
    label: "Runs at 1 PM and 7 PM. You can also run it now.",
    title: "Beat Watcher",
    steps: [
      { text: "Read GPS and orders from 14 salesman phones", result: "232 of 508 calls done, 2 beats off pace" },
      { text: "Compare each beat against its last 4 Tuesdays", result: "Koradi Road -18% calls, Kamptee Road -11%" },
      { text: "Check van stock against outlet asks", result: "Glucose ₹5 out on V3, 9 outlets asked" },
      { text: "Check orders against credit limits and dues", result: "4 held, 2 safe to release" },
      { text: "Draft nudges, top-up load and tomorrow's fixes", result: "2 nudges, 1 V6 load, 6 outlets moved" },
    ],
    outcome: "Release Shree Balaji and New Bombay now (₹85,800 of orders). Send V6 north with Glucose ₹5. Nudge Rahul and Yogesh, and move 6 shut Nandanvan outlets to Wednesday.",
    actions: ["Release 2 credit holds", "Send V6 top-up north", "Nudge Rahul and Yogesh", "Move 6 outlets to Wednesday"],
  },
};

/* ============================================================
   Desk
   ============================================================ */

const statusTone: Record<OutletState, Tone> = { ordered: "ok", visited: "warn", skipped: "late", pending: "neutral" };
const statusLabel: Record<OutletState, string> = { ordered: "Ordered", visited: "No order", skipped: "Skipped", pending: "Planned" };

export default function FmcgRouteDesk() {
  const [overrides, setOverrides] = React.useState(4);
  const [claims, setClaims] = React.useState(seedClaims);
  const openClaims = claims.filter((c) => c.stage !== "Credited").length;

  const modules: DeskModule[] = [
    {
      id: "beat",
      label: "Beat route",
      title: "Beat route",
      blurb: "Every salesman on today's beat through Nagpur, every outlet call and every order as it lands",
      icon: Route,
      notes: ["Each coloured line is one salesman's beat; the solid part is what he has walked, the dashed part is still to go.", "Dots are outlets: green ordered, amber visited with no order, red skipped. The counter top-left is live.", "Click any salesman (on the map or the list) for his beat sheet."],
      render: () => <BeatHome overrides={overrides} onOverride={setOverrides} />,
    },
    { id: "salesmen", label: "Salesmen", title: "Salesmen", blurb: "Calls, productive calls, strike rate and lines per call for all 14, live from their phones", icon: Users, render: () => <SalesmenTab /> },
    { id: "outlets", label: "Outlets", count: overrides, title: "Outlets", blurb: "2,100 retailers: credit limits, dues, last order and who calls on them", icon: Store, render: () => <OutletsTab onOverride={setOverrides} /> },
    { id: "van", label: "Van stock", title: "Van stock & loading", blurb: "What went out on each van, what sold, what's coming back and what the godown is short of", icon: Truck, render: () => <VanTab /> },
    { id: "schemes", label: "Schemes", count: openClaims, title: "Schemes & claims", blurb: "Principal schemes running in the market and every claim until the credit note lands", icon: BadgePercent, render: () => <SchemesTab claims={claims} setClaims={setClaims} /> },
    { id: "collections", label: "Collections", count: dues.filter((d) => d.days > 30).length, title: "Collections", blurb: "Cash, UPI and cheques from the market, ageing by outlet and today's cash handover", icon: Wallet, render: () => <CollectionsTab /> },
    { id: "team", label: "People", title: "People", blurb: "Sales, godown, accounts and claims: who is carrying what today", icon: Users, render: () => <PeopleModule members={team} /> },
    { id: "agents", label: "Agents", title: "Agents", blurb: "Six AI agents doing the follow-ups so Rajesh doesn't have to", icon: Timer, render: () => <AgentsModule agents={agents} /> },
    { id: "independence", label: "Independence", title: "Owner independence", blurb: "How much of Deccan Route runs without Rajesh on the phone", icon: GaugeIcon, render: () => <IndependenceModule data={independence} /> },
    { id: "connections", label: "Connections", title: "Connections", blurb: "Tally, WhatsApp, the salesman app, UPI and the principal portals", icon: Send, render: () => <ConnectionsModule items={integrations} /> },
  ];

  return (
    <LiveProvider>
      <DeskShell config={config} modules={modules} />
    </LiveProvider>
  );
}

/* ---------------- Home: beat route ---------------- */

function BeatHome({ overrides, onOverride }: { overrides: number; onOverride: React.Dispatch<React.SetStateAction<number>> }) {
  const all = useBeats();
  const [open, setOpen] = React.useState<string | null>(null);
  const done = all.reduce((a, x) => a + x.st.done, 0);
  const planned = all.reduce((a, x) => a + x.b.calls, 0);
  const ordered = all.reduce((a, x) => a + x.st.ordered, 0);
  const value = all.reduce((a, x) => a + x.st.value, 0);
  const lines = all.reduce((a, x) => a + x.st.lines, 0);
  const strike = done ? Math.round((ordered / done) * 100) : 0;

  return (
    <div className="space-y-5">
      <BeatMapPanel onPick={setOpen} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Calls done" value={`${done} / ${planned}`} delta="+4%" hint="vs last Tuesday" icon={MapPin} trend={[40, 92, 141, 180, 212, done]} />
        <Stat label="Strike rate" value={`${strike}%`} delta="+2%" hint="productive ÷ calls" icon={CheckCheck} tone="ok" trend={[66, 68, 69, 70, 70, strike]} />
        <Stat label="Lines per call" value={(ordered ? lines / ordered : 0).toFixed(1)} delta="+0.3" hint="target 6.0" icon={ShoppingBasket} trend={[5.1, 5.2, 5.3, 5.4, 5.5, ordered ? lines / ordered : 0]} />
        <Stat label="Order value today" value={inr(value, { compact: true })} delta="+6%" hint={`target ${inr(salesmen.reduce((a, s) => a + s.target, 0), { compact: true })}`} icon={IndianRupee} tone="warn" trend={[1.1, 2.4, 3.6, 4.5, 5.2, value / 1e5]} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.1fr_1fr_1.15fr]">
        <Panel icon={Timer} title="Orders by hour" sub="Today against last Tuesday, all beats">
          <AreaChart
            labels={["10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM"]}
            series={[
              { name: "Today", data: [34, 61, 72, 58, 49, Math.max(20, ordered - 274)], tone: "accent" },
              { name: "Last Tuesday", data: [30, 55, 70, 57, 44, 38], tone: "warn", dashed: true },
            ]}
            height={190}
          />
        </Panel>
        <Exceptions onPick={setOpen} />
        <Panel icon={Wallet} title="Credit calls waiting" sub="Orders the salesman can't book until you decide" action={<Pill tone="warn" mono>{overrides} open</Pill>}>
          <ApprovalQueue
            approveLabel="Release"
            items={[
              { id: "co1", title: "Shree Balaji Traders", sub: "Itwari · ₹1.86 L due · PDC ₹86,400 on 24 Oct", amount: inr(48600), meta: "Imran", tone: "ok" },
              { id: "co2", title: "New Bombay Stores", sub: "Sadar · 9 days, pays by UPI", amount: inr(37200), meta: "Ganesh", tone: "ok" },
              { id: "co3", title: "Shubham Sweets", sub: "Nandanvan · ₹41,500 at 47 days", amount: inr(12400), meta: "Rupesh", tone: "late" },
              { id: "co4", title: "Jai Ambe Provision", sub: "Jaripatka · 52 days, ₹10k promised", amount: inr(8900), meta: "Sachin", tone: "late" },
            ]}
            onDecide={(_, d) => onOverride((n) => Math.max(0, n + (d ? -1 : 1)))}
          />
        </Panel>
      </div>
      <BeatSheet id={open} onClose={() => setOpen(null)} />
    </div>
  );
}

const ZONES = ["All", "North", "Central", "East", "South", "West"] as const;

function BeatMapPanel({ onPick }: { onPick: (id: string) => void }) {
  const live = useLive();
  const all = useBeats();
  const [zone, setZone] = React.useState<(typeof ZONES)[number]>("All");
  const [hover, setHover] = React.useState<string | null>(null);
  const [dots, setDots] = React.useState(true);
  const ordered = all.reduce((a, x) => a + x.st.ordered, 0);
  const value = all.reduce((a, x) => a + x.st.value, 0);
  const latest = all
    .map((x) => {
      const o = [...x.b.outlets].reverse().find((v) => v.at <= x.p && v.fate === "ordered");
      return o ? { o, b: x.b, ago: (x.p - o.at) / x.b.speed } : null;
    })
    .filter((v): v is NonNullable<typeof v> => !!v)
    .sort((a, c) => a.ago - c.ago)[0];
  const focus = (b: Beat) => (hover ? hover === b.id : zone === "All" || zone === b.zone);

  return (
    <Panel
      live
      title="Beat route · Nagpur"
      sub={`${salesmen.length} salesmen on beat · ${all.filter((x) => x.p >= 1).length} beats closed · godown at Kalamna`}
      bodyClassName="p-0"
      action={
        <>
          <Segmented size="sm" options={ZONES} value={zone} onChange={setZone} />
          <IconBtn icon={MapPin} label={dots ? "Hide outlets" : "Show outlets"} active={dots} onClick={() => setDots((d) => !d)} />
          <IconBtn icon={live.playing ? Pause : Play} label={live.playing ? "Pause" : "Play"} onClick={() => live.setPlaying(!live.playing)} />
          <Segmented size="sm" options={["1×", "4×"] as const} value={live.rate} onChange={live.setRate} />
        </>
      }
    >
      <div className="grid border-t border-d-line xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="relative min-w-0 overflow-hidden bg-[color-mix(in_oklab,var(--d-sunk)_45%,var(--d-panel))]">
          <svg viewBox="0 0 1000 620" className="block h-auto w-full select-none">
            <defs>
              <pattern id="fmcg-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M40 0H0V40" fill="none" stroke="var(--d-line)" strokeWidth="0.6" opacity="0.7" />
              </pattern>
            </defs>
            <rect width="1000" height="620" fill="url(#fmcg-grid)" />
            {/* ring road and highways */}
            <ellipse cx="492" cy="338" rx="420" ry="268" fill="none" stroke="var(--d-warn)" strokeOpacity="0.35" strokeWidth="5" strokeDasharray="2 10" strokeLinecap="round" />
            {[
              { to: [40, 236], label: "Amravati Rd" },
              { to: [200, 30], label: "Katol Rd" },
              { to: [520, 18], label: "Koradi Rd" },
              { to: [800, 40], label: "Kamptee Rd" },
              { to: [985, 330], label: "Bhandara Rd" },
              { to: [800, 610], label: "Umred Rd" },
              { to: [470, 612], label: "Wardha Rd" },
              { to: [40, 540], label: "Hingna Rd" },
            ].map((r) => (
              <g key={r.label}>
                <line x1={486} y1={330} x2={r.to[0]} y2={r.to[1]} stroke="var(--d-mute)" strokeOpacity="0.22" strokeWidth="7" strokeLinecap="round" />
                <text x={r.to[0]} y={r.to[1]} dy={r.to[1] < 60 ? 14 : -6} textAnchor={r.to[0] < 100 ? "start" : r.to[0] > 900 ? "end" : "middle"} className="fill-d-mute font-mono" fontSize="10" opacity="0.8">
                  {r.label}
                </text>
              </g>
            ))}
            {/* Nag river and lakes */}
            <path d="M270 356 C 340 392, 420 374, 486 368 S 600 404, 664 398 S 780 372, 870 410 S 960 436, 1000 430" fill="none" stroke="var(--d-info)" strokeOpacity="0.45" strokeWidth="4" strokeLinecap="round" />
            <text x="880" y="432" className="fill-d-info font-mono" fontSize="10" opacity="0.8">Nag river</text>
            <ellipse cx="262" cy="362" rx="30" ry="17" fill="var(--d-info)" fillOpacity="0.18" stroke="var(--d-info)" strokeOpacity="0.35" />
            <ellipse cx="350" cy="262" rx="15" ry="11" fill="var(--d-info)" fillOpacity="0.18" stroke="var(--d-info)" strokeOpacity="0.35" />
            <ellipse cx="290" cy="86" rx="56" ry="26" fill="var(--d-info)" fillOpacity="0.18" stroke="var(--d-info)" strokeOpacity="0.35" />
            {/* zero mile */}
            <circle cx="486" cy="330" r="4" fill="var(--d-ink)" opacity="0.5" />
            {Object.entries(LOC).map(([name, [x, y]]) => (
              <text key={name} x={x} y={y - 12} textAnchor="middle" className="fill-d-ink" fontSize="10.5" fontWeight="600" opacity="0.5" stroke="var(--d-panel)" strokeWidth="3" strokeOpacity="0.8" style={{ letterSpacing: "0.04em", paintOrder: "stroke" }}>
                {name.toUpperCase()}
              </text>
            ))}
            {/* godown */}
            <g transform="translate(744 276)">
              <rect x="-11" y="-11" width="22" height="22" rx="5" fill="var(--d-ink)" />
              <path d="M-6 3 V-2 L0 -6 L6 -2 V3 Z" fill="var(--d-panel)" />
              <text x="0" y="28" textAnchor="middle" className="fill-d-ink" fontSize="10.5" fontWeight="700" stroke="var(--d-panel)" strokeWidth="3" style={{ paintOrder: "stroke" }}>
                Deccan godown
              </text>
            </g>
            {/* beats */}
            {all.map(({ b, p }) => {
              const on = focus(b);
              const here = locate(b.pts, b.cum, b.len, p);
              const walked = [...b.pts.slice(0, here.k + 1), [here.x, here.y] as Pt];
              return (
                <g key={b.id} opacity={on ? 1 : 0.12} style={{ transition: "opacity 300ms" }}>
                  <path d={ptsD(b.pts)} fill="none" stroke={b.color} strokeOpacity="0.55" strokeWidth="2.5" className="desk-flow" strokeLinecap="round" strokeLinejoin="round" />
                  <path d={ptsD(walked)} fill="none" stroke={b.color} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                  {dots &&
                    b.outlets.map((o) => {
                      const s = stateOf(o, p);
                      return s === "pending" ? (
                        <circle key={o.key} cx={o.x} cy={o.y} r="3" fill="var(--d-panel)" stroke={b.color} strokeOpacity="0.6" strokeWidth="1.2" />
                      ) : s === "skipped" ? (
                        <g key={o.key} transform={`translate(${o.x} ${o.y})`}>
                          <circle r="3.6" fill="var(--d-panel)" stroke="var(--d-late)" strokeWidth="1.4" />
                          <path d="M-2 -2 L2 2 M2 -2 L-2 2" stroke="var(--d-late)" strokeWidth="1.2" />
                        </g>
                      ) : (
                        <circle key={o.key} cx={o.x} cy={o.y} r={s === "ordered" ? 4 : 3.4} fill={s === "ordered" ? "var(--d-ok)" : "var(--d-warn)"} stroke="var(--d-panel)" strokeWidth="1">
                          <title>{`${o.name}, ${o.locality} · ${s === "ordered" ? inr(o.value) : o.reason}`}</title>
                        </circle>
                      );
                    })}
                </g>
              );
            })}
            {/* salesmen */}
            {all.map(({ b, p }) => {
              const on = focus(b);
              const here = locate(b.pts, b.cum, b.len, p);
              const stuck = !!b.idle && !(b.id in live.resumed);
              return (
                <g
                  key={`m-${b.id}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => onPick(b.id)}
                  onKeyDown={(e) => e.key === "Enter" && onPick(b.id)}
                  onMouseEnter={() => setHover(b.id)}
                  onMouseLeave={() => setHover(null)}
                  className="cursor-pointer outline-none"
                  opacity={on ? 1 : 0.25}
                  style={{ transform: `translate(${here.x.toFixed(1)}px, ${here.y.toFixed(1)}px)`, transition: "transform 1.4s linear, opacity 300ms" }}
                >
                  {(stuck || b.offBeat) && (
                    <circle r="17" fill="none" stroke={stuck ? "var(--d-late)" : "var(--d-warn)"} strokeWidth="2">
                      <animate attributeName="r" values="12;22;12" dur="1.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.9;0;0.9" dur="1.8s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle r="12" fill={b.color} stroke="var(--d-panel)" strokeWidth="2.5" />
                  <text textAnchor="middle" dy="3.6" fontSize="9.5" fontWeight="700" fill="#fff">
                    {b.name.split(" ").map((w) => w[0]).join("")}
                  </text>
                  {p >= 1 && <circle cx="9" cy="-9" r="4.5" fill="var(--d-ok)" stroke="var(--d-panel)" strokeWidth="1.5" />}
                </g>
              );
            })}
          </svg>
          {/* live counter */}
          <div className="pointer-events-none absolute bottom-3 right-4 rounded-[12px] border border-d-line bg-d-panel/95 px-4 py-3 shadow-[0_12px_30px_-20px_rgba(0,0,0,0.5)] backdrop-blur">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-d-mute">
              <span className="desk-ping h-1.5 w-1.5 rounded-full bg-d-ok" /> Orders punched today
            </p>
            <p className="mt-1 flex items-baseline gap-2">
              <span key={ordered} className="desk-rise desk-h tnum text-[34px] font-bold leading-none text-d-accent">
                {num(ordered + 80)}
              </span>
              <span className="tnum font-mono text-[13px] font-semibold">{inr(value + 214000, { compact: true })}</span>
            </p>
            <p className="mt-0.5 text-[11px] text-d-mute">incl. 80 WhatsApp orders · ₹2.1 L</p>
            {latest && (
              <p className="mt-2 max-w-[250px] truncate border-t border-d-line pt-2 text-[12px]">
                <span className="font-semibold" style={{ color: latest.b.color }}>
                  {latest.b.name.split(" ")[0]}
                </span>{" "}
                · {latest.o.name}, {latest.o.locality} · <span className="tnum font-mono">{inr(latest.o.value)}</span>
              </p>
            )}
          </div>
          <div className="absolute bottom-3 left-4 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-[10px] bg-d-panel/90 px-3 py-1.5 text-[11.5px] text-d-mute backdrop-blur">
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-d-ok" /> ordered</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-d-warn" /> visited, no order</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border-[1.5px] border-d-late" /> skipped</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border border-d-mute" /> still to call</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-[3px] w-5 rounded-full bg-d-accent" /> walked</span>
          </div>
        </div>
        <aside className="border-t border-d-line xl:border-l xl:border-t-0">
          <div className="grid grid-cols-5 border-b border-d-line">
            {(["North", "Central", "East", "South", "West"] as const).map((z) => {
              const list = all.filter((x) => x.b.zone === z);
              const o = list.reduce((a, x) => a + x.st.ordered, 0);
              const d = list.reduce((a, x) => a + x.st.done, 0);
              return (
                <button key={z} type="button" onClick={() => setZone(zone === z ? "All" : z)} className={`border-r border-d-line px-1 py-2.5 text-center last:border-r-0 ${zone === z ? "bg-d-soft" : "hover:bg-d-sunk"}`}>
                  <p className="text-[10.5px] font-semibold uppercase tracking-wide text-d-mute">{z}</p>
                  <p className="tnum font-mono text-[15px] font-semibold">{o}</p>
                  <p className="tnum font-mono text-[10px] text-d-mute">{d ? Math.round((o / d) * 100) : 0}% SR</p>
                </button>
              );
            })}
          </div>
          <ul className="desk-scroll max-h-[420px] divide-y xl:max-h-[612px] divide-d-line overflow-y-auto">
            {all
              .filter((x) => zone === "All" || x.b.zone === zone)
              .map(({ b, p, st }) => {
                const stuck = !!b.idle && !(b.id in live.resumed);
                return (
                  <li key={b.id}>
                    <button type="button" onClick={() => onPick(b.id)} onMouseEnter={() => setHover(b.id)} onMouseLeave={() => setHover(null)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-d-sunk">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: b.color }}>
                        {b.name.split(" ").map((w) => w[0]).join("")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-[13px] font-semibold">{b.name}</span>
                          <span className="tnum shrink-0 font-mono text-[11.5px] text-d-mute">
                            {st.done}/{b.calls}
                          </span>
                        </span>
                        <span className="block truncate text-[11.5px] text-d-mute">
                          {b.beat} · {st.ordered} orders · {inr(st.value, { compact: true })}
                        </span>
                        <span className="mt-1 flex items-center gap-2">
                          <Meter value={p * 100} tone={stuck ? "late" : b.offBeat ? "warn" : "accent"} height={4} />
                          {stuck ? <Pill tone="late">Idle</Pill> : b.offBeat ? <Pill tone="warn">Off beat</Pill> : p >= 1 ? <Pill tone="ok">Closed</Pill> : <span className="tnum shrink-0 font-mono text-[10.5px] text-d-mute">{st.strike}%</span>}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
          </ul>
        </aside>
      </div>
    </Panel>
  );
}

function Exceptions({ onPick }: { onPick: (id: string) => void }) {
  const desk = useDesk();
  const live = useLive();
  const [done, setDone] = React.useState<Record<string, string>>({});
  const items = [
    { id: "e1", tone: "late" as Tone, title: "Rahul idle 38 min at Koradi Naka", sub: "No order punched since 12:02 PM", who: "S04", act: "Nudge", run: () => live.resume("S04"), log: "Nudge sent to Rahul Gajbhiye on WhatsApp; he is moving again" },
    { id: "e2", tone: "warn" as Tone, title: "Yogesh 1.2 km off his Kamptee Road beat", sub: "Near the bus stand, 3 outlets not called", who: "S13", act: "Ask reason", log: "Asked Yogesh Kharabe why he is off beat" },
    { id: "e3", tone: "warn" as Tone, title: "6 Nandanvan outlets shut today", sub: "Tuesday weekly off; Wednesday beat has room", who: "S10", act: "Move to Wed", log: "6 Nandanvan outlets moved to Wednesday's beat" },
    { id: "e4", tone: "info" as Tone, title: "Glucose ₹5 out on van V3", sub: "9 North outlets asked for it", who: "S03", act: "Send V6", log: "V6 top-up with 18 cases Glucose ₹5 sent north" },
  ];
  return (
    <Panel icon={AlertTriangle} title="Beat exceptions" sub="What the Beat Watcher spotted in the last hour">
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.id} className={`flex items-center gap-3 rounded-[12px] border border-d-line px-3 py-2.5 transition-opacity ${done[it.id] ? "opacity-55" : ""}`}>
            <span className="h-8 w-1 shrink-0 rounded-full" style={{ background: `var(--d-${it.tone})` }} />
            <button type="button" onClick={() => onPick(it.who)} className="min-w-0 flex-1 text-left">
              <p className="truncate text-[13px] font-semibold">{it.title}</p>
              <p className="truncate text-[11.5px] text-d-mute">{it.sub}</p>
            </button>
            {done[it.id] ? (
              <Pill tone="ok">{done[it.id]}</Pill>
            ) : (
              <Btn
                size="sm"
                variant="soft"
                onClick={() => {
                  it.run?.();
                  setDone((d) => ({ ...d, [it.id]: "Done" }));
                  toast.success(it.act, { description: it.log });
                  desk.log(it.log, it.tone === "late" ? "warn" : "info");
                }}
              >
                {it.act}
              </Btn>
            )}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function BeatSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const desk = useDesk();
  const live = useLive();
  const [show, setShow] = React.useState<"All" | "Ordered" | "No order" | "Skipped" | "Planned">("All");
  const b = beats.find((x) => x.id === id) ?? null;
  const p = b ? progressOf(b, live) : 0;
  const st = b ? statsOf(b, p) : null;
  const list = b ? b.outlets.filter((o) => show === "All" || statusLabel[stateOf(o, p)] === show) : [];
  return (
    <Sheet
      open={!!b}
      onOpenChange={(o) => !o && onClose()}
      width={520}
      eyebrow={b ? `${b.id} · ${b.zone} zone · van ${b.van}` : ""}
      title={b ? `${b.name}'s beat` : ""}
      sub={b ? `${b.beat} · ${b.stops.join(" → ")}` : ""}
      footer={
        <>
          <Btn
            icon={Phone}
            onClick={() => {
              toast(`Calling ${b?.name}`, { description: b?.phone });
            }}
          >
            Call
          </Btn>
          <Btn
            icon={MessageCircle}
            onClick={() => {
              if (!b) return;
              live.resume(b.id);
              toast.success("Nudge sent on WhatsApp", { description: `${b.name}: ${b.calls - (st?.done ?? 0)} calls left, focus on Diwali schemes` });
              desk.log(`Nudge sent to ${b.name}`, "info");
            }}
          >
            WhatsApp nudge
          </Btn>
          <Btn variant="solid" onClick={onClose}>
            Done
          </Btn>
        </>
      }
    >
      {b && st && (
        <div className="space-y-5">
          {(b.idle || b.offBeat) && (
            <p className="flex items-start gap-2 rounded-[12px] border border-d-line bg-d-sunk px-3 py-2.5 text-[13px]">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-d-late" />
              {b.id in live.resumed ? "Nudged, moving again." : (b.idle ?? b.offBeat)}
            </p>
          )}
          <div className="grid grid-cols-4 gap-2">
            {[
              { k: "Calls", v: `${st.done}/${b.calls}` },
              { k: "Orders", v: st.ordered },
              { k: "Strike", v: `${st.strike}%` },
              { k: "LPC", v: st.lpc.toFixed(1) },
            ].map((x) => (
              <div key={x.k} className="rounded-[12px] bg-d-sunk px-3 py-2">
                <p className="text-[11px] text-d-mute">{x.k}</p>
                <p className="tnum font-mono text-[18px] font-semibold">{x.v}</p>
              </div>
            ))}
          </div>
          <div>
            <div className="mb-1.5 flex justify-between text-[12px] text-d-mute">
              <span>Order value {inr(st.value)}</span>
              <span>target {inr(b.target)}</span>
            </div>
            <Meter value={st.value} max={b.target} tone={st.value / b.target > 0.6 ? "ok" : "warn"} />
          </div>
          <KV
            cols={3}
            items={[
              { k: "Cash in hand", v: inr(b.cash) },
              { k: "UPI collected", v: inr(b.upi) },
              { k: "Month to date", v: <span className={b.mtd >= 95 ? "text-d-ok" : b.mtd < 80 ? "text-d-late" : ""}>{b.mtd}%</span> },
            ]}
          />
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[12px] font-medium text-d-mute">Outlets on today&apos;s beat</p>
              <Segmented size="sm" options={["All", "Ordered", "No order", "Skipped", "Planned"] as const} value={show} onChange={setShow} />
            </div>
            <ul className="space-y-1">
              {list.map((o) => {
                const s = stateOf(o, p);
                return (
                  <li key={o.key} className="flex items-center gap-3 rounded-[10px] border border-d-line px-3 py-2">
                    <span className="tnum w-5 font-mono text-[11px] text-d-mute">{b.outlets.indexOf(o) + 1}</span>
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s === "pending" ? "transparent" : `var(--d-${statusTone[s] === "neutral" ? "mute" : statusTone[s]})`, boxShadow: s === "pending" ? "inset 0 0 0 1.5px var(--d-mute)" : undefined }} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium">{o.name}</span>
                      <span className="block truncate text-[11.5px] text-d-mute">
                        {o.locality} · {s === "ordered" ? `${o.lines} lines` : s === "pending" ? "planned" : o.reason}
                      </span>
                    </span>
                    {s === "ordered" ? <span className="tnum font-mono text-[12.5px] font-semibold">{inr(o.value)}</span> : <Pill tone={statusTone[s]}>{statusLabel[s]}</Pill>}
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

/* ---------------- Salesmen ---------------- */

const beatHours = ["9", "10", "11", "12", "1", "2", "3", "4", "5"];

function SalesmenTab() {
  const desk = useDesk();
  const all = useBeats();
  const [open, setOpen] = React.useState<string | null>(null);
  const [focusSent, setFocusSent] = React.useState<Set<string>>(new Set());
  const done = all.reduce((a, x) => a + x.st.done, 0);
  const ordered = all.reduce((a, x) => a + x.st.ordered, 0);
  const lines = all.reduce((a, x) => a + x.st.lines, 0);
  const value = all.reduce((a, x) => a + x.st.value, 0);
  const target = salesmen.reduce((a, s) => a + s.target, 0);
  const rows = all.map((x) => ({ ...x.st, b: x.b, p: x.p }));
  const coach = [...rows].sort((a, c) => a.lpc - c.lpc).slice(0, 4);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Productive calls" value={`${ordered} / ${done}`} delta="+5%" hint="calls with an order" icon={CheckCheck} trend={[150, 162, 171, 168, 180, ordered]} />
        <Stat label="Strike rate" value={`${done ? Math.round((ordered / done) * 100) : 0}%`} delta="+2%" hint="best: Imran 84%" icon={GaugeIcon} tone="ok" trend={[66, 68, 67, 69, 70, 71]} />
        <Stat label="Lines per call" value={(ordered ? lines / ordered : 0).toFixed(1)} delta="+0.3" hint="target 6.0" icon={ShoppingBasket} trend={[5.0, 5.2, 5.1, 5.4, 5.5, 5.6]} />
        <Stat label="Sales vs target" value={`${Math.round((value / target) * 100)}%`} hint={`${inr(value, { compact: true })} of ${inr(target, { compact: true })}`} icon={IndianRupee} tone="warn" trend={[12, 26, 38, 47, 55, Math.round((value / target) * 100)]} />
      </div>
      <Panel title="All salesmen, live" sub="Click a row for the beat sheet. Numbers update as orders land from the app.">
        <DataTable
          rows={rows}
          rowKey={(r) => r.b.id}
          search={(r) => `${r.b.name} ${r.b.beat} ${r.b.zone}`}
          searchPlaceholder="Search salesman or beat"
          filter={{ get: (r) => r.b.zone, options: ["North", "Central", "East", "South", "West"] }}
          onRow={(r) => setOpen(r.b.id)}
          bulk={[{ label: "Send DSR on WhatsApp", run: (k) => { toast.success(`DSR sent to ${k.length} salesmen`); desk.log(`Daily sales report sent to ${k.length} salesmen`); } }]}
          columns={[
            {
              key: "name",
              label: "Salesman",
              render: (r) => (
                <span className="flex items-center gap-2.5">
                  <span className="h-7 w-1.5 rounded-full" style={{ background: r.b.color }} />
                  <span className="min-w-0">
                    <span className="block font-semibold">{r.b.name}</span>
                    <span className="block text-[11.5px] text-d-mute">{r.b.beat}</span>
                  </span>
                </span>
              ),
              sort: (r) => r.b.name,
            },
            { key: "calls", label: "Calls", align: "right", render: (r) => <span className="tnum font-mono">{r.done}/{r.b.calls}</span>, sort: (r) => r.done },
            { key: "prod", label: "Productive", align: "right", render: (r) => <span className="tnum font-mono">{r.ordered}</span>, sort: (r) => r.ordered },
            { key: "sr", label: "Strike", align: "right", render: (r) => <span className="tnum font-mono" style={{ color: r.strike >= 75 ? "var(--d-ok)" : r.strike < 62 ? "var(--d-late)" : undefined }}>{r.strike}%</span>, sort: (r) => r.strike },
            { key: "lpc", label: "LPC", align: "right", render: (r) => <span className="tnum font-mono">{r.lpc.toFixed(1)}</span>, sort: (r) => r.lpc },
            { key: "val", label: "Value", align: "right", render: (r) => <span className="tnum font-mono">{inr(r.value, { compact: true })}</span>, sort: (r) => r.value },
            {
              key: "tgt",
              label: "vs target",
              render: (r) => (
                <span className="flex min-w-[110px] items-center gap-2">
                  <Meter value={r.value} max={r.b.target} tone={r.value / r.b.target > 0.6 ? "ok" : "warn"} />
                  <span className="tnum font-mono text-[11px] text-d-mute">{Math.round((r.value / r.b.target) * 100)}%</span>
                </span>
              ),
              sort: (r) => r.value / r.b.target,
            },
            { key: "mtd", label: "MTD", align: "right", render: (r) => <Pill tone={r.b.mtd >= 95 ? "ok" : r.b.mtd < 80 ? "late" : "neutral"} mono>{r.b.mtd}%</Pill>, sort: (r) => r.b.mtd },
          ]}
        />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Calls by hour" sub="From app punches. Gaps after 1 PM are lunch and the wholesale rush in Itwari.">
          <HeatGrid
            rows={salesmen.map((s) => s.name.split(" ")[0])}
            cols={beatHours}
            values={salesmen.map((s, i) => beatHours.map((_, h) => (h === 4 ? 1 + Math.round(hash(i, h) * 2) : Math.round(3 + hash(i, h + 9) * 4 - (s.idle && h >= 3 ? 3 : 0)))))}
            onCell={(r, c) => toast(`${salesmen[r].name} at ${beatHours[c]}:00`, { description: `${salesmen[r].beat} · ${salesmen[r].zone}` })}
          />
        </Panel>
        <Panel title="Incentive slab" sub="₹1,500 at 95% of monthly target, ₹3,000 at 105%">
          <ul className="space-y-3">
            {[...salesmen].sort((a, c) => c.mtd - a.mtd).slice(0, 8).map((s) => (
              <li key={s.id} className="flex items-center gap-3">
                <Avatar name={s.name} size={28} tone={s.mtd >= 95 ? "ok" : s.mtd < 80 ? "late" : "accent"} />
                <span className="w-[150px] shrink-0 truncate text-[13px] font-medium">{s.name}</span>
                <Meter value={s.mtd} max={110} tone={s.mtd >= 105 ? "ok" : s.mtd >= 95 ? "accent" : "warn"} />
                <span className="tnum w-12 text-right font-mono text-[12px]">{s.mtd}%</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <Panel title="Coaching: lowest lines per call" sub="These salesmen sell 1–2 SKUs per outlet. Give them a focus list for tomorrow.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {coach.map((r) => (
            <article key={r.b.id} className="rounded-[14px] border border-d-line p-4">
              <p className="flex items-center justify-between">
                <span className="font-semibold">{r.b.name}</span>
                <Pill tone="warn" mono>{r.lpc.toFixed(1)} LPC</Pill>
              </p>
              <p className="mt-1 text-[12px] text-d-mute">{r.b.beat}</p>
              <p className="mt-3 text-[12.5px] leading-relaxed">Focus: Kesari Haldi 200g, Godhuli Dishwash, Sahyadri Rusk. Outlets on his beat already buy these from wholesalers.</p>
              {focusSent.has(r.b.id) ? (
                <Pill tone="ok" className="mt-3">Focus list sent</Pill>
              ) : (
                <Btn
                  size="sm"
                  variant="soft"
                  icon={Smartphone}
                  className="mt-3"
                  onClick={() => {
                    setFocusSent((s) => new Set(s).add(r.b.id));
                    toast.success("Focus SKUs pushed to the app", { description: r.b.name });
                    desk.log(`Focus SKU list sent to ${r.b.name}`);
                  }}
                >
                  Push focus list
                </Btn>
              )}
            </article>
          ))}
        </div>
      </Panel>
      <BeatSheet id={open} onClose={() => setOpen(null)} />
    </div>
  );
}

/* ---------------- Outlets ---------------- */

const outletTypes: OutletType[] = ["Kirana", "Wholesaler", "Medical", "Pan shop", "Supermarket", "Hotel / canteen", "Sweet mart"];

function OutletsTab({ onOverride }: { onOverride: React.Dispatch<React.SetStateAction<number>> }) {
  const desk = useDesk();
  const [outlets, setOutlets] = React.useState(seedOutlets);
  const [open, setOpen] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);
  const [limitFor, setLimitFor] = React.useState<Outlet | null>(null);
  const [limit, setLimit] = React.useState("");
  const [added, setAdded] = React.useState<Set<string>>(new Set());
  const o = outlets.find((x) => x.id === open) ?? null;
  const update = (id: string, patch: Partial<Outlet>) => setOutlets((cur) => cur.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const over = outlets.filter((x) => x.due > x.limit);
  const quiet = [
    { name: "Gajanan Kirana", where: "Koradi Road", days: 27, avg: 2300, who: "Rahul" },
    { name: "Laxmi Narayan Provision", where: "Kamptee Road", days: 33, avg: 2900, who: "Yogesh" },
    { name: "Gurukrupa Pan & Cold Drinks", where: "Besa", days: 22, avg: 1400, who: "Prashant" },
    { name: "Swami Samarth Stores", where: "Hudkeshwar", days: 25, avg: 3100, who: "Swapnil" },
    { name: "Noor General Stores", where: "Mominpura", days: 41, avg: 4600, who: "Imran" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Active outlets" value="2,100" delta="+38" hint="1,946 billed in 30 days" icon={Store} trend={[2010, 2032, 2051, 2068, 2084, 2100]} />
        <Stat label="Market credit" value="₹38.6 L" delta="+4%" deltaGood={false} hint="across 1,412 outlets" icon={Wallet} tone="warn" trend={[34, 35, 36.2, 37, 37.9, 38.6]} />
        <Stat label="Over credit limit" value={over.length + 43} hint="orders auto-held by Credit Guard" icon={AlertTriangle} tone="late" />
        <Stat label="Gone quiet 21+ days" value="132" delta="-9" deltaGood={false} hint="were buying every week" icon={Timer} trend={[160, 151, 148, 141, 137, 132]} />
      </div>
      <Panel
        title="Outlet directory"
        sub="Sample of 2,100, synced with Tally ledgers. Click a row for credit, history and actions."
        action={
          <Btn size="sm" variant="solid" icon={Plus} onClick={() => setAdding(true)}>
            New outlet
          </Btn>
        }
      >
        <DataTable
          rows={outlets}
          rowKey={(r) => r.id}
          search={(r) => `${r.name} ${r.owner} ${r.locality} ${r.salesman}`}
          searchPlaceholder="Search outlet, owner, locality or salesman"
          filter={{ get: (r) => r.type, options: outletTypes }}
          onRow={(r) => setOpen(r.id)}
          bulk={[{ label: "Send Diwali scheme card", run: (k) => { toast.success(`Scheme card sent to ${k.length} outlets on WhatsApp`); desk.log(`Diwali scheme card sent to ${k.length} outlets`); } }]}
          columns={[
            { key: "name", label: "Outlet", render: (r) => <span className="block"><span className="block font-semibold">{r.name}</span><span className="block text-[11.5px] text-d-mute">{r.owner} · {r.locality}</span></span>, sort: (r) => r.name },
            { key: "type", label: "Type", render: (r) => <span className="text-d-mute">{r.type}</span> },
            { key: "cls", label: "Class", align: "center", render: (r) => <Pill tone={r.cls === "A" ? "accent" : r.cls === "B" ? "info" : "neutral"} mono>{r.cls}</Pill>, sort: (r) => r.cls },
            { key: "sm", label: "Salesman", render: (r) => <span className="text-[12.5px]">{r.salesman.split(" ")[0]}</span> },
            {
              key: "credit",
              label: "Credit used",
              render: (r) => (
                <span className="flex min-w-[140px] items-center gap-2">
                  <Meter value={Math.min(r.due, r.limit)} max={r.limit} tone={r.due > r.limit ? "late" : r.due / r.limit > 0.8 ? "warn" : "ok"} />
                  <span className="tnum whitespace-nowrap font-mono text-[11px]">{inr(r.due, { compact: true })}/{inr(r.limit, { compact: true })}</span>
                </span>
              ),
              sort: (r) => r.due / r.limit,
            },
            { key: "last", label: "Last order", align: "right", render: (r) => <span className="tnum font-mono" style={{ color: r.last > 20 ? "var(--d-late)" : undefined }}>{r.last}d</span>, sort: (r) => r.last },
            { key: "st", label: "", align: "right", render: (r) => (r.hold ? <Pill tone="late">On hold</Pill> : r.due > r.limit ? <Pill tone="warn">Over limit</Pill> : <Pill tone="ok">Open</Pill>) },
          ]}
        />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title="Outlet mix" sub="By type, all 2,100">
          <Donut
            center="2,100"
            sub="outlets"
            segments={[
              { label: "Kirana", value: 1260, tone: "accent" },
              { label: "Pan shop", value: 340, tone: "warn" },
              { label: "Medical", value: 190, tone: "info" },
              { label: "Hotel / canteen", value: 140, tone: "late" },
              { label: "Supermarket", value: 86, tone: "ok" },
              { label: "Wholesaler + sweets", value: 84, tone: "neutral" },
            ]}
          />
        </Panel>
        <Panel title="Gone quiet" sub="Used to order weekly, nothing in 21+ days">
          <ul className="divide-y divide-d-line">
            {quiet.map((q) => (
              <li key={q.name} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">{q.name}</p>
                  <p className="truncate text-[11.5px] text-d-mute">{q.where} · avg {inr(q.avg)} · {q.who}</p>
                </div>
                <span className="tnum font-mono text-[12px] text-d-late">{q.days}d</span>
                {added.has(q.name) ? (
                  <Pill tone="ok">On tomorrow</Pill>
                ) : (
                  <Btn size="sm" variant="soft" onClick={() => { setAdded((s) => new Set(s).add(q.name)); toast.success("Added to tomorrow's beat", { description: `${q.name} · ${q.who}` }); desk.log(`${q.name} added to ${q.who}'s beat tomorrow`); }}>
                    Add to beat
                  </Btn>
                )}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="New outlet requests" sub="Salesmen onboarded these from the app; KYC and GST checked">
          <ApprovalQueue
            items={[
              { id: "n1", title: "Shree Mauli Kirana, Godhni", sub: "Rahul · photo + Aadhaar · no GST", meta: "C", tone: "info" },
              { id: "n2", title: "Bhagwati Supermart, Besa", sub: "Prashant · GSTIN 27AJKPB…1Z4", meta: "A", tone: "ok" },
              { id: "n3", title: "Sana Pan Centre, Mominpura", sub: "Imran · photo only", meta: "C", tone: "info" },
              { id: "n4", title: "Hotel Saoji Express, Wadi", sub: "Nitin · FSSAI + GST", meta: "B", tone: "ok" },
            ]}
            onDecide={(id, d) => d && desk.log(`New outlet ${d}: ${id}`, d === "approved" ? "ok" : "info")}
          />
        </Panel>
      </div>
      <Sheet
        open={!!o}
        onOpenChange={(v) => !v && setOpen(null)}
        eyebrow={o ? `${o.id} · class ${o.cls} · ${o.type}` : ""}
        title={o?.name ?? ""}
        sub={o ? `${o.owner} · ${o.locality} · beat days ${o.days}` : ""}
        footer={
          o && (
            <>
              <Btn
                icon={MessageCircle}
                onClick={() => {
                  toast.success("Catalogue sent on WhatsApp", { description: `${o.name} · with Diwali schemes` });
                  desk.log(`Catalogue sent to ${o.name}`);
                }}
              >
                Send catalogue
              </Btn>
              <Btn
                variant={o.hold ? "solid" : "danger"}
                onClick={() => {
                  update(o.id, { hold: !o.hold });
                  if (o.due > o.limit) onOverride((n) => Math.max(0, n + (o.hold ? 1 : -1)));
                  toast.success(o.hold ? "Credit released" : "Credit put on hold", { description: o.name });
                  desk.log(`${o.name} credit ${o.hold ? "released" : "on hold"}`, o.hold ? "ok" : "warn");
                }}
              >
                {o.hold ? "Release credit" : "Hold credit"}
              </Btn>
            </>
          )
        }
      >
        {o && (
          <div className="space-y-5">
            <KV
              items={[
                { k: "Credit limit", v: inr(o.limit) },
                { k: "Outstanding", v: <span className={o.due > o.limit ? "text-d-late" : ""}>{inr(o.due)}</span> },
                { k: "Average order", v: inr(o.avg) },
                { k: "Last order", v: `${o.last} days ago` },
                { k: "Salesman", v: o.salesman },
                { k: "GST", v: o.gst ? "Registered" : "Unregistered (B2C)" },
                { k: "Phone", v: o.phone },
                { k: "Status", v: o.hold ? <Pill tone="late">On hold</Pill> : <Pill tone="ok">Open</Pill> },
              ]}
            />
            <div>
              <div className="mb-1.5 flex justify-between text-[12px] text-d-mute">
                <span>Credit used</span>
                <button type="button" className="font-medium text-d-accent" onClick={() => { setLimit(String(o.limit)); setLimitFor(o); }}>
                  Change limit
                </button>
              </div>
              <Meter value={Math.min(o.due, o.limit)} max={o.limit} tone={o.due > o.limit ? "late" : "ok"} height={8} />
            </div>
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Monthly billing, last 6 months</p>
              <Bars height={130} format={(v) => inr(v, { compact: true })} data={["May", "Jun", "Jul", "Aug", "Sep", "Oct"].map((m, i) => ({ label: m, value: Math.round(o.avg * (3 + hash(i, o.limit) * 3) * (i === 5 ? 0.7 : 1)), tone: i === 5 ? "warn" : "accent" }))} />
            </div>
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Usually buys</p>
              <div className="flex flex-wrap gap-1.5">
                {skus.filter((_, i) => hash(i, o.avg) > 0.45).map((s) => (
                  <Pill key={s.sku}>{s.sku.replace(/ \(\d+\)$/, "")}</Pill>
                ))}
              </div>
            </div>
          </div>
        )}
      </Sheet>
      <Modal open={!!limitFor} onOpenChange={(v) => !v && setLimitFor(null)} title="Change credit limit" sub={limitFor ? `${limitFor.name} · now ${inr(limitFor.limit)} · due ${inr(limitFor.due)}` : ""} width={440}>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!limitFor) return;
            const v = Number(limit) || limitFor.limit;
            update(limitFor.id, { limit: v });
            toast.success("Limit updated in Tally", { description: `${limitFor.name}: ${inr(v)}` });
            desk.log(`Credit limit for ${limitFor.name} set to ${inr(v)}`);
            setLimitFor(null);
          }}
        >
          <Field label="New limit (₹)">
            <input className={inputClass} inputMode="numeric" value={limit} onChange={(e) => setLimit(e.target.value.replace(/\D/g, ""))} />
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <Btn onClick={() => setLimitFor(null)}>Cancel</Btn>
            <Btn type="submit" variant="solid">Save</Btn>
          </div>
        </form>
      </Modal>
      <NewOutlet
        open={adding}
        onOpenChange={setAdding}
        onAdd={(x) => {
          setOutlets((cur) => [x, ...cur]);
          toast.success("Outlet added", { description: `${x.name} · on ${x.salesman}'s beat` });
          desk.log(`New outlet ${x.name}, ${x.locality} added`, "ok");
        }}
      />
    </div>
  );
}

function NewOutlet({ open, onOpenChange, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (o: Outlet) => void }) {
  const [name, setName] = React.useState("Shree Datta Kirana");
  const [locality, setLocality] = React.useState("Hudkeshwar");
  const [type, setType] = React.useState<OutletType>("Kirana");
  const [sm, setSm] = React.useState("Swapnil Chaudhari");
  const [lim, setLim] = React.useState("15000");
  const [count, setCount] = React.useState(2101);
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="New outlet" sub="Goes on the salesman's beat from tomorrow; Tally ledger is created automatically.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onAdd({ id: `OT-${count}`, name, owner: "—", locality, type, cls: "C", salesman: sm, limit: Number(lim) || 15000, due: 0, last: 0, avg: 0, gst: false, phone: "—", days: "Tue" });
          setCount((c) => c + 1);
          onOpenChange(false);
        }}
      >
        <Field label="Outlet name">
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Locality">
            <select className={inputClass} value={locality} onChange={(e) => setLocality(e.target.value)}>
              {Object.keys(LOC).map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </Field>
          <Field label="Type">
            <select className={inputClass} value={type} onChange={(e) => setType(e.target.value as OutletType)}>
              {outletTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Salesman">
            <select className={inputClass} value={sm} onChange={(e) => setSm(e.target.value)}>
              {salesmen.map((s) => (
                <option key={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Opening credit limit (₹)">
            <input className={inputClass} inputMode="numeric" value={lim} onChange={(e) => setLim(e.target.value.replace(/\D/g, ""))} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Btn onClick={() => onOpenChange(false)}>Cancel</Btn>
          <Btn variant="solid" type="submit" icon={Plus}>
            Add outlet
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Van stock & loading ---------------- */

const vanCols: { id: VanStatus; label: string; tone: Tone; hint: string }[] = [
  { id: "Loading", label: "Loading", tone: "warn", hint: "At Kalamna dock" },
  { id: "Loaded", label: "Loaded", tone: "info", hint: "E-way bill done, waiting for salesmen" },
  { id: "On beat", label: "On beat", tone: "accent", hint: "Dropping orders" },
  { id: "Back", label: "Back at godown", tone: "ok", hint: "Returns counted" },
];

function VanTab() {
  const desk = useDesk();
  const [vans, setVans] = React.useState(seedVans);
  const [pick, setPick] = React.useState("V1");
  const [po, setPo] = React.useState<Set<string>>(new Set());
  const [slip, setSlip] = React.useState([
    { id: "l1", label: "Print pick list from Tally orders", sub: "312 orders → 6 van slips", done: true },
    { id: "l2", label: "Load V5 South: 41 cases", sub: "Kailash · bay 2", done: true },
    { id: "l3", label: "E-way bill for V5 (₹1.48 L)", sub: "GST portal", done: false },
    { id: "l4", label: "V6 top-up: Glucose ₹5 ×18, Haldi ×6", sub: "For North beats", done: false },
    { id: "l5", label: "Seal and photo V6 load", sub: "Photo goes to Van Reconciler", done: false },
    { id: "l6", label: "Hand over cash bag + receipt books", sub: "Driver signs", done: false },
  ]);
  const idx = vans.findIndex((v) => v.id === pick);
  const sheet = loadSheet(idx);
  const loadValue = (i: number) => loadSheet(i).reduce((a, r) => a + r.loaded * r.rate, 0);
  const soldValue = (i: number) => loadSheet(i).reduce((a, r) => a + r.sold * r.rate, 0);
  const low = skus.filter((s) => s.godown < s.reorder);
  const totalOnVans = vans.reduce((a, v, i) => a + (v.status === "On beat" ? loadValue(i) - soldValue(i) : 0), 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Vans on beat" value={`${vans.filter((v) => v.status === "On beat").length} / ${vans.length}`} hint="V5 waiting for e-way bill" icon={Truck} />
        <Stat label="Stock still on vans" value={inr(totalOnVans, { compact: true })} hint="to drop or return by 7 PM" icon={Boxes} tone="info" trend={[9.6, 8.4, 7.1, 6.0, 5.2, totalOnVans / 1e5]} />
        <Stat label="Sold off vans today" value={inr(vans.reduce((a, _, i) => a + soldValue(i), 0), { compact: true })} delta="+7%" icon={IndianRupee} tone="ok" trend={[0.8, 1.6, 2.4, 3.0, 3.4, 3.9]} />
        <Stat label="Returns & damages" value={inr(6240)} delta="-12%" deltaGood={false} hint="this week, booked to Godhuli" icon={PackageCheck} tone="late" />
      </div>
      <Panel title="Vans" sub="Drag a van as it moves through the day. Dispatching asks for the e-way bill.">
        <Board
          columns={vanCols}
          items={vans}
          itemKey={(v) => v.id}
          getColumn={(v) => v.status}
          onMove={(key, col) => {
            const v = vans.find((x) => x.id === key);
            if (!v || v.status === col) return;
            setVans((cur) => cur.map((x) => (x.id === key ? { ...x, status: col as VanStatus, out: col === "On beat" && x.out === "—" ? "now" : x.out } : x)));
            toast.success(`${v.id} ${v.reg} → ${col}`, { description: col === "On beat" ? "E-way bill generated, salesmen notified" : col === "Back" ? "Van Reconciler will count returns" : v.driver });
            desk.log(`${v.id} moved to ${col}`, col === "Back" ? "ok" : "info");
          }}
          renderCard={(v) => {
            const i = vans.indexOf(v);
            const lv = loadValue(i);
            const sv = soldValue(i);
            return (
              <button type="button" onClick={() => setPick(v.id)} className="block w-full text-left">
                <p className="flex items-center justify-between gap-2 pr-4">
                  <span className="font-mono text-[12px] font-semibold">{v.reg}</span>
                  <Pill tone={pick === v.id ? "accent" : "neutral"} mono>{v.id}</Pill>
                </p>
                <p className="mt-1 text-[13px] font-semibold">{v.zone}</p>
                <p className="text-[11.5px] text-d-mute">
                  {v.type} · {v.driver}
                </p>
                <p className="mt-1 text-[11.5px] text-d-mute">
                  {salesmen.filter((s) => s.van === v.id).map((s) => s.name.split(" ")[0]).join(", ") || "Top-ups"}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Meter value={sv} max={lv} tone="ok" height={5} />
                  <span className="tnum whitespace-nowrap font-mono text-[11px]">{inr(lv, { compact: true })}</span>
                </div>
                <p className="mt-1 text-[11px] text-d-mute">
                  out {v.out} · {v.km} km
                </p>
              </button>
            );
          }}
        />
      </Panel>
      <Panel
        title={`Load sheet · ${vans[idx].id} ${vans[idx].reg}`}
        sub={`${vans[idx].zone} · driver ${vans[idx].driver} · cases loaded at Kalamna this morning`}
        action={<Segmented size="sm" options={vans.map((v) => v.id)} value={pick} onChange={setPick} />}
      >
        <DataTable
          rows={sheet}
          rowKey={(r) => r.sku}
          dense
          search={(r) => `${r.sku} ${r.principal}`}
          searchPlaceholder="Search SKU or principal"
          filter={{ get: (r) => r.principal, options: Array.from(new Set(skus.map((s) => s.principal))) }}
          columns={[
            { key: "sku", label: "SKU (units/case)", render: (r) => <span className="font-medium">{r.sku}</span>, sort: (r) => r.sku },
            { key: "pr", label: "Principal", render: (r) => <span className="text-d-mute">{r.principal}</span> },
            { key: "ld", label: "Loaded", align: "right", render: (r) => <span className="tnum font-mono">{r.loaded}</span>, sort: (r) => r.loaded },
            { key: "sold", label: "Sold", align: "right", render: (r) => <span className="tnum font-mono">{r.sold}</span>, sort: (r) => r.sold },
            { key: "dmg", label: "Damaged", align: "right", render: (r) => <span className="tnum font-mono" style={{ color: r.damaged ? "var(--d-late)" : undefined }}>{r.damaged}</span> },
            { key: "bal", label: "On van", align: "right", render: (r) => <span className="tnum font-mono font-semibold">{r.balance}</span>, sort: (r) => r.balance },
            {
              key: "sell",
              label: "Sell-through",
              render: (r) => (
                <span className="flex min-w-[110px] items-center gap-2">
                  <Meter value={r.sold} max={r.loaded} tone={r.sold / r.loaded > 0.75 ? "late" : "ok"} />
                  <span className="tnum font-mono text-[11px] text-d-mute">{Math.round((r.sold / r.loaded) * 100)}%</span>
                </span>
              ),
              sort: (r) => r.sold / r.loaded,
            },
            { key: "val", label: "Value", align: "right", render: (r) => <span className="tnum font-mono">{inr(r.loaded * r.rate, { compact: true })}</span>, sort: (r) => r.loaded * r.rate },
          ]}
        />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
        <Panel icon={ClipboardList} title="Loading slip" sub={`${slip.filter((s) => s.done).length} of ${slip.length} done · Pandurang at the dock`}>
          <Checklist
            items={slip}
            onToggle={(id) => {
              setSlip((cur) => cur.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));
              const it = slip.find((s) => s.id === id);
              if (it && !it.done) desk.log(`Loading: ${it.label}`, "ok");
            }}
          />
        </Panel>
        <Panel icon={Warehouse} title="Godown short of reorder level" sub="Kalamna stock in cases against the reorder point">
          <ul className="space-y-3">
            {low.map((s) => (
              <li key={s.sku} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="flex justify-between gap-2 text-[13px]">
                    <span className="truncate font-medium">{s.sku}</span>
                    <span className="tnum shrink-0 font-mono text-[12px] text-d-mute">
                      {s.godown} / {s.reorder}
                    </span>
                  </p>
                  <Meter value={s.godown} max={s.reorder} tone={s.godown / s.reorder < 0.5 ? "late" : "warn"} className="mt-1" />
                </div>
                {po.has(s.sku) ? (
                  <Pill tone="info">PO sent</Pill>
                ) : (
                  <Btn
                    size="sm"
                    variant="soft"
                    onClick={() => {
                      setPo((x) => new Set(x).add(s.sku));
                      toast.success(`PO to ${s.principal}`, { description: `${s.reorder * 2 - s.godown} cases of ${s.sku} · ${inr((s.reorder * 2 - s.godown) * s.rate, { compact: true })}` });
                      desk.log(`PO raised on ${s.principal} for ${s.sku}`);
                    }}
                  >
                    Raise PO
                  </Btn>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

/* ---------------- Schemes & claims ---------------- */

const claimCols: { id: ClaimStage; label: string; tone: Tone; hint: string }[] = [
  { id: "Draft", label: "Draft", tone: "neutral", hint: "Bills being attached" },
  { id: "Submitted", label: "Submitted", tone: "info", hint: "On principal portal" },
  { id: "Audit", label: "Under audit", tone: "warn", hint: "ASM / auditor checking" },
  { id: "Approved", label: "Approved", tone: "accent", hint: "Credit note due" },
  { id: "Credited", label: "Credited", tone: "ok", hint: "CN in Tally" },
];

function SchemesTab({ claims, setClaims }: { claims: Claim[]; setClaims: React.Dispatch<React.SetStateAction<Claim[]>> }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<Scheme | null>(null);
  const [claimOpen, setClaimOpen] = React.useState<string | null>(null);
  const [pushed, setPushed] = React.useState<Set<string>>(new Set());
  const [docs, setDocs] = React.useState<Record<string, boolean>>({});
  const claim = claims.find((c) => c.id === claimOpen) ?? null;
  const pending = claims.filter((c) => c.stage !== "Credited");
  const pendingValue = pending.reduce((a, c) => a + c.amount, 0);
  const docList = ["Scheme circular from principal", "Outlet-wise bills (Tally export)", "Free goods issue register", "Retailer acknowledgement photos"];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Schemes live" value={schemes.filter((s) => s.ends !== "30 Sep").length} hint="6 principals" icon={BadgePercent} />
        <Stat label="Claims pending" value={inr(pendingValue, { compact: true })} delta="+11%" deltaGood={false} hint={`${pending.length} claims`} icon={Receipt} tone="warn" trend={[3.2, 3.4, 3.7, 3.9, 4.1, pendingValue / 1e5]} />
        <Stat label="Oldest open claim" value={`${Math.max(...pending.map((c) => c.age))} days`} hint="Shubhra floor cleaner, July" icon={Timer} tone="late" />
        <Stat label="Passed to outlets" value="₹2.1 L" delta="+18%" hint="this month, from your margin until claimed" icon={Store} trend={[0.6, 0.9, 1.2, 1.5, 1.8, 2.1]} />
      </div>
      <Panel title="Schemes in the market" sub="Click a scheme for qualifying outlets and to push it to the salesman app">
        <DataTable
          rows={schemes}
          rowKey={(s) => s.id}
          search={(s) => `${s.name} ${s.principal} ${s.mechanic}`}
          searchPlaceholder="Search scheme or principal"
          filter={{ get: (s) => s.kind, options: ["Trade", "Consumer", "QPS", "Visibility"] }}
          onRow={setOpen}
          columns={[
            { key: "name", label: "Scheme", render: (s) => <span className="block"><span className="block font-semibold">{s.name}</span><span className="block text-[11.5px] text-d-mute">{s.principal}</span></span>, sort: (s) => s.name },
            { key: "mech", label: "Mechanic", render: (s) => <span className="text-d-mute">{s.mechanic}</span>, wide: true },
            { key: "kind", label: "Type", render: (s) => <Pill tone={s.kind === "Trade" ? "accent" : s.kind === "QPS" ? "info" : s.kind === "Visibility" ? "warn" : "neutral"}>{s.kind}</Pill> },
            {
              key: "q",
              label: "Outlets qualified",
              render: (s) => (
                <span className="flex min-w-[120px] items-center gap-2">
                  <Meter value={s.qualified} max={s.target} />
                  <span className="tnum whitespace-nowrap font-mono text-[11px]">{s.qualified}/{s.target}</span>
                </span>
              ),
              sort: (s) => s.qualified / s.target,
            },
            { key: "ends", label: "Ends", render: (s) => <span className="font-mono text-[12px]" style={{ color: s.ends === "30 Sep" ? "var(--d-late)" : undefined }}>{s.ends}</span> },
            { key: "claim", label: "Claim value", align: "right", render: (s) => <span className="tnum font-mono">{inr(s.claim)}</span>, sort: (s) => s.claim },
          ]}
        />
      </Panel>
      <Panel title="Claims to principals" sub="Drag a claim when its status changes on the principal portal. Click for supporting documents." action={<Pill tone="warn" mono>{inr(pendingValue, { compact: true })} open</Pill>}>
        <Board
          columns={claimCols}
          items={claims}
          itemKey={(c) => c.id}
          getColumn={(c) => c.stage}
          minColumnWidth={210}
          onMove={(key, col) => {
            const c = claims.find((x) => x.id === key);
            if (!c || c.stage === col) return;
            setClaims((cur) => cur.map((x) => (x.id === key ? { ...x, stage: col as ClaimStage } : x)));
            toast.success(`${c.id} → ${col}`, { description: `${c.principal} · ${inr(c.amount)}` });
            desk.log(`Claim ${c.id} (${c.principal}) moved to ${col}`, col === "Credited" ? "ok" : "info");
          }}
          renderCard={(c) => (
            <button type="button" onClick={() => setClaimOpen(c.id)} className="block w-full text-left">
              <p className="flex items-center justify-between gap-2 pr-4">
                <span className="font-mono text-[11.5px] text-d-mute">{c.id}</span>
                <span className="tnum font-mono text-[11.5px]" style={{ color: c.age > 60 ? "var(--d-late)" : c.age > 40 ? "var(--d-warn)" : "var(--d-mute)" }}>
                  {c.age}d
                </span>
              </p>
              <p className="mt-1 text-[13px] font-semibold">{c.principal}</p>
              <p className="text-[11.5px] text-d-mute">
                {c.scheme} · {c.month}
              </p>
              <p className="mt-2 flex items-center justify-between">
                <span className="tnum font-mono text-[14px] font-semibold">{inr(c.amount)}</span>
                <span className="text-[11px] text-d-mute">{c.docs}/4 docs</span>
              </p>
            </button>
          )}
        />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Open claims by principal" sub="What each company owes Deccan Route">
          <HBars
            format={(v) => inr(v, { compact: true })}
            data={Object.entries(pending.reduce<Record<string, number>>((acc, c) => ({ ...acc, [c.principal]: (acc[c.principal] ?? 0) + c.amount }), {}))
              .sort((a, c) => c[1] - a[1])
              .map(([label, value]) => ({ label, value, tone: label === "Sahyadri Foods" ? "warn" : "accent" }))}
          />
        </Panel>
        <Panel title="Scheme leakage check" sub="Scheme Claimer found outlets given free goods without qualifying">
          <ul className="divide-y divide-d-line">
            {[
              { o: "Ekvira Kirana, Pardi", s: "Glucose 10+1 on 9 cases", v: 620, who: "Mohsin" },
              { o: "Royal Pan Bhandar, Sadar", s: "Haldi 12+1 on 10 units", v: 172, who: "Ganesh" },
              { o: "Navkar Traders, Itwari", s: "Detergent ₹6 off on non-scheme pack", v: 1440, who: "Imran" },
              { o: "Mauli Stores, Khamla", s: "Rack given on 4 cases (needs 6)", v: 2200, who: "Akash" },
            ].map((x) => (
              <li key={x.o} className="flex items-center gap-3 py-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 text-d-warn" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">{x.o}</p>
                  <p className="truncate text-[11.5px] text-d-mute">{x.s} · {x.who}</p>
                </div>
                <span className="tnum font-mono text-[12.5px]">{inr(x.v)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <Sheet
        open={!!open}
        onOpenChange={(v) => !v && setOpen(null)}
        eyebrow={open ? `${open.id} · ${open.kind} scheme · ends ${open.ends}` : ""}
        title={open?.name ?? ""}
        sub={open ? `${open.principal} · ${open.mechanic}` : ""}
        footer={
          open && (
            <>
              <Btn icon={MessageCircle} onClick={() => { toast.success("Broadcast queued on WhatsApp", { description: `${open.name} to 1,412 retailers at 6 PM` }); desk.log(`Scheme ${open.name} broadcast queued`); }}>
                Broadcast to retailers
              </Btn>
              {pushed.has(open.id) ? (
                <Pill tone="ok">In salesman app</Pill>
              ) : (
                <Btn variant="solid" icon={Smartphone} onClick={() => { setPushed((s) => new Set(s).add(open.id)); toast.success("Pushed to 14 salesman phones", { description: open.name }); desk.log(`Scheme ${open.name} pushed to salesman app`, "ok"); }}>
                  Push to app
                </Btn>
              )}
            </>
          )
        }
      >
        {open && (
          <div className="space-y-5">
            <KV
              items={[
                { k: "Outlets qualified", v: `${open.qualified} of ${open.target}` },
                { k: "Claim built so far", v: inr(open.claim) },
                { k: "Ends", v: open.ends },
                { k: "Claim format", v: open.principal === "Sahyadri Foods" ? "DMS portal upload" : "Excel + bills by email" },
              ]}
            />
            <Meter value={open.qualified} max={open.target} height={8} />
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Qualified outlets by zone</p>
              <Bars height={130} data={(["North", "Central", "East", "South", "West"] as const).map((z, i) => ({ label: z, value: Math.round(open.qualified * [0.18, 0.26, 0.19, 0.22, 0.15][i]) }))} />
            </div>
          </div>
        )}
      </Sheet>
      <Sheet
        open={!!claim}
        onOpenChange={(v) => !v && setClaimOpen(null)}
        eyebrow={claim ? `${claim.id} · ${claim.month} claim · ${claim.age} days old` : ""}
        title={claim ? `${claim.principal}: ${claim.scheme}` : ""}
        sub={claim ? `${inr(claim.amount)} · ${claim.stage}` : ""}
        footer={
          claim && (
            <Btn
              variant="solid"
              icon={Send}
              disabled={claim.stage !== "Draft"}
              onClick={() => {
                setClaims((cur) => cur.map((x) => (x.id === claim.id ? { ...x, stage: "Submitted", docs: 4 } : x)));
                toast.success("Claim submitted", { description: `${claim.principal} · ${inr(claim.amount)}` });
                desk.log(`Claim ${claim.id} submitted to ${claim.principal}`, "ok");
              }}
            >
              {claim.stage === "Draft" ? "Submit to principal" : "Already submitted"}
            </Btn>
          )
        }
      >
        {claim && (
          <div className="space-y-4">
            <p className="text-[13px] text-d-mute">Supporting documents</p>
            <Checklist items={docList.map((d, i) => ({ id: `${claim.id}-${i}`, label: d, sub: i === 1 ? "214 bills, auto-attached by Scheme Claimer" : undefined, done: docs[`${claim.id}-${i}`] ?? i < claim.docs }))} onToggle={(id) => setDocs((d) => ({ ...d, [id]: !(d[id] ?? Number(id.split("-").pop()) < claim.docs) }))} />
            <KV items={[{ k: "Raised", v: `${claim.age} days ago` }, { k: "Principal contact", v: "ASM, Nagpur" }]} />
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Collections ---------------- */

function CollectionsTab() {
  const desk = useDesk();
  const [open, setOpen] = React.useState<Due | null>(null);
  const [sent, setSent] = React.useState<Set<string>>(new Set());
  const [received, setReceived] = React.useState<Set<string>>(new Set());
  const [cheques, setCheques] = React.useState(seedCheques);
  const total = dues.reduce((a, d) => a + d.amount, 0);
  const bucket = (d: number) => (d <= 15 ? "0-15 days" : d <= 30 ? "16-30 days" : d <= 45 ? "31-45 days" : "45+ days");
  const buckets = ["0-15 days", "16-30 days", "31-45 days", "45+ days"].map((label, i) => ({ label, value: dues.filter((x) => bucket(x.days) === label).reduce((a, x) => a + x.amount, 0), tone: (["ok", "info", "warn", "late"] as const)[i] }));
  const cashWith = salesmen.filter((s) => !received.has(s.id)).reduce((a, s) => a + s.cash, 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Collected today" value="₹5.4 L" delta="+9%" hint="cash ₹2.96 L · UPI ₹2.46 L" icon={Banknote} tone="ok" trend={[2.1, 2.9, 3.6, 4.2, 4.9, 5.4]} />
        <Stat label="Cash still with salesmen" value={inr(cashWith, { compact: true })} hint="handover 6 PM at Kalamna" icon={Wallet} tone="warn" />
        <Stat label="Market outstanding" value="₹38.6 L" delta="-3%" deltaGood={false} hint="1,412 outlets on credit" icon={IndianRupee} trend={[40.2, 39.8, 39.5, 39.1, 38.9, 38.6]} />
        <Stat label="Cheques bounced, Oct" value={cheques.filter((c) => c.state === "Bounced").length + 2} hint="₹350 charge each, recovered" icon={AlertTriangle} tone="late" />
      </div>
      <Panel title="Ageing" sub={`Open bills in this list: ${inr(total, { compact: true })}. Reminders go at 11 AM and 5 PM with a UPI link.`}>
        <AgingBar buckets={buckets} format={(v) => inr(v, { compact: true })} />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Panel title="Bills due" sub="Select bills to remind in one go, or click one to see the message">
          <DataTable
            rows={dues}
            rowKey={(d) => d.bill}
            search={(d) => `${d.bill} ${d.outlet} ${d.locality} ${d.salesman}`}
            searchPlaceholder="Search bill, outlet or salesman"
            filter={{ get: (d) => bucket(d.days), options: ["0-15 days", "16-30 days", "31-45 days", "45+ days"] }}
            onRow={setOpen}
            bulk={[
              { label: "WhatsApp reminder + UPI link", run: (k) => { setSent((s) => new Set([...s, ...k])); toast.success(`${k.length} reminders sent`); desk.log(`${k.length} dues reminders sent with UPI links`); } },
              { label: "Add to tomorrow's beat", run: (k) => { toast.success(`${k.length} collections added to tomorrow's beats`); desk.log(`${k.length} collection calls added to tomorrow`); } },
            ]}
            columns={[
              { key: "bill", label: "Bill", render: (d) => <span className="font-mono text-[11.5px]">{d.bill.replace("DRS/2627/", "")}</span> },
              { key: "outlet", label: "Outlet", render: (d) => <span className="block"><span className="block font-semibold">{d.outlet}</span><span className="block text-[11.5px] text-d-mute">{d.locality} · {d.salesman.split(" ")[0]}</span></span>, sort: (d) => d.outlet },
              { key: "amt", label: "Amount", align: "right", render: (d) => <span className="tnum font-mono">{inr(d.amount)}</span>, sort: (d) => d.amount },
              { key: "days", label: "Days", align: "right", render: (d) => <span className="tnum font-mono" style={{ color: d.days > 45 ? "var(--d-late)" : d.days > 30 ? "var(--d-warn)" : undefined }}>{d.days}</span>, sort: (d) => d.days },
              { key: "mode", label: "Usually pays", render: (d) => <Pill tone={d.mode === "UPI" ? "ok" : d.mode === "Cheque" ? "info" : "neutral"}>{d.mode}</Pill> },
              { key: "pr", label: "Promise", render: (d) => (sent.has(d.bill) ? <Pill tone="info">Reminded</Pill> : d.promise ? <span className="text-[12px] text-d-ok">{d.promise}</span> : <span className="text-d-mute">—</span>) },
            ]}
          />
        </Panel>
        <Panel title="Today by mode" sub="All 14 salesmen plus walk-ins at the godown">
          <Donut
            center="₹6.7 L"
            sub="incl. cheques"
            segments={[
              { label: "Cash ₹ k", value: 296, tone: "warn" },
              { label: "UPI ₹ k", value: 246, tone: "accent" },
              { label: "Cheque ₹ k", value: 129, tone: "info" },
            ]}
          />
        </Panel>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <Panel icon={Banknote} title="Cash handover" sub="Count against the app's receipts before it goes in the safe" action={<Pill tone="warn" mono>{inr(cashWith, { compact: true })} out</Pill>}>
          <ul className="grid gap-x-6 sm:grid-cols-2">
            {[...salesmen].sort((a, c) => c.cash - a.cash).map((s) => (
              <li key={s.id} className="flex items-center gap-3 border-b border-d-line py-2">
                <span className="h-6 w-1.5 rounded-full" style={{ background: s.color }} />
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{s.name}</span>
                <span className="tnum font-mono text-[12.5px]">{inr(s.cash)}</span>
                {received.has(s.id) ? (
                  <Pill tone="ok">Received</Pill>
                ) : (
                  <IconBtn
                    icon={CheckCheck}
                    label={`Receive ${inr(s.cash)} from ${s.name}`}
                    className="h-7 w-7"
                    onClick={() => {
                      setReceived((r) => new Set(r).add(s.id));
                      toast.success(`${inr(s.cash)} received`, { description: `${s.name} · matches ${Math.round(s.cash / 2400)} receipts` });
                      desk.log(`Cash handover: ${inr(s.cash)} from ${s.name}`, "ok");
                    }}
                  />
                )}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel icon={Receipt} title="Cheques in clearing" sub="From the bank statement feed">
          <ul className="space-y-2">
            {cheques.map((c) => (
              <li key={c.no} className="flex items-center gap-3 rounded-[12px] border border-d-line px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">
                    {c.outlet} <span className="font-mono text-[11px] font-normal text-d-mute">#{c.no}</span>
                  </p>
                  <p className="truncate text-[11.5px] text-d-mute">
                    {c.bank} · deposited {c.deposited}
                  </p>
                </div>
                <span className="tnum font-mono text-[12.5px]">{inr(c.amount)}</span>
                {c.state === "Clearing" ? (
                  <span className="inline-flex gap-1">
                    <Btn size="sm" variant="ghost" onClick={() => { setCheques((cur) => cur.map((x) => (x.no === c.no ? { ...x, state: "Bounced" } : x))); toast.error(`Cheque ${c.no} bounced`, { description: `${c.outlet} put on credit hold` }); desk.log(`Cheque ${c.no} from ${c.outlet} bounced`, "late"); }}>
                      Bounced
                    </Btn>
                    <Btn size="sm" variant="soft" onClick={() => { setCheques((cur) => cur.map((x) => (x.no === c.no ? { ...x, state: "Cleared" } : x))); toast.success(`Cheque ${c.no} cleared`, { description: `${inr(c.amount)} knocked off in Tally` }); desk.log(`Cheque ${c.no} cleared, ${inr(c.amount)}`, "ok"); }}>
                      Cleared
                    </Btn>
                  </span>
                ) : (
                  <Pill tone={c.state === "Cleared" ? "ok" : "late"}>{c.state}</Pill>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <Sheet
        open={!!open}
        onOpenChange={(v) => !v && setOpen(null)}
        eyebrow={open?.bill}
        title={open?.outlet ?? ""}
        sub={open ? `${inr(open.amount)} · ${open.days} days · ${open.salesman}` : ""}
        footer={
          <Btn
            variant="solid"
            icon={MessageCircle}
            onClick={() => {
              if (!open) return;
              setSent((s) => new Set(s).add(open.bill));
              toast.success("Reminder sent on WhatsApp", { description: `${open.outlet} · with UPI link` });
              desk.log(`Reminder sent to ${open.outlet} for ${inr(open.amount)}`);
              setOpen(null);
            }}
          >
            Send with UPI link
          </Btn>
        }
      >
        {open && (
          <div className="space-y-4">
            <div className="rounded-[14px] bg-[#e5f3df] p-4 text-[13.5px] leading-relaxed text-[#1c3a1d]">
              Namaskar, Deccan Route Sales here. Bill {open.bill} for {inr(open.amount)} is {open.days} days old. {open.salesman.split(" ")[0]} will be on your beat this week, or you can pay now on the UPI link below and get the receipt on WhatsApp. Dhanyavaad! — Kavita, Accounts
              <span className="mt-3 flex items-center gap-2 rounded-[10px] bg-white/70 px-3 py-2 font-mono text-[12px]">
                <Navigation className="h-3.5 w-3.5" /> upi://pay?pa=deccanroute@icici&amp;am={open.amount}
              </span>
            </div>
            <KV
              items={[
                { k: "Usually pays by", v: open.mode },
                { k: "Promise", v: open.promise ?? "None yet" },
                { k: "Salesman", v: open.salesman },
                { k: "Reminders sent", v: open.days > 45 ? "4" : open.days > 20 ? "2" : "0" },
              ]}
            />
            <Btn variant="soft" icon={ArrowRight} onClick={() => { toast.success("Added to tomorrow's beat", { description: `${open.salesman} collects from ${open.outlet}` }); desk.log(`Collection call for ${open.outlet} added to tomorrow`); }}>
              Collect on tomorrow&apos;s beat
            </Btn>
          </div>
        )}
      </Sheet>
    </div>
  );
}
