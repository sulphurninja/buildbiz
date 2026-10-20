"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Calculator,
  CheckCheck,
  Coins,
  Crown,
  FlaskConical,
  Gauge as GaugeIcon,
  Gem,
  Hammer,
  Heart,
  IndianRupee,
  MessageCircle,
  Pause,
  PiggyBank,
  Play,
  Plug,
  Plus,
  Recycle,
  RotateCcw,
  Scale,
  ScanLine,
  Send,
  Sparkles,
  Timer,
  Users,
} from "lucide-react";
import { DeskShell, useDesk } from "../shell";
import { AreaChart, Bars, Donut, HBars } from "../charts";
import { AgingBar, Board, Checklist, Countdown, DataTable } from "../data";
import { AgentsModule, ConnectionsModule, IndependenceModule, PeopleModule } from "../common";
import { Btn, Feed, Field, inputClass, inr, KV, Meter, Modal, Panel, Pill, Segmented, Sheet, Stat } from "../ui";
import { useDrift } from "../hooks";
import type { DeskConfig, DeskModule, IndependenceData, Integration, TeamMember, Tone, WorkforceAgent } from "../types";

/** trig rounded so server and browser render identical SVG coordinates */
const trig = { cos: (a: number) => Math.round(Math.cos(a) * 1e6) / 1e6, sin: (a: number) => Math.round(Math.sin(a) * 1e6) / 1e6 };

/* ============================================================
   Data — Periyar Jewellers, Round South, Thrissur. Fictional
   22K gold & diamond showroom, 2 floors, 10 trays on the counter.
   Rates are the AKGSMA board rate, revised twice today.
   ============================================================ */

const BOARD_22K = 11240;
const PURITY: Record<Karat, number> = { "24K": 0.999, "22K": 0.916, "18K": 0.75, "14K": 0.585 };
type Karat = "24K" | "22K" | "18K" | "14K";
const rateFor = (k: Karat, r22: number) => Math.round((r22 / PURITY["22K"]) * PURITY[k]);

/** deterministic pseudo-random in 0..1 */
function rnd(i: number, seed: number) {
  // integer hash: identical on server and browser
  let t = Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(seed + 7, 0x85ebca6b);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const g3 = (v: number) => v.toFixed(3);

type Kind = "Bangles" | "Chains" | "Necklaces" | "Earrings" | "Rings";
type Piece = { id: string; name: string; tag: number; actual: number; away?: { note?: string } };
type Tray = { id: string; label: string; kind: Kind; karat: Karat; counter: string; pieces: Piece[] };

function mk(prefix: string, names: string[], n: number, lo: number, hi: number, seed: number, quirks: Record<number, Partial<Piece>> = {}): Piece[] {
  return Array.from({ length: n }, (_, i) => {
    const w = Math.round((lo + (hi - lo) * rnd(i, seed)) * 1000) / 1000;
    return { id: `${prefix}-${String(i + 1).padStart(3, "0")}`, name: names[i % names.length], tag: w, actual: w, ...quirks[i] };
  });
}

const seedTrays: Tray[] = [
  { id: "B1", label: "Plain & machine bangles", kind: "Bangles", karat: "22K", counter: "Counter 1", pieces: mk("PB", ["Plain kada", "Machine-cut bangle", "Kerala bangle", "Twisted bangle"], 12, 14.8, 31.6, 1) },
  { id: "B2", label: "Antique & temple bangles", kind: "Bangles", karat: "22K", counter: "Counter 1", pieces: mk("AB", ["Temple bangle", "Antique kada", "Nagas bangle", "Lakshmi bangle"], 10, 22.1, 38.4, 2, { 4: { away: { note: "On approval · Shiny Paul, slip AP-218" } } }) },
  { id: "C1", label: "Chains, 22K hallmarked", kind: "Chains", karat: "22K", counter: "Counter 2", pieces: mk("CH", ["Box chain", "Rope chain", "Cuban link", "Kerala thali chain", "Singapore chain"], 16, 4.2, 23.8, 3, { 7: { actual: 0 } }) },
  { id: "C2", label: "Kids chains & bracelets", kind: "Chains", karat: "22K", counter: "Counter 2", pieces: mk("KC", ["Baby bracelet", "Kids chain", "Arinjanam", "Kaapu"], 14, 1.9, 7.8, 4) },
  { id: "N1", label: "Palakka & kasu mala", kind: "Necklaces", karat: "22K", counter: "Bridal floor", pieces: mk("PN", ["Palakka mala", "Kasu mala", "Manga mala", "Nagapadam"], 8, 28.4, 72.6, 5, { 2: { away: { note: "With Manoj Achari for hook repair · KR-0912" } } }) },
  { id: "N2", label: "Light necklaces", kind: "Necklaces", karat: "22K", counter: "Counter 3", pieces: mk("LN", ["Choker", "Leaf necklace", "Kerala mullamottu", "Daily wear set"], 10, 11.6, 24.2, 6) },
  { id: "E1", label: "Jimikki & studs", kind: "Earrings", karat: "22K", counter: "Counter 3", pieces: mk("JM", ["Jimikki", "Kammal stud", "Chandbali", "Drop jhumka", "Mullamottu stud"], 24, 2.1, 9.4, 7, { 15: { away: {} } }) },
  { id: "E2", label: "Diamond earrings", kind: "Earrings", karat: "18K", counter: "Diamond lounge", pieces: mk("DE", ["Solitaire stud", "Cluster stud", "Huggie hoop", "Floral drop"], 12, 2.0, 5.2, 8) },
  { id: "R1", label: "Ladies rings", kind: "Rings", karat: "22K", counter: "Counter 4", pieces: mk("LR", ["Plain band", "Stone ring", "Leaf ring", "Cocktail ring", "Kerala rope ring"], 30, 2.0, 6.4, 9) },
  { id: "R2", label: "Gents & diamond rings", kind: "Rings", karat: "18K", counter: "Diamond lounge", pieces: mk("GR", ["Gents signet", "Diamond band", "Solitaire ring", "Engagement pair"], 18, 3.1, 9.2, 10, { 9: { actual: 0 } }) },
];
// Two real mismatches: a chain 0.384 g light (clasp replaced off the books) and a ring 0.214 g heavy (tag swap).
seedTrays[2].pieces[7].actual = Math.round((seedTrays[2].pieces[7].tag - 0.384) * 1000) / 1000;
seedTrays[9].pieces[9].actual = Math.round((seedTrays[9].pieces[9].tag + 0.214) * 1000) / 1000;

const presentOf = (t: Tray) => t.pieces.filter((p) => !p.away);
function seedScans(): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  seedTrays.forEach((t) => {
    const present = presentOf(t);
    const n = ["B1", "C2", "N2", "E2"].includes(t.id) ? present.length : t.id === "R1" ? 19 : t.id === "C1" ? 9 : 0;
    out[t.id] = present.slice(0, n).map((p) => p.id);
  });
  return out;
}

type TrayState = "Not started" | "Counting" | "Tallied" | "Mismatch";
function trayStats(t: Tray, scannedIds: string[]) {
  const set = new Set(scannedIds);
  const present = presentOf(t);
  const scanned = t.pieces.filter((p) => set.has(p.id));
  const expected = t.pieces.reduce((a, p) => a + p.tag, 0);
  const counted = scanned.reduce((a, p) => a + p.actual, 0);
  const flagged = scanned.filter((p) => Math.abs(p.actual - p.tag) > 0.02);
  const explained = t.pieces.filter((p) => p.away?.note);
  const missing = t.pieces.filter((p) => p.away && !p.away.note);
  const accounted = counted + explained.reduce((a, p) => a + p.tag, 0);
  const done = scanned.length === present.length;
  const state: TrayState = scanned.length === 0 ? "Not started" : !done ? "Counting" : flagged.length || missing.length ? "Mismatch" : "Tallied";
  return { expected, counted, accounted, flagged, explained, missing, done, state, scanned: scanned.length, present: present.length, diff: accounted - expected };
}
const stateTone: Record<TrayState, Tone> = { "Not started": "neutral", Counting: "info", Tallied: "ok", Mismatch: "late" };

type Sale = { time: string; who: string; text: string; tone?: Tone };
const counterSales: Sale[] = [
  { time: "12:41 PM", who: "Lissy", text: "Kasu mala 48.220 g to the Kunnamkulam family · ₹6.4 L, UPI + old gold", tone: "ok" },
  { time: "12:05 PM", who: "Counter 4", text: "2 ladies rings 7.810 g · ₹1.02 L, card", tone: "ok" },
  { time: "11:32 AM", who: "Diamond lounge", text: "Solitaire studs 0.30 ct pair, IGI cert · ₹1.86 L", tone: "accent" },
  { time: "11:10 AM", who: "Counter 2", text: "Baby bracelet 4.120 g for a 28th-day naming · ₹53,900", tone: "ok" },
  { time: "10:48 AM", who: "Old gold desk", text: "Exchange: 31.4 g old bangles at 21.6K, credited ₹3.39 L", tone: "info" },
  { time: "10:15 AM", who: "Counter 3", text: "Jimikki pair 6.880 g · ₹88,600, scheme redemption", tone: "ok" },
];

/* ---------- Rate & pricing ---------- */

type Design = { sku: string; name: string; kind: Kind; karat: Karat; wt: number; va: number; making: number; stone: number; huid: string };
const designs: Design[] = [
  { sku: "PJ-PM-118", name: "Palakka mala, green stones", kind: "Necklaces", karat: "22K", wt: 52.34, va: 12, making: 0, stone: 8400, huid: "8Q2KX1" },
  { sku: "PJ-KM-204", name: "Kasu mala, 61 coins", kind: "Necklaces", karat: "22K", wt: 48.22, va: 10, making: 0, stone: 0, huid: "8Q2L7A" },
  { sku: "PJ-NP-033", name: "Nagapadam thali necklace", kind: "Necklaces", karat: "22K", wt: 36.9, va: 14, making: 0, stone: 6200, huid: "8Q2M0D" },
  { sku: "PJ-MM-071", name: "Manga mala, ruby drops", kind: "Necklaces", karat: "22K", wt: 64.1, va: 13, making: 0, stone: 14800, huid: "8Q2N4C" },
  { sku: "PJ-JM-310", name: "Jimikki, pearl drop", kind: "Earrings", karat: "22K", wt: 6.88, va: 15, making: 0, stone: 1200, huid: "8Q2P9E" },
  { sku: "PJ-BG-412", name: "Machine-cut bangle pair", kind: "Bangles", karat: "22K", wt: 31.2, va: 7, making: 0, stone: 0, huid: "8Q2Q2F" },
  { sku: "PJ-BG-447", name: "Temple bangle, Lakshmi motif", kind: "Bangles", karat: "22K", wt: 34.6, va: 16, making: 0, stone: 0, huid: "8Q2R5G" },
  { sku: "PJ-CH-520", name: "Kerala thali chain, 20 in", kind: "Chains", karat: "22K", wt: 16.4, va: 6, making: 0, stone: 0, huid: "8Q2S1H" },
  { sku: "PJ-CH-544", name: "Rope chain, 22 in", kind: "Chains", karat: "22K", wt: 12.06, va: 8, making: 0, stone: 0, huid: "8Q2T8J" },
  { sku: "PJ-RG-611", name: "Kerala rope ring", kind: "Rings", karat: "22K", wt: 4.12, va: 9, making: 0, stone: 0, huid: "8Q2U3K" },
  { sku: "PJ-DR-702", name: "Diamond band, 0.24 ct", kind: "Rings", karat: "18K", wt: 3.84, va: 0, making: 950, stone: 46800, huid: "8Q2V6L" },
  { sku: "PJ-DE-744", name: "Solitaire studs, 0.30 ct pair", kind: "Earrings", karat: "18K", wt: 2.4, va: 0, making: 1100, stone: 158000, huid: "8Q2W0M" },
  { sku: "PJ-KB-803", name: "Baby arinjanam (waist chain)", kind: "Chains", karat: "22K", wt: 9.8, va: 9, making: 0, stone: 0, huid: "8Q2X4N" },
];
function priceOf(d: { wt: number; karat: Karat; va: number; making: number; stone: number }, r22: number) {
  const gold = d.wt * rateFor(d.karat, r22);
  const va = (gold * d.va) / 100;
  const making = d.making * d.wt;
  const huid = 45;
  const taxable = gold + va + making + d.stone + huid;
  const gst = taxable * 0.03;
  return { gold, va, making, stone: d.stone, huid, gst, total: taxable + gst };
}

/* ---------- Karigars ---------- */

type JobStage = "issued" | "bench" | "hallmark" | "qc" | "received";
type Job = { id: string; item: string; karigar: string; issued: number; finished: number; allowed: number; due: string; stage: JobStage; forOrder?: string };
const jobStages: { id: JobStage; label: string; tone: Tone; hint: string }[] = [
  { id: "issued", label: "Gold issued", tone: "warn", hint: "Weighed out, signed in the karigar book" },
  { id: "bench", label: "At the bench", tone: "info", hint: "Being made" },
  { id: "hallmark", label: "Hallmarking", tone: "accent", hint: "Thrissur assay centre, HUID" },
  { id: "qc", label: "Ready for QC", tone: "neutral", hint: "Weigh back and check finish" },
  { id: "received", label: "Received", tone: "ok", hint: "Wastage settled in the book" },
];
const seedJobs: Job[] = [
  { id: "KR-0931", item: "Palakka mala, bridal", karigar: "Manoj Achari", issued: 58.4, finished: 54.9, allowed: 6.5, due: "26 Oct", stage: "bench", forOrder: "BR-114" },
  { id: "KR-0932", item: "Kasu mala, 81 coins", karigar: "Sukumar Das", issued: 64.0, finished: 61.2, allowed: 5, due: "28 Oct", stage: "issued", forOrder: "BR-114" },
  { id: "KR-0926", item: "Nagapadam necklace", karigar: "Tapan Samanta", issued: 41.2, finished: 38.5, allowed: 7, due: "22 Oct", stage: "hallmark", forOrder: "BR-109" },
  { id: "KR-0921", item: "Temple bangles x4", karigar: "Ravi Achari", issued: 92.6, finished: 88.4, allowed: 5, due: "21 Oct", stage: "qc" },
  { id: "KR-0918", item: "Jimikki x6 pairs", karigar: "Tapan Samanta", issued: 44.8, finished: 40.9, allowed: 8, due: "20 Oct", stage: "qc" },
  { id: "KR-0912", item: "Hook repair, kasu mala", karigar: "Manoj Achari", issued: 0.6, finished: 0.57, allowed: 10, due: "20 Oct", stage: "bench" },
  { id: "KR-0934", item: "Manga mala, rubies", karigar: "Sukumar Das", issued: 70.2, finished: 66.5, allowed: 6, due: "2 Nov", stage: "issued", forOrder: "BR-118" },
  { id: "KR-0927", item: "Thali chains x10", karigar: "Shibu Casting, Chalakudy", issued: 168.0, finished: 163.9, allowed: 3, due: "23 Oct", stage: "bench" },
  { id: "KR-0915", item: "Kids bracelets x12", karigar: "Shibu Casting, Chalakudy", issued: 52.3, finished: 51.1, allowed: 3, due: "18 Oct", stage: "received" },
  { id: "KR-0909", item: "Antique kada pair", karigar: "Ravi Achari", issued: 46.0, finished: 43.4, allowed: 6, due: "16 Oct", stage: "received" },
  { id: "KR-0929", item: "Mullamottu necklace", karigar: "Biswajit Pal", issued: 28.4, finished: 26.6, allowed: 7, due: "25 Oct", stage: "hallmark" },
];
const karigars = [
  { name: "Manoj Achari", place: "Ollur", since: "2004", rating: 4.8, specialty: "Palakka, traditional Kerala" },
  { name: "Sukumar Das", place: "Poothole (Bengali unit)", since: "2012", rating: 4.6, specialty: "Kasu mala, filigree" },
  { name: "Tapan Samanta", place: "Poothole (Bengali unit)", since: "2015", rating: 4.2, specialty: "Jimikki, temple work" },
  { name: "Ravi Achari", place: "Kuriachira", since: "1998", rating: 4.9, specialty: "Bangles, kada" },
  { name: "Shibu Casting, Chalakudy", place: "Chalakudy", since: "2017", rating: 4.4, specialty: "Machine chains, casting" },
  { name: "Biswajit Pal", place: "Kokkalai", since: "2020", rating: 4.0, specialty: "Light necklaces" },
];

