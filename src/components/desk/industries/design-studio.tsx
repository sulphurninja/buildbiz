"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  Building,
  Camera,
  CalendarClock,
  Check,
  ClipboardCheck,
  DraftingCompass,
  FileStack,
  Gauge as GaugeIcon,
  HardHat,
  IndianRupee,
  Landmark,
  Layers,
  MessageCircle,
  PenTool,
  Plug,
  Plus,
  Ruler,
  Send,
  Stamp,
  Timer,
  Users,
  WavesHorizontal,
} from "lucide-react";
import { DeskShell, useDesk } from "../shell";
import { Bars, Donut, HBars, HeatGrid } from "../charts";
import { AgingBar, Board, Checklist, Countdown, DataTable, Gantt, type GanttRow } from "../data";
import { AgentsModule, ConnectionsModule, IndependenceModule, PeopleModule } from "../common";
import { Btn, Field, inputClass, inr, KV, Meter, Modal, Panel, Pill, Segmented, Sheet, Stat } from "../ui";
import { useDrift } from "../hooks";
import type { DeskConfig, DeskModule, IndependenceData, Integration, TeamMember, Tone, WorkforceAgent } from "../types";

/* ============================================================
   Data — Mandovi Design Studio, Panaji. Fictional architecture
   and interiors practice. Timeline: day 0 = 1 Aug 2026, today = day 80 (20 Oct).
   ============================================================ */

const TODAY = 80;
const TODAY_LABEL = "20 Oct";
const GATES = ["Concept", "SD", "DD", "GFC", "Site"] as const;
const STAGE_PCT = [10, 15, 25, 30, 20];

const PARTIES = ["client", "contractor", "structural"] as const;
type Party = (typeof PARTIES)[number];
const partyLabel: Record<Party, string> = { client: "Client", contractor: "Contractor", structural: "Structural" };

type Disc = "A" | "S" | "E" | "P" | "I";
const discName: Record<Disc, string> = { A: "Architecture", S: "Structure", E: "Electrical", P: "Plumbing", I: "Interiors" };
const discTone: Record<Disc, Tone> = { A: "accent", S: "info", E: "warn", P: "ok", I: "late" };

type Status = "WIP" | "For approval" | "IFC" | "Superseded";
const STATUSES: Status[] = ["WIP", "For approval", "IFC", "Superseded"];
const statusTone: Record<Status, Tone> = { WIP: "neutral", "For approval": "warn", IFC: "ok", Superseded: "late" };

type Purpose = "For approval" | "For construction" | "For information";

type Rev = { date: string; note: string; by: string };
type Drawing = {
  no: string;
  project: string;
  title: string;
  disc: Disc;
  scale: string;
  size: "A1" | "A2" | "A3";
  rev: number;
  status: Status;
  issued: Record<Party, number | null>;
  history: Rev[];
};

type Project = {
  code: string;
  short: string;
  name: string;
  client: string;
  place: string;
  kind: string;
  area: string;
  fee: number;
  stage: number;
  lead: string;
  contractor: string;
  structural: string;
  hoursBudget: number;
  hoursUsed: number;
  swatch: string;
  ends: number[];
};

const seedProjects: Project[] = [
  { code: "MDS-2411", short: "Sequeira", name: "Casa Sequeira", client: "Anthony & Lavina Sequeira", place: "Assagao, Bardez", kind: "Private villa, G+1 with pool", area: "4,200 sq ft", fee: 1850000, stage: 2, lead: "Pooja Naik", contractor: "Sardesai Builders", structural: "Kenkre Structural Consultants", hoursBudget: 1400, hoursUsed: 1010, swatch: "repeating-linear-gradient(45deg,#111 0 2px,#f4e46a 2px 7px)", ends: [8, 40, 74, 120, 230] },
  { code: "MDS-2403", short: "Fontainhas", name: "Fontainhas heritage homestay", client: "Heritage Hospitality Pvt Ltd (Rui Menezes)", place: "Rua de Natal, Fontainhas", kind: "Restoration of a 1890s Indo-Portuguese house, 9 keys", area: "6,800 sq ft", fee: 2400000, stage: 4, lead: "Sameer Dessai", contractor: "Naik Constructions", structural: "Kenkre Structural Consultants", hoursBudget: 2200, hoursUsed: 2050, swatch: "repeating-linear-gradient(90deg,#b8462e 0 3px,#f2d6b8 3px 8px)", ends: [2, 10, 30, 58, 170] },
  { code: "MDS-2502", short: "Miramar", name: "Miramar Sea View Apartments", client: "Coastline Developers (Vishal Prabhu)", place: "Miramar, Panaji", kind: "G+4 residential, 16 flats, CRZ-II", area: "38,500 sq ft", fee: 3600000, stage: 1, lead: "Rohan Kamat", contractor: "Tender after GFC", structural: "Kenkre Structural Consultants", hoursBudget: 2600, hoursUsed: 620, swatch: "repeating-linear-gradient(0deg,#1f4fa3 0 2px,#cfdcf3 2px 6px)", ends: [30, 95, 140, 180, 238] },
  { code: "MDS-2507", short: "Kadamba", name: "Kadamba Café interiors", client: "Shreya Bhonsle (Kadamba Hospitality)", place: "Porvorim", kind: "Café fit-out, 64 covers", area: "2,100 sq ft", fee: 650000, stage: 4, lead: "Fatima D'Souza", contractor: "Woodcraft Interiors, Margao", structural: "—", hoursBudget: 420, hoursUsed: 455, swatch: "radial-gradient(circle,#111 0 1.4px,transparent 1.8px) 0 0/6px 6px,#e9e3c9", ends: [2, 16, 28, 45, 92] },
  { code: "MDS-2509", short: "Dona Paula", name: "SmileCare dental clinic", client: "Dr. Neha Salgaocar", place: "Dona Paula", kind: "Clinic fit-out, 3 chairs + OPD", area: "1,450 sq ft", fee: 480000, stage: 3, lead: "Fatima D'Souza", contractor: "Woodcraft Interiors, Margao", structural: "—", hoursBudget: 360, hoursUsed: 290, swatch: "repeating-linear-gradient(135deg,#2f7d4f 0 2px,#dcefe2 2px 7px)", ends: [22, 40, 62, 78, 130] },
  { code: "MDS-2512", short: "Siolim", name: "Siolim riverside villas", client: "Rivera Estates (Joel Rodrigues)", place: "Siolim, along the Chapora", kind: "4 villas on converted orchard land", area: "11,200 sq ft", fee: 2950000, stage: 0, lead: "Rohan Kamat", contractor: "Not appointed", structural: "Kenkre Structural Consultants", hoursBudget: 2100, hoursUsed: 140, swatch: "repeating-linear-gradient(90deg,#6b6b66 0 1px,#f4f2ea 1px 5px)", ends: [86, 120, 165, 205, 238] },
];

function dw(project: string, no: string, title: string, disc: Disc, scale: string, size: Drawing["size"], status: Status, issued: [number | null, number | null, number | null], history: [string, string, string][]): Drawing {
  return {
    no,
    project,
    title,
    disc,
    scale,
    size,
    status,
    rev: history.length - 1,
    issued: { client: issued[0], contractor: issued[1], structural: issued[2] },
    history: history.map(([date, note, by]) => ({ date, note, by })),
  };
}

const seedDrawings: Drawing[] = [
  dw("MDS-2411", "A-101", "Ground floor plan", "A", "1:100", "A1", "For approval", [1, null, 2], [["4 Aug", "First issue, SD layout", "PN"], ["2 Sep", "Kitchen moved east, pool deck widened", "PN"], ["14 Oct", "Staircase flipped to match S-201 grid", "AF"]]),
  dw("MDS-2411", "A-102", "First floor plan", "A", "1:100", "A1", "WIP", [1, null, 1], [["4 Aug", "First issue", "PN"], ["2 Sep", "Master suite balcao added", "PN"], ["16 Oct", "Toilet sizes per client markup (WIP)", "AF"]]),
  dw("MDS-2411", "A-103", "Terrace and roof plan", "A", "1:100", "A1", "WIP", [0, null, null], [["6 Aug", "Mangalore tile roof, 30° pitch", "PN"], ["12 Oct", "Solar panel zone on south slope", "NP"]]),
  dw("MDS-2411", "A-201", "Elevations, north and south", "A", "1:100", "A1", "For approval", [1, null, null], [["10 Aug", "First issue", "PN"], ["5 Sep", "Laterite cladding band at plinth", "PN"], ["15 Oct", "Window heights aligned to A-101 R2", "AF"]]),
  dw("MDS-2411", "A-202", "Elevations, east and west", "A", "1:100", "A1", "WIP", [0, null, null], [["10 Aug", "First issue", "PN"], ["17 Oct", "Pool pavilion added (WIP)", "AF"]]),
  dw("MDS-2411", "A-301", "Sections AA and BB", "A", "1:50", "A1", "WIP", [null, null, 0], [["24 Aug", "First issue", "NP"], ["13 Oct", "Double-height living revised", "NP"]]),
  dw("MDS-2411", "S-101", "Foundation layout", "S", "1:100", "A1", "IFC", [null, 2, 2], [["20 Aug", "Isolated footings on laterite", "Kenkre"], ["9 Sep", "Pool raft separated", "Kenkre"], ["10 Oct", "Issued for construction", "Kenkre"]]),
  dw("MDS-2411", "S-201", "Column and beam layout, GF roof", "S", "1:100", "A1", "For approval", [null, null, 1], [["2 Sep", "First issue", "Kenkre"], ["11 Oct", "Beam drop reduced over living", "Kenkre"]]),
  dw("MDS-2411", "E-101", "Electrical layout, ground floor", "E", "1:100", "A2", "WIP", [null, null, null], [["15 Oct", "Point layout from client walkthrough", "NP"]]),
  dw("MDS-2411", "P-101", "Plumbing and drainage, ground floor", "P", "1:100", "A2", "WIP", [0, null, null], [["28 Aug", "Septic + soak pit per Panchayat norms", "Velho MEP"], ["14 Oct", "Pool backwash line added", "Velho MEP"]]),

  dw("MDS-2403", "A-101", "Existing ground floor survey", "A", "1:50", "A1", "IFC", [1, 1, 1], [["12 Jun", "Measured survey", "SD"], ["30 Jun", "Structural cracks marked", "SD"]]),
  dw("MDS-2403", "A-102", "Proposed ground floor plan", "A", "1:50", "A1", "IFC", [4, 3, 4], [["20 Jun", "First issue", "SD"], ["14 Jul", "Reception moved to the balcão side", "SD"], ["4 Aug", "Conservation Committee comments", "SD"], ["2 Sep", "Kitchen shifted to rear courtyard", "AF"], ["12 Oct", "Staff toilet relocated, door D7 widened", "AF"]]),
  dw("MDS-2403", "A-201", "Street elevation, Rua de Natal", "A", "1:50", "A1", "IFC", [3, 3, null], [["20 Jun", "First issue", "SD"], ["14 Jul", "Oyster-shell windows retained", "SD"], ["4 Aug", "Lime wash colour per committee", "SD"], ["24 Sep", "IFC", "SD"]]),
  dw("MDS-2403", "A-202", "Courtyard elevation", "A", "1:50", "A1", "Superseded", [2, 2, null], [["22 Jun", "First issue", "SD"], ["14 Jul", "Well head retained", "SD"], ["4 Aug", "Superseded by A-202A", "SD"]]),
  dw("MDS-2403", "A-202A", "Courtyard elevation, revised balcão", "A", "1:50", "A1", "For approval", [0, null, null], [["8 Oct", "Balcão seats rebuilt in laterite", "AF"]]),
  dw("MDS-2403", "A-501", "Door and window schedule", "A", "1:20", "A1", "IFC", [2, 2, null], [["5 Jul", "First issue", "NP"], ["10 Aug", "Teak frames, oyster-shell panes", "NP"], ["22 Sep", "IFC", "NP"]]),
  dw("MDS-2403", "S-301", "Roof truss repair details", "S", "1:20", "A1", "IFC", [null, 1, 2], [["18 Jul", "Matti wood truss splice", "Kenkre"], ["26 Aug", "Steel flitch plates at bearings", "Kenkre"], ["9 Oct", "Termite treatment note added", "Kenkre"]]),
  dw("MDS-2403", "P-201", "Rainwater and septic layout", "P", "1:100", "A2", "IFC", [1, 1, null], [["24 Jul", "First issue", "Velho MEP"], ["18 Sep", "IFC", "Velho MEP"]]),

  dw("MDS-2502", "A-001", "Site plan with CRZ line and HTL", "A", "1:200", "A1", "For approval", [2, null, 1], [["2 Sep", "Survey overlay, 200 m HTL setback", "RK"], ["22 Sep", "Parking moved landward of CRZ line", "RK"], ["13 Oct", "GCZMA format, area statement added", "PN"]]),
  dw("MDS-2502", "A-101", "Typical floor plan, 4 flats", "A", "1:100", "A1", "WIP", [0, null, 0], [["9 Sep", "2 + 3 BHK mix", "RK"], ["15 Oct", "Lift core shifted (WIP)", "AF"]]),
  dw("MDS-2502", "A-201", "Front elevation, sea side", "A", "1:100", "A1", "WIP", [0, null, null], [["30 Sep", "Concept facade with jaali", "RK"]]),
  dw("MDS-2502", "S-001", "Pile foundation concept", "S", "1:200", "A2", "WIP", [null, null, 0], [["7 Oct", "Bored piles, soil report pending", "Kenkre"]]),

  dw("MDS-2507", "I-101", "Furniture layout, 64 covers", "I", "1:50", "A2", "IFC", [3, 3, null], [["10 Aug", "First issue", "FD"], ["21 Aug", "Bar stools reduced to 8", "FD"], ["3 Sep", "Kids corner added", "FD"], ["18 Oct", "IFC", "FD"]]),
  dw("MDS-2507", "I-201", "Bar counter details", "I", "1:10", "A2", "IFC", [2, 1, null], [["14 Aug", "First issue", "FD"], ["29 Aug", "Kota stone top", "FD"], ["11 Oct", "Back bar shelving deeper by 75 mm", "FD"]]),
  dw("MDS-2507", "I-301", "Reflected ceiling plan", "I", "1:50", "A2", "IFC", [2, 2, null], [["16 Aug", "First issue", "FD"], ["30 Aug", "Cane pendants over tables", "FD"], ["18 Oct", "IFC", "FD"]]),
  dw("MDS-2507", "E-201", "Lighting and power layout", "E", "1:50", "A2", "IFC", [1, 2, null], [["18 Aug", "First issue", "NP"], ["2 Sep", "Coffee machine 32A point", "NP"], ["19 Sep", "IFC", "NP"]]),

  dw("MDS-2509", "I-101", "Layout, OPD and 3 chairs", "I", "1:50", "A2", "For approval", [1, null, null], [["2 Sep", "First issue", "FD"], ["24 Sep", "Sterilisation room enlarged", "FD"], ["16 Oct", "X-ray room lead lining zone", "FD"]]),
  dw("MDS-2509", "E-101", "Electrical and UPS layout", "E", "1:50", "A2", "WIP", [0, null, null], [["10 Sep", "First issue", "NP"], ["17 Oct", "Chair points per Dentsply spec (WIP)", "NP"]]),
  dw("MDS-2509", "P-101", "Plumbing for dental chairs", "P", "1:50", "A2", "For approval", [0, null, null], [["12 Sep", "First issue", "Velho MEP"], ["15 Oct", "Suction line and amalgam trap", "Velho MEP"]]),

  dw("MDS-2512", "A-001", "Massing and site plan, 3 options", "A", "1:500", "A1", "WIP", [null, null, null], [["16 Oct", "Options A/B/C around the mango trees", "RK"]]),
];

