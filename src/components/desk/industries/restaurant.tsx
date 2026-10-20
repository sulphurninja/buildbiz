"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Armchair,
  Ban,
  Bike,
  BookOpen,
  CalendarCheck,
  ChefHat,
  ClipboardCheck,
  CookingPot,
  CupSoda,
  Flame,
  Gauge as GaugeIcon,
  IndianRupee,
  LayoutGrid,
  Megaphone,
  MessageSquareReply,
  Package,
  Phone,
  Plug,
  Plus,
  Power,
  Receipt,
  RotateCcw,
  Scale,
  Send,
  ShieldCheck,
  Soup,
  Sparkles,
  Star,
  Store,
  Thermometer,
  Timer,
  Trash,
  TrendingUp,
  Truck,
  Users,
  UtensilsCrossed,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { DeskShell, useDesk } from "../shell";
import { AreaChart, Bars, Donut, HBars, HeatGrid } from "../charts";
import { ApprovalQueue, Board, Checklist, DataTable } from "../data";
import { AgentsModule, ConnectionsModule, IndependenceModule, PeopleModule } from "../common";
import { Avatar, Btn, Field, inputClass, inr, KV, Meter, Modal, Panel, Pill, Segmented, Sheet, Stat, toneVar } from "../ui";
import { useDrift, useNow } from "../hooks";
import type { DeskConfig, DeskModule, IndependenceData, Integration, TeamMember, Tone, WorkforceAgent } from "../types";

/* ============================================================
   Data — Tadka Junction Kitchens, Hyderabad. Fictional group:
   3 dine-ins (Banjara Hills, Gachibowli, Kondapur) and 2 cloud
   kitchens (Madhapur, Kukatpally) on Swiggy and Zomato.
   Today = Tue 20 Oct, lunch service. Seconds on the pass are
   relative to the moment the desk opened.
   ============================================================ */

type Src = "POS" | "Swiggy" | "Zomato";
type Station = "Tandoor" | "Curry" | "Biryani" | "Chinese" | "Beverages";
type KitchenId = "BH" | "GB" | "KP" | "MD" | "KK";
const STATIONS: Station[] = ["Tandoor", "Curry", "Biryani", "Chinese", "Beverages"];
const KITCHENS: KitchenId[] = ["BH", "GB", "KP", "MD", "KK"];
const KITCHEN_NAME: Record<KitchenId, string> = { BH: "Banjara Hills", GB: "Gachibowli", KP: "Kondapur", MD: "CK Madhapur", KK: "CK Kukatpally" };
const STATION_ICON: Record<Station, LucideIcon> = { Tandoor: Flame, Curry: CookingPot, Biryani: Soup, Chinese: UtensilsCrossed, Beverages: CupSoda };
const STATION_CHEF: Record<Station, string> = { Tandoor: "Raju Yadav", Curry: "Bhaskar", Biryani: "Shafi ustad", Chinese: "Tenzin", Beverages: "Anwar" };
/** Promised prep minutes on Swiggy/Zomato; dine-in KOTs get 4 more. */
const PROMISE: Record<Station, number> = { Tandoor: 14, Curry: 12, Biryani: 9, Chinese: 11, Beverages: 5 };
const SRC_COLOR: Record<Src, string> = { POS: "var(--d-info)", Swiggy: "#fc8019", Zomato: "#e23744" };

type Ticket = {
  id: string;
  kot: number;
  order: string;
  src: Src;
  kitchen: KitchenId;
  station: Station;
  items: [string, number][];
  note?: string;
  promise: number;
  born: number;
  status: "fire" | "ready" | "done";
  readyAt?: number;
  doneAt?: number;
  table?: string;
  rider?: { name: string; at: number; phone: string };
  value: number;
};

const RIDERS = ["Mohd. Imran", "Saikumar B", "Naveen K", "Abdul Rehman", "Ramesh G", "Shiva P", "Kiran Kumar", "Syed Ali", "Venkatesh M", "Prakash R"];
const riderPhone = (name: string) => `9${String(848100000 + name.length * 104729).slice(0, 9)}`;

function kot(
  id: string,
  kotNo: number,
  order: string,
  src: Src,
  kitchen: KitchenId,
  station: Station,
  items: [string, number][],
  born: number,
  value: number,
  extra: Partial<Ticket> & { riderName?: string; riderAt?: number } = {},
): Ticket {
  const { riderName, riderAt, ...rest } = extra;
  return {
    id,
    kot: kotNo,
    order,
    src,
    kitchen,
    station,
    items,
    born,
    value,
    promise: PROMISE[station] + (src === "POS" ? 4 : 0),
    status: "fire",
    rider: riderName ? { name: riderName, at: riderAt ?? 0, phone: riderPhone(riderName) } : undefined,
    ...rest,
  };
}

const ticketSeed: Ticket[] = [
  kot("K01", 4411, "SW 1784 22104", "Swiggy", "BH", "Biryani", [["Chicken Dum Biryani", 2], ["Mirchi ka Salan", 1]], -520, 812, { riderName: "Mohd. Imran", riderAt: -40 }),
  kot("K02", 2287, "ZO 6421 99071", "Zomato", "MD", "Biryani", [["Mutton Dum Biryani", 1], ["Burani Raita", 1]], -300, 528, { riderName: "Saikumar B", riderAt: 180 }),
  kot("K03", 4402, "BH/T7 · bill 118", "POS", "BH", "Tandoor", [["Tandoori Chicken (half)", 1], ["Butter Naan", 4]], -1010, 655, { table: "T7 · 4 pax" }),
  kot("K04", 3120, "GB/T3 · bill 204", "POS", "GB", "Curry", [["Butter Chicken", 1], ["Dal Makhani", 1]], -640, 668, { table: "T3 · 2 pax" }),
  kot("K05", 1876, "SW 1784 22231", "Swiggy", "KP", "Tandoor", [["Chicken Tikka", 1], ["Garlic Naan", 2]], -930, 497, { riderName: "Naveen K", riderAt: 60, note: "Less spicy please" }),
  kot("K06", 905, "ZO 6421 98810", "Zomato", "KK", "Chinese", [["Dragon Chicken", 1], ["Schezwan Fried Rice", 1]], -720, 548, { riderName: "Abdul Rehman", riderAt: -120 }),
  kot("K07", 2291, "SW 1784 22390", "Swiggy", "MD", "Chinese", [["Veg Hakka Noodles", 2], ["Chilli Paneer", 1]], -200, 717, { riderName: "Ramesh G", riderAt: 420 }),
  kot("K08", 1881, "KP/T2 · bill 77", "POS", "KP", "Beverages", [["Irani Chai", 4], ["Osmania Biscuit", 2]], -150, 236, { table: "T2 · 4 pax" }),
  kot("K09", 3126, "ZO 6421 99102", "Zomato", "GB", "Curry", [["Paneer Butter Masala", 1], ["Butter Naan", 3]], -480, 536, { riderName: "Shiva P", riderAt: 300, note: "Jain: no onion, no garlic" }),
  kot("K10", 4413, "SW 1784 22104", "Swiggy", "BH", "Beverages", [["Sweet Lassi", 2], ["Double ka Meetha", 1]], -270, 327, { riderName: "Mohd. Imran", riderAt: -40 }),
  kot("K11", 4403, "BH/T7 · bill 118", "POS", "BH", "Curry", [["Mirchi ka Salan", 1], ["Bagara Baingan", 1]], -980, 478, { table: "T7 · 4 pax" }),
  kot("K12", 2296, "ZO 6421 99188", "Zomato", "MD", "Biryani", [["Chicken Dum Biryani", 3], ["Double ka Meetha", 3]], -90, 1494, { riderName: "Kiran Kumar", riderAt: 600, note: "Office order, pack separately" }),
  kot("K13", 911, "SW 1784 22140", "Swiggy", "KK", "Biryani", [["Egg Biryani", 1]], -560, 259, { riderName: "Syed Ali", riderAt: 30, status: "ready", readyAt: -60 }),
  kot("K14", 3131, "GB/T11 · bill 209", "POS", "GB", "Tandoor", [["Paneer Tikka", 1], ["Murgh Malai Kebab", 1]], -420, 718, { table: "T11 · 3 pax" }),
  kot("K15", 1890, "ZO 6421 99215", "Zomato", "KP", "Curry", [["Butter Chicken", 2], ["Jeera Rice", 1]], -60, 927, { riderName: "Venkatesh M", riderAt: 720 }),
  kot("K16", 2280, "SW 1784 21977", "Swiggy", "MD", "Chinese", [["Chicken Manchurian", 1], ["Veg Fried Rice", 1]], -700, 468, { riderName: "Prakash R", riderAt: -20, status: "ready", readyAt: -100 }),
  kot("K17", 1885, "KP/T5 · bill 79", "POS", "KP", "Chinese", [["Chilli Chicken", 1]], -330, 289, { table: "T5 · 2 pax" }),
  kot("K18", 3133, "ZO 6421 99102", "Zomato", "GB", "Beverages", [["Fresh Lime Soda", 2]], -100, 178, { riderName: "Shiva P", riderAt: 300 }),
  // already handed over in the last 15 minutes
  ...[
    ["H01", "SW 1784 21802", "Swiggy", "BH", "Biryani", -880],
    ["H02", "ZO 6421 98722", "Zomato", "MD", "Biryani", -840],
    ["H03", "BH/T2 · bill 113", "POS", "BH", "Curry", -800],
    ["H04", "SW 1784 21850", "Swiggy", "KK", "Chinese", -760],
    ["H05", "ZO 6421 98790", "Zomato", "GB", "Tandoor", -720],
    ["H06", "SW 1784 21871", "Swiggy", "MD", "Biryani", -690],
    ["H07", "GB/T6 · bill 199", "POS", "GB", "Tandoor", -650],
    ["H08", "ZO 6421 98844", "Zomato", "KP", "Curry", -610],
    ["H09", "SW 1784 21903", "Swiggy", "MD", "Chinese", -560],
    ["H10", "ZO 6421 98871", "Zomato", "KK", "Biryani", -500],
    ["H11", "SW 1784 21922", "Swiggy", "BH", "Tandoor", -450],
    ["H12", "KP/T8 · bill 74", "POS", "KP", "Beverages", -380],
    ["H13", "ZO 6421 98930", "Zomato", "MD", "Biryani", -330],
    ["H14", "SW 1784 21966", "Swiggy", "GB", "Curry", -260],
  ].map(([id, order, src, kitchen, station, born], i) =>
    kot(String(id), 4300 + i * 7, String(order), src as Src, kitchen as KitchenId, station as Station, [["Chicken Dum Biryani", 1]], Number(born), 380 + i * 23, { status: "done", readyAt: Math.min(Number(born) + 300 + ((i * 37) % 420), -60), doneAt: Math.min(Number(born) + 360 + ((i * 37) % 420), -20) }),
  ),
];

const ARRIVALS: { src: Src; kitchen: KitchenId; station: Station; items: [string, number][]; value: number; note?: string }[] = [
  { src: "Swiggy", kitchen: "MD", station: "Biryani", items: [["Chicken Dum Biryani", 1], ["Mirchi ka Salan", 1]], value: 389 },
  { src: "Zomato", kitchen: "BH", station: "Tandoor", items: [["Murgh Malai Kebab", 1], ["Garlic Naan", 2]], value: 547 },
  { src: "POS", kitchen: "GB", station: "Curry", items: [["Kadai Paneer", 1], ["Tandoori Roti", 4]], value: 485 },
  { src: "Swiggy", kitchen: "KK", station: "Chinese", items: [["Chicken Manchurian", 1], ["Veg Hakka Noodles", 1]], value: 498, note: "Extra chilli" },
  { src: "Zomato", kitchen: "MD", station: "Biryani", items: [["Mutton Dum Biryani", 2]], value: 898 },
  { src: "Swiggy", kitchen: "BH", station: "Beverages", items: [["Irani Chai", 2], ["Qubani ka Meetha", 1]], value: 287 },
  { src: "POS", kitchen: "KP", station: "Tandoor", items: [["Tandoori Chicken (full)", 1], ["Butter Naan", 3]], value: 846 },
  { src: "Zomato", kitchen: "GB", station: "Curry", items: [["Dal Makhani", 1], ["Butter Naan", 2]], value: 417, note: "Cutlery needed" },
  { src: "Swiggy", kitchen: "KP", station: "Biryani", items: [["Veg Dum Biryani", 1], ["Burani Raita", 1]], value: 338 },
  { src: "Zomato", kitchen: "KK", station: "Biryani", items: [["Chicken Dum Biryani", 2], ["Double ka Meetha", 1]], value: 847 },
  { src: "POS", kitchen: "BH", station: "Chinese", items: [["Chilli Paneer", 1], ["Schezwan Fried Rice", 1]], value: 528 },
  { src: "Swiggy", kitchen: "GB", station: "Tandoor", items: [["Paneer Tikka", 1], ["Tandoori Roti", 2]], value: 397 },
];

function fmtAge(s: number) {
  const a = Math.max(0, Math.floor(s));
  return `${Math.floor(a / 60)}:${String(a % 60).padStart(2, "0")}`;
}
function ageTone(elapsed: number, promise: number): Tone {
  const pct = elapsed / (promise * 60);
  return pct >= 1 ? "late" : pct >= 0.7 ? "warn" : "ok";
}

/* ---------------- Outlets ---------------- */

type Outlet = {
  id: KitchenId;
  name: string;
  kind: "Dine-in" | "Cloud kitchen";
  area: string;
  manager: string;
  seats: number;
  today: number;
  mtd: number;
  lastMtd: number;
  orders: number;
  covers: number;
  fc: number;
  labour: number;
  rent: number;
  delivery: number;
  commission: number;
  mkt: number;
  trend: number[];
  note: string;
};
const outlets: Outlet[] = [
  { id: "BH", name: "Banjara Hills", kind: "Dine-in", area: "Road No. 12", manager: "Faisal Khan", seats: 96, today: 142600, mtd: 2490000, lastMtd: 2310000, orders: 168, covers: 214, fc: 0.308, labour: 0.17, rent: 650000, delivery: 0.28, commission: 0.22, mkt: 0.025, trend: [118, 124, 131, 122, 138, 156, 162, 121, 119, 128, 133, 141, 158, 143], note: "Flagship. Weekend waitlist runs 40 minutes." },
  { id: "GB", name: "Gachibowli", kind: "Dine-in", area: "Financial District", manager: "Sneha Reddy", seats: 120, today: 118400, mtd: 2130000, lastMtd: 2050000, orders: 191, covers: 162, fc: 0.324, labour: 0.17, rent: 540000, delivery: 0.35, commission: 0.22, mkt: 0.025, trend: [102, 110, 112, 108, 96, 84, 88, 104, 109, 114, 112, 118, 92, 118], note: "Weekday lunch from IT offices; weekends soft." },
  { id: "KP", name: "Kondapur", kind: "Dine-in", area: "Botanical Garden Rd", manager: "Mahesh Goud", seats: 72, today: 86200, mtd: 1560000, lastMtd: 1640000, orders: 142, covers: 96, fc: 0.349, labour: 0.2, rent: 420000, delivery: 0.4, commission: 0.22, mkt: 0.025, trend: [84, 81, 79, 82, 88, 94, 90, 76, 78, 80, 77, 83, 89, 86], note: "Food cost 3.4 pts over target; tandoor wastage high." },
  { id: "MD", name: "CK Madhapur", kind: "Cloud kitchen", area: "Ayyappa Society", manager: "Priya Nair", seats: 0, today: 82300, mtd: 1510000, lastMtd: 1380000, orders: 214, covers: 0, fc: 0.296, labour: 0.14, rent: 160000, delivery: 1, commission: 0.24, mkt: 0.05, trend: [68, 72, 74, 76, 81, 88, 86, 72, 74, 77, 79, 80, 87, 82], note: "Runs Hyderabadi Handi and Wok Junction brands." },
  { id: "KK", name: "CK Kukatpally", kind: "Cloud kitchen", area: "KPHB Phase 3", manager: "Priya Nair", seats: 0, today: 57800, mtd: 1040000, lastMtd: 1110000, orders: 168, covers: 0, fc: 0.319, labour: 0.16, rent: 120000, delivery: 1, commission: 0.24, mkt: 0.052, trend: [56, 54, 58, 55, 52, 61, 60, 51, 50, 53, 55, 54, 59, 58], note: "Zomato rating fell to 3.8; cancellations from stock-outs." },
];
const DAYS = ["7 Oct", "8 Oct", "9 Oct", "10 Oct", "11 Oct", "12 Oct", "13 Oct", "14 Oct", "15 Oct", "16 Oct", "17 Oct", "18 Oct", "19 Oct", "20 Oct"];
const MTD_DAYS = 20;

function pnl(o: Outlet) {
  const net = o.mtd;
  const lines = [
    { k: "Food cost", v: Math.round(net * o.fc), tone: "warn" as Tone },
    { k: "Staff + kitchen labour", v: Math.round(net * o.labour), tone: "info" as Tone },
    { k: "Rent + CAM", v: Math.round((o.rent * MTD_DAYS) / 31), tone: "neutral" as Tone },
    { k: "Gas, power, water", v: Math.round(net * 0.06), tone: "neutral" as Tone },
    { k: "Aggregator commission", v: Math.round(net * o.delivery * o.commission), tone: "late" as Tone },
    { k: "Ads + discounts funded", v: Math.round(net * o.mkt), tone: "accent" as Tone },
    { k: "Packaging + other", v: Math.round(net * 0.03), tone: "neutral" as Tone },
  ];
  const ebitda = net - lines.reduce((a, l) => a + l.v, 0);
  return { lines, ebitda, pct: (ebitda / net) * 100 };
}

const dayClose = [
  { id: "DC1", title: "Kondapur: cash short ₹1,240", sub: "Cashier Mahesh, Monday night close. Card + UPI tally exact.", amount: "₹1,240", meta: "Variance", tone: "late" as Tone },
  { id: "DC2", title: "Banjara Hills: 2 KOTs voided after fire", sub: "Captain Ravi, table T9. Guest changed order; food already cooked.", amount: "₹2,860", meta: "Void", tone: "warn" as Tone },
  { id: "DC3", title: "Gachibowli: complimentary dessert platter", sub: "Regular guest birthday, 12 visits this year", amount: "₹1,900", meta: "Comp", tone: "info" as Tone },
  { id: "DC4", title: "CK Madhapur: petty cash, 2 commercial cylinders", sub: "HP Gas agency late, bought from local dealer", amount: "₹4,500", meta: "Petty cash", tone: "warn" as Tone },
  { id: "DC5", title: "CK Kukatpally: staff meals over limit", sub: "11 meals logged vs 8 staff on shift", amount: "₹990", meta: "Staff meal", tone: "warn" as Tone },
];

/* ---------------- Aggregators ---------------- */

type Listing = {
  id: string;
  brand: string;
  kitchen: KitchenId;
  platform: "Swiggy" | "Zomato";
  rating: number;
  ratings: number;
  orders7: number;
  breach: number;
  cancel: number;
  kpt: number;
  promise: number;
  online: boolean;
  complaints: string[];
};
const listingSeed: Listing[] = [
  { id: "L1", brand: "Tadka Junction", kitchen: "BH", platform: "Swiggy", rating: 4.4, ratings: 12400, orders7: 612, breach: 6.1, cancel: 1.4, kpt: 13.2, promise: 14, online: true, complaints: ["Naan soggy in transit", "Less quantity of salan"] },
  { id: "L2", brand: "Tadka Junction", kitchen: "BH", platform: "Zomato", rating: 4.2, ratings: 9800, orders7: 488, breach: 7.4, cancel: 1.9, kpt: 13.8, promise: 14, online: true, complaints: ["Late delivery", "Packaging leaked"] },
  { id: "L3", brand: "Tadka Junction", kitchen: "GB", platform: "Swiggy", rating: 4.3, ratings: 8100, orders7: 704, breach: 8.8, cancel: 2.2, kpt: 12.9, promise: 12, online: true, complaints: ["Lunch orders slow", "Cold rotis"] },
  { id: "L4", brand: "Tadka Junction", kitchen: "GB", platform: "Zomato", rating: 4.1, ratings: 6400, orders7: 566, breach: 9.6, cancel: 2.6, kpt: 13.4, promise: 12, online: true, complaints: ["Wrong item", "Late delivery"] },
  { id: "L5", brand: "Tadka Junction", kitchen: "KP", platform: "Swiggy", rating: 4.0, ratings: 5200, orders7: 418, breach: 14.2, cancel: 3.8, kpt: 16.1, promise: 14, online: true, complaints: ["Burnt tikka", "Took 70 minutes", "Item missing"] },
  { id: "L6", brand: "Tadka Junction", kitchen: "KP", platform: "Zomato", rating: 3.9, ratings: 4300, orders7: 372, breach: 15.8, cancel: 4.4, kpt: 16.8, promise: 14, online: true, complaints: ["Very late", "Oily curry"] },
  { id: "L7", brand: "Hyderabadi Handi", kitchen: "MD", platform: "Swiggy", rating: 4.5, ratings: 21800, orders7: 1140, breach: 4.2, cancel: 1.1, kpt: 8.4, promise: 9, online: true, complaints: ["Raita missing"] },
  { id: "L8", brand: "Hyderabadi Handi", kitchen: "MD", platform: "Zomato", rating: 4.3, ratings: 16500, orders7: 962, breach: 5.0, cancel: 1.3, kpt: 8.9, promise: 9, online: true, complaints: ["Less chicken pieces"] },
  { id: "L9", brand: "Wok Junction", kitchen: "MD", platform: "Swiggy", rating: 4.1, ratings: 3900, orders7: 302, breach: 9.9, cancel: 2.8, kpt: 11.7, promise: 11, online: true, complaints: ["Noodles clumped", "Not spicy enough"] },
  { id: "L10", brand: "Wok Junction", kitchen: "MD", platform: "Zomato", rating: 4.0, ratings: 3100, orders7: 254, breach: 10.4, cancel: 3.0, kpt: 11.9, promise: 11, online: false, complaints: ["Late delivery"] },
  { id: "L11", brand: "Hyderabadi Handi", kitchen: "KK", platform: "Swiggy", rating: 4.2, ratings: 7600, orders7: 590, breach: 8.1, cancel: 3.1, kpt: 9.6, promise: 9, online: true, complaints: ["Mutton out of stock after order", "Cold biryani"] },
  { id: "L12", brand: "Hyderabadi Handi", kitchen: "KK", platform: "Zomato", rating: 3.8, ratings: 5100, orders7: 466, breach: 11.6, cancel: 5.2, kpt: 10.4, promise: 9, online: true, complaints: ["Order cancelled after 30 min", "Mutton not available", "Rider waited long"] },
];

