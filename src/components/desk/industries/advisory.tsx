"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Bot,
  CalendarDays,
  Camera,
  Check,
  ClipboardCheck,
  Compass,
  Factory,
  FileText,
  Flame,
  Droplets,
  Gauge as GaugeIcon,
  GraduationCap,
  HandCoins,
  House,
  IndianRupee,
  MessageCircle,
  Mountain,
  Orbit,
  Package,
  Phone,
  Plug,
  Plus,
  Receipt,
  ScrollText,
  Send,
  Sparkles,
  Store,
  Timer,
  Users,
  Wind,
} from "lucide-react";
import { DeskShell, useDesk } from "../shell";
import { Bars, Donut, HBars, HeatGrid } from "../charts";
import { AgingBar, ApprovalQueue, Board, Checklist, DataTable } from "../data";
import { AgentsModule, ConnectionsModule, IndependenceModule, PeopleModule } from "../common";
import { Btn, Feed, Field, inputClass, inr, KV, Meter, Modal, Panel, Pill, Segmented, Sheet, Stat, toneVar } from "../ui";
import type { DeskConfig, DeskModule, IndependenceData, Integration, TeamMember, Tone, WorkforceAgent } from "../types";

/* ============================================================
   Data — Shipra Advisory, Ujjain. Fictional Vastu consultancy
   with a business-coaching practice. Today = Tue 20 Oct 2026.
   ============================================================ */

type ZoneId = "ne" | "n" | "nw" | "e" | "c" | "w" | "se" | "s" | "sw";
type Severity = "ok" | "warn" | "late";

const ZONES: Record<ZoneId, { name: string; dir: string; element: string; lord: string; ideal: string; icon: typeof Flame }> = {
  ne: { name: "Ishan", dir: "North-east", element: "Water", lord: "Shiva (Ishan)", ideal: "Puja, open space, water, light", icon: Droplets },
  e: { name: "Purva", dir: "East", element: "Sun", lord: "Indra, Surya", ideal: "Main door, drawing room, windows", icon: Sparkles },
  se: { name: "Agneya", dir: "South-east", element: "Fire", lord: "Agni", ideal: "Kitchen, electrical panel, boiler", icon: Flame },
  s: { name: "Dakshin", dir: "South", element: "Earth", lord: "Yama", ideal: "Bedrooms, heavy storage, staircase", icon: Mountain },
  sw: { name: "Nairutya", dir: "South-west", element: "Earth", lord: "Pitru, Nirriti", ideal: "Master bedroom, owner's seat, safe", icon: Mountain },
  w: { name: "Paschim", dir: "West", element: "Space", lord: "Varuna", ideal: "Children's room, study, dining", icon: Orbit },
  nw: { name: "Vayavya", dir: "North-west", element: "Air", lord: "Vayu", ideal: "Guest room, dispatch, finished goods", icon: Wind },
  n: { name: "Uttar", dir: "North", element: "Water", lord: "Kubera, Soma", ideal: "Cash counter, accounts, open north wall", icon: Droplets },
  c: { name: "Brahmasthan", dir: "Centre", element: "Space", lord: "Brahma", ideal: "Open, light, free of columns and load", icon: Orbit },
};
const ZONE_GRID: ZoneId[][] = [
  ["nw", "n", "ne"],
  ["w", "c", "e"],
  ["sw", "s", "se"],
];
const zoneOf = (r: number, c: number) => ZONE_GRID[Math.floor(r / 3)][Math.floor(c / 3)];

/** The 32 outer padas, keyed "row-col", NE corner clockwise. */
const PADAS: Record<string, string> = (() => {
  const names = ["Shikhi", "Parjanya", "Jayanta", "Indra", "Surya", "Satya", "Bhrisha", "Antariksha", "Agni", "Pusha", "Vitatha", "Grihakshata", "Yama", "Gandharva", "Bhringaraja", "Mriga", "Pitru", "Dauvarika", "Sugriva", "Pushpadanta", "Varuna", "Asura", "Shosha", "Papayakshma", "Roga", "Naga", "Mukhya", "Bhallata", "Soma", "Bhujaga", "Aditi", "Diti"];
  const cells: [number, number][] = [];
  for (let r = 0; r <= 8; r++) cells.push([r, 8]);
  for (let c = 7; c >= 0; c--) cells.push([8, c]);
  for (let r = 7; r >= 0; r--) cells.push([r, 0]);
  for (let c = 1; c <= 7; c++) cells.push([0, c]);
  const out: Record<string, string> = {};
  cells.forEach(([r, c], i) => (out[`${r}-${c}`] = names[i]));
  return out;
})();

type Remedy = { id: string; title: string; kind: "Placement" | "Product" | "Minor work" | "Colour"; cost: number; gain: number };
type Finding = { severity: Severity; found: string; problem: string; remedies: Remedy[] };
type Room = { label: string; x: number; y: number; w: number; h: number };
type Site = {
  id: string;
  name: string;
  owner: string;
  place: string;
  kind: "Residence" | "Factory" | "Showroom";
  plot: string;
  facing: string;
  base: number;
  entrance: { r: number; c: number; side: "n" | "e" | "s" | "w" };
  rooms: Room[];
  findings: Record<ZoneId, Finding>;
};

const ok = (found: string): Finding => ({ severity: "ok", found, problem: "In harmony with the zone. Keep it clutter-free.", remedies: [] });

const sites: Site[] = [
  {
    id: "agrawal",
    name: "Agrawal residence",
    owner: "Ashok & Sunita Agrawal",
    place: "Freeganj, Ujjain",
    kind: "Residence",
    plot: "30 × 40 ft · G+1 · 2,400 sq ft",
    facing: "East facing",
    base: 58,
    entrance: { r: 3, c: 8, side: "e" },
    rooms: [
      { label: "Toilet + OHT", x: 6, y: 0, w: 3, h: 2 },
      { label: "Drawing", x: 6, y: 2, w: 3, h: 4 },
      { label: "Kitchen", x: 6, y: 6, w: 3, h: 3 },
      { label: "Staircase", x: 3, y: 6, w: 3, h: 3 },
      { label: "Master bed", x: 0, y: 6, w: 3, h: 3 },
      { label: "Kids' room", x: 0, y: 3, w: 3, h: 3 },
      { label: "Guest + puja", x: 0, y: 0, w: 3, h: 3 },
      { label: "Dining", x: 3, y: 0, w: 3, h: 3 },
      { label: "Living hall", x: 3, y: 3, w: 3, h: 3 },
    ],
    findings: {
      ne: { severity: "late", found: "Toilet and the 1,000 L overhead tank sit in the Ishan corner.", problem: "The lightest, holiest corner carries waste water and the heaviest load on the roof. Family reports frequent illness and the son's exam anxiety.", remedies: [{ id: "a1", title: "Shift OHT to the SW roof on a 2 ft stand", kind: "Minor work", cost: 18000, gain: 9 }, { id: "a2", title: "Toilet door kept shut, sea-salt bowl changed weekly", kind: "Placement", cost: 0, gain: 3 }, { id: "a3", title: "Copper Vastu strip along the NE toilet threshold", kind: "Product", cost: 2100, gain: 4 } ] },
      e: ok("Main door at Indra pada, drawing room with two east windows."),
      se: ok("Kitchen in Agneya, cook faces east. Gas on the SE platform."),
      s: ok("Staircase climbs clockwise along the south wall."),
      sw: ok("Master bedroom, bed head to the south. Almirah on the SW wall."),
      w: { severity: "warn", found: "Kids' study table faces west, wall-mounted TV opposite.", problem: "Back to the east and screen in front: attention scatters during study hours.", remedies: [{ id: "a4", title: "Turn the study table to face east or north", kind: "Placement", cost: 0, gain: 3 }, { id: "a5", title: "Move the TV to the NW wall", kind: "Placement", cost: 1500, gain: 2 }] },
      nw: { severity: "warn", found: "Puja shelf in the NW guest room, idols face east.", problem: "Vayavya is the zone of movement. Prayer here feels rushed and the guest room is never truly free.", remedies: [{ id: "a6", title: "Move the puja mandir to the north-east of the living hall", kind: "Placement", cost: 4500, gain: 4 }] },
      n: { severity: "warn", found: "A 7 ft steel almirah blocks the north wall of the dining.", problem: "North is the zone of opportunity (Kubera). A heavy block here is linked with stalled income.", remedies: [{ id: "a7", title: "Shift almirah to the SW of the dining", kind: "Placement", cost: 0, gain: 3 }, { id: "a8", title: "Light green or white on the north wall", kind: "Colour", cost: 6500, gain: 2 }] },
      c: { severity: "warn", found: "An RCC column and a heavy marble table sit at the centre of the living hall.", problem: "Brahmasthan should breathe. Load at the centre presses on the whole plan.", remedies: [{ id: "a9", title: "Move the marble table aside, keep the centre open", kind: "Placement", cost: 0, gain: 3 }, { id: "a10", title: "Brass Vastu pyramid at the column base", kind: "Product", cost: 1800, gain: 2 }] },
    },
  },
  {
    id: "mahakal",
    name: "Mahakal Namkeen factory",
    owner: "Vijay Khandelwal",
    place: "Dewas Road industrial area, Ujjain",
    kind: "Factory",
    plot: "Shed 120 × 90 ft · 10,800 sq ft",
    facing: "North facing",
    base: 47,
    entrance: { r: 0, c: 1, side: "n" },
    rooms: [
      { label: "Fryer + boiler", x: 6, y: 0, w: 3, h: 3 },
      { label: "Owner cabin", x: 3, y: 0, w: 3, h: 2 },
      { label: "Dispatch", x: 0, y: 0, w: 3, h: 3 },
      { label: "Packing line", x: 0, y: 3, w: 3, h: 3 },
      { label: "Courtyard", x: 3, y: 3, w: 3, h: 3 },
      { label: "Seasoning room", x: 6, y: 3, w: 3, h: 3 },
      { label: "Borewell + RM", x: 0, y: 6, w: 3, h: 3 },
      { label: "Besan store", x: 3, y: 6, w: 3, h: 3 },
      { label: "Panel room", x: 6, y: 6, w: 3, h: 3 },
      { label: "Accounts", x: 3, y: 2, w: 3, h: 1 },
    ],
    findings: {
      ne: { severity: "late", found: "The diesel fryer line and steam boiler run in the Ishan corner.", problem: "Fire in the water corner. Three breakdowns this year, labour turnover 40% on this line.", remedies: [{ id: "m1", title: "Move the boiler to the SE beside the panel room (phase 2)", kind: "Minor work", cost: 240000, gain: 10 }, { id: "m2", title: "Keep NE floor washed, copper water drum in the corner", kind: "Placement", cost: 3200, gain: 3 }] },
      e: ok("Seasoning room with large east windows, good morning light."),
      se: ok("Main LT panel and DG set in Agneya."),
      s: ok("Besan and oil store along the south wall, stacked high."),
      sw: { severity: "late", found: "Borewell and raw-material pit dug in the Nairutya corner.", problem: "The heaviest, most stable corner is hollowed out. Owner reports cash-flow shocks and two partners exiting.", remedies: [{ id: "m3", title: "Cap the SW borewell, shift to a new bore in the NE", kind: "Minor work", cost: 85000, gain: 8 }, { id: "m4", title: "Lead and copper strip along the SW boundary", kind: "Product", cost: 7400, gain: 3 }] },
      w: ok("Packing line, workers face north."),
      nw: ok("Dispatch bay in Vayavya: goods move out fast."),
      n: { severity: "warn", found: "Owner's cabin sits in the north, his chair faces south.", problem: "Owner in the zone of movement with his back to opportunity. Decisions get reopened.", remedies: [{ id: "m5", title: "Turn the owner's chair to face north", kind: "Placement", cost: 0, gain: 3 }, { id: "m6", title: "Plan the owner cabin in the SW in the next civil work", kind: "Minor work", cost: 60000, gain: 4 }] },
      c: ok("Open courtyard at the centre, roof skylight."),
    },
  },
  {
    id: "jain",
    name: "Jain Saree Kendra",
    owner: "Sanjay & Rekha Jain",
    place: "Sarafa Bazaar, Indore",
    kind: "Showroom",
    plot: "Shop 22 × 60 ft · G+mezzanine",
    facing: "South facing",
    base: 52,
    entrance: { r: 8, c: 4, side: "s" },
    rooms: [
      { label: "Trial rooms", x: 6, y: 0, w: 3, h: 2 },
      { label: "Cash counter", x: 3, y: 0, w: 3, h: 2 },
      { label: "Bridal wing", x: 0, y: 0, w: 3, h: 3 },
      { label: "Silk racks", x: 0, y: 3, w: 3, h: 3 },
      { label: "Spiral stair", x: 3, y: 3, w: 3, h: 3 },
      { label: "Cotton racks", x: 6, y: 2, w: 3, h: 4 },
      { label: "Safe + office", x: 0, y: 6, w: 3, h: 3 },
      { label: "Display", x: 3, y: 6, w: 3, h: 3 },
      { label: "Pantry", x: 6, y: 6, w: 3, h: 3 },
    ],
    findings: {
      ne: { severity: "warn", found: "Trial rooms with mirrors and a dark curtain fill the Ishan corner.", problem: "The corner of clarity is closed and dim. Customers dither and walk out to 'think about it'.", remedies: [{ id: "j1", title: "Swap trial rooms with the cotton racks", kind: "Minor work", cost: 38000, gain: 5 }, { id: "j2", title: "Bright LED and a small water bowl in the NE", kind: "Product", cost: 2400, gain: 2 }] },
      e: ok("Cotton racks under good light."),
      se: ok("Pantry and the electric meter in Agneya."),
      s: { severity: "late", found: "Shop entrance falls on the Yama pada of the south wall.", problem: "An inauspicious entry pada. Footfall is high but conversion is 18%, half the bazaar average.", remedies: [{ id: "j3", title: "Shift the shutter opening one pada east to Vitatha", kind: "Minor work", cost: 55000, gain: 7 }, { id: "j4", title: "Brass helix and a lead strip under the threshold", kind: "Product", cost: 3600, gain: 3 }] },
      sw: ok("Safe on the south wall opening north, owner seated in the SW."),
      w: ok("Silk racks, heavy wooden shelving."),
      nw: ok("Bridal wing in Vayavya: stock rotates quickly."),
      n: ok("Cash counter in the north, cashier faces north."),
      c: { severity: "late", found: "A spiral staircase to the mezzanine stands at the exact centre.", problem: "A cut through Brahmasthan. Staff conflicts and two thefts in 18 months.", remedies: [{ id: "j5", title: "Keep the stair base open, no stock beneath it", kind: "Placement", cost: 0, gain: 3 }, { id: "j6", title: "Copper pyramid grid in the floor under the stair", kind: "Product", cost: 9500, gain: 4 }] },
    },
  },
];

const seedApplied: Record<string, string[]> = { agrawal: ["a7"], mahakal: ["m5", "m2"], jain: [] };

function siteScore(site: Site, applied: string[]) {
  const gains = Object.values(site.findings).flatMap((f) => f.remedies).filter((r) => applied.includes(r.id)).reduce((a, r) => a + r.gain, 0);
  return Math.min(100, site.base + gains);
}
function siteMax(site: Site) {
  return Math.min(100, site.base + Object.values(site.findings).flatMap((f) => f.remedies).reduce((a, r) => a + r.gain, 0));
}
function effective(f: Finding, applied: string[]): Severity {
  if (!f.remedies.length) return f.severity;
  const done = f.remedies.filter((r) => applied.includes(r.id));
  if (done.length === f.remedies.length) return "ok";
  const gainDone = done.reduce((a, r) => a + r.gain, 0);
  const gainAll = f.remedies.reduce((a, r) => a + r.gain, 0);
  if (f.severity === "late" && gainDone / gainAll >= 0.5) return "warn";
  return f.severity;
}

