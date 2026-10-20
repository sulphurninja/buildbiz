"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  BatteryCharging,
  Bot,
  CalendarClock,
  CheckCheck,
  ClipboardList,
  CloudSun,
  Droplets,
  Factory,
  FileCheck,
  Gauge as GaugeIcon,
  Hammer,
  House,
  IndianRupee,
  Landmark,
  Leaf,
  MapPin,
  MessageCircle,
  Moon,
  Pause,
  Play,
  Plug,
  Plus,
  Receipt,
  Ruler,
  School,
  Send,
  SolarPanel,
  Sun,
  Ticket,
  Timer,
  Truck,
  Users,
  Warehouse,
  Wrench,
  Zap,
} from "lucide-react";
import { DeskShell, useDesk } from "../shell";
import { AreaChart, Bars, Donut, HBars } from "../charts";
import { AgingBar, ApprovalQueue, Board, Checklist, Countdown, DataTable, Gantt, type GanttRow } from "../data";
import { AgentsModule, ConnectionsModule, IndependenceModule, PeopleModule } from "../common";
import { Btn, Field, IconBtn, inputClass, inr, KV, Meter, Modal, num, Panel, Pill, Segmented, Sheet, Stat } from "../ui";
import { clockLabel, istParts, useDrift, useNow } from "../hooks";
import type { DeskConfig, DeskModule, IndependenceData, Integration, TeamMember, Tone, WorkforceAgent } from "../types";

/* ============================================================
   Data — Suryodaya Solar Systems, Jaipur. Fictional rooftop solar EPC.
   Residential (PM Surya Ghar), C&I rooftops and O&M across
   Jaipur, Ajmer and Kota. Today is Tue 20 Oct 2026.
   ============================================================ */

/** Jaipur, late October: sunrise ~6:27, sunset ~17:57 IST */
const RISE = 6.45;
const SET = 17.95;
const DAYLEN = SET - RISE;
/** kW per kWp at solar noon on a clear October day, before PR and losses */
const PEAK = 0.9;
const PEAK_WM2 = 905;
const SKEW = 0.57735; // tan 30°, for the tilted array