/* ---------- Schemes ---------- */

type Member = { id: string; name: string; town: string; plan: "Swarna Nidhi 11+1" | "Kalyan Kuri 24"; monthly: number; paid: number; of: number; joined: string; maturity: string; lastPaid: number; phone: string };
const members: Member[] = [
  { id: "SN-2231", name: "Bindu Joseph", town: "Irinjalakuda", plan: "Swarna Nidhi 11+1", monthly: 5000, paid: 11, of: 11, joined: "Nov 2025", maturity: "20 Oct", lastPaid: 6, phone: "98470 ••• 112" },
  { id: "SN-2240", name: "Rafeeq Kunjumon", town: "Kodungallur", plan: "Swarna Nidhi 11+1", monthly: 10000, paid: 9, of: 11, joined: "Jan 2026", maturity: "Dec 2026", lastPaid: 14, phone: "94461 ••• 870" },
  { id: "KK-0412", name: "Anitha Menon", town: "Thrissur", plan: "Kalyan Kuri 24", monthly: 15000, paid: 17, of: 24, joined: "May 2025", maturity: "Apr 2027", lastPaid: 3, phone: "98950 ••• 431" },
  { id: "SN-2252", name: "Sreeja Prakash", town: "Guruvayur", plan: "Swarna Nidhi 11+1", monthly: 3000, paid: 4, of: 11, joined: "Jun 2026", maturity: "May 2027", lastPaid: 71, phone: "97448 ••• 205" },
  { id: "SN-2219", name: "George Thomas", town: "Chalakudy", plan: "Swarna Nidhi 11+1", monthly: 8000, paid: 11, of: 11, joined: "Oct 2025", maturity: "5 Oct", lastPaid: 20, phone: "94473 ••• 668" },
  { id: "KK-0420", name: "Lakshmi Narayanan", town: "Wadakkanchery", plan: "Kalyan Kuri 24", monthly: 20000, paid: 8, of: 24, joined: "Feb 2026", maturity: "Jan 2028", lastPaid: 38, phone: "98461 ••• 990" },
  { id: "SN-2263", name: "Fousiya Ashraf", town: "Kunnamkulam", plan: "Swarna Nidhi 11+1", monthly: 2000, paid: 2, of: 11, joined: "Aug 2026", maturity: "Jul 2027", lastPaid: 66, phone: "70126 ••• 553" },
  { id: "SN-2244", name: "Jincy Varghese", town: "Ollur", plan: "Swarna Nidhi 11+1", monthly: 5000, paid: 8, of: 11, joined: "Feb 2026", maturity: "Jan 2027", lastPaid: 9, phone: "95620 ••• 117" },
  { id: "KK-0398", name: "Pradeep Warrier", town: "Thrissur", plan: "Kalyan Kuri 24", monthly: 25000, paid: 23, of: 24, joined: "Nov 2024", maturity: "Nov 2026", lastPaid: 12, phone: "98472 ••• 304" },
  { id: "SN-2270", name: "Mini Sebastian", town: "Mala", plan: "Swarna Nidhi 11+1", monthly: 3000, paid: 1, of: 11, joined: "Sep 2026", maturity: "Aug 2027", lastPaid: 45, phone: "81298 ••• 760" },
  { id: "SN-2236", name: "Haris Muhammed", town: "Chavakkad", plan: "Swarna Nidhi 11+1", monthly: 10000, paid: 10, of: 11, joined: "Dec 2025", maturity: "Nov 2026", lastPaid: 18, phone: "94952 ••• 228" },
  { id: "SN-2258", name: "Remya Krishnan", town: "Kunnamkulam", plan: "Swarna Nidhi 11+1", monthly: 4000, paid: 3, of: 11, joined: "Jul 2026", maturity: "Jun 2027", lastPaid: 52, phone: "79073 ••• 481" },
  { id: "KK-0431", name: "Thomas Kurian", town: "Irinjalakuda", plan: "Kalyan Kuri 24", monthly: 12000, paid: 5, of: 24, joined: "May 2026", maturity: "Apr 2028", lastPaid: 7, phone: "98953 ••• 015" },
  { id: "SN-2249", name: "Sajitha Babu", town: "Ottapalam", plan: "Swarna Nidhi 11+1", monthly: 6000, paid: 6, of: 11, joined: "Apr 2026", maturity: "Mar 2027", lastPaid: 35, phone: "97470 ••• 386" },
];
const memberStatus = (m: Member) => (m.paid >= m.of ? "Matured" : m.lastPaid > 60 ? "Defaulter" : m.lastPaid > 31 ? "Late" : "Regular");
const memberTone: Record<string, Tone> = { Matured: "accent", Defaulter: "late", Late: "warn", Regular: "ok" };

/* ---------- Bridal ---------- */

type Booking = { id: string; family: string; town: string; wedding: string; inDays: number; grams: number; lockedRate: number; advance: number; stage: "Design" | "Karigar" | "Hallmark" | "Ready" | "Delivered"; consultant: string; items: { id: string; label: string; sub: string; done: boolean }[] };
const bookings: Booking[] = [
  { id: "BR-114", family: "Chiramel family (Anju weds Rohit)", town: "Thrissur", wedding: "8 Nov · Guruvayur", inDays: 19, grams: 312, lockedRate: 10980, advance: 1100000, stage: "Karigar", consultant: "Fathima", items: [{ id: "a", label: "Palakka mala 58 g", sub: "Manoj Achari · KR-0931", done: false }, { id: "b", label: "Kasu mala 81 coins", sub: "Sukumar Das · KR-0932", done: false }, { id: "c", label: "Bangles x12, 148 g", sub: "From tray B1/B2", done: true }, { id: "d", label: "Jimikki & mattal", sub: "Ready", done: true }, { id: "e", label: "Thali + chain", sub: "Blessing at church on 7 Nov", done: false }] },
  { id: "BR-109", family: "Kalarikkal family", town: "Kunnamkulam", wedding: "1 Nov · Kunnamkulam", inDays: 12, grams: 196, lockedRate: 11020, advance: 650000, stage: "Hallmark", consultant: "Fathima", items: [{ id: "a", label: "Nagapadam necklace", sub: "Hallmarking · KR-0926", done: false }, { id: "b", label: "Bangles x8", sub: "Packed", done: true }, { id: "c", label: "Waist belt (oddiyanam)", sub: "Ready", done: true }] },
  { id: "BR-118", family: "Puthenveettil family", town: "Irinjalakuda", wedding: "22 Nov · Irinjalakuda", inDays: 33, grams: 268, lockedRate: 11150, advance: 900000, stage: "Design", consultant: "Lissy", items: [{ id: "a", label: "Manga mala, rubies", sub: "Gold issued to Sukumar · KR-0934", done: false }, { id: "b", label: "Choker", sub: "Design sign-off pending", done: false }, { id: "c", label: "Bangles x10", sub: "Select on 25 Oct", done: false }] },
  { id: "BR-103", family: "Abdul Rasheed family", town: "Chavakkad", wedding: "26 Oct · Chavakkad", inDays: 6, grams: 224, lockedRate: 10860, advance: 1400000, stage: "Ready", consultant: "Fathima", items: [{ id: "a", label: "Full bridal set", sub: "Weighed, packed in locker 3", done: true }, { id: "b", label: "Balance payment", sub: "₹10.9 L on delivery", done: false }] },
  { id: "BR-121", family: "Nair family (Gopika weds Arjun)", town: "Wadakkanchery", wedding: "6 Dec · Thrissur", inDays: 47, grams: 180, lockedRate: 11240, advance: 500000, stage: "Design", consultant: "Lissy", items: [{ id: "a", label: "Rate locked today", sub: "₹11,240 for 180 g", done: true }, { id: "b", label: "Design meeting", sub: "Sat 11 AM", done: false }] },
  { id: "BR-097", family: "Mathew family", town: "Chalakudy", wedding: "18 Oct · Chalakudy", inDays: 0, grams: 156, lockedRate: 10740, advance: 1720000, stage: "Delivered", consultant: "Fathima", items: [{ id: "a", label: "Delivered 17 Oct", sub: "Signed, photo sent", done: true }] },
  { id: "BR-116", family: "Pulikkottil family", town: "Ollur", wedding: "15 Nov · Ollur", inDays: 26, grams: 240, lockedRate: 11080, advance: 800000, stage: "Karigar", consultant: "Lissy", items: [{ id: "a", label: "Temple bangles x4", sub: "QC · KR-0921", done: false }, { id: "b", label: "Kasu mala", sub: "From tray N1", done: true }] },
  { id: "BR-122", family: "Variyath family", town: "Guruvayur", wedding: "12 Jan · Guruvayur", inDays: 84, grams: 140, lockedRate: 0, advance: 100000, stage: "Design", consultant: "Fathima", items: [{ id: "a", label: "Rate not locked", sub: "Family waiting for a dip", done: false }] },
];
const stageTone: Record<Booking["stage"], Tone> = { Design: "neutral", Karigar: "info", Hallmark: "accent", Ready: "ok", Delivered: "ok" };

/* ---------- Old gold ---------- */

type OldLot = { id: string; customer: string; town: string; items: string; gross: number; stones: number; karat: number; mode: "Exchange" | "Buy-back"; time: string };
const oldQueue: OldLot[] = [
  { id: "OG-561", customer: "Saramma Varkey", town: "Ollur", items: "4 old bangles, 1 broken chain", gross: 52.8, stones: 0, karat: 21.4, mode: "Exchange", time: "now" },
  { id: "OG-562", customer: "Ummer Koya", town: "Chavakkad", items: "Mother's thali chain", gross: 18.2, stones: 0, karat: 22.1, mode: "Exchange", time: "12:50" },
  { id: "OG-563", customer: "Deepthi Raj", town: "Thrissur", items: "Jimikki x3, stone necklace", gross: 31.6, stones: 3.9, karat: 19.6, mode: "Buy-back", time: "1:15" },
  { id: "OG-564", customer: "K. P. Unnikrishnan", town: "Guruvayur", items: "Old 916 coins x5", gross: 40.0, stones: 0, karat: 22.0, mode: "Exchange", time: "1:40" },
  { id: "OG-565", customer: "Reena Antony", town: "Kodungallur", items: "Kids bracelets, mixed", gross: 14.6, stones: 0.4, karat: 18.2, mode: "Buy-back", time: "2:10" },
];
const oldDone: (OldLot & { value: number })[] = [
  { id: "OG-552", customer: "Haseena Rahim", town: "Kunnamkulam", items: "Old palakka mala", gross: 31.4, stones: 2.1, karat: 21.6, mode: "Exchange", time: "10:48", value: 339200 },
  { id: "OG-553", customer: "Mohanan Pillai", town: "Thrissur", items: "Chain + ring", gross: 12.6, stones: 0, karat: 22.0, mode: "Exchange", time: "11:02", value: 139800 },
  { id: "OG-554", customer: "Jessy Thomas", town: "Mala", items: "Bangles x2", gross: 22.4, stones: 0, karat: 20.8, mode: "Buy-back", time: "11:20", value: 228900 },
  { id: "OG-555", customer: "Nisha Suresh", town: "Ottapalam", items: "Earrings, nose pin", gross: 5.3, stones: 0.6, karat: 18.9, mode: "Exchange", time: "11:44", value: 42800 },
  { id: "OG-556", customer: "Abdul Gafoor", town: "Chavakkad", items: "Old Gulf chain", gross: 28.9, stones: 0, karat: 21.9, mode: "Exchange", time: "12:05", value: 314600 },
  { id: "OG-557", customer: "Molly Jose", town: "Irinjalakuda", items: "Kasu mala, worn", gross: 44.1, stones: 0, karat: 21.2, mode: "Exchange", time: "12:20", value: 466100 },
];
function oldValue(l: { gross: number; stones: number; karat: number }, r24: number) {
  const net = Math.max(0, l.gross - l.stones);
  const fine = net * (l.karat / 24);
  const melt = fine * r24 * 0.98;
  return { net, fine, melt };
}

/* ---------- Shared modules ---------- */

