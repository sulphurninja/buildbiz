"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  BadgeCheck,
  Banknote,
  Bot,
  Building2,
  CalendarDays,
  Car,
  CheckCheck,
  Compass,
  FileCheck2,
  FileText,
  Gauge as GaugeIcon,
  Handshake,
  IndianRupee,
  KeyRound,
  Landmark,
  MapPin,
  MessageCircle,
  PhoneCall,
  Plane,
  Plug,
  Plus,
  Receipt,
  Route,
  Send,
  ShieldCheck,
  Sparkles,
  Stamp,
  Timer,
  UserPlus,
  Users,
} from "lucide-react";
import { DeskShell, useDesk } from "../shell";
import { AreaChart, Bars, Donut, Gauge, HBars } from "../charts";
import { AgingBar, ApprovalQueue, Board, Checklist, Countdown, DataTable } from "../data";
import { AgentsModule, ConnectionsModule, IndependenceModule, PeopleModule } from "../common";
import { Avatar, Btn, Field, inputClass, inr, KV, Meter, Modal, Panel, Pill, Segmented, Sheet, Stat } from "../ui";
import { useDrift } from "../hooks";
import type { DeskConfig, DeskModule, IndependenceData, Integration, TeamMember, Tone, WorkforceAgent } from "../types";

/* ============================================================
   Data — Yamuna Realty, Noida. Fictional channel-partner brokerage on
   the Noida–Greater Noida Expressway and the Yamuna Expressway.
   Today is Tue 20 Oct 2026. Week days: 0 = Tue 20 … 6 = Mon 26.
   ============================================================ */

type NodeId = "s128" | "s137" | "s150" | "gnw" | "yeida";
type Stage = "new" | "qualified" | "visit" | "negotiation" | "token";
type UnitStatus = "Available" | "Hold" | "Token" | "Sold";

const NODES: { id: NodeId; name: string; short: string; x: number; y: number; psf: string; note: string }[] = [
  { id: "s128", name: "Sector 128", short: "128", x: 300, y: 62, psf: "₹15.8k–17.2k", note: "Golf and river-view towers, top of the corridor" },
  { id: "s137", name: "Sector 137", short: "137", x: 352, y: 166, psf: "₹8.6k–9.6k", note: "Ready-to-move, metro on the Aqua line" },
  { id: "s150", name: "Sector 150", short: "150", x: 424, y: 262, psf: "₹12.1k–14k", note: "Low-density, 80% green, sports city" },
  { id: "gnw", name: "Greater Noida West", short: "GNW", x: 612, y: 96, psf: "₹6.6k–7.6k", note: "Mid-segment family buyers, highest volume" },
  { id: "yeida", name: "Jewar / YEIDA", short: "YEIDA", x: 646, y: 418, psf: "₹4.6k–6.4k", note: "Plots and villas near the new airport" },
];
const nodeOf = (id: NodeId) => NODES.find((n) => n.id === id)!;

type Project = { id: string; name: string; node: NodeId; builder: string; rera: string; towers: string[]; floors: number; psf: number; possession: string; ready: boolean; brokerage: number; config: string; left: number; total: number };
const PROJECTS: Project[] = [
  { id: "KH", name: "Kesar Heights", node: "s150", builder: "Shivalik Infracon", rera: "UPRERAPRJ445219", towers: ["A", "B", "C"], floors: 24, psf: 12400, possession: "Dec 2027", ready: false, brokerage: 0.025, config: "3 & 4 BHK", left: 64, total: 288 },
  { id: "NS", name: "Neelgiri Skyvilla", node: "s150", builder: "Ganga Realtech", rera: "UPRERAPRJ218734", towers: ["T1", "T2"], floors: 18, psf: 13600, possession: "Ready, OC received", ready: true, brokerage: 0.02, config: "3 & 4 BHK", left: 21, total: 144 },
  { id: "TP", name: "Trident Palm Court", node: "s137", builder: "Trident Buildwell", rera: "UPRERAPRJ6721", towers: ["D", "E", "F"], floors: 16, psf: 9100, possession: "Ready to move", ready: true, brokerage: 0.02, config: "2 & 3 BHK", left: 38, total: 192 },
  { id: "YV", name: "Yamuna Vista Residences", node: "s128", builder: "Riverbank Developers", rera: "UPRERAPRJ552081", towers: ["R1", "R2"], floors: 26, psf: 16800, possession: "Jun 2028", ready: false, brokerage: 0.03, config: "4 BHK + study", left: 47, total: 104 },
  { id: "SV", name: "Sapphire Ville", node: "gnw", builder: "Ashoka Homes", rera: "UPRERAPRJ337910", towers: ["2", "3", "5"], floors: 20, psf: 7200, possession: "Mar 2027", ready: false, brokerage: 0.03, config: "2 & 3 BHK", left: 112, total: 480 },
  { id: "AG", name: "Ashoka Greens Ph 2", node: "gnw", builder: "Ashoka Homes", rera: "UPRERAPRJ129045", towers: ["A", "B"], floors: 14, psf: 6800, possession: "Ready to move", ready: true, brokerage: 0.02, config: "2 BHK", left: 17, total: 224 },
  { id: "AE", name: "Airport Edge Villas", node: "yeida", builder: "Jewar Landmark Infra", rera: "UPRERAPRJ601337", towers: ["V"], floors: 1, psf: 6100, possession: "Dec 2028", ready: false, brokerage: 0.03, config: "Villas 2,400 sq ft", left: 29, total: 60 },
  { id: "AP", name: "Aerocity Plots, Sector 18", node: "yeida", builder: "YEIDA resale", rera: "Authority plot · lease deed", towers: ["18"], floors: 1, psf: 4700, possession: "Lease deed ready", ready: true, brokerage: 0.02, config: "Plots 150–250 sq m", left: 9, total: 9 },
];
const projectOf = (id: string) => PROJECTS.find((p) => p.id === id)!;

type Unit = { id: string; project: string; tower: string; floor: number; bhk: string; area: number; facing: string; psf: number; plc: number; status: UnitStatus };
const UNITS: Unit[] = [
  { id: "KH-A-1203", project: "KH", tower: "A", floor: 12, bhk: "3 BHK", area: 1850, facing: "Park facing", psf: 12600, plc: 350000, status: "Available" },
  { id: "KH-B-0804", project: "KH", tower: "B", floor: 8, bhk: "3 BHK", area: 1850, facing: "East", psf: 12350, plc: 0, status: "Available" },
  { id: "KH-C-1902", project: "KH", tower: "C", floor: 19, bhk: "4 BHK", area: 2650, facing: "Golf view", psf: 12900, plc: 550000, status: "Hold" },
  { id: "NS-T2-1501", project: "NS", tower: "T2", floor: 15, bhk: "3 BHK", area: 2050, facing: "North-east", psf: 13600, plc: 300000, status: "Available" },
  { id: "NS-T1-0602", project: "NS", tower: "T1", floor: 6, bhk: "4 BHK", area: 2900, facing: "Park facing", psf: 13900, plc: 400000, status: "Token" },
  { id: "TP-D-0703", project: "TP", tower: "D", floor: 7, bhk: "2 BHK", area: 1150, facing: "East", psf: 9100, plc: 0, status: "Available" },
  { id: "TP-F-1104", project: "TP", tower: "F", floor: 11, bhk: "3 BHK", area: 1560, facing: "Pool facing", psf: 9350, plc: 150000, status: "Available" },
  { id: "TP-E-0201", project: "TP", tower: "E", floor: 2, bhk: "2 BHK", area: 1120, facing: "Road facing", psf: 8800, plc: 0, status: "Available" },
  { id: "YV-R1-2201", project: "YV", tower: "R1", floor: 22, bhk: "4 BHK", area: 3150, facing: "River view", psf: 16800, plc: 900000, status: "Available" },
  { id: "YV-R2-1402", project: "YV", tower: "R2", floor: 14, bhk: "4 BHK", area: 3150, facing: "Expressway", psf: 16200, plc: 0, status: "Hold" },
  { id: "SV-3-0905", project: "SV", tower: "3", floor: 9, bhk: "2 BHK", area: 1095, facing: "North", psf: 7200, plc: 0, status: "Available" },
  { id: "SV-5-1402", project: "SV", tower: "5", floor: 14, bhk: "3 BHK", area: 1420, facing: "Park facing", psf: 7450, plc: 120000, status: "Available" },
  { id: "AG-B-0306", project: "AG", tower: "B", floor: 3, bhk: "2 BHK", area: 1040, facing: "East", psf: 6800, plc: 0, status: "Available" },
  { id: "AE-V-14", project: "AE", tower: "V", floor: 0, bhk: "Villa", area: 2400, facing: "Corner, 18 m road", psf: 6100, plc: 250000, status: "Available" },
  { id: "AP-18-212", project: "AP", tower: "18", floor: 0, bhk: "Plot", area: 2280, facing: "30 m road", psf: 4650, plc: 0, status: "Available" },
  { id: "AP-18-340", project: "AP", tower: "18", floor: 0, bhk: "Plot", area: 1615, facing: "Park facing", psf: 4800, plc: 0, status: "Available" },
];
const priceOf = (u: Unit) => u.area * u.psf + u.plc;

type Buyer = { id: string; name: string; from: string; bhk: string; budget: number; prefer: NodeId[]; purpose: "End use" | "Investment"; loan: string; stage: Stage; source: string; agent: string; score: number; touched: string; note: string };
const SEED_BUYERS: Buyer[] = [
  { id: "B-2201", name: "Ankit & Shruti Garg", from: "Mayur Vihar Ph 1, Delhi", bhk: "3 BHK", budget: 30000000, prefer: ["s150", "s137"], purpose: "End use", loan: "HDFC pre-approved ₹1.6 Cr", stage: "negotiation", source: "99acres", agent: "Pooja", score: 88, touched: "40 min ago", note: "Wants ready or near-ready. Two kids, school in Sector 132." },
  { id: "B-2214", name: "Lt Col (Retd) R. S. Yadav", from: "Sector 62, Noida", bhk: "3 BHK", budget: 16000000, prefer: ["s137", "s150"], purpose: "End use", loan: "Self-funded", stage: "visit", source: "Referral", agent: "Imran", score: 81, touched: "Today 9:10", note: "Low floor for his mother. Visiting Trident today at 11." },
  { id: "B-2219", name: "Megha Saxena", from: "Indirapuram, Ghaziabad", bhk: "2 BHK", budget: 8500000, prefer: ["gnw"], purpose: "End use", loan: "SBI, eligible ₹62 L", stage: "qualified", source: "MagicBricks", agent: "Deepak", score: 74, touched: "Yesterday", note: "Works in Sector 62. Needs metro or office cab route." },
  { id: "B-2223", name: "Harpreet & Simran Kohli", from: "Sector 56, Gurugram", bhk: "4 BHK", budget: 56000000, prefer: ["s128"], purpose: "End use", loan: "ICICI, ₹2.5 Cr", stage: "negotiation", source: "Meta lead ad", agent: "Pooja", score: 92, touched: "1 h ago", note: "Second visit with parents Thursday. Builder offered ₹350/sq ft off for a token this week." },
  { id: "B-2230", name: "Vivek Agarwal (NRI, Dubai)", from: "Dubai, UAE", bhk: "Villa", budget: 18000000, prefer: ["yeida"], purpose: "Investment", loan: "Self-funded, NRE", stage: "qualified", source: "Housing.com", agent: "Arjun", score: 77, touched: "Yesterday", note: "Airport play. Wants video walk-through and lease-deed copy." },
  { id: "B-2231", name: "Nidhi & Rahul Chauhan", from: "Alpha 2, Greater Noida", bhk: "2 BHK", budget: 9500000, prefer: ["gnw", "s137"], purpose: "End use", loan: "Axis, eligible ₹70 L", stage: "visit", source: "Meta lead ad", agent: "Deepak", score: 79, touched: "Today 8:40", note: "Visiting Sapphire Ville at 1 PM, cab booked." },
  { id: "B-2236", name: "Sanjay Bansal", from: "Raj Nagar, Ghaziabad", bhk: "3 BHK", budget: 15000000, prefer: ["yeida", "s150"], purpose: "Investment", loan: "Self-funded", stage: "new", source: "99acres", agent: "Arjun", score: 63, touched: "2 h ago", note: "Asked about rental yield near the airport." },
  { id: "B-2240", name: "Dr Kavita Rawat", from: "AIIMS campus, Delhi", bhk: "3 BHK", budget: 24000000, prefer: ["s150", "s128"], purpose: "End use", loan: "HDFC, ₹1.5 Cr", stage: "token", source: "Referral", agent: "Pooja", score: 95, touched: "Yesterday", note: "Token ₹2.5 L paid for Kesar Heights B-1102. BBA draft awaited." },
  { id: "B-2242", name: "Faizan Qureshi", from: "Sector 18, Noida", bhk: "2 BHK", budget: 11000000, prefer: ["s137"], purpose: "End use", loan: "Kotak, eligible ₹80 L", stage: "new", source: "MagicBricks", agent: "Imran", score: 66, touched: "35 min ago", note: "Not called yet. Lead came in at 9:52." },
  { id: "B-2245", name: "Aditi Menon", from: "Whitefield, Bengaluru", bhk: "3 BHK", budget: 25000000, prefer: ["s150", "s137"], purpose: "End use", loan: "SBI, ₹1.4 Cr", stage: "qualified", source: "Housing.com", agent: "Neha", score: 72, touched: "Today 10:05", note: "Relocating in March. Video walk tomorrow, parents visit in person." },
  { id: "B-2248", name: "Gaurav & Pallavi Tyagi", from: "Dadri", bhk: "Plot", budget: 9000000, prefer: ["yeida"], purpose: "Investment", loan: "Self-funded", stage: "visit", source: "Walk-in", agent: "Arjun", score: 70, touched: "Today 9:30", note: "Comparing a 150 sq m plot against an FD. Visit at 4:30." },
  { id: "B-2251", name: "Manish Goel", from: "Karol Bagh, Delhi", bhk: "2 BHK", budget: 12000000, prefer: ["s150", "gnw"], purpose: "Investment", loan: "LIC HFL", stage: "new", source: "Website chat", agent: "Neha", score: 58, touched: "3 h ago", note: "Wants assured rental. Budget flexible if under-construction." },
  { id: "B-2253", name: "Prateek Sinha", from: "Sector 76, Noida", bhk: "3 BHK", budget: 16000000, prefer: ["s137", "gnw"], purpose: "End use", loan: "PNB, ₹1.1 Cr", stage: "negotiation", source: "99acres", agent: "Imran", score: 84, touched: "50 min ago", note: "Liked Trident F-1104. Asking for car parking free." },
  { id: "B-2256", name: "Rukhsana Begum", from: "Jasola, Delhi", bhk: "2 BHK", budget: 7500000, prefer: ["gnw"], purpose: "End use", loan: "SBI + PMAY", stage: "new", source: "WhatsApp", agent: "Deepak", score: 61, touched: "1 h ago", note: "First home. Asked if PMAY subsidy still applies." },
];

function matchScore(b: Buyer, u: Unit) {
  const p = projectOf(u.project);
  const ratio = priceOf(u) / b.budget;
  const money = ratio <= 1 ? 26 - Math.max(0, 0.82 - ratio) * 110 : Math.max(0, 26 - (ratio - 1) * 260);
  const tight = Math.max(0, 7 - Math.abs(0.92 - ratio) * 55);
  const wantsLand = b.bhk === "Plot" || b.bhk === "Villa";
  const isLand = u.bhk === "Plot" || u.bhk === "Villa";
  const size = b.bhk === u.bhk ? 26 : wantsLand && isLand ? 18 : !wantsLand && !isLand && Math.abs(parseInt(b.bhk) - parseInt(u.bhk)) === 1 ? 8 : 0;
  const pref = b.prefer[0] === p.node ? 22 : b.prefer.includes(p.node) ? 12 : 0;
  const timing = (b.purpose === "End use") === p.ready ? 8 : 2;
  const listing = /park|view|pool|corner/i.test(u.facing) ? 4 : /road/i.test(u.facing) ? -4 : 0;
  const lowFloor = b.note.toLowerCase().includes("low floor") ? (u.floor <= 4 ? 4 : -6) : 0;
  return Math.max(0, Math.min(98, Math.round(money + tight + size + pref + timing + listing + lowFloor)));
}