type MenuToggle = { id: string; item: string; brand: string; swiggy: boolean; zomato: boolean; reason?: string; stock: string };
const toggleSeed: MenuToggle[] = [
  { id: "T1", item: "Mutton Dum Biryani", brand: "Hyderabadi Handi", swiggy: true, zomato: false, reason: "KK: 4 portions left", stock: "4 portions" },
  { id: "T2", item: "Pathar ka Gosht", brand: "Tadka Junction", swiggy: false, zomato: false, reason: "Stone not heated at KP", stock: "Off at KP" },
  { id: "T3", item: "Chicken Dum Biryani", brand: "Hyderabadi Handi", swiggy: true, zomato: true, stock: "2 deghs, 84 portions" },
  { id: "T4", item: "Butter Chicken", brand: "Tadka Junction", swiggy: true, zomato: true, stock: "Gravy 9 kg" },
  { id: "T5", item: "Paneer Tikka", brand: "Tadka Junction", swiggy: true, zomato: true, stock: "Paneer 14.5 kg" },
  { id: "T6", item: "Dragon Chicken", brand: "Wok Junction", swiggy: true, zomato: true, stock: "Boneless 6 kg" },
  { id: "T7", item: "Qubani ka Meetha", brand: "Tadka Junction", swiggy: false, zomato: true, reason: "Swiggy photo rejected", stock: "22 cups" },
  { id: "T8", item: "Double ka Meetha", brand: "Hyderabadi Handi", swiggy: true, zomato: true, stock: "40 cups" },
  { id: "T9", item: "Bagara Baingan", brand: "Tadka Junction", swiggy: true, zomato: true, stock: "3 kg" },
  { id: "T10", item: "Schezwan Fried Rice", brand: "Wok Junction", swiggy: true, zomato: true, stock: "Rice 20 kg" },
];

type Ad = { id: string; platform: "Swiggy" | "Zomato"; name: string; kitchen: KitchenId; spend: number; orders: number; sales: number; budget: number; active: boolean };
const adSeed: Ad[] = [
  { id: "AD1", platform: "Swiggy", name: "Hyderabadi Handi · Carousel, lunch", kitchen: "MD", spend: 18400, orders: 412, sales: 162800, budget: 3000, active: true },
  { id: "AD2", platform: "Zomato", name: "Hyderabadi Handi · Search ads 'biryani'", kitchen: "MD", spend: 15200, orders: 288, sales: 118600, budget: 2500, active: true },
  { id: "AD3", platform: "Swiggy", name: "Tadka Junction GB · Offers tab, 20% off", kitchen: "GB", spend: 12800, orders: 196, sales: 74200, budget: 2000, active: true },
  { id: "AD4", platform: "Zomato", name: "Tadka Junction KP · Banner, dinner", kitchen: "KP", spend: 9600, orders: 61, sales: 27400, budget: 1500, active: true },
  { id: "AD5", platform: "Swiggy", name: "Wok Junction · New-user offer", kitchen: "MD", spend: 7400, orders: 98, sales: 31800, budget: 1200, active: true },
  { id: "AD6", platform: "Zomato", name: "Handi KK · Rainy-day boost", kitchen: "KK", spend: 6200, orders: 44, sales: 19100, budget: 1000, active: false },
];

const cancelReasons = [
  { label: "Item out of stock", value: 34, tone: "late" as Tone },
  { label: "Rider delay", value: 21, tone: "warn" as Tone },
  { label: "Kitchen delay", value: 18, tone: "accent" as Tone },
  { label: "Customer cancelled", value: 15, tone: "info" as Tone },
  { label: "Outlet busy / closed", value: 7, tone: "neutral" as Tone },
];
const HOURS = ["12", "13", "14", "15", "19", "20", "21", "22", "23"];
const breachGrid = [
  [1, 3, 2, 0, 1, 2, 3, 1, 0],
  [2, 5, 3, 1, 1, 2, 2, 1, 0],
  [3, 6, 5, 2, 2, 4, 7, 4, 2],
  [0, 2, 1, 0, 1, 2, 3, 2, 1],
  [1, 3, 2, 1, 2, 3, 5, 3, 2],
];

/* ---------------- Menu engineering ---------------- */

type MenuCat = "Biryani & curries" | "Starters & tandoor" | "Breads, sweets & drinks";
type Dish = { id: string; name: string; short: string; cat: MenuCat; station: Station; price: number; cost: number; sold: number };
const dishSeed: Dish[] = [
  { id: "D01", name: "Hyderabadi Chicken Dum Biryani", short: "Chk biryani", cat: "Biryani & curries", station: "Biryani", price: 349, cost: 112, sold: 4820 },
  { id: "D02", name: "Mutton Dum Biryani", short: "Mutton biryani", cat: "Biryani & curries", station: "Biryani", price: 449, cost: 188, sold: 2140 },
  { id: "D03", name: "Veg Dum Biryani", short: "Veg biryani", cat: "Biryani & curries", station: "Biryani", price: 279, cost: 74, sold: 980 },
  { id: "D04", name: "Egg Biryani", short: "Egg biryani", cat: "Biryani & curries", station: "Biryani", price: 259, cost: 68, sold: 610 },
  { id: "D05", name: "Butter Chicken", short: "Butter chk", cat: "Biryani & curries", station: "Curry", price: 389, cost: 128, sold: 2610 },
  { id: "D06", name: "Paneer Butter Masala", short: "PBM", cat: "Biryani & curries", station: "Curry", price: 329, cost: 96, sold: 1880 },
  { id: "D07", name: "Dal Makhani", short: "Dal makhani", cat: "Biryani & curries", station: "Curry", price: 279, cost: 52, sold: 2050 },
  { id: "D08", name: "Bagara Baingan", short: "Bagara baingan", cat: "Biryani & curries", station: "Curry", price: 239, cost: 61, sold: 290 },
  { id: "D09", name: "Pathar ka Gosht", short: "Pathar gosht", cat: "Starters & tandoor", station: "Tandoor", price: 529, cost: 196, sold: 310 },
  { id: "D10", name: "Chicken 65", short: "Chk 65", cat: "Starters & tandoor", station: "Curry", price: 249, cost: 92, sold: 3100 },
  { id: "D11", name: "Murgh Malai Kebab", short: "Malai kebab", cat: "Starters & tandoor", station: "Tandoor", price: 399, cost: 118, sold: 640 },
  { id: "D12", name: "Tandoori Chicken (half)", short: "Tandoori chk", cat: "Starters & tandoor", station: "Tandoor", price: 379, cost: 142, sold: 1720 },
  { id: "D13", name: "Paneer Tikka", short: "Paneer tikka", cat: "Starters & tandoor", station: "Tandoor", price: 319, cost: 104, sold: 1240 },
  { id: "D14", name: "Chilli Paneer", short: "Chilli paneer", cat: "Starters & tandoor", station: "Chinese", price: 279, cost: 92, sold: 520 },
  { id: "D15", name: "Dragon Chicken", short: "Dragon chk", cat: "Starters & tandoor", station: "Chinese", price: 299, cost: 118, sold: 380 },
  { id: "D16", name: "Butter Naan", short: "Butter naan", cat: "Breads, sweets & drinks", station: "Tandoor", price: 69, cost: 14, sold: 9800 },
  { id: "D17", name: "Irani Chai", short: "Irani chai", cat: "Breads, sweets & drinks", station: "Beverages", price: 49, cost: 12, sold: 5400 },
  { id: "D18", name: "Double ka Meetha", short: "Double ka meetha", cat: "Breads, sweets & drinks", station: "Beverages", price: 149, cost: 31, sold: 1460 },
  { id: "D19", name: "Qubani ka Meetha", short: "Qubani", cat: "Breads, sweets & drinks", station: "Beverages", price: 189, cost: 38, sold: 420 },
  { id: "D20", name: "Fresh Lime Soda", short: "Lime soda", cat: "Breads, sweets & drinks", station: "Beverages", price: 89, cost: 14, sold: 1210 },
];
type MenuClass = "Star" | "Plowhorse" | "Puzzle" | "Dog";
const CLASS_TONE: Record<MenuClass, Tone> = { Star: "ok", Plowhorse: "warn", Puzzle: "info", Dog: "late" };
const CLASS_HINT: Record<MenuClass, string> = {
  Star: "Popular and profitable. Protect the recipe, keep it on top of the menu.",
  Plowhorse: "Sells a lot, earns little each. Nudge the price or trim the cost.",
  Puzzle: "Earns well but few order it. Better photo, better position, a combo.",
  Dog: "Low on both. Rework it or take it off and free up the station.",
};

function classify(list: Dish[]) {
  const total = list.reduce((a, d) => a + d.sold, 0) || 1;
  const avgCm = list.reduce((a, d) => a + (d.price - d.cost) * d.sold, 0) / total;
  const popLine = (0.7 / Math.max(1, list.length)) * total;
  const map: Record<string, MenuClass> = {};
  list.forEach((d) => {
    const pop = d.sold >= popLine;
    const hi = d.price - d.cost >= avgCm;
    map[d.id] = pop && hi ? "Star" : pop ? "Plowhorse" : hi ? "Puzzle" : "Dog";
  });
  return { map, avgCm, popLine, total };
}

/* ---------------- Inventory ---------------- */

type StockItem = { id: string; name: string; unit: string; cat: "Meat" | "Veg" | "Dairy" | "Dry"; par: number; system: number; cost: number; vendor: string };
const stockSeed: StockItem[] = [
  { id: "S01", name: "Chicken curry cut", unit: "kg", cat: "Meat", par: 60, system: 48, cost: 210, vendor: "Sri Sai Poultry, Bowenpally" },
  { id: "S02", name: "Chicken boneless", unit: "kg", cat: "Meat", par: 35, system: 22, cost: 290, vendor: "Sri Sai Poultry, Bowenpally" },
  { id: "S03", name: "Mutton (biryani cut)", unit: "kg", cat: "Meat", par: 25, system: 11, cost: 780, vendor: "Deccan Meat Co., Chengicherla" },
  { id: "S04", name: "Paneer", unit: "kg", cat: "Dairy", par: 18, system: 14.5, cost: 360, vendor: "Godavari Dairy Farms" },
  { id: "S05", name: "Curd", unit: "kg", cat: "Dairy", par: 30, system: 26, cost: 62, vendor: "Godavari Dairy Farms" },
  { id: "S06", name: "Fresh cream", unit: "L", cat: "Dairy", par: 12, system: 6, cost: 240, vendor: "Godavari Dairy Farms" },
  { id: "S07", name: "Desi ghee", unit: "kg", cat: "Dairy", par: 15, system: 12, cost: 610, vendor: "Godavari Dairy Farms" },
  { id: "S08", name: "Basmati sella rice", unit: "kg", cat: "Dry", par: 120, system: 96, cost: 118, vendor: "Deccan Rice Traders, Begum Bazaar" },
  { id: "S09", name: "Onions", unit: "kg", cat: "Veg", par: 140, system: 88, cost: 32, vendor: "Rajesh Traders, Bowenpally market" },
  { id: "S10", name: "Tomatoes", unit: "kg", cat: "Veg", par: 80, system: 41, cost: 28, vendor: "Rajesh Traders, Bowenpally market" },
  { id: "S11", name: "Green chillies", unit: "kg", cat: "Veg", par: 10, system: 6, cost: 60, vendor: "Rajesh Traders, Bowenpally market" },
  { id: "S12", name: "Mint + coriander", unit: "bunch", cat: "Veg", par: 60, system: 22, cost: 8, vendor: "Rajesh Traders, Bowenpally market" },
  { id: "S13", name: "Refined sunflower oil", unit: "L", cat: "Dry", par: 90, system: 74, cost: 142, vendor: "Deccan Rice Traders, Begum Bazaar" },
  { id: "S14", name: "Eggs", unit: "tray", cat: "Dairy", par: 12, system: 7, cost: 168, vendor: "Sri Sai Poultry, Bowenpally" },
];
const OUTLET_FACTOR: Record<KitchenId, number> = { BH: 1, GB: 0.85, KP: 0.7, MD: 0.9, KK: 0.6 };

type Waste = { id: string; time: string; kitchen: KitchenId; item: string; qty: string; value: number; reason: "Spoilage" | "Over-production" | "Plate return" | "Burnt / dropped" | "Expired"; by: string };
const wasteSeed: Waste[] = [
  { id: "W01", time: "Today 11:40", kitchen: "KP", item: "Tandoori chicken, marinated", qty: "3.2 kg", value: 1340, reason: "Burnt / dropped", by: "Raju Yadav" },
  { id: "W02", time: "Today 10:15", kitchen: "BH", item: "Mint chutney batch", qty: "1.5 kg", value: 180, reason: "Spoilage", by: "Bhaskar" },
  { id: "W03", time: "Mon 23:10", kitchen: "MD", item: "Chicken dum biryani", qty: "11 portions", value: 1232, reason: "Over-production", by: "Shafi ustad" },
  { id: "W04", time: "Mon 22:40", kitchen: "KK", item: "Mutton biryani", qty: "6 portions", value: 1128, reason: "Over-production", by: "Arif" },
  { id: "W05", time: "Mon 21:05", kitchen: "GB", item: "Dal makhani", qty: "4 portions", value: 208, reason: "Plate return", by: "Sneha Reddy" },
  { id: "W06", time: "Mon 16:30", kitchen: "KP", item: "Fresh cream", qty: "2 L", value: 480, reason: "Expired", by: "Mahesh Goud" },
  { id: "W07", time: "Mon 14:20", kitchen: "BH", item: "Butter naan dough", qty: "4 kg", value: 220, reason: "Spoilage", by: "Raju Yadav" },
  { id: "W08", time: "Mon 13:05", kitchen: "KP", item: "Chicken tikka", qty: "1.8 kg", value: 760, reason: "Burnt / dropped", by: "Raju Yadav" },
  { id: "W09", time: "Sun 23:30", kitchen: "MD", item: "Veg dum biryani", qty: "8 portions", value: 592, reason: "Over-production", by: "Shafi ustad" },
  { id: "W10", time: "Sun 20:50", kitchen: "GB", item: "Paneer butter masala", qty: "2 portions", value: 192, reason: "Plate return", by: "Sneha Reddy" },
  { id: "W11", time: "Sun 12:10", kitchen: "KK", item: "Tomatoes", qty: "6 kg", value: 168, reason: "Spoilage", by: "Arif" },
  { id: "W12", time: "Sat 22:55", kitchen: "KP", item: "Rumali roti dough", qty: "3 kg", value: 150, reason: "Over-production", by: "Mahesh Goud" },
];
const WASTE_REASONS: Waste["reason"][] = ["Spoilage", "Over-production", "Plate return", "Burnt / dropped", "Expired"];
const wasteTone: Record<Waste["reason"], Tone> = { Spoilage: "warn", "Over-production": "accent", "Plate return": "info", "Burnt / dropped": "late", Expired: "neutral" };

type PO = { id: string; vendor: string; cat: "Chicken + eggs" | "Mutton" | "Veg" | "Dairy" | "Dry"; items: string; value: number; kitchen: string; eta: string; col: "Draft" | "Sent" | "In transit" | "Received" };
const poSeed: PO[] = [
  { id: "PO-1418", vendor: "Sri Sai Poultry", cat: "Chicken + eggs", items: "Curry cut 60 kg, boneless 30 kg, eggs 8 trays", value: 31440, kitchen: "All 5", eta: "Wed 6:00 AM", col: "Draft" },
  { id: "PO-1419", vendor: "Rajesh Traders", cat: "Veg", items: "Onion 160 kg, tomato 90 kg, mint 80 bunches", value: 8920, kitchen: "All 5", eta: "Wed 5:30 AM", col: "Draft" },
  { id: "PO-1415", vendor: "Godavari Dairy Farms", cat: "Dairy", items: "Paneer 20 kg, cream 15 L, curd 40 kg", value: 13280, kitchen: "BH, GB, KP", eta: "Today 4:00 PM", col: "Sent" },
  { id: "PO-1416", vendor: "Deccan Meat Co.", cat: "Mutton", items: "Mutton biryani cut 22 kg", value: 17160, kitchen: "MD, KK", eta: "Today 3:30 PM", col: "Sent" },
  { id: "PO-1412", vendor: "Deccan Rice Traders", cat: "Dry", items: "Basmati sella 250 kg, oil 60 L", value: 38020, kitchen: "Central store", eta: "Today 1:30 PM", col: "In transit" },
  { id: "PO-1410", vendor: "Sri Sai Poultry", cat: "Chicken + eggs", items: "Curry cut 55 kg, boneless 28 kg", value: 19670, kitchen: "All 5", eta: "Delivered 6:10 AM", col: "Received" },
  { id: "PO-1411", vendor: "Rajesh Traders", cat: "Veg", items: "Onion 150 kg, tomato 80 kg, chillies 12 kg", value: 7960, kitchen: "All 5", eta: "Delivered 5:50 AM", col: "Received" },
];

const licences = [
  { kitchen: "BH" as KitchenId, no: "13624012000418", type: "State licence", expires: "14 Mar 2027", days: 145, audit: "A, Jun 2026" },
  { kitchen: "GB" as KitchenId, no: "13624015001127", type: "State licence", expires: "2 Aug 2027", days: 286, audit: "A, Aug 2026" },
  { kitchen: "KP" as KitchenId, no: "13625011000936", type: "State licence", expires: "12 Nov 2026", days: 23, audit: "B, Apr 2026" },
  { kitchen: "MD" as KitchenId, no: "13625018002210", type: "State licence", expires: "30 Jan 2027", days: 102, audit: "A, Sep 2026" },
  { kitchen: "KK" as KitchenId, no: "23625019000874", type: "Registration", expires: "18 Dec 2026", days: 59, audit: "Pending" },
];
const hygieneSeed = [
  { id: "H1", label: "Fridge + cold room temperature log, 3 times a day", sub: "Below 5°C chillers, below -18°C freezers · 4 of 5 kitchens logged today", done: false },
  { id: "H2", label: "Pest control visit, Kondapur", sub: "Due today · HiCare, 3 PM slot", done: false },
  { id: "H3", label: "Water TDS + bacteria test, CK Madhapur", sub: "Report from Vimta Labs uploaded Saturday", done: true },
  { id: "H4", label: "Food handler medical certificates", sub: "4 of 62 staff pending renewal", done: false },
  { id: "H5", label: "FoSTaC-trained supervisor on every shift", sub: "Kukatpally night shift uncovered on Thu and Fri", done: false },
  { id: "H6", label: "Oil TPC check before frying (below 25%)", sub: "Chicken 65 fryer changed at 11 AM, Gachibowli", done: true },
];

/* ---------------- Guests ---------------- */

type Booking = { id: string; name: string; phone: string; kitchen: "BH" | "GB" | "KP"; at: number; pax: number; table?: string; occasion?: string; source: "Phone" | "Google" | "Zomato Dining" | "WhatsApp" | "Walk-in"; status: "Confirmed" | "Seated" | "Waitlist" | "No-show" | "Cancelled"; visits: number; note?: string };
const bookingSeed: Booking[] = [
  { id: "B01", name: "Ananya Rao", phone: "98490 21187", kitchen: "BH", at: 13, pax: 4, table: "T7", source: "Zomato Dining", status: "Seated", visits: 6 },
  { id: "B02", name: "Karthik & team (Deloitte)", phone: "90009 44218", kitchen: "GB", at: 13.5, pax: 12, table: "T14+T15", occasion: "Team lunch", source: "WhatsApp", status: "Confirmed", visits: 3, note: "Fixed menu ₹799 per head, GST bill on company" },
  { id: "B03", name: "Farah Khan", phone: "99895 10023", kitchen: "BH", at: 19.5, pax: 2, table: "T3", occasion: "Anniversary", source: "Google", status: "Confirmed", visits: 1, note: "Window table, cake from outside allowed" },
  { id: "B04", name: "Rohit Agarwal", phone: "98665 77120", kitchen: "BH", at: 20, pax: 6, table: "T10", source: "Phone", status: "Confirmed", visits: 14, note: "Regular. Likes Pathar ka Gosht, ask chef" },
  { id: "B05", name: "Meghana Reddy", phone: "70133 66281", kitchen: "KP", at: 20, pax: 4, table: "T4", source: "Zomato Dining", status: "Confirmed", visits: 2 },
  { id: "B06", name: "Sanjay Mehta", phone: "98480 33019", kitchen: "GB", at: 20.5, pax: 8, table: "T9", occasion: "Birthday", source: "Phone", status: "Confirmed", visits: 5, note: "Birthday for son, 10 yrs. Candle on Double ka Meetha" },
  { id: "B07", name: "Lakshmi Prasanna", phone: "91779 02311", kitchen: "BH", at: 20.5, pax: 3, source: "Walk-in", status: "Waitlist", visits: 0 },
  { id: "B08", name: "Imtiaz Hussain", phone: "99491 88420", kitchen: "BH", at: 21, pax: 5, table: "T12", source: "Google", status: "Confirmed", visits: 2 },
  { id: "B09", name: "Divya & Arjun", phone: "96666 21470", kitchen: "KP", at: 21, pax: 2, table: "T2", source: "WhatsApp", status: "Confirmed", visits: 1 },
  { id: "B10", name: "Venkat Ramana", phone: "94400 51198", kitchen: "GB", at: 21, pax: 4, source: "Zomato Dining", status: "Cancelled", visits: 1, note: "Cancelled 11:10 AM, rain" },
  { id: "B11", name: "Ayaan Siddiqui", phone: "90300 77561", kitchen: "BH", at: 21.5, pax: 4, source: "Walk-in", status: "Waitlist", visits: 0 },
  { id: "B12", name: "Neha Kulkarni", phone: "98853 10442", kitchen: "GB", at: 19, pax: 2, table: "T5", source: "Google", status: "Confirmed", visits: 0 },
  { id: "B13", name: "Pradeep Varma", phone: "77027 31984", kitchen: "KP", at: 13, pax: 3, table: "T6", source: "Phone", status: "No-show", visits: 2, note: "Called twice, no answer" },
  { id: "B14", name: "Suresh Babu family", phone: "98660 42213", kitchen: "BH", at: 21.5, pax: 9, table: "T15", occasion: "Family dinner", source: "Phone", status: "Confirmed", visits: 8, note: "2 kids' chairs, one guest Jain" },
];
const bookingTone: Record<Booking["status"], Tone> = { Confirmed: "info", Seated: "ok", Waitlist: "warn", "No-show": "late", Cancelled: "neutral" };

