"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Blocks,
  Bot,
  CalendarDays,
  Check,
  CheckCheck,
  ClipboardCheck,
  FileCheck,
  Gavel,
  GraduationCap,
  HandCoins,
  IndianRupee,
  Landmark,
  MessageCircle,
  Mic,
  Package,
  Plug,
  Plus,
  Route,
  School,
  Send,
  Star,
  Timer,
  Trash,
  TriangleAlert,
  Truck,
  Users,
  Gauge as GaugeIcon,
} from "lucide-react";
import { DeskShell, useDesk } from "../shell";
import { AreaChart, Bars, Donut, HBars } from "../charts";
import { AgingBar, Board, Checklist, Countdown, DataTable } from "../data";
import { AgentsModule, ConnectionsModule, IndependenceModule, PeopleModule } from "../common";
import { Avatar, Btn, Field, inputClass, inr, KV, Meter, Modal, Panel, Pill, Segmented, Sheet, Stat } from "../ui";
import { clockLabel, useDrift } from "../hooks";
import type { DeskConfig, DeskModule, IndependenceData, Integration, TeamMember, Tone, WorkforceAgent } from "../types";

/* ============================================================
   Data — Ganga Learning Kits, Patna. Fictional STEM & Montessori kit maker
   selling to schools and government programmes across Bihar.
   Today is Tue 20 Oct 2026.
   ============================================================ */

type Kit = { id: string; name: string; cls: string; price: number; color: string };
const kits: Kit[] = [
  { id: "STEM-J", name: "STEM Junior Lab", cls: "Class 3–5", price: 18500, color: "#2c5e3f" },
  { id: "ROBO-S", name: "Robotics Starter (Arduino)", cls: "Class 6–8", price: 24800, color: "#3b6e8f" },
  { id: "MONT-S", name: "Montessori Sensorial Set", cls: "Pre-primary", price: 32400, color: "#c69a2f" },
  { id: "MONT-P", name: "Montessori Practical Life", cls: "Pre-primary", price: 14200, color: "#b5452f" },
  { id: "SCI-68", name: "Science Lab Kit", cls: "Class 6–8", price: 21600, color: "#5a7d3a" },
  { id: "MATH-M", name: "Maths Manipulatives", cls: "Class 1–5", price: 9800, color: "#7a5c99" },
  { id: "VARN", name: "Hindi Varnamala Literacy Kit", cls: "Class 1–2", price: 6400, color: "#a8673a" },
  { id: "ECCE", name: "Anganwadi ECCE Play Kit", cls: "3–6 yrs", price: 7900, color: "#2f8f8a" },
];
const kitById = (id: string) => kits.find((k) => k.id === id) ?? kits[0];

const STAGES = ["Enquiry", "Demo done", "Quote sent", "PO received", "In assembly", "Dispatched"] as const;
type OrderStage = (typeof STAGES)[number];
type SchoolOrder = { id: string; school: string; district: string; kind: "Private" | "Govt" | "CSR"; kit: string; qty: number; stage: OrderStage; owner: string; contact: string; next: string; advance?: number };

const seedOrders: SchoolOrder[] = [
  { id: "GLK-2611", school: "DAV Public School, Bodh Gaya", district: "Gaya", kind: "Private", kit: "STEM-J", qty: 40, stage: "PO received", owner: "Kavita Singh", contact: "Principal R. K. Mishra", next: "Dispatch Wed via Magadh Roadways", advance: 0.3 },
  { id: "GLK-2614", school: "St. Xavier's High School, Bettiah", district: "West Champaran", kind: "Private", kit: "SCI-68", qty: 18, stage: "Dispatched", owner: "Kavita Singh", contact: "Fr. Joseph Tirkey", next: "Delivered 14 Oct, payment due" },
  { id: "GLK-2617", school: "Kendriya Vidyalaya No. 2, Danapur Cantt", district: "Patna", kind: "Govt", kit: "ROBO-S", qty: 12, stage: "Quote sent", owner: "Deepak Yadav", contact: "Mrs. S. Bhattacharya (Vice principal)", next: "Quote valid till 30 Oct, needs GeM listing" },
  { id: "GLK-2619", school: "Little Lotus Montessori, Boring Road", district: "Patna", kind: "Private", kit: "MONT-S", qty: 6, stage: "In assembly", owner: "Deepak Yadav", contact: "Ms. Ritu Agarwal (Founder)", next: "Pink tower blocks short, Saharanpur lot Fri" },
  { id: "GLK-2620", school: "Mithila Public School, Darbhanga", district: "Darbhanga", kind: "Private", kit: "STEM-J", qty: 25, stage: "Dispatched", owner: "Kavita Singh", contact: "Sri Ajay Jha (Director)", next: "Truck at Muzaffarpur bypass, EWB expiring" },
  { id: "GLK-2622", school: "Notre Dame Academy, Munger", district: "Munger", kind: "Private", kit: "ROBO-S", qty: 8, stage: "Demo done", owner: "Deepak Yadav", contact: "Sr. Mary Kujur", next: "Wants a Saturday demo for the board" },
  { id: "GLK-2624", school: "Tirhut Vidyapeeth, Muzaffarpur", district: "Muzaffarpur", kind: "Private", kit: "MATH-M", qty: 60, stage: "PO received", owner: "Kavita Singh", contact: "Dr. Anil Thakur", next: "Batch B-121 kitting starts today", advance: 0.25 },
  { id: "GLK-2625", school: "Bhagalpur Mission School", district: "Bhagalpur", kind: "Private", kit: "SCI-68", qty: 15, stage: "Quote sent", owner: "Deepak Yadav", contact: "Mr. Sanjay Ghosh", next: "Asked for 5% off, revised quote pending" },
  { id: "GLK-2627", school: "Gyan Bharati School, Sitamarhi", district: "Sitamarhi", kind: "Private", kit: "VARN", qty: 120, stage: "Enquiry", owner: "Kavita Singh", contact: "Smt. Usha Devi", next: "Sample kit to be carried on Thursday visit" },
  { id: "GLK-2628", school: "Seemanchal Public School, Purnea", district: "Purnea", kind: "Private", kit: "STEM-J", qty: 20, stage: "Enquiry", owner: "Deepak Yadav", contact: "Mr. Md. Shahid", next: "WhatsApp enquiry, call back today" },
  { id: "GLK-2630", school: "Kosi Gramin Bank CSR, Saharsa schools", district: "Saharsa", kind: "CSR", kit: "MATH-M", qty: 80, stage: "Demo done", owner: "Kavita Singh", contact: "CSR head Mr. P. N. Choudhary", next: "Proposal for 8 govt middle schools" },
  { id: "GLK-2631", school: "Shishu Gyan Mandir, Ara", district: "Bhojpur", kind: "Private", kit: "MONT-P", qty: 10, stage: "Quote sent", owner: "Deepak Yadav", contact: "Acharya Ramesh Tiwari", next: "Follow up after Chhath holidays" },
  { id: "GLK-2633", school: "Rajgir Residential Academy", district: "Nalanda", kind: "Private", kit: "ROBO-S", qty: 15, stage: "PO received", owner: "Deepak Yadav", contact: "Mr. Vikram Prasad", next: "Waiting on 20 Arduino boards", advance: 0.5 },
  { id: "GLK-2635", school: "Samastipur Model School", district: "Samastipur", kind: "Govt", kit: "SCI-68", qty: 22, stage: "In assembly", owner: "Kavita Singh", contact: "HM Smt. Kiran Kumari", next: "Teacher training to be booked on delivery" },
  { id: "GLK-2636", school: "Chhapra Central School", district: "Saran", kind: "Private", kit: "STEM-J", qty: 30, stage: "Enquiry", owner: "Deepak Yadav", contact: "Mr. Alok Srivastava", next: "Visited stall at Patna book fair" },
];
const orderValue = (o: SchoolOrder) => o.qty * kitById(o.kit).price;

const team: TeamMember[] = [
  { name: "Vivek Ranjan Sinha", role: "Founder & MD", status: "Busy", load: 92, focus: "BEPC bid papers and the DAV Bodh Gaya PO", tasks: [{ title: "Sign MSE affidavit for BEPC bid", due: "11:00" }, { title: "Approve Arduino PO ₹38,400", due: "12:30" }, { title: "Call SBI on bank guarantee", due: "3:00" }], week: [1, 1, 1, 1, 1, 1], since: "2012" },
  { name: "Rakesh Paswan", role: "Dispatch & logistics", status: "On floor", load: 84, focus: "DAV Bodh Gaya load-out and the stuck Darbhanga truck", tasks: [{ title: "Load 40 STEM kits for Gaya", due: "kal 10 AM" }, { title: "Extend EWB 1219 4471 8832", due: "now" }, { title: "Book tempo for Danapur demo", due: "Thu", done: true }], week: [1, 1, 1, 1, 1, 1], since: "2015" },
  { name: "Priyanka Kumari", role: "Trainer coordinator", status: "In field", load: 78, focus: "Muzaffarpur onboarding, rebalancing Shabnam's week", tasks: [{ title: "Shift Muzaffarpur visit to Thursday", due: "today" }, { title: "Samastipur training plan, 6 schools", due: "Fri" }], week: [1, 1, 0, 1, 1, 1], since: "2018" },
  { name: "Sunil Kumar Jha", role: "Tenders & govt liaison", status: "Busy", load: 95, focus: "BEPC science kits bid closes Thursday 3 PM", tasks: [{ title: "CA turnover certificate (3 yrs)", due: "today 6 PM" }, { title: "ICDS sample lot, 20 ECCE kits", due: "28 Oct" }, { title: "GeM ATL bid final upload", due: "Sat" }], week: [1, 1, 1, 1, 1, 1], since: "2014" },
  { name: "Neha Agarwal", role: "Accounts & GST", status: "On floor", load: 66, focus: "School dues before Diwali, PFMS bill for Jeevika", tasks: [{ title: "St. Xavier's Bettiah follow-up", due: "today" }, { title: "GSTR-1 for September", due: "11 Nov" }, { title: "EMD refund letter, Gaya DEO", due: "Thu" }], week: [1, 1, 1, 1, 1, 0], since: "2019" },
  { name: "Manoj Mahto", role: "Assembly supervisor", status: "On floor", load: 81, focus: "Batch B-118 packing, B-119 blocked on pink tower", tasks: [{ title: "Finish B-118 packing, 6 kits left", due: "4 PM" }, { title: "QC test 25 circuit boards B-120", due: "5 PM" }], week: [1, 1, 1, 1, 1, 1], since: "2016" },
  { name: "Imran Ansari", role: "Stores & purchase", status: "On floor", load: 58, focus: "Arduino stock count and the Saharanpur wood lot", tasks: [{ title: "Count Arduino boards in store", due: "kal subah" }, { title: "GRN for Shakti Scientific magnets", due: "2 PM", done: true }], week: [1, 1, 1, 1, 1, 1], since: "2020" },
  { name: "Kavita Singh", role: "School sales, North Bihar", status: "In field", load: 72, focus: "Kosi Gramin Bank CSR proposal in Saharsa", tasks: [{ title: "CSR proposal deck, 8 schools", due: "Wed" }, { title: "Sitamarhi sample visit", due: "Thu" }], week: [1, 0, 1, 1, 1, 1], since: "2021" },
];
const people = team.map((t) => t.name);
const first = (n: string) => n.split(" ")[0];

/* ---------------- Voice notes the owner records ---------------- */

type Draft = { id: string; title: string; who: string; due: string; order: string };
type TaskStatus = "Sent" | "Seen" | "In progress" | "Done";
type Assigned = Draft & { status: TaskStatus; at: string; via: "Voice" | "Typed" };
const dueOptions = ["Today 6 PM", "Kal subah 10 AM", "Kal tak", "Thursday", "Friday", "This week", "Before Diwali"];

const voiceNotes: { text: string; keys: string[]; drafts: Omit<Draft, "id">[] }[] = [
  {
    text: "Rakesh, Gaya wale school ka order kal tak dispatch karo — DAV Bodh Gaya ke 40 STEM kits, Magadh Roadways se. Priyanka, Muzaffarpur wala trainer visit Thursday pe shift kar do. Aur Sunil ji, BEPC tender ke documents aaj shaam tak ready chahiye, CA certificate bhi.",
    keys: ["Rakesh", "Priyanka", "Sunil", "Gaya", "DAV Bodh Gaya", "Muzaffarpur", "BEPC", "kal tak", "Thursday", "aaj shaam"],
    drafts: [
      { title: "Dispatch 40 STEM Junior kits to DAV Bodh Gaya via Magadh Roadways", who: "Rakesh Paswan", due: "Kal tak", order: "GLK-2611" },
      { title: "Shift the Muzaffarpur trainer visit to Thursday", who: "Priyanka Kumari", due: "Today 6 PM", order: "GLK-2624" },
      { title: "BEPC tender documents ready, including CA turnover certificate", who: "Sunil Kumar Jha", due: "Today 6 PM", order: "BEPC/SS/2026-27/14" },
    ],
  },
  {
    text: "Neha, St. Xavier's Bettiah ka payment follow-up karo, teen lakh bees hazaar pending hai chauhattar din se. Manoj, Montessori sensorial kit ke pink tower blocks short hain, Saharanpur wale vendor ko call karo. Rakesh, Darbhanga consignment ka e-way bill extend karna mat bhoolna.",
    keys: ["Neha", "Manoj", "Rakesh", "St. Xavier's Bettiah", "Saharanpur", "Darbhanga", "e-way bill", "pink tower"],
    drafts: [
      { title: "Payment follow-up with St. Xavier's Bettiah, ₹3.2 L at 74 days", who: "Neha Agarwal", due: "Today 6 PM", order: "GLK-2614" },
      { title: "Call Saharanpur Wood Crafts about short pink tower blocks", who: "Manoj Mahto", due: "Kal subah 10 AM", order: "GLK-2619" },
      { title: "Extend e-way bill for the Darbhanga consignment", who: "Rakesh Paswan", due: "Today 6 PM", order: "GLK-2620" },
    ],
  },
  {
    text: "Priyanka, Samastipur ke chhe schools ka teacher training schedule bana do next week ke liye. Imran, robotics kit ke Arduino boards ka stock count karke batao kal subah tak. Kavita, Kosi Gramin Bank wala CSR proposal Wednesday tak bhej do.",
    keys: ["Priyanka", "Imran", "Kavita", "Samastipur", "Arduino", "Kosi Gramin Bank", "kal subah", "Wednesday"],
    drafts: [
      { title: "Teacher training schedule for 6 Samastipur schools, next week", who: "Priyanka Kumari", due: "Friday", order: "GLK-2635" },
      { title: "Stock count of Arduino boards for robotics kits", who: "Imran Ansari", due: "Kal subah 10 AM", order: "GLK-2633" },
      { title: "Send Kosi Gramin Bank CSR proposal", who: "Kavita Singh", due: "This week", order: "GLK-2630" },
    ],
  },
];

const seedAssigned: Assigned[] = [
  { id: "T-41", title: "Book tempo for KV Danapur robotics demo", who: "Rakesh Paswan", due: "Thursday", order: "GLK-2617", status: "Done", at: "9:12 AM", via: "Voice" },
  { id: "T-42", title: "Revised quote to Bhagalpur Mission School at 3% off", who: "Deepak Yadav", due: "Today 6 PM", order: "GLK-2625", status: "In progress", at: "9:14 AM", via: "Voice" },
  { id: "T-43", title: "Print 120 Varnamala activity books at Patliputra Offset", who: "Imran Ansari", due: "Friday", order: "GLK-2627", status: "Seen", at: "9:40 AM", via: "Typed" },
  { id: "T-44", title: "Upload ICDS sample lot photos to the tender folder", who: "Sunil Kumar Jha", due: "This week", order: "ICDS/ECCE/2026/03", status: "Sent", at: "10:05 AM", via: "Voice" },
];

/* ---------------- Assembly ---------------- */

