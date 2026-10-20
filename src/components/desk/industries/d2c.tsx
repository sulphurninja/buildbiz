"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  BadgeIndianRupee,
  Bot,
  Boxes,
  Flame,
  Gauge as GaugeIcon,
  HeartPulse,
  IndianRupee,
  Leaf,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  PackageCheck,
  PackageX,
  Pause,
  Phone,
  Play,
  Plug,
  Plus,
  Repeat,
  RotateCcw,
  Send,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Timer,
  TrendingUp,
  Truck,
  Users,
  Warehouse,
  Zap,
} from "lucide-react";
import { DeskShell, useDesk } from "../shell";
import { AreaChart, Bars, Donut, HBars, HeatGrid, Sparkline } from "../charts";
import { Board, Countdown, DataTable } from "../data";
import { AgentsModule, ConnectionsModule, IndependenceModule, PeopleModule } from "../common";
import { Btn, Field, inputClass, inr, KV, Meter, Modal, num, Panel, Pill, Segmented, Sheet, Stat } from "../ui";
import type { Decision, DeskConfig, DeskModule, IndependenceData, Integration, TeamMember, Tone, WorkforceAgent } from "../types";

/* ============================================================
   Data — Western Ghats Wellness, Bengaluru. Fictional Ayurvedic D2C brand
   selling on Shopify, Amazon, Nykaa and Flipkart. Today is 20 Oct 2026.
   ============================================================ */

type Cat = "Supplements" | "Skin" | "Hair & body" | "Foods" | "Kits";
type Loc = "Hoskote" | "Bhiwandi 3PL" | "Gurugram 3PL";
type Sku = {
  code: string;
  name: string;
  cat: Cat;
  mrp: number;
  price: number;
  cogs: number;
  gst: number;
  stock: number;
  perDay: number;
  loc: Loc;
  rating: number;
  reviews: number;
  amazon: number;
  nykaa: number;
  color: string;
};

const seedSkus: Sku[] = [
  { code: "ASH60", name: "Ashwagandha KSM-66 Tablets 60s", cat: "Supplements", mrp: 899, price: 749, cogs: 168, gst: 12, stock: 1840, perDay: 212, loc: "Hoskote", rating: 4.4, reviews: 3120, amazon: 699, nykaa: 749, color: "#7a5a2f" },
  { code: "KUM30", name: "Kumkumadi Night Serum 30ml", cat: "Skin", mrp: 1299, price: 1099, cogs: 214, gst: 18, stock: 420, perDay: 96, loc: "Hoskote", rating: 4.3, reviews: 1874, amazon: 1049, nykaa: 1099, color: "#c0582c" },
  { code: "BHR200", name: "Bhringraj Hair Oil 200ml", cat: "Hair & body", mrp: 549, price: 449, cogs: 82, gst: 12, stock: 2650, perDay: 148, loc: "Bhiwandi 3PL", rating: 4.2, reviews: 2408, amazon: 429, nykaa: 449, color: "#3d6b3a" },
  { code: "TRI100", name: "Triphala Churna 100g", cat: "Foods", mrp: 299, price: 249, cogs: 41, gst: 12, stock: 3100, perDay: 64, loc: "Hoskote", rating: 4.5, reviews: 961, amazon: 239, nykaa: 249, color: "#8f7a3a" },
  { code: "CHY500", name: "Chyawanprash Sugar-free 500g", cat: "Foods", mrp: 699, price: 599, cogs: 156, gst: 12, stock: 610, perDay: 58, loc: "Gurugram 3PL", rating: 4.1, reviews: 742, amazon: 579, nykaa: 599, color: "#5b2a1c" },
  { code: "SHA60", name: "Shatavari Women's Wellness 60s", cat: "Supplements", mrp: 799, price: 679, cogs: 151, gst: 12, stock: 980, perDay: 74, loc: "Hoskote", rating: 4.0, reviews: 655, amazon: 659, nykaa: 679, color: "#b34a6a" },
  { code: "NTF100", name: "Neem-Tulsi Face Wash 100ml", cat: "Skin", mrp: 349, price: 299, cogs: 48, gst: 18, stock: 4200, perDay: 131, loc: "Bhiwandi 3PL", rating: 4.3, reviews: 2210, amazon: 279, nykaa: 299, color: "#4f8a4a" },
  { code: "BRG30", name: "Brahmi Focus Gummies 30s", cat: "Supplements", mrp: 999, price: 849, cogs: 232, gst: 18, stock: 140, perDay: 52, loc: "Hoskote", rating: 3.8, reviews: 418, amazon: 829, nykaa: 849, color: "#6a4fa0" },
  { code: "MOR150", name: "Moringa Greens Powder 150g", cat: "Foods", mrp: 499, price: 429, cogs: 96, gst: 12, stock: 1320, perDay: 22, loc: "Gurugram 3PL", rating: 4.2, reviews: 301, amazon: 399, nykaa: 429, color: "#6b8f2a" },
  { code: "SRK", name: "Sleep Ritual Kit (tablets + oil + tea)", cat: "Kits", mrp: 1799, price: 1499, cogs: 412, gst: 12, stock: 310, perDay: 18, loc: "Hoskote", rating: 4.6, reviews: 214, amazon: 1449, nykaa: 1499, color: "#2f3a6b" },
  { code: "UBT100", name: "Kesar Ubtan 100g", cat: "Skin", mrp: 449, price: 379, cogs: 61, gst: 18, stock: 1750, perDay: 47, loc: "Bhiwandi 3PL", rating: 4.4, reviews: 1033, amazon: 359, nykaa: 379, color: "#d6902c" },
  { code: "MNO100", name: "Mahanarayan Pain Relief Oil 100ml", cat: "Hair & body", mrp: 449, price: 399, cogs: 58, gst: 12, stock: 2200, perDay: 69, loc: "Gurugram 3PL", rating: 4.3, reviews: 1290, amazon: 379, nykaa: 399, color: "#8a3b2a" },
];
const skuName = (code: string) => seedSkus.find((s) => s.code === code)?.name ?? code;
const cover = (s: Sku) => s.stock / Math.max(1, s.perDay);

type Status = "New" | "Confirmed" | "Shipped" | "NDR" | "RTO" | "Delivered" | "Cancelled";
type Channel = "Shopify" | "Amazon" | "Nykaa" | "Flipkart";
type Order = { id: string; name: string; city: string; pin: string; sku: string; qty: number; value: number; mode: "COD" | "Prepaid"; risk: number; status: Status; channel: Channel; placed: string; newCust: boolean };

const seedOrders: Order[] = [
  { id: "WGW-48213", name: "Ritika Sharma", city: "Lucknow", pin: "226010", sku: "ASH60", qty: 2, value: 1498, mode: "COD", risk: 72, status: "New", channel: "Shopify", placed: "11:42 AM", newCust: true },
  { id: "WGW-48212", name: "Arvind Menon", city: "Kochi", pin: "682020", sku: "KUM30", qty: 1, value: 1099, mode: "Prepaid", risk: 8, status: "Confirmed", channel: "Shopify", placed: "11:39 AM", newCust: false },
  { id: "WGW-48211", name: "Pooja Yadav", city: "Patna", pin: "800020", sku: "SHA60", qty: 1, value: 679, mode: "COD", risk: 81, status: "New", channel: "Shopify", placed: "11:37 AM", newCust: true },
  { id: "WGW-48210", name: "Nikhil Jain", city: "Jaipur", pin: "302017", sku: "SRK", qty: 1, value: 1499, mode: "Prepaid", risk: 12, status: "Confirmed", channel: "Shopify", placed: "11:31 AM", newCust: false },
  { id: "AMZ-407-7718", name: "Sana Qureshi", city: "Hyderabad", pin: "500028", sku: "BHR200", qty: 3, value: 1347, mode: "Prepaid", risk: 5, status: "Shipped", channel: "Amazon", placed: "11:22 AM", newCust: false },
  { id: "WGW-48207", name: "Manoj Tiwari", city: "Gorakhpur", pin: "273001", sku: "MNO100", qty: 2, value: 798, mode: "COD", risk: 88, status: "New", channel: "Shopify", placed: "11:18 AM", newCust: true },
  { id: "WGW-48205", name: "Deepa Raghavan", city: "Chennai", pin: "600041", sku: "KUM30", qty: 1, value: 1099, mode: "COD", risk: 34, status: "Confirmed", channel: "Shopify", placed: "11:02 AM", newCust: false },
  { id: "NYK-22914", name: "Ananya Bose", city: "Kolkata", pin: "700029", sku: "UBT100", qty: 2, value: 758, mode: "Prepaid", risk: 6, status: "Shipped", channel: "Nykaa", placed: "10:51 AM", newCust: false },
  { id: "WGW-48199", name: "Rahul Chauhan", city: "Meerut", pin: "250002", sku: "BRG30", qty: 1, value: 849, mode: "COD", risk: 77, status: "NDR", channel: "Shopify", placed: "Yesterday", newCust: true },
  { id: "WGW-48194", name: "Kiran Patil", city: "Pune", pin: "411038", sku: "ASH60", qty: 1, value: 749, mode: "COD", risk: 22, status: "Shipped", channel: "Shopify", placed: "Yesterday", newCust: false },
  { id: "WGW-48188", name: "Farhan Ali", city: "Aligarh", pin: "202001", sku: "SHA60", qty: 2, value: 1358, mode: "COD", risk: 84, status: "RTO", channel: "Shopify", placed: "18 Oct", newCust: true },
  { id: "FLK-OD4471", name: "Lakshmi Narayan", city: "Mysuru", pin: "570009", sku: "TRI100", qty: 4, value: 996, mode: "Prepaid", risk: 4, status: "Delivered", channel: "Flipkart", placed: "17 Oct", newCust: false },
  { id: "WGW-48172", name: "Gurpreet Kaur", city: "Ludhiana", pin: "141001", sku: "CHY500", qty: 1, value: 599, mode: "COD", risk: 41, status: "NDR", channel: "Shopify", placed: "17 Oct", newCust: true },
  { id: "WGW-48166", name: "Swati Deshmukh", city: "Nagpur", pin: "440010", sku: "NTF100", qty: 3, value: 897, mode: "Prepaid", risk: 7, status: "Delivered", channel: "Shopify", placed: "16 Oct", newCust: false },
  { id: "WGW-48160", name: "Vikas Mishra", city: "Varanasi", pin: "221005", sku: "SRK", qty: 1, value: 1499, mode: "COD", risk: 69, status: "RTO", channel: "Shopify", placed: "16 Oct", newCust: true },
  { id: "WGW-48151", name: "Neha Kapoor", city: "Gurugram", pin: "122002", sku: "KUM30", qty: 2, value: 2198, mode: "Prepaid", risk: 3, status: "Delivered", channel: "Shopify", placed: "15 Oct", newCust: false },
];
const seedCod = seedOrders.filter((o) => o.mode === "COD").length;
const statusTone: Record<Status, Tone> = { New: "info", Confirmed: "accent", Shipped: "neutral", NDR: "warn", RTO: "late", Delivered: "ok", Cancelled: "neutral" };

type Ndr = { awb: string; name: string; city: string; reason: string; attempts: number; courier: string; value: number };
const ndrs: Ndr[] = [
  { awb: "SR1427788310", name: "Rahul Chauhan", city: "Meerut", reason: "Customer not reachable", attempts: 2, courier: "Delhivery", value: 849 },
  { awb: "SR1427761942", name: "Gurpreet Kaur", city: "Ludhiana", reason: "Address incomplete, no landmark", attempts: 1, courier: "Xpressbees", value: 599 },
  { awb: "SR1427702215", name: "Ajay Verma", city: "Kanpur", reason: "Refused: says ordered by mistake", attempts: 1, courier: "Ecom Express", value: 1498 },
  { awb: "SR1427699021", name: "Shabnam Begum", city: "Bareilly", reason: "Premises closed", attempts: 2, courier: "Delhivery", value: 679 },
  { awb: "SR1427655480", name: "Sunil Rawat", city: "Dehradun", reason: "Asked to reschedule to Thursday", attempts: 1, courier: "Blue Dart", value: 1099 },
  { awb: "SR1427630094", name: "Meena Kumari", city: "Gaya", reason: "ODA pincode, courier won't go", attempts: 1, courier: "Xpressbees", value: 749 },
];

type Platform = "Meta" | "Google";
type Campaign = { id: string; name: string; platform: Platform; obj: string; spend: number; budget: number; roas: number; cpa: number; ctr: number; freq: number; status: "Active" | "Paused" | "Learning"; trend: number[] };
const seedCampaigns: Campaign[] = [
  { id: "M-ASH-RTG", name: "Ashwagandha Reels · retarget 7d", platform: "Meta", obj: "Sales", spend: 18400, budget: 22000, roas: 4.8, cpa: 186, ctr: 2.4, freq: 2.1, status: "Active", trend: [3.9, 4.1, 4.4, 4.2, 4.6, 4.9, 4.8] },
  { id: "M-KUM-LAL", name: "Kumkumadi serum · LAL 2% women 25-44", platform: "Meta", obj: "Sales", spend: 26800, budget: 30000, roas: 3.1, cpa: 412, ctr: 1.7, freq: 1.8, status: "Active", trend: [3.6, 3.5, 3.4, 3.2, 3.3, 3.0, 3.1] },
  { id: "M-SHA-UGC", name: "Shatavari UGC · Hindi creators", platform: "Meta", obj: "Sales", spend: 14200, budget: 15000, roas: 1.4, cpa: 568, ctr: 1.1, freq: 3.9, status: "Active", trend: [2.2, 2.0, 1.9, 1.7, 1.6, 1.5, 1.4] },
  { id: "M-BHR-ADV", name: "Bhringraj oil · Advantage+ shopping", platform: "Meta", obj: "Sales", spend: 21500, budget: 25000, roas: 3.6, cpa: 214, ctr: 2.0, freq: 1.6, status: "Active", trend: [3.1, 3.3, 3.2, 3.5, 3.4, 3.7, 3.6] },
  { id: "M-SRK-GIFT", name: "Sleep Ritual Kit · Diwali gifting", platform: "Meta", obj: "Sales", spend: 9800, budget: 12000, roas: 5.6, cpa: 268, ctr: 2.9, freq: 1.3, status: "Learning", trend: [3.8, 4.4, 4.9, 5.1, 5.3, 5.5, 5.6] },
  { id: "M-BRG-TOF", name: "Brahmi gummies · students top-of-funnel", platform: "Meta", obj: "Awareness", spend: 7600, budget: 8000, roas: 0.9, cpa: 840, ctr: 0.8, freq: 2.7, status: "Active", trend: [1.4, 1.3, 1.2, 1.1, 1.0, 0.9, 0.9] },
  { id: "G-BRAND", name: "Brand search · Western Ghats", platform: "Google", obj: "Search", spend: 4200, budget: 5000, roas: 11.2, cpa: 64, ctr: 9.8, freq: 1, status: "Active", trend: [10.4, 10.9, 11.0, 11.6, 11.1, 11.4, 11.2] },
  { id: "G-PMAX-ALL", name: "Performance Max · all SKUs", platform: "Google", obj: "Sales", spend: 16900, budget: 20000, roas: 2.7, cpa: 302, ctr: 1.3, freq: 1, status: "Active", trend: [2.9, 2.8, 2.8, 2.6, 2.7, 2.6, 2.7] },
  { id: "G-ASH-SRCH", name: "Generic search · ashwagandha tablets", platform: "Google", obj: "Search", spend: 8300, budget: 9000, roas: 2.2, cpa: 338, ctr: 4.1, freq: 1, status: "Active", trend: [2.0, 2.1, 2.3, 2.2, 2.1, 2.3, 2.2] },
  { id: "G-YT-CHY", name: "YouTube · Chyawanprash winter", platform: "Google", obj: "Video", spend: 0, budget: 6000, roas: 1.1, cpa: 610, ctr: 0.6, freq: 1, status: "Paused", trend: [1.4, 1.3, 1.2, 1.1, 1.1, 1.0, 1.1] },
];

