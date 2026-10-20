"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeftRight,
  BadgePercent,
  Boxes,
  CreditCard,
  Footprints,
  Gauge as GaugeIcon,
  Globe,
  IndianRupee,
  MapPin,
  MessageCircle,
  Package,
  Plus,
  Receipt,
  Send,
  Store,
  Tag,
  Timer,
  Truck,
  Tv,
  Users,
  Wrench,
} from "lucide-react";
import { DeskShell, useDesk } from "../shell";
import { AreaChart, Bars, Donut, HBars } from "../charts";
import { ApprovalQueue, Board, Countdown, DataTable } from "../data";
import { AgentsModule, ConnectionsModule, IndependenceModule, PeopleModule } from "../common";
import { Avatar, Btn, Dot, Feed, Field, inputClass, inr, KV, Meter, Modal, Panel, Pill, Segmented, Sheet, Stat } from "../ui";
import type { DeskConfig, DeskModule, IndependenceData, Integration, TeamMember, Tone, WorkforceAgent } from "../types";

/* ============================================================
   Data — Saurashtra Electronics, Rajkot. Fictional 11-store chain.
   Today is Tue 20 Oct 2026; Dhanteras is Fri 6 Nov.
   ============================================================ */

type StoreRow = { id: string; name: string; short: string; town: string; x: number; y: number; manager: string; sqft: number; size: number; target: number; sales: number; foot: number; bills: number };

const STORES: StoreRow[] = [
  { id: "RJ1", name: "Rajkot · Kalawad Road", short: "Kalawad Rd", town: "Rajkot", x: 355, y: 250, manager: "Nirav Dholakia", sqft: 9200, size: 1.6, target: 1450000, sales: 1012400, foot: 412, bills: 61 },
  { id: "RJ2", name: "Rajkot · Yagnik Road", short: "Yagnik Rd", town: "Rajkot", x: 535, y: 205, manager: "Foram Ghodasara", sqft: 7400, size: 1.4, target: 1200000, sales: 884900, foot: 356, bills: 52 },
  { id: "RJ3", name: "Rajkot · 150 Ft Ring Road", short: "150 Ft Ring", town: "Rajkot", x: 455, y: 330, manager: "Sagar Kotak", sqft: 6100, size: 1.2, target: 950000, sales: 611200, foot: 298, bills: 41 },
  { id: "JMN", name: "Jamnagar · Pandit Nehru Marg", short: "Jamnagar", town: "Jamnagar", x: 195, y: 135, manager: "Kishan Vaghela", sqft: 5600, size: 1.1, target: 820000, sales: 498300, foot: 244, bills: 33 },
  { id: "JND", name: "Junagadh · Zanzarda Road", short: "Junagadh", town: "Junagadh", x: 265, y: 455, manager: "Alpesh Ramani", sqft: 4800, size: 0.9, target: 640000, sales: 402700, foot: 207, bills: 27 },
  { id: "BVN", name: "Bhavnagar · Waghawadi Road", short: "Bhavnagar", town: "Bhavnagar", x: 850, y: 365, manager: "Dhaval Trivedi", sqft: 5400, size: 1.1, target: 800000, sales: 523600, foot: 231, bills: 35 },
  { id: "MRB", name: "Morbi · Ravapar Road", short: "Morbi", town: "Morbi", x: 470, y: 70, manager: "Hardik Aghara", sqft: 3900, size: 0.8, target: 560000, sales: 289400, foot: 162, bills: 19 },
  { id: "GDL", name: "Gondal · Station Road", short: "Gondal", town: "Gondal", x: 430, y: 440, manager: "Vipul Sojitra", sqft: 3200, size: 0.7, target: 420000, sales: 231800, foot: 131, bills: 16 },
  { id: "PBR", name: "Porbandar · M G Road", short: "Porbandar", town: "Porbandar", x: 95, y: 360, manager: "Rizwan Kadiwala", sqft: 3000, size: 0.7, target: 400000, sales: 187600, foot: 118, bills: 13 },
  { id: "AMR", name: "Amreli · Library Road", short: "Amreli", town: "Amreli", x: 640, y: 450, manager: "Jagdish Bhalala", sqft: 2700, size: 0.6, target: 360000, sales: 164900, foot: 104, bills: 12 },
  { id: "SNR", name: "Surendranagar · Wadhwan Road", short: "Surendranagar", town: "Surendranagar", x: 790, y: 120, manager: "Chirag Makwana", sqft: 3100, size: 0.7, target: 400000, sales: 214300, foot: 126, bills: 15 },
];
const storeById = (id: string) => STORES.find((s) => s.id === id)!;

type Sku = { id: string; name: string; brand: string; cat: string; price: number; par: number };
const SKUS: Sku[] = [
  { id: "SM-A35", name: "Galaxy A35 5G 8/128", brand: "Samsung", cat: "Mobiles", price: 30999, par: 12 },
  { id: "IP15", name: "iPhone 15 128 GB", brand: "Apple", cat: "Mobiles", price: 69900, par: 6 },
  { id: "VV-Y58", name: "Vivo Y58 5G 8/128", brand: "Vivo", cat: "Mobiles", price: 19499, par: 14 },
  { id: "SY55", name: "Bravia 55\" 4K X75L", brand: "Sony", cat: "TV", price: 72990, par: 4 },
  { id: "RM43", name: "Redmi 43\" 4K Fire TV", brand: "Xiaomi", cat: "TV", price: 22999, par: 8 },
  { id: "LG-AC", name: "LG 1.5T 5★ inverter AC", brand: "LG", cat: "AC", price: 46490, par: 6 },
  { id: "VL-AC", name: "Voltas 1.5T 3★ inverter AC", brand: "Voltas", cat: "AC", price: 33990, par: 8 },
  { id: "WP265", name: "Whirlpool 265L frost-free", brand: "Whirlpool", cat: "Fridge", price: 28490, par: 6 },
  { id: "SM-WM7", name: "Samsung 7 kg front-load", brand: "Samsung", cat: "Washer", price: 31990, par: 5 },
  { id: "HP15", name: "HP 15s Ryzen 5 laptop", brand: "HP", cat: "Laptops", price: 42990, par: 5 },
];

type StockMap = Record<string, number[]>;
const seedStock: StockMap = {
  RJ1: [22, 11, 25, 7, 14, 9, 16, 12, 9, 10],
  RJ2: [18, 3, 21, 9, 10, 8, 12, 7, 6, 8],
  RJ3: [15, 8, 4, 5, 18, 7, 10, 8, 6, 5],
  JMN: [12, 6, 16, 3, 9, 1, 2, 6, 5, 4],
  JND: [10, 4, 12, 1, 7, 5, 8, 6, 4, 5],
  BVN: [13, 2, 14, 5, 8, 6, 9, 7, 2, 6],
  MRB: [9, 5, 11, 3, 6, 14, 15, 5, 4, 3],
  GDL: [8, 4, 9, 6, 5, 4, 6, 4, 3, 4],
  PBR: [7, 3, 10, 2, 5, 4, 5, 1, 3, 2],
  AMR: [6, 3, 9, 2, 4, 3, 4, 3, 3, 3],
  SNR: [8, 4, 10, 3, 5, 4, 5, 4, 3, 4],
};

const parOf = (storeId: string, skuIdx: number) => Math.round(SKUS[skuIdx].par * storeById(storeId).size);
type Level = "low" | "ok" | "surplus";
function levelOf(storeId: string, skuIdx: number, qty: number): Level {
  const par = parOf(storeId, skuIdx);
  if (qty < par * 0.4) return "low";
  if (qty > par * 1.6) return "surplus";
  return "ok";
}
function alertsFor(stock: StockMap, storeId: string) {
  return stock[storeId].map((q, i) => ({ sku: i, q, level: levelOf(storeId, i, q) })).filter((a) => a.level !== "ok");
}
/** For a short SKU at a store, the store holding the biggest surplus of it. */
function donorFor(stock: StockMap, storeId: string, skuIdx: number) {
  let best: { id: string; spare: number } | null = null;
  for (const s of STORES) {
    if (s.id === storeId) continue;
    const spare = stock[s.id][skuIdx] - parOf(s.id, skuIdx);
    if (spare > 1 && (!best || spare > best.spare)) best = { id: s.id, spare };
  }
  return best;
}

type TransferStatus = "Requested" | "Packed" | "In transit" | "Received";
type Transfer = { id: string; from: string; to: string; sku: number; qty: number; status: TransferStatus; eta: string; by: string; vehicle: string };
const seedTransfers: Transfer[] = [
  { id: "TR-2041", from: "RJ1", to: "PBR", sku: 7, qty: 3, status: "In transit", eta: "Today 5:30 PM", by: "Rizwan G.", vehicle: "Tempo GJ03 AX 4471" },
  { id: "TR-2040", from: "GDL", to: "JND", sku: 3, qty: 2, status: "Packed", eta: "Today 4 PM", by: "Vipul S.", vehicle: "Store Eeco GJ03 KP 1180" },
  { id: "TR-2039", from: "RJ1", to: "RJ2", sku: 1, qty: 2, status: "Requested", eta: "Today 2 PM", by: "Foram G.", vehicle: "Runner on Activa" },
  { id: "TR-2038", from: "RJ1", to: "RJ3", sku: 2, qty: 6, status: "In transit", eta: "Today 1:30 PM", by: "Sagar K.", vehicle: "Runner on Activa" },
  { id: "TR-2037", from: "SNR", to: "BVN", sku: 8, qty: 1, status: "Received", eta: "Yesterday", by: "Dhaval T.", vehicle: "VRL parcel" },
  { id: "TR-2036", from: "MRB", to: "SNR", sku: 6, qty: 2, status: "Received", eta: "Yesterday", by: "Chirag M.", vehicle: "Tempo GJ36 T 2290" },
  { id: "TR-2035", from: "RJ2", to: "AMR", sku: 4, qty: 2, status: "Received", eta: "Sat", by: "Jagdish B.", vehicle: "Shree Maruti Courier" },
];
const NEXT: Record<TransferStatus, TransferStatus | null> = { Requested: "Packed", Packed: "In transit", "In transit": "Received", Received: null };
const transferTone: Record<TransferStatus, Tone> = { Requested: "neutral", Packed: "warn", "In transit": "info", Received: "ok" };

/* ---------------- Shared state ---------------- */

type RetailState = {
  stock: StockMap;
  transfers: Transfer[];
  addTransfer: (from: string, to: string, sku: number, qty: number) => void;
  advance: (id: string) => void;
};
const RetailCtx = React.createContext<RetailState | null>(null);
function useRetail() {
  return React.useContext(RetailCtx)!;
}

type Bill = { id: number; store: string; amount: number; item: string; time: string };
type LiveState = { sales: Record<string, number>; foot: Record<string, number>; bills: Record<string, number>; feed: Bill[] };
const seedLive: LiveState = {
  sales: Object.fromEntries(STORES.map((s) => [s.id, s.sales])),
  foot: Object.fromEntries(STORES.map((s) => [s.id, s.foot])),
  bills: Object.fromEntries(STORES.map((s) => [s.id, s.bills])),
  feed: [
    { id: 3, store: "RJ1", amount: 72990, item: "Bravia 55\" 4K X75L", time: "1:12 PM" },
    { id: 2, store: "JMN", amount: 30999, item: "Galaxy A35 5G 8/128", time: "1:09 PM" },
    { id: 1, store: "BVN", amount: 28490, item: "Whirlpool 265L frost-free", time: "1:05 PM" },
  ],
};
const LiveCtx = React.createContext<LiveState>(seedLive);

function LiveProvider({ children }: { children: React.ReactNode }) {
  const [live, setLive] = React.useState(seedLive);
  React.useEffect(() => {
    const weights = STORES.map((s) => s.size);
    const total = weights.reduce((a, w) => a + w, 0);
    const id = window.setInterval(() => {
      let r = Math.random() * total;
      const store = STORES.find((_, i) => (r -= weights[i]) <= 0) ?? STORES[0];
      const sku = SKUS[Math.floor(Math.random() * SKUS.length)];
      const time = new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }).toUpperCase();
      setLive((cur) => ({
        sales: { ...cur.sales, [store.id]: cur.sales[store.id] + sku.price },
        foot: Object.fromEntries(STORES.map((s) => [s.id, cur.foot[s.id] + (Math.random() < 0.35 * s.size ? 1 : 0) + (s.id === store.id ? 2 : 0)])),
        bills: { ...cur.bills, [store.id]: cur.bills[store.id] + 1 },
        feed: [{ id: (cur.feed[0]?.id ?? 0) + 1, store: store.id, amount: sku.price, item: sku.name, time }, ...cur.feed].slice(0, 12),
      }));
    }, 2600);
    return () => window.clearInterval(id);
  }, []);
  return <LiveCtx.Provider value={live}>{children}</LiveCtx.Provider>;
}

/* ---------------- Sales ---------------- */