const r2 = (v: number) => Math.round(v * 100) / 100;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function irr(t: number) {
  if (t <= RISE || t >= SET) return 0;
  return Math.sin((Math.PI * (t - RISE)) / DAYLEN);
}
/** Integral of irr from sunrise to t, in hours */
function irrHours(t: number) {
  const tt = clamp(t, RISE, SET);
  return (DAYLEN / Math.PI) * (1 - Math.cos((Math.PI * (tt - RISE)) / DAYLEN));
}
function hhmm(t: number) {
  const h = Math.floor(t) % 24;
  const m = Math.floor((t - Math.floor(t)) * 60);
  const ap = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ap}`;
}
function hex(c: string) {
  const v = c.replace("#", "");
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}
function mix(a: string, b: string, k: number) {
  const A = hex(a);
  const B = hex(b);
  const kk = clamp(k, 0, 1);
  const c = A.map((x, i) => Math.round(x + (B[i] - x) * kk));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

type Issue = "soiling" | "trip" | "shade";
type PvString = { id: string; mods: number; perf: number; issue?: Issue; note?: string };
type Plant = {
  id: string;
  name: string;
  owner: string;
  place: string;
  city: "Jaipur" | "Ajmer" | "Kota";
  kind: "house" | "factory" | "school";
  seg: "Residential" | "C&I" | "School";
  kwp: number;
  modules: string;
  inverter: string;
  pr: number;
  discom: "JVVNL" | "AVVNL";
  commissioned: string;
  tariff: number;
  amc: string;
  rows: number;
  cols: number;
  strings: PvString[];
};

const plants: Plant[] = [
  {
    id: "SR-0412",
    name: "Sharma Residence",
    owner: "Pradeep Sharma",
    place: "Malviya Nagar, Jaipur",
    city: "Jaipur",
    kind: "house",
    seg: "Residential",
    kwp: 3.27,
    modules: "6 × Waaree 545 Wp bifacial DCR",
    inverter: "Growatt MIN 3000TL-X",
    pr: 0.81,
    discom: "JVVNL",
    commissioned: "14 Mar 2026",
    tariff: 7.95,
    amc: "Basic cleaning, 12 visits",
    rows: 2,
    cols: 3,
    strings: [{ id: "S1", mods: 6, perf: 99 }],
  },
  {
    id: "KV-0388",
    name: "Khandelwal Villa",
    owner: "Harish Khandelwal",
    place: "Vaishali Nagar, Jaipur",
    city: "Jaipur",
    kind: "house",
    seg: "Residential",
    kwp: 10.9,
    modules: "20 × Adani Shine 545 Wp DCR",
    inverter: "Sungrow SG10RT",
    pr: 0.8,
    discom: "JVVNL",
    commissioned: "2 Dec 2025",
    tariff: 7.95,
    amc: "Comprehensive, ₹1,100/kWp",
    rows: 2,
    cols: 10,
    strings: [
      { id: "S-A", mods: 10, perf: 98 },
      { id: "S-B", mods: 10, perf: 79, issue: "soiling", note: "Pigeon droppings + dust film, last wash 26 days ago" },
    ],
  },
  {
    id: "GP-0301",
    name: "Shree Ganesh Polymers",
    owner: "Sunil Agarwal",
    place: "VKI Area, Jaipur",
    city: "Jaipur",
    kind: "factory",
    seg: "C&I",
    kwp: 149.6,
    modules: "272 × Adani 550 Wp mono PERC",
    inverter: "2 × Solis S5-GC75K",
    pr: 0.79,
    discom: "JVVNL",
    commissioned: "18 Aug 2025",
    tariff: 9.4,
    amc: "Comprehensive, ₹950/kWp",
    rows: 4,
    cols: 16,
    strings: [
      { id: "S1", mods: 34, perf: 98 },
      { id: "S2", mods: 34, perf: 97 },
      { id: "S3", mods: 34, perf: 99 },
      { id: "S4", mods: 34, perf: 96 },
      { id: "S5", mods: 34, perf: 98 },
      { id: "S6", mods: 34, perf: 0, issue: "trip", note: "INV-2 MPPT-3 tripped on insulation fault at 10:52 AM" },
      { id: "S7", mods: 34, perf: 97 },
      { id: "S8", mods: 34, perf: 98 },
    ],
  },
  {
    id: "MS-0356",
    name: "Maheshwari Public School",
    owner: "Principal R. K. Maheshwari",
    place: "Vaishali Nagar, Ajmer",
    city: "Ajmer",
    kind: "school",
    seg: "School",
    kwp: 59.95,
    modules: "110 × Waaree 545 Wp mono PERC",
    inverter: "Solis S5-GC60K",
    pr: 0.78,
    discom: "AVVNL",
    commissioned: "9 Jan 2026",
    tariff: 8.65,
    amc: "Comprehensive, ₹1,000/kWp",
    rows: 4,
    cols: 12,
    strings: [
      { id: "S1", mods: 28, perf: 97 },
      { id: "S2", mods: 28, perf: 96 },
      { id: "S3", mods: 27, perf: 74, issue: "soiling", note: "Dust storm on Saturday; ticket T-877 assigned" },
      { id: "S4", mods: 27, perf: 97 },
    ],
  },
  {
    id: "PA-0329",
    name: "Pushkar Agro Cold Store",
    owner: "Gopal Rawat",
    place: "Pushkar Road, Ajmer",
    city: "Ajmer",
    kind: "factory",
    seg: "C&I",
    kwp: 80.3,
    modules: "146 × Adani 550 Wp mono PERC",
    inverter: "Sungrow SG80KTL-M",
    pr: 0.8,
    discom: "AVVNL",
    commissioned: "30 Sep 2025",
    tariff: 9.1,
    amc: "Comprehensive, ₹950/kWp",
    rows: 3,
    cols: 14,
    strings: [
      { id: "S1", mods: 25, perf: 98 },
      { id: "S2", mods: 25, perf: 97 },
      { id: "S3", mods: 24, perf: 98 },
      { id: "S4", mods: 24, perf: 97 },
      { id: "S5", mods: 24, perf: 83, issue: "soiling", note: "Fine sand from the Pushkar road works" },
      { id: "S6", mods: 24, perf: 98 },
    ],
  },
  {
    id: "VH-0372",
    name: "Vardhman Residency Hostel",
    owner: "Ashok Jain",
    place: "Landmark City, Kota",
    city: "Kota",
    kind: "school",
    seg: "C&I",
    kwp: 39.96,
    modules: "72 × Waaree 555 Wp mono PERC",
    inverter: "Solis S5-GC40K",
    pr: 0.79,
    discom: "JVVNL",
    commissioned: "21 Nov 2025",
    tariff: 9.4,
    amc: "Basic cleaning, 24 visits",
    rows: 3,
    cols: 12,
    strings: [
      { id: "S1", mods: 24, perf: 97 },
      { id: "S2", mods: 24, perf: 86, issue: "shade", note: "New 2,000 L water tank shades 6 modules till 11 AM" },
      { id: "S3", mods: 24, perf: 98 },
    ],
  },
  {
    id: "AR-0419",
    name: "Agarwal Residence",
    owner: "Sunita Agarwal",
    place: "Talwandi, Kota",
    city: "Kota",
    kind: "house",
    seg: "Residential",
    kwp: 5.45,
    modules: "10 × Waaree 545 Wp bifacial DCR",
    inverter: "Growatt MIN 5000TL-X",
    pr: 0.82,
    discom: "JVVNL",
    commissioned: "6 Apr 2026",
    tariff: 7.95,
    amc: "Basic cleaning, 12 visits",
    rows: 2,
    cols: 5,
    strings: [{ id: "S1", mods: 10, perf: 99 }],
  },
  {
    id: "JT-0290",
    name: "Jain Textile Processors",
    owner: "Manish Jain",
    place: "Sanganer, Jaipur",
    city: "Jaipur",
    kind: "factory",
    seg: "C&I",
    kwp: 250.25,
    modules: "455 × Adani 550 Wp mono PERC",
    inverter: "2 × Sungrow SG110CX",
    pr: 0.78,
    discom: "JVVNL",
    commissioned: "4 Jun 2025",
    tariff: 9.4,
    amc: "Comprehensive, ₹900/kWp",
    rows: 5,
    cols: 18,
    strings: [
      { id: "S1", mods: 46, perf: 97 },
      { id: "S2", mods: 46, perf: 98 },
      { id: "S3", mods: 46, perf: 96 },
      { id: "S4", mods: 46, perf: 76, issue: "soiling", note: "Stenter exhaust soot on the east bay" },
      { id: "S5", mods: 46, perf: 97 },
      { id: "S6", mods: 45, perf: 98 },
      { id: "S7", mods: 45, perf: 97 },
      { id: "S8", mods: 45, perf: 96 },
      { id: "S9", mods: 45, perf: 98 },
      { id: "S10", mods: 45, perf: 97 },
    ],
  },
];
const FLEET_KWP = plants.reduce((a, p) => a + p.kwp, 0);

function health(p: Plant) {
  const total = p.strings.reduce((a, s) => a + s.mods, 0);
  return p.strings.reduce((a, s) => a + s.mods * s.perf, 0) / total / 100;
}
function liveKw(p: Plant, t: number) {
  return p.kwp * PEAK * irr(t) * p.pr * health(p);
}
function expectedKw(p: Plant, t: number) {
  return p.kwp * PEAK * irr(t) * p.pr;
}
function kwhSoFar(p: Plant, t: number) {
  return p.kwp * PEAK * p.pr * health(p) * irrHours(t);
}
function issueLabel(i: Issue) {
  return i === "soiling" ? "Soiling" : i === "trip" ? "Inverter trip" : "Shading";
}

/* ---------------- Tickets ---------------- */

type TicketStatus = "Open" | "Assigned" | "On site" | "Resolved";
type OmTicket = { id: string; plant: string; string?: string; kind: string; detail: string; raised: string; status: TicketStatus; tech: string; priority: "High" | "Medium" | "Low"; loss: number };
const seedTickets: OmTicket[] = [
  { id: "T-879", plant: "KV-0388", string: "S-B", kind: "Soiling", detail: "String B 21% under expected; schedule wet wash with soft brush", raised: "18 Oct", status: "Assigned", tech: "Manoj Kumawat", priority: "Medium", loss: 9 },
  { id: "T-877", plant: "MS-0356", string: "S3", kind: "Soiling", detail: "Post dust storm. School wants cleaning before 7 AM assembly", raised: "18 Oct", status: "Assigned", tech: "Dinesh Bairwa", priority: "Medium", loss: 41 },
  { id: "T-875", plant: "VH-0372", string: "S2", kind: "Shading", detail: "Customer added water tank. Shift 6 modules to the west parapet", raised: "16 Oct", status: "On site", tech: "Bablu Meghwal", priority: "Low", loss: 18 },
  { id: "T-872", plant: "JT-0290", kind: "Earth fault", detail: "INV-1 earth fault alarm; LA earth pit resistance 6.8 Ω, re-treated", raised: "14 Oct", status: "Resolved", tech: "Manoj Kumawat", priority: "High", loss: 0 },
  { id: "T-870", plant: "SR-0412", kind: "Net meter", detail: "Export register not incrementing. JVVNL meter tester requested", raised: "13 Oct", status: "Open", tech: "Kavita Rathore", priority: "Medium", loss: 0 },
  { id: "T-868", plant: "PA-0329", kind: "Monitoring", detail: "Wi-Fi dongle offline after router change; re-paired on site", raised: "11 Oct", status: "Resolved", tech: "Dinesh Bairwa", priority: "Low", loss: 0 },
];

/* ---------------- Leads ---------------- */

const LEAD_STAGES = [
  { id: "lead", label: "New lead", tone: "neutral" as Tone, hint: "Call within 2 hours" },
  { id: "survey", label: "Site survey", tone: "info" as Tone, hint: "Roof, load, shadow" },
  { id: "design", label: "Design", tone: "accent" as Tone, hint: "Layout + yield sim" },
  { id: "quote", label: "Quote sent", tone: "warn" as Tone, hint: "Follow up day 2, 5" },
  { id: "booked", label: "Booked", tone: "ok" as Tone, hint: "Advance received" },
];
type LeadStage = "lead" | "survey" | "design" | "quote" | "booked";
type Lead = {
  id: string;
  name: string;
  place: string;
  city: "Jaipur" | "Ajmer" | "Kota";
  seg: "Residential" | "C&I" | "School";
  roof: number;
  roofType: string;
  load: number;
  kwp: number;
  shadow: string;
  source: string;
  stage: LeadStage;
  owner: string;
  age: string;
};
const rateFor = (seg: Lead["seg"]) => (seg === "Residential" ? 58000 : seg === "School" ? 42000 : 40000);
function cfa(kw: number) {
  return Math.round(Math.min(2, kw) * 30000 + clamp(kw - 2, 0, 1) * 18000);
}

const seedLeads: Lead[] = [
  { id: "L-2291", name: "Ritu & Sanjay Bansal", place: "Mansarovar, Jaipur", city: "Jaipur", seg: "Residential", roof: 850, roofType: "RCC flat", load: 5, kwp: 4.36, shadow: "Neighbour's 3rd floor shades SE corner till 9:30 AM", source: "PM Surya Ghar portal", stage: "lead", owner: "Pooja", age: "40 min" },
  { id: "L-2294", name: "Col. (retd) Hemant Rathore", place: "C-Scheme, Jaipur", city: "Jaipur", seg: "Residential", roof: 1400, roofType: "RCC flat", load: 10, kwp: 8.72, shadow: "Clear south face; mumty and tank on the north side", source: "Referral", stage: "lead", owner: "Pooja", age: "3 h" },
  { id: "L-2298", name: "Pareek Residence", place: "Jagatpura, Jaipur", city: "Jaipur", seg: "Residential", roof: 950, roofType: "RCC flat", load: 5, kwp: 5.45, shadow: "Terrace garden on half the roof; elevated structure needed", source: "Instagram", stage: "lead", owner: "Pooja", age: "1 d" },
  { id: "L-2299", name: "Vidya Niketan Sr. Sec. School", place: "Adarsh Nagar, Ajmer", city: "Ajmer", seg: "School", roof: 5200, roofType: "RCC flat", load: 40, kwp: 35, shadow: "Monkeys on campus; needs mesh guard under array", source: "Referral", stage: "lead", owner: "Arjun", age: "1 d" },
  { id: "L-2296", name: "Mehta Marbles", place: "Kishangarh, Ajmer", city: "Ajmer", seg: "C&I", roof: 9200, roofType: "Tin shed", load: 120, kwp: 99, shadow: "Old purlins need check; heavy marble dust, plan fortnightly wash", source: "IndiaMART", stage: "survey", owner: "Arjun", age: "2 d" },
  { id: "L-2288", name: "Suman Kanwar", place: "Vaishali Nagar, Jaipur", city: "Jaipur", seg: "Residential", roof: 600, roofType: "RCC flat", load: 3, kwp: 3.27, shadow: "Mango tree on the west, trim before install", source: "PM Surya Ghar portal", stage: "survey", owner: "Pooja", age: "3 d" },
  { id: "L-2283", name: "Shiksha Sadan Sr. Sec. School", place: "Kunhadi, Kota", city: "Kota", seg: "School", roof: 6800, roofType: "RCC, two levels", load: 60, kwp: 50, shadow: "Stair cabin shadow on lower level after 3 PM", source: "Google search", stage: "design", owner: "Arjun", age: "5 d" },
  { id: "L-2279", name: "Naresh Gupta", place: "Mahaveer Nagar, Kota", city: "Kota", seg: "Residential", roof: 900, roofType: "RCC flat", load: 5, kwp: 5.45, shadow: "Clear; DISCOM pole 40 m away", source: "PM Surya Ghar portal", stage: "design", owner: "Pooja", age: "4 d" },
  { id: "L-2275", name: "Sanganer Block Prints Pvt Ltd", place: "Sitapura, Jaipur", city: "Jaipur", seg: "C&I", roof: 14000, roofType: "RCC + tin mix", load: 180, kwp: 150, shadow: "Boiler chimney soot on the east bay", source: "Referral", stage: "quote", owner: "Arjun", age: "8 d" },
  { id: "L-2272", name: "Dr. Anita Joshi", place: "Shastri Nagar, Ajmer", city: "Ajmer", seg: "Residential", roof: 1100, roofType: "RCC flat", load: 7, kwp: 6.54, shadow: "Two dish antennas to relocate", source: "PM Surya Ghar portal", stage: "quote", owner: "Pooja", age: "6 d" },
  { id: "L-2270", name: "Lokesh Kumawat", place: "Jhotwara, Jaipur", city: "Jaipur", seg: "Residential", roof: 700, roofType: "RCC flat", load: 4, kwp: 3.27, shadow: "Clear", source: "PM Surya Ghar portal", stage: "quote", owner: "Pooja", age: "5 d" },
  { id: "L-2266", name: "Hotel Sarovar Haveli", place: "Pushkar, Ajmer", city: "Ajmer", seg: "C&I", roof: 3200, roofType: "RCC heritage", load: 45, kwp: 30, shadow: "Heritage facade; array must stay below parapet", source: "Google search", stage: "quote", owner: "Arjun", age: "11 d" },
  { id: "L-2261", name: "Om Prakash Yadav", place: "Nandpuri, Jaipur", city: "Jaipur", seg: "Residential", roof: 750, roofType: "RCC flat", load: 3, kwp: 3.27, shadow: "Clear", source: "PM Surya Ghar portal", stage: "booked", owner: "Pooja", age: "12 d" },
  { id: "L-2258", name: "Bhandari Cold Chain", place: "RIICO Indl. Area, Kota", city: "Kota", seg: "C&I", roof: 11000, roofType: "Tin shed", load: 150, kwp: 120, shadow: "Clear; north wall ventilators", source: "IndiaMART", stage: "booked", owner: "Arjun", age: "15 d" },
];

/* ---------------- Subsidy (PM Surya Ghar) ---------------- */

const PMSG = ["Registered", "DISCOM feasibility", "Installed", "Inspection", "Net meter", "Subsidy redeemed", "CFA credited"] as const;
type SubsidyApp = { id: string; customer: string; city: "Jaipur" | "Ajmer" | "Kota"; discom: "JVVNL" | "AVVNL"; office: string; kw: number; stage: number; days: number; funding: string; adjusted: boolean };
const seedApps: SubsidyApp[] = [
  { id: "RJ-JP-24811", customer: "Ritu Bansal", city: "Jaipur", discom: "JVVNL", office: "AEn Mansarovar", kw: 4.36, stage: 0, days: 1, funding: "Cash", adjusted: false },
  { id: "RJ-JP-24790", customer: "Lokesh Kumawat", city: "Jaipur", discom: "JVVNL", office: "AEn Jhotwara", kw: 3.27, stage: 0, days: 2, funding: "SBI Surya Ghar loan", adjusted: true },
  { id: "RJ-JP-24702", customer: "Suman Kanwar", city: "Jaipur", discom: "JVVNL", office: "AEn Vaishali Nagar", kw: 3.27, stage: 1, days: 6, funding: "Cash", adjusted: true },
  { id: "RJ-AJ-11384", customer: "Dr. Anita Joshi", city: "Ajmer", discom: "AVVNL", office: "AEn Shastri Nagar", kw: 6.54, stage: 1, days: 9, funding: "Cash", adjusted: false },
  { id: "RJ-JP-24655", customer: "Mahesh Yadav", city: "Jaipur", discom: "JVVNL", office: "AEn Sanganer", kw: 3.27, stage: 2, days: 3, funding: "BoB loan", adjusted: true },
  { id: "RJ-KT-08821", customer: "Naresh Gupta", city: "Kota", discom: "JVVNL", office: "AEn Mahaveer Nagar", kw: 5.45, stage: 3, days: 5, funding: "Cash", adjusted: false },
  { id: "RJ-AJ-11290", customer: "Kamla Devi Saini", city: "Ajmer", discom: "AVVNL", office: "AEn Ramganj", kw: 2.18, stage: 4, days: 11, funding: "SBI Surya Ghar loan", adjusted: true },
  { id: "RJ-AJ-11277", customer: "Farida Begum", city: "Ajmer", discom: "AVVNL", office: "AEn Dargah Bazar", kw: 3.27, stage: 4, days: 7, funding: "Cash", adjusted: true },
  { id: "RJ-KT-08790", customer: "Vinod Meena", city: "Kota", discom: "JVVNL", office: "AEn Talwandi", kw: 4.36, stage: 5, days: 26, funding: "SBI Surya Ghar loan", adjusted: true },
  { id: "RJ-KT-08712", customer: "Sunita Agarwal", city: "Kota", discom: "JVVNL", office: "AEn Talwandi", kw: 5.45, stage: 5, days: 18, funding: "Cash", adjusted: true },
  { id: "RJ-JP-24310", customer: "Pradeep Sharma", city: "Jaipur", discom: "JVVNL", office: "AEn Malviya Nagar", kw: 3.27, stage: 6, days: 0, funding: "Cash", adjusted: true },
  { id: "RJ-JP-23977", customer: "Harish Khandelwal", city: "Jaipur", discom: "JVVNL", office: "AEn Vaishali Nagar", kw: 10.9, stage: 6, days: 0, funding: "Cash", adjusted: false },
];
/** Days each portal stage should take before we chase */
const STAGE_SLA = [2, 7, 3, 5, 10, 30, 0];

const DOCS = [
  { id: "aadhaar", label: "Aadhaar of the consumer", sub: "Name must match the electricity bill" },
  { id: "bill", label: "Latest electricity bill", sub: "K-number and sanctioned load visible" },
  { id: "bank", label: "Cancelled cheque / passbook", sub: "CFA goes to this account" },
  { id: "photo", label: "Geo-tagged roof photo", sub: "Before install, from the portal app" },
  { id: "dcr", label: "DCR certificate for modules", sub: "Serial numbers of every module" },
  { id: "inv", label: "Inverter test certificate", sub: "IEC 61727 / BIS" },
  { id: "agreement", label: "Net-metering agreement", sub: "Signed on ₹100 stamp paper" },
  { id: "comm", label: "Commissioning report", sub: "Signed by our engineer" },
  { id: "selfie", label: "Consumer photo with plant", sub: "Uploaded on the portal for inspection" },
];
function docsFor(stage: number) {
  const n = [3, 4, 6, 7, 8, 9, 9][stage] ?? 3;
  return new Set(DOCS.slice(0, n).map((d) => d.id));
}

/* ---------------- Projects & crews ---------------- */

const PHASES = ["Material", "Structure", "Modules", "Wiring", "Commission"] as const;
type Project = { id: string; name: string; place: string; kwp: number; crew: string; plan: [number, number][]; done: number; lateAt?: number; value: number };
/** day 0 = 13 Oct, today = 7 (20 Oct) */
const PTODAY = 7;
const seedProjects: Project[] = [
  { id: "P-611", name: "Mahesh Yadav residence", place: "Sanganer, Jaipur", kwp: 3.27, crew: "A", plan: [[2, 3], [4, 5], [5, 6], [6, 7], [7, 8]], done: 4, value: 189000 },
  { id: "P-612", name: "Bhandari Cold Chain", place: "RIICO, Kota", kwp: 120, crew: "C", plan: [[0, 3], [3, 9], [9, 14], [13, 17], [17, 19]], done: 1, lateAt: 1, value: 4800000 },
  { id: "P-613", name: "Om Prakash Yadav residence", place: "Nandpuri, Jaipur", kwp: 3.27, crew: "A", plan: [[6, 7], [8, 9], [9, 10], [10, 11], [11, 12]], done: 1, value: 189000 },
  { id: "P-614", name: "Adarsh Vidya Mandir", place: "Ajmer", kwp: 45, crew: "B", plan: [[3, 5], [5, 9], [9, 12], [11, 14], [14, 15]], done: 1, lateAt: 1, value: 1890000 },
  { id: "P-615", name: "Rekha Choudhary residence", place: "Malviya Nagar, Jaipur", kwp: 4.36, crew: "A", plan: [[9, 10], [12, 13], [13, 14], [14, 15], [15, 16]], done: 0, value: 252000 },
  { id: "P-616", name: "Hada residence", place: "Talwandi, Kota", kwp: 5.45, crew: "D", plan: [[4, 5], [5, 6], [6, 7], [7, 8], [8, 9]], done: 3, value: 316000 },
  { id: "P-617", name: "Rathi Steel Fabricators", place: "VKI Area, Jaipur", kwp: 100, crew: "C", plan: [[14, 16], [19, 24], [24, 28], [27, 31], [31, 33]], done: 0, value: 3900000 },
  { id: "P-618", name: "Tiwari residence", place: "Vaishali Nagar, Ajmer", kwp: 3.27, crew: "B", plan: [[1, 2], [2, 3], [3, 4], [5, 6], [6, 7]], done: 4, lateAt: 4, value: 189000 },
];
function dayLabel(d: number) {
  const day = 13 + Math.round(d);
  return day <= 31 ? `${day} Oct` : `${day - 31} Nov`;
}
const crews = [
  { id: "A", lead: "Ramesh Gurjar", size: 4, van: "Tata Ace RJ14 GD 4471", base: "Jaipur", skill: "Residential, 2 roofs a day" },
  { id: "B", lead: "Shankar Lal Jat", size: 5, van: "Bolero Pickup RJ01 GB 2290", base: "Ajmer", skill: "Residential + school" },
  { id: "C", lead: "Imran Qureshi", size: 8, van: "Eicher Pro RJ14 GK 8812", base: "Jaipur / Kota", skill: "C&I, tin-shed structures" },
  { id: "D", lead: "Bablu Meghwal", size: 4, van: "Tata Ace RJ20 CF 3365", base: "Kota", skill: "Residential + O&M" },
];

type Dispatch = { id: string; project: string; items: string; vehicle: string; status: "Packed" | "Loaded" | "In transit" | "On site" };
const DISPATCH_FLOW: Dispatch["status"][] = ["Packed", "Loaded", "In transit", "On site"];
const seedDispatch: Dispatch[] = [
  { id: "DS-1042", project: "P-613 Om Prakash Yadav", items: "6 × Waaree 545W DCR · Growatt 3kW · 3 kW GI kit · ACDB + DCDB · 30 m DC cable", vehicle: "RJ14 GD 4471", status: "Packed" },
  { id: "DS-1041", project: "P-612 Bhandari Cold Chain", items: "Lot 2 of 4: 64 × Adani 550W · 1.2 t GI purlins · 400 m DC cable", vehicle: "RJ14 GK 8812", status: "In transit" },
  { id: "DS-1040", project: "P-614 Adarsh Vidya Mandir", items: "Structure only: 45 kW HDG kit, anchor fasteners, walkway", vehicle: "RJ01 GB 2290", status: "On site" },
  { id: "DS-1039", project: "P-616 Hada residence", items: "Lightning arrester · 3 earthing kits · net-meter box", vehicle: "RJ20 CF 3365", status: "On site" },
  { id: "DS-1043", project: "P-615 Rekha Choudhary", items: "8 × Waaree 545W DCR · Growatt 5kW · 4 kW GI kit · ACDB + DCDB", vehicle: "Not assigned", status: "Packed" },
];

type Sku = { sku: string; item: string; cat: "Modules" | "Inverters" | "BOS" | "Structure"; stock: number; reserved: number; reorder: number; unit: string; rate: number; vendor: string };
const skus: Sku[] = [
  { sku: "MOD-W545D", item: "Waaree 545 Wp bifacial DCR", cat: "Modules", stock: 184, reserved: 96, reorder: 120, unit: "pcs", rate: 12800, vendor: "Shree Shyam Solar, Sitapura" },
  { sku: "MOD-A550", item: "Adani Shine 550 Wp mono PERC", cat: "Modules", stock: 610, reserved: 520, reorder: 300, unit: "pcs", rate: 8900, vendor: "Adani Solar channel, Jaipur" },
  { sku: "MOD-V580T", item: "Vikram 580 Wp TOPCon DCR", cat: "Modules", stock: 40, reserved: 78, reorder: 60, unit: "pcs", rate: 14400, vendor: "Marudhar Energy, Jodhpur" },
  { sku: "INV-GW3", item: "Growatt MIN 3000TL-X, 3 kW", cat: "Inverters", stock: 9, reserved: 6, reorder: 6, unit: "pcs", rate: 27500, vendor: "Rajputana Power Electronics" },
  { sku: "INV-GW5", item: "Growatt MIN 5000TL-X, 5 kW", cat: "Inverters", stock: 4, reserved: 5, reorder: 4, unit: "pcs", rate: 38500, vendor: "Rajputana Power Electronics" },
  { sku: "INV-SG10", item: "Sungrow SG10RT, 10 kW", cat: "Inverters", stock: 3, reserved: 1, reorder: 2, unit: "pcs", rate: 92000, vendor: "Sungrow distributor, Jaipur" },
  { sku: "INV-SL50", item: "Solis S5-GC50K, 50 kW", cat: "Inverters", stock: 1, reserved: 1, reorder: 1, unit: "pcs", rate: 248000, vendor: "Solis channel partner" },
  { sku: "INV-SG110", item: "Sungrow SG110CX, 110 kW", cat: "Inverters", stock: 1, reserved: 1, reorder: 1, unit: "pcs", rate: 412000, vendor: "Sungrow distributor, Jaipur" },
  { sku: "BOS-ACDB1", item: "ACDB single-phase, 32 A MCB + SPD", cat: "BOS", stock: 22, reserved: 8, reorder: 10, unit: "pcs", rate: 3200, vendor: "Jaipur Switchgear" },
  { sku: "BOS-DCDB2", item: "DCDB 2-in 2-out, fuse + SPD", cat: "BOS", stock: 14, reserved: 9, reorder: 10, unit: "pcs", rate: 4100, vendor: "Jaipur Switchgear" },
  { sku: "BOS-DC4", item: "DC cable 4 sq mm, solar grade", cat: "BOS", stock: 2400, reserved: 1800, reorder: 2000, unit: "m", rate: 62, vendor: "Polycab dealer, MI Road" },
  { sku: "BOS-EARTH", item: "Earthing kit + lightning arrester", cat: "BOS", stock: 16, reserved: 10, reorder: 12, unit: "sets", rate: 5400, vendor: "Jaipur Switchgear" },
  { sku: "STR-GI3", item: "HDG elevated structure kit, 3 kW", cat: "Structure", stock: 11, reserved: 7, reorder: 8, unit: "kits", rate: 14500, vendor: "Kanak Fabricators, VKI" },
  { sku: "STR-GI5", item: "HDG elevated structure kit, 5 kW", cat: "Structure", stock: 3, reserved: 4, reorder: 4, unit: "kits", rate: 22000, vendor: "Kanak Fabricators, VKI" },
];
const purchaseOrders = [
  { id: "PO-3318", title: "PO-3318 · 120 × Waaree 545 Wp DCR", sub: "Shree Shyam Solar, Sitapura · ₹23.5/Wp · covers 14 residential bookings", amount: 1536900, meta: "Modules" },
  { id: "PO-3320", title: "PO-3320 · 80 × Vikram 580 Wp TOPCon DCR", sub: "Marudhar Energy, Jodhpur · Adarsh Vidya Mandir is short 38", amount: 1152000, meta: "Urgent" },
  { id: "PO-3319", title: "PO-3319 · 6 × Growatt 5 kW inverters", sub: "Rajputana Power Electronics · lowest of 3 quotes", amount: 231000, meta: "Inverters" },
  { id: "PO-3321", title: "PO-3321 · 3,000 m DC cable 4 sq mm", sub: "Polycab dealer, MI Road · ₹62/m", amount: 186000, meta: "BOS" },
];

/* ---------------- O&M ---------------- */

const DAYS = ["Mon 19", "Tue 20", "Wed 21", "Thu 22", "Fri 23", "Sat 24"];
type Clean = "done" | "due" | "missed" | "none";
const seedCleaning: Record<string, Clean[]> = {
  "SR-0412": ["none", "none", "due", "none", "none", "none"],
  "KV-0388": ["missed", "due", "none", "none", "none", "none"],
  "GP-0301": ["done", "none", "none", "due", "none", "none"],
  "MS-0356": ["none", "due", "none", "none", "none", "due"],
  "PA-0329": ["done", "none", "none", "none", "due", "none"],
  "VH-0372": ["none", "done", "none", "none", "none", "due"],
  "AR-0419": ["none", "none", "none", "due", "none", "none"],
  "JT-0290": ["done", "due", "none", "due", "none", "due"],
};
const amcs = [
  { plant: "JT-0290", plan: "Comprehensive, ₹900/kWp", value: 225200, inDays: 12, status: "Quote sent" },
  { plant: "GP-0301", plan: "Comprehensive, ₹950/kWp", value: 142100, inDays: 27, status: "Due" },
  { plant: "PA-0329", plan: "Comprehensive, ₹950/kWp", value: 76300, inDays: 34, status: "Due" },
  { plant: "KV-0388", plan: "Comprehensive, ₹1,100/kWp", value: 12000, inDays: 43, status: "Due" },
  { plant: "VH-0372", plan: "Basic cleaning, 24 visits", value: 28800, inDays: 6, status: "Negotiating" },
  { plant: "MS-0356", plan: "Comprehensive, ₹1,000/kWp", value: 59950, inDays: 81, status: "Auto-renew" },
];
/** last 30 days, % of expected (weather-corrected) */
const monthPerf: Record<string, number> = { "SR-0412": 98, "KV-0388": 88, "GP-0301": 91, "MS-0356": 87, "PA-0329": 94, "VH-0372": 92, "AR-0419": 99, "JT-0290": 89 };

/* ---------------- Payments ---------------- */

type MsState = "received" | "due" | "overdue" | "upcoming";
type Account = { id: string; customer: string; project: string; value: number; funding: string; ms: { label: string; pct: number; state: MsState; date: string }[]; cfa?: number };
const seedAccounts: Account[] = [
  { id: "P-611", customer: "Mahesh Yadav", project: "3.27 kWp, Sanganer", value: 189000, funding: "BoB loan", cfa: 78000, ms: [{ label: "Advance", pct: 30, state: "received", date: "10 Oct" }, { label: "On delivery", pct: 60, state: "due", date: "18 Oct" }, { label: "On commissioning", pct: 10, state: "upcoming", date: "21 Oct" }] },
  { id: "P-612", customer: "Bhandari Cold Chain", project: "120 kWp, RIICO Kota", value: 4800000, funding: "Capex", ms: [{ label: "Advance", pct: 30, state: "received", date: "5 Oct" }, { label: "On delivery", pct: 60, state: "upcoming", date: "28 Oct" }, { label: "On commissioning", pct: 10, state: "upcoming", date: "1 Nov" }] },
  { id: "P-614", customer: "Adarsh Vidya Mandir", project: "45 kWp, Ajmer", value: 1890000, funding: "Trust capex", ms: [{ label: "Advance", pct: 30, state: "received", date: "8 Oct" }, { label: "On delivery", pct: 60, state: "overdue", date: "15 Oct" }, { label: "On commissioning", pct: 10, state: "upcoming", date: "28 Oct" }] },
  { id: "P-616", customer: "Hada residence", project: "5.45 kWp, Talwandi Kota", value: 316000, funding: "Cash", cfa: 78000, ms: [{ label: "Advance", pct: 30, state: "received", date: "12 Oct" }, { label: "On delivery", pct: 60, state: "received", date: "17 Oct" }, { label: "On commissioning", pct: 10, state: "due", date: "21 Oct" }] },
  { id: "P-618", customer: "Tiwari residence", project: "3.27 kWp, Ajmer", value: 189000, funding: "SBI Surya Ghar loan", cfa: 78000, ms: [{ label: "Advance", pct: 30, state: "received", date: "9 Oct" }, { label: "On delivery", pct: 60, state: "received", date: "15 Oct" }, { label: "On commissioning", pct: 10, state: "overdue", date: "19 Oct" }] },
  { id: "P-598", customer: "Kamla Devi Saini", project: "2.18 kWp, Ramganj Ajmer", value: 132000, funding: "SBI Surya Ghar loan", cfa: 60000, ms: [{ label: "Advance", pct: 30, state: "received", date: "4 Sep" }, { label: "On delivery", pct: 60, state: "received", date: "12 Sep" }, { label: "On commissioning", pct: 10, state: "overdue", date: "25 Sep" }] },
  { id: "P-601", customer: "Farida Begum", project: "3.27 kWp, Dargah Bazar Ajmer", value: 189000, funding: "Cash", cfa: 78000, ms: [{ label: "Advance", pct: 30, state: "received", date: "11 Sep" }, { label: "On delivery", pct: 60, state: "received", date: "19 Sep" }, { label: "On commissioning", pct: 10, state: "received", date: "30 Sep" }] },
  { id: "P-587", customer: "Vinod Meena", project: "4.36 kWp, Talwandi Kota", value: 252000, funding: "SBI Surya Ghar loan", cfa: 78000, ms: [{ label: "Advance", pct: 30, state: "received", date: "18 Aug" }, { label: "On delivery", pct: 60, state: "received", date: "27 Aug" }, { label: "On commissioning", pct: 10, state: "received", date: "6 Sep" }] },
  { id: "P-582", customer: "Sunita Agarwal", project: "5.45 kWp, Talwandi Kota", value: 316000, funding: "Cash", cfa: 78000, ms: [{ label: "Advance", pct: 30, state: "received", date: "2 Mar" }, { label: "On delivery", pct: 60, state: "received", date: "18 Mar" }, { label: "On commissioning", pct: 10, state: "received", date: "6 Apr" }] },
  { id: "P-575", customer: "Shree Ganesh Polymers", project: "149.6 kWp, VKI Jaipur", value: 5980000, funding: "Capex + SIDBI", ms: [{ label: "Advance", pct: 30, state: "received", date: "2 Jul" }, { label: "On delivery", pct: 60, state: "received", date: "28 Jul" }, { label: "On commissioning", pct: 10, state: "overdue", date: "25 Aug" }] },
];
const msDue = (a: Account) => a.ms.filter((m) => m.state === "due" || m.state === "overdue").reduce((s, m) => s + (a.value * m.pct) / 100, 0);

/* ---------------- People, agents, independence, connections ---------------- */

const team: TeamMember[] = [
  { name: "Devendra Choudhary", role: "Founder", status: "Busy", load: 92, focus: "Sanganer Block Prints 150 kWp quote and 4 POs to sign", tasks: [{ title: "Approve PO-3320 TOPCon modules", due: "1:00" }, { title: "Sanganer Block Prints price call", due: "3:00" }, { title: "JVVNL SE meeting on net-meter backlog", due: "Thu" }], week: [1, 1, 1, 1, 1, 1], since: "2016" },
  { name: "Pooja Sharma", role: "Residential sales", status: "In field", load: 84, focus: "3 site surveys in Mansarovar and Jhotwara", tasks: [{ title: "Survey: Bansal, Mansarovar", due: "10:00", done: true }, { title: "Call back Col. Rathore", due: "12:30" }, { title: "Follow up Lokesh Kumawat quote", due: "4:00" }], week: [1, 1, 1, 1, 1, 0], since: "2021" },
  { name: "Arjun Meena", role: "C&I sales + design engineer", status: "Busy", load: 88, focus: "PVsyst run for Shiksha Sadan, two roof levels", tasks: [{ title: "Shiksha Sadan layout v2", due: "2:00" }, { title: "Mehta Marbles purlin check", due: "Wed" }], week: [1, 1, 1, 1, 1, 1], since: "2020" },
  { name: "Kavita Rathore", role: "Subsidy + DISCOM liaison", status: "In field", load: 79, focus: "At AVVNL Ajmer for 2 pending net meters", tasks: [{ title: "Kamla Devi net meter, AEn Ramganj", due: "11:30" }, { title: "Upload Naresh Gupta inspection docs", due: "3:00" }, { title: "Redeem subsidy for 2 Kota files", due: "5:00" }], week: [1, 1, 1, 1, 1, 1], since: "2022" },
  { name: "Ramesh Gurjar", role: "Install head, Crew A", status: "On floor", load: 90, focus: "Wiring at Mahesh Yadav, Sanganer", tasks: [{ title: "DC wiring + earthing, P-611", due: "1:00" }, { title: "Load DS-1042 for tomorrow", due: "6:00" }], week: [1, 1, 1, 1, 1, 1], since: "2017" },
  { name: "Imran Qureshi", role: "C&I crew lead, Crew C", status: "In field", load: 86, focus: "Bhandari Cold Chain purlin work, 2 days behind", tasks: [{ title: "Purlin bolting bay 3–4", due: "today" }, { title: "Saturday overtime roster", due: "5:00" }], week: [1, 1, 1, 1, 1, 1], since: "2019" },
  { name: "Salim Khan", role: "Stores + dispatch", status: "On floor", load: 64, focus: "Packing DS-1042, counting TOPCon stock", tasks: [{ title: "GRN for Polycab cable", due: "12:00", done: true }, { title: "Pack DS-1043 for Rekha Choudhary", due: "Thu" }], week: [1, 1, 1, 1, 1, 1], since: "2018" },
  { name: "Manoj Kumawat", role: "O&M lead technician", status: "In field", load: 72, focus: "Wash at Khandelwal Villa, then Ganesh Polymers INV-2", tasks: [{ title: "T-879 wet wash, string B", due: "11:00" }, { title: "IR test INV-2 MPPT-3", due: "2:30" }], week: [1, 1, 1, 0, 1, 1], since: "2019" },
];

const agents: WorkforceAgent[] = [
  { name: "Yield Watcher", role: "Compares every string to clear-sky expected, every 15 minutes", icon: Sun, status: "Needs you", runsToday: 22, hoursSaved: 4, accuracy: 95, last: "2 min ago", skills: ["iSolarCloud", "SolisCloud", "ShinePhone", "Weather"], schedule: "Every 15 min, sunrise to sunset", inbox: [{ title: "Raise ticket for Ganesh Polymers S6?", detail: "INV-2 MPPT-3 tripped at 10:52 on insulation fault. Losing about 13 kW at noon. Manoj is 6 km away." }], log: ["Flagged Jain Textile S4 at 76%: soot on the east bay", "Khandelwal S-B still 21% low after T-879", "Fleet PR 0.79, 1 point below last week"] },
  { name: "Subsidy Tracker", role: "Watches every PM Surya Ghar file and DISCOM SLA", icon: Landmark, status: "Needs you", runsToday: 6, hoursSaved: 5.5, accuracy: 92, last: "20 min ago", skills: ["PM Surya Ghar portal", "JVVNL", "AVVNL", "Documents"], schedule: "Every 2 hours, 9 AM – 7 PM", inbox: [{ title: "Escalate Kamla Devi net meter to XEn?", detail: "AVVNL Ramganj is 11 days on a 10-day SLA. Drafted a letter citing the RERC net-metering regulations." }], log: ["Anita Joshi feasibility 9 days, chased AEn Shastri Nagar", "Vinod Meena CFA pending 26 days, raised a portal grievance", "2 new registrations pulled from the portal"] },
  { name: "Survey Planner", role: "Books survey slots and routes the sales team", icon: MapPin, status: "Running", runsToday: 4, hoursSaved: 3, accuracy: 90, last: "35 min ago", skills: ["Google Maps", "WhatsApp", "Calendar"], schedule: "On every new lead", log: ["Booked Bansal survey for 10 AM, Mansarovar", "Routed Pooja: Mansarovar → Jhotwara → Vaishali", "Sent shadow-check checklist to Arjun for Mehta Marbles"] },
  { name: "Dispatch Planner", role: "Builds material kits from the design and checks stock", icon: Truck, status: "Running", runsToday: 5, hoursSaved: 3.5, accuracy: 94, last: "1 h ago", skills: ["BOM", "Stock", "Vehicles"], schedule: "Every evening, 6 PM", log: ["Kit DS-1042 packed for P-613", "TOPCon short 38 for Adarsh Vidya Mandir, drafted PO-3320", "Booked Eicher for Bhandari lot 2"] },
  { name: "Dues Collector", role: "Chases milestone payments and subsidy-adjusted balances", icon: IndianRupee, status: "Running", runsToday: 3, hoursSaved: 4.5, accuracy: 89, last: "2 h ago", skills: ["Tally", "WhatsApp", "UPI links"], schedule: "Daily 5 PM", log: ["Queued 5 reminders for 5 PM", "Adarsh Vidya Mandir: trustee promised Friday", "Ganesh Polymers 10% retention: 56 days overdue"] },
  { name: "Lead Qualifier", role: "Reads portal, IndiaMART and Instagram leads and sizes them", icon: Bot, status: "Idle", runsToday: 9, hoursSaved: 2.5, accuracy: 87, last: "40 min ago", skills: ["Bill OCR", "Sizing", "Subsidy math"], schedule: "On every new lead", log: ["Sized Bansal at 4.36 kWp from a 412-unit bill", "Marked 2 IndiaMART leads as traders, not buyers", "Pareek: terrace garden, suggested elevated structure"] },
];

const independence: IndependenceData = {
  score: 37,
  history: [22, 25, 27, 29, 31, 34, 37],
  quote: "Every C&I quote still waits for me because one wrong price on a 150 kW job wipes out a month's margin.",
  pillars: [
    { name: "Sales & quotes", score: 34, note: "Residential is Pooja's. Every C&I price above ₹40k/kWp waits for Devendra.", fixes: [{ title: "Price book with approval bands", gain: 4 }, { title: "PVsyst template for C&I", gain: 2 }] },
    { name: "Subsidy & DISCOM", score: 42, note: "Kavita knows every AEn, but files live in her phone gallery.", fixes: [{ title: "Documents checklist per file", gain: 3 }, { title: "SLA alerts to Kavita, not owner", gain: 2 }] },
    { name: "Installs & crews", score: 46, note: "Crew A and D run on their own. C&I jobs need the owner on site for structure sign-off.", fixes: [{ title: "Structure QC checklist with photos", gain: 3 }] },
    { name: "Stores & purchase", score: 25, note: "All module POs signed by the owner; stock counted on Saturday.", fixes: [{ title: "Auto-approve BOS under ₹50k", gain: 4 }, { title: "Live stock from dispatch slips", gain: 2 }] },
    { name: "O&M", score: 39, note: "Tickets come in on Devendra's WhatsApp from customers who know him.", fixes: [{ title: "Customer ticket number on WhatsApp", gain: 3 }, { title: "Yield Watcher raises tickets", gain: 2 }] },
    { name: "Money & dues", score: 31, note: "Milestone follow-ups are manual; ₹19 L of retention aged over 45 days.", fixes: [{ title: "Daily dues agent", gain: 3 }] },
    { name: "Owner time", score: 40, note: "Owner spends 13 hours a week on pricing and POs.", fixes: [{ title: "Two approval windows a day", gain: 2 }] },
  ],
  ownerHours: [
    { label: "C&I quotes", hours: 8 },
    { label: "POs", hours: 5 },
    { label: "DISCOM calls", hours: 6 },
    { label: "Site visits", hours: 9 },
    { label: "Customer calls", hours: 7 },
    { label: "Dues", hours: 4 },
    { label: "Strategy", hours: 1 },
  ],
};

const integrations: Integration[] = [
  { name: "PM Surya Ghar portal", category: "Subsidy", status: "Connected", detail: "Vendor login; application stages and CFA status pulled every 2 hours.", synced: "18 min ago", records: "214 applications", mark: "PM", color: "#e1701d" },
  { name: "JVVNL consumer portal", category: "DISCOM", status: "Connected", detail: "Net-meter applications for Jaipur and Kota circles.", synced: "1 h ago", records: "61 files", mark: "JV", color: "#2b5ca8" },
  { name: "AVVNL consumer portal", category: "DISCOM", status: "Error", detail: "Captcha changed; Kavita uploads by hand until we re-link.", synced: "2 days ago", records: "—", mark: "AV", color: "#7a3fa0" },
  { name: "Sungrow iSolarCloud", category: "Monitoring", status: "Connected", detail: "Live power and alarms from 3 Sungrow sites.", synced: "live", records: "3 plants", mark: "SG", color: "#1e88c7" },
  { name: "SolisCloud", category: "Monitoring", status: "Syncing", detail: "String currents from Ganesh Polymers, Maheshwari School and Vardhman.", synced: "live", records: "3 plants", mark: "SC", color: "#0f9d8a" },
  { name: "Growatt ShinePhone", category: "Monitoring", status: "Connected", detail: "Residential inverters via Wi-Fi dongles.", synced: "5 min ago", records: "2 plants · 118 homes", mark: "GW", color: "#2f9e44" },
  { name: "Tally Prime", category: "Accounts", status: "Connected", detail: "Invoices, milestone receipts and purchase vouchers.", synced: "9 min ago", records: "6,420 vouchers", mark: "T", color: "#1c4f9c" },
  { name: "WhatsApp Business", category: "Messaging", status: "Connected", detail: "Survey slots, crew groups, customer tickets and reminders.", synced: "just now", records: "3,880 chats", mark: "W", color: "#1f9d55" },
  { name: "IndiaMART lead manager", category: "Leads", status: "Connected", detail: "C&I enquiries pushed into the leads board.", synced: "22 min ago", records: "312 leads", mark: "IM", color: "#2e3192" },
  { name: "Razorpay", category: "Payments", status: "Available", detail: "UPI links for advances and on-commissioning balances.", synced: "—", records: "—", mark: "R", color: "#2563eb" },
];

/* ============================================================
   Config
   ============================================================ */

const config: DeskConfig = {
  slug: "solar-epc",
  company: "Suryodaya Solar Systems",
  brand: "Suryodaya",
  city: "Jaipur",
  state: "RJ",
  icon: SolarPanel,
  tagline: "Rooftop solar EPC · 30 installs a month across Jaipur, Ajmer and Kota · 600 kWp under O&M",
  owner: { name: "Devendra Choudhary", first: "Devendra", initials: "DC", role: "Founder" },
  theme: {
    variant: "atelier",
    paper: "#fbf8f1",
    panel: "#ffffff",
    sunk: "#f4efe2",
    ink: "#1a2a22",
    mute: "#6a7268",
    line: "#e9e2d1",
    accent: "#eba400",
    accentInk: "#1b1405",
    soft: "#fdf2d4",
    ok: "#2e7d4f",
    warn: "#c77a12",
    late: "#c0442f",
    info: "#1f4d3a",
    heading: "display",
  },
  agenda: [
    { at: 8.5, title: "Crew briefing", detail: "4 crews, 6 sites, Bhandari 2 days behind", count: 4, tone: "warn", module: "projects" },
    { at: 10, title: "Site surveys", detail: "Mansarovar, Jhotwara, Vaishali Nagar", count: 3, tone: "info", module: "leads" },
    { at: 11.5, title: "DISCOM follow-ups", detail: "5 net-meter files past or near SLA", count: 5, tone: "late", module: "subsidy" },
    { at: 13, title: "PO window", detail: "4 POs, ₹31 L, TOPCon is urgent", count: 4, tone: "accent", module: "projects" },
    { at: 15, title: "Sanganer Block Prints call", detail: "150 kWp, they want ₹38,200/kWp", tone: "accent", module: "leads" },
    { at: 17, title: "Collections + O&M close", detail: "6 milestones due, 4 open tickets", count: 6, tone: "ok", module: "payments" },
  ],
  activity: [
    { time: "11:20 AM", text: "Yield Watcher: Ganesh Polymers INV-2 MPPT-3 tripped, S6 at 0 kW", tone: "late" },
    { time: "10:48 AM", text: "Kamla Devi Saini net meter: AVVNL Ramganj now 11 days on a 10-day SLA", tone: "warn" },
    { time: "10:15 AM", text: "Pooja finished the Bansal survey: 4.36 kWp fits, SE corner shaded till 9:30", tone: "info" },
    { time: "9:52 AM", text: "Hada residence paid the 60% delivery milestone, ₹1.9 L by UPI", tone: "ok" },
    { time: "9:30 AM", text: "DS-1041 left the Sitapura store for Bhandari Cold Chain, Kota", tone: "neutral" },
    { time: "8:40 AM", text: "CFA of ₹78,000 credited to Pradeep Sharma; balance now due to us", tone: "ok" },
  ],
  asks: [
    {
      q: "Which plants are underperforming right now?",
      a: "Four strings across four plants are below 90% of clear-sky expected:\n\n• Shree Ganesh Polymers S6: 0%. INV-2 MPPT-3 tripped on an insulation fault at 10:52. About 13 kW lost at noon, ~65 kWh today.\n• Jain Textile S4: 76%. Stenter exhaust soot on the east bay. ~45 kWh a day.\n• Maheshwari School S3: 74%. Dust storm on Saturday; T-877 is assigned to Dinesh.\n• Khandelwal Villa S-B: 79%. Wash pending under T-879.\n\nRaise a ticket for Ganesh Polymers first: Manoj is 6 km away and it is the only one losing money every minute.",
      sources: ["SolisCloud string data", "iSolarCloud", "O&M tickets"],
    },
    {
      q: "Where are we stuck on net metering?",
      a: "5 files are waiting on DISCOMs:\n\n• Kamla Devi Saini (AVVNL Ramganj): net meter 11 days, SLA 10. Escalate to XEn.\n• Anita Joshi (AVVNL Shastri Nagar): feasibility 9 days, SLA 7.\n• Farida Begum (AVVNL Dargah Bazar): net meter 7 days.\n• Naresh Gupta (JVVNL Mahaveer Nagar): inspection 5 days.\n• Suman Kanwar (JVVNL Vaishali Nagar): feasibility 6 days.\n\nAll three AVVNL files are slow because the AVVNL portal link broke two days ago and Kavita is uploading by hand.",
      sources: ["PM Surya Ghar portal", "JVVNL portal", "Subsidy Tracker log"],
    },
    {
      q: "How much subsidy money are we waiting for?",
      a: "₹4.7 L of subsidy-adjusted balances. These customers paid us net of CFA and owe the balance once the ₹78,000 lands in their account:\n\n• Credited, collect now: Pradeep Sharma ₹78,000.\n• Redeemed, CFA pending: Vinod Meena (26 days), Sunita Agarwal (18 days).\n• Earlier in the pipeline: Kamla Devi, Farida Begum, Mahesh Yadav, Suman Kanwar, Lokesh Kumawat.\n\nVinod Meena is past the usual 30-day window soon; a portal grievance is already raised.",
      sources: ["PM Surya Ghar portal", "Tally receivables"],
    },
    {
      q: "Can we hit 30 installs this month?",
      a: "We are at 23 commissioned with 11 days left. 6 more are scheduled (P-611, P-613, P-616, P-618 and two Kota homes), which gets us to 29.\n\nThe gap is Crew A: two roofs a day is the limit and Rekha Choudhary is planned for 25 Oct. If Crew D comes to Jaipur on Saturday after Hada, we reach 30 on 31 Oct.",
      sources: ["Install Gantt", "Crew calendar"],
    },
    {
      q: "Do we have enough modules for the next two weeks?",
      a: "Not for TOPCon. Adarsh Vidya Mandir needs 78 Vikram 580 Wp; we have 40. PO-3320 (₹11.5 L) is waiting on you; Marudhar Energy quotes 4 days to Jaipur.\n\nWaaree 545 Wp DCR: 184 in stock, 96 reserved, so 88 free, about 12 homes. PO-3318 for 120 more covers the November residential bookings.\n\nGrowatt 5 kW is short by 1 for Rekha Choudhary on 25 Oct.",
      sources: ["Stock register", "Dispatch slips", "Open POs"],
    },
    {
      q: "Draft a reply to Sanganer Block Prints on price",
      a: "Draft (not sent):\n\n“Namaste Agarwal ji, thank you for the time yesterday. For 150 kWp on your Sitapura roof we can do ₹38,900 per kWp with Adani 550 Wp modules and Sungrow inverters, including the soot-guard wash plan for the east bay and a 5-year comprehensive AMC. Expected generation is 2.24 lakh units a year, a payback of about 3.1 years at your ₹9.40 tariff. Shall Arjun share the PVsyst report? — Devendra, Suryodaya Solar”",
      sources: ["C&I price book", "PVsyst run v2", "JVVNL HT tariff"],
    },
  ],
  run: {
    label: "Runs every 15 minutes from sunrise. You can also run it now.",
    title: "Yield Watcher",
    steps: [
      { text: "Pull live power from 8 commissioned plants", result: "Fleet at 79% PR, 4 strings below 90%" },
      { text: "Compare every string to clear-sky expected for Jaipur, Ajmer, Kota", result: "1 trip, 2 soiling, 1 new shading" },
      { text: "Check open O&M tickets and technician locations", result: "Manoj 6 km from VKI Area" },
      { text: "Check DISCOM SLAs on 12 subsidy files", result: "2 files past SLA, both AVVNL" },
      { text: "Draft tickets, customer messages and escalations", result: "2 tickets, 1 XEn letter, 3 WhatsApps" },
    ],
    outcome: "Raise a ticket for Ganesh Polymers S6 and send Manoj now; that alone recovers about 65 kWh today. Book a soot wash at Jain Textile for Thursday and escalate the Kamla Devi net meter to the AVVNL XEn.",
    actions: ["Raise ticket for Ganesh Polymers S6", "Book Jain Textile wash Thursday", "Escalate Kamla Devi to XEn", "Send customers their weekly yield"],
  },
};

/* ============================================================
   Desk
   ============================================================ */

export default function SolarEpcDesk() {
  const [tickets, setTickets] = React.useState(seedTickets);
  const [leads, setLeads] = React.useState(seedLeads);
  const [apps, setApps] = React.useState(seedApps);
  const openTickets = tickets.filter((t) => t.status !== "Resolved").length;
  const overSla = apps.filter((a) => a.stage < 6 && a.days > STAGE_SLA[a.stage]).length;

  const modules: DeskModule[] = [
    {
      id: "yield",
      label: "Rooftop yield",
      title: "Rooftop yield",
      blurb: "Eight commissioned rooftops, live, with the sun where it really is over Rajasthan right now",
      icon: Sun,
      notes: ["The sun moves across the arc by IST time of day; the array brightens with irradiance.", "Strings in brown are soiled, dark with a red outline have tripped, grey are shaded.", "Pick a plant or let it cycle. Raise an O&M ticket straight from a flagged string."],
      render: () => <YieldHome tickets={tickets} setTickets={setTickets} />,
    },
    { id: "leads", label: "Leads & surveys", count: leads.filter((l) => l.stage === "lead").length, title: "Leads & surveys", blurb: "Lead to booking: roof area, sanctioned load, shadow notes and the subsidy maths", icon: Ruler, render: () => <LeadsModule leads={leads} setLeads={setLeads} /> },
    { id: "subsidy", label: "Subsidy & net-metering", count: overSla, title: "Subsidy & net-metering", blurb: "PM Surya Ghar files, DISCOM net-meter SLAs for JVVNL and AVVNL, and every document", icon: Landmark, render: () => <SubsidyModule apps={apps} setApps={setApps} /> },
    { id: "projects", label: "Projects & stores", count: seedProjects.filter((p) => p.lateAt !== undefined).length, title: "Projects, crews & stores", blurb: "Install plan, crew allocation, material dispatch, stock and purchase orders", icon: Hammer, render: () => <ProjectsModule /> },
    { id: "om", label: "O&M & tickets", count: openTickets, title: "O&M & tickets", blurb: "Tickets, cleaning rounds, generation against expected and AMC renewals", icon: Wrench, render: () => <OmModule tickets={tickets} setTickets={setTickets} /> },
    { id: "payments", label: "Payments", count: seedAccounts.filter((a) => a.ms.some((m) => m.state === "overdue")).length, title: "Payments", blurb: "Advance, on-delivery and on-commissioning milestones, and subsidy-adjusted balances", icon: Receipt, render: () => <PaymentsModule apps={apps} /> },
    { id: "team", label: "People", title: "People", blurb: "Sales, DISCOM liaison, four crews, stores and O&M", icon: Users, render: () => <PeopleModule members={team} /> },
    { id: "agents", label: "Agents", title: "Agents", blurb: "Six AI agents watching plants, subsidy files, stock and dues", icon: Bot, render: () => <AgentsModule agents={agents} /> },
    { id: "independence", label: "Independence", title: "Owner independence", blurb: "How much of Suryodaya runs without Devendra on the phone", icon: GaugeIcon, render: () => <IndependenceModule data={independence} /> },
    { id: "connections", label: "Connections", title: "Connections", blurb: "PM Surya Ghar, DISCOM portals, inverter clouds, Tally and WhatsApp", icon: Plug, render: () => <ConnectionsModule items={integrations} /> },
  ];

  return <DeskShell config={config} modules={modules} />;
}

/* ============================================================
   Home: Rooftop yield
   ============================================================ */

function useSolarClock() {
  const now = useNow(1000);
  const live = now ? istParts(now).decimal : 12.25;
  const [replay, setReplay] = React.useState<number | null>(null);
  const replaying = replay !== null;
  React.useEffect(() => {
    if (!replaying) return;
    const id = window.setInterval(() => {
      setReplay((r) => (r === null ? null : r >= 18.4 ? null : Math.round((r + 0.08) * 100) / 100));
    }, 90);
    return () => window.clearInterval(id);
  }, [replaying]);
  return { t: replay ?? live, live, now, replay, setReplay };
}

function YieldHome({ tickets, setTickets }: { tickets: OmTicket[]; setTickets: React.Dispatch<React.SetStateAction<OmTicket[]>> }) {
  const desk = useDesk();
  const { t, now, replay, setReplay } = useSolarClock();
  const [idx, setIdx] = React.useState(2);
  const [cycle, setCycle] = React.useState(true);
  const noise = useDrift(0, 0.35, 1400);

  React.useEffect(() => {
    if (!cycle) return;
    const id = window.setInterval(() => setIdx((i) => (i + 1) % plants.length), 9000);
    return () => window.clearInterval(id);
  }, [cycle]);

  const plant = plants[idx];
  const fleetKw = plants.reduce((a, p) => a + liveKw(p, t), 0) * (1 + noise / 100);
  const fleetKwh = plants.reduce((a, p) => a + kwhSoFar(p, t), 0);
  const openT = tickets.filter((x) => x.status !== "Resolved");
  const flagged = plants.flatMap((p) => p.strings.filter((s) => s.issue).map((s) => ({ p, s })));

  function raise(p: Plant, s: PvString) {
    const id = `T-${882 + tickets.length - seedTickets.length}`;
    const lossKwh = Math.round((p.kwp * PEAK * p.pr * (DAYLEN / Math.PI) * 2 * s.mods * (1 - s.perf / 100)) / p.strings.reduce((a, x) => a + x.mods, 0));
    setTickets((cur) => [
      { id, plant: p.id, string: s.id, kind: s.issue ? issueLabel(s.issue) : "Low generation", detail: s.note ?? "Raised from Rooftop yield", raised: "20 Oct", status: "Open", tech: s.issue === "trip" ? "Manoj Kumawat" : p.city === "Kota" ? "Bablu Meghwal" : p.city === "Ajmer" ? "Dinesh Bairwa" : "Manoj Kumawat", priority: s.issue === "trip" ? "High" : "Medium", loss: lossKwh },
      ...cur,
    ]);
    toast.success(`${id} raised for ${p.name} ${s.id}`, { description: `${s.issue ? issueLabel(s.issue) : "Low output"} · about ${lossKwh} kWh a day at stake` });
    desk.log(`O&M ticket ${id}: ${p.name} ${s.id}, ${s.issue ? issueLabel(s.issue).toLowerCase() : "low output"}`, "warn");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Fleet output now" value={`${num(Math.round(fleetKw))} kW`} hint={`of ${num(Math.round(FLEET_KWP))} kWp · 8 plants`} delta="+4%" icon={Zap} tone="accent" trend={[0, 60, 190, 320, 410, 455, Math.round(fleetKw)]} />
        <Stat label="Generated today" value={`${num(Math.round(fleetKwh))} kWh`} hint={`₹${num(Math.round(fleetKwh * 9.1))} of grid power saved`} delta="+6%" icon={BatteryCharging} tone="ok" trend={[2410, 2380, 2190, 2460, 2520, 2390, Math.round(fleetKwh)]} />
        <Stat label="Installs this month" value="23 / 30" hint="6 scheduled, 11 days left" delta="+3" icon={SolarPanel} tone="info" trend={[4, 8, 11, 14, 18, 21, 23]} />
        <Stat label="Open O&M tickets" value={openT.length} hint={`${flagged.length} strings flagged now`} delta={`+${Math.max(0, openT.length - 3)}`} deltaGood={false} icon={Wrench} tone="warn" trend={[2, 3, 2, 4, 3, 3, openT.length]} onClick={() => desk.goTab("om")} />
      </div>

      <Panel
        live
        title={`${plant.name} · ${plant.kwp} kWp`}
        sub={`${plant.place} · ${plant.modules} · ${plant.inverter}`}
        action={
          <>
            <Btn size="sm" variant={replay !== null ? "solid" : "outline"} icon={replay !== null ? Pause : Play} onClick={() => { if (replay !== null) { setReplay(null); } else { setReplay(6.2); desk.log("Replaying today's sun path", "info"); } }}>
              {replay !== null ? "Back to live" : "Replay day"}
            </Btn>
            <Btn size="sm" variant="ghost" onClick={() => setCycle((c) => !c)}>
              {cycle ? "Stop cycling" : "Cycle plants"}
            </Btn>
          </>
        }
        bodyClassName="p-0 pt-2"
      >
        <div className="grid xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 border-d-line xl:border-r">
            <RooftopScene plant={plant} t={t} noise={noise} clock={replay !== null ? hhmm(t) : now ? clockLabel(now) : "--:--"} replay={replay !== null} />
          </div>
          <div className="space-y-1.5 p-3">
            <p className="px-1 pb-1 text-[11.5px] font-medium text-d-mute">Commissioned plants {cycle && <span className="text-d-ok">· cycling</span>}</p>
            {plants.map((p, i) => {
              const kw = liveKw(p, t);
              const bad = p.strings.some((s) => s.issue);
              const Icon = p.kind === "house" ? House : p.kind === "school" ? School : Factory;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setIdx(i);
                    setCycle(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-[12px] border px-2.5 py-2 text-left transition-colors"
                  style={{ borderColor: i === idx ? "var(--d-accent)" : "var(--d-line)", background: i === idx ? "var(--d-soft)" : "var(--d-panel)" }}
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-d-sunk text-d-info">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold">{p.name}</span>
                    <span className="block truncate text-[11.5px] text-d-mute">
                      {p.city} · {p.kwp} kWp · PR {Math.round(p.pr * health(p) * 100)}%
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="tnum block font-mono text-[12.5px] font-semibold">{kw >= 10 ? Math.round(kw) : r2(kw).toFixed(1)} kW</span>
                    {bad ? <span className="text-[10.5px] font-medium text-d-late">flagged</span> : <span className="text-[10.5px] text-d-ok">healthy</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <StringsTable plant={plant} t={t} tickets={tickets} onRaise={raise} />
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
        <Panel icon={CloudSun} title="Fleet generation, kW by hour" sub="Clear-sky expected for 600 kWp vs yesterday's hazy day" action={<Btn size="sm" icon={ArrowRight} onClick={() => desk.goTab("om")}>O&M</Btn>}>
          <AreaChart
            labels={Array.from({ length: 13 }, (_, i) => `${i + 6}:00`)}
            series={[
              { name: "Expected today", data: Array.from({ length: 13 }, (_, i) => Math.round(plants.reduce((a, p) => a + expectedKw(p, i + 6), 0))), tone: "accent" },
              { name: "Yesterday actual", data: Array.from({ length: 13 }, (_, i) => Math.round(plants.reduce((a, p) => a + liveKw(p, i + 6), 0) * (0.86 + 0.04 * Math.round(Math.cos(i) * 100) / 100))), tone: "info" },
            ]}
            marker={t > 6 && t < 18.5 ? { index: clamp(Math.round(t - 6), 0, 12), label: "Now" } : undefined}
            format={(v) => `${num(v)} kW`}
            height={190}
          />
        </Panel>
        <Panel icon={SolarPanel} title="This month's installs" sub="23 commissioned, target 30">
          <div className="flex flex-wrap items-center gap-5">
            <Donut
              size={140}
              center="23"
              sub="of 30"
              segments={[
                { label: "Jaipur", value: 14, tone: "accent" },
                { label: "Ajmer", value: 5, tone: "info" },
                { label: "Kota", value: 4, tone: "ok" },
                { label: "To go", value: 7, tone: "neutral" },
              ]}
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              { l: "Residential", v: "19", s: "62.4 kWp" },
              { l: "C&I", v: "3", s: "285 kWp" },
              { l: "School", v: "1", s: "45 kWp" },
            ].map((x) => (
              <div key={x.l} className="rounded-[10px] bg-d-sunk px-2 py-2">
                <p className="tnum font-mono text-[17px] font-semibold">{x.v}</p>
                <p className="text-[11px] text-d-mute">
                  {x.l} · {x.s}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel icon={ClipboardList} title="Waiting on Devendra" sub="Prices outside the band, POs and overtime. Approved items go to Tally and the crew group." action={<Pill tone="warn" mono>4 items</Pill>}>
        <ApprovalQueue
          items={[
            { id: "q1", title: "Sanganer Block Prints · ₹38,900/kWp for 150 kWp", sub: "Below the ₹40k floor by 2.75%. Margin still 17.8%. Arjun recommends.", amount: inr(5835000, { compact: true }), meta: "Price", tone: "accent" },
            { id: "q2", title: "PO-3320 · 80 × Vikram 580 Wp TOPCon DCR", sub: "Marudhar Energy · Adarsh Vidya Mandir structure is up, modules short", amount: inr(1152000, { compact: true }), meta: "Urgent", tone: "late" },
            { id: "q3", title: "Saturday overtime, Crew C at Bhandari", sub: "8 people × 9 h · recovers 2 of the 3 lost days", amount: inr(21600), meta: "Crew", tone: "info" },
            { id: "q4", title: "AMC renewal discount, Jain Textile", sub: "₹900 → ₹860/kWp for a 3-year term", amount: inr(215200), meta: "O&M", tone: "ok" },
          ]}
          onDecide={(id, d) => d && desk.log(`Approval ${id} ${d}`, d === "approved" ? "ok" : "warn")}
        />
      </Panel>
    </div>
  );
}

/* ---------------- Rooftop scene SVG ---------------- */

const SCENE = {
  house: { body: [290, 210, 320, 120], arr: [350, 205, 200, 56], label: "RCC flat roof, elevated structure" },
  school: { body: [200, 222, 480, 108], arr: [225, 216, 400, 70], label: "RCC roof, 3-tier rows" },
  factory: { body: [150, 238, 600, 92], arr: [180, 232, 500, 86], label: "Tin shed, rail-mounted" },
} as const;

function RooftopScene({ plant, t, noise, clock, replay }: { plant: Plant; t: number; noise: number; clock: string; replay: boolean }) {
  const I = irr(t);
  const day = I > 0;
  const frac = clamp((t - RISE) / DAYLEN, 0, 1);
  const ang = Math.PI * (1 - frac);
  const sx = r2(450 + 360 * Math.cos(ang));
  const sy = r2(300 - 220 * Math.sin(ang));
  const kw = Math.max(0, liveKw(plant, t) * (1 + noise / 100));
  const kwh = kwhSoFar(plant, t);
  const exp = expectedKw(plant, t);
  const wm2 = Math.round(PEAK_WM2 * I);
  const temp = Math.round(24 + I * 31);
  const tripped = plant.strings.some((s) => s.issue === "trip");
  const low = I < 0.35 && day;
  const skyTop = !day ? "#16233a" : low ? mix("#f6b26b", "#8fc3e8", I / 0.35) : mix("#8fc3e8", "#5aa5e0", (I - 0.35) / 0.65);
  const skyBot = !day ? "#2a3550" : low ? mix("#fbd7a0", "#e8f2f8", I / 0.35) : "#eef6fb";
  const sc = SCENE[plant.kind];
  const [bx, by, bw, bh] = sc.body;
  const [ax, abase, aw, ahMax] = sc.arr;
  const gap = plant.cols > 12 ? 2 : 3;
  const ah = Math.min(ahMax, plant.rows * 22);
  const usableW = aw - ah * SKEW;
  const pw = r2((usableW - gap * (plant.cols - 1)) / plant.cols);
  const ph = r2((ah - gap * (plant.rows - 1)) / plant.rows);
  const total = plant.rows * plant.cols;
  const base = mix("#1a2433", "#2f6fb8", I);
  const flowing = kw > 0.05;
  const hourTicks = [7, 9, 11, 13, 15, 17].map((h) => {
    const f = (h - RISE) / DAYLEN;
    const a = Math.PI * (1 - f);
    return { h, x: r2(450 + 360 * Math.cos(a)), y: r2(300 - 220 * Math.sin(a)) };
  });

  return (
    <div className="relative">
      <svg viewBox="0 0 900 400" className="block w-full" role="img" aria-label={`Rooftop of ${plant.name} with the sun at ${clock}`}>
        <defs>
          <linearGradient id="se-sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={skyTop} style={{ transition: "stop-color 1s" }} />
            <stop offset="100%" stopColor={skyBot} style={{ transition: "stop-color 1s" }} />
          </linearGradient>
          <radialGradient id="se-sun">
            <stop offset="0%" stopColor="#fff4c2" />
            <stop offset="45%" stopColor="#ffc93c" />
            <stop offset="100%" stopColor="#f2a900" stopOpacity="0" />
          </radialGradient>
          <pattern id="se-dust" width="7" height="7" patternUnits="userSpaceOnUse">
            <rect width="7" height="7" fill="#a5814d" fillOpacity="0.45" />
            <circle cx="2" cy="2" r="1" fill="#7a5a2e" fillOpacity="0.7" />
            <circle cx="5.5" cy="5" r="0.8" fill="#c9a36b" fillOpacity="0.8" />
          </pattern>
          <pattern id="se-shade" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="#30343a" fillOpacity="0.35" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="900" height="330" fill="url(#se-sky)" />
        {!day &&
          [
            [80, 40],
            [210, 70],
            [330, 30],
            [520, 55],
            [640, 28],
            [760, 80],
            [840, 40],
          ].map(([x, y]) => <circle key={`st-${x}`} cx={x} cy={y} r="1.3" fill="#fff" opacity="0.7" />)}
        {/* sun arc */}
        <path d="M90,300 A360,220 0 0 1 810,300" fill="none" stroke={day ? "#ffffff" : "#8796b5"} strokeOpacity="0.7" strokeWidth="1.5" strokeDasharray="3 7" />
        {hourTicks.map((h) => (
          <g key={h.h}>
            <circle cx={h.x} cy={h.y} r="2.5" fill="#ffffff" opacity="0.8" />
            <text x={h.x} y={h.y - 8} textAnchor="middle" className="text-[10px] font-medium" fill={day ? "#3b5568" : "#b9c3d9"}>
              {h.h > 12 ? `${h.h - 12} PM` : h.h === 12 ? "12 PM" : `${h.h} AM`}
            </text>
          </g>
        ))}
        {day ? (
          <g style={{ transition: "transform 1s linear" }}>
            <circle cx={sx} cy={sy} r={r2(40 + I * 22)} fill="url(#se-sun)" />
            <circle cx={sx} cy={sy} r="17" fill="#ffd34d" stroke="#f2a900" strokeWidth="2" />
          </g>
        ) : (
          <g>
            <circle cx="760" cy="70" r="16" fill="#e8ecf5" />
            <circle cx="768" cy="64" r="14" fill="#16233a" />
          </g>
        )}
        {/* Aravalli hills */}
        <path d="M0,300 C60,262 120,280 180,258 S300,250 360,272 S480,240 560,262 S700,236 780,258 S860,262 900,250 L900,330 L0,330 Z" fill={day ? "#9fb08a" : "#3b4757"} opacity="0.55" />
        <path d="M0,316 C80,296 160,310 260,298 S440,292 540,304 S760,290 900,300 L900,330 L0,330 Z" fill={day ? "#7f9670" : "#323d4b"} opacity="0.6" />
        {/* ground */}
        <rect x="0" y="330" width="900" height="70" fill={day ? "#e9dcc0" : "#3a3a40"} />
        <rect x="0" y="330" width="900" height="3" fill={day ? "#d7c59f" : "#2c2c33"} />
        {/* building */}
        <rect x={bx} y={by} width={bw} height={bh} rx="3" fill={day ? "#efe6d6" : "#5a5560"} stroke={day ? "#cdbfa6" : "#45414b"} />
        <rect x={bx - 6} y={by - 6} width={bw + 12} height="8" rx="2" fill={day ? "#dccdb2" : "#4b4652"} />
        {plant.kind === "factory" ? (
          <>
            {Array.from({ length: 6 }, (_, i) => (
              <rect key={`bay-${i}`} x={bx + 20 + i * 98} y={by + 30} width="70" height={bh - 30} fill={day ? "#cbbd9f" : "#46424c"} />
            ))}
            <rect x={bx + 14} y={by - 70} width="14" height="64" fill={day ? "#b4a58b" : "#4a4650"} />
          </>
        ) : (
          Array.from({ length: plant.kind === "house" ? 8 : 18 }, (_, i) => {
            const perRow = plant.kind === "house" ? 4 : 9;
            const col = i % perRow;
            const row = Math.floor(i / perRow);
            const cw = (bw - 40) / perRow;
            return <rect key={`w-${i}`} x={r2(bx + 24 + col * cw)} y={by + 22 + row * 44} width={r2(cw - 22)} height="24" rx="2" fill={day ? "#a8c4d6" : "#f3d27a"} opacity={day ? 0.8 : 0.75} />;
          })
        )}
        {plant.kind === "house" && (
          <>
            <rect x={bx + 10} y={by - 46} width="40" height="42" fill={day ? "#e3d8c4" : "#55505b"} stroke={day ? "#cdbfa6" : "#45414b"} />
            <rect x={bx + bw - 34} y={by - 40} width="24" height="34" rx="5" fill="#2a2a2e" />
          </>
        )}
        {plant.kind === "school" && (
          <>
            <line x1={bx + bw + 30} y1="330" x2={bx + bw + 30} y2={by - 50} stroke="#8b8b8b" strokeWidth="2" />
            <rect x={bx + bw + 31} y={by - 50} width="26" height="6" fill="#ff9933" />
            <rect x={bx + bw + 31} y={by - 44} width="26" height="6" fill="#ffffff" />
            <rect x={bx + bw + 31} y={by - 38} width="26" height="6" fill="#138808" />
          </>
        )}
        {/* array shadow + legs */}
        <polygon points={`${ax},${abase} ${ax + aw - ah * SKEW},${abase} ${ax + aw},${abase - 4} ${ax + ah * 0.2},${abase - 4}`} fill="#000" opacity="0.12" />
        {/* panel array */}
        <g transform={`translate(${ax},${abase}) skewX(-30)`}>
          {Array.from({ length: total }, (_, i) => {
            const row = Math.floor(i / plant.cols);
            const col = i % plant.cols;
            const si = Math.min(plant.strings.length - 1, Math.floor((i * plant.strings.length) / total));
            const s = plant.strings[si];
            const x = r2(col * (pw + gap));
            const y = r2(-ah + row * (ph + gap));
            const isTrip = s.issue === "trip";
            const fill = isTrip ? "#1c2026" : base;
            return (
              <g key={`m-${i}`}>
                <rect x={x} y={y} width={pw} height={ph} fill={fill} stroke={isTrip ? "#c0442f" : "#c9d4e0"} strokeWidth={isTrip ? 1.2 : 0.6} style={{ transition: "fill 800ms" }} />
                {!isTrip && <rect x={x} y={y} width={pw} height={r2(ph * 0.45)} fill="#ffe08a" opacity={r2(I * 0.32 * (s.perf / 100))} />}
                {s.issue === "soiling" && <rect x={x} y={y} width={pw} height={ph} fill="url(#se-dust)" />}
                {s.issue === "shade" && col < Math.ceil(plant.cols / 3) && <rect x={x} y={y} width={pw} height={ph} fill="url(#se-shade)" />}
                {pw > 14 && <line x1={r2(x + pw / 2)} y1={y} x2={r2(x + pw / 2)} y2={r2(y + ph)} stroke="#c9d4e0" strokeOpacity="0.35" strokeWidth="0.5" />}
              </g>
            );
          })}
        </g>
        {/* string flags */}
        {plant.strings.map((s, si) => {
          if (!s.issue) return null;
          const first = Math.ceil((si * total) / plant.strings.length);
          const row = Math.floor(first / plant.cols);
          const col = first % plant.cols;
          const ly = -ah + row * (ph + gap);
          const fx = r2(ax + col * (pw + gap) + -ly * SKEW + 4);
          const fy = r2(abase + ly - 8);
          const tone = s.issue === "trip" ? "#c0442f" : s.issue === "soiling" ? "#9a6a1e" : "#4b5563";
          return (
            <g key={`f-${s.id}`}>
              <rect x={fx - 2} y={fy - 13} width={s.issue === "trip" ? 64 : 72} height="16" rx="8" fill={tone} />
              <text x={fx + 6} y={fy - 2} className="text-[10px] font-semibold" fill="#fff">
                {s.id} · {s.issue === "trip" ? "trip" : s.issue === "soiling" ? `dust ${s.perf}%` : `shade ${s.perf}%`}
              </text>
            </g>
          );
        })}
        {/* inverter + net meter + pole */}
        <rect x={bx + bw - 60} y={by + bh - 70} width="34" height="44" rx="4" fill="#f4f4f2" stroke="#9aa3a0" />
        <circle cx={bx + bw - 43} cy={by + bh - 58} r="4" fill={!flowing ? "#7a7a7a" : tripped ? "#c0442f" : "#2e9d55"}>
          {tripped && flowing && <animate attributeName="opacity" values="1;0.2;1" dur="1.1s" repeatCount="indefinite" />}
        </circle>
        <text x={bx + bw - 43} y={by + bh - 36} textAnchor="middle" className="text-[7.5px] font-semibold" fill="#4b5563">
          INV
        </text>
        <path d={`M${ax + aw / 2},${abase + 4} L${ax + aw / 2},${by + 14} L${bx + bw - 43},${by + 14} L${bx + bw - 43},${by + bh - 70}`} fill="none" stroke={flowing ? "#f2a900" : "#9aa3a0"} strokeWidth="2" strokeDasharray="5 6" className={flowing ? "desk-flow" : undefined} opacity="0.9" />
        <path d={`M${bx + bw - 26},${by + bh - 48} L${bx + bw + (plant.kind === "school" ? 70 : 60)},${by + bh - 48} L840,150`} fill="none" stroke={flowing ? "#1f4d3a" : "#9aa3a0"} strokeWidth="2" strokeDasharray="5 6" className={flowing ? "desk-flow" : undefined} opacity="0.8" />
        <rect x={bx + bw + (plant.kind === "school" ? 56 : 46)} y={by + bh - 62} width="28" height="28" rx="4" fill="#fff" stroke="#1f4d3a" />
        <text x={bx + bw + (plant.kind === "school" ? 70 : 60)} y={by + bh - 45} textAnchor="middle" className="text-[7.5px] font-bold" fill="#1f4d3a">
          NET
        </text>
        <line x1="840" y1="330" x2="840" y2="140" stroke={day ? "#6b6257" : "#8a8a90"} strokeWidth="5" />
        <line x1="818" y1="152" x2="862" y2="152" stroke={day ? "#6b6257" : "#8a8a90"} strokeWidth="3" />
        <line x1="822" y1="170" x2="858" y2="170" stroke={day ? "#6b6257" : "#8a8a90"} strokeWidth="2.5" />
        <text x="840" y="132" textAnchor="middle" className="text-[9.5px] font-semibold" fill={day ? "#3b4a40" : "#cfd5e2"}>
          {plant.discom} 11 kV
        </text>
      </svg>

      {/* live readouts */}
      <div className="pointer-events-none absolute left-3 top-2 rounded-[14px] border border-white/60 bg-white/85 px-3.5 py-2.5 shadow-sm backdrop-blur sm:left-4 sm:top-3">
        <p className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-d-mute">{replay ? "Replay" : "Live"} · {clock}</p>
        <p className="desk-h tnum mt-0.5 text-[30px] font-semibold leading-none tracking-tight">
          {kw >= 10 ? num(Math.round(kw)) : r2(kw).toFixed(2)}
          <span className="ml-1 text-[14px] font-medium text-d-mute">kW</span>
        </p>
        <p className="tnum mt-1 font-mono text-[12px]">
          {kwh >= 100 ? num(Math.round(kwh)) : r2(kwh).toFixed(1)} kWh today
          <span className="text-d-mute"> · {exp > 0 ? Math.round((kw / exp) * 100) : 0}% of expected</span>
        </p>
      </div>
      <div className="pointer-events-none absolute right-3 top-2 hidden rounded-[14px] border border-white/60 bg-white/85 px-3.5 py-2.5 text-[12px] shadow-sm backdrop-blur sm:right-4 sm:top-3 sm:block">
        <p className="flex items-center gap-1.5 font-medium">
          {day ? <Sun className="h-3.5 w-3.5 text-d-accent" /> : <Moon className="h-3.5 w-3.5 text-d-mute" />} {plant.city}
        </p>
        <p className="tnum mt-1 font-mono">{wm2} W/m²</p>
        <p className="tnum font-mono text-d-mute">module {temp}°C</p>
        <p className="tnum font-mono text-d-mute">₹{num(Math.round(kwh * plant.tariff))} saved</p>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-d-line px-5 py-2.5 text-[12px] text-d-mute">
        <span>{sc.label}</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded-[2px]" style={{ background: base }} /> producing
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded-[2px]" style={{ background: "#a5814d" }} /> soiling
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded-[2px] border border-d-late bg-[#1c2026]" /> inverter trip
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded-[2px] bg-[#6b7078]" /> shading
        </span>
        <span className="ml-auto font-mono">sunrise 6:27 · sunset 5:57</span>
      </div>
    </div>
  );
}

function StringsTable({ plant, t, tickets, onRaise }: { plant: Plant; t: number; tickets: OmTicket[]; onRaise: (p: Plant, s: PvString) => void }) {
  const I = irr(t);
  const totalMods = plant.strings.reduce((a, s) => a + s.mods, 0);
  return (
    <div className="border-t border-d-line px-5 pb-4 pt-3">
      <p className="mb-2 text-[12px] font-medium text-d-mute">
        Strings · {plant.strings.length} on {plant.inverter} · {plant.strings.filter((s) => s.issue).length} flagged
      </p>
      <div className="desk-scroll overflow-x-auto">
        <table className="w-full min-w-[640px] text-[12.5px]">
          <thead>
            <tr className="border-b border-d-line text-left text-[11px] text-d-mute">
              <th className="pb-1.5 font-medium">String</th>
              <th className="pb-1.5 font-medium">Modules</th>
              <th className="pb-1.5 text-right font-medium">Voltage</th>
              <th className="pb-1.5 text-right font-medium">Current</th>
              <th className="pb-1.5 pl-5 font-medium">vs expected</th>
              <th className="pb-1.5 font-medium">Status</th>
              <th className="pb-1.5" />
            </tr>
          </thead>
          <tbody>
            {plant.strings.map((s) => {
              const v = s.issue === "trip" || I === 0 ? 0 : Math.round(s.mods * (37 + I * 4.2));
              const a = s.issue === "trip" ? 0 : r2(13.1 * I * (s.perf / 100));
              const tk = tickets.find((x) => x.plant === plant.id && x.string === s.id && x.status !== "Resolved");
              return (
                <tr key={s.id} className="border-b border-d-line/60 last:border-0">
                  <td className="py-2 font-mono font-semibold">{s.id}</td>
                  <td className="py-2 text-d-mute">{s.mods} × {plant.modules.match(/\d{3} Wp/)?.[0]}</td>
                  <td className="tnum py-2 text-right font-mono">{v} V</td>
                  <td className="tnum py-2 text-right font-mono">{a.toFixed(2)} A</td>
                  <td className="py-2">
                    <div className="flex min-w-[120px] items-center gap-2 pl-5">
                      <Meter value={s.perf} tone={s.perf >= 95 ? "ok" : s.perf >= 80 ? "warn" : "late"} />
                      <span className="w-9 text-right font-mono text-[11px]">{s.perf}%</span>
                    </div>
                  </td>
                  <td className="py-2">
                    {s.issue ? (
                      <span title={s.note}>
                        <Pill tone={s.issue === "trip" ? "late" : "warn"}>{issueLabel(s.issue)}</Pill>
                      </span>
                    ) : (
                      <Pill tone="ok">Healthy</Pill>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    {tk ? (
                      <Pill tone="info" mono>
                        {tk.id} · {tk.status}
                      </Pill>
                    ) : s.issue ? (
                      <Btn size="sm" variant={s.issue === "trip" ? "solid" : "soft"} icon={Ticket} onClick={() => onRaise(plant, s)}>
                        Raise O&M ticket
                      </Btn>
                    ) : (
                      <span className="text-[11px] text-d-mute">{Math.round((s.mods / totalMods) * plant.kwp * 10) / 10} kWp</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {plant.strings.filter((s) => s.issue && s.note).map((s) => (
        <p key={`n-${s.id}`} className="mt-2 flex items-start gap-2 text-[12px] text-d-mute">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-d-warn" />
          <span>
            <b className="text-d-ink">{s.id}:</b> {s.note}
          </span>
        </p>
      ))}
    </div>
  );
}

/* ============================================================
   Leads & surveys
   ============================================================ */

function LeadsModule({ leads, setLeads }: { leads: Lead[]; setLeads: React.Dispatch<React.SetStateAction<Lead[]>> }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);
  const [city, setCity] = React.useState<"All" | Lead["city"]>("All");
  const lead = leads.find((l) => l.id === open) ?? null;
  const shown = leads.filter((l) => city === "All" || l.city === city);
  const pipeline = leads.filter((l) => l.stage !== "booked").reduce((a, l) => a + l.kwp * rateFor(l.seg), 0);
  const booked = leads.filter((l) => l.stage === "booked");

  function move(id: string, stage: LeadStage) {
    const l = leads.find((x) => x.id === id);
    if (!l || l.stage === stage) return;
    setLeads((cur) => cur.map((x) => (x.id === id ? { ...x, stage } : x)));
    const label = LEAD_STAGES.find((s) => s.id === stage)?.label;
    toast.success(`${l.name} → ${label}`, { description: stage === "booked" ? `Advance of ${inr(l.kwp * rateFor(l.seg) * 0.3)} requested by UPI link` : `${l.kwp} kWp · ${l.place}` });
    desk.log(`${l.name} moved to ${label}`, stage === "booked" ? "ok" : "info");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="New leads this week" value="38" delta="+22%" hint="21 from PM Surya Ghar portal" icon={Ruler} trend={[22, 25, 24, 29, 31, 33, 38]} />
        <Stat label="Survey → quote" value="64%" delta="+5%" hint="last 30 days" icon={ClipboardList} tone="ok" trend={[52, 55, 58, 57, 60, 61, 64]} />
        <Stat label="Open pipeline" value={inr(pipeline, { compact: true })} hint={`${leads.filter((l) => l.stage !== "booked").length} leads · ${r2(leads.filter((l) => l.stage !== "booked").reduce((a, l) => a + l.kwp, 0))} kWp`} delta="+9%" icon={IndianRupee} trend={[2.1, 2.3, 2.6, 2.8, 3.0, 3.2, pipeline / 1e7]} />
        <Stat label="Lead to booking" value="11.4 days" delta="-1.6" deltaGood={false} hint="residential median" icon={Timer} tone="info" trend={[15, 14.2, 13.8, 13, 12.6, 12, 11.4]} />
      </div>
      <Panel
        title="Survey board"
        sub="Drag a card to move it. Click for the roof, the sizing and the subsidy maths."
        action={
          <>
            <Segmented size="sm" options={["All", "Jaipur", "Ajmer", "Kota"] as const} value={city} onChange={setCity} />
            <Btn size="sm" variant="solid" icon={Plus} onClick={() => setAdding(true)}>
              New lead
            </Btn>
          </>
        }
      >
        <Board
          columns={LEAD_STAGES.map((s) => ({ ...s, limit: s.id === "survey" ? 4 : undefined }))}
          items={shown}
          itemKey={(l) => l.id}
          getColumn={(l) => l.stage}
          onMove={(k, c) => move(k, c as LeadStage)}
          minColumnWidth={228}
          renderCard={(l) => {
            const Icon = l.seg === "Residential" ? House : l.seg === "School" ? School : Factory;
            const next = LEAD_STAGES[LEAD_STAGES.findIndex((s) => s.id === l.stage) + 1];
            return (
              <div>
                <button type="button" onClick={() => setOpen(l.id)} className="block w-full text-left">
                  <p className="flex items-center gap-1.5 pr-4 text-[13px] font-semibold leading-tight">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-d-info" />
                    <span className="truncate">{l.name}</span>
                  </p>
                  <p className="mt-0.5 truncate text-[11.5px] text-d-mute">
                    <MapPin className="mr-0.5 inline h-3 w-3" />
                    {l.place}
                  </p>
                  <div className="mt-2 grid grid-cols-3 gap-1 text-center">
                    <span className="rounded-[6px] bg-d-sunk px-1 py-1">
                      <span className="block font-mono text-[11.5px] font-semibold">{l.kwp}</span>
                      <span className="block text-[9.5px] text-d-mute">kWp</span>
                    </span>
                    <span className="rounded-[6px] bg-d-sunk px-1 py-1">
                      <span className="block font-mono text-[11.5px] font-semibold">{num(l.roof)}</span>
                      <span className="block text-[9.5px] text-d-mute">sq ft</span>
                    </span>
                    <span className="rounded-[6px] bg-d-sunk px-1 py-1">
                      <span className="block font-mono text-[11.5px] font-semibold">{l.load}</span>
                      <span className="block text-[9.5px] text-d-mute">kW load</span>
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[11.5px] leading-snug text-d-mute">☼ {l.shadow}</p>
                </button>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="font-mono text-[11.5px] font-semibold">{inr(l.kwp * rateFor(l.seg), { compact: true })}</span>
                  <span className="flex items-center gap-1">
                    <span className="text-[10.5px] text-d-mute">{l.age}</span>
                    {next && (
                      <button type="button" onClick={() => move(l.id, next.id as LeadStage)} className="rounded-full bg-d-soft px-2 py-0.5 text-[10.5px] font-semibold text-[color:var(--d-ink)] hover:brightness-95">
                        → {next.label}
                      </button>
                    )}
                  </span>
                </div>
              </div>
            );
          }}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel icon={CalendarClock} title="Survey slots" sub="Routed by Survey Planner">
          <ul className="space-y-2">
            {[
              { at: "10:00", who: "Bansal, Mansarovar", by: "Pooja", st: "Done", tone: "ok" as Tone },
              { at: "12:30", who: "Kumawat roof re-check, Jhotwara", by: "Pooja", st: "En route", tone: "info" as Tone },
              { at: "3:30", who: "Suman Kanwar, Vaishali Nagar", by: "Pooja", st: "Booked", tone: "neutral" as Tone },
              { at: "Wed 11:00", who: "Mehta Marbles, Kishangarh", by: "Arjun", st: "Booked", tone: "neutral" as Tone },
              { at: "Thu 10:00", who: "Col. Rathore, C-Scheme", by: "Pooja", st: "To confirm", tone: "warn" as Tone },
            ].map((s) => (
              <li key={s.at + s.who} className="flex items-center gap-3 rounded-[10px] border border-d-line px-3 py-2">
                <span className="w-16 shrink-0 font-mono text-[11.5px] text-d-mute">{s.at}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium">{s.who}</span>
                  <span className="block text-[11px] text-d-mute">{s.by}</span>
                </span>
                <Pill tone={s.tone}>{s.st}</Pill>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Where leads come from" sub="Last 30 days, 142 leads">
          <HBars
            data={[
              { label: "PM Surya Ghar portal", value: 61, tone: "accent" },
              { label: "Referrals", value: 29, tone: "ok" },
              { label: "Google search", value: 22, tone: "info" },
              { label: "IndiaMART", value: 17, tone: "warn", sub: "C&I" },
              { label: "Instagram", value: 13, tone: "neutral" },
            ]}
          />
        </Panel>
        <Panel title="Booked, not started" sub={`${booked.length} jobs waiting for a crew slot`}>
          <ul className="space-y-2">
            {booked.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-2 rounded-[10px] bg-d-sunk px-3 py-2">
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium">{l.name}</span>
                  <span className="block text-[11px] text-d-mute">
                    {l.kwp} kWp · {l.city}
                  </span>
                </span>
                <Btn size="sm" variant="soft" onClick={() => { desk.goTab("projects"); desk.log(`Opened install plan for ${l.name}`); }}>
                  Plan install
                </Btn>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <LeadSheet lead={lead} onClose={() => setOpen(null)} onMove={move} />
      <NewLead
        open={adding}
        onOpenChange={setAdding}
        onAdd={(l) => {
          setLeads((cur) => [l, ...cur]);
          toast.success("Lead added", { description: `${l.name} · sized at ${l.kwp} kWp` });
          desk.log(`New lead ${l.name}, ${l.place}`, "info");
        }}
      />
    </div>
  );
}

function LeadSheet({ lead, onClose, onMove }: { lead: Lead | null; onClose: () => void; onMove: (id: string, s: LeadStage) => void }) {
  const desk = useDesk();
  const byRoof = lead ? Math.floor((lead.roof / (lead.seg === "Residential" ? 95 : 90)) * 10) / 10 : 0;
  const yearly = lead ? Math.round(lead.kwp * 1530) : 0;
  const tariff = lead?.seg === "Residential" ? 7.95 : 9.4;
  const price = lead ? lead.kwp * rateFor(lead.seg) : 0;
  const subsidy = lead?.seg === "Residential" ? cfa(lead.kwp) : 0;
  return (
    <Sheet
      open={!!lead}
      onOpenChange={(o) => !o && onClose()}
      eyebrow={lead ? `${lead.id} · ${lead.seg} · ${lead.source}` : ""}
      title={lead?.name ?? ""}
      sub={lead ? `${lead.place} · owner ${lead.owner}` : ""}
      footer={
        <>
          <Btn
            icon={MessageCircle}
            onClick={() => {
              toast.success("Proposal sent on WhatsApp", { description: `${lead?.name} · PDF with yield and subsidy` });
              desk.log(`Proposal sent to ${lead?.name}`);
            }}
          >
            Send proposal
          </Btn>
          <Btn
            variant="solid"
            onClick={() => {
              if (!lead) return;
              const i = LEAD_STAGES.findIndex((s) => s.id === lead.stage);
              const next = LEAD_STAGES[Math.min(LEAD_STAGES.length - 1, i + 1)];
              onMove(lead.id, next.id as LeadStage);
              onClose();
            }}
          >
            Advance stage
          </Btn>
        </>
      }
    >
      {lead && (
        <div className="space-y-5">
          <KV
            items={[
              { k: "Roof", v: `${num(lead.roof)} sq ft · ${lead.roofType}` },
              { k: "Sanctioned load", v: `${lead.load} kW` },
              { k: "Fits on roof", v: `${byRoof} kWp` },
              { k: "Proposed", v: <b>{lead.kwp} kWp</b> },
              { k: "Generation", v: `${num(yearly)} units / year` },
              { k: "Bill saving", v: `${inr(yearly * tariff, { compact: true })} / year` },
            ]}
          />
          {lead.kwp > lead.load && <p className="rounded-[10px] bg-d-soft px-3 py-2 text-[12.5px]">Proposed size is above sanctioned load. A load-enhancement application to the DISCOM is needed first.</p>}
          <div className="rounded-[12px] border border-d-line p-3">
            <p className="flex items-center gap-1.5 text-[12px] font-medium text-d-mute">
              <Sun className="h-3.5 w-3.5" /> Shadow notes from survey
            </p>
            <p className="mt-1 text-[13.5px]">{lead.shadow}</p>
            <div className="mt-3 flex h-10 items-end gap-[3px]">
              {[30, 52, 74, 90, 98, 100, 97, 88, 70, 48, 22].map((h, i) => (
                <span key={i} className="flex-1 rounded-t-[2px]" style={{ height: `${h}%`, background: i < 2 && /SE|east|morning|9:30/i.test(lead.shadow) ? "var(--d-mute)" : i > 8 && /after 3|west/i.test(lead.shadow) ? "var(--d-mute)" : "var(--d-accent)", opacity: 0.85 }} />
              ))}
            </div>
            <p className="mt-1 flex justify-between font-mono text-[10px] text-d-mute">
              <span>7 AM</span>
              <span>12 PM</span>
              <span>5 PM</span>
            </p>
          </div>
          <div>
            <p className="mb-2 text-[12px] font-medium text-d-mute">Price and subsidy</p>
            <ul className="space-y-1.5 text-[13px]">
              <li className="flex justify-between"><span>System price @ {inr(rateFor(lead.seg))}/kWp</span><span className="font-mono">{inr(price)}</span></li>
              {subsidy > 0 && <li className="flex justify-between text-d-ok"><span>PM Surya Ghar CFA (to customer)</span><span className="font-mono">− {inr(subsidy)}</span></li>}
              {lead.seg !== "Residential" && <li className="flex justify-between text-d-ok"><span>Accelerated depreciation benefit, yr 1</span><span className="font-mono">≈ {inr(price * 0.4 * 0.25, { compact: true })}</span></li>}
              <li className="flex justify-between border-t border-d-line pt-1.5 font-semibold"><span>Net cost</span><span className="font-mono">{inr(price - subsidy)}</span></li>
              <li className="flex justify-between text-d-mute"><span>Payback</span><span className="font-mono">{r2((price - subsidy) / (yearly * tariff)).toFixed(1)} years</span></li>
            </ul>
          </div>
        </div>
      )}
    </Sheet>
  );
}

function NewLead({ open, onOpenChange, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (l: Lead) => void }) {
  const [name, setName] = React.useState("Gaurav Saini");
  const [place, setPlace] = React.useState("Pratap Nagar, Jaipur");
  const [seg, setSeg] = React.useState<Lead["seg"]>("Residential");
  const [roof, setRoof] = React.useState("800");
  const [load, setLoad] = React.useState("5");
  const [shadow, setShadow] = React.useState("Clear south face");
  const roofN = Number(roof) || 0;
  const loadN = Number(load) || 0;
  const kwp = Math.max(1.09, Math.min(loadN || 1, roofN / 95));
  const mods = Math.max(2, Math.floor(kwp / 0.545));
  const sized = r2(mods * 0.545);
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="New lead" sub="We size it from roof area and sanctioned load, whichever is smaller.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onAdd({
            id: `L-${2300 + Math.floor(Math.random() * 90)}`,
            name,
            place,
            city: /ajmer/i.test(place) ? "Ajmer" : /kota/i.test(place) ? "Kota" : "Jaipur",
            seg,
            roof: roofN,
            roofType: "RCC flat",
            load: loadN,
            kwp: sized,
            shadow,
            source: "Walk-in",
            stage: "lead",
            owner: seg === "Residential" ? "Pooja" : "Arjun",
            age: "just now",
          });
          onOpenChange(false);
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Customer">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Locality">
            <input className={inputClass} value={place} onChange={(e) => setPlace(e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Segment">
            <select className={inputClass} value={seg} onChange={(e) => setSeg(e.target.value as Lead["seg"])}>
              {["Residential", "C&I", "School"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Roof (sq ft)">
            <input className={inputClass} inputMode="numeric" value={roof} onChange={(e) => setRoof(e.target.value.replace(/\D/g, ""))} />
          </Field>
          <Field label="Sanctioned load (kW)">
            <input className={inputClass} inputMode="numeric" value={load} onChange={(e) => setLoad(e.target.value.replace(/\D/g, ""))} />
          </Field>
        </div>
        <Field label="Shadow notes">
          <input className={inputClass} value={shadow} onChange={(e) => setShadow(e.target.value)} />
        </Field>
        <p className="rounded-[10px] bg-d-sunk px-3 py-2 text-[12.5px]">
          Sized at <b>{sized} kWp</b> ({mods} × 545 Wp){seg === "Residential" && <> · CFA {inr(cfa(sized))}</>} · about {num(Math.round(sized * 1530))} units a year
        </p>
        <div className="flex justify-end gap-2 pt-1">
          <Btn onClick={() => onOpenChange(false)}>Cancel</Btn>
          <Btn variant="solid" type="submit" icon={Plus}>
            Add lead
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ============================================================
   Subsidy & net-metering
   ============================================================ */

function SubsidyModule({ apps, setApps }: { apps: SubsidyApp[]; setApps: React.Dispatch<React.SetStateAction<SubsidyApp[]>> }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<string | null>(null);
  const [docs, setDocs] = React.useState<Record<string, Set<string>>>(() => Object.fromEntries(seedApps.map((a) => [a.id, docsFor(a.stage)])));
  const [pick, setPick] = React.useState(seedApps[2].id);
  const app = apps.find((a) => a.id === open) ?? null;
  const picked = apps.find((a) => a.id === pick) ?? apps[0];
  const pending = apps.filter((a) => a.stage < 6);
  const cfaPipe = pending.reduce((s, a) => s + cfa(a.kw), 0);
  const over = apps.filter((a) => a.stage < 6 && a.days > STAGE_SLA[a.stage]);
  const netMeter = apps.filter((a) => a.stage === 3 || a.stage === 4 || a.stage === 1);

  function advance(a: SubsidyApp) {
    if (a.stage >= 6) return;
    setApps((cur) => cur.map((x) => (x.id === a.id ? { ...x, stage: x.stage + 1, days: 0 } : x)));
    setDocs((d) => ({ ...d, [a.id]: new Set([...(d[a.id] ?? []), ...docsFor(a.stage + 1)]) }));
    toast.success(`${a.customer}: ${PMSG[a.stage + 1]}`, { description: `${a.id} · updated on the PM Surya Ghar portal` });
    desk.log(`${a.customer} subsidy file → ${PMSG[a.stage + 1]}`, a.stage + 1 === 6 ? "ok" : "info");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Files in progress" value={pending.length} hint="PM Surya Ghar, residential" icon={FileCheck} trend={[7, 8, 8, 9, 10, 10, pending.length]} />
        <Stat label="Past DISCOM SLA" value={over.length} delta="+1" deltaGood={false} hint="AVVNL portal link broken" icon={AlertTriangle} tone="late" trend={[1, 1, 2, 1, 2, 2, over.length]} />
        <Stat label="CFA in pipeline" value={inr(cfaPipe, { compact: true })} hint="to customers' accounts" icon={Landmark} tone="info" trend={[4.1, 4.6, 5.0, 5.4, 5.9, 6.1, cfaPipe / 1e5]} />
        <Stat label="Registration → CFA" value="47 days" delta="-6" deltaGood={false} hint="median, last 20 files" icon={Timer} tone="ok" trend={[61, 58, 56, 53, 51, 49, 47]} />
      </div>

      <Panel title="Portal stages" sub="Every file on the PM Surya Ghar national portal, by stage">
        <div className="grid gap-2 sm:grid-cols-4 xl:grid-cols-7">
          {PMSG.map((s, i) => {
            const list = apps.filter((a) => a.stage === i);
            const late = list.filter((a) => a.days > STAGE_SLA[i] && i < 6).length;
            return (
              <div key={s} className="rounded-[12px] border border-d-line p-3" style={{ background: i === 6 ? "color-mix(in oklab, var(--d-ok) 7%, var(--d-panel))" : undefined }}>
                <p className="text-[11px] font-medium text-d-mute">
                  {i + 1}. {s}
                </p>
                <p className="desk-h tnum mt-1 text-[26px] font-semibold leading-none">{list.length}</p>
                <p className="mt-1 text-[11px]">{late ? <span className="text-d-late">{late} past SLA</span> : <span className="text-d-mute">{STAGE_SLA[i] ? `SLA ${STAGE_SLA[i]} d` : "complete"}</span>}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {list.map((a) => (
                    <button key={a.id} type="button" onClick={() => setOpen(a.id)} title={a.customer} className="h-5 rounded-full px-1.5 text-[10px] font-semibold" style={{ background: a.days > STAGE_SLA[i] && i < 6 ? "var(--d-late)" : "var(--d-soft)", color: a.days > STAGE_SLA[i] && i < 6 ? "#fff" : "var(--d-ink)" }}>
                      {a.customer.split(" ").slice(-1)[0]}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel title="Applications" sub="Click a row for the stage timeline. Select rows to chase DISCOMs in one go.">
          <DataTable
            rows={apps}
            rowKey={(a) => a.id}
            search={(a) => `${a.id} ${a.customer} ${a.office}`}
            searchPlaceholder="Search file, customer or AEn office"
            filter={{ get: (a) => a.discom, options: ["JVVNL", "AVVNL"] }}
            onRow={(a) => setOpen(a.id)}
            bulk={[{ label: "Chase DISCOM on WhatsApp", run: (k) => { toast.success(`${k.length} AEn offices chased`); desk.log(`DISCOM chased for ${k.length} subsidy files`, "info"); } }]}
            columns={[
              { key: "id", label: "File", render: (a) => <span className="font-mono text-[11.5px]">{a.id}</span>, sort: (a) => a.id },
              { key: "c", label: "Consumer", render: (a) => <span className="font-medium">{a.customer}</span>, sort: (a) => a.customer },
              { key: "kw", label: "kW", align: "right", render: (a) => <span className="tnum font-mono">{a.kw}</span>, sort: (a) => a.kw },
              { key: "d", label: "DISCOM", render: (a) => <span className="text-d-mute">{a.discom} · {a.office}</span>, wide: true },
              { key: "st", label: "Stage", render: (a) => <Pill tone={a.stage === 6 ? "ok" : a.days > STAGE_SLA[a.stage] ? "late" : "info"}>{PMSG[a.stage]}</Pill>, sort: (a) => a.stage },
              { key: "days", label: "Days", align: "right", render: (a) => <span className="tnum font-mono" style={{ color: a.stage < 6 && a.days > STAGE_SLA[a.stage] ? "var(--d-late)" : undefined }}>{a.stage === 6 ? "—" : a.days}</span>, sort: (a) => a.days },
              { key: "cfa", label: "CFA", align: "right", render: (a) => <span className="tnum font-mono">{inr(cfa(a.kw))}</span>, wide: true },
            ]}
          />
        </Panel>
        <Panel icon={FileCheck} title="Documents" sub="Tick as Kavita uploads. Missing documents block the next stage." action={
          <select className="h-8 rounded-[8px] border border-d-line bg-d-panel px-2 text-[12px]" value={pick} onChange={(e) => setPick(e.target.value)}>
            {apps.map((a) => (
              <option key={a.id} value={a.id}>
                {a.customer}
              </option>
            ))}
          </select>
        }>
          <div className="mb-2 flex items-center gap-2">
            <Meter value={docs[picked.id]?.size ?? 0} max={DOCS.length} tone={(docs[picked.id]?.size ?? 0) === DOCS.length ? "ok" : "accent"} />
            <span className="font-mono text-[11.5px] text-d-mute">
              {docs[picked.id]?.size ?? 0}/{DOCS.length}
            </span>
          </div>
          <Checklist
            items={DOCS.map((d) => ({ ...d, done: docs[picked.id]?.has(d.id) ?? false }))}
            onToggle={(id) => {
              setDocs((cur) => {
                const s = new Set(cur[picked.id] ?? []);
                if (s.has(id)) s.delete(id);
                else s.add(id);
                return { ...cur, [picked.id]: s };
              });
              desk.log(`${picked.customer}: ${DOCS.find((d) => d.id === id)?.label} updated`);
            }}
          />
        </Panel>
      </div>

      <Panel icon={Zap} title="DISCOM clocks" sub="Feasibility, inspection and net-meter installation against the DISCOM's own timelines">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {netMeter.map((a) => {
            const left = (STAGE_SLA[a.stage] - a.days) * 24 + 7;
            const late = left <= 0;
            return (
              <div key={a.id} className="rounded-[14px] border p-3.5" style={{ borderColor: late ? "var(--d-late)" : "var(--d-line)" }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold">{a.customer}</p>
                    <p className="truncate text-[12px] text-d-mute">
                      {a.discom} · {a.office} · {PMSG[a.stage]}
                    </p>
                  </div>
                  <Pill tone={a.discom === "JVVNL" ? "info" : "accent"}>{a.discom}</Pill>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  {late ? (
                    <span className="text-[13px] font-semibold text-d-late">{a.days - STAGE_SLA[a.stage]} day{a.days - STAGE_SLA[a.stage] === 1 ? "" : "s"} past SLA</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-d-sunk px-2 py-0.5 text-[12px]">
                      <Timer className="h-3 w-3" /> <Countdown compact inHours={left} />
                    </span>
                  )}
                  <Btn size="sm" variant={late ? "danger" : "soft"} onClick={() => { toast.success(late ? "Escalation letter sent to XEn" : "Reminder sent to AEn", { description: `${a.office}, ${a.discom}` }); desk.log(`${late ? "Escalated" : "Chased"} ${a.customer} with ${a.discom} ${a.office}`, late ? "warn" : "info"); }}>
                    {late ? "Escalate to XEn" : "Chase AEn"}
                  </Btn>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Sheet
        open={!!app}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={app ? `${app.id} · ${app.discom}` : ""}
        title={app?.customer ?? ""}
        sub={app ? `${app.kw} kW · ${app.city} · ${app.funding}${app.adjusted ? " · subsidy-adjusted price" : ""}` : ""}
        footer={
          <>
            <Btn icon={FileCheck} onClick={() => { if (app) { setPick(app.id); setOpen(null); } }}>
              Documents
            </Btn>
            <Btn variant="solid" disabled={!app || app.stage >= 6} onClick={() => app && advance(app)}>
              {app && app.stage < 6 ? `Mark ${PMSG[app.stage + 1]}` : "Complete"}
            </Btn>
          </>
        }
      >
        {app && (
          <div className="space-y-5">
            <KV
              items={[
                { k: "CFA", v: inr(cfa(app.kw)) },
                { k: "AEn office", v: app.office },
                { k: "At this stage", v: app.stage === 6 ? "Done" : `${app.days} days (SLA ${STAGE_SLA[app.stage]})` },
                { k: "Documents", v: `${docs[app.id]?.size ?? 0} of ${DOCS.length}` },
              ]}
            />
            <ol className="relative space-y-3 before:absolute before:bottom-2 before:left-[9px] before:top-2 before:w-px before:bg-d-line">
              {PMSG.map((s, i) => (
                <li key={s} className="relative flex items-center gap-3 pl-7">
                  <span className="absolute left-0 flex h-[19px] w-[19px] items-center justify-center rounded-full border-2" style={{ borderColor: i <= app.stage ? "var(--d-ok)" : "var(--d-line)", background: i < app.stage ? "var(--d-ok)" : "var(--d-panel)" }}>
                    {i < app.stage && <CheckCheck className="h-2.5 w-2.5 text-white" />}
                  </span>
                  <span className={`text-[13.5px] ${i === app.stage ? "font-semibold" : i > app.stage ? "text-d-mute" : ""}`}>{s}</span>
                  {i === app.stage && app.stage < 6 && <Pill tone={app.days > STAGE_SLA[i] ? "late" : "info"}>{app.days} d here</Pill>}
                </li>
              ))}
            </ol>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ============================================================
   Projects, crews & stores
   ============================================================ */

function ProjectsModule() {
  const desk = useDesk();
  const [view, setView] = React.useState<"Installs" | "Stores">("Installs");
  const [projects, setProjects] = React.useState(seedProjects);
  const [crewOf, setCrewOf] = React.useState<Record<string, string>>(() => Object.fromEntries(seedProjects.map((p) => [p.id, p.crew])));
  const [dispatch, setDispatch] = React.useState(seedDispatch);
  const [open, setOpen] = React.useState<string | null>(null);
  const [stockOpen, setStockOpen] = React.useState<Sku | null>(null);
  const project = projects.find((p) => p.id === open) ?? null;

  const rows: GanttRow[] = projects.map((p) => ({
    id: p.id,
    title: p.name,
    sub: `${p.kwp} kWp · ${p.place} · Crew ${crewOf[p.id]}`,
    swatch: p.kwp >= 40 ? "linear-gradient(135deg,#1f4d3a,#2e7d4f)" : "linear-gradient(135deg,#eba400,#ffd34d)",
    bars: p.plan.map(([from, to], i) => ({ from, to, tone: (i < p.done ? "ok" : p.lateAt === i ? "late" : i === p.done ? "accent" : "neutral") as Tone, dashed: i > p.done })),
    flag: p.plan[4][1],
    badge: p.lateAt !== undefined && p.lateAt >= p.done ? { at: (p.plan[p.lateAt][0] + p.plan[p.lateAt][1]) / 2, label: `${PHASES[p.lateAt]} late` } : undefined,
  }));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Active installs" value={projects.filter((p) => p.done < 5).length} hint={`${r2(projects.reduce((a, p) => a + p.kwp, 0))} kWp`} icon={Hammer} trend={[5, 6, 6, 7, 8, 8, projects.filter((p) => p.done < 5).length]} />
        <Stat label="Running late" value={projects.filter((p) => p.lateAt !== undefined && p.lateAt >= p.done).length} delta="+1" deltaGood={false} hint="Bhandari purlins, TOPCon short" icon={AlertTriangle} tone="late" trend={[1, 1, 2, 1, 2, 3, 3]} />
        <Stat label="Crew utilisation" value="87%" delta="+4%" hint="4 crews, 21 people" icon={Users} tone="ok" trend={[74, 78, 80, 83, 82, 85, 87]} />
        <Stat label="Stock value" value={inr(skus.reduce((a, s) => a + s.stock * s.rate, 0), { compact: true })} hint={`${skus.filter((s) => s.stock - s.reserved < s.reorder * 0.5).length} SKUs below reorder`} icon={Warehouse} tone="info" trend={[96, 92, 88, 84, 90, 86, skus.reduce((a, s) => a + s.stock * s.rate, 0) / 1e5]} />
      </div>
      <Segmented options={["Installs", "Stores"] as const} value={view} onChange={setView} />

      {view === "Installs" ? (
        <>
          <Panel title="Install plan" sub="Material → structure → modules → wiring → commissioning. Gold is today's phase; the pin is the promised commissioning date." live>
            <Gantt
              rows={rows}
              days={34}
              ticks={[0, 7, 14, 21, 28].map((d) => ({ at: d, label: dayLabel(d) }))}
              today={{ at: PTODAY, label: "Today" }}
              markers={[{ at: 18, label: "Month close", tone: "info" }]}
              onRow={(r) => setOpen(r.id)}
              labelWidth={250}
              actions={(r) => {
                const p = projects.find((x) => x.id === r.id)!;
                return (
                  <>
                    <IconBtn
                      icon={CheckCheck}
                      label={p.done < 5 ? `Mark ${PHASES[p.done]} done` : "Commissioned"}
                      onClick={() => {
                        if (p.done >= 5) return;
                        setProjects((cur) => cur.map((x) => (x.id === p.id ? { ...x, done: x.done + 1 } : x)));
                        toast.success(`${p.name}: ${PHASES[p.done]} done`, { description: p.done + 1 === 5 ? "Commissioned. Subsidy file moves to Installed." : `Next: ${PHASES[p.done + 1]}` });
                        desk.log(`${p.id} ${PHASES[p.done]} done`, "ok");
                      }}
                    />
                    <IconBtn icon={ClipboardList} label="Open job" onClick={() => setOpen(p.id)} />
                  </>
                );
              }}
            />
          </Panel>
          <div className="grid gap-5 xl:grid-cols-[1fr_1.1fr]">
            <Panel icon={Users} title="Crews today" sub="Change a job's crew and the plan re-routes">
              <div className="space-y-3">
                {crews.map((c) => {
                  const jobs = projects.filter((p) => crewOf[p.id] === c.id && p.done < 5);
                  const load = jobs.reduce((a, p) => a + (p.kwp >= 40 ? 3 : 1), 0);
                  return (
                    <div key={c.id} className="rounded-[12px] border border-d-line p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[14px] font-semibold">
                            Crew {c.id} · {c.lead}
                          </p>
                          <p className="text-[11.5px] text-d-mute">
                            {c.size} people · {c.van} · {c.base} · {c.skill}
                          </p>
                        </div>
                        <Pill tone={load > 4 ? "late" : load > 2 ? "warn" : "ok"} mono>
                          {jobs.length} jobs
                        </Pill>
                      </div>
                      <Meter value={Math.min(load, 6)} max={6} tone={load > 4 ? "late" : "accent"} className="mt-2" />
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {jobs.map((p) => (
                          <li key={p.id}>
                            <select
                              value={crewOf[p.id]}
                              onChange={(e) => {
                                setCrewOf((cur) => ({ ...cur, [p.id]: e.target.value }));
                                toast.success(`${p.name} → Crew ${e.target.value}`, { description: `${crews.find((x) => x.id === e.target.value)?.lead} notified on WhatsApp` });
                                desk.log(`${p.id} reassigned to Crew ${e.target.value}`);
                              }}
                              className="h-7 rounded-full border border-d-line bg-d-sunk px-2 text-[11.5px]"
                              aria-label={`Crew for ${p.name}`}
                            >
                              {crews.map((x) => (
                                <option key={x.id} value={x.id}>
                                  {p.id} · Crew {x.id}
                                </option>
                              ))}
                            </select>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </Panel>
            <Panel icon={Truck} title="Material dispatch" sub="Kits built from the design BOM. Tap to move a slip along.">
              <ul className="space-y-2">
                {dispatch.map((d) => {
                  const i = DISPATCH_FLOW.indexOf(d.status);
                  return (
                    <li key={d.id} className="rounded-[12px] border border-d-line p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold">
                            <span className="font-mono text-[11.5px] text-d-mute">{d.id}</span> {d.project}
                          </p>
                          <p className="mt-0.5 text-[12px] text-d-mute">{d.items}</p>
                        </div>
                        {i < 3 ? (
                          <Btn
                            size="sm"
                            variant="soft"
                            onClick={() => {
                              const next = DISPATCH_FLOW[i + 1];
                              setDispatch((cur) => cur.map((x) => (x.id === d.id ? { ...x, status: next, vehicle: x.vehicle === "Not assigned" ? "RJ14 GD 4471" : x.vehicle } : x)));
                              toast.success(`${d.id}: ${next}`, { description: d.project });
                              desk.log(`${d.id} ${next.toLowerCase()}`);
                            }}
                          >
                            → {DISPATCH_FLOW[i + 1]}
                          </Btn>
                        ) : (
                          <Pill tone="ok">On site</Pill>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-1">
                        {DISPATCH_FLOW.map((s, k) => (
                          <span key={s} className="h-1.5 flex-1 rounded-full" style={{ background: k <= i ? "var(--d-accent)" : "var(--d-sunk)" }} />
                        ))}
                        <span className="ml-2 font-mono text-[10.5px] text-d-mute">{d.vehicle}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          </div>
        </>
      ) : (
        <>
          <Panel icon={ClipboardList} title="POs to distributors" sub="Raised by Dispatch Planner from the next 3 weeks of bookings" action={<Pill tone="warn" mono>{purchaseOrders.length} · {inr(purchaseOrders.reduce((a, p) => a + p.amount, 0), { compact: true })}</Pill>}>
            <ApprovalQueue items={purchaseOrders.map((p) => ({ ...p, amount: inr(p.amount), tone: p.meta === "Urgent" ? ("late" as Tone) : ("warn" as Tone) }))} onDecide={(id, d) => d && desk.log(`${id} ${d}`, d === "approved" ? "ok" : "warn")} />
          </Panel>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <Panel title="Stock register" sub="Free = in stock minus reserved for booked jobs. Click a row for movements.">
              <DataTable
                rows={skus}
                rowKey={(s) => s.sku}
                search={(s) => `${s.sku} ${s.item} ${s.vendor}`}
                searchPlaceholder="Search SKU, item or vendor"
                filter={{ get: (s) => s.cat, options: ["Modules", "Inverters", "BOS", "Structure"] }}
                onRow={setStockOpen}
                pageSize={8}
                columns={[
                  { key: "item", label: "Item", render: (s) => <span><span className="block font-medium">{s.item}</span><span className="font-mono text-[10.5px] text-d-mute">{s.sku}</span></span>, sort: (s) => s.item },
                  { key: "stock", label: "In stock", align: "right", render: (s) => <span className="tnum font-mono">{num(s.stock)}</span>, sort: (s) => s.stock },
                  { key: "res", label: "Reserved", align: "right", render: (s) => <span className="tnum font-mono text-d-mute">{num(s.reserved)}</span> },
                  { key: "free", label: "Free", align: "right", render: (s) => <span className="tnum font-mono font-semibold" style={{ color: s.stock - s.reserved < 0 ? "var(--d-late)" : undefined }}>{num(s.stock - s.reserved)} {s.unit}</span>, sort: (s) => s.stock - s.reserved },
                  {
                    key: "cover",
                    label: "vs reorder",
                    render: (s) => {
                      const f = s.stock - s.reserved;
                      return (
                        <div className="flex min-w-[100px] items-center gap-2">
                          <Meter value={Math.max(0, f)} max={s.reorder} tone={f >= s.reorder ? "ok" : f > 0 ? "warn" : "late"} />
                        </div>
                      );
                    },
                    sort: (s) => (s.stock - s.reserved) / s.reorder,
                  },
                  { key: "val", label: "Value", align: "right", render: (s) => <span className="tnum font-mono text-[12px]">{inr(s.stock * s.rate, { compact: true })}</span>, wide: true, sort: (s) => s.stock * s.rate },
                ]}
              />
            </Panel>
            <Panel title="Modules by wattage" sub="Free stock, in kWp">
              <HBars
                format={(v) => `${r2(v)} kWp`}
                data={skus
                  .filter((s) => s.cat === "Modules")
                  .map((s) => ({ label: s.item.split(" ").slice(0, 3).join(" "), value: Math.max(0, ((s.stock - s.reserved) * Number(s.item.match(/(\d{3}) Wp/)?.[1] ?? 0)) / 1000), sub: s.stock - s.reserved < 0 ? "short" : undefined, tone: (s.stock - s.reserved < 0 ? "late" : "accent") as Tone }))}
              />
              <div className="mt-5">
                <Bars
                  height={150}
                  format={(v) => `${v}`}
                  data={[
                    { label: "W 545", value: 88, tone: "accent" },
                    { label: "A 550", value: 90, tone: "info" },
                    { label: "V 580", value: 0, tone: "late", note: "short 38" },
                    { label: "GW 3k", value: 3, tone: "ok" },
                    { label: "GW 5k", value: 0, tone: "late", note: "short 1" },
                  ]}
                />
                <p className="mt-1 text-[11.5px] text-d-mute">Free units after reservations. Vikram 580 and Growatt 5 kW are short.</p>
              </div>
            </Panel>
          </div>
        </>
      )}

      <Sheet
        open={!!project}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={project ? `${project.id} · Crew ${crewOf[project.id]}` : ""}
        title={project?.name ?? ""}
        sub={project ? `${project.kwp} kWp · ${project.place} · contract ${inr(project.value, { compact: true })}` : ""}
        footer={
          <>
            <Btn icon={Send} onClick={() => { toast.success("Progress photos sent to customer"); desk.log(`${project?.id} progress shared with customer`); }}>
              Share progress
            </Btn>
            <Btn variant="solid" onClick={() => setOpen(null)}>
              Done
            </Btn>
          </>
        }
      >
        {project && (
          <div className="space-y-4">
            <ul className="space-y-1.5">
              {PHASES.map((ph, i) => (
                <li key={ph} className="flex items-center gap-3 rounded-[10px] border border-d-line px-3 py-2">
                  <span className="h-3 w-3 rounded-full" style={{ background: i < project.done ? "var(--d-ok)" : project.lateAt === i ? "var(--d-late)" : i === project.done ? "var(--d-accent)" : "var(--d-sunk)" }} />
                  <span className="flex-1 text-[13.5px] font-medium">{ph}</span>
                  <span className="font-mono text-[11.5px] text-d-mute">
                    {dayLabel(project.plan[i][0])} – {dayLabel(project.plan[i][1])}
                  </span>
                  <Pill tone={i < project.done ? "ok" : project.lateAt === i ? "late" : "neutral"}>{i < project.done ? "done" : project.lateAt === i ? "late" : i === project.done ? "now" : "planned"}</Pill>
                </li>
              ))}
            </ul>
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Site checklist</p>
              <Checklist
                items={[
                  { id: "a", label: "Structure anchored, torque marked", done: project.done > 1 },
                  { id: "b", label: "Module serials photographed (DCR)", done: project.done > 2 },
                  { id: "c", label: "Earthing < 5 Ω, LA installed", done: project.done > 3 },
                  { id: "d", label: "Inverter on Wi-Fi, app handed over", done: project.done > 4 },
                ]}
                onToggle={(id) => toast(`Checklist item ${id} updated`, { description: "Photo required from site" })}
              />
            </div>
          </div>
        )}
      </Sheet>
      <Sheet
        open={!!stockOpen}
        onOpenChange={(o) => !o && setStockOpen(null)}
        eyebrow={stockOpen?.sku}
        title={stockOpen?.item ?? ""}
        sub={stockOpen ? `${stockOpen.vendor} · ${inr(stockOpen.rate)} per ${stockOpen.unit.replace(/s$/, "")}` : ""}
        footer={
          <Btn
            variant="solid"
            icon={Plus}
            onClick={() => {
              toast.success("PO drafted", { description: `${stockOpen?.item} · ${stockOpen?.reorder} ${stockOpen?.unit} from ${stockOpen?.vendor}` });
              desk.log(`PO drafted for ${stockOpen?.item}`);
              setStockOpen(null);
            }}
          >
            Draft reorder PO
          </Btn>
        }
      >
        {stockOpen && (
          <div className="space-y-4">
            <KV items={[{ k: "In stock", v: `${num(stockOpen.stock)} ${stockOpen.unit}` }, { k: "Reserved", v: num(stockOpen.reserved) }, { k: "Reorder at", v: num(stockOpen.reorder) }, { k: "Value", v: inr(stockOpen.stock * stockOpen.rate) }]} />
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Recent movements</p>
              <ul className="divide-y divide-d-line text-[13px]">
                {[
                  { d: "19 Oct", t: "Issued to DS-1041", q: -Math.ceil(stockOpen.reserved / 3) },
                  { d: "17 Oct", t: "GRN from vendor", q: Math.ceil(stockOpen.reorder / 2) },
                  { d: "15 Oct", t: "Issued to DS-1038", q: -Math.ceil(stockOpen.reserved / 4) },
                ].map((m) => (
                  <li key={m.d + m.t} className="flex items-center justify-between py-2">
                    <span>
                      <span className="font-mono text-[11.5px] text-d-mute">{m.d}</span> {m.t}
                    </span>
                    <span className="tnum font-mono" style={{ color: m.q > 0 ? "var(--d-ok)" : undefined }}>
                      {m.q > 0 ? "+" : ""}
                      {num(m.q)}
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

/* ============================================================
   O&M & tickets
   ============================================================ */

function OmModule({ tickets, setTickets }: { tickets: OmTicket[]; setTickets: React.Dispatch<React.SetStateAction<OmTicket[]>> }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<string | null>(null);
  const [cleaning, setCleaning] = React.useState(seedCleaning);
  const [renewed, setRenewed] = React.useState<Set<string>>(new Set());
  const ticket = tickets.find((t) => t.id === open) ?? null;
  const flow: TicketStatus[] = ["Open", "Assigned", "On site", "Resolved"];
  const openList = tickets.filter((t) => t.status !== "Resolved");
  const plantName = (id: string) => plants.find((p) => p.id === id)?.name ?? id;

  function setStatus(t: OmTicket, status: TicketStatus) {
    setTickets((cur) => cur.map((x) => (x.id === t.id ? { ...x, status } : x)));
    toast.success(`${t.id} → ${status}`, { description: `${plantName(t.plant)}${t.string ? ` ${t.string}` : ""} · ${t.tech}` });
    desk.log(`${t.id} ${status.toLowerCase()} (${plantName(t.plant)})`, status === "Resolved" ? "ok" : "info");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open tickets" value={openList.length} hint={`${openList.filter((t) => t.priority === "High").length} high priority`} icon={Ticket} tone="warn" delta="+1" deltaGood={false} trend={[3, 4, 3, 5, 4, 3, openList.length]} />
        <Stat label="Avg time to fix" value="19 h" delta="-4 h" deltaGood={false} hint="last 30 tickets" icon={Timer} tone="ok" trend={[31, 28, 26, 24, 22, 21, 19]} />
        <Stat label="Fleet PR, 30 days" value="79.4%" delta="-1.1%" hint="dust season" icon={GaugeIcon} trend={[81.2, 81, 80.8, 80.4, 80.1, 79.8, 79.4]} />
        <Stat label="AMC renewals, 90 days" value={inr(amcs.reduce((a, x) => a + x.value, 0), { compact: true })} hint={`${amcs.length} contracts`} icon={Leaf} tone="info" trend={[2.1, 2.6, 3.4, 4.2, 4.8, 5.1, 5.4]} />
      </div>
      <Panel title="Tickets" sub="Click a row for the detail. The status button moves it along.">
        <DataTable
          rows={tickets}
          rowKey={(t) => t.id}
          search={(t) => `${t.id} ${plantName(t.plant)} ${t.kind} ${t.tech}`}
          searchPlaceholder="Search ticket, plant or technician"
          filter={{ get: (t) => t.status, options: flow }}
          onRow={(t) => setOpen(t.id)}
          columns={[
            { key: "id", label: "Ticket", render: (t) => <span className="font-mono text-[12px] font-medium">{t.id}</span>, sort: (t) => t.id },
            { key: "p", label: "Plant", render: (t) => <span><span className="block font-medium">{plantName(t.plant)}</span><span className="text-[11px] text-d-mute">{t.string ?? "Plant-level"} · raised {t.raised}</span></span>, sort: (t) => plantName(t.plant) },
            { key: "k", label: "Issue", render: (t) => <Pill tone={t.kind === "Inverter trip" || t.kind === "Earth fault" ? "late" : t.kind === "Soiling" ? "warn" : "info"}>{t.kind}</Pill> },
            { key: "tech", label: "Technician", render: (t) => <span className="text-d-mute">{t.tech}</span>, wide: true },
            { key: "loss", label: "kWh/day at stake", align: "right", render: (t) => <span className="tnum font-mono">{t.loss || "—"}</span>, sort: (t) => t.loss, wide: true },
            {
              key: "st",
              label: "Status",
              render: (t) => {
                const i = flow.indexOf(t.status);
                return i < 3 ? (
                  <Btn size="sm" variant={t.status === "Open" ? "solid" : "soft"} onClick={(e) => { e.stopPropagation(); setStatus(t, flow[i + 1]); }}>
                    {t.status} → {flow[i + 1]}
                  </Btn>
                ) : (
                  <Pill tone="ok">Resolved</Pill>
                );
              },
            },
          ]}
        />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <Panel icon={Droplets} title="Cleaning rounds this week" sub="Click a cell to mark a wash done. Dust season: residential fortnightly, C&I weekly.">
          <div className="desk-scroll overflow-x-auto">
            <table className="w-full min-w-[560px] border-separate border-spacing-1 text-[12px]">
              <thead>
                <tr className="text-[11px] text-d-mute">
                  <th className="text-left font-medium">Plant</th>
                  {DAYS.map((d) => (
                    <th key={d} className="font-medium">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plants.map((p) => (
                  <tr key={p.id}>
                    <td className="truncate pr-2 font-medium">{p.name}</td>
                    {cleaning[p.id].map((c, di) => (
                      <td key={`${p.id}-${di}`}>
                        <button
                          type="button"
                          onClick={() => {
                            const next: Clean = c === "done" ? "due" : c === "none" ? "due" : "done";
                            setCleaning((cur) => ({ ...cur, [p.id]: cur[p.id].map((x, k) => (k === di ? next : x)) as Clean[] }));
                            if (next === "done") {
                              toast.success(`${p.name} washed`, { description: `${DAYS[di]} · photo proof sent to customer` });
                              desk.log(`Cleaning done at ${p.name}`, "ok");
                            }
                          }}
                          className="h-8 w-full rounded-[7px] text-[10.5px] font-semibold transition-transform hover:scale-105"
                          style={{
                            background: c === "done" ? "var(--d-ok)" : c === "due" ? "var(--d-soft)" : c === "missed" ? "color-mix(in oklab, var(--d-late) 14%, var(--d-panel))" : "var(--d-sunk)",
                            color: c === "done" ? "#fff" : c === "missed" ? "var(--d-late)" : "var(--d-ink)",
                            border: c === "due" ? "1px dashed var(--d-accent)" : "1px solid transparent",
                          }}
                        >
                          {c === "done" ? "✓" : c === "due" ? "due" : c === "missed" ? "missed" : ""}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="Generation vs expected, 30 days" sub="Weather-corrected. Below 90% earns a visit.">
          <HBars
            max={100}
            format={(v) => `${v}%`}
            onSelect={(label) => {
              const p = plants.find((x) => x.name === label);
              if (p) toast(`${p.name}: ${monthPerf[p.id]}% of expected`, { description: p.strings.find((s) => s.issue)?.note ?? "No open issues" });
            }}
            data={plants.map((p) => ({ label: p.name, value: monthPerf[p.id], sub: `${p.kwp} kWp`, tone: (monthPerf[p.id] >= 95 ? "ok" : monthPerf[p.id] >= 90 ? "accent" : "late") as Tone })).sort((a, b) => a.value - b.value)}
          />
        </Panel>
      </div>
      <Panel icon={CalendarClock} title="AMC renewals" sub="Renewal quotes go out 30 days ahead on WhatsApp">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {amcs.map((a) => {
            const p = plants.find((x) => x.id === a.plant)!;
            const done = renewed.has(a.plant);
            return (
              <div key={a.plant} className="rounded-[14px] border border-d-line p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold">{p.name}</p>
                    <p className="truncate text-[12px] text-d-mute">{a.plan}</p>
                  </div>
                  <span className="font-mono text-[13px] font-semibold">{inr(a.value, { compact: true })}</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-d-sunk px-2 py-0.5 text-[12px]" style={{ color: a.inDays < 15 ? "var(--d-late)" : undefined }}>
                    <Timer className="h-3 w-3" /> <Countdown compact inHours={a.inDays * 24} />
                  </span>
                  {done ? (
                    <Pill tone="ok">Quote sent</Pill>
                  ) : (
                    <Btn
                      size="sm"
                      variant="soft"
                      icon={Send}
                      onClick={() => {
                        setRenewed((s) => new Set(s).add(a.plant));
                        toast.success("Renewal quote sent", { description: `${p.name} · ${inr(a.value)}` });
                        desk.log(`AMC renewal quote sent to ${p.name}`, "info");
                      }}
                    >
                      {a.status === "Auto-renew" ? "Confirm" : "Send quote"}
                    </Btn>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
      <Sheet
        open={!!ticket}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={ticket ? `${ticket.id} · ${ticket.priority} priority` : ""}
        title={ticket ? `${plantName(ticket.plant)}${ticket.string ? ` · ${ticket.string}` : ""}` : ""}
        sub={ticket ? `${ticket.kind} · raised ${ticket.raised}` : ""}
        footer={
          <>
            <Btn icon={MessageCircle} onClick={() => { toast.success("Customer updated on WhatsApp"); desk.log(`${ticket?.id} customer updated`); }}>
              Update customer
            </Btn>
            {ticket && ticket.status !== "Resolved" && (
              <Btn variant="solid" onClick={() => { setStatus(ticket, "Resolved"); setOpen(null); }}>
                Mark resolved
              </Btn>
            )}
          </>
        }
      >
        {ticket && (
          <div className="space-y-4">
            <p className="text-[14px] leading-relaxed">{ticket.detail}</p>
            <KV items={[{ k: "Status", v: ticket.status }, { k: "Generation at stake", v: ticket.loss ? `${ticket.loss} kWh/day` : "None" }, { k: "Plant", v: plants.find((p) => p.id === ticket.plant)?.place ?? "" }, { k: "Inverter", v: plants.find((p) => p.id === ticket.plant)?.inverter ?? "" }]} />
            <Field label="Technician">
              <select
                className={inputClass}
                value={ticket.tech}
                onChange={(e) => {
                  setTickets((cur) => cur.map((x) => (x.id === ticket.id ? { ...x, tech: e.target.value, status: x.status === "Open" ? "Assigned" : x.status } : x)));
                  desk.log(`${ticket.id} assigned to ${e.target.value}`);
                }}
              >
                {["Manoj Kumawat", "Dinesh Bairwa", "Bablu Meghwal", "Kavita Rathore"].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </Field>
            <Segmented size="sm" options={flow} value={ticket.status} onChange={(s) => setStatus(ticket, s)} />
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ============================================================
   Payments
   ============================================================ */

function PaymentsModule({ apps }: { apps: SubsidyApp[] }) {
  const desk = useDesk();
  const [accounts, setAccounts] = React.useState(seedAccounts);
  const [open, setOpen] = React.useState<string | null>(null);
  const acc = accounts.find((a) => a.id === open) ?? null;
  const due = accounts.reduce((s, a) => s + msDue(a), 0);
  const overdue = accounts.reduce((s, a) => s + a.ms.filter((m) => m.state === "overdue").reduce((x, m) => x + (a.value * m.pct) / 100, 0), 0);
  const adjusted = apps.filter((a) => a.adjusted);
  const cfaReady = adjusted.filter((a) => a.stage === 6).reduce((s, a) => s + cfa(a.kw), 0);
  const cfaWaiting = adjusted.filter((a) => a.stage < 6).reduce((s, a) => s + cfa(a.kw), 0);

  function receive(a: Account, label: string) {
    setAccounts((cur) => cur.map((x) => (x.id === a.id ? { ...x, ms: x.ms.map((m) => (m.label === label ? { ...m, state: "received" as MsState, date: "20 Oct" } : m)) } : x)));
    const m = a.ms.find((x) => x.label === label)!;
    toast.success(`${inr((a.value * m.pct) / 100)} received`, { description: `${a.customer} · ${label} · posted to Tally` });
    desk.log(`${a.customer} paid ${label.toLowerCase()} milestone, ${inr((a.value * m.pct) / 100)}`, "ok");
  }
  const msTone: Record<MsState, Tone> = { received: "ok", due: "warn", overdue: "late", upcoming: "neutral" };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Milestones due now" value={inr(due, { compact: true })} hint={`${accounts.filter((a) => msDue(a) > 0).length} customers`} icon={IndianRupee} tone="warn" delta="-8%" deltaGood={false} trend={[19, 18.2, 17.5, 16.1, 15.4, 14.6, due / 1e5]} />
        <Stat label="Overdue" value={inr(overdue, { compact: true })} hint="Adarsh Vidya Mandir ₹11.3 L, Ganesh Polymers ₹6 L" icon={AlertTriangle} tone="late" trend={[8.4, 8.9, 9.6, 10.2, 11.1, 11.8, overdue / 1e5]} />
        <Stat label="Subsidy-adjusted, collect now" value={inr(cfaReady, { compact: true })} hint={`${inr(cfaWaiting, { compact: true })} still with the portal`} icon={Landmark} tone="info" trend={[0.8, 1.6, 0.8, 1.6, 2.3, 0.8, cfaReady / 1e5]} />
        <Stat label="Collected in October" value="₹74.6 L" delta="+18%" hint="vs September" icon={Receipt} tone="ok" trend={[38, 44, 51, 57, 63, 69, 74.6]} />
      </div>
      <Panel title="Milestones" sub="Advance 30% · on delivery 60% · on commissioning 10%. Click a due milestone when the money lands.">
        <DataTable
          rows={accounts}
          rowKey={(a) => a.id}
          search={(a) => `${a.id} ${a.customer} ${a.project} ${a.funding}`}
          searchPlaceholder="Search customer or project"
          filter={{ get: (a) => (a.ms.some((m) => m.state === "overdue") ? "Overdue" : a.ms.some((m) => m.state === "due") ? "Due" : a.ms.every((m) => m.state === "received") ? "Paid up" : "Upcoming"), options: ["Overdue", "Due", "Upcoming", "Paid up"] }}
          onRow={(a) => setOpen(a.id)}
          bulk={[{ label: "Send UPI payment links", run: (k) => { toast.success(`${k.length} payment links sent`); desk.log(`UPI links sent to ${k.length} customers`, "info"); } }]}
          columns={[
            { key: "c", label: "Customer", render: (a) => <span><span className="block font-medium">{a.customer}</span><span className="text-[11px] text-d-mute">{a.id} · {a.project}</span></span>, sort: (a) => a.customer },
            { key: "f", label: "Funding", render: (a) => <span className="text-d-mute">{a.funding}</span>, wide: true },
            { key: "v", label: "Contract", align: "right", render: (a) => <span className="tnum font-mono">{inr(a.value, { compact: true })}</span>, sort: (a) => a.value },
            {
              key: "ms",
              label: "Milestones",
              render: (a) => (
                <span className="flex flex-wrap gap-1">
                  {a.ms.map((m) => (
                    <button
                      key={m.label}
                      type="button"
                      disabled={m.state === "received" || m.state === "upcoming"}
                      onClick={(e) => {
                        e.stopPropagation();
                        receive(a, m.label);
                      }}
                      title={`${m.label} ${m.pct}% · ${m.date}`}
                      className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold disabled:cursor-default"
                      style={{ color: m.state === "upcoming" ? "var(--d-mute)" : `var(--d-${msTone[m.state]})`, background: `color-mix(in oklab, ${m.state === "upcoming" ? "var(--d-mute)" : `var(--d-${msTone[m.state]})`} 12%, transparent)` }}
                    >
                      {m.pct}% {m.state === "received" ? "✓" : m.state === "overdue" ? "overdue" : m.state === "due" ? "due" : m.date}
                    </button>
                  ))}
                </span>
              ),
            },
            { key: "d", label: "Due now", align: "right", render: (a) => <span className="tnum font-mono font-semibold">{msDue(a) ? inr(msDue(a), { compact: true }) : "—"}</span>, sort: (a) => msDue(a) },
          ]}
        />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Panel icon={Landmark} title="Subsidy-adjusted balances" sub="Customers who paid net of CFA. They owe us once the ₹78,000 lands.">
          <ul className="divide-y divide-d-line">
            {adjusted.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium">{a.customer}</p>
                  <p className="truncate text-[11.5px] text-d-mute">
                    {a.kw} kW · {a.funding} · {PMSG[a.stage]}
                  </p>
                </div>
                <span className="tnum font-mono text-[13px] font-semibold">{inr(cfa(a.kw))}</span>
                {a.stage === 6 ? (
                  <Btn size="sm" variant="solid" icon={MessageCircle} onClick={() => { toast.success("Collection message sent", { description: `${a.customer} · ${inr(cfa(a.kw))} by UPI` }); desk.log(`Asked ${a.customer} for the CFA balance`, "info"); }}>
                    Collect
                  </Btn>
                ) : (
                  <Pill tone={a.stage === 5 ? "warn" : "neutral"}>{a.stage === 5 ? `CFA ${a.days} d` : "With portal"}</Pill>
                )}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Ageing and forecast" sub="Receivables from Tally, promises from the Dues Collector">
          <AgingBar
            format={(v) => inr(v, { compact: true })}
            buckets={[
              { label: "0–15 days", value: 1462000, tone: "ok" },
              { label: "16–30 days", value: 1134000, tone: "info" },
              { label: "31–60 days", value: 24400, tone: "warn" },
              { label: "60+ days", value: 598000, tone: "late" },
            ]}
          />
          <div className="mt-5">
            <Bars
              height={160}
              format={(v) => `₹${v}L`}
              data={[
                { label: "This wk", value: 14.8, tone: "ok" },
                { label: "Next wk", value: 30.6, tone: "accent", note: "Bhandari delivery" },
                { label: "Wk 3", value: 9.4, tone: "accent" },
                { label: "Wk 4", value: 5.2, tone: "info" },
                { label: "Later", value: 6.0, tone: "late" },
              ]}
            />
          </div>
        </Panel>
      </div>
      <Sheet
        open={!!acc}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={acc ? `${acc.id} · ${acc.funding}` : ""}
        title={acc?.customer ?? ""}
        sub={acc ? `${acc.project} · contract ${inr(acc.value)}` : ""}
        footer={
          <Btn
            variant="solid"
            icon={MessageCircle}
            disabled={!acc || msDue(acc) === 0}
            onClick={() => {
              if (!acc) return;
              toast.success("Reminder sent on WhatsApp", { description: `${acc.customer} · ${inr(msDue(acc))} with UPI link` });
              desk.log(`Payment reminder to ${acc.customer} for ${inr(msDue(acc))}`, "info");
              setOpen(null);
            }}
          >
            Send reminder
          </Btn>
        }
      >
        {acc && (
          <div className="space-y-4">
            <ul className="space-y-2">
              {acc.ms.map((m) => (
                <li key={m.label} className="flex items-center gap-3 rounded-[10px] border border-d-line px-3 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-medium">
                      {m.label} · {m.pct}%
                    </span>
                    <span className="text-[11.5px] text-d-mute">{m.date}</span>
                  </span>
                  <span className="tnum font-mono text-[13px]">{inr((acc.value * m.pct) / 100)}</span>
                  {m.state === "due" || m.state === "overdue" ? (
                    <Btn size="sm" variant="soft" onClick={() => receive(acc, m.label)}>
                      Mark received
                    </Btn>
                  ) : (
                    <Pill tone={msTone[m.state]}>{m.state}</Pill>
                  )}
                </li>
              ))}
            </ul>
            {msDue(acc) > 0 && (
              <div className="rounded-[14px] bg-[#e7f6e9] p-4 text-[13.5px] leading-relaxed text-[#1d3b22]">
                Namaste {acc.customer.split(" ")[0]} ji, your {acc.project} system from Suryodaya Solar is {acc.ms.some((m) => m.label === "On commissioning" && m.state !== "upcoming") ? "commissioned and generating" : "delivered to site"}. The {acc.ms.filter((m) => m.state === "due" || m.state === "overdue").map((m) => m.label.toLowerCase()).join(" and ")} milestone of {inr(msDue(acc))} is now due. UPI link below. Thank you for going solar. — Neha, Accounts
              </div>
            )}
            {acc.cfa && <KV items={[{ k: "PM Surya Ghar CFA", v: inr(acc.cfa) }, { k: "Paid to", v: "Customer's bank account" }]} />}
          </div>
        )}
      </Sheet>
    </div>
  );
}
