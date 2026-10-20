"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlarmClock,
  Armchair,
  ArrowRight,
  BadgeIndianRupee,
  Bell,
  CalendarDays,
  CalendarPlus,
  Check,
  ClipboardList,
  Clock,
  CreditCard,
  FlaskConical,
  Gauge as GaugeIcon,
  HeartPulse,
  Hourglass,
  IndianRupee,
  MessageCircle,
  Phone,
  Plug,
  Plus,
  Repeat,
  Send,
  ShieldCheck,
  Smile,
  Sparkles,
  Stethoscope,
  Timer,
  UserPlus,
  Users,
  Wind,
} from "lucide-react";
import { DeskShell, useDesk } from "../shell";
import { Bars, Donut, HBars } from "../charts";
import { AgingBar, ApprovalQueue, Board, Checklist, Countdown, DataTable, Gantt, type GanttRow } from "../data";
import { AgentsModule, ConnectionsModule, IndependenceModule, PeopleModule } from "../common";
import { Avatar, Btn, Feed, Field, inputClass, inr, KV, Meter, Modal, Panel, Pill, SearchBox, Segmented, Sheet, Stat, toneVar } from "../ui";
import { useDrift, useNow, istParts } from "../hooks";
import type { DeskConfig, DeskModule, IndependenceData, Integration, TeamMember, Tone, WorkforceAgent } from "../types";

/** trig rounded so server and browser render identical SVG coordinates */
const trig = { cos: (a: number) => Math.round(Math.cos(a) * 1e6) / 1e6, sin: (a: number) => Math.round(Math.sin(a) * 1e6) / 1e6 };

/* ============================================================
   Data — Nilgiri Dental Studio, Karve Road, Pune.
   5 chairs, 4 doctors. Clinic runs 9:30–2 and 4–9.
   ============================================================ */

type DocId = "meera" | "aniket" | "sana" | "rohan";
const DOCTORS: Record<DocId, { name: string; short: string; spec: string; chair: string; tone: Tone }> = {
  meera: { name: "Dr. Meera Kulkarni", short: "Dr. Meera", spec: "Prosthodontist · owner", chair: "C3", tone: "accent" },
  aniket: { name: "Dr. Aniket Joshi", short: "Dr. Aniket", spec: "Endodontist", chair: "C1", tone: "warn" },
  sana: { name: "Dr. Sana Shaikh", short: "Dr. Sana", spec: "Orthodontist · Tue/Thu/Sat", chair: "C2", tone: "info" },
  rohan: { name: "Dr. Rohan Deshpande", short: "Dr. Rohan", spec: "Oral surgeon · implants", chair: "C4", tone: "ok" },
};
const DOC_IDS = Object.keys(DOCTORS) as DocId[];

/* ---------------- Chairs & waiting room ---------------- */

type ChairState = "in" | "prep" | "steril" | "free";
type Chair = { id: string; name: string; room: string; state: ChairState; patient?: string; proc?: string; doc?: DocId; planMin: number; since: number; fee?: number; flags?: string[] };

const STERIL_MIN = 12;
const seedChairs: Chair[] = [
  { id: "C1", name: "Chair 1", room: "Endo suite", state: "in", patient: "Prakash Gokhale", proc: "RCT #36, 2nd sitting", doc: "aniket", planMin: 60, since: -32 * 60, fee: 6500, flags: ["BP 150/94"] },
  { id: "C2", name: "Chair 2", room: "Ortho bay", state: "in", patient: "Ishita Bhosale", proc: "Aligner check, tray 7", doc: "sana", planMin: 20, since: -12 * 60 - 40, fee: 1200, flags: ["Minor · 10 y"] },
  { id: "C3", name: "Chair 3", room: "Prostho room", state: "prep", patient: "Vandana Pawar", proc: "Crown prep #11", doc: "meera", planMin: 50, since: -3 * 60, fee: 11500, flags: ["Anxious"] },
  { id: "C4", name: "Chair 4", room: "Surgery", state: "steril", planMin: STERIL_MIN, since: -4 * 60 - 20 },
  { id: "C5", name: "Chair 5", room: "Hygiene", state: "free", planMin: 30, since: 0 },
];

type Waiting = { id: string; name: string; age: number; proc: string; doc: DocId; appt: string; arrived: string; waitBase: number; mins: number; fee: number; flags: string[]; priority?: boolean };
const seedQueue: Waiting[] = [
  { id: "W1", name: "Tejas More", age: 29, proc: "Emergency: pulpitis #46", doc: "aniket", appt: "11:30", arrived: "11:18", waitBase: 14, mins: 30, fee: 900, flags: ["Pain 8/10"], priority: true },
  { id: "W2", name: "Vikram Rao", age: 54, proc: "Implant stage 2 #46", doc: "rohan", appt: "11:45", arrived: "11:26", waitBase: 9, mins: 45, fee: 8000, flags: ["Diabetic", "Cashless"] },
  { id: "W3", name: "Siddhi Patil", age: 15, proc: "Braces adjustment", doc: "sana", appt: "11:00", arrived: "10:52", waitBase: 21, mins: 20, fee: 1500, flags: ["Minor"] },
  { id: "W4", name: "Shalini Kamat", age: 41, proc: "Walk-in: sensitivity", doc: "meera", appt: "walk-in", arrived: "11:31", waitBase: 4, mins: 20, fee: 500, flags: ["First visit"] },
  { id: "W5", name: "Kabir Sethi", age: 23, proc: "Aligner scan (iTero)", doc: "sana", appt: "11:30", arrived: "11:24", waitBase: 10, mins: 30, fee: 2500, flags: ["Early"] },
];

/* ---------------- Appointments ---------------- */

type ApptStatus = "Done" | "In chair" | "Waiting" | "Confirmed" | "Booked" | "No-show";
type Appt = { id: string; doc: DocId; patient: string; proc: string; start: number; dur: number; chair: string; status: ApptStatus; fee: number; phone: string };

const seedAppts: Appt[] = [
  { id: "A01", doc: "meera", patient: "Sunita Apte", proc: "Crown cementation #26", start: 9.5, dur: 0.75, chair: "C3", status: "Done", fee: 1500, phone: "98220 41187" },
  { id: "A02", doc: "meera", patient: "Vandana Pawar", proc: "Crown prep #11", start: 10.75, dur: 1, chair: "C3", status: "In chair", fee: 11500, phone: "98603 22714" },
  { id: "A03", doc: "meera", patient: "Col. Suresh Nair (retd.)", proc: "Complete denture trial", start: 12.25, dur: 0.75, chair: "C3", status: "Confirmed", fee: 0, phone: "94220 18003" },
  { id: "A04", doc: "meera", patient: "Anjali Mehta", proc: "Veneers consult, smile design", start: 16.5, dur: 0.75, chair: "C3", status: "Confirmed", fee: 800, phone: "99230 55120" },
  { id: "A05", doc: "meera", patient: "Harish Thakur", proc: "Bridge try-in 14–16", start: 17.5, dur: 0.75, chair: "C3", status: "Booked", fee: 0, phone: "98500 61290" },
  { id: "A06", doc: "meera", patient: "Neha Gadgil", proc: "In-office whitening", start: 19, dur: 1, chair: "C5", status: "Confirmed", fee: 9500, phone: "97300 44781" },
  { id: "A07", doc: "aniket", patient: "Kaveri Iyer", proc: "RCT #46, 1st sitting", start: 9.5, dur: 1, chair: "C1", status: "Done", fee: 3500, phone: "98810 30442" },
  { id: "A08", doc: "aniket", patient: "Prakash Gokhale", proc: "RCT #36, 2nd sitting", start: 10.75, dur: 1, chair: "C1", status: "In chair", fee: 3000, phone: "98221 67013" },
  { id: "A09", doc: "aniket", patient: "Tejas More", proc: "Emergency: pulpitis #46", start: 11.75, dur: 0.5, chair: "C1", status: "Waiting", fee: 900, phone: "88050 21976" },
  { id: "A10", doc: "aniket", patient: "Farida Bohra", proc: "RCT #16, 1st sitting", start: 12.5, dur: 1, chair: "C1", status: "Confirmed", fee: 3500, phone: "98903 11845" },
  { id: "A11", doc: "aniket", patient: "Mangesh Kale", proc: "Re-RCT #21", start: 17, dur: 1.25, chair: "C1", status: "Booked", fee: 7500, phone: "90110 74522" },
  { id: "A12", doc: "aniket", patient: "Ritu Sharma", proc: "Post & core #24", start: 18.75, dur: 0.75, chair: "C1", status: "Confirmed", fee: 2800, phone: "70209 33610" },
  { id: "A13", doc: "sana", patient: "Aarav Kulkarni", proc: "Bracket re-bond", start: 10, dur: 0.33, chair: "C2", status: "Done", fee: 800, phone: "98224 90021" },
  { id: "A14", doc: "sana", patient: "Ishita Bhosale", proc: "Aligner check, tray 7", start: 10.75, dur: 0.33, chair: "C2", status: "In chair", fee: 1200, phone: "98601 77356" },
  { id: "A15", doc: "sana", patient: "Siddhi Patil", proc: "Braces adjustment", start: 11.17, dur: 0.33, chair: "C2", status: "Waiting", fee: 1500, phone: "93700 18842" },
  { id: "A16", doc: "sana", patient: "Kabir Sethi", proc: "Aligner scan (iTero)", start: 11.67, dur: 0.5, chair: "C2", status: "Waiting", fee: 2500, phone: "99604 51207" },
  { id: "A17", doc: "sana", patient: "Meher Vora", proc: "Retainer delivery", start: 12.5, dur: 0.33, chair: "C2", status: "No-show", fee: 4500, phone: "98670 32918" },
  { id: "A18", doc: "sana", patient: "Om Jadhav", proc: "Braces bonding, upper", start: 16.5, dur: 1, chair: "C2", status: "Confirmed", fee: 18000, phone: "86000 47115" },
  { id: "A19", doc: "sana", patient: "Riya Deshmukh", proc: "Ortho consult + OPG", start: 18, dur: 0.5, chair: "C2", status: "Booked", fee: 1200, phone: "95270 60433" },
  { id: "A20", doc: "rohan", patient: "Ganesh Shinde", proc: "Surgical extraction #38", start: 9.5, dur: 1, chair: "C4", status: "Done", fee: 6000, phone: "98500 12267" },
  { id: "A21", doc: "rohan", patient: "Lata Deshmukh", proc: "Scaling & polishing", start: 10.75, dur: 0.75, chair: "C4", status: "Done", fee: 2200, phone: "94221 80934" },
  { id: "A22", doc: "rohan", patient: "Vikram Rao", proc: "Implant stage 2 #46", start: 12, dur: 0.75, chair: "C4", status: "Waiting", fee: 8000, phone: "98230 66158" },
  { id: "A23", doc: "rohan", patient: "Pooja Rane", proc: "Extraction #55 (child)", start: 13, dur: 0.5, chair: "C5", status: "Confirmed", fee: 1500, phone: "77980 24501" },
  { id: "A24", doc: "rohan", patient: "Dilip Wagh", proc: "Implant placement #36", start: 17, dur: 1.5, chair: "C4", status: "Confirmed", fee: 38000, phone: "98811 50972" },
  { id: "A25", doc: "rohan", patient: "Ayesha Khan", proc: "Scaling & polishing", start: 19, dur: 0.75, chair: "C4", status: "Booked", fee: 2200, phone: "90490 87314" },
];
const apptTone: Record<ApptStatus, Tone> = { Done: "neutral", "In chair": "accent", Waiting: "info", Confirmed: "ok", Booked: "warn", "No-show": "late" };

const PROC_MENU = [
  { label: "Consultation + RVG", dur: 0.33, fee: 600 },
  { label: "Scaling & polishing", dur: 0.75, fee: 2200 },
  { label: "Composite filling", dur: 0.5, fee: 1800 },
  { label: "RCT sitting", dur: 1, fee: 3500 },
  { label: "Crown prep", dur: 1, fee: 11500 },
  { label: "Extraction", dur: 0.5, fee: 1500 },
  { label: "Braces adjustment", dur: 0.33, fee: 1500 },
  { label: "Implant review", dur: 0.5, fee: 0 },
];

/* ---------------- Patients & treatment plans ---------------- */

type Proc = "filling" | "rct" | "crown" | "extract" | "implant";
const PROCS: Record<Proc, { label: string; fee: number; color: string; short: string }> = {
  filling: { label: "Composite filling", fee: 1800, color: "#3a7fb0", short: "F" },
  rct: { label: "Root canal", fee: 6500, color: "#e06a4e", short: "R" },
  crown: { label: "Zirconia crown", fee: 11500, color: "#c9972c", short: "C" },
  extract: { label: "Extraction", fee: 1500, color: "#c13c4f", short: "X" },
  implant: { label: "Implant + crown", fee: 42000, color: "#6b5bd2", short: "I" },
};
const PROC_IDS = Object.keys(PROCS) as Proc[];
const SCALING_FEE = 2200;

type PlanStage = "Proposed" | "Accepted" | "In progress" | "Completed";
type Patient = { id: string; name: string; age: number; sex: "M" | "F"; phone: string; area: string; doc: DocId; stage: PlanStage; marks: Record<number, Proc>; missing: number[]; scaling: boolean; paid: number; next: string; insurer?: string; complaint: string; medical: string[] };

const seedPatients: Patient[] = [
  { id: "NDS-2318", name: "Vandana Pawar", age: 46, sex: "F", phone: "98603 22714", area: "Kothrud", doc: "meera", stage: "In progress", marks: { 11: "crown", 12: "crown", 21: "filling", 36: "filling" }, missing: [], scaling: true, paid: 12000, next: "Today 10:45", complaint: "Chipped front tooth after fall", medical: ["Anxious patient"] },
  { id: "NDS-2290", name: "Prakash Gokhale", age: 61, sex: "M", phone: "98221 67013", area: "Erandwane", doc: "aniket", stage: "In progress", marks: { 36: "rct", 37: "filling", 46: "crown" }, missing: [48], scaling: true, paid: 9500, next: "Today 10:45", insurer: "Star Health", complaint: "Pain on chewing, lower left", medical: ["Hypertension", "On amlodipine"] },
  { id: "NDS-2402", name: "Vikram Rao", age: 54, sex: "M", phone: "98230 66158", area: "Baner", doc: "rohan", stage: "In progress", marks: { 46: "implant", 47: "filling" }, missing: [46], scaling: false, paid: 30000, next: "Today 12:00", insurer: "Medi Assist · corporate", complaint: "Missing lower molar for 2 years", medical: ["Type 2 diabetic", "HbA1c 7.1"] },
  { id: "NDS-2421", name: "Col. Suresh Nair (retd.)", age: 72, sex: "M", phone: "94220 18003", area: "Aundh", doc: "meera", stage: "Accepted", marks: { 17: "extract", 27: "extract" }, missing: [16, 15, 14, 24, 25, 26, 36, 37, 46, 47], scaling: true, paid: 3000, next: "Today 12:15", insurer: "ECHS", complaint: "Loose upper denture", medical: ["On blood thinner (ecosprin)"] },
  { id: "NDS-2435", name: "Anjali Mehta", age: 31, sex: "F", phone: "99230 55120", area: "Koregaon Park", doc: "meera", stage: "Proposed", marks: { 11: "crown", 12: "crown", 21: "crown", 22: "crown" }, missing: [], scaling: true, paid: 0, next: "Today 4:30", complaint: "Wants a smile makeover before wedding (Feb)", medical: [] },
  { id: "NDS-2377", name: "Farida Bohra", age: 38, sex: "F", phone: "98903 11845", area: "Camp", doc: "aniket", stage: "Accepted", marks: { 16: "rct", 26: "filling", 27: "filling" }, missing: [], scaling: true, paid: 3500, next: "Today 12:30", complaint: "Sensitivity upper right", medical: ["Pregnant, 2nd trimester"] },
  { id: "NDS-2350", name: "Mangesh Kale", age: 49, sex: "M", phone: "90110 74522", area: "Warje", doc: "aniket", stage: "Accepted", marks: { 21: "rct", 22: "crown" }, missing: [], scaling: false, paid: 2000, next: "Today 5:00", complaint: "Old RCT failing, swelling", medical: ["Smoker"] },
  { id: "NDS-2448", name: "Dilip Wagh", age: 58, sex: "M", phone: "98811 50972", area: "Hinjawadi", doc: "rohan", stage: "Accepted", marks: { 36: "implant", 35: "crown" }, missing: [36], scaling: true, paid: 20000, next: "Today 5:00", complaint: "Can't chew on left side", medical: ["CBCT done 12 Oct"] },
  { id: "NDS-2459", name: "Shalini Kamat", age: 41, sex: "F", phone: "98337 20684", area: "Karve Nagar", doc: "meera", stage: "Proposed", marks: { 14: "filling", 15: "filling", 24: "filling" }, missing: [], scaling: true, paid: 0, next: "Walk-in today", complaint: "Cold sensitivity", medical: [] },
  { id: "NDS-2201", name: "Harish Thakur", age: 64, sex: "M", phone: "98500 61290", area: "Sinhagad Rd", doc: "meera", stage: "In progress", marks: { 14: "crown", 15: "crown", 16: "crown" }, missing: [15], scaling: false, paid: 21000, next: "Today 5:30", complaint: "Bridge for missing premolar", medical: ["Diabetic"] },
  { id: "NDS-2466", name: "Tejas More", age: 29, sex: "M", phone: "88050 21976", area: "Bavdhan", doc: "aniket", stage: "Proposed", marks: { 46: "rct", 47: "filling" }, missing: [], scaling: true, paid: 0, next: "Waiting now", complaint: "Night pain lower right", medical: [] },
  { id: "NDS-2105", name: "Sunita Apte", age: 57, sex: "F", phone: "98220 41187", area: "Deccan", doc: "meera", stage: "Completed", marks: { 26: "crown", 25: "filling" }, missing: [], scaling: true, paid: 15500, next: "Recall Apr 2027", complaint: "Broken filling", medical: ["Thyroid"] },
  { id: "NDS-2389", name: "Ritu Sharma", age: 35, sex: "F", phone: "70209 33610", area: "Kharadi", doc: "aniket", stage: "In progress", marks: { 24: "crown", 25: "rct" }, missing: [], scaling: false, paid: 6000, next: "Today 6:45", insurer: "Medi Assist · corporate", complaint: "Fractured premolar", medical: [] },
  { id: "NDS-2412", name: "Ganesh Shinde", age: 27, sex: "M", phone: "98500 12267", area: "Wakad", doc: "rohan", stage: "Completed", marks: { 38: "extract", 48: "extract" }, missing: [], scaling: false, paid: 12000, next: "Suture removal Mon", complaint: "Impacted wisdom teeth", medical: [] },
];
function planValue(p: Patient) {
  return Object.values(p.marks).reduce((a, m) => a + PROCS[m].fee, 0) + (p.scaling ? SCALING_FEE : 0);
}
const stageTone: Record<PlanStage, Tone> = { Proposed: "warn", Accepted: "info", "In progress": "accent", Completed: "ok" };