type TableState = "Free" | "Seated" | "Reserved" | "Cleaning";
type FloorTable = { id: string; seats: number; state: TableState; guest?: string; mins?: number };
function floorFor(k: "BH" | "GB" | "KP"): FloorTable[] {
  const n = k === "GB" ? 15 : k === "BH" ? 15 : 10;
  const pattern: TableState[] = ["Seated", "Free", "Reserved", "Seated", "Cleaning", "Seated", "Seated", "Free", "Reserved", "Seated", "Free", "Reserved", "Seated", "Free", "Reserved"];
  const guests = ["Ananya R", "Rao party", "Mehta", "Walk-in", "Khan", "Reddy", "Corporate", "Varma"];
  return Array.from({ length: n }, (_, i) => ({
    id: `T${i + 1}`,
    seats: [4, 2, 2, 4, 6, 4, 4, 2, 8, 6, 4, 6, 2, 6, 10][i],
    state: pattern[(i + (k === "KP" ? 3 : k === "GB" ? 1 : 0)) % pattern.length],
    guest: guests[(i + k.length) % guests.length],
    mins: 12 + ((i * 17) % 58),
  }));
}
const tableTone: Record<TableState, Tone> = { Free: "ok", Seated: "accent", Reserved: "info", Cleaning: "warn" };

type Review = { id: string; kitchen: KitchenId; author: string; stars: number; text: string; when: string; source: "Google" | "Zomato"; reply?: string; tags: string[] };
const reviewSeed: Review[] = [
  { id: "R1", kitchen: "KP", author: "Sai Charan", stars: 2, text: "Waited 40 minutes for tandoori chicken and it came half burnt. Staff were polite but the kitchen is clearly understaffed on Sundays.", when: "2 h ago", source: "Google", tags: ["Slow", "Burnt"] },
  { id: "R2", kitchen: "BH", author: "Nikhita Menon", stars: 5, text: "Best Pathar ka Gosht in Banjara Hills, hands down. The chef came out to explain how the stone is heated. Lovely evening.", when: "5 h ago", source: "Google", tags: ["Food", "Service"] },
  { id: "R3", kitchen: "MD", author: "Rahul T", stars: 4, text: "Hyderabadi Handi biryani is the real deal, long grain and proper dum. Raita was missing though.", when: "Yesterday", source: "Zomato", tags: ["Missing item"] },
  { id: "R4", kitchen: "GB", author: "Priyanka Das", stars: 3, text: "Office lunch for 10. Food good, but the bill took 25 minutes and they could not split it by card.", when: "Yesterday", source: "Google", tags: ["Billing"] },
  { id: "R5", kitchen: "KK", author: "Mohammed Faiz", stars: 1, text: "Ordered mutton biryani, got a call after 30 minutes that it is not available. Cancelled. Waste of time.", when: "Yesterday", source: "Zomato", tags: ["Stock-out", "Cancelled"] },
  { id: "R6", kitchen: "BH", author: "Aditi Joshi", stars: 5, text: "Irani chai and Osmania biscuits after dinner, perfect. Live ghazal on Friday is a lovely touch.", when: "2 days ago", source: "Google", tags: ["Ambience"], reply: "Thank you Aditi! Ghazal nights are every Friday from 8. See you soon. – Ayesha" },
  { id: "R7", kitchen: "KP", author: "Venu Gopal", stars: 3, text: "Curries were oily today compared to my last visit. Dal makhani still excellent.", when: "2 days ago", source: "Google", tags: ["Oily"] },
  { id: "R8", kitchen: "GB", author: "Shreya Iyer", stars: 4, text: "Quick weekday lunch, the thali combo is value for money. Parking is a struggle.", when: "3 days ago", source: "Google", tags: ["Value"] },
];
function draftReply(r: Review) {
  if (r.stars >= 4) return `Thank you ${r.author.split(" ")[0]}! So glad you enjoyed ${KITCHEN_NAME[r.kitchen]}. ${r.tags.includes("Missing item") ? "Sorry about the missing raita; we've added a packing check at the pass. " : ""}Hope to serve you again soon. – Ayesha, Tadka Junction`;
  return `Dear ${r.author.split(" ")[0]}, I'm sorry about your experience at ${KITCHEN_NAME[r.kitchen]}. ${r.tags.includes("Stock-out") ? "The item should have been switched off before you could order it; we now turn items off automatically when stock runs out. " : r.tags.includes("Slow") || r.tags.includes("Burnt") ? "We've added a second tandoor cook on weekends and the chef is reviewing the batch. " : "I've shared this with the outlet chef. "}Please WhatsApp me on 98490 55120 and your next meal is on us. – Ayesha Siddiqui, Founder`;
}

/* ---------------- Shared modules ---------------- */

const team: TeamMember[] = [
  { name: "Ayesha Siddiqui", role: "Founder & head chef", status: "Busy", load: 94, focus: "Kondapur food cost and the KK Zomato rating", phone: "98490 55120", since: "2017", tasks: [{ title: "Approve day-close variances", due: "11:30" }, { title: "Tasting: new Wok Junction menu", due: "4:00" }, { title: "Swiggy account manager call", due: "5:30" }], week: [1, 1, 1, 1, 1, 1] },
  { name: "Raju Yadav", role: "Executive sous chef, tandoor + curry", status: "On floor", load: 88, focus: "Kondapur tandoor: burnt tikka and slow tickets", since: "2018", tasks: [{ title: "Train new tandoor cook at KP", due: "3:00" }, { title: "Marinade batch for dinner", due: "5:00" }], week: [1, 1, 1, 1, 1, 1] },
  { name: "Mohd. Shafi", role: "Biryani ustad, central dum", status: "On floor", load: 82, focus: "Degh count for dinner: 6 chicken, 3 mutton, 1 veg", since: "2017", tasks: [{ title: "Dum 4 deghs for MD by 6 PM", due: "6:00" }, { title: "Cut mutton par for KK", due: "4:30", done: true }], week: [1, 1, 1, 1, 1, 0] },
  { name: "Faisal Khan", role: "Outlet manager, Banjara Hills", status: "On floor", load: 71, focus: "14 bookings tonight, 2 on waitlist", since: "2019", tasks: [{ title: "Floor plan for 9 pax at 9:30", due: "7:00" }, { title: "Reply to 3 Google reviews", due: "2:00" }], week: [1, 1, 1, 1, 0, 1] },
  { name: "Priya Nair", role: "Cloud kitchens + aggregator ops", status: "Busy", load: 90, focus: "Wok Junction offline on Zomato since 11:20", since: "2020", tasks: [{ title: "Get Wok Junction back online", due: "now" }, { title: "Ads review with Swiggy", due: "5:30" }, { title: "Fix Qubani photo on Swiggy", due: "Wed" }], week: [1, 1, 1, 1, 1, 1] },
  { name: "Srikanth Rao", role: "Purchase + central store", status: "In field", load: 66, focus: "At Bowenpally market for veg; chicken rate ₹6 up", since: "2019", tasks: [{ title: "Send Wednesday POs", due: "6:00" }, { title: "Godavari Dairy rate revision", due: "Thu" }], week: [1, 1, 1, 1, 1, 1] },
  { name: "Lakshmi Devi", role: "Accounts + day close", status: "On floor", load: 63, focus: "Swiggy and Zomato payout reconciliation for week 41", since: "2018", tasks: [{ title: "Match Zomato payout ₹4.1 L", due: "1:00" }, { title: "GSTR-1 data to CA", due: "Fri" }], week: [1, 1, 1, 1, 1, 0] },
  { name: "Tenzin Dorje", role: "Chinese station head", status: "Off", load: 30, focus: "Night shift at MD; back at 4 PM", since: "2021", tasks: [{ title: "Wok Junction new sauces tasting", due: "4:00" }], week: [1, 1, 0, 1, 1, 1] },
];

const agents: WorkforceAgent[] = [
  { name: "Pass Watcher", role: "Times every KOT against the promise and pings the station", icon: Timer, status: "Running", runsToday: 1840, hoursSaved: 6, accuracy: 98, last: "just now", skills: ["Petpooja KDS", "Swiggy KPT", "Zomato KPT"], schedule: "Every 5 seconds during service", log: ["KK Chinese ticket crossed promise, told Tenzin's backup", "Rider waiting at BH pass, biryani 40 s from ready", "Lunch breach rate 7.8%, down from 9.1%"] },
  { name: "Menu Switch", role: "Turns items off on Swiggy and Zomato when stock runs out", icon: Power, status: "Needs you", runsToday: 14, hoursSaved: 3, accuracy: 95, last: "8 min ago", skills: ["Stock count", "Swiggy menu API", "Zomato menu API"], schedule: "On every stock change", inbox: [{ title: "Mutton biryani at KK: 4 portions left", detail: "Switched off on Zomato already. Switch off on Swiggy too, or move 3 kg mutton from MD in the 2 PM run?" }], log: ["Off: Mutton biryani on Zomato KK", "On: Paneer tikka after GRN at GB", "Qubani photo rejected on Swiggy, flagged to Priya"] },
  { name: "Review Responder", role: "Drafts replies to Google and Zomato reviews in Ayesha's voice", icon: MessageSquareReply, status: "Needs you", runsToday: 9, hoursSaved: 2.5, accuracy: 91, last: "20 min ago", skills: ["Google Business Profile", "Zomato reviews", "Tone match"], schedule: "Every hour", inbox: [{ title: "2 one- and two-star reviews need your sign-off", detail: "Kondapur burnt tandoori and the KK mutton cancellation. Drafts offer a free meal on WhatsApp." }], log: ["Replied to 5 four- and five-star reviews", "Tagged 'Slow' x3 at Kondapur this week", "Weekly review digest sent"] },
  { name: "Purchase Planner", role: "Drafts tomorrow's POs from par levels and the dinner forecast", icon: Package, status: "Running", runsToday: 3, hoursSaved: 4, accuracy: 89, last: "35 min ago", skills: ["Stock count", "Sales forecast", "Vendor rates"], schedule: "11 AM and 6 PM", log: ["Drafted PO-1418 chicken ₹31,440", "Chicken rate +₹6/kg at Bowenpally, flagged", "Mutton par raised at KK for weekend"] },
  { name: "Day Close Auditor", role: "Checks cash, voids, comps and staff meals at every close", icon: Receipt, status: "Running", runsToday: 5, hoursSaved: 3.5, accuracy: 96, last: "7:10 AM", skills: ["Petpooja", "Pine Labs", "Tally"], schedule: "After every outlet close", log: ["KP cash short ₹1,240, sent for approval", "2 voids after fire at BH flagged", "Swiggy payout matched to the rupee"] },
  { name: "Ads Optimiser", role: "Moves Swiggy and Zomato ad budget to what returns orders", icon: Megaphone, status: "Idle", runsToday: 2, hoursSaved: 2, accuracy: 86, last: "9:00 AM", skills: ["Swiggy ads", "Zomato ads", "ROI by slot"], schedule: "Daily 9 AM", log: ["KP dinner banner ROI 2.9x, suggest pause", "Handi carousel 8.8x, suggest +₹1,000/day", "Rain forecast Thu, rainy-day boost ready"] },
];

const independence: IndependenceData = {
  score: 44,
  history: [28, 31, 33, 36, 38, 41, 44],
  quote: "If I am not at the pass on a Sunday, the Kondapur tandoor falls apart and I hear about it from Zomato, not from my team.",
  pillars: [
    { name: "Kitchen & pass", score: 48, note: "Shafi and Raju run the line, but rush calls still go to Ayesha.", fixes: [{ title: "Station leads own breach alerts", gain: 3 }, { title: "Weekend second tandoor cook", gain: 2 }] },
    { name: "Recipes & food cost", score: 39, note: "Recipes live in Ayesha's head; Kondapur portions drift.", fixes: [{ title: "Recipe cards with gram weights", gain: 4 }, { title: "Weekly food cost by outlet", gain: 2 }] },
    { name: "Aggregators", score: 52, note: "Priya runs the platforms well; ad budgets still wait for Ayesha.", fixes: [{ title: "Ad budget rules by ROI", gain: 3 }] },
    { name: "Purchase & stores", score: 46, note: "Srikanth buys well, but every new vendor rate is approved by the owner.", fixes: [{ title: "Rate bands per item", gain: 3 }] },
    { name: "Cash & day close", score: 41, note: "Every void and comp above ₹500 waits for her WhatsApp OK.", fixes: [{ title: "Manager limit ₹2,000", gain: 3 }, { title: "Auto-match aggregator payouts", gain: 2 }] },
    { name: "Guests & reviews", score: 37, note: "Ayesha replies to every bad review herself, often days late.", fixes: [{ title: "Approved reply drafts", gain: 3 }] },
    { name: "Owner time", score: 43, note: "18 hours a week on the line, 9 on calls from outlets.", fixes: [{ title: "Daily 15-min huddle instead of calls", gain: 2 }] },
  ],
  ownerHours: [
    { label: "On the line", hours: 18 },
    { label: "Outlet calls", hours: 9 },
    { label: "Purchase", hours: 5 },
    { label: "Aggregators", hours: 6 },
    { label: "Reviews", hours: 4 },
    { label: "Cash + close", hours: 4 },
    { label: "New menu", hours: 2 },
  ],
};

const integrations: Integration[] = [
  { name: "Petpooja POS", category: "Billing + KDS", status: "Connected", detail: "Bills, KOTs, tables and item sales from all 5 kitchens.", synced: "live", records: "1.2 L bills", mark: "PP", color: "#e4572e" },
  { name: "Swiggy Partner", category: "Aggregator", status: "Connected", detail: "Orders, KPT, ratings, payouts and menu on/off for 6 listings.", synced: "live", records: "6 listings", mark: "S", color: "#fc8019" },
  { name: "Zomato Partner", category: "Aggregator", status: "Connected", detail: "Orders, prep time, reviews, ads and table bookings.", synced: "live", records: "6 listings", mark: "Z", color: "#e23744" },
  { name: "Google Business Profile", category: "Reviews", status: "Connected", detail: "Reviews and replies for the 3 dine-in outlets.", synced: "12 min ago", records: "4,812 reviews", mark: "G", color: "#4285f4" },
  { name: "WhatsApp Business", category: "Messaging", status: "Connected", detail: "Booking confirmations, vendor POs and outlet groups.", synced: "just now", records: "9,340 chats", mark: "W", color: "#1f9d55" },
  { name: "Tally Prime", category: "Accounts", status: "Syncing", detail: "Day-close vouchers, purchases and aggregator payouts.", synced: "syncing", records: "22,610 vouchers", mark: "T", color: "#1c4f9c" },
  { name: "Pine Labs EDC", category: "Payments", status: "Connected", detail: "Card and UPI settlements matched to day close.", synced: "7:00 AM", records: "6 terminals", mark: "PL", color: "#2f3a8f" },
  { name: "Cold-room sensors", category: "Food safety", status: "Error", detail: "Kukatpally walk-in chiller sensor offline since 6:40 AM.", synced: "6:40 AM", records: "11 probes", mark: "°C", color: "#3aa6b9" },
  { name: "FSSAI FoSCoS", category: "Compliance", status: "Connected", detail: "Licence validity, renewals and annual returns.", synced: "Mon", records: "5 licences", mark: "FS", color: "#5b6c8f" },
  { name: "Hyperpure", category: "Purchase", status: "Available", detail: "Compare chicken, dairy and dry goods rates with current vendors.", synced: "—", records: "—", mark: "HP", color: "#c03a4a" },
];

/* ============================================================
   Config
   ============================================================ */

const config: DeskConfig = {
  slug: "restaurant",
  company: "Tadka Junction Kitchens",
  brand: "Tadka Junction",
  city: "Hyderabad",
  state: "TG",
  icon: ChefHat,
  tagline: "3 dine-in outlets · 2 cloud kitchens · Swiggy + Zomato · 128 staff",
  owner: { name: "Ayesha Siddiqui", first: "Ayesha", initials: "AS", role: "Founder & head chef" },
  theme: {
    variant: "control",
    paper: "#110c0a",
    panel: "#1a1310",
    sunk: "#150f0c",
    ink: "#f4e9df",
    mute: "#a8958a",
    line: "#2f241e",
    accent: "#e85d2a",
    accentInk: "#1c0a02",
    soft: "#2d1a11",
    ok: "#5fd6a4",
    warn: "#e7b13a",
    late: "#f2564b",
    info: "#71b4e0",
    heading: "mono",
  },
  pulse: [
    { label: "Net sales today", value: "₹4.87 L", delta: "+8%", trend: [3.9, 4.1, 4.4, 4.2, 4.6, 4.5, 4.87], module: "outlets" },
    { label: "Avg prep time", value: "13.8 min", delta: "-0.9", good: true, trend: [15.2, 15, 14.8, 14.6, 14.5, 14.7, 13.8], tone: "ok", module: "pass" },
    { label: "Prep breaches", value: "9", delta: "+2", good: false, trend: [6, 8, 7, 9, 7, 7, 9], tone: "late", module: "aggregators" },
    { label: "Food cost MTD", value: "31.9%", delta: "+0.6", good: false, trend: [31.1, 31.2, 31.4, 31.3, 31.6, 31.8, 31.9], tone: "warn", module: "menu" },
    { label: "Swiggy · Zomato", value: "4.3 · 4.1", delta: "-0.1", good: false, trend: [4.3, 4.3, 4.3, 4.2, 4.2, 4.2, 4.2], tone: "info", module: "aggregators" },
  ],
  agenda: [
    { at: 11, title: "Day-close approvals", detail: "Cash short at KP, 2 voids at BH", count: 5, tone: "warn", module: "outlets" },
    { at: 12.5, title: "Lunch rush on the pass", detail: "Peak 12:30–2:00, 5 kitchens", count: 18, tone: "accent", module: "pass" },
    { at: 14, title: "Review replies", detail: "2 low-star reviews waiting", count: 5, tone: "late", module: "guests" },
    { at: 15, title: "Pest control, Kondapur", detail: "HiCare 3 PM, FSSAI checklist", count: 1, tone: "info", module: "inventory" },
    { at: 17.5, title: "Swiggy ads review", detail: "KP banner at 2.9x ROI", count: 6, tone: "neutral", module: "aggregators" },
    { at: 18, title: "Send Wednesday POs", detail: "Chicken, veg, dairy drafts", count: 2, tone: "warn", module: "inventory" },
  ],
  activity: [
    { time: "12:41 PM", text: "Pass Watcher: KK Dragon Chicken past promise, rider waiting 2 min", tone: "late" },
    { time: "12:20 PM", text: "Menu Switch turned Mutton Dum Biryani off on Zomato at KK", tone: "warn" },
    { time: "11:20 AM", text: "Wok Junction went offline on Zomato (tablet logged out at MD)", tone: "late" },
    { time: "10:05 AM", text: "Sri Sai Poultry delivered 83 kg chicken, GRN posted", tone: "ok" },
    { time: "9:00 AM", text: "Ads Optimiser: Handi carousel at 8.8x ROI, KP banner at 2.9x", tone: "info" },
    { time: "7:10 AM", text: "Day Close Auditor: 5 items need approval from last night", tone: "warn" },
  ],
  asks: [
    { q: "Why is Kondapur losing money?", a: "Kondapur makes 7% EBITDA against 18% at Banjara Hills. Three reasons:\n\n• Food cost 34.9%, 3.4 pts over target. Tandoor wastage is ₹2,100 this week (burnt tikka, dropped marinade) and tikka portions weigh 12% over the recipe.\n• Swiggy and Zomato breaches at 14–16% have pushed the rating to 4.0 / 3.9, so orders are down 5% on last month.\n• Labour is 20% of sales; Sunday dinner has one tandoor cook for a 72-seat floor.\n\nFix the tikka portion and add a weekend tandoor cook: about ₹68k a month back.", sources: ["Outlet P&L", "Wastage log", "Swiggy KPT", "Petpooja item sales"] },
    { q: "Which riders are waiting on us right now?", a: "Right now on the pass:\n\n• Banjara Hills: Imran is at the pass for SW 1784 22104. Biryani is 40 seconds from ready, lassi still on the beverage station.\n• CK Kukatpally: Abdul Rehman has waited 2 minutes for Dragon Chicken, which is already past its 11-minute promise.\n• CK Madhapur: Prakash's Manchurian is ready. Hand it over now.\n\nEvery rider wait over 5 minutes counts against the kitchen prep time score on Swiggy.", sources: ["Kitchen pass", "Swiggy rider tracking", "Zomato rider tracking"] },
    { q: "Should we raise the price of chicken biryani?", a: "Yes, by ₹10, to ₹359.\n\n• It sells 4,820 a month and earns ₹237 each, just ₹1 under the category average, so it shows as a plowhorse.\n• At ₹359 the projected drop is about 140 plates, and the margin per plate rises to ₹247.\n• Net effect: about +₹13,600 a month, and it becomes a star.\n\nSwiggy and Zomato prices update together from Petpooja. Keep the dine-in price the same if you want to protect the Banjara Hills lunch crowd.", sources: ["Menu engineering", "Petpooja item sales", "Recipe costing"] },
    { q: "What do we need to order for tomorrow?", a: "Purchase Planner has two drafts ready, plus one gap:\n\n• PO-1418 Sri Sai Poultry ₹31,440: curry cut 60 kg, boneless 30 kg, 8 trays of eggs. Rate is up ₹6/kg this week.\n• PO-1419 Rajesh Traders ₹8,920: onion 160 kg, tomato 90 kg, mint 80 bunches.\n• Gap: mutton at KK is 11 kg against a 25 kg par. PO-1416 arrives at 3:30 PM, so keep mutton biryani switched off until then.\n\nSend both drafts by 6 PM for 6 AM delivery.", sources: ["Stock count", "Vendor POs", "Dinner forecast"] },
    { q: "Are our ads on Swiggy and Zomato worth it?", a: "Mostly, but one is losing money.\n\n• Hyderabadi Handi carousel on Swiggy: ₹18.4k spent, ₹1.63 L sales, 8.8x. Increase the budget.\n• Handi search ads on Zomato: 7.8x. Keep.\n• Tadka Junction KP dinner banner on Zomato: ₹9.6k for ₹27k sales, 2.9x. After the 22% commission and food cost, it loses about ₹1,900.\n\nPause the KP banner until the prep time is fixed. Ads only bring more breaches if the kitchen is slow.", sources: ["Swiggy ads", "Zomato ads", "Outlet P&L"] },
    { q: "Draft a reply to the 1-star Zomato review at Kukatpally", a: "Draft (not sent):\n\n“Dear Mohammed, I'm sorry. The mutton biryani should never have been available to order when we had run out. We now switch items off automatically the moment stock runs out. Please WhatsApp me on 98490 55120 and your next biryani is on us. – Ayesha Siddiqui, Founder”\n\nThe same fix shows up on Zomato as a lower cancellation rate within about 10 days.", sources: ["Zomato reviews", "Menu Switch log"] },
  ],
  run: {
    label: "Runs every 15 minutes during service. You can also run it now.",
    title: "Service Watch",
    steps: [
      { text: "Read every open KOT from Petpooja, Swiggy and Zomato", result: "18 on the rail, 4 past promise" },
      { text: "Match rider arrival ETAs to ticket timers", result: "2 riders waiting, 1 handover ready" },
      { text: "Check stock against items live on the menus", result: "Mutton at KK low, Zomato already off" },
      { text: "Compare prep breaches by outlet and hour", result: "Kondapur tandoor 13:00 is the hotspot" },
      { text: "Check listings, ratings and ad spend", result: "Wok Junction offline on Zomato, KP banner at 2.9x" },
    ],
    outcome: "Lunch is running 0.9 min faster than last Tuesday, but Kondapur's tandoor and Kukatpally's Chinese station are behind. Moving one cook to the KP tandoor until 2 PM and bringing Wok Junction back online on Zomato protects about ₹38k of lunch orders.",
    actions: ["Move a cook to the KP tandoor", "Bring Wok Junction online", "Switch off mutton biryani on Swiggy KK", "Pause KP banner ad"],
  },
};