type Visit = { id: string; buyer: string; project: string; unit?: string; day: number; at: number; agent: string; cab: boolean; mode: "Site" | "Video"; status: "Scheduled" | "Confirmed" | "Done" | "No-show" };
const DAYS = ["Tue 20", "Wed 21", "Thu 22", "Fri 23", "Sat 24", "Sun 25", "Mon 26"];
const SEED_VISITS: Visit[] = [
  { id: "V-501", buyer: "Lt Col (Retd) R. S. Yadav", project: "TP", unit: "TP-E-0201", day: 0, at: 11, agent: "Imran", cab: false, mode: "Site", status: "Confirmed" },
  { id: "V-502", buyer: "Nidhi & Rahul Chauhan", project: "SV", unit: "SV-3-0905", day: 0, at: 13, agent: "Deepak", cab: true, mode: "Site", status: "Confirmed" },
  { id: "V-503", buyer: "Gaurav & Pallavi Tyagi", project: "AP", unit: "AP-18-340", day: 0, at: 16.5, agent: "Arjun", cab: true, mode: "Site", status: "Scheduled" },
  { id: "V-504", buyer: "Aditi Menon", project: "KH", unit: "KH-A-1203", day: 1, at: 12, agent: "Neha", cab: false, mode: "Video", status: "Confirmed" },
  { id: "V-505", buyer: "Megha Saxena", project: "AG", unit: "AG-B-0306", day: 1, at: 17, agent: "Deepak", cab: false, mode: "Site", status: "Scheduled" },
  { id: "V-506", buyer: "Harpreet & Simran Kohli", project: "YV", unit: "YV-R1-2201", day: 2, at: 11.5, agent: "Pooja", cab: true, mode: "Site", status: "Confirmed" },
  { id: "V-507", buyer: "Ankit & Shruti Garg", project: "NS", unit: "NS-T2-1501", day: 4, at: 10.5, agent: "Pooja", cab: false, mode: "Site", status: "Confirmed" },
  { id: "V-508", buyer: "Prateek Sinha", project: "TP", unit: "TP-F-1104", day: 4, at: 12, agent: "Imran", cab: false, mode: "Site", status: "Scheduled" },
  { id: "V-509", buyer: "Faizan Qureshi", project: "TP", unit: "TP-D-0703", day: 4, at: 14, agent: "Imran", cab: true, mode: "Site", status: "Scheduled" },
  { id: "V-510", buyer: "Vivek Agarwal (NRI, Dubai)", project: "AE", unit: "AE-V-14", day: 4, at: 18, agent: "Arjun", cab: false, mode: "Video", status: "Confirmed" },
  { id: "V-511", buyer: "Sanjay Bansal", project: "AE", day: 5, at: 11, agent: "Arjun", cab: true, mode: "Site", status: "Scheduled" },
  { id: "V-512", buyer: "Manish Goel", project: "SV", day: 5, at: 13, agent: "Neha", cab: true, mode: "Site", status: "Scheduled" },
  { id: "V-513", buyer: "Rukhsana Begum", project: "AG", day: 5, at: 15.5, agent: "Deepak", cab: true, mode: "Site", status: "Scheduled" },
];
const hourLabel = (h: number) => `${Math.floor(h) > 12 ? Math.floor(h) - 12 : Math.floor(h)}:${h % 1 ? "30" : "00"} ${h >= 12 ? "PM" : "AM"}`;

const DEAL_STAGES = ["Token", "Allotment", "BBA", "Loan disbursal", "Registry"] as const;
type DealStage = (typeof DEAL_STAGES)[number];
type Deal = { id: string; buyer: string; unit: string; project: string; value: number; token: number; plan: "CLP" | "25:75" | "10:90 subvention" | "30:70" | "Ready, 10% on BBA" | "Down payment"; bank: string; stage: DealStage; days: number; agent: string };
const SEED_DEALS: Deal[] = [
  { id: "D-118", buyer: "Dr Kavita Rawat", unit: "KH-B-1102", project: "KH", value: 23200000, token: 250000, plan: "25:75", bank: "HDFC", stage: "Token", days: 1, agent: "Pooja" },
  { id: "D-115", buyer: "Sunil & Rekha Bhatia", unit: "NS-T1-0602", project: "NS", value: 40710000, token: 1000000, plan: "Down payment", bank: "Self", stage: "BBA", days: 6, agent: "Pooja" },
  { id: "D-112", buyer: "Amandeep Sandhu", unit: "TP-E-0904", project: "TP", value: 14200000, token: 500000, plan: "Ready, 10% on BBA", bank: "SBI", stage: "Loan disbursal", days: 12, agent: "Imran" },
  { id: "D-109", buyer: "Vandana Kulshrestha", unit: "SV-2-1101", project: "SV", value: 7960000, token: 200000, plan: "CLP", bank: "Axis", stage: "Allotment", days: 4, agent: "Deepak" },
  { id: "D-107", buyer: "Rohit Nagar", unit: "AE-V-08", project: "AE", value: 13900000, token: 500000, plan: "30:70", bank: "Self", stage: "Allotment", days: 9, agent: "Arjun" },
  { id: "D-104", buyer: "Kiran & Deepa Joshi", unit: "YV-R1-1802", project: "YV", value: 52000000, token: 1500000, plan: "10:90 subvention", bank: "ICICI", stage: "BBA", days: 3, agent: "Pooja" },
  { id: "D-101", buyer: "Mohd. Arif", unit: "AG-B-0507", project: "AG", value: 7070000, token: 100000, plan: "Ready, 10% on BBA", bank: "PNB", stage: "Registry", days: 2, agent: "Deepak" },
  { id: "D-098", buyer: "Shalini Verma", unit: "TP-D-1203", project: "TP", value: 10700000, token: 300000, plan: "Ready, 10% on BBA", bank: "HDFC", stage: "Registry", days: 0, agent: "Imran" },
  { id: "D-096", buyer: "Pankaj Bhati", unit: "KH-A-0701", project: "KH", value: 23100000, token: 500000, plan: "CLP", bank: "Kotak", stage: "Loan disbursal", days: 18, agent: "Pooja" },
  { id: "D-093", buyer: "Lakshmi Iyer", unit: "SV-5-0603", project: "SV", value: 10400000, token: 250000, plan: "CLP", bank: "SBI", stage: "BBA", days: 11, agent: "Deepak" },
  { id: "D-090", buyer: "Col. Ajay Rana", unit: "TP-F-0402", project: "TP", value: 14600000, token: 500000, plan: "Ready, 10% on BBA", bank: "Self", stage: "Loan disbursal", days: 7, agent: "Imran" },
];

type Payout = { inv: string; builder: string; project: string; deal: string; value: number; rate: number; raised: string; days: number; status: "Not raised" | "Raised" | "Part paid" | "Paid"; promise?: string };
const PAYOUTS: Payout[] = [
  { inv: "YR/26-27/041", builder: "Shivalik Infracon", project: "KH", deal: "Pankaj Bhati · A-0701", value: 23100000, rate: 0.025, raised: "7 Aug", days: 74, status: "Raised" },
  { inv: "YR/26-27/044", builder: "Shivalik Infracon", project: "KH", deal: "Ritesh Malik · C-1504", value: 26400000, rate: 0.025, raised: "18 Aug", days: 63, status: "Part paid", promise: "Balance after 30 Oct board meet" },
  { inv: "YR/26-27/049", builder: "Trident Buildwell", project: "TP", deal: "Shalini Verma · D-1203", value: 10700000, rate: 0.02, raised: "2 Sep", days: 48, status: "Raised", promise: "RTGS Friday" },
  { inv: "YR/26-27/052", builder: "Ashoka Homes", project: "SV", deal: "Lakshmi Iyer · 5-0603", value: 10400000, rate: 0.03, raised: "9 Sep", days: 41, status: "Raised" },
  { inv: "YR/26-27/055", builder: "Riverbank Developers", project: "YV", deal: "Kiran & Deepa Joshi · R1-1802", value: 52000000, rate: 0.03, raised: "16 Sep", days: 34, status: "Raised", promise: "On 20% collection" },
  { inv: "YR/26-27/058", builder: "Ganga Realtech", project: "NS", deal: "Sunil & Rekha Bhatia · T1-0602", value: 40710000, rate: 0.02, raised: "24 Sep", days: 26, status: "Raised" },
  { inv: "YR/26-27/060", builder: "Ashoka Homes", project: "AG", deal: "Mohd. Arif · B-0507", value: 7070000, rate: 0.02, raised: "1 Oct", days: 19, status: "Raised" },
  { inv: "YR/26-27/036", builder: "Trident Buildwell", project: "TP", deal: "Neeraj Arora · F-0802", value: 13900000, rate: 0.02, raised: "21 Jul", days: 91, status: "Raised" },
  { inv: "YR/26-27/031", builder: "Jewar Landmark Infra", project: "AE", deal: "Sushma Rathi · V-03", value: 13600000, rate: 0.03, raised: "4 Jul", days: 108, status: "Part paid", promise: "Disputed: wants 2.5%" },
  { inv: "YR/26-27/029", builder: "Ganga Realtech", project: "NS", deal: "Arvind Sehgal · T2-0904", value: 28400000, rate: 0.02, raised: "28 Jun", days: 114, status: "Paid" },
  { inv: "—", builder: "Trident Buildwell", project: "TP", deal: "Amandeep Sandhu · E-0904", value: 14200000, rate: 0.02, raised: "—", days: 0, status: "Not raised" },
  { inv: "— ", builder: "Jewar Landmark Infra", project: "AE", deal: "Rohit Nagar · V-08", value: 13900000, rate: 0.03, raised: "—", days: 0, status: "Not raised" },
];

type ReraRow = { project: string; validTill: string; qpr: "Filed Q2" | "Due in 9 days" | "Overdue Q2" | "Not applicable"; escrow: string; complaints: number; status: "Verified" | "Check" | "Risk" | "N/A" };
const RERA_ROWS: ReraRow[] = [
  { project: "KH", validTill: "31 Dec 2028", qpr: "Filed Q2", escrow: "70% · SBI escrow", complaints: 0, status: "Verified" },
  { project: "NS", validTill: "Completed · OC 2025", qpr: "Not applicable", escrow: "Closed", complaints: 1, status: "Verified" },
  { project: "TP", validTill: "30 Jun 2026 → extension", qpr: "Overdue Q2", escrow: "70% · PNB escrow", complaints: 4, status: "Risk" },
  { project: "YV", validTill: "30 Sep 2029", qpr: "Filed Q2", escrow: "70% · ICICI escrow", complaints: 0, status: "Verified" },
  { project: "SV", validTill: "31 Mar 2028", qpr: "Due in 9 days", escrow: "70% · Axis escrow", complaints: 2, status: "Check" },
  { project: "AG", validTill: "Completed · OC 2024", qpr: "Not applicable", escrow: "Closed", complaints: 0, status: "Verified" },
  { project: "AE", validTill: "31 Dec 2029", qpr: "Filed Q2", escrow: "70% · HDFC escrow", complaints: 0, status: "Verified" },
  { project: "AP", validTill: "Authority allotment", qpr: "Not applicable", escrow: "—", complaints: 0, status: "N/A" },
];

const team: TeamMember[] = [
  { name: "Rajeev Bhati", role: "Founder, Yamuna Realty", status: "Busy", load: 92, focus: "Kohli 4 BHK negotiation and Shivalik payout", tasks: [{ title: "Call Riverbank on ₹350/sq ft offer", due: "12:30" }, { title: "Shivalik accounts head, ₹5.8 L overdue", due: "2:00" }, { title: "Sign 3 agent incentive vouchers", due: "6:00" }], week: [1, 1, 1, 1, 1, 1], since: "2011" },
  { name: "Pooja Sharma", role: "Senior sales, Sector 150 & 128", status: "In field", load: 88, focus: "Kohli family second visit prep; Dr Rawat BBA", tasks: [{ title: "Price sheet for Yamuna Vista R1-2201", due: "11:30", done: true }, { title: "BBA draft from Shivalik for D-118", due: "4:00" }, { title: "Ankit Garg counter-offer", due: "7:00" }], week: [1, 1, 1, 1, 1, 1], since: "2016" },
  { name: "Imran Khan", role: "Sales, Sector 137", status: "In field", load: 79, focus: "Lt Col Yadav at Trident Palm Court, 11 AM", tasks: [{ title: "Call Faizan Qureshi (new lead)", due: "now" }, { title: "Trident visit with Lt Col Yadav", due: "11:00" }, { title: "Prateek Sinha parking ask to builder", due: "3:00" }], week: [1, 1, 1, 1, 0, 1], since: "2019" },
  { name: "Deepak Nagar", role: "Sales, Greater Noida West", status: "Busy", load: 96, focus: "21 open leads; Chauhan visit at 1 PM", tasks: [{ title: "Chauhan family, Sapphire Ville", due: "1:00" }, { title: "Rukhsana PMAY eligibility", due: "5:00" }, { title: "Lakshmi Iyer BBA follow-up", due: "today" }], week: [1, 1, 1, 1, 1, 1], since: "2020" },
  { name: "Arjun Chaudhary", role: "Plots, villas & NRI desk", status: "On floor", load: 71, focus: "Tyagi plot visit 4:30, Vivek Agarwal video on Saturday", tasks: [{ title: "Lease-deed copy to Vivek Agarwal", due: "12:00" }, { title: "Tyagi plot visit, Sector 18", due: "4:30" }], week: [1, 1, 0, 1, 1, 1], since: "2021" },
  { name: "Neha Arora", role: "Pre-sales & CRM lead", status: "On floor", load: 74, focus: "Speed-to-lead: 4 leads not called inside 15 min", tasks: [{ title: "Re-assign 6 GNW leads", due: "11:00" }, { title: "Video walk set-up for Aditi Menon", due: "Wed" }], week: [1, 1, 1, 1, 1, 0], since: "2022" },
  { name: "Sandeep Kumar", role: "Site & cab coordinator", status: "In field", load: 62, focus: "3 cabs today, 7 on Saturday–Sunday", tasks: [{ title: "Cab for Chauhan family, 12:15 pickup", due: "12:15", done: true }, { title: "Weekend cab plan to owner", due: "5:00" }], week: [1, 1, 1, 1, 1, 1], since: "2018" },
  { name: "Ritu Malhotra", role: "Accounts & documentation", status: "On floor", load: 68, focus: "Commission invoices and KYC packets", tasks: [{ title: "Raise invoice: Sandhu, Trident", due: "today" }, { title: "TDS 194H reconciliation, Q2", due: "Fri" }], week: [1, 1, 1, 1, 1, 0], since: "2017" },
];

const agents: WorkforceAgent[] = [
  { name: "Lead Qualifier", role: "Calls back every portal lead in under 5 minutes", icon: PhoneCall, status: "Running", runsToday: 23, hoursSaved: 5.5, accuracy: 91, last: "3 min ago", skills: ["99acres", "MagicBricks", "WhatsApp", "Budget & loan check"], schedule: "On every new lead, 8 AM – 10 PM", log: ["Qualified Faizan Qureshi: 2 BHK, ₹1.1 Cr, Kotak", "Dropped 3 broker-to-broker leads", "Booked Rukhsana a callback at 5 PM"] },
  { name: "Match Maker", role: "Re-scores every buyer against live inventory", icon: Compass, status: "Needs you", runsToday: 9, hoursSaved: 4, accuracy: 88, last: "12 min ago", skills: ["Inventory", "Budget fit", "Sector preference"], schedule: "Every hour and on every price change", inbox: [{ title: "Ankit Garg fits Neelgiri T2-1501 at 93", detail: "₹2.82 Cr all-in against his ₹3 Cr budget. Ready with OC, which is his top ask. Send the price sheet?" }], log: ["3 new matches above 85", "Kesar C-1902 on hold, removed from 2 shortlists", "Yamuna Vista price change re-scored 4 buyers"] },
  { name: "Visit Planner", role: "Books site visits, cabs and reminders", icon: Car, status: "Running", runsToday: 7, hoursSaved: 3.5, accuracy: 94, last: "18 min ago", skills: ["Calendar", "Ola Corporate", "WhatsApp"], schedule: "On every visit request", log: ["Weekend: 7 visits, 6 cabs, routed in 2 loops", "Sent Chauhan family the driver details", "Moved Megha Saxena to 5 PM on request"] },
  { name: "Token Chaser", role: "Follows up tokens, BBA and loan disbursal", icon: Banknote, status: "Needs you", runsToday: 5, hoursSaved: 3, accuracy: 90, last: "1 h ago", skills: ["Payment plans", "Bank status", "Builder CRM"], schedule: "Daily 10 AM and 6 PM", inbox: [{ title: "Lakshmi Iyer BBA stuck 11 days", detail: "Ashoka Homes is waiting on her co-applicant PAN. Draft a WhatsApp to her husband?" }], log: ["D-112 SBI disbursal letter received", "D-096 Kotak tranche 2 pending", "Reminded 2 buyers of 10% on BBA"] },
  { name: "Brokerage Collector", role: "Raises and chases builder commission invoices", icon: Receipt, status: "Running", runsToday: 3, hoursSaved: 4.5, accuracy: 92, last: "2 h ago", skills: ["Tally", "GST", "TDS 194H"], schedule: "Daily 11 AM", log: ["Shivalik invoice 041 now 74 days", "Trident promised RTGS Friday", "Drafted 2 invoices for closed deals"] },
  { name: "RERA Checker", role: "Watches UP RERA for every project we sell", icon: ShieldCheck, status: "Idle", runsToday: 2, hoursSaved: 1.5, accuracy: 97, last: "6 h ago", skills: ["UP RERA portal", "QPR", "Ad compliance"], schedule: "Daily 7 AM", log: ["Trident Palm Court Q2 QPR overdue", "Sapphire Ville QPR due in 9 days", "3 portal ads missing the RERA number"] },
];