const team: TeamMember[] = [
  { name: "Varghese Thekkekara", role: "Managing partner", status: "Busy", load: 92, focus: "Signing the tray tally and the BR-122 rate-lock call", tasks: [{ title: "Countersign morning tally", due: "10:30", done: true }, { title: "Call Variyath family on rate lock", due: "3:00" }, { title: "Bank: gold metal loan renewal", due: "4:30" }], week: [1, 1, 1, 1, 1, 1], since: "1994" },
  { name: "Lissy Davis", role: "Floor manager, counters 1–4", status: "On floor", load: 84, focus: "Counting E1 jimikki tray; one piece unaccounted", tasks: [{ title: "Recount E1 with CCTV clip", due: "now" }, { title: "Approval slip AP-218 follow-up", due: "1:00" }, { title: "Bangle selection, BR-118", due: "Sat" }], week: [1, 1, 1, 1, 1, 1], since: "2008" },
  { name: "Suresh Menon", role: "Gold manager & purchase", status: "Busy", load: 78, focus: "Issued 64 g to Sukumar; booking 500 g bullion at 2:15 rate", tasks: [{ title: "Bullion booking with Mumbai dealer", due: "2:30" }, { title: "Weigh back KR-0918 jimikki", due: "11:30", done: true }], week: [1, 1, 1, 1, 0, 1], since: "2002" },
  { name: "Anil Kumar", role: "Karigar coordinator", status: "In field", load: 66, focus: "At Poothole Bengali unit for KR-0932 progress", tasks: [{ title: "Photos of kasu mala at 60%", due: "1:00" }, { title: "Collect hallmarked KR-0926", due: "4:00" }], week: [1, 1, 1, 1, 1, 0], since: "2014" },
  { name: "Fathima Nasreen", role: "Bridal consultant", status: "On floor", load: 88, focus: "BR-103 delivery Friday; BR-114 design changes", tasks: [{ title: "Send BR-114 progress video", due: "12:00" }, { title: "Balance invoice BR-103", due: "5:00" }], week: [1, 1, 1, 1, 1, 1], since: "2016" },
  { name: "Deepa Raghavan", role: "Schemes desk", status: "On floor", load: 61, focus: "5 defaulters; 2 maturities to redeem this week", tasks: [{ title: "Call 3 defaulters, Kunnamkulam", due: "3:30" }, { title: "Redeem SN-2231 Bindu Joseph", due: "today" }], week: [1, 1, 0, 1, 1, 1], since: "2019" },
  { name: "Biju Paul", role: "Security & tray custodian", status: "On floor", load: 55, focus: "Tray handover log and strongroom keys", tasks: [{ title: "Pull CCTV 10:05–10:20 counter 3", due: "now" }, { title: "Strongroom closing count", due: "8:15 PM" }], week: [1, 1, 1, 1, 1, 1], since: "2011" },
  { name: "Rajesh Iyer", role: "Accounts & GST", status: "Off", load: 34, focus: "GSTR-1 filed; Tally day book tonight", tasks: [{ title: "Reconcile UPI settlements", due: "tomorrow" }], week: [1, 1, 1, 1, 1, 0], since: "2013" },
];

const agents: WorkforceAgent[] = [
  { name: "Tray Auditor", role: "Reconciles every tray scan against the tag register", icon: ScanLine, status: "Needs you", runsToday: 6, hoursSaved: 3, accuracy: 98, last: "3 min ago", skills: ["RFID tags", "Tag register", "CCTV index"], schedule: "Opening, 2 PM and closing", inbox: [{ title: "E1 jimikki: 1 piece missing, no slip", detail: "JM-016 jimikki 6.231 g. Last seen on counter 3 at 10:12. CCTV clip queued for Biju." }], log: ["C1 chain CH-008 0.384 g light, flagged", "R2 ring GR-010 heavy by 0.214 g, likely tag swap", "4 trays tallied clean before 10:30"] },
  { name: "Rate Publisher", role: "Pushes the AKGSMA board rate to tags, TV and WhatsApp", icon: Coins, status: "Running", runsToday: 2, hoursSaved: 1.5, accuracy: 100, last: "2:15 PM", skills: ["AKGSMA feed", "Showroom TV", "WhatsApp status"], schedule: "On every board revision", log: ["Rate revised ₹11,190 → ₹11,240", "Repriced 2,418 tags", "Status posted to 3,100 contacts"] },
  { name: "Karigar Ledger", role: "Tracks gold issued, received and wastage per karigar", icon: Hammer, status: "Needs you", runsToday: 4, hoursSaved: 2.5, accuracy: 95, last: "40 min ago", skills: ["Karigar book", "Wastage", "Due dates"], schedule: "On every issue and weigh-back", inbox: [{ title: "Tapan's jimikki wastage 8.7% vs 8% allowed", detail: "44.8 g issued, 40.9 g back. 0.31 g over. Deduct from his balance?" }], log: ["KR-0918 weighed back 40.9 g", "Shibu casting balance 163.9 g pending", "Reminder: KR-0921 due tomorrow"] },
  { name: "Scheme Collector", role: "Sends instalment reminders and maturity offers", icon: PiggyBank, status: "Running", runsToday: 3, hoursSaved: 4, accuracy: 93, last: "1 h ago", skills: ["Scheme ledger", "WhatsApp", "UPI links"], schedule: "Daily 10 AM and 6 PM", log: ["31 reminders sent with UPI links", "Bindu Joseph matured, invited for redemption", "5 defaulters escalated to Deepa"] },
  { name: "Bridal Concierge", role: "Keeps wedding families updated with progress photos", icon: Heart, status: "Running", runsToday: 5, hoursSaved: 3.5, accuracy: 91, last: "25 min ago", skills: ["Photos", "WhatsApp", "Wedding dates"], schedule: "Twice a week per family", log: ["BR-114 palakka photo sent to Chiramel family", "BR-103 delivery slot confirmed for Fri", "BR-122 asked about rate lock"] },
  { name: "Purity Desk", role: "Reads XRF results and drafts old-gold valuations", icon: FlaskConical, status: "Idle", runsToday: 7, hoursSaved: 2, accuracy: 96, last: "12:20 PM", skills: ["XRF", "Valuation", "KYC"], schedule: "On each test", log: ["OG-557 21.2K, ₹4.66 L credited", "OG-554 PAN captured for buy-back over ₹2 L", "XRF calibrated with 24K reference"] },
];

const independence: IndependenceData = {
  score: 38,
  history: [24, 26, 29, 31, 33, 36, 38],
  quote: "Nobody else holds the strongroom key at closing. If I am at a wedding, my son drives back from Kochi.",
  pillars: [
    { name: "Sales & counters", score: 52, note: "Lissy runs the floor, but discounts above 1% of VA come to Varghese.", fixes: [{ title: "VA discount bands by role", gain: 3 }, { title: "Counter targets on TV", gain: 1 }] },
    { name: "Stock & trays", score: 34, note: "Tray tally is on paper; the owner countersigns every morning.", fixes: [{ title: "RFID tray scan with auto-sign", gain: 4 }, { title: "Approval slips in the app", gain: 2 }] },
    { name: "Gold & karigars", score: 29, note: "Only Suresh and Varghese know each karigar's real balance.", fixes: [{ title: "Karigar ledger shared with Anil", gain: 3 }, { title: "Wastage limits per item", gain: 2 }] },
    { name: "Money & rate risk", score: 31, note: "Bullion booking and rate locks are decided on the owner's phone.", fixes: [{ title: "Rate-lock limit per consultant", gain: 3 }] },
    { name: "Schemes & customers", score: 47, note: "Deepa runs schemes well; defaulters drift for 2 months.", fixes: [{ title: "Auto UPI mandate", gain: 3 }] },
    { name: "Numbers & reporting", score: 36, note: "Stock-in-grams is known only after the night count.", fixes: [{ title: "Live gram ledger", gain: 2 }] },
    { name: "Owner time", score: 33, note: "Owner spends 17 hours a week on counting, rates and karigars.", fixes: [{ title: "Two sign-off windows", gain: 2 }] },
  ],
  ownerHours: [
    { label: "Tray sign-off", hours: 6 },
    { label: "Rate & bullion", hours: 5 },
    { label: "Karigars", hours: 6 },
    { label: "Bridal families", hours: 9 },
    { label: "Strongroom", hours: 4 },
    { label: "Bank", hours: 2 },
    { label: "Strategy", hours: 1 },
  ],
};

const integrations: Integration[] = [
  { name: "Tally Prime", category: "Accounts", status: "Connected", detail: "Sales, old-gold purchase and GST vouchers.", synced: "8 min ago", records: "18,420 vouchers", mark: "T", color: "#1c4f9c" },
  { name: "Karat ERP", category: "Stock", status: "Connected", detail: "Tag register, gross/net weight, HUID per piece.", synced: "live", records: "6,214 tags", mark: "KE", color: "#9a7431" },
  { name: "RFID tray reader", category: "Stock", status: "Syncing", detail: "Handheld reader at counters 1–4 and the lounge.", synced: "live", records: "151 scans today", mark: "RF", color: "#5a3f6b" },
  { name: "BIS HUID portal", category: "Compliance", status: "Connected", detail: "Hallmark IDs verified on receipt from the assay centre.", synced: "11:40 AM", records: "312 HUIDs this month", mark: "BIS", color: "#b03a2e" },
  { name: "AKGSMA rate feed", category: "Rates", status: "Connected", detail: "Kerala board rate, revisions pushed to tags and TV.", synced: "2:15 PM", records: "2 revisions", mark: "₹", color: "#b8822a" },
  { name: "WhatsApp Business", category: "Messaging", status: "Connected", detail: "Rate status, scheme reminders, bridal updates.", synced: "just now", records: "3,100 contacts", mark: "W", color: "#1f9d55" },
  { name: "Razorpay UPI", category: "Payments", status: "Connected", detail: "Scheme instalments and bridal advances.", synced: "4 min ago", records: "88 payments", mark: "R", color: "#2563eb" },
  { name: "CCTV NVR (Hikvision)", category: "Security", status: "Error", detail: "Counter 3 camera index lagging 20 min.", synced: "10:05 AM", records: "16 cameras", mark: "CC", color: "#374151" },
  { name: "Google Business Profile", category: "Marketing", status: "Available", detail: "Reviews and today's rate on Maps.", synced: "—", records: "—", mark: "G", color: "#ea4335" },
];

/* ============================================================
   Config
   ============================================================ */

const config: DeskConfig = {
  slug: "jewellery",
  company: "Periyar Jewellers",
  brand: "Periyar",
  city: "Thrissur",
  state: "KL",
  icon: Gem,
  tagline: "22K gold and diamonds since 1994 · Round South · 10 trays, 6 karigars, 412 scheme members",
  owner: { name: "Varghese Thekkekara", first: "Varghese", initials: "VT", role: "Managing partner" },
  theme: {
    variant: "ledger",
    paper: "#f8f2e7",
    panel: "#fffbf3",
    sunk: "#efe5d3",
    ink: "#2a2118",
    mute: "#7a6a57",
    line: "#e0d3bd",
    accent: "#9a7431",
    accentInk: "#fffaf0",
    soft: "#f3e7cf",
    ok: "#4c7a48",
    warn: "#b77d22",
    late: "#a63d2f",
    info: "#5d3f6e",
    heading: "serif",
  },
  agenda: [
    { at: 9.5, title: "Opening tray tally", detail: "10 trays, 154 pieces, countersign by 10:30", count: 10, tone: "accent", module: "trays" },
    { at: 11.5, title: "Weigh back from karigars", detail: "KR-0918 and KR-0921 in QC", count: 2, tone: "info", module: "karigar" },
    { at: 14.25, title: "Board rate revision", detail: "AKGSMA 22K ₹11,190 → ₹11,240", tone: "warn", module: "rate" },
    { at: 15, title: "Rate-lock call, Variyath family", detail: "140 g for 12 Jan, not locked yet", tone: "late", module: "bridal" },
    { at: 16, title: "Scheme defaulter calls", detail: "5 members over 60 days", count: 5, tone: "late", module: "schemes" },
    { at: 20.25, title: "Closing count & strongroom", detail: "Trays back in, keys signed", tone: "ok", module: "trays" },
  ],
  activity: [
    { time: "2:15 PM", text: "Board rate revised to ₹11,240/g for 22K; 2,418 tags repriced", tone: "warn" },
    { time: "12:41 PM", text: "Kasu mala 48.220 g sold, part-paid with old gold", tone: "ok" },
    { time: "11:58 AM", text: "Tray Auditor: C1 chain CH-008 is 0.384 g light", tone: "late" },
    { time: "11:30 AM", text: "KR-0918 jimikki weighed back at 40.9 g", tone: "info" },
    { time: "10:28 AM", text: "B1, C2, N2 and E2 tallied clean and countersigned", tone: "ok" },
    { time: "9:40 AM", text: "Approval slip AP-218: temple bangle with Shiny Paul", tone: "neutral" },
  ],
  asks: [
    { q: "Do the trays tally this morning?", a: "Not yet. 4 of 10 trays are tallied clean and signed (B1, C2, N2, E2).\n\nTwo real mismatches:\n• C1 chains: CH-008 Cuban link chain weighs 0.384 g less than its tag. Likely the clasp was replaced without a karigar slip.\n• R2 gents rings: GR-010 diamond band is 0.214 g heavy, which usually means two tags were swapped.\n\nOne piece is unaccounted: JM-016 jimikki 6.231 g from E1, no approval slip. Biju is pulling CCTV for counter 3, 10:05–10:20.", sources: ["RFID scans", "Tag register", "Approval slips"] },
    { q: "What's my rate-lock exposure?", a: "1,560 g is booked for weddings at locked rates between ₹10,740 and ₹11,240. At today's ₹11,240 the shop carries ₹2.7 L of rate difference on undelivered orders, mostly BR-103 (₹85k) and BR-114 (₹81k).\n\nBR-122 Variyath family (140 g, 12 Jan) is not locked. A ₹200/g rise would cost them ₹28,000; offering a lock with a 10% advance today is the safe move.", sources: ["Bridal bookings", "AKGSMA rate"] },
    { q: "Which karigar is over on wastage?", a: "Tapan Samanta on KR-0918 jimikki: 8.7% against 8% allowed, 0.31 g over.\n\nEveryone else is inside limits this month. Ravi Achari is the most efficient at 4.5% on bangles. Gold currently with karigars: 568.2 g across 9 open jobs, the largest with Shibu Casting (168 g of thali chains).", sources: ["Karigar book", "Weigh-back log"] },
    { q: "How are the schemes doing?", a: "412 active members, ₹31.8 L collected this month. 5 defaulters (over 60 days) hold ₹38,000 of missed instalments; 3 of them are in Kunnamkulam and Guruvayur.\n\n2 schemes matured this week: Bindu Joseph (₹55,000 + bonus month) and George Thomas (₹88,000). Both have been invited to redeem; George usually buys bangles.", sources: ["Scheme ledger", "Razorpay"] },
    { q: "What did the old gold desk buy today?", a: "6 lots, 144.7 g gross, ₹15.3 L credited. 4 were exchanges against new purchases and 2 were buy-backs (PAN captured for the one over ₹2 L).\n\nAverage purity 21.1K. 5 more customers are waiting, starting with Saramma Varkey's 52.8 g of old bangles.", sources: ["XRF log", "Tally purchase vouchers"] },
    { q: "Draft a WhatsApp to Shiny Paul about the approval bangle", a: "Draft (not sent):\n\n“Namaskaram Shiny chechi, hope the temple bangle looked lovely at home. It is on approval with you since Saturday under slip AP-218 (34.6 g). Would you like to keep it at today's rate of ₹11,240, or shall Biju collect it tomorrow morning? Warm regards, Lissy, Periyar Jewellers”", sources: ["Approval slips", "Tray B2"] },
  ],
  run: {
    label: "Runs at opening, 2 PM and closing. You can run it now.",
    title: "Tray Auditor",
    steps: [
      { text: "Read 151 RFID scans across 10 trays", result: "151 of 154 pieces on trays" },
      { text: "Match against the tag register and HUIDs", result: "2 weight mismatches, 0 HUID errors" },
      { text: "Check approval and repair slips", result: "2 pieces out with slips, 1 without" },
      { text: "Index CCTV for the missing piece", result: "JM-016 last on counter 3 at 10:12" },
      { text: "Draft the countersign sheet", result: "4 trays clean, 3 need a recount" },
    ],
    outcome: "Showroom accounts for 1,802.4 g against 1,808.8 g on tags. 6.231 g is the missing jimikki, the rest is the light chain and the heavy ring. Recount E1 with Biju before lunch.",
    actions: ["Recount E1 with CCTV clip", "Send CH-008 to Manoj for weighing", "Swap GR-010 tags", "Countersign 4 clean trays"],
  },
};