type Stage = "raised" | "production" | "qc" | "transit" | "received";
type InboundPO = { po: string; sku: string; qty: number; vendor: string; stage: Stage; eta: string; value: number };
const seedPOs: InboundPO[] = [
  { po: "PO-WGW-1182", sku: "BRG30", qty: 4000, vendor: "Nandi Gummies Co., Hosur", stage: "production", eta: "26 Oct", value: 928000 },
  { po: "PO-WGW-1179", sku: "KUM30", qty: 2500, vendor: "Chamundi Herbals, Mysuru", stage: "qc", eta: "22 Oct", value: 535000 },
  { po: "PO-WGW-1176", sku: "ASH60", qty: 8000, vendor: "Chamundi Herbals, Mysuru", stage: "transit", eta: "21 Oct", value: 1344000 },
  { po: "PO-WGW-1171", sku: "SRK", qty: 600, vendor: "Kanakapura Pack Print (gift boxes)", stage: "received", eta: "18 Oct", value: 96000 },
  { po: "PO-WGW-1185", sku: "CHY500", qty: 1500, vendor: "Sahyadri Naturals, Belagavi", stage: "raised", eta: "3 Nov", value: 234000 },
  { po: "PO-WGW-1169", sku: "NTF100", qty: 6000, vendor: "Sahyadri Naturals, Belagavi", stage: "received", eta: "15 Oct", value: 288000 },
  { po: "PO-WGW-1184", sku: "UBT100", qty: 2000, vendor: "Chamundi Herbals, Mysuru", stage: "raised", eta: "31 Oct", value: 122000 },
];
const stageCols: { id: Stage; label: string; tone: Tone; hint?: string }[] = [
  { id: "raised", label: "PO raised", tone: "info" },
  { id: "production", label: "In production", tone: "accent", hint: "Batch manufacturing record shared" },
  { id: "qc", label: "QC & CoA", tone: "warn", hint: "Heavy metals + micro test" },
  { id: "transit", label: "In transit", tone: "info" },
  { id: "received", label: "Received", tone: "ok" },
];

type TicketCol = "new" | "waiting" | "escalated" | "resolved";
type Ticket = { id: string; name: string; channel: "WhatsApp" | "Email" | "Instagram"; topic: string; sku: string; col: TicketCol; age: string; priority: "High" | "Normal" };
const seedTickets: Ticket[] = [
  { id: "T-9921", name: "Shalini Rao", channel: "WhatsApp", topic: "Serum leaked in box, wants replacement", sku: "KUM30", col: "new", age: "12 min", priority: "High" },
  { id: "T-9919", name: "Harish Gupta", channel: "WhatsApp", topic: "Where is my order? AWB not moving 3 days", sku: "ASH60", col: "new", age: "28 min", priority: "Normal" },
  { id: "T-9917", name: "Fatima Shaikh", channel: "Instagram", topic: "Can I take Shatavari while breastfeeding?", sku: "SHA60", col: "escalated", age: "1 h", priority: "High" },
  { id: "T-9914", name: "Ravi Teja", channel: "Email", topic: "GST invoice needed for company claim", sku: "SRK", col: "waiting", age: "2 h", priority: "Normal" },
  { id: "T-9912", name: "Ishita Ghosh", channel: "WhatsApp", topic: "Gummies arrived melted, Kolkata heat", sku: "BRG30", col: "escalated", age: "3 h", priority: "High" },
  { id: "T-9908", name: "Prakash Hegde", channel: "WhatsApp", topic: "COD refund for cancelled order", sku: "MNO100", col: "waiting", age: "5 h", priority: "Normal" },
  { id: "T-9905", name: "Anjali Verma", channel: "Email", topic: "Subscription skip for November", sku: "ASH60", col: "new", age: "6 h", priority: "Normal" },
  { id: "T-9901", name: "Mohit Arora", channel: "Instagram", topic: "Hair oil smell changed vs last batch", sku: "BHR200", col: "new", age: "8 h", priority: "Normal" },
  { id: "T-9897", name: "Kavitha S", channel: "WhatsApp", topic: "Wrong item: got face wash, ordered ubtan", sku: "UBT100", col: "resolved", age: "Yesterday", priority: "Normal" },
  { id: "T-9893", name: "Zoya Khan", channel: "Email", topic: "Bulk order for clinic, 40 units", sku: "TRI100", col: "resolved", age: "Yesterday", priority: "Normal" },
];

type Review = { id: string; who: string; city: string; stars: number; sku: string; text: string; platform: "Shopify" | "Amazon" | "Nykaa"; replied: boolean };
const seedReviews: Review[] = [
  { id: "R-1", who: "Megha P.", city: "Bengaluru", stars: 5, sku: "SRK", text: "Gifted to my parents. Papa says he sleeps through now. Packaging is beautiful.", platform: "Shopify", replied: false },
  { id: "R-2", who: "Abhishek K.", city: "Delhi", stars: 2, sku: "BRG30", text: "Gummies stuck together into one block. Taste is fine but delivery was bad.", platform: "Amazon", replied: false },
  { id: "R-3", who: "Sowmya R.", city: "Chennai", stars: 4, sku: "KUM30", text: "Glow is real after 3 weeks. Wish the dropper was better, it leaks a bit.", platform: "Nykaa", replied: false },
  { id: "R-4", who: "Tanvir A.", city: "Hyderabad", stars: 1, sku: "SHA60", text: "No difference after one month. Customer care took 4 days to answer.", platform: "Amazon", replied: false },
  { id: "R-5", who: "Lata M.", city: "Pune", stars: 5, sku: "MNO100", text: "My knees thank you. Smells like my grandmother's oil, in a good way.", platform: "Shopify", replied: true },
  { id: "R-6", who: "Rohan D.", city: "Mumbai", stars: 4, sku: "ASH60", text: "Third bottle. Calmer at work. Price went up though.", platform: "Amazon", replied: false },
  { id: "R-7", who: "Bhavna S.", city: "Ahmedabad", stars: 3, sku: "BHR200", text: "Hair fall reduced a little. Too oily for weekday use.", platform: "Nykaa", replied: false },
  { id: "R-8", who: "Joseph T.", city: "Kochi", stars: 5, sku: "TRI100", text: "Pure, no added sugar, works. Ordering 3 more.", platform: "Shopify", replied: true },
];

const cohortRows = ["Apr 26", "May 26", "Jun 26", "Jul 26", "Aug 26", "Sep 26"];
const cohortCols = ["M1", "M2", "M3", "M4", "M5", "M6"];
const cohortVals = [
  [17, 24, 29, 32, 35, 37],
  [19, 26, 31, 34, 36, 0],
  [16, 23, 27, 30, 0, 0],
  [21, 29, 33, 0, 0, 0],
  [23, 31, 0, 0, 0, 0],
  [24, 0, 0, 0, 0, 0],
];
const cohortSize = [4210, 4880, 5320, 6140, 6870, 7420];

type Segment = { name: string; size: number; aov: number; last: string; ltv: number; tone: Tone; play: string };
const segments: Segment[] = [
  { name: "Ashwagandha loyalists (3+ orders)", size: 2840, aov: 1120, last: "22 days", ltv: 4380, tone: "ok", play: "Subscribe & save 15%" },
  { name: "Skin first-timers, 30-60 days", size: 3910, aov: 980, last: "41 days", ltv: 1180, tone: "info", play: "Ubtan + face wash bundle" },
  { name: "COD-only repeaters", size: 1620, aov: 840, last: "35 days", ltv: 2210, tone: "warn", play: "₹50 off on prepaid" },
  { name: "Lapsed 90+ days", size: 6240, aov: 760, last: "118 days", ltv: 920, tone: "late", play: "Win-back: free Triphala" },
  { name: "Gift buyers (Sleep Kit)", size: 680, aov: 1640, last: "14 days", ltv: 1890, tone: "accent", play: "Diwali corporate gifting" },
  { name: "Hair oil only", size: 2970, aov: 540, last: "48 days", ltv: 1040, tone: "info", play: "Cross-sell Mahanarayan" },
  { name: "Women's wellness", size: 1430, aov: 910, last: "29 days", ltv: 1760, tone: "accent", play: "Shatavari 3-month pack" },
  { name: "Amazon-acquired, never on site", size: 8120, aov: 690, last: "63 days", ltv: 810, tone: "neutral", play: "Insert card QR → WhatsApp" },
  { name: "High-value metro (₹2k+ AOV)", size: 920, aov: 2340, last: "19 days", ltv: 6120, tone: "ok", play: "Early access, Ayurveda consult" },
  { name: "One-and-done RTO risk", size: 1180, aov: 720, last: "52 days", ltv: 410, tone: "late", play: "Prepaid only, exclude from ads" },
];