/* ============================================================
   Desk
   ============================================================ */

type PassApi = {
  tickets: Ticket[];
  t0: number | null;
  extra: Record<"Swiggy" | "Zomato", number>;
  setExtra: (src: "Swiggy" | "Zomato", minutes: number) => void;
  bump: (id: string) => void;
  handover: (id: string) => void;
  refire: (id: string) => void;
};

export default function RestaurantDesk() {
  const [tickets, setTickets] = React.useState<Ticket[]>(ticketSeed);
  const [t0, setT0] = React.useState<number | null>(null);
  const [extra, setExtraState] = React.useState<Record<"Swiggy" | "Zomato", number>>({ Swiggy: 0, Zomato: 0 });
  const arrivals = React.useRef(0);
  const extraRef = React.useRef(extra);

  React.useEffect(() => {
    extraRef.current = extra;
  }, [extra]);

  React.useEffect(() => {
    const id = window.setTimeout(() => setT0(Date.now()), 0);
    return () => window.clearTimeout(id);
  }, []);

  React.useEffect(() => {
    if (t0 === null) return;
    const arrive = window.setInterval(() => {
      const sec = (Date.now() - t0) / 1000;
      const n = arrivals.current++;
      const tpl = ARRIVALS[n % ARRIVALS.length];
      setTickets((cur) => {
        if (cur.filter((t) => t.status === "fire").length >= 24) return cur;
        const promise = PROMISE[tpl.station] + (tpl.src === "POS" ? 4 : extraRef.current[tpl.src]);
        const order = tpl.src === "POS" ? `${tpl.kitchen}/T${(n % 9) + 1} · bill ${130 + n}` : `${tpl.src === "Swiggy" ? "SW 1784" : "ZO 6421"} ${String(22400 + n * 37).padStart(5, "0")}`;
        const rider = tpl.src === "POS" ? undefined : { name: RIDERS[(n + 3) % RIDERS.length], at: Math.round(sec + promise * 60 + (((n * 53) % 300) - 180)), phone: riderPhone(RIDERS[(n + 3) % RIDERS.length]) };
        const ticket: Ticket = { id: `A${n}`, kot: 5000 + n, order, src: tpl.src, kitchen: tpl.kitchen, station: tpl.station, items: tpl.items, note: tpl.note, promise, born: Math.round(sec), status: "fire", value: tpl.value, rider, table: tpl.src === "POS" ? `T${(n % 9) + 1} · ${2 + (n % 4)} pax` : undefined };
        return [...cur, ticket];
      });
    }, 21000);
    const sim = window.setInterval(() => {
      const sec = (Date.now() - t0) / 1000;
      setTickets((cur) => {
        let changed = false;
        const next = cur.map((t) => {
          if (t.status === "fire" && sec - t.born > t.promise * 60 + 260) {
            changed = true;
            return { ...t, status: "ready" as const, readyAt: Math.round(sec) };
          }
          if (t.status === "ready" && t.readyAt !== undefined) {
            const riderHere = t.rider ? sec >= t.rider.at + 70 : sec - t.readyAt > 150;
            if (riderHere && sec - t.readyAt > 45) {
              changed = true;
              return { ...t, status: "done" as const, doneAt: Math.round(sec) };
            }
          }
          return t;
        });
        return changed ? next : cur;
      });
    }, 5000);
    return () => {
      window.clearInterval(arrive);
      window.clearInterval(sim);
    };
  }, [t0]);

  const nowSec = React.useCallback(() => (t0 === null ? 0 : Math.round((Date.now() - t0) / 1000)), [t0]);
  const bump = React.useCallback((id: string) => setTickets((cur) => cur.map((t) => (t.id === id && t.status === "fire" ? { ...t, status: "ready", readyAt: nowSec() } : t))), [nowSec]);
  const handover = React.useCallback((id: string) => setTickets((cur) => cur.map((t) => (t.id === id ? { ...t, status: "done", readyAt: t.readyAt ?? nowSec(), doneAt: nowSec() } : t))), [nowSec]);
  const refire = React.useCallback((id: string) => setTickets((cur) => cur.map((t) => (t.id === id ? { ...t, status: "fire", born: nowSec(), readyAt: undefined, doneAt: undefined } : t))), [nowSec]);
  const setExtra = React.useCallback((src: "Swiggy" | "Zomato", minutes: number) => setExtraState((cur) => ({ ...cur, [src]: minutes })), []);

  const api: PassApi = { tickets, t0, extra, setExtra, bump, handover, refire };
  const onRail = tickets.filter((t) => t.status === "fire").length;

  const modules: DeskModule[] = [
    {
      id: "pass",
      label: "Kitchen pass",
      count: onRail,
      title: "Kitchen pass",
      blurb: "Every KOT from Petpooja, Swiggy and Zomato on one live rail, by station, against the promised prep time",
      icon: ChefHat,
      notes: ["Tickets slide in from the POS and both aggregators. Timers turn amber at 70% of the promise and red past it.", "Bump a ticket to ready, then hand it over when the rider arrives. Rider ETAs count down on each ticket.", "Use 'Busy +5' when the line is drowning: new aggregator orders get the longer promise."],
      render: () => <PassHome api={api} />,
    },
    { id: "outlets", label: "Outlets & P&L", count: dayClose.length, title: "Outlets & P&L", blurb: "Sales, covers, AOV, food cost and EBITDA for every kitchen, plus last night's day close", icon: Store, render: () => <OutletsTab /> },
    { id: "aggregators", label: "Aggregators", count: listingSeed.filter((l) => !l.online).length + 2, title: "Swiggy & Zomato", blurb: "Ratings, prep-time breaches, cancellations, ads and what's switched on", icon: Bike, render: () => <AggregatorsTab /> },
    { id: "menu", label: "Menu engineering", title: "Menu engineering", blurb: "Stars, plowhorses, puzzles and dogs, by category, with live price edits", icon: BookOpen, render: () => <MenuTab /> },
    { id: "inventory", label: "Inventory & wastage", count: stockSeed.filter((s) => s.system < s.par * 0.6).length, title: "Inventory & wastage", blurb: "Daily stock count, wastage log, vendor POs and FSSAI", icon: Package, render: () => <InventoryTab /> },
    { id: "guests", label: "Reservations & reviews", count: reviewSeed.filter((r) => !r.reply).length, title: "Reservations & reviews", blurb: "Tonight's bookings, the floor, the waitlist and Google reviews with replies", icon: CalendarCheck, render: () => <GuestsTab /> },
    { id: "team", label: "People", title: "People", blurb: "Chefs, outlet managers, stores and accounts: who is carrying what", icon: Users, render: () => <PeopleModule members={team} /> },
    { id: "agents", label: "Agents", title: "Agents", blurb: "Six AI agents watching the pass, the menus, the stores and the reviews", icon: Sparkles, render: () => <AgentsModule agents={agents} /> },
    { id: "independence", label: "Independence", title: "Owner independence", blurb: "How much of Tadka Junction runs without Ayesha at the pass", icon: GaugeIcon, render: () => <IndependenceModule data={independence} /> },
    { id: "connections", label: "Connections", title: "Connections", blurb: "Petpooja, Swiggy, Zomato, Google, Tally, sensors and FSSAI", icon: Plug, render: () => <ConnectionsModule items={integrations} /> },
  ];

  return <DeskShell config={config} modules={modules} />;
}

/* ---------------- Small bits ---------------- */

function Switch({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      title={label}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${on ? "bg-d-ok" : "bg-d-line"}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${on ? "translate-x-[18px]" : "translate-x-[2px]"}`} />
    </button>
  );
}

function SrcBadge({ src }: { src: Src }) {
  return (
    <span className="inline-flex items-center rounded-[4px] px-1.5 py-[1px] font-mono text-[9.5px] font-bold uppercase tracking-wider" style={{ color: src === "POS" ? "var(--d-info)" : "#fff", background: src === "POS" ? "color-mix(in oklab, var(--d-info) 16%, transparent)" : SRC_COLOR[src] }}>
      {src === "POS" ? "Dine-in" : src}
    </span>
  );
}

function Stars({ n, size = 13 }: { n: number; size?: number }) {
  return (
    <span className="inline-flex gap-[1px]">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} style={{ width: size, height: size, color: i <= n ? "var(--d-warn)" : "var(--d-line)" }} fill={i <= n ? "currentColor" : "none"} strokeWidth={1.6} />
      ))}
    </span>
  );
}

function MonoLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-d-mute">{children}</p>;
}

/* ---------------- Home: Kitchen pass ---------------- */

function PassHome({ api }: { api: PassApi }) {
  const desk = useDesk();
  const now = useNow(1000);
  const sales = useDrift(487000, 900, 3500);
  const [kitchen, setKitchen] = React.useState<"All" | KitchenId>("All");
  const [src, setSrc] = React.useState<"All" | Src>("All");
  const [open, setOpen] = React.useState<string | null>(null);
  const sec = now && api.t0 !== null ? Math.max(0, (now.getTime() - api.t0) / 1000) : 0;
  const age = (t: Ticket) => Math.max(0, sec - t.born);
  const active = api.tickets.filter((t) => t.status !== "done");
  const shown = active.filter((t) => (kitchen === "All" || t.kitchen === kitchen) && (src === "All" || t.src === src));
  const firing = active.filter((t) => t.status === "fire");
  const late = firing.filter((t) => age(t) >= t.promise * 60);
  const recentOrders = new Set(api.tickets.filter((t) => t.born > sec - 900).map((t) => t.order));
  const bySrc = (s: Src) => new Set(api.tickets.filter((t) => t.born > sec - 900 && t.src === s).map((t) => t.order)).size;
  const waiting = active.filter((t) => t.rider && t.rider.at <= sec);
  const doneSession = api.tickets.filter((t) => t.status === "done" && t.doneAt !== undefined && t.doneAt > 0);
  const sessionBreaches = api.tickets.filter((t) => t.readyAt !== undefined && t.readyAt > 0 && t.readyAt - t.born > t.promise * 60).length;
  const avgAge = firing.length ? firing.reduce((a, t) => a + age(t), 0) / firing.length : 0;
  const ticket = api.tickets.find((t) => t.id === open) ?? null;

  function doBump(t: Ticket) {
    api.bump(t.id);
    const over = age(t) > t.promise * 60;
    toast.success(`KOT ${t.kot} ready · ${t.station}`, { description: `${KITCHEN_NAME[t.kitchen]} · ${fmtAge(age(t))} against ${t.promise}:00${over ? " · counted as a breach" : ""}` });
    desk.log(`KOT ${t.kot} (${t.src}, ${t.kitchen}) bumped ready in ${fmtAge(age(t))}`, over ? "warn" : "ok");
  }
  function doHandover(t: Ticket) {
    api.handover(t.id);
    toast.success(t.src === "POS" ? `KOT ${t.kot} served to ${t.table?.split(" ·")[0]}` : `Handed to ${t.rider?.name ?? "rider"}`, { description: `${t.order} · ${inr(t.value)}` });
    desk.log(t.src === "POS" ? `KOT ${t.kot} served at ${KITCHEN_NAME[t.kitchen]}` : `${t.order} picked up by ${t.rider?.name}`, "ok");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Orders today" value={String(612 + doneSession.length)} delta="+11%" hint="vs last Tuesday, same hour" icon={Receipt} trend={[420, 468, 512, 540, 566, 590, 612 + doneSession.length]} />
        <Stat label="Avg ticket time, lunch" value={`${(13.8 + (avgAge - 380) / 600).toFixed(1)} min`} delta="-0.9" deltaGood={false} hint="KOT fired to bumped" icon={Timer} tone="ok" trend={[15.2, 15, 14.8, 14.6, 14.5, 14.7, 13.8]} />
        <Stat label="Prep breaches today" value={String(9 + sessionBreaches)} delta="+2" deltaGood={false} hint={`${late.length} on the rail right now`} icon={AlertTriangle} tone="late" trend={[6, 8, 7, 9, 7, 7, 9 + sessionBreaches]} />
        <Stat label="Net sales today" value={inr(sales, { compact: true })} delta="+8%" hint="all 5 kitchens, live from Petpooja" icon={IndianRupee} tone="accent" trend={[110, 182, 240, 310, 372, 430, Math.round(sales / 1000)]} />
      </div>

      <Panel
        live
        title="Kitchen pass"
        sub="Live KOT rail from Petpooja, Swiggy and Zomato. Timers run against the promised prep time."
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            {(["Swiggy", "Zomato"] as const).map((p) => (
              <Btn
                key={p}
                size="sm"
                variant={api.extra[p] ? "solid" : "outline"}
                icon={Zap}
                onClick={() => {
                  const next = api.extra[p] ? 0 : 5;
                  api.setExtra(p, next);
                  toast(next ? `${p}: busy mode, +5 min prep` : `${p}: normal prep time`, { description: next ? "Applies to new orders. Customers see a longer ETA." : "New orders get the standard promise again." });
                  desk.log(`${p} prep time ${next ? "raised by 5 min (busy)" : "back to normal"}`, next ? "warn" : "info");
                }}
              >
                {p} {api.extra[p] ? "+5 on" : "busy +5"}
              </Btn>
            ))}
          </div>
        }
      >
        <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-[10px] border border-d-accent/40 bg-d-soft p-3 lg:col-span-1">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-d-accent">Orders · last 15 min</p>
            <p className="tnum mt-1 font-mono text-[34px] font-semibold leading-none">{recentOrders.size}</p>
            <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-d-sunk">
              {(["POS", "Swiggy", "Zomato"] as const).map((s) => (
                <span key={s} className="h-full transition-[width] duration-700" style={{ width: `${(bySrc(s) / Math.max(1, recentOrders.size)) * 100}%`, background: SRC_COLOR[s] }} />
              ))}
            </div>
            <p className="mt-1.5 font-mono text-[10.5px] text-d-mute">
              dine-in {bySrc("POS")} · swiggy {bySrc("Swiggy")} · zomato {bySrc("Zomato")}
            </p>
          </div>
          {[
            { l: "On the rail", v: String(firing.length), s: `${active.length - firing.length} ready, awaiting pickup`, tone: "neutral" as Tone },
            { l: "Past promise", v: String(late.length), s: late.length ? `oldest ${fmtAge(Math.max(...late.map(age)))}` : "all inside promise", tone: late.length ? ("late" as Tone) : ("ok" as Tone) },
            { l: "Riders at the pass", v: String(waiting.length), s: `${waiting.filter((t) => t.status === "fire").length} waiting on food`, tone: waiting.some((t) => t.status === "fire") ? ("warn" as Tone) : ("ok" as Tone) },
            { l: "Avg age on rail", v: fmtAge(avgAge), s: "fired, not yet bumped", tone: avgAge > 600 ? ("warn" as Tone) : ("ok" as Tone) },
          ].map((c) => (
            <div key={c.l} className="rounded-[10px] border border-d-line bg-d-sunk p-3">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-d-mute">{c.l}</p>
              <p className="tnum mt-1 font-mono text-[28px] font-semibold leading-none" style={{ color: c.tone === "neutral" ? undefined : toneVar(c.tone) }}>
                {c.v}
              </p>
              <p className="mt-2 truncate font-mono text-[10.5px] text-d-mute">{c.s}</p>
            </div>
          ))}
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Segmented size="sm" options={[{ value: "All" as const, label: "All kitchens", count: active.length }, ...KITCHENS.map((k) => ({ value: k, label: KITCHEN_NAME[k], count: active.filter((t) => t.kitchen === k).length }))]} value={kitchen} onChange={setKitchen} />
          <Segmented size="sm" className="ml-auto" options={["All", "POS", "Swiggy", "Zomato"] as const} value={src} onChange={setSrc} />
        </div>

        <div className="desk-scroll -mx-5 overflow-x-auto px-5 pb-1">
          <div className="grid min-w-[1080px] grid-cols-5 gap-2.5">
            {STATIONS.map((st) => {
              const Icon = STATION_ICON[st];
              const list = shown
                .filter((t) => t.station === st)
                .sort((a, b) => (a.status === b.status ? a.born - b.born : a.status === "fire" ? -1 : 1));
              const lateHere = list.filter((t) => t.status === "fire" && age(t) >= t.promise * 60).length;
              return (
                <div key={st} className="flex min-h-[420px] flex-col rounded-[10px] border border-d-line bg-[color-mix(in_oklab,var(--d-sunk)_70%,black)] p-2">
                  <div className="mb-2 flex items-center justify-between px-1 pt-0.5">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[12px] font-semibold uppercase tracking-wider">
                      <Icon className="h-4 w-4 text-d-accent" strokeWidth={1.8} />
                      {st}
                    </span>
                    <span className="flex items-center gap-1.5 font-mono text-[11px]">
                      {lateHere > 0 && <span className="rounded bg-d-late px-1 font-bold text-black">{lateHere}</span>}
                      <span className="text-d-mute">{list.length}</span>
                    </span>
                  </div>
                  <p className="mb-2 px-1 font-mono text-[10px] text-d-mute">chef {STATION_CHEF[st]} · promise {PROMISE[st]}m</p>
                  <div className="flex flex-1 flex-col gap-2">
                    {list.map((t) => (
                      <TicketCard key={t.id} t={t} elapsed={age(t)} sec={sec} onOpen={() => setOpen(t.id)} onBump={() => doBump(t)} onHandover={() => doHandover(t)} />
                    ))}
                    {list.length === 0 && <p className="mt-6 rounded-lg border border-dashed border-d-line py-8 text-center font-mono text-[11px] text-d-mute">rail clear</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4 font-mono text-[11px] text-d-mute">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[2px] bg-d-ok" /> under 70% of promise</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[2px] bg-d-warn" /> 70–100%</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[2px] bg-d-late" /> past promise</span>
          <span className="ml-auto">new KOTs every ~20 s · {doneSession.length} handed over since you opened the desk</span>
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_1fr]">
        <Panel icon={Bike} title="Rider arrivals" sub="Swiggy and Zomato riders, soonest first. Red means the rider is waiting on us." action={<Pill tone={waiting.length ? "warn" : "ok"} mono>{waiting.length} at pass</Pill>}>
          <ul className="divide-y divide-d-line">
            {active
              .filter((t) => t.rider)
              .sort((a, b) => (a.rider?.at ?? 0) - (b.rider?.at ?? 0))
              .filter((t, i, arr) => arr.findIndex((x) => x.order === t.order) === i)
              .slice(0, 8)
              .map((t) => {
                const left = (t.rider?.at ?? 0) - sec;
                const siblings = active.filter((x) => x.order === t.order);
                const allReady = siblings.every((x) => x.status === "ready");
                const tone: Tone = left > 0 ? (left < 120 && !allReady ? "warn" : "info") : allReady ? "ok" : "late";
                return (
                  <li key={t.order} className="flex items-center gap-3 py-2.5">
                    <Avatar name={t.rider?.name ?? "R"} size={32} tone={t.src === "Swiggy" ? "accent" : "late"} />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-[13px] font-medium">
                        <span className="truncate">{t.rider?.name}</span>
                        <SrcBadge src={t.src} />
                      </p>
                      <p className="truncate font-mono text-[11px] text-d-mute">
                        {t.order} · {KITCHEN_NAME[t.kitchen]} · {siblings.length > 1 ? `${siblings.filter((x) => x.status === "ready").length}/${siblings.length} KOTs ready` : allReady ? "food ready" : "cooking"}
                      </p>
                    </div>
                    <span className="tnum text-right font-mono text-[13px] font-semibold" style={{ color: toneVar(tone) }}>
                      {left > 0 ? `${fmtAge(left)} away` : `waiting ${fmtAge(-left)}`}
                    </span>
                    {allReady && left <= 0 ? (
                      <Btn size="sm" variant="solid" onClick={() => siblings.forEach((x) => doHandover(x))}>
                        Hand over
                      </Btn>
                    ) : (
                      <Btn
                        size="sm"
                        variant="ghost"
                        icon={Phone}
                        onClick={() => {
                          toast(`Calling ${t.rider?.name}`, { description: `+91 ${t.rider?.phone} · masked via ${t.src}` });
                          desk.log(`Called rider ${t.rider?.name} for ${t.order}`);
                        }}
                      >
                        Call
                      </Btn>
                    )}
                  </li>
                );
              })}
          </ul>
        </Panel>
        <Panel icon={Flame} title="Station load" sub="Tickets on each station and how old they are">
          <HBars
            format={(v) => `${v} KOT`}
            max={Math.max(6, ...STATIONS.map((s) => firing.filter((t) => t.station === s).length))}
            data={STATIONS.map((s) => {
              const list = firing.filter((t) => t.station === s);
              const avg = list.length ? list.reduce((a, t) => a + age(t), 0) / list.length : 0;
              const worst = list.length ? Math.max(...list.map((t) => age(t) / (t.promise * 60))) : 0;
              return { label: s, sub: list.length ? `avg ${fmtAge(avg)} · ${STATION_CHEF[s]}` : STATION_CHEF[s], value: list.length, tone: worst >= 1 ? ("late" as Tone) : worst >= 0.7 ? ("warn" as Tone) : ("ok" as Tone) };
            })}
          />
          <div className="mt-5 rounded-[10px] border border-d-line bg-d-sunk p-3">
            <MonoLabel>Last handed over</MonoLabel>
            <ul className="space-y-1.5">
              {[...api.tickets]
                .filter((t) => t.status === "done")
                .sort((a, b) => (b.doneAt ?? 0) - (a.doneAt ?? 0))
                .slice(0, 4)
                .map((t) => {
                  const took = (t.readyAt ?? 0) - t.born;
                  return (
                    <li key={t.id} className="flex items-center gap-2 font-mono text-[11.5px]">
                      <SrcBadge src={t.src} />
                      <span className="min-w-0 flex-1 truncate">
                        KOT {t.kot} · {t.station} · {t.kitchen}
                      </span>
                      <span style={{ color: took > t.promise * 60 ? "var(--d-late)" : "var(--d-ok)" }}>{fmtAge(took)}</span>
                    </li>
                  );
                })}
            </ul>
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Panel icon={TrendingUp} title="Lunch orders by 15 minutes" sub="All kitchens, split by channel. The last bar is live.">
          <Bars
            height={190}
            format={(v) => String(v)}
            data={[
              ...[
                ["11:00", 6, 9, 7],
                ["11:15", 8, 11, 9],
                ["11:30", 9, 14, 12],
                ["11:45", 11, 16, 13],
                ["12:00", 14, 19, 15],
                ["12:15", 17, 21, 18],
              ].map(([label, p, s, z]) => ({
                label: String(label),
                value: Number(p) + Number(s) + Number(z),
                stack: [
                  { name: "Dine-in", value: Number(p), tone: "info" as Tone },
                  { name: "Swiggy", value: Number(s), tone: "accent" as Tone },
                  { name: "Zomato", value: Number(z), tone: "late" as Tone },
                ],
              })),
              {
                label: "now",
                value: recentOrders.size,
                stack: [
                  { name: "Dine-in", value: bySrc("POS"), tone: "info" as Tone },
                  { name: "Swiggy", value: bySrc("Swiggy"), tone: "accent" as Tone },
                  { name: "Zomato", value: bySrc("Zomato"), tone: "late" as Tone },
                ],
              },
            ]}
          />
        </Panel>
        <Panel icon={AlertTriangle} title="Needs Ayesha today" sub="Raised by the agents since the morning">
          <ul className="divide-y divide-d-line">
            {[
              { t: "Wok Junction offline on Zomato since 11:20", s: "MD tablet logged out · ~₹9k lunch at risk", tone: "late" as Tone, go: "aggregators" },
              { t: "Kondapur food cost 34.9%, 3.4 pts over", s: "Tikka portions 12% heavy · Raju to retrain", tone: "late" as Tone, go: "outlets" },
              { t: "Mutton at KK: 11 kg vs 25 kg par", s: "PO-1416 arrives 3:30 PM · Menu Switch", tone: "warn" as Tone, go: "inventory" },
              { t: "1-star Zomato review, KK stock-out", s: "Draft reply ready · Review Responder", tone: "warn" as Tone, go: "guests" },
              { t: "Chicken biryani is ₹1 short of a star", s: "₹349 → ₹359 adds ~₹13.6k a month", tone: "info" as Tone, go: "menu" },
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

      <TicketSheet
        t={ticket}
        elapsed={ticket ? (ticket.status === "fire" ? age(ticket) : (ticket.readyAt ?? sec) - ticket.born) : 0}
        sec={sec}
        onClose={() => setOpen(null)}
        onBump={() => ticket && doBump(ticket)}
        onHandover={() => ticket && doHandover(ticket)}
        onRefire={() => {
          if (!ticket) return;
          api.refire(ticket.id);
          toast.warning(`KOT ${ticket.kot} re-fired`, { description: `${ticket.station} station · remake logged to wastage` });
          desk.log(`KOT ${ticket.kot} re-fired at ${KITCHEN_NAME[ticket.kitchen]} (remake)`, "warn");
        }}
      />
    </div>
  );
}

function TicketCard({ t, elapsed, sec, onOpen, onBump, onHandover }: { t: Ticket; elapsed: number; sec: number; onOpen: () => void; onBump: () => void; onHandover: () => void }) {
  const ready = t.status === "ready";
  const shownAge = ready ? (t.readyAt ?? 0) - t.born : elapsed;
  const tone = ready ? "ok" : ageTone(elapsed, t.promise);
  const color = toneVar(tone);
  const pct = Math.min(100, (shownAge / (t.promise * 60)) * 100);
  const riderLeft = t.rider ? t.rider.at - sec : null;
  const fresh = sec - t.born < 20 && t.born > 0;
  return (
    <div
      className={`desk-rise group relative overflow-hidden rounded-[8px] border bg-d-panel text-left transition-all ${ready ? "border-d-ok/40 opacity-80" : tone === "late" ? "border-d-late/70 shadow-[0_0_0_1px_var(--d-late),0_10px_30px_-18px_var(--d-late)]" : "border-d-line"}`}
    >
      <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: SRC_COLOR[t.src] }} />
      <button type="button" onClick={onOpen} className="block w-full px-2.5 pb-2 pt-2.5 text-left">
        <div className="flex items-center justify-between gap-1">
          <span className="flex items-center gap-1.5">
            <SrcBadge src={t.src} />
            {fresh && <span className="rounded bg-d-accent px-1 font-mono text-[9px] font-bold text-d-accent-ink">NEW</span>}
          </span>
          <span className="font-mono text-[10px] text-d-mute">
            {t.kitchen} · KOT {t.kot}
          </span>
        </div>
        <div className="mt-1.5 flex items-baseline justify-between gap-2">
          <span className={`tnum font-mono text-[24px] font-bold leading-none ${tone === "late" && !ready ? "animate-pulse" : ""}`} style={{ color }}>
            {fmtAge(shownAge)}
          </span>
          <span className="font-mono text-[10.5px] text-d-mute">{ready ? "ready" : `/ ${t.promise}:00`}</span>
        </div>
        <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-d-line">
          <div className="h-full rounded-full transition-[width] duration-1000" style={{ width: `${pct}%`, background: color }} />
        </div>
        <ul className="mt-2 space-y-0.5">
          {t.items.map(([name, q]) => (
            <li key={name} className="flex gap-1.5 text-[12.5px] leading-snug">
              <span className="tnum font-mono font-bold text-d-accent">{q}×</span>
              <span className="min-w-0">{name}</span>
            </li>
          ))}
        </ul>
        {t.note && <p className="mt-1.5 rounded-[4px] bg-[color-mix(in_oklab,var(--d-warn)_14%,transparent)] px-1.5 py-0.5 text-[11px] font-medium text-d-warn">{t.note}</p>}
        <p className="mt-1.5 flex items-center gap-1 truncate font-mono text-[10.5px] text-d-mute">
          {t.rider ? (
            <>
              <Bike className="h-3 w-3 shrink-0" />
              <span className="truncate">{t.rider.name.split(" ")[0]}</span>
              <span className="ml-auto shrink-0" style={{ color: riderLeft !== null && riderLeft <= 0 ? (ready ? "var(--d-ok)" : "var(--d-late)") : undefined }}>
                {riderLeft !== null && riderLeft <= 0 ? `at pass ${fmtAge(-riderLeft)}` : `in ${fmtAge(riderLeft ?? 0)}`}
              </span>
            </>
          ) : (
            <>
              <Armchair className="h-3 w-3 shrink-0" />
              <span className="truncate">{t.table}</span>
            </>
          )}
        </p>
      </button>
      <div className="border-t border-d-line px-2 py-1.5">
        {ready ? (
          <Btn size="sm" variant="outline" className="h-7 w-full" onClick={onHandover}>
            {t.src === "POS" ? "Served" : "Picked up"}
          </Btn>
        ) : (
          <Btn size="sm" variant={tone === "late" ? "solid" : "soft"} className="h-7 w-full" onClick={onBump}>
            Bump ready
          </Btn>
        )}
      </div>
    </div>
  );
}

function TicketSheet({ t, elapsed, sec, onClose, onBump, onHandover, onRefire }: { t: Ticket | null; elapsed: number; sec: number; onClose: () => void; onBump: () => void; onHandover: () => void; onRefire: () => void }) {
  const desk = useDesk();
  const riderLeft = t?.rider ? t.rider.at - sec : null;
  return (
    <Sheet
      open={!!t}
      onOpenChange={(o) => !o && onClose()}
      width={500}
      eyebrow={t ? `KOT ${t.kot} · ${t.station} · ${KITCHEN_NAME[t.kitchen]}` : ""}
      title={t ? t.order : ""}
      sub={t ? `${t.src === "POS" ? `Dine-in ${t.table}` : `${t.src} delivery`} · ${inr(t.value)} · promise ${t.promise} min` : ""}
      footer={
        t && (
          <>
            <Btn icon={RotateCcw} onClick={onRefire}>
              Re-fire
            </Btn>
            {t.status === "fire" && (
              <Btn variant="solid" onClick={onBump}>
                Bump ready
              </Btn>
            )}
            {t.status === "ready" && (
              <Btn variant="solid" onClick={onHandover}>
                {t.src === "POS" ? "Served" : "Picked up"}
              </Btn>
            )}
            {t.status === "done" && <Pill tone="ok">Handed over</Pill>}
          </>
        )
      }
    >
      {t && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[10px] bg-d-sunk p-3">
              <p className="text-[11.5px] text-d-mute">{t.status === "fire" ? "On the rail" : "Took"}</p>
              <p className="tnum font-mono text-[26px] font-bold" style={{ color: toneVar(t.status === "fire" ? ageTone(elapsed, t.promise) : elapsed > t.promise * 60 ? "late" : "ok") }}>
                {fmtAge(elapsed)}
              </p>
              <Meter value={elapsed} max={t.promise * 60} tone={t.status === "fire" ? ageTone(elapsed, t.promise) : "ok"} className="mt-1.5" />
            </div>
            <div className="rounded-[10px] bg-d-sunk p-3">
              <p className="text-[11.5px] text-d-mute">{t.rider ? "Rider" : "Table"}</p>
              <p className="mt-1 truncate text-[15px] font-semibold">{t.rider ? t.rider.name : t.table}</p>
              <p className="font-mono text-[11.5px]" style={{ color: riderLeft !== null && riderLeft <= 0 ? "var(--d-warn)" : "var(--d-mute)" }}>
                {t.rider ? (riderLeft !== null && riderLeft <= 0 ? `at the pass for ${fmtAge(-riderLeft)}` : `arrives in ${fmtAge(riderLeft ?? 0)}`) : `Captain on floor · ${KITCHEN_NAME[t.kitchen]}`}
              </p>
            </div>
          </div>
          <div>
            <MonoLabel>Items</MonoLabel>
            <ul className="space-y-1.5">
              {t.items.map(([name, q]) => (
                <li key={name} className="flex items-center gap-3 rounded-[8px] border border-d-line px-3 py-2">
                  <span className="tnum font-mono text-[14px] font-bold text-d-accent">{q}×</span>
                  <span className="flex-1 text-[13.5px] font-medium">{name}</span>
                  <button
                    type="button"
                    className="font-mono text-[11px] text-d-late hover:underline"
                    onClick={() => {
                      toast.warning(`${name} marked 86`, { description: `Switched off on Swiggy and Zomato at ${KITCHEN_NAME[t.kitchen]} · captain told on POS` });
                      desk.log(`${name} 86'd at ${KITCHEN_NAME[t.kitchen]}`, "warn");
                    }}
                  >
                    86 it
                  </button>
                </li>
              ))}
            </ul>
            {t.note && <p className="mt-2 rounded-[8px] border border-d-warn/40 bg-[color-mix(in_oklab,var(--d-warn)_10%,transparent)] px-3 py-2 text-[12.5px] text-d-warn">Note: {t.note}</p>}
          </div>
          <div>
            <MonoLabel>Timeline</MonoLabel>
            <ol className="space-y-2 font-mono text-[12px]">
              <li className="flex justify-between"><span>KOT printed at {t.station} ({t.src === "POS" ? "captain app" : `${t.src} → Petpooja`})</span><span className="text-d-mute">0:00</span></li>
              {t.readyAt !== undefined && <li className="flex justify-between"><span>Bumped ready by {STATION_CHEF[t.station]}</span><span className="text-d-mute">{fmtAge(t.readyAt - t.born)}</span></li>}
              {t.doneAt !== undefined && <li className="flex justify-between"><span>{t.src === "POS" ? "Served" : "Picked up"}</span><span className="text-d-mute">{fmtAge(t.doneAt - t.born)}</span></li>}
              <li className="flex justify-between text-d-mute"><span>Promise ({t.src === "POS" ? "house standard" : `${t.src} KPT`})</span><span>{t.promise}:00</span></li>
            </ol>
          </div>
          {t.rider && (
            <Btn
              icon={Phone}
              className="w-full"
              onClick={() => {
                toast(`Calling ${t.rider?.name}`, { description: `+91 ${t.rider?.phone} · masked number` });
                desk.log(`Called rider ${t.rider?.name} for ${t.order}`);
              }}
            >
              Call rider
            </Btn>
          )}
        </div>
      )}
    </Sheet>
  );
}