/* ---- Consultations ---- */

const DAYS = ["Mon 19", "Tue 20", "Wed 21", "Thu 22", "Fri 23", "Sat 24"];
const TODAY_IDX = 1;
const HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18];
const hourLabel = (h: number) => (h === 12 ? "12 PM" : h > 12 ? `${h - 12} PM` : `${h} AM`);

type Kind = "Griha Vastu" | "Commercial Vastu" | "Plot selection" | "Coaching 1:1" | "Cohort" | "Report walkthrough" | "Muhurat";
const kindTone: Record<Kind, Tone> = { "Griha Vastu": "accent", "Commercial Vastu": "late", "Plot selection": "warn", "Coaching 1:1": "info", Cohort: "info", "Report walkthrough": "ok", Muhurat: "warn" };
const kindFee: Record<Kind, number> = { "Griha Vastu": 21000, "Commercial Vastu": 51000, "Plot selection": 11000, "Coaching 1:1": 7500, Cohort: 0, "Report walkthrough": 0, Muhurat: 5100 };

type Booking = { id: string; day: number; at: number; dur: number; client: string; kind: Kind; mode: "Site visit" | "Office" | "Video"; where: string; phone: string; status: "Confirmed" | "Advance due" | "Done" };

const seedBookings: Booking[] = [
  { id: "b1", day: 0, at: 10, dur: 2, client: "Agrawal residence", kind: "Griha Vastu", mode: "Site visit", where: "Freeganj, Ujjain", phone: "98270 41xxx", status: "Done" },
  { id: "b2", day: 0, at: 15, dur: 1, client: "Sneha Bhatnagar", kind: "Plot selection", mode: "Office", where: "Office, Nanakheda", phone: "99260 18xxx", status: "Done" },
  { id: "b3", day: 0, at: 17, dur: 1, client: "Manish Goyal · VV7", kind: "Coaching 1:1", mode: "Video", where: "Zoom", phone: "94250 77xxx", status: "Done" },
  { id: "b4", day: 1, at: 10, dur: 2, client: "Mahakal Namkeen factory", kind: "Commercial Vastu", mode: "Site visit", where: "Dewas Road, Ujjain", phone: "98930 12xxx", status: "Confirmed" },
  { id: "b5", day: 1, at: 14, dur: 1, client: "Jain Saree Kendra", kind: "Report walkthrough", mode: "Video", where: "Google Meet", phone: "93031 55xxx", status: "Confirmed" },
  { id: "b6", day: 1, at: 16, dur: 1, client: "Ramesh Parmar", kind: "Griha Vastu", mode: "Office", where: "Office, Nanakheda", phone: "70002 61xxx", status: "Advance due" },
  { id: "b7", day: 1, at: 18, dur: 1, client: "Udyamini B3 office hours", kind: "Cohort", mode: "Video", where: "Zoom", phone: "—", status: "Confirmed" },
  { id: "b8", day: 2, at: 11, dur: 2, client: "Shri Ganesh Hospital", kind: "Commercial Vastu", mode: "Site visit", where: "Nagda", phone: "98266 30xxx", status: "Confirmed" },
  { id: "b9", day: 2, at: 15, dur: 1, client: "Priya & Rohit Saxena", kind: "Plot selection", mode: "Site visit", where: "Mahananda Nagar", phone: "88895 02xxx", status: "Advance due" },
  { id: "b10", day: 3, at: 10, dur: 1, client: "Kothari Steel Traders", kind: "Coaching 1:1", mode: "Office", where: "Office, Nanakheda", phone: "94251 90xxx", status: "Confirmed" },
  { id: "b11", day: 3, at: 12, dur: 1, client: "Dr. Anjali Mehta (Pune)", kind: "Griha Vastu", mode: "Video", where: "Zoom, plan by email", phone: "98220 47xxx", status: "Confirmed" },
  { id: "b12", day: 3, at: 15, dur: 2, client: "Sanwariya Hotel", kind: "Commercial Vastu", mode: "Site visit", where: "Omkareshwar", phone: "97540 13xxx", status: "Advance due" },
  { id: "b13", day: 4, at: 11, dur: 1, client: "Lalit Chordia", kind: "Griha Vastu", mode: "Video", where: "Google Meet", phone: "98261 72xxx", status: "Confirmed" },
  { id: "b14", day: 4, at: 16, dur: 1, client: "Prakash Dairy", kind: "Coaching 1:1", mode: "Office", where: "Office, Nanakheda", phone: "99934 28xxx", status: "Confirmed" },
  { id: "b15", day: 5, at: 10, dur: 3, client: "Vyapar Vriddhi B7 · Session 8", kind: "Cohort", mode: "Office", where: "Hall, Hotel Shipra Residency", phone: "—", status: "Confirmed" },
  { id: "b16", day: 5, at: 15, dur: 1, client: "Agrawal griha pravesh", kind: "Muhurat", mode: "Office", where: "Office, Nanakheda", phone: "98270 41xxx", status: "Confirmed" },
];

/* ---- Site audits ---- */

const AUDIT_STEPS = [
  "Compass reading at 3 points, declination noted",
  "Plot shape: extensions and cuts measured",
  "Entrance pada marked on the 32-pada ring",
  "Slope and rain-water flow direction",
  "Fire: kitchen, panels, boiler",
  "Toilets, septic and drains",
  "Overhead and underground water",
  "Staircase direction and load",
  "Bed heads, owner's seat, safe",
  "Brahmasthan load and light",
  "Photos of all 8 corners and the centre",
  "Owner interview: concerns in their words",
];
type AuditStatus = "Scheduled" | "Measured" | "Drafting" | "Review" | "Sent";
type Audit = { id: string; client: string; site: string; city: string; type: "Residence" | "Factory" | "Shop" | "Office" | "Plot" | "Hospital" | "Hotel"; area: string; surveyor: string; visit: string; status: AuditStatus; photos: number; done: number; fee: number };
const seedAudits: Audit[] = [
  { id: "SA-131", client: "Mahakal Namkeen", site: "Shed + office", city: "Ujjain", type: "Factory", area: "10,800 sq ft", surveyor: "Saurabh", visit: "Today", status: "Scheduled", photos: 0, done: 0, fee: 51000 },
  { id: "SA-130", client: "Agrawal residence", site: "G+1 house", city: "Ujjain", type: "Residence", area: "2,400 sq ft", surveyor: "Saurabh", visit: "19 Oct", status: "Drafting", photos: 34, done: 12, fee: 21000 },
  { id: "SA-129", client: "Jain Saree Kendra", site: "Shop + mezzanine", city: "Indore", type: "Shop", area: "1,320 sq ft", surveyor: "Rajendra", visit: "16 Oct", status: "Review", photos: 41, done: 12, fee: 31000 },
  { id: "SA-128", client: "Shri Ganesh Hospital", site: "OPD block", city: "Nagda", type: "Hospital", area: "6,200 sq ft", surveyor: "Saurabh", visit: "21 Oct", status: "Scheduled", photos: 0, done: 0, fee: 75000 },
  { id: "SA-127", client: "Sanwariya Hotel", site: "Hotel, 22 rooms", city: "Omkareshwar", type: "Hotel", area: "14,500 sq ft", surveyor: "Rajendra", visit: "22 Oct", status: "Scheduled", photos: 0, done: 0, fee: 95000 },
  { id: "SA-126", client: "Saxena plot", site: "Plot 1,500 sq ft", city: "Ujjain", type: "Plot", area: "1,500 sq ft", surveyor: "Saurabh", visit: "14 Oct", status: "Sent", photos: 12, done: 11, fee: 11000 },
  { id: "SA-125", client: "Dewas Agro Inputs", site: "Godown + shop", city: "Dewas", type: "Shop", area: "3,000 sq ft", surveyor: "Saurabh", visit: "12 Oct", status: "Measured", photos: 28, done: 9, fee: 31000 },
  { id: "SA-124", client: "Kothari Steel Traders", site: "Office", city: "Ujjain", type: "Office", area: "1,100 sq ft", surveyor: "Rajendra", visit: "10 Oct", status: "Sent", photos: 22, done: 12, fee: 21000 },
  { id: "SA-123", client: "Malwa Pipes", site: "Factory", city: "Pithampur", type: "Factory", area: "22,000 sq ft", surveyor: "Saurabh", visit: "8 Oct", status: "Drafting", photos: 56, done: 12, fee: 1.1e5 },
  { id: "SA-122", client: "Dr. Anjali Mehta", site: "Flat 3 BHK (remote)", city: "Pune", type: "Residence", area: "1,450 sq ft", surveyor: "Anil", visit: "Plan only", status: "Measured", photos: 9, done: 7, fee: 15000 },
  { id: "SA-121", client: "Chouhan residence", site: "Bungalow", city: "Ratlam", type: "Residence", area: "3,600 sq ft", surveyor: "Saurabh", visit: "5 Oct", status: "Sent", photos: 38, done: 12, fee: 25000 },
  { id: "SA-120", client: "Sharma Jewellers", site: "Showroom", city: "Ujjain", type: "Shop", area: "900 sq ft", surveyor: "Rajendra", visit: "2 Oct", status: "Sent", photos: 25, done: 12, fee: 31000 },
];
const auditTone: Record<AuditStatus, Tone> = { Scheduled: "neutral", Measured: "info", Drafting: "warn", Review: "accent", Sent: "ok" };
const PHOTO_SPOTS = ["NE corner", "East door", "SE kitchen", "South wall", "SW corner", "West", "NW", "North wall", "Centre"];

/* ---- Coaching ---- */

type Cohort = { id: string; name: string; focus: string; fee: number; sessions: string[]; done: number; next: string };
const cohorts: Cohort[] = [
  { id: "VV7", name: "Vyapar Vriddhi · Batch 7", focus: "Ujjain & Dewas traders, ₹2–15 Cr turnover", fee: 45000, sessions: ["Owner's week audit", "Numbers that matter", "Pricing & margin", "Delegation ladder", "Hiring the No. 2", "Sales system", "Cash flow & credit", "Inventory turns", "Family & business", "Vastu for the workplace", "Growth plan", "Graduation"], done: 7, next: "Sat 24 Oct, 10 AM · Inventory turns" },
  { id: "UW3", name: "Udyamini · Batch 3", focus: "Women entrepreneurs, Indore & Ujjain, home to shop", fee: 30000, sessions: ["Why I started", "Pricing my time", "Instagram & WhatsApp selling", "Books in Tally", "First employee", "GST basics", "Credit from banks", "Scaling the kitchen", "Pitch day"], done: 5, next: "Tue 20 Oct, 6 PM · Office hours" },
  { id: "NG2", name: "Next-Gen Family Business · 2", focus: "Sons and daughters joining the family firm", fee: 60000, sessions: ["Two generations, one table", "Roles and titles", "Numbers for heirs", "Modernising without fights", "Systems before software", "The succession talk"], done: 3, next: "Sun 1 Nov, 11 AM · Modernising without fights" },
];
type Member = { name: string; biz: string; town: string; cohort: string; att: number[]; growth: number };
const members: Member[] = [
  { name: "Manish Goyal", biz: "Goyal Kirana Wholesale", town: "Ujjain", cohort: "VV7", att: [1, 1, 1, 1, 1, 1, 1], growth: 14 },
  { name: "Deepak Rathi", biz: "Rathi Agencies (FMCG)", town: "Dewas", cohort: "VV7", att: [1, 1, 0, 1, 1, 1, 1], growth: 9 },
  { name: "Harish Soni", biz: "Soni Hardware", town: "Ujjain", cohort: "VV7", att: [1, 0, 1, 1, 0, 1, 0], growth: 3 },
  { name: "Pankaj Malviya", biz: "Malviya Tent House", town: "Ujjain", cohort: "VV7", att: [1, 1, 1, 0, 1, 1, 1], growth: 11 },
  { name: "Arvind Patidar", biz: "Patidar Seeds", town: "Shajapur", cohort: "VV7", att: [1, 1, 1, 1, 1, 0, 1], growth: 7 },
  { name: "Sachin Jaiswal", biz: "Jaiswal Electricals", town: "Dewas", cohort: "VV7", att: [1, 1, 1, 1, 1, 1, 0], growth: 6 },
  { name: "Rakesh Mandloi", biz: "Mandloi Furniture", town: "Ujjain", cohort: "VV7", att: [0, 1, 1, 1, 1, 1, 1], growth: 12 },
  { name: "Vinod Bansal", biz: "Bansal Cloth Emporium", town: "Nagda", cohort: "VV7", att: [1, 1, 1, 1, 0, 0, 0], growth: -2 },
  { name: "Kavya Sharma", biz: "Kavya's Kitchen (tiffin)", town: "Indore", cohort: "UW3", att: [1, 1, 1, 1, 1], growth: 22 },
  { name: "Ruchi Agrawal", biz: "Ruchi Block Prints", town: "Ujjain", cohort: "UW3", att: [1, 1, 0, 1, 1], growth: 15 },
  { name: "Shabana Khan", biz: "Khan Bridal Mehendi", town: "Indore", cohort: "UW3", att: [1, 1, 1, 0, 1], growth: 18 },
  { name: "Meera Joshi", biz: "Joshi Papad Udyog", town: "Ujjain", cohort: "UW3", att: [1, 0, 1, 1, 0], growth: 4 },
  { name: "Neha Tiwari", biz: "Neha Boutique", town: "Dewas", cohort: "UW3", att: [1, 1, 1, 1, 1], growth: 11 },
  { name: "Aakash Gupta", biz: "Gupta Steel (2nd gen)", town: "Indore", cohort: "NG2", att: [1, 1, 1], growth: 5 },
  { name: "Ishita Maheshwari", biz: "Maheshwari Dal Mill", town: "Ujjain", cohort: "NG2", att: [1, 1, 0], growth: 8 },
  { name: "Kunal Bhandari", biz: "Bhandari Jewellers", town: "Ratlam", cohort: "NG2", att: [1, 0, 1], growth: 2 },
];
type Assignment = { id: string; member: string; cohort: string; title: string; col: "assigned" | "submitted" | "reviewed" | "call" };
const seedAssignments: Assignment[] = [
  { id: "as1", member: "Manish Goyal", cohort: "VV7", title: "13-week cash-flow sheet", col: "reviewed" },
  { id: "as2", member: "Deepak Rathi", cohort: "VV7", title: "13-week cash-flow sheet", col: "submitted" },
  { id: "as3", member: "Harish Soni", cohort: "VV7", title: "13-week cash-flow sheet", col: "call" },
  { id: "as4", member: "Pankaj Malviya", cohort: "VV7", title: "Debtor list over 60 days", col: "submitted" },
  { id: "as5", member: "Arvind Patidar", cohort: "VV7", title: "13-week cash-flow sheet", col: "assigned" },
  { id: "as6", member: "Vinod Bansal", cohort: "VV7", title: "Owner's week audit (pending since S1)", col: "call" },
  { id: "as7", member: "Rakesh Mandloi", cohort: "VV7", title: "Debtor list over 60 days", col: "reviewed" },
  { id: "as8", member: "Kavya Sharma", cohort: "UW3", title: "GST registration checklist", col: "reviewed" },
  { id: "as9", member: "Ruchi Agrawal", cohort: "UW3", title: "First employee JD", col: "submitted" },
  { id: "as10", member: "Meera Joshi", cohort: "UW3", title: "Books in Tally for September", col: "assigned" },
  { id: "as11", member: "Shabana Khan", cohort: "UW3", title: "Price list v2 on WhatsApp catalogue", col: "submitted" },
  { id: "as12", member: "Ishita Maheshwari", cohort: "NG2", title: "Role card for self and father", col: "assigned" },
  { id: "as13", member: "Aakash Gupta", cohort: "NG2", title: "Role card for self and father", col: "reviewed" },
];