const independence: IndependenceData = {
  score: 41,
  history: [26, 29, 31, 33, 36, 38, 41],
  quote: "Builders only release the payout when I call the MD myself. My team closes deals; I chase money.",
  pillars: [
    { name: "Leads & pre-sales", score: 58, note: "Portal leads are called back by the agent; walk-ins still depend on who is at the desk.", fixes: [{ title: "Walk-in QR to CRM", gain: 3 }, { title: "Lead SLA at 10 minutes", gain: 2 }] },
    { name: "Site visits", score: 52, note: "Cabs and routes are planned by Sandeep; feedback is not captured after 40% of visits.", fixes: [{ title: "Feedback form on driver drop", gain: 3 }] },
    { name: "Negotiation", score: 24, note: "Every discount above ₹100/sq ft goes to Rajeev, who calls the builder himself.", fixes: [{ title: "Discount bands by project", gain: 4 }, { title: "Senior sales signs up to ₹200", gain: 3 }] },
    { name: "Builder payouts", score: 22, note: "₹68 L receivable; Shivalik and Jewar Landmark only respond to the owner.", fixes: [{ title: "Auto-invoice on registry", gain: 3 }, { title: "Payout clause in every MoU", gain: 3 }] },
    { name: "Documents & RERA", score: 49, note: "Ritu tracks KYC on paper files. RERA checks are monthly.", fixes: [{ title: "Daily RERA watch", gain: 2 }, { title: "Digital KYC packet", gain: 2 }] },
    { name: "Team & incentives", score: 44, note: "Incentive slabs are in Rajeev's notebook; agents ask him every month.", fixes: [{ title: "Published incentive slabs", gain: 3 }] },
    { name: "Owner time", score: 36, note: "Rajeev spends 15 hours a week on builder calls and price approvals.", fixes: [{ title: "Two approval windows a day", gain: 2 }] },
  ],
  ownerHours: [
    { label: "Builder calls", hours: 9 },
    { label: "Price approvals", hours: 6 },
    { label: "Site visits", hours: 8 },
    { label: "Payout chasing", hours: 5 },
    { label: "Team reviews", hours: 4 },
    { label: "Marketing", hours: 3 },
    { label: "Strategy", hours: 1 },
  ],
};

const integrations: Integration[] = [
  { name: "99acres", category: "Lead portals", status: "Connected", detail: "Leads, responses and listing views for 16 active listings.", synced: "2 min ago", records: "1,940 leads", mark: "99", color: "#0a5fa8" },
  { name: "MagicBricks", category: "Lead portals", status: "Connected", detail: "Leads and owner-verified listing boosts.", synced: "4 min ago", records: "1,215 leads", mark: "MB", color: "#d8232a" },
  { name: "Housing.com", category: "Lead portals", status: "Syncing", detail: "NRI and plot leads, video walk-through requests.", synced: "live", records: "642 leads", mark: "H", color: "#5c2d91" },
  { name: "Meta lead ads", category: "Marketing", status: "Connected", detail: "Instant forms for GNW and Sector 150 campaigns.", synced: "9 min ago", records: "860 leads", mark: "M", color: "#1877f2" },
  { name: "WhatsApp Business", category: "Messaging", status: "Connected", detail: "Brochures, price sheets, visit reminders and token receipts.", synced: "just now", records: "4,380 chats", mark: "W", color: "#1f9d55" },
  { name: "Tally Prime", category: "Accounts", status: "Connected", detail: "Commission invoices, GST and TDS 194H entries.", synced: "1 h ago", records: "312 vouchers", mark: "T", color: "#1c4f9c" },
  { name: "UP RERA portal", category: "Compliance", status: "Connected", detail: "Project registration, QPR status and agent licence.", synced: "7:02 AM", records: "8 projects", mark: "R", color: "#8a5a2b" },
  { name: "Google Calendar", category: "Visits", status: "Connected", detail: "Every site visit on the agent's own calendar.", synced: "5 min ago", records: "13 visits", mark: "G", color: "#ea4335" },
  { name: "Ola Corporate", category: "Visits", status: "Error", detail: "Card on file expired. Weekend cabs need a new card.", synced: "Yesterday", records: "—", mark: "O", color: "#3a3a3a" },
  { name: "Razorpay", category: "Payments", status: "Available", detail: "Token payment links that land in the builder escrow.", synced: "—", records: "—", mark: "₹", color: "#2563eb" },
];

/* ============================================================
   Config
   ============================================================ */

const baseConfig: DeskConfig = {
  slug: "realty",
  company: "Yamuna Realty",
  brand: "Yamuna",
  city: "Noida",
  state: "UP",
  icon: Building2,
  tagline: "Channel partner for 8 projects on the Noida–Greater Noida and Yamuna Expressways · 9 people",
  owner: { name: "Rajeev Bhati", first: "Rajeev", initials: "RB", role: "Founder" },
  theme: {
    variant: "inbox",
    paper: "#f6f2ee",
    panel: "#ffffff",
    sunk: "#efe7e0",
    ink: "#232a33",
    mute: "#716a64",
    line: "#e6dcd3",
    accent: "#b85a32",
    accentInk: "#ffffff",
    soft: "#f7e8df",
    ok: "#3b8a5c",
    warn: "#c48a1f",
    late: "#b33c36",
    info: "#3d5d83",
    heading: "display",
    radius: 14,
  },
  brief:
    "The Kohli family can close a ₹5.3 Cr Yamuna Vista unit this week if you accept Riverbank's ₹350/sq ft offer before Thursday's visit. Shivalik owes ₹5.8 L for 74 days, and Trident's overdue RERA filing is starting to come up in buyer calls.",
  pulse: [
    { label: "Hot buyers", value: "9", delta: "+3", trend: [4, 5, 5, 6, 7, 6, 9], module: "leads" },
    { label: "Site visits this week", value: "13", delta: "+4", trend: [6, 7, 9, 8, 10, 9, 13], tone: "info", module: "visits" },
    { label: "Tokens in October", value: "₹39.5 L", delta: "+18%", trend: [6, 11, 17, 22, 28, 34, 39.5], tone: "ok", module: "deals" },
    { label: "Brokerage receivable", value: "₹67.7 L", delta: "+9%", good: false, trend: [52, 55, 58, 60, 63, 65, 68], tone: "warn", module: "commissions" },
    { label: "Lead to visit", value: "22%", delta: "+4 pts", trend: [15, 16, 18, 17, 19, 20, 22], module: "leads" },
  ],
  decisions: [
    { id: "r1", kind: "Approve", from: "Pooja Sharma", title: "Accept ₹350/sq ft off for the Kohli family at Yamuna Vista R1-2201", context: "Riverbank will cut ₹11 L if the token lands before Thursday's visit with their parents. Our 3% still applies on the net value.", recommendation: "Accept and ask for a free second car park in writing. Net ₹5.18 Cr, brokerage ₹15.5 L.", impact: "₹15.5 L", module: "deals", approveLabel: "Accept offer" },
    { id: "r2", kind: "Money", from: "Brokerage Collector", title: "Shivalik Infracon is 74 days late on ₹5.8 L", context: "Invoice YR/26-27/041 for Pankaj Bhati's Kesar Heights unit. Two reminders sent; accounts says it needs the MD's sign-off.", recommendation: "Pause new Kesar Heights site visits until it clears, and send the MD a formal note today.", impact: "₹5.8 L", module: "commissions", approveLabel: "Send note" },
    { id: "r3", kind: "Risk", from: "RERA Checker", title: "Trident Palm Court missed its Q2 progress report", context: "The registration is on extension and 4 complaints are open on UP RERA. Two of our buyers asked about it this week.", recommendation: "Keep selling the ready units, but add the extension order to every price sheet and brief Imran.", module: "rera", approveLabel: "Brief team" },
    { id: "r4", kind: "Reply", from: "Ankit & Shruti Garg", title: "\"What's the best you can do on Neelgiri T2-1501 by tonight?\"", context: "₹2.82 Cr all-in. Ganga Realtech's floor is ₹13,300/sq ft. They are also looking at a resale in Sector 128.", recommendation: "Offer ₹13,350 with the floor PLC waived, which is ₹2.74 Cr all-in. Send from Pooja's WhatsApp.", impact: "₹5.5 L brokerage", module: "leads", approveLabel: "Send offer" },
    { id: "r5", kind: "People", from: "Neha Arora", title: "Deepak has 21 open leads; move 6 to Imran", context: "Four GNW leads waited more than 15 minutes for a first call today. Imran has 11 open and two visits.", recommendation: "Move the 6 Sector 137 overlap leads to Imran. Deepak keeps GNW-only buyers.", module: "team", approveLabel: "Re-assign 6" },
    { id: "r6", kind: "Approve", from: "Sandeep Kumar", title: "Weekend cab plan: 7 visits, ₹14,200", context: "Two loops: Sector 137 → 150 on Saturday morning, GNW → YEIDA on Sunday. Ola card needs replacing first.", recommendation: "Approve. Last weekend's cab visits converted at 1 token per 4 visits.", impact: "₹14,200", module: "visits", approveLabel: "Approve cabs" },
    { id: "r7", kind: "Money", from: "Token Chaser", title: "Lakshmi Iyer's BBA has been stuck for 11 days", context: "Ashoka Homes needs her co-applicant's PAN. If the BBA misses 30 days, the builder can forfeit her ₹2.5 L token.", recommendation: "Send her husband a WhatsApp checklist and have Ritu collect the PAN at their home tomorrow.", module: "deals", approveLabel: "Send checklist" },
  ],
  agenda: [
    { at: 9.5, title: "Sales huddle", detail: "9 hot buyers, 3 visits today", tone: "accent", module: "leads" },
    { at: 11, title: "Lt Col Yadav at Trident Palm Court", detail: "Imran · low floor for his mother", tone: "info", module: "visits" },
    { at: 12.5, title: "Riverbank price call", detail: "Kohli family, ₹350/sq ft offer", tone: "warn", module: "deals" },
    { at: 14, title: "Shivalik accounts head", detail: "₹5.8 L, 74 days", count: 2, tone: "late", module: "commissions" },
    { at: 16.5, title: "Tyagi plot visit, YEIDA Sector 18", detail: "Arjun · cab at 3:45", tone: "info", module: "visits" },
    { at: 18.5, title: "Day close", detail: "Uncalled leads, tokens, tomorrow's visits", tone: "ok", module: "leads" },
  ],
  activity: [
    { time: "11:32 AM", text: "Match Maker: Ankit Garg fits Neelgiri T2-1501 at 93", tone: "accent" },
    { time: "11:05 AM", text: "Lt Col Yadav reached Trident Palm Court with Imran", tone: "info" },
    { time: "10:48 AM", text: "SBI disbursal letter received for D-112 Amandeep Sandhu", tone: "ok" },
    { time: "10:20 AM", text: "RERA Checker: Trident Palm Court Q2 QPR overdue", tone: "late" },
    { time: "9:52 AM", text: "New MagicBricks lead: Faizan Qureshi, 2 BHK, Sector 137", tone: "info" },
    { time: "9:15 AM", text: "Trident Buildwell promised RTGS of ₹2.1 L on Friday", tone: "ok" },
  ],
  asks: [
    { q: "Which buyers are closest to a token?", a: "Four are within a week of paying.\n\n• Harpreet & Simran Kohli: Yamuna Vista R1-2201, match 94. Builder offer expires Thursday.\n• Ankit & Shruti Garg: Neelgiri T2-1501, match 93. Wants a number tonight.\n• Prateek Sinha: Trident F-1104, match 89. Only blocker is a free car park.\n• Lt Col Yadav: visiting Trident E-0201 right now, budget fits with ₹13 L to spare.\n\nAccepting the Kohli offer and waiving Ankit's PLC puts ₹21 L of brokerage in reach this week.", sources: ["Buyers & leads", "Match Maker", "Builder price sheets"] },
    { q: "How much brokerage is stuck with builders?", a: "₹67.7 L across 10 open invoices, before GST.\n\n• Over 90 days: Jewar Landmark ₹2.0 L balance (disputing 3% vs 2.5%) and Trident ₹2.8 L at 91 days.\n• 60–90 days: Shivalik ₹5.8 L at 74 days and ₹3.3 L balance at 63 days.\n• Two invoices are not raised yet: Sandhu (Trident) and Rohit Nagar (Airport Edge), ₹7.0 L together.\n\nRitu can raise both today; that alone is 10% of the receivable.", sources: ["Commissions", "Tally Prime"] },
    { q: "Is Trident Palm Court safe to keep selling?", a: "Yes for the ready towers, with care.\n\nThe registration UPRERAPRJ6721 is on extension, and the Q2 quarterly progress report is overdue. 4 complaints are open, all about the clubhouse handover, not title or construction.\n\nTowers D, E and F have OC, so buyers are not exposed on possession. Add the extension order to the price sheet, and avoid pitching the un-launched tower G until the QPR is filed.", sources: ["UP RERA portal", "RERA & papers"] },
    { q: "Plan this weekend's site visits", a: "7 visits, 6 cabs, two loops.\n\nSaturday: Ankit Garg at Neelgiri 10:30 → Prateek Sinha at Trident 12:00 → Faizan Qureshi at Trident 2:00. Vivek Agarwal's video walk at 6 PM from the Airport Edge sample villa.\nSunday: Sanjay Bansal at Airport Edge 11:00 → Manish Goel at Sapphire Ville 1:00 → Rukhsana Begum at Ashoka Greens 3:30.\n\nCab estimate ₹14,200. Replace the Ola card first; it expired yesterday.", sources: ["Site visits", "Ola Corporate", "Google Calendar"] },
    { q: "Who is slow on first calls?", a: "Speed-to-lead today: median 6 minutes, but 4 leads waited more than 15.\n\n• Deepak: 3 slow (21 open leads, 2 visits today)\n• Neha: 1 slow (Manish Goel, website chat)\n\nImran and Arjun are under 5 minutes. Moving 6 overlap leads from Deepak to Imran would fix most of it.", sources: ["Lead Qualifier", "CRM"] },
    { q: "Draft the Kohli confirmation message", a: "Draft (not sent):\n\n\"Harpreet ji, good news. Riverbank has approved ₹350/sq ft off on R1-2201, the 22nd-floor river-view 4 BHK, if we block it before Thursday. That brings it to ₹5.18 Cr all-in with the PLC. A ₹15 L token via RTGS to the project escrow holds it for 15 days. We'll see you and your parents on Thursday at 11:30. Pooja, Yamuna Realty\"", sources: ["Deals & token", "Riverbank price approval"] },
  ],
  run: {
    label: "Runs every hour. You can also run it now.",
    title: "Match Maker",
    steps: [
      { text: "Read 14 active buyers and their budgets, loans and sectors", result: "9 hot, 4 new today" },
      { text: "Pull live inventory from 8 projects", result: "16 listed units, 2 on hold, 1 under token" },
      { text: "Score every buyer against every unit", result: "224 pairs scored, 11 above 85" },
      { text: "Check visits, offers and builder price changes", result: "Riverbank −₹350/sq ft until Thursday" },
      { text: "Draft shortlists and owner approvals", result: "5 WhatsApp shortlists, 2 approvals" },
    ],
    outcome: "Three buyers are a decision away from a token: the Kohli family (Yamuna Vista), Ankit Garg (Neelgiri) and Prateek Sinha (Trident). Approving the Riverbank offer and a PLC waiver unlocks about ₹21 L in brokerage.",
    actions: ["Accept Riverbank offer", "Send Ankit the PLC waiver", "Ask Trident for a free car park", "Send 5 shortlists on WhatsApp"],
  },
};

/* ============================================================
   Desk
   ============================================================ */

type Match = { buyer: Buyer; unit: Unit; score: number };