const keyOf = (d: Drawing) => `${d.project}/${d.no}`;
const rl = (n: number | null) => (n === null ? "—" : `R${n}`);
const projectOf = (code: string) => seedProjects.find((p) => p.code === code)!;

type Transmittal = { no: string; date: string; project: string; sheets: string[]; to: Party[]; purpose: Purpose };
const seedTransmittals: Transmittal[] = [
  { no: "TR-0418", date: "18 Oct", project: "Kadamba", sheets: ["I-101 R3", "I-301 R2"], to: ["client", "contractor"], purpose: "For construction" },
  { no: "TR-0417", date: "16 Oct", project: "Sequeira", sheets: ["S-101 R2"], to: ["contractor", "structural"], purpose: "For construction" },
  { no: "TR-0416", date: "14 Oct", project: "Miramar", sheets: ["A-001 R2"], to: ["client"], purpose: "For approval" },
  { no: "TR-0415", date: "10 Oct", project: "Fontainhas", sheets: ["A-201 R3", "A-501 R2"], to: ["client", "contractor"], purpose: "For construction" },
  { no: "TR-0414", date: "7 Oct", project: "Dona Paula", sheets: ["I-101 R1"], to: ["client"], purpose: "For approval" },
];

function staleOf(drawings: Drawing[]) {
  return drawings.flatMap((d) =>
    d.status !== "IFC" ? [] : PARTIES.filter((p) => p !== "client" && d.issued[p] !== null && (d.issued[p] as number) < d.rev).map((p) => ({ d, party: p, holding: d.issued[p] as number })),
  );
}

/* ---- Fees ---- */
type Bill = "paid" | "invoiced" | "ready" | "wip" | "future";
const seedBilling: Record<string, Bill[]> = {
  "MDS-2411": ["paid", "invoiced", "wip", "future", "future"],
  "MDS-2403": ["paid", "paid", "paid", "invoiced", "wip"],
  "MDS-2502": ["paid", "wip", "future", "future", "future"],
  "MDS-2507": ["paid", "paid", "paid", "paid", "ready"],
  "MDS-2509": ["paid", "paid", "invoiced", "wip", "future"],
  "MDS-2512": ["ready", "future", "future", "future", "future"],
};
type Invoice = { no: string; project: string; client: string; for: string; amount: number; raised: string; days: number; stage?: number; promise?: string };
const seedInvoices: Invoice[] = [
  { no: "MDS/26-27/041", project: "MDS-2411", client: "Anthony Sequeira", for: "SD stage, 15%", amount: 277500, raised: "12 Sep", days: 38, stage: 1, promise: "NEFT on Friday" },
  { no: "MDS/26-27/033", project: "MDS-2403", client: "Heritage Hospitality", for: "GFC stage, 30%", amount: 720000, raised: "17 Aug", days: 64, stage: 3, promise: "After bank disbursal, 30 Oct" },
  { no: "MDS/26-27/046", project: "MDS-2509", client: "Dr. Neha Salgaocar", for: "DD stage, 25%", amount: 120000, raised: "28 Sep", days: 22, stage: 2 },
  { no: "MDS/26-27/024", project: "MDS-2403", client: "Heritage Hospitality", for: "6 additional site visits", amount: 54000, raised: "17 Jul", days: 95 },
  { no: "MDS/26-27/038", project: "MDS-2507", client: "Kadamba Hospitality", for: "Bar redesign (variation)", amount: 38000, raised: "3 Sep", days: 47 },
  { no: "MDS/26-27/049", project: "MDS-2502", client: "Coastline Developers", for: "CRZ survey reimbursement", amount: 62000, raised: "8 Oct", days: 12 },
  { no: "MDS/25-26/188", project: "MDS-2318", client: "Pereira family, Aldona", for: "Casa Pereira final 20%", amount: 185000, raised: "14 Jun", days: 128 },
  { no: "MDS/26-27/043", project: "MDS-2411", client: "Anthony Sequeira", for: "Pool consultant pass-through", amount: 45000, raised: "20 Sep", days: 30 },
  { no: "MDS/26-27/036", project: "MDS-2502", client: "Coastline Developers", for: "Feasibility and area statement", amount: 96000, raised: "26 Aug", days: 55 },
];

/* ---- Snags & visits ---- */
type SnagCol = "logged" | "contractor" | "verify" | "closed";
type Snag = { id: string; project: string; title: string; where: string; sev: "High" | "Medium" | "Low"; by: string; photos: number; raised: string; col: SnagCol };
const seedSnags: Snag[] = [
  { id: "SN-231", project: "MDS-2403", title: "Lime plaster cracking above window W4", where: "Street facade, FF", sev: "High", by: "Kunal", photos: 4, raised: "18 Oct", col: "logged" },
  { id: "SN-232", project: "MDS-2403", title: "Door D7 built to old width (R3)", where: "Staff toilet", sev: "High", by: "Kunal", photos: 2, raised: "19 Oct", col: "logged" },
  { id: "SN-228", project: "MDS-2507", title: "Back bar shelf depth 75 mm short", where: "Bar counter", sev: "Medium", by: "Fatima", photos: 3, raised: "16 Oct", col: "contractor" },
  { id: "SN-226", project: "MDS-2507", title: "Cane pendant height uneven over T4–T6", where: "Dining", sev: "Low", by: "Fatima", photos: 2, raised: "15 Oct", col: "contractor" },
  { id: "SN-224", project: "MDS-2403", title: "Roof tile overlap less than 75 mm", where: "Rear wing roof", sev: "High", by: "Kunal", photos: 5, raised: "12 Oct", col: "contractor" },
  { id: "SN-225", project: "MDS-2507", title: "Kota top joint visible at sink", where: "Bar counter", sev: "Medium", by: "Fatima", photos: 1, raised: "14 Oct", col: "verify" },
  { id: "SN-221", project: "MDS-2403", title: "Courtyard drain slope reversed", where: "Courtyard", sev: "High", by: "Kunal", photos: 3, raised: "8 Oct", col: "verify" },
  { id: "SN-219", project: "MDS-2507", title: "Switch plate colour mismatch", where: "Entry", sev: "Low", by: "Ninad", photos: 1, raised: "6 Oct", col: "verify" },
  { id: "SN-215", project: "MDS-2403", title: "Balcão seat coping chipped", where: "Front balcão", sev: "Medium", by: "Kunal", photos: 2, raised: "2 Oct", col: "closed" },
  { id: "SN-212", project: "MDS-2507", title: "Kids corner skirting gap", where: "Kids corner", sev: "Low", by: "Fatima", photos: 1, raised: "29 Sep", col: "closed" },
  { id: "SN-210", project: "MDS-2411", title: "Footing F7 excavated 300 mm off grid", where: "Grid C/4", sev: "High", by: "Kunal", photos: 3, raised: "19 Oct", col: "logged" },
  { id: "SN-208", project: "MDS-2403", title: "Teak frame W2 not seasoned, warping", where: "Room 3", sev: "Medium", by: "Kunal", photos: 2, raised: "27 Sep", col: "closed" },
];
const visits = [
  { id: "V1", day: "Today 4:00", project: "MDS-2411", who: "Kunal + Pooja", purpose: "Footing inspection before PCC, grid C/4" },
  { id: "V2", day: "Wed 10:30", project: "MDS-2403", who: "Sameer + Kunal", purpose: "Roof tiling sign-off, rear wing" },
  { id: "V3", day: "Wed 3:00", project: "MDS-2507", who: "Fatima", purpose: "Pre-handover snag walk with Shreya" },
  { id: "V4", day: "Thu 11:00", project: "MDS-2509", who: "Fatima + Ninad", purpose: "Site measure for chair points" },
  { id: "V5", day: "Fri 9:30", project: "MDS-2512", who: "Rohan", purpose: "Tree survey with Joel, option walk" },
  { id: "V6", day: "Sat 10:00", project: "MDS-2403", who: "Rohan", purpose: "Conservation Committee member visit" },
];

/* ---- Approvals ---- */
type Statutory = { id: string; project: string; authority: string; what: string; filed: string; days: number; status: "Drafting" | "Filed" | "Query raised" | "Site inspection" | "Approved"; next: string; docs: [string, boolean][] };
const statutory: Statutory[] = [
  { id: "AP-01", project: "MDS-2502", authority: "GCZMA", what: "CRZ-II clearance", filed: "15 Oct", days: 5, status: "Filed", next: "Agenda of the 29 Oct meeting", docs: [["CRZ map by NCSCM-approved agency", true], ["HTL/LTL demarcation", true], ["Form-I and area statement", true], ["Fee challan", true], ["NOC from CCP", false]] },
  { id: "AP-02", project: "MDS-2502", authority: "CCP", what: "Building licence", filed: "—", days: 0, status: "Drafting", next: "Waiting for GCZMA clearance", docs: [["Ownership documents", true], ["Structural stability certificate", false], ["Fire NOC (G+4)", false], ["Drawings set A-001 to A-301", false]] },
  { id: "AP-03", project: "MDS-2502", authority: "Fire & Emergency Services", what: "Provisional fire NOC", filed: "9 Oct", days: 11, status: "Query raised", next: "Staircase width 1.2 m asked; reply due 24 Oct", docs: [["Fire layout", true], ["Staircase details", false], ["Hydrant and tank sizing", true]] },
  { id: "AP-04", project: "MDS-2512", authority: "TCP, North Goa", what: "Zoning certificate and technical clearance", filed: "2 Oct", days: 18, status: "Site inspection", next: "Inspector visit Thu 22 Oct", docs: [["Survey plan (Form I & XIV)", true], ["Sanad conversion order", true], ["Site plan with setbacks", true], ["Tree census", false]] },
  { id: "AP-05", project: "MDS-2512", authority: "Collectorate, North Goa", what: "Sanad (land conversion)", filed: "4 Jun", days: 138, status: "Approved", next: "Order received 1 Sep", docs: [["Conversion application", true], ["TCP report", true]] },
  { id: "AP-06", project: "MDS-2512", authority: "Village Panchayat Siolim", what: "Construction licence", filed: "—", days: 0, status: "Drafting", next: "After TCP technical clearance", docs: [["TCP clearance", false], ["Drawings", false], ["Septic design", false]] },
  { id: "AP-07", project: "MDS-2403", authority: "Conservation Committee, Panaji", what: "Heritage precinct permission", filed: "6 Jul", days: 106, status: "Approved", next: "Conditions: lime wash palette, retain windows", docs: [["Photo survey", true], ["Existing and proposed drawings", true]] },
  { id: "AP-08", project: "MDS-2403", authority: "CCP", what: "Repair and renovation licence", filed: "20 Aug", days: 61, status: "Query raised", next: "Parking waiver letter asked; reply drafted", docs: [["Heritage permission", true], ["Structural repair report", true], ["Parking waiver request", false]] },
  { id: "AP-09", project: "MDS-2411", authority: "Village Panchayat Assagao", what: "Construction licence", filed: "28 Aug", days: 53, status: "Approved", next: "Licence 1182/2026 received 14 Oct", docs: [["TCP technical clearance", true], ["Drawings", true], ["Fee", true]] },
  { id: "AP-10", project: "MDS-2509", authority: "Goa Directorate of Health Services", what: "Clinic registration layout check", filed: "13 Oct", days: 7, status: "Filed", next: "AERB layout for X-ray room in parallel", docs: [["Layout I-101", true], ["AERB room shielding note", false]] },
];
const clientSignoffs = [
  { id: "CS-1", project: "MDS-2411", item: "A-101 R2 and A-201 R2, plan + elevations", sent: "15 Oct", waiting: 5, via: "WhatsApp + PDF set" },
  { id: "CS-2", project: "MDS-2403", item: "A-202A R0 courtyard balcão", sent: "8 Oct", waiting: 12, via: "Site meeting" },
  { id: "CS-3", project: "MDS-2509", item: "I-101 R2 clinic layout", sent: "16 Oct", waiting: 4, via: "Email" },
  { id: "CS-4", project: "MDS-2509", item: "Material board: Corian, vinyl, laminates", sent: "12 Oct", waiting: 8, via: "Studio meeting" },
  { id: "CS-5", project: "MDS-2502", item: "Facade option B with laterite jaali", sent: "30 Sep", waiting: 20, via: "Presentation" },
  { id: "CS-6", project: "MDS-2507", item: "Final signage artwork", sent: "17 Oct", waiting: 3, via: "WhatsApp" },
];