/* ============================================================
   Desk
   ============================================================ */

export default function JewelleryDesk() {
  const rate = useDrift(BOARD_22K, 3, 2600);
  const [scans, setScans] = React.useState<Record<string, string[]>>(seedScans);
  const [trays, setTrays] = React.useState(seedTrays);
  const [jobs, setJobs] = React.useState(seedJobs);
  const stats = trays.map((t) => ({ t, s: trayStats(t, scans[t.id] ?? []) }));
  const defaulters = members.filter((m) => memberStatus(m) === "Defaulter").length;

  const modules: DeskModule[] = [
    {
      id: "trays",
      label: "Tray tally",
      group: "Showroom",
      count: stats.filter((x) => x.s.state !== "Tallied").length,
      title: "Tray tally",
      blurb: "Every tray on the counter, weighed piece by piece against its tags, before the owner signs",
      icon: ScanLine,
      notes: ["Pick a tray, then click pieces (or Auto scan) to weigh them. The scale adds real grams, not tag grams.", "A red piece weighs differently from its tag. A dashed slot is out on an approval or repair slip; a red question mark has no slip.", "Close the tally to countersign or raise a mismatch."],
      render: () => <TrayHome rate={rate} trays={trays} setTrays={setTrays} scans={scans} setScans={setScans} />,
    },
    { id: "rate", label: "Rate & pricing", group: "Showroom", title: "Rate & pricing", blurb: "The board rate, what it does to every tag and the price for any piece", icon: Coins, render: () => <RateTab rate={rate} /> },
    { id: "karigar", label: "Karigar orders", group: "Workshop", count: jobs.filter((j) => j.stage !== "received").length, title: "Karigar orders", blurb: "Gold out with karigars, what comes back and what was lost on the way", icon: Hammer, render: () => <KarigarTab jobs={jobs} setJobs={setJobs} /> },
    { id: "bridal", label: "Bridal & orders", group: "Workshop", count: bookings.filter((b) => b.stage !== "Delivered").length, title: "Bridal & orders", blurb: "Every wedding family, their set, their locked rate and the days left", icon: Crown, render: () => <BridalTab rate={rate} /> },
    { id: "schemes", label: "Schemes", group: "Customers", count: defaulters, title: "Gold savings schemes", blurb: "Monthly instalments, maturities and the members who have gone quiet", icon: PiggyBank, render: () => <SchemesTab /> },
    { id: "oldgold", label: "Old gold exchange", group: "Customers", count: oldQueue.length, title: "Old gold exchange", blurb: "Purity test, valuation and the credit against a new piece", icon: Recycle, render: () => <OldGoldTab rate={rate} /> },
    { id: "team", label: "People", group: "Back office", title: "People", blurb: "Counters, bridal, schemes and the strongroom: who is carrying what", icon: Users, render: () => <PeopleModule members={team} /> },
    { id: "agents", label: "Agents", group: "Back office", title: "Agents", blurb: "Six AI agents doing the counting and chasing", icon: Bot, render: () => <AgentsModule agents={agents} /> },
    { id: "independence", label: "Independence", group: "Back office", title: "Owner independence", blurb: "How much of Periyar runs without Varghese holding the keys", icon: GaugeIcon, render: () => <IndependenceModule data={independence} /> },
    { id: "connections", label: "Connections", group: "Back office", title: "Connections", blurb: "Tally, the tag register, RFID, HUID and the rate feed", icon: Plug, render: () => <ConnectionsModule items={integrations} /> },
  ];

  return <DeskShell config={config} modules={modules} />;
}

/* ---------------- Tween ---------------- */

function useTween(target: number, ms = 650) {
  const [value, setValue] = React.useState(target);
  const from = React.useRef(target);
  React.useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      const e = 1 - Math.pow(1 - p, 3);
      const cur = a + (target - a) * e;
      from.current = cur;
      setValue(cur);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return value;
}

/* ---------------- Home: tray tally ---------------- */

type ScanProps = {
  rate: number;
  trays: Tray[];
  setTrays: React.Dispatch<React.SetStateAction<Tray[]>>;
  scans: Record<string, string[]>;
  setScans: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
};