export default function RealtyDesk() {
  const [buyers, setBuyers] = React.useState(SEED_BUYERS);
  const [visits, setVisits] = React.useState(SEED_VISITS);
  const [deals, setDeals] = React.useState(SEED_DEALS);
  const [unitState, setUnitState] = React.useState<Record<string, UnitStatus>>({});
  const [match, setMatch] = React.useState<Match | null>(null);

  const statusOf = React.useCallback((u: Unit) => unitState[u.id] ?? u.status, [unitState]);

  const store: Store = { buyers, setBuyers, visits, setVisits, deals, setDeals, statusOf, setUnitState, openMatch: setMatch };

  const config: DeskConfig = {
    ...baseConfig,
    signature: {
      title: "Corridor match map",
      sub: "Buyers on the left, live inventory along the expressway. Each line is a match; thicker means a better fit.",
      module: "inventory",
      render: () => (
        <>
          <CorridorMap store={store} />
          <MatchHost match={match} onClose={() => setMatch(null)} store={store} />
        </>
      ),
    },
    homeExtras: () => <HomeExtras store={store} />,
  };

  const open = buyers.filter((b) => b.stage !== "token").length;
  const modules: DeskModule[] = [
    { id: "leads", group: "Pipeline", label: "Buyers & leads", count: open, title: "Buyers & leads", blurb: "Every buyer from portals, ads and referrals, from first call to token. Drag a card to move it.", icon: Users, render: () => <LeadsModule store={store} /> },
    { id: "inventory", group: "Pipeline", label: "Inventory", count: UNITS.filter((u) => statusOf(u) === "Available").length, title: "Inventory", blurb: "Eight projects, their towers and every unit by floor, facing and price per sq ft", icon: Building2, render: () => <InventoryModule store={store} /> },
    { id: "visits", group: "Pipeline", label: "Site visits", count: visits.filter((v) => v.day === 0 && v.status !== "Done").length, title: "Site visits", blurb: "This week's visits, cabs and feedback. Drag a visit to another day to reschedule.", icon: CalendarDays, render: () => <VisitsModule store={store} /> },
    { id: "deals", group: "Money", label: "Deals & token", count: deals.filter((d) => d.stage !== "Registry").length, title: "Deals & token", blurb: "From token to registry: agreements, payment plans and bank disbursals", icon: Handshake, render: () => <DealsModule store={store} /> },
    { id: "commissions", group: "Money", label: "Commissions", count: PAYOUTS.filter((p) => p.status !== "Paid" && p.days > 60).length, title: "Commissions", blurb: "Builder brokerage invoices, GST, TDS and how long each builder has sat on them", icon: IndianRupee, render: () => <CommissionsModule /> },
    { id: "rera", group: "Business", label: "RERA & papers", count: RERA_ROWS.filter((r) => r.status === "Risk" || r.status === "Check").length, title: "RERA & papers", blurb: "Project registrations, quarterly filings, our agent licence and every buyer's document packet", icon: FileCheck2, render: () => <ReraModule deals={deals} /> },
    { id: "team", group: "Team", label: "People", title: "People", blurb: "Sales, pre-sales, site and accounts: who is carrying what today", icon: Users, render: () => <PeopleModule members={team} /> },
    { id: "agents", group: "Team", label: "Agents", title: "Agents", blurb: "Six AI agents calling, matching, chasing and checking so Rajeev doesn't have to", icon: Bot, render: () => <AgentsModule agents={agents} /> },
    { id: "independence", group: "Business", label: "Independence", title: "Owner independence", blurb: "How much of Yamuna Realty runs without Rajeev on the phone", icon: GaugeIcon, render: () => <IndependenceModule data={independence} /> },
    { id: "connections", group: "Business", label: "Connections", title: "Connections", blurb: "Lead portals, WhatsApp, Tally, UP RERA and the cab account", icon: Plug, render: () => <ConnectionsModule items={integrations} /> },
  ];

  return <DeskShell config={config} modules={modules} />;
}

type Store = {
  buyers: Buyer[];
  setBuyers: React.Dispatch<React.SetStateAction<Buyer[]>>;
  visits: Visit[];
  setVisits: React.Dispatch<React.SetStateAction<Visit[]>>;
  deals: Deal[];
  setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
  statusOf: (u: Unit) => UnitStatus;
  setUnitState: React.Dispatch<React.SetStateAction<Record<string, UnitStatus>>>;
  openMatch: (m: Match | null) => void;
};

function topMatches(b: Buyer, statusOf: (u: Unit) => UnitStatus, n = 3) {
  return UNITS.filter((u) => statusOf(u) === "Available")
    .map((u) => ({ buyer: b, unit: u, score: matchScore(b, u) }))
    .sort((a, c) => c.score - a.score)
    .slice(0, n);
}

/* ---------------- Signature: corridor match map ---------------- */

