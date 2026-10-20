"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Banknote,
  Bot,
  CheckCheck,
  Droplets,
  FlaskConical,
  HandCoins,
  IdCard,
  IndianRupee,
  MapPin,
  MessageCircle,
  Milk,
  Moon,
  Phone,
  Plug,
  Plus,
  Power,
  Snowflake,
  Sprout,
  Stethoscope,
  Sun,
  Syringe,
  Timer,
  TriangleAlert,
  Truck,
  Users,
  Wheat,
  Gauge as GaugeIcon,
} from "lucide-react";
import { DeskShell, useDesk } from "../shell";
import { AreaChart, Bars, Donut, HBars, HeatGrid, Sparkline } from "../charts";
import { ApprovalQueue, Board, Countdown, DataTable } from "../data";
import { AgentsModule, ConnectionsModule, IndependenceModule, PeopleModule } from "../common";
import { Avatar, Btn, Field, inputClass, inr, KV, Meter, Modal, num, Panel, Pill, Segmented, Sheet, Stat } from "../ui";
import { useDrift } from "../hooks";
import type { DeskConfig, DeskModule, IndependenceData, Integration, TeamMember, Tone, WorkforceAgent } from "../types";

/** trig rounded so server and browser render identical SVG coordinates */
const trig = { cos: (a: number) => Math.round(Math.cos(a) * 1e6) / 1e6, sin: (a: number) => Math.round(Math.sin(a) * 1e6) / 1e6 };

/* ============================================================
   Data — Tapi Dairy Collective, Bharuch. Fictional farmer producer
   organisation: 38 village societies, 2 bulk milk chillers (BMCs).
   Today is Tue 20 Oct 2026; payout cycle 11–20 Oct closes tonight.
   ============================================================ */

type Shift = "Savar" | "Sanj";
type BmcId = "AMD" | "JHG";
type Village = {
  id: string;
  name: string;
  taluka: string;
  x: number;
  y: number;
  bmc: BmcId;
  farmers: number;
  litres: Record<Shift, number>;
  fat: number;
  snf: number;
  secretary: string;
  buffalo: number;
};

const rawVillages: [string, string, number, number][] = [
  ["Amod", "Amod", 240, 92],
  ["Kerwada", "Amod", 150, 140],
  ["Samni", "Amod", 305, 150],
  ["Ikhar", "Amod", 190, 62],
  ["Dora", "Amod", 112, 88],
  ["Tankari", "Jambusar", 62, 170],
  ["Kavi", "Jambusar", 42, 108],
  ["Sarod", "Jambusar", 108, 214],
  ["Haldar", "Bharuch", 388, 212],
  ["Nabipur", "Bharuch", 428, 146],
  ["Zanor", "Bharuch", 476, 218],
  ["Shuklatirth", "Bharuch", 548, 232],
  ["Mangleshwar", "Bharuch", 610, 212],
  ["Kadod", "Bharuch", 668, 186],
  ["Nikora", "Bharuch", 728, 168],
  ["Tavra", "Bharuch", 508, 160],
  ["Osara", "Amod", 352, 86],
  ["Palej", "Bharuch", 466, 88],
  ["Dahegam", "Vagra", 176, 250],
  ["Vilayat", "Vagra", 62, 256],
  ["Jhagadia", "Jhagadia", 588, 398],
  ["Umalla", "Jhagadia", 690, 384],
  ["Rajpardi", "Jhagadia", 742, 432],
  ["Avidha", "Jhagadia", 648, 450],
  ["Govali", "Jhagadia", 528, 358],
  ["Bhalod", "Jhagadia", 470, 398],
  ["Randedi", "Jhagadia", 762, 322],
  ["Sarsa", "Jhagadia", 702, 334],
  ["Valia", "Valia", 560, 452],
  ["Kosamadi", "Ankleshwar", 408, 392],
  ["Sajod", "Ankleshwar", 302, 402],
  ["Hansot", "Hansot", 182, 384],
  ["Ilav", "Hansot", 232, 446],
  ["Kantiajal", "Hansot", 104, 352],
  ["Jitali", "Ankleshwar", 368, 432],
  ["Bhadkodra", "Ankleshwar", 442, 458],
  ["Panoli", "Ankleshwar", 508, 430],
  ["Netrang", "Netrang", 782, 470],
];
const secretaries = ["Ramanbhai Patel", "Kantaben Vasava", "Ishwarbhai Rathod", "Savitaben Chaudhari", "Mahendrasinh Gohil", "Laxmiben Vasava", "Dineshbhai Parmar", "Jashodaben Solanki", "Bhikhabhai Vasava", "Naynaben Patel"];

const villages: Village[] = rawVillages.map(([name, taluka, x, y], i) => {
  const south = y > 300;
  const morning = 140 + ((i * 53) % 9) * 34 + (south ? 30 : 0);
  const lowSnf = name === "Tankari" || name === "Kantiajal" || name === "Govali";
  return {
    id: `TDC-${String(i + 1).padStart(2, "0")}`,
    name,
    taluka,
    x,
    y,
    bmc: south ? "JHG" : "AMD",
    farmers: 38 + ((i * 11) % 7) * 13,
    litres: { Savar: morning, Sanj: Math.round(morning * 0.82) },
    fat: Math.round((3.9 + ((i * 7) % 13) * 0.14) * 10) / 10,
    snf: lowSnf ? 7.8 : Math.round((8.1 + ((i * 5) % 9) * 0.07) * 100) / 100,
    secretary: secretaries[i % secretaries.length],
    buffalo: 30 + ((i * 13) % 6) * 10,
  };
});
const pourOrder = [...villages].sort((a, b) => ((villages.indexOf(a) * 17) % 38) - ((villages.indexOf(b) * 17) % 38));
const bmcs: Record<BmcId, { name: string; x: number; y: number; cap: number }> = {
  AMD: { name: "Amod BMC", x: 262, y: 196, cap: 5000 },
  JHG: { name: "Jhagadia BMC", x: 628, y: 336, cap: 6000 },
};
const rateFor = (fat: number, snf: number, animal: "Bhens" | "Gaay" = "Bhens") => Math.round(((animal === "Bhens" ? 7.4 : 6.6) * fat + 2.5 * snf - 6) * 100) / 100;
const vRate = (v: Village) => rateFor(v.fat, v.snf, v.buffalo >= 50 ? "Bhens" : "Gaay");

const firstNames = ["Bhaveshbhai", "Geetaben", "Rameshbhai", "Manjulaben", "Jayantibhai", "Hansaben", "Pravinbhai", "Ushaben", "Arvindbhai", "Shardaben", "Kanubhai", "Minaben"];
const surnames = ["Vasava", "Patel", "Rathod", "Chaudhari", "Parmar", "Solanki", "Gohil", "Tadvi"];
const farmersOf = (v: Village) =>
  Array.from({ length: 6 }, (_, k) => {
    const i = villages.indexOf(v) * 3 + k;
    const litres = Math.round((v.litres.Savar / v.farmers) * (2.6 - k * 0.3) * 10) / 10;
    return { code: `${v.id}-${String(11 + k * 7).padStart(3, "0")}`, name: `${firstNames[i % firstNames.length]} ${surnames[(i * 3) % surnames.length]}`, litres, fat: Math.round((v.fat + (k % 3) * 0.2 - 0.2) * 10) / 10 };
  });

/* ---------------- Collection rows ---------------- */

type Pour = { code: string; name: string; village: string; animal: "Bhens" | "Gaay"; shift: Shift; litres: number; fat: number; snf: number; time: string; can: "OK" | "Low SNF" | "Sour" };
const pours: Pour[] = [
  { code: "TDC-21-018", name: "Geetaben Vasava", village: "Jhagadia", animal: "Bhens", shift: "Savar", litres: 11.4, fat: 6.4, snf: 8.9, time: "6:12 AM", can: "OK" },
  { code: "TDC-21-025", name: "Rameshbhai Tadvi", village: "Jhagadia", animal: "Gaay", shift: "Savar", litres: 14.2, fat: 4.1, snf: 8.4, time: "6:14 AM", can: "OK" },
  { code: "TDC-22-011", name: "Hansaben Vasava", village: "Umalla", animal: "Bhens", shift: "Savar", litres: 8.6, fat: 6.9, snf: 9.1, time: "6:20 AM", can: "OK" },
  { code: "TDC-06-032", name: "Jayantibhai Rathod", village: "Tankari", animal: "Gaay", shift: "Savar", litres: 9.8, fat: 3.6, snf: 7.7, time: "6:31 AM", can: "Low SNF" },
  { code: "TDC-01-004", name: "Manjulaben Patel", village: "Amod", animal: "Bhens", shift: "Savar", litres: 12.0, fat: 7.1, snf: 9.0, time: "6:33 AM", can: "OK" },
  { code: "TDC-12-019", name: "Pravinbhai Solanki", village: "Shuklatirth", animal: "Gaay", shift: "Savar", litres: 18.5, fat: 4.3, snf: 8.5, time: "6:40 AM", can: "OK" },
  { code: "TDC-25-007", name: "Ushaben Chaudhari", village: "Govali", animal: "Gaay", shift: "Savar", litres: 7.2, fat: 3.5, snf: 7.6, time: "6:44 AM", can: "Low SNF" },
  { code: "TDC-29-041", name: "Arvindbhai Vasava", village: "Valia", animal: "Bhens", shift: "Savar", litres: 10.1, fat: 6.2, snf: 8.8, time: "6:51 AM", can: "OK" },
  { code: "TDC-14-002", name: "Shardaben Gohil", village: "Nikora", animal: "Bhens", shift: "Savar", litres: 6.8, fat: 6.6, snf: 8.9, time: "6:55 AM", can: "OK" },
  { code: "TDC-34-016", name: "Kanubhai Parmar", village: "Kantiajal", animal: "Gaay", shift: "Savar", litres: 11.6, fat: 3.7, snf: 7.8, time: "7:02 AM", can: "Low SNF" },
  { code: "TDC-30-023", name: "Minaben Tadvi", village: "Kosamadi", animal: "Bhens", shift: "Savar", litres: 9.4, fat: 6.0, snf: 8.7, time: "7:05 AM", can: "OK" },
  { code: "TDC-17-030", name: "Bhaveshbhai Patel", village: "Osara", animal: "Gaay", shift: "Savar", litres: 21.0, fat: 4.4, snf: 8.6, time: "7:09 AM", can: "OK" },
  { code: "TDC-09-012", name: "Laxmiben Rathod", village: "Haldar", animal: "Bhens", shift: "Savar", litres: 5.5, fat: 5.4, snf: 8.4, time: "7:15 AM", can: "Sour" },
  { code: "TDC-23-009", name: "Dineshbhai Vasava", village: "Rajpardi", animal: "Bhens", shift: "Savar", litres: 13.3, fat: 7.0, snf: 9.2, time: "7:18 AM", can: "OK" },
  { code: "TDC-03-021", name: "Kokilaben Chaudhari", village: "Samni", animal: "Gaay", shift: "Savar", litres: 16.4, fat: 4.2, snf: 8.5, time: "7:22 AM", can: "OK" },
  { code: "TDC-21-018", name: "Geetaben Vasava", village: "Jhagadia", animal: "Bhens", shift: "Sanj", litres: 9.6, fat: 6.8, snf: 9.0, time: "5:48 PM", can: "OK" },
  { code: "TDC-01-004", name: "Manjulaben Patel", village: "Amod", animal: "Bhens", shift: "Sanj", litres: 10.2, fat: 7.3, snf: 9.1, time: "5:52 PM", can: "OK" },
  { code: "TDC-12-019", name: "Pravinbhai Solanki", village: "Shuklatirth", animal: "Gaay", shift: "Sanj", litres: 15.8, fat: 4.5, snf: 8.5, time: "6:01 PM", can: "OK" },
  { code: "TDC-17-030", name: "Bhaveshbhai Patel", village: "Osara", animal: "Gaay", shift: "Sanj", litres: 17.9, fat: 4.6, snf: 8.6, time: "6:06 PM", can: "OK" },
  { code: "TDC-23-009", name: "Dineshbhai Vasava", village: "Rajpardi", animal: "Bhens", shift: "Sanj", litres: 11.0, fat: 7.2, snf: 9.1, time: "6:11 PM", can: "OK" },
];

/* ---------------- Tankers ---------------- */

type Tanker = { id: string; vehicle: string; from: BmcId; litres: number; temp: number; seal: string; driver: string; status: "Loading" | "On road" | "At dairy" | "Accepted" | "Scheduled"; eta: number; fat: number; snf: number };
const seedTankers: Tanker[] = [
  { id: "TK-1041", vehicle: "GJ16 AV 4471", from: "JHG", litres: 5420, temp: 3.9, seal: "S-88213", driver: "Imtiyaz Malek", status: "On road", eta: 1.4, fat: 5.6, snf: 8.7 },
  { id: "TK-1040", vehicle: "GJ16 AX 1902", from: "AMD", litres: 4310, temp: 4.2, seal: "S-88209", driver: "Rafiq Shaikh", status: "At dairy", eta: 0, fat: 5.2, snf: 8.6 },
  { id: "TK-1039", vehicle: "GJ16 AV 4471", from: "JHG", litres: 4980, temp: 4.0, seal: "S-88196", driver: "Imtiyaz Malek", status: "Accepted", eta: 0, fat: 5.5, snf: 8.7 },
  { id: "TK-1038", vehicle: "GJ16 AX 1902", from: "AMD", litres: 3960, temp: 4.6, seal: "S-88190", driver: "Rafiq Shaikh", status: "Accepted", eta: 0, fat: 5.1, snf: 8.5 },
  { id: "TK-1042", vehicle: "GJ16 AX 1902", from: "AMD", litres: 0, temp: 0, seal: "—", driver: "Rafiq Shaikh", status: "Scheduled", eta: 7.5, fat: 0, snf: 0 },
  { id: "TK-1043", vehicle: "GJ06 BT 7730 (hired)", from: "JHG", litres: 2150, temp: 4.4, seal: "pending", driver: "Sureshbhai Bharwad", status: "Loading", eta: 3, fat: 5.4, snf: 8.6 },
];