function TrayHome(props: ScanProps) {
  const { rate, trays, scans } = props;
  const desk = useDesk();
  const all = trays.map((t) => trayStats(t, scans[t.id] ?? []));
  const expected = all.reduce((a, s) => a + s.expected, 0);
  const accounted = all.reduce((a, s) => a + s.accounted, 0);
  const tallied = all.filter((s) => s.state === "Tallied").length;
  const mism = all.reduce((a, s) => a + s.flagged.length + s.missing.length, 0);
  const value = trays.reduce((a, t, i) => a + all[i].expected * rateFor(t.karat, rate), 0);

  return (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Gold on the counter" value={`${num1(expected)} g`} hint={`${trays.reduce((a, t) => a + t.pieces.length, 0)} tagged pieces`} icon={Scale} delta="-48 g" deltaGood={false} trend={[1857, 1849, 1840, 1836, 1826, 1818, 1812, Math.round(expected)]} />
        <Stat label="Trays tallied" value={`${tallied} of ${trays.length}`} hint="countersign by 10:30" icon={CheckCheck} tone="ok" delta="+4" trend={[0, 1, 2, 3, 4, 4, 4, tallied]} />
        <Stat label="Mismatches open" value={mism} hint={`${all.reduce((a, s) => a + s.flagged.length, 0)} weight, ${all.reduce((a, s) => a + s.missing.length, 0)} missing piece`} icon={AlertTriangle} tone="late" delta="+1" deltaGood={false} trend={[0, 0, 1, 1, 2, 2, 3, mism]} />
        <Stat label="Counter value at board rate" value={inr(value, { compact: true })} hint={`22K ₹${Math.round(rate).toLocaleString("en-IN")}/g`} icon={IndianRupee} delta="+0.4%" trend={[1.98, 1.99, 1.99, 2.0, 2.0, 2.01, 2.02, value / 1e7]} />
      </div>
      <Panel live title="Tray tally" sub={`Scale reads ${num1(accounted)} g accounted against ${num1(expected)} g on tags · live 22K ₹${Math.round(rate).toLocaleString("en-IN")}/g`}>
        <TrayTally {...props} />
      </Panel>
      <div className="grid gap-7 lg:grid-cols-[1.25fr_1fr]">
        <Panel icon={Coins} title="The rate through the day" sub="AKGSMA board rate and the live bullion-implied rate, 22K per gram" action={<Btn size="sm" icon={ArrowRight} onClick={() => desk.goTab("rate")}>Rate board</Btn>}>
          <AreaChart
            labels={["9:30", "10", "10:30", "11", "11:30", "12", "12:30", "1", "1:30", "2", "2:30", "3"]}
            series={[
              { name: "Board rate", data: [11190, 11190, 11190, 11190, 11190, 11190, 11190, 11190, 11190, 11190, 11240, 11240], tone: "accent" },
              { name: "Bullion implied", data: [11182, 11196, 11204, 11198, 11211, 11226, 11231, 11228, 11236, 11244, 11239, Math.round(rate)], tone: "info", dashed: true },
            ]}
            format={(v) => `₹${v.toLocaleString("en-IN")}`}
            height={180}
            marker={{ index: 10, label: "Revised 2:15" }}
          />
        </Panel>
        <OutOfTray trays={trays} setTrays={props.setTrays} />
      </div>
      <Panel icon={Sparkles} title="At the counters today" sub="From Karat ERP invoices and the old-gold desk">
        <Feed items={counterSales} />
      </Panel>
    </div>
  );
}
const num1 = (v: number) => v.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function OutOfTray({ trays, setTrays }: { trays: Tray[]; setTrays: React.Dispatch<React.SetStateAction<Tray[]>> }) {
  const desk = useDesk();
  const away = trays.flatMap((t) => t.pieces.filter((p) => p.away).map((p) => ({ t, p })));
  return (
    <Panel icon={Timer} title="Off the tray" sub="Pieces on approval, at a karigar or not found">
      {away.length === 0 ? (
        <p className="py-6 text-center font-serif text-[15px] italic text-d-mute">Every piece is back on its tray.</p>
      ) : (
        <ul className="divide-y divide-d-line">
          {away.map(({ t, p }) => (
            <li key={p.id} className="flex items-start gap-3 py-3">
              <span className="mt-1 font-mono text-[11px] text-d-mute">{t.id}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium">
                  {p.name} <span className="font-mono text-[12px] text-d-mute">{p.id} · {g3(p.tag)} g</span>
                </p>
                <p className={p.away?.note ? "text-[12.5px] text-d-mute" : "text-[12.5px] font-medium text-d-late"}>{p.away?.note ?? "No slip. Last seen counter 3 at 10:12."}</p>
              </div>
              <Btn
                size="sm"
                variant={p.away?.note ? "outline" : "solid"}
                icon={RotateCcw}
                onClick={() => {
                  setTrays((cur) => cur.map((x) => (x.id === t.id ? { ...x, pieces: x.pieces.map((q) => (q.id === p.id ? { ...q, away: undefined } : q)) } : x)));
                  toast.success(`${p.id} back on tray ${t.id}`, { description: "Scan it to close the tray." });
                  desk.log(`${p.name} ${p.id} returned to tray ${t.id}`, "ok");
                }}
              >
                {p.away?.note ? "Returned" : "Found"}
              </Btn>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function TrayTally({ trays, scans, setScans }: ScanProps) {
  const desk = useDesk();
  const [sel, setSel] = React.useState("E1");
  const [auto, setAuto] = React.useState(false);
  const [closed, setClosed] = React.useState<Record<string, "signed" | "raised">>({ B1: "signed", C2: "signed", N2: "signed", E2: "signed" });
  const tray = trays.find((t) => t.id === sel) ?? trays[0];
  const ids = scans[tray.id] ?? [];
  const st = trayStats(tray, ids);
  const shown = useTween(st.counted);
  const last = ids[ids.length - 1];

  const scanNext = React.useCallback(
    (trayId: string) => {
      setScans((cur) => {
        const t = trays.find((x) => x.id === trayId);
        if (!t) return cur;
        const done = new Set(cur[trayId] ?? []);
        const next = t.pieces.find((p) => !p.away && !done.has(p.id));
        if (!next) return cur;
        return { ...cur, [trayId]: [...(cur[trayId] ?? []), next.id] };
      });
    },
    [setScans, trays],
  );

  React.useEffect(() => {
    if (!auto) return;
    if (st.done) {
      const id = window.setTimeout(() => setAuto(false), 0);
      return () => window.clearTimeout(id);
    }
    const id = window.setInterval(() => scanNext(sel), 280);
    return () => window.clearInterval(id);
  }, [auto, st.done, sel, scanNext]);

  function scanPiece(p: Piece) {
    if (p.away || ids.includes(p.id)) return;
    setScans((cur) => ({ ...cur, [tray.id]: [...(cur[tray.id] ?? []), p.id] }));
    if (Math.abs(p.actual - p.tag) > 0.02) {
      toast.error(`${p.id} weighs ${g3(p.actual)} g, tag says ${g3(p.tag)} g`, { description: `${p.name} · ${p.actual > p.tag ? "+" : ""}${g3(p.actual - p.tag)} g` });
      desk.log(`Weight mismatch on ${p.id} ${p.name} (${g3(p.actual - p.tag)} g)`, "late");
    }
  }

  function closeTally() {
    if (st.state === "Tallied") {
      setClosed((c) => ({ ...c, [tray.id]: "signed" }));
      toast.success(`Tray ${tray.id} tallied and countersigned`, { description: `${g3(st.accounted)} g · ${st.scanned} pieces` });
      desk.log(`Tray ${tray.id} tallied clean, ${g3(st.accounted)} g`, "ok");
    } else {
      setClosed((c) => ({ ...c, [tray.id]: "raised" }));
      toast.error(`Tray ${tray.id} closed with a mismatch`, { description: `${st.diff >= 0 ? "+" : ""}${g3(st.diff)} g · ${st.flagged.length} weight, ${st.missing.length} missing. Biju and Lissy notified.` });
      desk.log(`Tray ${tray.id} mismatch raised: ${g3(st.diff)} g`, "late");
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,330px)_minmax(0,1fr)]">
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-5 xl:grid-cols-2">
        {trays.map((t) => {
          const s = trayStats(t, scans[t.id] ?? []);
          const on = t.id === sel;
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => {
                  setSel(t.id);
                  setAuto(false);
                }}
                className="w-full rounded-[6px] border px-3 py-2.5 text-left transition-all hover:-translate-y-0.5"
                style={{ borderColor: on ? "var(--d-accent)" : "var(--d-line)", background: on ? "var(--d-soft)" : "var(--d-panel)", boxShadow: on ? "0 0 0 1px var(--d-accent)" : undefined }}
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className="desk-h text-[18px] font-semibold">{t.id}</span>
                  <span className="font-mono text-[10.5px] text-d-mute">{t.karat}</span>
                </span>
                <span className="block truncate text-[11.5px] text-d-mute">{t.label}</span>
                <span className="mt-1.5 block">
                  <Meter value={s.scanned} max={s.present} tone={stateTone[s.state]} height={4} />
                </span>
                <span className="mt-1.5 flex items-center justify-between text-[10.5px]">
                  <span className="font-mono text-d-mute">
                    {s.scanned}/{s.present}
                  </span>
                  <span className="font-medium" style={{ color: s.state === "Not started" ? "var(--d-mute)" : `var(--d-${stateTone[s.state]})` }}>
                    {closed[t.id] === "signed" ? "Signed" : s.state}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-d-accent">
              Tray {tray.id} · {tray.counter} · {tray.karat} · {tray.kind}
            </p>
            <p className="desk-h text-[24px] font-semibold leading-tight">{tray.label}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Btn size="sm" icon={ScanLine} disabled={st.done} onClick={() => scanNext(tray.id)}>
              Scan next
            </Btn>
            <Btn size="sm" icon={auto ? Pause : Play} disabled={st.done && !auto} onClick={() => setAuto((a) => !a)}>
              {auto ? "Pause" : "Auto scan"}
            </Btn>
            <Btn
              size="sm"
              variant="ghost"
              icon={RotateCcw}
              onClick={() => {
                setAuto(false);
                setScans((c) => ({ ...c, [tray.id]: [] }));
                setClosed((c) => {
                  const n = { ...c };
                  delete n[tray.id];
                  return n;
                });
                desk.log(`Tray ${tray.id} recount started`, "info");
              }}
            >
              Recount
            </Btn>
          </div>
        </div>

        <TraySvg tray={tray} scanned={ids} last={last} onPiece={scanPiece} />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-d-mute">
          {[
            { c: "#c9993e", l: "weighed, matches tag", d: false },
            { c: "#c9a86a80", l: "waiting to scan (click it)", d: false },
            { c: "#ff6b55", l: "weight differs from tag", d: false },
            { c: "#a88a7a", l: "out on a slip", d: true },
            { c: "#ff8a6e", l: "missing, no slip", d: true },
          ].map((x) => (
            <span key={x.l} className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full" style={{ border: `2px ${x.d ? "dashed" : "solid"} ${x.c}` }} /> {x.l}
            </span>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
          <div className="rounded-[6px] p-4 font-mono" style={{ background: "#1e1712", color: "#f1c86a", boxShadow: "inset 0 0 0 1px #4a3a25, inset 0 10px 30px rgba(0,0,0,0.4)" }}>
            <p className="flex items-center justify-between text-[10.5px] uppercase tracking-[0.2em]" style={{ color: "#a88a57" }}>
              <span>Counter scale · 0.001 g</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: auto ? "#8fe07a" : "#a88a57" }} /> {auto ? "weighing" : "stable"}
              </span>
            </p>
            <p className="tnum mt-1 text-[40px] font-semibold leading-none tracking-tight">
              {g3(shown)}
              <span className="ml-1 text-[16px]">g</span>
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]" style={{ color: "#cbb184" }}>
              <span>
                tags
                <b className="tnum block text-[13px] text-[#f1c86a]">{g3(st.expected)}</b>
              </span>
              <span>
                on slips
                <b className="tnum block text-[13px] text-[#f1c86a]">{g3(st.explained.reduce((a, p) => a + p.tag, 0))}</b>
              </span>
              <span>
                difference
                <b className="tnum block text-[13px]" style={{ color: st.done ? (Math.abs(st.diff) < 0.02 ? "#8fe07a" : "#ff8a6e") : "#cbb184" }}>
                  {st.done ? `${st.diff >= 0 ? "+" : ""}${g3(st.diff)}` : "counting"}
                </b>
              </span>
            </div>
          </div>
          <div className="space-y-2">
            {st.flagged.map((p) => (
              <p key={p.id} className="flex items-start gap-2 rounded-[6px] px-3 py-2 text-[12.5px]" style={{ background: "color-mix(in oklab, var(--d-late) 10%, var(--d-panel))" }}>
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-d-late" />
                <span>
                  <b>{p.id}</b> {p.name}: {g3(p.actual)} g on scale vs {g3(p.tag)} g tag ({p.actual > p.tag ? "+" : ""}
                  {g3(p.actual - p.tag)} g)
                </span>
              </p>
            ))}
            {st.missing.map((p) => (
              <p key={p.id} className="flex items-start gap-2 rounded-[6px] px-3 py-2 text-[12.5px]" style={{ background: "color-mix(in oklab, var(--d-late) 10%, var(--d-panel))" }}>
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-d-late" />
                <span>
                  <b>{p.id}</b> {p.name} {g3(p.tag)} g is not on the tray and has no slip
                </span>
              </p>
            ))}
            {st.explained.map((p) => (
              <p key={p.id} className="rounded-[6px] bg-d-sunk px-3 py-2 text-[12.5px] text-d-mute">
                <b className="text-d-ink">{p.id}</b> {p.away?.note}
              </p>
            ))}
            {!st.flagged.length && !st.missing.length && !st.explained.length && <p className="rounded-[6px] bg-d-sunk px-3 py-2 font-serif text-[14px] italic text-d-mute">No exceptions on this tray so far.</p>}
            <div className="flex items-center justify-between gap-2 pt-1">
              {closed[tray.id] ? <Pill tone={closed[tray.id] === "signed" ? "ok" : "late"}>{closed[tray.id] === "signed" ? "Countersigned" : "Mismatch raised"}</Pill> : <Pill tone={stateTone[st.state]}>{st.state}</Pill>}
              <Btn size="sm" variant={st.state === "Mismatch" ? "danger" : "solid"} icon={CheckCheck} disabled={!st.done || !!closed[tray.id]} onClick={closeTally}>
                {st.state === "Mismatch" ? "Raise mismatch" : "Close & countersign"}
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TraySvg({ tray, scanned, last, onPiece }: { tray: Tray; scanned: string[]; last?: string; onPiece: (p: Piece) => void }) {
  const W = 720;
  const n = tray.pieces.length;
  const cols = n <= 8 ? 4 : n <= 12 ? 6 : n <= 16 ? 8 : n <= 24 ? 8 : 10;
  const rows = Math.ceil(n / cols);
  const cellW = (W - 60) / cols;
  const cellH = Math.min(96, Math.max(64, 300 / rows));
  const H = rows * cellH + 50;
  const set = new Set(scanned);
  const gold = "url(#jwGold)";
  return (
    <div className="overflow-hidden rounded-[8px]" style={{ boxShadow: "0 18px 40px -26px rgba(42,33,24,0.8)" }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full">
        <defs>
          <radialGradient id="jwVelvet" cx="50%" cy="35%" r="80%">
            <stop offset="0%" stopColor="#5a2f4d" />
            <stop offset="100%" stopColor="#2b1424" />
          </radialGradient>
          <linearGradient id="jwGold" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#f6dc8e" />
            <stop offset="50%" stopColor="#c9993e" />
            <stop offset="100%" stopColor="#8a6421" />
          </linearGradient>
          <pattern id="jwGrain" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="transparent" />
            <circle cx="1" cy="1" r="0.4" fill="#ffffff" opacity="0.05" />
          </pattern>
        </defs>
        <rect x="0" y="0" width={W} height={H} rx="10" fill="#8a6421" />
        <rect x="8" y="8" width={W - 16} height={H - 16} rx="6" fill="url(#jwVelvet)" />
        <rect x="8" y="8" width={W - 16} height={H - 16} rx="6" fill="url(#jwGrain)" />
        <text x={W - 22} y={H - 16} textAnchor="end" fontSize="11" fill="#c9a86a" opacity="0.7" fontFamily="monospace">
          PERIYAR · TRAY {tray.id}
        </text>
        {tray.pieces.map((p, i) => {
          const cx = 30 + cellW * (i % cols) + cellW / 2;
          const cy = 26 + cellH * Math.floor(i / cols) + cellH / 2 - 4;
          const isOn = set.has(p.id);
          const bad = isOn && Math.abs(p.actual - p.tag) > 0.02;
          const away = !!p.away;
          const missing = away && !p.away?.note;
          const stroke = missing ? "#ff8a6e" : away ? "#a88a7a" : bad ? "#ff6b55" : isOn ? gold : "#c9a86a";
          const op = isOn || away ? 1 : 0.42;
          const dash = away ? "4 4" : undefined;
          const s = Math.min(cellW, cellH) * 0.34;
          return (
            <g key={p.id} onClick={() => onPiece(p)} style={{ cursor: away || isOn ? "default" : "pointer" }} opacity={op}>
              <title>{`${p.id} · ${p.name} · tag ${g3(p.tag)} g${isOn ? ` · scale ${g3(p.actual)} g` : ""}${p.away?.note ? ` · ${p.away.note}` : ""}`}</title>
              <rect x={cx - cellW / 2 + 4} y={cy - cellH / 2 + 6} width={cellW - 8} height={cellH - 12} rx="6" fill="#000" opacity="0.18" />
              {tray.kind === "Bangles" && <circle cx={cx} cy={cy} r={s} fill="none" stroke={stroke} strokeWidth={s * 0.28} strokeDasharray={dash} />}
              {(tray.kind === "Chains" || tray.kind === "Necklaces") && (
                <>
                  <path d={`M${cx - s * 1.15},${cy - s * 0.7} Q${cx},${cy + s * (tray.kind === "Necklaces" ? 1.7 : 1.3)} ${cx + s * 1.15},${cy - s * 0.7}`} fill="none" stroke={stroke} strokeWidth={tray.kind === "Necklaces" ? 4 : 2.4} strokeDasharray={dash ?? (tray.kind === "Chains" ? "2 1.5" : undefined)} />
                  {tray.kind === "Necklaces" && <circle cx={cx} cy={cy + s * 0.5} r={s * 0.28} fill={away ? "none" : stroke} stroke={stroke} strokeDasharray={dash} />}
                </>
              )}
              {tray.kind === "Earrings" && (
                <>
                  <circle cx={cx - s * 0.5} cy={cy} r={s * 0.36} fill={away ? "none" : stroke} stroke={stroke} strokeDasharray={dash} />
                  <circle cx={cx + s * 0.5} cy={cy} r={s * 0.36} fill={away ? "none" : stroke} stroke={stroke} strokeDasharray={dash} />
                  <path d={`M${cx - s * 0.5},${cy + s * 0.36} l0,${s * 0.5} M${cx + s * 0.5},${cy + s * 0.36} l0,${s * 0.5}`} stroke={stroke} strokeWidth="1.5" />
                </>
              )}
              {tray.kind === "Rings" && (
                <>
                  <circle cx={cx} cy={cy + 2} r={s * 0.62} fill="none" stroke={stroke} strokeWidth={3} strokeDasharray={dash} />
                  <path d={`M${cx - 4},${cy - s * 0.62} l4,-6 l4,6 z`} fill={tray.karat === "18K" ? "#e9f2ff" : "#b8384a"} opacity={away ? 0.4 : 1} />
                </>
              )}
              {missing && (
                <text x={cx} y={cy + 5} textAnchor="middle" fontSize="16" fontWeight="700" fill="#ff8a6e">
                  ?
                </text>
              )}
              {p.id === last && (
                <circle cx={cx} cy={cy} r={s} fill="none" stroke="#f6dc8e" strokeWidth="1.5">
                  <animate attributeName="r" from={s} to={s * 1.7} dur="0.9s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.9" to="0" dur="0.9s" repeatCount="indefinite" />
                </circle>
              )}
              <text x={cx} y={cy + cellH / 2 - 10} textAnchor="middle" fontSize="9.5" fontFamily="monospace" fill={bad || missing ? "#ff8a6e" : "#e8d3a6"}>
                {isOn ? g3(p.actual) : g3(p.tag)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ---------------- Rate & pricing ---------------- */

function RateTab({ rate }: { rate: number }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<Design | null>(null);
  const [wt, setWt] = React.useState("24.500");
  const [karat, setKarat] = React.useState<Karat>("22K");
  const [va, setVa] = React.useState("11");
  const [making, setMaking] = React.useState("0");
  const [stone, setStone] = React.useState("0");
  const calc = priceOf({ wt: Number(wt) || 0, karat, va: Number(va) || 0, making: Number(making) || 0, stone: Number(stone) || 0 }, rate);
  const board = [
    { k: "24K", label: "24K fine (999)", v: rateFor("24K", rate) },
    { k: "22K", label: "22K (916)", v: Math.round(rate) },
    { k: "18K", label: "18K (750)", v: rateFor("18K", rate) },
    { k: "14K", label: "14K (585)", v: rateFor("14K", rate) },
    { k: "Ag", label: "Silver per gram", v: 142 },
  ];

  return (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="22K board rate" value={`₹${Math.round(rate).toLocaleString("en-IN")}`} delta="+₹50" hint="revised 2:15 PM" icon={Coins} trend={[11080, 11120, 11090, 11150, 11190, 11190, 11240]} />
        <Stat label="Tags repriced today" value="2,418" hint="by Rate Publisher, 0 errors" icon={ScanLine} tone="ok" />
        <Stat label="Average VA on sales" value="10.8%" delta="-0.6%" deltaGood hint="discounts on bridal" icon={Calculator} tone="warn" trend={[11.6, 11.4, 11.5, 11.2, 11.1, 10.9, 10.8]} />
        <Stat label="Sales today" value="₹14.8 L" delta="+18%" hint="vs last Tuesday" icon={IndianRupee} trend={[6, 8.2, 9.1, 11.4, 12.6, 13.9, 14.8]} />
      </div>
      <div className="grid gap-7 lg:grid-cols-[1fr_1.1fr]">
        <Panel title="Rate board" sub="AKGSMA Kerala rate, per gram. The TV, tags and WhatsApp status follow this board.">
          <ul className="divide-y divide-d-line">
            {board.map((b) => (
              <li key={b.k} className="flex items-baseline justify-between gap-3 py-3">
                <span className="font-serif text-[16px]">{b.label}</span>
                <span className="mx-2 mb-1 flex-1 border-b border-dotted border-d-mute/50" />
                <span className="desk-h tnum text-[28px] font-semibold">₹{b.v.toLocaleString("en-IN")}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Btn
              variant="solid"
              icon={Send}
              onClick={() => {
                toast.success("Rate published", { description: "Showroom TV, 2,418 tags and WhatsApp status to 3,100 contacts" });
                desk.log(`Rate ₹${Math.round(rate).toLocaleString("en-IN")} published to TV, tags and WhatsApp`, "ok");
              }}
            >
              Publish rate
            </Btn>
            <Btn icon={MessageCircle} onClick={() => toast("Rate card sent to 14 bridal families", { description: "With their locked rate for comparison" })}>
              Send to bridal families
            </Btn>
          </div>
        </Panel>
        <Panel icon={Calculator} title="Price a piece" sub="Gold at board rate + wastage (VA) + making + stones + HUID, then 3% GST">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Field label="Net weight (g)">
              <input className={inputClass} inputMode="decimal" value={wt} onChange={(e) => setWt(e.target.value.replace(/[^\d.]/g, ""))} />
            </Field>
            <Field label="Purity">
              <select className={inputClass} value={karat} onChange={(e) => setKarat(e.target.value as Karat)}>
                {(["22K", "18K", "14K", "24K"] as Karat[]).map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </Field>
            <Field label="Wastage / VA %">
              <input className={inputClass} inputMode="decimal" value={va} onChange={(e) => setVa(e.target.value.replace(/[^\d.]/g, ""))} />
            </Field>
            <Field label="Making ₹ per g">
              <input className={inputClass} inputMode="numeric" value={making} onChange={(e) => setMaking(e.target.value.replace(/\D/g, ""))} />
            </Field>
            <Field label="Stones ₹">
              <input className={inputClass} inputMode="numeric" value={stone} onChange={(e) => setStone(e.target.value.replace(/\D/g, ""))} />
            </Field>
            <Field label="Rate used">
              <input className={inputClass} readOnly value={`₹${rateFor(karat, rate).toLocaleString("en-IN")}/g`} />
            </Field>
          </div>
          <PriceBreakdown p={calc} />
          <div className="mt-3 flex justify-end gap-2">
            <Btn
              size="sm"
              icon={MessageCircle}
              onClick={() => {
                toast.success("Estimate sent on WhatsApp", { description: `${wt} g ${karat} · ${inr(calc.total)}` });
                desk.log(`Estimate ${inr(calc.total)} for ${wt} g ${karat} sent`, "info");
              }}
            >
              Send estimate
            </Btn>
          </div>
        </Panel>
      </div>
      <Panel title="Design price list" sub="Popular designs at the live rate. Click one for its price card.">
        <DataTable
          rows={designs}
          rowKey={(d) => d.sku}
          search={(d) => `${d.sku} ${d.name} ${d.huid}`}
          searchPlaceholder="Search SKU, design or HUID"
          filter={{ get: (d) => d.kind, options: ["Necklaces", "Bangles", "Chains", "Earrings", "Rings"] }}
          onRow={setOpen}
          columns={[
            { key: "sku", label: "SKU", render: (d) => <span className="font-mono text-[12px]">{d.sku}</span>, sort: (d) => d.sku },
            { key: "name", label: "Design", render: (d) => <span className="font-medium">{d.name}</span>, sort: (d) => d.name },
            { key: "k", label: "Purity", render: (d) => <Pill tone={d.karat === "22K" ? "accent" : "info"}>{d.karat}</Pill> },
            { key: "wt", label: "Weight", align: "right", render: (d) => <span className="tnum font-mono">{d.wt.toFixed(2)} g</span>, sort: (d) => d.wt },
            { key: "va", label: "VA", align: "right", render: (d) => <span className="tnum font-mono">{d.va ? `${d.va}%` : `₹${d.making}/g`}</span>, sort: (d) => d.va, wide: true },
            { key: "huid", label: "HUID", render: (d) => <span className="font-mono text-[11.5px] text-d-mute">{d.huid}</span>, wide: true },
            { key: "price", label: "Price today", align: "right", render: (d) => <span className="tnum font-mono font-semibold">{inr(priceOf(d, rate).total)}</span>, sort: (d) => priceOf(d, rate).total },
          ]}
        />
      </Panel>
      <Panel title="Wastage charged by category" sub="Average VA % this month, sales vs list">
        <Bars
          height={170}
          format={(v) => `${v.toFixed(1)}%`}
          data={[
            { label: "Necklaces", value: 12.4, stack: [{ name: "Charged", value: 11.2, tone: "accent" }, { name: "Discounted", value: 1.2, tone: "warn" }] },
            { label: "Bangles", value: 9, stack: [{ name: "Charged", value: 8.1, tone: "accent" }, { name: "Discounted", value: 0.9, tone: "warn" }] },
            { label: "Chains", value: 7, stack: [{ name: "Charged", value: 6.6, tone: "accent" }, { name: "Discounted", value: 0.4, tone: "warn" }] },
            { label: "Earrings", value: 15, stack: [{ name: "Charged", value: 13.9, tone: "accent" }, { name: "Discounted", value: 1.1, tone: "warn" }] },
            { label: "Rings", value: 9.5, stack: [{ name: "Charged", value: 9.0, tone: "accent" }, { name: "Discounted", value: 0.5, tone: "warn" }] },
          ]}
        />
      </Panel>
      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={open ? `${open.sku} · HUID ${open.huid}` : ""}
        title={open?.name ?? ""}
        sub={open ? `${open.karat} · ${open.wt.toFixed(2)} g net · at ₹${rateFor(open.karat, rate).toLocaleString("en-IN")}/g` : ""}
        footer={
          <>
            <Btn icon={MessageCircle} onClick={() => toast.success("Price card sent", { description: open?.name })}>
              Send price card
            </Btn>
            <Btn variant="solid" onClick={() => setOpen(null)}>
              Done
            </Btn>
          </>
        }
      >
        {open && (
          <div className="space-y-5">
            <PriceBreakdown p={priceOf(open, rate)} />
            <KV items={[{ k: "Category", v: open.kind }, { k: "Wastage", v: open.va ? `${open.va}%` : "—" }, { k: "Making", v: open.making ? `₹${open.making}/g` : "In VA" }, { k: "Stones", v: open.stone ? inr(open.stone) : "None" }]} />
            <p className="font-serif text-[14px] italic text-d-mute">A ₹100/g move in the board rate changes this price by {inr(open.wt * 100 * (PURITY[open.karat] / PURITY["22K"]) * 1.03 * (1 + open.va / 100))}.</p>
          </div>
        )}
      </Sheet>
    </div>
  );
}

function PriceBreakdown({ p }: { p: ReturnType<typeof priceOf> }) {
  const rows = [
    { k: "Gold value", v: p.gold },
    { k: "Wastage (VA)", v: p.va },
    { k: "Making", v: p.making },
    { k: "Stones", v: p.stone },
    { k: "HUID hallmark", v: p.huid },
    { k: "GST 3%", v: p.gst },
  ];
  return (
    <div className="mt-4 rounded-[6px] bg-d-sunk/70 p-4">
      <ul className="space-y-1.5 text-[13.5px]">
        {rows.map((r) => (
          <li key={r.k} className="flex items-baseline gap-2">
            <span>{r.k}</span>
            <span className="mb-1 flex-1 border-b border-dotted border-d-mute/40" />
            <span className="tnum font-mono">{inr(r.v)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 flex items-baseline justify-between border-t-2 border-d-ink pt-2">
        <span className="font-serif text-[16px] italic">To pay</span>
        <span className="desk-h tnum text-[28px] font-semibold">{inr(p.total)}</span>
      </p>
    </div>
  );
}

/* ---------------- Karigar orders ---------------- */

function KarigarTab({ jobs, setJobs }: { jobs: Job[]; setJobs: React.Dispatch<React.SetStateAction<Job[]>> }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<string | null>(null);
  const [issuing, setIssuing] = React.useState(false);
  const job = jobs.find((j) => j.id === open) ?? null;
  const out = jobs.filter((j) => j.stage !== "received");
  const withK = out.reduce((a, j) => a + j.issued, 0);
  const waste = (j: Job) => ((j.issued - j.finished) / j.issued) * 100;
  const ledger = karigars.map((k) => {
    const mine = jobs.filter((j) => j.karigar === k.name);
    const openJobs = mine.filter((j) => j.stage !== "received");
    const done = mine.filter((j) => j.stage === "received");
    return { ...k, open: openJobs.length, balance: openJobs.reduce((a, j) => a + j.issued, 0), avgWaste: mine.length ? mine.reduce((a, j) => a + waste(j), 0) / mine.length : 0, done: done.length, over: mine.filter((j) => waste(j) > j.allowed).length };
  });

  function move(id: string, stage: string) {
    const j = jobs.find((x) => x.id === id);
    if (!j || j.stage === stage) return;
    setJobs((cur) => cur.map((x) => (x.id === id ? { ...x, stage: stage as JobStage } : x)));
    const label = jobStages.find((s) => s.id === stage)?.label ?? stage;
    if (stage === "received") {
      const w = waste(j);
      if (w > j.allowed) {
        toast.error(`${j.id} received: wastage ${w.toFixed(1)}% vs ${j.allowed}% allowed`, { description: `${(j.issued - j.finished - (j.issued * j.allowed) / 100).toFixed(2)} g to deduct from ${j.karigar}` });
        desk.log(`${j.id} over wastage by ${(w - j.allowed).toFixed(1)}%, ${j.karigar}`, "late");
      } else {
        toast.success(`${j.id} received at ${j.finished} g`, { description: `Wastage ${w.toFixed(1)}%, inside ${j.allowed}%` });
        desk.log(`${j.id} received from ${j.karigar}, ${j.finished} g`, "ok");
      }
    } else {
      toast(`${j.id} → ${label}`, { description: j.item });
      desk.log(`${j.id} ${j.item} moved to ${label}`);
    }
  }

  return (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Gold with karigars" value={`${withK.toFixed(1)} g`} hint={`${out.length} open jobs`} icon={Scale} trend={[512, 530, 498, 541, 560, 552, withK]} />
        <Stat label="Due this week" value={out.filter((j) => ["20 Oct", "21 Oct", "22 Oct", "23 Oct", "25 Oct", "26 Oct"].includes(j.due)).length} hint="2 at QC today" icon={Timer} tone="warn" />
        <Stat label="Wastage this month" value="5.4%" delta="-0.3%" deltaGood={false} hint="allowed avg 6%" icon={Hammer} tone="ok" trend={[6.1, 5.9, 6.0, 5.8, 5.6, 5.5, 5.4]} />
        <Stat label="Over limit" value={jobs.filter((j) => waste(j) > j.allowed).length} hint="Tapan, jimikki" icon={AlertTriangle} tone="late" />
      </div>
      <Panel
        title="Bench board"
        sub="Drag a job as it moves. Dropping into Received weighs it back and settles wastage in the karigar book."
        action={
          <Btn size="sm" variant="solid" icon={Plus} onClick={() => setIssuing(true)}>
            Issue gold
          </Btn>
        }
      >
        <Board
          columns={jobStages}
          items={jobs}
          itemKey={(j) => j.id}
          getColumn={(j) => j.stage}
          onMove={move}
          minColumnWidth={200}
          renderCard={(j) => (
            <button type="button" onClick={() => setOpen(j.id)} className="block w-full text-left">
              <p className="flex items-center justify-between gap-2 font-mono text-[11px] text-d-mute">
                {j.id}
                {j.forOrder && <Pill tone="accent">{j.forOrder}</Pill>}
              </p>
              <p className="mt-1 text-[13.5px] font-semibold leading-snug">{j.item}</p>
              <p className="text-[12px] text-d-mute">{j.karigar}</p>
              <p className="mt-2 flex items-center justify-between font-mono text-[11.5px]">
                <span>{j.issued} g out</span>
                <span style={{ color: waste(j) > j.allowed ? "var(--d-late)" : "var(--d-mute)" }}>due {j.due}</span>
              </p>
            </button>
          )}
        />
      </Panel>
      <div className="grid gap-7 lg:grid-cols-[1.3fr_1fr]">
        <Panel title="Karigar book" sub="Balance gold, jobs and wastage per karigar">
          <DataTable
            rows={ledger}
            rowKey={(k) => k.name}
            columns={[
              { key: "n", label: "Karigar", render: (k) => <span className="font-medium">{k.name}</span>, sort: (k) => k.name },
              { key: "p", label: "Unit", render: (k) => <span className="text-d-mute">{k.place}</span>, wide: true },
              { key: "o", label: "Open", align: "right", render: (k) => <span className="tnum font-mono">{k.open}</span>, sort: (k) => k.open },
              { key: "b", label: "Gold held", align: "right", render: (k) => <span className="tnum font-mono">{k.balance.toFixed(1)} g</span>, sort: (k) => k.balance },
              { key: "w", label: "Avg wastage", align: "right", render: (k) => <span className="tnum font-mono" style={{ color: k.over ? "var(--d-late)" : undefined }}>{k.avgWaste.toFixed(1)}%</span>, sort: (k) => k.avgWaste },
              { key: "r", label: "Rating", align: "right", render: (k) => <span className="font-mono">{k.rating}</span>, sort: (k) => k.rating, wide: true },
            ]}
          />
        </Panel>
        <Panel title="Gold out, by karigar" sub="Grams issued and not yet weighed back">
          <HBars format={(v) => `${v.toFixed(1)} g`} data={ledger.filter((k) => k.balance > 0).sort((a, b) => b.balance - a.balance).map((k) => ({ label: k.name, value: k.balance, tone: k.over ? "late" : "accent", sub: `${k.open} job${k.open === 1 ? "" : "s"}` }))} />
        </Panel>
      </div>
      <Sheet
        open={!!job}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={job ? `${job.id} · ${jobStages.find((s) => s.id === job.stage)?.label}` : ""}
        title={job?.item ?? ""}
        sub={job ? `${job.karigar} · due ${job.due}${job.forOrder ? ` · for ${job.forOrder}` : ""}` : ""}
        footer={
          job && job.stage !== "received" ? (
            <Btn
              variant="solid"
              icon={Scale}
              onClick={() => {
                move(job.id, "received");
                setOpen(null);
              }}
            >
              Weigh back & receive
            </Btn>
          ) : undefined
        }
      >
        {job && (
          <div className="space-y-5">
            <KV items={[{ k: "Gold issued", v: `${job.issued} g 22K` }, { k: "Expected back", v: `${job.finished} g` }, { k: "Wastage", v: <span style={{ color: waste(job) > job.allowed ? "var(--d-late)" : "var(--d-ok)" }}>{waste(job).toFixed(1)}%</span> }, { k: "Allowed", v: `${job.allowed}%` }]} />
            <div>
              <p className="mb-1 text-[12px] text-d-mute">Wastage against allowance</p>
              <Meter value={waste(job)} max={job.allowed * 1.5} tone={waste(job) > job.allowed ? "late" : "ok"} />
            </div>
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Move to</p>
              <Segmented size="sm" options={jobStages.map((s) => ({ value: s.id, label: s.label }))} value={job.stage} onChange={(v) => move(job.id, v)} />
            </div>
          </div>
        )}
      </Sheet>
      <IssueGold
        open={issuing}
        onOpenChange={setIssuing}
        onIssue={(j) => {
          setJobs((cur) => [j, ...cur]);
          toast.success(`${j.issued} g issued to ${j.karigar}`, { description: `${j.id} · ${j.item}` });
          desk.log(`${j.issued} g issued to ${j.karigar} for ${j.item}`, "warn");
        }}
      />
    </div>
  );
}

function IssueGold({ open, onOpenChange, onIssue }: { open: boolean; onOpenChange: (o: boolean) => void; onIssue: (j: Job) => void }) {
  const [item, setItem] = React.useState("Choker, BR-118");
  const [karigar, setKarigar] = React.useState(karigars[0].name);
  const [grams, setGrams] = React.useState("32.5");
  const [allowed, setAllowed] = React.useState("6");
  const [n, setN] = React.useState(935);
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Issue gold to a karigar" sub="Weighed out on the counter scale and signed in the karigar book.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const g = Number(grams) || 10;
          const a = Number(allowed) || 6;
          onIssue({ id: `KR-0${n}`, item, karigar, issued: g, finished: Math.round(g * (1 - (a - 0.8) / 100) * 10) / 10, allowed: a, due: "4 Nov", stage: "issued" });
          setN((x) => x + 1);
          onOpenChange(false);
        }}
      >
        <Field label="Item">
          <input className={inputClass} value={item} onChange={(e) => setItem(e.target.value)} />
        </Field>
        <Field label="Karigar">
          <select className={inputClass} value={karigar} onChange={(e) => setKarigar(e.target.value)}>
            {karigars.map((k) => (
              <option key={k.name}>{k.name}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="22K grams issued">
            <input className={inputClass} inputMode="decimal" value={grams} onChange={(e) => setGrams(e.target.value.replace(/[^\d.]/g, ""))} />
          </Field>
          <Field label="Wastage allowed %">
            <input className={inputClass} inputMode="decimal" value={allowed} onChange={(e) => setAllowed(e.target.value.replace(/[^\d.]/g, ""))} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Btn onClick={() => onOpenChange(false)}>Cancel</Btn>
          <Btn variant="solid" type="submit" icon={Scale}>
            Issue and sign
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Schemes ---------------- */

function SchemesTab() {
  const desk = useDesk();
  const [rows, setRows] = React.useState(members);
  const [open, setOpen] = React.useState<Member | null>(null);
  const [reminded, setReminded] = React.useState<Set<string>>(new Set());
  const [adding, setAdding] = React.useState(false);
  const status = rows.map(memberStatus);
  const buckets = [
    { label: "Regular", value: status.filter((s) => s === "Regular").length, tone: "ok" as const },
    { label: "Late 31–60 d", value: status.filter((s) => s === "Late").length, tone: "warn" as const },
    { label: "Defaulter 60+ d", value: status.filter((s) => s === "Defaulter").length, tone: "late" as const },
    { label: "Matured", value: status.filter((s) => s === "Matured").length, tone: "accent" as const },
  ];

  return (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Active members" value="412" delta="+19" hint="this month" icon={Users} trend={[352, 361, 370, 381, 389, 398, 412]} />
        <Stat label="Collected in October" value="₹31.8 L" delta="+6%" icon={IndianRupee} tone="ok" trend={[24, 26, 27.5, 28.1, 29, 30.2, 31.8]} />
        <Stat label="Defaulters" value="5" hint={`over 60 days across the book · ${status.filter((s) => s === "Defaulter").length} in this view`} icon={AlertTriangle} tone="late" />
        <Stat label="Maturing this month" value={status.filter((s) => s === "Matured").length} hint="redeem in gold, bonus month on us" icon={PiggyBank} tone="accent" />
      </div>
      <Panel title="Member health" sub="Swarna Nidhi 11+1 and Kalyan Kuri 24, sampled from the scheme ledger">
        <AgingBar buckets={buckets} format={(v) => `${v} members`} />
      </Panel>
      <div className="grid gap-7 xl:grid-cols-[1fr_340px]">
        <Panel
          title="Scheme ledger"
          sub="Select members to send instalment reminders with a UPI link"
          action={
            <Btn size="sm" variant="solid" icon={Plus} onClick={() => setAdding(true)}>
              Enrol member
            </Btn>
          }
        >
          <DataTable
            rows={rows}
            rowKey={(m) => m.id}
            search={(m) => `${m.id} ${m.name} ${m.town}`}
            searchPlaceholder="Search member, town or card no."
            filter={{ get: memberStatus, options: ["Regular", "Late", "Defaulter", "Matured"] }}
            onRow={setOpen}
            bulk={[
              {
                label: "Send reminders",
                run: (keys) => {
                  setReminded((s) => new Set([...s, ...keys]));
                  toast.success(`${keys.length} reminders sent on WhatsApp`, { description: "Each with a Razorpay UPI link" });
                  desk.log(`${keys.length} scheme reminders sent`, "info");
                },
              },
            ]}
            columns={[
              { key: "id", label: "Card", render: (m) => <span className="font-mono text-[12px]">{m.id}</span> },
              { key: "n", label: "Member", render: (m) => <span className="font-medium">{m.name}</span>, sort: (m) => m.name },
              { key: "t", label: "Town", render: (m) => <span className="text-d-mute">{m.town}</span>, wide: true },
              { key: "m", label: "Monthly", align: "right", render: (m) => <span className="tnum font-mono">{inr(m.monthly)}</span>, sort: (m) => m.monthly },
              { key: "p", label: "Paid", render: (m) => (
                <div className="flex min-w-[110px] items-center gap-2">
                  <Meter value={m.paid} max={m.of} tone={memberTone[memberStatus(m)]} />
                  <span className="font-mono text-[11px] text-d-mute">{m.paid}/{m.of}</span>
                </div>
              ), sort: (m) => m.paid / m.of },
              { key: "l", label: "Last paid", align: "right", render: (m) => <span className="tnum font-mono" style={{ color: m.lastPaid > 60 ? "var(--d-late)" : m.lastPaid > 31 ? "var(--d-warn)" : undefined }}>{m.lastPaid} d</span>, sort: (m) => m.lastPaid },
              { key: "s", label: "Status", render: (m) => (reminded.has(m.id) ? <Pill tone="info">Reminded</Pill> : <Pill tone={memberTone[memberStatus(m)]}>{memberStatus(m)}</Pill>) },
            ]}
          />
        </Panel>
        <Panel title="Collections by month" sub="₹ lakh, both schemes">
          <Bars height={200} format={(v) => `₹${v}L`} data={[{ label: "May", value: 24 }, { label: "Jun", value: 26 }, { label: "Jul", value: 27.5 }, { label: "Aug", value: 28.1 }, { label: "Sep", value: 30.2 }, { label: "Oct", value: 31.8, tone: "ok" }]} />
          <p className="mt-4 font-serif text-[14px] italic text-d-mute">Members who set up a UPI mandate pay 96% on time; manual payers, 71%.</p>
        </Panel>
      </div>
      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={open ? `${open.id} · ${open.plan}` : ""}
        title={open?.name ?? ""}
        sub={open ? `${open.town} · ${open.phone} · joined ${open.joined}` : ""}
        footer={
          open && (
            <>
              {memberStatus(open) === "Matured" ? (
                <Btn
                  variant="solid"
                  icon={Gem}
                  onClick={() => {
                    toast.success(`${open.name} invited to redeem`, { description: `${inr(open.monthly * (open.of + 1))} in gold, bonus month included` });
                    desk.log(`Redemption invite sent to ${open.name}`, "ok");
                    setOpen(null);
                  }}
                >
                  Invite to redeem
                </Btn>
              ) : (
                <Btn
                  variant="solid"
                  icon={MessageCircle}
                  onClick={() => {
                    setReminded((s) => new Set(s).add(open.id));
                    toast.success("Reminder sent", { description: `${open.name} · ${inr(open.monthly)} with UPI link` });
                    desk.log(`Scheme reminder sent to ${open.name}`);
                    setOpen(null);
                  }}
                >
                  Send reminder
                </Btn>
              )}
              <Btn
                onClick={() => {
                  setRows((cur) => cur.map((m) => (m.id === open.id ? { ...m, paid: Math.min(m.of, m.paid + 1), lastPaid: 0 } : m)));
                  toast.success("Instalment recorded", { description: `${inr(open.monthly)} cash at counter · receipt in Tally` });
                  desk.log(`${open.name} paid ${inr(open.monthly)} at the counter`, "ok");
                  setOpen(null);
                }}
              >
                Record payment
              </Btn>
            </>
          )
        }
      >
        {open && (
          <div className="space-y-5">
            <KV items={[{ k: "Monthly", v: inr(open.monthly) }, { k: "Paid so far", v: inr(open.monthly * open.paid) }, { k: "Maturity", v: open.maturity }, { k: "Status", v: <Pill tone={memberTone[memberStatus(open)]}>{memberStatus(open)}</Pill> }]} />
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Instalments</p>
              <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
                {Array.from({ length: open.of }, (_, i) => (
                  <span key={i} className="flex h-9 items-center justify-center rounded-[4px] font-mono text-[11px]" style={{ background: i < open.paid ? "var(--d-accent)" : "var(--d-sunk)", color: i < open.paid ? "var(--d-accent-ink)" : "var(--d-mute)" }}>
                    {i + 1}
                  </span>
                ))}
                {open.plan === "Swarna Nidhi 11+1" && <span className="flex h-9 items-center justify-center rounded-[4px] border border-dashed border-d-accent font-mono text-[10px] text-d-accent">+1</span>}
              </div>
            </div>
          </div>
        )}
      </Sheet>
      <EnrolMember
        open={adding}
        onOpenChange={setAdding}
        onAdd={(m) => {
          setRows((cur) => [m, ...cur]);
          toast.success(`${m.name} enrolled`, { description: `${m.plan} · ${inr(m.monthly)}/month · card ${m.id}` });
          desk.log(`New scheme member ${m.name}, ${inr(m.monthly)}/month`, "ok");
        }}
      />
    </div>
  );
}

function EnrolMember({ open, onOpenChange, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (m: Member) => void }) {
  const [name, setName] = React.useState("Ancy Francis");
  const [town, setTown] = React.useState("Thrissur");
  const [monthly, setMonthly] = React.useState("5000");
  const [plan, setPlan] = React.useState<Member["plan"]>("Swarna Nidhi 11+1");
  const [n, setN] = React.useState(2271);
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Enrol a scheme member" sub="First instalment is taken today. Card and passbook go on WhatsApp.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const of = plan === "Kalyan Kuri 24" ? 24 : 11;
          onAdd({ id: `${plan === "Kalyan Kuri 24" ? "KK" : "SN"}-${n}`, name, town, plan, monthly: Number(monthly) || 1000, paid: 1, of, joined: "Oct 2026", maturity: of === 11 ? "Sep 2027" : "Sep 2028", lastPaid: 0, phone: "new" });
          setN((x) => x + 1);
          onOpenChange(false);
        }}
      >
        <Field label="Name">
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Town">
            <input className={inputClass} value={town} onChange={(e) => setTown(e.target.value)} />
          </Field>
          <Field label="Monthly ₹">
            <input className={inputClass} inputMode="numeric" value={monthly} onChange={(e) => setMonthly(e.target.value.replace(/\D/g, ""))} />
          </Field>
        </div>
        <Field label="Scheme">
          <select className={inputClass} value={plan} onChange={(e) => setPlan(e.target.value as Member["plan"])}>
            <option>Swarna Nidhi 11+1</option>
            <option>Kalyan Kuri 24</option>
          </select>
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Btn onClick={() => onOpenChange(false)}>Cancel</Btn>
          <Btn variant="solid" type="submit" icon={Plus}>
            Enrol and take first instalment
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Bridal ---------------- */

function BridalTab({ rate }: { rate: number }) {
  const desk = useDesk();
  const [rows, setRows] = React.useState(bookings);
  const [open, setOpen] = React.useState<string | null>(null);
  const b = rows.find((x) => x.id === open) ?? null;
  const live = rows.filter((x) => x.stage !== "Delivered");
  const exposure = live.filter((x) => x.lockedRate).reduce((a, x) => a + x.grams * (rate - x.lockedRate), 0);

  function lockRate(id: string) {
    setRows((cur) => cur.map((x) => (x.id === id ? { ...x, lockedRate: Math.round(rate), items: x.items.map((it) => (it.label.startsWith("Rate not locked") ? { ...it, label: `Rate locked at ₹${Math.round(rate).toLocaleString("en-IN")}`, done: true } : it)) } : x)));
    toast.success("Rate locked", { description: `₹${Math.round(rate).toLocaleString("en-IN")}/g with a 10% advance link sent` });
    desk.log(`Rate locked at ₹${Math.round(rate).toLocaleString("en-IN")} for ${id}`, "ok");
  }

  return (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Weddings booked" value={live.length} hint="next 90 days" icon={Crown} trend={[4, 5, 5, 6, 6, 7, live.length]} />
        <Stat label="Gold booked" value={`${live.reduce((a, x) => a + x.grams, 0).toLocaleString("en-IN")} g`} hint="at locked rates" icon={Scale} />
        <Stat label="Rate-lock exposure" value={inr(exposure, { compact: true })} delta={exposure > 0 ? "+₹50/g" : "0"} deltaGood={false} hint="board above locked rates" icon={AlertTriangle} tone="warn" />
        <Stat label="Advances held" value={inr(live.reduce((a, x) => a + x.advance, 0), { compact: true })} hint="UPI + old gold" icon={IndianRupee} tone="ok" />
      </div>
      <div className="grid gap-7 xl:grid-cols-[1fr_320px]">
        <Panel title="Wedding bookings" sub="Click a family for the set, the karigar jobs and the money">
          <DataTable
            rows={rows}
            rowKey={(x) => x.id}
            search={(x) => `${x.id} ${x.family} ${x.town}`}
            searchPlaceholder="Search family or town"
            filter={{ get: (x) => x.stage, options: ["Design", "Karigar", "Hallmark", "Ready", "Delivered"] }}
            onRow={(x) => setOpen(x.id)}
            columns={[
              { key: "id", label: "Order", render: (x) => <span className="font-mono text-[12px]">{x.id}</span> },
              { key: "f", label: "Family", render: (x) => <span className="font-medium">{x.family}</span>, sort: (x) => x.family },
              { key: "w", label: "Wedding", render: (x) => <span className="text-d-mute">{x.wedding}</span>, wide: true },
              { key: "c", label: "Days left", render: (x) => (x.stage === "Delivered" ? <span className="text-d-mute">—</span> : <span className="text-[12px]" style={{ color: x.inDays < 10 ? "var(--d-late)" : undefined }}><Countdown compact inHours={x.inDays * 24 - 14 + (x.grams % 9)} /></span>), sort: (x) => x.inDays },
              { key: "g", label: "Gold", align: "right", render: (x) => <span className="tnum font-mono">{x.grams} g</span>, sort: (x) => x.grams },
              { key: "r", label: "Locked", align: "right", render: (x) => (x.lockedRate ? <span className="tnum font-mono">₹{x.lockedRate.toLocaleString("en-IN")}</span> : <Pill tone="late">Open</Pill>) },
              { key: "s", label: "Stage", render: (x) => <Pill tone={stageTone[x.stage]}>{x.stage}</Pill> },
            ]}
          />
        </Panel>
        <Panel title="Where the sets are" sub="Grams by stage">
          <Donut
            center={`${live.reduce((a, x) => a + x.grams, 0)}`}
            sub="grams"
            segments={(["Design", "Karigar", "Hallmark", "Ready"] as const).map((s, i) => ({ label: s, value: live.filter((x) => x.stage === s).reduce((a, x) => a + x.grams, 0), tone: (["neutral", "info", "accent", "ok"] as const)[i] }))}
          />
        </Panel>
      </div>
      <Panel title="Rate-lock watch" sub={`Board ₹${Math.round(rate).toLocaleString("en-IN")} vs each family's locked rate. Positive means the shop absorbs the rise.`}>
        <HBars
          format={(v) => inr(v, { compact: true })}
          data={live.map((x) => ({ label: `${x.id} ${x.family.split(" (")[0]}`, value: x.lockedRate ? Math.max(0, x.grams * (rate - x.lockedRate)) : x.grams * 200, tone: x.lockedRate ? ("warn" as const) : ("late" as const), sub: x.lockedRate ? `${x.grams} g at ₹${x.lockedRate.toLocaleString("en-IN")}` : "not locked, ₹200/g risk to family" }))}
        />
      </Panel>
      <Sheet
        open={!!b}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={b ? `${b.id} · consultant ${b.consultant}` : ""}
        title={b?.family ?? ""}
        sub={b ? `${b.wedding} · ${b.grams} g` : ""}
        footer={
          b && (
            <>
              {!b.lockedRate && (
                <Btn variant="solid" icon={Coins} onClick={() => lockRate(b.id)}>
                  Lock today&apos;s rate
                </Btn>
              )}
              <Btn
                icon={Send}
                onClick={() => {
                  toast.success("Progress update sent", { description: `${b.family} · photos and checklist on WhatsApp` });
                  desk.log(`Bridal update sent to ${b.family}`);
                }}
              >
                Send update
              </Btn>
            </>
          )
        }
      >
        {b && (
          <div className="space-y-5">
            {b.stage !== "Delivered" && (
              <div className="rounded-[6px] bg-d-soft p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-d-accent">Until the muhurtham</p>
                <div className="mt-2">
                  <Countdown inHours={b.inDays * 24 - 6} />
                </div>
              </div>
            )}
            <KV items={[{ k: "Locked rate", v: b.lockedRate ? `₹${b.lockedRate.toLocaleString("en-IN")}/g` : "Not locked" }, { k: "Value at lock", v: b.lockedRate ? inr(b.grams * b.lockedRate * 1.14, { compact: true }) : "—" }, { k: "Advance", v: inr(b.advance) }, { k: "Stage", v: <Pill tone={stageTone[b.stage]}>{b.stage}</Pill> }]} />
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">The set</p>
              <Checklist
                items={b.items}
                onToggle={(id) => {
                  setRows((cur) => cur.map((x) => (x.id === b.id ? { ...x, items: x.items.map((it) => (it.id === id ? { ...it, done: !it.done } : it)) } : x)));
                  desk.log(`${b.id}: ${b.items.find((it) => it.id === id)?.label} updated`);
                }}
              />
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Old gold ---------------- */

function KaratMeter({ value }: { value: number }) {
  const shown = useTween(value, 1400);
  const min = 14;
  const max = 24;
  const f = Math.max(0, Math.min(1, (shown - min) / (max - min)));
  const a = Math.PI * (1 - f);
  const cx = 160;
  const cy = 150;
  const r = 120;
  return (
    <svg viewBox="0 0 320 180" className="mx-auto block w-full max-w-[360px]">
      <defs>
        <linearGradient id="jwKarat" x1="0" x2="1">
          <stop offset="0%" stopColor="#b9a68a" />
          <stop offset="60%" stopColor="#d8ad4a" />
          <stop offset="100%" stopColor="#f3cf61" />
        </linearGradient>
      </defs>
      <path d={`M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}`} fill="none" stroke="var(--d-sunk)" strokeWidth="18" />
      <path d={`M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}`} fill="none" stroke="url(#jwKarat)" strokeWidth="18" strokeDasharray={`${Math.PI * r * f} ${Math.PI * r}`} />
      {[14, 18, 20, 22, 24].map((k) => {
        const t = (k - min) / (max - min);
        const ang = Math.PI * (1 - t);
        return (
          <g key={k}>
            <line x1={cx + trig.cos(ang) * (r - 14)} y1={cy - trig.sin(ang) * (r - 14)} x2={cx + trig.cos(ang) * (r + 12)} y2={cy - trig.sin(ang) * (r + 12)} stroke="var(--d-ink)" strokeOpacity="0.5" />
            <text x={cx + trig.cos(ang) * (r + 24)} y={cy - trig.sin(ang) * (r + 24) + 4} textAnchor="middle" fontSize="11" fontFamily="monospace" fill="var(--d-mute)">
              {k}K
            </text>
          </g>
        );
      })}
      <line x1={cx} y1={cy} x2={cx + trig.cos(a) * (r - 22)} y2={cy - trig.sin(a) * (r - 22)} stroke="var(--d-ink)" strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="7" fill="var(--d-ink)" />
      <text x={cx} y={cy - 36} textAnchor="middle" fontSize="30" fontWeight="600" fill="var(--d-ink)" fontFamily="var(--font-serif)">
        {shown.toFixed(1)}K
      </text>
      <text x={cx} y={cy - 18} textAnchor="middle" fontSize="11" fill="var(--d-mute)" fontFamily="monospace">
        {((shown / 24) * 100).toFixed(1)}% fine
      </text>
    </svg>
  );
}

function OldGoldTab({ rate }: { rate: number }) {
  const desk = useDesk();
  const [queue, setQueue] = React.useState(oldQueue);
  const [done, setDone] = React.useState(oldDone);
  const [sel, setSel] = React.useState(oldQueue[0].id);
  const [tested, setTested] = React.useState<Record<string, boolean>>({});
  const [testing, setTesting] = React.useState(false);
  const [open, setOpen] = React.useState<(OldLot & { value: number }) | null>(null);
  const lot = queue.find((q) => q.id === sel) ?? queue[0];
  const r24 = rateFor("24K", rate);
  const isTested = lot ? tested[lot.id] : false;
  const val = lot ? oldValue(lot, r24) : null;

  React.useEffect(() => {
    if (!testing) return;
    const id = window.setTimeout(() => {
      setTesting(false);
      if (lot) setTested((t) => ({ ...t, [lot.id]: true }));
    }, 1600);
    return () => window.clearTimeout(id);
  }, [testing, lot]);

  function accept() {
    if (!lot || !val) return;
    const value = Math.round(val.melt);
    setDone((cur) => [{ ...lot, time: "now", value }, ...cur]);
    const rest = queue.filter((q) => q.id !== lot.id);
    setQueue(rest);
    if (rest[0]) setSel(rest[0].id);
    toast.success(`${lot.mode === "Exchange" ? "Exchange credit" : "Buy-back"} ${inr(value)}`, { description: `${lot.customer} · ${val.net.toFixed(2)} g at ${lot.karat}K${lot.mode === "Buy-back" && value > 200000 ? " · PAN required" : ""}` });
    desk.log(`Old gold ${lot.id} ${lot.customer}: ${inr(value)} at ${lot.karat}K`, "ok");
  }

  return (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Old gold bought today" value={`${done.reduce((a, d) => a + d.gross, 0).toFixed(1)} g`} hint={`${done.length} lots`} icon={Recycle} trend={[0, 31, 44, 66, 72, 101, done.reduce((a, d) => a + d.gross, 0)]} />
        <Stat label="Credited" value={inr(done.reduce((a, d) => a + d.value, 0), { compact: true })} hint="exchange + buy-back" icon={IndianRupee} tone="ok" />
        <Stat label="Average purity" value={`${(done.reduce((a, d) => a + d.karat, 0) / Math.max(1, done.length)).toFixed(1)}K`} hint="XRF, after melting check" icon={FlaskConical} />
        <Stat label="Waiting" value={queue.length} hint="at the old-gold desk" icon={Timer} tone="warn" />
      </div>
      <div className="grid gap-7 lg:grid-cols-[300px_1fr]">
        <Panel title="Queue" sub="Customers at the desk">
          <ul className="space-y-1.5">
            {queue.map((q) => (
              <li key={q.id}>
                <button type="button" onClick={() => setSel(q.id)} className="w-full rounded-[6px] border px-3 py-2 text-left" style={{ borderColor: q.id === lot?.id ? "var(--d-accent)" : "var(--d-line)", background: q.id === lot?.id ? "var(--d-soft)" : "var(--d-panel)" }}>
                  <p className="flex justify-between text-[13.5px] font-medium">
                    {q.customer}
                    <span className="font-mono text-[11px] text-d-mute">{q.time}</span>
                  </p>
                  <p className="truncate text-[12px] text-d-mute">
                    {q.gross} g · {q.items}
                  </p>
                </button>
              </li>
            ))}
            {queue.length === 0 && <p className="py-6 text-center font-serif italic text-d-mute">Queue clear.</p>}
          </ul>
        </Panel>
        {lot && val ? (
          <Panel icon={FlaskConical} title={`Purity test · ${lot.customer}`} sub={`${lot.id} · ${lot.town} · ${lot.items} · ${lot.mode}`}>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <KaratMeter value={testing ? 24 : isTested ? lot.karat : 14} />
                <div className="mt-2 flex justify-center gap-2">
                  <Btn variant={isTested ? "outline" : "solid"} icon={FlaskConical} disabled={testing} onClick={() => setTesting(true)}>
                    {testing ? "Reading XRF…" : isTested ? "Retest" : "Run XRF test"}
                  </Btn>
                </div>
                {testing && <div className="desk-shimmer mx-auto mt-3 h-1 w-48 rounded-full" />}
              </div>
              <div>
                <PriceRows
                  rows={[
                    { k: "Gross weight", v: `${lot.gross.toFixed(2)} g` },
                    { k: "Less stones & wax", v: `${lot.stones.toFixed(2)} g` },
                    { k: "Net weight", v: `${val.net.toFixed(2)} g` },
                    { k: "Purity", v: isTested ? `${lot.karat}K` : "test pending" },
                    { k: "Fine gold", v: isTested ? `${val.fine.toFixed(3)} g` : "—" },
                    { k: "24K rate less 2%", v: `₹${Math.round(r24 * 0.98).toLocaleString("en-IN")}/g` },
                  ]}
                />
                <p className="mt-3 flex items-baseline justify-between border-t-2 border-d-ink pt-2">
                  <span className="font-serif text-[16px] italic">{lot.mode === "Exchange" ? "Credit against new" : "Pay customer"}</span>
                  <span className="desk-h tnum text-[28px] font-semibold">{isTested ? inr(val.melt) : "—"}</span>
                </p>
                {lot.mode === "Buy-back" && isTested && val.melt > 200000 && <p className="mt-2 text-[12.5px] text-d-warn">Over ₹2 L: PAN and bank transfer only.</p>}
                <div className="mt-4 flex justify-end gap-2">
                  <Btn
                    onClick={() => {
                      toast("Customer declined", { description: "Gold returned, test slip printed" });
                      desk.log(`${lot.customer} declined old-gold offer`);
                    }}
                  >
                    Declined
                  </Btn>
                  <Btn variant="solid" icon={CheckCheck} disabled={!isTested} onClick={accept}>
                    Accept & credit
                  </Btn>
                </div>
              </div>
            </div>
          </Panel>
        ) : (
          <Panel title="Purity test">
            <p className="py-10 text-center font-serif text-[15px] italic text-d-mute">No one waiting at the old-gold desk.</p>
          </Panel>
        )}
      </div>
      <Panel title="Bought today" sub="Each lot with its XRF slip and Tally purchase voucher">
        <DataTable
          rows={done}
          rowKey={(d) => d.id}
          search={(d) => `${d.id} ${d.customer} ${d.town}`}
          searchPlaceholder="Search lot or customer"
          filter={{ get: (d) => d.mode, options: ["Exchange", "Buy-back"] }}
          onRow={setOpen}
          columns={[
            { key: "id", label: "Lot", render: (d) => <span className="font-mono text-[12px]">{d.id}</span> },
            { key: "c", label: "Customer", render: (d) => <span className="font-medium">{d.customer}</span>, sort: (d) => d.customer },
            { key: "i", label: "Items", render: (d) => <span className="text-d-mute">{d.items}</span>, wide: true },
            { key: "g", label: "Gross", align: "right", render: (d) => <span className="tnum font-mono">{d.gross.toFixed(1)} g</span>, sort: (d) => d.gross },
            { key: "k", label: "Purity", align: "right", render: (d) => <span className="tnum font-mono">{d.karat}K</span>, sort: (d) => d.karat },
            { key: "v", label: "Value", align: "right", render: (d) => <span className="tnum font-mono">{inr(d.value)}</span>, sort: (d) => d.value },
            { key: "m", label: "Mode", render: (d) => <Pill tone={d.mode === "Exchange" ? "accent" : "info"}>{d.mode}</Pill> },
          ]}
        />
      </Panel>
      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)} eyebrow={open ? `${open.id} · ${open.time}` : ""} title={open?.customer ?? ""} sub={open ? `${open.town} · ${open.items}` : ""}>
        {open && (
          <div className="space-y-5">
            <KV items={[{ k: "Gross", v: `${open.gross} g` }, { k: "Stones", v: `${open.stones} g` }, { k: "Purity", v: `${open.karat}K` }, { k: "Value", v: inr(open.value) }, { k: "Mode", v: open.mode }, { k: "Voucher", v: `PV/26-27/${open.id.slice(3)}` }]} />
            <KaratMeter value={open.karat} />
          </div>
        )}
      </Sheet>
    </div>
  );
}

function PriceRows({ rows }: { rows: { k: string; v: string }[] }) {
  return (
    <ul className="space-y-1.5 text-[13.5px]">
      {rows.map((r) => (
        <li key={r.k} className="flex items-baseline gap-2">
          <span>{r.k}</span>
          <span className="mb-1 flex-1 border-b border-dotted border-d-mute/40" />
          <span className="tnum font-mono">{r.v}</span>
        </li>
      ))}
    </ul>
  );
}