/* ---- Remedies ---- */

type RemStatus = "Advised" | "Ordered" | "Installed" | "Verified";
type RemedyJob = { id: string; client: string; zone: ZoneId; remedy: string; kind: Remedy["kind"]; status: RemStatus; installer: string; due: string; check: string; note?: string };
const seedRemedies: RemedyJob[] = [
  { id: "RM-412", client: "Agrawal residence", zone: "n", remedy: "Shift almirah to SW of dining", kind: "Placement", status: "Installed", installer: "Family", due: "19 Oct", check: "Day 7 · 26 Oct" },
  { id: "RM-411", client: "Agrawal residence", zone: "ne", remedy: "Copper strip at NE toilet threshold", kind: "Product", status: "Ordered", installer: "Yash", due: "23 Oct", check: "—" },
  { id: "RM-409", client: "Mahakal Namkeen", zone: "n", remedy: "Owner's chair to face north", kind: "Placement", status: "Verified", installer: "Owner", due: "6 Oct", check: "Day 21 · done", note: "Says meetings end faster" },
  { id: "RM-408", client: "Mahakal Namkeen", zone: "ne", remedy: "Copper water drum in NE, daily floor wash", kind: "Placement", status: "Installed", installer: "Factory staff", due: "8 Oct", check: "Day 21 · 29 Oct" },
  { id: "RM-405", client: "Kothari Steel Traders", zone: "sw", remedy: "Owner desk to SW, back to solid wall", kind: "Placement", status: "Verified", installer: "Yash", due: "14 Oct", check: "Day 7 · done", note: "Collections up, says 2 old debtors paid" },
  { id: "RM-404", client: "Kothari Steel Traders", zone: "se", remedy: "Remove water dispenser from SE", kind: "Placement", status: "Installed", installer: "Office boy", due: "14 Oct", check: "Day 7 · 21 Oct" },
  { id: "RM-401", client: "Chouhan residence", zone: "sw", remedy: "Lead strip along SW wall", kind: "Product", status: "Verified", installer: "Yash", due: "9 Oct", check: "Day 21 · done", note: "Sleep better, says Mrs Chouhan" },
  { id: "RM-399", client: "Chouhan residence", zone: "c", remedy: "Clear Brahmasthan of the dining table", kind: "Placement", status: "Installed", installer: "Family", due: "9 Oct", check: "Day 21 · 30 Oct" },
  { id: "RM-396", client: "Sharma Jewellers", zone: "n", remedy: "Cash counter shifted to north", kind: "Minor work", status: "Verified", installer: "Carpenter (Raju)", due: "5 Oct", check: "Day 21 · done", note: "Dhanteras footfall best in 4 years" },
  { id: "RM-395", client: "Sharma Jewellers", zone: "s", remedy: "Brass helix at south door", kind: "Product", status: "Installed", installer: "Yash", due: "5 Oct", check: "Day 21 · 26 Oct" },
  { id: "RM-392", client: "Saxena plot", zone: "ne", remedy: "Buy plot only if NE cut is filled (advice)", kind: "Placement", status: "Advised", installer: "—", due: "Client decision", check: "Call 22 Oct" },
  { id: "RM-390", client: "Malwa Pipes", zone: "se", remedy: "Shift transformer yard to SE", kind: "Minor work", status: "Advised", installer: "Client contractor", due: "Dec", check: "—" },
  { id: "RM-388", client: "Dewas Agro Inputs", zone: "nw", remedy: "Finished goods to NW godown", kind: "Placement", status: "Ordered", installer: "Client staff", due: "24 Oct", check: "—" },
  { id: "RM-385", client: "Rathore residence", zone: "e", remedy: "Yellow-orange east wall, remove tree shade", kind: "Colour", status: "Installed", installer: "Painter (Mohsin)", due: "1 Oct", check: "Day 21 · 22 Oct" },
];
const remTone: Record<RemStatus, Tone> = { Advised: "neutral", Ordered: "warn", Installed: "info", Verified: "ok" };

/* ---- Fees ---- */

const packages = [
  { name: "Griha Vastu", price: 21000, note: "Home up to 3,000 sq ft, visit, report, 90-day follow-up", sold: 14, tone: "accent" as Tone },
  { name: "Commercial Vastu", price: 51000, note: "Shop, office, factory up to 12,000 sq ft, 2 visits", sold: 6, tone: "late" as Tone },
  { name: "Plot selection", price: 11000, note: "Up to 3 plots compared, same-week answer", sold: 9, tone: "warn" as Tone },
  { name: "Vyapar Vriddhi cohort", price: 45000, note: "12 Saturdays, 1:1 every month, WhatsApp group", sold: 14, tone: "info" as Tone },
  { name: "1:1 mentoring (6 months)", price: 120000, note: "Fortnightly sessions, plant Vastu included", sold: 3, tone: "ok" as Tone },
];
type Invoice = { no: string; client: string; pkg: string; base: number; paid: number; raised: string; days: number };
const seedInvoices: Invoice[] = [
  { no: "SA/26-27/094", client: "Mahakal Namkeen", pkg: "Commercial Vastu", base: 51000, paid: 25500, raised: "15 Oct", days: 5 },
  { no: "SA/26-27/093", client: "Agrawal residence", pkg: "Griha Vastu", base: 21000, paid: 10500, raised: "14 Oct", days: 6 },
  { no: "SA/26-27/092", client: "Jain Saree Kendra", pkg: "Commercial Vastu (shop)", base: 31000, paid: 31000, raised: "10 Oct", days: 10 },
  { no: "SA/26-27/091", client: "Malwa Pipes", pkg: "Commercial Vastu (factory)", base: 110000, paid: 55000, raised: "6 Oct", days: 14 },
  { no: "SA/26-27/089", client: "Vinod Bansal", pkg: "Vyapar Vriddhi B7", base: 45000, paid: 15000, raised: "1 Aug", days: 80 },
  { no: "SA/26-27/088", client: "Harish Soni", pkg: "Vyapar Vriddhi B7", base: 45000, paid: 30000, raised: "1 Aug", days: 80 },
  { no: "SA/26-27/086", client: "Meera Joshi", pkg: "Udyamini B3", base: 30000, paid: 15000, raised: "20 Aug", days: 61 },
  { no: "SA/26-27/084", client: "Kothari Steel Traders", pkg: "1:1 mentoring", base: 120000, paid: 60000, raised: "1 Sep", days: 49 },
  { no: "SA/26-27/083", client: "Dewas Agro Inputs", pkg: "Commercial Vastu (shop)", base: 31000, paid: 0, raised: "12 Oct", days: 8 },
  { no: "SA/26-27/081", client: "Chouhan residence", pkg: "Griha Vastu", base: 25000, paid: 25000, raised: "5 Oct", days: 15 },
  { no: "SA/26-27/079", client: "Kunal Bhandari", pkg: "Next-Gen B2", base: 60000, paid: 30000, raised: "15 Sep", days: 35 },
  { no: "SA/26-27/077", client: "Sharma Jewellers", pkg: "Commercial Vastu (shop)", base: 31000, paid: 31000, raised: "2 Oct", days: 18 },
];
const GST = 0.18;
const gross = (i: Invoice) => Math.round(i.base * (1 + GST));
const due = (i: Invoice) => Math.max(0, gross(i) - i.paid);

/* ---- Shared modules ---- */

const team: TeamMember[] = [
  { name: "Rajendra Trivedi", role: "Founder · Vastu consultant & coach", status: "Busy", load: 92, focus: "Mahakal factory survey at 10, Jain report walkthrough at 2", tasks: [{ title: "Mahakal Namkeen site survey", due: "10:00" }, { title: "Sign off Jain Saree Kendra report", due: "1:00" }, { title: "Review Malwa Pipes draft", due: "5:00" }], week: [1, 1, 1, 1, 1, 1], since: "2009" },
  { name: "Kavita Trivedi", role: "Coaching lead, Udyamini & Next-Gen", status: "On floor", load: 74, focus: "Udyamini office hours at 6 PM; reviewing 4 assignments", tasks: [{ title: "Review Ruchi's first-employee JD", due: "3:00" }, { title: "Udyamini office hours", due: "6:00" }], week: [1, 1, 1, 1, 1, 0], since: "2015" },
  { name: "Saurabh Mehta", role: "Site surveyor & draughtsman", status: "In field", load: 86, focus: "At Dewas Road with the compass kit and laser meter", tasks: [{ title: "Mahakal: measure shed + office", due: "12:00" }, { title: "Agrawal: CAD overlay of the mandala", due: "4:00", done: true }, { title: "Nagda hospital kit pack", due: "7:00" }], week: [1, 1, 1, 1, 1, 1], since: "2018" },
  { name: "Anil Chouhan", role: "Report writer", status: "Busy", load: 81, focus: "Agrawal report: 9 zones written, 2 to go", tasks: [{ title: "Agrawal report draft", due: "6:00" }, { title: "Malwa Pipes remedy costing", due: "Thu" }], week: [1, 1, 1, 1, 0, 1], since: "2020" },
  { name: "Pooja Rathore", role: "Client desk & WhatsApp", status: "On floor", load: 70, focus: "Confirming 3 slots with advance links; 5 enquiries open", tasks: [{ title: "Send Saxena advance link", due: "11:00", done: true }, { title: "Call 4 Day-21 check-ins", due: "4:00" }], week: [1, 1, 1, 1, 1, 1], since: "2021" },
  { name: "Yash Dubey", role: "Remedy procurement & installs", status: "In field", load: 62, focus: "Copper strips from Jaipur supplier, Agrawal install Friday", tasks: [{ title: "Collect brass helix lot, Indore", due: "2:00" }, { title: "Install copper strip at Agrawal", due: "Fri" }], week: [1, 1, 0, 1, 1, 1], since: "2022" },
  { name: "Nidhi Sharma", role: "Accounts (part-time)", status: "Off", load: 35, focus: "In Tuesdays and Fridays; dues list queued for 5 PM", tasks: [{ title: "GST R-1 for October", due: "11 Nov" }], week: [0, 1, 0, 0, 1, 0], since: "2019" },
  { name: "Farhan Qureshi", role: "Content & Instagram", status: "On floor", load: 55, focus: "Editing the Sharma Jewellers before-after reel (consent signed)", tasks: [{ title: "Sharma reel cut", due: "5:00" }, { title: "Udyamini pitch-day poster", due: "Thu" }], week: [1, 1, 1, 1, 1, 0], since: "2023" },
];

const agents: WorkforceAgent[] = [
  { name: "Booking Desk", role: "Answers WhatsApp enquiries and offers open slots", icon: CalendarDays, status: "Needs you", runsToday: 17, hoursSaved: 5, accuracy: 92, last: "3 min ago", skills: ["WhatsApp", "Google Calendar", "Razorpay links"], schedule: "On every incoming message", inbox: [{ title: "Sanwariya Hotel wants Thursday, but the survey needs 2 people", detail: "Offered Thu 3 PM with Saurabh + Rajendra. Advance ₹30,090 link ready to send." }], log: ["Offered 3 slots to Ramesh Parmar, he picked Tue 4 PM", "Sent Saxena advance link ₹6,490", "Moved Dr. Mehta to video, plan by email"] },
  { name: "Report Drafter", role: "Turns survey notes and photos into the zone-by-zone report", icon: FileText, status: "Running", runsToday: 4, hoursSaved: 7, accuracy: 88, last: "20 min ago", skills: ["Survey notes", "Mandala overlay", "Hindi + English"], schedule: "After each survey upload", log: ["Drafted 7 of 9 zones for Agrawal", "Flagged NE toilet as the top concern", "Costed 10 remedies against the price list"] },
  { name: "Follow-up Caller", role: "Day 7, 21 and 90 check-ins after remedies", icon: Phone, status: "Running", runsToday: 9, hoursSaved: 4, accuracy: 94, last: "1 h ago", skills: ["WhatsApp voice notes", "Feedback log"], schedule: "Daily 11 AM and 4 PM", log: ["Logged Sharma Jewellers: best Dhanteras in 4 years", "Kothari: 2 old debtors paid", "4 check-ins due today"] },
  { name: "Cohort Assistant", role: "Attendance, assignments and nudges for every batch", icon: GraduationCap, status: "Needs you", runsToday: 6, hoursSaved: 3.5, accuracy: 90, last: "35 min ago", skills: ["Attendance", "Assignments", "WhatsApp groups"], schedule: "Session days + every evening", inbox: [{ title: "Vinod Bansal missed 3 sessions in a row", detail: "Draft a personal call from Rajendra-ji? His fee balance is also ₹38,100." }], log: ["Reminded 3 VV7 members about the cash-flow sheet", "Marked Udyamini S5 attendance", "Shared S7 slides in the group"] },
  { name: "Fees Collector", role: "Polite, timed reminders for balances and instalments", icon: HandCoins, status: "Running", runsToday: 3, hoursSaved: 2.5, accuracy: 91, last: "2 h ago", skills: ["Tally", "Razorpay", "GST invoices"], schedule: "Daily 5 PM", log: ["Queued 5 reminders for 5 PM", "Raised GST invoice for Mahakal advance", "Matched ₹31,000 UPI from Jain Saree Kendra"] },
  { name: "Content Muse", role: "Reels and posts from consented case studies", icon: Sparkles, status: "Idle", runsToday: 1, hoursSaved: 1.5, accuracy: 85, last: "yesterday", skills: ["Instagram", "Captions in Hindi", "Consent check"], schedule: "Weekly, Thursday", log: ["Script for Sharma Jewellers reel", "Blocked Agrawal case: no consent yet", "Wrote 4 Navratri Vastu tips"] },
];

const independence: IndependenceData = {
  score: 31,
  history: [18, 20, 22, 24, 26, 29, 31],
  quote: "Clients pay for Rajendra-ji's eyes on the site. But if I am the only one who can read a mandala, Shipra closes the day I stop travelling.",
  pillars: [
    { name: "Sales & enquiries", score: 44, note: "Pooja books slots, but every price question still goes to Rajendra.", fixes: [{ title: "Published package price list", gain: 3 }, { title: "Booking Desk answers fees", gain: 2 }] },
    { name: "Site surveys", score: 36, note: "Saurabh measures; only the owner reads the entrance pada and Brahmasthan.", fixes: [{ title: "Survey checklist of 12 steps", gain: 3 }, { title: "Saurabh certified on pada reading", gain: 4 }] },
    { name: "Reports", score: 22, note: "Every report waits 6 days for owner sign-off.", fixes: [{ title: "Report Drafter first draft", gain: 4 }, { title: "Owner reviews only the top 3 zones", gain: 2 }] },
    { name: "Coaching delivery", score: 41, note: "Kavita runs two cohorts alone; VV7 is still Rajendra-only.", fixes: [{ title: "Co-facilitator for VV7", gain: 3 }] },
    { name: "Money & dues", score: 33, note: "₹2.6 L outstanding, mostly cohort balances nobody likes to chase.", fixes: [{ title: "Instalments on Razorpay autopay", gain: 3 }] },
    { name: "Follow-ups", score: 28, note: "Day-21 calls happen when someone remembers.", fixes: [{ title: "Follow-up Caller on schedule", gain: 3 }] },
    { name: "Owner time", score: 19, note: "Owner travels 3 days a week for surveys within 150 km.", fixes: [{ title: "Video consults for plan-only jobs", gain: 2 }, { title: "Saurabh solo for residences", gain: 3 }] },
  ],
  ownerHours: [
    { label: "Site visits", hours: 16 },
    { label: "Reports", hours: 9 },
    { label: "Coaching", hours: 8 },
    { label: "Calls & fees", hours: 6 },
    { label: "Travel", hours: 11 },
    { label: "Content", hours: 2 },
    { label: "Strategy", hours: 1 },
  ],
};