/* ---------------- Payouts ---------------- */

type Payout = { code: string; name: string; village: string; litres: number; gross: number; feed: number; advance: number; mineral: number; insurance: number; share: number; upi: string; status: "Ready" | "Released" | "UPI failed" | "Cash" };
const payoutsSeed: Payout[] = [
  ["TDC-21-018", "Geetaben Vasava", "Jhagadia", 214, 13480, 1150, 0, 120, 60, 100, "geetaben@okbob", "Ready"],
  ["TDC-01-004", "Manjulaben Patel", "Amod", 228, 14830, 1380, 2000, 120, 60, 100, "9824xxxx12@ybl", "Ready"],
  ["TDC-12-019", "Pravinbhai Solanki", "Shuklatirth", 342, 14220, 2300, 0, 0, 60, 100, "pravin.solanki@sbi", "Ready"],
  ["TDC-17-030", "Bhaveshbhai Patel", "Osara", 389, 16540, 2300, 1500, 120, 60, 100, "bhavesh1976@okaxis", "Ready"],
  ["TDC-23-009", "Dineshbhai Vasava", "Rajpardi", 243, 15960, 1150, 0, 120, 60, 100, "9913xxxx40@ybl", "UPI failed"],
  ["TDC-06-032", "Jayantibhai Rathod", "Tankari", 176, 5630, 1150, 500, 0, 60, 100, "—", "Cash"],
  ["TDC-22-011", "Hansaben Vasava", "Umalla", 158, 10420, 0, 0, 120, 60, 100, "hansaben.v@okbob", "Ready"],
  ["TDC-29-041", "Arvindbhai Vasava", "Valia", 186, 11710, 1150, 0, 120, 60, 100, "9726xxxx88@paytm", "Ready"],
  ["TDC-14-002", "Shardaben Gohil", "Nikora", 124, 8030, 0, 0, 120, 60, 100, "sharda.gohil@okhdfc", "Released"],
  ["TDC-34-016", "Kanubhai Parmar", "Kantiajal", 208, 6880, 2300, 0, 0, 60, 100, "kanu.parmar@sbi", "Ready"],
  ["TDC-30-023", "Minaben Tadvi", "Kosamadi", 171, 10690, 1150, 1000, 120, 60, 100, "minaben@okbob", "Ready"],
  ["TDC-03-021", "Kokilaben Chaudhari", "Samni", 301, 12590, 1150, 0, 120, 60, 100, "kokila.c@ybl", "Released"],
  ["TDC-09-012", "Laxmiben Rathod", "Haldar", 98, 5310, 0, 0, 0, 60, 100, "9879xxxx03@ybl", "UPI failed"],
  ["TDC-25-007", "Ushaben Chaudhari", "Govali", 132, 4180, 1150, 0, 0, 60, 100, "—", "Cash"],
  ["TDC-36-014", "Pravinbhai Vasava", "Bhadkodra", 266, 16900, 2300, 3000, 120, 60, 100, "pv.bhadkodra@okaxis", "Ready"],
  ["TDC-20-005", "Shardaben Tadvi", "Vilayat", 145, 9240, 0, 0, 120, 60, 100, "9558xxxx71@ybl", "Ready"],
].map(([code, name, village, litres, gross, feed, advance, mineral, insurance, share, upi, status]) => ({ code, name, village, litres, gross, feed, advance, mineral, insurance, share, upi, status }) as Payout);
const net = (p: Payout) => p.gross - p.feed - p.advance - p.mineral - p.insurance - p.share;

/* ---------------- Feed & vet ---------------- */

type FeedOrder = { id: string; society: string; product: string; bags: number; rate: number; status: "Requested" | "Ordered" | "Dispatched" | "Delivered"; supplier: string; date: string };
const feedOrders: FeedOrder[] = [
  { id: "FO-611", society: "Jhagadia", product: "Tapi Pashu Aahar 20% protein, 50 kg", bags: 120, rate: 1380, status: "Dispatched", supplier: "Sabar Feed Plant, Himmatnagar", date: "18 Oct" },
  { id: "FO-612", society: "Umalla", product: "Tapi Pashu Aahar 20% protein, 50 kg", bags: 80, rate: 1380, status: "Ordered", supplier: "Sabar Feed Plant, Himmatnagar", date: "19 Oct" },
  { id: "FO-613", society: "Amod", product: "Bypass protein feed, 50 kg", bags: 40, rate: 1720, status: "Delivered", supplier: "Narmada Agro Feeds, Rajpipla", date: "14 Oct" },
  { id: "FO-614", society: "Osara", product: "Mineral mixture, 5 kg", bags: 60, rate: 410, status: "Delivered", supplier: "Kaveri Minerals, Anand", date: "12 Oct" },
  { id: "FO-615", society: "Rajpardi", product: "Tapi Pashu Aahar 20% protein, 50 kg", bags: 95, rate: 1380, status: "Requested", supplier: "Sabar Feed Plant, Himmatnagar", date: "20 Oct" },
  { id: "FO-616", society: "Shuklatirth", product: "Maize silage bale, 50 kg", bags: 150, rate: 260, status: "Ordered", supplier: "Kadod Silage Group", date: "19 Oct" },
  { id: "FO-617", society: "Valia", product: "Calf starter, 25 kg", bags: 25, rate: 980, status: "Requested", supplier: "Narmada Agro Feeds, Rajpipla", date: "20 Oct" },
  { id: "FO-618", society: "Nikora", product: "Mineral mixture, 5 kg", bags: 45, rate: 410, status: "Dispatched", supplier: "Kaveri Minerals, Anand", date: "17 Oct" },
  { id: "FO-619", society: "Kosamadi", product: "Tapi Pashu Aahar 20% protein, 50 kg", bags: 70, rate: 1380, status: "Delivered", supplier: "Sabar Feed Plant, Himmatnagar", date: "11 Oct" },
  { id: "FO-620", society: "Samni", product: "Bypass protein feed, 50 kg", bags: 30, rate: 1720, status: "Ordered", supplier: "Narmada Agro Feeds, Rajpipla", date: "18 Oct" },
];
type VetCall = { id: string; farmer: string; village: string; kind: "AI" | "Mastitis" | "FMD vaccine" | "Calving" | "Deworming" | "Fever"; animal: string; stage: "Requested" | "Scheduled" | "Done"; who: string; when: string };
const seedVet: VetCall[] = [
  { id: "VC-301", farmer: "Hansaben Vasava", village: "Umalla", kind: "AI", animal: "Mehsani buffalo, 2nd lactation", stage: "Scheduled", who: "Mukesh Vasava", when: "Today 4 PM" },
  { id: "VC-302", farmer: "Bhaveshbhai Patel", village: "Osara", kind: "Mastitis", animal: "HF cross cow", stage: "Requested", who: "Dr. Kinjal Desai", when: "Asap" },
  { id: "VC-303", farmer: "Dineshbhai Vasava", village: "Rajpardi", kind: "Calving", animal: "Jafarabadi buffalo", stage: "Scheduled", who: "Dr. Kinjal Desai", when: "Tonight, on call" },
  { id: "VC-304", farmer: "Umalla society", village: "Umalla", kind: "FMD vaccine", animal: "142 animals, camp", stage: "Scheduled", who: "Dr. Kinjal Desai", when: "Today 1 PM" },
  { id: "VC-305", farmer: "Kanubhai Parmar", village: "Kantiajal", kind: "Fever", animal: "Gir cow", stage: "Requested", who: "Unassigned", when: "Asap" },
  { id: "VC-306", farmer: "Geetaben Vasava", village: "Jhagadia", kind: "AI", animal: "Surti buffalo", stage: "Done", who: "Mukesh Vasava", when: "Today 8 AM" },
  { id: "VC-307", farmer: "Arvindbhai Vasava", village: "Valia", kind: "Deworming", animal: "4 calves", stage: "Done", who: "Mukesh Vasava", when: "Yesterday" },
  { id: "VC-308", farmer: "Minaben Tadvi", village: "Kosamadi", kind: "AI", animal: "Mehsani buffalo", stage: "Requested", who: "Unassigned", when: "Tomorrow" },
  { id: "VC-309", farmer: "Pravinbhai Solanki", village: "Shuklatirth", kind: "Mastitis", animal: "HF cross cow", stage: "Done", who: "Dr. Kinjal Desai", when: "Yesterday" },
  { id: "VC-310", farmer: "Laxmiben Rathod", village: "Haldar", kind: "AI", animal: "Gir cow", stage: "Scheduled", who: "Mukesh Vasava", when: "Tomorrow 9 AM" },
];

/* ---------------- Members ---------------- */

type Member = { no: string; name: string; village: string; since: number; shares: number; litresYear: number; woman: boolean; status: "Active" | "Dormant" };
const members: Member[] = [
  { no: "M-0012", name: "Manjulaben Patel", village: "Amod", since: 2019, shares: 20, litresYear: 7420, woman: true, status: "Active" },
  { no: "M-0047", name: "Bhaveshbhai Patel", village: "Osara", since: 2019, shares: 30, litresYear: 12650, woman: false, status: "Active" },
  { no: "M-0108", name: "Geetaben Vasava", village: "Jhagadia", since: 2020, shares: 15, litresYear: 6980, woman: true, status: "Active" },
  { no: "M-0131", name: "Pravinbhai Solanki", village: "Shuklatirth", since: 2020, shares: 25, litresYear: 11120, woman: false, status: "Active" },
  { no: "M-0219", name: "Hansaben Vasava", village: "Umalla", since: 2021, shares: 10, litresYear: 5160, woman: true, status: "Active" },
  { no: "M-0388", name: "Dineshbhai Vasava", village: "Rajpardi", since: 2021, shares: 15, litresYear: 7910, woman: false, status: "Active" },
  { no: "M-0412", name: "Kokilaben Chaudhari", village: "Samni", since: 2021, shares: 20, litresYear: 9800, woman: true, status: "Active" },
  { no: "M-0596", name: "Jayantibhai Rathod", village: "Tankari", since: 2022, shares: 5, litresYear: 1320, woman: false, status: "Dormant" },
  { no: "M-0644", name: "Minaben Tadvi", village: "Kosamadi", since: 2022, shares: 10, litresYear: 5570, woman: true, status: "Active" },
  { no: "M-0791", name: "Shardaben Gohil", village: "Nikora", since: 2023, shares: 10, litresYear: 4040, woman: true, status: "Active" },
  { no: "M-0832", name: "Arvindbhai Vasava", village: "Valia", since: 2023, shares: 10, litresYear: 6060, woman: false, status: "Active" },
  { no: "M-0950", name: "Kanubhai Parmar", village: "Kantiajal", since: 2024, shares: 5, litresYear: 2210, woman: false, status: "Dormant" },
  { no: "M-1077", name: "Ushaben Chaudhari", village: "Govali", since: 2024, shares: 5, litresYear: 2880, woman: true, status: "Active" },
  { no: "M-1140", name: "Pravinbhai Vasava", village: "Bhadkodra", since: 2025, shares: 10, litresYear: 8670, woman: false, status: "Active" },
  { no: "M-1203", name: "Shardaben Tadvi", village: "Vilayat", since: 2025, shares: 5, litresYear: 3020, woman: true, status: "Active" },
  { no: "M-1266", name: "Laxmiben Rathod", village: "Haldar", since: 2026, shares: 5, litresYear: 1190, woman: true, status: "Active" },
];
const SHARE = 1000;
const applications = [
  { id: "AP-71", title: "Savitaben Vasava, Avidha", sub: "2 Mehsani buffaloes · 9 L/day · Aadhaar + bank verified", amount: "5 shares · ₹5,000", meta: "Woman" },
  { id: "AP-72", title: "Rajubhai Tadvi, Netrang", sub: "3 Gir cows · 14 L/day · new society in formation", amount: "5 shares · ₹5,000", meta: "Netrang" },
  { id: "AP-73", title: "Nirmalaben Patel, Palej", sub: "1 HF cross · 11 L/day · husband already a member", amount: "5 shares · ₹5,000", meta: "Woman" },
  { id: "AP-74", title: "Ashokbhai Rathod, Kavi", sub: "4 Surti buffaloes · 22 L/day · moving from private dairy", amount: "10 shares · ₹10,000", meta: "Switcher" },
];

/* ---------------- Shared modules ---------------- */

const team: TeamMember[] = [
  { name: "Hiralal Vasava", role: "CEO", status: "Busy", load: 90, focus: "Releasing the 11–20 Oct payout and the Narmada Valley rate talk", tasks: [{ title: "Sign payout cycle, ₹1.18 Cr", due: "8 PM" }, { title: "Rate revision call with Narmada Valley Dairy", due: "3:00" }, { title: "NABARD FPO grant report", due: "Fri" }], week: [1, 1, 1, 1, 1, 1], since: "2019" },
  { name: "Bhavnaben Patel", role: "Accounts & payouts", status: "On floor", load: 88, focus: "Payout sheet for 2,946 farmers, 2 UPI failures", tasks: [{ title: "Re-try failed UPI payouts", due: "6 PM" }, { title: "Feed deduction tally from Sabar invoice", due: "4 PM", done: true }], week: [1, 1, 1, 1, 1, 1], since: "2019" },
  { name: "Rameshbhai Rathwa", role: "BMC operator, Jhagadia", status: "On floor", load: 74, focus: "Compressor 2 service, tanker TK-1043 loading", tasks: [{ title: "Load TK-1043 at 4°C", due: "now" }, { title: "Clean CIP after Sanj", due: "9 PM" }], week: [1, 1, 1, 1, 1, 1], since: "2020" },
  { name: "Jayeshbhai Chaudhari", role: "BMC operator, Amod", status: "On floor", load: 69, focus: "Low SNF cans from Tankari, DG diesel top-up", tasks: [{ title: "Lactometer re-test Tankari cans", due: "11:30", done: true }, { title: "DG diesel 60 L", due: "2:00" }], week: [1, 1, 1, 0, 1, 1], since: "2021" },
  { name: "Dr. Kinjal Desai", role: "Veterinary officer", status: "In field", load: 82, focus: "FMD camp at Umalla, mastitis call in Osara", tasks: [{ title: "FMD vaccination camp, 142 animals", due: "1:00" }, { title: "Mastitis treatment, Osara", due: "5:00" }], week: [1, 1, 1, 1, 1, 0], since: "2022" },
  { name: "Mukesh Vasava", role: "AI technician & field", status: "In field", load: 77, focus: "4 AI calls, liquid nitrogen refill on Thursday", tasks: [{ title: "AI at Umalla", due: "4:00" }, { title: "Pregnancy diagnosis list", due: "Thu" }], week: [1, 1, 1, 1, 1, 1], since: "2021" },
  { name: "Sejalben Solanki", role: "Member services", status: "Busy", load: 64, focus: "4 new member applications, dividend letters", tasks: [{ title: "Verify Avidha application", due: "today" }, { title: "Share certificates for 31 members", due: "Fri" }], week: [1, 1, 1, 1, 0, 1], since: "2023" },
  { name: "Imtiyaz Malek", role: "Tankers & logistics", status: "In field", load: 71, focus: "TK-1041 to Narmada Valley Dairy, Ankleshwar", tasks: [{ title: "Deliver TK-1041", due: "1:30" }, { title: "Tyre change GJ16 AV 4471", due: "Sat" }], week: [1, 1, 1, 1, 1, 1], since: "2020" },
];