type Bom = { item: string; supplier: string; perKit: number; store: number; unit: string; rate: number };
const bom: Record<"STEM-J" | "ROBO-S" | "MONT-S", Bom[]> = {
  "STEM-J": [
    { item: "Bar + horseshoe magnet set", supplier: "Shakti Scientific, Ambala", perKit: 2, store: 260, unit: "sets", rate: 85 },
    { item: "Lens & mirror optics set", supplier: "Shakti Scientific, Ambala", perKit: 1, store: 96, unit: "sets", rate: 240 },
    { item: "Simple machines pulley set", supplier: "Bharat Edu Moulds, Faridabad", perKit: 1, store: 140, unit: "sets", rate: 410 },
    { item: "Circuit kit (bulb, cell holder, switch)", supplier: "Patna Electronics, Lohanipur", perKit: 3, store: 280, unit: "kits", rate: 95 },
    { item: "GLK printed storage case", supplier: "Hajipur Plastics", perKit: 1, store: 70, unit: "pcs", rate: 380 },
    { item: "Activity manual, Hindi + English", supplier: "Patliputra Offset, Patna", perKit: 1, store: 150, unit: "books", rate: 65 },
  ],
  "ROBO-S": [
    { item: "Arduino Uno compatible board", supplier: "Circuitkart, Delhi", perKit: 1, store: 18, unit: "boards", rate: 1920 },
    { item: "SG90 micro servo", supplier: "Circuitkart, Delhi", perKit: 4, store: 64, unit: "pcs", rate: 145 },
    { item: "HC-SR04 ultrasonic sensor", supplier: "Patna Electronics, Lohanipur", perKit: 1, store: 41, unit: "pcs", rate: 110 },
    { item: "2WD chassis + wheels", supplier: "Bharat Edu Moulds, Faridabad", perKit: 1, store: 36, unit: "sets", rate: 690 },
    { item: "7.4V Li-ion pack + charger", supplier: "Volta Cells, Noida", perKit: 1, store: 22, unit: "packs", rate: 820 },
    { item: "Jumper wires + breadboard", supplier: "Patna Electronics, Lohanipur", perKit: 1, store: 80, unit: "sets", rate: 120 },
  ],
  "MONT-S": [
    { item: "Pink tower (10 cubes)", supplier: "Saharanpur Wood Crafts", perKit: 10, store: 40, unit: "cubes", rate: 120 },
    { item: "Brown stair (10 prisms)", supplier: "Saharanpur Wood Crafts", perKit: 10, store: 90, unit: "prisms", rate: 110 },
    { item: "Red rods (10)", supplier: "Saharanpur Wood Crafts", perKit: 10, store: 100, unit: "rods", rate: 70 },
    { item: "Knobbed cylinder blocks", supplier: "Saharanpur Wood Crafts", perKit: 4, store: 30, unit: "blocks", rate: 640 },
    { item: "Colour tablets, box 3", supplier: "Montessori Mart, Kolkata", perKit: 1, store: 9, unit: "boxes", rate: 520 },
    { item: "Sound cylinders pair", supplier: "Montessori Mart, Kolkata", perKit: 1, store: 4, unit: "pairs", rate: 760 },
  ],
};
const openKitDemand = (id: string, orders: SchoolOrder[]) => orders.filter((o) => o.kit === id && (o.stage === "PO received" || o.stage === "In assembly" || o.stage === "Quote sent" || o.stage === "Demo done")).reduce((a, o) => a + o.qty, 0);

const STATIONS = ["Kitting", "Sub-assembly", "QC test", "Manual & label", "Packing"] as const;
type Station = (typeof STATIONS)[number];
type Batch = { id: string; kit: string; qty: number; done: number; order: string; station: Station; blocked?: string; lead: string };
const seedBatches: Batch[] = [
  { id: "B-118", kit: "STEM-J", qty: 40, done: 34, order: "GLK-2611", station: "Packing", lead: "Manoj" },
  { id: "B-119", kit: "MONT-S", qty: 6, done: 2, order: "GLK-2619", station: "Sub-assembly", blocked: "Pink tower cubes short by 20", lead: "Sushma" },
  { id: "B-120", kit: "STEM-J", qty: 25, done: 12, order: "GLK-2620 repeat", station: "QC test", lead: "Manoj" },
  { id: "B-121", kit: "MATH-M", qty: 60, done: 0, order: "GLK-2624", station: "Kitting", lead: "Guddu" },
  { id: "B-122", kit: "ROBO-S", qty: 15, done: 0, order: "GLK-2633", station: "Kitting", blocked: "Arduino boards: 18 in store, 35 needed", lead: "Sushma" },
  { id: "B-123", kit: "ECCE", qty: 20, done: 14, order: "ICDS sample lot", station: "Manual & label", lead: "Guddu" },
  { id: "B-124", kit: "SCI-68", qty: 22, done: 9, order: "GLK-2635", station: "Sub-assembly", lead: "Manoj" },
];

/* ---------------- Dispatch ---------------- */

type Consignment = { id: string; to: string; district: string; transporter: string; lr: string; kits: number; boxes: number; kg: number; value: number; ewb: string; ewbHours: number; status: "Packed" | "Loaded" | "In transit" | "Delivered" | "Held"; eta: string };
const seedConsignments: Consignment[] = [
  { id: "DSP-781", to: "Mithila Public School", district: "Darbhanga", transporter: "Tirhut Transport Co.", lr: "TTC/24518", kits: 25, boxes: 25, kg: 410, value: 462500, ewb: "1219 4471 8832", ewbHours: 5, status: "Held", eta: "Stuck at Muzaffarpur bypass" },
  { id: "DSP-782", to: "DAV Public School, Bodh Gaya", district: "Gaya", transporter: "Magadh Roadways", lr: "MR/88104", kits: 40, boxes: 40, kg: 655, value: 740000, ewb: "Not generated", ewbHours: 0, status: "Packed", eta: "Leaves Wed 7 AM" },
  { id: "DSP-779", to: "St. Xavier's High School", district: "West Champaran", transporter: "Ganga Cargo Movers", lr: "GCM/5531", kits: 18, boxes: 18, kg: 340, value: 388800, ewb: "1219 4390 1176", ewbHours: 0, status: "Delivered", eta: "Delivered 14 Oct" },
  { id: "DSP-780", to: "Samastipur Model School", district: "Samastipur", transporter: "Tirhut Transport Co.", lr: "TTC/24490", kits: 12, boxes: 12, kg: 228, value: 259200, ewb: "1219 4418 3305", ewbHours: 31, status: "In transit", eta: "Today evening" },
  { id: "DSP-783", to: "Jeevika library cluster, Nalanda", district: "Nalanda", transporter: "Local tempo (Rajesh)", lr: "Challan 1192", kits: 60, boxes: 15, kg: 300, value: 288000, ewb: "1219 4502 7740", ewbHours: 19, status: "In transit", eta: "Rajgir by 3 PM" },
  { id: "DSP-784", to: "Kosi block resource centre", district: "Saharsa", transporter: "Kosi Express Parcel", lr: "KEP/7710", kits: 8, boxes: 8, kg: 96, value: 78400, ewb: "1219 4511 0921", ewbHours: 44, status: "Loaded", eta: "Thu" },
  { id: "DSP-776", to: "Bal Vikas Anganwadi project", district: "Vaishali", transporter: "Ganga Cargo Movers", lr: "GCM/5502", kits: 40, boxes: 10, kg: 210, value: 316000, ewb: "1219 4301 6659", ewbHours: 0, status: "Delivered", eta: "Delivered 9 Oct" },
  { id: "DSP-785", to: "Little Lotus Montessori", district: "Patna", transporter: "Own van (BR01 GK 4410)", lr: "Local", kits: 2, boxes: 6, kg: 64, value: 64800, ewb: "Within city, exempt", ewbHours: 0, status: "Packed", eta: "Partial, Fri" },
  { id: "DSP-777", to: "Holy Mission School, Hajipur", district: "Vaishali", transporter: "Local tempo (Rajesh)", lr: "Challan 1188", kits: 10, boxes: 10, kg: 180, value: 216000, ewb: "1219 4320 5512", ewbHours: 0, status: "Delivered", eta: "Delivered 11 Oct" },
  { id: "DSP-786", to: "Seemanchal demo set", district: "Purnea", transporter: "Kosi Express Parcel", lr: "KEP/7714", kits: 1, boxes: 1, kg: 16, value: 18500, ewb: "Below ₹50k, not needed", ewbHours: 0, status: "Loaded", eta: "Fri" },
  { id: "DSP-778", to: "Saran DEO science corners", district: "Saran", transporter: "Magadh Roadways", lr: "MR/88051", kits: 30, boxes: 30, kg: 520, value: 648000, ewb: "1219 4344 9081", ewbHours: 0, status: "Delivered", eta: "Delivered 12 Oct" },
  { id: "DSP-787", to: "Bhagalpur Mission School (demo)", district: "Bhagalpur", transporter: "Ganga Cargo Movers", lr: "GCM/5540", kits: 1, boxes: 1, kg: 18, value: 21600, ewb: "Below ₹50k, not needed", ewbHours: 0, status: "In transit", eta: "Thu" },
];
const districtTiles = ["Patna", "Gaya", "Nalanda", "Vaishali", "Muzaffarpur", "Darbhanga", "Samastipur", "Saharsa", "Purnea", "Bhagalpur", "Saran", "West Champaran"];

/* ---------------- Trainers ---------------- */

const DAYS = ["Mon 19", "Tue 20", "Wed 21", "Thu 22", "Fri 23", "Sat 24"];
const TODAY_IX = 1;
const trainers = ["Priyanka Kumari", "Ritesh Ranjan", "Shabnam Parveen", "Amit Kumar Mandal"];
type Visit = { id: string; trainer: string; day: number; slot: "AM" | "PM"; school: string; district: string; type: "Onboarding" | "Refresher" | "Demo" | "Lab audit"; status: "Done" | "Planned" | "Moved"; teachers: number; rating?: number; feedback?: string };
const seedVisits: Visit[] = [
  { id: "V-301", trainer: "Priyanka Kumari", day: 0, slot: "AM", school: "Little Lotus Montessori", district: "Patna", type: "Refresher", status: "Done", teachers: 6, rating: 5, feedback: "Teachers ko sensorial sequence ab clear hai. Asked for a parents' session." },
  { id: "V-302", trainer: "Priyanka Kumari", day: 1, slot: "PM", school: "Tirhut Vidyapeeth", district: "Muzaffarpur", type: "Onboarding", status: "Planned", teachers: 14 },
  { id: "V-303", trainer: "Ritesh Ranjan", day: 0, slot: "PM", school: "Saran DEO science corners", district: "Saran", type: "Onboarding", status: "Done", teachers: 22, rating: 4, feedback: "Lab register maintain karna sikhaya. 2 kits ke lens missing the, replacement bheja." },
  { id: "V-304", trainer: "Ritesh Ranjan", day: 2, slot: "AM", school: "KV No. 2 Danapur", district: "Patna", type: "Demo", status: "Planned", teachers: 5 },
  { id: "V-305", trainer: "Shabnam Parveen", day: 0, slot: "AM", school: "Holy Mission School", district: "Vaishali", type: "Onboarding", status: "Done", teachers: 9, rating: 4, feedback: "Good energy. Class 4 teachers want Hindi worksheets for circuits." },
  { id: "V-306", trainer: "Shabnam Parveen", day: 1, slot: "AM", school: "Samastipur Model School", district: "Samastipur", type: "Lab audit", status: "Planned", teachers: 4 },
  { id: "V-307", trainer: "Shabnam Parveen", day: 1, slot: "PM", school: "Mohanpur Middle School", district: "Samastipur", type: "Onboarding", status: "Planned", teachers: 7 },
  { id: "V-308", trainer: "Shabnam Parveen", day: 2, slot: "AM", school: "Tajpur Girls High School", district: "Samastipur", type: "Onboarding", status: "Planned", teachers: 8 },
  { id: "V-309", trainer: "Shabnam Parveen", day: 3, slot: "AM", school: "Kalyanpur UMS", district: "Samastipur", type: "Refresher", status: "Planned", teachers: 6 },
  { id: "V-310", trainer: "Shabnam Parveen", day: 3, slot: "PM", school: "Muzaffarpur Zila School", district: "Muzaffarpur", type: "Lab audit", status: "Planned", teachers: 5 },
  { id: "V-311", trainer: "Shabnam Parveen", day: 4, slot: "AM", school: "Kanti Block Anganwadi cluster", district: "Muzaffarpur", type: "Onboarding", status: "Planned", teachers: 18 },
  { id: "V-312", trainer: "Amit Kumar Mandal", day: 1, slot: "AM", school: "Bhagalpur Mission School", district: "Bhagalpur", type: "Demo", status: "Done", teachers: 6, rating: 5, feedback: "Principal impressed with the hydraulic arm demo. Wants revised quote." },
  { id: "V-313", trainer: "Amit Kumar Mandal", day: 4, slot: "PM", school: "Sultanganj Public School", district: "Bhagalpur", type: "Refresher", status: "Planned", teachers: 7 },
  { id: "V-314", trainer: "Amit Kumar Mandal", day: 5, slot: "AM", school: "Notre Dame Academy", district: "Munger", type: "Demo", status: "Planned", teachers: 10 },
  { id: "V-315", trainer: "Priyanka Kumari", day: 4, slot: "AM", school: "Shishu Gyan Mandir", district: "Bhojpur", type: "Demo", status: "Planned", teachers: 5 },
  { id: "V-316", trainer: "Ritesh Ranjan", day: 3, slot: "PM", school: "Rajgir Residential Academy", district: "Nalanda", type: "Lab audit", status: "Planned", teachers: 3 },
];
type Feedback = { id: string; school: string; teacher: string; kit: string; rating: number; comment: string; flag?: string };
const feedback: Feedback[] = [
  { id: "F-1", school: "Little Lotus Montessori", teacher: "Ms. Pooja Verma", kit: "MONT-S", rating: 5, comment: "Bacche pink tower ke saath 20 minute focus karte hain. Excellent." },
  { id: "F-2", school: "Saran DEO science corners", teacher: "Sri Manoj Rai", kit: "SCI-68", rating: 4, comment: "Lens set mein 2 piece missing the, baaki sab theek." , flag: "Missing parts" },
  { id: "F-3", school: "Holy Mission School", teacher: "Ms. Anita Kujur", kit: "STEM-J", rating: 4, comment: "Need Hindi worksheets for the circuit chapter." },
  { id: "F-4", school: "Bhagalpur Mission School", teacher: "Mr. Sanjay Ghosh", kit: "ROBO-S", rating: 5, comment: "Demo was brilliant, students did not want to leave." },
  { id: "F-5", school: "St. Xavier's Bettiah", teacher: "Mr. Prakash Oraon", kit: "SCI-68", rating: 3, comment: "Training was rushed, 3 hours is not enough for 18 kits.", flag: "Retrain" },
  { id: "F-6", school: "Saran DEO science corners", teacher: "Smt. Rekha Kumari", kit: "SCI-68", rating: 4, comment: "Chemicals ki expiry date label par chahiye." },
  { id: "F-7", school: "Jeevika library, Rajgir", teacher: "Didi Sunita (CRP)", kit: "VARN", rating: 5, comment: "Varnamala cards gaon ki didiyon ko bhi pasand aaye." },
  { id: "F-8", school: "Bal Vikas Anganwadi, Hajipur", teacher: "Sevika Malti Devi", kit: "ECCE", rating: 4, comment: "Blocks thode halke hain, bacche gira dete hain." },
  { id: "F-9", school: "Mithila Public School", teacher: "Ms. Nidhi Jha", kit: "STEM-J", rating: 5, comment: "Repeat order de rahe hain, 25 more for the new wing." },
  { id: "F-10", school: "Kendriya Vidyalaya Danapur", teacher: "Mr. Arvind Kumar", kit: "ROBO-S", rating: 3, comment: "Arduino IDE install nahi hua lab PCs par, IT support chahiye.", flag: "Tech support" },
];

/* ---------------- Tenders ---------------- */

type Tender = { id: string; dept: string; title: string; portal: string; value: number; emd: number; emdMode: string; inHours: number; status: "Preparing" | "Ready to submit" | "Pre-bid query" | "Technical eval" | "Won" | "Submitted"; docs: { id: string; label: string; sub?: string; done: boolean }[] };
const seedTenders: Tender[] = [
  {
    id: "BEPC/SS/2026-27/14",
    dept: "Bihar Education Project Council (Samagra Shiksha)",
    title: "Science kits for 1,240 upper primary schools",
    portal: "eproc2.bihar.gov.in",
    value: 26800000,
    emd: 540000,
    emdMode: "BG, SBI Gandhi Maidan",
    inHours: 52,
    status: "Preparing",
    docs: [
      { id: "d1", label: "Udyam (MSE) certificate", sub: "Valid till 2029", done: true },
      { id: "d2", label: "GST registration + last 6 GSTR-3B", done: true },
      { id: "d3", label: "CA turnover certificate, 3 years", sub: "Sinha & Associates, due today", done: false },
      { id: "d4", label: "MSE affidavit on ₹100 stamp", sub: "Needs Vivek's signature", done: false },
      { id: "d5", label: "BIS / NABL test reports for 6 items", done: true },
      { id: "d6", label: "Past supply orders above ₹50 L", sub: "Saran DEO, Jeevika", done: true },
      { id: "d7", label: "Technical compliance sheet", done: true },
      { id: "d8", label: "Price bid (BoQ) in .xls", done: false },
    ],
  },
  {
    id: "ICDS/ECCE/2026/03",
    dept: "ICDS Directorate, Social Welfare Dept, Bihar",
    title: "ECCE pre-school kits for 3,800 Anganwadi centres",
    portal: "eproc2.bihar.gov.in",
    value: 30000000,
    emd: 600000,
    emdMode: "Pending decision",
    inHours: 9 * 24 + 6,
    status: "Preparing",
    docs: [
      { id: "e1", label: "Sample lot, 20 kits to directorate", sub: "Batch B-123, 14 of 20 ready", done: false },
      { id: "e2", label: "Udyam (MSE) certificate", done: true },
      { id: "e3", label: "Toy safety (IS 9873) test report", done: true },
      { id: "e4", label: "Manufacturer authorisation", done: false },
      { id: "e5", label: "EMD instrument", done: false },
    ],
  },
  {
    id: "GEM/2026/B/5871204",
    dept: "Atal Innovation Mission via GeM",
    title: "Atal Tinkering Lab kits for 40 schools",
    portal: "gem.gov.in",
    value: 11200000,
    emd: 0,
    emdMode: "Exempt (MSE)",
    inHours: 4 * 24 + 2,
    status: "Ready to submit",
    docs: [
      { id: "g1", label: "OEM authorisation for 3D printer", done: true },
      { id: "g2", label: "Catalogue listed on GeM", done: true },
      { id: "g3", label: "Make in India declaration", done: true },
      { id: "g4", label: "Bid document signed with DSC", done: true },
    ],
  },
  {
    id: "PMSHRI/PAT/ML/09",
    dept: "District Education Office, Patna (PM SHRI)",
    title: "Maths labs for 86 PM SHRI schools",
    portal: "eproc2.bihar.gov.in",
    value: 7400000,
    emd: 150000,
    emdMode: "Online, ICICI",
    inHours: 18 * 24,
    status: "Pre-bid query",
    docs: [
      { id: "p1", label: "Pre-bid queries submitted", done: true },
      { id: "p2", label: "Sample photographs, 12 items", done: false },
      { id: "p3", label: "Turnover certificate", done: false },
    ],
  },
  {
    id: "DEO/NAL/MC/22",
    dept: "District Education Office, Nalanda",
    title: "Montessori corners in 60 primary schools",
    portal: "eproc2.bihar.gov.in",
    value: 4200000,
    emd: 84000,
    emdMode: "Online, paid 2 Oct",
    inHours: 0,
    status: "Technical eval",
    docs: [{ id: "n1", label: "Bid submitted 8 Oct", done: true }],
  },
  {
    id: "BRLPS/LIB/2026/07",
    dept: "Jeevika (BRLPS)",
    title: "Community library literacy kits, 350 clusters",
    portal: "jeevika.bihar.gov.in",
    value: 2800000,
    emd: 56000,
    emdMode: "Refund due on LoA",
    inHours: 0,
    status: "Won",
    docs: [{ id: "j1", label: "LoA received 3 Oct", done: true }],
  },
];