/* ---- Time ---- */
const WEEKS = ["W36", "W37", "W38", "W39", "W40", "W41", "W42", "W43"];
const hoursGrid = [
  [42, 48, 56, 61, 58, 66, 72, 38],
  [64, 58, 52, 47, 44, 40, 46, 22],
  [12, 18, 26, 30, 38, 46, 52, 30],
  [36, 40, 44, 38, 30, 26, 32, 18],
  [10, 14, 18, 22, 26, 30, 28, 16],
  [0, 0, 0, 4, 8, 12, 24, 14],
  [18, 16, 20, 17, 19, 22, 18, 9],
];
const hoursRows = ["Sequeira", "Fontainhas", "Miramar", "Kadamba", "Dona Paula", "Siolim", "Studio / admin"];
type Entry = { id: string; who: string; project: string; task: string; hours: number; day: string; billable: boolean };
const seedEntries: Entry[] = [
  { id: "T-01", who: "Pooja Naik", project: "Sequeira", task: "A-101 R2 client markups", hours: 4.5, day: "Mon", billable: true },
  { id: "T-02", who: "Anisha Fernandes", project: "Sequeira", task: "A-102 toilets, A-202 pavilion", hours: 7, day: "Mon", billable: true },
  { id: "T-03", who: "Sameer Dessai", project: "Fontainhas", task: "CCP query reply, parking waiver", hours: 3, day: "Mon", billable: true },
  { id: "T-04", who: "Kunal Gaonkar", project: "Fontainhas", task: "Site: roof tiling, snag photos", hours: 6, day: "Mon", billable: true },
  { id: "T-05", who: "Rohan Kamat", project: "Miramar", task: "GCZMA presentation prep", hours: 3.5, day: "Mon", billable: true },
  { id: "T-06", who: "Fatima D'Souza", project: "Kadamba", task: "Snag walk, bar shelving fix", hours: 5, day: "Mon", billable: false },
  { id: "T-07", who: "Ninad Parsekar", project: "Dona Paula", task: "E-101 chair points", hours: 6.5, day: "Mon", billable: true },
  { id: "T-08", who: "Rohan Kamat", project: "Siolim", task: "Massing options A/B/C", hours: 4, day: "Mon", billable: true },
  { id: "T-09", who: "Leena Shirodkar", project: "Studio / admin", task: "GST return, fee follow-ups", hours: 5, day: "Mon", billable: false },
  { id: "T-10", who: "Pooja Naik", project: "Sequeira", task: "MEP coordination with Velho", hours: 2.5, day: "Tue", billable: true },
  { id: "T-11", who: "Anisha Fernandes", project: "Miramar", task: "A-101 lift core shift", hours: 3, day: "Tue", billable: true },
  { id: "T-12", who: "Kunal Gaonkar", project: "Sequeira", task: "Footing F7 setting-out check", hours: 2, day: "Tue", billable: true },
];

/* ---- Shared modules ---- */
const team: TeamMember[] = [
  { name: "Rohan Kamat", role: "Principal architect", status: "Busy", load: 96, focus: "Signing every IFC set; GCZMA presentation on 29 Oct", tasks: [{ title: "Check and sign Sequeira A-101 R2", due: "11:00" }, { title: "Coastline: facade option B call", due: "3:00" }, { title: "Siolim option walk", due: "Fri" }], week: [1, 1, 1, 1, 1, 1], since: "2009" },
  { name: "Pooja Naik", role: "Associate, Casa Sequeira lead", status: "Busy", load: 84, focus: "DD closing 6 days late; waiting on client toilet markups", tasks: [{ title: "Send A-101/A-201 R2 for sign-off", due: "done", done: true }, { title: "MEP coordination round", due: "Tue" }, { title: "Footing check with Kunal", due: "4:00" }], week: [1, 1, 1, 1, 1, 0], since: "2015" },
  { name: "Sameer Dessai", role: "Project architect, heritage", status: "In field", load: 78, focus: "Fontainhas on site; CCP parking-waiver reply", tasks: [{ title: "Reply to CCP query", due: "Thu" }, { title: "Roof tiling sign-off", due: "Wed" }], week: [1, 1, 0, 1, 1, 1], since: "2017" },
  { name: "Fatima D'Souza", role: "Interior designer", status: "In field", load: 88, focus: "Kadamba handover Saturday; clinic layout sign-off", tasks: [{ title: "Pre-handover snag walk", due: "Wed" }, { title: "Clinic material board follow-up", due: "today" }], week: [1, 1, 1, 1, 1, 1], since: "2019" },
  { name: "Kunal Gaonkar", role: "Site architect", status: "In field", load: 74, focus: "Two sites a day; 4 high snags open", tasks: [{ title: "Sequeira footings before PCC", due: "4:00" }, { title: "Upload Fontainhas photos", due: "6:00" }], week: [1, 1, 1, 1, 1, 1], since: "2021" },
  { name: "Ninad Parsekar", role: "BIM and CAD lead", status: "On floor", load: 69, focus: "Sheet sets and plot styles; clinic E-101", tasks: [{ title: "E-101 chair points", due: "Thu" }, { title: "Revit families for Siolim", due: "next wk" }], week: [1, 1, 1, 1, 1, 0], since: "2018" },
  { name: "Anisha Fernandes", role: "Junior architect", status: "On floor", load: 81, focus: "Sequeira revisions and Miramar lift core", tasks: [{ title: "A-202 pool pavilion", due: "Wed" }, { title: "A-101 Miramar core", due: "Thu" }], week: [1, 1, 1, 1, 1, 1], since: "2024" },
  { name: "Leena Shirodkar", role: "Accounts and office", status: "On floor", load: 55, focus: "₹15.9 L fees outstanding; Pereira 128 days", tasks: [{ title: "GSTR-1 for September", due: "done", done: true }, { title: "Fee reminders", due: "5:00" }], week: [1, 1, 1, 1, 1, 0], since: "2016" },
];

const agents: WorkforceAgent[] = [
  { name: "Register Keeper", role: "Watches every revision against what each party holds", icon: FileStack, status: "Needs you", runsToday: 18, hoursSaved: 5.5, accuracy: 97, last: "3 min ago", skills: ["AutoCAD sheet sets", "Revision clouds", "Transmittals"], schedule: "On every plot or upload", inbox: [{ title: "Naik Constructions is building from A-102 R3", detail: "R4 moved door D7 and the staff toilet. Snag SN-232 already shows the old width. Re-issue R4 now?" }], log: ["Flagged 3 stale sets on site", "Matched TR-0418 to I-101 R3 and I-301 R2", "Marked A-202 superseded by A-202A"] },
  { name: "Transmittal Clerk", role: "Builds transmittal sheets and sends PDF sets", icon: Send, status: "Running", runsToday: 6, hoursSaved: 3, accuracy: 95, last: "40 min ago", skills: ["PDF sets", "WhatsApp", "Email"], schedule: "When a set is marked for issue", log: ["TR-0418 sent to Shreya and Woodcraft", "Watermarked superseded sheets", "Logged receipt from Sardesai Builders"] },
  { name: "Fee Follow-up", role: "Raises stage invoices and follows up politely", icon: IndianRupee, status: "Needs you", runsToday: 3, hoursSaved: 4, accuracy: 90, last: "1 h ago", skills: ["Tally", "GST", "WhatsApp"], schedule: "Daily 5 PM", inbox: [{ title: "Kadamba final 20% is ready to bill", detail: "Site stage complete pending snags. ₹1.3 L + GST. Raise today so it lands before handover?" }], log: ["Pereira at 128 days, escalated to Rohan", "Heritage Hospitality promise logged: 30 Oct", "Drafted Siolim concept advance"] },
  { name: "Approval Tracker", role: "Watches CCP, TCP and GCZMA portals and letters", icon: Landmark, status: "Running", runsToday: 9, hoursSaved: 3.5, accuracy: 92, last: "12 min ago", skills: ["Portals", "Hearing dates", "Document lists"], schedule: "Every 2 hours", log: ["GCZMA listed Miramar for 29 Oct", "Fire NOC query: stair width, due 24 Oct", "TCP inspector visit set for Thu"] },
  { name: "Snag Recorder", role: "Turns site WhatsApp photos into snags", icon: Camera, status: "Running", runsToday: 11, hoursSaved: 2.5, accuracy: 89, last: "just now", skills: ["Photos", "Location tags", "Contractor groups"], schedule: "On every site photo", log: ["SN-232 from Kunal's photo at 9:42", "SN-210 footing F7 off grid", "Moved SN-225 to verify"] },
  { name: "Client Desk", role: "Answers client status questions from the register", icon: MessageCircle, status: "Idle", runsToday: 4, hoursSaved: 1.5, accuracy: 88, last: "2 h ago", skills: ["WhatsApp", "Register", "Schedules"], schedule: "On incoming message", log: ["Told Lavina the pool pavilion drawing comes Wednesday", "Shared Kadamba handover checklist", "Sent Dr. Salgaocar the layout PDF"] },
];

const independence: IndependenceData = {
  score: 38,
  history: [24, 27, 29, 31, 33, 35, 36],
  quote: "Nothing leaves this studio without my initials on it. That is why we are good, and why I haven't taken a Sunday off since Diwali.",
  pillars: [
    { name: "Design sign-off", score: 22, note: "Every IFC sheet waits for Rohan; average 2.3 days in his tray.", fixes: [{ title: "Associates sign interiors IFC", gain: 4 }, { title: "Checklist-based sheet check", gain: 3 }] },
    { name: "Clients", score: 41, note: "Three clients only call Rohan, even for door handles.", fixes: [{ title: "Client Desk answers status", gain: 3 }, { title: "Weekly client digest", gain: 2 }] },
    { name: "Site and snags", score: 46, note: "Kunal logs snags but closure needs a principal visit.", fixes: [{ title: "Photo-verified snag closure", gain: 3 }] },
    { name: "Approvals", score: 33, note: "Authority follow-up lives in Sameer's phone.", fixes: [{ title: "Approval Tracker on portals", gain: 3 }] },
    { name: "Fees and money", score: 35, note: "Stage invoices go out late because nobody owns the gate.", fixes: [{ title: "Auto-invoice on gate pass", gain: 4 }] },
    { name: "Drawing control", score: 52, note: "Sheet sets are clean, but transmittals are typed in Word.", fixes: [{ title: "Register-driven transmittals", gain: 3 }] },
    { name: "Owner time", score: 30, note: "Rohan spends 16 hours a week checking sheets.", fixes: [{ title: "Two review windows a day", gain: 2 }] },
  ],
  ownerHours: [
    { label: "Sheet checks", hours: 16 },
    { label: "Client calls", hours: 9 },
    { label: "Site visits", hours: 8 },
    { label: "Approvals", hours: 5 },
    { label: "Fees", hours: 3 },
    { label: "Hiring", hours: 2 },
    { label: "Design", hours: 6 },
  ],
};

const integrations: Integration[] = [
  { name: "AutoCAD sheet sets", category: "Drawings", status: "Syncing", detail: "Title blocks, revisions and plot dates read from the DST files.", synced: "live", records: "412 sheets", mark: "AC", color: "#c4302b" },
  { name: "Revit (Miramar, Siolim)", category: "Drawings", status: "Connected", detail: "Sheet list and revision schedule from the central models.", synced: "20 min ago", records: "2 models", mark: "RV", color: "#1f6fb8" },
  { name: "Google Drive", category: "Files", status: "Connected", detail: "PDF sets and transmittals filed per project.", synced: "4 min ago", records: "6,210 files", mark: "GD", color: "#0f9d58" },
  { name: "WhatsApp Business", category: "Messaging", status: "Connected", detail: "Client groups, contractor groups, site photos.", synced: "just now", records: "1,840 chats", mark: "W", color: "#1f9d55" },
  { name: "Tally Prime", category: "Accounts", status: "Connected", detail: "Stage invoices with 18% GST, receipts and ledgers.", synced: "1 h ago", records: "1,120 vouchers", mark: "T", color: "#1c4f9c" },
  { name: "Gmail", category: "Messaging", status: "Connected", detail: "Authority letters and consultant drawings parsed to the register.", synced: "9 min ago", records: "720 threads", mark: "G", color: "#ea4335" },
  { name: "Goa online building permission", category: "Approvals", status: "Error", detail: "Captcha changed; status checks paused for CCP files.", synced: "yesterday", records: "—", mark: "GB", color: "#b8860b" },
  { name: "SketchUp", category: "Design", status: "Available", detail: "Push scenes to client presentations.", synced: "—", records: "—", mark: "SU", color: "#005f9e" },
  { name: "Razorpay", category: "Accounts", status: "Available", detail: "Payment links on stage invoices.", synced: "—", records: "—", mark: "R", color: "#2563eb" },
];

/* ============================================================
   Config
   ============================================================ */