const agents: WorkforceAgent[] = [
  { name: "Collection Reader", role: "Reads every society's milk analyser and weighing scale", icon: Milk, status: "Running", runsToday: 76, hoursSaved: 5, accuracy: 98, last: "just now", skills: ["Milkoscan", "Fat/SNF", "Society apps"], schedule: "Live, every can", log: ["Savar closed: 38 of 38 societies", "3 Low SNF cans flagged from Tankari", "Osara crossed 1,000 L for the first time"] },
  { name: "Cold Chain Guard", role: "Watches BMC temperatures, power and compressors", icon: Snowflake, status: "Needs you", runsToday: 288, hoursSaved: 3, accuracy: 99, last: "1 min ago", skills: ["IoT probes", "DG logs", "Alerts"], schedule: "Every 5 minutes", inbox: [{ title: "Jhagadia BMC took 3h 40m to reach 4°C", detail: "Compressor 2 is cycling. Service visit drafted with Frigo Services, Bharuch for tomorrow 9 AM." }], log: ["Amod BMC at 4.1°C", "Power cut 41 min at Jhagadia, DG took load", "Tanker TK-1041 loaded at 3.9°C"] },
  { name: "Payout Clerk", role: "Builds the 10-day payout with every deduction", icon: Banknote, status: "Needs you", runsToday: 2, hoursSaved: 9, accuracy: 97, last: "20 min ago", skills: ["Rate chart", "Deductions", "UPI bulk"], schedule: "Every 10th, 20th, last day", inbox: [{ title: "Payout 11–20 Oct ready: ₹1.18 Cr to 2,946 farmers", detail: "2 UPI handles failed last cycle; 41 farmers paid in cash at society." }], log: ["Applied feed deductions ₹6.1 L", "Recovered advances ₹1.9 L", "Flagged 2 changed bank accounts"] },
  { name: "Quality Coach", role: "Sends farmers tips when fat or SNF drops", icon: FlaskConical, status: "Running", runsToday: 14, hoursSaved: 2, accuracy: 90, last: "35 min ago", skills: ["Gujarati voice notes", "Feed advice", "Adulteration checks"], schedule: "After each shift", log: ["Voice note to Tankari: green fodder + mineral mix", "Govali SNF down 3 days in a row", "Thanked Rajpardi for 7.0 fat average"] },
  { name: "Vet Dispatcher", role: "Routes AI and vet calls to Mukesh and Dr. Kinjal", icon: Stethoscope, status: "Running", runsToday: 9, hoursSaved: 3.5, accuracy: 93, last: "12 min ago", skills: ["IVR calls", "Route plan", "Heat detection"], schedule: "On every farmer call", log: ["Calving alert Rajpardi, Dr. Kinjal on call", "Combined 3 AI calls on the Umalla route", "FMD camp reminder to 142 households"] },
  { name: "Member Desk", role: "Answers farmers on WhatsApp in Gujarati", icon: MessageCircle, status: "Idle", runsToday: 31, hoursSaved: 4, accuracy: 88, last: "1 h ago", skills: ["Gujarati", "Payslips", "Share balance"], schedule: "On incoming message", log: ["Sent 19 payslips on request", "Explained SNF deduction to 4 farmers", "Booked 2 AI calls"] },
];

const independence: IndependenceData = {
  score: 46,
  history: [30, 33, 36, 38, 41, 44, 46],
  quote: "Farmers trust the collective because they can call me. But if I am the only one who can explain the rate chart, we are not a collective, we are Hiralal.",
  pillars: [
    { name: "Milk collection", score: 66, note: "Society secretaries run both shifts on their own; analysers sync automatically.", fixes: [{ title: "Auto-reject sour cans with photo", gain: 2 }] },
    { name: "Cold chain", score: 52, note: "BMC operators are good, but compressor faults still go to Hiralal's phone.", fixes: [{ title: "Service contract with escalation", gain: 3 }, { title: "Cold Chain Guard alerts to operators", gain: 2 }] },
    { name: "Payouts", score: 41, note: "Bhavnaben builds the sheet; only Hiralal can release from the bank.", fixes: [{ title: "Two-signatory release on UPI bulk", gain: 4 }] },
    { name: "Buyer & rates", score: 24, note: "Rate negotiation with Narmada Valley Dairy is entirely Hiralal.", fixes: [{ title: "Board rate committee", gain: 3 }, { title: "Monthly price benchmark", gain: 2 }] },
    { name: "Vet & AI", score: 58, note: "Dr. Kinjal and Mukesh plan their own routes from the call log.", fixes: [{ title: "Heat detection reminders", gain: 2 }] },
    { name: "Members & board", score: 47, note: "Sejalben handles members; board papers are still typed by Hiralal.", fixes: [{ title: "Board pack generated monthly", gain: 2 }] },
    { name: "Owner time", score: 34, note: "Hiralal spends 12 hours a week on farmer calls about payments.", fixes: [{ title: "Member Desk answers payslip questions", gain: 4 }] },
  ],
  ownerHours: [
    { label: "Farmer calls", hours: 12 },
    { label: "Buyer & rates", hours: 7 },
    { label: "Payout release", hours: 5 },
    { label: "BMC faults", hours: 5 },
    { label: "Board & NABARD", hours: 6 },
    { label: "Village visits", hours: 4 },
    { label: "New products", hours: 1 },
  ],
};

const integrations: Integration[] = [
  { name: "Society milk analysers", category: "Collection", status: "Connected", detail: "38 Milkoscan / Ekomilk units with weighing scales.", synced: "live", records: "2,812 cans today", mark: "MA", color: "#2f7d4f" },
  { name: "BMC IoT probes", category: "Cold chain", status: "Syncing", detail: "Temperature, tank level and power at both chillers.", synced: "1 min ago", records: "576 readings", mark: "IoT", color: "#4a56b5" },
  { name: "Tally Prime", category: "Accounts", status: "Connected", detail: "Payouts, deductions, feed sales and share capital.", synced: "12 min ago", records: "18,420 vouchers", mark: "T", color: "#1c4f9c" },
  { name: "WhatsApp Business", category: "Messaging", status: "Connected", detail: "Gujarati payslips, rate charts and quality tips.", synced: "just now", records: "4,120 chats", mark: "W", color: "#1f9d55" },
  { name: "Bank of Baroda bulk UPI", category: "Payments", status: "Connected", detail: "10-day payouts straight to farmers' UPI handles.", synced: "11 Oct", records: "2,905 payees", mark: "BoB", color: "#f26522" },
  { name: "Narmada Valley Dairy portal", category: "Buyer", status: "Error", detail: "Tanker acceptance slips not syncing since Sunday.", synced: "2 days ago", records: "—", mark: "NV", color: "#c2412d" },
  { name: "INAPH (NDDB)", category: "Animal health", status: "Connected", detail: "AI, vaccination and pashu aadhaar tag records.", synced: "9:30 AM", records: "6,840 animals", mark: "IN", color: "#7a5c99" },
  { name: "Google Sheets", category: "Planning", status: "Connected", detail: "Board papers and the old member register.", synced: "1 h ago", records: "5 sheets", mark: "GS", color: "#0f9d58" },
  { name: "IVR helpline", category: "Messaging", status: "Available", detail: "Toll-free number for vet calls and payslips.", synced: "—", records: "—", mark: "IVR", color: "#64748b" },
];

/* ============================================================
   Config
   ============================================================ */

const config: DeskConfig = {
  slug: "dairy-fpo",
  company: "Tapi Dairy Collective",
  brand: "Tapi",
  city: "Bharuch",
  state: "GJ",
  icon: Milk,
  tagline: "Farmer producer organisation · 38 village societies · 2 bulk milk chillers · 2,946 members",
  owner: { name: "Hiralal Vasava", first: "Hiralal", initials: "HV", role: "CEO" },
  theme: {
    variant: "atelier",
    paper: "#f6f8f2",
    panel: "#ffffff",
    sunk: "#edf1e7",
    ink: "#14261b",
    mute: "#5d6c61",
    line: "#dfe6d8",
    accent: "#2f7d4f",
    accentInk: "#ffffff",
    soft: "#e3f1e6",
    ok: "#23866f",
    warn: "#c27d16",
    late: "#c2412d",
    info: "#4a56b5",
    heading: "sans",
    radius: 14,
  },
  agenda: [
    { at: 8.5, title: "Savar collection closes", detail: "38 societies, 3 Low SNF cans at Tankari", count: 38, tone: "ok", module: "collection" },
    { at: 10, title: "Tanker TK-1041 to Narmada Valley", detail: "5,420 L from Jhagadia at 3.9°C", tone: "info", module: "chilling" },
    { at: 13, title: "FMD camp, Umalla", detail: "142 animals, Dr. Kinjal", count: 142, tone: "accent", module: "feedvet" },
    { at: 15, title: "Rate call with Narmada Valley Dairy", detail: "They offer ₹7.80 per kg fat, we want ₹8.10", tone: "warn", module: "collection" },
    { at: 17.5, title: "Sanj collection starts", detail: "Evening pour across 38 villages", count: 38, tone: "ok", module: "pulse" },
    { at: 20, title: "Release payout 11–20 Oct", detail: "₹1.18 Cr to 2,946 farmers", count: 2, tone: "late", module: "payouts" },
  ],
  activity: [
    { time: "11:48 AM", text: "Tanker TK-1040 accepted at Narmada Valley Dairy: 4,310 L, fat 5.2", tone: "ok" },
    { time: "11:20 AM", text: "Cold Chain Guard: power cut 41 min at Jhagadia, DG took load", tone: "warn" },
    { time: "10:52 AM", text: "Payout Clerk built the 11–20 Oct sheet: ₹1.18 Cr", tone: "info" },
    { time: "9:35 AM", text: "4 new member applications from Avidha, Netrang, Palej and Kavi", tone: "neutral" },
    { time: "8:41 AM", text: "Savar closed: 21,840 L from 38 societies", tone: "ok" },
    { time: "7:15 AM", text: "Sour can rejected at Haldar, farmer informed in Gujarati", tone: "late" },
  ],
  asks: [
    { q: "How much milk did we collect this morning?", a: "Savar closed at 8:41 AM with about 9,060 L from 38 societies (yesterday: 8,870 L).\n\n• Average fat 4.8%, SNF 8.38%\n• Highest: Rajpardi and Jhagadia, both above 6.8% fat on buffalo milk\n• Three cans flagged Low SNF at Tankari, Kantiajal and Govali, all cow milk\n\nThe Jhagadia BMC is at 81% of capacity; TK-1043 is loading now.", sources: ["Society analysers", "BMC tank levels"] },
    { q: "Is the 11–20 Oct payout ready?", a: "Yes, ₹1.18 Cr gross for 2,946 farmers.\n\n• Deductions: cattle feed ₹6.1 L, advance recovery ₹1.9 L, mineral mixture ₹0.7 L, insurance ₹1.8 L, share instalments ₹2.9 L\n• Net payable: ₹1.04 Cr\n• 2,905 by UPI, 41 in cash at the society\n\nTwo UPI handles failed last cycle (Rajpardi and Haldar); Bhavnaben has asked both for new handles. Release is due by 8 PM.", sources: ["Payout Clerk", "Tally", "Bank of Baroda"] },
    { q: "Why is SNF low in Tankari and Govali?", a: "Both are mostly cow-milk villages and the SNF has dropped for three days. The likely reason is dry fodder after the late monsoon, not water: the lactometer re-test at Amod BMC was normal.\n\nQuality Coach sent Gujarati voice notes about green fodder and mineral mixture. Dr. Kinjal suggests 60 bags of mineral mixture on credit, recovered from the next payout.", sources: ["Analyser trend", "BMC re-test", "Vet notes"] },
    { q: "Are the chillers healthy?", a: "Amod BMC is at 4.1°C and fine.\n\nJhagadia BMC took 3 hours 40 minutes to bring the Savar milk to 4°C (target 3 hours) because compressor 2 is cycling. There was also a 41-minute power cut; the DG took over. A service visit from Frigo Services is drafted for tomorrow 9 AM, needs your OK.", sources: ["BMC IoT probes", "DG log"] },
    { q: "What does Narmada Valley Dairy owe us?", a: "₹46.2 L for the last 10 days of tankers, due on 25 Oct as per contract. Two acceptance slips (TK-1038, TK-1039) are not yet on their portal because of a sync error; the paper slips are with Imtiyaz.\n\nAt today's 3 PM call: they offer ₹7.80 per kg fat; at ₹8.10 the collective earns about ₹3.9 L more a month.", sources: ["Tanker register", "Contract", "Rate model"] },
    { q: "Draft a Gujarati message to Tankari farmers", a: "Draft (not sent):\n\n“Ram Ram, Tankari dudh mandali na sabhyo. Chhella 3 divas thi tamara dudh ma SNF 7.8 aave chhe, je 8.0 thi ochhu chhe. Lili chaar ane khanij mishran (mineral mixture) aapva thi SNF vadhe chhe. Mandali par 5 kg mineral mixture udhaar ma malse, aavta payout ma kapase. — Tapi Dairy Collective”", sources: ["Quality Coach", "Feed stock"] },
  ],
  run: {
    label: "Runs after every shift. You can also run it now.",
    title: "Shift Closer",
    steps: [
      { text: "Read 38 society analysers and scales", result: "9,060 L, fat 4.8%, SNF 8.38%" },
      { text: "Check quality against the rate chart", result: "3 Low SNF cans, 1 sour can rejected" },
      { text: "Reconcile societies with BMC tank levels", result: "Gap 0.4%, within tolerance" },
      { text: "Check cold chain and plan tankers", result: "Jhagadia slow to chill, TK-1043 loading" },
      { text: "Update the 10-day payout and deductions", result: "₹1.18 Cr gross, ₹1.04 Cr net" },
    ],
    outcome: "Morning milk is in and chilled. Approve the compressor service at Jhagadia, send the Tankari quality note, and release the payout by 8 PM so farmers see money before Diwali shopping.",
    actions: ["Approve Jhagadia compressor service", "Send Tankari quality voice note", "Release 11–20 Oct payout", "Share shift report with the board"],
  },
};