type Emd = { id: string; tender: string; amount: number; mode: string; since: string; days: number; state: "Locked" | "Refund due" | "Refunded" | "BG live" };
const emds: Emd[] = [
  { id: "EMD-1", tender: "Gaya DEO science corners (lost L2)", amount: 210000, mode: "Online", since: "2 Jun", days: 140, state: "Refund due" },
  { id: "EMD-2", tender: "Saran DEO science corners (won)", amount: 120000, mode: "DD", since: "18 Jul", days: 94, state: "Refund due" },
  { id: "EMD-3", tender: "Nalanda Montessori corners", amount: 84000, mode: "Online", since: "2 Oct", days: 18, state: "Locked" },
  { id: "EMD-4", tender: "Jeevika library kits (won)", amount: 56000, mode: "Online", since: "11 Sep", days: 39, state: "Refund due" },
  { id: "EMD-5", tender: "BEPC science kits", amount: 540000, mode: "BG, SBI", since: "16 Oct", days: 4, state: "BG live" },
  { id: "EMD-6", tender: "Vaishali ICDS play kits (lost)", amount: 95000, mode: "Online", since: "14 Mar", days: 220, state: "Refunded" },
];

/* ---------------- Dues ---------------- */

type Due = { no: string; party: string; kind: "School" | "Govt" | "CSR"; amount: number; days: number; raised: string; promise?: string; contact: string };
const dues: Due[] = [
  { no: "GLK/26-27/188", party: "St. Xavier's High School, Bettiah", kind: "School", amount: 320000, days: 74, raised: "7 Aug", contact: "Fr. Joseph Tirkey" },
  { no: "GLK/26-27/203", party: "Saran DEO (science corners)", kind: "Govt", amount: 648000, days: 38, raised: "12 Sep", promise: "PFMS bill passed, credit by 30 Oct", contact: "DPO SSA, Chhapra" },
  { no: "GLK/26-27/171", party: "Holy Mission School, Hajipur", kind: "School", amount: 86000, days: 91, raised: "21 Jul", contact: "Mr. Thomas Minz" },
  { no: "GLK/26-27/210", party: "Mithila Public School, Darbhanga", kind: "School", amount: 323750, days: 6, raised: "14 Oct", promise: "70% on delivery", contact: "Sri Ajay Jha" },
  { no: "GLK/26-27/196", party: "Jeevika (BRLPS) cluster libraries", kind: "Govt", amount: 288000, days: 44, raised: "6 Sep", promise: "Bill at district office", contact: "DPM Nalanda" },
  { no: "GLK/26-27/152", party: "Bal Vikas Anganwadi project, Vaishali", kind: "Govt", amount: 316000, days: 118, raised: "23 Jun", contact: "CDPO Hajipur" },
  { no: "GLK/26-27/207", party: "Samastipur Model School", kind: "Govt", amount: 259200, days: 12, raised: "8 Oct", contact: "HM Smt. Kiran Kumari" },
  { no: "GLK/26-27/199", party: "Little Lotus Montessori", kind: "School", amount: 58320, days: 29, raised: "21 Sep", promise: "Balance on full delivery", contact: "Ms. Ritu Agarwal" },
  { no: "GLK/26-27/164", party: "Kosi Gramin Bank CSR (pilot)", kind: "CSR", amount: 98000, days: 66, raised: "15 Aug", promise: "Board meeting 28 Oct", contact: "Mr. P. N. Choudhary" },
  { no: "GLK/26-27/181", party: "Gyan Jyoti Public School, Ara", kind: "School", amount: 42500, days: 82, raised: "30 Jul", contact: "Mr. R. B. Singh" },
  { no: "GLK/26-27/205", party: "Rajgir Residential Academy (advance balance)", kind: "School", amount: 186000, days: 15, raised: "5 Oct", contact: "Mr. Vikram Prasad" },
  { no: "GLK/26-27/139", party: "Purnea DEO (Montessori pilot)", kind: "Govt", amount: 172000, days: 146, raised: "27 May", contact: "DEO office, Purnea" },
];

const agents: WorkforceAgent[] = [
  { name: "Voice Delegator", role: "Turns Vivek's voice notes into assigned, tracked tasks", icon: Mic, status: "Running", runsToday: 9, hoursSaved: 3.5, accuracy: 94, last: "just now", skills: ["Hindi + English", "Assignee detection", "WhatsApp"], schedule: "On every voice note", log: ["Parsed 3 tasks from 9:12 AM note", "Linked 'Gaya wala order' to GLK-2611", "Nudged Imran: Arduino count due tomorrow"] },
  { name: "Tender Watch", role: "Reads Bihar eProc and GeM daily, tracks every bid document", icon: Gavel, status: "Needs you", runsToday: 4, hoursSaved: 6, accuracy: 91, last: "12 min ago", skills: ["eProc", "GeM", "Doc checklist"], schedule: "6 AM and 6 PM", inbox: [{ title: "BEPC bid: 3 documents still open", detail: "Closes Thu 3 PM. CA certificate and the MSE affidavit need you today." }], log: ["Found PM SHRI maths labs tender, ₹74 L", "Corrigendum on ICDS: sample date moved to 28 Oct", "Flagged EMD refund 140 days at Gaya DEO"] },
  { name: "Dispatch Tracker", role: "Follows every LR, e-way bill and school delivery", icon: Truck, status: "Needs you", runsToday: 11, hoursSaved: 4, accuracy: 96, last: "3 min ago", skills: ["E-way bill", "Transporter calls", "POD photos"], schedule: "Every hour", inbox: [{ title: "EWB 1219 4471 8832 expires in 5 hours", detail: "Truck held at Muzaffarpur bypass. Part-B extension drafted, needs Rakesh to confirm vehicle." }], log: ["Samastipur consignment crossed Hajipur", "POD photo from Saran DEO filed", "Magadh Roadways confirmed Wed 7 AM pickup"] },
  { name: "Dues Collector", role: "Polite, persistent payment follow-ups with schools and offices", icon: IndianRupee, status: "Running", runsToday: 5, hoursSaved: 4.5, accuracy: 89, last: "40 min ago", skills: ["Tally", "WhatsApp", "PFMS status"], schedule: "Daily 11 AM", log: ["Saran DEO bill passed on PFMS", "Reminder 2 to Holy Mission Hajipur", "Logged Kosi Gramin Bank promise: 28 Oct"] },
  { name: "Trainer Scheduler", role: "Plans trainer routes so no one drives 300 km in a day", icon: GraduationCap, status: "Running", runsToday: 3, hoursSaved: 2.5, accuracy: 92, last: "1 h ago", skills: ["Route planning", "Load balance", "Feedback forms"], schedule: "Nightly 9 PM", log: ["Shabnam over capacity: 9 visits", "Suggested Ritesh for 3 Samastipur visits", "Sent feedback forms to 4 schools"] },
  { name: "Stock Planner", role: "Explodes open orders into BOM shortfalls and draft POs", icon: Package, status: "Idle", runsToday: 2, hoursSaved: 3, accuracy: 90, last: "2 h ago", skills: ["BOM", "Vendor quotes", "Tally PO"], schedule: "After every PO received", log: ["Arduino boards short by 17", "Pink tower cubes short by 20", "Compared 3 quotes, Circuitkart lowest at ₹1,920"] },
];

const independence: IndependenceData = {
  score: 38,
  history: [24, 26, 29, 31, 33, 36, 38],
  quote: "School principals still call me directly, because for ten years I was the only one who picked up. Now I want them to call Kavita.",
  pillars: [
    { name: "School sales", score: 44, note: "Kavita and Deepak run visits, but every discount above 3% comes to Vivek.", fixes: [{ title: "Discount bands by order size", gain: 3 }, { title: "Quote templates in Tally", gain: 2 }] },
    { name: "Tenders & govt", score: 27, note: "Only Vivek and Sunil can sign bids; DSC sits in Vivek's drawer.", fixes: [{ title: "Second authorised signatory", gain: 4 }, { title: "Tender Watch document checklist", gain: 2 }] },
    { name: "Assembly & stores", score: 49, note: "Manoj runs the floor well. Purchase over ₹25k still waits for Vivek.", fixes: [{ title: "Auto-approve repeat vendors under ₹40k", gain: 3 }] },
    { name: "Dispatch", score: 52, note: "Rakesh owns transporters. E-way bills are generated from Vivek's login.", fixes: [{ title: "Sub-user on EWB portal for Rakesh", gain: 3 }] },
    { name: "Training quality", score: 41, note: "Priyanka schedules, but nobody reads feedback forms until a complaint.", fixes: [{ title: "Weekly feedback digest", gain: 2 }, { title: "Retrain trigger under 3.5 stars", gain: 2 }] },
    { name: "Money & dues", score: 30, note: "₹28 L outstanding; govt bills need Vivek to visit district offices.", fixes: [{ title: "PFMS tracking by Neha", gain: 3 }, { title: "Daily dues agent", gain: 2 }] },
    { name: "Owner time", score: 33, note: "Vivek spends 11 hours a week on WhatsApp instructions to the team.", fixes: [{ title: "Voice notes become tracked tasks", gain: 4 }] },
  ],
  ownerHours: [
    { label: "Instructions", hours: 11 },
    { label: "Tender papers", hours: 9 },
    { label: "School calls", hours: 8 },
    { label: "Govt offices", hours: 6 },
    { label: "Approvals", hours: 5 },
    { label: "Floor rounds", hours: 3 },
    { label: "New kits R&D", hours: 1 },
  ],
};

const integrations: Integration[] = [
  { name: "Tally Prime", category: "Accounts", status: "Connected", detail: "Sales invoices, POs, school ledgers and GST.", synced: "8 min ago", records: "9,412 vouchers", mark: "T", color: "#1c4f9c" },
  { name: "WhatsApp Business", category: "Messaging", status: "Connected", detail: "Voice notes in, tasks out, school reminders.", synced: "just now", records: "1,860 chats", mark: "W", color: "#1f9d55" },
  { name: "Bihar e-Procurement", category: "Tenders", status: "Syncing", detail: "eproc2.bihar.gov.in bids, corrigenda and results.", synced: "6:00 AM", records: "38 tenders watched", mark: "eP", color: "#8a5a1c" },
  { name: "GeM", category: "Tenders", status: "Connected", detail: "Catalogue, bids and orders on Government e-Marketplace.", synced: "1 h ago", records: "14 listings", mark: "G", color: "#e46b1f" },
  { name: "E-way bill (NIC)", category: "Logistics", status: "Error", detail: "API session expired. Part-B updates paused until re-login.", synced: "yesterday", records: "212 bills", mark: "EW", color: "#b5452f" },
  { name: "PFMS", category: "Govt payments", status: "Connected", detail: "Bill status for DEO, ICDS and Jeevika payments.", synced: "11:02 AM", records: "23 bills", mark: "PF", color: "#2c5e3f" },
  { name: "Google Sheets", category: "Planning", status: "Connected", detail: "Trainer calendar and the old school master sheet.", synced: "30 min ago", records: "6 sheets", mark: "GS", color: "#0f9d58" },
  { name: "Gmail", category: "Messaging", status: "Connected", detail: "School POs, tender emails and transporter LRs.", synced: "15 min ago", records: "1,120 threads", mark: "M", color: "#ea4335" },
  { name: "Razorpay", category: "Payments", status: "Available", detail: "UPI links for small schools paying advances.", synced: "—", records: "—", mark: "R", color: "#2563eb" },
];

/* ============================================================
   Config
   ============================================================ */