const config: DeskConfig = {
  slug: "design-studio",
  company: "Mandovi Design Studio",
  brand: "Mandovi",
  city: "Panaji",
  state: "GA",
  icon: DraftingCompass,
  tagline: "Architecture and interiors · 6 live projects · 30 sheets in play · 8 people above Rua 31 de Janeiro",
  owner: { name: "Ar. Rohan Kamat", first: "Rohan", initials: "RK", role: "Principal" },
  theme: {
    variant: "ledger",
    paper: "#f7f6f1",
    panel: "#ffffff",
    sunk: "#eceae2",
    ink: "#111111",
    mute: "#66655f",
    line: "#d9d7ce",
    accent: "#111111",
    accentInk: "#f4e46a",
    soft: "#f6ee9e",
    ok: "#2f7d4f",
    warn: "#a87a08",
    late: "#c23b22",
    info: "#1f4fa3",
    heading: "display",
    radius: 2,
  },
  agenda: [
    { at: 9.5, title: "Studio stand-up", detail: "30 sheets, 3 stale sets on site", count: 3, tone: "late", module: "register" },
    { at: 11, title: "Sheet check window", detail: "Sequeira A-101 and A-201 R2", count: 6, tone: "accent", module: "register" },
    { at: 12.5, title: "Fee review with Leena", detail: "9 invoices, ₹15.9 L", count: 9, tone: "warn", module: "fees" },
    { at: 15, title: "Coastline facade call", detail: "Option B, 20 days waiting", tone: "info", module: "approvals" },
    { at: 16, title: "Sequeira footing inspection", detail: "F7 off grid, before PCC", count: 1, tone: "late", module: "site" },
    { at: 18, title: "Timesheets close", detail: "Week 43, 214 h booked", tone: "ok", module: "time" },
  ],
  activity: [
    { time: "11:20 AM", text: "Register Keeper: Naik Constructions holds A-102 R3, current is R4", tone: "late" },
    { time: "10:58 AM", text: "Kenkre sent S-201 R1 for Casa Sequeira", tone: "info" },
    { time: "10:31 AM", text: "GCZMA listed Miramar Sea View for the 29 Oct meeting", tone: "ok" },
    { time: "9:42 AM", text: "Snag SN-232 logged from Kunal's site photo", tone: "warn" },
    { time: "9:15 AM", text: "Heritage Hospitality promised ₹7.2 L after bank disbursal", tone: "info" },
    { time: "8:50 AM", text: "Village Panchayat Assagao licence 1182/2026 filed to the project", tone: "ok" },
  ],
  asks: [
    { q: "Which sites are building from an old drawing?", a: "Three sheets, on two sites.\n\n• Fontainhas A-102: Naik Constructions holds R3, current R4. R4 moved door D7 and the staff toilet; snag SN-232 is already the result.\n• Fontainhas S-301: contractor holds R1, current R2 (termite note added).\n• Kadamba I-201: Woodcraft holds R1, current R2 (back bar 75 mm deeper; SN-228 is this).\n\nRe-issuing A-102 R4 and S-301 R2 today closes the risk at Fontainhas before the roof work on Wednesday.", sources: ["Drawing register", "Transmittal log", "Snag list"] },
    { q: "What is waiting on my signature?", a: "6 sheets in For approval:\n• Sequeira A-101 R2, A-201 R2, S-201 R1\n• Fontainhas A-202A R0\n• Miramar A-001 R2 (needed for GCZMA on 29 Oct)\n• Dona Paula I-101 R2 and P-101 R1\n\nMiramar A-001 is the one with a hard date. The rest are client-paced.", sources: ["Drawing register"] },
    { q: "How much fee is outstanding?", a: "₹15.97 L across 9 invoices.\n• ₹7.2 L Heritage Hospitality GFC, 64 days, promised after bank disbursal on 30 Oct\n• ₹2.78 L Sequeira SD, 38 days, NEFT promised Friday\n• ₹2.39 L over 90 days: Casa Pereira final (128 d) and Fontainhas extra visits (95 d)\n\nTwo stages are ready to bill and not yet raised: Kadamba final 20% (₹1.3 L) and Siolim concept 10% (₹2.95 L).", sources: ["Tally", "Fee matrix"] },
    { q: "Is Miramar ready for GCZMA?", a: "Mostly. The file was filed on 15 Oct and is listed for 29 Oct.\n\nIn hand: CRZ map by the approved agency, HTL/LTL demarcation, Form-I, fee challan.\nMissing: CCP NOC. Sameer has the draft; it needs A-001 R2 signed by you first.\n\nThe fire NOC query (stair width 1.2 m) is separate but the committee may ask about it.", sources: ["Approvals", "A-001 R2"] },
    { q: "Which projects are over their hours?", a: "Kadamba Café is at 455 of 420 hours (108%), mostly the bar redesign; the ₹38k variation covers about 30 of the extra hours.\nFontainhas is at 2,050 of 2,200 (93%) with the full site stage still ahead, so it will overrun by roughly 300 hours unless site visits are billed as extras.\nEveryone else is under 75%.", sources: ["Timesheets", "Fee book"] },
    { q: "Draft a note to Naik Constructions about A-102", a: "Draft (not sent):\n\n“Namaskar Prakash ji, please stop work on the staff toilet and door D7 at Fontainhas. Drawing A-102 is now at R4 (issued today, transmittal attached); your set is R3. The door widens to 1,000 mm and the toilet moves 1.2 m towards the courtyard. Kunal will mark it out on site at 10:30 tomorrow. Please confirm receipt. — Sameer, Mandovi Design Studio”", sources: ["A-102 history", "SN-232"] },
  ],
  run: {
    label: "Runs on every plot. You can also run it now.",
    title: "Register check",
    steps: [
      { text: "Read 30 sheets from AutoCAD sheet sets and Revit", result: "30 sheets, 6 projects, 2 consultant uploads new" },
      { text: "Compare current revision to what each party holds", result: "3 stale sets, all on live sites" },
      { text: "Match open snags to revisions", result: "SN-232 and SN-228 caused by stale sets" },
      { text: "Check approvals that need a sheet signed", result: "Miramar A-001 R2 blocks the CCP NOC" },
      { text: "Draft transmittals and owner sign-offs", result: "2 transmittals, 6 sheets for signature" },
    ],
    outcome: "Re-issuing A-102 R4 and S-301 R2 to Naik Constructions stops the Fontainhas rework. Signing Miramar A-001 R2 today keeps the GCZMA date on 29 Oct.",
    actions: ["Issue A-102 R4 to contractor", "Issue S-301 R2 to contractor", "Sign Miramar A-001 R2", "Send Naik Constructions the stop note"],
  },
};

/* ============================================================
   Desk
   ============================================================ */

export default function DesignStudioDesk() {
  const [drawings, setDrawings] = React.useState(seedDrawings);
  const [transmittals, setTransmittals] = React.useState(seedTransmittals);
  const [projects, setProjects] = React.useState(seedProjects);
  const [snags, setSnags] = React.useState(seedSnags);
  const issue = React.useCallback(
    (keys: string[], to: Party[], purpose: Purpose) => {
      if (!keys.length || !to.length) return null;
      const chosen = drawings.filter((d) => keys.includes(keyOf(d)));
      const sheets = chosen.map((d) => `${d.no} R${d.rev}`);
      const project = Array.from(new Set(chosen.map((d) => projectOf(d.project).short))).join(", ");
      setDrawings((cur) =>
        cur.map((d) => {
          if (!keys.includes(keyOf(d))) return d;
          const issued = { ...d.issued };
          to.forEach((p) => (issued[p] = d.rev));
          const status: Status = d.status === "Superseded" ? d.status : purpose === "For construction" ? "IFC" : purpose === "For approval" && d.status === "WIP" ? "For approval" : d.status;
          return { ...d, issued, status };
        }),
      );
      setTransmittals((cur) => [{ no: `TR-0${414 + cur.length}`, date: TODAY_LABEL, project, sheets, to, purpose }, ...cur]);
      return true as const;
    },
    [drawings],
  );

  const stale = staleOf(drawings);
  const forApproval = drawings.filter((d) => d.status === "For approval").length;
  const lateProjects = projects.filter((p) => p.ends[p.stage] < TODAY).length;
  const openSnags = snags.filter((s) => s.col !== "closed").length;

  const modules: DeskModule[] = [
    {
      id: "register",
      label: "Drawing register",
      group: "Drawings",
      count: stale.length,
      title: "Drawing register",
      blurb: "Every sheet, its revision, its stamp and exactly which revision the client, contractor and structural consultant are holding",
      icon: FileStack,
      notes: ["Each row is a sheet. The rail shows its revisions; the black cell is current.", "The three cells on the right are who holds which revision. Yellow means they are working from an old one.", "Tick sheets and issue a transmittal; stamps and holdings update everywhere."],
      render: () => <RegisterHome drawings={drawings} setDrawings={setDrawings} transmittals={transmittals} issue={issue} />,
    },
    { id: "projects", label: "Projects", group: "Projects", count: lateProjects, title: "Projects and stage gates", blurb: "Concept to site for every commission, and what each one needs to pass its next gate", icon: Building, render: () => <ProjectsTab projects={projects} setProjects={setProjects} drawings={drawings} /> },
    { id: "site", label: "Site & snags", group: "Projects", count: openSnags, title: "Site visits and snags", blurb: "This week's visits and every snag from photo to closure", icon: HardHat, render: () => <SiteTab snags={snags} setSnags={setSnags} /> },
    { id: "approvals", label: "Approvals", group: "Projects", count: forApproval + clientSignoffs.length, title: "Approvals", blurb: "Client sign-offs and the statutory route: CCP, TCP, GCZMA, Panchayat and Fire", icon: Landmark, render: () => <ApprovalsTab /> },
    { id: "fees", label: "Fees", group: "Money", count: seedInvoices.length, title: "Fees", blurb: "Stage-wise billing against the fee book, and who still owes what", icon: IndianRupee, render: () => <FeesTab projects={projects} /> },
    { id: "time", label: "Studio time", group: "Money", title: "Studio time", blurb: "Hours by project and week against each fee's hour budget", icon: Timer, render: () => <TimeTab projects={projects} /> },
    { id: "team", label: "People", group: "Studio", title: "People", blurb: "Architects, site and office: who is carrying what this week", icon: Users, render: () => <PeopleModule members={team} /> },
    { id: "agents", label: "Agents", group: "Studio", title: "Agents", blurb: "Six AI agents keeping the register, the transmittals and the follow-ups honest", icon: Layers, render: () => <AgentsModule agents={agents} /> },
    { id: "independence", label: "Independence", group: "Practice", title: "Owner independence", blurb: "How much of Mandovi runs without Rohan's initials on it", icon: GaugeIcon, render: () => <IndependenceModule data={independence} /> },
    { id: "connections", label: "Connections", group: "Practice", title: "Connections", blurb: "AutoCAD, Revit, Drive, Tally, WhatsApp and the Goa approval portals", icon: Plug, render: () => <ConnectionsModule items={integrations} /> },
  ];

  return <DeskShell config={config} modules={modules} />;
}

type IssueFn = (keys: string[], to: Party[], purpose: Purpose) => true | null;

/* ---------------- Home: drawing register ---------------- */