/* ============================================================
   Desk
   ============================================================ */

export default function DairyFpoDesk() {
  const [shift, setShift] = React.useState<Shift>("Savar");
  const [step, setStep] = React.useState(26);
  const [tankers, setTankers] = React.useState(seedTankers);

  const modules: DeskModule[] = [
    {
      id: "pulse",
      label: "Milk pulse",
      title: "Village milk pulse",
      blurb: "Every society around Bharuch, lighting up as the milk is poured",
      icon: Droplets,
      notes: ["Each circle is a village dairy society; its size is today's litres and it pulses the moment the can is poured.", "Switch Savar and Sanj to replay the morning or evening shift.", "Click any village for its farmers, quality and payout."],
      render: () => <PulseHome shift={shift} setShift={setShift} step={step} setStep={setStep} tankers={tankers} />,
    },
    { id: "collection", label: "Collection", count: pours.filter((p) => p.can !== "OK").length, title: "Collection", blurb: "Farmer-wise litres, fat and SNF, and the rate chart that turns them into rupees", icon: Milk, render: () => <CollectionModule /> },
    { id: "chilling", label: "Chilling centres", count: tankers.filter((t) => t.status === "Loading").length, title: "Chilling centres", blurb: "Two bulk milk chillers, their temperature, power and the tankers leaving them", icon: Snowflake, render: () => <ChillingModule tankers={tankers} setTankers={setTankers} /> },
    { id: "payouts", label: "Farmer payouts", count: payoutsSeed.filter((p) => p.status === "UPI failed").length, title: "Farmer payouts", blurb: "The 10-day cycle: litres, rate, deductions and UPI, farmer by farmer", icon: Banknote, render: () => <PayoutsModule /> },
    { id: "feedvet", label: "Feed & vet", count: seedVet.filter((v) => v.stage === "Requested").length, title: "Feed & vet", blurb: "Cattle feed on credit, artificial insemination and the vet's day", icon: Stethoscope, render: () => <FeedVetModule /> },
    { id: "members", label: "Members & shares", count: applications.length, title: "Members & shares", blurb: "Share capital, dividends and the farmers who want to join", icon: IdCard, render: () => <MembersModule /> },
    { id: "team", label: "People", title: "People", blurb: "Accounts, chiller operators, the vet and the field team", icon: Users, render: () => <PeopleModule members={team} /> },
    { id: "agents", label: "Agents", title: "Agents", blurb: "Six AI agents watching every can, chiller and payout", icon: Bot, render: () => <AgentsModule agents={agents} /> },
    { id: "independence", label: "Independence", title: "Owner independence", blurb: "How much of the collective runs without Hiralal on the phone", icon: GaugeIcon, render: () => <IndependenceModule data={independence} /> },
    { id: "connections", label: "Connections", title: "Connections", blurb: "Milk analysers, BMC probes, Tally, WhatsApp and bulk UPI", icon: Plug, render: () => <ConnectionsModule items={integrations} /> },
  ];

  return <DeskShell config={config} modules={modules} />;
}

/* ============================================================
   Home: Village milk pulse
   ============================================================ */