function CorridorMap({ store }: { store: Store }) {
  const { buyers, statusOf, openMatch } = store;
  const [purpose, setPurpose] = React.useState<"All" | "End use" | "Investment">("All");
  const [min, setMin] = React.useState(70);
  const [focus, setFocus] = React.useState<NodeId | null>(null);
  const [hover, setHover] = React.useState<string | null>(null);
  const scored = useDrift(224, 1.2, 2600);

  const rows = buyers
    .filter((b) => b.stage !== "token" && (purpose === "All" || b.purpose === purpose))
    .map((b) => ({ b, list: topMatches(b, statusOf, 6).filter((m) => m.score >= min && (!focus || projectOf(m.unit.project).node === focus)).slice(0, 2) }))
    .filter((r) => r.list.length > 0)
    .sort((a, c) => c.list[0].score - a.list[0].score)
    .slice(0, 8);
  const all = rows.flatMap((r) => r.list);
  const best = [...all].sort((a, c) => c.score - a.score).slice(0, 3);
  const perNode = (id: NodeId) => UNITS.filter((u) => projectOf(u.project).node === id && statusOf(u) === "Available").length;
  const chipY = (i: number) => 24 + i * 53;
  const halo = { stroke: "var(--d-panel)", strokeWidth: 4, paintOrder: "stroke" as const, strokeLinejoin: "round" as const };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Segmented size="sm" options={["All", "End use", "Investment"] as const} value={purpose} onChange={setPurpose} />
        <label className="flex items-center gap-2 text-[12.5px] text-d-mute">
          Min. score
          <input type="range" min={50} max={90} step={5} value={min} onChange={(e) => setMin(Number(e.target.value))} className="w-28 accent-[var(--d-accent)]" />
          <span className="tnum w-6 font-mono text-d-ink">{min}</span>
        </label>
        {focus && (
          <button type="button" onClick={() => setFocus(null)} className="rounded-full bg-d-soft px-2.5 py-1 text-[12px] font-medium text-d-accent">
            {nodeOf(focus).name} ✕
          </button>
        )}
        <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[11.5px] text-d-mute">
          <Sparkles className="h-3.5 w-3.5 text-d-accent" /> {Math.round(scored)} pairs scored · {all.length} shown
        </span>
      </div>
      <div className="relative overflow-hidden rounded-[12px] border border-d-line" style={{ background: "linear-gradient(160deg, color-mix(in oklab, var(--d-soft) 60%, var(--d-panel)), var(--d-panel) 55%, color-mix(in oklab, var(--d-info) 7%, var(--d-panel)))" }}>
        <svg viewBox="0 0 720 470" className="block h-auto w-full" role="img" aria-label="Expressway corridor with buyer matches">
          <defs>
            <pattern id="yr-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M24 0H0V24" fill="none" stroke="var(--d-line)" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect x="200" y="0" width="520" height="470" fill="url(#yr-grid)" opacity="0.55" />
          {/* Yamuna river */}
          <path d="M214 0 C 232 90, 262 186, 326 276 S 470 412, 520 470" fill="none" stroke="var(--d-info)" strokeWidth="26" strokeOpacity="0.1" strokeLinecap="round" />
          <text x="246" y="232" fontSize="11" fill="var(--d-info)" fontStyle="italic" opacity="0.8" transform="rotate(52 246 232)">
            Yamuna
          </text>
          {/* GNW link road */}
          <path d="M352 166 C 430 150, 520 112, 612 96" fill="none" stroke="var(--d-mute)" strokeWidth="3" strokeDasharray="2 6" strokeLinecap="round" opacity="0.6" />
          <text x="500" y="146" fontSize="10" fill="var(--d-mute)" transform="rotate(-14 500 146)" {...halo}>
            130 m road · Kisan Chowk
          </text>
          {/* Expressways */}
          <path d="M262 14 C 290 60, 330 118, 352 166 S 398 240, 424 262 S 490 306, 522 318" fill="none" stroke="var(--d-ink)" strokeWidth="9" strokeOpacity="0.12" strokeLinecap="round" />
          <path d="M262 14 C 290 60, 330 118, 352 166 S 398 240, 424 262 S 490 306, 522 318" fill="none" stroke="var(--d-panel)" strokeWidth="1.6" strokeDasharray="7 7" />
          <path d="M522 318 C 570 340, 616 378, 646 418 L 672 462" fill="none" stroke="var(--d-accent)" strokeWidth="9" strokeOpacity="0.22" strokeLinecap="round" />
          <path d="M522 318 C 570 340, 616 378, 646 418 L 672 462" fill="none" stroke="var(--d-panel)" strokeWidth="1.6" strokeDasharray="7 7" />
          <text x="282" y="16" fontSize="10.5" fontWeight="600" fill="var(--d-mute)" {...halo}>
            Noida–Greater Noida Expressway
          </text>
          <text x="572" y="322" fontSize="10.5" fontWeight="600" fill="var(--d-accent)" transform="rotate(38 572 322)" {...halo}>
            Yamuna Expressway
          </text>
          <circle cx="522" cy="318" r="5" fill="var(--d-panel)" stroke="var(--d-ink)" strokeWidth="2" />
          <text x="532" y="314" fontSize="10" fill="var(--d-mute)" {...halo}>
            Pari Chowk
          </text>
          <g transform="translate(676 400)" opacity="0.75">
            <circle r="13" fill="var(--d-info)" fillOpacity="0.14" />
            <Plane x={-7} y={-7} width={14} height={14} color="var(--d-info)" />
          </g>
          <text x="610" y="456" fontSize="10" fill="var(--d-info)">
            Noida Intl. Airport, Jewar
          </text>

          {/* Match lines */}
          {rows.map((r, i) =>
            r.list.map((m, k) => {
              const n = nodeOf(projectOf(m.unit.project).node);
              const y0 = chipY(i) + 22;
              const tx = n.x - 4;
              const ty = n.y + (k ? 6 : -4);
              const d = `M196 ${y0} C 270 ${y0}, ${tx - 90} ${ty}, ${tx} ${ty}`;
              const t = 0.2;
              const bez = (a: number, b1: number, c: number, e: number) => (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b1 + 3 * (1 - t) * t * t * c + t ** 3 * e;
              const mx = bez(196, 270, tx - 90, tx);
              const my = bez(y0, y0, ty, ty);
              const dim = hover && hover !== r.b.id;
              const hot = m.score >= 90;
              return (
                <g key={`${r.b.id}-${m.unit.id}`} opacity={dim ? 0.12 : 1} style={{ transition: "opacity 200ms" }} className="cursor-pointer" onClick={() => openMatch(m)} onMouseEnter={() => setHover(r.b.id)} onMouseLeave={() => setHover(null)}>
                  <path d={d} fill="none" stroke="transparent" strokeWidth="14" />
                  <path d={d} fill="none" stroke={hot ? "var(--d-accent)" : "var(--d-info)"} strokeOpacity={k ? 0.45 : 0.9} strokeWidth={k ? 1.4 : 1 + (m.score - 50) / 14} className={k ? undefined : "desk-flow"} strokeDasharray={k ? "3 5" : undefined} strokeLinecap="round" />
                  {k === 0 && (
                    <g transform={`translate(${mx} ${my})`}>
                      <rect x="-15" y="-9" width="30" height="18" rx="9" fill={hot ? "var(--d-accent)" : "var(--d-panel)"} stroke={hot ? "none" : "var(--d-info)"} />
                      <text textAnchor="middle" y="4" fontSize="10.5" fontWeight="700" fontFamily="var(--font-mono)" fill={hot ? "var(--d-accent-ink)" : "var(--d-info)"}>
                        {m.score}
                      </text>
                    </g>
                  )}
                </g>
              );
            }),
          )}

          {/* Sector nodes */}
          {NODES.map((n) => {
            const count = perNode(n.id);
            const on = focus === n.id;
            const r = 11 + count * 2.2;
            const above = n.id === "gnw";
            const labelLeft = n.id === "yeida";
            const lx = above ? n.x : labelLeft ? n.x - r - 8 : n.x + r + 8;
            const ly = above ? n.y - r - 22 : n.y - 3;
            const anchor = above ? "middle" : labelLeft ? "end" : "start";
            return (
              <g key={n.id} className="cursor-pointer" onClick={() => setFocus(on ? null : n.id)}>
                <circle cx={n.x} cy={n.y} r={r + 8} fill="var(--d-accent)" fillOpacity="0.08">
                  <animate attributeName="r" values={`${r + 2};${r + 12};${r + 2}`} dur="3.2s" repeatCount="indefinite" />
                  <animate attributeName="fill-opacity" values="0.16;0;0.16" dur="3.2s" repeatCount="indefinite" />
                </circle>
                <circle cx={n.x} cy={n.y} r={r} fill={on ? "var(--d-accent)" : "var(--d-panel)"} stroke="var(--d-accent)" strokeWidth="2.2" />
                <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={on ? "var(--d-accent-ink)" : "var(--d-accent)"}>
                  {count}
                </text>
                <text x={lx} y={ly} textAnchor={anchor} fontSize="12.5" fontWeight="700" fill="var(--d-ink)" {...halo}>
                  {n.name}
                </text>
                <text x={lx} y={ly + 14} textAnchor={anchor} fontSize="10.5" fill="var(--d-mute)" fontFamily="var(--font-mono)" {...halo}>
                  {n.psf}/sq ft
                </text>
              </g>
            );
          })}

          {/* Buyer chips */}
          {rows.map((r, i) => {
            const y = chipY(i);
            const on = hover === r.b.id;
            return (
              <g key={r.b.id} transform={`translate(8 ${y})`} className="cursor-pointer" onMouseEnter={() => setHover(r.b.id)} onMouseLeave={() => setHover(null)} onClick={() => openMatch(r.list[0])}>
                <rect width="188" height="44" rx="12" fill="var(--d-panel)" stroke={on ? "var(--d-accent)" : "var(--d-line)"} strokeWidth={on ? 1.6 : 1} />
                <circle cx="22" cy="22" r="13" fill="var(--d-soft)" />
                <text x="22" y="26" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--d-accent)">
                  {r.b.name.replace(/\(.*\)|Lt Col|Retd|Dr|&/g, "").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("")}
                </text>
                <text x="42" y="19" fontSize="11.5" fontWeight="600" fill="var(--d-ink)">
                  {r.b.name.length > 22 ? `${r.b.name.slice(0, 21)}…` : r.b.name}
                </text>
                <text x="42" y="34" fontSize="10" fill="var(--d-mute)" fontFamily="var(--font-mono)">
                  {r.b.bhk} · {inr(r.b.budget, { compact: true })} · {r.b.purpose === "End use" ? "self" : "invest"}
                </text>
                <circle cx="178" cy="10" r="3.5" fill={r.b.stage === "negotiation" ? "var(--d-accent)" : r.b.stage === "visit" ? "var(--d-info)" : r.b.stage === "qualified" ? "var(--d-ok)" : "var(--d-mute)"} />
              </g>
            );
          })}
          {rows.length === 0 && (
            <text x="100" y="230" textAnchor="middle" fontSize="12" fill="var(--d-mute)">
              No buyers above {min}
            </text>
          )}
        </svg>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {best.map((m) => (
          <button key={`${m.buyer.id}-${m.unit.id}`} type="button" onClick={() => openMatch(m)} className="desk-rise flex items-center gap-3 rounded-[12px] border border-d-line bg-d-panel p-3 text-left transition-all hover:-translate-y-0.5 hover:border-d-accent">
            <ScoreRing score={m.score} />
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold">{m.buyer.name}</span>
              <span className="block truncate text-[11.5px] text-d-mute">
                {projectOf(m.unit.project).name} · {m.unit.id.split("-").slice(1).join("-")}
              </span>
              <span className="tnum block font-mono text-[11.5px]">{inr(priceOf(m.unit), { compact: true })} all-in</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ScoreRing({ score, size = 44 }: { score: number; size?: number }) {
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  const tone = score >= 85 ? "var(--d-accent)" : score >= 70 ? "var(--d-info)" : "var(--d-mute)";
  return (
    <span className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--d-sunk)" strokeWidth="4" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(score / 100) * c} ${c}`} />
      </svg>
      <span className="tnum absolute inset-0 flex items-center justify-center font-mono text-[12px] font-bold" style={{ color: tone }}>
        {score}
      </span>
    </span>
  );
}

/* ---------------- Match sheet ---------------- */

function MatchHost({ match, onClose, store }: { match: Match | null; onClose: () => void; store: Store }) {
  return (
    <Sheet open={!!match} onOpenChange={(o) => !o && onClose()} width={540} eyebrow={match ? `Match ${match.score} · ${match.buyer.id}` : ""} title={match ? `${match.buyer.name} → ${match.unit.id}` : ""} sub={match ? `${projectOf(match.unit.project).name}, ${nodeOf(projectOf(match.unit.project).node).name} · agent ${match.buyer.agent}` : ""}>
      {match && <MatchBody key={`${match.buyer.id}-${match.unit.id}`} match={match} store={store} onClose={onClose} />}
    </Sheet>
  );
}

function MatchBody({ match, store, onClose }: { match: Match; store: Store; onClose: () => void }) {
  const desk = useDesk();
  const { buyer: b, unit: u } = match;
  const p = projectOf(u.project);
  const price = priceOf(u);
  const [day, setDay] = React.useState(4);
  const [slot, setSlot] = React.useState(11);
  const [cab, setCab] = React.useState(true);
  const [token, setToken] = React.useState(String(Math.round((price * 0.01) / 50000) * 50000 || 100000));
  const booked = store.visits.find((v) => v.buyer === b.name && v.unit === u.id);
  const status = store.statusOf(u);
  const rows: { k: string; want: string; got: string; ok: boolean | "near" }[] = [
    { k: "Budget", want: inr(b.budget, { compact: true }), got: `${inr(price, { compact: true })} all-in`, ok: price <= b.budget ? true : price <= b.budget * 1.08 ? "near" : false },
    { k: "Size", want: b.bhk, got: `${u.bhk} · ${u.area.toLocaleString("en-IN")} sq ft`, ok: b.bhk === u.bhk ? true : "near" },
    { k: "Location", want: b.prefer.map((x) => nodeOf(x).name).join(", "), got: nodeOf(p.node).name, ok: b.prefer[0] === p.node ? true : b.prefer.includes(p.node) ? "near" : false },
    { k: "Possession", want: b.purpose === "End use" ? "Ready or soon" : "Appreciation", got: p.possession, ok: (b.purpose === "End use") === p.ready ? true : "near" },
    { k: "Floor & facing", want: b.note.toLowerCase().includes("low floor") ? "Low floor" : "Any", got: u.floor ? `Floor ${u.floor} · ${u.facing}` : u.facing, ok: b.note.toLowerCase().includes("low floor") && u.floor > 4 ? "near" : true },
    { k: "Loan", want: b.loan, got: p.ready ? "Bank-approved project" : "Approved by 4 banks", ok: true },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 rounded-[12px] bg-d-sunk/60 p-3">
        <ScoreRing score={match.score} size={56} />
        <p className="text-[13px] leading-snug text-d-ink/85">
          <Sparkles className="mr-1 inline h-3.5 w-3.5 text-d-accent" />
          {b.note}
        </p>
      </div>
      <div>
        <p className="mb-2 text-[12px] font-medium text-d-mute">Buyer needs vs this unit</p>
        <div className="overflow-hidden rounded-[12px] border border-d-line">
          {rows.map((r) => (
            <div key={r.k} className="grid grid-cols-[92px_1fr_1fr_20px] items-center gap-2 border-b border-d-line px-3 py-2 text-[12.5px] last:border-0">
              <span className="text-d-mute">{r.k}</span>
              <span>{r.want}</span>
              <span className="font-medium">{r.got}</span>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.ok === true ? "var(--d-ok)" : r.ok === "near" ? "var(--d-warn)" : "var(--d-late)" }} />
            </div>
          ))}
        </div>
      </div>
      <KV items={[{ k: "Base price", v: `${inr(u.psf)}/sq ft` }, { k: "PLC", v: u.plc ? inr(u.plc, { compact: true }) : "None" }, { k: "Builder", v: p.builder }, { k: "Our brokerage", v: `${(p.brokerage * 100).toFixed(1)}% · ${inr(price * p.brokerage, { compact: true })}` }]} />
      <div className="rounded-[12px] border border-d-line p-3">
        <p className="mb-2 flex items-center gap-2 text-[13px] font-semibold">
          <CalendarDays className="h-4 w-4 text-d-accent" /> Site visit
        </p>
        {booked ? (
          <p className="text-[13px]">
            Booked for <b>{DAYS[booked.day]}</b> at <b>{hourLabel(booked.at)}</b> with {booked.agent}
            {booked.cab ? ", cab arranged" : ""}. <Pill tone="info">{booked.status}</Pill>
          </p>
        ) : (
          <div className="space-y-2.5">
            <div className="flex flex-wrap gap-1.5">
              {DAYS.slice(1).map((d, i) => (
                <button key={d} type="button" onClick={() => setDay(i + 1)} className={`h-8 rounded-full px-3 text-[12px] font-medium ${day === i + 1 ? "bg-d-accent text-d-accent-ink" : "border border-d-line hover:bg-d-sunk"}`}>
                  {d}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {[10.5, 12, 14, 16.5].map((s) => (
                <button key={s} type="button" onClick={() => setSlot(s)} className={`h-8 rounded-full px-3 font-mono text-[11.5px] ${slot === s ? "bg-d-ink text-d-paper" : "border border-d-line hover:bg-d-sunk"}`}>
                  {hourLabel(s)}
                </button>
              ))}
              <label className="ml-auto inline-flex items-center gap-2 text-[12.5px]">
                <input type="checkbox" checked={cab} onChange={(e) => setCab(e.target.checked)} className="h-4 w-4 accent-[var(--d-accent)]" /> Cab pickup from {b.from.split(",")[0]}
              </label>
            </div>
            <Btn
              variant="solid"
              icon={CalendarDays}
              onClick={() => {
                store.setVisits((cur) => [...cur, { id: `V-${520 + cur.length}`, buyer: b.name, project: u.project, unit: u.id, day, at: slot, agent: b.agent, cab, mode: "Site", status: "Confirmed" }]);
                store.setBuyers((cur) => cur.map((x) => (x.id === b.id && (x.stage === "new" || x.stage === "qualified") ? { ...x, stage: "visit" } : x)));
                toast.success("Site visit booked", { description: `${b.name} · ${p.name} · ${DAYS[day]} ${hourLabel(slot)}${cab ? " · cab booked" : ""}` });
                desk.log(`Visit booked: ${b.name} at ${p.name}, ${DAYS[day]} ${hourLabel(slot)}`, "info");
              }}
            >
              Book visit & send on WhatsApp
            </Btn>
          </div>
        )}
      </div>
      <div className="rounded-[12px] border border-d-line p-3">
        <p className="mb-2 flex items-center gap-2 text-[13px] font-semibold">
          <KeyRound className="h-4 w-4 text-d-accent" /> Token to block the unit
        </p>
        {status !== "Available" ? (
          <p className="text-[13px]">
            This unit is <Pill tone={status === "Token" ? "ok" : "warn"}>{status}</Pill>. Release it from Inventory to re-offer.
          </p>
        ) : (
          <div className="flex flex-wrap items-end gap-2">
            <Field label="Token amount (₹), paid to builder escrow">
              <input className={`${inputClass} w-44 font-mono`} inputMode="numeric" value={token} onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))} />
            </Field>
            <Btn
              variant="solid"
              icon={Banknote}
              onClick={() => {
                const amt = Number(token) || 100000;
                store.setUnitState((s) => ({ ...s, [u.id]: "Token" }));
                store.setBuyers((cur) => cur.map((x) => (x.id === b.id ? { ...x, stage: "token" } : x)));
                store.setDeals((cur) => [{ id: `D-${119 + cur.length - SEED_DEALS.length}`, buyer: b.name, unit: u.id, project: u.project, value: price, token: amt, plan: p.ready ? "Ready, 10% on BBA" : "CLP", bank: b.loan.split(/[ ,]/)[0], stage: "Token", days: 0, agent: b.agent }, ...cur]);
                toast.success(`Token ${inr(amt, { compact: true })} recorded`, { description: `${u.id} blocked for ${b.name}. Receipt sent on WhatsApp.` });
                desk.log(`Token ${inr(amt, { compact: true })}: ${b.name} blocked ${u.id}`, "ok");
                onClose();
              }}
            >
              Record token
            </Btn>
            <p className="w-full text-[11.5px] text-d-mute">Suggested 1% of all-in price. Builder holds the unit for 15 days pending BBA.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Home extras ---------------- */

function HomeExtras({ store }: { store: Store }) {
  const desk = useDesk();
  const tokens = store.deals.filter((d) => d.id >= "D-104");
  const collected = tokens.reduce((a, d) => a + d.token, 0);
  const target = 5000000;
  const today = store.visits.filter((v) => v.day === 0).sort((a, b) => a.at - b.at);
  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Panel icon={Banknote} title="Token money, October" sub={`Target ${inr(target, { compact: true })} · 11 days left`}>
        <div className="flex flex-col items-center">
          <Gauge value={Math.round((collected / target) * 100)} size={210} tone="accent" label={<span className="text-[12px] text-d-mute">{inr(collected, { compact: true })} collected</span>} />
        </div>
        <ul className="mt-3 divide-y divide-d-line">
          {store.deals.slice(0, 4).map((d) => (
            <li key={d.id} className="flex items-center gap-2 py-2 text-[12.5px]">
              <span className="min-w-0 flex-1 truncate">
                <b className="font-medium">{d.buyer}</b> <span className="text-d-mute">· {projectOf(d.project).name}</span>
              </span>
              <span className="tnum font-mono">{inr(d.token, { compact: true })}</span>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel icon={Route} title="Today on the road" sub="Visits in order, with the cab and the agent" action={<Btn size="sm" onClick={() => desk.goTab("visits")}>Week</Btn>}>
        <ol className="relative space-y-3 pl-5 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-[2px] before:rounded-full before:bg-[repeating-linear-gradient(var(--d-accent)_0_5px,transparent_5px_10px)]">
          {today.map((v) => {
            const p = projectOf(v.project);
            return (
              <li key={v.id} className="relative">
                <span className="absolute -left-5 top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-d-accent bg-d-panel">
                  {v.status === "Done" && <span className="h-2 w-2 rounded-full bg-d-accent" />}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="tnum font-mono text-[12px] text-d-mute">{hourLabel(v.at)}</span>
                  <span className="text-[13.5px] font-semibold">{v.buyer}</span>
                  {v.cab && (
                    <Pill tone="info">
                      <Car className="h-3 w-3" /> cab
                    </Pill>
                  )}
                </div>
                <p className="text-[12px] text-d-mute">
                  <MapPin className="mr-0.5 inline h-3 w-3" />
                  {p.name}, {nodeOf(p.node).name} · {v.agent}
                </p>
              </li>
            );
          })}
        </ol>
        <Btn
          size="sm"
          variant="soft"
          icon={Send}
          className="mt-4"
          onClick={() => {
            toast.success("Driver and location pins sent", { description: `${today.filter((v) => v.cab).length} buyers got the cab details on WhatsApp` });
            desk.log("Cab details sent to today's visitors", "info");
          }}
        >
          Send cab details to buyers
        </Btn>
      </Panel>
    </div>
  );
}

/* ---------------- Buyers & leads ---------------- */

const STAGE_COLS: { id: Stage; label: string; tone: Tone; hint: string }[] = [
  { id: "new", label: "New", tone: "neutral", hint: "Call inside 5 minutes" },
  { id: "qualified", label: "Qualified", tone: "ok", hint: "Budget and loan checked" },
  { id: "visit", label: "Site visit", tone: "info", hint: "Booked or done" },
  { id: "negotiation", label: "Negotiation", tone: "warn", hint: "Price on the table" },
  { id: "token", label: "Token", tone: "accent", hint: "Unit blocked" },
];

function LeadsModule({ store }: { store: Store }) {
  const desk = useDesk();
  const { buyers, setBuyers } = store;
  const [open, setOpen] = React.useState<string | null>(null);
  const [agent, setAgent] = React.useState<"All" | "Pooja" | "Imran" | "Deepak" | "Arjun" | "Neha">("All");
  const [adding, setAdding] = React.useState(false);
  const buyer = buyers.find((b) => b.id === open) ?? null;
  const shown = buyers.filter((b) => agent === "All" || b.agent === agent);
  const uncalled = buyers.filter((b) => b.stage === "new");

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Active buyers" value={buyers.filter((b) => b.stage !== "token").length} delta="+4" hint="this week" icon={Users} trend={[8, 9, 9, 10, 11, 12, 13]} />
        <Stat label="New today" value={uncalled.length} hint={`${uncalled.length - 1} called inside 5 min`} icon={UserPlus} tone="info" />
        <Stat label="First call, median" value="6 min" delta="-3 min" deltaGood hint="target under 5" icon={Timer} tone="ok" trend={[14, 12, 11, 9, 8, 7, 6]} />
        <Stat label="Lead to token" value="4.1%" delta="+0.6" hint="last 90 days" icon={KeyRound} trend={[2.8, 3.1, 3.3, 3.5, 3.6, 3.9, 4.1]} />
      </div>
      <Panel
        title="Pipeline"
        sub="Drag a buyer between stages. Moving to Token asks the builder to block the unit."
        action={
          <>
            <Segmented size="sm" options={["All", "Pooja", "Imran", "Deepak", "Arjun", "Neha"] as const} value={agent} onChange={setAgent} />
            <Btn size="sm" variant="solid" icon={Plus} onClick={() => setAdding(true)}>
              Add buyer
            </Btn>
          </>
        }
      >
        <Board
          columns={STAGE_COLS.map((c) => ({ ...c, label: c.label }))}
          items={shown}
          itemKey={(b) => b.id}
          getColumn={(b) => b.stage}
          minColumnWidth={210}
          onMove={(id, col) => {
            const b = buyers.find((x) => x.id === id);
            if (!b || b.stage === col) return;
            setBuyers((cur) => cur.map((x) => (x.id === id ? { ...x, stage: col as Stage, touched: "just now" } : x)));
            toast.success(`${b.name} → ${STAGE_COLS.find((c) => c.id === col)?.label}`, { description: `${b.agent} notified on WhatsApp` });
            desk.log(`${b.name} moved to ${STAGE_COLS.find((c) => c.id === col)?.label}`, col === "token" ? "ok" : "info");
          }}
          renderCard={(b) => (
            <button type="button" onClick={() => setOpen(b.id)} className="block w-full text-left">
              <span className="flex items-start justify-between gap-2 pr-3">
                <span className="text-[13px] font-semibold leading-snug">{b.name}</span>
                <span className="tnum font-mono text-[11px] font-bold" style={{ color: b.score >= 85 ? "var(--d-accent)" : b.score >= 70 ? "var(--d-info)" : "var(--d-mute)" }}>
                  {b.score}
                </span>
              </span>
              <span className="mt-0.5 block text-[11.5px] text-d-mute">
                {b.bhk} · {inr(b.budget, { compact: true })} · {b.prefer.map((x) => nodeOf(x).short).join("/")}
              </span>
              <span className="mt-2 flex items-center gap-1.5">
                <Avatar name={b.agent} size={20} />
                <Pill tone={b.purpose === "Investment" ? "info" : "neutral"}>{b.source}</Pill>
                <span className="ml-auto text-[10.5px] text-d-mute">{b.touched}</span>
              </span>
            </button>
          )}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <Panel icon={PhoneCall} title="Waiting for a first call" sub="Portal leads go cold after 15 minutes">
          <ul className="divide-y divide-d-line">
            {uncalled.map((b, i) => (
              <li key={b.id} className="flex flex-wrap items-center gap-3 py-2.5">
                <Avatar name={b.name} size={30} tone="info" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-medium">{b.name}</p>
                  <p className="text-[12px] text-d-mute">
                    {b.source} · {b.bhk} · {inr(b.budget, { compact: true })} · {b.agent}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-d-sunk px-2 py-0.5 text-[11.5px]">
                  <Timer className="h-3 w-3" /> <Countdown compact inHours={0.08 + i * 0.07} />
                </span>
                <Btn
                  size="sm"
                  variant="soft"
                  icon={PhoneCall}
                  onClick={() => {
                    setBuyers((cur) => cur.map((x) => (x.id === b.id ? { ...x, stage: "qualified", touched: "just now" } : x)));
                    toast.success(`Called ${b.name}`, { description: "Qualified and moved to the next stage" });
                    desk.log(`${b.agent} called ${b.name}, qualified`, "ok");
                  }}
                >
                  Call
                </Btn>
              </li>
            ))}
            {uncalled.length === 0 && <li className="py-6 text-center text-[13px] text-d-mute">Every lead has had a first call.</li>}
          </ul>
        </Panel>
        <Panel title="Where buyers come from" sub="Last 30 days, 412 leads · cost per qualified lead">
          <div className="flex flex-wrap items-center gap-5">
            <Donut
              size={150}
              center="412"
              sub="leads"
              segments={[
                { label: "99acres", value: 138, tone: "info" },
                { label: "MagicBricks", value: 92, tone: "late" },
                { label: "Meta lead ads", value: 84, tone: "accent" },
                { label: "Housing.com", value: 51, tone: "warn" },
                { label: "Referral & walk-in", value: 47, tone: "ok" },
              ]}
            />
            <div className="min-w-[180px] flex-1">
              <HBars
                format={(v) => (v ? inr(v) : "free")}
                data={[
                  { label: "Referral", value: 0, tone: "ok" },
                  { label: "99acres", value: 1840, tone: "info" },
                  { label: "Meta ads", value: 1260, tone: "accent" },
                  { label: "MagicBricks", value: 2310, tone: "late" },
                ]}
              />
            </div>
          </div>
        </Panel>
      </div>
      <Sheet
        open={!!buyer}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={buyer ? `${buyer.id} · ${buyer.source} · ${buyer.agent}` : ""}
        title={buyer?.name ?? ""}
        sub={buyer ? `${buyer.from} · ${buyer.purpose}` : ""}
        footer={
          <>
            <Btn
              icon={MessageCircle}
              onClick={() => {
                toast.success("Shortlist sent on WhatsApp", { description: `Top 3 matches with price sheets to ${buyer?.name}` });
                desk.log(`Shortlist sent to ${buyer?.name}`);
              }}
            >
              Send shortlist
            </Btn>
            <Btn variant="solid" onClick={() => setOpen(null)}>
              Done
            </Btn>
          </>
        }
      >
        {buyer && (
          <div className="space-y-5">
            <KV items={[{ k: "Looking for", v: buyer.bhk }, { k: "Budget", v: inr(buyer.budget, { compact: true }) }, { k: "Sectors", v: buyer.prefer.map((x) => nodeOf(x).name).join(", ") }, { k: "Loan", v: buyer.loan }, { k: "Lead score", v: buyer.score }, { k: "Last touch", v: buyer.touched }]} />
            <p className="rounded-[12px] bg-d-soft px-3 py-2 text-[13px]">{buyer.note}</p>
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Best matches right now</p>
              <ul className="space-y-2">
                {topMatches(buyer, store.statusOf).map((m) => (
                  <li key={m.unit.id}>
                    <button type="button" onClick={() => store.openMatch(m)} className="flex w-full items-center gap-3 rounded-[12px] border border-d-line p-2.5 text-left hover:border-d-accent">
                      <ScoreRing score={m.score} size={38} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-medium">
                          {projectOf(m.unit.project).name} · {m.unit.id}
                        </span>
                        <span className="block text-[11.5px] text-d-mute">
                          {m.unit.bhk} · {m.unit.area.toLocaleString("en-IN")} sq ft · {m.unit.facing}
                        </span>
                      </span>
                      <span className="tnum font-mono text-[12px]">{inr(priceOf(m.unit), { compact: true })}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Stage</p>
              <Segmented
                size="sm"
                options={STAGE_COLS.map((c) => ({ value: c.id, label: c.label }))}
                value={buyer.stage}
                onChange={(v) => {
                  setBuyers((cur) => cur.map((x) => (x.id === buyer.id ? { ...x, stage: v } : x)));
                  desk.log(`${buyer.name} → ${v}`);
                }}
              />
            </div>
          </div>
        )}
      </Sheet>
      <AddBuyer
        open={adding}
        onOpenChange={setAdding}
        onAdd={(b) => {
          setBuyers((cur) => [b, ...cur]);
          toast.success("Buyer added", { description: `${b.name} assigned to ${b.agent}. Lead Qualifier will call in 5 minutes.` });
          desk.log(`New buyer ${b.name}, ${b.bhk}, ${inr(b.budget, { compact: true })}`, "info");
        }}
        nextId={`B-${2260 + buyers.length - SEED_BUYERS.length}`}
      />
    </div>
  );
}

function AddBuyer({ open, onOpenChange, onAdd, nextId }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (b: Buyer) => void; nextId: string }) {
  const [name, setName] = React.useState("Varun & Isha Khanna");
  const [bhk, setBhk] = React.useState("3 BHK");
  const [budget, setBudget] = React.useState("180");
  const [node, setNode] = React.useState<NodeId>("s150");
  const [agent, setAgent] = React.useState("Pooja");
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Add a buyer" sub="Walk-in, referral or a call to the office. Match Maker scores them against inventory straight away.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onAdd({ id: nextId, name, from: "Walk-in, Sector 18 office", bhk, budget: (Number(budget) || 100) * 100000, prefer: [node], purpose: "End use", loan: "To be checked", stage: "new", source: "Walk-in", agent, score: 60, touched: "just now", note: "Added from the office desk." });
          onOpenChange(false);
        }}
      >
        <Field label="Buyer name">
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Configuration">
            <select className={inputClass} value={bhk} onChange={(e) => setBhk(e.target.value)}>
              {["2 BHK", "3 BHK", "4 BHK", "Villa", "Plot"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Budget (₹ lakh)">
            <input className={inputClass} inputMode="numeric" value={budget} onChange={(e) => setBudget(e.target.value.replace(/\D/g, ""))} />
          </Field>
          <Field label="Preferred location">
            <select className={inputClass} value={node} onChange={(e) => setNode(e.target.value as NodeId)}>
              {NODES.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Agent">
            <select className={inputClass} value={agent} onChange={(e) => setAgent(e.target.value)}>
              {["Pooja", "Imran", "Deepak", "Arjun", "Neha"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Btn onClick={() => onOpenChange(false)}>Cancel</Btn>
          <Btn variant="solid" type="submit" icon={Plus}>
            Add and match
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Inventory ---------------- */

function gridStatus(project: string, tower: string, floor: number, unit: number): UnitStatus {
  const seed = (project.charCodeAt(0) * 31 + project.charCodeAt(1) * 7 + tower.charCodeAt(0) * 13 + floor * 17 + unit * 29) % 100;
  const p = projectOf(project);
  const soldShare = 100 - Math.round((p.left / p.total) * 100);
  if (seed < soldShare) return "Sold";
  if (seed < soldShare + 4) return "Hold";
  if (seed < soldShare + 7) return "Token";
  return "Available";
}
const statusTone: Record<UnitStatus, string> = { Available: "var(--d-ok)", Hold: "var(--d-warn)", Token: "var(--d-accent)", Sold: "var(--d-line)" };

function InventoryModule({ store }: { store: Store }) {
  const desk = useDesk();
  const [pid, setPid] = React.useState("KH");
  const p = projectOf(pid);
  const [tower, setTower] = React.useState(p.towers[0]);
  const [cell, setCell] = React.useState<{ floor: number; n: number } | null>(null);
  const [overrides, setOverrides] = React.useState<Record<string, UnitStatus>>({});
  const t = p.towers.includes(tower) ? tower : p.towers[0];
  const floors = Array.from({ length: p.floors }, (_, i) => p.floors - i);
  const keyOf = (f: number, n: number) => `${pid}-${t}-${String(f).padStart(2, "0")}0${n}`;
  const listed = (f: number, n: number) => UNITS.find((u) => u.id === keyOf(f, n));
  const stateOf = (f: number, n: number): UnitStatus => {
    const l = listed(f, n);
    return overrides[keyOf(f, n)] ?? (l ? store.statusOf(l) : gridStatus(pid, t, f, n));
  };
  const counts = (["Available", "Hold", "Token", "Sold"] as UnitStatus[]).map((s) => ({ s, n: floors.reduce((a, f) => a + [1, 2, 3, 4].filter((n) => stateOf(f, n) === s).length, 0) }));
  const sel = cell ? { id: keyOf(cell.floor, cell.n), status: stateOf(cell.floor, cell.n), area: listed(cell.floor, cell.n)?.area ?? (cell.n % 2 ? 1850 : 2650), facing: listed(cell.floor, cell.n)?.facing ?? (["Park facing", "East", "Expressway", "North-east"][cell.n - 1] ?? "East") } : null;
  const selPsf = cell ? p.psf + cell.floor * 25 + (cell.n === 1 ? 300 : 0) : 0;
  const bsp = sel ? sel.area * selPsf : 0;

  function setStatus(s: UnitStatus) {
    if (!sel) return;
    setOverrides((o) => ({ ...o, [sel.id]: s }));
    const l = UNITS.find((u) => u.id === sel.id);
    if (l) store.setUnitState((x) => ({ ...x, [l.id]: s }));
    toast.success(`${sel.id} → ${s}`, { description: s === "Hold" ? "Builder CRM blocked for 48 hours" : "Inventory and matches updated" });
    desk.log(`${sel.id} set to ${s}`, s === "Available" ? "info" : "ok");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Units we can sell" value={PROJECTS.reduce((a, x) => a + x.left, 0)} hint="across 8 projects" icon={Building2} />
        <Stat label="Listed and matched" value={UNITS.filter((u) => store.statusOf(u) === "Available").length} hint="on portals with RERA no." icon={Compass} tone="info" />
        <Stat label="Average price" value="₹10,950/sq ft" delta="+4.2%" hint="since July" icon={IndianRupee} trend={[10.2, 10.3, 10.4, 10.5, 10.7, 10.8, 10.95]} />
        <Stat label="Inventory value" value={inr(UNITS.reduce((a, u) => a + priceOf(u), 0), { compact: true })} hint="listed units only" icon={Landmark} tone="ok" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Panel title="Projects" sub="Pick a project to see its towers">
          <ul className="space-y-2">
            {PROJECTS.map((x) => (
              <li key={x.id}>
                <button
                  type="button"
                  disabled={x.floors <= 1}
                  onClick={() => {
                    setPid(x.id);
                    setTower(x.towers[0]);
                    setCell(null);
                  }}
                  className={`w-full rounded-[12px] border p-3 text-left transition-colors disabled:cursor-default ${pid === x.id ? "border-d-accent bg-d-soft" : "border-d-line hover:bg-d-sunk"}`}
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-[13.5px] font-semibold">{x.name}</span>
                    <span className="tnum font-mono text-[11.5px] text-d-mute">{inr(x.psf)}</span>
                  </span>
                  <span className="block text-[11.5px] text-d-mute">
                    {nodeOf(x.node).name} · {x.config} · {x.possession}
                  </span>
                  <Meter value={x.total - x.left} max={x.total} className="mt-2" height={4} />
                  <span className="mt-1 block font-mono text-[10.5px] text-d-mute">
                    {x.left} of {x.total} left{x.floors <= 1 ? " · plots, see table" : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel
          title={`${p.name} · Tower ${t}`}
          sub={`${p.builder} · ${p.rera} · ${p.floors} floors × 4 units`}
          action={<Segmented size="sm" options={p.towers} value={t} onChange={(v) => { setTower(v); setCell(null); }} />}
        >
          <div className="mb-3 flex flex-wrap gap-4 text-[12px]">
            {counts.map((c) => (
              <span key={c.s} className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-[3px]" style={{ background: statusTone[c.s] }} />
                {c.s} <span className="font-mono text-d-mute">{c.n}</span>
              </span>
            ))}
          </div>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="desk-scroll max-h-[460px] overflow-y-auto pr-1">
              <div className="grid grid-cols-[38px_repeat(4,minmax(0,1fr))] gap-1">
                <span />
                {["01 · Park", "02 · East", "03 · Expwy", "04 · NE"].map((h) => (
                  <span key={h} className="pb-1 text-center font-mono text-[10px] text-d-mute">
                    {h}
                  </span>
                ))}
                {floors.map((f) => (
                  <React.Fragment key={f}>
                    <span className="flex items-center justify-end pr-1 font-mono text-[10.5px] text-d-mute">F{f}</span>
                    {[1, 2, 3, 4].map((n) => {
                      const s = stateOf(f, n);
                      const on = cell?.floor === f && cell.n === n;
                      const isListed = !!listed(f, n);
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setCell({ floor: f, n })}
                          title={`${keyOf(f, n)} · ${s}`}
                          className="relative h-6 rounded-[4px] transition-transform hover:scale-[1.06]"
                          style={{ background: s === "Sold" ? "var(--d-sunk)" : `color-mix(in oklab, ${statusTone[s]} ${s === "Available" ? 55 : 75}%, var(--d-panel))`, outline: on ? "2px solid var(--d-ink)" : undefined, outlineOffset: 1 }}
                        >
                          {isListed && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-d-ink" />}
                        </button>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="rounded-[12px] border border-d-line p-3">
              {sel ? (
                <div className="space-y-3">
                  <div>
                    <p className="font-mono text-[11px] text-d-mute">{sel.id}</p>
                    <p className="desk-h text-[17px] font-semibold">
                      Floor {cell!.floor}, unit 0{cell!.n}
                    </p>
                    <Pill tone={sel.status === "Available" ? "ok" : sel.status === "Hold" ? "warn" : sel.status === "Token" ? "accent" : "neutral"}>{sel.status}</Pill>
                  </div>
                  <KV
                    cols={1}
                    items={[
                      { k: "Super area", v: `${sel.area.toLocaleString("en-IN")} sq ft` },
                      { k: "Facing", v: sel.facing },
                      { k: "Price", v: `${inr(selPsf)}/sq ft` },
                      { k: "Basic", v: inr(bsp, { compact: true }) },
                      { k: "GST", v: p.ready ? "Nil (OC received)" : `5% · ${inr(bsp * 0.05, { compact: true })}` },
                      { k: "Stamp duty (UP)", v: `7% · ${inr(bsp * 0.07, { compact: true })}` },
                    ]}
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {sel.status === "Available" && (
                      <Btn size="sm" variant="solid" onClick={() => setStatus("Hold")}>
                        Hold 48 h
                      </Btn>
                    )}
                    {(sel.status === "Hold" || sel.status === "Token") && (
                      <Btn size="sm" onClick={() => setStatus("Available")}>
                        Release
                      </Btn>
                    )}
                    <Btn
                      size="sm"
                      variant="soft"
                      icon={Send}
                      onClick={() => {
                        toast.success("Price sheet shared", { description: `${sel.id} with floor plan and RERA number` });
                        desk.log(`Price sheet for ${sel.id} shared on WhatsApp`);
                      }}
                    >
                      Share
                    </Btn>
                  </div>
                </div>
              ) : (
                <p className="py-10 text-center text-[12.5px] text-d-mute">Click a unit to see its price, taxes and status. A dot means it is listed on the portals.</p>
              )}
            </div>
          </div>
        </Panel>
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Panel title="Listed units" sub="What the portals and Match Maker see. Click a row for its best buyer.">
          <DataTable
            rows={UNITS}
            rowKey={(u) => u.id}
            search={(u) => `${u.id} ${projectOf(u.project).name} ${u.bhk} ${u.facing}`}
            searchPlaceholder="Search unit, project or facing"
            filter={{ get: (u) => store.statusOf(u), options: ["Available", "Hold", "Token"] }}
            onRow={(u) => {
              const best = store.buyers
                .filter((b) => b.stage !== "token")
                .map((b) => ({ buyer: b, unit: u, score: matchScore(b, u) }))
                .sort((a, c) => c.score - a.score)[0];
              if (best) store.openMatch(best);
            }}
            columns={[
              { key: "id", label: "Unit", render: (u) => <span className="font-mono text-[12px] font-medium">{u.id}</span>, sort: (u) => u.id },
              { key: "proj", label: "Project", render: (u) => projectOf(u.project).name, sort: (u) => u.project },
              { key: "bhk", label: "Type", render: (u) => u.bhk },
              { key: "fl", label: "Floor · facing", render: (u) => <span className="text-d-mute">{u.floor ? `F${u.floor} · ` : ""}{u.facing}</span>, wide: true },
              { key: "psf", label: "₹/sq ft", align: "right", render: (u) => <span className="tnum font-mono">{u.psf.toLocaleString("en-IN")}</span>, sort: (u) => u.psf },
              { key: "price", label: "All-in", align: "right", render: (u) => <span className="tnum font-mono">{inr(priceOf(u), { compact: true })}</span>, sort: (u) => priceOf(u) },
              { key: "st", label: "Status", render: (u) => { const s = store.statusOf(u); return <Pill tone={s === "Available" ? "ok" : s === "Hold" ? "warn" : "accent"}>{s}</Pill>; } },
            ]}
          />
        </Panel>
        <Panel title="Price per sq ft by location" sub="Average of what we sell, October">
          <HBars
            format={(v) => `₹${(v / 1000).toFixed(1)}k`}
            data={NODES.map((n) => {
              const ps = PROJECTS.filter((x) => x.node === n.id);
              return { label: n.name, value: Math.round(ps.reduce((a, x) => a + x.psf, 0) / Math.max(1, ps.length)), tone: n.id === "s128" ? ("accent" as const) : n.id === "yeida" ? ("info" as const) : ("warn" as const) };
            }).sort((a, b) => b.value - a.value)}
          />
          <p className="mt-4 text-[12px] leading-relaxed text-d-mute">YEIDA plots are up 31% since the airport trial runs; Sector 137 has been flat for two quarters.</p>
        </Panel>
      </div>
    </div>
  );
}

/* ---------------- Site visits ---------------- */

function VisitsModule({ store }: { store: Store }) {
  const desk = useDesk();
  const { visits, setVisits } = store;
  const [open, setOpen] = React.useState<string | null>(null);
  const [rating, setRating] = React.useState(4);
  const visit = visits.find((v) => v.id === open) ?? null;
  const setStatus = (id: string, s: Visit["status"]) => {
    const v = visits.find((x) => x.id === id);
    setVisits((cur) => cur.map((x) => (x.id === id ? { ...x, status: s } : x)));
    toast.success(`${v?.buyer}: ${s}`, { description: s === "Done" ? "Feedback form sent to the buyer" : s === "No-show" ? "Rebook link sent on WhatsApp" : "Reminder scheduled 2 hours before" });
    desk.log(`Visit ${id} (${v?.buyer}) → ${s}`, s === "No-show" ? "late" : "ok");
  };
  const toneOf: Record<Visit["status"], Tone> = { Scheduled: "neutral", Confirmed: "info", Done: "ok", "No-show": "late" };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Visits this week" value={visits.length} delta="+4" hint="vs last week" icon={CalendarDays} trend={[7, 9, 8, 10, 9, 11, visits.length]} />
        <Stat label="Today" value={visits.filter((v) => v.day === 0).length} hint={`${visits.filter((v) => v.day === 0 && v.status === "Done").length} done`} icon={MapPin} tone="info" />
        <Stat label="Cabs booked" value={visits.filter((v) => v.cab).length} hint="≈ ₹2,030 per visit" icon={Car} tone="warn" />
        <Stat label="Visit to token" value="1 in 4.2" delta="+0.6" hint="last 60 days" icon={KeyRound} tone="ok" />
      </div>
      <Panel title="This week" sub="Drag a visit to another day. The buyer and the agent get the new time on WhatsApp.">
        <Board
          columns={DAYS.map((d, i) => ({ id: String(i), label: i === 0 ? `${d} · today` : d, tone: i === 0 ? ("accent" as const) : i >= 4 && i <= 5 ? ("warn" as const) : ("neutral" as const) }))}
          items={[...visits].sort((a, b) => a.at - b.at)}
          itemKey={(v) => v.id}
          getColumn={(v) => String(v.day)}
          minColumnWidth={168}
          onMove={(id, col) => {
            const v = visits.find((x) => x.id === id);
            if (!v || String(v.day) === col) return;
            setVisits((cur) => cur.map((x) => (x.id === id ? { ...x, day: Number(col), status: "Scheduled" } : x)));
            toast.success(`${v.buyer} moved to ${DAYS[Number(col)]}`, { description: `${hourLabel(v.at)} · ${v.agent} and the buyer notified` });
            desk.log(`Visit rescheduled: ${v.buyer} to ${DAYS[Number(col)]}`, "info");
          }}
          renderCard={(v) => (
            <button type="button" onClick={() => setOpen(v.id)} className="block w-full text-left">
              <span className="flex items-center gap-1.5 pr-3">
                <span className="tnum font-mono text-[11px] text-d-mute">{hourLabel(v.at)}</span>
                {v.mode === "Video" && <Pill tone="info">video</Pill>}
                {v.cab && <Car className="h-3.5 w-3.5 text-d-mute" />}
              </span>
              <span className="mt-1 block text-[12.5px] font-semibold leading-snug">{v.buyer}</span>
              <span className="block text-[11px] text-d-mute">
                {projectOf(v.project).name} · {v.agent}
              </span>
              <span className="mt-1.5 block">
                <Pill tone={toneOf[v.status]}>{v.status}</Pill>
              </span>
            </button>
          )}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel icon={MessageCircle} title="Feedback from yesterday" sub="Collected by the driver drop-off form">
          <ul className="space-y-3">
            {[
              { b: "Pallavi & Gaurav Tyagi", p: "Aerocity Plots", r: 4, liked: "30 m road, near the airport cargo gate", obj: "Wants a lease-deed copy before paying" },
              { b: "Megha Saxena", p: "Sapphire Ville", r: 3, liked: "Clubhouse and the 2 BHK layout", obj: "Possession date Mar 2027 feels risky" },
              { b: "Col. Ajay Rana", p: "Trident Palm Court", r: 5, liked: "Ready, OC done, park view", obj: "None. Token likely this week" },
              { b: "Sushant Dubey", p: "Kesar Heights", r: 2, liked: "Greenery", obj: "Too far from his Gurugram office" },
            ].map((f) => (
              <li key={f.b} className="rounded-[12px] border border-d-line p-3">
                <p className="flex items-center justify-between gap-2">
                  <span className="text-[13.5px] font-semibold">{f.b}</span>
                  <span className="font-mono text-[12px] text-d-accent">{"★".repeat(f.r)}<span className="text-d-line">{"★".repeat(5 - f.r)}</span></span>
                </p>
                <p className="text-[12px] text-d-mute">{f.p}</p>
                <p className="mt-1.5 text-[12.5px]">
                  <span className="text-d-ok">Liked:</span> {f.liked}
                </p>
                <p className="text-[12.5px]">
                  <span className="text-d-late">Objection:</span> {f.obj}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Visits that turned into tokens" sub="By project, last 60 days">
          <Bars
            height={210}
            data={PROJECTS.slice(0, 7).map((x, i) => {
              const v = [14, 9, 22, 6, 31, 12, 8][i];
              const t = [3, 3, 6, 2, 5, 3, 1][i];
              return { label: x.name.split(" ")[0], value: v, stack: [{ name: "Token", value: t, tone: "accent" as const }, { name: "No token yet", value: v - t, tone: "neutral" as const }] };
            })}
          />
        </Panel>
      </div>
      <Sheet
        open={!!visit}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={visit ? `${visit.id} · ${visit.mode} visit` : ""}
        title={visit?.buyer ?? ""}
        sub={visit ? `${projectOf(visit.project).name} · ${DAYS[visit.day]} ${hourLabel(visit.at)} · ${visit.agent}` : ""}
        footer={
          visit && (
            <>
              <Btn onClick={() => { setStatus(visit.id, "No-show"); setOpen(null); }}>No-show</Btn>
              <Btn onClick={() => setStatus(visit.id, "Confirmed")}>Confirm</Btn>
              <Btn variant="solid" icon={CheckCheck} onClick={() => { setStatus(visit.id, "Done"); setOpen(null); }}>
                Mark done
              </Btn>
            </>
          )
        }
      >
        {visit && (
          <div className="space-y-4">
            <KV items={[{ k: "Unit shown", v: visit.unit ?? "Sample flat + 2 options" }, { k: "Cab", v: visit.cab ? "Ola Corporate, pickup 45 min before" : "Own transport" }, { k: "Location", v: nodeOf(projectOf(visit.project).node).name }, { k: "Status", v: <Pill tone={toneOf[visit.status]}>{visit.status}</Pill> }]} />
            <div className="rounded-[12px] border border-d-line p-3">
              <p className="mb-2 text-[12px] font-medium text-d-mute">Quick feedback</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setRating(n)} className={`text-[22px] leading-none ${n <= rating ? "text-d-accent" : "text-d-line"}`} aria-label={`${n} stars`}>
                    ★
                  </button>
                ))}
              </div>
              <textarea className={`${inputClass} mt-2 h-20 py-2`} placeholder="What did they like? Any objection?" defaultValue="" />
              <Btn size="sm" variant="soft" className="mt-2" onClick={() => { toast.success("Feedback saved", { description: `${rating} stars · Match Maker will re-score` }); desk.log(`Feedback ${rating}★ for ${visit.buyer}`); }}>
                Save feedback
              </Btn>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Deals & token ---------------- */

function planSchedule(d: Deal) {
  const v = d.value;
  switch (d.plan) {
    case "CLP":
      return [
        { m: "Token", pct: 0, amt: d.token },
        { m: "Within 30 days of booking", pct: 10 },
        { m: "On start of excavation", pct: 15 },
        { m: "On casting of 5th floor slab", pct: 15 },
        { m: "On casting of top floor slab", pct: 25 },
        { m: "On brickwork and plaster", pct: 25 },
        { m: "On offer of possession", pct: 10 },
      ].map((x) => ({ ...x, amt: x.amt ?? (v * x.pct) / 100 }));
    case "25:75":
      return [{ m: "Token", pct: 0, amt: d.token }, { m: "25% within 45 days", pct: 25 }, { m: "75% on possession", pct: 75 }].map((x) => ({ ...x, amt: x.amt ?? (v * x.pct) / 100 }));
    case "10:90 subvention":
      return [{ m: "Token", pct: 0, amt: d.token }, { m: "10% on BBA", pct: 10 }, { m: "80% by bank, builder pays pre-EMI", pct: 80 }, { m: "10% on possession", pct: 10 }].map((x) => ({ ...x, amt: x.amt ?? (v * x.pct) / 100 }));
    case "30:70":
      return [{ m: "Token", pct: 0, amt: d.token }, { m: "30% within 60 days", pct: 30 }, { m: "70% on registry", pct: 70 }].map((x) => ({ ...x, amt: x.amt ?? (v * x.pct) / 100 }));
    case "Down payment":
      return [{ m: "Token", pct: 0, amt: d.token }, { m: "95% within 45 days (7% rebate)", pct: 95 }, { m: "5% on registry", pct: 5 }].map((x) => ({ ...x, amt: x.amt ?? (v * x.pct) / 100 }));
    default:
      return [{ m: "Token", pct: 0, amt: d.token }, { m: "10% on BBA", pct: 10 }, { m: "Home loan disbursal", pct: 80 }, { m: "10% at registry", pct: 10 }].map((x) => ({ ...x, amt: x.amt ?? (v * x.pct) / 100 }));
  }
}

function DealsModule({ store }: { store: Store }) {
  const desk = useDesk();
  const { deals, setDeals } = store;
  const [stage, setStage] = React.useState<"All" | DealStage>("All");
  const [open, setOpen] = React.useState<string | null>(null);
  const deal = deals.find((d) => d.id === open) ?? null;
  const shown = deals.filter((d) => stage === "All" || d.stage === stage);
  const book = deals.reduce((a, d) => a + d.value, 0);
  const brokerage = deals.reduce((a, d) => a + d.value * projectOf(d.project).brokerage, 0);
  const stepIndex = deal ? DEAL_STAGES.indexOf(deal.stage) : 0;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Deals in progress" value={deals.filter((d) => d.stage !== "Registry").length} icon={Handshake} hint={`${deals.length} this quarter`} />
        <Stat label="Agreement value" value={inr(book, { compact: true })} delta="+22%" icon={Landmark} trend={[11, 13, 15, 16, 18, 20, book / 1e7]} />
        <Stat label="Our brokerage" value={inr(brokerage, { compact: true })} hint="before GST" icon={IndianRupee} tone="ok" />
        <Stat label="Stuck over 10 days" value={deals.filter((d) => d.days > 10 && d.stage !== "Registry").length} hint="BBA or bank" icon={AlertTriangle} tone="late" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {DEAL_STAGES.map((s, i) => {
          const list = deals.filter((d) => d.stage === s);
          const on = stage === s;
          return (
            <button key={s} type="button" onClick={() => setStage(on ? "All" : s)} className={`relative overflow-hidden rounded-[12px] border p-3 text-left transition-colors ${on ? "border-d-accent bg-d-soft" : "border-d-line bg-d-panel hover:bg-d-sunk"}`}>
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-d-mute">Step {i + 1}</span>
              <span className="block text-[14px] font-semibold">{s}</span>
              <span className="tnum mt-1 block font-mono text-[12px]">
                {list.length} · {inr(list.reduce((a, d) => a + d.value, 0), { compact: true })}
              </span>
              <span className="absolute bottom-0 left-0 h-1 bg-d-accent" style={{ width: `${((i + 1) / 5) * 100}%`, opacity: 0.25 + i * 0.15 }} />
            </button>
          );
        })}
      </div>
      <Panel title="Deals" sub="Click a deal for its payment plan and the next step">
        <DataTable
          rows={shown}
          rowKey={(d) => d.id}
          search={(d) => `${d.id} ${d.buyer} ${d.unit} ${projectOf(d.project).name}`}
          searchPlaceholder="Search buyer, unit or project"
          filter={{ get: (d) => d.agent, options: ["Pooja", "Imran", "Deepak", "Arjun"] }}
          onRow={(d) => setOpen(d.id)}
          bulk={[{ label: "Send payment reminders", run: (k) => { toast.success(`${k.length} demand reminders sent`); desk.log(`${k.length} payment reminders sent`); } }]}
          columns={[
            { key: "id", label: "Deal", render: (d) => <span className="font-mono text-[12px]">{d.id}</span>, sort: (d) => d.id },
            { key: "buyer", label: "Buyer", render: (d) => <span className="font-medium">{d.buyer}</span>, sort: (d) => d.buyer },
            { key: "unit", label: "Unit", render: (d) => <span className="text-d-mute">{projectOf(d.project).name} · {d.unit.split("-").slice(1).join("-")}</span>, wide: true },
            { key: "val", label: "Value", align: "right", render: (d) => <span className="tnum font-mono">{inr(d.value, { compact: true })}</span>, sort: (d) => d.value },
            { key: "tok", label: "Token", align: "right", render: (d) => <span className="tnum font-mono">{inr(d.token, { compact: true })}</span>, sort: (d) => d.token },
            { key: "plan", label: "Plan", render: (d) => <span className="text-[12px]">{d.plan}</span>, wide: true },
            { key: "stage", label: "Stage", render: (d) => <Pill tone={d.stage === "Registry" ? "ok" : d.days > 10 ? "late" : "info"}>{d.stage}{d.days > 0 ? ` · ${d.days}d` : ""}</Pill>, sort: (d) => DEAL_STAGES.indexOf(d.stage) },
          ]}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Panel icon={Stamp} title="Builder exceptions waiting on Rajeev" sub="Discounts and plan changes above the agent's limit">
          <ApprovalQueue
            approveLabel="Accept"
            items={[
              { id: "x1", title: "Riverbank: ₹350/sq ft off, R1-2201", sub: "Kohli family · token before Thursday · we keep 3% on net", amount: "−₹11 L", meta: "Yamuna Vista" },
              { id: "x2", title: "Ganga Realtech: PLC waiver, T2-1501", sub: "Ankit Garg · floor price ₹13,300 holds", amount: "−₹3 L", meta: "Neelgiri", tone: "info" },
              { id: "x3", title: "Trident: free 2nd car park, F-1104", sub: "Prateek Sinha · builder wants us to share 0.25%", amount: "−₹36k", meta: "Trident" },
              { id: "x4", title: "Ashoka: move Lakshmi Iyer to 25:75", sub: "Bank delay; builder agrees if BBA by 30 Oct", meta: "Sapphire", tone: "ok" },
            ]}
            onDecide={(id, d) => d && desk.log(`Builder exception ${id} ${d}`, d === "approved" ? "ok" : "warn")}
          />
        </Panel>
        <Panel title="Token money by week" sub="Paid into builder escrow accounts">
          <AreaChart labels={["8 Sep", "15 Sep", "22 Sep", "29 Sep", "6 Oct", "13 Oct", "20 Oct"]} series={[{ name: "Tokens (₹ L)", data: [3.5, 6, 4.5, 10, 7.5, 12.5, deals.slice(0, 3).reduce((a, d) => a + d.token, 0) / 1e5], tone: "accent" }, { name: "Target", data: [8, 8, 8, 9, 9, 10, 10], tone: "neutral", dashed: true }]} format={(v) => `₹${v.toFixed(1)}L`} height={190} />
        </Panel>
      </div>
      <Sheet
        open={!!deal}
        onOpenChange={(o) => !o && setOpen(null)}
        width={520}
        eyebrow={deal ? `${deal.id} · ${deal.plan}` : ""}
        title={deal?.buyer ?? ""}
        sub={deal ? `${projectOf(deal.project).name} ${deal.unit} · ${inr(deal.value, { compact: true })} · ${deal.bank}` : ""}
        footer={
          deal && (
            <>
              <Btn icon={FileText} onClick={() => { toast.success("Demand letter sent", { description: `${deal.buyer} · next instalment` }); desk.log(`Demand letter sent to ${deal.buyer}`); }}>
                Demand letter
              </Btn>
              <Btn
                variant="solid"
                disabled={deal.stage === "Registry"}
                onClick={() => {
                  const next = DEAL_STAGES[Math.min(DEAL_STAGES.length - 1, stepIndex + 1)];
                  setDeals((cur) => cur.map((x) => (x.id === deal.id ? { ...x, stage: next, days: 0 } : x)));
                  toast.success(`${deal.buyer} → ${next}`, { description: next === "Registry" ? "Brokerage invoice drafted for the builder" : "Builder CRM updated" });
                  desk.log(`${deal.id} ${deal.buyer} moved to ${next}`, "ok");
                }}
              >
                Move to {DEAL_STAGES[Math.min(DEAL_STAGES.length - 1, stepIndex + 1)]}
              </Btn>
            </>
          )
        }
      >
        {deal && (
          <div className="space-y-5">
            <div className="flex items-center gap-1">
              {DEAL_STAGES.map((s, i) => (
                <div key={s} className="flex-1">
                  <div className="h-1.5 rounded-full" style={{ background: i <= stepIndex ? "var(--d-accent)" : "var(--d-sunk)" }} />
                  <p className={`mt-1 text-[10.5px] ${i === stepIndex ? "font-semibold text-d-ink" : "text-d-mute"}`}>{s}</p>
                </div>
              ))}
            </div>
            <KV items={[{ k: "Agreement value", v: inr(deal.value) }, { k: "Token paid", v: inr(deal.token) }, { k: "Brokerage", v: `${(projectOf(deal.project).brokerage * 100).toFixed(1)}% · ${inr(deal.value * projectOf(deal.project).brokerage, { compact: true })}` }, { k: "Days in stage", v: deal.days }]} />
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Payment plan · {deal.plan}</p>
              <ul className="space-y-1.5">
                {planSchedule(deal).map((x, i) => (
                  <li key={x.m} className="flex items-center gap-3 rounded-[10px] border border-d-line px-3 py-2 text-[12.5px]">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${i === 0 || (i === 1 && stepIndex >= 2) ? "bg-d-accent text-d-accent-ink" : "bg-d-sunk text-d-mute"}`}>{i + 1}</span>
                    <span className="flex-1">{x.m}</span>
                    {x.pct > 0 && <span className="font-mono text-[11px] text-d-mute">{x.pct}%</span>}
                    <span className="tnum w-20 text-right font-mono">{inr(x.amt, { compact: true })}</span>
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

/* ---------------- Commissions ---------------- */

function CommissionsModule() {
  const desk = useDesk();
  const [rows, setRows] = React.useState(PAYOUTS);
  const [open, setOpen] = React.useState<Payout | null>(null);
  const due = rows.filter((r) => r.status !== "Paid");
  const brokerage = (r: Payout) => r.value * r.rate;
  const outstanding = (r: Payout) => (r.status === "Part paid" ? brokerage(r) * 0.45 : brokerage(r));
  const total = due.reduce((a, r) => a + outstanding(r), 0);
  const bucket = (r: Payout) => (r.status === "Not raised" ? "Not raised" : r.days <= 30 ? "0-30 days" : r.days <= 60 ? "31-60 days" : r.days <= 90 ? "61-90 days" : "90+ days");
  const buckets = ["Not raised", "0-30 days", "31-60 days", "61-90 days", "90+ days"].map((label, i) => ({ label, value: due.filter((r) => bucket(r) === label).reduce((a, r) => a + outstanding(r), 0), tone: (["neutral", "ok", "info", "warn", "late"] as const)[i] }));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Brokerage receivable" value={inr(total, { compact: true })} delta="+9%" deltaGood={false} hint="before GST" icon={IndianRupee} tone="warn" trend={[52, 55, 58, 60, 63, 65, total / 1e5]} />
        <Stat label="Over 60 days" value={inr(due.filter((r) => r.days > 60).reduce((a, r) => a + outstanding(r), 0), { compact: true })} hint={`${due.filter((r) => r.days > 60).length} invoices`} icon={AlertTriangle} tone="late" />
        <Stat label="Not yet invoiced" value={rows.filter((r) => r.status === "Not raised").length} hint="closed deals" icon={Receipt} />
        <Stat label="Received this quarter" value="₹41.2 L" delta="+14%" icon={Banknote} tone="ok" trend={[8, 14, 19, 25, 31, 36, 41]} />
      </div>
      <Panel title="Ageing by bucket" sub="Brokerage still owed by builders, net of part payments">
        <AgingBar buckets={buckets} format={(v) => inr(v, { compact: true })} />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Panel title="Builder invoices" sub="GST at 18% on top, builders deduct TDS at 2% under 194H">
          <DataTable
            rows={rows}
            rowKey={(r) => `${r.inv}-${r.deal}`}
            search={(r) => `${r.inv} ${r.builder} ${r.deal}`}
            searchPlaceholder="Search builder, invoice or buyer"
            filter={{ get: (r) => r.status, options: ["Not raised", "Raised", "Part paid", "Paid"] }}
            onRow={setOpen}
            bulk={[{ label: "Send reminders", run: (k) => { toast.success(`${k.length} builder reminders sent`, { description: "Email to accounts with the invoice and ledger" }); desk.log(`${k.length} brokerage reminders sent`); } }]}
            columns={[
              { key: "inv", label: "Invoice", render: (r) => <span className="font-mono text-[12px]">{r.inv}</span> },
              { key: "b", label: "Builder", render: (r) => <span className="font-medium">{r.builder}</span>, sort: (r) => r.builder },
              { key: "deal", label: "Deal", render: (r) => <span className="text-d-mute">{r.deal}</span>, wide: true },
              { key: "amt", label: "Brokerage", align: "right", render: (r) => <span className="tnum font-mono">{inr(brokerage(r), { compact: true })}</span>, sort: (r) => brokerage(r) },
              { key: "days", label: "Days", align: "right", render: (r) => <span className="tnum font-mono" style={{ color: r.days > 90 ? "var(--d-late)" : r.days > 60 ? "var(--d-warn)" : undefined }}>{r.days || "—"}</span>, sort: (r) => r.days },
              { key: "st", label: "Status", render: (r) => <Pill tone={r.status === "Paid" ? "ok" : r.status === "Not raised" ? "neutral" : r.days > 60 ? "late" : "info"}>{r.status}</Pill> },
            ]}
          />
        </Panel>
        <Panel title="Owed by builder" sub="Outstanding brokerage">
          <HBars
            format={(v) => inr(v, { compact: true })}
            data={Object.entries(due.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.builder]: (acc[r.builder] ?? 0) + outstanding(r) }), {}))
              .sort((a, b) => b[1] - a[1])
              .map(([label, value]) => ({ label, value, tone: label === "Shivalik Infracon" || label === "Jewar Landmark Infra" ? ("late" as const) : ("accent" as const) }))}
          />
          <div className="mt-5 rounded-[12px] bg-d-sunk/70 p-3 text-[12.5px]">
            <p className="font-semibold">Team incentive pool, October</p>
            <p className="mt-0.5 text-d-mute">10% of received brokerage, paid on the 7th</p>
            <div className="mt-2 space-y-1.5">
              {[
                { n: "Pooja", v: 182000 },
                { n: "Imran", v: 96000 },
                { n: "Deepak", v: 71000 },
                { n: "Arjun", v: 44000 },
              ].map((x) => (
                <div key={x.n} className="flex items-center gap-2">
                  <span className="w-14">{x.n}</span>
                  <Meter value={x.v} max={200000} className="flex-1" />
                  <span className="tnum w-14 text-right font-mono">{inr(x.v, { compact: true })}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>
      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={open?.inv}
        title={open?.builder ?? ""}
        sub={open ? `${projectOf(open.project).name} · ${open.deal}` : ""}
        footer={
          open &&
          (open.status === "Not raised" ? (
            <Btn
              variant="solid"
              icon={Receipt}
              onClick={() => {
                const no = `YR/26-27/0${62 + rows.filter((r) => r.inv.startsWith("YR/26-27/06")).length}`;
                setRows((cur) => cur.map((r) => (r === open ? { ...r, inv: no, status: "Raised", raised: "20 Oct", days: 0 } : r)));
                toast.success(`Invoice ${no} raised`, { description: "Posted to Tally and emailed to the builder's accounts" });
                desk.log(`Brokerage invoice ${no} raised on ${open.builder}`, "ok");
                setOpen(null);
              }}
            >
              Raise invoice in Tally
            </Btn>
          ) : (
            <Btn
              variant="solid"
              icon={PhoneCall}
              onClick={() => {
                toast.success("Escalation sent", { description: `${open.builder}: MD and accounts head, with the ledger` });
                desk.log(`Escalated ${open.inv} with ${open.builder}`, "warn");
                setOpen(null);
              }}
            >
              Escalate to builder MD
            </Btn>
          ))
        }
      >
        {open && (
          <div className="space-y-4">
            <KV
              items={[
                { k: "Agreement value", v: inr(open.value, { compact: true }) },
                { k: "Rate", v: `${(open.rate * 100).toFixed(1)}%` },
                { k: "Brokerage", v: inr(brokerage(open)) },
                { k: "GST 18%", v: inr(brokerage(open) * 0.18) },
                { k: "TDS 194H (2%)", v: `−${inr(brokerage(open) * 0.02)}` },
                { k: "Net receivable", v: <b>{inr(brokerage(open) * 1.16)}</b> },
              ]}
            />
            <KV items={[{ k: "Raised", v: open.raised }, { k: "Days", v: open.days || "—" }, { k: "Status", v: open.status }, { k: "Promise", v: open.promise ?? "None yet" }]} />
            <p className="rounded-[12px] bg-d-soft px-3 py-2 text-[12.5px]">
              <Sparkles className="mr-1 inline h-3.5 w-3.5 text-d-accent" />
              {open.days > 60 ? "Past the 45-day clause in the channel-partner MoU. A formal note from Rajeev usually clears it in 9 days." : open.status === "Not raised" ? "Registry is done, so the MoU lets us invoice today." : "Inside terms. Brokerage Collector will remind on day 40."}
            </p>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- RERA & papers ---------------- */

const DOCS = ["PAN of all applicants", "Aadhaar (masked) of all applicants", "Booking form signed", "Token receipt from builder", "Allotment letter", "Builder-buyer agreement (BBA)", "Bank sanction letter", "Tripartite agreement", "NOC for loan from builder", "Stamp duty paid challan"];

function ReraModule({ deals }: { deals: Deal[] }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<ReraRow | null>(null);
  const [dealId, setDealId] = React.useState(deals[0]?.id ?? "D-118");
  const [done, setDone] = React.useState<Record<string, Set<string>>>({ "D-118": new Set(DOCS.slice(0, 4)), "D-115": new Set(DOCS.slice(0, 5)), "D-093": new Set([DOCS[0], DOCS[2], DOCS[3], DOCS[4]]) });
  const [ads, setAds] = React.useState([
    { id: "a1", label: "99acres · Sapphire Ville 2 BHK", sub: "RERA number missing in the description", done: false },
    { id: "a2", label: "Meta ad · Kesar Heights 'best price'", sub: "No RERA number on the creative", done: false },
    { id: "a3", label: "MagicBricks · Airport Edge villa", sub: "Shows old price; update to ₹6,100/sq ft", done: false },
    { id: "a4", label: "Housing.com · Trident 3 BHK", sub: "Add the extension order reference", done: true },
  ]);
  const deal = deals.find((d) => d.id === dealId) ?? deals[0];
  const have = done[deal.id] ?? new Set<string>();

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Projects verified" value={`${RERA_ROWS.filter((r) => r.status === "Verified").length} / ${RERA_ROWS.length}`} hint="checked on UP RERA today" icon={ShieldCheck} tone="ok" />
        <Stat label="Need attention" value={RERA_ROWS.filter((r) => r.status === "Risk" || r.status === "Check").length} hint="Trident, Sapphire" icon={AlertTriangle} tone="late" />
        <Stat label="Ads missing RERA no." value={ads.filter((a) => !a.done).length} hint="UP RERA can fine ₹50k+" icon={FileText} tone="warn" />
        <Stat label="Our agent licence" value={<Countdown compact inHours={86 * 24 + 7} />} hint="UPRERAAGT10457 · renew by 14 Jan" icon={BadgeCheck} />
      </div>
      <Panel title="Project registrations" sub="Every project we sell, checked against the UP RERA portal each morning">
        <DataTable
          rows={RERA_ROWS}
          rowKey={(r) => r.project}
          onRow={setOpen}
          filter={{ get: (r) => r.status, options: ["Verified", "Check", "Risk", "N/A"] }}
          columns={[
            { key: "p", label: "Project", render: (r) => <span className="font-medium">{projectOf(r.project).name}</span>, sort: (r) => projectOf(r.project).name },
            { key: "rera", label: "Registration", render: (r) => <span className="font-mono text-[11.5px]">{projectOf(r.project).rera}</span> },
            { key: "valid", label: "Valid till", render: (r) => <span className="text-[12.5px]">{r.validTill}</span>, wide: true },
            { key: "qpr", label: "Quarterly report", render: (r) => <Pill tone={r.qpr === "Filed Q2" ? "ok" : r.qpr === "Overdue Q2" ? "late" : r.qpr === "Due in 9 days" ? "warn" : "neutral"}>{r.qpr}</Pill> },
            { key: "esc", label: "Escrow", render: (r) => <span className="text-d-mute">{r.escrow}</span>, wide: true },
            { key: "c", label: "Complaints", align: "right", render: (r) => <span className="tnum font-mono" style={{ color: r.complaints > 2 ? "var(--d-late)" : undefined }}>{r.complaints}</span>, sort: (r) => r.complaints },
            { key: "st", label: "", render: (r) => <Pill tone={r.status === "Verified" ? "ok" : r.status === "Risk" ? "late" : r.status === "Check" ? "warn" : "neutral"}>{r.status}</Pill> },
          ]}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel
          icon={FileCheck2}
          title="Buyer document packet"
          sub={`${deal.buyer} · ${projectOf(deal.project).name} ${deal.unit}`}
          action={
            <select className={`${inputClass} h-8 w-auto text-[12.5px]`} value={deal.id} onChange={(e) => setDealId(e.target.value)}>
              {deals.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.id} · {d.buyer}
                </option>
              ))}
            </select>
          }
        >
          <div className="mb-3 flex items-center gap-3">
            <Meter value={have.size} max={DOCS.length} className="flex-1" tone={have.size === DOCS.length ? "ok" : "accent"} />
            <span className="tnum font-mono text-[12px]">
              {have.size}/{DOCS.length}
            </span>
          </div>
          <Checklist
            items={DOCS.map((d) => ({ id: d, label: d, sub: have.has(d) ? "Verified by Ritu" : undefined, done: have.has(d) }))}
            onToggle={(id) => {
              setDone((cur) => {
                const s = new Set(cur[deal.id] ?? []);
                if (s.has(id)) s.delete(id);
                else s.add(id);
                return { ...cur, [deal.id]: s };
              });
              desk.log(`${deal.buyer}: ${id} ${have.has(id) ? "unticked" : "received"}`);
            }}
          />
          <Btn size="sm" variant="soft" icon={MessageCircle} className="mt-3" onClick={() => { toast.success("Missing documents requested", { description: `${DOCS.length - have.size} items to ${deal.buyer} on WhatsApp` }); desk.log(`Docs requested from ${deal.buyer}`); }}>
            Ask buyer for the rest
          </Btn>
        </Panel>
        <Panel icon={ShieldCheck} title="Advertisement check" sub="Every listing and ad must carry the project's RERA number">
          <Checklist
            items={ads}
            onToggle={(id) => {
              setAds((cur) => cur.map((a) => (a.id === id ? { ...a, done: !a.done } : a)));
              const a = ads.find((x) => x.id === id);
              if (a && !a.done) {
                toast.success("Listing fixed", { description: a.label });
                desk.log(`Ad compliance fixed: ${a.label}`, "ok");
              }
            }}
          />
          <div className="mt-4 rounded-[12px] border border-d-line p-3 text-[12.5px]">
            <p className="font-semibold">Agent registration</p>
            <p className="mt-0.5 text-d-mute">Yamuna Realty · UPRERAAGT10457 · valid till 14 Jan 2027</p>
            <p className="mt-2 flex items-center gap-2">
              <Timer className="h-3.5 w-3.5 text-d-accent" /> Renewal window opens in 26 days. Fee ₹25,000 + GST.
            </p>
          </div>
        </Panel>
      </div>
      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={open ? projectOf(open.project).rera : ""}
        title={open ? projectOf(open.project).name : ""}
        sub={open ? `${projectOf(open.project).builder} · ${nodeOf(projectOf(open.project).node).name}` : ""}
        footer={
          <Btn variant="solid" icon={Send} onClick={() => { toast.success("RERA summary shared with sales", { description: "Everyone pitching this project got the note" }); desk.log(`RERA brief sent for ${open ? projectOf(open.project).name : ""}`); setOpen(null); }}>
            Brief the sales team
          </Btn>
        }
      >
        {open && (
          <div className="space-y-4">
            <KV items={[{ k: "Valid till", v: open.validTill }, { k: "Quarterly report", v: open.qpr }, { k: "Escrow", v: open.escrow }, { k: "Open complaints", v: open.complaints }, { k: "Possession", v: projectOf(open.project).possession }, { k: "Our brokerage", v: `${(projectOf(open.project).brokerage * 100).toFixed(1)}%` }]} />
            <ul className="space-y-1.5 text-[13px]">
              {["Registration certificate", "Approved layout and building plan", "Fire NOC", "Title search report", open.status === "Risk" ? "Extension order (Form E)" : "Quarterly progress report", "Occupancy or completion certificate"].map((d, i) => (
                <li key={d} className="flex items-center justify-between rounded-[10px] border border-d-line px-3 py-2">
                  {d}
                  <Pill tone={open.status === "Risk" && i === 4 ? "late" : open.status === "N/A" && i > 2 ? "neutral" : "ok"}>{open.status === "Risk" && i === 4 ? "Overdue" : open.status === "N/A" && i > 2 ? "N/A" : "On file"}</Pill>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Sheet>
    </div>
  );
}