function RegisterHome({ drawings, setDrawings, transmittals, issue }: { drawings: Drawing[]; setDrawings: React.Dispatch<React.SetStateAction<Drawing[]>>; transmittals: Transmittal[]; issue: IssueFn }) {
  const desk = useDesk();
  const stale = staleOf(drawings);
  const ifc = drawings.filter((d) => d.status === "IFC").length;
  const plotted = useDrift(14, 0.6, 3200);
  const byDisc = (Object.keys(discName) as Disc[]).map((k) => ({ k, list: drawings.filter((d) => d.disc === k) }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Sheets in play" value={drawings.length} hint="6 projects · 5 disciplines" icon={FileStack} trend={[22, 24, 25, 27, 28, 30, drawings.length]} />
        <Stat label="Waiting for sign-off" value={drawings.filter((d) => d.status === "For approval").length} delta="+2" deltaGood={false} hint="oldest 12 days" icon={PenTool} tone="warn" trend={[3, 4, 4, 5, 4, 5, 6]} />
        <Stat label="Old revision on site" value={stale.length} delta={stale.length ? "+1" : "-4"} deltaGood={!stale.length} hint="contractor or SE behind" icon={AlertTriangle} tone="late" trend={[1, 2, 2, 3, 3, 4, stale.length]} />
        <Stat label="Plots this week" value={Math.round(plotted)} delta="+18%" hint={`${ifc} sheets IFC`} icon={Ruler} tone="info" trend={[6, 8, 9, 11, 12, 13, plotted]} />
      </div>

      <Panel title="Sheet register" sub="Rail = revisions, black cell is current. Right three cells = what each party holds; yellow is an old revision." live>
        <RegisterGrid drawings={drawings} setDrawings={setDrawings} issue={issue} />
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr_0.9fr]">
        <Panel icon={AlertTriangle} title="Built from an old revision" sub="Sites and consultants holding a superseded sheet">
          {stale.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-d-ok">Every party holds the current revision.</p>
          ) : (
            <ul className="divide-y divide-d-line">
              {stale.map((s) => (
                <li key={`${keyOf(s.d)}-${s.party}`} className="flex items-center gap-3 py-2.5">
                  <span className="font-mono text-[12.5px] font-semibold">{s.d.no}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px]">{projectOf(s.d.project).short} · {s.d.title}</p>
                    <p className="text-[11.5px] text-d-mute">
                      {partyLabel[s.party]} holds <span className="bg-d-soft px-1 font-mono text-d-late">R{s.holding}</span> · current R{s.d.rev}
                    </p>
                  </div>
                  <Btn
                    size="sm"
                    variant="solid"
                    icon={Send}
                    onClick={() => {
                      issue([keyOf(s.d)], [s.party], "For construction");
                      toast.success(`${s.d.no} R${s.d.rev} re-issued`, { description: `${partyLabel[s.party]} · ${projectOf(s.d.project).name}` });
                      desk.log(`${projectOf(s.d.project).short} ${s.d.no} R${s.d.rev} re-issued to ${partyLabel[s.party].toLowerCase()}`, "ok");
                    }}
                  >
                    Re-issue R{s.d.rev}
                  </Btn>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel icon={Send} title="Transmittal log" sub={`${transmittals.length} issued this month`}>
          <ul className="space-y-2.5">
            {transmittals.slice(0, 6).map((t) => (
              <li key={t.no} className="desk-rise border-l-2 border-d-ink pl-3">
                <p className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-[12.5px] font-semibold">{t.no}</span>
                  <span className="font-mono text-[11px] text-d-mute">{t.date}</span>
                </p>
                <p className="truncate text-[12.5px]">
                  {t.project} · {t.sheets.join(", ")}
                </p>
                <p className="mt-1 flex flex-wrap gap-1">
                  {t.to.map((p) => (
                    <Pill key={p} tone={p === "contractor" ? "accent" : p === "structural" ? "info" : "neutral"}>
                      {partyLabel[p]}
                    </Pill>
                  ))}
                  <Pill tone={t.purpose === "For construction" ? "ok" : t.purpose === "For approval" ? "warn" : "neutral"}>{t.purpose}</Pill>
                </p>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel icon={Layers} title="By discipline" sub="Sheets by stamp">
          <Bars
            height={190}
            data={byDisc.map(({ k, list }) => ({
              label: k,
              value: list.length,
              stack: [
                { name: "IFC", value: list.filter((d) => d.status === "IFC").length, tone: "ok" as const },
                { name: "For approval", value: list.filter((d) => d.status === "For approval").length, tone: "warn" as const },
                { name: "WIP", value: list.filter((d) => d.status === "WIP").length, tone: "neutral" as const },
                { name: "Superseded", value: list.filter((d) => d.status === "Superseded").length, tone: "late" as const },
              ],
            }))}
          />
          <p className="mt-2 text-[11.5px] text-d-mute">{(Object.keys(discName) as Disc[]).map((k) => `${k} ${discName[k]}`).join(" · ")}</p>
        </Panel>
      </div>
    </div>
  );
}

function StatusStamp({ status, small }: { status: Status; small?: boolean }) {
  const color = `var(--d-${statusTone[status] === "neutral" ? "mute" : statusTone[status]})`;
  return (
    <span
      className={`inline-flex items-center justify-center whitespace-nowrap border-2 font-mono font-bold uppercase tracking-[0.12em] ${small ? "px-1.5 py-px text-[9.5px]" : "px-2 py-0.5 text-[10px]"} ${status === "Superseded" ? "line-through" : ""}`}
      style={{ color, borderColor: color, transform: status === "IFC" ? "rotate(-3deg)" : undefined, background: status === "IFC" ? "color-mix(in oklab, var(--d-ok) 7%, transparent)" : undefined }}
    >
      {status === "For approval" ? "For appr." : status}
    </span>
  );
}

function RevTriangle({ n, on }: { n: number; on?: boolean }) {
  return (
    <svg viewBox="0 0 28 24" className="h-6 w-7 shrink-0">
      <path d="M14 2 L26 22 L2 22 Z" fill={on ? "var(--d-ink)" : "var(--d-panel)"} stroke="var(--d-ink)" strokeWidth="1.6" strokeLinejoin="round" />
      <text x="14" y="19" textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fontWeight="700" fill={on ? "var(--d-accent-ink)" : "var(--d-ink)"}>
        {n}
      </text>
    </svg>
  );
}

function RegisterGrid({ drawings, setDrawings, issue }: { drawings: Drawing[]; setDrawings: React.Dispatch<React.SetStateAction<Drawing[]>>; issue: IssueFn }) {
  const desk = useDesk();
  const [proj, setProj] = React.useState<string>("MDS-2403");
  const [disc, setDisc] = React.useState<"All" | Disc>("All");
  const [status, setStatus] = React.useState<"All" | Status>("All");
  const [onlyStale, setOnlyStale] = React.useState(false);
  const [picked, setPicked] = React.useState<Set<string>>(new Set());
  const [open, setOpen] = React.useState<string | null>(null);
  const [tray, setTray] = React.useState(false);
  const staleKeys = new Set(staleOf(drawings).map((s) => keyOf(s.d)));

  const inProject = drawings.filter((d) => proj === "All" || d.project === proj);
  const shown = inProject.filter((d) => (disc === "All" || d.disc === disc) && (status === "All" || d.status === status) && (!onlyStale || staleKeys.has(keyOf(d))));
  const current = drawings.find((d) => keyOf(d) === open) ?? null;

  function toggle(k: string) {
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Segmented
          size="sm"
          options={[{ value: "All", label: "All projects", count: drawings.length }, ...seedProjects.map((p) => ({ value: p.code, label: p.short, count: drawings.filter((d) => d.project === p.code).length }))]}
          value={proj}
          onChange={(v) => {
            setProj(v);
            setPicked(new Set());
          }}
        />
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Segmented size="sm" options={["All", "A", "S", "E", "P", "I"] as const} value={disc} onChange={setDisc} />
        <span className="mx-1 h-5 w-px bg-d-line" />
        {(["All", ...STATUSES] as const).map((s) => {
          const n = s === "All" ? inProject.length : inProject.filter((d) => d.status === s).length;
          const on = status === s;
          return (
            <button key={s} type="button" onClick={() => setStatus(s)} className={`inline-flex h-7 items-center gap-1.5 border px-2 text-[11.5px] font-medium transition-colors ${on ? "border-d-ink bg-d-soft" : "border-d-line bg-d-panel hover:bg-d-sunk"}`}>
              {s === "All" ? "All stamps" : s}
              <span className="font-mono text-[10.5px] text-d-mute">{n}</span>
            </button>
          );
        })}
        <button type="button" onClick={() => setOnlyStale((x) => !x)} className={`inline-flex h-7 items-center gap-1.5 border px-2 text-[11.5px] font-medium ${onlyStale ? "border-d-late bg-d-late text-white" : "border-d-line bg-d-panel text-d-late hover:bg-d-sunk"}`}>
          <AlertTriangle className="h-3.5 w-3.5" /> Old revision out
        </button>
        <div className="ml-auto flex items-center gap-2">
          {picked.size > 0 && <span className="font-mono text-[12px] text-d-mute">{picked.size} in tray</span>}
          <Btn size="sm" variant="solid" icon={Send} disabled={!picked.size} onClick={() => setTray(true)}>
            Issue transmittal
          </Btn>
        </div>
      </div>

      <div className="desk-scroll -mx-5 overflow-x-auto px-5">
        <div className="min-w-[860px]">
          <div className="grid grid-cols-[26px_104px_minmax(200px,1fr)_150px_104px_186px] items-end gap-3 border-b-2 border-d-ink pb-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-d-mute">
            <span />
            <span>Sheet</span>
            <span>Title</span>
            <span>Revisions</span>
            <span>Stamp</span>
            <span className="grid grid-cols-3 text-center">
              <span>Client</span>
              <span>Contr.</span>
              <span>Struct.</span>
            </span>
          </div>
          {shown.map((d, i) => {
            const k = keyOf(d);
            const maxRail = Math.max(4, d.rev);
            const isStale = staleKeys.has(k);
            return (
              <div
                key={k}
                className={`desk-rise grid cursor-pointer grid-cols-[26px_104px_minmax(200px,1fr)_150px_104px_186px] items-center gap-3 border-b border-d-line py-2.5 transition-colors hover:bg-d-sunk/60 ${picked.has(k) ? "bg-d-soft/50" : ""} ${d.status === "Superseded" ? "opacity-60" : ""}`}
                style={{ animationDelay: `${i * 22}ms`, boxShadow: isStale ? "inset 3px 0 0 var(--d-late)" : undefined }}
                onClick={() => setOpen(k)}
              >
                <span onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={picked.has(k)} onChange={() => toggle(k)} className="h-4 w-4 accent-[var(--d-ink)]" aria-label={`Add ${d.no} to transmittal`} />
                </span>
                <span className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center border-[1.5px] font-mono text-[11px] font-bold" style={{ borderColor: `var(--d-${discTone[d.disc] === "accent" ? "ink" : discTone[d.disc]})`, color: `var(--d-${discTone[d.disc] === "accent" ? "ink" : discTone[d.disc]})` }}>
                    {d.disc}
                  </span>
                  <span className="font-mono text-[13px] font-semibold">{d.no.slice(2)}</span>
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13.5px] font-medium">{d.title}</span>
                  <span className="block truncate font-mono text-[11px] text-d-mute">
                    {proj === "All" ? `${projectOf(d.project).short} · ` : ""}
                    {d.scale} · {d.size} · last {d.history[d.history.length - 1].date}
                  </span>
                </span>
                <span className="flex items-center gap-[3px]">
                  {Array.from({ length: maxRail + 1 }, (_, r) => (
                    <span
                      key={r}
                      className="flex h-[22px] w-[24px] items-center justify-center font-mono text-[10px] font-semibold"
                      style={
                        r === d.rev
                          ? { background: "var(--d-ink)", color: "var(--d-accent-ink)" }
                          : r < d.rev
                            ? { background: "var(--d-sunk)", color: "var(--d-mute)" }
                            : { border: "1px dashed var(--d-line)", color: "transparent" }
                      }
                    >
                      R{r}
                    </span>
                  ))}
                </span>
                <span>
                  <StatusStamp status={d.status} />
                </span>
                <span className="grid grid-cols-3 gap-1">
                  {PARTIES.map((p) => {
                    const h = d.issued[p];
                    const old = h !== null && h < d.rev && d.status === "IFC" && p !== "client";
                    const behindRev = h !== null && h < d.rev && !old;
                    return (
                      <span
                        key={p}
                        title={h === null ? `${partyLabel[p]}: not issued` : `${partyLabel[p]} holds R${h}`}
                        className={`flex h-[26px] items-center justify-center font-mono text-[11.5px] ${h === null ? "border border-dotted border-d-line text-d-mute" : old ? "bg-d-soft font-bold text-d-late" : behindRev ? "border border-d-line text-d-mute" : "border border-d-ink font-semibold"}`}
                      >
                        {rl(h)}
                        {old && <span className="ml-0.5 text-[9px]">!</span>}
                      </span>
                    );
                  })}
                </span>
              </div>
            );
          })}
          {shown.length === 0 && <p className="py-10 text-center text-[13px] text-d-mute">No sheets match.</p>}
          {isStaleNote(shown, staleKeys)}
        </div>
      </div>

      <DrawingSheet
        d={current}
        onClose={() => setOpen(null)}
        onIssue={(to) => {
          if (!current) return;
          issue([keyOf(current)], to, current.status === "IFC" ? "For construction" : "For approval");
          toast.success(`Transmittal issued · ${current.no} R${current.rev}`, { description: `To ${to.map((p) => partyLabel[p]).join(", ")}` });
          desk.log(`${projectOf(current.project).short} ${current.no} R${current.rev} issued to ${to.map((p) => partyLabel[p].toLowerCase()).join(", ")}`, "ok");
        }}
        onRevise={(note) => {
          if (!current) return;
          setDrawings((cur) => cur.map((x) => (keyOf(x) === keyOf(current) ? { ...x, rev: x.rev + 1, status: "WIP", history: [...x.history, { date: TODAY_LABEL, note, by: "RK" }] } : x)));
          toast(`${current.no} raised to R${current.rev + 1}`, { description: "Stamp reset to WIP; every holder is now one behind." });
          desk.log(`${current.no} revised to R${current.rev + 1}: ${note}`, "warn");
        }}
        onStamp={(s) => {
          if (!current) return;
          setDrawings((cur) => cur.map((x) => (keyOf(x) === keyOf(current) ? { ...x, status: s } : x)));
          toast.success(`${current.no} stamped ${s}`);
          desk.log(`${current.no} R${current.rev} stamped ${s}`, s === "IFC" ? "ok" : "info");
        }}
      />
      <TransmittalModal
        open={tray}
        onOpenChange={setTray}
        sheets={drawings.filter((d) => picked.has(keyOf(d)))}
        onIssue={(to, purpose) => {
          const keys = [...picked];
          issue(keys, to, purpose);
          toast.success(`Transmittal issued, ${keys.length} sheets`, { description: `${purpose} · ${to.map((p) => partyLabel[p]).join(", ")} · PDF set on WhatsApp and email` });
          desk.log(`Transmittal: ${keys.length} sheets ${purpose.toLowerCase()} to ${to.map((p) => partyLabel[p].toLowerCase()).join(", ")}`, "ok");
          setPicked(new Set());
          setTray(false);
        }}
      />
    </div>
  );
}

function isStaleNote(shown: Drawing[], stale: Set<string>) {
  const n = shown.filter((d) => stale.has(keyOf(d))).length;
  if (!n) return null;
  return (
    <p className="mt-3 inline-flex items-center gap-2 bg-d-soft px-2 py-1 text-[12px]">
      <AlertTriangle className="h-3.5 w-3.5 text-d-late" /> {n} sheet{n > 1 ? "s" : ""} on this page {n > 1 ? "are" : "is"} out with an old revision. Tick and issue to fix.
    </p>
  );
}

function DrawingSheet({ d, onClose, onIssue, onRevise, onStamp }: { d: Drawing | null; onClose: () => void; onIssue: (to: Party[]) => void; onRevise: (note: string) => void; onStamp: (s: Status) => void }) {
  const [note, setNote] = React.useState("");
  const behind = d ? PARTIES.filter((p) => d.issued[p] === null || (d.issued[p] as number) < d.rev) : [];
  return (
    <Sheet
      open={!!d}
      onOpenChange={(o) => !o && onClose()}
      width={520}
      eyebrow={d ? `${projectOf(d.project).code} · ${discName[d.disc]}` : ""}
      title={d ? `${d.no} · ${d.title}` : ""}
      sub={d ? `${projectOf(d.project).name} · current R${d.rev}` : ""}
      footer={
        d && (
          <>
            {d.status === "WIP" && (
              <Btn icon={PenTool} onClick={() => onStamp("For approval")}>
                Send for approval
              </Btn>
            )}
            {d.status === "For approval" && (
              <Btn icon={Stamp} onClick={() => onStamp("IFC")}>
                Stamp IFC
              </Btn>
            )}
            <Btn variant="solid" icon={Send} disabled={!behind.length || d.status === "Superseded"} onClick={() => onIssue(behind)}>
              Issue transmittal{behind.length ? ` (${behind.length})` : ""}
            </Btn>
          </>
        )
      }
    >
      {d && (
        <div className="space-y-6">
          <div className="grid grid-cols-[1fr_auto] items-start gap-4 border-2 border-d-ink p-3">
            <KV
              items={[
                { k: "Scale", v: d.scale },
                { k: "Sheet size", v: d.size },
                { k: "Project lead", v: projectOf(d.project).lead },
                { k: "Structural", v: projectOf(d.project).structural },
              ]}
            />
            <StatusStamp status={d.status} />
          </div>
          <div>
            <p className="mb-2 text-[12px] font-medium text-d-mute">Who holds what</p>
            <ul className="space-y-1.5">
              {PARTIES.map((p) => {
                const h = d.issued[p];
                const ok = h === d.rev;
                return (
                  <li key={p} className="flex items-center gap-3 border border-d-line px-3 py-2">
                    <span className="w-24 text-[13px] font-medium">{partyLabel[p]}</span>
                    <span className={`font-mono text-[12.5px] ${ok ? "" : h === null ? "text-d-mute" : "bg-d-soft px-1 text-d-late"}`}>{h === null ? "not issued" : `holds R${h}`}</span>
                    <span className="flex-1" />
                    {ok ? <Pill tone="ok">current</Pill> : <Btn size="sm" variant="soft" onClick={() => onIssue([p])}>Issue R{d.rev}</Btn>}
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-[12px] font-medium text-d-mute">Revision history</p>
            <ol className="space-y-2">
              {[...d.history].reverse().map((h, i) => {
                const n = d.history.length - 1 - i;
                return (
                  <li key={n} className="flex items-start gap-3">
                    <RevTriangle n={n} on={n === d.rev} />
                    <div className="min-w-0 flex-1 border-b border-d-line pb-2">
                      <p className="flex items-baseline justify-between gap-2 text-[13px]">
                        <span className="font-medium">{h.note}</span>
                        <span className="shrink-0 font-mono text-[11px] text-d-mute">{h.date}</span>
                      </p>
                      <p className="font-mono text-[11px] text-d-mute">R{n} · by {h.by}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!note.trim()) return;
              onRevise(note.trim());
              setNote("");
            }}
          >
            <input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Raise a revision: what changed?" />
            <Btn type="submit" icon={Plus} disabled={!note.trim()}>
              R{d.rev + 1}
            </Btn>
          </form>
        </div>
      )}
    </Sheet>
  );
}

function TransmittalModal({ open, onOpenChange, sheets, onIssue }: { open: boolean; onOpenChange: (o: boolean) => void; sheets: Drawing[]; onIssue: (to: Party[], purpose: Purpose) => void }) {
  const [to, setTo] = React.useState<Set<Party>>(new Set(["contractor"]));
  const [purpose, setPurpose] = React.useState<Purpose>("For construction");
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Issue transmittal" sub="The PDF set goes out on WhatsApp and email with a transmittal sheet; holdings update in the register." width={600}>
      <div className="space-y-4">
        <ul className="max-h-[220px] divide-y divide-d-line overflow-y-auto border-y-2 border-d-ink">
          {sheets.map((d) => (
            <li key={keyOf(d)} className="flex items-center gap-3 py-2 text-[13px]">
              <span className="font-mono font-semibold">{d.no}</span>
              <span className="min-w-0 flex-1 truncate">{d.title}</span>
              <span className="font-mono text-[11.5px]">R{d.rev}</span>
              <StatusStamp status={d.status} small />
            </li>
          ))}
        </ul>
        <Field label="Issue to">
          <div className="flex flex-wrap gap-2">
            {PARTIES.map((p) => {
              const on = to.has(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() =>
                    setTo((s) => {
                      const n = new Set(s);
                      if (n.has(p)) n.delete(p);
                      else n.add(p);
                      return n;
                    })
                  }
                  className={`inline-flex h-9 items-center gap-1.5 border px-3 text-[13px] font-medium ${on ? "border-d-ink bg-d-ink text-d-accent-ink" : "border-d-line bg-d-panel"}`}
                >
                  {on && <Check className="h-3.5 w-3.5" />}
                  {partyLabel[p]}
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="Purpose">
          <Segmented options={["For approval", "For construction", "For information"] as const} value={purpose} onChange={setPurpose} />
        </Field>
        {purpose === "For construction" && <p className="bg-d-soft px-3 py-2 text-[12.5px]">Issuing for construction stamps every sheet in the set IFC.</p>}
        <div className="flex justify-end gap-2">
          <Btn onClick={() => onOpenChange(false)}>Cancel</Btn>
          <Btn variant="solid" icon={Send} disabled={!to.size || !sheets.length} onClick={() => onIssue([...to], purpose)}>
            Issue {sheets.length} sheet{sheets.length === 1 ? "" : "s"}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ---------------- Projects ---------------- */

const gateChecks: string[][] = [
  ["Client brief signed", "Site survey and contours received", "Area statement vs FAR checked", "Concept fee (10%) received"],
  ["Client signed SD plans", "Structural scheme agreed with SE", "Statutory route confirmed (CCP / TCP / CRZ)", "SD fee invoiced"],
  ["Material and finish schedule approved", "MEP coordination round closed", "Structural GFC received", "Client sign-off on elevations"],
  ["All A-sheets stamped IFC", "Contractor appointed, BOQ issued", "Building licence in hand", "GFC fee invoiced"],
  ["Snag list closed", "Completion drawings issued", "Occupancy certificate filed", "Final fee invoiced"],
];
const seedChecks: Record<string, boolean[]> = {
  "MDS-2411": [true, false, true, false],
  "MDS-2403": [false, true, false, false],
  "MDS-2502": [true, true, false, false],
  "MDS-2507": [false, true, false, false],
  "MDS-2509": [false, true, true, true],
  "MDS-2512": [true, true, true, false],
};
const monthTicks = [
  { at: 0, label: "Aug" },
  { at: 31, label: "Sep" },
  { at: 61, label: "Oct" },
  { at: 92, label: "Nov" },
  { at: 122, label: "Dec" },
  { at: 153, label: "Jan" },
  { at: 184, label: "Feb" },
  { at: 212, label: "Mar" },
];
function dayLabel(d: number) {
  const date = new Date(Date.UTC(2026, 7, 1 + Math.round(d)));
  return `${date.getUTCDate()} ${date.toLocaleString("en-IN", { month: "short", timeZone: "UTC" })}`;
}

function ProjectsTab({ projects, setProjects, drawings }: { projects: Project[]; setProjects: React.Dispatch<React.SetStateAction<Project[]>>; drawings: Drawing[] }) {
  const desk = useDesk();
  const [gateFor, setGateFor] = React.useState("MDS-2509");
  const [checks, setChecks] = React.useState(seedChecks);
  const [open, setOpen] = React.useState<string | null>(null);
  const gp = projects.find((p) => p.code === gateFor)!;
  const list = checks[gp.code] ?? [false, false, false, false];
  const ready = list.every(Boolean);
  const sheetProject = projects.find((p) => p.code === open) ?? null;

  const rows: GanttRow[] = projects.map((p) => {
    const late = p.ends[p.stage] < TODAY;
    const lateBy = late ? TODAY - p.ends[p.stage] : 0;
    return {
      id: p.code,
      title: p.name,
      sub: `${GATES[p.stage]} · ${p.lead}`,
      swatch: p.swatch,
      points: GATES.map((g, i) => ({ at: p.ends[i] + (i >= p.stage ? lateBy : 0), state: i < p.stage ? "done" : i === p.stage && late ? "late" : "open", label: `${g} · ${dayLabel(p.ends[i])}` })),
      badge: late ? { at: p.ends[p.stage], label: `${GATES[p.stage]} ${lateBy}d late` } : undefined,
    };
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Live commissions" value={projects.length} hint="2 on site, 1 at concept" icon={Building} />
        <Stat label="Stage running late" value={projects.filter((p) => p.ends[p.stage] < TODAY).length} delta="+1" deltaGood={false} hint="Sequeira DD, clinic GFC" icon={AlertTriangle} tone="late" />
        <Stat label="Fee book" value={inr(projects.reduce((a, p) => a + p.fee, 0), { compact: true })} delta="+₹29.5 L" hint="Siolim signed in Sep" icon={IndianRupee} trend={[0.62, 0.7, 0.81, 0.85, 0.9, 1.1, 1.19]} />
        <Stat label="Gates this month" value="3" hint="Clinic GFC, Sequeira DD, Siolim concept" icon={ClipboardCheck} tone="info" />
      </div>
      <Panel title="Stage plan" sub="Each block is a stage: Concept, SD, DD, GFC, Site. A late stage pushes everything after it." action={<Pill mono>Today {TODAY_LABEL}</Pill>}>
        <Gantt rows={rows} days={240} ticks={monthTicks} today={{ at: TODAY, label: "Today" }} markers={[{ at: 153, label: "Monsoon over, site season", tone: "info" }]}onRow={(r) => setOpen(r.id)} />
      </Panel>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <Panel icon={ClipboardCheck} title="Stage gate" sub="Tick what is true. A gate passes only when all four are." action={<select className={`${inputClass} h-8 w-auto text-[12.5px]`} value={gateFor} onChange={(e) => setGateFor(e.target.value)}>{projects.map((p) => <option key={p.code} value={p.code}>{p.short}</option>)}</select>}>
          <div className="mb-3 flex items-center gap-1">
            {GATES.map((g, i) => (
              <span key={g} className={`flex-1 py-1 text-center font-mono text-[11px] font-semibold ${i < gp.stage ? "bg-d-ink text-d-accent-ink" : i === gp.stage ? "bg-d-soft text-d-ink ring-1 ring-d-ink" : "bg-d-sunk text-d-mute"}`}>
                {g}
              </span>
            ))}
          </div>
          <p className="mb-1 text-[12.5px] text-d-mute">
            {gp.stage < 4 ? `${GATES[gp.stage]} → ${GATES[gp.stage + 1]}` : "Site → handover"}
          </p>
          <Checklist
            items={gateChecks[gp.stage].map((label, i) => ({ id: String(i), label, done: list[i] }))}
            onToggle={(id) => setChecks((c) => ({ ...c, [gp.code]: (c[gp.code] ?? [false, false, false, false]).map((v, i) => (String(i) === id ? !v : v)) }))}
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-[12px] text-d-mute">{list.filter(Boolean).length} of 4</span>
            <Btn
              variant="solid"
              icon={ArrowRight}
              disabled={!ready || gp.stage >= 4}
              onClick={() => {
                setProjects((cur) => cur.map((p) => (p.code === gp.code ? { ...p, stage: p.stage + 1 } : p)));
                setChecks((c) => ({ ...c, [gp.code]: [false, false, false, false] }));
                toast.success(`${gp.name} passed into ${GATES[gp.stage + 1]}`, { description: `Stage fee ${STAGE_PCT[gp.stage]}% is now ready to bill.` });
                desk.log(`${gp.short} passed the ${GATES[gp.stage]} gate`, "ok");
              }}
            >
              {gp.stage >= 4 ? "Final stage" : `Pass to ${GATES[gp.stage + 1]}`}
            </Btn>
          </div>
        </Panel>
        <Panel title="Commissions" sub="Click a row for the project file">
          <DataTable
            rows={projects}
            rowKey={(p) => p.code}
            onRow={(p) => setOpen(p.code)}
            dense
            columns={[
              { key: "code", label: "Job", render: (p) => <span className="font-mono text-[12px]">{p.code}</span>, sort: (p) => p.code },
              { key: "name", label: "Project", render: (p) => <span className="font-medium">{p.name}</span>, sort: (p) => p.name },
              { key: "stage", label: "Stage", render: (p) => <Pill tone={p.ends[p.stage] < TODAY ? "late" : "neutral"}>{GATES[p.stage]}</Pill>, sort: (p) => p.stage },
              { key: "fee", label: "Fee", align: "right", render: (p) => <span className="tnum font-mono">{inr(p.fee, { compact: true })}</span>, sort: (p) => p.fee },
              { key: "hrs", label: "Hours", render: (p) => <div className="min-w-[80px]"><Meter value={p.hoursUsed} max={p.hoursBudget} tone={p.hoursUsed > p.hoursBudget ? "late" : p.hoursUsed / p.hoursBudget > 0.85 ? "warn" : "info"} /></div>, sort: (p) => p.hoursUsed / p.hoursBudget, wide: true },
            ]}
          />
        </Panel>
      </div>
      <Sheet
        open={!!sheetProject}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={sheetProject?.code}
        title={sheetProject?.name ?? ""}
        sub={sheetProject ? `${sheetProject.client} · ${sheetProject.place}` : ""}
        footer={
          <Btn variant="solid" icon={MessageCircle} onClick={() => { toast.success("Weekly status sent", { description: sheetProject?.client }); desk.log(`Status digest sent to ${sheetProject?.client}`); }}>
            Send client status
          </Btn>
        }
      >
        {sheetProject && (
          <div className="space-y-5">
            <KV items={[{ k: "Type", v: sheetProject.kind }, { k: "Built-up", v: sheetProject.area }, { k: "Fee", v: inr(sheetProject.fee) }, { k: "Lead", v: sheetProject.lead }, { k: "Contractor", v: sheetProject.contractor }, { k: "Structural", v: sheetProject.structural }]} />
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Stage dates</p>
              <ul className="space-y-1">
                {GATES.map((g, i) => (
                  <li key={g} className="flex items-center justify-between border-b border-d-line py-1.5 text-[13px]">
                    <span className={i === sheetProject.stage ? "font-semibold" : ""}>{g}</span>
                    <span className="font-mono text-[12px] text-d-mute">{dayLabel(sheetProject.ends[i])}</span>
                    {i < sheetProject.stage ? <Pill tone="ok">done</Pill> : i === sheetProject.stage ? <Pill tone={sheetProject.ends[i] < TODAY ? "late" : "warn"}>now</Pill> : <Pill>planned</Pill>}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Hours {sheetProject.hoursUsed} of {sheetProject.hoursBudget}</p>
              <Meter value={sheetProject.hoursUsed} max={sheetProject.hoursBudget} tone={sheetProject.hoursUsed > sheetProject.hoursBudget ? "late" : "info"} />
            </div>
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Sheets</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => {
                  const n = drawings.filter((d) => d.project === sheetProject.code && d.status === s).length;
                  return n ? <span key={s} className="inline-flex items-center gap-1.5"><StatusStamp status={s} small /><span className="font-mono text-[12px]">{n}</span></span> : null;
                })}
              </div>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Site & snags ---------------- */

const snagCols: { id: SnagCol; label: string; tone: Tone; hint: string }[] = [
  { id: "logged", label: "Logged", tone: "late", hint: "From site photos" },
  { id: "contractor", label: "With contractor", tone: "warn", hint: "Assigned on the site group" },
  { id: "verify", label: "Fixed, to verify", tone: "info", hint: "Needs a photo or visit" },
  { id: "closed", label: "Closed", tone: "ok", hint: "Verified" },
];

function SiteTab({ snags, setSnags }: { snags: Snag[]; setSnags: React.Dispatch<React.SetStateAction<Snag[]>> }) {
  const desk = useDesk();
  const [proj, setProj] = React.useState<string>("All");
  const [adding, setAdding] = React.useState(false);
  const [done, setDone] = React.useState<Set<string>>(new Set());
  const shown = snags.filter((s) => proj === "All" || s.project === proj);
  const open = snags.filter((s) => s.col !== "closed");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open snags" value={open.length} delta="+3" deltaGood={false} hint="this week" icon={HardHat} tone="warn" trend={[5, 6, 6, 7, 6, 8, open.length]} />
        <Stat label="High severity" value={open.filter((s) => s.sev === "High").length} hint="2 caused by old drawings" icon={AlertTriangle} tone="late" />
        <Stat label="Visits this week" value={visits.length} hint={`${done.size} reported`} icon={CalendarClock} tone="info" />
        <Stat label="Average days to close" value="6.4" delta="-1.2" deltaGood hint="photo-verified" icon={Timer} tone="ok" trend={[9, 8.5, 8, 7.6, 7.1, 6.8, 6.4]} />
      </div>
      <Panel
        title="Snag board"
        sub="Drag a card across as it moves. Contractors see their column on WhatsApp."
        action={
          <>
            <Segmented size="sm" options={[{ value: "All", label: "All" }, ...seedProjects.filter((p) => snags.some((s) => s.project === p.code)).map((p) => ({ value: p.code, label: p.short }))]} value={proj} onChange={setProj} />
            <Btn size="sm" variant="solid" icon={Plus} onClick={() => setAdding(true)}>
              Log snag
            </Btn>
          </>
        }
      >
        <Board
          columns={snagCols}
          items={shown}
          itemKey={(s) => s.id}
          getColumn={(s) => s.col}
          minColumnWidth={220}
          onMove={(id, col) => {
            const s = snags.find((x) => x.id === id);
            if (!s || s.col === col) return;
            setSnags((cur) => cur.map((x) => (x.id === id ? { ...x, col: col as SnagCol } : x)));
            const label = snagCols.find((c) => c.id === col)?.label ?? col;
            toast.success(`${id} → ${label}`, { description: s.title });
            desk.log(`Snag ${id} moved to ${label.toLowerCase()}`, col === "closed" ? "ok" : "info");
          }}
          renderCard={(s) => (
            <div>
              <p className="flex items-center justify-between gap-2 pr-4">
                <span className="font-mono text-[11px] text-d-mute">{s.id}</span>
                <Pill tone={s.sev === "High" ? "late" : s.sev === "Medium" ? "warn" : "neutral"}>{s.sev}</Pill>
              </p>
              <p className="mt-1 text-[13px] font-medium leading-snug">{s.title}</p>
              <p className="mt-1 text-[11.5px] text-d-mute">
                {projectOf(s.project).short} · {s.where}
              </p>
              <p className="mt-2 flex items-center gap-3 font-mono text-[10.5px] text-d-mute">
                <span className="inline-flex items-center gap-1"><Camera className="h-3 w-3" />{s.photos}</span>
                <span>{s.by}</span>
                <span className="ml-auto">{s.raised}</span>
              </p>
            </div>
          )}
        />
      </Panel>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Panel icon={CalendarClock} title="Site visits this week" sub="Report a visit and its photos become snags">
          <ul className="divide-y divide-d-line">
            {visits.map((v) => (
              <li key={v.id} className="flex flex-wrap items-center gap-3 py-2.5">
                <span className="w-[86px] shrink-0 font-mono text-[12px]">{v.day}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium">{projectOf(v.project).name}</p>
                  <p className="truncate text-[12px] text-d-mute">{v.purpose} · {v.who}</p>
                </div>
                {done.has(v.id) ? (
                  <Pill tone="ok">Reported</Pill>
                ) : (
                  <Btn
                    size="sm"
                    variant="soft"
                    onClick={() => {
                      setDone((s) => new Set(s).add(v.id));
                      toast.success("Visit report filed", { description: `${projectOf(v.project).short} · photos to Drive, minutes to the client` });
                      desk.log(`Site visit report filed: ${projectOf(v.project).short}`, "ok");
                    }}
                  >
                    File report
                  </Btn>
                )}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Open snags by project" sub="Severity-weighted">
          <HBars
            data={seedProjects
              .map((p) => ({ label: p.short, value: open.filter((s) => s.project === p.code).reduce((a, s) => a + (s.sev === "High" ? 3 : s.sev === "Medium" ? 2 : 1), 0), tone: "late" as Tone, sub: `${open.filter((s) => s.project === p.code).length} open` }))
              .filter((x) => x.value > 0)}
          />
        </Panel>
      </div>
      <NewSnag
        open={adding}
        onOpenChange={setAdding}
        onAdd={(s) => {
          setSnags((cur) => [s, ...cur]);
          toast.success(`${s.id} logged`, { description: `${projectOf(s.project).short} · sent to the contractor group` });
          desk.log(`Snag ${s.id} logged: ${s.title}`, "warn");
        }}
        nextId={`SN-${233 + snags.length - seedSnags.length}`}
      />
    </div>
  );
}

function NewSnag({ open, onOpenChange, onAdd, nextId }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (s: Snag) => void; nextId: string }) {
  const [title, setTitle] = React.useState("Laterite joint pointing uneven");
  const [project, setProject] = React.useState("MDS-2403");
  const [where, setWhere] = React.useState("Compound wall");
  const [sev, setSev] = React.useState<Snag["sev"]>("Medium");
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Log a snag" sub="It lands in Logged and posts to the contractor's WhatsApp group.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onAdd({ id: nextId, project, title, where, sev, by: "Rohan", photos: 0, raised: TODAY_LABEL, col: "logged" });
          onOpenChange(false);
        }}
      >
        <Field label="What is wrong">
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Project">
            <select className={inputClass} value={project} onChange={(e) => setProject(e.target.value)}>
              {seedProjects.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Where">
            <input className={inputClass} value={where} onChange={(e) => setWhere(e.target.value)} />
          </Field>
        </div>
        <Field label="Severity">
          <Segmented options={["High", "Medium", "Low"] as const} value={sev} onChange={setSev} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Btn onClick={() => onOpenChange(false)}>Cancel</Btn>
          <Btn variant="solid" type="submit" icon={Plus}>
            Log snag
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Approvals ---------------- */

const apTone: Record<Statutory["status"], Tone> = { Drafting: "neutral", Filed: "info", "Query raised": "late", "Site inspection": "warn", Approved: "ok" };

function ApprovalsTab() {
  const desk = useDesk();
  const [items, setItems] = React.useState(statutory);
  const [open, setOpen] = React.useState<Statutory | null>(null);
  const [signed, setSigned] = React.useState<Record<string, "signed" | "nudged">>({});
  const current = open ? items.find((x) => x.id === open.id) ?? null : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Statutory files open" value={items.filter((i) => i.status !== "Approved").length} hint="CCP, TCP, GCZMA, Fire, Panchayat" icon={Landmark} />
        <Stat label="Queries to answer" value={items.filter((i) => i.status === "Query raised").length} hint="Fire stair, CCP parking" icon={AlertTriangle} tone="late" />
        <Stat label="Client sign-offs waiting" value={clientSignoffs.filter((c) => signed[c.id] !== "signed").length} delta="+2" deltaGood={false} hint="oldest 20 days" icon={PenTool} tone="warn" />
        <Stat label="Approved this year" value="11" delta="+3" hint="vs last year" icon={Check} tone="ok" trend={[2, 3, 5, 6, 8, 9, 11]} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Panel icon={WavesHorizontal} title="GCZMA meeting" sub="Miramar Sea View, CRZ-II clearance">
          <div className="space-y-3">
            <Countdown inHours={9 * 24 + 1} />
            <p className="text-[13px] leading-relaxed">
              Listed for <b>29 Oct, 11 AM</b>, Goa Coastal Zone Management Authority, Saligao. Rohan presents A-001 R2. The CCP NOC is still missing from the file.
            </p>
            <Btn size="sm" variant="soft" icon={ArrowRight} onClick={() => desk.goTab("register")}>
              Open A-001 in the register
            </Btn>
          </div>
        </Panel>
        <Panel icon={PenTool} title="Client sign-offs" sub="Drawings and boards waiting for the client">
          <ul className="divide-y divide-d-line">
            {clientSignoffs.map((c) => {
              const s = signed[c.id];
              return (
                <li key={c.id} className={`flex flex-wrap items-center gap-3 py-2.5 ${s === "signed" ? "opacity-60" : ""}`}>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium">{c.item}</p>
                    <p className="text-[12px] text-d-mute">
                      {projectOf(c.project).short} · sent {c.sent} via {c.via} · <span className={c.waiting > 10 ? "text-d-late" : ""}>{c.waiting} days</span>
                    </p>
                  </div>
                  {s === "signed" ? (
                    <Pill tone="ok">Signed off</Pill>
                  ) : (
                    <span className="flex gap-1.5">
                      <Btn size="sm" icon={MessageCircle} disabled={s === "nudged"} onClick={() => { setSigned((x) => ({ ...x, [c.id]: "nudged" })); toast("Nudge sent on WhatsApp", { description: projectOf(c.project).client }); desk.log(`Sign-off nudge sent: ${c.item}`); }}>
                        {s === "nudged" ? "Nudged" : "Nudge"}
                      </Btn>
                      <Btn size="sm" variant="solid" icon={Check} onClick={() => { setSigned((x) => ({ ...x, [c.id]: "signed" })); toast.success("Client sign-off recorded", { description: c.item }); desk.log(`Client signed off: ${c.item}`, "ok"); }}>
                        Signed
                      </Btn>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
      <Panel title="Statutory route" sub="Every authority file across projects. Click for the document list.">
        <DataTable
          rows={items}
          rowKey={(i) => i.id}
          search={(i) => `${i.authority} ${i.what} ${projectOf(i.project).name}`}
          searchPlaceholder="Search authority or project"
          filter={{ get: (i) => i.status, options: ["Drafting", "Filed", "Query raised", "Site inspection", "Approved"] }}
          onRow={setOpen}
          columns={[
            { key: "proj", label: "Project", render: (i) => <span className="font-medium">{projectOf(i.project).short}</span>, sort: (i) => i.project },
            { key: "auth", label: "Authority", render: (i) => <span className="font-semibold">{i.authority}</span>, sort: (i) => i.authority },
            { key: "what", label: "For", render: (i) => <span className="text-d-mute">{i.what}</span>, wide: true },
            { key: "filed", label: "Filed", render: (i) => <span className="font-mono text-[12px]">{i.filed}</span> },
            { key: "days", label: "Days", align: "right", render: (i) => <span className="tnum font-mono" style={{ color: i.days > 60 && i.status !== "Approved" ? "var(--d-late)" : undefined }}>{i.days || "—"}</span>, sort: (i) => i.days },
            { key: "st", label: "Status", render: (i) => <Pill tone={apTone[i.status]}>{i.status}</Pill> },
            { key: "next", label: "Next", render: (i) => <span className="text-[12px] text-d-mute">{i.next}</span>, wide: true },
          ]}
        />
      </Panel>
      <Sheet
        open={!!current}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={current ? `${current.id} · ${projectOf(current.project).name}` : ""}
        title={current ? `${current.authority}: ${current.what}` : ""}
        sub={current?.next}
        footer={
          current && current.status !== "Approved" ? (
            <>
              {current.status === "Query raised" && (
                <Btn icon={Send} onClick={() => { setItems((cur) => cur.map((x) => (x.id === current.id ? { ...x, status: "Filed", next: "Reply submitted 20 Oct" } : x))); toast.success("Query reply submitted"); desk.log(`${current.authority} query replied for ${projectOf(current.project).short}`, "ok"); }}>
                  Reply submitted
                </Btn>
              )}
              <Btn variant="solid" icon={Check} onClick={() => { setItems((cur) => cur.map((x) => (x.id === current.id ? { ...x, status: "Approved", next: "Approved 20 Oct" } : x))); toast.success(`${current.authority} approved`, { description: current.what }); desk.log(`${current.authority} approved: ${current.what}`, "ok"); }}>
                Mark approved
              </Btn>
            </>
          ) : undefined
        }
      >
        {current && (
          <div className="space-y-5">
            <KV items={[{ k: "Status", v: <Pill tone={apTone[current.status]}>{current.status}</Pill> }, { k: "Filed", v: current.filed }, { k: "Days pending", v: current.days || "—" }, { k: "Handled by", v: current.project === "MDS-2403" ? "Sameer Dessai" : "Rohan Kamat" }]} />
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Documents</p>
              <Checklist
                items={current.docs.map(([label, ok], i) => ({ id: String(i), label, done: ok }))}
                onToggle={(id) => setItems((cur) => cur.map((x) => (x.id === current.id ? { ...x, docs: x.docs.map((dd, i) => (String(i) === id ? [dd[0], !dd[1]] as [string, boolean] : dd)) } : x)))}
              />
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Fees ---------------- */

const billTone: Record<Bill, string> = {
  paid: "var(--d-ink)",
  invoiced: "var(--d-warn)",
  ready: "var(--d-soft)",
  wip: "var(--d-sunk)",
  future: "transparent",
};

function FeesTab({ projects }: { projects: Project[] }) {
  const desk = useDesk();
  const [billing, setBilling] = React.useState(seedBilling);
  const [invoices, setInvoices] = React.useState(seedInvoices);
  const [open, setOpen] = React.useState<Invoice | null>(null);
  const [sent, setSent] = React.useState<Set<string>>(new Set());
  const total = invoices.reduce((a, i) => a + i.amount, 0);
  const bucket = (d: number) => (d <= 30 ? "0-30 days" : d <= 60 ? "31-60 days" : d <= 90 ? "61-90 days" : "90+ days");
  const buckets = ["0-30 days", "31-60 days", "61-90 days", "90+ days"].map((label, i) => ({ label, value: invoices.filter((x) => bucket(x.days) === label).reduce((a, x) => a + x.amount, 0), tone: (["ok", "info", "warn", "late"] as const)[i] }));
  const book = projects.reduce((a, p) => a + p.fee, 0);
  const billed = projects.reduce((a, p) => a + (billing[p.code] ?? []).reduce((s, b, i) => s + (b === "paid" || b === "invoiced" ? (p.fee * STAGE_PCT[i]) / 100 : 0), 0), 0);

  function raise(p: Project, stage: number) {
    const amount = (p.fee * STAGE_PCT[stage]) / 100;
    const inv: Invoice = { no: `MDS/26-27/0${50 + invoices.length - seedInvoices.length}`, project: p.code, client: p.client.split(" (")[0], for: `${GATES[stage]} stage, ${STAGE_PCT[stage]}%`, amount, raised: TODAY_LABEL, days: 0, stage };
    setInvoices((cur) => [inv, ...cur]);
    setBilling((b) => ({ ...b, [p.code]: b[p.code].map((x, i) => (i === stage ? "invoiced" : x)) }));
    toast.success(`Invoice ${inv.no} raised`, { description: `${inr(amount)} + 18% GST · posted to Tally, sent on WhatsApp` });
    desk.log(`Stage invoice raised: ${p.short} ${GATES[stage]} ${inr(amount, { compact: true })}`, "ok");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Fee book" value={inr(book, { compact: true })} hint="6 live commissions" icon={IndianRupee} />
        <Stat label="Billed to date" value={inr(billed, { compact: true })} hint={`${Math.round((billed / book) * 100)}% of book`} icon={Check} tone="ok" trend={[22, 26, 31, 34, 38, 41, Math.round(billed / 1e5)]} />
        <Stat label="Outstanding" value={inr(total, { compact: true })} delta="+8%" deltaGood={false} hint={`${invoices.length} invoices`} icon={AlertTriangle} tone="warn" trend={[11, 12, 13, 14, 14.5, 15, total / 1e5]} />
        <Stat label="Over 60 days" value={inr(invoices.filter((i) => i.days > 60).reduce((a, i) => a + i.amount, 0), { compact: true })} hint="Heritage, Pereira" icon={Timer} tone="late" />
      </div>
      <Panel title="Stage billing" sub="Concept 10 · SD 15 · DD 25 · GFC 30 · Site 20. Yellow cells are ready to bill; click to raise the invoice.">
        <div className="desk-scroll -mx-5 overflow-x-auto px-5">
          <table className="w-full min-w-[760px] table-fixed border-separate border-spacing-1 text-[12.5px]">
            <thead>
              <tr className="text-left font-mono text-[10.5px] uppercase tracking-[0.1em] text-d-mute">
                <th className="w-[210px] pb-1 font-medium">Project</th>
                {GATES.map((g, i) => (
                  <th key={g} className="pb-1 text-center font-medium">
                    {g} <span className="opacity-70">{STAGE_PCT[i]}%</span>
                  </th>
                ))}
                <th className="w-[80px] pb-1 text-right font-medium">Fee</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.code}>
                  <td className="pr-3 font-medium">{p.name}</td>
                  {(billing[p.code] ?? []).map((b, i) => {
                    const amount = (p.fee * STAGE_PCT[i]) / 100;
                    return (
                      <td key={GATES[i]} className="p-0">
                        <button
                          type="button"
                          disabled={b === "future" || b === "wip" || b === "paid"}
                          onClick={() => {
                            if (b === "ready") raise(p, i);
                            else if (b === "invoiced") setOpen(invoices.find((x) => x.project === p.code && x.stage === i) ?? null);
                          }}
                          className={`flex h-11 w-full flex-col items-center justify-center font-mono text-[11px] transition-transform enabled:hover:scale-[1.03] ${b === "future" ? "border border-dashed border-d-line text-d-mute" : ""} ${b === "ready" ? "ring-2 ring-d-ink" : ""}`}
                          style={{ background: billTone[b], color: b === "paid" ? "var(--d-accent-ink)" : b === "invoiced" ? "#fff" : "var(--d-ink)" }}
                        >
                          <span className="font-semibold">{inr(amount, { compact: true })}</span>
                          <span className="text-[9.5px] uppercase tracking-wide opacity-80">{b === "ready" ? "bill now" : b}</span>
                        </button>
                      </td>
                    );
                  })}
                  <td className="text-right font-mono">{inr(p.fee, { compact: true })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="Ageing" sub="From Tally, GST-inclusive collections tracked separately">
        <AgingBar buckets={buckets} format={(v) => inr(v, { compact: true })} />
      </Panel>
      <div className="grid gap-6 xl:grid-cols-[1fr_330px]">
        <Panel title="Invoices outstanding" sub="Select rows to send reminders together">
          <DataTable
            rows={invoices}
            rowKey={(i) => i.no}
            search={(i) => `${i.no} ${i.client} ${i.for}`}
            searchPlaceholder="Search invoice or client"
            filter={{ get: (i) => bucket(i.days), options: ["0-30 days", "31-60 days", "61-90 days", "90+ days"] }}
            onRow={setOpen}
            bulk={[{ label: "Send WhatsApp reminders", run: (k) => { setSent((s) => new Set([...s, ...k])); toast.success(`${k.length} reminders sent`); desk.log(`${k.length} fee reminders sent`); } }]}
            columns={[
              { key: "no", label: "Invoice", render: (i) => <span className="whitespace-nowrap font-mono text-[12px]">{i.no}</span> },
              { key: "client", label: "Client", render: (i) => <span className="font-medium">{i.client}</span>, sort: (i) => i.client },
              { key: "for", label: "For", render: (i) => <span className="text-d-mute">{i.for}</span>, wide: true },
              { key: "amt", label: "Amount", align: "right", render: (i) => <span className="tnum font-mono">{inr(i.amount)}</span>, sort: (i) => i.amount },
              { key: "days", label: "Days", align: "right", render: (i) => <span className="tnum font-mono" style={{ color: i.days > 90 ? "var(--d-late)" : i.days > 60 ? "var(--d-warn)" : undefined }}>{i.days}</span>, sort: (i) => i.days },
              { key: "pr", label: "Promise", render: (i) => (sent.has(i.no) ? <Pill tone="info">Reminded</Pill> : i.promise ? <Pill tone="ok">{i.promise}</Pill> : <span className="text-d-mute">—</span>) },
            ]}
          />
        </Panel>
        <Panel title="Fee mix" sub="Outstanding by project">
          <Donut
            center={inr(total, { compact: true })}
            sub="due"
            segments={[
              { label: "Fontainhas", value: invoices.filter((i) => i.project === "MDS-2403").reduce((a, i) => a + i.amount, 0), tone: "late" },
              { label: "Sequeira", value: invoices.filter((i) => i.project === "MDS-2411").reduce((a, i) => a + i.amount, 0), tone: "accent" },
              { label: "Miramar", value: invoices.filter((i) => i.project === "MDS-2502").reduce((a, i) => a + i.amount, 0), tone: "info" },
              { label: "Interiors", value: invoices.filter((i) => i.project === "MDS-2507" || i.project === "MDS-2509").reduce((a, i) => a + i.amount, 0), tone: "warn" },
              { label: "Closed jobs", value: invoices.filter((i) => i.project === "MDS-2318").reduce((a, i) => a + i.amount, 0), tone: "neutral" },
            ]}
          />
        </Panel>
      </div>
      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={open?.no}
        title={open?.client ?? ""}
        sub={open ? `${open.for} · ${inr(open.amount)} + GST · ${open.days} days` : ""}
        footer={
          open && (
            <>
              <Btn
                icon={Check}
                onClick={() => {
                  setInvoices((cur) => cur.filter((x) => x.no !== open.no));
                  if (open.stage !== undefined && billing[open.project]) setBilling((b) => ({ ...b, [open.project]: b[open.project].map((x, i) => (i === open.stage ? "paid" : x)) }));
                  toast.success("Payment recorded", { description: `${inr(open.amount)} · receipt in Tally` });
                  desk.log(`Payment received: ${open.client} ${inr(open.amount, { compact: true })}`, "ok");
                  setOpen(null);
                }}
              >
                Mark paid
              </Btn>
              <Btn
                variant="solid"
                icon={MessageCircle}
                onClick={() => {
                  setSent((s) => new Set(s).add(open.no));
                  toast.success("Reminder sent on WhatsApp", { description: open.client });
                  desk.log(`Fee reminder sent to ${open.client}`);
                  setOpen(null);
                }}
              >
                Send reminder
              </Btn>
            </>
          )
        }
      >
        {open && (
          <div className="space-y-4">
            <div className="bg-d-soft p-4 text-[13.5px] leading-relaxed">
              Good morning, a gentle reminder from Mandovi Design Studio. Invoice {open.no} for {open.for}, {inr(open.amount)} plus 18% GST ({inr(open.amount * 1.18)} in all), raised on {open.raised}, is now {open.days} days old. Bank details and UPI below. Thank you. — Leena, Accounts
            </div>
            <KV items={[{ k: "Raised", v: open.raised }, { k: "GST (18%)", v: inr(open.amount * 0.18) }, { k: "Promise", v: open.promise ?? "None" }, { k: "Reminders sent", v: open.days > 60 ? "3" : open.days > 30 ? "1" : "0" }]} />
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Studio time ---------------- */

function TimeTab({ projects }: { projects: Project[] }) {
  const desk = useDesk();
  const [entries, setEntries] = React.useState(seedEntries);
  const [adding, setAdding] = React.useState(false);
  const live = useDrift(46.5, 0.4, 2600);
  const weekTotal = hoursGrid.reduce((a, r) => a + r[7], 0) + entries.slice(seedEntries.length).reduce((a, e) => a + e.hours, 0);
  const byPerson = Object.entries(entries.reduce<Record<string, number>>((acc, e) => ((acc[e.who] = (acc[e.who] ?? 0) + e.hours), acc), {})).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Hours booked today" value={live.toFixed(1)} hint="8 people" icon={Timer} tone="info" trend={[12, 20, 27, 33, 39, 44, live]} />
        <Stat label="This week so far" value={`${Math.round(weekTotal)} h`} hint="Mon–Tue, W43" icon={CalendarClock} />
        <Stat label="Billable share" value="81%" delta="+4%" hint="target 78%" icon={Check} tone="ok" trend={[72, 74, 75, 77, 76, 79, 81]} />
        <Stat label="Projects over budget" value={projects.filter((p) => p.hoursUsed > p.hoursBudget).length} hint="Kadamba at 108%" icon={AlertTriangle} tone="late" />
      </div>
      <Panel title="Hours by project and week" sub="Darker is heavier. Click a cell for who booked it." action={<Pill mono>W36–W43</Pill>}>
        <HeatGrid
          rows={hoursRows}
          cols={WEEKS}
          values={hoursGrid}
          tone="accent"
          format={(v) => `${v}`}
          onCell={(r, c) => toast(`${hoursRows[r]} · ${WEEKS[c]}`, { description: `${hoursGrid[r][c]} hours · mostly ${r === 0 ? "Pooja and Anisha" : r === 1 ? "Sameer and Kunal" : r === 2 ? "Rohan and Anisha" : r === 3 || r === 4 ? "Fatima and Ninad" : r === 5 ? "Rohan" : "Leena"}` })}
        />
      </Panel>
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Panel title="Hour budget burn" sub="Hours used against what the fee can carry">
          <ul className="space-y-3">
            {projects.map((p) => {
              const pct = p.hoursUsed / p.hoursBudget;
              return (
                <li key={p.code}>
                  <p className="mb-1 flex items-baseline justify-between text-[13px]">
                    <span className="font-medium">{p.name}</span>
                    <span className="font-mono text-[11.5px] text-d-mute">
                      {p.hoursUsed.toLocaleString("en-IN")} / {p.hoursBudget.toLocaleString("en-IN")} h · <span style={{ color: pct > 1 ? "var(--d-late)" : undefined }}>{Math.round(pct * 100)}%</span>
                    </span>
                  </p>
                  <Meter value={p.hoursUsed} max={p.hoursBudget} tone={pct > 1 ? "late" : pct > 0.85 ? "warn" : "info"} />
                  <p className="mt-0.5 text-[11px] text-d-mute">Stage {GATES[p.stage]} · {Math.round((STAGE_PCT.slice(0, p.stage).reduce((a, x) => a + x, 0) / 100) * 100)}% of fee stages done</p>
                </li>
              );
            })}
          </ul>
        </Panel>
        <Panel title="By person" sub="Entries this week">
          <HBars data={byPerson.map(([label, value]) => ({ label, value, tone: label === "Rohan Kamat" ? "accent" : "info" }))} format={(v) => `${v} h`} />
        </Panel>
      </div>
      <Panel title="Timesheet" sub="This week's entries" action={<Btn size="sm" variant="solid" icon={Plus} onClick={() => setAdding(true)}>Log hours</Btn>}>
        <DataTable
          rows={entries}
          rowKey={(e) => e.id}
          search={(e) => `${e.who} ${e.project} ${e.task}`}
          searchPlaceholder="Search person, project or task"
          filter={{ get: (e) => (e.billable ? "Billable" : "Non-billable"), options: ["Billable", "Non-billable"] }}
          onRow={(e) => toast(`${e.who} · ${e.project}`, { description: `${e.task} · ${e.hours} h on ${e.day}` })}
          columns={[
            { key: "day", label: "Day", render: (e) => <span className="font-mono text-[12px]">{e.day}</span> },
            { key: "who", label: "Person", render: (e) => <span className="font-medium">{e.who}</span>, sort: (e) => e.who },
            { key: "project", label: "Project", render: (e) => e.project, sort: (e) => e.project },
            { key: "task", label: "Task", render: (e) => <span className="text-d-mute">{e.task}</span>, wide: true },
            { key: "hours", label: "Hours", align: "right", render: (e) => <span className="tnum font-mono">{e.hours}</span>, sort: (e) => e.hours },
            { key: "bill", label: "", render: (e) => (e.billable ? <Pill tone="ok">billable</Pill> : <Pill>internal</Pill>) },
          ]}
        />
      </Panel>
      <LogHours
        open={adding}
        onOpenChange={setAdding}
        onAdd={(e) => {
          setEntries((cur) => [{ ...e, id: `T-${cur.length + 1}` }, ...cur]);
          toast.success(`${e.hours} h logged`, { description: `${e.who} · ${e.project}` });
          desk.log(`${e.who} logged ${e.hours} h on ${e.project}`);
        }}
      />
    </div>
  );
}

function LogHours({ open, onOpenChange, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (e: Entry) => void }) {
  const [who, setWho] = React.useState("Rohan Kamat");
  const [project, setProject] = React.useState("Miramar");
  const [task, setTask] = React.useState("GCZMA presentation boards");
  const [hours, setHours] = React.useState("2.5");
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Log hours" sub="Goes to the project burn and the weekly client report.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onAdd({ id: "", who, project, task, hours: Number(hours) || 1, day: "Tue", billable: project !== "Studio / admin" });
          onOpenChange(false);
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Person">
            <select className={inputClass} value={who} onChange={(e) => setWho(e.target.value)}>
              {team.map((t) => (
                <option key={t.name}>{t.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Project">
            <select className={inputClass} value={project} onChange={(e) => setProject(e.target.value)}>
              {hoursRows.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Task">
          <input className={inputClass} value={task} onChange={(e) => setTask(e.target.value)} />
        </Field>
        <Field label="Hours">
          <input className={inputClass} inputMode="decimal" value={hours} onChange={(e) => setHours(e.target.value.replace(/[^\d.]/g, ""))} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Btn onClick={() => onOpenChange(false)}>Cancel</Btn>
          <Btn variant="solid" type="submit" icon={Plus}>
            Log
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