/* ---------------- Lab work ---------------- */

type LabStage = "impression" | "atlab" | "trial" | "ready" | "fitted";
type LabCase = { id: string; patient: string; work: string; lab: string; doc: DocId; stage: LabStage; dueH: number; shade?: string; cost: number; sent: string; remake?: boolean };
const LAB_COLS: { id: LabStage; label: string; tone: Tone; hint: string }[] = [
  { id: "impression", label: "Scan / impression", tone: "neutral", hint: "Taken, waiting for pickup" },
  { id: "atlab", label: "At the lab", tone: "info", hint: "In fabrication" },
  { id: "trial", label: "Trial in mouth", tone: "warn", hint: "Bisque / wax try-in" },
  { id: "ready", label: "Back, ready", tone: "accent", hint: "Book the fit" },
  { id: "fitted", label: "Fitted", tone: "ok", hint: "Cemented / delivered" },
];
const seedLab: LabCase[] = [
  { id: "LB-0931", patient: "Vandana Pawar", work: "Zirconia crowns #11 #12", lab: "Ivory Dental Lab, Kothrud", doc: "meera", stage: "impression", dueH: 6, shade: "A2", cost: 7600, sent: "today" },
  { id: "LB-0928", patient: "Harish Thakur", work: "PFM bridge 14–16", lab: "Precision Ceramics, Hadapsar", doc: "meera", stage: "trial", dueH: 30, shade: "A3", cost: 9800, sent: "12 Oct" },
  { id: "LB-0925", patient: "Col. Suresh Nair", work: "Complete denture, upper + lower", lab: "Deccan Denture Works, Shivajinagar", doc: "meera", stage: "trial", dueH: 2, cost: 8500, sent: "6 Oct" },
  { id: "LB-0933", patient: "Kabir Sethi", work: "Clear aligners, 18 trays", lab: "Smilecraft Aligners, Andheri", doc: "sana", stage: "impression", dueH: 72, cost: 38000, sent: "scan today" },
  { id: "LB-0919", patient: "Ritu Sharma", work: "E-max crown #24", lab: "Ivory Dental Lab, Kothrud", doc: "aniket", stage: "atlab", dueH: 20, shade: "B1", cost: 5200, sent: "15 Oct" },
  { id: "LB-0921", patient: "Prakash Gokhale", work: "Zirconia crown #46", lab: "Ivory Dental Lab, Kothrud", doc: "aniket", stage: "ready", dueH: 0, shade: "A3.5", cost: 3800, sent: "14 Oct" },
  { id: "LB-0915", patient: "Meher Vora", work: "Hawley retainers, U + L", lab: "Smilecraft Aligners, Andheri", doc: "sana", stage: "ready", dueH: 0, cost: 2600, sent: "9 Oct" },
  { id: "LB-0912", patient: "Vikram Rao", work: "Implant crown #46 (screw-retained)", lab: "Precision Ceramics, Hadapsar", doc: "rohan", stage: "atlab", dueH: 52, shade: "A3", cost: 11500, sent: "16 Oct" },
  { id: "LB-0908", patient: "Sunita Apte", work: "Zirconia crown #26", lab: "Ivory Dental Lab, Kothrud", doc: "meera", stage: "fitted", dueH: 0, shade: "A2", cost: 3800, sent: "8 Oct" },
  { id: "LB-0904", patient: "Aarav Kulkarni", work: "Bonded lingual retainer", lab: "Smilecraft Aligners, Andheri", doc: "sana", stage: "fitted", dueH: 0, cost: 1800, sent: "4 Oct" },
  { id: "LB-0926", patient: "Ishita Bhosale", work: "Aligner refinement, 6 trays", lab: "Smilecraft Aligners, Andheri", doc: "sana", stage: "atlab", dueH: 96, cost: 12000, sent: "13 Oct", remake: true },
  { id: "LB-0930", patient: "Mangesh Kale", work: "Fibre post + PFM crown #21", lab: "Precision Ceramics, Hadapsar", doc: "aniket", stage: "atlab", dueH: 44, shade: "A3", cost: 4600, sent: "17 Oct" },
];

/* ---------------- Recalls ---------------- */

type RecallStatus = "Queued" | "Sent" | "Replied" | "Booked" | "No reply";
type RecallReason = "6-month cleaning" | "Crown after RCT" | "Ortho monthly" | "Implant review" | "Child fluoride" | "Denture check";
type Recall = { id: string; patient: string; phone: string; reason: RecallReason; last: string; dueIn: number; doc: DocId; status: RecallStatus; worth: number; lang: "English" | "मराठी" | "हिंदी" };
const seedRecalls: Recall[] = [
  { id: "R-501", patient: "Kaustubh Paranjpe", phone: "98220 11045", reason: "6-month cleaning", last: "14 Apr", dueIn: -6, doc: "rohan", status: "Queued", worth: 2200, lang: "मराठी" },
  { id: "R-502", patient: "Nandini Rao", phone: "99700 22318", reason: "Crown after RCT", last: "2 Sep", dueIn: -18, doc: "aniket", status: "No reply", worth: 11500, lang: "English" },
  { id: "R-503", patient: "Aditya Bapat", phone: "98810 74401", reason: "6-month cleaning", last: "28 Apr", dueIn: 8, doc: "rohan", status: "Queued", worth: 2200, lang: "मराठी" },
  { id: "R-504", patient: "Zoya Siddiqui", phone: "90289 33476", reason: "Ortho monthly", last: "18 Sep", dueIn: -2, doc: "sana", status: "Sent", worth: 1500, lang: "हिंदी" },
  { id: "R-505", patient: "Prachi Joglekar", phone: "98234 55190", reason: "Child fluoride", last: "10 Apr", dueIn: -10, doc: "rohan", status: "Replied", worth: 1200, lang: "मराठी" },
  { id: "R-506", patient: "Sameer Inamdar", phone: "97660 20871", reason: "Crown after RCT", last: "29 Aug", dueIn: -22, doc: "aniket", status: "Queued", worth: 11500, lang: "English" },
  { id: "R-507", patient: "Leela Chitale", phone: "94230 61982", reason: "Denture check", last: "20 Apr", dueIn: 0, doc: "meera", status: "Booked", worth: 800, lang: "मराठी" },
  { id: "R-508", patient: "Rajat Agarwal", phone: "88888 41207", reason: "Implant review", last: "22 Apr", dueIn: 3, doc: "rohan", status: "Sent", worth: 0, lang: "हिंदी" },
  { id: "R-509", patient: "Mrunal Sathe", phone: "98600 93014", reason: "6-month cleaning", last: "2 May", dueIn: 12, doc: "rohan", status: "Queued", worth: 2200, lang: "मराठी" },
  { id: "R-510", patient: "Fatima Shaikh", phone: "77700 18326", reason: "Ortho monthly", last: "20 Sep", dueIn: 0, doc: "sana", status: "Queued", worth: 1500, lang: "हिंदी" },
  { id: "R-511", patient: "Hemant Bhide", phone: "98503 47721", reason: "Crown after RCT", last: "11 Sep", dueIn: -9, doc: "aniket", status: "Replied", worth: 11500, lang: "मराठी" },
  { id: "R-512", patient: "Sneha Iyengar", phone: "99201 62538", reason: "6-month cleaning", last: "5 Apr", dueIn: -15, doc: "rohan", status: "No reply", worth: 2200, lang: "English" },
  { id: "R-513", patient: "Arjun Kadam (9 y)", phone: "98602 11876", reason: "Child fluoride", last: "25 Apr", dueIn: 5, doc: "rohan", status: "Queued", worth: 1200, lang: "मराठी" },
  { id: "R-514", patient: "Gauri Phadke", phone: "90750 33219", reason: "6-month cleaning", last: "8 May", dueIn: 18, doc: "rohan", status: "Queued", worth: 2200, lang: "मराठी" },
  { id: "R-515", patient: "Imtiaz Pathan", phone: "98815 02463", reason: "Implant review", last: "30 Mar", dueIn: -21, doc: "rohan", status: "Booked", worth: 0, lang: "हिंदी" },
  { id: "R-516", patient: "Shruti Kher", phone: "97305 88140", reason: "Ortho monthly", last: "21 Sep", dueIn: 1, doc: "sana", status: "Sent", worth: 1500, lang: "English" },
];
const recallTone: Record<RecallStatus, Tone> = { Queued: "neutral", Sent: "info", Replied: "warn", Booked: "ok", "No reply": "late" };

/* ---------------- Billing ---------------- */

type Due = { id: string; patient: string; plan: string; billed: number; paid: number; days: number; emi?: boolean; insurer?: string };
const seedDues: Due[] = [
  { id: "INV-3381", patient: "Col. Suresh Nair (retd.)", plan: "Complete dentures + 2 extractions", billed: 48000, paid: 25000, days: 14, insurer: "ECHS" },
  { id: "INV-3366", patient: "Harish Thakur", plan: "PFM bridge 14–16", billed: 31500, paid: 21000, days: 22 },
  { id: "INV-3372", patient: "Dilip Wagh", plan: "Implant #36 + crown #35", billed: 55700, paid: 20000, days: 8, emi: true },
  { id: "INV-3341", patient: "Om Jadhav", plan: "Metal braces, full course", billed: 45000, paid: 18000, days: 46, emi: true },
  { id: "INV-3329", patient: "Rakesh Joshi", plan: "Full-mouth rehab, phase 1", billed: 124000, paid: 80000, days: 63 },
  { id: "INV-3358", patient: "Prakash Gokhale", plan: "RCT #36 + crowns", billed: 28400, paid: 9500, days: 19, insurer: "Star Health" },
  { id: "INV-3317", patient: "Bhavna Oswal", plan: "Clear aligners, 22 trays", billed: 165000, paid: 110000, days: 78, emi: true },
  { id: "INV-3376", patient: "Mangesh Kale", plan: "Re-RCT #21 + crown", billed: 18000, paid: 2000, days: 11 },
  { id: "INV-3302", patient: "Kunal Bhat", plan: "Two implants, lower", billed: 84000, paid: 60000, days: 97 },
  { id: "INV-3385", patient: "Ritu Sharma", plan: "E-max crown + RCT", billed: 18300, paid: 6000, days: 6, insurer: "Medi Assist" },
];
type ClaimStatus = "Pre-auth sent" | "Query raised" | "Approved" | "Settled" | "Rejected";
const claims: { id: string; patient: string; tpa: string; amount: number; approved?: number; status: ClaimStatus; days: number; proc: string }[] = [
  { id: "CL-2291", patient: "Vikram Rao", tpa: "Medi Assist · Infosys group cover", amount: 42000, status: "Query raised", days: 5, proc: "Implant #46 (accidental)" },
  { id: "CL-2288", patient: "Prakash Gokhale", tpa: "Star Health · senior citizen", amount: 9800, approved: 6500, status: "Approved", days: 9, proc: "RCT #36" },
  { id: "CL-2294", patient: "Ritu Sharma", tpa: "Medi Assist · TCS group cover", amount: 11200, status: "Pre-auth sent", days: 2, proc: "RCT + crown #24, #25" },
  { id: "CL-2279", patient: "Col. Suresh Nair", tpa: "ECHS polyclinic, Khadki", amount: 32000, approved: 32000, status: "Settled", days: 31, proc: "Complete dentures" },
  { id: "CL-2283", patient: "Asha Lele", tpa: "Niva Bupa", amount: 15500, status: "Rejected", days: 18, proc: "Crown #16 (cosmetic, excluded)" },
  { id: "CL-2296", patient: "Ganesh Shinde", tpa: "HDFC Ergo · Persistent group", amount: 12000, status: "Pre-auth sent", days: 1, proc: "Surgical extraction #38 #48" },
];
const claimTone: Record<ClaimStatus, Tone> = { "Pre-auth sent": "info", "Query raised": "warn", Approved: "accent", Settled: "ok", Rejected: "late" };

/* ---------------- Shared modules ---------------- */

const team: TeamMember[] = [
  { name: "Dr. Meera Kulkarni", role: "Owner · prosthodontist", status: "Busy", load: 92, focus: "Crown prep for Vandana; approving 3 discounts and the Medi Assist query", tasks: [{ title: "Crown prep #11 Vandana", due: "now" }, { title: "Approve 3 estimate discounts", due: "1:30" }, { title: "Smile design for Anjali Mehta", due: "4:30" }], week: [1, 1, 1, 1, 1, 1], since: "2011" },
  { name: "Dr. Aniket Joshi", role: "Endodontist", status: "Busy", load: 86, focus: "Running 6 min over on RCT #36; emergency Tejas next", tasks: [{ title: "RCT #36 obturation", due: "now" }, { title: "Pulpitis #46 emergency", due: "11:45" }, { title: "Sign RVG reports ×4", due: "2:00", done: true }], week: [1, 1, 1, 1, 1, 0], since: "2016" },
  { name: "Dr. Sana Shaikh", role: "Orthodontist (visiting)", status: "On floor", load: 74, focus: "Ortho day: 7 patients, 2 waiting", tasks: [{ title: "iTero scan Kabir Sethi", due: "11:40" }, { title: "Approve aligner setup, Ishita refinement", due: "1:00" }], week: [0, 1, 0, 1, 0, 1], since: "2021" },
  { name: "Dr. Rohan Deshpande", role: "Oral surgeon · implants", status: "On floor", load: 68, focus: "Implant stage 2 for Vikram once sugar is checked", tasks: [{ title: "Check Vikram's sugar before stage 2", due: "11:55" }, { title: "Implant kit order, Osstem", due: "3:00" }, { title: "Dilip Wagh implant placement", due: "5:00" }], week: [1, 1, 1, 1, 1, 1], since: "2019" },
  { name: "Swati Jagtap", role: "Front desk & appointments", status: "On floor", load: 88, focus: "5 in the waiting room, 1 walk-in, phone ringing", tasks: [{ title: "Call Meher Vora (no-show)", due: "12:45" }, { title: "Confirm tomorrow's 38 appointments", due: "6:00" }, { title: "Collect ₹23,000 from Col. Nair", due: "12:15" }], week: [1, 1, 1, 1, 1, 1], since: "2018" },
  { name: "Pallavi Gaikwad", role: "Chair-side assistant", status: "Busy", load: 81, focus: "Assisting Dr. Meera on Chair 3", tasks: [{ title: "Tray setup Chair 5", due: "now" }, { title: "Shade photos Anjali", due: "4:30" }], week: [1, 1, 1, 1, 1, 0], since: "2020" },
  { name: "Rahul Sonawane", role: "Sterilisation & lab coordinator", status: "On floor", load: 63, focus: "Autoclave cycle 14 for Chair 4; Ivory Lab pickup 10:30 done", tasks: [{ title: "Bowie-Dick test log", due: "9:00", done: true }, { title: "Send Vandana's scan to Ivory Lab", due: "1:00" }, { title: "Chase Precision Ceramics for Harish bridge", due: "3:00" }], week: [1, 1, 1, 1, 1, 1], since: "2017" },
  { name: "Kirti Bhagat", role: "Accounts & insurance", status: "In field", load: 57, focus: "At Medi Assist desk, Baner, for the Vikram Rao query", tasks: [{ title: "Reply to CL-2291 query", due: "1:00" }, { title: "Tally day-book entry", due: "8:30 PM" }], week: [1, 1, 1, 0, 1, 1], since: "2022" },
];

const agents: WorkforceAgent[] = [
  { name: "Chair Router", role: "Matches waiting patients to the right free chair", icon: Armchair, status: "Running", runsToday: 31, hoursSaved: 3, accuracy: 95, last: "just now", skills: ["Chair map", "Doctor rota", "Wait time"], schedule: "Live, every chair change", log: ["Suggested Chair 5 for Shalini Kamat (Dr. Meera free at 11:50)", "Flagged Siddhi Patil waiting 21 min", "Held Chair 4 for Vikram until sterilisation ends"] },
  { name: "Recall Caller", role: "Sends recall WhatsApps in the patient's language", icon: Repeat, status: "Needs you", runsToday: 2, hoursSaved: 6, accuracy: 92, last: "40 min ago", skills: ["Recall rules", "WhatsApp", "Marathi / Hindi"], schedule: "Daily 7 PM batch", inbox: [{ title: "64 recalls ready for tonight", detail: "3 crowns-after-RCT are 3 weeks overdue (₹34,500 of pending work). Send with priority?" }], log: ["Booked 4 cleanings from yesterday's batch", "Marked 2 numbers as wrong", "Translated cleaning template to Marathi"] },
  { name: "Lab Tracker", role: "Chases labs and books the fit when work is back", icon: FlaskConical, status: "Running", runsToday: 8, hoursSaved: 2.5, accuracy: 94, last: "12 min ago", skills: ["Lab WhatsApp groups", "Due dates", "Booking"], schedule: "Every 2 hours", log: ["Ivory Lab confirmed #24 e-max for tomorrow", "Prakash's #46 crown back; fit added to his RCT visit", "Precision Ceramics bridge is 1 day late"] },
  { name: "Claims Clerk", role: "Prepares pre-auth packets and answers TPA queries", icon: ShieldCheck, status: "Needs you", runsToday: 5, hoursSaved: 4, accuracy: 89, last: "25 min ago", skills: ["TPA portals", "RVG + OPG", "Invoices"], schedule: "On every insured plan", inbox: [{ title: "Medi Assist wants the accident FIR for CL-2291", detail: "Vikram's employer letter is attached; the FIR copy is missing. Ask Vikram on WhatsApp?" }], log: ["Filed CL-2296 pre-auth with OPG", "Star Health approved ₹6,500 on CL-2288", "Drafted appeal for CL-2283"] },
  { name: "Reminder Bot", role: "Confirms tomorrow's appointments and handles reschedules", icon: AlarmClock, status: "Running", runsToday: 46, hoursSaved: 3.5, accuracy: 97, last: "3 min ago", skills: ["WhatsApp", "Calendar", "Gap filling"], schedule: "7 PM + 2 hours before", log: ["20 of 25 confirmed today", "Moved Riya Deshmukh to 6 PM at her request", "Offered Meher Vora's slot to the waitlist"] },
  { name: "Review Asker", role: "Asks happy patients for a Google review", icon: Sparkles, status: "Idle", runsToday: 6, hoursSaved: 1, accuracy: 90, last: "1 h ago", skills: ["Google Business", "Sentiment", "Timing"], schedule: "2 hours after a completed visit", log: ["Sunita Apte left 5 stars", "Skipped Ganesh Shinde (post-op pain)", "Rating 4.8 from 612 reviews"] },
];