/* India dot map — rough outline in lon/lat, dots computed once at load */
const OUTLINE: [number, number][] = [
  [68.2, 23.7], [70, 20.8], [72.8, 19], [73.5, 16], [74.8, 12.8], [76.3, 9.5], [77.5, 8.1], [78.2, 8.9], [79.8, 10.3], [80.3, 13.1], [80.2, 15.5], [82.3, 16.6], [84.8, 19.2], [86.9, 21], [88.6, 21.7],
  [89, 24.2], [88.3, 25.6], [89.8, 25.9], [92.2, 23.2], [93.4, 24], [94.6, 25.5], [95.5, 27.4], [97, 28], [95.3, 28.9], [92, 27.9], [89.7, 28.1], [88.1, 27.9], [84, 27.4], [81, 28.9],
  [80, 30.5], [78.8, 31.2], [78.4, 32.7], [79, 34.5], [77.8, 35.6], [75.5, 36.5], [74, 35], [73.8, 33.8], [74.6, 32.5], [74.5, 30.9], [73.4, 29.9], [72, 28], [70.6, 27.7], [69.6, 26.8], [70.3, 25.4], [69, 24.3],
];
const proj = (lon: number, lat: number): [number, number] => [(lon - 68) * 3.4 + 1, (37.2 - lat) * 3.55 + 1];
function inside(lon: number, lat: number) {
  let hit = false;
  for (let i = 0, j = OUTLINE.length - 1; i < OUTLINE.length; j = i++) {
    const [xi, yi] = OUTLINE[i];
    const [xj, yj] = OUTLINE[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}
const MAP_DOTS: [number, number][] = (() => {
  const out: [number, number][] = [];
  for (let lat = 36.5; lat > 7.5; lat -= 0.95) for (let lon = 68.5; lon < 97.5; lon += 0.95) if (inside(lon, lat)) out.push(proj(lon, lat));
  return out;
})();
const CITIES: Record<string, [number, number]> = {
  Bengaluru: [77.59, 12.97], Mumbai: [72.88, 19.08], Delhi: [77.21, 28.61], Pune: [73.86, 18.52], Hyderabad: [78.49, 17.39], Chennai: [80.27, 13.08], Kolkata: [88.36, 22.57], Jaipur: [75.79, 26.91],
  Lucknow: [80.95, 26.85], Ahmedabad: [72.57, 23.02], Kochi: [76.27, 9.93], Patna: [85.14, 25.6], Guwahati: [91.74, 26.14], Indore: [75.86, 22.72], Chandigarh: [76.78, 30.73], Mysuru: [76.64, 12.3],
  Bhubaneswar: [85.82, 20.3], Coimbatore: [76.96, 11.0], Gurugram: [77.03, 28.46], Nagpur: [79.09, 21.15],
};
const CITY_NAMES = Object.keys(CITIES);

/* ============================================================
   Shared people, agents, independence, connections
   ============================================================ */

const team: TeamMember[] = [
  { name: "Kavya Hegde", role: "Founder & CEO", status: "Busy", load: 91, focus: "Approving Diwali ad budget and the Brahmi gummies reorder", since: "2021", tasks: [{ title: "Approve ₹4.5 L Diwali Meta budget", due: "11:00" }, { title: "Investor update for Oct", due: "Fri" }, { title: "Sign Nandi Gummies PO", due: "today", done: true }], week: [1, 1, 1, 1, 1, 1] },
  { name: "Arjun Nair", role: "Growth lead", status: "Busy", load: 84, focus: "Shatavari UGC fatigue; new Hindi creator briefs", since: "2022", tasks: [{ title: "Pause or refresh Shatavari UGC", due: "12:00" }, { title: "Brief 4 creators for Sleep Kit", due: "4:00" }], week: [1, 1, 1, 1, 1, 0] },
  { name: "Rohit Kulkarni", role: "Performance marketer", status: "On floor", load: 77, focus: "Moving PMax budget to retarget; Google feed errors", since: "2023", tasks: [{ title: "Fix 14 GMC disapproved SKUs", due: "1:00" }, { title: "Daily ROAS sheet", due: "6:00", done: true }], week: [1, 1, 1, 1, 1, 1] },
  { name: "Sneha Gowda", role: "Ops & 3PL", status: "In field", load: 82, focus: "At Hoskote: ASH60 lot arriving, Bhiwandi SLA slipping", since: "2021", tasks: [{ title: "GRN for PO-WGW-1176", due: "3:00" }, { title: "Call Shiprocket on Bhiwandi SLA", due: "11:30" }, { title: "NDR review", due: "2:30" }], week: [1, 1, 1, 1, 1, 1] },
  { name: "Divya Shenoy", role: "CX lead", status: "On floor", load: 73, focus: "Melted gummies complaints from east India", since: "2022", tasks: [{ title: "Reply 6 open reviews under 3 stars", due: "2:00" }, { title: "Replacement for T-9921", due: "now" }], week: [1, 1, 1, 0, 1, 1] },
  { name: "Dr. Meera Iyer", role: "Ayurveda consultant (BAMS)", status: "Busy", load: 58, focus: "Shatavari breastfeeding query; label claims review", since: "2023", tasks: [{ title: "Answer T-9917 with dosage note", due: "1:00" }, { title: "Review Kumkumadi claims for Nykaa", due: "Thu" }], week: [1, 0, 1, 0, 1, 0] },
  { name: "Imtiaz Pasha", role: "Warehouse supervisor, Hoskote", status: "On floor", load: 88, focus: "640 orders to pack before the 4 PM Delhivery pickup", since: "2022", tasks: [{ title: "Pack wave 2, 320 orders", due: "1:30" }, { title: "Cycle count for KUM30", due: "5:00" }], week: [1, 1, 1, 1, 1, 1] },
  { name: "Pradeep Rao", role: "Finance & marketplaces", status: "Off", load: 35, focus: "Amazon settlement mismatch ₹1.2 L; COD remittance due Thu", since: "2023", tasks: [{ title: "Reconcile Amazon settlement 14 Oct", due: "tomorrow" }], week: [1, 1, 1, 1, 1, 0] },
];

const agents: WorkforceAgent[] = [
  { name: "RTO Guard", role: "Scores every COD order and nudges risky ones to prepaid", icon: ShieldAlert, status: "Needs you", runsToday: 312, hoursSaved: 6, accuracy: 91, last: "1 min ago", skills: ["COD risk", "Pincode history", "WhatsApp IVR"], schedule: "On every new order", inbox: [{ title: "Block COD on 6 pincodes in western UP?", detail: "RTO above 34% for 30 days. Prepaid still allowed with ₹50 off." }], log: ["Held 14 orders scoring 80+ for confirmation", "Converted 41 COD orders to prepaid via link", "Flagged 3 repeat RTO phone numbers"] },
  { name: "Ad Pilot", role: "Watches ROAS by ad set and moves budget inside your limits", icon: Megaphone, status: "Needs you", runsToday: 24, hoursSaved: 4.5, accuracy: 87, last: "6 min ago", skills: ["Meta Ads", "Google Ads", "Budget rules"], schedule: "Every 30 min", inbox: [{ title: "Move ₹14k from Shatavari UGC to Sleep Kit", detail: "UGC at 1.4 ROAS, frequency 3.9. Sleep Kit at 5.6 and still learning." }], log: ["Paused 2 creatives with CTR under 0.6%", "Raised Ashwagandha retarget cap by 10%", "Brand search impression share 94%"] },
  { name: "Stock Sentinel", role: "Days of cover per SKU per warehouse, with reorder drafts", icon: Boxes, status: "Running", runsToday: 12, hoursSaved: 3, accuracy: 95, last: "14 min ago", skills: ["Unicommerce", "Run-rate", "Vendor lead times"], schedule: "Hourly", log: ["BRG30 runs out in 2.7 days, PO in production", "Moved 300 KUM30 Hoskote → Gurugram", "Moringa overstocked: 60 days cover"] },
  { name: "Review Responder", role: "Drafts replies to reviews and DMs in your voice", icon: Star, status: "Running", runsToday: 38, hoursSaved: 3.5, accuracy: 89, last: "3 min ago", skills: ["Judge.me", "Amazon", "Nykaa", "Instagram"], schedule: "Every 15 min", log: ["Drafted 6 replies for reviews under 3 stars", "Routed Shatavari medical question to Dr. Meera", "Published 11 thank-you replies"] },
  { name: "Win-back", role: "Builds segments and sends WhatsApp journeys", icon: Repeat, status: "Idle", runsToday: 2, hoursSaved: 2, accuracy: 84, last: "2 h ago", skills: ["Cohorts", "WhatsApp", "Klaviyo"], schedule: "Daily 7 PM", log: ["Lapsed 90+ journey: 6.2% reorder", "Subscribe & save offer to 2,840 loyalists", "Excluded RTO-risk segment from ads"] },
  { name: "Reconciler", role: "Matches COD remittance and marketplace settlements to Tally", icon: BadgeIndianRupee, status: "Running", runsToday: 5, hoursSaved: 5, accuracy: 96, last: "40 min ago", skills: ["Shiprocket COD", "Amazon settlements", "Tally"], schedule: "Daily 9 AM + on file drop", log: ["COD remittance ₹6.8 L matched, ₹22k short", "Amazon 14 Oct settlement off by ₹1.2 L (fee reversal)", "Posted 412 vouchers to Tally"] },
];

const independence: IndependenceData = {
  score: 41,
  history: [26, 29, 31, 33, 36, 38, 41],
  quote: "Every ad budget above ₹20,000 still comes to my phone at midnight. Arjun knows the numbers better than I do, I just haven't let go.",
  pillars: [
    { name: "Growth & ads", score: 34, note: "Budget changes wait for Kavya. Arjun proposes, she approves, often a day late.", fixes: [{ title: "Ad Pilot moves budget within ±20%", gain: 4 }, { title: "Weekly growth review, not nightly", gain: 2 }] },
    { name: "Orders & RTO", score: 52, note: "RTO Guard handles scoring. Pincode blocks still need the founder.", fixes: [{ title: "Sneha owns pincode rules", gain: 3 }] },
    { name: "Inventory & POs", score: 38, note: "Every PO is signed by Kavya. Reorders are late by 2-3 days on average.", fixes: [{ title: "Auto-approve repeat POs under ₹3 L", gain: 4 }, { title: "Reorder points per SKU", gain: 2 }] },
    { name: "CX & reviews", score: 57, note: "Divya runs CX well. Medical questions bottleneck on Dr. Meera's 3 days a week.", fixes: [{ title: "Approved answer library", gain: 2 }] },
    { name: "Money & settlements", score: 36, note: "COD remittance and marketplace fees are checked by hand each Monday.", fixes: [{ title: "Reconciler posts to Tally daily", gain: 3 }] },
    { name: "Team & roles", score: 44, note: "Clear owners, but decisions flow up to the founder by habit.", fixes: [{ title: "Decision rights doc", gain: 2 }, { title: "Ops lead hire", gain: 3 }] },
    { name: "Owner time", score: 29, note: "Kavya spends 16 hours a week inside Ads Manager and Shopify.", fixes: [{ title: "Daily one-page brief instead of dashboards", gain: 3 }] },
  ],
  ownerHours: [
    { label: "Ads Manager", hours: 10 },
    { label: "PO approvals", hours: 5 },
    { label: "Reviews & DMs", hours: 4 },
    { label: "Marketplaces", hours: 4 },
    { label: "Investors", hours: 5 },
    { label: "Hiring", hours: 3 },
    { label: "Product R&D", hours: 2 },
  ],
};

const integrations: Integration[] = [
  { name: "Shopify", category: "Storefront", status: "Connected", detail: "Orders, products, discounts and customers, live webhooks.", synced: "just now", records: "48,213 orders", mark: "S", color: "#5e8e3e" },
  { name: "Meta Ads", category: "Ads", status: "Connected", detail: "Campaign spend, ROAS and budget changes both ways.", synced: "2 min ago", records: "6 campaigns", mark: "M", color: "#1877f2" },
  { name: "Google Ads", category: "Ads", status: "Connected", detail: "Search, PMax and YouTube spend with conversions.", synced: "4 min ago", records: "4 campaigns", mark: "G", color: "#ea4335" },
  { name: "Shiprocket", category: "Shipping", status: "Connected", detail: "AWBs, NDR, RTO and COD remittance across 5 couriers.", synced: "1 min ago", records: "1,920 shipments/wk", mark: "SR", color: "#7b2ff7" },
  { name: "Razorpay", category: "Payments", status: "Connected", detail: "Prepaid payments and COD-to-prepaid links.", synced: "just now", records: "₹9.5 L today", mark: "R", color: "#2563eb" },
  { name: "WhatsApp Business (Interakt)", category: "Messaging", status: "Connected", detail: "Order confirmations, NDR calls, win-back journeys.", synced: "just now", records: "14,208 chats", mark: "W", color: "#1f9d55" },
  { name: "Amazon Seller Central", category: "Marketplace", status: "Syncing", detail: "Orders, FBA stock at Gurugram and settlements.", synced: "live", records: "312 orders/day", mark: "A", color: "#ff9900" },
  { name: "Unicommerce", category: "Inventory", status: "Connected", detail: "Stock across Hoskote, Bhiwandi and Gurugram.", synced: "8 min ago", records: "12 SKUs · 3 sites", mark: "U", color: "#0f766e" },
  { name: "Tally Prime", category: "Accounts", status: "Connected", detail: "Sales vouchers, GST and settlement entries.", synced: "40 min ago", records: "22,410 vouchers", mark: "T", color: "#1c4f9c" },
  { name: "Nykaa Seller Panel", category: "Marketplace", status: "Error", detail: "API token expired. Price sync paused since Sunday.", synced: "2 days ago", records: "—", mark: "N", color: "#e80071" },
];

/* ============================================================
   Config
   ============================================================ */

const decisions: Decision[] = [
  { id: "d-rto", kind: "Risk", title: "Block COD on 6 pincodes in western UP", context: "Aligarh, Gorakhpur, Meerut, Bareilly clusters ran 31–41% RTO for 30 days. ₹1.6 L of goods came back this month.", recommendation: "Keep prepaid open with ₹50 off. Expected: 22 fewer orders a day, ₹38k a week less RTO loss.", impact: "-₹38k/wk loss", from: "RTO Guard", module: "orders", approveLabel: "Block COD" },
  { id: "d-ads", kind: "Money", title: "Move ₹14,200/day from Shatavari UGC to Sleep Ritual Kit", context: "Shatavari UGC is at 1.4 ROAS with frequency 3.9. Sleep Kit is at 5.6 ROAS, still in learning, with 310 kits in stock.", recommendation: "Shift budget now and brief 4 new Hindi creators for Shatavari next week.", impact: "+₹52k rev/day", from: "Ad Pilot", module: "ads", approveLabel: "Shift budget" },
  { id: "d-brg", kind: "Risk", title: "Brahmi gummies run out in 2.7 days", context: "140 units left, 52 a day. The new lot (PO-WGW-1182) leaves Hosur on 26 Oct. The students ad set is still spending ₹7,600 a day.", recommendation: "Pause the gummies ad set and switch the PDP to 'Back on 28 Oct, pre-order'.", impact: "₹7.6k/day saved", from: "Stock Sentinel", module: "inventory", approveLabel: "Pause & pre-order" },
  { id: "d-diwali", kind: "Approve", title: "Approve Diwali gifting budget: ₹4.5 L over 12 days", context: "Last Diwali the Sleep Kit did 5.1 ROAS. Kanakapura has 600 gift boxes ready; 900 more need a PO by Friday.", recommendation: "Approve in two tranches: ₹2 L now, ₹2.5 L if ROAS holds above 3.5 by 27 Oct.", impact: "₹4.5 L", from: "Arjun Nair", module: "ads" },
  { id: "d-review", kind: "Reply", title: "Reply to 1-star Shatavari review on Amazon", context: "Tanvir from Hyderabad says no effect after a month and slow support. The review sits second on the listing.", recommendation: "Publish the drafted reply with Dr. Meera's 8-12 week guidance and a free consult.", from: "Review Responder", module: "reviews", approveLabel: "Publish reply" },
  { id: "d-gummies", kind: "Risk", title: "Ship gummies in thermal pouches to the east and north", context: "4 melted-gummies complaints this week from Kolkata, Patna and Delhi. Each replacement costs ₹380 with shipping.", recommendation: "Add the ₹14 thermal pouch for those zones. Costs ₹9k a month, saves about ₹26k in replacements.", impact: "+₹17k/mo", from: "Divya Shenoy", module: "reviews" },
  { id: "d-nykaa", kind: "People", title: "Nykaa price sync has been down since Sunday", context: "The Kumkumadi price on Nykaa is ₹1,049, below our site's ₹1,099. 38 orders came in at the old price.", recommendation: "Ask Pradeep to renew the API token today; Catalogue will push current prices after that.", from: "Reconciler", module: "catalogue", approveLabel: "Assign Pradeep" },
];

const config: DeskConfig = {
  slug: "d2c",
  company: "Western Ghats Wellness",
  brand: "Western Ghats",
  city: "Bengaluru",
  state: "KA",
  icon: Leaf,
  tagline: "Ayurvedic wellness · 12 SKUs · Shopify, Amazon, Nykaa, Flipkart · 3 warehouses",
  owner: { name: "Kavya Hegde", first: "Kavya", initials: "KH", role: "Founder & CEO" },
  theme: {
    variant: "inbox",
    paper: "#faf5f2",
    panel: "#ffffff",
    sunk: "#f3e9e6",
    ink: "#2a1520",
    mute: "#7a6170",
    line: "#ecdcd8",
    accent: "#8a2f52",
    accentInk: "#ffffff",
    soft: "#f7e5ec",
    ok: "#2f7d5b",
    warn: "#c98418",
    late: "#c2412d",
    info: "#4b6fa8",
    heading: "display",
    radius: 16,
  },
  brief:
    "Orders are up 14% on the Ashwagandha retarget, but western UP COD is eating ₹38k a week in RTO. Brahmi gummies run out in under 3 days while their ad set keeps spending, and the Diwali gifting budget needs your yes before Friday.",
  pulse: [
    { label: "Orders today", value: "1,286", delta: "+14%", trend: [820, 910, 980, 1040, 1110, 1190, 1286], module: "orders" },
    { label: "Revenue today", value: "₹9.5 L", delta: "+11%", trend: [6.1, 6.8, 7.2, 7.9, 8.4, 9.0, 9.5], tone: "ok", module: "orders" },
    { label: "RTO, 30 days", value: "14.2%", delta: "-1.8%", good: true, trend: [17.8, 17.1, 16.4, 15.9, 15.2, 14.6, 14.2], tone: "late", module: "orders" },
    { label: "Blended ROAS", value: "3.2×", delta: "+0.2", trend: [2.7, 2.8, 2.9, 3.0, 3.0, 3.1, 3.2], module: "ads" },
    { label: "Lowest cover", value: "2.7 days", delta: "BRG30", good: false, trend: [9, 8, 7, 5.5, 4.4, 3.5, 2.7], tone: "warn", module: "inventory" },
  ],
  decisions,
  agenda: [
    { at: 9.5, title: "Overnight orders & RTO check", detail: "Held 14 orders scoring 80+", count: 14, tone: "warn", module: "orders" },
    { at: 11, title: "Ad budget window", detail: "2 shifts proposed by Ad Pilot", count: 2, tone: "accent", module: "ads" },
    { at: 12.5, title: "Creator brief call", detail: "4 Hindi creators for Shatavari", tone: "info", module: "ads" },
    { at: 14, title: "Reviews under 3 stars", detail: "6 drafts waiting", count: 6, tone: "late", module: "reviews" },
    { at: 15, title: "Hoskote GRN: Ashwagandha lot", detail: "8,000 units from Chamundi Herbals", count: 8000, tone: "ok", module: "inventory" },
    { at: 18, title: "Cohort review with Arjun", detail: "Sep cohort repeat at 24% in M1", tone: "neutral", module: "cohorts" },
  ],
  activity: [
    { time: "11:44 AM", text: "Ad set fired: Ashwagandha Reels retarget, 17 orders in 2 min", tone: "ok" },
    { time: "11:30 AM", text: "RTO Guard held WGW-48207 (Gorakhpur, score 88)", tone: "warn" },
    { time: "11:12 AM", text: "Shiprocket: 6 new NDRs, 3 from Delhivery", tone: "late" },
    { time: "10:40 AM", text: "Chamundi Herbals: KUM30 lot passed heavy-metal test", tone: "ok" },
    { time: "10:05 AM", text: "COD remittance ₹6.8 L credited, ₹22k short", tone: "info" },
    { time: "9:20 AM", text: "Nykaa price sync failed again: token expired", tone: "late" },
  ],
  asks: [
    { q: "Why is RTO high this month?", a: "RTO is 14.2% over 30 days, down from 16% but still high in one region.\n\n• Western UP pincodes (Aligarh, Gorakhpur, Meerut, Bareilly) return 31–41% of COD orders. They are 9% of orders and 38% of RTO.\n• New customers on COD with order value above ₹1,200 return 2.6× more than repeat buyers.\n• Delhivery NDR re-attempts are only happening on 54% of cases in those zones.\n\nBlocking COD on 6 pincodes and keeping ₹50-off prepaid would cut about ₹38k a week of RTO loss.", sources: ["Shiprocket RTO report", "RTO Guard scores", "Shopify orders"] },
    { q: "Which ad sets should I pause?", a: "Two:\n• Shatavari UGC (Meta): 1.4 ROAS, frequency 3.9, CTR down from 1.9% to 1.1% in 7 days. Creative fatigue.\n• Brahmi gummies students: 0.9 ROAS, and stock runs out in 2.7 days anyway.\n\nTogether that frees ₹21,800 a day. Ad Pilot suggests ₹14,200 to Sleep Ritual Kit (5.6 ROAS) and the rest to Ashwagandha retarget.", sources: ["Meta Ads", "Google Ads", "Unicommerce stock"] },
    { q: "When do we stock out next?", a: "• Brahmi gummies (BRG30): 140 units, 2.7 days. PO-WGW-1182 dispatches from Hosur on 26 Oct.\n• Kumkumadi serum (KUM30): 420 units, 4.4 days. 2,500 units are in QC at Chamundi Herbals, expected 22 Oct.\n• Ashwagandha (ASH60): 8.7 days, but 8,000 units arrive at Hoskote at 3 PM today.\n\nMoringa is the opposite problem: 60 days of cover.", sources: ["Unicommerce", "Inbound POs"] },
    { q: "How good is our repeat rate?", a: "The Sep cohort repeated 24% in month 1, the best yet (Apr was 17%). Ashwagandha first-orders reach ₹2,450 LTV by month 6; skin first-orders flatten at about ₹1,700.\n\nThe weak spot: Amazon-acquired customers (8,120) almost never come to the site. An insert card with a WhatsApp QR is the cheapest fix.", sources: ["Shopify customers", "Cohort model"] },
    { q: "What's the real margin on Kumkumadi serum?", a: "On the website at ₹1,099:\n• Net of 18% GST: ₹931\n• COGS ₹214, shipping ₹62, gateway ₹22\n• Blended ad cost about ₹198 an order (new-customer CPA on the LAL campaign is ₹412, but over half of serum orders are repeat)\n\nContribution: about ₹436 a unit (40%). On Nykaa at ₹1,049 with 30% commission it drops to about ₹275 (26%). Fix the Nykaa price sync first.", sources: ["Catalogue & pricing", "Meta Ads CPA"] },
    { q: "Draft a reply to the melted gummies complaints", a: "Draft (not sent):\n\n“Hi Ishita, we're really sorry, the October heat in Kolkata got to your gummies before you did. A fresh pack is on its way today in a thermal pouch, no need to return the old one. We're adding these pouches for all east India orders from this week. – Divya, Western Ghats Wellness”", sources: ["Support ticket T-9912", "Courier zone map"] },
  ],
  run: {
    label: "Runs every 30 minutes. You can also run it now.",
    title: "Growth Watch",
    steps: [
      { text: "Read 1,286 orders since midnight across 4 channels", result: "14% above the same Tuesday last week" },
      { text: "Score COD orders for RTO risk", result: "14 held above 80, 41 converted to prepaid" },
      { text: "Pull spend and ROAS for 10 campaigns", result: "2 ad sets below 1.5 ROAS, 1 above 5" },
      { text: "Check days of cover against ads that drive each SKU", result: "BRG30 still advertised with 2.7 days left" },
      { text: "Draft decisions and replies", result: "3 budget moves, 6 review replies, 1 pincode rule" },
    ],
    outcome: "Pausing the Brahmi students ad set and shifting Shatavari UGC budget to the Sleep Kit adds about ₹52k a day in revenue at the same spend. Blocking COD on 6 western UP pincodes saves about ₹38k a week.",
    actions: ["Pause Brahmi students ad set", "Shift ₹14.2k to Sleep Ritual Kit", "Block COD on 6 pincodes", "Publish 6 review replies"],
  },
};

/* ============================================================
   Desk
   ============================================================ */

export default function D2cDesk() {
  const [orders, setOrders] = React.useState(seedOrders);
  const [campaigns, setCampaigns] = React.useState(seedCampaigns);
  const [skus, setSkus] = React.useState(seedSkus);
  const [pos, setPOs] = React.useState(seedPOs);
  const [tickets, setTickets] = React.useState(seedTickets);

  const held = orders.filter((o) => o.status === "New" && o.mode === "COD" && o.risk >= 70).length;
  const weakAds = campaigns.filter((c) => c.status !== "Paused" && c.roas < 1.5).length;
  const lowStock = skus.filter((s) => cover(s) < 7).length;
  const openTickets = tickets.filter((t) => t.col !== "resolved").length;

  const fullConfig: DeskConfig = {
    ...config,
    signature: { title: "Order heartbeat", sub: "Orders per minute across Shopify, Amazon, Nykaa and Flipkart. Every blip is a real order; spikes are ad sets firing.", module: "orders", render: () => <Heartbeat /> },
    homeExtras: () => <HomeExtras skus={skus} campaigns={campaigns} />,
  };

  const modules: DeskModule[] = [
    { id: "orders", label: "Orders & RTO", group: "Sell", count: held, title: "Orders & RTO", blurb: "Every order with its COD risk score, the NDR queue and where returns come from", icon: ShoppingBag, notes: ["Risk score blends pincode RTO history, new vs repeat, order value and address quality.", "Click a row to convert COD to prepaid, confirm on WhatsApp or cancel."], render: () => <OrdersTab orders={orders} setOrders={setOrders} /> },
    { id: "catalogue", label: "Catalogue & pricing", group: "Sell", count: 1, title: "Catalogue & pricing", blurb: "Prices on every channel and the real contribution margin after GST, fees, shipping and ads", icon: Tag, render: () => <CatalogueTab skus={skus} setSkus={setSkus} /> },
    { id: "ads", label: "Ads", group: "Grow", count: weakAds, title: "Ads", blurb: "Meta and Google spend against ROAS, with pause and scale on every ad set", icon: Megaphone, notes: ["Ad Pilot proposes moves; nothing over ±20% happens without you."], render: () => <AdsTab campaigns={campaigns} setCampaigns={setCampaigns} /> },
    { id: "cohorts", label: "Cohorts", group: "Grow", title: "Cohorts & LTV", blurb: "Who comes back, how fast, and what they're worth by first product", icon: Repeat, render: () => <CohortsTab /> },
    { id: "inventory", label: "Inventory", group: "Operate", count: lowStock, title: "Inventory", blurb: "Days of cover per SKU, inbound POs from manufacturers and stock across three warehouses", icon: Warehouse, render: () => <InventoryTab skus={skus} setSkus={setSkus} pos={pos} setPOs={setPOs} /> },
    { id: "reviews", label: "Reviews & support", group: "Operate", count: openTickets, title: "Reviews & support", blurb: "Tickets from WhatsApp, email and Instagram, and reviews across Shopify, Amazon and Nykaa", icon: MessagesSquare, render: () => <ReviewsTab tickets={tickets} setTickets={setTickets} /> },
    { id: "team", label: "People", group: "Company", title: "People", blurb: "Growth, ops, CX and the Hoskote warehouse: who is carrying what today", icon: Users, render: () => <PeopleModule members={team} /> },
    { id: "agents", label: "Agents", group: "Company", title: "Agents", blurb: "Six AI agents watching orders, ads, stock and reviews around the clock", icon: Bot, render: () => <AgentsModule agents={agents} /> },
    { id: "independence", label: "Independence", group: "Company", title: "Owner independence", blurb: "How much of Western Ghats runs without Kavya in Ads Manager", icon: GaugeIcon, render: () => <IndependenceModule data={independence} /> },
    { id: "connections", label: "Connections", group: "Company", title: "Connections", blurb: "Shopify, ad platforms, Shiprocket, marketplaces and Tally", icon: Plug, render: () => <ConnectionsModule items={integrations} /> },
  ];

  return <DeskShell config={fullConfig} modules={modules} />;
}

/* ---------------- Signature: Order heartbeat ---------------- */

type Ping = { id: number; city: string; sku: string; mode: "COD" | "Prepaid"; value: number; channel: Channel };
type Beat = { tick: number; series: number[]; pings: Ping[]; orders: number; revenue: number; cod: number; spike: number; source: string | null };

const seedSeries = [4, 5, 3, 6, 4, 5, 7, 4, 3, 5, 6, 4, 5, 8, 6, 5, 4, 6, 5, 7, 9, 14, 17, 12, 8, 6, 5, 4, 6, 5, 4, 5, 6, 7, 5, 4, 6, 5, 3, 4, 6, 5, 7, 6, 5, 4, 6, 5];
const seedPings: Ping[] = [
  { id: -1, city: "Lucknow", sku: "ASH60", mode: "COD", value: 1498, channel: "Shopify" },
  { id: -2, city: "Kochi", sku: "KUM30", mode: "Prepaid", value: 1099, channel: "Shopify" },
  { id: -3, city: "Patna", sku: "SHA60", mode: "COD", value: 679, channel: "Shopify" },
  { id: -4, city: "Jaipur", sku: "SRK", mode: "Prepaid", value: 1499, channel: "Shopify" },
  { id: -5, city: "Hyderabad", sku: "BHR200", mode: "Prepaid", value: 1347, channel: "Amazon" },
  { id: -6, city: "Kolkata", sku: "UBT100", mode: "Prepaid", value: 758, channel: "Nykaa" },
];
const adSources = ["Meta · Ashwagandha Reels retarget 7d", "Meta · Bhringraj Advantage+", "Google · Brand search", "Meta · Sleep Kit Diwali gifting"];
const channels: Channel[] = ["Shopify", "Shopify", "Shopify", "Amazon", "Amazon", "Nykaa", "Flipkart"];

function makePing(id: number, boostedSku?: string): Ping {
  const boosted = boostedSku && Math.random() < 0.6 ? seedSkus.find((x) => x.code === boostedSku) : undefined;
  const s = boosted ?? seedSkus[Math.floor(Math.random() * seedSkus.length)];
  const qty = Math.random() < 0.25 ? 2 : 1;
  return { id, city: CITY_NAMES[Math.floor(Math.random() * CITY_NAMES.length)], sku: s.code, mode: Math.random() < 0.38 ? "COD" : "Prepaid", value: s.price * qty, channel: channels[Math.floor(Math.random() * channels.length)] };
}

function ecgPath(series: number[], W: number, base: number, k: number) {
  const step = W / series.length;
  const parts = [`M0,${base}`];
  series.forEach((v, i) => {
    const x = i * step;
    parts.push(`L${(x + step * 0.3).toFixed(1)},${base}`, `L${(x + step * 0.38).toFixed(1)},${base + 4}`, `L${(x + step * 0.5).toFixed(1)},${(base - v * k).toFixed(1)}`, `L${(x + step * 0.62).toFixed(1)},${base + 7}`, `L${(x + step * 0.72).toFixed(1)},${base}`, `L${(x + step).toFixed(1)},${base}`);
  });
  return parts.join(" ");
}

function Heartbeat() {
  const desk = useDesk();
  const pid = React.useId().replace(/:/g, "");
  const [beat, setBeat] = React.useState<Beat>({ tick: 0, series: seedSeries, pings: seedPings, orders: 1286, revenue: 954212, cod: 489, spike: 0, source: null });

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setBeat((b) => {
        const tick = b.tick + 1;
        const autoFire = b.spike === 0 && tick % 30 === 0;
        const spike = autoFire ? 6 : Math.max(0, b.spike - 1);
        const source = autoFire ? adSources[Math.floor(tick / 30) % adSources.length] : spike > 0 ? b.source : null;
        const v = spike > 0 ? 11 + Math.round(Math.random() * 7) : 3 + Math.round(Math.random() * 4);
        const boosted = source?.includes("Ashwagandha") ? "ASH60" : source?.includes("Bhringraj") ? "BHR200" : source?.includes("Sleep") ? "SRK" : undefined;
        const n = spike > 0 ? 2 : Math.random() < 0.75 ? 1 : 0;
        const fresh = Array.from({ length: n }, (_, j) => makePing(tick * 4 + j, boosted));
        return {
          tick,
          series: [...b.series.slice(1), v],
          pings: [...fresh, ...b.pings].slice(0, 9),
          orders: b.orders + v,
          revenue: b.revenue + v * 742,
          cod: b.cod + Math.round(v * 0.38),
          spike,
          source,
        };
      });
    }, 1400);
    return () => window.clearInterval(id);
  }, []);

  const W = 720;
  const H = 200;
  const base = H - 34;
  const max = 18;
  const k = (H - 60) / max;
  const d = ecgPath(beat.series, W, base, k);
  const now = beat.series[beat.series.length - 1];
  const step = W / beat.series.length;
  const headY = base - now * k;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {beat.spike > 0 && beat.source ? (
          <span className="desk-rise inline-flex items-center gap-1.5 rounded-full bg-d-accent px-3 py-1 text-[12px] font-semibold text-d-accent-ink">
            <Flame className="h-3.5 w-3.5" /> Ad set firing · {beat.source}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-d-sunk px-3 py-1 text-[12px] text-d-mute">
            <HeartPulse className="h-3.5 w-3.5 text-d-accent" /> Resting rhythm · 4–7 orders a minute
          </span>
        )}
        <Btn
          size="sm"
          variant="soft"
          icon={Zap}
          className="ml-auto"
          onClick={() => {
            const src = "Meta · Sleep Kit Diwali gifting";
            setBeat((b) => ({ ...b, spike: 7, source: src }));
            toast.success("Ad set boosted", { description: `${src}: +20% budget for 30 minutes` });
            desk.log("Sleep Kit Diwali ad set boosted +20% for 30 min", "accent");
          }}
        >
          Boost Sleep Kit ad set
        </Btn>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_230px]">
        <div className="min-w-0">
          <div className="relative overflow-hidden rounded-[14px] border border-d-line" style={{ background: "color-mix(in oklab, var(--d-accent) 3%, var(--d-panel))" }}>
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block h-[220px] w-full">
              <defs>
                <pattern id={`g1${pid}`} width="12" height="12" patternUnits="userSpaceOnUse">
                  <path d="M12 0H0V12" fill="none" stroke="color-mix(in oklab, var(--d-accent) 10%, transparent)" strokeWidth="0.6" />
                </pattern>
                <pattern id={`g2${pid}`} width="60" height="60" patternUnits="userSpaceOnUse">
                  <rect width="60" height="60" fill={`url(#g1${pid})`} />
                  <path d="M60 0H0V60" fill="none" stroke="color-mix(in oklab, var(--d-accent) 20%, transparent)" strokeWidth="0.9" />
                </pattern>
                <linearGradient id={`fade${pid}`} x1="0" x2="1">
                  <stop offset="0%" stopColor="var(--d-accent)" stopOpacity="0.15" />
                  <stop offset="70%" stopColor="var(--d-accent)" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="var(--d-accent)" stopOpacity="1" />
                </linearGradient>
              </defs>
              <rect width={W} height={H} fill={`url(#g2${pid})`} />
              <line x1="0" x2={W} y1={base - 10 * k} y2={base - 10 * k} stroke="var(--d-warn)" strokeDasharray="4 5" strokeOpacity="0.7" />
              <path d={d} fill="none" stroke={`url(#fade${pid})`} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" style={{ transition: "d 600ms linear" }} />
              <circle cx={W - step * 0.5} cy={headY} r="9" fill="var(--d-accent)" opacity="0.18">
                <animate attributeName="r" values="5;14;5" dur="1.4s" repeatCount="indefinite" />
              </circle>
              <circle cx={W - step * 0.5} cy={headY} r="4" fill="var(--d-accent)" />
            </svg>
            <span className="pointer-events-none absolute left-2 font-mono text-[10px] text-d-warn" style={{ top: `calc(${((base - 10 * k) / H) * 100}% - 15px)` }}>
              10/min · ad spike line
            </span>
            <div className="pointer-events-none absolute inset-x-3 bottom-1.5 flex justify-between font-mono text-[10px] text-d-mute">
              <span>-48 min</span>
              <span>-36</span>
              <span>-24</span>
              <span>-12</span>
              <span className="font-semibold text-d-accent">now · {now}/min</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { l: "Orders today", v: num(beat.orders) },
              { l: "Revenue today", v: inr(beat.revenue, { compact: true }) },
              { l: "COD share", v: `${Math.round((beat.cod / beat.orders) * 100)}%` },
              { l: "Avg order value", v: inr(Math.round(beat.revenue / beat.orders)) },
            ].map((s) => (
              <div key={s.l} className="rounded-[12px] bg-d-sunk/70 px-3 py-2.5">
                <p className="text-[11.5px] text-d-mute">{s.l}</p>
                <p className="desk-h tnum text-[22px] font-semibold leading-tight">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="min-w-0">
          <div className="rounded-[14px] border border-d-line bg-d-panel p-2">
            <svg viewBox="0 0 100 114" className="block h-[200px] w-full">
              {MAP_DOTS.map(([x, y]) => (
                <circle key={`${x.toFixed(1)}-${y.toFixed(1)}`} cx={x} cy={y} r="0.85" fill="var(--d-ink)" opacity="0.16" />
              ))}
              {(() => {
                const [hx, hy] = proj(...CITIES.Bengaluru);
                return <rect x={hx - 1.8} y={hy - 1.8} width="3.6" height="3.6" fill="var(--d-ink)" transform={`rotate(45 ${hx} ${hy})`} />;
              })()}
              {beat.pings.slice(0, 7).map((p, i) => {
                const [x, y] = proj(...CITIES[p.city]);
                const c = p.mode === "COD" ? "var(--d-warn)" : "var(--d-accent)";
                return (
                  <g key={p.id} opacity={1 - i * 0.11}>
                    <circle cx={x} cy={y} r="2" fill="none" stroke={c} strokeWidth="0.6">
                      <animate attributeName="r" values="1.5;7;1.5" dur="1.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="1;0;1" dur="1.8s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={x} cy={y} r="1.6" fill={c} />
                  </g>
                );
              })}
            </svg>
            <div className="flex items-center justify-center gap-3 pb-1 text-[10.5px] text-d-mute">
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-d-accent" />prepaid</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-d-warn" />COD</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rotate-45 bg-d-ink" />Hoskote</span>
            </div>
          </div>
          <ul className="mt-3 space-y-1.5">
            {beat.pings.slice(0, 5).map((p) => (
              <li key={p.id} className="desk-rise flex items-center gap-2 text-[12px]">
                <Pill tone={p.mode === "COD" ? "warn" : "accent"} mono>
                  {p.mode}
                </Pill>
                <span className="min-w-0 flex-1 truncate">
                  <b className="font-semibold">{p.city}</b> <span className="text-d-mute">· {p.sku} · {p.channel}</span>
                </span>
                <span className="tnum font-mono text-[11.5px]">{inr(p.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function HomeExtras({ skus, campaigns }: { skus: Sku[]; campaigns: Campaign[] }) {
  const desk = useDesk();
  const watch = [...skus].sort((a, b) => cover(a) - cover(b)).slice(0, 4);
  const top = [...campaigns].filter((c) => c.status !== "Paused").sort((a, b) => b.roas - a.roas);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel icon={PackageX} title="Stock-out watch" sub="Lowest days of cover, at today's run-rate" action={<Btn size="sm" icon={ArrowRight} onClick={() => desk.goTab("inventory")}>Inventory</Btn>}>
        <ul className="space-y-3">
          {watch.map((s) => {
            const c = cover(s);
            const tone: Tone = c < 4 ? "late" : c < 9 ? "warn" : "ok";
            return (
              <li key={s.code} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] font-mono text-[10px] font-bold text-white" style={{ background: s.color }}>
                  {s.code.slice(0, 3)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">{s.name}</p>
                  <Meter value={Math.min(c, 30)} max={30} tone={tone} className="mt-1" />
                </div>
                <div className="text-right">
                  <p className="tnum font-mono text-[13px] font-semibold" style={{ color: `var(--d-${tone})` }}>
                    {c.toFixed(1)}d
                  </p>
                  <p className="text-[10.5px] text-d-mute">
                    <Countdown compact inHours={c * 24} />
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>
      <Panel icon={TrendingUp} title="ROAS right now" sub="Live ad sets, best first" action={<Btn size="sm" icon={ArrowRight} onClick={() => desk.goTab("ads")}>Ads</Btn>}>
        <HBars format={(v) => `${v.toFixed(1)}×`} data={top.slice(0, 6).map((c) => ({ label: c.name.split(" · ")[0], sub: c.platform, value: c.roas, tone: c.roas >= 3 ? "ok" : c.roas >= 1.5 ? "warn" : "late" }))} />
      </Panel>
    </div>
  );
}

/* ---------------- Orders & RTO ---------------- */

function riskFactors(o: Order) {
  return [
    { k: "Pincode RTO, 30 days", v: o.risk > 65 ? "34%" : o.risk > 30 ? "16%" : "6%", w: o.risk > 65 ? 34 : 12 },
    { k: "Customer", v: o.newCust ? "First order" : "Repeat buyer", w: o.newCust ? 22 : 0 },
    { k: "Order value", v: inr(o.value), w: o.value > 1200 ? 14 : 4 },
    { k: "Address quality", v: o.risk > 75 ? "No landmark, short" : "Complete", w: o.risk > 75 ? 12 : 2 },
    { k: "Payment", v: o.mode, w: o.mode === "COD" ? 10 : 0 },
  ];
}

function OrdersTab({ orders, setOrders }: { orders: Order[]; setOrders: React.Dispatch<React.SetStateAction<Order[]>> }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<string | null>(null);
  const [ndrDone, setNdrDone] = React.useState<Record<string, string>>({});
  const order = orders.find((o) => o.id === open) ?? null;
  const update = (id: string, patch: Partial<Order>) => setOrders((cur) => cur.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  const cod = orders.filter((o) => o.mode === "COD").length;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Orders today" value="1,286" delta="+14%" hint="vs last Tuesday" icon={ShoppingBag} trend={[820, 910, 980, 1040, 1110, 1190, 1286]} />
        <Stat label="COD share" value={`${Math.round((38 * cod) / seedCod)}%`} delta="-4%" deltaGood hint="prepaid nudges working" icon={IndianRupee} tone="warn" trend={[46, 45, 43, 42, 41, 40, 38]} />
        <Stat label="RTO rate, 30 days" value="14.2%" delta="-1.8%" deltaGood hint="₹3.8 L of goods returned" icon={RotateCcw} tone="late" trend={[17.8, 17.1, 16.4, 15.9, 15.2, 14.6, 14.2]} />
        <Stat label="Open NDRs" value={ndrs.length - Object.keys(ndrDone).length} hint="act within 24 h or it's RTO" icon={Truck} tone="warn" />
      </div>
      <Panel title="Orders" sub="Risk scored by RTO Guard. Click a row to act on it.">
        <DataTable
          rows={orders}
          rowKey={(o) => o.id}
          search={(o) => `${o.id} ${o.name} ${o.city} ${o.pin} ${o.sku}`}
          searchPlaceholder="Search order, customer, pincode"
          filter={{ get: (o) => o.status, options: ["New", "Confirmed", "Shipped", "NDR", "RTO", "Delivered"] }}
          onRow={(o) => setOpen(o.id)}
          bulk={[
            {
              label: "Confirm on WhatsApp",
              run: (keys) => {
                setOrders((cur) => cur.map((o) => (keys.includes(o.id) && o.status === "New" ? { ...o, status: "Confirmed" } : o)));
                toast.success(`${keys.length} confirmation calls queued`, { description: "WhatsApp IVR: press 1 to confirm" });
                desk.log(`${keys.length} orders sent for WhatsApp confirmation`);
              },
            },
          ]}
          columns={[
            { key: "id", label: "Order", render: (o) => <span className="font-mono text-[12px] font-medium">{o.id}</span>, sort: (o) => o.id },
            { key: "who", label: "Customer", render: (o) => (<span><span className="font-medium">{o.name}</span><span className="block text-[11.5px] text-d-mute">{o.city} · {o.pin}</span></span>), sort: (o) => o.name },
            { key: "sku", label: "SKU", render: (o) => <span className="text-d-mute">{o.qty} × {o.sku}</span>, wide: true },
            { key: "val", label: "Value", align: "right", render: (o) => <span className="tnum font-mono">{inr(o.value)}</span>, sort: (o) => o.value },
            { key: "mode", label: "Pay", render: (o) => <Pill tone={o.mode === "COD" ? "warn" : "ok"}>{o.mode}</Pill> },
            {
              key: "risk",
              label: "RTO risk",
              render: (o) => (
                <div className="flex min-w-[100px] items-center gap-2">
                  <Meter value={o.risk} tone={o.risk >= 70 ? "late" : o.risk >= 35 ? "warn" : "ok"} />
                  <span className="tnum w-6 font-mono text-[11.5px]">{o.risk}</span>
                </div>
              ),
              sort: (o) => o.risk,
            },
            { key: "st", label: "Status", render: (o) => <Pill tone={statusTone[o.status]}>{o.status}</Pill> },
            { key: "ch", label: "Channel", render: (o) => <span className="text-[12px] text-d-mute">{o.channel}</span>, wide: true },
          ]}
        />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <Panel icon={Truck} title="NDR queue" sub="Failed deliveries from Shiprocket. Act today or they turn into RTO.">
          <ul className="divide-y divide-d-line">
            {ndrs.map((n) => (
              <li key={n.awb} className="flex flex-wrap items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-medium">
                    {n.name} <span className="font-normal text-d-mute">· {n.city} · {inr(n.value)}</span>
                  </p>
                  <p className="truncate text-[12px] text-d-mute">
                    {n.reason} · attempt {n.attempts} · {n.courier} <span className="font-mono">{n.awb}</span>
                  </p>
                </div>
                {ndrDone[n.awb] ? (
                  <Pill tone={ndrDone[n.awb] === "RTO" ? "late" : "ok"}>{ndrDone[n.awb]}</Pill>
                ) : (
                  <span className="flex gap-1.5">
                    <Btn size="sm" icon={Phone} onClick={() => { setNdrDone((s) => ({ ...s, [n.awb]: "Called" })); toast(`Calling ${n.name}`, { description: "WhatsApp call from CX, then re-attempt" }); desk.log(`NDR call to ${n.name}, ${n.city}`); }}>Call</Btn>
                    <Btn size="sm" variant="solid" onClick={() => { setNdrDone((s) => ({ ...s, [n.awb]: "Re-attempt booked" })); toast.success("Re-attempt booked", { description: `${n.courier} · tomorrow` }); desk.log(`NDR re-attempt booked for ${n.awb}`, "ok"); }}>Re-attempt</Btn>
                    <Btn size="sm" variant="ghost" onClick={() => { setNdrDone((s) => ({ ...s, [n.awb]: "RTO" })); desk.log(`${n.awb} marked RTO`, "late"); }}>RTO</Btn>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel icon={AlertTriangle} title="RTO by pincode cluster" sub="COD returns, last 30 days">
          <HBars format={(v) => `${v}%`} max={45} data={[{ label: "Aligarh 2020xx", value: 41 }, { label: "Gorakhpur 2730xx", value: 38 }, { label: "Meerut 2500xx", value: 34 }, { label: "Bareilly 2430xx", value: 31 }, { label: "Patna 8000xx", value: 27 }, { label: "Varanasi 2210xx", value: 25 }, { label: "Lucknow 2260xx", value: 19 }, { label: "Bengaluru 5600xx", value: 6 }].map((d) => ({ ...d, tone: d.value > 30 ? ("late" as const) : d.value > 15 ? ("warn" as const) : ("ok" as const) }))} />
        </Panel>
      </div>
      <Panel title="RTO trend" sub="COD vs prepaid, weekly">
        <AreaChart labels={["W35", "W36", "W37", "W38", "W39", "W40", "W41", "W42"]} series={[{ name: "COD RTO %", data: [24, 23, 25, 22, 21, 20, 19, 18], tone: "late" }, { name: "Prepaid RTO %", data: [3.1, 2.8, 3.3, 2.9, 2.6, 2.7, 2.4, 2.5], tone: "ok" }]} format={(v) => `${v}%`} height={170} />
      </Panel>
      <Sheet
        open={!!order}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={order ? `${order.channel} · placed ${order.placed}` : ""}
        title={order ? `${order.id} · ${order.name}` : ""}
        sub={order ? `${order.city} ${order.pin} · ${order.qty} × ${skuName(order.sku)}` : ""}
        footer={
          order && (
            <>
              <Btn variant="ghost" onClick={() => { update(order.id, { status: "Cancelled" }); toast("Order cancelled", { description: order.id }); desk.log(`${order.id} cancelled`, "late"); setOpen(null); }}>Cancel order</Btn>
              <Btn icon={MessageCircle} onClick={() => { update(order.id, { status: "Confirmed" }); toast.success("Confirmed on WhatsApp", { description: order.name }); desk.log(`${order.id} confirmed on WhatsApp`, "ok"); }}>Confirm</Btn>
              {order.mode === "COD" && (
                <Btn variant="solid" icon={Send} onClick={() => { update(order.id, { mode: "Prepaid", risk: Math.max(3, Math.round(order.risk / 6)), status: "Confirmed" }); toast.success("Paid by UPI", { description: `${order.name} took ₹50 off and paid ${inr(order.value - 50)}` }); desk.log(`${order.id} converted COD → prepaid`, "ok"); }}>
                  Send prepaid link (₹50 off)
                </Btn>
              )}
            </>
          )
        }
      >
        {order && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 rounded-[14px] border border-d-line p-4">
              <div className="text-center">
                <p className="desk-h tnum text-[40px] font-semibold leading-none" style={{ color: order.risk >= 70 ? "var(--d-late)" : order.risk >= 35 ? "var(--d-warn)" : "var(--d-ok)" }}>
                  {order.risk}
                </p>
                <p className="text-[11px] text-d-mute">RTO risk</p>
              </div>
              <p className="text-[13px] leading-snug text-d-mute">
                {order.risk >= 70 ? "Held for confirmation. Similar orders from this pincode came back 1 in 3 times." : order.risk >= 35 ? "Medium risk. A confirmation message is usually enough." : "Low risk. Ships in the next wave."}
              </p>
            </div>
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">What drives the score</p>
              <ul className="space-y-2">
                {riskFactors(order).map((f) => (
                  <li key={f.k} className="grid grid-cols-[140px_1fr_40px] items-center gap-3 text-[12.5px]">
                    <span className="text-d-mute">{f.k}</span>
                    <span className="truncate font-medium">{f.v}</span>
                    <span className="tnum text-right font-mono text-[11.5px]">+{f.w}</span>
                  </li>
                ))}
              </ul>
            </div>
            <KV items={[{ k: "Status", v: <Pill tone={statusTone[order.status]}>{order.status}</Pill> }, { k: "Payment", v: order.mode }, { k: "Value", v: inr(order.value) }, { k: "Customer", v: order.newCust ? "First order" : "Repeat" }]} />
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Ads ---------------- */

function AdsTab({ campaigns, setCampaigns }: { campaigns: Campaign[]; setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>> }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<string | null>(null);
  const [budget, setBudget] = React.useState(0);
  const [shifted, setShifted] = React.useState(false);
  const [platform, setPlatform] = React.useState<"All" | Platform>("All");
  const camp = campaigns.find((c) => c.id === open) ?? null;
  const live = campaigns.filter((c) => c.status !== "Paused");
  const spend = live.reduce((a, c) => a + c.spend, 0);
  const rev = live.reduce((a, c) => a + c.spend * c.roas, 0);
  const shown = campaigns.filter((c) => platform === "All" || c.platform === platform);

  function setStatus(c: Campaign, status: Campaign["status"]) {
    setCampaigns((cur) => cur.map((x) => (x.id === c.id ? { ...x, status, spend: status === "Paused" ? 0 : x.spend || Math.round(x.budget * 0.6) } : x)));
    toast.success(status === "Paused" ? `${c.name} paused` : `${c.name} live`, { description: `Pushed to ${c.platform} Ads` });
    desk.log(`${c.platform}: ${c.name} → ${status}`, status === "Paused" ? "warn" : "ok");
  }
  function scale(c: Campaign, pct: number) {
    setCampaigns((cur) => cur.map((x) => (x.id === c.id ? { ...x, budget: Math.round((x.budget * (100 + pct)) / 100) } : x)));
    toast.success(`${c.name} budget ${pct > 0 ? "+" : ""}${pct}%`, { description: `New daily cap ${inr(Math.round((c.budget * (100 + pct)) / 100))}` });
    desk.log(`${c.name} budget ${pct > 0 ? "+" : ""}${pct}%`);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Spend today" value={inr(spend, { compact: true })} hint={`${live.length} live ad sets`} icon={IndianRupee} trend={[1.1, 1.2, 1.15, 1.25, 1.3, 1.28, spend / 1e5]} />
        <Stat label="Blended ROAS" value={`${(rev / Math.max(1, spend)).toFixed(1)}×`} delta="+0.2" icon={TrendingUp} tone="ok" trend={[2.7, 2.8, 2.9, 3.0, 3.0, 3.1, rev / Math.max(1, spend)]} />
        <Stat label="Blended CAC" value="₹284" delta="-₹19" deltaGood hint="new customers only" icon={Users} />
        <Stat label="Below 1.5 ROAS" value={live.filter((c) => c.roas < 1.5).length} hint="candidates to pause" icon={AlertTriangle} tone="late" />
      </div>
      <Panel
        title="Ad sets"
        sub="Pause, resume or scale. Click a row for the trend and a budget slider."
        action={<Segmented size="sm" options={["All", "Meta", "Google"] as const} value={platform} onChange={setPlatform} />}
      >
        <DataTable
          rows={shown}
          rowKey={(c) => c.id}
          search={(c) => `${c.name} ${c.id}`}
          searchPlaceholder="Search campaign"
          filter={{ get: (c) => c.status, options: ["Active", "Learning", "Paused"] }}
          onRow={(c) => { setOpen(c.id); setBudget(c.budget); }}
          columns={[
            { key: "name", label: "Ad set", render: (c) => (<span><span className="font-medium">{c.name}</span><span className="block font-mono text-[11px] text-d-mute">{c.platform} · {c.obj}</span></span>), sort: (c) => c.name },
            { key: "spend", label: "Spend / cap", align: "right", render: (c) => <span className="tnum font-mono text-[12.5px]">{inr(c.spend, { compact: true })} / {inr(c.budget, { compact: true })}</span>, sort: (c) => c.spend },
            { key: "roas", label: "ROAS", align: "right", render: (c) => <span className="tnum font-mono font-semibold" style={{ color: c.roas >= 3 ? "var(--d-ok)" : c.roas >= 1.5 ? "var(--d-warn)" : "var(--d-late)" }}>{c.roas.toFixed(1)}×</span>, sort: (c) => c.roas },
            { key: "cpa", label: "CPA", align: "right", render: (c) => <span className="tnum font-mono">{inr(c.cpa)}</span>, sort: (c) => c.cpa, wide: true },
            { key: "trend", label: "7 days", render: (c) => <div className="w-20"><Sparkline data={c.trend} tone={c.trend[6] >= c.trend[0] ? "ok" : "late"} height={22} /></div>, wide: true },
            { key: "st", label: "Status", render: (c) => <Pill tone={c.status === "Active" ? "ok" : c.status === "Learning" ? "info" : "neutral"}>{c.status}</Pill> },
            {
              key: "act",
              label: "",
              align: "right",
              render: (c) => (
                <span className="inline-flex gap-1" onClick={(e) => e.stopPropagation()}>
                  {c.status === "Paused" ? <Btn size="sm" icon={Play} onClick={() => setStatus(c, "Active")}>Resume</Btn> : <Btn size="sm" icon={Pause} onClick={() => setStatus(c, "Paused")}>Pause</Btn>}
                  {c.status !== "Paused" && <Btn size="sm" variant="soft" onClick={() => scale(c, 20)}>+20%</Btn>}
                </span>
              ),
            },
          ]}
        />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Spend vs revenue" sub="Last 14 days, ₹ lakh, all platforms">
          <AreaChart
            labels={["7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"].map((d) => `${d} Oct`)}
            series={[
              { name: "Ad-attributed revenue", data: [3.4, 3.6, 3.3, 3.9, 4.1, 4.4, 4.0, 3.8, 4.2, 4.5, 4.7, 4.3, 4.6, rev / 1e5], tone: "accent" },
              { name: "Spend", data: [1.1, 1.15, 1.1, 1.2, 1.25, 1.3, 1.22, 1.18, 1.26, 1.32, 1.35, 1.29, 1.31, spend / 1e5], tone: "warn" },
            ]}
            format={(v) => `₹${v.toFixed(1)} L`}
            height={190}
          />
        </Panel>
        <Panel title="Suggested move" sub="Ad Pilot, inside your ±20% rule" live>
          <p className="text-[13.5px] leading-relaxed">
            Move <b>₹14,200/day</b> from <b>Shatavari UGC</b> (1.4×, frequency 3.9) to <b>Sleep Ritual Kit · Diwali</b> (5.6×). Expected <b>+₹52k revenue a day</b> at the same spend.
          </p>
          <div className="mt-3 flex items-center gap-2">
            {shifted ? (
              <Pill tone="ok">Shifted · Arjun notified</Pill>
            ) : (
              <Btn
                variant="solid"
                icon={Zap}
                onClick={() => {
                  setShifted(true);
                  setCampaigns((cur) => cur.map((x) => (x.id === "M-SHA-UGC" ? { ...x, status: "Paused", spend: 0 } : x.id === "M-SRK-GIFT" ? { ...x, budget: x.budget + 14200 } : x)));
                  toast.success("Budget shifted", { description: "₹14,200 moved to Sleep Ritual Kit" });
                  desk.log("Ad Pilot: ₹14.2k/day moved from Shatavari UGC to Sleep Kit", "ok");
                }}
              >
                Apply move
              </Btn>
            )}
          </div>
          <div className="mt-5">
            <p className="mb-2 text-[12px] font-medium text-d-mute">Creative fatigue</p>
            <ul className="space-y-1.5 text-[12.5px]">
              {[{ n: "Shatavari · 'Meri maa ka nuskha' UGC", f: 3.9, c: "-42% CTR" }, { n: "Brahmi · exam season static", f: 2.7, c: "-31% CTR" }, { n: "Kumkumadi · before/after carousel", f: 1.8, c: "-12% CTR" }].map((x) => (
                <li key={x.n} className="flex items-center justify-between gap-2 rounded-[10px] bg-d-sunk/70 px-3 py-1.5">
                  <span className="truncate">{x.n}</span>
                  <span className="shrink-0 font-mono text-[11px] text-d-late">f {x.f} · {x.c}</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>
      <Sheet
        open={!!camp}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={camp ? `${camp.platform} · ${camp.obj} · ${camp.id}` : ""}
        title={camp?.name ?? ""}
        sub={camp ? `${camp.status} · CTR ${camp.ctr}% · frequency ${camp.freq}` : ""}
        footer={
          camp && (
            <>
              <Btn onClick={() => setStatus(camp, camp.status === "Paused" ? "Active" : "Paused")}>{camp.status === "Paused" ? "Resume" : "Pause"}</Btn>
              <Btn
                variant="solid"
                onClick={() => {
                  setCampaigns((cur) => cur.map((x) => (x.id === camp.id ? { ...x, budget } : x)));
                  toast.success("Daily budget saved", { description: `${camp.name}: ${inr(budget)}` });
                  desk.log(`${camp.name} daily budget → ${inr(budget)}`);
                  setOpen(null);
                }}
              >
                Save budget
              </Btn>
            </>
          )
        }
      >
        {camp && (
          <div className="space-y-5">
            <KV items={[{ k: "ROAS", v: `${camp.roas.toFixed(1)}×` }, { k: "CPA", v: inr(camp.cpa) }, { k: "Spend today", v: inr(camp.spend) }, { k: "Revenue today", v: inr(camp.spend * camp.roas) }]} />
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">ROAS, last 7 days</p>
              <Bars height={120} format={(v) => `${v.toFixed(1)}×`} data={camp.trend.map((v, i) => ({ label: ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"][i], value: v, tone: v >= 3 ? "ok" : v >= 1.5 ? "warn" : "late" }))} />
            </div>
            <Field label={`Daily budget: ${inr(budget)} (was ${inr(camp.budget)})`}>
              <input type="range" min={Math.round(camp.budget * 0.5)} max={Math.round(camp.budget * 1.5)} step={500} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full accent-[var(--d-accent)]" />
            </Field>
            <p className="rounded-[12px] bg-d-soft px-3 py-2 text-[12.5px]">
              At {camp.roas.toFixed(1)}× this budget would bring about <b>{inr(budget * camp.roas, { compact: true })}</b> a day. Changes over ±20% go to Kavya for approval.
            </p>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Inventory ---------------- */

function InventoryTab({ skus, setSkus, pos, setPOs }: { skus: Sku[]; setSkus: React.Dispatch<React.SetStateAction<Sku[]>>; pos: InboundPO[]; setPOs: React.Dispatch<React.SetStateAction<InboundPO[]>> }) {
  const desk = useDesk();
  const [reorder, setReorder] = React.useState<Sku | null>(null);
  const [qty, setQty] = React.useState("3000");
  const [vendor, setVendor] = React.useState("Chamundi Herbals, Mysuru");
  const units = skus.reduce((a, s) => a + s.stock, 0);
  const value = skus.reduce((a, s) => a + s.stock * s.cogs, 0);
  const inbound = pos.filter((p) => p.stage !== "received");
  const locs: Loc[] = ["Hoskote", "Bhiwandi 3PL", "Gurugram 3PL"];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Units on hand" value={num(units)} hint="3 warehouses" icon={Boxes} />
        <Stat label="Stock value (at cost)" value={inr(value, { compact: true })} delta="+6%" deltaGood={false} hint="Moringa overstock" icon={IndianRupee} trend={[15.2, 15.8, 16.1, 16.4, 16.6, 16.9, value / 1e5]} />
        <Stat label="SKUs under 7 days" value={skus.filter((s) => cover(s) < 7).length} hint="BRG30, KUM30" icon={PackageX} tone="late" />
        <Stat label="Inbound POs" value={inbound.length} hint={inr(inbound.reduce((a, p) => a + p.value, 0), { compact: true })} icon={Truck} tone="info" />
      </div>
      <Panel title="Days of cover" sub="Stock ÷ 7-day average daily sales. Raise a PO straight to the manufacturer.">
        <DataTable
          rows={skus}
          rowKey={(s) => s.code}
          search={(s) => `${s.code} ${s.name}`}
          searchPlaceholder="Search SKU"
          filter={{ get: (s) => s.loc, options: locs }}
          onRow={(s) => setReorder(s)}
          columns={[
            { key: "sku", label: "SKU", render: (s) => (<span className="flex items-center gap-2.5"><span className="h-7 w-7 shrink-0 rounded-[8px]" style={{ background: s.color }} /><span><span className="font-medium">{s.name}</span><span className="block font-mono text-[11px] text-d-mute">{s.code} · {s.cat}</span></span></span>), sort: (s) => s.name },
            { key: "loc", label: "Warehouse", render: (s) => <span className="text-d-mute">{s.loc}</span>, wide: true },
            { key: "stock", label: "On hand", align: "right", render: (s) => <span className="tnum font-mono">{num(s.stock)}</span>, sort: (s) => s.stock },
            { key: "rate", label: "Per day", align: "right", render: (s) => <span className="tnum font-mono">{s.perDay}</span>, sort: (s) => s.perDay },
            {
              key: "cover",
              label: "Cover",
              render: (s) => {
                const c = cover(s);
                const t: Tone = c < 4 ? "late" : c < 9 ? "warn" : c > 45 ? "info" : "ok";
                return (
                  <div className="flex min-w-[130px] items-center gap-2">
                    <Meter value={Math.min(c, 40)} max={40} tone={t} />
                    <span className="tnum w-12 font-mono text-[11.5px]" style={{ color: `var(--d-${t})` }}>{c.toFixed(1)}d</span>
                  </div>
                );
              },
              sort: (s) => cover(s),
            },
            { key: "in", label: "Inbound", render: (s) => { const p = pos.find((x) => x.sku === s.code && x.stage !== "received"); return p ? <Pill tone="info">{num(p.qty)} · {p.eta}</Pill> : <span className="text-d-mute">—</span>; } },
          ]}
        />
      </Panel>
      <Panel title="Inbound purchase orders" sub="Drag a card as the manufacturer moves it along. Received stock is added to the warehouse.">
        <Board
          columns={stageCols}
          items={pos}
          itemKey={(p) => p.po}
          getColumn={(p) => p.stage}
          minColumnWidth={200}
          onMove={(key, col) => {
            const p = pos.find((x) => x.po === key);
            if (!p || p.stage === col) return;
            setPOs((cur) => cur.map((x) => (x.po === key ? { ...x, stage: col as Stage } : x)));
            if (col === "received" && p.stage !== "received") {
              setSkus((cur) => cur.map((s) => (s.code === p.sku ? { ...s, stock: s.stock + p.qty } : s)));
              toast.success(`GRN done: ${num(p.qty)} × ${p.sku}`, { description: "Stock added in Unicommerce" });
              desk.log(`GRN ${p.po}: ${num(p.qty)} ${p.sku} received`, "ok");
            } else {
              toast(`${p.po} → ${stageCols.find((c) => c.id === col)?.label}`);
              desk.log(`${p.po} moved to ${col}`);
            }
          }}
          renderCard={(p) => (
            <div>
              <p className="font-mono text-[11px] text-d-mute">{p.po}</p>
              <p className="mt-0.5 text-[13px] font-semibold leading-snug">{num(p.qty)} × {skuName(p.sku)}</p>
              <p className="mt-1 text-[11.5px] text-d-mute">{p.vendor}</p>
              <div className="mt-2 flex items-center justify-between text-[11.5px]">
                <span className="tnum font-mono">{inr(p.value, { compact: true })}</span>
                <span className="text-d-mute">ETA {p.eta}</span>
              </div>
            </div>
          )}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel icon={Warehouse} title="Stock by warehouse" sub="Units by category">
          <Bars
            height={180}
            data={locs.map((l) => {
              const at = skus.filter((s) => s.loc === l);
              const by = (c: Cat) => at.filter((s) => s.cat === c).reduce((a, s) => a + s.stock, 0);
              return { label: l, value: at.reduce((a, s) => a + s.stock, 0), stack: [{ name: "Supplements", value: by("Supplements"), tone: "accent" as const }, { name: "Skin", value: by("Skin"), tone: "warn" as const }, { name: "Hair & body", value: by("Hair & body"), tone: "ok" as const }, { name: "Foods", value: by("Foods"), tone: "info" as const }, { name: "Kits", value: by("Kits"), tone: "late" as const }] };
            })}
          />
        </Panel>
        <Panel icon={PackageCheck} title="3PL performance" sub="Same-day dispatch, last 7 days">
          <ul className="space-y-3">
            {[{ l: "Hoskote (own)", sla: 97, orders: 820, note: "Delhivery pickup 4 PM" }, { l: "Bhiwandi · Shiprocket Fulfilment", sla: 84, orders: 310, note: "Slipped since Friday: short staff" }, { l: "Gurugram · Amazon FBA", sla: 99, orders: 290, note: "Prime eligible" }].map((w) => (
              <li key={w.l}>
                <div className="flex items-baseline justify-between text-[13px]">
                  <span className="font-medium">{w.l}</span>
                  <span className="tnum font-mono text-[12px]" style={{ color: w.sla < 90 ? "var(--d-late)" : "var(--d-ok)" }}>{w.sla}%</span>
                </div>
                <Meter value={w.sla} tone={w.sla < 90 ? "late" : "ok"} className="mt-1" />
                <p className="mt-1 text-[11.5px] text-d-mute">{w.orders} orders/day · {w.note}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <Modal open={!!reorder} onOpenChange={(o) => !o && setReorder(null)} title={reorder ? `Reorder ${reorder.code}` : ""} sub={reorder ? `${reorder.name} · ${cover(reorder).toFixed(1)} days of cover · ${reorder.perDay}/day` : ""}>
        {reorder && (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const q = Number(qty) || 1000;
              const po: InboundPO = { po: `PO-WGW-${1186 + pos.length}`, sku: reorder.code, qty: q, vendor, stage: "raised", eta: "4 Nov", value: q * reorder.cogs };
              setPOs((cur) => [...cur, po]);
              toast.success(`${po.po} raised`, { description: `${num(q)} × ${reorder.code} · ${inr(po.value, { compact: true })} · sent to ${vendor.split(",")[0]} on WhatsApp` });
              desk.log(`PO raised: ${num(q)} ${reorder.code} from ${vendor.split(",")[0]}`, "info");
              setReorder(null);
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <Field label="Quantity (units)">
                <input className={inputClass} inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))} />
              </Field>
              <Field label="Manufacturer">
                <select className={inputClass} value={vendor} onChange={(e) => setVendor(e.target.value)}>
                  {["Chamundi Herbals, Mysuru", "Sahyadri Naturals, Belagavi", "Nandi Gummies Co., Hosur"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </Field>
            </div>
            <p className="rounded-[12px] bg-d-soft px-3 py-2 text-[12.5px]">
              {num(Number(qty) || 0)} units adds <b>{((Number(qty) || 0) / reorder.perDay).toFixed(0)} days</b> of cover. Value at cost {inr((Number(qty) || 0) * reorder.cogs)}. Lead time about 14 days.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <Btn onClick={() => setReorder(null)}>Cancel</Btn>
              <Btn variant="solid" type="submit" icon={Plus}>Raise PO</Btn>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

/* ---------------- Reviews & support ---------------- */

function ReviewsTab({ tickets, setTickets }: { tickets: Ticket[]; setTickets: React.Dispatch<React.SetStateAction<Ticket[]>> }) {
  const desk = useDesk();
  const [reviews, setReviews] = React.useState(seedReviews);
  const [reply, setReply] = React.useState<Review | null>(null);
  const [draft, setDraft] = React.useState("");
  const [stars, setStars] = React.useState<"All" | "Under 3" | "4 and up">("All");
  const shown = reviews.filter((r) => (stars === "Under 3" ? r.stars < 3 : stars === "4 and up" ? r.stars >= 4 : true));
  const avg = reviews.reduce((a, r) => a + r.stars, 0) / reviews.length;

  function draftFor(r: Review) {
    if (r.stars >= 4) return `Thank you so much, ${r.who.split(" ")[0]}! Hearing this from ${r.city} made our Hoskote team's day. If you'd like, reply with your order ID and we'll add a little something to your next order. – Divya, Western Ghats Wellness`;
    return `Hi ${r.who.split(" ")[0]}, we're sorry this wasn't what you expected. ${r.sku === "SHA60" ? "Shatavari usually takes 8–12 weeks to show results; Dr. Meera, our BAMS consultant, would like to offer you a free 15-minute consult." : "We've already sent a fresh replacement, no need to return the old one."} Please WhatsApp us on 80-4718-2290 so we can make it right. – Divya`;
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open tickets" value={tickets.filter((t) => t.col !== "resolved").length} hint="WhatsApp, email, Instagram" icon={MessagesSquare} />
        <Stat label="First reply time" value="38 min" delta="-12 min" deltaGood icon={Timer} tone="ok" trend={[74, 66, 58, 51, 47, 41, 38]} />
        <Stat label="Average rating, 30 days" value={avg.toFixed(1)} delta="-0.1" deltaGood={false} hint="gummies melting" icon={Star} tone="warn" />
        <Stat label="Unreplied reviews" value={reviews.filter((r) => !r.replied).length} hint="drafts ready" icon={MessageCircle} tone="late" />
      </div>
      <Panel title="Support tickets" sub="Drag between columns. Escalated goes to Dr. Meera or Sneha.">
        <Board
          columns={[{ id: "new", label: "New", tone: "info" }, { id: "waiting", label: "Waiting on customer", tone: "neutral" }, { id: "escalated", label: "Escalated", tone: "late" }, { id: "resolved", label: "Resolved", tone: "ok" }]}
          items={tickets}
          itemKey={(t) => t.id}
          getColumn={(t) => t.col}
          minColumnWidth={220}
          onMove={(key, col) => {
            setTickets((cur) => cur.map((t) => (t.id === key ? { ...t, col: col as TicketCol } : t)));
            const t = tickets.find((x) => x.id === key);
            if (col === "resolved") toast.success(`${key} resolved`, { description: t?.topic });
            desk.log(`Ticket ${key} → ${col}`, col === "resolved" ? "ok" : undefined);
          }}
          renderCard={(t) => (
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[11px] text-d-mute">{t.id}</span>
                <Pill tone={t.channel === "WhatsApp" ? "ok" : t.channel === "Instagram" ? "accent" : "info"}>{t.channel}</Pill>
                {t.priority === "High" && <Pill tone="late">High</Pill>}
              </div>
              <p className="mt-1.5 text-[13px] font-medium leading-snug">{t.topic}</p>
              <p className="mt-1 text-[11.5px] text-d-mute">
                {t.name} · {t.sku} · {t.age}
              </p>
            </div>
          )}
        />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Reviews" sub="Shopify (Judge.me), Amazon and Nykaa" action={<Segmented size="sm" options={["All", "Under 3", "4 and up"] as const} value={stars} onChange={setStars} />}>
          <ul className="space-y-2.5">
            {shown.map((r) => (
              <li key={r.id} className="rounded-[14px] border border-d-line p-3">
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="inline-flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className="h-3.5 w-3.5" fill={i < r.stars ? "var(--d-warn)" : "none"} stroke={i < r.stars ? "var(--d-warn)" : "var(--d-line)"} />
                    ))}
                  </span>
                  <span className="font-medium">{r.who}</span>
                  <span className="text-d-mute">· {r.city} · {r.platform} · {r.sku}</span>
                  <span className="ml-auto">
                    {r.replied ? (
                      <Pill tone="ok">Replied</Pill>
                    ) : (
                      <Btn size="sm" variant={r.stars < 3 ? "solid" : "soft"} icon={Sparkles} onClick={() => { setReply(r); setDraft(draftFor(r)); }}>
                        Reply
                      </Btn>
                    )}
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] leading-snug">{r.text}</p>
              </li>
            ))}
          </ul>
        </Panel>
        <div className="space-y-5">
          <Panel title="Rating mix" sub="Last 30 days, 1,142 reviews">
            <Bars height={150} data={[{ label: "5★", value: 612, tone: "ok" }, { label: "4★", value: 288, tone: "ok" }, { label: "3★", value: 104, tone: "warn" }, { label: "2★", value: 71, tone: "late" }, { label: "1★", value: 67, tone: "late" }]} />
          </Panel>
          <Panel title="What people complain about" sub="Topics from tickets and low reviews">
            <Donut center="214" sub="issues" segments={[{ label: "Delivery delay", value: 68, tone: "warn" }, { label: "Melted / leaked", value: 41, tone: "late" }, { label: "No effect yet", value: 38, tone: "info" }, { label: "Price", value: 36, tone: "accent" }, { label: "Wrong item", value: 31, tone: "neutral" }]} />
          </Panel>
        </div>
      </div>
      <Sheet
        open={!!reply}
        onOpenChange={(o) => !o && setReply(null)}
        eyebrow={reply ? `${reply.platform} · ${reply.stars}★ · ${reply.sku}` : ""}
        title={reply ? `Reply to ${reply.who}` : ""}
        sub={reply?.text}
        footer={
          <Btn
            variant="solid"
            icon={Send}
            onClick={() => {
              if (!reply) return;
              setReviews((cur) => cur.map((r) => (r.id === reply.id ? { ...r, replied: true } : r)));
              toast.success("Reply published", { description: `${reply.platform} · ${reply.who}` });
              desk.log(`Review reply published for ${reply.who} on ${reply.platform}`, "ok");
              setReply(null);
            }}
          >
            Publish reply
          </Btn>
        }
      >
        {reply && (
          <div className="space-y-4">
            <p className="flex items-center gap-1.5 text-[12px] text-d-mute">
              <Sparkles className="h-3.5 w-3.5 text-d-accent" /> Drafted by Review Responder in Divya&apos;s voice. Edit freely.
            </p>
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={8} className="w-full rounded-[12px] border border-d-line bg-d-panel p-3 text-[13.5px] leading-relaxed outline-none focus:border-d-accent" />
            <KV items={[{ k: "Customer orders", v: reply.stars < 3 ? "1" : "3" }, { k: "Replacement", v: reply.stars < 3 ? "Offered" : "Not needed" }]} />
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Cohorts ---------------- */

function CohortsTab() {
  const desk = useDesk();
  const [open, setOpen] = React.useState<Segment | null>(null);
  const [sent, setSent] = React.useState<Set<string>>(new Set());
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Repeat rate, 90 days" value="31%" delta="+4%" icon={Repeat} tone="ok" trend={[24, 25, 27, 27, 29, 30, 31]} />
        <Stat label="6-month LTV" value="₹1,940" delta="+₹160" icon={IndianRupee} trend={[1610, 1680, 1720, 1790, 1850, 1900, 1940]} />
        <Stat label="LTV : CAC" value="6.8×" delta="+0.6" hint="CAC ₹284" icon={TrendingUp} tone="ok" />
        <Stat label="Subscribers" value="2,184" delta="+212" hint="Ashwagandha mostly" icon={Users} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <Panel title="Repeat rate by first-order month" sub="Share of each cohort that has ordered again by month N. Click a cell.">
          <HeatGrid rows={cohortRows.map((r, i) => `${r} · ${num(cohortSize[i])}`)} cols={cohortCols} values={cohortVals} format={(v) => (v ? `${v}%` : "·")} onCell={(r, c) => (cohortVals[r][c] ? toast(`${cohortRows[r]} cohort, ${cohortCols[c]}`, { description: `${cohortVals[r][c]}% repeated · ${num(Math.round((cohortSize[r] * cohortVals[r][c]) / 100))} customers` }) : toast("Not reached yet", { description: `${cohortRows[r]} cohort hasn't reached ${cohortCols[c]}` }))} />
        </Panel>
        <Panel title="LTV by first product" sub="Cumulative revenue per customer, ₹">
          <AreaChart
            labels={["M0", "M1", "M2", "M3", "M4", "M5", "M6"]}
            series={[
              { name: "Ashwagandha first", data: [749, 1120, 1480, 1790, 2060, 2280, 2450], tone: "accent" },
              { name: "Skin first", data: [1099, 1290, 1420, 1530, 1600, 1660, 1700], tone: "warn" },
              { name: "All customers", data: [812, 1060, 1290, 1480, 1650, 1810, 1940], tone: "neutral", dashed: true },
            ]}
            format={(v) => inr(v)}
            height={200}
          />
        </Panel>
      </div>
      <Panel title="Segments" sub="Built nightly from Shopify and marketplaces. Select to send a WhatsApp journey.">
        <DataTable
          rows={segments}
          rowKey={(s) => s.name}
          search={(s) => s.name}
          searchPlaceholder="Search segment"
          onRow={setOpen}
          bulk={[{ label: "Send WhatsApp journey", run: (keys) => { setSent((s) => new Set([...s, ...keys])); toast.success(`Journey queued for ${keys.length} segments`, { description: "Sends at 7 PM, when replies peak" }); desk.log(`Win-back journey queued for ${keys.length} segments`, "info"); } }]}
          columns={[
            { key: "name", label: "Segment", render: (s) => (<span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: `var(--d-${s.tone === "neutral" ? "mute" : s.tone})` }} /><span className="font-medium">{s.name}</span></span>), sort: (s) => s.name },
            { key: "size", label: "Customers", align: "right", render: (s) => <span className="tnum font-mono">{num(s.size)}</span>, sort: (s) => s.size },
            { key: "aov", label: "AOV", align: "right", render: (s) => <span className="tnum font-mono">{inr(s.aov)}</span>, sort: (s) => s.aov, wide: true },
            { key: "ltv", label: "LTV", align: "right", render: (s) => <span className="tnum font-mono">{inr(s.ltv)}</span>, sort: (s) => s.ltv },
            { key: "last", label: "Last order", render: (s) => <span className="text-d-mute">{s.last}</span>, wide: true },
            { key: "play", label: "Play", render: (s) => (sent.has(s.name) ? <Pill tone="info">Queued</Pill> : <span className="text-[12px]">{s.play}</span>) },
          ]}
        />
      </Panel>
      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow="Segment"
        title={open?.name ?? ""}
        sub={open ? `${num(open.size)} customers · last order ${open.last} ago on median` : ""}
        footer={
          <Btn
            variant="solid"
            icon={MessageCircle}
            onClick={() => {
              if (!open) return;
              setSent((s) => new Set(s).add(open.name));
              toast.success("Journey queued", { description: `${open.play} → ${num(open.size)} customers` });
              desk.log(`Journey "${open.play}" queued for ${open.name}`, "info");
              setOpen(null);
            }}
          >
            Send “{open?.play}”
          </Btn>
        }
      >
        {open && (
          <div className="space-y-5">
            <KV items={[{ k: "Average order", v: inr(open.aov) }, { k: "Lifetime value", v: inr(open.ltv) }, { k: "Segment value", v: inr(open.ltv * open.size, { compact: true }) }, { k: "Suggested play", v: open.play }]} />
            <div className="rounded-[14px] bg-[#e7f6e9] p-4 text-[13.5px] leading-relaxed text-[#1d3b22]">
              Namaste {"{first_name}"} 🌿 It&apos;s been a while! Your Ayurvedic routine misses you. {open.play} this week only, reply YES and we&apos;ll hold it for you. – Western Ghats Wellness
            </div>
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Expected response</p>
              <Bars height={110} format={(v) => `${v}%`} data={[{ label: "Read", value: 78, tone: "info" }, { label: "Clicked", value: 19, tone: "accent" }, { label: "Ordered", value: open.tone === "late" ? 4 : 8, tone: "ok" }]} />
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Catalogue & pricing ---------------- */

const channelFees: Record<Channel, { pct: number; fixed: number; ship: number; ads: number; note: string }> = {
  Shopify: { pct: 2, fixed: 0, ship: 62, ads: 0, note: "Razorpay 2%, Shiprocket ₹62, blended ad cost 18% of price (new + repeat orders)" },
  Amazon: { pct: 17, fixed: 70, ship: 0, ads: 60, note: "Referral 17%, FBA ₹70, sponsored ads" },
  Nykaa: { pct: 30, fixed: 0, ship: 45, ads: 40, note: "Commission 30%, Nykaa ships" },
  Flipkart: { pct: 15, fixed: 65, ship: 0, ads: 50, note: "Commission 15%, fulfilment ₹65" },
};
function margin(s: Sku, price: number, ch: Channel) {
  const f = channelFees[ch];
  const net = price / (1 + s.gst / 100);
  const fees = (price * f.pct) / 100 + f.fixed;
  const ads = ch === "Shopify" ? price * 0.18 : f.ads;
  const cm = net - s.cogs - fees - f.ship - ads;
  return { net, fees, ads, cm, pct: (cm / price) * 100 };
}

function CatalogueTab({ skus, setSkus }: { skus: Sku[]; setSkus: React.Dispatch<React.SetStateAction<Sku[]>> }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<Sku | null>(null);
  const [price, setPrice] = React.useState("0");
  const [ch, setCh] = React.useState<Channel>("Shopify");
  const p = Number(price) || 0;
  const m = open ? margin(open, p, ch) : null;
  const avgCm = skus.reduce((a, s) => a + margin(s, s.price, "Shopify").pct, 0) / skus.length;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Live SKUs" value={skus.length} hint="4 channels each" icon={Tag} />
        <Stat label="Avg contribution, site" value={`${avgCm.toFixed(0)}%`} delta="+2%" icon={BadgeIndianRupee} tone="ok" trend={[26, 27, 27, 28, 29, 29, avgCm]} />
        <Stat label="Price mismatches" value="1" hint="Nykaa sync down" icon={AlertTriangle} tone="late" />
        <Stat label="Avg rating" value={(skus.reduce((a, s) => a + s.rating, 0) / skus.length).toFixed(2)} hint={`${num(skus.reduce((a, s) => a + s.reviews, 0))} reviews`} icon={Star} tone="warn" />
      </div>
      <Panel title="Catalogue" sub="Selling price per channel and contribution margin after GST, fees, shipping and ad cost. Click to reprice.">
        <DataTable
          rows={skus}
          rowKey={(s) => s.code}
          search={(s) => `${s.code} ${s.name}`}
          searchPlaceholder="Search product"
          filter={{ get: (s) => s.cat, options: ["Supplements", "Skin", "Hair & body", "Foods", "Kits"] }}
          onRow={(s) => { setOpen(s); setPrice(String(s.price)); setCh("Shopify"); }}
          columns={[
            { key: "name", label: "Product", render: (s) => (<span className="flex items-center gap-2.5"><span className="h-7 w-7 shrink-0 rounded-full" style={{ background: s.color }} /><span><span className="font-medium">{s.name}</span><span className="block font-mono text-[11px] text-d-mute">{s.code} · GST {s.gst}%</span></span></span>), sort: (s) => s.name },
            { key: "mrp", label: "MRP", align: "right", render: (s) => <span className="tnum font-mono text-d-mute">{inr(s.mrp)}</span>, wide: true },
            { key: "site", label: "Site", align: "right", render: (s) => <span className="tnum font-mono font-medium">{inr(s.price)}</span>, sort: (s) => s.price },
            { key: "amz", label: "Amazon", align: "right", render: (s) => <span className="tnum font-mono">{inr(s.amazon)}</span>, wide: true },
            { key: "nyk", label: "Nykaa", align: "right", render: (s) => <span className="tnum font-mono" style={{ color: s.code === "KUM30" ? "var(--d-late)" : undefined }}>{inr(s.code === "KUM30" ? 1049 : s.nykaa)}</span>, wide: true },
            { key: "cm", label: "CM, site", align: "right", render: (s) => { const x = margin(s, s.price, "Shopify"); return <span className="tnum font-mono" style={{ color: x.pct < 15 ? "var(--d-late)" : x.pct < 25 ? "var(--d-warn)" : "var(--d-ok)" }}>{x.pct.toFixed(0)}%</span>; }, sort: (s) => margin(s, s.price, "Shopify").pct },
            { key: "rt", label: "Rating", align: "right", render: (s) => <span className="tnum font-mono text-[12px]">{s.rating.toFixed(1)}★</span>, sort: (s) => s.rating },
          ]}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Contribution by channel" sub="Kumkumadi serum, per unit after everything">
          <HBars format={(v) => inr(v)} data={(["Shopify", "Amazon", "Nykaa", "Flipkart"] as Channel[]).map((c) => { const s = skus.find((x) => x.code === "KUM30")!; const pr = c === "Shopify" ? s.price : c === "Amazon" ? s.amazon : c === "Nykaa" ? 1049 : s.price - 30; const x = margin(s, pr, c); return { label: c, sub: inr(pr), value: Math.round(x.cm), tone: x.pct < 15 ? ("late" as const) : ("ok" as const) }; })} />
        </Panel>
        <Panel title="Bundles that work" sub="Attach rate on site, last 30 days">
          <ul className="divide-y divide-d-line">
            {[{ b: "Ashwagandha + Triphala", a: 18, aov: 998 }, { b: "Ubtan + Neem-Tulsi face wash", a: 14, aov: 678 }, { b: "Bhringraj + Mahanarayan oil", a: 9, aov: 848 }, { b: "Sleep Ritual Kit gift wrap", a: 22, aov: 1549 }].map((x) => (
              <li key={x.b} className="flex items-center justify-between gap-3 py-2.5 text-[13px]">
                <span className="font-medium">{x.b}</span>
                <span className="flex items-center gap-3">
                  <span className="tnum font-mono text-[12px] text-d-mute">AOV {inr(x.aov)}</span>
                  <Pill tone="accent" mono>{x.a}% attach</Pill>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={open ? `${open.code} · ${open.cat} · GST ${open.gst}%` : ""}
        title={open?.name ?? ""}
        sub={open ? `MRP ${inr(open.mrp)} · COGS ${inr(open.cogs)} · ${open.rating}★ from ${num(open.reviews)} reviews` : ""}
        footer={
          open && (
            <Btn
              variant="solid"
              icon={Tag}
              disabled={p <= 0 || p > open.mrp}
              onClick={() => {
                setSkus((cur) => cur.map((s) => (s.code !== open.code ? s : ch === "Shopify" ? { ...s, price: p } : ch === "Amazon" ? { ...s, amazon: p } : ch === "Nykaa" ? { ...s, nykaa: p } : s)));
                toast.success(`${open.code} on ${ch}: ${inr(p)}`, { description: `Contribution ${m ? inr(m.cm) : ""} a unit` });
                desk.log(`Price change: ${open.code} on ${ch} → ${inr(p)}`, "info");
                setOpen(null);
              }}
            >
              Push price to {ch}
            </Btn>
          )
        }
      >
        {open && m && (
          <div className="space-y-5">
            <Segmented size="sm" options={["Shopify", "Amazon", "Nykaa", "Flipkart"] as const} value={ch} onChange={(c) => { setCh(c); setPrice(String(c === "Amazon" ? open.amazon : c === "Nykaa" ? open.nykaa : open.price)); }} />
            <Field label={`Selling price on ${ch} (MRP ${inr(open.mrp)})`}>
              <input className={inputClass} inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} />
            </Field>
            <ul className="space-y-1.5 rounded-[14px] border border-d-line p-4 text-[13px]">
              {[
                { k: "Selling price", v: p },
                { k: `GST ${open.gst}%`, v: -(p - m.net) },
                { k: "COGS (Chamundi Herbals)", v: -open.cogs },
                { k: "Channel fees", v: -m.fees },
                { k: "Shipping", v: -channelFees[ch].ship },
                { k: "Ad cost per order", v: -m.ads },
              ].map((r) => (
                <li key={r.k} className="flex justify-between">
                  <span className="text-d-mute">{r.k}</span>
                  <span className="tnum font-mono">{r.v < 0 ? "−" : ""}{inr(Math.abs(r.v))}</span>
                </li>
              ))}
              <li className="flex justify-between border-t border-d-line pt-2 font-semibold">
                <span>Contribution</span>
                <span className="tnum font-mono" style={{ color: m.cm < 0 ? "var(--d-late)" : "var(--d-ok)" }}>
                  {inr(m.cm)} · {m.pct.toFixed(0)}%
                </span>
              </li>
            </ul>
            <p className="text-[12px] text-d-mute">{channelFees[ch].note}</p>
            <Meter value={Math.max(0, m.pct)} max={50} tone={m.pct < 15 ? "late" : m.pct < 25 ? "warn" : "ok"} />
          </div>
        )}
      </Sheet>
    </div>
  );
}