type Invoice = { no: string; customer: string; store: string; item: string; brand: string; cat: string; amount: number; pay: "UPI" | "Card" | "Cash" | "Bajaj EMI" | "HDFC EMI" | "Exchange + UPI"; staff: string; time: string };
const invoicesSeed: Invoice[] = [
  { no: "SE/RJ1/24581", customer: "Rameshbhai Patel", store: "RJ1", item: "Bravia 55\" 4K X75L + wall mount", brand: "Sony", cat: "TV", amount: 75480, pay: "Bajaj EMI", staff: "Ketan", time: "1:12 PM" },
  { no: "SE/JMN/09912", customer: "Imran Memon", store: "JMN", item: "Galaxy A35 5G 8/128", brand: "Samsung", cat: "Mobiles", amount: 30999, pay: "UPI", staff: "Mitesh", time: "1:09 PM" },
  { no: "SE/BVN/11204", customer: "Hetalben Desai", store: "BVN", item: "Whirlpool 265L frost-free", brand: "Whirlpool", cat: "Fridge", amount: 28490, pay: "Exchange + UPI", staff: "Riddhi", time: "1:05 PM" },
  { no: "SE/RJ2/18820", customer: "Kiran Sojitra", store: "RJ2", item: "iPhone 15 128 GB", brand: "Apple", cat: "Mobiles", amount: 69900, pay: "HDFC EMI", staff: "Darshan", time: "12:58 PM" },
  { no: "SE/RJ3/07741", customer: "Dharmesh Vora", store: "RJ3", item: "LG 1.5T 5★ AC + installation", brand: "LG", cat: "AC", amount: 48990, pay: "Card", staff: "Nikunj", time: "12:51 PM" },
  { no: "SE/JND/05530", customer: "Neha Kansagara", store: "JND", item: "Samsung 7 kg front-load", brand: "Samsung", cat: "Washer", amount: 31990, pay: "Bajaj EMI", staff: "Bhumi", time: "12:40 PM" },
  { no: "SE/MRB/03318", customer: "Bhavesh Rathod", store: "MRB", item: "Voltas 1.5T 3★ AC ×2 (tile showroom)", brand: "Voltas", cat: "AC", amount: 67980, pay: "Card", staff: "Hardik", time: "12:32 PM" },
  { no: "SE/RJ1/24577", customer: "Jignesh Kalariya", store: "RJ1", item: "HP 15s Ryzen 5 + bag", brand: "HP", cat: "Laptops", amount: 43989, pay: "UPI", staff: "Ketan", time: "12:21 PM" },
  { no: "SE/GDL/02219", customer: "Parul Makwana", store: "GDL", item: "Vivo Y58 5G 8/128", brand: "Vivo", cat: "Mobiles", amount: 19499, pay: "Cash", staff: "Vipul", time: "12:14 PM" },
  { no: "SE/AMR/01876", customer: "Sanjay Bhalodiya", store: "AMR", item: "Redmi 43\" 4K Fire TV", brand: "Xiaomi", cat: "TV", amount: 22999, pay: "Bajaj EMI", staff: "Jagdish", time: "12:02 PM" },
  { no: "SE/PBR/01650", customer: "Minaxi Trivedi", store: "PBR", item: "Galaxy A35 5G 8/128", brand: "Samsung", cat: "Mobiles", amount: 30999, pay: "UPI", staff: "Rizwan", time: "11:48 AM" },
  { no: "SE/SNR/02040", customer: "Arvind Jadeja", store: "SNR", item: "Whirlpool 265L frost-free", brand: "Whirlpool", cat: "Fridge", amount: 28490, pay: "Cash", staff: "Chirag", time: "11:36 AM" },
  { no: "SE/RJ2/18812", customer: "Yusuf Kadiwala", store: "RJ2", item: "Sony Bravia 55\" + soundbar", brand: "Sony", cat: "TV", amount: 94980, pay: "HDFC EMI", staff: "Darshan", time: "11:22 AM" },
  { no: "SE/JMN/09905", customer: "Komal Faldu", store: "JMN", item: "LG 1.5T 5★ inverter AC", brand: "LG", cat: "AC", amount: 46490, pay: "Card", staff: "Mitesh", time: "11:10 AM" },
];
const hours = ["10", "11", "12", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const salesToday = [4.2, 7.8, 11.6, 13.9];
const salesLastTue = [3.6, 6.4, 9.8, 12.1, 9.2, 8.1, 9.4, 11.8, 14.6, 16.2, 13.1, 6.4];

/* ---------------- EMI ---------------- */

type EmiStatus = "Pending" | "Approved" | "DO issued" | "Disbursed" | "Rejected";
type Financier = "Bajaj Finserv" | "HDFC Bank" | "ICICI Cardless" | "TVS Credit" | "Home Credit";
type EmiApp = { id: string; customer: string; store: string; product: string; amount: number; financier: Financier; tenure: string; status: EmiStatus; cibil: number; reason?: string; at: string; dp: number };
const emiSeed: EmiApp[] = [
  { id: "EMI-7731", customer: "Rameshbhai Patel", store: "RJ1", product: "Sony Bravia 55\"", amount: 75480, financier: "Bajaj Finserv", tenure: "10/0", status: "Disbursed", cibil: 781, at: "1:12 PM", dp: 0 },
  { id: "EMI-7730", customer: "Kiran Sojitra", store: "RJ2", product: "iPhone 15 128 GB", amount: 69900, financier: "HDFC Bank", tenure: "9/0", status: "DO issued", cibil: 742, at: "12:58 PM", dp: 0 },
  { id: "EMI-7729", customer: "Bharat Chauhan", store: "JMN", product: "LG 1.5T 5★ AC", amount: 46490, financier: "Bajaj Finserv", tenure: "12/2", status: "Rejected", cibil: 668, reason: "Bureau: 2 EMIs bounced in last 6 months", at: "12:47 PM", dp: 9298 },
  { id: "EMI-7728", customer: "Neha Kansagara", store: "JND", product: "Samsung 7 kg washer", amount: 31990, financier: "Bajaj Finserv", tenure: "6/0", status: "Approved", cibil: 760, at: "12:40 PM", dp: 0 },
  { id: "EMI-7727", customer: "Mahesh Dabhi", store: "BVN", product: "Galaxy A35 5G", amount: 30999, financier: "TVS Credit", tenure: "8/1", status: "Pending", cibil: 701, at: "12:36 PM", dp: 3875 },
  { id: "EMI-7726", customer: "Shabana Shaikh", store: "PBR", product: "Whirlpool 265L", amount: 28490, financier: "Home Credit", tenure: "12/2", status: "Rejected", cibil: 0, reason: "New to credit, address proof mismatch", at: "12:29 PM", dp: 4748 },
  { id: "EMI-7725", customer: "Sanjay Bhalodiya", store: "AMR", product: "Redmi 43\" TV", amount: 22999, financier: "Bajaj Finserv", tenure: "6/0", status: "Disbursed", cibil: 735, at: "12:02 PM", dp: 0 },
  { id: "EMI-7724", customer: "Yusuf Kadiwala", store: "RJ2", product: "Bravia 55\" + soundbar", amount: 94980, financier: "HDFC Bank", tenure: "12/0", status: "Disbursed", cibil: 802, at: "11:22 AM", dp: 0 },
  { id: "EMI-7723", customer: "Ravi Gohel", store: "RJ3", product: "HP 15s laptop", amount: 42990, financier: "ICICI Cardless", tenure: "6/0", status: "Pending", cibil: 724, at: "11:18 AM", dp: 0 },
  { id: "EMI-7722", customer: "Jayaben Parmar", store: "GDL", product: "Voltas 1.5T AC", amount: 33990, financier: "Bajaj Finserv", tenure: "9/0", status: "Rejected", cibil: 689, reason: "Limit used on Bajaj card", at: "11:04 AM", dp: 0 },
  { id: "EMI-7721", customer: "Hiren Lakhani", store: "MRB", product: "Sony Bravia 55\"", amount: 72990, financier: "HDFC Bank", tenure: "12/0", status: "Approved", cibil: 768, at: "10:52 AM", dp: 0 },
  { id: "EMI-7720", customer: "Asha Pandya", store: "SNR", product: "Vivo Y58 5G", amount: 19499, financier: "TVS Credit", tenure: "6/1", status: "Disbursed", cibil: 712, at: "10:41 AM", dp: 3250 },
  { id: "EMI-7719", customer: "Kaushik Rank", store: "RJ1", product: "Samsung 7 kg washer", amount: 31990, financier: "Bajaj Finserv", tenure: "6/0", status: "DO issued", cibil: 754, at: "10:33 AM", dp: 0 },
  { id: "EMI-7718", customer: "Farhan Ghanchi", store: "JMN", product: "iPhone 15 128 GB", amount: 69900, financier: "ICICI Cardless", tenure: "9/0", status: "Pending", cibil: 731, at: "10:20 AM", dp: 0 },
];
const emiTone: Record<EmiStatus, Tone> = { Pending: "warn", Approved: "info", "DO issued": "accent", Disbursed: "ok", Rejected: "late" };

/* ---------------- Service ---------------- */

type TicketCol = "logged" | "asc" | "part" | "ready" | "delivered";
type Ticket = { id: string; customer: string; product: string; brand: string; issue: string; store: string; col: TicketCol; age: number; sla: number; asc: string; warranty: "In warranty" | "Extended" | "Paid" };
const ticketsSeed: Ticket[] = [
  { id: "SRV-8812", customer: "Dinesh Mer", product: "LG 1.5T AC (2024)", brand: "LG", issue: "Not cooling, gas leak suspected", store: "JMN", col: "logged", age: 0, sla: 2, asc: "LG Care, Jamnagar", warranty: "In warranty" },
  { id: "SRV-8810", customer: "Pooja Rajani", product: "Galaxy S23", brand: "Samsung", issue: "Screen flicker after update", store: "RJ2", col: "asc", age: 2, sla: 3, asc: "Samsung Plaza ASC, Rajkot", warranty: "In warranty" },
  { id: "SRV-8807", customer: "Mansukh Dhameliya", product: "Whirlpool 340L fridge", brand: "Whirlpool", issue: "Compressor noise", store: "AMR", col: "part", age: 6, sla: 5, asc: "Whirlpool ASC, Amreli", warranty: "Extended" },
  { id: "SRV-8805", customer: "Rekha Solanki", product: "Sony Bravia 50\"", brand: "Sony", issue: "Panel lines, needs replacement", store: "RJ1", col: "part", age: 9, sla: 7, asc: "Sony Service, Rajkot", warranty: "In warranty" },
  { id: "SRV-8803", customer: "Ajay Chudasama", product: "Samsung 8 kg washer", brand: "Samsung", issue: "Drum bearing, water leak", store: "BVN", col: "asc", age: 3, sla: 3, asc: "Samsung ASC, Bhavnagar", warranty: "In warranty" },
  { id: "SRV-8801", customer: "Nisha Joshi", product: "iPhone 14", brand: "Apple", issue: "Battery health 79%", store: "RJ2", col: "ready", age: 4, sla: 5, asc: "Apple AASP, Ahmedabad", warranty: "Paid" },
  { id: "SRV-8798", customer: "Gopal Karmur", product: "Voltas 1.5T AC", brand: "Voltas", issue: "PCB fault after voltage spike", store: "PBR", col: "part", age: 11, sla: 7, asc: "Voltas ASC, Porbandar", warranty: "In warranty" },
  { id: "SRV-8795", customer: "Heena Thaker", product: "HP 15s laptop", brand: "HP", issue: "Hinge broken", store: "RJ3", col: "ready", age: 5, sla: 7, asc: "HP Service, Rajkot", warranty: "Paid" },
  { id: "SRV-8792", customer: "Prakash Vala", product: "Redmi 43\" TV", brand: "Xiaomi", issue: "No sound on HDMI", store: "GDL", col: "logged", age: 1, sla: 3, asc: "Mi Service, Rajkot", warranty: "In warranty" },
  { id: "SRV-8789", customer: "Snehal Mehta", product: "LG 260L fridge", brand: "LG", issue: "Door gasket", store: "RJ1", col: "delivered", age: 3, sla: 5, asc: "LG Care, Rajkot", warranty: "In warranty" },
  { id: "SRV-8786", customer: "Kanji Odedra", product: "Vivo V29", brand: "Vivo", issue: "Charging port", store: "PBR", col: "delivered", age: 2, sla: 3, asc: "Vivo Care, Porbandar", warranty: "In warranty" },
  { id: "SRV-8784", customer: "Bhumika Dave", product: "Samsung 1.5T AC", brand: "Samsung", issue: "Installation re-do, water drip indoors", store: "SNR", col: "asc", age: 1, sla: 2, asc: "Store technician", warranty: "In warranty" },
];
const ticketCols: { id: TicketCol; label: string; tone: Tone; hint: string }[] = [
  { id: "logged", label: "Logged", tone: "neutral", hint: "At the counter or on WhatsApp" },
  { id: "asc", label: "At brand ASC", tone: "info", hint: "Job sheet raised with brand" },
  { id: "part", label: "Part awaited", tone: "late", hint: "Chased daily by Service Desk" },
  { id: "ready", label: "Ready for pickup", tone: "accent", hint: "Customer told on WhatsApp" },
  { id: "delivered", label: "Delivered", tone: "ok", hint: "Feedback asked" },
];

/* ---------------- Brands & schemes ---------------- */

const brandTargets = [
  { brand: "Samsung", target: 14500000, done: 10920000, slab: "1.5% extra above 100%", color: "#1428a0" },
  { brand: "LG", target: 9800000, done: 6130000, slab: "₹1,200 per AC above 180 units", color: "#a50034" },
  { brand: "Sony", target: 7200000, done: 5980000, slab: "2% on full target", color: "#111111" },
  { brand: "Apple", target: 8400000, done: 7060000, slab: "No slab, demo units", color: "#555555" },
  { brand: "Vivo", target: 4200000, done: 2310000, slab: "₹400 per unit above 300", color: "#415fff" },
  { brand: "Voltas", target: 5600000, done: 4870000, slab: "1% at 90%, 2% at 100%", color: "#0067b1" },
  { brand: "Whirlpool", target: 3900000, done: 2040000, slab: "₹700 per unit above 120", color: "#e8a317" },
  { brand: "Xiaomi", target: 2800000, done: 2450000, slab: "1.2% on target", color: "#ff6900" },
];
type ClaimStatus = "Accruing" | "Claim filed" | "Credit note received" | "Disputed";
type Scheme = { id: string; brand: string; name: string; kind: "Sell-out" | "Cashback" | "Price protection" | "Slab" | "Consumer offer"; period: string; units: number; earned: number; status: ClaimStatus };
const schemesSeed: Scheme[] = [
  { id: "SCH-301", brand: "Samsung", name: "Festive sell-out, Galaxy A series", kind: "Sell-out", period: "1 Oct – 15 Nov", units: 412, earned: 247200, status: "Accruing" },
  { id: "SCH-302", brand: "LG", name: "AC slab bonanza, 5★ inverter", kind: "Slab", period: "1 Oct – 31 Oct", units: 131, earned: 0, status: "Accruing" },
  { id: "SCH-298", brand: "Sony", name: "Bravia 55\" price protection ₹4,000", kind: "Price protection", period: "From 14 Oct", units: 38, earned: 152000, status: "Claim filed" },
  { id: "SCH-297", brand: "Samsung", name: "HDFC card cashback ₹3,000 (brand-funded)", kind: "Cashback", period: "Navratri", units: 96, earned: 288000, status: "Credit note received" },
  { id: "SCH-295", brand: "Vivo", name: "Y-series sell-out ₹400/unit", kind: "Sell-out", period: "September", units: 286, earned: 114400, status: "Disputed" },
  { id: "SCH-294", brand: "Voltas", name: "Free installation + 5 yr compressor", kind: "Consumer offer", period: "Oct", units: 118, earned: 59000, status: "Claim filed" },
  { id: "SCH-293", brand: "Whirlpool", name: "Exchange bonus ₹2,000", kind: "Consumer offer", period: "Oct", units: 64, earned: 128000, status: "Accruing" },
  { id: "SCH-291", brand: "Xiaomi", name: "Redmi TV price drop ₹1,500", kind: "Price protection", period: "From 2 Oct", units: 22, earned: 33000, status: "Credit note received" },
  { id: "SCH-289", brand: "Apple", name: "iPhone 15 bank offer (HDFC ₹5,000)", kind: "Cashback", period: "Festive", units: 74, earned: 370000, status: "Claim filed" },
  { id: "SCH-288", brand: "HP", name: "Back-to-college laptop sell-out", kind: "Sell-out", period: "Jul – Sep", units: 58, earned: 81200, status: "Disputed" },
];
const claimTone: Record<ClaimStatus, Tone> = { Accruing: "neutral", "Claim filed": "warn", "Credit note received": "ok", Disputed: "late" };

/* ---------------- Online ---------------- */

type OrderCol = "new" | "confirmed" | "packed" | "out" | "done";
type Order = { id: string; channel: "Flipkart" | "Amazon" | "WhatsApp" | "Website"; customer: string; city: string; item: string; amount: number; pay: "Prepaid" | "COD" | "Pay at store" | "UPI link"; col: OrderCol; store: string; slaH: number };
const ordersSeed: Order[] = [
  { id: "WA-5521", channel: "WhatsApp", customer: "Trupti Kalaria", city: "Rajkot", item: "Galaxy A35 5G, blue", amount: 30999, pay: "UPI link", col: "new", store: "RJ2", slaH: 2 },
  { id: "FK-88214", channel: "Flipkart", customer: "Order #OD3301", city: "Jamnagar", item: "Redmi 43\" 4K Fire TV", amount: 22499, pay: "Prepaid", col: "new", store: "JMN", slaH: 6 },
  { id: "AZ-40-7716", channel: "Amazon", customer: "Order 405-77", city: "Junagadh", item: "HP 15s Ryzen 5", amount: 41990, pay: "COD", col: "new", store: "JND", slaH: 5 },
  { id: "WA-5519", channel: "WhatsApp", customer: "Ketan Hirpara", city: "Gondal", item: "Voltas 1.5T AC + install", amount: 35490, pay: "Pay at store", col: "confirmed", store: "GDL", slaH: 20 },
  { id: "WB-1093", channel: "Website", customer: "Mitali Sanghvi", city: "Rajkot", item: "Sony Bravia 55\" X75L", amount: 71990, pay: "Prepaid", col: "confirmed", store: "RJ1", slaH: 24 },
  { id: "FK-88207", channel: "Flipkart", customer: "Order #OD3287", city: "Bhavnagar", item: "Vivo Y58 5G", amount: 18999, pay: "Prepaid", col: "packed", store: "BVN", slaH: 3 },
  { id: "WA-5514", channel: "WhatsApp", customer: "Salim Bloch", city: "Porbandar", item: "Whirlpool 265L", amount: 28490, pay: "UPI link", col: "packed", store: "PBR", slaH: 8 },
  { id: "AZ-40-7702", channel: "Amazon", customer: "Order 405-70", city: "Morbi", item: "Samsung 7 kg front-load", amount: 30990, pay: "Prepaid", col: "out", store: "MRB", slaH: 4 },
  { id: "WA-5510", channel: "WhatsApp", customer: "Daksha Vekariya", city: "Amreli", item: "LG 1.5T 5★ AC", amount: 46490, pay: "Pay at store", col: "out", store: "AMR", slaH: 2 },
  { id: "FK-88190", channel: "Flipkart", customer: "Order #OD3240", city: "Rajkot", item: "Galaxy A35 5G", amount: 30499, pay: "Prepaid", col: "done", store: "RJ3", slaH: 0 },
  { id: "WB-1088", channel: "Website", customer: "Pratik Bhimani", city: "Surendranagar", item: "Redmi 43\" TV", amount: 22999, pay: "COD", col: "done", store: "SNR", slaH: 0 },
];
const orderCols: { id: OrderCol; label: string; tone: Tone }[] = [
  { id: "new", label: "New", tone: "warn" },
  { id: "confirmed", label: "Confirmed", tone: "info" },
  { id: "packed", label: "Packed", tone: "accent" },
  { id: "out", label: "Out / pickup", tone: "info" },
  { id: "done", label: "Delivered", tone: "ok" },
];
const channelColor: Record<Order["channel"], string> = { Flipkart: "#2874f0", Amazon: "#ff9900", WhatsApp: "#1fa855", Website: "#0e7a7a" };

/* ---------------- Shared modules data ---------------- */

const team: TeamMember[] = [
  { name: "Paresh Thakkar", role: "Owner", status: "Busy", load: 92, focus: "Samsung Diwali target call at 11, approving EMI overrides", tasks: [{ title: "Samsung festive target review", due: "11:00" }, { title: "Sign LG AC slab commitment", due: "3:00" }, { title: "Bank: Diwali OD limit", due: "5:00" }], week: [1, 1, 1, 1, 1, 1], since: "1998" },
  { name: "Bhavika Thakkar", role: "Finance, EMI desk & GST", status: "Busy", load: 84, focus: "3 Bajaj rejections to re-route; HDFC DO reconciliation", tasks: [{ title: "Re-route Bharat Chauhan to HDFC", due: "now" }, { title: "Subvention payout check, Sept", due: "2:00", done: true }, { title: "GSTR-1 draft for Oct", due: "Fri" }], week: [1, 1, 1, 1, 1, 0], since: "2009" },
  { name: "Nirav Dholakia", role: "Area manager, Rajkot 3 stores", status: "On floor", load: 78, focus: "Kalawad Road demo wall for Dhanteras", tasks: [{ title: "Bravia demo wall set-up", due: "4:00" }, { title: "Festive promoter roster", due: "6:00" }], week: [1, 1, 1, 1, 1, 1], since: "2012" },
  { name: "Kishan Vaghela", role: "Store manager, Jamnagar", status: "On floor", load: 81, focus: "Out of LG 5★ ACs, 6 enquiries waiting", tasks: [{ title: "Confirm Morbi AC transfer", due: "12:30" }, { title: "Call back 6 AC enquiries", due: "5:00" }], week: [1, 1, 1, 0, 1, 1], since: "2016" },
  { name: "Rizwan Ghanchi", role: "Warehouse & transfers, Aji GIDC", status: "In field", load: 70, focus: "Two tempos out: Porbandar and Junagadh", tasks: [{ title: "Load Porbandar fridges", due: "done", done: true }, { title: "LG inward GRN, 60 ACs", due: "3:30" }], week: [1, 1, 1, 1, 1, 1], since: "2014" },
  { name: "Mehul Parmar", role: "Service head", status: "Busy", load: 74, focus: "3 tickets past SLA, Sony panel escalation", tasks: [{ title: "Escalate SRV-8805 to Sony RSM", due: "12:00" }, { title: "Voltas PCB part chase", due: "2:00" }], week: [1, 1, 1, 1, 1, 1], since: "2015" },
  { name: "Pooja Joshi", role: "Online & WhatsApp orders", status: "On floor", load: 66, focus: "41 WhatsApp enquiries since morning, 9 hot", tasks: [{ title: "Send quotes to 9 hot leads", due: "1:00" }, { title: "Flipkart SLA breach check", due: "4:00" }], week: [1, 1, 1, 1, 0, 1], since: "2021" },
  { name: "Jayesh Bhatt", role: "Accounts, Tally & brand claims", status: "Off", load: 35, focus: "Half day; Vivo claim dispute papers ready", tasks: [{ title: "Vivo Sept claim re-file", due: "tomorrow" }], week: [1, 1, 1, 1, 1, 0], since: "2011" },
];

const agents: WorkforceAgent[] = [
  { name: "Stock Balancer", role: "Moves stock to where it will sell before Dhanteras", icon: ArrowLeftRight, status: "Needs you", runsToday: 9, hoursSaved: 5.5, accuracy: 92, last: "6 min ago", skills: ["Store stock", "Velocity", "Tempo routes"], schedule: "Every 2 hours, 10 AM – 8 PM", inbox: [{ title: "Move 6 LG ACs Morbi → Jamnagar?", detail: "Morbi sells 0.4 a day, Jamnagar has 6 open enquiries. Tempo leaves Aji GIDC at 2 PM anyway." }], log: ["Suggested 2 Bravia 55\" Gondal → Junagadh", "Flagged Porbandar out of Whirlpool 265L", "Balanced Vivo Y58 across Rajkot stores"] },
  { name: "EMI Router", role: "Re-routes rejected EMI files to the next financier", icon: CreditCard, status: "Needs you", runsToday: 14, hoursSaved: 4, accuracy: 88, last: "12 min ago", skills: ["Bajaj", "HDFC", "TVS", "Bureau bands"], schedule: "On every rejection", inbox: [{ title: "Bharat Chauhan rejected by Bajaj", detail: "CIBIL 668. HDFC consumer durable usually clears 650+ with 20% down payment. Re-route?" }], log: ["Re-routed Jayaben Parmar to TVS Credit", "Matched 11 DOs against Bajaj portal", "Flagged ₹38k subvention short-paid by Home Credit"] },
  { name: "Claim Keeper", role: "Tracks every brand scheme till the credit note lands", icon: BadgePercent, status: "Running", runsToday: 5, hoursSaved: 6, accuracy: 94, last: "40 min ago", skills: ["Schemes", "Sell-out", "Tally CN"], schedule: "Daily 7 PM", log: ["Filed Sony price protection for 38 units", "Matched Samsung CN ₹2.88 L in Tally", "Vivo Sept claim disputed: 22 IMEIs missing"] },
  { name: "Service Desk", role: "Chases brand ASCs and updates customers", icon: Wrench, status: "Running", runsToday: 21, hoursSaved: 5, accuracy: 90, last: "just now", skills: ["Job sheets", "WhatsApp", "SLA"], schedule: "Every hour", log: ["Told Nisha Joshi her iPhone is ready", "Chased Voltas for PCB, ETA Thursday", "3 tickets past SLA flagged to Mehul"] },
  { name: "WhatsApp Seller", role: "Answers price and stock questions on WhatsApp", icon: MessageCircle, status: "Running", runsToday: 41, hoursSaved: 7, accuracy: 86, last: "1 min ago", skills: ["Catalogue", "Live stock", "UPI links"], schedule: "Always on, hands off to Pooja", log: ["Sent Galaxy A35 offer to 12 enquiries", "Booked 2 AC demos at Gondal", "Handed 9 hot leads to Pooja"] },
  { name: "Day Closer", role: "Closes each store's day: cash, bills, footfall", icon: Receipt, status: "Idle", runsToday: 1, hoursSaved: 3, accuracy: 97, last: "yesterday 9:40 PM", skills: ["Tally", "Cash", "Footfall counters"], schedule: "Daily 9:30 PM", log: ["Yesterday: ₹61.2 L across 11 stores", "Cash short ₹1,200 at Amreli, explained", "Sent owner the 1-page close"] },
];

const independence: IndependenceData = {
  score: 41,
  history: [28, 30, 33, 34, 37, 39, 41],
  quote: "Every store manager calls me before moving even two fridges. In Diwali week that is fifty calls a day.",
  pillars: [
    { name: "Sales & stores", score: 52, note: "Rajkot stores run on their own; small towns wait for Paresh on every discount above ₹1,000.", fixes: [{ title: "Discount bands per store", gain: 3 }, { title: "Daily target board", gain: 2 }] },
    { name: "Stock & transfers", score: 33, note: "Every inter-store move needs an owner call. Morbi sat on 14 ACs for 3 weeks.", fixes: [{ title: "Stock Balancer auto-moves under ₹1 L", gain: 4 }, { title: "Weekly par levels", gain: 2 }] },
    { name: "Finance & EMI", score: 44, note: "Bhavika handles all overrides; rejected files are lost if she is out.", fixes: [{ title: "EMI Router on all rejections", gain: 3 }] },
    { name: "Brands & schemes", score: 29, note: "Scheme claims live in Jayesh's diary. ₹4.1 L unclaimed last year.", fixes: [{ title: "Claim Keeper with Tally CN match", gain: 4 }, { title: "Monthly brand review", gain: 1 }] },
    { name: "Service", score: 47, note: "Mehul knows every ASC by name; customers call the owner when they don't hear back.", fixes: [{ title: "WhatsApp status at every stage", gain: 3 }] },
    { name: "Team & roles", score: 40, note: "Store managers sell, they don't manage. No one owns promoters.", fixes: [{ title: "Area manager for small towns", gain: 3 }, { title: "Promoter attendance on app", gain: 1 }] },
    { name: "Owner time", score: 39, note: "Paresh spends 16 hours a week on calls that are really rules.", fixes: [{ title: "Two decision windows a day", gain: 2 }] },
  ],
  ownerHours: [
    { label: "Transfers", hours: 8 },
    { label: "Discounts", hours: 7 },
    { label: "Brand calls", hours: 9 },
    { label: "EMI overrides", hours: 5 },
    { label: "Service escalations", hours: 4 },
    { label: "Banks", hours: 3 },
    { label: "Strategy", hours: 1 },
  ],
};

const integrations: Integration[] = [
  { name: "Tally Prime", category: "Accounts", status: "Connected", detail: "11 store companies, GST invoices and brand credit notes.", synced: "4 min ago", records: "1.8 L vouchers", mark: "T", color: "#1c4f9c" },
  { name: "Store POS (Gofrugal)", category: "Billing", status: "Syncing", detail: "Live bills and stock from every counter.", synced: "live", records: "430 bills today", mark: "POS", color: "#0e7a7a" },
  { name: "WhatsApp Business", category: "Messaging", status: "Connected", detail: "One number per store, enquiries, service updates, UPI links.", synced: "just now", records: "6,920 chats", mark: "W", color: "#1fa855" },
  { name: "Bajaj Finserv DPP", category: "Finance", status: "Connected", detail: "EMI applications, DOs and subvention statements.", synced: "8 min ago", records: "312 files this month", mark: "B", color: "#005baa" },
  { name: "HDFC Consumer Loans", category: "Finance", status: "Connected", detail: "Approvals and disbursal status.", synced: "15 min ago", records: "141 files", mark: "H", color: "#004c8f" },
  { name: "Flipkart Seller Hub", category: "Marketplace", status: "Connected", detail: "Orders fulfilled from nearest store.", synced: "2 min ago", records: "88 orders this week", mark: "F", color: "#2874f0" },
  { name: "Amazon Seller Central", category: "Marketplace", status: "Error", detail: "SP-API token expired; orders still visible in email.", synced: "yesterday", records: "—", mark: "A", color: "#ff9900" },
  { name: "Footfall counters", category: "Stores", status: "Connected", detail: "Door sensors at 9 of 11 stores.", synced: "live", records: "2,489 visitors today", mark: "FC", color: "#7c3aed" },
  { name: "Samsung partner portal", category: "Brands", status: "Connected", detail: "Sell-out IMEIs and scheme statements.", synced: "1 h ago", records: "412 IMEIs", mark: "S", color: "#1428a0" },
  { name: "Razorpay", category: "Payments", status: "Available", detail: "Payment links for WhatsApp orders.", synced: "—", records: "—", mark: "R", color: "#2563eb" },
];

/* ============================================================
   Config
   ============================================================ */

const config: DeskConfig = {
  slug: "electronics-retail",
  company: "Saurashtra Electronics",
  brand: "Saurashtra",
  city: "Rajkot",
  state: "GJ",
  icon: Tv,
  tagline: "11 stores across Saurashtra · 9 brands · 146 people",
  owner: { name: "Paresh Thakkar", first: "Paresh", initials: "PT", role: "Owner" },
  theme: {
    variant: "inbox",
    paper: "#f1f4f8",
    panel: "#ffffff",
    sunk: "#e5ebf2",
    ink: "#13213f",
    mute: "#5a6785",
    line: "#d8e0ea",
    accent: "#0e7a7a",
    accentInk: "#ffffff",
    soft: "#dcefee",
    ok: "#2f8a4f",
    warn: "#c27b16",
    late: "#c03f3a",
    info: "#3c4fa8",
    heading: "display",
    radius: 16,
  },
  brief:
    "Seventeen days to Dhanteras. Jamnagar is out of 5★ ACs while Morbi sits on 14, and three EMI files bounced at Bajaj this morning that HDFC would likely clear. Sales are running 14% ahead of last Tuesday.",
  pulse: [
    { label: "Sales today", value: "₹50.2 L", delta: "+14%", trend: [31, 36, 40, 38, 44, 47, 50], module: "sales" },
    { label: "Footfall", value: "2,489", delta: "+9%", trend: [1800, 1950, 2100, 2040, 2260, 2380, 2489], tone: "info", module: "sales" },
    { label: "EMI approval", value: "71%", delta: "-6%", good: false, trend: [79, 78, 77, 75, 74, 72, 71], tone: "warn", module: "emi" },
    { label: "Stock alerts", value: "9", delta: "+3", good: false, trend: [4, 5, 5, 6, 7, 8, 9], tone: "late", module: "stock" },
    { label: "Service past SLA", value: "3", delta: "-1", good: true, trend: [6, 5, 5, 4, 4, 4, 3], tone: "ok", module: "service" },
  ],
  decisions: [
    { id: "d1", kind: "Approve", title: "Move 6 LG 5★ ACs from Morbi to Jamnagar", context: "Morbi holds 14 against a par of 5 and sells 0.4 a day. Jamnagar has 1 left and 6 open enquiries this week.", recommendation: "Approve. Rizwan's 2 PM tempo already passes Dhrol; no extra freight.", impact: "≈ ₹2.8 L sales unlocked", from: "Stock Balancer", module: "stock", approveLabel: "Approve transfer" },
    { id: "d2", kind: "Money", title: "Re-route Bharat Chauhan's AC loan to HDFC", context: "Bajaj rejected (CIBIL 668, two bounces). Customer is at the Jamnagar counter right now.", recommendation: "Send to HDFC with 20% down payment (₹9,298). Their consumer durable band clears 650+.", impact: "₹46,490 sale saved", from: "EMI Router", module: "emi", approveLabel: "Re-route to HDFC" },
    { id: "d3", kind: "Approve", title: "Sign up for LG's AC slab: 180 units by 31 Oct", context: "We are at 131 units. Slab pays ₹1,200 per AC on everything above 180, plus 0.5% on the full month.", recommendation: "Commit. Dhanteras week alone did 64 ACs last year.", impact: "≈ ₹1.9 L payout if hit", from: "Claim Keeper", module: "brands" },
    { id: "d4", kind: "Risk", title: "Sony panel replacement is 9 days old", context: "Rekha Solanki's Bravia 50\" (SRV-8805) is 2 days past SLA. She has posted a Google review draft in our WhatsApp.", recommendation: "Offer a loaner 43\" from Kalawad Road and escalate to Sony RSM today.", from: "Service Desk", module: "service", approveLabel: "Send loaner" },
    { id: "d5", kind: "People", title: "Hire 6 festive promoters for 18 days", context: "Rajkot stores ran 1:9 staff-to-visitor on Sunday. Samsung pays half for 2 of them.", recommendation: "Approve ₹14,500 each for 18 days, Samsung co-funds 2.", impact: "₹63,800 net cost", from: "Nirav Dholakia", module: "team" },
    { id: "d6", kind: "Money", title: "Pass Sony's ₹4,000 price drop to 38 units in stock", context: "Price protection claim is filed. Competitors on Kalawad Road dropped yesterday.", recommendation: "Drop shelf price today; credit note covers it.", impact: "Margin neutral", from: "Claim Keeper", module: "brands", approveLabel: "Drop price" },
    { id: "d7", kind: "Reply", title: "Reply to Amreli dealer asking for 20 Redmi TVs on credit", context: "Patel Electronics, Bagasara. Last credit cleared in 42 days on 30-day terms.", recommendation: "Offer 10 units on 15-day terms with a post-dated cheque.", from: "Pooja Joshi", module: "online" },
    { id: "d8", kind: "People", title: "Kishan wants Thursday off for a family wedding", context: "Jamnagar has no deputy. Thursday is the AC transfer arrival.", recommendation: "Approve; Mitesh covers, Nirav visits at noon.", from: "Kishan Vaghela", module: "team" },
  ],
  agenda: [
    { at: 10, title: "Store huddles", detail: "11 stores, targets on WhatsApp", tone: "ok", module: "sales" },
    { at: 11, title: "Samsung festive target call", detail: "₹1.45 Cr, we're at 75%", tone: "accent", module: "brands" },
    { at: 12.5, title: "EMI override window", detail: "3 rejections to re-route", count: 3, tone: "warn", module: "emi" },
    { at: 14, title: "Transfer tempo leaves Aji GIDC", detail: "Jamnagar, Dhrol, Morbi", count: 4, tone: "info", module: "stock" },
    { at: 16, title: "Service escalations", detail: "3 tickets past SLA", count: 3, tone: "late", module: "service" },
    { at: 21.5, title: "Day close", detail: "Cash, bills and footfall by store", tone: "neutral", module: "sales" },
  ],
  activity: [
    { time: "1:12 PM", text: "Kalawad Road billed a Bravia 55\" on Bajaj EMI, ₹75,480", tone: "ok" },
    { time: "12:47 PM", text: "Bajaj rejected Bharat Chauhan (Jamnagar), EMI Router suggests HDFC", tone: "late" },
    { time: "12:30 PM", text: "Stock Balancer: Jamnagar down to 1 LG 5★ AC", tone: "warn" },
    { time: "12:05 PM", text: "Samsung credit note ₹2.88 L matched in Tally", tone: "ok" },
    { time: "11:40 AM", text: "Flipkart order FK-88207 packed at Bhavnagar", tone: "info" },
    { time: "10:02 AM", text: "All 11 stores opened; 9 footfall counters online", tone: "neutral" },
  ],
  asks: [
    { q: "Which stores are behind target today?", a: "Five stores are under 55% of today's target at 1 PM:\n\n• Amreli: ₹1.6 L of ₹3.6 L (46%)\n• Porbandar: ₹1.9 L of ₹4.0 L (47%)\n• Morbi: ₹2.9 L of ₹5.6 L (52%)\n• Surendranagar: ₹2.1 L of ₹4.0 L (54%)\n• Gondal: ₹2.3 L of ₹4.2 L (55%)\n\nMorbi's problem is mix: 14 ACs in stock but the town buys TVs and phones in October. Moving 6 ACs to Jamnagar fixes both stores.", sources: ["POS live bills", "Store targets"] },
    { q: "Where should I move stock before Dhanteras?", a: "Four moves cover 7 of the 9 stock alerts:\n\n1. 6 LG 5★ ACs Morbi → Jamnagar (Jamnagar has 1, 6 enquiries)\n2. 5 Voltas ACs Morbi → Jamnagar (same tempo)\n3. 2 Bravia 55\" Gondal → Junagadh (already packed)\n4. 3 iPhone 15 Kalawad Road → Bhavnagar\n\nAll four fit on today's 2 PM tempo and the Bhavnagar parcel. Drag a store onto another on the Store grid to raise any of them.", sources: ["Store stock", "Velocity, last 14 days", "Tempo plan"] },
    { q: "Why is our EMI approval rate falling?", a: "71% today against 79% a week ago. Three reasons:\n\n• Bajaj is tightening on CIBIL 650–700: 3 of today's 4 rejections were in that band.\n• Two Home Credit files failed on address proof (new-to-credit customers in Porbandar and Amreli).\n• Counter staff are sending everything to Bajaj first.\n\nRouting 650–700 files to HDFC with 20% down would have saved 2 of today's 4.", sources: ["Bajaj DPP", "HDFC portal", "EMI desk log"] },
    { q: "How much brand money is still unclaimed?", a: "₹12.4 L earned this festive season across 10 schemes:\n\n• Credit notes received: ₹3.2 L (Samsung cashback, Redmi price drop)\n• Claims filed, waiting: ₹5.8 L (Sony price protection, iPhone bank offer, Voltas install)\n• Disputed: ₹1.96 L (Vivo September, HP back-to-college)\n• Still accruing: ₹3.75 L\n\nVivo is disputing 22 IMEIs that were sold in September but activated in October. Jayesh has the bills ready.", sources: ["Scheme tracker", "Tally credit notes"] },
    { q: "Which service tickets will hurt us?", a: "Three are past SLA:\n\n• SRV-8798 Voltas AC, Porbandar: PCB awaited 11 days (SLA 7)\n• SRV-8805 Sony Bravia, Kalawad Road: panel awaited 9 days (SLA 7). Customer is drafting a review.\n• SRV-8807 Whirlpool fridge, Amreli: compressor 6 days (SLA 5)\n\nSuggest a loaner TV for SRV-8805 today. Voltas has promised the PCB on Thursday.", sources: ["Service board", "ASC job sheets"] },
    { q: "Draft a WhatsApp offer for Galaxy A35 enquiries", a: "Draft (not sent):\n\n“Namaste! Galaxy A35 5G (8/128) is ₹30,999 at Saurashtra Electronics. This week: ₹3,000 instant off on HDFC cards, or 9 months no-cost EMI on Bajaj. Exchange your old phone at any of our 11 stores. Reply STORE for your nearest one. 🙏”\n\n41 people asked about the A35 in the last 7 days; 12 haven't bought yet.", sources: ["WhatsApp enquiries", "Samsung scheme SCH-301"] },
  ],
  run: {
    label: "Runs every 2 hours during store hours. You can also run it now.",
    title: "Festive Stock Balancer",
    steps: [
      { text: "Read live stock from 11 store POS counters", result: "110 SKU-store lines, 9 alerts" },
      { text: "Compare against 14-day sell-through and open enquiries", result: "4 stores short, 3 holding surplus" },
      { text: "Match shortages to surplus on the cheapest route", result: "4 moves, all on the 2 PM tempo" },
      { text: "Check EMI and scheme impact of each move", result: "LG slab +11 units if Jamnagar sells" },
      { text: "Draft transfer notes and store-manager messages", result: "4 transfer notes, 6 WhatsApps" },
    ],
    outcome: "Moving 11 ACs from Morbi to Jamnagar and 2 Bravias from Gondal to Junagadh clears 7 of 9 alerts before Dhanteras, with no extra freight.",
    actions: ["Approve Morbi → Jamnagar ACs", "Dispatch Gondal → Junagadh Bravias", "Send iPhones to Bhavnagar", "Message store managers"],
  },
  signature: {
    title: "Store grid",
    sub: "All 11 stores live: sales, footfall and stock alerts. Drag one store onto another to move stock.",
    module: "stock",
    render: () => <StoreGrid />,
  },
  homeExtras: () => <HomeExtras />,
};

/* ============================================================
   Desk
   ============================================================ */

const modules: DeskModule[] = [
  { id: "sales", group: "Sell", label: "Sales", title: "Sales", blurb: "Every bill across 11 stores, by store, brand and category, live from the POS", icon: IndianRupee, notes: ["Today's line runs against last Tuesday; the gap is the festive lift.", "Switch the breakdown between store, brand and category.", "Click a bill for its GST break-up and finance details."], render: () => <SalesModule /> },
  { id: "online", group: "Sell", label: "Online orders", count: 3, title: "Online orders", blurb: "Flipkart, Amazon, the website and WhatsApp, fulfilled from the nearest store", icon: Globe, render: () => <OnlineModule /> },
  { id: "stock", group: "Stock & money", label: "Stock & transfers", count: 9, title: "Stock & transfers", blurb: "What each store holds against its par, and every unit moving between them", icon: Boxes, notes: ["Red cells are under 40% of par, blue cells are holding more than 160%.", "Click a red cell to see who can spare it.", "Advance a transfer and the stock lands at the other store."], render: () => <StockModule /> },
  { id: "emi", group: "Stock & money", label: "EMI & finance", count: 3, title: "EMI & finance", blurb: "Bajaj, HDFC, ICICI and TVS files: approvals, rejections, DOs and subvention", icon: CreditCard, render: () => <EmiModule /> },
  { id: "service", group: "After-sales & brands", label: "Service tickets", count: 3, title: "Service tickets", blurb: "Every repair from counter to brand ASC and back to the customer", icon: Wrench, render: () => <ServiceModule /> },
  { id: "brands", group: "After-sales & brands", label: "Brands & schemes", title: "Brands & schemes", blurb: "Sell-out targets, slabs, price drops and every claim until the credit note lands", icon: Tag, render: () => <BrandsModule /> },
  { id: "team", group: "Business", label: "People", title: "People", blurb: "Store managers, finance, service and warehouse: who is carrying what today", icon: Users, render: () => <PeopleModule members={team} /> },
  { id: "agents", group: "Business", label: "Agents", title: "Agents", blurb: "Six AI agents balancing stock, routing EMI files and chasing claims", icon: Timer, render: () => <AgentsModule agents={agents} /> },
  { id: "independence", group: "Business", label: "Independence", title: "Owner independence", blurb: "How much of Saurashtra Electronics runs without Paresh on the phone", icon: GaugeIcon, render: () => <IndependenceModule data={independence} /> },
  { id: "connections", group: "Business", label: "Connections", title: "Connections", blurb: "POS, Tally, financiers, marketplaces and brand portals", icon: Send, render: () => <ConnectionsModule items={integrations} /> },
];

export default function ElectronicsRetailDesk() {
  const [stock, setStock] = React.useState(seedStock);
  const [transfers, setTransfers] = React.useState(seedTransfers);

  const addTransfer = React.useCallback((from: string, to: string, sku: number, qty: number) => {
    setStock((cur) => ({ ...cur, [from]: cur[from].map((q, i) => (i === sku ? Math.max(0, q - qty) : q)) }));
    setTransfers((cur) => [{ id: `TR-${2042 + cur.length - seedTransfers.length}`, from, to, sku, qty, status: "In transit", eta: "Today, 2 PM tempo", by: "Paresh T.", vehicle: "Tempo GJ03 AX 4471" }, ...cur]);
  }, []);

  const advance = React.useCallback(
    (id: string) => {
      const t = transfers.find((x) => x.id === id);
      if (!t) return;
      const next = NEXT[t.status];
      if (!next) return;
      if (next === "Received") setStock((cur) => ({ ...cur, [t.to]: cur[t.to].map((q, i) => (i === t.sku ? q + t.qty : q)) }));
      setTransfers((cur) => cur.map((x) => (x.id === id ? { ...x, status: next, eta: next === "Received" ? "Just now" : x.eta } : x)));
    },
    [transfers],
  );

  const value = React.useMemo(() => ({ stock, transfers, addTransfer, advance }), [stock, transfers, addTransfer, advance]);

  return (
    <RetailCtx.Provider value={value}>
      <LiveProvider>
        <DeskShell config={config} modules={modules} />
      </LiveProvider>
    </RetailCtx.Provider>
  );
}

/* ---------------- Signature: Store grid ---------------- */

const COAST =
  "M70,300 C62,232 104,178 158,128 C214,84 290,52 372,34 L520,22 C604,22 690,40 772,64 C852,88 914,136 940,196 C958,252 936,300 906,330 C882,370 902,420 868,462 C806,506 724,526 640,528 C540,534 438,536 340,520 C240,504 158,462 110,414 C82,384 72,348 70,300 Z";

function arc(a: StoreRow, b: StoreRow) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2 - Math.max(30, Math.hypot(a.x - b.x, a.y - b.y) * 0.22);
  return `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`;
}