const independence: IndependenceData = {
  score: 41,
  history: [26, 29, 31, 33, 36, 38, 41],
  quote: "If I am in the chair for a crown prep, the front desk still walks in to ask me which chair the next patient goes to.",
  pillars: [
    { name: "Patient flow", score: 44, note: "Chair allocation is decided by shouting across the corridor.", fixes: [{ title: "Chair Router on the front-desk tablet", gain: 4 }, { title: "Doctor colour codes on the map", gain: 1 }] },
    { name: "Treatment plans", score: 38, note: "Estimates are hand-written; patients forget what they agreed.", fixes: [{ title: "WhatsApp estimates from the tooth chart", gain: 3 }, { title: "Plan acceptance follow-up", gain: 2 }] },
    { name: "Recalls & retention", score: 29, note: "Recalls happen when Swati has a free afternoon, about twice a month.", fixes: [{ title: "Nightly recall batch", gain: 4 }] },
    { name: "Lab & materials", score: 47, note: "Rahul knows every lab case, but only in his notebook.", fixes: [{ title: "Lab board with due dates", gain: 3 }] },
    { name: "Money & insurance", score: 35, note: "Every discount over ₹1,000 needs Dr. Meera. TPA queries wait for Kirti.", fixes: [{ title: "Discount rules by plan value", gain: 3 }, { title: "Claims Clerk drafts replies", gain: 2 }] },
    { name: "Team & doctors", score: 52, note: "Associate doctors run their own chairs well; consent forms are patchy.", fixes: [{ title: "Digital consent per procedure", gain: 2 }] },
    { name: "Owner time", score: 39, note: "Dr. Meera spends 11 hours a week on non-clinical approvals.", fixes: [{ title: "One approval window at 1:30", gain: 2 }] },
  ],
  ownerHours: [
    { label: "Chairside", hours: 26 },
    { label: "Approvals", hours: 6 },
    { label: "Lab calls", hours: 3 },
    { label: "Patient calls", hours: 4 },
    { label: "Insurance", hours: 2 },
    { label: "Accounts", hours: 3 },
    { label: "Growth", hours: 1 },
  ],
};

const integrations: Integration[] = [
  { name: "WhatsApp Business", category: "Messaging", status: "Connected", detail: "Recalls, reminders, estimates and lab groups.", synced: "just now", records: "4,812 chats", mark: "W", color: "#1f9d55" },
  { name: "Tally Prime", category: "Accounts", status: "Connected", detail: "Daily receipts, lab bills and GST on cosmetic work.", synced: "20 min ago", records: "6,230 vouchers", mark: "T", color: "#1c4f9c" },
  { name: "Practo", category: "Bookings", status: "Connected", detail: "Online bookings land straight on the doctor timeline.", synced: "4 min ago", records: "312 bookings", mark: "P", color: "#14bef0" },
  { name: "Google Business Profile", category: "Reviews", status: "Connected", detail: "4.8 from 612 reviews; replies drafted by Review Asker.", synced: "1 h ago", records: "612 reviews", mark: "G", color: "#ea4335" },
  { name: "RVG / OPG imaging", category: "Clinical", status: "Syncing", detail: "X-rays attach to the patient's tooth chart.", synced: "live", records: "9 images today", mark: "X", color: "#475569" },
  { name: "iTero scanner", category: "Clinical", status: "Connected", detail: "Aligner scans sent to Smilecraft from the chair.", synced: "10:58 AM", records: "41 scans", mark: "iT", color: "#0e7490" },
  { name: "Razorpay UPI + card", category: "Payments", status: "Connected", detail: "QR at the desk and payment links for estimates.", synced: "2 min ago", records: "₹1.6 L today", mark: "R", color: "#2563eb" },
  { name: "Medi Assist TPA", category: "Insurance", status: "Error", detail: "Portal session expired; 1 query waiting.", synced: "yesterday", records: "—", mark: "MA", color: "#d97706" },
  { name: "Bajaj Finserv EMI", category: "Payments", status: "Available", detail: "No-cost EMI on aligners and implants.", synced: "—", records: "—", mark: "B", color: "#0b3d91" },
  { name: "Google Calendar", category: "Scheduling", status: "Connected", detail: "Visiting ortho days synced to Dr. Sana's calendar.", synced: "15 min ago", records: "3 calendars", mark: "C", color: "#4285f4" },
];

/* ============================================================
   Config
   ============================================================ */

const config: DeskConfig = {
  slug: "dental",
  company: "Nilgiri Dental Studio",
  brand: "Nilgiri",
  city: "Pune",
  state: "MH",
  icon: Smile,
  tagline: "Karve Road · 5 chairs · 4 doctors · 25 visits booked today",
  owner: { name: "Dr. Meera Kulkarni", first: "Meera", initials: "MK", role: "Owner, prosthodontist" },
  theme: {
    variant: "atelier",
    paper: "#eef5f2",
    panel: "#ffffff",
    sunk: "#e2ede9",
    ink: "#0f2b26",
    mute: "#56706a",
    line: "#d2e2dc",
    accent: "#1f7a64",
    accentInk: "#ffffff",
    soft: "#dbefe7",
    ok: "#2f9a5d",
    warn: "#e0694e",
    late: "#c13c4f",
    info: "#3a7fb0",
    heading: "sans",
    radius: 16,
  },
  agenda: [
    { at: 9, title: "Morning huddle", detail: "25 booked, 2 implants, visiting ortho day", tone: "accent", module: "chairs" },
    { at: 10.5, title: "Ivory Lab pickup", detail: "4 cases out, 2 crowns back", count: 4, tone: "info", module: "lab" },
    { at: 12, title: "Insurance calls", detail: "Medi Assist query on CL-2291", count: 3, tone: "warn", module: "billing" },
    { at: 14, title: "Lunch + autoclave check", detail: "Spore test log, chairs 1–5", tone: "neutral", module: "chairs" },
    { at: 16.5, title: "Evening OPD opens", detail: "9 booked, gaps to fill from recalls", count: 9, tone: "accent", module: "schedule" },
    { at: 19, title: "Recall WhatsApp batch", detail: "64 recalls in Marathi, Hindi, English", count: 64, tone: "ok", module: "recalls" },
  ],
  activity: [
    { time: "11:34 AM", text: "Shalini Kamat walked in with sensitivity, added to the queue", tone: "info" },
    { time: "11:20 AM", text: "Chair 4 sent to sterilisation after Lata Deshmukh's scaling", tone: "warn" },
    { time: "11:05 AM", text: "Star Health approved ₹6,500 on CL-2288 (Prakash Gokhale)", tone: "ok" },
    { time: "10:48 AM", text: "Prakash Gokhale's zirconia crown #46 back from Ivory Lab", tone: "ok" },
    { time: "10:30 AM", text: "Meher Vora no-show for retainer delivery; slot offered to waitlist", tone: "late" },
    { time: "9:40 AM", text: "Reminder Bot: 20 of 25 appointments confirmed", tone: "neutral" },
  ],
  asks: [
    { q: "Who should go into Chair 5 now?", a: "Shalini Kamat (walk-in, sensitivity, 20 min). Dr. Meera's crown prep in Chair 3 starts in a few minutes, but Chair 5 is free and Dr. Rohan is idle until Chair 4 is sterilised.\n\n• Tejas More (pain 8/10) belongs with Dr. Aniket, who frees up in about 25 min. Give him an analgesic now.\n• Siddhi Patil has waited 21 min for Dr. Sana; Chair 2 frees in 7 min.\n\nSuggested: Shalini → Chair 5 with Dr. Rohan for a quick exam and RVG.", sources: ["Chair map", "Doctor timeline", "Waiting room"] },
    { q: "How much treatment is proposed but not started?", a: "₹1.96 L across 3 proposed plans:\n• Anjali Mehta, 4 zirconia crowns + scaling: ₹48,200 (wedding in Feb; she asked about EMI)\n• Tejas More, RCT + crown + filling: ₹10,500\n• Shalini Kamat, 3 fillings + scaling: ₹7,600\n\nAccepted but not started: ₹1.38 L (Farida Bohra waiting for the 2nd trimester to pass, Mangesh Kale today at 5).", sources: ["Treatment plans", "Tooth charts"] },
    { q: "Which lab cases are late?", a: "Two:\n• Harish Thakur's PFM bridge (Precision Ceramics) came back for trial but the shade is off; remake requested, 1 day behind.\n• Col. Nair's denture trial is today at 12:15 and the wax try-in reached at 10:30, so that is on time.\n\nPrakash Gokhale's crown #46 is back: the fit was added to today's RCT visit.", sources: ["Lab board", "Lab WhatsApp groups"] },
    { q: "How are recalls doing this month?", a: "186 patients are due this month. 64 go out tonight at 7 PM.\n\nLast 30 days: 212 sent → 118 replied → 61 booked (29%). Cleanings convert best in Marathi (34%). Crown-after-RCT recalls are the money: 3 patients are 2–3 weeks overdue with ₹34,500 of crowns pending, and an untreated RCT tooth can fracture.", sources: ["Recall queue", "WhatsApp Business"] },
    { q: "What is stuck with insurance?", a: "₹1.1 L across 6 claims:\n• CL-2291 Vikram Rao, ₹42,000: Medi Assist wants the accident FIR. This is the only blocker today.\n• CL-2294 and CL-2296 pre-auths sent this week.\n• CL-2283 Asha Lele rejected: a crown was treated as cosmetic. Appeal drafted with the RCT X-ray.\n\nStar Health approved ₹6,500 of ₹9,800 for Prakash; he pays the balance ₹3,300.", sources: ["Claims", "TPA portals"] },
    { q: "Draft a WhatsApp estimate for Anjali Mehta", a: "Draft (not sent):\n\n“Hi Anjali, thank you for visiting Nilgiri Dental Studio. Your smile design plan: 4 zirconia crowns (11, 12, 21, 22) at ₹11,500 each, plus scaling ₹2,200. Total ₹48,200. Cosmetic work carries 18% GST. No-cost EMI over 6 months with Bajaj Finserv is available. We can finish 3 weeks before your wedding if we start by 15 Nov. Dr. Meera Kulkarni”", sources: ["Tooth chart NDS-2435", "Fee schedule"] },
  ],
  run: {
    label: "Runs every 15 minutes during OPD. You can also run it now.",
    title: "Flow Watcher",
    steps: [
      { text: "Read the chair map and waiting room", result: "3 chairs busy, 1 sterilising, 1 free · 5 waiting" },
      { text: "Compare each doctor's timeline with real progress", result: "Dr. Aniket 6 min over, Dr. Sana 14 min behind" },
      { text: "Check today's lab returns against booked fits", result: "Crown #46 back, fit added to Prakash's visit" },
      { text: "Find gaps in the evening OPD", result: "7 gaps of 45 min or more" },
      { text: "Draft recall offers for those gaps", result: "9 overdue cleanings matched to the gaps" },
    ],
    outcome: "Put Shalini Kamat in Chair 5 with Dr. Rohan now and Tejas More in Chair 1 when it frees. Offer the evening gaps to 9 overdue cleanings: about ₹19,800 of chair time that would otherwise sit empty.",
    actions: ["Seat Shalini in Chair 5", "Send gap offers to 9 recalls", "Tell Siddhi's mother: 7 min more", "Book Prakash's crown fit"],
  },
};

/* ============================================================
   Helpers
   ============================================================ */