const baseConfig: Omit<DeskConfig, "signature" | "homeExtras"> = {
  slug: "learning-kits",
  company: "Ganga Learning Kits",
  brand: "Ganga",
  city: "Patna",
  state: "BR",
  icon: Blocks,
  tagline: "STEM and Montessori kits for 420 schools and 3 govt programmes across Bihar",
  owner: { name: "Vivek Ranjan Sinha", first: "Vivek", initials: "VS", role: "Founder & MD" },
  theme: {
    variant: "inbox",
    paper: "#f3f1e7",
    panel: "#fffdf6",
    sunk: "#e9e6d8",
    ink: "#18271d",
    mute: "#5d6a5f",
    line: "#dcd8c6",
    accent: "#2c5e3f",
    accentInk: "#fff8dc",
    soft: "#e2ece1",
    ok: "#2f8a5e",
    warn: "#b98a22",
    late: "#b4452f",
    info: "#3a6b8c",
    heading: "display",
    radius: 16,
  },
  brief:
    "The BEPC science-kit bid closes Thursday at 3 PM and still needs your signature on the MSE affidavit plus the CA certificate. DAV Bodh Gaya's ₹7.4 L order is packed and can leave tomorrow; the Darbhanga truck's e-way bill expires in five hours.",
  pulse: [
    { label: "Open school orders", value: "₹38.7 L", delta: "+9%", trend: [28, 30, 31, 33, 35, 36, 38.7], module: "orders" },
    { label: "Kits assembled today", value: "58", delta: "+12", trend: [10, 18, 27, 34, 42, 51, 58], tone: "ok", module: "assembly" },
    { label: "Consignments moving", value: "5", delta: "1 held", good: false, trend: [3, 4, 4, 5, 6, 5, 5], tone: "warn", module: "dispatch" },
    { label: "Tender pipeline", value: "₹6.5 Cr", delta: "+₹74 L", trend: [4.1, 4.4, 5.0, 5.2, 5.8, 5.8, 6.5], tone: "info", module: "tenders" },
    { label: "Dues outstanding", value: "₹27.9 L", delta: "+4%", good: false, trend: [24, 25, 25, 26, 27, 27, 27.9], tone: "late", module: "payments" },
  ],
  decisions: [
    { id: "d1", kind: "Risk", from: "Tender Watch", title: "BEPC science-kit bid closes in 52 hours, 3 documents open", context: "CA turnover certificate, MSE affidavit and the price BoQ are pending. Everything else is uploaded on eProc.", recommendation: "Sign the affidavit at 11 and ask Sinha & Associates for the certificate by 6 PM. Sunil uploads Wednesday night.", impact: "₹2.68 Cr", module: "tenders", approveLabel: "Sign & assign Sunil" },
    { id: "d2", kind: "Approve", from: "Kavita Singh", title: "DAV Bodh Gaya PO: 40 STEM Junior kits", context: "30% advance (₹2.22 L) received on UPI. Batch B-118 is 34 of 40 packed.", recommendation: "Accept and dispatch Wednesday 7 AM with Magadh Roadways. E-way bill auto-generated tonight.", impact: "₹7.4 L", module: "orders", approveLabel: "Accept PO" },
    { id: "d3", kind: "Risk", from: "Dispatch Tracker", title: "Darbhanga truck held, e-way bill expires in 5 hours", context: "Tirhut Transport's truck broke down at Muzaffarpur bypass with 25 STEM kits for Mithila Public School.", recommendation: "Extend EWB by one day with the replacement vehicle BR06 GC 2291 and message Sri Ajay Jha with the new ETA.", impact: "₹4.6 L", module: "dispatch", approveLabel: "Extend & inform school" },
    { id: "d4", kind: "Money", from: "Neha Agarwal", title: "ICDS ECCE tender EMD of ₹6 L", context: "Paying from the OD account leaves ₹4.1 L headroom before the Diwali salary run.", recommendation: "Use a bank guarantee from SBI Gandhi Maidan instead. BG fee about ₹9,000, cash stays free.", impact: "₹6 L", module: "tenders", approveLabel: "Go with BG" },
    { id: "d5", kind: "Approve", from: "Stock Planner", title: "PO for 20 Arduino boards from Circuitkart", context: "Rajgir needs 15 robotics kits; store has 18 boards against 35 needed across orders.", recommendation: "Approve ₹38,400. Lowest of three quotes and 4-day delivery keeps the Rajgir date.", impact: "₹38,400", module: "assembly", approveLabel: "Approve PO" },
    { id: "d6", kind: "People", from: "Trainer Scheduler", title: "Shabnam has 7 visits this week, Ritesh has 3", context: "Five of Shabnam's visits are in Samastipur and Muzaffarpur; she drove 240 km on Monday.", recommendation: "Move Kalyanpur and Tajpur visits to Ritesh. Shabnam keeps Muzaffarpur.", module: "trainers", approveLabel: "Rebalance" },
    { id: "d7", kind: "Money", from: "Dues Collector", title: "St. Xavier's Bettiah: ₹3.2 L overdue 74 days", context: "Three reminders sent. The school collects term fees on 25 Oct.", recommendation: "Send a reminder on 24 Oct and offer 2% off for payment by 31 Oct.", impact: "₹3.2 L", module: "payments", approveLabel: "Schedule reminder" },
    { id: "d8", kind: "Reply", from: "WhatsApp, Sr. Mary Kujur", title: "Notre Dame Munger wants a Saturday demo", context: "Their board meets on Monday; 8 robotics kits worth ₹1.98 L depend on it.", recommendation: "Confirm Amit for Saturday 11 AM. He is in Bhagalpur Friday, 60 km away.", module: "trainers", approveLabel: "Confirm demo" },
  ],
  agenda: [
    { at: 9.5, title: "Assembly huddle", detail: "B-119 blocked, B-118 packing", tone: "warn", module: "assembly" },
    { at: 11, title: "BEPC bid papers with Sunil", detail: "3 documents open, closes Thu 3 PM", count: 3, tone: "late", module: "tenders" },
    { at: 12.5, title: "Approvals window", detail: "DAV PO, Arduino PO, EMD route", count: 3, tone: "info", module: "orders" },
    { at: 14, title: "Trainer week review", detail: "16 visits, Shabnam overloaded", count: 16, tone: "accent", module: "trainers" },
    { at: 16, title: "Dues call with Neha", detail: "12 invoices, 4 above 90 days", count: 12, tone: "late", module: "payments" },
    { at: 18, title: "Dispatch close", detail: "Gaya load-out and Darbhanga recovery", tone: "ok", module: "dispatch" },
  ],
  activity: [
    { time: "11:42 AM", text: "Voice Delegator assigned 3 tasks from your 9:12 note", tone: "info" },
    { time: "11:20 AM", text: "Saran DEO bill passed on PFMS: ₹6.48 L credit expected 30 Oct", tone: "ok" },
    { time: "10:55 AM", text: "Darbhanga truck reported breakdown at Muzaffarpur bypass", tone: "late" },
    { time: "10:31 AM", text: "Bhagalpur Mission School demo rated 5 stars", tone: "ok" },
    { time: "10:02 AM", text: "Corrigendum: ICDS sample date moved to 28 Oct", tone: "warn" },
    { time: "9:15 AM", text: "Shakti Scientific magnets received, GRN posted in Tally", tone: "neutral" },
  ],
  asks: [
    { q: "What do I need to sign for the BEPC bid?", a: "Two things, both today:\n\n• MSE affidavit on ₹100 stamp paper (drafted, with Sunil)\n• Authorisation letter for Sunil to upload with the company DSC\n\nThe CA turnover certificate is with Sinha & Associates, promised by 6 PM. The price BoQ is ready but waits on your final rate: ₹21,150 per kit keeps us 4% under last year's L1.", sources: ["Tender Watch checklist", "eProc bid page", "Last year's BEPC result"] },
    { q: "Which school orders are stuck and why?", a: "Three orders are stuck:\n\n• Little Lotus Montessori (6 sensorial sets): pink tower cubes short by 20, Saharanpur lot arrives Friday.\n• Rajgir Residential Academy (15 robotics kits): 18 Arduino boards in store vs 35 needed. PO for 20 boards waits on you.\n• Mithila Public School (25 STEM kits): truck broke down, e-way bill expires in 5 hours.\n\nEverything else is moving to plan.", sources: ["School orders", "Assembly batches", "Dispatch Tracker"] },
    { q: "How much money is stuck with schools and govt offices?", a: "₹27.9 L across 12 invoices.\n\n• Govt: ₹16.8 L. Saran DEO ₹6.48 L is passed on PFMS. Vaishali Anganwadi (₹3.16 L, 118 days) and Purnea DEO (₹1.72 L, 146 days) need a visit.\n• Schools: ₹10.2 L. St. Xavier's Bettiah ₹3.2 L is the biggest; they collect fees on 25 Oct.\n• CSR: ₹98,000 from Kosi Gramin Bank, board meeting 28 Oct.\n\nPlus ₹3.86 L of EMD waiting for refund.", sources: ["Tally ledgers", "PFMS", "EMD tracker"] },
    { q: "Is any trainer overloaded this week?", a: "Shabnam Parveen has 7 visits, 5 of them in Samastipur and Muzaffarpur, and she drove 240 km on Monday. Ritesh has 3.\n\nMove Kalyanpur UMS (Thu) and Tajpur Girls High (Wed) to Ritesh; both are on his Patna–Samastipur route. Average rating this month is 4.3 stars; St. Xavier's gave 3 and asked for a retraining.", sources: ["Trainer calendar", "Feedback forms"] },
    { q: "What did I delegate this morning?", a: "From your 9:12 AM voice note, three tasks went out on WhatsApp:\n\n• Rakesh: dispatch DAV Bodh Gaya kits by tomorrow (seen)\n• Priyanka: shift the Muzaffarpur visit to Thursday (in progress)\n• Sunil: BEPC documents by 6 PM (sent)\n\nTwo older tasks are done: the Danapur tempo and the Varnamala print order.", sources: ["Voice Delegator log", "WhatsApp read receipts"] },
    { q: "Draft a reply to Notre Dame Munger", a: "Draft (not sent):\n\n“Namaste Sister Mary, thank you for the interest. Our trainer Amit Kumar Mandal will come on Saturday 24 Oct at 11 AM with two Robotics Starter kits for a live demo with your Class 7 students. The board can see the line-following robot and the hydraulic arm. Please keep a projector ready. Regards, Vivek Sinha, Ganga Learning Kits”", sources: ["Trainer calendar", "Order GLK-2622"] },
  ],
  run: {
    label: "Runs every morning at 7. You can also run it now.",
    title: "Morning Planner",
    steps: [
      { text: "Read 15 school orders and 7 assembly batches", result: "3 orders blocked, 2 on parts" },
      { text: "Check BOM against store for open orders", result: "Arduino boards short 17, pink tower cubes short 20" },
      { text: "Scan Bihar eProc and GeM for bids and corrigenda", result: "1 new tender, 1 corrigendum, BEPC 52 h left" },
      { text: "Track 12 consignments and e-way bills", result: "1 EWB expiring in 5 h, 2 deliveries today" },
      { text: "Balance trainer visits by route", result: "Shabnam 7, Ritesh 3: 2 visits to move" },
    ],
    outcome: "Approve the Arduino PO and sign the BEPC affidavit before noon. Extend the Darbhanga e-way bill now. Move two Samastipur visits to Ritesh so Shabnam can cover Muzaffarpur.",
    actions: ["Approve Arduino PO", "Extend Darbhanga EWB", "Move 2 visits to Ritesh", "Send BEPC checklist to Sunil"],
  },
};

/* ============================================================
   Desk
   ============================================================ */

export default function LearningKitsDesk() {
  const [orders, setOrders] = React.useState(seedOrders);
  const [assigned, setAssigned] = React.useState(seedAssigned);
  const [tenders, setTenders] = React.useState(seedTenders);
  const [batches, setBatches] = React.useState(seedBatches);
  const [consignments, setConsignments] = React.useState(seedConsignments);

  const config: DeskConfig = {
    ...baseConfig,
    signature: {
      title: "Voice delegator",
      sub: "Hold the mic, speak the way you would on WhatsApp. Ganga turns it into assigned tasks linked to orders.",
      module: "team",
      render: () => <VoiceDelegator assigned={assigned} setAssigned={setAssigned} />,
    },
    homeExtras: () => <HomeExtras tenders={tenders} batches={batches} assigned={assigned} />,
  };

  const modules: DeskModule[] = [
    { id: "orders", group: "Sales", label: "School orders", count: orders.filter((o) => o.stage === "PO received").length, title: "School orders", blurb: "Every school from first enquiry to delivered kits. Drag a card to move it along.", icon: School, render: () => <OrdersModule orders={orders} setOrders={setOrders} /> },
    { id: "tenders", group: "Sales", label: "Tenders & govt", count: tenders.filter((t) => t.inHours > 0).length, title: "Tenders & government", blurb: "Bid deadlines, EMD money and every document a department asks for", icon: Gavel, render: () => <TendersModule tenders={tenders} setTenders={setTenders} /> },
    { id: "payments", group: "Sales", label: "Payments", count: dues.filter((d) => d.days > 60).length, title: "Payments", blurb: "School fees season, PFMS bills and EMD refunds, aged and chased", icon: HandCoins, render: () => <PaymentsModule /> },
    { id: "assembly", group: "Operations", label: "Kit assembly", count: batches.filter((b) => b.blocked).length, title: "Kit assembly", blurb: "Bill of materials per kit and the five-station assembly line at Patliputra Industrial Area", icon: Blocks, render: () => <AssemblyModule batches={batches} setBatches={setBatches} orders={orders} /> },
    { id: "dispatch", group: "Operations", label: "Dispatch", count: consignments.filter((c) => c.status === "Held").length, title: "Dispatch", blurb: "District by district: transporters, LRs and e-way bills", icon: Truck, render: () => <DispatchModule consignments={consignments} setConsignments={setConsignments} /> },
    { id: "trainers", group: "Operations", label: "Trainers & visits", count: seedVisits.filter((v) => v.day === TODAY_IX && v.status === "Planned").length, title: "Trainers & visits", blurb: "Teacher training and demos across Bihar. Drag a visit to another trainer or day.", icon: GraduationCap, render: () => <TrainersModule /> },
    { id: "team", group: "Team & AI", label: "People", title: "People", blurb: "Who is carrying what today, from the assembly floor to the district offices", icon: Users, render: () => <PeopleModule members={team} /> },
    { id: "agents", group: "Team & AI", label: "Agents", title: "Agents", blurb: "Six AI agents doing the chasing so Vivek doesn't have to", icon: Bot, render: () => <AgentsModule agents={agents} /> },
    { id: "independence", group: "Team & AI", label: "Independence", title: "Owner independence", blurb: "How much of Ganga runs without Vivek on the phone", icon: GaugeIcon, render: () => <IndependenceModule data={independence} /> },
    { id: "connections", group: "Team & AI", label: "Connections", title: "Connections", blurb: "Tally, WhatsApp, Bihar eProc, GeM, e-way bills and PFMS", icon: Plug, render: () => <ConnectionsModule items={integrations} /> },
  ];

  return <DeskShell config={config} modules={modules} />;
}

/* ============================================================
   Signature: Voice delegator
   ============================================================ */

const CHALK = "#1e3a2a";
const CHALK_YELLOW = "#e8c45a";

function highlight(text: string, keys: string[]) {
  if (!keys.length) return [text];
  const esc = keys.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).sort((a, b) => b.length - a.length);
  const re = new RegExp(`(${esc.join("|")})`, "g");
  return text.split(re).map((part, i) =>
    keys.includes(part) ? (
      <span key={`${part}-${i}`} className="rounded-[4px] px-0.5" style={{ color: CHALK_YELLOW, background: "rgba(232,196,90,0.12)" }}>
        {part}
      </span>
    ) : (
      <React.Fragment key={`t-${i}`}>{part}</React.Fragment>
    ),
  );
}