const integrations: Integration[] = [
  { name: "WhatsApp Business", category: "Messaging", status: "Connected", detail: "Enquiries, cohort groups, remedy check-ins and fee reminders.", synced: "just now", records: "3,420 chats", mark: "W", color: "#1f9d55" },
  { name: "Tally Prime", category: "Accounts", status: "Connected", detail: "GST invoices and receipts, both ways.", synced: "14 min ago", records: "1,180 vouchers", mark: "T", color: "#1c4f9c" },
  { name: "Google Calendar", category: "Scheduling", status: "Connected", detail: "Consultation and survey slots for 3 people.", synced: "2 min ago", records: "16 this week", mark: "GC", color: "#4285f4" },
  { name: "Razorpay", category: "Payments", status: "Connected", detail: "Advance links and cohort instalments.", synced: "1 h ago", records: "212 payments", mark: "R", color: "#2563eb" },
  { name: "Zoom", category: "Meetings", status: "Connected", detail: "Remote consults and cohort office hours, recordings saved.", synced: "yesterday", records: "64 recordings", mark: "Z", color: "#2d8cff" },
  { name: "Google Drive", category: "Reports", status: "Syncing", detail: "Survey photos, CAD overlays and PDF reports per client.", synced: "live", records: "4,860 files", mark: "D", color: "#0f9d58" },
  { name: "DigiCompass survey app", category: "Survey", status: "Connected", detail: "Compass readings and laser measurements from site.", synced: "38 min ago", records: "131 surveys", mark: "DC", color: "#8a2c1d" },
  { name: "Instagram", category: "Marketing", status: "Error", detail: "Token expired. Scheduled reels paused.", synced: "3 days ago", records: "—", mark: "IG", color: "#d62976" },
  { name: "JustDial", category: "Leads", status: "Available", detail: "Pull Vastu enquiries from your JD listing.", synced: "—", records: "—", mark: "JD", color: "#ff6f00" },
  { name: "Google Sheets", category: "Planning", status: "Connected", detail: "Old client register, read-only while you move over.", synced: "1 day ago", records: "1,940 rows", mark: "GS", color: "#0f9d58" },
];

/* ============================================================
   Config
   ============================================================ */

const config: DeskConfig = {
  slug: "advisory",
  company: "Shipra Advisory",
  brand: "Shipra",
  city: "Ujjain",
  state: "MP",
  icon: Compass,
  tagline: "Vastu for homes, shops and factories, and coaching for the owners who run them · since 2009",
  owner: { name: "Rajendra Trivedi", first: "Rajendra", initials: "RT", role: "Founder" },
  theme: {
    variant: "ledger",
    paper: "#f3ead7",
    panel: "#faf4e6",
    sunk: "#ebdfc4",
    ink: "#2b1810",
    mute: "#77604b",
    line: "#d9c7a4",
    accent: "#8a2c1d",
    accentInk: "#fff7e8",
    soft: "#f1dccb",
    ok: "#4c7a36",
    warn: "#b07d1e",
    late: "#b8323f",
    info: "#2f6b78",
    heading: "serif",
  },
  agenda: [
    { at: 10, title: "Mahakal Namkeen survey", detail: "Dewas Road · boiler in Ishan, borewell in Nairutya", tone: "late", module: "mandala" },
    { at: 11, title: "Advance links to send", detail: "Parmar, Saxena, Sanwariya Hotel", count: 3, tone: "warn", module: "consults" },
    { at: 13, title: "Jain report sign-off", detail: "Review before the 2 PM walkthrough", count: 2, tone: "accent", module: "audits" },
    { at: 14, title: "Report walkthrough: Jain", detail: "Google Meet with Sanjay & Rekha", tone: "info", module: "consults" },
    { at: 16, title: "Day-21 check-in calls", detail: "Rathore, Kothari, Sharma, Mahakal", count: 4, tone: "ok", module: "remedies" },
    { at: 18, title: "Udyamini office hours", detail: "Kavita leads, 5 members", count: 5, tone: "info", module: "cohorts" },
  ],
  activity: [
    { time: "11:42 AM", text: "Saxena family paid the ₹6,490 plot-selection advance", tone: "ok" },
    { time: "11:10 AM", text: "Report Drafter finished 7 of 9 zones for Agrawal residence", tone: "info" },
    { time: "10:35 AM", text: "Saurabh reached Mahakal Namkeen; compass declination +0.4°", tone: "neutral" },
    { time: "10:02 AM", text: "Sharma Jewellers reported their best Dhanteras booking week", tone: "ok" },
    { time: "9:40 AM", text: "Instagram token expired, two reels paused", tone: "late" },
    { time: "9:15 AM", text: "Vinod Bansal missed his third cohort session", tone: "warn" },
  ],
  asks: [
    { q: "What should I tell Vijay-ji at Mahakal today?", a: "Lead with the two big ones, and be honest about cost.\n\n• NE (Ishan): fryer and boiler in the water corner. The real fix is moving the boiler to the SE (about ₹2.4 L, phase 2). Today: copper water drum + daily NE floor wash, already done.\n• SW (Nairutya): borewell in the heaviest corner. Cap it and bore again in the NE, about ₹85,000. This is the one to do first.\n• North: his chair already faces north since 6 Oct; he says meetings end faster.\n\nHarmony today 53, reaches 78 with everything done.", sources: ["Mandala · Mahakal", "Remedies RM-408, RM-409", "Survey notes"] },
    { q: "Which reports are stuck on me?", a: "Three.\n• SA-129 Jain Saree Kendra: in review, walkthrough at 2 PM today.\n• SA-130 Agrawal residence: drafting, 7 of 9 zones written.\n• SA-123 Malwa Pipes: drafting since 8 Oct, 12 days. Remedy costing needs your call on the transformer yard.\n\nAverage report turnaround is 6.2 days; target is 4.", sources: ["Site audits", "Report Drafter log"] },
    { q: "How much is pending in fees?", a: "₹2.6 L across 9 invoices (incl. 18% GST).\n• Cohort balances are the slowest: Vinod Bansal ₹38,100 and Harish Soni ₹23,100, both 80 days.\n• Malwa Pipes ₹74,800 balance is due on report delivery.\n• Kothari mentoring ₹81,600, second instalment due 1 Nov.\n\nReminders go out at 5 PM unless you hold them.", sources: ["Tally", "Razorpay", "Fees & packages"] },
    { q: "Is Vyapar Vriddhi batch 7 on track?", a: "Mostly. 7 of 12 sessions done, attendance 87%. Members report a median 8% revenue lift since August.\n\nWatch two people: Vinod Bansal (missed S5–S7, growth −2%) and Harish Soni (missed 3 of 7, cash-flow sheet not submitted). Both owe fees. A personal call from you usually brings them back.", sources: ["Coaching cohorts", "Cohort Assistant"] },
    { q: "Which remedies are actually working?", a: "From client-reported Day-21 check-ins (not a guarantee, and we say so in every report):\n• Sharma Jewellers: cash counter to north → best Dhanteras footfall in 4 years.\n• Kothari Steel: owner desk to SW → 2 old debtors paid.\n• Chouhan residence: SW lead strip → family sleeping better.\n\n4 Day-21 calls are due today. 3 remedies are installed but not yet verified.", sources: ["Remedies & follow-ups", "Follow-up Caller"] },
    { q: "Draft a reply to Sanwariya Hotel", a: "Draft (not sent):\n\n“Namaste Bhandari ji, thank you for choosing Shipra Advisory. For a 22-room hotel at Omkareshwar we visit with two people: Rajendra-ji and our surveyor Saurabh. Thursday 22 Oct, 3 PM works. The commercial package is ₹95,000 + GST; a 30% advance of ₹33,630 confirms the slot. Please share the building plan PDF before the visit. — Pooja, Shipra Advisory”", sources: ["Consultations", "Fees & packages"] },
  ],
  run: {
    label: "Runs every morning at 8. You can also run it now.",
    title: "Practice Watcher",
    steps: [
      { text: "Read this week's 16 consultations and 3 people's calendars", result: "3 slots waiting on advance, 1 clash on Thursday" },
      { text: "Check every open site audit against the 12-step checklist", result: "Mahakal survey today, 2 reports waiting on owner" },
      { text: "Scan remedies installed in the last 90 days", result: "4 Day-21 check-ins due, 3 installs unverified" },
      { text: "Score cohort attendance and assignments", result: "VV7 at 87%, 2 members at risk" },
      { text: "Match Razorpay and Tally receipts to invoices", result: "₹2.6 L due, ₹61,200 over 60 days" },
    ],
    outcome: "Send the three advance links before noon, sign off the Jain report before the 2 PM walkthrough, and call Vinod Bansal yourself. Everything else the agents can carry today.",
    actions: ["Send 3 advance links", "Open Jain report for sign-off", "Schedule call with Vinod Bansal", "Send 4 Day-21 check-ins"],
  },
};

/* ============================================================
   Desk
   ============================================================ */

export default function AdvisoryDesk() {
  const [applied, setApplied] = React.useState<Record<string, string[]>>(seedApplied);
  const [bookings, setBookings] = React.useState(seedBookings);
  const openZones = sites.reduce((a, s) => a + (Object.values(s.findings) as Finding[]).filter((f) => effective(f, applied[s.id] ?? []) !== "ok").length, 0);

  const modules: DeskModule[] = [
    { id: "mandala", label: "Mandala", group: "Practice", count: openZones, title: "The Vastu mandala", blurb: "Each client's floor plan under the 81-pada Vastu Purusha mandala. Read a zone, choose remedies, watch the harmony move.", icon: Compass, notes: ["The plan sits under a 9 × 9 grid; north is up. Each 3 × 3 block is one zone, the centre block is Brahmasthan.", "Zones are tinted by severity. Click any pada for the finding and the remedies; ticking a remedy updates the harmony score live.", "The door mark shows which of the 32 outer padas the entrance falls on."], render: () => <MandalaHome applied={applied} setApplied={setApplied} bookings={bookings} /> },
    { id: "consults", label: "Consultations", group: "Practice", count: bookings.filter((b) => b.status === "Advance due").length, title: "Consultations", blurb: "The week across three calendars: surveys, office consults, video calls and cohort sessions", icon: CalendarDays, render: () => <ConsultsTab bookings={bookings} setBookings={setBookings} /> },
    { id: "audits", label: "Site audits", group: "Clients", count: seedAudits.filter((a) => a.status !== "Sent").length, title: "Site audits", blurb: "Every survey from compass reading to delivered report", icon: ClipboardCheck, render: () => <AuditsTab /> },
    { id: "cohorts", label: "Coaching cohorts", group: "Clients", count: cohorts.length, title: "Coaching cohorts", blurb: "Batches, sessions, attendance and the homework that makes coaching stick", icon: GraduationCap, render: () => <CohortsTab /> },
    { id: "remedies", label: "Remedies & follow-ups", group: "Clients", count: seedRemedies.filter((r) => r.status !== "Verified").length, title: "Remedies & follow-ups", blurb: "What was advised, what got installed, and what clients say on Day 7, 21 and 90", icon: Sparkles, render: () => <RemediesTab /> },
    { id: "fees", label: "Fees & packages", group: "Money", count: seedInvoices.filter((i) => due(i) > 0).length, title: "Fees & packages", blurb: "Packages, GST invoices, instalments and who still owes what", icon: IndianRupee, render: () => <FeesTab /> },
    { id: "team", label: "People", group: "Office", title: "People", blurb: "Consultant, surveyor, coach and the office: who is carrying what today", icon: Users, render: () => <PeopleModule members={team} /> },
    { id: "agents", label: "Agents", group: "Office", title: "Agents", blurb: "Six AI agents doing the booking, drafting and chasing", icon: Bot, render: () => <AgentsModule agents={agents} /> },
    { id: "independence", label: "Independence", group: "Office", title: "Owner independence", blurb: "How much of Shipra runs without Rajendra on site", icon: GaugeIcon, render: () => <IndependenceModule data={independence} /> },
    { id: "connections", label: "Connections", group: "Office", title: "Connections", blurb: "WhatsApp, Tally, calendars, payments and the survey app", icon: Plug, render: () => <ConnectionsModule items={integrations} /> },
  ];

  return <DeskShell config={config} modules={modules} />;
}

/* ---------------- Home: mandala ---------------- */