function StoreGrid() {
  const desk = useDesk();
  const { stock, transfers, addTransfer } = useRetail();
  const live = React.useContext(LiveCtx);
  const [selected, setSelected] = React.useState("JMN");
  const [drag, setDrag] = React.useState<string | null>(null);
  const [over, setOver] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState<{ from: string; to: string; sku?: number; n: number } | null>(null);
  const [sheet, setSheet] = React.useState<string | null>(null);
  const seq = React.useRef(0);

  const totalSales = STORES.reduce((a, s) => a + live.sales[s.id], 0);
  const totalFoot = STORES.reduce((a, s) => a + live.foot[s.id], 0);
  const totalBills = STORES.reduce((a, s) => a + live.bills[s.id], 0);
  const moving = transfers.filter((t) => t.status === "Packed" || t.status === "In transit");
  const lastBill = live.feed[0];
  const sel = storeById(selected);
  const selAlerts = alertsFor(stock, selected);

  function open(from: string, to: string, sku?: number) {
    seq.current += 1;
    setPending({ from, to, sku, n: seq.current });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { l: "Sales so far", v: inr(totalSales, { compact: true }), i: IndianRupee },
          { l: "Bills", v: totalBills.toLocaleString("en-IN"), i: Receipt },
          { l: "Footfall", v: totalFoot.toLocaleString("en-IN"), i: Footprints },
          { l: "Conversion", v: `${((totalBills / totalFoot) * 100).toFixed(1)}%`, i: GaugeIcon },
        ].map((k) => (
          <div key={k.l} className="rounded-[12px] bg-d-sunk/70 px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-[11.5px] text-d-mute">
              <k.i className="h-3.5 w-3.5" /> {k.l}
            </p>
            <p className="desk-h tnum mt-0.5 text-[21px] font-semibold leading-tight">{k.v}</p>
          </div>
        ))}
      </div>

      <div className="desk-scroll -mx-1 overflow-x-auto px-1">
        <div className="relative min-w-[680px] overflow-hidden rounded-[14px] border border-d-line" style={{ aspectRatio: "1000 / 560", background: "linear-gradient(160deg, color-mix(in oklab, var(--d-info) 12%, var(--d-panel)), color-mix(in oklab, var(--d-accent) 10%, var(--d-panel)))" }}>
          <svg viewBox="0 0 1000 560" className="absolute inset-0 h-full w-full">
            <defs>
              <pattern id="er-dots" width="14" height="14" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="var(--d-accent)" opacity="0.18" />
              </pattern>
            </defs>
            <path d={COAST} fill="var(--d-panel)" stroke="color-mix(in oklab, var(--d-accent) 40%, transparent)" strokeWidth="2" />
            <path d={COAST} fill="url(#er-dots)" />
            <text x="40" y="40" className="fill-d-mute" fontSize="13" fontStyle="italic" opacity="0.7">Gulf of Kutch</text>
            <text x="30" y="530" className="fill-d-mute" fontSize="13" fontStyle="italic" opacity="0.7">Arabian Sea</text>
            <text x="880" y="520" className="fill-d-mute" fontSize="13" fontStyle="italic" opacity="0.7" textAnchor="middle">Gulf of Khambhat</text>
            {STORES.filter((s) => s.town !== "Rajkot").map((s) => (
              <line key={`road-${s.id}`} x1={455} y1={265} x2={s.x} y2={s.y} stroke="var(--d-line)" strokeWidth="2" strokeDasharray="2 5" />
            ))}
            {moving.map((t) => {
              const d = arc(storeById(t.from), storeById(t.to));
              return (
                <g key={`mv-${t.id}`}>
                  <path d={d} fill="none" stroke="var(--d-accent)" strokeWidth="2.5" className="desk-flow" opacity="0.85" />
                  <circle r="6" fill="var(--d-accent)" stroke="white" strokeWidth="2">
                    <animateMotion dur={t.status === "Packed" ? "6s" : "3.4s"} repeatCount="indefinite" path={d} />
                  </circle>
                </g>
              );
            })}
            {STORES.map((s) => {
              const low = alertsFor(stock, s.id).some((a) => a.level === "low");
              const rate = live.foot[s.id] / s.sqft;
              const dur = Math.max(1.4, 4.2 - rate * 60);
              return (
                <circle key={`pulse-${s.id}`} cx={s.x} cy={s.y} r="30" fill="none" stroke={low ? "var(--d-late)" : "var(--d-accent)"} strokeWidth="2">
                  <animate attributeName="r" values="30;66" dur={`${dur.toFixed(2)}s`} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0" dur={`${dur.toFixed(2)}s`} repeatCount="indefinite" />
                </circle>
              );
            })}
          </svg>

          {STORES.map((s) => {
            const alerts = alertsFor(stock, s.id);
            const low = alerts.filter((a) => a.level === "low").length;
            const spare = alerts.filter((a) => a.level === "surplus").length;
            const pct = live.sales[s.id] / s.target;
            const isSel = selected === s.id;
            const flash = lastBill && lastBill.store === s.id;
            return (
              <div
                key={s.id}
                role="button"
                tabIndex={0}
                draggable
                onClick={() => setSelected(s.id)}
                onKeyDown={(e) => e.key === "Enter" && setSelected(s.id)}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", s.id);
                  setDrag(s.id);
                }}
                onDragEnd={() => {
                  setDrag(null);
                  setOver(null);
                }}
                onDragOver={(e) => {
                  if (!drag || drag === s.id) return;
                  e.preventDefault();
                  setOver(s.id);
                }}
                onDragLeave={() => setOver((o) => (o === s.id ? null : o))}
                onDrop={(e) => {
                  e.preventDefault();
                  const from = drag ?? e.dataTransfer.getData("text/plain");
                  setOver(null);
                  setDrag(null);
                  if (from && from !== s.id) open(from, s.id);
                }}
                className="absolute w-[112px] -translate-x-1/2 -translate-y-1/2 cursor-grab select-none rounded-[12px] border bg-d-panel px-2.5 py-1.5 text-left shadow-[0_10px_24px_-14px_rgba(19,33,63,0.55)] transition-[transform,box-shadow] hover:z-10 hover:scale-[1.04] active:cursor-grabbing"
                style={{
                  left: `${s.x / 10}%`,
                  top: `${s.y / 5.6}%`,
                  borderColor: over === s.id ? "var(--d-accent)" : isSel ? "var(--d-ink)" : "var(--d-line)",
                  boxShadow: over === s.id ? "0 0 0 4px color-mix(in oklab, var(--d-accent) 30%, transparent)" : isSel ? "0 0 0 2px var(--d-ink)" : undefined,
                  opacity: drag === s.id ? 0.5 : 1,
                }}
              >
                {flash && (
                  <span key={lastBill.id} className="desk-rise pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-d-ok px-1.5 py-px font-mono text-[10px] font-semibold text-white">
                    +{inr(lastBill.amount, { compact: true })}
                  </span>
                )}
                <p className="flex items-center justify-between gap-1 text-[11.5px] font-semibold leading-tight">
                  <span className="truncate">{s.short}</span>
                  {low > 0 ? <AlertTriangle className="h-3 w-3 shrink-0 text-d-late" /> : spare > 0 ? <Package className="h-3 w-3 shrink-0 text-d-info" /> : <Dot tone="ok" />}
                </p>
                <p className="tnum font-mono text-[12.5px] font-semibold text-d-accent">{inr(live.sales[s.id], { compact: true })}</p>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-d-sunk">
                  <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${Math.min(100, pct * 100)}%`, background: pct >= 0.65 ? "var(--d-ok)" : pct >= 0.5 ? "var(--d-warn)" : "var(--d-late)" }} />
                </div>
                <p className="mt-0.5 flex justify-between font-mono text-[9.5px] text-d-mute">
                  <span>{live.foot[s.id]} in</span>
                  <span>{low ? `${low} low` : spare ? `${spare} spare` : "stock ok"}</span>
                </p>
              </div>
            );
          })}
          <div className="pointer-events-none absolute bottom-2 right-3 flex items-center gap-3 rounded-full bg-d-panel/90 px-3 py-1 text-[10.5px] text-d-mute">
            <span className="inline-flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-d-late" /> stock low</span>
            <span className="inline-flex items-center gap-1"><Package className="h-3 w-3 text-d-info" /> spare stock</span>
            <span className="inline-flex items-center gap-1"><span className="h-0.5 w-4 bg-d-accent" /> moving now · {moving.length}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 rounded-[14px] border border-d-line p-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11.5px] font-medium uppercase tracking-[0.1em] text-d-mute">
            <MapPin className="h-3.5 w-3.5" /> Selected store
          </p>
          <p className="desk-h mt-1 text-[18px] font-semibold">{sel.name}</p>
          <p className="text-[12.5px] text-d-mute">
            {sel.manager} · {sel.sqft.toLocaleString("en-IN")} sq ft · {live.bills[sel.id]} bills
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Meter value={live.sales[sel.id]} max={sel.target} tone={live.sales[sel.id] / sel.target >= 0.65 ? "ok" : "warn"} />
            <span className="shrink-0 font-mono text-[11.5px] text-d-mute">
              {Math.round((live.sales[sel.id] / sel.target) * 100)}% of {inr(sel.target, { compact: true })}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Btn size="sm" onClick={() => setSheet(sel.id)} icon={Store}>
              Store sheet
            </Btn>
            <Btn size="sm" variant="soft" icon={ArrowLeftRight} onClick={() => open(sel.id, sel.id === "RJ1" ? "RJ2" : "RJ1")}>
              Transfer from here
            </Btn>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-[11.5px] font-medium uppercase tracking-[0.1em] text-d-mute">Stock alerts · {selAlerts.length}</p>
          {selAlerts.length === 0 ? (
            <p className="mt-2 text-[13px] text-d-ok">Everything is within par.</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {selAlerts.map((a) => {
                const donor = a.level === "low" ? donorFor(stock, selected, a.sku) : null;
                return (
                  <li key={a.sku} className="flex items-center gap-2 rounded-[10px] bg-d-sunk/60 px-2.5 py-1.5 text-[12.5px]">
                    <Pill tone={a.level === "low" ? "late" : "info"}>{a.level === "low" ? "Low" : "Spare"}</Pill>
                    <span className="min-w-0 flex-1 truncate">
                      {SKUS[a.sku].name} <span className="font-mono text-d-mute">{a.q}/{parOf(selected, a.sku)}</span>
                    </span>
                    {donor ? (
                      <Btn size="sm" variant="soft" onClick={() => open(donor.id, selected, a.sku)}>
                        Pull from {storeById(donor.id).short}
                      </Btn>
                    ) : a.level === "surplus" ? (
                      <span className="text-[11.5px] text-d-mute">drag to a store</span>
                    ) : (
                      <span className="text-[11.5px] text-d-mute">order from brand</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {pending && (
        <TransferModal
          key={pending.n}
          from={pending.from}
          to={pending.to}
          sku={pending.sku}
          onClose={() => setPending(null)}
          onConfirm={(from, to, sku, qty) => {
            addTransfer(from, to, sku, qty);
            setPending(null);
            toast.success(`${qty} × ${SKUS[sku].name} on the way`, { description: `${storeById(from).short} → ${storeById(to).short}. Both managers told on WhatsApp.` });
            desk.log(`Transfer: ${qty} × ${SKUS[sku].name} ${storeById(from).short} → ${storeById(to).short}`, "info");
          }}
        />
      )}
      <StoreSheet id={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}

function TransferModal({ from: f0, to: t0, sku: s0, onClose, onConfirm }: { from: string; to: string; sku?: number; onClose: () => void; onConfirm: (from: string, to: string, sku: number, qty: number) => void }) {
  const { stock } = useRetail();
  const [from, setFrom] = React.useState(f0);
  const [to, setTo] = React.useState(t0);
  const best = React.useMemo(() => {
    if (s0 !== undefined) return s0;
    let pick = 0;
    let score = -Infinity;
    stock[f0].forEach((q, i) => {
      const s = q - parOf(f0, i) + (parOf(t0, i) - stock[t0][i]);
      if (s > score) {
        score = s;
        pick = i;
      }
    });
    return pick;
  }, [s0, stock, f0, t0]);
  const [sku, setSku] = React.useState(best);
  const spare = Math.max(0, stock[from][sku] - parOf(from, sku));
  const need = Math.max(0, parOf(to, sku) - stock[to][sku]);
  const [qty, setQty] = React.useState(String(Math.max(1, Math.min(stock[f0][best], Math.max(1, Math.min(Math.max(0, stock[f0][best] - parOf(f0, best)), Math.max(0, parOf(t0, best) - stock[t0][best]) || 2))))));
  const n = Math.min(Number(qty) || 0, stock[from][sku]);
  const value = n * SKUS[sku].price;

  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title="Move stock between stores" sub="Stock leaves the source store now and lands at the destination when the receiving manager scans it.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (from === to || n < 1) {
            toast.error(from === to ? "Pick two different stores" : "Nothing to move");
            return;
          }
          onConfirm(from, to, sku, n);
        }}
      >
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
          <Field label="From">
            <select className={inputClass} value={from} onChange={(e) => setFrom(e.target.value)}>
              {STORES.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>
          <ArrowLeftRight className="mb-3 h-4 w-4 text-d-mute" />
          <Field label="To">
            <select className={inputClass} value={to} onChange={(e) => setTo(e.target.value)}>
              {STORES.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Product">
          <select className={inputClass} value={sku} onChange={(e) => setSku(Number(e.target.value))}>
            {SKUS.map((s, i) => (
              <option key={s.id} value={i}>
                {s.brand} {s.name} · {stock[from][i]} at source
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantity">
            <input className={inputClass} inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))} />
          </Field>
          <div className="rounded-[10px] bg-d-sunk/70 px-3 py-2 text-[12.5px]">
            <p className="text-d-mute">Source spare {spare} · destination short {need}</p>
            <p className="mt-0.5 font-semibold">Stock value {inr(value, { compact: true })}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="solid" type="submit" icon={Truck}>
            Raise transfer
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

function StoreSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { stock } = useRetail();
  const live = React.useContext(LiveCtx);
  const desk = useDesk();
  const s = id ? storeById(id) : null;
  return (
    <Sheet
      open={!!s}
      onOpenChange={(o) => !o && onClose()}
      eyebrow={s ? `${s.id} · manager ${s.manager}` : ""}
      title={s?.name ?? ""}
      sub={s ? `${s.sqft.toLocaleString("en-IN")} sq ft · target today ${inr(s.target, { compact: true })}` : ""}
      footer={
        <>
          <Btn
            icon={MessageCircle}
            onClick={() => {
              toast.success("Message sent to store manager", { description: s?.manager });
              desk.log(`Owner pinged ${s?.manager} at ${s?.short}`);
            }}
          >
            WhatsApp manager
          </Btn>
          <Btn variant="solid" onClick={onClose}>
            Done
          </Btn>
        </>
      }
      width={520}
    >
      {s && (
        <div className="space-y-5">
          <KV
            items={[
              { k: "Sales so far", v: inr(live.sales[s.id], { compact: true }) },
              { k: "Bills", v: live.bills[s.id] },
              { k: "Footfall", v: live.foot[s.id] },
              { k: "Conversion", v: `${((live.bills[s.id] / live.foot[s.id]) * 100).toFixed(1)}%` },
            ]}
          />
          <Meter value={live.sales[s.id]} max={s.target} />
          <div>
            <p className="mb-2 text-[12px] font-medium text-d-mute">Stock against par</p>
            <ul className="space-y-1.5">
              {SKUS.map((k, i) => {
                const q = stock[s.id][i];
                const par = parOf(s.id, i);
                const lv = levelOf(s.id, i, q);
                return (
                  <li key={k.id} className="flex items-center gap-3 rounded-[10px] border border-d-line px-3 py-1.5 text-[12.5px]">
                    <span className="min-w-0 flex-1 truncate">
                      <b>{k.brand}</b> {k.name}
                    </span>
                    <span className="w-[86px]">
                      <Meter value={Math.min(q, par * 2)} max={par * 2} tone={lv === "low" ? "late" : lv === "surplus" ? "info" : "ok"} />
                    </span>
                    <span className="tnum w-12 text-right font-mono">
                      {q}/{par}
                    </span>
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

function HomeExtras() {
  const desk = useDesk();
  const live = React.useContext(LiveCtx);
  const { stock } = useRetail();
  const cats = ["Mobiles", "TV", "AC", "Fridge", "Washer", "Laptops"];
  const expected: Record<string, number> = { Mobiles: 520, TV: 160, AC: 240, Fridge: 70, Washer: 90, Laptops: 60 };
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel icon={Timer} title="Dhanteras readiness" sub="Stock on hand against last year's Dhanteras week" action={<Pill tone="accent" mono><Countdown compact inHours={17 * 24 - 13} /></Pill>}>
        <ul className="space-y-3">
          {cats.map((c) => {
            const have = SKUS.reduce((a, k, i) => (k.cat === c ? a + STORES.reduce((b, s) => b + stock[s.id][i], 0) : a), 0);
            const pct = have / expected[c];
            return (
              <li key={c}>
                <div className="mb-1 flex justify-between text-[12.5px]">
                  <span className="font-medium">{c}</span>
                  <span className="font-mono text-d-mute">
                    {have} / {expected[c]} units
                  </span>
                </div>
                <Meter value={have} max={expected[c]} tone={pct >= 0.9 ? "ok" : pct >= 0.6 ? "warn" : "late"} />
              </li>
            );
          })}
        </ul>
        <Btn size="sm" className="mt-4" icon={Boxes} onClick={() => desk.goTab("stock")}>
          Open stock
        </Btn>
      </Panel>
      <Panel live title="Bills as they happen" sub="Every counter, every store">
        <Feed items={live.feed.slice(0, 7).map((b) => ({ time: b.time, who: storeById(b.store).short, text: `${b.item} · ${inr(b.amount)}`, tone: b.amount > 40000 ? "accent" : "ok" }))} />
      </Panel>
    </div>
  );
}

/* ---------------- Sales ---------------- */

function SalesModule() {
  const desk = useDesk();
  const live = React.useContext(LiveCtx);
  const [by, setBy] = React.useState<"Store" | "Brand" | "Category">("Store");
  const [open, setOpen] = React.useState<Invoice | null>(null);
  const [sent, setSent] = React.useState<Set<string>>(new Set());
  const total = STORES.reduce((a, s) => a + live.sales[s.id], 0);
  const bills = STORES.reduce((a, s) => a + live.bills[s.id], 0);
  const brandSplit: Record<string, number> = { Samsung: 0.24, Apple: 0.16, Sony: 0.13, LG: 0.14, Vivo: 0.07, Voltas: 0.09, Whirlpool: 0.06, Xiaomi: 0.05, HP: 0.06 };
  const catSplit: Record<string, number> = { Mobiles: 0.41, TV: 0.2, AC: 0.17, Fridge: 0.08, Washer: 0.07, Laptops: 0.07 };
  const breakdown =
    by === "Store"
      ? STORES.map((s) => ({ label: s.short, value: live.sales[s.id], sub: `${Math.round((live.sales[s.id] / s.target) * 100)}%`, tone: (live.sales[s.id] / s.target >= 0.65 ? "accent" : live.sales[s.id] / s.target >= 0.5 ? "warn" : "late") as Tone }))
      : Object.entries(by === "Brand" ? brandSplit : catSplit).map(([label, f]) => ({ label, value: Math.round(total * f), tone: "accent" as Tone }));
  const nowL = total / 1e5;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Sales today" value={inr(total, { compact: true })} delta="+14%" hint="vs last Tuesday" icon={IndianRupee} trend={[...salesToday, nowL]} />
        <Stat label="Bills" value={bills} delta="+11%" hint={`avg ${inr(total / bills, { compact: true })}`} icon={Receipt} tone="info" trend={[120, 190, 260, 330, bills]} />
        <Stat label="Finance share" value="38%" delta="+4%" hint="of value on EMI" icon={CreditCard} tone="warn" trend={[31, 33, 34, 36, 38]} />
        <Stat label="Month to date" value="₹11.6 Cr" delta="+22%" hint="vs Oct 2025" icon={Store} tone="ok" trend={[2.1, 4.0, 5.9, 7.6, 9.8, 11.6]} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Sales by hour, ₹ lakh" sub="All 11 stores. Evening peak is 7–9 PM in festive weeks.">
          <AreaChart
            labels={hours.map((h) => `${h}:00`)}
            series={[
              { name: "Today", data: [...salesToday, Math.max(1, nowL - salesToday.reduce((a, b) => a + b, 0))], tone: "accent" },
              { name: "Last Tuesday", data: salesLastTue, tone: "neutral", dashed: true },
            ]}
            format={(v) => `₹${v.toFixed(1)}L`}
            height={210}
          />
        </Panel>
        <Panel title="Payment mix" sub="Share of today's value">
          <Donut
            center={inr(total, { compact: true })}
            sub="today"
            segments={[
              { label: "UPI", value: 29, tone: "accent" },
              { label: "Bajaj EMI", value: 22, tone: "info" },
              { label: "Card", value: 18, tone: "ok" },
              { label: "HDFC / ICICI EMI", value: 16, tone: "warn" },
              { label: "Cash", value: 11, tone: "neutral" },
              { label: "Exchange", value: 4, tone: "late" },
            ]}
          />
        </Panel>
      </div>
      <Panel title={`Today by ${by.toLowerCase()}`} sub={by === "Store" ? "Percent is of today's store target" : "Live share of today's billing"} action={<Segmented size="sm" options={["Store", "Brand", "Category"] as const} value={by} onChange={setBy} />}>
        <HBars data={[...breakdown].sort((a, b) => b.value - a.value)} format={(v) => inr(v, { compact: true })} onSelect={(l) => toast(l, { description: "Filtered bills below to this " + by.toLowerCase() })} />
      </Panel>
      <Panel title="Today's bills" sub="From the POS at each counter. Click for GST and finance details.">
        <DataTable
          rows={invoicesSeed}
          rowKey={(i) => i.no}
          search={(i) => `${i.no} ${i.customer} ${i.item} ${storeById(i.store).short}`}
          searchPlaceholder="Search bill, customer or product"
          filter={{ get: (i) => i.cat, options: ["Mobiles", "TV", "AC", "Fridge", "Washer", "Laptops"] }}
          onRow={setOpen}
          bulk={[{ label: "Send e-invoices on WhatsApp", run: (k) => { setSent((s) => new Set([...s, ...k])); toast.success(`${k.length} invoices sent`); desk.log(`${k.length} GST invoices sent on WhatsApp`); } }]}
          columns={[
            { key: "no", label: "Bill", render: (i) => <span className="font-mono text-[12px]">{i.no}</span> },
            { key: "time", label: "Time", render: (i) => <span className="font-mono text-[12px] text-d-mute">{i.time}</span> },
            { key: "cust", label: "Customer", render: (i) => <span className="font-medium">{i.customer}</span>, sort: (i) => i.customer },
            { key: "item", label: "Item", render: (i) => <span className="text-d-mute">{i.item}</span>, wide: true },
            { key: "store", label: "Store", render: (i) => storeById(i.store).short, sort: (i) => i.store },
            { key: "amt", label: "Amount", align: "right", render: (i) => <span className="tnum font-mono">{inr(i.amount)}</span>, sort: (i) => i.amount },
            { key: "pay", label: "Paid by", render: (i) => (sent.has(i.no) ? <Pill tone="ok">Invoice sent</Pill> : <Pill tone={i.pay.includes("EMI") ? "info" : "neutral"}>{i.pay}</Pill>) },
          ]}
        />
      </Panel>
      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={open ? `${open.no} · ${open.time}` : ""}
        title={open?.item ?? ""}
        sub={open ? `${open.customer} · ${storeById(open.store).name} · sold by ${open.staff}` : ""}
        footer={
          <>
            <Btn icon={Wrench} onClick={() => { toast.success("Extended warranty offer sent", { description: open?.customer }); desk.log(`Extended warranty offered to ${open?.customer}`); }}>
              Offer extended warranty
            </Btn>
            <Btn variant="solid" icon={Send} onClick={() => { if (open) { setSent((s) => new Set(s).add(open.no)); toast.success("GST invoice sent on WhatsApp"); desk.log(`Invoice ${open.no} sent to ${open.customer}`); } setOpen(null); }}>
              Send invoice
            </Btn>
          </>
        }
      >
        {open && (
          <div className="space-y-5">
            <KV
              items={[
                { k: "Taxable value", v: inr(open.amount / 1.18) },
                { k: "CGST 9%", v: inr((open.amount / 1.18) * 0.09) },
                { k: "SGST 9%", v: inr((open.amount / 1.18) * 0.09) },
                { k: "Invoice total", v: inr(open.amount) },
                { k: "Paid by", v: open.pay },
                { k: "Brand", v: open.brand },
              ]}
            />
            <div className="rounded-[12px] bg-d-sunk/70 p-3 text-[12.5px] leading-relaxed">
              <p className="font-semibold">Scheme applied</p>
              <p className="text-d-mute">
                {open.brand === "Samsung" ? "SCH-301 festive sell-out, ₹600 per unit to us" : open.brand === "Sony" ? "SCH-298 price protection eligible, ₹4,000" : open.pay.includes("EMI") ? "No-cost EMI, subvention 4.5% borne by brand" : "No brand scheme on this bill"}
              </p>
            </div>
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">After the sale</p>
              <ul className="space-y-1.5 text-[13px]">
                {["Demo and installation booked", "Warranty registered with brand", "Google review request at day 3", "Accessory follow-up at day 10"].map((d, i) => (
                  <li key={d} className="flex items-center gap-2 rounded-[10px] border border-d-line px-3 py-2">
                    <Dot tone={i < 2 ? "ok" : "neutral"} /> {d}
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

/* ---------------- Stock & transfers ---------------- */

function StockModule() {
  const desk = useDesk();
  const { stock, transfers, advance, addTransfer } = useRetail();
  const [pending, setPending] = React.useState<{ from: string; to: string; sku?: number; n: number } | null>(null);
  const [open, setOpen] = React.useState<Transfer | null>(null);
  const seq = React.useRef(0);
  const allAlerts = STORES.flatMap((s) => alertsFor(stock, s.id).map((a) => ({ ...a, store: s.id })));
  const value = STORES.reduce((a, s) => a + stock[s.id].reduce((b, q, i) => b + q * SKUS[i].price * 0.86, 0), 0);
  const moving = transfers.filter((t) => t.status !== "Received");
  const current = open ? transfers.find((t) => t.id === open.id) ?? null : null;

  function raise(from: string, to: string, sku?: number) {
    seq.current += 1;
    setPending({ from, to, sku, n: seq.current });
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Stock value (landed)" value={inr(value, { compact: true })} delta="+18%" hint="festive build-up" icon={Boxes} trend={[1.6, 1.8, 2.0, 2.2, 2.4, value / 1e7]} />
        <Stat label="Low-stock lines" value={allAlerts.filter((a) => a.level === "low").length} delta="+3" deltaGood={false} hint="under 40% of par" icon={AlertTriangle} tone="late" />
        <Stat label="Spare-stock lines" value={allAlerts.filter((a) => a.level === "surplus").length} hint="over 160% of par" icon={Package} tone="info" />
        <Stat label="Transfers open" value={moving.length} hint={`${transfers.filter((t) => t.status === "In transit").length} on the road`} icon={Truck} tone="ok" />
      </div>
      <Panel
        title="Stock against par, every store"
        sub="Units on hand. Red is under 40% of par, blue is over 160%. Click a red cell to pull from the best donor."
        action={<Btn size="sm" variant="solid" icon={Plus} onClick={() => raise("MRB", "JMN", 5)}>New transfer</Btn>}
      >
        <div className="desk-scroll -mx-5 overflow-x-auto px-5">
          <table className="w-full min-w-[860px] border-separate border-spacing-1 text-[12px]">
            <thead>
              <tr className="text-d-mute">
                <th className="text-left font-medium">Store</th>
                {SKUS.map((k) => (
                  <th key={k.id} className="px-1 text-center font-medium" title={k.name}>
                    <span className="block text-[11px] font-semibold text-d-ink">{k.brand}</span>
                    <span className="block font-mono text-[10px]">{k.id}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STORES.map((s) => (
                <tr key={s.id}>
                  <th className="whitespace-nowrap pr-2 text-left text-[12.5px] font-medium">{s.short}</th>
                  {stock[s.id].map((q, i) => {
                    const lv = levelOf(s.id, i, q);
                    return (
                      <td key={SKUS[i].id} className="p-0">
                        <button
                          type="button"
                          title={`${s.short} · ${SKUS[i].name}: ${q} (par ${parOf(s.id, i)})`}
                          onClick={() => {
                            if (lv === "low") {
                              const d = donorFor(stock, s.id, i);
                              if (d) raise(d.id, s.id, i);
                              else toast(`No store can spare ${SKUS[i].name}`, { description: "Raise a brand PO instead." });
                            } else toast(`${s.short} · ${SKUS[i].name}`, { description: `${q} on hand, par ${parOf(s.id, i)}` });
                          }}
                          className="tnum flex h-8 w-full min-w-[52px] items-center justify-center rounded-[6px] font-mono text-[12px] font-medium transition-transform hover:scale-105"
                          style={{
                            background: lv === "low" ? "color-mix(in oklab, var(--d-late) 18%, var(--d-panel))" : lv === "surplus" ? "color-mix(in oklab, var(--d-info) 18%, var(--d-panel))" : "var(--d-sunk)",
                            color: lv === "low" ? "var(--d-late)" : lv === "surplus" ? "var(--d-info)" : "var(--d-ink)",
                          }}
                        >
                          {q}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Transfers" sub="Advance a transfer as it moves. Received stock lands at the destination store.">
          <DataTable
            rows={transfers}
            rowKey={(t) => t.id}
            search={(t) => `${t.id} ${storeById(t.from).short} ${storeById(t.to).short} ${SKUS[t.sku].name}`}
            searchPlaceholder="Search transfer, store or product"
            filter={{ get: (t) => t.status, options: ["Requested", "Packed", "In transit", "Received"] }}
            onRow={setOpen}
            columns={[
              { key: "id", label: "Transfer", render: (t) => <span className="whitespace-nowrap font-mono text-[12px]">{t.id}</span> },
              { key: "route", label: "Route", render: (t) => <span className="font-medium">{storeById(t.from).short} → {storeById(t.to).short}</span> },
              { key: "item", label: "Item", render: (t) => <span className="text-d-mute">{t.qty} × {SKUS[t.sku].name}</span>, wide: true },
              { key: "eta", label: "ETA", render: (t) => <span className="font-mono text-[11.5px]">{t.eta}</span> },
              { key: "st", label: "Status", render: (t) => <Pill tone={transferTone[t.status]}>{t.status}</Pill> },
              {
                key: "act",
                label: "",
                align: "right",
                render: (t) =>
                  NEXT[t.status] ? (
                    <Btn
                      size="sm"
                      variant="soft"
                      onClick={(e) => {
                        e.stopPropagation();
                        advance(t.id);
                        toast.success(`${t.id}: ${NEXT[t.status]}`, { description: `${t.qty} × ${SKUS[t.sku].name}` });
                        desk.log(`${t.id} marked ${NEXT[t.status]}`, NEXT[t.status] === "Received" ? "ok" : "info");
                      }}
                    >
                      Mark {NEXT[t.status]?.toLowerCase()}
                    </Btn>
                  ) : (
                    <span className="text-[11.5px] text-d-mute">done</span>
                  ),
              },
            ]}
          />
        </Panel>
        <Panel title="Ageing stock" sub="Units older than 90 days, landed value">
          <HBars
            format={(v) => inr(v, { compact: true })}
            data={[
              { label: "Samsung 6.5 kg top-load", value: 412000, sub: "31 units", tone: "late" },
              { label: "LG 32\" HD TV (2024)", value: 286000, sub: "22 units", tone: "late" },
              { label: "Voltas window AC 1T", value: 243000, sub: "9 units", tone: "warn" },
              { label: "Oppo A78 (old colours)", value: 168000, sub: "12 units", tone: "warn" },
              { label: "Godrej 190L DC fridge", value: 121000, sub: "8 units", tone: "info" },
            ]}
          />
        </Panel>
      </div>
      {pending && (
        <TransferModal
          key={pending.n}
          from={pending.from}
          to={pending.to}
          sku={pending.sku}
          onClose={() => setPending(null)}
          onConfirm={(from, to, sku, qty) => {
            addTransfer(from, to, sku, qty);
            setPending(null);
            toast.success(`Transfer raised: ${qty} × ${SKUS[sku].name}`, { description: `${storeById(from).short} → ${storeById(to).short}` });
            desk.log(`Transfer raised ${storeById(from).short} → ${storeById(to).short}, ${qty} × ${SKUS[sku].name}`, "info");
          }}
        />
      )}
      <Sheet
        open={!!current}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={current?.id}
        title={current ? `${storeById(current.from).short} → ${storeById(current.to).short}` : ""}
        sub={current ? `${current.qty} × ${SKUS[current.sku].brand} ${SKUS[current.sku].name}` : ""}
        footer={
          current && NEXT[current.status] ? (
            <Btn variant="solid" onClick={() => { advance(current.id); toast.success(`${current.id}: ${NEXT[current.status]}`); desk.log(`${current.id} marked ${NEXT[current.status]}`); }}>
              Mark {NEXT[current.status]?.toLowerCase()}
            </Btn>
          ) : (
            <Btn variant="solid" onClick={() => setOpen(null)}>Done</Btn>
          )
        }
      >
        {current && (
          <div className="space-y-5">
            <KV
              items={[
                { k: "Status", v: <Pill tone={transferTone[current.status]}>{current.status}</Pill> },
                { k: "ETA", v: current.eta },
                { k: "Vehicle", v: current.vehicle },
                { k: "Raised by", v: current.by },
                { k: "Stock value", v: inr(current.qty * SKUS[current.sku].price * 0.86) },
                { k: "Delivery challan", v: `DC/${current.id.slice(3)}/26-27` },
              ]}
            />
            <ol className="space-y-2">
              {(["Requested", "Packed", "In transit", "Received"] as TransferStatus[]).map((st, i) => {
                const reached = ["Requested", "Packed", "In transit", "Received"].indexOf(current.status) >= i;
                return (
                  <li key={st} className="flex items-center gap-3 rounded-[10px] border border-d-line px-3 py-2 text-[13px]">
                    <span className={`h-3 w-3 rounded-full ${reached ? "bg-d-accent" : "border border-d-mute"}`} />
                    <span className="flex-1 font-medium">{st}</span>
                    <span className="text-[11.5px] text-d-mute">{reached ? "done" : "waiting"}</span>
                  </li>
                );
              })}
            </ol>
            <p className="text-[12.5px] text-d-mute">Stock-transfer note goes to Tally as a branch transfer; no GST within Gujarat for the same GSTIN.</p>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- EMI & finance ---------------- */

function EmiModule() {
  const desk = useDesk();
  const [apps, setApps] = React.useState(emiSeed);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const open = apps.find((a) => a.id === openId) ?? null;
  const decided = apps.filter((a) => a.status !== "Pending");
  const approved = decided.filter((a) => a.status !== "Rejected");
  const set = (id: string, patch: Partial<EmiApp>) => setApps((cur) => cur.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  const financiers: Financier[] = ["Bajaj Finserv", "HDFC Bank", "ICICI Cardless", "TVS Credit", "Home Credit"];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Files today" value={apps.length} delta="+5" hint="across 9 stores" icon={CreditCard} trend={[6, 8, 9, 11, 12, apps.length]} />
        <Stat label="Approval rate" value={`${Math.round((approved.length / Math.max(1, decided.length)) * 100)}%`} delta="-6%" hint="7-day avg 77%" icon={GaugeIcon} tone="warn" trend={[79, 78, 77, 75, 74, 72, 71]} />
        <Stat label="Financed today" value={inr(approved.reduce((a, x) => a + x.amount, 0), { compact: true })} hint="DO issued or disbursed" icon={IndianRupee} tone="ok" />
        <Stat label="Rejected, not re-routed" value={apps.filter((a) => a.status === "Rejected").length} hint="sales at risk" icon={AlertTriangle} tone="late" />
      </div>
      <Panel title="EMI applications" sub="Click a file to approve the DO, re-route a rejection or mark disbursal.">
        <DataTable
          rows={apps}
          rowKey={(a) => a.id}
          search={(a) => `${a.id} ${a.customer} ${a.product} ${a.financier}`}
          searchPlaceholder="Search customer, product or financier"
          filter={{ get: (a) => a.status, options: ["Pending", "Approved", "DO issued", "Disbursed", "Rejected"] }}
          onRow={(a) => setOpenId(a.id)}
          bulk={[{ label: "Chase financier", run: (k) => { toast.success(`Chased ${k.length} files`); desk.log(`EMI Router chased ${k.length} files with financiers`); } }]}
          columns={[
            { key: "id", label: "File", render: (a) => <span className="whitespace-nowrap font-mono text-[12px]">{a.id}</span> },
            { key: "cust", label: "Customer", render: (a) => <span className="font-medium">{a.customer}</span>, sort: (a) => a.customer },
            { key: "prod", label: "Product", render: (a) => <span className="text-d-mute">{a.product}</span>, wide: true },
            { key: "store", label: "Store", render: (a) => storeById(a.store).short },
            { key: "fin", label: "Financier", render: (a) => a.financier, sort: (a) => a.financier },
            { key: "ten", label: "Tenure", render: (a) => <span className="font-mono text-[12px]">{a.tenure}</span> },
            { key: "amt", label: "Amount", align: "right", render: (a) => <span className="tnum font-mono">{inr(a.amount)}</span>, sort: (a) => a.amount },
            { key: "st", label: "Status", render: (a) => <Pill tone={emiTone[a.status]}>{a.status}</Pill> },
          ]}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="By financier" sub="Share of files this month">
          <Donut center="312" sub="files" size={170} segments={[{ label: "Bajaj Finserv", value: 54, tone: "info" }, { label: "HDFC Bank", value: 22, tone: "accent" }, { label: "ICICI Cardless", value: 11, tone: "ok" }, { label: "TVS Credit", value: 8, tone: "warn" }, { label: "Home Credit", value: 5, tone: "late" }]} />
        </Panel>
        <Panel title="Why files get rejected" sub="Last 30 days, 61 rejections">
          <HBars data={[{ label: "CIBIL 650–700 band", value: 22, tone: "late" }, { label: "Existing EMI bounces", value: 14, tone: "late" }, { label: "Address / KYC mismatch", value: 11, tone: "warn" }, { label: "Card limit used", value: 8, tone: "warn" }, { label: "New to credit", value: 6, tone: "info" }]} />
        </Panel>
        <Panel title="Subvention & payouts" sub="What financiers owe us">
          <ul className="divide-y divide-d-line text-[13px]">
            {[
              { f: "Bajaj Finserv", d: "Sept payout, 168 files", a: 412000, t: "ok" as Tone, s: "Received" },
              { f: "HDFC Bank", d: "Sept payout, 71 files", a: 196000, t: "warn" as Tone, s: "Due 25 Oct" },
              { f: "Home Credit", d: "Short-paid on 9 files", a: 38000, t: "late" as Tone, s: "Disputed" },
              { f: "TVS Credit", d: "Oct to date", a: 54000, t: "neutral" as Tone, s: "Accruing" },
            ].map((x) => (
              <li key={x.f} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{x.f}</p>
                  <p className="text-[12px] text-d-mute">{x.d}</p>
                </div>
                <span className="tnum font-mono">{inr(x.a, { compact: true })}</span>
                <Pill tone={x.t}>{x.s}</Pill>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpenId(null)}
        eyebrow={open ? `${open.id} · ${open.at}` : ""}
        title={open?.customer ?? ""}
        sub={open ? `${open.product} · ${inr(open.amount)} · ${storeById(open.store).name}` : ""}
        footer={
          open && (
            <>
              {open.status === "Rejected" && (
                <select
                  className={`${inputClass} h-9 w-auto`}
                  defaultValue=""
                  onChange={(e) => {
                    const f = e.target.value as Financier;
                    if (!f) return;
                    set(open.id, { financier: f, status: "Pending", reason: undefined });
                    toast.success(`Re-routed to ${f}`, { description: `${open.customer} · ${inr(open.amount)}` });
                    desk.log(`EMI ${open.id} re-routed to ${f}`, "info");
                  }}
                >
                  <option value="">Re-route to…</option>
                  {financiers.filter((f) => f !== open.financier).map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              )}
              {open.status === "Pending" && (
                <>
                  <Btn variant="danger" onClick={() => { set(open.id, { status: "Rejected", reason: "Rejected by financier on call" }); desk.log(`EMI ${open.id} rejected`, "late"); toast.error("Marked rejected"); }}>
                    Mark rejected
                  </Btn>
                  <Btn variant="solid" onClick={() => { set(open.id, { status: "Approved" }); desk.log(`EMI ${open.id} approved by ${open.financier}`, "ok"); toast.success("Approved", { description: open.financier }); }}>
                    Mark approved
                  </Btn>
                </>
              )}
              {open.status === "Approved" && (
                <Btn variant="solid" onClick={() => { set(open.id, { status: "DO issued" }); desk.log(`DO issued for ${open.customer}`, "ok"); toast.success("Delivery order issued", { description: "Counter can hand over the product." }); }}>
                  Issue DO
                </Btn>
              )}
              {open.status === "DO issued" && (
                <Btn variant="solid" onClick={() => { set(open.id, { status: "Disbursed" }); desk.log(`${open.financier} disbursed ${inr(open.amount)} for ${open.id}`, "ok"); toast.success("Marked disbursed"); }}>
                  Mark disbursed
                </Btn>
              )}
              {open.status === "Disbursed" && <Btn variant="solid" onClick={() => setOpenId(null)}>Done</Btn>}
            </>
          )
        }
      >
        {open && (
          <div className="space-y-5">
            <KV
              items={[
                { k: "Financier", v: open.financier },
                { k: "Tenure (months / advance)", v: open.tenure },
                { k: "Down payment", v: open.dp ? inr(open.dp) : "Nil" },
                { k: "Monthly EMI", v: inr((open.amount - open.dp) / Number(open.tenure.split("/")[0])) },
                { k: "Bureau score", v: open.cibil ? open.cibil : "New to credit" },
                { k: "Status", v: <Pill tone={emiTone[open.status]}>{open.status}</Pill> },
              ]}
            />
            {open.reason && (
              <div className="rounded-[12px] border border-d-late/30 bg-d-late/5 p-3 text-[13px]">
                <p className="font-semibold text-d-late">Rejection reason</p>
                <p className="mt-0.5">{open.reason}</p>
                <p className="mt-2 text-d-mute">EMI Router: HDFC and TVS usually clear this band with 15–20% down payment.</p>
              </div>
            )}
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Documents</p>
              <ul className="space-y-1.5 text-[13px]">
                {["Aadhaar (OTP verified)", "PAN", "Cancelled cheque / e-NACH", "Customer photo at counter"].map((d, i) => (
                  <li key={d} className="flex items-center justify-between rounded-[10px] border border-d-line px-3 py-2">
                    {d}
                    <Pill tone={open.reason?.includes("address") && i === 0 ? "late" : "ok"}>{open.reason?.includes("address") && i === 0 ? "Mismatch" : "OK"}</Pill>
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

/* ---------------- Service ---------------- */

function ServiceModule() {
  const desk = useDesk();
  const [tickets, setTickets] = React.useState(ticketsSeed);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);
  const open = tickets.find((t) => t.id === openId) ?? null;
  const live = tickets.filter((t) => t.col !== "delivered");
  const late = live.filter((t) => t.age > t.sla);
  const colLabel = (c: TicketCol) => ticketCols.find((x) => x.id === c)!.label;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open tickets" value={live.length} delta="-2" deltaGood={false} hint="since Monday" icon={Wrench} trend={[14, 13, 13, 12, 11, live.length]} />
        <Stat label="Past SLA" value={late.length} hint={late.map((t) => t.id).join(", ") || "none"} icon={AlertTriangle} tone="late" />
        <Stat label="Average turnaround" value="4.6 days" delta="-0.8" deltaGood={false} hint="brand SLA 5" icon={Timer} tone="ok" trend={[6.1, 5.8, 5.5, 5.2, 4.9, 4.6]} />
        <Stat label="Service CSAT" value="4.3 / 5" delta="+0.2" hint="WhatsApp feedback, 86 replies" icon={MessageCircle} tone="info" />
      </div>
      <Panel title="Repair board" sub="Drag a ticket as it moves. The customer gets a WhatsApp update at each stage." action={<Btn size="sm" variant="solid" icon={Plus} onClick={() => setAdding(true)}>New ticket</Btn>}>
        <Board
          columns={ticketCols}
          items={tickets}
          itemKey={(t) => t.id}
          getColumn={(t) => t.col}
          minColumnWidth={210}
          onMove={(id, col) => {
            setTickets((cur) => cur.map((t) => (t.id === id ? { ...t, col: col as TicketCol } : t)));
            toast.success(`${id} → ${colLabel(col as TicketCol)}`, { description: "Customer updated on WhatsApp" });
            desk.log(`${id} moved to ${colLabel(col as TicketCol)}`, col === "delivered" ? "ok" : "info");
          }}
          renderCard={(t) => (
            <button type="button" onClick={() => setOpenId(t.id)} className="block w-full text-left">
              <p className="flex items-center justify-between gap-2 pr-4 font-mono text-[11px] text-d-mute">
                {t.id} <span>{storeById(t.store).short}</span>
              </p>
              <p className="mt-1 text-[13px] font-semibold leading-snug">{t.product}</p>
              <p className="mt-0.5 line-clamp-2 text-[12px] text-d-mute">{t.issue}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11.5px]">{t.customer}</span>
                {t.col !== "delivered" && <Pill tone={t.age > t.sla ? "late" : t.age >= t.sla - 1 ? "warn" : "neutral"} mono>{t.age}d / {t.sla}d</Pill>}
              </div>
            </button>
          )}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Open tickets by brand" sub="Where the waiting happens">
          <HBars data={Object.entries(live.reduce<Record<string, number>>((a, t) => ({ ...a, [t.brand]: (a[t.brand] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value, tone: "accent" as Tone }))} />
        </Panel>
        <Panel title="Turnaround by brand, days" sub="Last 60 days, counter to customer">
          <Bars height={180} data={[{ label: "Apple", value: 3.2, tone: "ok" }, { label: "Samsung", value: 4.1, tone: "ok" }, { label: "LG", value: 4.8, tone: "accent" }, { label: "Sony", value: 6.9, tone: "late" }, { label: "Voltas", value: 7.4, tone: "late" }, { label: "Whirlpool", value: 5.6, tone: "warn" }]} format={(v) => `${v}d`} />
        </Panel>
      </div>
      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpenId(null)}
        eyebrow={open ? `${open.id} · ${open.warranty}` : ""}
        title={open?.product ?? ""}
        sub={open ? `${open.customer} · ${storeById(open.store).name}` : ""}
        footer={
          open && (
            <>
              <Btn icon={MessageCircle} onClick={() => { toast.success("Status sent on WhatsApp", { description: open.customer }); desk.log(`Service update sent to ${open.customer}`); }}>
                Update customer
              </Btn>
              {open.col !== "delivered" && (
                <Btn
                  variant="solid"
                  onClick={() => {
                    const order: TicketCol[] = ["logged", "asc", "part", "ready", "delivered"];
                    const next = order[order.indexOf(open.col) + 1];
                    setTickets((cur) => cur.map((t) => (t.id === open.id ? { ...t, col: next } : t)));
                    toast.success(`${open.id} → ${colLabel(next)}`);
                    desk.log(`${open.id} moved to ${colLabel(next)}`, "info");
                  }}
                >
                  Move to {colLabel((["logged", "asc", "part", "ready", "delivered"] as TicketCol[])[(["logged", "asc", "part", "ready", "delivered"] as TicketCol[]).indexOf(open.col) + 1])}
                </Btn>
              )}
            </>
          )
        }
      >
        {open && (
          <div className="space-y-5">
            <KV items={[{ k: "Issue", v: open.issue }, { k: "Stage", v: colLabel(open.col) }, { k: "Service centre", v: open.asc }, { k: "Age / SLA", v: `${open.age} of ${open.sla} days` }, { k: "Warranty", v: open.warranty }, { k: "Brand", v: open.brand }]} />
            <Meter value={open.age} max={open.sla} tone={open.age > open.sla ? "late" : "accent"} />
            <Feed
              items={[
                { time: `Day ${open.age}`, text: open.col === "part" ? "Part on order, brand ETA 2 days" : "Status checked by Service Desk", tone: "info" },
                { time: "Day 1", text: `Job sheet raised at ${open.asc}`, tone: "accent" },
                { time: "Day 0", text: `Logged at ${storeById(open.store).short} counter, photos taken`, tone: "neutral" },
              ]}
            />
          </div>
        )}
      </Sheet>
      <NewTicket
        open={adding}
        onOpenChange={setAdding}
        onAdd={(t) => {
          setTickets((cur) => [t, ...cur]);
          toast.success(`${t.id} logged`, { description: `${t.product} · ${t.customer}` });
          desk.log(`Service ticket ${t.id} logged for ${t.customer}`, "info");
        }}
        nextId={`SRV-${8813 + tickets.length - ticketsSeed.length}`}
      />
    </div>
  );
}

function NewTicket({ open, onOpenChange, onAdd, nextId }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (t: Ticket) => void; nextId: string }) {
  const [customer, setCustomer] = React.useState("Hasmukh Gajera");
  const [product, setProduct] = React.useState("Samsung 253L fridge");
  const [issue, setIssue] = React.useState("Not cooling in the lower section");
  const [store, setStore] = React.useState("RJ3");
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Log a service ticket" sub="We raise the job sheet with the brand ASC and keep the customer posted on WhatsApp.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onAdd({ id: nextId, customer, product, brand: product.split(" ")[0], issue, store, col: "logged", age: 0, sla: 3, asc: `${product.split(" ")[0]} ASC, ${storeById(store).town}`, warranty: "In warranty" });
          onOpenChange(false);
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Customer">
            <input className={inputClass} value={customer} onChange={(e) => setCustomer(e.target.value)} />
          </Field>
          <Field label="Store">
            <select className={inputClass} value={store} onChange={(e) => setStore(e.target.value)}>
              {STORES.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Product">
          <input className={inputClass} value={product} onChange={(e) => setProduct(e.target.value)} />
        </Field>
        <Field label="Issue">
          <input className={inputClass} value={issue} onChange={(e) => setIssue(e.target.value)} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Btn onClick={() => onOpenChange(false)}>Cancel</Btn>
          <Btn variant="solid" type="submit" icon={Plus}>Log ticket</Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Brands & schemes ---------------- */

function BrandsModule() {
  const desk = useDesk();
  const [schemes, setSchemes] = React.useState(schemesSeed);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const open = schemes.find((s) => s.id === openId) ?? null;
  const earned = schemes.reduce((a, s) => a + s.earned, 0);
  const pending = schemes.filter((s) => s.status === "Claim filed").reduce((a, s) => a + s.earned, 0);
  const disputed = schemes.filter((s) => s.status === "Disputed").reduce((a, s) => a + s.earned, 0);
  const setStatus = (id: string, status: ClaimStatus) => setSchemes((cur) => cur.map((s) => (s.id === id ? { ...s, status } : s)));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Scheme money earned" value={inr(earned, { compact: true })} delta="+31%" hint="festive season" icon={BadgePercent} trend={[2.1, 4.4, 6.8, 9.2, 11.1, earned / 1e5]} />
        <Stat label="Claims waiting" value={inr(pending, { compact: true })} hint="filed, no credit note yet" icon={Timer} tone="warn" />
        <Stat label="Disputed" value={inr(disputed, { compact: true })} hint="Vivo IMEIs, HP sell-out" icon={AlertTriangle} tone="late" />
        <Stat label="Brands on target" value={`${brandTargets.filter((b) => b.done / b.target >= 0.8).length} of ${brandTargets.length}`} hint="80%+ with 11 days left" icon={Tag} tone="ok" />
      </div>
      <Panel title="October sell-out targets" sub="11 days left in the month. Slab is what we earn if we cross it.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {brandTargets.map((b) => {
            const pct = b.done / b.target;
            return (
              <button
                key={b.brand}
                type="button"
                onClick={() => toast(`${b.brand}: ${inr(b.target - b.done, { compact: true })} to go`, { description: `${inr((b.target - b.done) / 11, { compact: true })} a day for 11 days · ${b.slab}` })}
                className="rounded-[14px] border border-d-line p-3.5 text-left transition-shadow hover:shadow-[0_10px_26px_-18px_rgba(0,0,0,0.5)]"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[14px] font-semibold">
                    <span className="h-3 w-3 rounded-[3px]" style={{ background: b.color }} /> {b.brand}
                  </span>
                  <Pill tone={pct >= 0.85 ? "ok" : pct >= 0.65 ? "warn" : "late"} mono>{Math.round(pct * 100)}%</Pill>
                </div>
                <p className="tnum mt-2 font-mono text-[13px]">
                  {inr(b.done, { compact: true })} <span className="text-d-mute">/ {inr(b.target, { compact: true })}</span>
                </p>
                <Meter value={b.done} max={b.target} tone={pct >= 0.85 ? "ok" : pct >= 0.65 ? "warn" : "late"} className="mt-2" />
                <p className="mt-2 text-[11.5px] text-d-mute">{b.slab}</p>
              </button>
            );
          })}
        </div>
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Schemes and claims" sub="Click a scheme to file, chase or close the claim">
          <DataTable
            rows={schemes}
            rowKey={(s) => s.id}
            search={(s) => `${s.id} ${s.brand} ${s.name}`}
            searchPlaceholder="Search brand or scheme"
            filter={{ get: (s) => s.status, options: ["Accruing", "Claim filed", "Credit note received", "Disputed"] }}
            onRow={(s) => setOpenId(s.id)}
            bulk={[{ label: "File claims", run: (k) => { setSchemes((cur) => cur.map((s) => (k.includes(s.id) && s.status === "Accruing" ? { ...s, status: "Claim filed" } : s))); toast.success(`${k.length} claims filed`); desk.log(`Claim Keeper filed ${k.length} scheme claims`, "info"); } }]}
            columns={[
              { key: "brand", label: "Brand", render: (s) => <span className="font-semibold">{s.brand}</span>, sort: (s) => s.brand },
              { key: "name", label: "Scheme", render: (s) => <span className="text-d-mute">{s.name}</span>, wide: true },
              { key: "kind", label: "Type", render: (s) => <span className="text-[12px]">{s.kind}</span> },
              { key: "units", label: "Units", align: "right", render: (s) => <span className="tnum font-mono">{s.units}</span>, sort: (s) => s.units },
              { key: "earned", label: "Earned", align: "right", render: (s) => <span className="tnum font-mono">{s.earned ? inr(s.earned, { compact: true }) : "—"}</span>, sort: (s) => s.earned },
              { key: "st", label: "Claim", render: (s) => <Pill tone={claimTone[s.status]}>{s.status}</Pill> },
            ]}
          />
        </Panel>
        <Panel icon={BadgePercent} title="Price drops to pass on" sub="Brand-funded drops waiting for your nod to change shelf price">
          <ApprovalQueue
            approveLabel="Drop price"
            items={[
              { id: "pd1", title: "Sony Bravia 55\" X75L: ₹72,990 → ₹68,990", sub: "38 units in stock · protection claim filed", amount: "₹1.52 L", meta: "Sony" },
              { id: "pd2", title: "Galaxy A35 8/128: ₹30,999 → ₹29,499", sub: "131 units · Samsung CN in 15 days", amount: "₹1.97 L", meta: "Samsung" },
              { id: "pd3", title: "Redmi 43\" 4K: ₹22,999 → ₹21,499", sub: "71 units · already credited", amount: "₹1.07 L", meta: "Xiaomi" },
            ]}
            onDecide={(id, d) => d && desk.log(`Price drop ${d}: ${id}`, d === "approved" ? "ok" : "info")}
          />
        </Panel>
      </div>
      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpenId(null)}
        eyebrow={open ? `${open.id} · ${open.kind}` : ""}
        title={open ? `${open.brand}: ${open.name}` : ""}
        sub={open ? `${open.period} · ${open.units} units` : ""}
        footer={
          open && (
            <>
              {open.status === "Accruing" && <Btn variant="solid" onClick={() => { setStatus(open.id, "Claim filed"); toast.success("Claim filed on brand portal"); desk.log(`Claim filed: ${open.brand} ${open.id}`, "info"); }}>File claim</Btn>}
              {open.status === "Claim filed" && <Btn variant="solid" onClick={() => { setStatus(open.id, "Credit note received"); toast.success("Credit note matched in Tally"); desk.log(`Credit note received: ${open.brand} ${inr(open.earned, { compact: true })}`, "ok"); }}>Mark credit note received</Btn>}
              {open.status === "Disputed" && <Btn variant="solid" onClick={() => { setStatus(open.id, "Claim filed"); toast.success("Re-filed with IMEI proof"); desk.log(`Re-filed disputed claim ${open.id}`, "warn"); }}>Re-file with proof</Btn>}
              {open.status === "Credit note received" && <Btn variant="solid" onClick={() => setOpenId(null)}>Done</Btn>}
            </>
          )
        }
      >
        {open && (
          <div className="space-y-5">
            <KV items={[{ k: "Earned", v: open.earned ? inr(open.earned) : "Not yet" }, { k: "Per unit", v: open.units ? inr(open.earned / open.units) : "—" }, { k: "Status", v: <Pill tone={claimTone[open.status]}>{open.status}</Pill> }, { k: "Proof", v: "IMEI / serial list from POS" }]} />
            {open.status === "Disputed" && (
              <p className="rounded-[12px] bg-d-late/5 p-3 text-[13px]">
                Brand rejected part of this claim. Claim Keeper found the bills for every serial in Tally; re-filing with invoice copies usually clears in 10 days.
              </p>
            )}
            <Bars height={130} data={["Wk 1", "Wk 2", "Wk 3", "Wk 4"].map((l, i) => ({ label: l, value: Math.round(open.units * [0.18, 0.24, 0.27, 0.31][i]) }))} />
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Online orders ---------------- */

function OnlineModule() {
  const desk = useDesk();
  const [orders, setOrders] = React.useState(ordersSeed);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [replied, setReplied] = React.useState<Set<string>>(new Set());
  const open = orders.find((o) => o.id === openId) ?? null;
  const colName = (c: OrderCol) => orderCols.find((x) => x.id === c)!.label;
  const chats = [
    { id: "c1", name: "Trupti Kalaria", town: "Rajkot", msg: "A35 blue available at Yagnik Road? Exchange my M31?", hot: true },
    { id: "c2", name: "Ashok Sorathiya", town: "Dhoraji", msg: "1.5 ton 5 star LG ni price su che? Installation free?", hot: true },
    { id: "c3", name: "Nazma Patel", town: "Jamnagar", msg: "iPhone 15 on EMI without credit card possible?", hot: false },
    { id: "c4", name: "Kuldeep Jadeja", town: "Junagadh", msg: "Sony 55 inch ma Diwali offer kyare aavse?", hot: true },
    { id: "c5", name: "Meera Soni", town: "Bhavnagar", msg: "My washing machine repair status, ticket SRV-8803", hot: false },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Online orders today" value={orders.length} delta="+38%" hint="vs last Tuesday" icon={Globe} trend={[4, 5, 7, 8, 9, orders.length]} />
        <Stat label="WhatsApp enquiries" value="41" delta="+12" hint="9 hot, 6 converted" icon={MessageCircle} tone="ok" trend={[18, 22, 27, 31, 36, 41]} />
        <Stat label="Due to ship in 4 h" value={orders.filter((o) => o.col !== "done" && o.slaH <= 4).length} hint="marketplace SLA" icon={Timer} tone="warn" />
        <Stat label="Online value" value={inr(orders.reduce((a, o) => a + o.amount, 0), { compact: true })} hint="fulfilled from 9 stores" icon={IndianRupee} tone="info" />
      </div>
      <Panel title="Order board" sub="Every channel in one place, fulfilled from the nearest store with stock. Drag to move.">
        <Board
          columns={orderCols}
          items={orders}
          itemKey={(o) => o.id}
          getColumn={(o) => o.col}
          minColumnWidth={200}
          onMove={(id, col) => {
            setOrders((cur) => cur.map((o) => (o.id === id ? { ...o, col: col as OrderCol } : o)));
            toast.success(`${id} → ${colName(col as OrderCol)}`);
            desk.log(`Online order ${id} moved to ${colName(col as OrderCol)}`, col === "done" ? "ok" : "info");
          }}
          renderCard={(o) => (
            <button type="button" onClick={() => setOpenId(o.id)} className="block w-full text-left">
              <p className="flex items-center gap-1.5 pr-4 text-[11px] font-semibold" style={{ color: channelColor[o.channel] }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: channelColor[o.channel] }} /> {o.channel}
                <span className="ml-auto font-mono font-normal text-d-mute">{o.id}</span>
              </p>
              <p className="mt-1 text-[13px] font-semibold leading-snug">{o.item}</p>
              <p className="mt-0.5 text-[12px] text-d-mute">
                {o.customer} · {o.city}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="tnum font-mono text-[12px]">{inr(o.amount)}</span>
                {o.col !== "done" ? <Pill tone={o.slaH <= 3 ? "late" : "neutral"} mono>{o.slaH}h left</Pill> : <Pill tone="ok">done</Pill>}
              </div>
            </button>
          )}
        />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <Panel icon={MessageCircle} title="WhatsApp, waiting for a reply" sub="WhatsApp Seller drafted answers from live stock. Send or hand to Pooja.">
          <ul className="space-y-2">
            {chats.map((c) => (
              <li key={c.id} className="flex items-start gap-3 rounded-[12px] border border-d-line p-3">
                <Avatar name={c.name} size={34} tone={c.hot ? "accent" : "info"} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-[13px] font-semibold">
                    {c.name} <span className="font-normal text-d-mute">· {c.town}</span> {c.hot && <Pill tone="warn">hot</Pill>}
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-d-mute">{c.msg}</p>
                </div>
                {replied.has(c.id) ? (
                  <Pill tone="ok">Sent</Pill>
                ) : (
                  <Btn
                    size="sm"
                    variant="soft"
                    icon={Send}
                    onClick={() => {
                      setReplied((s) => new Set(s).add(c.id));
                      toast.success(`Reply sent to ${c.name}`, { description: "Price, stock at nearest store and a UPI link" });
                      desk.log(`WhatsApp reply sent to ${c.name}, ${c.town}`);
                    }}
                  >
                    Send draft
                  </Btn>
                )}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Orders by channel, this week" sub="Count of orders">
          <Bars height={200} data={[{ label: "WhatsApp", value: 64, tone: "ok" }, { label: "Flipkart", value: 41, tone: "info" }, { label: "Amazon", value: 23, tone: "warn" }, { label: "Website", value: 17, tone: "accent" }]} />
        </Panel>
      </div>
      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpenId(null)}
        eyebrow={open ? `${open.channel} · ${open.id}` : ""}
        title={open?.item ?? ""}
        sub={open ? `${open.customer} · ${open.city}` : ""}
        footer={
          open && open.col !== "done" ? (
            <Btn
              variant="solid"
              onClick={() => {
                const order: OrderCol[] = ["new", "confirmed", "packed", "out", "done"];
                const next = order[order.indexOf(open.col) + 1];
                setOrders((cur) => cur.map((o) => (o.id === open.id ? { ...o, col: next } : o)));
                toast.success(`${open.id} → ${colName(next)}`);
                desk.log(`Online order ${open.id} moved to ${colName(next)}`, "info");
              }}
            >
              Move to {colName((["new", "confirmed", "packed", "out", "done"] as OrderCol[])[(["new", "confirmed", "packed", "out", "done"] as OrderCol[]).indexOf(open.col) + 1])}
            </Btn>
          ) : (
            <Btn variant="solid" onClick={() => setOpenId(null)}>Done</Btn>
          )
        }
      >
        {open && (
          <div className="space-y-5">
            <KV items={[{ k: "Amount", v: inr(open.amount) }, { k: "Payment", v: open.pay }, { k: "Fulfilling store", v: storeById(open.store).name }, { k: "Stage", v: colName(open.col) }, { k: "SLA", v: open.col === "done" ? "Met" : `${open.slaH} hours left` }, { k: "Channel", v: open.channel }]} />
            <p className="rounded-[12px] bg-d-sunk/70 p-3 text-[12.5px] leading-relaxed text-d-mute">
              Picked from {storeById(open.store).short} because it is the nearest store with stock. Invoice is raised on the store GSTIN; marketplace commission and TCS land in Tally automatically.
            </p>
          </div>
        )}
      </Sheet>
    </div>
  );
}