function fmtH(h: number) {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  const h12 = ((hh + 11) % 12) + 1;
  return `${h12}:${String(mm).padStart(2, "0")}${hh >= 12 ? " PM" : " AM"}`;
}
function mmss(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
/** Seconds since the desk opened, ticking every second. */
function useClinicClock() {
  const [sec, setSec] = React.useState(0);
  React.useEffect(() => {
    const id = window.setInterval(() => setSec((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  return sec;
}

/* ============================================================
   Desk
   ============================================================ */

export default function DentalDesk() {
  const [chairs, setChairs] = React.useState(seedChairs);
  const [queue, setQueue] = React.useState(seedQueue);
  const [collected, setCollected] = React.useState(186400);
  const [doneToday, setDoneToday] = React.useState(6);
  const [labs, setLabs] = React.useState(seedLab);
  const clock = useClinicClock();

  const modules: DeskModule[] = [
    {
      id: "chairs",
      label: "Chairs",
      count: queue.length,
      title: "Live chair map",
      blurb: "All five chairs, top down: who is in, what is being done, how long it has run and what frees up next",
      icon: Armchair,
      notes: ["Each room is a chair. The ring is time used against the planned slot; coral means the slot ran over.", "Drag a patient from the waiting room onto a free chair, or tap a patient then tap the chair.", "Click a chair to seat the patient, finish and bill, or release it after sterilisation."],
      render: () => (
        <ChairsHome chairs={chairs} setChairs={setChairs} queue={queue} setQueue={setQueue} clock={clock} collected={collected} doneToday={doneToday} onFinish={(fee) => { setCollected((c) => c + fee); setDoneToday((d) => d + 1); }} />
      ),
    },
    { id: "schedule", label: "Schedule", count: 25, title: "Doctor schedule", blurb: "Each doctor's day as a timeline: who is due, who is late, and the gaps you can still fill", icon: CalendarDays, render: () => <ScheduleTab /> },
    { id: "patients", label: "Patients", count: seedPatients.filter((p) => p.stage === "Proposed").length, title: "Patients & treatment plans", blurb: "Tap teeth to plan the work; the estimate builds itself and goes out on WhatsApp", icon: Stethoscope, render: () => <PatientsTab /> },
    { id: "lab", label: "Lab work", count: labs.filter((l) => l.stage !== "fitted").length, title: "Lab work", blurb: "Crowns, bridges, dentures and aligners from scan to fit, across four labs", icon: FlaskConical, render: () => <LabTab labs={labs} setLabs={setLabs} /> },
    { id: "recalls", label: "Recalls", count: seedRecalls.filter((r) => r.status === "Queued").length, title: "Recalls & reminders", blurb: "Who is due back, in which language we ask, and who has booked", icon: Repeat, render: () => <RecallsTab /> },
    { id: "billing", label: "Billing", count: claims.filter((c) => c.status === "Query raised" || c.status === "Pre-auth sent").length, title: "Billing, estimates & insurance", blurb: "Estimates waiting on Dr. Meera, patient dues, EMI and TPA claims", icon: IndianRupee, render: () => <BillingTab /> },
    { id: "team", label: "People", title: "People", blurb: "Doctors, front desk, assistants and the sterilisation room", icon: Users, render: () => <PeopleModule members={team} /> },
    { id: "agents", label: "Agents", title: "Agents", blurb: "Six AI agents keeping the chairs full and the follow-ups going", icon: Timer, render: () => <AgentsModule agents={agents} /> },
    { id: "independence", label: "Independence", title: "Owner independence", blurb: "How much of Nilgiri runs while Dr. Meera is in the chair", icon: GaugeIcon, render: () => <IndependenceModule data={independence} /> },
    { id: "connections", label: "Connections", title: "Connections", blurb: "WhatsApp, Tally, Practo, imaging and the TPA portals", icon: Plug, render: () => <ConnectionsModule items={integrations} /> },
  ];

  return <DeskShell config={config} modules={modules} />;
}

/* ============================================================
   Home: live chair map
   ============================================================ */

const VW = 1000;
const VH = 540;
const ROOMS: Record<string, { x: number; y: number; w: number; h: number; top: boolean }> = {
  C1: { x: 248, y: 14, w: 244, h: 216, top: true },
  C2: { x: 502, y: 14, w: 244, h: 216, top: true },
  C3: { x: 756, y: 14, w: 230, h: 216, top: true },
  C4: { x: 248, y: 310, w: 244, h: 216, top: false },
  C5: { x: 502, y: 310, w: 244, h: 216, top: false },
};
const pctBox = (r: { x: number; y: number; w: number; h: number }) => ({ left: `${(r.x / VW) * 100}%`, top: `${(r.y / VH) * 100}%`, width: `${(r.w / VW) * 100}%`, height: `${(r.h / VH) * 100}%` });
const stateMeta: Record<ChairState, { label: string; tone: Tone }> = {
  in: { label: "In chair", tone: "accent" },
  prep: { label: "Prep", tone: "info" },
  steril: { label: "Sterilising", tone: "warn" },
  free: { label: "Free", tone: "ok" },
};

function ChairsHome({
  chairs,
  setChairs,
  queue,
  setQueue,
  clock,
  collected,
  doneToday,
  onFinish,
}: {
  chairs: Chair[];
  setChairs: React.Dispatch<React.SetStateAction<Chair[]>>;
  queue: Waiting[];
  setQueue: React.Dispatch<React.SetStateAction<Waiting[]>>;
  clock: number;
  collected: number;
  doneToday: number;
  onFinish: (fee: number) => void;
}) {
  const desk = useDesk();
  const [picked, setPicked] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState<string | null>(null);
  const [walkIn, setWalkIn] = React.useState(false);
  const chair = chairs.find((c) => c.id === open) ?? null;
  const busy = chairs.filter((c) => c.state === "in" || c.state === "prep").length;
  const avgWait = queue.length ? Math.round(queue.reduce((a, q) => a + q.waitBase + clock / 60, 0) / queue.length) : 0;
  const drift = useDrift(0, 900, 3200);

  function assign(patientId: string, chairId: string) {
    const p = queue.find((q) => q.id === patientId);
    const c = chairs.find((x) => x.id === chairId);
    if (!p || !c) return;
    if (c.state !== "free") {
      toast.error(`${c.name} is not free`, { description: c.state === "steril" ? "Wait for the autoclave cycle to finish." : `${c.patient} is in it.` });
      return;
    }
    setChairs((cur) => cur.map((x) => (x.id === chairId ? { ...x, state: "prep", patient: p.name, proc: p.proc, doc: p.doc, planMin: p.mins, since: clock, fee: p.fee, flags: p.flags } : x)));
    setQueue((cur) => cur.filter((q) => q.id !== patientId));
    setPicked(null);
    toast.success(`${p.name} → ${c.name}`, { description: `${DOCTORS[p.doc].short} notified · tray setup started` });
    desk.log(`${p.name} sent to ${c.name} (${c.room}) for ${p.proc}`, "info");
  }

  function advance(c: Chair) {
    if (c.state === "prep") {
      setChairs((cur) => cur.map((x) => (x.id === c.id ? { ...x, state: "in", since: clock } : x)));
      toast.success(`${c.patient} seated in ${c.name}`, { description: `${c.proc} · ${c.planMin} min slot started` });
      desk.log(`${c.patient} seated in ${c.name}`, "ok");
    } else if (c.state === "in") {
      setChairs((cur) => cur.map((x) => (x.id === c.id ? { ...x, state: "steril", planMin: STERIL_MIN, since: clock, patient: undefined, proc: undefined, doc: undefined, flags: undefined } : x)));
      onFinish(c.fee ?? 0);
      toast.success(`${c.patient} done · bill ${inr(c.fee ?? 0)} to front desk`, { description: `${c.name} sent for sterilisation, ${STERIL_MIN} min cycle` });
      desk.log(`${c.patient} finished in ${c.name}; bill ${inr(c.fee ?? 0)} raised`, "ok");
    } else if (c.state === "steril") {
      setChairs((cur) => cur.map((x) => (x.id === c.id ? { ...x, state: "free", since: clock, planMin: 30 } : x)));
      toast.success(`${c.name} is ready`, { description: "Autoclave cycle logged, new tray set" });
      desk.log(`${c.name} sterilised and ready`, "ok");
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <Panel
          live
          title="Live chair map"
          sub={`${busy} of ${chairs.length} chairs working · ${chairs.filter((c) => c.state === "free").length} free · ${queue.length} waiting`}
          action={
            <div className="hidden items-center gap-3 text-[11.5px] text-d-mute md:flex">
              {(Object.keys(stateMeta) as ChairState[]).map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: toneVar(stateMeta[s].tone) }} />
                  {stateMeta[s].label}
                </span>
              ))}
            </div>
          }
        >
          <ChairMap chairs={chairs} clock={clock} waiting={queue.length} picked={picked} onAssign={assign} onOpen={setOpen} onAdvance={advance} />
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-d-line pt-3">
            <span className="mr-1 text-[12px] font-semibold text-d-mute">Frees up next</span>
            {[...chairs]
              .map((c) => {
                const left = c.state === "free" ? 0 : c.state === "prep" ? c.planMin * 60 + 120 - (clock - c.since) : c.planMin * 60 - (clock - c.since);
                return { c, left: Math.max(0, left) };
              })
              .sort((a, b) => a.left - b.left)
              .map(({ c, left }) => (
                <button key={c.id} type="button" onClick={() => setOpen(c.id)} className="inline-flex items-center gap-1.5 rounded-full border border-d-line bg-d-panel px-2.5 py-1 text-[12px] hover:bg-d-sunk">
                  <span className="h-2 w-2 rounded-full" style={{ background: toneVar(stateMeta[c.state].tone) }} />
                  {c.name}
                  <span className="tnum font-mono text-[11.5px] text-d-mute">{left === 0 ? "now" : `~${Math.ceil(left / 60)} min`}</span>
                </button>
              ))}
            <span className="ml-auto text-[11.5px] text-d-mute">{picked ? "Patient picked: tap a free chair" : "Tip: tap a waiting patient, then a free chair"}</span>
          </div>
        </Panel>
        <Panel
          icon={Users}
          title="Waiting room"
          sub="Drag onto a free chair, or tap then tap"
          action={
            <Btn size="sm" icon={UserPlus} onClick={() => setWalkIn(true)}>
              Walk-in
            </Btn>
          }
        >
          <WaitingList queue={queue} clock={clock} picked={picked} onPick={setPicked} />
        </Panel>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Chairs working now" value={`${busy} / ${chairs.length}`} delta="+1" hint="vs 11 AM average" icon={Armchair} trend={[2, 3, 4, 4, 3, 4, 3, busy]} />
        <Stat label="Average wait" value={`${avgWait} min`} delta="+4 min" deltaGood={false} hint="target under 10" icon={Hourglass} tone="warn" trend={[6, 8, 7, 9, 11, 10, 12, avgWait]} />
        <Stat label="Patients seen today" value={`${doneToday} / 25`} hint="1 no-show so far" icon={Smile} tone="ok" trend={[0, 1, 2, 3, 4, 5, 6, doneToday]} />
        <Stat label="Collected today" value={inr(collected + Math.round(drift), { compact: true })} delta="+11%" hint="UPI 64%, card 22%, cash 14%" icon={IndianRupee} trend={[0.2, 0.4, 0.7, 0.9, 1.2, 1.5, 1.7, collected / 1e5]} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr_1fr]">
        <DoctorsToday chairs={chairs} queue={queue} />
        <Panel icon={Clock} title="Chair hours today" sub="Booked vs walk-ins, all five chairs">
          <Bars
            height={170}
            format={(v) => `${v}`}
            data={["9", "10", "11", "12", "1", "4", "5", "6", "7", "8"].map((h, i) => {
              const booked = [2, 4, 4, 4, 3, 3, 5, 4, 4, 2][i];
              const walk = [0, 0, 1, 1, 0, 0, 0, 1, 0, 0][i];
              return { label: h, value: booked + walk, stack: [{ name: "Booked", value: booked, tone: "accent" as const }, { name: "Walk-in", value: walk, tone: "warn" as const }] };
            })}
          />
          <p className="mt-3 text-[12px] text-d-mute">The evening session has open slots. Recall Caller can fill them tonight.</p>
        </Panel>
        <Panel icon={HeartPulse} title="Front desk alerts" sub="Medical flags and nudges for the next hour">
          <Feed
            items={[
              { time: "now", who: "Chair Router", text: "Tejas More is in pain (8/10). Give an analgesic and put him first for Dr. Aniket.", tone: "late" },
              { time: "11:55", who: "Dr. Rohan", text: "Vikram Rao is diabetic: check sugar before implant stage 2.", tone: "warn" },
              { time: "12:15", who: "Lab Tracker", text: "Col. Nair's denture wax try-in is at the desk.", tone: "info" },
              { time: "12:30", who: "Claims Clerk", text: "Farida Bohra is pregnant: no RVG without the lead apron.", tone: "warn" },
              { time: "12:45", who: "Reminder Bot", text: "Meher Vora missed her retainer slot; call her before 1.", tone: "neutral" },
            ]}
          />
        </Panel>
      </div>

      <ChairSheet chair={chair} clock={clock} onClose={() => setOpen(null)} onAdvance={(c) => { advance(c); setOpen(null); }} queue={queue} onAssign={(pid, cid) => { assign(pid, cid); setOpen(null); }} />
      <WalkInModal
        open={walkIn}
        onOpenChange={setWalkIn}
        onAdd={(w) => {
          setQueue((cur) => [...cur, w]);
          toast.success(`${w.name} added to the waiting room`, { description: `${w.proc} · ${DOCTORS[w.doc].short}` });
          desk.log(`Walk-in ${w.name} added for ${w.proc}`, "info");
        }}
      />
    </div>
  );
}

function ChairMap({
  chairs,
  clock,
  waiting,
  picked,
  onAssign,
  onOpen,
  onAdvance,
}: {
  chairs: Chair[];
  clock: number;
  waiting: number;
  picked: string | null;
  onAssign: (patientId: string, chairId: string) => void;
  onOpen: (id: string) => void;
  onAdvance: (c: Chair) => void;
}) {
  const [over, setOver] = React.useState<string | null>(null);
  return (
    <div className="desk-scroll -mx-5 overflow-x-auto px-5 pb-1">
      <div className="relative min-w-[900px]" style={{ aspectRatio: `${VW} / ${VH}` }}>
        <FloorPlan chairs={chairs} waiting={waiting} />
        {chairs.map((c) => {
          const box = ROOMS[c.id];
          const meta = stateMeta[c.state];
          const elapsed = clock - c.since;
          const plan = c.planMin * 60;
          const pct = Math.min(1, elapsed / plan);
          const overrun = c.state === "in" && elapsed > plan;
          const remain = plan - elapsed;
          const droppable = c.state === "free";
          return (
            <div
              key={c.id}
              role="button"
              tabIndex={0}
              onClick={() => (picked && droppable ? onAssign(picked, c.id) : onOpen(c.id))}
              onKeyDown={(e) => e.key === "Enter" && onOpen(c.id)}
              onDragOver={(e) => {
                if (!droppable) return;
                e.preventDefault();
                setOver(c.id);
              }}
              onDragLeave={() => setOver((o) => (o === c.id ? null : o))}
              onDrop={(e) => {
                e.preventDefault();
                setOver(null);
                const id = e.dataTransfer.getData("text/plain");
                if (id) onAssign(id, c.id);
              }}
              className="absolute flex cursor-pointer flex-col overflow-hidden rounded-[14px] border-2 p-2.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_rgba(0,0,0,0.45)]"
              style={{
                ...pctBox(box),
                borderStyle: droppable ? "dashed" : "solid",
                borderColor: over === c.id || (picked && droppable) ? "var(--d-accent)" : droppable ? "color-mix(in oklab, var(--d-ok) 55%, var(--d-line))" : `color-mix(in oklab, ${toneVar(meta.tone)} 60%, var(--d-line))`,
                background: over === c.id ? "var(--d-soft)" : droppable ? "color-mix(in oklab, var(--d-ok) 5%, var(--d-panel))" : `color-mix(in oklab, ${toneVar(meta.tone)} 8%, var(--d-panel))`,
                boxShadow: over === c.id ? "0 0 0 4px color-mix(in oklab, var(--d-accent) 25%, transparent)" : undefined,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[12.5px] font-semibold">
                  {c.name} <span className="font-normal text-d-mute">· {c.room}</span>
                </p>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-px text-[10.5px] font-semibold" style={{ color: toneVar(overrun ? "late" : meta.tone), background: `color-mix(in oklab, ${toneVar(overrun ? "late" : meta.tone)} 14%, transparent)` }}>
                  {c.state === "in" && <span className="desk-ping h-1.5 w-1.5 rounded-full bg-d-ok" />}
                  {overrun ? "Over time" : meta.label}
                </span>
              </div>
              <div className="flex min-h-0 flex-1 items-center gap-2.5">
                <ChairGlyph state={c.state} pct={c.state === "steril" ? 1 - Math.min(1, elapsed / plan) : pct} overrun={overrun} initials={c.patient} />
                <div className="min-w-0 flex-1">
                  {c.state === "free" ? (
                    <>
                      <p className="text-[13px] font-semibold text-d-ok">Ready for next</p>
                      <p className="text-[11.5px] leading-snug text-d-mute">{picked ? "Tap to seat the picked patient" : "Drop a patient here"}</p>
                    </>
                  ) : c.state === "steril" ? (
                    <>
                      <p className="text-[13px] font-semibold">Autoclave cycle</p>
                      <p className="text-[11.5px] text-d-mute">Class B · 134°C</p>
                      <p className="tnum mt-1 font-mono text-[18px] font-semibold" style={{ color: remain > 0 ? "var(--d-warn)" : "var(--d-ok)" }}>
                        {remain > 0 ? mmss(remain) : "Done"}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="truncate text-[13px] font-semibold">{c.patient}</p>
                      <p className="truncate text-[11.5px] text-d-mute">{c.proc}</p>
                      <p className="truncate text-[11.5px]" style={{ color: toneVar(c.doc ? DOCTORS[c.doc].tone : "neutral") }}>
                        {c.doc ? DOCTORS[c.doc].short : ""}
                      </p>
                      <p className="tnum mt-0.5 font-mono text-[15px] font-semibold" style={{ color: overrun ? "var(--d-late)" : undefined }}>
                        {mmss(elapsed)}
                        <span className="text-[11px] font-normal text-d-mute"> / {c.planMin}m</span>
                      </p>
                    </>
                  )}
                </div>
              </div>
              {c.state !== "free" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdvance(c);
                  }}
                  className="mt-1 h-7 w-full rounded-[9px] text-[11.5px] font-semibold transition-colors"
                  style={{ background: toneVar(c.state === "in" ? "accent" : c.state === "prep" ? "info" : remain > 0 ? "neutral" : "ok"), color: "var(--d-accent-ink)", opacity: c.state === "steril" && remain > 0 ? 0.75 : 1 }}
                >
                  {c.state === "prep" ? "Patient seated" : c.state === "in" ? "Finish & bill" : remain > 0 ? "Release early" : "Mark ready"}
                </button>
              )}
              {c.state === "free" && c.flags === undefined && (
                <p className="mt-1 rounded-[9px] border border-dashed border-d-line py-1 text-center text-[11px] text-d-mute">Tray set · suction checked</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FloorPlan({ chairs, waiting }: { chairs: Chair[]; waiting: number }) {
  const seats = Array.from({ length: 10 }, (_, i) => ({ x: 52 + (i % 5) * 34, y: 230 + Math.floor(i / 5) * 46 }));
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <pattern id="nds-tile" width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M22 0H0V22" fill="none" stroke="var(--d-line)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="3" y="3" width={VW - 6} height={VH - 6} rx="20" fill="var(--d-sunk)" stroke="var(--d-ink)" strokeOpacity="0.22" strokeWidth="3" />
      {/* corridor */}
      <rect x="242" y="236" width="750" height="68" fill="url(#nds-tile)" />
      <text x="612" y="275" textAnchor="middle" fontSize="11" letterSpacing="4" fill="var(--d-mute)" fontFamily="var(--font-mono)">
        CORRIDOR
      </text>
      {/* reception and waiting */}
      <rect x="12" y="12" width="222" height="516" rx="14" fill="var(--d-panel)" stroke="var(--d-line)" strokeWidth="1.5" />
      <path d="M36 52 h160 a12 12 0 0 1 12 12 v30 h-184 v-30 a12 12 0 0 1 12 -12z" fill="color-mix(in oklab, var(--d-accent) 14%, var(--d-panel))" stroke="var(--d-accent)" strokeOpacity="0.5" />
      <circle cx="116" cy="40" r="9" fill="var(--d-accent)" opacity="0.85" />
      <text x="116" y="80" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="var(--d-ink)">
        Reception · Swati
      </text>
      <text x="30" y="150" fontSize="10" letterSpacing="2.5" fill="var(--d-mute)" fontFamily="var(--font-mono)">
        WAITING ROOM
      </text>
      <text x="30" y="168" fontSize="11" fill="var(--d-ink)">
        {waiting} waiting · {10 - Math.min(10, waiting)} seats free
      </text>
      <rect x="34" y="200" width="178" height="120" rx="10" fill="none" stroke="var(--d-line)" strokeDasharray="4 4" />
      {seats.map((s, i) => (
        <g key={`seat-${s.x}-${s.y}`}>
          <rect x={s.x - 12} y={s.y + 4} width="24" height="22" rx="6" fill="var(--d-sunk)" stroke="var(--d-line)" />
          {i < waiting && <circle cx={s.x} cy={s.y + 10} r="8" fill={i === 0 ? "var(--d-late)" : "var(--d-info)"} className="desk-rise" style={{ animationDelay: `${i * 60}ms` }} />}
        </g>
      ))}
      <circle cx="58" cy="368" r="14" fill="color-mix(in oklab, var(--d-ok) 30%, var(--d-panel))" />
      <circle cx="190" cy="368" r="12" fill="color-mix(in oklab, var(--d-ok) 30%, var(--d-panel))" />
      <rect x="84" y="356" width="80" height="24" rx="5" fill="var(--d-sunk)" stroke="var(--d-line)" />
      <text x="124" y="372" textAnchor="middle" fontSize="9.5" fill="var(--d-mute)">
        Kids corner
      </text>
      <rect x="34" y="410" width="178" height="34" rx="8" fill="var(--d-sunk)" />
      <text x="123" y="431" textAnchor="middle" fontSize="10.5" fill="var(--d-mute)">
        Consult room · OPG on screen
      </text>
      <line x1="70" y1="528" x2="176" y2="528" stroke="var(--d-paper)" strokeWidth="6" />
      <path d="M70 528 a40 40 0 0 1 40 -40" fill="none" stroke="var(--d-mute)" strokeOpacity="0.5" strokeDasharray="3 3" />
      <text x="123" y="512" textAnchor="middle" fontSize="10" letterSpacing="2" fill="var(--d-mute)" fontFamily="var(--font-mono)">
        ENTRANCE
      </text>
      {/* door from reception */}
      <line x1="234" y1="250" x2="234" y2="290" stroke="var(--d-paper)" strokeWidth="5" />
      {/* CSSD + X-ray */}
      <rect x="756" y="310" width="112" height="216" rx="12" fill="color-mix(in oklab, var(--d-warn) 7%, var(--d-panel))" stroke="color-mix(in oklab, var(--d-warn) 40%, var(--d-line))" strokeWidth="1.5" />
      <text x="812" y="336" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--d-ink)">
        CSSD
      </text>
      <text x="812" y="352" textAnchor="middle" fontSize="9.5" fill="var(--d-mute)">
        Sterilisation
      </text>
      <rect x="782" y="372" width="60" height="56" rx="8" fill="var(--d-panel)" stroke="var(--d-warn)" strokeOpacity="0.6" />
      <circle cx="812" cy="400" r="17" fill="none" stroke="var(--d-warn)" strokeWidth="3" strokeDasharray="8 6" className={chairs.some((c) => c.state === "steril") ? "bb-spin" : undefined} style={{ transformOrigin: "812px 400px", transformBox: "view-box" }} />
      <text x="812" y="452" textAnchor="middle" fontSize="9.5" fill="var(--d-mute)">
        Autoclave · UV · RO
      </text>
      <text x="812" y="500" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--d-warn)">
        cycle {chairs.some((c) => c.state === "steril") ? "running" : "idle"}
      </text>
      <rect x="876" y="310" width="110" height="216" rx="12" fill="var(--d-panel)" stroke="var(--d-line)" strokeWidth="1.5" />
      <text x="931" y="336" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--d-ink)">
        X-ray
      </text>
      <text x="931" y="352" textAnchor="middle" fontSize="9.5" fill="var(--d-mute)">
        OPG · RVG · CBCT
      </text>
      <rect x="906" y="380" width="50" height="70" rx="10" fill="var(--d-sunk)" stroke="var(--d-line)" />
      <circle cx="931" cy="400" r="10" fill="none" stroke="var(--d-info)" strokeWidth="2" />
      <text x="931" y="480" textAnchor="middle" fontSize="9.5" fill="var(--d-mute)">
        9 images today
      </text>
      {/* walking paths */}
      {chairs.map((c) => {
        const r = ROOMS[c.id];
        const cx = r.x + r.w / 2;
        const doorY = r.top ? r.y + r.h : r.y;
        if (c.state === "prep")
          return <path key={`walk-${c.id}`} d={`M226 254 H${cx} V${doorY}`} fill="none" stroke="var(--d-info)" strokeWidth="3" strokeLinecap="round" className="desk-flow" />;
        if (c.state === "steril")
          return <path key={`walk-${c.id}`} d={`M${cx} ${doorY} V290 H812 V310`} fill="none" stroke="var(--d-warn)" strokeWidth="3" strokeLinecap="round" className="desk-flow" />;
        return null;
      })}
    </svg>
  );
}

function ChairGlyph({ state, pct, overrun, initials }: { state: ChairState; pct: number; overrun: boolean; initials?: string }) {
  const C = 2 * Math.PI * 42;
  const tone = overrun ? "late" : stateMeta[state].tone;
  const ini = initials
    ?.split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <svg viewBox="0 0 96 96" className="h-[84px] w-[84px] shrink-0">
      <circle cx="48" cy="48" r="42" fill="none" stroke="var(--d-line)" strokeWidth="5" strokeDasharray={state === "free" ? "3 5" : undefined} />
      {state !== "free" && (
        <circle
          cx="48"
          cy="48"
          r="42"
          fill="none"
          stroke={toneVar(tone)}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${Math.max(0.01, pct) * C} ${C}`}
          transform="rotate(-90 48 48)"
          style={{ transition: "stroke-dasharray 900ms linear" }}
        />
      )}
      {/* delivery unit + stool */}
      <line x1="58" y1="40" x2="74" y2="34" stroke="var(--d-mute)" strokeWidth="2" />
      <rect x="70" y="27" width="12" height="10" rx="2.5" fill="var(--d-panel)" stroke="var(--d-mute)" strokeWidth="1.5" />
      <circle cx="24" cy="32" r="6" fill={state === "in" ? "color-mix(in oklab, var(--d-accent) 40%, var(--d-panel))" : "var(--d-sunk)"} stroke="var(--d-mute)" strokeWidth="1.2" />
      {/* chair body, head at top */}
      <rect x="41" y="15" width="14" height="9" rx="4" fill="var(--d-panel)" stroke="var(--d-ink)" strokeOpacity="0.5" strokeWidth="1.4" />
      <rect x="34" y="25" width="28" height="26" rx="9" fill={`color-mix(in oklab, ${toneVar(state === "free" ? "ok" : tone)} 22%, var(--d-panel))`} stroke="var(--d-ink)" strokeOpacity="0.5" strokeWidth="1.4" />
      <rect x="36" y="52" width="24" height="15" rx="5" fill={`color-mix(in oklab, ${toneVar(state === "free" ? "ok" : tone)} 16%, var(--d-panel))`} stroke="var(--d-ink)" strokeOpacity="0.5" strokeWidth="1.4" />
      <rect x="39" y="68" width="18" height="15" rx="6" fill={`color-mix(in oklab, ${toneVar(state === "free" ? "ok" : tone)} 12%, var(--d-panel))`} stroke="var(--d-ink)" strokeOpacity="0.5" strokeWidth="1.4" />
      {(state === "in" || state === "prep") && ini && (
        <g className="desk-rise">
          <circle cx="48" cy="26" r="9" fill={toneVar(tone)} />
          <text x="48" y="29.5" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--d-accent-ink)">
            {ini}
          </text>
        </g>
      )}
      {state === "in" && <ellipse cx="48" cy="12" rx="12" ry="3" fill="color-mix(in oklab, var(--d-warn) 35%, transparent)" className="bb-pulse" />}
      {state === "steril" && <path d="M40 60 q8 -8 16 0" fill="none" stroke="var(--d-warn)" strokeWidth="2" className="desk-flow" />}
    </svg>
  );
}

function WaitingList({ queue, clock, picked, onPick }: { queue: Waiting[]; clock: number; picked: string | null; onPick: (id: string | null) => void }) {
  const sorted = [...queue].sort((a, b) => Number(!!b.priority) - Number(!!a.priority) || b.waitBase - a.waitBase);
  if (sorted.length === 0) return <p className="rounded-xl border border-dashed border-d-line px-4 py-10 text-center text-[13px] text-d-mute">Waiting room is empty. Nice.</p>;
  return (
    <ul className="space-y-2">
      {sorted.map((w, i) => {
        const wait = Math.floor(w.waitBase + clock / 60);
        const on = picked === w.id;
        return (
          <li
            key={w.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", w.id);
              e.dataTransfer.effectAllowed = "move";
            }}
            onClick={() => onPick(on ? null : w.id)}
            className="desk-rise cursor-grab rounded-[12px] border p-2.5 transition-all active:cursor-grabbing"
            style={{ animationDelay: `${i * 40}ms`, borderColor: on ? "var(--d-accent)" : "var(--d-line)", background: on ? "var(--d-soft)" : "var(--d-panel)", boxShadow: on ? "0 0 0 3px color-mix(in oklab, var(--d-accent) 20%, transparent)" : undefined }}
          >
            <div className="flex items-start gap-2.5">
              <Avatar name={w.name} size={34} tone={DOCTORS[w.doc].tone} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13.5px] font-semibold">
                    {w.name} <span className="font-normal text-d-mute">{w.age}</span>
                  </span>
                  <span className="tnum shrink-0 font-mono text-[12px] font-semibold" style={{ color: wait >= 20 ? "var(--d-late)" : wait >= 12 ? "var(--d-warn)" : "var(--d-mute)" }}>
                    {wait}m
                  </span>
                </p>
                <p className="truncate text-[12px] text-d-mute">{w.proc}</p>
                <p className="mt-1 flex flex-wrap items-center gap-1">
                  <span className="text-[11.5px] font-medium" style={{ color: toneVar(DOCTORS[w.doc].tone) }}>
                    {DOCTORS[w.doc].short}
                  </span>
                  <span className="font-mono text-[10.5px] text-d-mute">· appt {w.appt} · in {w.arrived}</span>
                </p>
                {w.flags.length > 0 && (
                  <p className="mt-1 flex flex-wrap gap-1">
                    {w.flags.map((f) => (
                      <Pill key={f} tone={f.startsWith("Pain") || f === "Diabetic" ? "late" : f === "Cashless" ? "info" : "neutral"}>
                        {f}
                      </Pill>
                    ))}
                  </p>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function DoctorsToday({ chairs, queue }: { chairs: Chair[]; queue: Waiting[] }) {
  const desk = useDesk();
  const rows = DOC_IDS.map((id) => {
    const appts = seedAppts.filter((a) => a.doc === id);
    const seen = appts.filter((a) => a.status === "Done").length;
    const inChair = chairs.find((c) => c.doc === id && (c.state === "in" || c.state === "prep"));
    const waiting = queue.filter((q) => q.doc === id).length;
    return { id, appts: appts.length, seen, inChair, waiting, late: { meera: 0, aniket: 6, sana: 14, rohan: 0 }[id] };
  });
  return (
    <Panel icon={Stethoscope} title="Doctors today" sub="Seen vs booked, and who is running late" action={<Btn size="sm" variant="ghost" icon={ArrowRight} onClick={() => desk.goTab("schedule")}>Schedule</Btn>}>
      <ul className="space-y-3">
        {rows.map((r) => {
          const d = DOCTORS[r.id];
          return (
            <li key={r.id} className="flex items-center gap-3">
              <Avatar name={d.name.replace("Dr. ", "")} size={36} tone={d.tone} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center justify-between gap-2 text-[13.5px] font-semibold">
                  <span className="truncate">{d.short}</span>
                  {r.late > 0 ? <Pill tone="warn">{r.late} min behind</Pill> : <Pill tone="ok">on time</Pill>}
                </p>
                <p className="truncate text-[11.5px] text-d-mute">{r.inChair ? `${r.inChair.name}: ${r.inChair.patient}` : "Between patients"} · {r.waiting} waiting</p>
                <Meter value={r.seen} max={r.appts} tone={d.tone} className="mt-1.5" height={5} />
              </div>
              <span className="tnum font-mono text-[12px] text-d-mute">
                {r.seen}/{r.appts}
              </span>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

function ChairSheet({ chair, clock, onClose, onAdvance, queue, onAssign }: { chair: Chair | null; clock: number; onClose: () => void; onAdvance: (c: Chair) => void; queue: Waiting[]; onAssign: (pid: string, cid: string) => void }) {
  const desk = useDesk();
  const elapsed = chair ? clock - chair.since : 0;
  return (
    <Sheet
      open={!!chair}
      onOpenChange={(o) => !o && onClose()}
      eyebrow={chair ? `${chair.name} · ${chair.room}` : ""}
      title={chair ? (chair.patient ?? (chair.state === "steril" ? "Sterilising" : "Free chair")) : ""}
      sub={chair?.proc ? `${chair.proc} · ${chair.doc ? DOCTORS[chair.doc].name : ""}` : chair?.state === "free" ? "Pick who goes in next" : "Autoclave cycle in progress"}
      footer={
        chair && chair.state !== "free" ? (
          <>
            {chair.patient && (
              <Btn
                icon={MessageCircle}
                onClick={() => {
                  toast.success("Family updated on WhatsApp", { description: `${chair.patient}: about ${Math.max(5, chair.planMin - Math.floor(elapsed / 60))} min more` });
                  desk.log(`Waiting family of ${chair.patient} updated`);
                }}
              >
                Update family
              </Btn>
            )}
            <Btn variant="solid" icon={Check} onClick={() => onAdvance(chair)}>
              {chair.state === "prep" ? "Patient seated" : chair.state === "in" ? "Finish & bill" : "Mark ready"}
            </Btn>
          </>
        ) : undefined
      }
    >
      {chair && chair.state !== "free" && (
        <div className="space-y-5">
          <KV
            items={[
              { k: "Elapsed", v: <span className="font-mono">{mmss(elapsed)}</span> },
              { k: "Planned", v: `${chair.planMin} min` },
              { k: "State", v: <Pill tone={stateMeta[chair.state].tone}>{stateMeta[chair.state].label}</Pill> },
              { k: "Fee", v: chair.fee ? inr(chair.fee) : "—" },
            ]}
          />
          <Meter value={elapsed} max={chair.planMin * 60} tone={elapsed > chair.planMin * 60 ? "late" : stateMeta[chair.state].tone} />
          {chair.flags && chair.flags.length > 0 && (
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Medical flags</p>
              <div className="flex flex-wrap gap-1.5">
                {chair.flags.map((f) => (
                  <Pill key={f} tone="warn">
                    {f}
                  </Pill>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="mb-2 text-[12px] font-medium text-d-mute">{chair.state === "steril" ? "Cycle checklist" : "Chair checklist"}</p>
            <Checklist
              items={(chair.state === "steril"
                ? ["Instruments bagged and dated", "Autoclave 134°C, 18 min", "Surfaces wiped with Bacillol", "Suction line flushed"]
                : ["Consent signed", "Medical history read", "RVG taken", "Anaesthesia given"]
              ).map((l, i) => ({ id: l, label: l, done: i < 2 }))}
              onToggle={(id) => desk.log(`${chair.name}: ${id} ticked`)}
            />
          </div>
        </div>
      )}
      {chair && chair.state === "free" && (
        <ul className="space-y-2">
          {queue.map((w) => (
            <li key={w.id} className="flex items-center gap-3 rounded-[12px] border border-d-line p-3">
              <Avatar name={w.name} size={32} tone={DOCTORS[w.doc].tone} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-semibold">{w.name}</p>
                <p className="truncate text-[12px] text-d-mute">
                  {w.proc} · {DOCTORS[w.doc].short}
                </p>
              </div>
              <Btn size="sm" variant="solid" onClick={() => onAssign(w.id, chair.id)}>
                Seat here
              </Btn>
            </li>
          ))}
          {queue.length === 0 && <p className="py-8 text-center text-[13px] text-d-mute">Nobody is waiting.</p>}
        </ul>
      )}
    </Sheet>
  );
}

function WalkInModal({ open, onOpenChange, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (w: Waiting) => void }) {
  const [name, setName] = React.useState("Rohit Gawde");
  const [age, setAge] = React.useState("36");
  const [proc, setProc] = React.useState("Walk-in: broken tooth");
  const [doc, setDoc] = React.useState<DocId>("rohan");
  const [pain, setPain] = React.useState(false);
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Add a walk-in" sub="They join the waiting room and Chair Router suggests a chair.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onAdd({ id: `W-${name.replace(/\s/g, "")}-${age}`, name, age: Number(age) || 30, proc, doc, appt: "walk-in", arrived: "now", waitBase: 0, mins: 20, fee: 500, flags: pain ? ["Pain", "First visit"] : ["First visit"], priority: pain });
          onOpenChange(false);
        }}
      >
        <div className="grid grid-cols-[1fr_90px] gap-3">
          <Field label="Patient name">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Age">
            <input className={inputClass} inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value.replace(/\D/g, ""))} />
          </Field>
        </div>
        <Field label="Complaint">
          <input className={inputClass} value={proc} onChange={(e) => setProc(e.target.value)} />
        </Field>
        <Field label="Doctor">
          <select className={inputClass} value={doc} onChange={(e) => setDoc(e.target.value as DocId)}>
            {DOC_IDS.map((d) => (
              <option key={d} value={d}>
                {DOCTORS[d].name}
              </option>
            ))}
          </select>
        </Field>
        <label className="flex items-center gap-2 text-[13px]">
          <input type="checkbox" checked={pain} onChange={(e) => setPain(e.target.checked)} className="h-4 w-4 accent-[var(--d-accent)]" /> In pain, put them first
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Btn onClick={() => onOpenChange(false)}>Cancel</Btn>
          <Btn variant="solid" type="submit" icon={Plus}>
            Add to waiting room
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ============================================================
   Schedule
   ============================================================ */

const DAY_START = 9;
const DAY_END = 21;
const SESSIONS: [number, number][] = [
  [9.5, 14],
  [16, 21],
];

function gapsFor(list: Appt[], doc: DocId) {
  const mine = list.filter((a) => a.doc === doc && a.status !== "No-show").sort((a, b) => a.start - b.start);
  const out: { from: number; to: number }[] = [];
  for (const [s, e] of SESSIONS) {
    let cur = s;
    for (const a of mine.filter((x) => x.start >= s && x.start < e)) {
      if (a.start - cur >= 0.75) out.push({ from: cur, to: a.start });
      cur = Math.max(cur, a.start + a.dur);
    }
    if (e - cur >= 0.75) out.push({ from: cur, to: e });
  }
  return out;
}

function ScheduleTab() {
  const desk = useDesk();
  const now = useNow(30000);
  const [appts, setAppts] = React.useState(seedAppts);
  const [open, setOpen] = React.useState<string | null>(null);
  const [booking, setBooking] = React.useState<{ doc: DocId; at: number } | null>(null);
  const appt = appts.find((a) => a.id === open) ?? null;
  const nowAt = now ? istParts(now).decimal : null;
  const pct = (h: number) => `${((h - DAY_START) / (DAY_END - DAY_START)) * 100}%`;
  const gapHours = DOC_IDS.reduce((a, d) => a + gapsFor(appts, d).filter((g) => g.from >= 16).reduce((s, g) => s + g.to - g.from, 0), 0);

  function update(id: string, patch: Partial<Appt>, msg: string) {
    setAppts((cur) => cur.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    toast.success(msg);
    desk.log(msg);
  }

  const ganttRows: GanttRow[] = ["C1", "C2", "C3", "C4", "C5"].map((c) => {
    const list = appts.filter((a) => a.chair === c && a.status !== "No-show");
    return {
      id: c,
      title: `Chair ${c.slice(1)}`,
      sub: `${list.length} visits · ${Math.round(list.reduce((s, a) => s + a.dur, 0) * 10) / 10} h booked`,
      bars: list.map((a) => ({ from: a.start - DAY_START, to: a.start - DAY_START + a.dur, tone: DOCTORS[a.doc].tone, dashed: a.status === "Booked" })),
    };
  });

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Appointments today" value={appts.length} delta="+3" hint="vs last Tuesday" icon={CalendarDays} trend={[31, 34, 29, 36, 38, 33, 40, appts.length]} />
        <Stat label="Confirmed on WhatsApp" value={appts.filter((a) => a.status === "Confirmed" || a.status === "Done" || a.status === "In chair" || a.status === "Waiting").length} hint="Reminder Bot, 7 PM yesterday" icon={MessageCircle} tone="ok" />
        <Stat label="No-shows" value={appts.filter((a) => a.status === "No-show").length} delta="-1" deltaGood={false} hint={`${inr(appts.filter((a) => a.status === "No-show").reduce((s, a) => s + a.fee, 0))} of chair time lost`} icon={AlarmClock} tone="late" />
        <Stat label="Open slots, 45 min+" value={DOC_IDS.reduce((a, d) => a + gapsFor(appts, d).length, 0)} hint={`${Math.round(gapHours * 10) / 10} h free this evening · click to book`} icon={CalendarPlus} tone="warn" />
      </div>

      <Panel
        title="Doctor timeline"
        sub="One lane per doctor. Click a visit for details; click a dashed gap to book into it."
        action={
          <Btn size="sm" variant="solid" icon={Plus} onClick={() => setBooking({ doc: "meera", at: 16 })}>
            Book appointment
          </Btn>
        }
      >
        <div className="desk-scroll -mx-5 overflow-x-auto px-5">
          <div className="min-w-[1180px]">
            <div className="flex pb-2">
              <div className="w-[190px] shrink-0" />
              <div className="relative h-5 flex-1">
                {Array.from({ length: DAY_END - DAY_START + 1 }, (_, i) => DAY_START + i).map((h) => (
                  <span key={h} className="absolute -translate-x-1/2 font-mono text-[10.5px] text-d-mute" style={{ left: pct(h) }}>
                    {h === 12 ? "12p" : h > 12 ? `${h - 12}p` : `${h}a`}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {DOC_IDS.map((d) => {
                const doc = DOCTORS[d];
                const list = appts.filter((a) => a.doc === d);
                const gaps = gapsFor(appts, d);
                return (
                  <div key={d} className="flex items-stretch">
                    <div className="flex w-[190px] shrink-0 items-center gap-2.5 pr-3">
                      <Avatar name={doc.name.replace("Dr. ", "")} size={34} tone={doc.tone} />
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold">{doc.short}</p>
                        <p className="truncate text-[11px] text-d-mute">{doc.spec}</p>
                      </div>
                    </div>
                    <div className="relative h-[64px] flex-1 rounded-[12px] bg-d-sunk/70">
                      <span className="absolute inset-y-0 rounded-[6px]" style={{ left: pct(14), width: `calc(${pct(16)} - ${pct(14)})`, background: "repeating-linear-gradient(135deg, color-mix(in oklab, var(--d-mute) 10%, transparent) 0 6px, transparent 6px 12px)" }} />
                      {gaps.map((g) => (
                        <button
                          key={`gap-${g.from}`}
                          type="button"
                          onClick={() => setBooking({ doc: d, at: g.from })}
                          className="absolute inset-y-2 flex items-center justify-center rounded-[8px] border border-dashed border-d-mute/50 text-[10.5px] text-d-mute transition-colors hover:border-d-accent hover:bg-d-soft hover:text-d-accent"
                          style={{ left: pct(g.from), width: `calc(${pct(g.to)} - ${pct(g.from)} - 3px)` }}
                        >
                          + {Math.round((g.to - g.from) * 60)}m free
                        </button>
                      ))}
                      {list.map((a) => {
                        const t = apptTone[a.status];
                        const solid = a.status === "In chair";
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => setOpen(a.id)}
                            title={`${a.patient} · ${a.proc}`}
                            className="desk-rise absolute inset-y-1.5 overflow-hidden rounded-[9px] border px-1.5 py-1 text-left transition-transform hover:z-10 hover:scale-[1.03]"
                            style={{
                              left: pct(a.start),
                              width: `calc(${pct(a.start + a.dur)} - ${pct(a.start)} - 3px)`,
                              borderColor: `color-mix(in oklab, ${toneVar(t)} 55%, transparent)`,
                              background: solid ? toneVar(t) : a.status === "No-show" ? "repeating-linear-gradient(135deg, color-mix(in oklab, var(--d-late) 14%, var(--d-panel)) 0 5px, var(--d-panel) 5px 10px)" : `color-mix(in oklab, ${toneVar(t)} 13%, var(--d-panel))`,
                              color: solid ? "var(--d-accent-ink)" : "var(--d-ink)",
                              opacity: a.status === "Done" ? 0.62 : 1,
                            }}
                          >
                            <span className="block truncate text-[11.5px] font-semibold leading-tight">{a.dur < 0.5 ? a.patient.split(" ")[0] : a.patient}</span>
                            <span className="block truncate text-[10.5px] leading-tight opacity-80">{a.proc}</span>
                          </button>
                        );
                      })}
                      {nowAt !== null && nowAt >= DAY_START && nowAt <= DAY_END && <span className="pointer-events-none absolute -inset-y-1 z-20 w-[2px] rounded-full bg-d-ink" style={{ left: pct(nowAt) }} />}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-4 pl-[190px] text-[11.5px] text-d-mute">
              {(Object.keys(apptTone) as ApptStatus[]).map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-4 rounded-[3px]" style={{ background: s === "In chair" ? toneVar(apptTone[s]) : `color-mix(in oklab, ${toneVar(apptTone[s])} 25%, var(--d-panel))` }} />
                  {s}
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-4 rounded-[3px] border border-dashed border-d-mute" /> bookable gap
              </span>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <Panel title="Chair occupancy" sub="The same day by chair, coloured by doctor. Dashed = booked, not yet confirmed.">
          <Gantt rows={ganttRows} days={DAY_END - DAY_START} labelWidth={170} ticks={[0, 2, 4, 6, 8, 10].map((o) => ({ at: o, label: fmtH(DAY_START + o).replace(":00", "") }))} today={nowAt !== null && nowAt >= DAY_START && nowAt <= DAY_END ? { at: nowAt - DAY_START, label: "Now" } : undefined} markers={[{ at: 5, label: "Lunch", tone: "neutral" }]} />
        </Panel>
        <Panel title="Visits by type" sub="Today, by revenue">
          <HBars
            format={(v) => inr(v, { compact: true })}
            data={[
              { label: "Implants", value: 46000, tone: "ok" },
              { label: "Crowns & bridges", value: 24500, tone: "accent" },
              { label: "Orthodontics", value: 29700, tone: "info" },
              { label: "Root canals", value: 21200, tone: "warn" },
              { label: "Cosmetic (18% GST)", value: 9500, tone: "late" },
              { label: "Scaling & consults", value: 7000, tone: "neutral" },
            ]}
          />
        </Panel>
      </div>

      <Panel title="All appointments" sub="Search, filter by status, send reminders in bulk">
        <DataTable
          rows={appts}
          rowKey={(a) => a.id}
          search={(a) => `${a.patient} ${a.proc} ${DOCTORS[a.doc].name}`}
          searchPlaceholder="Search patient, procedure or doctor"
          filter={{ get: (a) => a.status, options: ["In chair", "Waiting", "Confirmed", "Booked", "Done", "No-show"] }}
          onRow={(a) => setOpen(a.id)}
          bulk={[{ label: "Send WhatsApp reminder", run: (k) => { toast.success(`${k.length} reminders sent`); desk.log(`${k.length} appointment reminders sent on WhatsApp`); } }]}
          columns={[
            { key: "t", label: "Time", render: (a) => <span className="tnum font-mono text-[12px]">{fmtH(a.start)}</span>, sort: (a) => a.start },
            { key: "p", label: "Patient", render: (a) => <span className="font-medium">{a.patient}</span>, sort: (a) => a.patient },
            { key: "proc", label: "Procedure", render: (a) => <span className="text-d-mute">{a.proc}</span>, wide: true },
            { key: "d", label: "Doctor", render: (a) => <span style={{ color: toneVar(DOCTORS[a.doc].tone) }}>{DOCTORS[a.doc].short}</span>, sort: (a) => a.doc },
            { key: "c", label: "Chair", render: (a) => <span className="font-mono text-[12px]">{a.chair}</span> },
            { key: "f", label: "Fee", align: "right", render: (a) => <span className="tnum font-mono">{a.fee ? inr(a.fee) : "—"}</span>, sort: (a) => a.fee },
            { key: "s", label: "Status", render: (a) => <Pill tone={apptTone[a.status]}>{a.status}</Pill> },
          ]}
        />
      </Panel>

      <Sheet
        open={!!appt}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={appt ? `${appt.id} · ${fmtH(appt.start)} · Chair ${appt.chair.slice(1)}` : ""}
        title={appt?.patient ?? ""}
        sub={appt ? `${appt.proc} · ${DOCTORS[appt.doc].name}` : ""}
        footer={
          appt ? (
            <>
              <Btn icon={Clock} onClick={() => update(appt.id, { start: Math.min(20.5, appt.start + 0.5) }, `${appt.patient} pushed 30 min to ${fmtH(Math.min(20.5, appt.start + 0.5))}`)}>
                Push 30 min
              </Btn>
              <Btn variant="danger" onClick={() => update(appt.id, { status: "No-show" }, `${appt.patient} marked no-show`)}>
                No-show
              </Btn>
              <Btn variant="solid" icon={Check} onClick={() => update(appt.id, { status: appt.status === "Waiting" ? "In chair" : appt.status === "In chair" ? "Done" : "Waiting" }, `${appt.patient}: ${appt.status === "Waiting" ? "seated" : appt.status === "In chair" ? "visit done" : "arrived"}`)}>
                {appt.status === "Waiting" ? "Seat now" : appt.status === "In chair" ? "Mark done" : "Mark arrived"}
              </Btn>
            </>
          ) : undefined
        }
      >
        {appt && (
          <div className="space-y-5">
            <KV
              items={[
                { k: "Starts", v: fmtH(appt.start) },
                { k: "Duration", v: `${Math.round(appt.dur * 60)} min` },
                { k: "Status", v: <Pill tone={apptTone[appt.status]}>{appt.status}</Pill> },
                { k: "Fee", v: appt.fee ? inr(appt.fee) : "No charge (plan visit)" },
                { k: "Phone", v: <span className="font-mono">{appt.phone}</span> },
                { k: "Chair", v: `Chair ${appt.chair.slice(1)}` },
              ]}
            />
            <div className="rounded-[14px] bg-[#e7f6e9] p-4 text-[13px] leading-relaxed text-[#1d3b22]">
              Namaskar {appt.patient.split(" ")[0]}, a reminder of your visit at Nilgiri Dental Studio, Karve Road, at {fmtH(appt.start)} with {DOCTORS[appt.doc].short} for {appt.proc.toLowerCase()}. Reply 1 to confirm, 2 to reschedule.
            </div>
            <Btn
              icon={Phone}
              onClick={() => {
                toast.success(`Calling ${appt.patient}`, { description: appt.phone });
                desk.log(`Front desk called ${appt.patient}`);
              }}
            >
              Call {appt.phone}
            </Btn>
          </div>
        )}
      </Sheet>
      <BookModal
        slot={booking}
        onClose={() => setBooking(null)}
        onBook={(a) => {
          setAppts((cur) => [...cur, a]);
          toast.success(`Booked ${a.patient} at ${fmtH(a.start)}`, { description: `${DOCTORS[a.doc].short} · ${a.proc} · confirmation sent on WhatsApp` });
          desk.log(`Booked ${a.patient} with ${DOCTORS[a.doc].short} at ${fmtH(a.start)}`, "ok");
        }}
      />
    </div>
  );
}

function BookModal({ slot, onClose, onBook }: { slot: { doc: DocId; at: number } | null; onClose: () => void; onBook: (a: Appt) => void }) {
  return (
    <Modal open={!!slot} onOpenChange={(o) => !o && onClose()} title="Book appointment" sub="A WhatsApp confirmation goes to the patient as soon as you book.">
      {slot && <BookForm key={`${slot.doc}-${slot.at}`} slot={slot} onClose={onClose} onBook={onBook} />}
    </Modal>
  );
}

function BookForm({ slot, onClose, onBook }: { slot: { doc: DocId; at: number }; onClose: () => void; onBook: (a: Appt) => void }) {
  const [doc, setDoc] = React.useState<DocId>(slot.doc);
  const [patient, setPatient] = React.useState("Kaustubh Paranjpe");
  const [proc, setProc] = React.useState(PROC_MENU[1].label);
  const [at, setAt] = React.useState(String(slot.at));
  const item = PROC_MENU.find((p) => p.label === proc) ?? PROC_MENU[0];
  const times = Array.from({ length: 22 }, (_, i) => 9.5 + i * 0.5).filter((t) => t < 14 || t >= 16);
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onBook({ id: `A${patient.length}${at.replace(".", "")}${doc}`, doc, patient, proc, start: Number(at), dur: item.dur, chair: DOCTORS[doc].chair, status: "Booked", fee: item.fee, phone: "98220 11045" });
        onClose();
      }}
    >
      <Field label="Patient">
        <input className={inputClass} value={patient} onChange={(e) => setPatient(e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Doctor">
          <select className={inputClass} value={doc} onChange={(e) => setDoc(e.target.value as DocId)}>
            {DOC_IDS.map((d) => (
              <option key={d} value={d}>
                {DOCTORS[d].short}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Time">
          <select className={inputClass} value={at} onChange={(e) => setAt(e.target.value)}>
            {times.map((t) => (
              <option key={t} value={String(t)}>
                {fmtH(t)}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Procedure">
        <select className={inputClass} value={proc} onChange={(e) => setProc(e.target.value)}>
          {PROC_MENU.map((p) => (
            <option key={p.label}>{p.label}</option>
          ))}
        </select>
      </Field>
      <p className="text-[12.5px] text-d-mute">
        {Math.round(item.dur * 60)} min · {item.fee ? inr(item.fee) : "no charge"} · Chair {DOCTORS[doc].chair.slice(1)}
      </p>
      <div className="flex justify-end gap-2 pt-2">
        <Btn onClick={onClose}>Cancel</Btn>
        <Btn variant="solid" type="submit" icon={CalendarPlus}>
          Book and confirm
        </Btn>
      </div>
    </form>
  );
}

/* ============================================================
   Patients & tooth chart
   ============================================================ */

const TW: Record<number, number> = { 1: 8.6, 2: 6.8, 3: 7.6, 4: 7, 5: 7, 6: 10, 7: 9.4, 8: 8.8 };
function archLayout(teeth: number[], upper: boolean) {
  const w = teeth.map((t) => TW[t % 10]);
  const total = w.reduce((a, b) => a + b, 0);
  const starts = w.map((_, i) => w.slice(0, i).reduce((a, b) => a + b, 0));
  return teeth.map((t, i) => {
    const mid = (starts[i] + w[i] / 2) / total;
    const deg = 196 - mid * 212;
    const rad = (deg * Math.PI) / 180;
    const x = 220 + 178 * trig.cos(rad);
    const y = upper ? 172 - 118 * trig.sin(rad) : 290 + 118 * trig.sin(rad);
    const rot = upper ? 90 - deg : deg - 90;
    const lx = 220 + 208 * trig.cos(rad);
    const ly = upper ? 172 - 146 * trig.sin(rad) : 290 + 146 * trig.sin(rad);
    return { t, x, y, r: w[i] * 1.55, rot, lx, ly };
  });
}
const UPPER = archLayout([18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28], true);
const LOWER = archLayout([48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38], false);

function ToothChart({ p, tool, onTooth }: { p: Patient; tool: Proc | "clear"; onTooth: (t: number) => void }) {
  const [hover, setHover] = React.useState<number | null>(null);
  return (
    <div className="relative">
      <svg viewBox="0 0 440 462" className="mx-auto w-full max-w-[500px]">
        <text x="220" y="222" textAnchor="middle" fontSize="11" letterSpacing="3" fill="var(--d-mute)" fontFamily="var(--font-mono)">
          UPPER
        </text>
        <text x="220" y="246" textAnchor="middle" fontSize="11" letterSpacing="3" fill="var(--d-mute)" fontFamily="var(--font-mono)">
          LOWER
        </text>
        <text x="10" y="236" fontSize="10" fill="var(--d-mute)">
          R
        </text>
        <text x="424" y="236" fontSize="10" fill="var(--d-mute)">
          L
        </text>
        <line x1="220" y1="40" x2="220" y2="422" stroke="var(--d-line)" strokeDasharray="3 5" />
        {[...UPPER, ...LOWER].map((tooth) => {
          const m = p.marks[tooth.t];
          const missing = p.missing.includes(tooth.t) && m !== "implant";
          const fill = m ? PROCS[m].color : "var(--d-panel)";
          const on = hover === tooth.t;
          return (
            <g
              key={tooth.t}
              transform={`translate(${tooth.x} ${tooth.y}) rotate(${tooth.rot})`}
              onClick={() => onTooth(tooth.t)}
              onPointerEnter={() => setHover(tooth.t)}
              onPointerLeave={() => setHover(null)}
              className="cursor-pointer"
            >
              <rect
                x={-tooth.r}
                y={-tooth.r * 0.95}
                width={tooth.r * 2}
                height={tooth.r * 1.9}
                rx={tooth.r * 0.62}
                fill={missing ? "transparent" : fill}
                fillOpacity={m ? 0.92 : 1}
                stroke={on ? "var(--d-accent)" : m ? fill : "color-mix(in oklab, var(--d-ink) 35%, transparent)"}
                strokeWidth={on ? 2.6 : 1.4}
                strokeDasharray={missing ? "3 3" : undefined}
                style={{ transition: "fill 200ms" }}
              />
              {!m && !missing && tooth.t % 10 >= 6 && <path d={`M${-tooth.r * 0.45} 0 H${tooth.r * 0.45} M0 ${-tooth.r * 0.45} V${tooth.r * 0.45}`} stroke="color-mix(in oklab, var(--d-ink) 18%, transparent)" strokeWidth="1.2" />}
              {m && (
                <text y="4" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" transform={`rotate(${-tooth.rot})`}>
                  {PROCS[m].short}
                </text>
              )}
            </g>
          );
        })}
        {[...UPPER, ...LOWER].map((tooth) => (
          <text key={`l${tooth.t}`} x={tooth.lx} y={tooth.ly + 3.5} textAnchor="middle" fontSize="9.5" fontFamily="var(--font-mono)" fill={hover === tooth.t ? "var(--d-accent)" : "var(--d-mute)"} fontWeight={hover === tooth.t ? 700 : 400}>
            {tooth.t}
          </text>
        ))}
      </svg>
      <div className="pointer-events-none absolute left-1/2 top-[57%] -translate-x-1/2 text-center">
        {hover ? (
          <p className="rounded-full bg-d-ink px-2.5 py-1 font-mono text-[11px] text-d-paper">
            #{hover} · {p.marks[hover] ? PROCS[p.marks[hover]].label : p.missing.includes(hover) ? "missing" : "healthy"} · tap to {tool === "clear" ? "clear" : PROCS[tool].label.toLowerCase()}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function PatientsTab() {
  const desk = useDesk();
  const [patients, setPatients] = React.useState(seedPatients);
  const [sel, setSel] = React.useState(seedPatients[4].id);
  const [tool, setTool] = React.useState<Proc | "clear">("crown");
  const [q, setQ] = React.useState("");
  const [sheet, setSheet] = React.useState<string | null>(null);
  const p = patients.find((x) => x.id === sel) ?? patients[0];
  const sp = patients.find((x) => x.id === sheet) ?? null;
  const list = patients.filter((x) => `${x.name} ${x.id} ${x.area}`.toLowerCase().includes(q.toLowerCase()));
  const value = planValue(p);
  const items = PROC_IDS.map((k) => ({ k, teeth: Object.entries(p.marks).filter(([, v]) => v === k).map(([t]) => Number(t)) })).filter((x) => x.teeth.length);
  const cover = p.insurer ? Math.round(value * 0.3) : 0;
  const proposed = patients.filter((x) => x.stage === "Proposed");

  function patch(id: string, fn: (x: Patient) => Patient) {
    setPatients((cur) => cur.map((x) => (x.id === id ? fn(x) : x)));
  }
  function onTooth(t: number) {
    patch(p.id, (x) => {
      const marks = { ...x.marks };
      if (tool === "clear" || marks[t] === tool) delete marks[t];
      else marks[t] = tool;
      return { ...x, marks };
    });
    desk.log(`${p.name}: #${t} ${tool === "clear" || p.marks[t] === tool ? "cleared" : `planned for ${PROCS[tool as Proc].label.toLowerCase()}`}`);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Active treatment plans" value={patients.filter((x) => x.stage !== "Completed").length} hint="14 patients charted" icon={ClipboardList} trend={[8, 9, 9, 10, 11, 11, 12, 12]} />
        <Stat label="Proposed, not accepted" value={inr(proposed.reduce((a, x) => a + planValue(x), 0), { compact: true })} delta="+₹48k" deltaGood={false} hint={`${proposed.length} plans waiting`} icon={Hourglass} tone="warn" />
        <Stat label="Plan acceptance" value="68%" delta="+9%" hint="since WhatsApp estimates" icon={Check} tone="ok" trend={[52, 55, 58, 57, 61, 64, 66, 68]} />
        <Stat label="Unpaid on running plans" value={inr(patients.filter((x) => x.stage !== "Proposed").reduce((a, x) => a + Math.max(0, planValue(x) - x.paid), 0), { compact: true })} hint="collect at each sitting" icon={BadgeIndianRupee} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)_330px]">
        <Panel title="Patients" sub="Today's chairs first" bodyClassName="p-5 pt-3">
          <SearchBox value={q} onChange={setQ} placeholder="Name, ID or area" className="mb-3" />
          <ul className="desk-scroll max-h-[520px] space-y-1 overflow-y-auto pr-1">
            {list.map((x) => (
              <li key={x.id}>
                <button type="button" onClick={() => setSel(x.id)} className="flex w-full items-center gap-2.5 rounded-[10px] px-2 py-2 text-left transition-colors" style={{ background: x.id === p.id ? "var(--d-soft)" : undefined }}>
                  <Avatar name={x.name.replace("Col. ", "")} size={30} tone={DOCTORS[x.doc].tone} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold">{x.name}</span>
                    <span className="block truncate text-[11px] text-d-mute">
                      {x.id} · {x.area}
                    </span>
                  </span>
                  <Pill tone={stageTone[x.stage]}>{x.stage === "In progress" ? "Active" : x.stage}</Pill>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title={`${p.name}, ${p.age}${p.sex}`}
          sub={`${p.id} · ${p.complaint}`}
          action={<Pill tone={stageTone[p.stage]}>{p.stage}</Pill>}
        >
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            {PROC_IDS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setTool(k)}
                className="inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[12px] font-medium transition-colors"
                style={{ borderColor: tool === k ? PROCS[k].color : "var(--d-line)", background: tool === k ? `color-mix(in oklab, ${PROCS[k].color} 14%, var(--d-panel))` : "var(--d-panel)" }}
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-[5px] text-[9px] font-bold text-white" style={{ background: PROCS[k].color }}>
                  {PROCS[k].short}
                </span>
                {PROCS[k].label}
              </button>
            ))}
            <button type="button" onClick={() => setTool("clear")} className="inline-flex h-8 items-center rounded-full border px-2.5 text-[12px] font-medium" style={{ borderColor: tool === "clear" ? "var(--d-ink)" : "var(--d-line)" }}>
              Eraser
            </button>
          </div>
          <ToothChart p={p} tool={tool} onTooth={onTooth} />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[12px] text-d-mute">
            <span>FDI numbering · dashed = missing tooth</span>
            <label className="inline-flex items-center gap-2 text-d-ink">
              <input
                type="checkbox"
                checked={p.scaling}
                onChange={() => {
                  patch(p.id, (x) => ({ ...x, scaling: !x.scaling }));
                  desk.log(`${p.name}: scaling ${p.scaling ? "removed" : "added"}`);
                }}
                className="h-4 w-4 accent-[var(--d-accent)]"
              />
              Full-mouth scaling {inr(SCALING_FEE)}
            </label>
          </div>
        </Panel>

        <Panel icon={ClipboardList} title="Estimate" sub={`${DOCTORS[p.doc].name}${p.insurer ? ` · ${p.insurer}` : ""}`}>
          <ul className="space-y-2">
            {items.map((it) => (
              <li key={it.k} className="flex items-start justify-between gap-3 text-[13px]">
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: PROCS[it.k].color }} />
                    {PROCS[it.k].label} × {it.teeth.length}
                  </span>
                  <span className="block font-mono text-[11px] text-d-mute">#{it.teeth.join(", #")}</span>
                </span>
                <span className="tnum shrink-0 font-mono">{inr(PROCS[it.k].fee * it.teeth.length)}</span>
              </li>
            ))}
            {p.scaling && (
              <li className="flex justify-between text-[13px]">
                <span className="font-medium">Scaling & polishing</span>
                <span className="tnum font-mono">{inr(SCALING_FEE)}</span>
              </li>
            )}
            {items.length === 0 && !p.scaling && <li className="py-4 text-center text-[12.5px] text-d-mute">Tap teeth to start a plan.</li>}
          </ul>
          <div className="mt-4 space-y-1.5 border-t border-d-line pt-3 text-[13px]">
            <p className="flex justify-between">
              <span className="text-d-mute">Plan total</span>
              <span className="tnum font-mono font-semibold">{inr(value)}</span>
            </p>
            {cover > 0 && (
              <p className="flex justify-between">
                <span className="text-d-mute">Likely insurance cover</span>
                <span className="tnum font-mono text-d-ok">− {inr(cover)}</span>
              </p>
            )}
            <p className="flex justify-between">
              <span className="text-d-mute">Paid so far</span>
              <span className="tnum font-mono">− {inr(p.paid)}</span>
            </p>
            <p className="flex justify-between text-[15px] font-semibold">
              <span>Patient pays</span>
              <span className="tnum font-mono">{inr(Math.max(0, value - cover - p.paid))}</span>
            </p>
          </div>
          {p.medical.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.medical.map((m) => (
                <Pill key={m} tone="warn">
                  {m}
                </Pill>
              ))}
            </div>
          )}
          <div className="mt-4 grid gap-2">
            <Btn
              variant="solid"
              icon={Send}
              onClick={() => {
                toast.success(`Estimate sent to ${p.name}`, { description: `${inr(value)} on WhatsApp, with a Razorpay link for the advance` });
                desk.log(`WhatsApp estimate ${inr(value)} sent to ${p.name}`, "info");
              }}
            >
              Send estimate on WhatsApp
            </Btn>
            {p.stage === "Proposed" && (
              <Btn
                icon={Check}
                onClick={() => {
                  patch(p.id, (x) => ({ ...x, stage: "Accepted" }));
                  toast.success(`${p.name} accepted the plan`, { description: `${inr(value)} · first sitting can be booked` });
                  desk.log(`${p.name} accepted a ${inr(value)} plan`, "ok");
                }}
              >
                Mark plan accepted
              </Btn>
            )}
          </div>
        </Panel>
      </div>

      <Panel title="Treatment plans" sub="Every charted patient. Click a row for visits and payments.">
        <DataTable
          rows={patients}
          rowKey={(x) => x.id}
          search={(x) => `${x.name} ${x.id} ${x.area} ${x.complaint}`}
          searchPlaceholder="Search patients"
          filter={{ get: (x) => x.stage, options: ["Proposed", "Accepted", "In progress", "Completed"] }}
          onRow={(x) => setSheet(x.id)}
          bulk={[{ label: "Send plan reminders", run: (k) => { toast.success(`${k.length} plan reminders sent`); desk.log(`${k.length} treatment plan reminders sent`); } }]}
          columns={[
            { key: "id", label: "ID", render: (x) => <span className="font-mono text-[12px]">{x.id}</span> },
            { key: "n", label: "Patient", render: (x) => <span className="font-medium">{x.name}</span>, sort: (x) => x.name },
            { key: "d", label: "Doctor", render: (x) => <span style={{ color: toneVar(DOCTORS[x.doc].tone) }}>{DOCTORS[x.doc].short}</span>, wide: true },
            { key: "teeth", label: "Teeth", render: (x) => <span className="font-mono text-[12px] text-d-mute">{Object.keys(x.marks).length || "—"}</span>, sort: (x) => Object.keys(x.marks).length },
            { key: "v", label: "Plan", align: "right", render: (x) => <span className="tnum font-mono">{inr(planValue(x))}</span>, sort: (x) => planValue(x) },
            {
              key: "paid",
              label: "Paid",
              render: (x) => (
                <div className="flex min-w-[110px] items-center gap-2">
                  <Meter value={x.paid} max={planValue(x) || 1} tone={x.paid >= planValue(x) ? "ok" : "accent"} />
                  <span className="font-mono text-[11px] text-d-mute">{Math.round((x.paid / (planValue(x) || 1)) * 100)}%</span>
                </div>
              ),
              sort: (x) => x.paid / (planValue(x) || 1),
            },
            { key: "next", label: "Next", render: (x) => <span className="text-[12.5px]">{x.next}</span>, wide: true },
            { key: "s", label: "Stage", render: (x) => <Pill tone={stageTone[x.stage]}>{x.stage}</Pill> },
          ]}
        />
      </Panel>

      <Sheet
        open={!!sp}
        onOpenChange={(o) => !o && setSheet(null)}
        eyebrow={sp ? `${sp.id} · ${sp.area} · ${sp.phone}` : ""}
        title={sp?.name ?? ""}
        sub={sp ? `${sp.complaint} · ${DOCTORS[sp.doc].name}` : ""}
        footer={
          sp ? (
            <>
              <Btn
                onClick={() => {
                  setSel(sp.id);
                  setSheet(null);
                }}
              >
                Open tooth chart
              </Btn>
              <Btn
                variant="solid"
                onClick={() => {
                  const next: PlanStage = sp.stage === "Proposed" ? "Accepted" : sp.stage === "Accepted" ? "In progress" : "Completed";
                  patch(sp.id, (x) => ({ ...x, stage: next }));
                  toast.success(`${sp.name}: ${next}`);
                  desk.log(`${sp.name} plan moved to ${next}`);
                }}
              >
                {sp.stage === "Completed" ? "Completed" : `Move to ${sp.stage === "Proposed" ? "Accepted" : sp.stage === "Accepted" ? "In progress" : "Completed"}`}
              </Btn>
            </>
          ) : undefined
        }
      >
        {sp && (
          <div className="space-y-5">
            <KV
              items={[
                { k: "Plan value", v: inr(planValue(sp)) },
                { k: "Paid", v: inr(sp.paid) },
                { k: "Insurance", v: sp.insurer ?? "Self-pay" },
                { k: "Next visit", v: sp.next },
              ]}
            />
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Planned work</p>
              <ul className="space-y-1.5">
                {Object.entries(sp.marks).map(([t, m]) => (
                  <li key={t} className="flex items-center justify-between rounded-[10px] border border-d-line px-3 py-2 text-[13px]">
                    <span className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-[6px] text-[10px] font-bold text-white" style={{ background: PROCS[m].color }}>
                        {PROCS[m].short}
                      </span>
                      #{t} · {PROCS[m].label}
                    </span>
                    <span className="tnum font-mono text-[12px]">{inr(PROCS[m].fee)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Medical history</p>
              <div className="flex flex-wrap gap-1.5">{sp.medical.length ? sp.medical.map((m) => <Pill key={m} tone="warn">{m}</Pill>) : <span className="text-[13px] text-d-mute">Nothing significant</span>}</div>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ============================================================
   Lab work
   ============================================================ */

function LabTab({ labs, setLabs }: { labs: LabCase[]; setLabs: React.Dispatch<React.SetStateAction<LabCase[]>> }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<string | null>(null);
  const [labFilter, setLabFilter] = React.useState("All labs");
  const lab = labs.find((l) => l.id === open) ?? null;
  const shown = labs.filter((l) => labFilter === "All labs" || l.lab.startsWith(labFilter));
  const order = LAB_COLS.map((c) => c.id);

  function move(id: string, stage: LabStage) {
    const l = labs.find((x) => x.id === id);
    if (!l || l.stage === stage) return;
    setLabs((cur) => cur.map((x) => (x.id === id ? { ...x, stage } : x)));
    const label = LAB_COLS.find((c) => c.id === stage)?.label ?? stage;
    toast.success(`${l.work} → ${label}`, { description: stage === "ready" ? `Lab Tracker will book ${l.patient}'s fit` : l.lab });
    desk.log(`${l.patient}: ${l.work} moved to ${label}`, stage === "fitted" ? "ok" : "info");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Cases at labs" value={labs.filter((l) => l.stage === "atlab" || l.stage === "impression").length} hint="across 4 labs" icon={FlaskConical} trend={[5, 6, 7, 6, 8, 7, 8, 8]} />
        <Stat label="Back, fit not booked" value={labs.filter((l) => l.stage === "ready").length} hint="patients waiting to hear" icon={Hourglass} tone="warn" />
        <Stat label="Remakes this quarter" value="3" delta="-2" deltaGood={false} hint="4.1% of 73 units" icon={Repeat} tone="late" />
        <Stat label="Lab spend, October" value={inr(labs.reduce((a, l) => a + l.cost, 0), { compact: true })} delta="+6%" deltaGood={false} hint="aligners are 45% of it" icon={IndianRupee} trend={[0.8, 0.9, 1.1, 0.95, 1.2, 1.3, 1.1, 1.38]} />
      </div>
      <Panel title="Lab board" sub="Drag a case to move it. Click it for shade, due date and the lab chat." action={<Segmented size="sm" options={["All labs", "Ivory", "Precision", "Smilecraft", "Deccan"]} value={labFilter} onChange={setLabFilter} />}>
        <Board
          columns={LAB_COLS.map((c) => ({ id: c.id, label: c.label, tone: c.tone, hint: c.hint }))}
          items={shown}
          itemKey={(l) => l.id}
          getColumn={(l) => l.stage}
          onMove={(k, col) => move(k, col as LabStage)}
          minColumnWidth={220}
          renderCard={(l) => (
            <button type="button" onClick={() => setOpen(l.id)} className="block w-full text-left">
              <p className="flex items-center justify-between gap-2 pr-3 font-mono text-[10.5px] text-d-mute">
                {l.id}
                {l.remake && <Pill tone="late">remake</Pill>}
              </p>
              <p className="mt-0.5 text-[13px] font-semibold leading-snug">{l.work}</p>
              <p className="truncate text-[12px] text-d-mute">{l.patient}</p>
              <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="truncate text-d-mute">{l.lab.split(",")[0]}</span>
                {l.shade && <Pill tone="neutral">{l.shade}</Pill>}
              </p>
              {(l.stage === "atlab" || l.stage === "trial" || l.stage === "impression") && (
                <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-d-sunk px-2 py-0.5 text-[11px] font-medium" style={{ color: l.dueH < 12 ? "var(--d-warn)" : undefined }}>
                  <Timer className="h-3 w-3" /> due <Countdown compact inHours={l.dueH} />
                </p>
              )}
            </button>
          )}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.15fr]">
        <Panel title="Lab turnaround" sub="Average days, scan to back at the clinic (last 90 days)">
          <HBars
            format={(v) => `${v} d`}
            data={[
              { label: "Ivory Dental Lab", sub: "crowns, e-max", value: 4.2, tone: "ok" },
              { label: "Precision Ceramics", sub: "PFM, implant crowns", value: 6.8, tone: "warn" },
              { label: "Deccan Denture Works", sub: "dentures", value: 9.5, tone: "info" },
              { label: "Smilecraft Aligners", sub: "aligners, retainers", value: 14, tone: "accent" },
            ]}
          />
        </Panel>
        <Panel icon={IndianRupee} title="Lab bills to approve" sub="Matched to cases; approved bills post to Tally">
          <ApprovalQueue
            items={[
              { id: "LBB-221", title: "Ivory Dental Lab · Oct week 3", sub: "4 crowns, 1 e-max · matched to 5 cases", amount: inr(19200), meta: "5 units" },
              { id: "LBB-219", title: "Smilecraft Aligners · Kabir Sethi", sub: "18 trays · 50% advance", amount: inr(19000), meta: "advance", tone: "info" },
              { id: "LBB-216", title: "Precision Ceramics · remake", sub: "Harish bridge shade remake, lab says no charge", amount: inr(0), meta: "check", tone: "late" },
            ]}
            onDecide={(id, d) => d && desk.log(`Lab bill ${id} ${d}`)}
          />
        </Panel>
      </div>
      <Sheet
        open={!!lab}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={lab ? `${lab.id} · sent ${lab.sent}` : ""}
        title={lab?.work ?? ""}
        sub={lab ? `${lab.patient} · ${DOCTORS[lab.doc].name}` : ""}
        footer={
          lab ? (
            <>
              <Btn
                icon={MessageCircle}
                onClick={() => {
                  toast.success(`Asked ${lab.lab.split(",")[0]} for status`, { description: "Reply lands in the lab WhatsApp group" });
                  desk.log(`Lab Tracker pinged ${lab.lab.split(",")[0]} about ${lab.id}`);
                }}
              >
                Ask the lab
              </Btn>
              {lab.stage !== "fitted" && (
                <Btn
                  variant="solid"
                  icon={ArrowRight}
                  onClick={() => {
                    move(lab.id, order[order.indexOf(lab.stage) + 1]);
                    setOpen(null);
                  }}
                >
                  Next: {LAB_COLS[order.indexOf(lab.stage) + 1]?.label}
                </Btn>
              )}
            </>
          ) : undefined
        }
      >
        {lab && (
          <div className="space-y-5">
            <KV items={[{ k: "Lab", v: lab.lab }, { k: "Shade", v: lab.shade ?? "—" }, { k: "Lab cost", v: inr(lab.cost) }, { k: "Stage", v: LAB_COLS.find((c) => c.id === lab.stage)?.label }]} />
            <ol className="space-y-2">
              {LAB_COLS.map((c, i) => {
                const idx = order.indexOf(lab.stage);
                return (
                  <li key={c.id} className="flex items-center gap-3 text-[13px]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-bold" style={{ borderColor: i <= idx ? "var(--d-accent)" : "var(--d-line)", background: i < idx ? "var(--d-accent)" : "var(--d-panel)", color: i < idx ? "var(--d-accent-ink)" : "var(--d-ink)" }}>
                      {i < idx ? <Check className="h-3 w-3" /> : i + 1}
                    </span>
                    <span className={i === idx ? "font-semibold" : "text-d-mute"}>{c.label}</span>
                  </li>
                );
              })}
            </ol>
            <Btn
              variant="soft"
              icon={Repeat}
              onClick={() => {
                setLabs((cur) => cur.map((x) => (x.id === lab.id ? { ...x, remake: true, stage: "atlab", dueH: 72 } : x)));
                toast(`Remake logged for ${lab.work}`, { description: "Back at the lab, due in 3 days" });
                desk.log(`Remake requested: ${lab.work}`, "late");
                setOpen(null);
              }}
            >
              Log a remake
            </Btn>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ============================================================
   Recalls
   ============================================================ */

const TEMPLATES: Record<RecallReason, Record<Recall["lang"], string>> = {
  "6-month cleaning": {
    English: "Hi {name}, it has been 6 months since your last cleaning at Nilgiri Dental Studio. Shall we book a 30-min slot this week? Reply with a day.",
    "मराठी": "नमस्कार {name}, तुमच्या शेवटच्या स्केलिंगला ६ महिने झाले. या आठवड्यात ३० मिनिटांची वेळ बुक करूया का? सोयीचा दिवस कळवा. – निलगिरी डेंटल स्टुडिओ",
    "हिंदी": "नमस्ते {name}, आपकी पिछली सफ़ाई को 6 महीने हो गए हैं। क्या इस हफ़्ते 30 मिनट का स्लॉट बुक करें? दिन बताइए। – नीलगिरी डेंटल स्टूडियो",
  },
  "Crown after RCT": {
    English: "Hi {name}, your root-canal tooth still needs its crown. Without it the tooth can crack. Dr. Aniket has slots on Thursday and Saturday.",
    "मराठी": "नमस्कार {name}, रूट कॅनाल झालेल्या दाताला अजून कॅप बसवायची आहे. कॅपशिवाय दात तुटू शकतो. डॉ. अनिकेत गुरुवार/शनिवारी उपलब्ध आहेत.",
    "हिंदी": "नमस्ते {name}, आपके रूट कैनाल वाले दांत पर अभी कैप लगनी बाकी है। बिना कैप दांत टूट सकता है। डॉ. अनिकेत गुरुवार/शनिवार उपलब्ध हैं।",
  },
  "Ortho monthly": {
    English: "Hi {name}, time for your monthly braces check with Dr. Sana. She is in on Tue, Thu and Sat.",
    "मराठी": "नमस्कार {name}, डॉ. सना यांच्याकडे मासिक ब्रेसेस तपासणीची वेळ झाली आहे. मंगळ, गुरु, शनि उपलब्ध.",
    "हिंदी": "नमस्ते {name}, डॉ. सना के साथ आपकी मासिक ब्रेसेस जाँच का समय हो गया है। मंगल, गुरु, शनि उपलब्ध।",
  },
  "Implant review": {
    English: "Hi {name}, a quick 6-month implant review is due. It takes 15 minutes and there is no charge.",
    "मराठी": "नमस्कार {name}, इम्प्लांटची ६ महिन्यांची तपासणी बाकी आहे. १५ मिनिटे, कोणतेही शुल्क नाही.",
    "हिंदी": "नमस्ते {name}, इम्प्लांट की 6 महीने वाली जाँच बाकी है। 15 मिनट, कोई शुल्क नहीं।",
  },
  "Child fluoride": {
    English: "Hi, {name}'s 6-monthly fluoride varnish is due. Saturday mornings are kept for kids.",
    "मराठी": "नमस्कार, {name} चे ६ महिन्यांचे फ्लोराइड बाकी आहे. शनिवारी सकाळी मुलांसाठी खास वेळ.",
    "हिंदी": "नमस्ते, {name} का 6 महीने वाला फ्लोराइड बाकी है। शनिवार सुबह बच्चों के लिए खास समय।",
  },
  "Denture check": {
    English: "Namaskar {name}, a yearly denture check is due. We will also check the fit and clean them.",
    "मराठी": "नमस्कार {name}, कवळीची वार्षिक तपासणी बाकी आहे. फिटिंग आणि सफाई दोन्ही करू.",
    "हिंदी": "नमस्कार {name}, डेंचर की सालाना जाँच बाकी है। फिटिंग और सफ़ाई दोनों करेंगे।",
  },
};

function RecallsTab() {
  const desk = useDesk();
  const [rows, setRows] = React.useState(seedRecalls);
  const [open, setOpen] = React.useState<string | null>(null);
  const [reason, setReason] = React.useState<RecallReason>("6-month cleaning");
  const [lang, setLang] = React.useState<Recall["lang"]>("मराठी");
  const [auto, setAuto] = React.useState<Record<string, boolean>>({ remind: true, recall: true, review: true, birthday: false });
  const r = rows.find((x) => x.id === open) ?? null;
  const counts = (s: RecallStatus) => rows.filter((x) => x.status === s).length;

  function setStatus(ids: string[], status: RecallStatus, msg: string) {
    setRows((cur) => cur.map((x) => (ids.includes(x.id) ? { ...x, status } : x)));
    toast.success(msg);
    desk.log(msg, status === "Booked" ? "ok" : "info");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Due this month" value="186" hint={`${rows.filter((x) => x.dueIn < 0).length} overdue in this queue`} icon={Repeat} trend={[150, 162, 171, 168, 180, 176, 186]} />
        <Stat label="Queued for 7 PM" value={counts("Queued")} hint="Recall Caller sends in their language" icon={Clock} tone="info" />
        <Stat label="Booked from recalls" value="29%" delta="+7%" hint="61 of 212, last 30 days" icon={CalendarPlus} tone="ok" trend={[18, 20, 22, 21, 25, 27, 29]} />
        <Stat label="Work waiting on recalls" value={inr(rows.filter((x) => x.status !== "Booked").reduce((a, x) => a + x.worth, 0), { compact: true })} hint="crowns after RCT are the big ones" icon={IndianRupee} tone="warn" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel title="Recall queue" sub="Select and send, or click a patient to book them straight in">
          <DataTable
            rows={rows}
            rowKey={(x) => x.id}
            search={(x) => `${x.patient} ${x.reason} ${x.phone}`}
            searchPlaceholder="Search patient or reason"
            filter={{ get: (x) => x.status, options: ["Queued", "Sent", "Replied", "No reply", "Booked"] }}
            onRow={(x) => setOpen(x.id)}
            pageSize={9}
            bulk={[
              { label: "Send WhatsApp now", run: (k) => setStatus(k, "Sent", `${k.length} recalls sent on WhatsApp`) },
              { label: "Mark booked", run: (k) => setStatus(k, "Booked", `${k.length} recalls marked booked`) },
            ]}
            columns={[
              { key: "p", label: "Patient", render: (x) => <span className="font-medium">{x.patient}</span>, sort: (x) => x.patient },
              { key: "r", label: "Reason", render: (x) => <span className="text-d-mute">{x.reason}</span>, sort: (x) => x.reason },
              { key: "last", label: "Last visit", render: (x) => <span className="font-mono text-[12px]">{x.last}</span>, wide: true },
              { key: "due", label: "Due", align: "right", render: (x) => <span className="tnum font-mono text-[12px]" style={{ color: x.dueIn < -14 ? "var(--d-late)" : x.dueIn < 0 ? "var(--d-warn)" : undefined }}>{x.dueIn < 0 ? `${-x.dueIn}d over` : x.dueIn === 0 ? "today" : `in ${x.dueIn}d`}</span>, sort: (x) => x.dueIn },
              { key: "l", label: "Lang", render: (x) => <span className="text-[12px]">{x.lang}</span>, wide: true },
              { key: "w", label: "Worth", align: "right", render: (x) => <span className="tnum font-mono">{x.worth ? inr(x.worth) : "—"}</span>, sort: (x) => x.worth },
              { key: "s", label: "Status", render: (x) => <Pill tone={recallTone[x.status]}>{x.status}</Pill> },
            ]}
          />
        </Panel>
        <Panel icon={MessageCircle} title="Message preview" sub="Templates per reason, per language">
          <div className="space-y-3">
            <select className={inputClass} value={reason} onChange={(e) => setReason(e.target.value as RecallReason)}>
              {(Object.keys(TEMPLATES) as RecallReason[]).map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
            <Segmented size="sm" options={["English", "मराठी", "हिंदी"] as const} value={lang} onChange={setLang} />
            <div className="rounded-[18px] bg-[#0b141a] p-3">
              <p className="mb-2 flex items-center gap-2 text-[11.5px] text-white/70">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1f7a64] text-[10px] font-bold text-white">N</span>
                Nilgiri Dental Studio · business account
              </p>
              <div className="ml-auto max-w-[92%] rounded-[12px] rounded-tr-[3px] bg-[#005c4b] px-3 py-2 text-[13px] leading-relaxed text-white">
                {TEMPLATES[reason][lang].replace("{name}", "Kaustubh")}
                <p className="mt-1 text-right font-mono text-[10px] text-white/60">7:00 PM ✓✓</p>
              </div>
              <div className="mt-2 flex gap-1.5">
                {["Book Thursday", "Book Saturday", "Call me"].map((b) => (
                  <span key={b} className="rounded-full border border-white/20 px-2.5 py-1 text-[11px] text-[#53bdeb]">
                    {b}
                  </span>
                ))}
              </div>
            </div>
            <Btn
              variant="solid"
              icon={Send}
              className="w-full"
              onClick={() => {
                const ids = rows.filter((x) => x.reason === reason && x.status === "Queued").map((x) => x.id);
                setStatus(ids, "Sent", `${ids.length} “${reason}” recalls sent in ${lang}`);
              }}
            >
              Send to all queued “{reason}”
            </Btn>
          </div>
        </Panel>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr_1fr]">
        <Panel title="Replies, last 30 days" sub="212 recalls sent">
          <Donut
            center="61"
            sub="booked"
            size={150}
            segments={[
              { label: "Booked", value: 61, tone: "ok" },
              { label: "Replied, not booked", value: 57, tone: "warn" },
              { label: "Read, no reply", value: 71, tone: "info" },
              { label: "Not delivered", value: 15, tone: "late" },
              { label: "Opted out", value: 8, tone: "neutral" },
            ]}
          />
        </Panel>
        <Panel title="Conversion by language" sub="Booked ÷ sent">
          <HBars
            format={(v) => `${v}%`}
            max={50}
            data={[
              { label: "मराठी", sub: "118 sent", value: 34, tone: "accent" },
              { label: "हिंदी", sub: "41 sent", value: 27, tone: "info" },
              { label: "English", sub: "53 sent", value: 21, tone: "warn" },
            ]}
          />
        </Panel>
        <Panel icon={Bell} title="Automatic messages" sub="What goes out without anyone pressing send">
          <ul className="space-y-2">
            {[
              { id: "remind", l: "Appointment reminder", s: "7 PM the day before, then 2 hours before" },
              { id: "recall", l: "Recall batch", s: "7 PM daily, 64 tonight" },
              { id: "review", l: "Google review ask", s: "2 hours after a happy visit" },
              { id: "birthday", l: "Birthday wishes", s: "9 AM, with a free cleaning voucher" },
            ].map((x) => (
              <li key={x.id} className="flex items-center gap-3 rounded-[12px] border border-d-line p-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium">{x.l}</p>
                  <p className="text-[11.5px] text-d-mute">{x.s}</p>
                </div>
                <button
                  type="button"
                  aria-label={`Toggle ${x.l}`}
                  onClick={() => {
                    setAuto((a) => ({ ...a, [x.id]: !a[x.id] }));
                    desk.log(`${x.l} ${auto[x.id] ? "paused" : "switched on"}`);
                  }}
                  className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
                  style={{ background: auto[x.id] ? "var(--d-accent)" : "var(--d-line)" }}
                >
                  <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all" style={{ left: auto[x.id] ? 22 : 2 }} />
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <Sheet
        open={!!r}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={r ? `${r.id} · ${r.phone} · ${r.lang}` : ""}
        title={r?.patient ?? ""}
        sub={r ? `${r.reason} · last visit ${r.last} · ${DOCTORS[r.doc].name}` : ""}
        footer={
          r ? (
            <Btn variant="solid" icon={Send} onClick={() => setStatus([r.id], "Sent", `Recall sent to ${r.patient}`)}>
              Send recall
            </Btn>
          ) : undefined
        }
      >
        {r && (
          <div className="space-y-5">
            <div className="rounded-[14px] bg-[#e7f6e9] p-4 text-[13.5px] leading-relaxed text-[#1d3b22]">{TEMPLATES[r.reason][r.lang].replace("{name}", r.patient.split(" ")[0])}</div>
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Book straight into a free slot</p>
              <div className="grid gap-2">
                {["Thu 23 Oct · 5:30 PM", "Fri 24 Oct · 11:00 AM", "Sat 25 Oct · 10:00 AM"].map((s) => (
                  <Btn
                    key={s}
                    icon={CalendarPlus}
                    onClick={() => {
                      setStatus([r.id], "Booked", `${r.patient} booked for ${s}`);
                      setOpen(null);
                    }}
                  >
                    {s}
                  </Btn>
                ))}
              </div>
            </div>
            <KV items={[{ k: "Status", v: <Pill tone={recallTone[r.status]}>{r.status}</Pill> }, { k: "Worth", v: r.worth ? inr(r.worth) : "Goodwill visit" }, { k: "Due", v: r.dueIn < 0 ? `${-r.dueIn} days overdue` : `in ${r.dueIn} days` }, { k: "Doctor", v: DOCTORS[r.doc].short }]} />
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ============================================================
   Billing
   ============================================================ */

function BillingTab() {
  const desk = useDesk();
  const [dues, setDues] = React.useState(seedDues);
  const [open, setOpen] = React.useState<string | null>(null);
  const [amt, setAmt] = React.useState("");
  const [mode, setMode] = React.useState("UPI");
  const d = dues.find((x) => x.id === open) ?? null;
  const outstanding = dues.reduce((a, x) => a + (x.billed - x.paid), 0);
  const bucket = (n: number) => (n <= 15 ? "0-15 days" : n <= 30 ? "16-30 days" : n <= 60 ? "31-60 days" : "60+ days");
  const buckets = ["0-15 days", "16-30 days", "31-60 days", "60+ days"].map((label, i) => ({ label, value: dues.filter((x) => bucket(x.days) === label).reduce((a, x) => a + x.billed - x.paid, 0), tone: (["ok", "info", "warn", "late"] as const)[i] }));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Collected today" value="₹1.86 L" delta="+11%" hint="vs Tuesday average" icon={IndianRupee} tone="ok" trend={[1.1, 1.4, 1.2, 1.6, 1.5, 1.7, 1.86]} />
        <Stat label="Patient dues" value={inr(outstanding, { compact: true })} delta="-4%" deltaGood={false} hint={`${dues.length} running plans`} icon={BadgeIndianRupee} tone="warn" trend={[3.6, 3.4, 3.5, 3.3, 3.2, 3.1, outstanding / 1e5]} />
        <Stat label="Insurance pending" value={inr(claims.filter((c) => c.status !== "Settled" && c.status !== "Rejected").reduce((a, c) => a + (c.approved ?? c.amount), 0), { compact: true })} hint="4 claims with TPAs" icon={ShieldCheck} tone="info" />
        <Stat label="On EMI" value={dues.filter((x) => x.emi).length} hint="Bajaj Finserv, no-cost 6 months" icon={CreditCard} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Panel icon={Sparkles} title="Waiting on Dr. Meera" sub="Discounts above ₹1,000 and write-offs. Approved estimates go to the patient on WhatsApp.">
          <ApprovalQueue
            items={[
              { id: "D1", title: "Anjali Mehta · 4 zirconia crowns", sub: "Asked 10% off for paying upfront, wedding in Feb", amount: "− " + inr(4600), meta: "10%" },
              { id: "D2", title: "Col. Suresh Nair · dentures", sub: "Senior + ex-serviceman courtesy, ECHS covers rest", amount: "− " + inr(2500), meta: "courtesy", tone: "info" },
              { id: "D3", title: "Kunal Bhat · 97-day due", sub: "Write off ₹2,000 interest, collect ₹22,000 this week", amount: "− " + inr(2000), meta: "write-off", tone: "late" },
              { id: "D4", title: "Om Jadhav · braces", sub: "Sibling discount, sister finished aligners here", amount: "− " + inr(3000), meta: "family" },
            ]}
            onDecide={(id, v) => v && desk.log(`Discount ${id} ${v} by Dr. Meera`, v === "approved" ? "ok" : "info")}
          />
        </Panel>
        <Panel icon={ShieldCheck} title="Insurance & TPA claims" sub="Pre-auth to settlement">
          <ul className="divide-y divide-d-line">
            {claims.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-medium">
                    {c.patient} <span className="font-mono text-[11px] text-d-mute">{c.id}</span>
                  </p>
                  <p className="truncate text-[12px] text-d-mute">
                    {c.proc} · {c.tpa}
                  </p>
                </div>
                <span className="tnum font-mono text-[12.5px]">{c.approved ? `${inr(c.approved)} / ${inr(c.amount)}` : inr(c.amount)}</span>
                <Pill tone={claimTone[c.status]}>{c.status}</Pill>
                {c.status === "Query raised" && (
                  <Btn
                    size="sm"
                    variant="soft"
                    onClick={() => {
                      toast.success("Claims Clerk is replying", { description: `Asked ${c.patient} for the FIR copy on WhatsApp` });
                      desk.log(`Claims Clerk answering query on ${c.id}`, "info");
                    }}
                  >
                    Answer
                  </Btn>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <Panel title="Ageing of patient dues" sub="Collect at every sitting. Reminders go with the next appointment confirmation.">
        <AgingBar buckets={buckets} format={(v) => inr(v, { compact: true })} />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Panel title="Patient dues" sub="Click a row to collect a payment">
          <DataTable
            rows={dues}
            rowKey={(x) => x.id}
            search={(x) => `${x.patient} ${x.plan} ${x.id}`}
            searchPlaceholder="Search patient or invoice"
            filter={{ get: (x) => bucket(x.days), options: ["0-15 days", "16-30 days", "31-60 days", "60+ days"] }}
            onRow={(x) => {
              setOpen(x.id);
              setAmt(String(x.billed - x.paid));
            }}
            bulk={[{ label: "Send payment links", run: (k) => { toast.success(`${k.length} Razorpay links sent`); desk.log(`${k.length} payment links sent on WhatsApp`); } }]}
            columns={[
              { key: "id", label: "Invoice", render: (x) => <span className="font-mono text-[12px]">{x.id}</span> },
              { key: "p", label: "Patient", render: (x) => <span className="font-medium">{x.patient}</span>, sort: (x) => x.patient },
              { key: "plan", label: "Plan", render: (x) => <span className="text-d-mute">{x.plan}</span>, wide: true },
              { key: "b", label: "Billed", align: "right", render: (x) => <span className="tnum font-mono">{inr(x.billed)}</span>, sort: (x) => x.billed },
              { key: "due", label: "Due", align: "right", render: (x) => <span className="tnum font-mono font-semibold" style={{ color: x.billed - x.paid <= 0 ? "var(--d-ok)" : undefined }}>{x.billed - x.paid <= 0 ? "Paid" : inr(x.billed - x.paid)}</span>, sort: (x) => x.billed - x.paid },
              { key: "d", label: "Days", align: "right", render: (x) => <span className="tnum font-mono" style={{ color: x.days > 60 ? "var(--d-late)" : x.days > 30 ? "var(--d-warn)" : undefined }}>{x.days}</span>, sort: (x) => x.days },
              { key: "tag", label: "", render: (x) => (x.emi ? <Pill tone="info">EMI</Pill> : x.insurer ? <Pill tone="accent">{x.insurer}</Pill> : null) },
            ]}
          />
        </Panel>
        <Panel title="How patients pay" sub="This month, by value">
          <Donut
            center="₹31.4 L"
            sub="October"
            size={150}
            segments={[
              { label: "UPI", value: 54, tone: "accent" },
              { label: "Card", value: 19, tone: "info" },
              { label: "EMI (Bajaj)", value: 12, tone: "warn" },
              { label: "Insurance / TPA", value: 9, tone: "ok" },
              { label: "Cash", value: 6, tone: "neutral" },
            ]}
          />
          <p className="mt-4 rounded-[12px] bg-d-sunk p-3 text-[12px] leading-relaxed text-d-mute">
            Treatment is GST-exempt as healthcare. Whitening, veneers and cosmetic aligners carry 18% GST: <b className="text-d-ink">₹14,220</b> collected this month, filed through Tally.
          </p>
        </Panel>
      </div>
      <Sheet
        open={!!d}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={d ? `${d.id} · ${d.days} days` : ""}
        title={d?.patient ?? ""}
        sub={d?.plan}
        footer={
          d ? (
            <Btn
              variant="solid"
              icon={Wind}
              onClick={() => {
                const v = Math.min(d.billed - d.paid, Number(amt) || 0);
                if (v <= 0) {
                  toast.error("Enter an amount");
                  return;
                }
                setDues((cur) => cur.map((x) => (x.id === d.id ? { ...x, paid: x.paid + v } : x)));
                toast.success(`${inr(v)} received by ${mode}`, { description: `${d.patient} · receipt on WhatsApp, entry in Tally` });
                desk.log(`${inr(v)} collected from ${d.patient} by ${mode}`, "ok");
                setOpen(null);
              }}
            >
              Record payment
            </Btn>
          ) : undefined
        }
      >
        {d && (
          <div className="space-y-5">
            <KV items={[{ k: "Billed", v: inr(d.billed) }, { k: "Paid", v: inr(d.paid) }, { k: "Due", v: inr(d.billed - d.paid) }, { k: "Cover", v: d.insurer ?? (d.emi ? "Bajaj Finserv EMI" : "Self-pay") }]} />
            <Meter value={d.paid} max={d.billed} tone="accent" height={8} />
            <Field label="Amount">
              <input className={inputClass} inputMode="numeric" value={amt} onChange={(e) => setAmt(e.target.value.replace(/\D/g, ""))} />
            </Field>
            <Field label="Mode">
              <Segmented size="sm" options={["UPI", "Card", "Cash", "EMI"]} value={mode} onChange={setMode} />
            </Field>
          </div>
        )}
      </Sheet>
    </div>
  );
}