function AnimatedNumber({ value }: { value: number }) {
  const [shown, setShown] = React.useState(value);
  const from = React.useRef(value);
  React.useEffect(() => {
    const start = from.current;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / 700);
      const v = start + (value - start) * (1 - Math.pow(1 - p, 3));
      setShown(v);
      from.current = v;
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{Math.round(shown)}</>;
}

function HarmonyRing({ value, base, max }: { value: number; base: number; max: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const tone = value >= 75 ? "ok" : value >= 60 ? "warn" : "late";
  return (
    <div className="relative h-[132px] w-[132px] shrink-0">
      <svg viewBox="0 0 132 132" className="-rotate-90">
        <circle cx="66" cy="66" r={r} fill="none" stroke="var(--d-sunk)" strokeWidth="10" />
        <circle cx="66" cy="66" r={r} fill="none" stroke="var(--d-line)" strokeWidth="10" strokeDasharray={`${(max / 100) * c} ${c}`} />
        <circle cx="66" cy="66" r={r} fill="none" stroke={toneVar(tone)} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(value / 100) * c} ${c}`} style={{ transition: "stroke-dasharray 700ms cubic-bezier(.2,.7,.2,1), stroke 400ms" }} />
        <circle cx="66" cy="66" r={r - 9} fill="none" stroke="var(--d-ink)" strokeOpacity="0.5" strokeWidth="1" strokeDasharray={`${(base / 100) * 2 * Math.PI * (r - 9)} 999`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="desk-h tnum text-[38px] font-semibold leading-none">
          <AnimatedNumber value={value} />
        </span>
        <span className="mt-1 text-[10.5px] uppercase tracking-[0.18em] text-d-mute">harmony</span>
      </div>
    </div>
  );
}

const CELL = 56;
const SPAN = CELL * 9;

function MandalaSvg({ site, applied, zone, onZone }: { site: Site; applied: string[]; zone: ZoneId; onZone: (z: ZoneId) => void }) {
  const [hover, setHover] = React.useState<{ r: number; c: number } | null>(null);
  const ent = site.entrance;
  const entX = ent.side === "e" ? SPAN : ent.side === "w" ? 0 : ent.c * CELL + CELL / 2;
  const entY = ent.side === "s" ? SPAN : ent.side === "n" ? 0 : ent.r * CELL + CELL / 2;
  const entVertical = ent.side === "e" || ent.side === "w";
  const hz = hover ? zoneOf(hover.r, hover.c) : null;
  const dirs = [
    { l: "N · Uttar", x: SPAN / 2, y: -16 },
    { l: "S · Dakshin", x: SPAN / 2, y: SPAN + 26 },
    { l: "NE · Ishan", x: SPAN + 4, y: -16, a: "end" as const },
    { l: "NW · Vayavya", x: -4, y: -16, a: "start" as const },
    { l: "SE · Agneya", x: SPAN + 4, y: SPAN + 26, a: "end" as const },
    { l: "SW · Nairutya", x: -4, y: SPAN + 26, a: "start" as const },
  ];
  return (
    <div>
      <svg viewBox={`-30 -36 ${SPAN + 60} ${SPAN + 72}`} className="w-full select-none" role="img" aria-label={`Vastu mandala over ${site.name}`}>
        <defs>
          <pattern id="adv-paper" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="0.6" fill="var(--d-ink)" opacity="0.07" />
          </pattern>
          <radialGradient id="adv-glow">
            <stop offset="0%" stopColor="var(--d-warn)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--d-warn)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x={-8} y={-8} width={SPAN + 16} height={SPAN + 16} fill="var(--d-panel)" stroke="var(--d-ink)" strokeWidth="1" />
        <rect x={0} y={0} width={SPAN} height={SPAN} fill="url(#adv-paper)" />
        {/* floor plan */}
        <g key={site.id} className="desk-rise">
          {site.rooms.map((room) => (
            <g key={room.label}>
              <rect x={room.x * CELL + 3} y={room.y * CELL + 3} width={room.w * CELL - 6} height={room.h * CELL - 6} fill="var(--d-sunk)" fillOpacity="0.55" stroke="var(--d-ink)" strokeOpacity="0.75" strokeWidth="2.5" rx="1" />
              <text x={(room.x + room.w / 2) * CELL} y={(room.y + room.h / 2) * CELL + 4} textAnchor="middle" className="font-serif" fontStyle="italic" fontSize="13" fill="var(--d-ink)" opacity="0.8">
                {room.label}
              </text>
            </g>
          ))}
        </g>
        {/* padas */}
        {Array.from({ length: 81 }, (_, i) => {
          const r = Math.floor(i / 9);
          const c = i % 9;
          const z = zoneOf(r, c);
          const sev = effective(site.findings[z], applied);
          const on = z === zone;
          const hot = hz === z;
          return (
            <rect
              key={`${r}-${c}`}
              x={c * CELL}
              y={r * CELL}
              width={CELL}
              height={CELL}
              fill={sev === "ok" ? "transparent" : toneVar(sev)}
              fillOpacity={sev === "ok" ? 0 : on ? 0.34 : hot ? 0.26 : 0.16}
              stroke="var(--d-ink)"
              strokeOpacity={on ? 0.4 : 0.14}
              strokeWidth={0.8}
              className="cursor-pointer"
              style={{ transition: "fill 500ms, fill-opacity 300ms" }}
              onClick={() => onZone(z)}
              onPointerEnter={() => setHover({ r, c })}
              onPointerLeave={() => setHover(null)}
            />
          );
        })}
        {/* outer ring devtas */}
        {Object.entries(PADAS).map(([k, name]) => {
          const [r, c] = k.split("-").map(Number);
          return (
            <text key={k} x={c * CELL + CELL / 2} y={r * CELL + 12} textAnchor="middle" fontSize="7.5" fill="var(--d-mute)" pointerEvents="none" letterSpacing="0.02em">
              {name}
            </text>
          );
        })}
        {/* zone frames */}
        {[3, 6].map((k) => (
          <g key={k}>
            <line x1={k * CELL} x2={k * CELL} y1={0} y2={SPAN} stroke="var(--d-accent)" strokeOpacity="0.55" strokeWidth="1.4" />
            <line y1={k * CELL} y2={k * CELL} x1={0} x2={SPAN} stroke="var(--d-accent)" strokeOpacity="0.55" strokeWidth="1.4" />
          </g>
        ))}
        <rect x={CELL} y={CELL} width={CELL * 7} height={CELL * 7} fill="none" stroke="var(--d-warn)" strokeOpacity="0.55" strokeDasharray="2 4" />
        {/* selected zone outline */}
        {(() => {
          const [zr, zc] = (() => {
            for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) if (ZONE_GRID[a][b] === zone) return [a, b];
            return [1, 1];
          })();
          return <rect x={zc * 3 * CELL + 2} y={zr * 3 * CELL + 2} width={3 * CELL - 4} height={3 * CELL - 4} fill="none" stroke="var(--d-accent)" strokeWidth="3" className="desk-flow" pointerEvents="none" style={{ transition: "x 300ms, y 300ms" }} />;
        })()}
        {/* Purusha axis: head NE, feet SW */}
        <line x1={SPAN - 10} y1={10} x2={10} y2={SPAN - 10} stroke="var(--d-warn)" strokeWidth="1.4" className="desk-flow" pointerEvents="none" opacity="0.8" />
        <text x={SPAN - 14} y={30} textAnchor="end" fontSize="9" fill="var(--d-warn)" className="font-serif" fontStyle="italic" pointerEvents="none">
          Purusha&apos;s head
        </text>
        <text x={14} y={SPAN - 18} fontSize="9" fill="var(--d-warn)" className="font-serif" fontStyle="italic" pointerEvents="none">
          feet
        </text>
        {/* Brahmasthan */}
        <circle cx={SPAN / 2} cy={SPAN / 2} r="60" fill="url(#adv-glow)" pointerEvents="none">
          <animate attributeName="r" values="44;70;44" dur="5s" repeatCount="indefinite" />
        </circle>
        <circle cx={SPAN / 2} cy={SPAN / 2 - 22} r="3.5" fill="var(--d-accent)" pointerEvents="none" />
        {/* entrance */}
        <g pointerEvents="none">
          <rect x={entVertical ? entX - 5 : entX - 22} y={entVertical ? entY - 22 : entY - 5} width={entVertical ? 10 : 44} height={entVertical ? 44 : 10} fill="var(--d-accent)" rx="2" />
          <text x={entVertical ? entX + (ent.side === "e" ? -10 : 10) : entX} y={entVertical ? entY + 4 : entY + (ent.side === "s" ? -10 : 20)} textAnchor={entVertical ? (ent.side === "e" ? "end" : "start") : "middle"} fontSize="10" fontWeight="600" fill="var(--d-accent)">
            Entry
          </text>
        </g>
        {dirs.map((d) => (
          <text key={d.l} x={d.x} y={d.y} textAnchor={d.a ?? "middle"} fontSize="11" fontWeight="600" letterSpacing="0.14em" fill="var(--d-ink)" opacity="0.75">
            {d.l.toUpperCase()}
          </text>
        ))}
        <text x={SPAN + 22} y={SPAN / 2} fontSize="11" fontWeight="600" letterSpacing="0.14em" fill="var(--d-ink)" opacity="0.75" transform={`rotate(90 ${SPAN + 22} ${SPAN / 2})`} textAnchor="middle">
          E · PURVA
        </text>
        <text x={-22} y={SPAN / 2} fontSize="11" fontWeight="600" letterSpacing="0.14em" fill="var(--d-ink)" opacity="0.75" transform={`rotate(-90 -22 ${SPAN / 2})`} textAnchor="middle">
          W · PASCHIM
        </text>
      </svg>
      <p className="mt-1 min-h-[20px] text-center font-mono text-[11.5px] text-d-mute">
        {hover ? `${PADAS[`${hover.r}-${hover.c}`] ? `Pada ${PADAS[`${hover.r}-${hover.c}`]} · ` : hover.r >= 3 && hover.r <= 5 && hover.c >= 3 && hover.c <= 5 ? "Brahma pada · " : ""}${ZONES[zoneOf(hover.r, hover.c)].name} (${ZONES[zoneOf(hover.r, hover.c)].dir})` : `Entrance on ${PADAS[`${ent.r}-${ent.c}`] ?? "—"} pada · hover any pada to read it`}
      </p>
    </div>
  );
}

function MandalaHome({ applied, setApplied, bookings }: { applied: Record<string, string[]>; setApplied: React.Dispatch<React.SetStateAction<Record<string, string[]>>>; bookings: Booking[] }) {
  const desk = useDesk();
  const [siteId, setSiteId] = React.useState(sites[0].id);
  const [zone, setZone] = React.useState<ZoneId>("ne");
  const site = sites.find((s) => s.id === siteId)!;
  const mine = applied[site.id] ?? [];
  const score = siteScore(site, mine);
  const finding = site.findings[zone];
  const Z = ZONES[zone];
  const sev = effective(finding, mine);
  const ZIcon = Z.icon;
  const ordered: ZoneId[] = ["ne", "e", "se", "s", "sw", "w", "nw", "n", "c"];
  const costDone = Object.values(site.findings).flatMap((f) => f.remedies).filter((r) => mine.includes(r.id)).reduce((a, r) => a + r.cost, 0);

  function toggle(rem: Remedy) {
    const on = mine.includes(rem.id);
    setApplied((cur) => ({ ...cur, [site.id]: on ? (cur[site.id] ?? []).filter((x) => x !== rem.id) : [...(cur[site.id] ?? []), rem.id] }));
    if (!on) {
      toast.success(`Remedy added for ${site.name}`, { description: `${rem.title} · +${rem.gain} harmony` });
      desk.log(`${site.name}: ${rem.title} added to the plan`, "ok");
    } else desk.log(`${site.name}: ${rem.title} removed`, "neutral");
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Consultations this month" value="38" delta="+9" hint="vs September" icon={CalendarDays} trend={[22, 25, 24, 29, 31, 29, 38]} />
        <Stat label="Average harmony lift" value="+19 pts" delta="+3" hint="after 90 days, 26 sites" icon={Compass} tone="ok" trend={[12, 13, 15, 14, 16, 17, 19]} />
        <Stat label="Remedies verified" value="72%" delta="+6%" hint="client-confirmed on Day 21" icon={Sparkles} tone="warn" trend={[54, 58, 61, 63, 66, 68, 72]} />
        <Stat label="Fees collected, Oct" value="₹6.8 L" delta="+14%" hint="Vastu ₹4.1 L · coaching ₹2.7 L" icon={IndianRupee} trend={[4.2, 4.9, 5.1, 5.6, 5.4, 6.0, 6.8]} />
      </div>

      <Panel
        title={
          <span>
            {site.name} <span className="font-serif text-[15px] font-normal italic text-d-mute">· {site.place}</span>
          </span>
        }
        sub={`${site.owner} · ${site.kind} · ${site.plot} · ${site.facing}`}
        action={<Segmented size="sm" options={sites.map((s) => {
              const KIcon = s.kind === "Residence" ? House : s.kind === "Factory" ? Factory : Store;
              return { value: s.id, label: <span className="inline-flex items-center gap-1.5"><KIcon className="h-3.5 w-3.5" />{s.name.split(" ")[0]}</span> };
            })} value={siteId} onChange={(v) => { setSiteId(v); setZone("ne"); }} />}
      >
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div>
            <MandalaSvg site={site} applied={mine} zone={zone} onZone={setZone} />
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {ordered.map((z) => {
                const s = effective(site.findings[z], mine);
                return (
                  <button key={z} type="button" onClick={() => setZone(z)} className={`inline-flex items-center gap-1.5 rounded-[3px] border px-2 py-1 text-[12px] transition-colors ${z === zone ? "border-d-ink bg-d-ink text-d-paper" : "border-d-line hover:bg-d-sunk"}`}>
                    <span className="h-2 w-2 rounded-full" style={{ background: toneVar(s) }} />
                    {ZONES[z].name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-5 border-b border-d-line pb-5">
              <HarmonyRing value={score} base={site.base} max={siteMax(site)} />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-d-accent">Harmony score</p>
                <p className="mt-1 font-serif text-[15px] italic leading-snug text-d-mute">
                  Surveyed at {site.base}. With every remedy, this site reaches {siteMax(site)}.
                </p>
                <p className="mt-2 text-[13px]">
                  <b className="tnum">{mine.length}</b> {mine.length === 1 ? "remedy" : "remedies"} chosen · <span className="tnum font-mono">{inr(costDone)}</span> estimated
                </p>
              </div>
            </div>

            <div key={`${site.id}-${zone}`} className="desk-rise pt-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-d-mute">{Z.dir} · {Z.element} · {Z.lord}</p>
                  <h3 className="desk-h mt-1 flex items-center gap-2 text-[30px] font-semibold leading-none">
                    <ZIcon className="h-6 w-6 text-d-accent" strokeWidth={1.6} />
                    {Z.name}
                  </h3>
                </div>
                <Pill tone={sev}>{sev === "ok" ? "In harmony" : sev === "warn" ? "Needs attention" : "Serious dosha"}</Pill>
              </div>
              <p className="mt-2 font-serif text-[14px] italic text-d-mute">Best for: {Z.ideal}</p>
              <div className="mt-4 space-y-3 text-[14px] leading-relaxed">
                <p>
                  <span className="mr-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-d-accent">Found</span>
                  {finding.found}
                </p>
                <p>
                  <span className="mr-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-d-accent">Why</span>
                  {finding.problem}
                </p>
              </div>
              {finding.remedies.length > 0 ? (
                <ul className="mt-4 divide-y divide-d-line border-y border-d-line">
                  {finding.remedies.map((rem) => {
                    const on = mine.includes(rem.id);
                    return (
                      <li key={rem.id}>
                        <button type="button" onClick={() => toggle(rem)} className="flex w-full items-center gap-3 py-2.5 text-left hover:bg-d-sunk/60">
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[3px] border transition-colors ${on ? "border-d-accent bg-d-accent text-d-accent-ink" : "border-d-mute bg-d-panel"}`}>{on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}</span>
                          <span className="min-w-0 flex-1">
                            <span className={`block text-[13.5px] font-medium ${on ? "text-d-mute line-through decoration-d-accent/50" : ""}`}>{rem.title}</span>
                            <span className="block text-[11.5px] text-d-mute">
                              {rem.kind} · {rem.cost ? inr(rem.cost) : "no cost"}
                            </span>
                          </span>
                          <span className="tnum font-mono text-[12.5px] font-semibold text-d-ok">+{rem.gain}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-4 border-y border-d-line py-3 font-serif text-[14px] italic text-d-ok">Nothing to correct here. We note it in the report so the family keeps it this way.</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Btn
                  size="sm"
                  variant="solid"
                  icon={Send}
                  onClick={() => {
                    toast.success("Remedy list sent on WhatsApp", { description: `${site.owner} · ${mine.length} remedies, ${inr(costDone)}` });
                    desk.log(`Remedy list sent to ${site.owner}`, "info");
                  }}
                >
                  Send remedy list
                </Btn>
                <Btn size="sm" icon={FileText} onClick={() => desk.goTab("audits")}>
                  Open report
                </Btn>
                <Btn size="sm" variant="ghost" icon={MessageCircle} onClick={() => desk.openAsk(`What should I tell ${site.owner.split(" ")[0]} about ${Z.name}?`)}>
                  Ask
                </Btn>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid gap-8 lg:grid-cols-3">
        <Panel icon={CalendarDays} title="Today at the practice" sub="Tuesday 20 October" action={<Btn size="sm" variant="ghost" icon={ArrowRight} onClick={() => desk.goTab("consults")}>Week</Btn>}>
          <Feed
            items={bookings
              .filter((b) => b.day === TODAY_IDX)
              .sort((a, b) => a.at - b.at)
              .map((b) => ({ time: hourLabel(b.at), who: b.mode, text: `${b.client} · ${b.kind}${b.status === "Advance due" ? " (advance due)" : ""}`, tone: b.status === "Advance due" ? ("warn" as Tone) : kindTone[b.kind] }))}
          />
        </Panel>
        <Panel icon={Compass} title="Before and after" sub="Harmony at survey and at the 90-day check, last 7 sites">
          <Bars
            height={170}
            data={[
              { l: "Sharma", b: 54, a: 79 },
              { l: "Chouhan", b: 61, a: 82 },
              { l: "Kothari", b: 49, a: 71 },
              { l: "Rathore", b: 66, a: 80 },
              { l: "Bairagi", b: 58, a: 74 },
              { l: "Dewas Agro", b: 44, a: 63 },
              { l: "Mandloi", b: 63, a: 78 },
            ].map((x) => ({ label: x.l, value: x.a, stack: [{ name: "At survey", value: x.b, tone: "neutral" as Tone }, { name: "Lift after remedies", value: x.a - x.b, tone: "ok" as Tone }] }))}
          />
        </Panel>
        <Panel icon={AlertTriangle} title="Open doshas" sub="Across the three live sites">
          <ul className="space-y-3">
            {sites.map((s) => {
              const open = (Object.keys(s.findings) as ZoneId[]).filter((z) => effective(s.findings[z], applied[s.id] ?? []) !== "ok");
              return (
                <li key={s.id}>
                  <button type="button" onClick={() => { setSiteId(s.id); if (open[0]) setZone(open[0]); }} className="w-full text-left">
                    <p className="flex items-baseline justify-between gap-2">
                      <span className="desk-h text-[15.5px] font-semibold">{s.name}</span>
                      <span className="tnum font-mono text-[12px]">{siteScore(s, applied[s.id] ?? [])} / {siteMax(s)}</span>
                    </p>
                    <Meter value={siteScore(s, applied[s.id] ?? [])} max={100} tone={siteScore(s, applied[s.id] ?? []) >= 70 ? "ok" : "warn"} className="mt-1.5" height={4} />
                    <p className="mt-1.5 flex flex-wrap gap-1">
                      {open.length ? open.map((z) => <Pill key={z} tone={effective(s.findings[z], applied[s.id] ?? [])}>{ZONES[z].name}</Pill>) : <Pill tone="ok">All zones in harmony</Pill>}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

/* ---------------- Consultations ---------------- */

function ConsultsTab({ bookings, setBookings }: { bookings: Booking[]; setBookings: React.Dispatch<React.SetStateAction<Booking[]>> }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<string | null>(null);
  const [slot, setSlot] = React.useState<{ day: number; at: number } | null>(null);
  const booking = bookings.find((b) => b.id === open) ?? null;
  const fees = bookings.filter((b) => b.status !== "Done").reduce((a, b) => a + kindFee[b.kind], 0);
  const busy = (day: number, at: number) => bookings.some((b) => b.day === day && at >= b.at && at < b.at + b.dur);

  function update(id: string, patch: Partial<Booking>, msg: string) {
    setBookings((cur) => cur.map((b) => (b.id === id ? { ...b, ...patch } : b)));
    toast.success(msg);
    desk.log(msg);
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Booked this week" value={bookings.length} delta="+4" hint="vs last week" icon={CalendarDays} trend={[9, 11, 10, 12, 13, 12, bookings.length]} />
        <Stat label="Advance due" value={bookings.filter((b) => b.status === "Advance due").length} hint="links sent on WhatsApp" icon={HandCoins} tone="warn" />
        <Stat label="Site visits" value={bookings.filter((b) => b.mode === "Site visit").length} hint="Ujjain, Nagda, Omkareshwar" icon={House} tone="info" />
        <Stat label="Fees on the calendar" value={inr(fees, { compact: true })} delta="+18%" hint="excl. GST" icon={IndianRupee} trend={[1.1, 1.4, 1.3, 1.6, 1.8, 1.9, fees / 1e5]} />
      </div>

      <Panel title="The week" sub="Click an empty slot to book; click a booking to confirm, move or close it. 1–2 PM is kept for lunch and travel." action={<Btn size="sm" variant="solid" icon={Plus} onClick={() => setSlot({ day: 2, at: 17 })}>New consultation</Btn>}>
        <div className="desk-scroll -mx-5 overflow-x-auto px-5">
          <div className="grid min-w-[860px]" style={{ gridTemplateColumns: "64px repeat(6, minmax(120px, 1fr))", gridTemplateRows: `34px repeat(${HOURS.length}, 54px)` }}>
            {DAYS.map((d, i) => (
              <div key={d} className={`flex items-end justify-center border-b-2 pb-1.5 text-[13px] font-semibold ${i === TODAY_IDX ? "border-d-accent text-d-accent" : "border-d-ink"}`} style={{ gridColumn: i + 2, gridRow: 1 }}>
                <span className="desk-h">{d}</span>
                {i === TODAY_IDX && <span className="ml-1.5 font-serif text-[11px] font-normal italic">today</span>}
              </div>
            ))}
            {HOURS.map((h, hi) => (
              <div key={h} className="pr-2 pt-1 text-right font-mono text-[10.5px] text-d-mute" style={{ gridColumn: 1, gridRow: hi + 2 }}>
                {hourLabel(h)}
              </div>
            ))}
            {HOURS.flatMap((h, hi) =>
              DAYS.map((d, di) => (
                <button
                  key={`${d}-${h}`}
                  type="button"
                  disabled={h === 13 || busy(di, h)}
                  onClick={() => setSlot({ day: di, at: h })}
                  className={`group border-b border-l border-d-line/80 text-[11px] text-d-mute transition-colors ${h === 13 ? "bg-[repeating-linear-gradient(135deg,transparent_0_6px,color-mix(in_oklab,var(--d-line)_60%,transparent)_6px_7px)]" : "hover:bg-d-soft"} ${di === TODAY_IDX ? "bg-d-sunk/40" : ""}`}
                  style={{ gridColumn: di + 2, gridRow: hi + 2 }}
                  aria-label={`Book ${d} ${hourLabel(h)}`}
                >
                  {h !== 13 && <span className="opacity-0 group-hover:opacity-100">+ book</span>}
                </button>
              )),
            )}
            {bookings.map((b) => {
              const tone = b.status === "Done" ? "neutral" : kindTone[b.kind];
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setOpen(b.id)}
                  className="desk-rise z-[1] m-[3px] flex flex-col overflow-hidden rounded-[3px] border-l-[3px] px-2 py-1 text-left transition-transform hover:-translate-y-px"
                  style={{ gridColumn: b.day + 2, gridRow: `${HOURS.indexOf(b.at) + 2} / span ${b.dur}`, borderColor: toneVar(tone), background: `color-mix(in oklab, ${toneVar(tone)} 13%, var(--d-panel))`, opacity: b.status === "Done" ? 0.6 : 1 }}
                >
                  <span className="truncate text-[12px] font-semibold leading-tight">{b.client}</span>
                  <span className="truncate text-[10.5px] text-d-mute">
                    {b.kind} · {b.mode}
                  </span>
                  {b.status === "Advance due" && <span className="mt-auto truncate text-[10px] font-semibold text-d-warn">advance due</span>}
                </button>
              );
            })}
          </div>
        </div>
      </Panel>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <Panel icon={MessageCircle} title="New enquiries" sub="From WhatsApp, Instagram and referrals. Confirm sends the slot and an advance link.">
          <ApprovalQueue
            approveLabel="Confirm slot"
            holdLabel="Later"
            items={[
              { id: "e1", title: "Bairagi family · Griha Vastu", sub: "Referral from Chouhan · Mahakal Vanijya, Ujjain · wants Sat morning", amount: inr(21000), meta: "Referral", tone: "ok" },
              { id: "e2", title: "Om Sai Petrol Pump · Commercial", sub: "Instagram · Maksi Road · new pump, plan stage", amount: inr(51000), meta: "Instagram", tone: "info" },
              { id: "e3", title: "Pallavi Dixit · Plot selection", sub: "WhatsApp · 2 plots in Mahananda Nagar · Fri evening", amount: inr(11000), meta: "WhatsApp" },
              { id: "e4", title: "Ritesh Agrawal · Vyapar Vriddhi B8", sub: "Cohort waitlist · steel trader, Dewas", amount: inr(45000), meta: "Cohort", tone: "accent" },
              { id: "e5", title: "Gupta flat, Bengaluru · Remote Vastu", sub: "JustDial · plan only, video consult", amount: inr(15000), meta: "JustDial" },
            ]}
            onDecide={(id, d) => d === "approved" && desk.log(`Enquiry ${id} confirmed, advance link sent`, "ok")}
          />
        </Panel>
        <Panel title="What people book" sub="This month, by type">
          <Donut
            center="38"
            sub="consults"
            segments={[
              { label: "Griha Vastu", value: 14, tone: "accent" },
              { label: "Commercial Vastu", value: 6, tone: "late" },
              { label: "Plot selection", value: 9, tone: "warn" },
              { label: "Coaching 1:1", value: 7, tone: "info" },
              { label: "Muhurat", value: 2, tone: "ok" },
            ]}
          />
          <div className="mt-6">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-d-mute">Where they came from</p>
            <HBars data={[{ label: "Referrals", value: 16, tone: "ok" }, { label: "WhatsApp forwards", value: 9 }, { label: "Instagram", value: 7, tone: "info" }, { label: "JustDial", value: 4, tone: "warn" }, { label: "Cohort alumni", value: 2 }]} />
          </div>
        </Panel>
      </div>

      <Sheet
        open={!!booking}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={booking ? `${DAYS[booking.day]} Oct · ${hourLabel(booking.at)} · ${booking.dur}h` : ""}
        title={booking?.client ?? ""}
        sub={booking ? `${booking.kind} · ${booking.mode} · ${booking.where}` : ""}
        footer={
          booking && (
            <>
              <Btn icon={ArrowRight} disabled={booking.day >= 5} onClick={() => update(booking.id, { day: booking.day + 1 }, `${booking.client} moved to ${DAYS[booking.day + 1]}`)}>
                Next day
              </Btn>
              {booking.status === "Advance due" && (
                <Btn icon={HandCoins} onClick={() => update(booking.id, { status: "Confirmed" }, `Advance received from ${booking.client}`)}>
                  Mark advance paid
                </Btn>
              )}
              <Btn variant="solid" icon={Check} disabled={booking.status === "Done"} onClick={() => { update(booking.id, { status: "Done" }, `${booking.client} consultation closed`); setOpen(null); }}>
                Mark done
              </Btn>
            </>
          )
        }
      >
        {booking && (
          <div className="space-y-5">
            <KV items={[{ k: "Status", v: <Pill tone={booking.status === "Done" ? "neutral" : booking.status === "Advance due" ? "warn" : "ok"}>{booking.status}</Pill> }, { k: "Package fee", v: kindFee[booking.kind] ? `${inr(kindFee[booking.kind])} + GST` : "Included" }, { k: "Phone", v: booking.phone }, { k: "With", v: booking.mode === "Site visit" ? "Rajendra + Saurabh" : booking.kind === "Cohort" ? "Rajendra / Kavita" : "Rajendra" }]} />
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-d-mute">Bring / prepare</p>
              <Checklist
                items={[
                  { id: "p1", label: "Plan PDF or hand sketch received", done: booking.status !== "Advance due" },
                  { id: "p2", label: "Owner's concerns noted on WhatsApp", done: true },
                  { id: "p3", label: booking.mode === "Site visit" ? "Compass kit, laser meter, 9 m tape" : "Meeting link shared", done: booking.status === "Done" },
                ]}
                onToggle={() => toast("Prep list is kept by Pooja", { description: "Ask her on WhatsApp to update it." })}
              />
            </div>
            <div className="rounded-[4px] bg-[#e7f3df] p-4 text-[13.5px] leading-relaxed text-[#1f3a1b]">
              Namaste, a reminder from Shipra Advisory: your {booking.kind} consultation is on {DAYS[booking.day]} Oct at {hourLabel(booking.at)} ({booking.where}). Please keep the plan and any old reports handy. — Pooja
            </div>
            <Btn icon={Send} onClick={() => { toast.success("Reminder sent on WhatsApp", { description: booking.client }); desk.log(`Reminder sent to ${booking.client}`); }}>
              Send reminder
            </Btn>
          </div>
        )}
      </Sheet>

      <BookModal
        slot={slot}
        onClose={() => setSlot(null)}
        onAdd={(b) => {
          setBookings((cur) => [...cur, b]);
          toast.success(`Booked ${b.client}`, { description: `${DAYS[b.day]} ${hourLabel(b.at)} · advance link ${kindFee[b.kind] ? inr(Math.round(kindFee[b.kind] * 0.5 * 1.18)) : "not needed"}` });
          desk.log(`New ${b.kind} booked: ${b.client}, ${DAYS[b.day]} ${hourLabel(b.at)}`, "info");
        }}
        busy={busy}
      />
    </div>
  );
}

function BookModal({ slot, onClose, onAdd, busy }: { slot: { day: number; at: number } | null; onClose: () => void; onAdd: (b: Booking) => void; busy: (d: number, h: number) => boolean }) {
  const [client, setClient] = React.useState("Pallavi Dixit");
  const [phone, setPhone] = React.useState("98935 ");
  const [kind, setKind] = React.useState<Kind>("Plot selection");
  const [mode, setMode] = React.useState<Booking["mode"]>("Office");
  const [day, setDay] = React.useState(2);
  const [at, setAt] = React.useState(17);
  const [seen, setSeen] = React.useState<typeof slot>(null);
  if (slot && slot !== seen) {
    setSeen(slot);
    setDay(slot.day);
    setAt(slot.at);
  }
  const clash = busy(day, at);
  return (
    <Modal open={!!slot} onOpenChange={(o) => !o && onClose()} title="New consultation" sub="Pooja sends the slot and a 50% advance link on WhatsApp the moment you save.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (clash) return;
          onAdd({ id: `b-${client}-${day}-${at}`, day, at, dur: mode === "Site visit" ? 2 : 1, client, kind, mode, where: mode === "Office" ? "Office, Nanakheda" : mode === "Video" ? "Zoom" : "Client site", phone, status: kindFee[kind] ? "Advance due" : "Confirmed" });
          onClose();
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Client">
            <input className={inputClass} value={client} onChange={(e) => setClient(e.target.value)} />
          </Field>
          <Field label="WhatsApp">
            <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Consultation">
            <select className={inputClass} value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
              {(Object.keys(kindFee) as Kind[]).map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </Field>
          <Field label="Where">
            <select className={inputClass} value={mode} onChange={(e) => setMode(e.target.value as Booking["mode"])}>
              {["Office", "Site visit", "Video"].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Day">
            <select className={inputClass} value={day} onChange={(e) => setDay(Number(e.target.value))}>
              {DAYS.map((d, i) => (
                <option key={d} value={i}>
                  {d} Oct
                </option>
              ))}
            </select>
          </Field>
          <Field label="Time">
            <select className={inputClass} value={at} onChange={(e) => setAt(Number(e.target.value))}>
              {HOURS.filter((h) => h !== 13).map((h) => (
                <option key={h} value={h}>
                  {hourLabel(h)}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <p className={`text-[12.5px] ${clash ? "text-d-late" : "text-d-mute"}`}>
          {clash ? "That slot is taken. Pick another time." : kindFee[kind] ? `Fee ${inr(kindFee[kind])} + 18% GST · advance ${inr(Math.round(kindFee[kind] * 0.5 * 1.18))}` : "No fee: included in the package."}
        </p>
        <div className="flex justify-end gap-2 pt-1">
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="solid" type="submit" icon={Plus} disabled={clash || !client.trim()}>
            Book and send link
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Site audits ---------------- */

function AuditsTab() {
  const desk = useDesk();
  const [audits, setAudits] = React.useState(seedAudits);
  const [checks, setChecks] = React.useState<Record<string, number[]>>(() => Object.fromEntries(seedAudits.map((a) => [a.id, Array.from({ length: a.done }, (_, i) => i)])));
  const [open, setOpen] = React.useState<string | null>(null);
  const audit = audits.find((a) => a.id === open) ?? null;
  const statuses: AuditStatus[] = ["Scheduled", "Measured", "Drafting", "Review", "Sent"];

  function setStatus(id: string, s: AuditStatus) {
    setAudits((cur) => cur.map((a) => (a.id === id ? { ...a, status: s } : a)));
    desk.log(`${id} report → ${s}`, s === "Sent" ? "ok" : "info");
    toast.success(`${id} moved to ${s}`, { description: s === "Sent" ? "PDF report shared on WhatsApp and email" : undefined });
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Audits this month" value={audits.length} delta="+3" hint="7 cities" icon={ClipboardCheck} trend={[6, 7, 8, 8, 10, 11, audits.length]} />
        <Stat label="Reports pending" value={audits.filter((a) => a.status === "Drafting" || a.status === "Review").length} delta="+1" deltaGood={false} hint="2 wait on Rajendra" icon={FileText} tone="warn" />
        <Stat label="Report turnaround" value="6.2 d" delta="-0.8 d" deltaGood hint="target 4 days" icon={Timer} trend={[9, 8.5, 8.1, 7.4, 7, 6.8, 6.2]} />
        <Stat label="Photos on Drive" value={audits.reduce((a, x) => a + x.photos, 0)} hint="9 spots per site minimum" icon={Camera} tone="info" />
      </div>

      <Panel title="Report pipeline" sub="From survey to delivered PDF">
        <div className="grid grid-cols-5 gap-2">
          {statuses.map((s) => {
            const n = audits.filter((a) => a.status === s).length;
            return (
              <div key={s} className="border-t-2 pt-2" style={{ borderColor: toneVar(auditTone[s]) }}>
                <p className="desk-h tnum text-[30px] font-semibold leading-none">{n}</p>
                <p className="mt-1 text-[12.5px] text-d-mute">{s}</p>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
        <Panel title="Audit register" sub="Click an audit for its 12-step checklist, photos and report status">
          <DataTable
            rows={audits}
            rowKey={(a) => a.id}
            search={(a) => `${a.id} ${a.client} ${a.city} ${a.type}`}
            searchPlaceholder="Search client, city or SA no."
            filter={{ get: (a) => a.status, options: statuses }}
            onRow={(a) => setOpen(a.id)}
            bulk={[{ label: "Share reports on WhatsApp", run: (k) => { toast.success(`${k.length} reports shared`); desk.log(`${k.length} audit reports shared with clients`); } }]}
            columns={[
              { key: "id", label: "SA", render: (a) => <span className="font-mono text-[12px]">{a.id}</span>, sort: (a) => a.id },
              { key: "client", label: "Client", render: (a) => <span className="font-medium">{a.client}</span>, sort: (a) => a.client },
              { key: "type", label: "Site", render: (a) => <span className="text-d-mute">{a.type} · {a.city}</span>, wide: true },
              { key: "visit", label: "Visit", render: (a) => <span className="font-mono text-[12px]">{a.visit}</span> },
              {
                key: "prog",
                label: "Checklist",
                render: (a) => (
                  <div className="flex min-w-[100px] items-center gap-2">
                    <Meter value={(checks[a.id] ?? []).length} max={AUDIT_STEPS.length} tone={(checks[a.id] ?? []).length === AUDIT_STEPS.length ? "ok" : "warn"} height={4} />
                    <span className="font-mono text-[11px] text-d-mute">{(checks[a.id] ?? []).length}/12</span>
                  </div>
                ),
                sort: (a) => (checks[a.id] ?? []).length,
              },
              { key: "fee", label: "Fee", align: "right", render: (a) => <span className="tnum font-mono">{inr(a.fee, { compact: true })}</span>, sort: (a) => a.fee, wide: true },
              { key: "st", label: "Report", render: (a) => <Pill tone={auditTone[a.status]}>{a.status}</Pill> },
            ]}
          />
        </Panel>
        <Panel title="Most common doshas" sub="Last 60 audits">
          <HBars
            data={[
              { label: "Toilet or septic in NE", value: 19, tone: "late" },
              { label: "Kitchen outside SE", value: 15, tone: "warn" },
              { label: "Brahmasthan blocked", value: 13, tone: "late" },
              { label: "SW cut or water", value: 11, tone: "late" },
              { label: "Entrance on a weak pada", value: 10, tone: "warn" },
              { label: "Heavy load in north", value: 8 },
              { label: "Owner seated in NW", value: 6 },
            ]}
          />
        </Panel>
      </div>

      <Sheet
        open={!!audit}
        width={560}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={audit ? `${audit.id} · surveyor ${audit.surveyor}` : ""}
        title={audit?.client ?? ""}
        sub={audit ? `${audit.site} · ${audit.city} · ${audit.area}` : ""}
        footer={
          audit && (
            <>
              <Btn icon={FileText} onClick={() => { toast.success("Report Drafter started", { description: `Draft from ${(checks[audit.id] ?? []).length} checklist notes and ${audit.photos} photos` }); desk.log(`Report draft requested for ${audit.client}`); }}>
                Draft report
              </Btn>
              <Btn variant="solid" icon={Send} disabled={audit.status === "Sent"} onClick={() => setStatus(audit.id, "Sent")}>
                Send to client
              </Btn>
            </>
          )
        }
      >
        {audit && (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-d-mute">Report status</p>
              <Segmented size="sm" options={statuses} value={audit.status} onChange={(s) => setStatus(audit.id, s)} />
            </div>
            <KV cols={3} items={[{ k: "Visit", v: audit.visit }, { k: "Fee", v: inr(audit.fee) }, { k: "Photos", v: audit.photos }]} />
            <div>
              <p className="mb-2 flex justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-d-mute">
                <span>Survey checklist</span>
                <span className="font-mono normal-case tracking-normal">{(checks[audit.id] ?? []).length} of 12</span>
              </p>
              <Checklist
                items={AUDIT_STEPS.map((s, i) => ({ id: String(i), label: s, done: (checks[audit.id] ?? []).includes(i) }))}
                onToggle={(id) => {
                  const i = Number(id);
                  setChecks((cur) => {
                    const list = cur[audit.id] ?? [];
                    return { ...cur, [audit.id]: list.includes(i) ? list.filter((x) => x !== i) : [...list, i] };
                  });
                }}
              />
            </div>
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-d-mute">Site photos</p>
              <div className="grid grid-cols-3 gap-2">
                {PHOTO_SPOTS.map((spot, i) => {
                  const has = i < Math.min(9, Math.ceil(audit.photos / 4));
                  return (
                    <button
                      key={spot}
                      type="button"
                      onClick={() => {
                        if (has) return toast(spot, { description: `${audit.client} · opened from Google Drive` });
                        setAudits((cur) => cur.map((a) => (a.id === audit.id ? { ...a, photos: a.photos + 4 } : a)));
                        toast.success(`Photo request sent to ${audit.surveyor}`, { description: spot });
                      }}
                      className="relative flex aspect-[4/3] flex-col items-center justify-center gap-1 overflow-hidden rounded-[3px] border border-d-line text-[11px]"
                      style={{ background: has ? `linear-gradient(${30 + i * 37}deg, color-mix(in oklab, var(--d-warn) 30%, var(--d-sunk)), color-mix(in oklab, var(--d-accent) 18%, var(--d-panel)))` : "repeating-linear-gradient(135deg, var(--d-panel) 0 6px, var(--d-sunk) 6px 7px)" }}
                    >
                      <Camera className={`h-4 w-4 ${has ? "text-d-ink/70" : "text-d-mute"}`} />
                      <span className={has ? "font-medium" : "text-d-mute"}>{spot}</span>
                      {!has && <span className="text-[10px] text-d-accent">request</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Coaching cohorts ---------------- */

function CohortsTab() {
  const desk = useDesk();
  const [cid, setCid] = React.useState(cohorts[0].id);
  const [roster, setRoster] = React.useState(members);
  const [done, setDone] = React.useState<Record<string, number>>(() => Object.fromEntries(cohorts.map((c) => [c.id, c.done])));
  const [work, setWork] = React.useState(seedAssignments);
  const cohort = cohorts.find((c) => c.id === cid)!;
  const list = roster.filter((m) => m.cohort === cid);
  const n = done[cid];
  const attPct = Math.round((list.reduce((a, m) => a + m.att.slice(0, n).filter(Boolean).length, 0) / Math.max(1, list.length * n)) * 100);
  const sessionCols = cohort.sessions.slice(0, n).map((_, i) => `S${i + 1}`);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Segmented options={cohorts.map((c) => ({ value: c.id, label: c.name.split(" · ")[0], count: roster.filter((m) => m.cohort === c.id).length }))} value={cid} onChange={setCid} />
        <p className="font-serif text-[15px] italic text-d-mute">{cohort.focus}</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Members" value={list.length} hint={`${inr(cohort.fee)} per seat`} icon={Users} />
        <Stat label="Attendance" value={`${attPct}%`} delta={attPct >= 85 ? "+2%" : "-4%"} deltaGood={attPct >= 85} hint={`${n} of ${cohort.sessions.length} sessions`} icon={Check} tone={attPct >= 85 ? "ok" : "warn"} trend={[92, 90, 88, 89, 86, 87, attPct]} />
        <Stat label="Assignments in" value={`${work.filter((w) => w.cohort === cid && w.col !== "assigned" && w.col !== "call").length} / ${work.filter((w) => w.cohort === cid).length}`} hint="this fortnight" icon={BookOpen} tone="info" />
        <Stat label="Median revenue lift" value={`${[...list.map((m) => m.growth)].sort((a, b) => a - b)[Math.floor(list.length / 2)] ?? 0}%`} delta="+2%" hint="self-reported since joining" icon={IndianRupee} tone="ok" trend={[0, 2, 3, 5, 6, 7, 8]} />
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_1.15fr]">
        <Panel title={cohort.name} sub={`Next: ${cohort.next}`} action={<Btn size="sm" variant="solid" icon={Check} disabled={n >= cohort.sessions.length} onClick={() => { setDone((d) => ({ ...d, [cid]: d[cid] + 1 })); setRoster((cur) => cur.map((m) => (m.cohort === cid ? { ...m, att: [...m.att, 1] } : m))); toast.success(`Session ${n + 1} marked done`, { description: cohort.sessions[n] }); desk.log(`${cohort.name}: session ${n + 1} done`, "ok"); }}>Mark next done</Btn>}>
          <ol className="space-y-0">
            {cohort.sessions.map((s, i) => {
              const isDone = i < n;
              const isNext = i === n;
              return (
                <li key={s} className={`flex items-baseline gap-3 border-b border-d-line/70 py-2 text-[13.5px] ${isDone ? "text-d-mute" : ""}`}>
                  <span className={`tnum w-7 shrink-0 font-mono text-[11.5px] ${isNext ? "font-bold text-d-accent" : ""}`}>S{i + 1}</span>
                  <span className={`desk-h flex-1 ${isNext ? "font-semibold text-d-ink" : ""}`}>{s}</span>
                  {isDone ? <Check className="h-3.5 w-3.5 text-d-ok" /> : isNext ? <Pill tone="accent">next</Pill> : <span className="text-[11px] text-d-mute">·</span>}
                </li>
              );
            })}
          </ol>
        </Panel>
        <Panel title="Attendance" sub="Click a cell to correct it. Three misses in a row triggers a personal call.">
          {n > 0 ? (
            <HeatGrid
              rows={list.map((m) => m.name)}
              cols={sessionCols}
              values={list.map((m) => m.att.slice(0, n))}
              tone="accent"
              format={(v) => (v ? "✓" : "–")}
              onCell={(r, c) => {
                const who = list[r];
                setRoster((cur) => cur.map((m) => (m.name === who.name ? { ...m, att: m.att.map((v, i) => (i === c ? (v ? 0 : 1) : v)) } : m)));
                desk.log(`${who.name} S${c + 1} attendance corrected`);
              }}
            />
          ) : (
            <p className="text-[13px] text-d-mute">No sessions yet.</p>
          )}
          <ul className="mt-4 space-y-2">
            {list
              .filter((m) => m.att.slice(Math.max(0, n - 3), n).filter((v) => !v).length >= 2)
              .map((m) => (
                <li key={m.name} className="flex flex-wrap items-center gap-2 border-l-2 border-d-late pl-3 text-[13px]">
                  <span className="flex-1">
                    <b>{m.name}</b> <span className="text-d-mute">· {m.biz}, {m.town} · missed recent sessions</span>
                  </span>
                  <Btn size="sm" variant="soft" icon={Phone} onClick={() => { toast.success(`Call with ${m.name} scheduled`, { description: "Tomorrow 11 AM, Rajendra-ji" }); desk.log(`Personal call booked with ${m.name}`, "warn"); }}>
                    Book call
                  </Btn>
                </li>
              ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Assignments" sub="Drag a card as homework comes in. 'Needs a call' is where Rajendra-ji steps in.">
        <Board
          columns={[
            { id: "assigned", label: "Assigned", tone: "neutral" },
            { id: "submitted", label: "Submitted", tone: "info" },
            { id: "reviewed", label: "Reviewed", tone: "ok" },
            { id: "call", label: "Needs a call", tone: "late", limit: 2 },
          ]}
          items={work.filter((w) => w.cohort === cid)}
          itemKey={(w) => w.id}
          getColumn={(w) => w.col}
          onMove={(id, col) => {
            const w = work.find((x) => x.id === id);
            setWork((cur) => cur.map((x) => (x.id === id ? { ...x, col: col as Assignment["col"] } : x)));
            if (w) {
              toast.success(`${w.member}: ${col === "call" ? "flagged for a call" : `moved to ${col}`}`);
              desk.log(`${w.member} · ${w.title} → ${col}`);
            }
          }}
          renderCard={(w) => {
            const m = roster.find((x) => x.name === w.member);
            return (
              <div>
                <p className="desk-h text-[14px] font-semibold leading-snug">{w.title}</p>
                <p className="mt-1 text-[12px] text-d-mute">
                  {w.member} · {m?.biz}
                </p>
              </div>
            );
          }}
        />
      </Panel>
    </div>
  );
}

/* ---------------- Remedies ---------------- */

function RemediesTab() {
  const desk = useDesk();
  const [rows, setRows] = React.useState(seedRemedies);
  const [open, setOpen] = React.useState<string | null>(null);
  const [calls, setCalls] = React.useState<Set<string>>(new Set());
  const [stock, setStock] = React.useState([
    { item: "Copper Vastu strip, 4 ft", have: 6, min: 10, supplier: "Tamra Kala, Jaipur" },
    { item: "Brass helix, threshold", have: 14, min: 8, supplier: "Moradabad Brass House" },
    { item: "Lead strip, 1 kg roll", have: 3, min: 5, supplier: "Indore Metal Mart" },
    { item: "Copper pyramid set (9)", have: 9, min: 6, supplier: "Tamra Kala, Jaipur" },
    { item: "Vastu Purusha yantra, brass", have: 2, min: 4, supplier: "Ujjain Yantra Kendra" },
  ]);
  const rem = rows.find((r) => r.id === open) ?? null;
  const statuses: RemStatus[] = ["Advised", "Ordered", "Installed", "Verified"];
  const dueCalls = rows.filter((r) => r.status === "Installed").slice(0, 5);

  function setStatus(id: string, s: RemStatus) {
    setRows((cur) => cur.map((r) => (r.id === id ? { ...r, status: s } : r)));
    toast.success(`${id} → ${s}`);
    desk.log(`Remedy ${id} marked ${s}`, s === "Verified" ? "ok" : "info");
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Remedies in play" value={rows.filter((r) => r.status !== "Verified").length} hint={`${rows.length} in the last 90 days`} icon={Sparkles} />
        <Stat label="Installed, awaiting check" value={rows.filter((r) => r.status === "Installed").length} delta="+2" deltaGood={false} hint="Day-21 calls" icon={Phone} tone="warn" />
        <Stat label="Verified by client" value={rows.filter((r) => r.status === "Verified").length} delta="+3" hint="this month" icon={Check} tone="ok" trend={[1, 1, 2, 2, 3, 3, rows.filter((r) => r.status === "Verified").length]} />
        <Stat label="No-cost remedies" value="58%" hint="placement before purchase, always" icon={Compass} tone="info" />
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
        <Panel title="Remedy register" sub="Select rows for a WhatsApp check-in, or open one to update it">
          <DataTable
            rows={rows}
            rowKey={(r) => r.id}
            search={(r) => `${r.id} ${r.client} ${r.remedy} ${ZONES[r.zone].name}`}
            searchPlaceholder="Search client, remedy or zone"
            filter={{ get: (r) => r.status, options: statuses }}
            onRow={(r) => setOpen(r.id)}
            bulk={[{ label: "Send WhatsApp check-in", run: (k) => { toast.success(`${k.length} check-ins sent`, { description: "Voice note from Rajendra-ji + 3 questions" }); desk.log(`${k.length} remedy check-ins sent on WhatsApp`); } }]}
            columns={[
              { key: "id", label: "No.", render: (r) => <span className="whitespace-nowrap font-mono text-[12px]">{r.id}</span> },
              { key: "client", label: "Client", render: (r) => <span className="whitespace-nowrap font-medium">{r.client}</span>, sort: (r) => r.client },
              { key: "zone", label: "Zone", render: (r) => <span className="font-serif italic">{ZONES[r.zone].name}</span>, sort: (r) => r.zone },
              { key: "rem", label: "Remedy", render: (r) => <span className="text-d-mute">{r.remedy}</span>, wide: true },
              { key: "check", label: "Next check", render: (r) => <span className="whitespace-nowrap font-mono text-[12px]">{r.check}</span> },
              { key: "st", label: "Status", render: (r) => <Pill tone={remTone[r.status]}>{r.status}</Pill> },
            ]}
          />
        </Panel>
        <Panel icon={Phone} title="Check-in calls due" sub="Installed remedies waiting for the client's word">
          <ul className="divide-y divide-d-line">
            {dueCalls.map((r) => (
              <li key={r.id} className={`flex items-center gap-3 py-2.5 ${calls.has(r.id) ? "opacity-55" : ""}`}>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium">{r.client}</p>
                  <p className="truncate text-[12px] text-d-mute">{r.remedy}</p>
                </div>
                {calls.has(r.id) ? (
                  <Pill tone="ok">Called</Pill>
                ) : (
                  <Btn size="sm" variant="soft" onClick={() => { setCalls((s) => new Set(s).add(r.id)); toast.success(`Check-in logged: ${r.client}`); desk.log(`Day-21 call done with ${r.client}`, "ok"); }}>
                    Log call
                  </Btn>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Panel icon={Package} title="Remedy kit stock" sub="Yash carries these to installs. Below minimum turns red.">
          <ul className="space-y-3.5">
            {stock.map((s) => (
              <li key={s.item}>
                <div className="flex items-baseline justify-between gap-2 text-[13.5px]">
                  <span className="font-medium">{s.item}</span>
                  <span className="tnum font-mono text-[12px]">
                    {s.have} <span className="text-d-mute">/ min {s.min}</span>
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3">
                  <Meter value={s.have} max={s.min * 2} tone={s.have < s.min ? "late" : "ok"} height={5} />
                  {s.have < s.min && (
                    <Btn size="sm" variant="ghost" onClick={() => { setStock((cur) => cur.map((x) => (x.item === s.item ? { ...x, have: x.have + x.min } : x))); toast.success(`Ordered ${s.min} × ${s.item}`, { description: s.supplier }); desk.log(`Reordered ${s.item} from ${s.supplier}`); }}>
                      Reorder
                    </Btn>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="What clients tell us at Day 90" sub="Self-reported, 41 clients. We never promise outcomes; we record them.">
          <HBars format={(v) => `${v}%`} max={100} data={[{ label: "Feel calmer at home or work", value: 78, tone: "ok" }, { label: "Sleep better", value: 61, tone: "ok" }, { label: "Fewer staff conflicts", value: 46, tone: "info" }, { label: "Better collections or sales", value: 39, tone: "warn" }, { label: "No change noticed", value: 12, tone: "neutral" }]} />
        </Panel>
      </div>

      <Sheet
        open={!!rem}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={rem ? `${rem.id} · ${ZONES[rem.zone].name} · ${rem.kind}` : ""}
        title={rem?.remedy ?? ""}
        sub={rem ? `${rem.client} · installer ${rem.installer} · due ${rem.due}` : ""}
        footer={
          rem && (
            <Btn variant="solid" icon={MessageCircle} onClick={() => { toast.success("Check-in sent on WhatsApp", { description: rem.client }); desk.log(`Check-in sent to ${rem.client} for ${rem.id}`); setOpen(null); }}>
              Send check-in
            </Btn>
          )
        }
      >
        {rem && (
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-d-mute">Status</p>
              <Segmented size="sm" options={statuses} value={rem.status} onChange={(s) => setStatus(rem.id, s)} />
            </div>
            <KV items={[{ k: "Zone", v: `${ZONES[rem.zone].name} (${ZONES[rem.zone].dir})` }, { k: "Element", v: ZONES[rem.zone].element }, { k: "Next check", v: rem.check }, { k: "Installer", v: rem.installer }]} />
            {rem.note && <p className="border-l-2 border-d-ok pl-3 font-serif text-[15px] italic">“{rem.note}”</p>}
            <div className="rounded-[4px] bg-[#e7f3df] p-4 text-[13.5px] leading-relaxed text-[#1f3a1b]">
              Namaste {rem.client.split(" ")[0]} ji, Rajendra Trivedi here. It has been a few weeks since we did “{rem.remedy.toLowerCase()}”. How is the {ZONES[rem.zone].dir.toLowerCase()} of the {rem.client.includes("residence") ? "house" : "premises"} feeling now? Any change in sleep, mood or business? A short voice note is perfect. 🙏
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Fees ---------------- */

function FeesTab() {
  const desk = useDesk();
  const [invoices, setInvoices] = React.useState(seedInvoices);
  const [open, setOpen] = React.useState<string | null>(null);
  const [quote, setQuote] = React.useState(false);
  const inv = invoices.find((i) => i.no === open) ?? null;
  const total = invoices.reduce((a, i) => a + due(i), 0);
  const bucket = (i: Invoice) => (due(i) === 0 ? "Paid" : i.days > 60 ? "Over 60 days" : i.days > 30 ? "31-60 days" : "Under 30 days");

  return (
    <div className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Outstanding" value={inr(total, { compact: true })} delta="-9%" deltaGood={false} hint="incl. 18% GST" icon={Receipt} tone="warn" trend={[3.4, 3.1, 3.2, 2.9, 2.8, 2.7, total / 1e5]} />
        <Stat label="Over 60 days" value={inr(invoices.filter((i) => i.days > 60).reduce((a, i) => a + due(i), 0), { compact: true })} hint="cohort balances" icon={AlertTriangle} tone="late" />
        <Stat label="Collected, Oct" value="₹6.8 L" delta="+14%" icon={IndianRupee} tone="ok" trend={[4.2, 4.9, 5.1, 5.6, 5.4, 6.0, 6.8]} />
        <Stat label="Average ticket" value="₹34.6k" delta="+₹4.1k" hint="commercial mix up" icon={HandCoins} />
      </div>

      <Panel title="Packages" sub="Fixed prices, published on WhatsApp catalogue. GST 18% extra." action={<Btn size="sm" variant="solid" icon={Plus} onClick={() => setQuote(true)}>Build a quote</Btn>}>
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-5">
          {packages.map((p) => (
            <div key={p.name} className="border-t-2 pt-3" style={{ borderColor: toneVar(p.tone) }}>
              <p className="desk-h text-[17px] font-semibold leading-tight">{p.name}</p>
              <p className="desk-h tnum mt-1 text-[26px] font-semibold">{inr(p.price)}</p>
              <p className="mt-1 text-[12.5px] leading-snug text-d-mute">{p.note}</p>
              <p className="mt-2 font-mono text-[11.5px]">{p.sold} sold this year</p>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <Panel title="Invoices" sub="GST invoices from Tally. Click one to record a payment or send a reminder.">
          <DataTable
            rows={invoices}
            rowKey={(i) => i.no}
            search={(i) => `${i.no} ${i.client} ${i.pkg}`}
            searchPlaceholder="Search invoice or client"
            filter={{ get: bucket, options: ["Under 30 days", "31-60 days", "Over 60 days", "Paid"] }}
            onRow={(i) => setOpen(i.no)}
            bulk={[{ label: "Send reminders", run: (k) => { toast.success(`${k.length} reminders queued for 5 PM`); desk.log(`${k.length} fee reminders queued`); } }]}
            columns={[
              { key: "no", label: "Invoice", render: (i) => <span className="font-mono text-[12px]">{i.no}</span> },
              { key: "client", label: "Client", render: (i) => <span className="font-medium">{i.client}</span>, sort: (i) => i.client },
              { key: "pkg", label: "Package", render: (i) => <span className="text-d-mute">{i.pkg}</span>, wide: true },
              { key: "gross", label: "With GST", align: "right", render: (i) => <span className="tnum font-mono">{inr(gross(i))}</span>, sort: gross },
              { key: "due", label: "Balance", align: "right", render: (i) => (due(i) ? <span className="tnum font-mono font-semibold" style={{ color: i.days > 60 ? "var(--d-late)" : undefined }}>{inr(due(i))}</span> : <Pill tone="ok">Paid</Pill>), sort: due },
              { key: "days", label: "Days", align: "right", render: (i) => <span className="tnum font-mono">{i.days}</span>, sort: (i) => i.days },
            ]}
          />
        </Panel>
        <div className="space-y-8">
          <Panel title="Ageing" sub="Balances only">
            <AgingBar
              format={(v) => inr(v, { compact: true })}
              buckets={[
                { label: "Under 30", value: invoices.filter((i) => i.days <= 30).reduce((a, i) => a + due(i), 0), tone: "ok" },
                { label: "31–60", value: invoices.filter((i) => i.days > 30 && i.days <= 60).reduce((a, i) => a + due(i), 0), tone: "warn" },
                { label: "Over 60", value: invoices.filter((i) => i.days > 60).reduce((a, i) => a + due(i), 0), tone: "late" },
              ]}
            />
          </Panel>
          <Panel title="Revenue by month" sub="₹ lakh, Vastu and coaching">
            <Bars
              height={150}
              format={(v) => `${v.toFixed(1)}`}
              data={[
                { m: "May", v: 2.6, c: 1.6 },
                { m: "Jun", v: 2.9, c: 2.0 },
                { m: "Jul", v: 3.2, c: 1.9 },
                { m: "Aug", v: 3.0, c: 2.6 },
                { m: "Sep", v: 3.4, c: 2.6 },
                { m: "Oct", v: 4.1, c: 2.7 },
              ].map((x) => ({ label: x.m, value: x.v + x.c, stack: [{ name: "Vastu", value: x.v, tone: "accent" as Tone }, { name: "Coaching", value: x.c, tone: "warn" as Tone }] }))}
            />
          </Panel>
        </div>
      </div>

      <Sheet
        open={!!inv}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={inv?.no}
        title={inv?.client ?? ""}
        sub={inv ? `${inv.pkg} · raised ${inv.raised} · ${inv.days} days` : ""}
        footer={
          inv && (
            <>
              <Btn icon={MessageCircle} disabled={!due(inv)} onClick={() => { toast.success("Reminder sent on WhatsApp", { description: `${inv.client} · ${inr(due(inv))}` }); desk.log(`Fee reminder sent to ${inv.client}`); }}>
                Remind
              </Btn>
              <Btn variant="solid" icon={Check} disabled={!due(inv)} onClick={() => { setInvoices((cur) => cur.map((x) => (x.no === inv.no ? { ...x, paid: gross(x) } : x))); toast.success(`${inr(due(inv))} received`, { description: "Receipt voucher posted to Tally" }); desk.log(`${inv.client} paid ${inr(due(inv))}`, "ok"); }}>
                Record full payment
              </Btn>
            </>
          )
        }
      >
        {inv && (
          <div className="space-y-5">
            <KV
              items={[
                { k: "Fee", v: inr(inv.base) },
                { k: "CGST 9% + SGST 9%", v: inr(gross(inv) - inv.base) },
                { k: "Invoice total", v: inr(gross(inv)) },
                { k: "Received", v: inr(inv.paid) },
                { k: "Balance", v: due(inv) ? <span className="text-d-late">{inr(due(inv))}</span> : <span className="text-d-ok">Nil</span> },
                { k: "SAC", v: "998311 · consulting" },
              ]}
            />
            <Meter value={inv.paid} max={gross(inv)} tone={due(inv) ? "warn" : "ok"} />
            <div className="rounded-[4px] bg-[#e7f3df] p-4 text-[13.5px] leading-relaxed text-[#1f3a1b]">
              Namaste {inv.client.split(" ")[0]} ji, a gentle note from Shipra Advisory: {inr(due(inv))} is pending on invoice {inv.no} for {inv.pkg}. You can pay by UPI on the link below or in two parts if easier. Thank you for your trust. — Nidhi, Accounts
            </div>
          </div>
        )}
      </Sheet>

      <QuoteModal open={quote} onOpenChange={setQuote} />
    </div>
  );
}

function QuoteModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const desk = useDesk();
  const [client, setClient] = React.useState("Om Sai Petrol Pump");
  const [pkg, setPkg] = React.useState(packages[1].name);
  const [km, setKm] = React.useState("40");
  const [extra, setExtra] = React.useState(false);
  const base = packages.find((p) => p.name === pkg)?.price ?? 0;
  const travel = Math.max(0, Number(km) - 25) * 12 * 2;
  const sub = base + travel + (extra ? 7500 : 0);
  const gst = Math.round(sub * GST);
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Build a quote" sub="Travel beyond 25 km is charged at ₹12/km both ways. Sent as a PDF on WhatsApp.">
      <div className="space-y-3">
        <Field label="Client">
          <input className={inputClass} value={client} onChange={(e) => setClient(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Package">
            <select className={inputClass} value={pkg} onChange={(e) => setPkg(e.target.value)}>
              {packages.map((p) => (
                <option key={p.name}>{p.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Distance from Ujjain (km)">
            <input className={inputClass} inputMode="numeric" value={km} onChange={(e) => setKm(e.target.value.replace(/\D/g, ""))} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-[13px]">
          <input type="checkbox" checked={extra} onChange={(e) => setExtra(e.target.checked)} className="h-4 w-4 accent-[var(--d-accent)]" />
          Add muhurat for griha pravesh / opening (₹7,500)
        </label>
        <div className="border-t-2 border-d-ink pt-3 text-[13.5px]">
          {[
            ["Package", inr(base)],
            ["Travel", inr(travel)],
            ...(extra ? [["Muhurat", inr(7500)]] : []),
            ["GST 18%", inr(gst)],
          ].map(([k, v]) => (
            <p key={k} className="flex justify-between py-0.5">
              <span className="text-d-mute">{k}</span>
              <span className="tnum font-mono">{v}</span>
            </p>
          ))}
          <p className="desk-h mt-1 flex justify-between border-t border-d-line pt-2 text-[18px] font-semibold">
            <span>Total</span>
            <span className="tnum">{inr(sub + gst)}</span>
          </p>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Btn onClick={() => onOpenChange(false)}>Cancel</Btn>
          <Btn
            variant="solid"
            icon={ScrollText}
            onClick={() => {
              toast.success(`Quote sent to ${client}`, { description: `${pkg} · ${inr(sub + gst)} incl. GST` });
              desk.log(`Quote ${inr(sub + gst)} sent to ${client}`, "info");
              onOpenChange(false);
            }}
          >
            Send quote
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