/* ---------------- Outlets & P&L ---------------- */

function OutletsTab() {
  const desk = useDesk();
  const [period, setPeriod] = React.useState<"Today" | "MTD">("Today");
  const [open, setOpen] = React.useState<KitchenId | null>(null);
  const [targets, setTargets] = React.useState<Record<KitchenId, number>>({ BH: 31, GB: 31, KP: 31.5, MD: 30, KK: 31 });
  const o = outlets.find((x) => x.id === open) ?? null;
  const mtd = outlets.reduce((a, x) => a + x.mtd, 0);
  const fcAvg = outlets.reduce((a, x) => a + x.fc * x.mtd, 0) / mtd;
  const ebitda = outlets.reduce((a, x) => a + pnl(x).ebitda, 0);
  const covers = outlets.reduce((a, x) => a + x.covers, 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Net sales MTD" value={inr(mtd, { compact: true })} delta="+5.4%" hint={`vs ${inr(outlets.reduce((a, x) => a + x.lastMtd, 0), { compact: true })} last month, same days`} icon={IndianRupee} trend={[3.1, 6.2, 9.4, 12.6, 15.9, 19.4, 22.1, mtd / 1e5 / 3.5]} />
        <Stat label="Food cost, weighted" value={`${(fcAvg * 100).toFixed(1)}%`} delta="+0.6 pts" deltaGood={false} hint="target 31%" icon={Scale} tone="warn" trend={[31.1, 31.2, 31.4, 31.3, 31.6, 31.8, fcAvg * 100]} />
        <Stat label="Dine-in covers today" value={String(covers)} delta="+6%" hint={`APC ${inr(Math.round((outlets.filter((x) => x.covers).reduce((a, x) => a + x.today * (1 - x.delivery), 0)) / covers))}`} icon={Armchair} tone="info" trend={[388, 402, 395, 410, 436, 451, covers]} />
        <Stat label="EBITDA MTD" value={inr(ebitda, { compact: true })} delta="+1.2 pts" hint={`${((ebitda / mtd) * 100).toFixed(1)}% of net sales`} icon={TrendingUp} tone="ok" trend={[9.8, 10.4, 10.9, 11.2, 11.6, 12.1, (ebitda / mtd) * 100]} />
      </div>

      <Panel title="Outlet scoreboard" sub="Click an outlet for its P&L, channel mix and food cost target" action={<Segmented size="sm" options={["Today", "MTD"] as const} value={period} onChange={setPeriod} />}>
        <DataTable
          rows={outlets}
          rowKey={(x) => x.id}
          onRow={(x) => setOpen(x.id)}
          filter={{ get: (x) => x.kind, options: ["Dine-in", "Cloud kitchen"] }}
          columns={[
            { key: "name", label: "Outlet", sort: (x) => x.name, render: (x) => (<span><span className="font-semibold">{x.name}</span><span className="block text-[11.5px] text-d-mute">{x.area} · {x.manager}</span></span>) },
            { key: "kind", label: "Format", wide: true, render: (x) => <Pill tone={x.kind === "Dine-in" ? "info" : "accent"}>{x.kind}</Pill> },
            { key: "sales", label: period === "Today" ? "Sales today" : "Sales MTD", align: "right", sort: (x) => (period === "Today" ? x.today : x.mtd), render: (x) => <span className="tnum font-mono font-semibold">{inr(period === "Today" ? x.today : x.mtd, { compact: true })}</span> },
            { key: "vs", label: "vs last mo.", align: "right", sort: (x) => x.mtd / x.lastMtd, render: (x) => { const d = (x.mtd / x.lastMtd - 1) * 100; return <span className="tnum font-mono" style={{ color: d >= 0 ? "var(--d-ok)" : "var(--d-late)" }}>{d >= 0 ? "+" : ""}{d.toFixed(1)}%</span>; } },
            { key: "orders", label: "Bills", align: "right", sort: (x) => x.orders, render: (x) => <span className="tnum font-mono">{period === "Today" ? x.orders : x.orders * 18}</span> },
            { key: "covers", label: "Covers", align: "right", wide: true, render: (x) => <span className="tnum font-mono text-d-mute">{x.covers ? (period === "Today" ? x.covers : x.covers * 18) : "—"}</span> },
            { key: "aov", label: "AOV", align: "right", sort: (x) => x.today / x.orders, render: (x) => <span className="tnum font-mono">{inr(Math.round(x.today / x.orders))}</span> },
            { key: "fc", label: "Food cost", align: "right", sort: (x) => x.fc, render: (x) => <span className="tnum font-mono font-semibold" style={{ color: x.fc * 100 > targets[x.id] + 1.5 ? "var(--d-late)" : x.fc * 100 > targets[x.id] ? "var(--d-warn)" : "var(--d-ok)" }}>{(x.fc * 100).toFixed(1)}%</span> },
            { key: "eb", label: "EBITDA", align: "right", sort: (x) => pnl(x).pct, render: (x) => <span className="tnum font-mono">{pnl(x).pct.toFixed(1)}%</span> },
            { key: "trend", label: "14 days", wide: true, render: (x) => <MiniSpark data={x.trend} /> },
          ]}
        />
      </Panel>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Panel icon={TrendingUp} title="Daily sales, last 14 days" sub="All 5 kitchens, dine-in vs delivery (₹ thousands)">
          <AreaChart
            height={230}
            labels={DAYS}
            format={(v) => `₹${Math.round(v)}k`}
            marker={{ index: 13, label: "Today" }}
            series={[
              { name: "Delivery", tone: "accent", data: DAYS.map((_, i) => Math.round(outlets.reduce((a, x) => a + x.trend[i] * x.delivery, 0))) },
              { name: "Dine-in", tone: "info", data: DAYS.map((_, i) => Math.round(outlets.reduce((a, x) => a + x.trend[i] * (1 - x.delivery), 0))) },
            ]}
          />
        </Panel>
        <Panel icon={Receipt} title="Last night's day close" sub="Variances, voids and comps the managers can't approve">
          <ApprovalQueue
            items={dayClose}
            onDecide={(id, d) => {
              const item = dayClose.find((x) => x.id === id);
              if (d && item) desk.log(`Day close: ${item.title} ${d === "approved" ? "approved" : "held"}`, d === "approved" ? "ok" : "warn");
            }}
          />
        </Panel>
      </div>

      <Panel title="Where each rupee goes, MTD" sub="Cost lines as % of net sales, by outlet">
        <Bars
          height={200}
          format={(v) => `${v.toFixed(0)}%`}
          data={outlets.map((x) => {
            const p = pnl(x);
            return {
              label: x.name,
              value: 100,
              stack: [
                ...p.lines.slice(0, 5).map((l) => ({ name: l.k, value: Math.round((l.v / x.mtd) * 1000) / 10, tone: l.tone })),
                { name: "Ads + other", value: Math.round(((p.lines[5].v + p.lines[6].v) / x.mtd) * 1000) / 10, tone: "neutral" as Tone },
                { name: "EBITDA", value: Math.max(0, Math.round(p.pct * 10) / 10), tone: "ok" as Tone },
              ],
            };
          })}
          showValues={false}
        />
      </Panel>

      <Sheet
        open={!!o}
        onOpenChange={(v) => !v && setOpen(null)}
        width={540}
        eyebrow={o ? `${o.kind} · ${o.area} · ${o.manager}` : ""}
        title={o?.name ?? ""}
        sub={o?.note}
        footer={
          o && (
            <>
              <Btn
                icon={Send}
                onClick={() => {
                  toast.success(`P&L sent to ${o.manager}`, { description: "PDF on WhatsApp with the food cost target" });
                  desk.log(`MTD P&L for ${o.name} shared with ${o.manager}`);
                }}
              >
                Share P&L
              </Btn>
              <Btn variant="solid" onClick={() => setOpen(null)}>
                Done
              </Btn>
            </>
          )
        }
      >
        {o && (
          <div className="space-y-5">
            <KV
              cols={3}
              items={[
                { k: "Net sales MTD", v: inr(o.mtd, { compact: true }) },
                { k: "Today", v: inr(o.today, { compact: true }) },
                { k: "AOV", v: inr(Math.round(o.today / o.orders)) },
                { k: "Bills today", v: o.orders },
                { k: "Covers", v: o.covers || "—" },
                { k: "Delivery share", v: `${Math.round(o.delivery * 100)}%` },
              ]}
            />
            <div>
              <MonoLabel>P&L, month to date</MonoLabel>
              <ul className="divide-y divide-d-line rounded-[10px] border border-d-line">
                <li className="flex items-center justify-between px-3 py-2 text-[13px] font-semibold">
                  <span>Net sales</span>
                  <span className="tnum font-mono">{inr(o.mtd)}</span>
                </li>
                {pnl(o).lines.map((l) => (
                  <li key={l.k} className="flex items-center gap-3 px-3 py-2 text-[13px]">
                    <span className="h-2 w-2 rounded-full" style={{ background: toneVar(l.tone) }} />
                    <span className="flex-1 text-d-mute">{l.k}</span>
                    <span className="tnum w-14 text-right font-mono text-[11.5px] text-d-mute">{((l.v / o.mtd) * 100).toFixed(1)}%</span>
                    <span className="tnum w-24 text-right font-mono">−{inr(l.v)}</span>
                  </li>
                ))}
                <li className="flex items-center justify-between px-3 py-2.5 text-[14px] font-semibold">
                  <span>EBITDA</span>
                  <span className="tnum font-mono" style={{ color: pnl(o).pct > 10 ? "var(--d-ok)" : "var(--d-warn)" }}>
                    {inr(pnl(o).ebitda)} · {pnl(o).pct.toFixed(1)}%
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <MonoLabel>Food cost target</MonoLabel>
              <div className="flex items-center gap-3 rounded-[10px] bg-d-sunk p-3">
                <div className="flex-1">
                  <p className="text-[13px]">
                    Actual <b className="font-mono">{(o.fc * 100).toFixed(1)}%</b> vs target <b className="font-mono">{targets[o.id].toFixed(1)}%</b>
                  </p>
                  <p className="text-[11.5px] text-d-mute">Every point over is {inr(o.mtd / 100 / MTD_DAYS * 30, { compact: true })} a month at this run-rate</p>
                </div>
                <Btn size="sm" onClick={() => setTargets((c) => ({ ...c, [o.id]: Math.round((c[o.id] - 0.5) * 10) / 10 }))}>−0.5</Btn>
                <Btn size="sm" onClick={() => setTargets((c) => ({ ...c, [o.id]: Math.round((c[o.id] + 0.5) * 10) / 10 }))}>+0.5</Btn>
                <Btn
                  size="sm"
                  variant="solid"
                  onClick={() => {
                    toast.success(`Food cost target ${targets[o.id]}% set for ${o.name}`, { description: `${o.manager} gets a daily alert when the day crosses it` });
                    desk.log(`Food cost target for ${o.name} set at ${targets[o.id]}%`, "info");
                  }}
                >
                  Save
                </Btn>
              </div>
            </div>
            <div>
              <MonoLabel>Last 14 days (₹ thousands)</MonoLabel>
              <Bars height={110} showValues={false} format={(v) => `₹${v}k`} data={o.trend.map((v, i) => ({ label: DAYS[i].split(" ")[0], value: v, tone: i === 13 ? "accent" : "neutral" }))} />
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

function MiniSpark({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data.map((v, i) => `${Math.round((i / (data.length - 1)) * 8000) / 100},${Math.round((22 - ((v - min) / (max - min || 1)) * 20) * 100) / 100}`).join(" ");
  return (
    <svg viewBox="0 0 80 24" className="h-6 w-20">
      <polyline points={pts} fill="none" stroke="var(--d-accent)" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------------- Aggregators ---------------- */

function AggregatorsTab() {
  const desk = useDesk();
  const [listings, setListings] = React.useState(listingSeed);
  const [toggles, setToggles] = React.useState(toggleSeed);
  const [ads, setAds] = React.useState(adSeed);
  const [open, setOpen] = React.useState<string | null>(null);
  const l = listings.find((x) => x.id === open) ?? null;
  const avg = (p: "Swiggy" | "Zomato") => {
    const list = listings.filter((x) => x.platform === p);
    return list.reduce((a, x) => a + x.rating * x.orders7, 0) / list.reduce((a, x) => a + x.orders7, 0);
  };
  const orders = listings.reduce((a, x) => a + x.orders7, 0);
  const breach = listings.reduce((a, x) => a + x.breach * x.orders7, 0) / orders;
  const cancel = listings.reduce((a, x) => a + x.cancel * x.orders7, 0) / orders;
  const spend = ads.reduce((a, x) => a + x.spend, 0);
  const adSales = ads.reduce((a, x) => a + x.sales, 0);

  function flip(t: MenuToggle, p: "swiggy" | "zomato") {
    setToggles((cur) => cur.map((x) => (x.id === t.id ? { ...x, [p]: !x[p] } : x)));
    const on = !t[p];
    const name = p === "swiggy" ? "Swiggy" : "Zomato";
    toast[on ? "success" : "warning"](`${t.item} ${on ? "on" : "off"} on ${name}`, { description: `${t.brand} · menu pushed in under a minute` });
    desk.log(`${t.item} switched ${on ? "on" : "off"} on ${name}`, on ? "ok" : "warn");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Swiggy rating, weighted" value={avg("Swiggy").toFixed(2)} delta="-0.04" hint="6 listings" icon={Star} trend={[4.34, 4.33, 4.32, 4.31, 4.3, 4.29, avg("Swiggy")]} />
        <Stat label="Zomato rating, weighted" value={avg("Zomato").toFixed(2)} delta="-0.07" hint="KK Handi at 3.8" icon={Star} tone="late" trend={[4.17, 4.16, 4.15, 4.13, 4.12, 4.1, avg("Zomato")]} />
        <Stat label="Prep-time breaches, 7d" value={`${breach.toFixed(1)}%`} delta="+0.8 pts" deltaGood={false} hint={`${Math.round((breach / 100) * orders)} of ${orders.toLocaleString("en-IN")} orders`} icon={Timer} tone="warn" trend={[7.1, 7.4, 7.9, 8.2, 7.8, 8.4, breach]} />
        <Stat label="Ads ROI, 7d" value={`${(adSales / spend).toFixed(1)}x`} delta="+0.4x" hint={`${inr(spend, { compact: true })} spend · ${inr(adSales, { compact: true })} sales`} icon={Megaphone} tone="ok" trend={[5.2, 5.4, 5.1, 5.6, 5.8, 5.9, adSales / spend]} />
      </div>

      <Panel title="Listings" sub="Every brand on every platform. Click a row to change prep time or go offline." action={<Pill tone="late" mono>cancel {cancel.toFixed(1)}%</Pill>}>
        <DataTable
          rows={listings}
          rowKey={(x) => x.id}
          onRow={(x) => setOpen(x.id)}
          search={(x) => `${x.brand} ${KITCHEN_NAME[x.kitchen]} ${x.platform}`}
          searchPlaceholder="Brand or outlet"
          filter={{ get: (x) => x.platform, options: ["Swiggy", "Zomato"] }}
          columns={[
            { key: "brand", label: "Listing", sort: (x) => x.brand, render: (x) => (<span><span className="font-semibold">{x.brand}</span><span className="block text-[11.5px] text-d-mute">{KITCHEN_NAME[x.kitchen]}</span></span>) },
            { key: "pf", label: "Platform", render: (x) => <SrcBadge src={x.platform} /> },
            { key: "rating", label: "Rating", align: "right", sort: (x) => x.rating, render: (x) => (<span className="tnum font-mono font-semibold" style={{ color: x.rating >= 4.3 ? "var(--d-ok)" : x.rating >= 4 ? "var(--d-warn)" : "var(--d-late)" }}>★ {x.rating.toFixed(1)}<span className="ml-1 text-[10.5px] font-normal text-d-mute">{(x.ratings / 1000).toFixed(1)}k</span></span>) },
            { key: "orders", label: "Orders 7d", align: "right", sort: (x) => x.orders7, render: (x) => <span className="tnum font-mono">{x.orders7}</span> },
            { key: "kpt", label: "Prep vs promise", align: "right", sort: (x) => x.kpt - x.promise, render: (x) => <span className="tnum font-mono" style={{ color: x.kpt > x.promise ? "var(--d-late)" : "var(--d-ok)" }}>{x.kpt.toFixed(1)} / {x.promise}m</span> },
            { key: "breach", label: "Breach", align: "right", sort: (x) => x.breach, render: (x) => <span className="tnum font-mono" style={{ color: x.breach > 10 ? "var(--d-late)" : x.breach > 7 ? "var(--d-warn)" : undefined }}>{x.breach.toFixed(1)}%</span> },
            { key: "cancel", label: "Cancel", align: "right", wide: true, sort: (x) => x.cancel, render: (x) => <span className="tnum font-mono text-d-mute">{x.cancel.toFixed(1)}%</span> },
            {
              key: "online",
              label: "Online",
              align: "center",
              render: (x) => (
                <span onClick={(e) => e.stopPropagation()} className="inline-flex">
                  <Switch
                    on={x.online}
                    label={`${x.brand} ${x.platform} online`}
                    onChange={() => {
                      setListings((cur) => cur.map((y) => (y.id === x.id ? { ...y, online: !y.online } : y)));
                      toast[x.online ? "warning" : "success"](`${x.brand} ${KITCHEN_NAME[x.kitchen]} ${x.online ? "offline" : "back online"} on ${x.platform}`);
                      desk.log(`${x.brand} (${x.kitchen}) ${x.online ? "taken offline" : "back online"} on ${x.platform}`, x.online ? "warn" : "ok");
                    }}
                  />
                </span>
              ),
            },
          ]}
        />
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Panel icon={Power} title="Menu on / off" sub="Stock-outs switch off automatically. Flip anything by hand here.">
          <ul className="divide-y divide-d-line">
            <li className="flex items-center gap-3 pb-2 font-mono text-[10.5px] uppercase tracking-wider text-d-mute">
              <span className="flex-1">Item</span>
              <span className="w-12 text-center">Swiggy</span>
              <span className="w-12 text-center">Zomato</span>
            </li>
            {toggles.map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">{t.item}</p>
                  <p className="truncate text-[11.5px]" style={{ color: t.reason ? "var(--d-warn)" : "var(--d-mute)" }}>
                    {t.brand} · {t.reason ?? t.stock}
                  </p>
                </div>
                <span className="flex w-12 justify-center"><Switch on={t.swiggy} label={`${t.item} on Swiggy`} onChange={() => flip(t, "swiggy")} /></span>
                <span className="flex w-12 justify-center"><Switch on={t.zomato} label={`${t.item} on Zomato`} onChange={() => flip(t, "zomato")} /></span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel icon={Megaphone} title="Ads, last 7 days" sub="ROI = sales from the ad ÷ spend. Under 4x loses money after commission.">
          <ul className="space-y-2">
            {ads.map((a) => {
              const roi = a.sales / a.spend;
              return (
                <li key={a.id} className={`rounded-[10px] border border-d-line p-3 ${a.active ? "" : "opacity-60"}`}>
                  <div className="flex items-start gap-2">
                    <SrcBadge src={a.platform} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">{a.name}</p>
                      <p className="font-mono text-[11px] text-d-mute">
                        {inr(a.spend, { compact: true })} spend · {a.orders} orders · {inr(a.budget)}/day
                      </p>
                    </div>
                    <span className="tnum font-mono text-[16px] font-bold" style={{ color: roi >= 6 ? "var(--d-ok)" : roi >= 4 ? "var(--d-warn)" : "var(--d-late)" }}>
                      {roi.toFixed(1)}x
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Meter value={Math.min(10, roi)} max={10} tone={roi >= 6 ? "ok" : roi >= 4 ? "warn" : "late"} className="flex-1" />
                    <Btn
                      size="sm"
                      variant="ghost"
                      disabled={!a.active}
                      onClick={() => {
                        setAds((cur) => cur.map((x) => (x.id === a.id ? { ...x, budget: x.budget + 500 } : x)));
                        toast.success(`${a.name}: budget ${inr(a.budget + 500)}/day`);
                        desk.log(`Ad budget raised to ${inr(a.budget + 500)}/day: ${a.name}`, "info");
                      }}
                    >
                      +₹500
                    </Btn>
                    <Btn
                      size="sm"
                      variant={a.active ? "outline" : "solid"}
                      onClick={() => {
                        setAds((cur) => cur.map((x) => (x.id === a.id ? { ...x, active: !x.active } : x)));
                        toast[a.active ? "warning" : "success"](`${a.name} ${a.active ? "paused" : "resumed"}`);
                        desk.log(`Ad ${a.active ? "paused" : "resumed"}: ${a.name}`, a.active ? "warn" : "ok");
                      }}
                    >
                      {a.active ? "Pause" : "Resume"}
                    </Btn>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Panel icon={Timer} title="Prep-time breaches by hour" sub="Orders past the promised prep time, last 7 days. Click a cell.">
          <HeatGrid
            rows={KITCHENS.map((k) => KITCHEN_NAME[k])}
            cols={HOURS.map((h) => `${h}:00`)}
            values={breachGrid}
            tone="late"
            onCell={(r, c) => toast(`${KITCHEN_NAME[KITCHENS[r]]} at ${HOURS[c]}:00`, { description: `${breachGrid[r][c] * 7} breached orders in 7 days · ${breachGrid[r][c] >= 5 ? "add a cook to the busiest station" : "within normal range"}` })}
          />
        </Panel>
        <Panel icon={Ban} title="Why orders get cancelled" sub="Last 30 days, both platforms">
          <Donut center="95" sub="cancelled" segments={cancelReasons} />
        </Panel>
      </div>

      <Sheet
        open={!!l}
        onOpenChange={(v) => !v && setOpen(null)}
        eyebrow={l ? `${l.platform} · ${KITCHEN_NAME[l.kitchen]}` : ""}
        title={l?.brand ?? ""}
        sub={l ? `★ ${l.rating.toFixed(1)} from ${l.ratings.toLocaleString("en-IN")} ratings · ${l.orders7} orders this week` : ""}
        footer={
          l && (
            <>
              <Btn
                variant={l.online ? "danger" : "solid"}
                icon={Power}
                onClick={() => {
                  setListings((cur) => cur.map((y) => (y.id === l.id ? { ...y, online: !y.online } : y)));
                  toast[l.online ? "warning" : "success"](`${l.brand} ${l.online ? "offline" : "online"} on ${l.platform}`);
                  desk.log(`${l.brand} (${l.kitchen}) ${l.online ? "taken offline" : "back online"} on ${l.platform}`, l.online ? "warn" : "ok");
                }}
              >
                {l.online ? "Go offline" : "Go online"}
              </Btn>
              <Btn onClick={() => setOpen(null)}>Close</Btn>
            </>
          )
        }
      >
        {l && (
          <div className="space-y-5">
            <KV
              cols={3}
              items={[
                { k: "Prep time (KPT)", v: `${l.kpt.toFixed(1)} min` },
                { k: "Promise", v: `${l.promise} min` },
                { k: "Breach", v: `${l.breach.toFixed(1)}%` },
                { k: "Cancellations", v: `${l.cancel.toFixed(1)}%` },
                { k: "Status", v: l.online ? "Online" : "Offline" },
                { k: "Orders 7d", v: l.orders7 },
              ]}
            />
            <div>
              <MonoLabel>Promised prep time</MonoLabel>
              <div className="flex items-center gap-3 rounded-[10px] bg-d-sunk p-3">
                <p className="flex-1 text-[12.5px] text-d-mute">Raising it lowers breaches but pushes you down the listing. Platforms reward under 12 minutes.</p>
                <Btn size="sm" onClick={() => setListings((cur) => cur.map((y) => (y.id === l.id ? { ...y, promise: Math.max(5, y.promise - 1) } : y)))}>−1</Btn>
                <span className="tnum w-12 text-center font-mono text-[18px] font-bold">{l.promise}m</span>
                <Btn size="sm" onClick={() => setListings((cur) => cur.map((y) => (y.id === l.id ? { ...y, promise: y.promise + 1 } : y)))}>+1</Btn>
                <Btn
                  size="sm"
                  variant="solid"
                  onClick={() => {
                    toast.success(`${l.platform} prep time set to ${l.promise} min`, { description: `${l.brand}, ${KITCHEN_NAME[l.kitchen]}` });
                    desk.log(`${l.brand} ${l.platform} promise set to ${l.promise} min`, "info");
                  }}
                >
                  Push
                </Btn>
              </div>
            </div>
            <div>
              <MonoLabel>What customers complain about</MonoLabel>
              <div className="flex flex-wrap gap-1.5">
                {l.complaints.map((c) => (
                  <Pill key={c} tone="late">{c}</Pill>
                ))}
              </div>
            </div>
            <div>
              <MonoLabel>Rating, last 8 weeks</MonoLabel>
              <Bars height={100} showValues format={(v) => v.toFixed(1)} data={[0.2, 0.1, 0.15, 0.05, 0.1, 0, -0.05, 0].map((d, i) => ({ label: `W${34 + i}`, value: Math.round((l.rating + d) * 10) / 10, tone: i === 7 ? "accent" : "neutral" }))} />
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Menu engineering ---------------- */

const MENU_CATS: MenuCat[] = ["Biryani & curries", "Starters & tandoor", "Breads, sweets & drinks"];

function MenuTab() {
  const desk = useDesk();
  const [dishes, setDishes] = React.useState(dishSeed);
  const [cat, setCat] = React.useState<MenuCat>("Biryani & curries");
  const [open, setOpen] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");
  const list = dishes.filter((d) => d.cat === cat);
  const { map, avgCm, popLine, total } = classify(list);
  const dish = dishes.find((d) => d.id === open) ?? null;
  const allClass = MENU_CATS.reduce<Record<string, MenuClass>>((acc, c) => ({ ...acc, ...classify(dishes.filter((d) => d.cat === c)).map }), {});
  const count = (k: MenuClass) => Object.values(allClass).filter((v) => v === k).length;
  const revenue = dishes.reduce((a, d) => a + d.price * d.sold, 0);
  const fc = dishes.reduce((a, d) => a + d.cost * d.sold, 0) / revenue;

  function openDish(d: Dish) {
    setOpen(d.id);
    setDraft(String(d.price));
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Stars" value={String(count("Star"))} delta="+1" hint="popular and profitable" icon={Star} tone="ok" trend={[4, 4, 5, 5, 5, 6, count("Star")]} />
        <Stat label="Plowhorses" value={String(count("Plowhorse"))} hint="sell a lot, earn little" icon={Scale} tone="warn" trend={[7, 7, 6, 7, 6, 6, count("Plowhorse")]} />
        <Stat label="Dogs" value={String(count("Dog"))} delta="-1" deltaGood={false} hint="candidates to drop" icon={Ban} tone="late" trend={[6, 6, 5, 5, 5, 5, count("Dog")]} />
        <Stat label="Menu food cost, 30d" value={`${(fc * 100).toFixed(1)}%`} delta="+0.4 pts" deltaGood={false} hint={`${inr(revenue, { compact: true })} item sales`} icon={IndianRupee} tone="accent" trend={[29.9, 30.1, 30.2, 30.4, 30.3, 30.5, fc * 100]} />
      </div>

      <Panel
        title="Menu engineering matrix"
        sub={`Popularity (log scale, plates in 30 days) against contribution margin per plate. Lines at ${Math.round(popLine).toLocaleString("en-IN")} plates and ${inr(avgCm)} margin.`}
        action={<Segmented size="sm" options={MENU_CATS} value={cat} onChange={setCat} />}
      >
        <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
          <MenuMatrix list={list} map={map} avgCm={avgCm} popLine={popLine} onPick={openDish} />
          <div className="space-y-2">
            {(["Star", "Plowhorse", "Puzzle", "Dog"] as MenuClass[]).map((k) => {
              const items = list.filter((d) => map[d.id] === k);
              return (
                <div key={k} className="rounded-[10px] border border-d-line p-3">
                  <p className="flex items-center gap-2 text-[13px] font-semibold">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: toneVar(CLASS_TONE[k]) }} />
                    {k}s <span className="font-mono text-[11px] font-normal text-d-mute">{items.length}</span>
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-d-mute">{CLASS_HINT[k]}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {items.map((d) => (
                      <button key={d.id} type="button" onClick={() => openDish(d)} className="rounded-full border border-d-line px-2 py-0.5 text-[11.5px] hover:border-d-accent hover:text-d-accent">
                        {d.name}
                      </button>
                    ))}
                    {items.length === 0 && <span className="text-[11.5px] text-d-mute">None in this category</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Panel>

      <Panel title="Item economics" sub="Click a dish for its recipe cost and to change the price">
        <DataTable
          rows={dishes}
          rowKey={(d) => d.id}
          onRow={openDish}
          search={(d) => `${d.name} ${d.station}`}
          searchPlaceholder="Dish or station"
          filter={{ get: (d) => allClass[d.id], options: ["Star", "Plowhorse", "Puzzle", "Dog"] }}
          dense
          pageSize={10}
          columns={[
            { key: "name", label: "Dish", sort: (d) => d.name, render: (d) => (<span><span className="font-medium">{d.name}</span><span className="block text-[11px] text-d-mute">{d.cat} · {d.station}</span></span>) },
            { key: "class", label: "Class", render: (d) => <Pill tone={CLASS_TONE[allClass[d.id]]}>{allClass[d.id]}</Pill> },
            { key: "price", label: "Price", align: "right", sort: (d) => d.price, render: (d) => <span className="tnum font-mono">{inr(d.price)}</span> },
            { key: "cost", label: "Plate cost", align: "right", sort: (d) => d.cost, render: (d) => <span className="tnum font-mono text-d-mute">{inr(d.cost)}</span> },
            { key: "fc", label: "Food cost", align: "right", sort: (d) => d.cost / d.price, render: (d) => <span className="tnum font-mono" style={{ color: d.cost / d.price > 0.36 ? "var(--d-late)" : d.cost / d.price > 0.3 ? "var(--d-warn)" : "var(--d-ok)" }}>{((d.cost / d.price) * 100).toFixed(0)}%</span> },
            { key: "cm", label: "Margin", align: "right", sort: (d) => d.price - d.cost, render: (d) => <span className="tnum font-mono font-semibold">{inr(d.price - d.cost)}</span> },
            { key: "sold", label: "Plates 30d", align: "right", sort: (d) => d.sold, render: (d) => <span className="tnum font-mono">{d.sold.toLocaleString("en-IN")}</span> },
            { key: "total", label: "Margin 30d", align: "right", wide: true, sort: (d) => (d.price - d.cost) * d.sold, render: (d) => <span className="tnum font-mono text-d-mute">{inr((d.price - d.cost) * d.sold, { compact: true })}</span> },
          ]}
        />
      </Panel>

      <PriceSheet
        dish={dish}
        cls={dish ? allClass[dish.id] : "Star"}
        draft={draft}
        setDraft={setDraft}
        share={dish && dish.cat === cat ? dish.sold / total : null}
        onClose={() => setOpen(null)}
        onApply={(d, price, sold) => {
          setDishes((cur) => cur.map((x) => (x.id === d.id ? { ...x, price, sold } : x)));
          toast.success(`${d.name}: ${inr(d.price)} → ${inr(price)}`, { description: "Pushed to Petpooja, Swiggy and Zomato. Menus update in about 10 minutes." });
          desk.log(`Price of ${d.name} changed ${inr(d.price)} → ${inr(price)}`, "info");
          setOpen(null);
        }}
      />
    </div>
  );
}

function MenuMatrix({ list, map, avgCm, popLine, onPick }: { list: Dish[]; map: Record<string, MenuClass>; avgCm: number; popLine: number; onPick: (d: Dish) => void }) {
  const W = 640;
  const H = 360;
  const pad = { l: 44, r: 16, t: 16, b: 34 };
  const r2 = (v: number) => Math.round(v * 100) / 100;
  const sold = list.map((d) => d.sold);
  const lo = Math.log10(Math.min(...sold, popLine) * 0.6);
  const hi = Math.log10(Math.max(...sold, popLine) * 1.5);
  const cms = list.map((d) => d.price - d.cost);
  const cmTop = Math.max(...cms, avgCm);
  const cmBot = Math.min(...cms, avgCm);
  const cmMin = Math.max(0, cmBot - (cmTop - cmBot) * 0.35);
  const cmMax = cmTop + (cmTop - cmBot) * 0.25;
  const x = (v: number) => r2(pad.l + ((Math.log10(v) - lo) / (hi - lo)) * (W - pad.l - pad.r));
  const y = (v: number) => r2(H - pad.b - ((v - cmMin) / (cmMax - cmMin)) * (H - pad.t - pad.b));
  const placed: { x: number; y: number; w: number }[] = [];
  const labels: Record<string, { x: number; y: number; anchor: "start" | "end" }> = {};
  [...list]
    .sort((a, b) => b.price - b.cost - (a.price - a.cost))
    .forEach((d) => {
      const cx = x(d.sold);
      const right = cx < W * 0.66;
      const w = (d.short.length + 6) * 7;
      const lx = right ? cx + 14 : cx - 14;
      const left = right ? lx : lx - w;
      let ly = y(d.price - d.cost) + 4;
      while (placed.some((p) => Math.abs(p.y - ly) < 14 && left < p.x + p.w && left + w > p.x)) ly += 14;
      placed.push({ x: left, y: ly, w });
      labels[d.id] = { x: r2(lx), y: r2(ly), anchor: right ? "start" : "end" };
    });
  const px = x(popLine);
  const py = y(avgCm);
  const maxRev = Math.max(...list.map((d) => d.price * d.sold));
  const ticks = [100, 300, 1000, 3000, 10000].filter((t) => Math.log10(t) > lo && Math.log10(t) < hi);
  return (
    <div className="rounded-[10px] border border-d-line bg-d-sunk p-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
        <rect x={px} y={pad.t} width={W - pad.r - px} height={py - pad.t} fill="var(--d-ok)" opacity="0.07" />
        <rect x={pad.l} y={pad.t} width={px - pad.l} height={py - pad.t} fill="var(--d-info)" opacity="0.07" />
        <rect x={px} y={py} width={W - pad.r - px} height={H - pad.b - py} fill="var(--d-warn)" opacity="0.07" />
        <rect x={pad.l} y={py} width={px - pad.l} height={H - pad.b - py} fill="var(--d-late)" opacity="0.07" />
        <line x1={px} x2={px} y1={pad.t} y2={H - pad.b} stroke="var(--d-mute)" strokeDasharray="4 4" />
        <line x1={pad.l} x2={W - pad.r} y1={py} y2={py} stroke="var(--d-mute)" strokeDasharray="4 4" />
        {[["STARS", W - pad.r - 6, pad.t + 14, "end", "var(--d-ok)"], ["PUZZLES", pad.l + 6, pad.t + 14, "start", "var(--d-info)"], ["PLOWHORSES", W - pad.r - 6, H - pad.b - 8, "end", "var(--d-warn)"], ["DOGS", pad.l + 6, H - pad.b - 8, "start", "var(--d-late)"]].map(([t, tx, ty, anchor, fill]) => (
          <text key={String(t)} x={Number(tx)} y={Number(ty)} textAnchor={anchor as "start" | "end"} fontSize="11" fontWeight="700" letterSpacing="1.5" fill={String(fill)} fontFamily="var(--font-mono, monospace)">
            {t}
          </text>
        ))}
        {ticks.map((t) => (
          <text key={t} x={x(t)} y={H - pad.b + 16} textAnchor="middle" fontSize="10.5" fill="var(--d-mute)" fontFamily="var(--font-mono, monospace)">
            {t >= 1000 ? `${t / 1000}k` : t}
          </text>
        ))}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <text key={f} x={pad.l - 6} y={y(cmMin + (cmMax - cmMin) * f * 0.92) + 4} textAnchor="end" fontSize="10.5" fill="var(--d-mute)" fontFamily="var(--font-mono, monospace)">
            ₹{Math.round(cmMin + (cmMax - cmMin) * f * 0.92)}
          </text>
        ))}
        <text x={W - pad.r} y={H - 4} textAnchor="end" fontSize="10.5" fill="var(--d-mute)" fontFamily="var(--font-mono, monospace)">
          plates sold, 30 days →
        </text>
        {list.map((d) => {
          const cx = x(d.sold);
          const cy = y(d.price - d.cost);
          const r = r2(7 + Math.sqrt((d.price * d.sold) / maxRev) * 11);
          const color = toneVar(CLASS_TONE[map[d.id]]);
          return (
            <g key={d.id} className="cursor-pointer" onClick={() => onPick(d)}>
              <circle cx={cx} cy={cy} r={r} fill={color} fillOpacity="0.22" stroke={color} strokeWidth="1.6" style={{ transition: "cx 600ms, cy 600ms" }} />
              <circle cx={cx} cy={cy} r="2.4" fill={color} />
              <text x={labels[d.id].x} y={labels[d.id].y} textAnchor={labels[d.id].anchor} fontSize="11.5" fill="var(--d-ink)" fontFamily="var(--font-mono, monospace)" paintOrder="stroke" stroke="var(--d-sunk)" strokeWidth="3">
                {d.short} ₹{d.price}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function PriceSheet({ dish, cls, draft, setDraft, share, onClose, onApply }: { dish: Dish | null; cls: MenuClass; draft: string; setDraft: (v: string) => void; share: number | null; onClose: () => void; onApply: (d: Dish, price: number, sold: number) => void }) {
  const price = Number(draft) || 0;
  const valid = dish && price >= dish.cost + 1 && price !== dish.price;
  const projSold = dish && price > 0 ? Math.round(dish.sold * Math.pow(dish.price / price, 1.1)) : 0;
  const delta = dish ? (price - dish.cost) * projSold - (dish.price - dish.cost) * dish.sold : 0;
  const recipe = dish
    ? [
        { k: dish.station === "Biryani" ? "Meat / main + rice" : dish.station === "Beverages" ? "Milk, sugar, base" : "Main ingredient", v: Math.round(dish.cost * 0.58) },
        { k: "Masala, ghee + oil", v: Math.round(dish.cost * 0.2) },
        { k: "Garnish + sides", v: Math.round(dish.cost * 0.1) },
        { k: "Packaging (delivery)", v: dish.cost - Math.round(dish.cost * 0.58) - Math.round(dish.cost * 0.2) - Math.round(dish.cost * 0.1) },
      ]
    : [];
  return (
    <Sheet
      open={!!dish}
      onOpenChange={(v) => !v && onClose()}
      width={500}
      eyebrow={dish ? `${dish.cat} · ${dish.station} station` : ""}
      title={dish?.name ?? ""}
      sub={dish ? `${cls} · ${dish.sold.toLocaleString("en-IN")} plates in 30 days${share !== null ? ` · ${(share * 100).toFixed(1)}% of category` : ""}` : ""}
      footer={
        dish && (
          <>
            <Btn onClick={onClose}>Cancel</Btn>
            <Btn variant="solid" icon={Send} disabled={!valid} onClick={() => valid && onApply(dish, price, projSold)}>
              Push new price
            </Btn>
          </>
        )
      }
    >
      {dish && (
        <div className="space-y-5">
          <p className="rounded-[10px] border border-d-line bg-d-sunk px-3 py-2.5 text-[12.5px]" style={{ borderColor: `color-mix(in oklab, ${toneVar(CLASS_TONE[cls])} 45%, transparent)` }}>
            <b style={{ color: toneVar(CLASS_TONE[cls]) }}>{cls}.</b> {CLASS_HINT[cls]}
          </p>
          <KV
            cols={3}
            items={[
              { k: "Price", v: inr(dish.price) },
              { k: "Plate cost", v: inr(dish.cost) },
              { k: "Margin / plate", v: inr(dish.price - dish.cost) },
              { k: "Food cost", v: `${((dish.cost / dish.price) * 100).toFixed(1)}%` },
              { k: "Margin, 30d", v: inr((dish.price - dish.cost) * dish.sold, { compact: true }) },
              { k: "Sales, 30d", v: inr(dish.price * dish.sold, { compact: true }) },
            ]}
          />
          <div>
            <MonoLabel>Recipe cost per plate</MonoLabel>
            <HBars format={(v) => inr(v)} data={recipe.map((r) => ({ label: r.k, value: r.v, tone: "accent" as Tone }))} />
          </div>
          <div className="rounded-[10px] border border-d-line p-3">
            <MonoLabel>Try a new price</MonoLabel>
            <div className="flex items-center gap-2">
              <Btn size="sm" onClick={() => setDraft(String(Math.max(dish.cost + 1, price - 10)))}>−10</Btn>
              <input className={`${inputClass} tnum w-28 text-center font-mono text-[16px] font-bold`} value={draft} inputMode="numeric" onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ""))} aria-label="New price" />
              <Btn size="sm" onClick={() => setDraft(String(price + 10))}>+10</Btn>
              <span className="ml-auto font-mono text-[12px] text-d-mute">food cost {price ? ((dish.cost / price) * 100).toFixed(1) : "—"}%</span>
            </div>
            {price > 0 && price !== dish.price && (
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-[8px] bg-d-sunk p-2">
                  <p className="text-[11px] text-d-mute">Plates / month</p>
                  <p className="tnum font-mono text-[15px] font-semibold">{projSold.toLocaleString("en-IN")}</p>
                </div>
                <div className="rounded-[8px] bg-d-sunk p-2">
                  <p className="text-[11px] text-d-mute">Margin / plate</p>
                  <p className="tnum font-mono text-[15px] font-semibold">{inr(price - dish.cost)}</p>
                </div>
                <div className="rounded-[8px] bg-d-sunk p-2">
                  <p className="text-[11px] text-d-mute">Monthly margin</p>
                  <p className="tnum font-mono text-[15px] font-semibold" style={{ color: delta >= 0 ? "var(--d-ok)" : "var(--d-late)" }}>
                    {delta >= 0 ? "+" : "−"}
                    {inr(Math.abs(delta), { compact: true })}
                  </p>
                </div>
              </div>
            )}
            <p className="mt-2 text-[11.5px] text-d-mute">Projection uses this dish&apos;s price elasticity from the last two price changes (−1.1).</p>
          </div>
        </div>
      )}
    </Sheet>
  );
}

/* ---------------- Inventory & wastage ---------------- */

function InventoryTab() {
  const desk = useDesk();
  const [kitchen, setKitchen] = React.useState<KitchenId>("BH");
  const [counts, setCounts] = React.useState<Record<string, string>>({});
  const [posted, setPosted] = React.useState<Record<string, string>>({});
  const [waste, setWaste] = React.useState(wasteSeed);
  const [pos, setPos] = React.useState(poSeed);
  const [hygiene, setHygiene] = React.useState(hygieneSeed);
  const [adding, setAdding] = React.useState(false);
  const [openPo, setOpenPo] = React.useState<string | null>(null);
  const f = OUTLET_FACTOR[kitchen];
  const rows = stockSeed.map((s) => {
    const system = Math.round(s.system * f * 10) / 10;
    const par = Math.round(s.par * f * 10) / 10;
    const raw = counts[`${kitchen}:${s.id}`];
    const counted = raw === undefined || raw === "" ? null : Number(raw);
    return { ...s, system, par, counted, variance: counted === null ? 0 : Math.round((counted - system) * 10) / 10 };
  });
  const countedN = rows.filter((r) => r.counted !== null).length;
  const varValue = rows.reduce((a, r) => a + r.variance * r.cost, 0);
  const below = rows.filter((r) => (r.counted ?? r.system) < r.par * 0.6);
  const wasteWeek = waste.reduce((a, w) => a + w.value, 0);
  const po = pos.find((p) => p.id === openPo) ?? null;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Stock value on hand" value={inr(rows.reduce((a, r) => a + (r.counted ?? r.system) * r.cost, 0), { compact: true })} hint={KITCHEN_NAME[kitchen]} icon={Package} trend={[1.6, 1.4, 1.7, 1.5, 1.6, 1.45, rows.reduce((a, r) => a + (r.counted ?? r.system) * r.cost, 0) / 1e5]} />
        <Stat label="Below 60% of par" value={String(below.length)} delta="+2" deltaGood={false} hint={below.slice(0, 2).map((b) => b.name.split(" ")[0]).join(", ")} icon={AlertTriangle} tone="late" trend={[2, 3, 2, 4, 3, 4, below.length]} />
        <Stat label="Wastage, last 4 days" value={inr(wasteWeek, { compact: true })} delta="+14%" deltaGood={false} hint={`${((wasteWeek / (487000 * 4)) * 100).toFixed(2)}% of sales`} icon={Trash} tone="warn" trend={[5.1, 5.8, 6.2, 5.6, 6.9, 7.1, wasteWeek / 1000]} />
        <Stat label="Open POs" value={inr(pos.filter((p) => p.col !== "Received").reduce((a, p) => a + p.value, 0), { compact: true })} hint={`${pos.filter((p) => p.col !== "Received").length} POs with 5 vendors`} icon={Truck} tone="info" trend={[0.9, 1.2, 1.0, 1.3, 1.1, 1.0, pos.filter((p) => p.col !== "Received").reduce((a, p) => a + p.value, 0) / 1e5]} />
      </div>

      <Panel
        title="Daily stock count"
        sub={posted[kitchen] ? `Posted ${posted[kitchen]} · edits create a new count` : `Closing count for ${KITCHEN_NAME[kitchen]}. Type what's on the shelf; variance updates as you go.`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Segmented size="sm" options={KITCHENS.map((k) => ({ value: k, label: KITCHEN_NAME[k].replace("CK ", "") }))} value={kitchen} onChange={setKitchen} />
            <Btn
              size="sm"
              variant="solid"
              icon={ClipboardCheck}
              disabled={countedN === 0}
              onClick={() => {
                const stamp = new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });
                setPosted((c) => ({ ...c, [kitchen]: stamp }));
                toast.success(`Stock count posted for ${KITCHEN_NAME[kitchen]}`, { description: `${countedN} items · variance ${varValue >= 0 ? "+" : "−"}${inr(Math.abs(varValue))} · Menu Switch re-checked` });
                desk.log(`Stock count posted at ${KITCHEN_NAME[kitchen]}: ${countedN} items, variance ${inr(Math.round(varValue))}`, Math.abs(varValue) > 2000 ? "warn" : "ok");
              }}
            >
              Post count
            </Btn>
          </div>
        }
      >
        <DataTable
          rows={rows}
          rowKey={(r) => r.id}
          filter={{ get: (r) => r.cat, options: ["Meat", "Veg", "Dairy", "Dry"] }}
          pageSize={14}
          dense
          columns={[
            { key: "name", label: "Item", sort: (r) => r.name, render: (r) => (<span><span className="font-medium">{r.name}</span><span className="block text-[11px] text-d-mute">{r.vendor}</span></span>) },
            { key: "par", label: "Par", align: "right", render: (r) => <span className="tnum font-mono text-d-mute">{r.par} {r.unit}</span> },
            { key: "sys", label: "System", align: "right", sort: (r) => r.system, render: (r) => <span className="tnum font-mono">{r.system}</span> },
            { key: "level", label: "Level", wide: true, render: (r) => <Meter value={r.counted ?? r.system} max={r.par} tone={(r.counted ?? r.system) < r.par * 0.6 ? "late" : (r.counted ?? r.system) < r.par * 0.85 ? "warn" : "ok"} className="w-24" /> },
            {
              key: "count",
              label: "Counted",
              align: "right",
              render: (r) => (
                <input
                  aria-label={`Count ${r.name}`}
                  inputMode="decimal"
                  placeholder={String(r.system)}
                  value={counts[`${kitchen}:${r.id}`] ?? ""}
                  onChange={(e) => setCounts((c) => ({ ...c, [`${kitchen}:${r.id}`]: e.target.value.replace(/[^0-9.]/g, "") }))}
                  className="tnum h-8 w-20 rounded-[6px] border border-d-line bg-d-sunk px-2 text-right font-mono text-[12.5px] text-d-ink outline-none focus:border-d-accent"
                />
              ),
            },
            { key: "var", label: "Variance", align: "right", sort: (r) => r.variance * r.cost, render: (r) => (r.counted === null ? <span className="text-d-mute">—</span> : <span className="tnum font-mono" style={{ color: r.variance < 0 ? "var(--d-late)" : r.variance > 0 ? "var(--d-info)" : "var(--d-ok)" }}>{r.variance > 0 ? "+" : ""}{r.variance} · {inr(Math.round(r.variance * r.cost))}</span>) },
          ]}
        />
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Panel
          icon={Trash}
          title="Wastage log"
          sub="Every burnt, spoilt or returned plate, logged at the station"
          action={
            <Btn size="sm" variant="solid" icon={Plus} onClick={() => setAdding(true)}>
              Log wastage
            </Btn>
          }
        >
          <DataTable
            rows={waste}
            rowKey={(w) => w.id}
            filter={{ get: (w) => w.reason, options: WASTE_REASONS }}
            pageSize={7}
            dense
            onRow={(w) => toast(`${w.item} · ${w.qty}`, { description: `${KITCHEN_NAME[w.kitchen]} · ${w.reason} · logged by ${w.by}, ${w.time}` })}
            columns={[
              { key: "time", label: "When", render: (w) => <span className="font-mono text-[11.5px] text-d-mute">{w.time}</span> },
              { key: "k", label: "Kitchen", render: (w) => <span className="font-mono text-[12px]">{w.kitchen}</span> },
              { key: "item", label: "Item", render: (w) => (<span><span className="font-medium">{w.item}</span><span className="block text-[11px] text-d-mute">{w.qty} · {w.by}</span></span>) },
              { key: "reason", label: "Reason", render: (w) => <Pill tone={wasteTone[w.reason]}>{w.reason}</Pill> },
              { key: "v", label: "Value", align: "right", sort: (w) => w.value, render: (w) => <span className="tnum font-mono font-semibold">{inr(w.value)}</span> },
            ]}
          />
        </Panel>
        <Panel title="Wastage by reason and kitchen" sub="Last 4 days">
          <Donut center={inr(wasteWeek, { compact: true })} sub="wasted" segments={WASTE_REASONS.map((r) => ({ label: r, value: waste.filter((w) => w.reason === r).reduce((a, w) => a + w.value, 0), tone: wasteTone[r] }))} />
          <div className="mt-5">
            <HBars format={(v) => inr(v)} data={KITCHENS.map((k) => ({ label: KITCHEN_NAME[k], value: waste.filter((w) => w.kitchen === k).reduce((a, w) => a + w.value, 0), tone: k === "KP" ? ("late" as Tone) : ("accent" as Tone) })).sort((a, b) => b.value - a.value)} />
          </div>
        </Panel>
      </div>

      <Panel
        icon={Truck}
        title="Vendor POs"
        sub="Drag a PO across as it moves. Dropping on Received posts the GRN and updates stock."
        action={
          <Btn
            size="sm"
            icon={Sparkles}
            onClick={() => {
              const id = `PO-${1420 + pos.length}`;
              setPos((cur) => [...cur, { id, vendor: "Godavari Dairy Farms", cat: "Dairy", items: "Cream 10 L, butter 6 kg, ghee 5 kg", value: 8520, kitchen: "All 5", eta: "Wed 7:00 AM", col: "Draft" }]);
              toast.success(`${id} drafted from par levels`, { description: "Cream, butter and ghee under par across kitchens" });
              desk.log(`Purchase Planner drafted ${id} for Godavari Dairy, ₹8,520`, "info");
            }}
          >
            Draft from par
          </Btn>
        }
      >
        <Board
          columns={[
            { id: "Draft", label: "Draft", tone: "neutral", hint: "Planner's suggestion, not sent" },
            { id: "Sent", label: "Sent to vendor", tone: "info", hint: "WhatsApp PO, waiting confirmation" },
            { id: "In transit", label: "In transit", tone: "warn" },
            { id: "Received", label: "Received", tone: "ok", hint: "GRN posted, stock updated" },
          ]}
          items={pos}
          itemKey={(p) => p.id}
          getColumn={(p) => p.col}
          minColumnWidth={230}
          onMove={(key, col) => {
            const p = pos.find((x) => x.id === key);
            if (!p || p.col === col) return;
            setPos((cur) => cur.map((x) => (x.id === key ? { ...x, col: col as PO["col"] } : x)));
            toast.success(`${key} → ${col}`, { description: col === "Received" ? `GRN posted · ${inr(p.value)} payable to ${p.vendor}` : col === "Sent" ? `PO sent to ${p.vendor} on WhatsApp` : p.vendor });
            desk.log(`${key} (${p.vendor}) moved to ${col}`, col === "Received" ? "ok" : "info");
          }}
          renderCard={(p) => (
            <button type="button" onClick={() => setOpenPo(p.id)} className="block w-full text-left">
              <p className="flex items-center justify-between gap-2 pr-4">
                <span className="font-mono text-[11px] text-d-mute">{p.id}</span>
                <span className="tnum font-mono text-[12.5px] font-semibold">{inr(p.value)}</span>
              </p>
              <p className="mt-1 text-[13px] font-semibold">{p.vendor}</p>
              <p className="mt-0.5 text-[11.5px] leading-snug text-d-mute">{p.items}</p>
              <p className="mt-2 flex items-center justify-between font-mono text-[10.5px] text-d-mute">
                <Pill tone={p.cat === "Mutton" || p.cat === "Chicken + eggs" ? "late" : p.cat === "Veg" ? "ok" : p.cat === "Dairy" ? "info" : "neutral"}>{p.cat}</Pill>
                <span>{p.eta}</span>
              </p>
            </button>
          )}
        />
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel icon={ShieldCheck} title="FSSAI licences" sub="One licence per kitchen, from FoSCoS">
          <ul className="space-y-2">
            {licences.map((x) => (
              <li key={x.kitchen} className="flex items-center gap-3 rounded-[10px] border border-d-line px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold">{KITCHEN_NAME[x.kitchen]}</p>
                  <p className="truncate font-mono text-[11px] text-d-mute">
                    {x.type} {x.no} · audit {x.audit}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[11.5px]">{x.expires}</p>
                  <Pill tone={x.days <= 30 ? "late" : x.days <= 90 ? "warn" : "ok"} mono>
                    {x.days}d
                  </Pill>
                </div>
                {x.days <= 90 && (
                  <Btn
                    size="sm"
                    variant={x.days <= 30 ? "solid" : "outline"}
                    onClick={() => {
                      toast.success(`Renewal filed on FoSCoS for ${KITCHEN_NAME[x.kitchen]}`, { description: `Fee ₹${x.type === "Registration" ? "100" : "2,000"} per year · application ref FSC/${x.no.slice(-5)}` });
                      desk.log(`FSSAI renewal filed for ${KITCHEN_NAME[x.kitchen]}`, "ok");
                    }}
                  >
                    Renew
                  </Btn>
                )}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel icon={Thermometer} title="Hygiene + food safety checks" sub={`${hygiene.filter((h) => h.done).length} of ${hygiene.length} done this week`}>
          <Checklist
            items={hygiene}
            onToggle={(id) => {
              const h = hygiene.find((x) => x.id === id);
              setHygiene((cur) => cur.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
              if (h && !h.done) {
                toast.success("Check signed off", { description: h.label });
                desk.log(`Food safety: ${h.label}`, "ok");
              }
            }}
          />
          <div className="mt-4 rounded-[10px] border border-d-late/40 bg-[color-mix(in_oklab,var(--d-late)_8%,transparent)] p-3 text-[12.5px]">
            <p className="font-semibold text-d-late">Kukatpally walk-in chiller sensor offline since 6:40 AM</p>
            <p className="mt-0.5 text-d-mute">Last reading 3.8°C. Arif is logging by hand every 2 hours until the probe is replaced.</p>
          </div>
        </Panel>
      </div>

      <WasteModal
        open={adding}
        onOpenChange={setAdding}
        onAdd={(w) => {
          setWaste((cur) => [w, ...cur]);
          toast.success(`Wastage logged: ${w.item}`, { description: `${w.qty} · ${inr(w.value)} · ${w.reason}` });
          desk.log(`Wastage at ${KITCHEN_NAME[w.kitchen]}: ${w.item} ${w.qty} (${inr(w.value)})`, "warn");
        }}
      />
      <Sheet
        open={!!po}
        onOpenChange={(v) => !v && setOpenPo(null)}
        eyebrow={po ? `${po.id} · ${po.cat}` : ""}
        title={po?.vendor ?? ""}
        sub={po ? `${po.kitchen} · ${po.eta}` : ""}
        footer={
          po && (
            <>
              <Btn
                icon={Phone}
                onClick={() => {
                  toast(`Calling ${po.vendor}`, { description: "Srikanth's phone, from the office line" });
                  desk.log(`Called ${po.vendor} about ${po.id}`);
                }}
              >
                Call vendor
              </Btn>
              {po.col !== "Received" && (
                <Btn
                  variant="solid"
                  onClick={() => {
                    const next: PO["col"] = po.col === "Draft" ? "Sent" : po.col === "Sent" ? "In transit" : "Received";
                    setPos((cur) => cur.map((x) => (x.id === po.id ? { ...x, col: next } : x)));
                    toast.success(`${po.id} → ${next}`, { description: po.vendor });
                    desk.log(`${po.id} (${po.vendor}) moved to ${next}`, next === "Received" ? "ok" : "info");
                  }}
                >
                  {po.col === "Draft" ? "Send on WhatsApp" : po.col === "Sent" ? "Mark dispatched" : "Post GRN"}
                </Btn>
              )}
            </>
          )
        }
      >
        {po && (
          <div className="space-y-4">
            <KV items={[{ k: "Value", v: inr(po.value) }, { k: "Status", v: po.col }, { k: "Deliver to", v: po.kitchen }, { k: "ETA", v: po.eta }]} />
            <div>
              <MonoLabel>Lines</MonoLabel>
              <ul className="space-y-1.5">
                {po.items.split(", ").map((line) => (
                  <li key={line} className="rounded-[8px] border border-d-line px-3 py-2 text-[13px]">
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <p className="rounded-[8px] bg-d-sunk px-3 py-2 text-[12px] text-d-mute">Payment terms: weekly on Saturday by NEFT. GST invoice matched to GRN by Lakshmi in Tally.</p>
          </div>
        )}
      </Sheet>
    </div>
  );
}

function WasteModal({ open, onOpenChange, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (w: Waste) => void }) {
  const [kitchen, setKitchen] = React.useState<KitchenId>("KP");
  const [item, setItem] = React.useState("Chicken tikka, marinated");
  const [qty, setQty] = React.useState("1.5");
  const [unit, setUnit] = React.useState("kg");
  const [reason, setReason] = React.useState<Waste["reason"]>("Burnt / dropped");
  const [value, setValue] = React.useState("450");
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Log wastage" sub="Logged items reduce stock and show on the outlet's food cost.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onAdd({ id: `W${Date.now() % 100000}`, time: "Today, now", kitchen, item, qty: `${qty} ${unit}`, value: Number(value) || 0, reason, by: "Ayesha Siddiqui" });
          onOpenChange(false);
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Kitchen">
            <select className={inputClass} value={kitchen} onChange={(e) => setKitchen(e.target.value as KitchenId)}>
              {KITCHENS.map((k) => (
                <option key={k} value={k}>
                  {KITCHEN_NAME[k]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Reason">
            <select className={inputClass} value={reason} onChange={(e) => setReason(e.target.value as Waste["reason"])}>
              {WASTE_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Item">
          <input className={inputClass} value={item} onChange={(e) => setItem(e.target.value)} />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Quantity">
            <input className={inputClass} value={qty} onChange={(e) => setQty(e.target.value)} inputMode="decimal" />
          </Field>
          <Field label="Unit">
            <select className={inputClass} value={unit} onChange={(e) => setUnit(e.target.value)}>
              {["kg", "L", "portions", "pcs"].map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </Field>
          <Field label="Value (₹)">
            <input className={inputClass} value={value} onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Btn onClick={() => onOpenChange(false)}>Cancel</Btn>
          <Btn variant="solid" type="submit" icon={Trash}>
            Log it
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Reservations & reviews ---------------- */

function fmtSlot(at: number) {
  const h = Math.floor(at);
  const m = Math.round((at - h) * 60);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function GuestsTab() {
  const desk = useDesk();
  const [bookings, setBookings] = React.useState(bookingSeed);
  const [floorK, setFloorK] = React.useState<"BH" | "GB" | "KP">("BH");
  const [floors, setFloors] = React.useState<Record<"BH" | "GB" | "KP", FloorTable[]>>(() => ({ BH: floorFor("BH"), GB: floorFor("GB"), KP: floorFor("KP") }));
  const [reviews, setReviews] = React.useState(reviewSeed);
  const [rf, setRf] = React.useState<"All" | "Unanswered" | "1–3 stars">("Unanswered");
  const [openB, setOpenB] = React.useState<string | null>(null);
  const [openR, setOpenR] = React.useState<string | null>(null);
  const [reply, setReply] = React.useState("");
  const [adding, setAdding] = React.useState(false);
  const b = bookings.find((x) => x.id === openB) ?? null;
  const r = reviews.find((x) => x.id === openR) ?? null;
  const tonight = bookings.filter((x) => x.at >= 18 && (x.status === "Confirmed" || x.status === "Waitlist"));
  const shownReviews = reviews.filter((x) => (rf === "All" ? true : rf === "Unanswered" ? !x.reply : x.stars <= 3));
  const google = reviews.filter((x) => x.source === "Google");
  const floor = floors[floorK];

  function setStatus(x: Booking, status: Booking["status"]) {
    setBookings((cur) => cur.map((y) => (y.id === x.id ? { ...y, status } : y)));
    toast[status === "No-show" || status === "Cancelled" ? "warning" : "success"](`${x.name}: ${status}`, { description: `${KITCHEN_NAME[x.kitchen]} · ${fmtSlot(x.at)} · ${x.pax} pax` });
    desk.log(`Booking ${x.name} (${x.kitchen}, ${x.pax} pax) marked ${status}`, status === "Seated" ? "ok" : status === "No-show" ? "late" : "info");
  }
  function cycleTable(t: FloorTable) {
    const order: TableState[] = ["Free", "Seated", "Cleaning", "Free"];
    const next: TableState = t.state === "Reserved" ? "Seated" : order[order.indexOf(t.state) + 1] ?? "Free";
    setFloors((cur) => ({ ...cur, [floorK]: cur[floorK].map((y) => (y.id === t.id ? { ...y, state: next, mins: next === "Seated" ? 0 : y.mins } : y)) }));
    toast(`${KITCHEN_NAME[floorK]} ${t.id}: ${next}`, { description: `${t.seats} seats` });
    desk.log(`${KITCHEN_NAME[floorK]} table ${t.id} → ${next}`);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Covers booked tonight" value={String(tonight.reduce((a, x) => a + x.pax, 0))} delta="+18%" hint={`${tonight.length} bookings · 3 outlets`} icon={CalendarCheck} trend={[38, 44, 41, 52, 49, 55, tonight.reduce((a, x) => a + x.pax, 0)]} />
        <Stat label="No-show rate, 30d" value="7.4%" delta="-1.1 pts" deltaGood={false} hint="WhatsApp reminder at 4 PM" icon={Ban} tone="ok" trend={[9.8, 9.1, 8.8, 8.5, 8.1, 7.9, 7.4]} />
        <Stat label="Google rating" value={(google.reduce((a, x) => a + x.stars, 0) / google.length + 0.6).toFixed(1)} delta="+0.1" hint="4,812 reviews, 3 outlets" icon={Star} tone="warn" trend={[4.2, 4.2, 4.3, 4.3, 4.3, 4.4, 4.4]} />
        <Stat label="Reviews unanswered" value={String(reviews.filter((x) => !x.reply).length)} delta="+3" deltaGood={false} hint="target: reply within 24 h" icon={MessageSquareReply} tone="late" trend={[3, 2, 4, 5, 4, 6, reviews.filter((x) => !x.reply).length]} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Panel
          title="Bookings today"
          sub="Phone, WhatsApp, Google and Zomato Dining in one list. Click for the guest."
          action={
            <Btn size="sm" variant="solid" icon={Plus} onClick={() => setAdding(true)}>
              New booking
            </Btn>
          }
        >
          <DataTable
            rows={[...bookings].sort((a, z) => a.at - z.at)}
            rowKey={(x) => x.id}
            onRow={(x) => setOpenB(x.id)}
            search={(x) => `${x.name} ${x.phone} ${x.table ?? ""}`}
            searchPlaceholder="Guest, phone, table"
            filter={{ get: (x) => x.status, options: ["Confirmed", "Seated", "Waitlist", "No-show", "Cancelled"] }}
            pageSize={8}
            dense
            bulk={[
              {
                label: "Send WhatsApp reminder",
                run: (keys) => {
                  toast.success(`Reminder sent to ${keys.length} guests`, { description: "With table, time and Google Maps pin" });
                  desk.log(`Booking reminders sent to ${keys.length} guests`);
                },
              },
            ]}
            columns={[
              { key: "at", label: "Time", sort: (x) => x.at, render: (x) => <span className="tnum font-mono text-[12px]">{fmtSlot(x.at)}</span> },
              { key: "name", label: "Guest", sort: (x) => x.name, render: (x) => (<span><span className="font-medium">{x.name}</span>{x.occasion && <span className="ml-1.5 text-[11px] text-d-accent">· {x.occasion}</span>}<span className="block text-[11px] text-d-mute">{x.visits ? `${x.visits} visits` : "First visit"} · {x.source}</span></span>) },
              { key: "k", label: "Outlet", render: (x) => <span className="font-mono text-[12px]">{x.kitchen}</span> },
              { key: "pax", label: "Pax", align: "right", sort: (x) => x.pax, render: (x) => <span className="tnum font-mono">{x.pax}</span> },
              { key: "table", label: "Table", wide: true, render: (x) => <span className="font-mono text-[12px] text-d-mute">{x.table ?? "—"}</span> },
              { key: "st", label: "Status", render: (x) => <Pill tone={bookingTone[x.status]}>{x.status}</Pill> },
            ]}
          />
        </Panel>
        <Panel icon={LayoutGrid} title="The floor, right now" sub="Tap a table to seat, clear or reset it" action={<Segmented size="sm" options={[{ value: "BH" as const, label: "BH" }, { value: "GB" as const, label: "GB" }, { value: "KP" as const, label: "KP" }]} value={floorK} onChange={setFloorK} />}>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4">
            {floor.map((t) => {
              const color = toneVar(tableTone[t.state]);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => cycleTable(t)}
                  className="rounded-[10px] border p-2.5 text-left transition-transform hover:-translate-y-0.5"
                  style={{ borderColor: `color-mix(in oklab, ${color} 45%, transparent)`, background: `color-mix(in oklab, ${color} 9%, transparent)` }}
                >
                  <p className="flex items-center justify-between font-mono text-[13px] font-bold">
                    {t.id}
                    <span className="text-[10.5px] font-normal text-d-mute">{t.seats}p</span>
                  </p>
                  <p className="mt-1 font-mono text-[10.5px] uppercase tracking-wide" style={{ color }}>
                    {t.state}
                  </p>
                  <p className="truncate text-[11px] text-d-mute">{t.state === "Seated" ? `${t.guest} · ${t.mins}m` : t.state === "Reserved" ? "from 7:30 PM" : t.state === "Cleaning" ? "busser on it" : "ready"}</p>
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 font-mono text-[11px] text-d-mute">
            {(["Free", "Seated", "Reserved", "Cleaning"] as TableState[]).map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: toneVar(tableTone[s]) }} />
                {s} {floor.filter((t) => t.state === s).length}
              </span>
            ))}
          </div>
        </Panel>
      </div>

      <Panel icon={Star} title="Google and Zomato reviews" sub="Review Responder drafts a reply in Ayesha's voice. Edit, then post." action={<Segmented size="sm" options={["Unanswered", "1–3 stars", "All"] as const} value={rf} onChange={setRf} />}>
        <div className="grid gap-3 md:grid-cols-2">
          {shownReviews.map((x) => (
            <article key={x.id} className="desk-rise flex flex-col rounded-[10px] border border-d-line bg-d-sunk p-3.5">
              <div className="flex items-start gap-3">
                <Avatar name={x.author} size={34} tone={x.stars <= 2 ? "late" : x.stars === 3 ? "warn" : "ok"} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-[13.5px] font-semibold">
                    <span className="truncate">{x.author}</span>
                    <Stars n={x.stars} />
                  </p>
                  <p className="font-mono text-[11px] text-d-mute">
                    {x.source} · {KITCHEN_NAME[x.kitchen]} · {x.when}
                  </p>
                </div>
              </div>
              <p className="mt-2 flex-1 text-[13px] leading-relaxed">{x.text}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {x.tags.map((t) => (
                  <Pill key={t} tone={x.stars <= 3 ? "late" : "ok"}>{t}</Pill>
                ))}
              </div>
              {x.reply ? (
                <p className="mt-3 rounded-[8px] border-l-2 border-d-accent bg-d-panel px-3 py-2 text-[12px] text-d-mute">
                  <span className="font-semibold text-d-ink">Owner reply · </span>
                  {x.reply}
                </p>
              ) : (
                <div className="mt-3 flex justify-end">
                  <Btn
                    size="sm"
                    variant={x.stars <= 3 ? "solid" : "soft"}
                    icon={MessageSquareReply}
                    onClick={() => {
                      setOpenR(x.id);
                      setReply(draftReply(x));
                    }}
                  >
                    Reply
                  </Btn>
                </div>
              )}
            </article>
          ))}
          {shownReviews.length === 0 && <p className="col-span-full rounded-xl border border-dashed border-d-line py-10 text-center text-[13px] text-d-mute">Inbox zero. Every review has a reply.</p>}
        </div>
      </Panel>

      <Sheet
        open={!!b}
        onOpenChange={(v) => !v && setOpenB(null)}
        eyebrow={b ? `${KITCHEN_NAME[b.kitchen]} · ${fmtSlot(b.at)} · ${b.source}` : ""}
        title={b?.name ?? ""}
        sub={b ? `${b.pax} guests${b.table ? ` · ${b.table}` : ""}${b.occasion ? ` · ${b.occasion}` : ""}` : ""}
        footer={
          b && (
            <>
              {b.status !== "No-show" && b.status !== "Seated" && (
                <Btn variant="danger" onClick={() => setStatus(b, "No-show")}>
                  No-show
                </Btn>
              )}
              <Btn
                icon={Send}
                onClick={() => {
                  toast.success(`WhatsApp sent to ${b.name}`, { description: `"Your table for ${b.pax} at ${KITCHEN_NAME[b.kitchen]} is ready at ${fmtSlot(b.at)}"` });
                  desk.log(`WhatsApp confirmation sent to ${b.name}`);
                }}
              >
                WhatsApp
              </Btn>
              {b.status !== "Seated" && (
                <Btn variant="solid" icon={Armchair} onClick={() => setStatus(b, "Seated")}>
                  Seat now
                </Btn>
              )}
            </>
          )
        }
      >
        {b && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 rounded-[10px] border border-d-line p-3">
              <Avatar name={b.name} size={42} />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold">{b.name}</p>
                <p className="font-mono text-[11.5px] text-d-mute">+91 {b.phone} · {b.visits ? `${b.visits} visits, avg bill ${inr(1450 + b.visits * 90)}` : "first visit"}</p>
              </div>
              <Pill tone={bookingTone[b.status]}>{b.status}</Pill>
            </div>
            {b.note && <p className="rounded-[8px] border border-d-warn/40 bg-[color-mix(in_oklab,var(--d-warn)_10%,transparent)] px-3 py-2 text-[12.5px] text-d-warn">{b.note}</p>}
            <div>
              <MonoLabel>Assign table</MonoLabel>
              <div className="flex flex-wrap gap-1.5">
                {(b.kitchen in floors ? floors[b.kitchen] : [])
                  .filter((t) => t.seats >= b.pax || t.seats >= 6)
                  .slice(0, 10)
                  .map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setBookings((cur) => cur.map((y) => (y.id === b.id ? { ...y, table: t.id } : y)));
                        toast.success(`${b.name} → ${t.id}`, { description: `${t.seats} seats · ${t.state.toLowerCase()} now` });
                        desk.log(`${b.name} assigned ${t.id} at ${KITCHEN_NAME[b.kitchen]}`);
                      }}
                      className={`rounded-[6px] border px-2.5 py-1 font-mono text-[12px] ${b.table === t.id ? "border-d-accent bg-d-accent text-d-accent-ink" : "border-d-line hover:border-d-accent"}`}
                    >
                      {t.id} · {t.seats}p
                    </button>
                  ))}
              </div>
            </div>
            <div>
              <MonoLabel>Past orders</MonoLabel>
              <ul className="space-y-1 text-[12.5px] text-d-mute">
                {b.visits ? ["Pathar ka Gosht, Mutton Dum Biryani, Irani Chai", "Chicken Dum Biryani x2, Double ka Meetha", "Paneer Tikka, Dal Makhani, Butter Naan"].slice(0, Math.min(3, b.visits)).map((o) => <li key={o}>· {o}</li>) : <li>No history yet. Ask for preferences at seating.</li>}
              </ul>
            </div>
          </div>
        )}
      </Sheet>

      <Sheet
        open={!!r}
        onOpenChange={(v) => !v && setOpenR(null)}
        eyebrow={r ? `${r.source} · ${KITCHEN_NAME[r.kitchen]} · ${r.when}` : ""}
        title={r ? `Reply to ${r.author}` : ""}
        sub={r ? `${r.stars} star${r.stars > 1 ? "s" : ""} · ${r.tags.join(", ")}` : ""}
        footer={
          r && (
            <>
              <Btn onClick={() => setReply(draftReply(r))} icon={Sparkles}>
                Redraft
              </Btn>
              <Btn
                variant="solid"
                icon={Send}
                disabled={reply.trim().length < 10}
                onClick={() => {
                  setReviews((cur) => cur.map((y) => (y.id === r.id ? { ...y, reply: reply.trim() } : y)));
                  toast.success(`Reply posted on ${r.source}`, { description: `${r.author} · ${KITCHEN_NAME[r.kitchen]}` });
                  desk.log(`Replied to ${r.stars}★ ${r.source} review by ${r.author}`, "ok");
                  setOpenR(null);
                }}
              >
                Post reply
              </Btn>
            </>
          )
        }
      >
        {r && (
          <div className="space-y-4">
            <div className="rounded-[10px] bg-d-sunk p-3">
              <Stars n={r.stars} size={15} />
              <p className="mt-1.5 text-[13px] leading-relaxed">{r.text}</p>
            </div>
            <Field label="Your reply">
              <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={7} className={`${inputClass} h-auto py-2 leading-relaxed`} />
            </Field>
            <p className="font-mono text-[11px] text-d-mute">{reply.length} characters · Google shows the first 300 in search</p>
          </div>
        )}
      </Sheet>

      <BookingModal
        open={adding}
        onOpenChange={setAdding}
        onAdd={(x) => {
          setBookings((cur) => [...cur, x]);
          toast.success(`Booked: ${x.name}, ${x.pax} pax`, { description: `${KITCHEN_NAME[x.kitchen]} · ${fmtSlot(x.at)} · WhatsApp confirmation sent` });
          desk.log(`New booking: ${x.name}, ${x.pax} pax at ${KITCHEN_NAME[x.kitchen]} ${fmtSlot(x.at)}`, "ok");
        }}
      />
    </div>
  );
}

function BookingModal({ open, onOpenChange, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (b: Booking) => void }) {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [kitchen, setKitchen] = React.useState<"BH" | "GB" | "KP">("BH");
  const [at, setAt] = React.useState("20");
  const [pax, setPax] = React.useState("4");
  const [occasion, setOccasion] = React.useState("");
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="New booking" sub="Guest gets a WhatsApp confirmation and a reminder at 4 PM.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          onAdd({ id: `B${Date.now() % 100000}`, name: name.trim(), phone: phone || "—", kitchen, at: Number(at), pax: Number(pax) || 2, occasion: occasion || undefined, source: "Phone", status: "Confirmed", visits: 0 });
          setName("");
          setPhone("");
          setOccasion("");
          onOpenChange(false);
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Guest name">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ravi Teja" />
          </Field>
          <Field label="Mobile">
            <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98480 00000" inputMode="tel" />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Outlet">
            <select className={inputClass} value={kitchen} onChange={(e) => setKitchen(e.target.value as "BH" | "GB" | "KP")}>
              <option value="BH">Banjara Hills</option>
              <option value="GB">Gachibowli</option>
              <option value="KP">Kondapur</option>
            </select>
          </Field>
          <Field label="Time">
            <select className={inputClass} value={at} onChange={(e) => setAt(e.target.value)}>
              {[19, 19.5, 20, 20.5, 21, 21.5, 22].map((t) => (
                <option key={t} value={String(t)}>
                  {fmtSlot(t)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Guests">
            <input className={inputClass} value={pax} onChange={(e) => setPax(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" />
          </Field>
        </div>
        <Field label="Occasion (optional)">
          <input className={inputClass} value={occasion} onChange={(e) => setOccasion(e.target.value)} placeholder="Birthday, anniversary, team dinner" />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Btn onClick={() => onOpenChange(false)}>Cancel</Btn>
          <Btn variant="solid" type="submit" icon={CalendarCheck} disabled={!name.trim()}>
            Book table
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