function PulseHome({
  shift,
  setShift,
  step,
  setStep,
  tankers,
}: {
  shift: Shift;
  setShift: (s: Shift) => void;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  tankers: Tanker[];
}) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<Village | null>(null);
  const [hover, setHover] = React.useState<Village | null>(null);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setStep((s) => (s >= villages.length ? s : s + 1)), 900);
    return () => window.clearInterval(id);
  }, [paused, setStep]);

  const poured = pourOrder.slice(0, step);
  const pouredIds = new Set(poured.map((v) => v.id));
  const current = step > 0 && step <= villages.length ? pourOrder[step - 1] : null;
  const litres = poured.reduce((a, v) => a + v.litres[shift], 0);
  const total = villages.reduce((a, v) => a + v.litres[shift], 0);
  const fat = poured.length ? poured.reduce((a, v) => a + v.fat * v.litres[shift], 0) / Math.max(1, litres) : 0;
  const snf = poured.length ? poured.reduce((a, v) => a + v.snf * v.litres[shift], 0) / Math.max(1, litres) : 0;
  const recent = poured.slice(-5);
  const lowQ = villages.filter((v) => v.snf < 8);
  const rMax = Math.max(...villages.map((v) => v.litres.Savar));

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel
          live
          title={`${shift === "Savar" ? "Savar" : "Sanj"} collection · ${poured.length} of ${villages.length} societies poured`}
          sub="Bharuch district, both banks of the Narmada. Circle size is litres, colour is fat. Click a village."
          action={
            <>
              <Segmented
                size="sm"
                options={[
                  { value: "Savar", label: <span className="inline-flex items-center gap-1"><Sun className="h-3.5 w-3.5" /> Savar</span> },
                  { value: "Sanj", label: <span className="inline-flex items-center gap-1"><Moon className="h-3.5 w-3.5" /> Sanj</span> },
                ]}
                value={shift}
                onChange={(s) => {
                  setShift(s);
                  setStep(0);
                  setPaused(false);
                  desk.log(`Replaying ${s} collection`, "info");
                }}
              />
              <Btn size="sm" variant="ghost" onClick={() => setPaused((p) => !p)}>
                {paused ? "Resume" : "Pause"}
              </Btn>
            </>
          }
          bodyClassName="p-0 pt-2"
        >
          <div className="relative">
            <svg viewBox="0 0 820 500" className="block w-full" role="img" aria-label="Map of village societies around Bharuch">
              <defs>
                <linearGradient id="tdc-river" x1="0" x2="1">
                  <stop offset="0%" stopColor="#7fb5d6" />
                  <stop offset="100%" stopColor="#a9cfe4" />
                </linearGradient>
                <pattern id="tdc-field" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(28)">
                  <line x1="0" y1="0" x2="0" y2="22" stroke="var(--d-accent)" strokeOpacity="0.035" strokeWidth="7" />
                </pattern>
              </defs>
              <rect x="0" y="0" width="820" height="500" fill="url(#tdc-field)" />
              {/* gulf */}
              <path d="M0,250 C14,270 18,300 8,340 L0,360 Z" fill="#a9cfe4" opacity="0.7" />
              <text x="6" y="378" className="fill-[var(--d-info)] text-[10px] font-medium" opacity="0.8">
                Gulf of Khambhat
              </text>
              {/* Narmada */}
              <path d="M0,300 C90,292 170,326 270,304 S420,272 520,290 S690,262 820,250" fill="none" stroke="url(#tdc-river)" strokeWidth="22" strokeLinecap="round" opacity="0.85" />
              <path d="M0,300 C90,292 170,326 270,304 S420,272 520,290 S690,262 820,250" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1.2" strokeDasharray="10 14" className="desk-flow" />
              <text x="640" y="246" className="fill-[var(--d-info)] text-[11px] font-semibold italic" opacity="0.8">
                Narmada
              </text>
              {/* towns */}
              {[
                { n: "Bharuch", x: 338, y: 270 },
                { n: "Ankleshwar", x: 352, y: 334 },
              ].map((t) => (
                <g key={t.n}>
                  <rect x={t.x - 5} y={t.y - 5} width="10" height="10" rx="2" fill="var(--d-ink)" opacity="0.75" />
                  <text x={t.x + 9} y={t.y + 4} className="fill-[var(--d-ink)] text-[11.5px] font-semibold">
                    {t.n}
                  </text>
                </g>
              ))}
              {/* routes to BMC */}
              {villages.map((v) => {
                const b = bmcs[v.bmc];
                const isRecent = recent.some((r) => r.id === v.id);
                return (
                  <line
                    key={`r-${v.id}`}
                    x1={v.x}
                    y1={v.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={isRecent ? "var(--d-accent)" : "var(--d-line)"}
                    strokeWidth={isRecent ? 1.6 : 1}
                    strokeOpacity={isRecent ? 0.8 : 0.9}
                    className={isRecent ? "desk-flow" : undefined}
                    strokeDasharray={isRecent ? undefined : "2 4"}
                  />
                );
              })}
              {/* BMCs */}
              {(Object.keys(bmcs) as BmcId[]).map((k) => {
                const b = bmcs[k];
                const inTank = poured.filter((v) => v.bmc === k).reduce((a, v) => a + v.litres[shift], 0);
                return (
                  <g key={k} className="cursor-pointer" onClick={() => desk.goTab("chilling")}>
                    <rect x={b.x - 30} y={b.y - 17} width="60" height="34" rx="9" fill="var(--d-info)" />
                    <Snowflake x={b.x - 25} y={b.y - 11} width={14} height={14} color="#fff" />
                    <text x={b.x - 8} y={b.y - 2} className="fill-white text-[9.5px] font-semibold">
                      {k === "AMD" ? "AMOD" : "JHGD"}
                    </text>
                    <text x={b.x - 8} y={b.y + 10} className="fill-white font-mono text-[9px]">
                      {num(inTank)} L
                    </text>
                  </g>
                );
              })}
              {/* villages */}
              {villages.map((v) => {
                const done = pouredIds.has(v.id);
                const r = 5 + (v.litres[shift] / rMax) * 9;
                const fatT = Math.min(1, Math.max(0, (v.fat - 3.9) / 1.8));
                const isNow = current?.id === v.id;
                return (
                  <g
                    key={v.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHover(v)}
                    onMouseLeave={() => setHover((h) => (h?.id === v.id ? null : h))}
                    onClick={() => setOpen(v)}
                  >
                    {isNow && (
                      <circle key={`p-${step}`} cx={v.x} cy={v.y} r={r} fill="none" stroke="var(--d-accent)" strokeWidth="2">
                        <animate attributeName="r" from={String(r)} to={String(r + 22)} dur="1.3s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.9" to="0" dur="1.3s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle
                      cx={v.x}
                      cy={v.y}
                      r={r}
                      fill={done ? `color-mix(in oklab, var(--d-accent) ${Math.round(45 + fatT * 55)}%, #ffffff)` : "var(--d-panel)"}
                      stroke={v.snf < 8 ? "var(--d-late)" : done ? "var(--d-accent)" : "var(--d-mute)"}
                      strokeWidth={v.snf < 8 ? 2.2 : 1.2}
                      strokeDasharray={done ? undefined : "2 2"}
                      style={{ transition: "fill 500ms ease" }}
                    />
                    <text x={v.x} y={v.y - r - 4} textAnchor="middle" className="pointer-events-none text-[9.5px] font-medium" style={{ fill: done ? "var(--d-ink)" : "var(--d-mute)" }}>
                      {v.name}
                    </text>
                  </g>
                );
              })}
            </svg>
            {hover && (
              <div
                className="pointer-events-none absolute z-10 w-[210px] -translate-x-1/2 rounded-[12px] border border-d-line bg-d-panel p-3 text-[12px] shadow-xl"
                style={{ left: `${(hover.x / 820) * 100}%`, top: `calc(${(hover.y / 500) * 100}% + 18px)` }}
              >
                <p className="text-[13px] font-semibold">
                  {hover.name} <span className="font-normal text-d-mute">· {hover.taluka}</span>
                </p>
                <p className="mt-1 grid grid-cols-3 gap-1 font-mono text-[11.5px]">
                  <span>{num(hover.litres[shift])} L</span>
                  <span>F {hover.fat.toFixed(1)}</span>
                  <span style={{ color: hover.snf < 8 ? "var(--d-late)" : undefined }}>S {hover.snf.toFixed(2)}</span>
                </p>
                <p className="mt-1 text-d-mute">
                  {hover.farmers} farmers · {pouredIds.has(hover.id) ? "poured" : "awaiting can"}
                </p>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-4 border-t border-d-line px-5 py-3 text-[12px] text-d-mute">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full" style={{ background: "color-mix(in oklab, var(--d-accent) 45%, white)" }} />
                <span className="h-3 w-3 rounded-full bg-d-accent" /> fat 3.9 → 5.7%
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full border border-dashed border-d-mute" /> not yet poured
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full border-2 border-d-late" /> SNF under 8.0
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-5 rounded-[4px] bg-d-info" /> bulk milk chiller
              </span>
              {current && (
                <span className="ml-auto inline-flex items-center gap-1.5 font-medium text-d-ink">
                  <Droplets className="h-3.5 w-3.5 text-d-accent" /> {current.name} just poured {num(current.litres[shift])} L
                </span>
              )}
            </div>
          </div>
        </Panel>

        <div className="space-y-4">
          <div className="desk-rise overflow-hidden rounded-[14px] bg-d-accent p-5 text-d-accent-ink">
            <p className="flex items-center gap-2 text-[12px] font-medium opacity-85">
              {shift === "Savar" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />} {shift} litres in, live
            </p>
            <p className="desk-h tnum mt-1 text-[46px] font-semibold leading-none tracking-tight">{num(litres)}</p>
            <p className="mt-1 text-[12.5px] opacity-85">of about {num(total)} L expected</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/25">
              <div className="h-full rounded-full bg-white transition-[width] duration-700" style={{ width: `${(litres / total) * 100}%` }} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                { l: "Fat", v: fat ? `${fat.toFixed(2)}%` : "—" },
                { l: "SNF", v: snf ? `${snf.toFixed(2)}%` : "—" },
                { l: "Value", v: inr(poured.reduce((a, v) => a + v.litres[shift] * vRate(v), 0), { compact: true }) },
              ].map((x) => (
                <div key={x.l} className="rounded-[10px] bg-white/12 px-2 py-2" style={{ background: "rgba(255,255,255,0.12)" }}>
                  <p className="text-[11px] opacity-80">{x.l}</p>
                  <p className="tnum font-mono text-[14px] font-semibold">{x.v}</p>
                </div>
              ))}
            </div>
            <ul className="mt-4 space-y-1 text-[12px]">
              {[...recent].reverse().map((v, i) => (
                <li key={v.id} className="desk-rise flex items-center justify-between" style={{ opacity: 1 - i * 0.16 }}>
                  <span className="truncate">
                    <Droplets className="mr-1 inline h-3 w-3" />
                    {v.name}
                  </span>
                  <span className="tnum font-mono">+{num(v.litres[shift])} L</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Societies poured" value={`${poured.length}/38`} icon={MapPin} trend={[4, 9, 15, 21, 26, 31, poured.length]} />
            <Stat label="Farmers today" value="2,811" delta="+38" icon={Users} tone="info" trend={[2690, 2720, 2735, 2760, 2771, 2790, 2811]} />
            <Stat label="Avg rate / litre" value="₹47.6" delta="+₹0.8" icon={IndianRupee} tone="ok" trend={[45.9, 46.2, 46.4, 46.9, 47.0, 47.3, 47.6]} />
            <Stat label="Rejected cans" value="1" delta="-2" deltaGood={false} hint="sour, Haldar" icon={TriangleAlert} tone="late" trend={[4, 3, 5, 2, 3, 3, 1]} />
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel icon={FlaskConical} title="Quality watch" sub="Societies below 8.0 SNF for 3 days">
          <ul className="space-y-2.5">
            {lowQ.map((v) => (
              <li key={v.id} className="flex items-center gap-3 rounded-[12px] border border-d-line p-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--d-late)_12%,transparent)] font-mono text-[11px] font-semibold text-d-late">{v.snf.toFixed(1)}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-semibold">{v.name}</p>
                  <p className="truncate text-[11.5px] text-d-mute">
                    {v.taluka} · fat {v.fat.toFixed(1)} · {v.farmers} farmers
                  </p>
                </div>
                <Btn
                  size="sm"
                  variant="soft"
                  onClick={() => {
                    toast.success(`Gujarati voice note sent to ${v.name}`, { description: "Green fodder + mineral mixture advice" });
                    desk.log(`Quality Coach messaged ${v.name} farmers about SNF`, "info");
                  }}
                >
                  Send tip
                </Btn>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Intake by hour" sub="Litres reaching both chillers today">
          <AreaChart
            height={190}
            labels={["5a", "6a", "7a", "8a", "9a", "4p", "5p", "6p", "7p", "8p"]}
            series={[
              { name: "Today", data: [320, 2650, 3980, 1840, 270, 180, 2120, 3460, 1530, 210], tone: "accent" },
              { name: "Last Tuesday", data: [290, 2480, 3850, 1990, 310, 160, 1980, 3390, 1600, 240], tone: "info", dashed: true },
            ]}
            format={(v) => `${num(v)} L`}
          />
        </Panel>
        <Panel icon={Truck} title="Tankers today" sub="To Narmada Valley Dairy, Ankleshwar" action={<Btn size="sm" icon={ArrowRight} onClick={() => desk.goTab("chilling")}>Chillers</Btn>}>
          <ul className="space-y-2.5">
            {tankers.slice(0, 4).map((t) => (
              <li key={t.id} className="flex items-center gap-3">
                <Truck className="h-4 w-4 shrink-0 text-d-mute" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium">
                    {t.id} <span className="font-mono text-[11.5px] text-d-mute">{t.vehicle}</span>
                  </p>
                  <p className="text-[11.5px] text-d-mute">
                    {bmcs[t.from].name} · {t.litres ? `${num(t.litres)} L at ${t.temp}°C` : "empty"}
                  </p>
                </div>
                {t.status === "On road" || t.status === "Scheduled" || t.status === "Loading" ? (
                  <span className="font-mono text-[11.5px] font-semibold">
                    <Countdown compact inHours={t.eta} />
                  </span>
                ) : (
                  <Pill tone={t.status === "Accepted" ? "ok" : "info"}>{t.status}</Pill>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <VillageSheet village={open} shift={shift} onClose={() => setOpen(null)} />
    </div>
  );
}

function VillageSheet({ village, shift, onClose }: { village: Village | null; shift: Shift; onClose: () => void }) {
  const desk = useDesk();
  const v = village;
  const rate = v ? vRate(v) : 0;
  const ten = v ? (v.litres.Savar + v.litres.Sanj) * 10 : 0;
  return (
    <Sheet
      open={!!v}
      onOpenChange={(o) => !o && onClose()}
      eyebrow={v ? `${v.id} · ${v.taluka} taluka · ${bmcs[v.bmc].name}` : ""}
      title={v ? `${v.name} Dudh Utpadak Sahakari Mandali` : ""}
      sub={v ? `Secretary ${v.secretary} · ${v.farmers} pouring farmers · ${v.buffalo}% buffalo milk` : ""}
      footer={
        v && (
          <>
            <Btn
              icon={Phone}
              onClick={() => {
                toast(`Calling ${v.secretary}`, { description: `${v.name} society` });
                desk.log(`Called ${v.secretary}, ${v.name} society`);
              }}
            >
              Call secretary
            </Btn>
            <Btn
              variant="solid"
              icon={MessageCircle}
              onClick={() => {
                toast.success("Rate chart sent in Gujarati", { description: `${v.farmers} farmers in ${v.name}` });
                desk.log(`Rate chart sent to ${v.name} society on WhatsApp`, "ok");
              }}
            >
              Send rate chart
            </Btn>
          </>
        )
      }
    >
      {v && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-2">
            {[
              { l: "Savar", v: `${num(v.litres.Savar)} L` },
              { l: "Sanj", v: `${num(v.litres.Sanj)} L` },
              { l: `Rate (${shift})`, v: `₹${rate.toFixed(2)}` },
            ].map((x) => (
              <div key={x.l} className="rounded-[12px] bg-d-sunk p-3">
                <p className="text-[11.5px] text-d-mute">{x.l}</p>
                <p className="tnum font-mono text-[16px] font-semibold">{x.v}</p>
              </div>
            ))}
          </div>
          <KV
            items={[
              { k: "Average fat", v: `${v.fat.toFixed(1)}%` },
              { k: "Average SNF", v: <span style={{ color: v.snf < 8 ? "var(--d-late)" : undefined }}>{v.snf.toFixed(2)}%</span> },
              { k: "10-day litres", v: num(ten) },
              { k: "10-day payout", v: inr(ten * rate, { compact: true }) },
            ]}
          />
          <div>
            <p className="mb-1 text-[12px] font-medium text-d-mute">Last 10 days, litres per day</p>
            <Sparkline height={44} data={Array.from({ length: 10 }, (_, i) => Math.round((v.litres.Savar + v.litres.Sanj) * (0.9 + ((i * 7 + v.farmers) % 5) * 0.04)))} tone={v.snf < 8 ? "late" : "accent"} />
          </div>
          <div>
            <p className="mb-2 text-[12px] font-medium text-d-mute">Top farmers this morning</p>
            <ul className="divide-y divide-d-line rounded-[12px] border border-d-line">
              {farmersOf(v).map((f) => (
                <li key={f.code} className="flex items-center gap-3 px-3 py-2">
                  <Avatar name={f.name} size={28} tone="accent" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium">{f.name}</p>
                    <p className="font-mono text-[11px] text-d-mute">{f.code}</p>
                  </div>
                  <span className="tnum font-mono text-[12px]">{f.litres} L</span>
                  <span className="tnum w-[52px] text-right font-mono text-[12px] text-d-mute">F {f.fat.toFixed(1)}</span>
                </li>
              ))}
            </ul>
          </div>
          {v.snf < 8 && (
            <div className="rounded-[12px] bg-[color-mix(in_oklab,var(--d-late)_9%,transparent)] p-3 text-[13px] leading-snug">
              <p className="font-semibold text-d-late">SNF below 8.0 for 3 days</p>
              Lactometer re-test at the BMC was normal, so it is feed, not water. Quality Coach suggests mineral mixture on credit.
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}

/* ============================================================
   Collection
   ============================================================ */

const FATS = [3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0];
const SNFS = [8.0, 8.2, 8.4, 8.6, 8.8, 9.0];

function CollectionModule() {
  const desk = useDesk();
  const [animal, setAnimal] = React.useState<"Bhens" | "Gaay">("Bhens");
  const [calc, setCalc] = React.useState({ fat: 6.5, snf: 8.8, litres: 10 });
  const [open, setOpen] = React.useState<Pour | null>(null);
  const [retest, setRetest] = React.useState<Set<string>>(new Set());
  const cans = useDrift(2812, 3, 2600);
  const r = rateFor(calc.fat, calc.snf, animal);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Cans tested today" value={num(Math.round(cans))} delta="+1.4%" icon={Milk} trend={[2620, 2680, 2700, 2745, 2770, 2790, cans]} />
        <Stat label="Average fat" value="4.82%" delta="+0.06" icon={Droplets} tone="ok" trend={[4.71, 4.74, 4.7, 4.76, 4.79, 4.8, 4.82]} />
        <Stat label="Average SNF" value="8.38%" delta="-0.04" hint="cow villages dipping" icon={FlaskConical} tone="warn" trend={[8.45, 8.44, 8.43, 8.42, 8.41, 8.4, 8.38]} />
        <Stat label="Paid per litre" value="₹47.6" delta="+₹0.8" hint="buyer pays ₹49.1" icon={IndianRupee} tone="info" trend={[45.9, 46.2, 46.4, 46.9, 47, 47.3, 47.6]} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel title="Farmer pours" sub="From the society analysers. Click a pour for the farmer's slip.">
          <DataTable
            rows={pours}
            rowKey={(p) => `${p.code}-${p.shift}`}
            search={(p) => `${p.code} ${p.name} ${p.village}`}
            searchPlaceholder="Search farmer, code or village"
            filter={{ get: (p) => p.shift, options: ["Savar", "Sanj"] }}
            onRow={setOpen}
            pageSize={9}
            bulk={[
              {
                label: "Send slips on WhatsApp",
                run: (k) => {
                  toast.success(`${k.length} Gujarati slips sent`);
                  desk.log(`${k.length} collection slips sent to farmers`);
                },
              },
            ]}
            columns={[
              { key: "n", label: "Farmer", render: (p) => (<div><p className="font-medium">{p.name}</p><p className="font-mono text-[11px] text-d-mute">{p.code} · {p.village}</p></div>), sort: (p) => p.name },
              { key: "a", label: "Milk", render: (p) => <Pill tone={p.animal === "Bhens" ? "info" : "accent"}>{p.animal}</Pill>, wide: true },
              { key: "l", label: "Litres", align: "right", render: (p) => <span className="tnum font-mono">{p.litres.toFixed(1)}</span>, sort: (p) => p.litres },
              { key: "f", label: "Fat", align: "right", render: (p) => <span className="tnum font-mono">{p.fat.toFixed(1)}</span>, sort: (p) => p.fat },
              { key: "s", label: "SNF", align: "right", render: (p) => <span className="tnum font-mono" style={{ color: p.snf < 8 ? "var(--d-late)" : undefined }}>{p.snf.toFixed(1)}</span>, sort: (p) => p.snf },
              { key: "amt", label: "Amount", align: "right", render: (p) => <span className="tnum font-mono">{p.can === "Sour" ? "—" : inr(p.litres * rateFor(p.fat, p.snf, p.animal))}</span>, sort: (p) => p.litres * rateFor(p.fat, p.snf, p.animal) },
              { key: "c", label: "Can", render: (p) => (retest.has(`${p.code}-${p.shift}`) ? <Pill tone="info">Re-test</Pill> : <Pill tone={p.can === "OK" ? "ok" : p.can === "Sour" ? "late" : "warn"}>{p.can}</Pill>) },
            ]}
          />
        </Panel>
        <div className="space-y-5">
          <Panel title="Rate calculator" sub="What a farmer earns for one pour" action={<Segmented size="sm" options={["Bhens", "Gaay"] as const} value={animal} onChange={setAnimal} />}>
            <div className="grid grid-cols-3 gap-2">
              {(["fat", "snf", "litres"] as const).map((k) => (
                <Field key={k} label={k === "fat" ? "Fat %" : k === "snf" ? "SNF %" : "Litres"}>
                  <input
                    className={`${inputClass} font-mono`}
                    inputMode="decimal"
                    value={calc[k]}
                    onChange={(e) => {
                      const val = Number(e.target.value.replace(/[^\d.]/g, ""));
                      setCalc((c) => ({ ...c, [k]: Number.isFinite(val) ? val : 0 }));
                    }}
                  />
                </Field>
              ))}
            </div>
            <div className="mt-4 flex items-end justify-between rounded-[12px] bg-d-soft p-4">
              <div>
                <p className="text-[12px] text-d-mute">Rate per litre</p>
                <p className="tnum font-mono text-[18px] font-semibold">₹{r.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-d-mute">Farmer gets</p>
                <p className="desk-h tnum text-[30px] font-semibold leading-none text-d-accent">{inr(r * calc.litres)}</p>
              </div>
            </div>
            <p className="mt-2 text-[11.5px] text-d-mute">
              {animal === "Bhens" ? "₹7.40" : "₹6.60"} per fat point + ₹2.50 per SNF point − ₹6 handling. Board approved 1 Oct.
            </p>
          </Panel>
          <Panel title="Fat spread this morning" sub="Cans by fat %">
            <Bars height={130} data={["<4", "4–4.5", "4.5–5", "5–5.5", "5.5–6", "6–6.5", "6.5+"].map((l, i) => ({ label: l, value: [210, 640, 520, 330, 380, 470, 262][i], tone: i < 2 ? "info" : "accent" }))} />
          </Panel>
        </div>
      </div>
      <Panel title={`Rate chart · ${animal === "Bhens" ? "buffalo" : "cow"} milk, ₹ per litre`} sub="Click a cell to load it into the calculator">
        <HeatGrid
          rows={FATS.map((f) => `Fat ${f.toFixed(1)}`)}
          cols={SNFS.map((s) => `SNF ${s.toFixed(1)}`)}
          values={FATS.map((f) => SNFS.map((s) => rateFor(f, s, animal)))}
          format={(v) => v.toFixed(1)}
          onCell={(ri, ci) => {
            setCalc((c) => ({ ...c, fat: FATS[ri], snf: SNFS[ci] }));
            toast(`Fat ${FATS[ri]} · SNF ${SNFS[ci]}`, { description: `₹${rateFor(FATS[ri], SNFS[ci], animal).toFixed(2)} per litre` });
          }}
        />
      </Panel>
      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={open ? `${open.code} · ${open.shift} ${open.time}` : ""}
        title={open?.name ?? ""}
        sub={open ? `${open.village} society · ${open.animal === "Bhens" ? "buffalo" : "cow"} milk` : ""}
        footer={
          open && (
            <>
              {open.can !== "OK" && (
                <Btn
                  icon={FlaskConical}
                  onClick={() => {
                    setRetest((s) => new Set(s).add(`${open.code}-${open.shift}`));
                    toast.success("Sample sent for re-test at BMC", { description: open.name });
                    desk.log(`Re-test requested: ${open.name}, ${open.village}`, "warn");
                  }}
                >
                  Re-test sample
                </Btn>
              )}
              <Btn
                variant="solid"
                icon={MessageCircle}
                onClick={() => {
                  toast.success("Slip sent in Gujarati", { description: open.name });
                  desk.log(`Collection slip sent to ${open.name}`);
                  setOpen(null);
                }}
              >
                Send slip
              </Btn>
            </>
          )
        }
      >
        {open && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-2">
              {[
                { l: "Litres", v: open.litres.toFixed(1) },
                { l: "Fat", v: `${open.fat.toFixed(1)}%` },
                { l: "SNF", v: `${open.snf.toFixed(1)}%` },
              ].map((x) => (
                <div key={x.l} className="rounded-[12px] bg-d-sunk p-3 text-center">
                  <p className="text-[11.5px] text-d-mute">{x.l}</p>
                  <p className="tnum font-mono text-[18px] font-semibold">{x.v}</p>
                </div>
              ))}
            </div>
            <KV items={[{ k: "Rate", v: `₹${rateFor(open.fat, open.snf, open.animal).toFixed(2)} / L` }, { k: "Amount", v: open.can === "Sour" ? "Rejected" : inr(open.litres * rateFor(open.fat, open.snf, open.animal)) }, { k: "Can status", v: <Pill tone={open.can === "OK" ? "ok" : "warn"}>{open.can}</Pill> }, { k: "Society", v: open.village }]} />
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Last 10 days, litres</p>
              <Bars height={110} showValues={false} data={Array.from({ length: 10 }, (_, i) => ({ label: String(11 + i), value: Math.round((open.litres * (0.85 + ((i * 3) % 5) * 0.06)) * 10) / 10, tone: i === 9 ? "accent" : "info" }))} />
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ============================================================
   Chilling centres
   ============================================================ */

function TempDial({ temp }: { temp: number }) {
  const max = 12;
  const a = Math.PI * (1 - Math.min(max, Math.max(0, temp)) / max);
  const cx = 110;
  const cy = 110;
  const r = 86;
  const arc = (from: number, to: number) => {
    const a0 = Math.PI * (1 - from / max);
    const a1 = Math.PI * (1 - to / max);
    return `M${cx + trig.cos(a0) * r},${cy - trig.sin(a0) * r} A${r},${r} 0 0 1 ${cx + trig.cos(a1) * r},${cy - trig.sin(a1) * r}`;
  };
  const tone = temp <= 4.5 ? "var(--d-ok)" : temp <= 7 ? "var(--d-warn)" : "var(--d-late)";
  return (
    <div className="mx-auto w-full max-w-[240px]">
      <svg viewBox="0 0 220 130" className="w-full">
        <path d={arc(0, 4.5)} fill="none" stroke="var(--d-ok)" strokeWidth="14" strokeOpacity="0.85" />
        <path d={arc(4.5, 7)} fill="none" stroke="var(--d-warn)" strokeWidth="14" strokeOpacity="0.85" />
        <path d={arc(7, 12)} fill="none" stroke="var(--d-late)" strokeWidth="14" strokeOpacity="0.85" />
        {[0, 2, 4, 6, 8, 10, 12].map((t) => {
          const ta = Math.PI * (1 - t / max);
          return (
            <text key={t} x={cx + trig.cos(ta) * (r - 22)} y={cy - trig.sin(ta) * (r - 22) + 4} textAnchor="middle" className="fill-[var(--d-mute)] font-mono text-[9px]">
              {t}
            </text>
          );
        })}
        <line x1={cx} y1={cy} x2={cx + trig.cos(a) * (r - 8)} y2={cy - trig.sin(a) * (r - 8)} stroke="var(--d-ink)" strokeWidth="3" strokeLinecap="round" style={{ transition: "all 900ms cubic-bezier(.2,.7,.2,1)" }} />
        <circle cx={cx} cy={cy} r="7" fill="var(--d-ink)" />
      </svg>
      <div className="-mt-1 text-center">
        <span className="desk-h tnum text-[30px] font-semibold leading-none" style={{ color: tone }}>
          {temp.toFixed(1)}°C
        </span>
      </div>
    </div>
  );
}

function ChillingModule({ tankers, setTankers }: { tankers: Tanker[]; setTankers: React.Dispatch<React.SetStateAction<Tanker[]>> }) {
  const desk = useDesk();
  const amd = useDrift(4.1, 0.08, 2400);
  const jhg = useDrift(5.2, 0.12, 2100);
  const [service, setService] = React.useState(false);
  const [open, setOpen] = React.useState<string | null>(null);
  const t = tankers.find((x) => x.id === open) ?? null;
  const centres = [
    { id: "AMD" as BmcId, temp: amd, level: 3880, power: "Grid", chill: "2h 55m", comp: "Both running", dg: "62 L diesel" },
    { id: "JHG" as BmcId, temp: jhg, level: 4860, power: "DG since 11:20", chill: "3h 40m", comp: service ? "Service booked 9 AM" : "Comp 2 cycling", dg: "38 L diesel" },
  ];

  function dispatch(id: string) {
    const x = tankers.find((y) => y.id === id);
    if (!x) return;
    setTankers((cur) => cur.map((y) => (y.id === id ? { ...y, status: "On road", eta: 1.2, seal: y.seal === "pending" ? "S-88221" : y.seal, litres: y.litres || 4200, temp: y.temp || 4.0 } : y)));
    toast.success(`${x.id} dispatched`, { description: `${x.vehicle} · sealed · ETA 1h 12m at Narmada Valley Dairy` });
    desk.log(`${x.id} left ${bmcs[x.from].name} for Narmada Valley Dairy`, "ok");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Milk in tanks" value={`${num(8740)} L`} hint="of 11,000 L capacity" icon={Snowflake} trend={[2100, 5400, 8200, 9100, 6200, 7900, 8740]} />
        <Stat label="Time to 4°C, Jhagadia" value="3h 40m" delta="+40m" deltaGood={false} hint="target 3h" icon={Timer} tone="late" trend={[2.9, 3.0, 3.1, 3.2, 3.4, 3.5, 3.67]} />
        <Stat label="Power cuts today" value="2" hint="DG covered 41 + 18 min" icon={Power} tone="warn" />
        <Stat label="Tanker acceptance" value="100%" delta="+0" hint="30 days, no rejections" icon={CheckCheck} tone="ok" trend={[98, 99, 100, 100, 100, 100, 100]} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {centres.map((c) => {
          const b = bmcs[c.id];
          const fill = c.level / b.cap;
          return (
            <Panel key={c.id} live title={b.name} sub={`${num(b.cap)} L chiller · ${villages.filter((v) => v.bmc === c.id).length} societies`} action={<Pill tone={c.temp <= 4.5 ? "ok" : "warn"}>{c.temp <= 4.5 ? "In range" : "Above 4.5°C"}</Pill>}>
              <div className="grid items-center gap-5 sm:grid-cols-[1fr_120px]">
                <div>
                  <TempDial temp={c.temp} />
                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[12.5px]">
                    {[
                      { k: "Power", v: c.power },
                      { k: "Chill time", v: c.chill },
                      { k: "Compressors", v: c.comp },
                      { k: "DG fuel", v: c.dg },
                    ].map((x) => (
                      <div key={x.k}>
                        <p className="text-[11.5px] text-d-mute">{x.k}</p>
                        <p className="font-medium">{x.v}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="relative h-[190px] w-[96px] overflow-hidden rounded-[40px_40px_16px_16px] border-2 border-d-line bg-d-sunk">
                    <div className="absolute inset-x-0 bottom-0 transition-[height] duration-1000" style={{ height: `${fill * 100}%`, background: "linear-gradient(180deg, #ffffff 0%, #f1f4ec 60%, #e6ecdf 100%)", boxShadow: "inset 0 2px 0 var(--d-info)" }} />
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
                      <p className="tnum font-mono text-[16px] font-semibold">{Math.round(fill * 100)}%</p>
                      <p className="font-mono text-[10.5px] text-d-mute">{num(c.level)} L</p>
                    </div>
                  </div>
                  <p className="mt-1.5 text-[11px] text-d-mute">tank level</p>
                </div>
              </div>
              {c.id === "JHG" && !service && (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[12px] bg-[color-mix(in_oklab,var(--d-warn)_10%,transparent)] p-3">
                  <TriangleAlert className="h-4 w-4 text-d-warn" />
                  <p className="min-w-[200px] flex-1 text-[12.5px]">Compressor 2 is cycling. Frigo Services, Bharuch can come tomorrow 9 AM for ₹3,800.</p>
                  <Btn
                    size="sm"
                    variant="solid"
                    onClick={() => {
                      setService(true);
                      toast.success("Service visit booked", { description: "Frigo Services, tomorrow 9 AM" });
                      desk.log("Compressor service booked at Jhagadia BMC", "ok");
                    }}
                  >
                    Book service
                  </Btn>
                </div>
              )}
            </Panel>
          );
        })}
      </div>
      <Panel title="Temperature, last 24 hours" sub="Milk temperature at both chillers. Shaded spikes are the two pours.">
        <AreaChart
          height={180}
          labels={["12a", "2a", "4a", "6a", "7a", "8a", "9a", "10a", "12p", "2p", "4p", "6p", "7p", "8p", "10p"]}
          series={[
            { name: "Amod", data: [3.8, 3.7, 3.7, 9.4, 11.2, 8.1, 5.9, 4.4, 4.1, 4.0, 3.9, 9.8, 10.6, 7.4, 4.6], tone: "info" },
            { name: "Jhagadia", data: [3.9, 3.9, 3.8, 10.1, 11.8, 9.6, 7.8, 6.1, 5.4, 5.2, 4.9, 10.4, 11.5, 8.9, 5.8], tone: "warn" },
            { name: "Limit 4.5°C", data: Array.from({ length: 15 }, () => 4.5), tone: "late", dashed: true },
          ]}
          format={(v) => `${v.toFixed(1)}°C`}
        />
      </Panel>
      <Panel title="Tankers" sub="Click a tanker for seal, temperature and acceptance">
        <DataTable
          rows={tankers}
          rowKey={(x) => x.id}
          onRow={(x) => setOpen(x.id)}
          filter={{ get: (x) => x.status, options: ["Scheduled", "Loading", "On road", "At dairy", "Accepted"] }}
          columns={[
            { key: "id", label: "Tanker", render: (x) => (<div><p className="font-mono text-[12.5px] font-semibold">{x.id}</p><p className="font-mono text-[11px] text-d-mute">{x.vehicle}</p></div>), sort: (x) => x.id },
            { key: "f", label: "From", render: (x) => bmcs[x.from].name, sort: (x) => x.from },
            { key: "l", label: "Litres", align: "right", render: (x) => <span className="tnum font-mono">{x.litres ? num(x.litres) : "—"}</span>, sort: (x) => x.litres },
            { key: "t", label: "Temp", align: "right", render: (x) => <span className="tnum font-mono" style={{ color: x.temp > 4.5 ? "var(--d-warn)" : undefined }}>{x.temp ? `${x.temp}°C` : "—"}</span> },
            { key: "s", label: "Seal", render: (x) => <span className="font-mono text-[12px] text-d-mute">{x.seal}</span>, wide: true },
            { key: "d", label: "Driver", render: (x) => <span className="text-d-mute">{x.driver}</span>, wide: true },
            {
              key: "st",
              label: "Status",
              align: "right",
              render: (x) =>
                x.status === "Loading" || x.status === "Scheduled" ? (
                  <Btn
                    size="sm"
                    variant="soft"
                    icon={Truck}
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(x.id);
                    }}
                  >
                    Dispatch
                  </Btn>
                ) : x.status === "On road" ? (
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11.5px]">
                    <Truck className="h-3.5 w-3.5 text-d-accent" /> <Countdown compact inHours={x.eta} />
                  </span>
                ) : (
                  <Pill tone={x.status === "Accepted" ? "ok" : "info"}>{x.status}</Pill>
                ),
            },
          ]}
        />
      </Panel>
      <Sheet
        open={!!t}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={t ? `${t.id} · ${t.vehicle}` : ""}
        title={t ? `${bmcs[t.from].name} → Narmada Valley Dairy` : ""}
        sub={t ? `Driver ${t.driver} · seal ${t.seal}` : ""}
        footer={
          t && (
            <>
              {t.status === "At dairy" && (
                <Btn
                  variant="solid"
                  icon={CheckCheck}
                  onClick={() => {
                    setTankers((cur) => cur.map((y) => (y.id === t.id ? { ...y, status: "Accepted" } : y)));
                    toast.success(`${t.id} accepted`, { description: `${num(t.litres)} L · fat ${t.fat} · SNF ${t.snf}` });
                    desk.log(`${t.id} accepted at Narmada Valley Dairy`, "ok");
                  }}
                >
                  Log acceptance slip
                </Btn>
              )}
              {(t.status === "Loading" || t.status === "Scheduled") && (
                <Btn variant="solid" icon={Truck} onClick={() => dispatch(t.id)}>
                  Dispatch now
                </Btn>
              )}
            </>
          )
        }
      >
        {t && (
          <div className="space-y-5">
            <KV items={[{ k: "Litres", v: t.litres ? num(t.litres) : "Empty" }, { k: "Load temperature", v: t.temp ? `${t.temp}°C` : "—" }, { k: "Fat / SNF", v: t.fat ? `${t.fat} / ${t.snf}` : "—" }, { k: "Value at ₹49.1/L", v: inr(t.litres * 49.1, { compact: true }) }, { k: "Status", v: t.status }, { k: "Distance", v: t.from === "JHG" ? "24 km" : "38 km" }]} />
            {t.status === "On road" && (
              <div className="rounded-[14px] bg-d-sunk p-4">
                <p className="text-[11.5px] text-d-mute">Arrives at the dairy in</p>
                <Countdown inHours={t.eta} />
              </div>
            )}
            <p className="text-[12.5px] leading-relaxed text-d-mute">The seal number and load temperature are checked again at the dairy gate. Any rejection lands in Cold Chain Guard&apos;s inbox with the gate photo.</p>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ============================================================
   Farmer payouts
   ============================================================ */

const payTone: Record<Payout["status"], Tone> = { Ready: "info", Released: "ok", "UPI failed": "late", Cash: "neutral" };

function PayoutsModule() {
  const desk = useDesk();
  const [rows, setRows] = React.useState(payoutsSeed);
  const [open, setOpen] = React.useState<string | null>(null);
  const [confirm, setConfirm] = React.useState(false);
  const [released, setReleased] = React.useState(false);
  const p = rows.find((r) => r.code === open) ?? null;
  const ready = rows.filter((r) => r.status === "Ready");
  const sum = (k: keyof Pick<Payout, "feed" | "advance" | "mineral" | "insurance" | "share">) => rows.reduce((a, r) => a + r[k], 0);

  function release(codes: string[]) {
    setRows((cur) => cur.map((r) => (codes.includes(r.code) && r.status === "Ready" ? { ...r, status: "Released" } : r)));
    toast.success(`${codes.length} UPI payouts released`, { description: "Bank of Baroda bulk UPI · Gujarati payslips on WhatsApp" });
    desk.log(`${codes.length} farmer payouts released by UPI`, "ok");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Gross payable, 11–20 Oct" value="₹1.18 Cr" delta="+6%" hint="vs 1–10 Oct" icon={Banknote} trend={[0.98, 1.02, 1.05, 1.03, 1.11, 1.11, 1.18]} />
        <Stat label="Deductions" value="₹13.4 L" hint="feed, advances, insurance, shares" icon={HandCoins} tone="warn" />
        <Stat label="Net to farmers" value="₹1.04 Cr" hint="2,946 farmers" icon={IndianRupee} tone="ok" trend={[0.87, 0.9, 0.92, 0.91, 0.98, 0.98, 1.04]} />
        <Stat label="Paid by UPI" value="98.6%" delta="+1.2%" hint="41 cash at society" icon={CheckCheck} tone="info" trend={[93, 95, 96, 97, 97.4, 98, 98.6]} />
      </div>
      <Panel live title="Cycle 11–20 October" sub="Closes at 8 PM tonight. Release goes to Bank of Baroda bulk UPI and sends every farmer a Gujarati payslip.">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex min-w-[260px] flex-1 items-center gap-1.5">
            {["1–10 Oct", "11–20 Oct", "21–31 Oct"].map((c, i) => (
              <div key={c} className="flex-1">
                <div className="h-2.5 rounded-full" style={{ background: i === 0 ? "var(--d-accent)" : i === 1 ? (released ? "var(--d-accent)" : "repeating-linear-gradient(90deg,var(--d-accent) 0 8px, var(--d-soft) 8px 12px)") : "var(--d-sunk)" }} />
                <p className="mt-1.5 text-[12px] font-medium">{c}</p>
                <p className="text-[11px] text-d-mute">{i === 0 ? "Paid 11 Oct" : i === 1 ? (released ? "Released" : "Due tonight") : "Opens tomorrow"}</p>
              </div>
            ))}
          </div>
          <div className="text-right">
            <p className="text-[12px] text-d-mute">Release closes in</p>
            <p className="font-mono text-[18px] font-semibold">
              <Countdown compact inHours={7.3} />
            </p>
          </div>
          {released ? (
            <Pill tone="ok">Cycle released</Pill>
          ) : (
            <Btn variant="solid" icon={Banknote} onClick={() => setConfirm(true)}>
              Release cycle
            </Btn>
          )}
        </div>
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel title="Farmer payslips" sub="Sample of the 2,946 farmers. Select rows to release early or click one for the payslip.">
          <DataTable
            rows={rows}
            rowKey={(r) => r.code}
            search={(r) => `${r.code} ${r.name} ${r.village} ${r.upi}`}
            searchPlaceholder="Search farmer, village or UPI"
            filter={{ get: (r) => r.status, options: ["Ready", "Released", "UPI failed", "Cash"] }}
            onRow={(r) => setOpen(r.code)}
            pageSize={8}
            bulk={[{ label: "Release UPI payout", run: release }]}
            columns={[
              { key: "n", label: "Farmer", render: (r) => (<div><p className="font-medium">{r.name}</p><p className="font-mono text-[11px] text-d-mute">{r.code} · {r.village}</p></div>), sort: (r) => r.name },
              { key: "l", label: "Litres", align: "right", render: (r) => <span className="tnum font-mono">{r.litres}</span>, sort: (r) => r.litres },
              { key: "g", label: "Gross", align: "right", render: (r) => <span className="tnum font-mono">{inr(r.gross)}</span>, sort: (r) => r.gross, wide: true },
              { key: "d", label: "Deductions", align: "right", render: (r) => <span className="tnum font-mono text-d-late">−{inr(r.gross - net(r))}</span>, wide: true },
              { key: "net", label: "Net", align: "right", render: (r) => <span className="tnum font-mono font-semibold">{inr(net(r))}</span>, sort: (r) => net(r) },
              { key: "s", label: "Status", render: (r) => <Pill tone={payTone[r.status]}>{r.status}</Pill> },
            ]}
          />
        </Panel>
        <div className="space-y-5">
          <Panel title="Where the deductions go" sub="This sample, by head">
            <Donut
              center={inr(sum("feed") + sum("advance") + sum("mineral") + sum("insurance") + sum("share"), { compact: true })}
              sub="deducted"
              segments={[
                { label: "Cattle feed", value: sum("feed"), tone: "accent" },
                { label: "Advance recovery", value: sum("advance"), tone: "warn" },
                { label: "Share instalment", value: sum("share"), tone: "info" },
                { label: "Mineral mixture", value: sum("mineral"), tone: "ok" },
                { label: "Cattle insurance", value: sum("insurance"), tone: "neutral" },
              ]}
            />
          </Panel>
          <Panel title="Payout by society" sub="Top 6, this cycle">
            <HBars
              format={(v) => inr(v, { compact: true })}
              data={villages
                .map((v) => ({ label: v.name, value: (v.litres.Savar + v.litres.Sanj) * 10 * vRate(v) }))
                .sort((x, y) => y.value - x.value)
                .slice(0, 6)}
            />
          </Panel>
        </div>
      </div>
      <Sheet
        open={!!p}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={p ? `${p.code} · ${p.village}` : ""}
        title={p?.name ?? ""}
        sub={p ? `Payslip 11–20 Oct · UPI ${p.upi}` : ""}
        footer={
          p && (
            <>
              {p.status === "UPI failed" && (
                <Btn
                  onClick={() => {
                    setRows((cur) => cur.map((r) => (r.code === p.code ? { ...r, status: "Cash" } : r)));
                    toast("Moved to cash at society", { description: `${p.village} secretary will pay ${inr(net(p))}` });
                    desk.log(`${p.name} moved to cash payout`, "warn");
                  }}
                >
                  Pay cash at society
                </Btn>
              )}
              {p.status === "Ready" && (
                <Btn variant="solid" icon={Banknote} onClick={() => release([p.code])}>
                  Release {inr(net(p))}
                </Btn>
              )}
            </>
          )
        }
      >
        {p && (
          <div className="space-y-4">
            <div className="rounded-[14px] border border-d-line">
              {[
                { k: `Milk, ${p.litres} L`, v: p.gross, plus: true },
                { k: "Cattle feed (Tapi Pashu Aahar)", v: p.feed },
                { k: "Advance recovery", v: p.advance },
                { k: "Mineral mixture", v: p.mineral },
                { k: "Cattle insurance", v: p.insurance },
                { k: "Share capital instalment", v: p.share },
              ]
                .filter((x) => x.v > 0)
                .map((x) => (
                  <div key={x.k} className="flex items-center justify-between border-b border-d-line px-4 py-2.5 text-[13px] last:border-0">
                    <span>{x.k}</span>
                    <span className="tnum font-mono" style={{ color: x.plus ? undefined : "var(--d-late)" }}>
                      {x.plus ? "" : "−"}
                      {inr(x.v)}
                    </span>
                  </div>
                ))}
              <div className="flex items-center justify-between bg-d-soft px-4 py-3">
                <span className="font-semibold">Net payable</span>
                <span className="desk-h tnum text-[22px] font-semibold text-d-accent">{inr(net(p))}</span>
              </div>
            </div>
            <KV items={[{ k: "Average rate", v: `₹${(p.gross / p.litres).toFixed(2)} / L` }, { k: "Status", v: <Pill tone={payTone[p.status]}>{p.status}</Pill> }]} />
            {p.status === "UPI failed" && <p className="rounded-[12px] bg-[color-mix(in_oklab,var(--d-late)_9%,transparent)] p-3 text-[12.5px] text-d-late">Last cycle the bank returned this handle as invalid. Member Desk has asked for a new UPI ID on WhatsApp.</p>}
          </div>
        )}
      </Sheet>
      <Modal open={confirm} onOpenChange={setConfirm} title="Release payout 11–20 Oct?" sub="₹1.04 Cr net to 2,905 UPI handles. 41 cash payouts go to society secretaries.">
        <div className="space-y-3">
          <KV items={[{ k: "Gross", v: "₹1,18,40,600" }, { k: "Deductions", v: "₹13,42,180" }, { k: "Net by UPI", v: "₹1,02,61,900" }, { k: "Net in cash", v: "₹2,36,520" }]} />
          <p className="text-[12.5px] text-d-mute">Second signatory: Bhavnaben Patel will approve on her phone.</p>
          <div className="flex justify-end gap-2">
            <Btn onClick={() => setConfirm(false)}>Not yet</Btn>
            <Btn
              variant="solid"
              icon={Banknote}
              onClick={() => {
                setReleased(true);
                setConfirm(false);
                release(ready.map((r) => r.code));
                desk.log("Payout cycle 11–20 Oct released: ₹1.04 Cr", "ok");
              }}
            >
              Release ₹1.04 Cr
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ============================================================
   Feed & vet
   ============================================================ */

const vetTone: Record<VetCall["kind"], Tone> = { AI: "info", Mastitis: "late", "FMD vaccine": "accent", Calving: "warn", Deworming: "ok", Fever: "late" };

function FeedVetModule() {
  const desk = useDesk();
  const [orders, setOrders] = React.useState(feedOrders);
  const [vet, setVet] = React.useState(seedVet);
  const [adding, setAdding] = React.useState(false);
  const [open, setOpen] = React.useState<FeedOrder | null>(null);
  const [form, setForm] = React.useState({ society: "Avidha", product: "Tapi Pashu Aahar 20% protein, 50 kg", bags: "60" });
  const bags = orders.reduce((a, o) => a + o.bags, 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Feed bags this month" value={num(bags)} delta="+14%" hint="on credit, recovered in payout" icon={Wheat} trend={[420, 510, 560, 600, 640, 700, bags]} />
        <Stat label="AI done in October" value="186" delta="+22" icon={Syringe} tone="info" trend={[120, 134, 150, 158, 164, 172, 186]} />
        <Stat label="Conception rate" value="54%" delta="+3%" hint="pregnancy checks at 60 days" icon={Sprout} tone="ok" trend={[46, 48, 49, 51, 50, 52, 54]} />
        <Stat label="Mastitis cases" value="7" delta="+2" deltaGood={false} hint="3 in Osara" icon={Stethoscope} tone="late" trend={[3, 4, 4, 5, 5, 5, 7]} />
      </div>
      <Panel title="Vet & AI calls" sub="Drag a call as Mukesh or Dr. Kinjal pick it up and finish it">
        <Board
          columns={[
            { id: "Requested", label: "Requested", tone: "warn", hint: "From the IVR and WhatsApp" },
            { id: "Scheduled", label: "Scheduled", tone: "info" },
            { id: "Done", label: "Done today", tone: "ok" },
          ]}
          items={vet}
          itemKey={(v) => v.id}
          getColumn={(v) => v.stage}
          minColumnWidth={260}
          onMove={(k, c) => {
            const v = vet.find((x) => x.id === k);
            if (!v || v.stage === c) return;
            setVet((cur) => cur.map((x) => (x.id === k ? { ...x, stage: c as VetCall["stage"], who: x.who === "Unassigned" ? (x.kind === "AI" ? "Mukesh Vasava" : "Dr. Kinjal Desai") : x.who } : x)));
            toast.success(`${v.kind} · ${v.farmer} → ${c}`, { description: v.village });
            desk.log(`Vet call ${v.id} (${v.kind}, ${v.village}) → ${c}`, c === "Done" ? "ok" : "info");
          }}
          renderCard={(v) => (
            <div>
              <div className="flex items-center gap-2">
                <Pill tone={vetTone[v.kind]}>{v.kind}</Pill>
                <span className="font-mono text-[11px] text-d-mute">{v.id}</span>
              </div>
              <p className="mt-1.5 text-[13px] font-semibold">{v.farmer}</p>
              <p className="text-[11.5px] text-d-mute">
                {v.village} · {v.animal}
              </p>
              <div className="mt-2 flex items-center justify-between text-[11.5px]">
                <span className={v.who === "Unassigned" ? "text-d-late" : "text-d-mute"}>{v.who}</span>
                <span className="font-mono">{v.when}</span>
              </div>
            </div>
          )}
        />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Panel
          title="Cattle feed orders"
          sub="Societies order on credit; the cost comes off the farmer's next payout"
          action={
            <Btn size="sm" variant="solid" icon={Plus} onClick={() => setAdding(true)}>
              New order
            </Btn>
          }
        >
          <DataTable
            rows={orders}
            rowKey={(o) => o.id}
            search={(o) => `${o.id} ${o.society} ${o.product} ${o.supplier}`}
            searchPlaceholder="Search society or product"
            filter={{ get: (o) => o.status, options: ["Requested", "Ordered", "Dispatched", "Delivered"] }}
            onRow={setOpen}
            bulk={[
              {
                label: "Place with supplier",
                run: (k) => {
                  setOrders((cur) => cur.map((o) => (k.includes(o.id) && o.status === "Requested" ? { ...o, status: "Ordered" } : o)));
                  toast.success(`${k.length} feed orders placed`);
                  desk.log(`${k.length} feed orders placed with suppliers`, "ok");
                },
              },
            ]}
            columns={[
              { key: "id", label: "Order", render: (o) => <span className="font-mono text-[12px]">{o.id}</span> },
              { key: "s", label: "Society", render: (o) => <span className="font-medium">{o.society}</span>, sort: (o) => o.society },
              { key: "p", label: "Product", render: (o) => <span className="text-d-mute">{o.product}</span>, wide: true },
              { key: "b", label: "Bags", align: "right", render: (o) => <span className="tnum font-mono">{o.bags}</span>, sort: (o) => o.bags },
              { key: "v", label: "Value", align: "right", render: (o) => <span className="tnum font-mono">{inr(o.bags * o.rate, { compact: true })}</span>, sort: (o) => o.bags * o.rate },
              { key: "st", label: "Status", render: (o) => <Pill tone={o.status === "Delivered" ? "ok" : o.status === "Dispatched" ? "accent" : o.status === "Ordered" ? "info" : "warn"}>{o.status}</Pill> },
            ]}
          />
        </Panel>
        <div className="space-y-5">
          <Panel title="Calls by type" sub="October">
            <Donut center="248" sub="calls" segments={[{ label: "Artificial insemination", value: 186, tone: "info" }, { label: "FMD vaccination", value: 31, tone: "accent" }, { label: "Mastitis", value: 7, tone: "late" }, { label: "Calving", value: 12, tone: "warn" }, { label: "Deworming", value: 12, tone: "ok" }]} />
          </Panel>
          <Panel title="Feed stock at societies" sub="Days of cover">
            <HBars format={(v) => `${v} d`} max={20} data={[{ label: "Rajpardi", value: 2, tone: "late" }, { label: "Valia", value: 3, tone: "late" }, { label: "Umalla", value: 6, tone: "warn" }, { label: "Jhagadia", value: 11, tone: "accent" }, { label: "Amod", value: 15, tone: "ok" }]} />
          </Panel>
        </div>
      </div>
      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={open ? `${open.id} · ${open.date}` : ""}
        title={open ? `${open.society} society` : ""}
        sub={open ? `${open.bags} bags · ${open.product}` : ""}
        footer={
          open &&
          open.status !== "Delivered" && (
            <Btn
              variant="solid"
              icon={CheckCheck}
              onClick={() => {
                const nextStatus: FeedOrder["status"] = open.status === "Requested" ? "Ordered" : open.status === "Ordered" ? "Dispatched" : "Delivered";
                setOrders((cur) => cur.map((o) => (o.id === open.id ? { ...o, status: nextStatus } : o)));
                toast.success(`${open.id} → ${nextStatus}`, { description: open.society });
                desk.log(`Feed order ${open.id} for ${open.society} → ${nextStatus}`, "info");
                setOpen(null);
              }}
            >
              {open.status === "Requested" ? "Place order" : open.status === "Ordered" ? "Mark dispatched" : "Mark delivered"}
            </Btn>
          )
        }
      >
        {open && (
          <div className="space-y-4">
            <KV items={[{ k: "Supplier", v: open.supplier }, { k: "Rate per bag", v: inr(open.rate) }, { k: "Value", v: inr(open.bags * open.rate) }, { k: "Status", v: open.status }, { k: "Recovery", v: "Next payout, 21–31 Oct" }, { k: "Farmers", v: `${Math.round(open.bags / 2.4)} farmers` }]} />
            <Meter value={["Requested", "Ordered", "Dispatched", "Delivered"].indexOf(open.status) + 1} max={4} />
          </div>
        )}
      </Sheet>
      <Modal open={adding} onOpenChange={setAdding} title="New feed order" sub="Placed on credit for the society, recovered from the next payout.">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const o: FeedOrder = { id: `FO-${621 + orders.length - feedOrders.length}`, society: form.society, product: form.product, bags: Number(form.bags) || 20, rate: form.product.includes("Mineral") ? 410 : form.product.includes("Bypass") ? 1720 : 1380, status: "Requested", supplier: "Sabar Feed Plant, Himmatnagar", date: "20 Oct" };
            setOrders((cur) => [o, ...cur]);
            toast.success("Feed order added", { description: `${o.bags} bags for ${o.society}` });
            desk.log(`Feed order ${o.id}: ${o.bags} bags for ${o.society}`, "info");
            setAdding(false);
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <Field label="Society">
              <select className={inputClass} value={form.society} onChange={(e) => setForm((f) => ({ ...f, society: e.target.value }))}>
                {villages.map((v) => (
                  <option key={v.id}>{v.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Bags">
              <input className={inputClass} inputMode="numeric" value={form.bags} onChange={(e) => setForm((f) => ({ ...f, bags: e.target.value.replace(/\D/g, "") }))} />
            </Field>
          </div>
          <Field label="Product">
            <select className={inputClass} value={form.product} onChange={(e) => setForm((f) => ({ ...f, product: e.target.value }))}>
              {["Tapi Pashu Aahar 20% protein, 50 kg", "Bypass protein feed, 50 kg", "Mineral mixture, 5 kg", "Calf starter, 25 kg"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <Btn onClick={() => setAdding(false)}>Cancel</Btn>
            <Btn variant="solid" type="submit" icon={Plus}>
              Add order
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ============================================================
   Members & shares
   ============================================================ */

function MembersModule() {
  const desk = useDesk();
  const [rate, setRate] = React.useState<"8%" | "10%" | "12%">("10%");
  const [bonus, setBonus] = React.useState(0.2);
  const [pending, setPending] = React.useState(applications.length);
  const [open, setOpen] = React.useState<Member | null>(null);
  const capital = 1_86_40_000;
  const litresYear = 1_92_60_000;
  const pct = Number(rate.replace("%", "")) / 100;
  const dividend = capital * pct;
  const patronage = litresYear * bonus;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Members" value={num(2946 + (applications.length - pending))} delta="+112" hint="this year" icon={Users} trend={[2410, 2520, 2610, 2700, 2790, 2880, 2946]} />
        <Stat label="Share capital" value={inr(capital, { compact: true })} delta="+₹21 L" icon={IndianRupee} tone="ok" trend={[1.2, 1.3, 1.42, 1.55, 1.66, 1.78, 1.86]} />
        <Stat label="Women members" value="61%" delta="+4%" hint="board target 60%" icon={IdCard} tone="info" trend={[48, 51, 54, 56, 58, 59, 61]} />
        <Stat label="Dormant (no milk 90 days)" value="214" delta="-31" deltaGood={false} hint="Member Desk calling" icon={TriangleAlert} tone="warn" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel icon={IdCard} title="New member applications" sub="KYC checked by Sejalben. Approving issues share certificates and a member code." action={<Pill tone="warn" mono>{pending} pending</Pill>}>
          <ApprovalQueue
            items={applications}
            approveLabel="Admit"
            onDecide={(id, d) => {
              setPending((n) => Math.max(0, n + (d ? -1 : 1)));
              const a = applications.find((x) => x.id === id);
              if (d && a) desk.log(`${d === "approved" ? "Admitted" : "Held"}: ${a.title}`, d === "approved" ? "ok" : "warn");
            }}
          />
        </Panel>
        <Panel title="Dividend for 2025–26" sub="Proposed to the AGM on 14 Nov">
          <div className="space-y-4">
            <Field label="Dividend on share capital">
              <Segmented options={["8%", "10%", "12%"] as const} value={rate} onChange={setRate} />
            </Field>
            <Field label={`Patronage bonus · ₹${bonus.toFixed(2)} per litre poured`}>
              <input type="range" min={0} max={0.6} step={0.05} value={bonus} onChange={(e) => setBonus(Number(e.target.value))} className="w-full accent-[var(--d-accent)]" />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-[12px] bg-d-sunk p-3">
                <p className="text-[11.5px] text-d-mute">Dividend</p>
                <p className="tnum font-mono text-[16px] font-semibold">{inr(dividend, { compact: true })}</p>
              </div>
              <div className="rounded-[12px] bg-d-sunk p-3">
                <p className="text-[11.5px] text-d-mute">Patronage bonus</p>
                <p className="tnum font-mono text-[16px] font-semibold">{inr(patronage, { compact: true })}</p>
              </div>
            </div>
            <div className="flex items-end justify-between rounded-[12px] bg-d-soft p-4">
              <div>
                <p className="text-[12px] text-d-mute">Total payout</p>
                <p className="desk-h tnum text-[28px] font-semibold leading-none text-d-accent">{inr(dividend + patronage, { compact: true })}</p>
              </div>
              <p className="text-right text-[12px]" style={{ color: dividend + patronage > 6500000 ? "var(--d-late)" : "var(--d-ok)" }}>
                {dividend + patronage > 6500000 ? "Above the ₹65 L surplus" : `${inr(6500000 - dividend - patronage, { compact: true })} left in reserve`}
              </p>
            </div>
            <Btn
              variant="solid"
              className="w-full"
              onClick={() => {
                toast.success("Proposal added to the AGM papers", { description: `${rate} dividend + ₹${bonus.toFixed(2)}/L bonus` });
                desk.log(`Dividend proposal: ${rate} + ₹${bonus.toFixed(2)}/L patronage`, "info");
              }}
            >
              Add to AGM papers
            </Btn>
          </div>
        </Panel>
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Panel title="Member register" sub="Shares at ₹1,000 each. Click a member for their share ledger.">
          <DataTable
            rows={members}
            rowKey={(m) => m.no}
            search={(m) => `${m.no} ${m.name} ${m.village}`}
            searchPlaceholder="Search member or village"
            filter={{ get: (m) => m.status, options: ["Active", "Dormant"] }}
            onRow={setOpen}
            pageSize={8}
            bulk={[
              {
                label: "Send share statements",
                run: (k) => {
                  toast.success(`${k.length} share statements sent in Gujarati`);
                  desk.log(`${k.length} share statements sent`);
                },
              },
            ]}
            columns={[
              { key: "n", label: "Member", render: (m) => (<div className="flex items-center gap-2.5"><Avatar name={m.name} size={28} tone={m.woman ? "info" : "accent"} /><div><p className="font-medium">{m.name}</p><p className="font-mono text-[11px] text-d-mute">{m.no} · since {m.since}</p></div></div>), sort: (m) => m.name },
              { key: "v", label: "Village", render: (m) => m.village, sort: (m) => m.village, wide: true },
              { key: "s", label: "Shares", align: "right", render: (m) => <span className="tnum font-mono">{m.shares}</span>, sort: (m) => m.shares },
              { key: "l", label: "Litres this year", align: "right", render: (m) => <span className="tnum font-mono">{num(m.litresYear)}</span>, sort: (m) => m.litresYear },
              { key: "d", label: "Est. dividend", align: "right", render: (m) => <span className="tnum font-mono">{inr(m.shares * SHARE * pct + m.litresYear * bonus)}</span>, sort: (m) => m.shares * SHARE * pct + m.litresYear * bonus },
              { key: "st", label: "", render: (m) => <Pill tone={m.status === "Active" ? "ok" : "warn"}>{m.status}</Pill> },
            ]}
          />
        </Panel>
        <Panel title="Share capital by year" sub="₹ lakh, end of March">
          <Bars height={210} format={(v) => `${v}`} data={["FY21", "FY22", "FY23", "FY24", "FY25", "FY26"].map((y, i) => ({ label: y, value: [38, 64, 92, 121, 154, 186][i], tone: i === 5 ? "accent" : "info" }))} />
        </Panel>
      </div>
      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={open ? `${open.no} · member since ${open.since}` : ""}
        title={open?.name ?? ""}
        sub={open ? `${open.village} society · ${open.status}` : ""}
        footer={
          open && (
            <Btn
              variant="solid"
              icon={Plus}
              onClick={() => {
                toast.success("5 more shares allotted", { description: `${open.name} · ₹5,000 in 5 payout instalments` });
                desk.log(`5 shares allotted to ${open.name}`, "ok");
              }}
            >
              Allot 5 shares
            </Btn>
          )
        }
      >
        {open && (
          <div className="space-y-4">
            <KV items={[{ k: "Shares", v: `${open.shares} · ${inr(open.shares * SHARE)}` }, { k: "Litres this year", v: num(open.litresYear) }, { k: `Dividend at ${rate}`, v: inr(open.shares * SHARE * pct) }, { k: "Patronage bonus", v: inr(open.litresYear * bonus) }]} />
            <div>
              <p className="mb-1 text-[12px] font-medium text-d-mute">Monthly litres</p>
              <Sparkline height={48} data={Array.from({ length: 12 }, (_, i) => Math.round((open.litresYear / 12) * (0.8 + ((i * 5) % 7) * 0.06)))} tone={open.status === "Active" ? "accent" : "warn"} />
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