function VoiceDelegator({ assigned, setAssigned }: { assigned: Assigned[]; setAssigned: React.Dispatch<React.SetStateAction<Assigned[]>> }) {
  const desk = useDesk();
  const [phase, setPhase] = React.useState<"idle" | "rec" | "parsing" | "review">("idle");
  const [noteIx, setNoteIx] = React.useState(0);
  const [used, setUsed] = React.useState(false);
  const [typed, setTyped] = React.useState(0);
  const [tick, setTick] = React.useState(0);
  const [drafts, setDrafts] = React.useState<Draft[]>([]);
  const [filter, setFilter] = React.useState<"Open" | "All">("Open");
  const downAt = React.useRef(0);
  const seq = React.useRef(45);
  const note = voiceNotes[noteIx];

  React.useEffect(() => {
    if (phase !== "rec") return;
    const id = window.setInterval(() => {
      setTick((t) => t + 1);
      setTyped((n) => Math.min(note.text.length, n + 2));
    }, 60);
    return () => window.clearInterval(id);
  }, [phase, note.text.length]);

  React.useEffect(() => {
    if (phase !== "rec" || typed < note.text.length) return;
    const id = window.setTimeout(() => setPhase("parsing"), 450);
    return () => window.clearTimeout(id);
  }, [phase, typed, note.text.length]);

  React.useEffect(() => {
    if (phase !== "parsing") return;
    const id = window.setTimeout(() => {
      setDrafts(note.drafts.map((d) => ({ ...d, id: `T-${seq.current++}` })));
      setPhase("review");
      desk.log(`Voice note parsed into ${note.drafts.length} tasks`, "info");
    }, 1400);
    return () => window.clearTimeout(id);
  }, [phase, note, desk]);

  function start(e: React.PointerEvent) {
    downAt.current = e.timeStamp;
    if (phase === "rec") {
      stop();
      return;
    }
    if (phase === "parsing") return;
    if (used) setNoteIx((i) => (i + 1) % voiceNotes.length);
    setUsed(true);
    setDrafts([]);
    setTyped(0);
    setTick(0);
    setPhase("rec");
  }
  function release(e: React.PointerEvent) {
    // a long press behaves like hold-to-talk; a quick tap keeps recording until the next tap
    if (phase === "rec" && e.timeStamp - downAt.current > 650) stop();
  }
  function stop() {
    setTyped(note.text.length);
    setPhase("parsing");
  }

  function assign(list: Draft[]) {
    if (!list.length) return;
    const at = clockLabel(new Date());
    setAssigned((cur) => [...list.map((d) => ({ ...d, status: "Sent" as const, at, via: "Voice" as const })), ...cur]);
    setDrafts((cur) => cur.filter((d) => !list.some((x) => x.id === d.id)));
    list.forEach((d) => desk.log(`Assigned to ${first(d.who)}: ${d.title}`, "ok"));
    toast.success(list.length === 1 ? `Sent to ${first(list[0].who)} on WhatsApp` : `${list.length} tasks sent on WhatsApp`, { description: list.map((d) => `${first(d.who)} · ${d.due}`).join("  ·  ") });
  }
  const edit = (id: string, patch: Partial<Draft>) => setDrafts((cur) => cur.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  const cycle: Record<TaskStatus, TaskStatus> = { Sent: "Seen", Seen: "In progress", "In progress": "Done", Done: "Sent" };
  const statusTone: Record<TaskStatus, Tone> = { Sent: "neutral", Seen: "info", "In progress": "warn", Done: "ok" };

  const recording = phase === "rec";
  const secs = (tick * 0.06).toFixed(1);
  const shownTasks = assigned.filter((t) => filter === "All" || t.status !== "Done");
  const orderOptions = [...seedOrders.map((o) => o.id), "BEPC/SS/2026-27/14", "ICDS/ECCE/2026/03", "—"];

  return (
    <div className="space-y-5">
      {/* chalkboard */}
      <div className="relative overflow-hidden rounded-[16px] p-5 text-[#f4efd8]" style={{ background: `radial-gradient(120% 90% at 20% 0%, #2a4d38 0%, ${CHALK} 60%, #17301f 100%)`, boxShadow: "inset 0 0 0 6px #5b3d24, inset 0 0 0 8px #3e2916" }}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(#fff 0.8px, transparent 0.8px)", backgroundSize: "7px 7px" }} />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center">
          <div className="flex shrink-0 flex-col items-center gap-2">
            <button
              type="button"
              onPointerDown={start}
              onPointerUp={release}
              onPointerLeave={(e) => recording && e.buttons === 1 && release(e)}
              aria-label={recording ? "Stop recording" : "Hold to record"}
              className="relative flex h-[104px] w-[104px] touch-none select-none items-center justify-center rounded-full transition-transform active:scale-95"
              style={{ background: recording ? "#c2412d" : CHALK_YELLOW, color: recording ? "#fff" : CHALK, boxShadow: recording ? "0 0 0 10px rgba(194,65,45,0.25), 0 0 0 22px rgba(194,65,45,0.1)" : "0 10px 30px -10px rgba(0,0,0,0.6)" }}
            >
              {recording && <span className="bb-pulse absolute inset-0 rounded-full border-2 border-white/50" />}
              <Mic className="h-10 w-10" strokeWidth={2} />
            </button>
            <p className="font-mono text-[12px] text-[#f4efd8]/80">{recording ? `● REC ${secs}s` : phase === "parsing" ? "Samajh raha hai…" : "Hold to speak"}</p>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex h-[64px] items-center gap-[3px]">
              {Array.from({ length: 64 }, (_, i) => {
                const h = recording ? 12 + 84 * Math.abs(Math.sin(i * 0.55 + tick * 0.62)) * (0.4 + 0.6 * Math.abs(Math.sin(i * 0.17 - tick * 0.21))) : phase === "parsing" ? 18 + 30 * Math.abs(Math.sin(i * 0.3)) : 6 + 6 * Math.abs(Math.sin(i * 0.9));
                return <span key={i} className="flex-1 rounded-full transition-[height] duration-100" style={{ height: `${h}%`, background: recording ? (i % 9 === 0 ? CHALK_YELLOW : "#f4efd8") : "rgba(244,239,216,0.35)" }} />;
              })}
            </div>
            <div className="mt-3 min-h-[92px] rounded-[10px] border border-white/10 bg-black/15 px-4 py-3">
              {phase === "idle" && !used ? (
                <p className="desk-serif text-[16px] leading-relaxed text-[#f4efd8]/60">
                  Try it: hold the mic. A sample note plays, like <span style={{ color: CHALK_YELLOW }}>“Rakesh, Gaya wale school ka order kal tak dispatch karo…”</span>
                </p>
              ) : (
                <p className="desk-serif text-[16.5px] leading-relaxed">
                  {highlight(note.text.slice(0, typed), note.keys)}
                  {(recording || phase === "idle") && <span className="bb-blink ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-[#f4efd8]" />}
                </p>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11.5px] text-[#f4efd8]/70">
              <span className="rounded-full border border-white/15 px-2 py-0.5">Hindi + English</span>
              <span className="rounded-full border border-white/15 px-2 py-0.5">Names, schools, dates detected</span>
              {phase === "parsing" && <span className="desk-shimmer rounded-full px-2 py-0.5 text-[#f4efd8]">Parsing into tasks…</span>}
              {phase === "review" && <span className="rounded-full px-2 py-0.5 font-semibold" style={{ background: CHALK_YELLOW, color: CHALK }}>{drafts.length} tasks found</span>}
            </div>
          </div>
        </div>
      </div>

      {/* drafts */}
      {(phase === "parsing" || drafts.length > 0) && (
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[13px] font-semibold">Parsed tasks · check and assign</p>
            {drafts.length > 1 && (
              <Btn size="sm" variant="solid" icon={Send} onClick={() => assign(drafts)}>
                Assign all {drafts.length}
              </Btn>
            )}
          </div>
          <div className="space-y-2.5">
            {phase === "parsing" &&
              [0, 1, 2].map((i) => <div key={i} className="desk-shimmer h-[86px] rounded-[14px] border border-d-line" />)}
            {drafts.map((d, i) => (
              <div key={d.id} className="desk-rise rounded-[14px] border border-d-line bg-d-panel p-3" style={{ borderLeft: `4px solid ${CHALK_YELLOW}`, animationDelay: `${i * 90}ms` }}>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-d-mute">{d.id}</span>
                  <input className="h-8 min-w-0 flex-1 rounded-[8px] border border-transparent bg-transparent px-1.5 text-[14px] font-semibold outline-none hover:border-d-line focus:border-d-accent" value={d.title} onChange={(e) => edit(d.id, { title: e.target.value })} />
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-[1.2fr_1fr_1fr_auto]">
                  <select className={`${inputClass} h-9 text-[13px]`} value={d.who} onChange={(e) => edit(d.id, { who: e.target.value })} aria-label="Assignee">
                    {people.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <select className={`${inputClass} h-9 text-[13px]`} value={d.due} onChange={(e) => edit(d.id, { due: e.target.value })} aria-label="Due">
                    {dueOptions.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                  <select className={`${inputClass} h-9 font-mono text-[12px]`} value={d.order} onChange={(e) => edit(d.id, { order: e.target.value })} aria-label="Linked order">
                    {orderOptions.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                  <div className="flex gap-1.5">
                    <Btn size="sm" variant="ghost" icon={Trash} aria-label="Discard" onClick={() => setDrafts((cur) => cur.filter((x) => x.id !== d.id))} />
                    <Btn size="sm" variant="solid" icon={Check} onClick={() => assign([d])}>
                      Assign
                    </Btn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* assigned list */}
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[13px] font-semibold">
            Delegated today <span className="font-normal text-d-mute">· {assigned.filter((t) => t.status === "Done").length} of {assigned.length} done · tap a status to move it</span>
          </p>
          <Segmented size="sm" options={["Open", "All"] as const} value={filter} onChange={setFilter} />
        </div>
        <ul className="divide-y divide-d-line rounded-[14px] border border-d-line">
          {shownTasks.map((t) => (
            <li key={t.id} className="desk-rise flex flex-wrap items-center gap-3 px-3 py-2.5">
              <Avatar name={t.who} size={30} tone={statusTone[t.status] === "neutral" ? "accent" : statusTone[t.status]} />
              <div className="min-w-0 flex-1">
                <p className={`truncate text-[13.5px] font-medium ${t.status === "Done" ? "text-d-mute line-through" : ""}`}>{t.title}</p>
                <p className="truncate text-[11.5px] text-d-mute">
                  {first(t.who)} · due {t.due} · {t.via === "Voice" ? "from voice note" : "typed"} at {t.at}
                </p>
              </div>
              <span className="hidden font-mono text-[11px] text-d-mute sm:inline">{t.order}</span>
              <button
                type="button"
                onClick={() => {
                  const nextStatus = cycle[t.status];
                  setAssigned((cur) => cur.map((x) => (x.id === t.id ? { ...x, status: nextStatus } : x)));
                  desk.log(`${first(t.who)}: ${t.title} → ${nextStatus}`, nextStatus === "Done" ? "ok" : "info");
                  if (nextStatus === "Done") toast.success(`${first(t.who)} finished a task`, { description: t.title });
                }}
              >
                <Pill tone={statusTone[t.status]}>
                  {t.status === "Done" && <CheckCheck className="h-3 w-3" />}
                  {t.status}
                </Pill>
              </button>
            </li>
          ))}
          {shownTasks.length === 0 && <li className="px-3 py-6 text-center text-[13px] text-d-mute">Everything delegated today is done.</li>}
        </ul>
      </div>
    </div>
  );
}

/* ---------------- Inbox extras ---------------- */

function HomeExtras({ tenders, batches, assigned }: { tenders: Tender[]; batches: Batch[]; assigned: Assigned[] }) {
  const desk = useDesk();
  const kitsToday = useDrift(58, 1.2, 3200);
  const live = tenders.filter((t) => t.inHours > 0).sort((a, b) => a.inHours - b.inHours);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Kits assembled today" value={Math.round(kitsToday)} delta="+12" hint="target 72" icon={Blocks} tone="ok" trend={[10, 18, 27, 34, 42, 51, kitsToday]} />
        <Stat label="Tasks delegated" value={assigned.length} delta={`+${Math.max(0, assigned.length - 4)}`} hint={`${assigned.filter((t) => t.status === "Done").length} done`} icon={Mic} trend={[2, 3, 5, 4, 6, 7, assigned.length]} />
        <Stat label="Schools served this year" value="418" delta="+37" hint="31 of 38 districts" icon={School} tone="info" trend={[310, 332, 350, 369, 388, 401, 418]} />
        <Stat label="Average trainer rating" value="4.3★" delta="-0.1" hint="1 retrain request" icon={Star} tone="warn" trend={[4.5, 4.4, 4.4, 4.5, 4.3, 4.4, 4.3]} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel icon={Gavel} title="Bid clock" sub="Bihar eProc and GeM deadlines" action={<Btn size="sm" icon={ArrowRight} onClick={() => desk.goTab("tenders")}>Tenders</Btn>}>
          <ul className="space-y-3">
            {live.slice(0, 3).map((t) => {
              const done = t.docs.filter((d) => d.done).length;
              return (
                <li key={t.id} className="rounded-[12px] border border-d-line p-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[13.5px] font-semibold">{t.title}</p>
                    <span className="shrink-0 font-mono text-[12px] font-semibold" style={{ color: t.inHours < 72 ? "var(--d-late)" : "var(--d-ink)" }}>
                      <Countdown compact inHours={t.inHours} />
                    </span>
                  </div>
                  <p className="truncate text-[12px] text-d-mute">
                    {t.dept} · {inr(t.value, { compact: true })}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Meter value={done} max={t.docs.length} tone={done === t.docs.length ? "ok" : "warn"} />
                    <span className="shrink-0 font-mono text-[11px] text-d-mute">
                      {done}/{t.docs.length} docs
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
        <Panel icon={Blocks} title="On the line now" sub="Seven batches, five stations" action={<Btn size="sm" icon={ArrowRight} onClick={() => desk.goTab("assembly")}>Assembly</Btn>}>
          <ul className="space-y-2.5">
            {batches.slice(0, 5).map((b) => (
              <li key={b.id}>
                <div className="flex items-center justify-between gap-2 text-[12.5px]">
                  <span className="truncate">
                    <b className="font-mono">{b.id}</b> {kitById(b.kit).name} · {b.station}
                  </span>
                  <span className="shrink-0 font-mono text-d-mute">
                    {b.done}/{b.qty}
                  </span>
                </div>
                <Meter className="mt-1" value={b.done} max={b.qty} tone={b.blocked ? "late" : b.done === b.qty ? "ok" : "accent"} />
                {b.blocked && <p className="mt-0.5 text-[11.5px] text-d-late">{b.blocked}</p>}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <Panel icon={Users} title="Who is carrying what" sub="Open tasks per person, from voice notes and typed instructions" action={<Btn size="sm" icon={ArrowRight} onClick={() => desk.goTab("team")}>People</Btn>}>
        <div className="grid gap-5 md:grid-cols-[1fr_1fr]">
          <HBars
            max={6}
            format={(v) => `${v} open`}
            data={team
              .slice(1)
              .map((m) => ({ label: m.name, value: m.tasks.filter((t) => !t.done).length + assigned.filter((t) => t.who === m.name && t.status !== "Done").length, tone: (m.load > 85 ? "late" : m.load > 70 ? "warn" : "accent") as Tone }))
              .sort((a, b) => b.value - a.value)}
          />
          <div className="rounded-[14px] p-4 text-[#f4efd8]" style={{ background: CHALK }}>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#f4efd8]/60">This week by voice</p>
            <p className="desk-h mt-1 text-[34px] font-semibold leading-none" style={{ color: CHALK_YELLOW }}>
              {23 + assigned.length} tasks
            </p>
            <p className="mt-2 text-[13px] leading-snug text-[#f4efd8]/80">from 9 voice notes, average 41 seconds each. That replaced roughly 3.5 hours of WhatsApp typing and follow-up calls.</p>
            <div className="mt-3 flex h-10 items-end gap-1">
              {[3, 5, 2, 6, 4, 7, assigned.length].map((v, i) => (
                <span key={i} className="desk-grow flex-1 rounded-t-[3px]" style={{ height: `${(v / 8) * 100}%`, background: i === 6 ? CHALK_YELLOW : "rgba(244,239,216,0.35)", animationDelay: `${i * 40}ms` }} />
              ))}
            </div>
            <p className="mt-1 flex justify-between font-mono text-[10px] text-[#f4efd8]/50">
              {["W", "T", "F", "S", "S", "M", "T"].map((d, i) => (
                <span key={`${d}-${i}`}>{d}</span>
              ))}
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}

/* ============================================================
   School orders
   ============================================================ */

const stageTone: Record<OrderStage, Tone> = { Enquiry: "neutral", "Demo done": "info", "Quote sent": "warn", "PO received": "accent", "In assembly": "accent", Dispatched: "ok" };

function OrdersModule({ orders, setOrders }: { orders: SchoolOrder[]; setOrders: React.Dispatch<React.SetStateAction<SchoolOrder[]>> }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);
  const [kind, setKind] = React.useState<"All" | SchoolOrder["kind"]>("All");
  const order = orders.find((o) => o.id === open) ?? null;
  const shown = orders.filter((o) => kind === "All" || o.kind === kind);
  const pipeline = orders.filter((o) => o.stage !== "Dispatched").reduce((a, o) => a + orderValue(o), 0);
  const won = orders.filter((o) => ["PO received", "In assembly", "Dispatched"].includes(o.stage));

  function move(id: string, stage: OrderStage) {
    const o = orders.find((x) => x.id === id);
    if (!o || o.stage === stage) return;
    setOrders((cur) => cur.map((x) => (x.id === id ? { ...x, stage } : x)));
    toast.success(`${o.school.split(",")[0]} → ${stage}`, { description: `${o.qty} × ${kitById(o.kit).name} · ${inr(orderValue(o), { compact: true })}` });
    desk.log(`${o.id} moved to ${stage}`, stage === "PO received" ? "ok" : "info");
  }

  const byDistrict = Object.entries(orders.reduce<Record<string, number>>((acc, o) => ({ ...acc, [o.district]: (acc[o.district] ?? 0) + orderValue(o) }), {}))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open pipeline" value={inr(pipeline, { compact: true })} delta="+9%" hint="vs September" icon={IndianRupee} trend={[28, 30, 31, 33, 35, 36, pipeline / 1e5]} />
        <Stat label="POs in hand" value={won.length} delta="+2" hint={inr(won.reduce((a, o) => a + orderValue(o), 0), { compact: true })} icon={FileCheck} tone="ok" trend={[3, 4, 4, 5, 6, 6, won.length]} />
        <Stat label="Demo → PO conversion" value="46%" delta="+5%" hint="last 90 days" icon={GraduationCap} tone="info" trend={[34, 38, 37, 41, 40, 44, 46]} />
        <Stat label="Average order" value={inr(orders.reduce((a, o) => a + orderValue(o), 0) / orders.length, { compact: true })} hint="robotics pulls it up" icon={Package} tone="warn" />
      </div>
      <Panel
        title="School pipeline"
        sub="Drag a school to the next stage. Moving to PO received alerts the Stock Planner."
        action={
          <>
            <Segmented size="sm" options={["All", "Private", "Govt", "CSR"] as const} value={kind} onChange={setKind} />
            <Btn size="sm" variant="solid" icon={Plus} onClick={() => setAdding(true)}>
              New enquiry
            </Btn>
          </>
        }
      >
        <Board
          columns={STAGES.map((s) => ({ id: s, label: s, tone: stageTone[s], limit: s === "In assembly" ? 3 : undefined }))}
          items={shown}
          itemKey={(o) => o.id}
          getColumn={(o) => o.stage}
          onMove={(k, c) => move(k, c as OrderStage)}
          minColumnWidth={208}
          renderCard={(o) => (
            <button type="button" onClick={() => setOpen(o.id)} className="block w-full text-left">
              <p className="pr-4 text-[13px] font-semibold leading-snug">{o.school}</p>
              <p className="mt-0.5 text-[11.5px] text-d-mute">
                {o.district} · {o.kind}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: kitById(o.kit).color }} />
                <span className="truncate text-[12px]">
                  {o.qty} × {kitById(o.kit).name}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="tnum font-mono text-[12.5px] font-semibold">{inr(orderValue(o), { compact: true })}</span>
                <Avatar name={o.owner} size={22} tone="info" />
              </div>
              <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-snug text-d-mute">{o.next}</p>
            </button>
          )}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <Panel title="By district" sub="All stages, order value">
          <HBars format={(v) => inr(v, { compact: true })} data={byDistrict.map(([label, value]) => ({ label, value }))} />
        </Panel>
        <Panel title="Kit mix" sub="Kits across the pipeline">
          <Donut
            center={orders.reduce((a, o) => a + o.qty, 0)}
            sub="kits"
            segments={kits
              .map((k, i) => ({ label: k.name, value: orders.filter((o) => o.kit === k.id).reduce((a, o) => a + o.qty, 0), tone: (["accent", "info", "warn", "late", "ok", "neutral", "warn", "info"] as Tone[])[i] }))
              .filter((s) => s.value > 0)}
          />
        </Panel>
      </div>
      <Sheet
        open={!!order}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={order ? `${order.id} · ${order.kind}` : ""}
        title={order?.school ?? ""}
        sub={order ? `${order.district} · ${order.contact} · owner ${order.owner}` : ""}
        footer={
          order && (
            <>
              <Btn
                icon={MessageCircle}
                onClick={() => {
                  toast.success("Update sent on WhatsApp", { description: order.contact });
                  desk.log(`Status update sent to ${order.school}`);
                }}
              >
                WhatsApp school
              </Btn>
              {order.stage !== "Dispatched" && (
                <Btn variant="solid" icon={ArrowRight} onClick={() => move(order.id, STAGES[STAGES.indexOf(order.stage) + 1])}>
                  Move to {STAGES[STAGES.indexOf(order.stage) + 1]}
                </Btn>
              )}
            </>
          )
        }
      >
        {order && (
          <div className="space-y-5">
            <KV
              items={[
                { k: "Kit", v: kitById(order.kit).name },
                { k: "For", v: kitById(order.kit).cls },
                { k: "Quantity", v: `${order.qty} kits` },
                { k: "Rate", v: inr(kitById(order.kit).price) },
                { k: "Value (incl. 12% GST)", v: inr(orderValue(order) * 1.12) },
                { k: "Advance", v: order.advance ? `${order.advance * 100}% · ${inr(orderValue(order) * order.advance)}` : "None yet" },
              ]}
            />
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Stage</p>
              <div className="flex flex-wrap gap-1.5">
                {STAGES.map((s, i) => {
                  const reached = STAGES.indexOf(order.stage) >= i;
                  return (
                    <button key={s} type="button" onClick={() => move(order.id, s)} className="rounded-full border px-2.5 py-1 text-[12px] font-medium" style={{ borderColor: reached ? "var(--d-accent)" : "var(--d-line)", background: reached ? "var(--d-soft)" : "var(--d-panel)", color: reached ? "var(--d-accent)" : "var(--d-mute)" }}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="rounded-[12px] bg-d-sunk p-3 text-[13px] leading-relaxed">
              <p className="text-[11.5px] font-medium text-d-mute">Next step</p>
              {order.next}
            </div>
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Timeline</p>
              <ul className="space-y-2 text-[12.5px]">
                {["Enquiry on WhatsApp", "Demo by trainer", "Quote from Tally", "PO + advance", "Batch on assembly line", "Dispatched with LR + e-way bill"].slice(0, STAGES.indexOf(order.stage) + 1).map((t, i) => (
                  <li key={t} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-d-ok" /> {t}
                    <span className="ml-auto font-mono text-[11px] text-d-mute">{["2 Sep", "11 Sep", "18 Sep", "6 Oct", "12 Oct", "18 Oct"][i]}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Sheet>
      <NewEnquiry
        open={adding}
        onOpenChange={setAdding}
        onAdd={(o) => {
          setOrders((cur) => [o, ...cur]);
          toast.success("Enquiry added", { description: `${o.school} · ${o.qty} × ${kitById(o.kit).name}` });
          desk.log(`New enquiry: ${o.school}, ${o.district}`, "info");
        }}
      />
    </div>
  );
}

function NewEnquiry({ open, onOpenChange, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (o: SchoolOrder) => void }) {
  const [school, setSchool] = React.useState("Sacred Heart School, Begusarai");
  const [district, setDistrict] = React.useState("Begusarai");
  const [kit, setKit] = React.useState("STEM-J");
  const [qty, setQty] = React.useState("20");
  const [owner, setOwner] = React.useState("Kavita Singh");
  const [count, setCount] = React.useState(2640);
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="New school enquiry" sub="Lands in Enquiry. The owner gets a WhatsApp with the school's details.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onAdd({ id: `GLK-${count}`, school, district, kind: "Private", kit, qty: Number(qty) || 10, stage: "Enquiry", owner, contact: "Principal", next: "Call back and offer a demo" });
          setCount((c) => c + 1);
          onOpenChange(false);
        }}
      >
        <Field label="School">
          <input className={inputClass} value={school} onChange={(e) => setSchool(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="District">
            <input className={inputClass} value={district} onChange={(e) => setDistrict(e.target.value)} />
          </Field>
          <Field label="Sales owner">
            <select className={inputClass} value={owner} onChange={(e) => setOwner(e.target.value)}>
              {["Kavita Singh", "Deepak Yadav", "Vivek Ranjan Sinha"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="Kit">
            <select className={inputClass} value={kit} onChange={(e) => setKit(e.target.value)}>
              {kits.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Kits">
            <input className={inputClass} inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))} />
          </Field>
        </div>
        <p className="text-[12.5px] text-d-mute">Estimated value {inr((Number(qty) || 0) * kitById(kit).price)} before GST.</p>
        <div className="flex justify-end gap-2 pt-1">
          <Btn onClick={() => onOpenChange(false)}>Cancel</Btn>
          <Btn variant="solid" type="submit" icon={Plus}>
            Add enquiry
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ============================================================
   Kit assembly
   ============================================================ */

function AssemblyModule({ batches, setBatches, orders }: { batches: Batch[]; setBatches: React.Dispatch<React.SetStateAction<Batch[]>>; orders: SchoolOrder[] }) {
  const desk = useDesk();
  const [kit, setKit] = React.useState<keyof typeof bom>("ROBO-S");
  const [raised, setRaised] = React.useState<Set<string>>(new Set());
  const [open, setOpen] = React.useState<string | null>(null);
  const [checks, setChecks] = React.useState<Record<string, Set<string>>>({});
  const batch = batches.find((b) => b.id === open) ?? null;
  const assembled = useDrift(58, 1.2, 3200);
  const demand = openKitDemand(kit, orders);
  const bomRows = bom[kit].map((r) => ({ ...r, need: r.perKit * demand }));
  const short = bomRows.filter((r) => r.store < r.need);

  function advance(b: Batch) {
    const i = STATIONS.indexOf(b.station);
    if (b.blocked) {
      toast.error(`${b.id} is blocked`, { description: b.blocked });
      return;
    }
    if (i === STATIONS.length - 1) {
      setBatches((cur) => cur.map((x) => (x.id === b.id ? { ...x, done: x.qty } : x)));
      toast.success(`${b.id} packed`, { description: `${b.qty} kits ready for dispatch` });
      desk.log(`${b.id} fully packed, ready for dispatch`, "ok");
      return;
    }
    const next = STATIONS[i + 1];
    setBatches((cur) => cur.map((x) => (x.id === b.id ? { ...x, station: next, done: Math.min(x.qty, Math.round(x.qty * ((i + 2) / STATIONS.length))) } : x)));
    toast.success(`${b.id} → ${next}`, { description: `${kitById(b.kit).name} for ${b.order}` });
    desk.log(`${b.id} moved to ${next}`);
  }

  const qcChecks = ["All parts counted against BOM", "Electronics powered and tested", "Manual and worksheet inside", "Case sealed with GLK tape", "Box label: school, district, kit no."];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Kits assembled today" value={Math.round(assembled)} delta="+12" hint="target 72 by 6 PM" icon={Blocks} tone="ok" trend={[10, 18, 27, 34, 42, 51, assembled]} />
        <Stat label="Batches on the line" value={batches.filter((b) => b.done < b.qty).length} hint={`${batches.filter((b) => b.blocked).length} blocked on parts`} icon={Package} />
        <Stat label="BOM lines short" value={Object.keys(bom).reduce((a, k) => a + bom[k as keyof typeof bom].filter((r) => r.store < r.perKit * openKitDemand(k, orders)).length, 0)} delta="+2" deltaGood={false} icon={TriangleAlert} tone="late" />
        <Stat label="QC first-pass" value="96.4%" delta="+1.1%" hint="2 lens sets rejected" icon={ClipboardCheck} tone="info" trend={[93, 94, 94.5, 95, 95.8, 96, 96.4]} />
      </div>

      <Panel live title="Assembly line" sub="Five stations at Patliputra Industrial Area. Click a batch to move it to the next station.">
        <div className="desk-scroll -mx-5 overflow-x-auto px-5">
          <div className="grid min-w-[880px] grid-cols-5 gap-3">
            {STATIONS.map((s, si) => {
              const here = batches.filter((b) => b.station === s && b.done < b.qty);
              return (
                <div key={s} className="relative rounded-[14px] bg-d-sunk/70 p-2.5">
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[12.5px] font-semibold">
                      <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-d-accent font-mono text-[10px] text-d-accent-ink">{si + 1}</span>
                      {s}
                    </p>
                    <span className="font-mono text-[11px] text-d-mute">{here.reduce((a, b) => a + b.qty - b.done, 0)} WIP</span>
                  </div>
                  <div className="desk-belt mx-1 my-2 h-1.5 rounded-full" />
                  <div className="space-y-2">
                    {here.map((b) => (
                      <div key={b.id} className="desk-rise rounded-[10px] border border-d-line bg-d-panel p-2.5" style={{ borderTop: `3px solid ${kitById(b.kit).color}` }}>
                        <button type="button" onClick={() => setOpen(b.id)} className="block w-full text-left">
                          <p className="flex items-center justify-between font-mono text-[11.5px] font-semibold">
                            {b.id} <span className="text-d-mute">{b.done}/{b.qty}</span>
                          </p>
                          <p className="truncate text-[12px]">{kitById(b.kit).name}</p>
                          <p className="truncate text-[11px] text-d-mute">{b.order} · {b.lead}</p>
                        </button>
                        <Meter className="mt-1.5" value={b.done} max={b.qty} height={4} tone={b.blocked ? "late" : "accent"} />
                        {b.blocked ? (
                          <p className="mt-1.5 flex items-start gap-1 text-[11px] leading-snug text-d-late">
                            <TriangleAlert className="mt-px h-3 w-3 shrink-0" /> {b.blocked}
                          </p>
                        ) : (
                          <Btn size="sm" variant="soft" className="mt-2 h-7 w-full" icon={ArrowRight} onClick={() => advance(b)}>
                            {si === STATIONS.length - 1 ? "Mark packed" : `To ${STATIONS[si + 1]}`}
                          </Btn>
                        )}
                      </div>
                    ))}
                    {here.length === 0 && <p className="rounded-lg border border-dashed border-d-line py-5 text-center text-[11.5px] text-d-mute">Station free</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {batches.some((b) => b.done >= b.qty) && (
          <p className="mt-3 flex flex-wrap items-center gap-2 text-[12.5px] text-d-mute">
            <PackageCheckIcon /> Ready for dispatch:
            {batches
              .filter((b) => b.done >= b.qty)
              .map((b) => (
                <Pill key={b.id} tone="ok">
                  {b.id} · {b.qty} {kitById(b.kit).name}
                </Pill>
              ))}
          </p>
        )}
      </Panel>

      <Panel
        title="Bill of materials"
        sub={`Per-kit consumption × ${demand} kits on POs, live quotes and demos, against the store`}
        action={<Segmented size="sm" options={Object.keys(bom) as (keyof typeof bom)[]} value={kit} onChange={setKit} />}
      >
        <DataTable
          rows={bomRows}
          rowKey={(r) => r.item}
          search={(r) => `${r.item} ${r.supplier}`}
          searchPlaceholder="Search part or supplier"
          columns={[
            { key: "item", label: "Part", render: (r) => <span className="font-medium">{r.item}</span>, sort: (r) => r.item },
            { key: "sup", label: "Supplier", render: (r) => <span className="text-d-mute">{r.supplier}</span>, wide: true },
            { key: "per", label: "Per kit", align: "right", render: (r) => <span className="font-mono text-[12px]">{r.perKit}</span> },
            { key: "need", label: "Needed", align: "right", render: (r) => <span className="tnum font-mono">{r.need} {r.unit}</span>, sort: (r) => r.need },
            { key: "store", label: "In store", align: "right", render: (r) => <span className="tnum font-mono">{r.store}</span>, sort: (r) => r.store },
            {
              key: "cover",
              label: "Cover",
              render: (r) => (
                <div className="flex min-w-[110px] items-center gap-2">
                  <Meter value={Math.min(r.store, r.need || 1)} max={r.need || 1} tone={r.store >= r.need ? "ok" : r.store / r.need > 0.6 ? "warn" : "late"} />
                  <span className="font-mono text-[11px] text-d-mute">{r.need ? Math.round(Math.min(1, r.store / r.need) * 100) : 100}%</span>
                </div>
              ),
              sort: (r) => (r.need ? r.store / r.need : 1),
            },
            {
              key: "act",
              label: "",
              align: "right",
              render: (r) =>
                r.store >= r.need ? (
                  <Pill tone="ok">Covered</Pill>
                ) : raised.has(`${kit}-${r.item}`) ? (
                  <Pill tone="info">PO drafted</Pill>
                ) : (
                  <Btn
                    size="sm"
                    variant="soft"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRaised((s) => new Set(s).add(`${kit}-${r.item}`));
                      toast.success("PO drafted in Tally", { description: `${r.need - r.store} ${r.unit} of ${r.item} · ${inr((r.need - r.store) * r.rate)} · ${r.supplier}` });
                      desk.log(`Stock Planner drafted PO: ${r.item} for ${kit}`, "info");
                    }}
                  >
                    Raise PO · {inr((r.need - r.store) * r.rate, { compact: true })}
                  </Btn>
                ),
            },
          ]}
        />
      </Panel>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <Panel title={`Shortfall on ${kit}`} sub={short.length ? `${short.length} parts below what the open POs need` : "Every part is covered"}>
          {short.length ? <HBars data={short.map((r) => ({ label: r.item, value: r.need - r.store, sub: r.unit, tone: r.store / r.need < 0.5 ? "late" : "warn" }))} /> : <p className="text-[13px] text-d-mute">Nothing to buy for this kit.</p>}
        </Panel>
        <Panel title="Kits assembled per day" sub="Last two weeks, all kits">
          <Bars height={170} data={["7", "8", "9", "10", "11", "13", "14", "15", "16", "17", "18", "19", "20"].map((d, i) => ({ label: d, value: [44, 52, 48, 61, 39, 55, 63, 58, 70, 66, 31, 64, 58][i], tone: d === "20" ? "warn" : "accent" }))} />
        </Panel>
      </div>

      <Sheet
        open={!!batch}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={batch ? `${batch.id} · lead ${batch.lead}` : ""}
        title={batch ? kitById(batch.kit).name : ""}
        sub={batch ? `${batch.qty} kits for ${batch.order} · now at ${batch.station}` : ""}
        footer={
          batch && (
            <>
              {batch.blocked && (
                <Btn
                  onClick={() => {
                    setBatches((cur) => cur.map((x) => (x.id === batch.id ? { ...x, blocked: undefined } : x)));
                    toast.success(`${batch.id} unblocked`, { description: "Parts issued from store" });
                    desk.log(`${batch.id} unblocked, parts issued`, "ok");
                  }}
                >
                  Parts arrived, unblock
                </Btn>
              )}
              <Btn variant="solid" icon={ArrowRight} onClick={() => advance(batch)}>
                Next station
              </Btn>
            </>
          )
        }
      >
        {batch && (
          <div className="space-y-5">
            <KV items={[{ k: "Done", v: `${batch.done} of ${batch.qty}` }, { k: "Station", v: batch.station }, { k: "Kit value", v: inr(kitById(batch.kit).price * batch.qty, { compact: true }) }, { k: "Status", v: batch.blocked ? <span className="text-d-late">Blocked</span> : <span className="text-d-ok">Moving</span> }]} />
            <div className="flex items-center gap-1">
              {STATIONS.map((s, i) => (
                <span key={s} className="h-2 flex-1 rounded-full" style={{ background: i <= STATIONS.indexOf(batch.station) ? "var(--d-accent)" : "var(--d-sunk)" }} title={s} />
              ))}
            </div>
            {batch.blocked && <p className="rounded-[12px] bg-[color-mix(in_oklab,var(--d-late)_10%,transparent)] p-3 text-[13px] text-d-late">{batch.blocked}</p>}
            <div>
              <p className="mb-1 text-[12px] font-medium text-d-mute">QC checklist</p>
              <Checklist
                items={qcChecks.map((c) => ({ id: c, label: c, done: checks[batch.id]?.has(c) ?? false }))}
                onToggle={(id) =>
                  setChecks((cur) => {
                    const s = new Set(cur[batch.id] ?? []);
                    if (s.has(id)) s.delete(id);
                    else s.add(id);
                    return { ...cur, [batch.id]: s };
                  })
                }
              />
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

function PackageCheckIcon() {
  return <Package className="h-4 w-4 text-d-ok" />;
}

/* ============================================================
   Dispatch
   ============================================================ */

const dispatchTone: Record<Consignment["status"], Tone> = { Packed: "neutral", Loaded: "info", "In transit": "accent", Delivered: "ok", Held: "late" };

function DispatchModule({ consignments, setConsignments }: { consignments: Consignment[]; setConsignments: React.Dispatch<React.SetStateAction<Consignment[]>> }) {
  const desk = useDesk();
  const [district, setDistrict] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState<string | null>(null);
  const c = consignments.find((x) => x.id === open) ?? null;
  const rows = consignments.filter((x) => !district || x.district === district);
  const expiring = consignments.filter((x) => x.ewbHours > 0 && x.ewbHours < 24 && x.status !== "Delivered");

  function update(id: string, patch: Partial<Consignment>, msg: string) {
    setConsignments((cur) => cur.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    toast.success(msg);
    desk.log(msg, patch.status === "Delivered" ? "ok" : "info");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="On the road" value={consignments.filter((x) => x.status === "In transit" || x.status === "Loaded").length} hint={`${consignments.filter((x) => x.status === "Held").length} held`} icon={Truck} />
        <Stat label="E-way bills under 24 h" value={expiring.length} hint={expiring.length ? `${expiring.length} need a Part-B update` : "all valid"} icon={Timer} tone="late" />
        <Stat label="Delivered this month" value={`${consignments.filter((x) => x.status === "Delivered").reduce((a, x) => a + x.kits, 0)} kits`} delta="+18%" icon={CheckCheck} tone="ok" trend={[40, 62, 75, 88, 96, 110, 118]} />
        <Stat label="Freight per kit" value="₹212" delta="-₹14" deltaGood={false} hint="Magadh rate revised" icon={IndianRupee} trend={[248, 240, 236, 231, 226, 220, 212]} />
      </div>
      <Panel title="Bihar districts" sub="Kits shipped this month. Click a district to filter the consignments." action={district && <Btn size="sm" variant="ghost" onClick={() => setDistrict(null)}>Clear filter</Btn>}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {districtTiles.map((d) => {
            const list = consignments.filter((x) => x.district === d);
            const kitsOut = list.reduce((a, x) => a + x.kits, 0);
            const held = list.some((x) => x.status === "Held");
            const moving = list.some((x) => x.status === "In transit" || x.status === "Loaded");
            const on = district === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDistrict(on ? null : d)}
                className="relative rounded-[12px] border p-2.5 text-left transition-all hover:-translate-y-0.5"
                style={{ borderColor: on ? "var(--d-accent)" : "var(--d-line)", background: on ? "var(--d-soft)" : kitsOut ? `color-mix(in oklab, var(--d-accent) ${Math.min(22, 4 + kitsOut / 3)}%, var(--d-panel))` : "var(--d-panel)" }}
              >
                <p className="truncate text-[12.5px] font-semibold">{d}</p>
                <p className="tnum font-mono text-[18px] font-semibold leading-tight">{kitsOut}</p>
                <p className="text-[10.5px] text-d-mute">{list.length ? `${list.length} consignment${list.length > 1 ? "s" : ""}` : "none this month"}</p>
                {(held || moving) && <span className={`absolute right-2.5 top-2.5 h-2 w-2 rounded-full ${held ? "bg-d-late" : "bg-d-ok desk-ping"}`} />}
              </button>
            );
          })}
        </div>
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1fr_330px]">
        <Panel title="Consignments" sub={district ? `Filtered to ${district}` : "Click a row for the LR, e-way bill and route"}>
          <DataTable
            rows={rows}
            rowKey={(x) => x.id}
            search={(x) => `${x.id} ${x.to} ${x.district} ${x.transporter} ${x.lr} ${x.ewb}`}
            searchPlaceholder="Search school, LR or EWB"
            filter={{ get: (x) => x.status, options: ["Packed", "Loaded", "In transit", "Held", "Delivered"] }}
            onRow={(x) => setOpen(x.id)}
            bulk={[
              {
                label: "Send ETA to schools",
                run: (k) => {
                  toast.success(`ETA sent to ${k.length} schools on WhatsApp`);
                  desk.log(`Dispatch ETAs sent for ${k.length} consignments`);
                },
              },
            ]}
            columns={[
              { key: "id", label: "Dispatch", render: (x) => <span className="font-mono text-[12px] font-medium">{x.id}</span>, sort: (x) => x.id },
              { key: "to", label: "To", render: (x) => (<div className="min-w-0"><p className="font-medium">{x.to}</p><p className="text-[11.5px] text-d-mute">{x.district}</p></div>), sort: (x) => x.to },
              { key: "tr", label: "Transporter", render: (x) => <span className="text-d-mute">{x.transporter}</span>, wide: true },
              { key: "kits", label: "Kits", align: "right", render: (x) => <span className="tnum font-mono">{x.kits}</span>, sort: (x) => x.kits },
              {
                key: "ewb",
                label: "E-way bill",
                render: (x) =>
                  x.ewbHours > 0 && x.status !== "Delivered" ? (
                    <span className="font-mono text-[11.5px]" style={{ color: x.ewbHours < 12 ? "var(--d-late)" : x.ewbHours < 24 ? "var(--d-warn)" : undefined }}>
                      <Countdown compact inHours={x.ewbHours} />
                    </span>
                  ) : (
                    <span className="text-[11.5px] text-d-mute">{x.status === "Delivered" ? "Closed" : x.ewb}</span>
                  ),
                sort: (x) => (x.ewbHours > 0 ? x.ewbHours : 999),
              },
              { key: "st", label: "Status", render: (x) => <Pill tone={dispatchTone[x.status]}>{x.status}</Pill> },
            ]}
          />
        </Panel>
        <Panel title="Transporters" sub="On-time delivery, last 60 days">
          <HBars
            format={(v) => `${v}%`}
            max={100}
            data={[
              { label: "Magadh Roadways", value: 94, sub: "₹9.5/kg", tone: "ok" },
              { label: "Ganga Cargo Movers", value: 91, sub: "₹10.2/kg", tone: "ok" },
              { label: "Kosi Express Parcel", value: 86, sub: "₹14/kg", tone: "accent" },
              { label: "Local tempo (Rajesh)", value: 82, sub: "₹1,800/trip", tone: "warn" },
              { label: "Tirhut Transport Co.", value: 71, sub: "₹8.8/kg", tone: "late" },
            ]}
          />
          <p className="mt-4 rounded-[12px] bg-d-sunk p-3 text-[12.5px] leading-snug">
            Tirhut is cheapest but has had 3 breakdowns since August. Dispatch Tracker suggests Magadh for North Bihar until they replace the old Tata 1109.
          </p>
        </Panel>
      </div>
      <Sheet
        open={!!c}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={c ? `${c.id} · LR ${c.lr}` : ""}
        title={c?.to ?? ""}
        sub={c ? `${c.district} · ${c.transporter} · ${c.eta}` : ""}
        footer={
          c && (
            <>
              {c.ewbHours > 0 && c.status !== "Delivered" && (
                <Btn icon={Timer} onClick={() => update(c.id, { ewbHours: c.ewbHours + 24, status: c.status === "Held" ? "In transit" : c.status, eta: c.status === "Held" ? "Replacement truck BR06 GC 2291, tomorrow noon" : c.eta }, `E-way bill ${c.ewb} extended by 24 h`)}>
                  Extend EWB 24 h
                </Btn>
              )}
              {c.status !== "Delivered" && (
                <Btn variant="solid" icon={CheckCheck} onClick={() => update(c.id, { status: "Delivered", eta: "Delivered today" }, `${c.id} delivered to ${c.to}`)}>
                  Mark delivered
                </Btn>
              )}
            </>
          )
        }
      >
        {c && (
          <div className="space-y-5">
            <KV items={[{ k: "Kits", v: `${c.kits} in ${c.boxes} boxes` }, { k: "Weight", v: `${c.kg} kg` }, { k: "Invoice value", v: inr(c.value) }, { k: "Status", v: <Pill tone={dispatchTone[c.status]}>{c.status}</Pill> }]} />
            <div className="rounded-[14px] border border-d-line p-4">
              <p className="text-[11.5px] font-medium text-d-mute">E-way bill</p>
              <p className="mt-0.5 font-mono text-[15px] font-semibold">{c.ewb}</p>
              {c.ewbHours > 0 && c.status !== "Delivered" ? (
                <div className="mt-2">
                  <p className="text-[11.5px] text-d-mute">Valid for</p>
                  <Countdown inHours={c.ewbHours} />
                </div>
              ) : (
                <p className="mt-1 text-[12.5px] text-d-mute">{c.status === "Delivered" ? "Closed on delivery" : "Generated when the truck number is confirmed"}</p>
              )}
            </div>
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Route</p>
              <ol className="space-y-2.5">
                {["Patliputra Industrial Area, Patna", "Hajipur (Gandhi Setu)", c.district === "Gaya" || c.district === "Nalanda" ? "Bihar Sharif bypass" : "Muzaffarpur bypass", c.to].map((s, i) => {
                  const reached = c.status === "Delivered" ? 4 : c.status === "In transit" ? 2 : c.status === "Held" ? 3 : c.status === "Loaded" ? 1 : 0;
                  return (
                    <li key={s} className="flex items-center gap-3 text-[13px]">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full border-2" style={{ borderColor: i < reached ? "var(--d-accent)" : "var(--d-line)", background: i < reached ? "var(--d-accent)" : "var(--d-panel)" }}>
                        {i < reached && <Check className="h-3 w-3 text-d-accent-ink" strokeWidth={3} />}
                      </span>
                      <span className={i < reached ? "" : "text-d-mute"}>{s}</span>
                      {c.status === "Held" && i === 2 && <Pill tone="late">Breakdown</Pill>}
                    </li>
                  );
                })}
              </ol>
            </div>
            <Btn
              icon={MessageCircle}
              onClick={() => {
                toast.success("School informed on WhatsApp", { description: c.to });
                desk.log(`ETA shared with ${c.to}`);
              }}
            >
              Send ETA to school
            </Btn>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ============================================================
   Trainers & visits
   ============================================================ */

const visitTone: Record<Visit["type"], Tone> = { Onboarding: "accent", Refresher: "info", Demo: "warn", "Lab audit": "neutral" };

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${n} stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className="h-3.5 w-3.5" style={{ color: i <= n ? "var(--d-warn)" : "var(--d-line)", fill: i <= n ? "var(--d-warn)" : "transparent" }} />
      ))}
    </span>
  );
}

function TrainersModule() {
  const desk = useDesk();
  const [visits, setVisits] = React.useState(seedVisits);
  const [drag, setDrag] = React.useState<string | null>(null);
  const [over, setOver] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);
  const [rating, setRating] = React.useState(4);
  const [note, setNote] = React.useState("");
  const visit = visits.find((v) => v.id === open) ?? null;
  const load = trainers.map((t) => ({ t, n: visits.filter((v) => v.trainer === t).length }));

  function drop(trainer: string, day: number) {
    const v = visits.find((x) => x.id === drag);
    setDrag(null);
    setOver(null);
    if (!v || (v.trainer === trainer && v.day === day)) return;
    setVisits((cur) => cur.map((x) => (x.id === v.id ? { ...x, trainer, day, status: "Moved" } : x)));
    toast.success(`${v.school} moved`, { description: `${first(trainer)} · ${DAYS[day]} · school informed on WhatsApp` });
    desk.log(`Visit ${v.school} moved to ${first(trainer)}, ${DAYS[day]}`, "info");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Visits this week" value={visits.length} hint={`${visits.filter((v) => v.status === "Done").length} done`} icon={CalendarDays} trend={[11, 12, 14, 13, 15, 14, visits.length]} />
        <Stat label="Teachers trained" value={visits.reduce((a, v) => a + v.teachers, 0)} delta="+22%" icon={GraduationCap} tone="ok" trend={[80, 92, 101, 96, 110, 118, 135]} />
        <Stat label="Average rating" value="4.3★" delta="-0.1" hint="10 forms this month" icon={Star} tone="warn" trend={[4.5, 4.4, 4.4, 4.5, 4.3, 4.4, 4.3]} />
        <Stat label="Schools awaiting training" value="9" hint="delivered, no visit yet" icon={School} tone="late" />
      </div>
      <Panel
        title="Week of 19 October"
        sub="Drag a visit to another trainer or day. Each trainer can do 2 visits a day."
        action={
          <Btn size="sm" variant="solid" icon={Plus} onClick={() => setAdding(true)}>
            Schedule visit
          </Btn>
        }
      >
        <div className="desk-scroll -mx-5 overflow-x-auto px-5">
          <div className="min-w-[940px]">
            <div className="grid grid-cols-[170px_repeat(6,1fr)] gap-1.5 pb-1.5">
              <span />
              {DAYS.map((d, i) => (
                <span key={d} className={`rounded-[8px] py-1 text-center text-[12px] font-semibold ${i === TODAY_IX ? "bg-d-accent text-d-accent-ink" : "text-d-mute"}`}>
                  {d}
                  {i === TODAY_IX && " · today"}
                </span>
              ))}
            </div>
            {trainers.map((t) => {
              const n = visits.filter((v) => v.trainer === t).length;
              return (
                <div key={t} className="grid grid-cols-[170px_repeat(6,1fr)] gap-1.5 pb-1.5">
                  <div className="flex items-center gap-2 pr-2">
                    <Avatar name={t} size={30} tone={n > 6 ? "late" : "accent"} />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold">{t}</p>
                      <p className="text-[11px]" style={{ color: n > 6 ? "var(--d-late)" : "var(--d-mute)" }}>
                        {n} visits{n > 6 ? " · overloaded" : ""}
                      </p>
                    </div>
                  </div>
                  {DAYS.map((d, di) => {
                    const cell = visits.filter((v) => v.trainer === t && v.day === di).sort((a, b) => (a.slot > b.slot ? 1 : -1));
                    const key = `${t}-${di}`;
                    return (
                      <div
                        key={d}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setOver(key);
                        }}
                        onDragLeave={() => setOver((o) => (o === key ? null : o))}
                        onDrop={(e) => {
                          e.preventDefault();
                          drop(t, di);
                        }}
                        className="min-h-[92px] space-y-1 rounded-[10px] p-1 transition-colors"
                        style={{ background: over === key ? "var(--d-soft)" : di === TODAY_IX ? "color-mix(in oklab, var(--d-accent) 6%, var(--d-sunk))" : "var(--d-sunk)", outline: over === key ? "2px dashed var(--d-accent)" : undefined }}
                      >
                        {cell.map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            draggable
                            onDragStart={() => setDrag(v.id)}
                            onDragEnd={() => setDrag(null)}
                            onClick={() => {
                              setOpen(v.id);
                              setRating(v.rating ?? 4);
                              setNote(v.feedback ?? "");
                            }}
                            className={`block w-full cursor-grab rounded-[7px] border bg-d-panel px-1.5 py-1 text-left active:cursor-grabbing ${drag === v.id ? "opacity-40" : ""}`}
                            style={{ borderColor: "var(--d-line)", borderLeft: `3px solid var(--d-${visitTone[v.type] === "neutral" ? "mute" : visitTone[v.type]})` }}
                          >
                            <p className="flex items-center justify-between font-mono text-[9.5px] text-d-mute">
                              {v.slot} · {v.type}
                              {v.status === "Done" && <Check className="h-3 w-3 text-d-ok" strokeWidth={3} />}
                              {v.status === "Moved" && <span className="text-d-warn">moved</span>}
                            </p>
                            <p className="truncate text-[11.5px] font-medium leading-tight">{v.school}</p>
                            <p className="truncate text-[10px] text-d-mute">{v.district}</p>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-[12px] text-d-mute">
          {(Object.keys(visitTone) as Visit["type"][]).map((k) => (
            <span key={k} className="inline-flex items-center gap-1.5">
              <span className="h-3 w-[3px] rounded-full" style={{ background: `var(--d-${visitTone[k] === "neutral" ? "mute" : visitTone[k]})` }} /> {k}
            </span>
          ))}
        </div>
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Teacher feedback" sub="Forms filled after every visit, in Hindi or English">
          <DataTable
            rows={feedback}
            rowKey={(f) => f.id}
            search={(f) => `${f.school} ${f.teacher} ${f.comment}`}
            searchPlaceholder="Search school or comment"
            filter={{ get: (f) => (f.flag ? "Needs action" : "Fine"), options: ["Needs action", "Fine"] }}
            pageSize={6}
            onRow={(f) => toast(f.school, { description: `${f.teacher}: “${f.comment}”` })}
            columns={[
              { key: "s", label: "School", render: (f) => (<div><p className="font-medium">{f.school}</p><p className="text-[11.5px] text-d-mute">{f.teacher}</p></div>), sort: (f) => f.school },
              { key: "r", label: "Rating", render: (f) => <Stars n={f.rating} />, sort: (f) => f.rating },
              { key: "c", label: "Comment", render: (f) => <span className="line-clamp-2 text-[12.5px] text-d-mute">{f.comment}</span>, wide: true },
              { key: "f", label: "", align: "right", render: (f) => (f.flag ? <Pill tone="late">{f.flag}</Pill> : <Pill tone="ok">OK</Pill>) },
            ]}
          />
        </Panel>
        <div className="space-y-5">
          <Panel title="Trainer load" sub="Visits this week">
            <HBars max={8} format={(v) => `${v}`} data={load.map((l) => ({ label: l.t, value: l.n, tone: l.n > 6 ? "late" : l.n < 4 ? "info" : "accent" }))} />
          </Panel>
          <Panel title="Rating trend" sub="Average stars per month">
            <AreaChart height={130} labels={["May", "Jun", "Jul", "Aug", "Sep", "Oct"]} series={[{ name: "Average rating", data: [4.1, 4.3, 4.4, 4.5, 4.4, 4.3], tone: "warn" }]} format={(v) => `${v.toFixed(1)}★`} />
          </Panel>
        </div>
      </div>
      <Sheet
        open={!!visit}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={visit ? `${visit.id} · ${visit.type}` : ""}
        title={visit?.school ?? ""}
        sub={visit ? `${visit.district} · ${visit.trainer} · ${DAYS[visit.day]} ${visit.slot} · ${visit.teachers} teachers` : ""}
        footer={
          visit && (
            <Btn
              variant="solid"
              icon={CheckCheck}
              onClick={() => {
                setVisits((cur) => cur.map((x) => (x.id === visit.id ? { ...x, status: "Done", rating, feedback: note || x.feedback } : x)));
                toast.success("Visit closed", { description: `${visit.school} · ${rating}★` });
                desk.log(`${first(visit.trainer)} closed visit at ${visit.school}, ${rating}★`, "ok");
                setOpen(null);
              }}
            >
              {visit.status === "Done" ? "Update feedback" : "Mark done"}
            </Btn>
          )
        }
      >
        {visit && (
          <div className="space-y-4">
            <KV items={[{ k: "Trainer", v: visit.trainer }, { k: "When", v: `${DAYS[visit.day]}, ${visit.slot === "AM" ? "10 AM" : "2 PM"}` }, { k: "Teachers", v: visit.teachers }, { k: "Status", v: <Pill tone={visit.status === "Done" ? "ok" : visit.status === "Moved" ? "warn" : "info"}>{visit.status}</Pill> }]} />
            <Field label="Rating from the school">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button key={i} type="button" onClick={() => setRating(i)} aria-label={`${i} stars`}>
                    <Star className="h-6 w-6" style={{ color: i <= rating ? "var(--d-warn)" : "var(--d-line)", fill: i <= rating ? "var(--d-warn)" : "transparent" }} />
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Feedback notes">
              <textarea className={`${inputClass} h-24 py-2`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Teachers ne kya kaha? Missing parts? Retraining?" />
            </Field>
            <Field label="Reassign trainer">
              <select
                className={inputClass}
                value={visit.trainer}
                onChange={(e) => {
                  const to = e.target.value;
                  setVisits((cur) => cur.map((x) => (x.id === visit.id ? { ...x, trainer: to, status: "Moved" } : x)));
                  desk.log(`Visit ${visit.school} reassigned to ${first(to)}`, "info");
                  toast.success(`Reassigned to ${first(to)}`);
                }}
              >
                {trainers.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
          </div>
        )}
      </Sheet>
      <ScheduleVisit
        open={adding}
        onOpenChange={setAdding}
        onAdd={(v) => {
          setVisits((cur) => [...cur, v]);
          toast.success("Visit scheduled", { description: `${first(v.trainer)} · ${v.school} · ${DAYS[v.day]} ${v.slot}` });
          desk.log(`Visit scheduled: ${v.school} with ${first(v.trainer)}`, "info");
        }}
      />
    </div>
  );
}

function ScheduleVisit({ open, onOpenChange, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (v: Visit) => void }) {
  const [school, setSchool] = React.useState("Gyan Bharati School");
  const [district, setDistrict] = React.useState("Sitamarhi");
  const [trainer, setTrainer] = React.useState("Ritesh Ranjan");
  const [day, setDay] = React.useState("3");
  const [slot, setSlot] = React.useState<"AM" | "PM">("AM");
  const [type, setType] = React.useState<Visit["type"]>("Demo");
  const [n, setN] = React.useState(400);
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Schedule a visit" sub="The school gets a WhatsApp confirmation and the trainer gets the route.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onAdd({ id: `V-${n}`, trainer, day: Number(day), slot, school, district, type, status: "Planned", teachers: 6 });
          setN((x) => x + 1);
          onOpenChange(false);
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="School">
            <input className={inputClass} value={school} onChange={(e) => setSchool(e.target.value)} />
          </Field>
          <Field label="District">
            <input className={inputClass} value={district} onChange={(e) => setDistrict(e.target.value)} />
          </Field>
          <Field label="Trainer">
            <select className={inputClass} value={trainer} onChange={(e) => setTrainer(e.target.value)}>
              {trainers.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Type">
            <select className={inputClass} value={type} onChange={(e) => setType(e.target.value as Visit["type"])}>
              {(["Onboarding", "Refresher", "Demo", "Lab audit"] as const).map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Day">
            <select className={inputClass} value={day} onChange={(e) => setDay(e.target.value)}>
              {DAYS.map((d, i) => (
                <option key={d} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Slot">
            <Segmented options={["AM", "PM"] as const} value={slot} onChange={setSlot} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Btn onClick={() => onOpenChange(false)}>Cancel</Btn>
          <Btn variant="solid" type="submit" icon={CalendarDays}>
            Schedule
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ============================================================
   Tenders & govt
   ============================================================ */

const tenderTone: Record<Tender["status"], Tone> = { Preparing: "warn", "Ready to submit": "accent", "Pre-bid query": "info", "Technical eval": "neutral", Submitted: "info", Won: "ok" };

function TendersModule({ tenders, setTenders }: { tenders: Tender[]; setTenders: React.Dispatch<React.SetStateAction<Tender[]>> }) {
  const desk = useDesk();
  const [pick, setPick] = React.useState(tenders[0].id);
  const [refunds, setRefunds] = React.useState<Set<string>>(new Set());
  const t = tenders.find((x) => x.id === pick) ?? tenders[0];
  const live = tenders.filter((x) => x.inHours > 0);
  const docsDone = t.docs.filter((d) => d.done).length;
  const canSubmit = t.inHours > 0 && docsDone === t.docs.length && t.status !== "Submitted";

  function toggleDoc(id: string) {
    setTenders((cur) => cur.map((x) => (x.id === t.id ? { ...x, docs: x.docs.map((d) => (d.id === id ? { ...d, done: !d.done } : d)) } : x)));
    const d = t.docs.find((x) => x.id === id);
    if (d) desk.log(`${t.id}: ${d.label} ${d.done ? "re-opened" : "ready"}`, d.done ? "warn" : "ok");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Live bids" value={live.length} hint={`next closes in ${Math.min(...live.map((x) => x.inHours))} h`} icon={Gavel} tone="warn" />
        <Stat label="Pipeline value" value={inr(live.reduce((a, x) => a + x.value, 0), { compact: true })} delta="+₹74 L" icon={Landmark} trend={[4.1, 4.4, 5.0, 5.2, 5.8, 5.8, 6.5]} />
        <Stat label="EMD locked" value={inr(emds.filter((e) => e.state !== "Refunded").reduce((a, e) => a + e.amount, 0), { compact: true })} hint="₹3.86 L refund due" icon={IndianRupee} tone="late" />
        <Stat label="Win rate, last 12 bids" value="33%" delta="+8%" icon={CheckCheck} tone="ok" trend={[18, 20, 22, 25, 25, 30, 33]} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
        <Panel title="Bids" sub="Pick a bid to work its document checklist">
          <ul className="space-y-2.5">
            {tenders.map((x) => {
              const d = x.docs.filter((y) => y.done).length;
              const on = x.id === t.id;
              return (
                <li key={x.id}>
                  <button type="button" onClick={() => setPick(x.id)} className="w-full rounded-[14px] border p-3.5 text-left transition-colors" style={{ borderColor: on ? "var(--d-accent)" : "var(--d-line)", background: on ? "var(--d-soft)" : "var(--d-panel)" }}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] text-d-mute">{x.id}</span>
                      <Pill tone={tenderTone[x.status]}>{x.status}</Pill>
                      <span className="ml-auto font-mono text-[12.5px] font-semibold" style={{ color: x.inHours > 0 && x.inHours < 72 ? "var(--d-late)" : undefined }}>
                        {x.inHours > 0 ? <Countdown compact inHours={x.inHours} /> : x.status === "Won" ? "LoA received" : "Closed"}
                      </span>
                    </div>
                    <p className="mt-1 text-[14px] font-semibold leading-snug">{x.title}</p>
                    <p className="text-[12px] text-d-mute">{x.dept}</p>
                    <div className="mt-2 flex items-center gap-3 text-[12px]">
                      <span className="tnum font-mono font-semibold">{inr(x.value, { compact: true })}</span>
                      <span className="text-d-mute">EMD {x.emd ? inr(x.emd, { compact: true }) : "exempt"}</span>
                      <span className="flex min-w-[120px] flex-1 items-center gap-2">
                        <Meter value={d} max={x.docs.length} tone={d === x.docs.length ? "ok" : "warn"} />
                        <span className="font-mono text-[11px] text-d-mute">
                          {d}/{x.docs.length}
                        </span>
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>
        <Panel icon={FileCheck} title={t.title} sub={`${t.portal} · EMD ${t.emd ? `${inr(t.emd)} via ${t.emdMode}` : t.emdMode}`}>
          {t.inHours > 0 && (
            <div className="mb-4 rounded-[14px] bg-d-sunk p-4">
              <p className="text-[11.5px] font-medium text-d-mute">Bid closes in</p>
              <Countdown inHours={t.inHours} />
            </div>
          )}
          <p className="mb-1 text-[12px] font-medium text-d-mute">
            Documents · {docsDone} of {t.docs.length} ready
          </p>
          <Checklist items={t.docs} onToggle={toggleDoc} />
          <div className="mt-4 flex flex-wrap gap-2">
            <Btn
              icon={Send}
              onClick={() => {
                toast.success("Checklist sent to Sunil on WhatsApp", { description: `${t.docs.length - docsDone} documents open` });
                desk.log(`${t.id} checklist sent to Sunil`);
              }}
            >
              Send to Sunil
            </Btn>
            <Btn
              variant="solid"
              icon={Gavel}
              disabled={!canSubmit}
              onClick={() => {
                setTenders((cur) => cur.map((x) => (x.id === t.id ? { ...x, status: "Submitted" } : x)));
                toast.success("Bid submitted on portal", { description: `${t.id} · acknowledgement saved to Google Drive` });
                desk.log(`Bid submitted: ${t.title}`, "ok");
              }}
            >
              {t.status === "Submitted" ? "Submitted" : "Submit bid"}
            </Btn>
          </div>
          {!canSubmit && t.inHours > 0 && t.status !== "Submitted" && <p className="mt-2 text-[12px] text-d-mute">Submit unlocks when every document is ready.</p>}
        </Panel>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="EMD tracker" sub="Money sitting with departments. Refund letters drafted by Tender Watch.">
          <DataTable
            rows={emds}
            rowKey={(e) => e.id}
            filter={{ get: (e) => e.state, options: ["Refund due", "Locked", "BG live", "Refunded"] }}
            columns={[
              { key: "t", label: "Tender", render: (e) => <span className="font-medium">{e.tender}</span>, sort: (e) => e.tender },
              { key: "a", label: "Amount", align: "right", render: (e) => <span className="tnum font-mono">{inr(e.amount)}</span>, sort: (e) => e.amount },
              { key: "m", label: "Mode", render: (e) => <span className="text-d-mute">{e.mode}</span>, wide: true },
              { key: "d", label: "Days", align: "right", render: (e) => <span className="tnum font-mono" style={{ color: e.days > 90 && e.state === "Refund due" ? "var(--d-late)" : undefined }}>{e.days}</span>, sort: (e) => e.days },
              {
                key: "s",
                label: "",
                align: "right",
                render: (e) =>
                  e.state === "Refund due" && !refunds.has(e.id) ? (
                    <Btn
                      size="sm"
                      variant="soft"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setRefunds((s) => new Set(s).add(e.id));
                        toast.success("Refund request filed", { description: `${e.tender} · ${inr(e.amount)}` });
                        desk.log(`EMD refund requested: ${e.tender}`, "info");
                      }}
                    >
                      Request refund
                    </Btn>
                  ) : (
                    <Pill tone={refunds.has(e.id) ? "info" : e.state === "Refunded" ? "ok" : e.state === "BG live" ? "accent" : "neutral"}>{refunds.has(e.id) ? "Requested" : e.state}</Pill>
                  ),
              },
            ]}
          />
        </Panel>
        <Panel title="Bid results" sub="Last six quarters">
          <Bars
            height={190}
            data={["Q3 '25", "Q4 '25", "Q1 '26", "Q2 '26", "Q3 '26", "Q4 '26"].map((q, i) => ({
              label: q,
              value: [3, 2, 4, 3, 5, 2][i],
              stack: [
                { name: "Won", value: [1, 0, 1, 1, 2, 1][i], tone: "ok" as const },
                { name: "Lost", value: [2, 2, 2, 1, 2, 0][i], tone: "late" as const },
                { name: "Pending", value: [0, 0, 1, 1, 1, 1][i], tone: "neutral" as const },
              ],
            }))}
          />
        </Panel>
      </div>
    </div>
  );
}

/* ============================================================
   Payments
   ============================================================ */

function PaymentsModule() {
  const desk = useDesk();
  const [open, setOpen] = React.useState<Due | null>(null);
  const [sent, setSent] = React.useState<Set<string>>(new Set());
  const [promises, setPromises] = React.useState<Record<string, string>>({});
  const [promise, setPromise] = React.useState("");
  const total = dues.reduce((a, d) => a + d.amount, 0);
  const bucket = (d: number) => (d <= 30 ? "0–30 days" : d <= 60 ? "31–60 days" : d <= 90 ? "61–90 days" : "90+ days");
  const labels = ["0–30 days", "31–60 days", "61–90 days", "90+ days"];
  const buckets = labels.map((label, i) => ({ label, value: dues.filter((x) => bucket(x.days) === label).reduce((a, x) => a + x.amount, 0), tone: (["ok", "info", "warn", "late"] as const)[i] }));
  const draft = (d: Due) =>
    d.kind === "Govt"
      ? `Respected Sir/Madam, Ganga Learning Kits ka bill ${d.no} (${inr(d.amount)}, dated ${d.raised}) aapke karyalay mein ${d.days} din se lambit hai. Kripya PFMS par bill ki sthiti bata dein. Sabhi delivery challan aur POD sanlagn hain. Dhanyavaad, Neha Agarwal, Accounts`
      : `Namaste ${d.contact} ji, Ganga Learning Kits se ek reminder. Invoice ${d.no} for ${inr(d.amount)} (raised ${d.raised}) is ${d.days} days old. UPI: gangakits@sbi. Payment by 31 Oct par 2% ki chhoot. Dhanyavaad, Neha`;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Outstanding" value={inr(total, { compact: true })} delta="+4%" deltaGood={false} hint="vs last month" icon={IndianRupee} tone="warn" trend={[24, 25, 25, 26, 27, 27, total / 1e5]} />
        <Stat label="Govt share" value={inr(dues.filter((d) => d.kind === "Govt").reduce((a, d) => a + d.amount, 0), { compact: true })} hint="5 offices, 2 passed on PFMS" icon={Landmark} tone="info" />
        <Stat label="Over 90 days" value={inr(dues.filter((d) => d.days > 90).reduce((a, d) => a + d.amount, 0), { compact: true })} hint={`${dues.filter((d) => d.days > 90).length} invoices`} icon={TriangleAlert} tone="late" />
        <Stat label="Collected in October" value="₹14.2 L" delta="+21%" icon={HandCoins} tone="ok" trend={[6, 8, 7, 10, 11, 12, 14.2]} />
      </div>
      <Panel title="Ageing" sub="From Tally. Govt bills also show their PFMS stage.">
        <AgingBar buckets={buckets} format={(v) => inr(v, { compact: true })} />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Panel title="Invoices" sub="Select rows to send reminders in one go, or click one for the draft">
          <DataTable
            rows={dues}
            rowKey={(d) => d.no}
            search={(d) => `${d.no} ${d.party} ${d.contact}`}
            searchPlaceholder="Search school, office or invoice"
            filter={{ get: (d) => d.kind, options: ["School", "Govt", "CSR"] }}
            onRow={(d) => {
              setOpen(d);
              setPromise(promises[d.no] ?? d.promise ?? "");
            }}
            bulk={[
              {
                label: "Send WhatsApp reminders",
                run: (keys) => {
                  setSent((s) => new Set([...s, ...keys]));
                  toast.success(`${keys.length} reminders sent`);
                  desk.log(`${keys.length} payment reminders sent on WhatsApp`, "info");
                },
              },
            ]}
            columns={[
              { key: "no", label: "Invoice", render: (d) => <span className="font-mono text-[12px]">{d.no}</span> },
              { key: "p", label: "Party", render: (d) => (<div><p className="font-medium">{d.party}</p><p className="text-[11.5px] text-d-mute">{d.kind} · {d.contact}</p></div>), sort: (d) => d.party },
              { key: "a", label: "Amount", align: "right", render: (d) => <span className="tnum font-mono">{inr(d.amount)}</span>, sort: (d) => d.amount },
              { key: "d", label: "Days", align: "right", render: (d) => <span className="tnum font-mono" style={{ color: d.days > 90 ? "var(--d-late)" : d.days > 60 ? "var(--d-warn)" : undefined }}>{d.days}</span>, sort: (d) => d.days },
              { key: "s", label: "Promise", render: (d) => (sent.has(d.no) ? <Pill tone="info">Reminded</Pill> : promises[d.no] || d.promise ? <Pill tone="ok">{promises[d.no] || d.promise}</Pill> : <span className="text-d-mute">—</span>), wide: true },
            ]}
          />
        </Panel>
        <div className="space-y-5">
          <Panel title="Expected inflow" sub="Promises + PFMS + fee season">
            <Bars height={170} format={(v) => `₹${v}L`} data={[{ label: "This wk", value: 3.2, tone: "accent" }, { label: "Next wk", value: 9.8, tone: "ok" }, { label: "Wk 3", value: 4.4, tone: "accent" }, { label: "Wk 4", value: 2.9, tone: "info" }, { label: "Later", value: 7.6, tone: "late" }]} />
          </Panel>
          <Panel title="Govt bills on PFMS" sub="Where each bill is stuck">
            <ul className="space-y-2.5 text-[12.5px]">
              {[
                { o: "Saran DEO", s: "Payment advice generated", t: "ok" as const },
                { o: "Jeevika Nalanda", s: "At DPM for sanction", t: "info" as const },
                { o: "Vaishali ICDS", s: "Budget head exhausted", t: "late" as const },
                { o: "Purnea DEO", s: "File not traced", t: "late" as const },
                { o: "Samastipur school", s: "Bill uploaded", t: "accent" as const },
              ].map((b) => (
                <li key={b.o} className="flex items-center justify-between gap-2">
                  <span className="font-medium">{b.o}</span>
                  <Pill tone={b.t}>{b.s}</Pill>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={open?.no}
        title={open?.party ?? ""}
        sub={open ? `${inr(open.amount)} · ${open.days} days · raised ${open.raised}` : ""}
        footer={
          open && (
            <>
              <Btn
                onClick={() => {
                  setPromises((p) => ({ ...p, [open.no]: promise }));
                  toast.success("Promise logged", { description: promise || "No date" });
                  desk.log(`Promise logged for ${open.party}: ${promise}`, "info");
                }}
              >
                Save promise
              </Btn>
              <Btn
                variant="solid"
                icon={MessageCircle}
                onClick={() => {
                  setSent((s) => new Set(s).add(open.no));
                  toast.success("Reminder sent on WhatsApp", { description: open.contact });
                  desk.log(`Reminder sent to ${open.party} for ${inr(open.amount)}`, "info");
                  setOpen(null);
                }}
              >
                Send on WhatsApp
              </Btn>
            </>
          )
        }
      >
        {open && (
          <div className="space-y-4">
            <div className="rounded-[14px] bg-[#e7f3e4] p-4 text-[13.5px] leading-relaxed text-[#1f3a24]">{draft(open)}</div>
            <KV items={[{ k: "Type", v: open.kind }, { k: "Contact", v: open.contact }, { k: "Reminders so far", v: open.days > 60 ? "3" : "1" }, { k: "Bucket", v: bucket(open.days) }]} />
            <Field label="Promised payment">
              <input className={inputClass} value={promise} onChange={(e) => setPromise(e.target.value)} placeholder="e.g. Cheque after fee collection, 28 Oct" />
            </Field>
            <p className="flex items-center gap-1.5 text-[12px] text-d-mute">
              <Route className="h-3.5 w-3.5" /> Dues Collector will follow up again in 4 days if no payment shows in Tally.
            </p>
          </div>
        )}
      </Sheet>
    </div>
  );
}

