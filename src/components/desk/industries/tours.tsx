"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Armchair,
  BedDouble,
  BusFront,
  Compass,
  Gauge as GaugeIcon,
  Hotel,
  Hourglass,
  IdCard,
  IndianRupee,
  ListChecks,
  Luggage,
  MessageCircle,
  Mountain,
  Plane,
  Plug,
  Plus,
  Send,
  Stamp,
  Ticket,
  TrainFront,
  Undo2,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { DeskShell, useDesk } from "../shell";
import { AreaChart, Bars, Donut, HBars } from "../charts";
import { AgingBar, ApprovalQueue, Board, Checklist, Countdown, DataTable } from "../data";
import { AgentsModule, ConnectionsModule, IndependenceModule, PeopleModule } from "../common";
import { Avatar, Btn, Field, inputClass, inr, KV, Meter, Modal, Panel, Pill, Segmented, Sheet, Stat } from "../ui";
import { useDrift, useNow, useTicker } from "../hooks";
import type { DeskConfig, DeskModule, IndependenceData, Integration, TeamMember, Tone, WorkforceAgent } from "../types";

/* ============================================================
   Data — Hooghly Holidays, Kolkata. Fictional group-tour operator,
   Lake Market office. Today = 20 Oct. "day" = days from today.
   ============================================================ */

type Region = "Hills" | "India" | "Abroad";
type DepStatus = "BOARDING" | "ON TIME" | "FILLING" | "FEW LEFT" | "WAITLIST" | "DOCS DUE" | "CLOSED";

type Departure = {
  id: string;
  code: string;
  board: string;
  title: string;
  region: Region;
  day: number;
  date: string;
  mode: "train" | "flight" | "road";
  via: string;
  leader: string;
  seats: number;
  sold: number;
  held: number;
  waitlist: number;
  price: number;
  nights: number;
  status: DepStatus;
  closed?: boolean;
};

const seedDeps: Departure[] = [
  { id: "DJ24", code: "DJ1024", board: "DARJEELING", title: "Darjeeling & Kalimpong · 6N", region: "Hills", day: 4, date: "24 OCT", mode: "train", via: "SDAH 22:05", leader: "SOUMEN", seats: 40, sold: 38, held: 1, waitlist: 3, price: 21900, nights: 6, status: "ON TIME" },
  { id: "SK26", code: "SK1026", board: "GANGTOK LACHUNG", title: "Gangtok · Lachung · Pelling · 8N", region: "Hills", day: 6, date: "26 OCT", mode: "train", via: "HWH 20:15", leader: "SOUMEN", seats: 36, sold: 30, held: 2, waitlist: 0, price: 32500, nights: 8, status: "FEW LEFT" },
  { id: "KS01", code: "KS1101", board: "KASHMIR", title: "Srinagar · Gulmarg · Pahalgam · 7N", region: "India", day: 12, date: "01 NOV", mode: "flight", via: "CCU 06:40", leader: "IMTIAZ", seats: 30, sold: 22, held: 3, waitlist: 0, price: 46800, nights: 7, status: "FILLING" },
  { id: "KL04", code: "KL1104", board: "KERALA", title: "Munnar · Thekkady · Alleppey · 7N", region: "India", day: 15, date: "04 NOV", mode: "flight", via: "CCU 09:10", leader: "RITA", seats: 32, sold: 28, held: 0, waitlist: 0, price: 39400, nights: 7, status: "ON TIME" },
  { id: "BT08", code: "BT1108", board: "BHUTAN", title: "Phuentsholing · Thimphu · Paro · 7N", region: "Abroad", day: 19, date: "08 NOV", mode: "road", via: "NJP 07:00", leader: "SOUMEN", seats: 24, sold: 18, held: 2, waitlist: 0, price: 52900, nights: 7, status: "DOCS DUE" },
  { id: "DX12", code: "DX1112", board: "DUBAI", title: "Dubai · Abu Dhabi · 5N", region: "Abroad", day: 23, date: "12 NOV", mode: "flight", via: "CCU 19:55", leader: "RITA", seats: 30, sold: 26, held: 1, waitlist: 0, price: 78500, nights: 5, status: "DOCS DUE" },
  { id: "BL18", code: "BL1118", board: "BALI", title: "Ubud · Kintamani · Nusa Penida · 6N", region: "Abroad", day: 29, date: "18 NOV", mode: "flight", via: "CCU 23:40", leader: "IMTIAZ", seats: 24, sold: 14, held: 2, waitlist: 0, price: 84900, nights: 6, status: "FILLING" },
  { id: "AN22", code: "AN1122", board: "ANDAMAN", title: "Port Blair · Havelock · Neil · 6N", region: "India", day: 33, date: "22 NOV", mode: "flight", via: "CCU 05:30", leader: "RITA", seats: 28, sold: 20, held: 1, waitlist: 0, price: 44200, nights: 6, status: "FILLING" },
  { id: "RJ27", code: "RJ1127", board: "RAJASTHAN", title: "Jaipur · Jodhpur · Jaisalmer · 9N", region: "India", day: 38, date: "27 NOV", mode: "train", via: "HWH 13:50", leader: "BAPI", seats: 30, sold: 9, held: 0, waitlist: 0, price: 36700, nights: 9, status: "FILLING" },
  { id: "DJ23", code: "DJ1223", board: "DARJEELING XMAS", title: "Darjeeling Christmas & toy train · 5N", region: "Hills", day: 64, date: "23 DEC", mode: "train", via: "SDAH 22:05", leader: "BAPI", seats: 40, sold: 40, held: 0, waitlist: 11, price: 24900, nights: 5, status: "WAITLIST" },
];

const statusTone: Record<DepStatus, Tone> = { BOARDING: "ok", "ON TIME": "ok", FILLING: "info", "FEW LEFT": "warn", WAITLIST: "late", "DOCS DUE": "warn", CLOSED: "neutral" };

const firstNames = ["Sourav", "Rina", "Partha", "Moumita", "Arindam", "Tanushree", "Debjani", "Sudip", "Kaushik", "Sharmila", "Ananya", "Ritwik", "Prosenjit", "Mitali", "Abhijit", "Sanchita", "Indranil", "Piyali", "Supriyo", "Rumki", "Animesh", "Swati", "Tapas", "Jhuma", "Biswajit", "Shreya", "Amitava", "Nandini", "Rajat", "Payel"];
const surnames = ["Mukherjee", "Sarkar", "Bose", "Roy", "Dutta", "Chatterjee", "Paul", "Saha", "Ghosh", "Das", "Banerjee", "Mondal", "Halder", "Sen", "Kundu", "Bhattacharya"];
const towns = ["Behala", "Salt Lake", "Howrah", "Dum Dum", "Barasat", "Garia", "Serampore", "Chandannagar", "Baguiati", "Jadavpur", "Barrackpore", "Kalyani"];

type Pax = { name: string; age: number; from: string; room: string; paid: "Paid in full" | "Advance only" | "50% paid"; docs: "Ready" | "Pending" | "Not needed"; diet: string };
function paxFor(dep: Departure): Pax[] {
  const seed = dep.code.charCodeAt(0) + dep.code.charCodeAt(1) * 3 + dep.day;
  return Array.from({ length: dep.sold }, (_, k) => {
    const fam = Math.floor(k / 2);
    const surname = surnames[(seed + fam * 5) % surnames.length];
    const first = firstNames[(seed * 7 + k * 11) % firstNames.length];
    return {
      name: `${first} ${surname}`,
      age: 24 + ((k * 13 + seed) % 46),
      from: towns[(seed + fam) % towns.length],
      room: `${k % 2 === 0 ? "Twin" : "Twin"} · R${101 + fam}`,
      paid: k % 7 === 3 ? "Advance only" : k % 5 === 1 ? "50% paid" : "Paid in full",
      docs: dep.region === "Abroad" ? (k % 4 === 2 ? "Pending" : "Ready") : "Not needed",
      diet: k % 6 === 0 ? "Veg, no onion-garlic" : k % 9 === 4 ? "Jain" : "Bengali non-veg",
    };
  });
}

type Stage = "enquiry" | "quote" | "advance" | "confirmed";
type Lead = { id: string; name: string; party: string; dest: string; pax: number; value: number; stage: Stage; source: "WhatsApp" | "Walk-in" | "Facebook ad" | "Referral" | "Website" | "Phone"; age: string; owner: string; note: string; dep?: string };
const seedLeads: Lead[] = [
  { id: "EQ-3381", name: "Sanjoy Kar", party: "Family of 4, Behala", dest: "Sikkim", pax: 4, value: 130000, stage: "enquiry", source: "WhatsApp", age: "2 h", owner: "Mou", note: "Wants Lachung snow, 2 kids under 10", dep: "SK26" },
  { id: "EQ-3384", name: "Ruma Dasgupta", party: "Couple, Salt Lake", dest: "Bali", pax: 2, value: 169800, stage: "enquiry", source: "Facebook ad", age: "40 min", owner: "Mou", note: "25th anniversary, asks for pool villa upgrade", dep: "BL18" },
  { id: "EQ-3386", name: "Prabir Sen", party: "Retired friends, 6 pax", dest: "Kerala", pax: 6, value: 236400, stage: "enquiry", source: "Referral", age: "5 h", owner: "Bablu", note: "Two need ground-floor rooms, knee issues" },
  { id: "EQ-3387", name: "Joydeep Nag", party: "Office group, 14 pax", dest: "Darjeeling", pax: 14, value: 306600, stage: "enquiry", source: "Phone", age: "1 h", owner: "Mou", note: "Custom package, Puja bonus trip, wants own coach" },
  { id: "EQ-3375", name: "Swagata Pal", party: "Family of 3, Howrah", dest: "Kashmir", pax: 3, value: 140400, stage: "quote", source: "Walk-in", age: "1 d", owner: "Mou", note: "Quote sent with houseboat night; comparing with Thomas Cook", dep: "KS01" },
  { id: "EQ-3372", name: "Anirban Mitra", party: "Couple, Dum Dum", dest: "Dubai", pax: 2, value: 157000, stage: "quote", source: "Website", age: "2 d", owner: "Mou", note: "Asked for desert safari + Miracle Garden", dep: "DX12" },
  { id: "EQ-3369", name: "Kakali Biswas", party: "Ladies group, 8 pax", dest: "Rajasthan", pax: 8, value: 293600, stage: "quote", source: "Referral", age: "3 d", owner: "Bablu", note: "Women-only group, wants a lady tour manager", dep: "RJ27" },
  { id: "EQ-3366", name: "Tapan Goswami", party: "Family of 5, Barasat", dest: "Andaman", pax: 5, value: 221000, stage: "quote", source: "WhatsApp", age: "4 d", owner: "Mou", note: "Needs Havelock ferry in Makruzz premium", dep: "AN22" },
  { id: "EQ-3361", name: "Sudeshna Ghosh", party: "Couple, Garia", dest: "Bhutan", pax: 2, value: 105800, stage: "advance", source: "Facebook ad", age: "5 d", owner: "Mou", note: "Advance ₹26,450 by UPI. Voter IDs pending", dep: "BT08" },
  { id: "EQ-3358", name: "Rakesh Agarwal", party: "Family of 4, Burrabazar", dest: "Dubai", pax: 4, value: 314000, stage: "advance", source: "Referral", age: "6 d", owner: "Mou", note: "Advance ₹78,500. Jain food at every meal", dep: "DX12" },
  { id: "EQ-3355", name: "Mithu Chakraborty", party: "Family of 3, Jadavpur", dest: "Kashmir", pax: 3, value: 140400, stage: "advance", source: "Walk-in", age: "8 d", owner: "Bablu", note: "Advance by cash at office, receipt 2241", dep: "KS01" },
  { id: "EQ-3349", name: "Sayantan Dey", party: "Couple, Kalyani", dest: "Bali", pax: 2, value: 169800, stage: "advance", source: "Website", age: "9 d", owner: "Mou", note: "Passport renewal in progress, PSK slot 28 Oct", dep: "BL18" },
  { id: "EQ-3340", name: "Debasree Kundu", party: "Family of 4, Serampore", dest: "Kerala", pax: 4, value: 157600, stage: "confirmed", source: "Referral", age: "12 d", owner: "Mou", note: "Fully paid. Houseboat AC upgrade added", dep: "KL04" },
  { id: "EQ-3336", name: "Shubham Jalan", party: "Couple, Ballygunge", dest: "Sikkim", pax: 2, value: 65000, stage: "confirmed", source: "Phone", age: "14 d", owner: "Bablu", note: "Honeymoon kit at Pelling", dep: "SK26" },
  { id: "EQ-3331", name: "Arpita Majumdar", party: "Family of 6, Chandannagar", dest: "Darjeeling", pax: 6, value: 131400, stage: "confirmed", source: "WhatsApp", age: "18 d", owner: "Mou", note: "Toy train joyride added for kids", dep: "DJ24" },
  { id: "EQ-3327", name: "Nilanjan Basu", party: "Couple, Baguiati", dest: "Andaman", pax: 2, value: 88400, stage: "confirmed", source: "Facebook ad", age: "20 d", owner: "Mou", note: "Scuba at Havelock pre-booked", dep: "AN22" },
];

type Waiter = { id: string; dep: string; name: string; pax: number; since: string; phone: string; note: string };
const seedWait: Waiter[] = [
  { id: "W1", dep: "DJ23", name: "Sutapa Bhowmik", pax: 2, since: "2 Oct", phone: "98300 41187", note: "Will take any room type" },
  { id: "W2", dep: "DJ23", name: "Avik Lahiri", pax: 4, since: "4 Oct", phone: "90073 22816", note: "Kids, needs a quad" },
  { id: "W3", dep: "DJ23", name: "Moloy Ghoshal", pax: 2, since: "6 Oct", phone: "98741 08532", note: "Senior citizens" },
  { id: "W4", dep: "DJ24", name: "Rajib Pramanik", pax: 2, since: "11 Oct", phone: "97480 66314", note: "Paid ₹5,000 hold" },
  { id: "W5", dep: "DJ24", name: "Sreyashi Nandi", pax: 1, since: "14 Oct", phone: "62907 18820", note: "Single, OK to share" },
  { id: "W6", dep: "DJ23", name: "Kingshuk Aich", pax: 3, since: "9 Oct", phone: "83350 47109", note: "Flexible on dates" },
  { id: "W7", dep: "SK26", name: "Barnali Sur", pax: 2, since: "17 Oct", phone: "99033 51726", note: "Asked for Lachung only" },
  { id: "W8", dep: "DJ23", name: "Pritam Adhikari", pax: 2, since: "12 Oct", phone: "70031 95544", note: "Would move to 30 Dec batch" },
];

type Block = { id: string; hotel: string; city: string; dep: string; nights: number; rooms: number; used: number; rate: number; releaseH: number; state: "Holding" | "Confirmed" | "Released" | "Extended"; contact: string };
const seedBlocks: Block[] = [
  { id: "RB-01", hotel: "Rhododendron Heights", city: "Darjeeling", dep: "DJ24", nights: 4, rooms: 20, used: 19, rate: 3400, releaseH: -24, state: "Confirmed", contact: "Mr Tamang" },
  { id: "RB-02", hotel: "Teesta Bend Resort", city: "Kalimpong", dep: "DJ24", nights: 2, rooms: 20, used: 19, rate: 2900, releaseH: -12, state: "Confirmed", contact: "Ms Pradhan" },
  { id: "RB-03", hotel: "Kanchenjunga Crest", city: "Gangtok", dep: "SK26", nights: 3, rooms: 18, used: 15, rate: 3800, releaseH: 28, state: "Holding", contact: "Mr Lepcha" },
  { id: "RB-04", hotel: "Yumthang Valley Lodge", city: "Lachung", dep: "SK26", nights: 2, rooms: 18, used: 15, rate: 3100, releaseH: 30, state: "Holding", contact: "Pemba ji" },
  { id: "RB-05", hotel: "Chinar Bagh Houseboats", city: "Srinagar", dep: "KS01", nights: 1, rooms: 15, used: 11, rate: 5200, releaseH: 6 * 24 + 4, state: "Holding", contact: "Bashir Bhai" },
  { id: "RB-06", hotel: "Gulmarg Pine Retreat", city: "Gulmarg", dep: "KS01", nights: 2, rooms: 15, used: 11, rate: 6400, releaseH: 5 * 24 + 10, state: "Holding", contact: "Mr Mir" },
  { id: "RB-07", hotel: "Tea Valley Inn", city: "Munnar", dep: "KL04", nights: 2, rooms: 16, used: 14, rate: 4300, releaseH: 3 * 24 + 6, state: "Holding", contact: "Mr Thomas" },
  { id: "RB-08", hotel: "Vembanad Kettuvallam", city: "Alleppey", dep: "KL04", nights: 1, rooms: 8, used: 7, rate: 9800, releaseH: 4 * 24, state: "Confirmed", contact: "Biju" },
  { id: "RB-09", hotel: "Norzin Residency", city: "Thimphu", dep: "BT08", nights: 3, rooms: 12, used: 9, rate: 5600, releaseH: 9 * 24, state: "Holding", contact: "Karma" },
  { id: "RB-10", hotel: "Al Barsha Sands", city: "Dubai", dep: "DX12", nights: 5, rooms: 15, used: 13, rate: 7900, releaseH: 8 * 24 + 12, state: "Extended", contact: "Creekline DMC" },
  { id: "RB-11", hotel: "Ubud Rice Terrace Villas", city: "Bali", dep: "BL18", nights: 3, rooms: 12, used: 7, rate: 8800, releaseH: 11 * 24, state: "Holding", contact: "Nusa Journeys DMC" },
  { id: "RB-12", hotel: "Havelock Coral Cove", city: "Havelock", dep: "AN22", nights: 2, rooms: 14, used: 10, rate: 6100, releaseH: 14 * 24, state: "Holding", contact: "Mr Rao" },
];

type Traveller = { id: string; name: string; dep: string; passport: string; expiry: string; expiryRisk?: boolean };
const docSets: Record<string, string[]> = {
  DX12: ["Passport scan, both pages", "Photo, white background", "PAN card", "Return air ticket", "Hotel voucher", "UAE visa applied", "UAE visa issued", "Travel insurance"],
  BL18: ["Passport scan, both pages", "Photo, white background", "Return air ticket", "e-VoA fee paid", "Travel insurance", "Hotel voucher"],
  BT08: ["Passport or Voter ID", "Photo, white background", "SDF paid (₹1,200/night)", "Entry permit applied", "Entry permit issued"],
};
const travellers: Traveller[] = [
  { id: "T01", name: "Rakesh Agarwal", dep: "DX12", passport: "Z41•••82", expiry: "Mar 2031" },
  { id: "T02", name: "Sunita Agarwal", dep: "DX12", passport: "Z41•••83", expiry: "Mar 2031" },
  { id: "T03", name: "Anirban Mitra", dep: "DX12", passport: "V77•••10", expiry: "Feb 2027", expiryRisk: true },
  { id: "T04", name: "Sreemoyee Mitra", dep: "DX12", passport: "V77•••11", expiry: "Aug 2029" },
  { id: "T05", name: "Partha Sarkar", dep: "DX12", passport: "T20•••45", expiry: "Nov 2028" },
  { id: "T06", name: "Moumita Sarkar", dep: "DX12", passport: "T20•••46", expiry: "Nov 2028" },
  { id: "T07", name: "Kaushik Dutta", dep: "DX12", passport: "W12•••09", expiry: "Jan 2030" },
  { id: "T08", name: "Sayantan Dey", dep: "BL18", passport: "renewal", expiry: "PSK 28 Oct", expiryRisk: true },
  { id: "T09", name: "Ruma Dasgupta", dep: "BL18", passport: "U38•••71", expiry: "Jun 2032" },
  { id: "T10", name: "Indranil Ghosh", dep: "BL18", passport: "S55•••28", expiry: "Apr 2027", expiryRisk: true },
  { id: "T11", name: "Piyali Ghosh", dep: "BL18", passport: "S55•••29", expiry: "Sep 2030" },
  { id: "T12", name: "Sudeshna Ghosh", dep: "BT08", passport: "Voter ID", expiry: "—" },
  { id: "T13", name: "Amitava Sen", dep: "BT08", passport: "R09•••64", expiry: "Dec 2029" },
  { id: "T14", name: "Nandini Sen", dep: "BT08", passport: "R09•••65", expiry: "Dec 2029" },
  { id: "T15", name: "Tapas Mondal", dep: "BT08", passport: "Voter ID", expiry: "—" },
];
function seedDocs(): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  travellers.forEach((t, i) => {
    const set = docSets[t.dep];
    const done = t.expiryRisk ? 2 : Math.max(2, set.length - ((i * 3) % 4));
    out[t.id] = set.slice(0, Math.min(set.length, done));
  });
  return out;
}

type Instalment = { id: string; lead: string; dep: string; total: number; paid: number; nextDue: string; dueIn: number; mode: "UPI" | "NEFT" | "Cash" | "Card EMI"; tcs?: number };
const seedInst: Instalment[] = [
  { id: "HH/25-26/0712", lead: "Arpita Majumdar", dep: "DJ24", total: 131400, paid: 131400, nextDue: "—", dueIn: 99, mode: "UPI" },
  { id: "HH/25-26/0718", lead: "Shubham Jalan", dep: "SK26", total: 65000, paid: 48750, nextDue: "21 Oct", dueIn: 1, mode: "UPI" },
  { id: "HH/25-26/0721", lead: "Mithu Chakraborty", dep: "KS01", total: 140400, paid: 35100, nextDue: "17 Oct", dueIn: -3, mode: "Cash" },
  { id: "HH/25-26/0724", lead: "Swagata Pal", dep: "KS01", total: 140400, paid: 70200, nextDue: "22 Oct", dueIn: 2, mode: "NEFT" },
  { id: "HH/25-26/0727", lead: "Debasree Kundu", dep: "KL04", total: 157600, paid: 157600, nextDue: "—", dueIn: 99, mode: "Card EMI" },
  { id: "HH/25-26/0730", lead: "Sudeshna Ghosh", dep: "BT08", total: 105800, paid: 26450, nextDue: "24 Oct", dueIn: 4, mode: "UPI", tcs: 5290 },
  { id: "HH/25-26/0733", lead: "Rakesh Agarwal", dep: "DX12", total: 314000, paid: 78500, nextDue: "18 Oct", dueIn: -2, mode: "NEFT", tcs: 15700 },
  { id: "HH/25-26/0736", lead: "Anirban Mitra", dep: "DX12", total: 157000, paid: 78500, nextDue: "28 Oct", dueIn: 8, mode: "UPI", tcs: 7850 },
  { id: "HH/25-26/0739", lead: "Sayantan Dey", dep: "BL18", total: 169800, paid: 42450, nextDue: "3 Nov", dueIn: 14, mode: "UPI", tcs: 8490 },
  { id: "HH/25-26/0741", lead: "Ruma Dasgupta", dep: "BL18", total: 169800, paid: 42450, nextDue: "3 Nov", dueIn: 14, mode: "Card EMI", tcs: 8490 },
  { id: "HH/25-26/0744", lead: "Tapan Goswami", dep: "AN22", total: 221000, paid: 55250, nextDue: "7 Nov", dueIn: 18, mode: "UPI" },
  { id: "HH/25-26/0746", lead: "Nilanjan Basu", dep: "AN22", total: 88400, paid: 44200, nextDue: "15 Oct", dueIn: -5, mode: "UPI" },
  { id: "HH/25-26/0749", lead: "Kakali Biswas", dep: "RJ27", total: 293600, paid: 73400, nextDue: "12 Nov", dueIn: 23, mode: "NEFT" },
  { id: "HH/25-26/0752", lead: "Partha Sarkar", dep: "DX12", total: 157000, paid: 117750, nextDue: "26 Oct", dueIn: 6, mode: "UPI", tcs: 7850 },
];

const payables = [
  { id: "VP-221", title: "IndiGo group desk · KS1101 balance", sub: "30 seats CCU–SXR, fare lock ends Thursday", amount: 412500, meta: "Airline" },
  { id: "VP-224", title: "Creekline DMC · Dubai land 2nd instalment", sub: "Hotel, transfers, desert safari for 30 pax · USD 6,840", amount: 571000, meta: "DMC" },
  { id: "VP-226", title: "Kanchenjunga Crest · Gangtok balance", sub: "15 rooms × 3 nights, release Wednesday", amount: 136800, meta: "Hotel" },
  { id: "VP-229", title: "Teesta Travels, Siliguri · 4 Innovas + 1 Tempo", sub: "SK1026 full 8 days, permit fees included", amount: 118000, meta: "Transport" },
  { id: "VP-231", title: "Druk Path Agents · Bhutan SDF + permits", sub: "18 pax × 7 nights × ₹1,200 SDF", amount: 151200, meta: "Permits" },
];

const team: TeamMember[] = [
  { name: "Debashis Ghosh", role: "Owner", status: "Busy", load: 92, focus: "Signing vendor payments and the Dubai visa batch", tasks: [{ title: "Approve 5 vendor payments", due: "11:00" }, { title: "Call IndiGo group desk on fare lock", due: "12:30" }, { title: "Corporate group pitch, Sector V", due: "4:00" }], week: [1, 1, 1, 1, 1, 1], since: "2004" },
  { name: "Moumita Sen", role: "Sales lead, group tours", status: "Busy", load: 88, focus: "7 quotes to chase, Bali needs 8 more seats", tasks: [{ title: "Follow up Swagata Pal on Kashmir quote", due: "10:30", done: true }, { title: "Send Joydeep Nag custom Darjeeling quote", due: "1:00" }, { title: "Facebook leads call-back list", due: "5:00" }], week: [1, 1, 1, 1, 1, 1], since: "2014" },
  { name: "Arnab Pal", role: "Operations, hotels & transport", status: "On floor", load: 81, focus: "Gangtok and Lachung blocks release in 28 h", tasks: [{ title: "Release 3 rooms at Kanchenjunga Crest", due: "today" }, { title: "Confirm Teesta Travels vehicle numbers", due: "3:00" }], week: [1, 1, 1, 1, 0, 1], since: "2016" },
  { name: "Rupa Saha", role: "Visas & documents", status: "On floor", load: 77, focus: "Dubai visa batch of 26 goes in at 2 PM", tasks: [{ title: "Chase 3 missing PAN copies", due: "12:00" }, { title: "Bhutan permit list to Druk Path", due: "5:00" }, { title: "Sayantan Dey PSK slot follow-up", due: "28 Oct" }], week: [1, 1, 1, 1, 1, 1], since: "2019" },
  { name: "Soumen Das", role: "Tour manager, Himalaya", status: "In field", load: 70, focus: "Back from Lachung recce, leads DJ1024 on Friday", tasks: [{ title: "Group briefing call DJ1024", due: "9:30", done: true }, { title: "Collect first-aid kit and flags", due: "Thu" }], week: [0, 1, 1, 1, 1, 1], since: "2012" },
  { name: "Rita Mallick", role: "Tour manager, Kerala & abroad", status: "Busy", load: 64, focus: "Dubai rooming list and Jain meal plan", tasks: [{ title: "Rooming list to Al Barsha Sands", due: "4:00" }, { title: "Kerala houseboat menu", due: "Wed" }], week: [1, 1, 1, 1, 1, 0], since: "2018" },
  { name: "Priyanka Roy", role: "Accounts", status: "On floor", load: 72, focus: "₹6.1 L instalments due this week, TCS on 4 bookings", tasks: [{ title: "Reconcile UPI collections with Tally", due: "11:30" }, { title: "TCS certificates for Q2", due: "Fri" }], week: [1, 1, 1, 1, 1, 1], since: "2020" },
  { name: "Bablu Mondal", role: "Front office & ticketing", status: "On floor", load: 58, focus: "Walk-ins at Lake Market and IRCTC group quota", tasks: [{ title: "Tatkal backup for 2 DJ1024 waitlisters", due: "10:00" }, { title: "Print 38 tour kits for DJ1024", due: "Wed" }], week: [1, 1, 1, 1, 1, 1], since: "2010" },
];

const agents: WorkforceAgent[] = [
  { name: "Seat Watcher", role: "Tracks fill, holds and waitlists on every departure", icon: Armchair, status: "Needs you", runsToday: 18, hoursSaved: 5.5, accuracy: 95, last: "3 min ago", skills: ["Inventory", "Waitlist", "WhatsApp"], schedule: "Every 15 min", inbox: [{ title: "Release 2 expired holds on SK1026?", detail: "Holds from 17 Oct have no advance. Barnali Sur on the waitlist wants 2 seats." }], log: ["BL1118 at 58%, 29 days out: below the curve", "DJ1223 waitlist reached 11", "Offered KS1101 seat to a Facebook lead"] },
  { name: "Quote Writer", role: "Builds itineraries and quotes from an enquiry", icon: Compass, status: "Running", runsToday: 9, hoursSaved: 6, accuracy: 90, last: "12 min ago", skills: ["Itinerary", "Hotel rates", "GST 5%"], schedule: "On every new enquiry", log: ["Drafted Joydeep Nag 14-pax Darjeeling quote", "Added houseboat night to Swagata Pal's Kashmir", "Re-priced Dubai with today's USD rate"] },
  { name: "Block Keeper", role: "Watches room-block release dates", icon: Hotel, status: "Needs you", runsToday: 6, hoursSaved: 3, accuracy: 97, last: "30 min ago", skills: ["Release dates", "Rooming lists", "Email"], schedule: "Daily 9 AM and 5 PM", inbox: [{ title: "Gangtok and Lachung release in 28 h", detail: "3 rooms unused at each. Release now and save ₹25,800 in retention." }], log: ["Extended Al Barsha Sands to 28 Oct", "Sent DJ1024 rooming list to Rhododendron Heights", "Flagged Ubud villas at 58% use"] },
  { name: "Docs Chaser", role: "Collects passports, photos and PAN on WhatsApp", icon: IdCard, status: "Running", runsToday: 22, hoursSaved: 7, accuracy: 92, last: "just now", skills: ["OCR", "Passport validity", "WhatsApp"], schedule: "Every 2 hours, 9 AM – 8 PM", log: ["3 passports expire within 6 months of travel", "Received 4 PAN copies for Dubai", "Reminded 5 Bhutan travellers about SDF"] },
  { name: "Instalment Collector", role: "Sends UPI links before each instalment falls due", icon: Wallet, status: "Running", runsToday: 5, hoursSaved: 4, accuracy: 94, last: "1 h ago", skills: ["UPI links", "Tally", "TCS"], schedule: "Daily 10 AM and 6 PM", log: ["Queued 9 reminders for 4 PM", "Logged ₹26,450 from Sudeshna Ghosh", "Escalated Mithu Chakraborty, 3 days overdue"] },
  { name: "Group Briefer", role: "Sends packing lists, meeting points and live updates to groups", icon: MessageCircle, status: "Idle", runsToday: 2, hoursSaved: 2, accuracy: 96, last: "3 h ago", skills: ["Broadcast", "Weather", "Train status"], schedule: "T-7, T-2 and departure day", log: ["DJ1024 T-7 briefing sent to 38 travellers", "Darjeeling weather: 9°C nights, woollens advised", "SDAH platform update scheduled for Friday"] },
];

const independence: IndependenceData = {
  score: 41,
  history: [26, 29, 31, 33, 36, 38, 41],
  quote: "Every big group still wants to hear my voice once before paying. I'm the brochure.",
  pillars: [
    { name: "Sales & enquiries", score: 44, note: "Mou closes most leads, but groups over 10 wait for Debashis to call.", fixes: [{ title: "Quote Writer for custom groups", gain: 3 }, { title: "Recorded owner welcome video", gain: 2 }] },
    { name: "Operations & vendors", score: 39, note: "Hotel rates and vendor terms live in Debashis's phone contacts.", fixes: [{ title: "Vendor rate card in one sheet", gain: 3 }, { title: "Block Keeper owns release dates", gain: 2 }] },
    { name: "Documents & visas", score: 52, note: "Rupa runs it well; only urgent passport issues reach the owner.", fixes: [{ title: "Passport validity check at booking", gain: 2 }] },
    { name: "Money & payments", score: 30, note: "Every vendor payment over ₹50k needs Debashis's signature.", fixes: [{ title: "Auto-approve contracted hotel balances", gain: 4 }, { title: "Weekly payables window", gain: 2 }] },
    { name: "Team & tour managers", score: 46, note: "Tour managers report directly to the owner from the road.", fixes: [{ title: "Daily trip report to Arnab", gain: 3 }] },
    { name: "Numbers & reporting", score: 33, note: "Departure profitability is worked out after the tour, in Excel.", fixes: [{ title: "Live margin per departure", gain: 3 }] },
    { name: "Owner time", score: 41, note: "Debashis spends 12 hours a week on vendor calls.", fixes: [{ title: "Two vendor call windows", gain: 2 }] },
  ],
  ownerHours: [
    { label: "Group calls", hours: 10 },
    { label: "Vendor calls", hours: 12 },
    { label: "Payments", hours: 6 },
    { label: "Visas", hours: 3 },
    { label: "Office walk-ins", hours: 5 },
    { label: "Recce trips", hours: 4 },
    { label: "Strategy", hours: 1 },
  ],
};

const integrations: Integration[] = [
  { name: "Tally Prime", category: "Accounts", status: "Connected", detail: "Bookings, receipts, vendor bills and TCS entries.", synced: "8 min ago", records: "9,420 vouchers", mark: "T", color: "#1c4f9c" },
  { name: "WhatsApp Business", category: "Messaging", status: "Connected", detail: "Enquiries, group broadcasts, document collection.", synced: "just now", records: "4,180 chats", mark: "W", color: "#1f9d55" },
  { name: "Razorpay UPI links", category: "Payments", status: "Connected", detail: "Instalment links with auto-reconciliation.", synced: "2 min ago", records: "312 payments", mark: "R", color: "#2563eb" },
  { name: "Meta lead ads", category: "Marketing", status: "Connected", detail: "Facebook and Instagram leads straight into Bookings.", synced: "14 min ago", records: "640 leads", mark: "M", color: "#0866ff" },
  { name: "IRCTC group quota", category: "Tickets", status: "Syncing", detail: "PNR status for train-led departures.", synced: "live", records: "11 PNRs", mark: "IR", color: "#d9482b" },
  { name: "Airline group desk mail", category: "Tickets", status: "Connected", detail: "Group fare locks and name-list deadlines parsed from email.", synced: "40 min ago", records: "6 blocks", mark: "AG", color: "#3a3f9b" },
  { name: "Google Sheets", category: "Planning", status: "Connected", detail: "Old hotel rate sheet, read-only while you move over.", synced: "1 h ago", records: "4 sheets", mark: "GS", color: "#0f9d58" },
  { name: "UAE eVisa partner portal", category: "Visas", status: "Error", detail: "Session expired. Batch upload paused.", synced: "yesterday", records: "—", mark: "UV", color: "#b8860b" },
  { name: "Gmail", category: "Messaging", status: "Connected", detail: "Hotel confirmations and DMC vouchers matched to departures.", synced: "6 min ago", records: "1,270 threads", mark: "G", color: "#ea4335" },
  { name: "Google Business Profile", category: "Marketing", status: "Available", detail: "Ask returning travellers for reviews after each tour.", synced: "—", records: "—", mark: "GB", color: "#4285f4" },
];

/* ============================================================
   Config
   ============================================================ */

const config: DeskConfig = {
  slug: "tours",
  company: "Hooghly Holidays",
  brand: "Hooghly",
  city: "Kolkata",
  state: "WB",
  icon: Luggage,
  tagline: "Group tours and custom packages · 10 departures open · Lake Market office",
  owner: { name: "Debashis Ghosh", first: "Debashis", initials: "DG", role: "Owner" },
  theme: {
    variant: "atelier",
    paper: "#f7f1e7",
    panel: "#fffdf9",
    sunk: "#f0e6d6",
    ink: "#16213a",
    mute: "#636a7e",
    line: "#e6dac6",
    accent: "#d9782d",
    accentInk: "#16213a",
    soft: "#fbe8d4",
    ok: "#2e7d5b",
    warn: "#b98a12",
    late: "#c03a36",
    info: "#2f5b8c",
    heading: "display",
    radius: 16,
  },
  agenda: [
    { at: 9.5, title: "DJ1024 group briefing", detail: "38 travellers, Sealdah 9:30 PM Friday", tone: "ok", module: "departures" },
    { at: 10.5, title: "Quote follow-ups", detail: "7 quotes older than a day", count: 7, tone: "info", module: "bookings" },
    { at: 12, title: "Gangtok block release", detail: "3 rooms each at Gangtok and Lachung", count: 2, tone: "warn", module: "hotels" },
    { at: 14, title: "Dubai visa batch", detail: "26 travellers, 3 PAN copies missing", count: 26, tone: "accent", module: "visas" },
    { at: 16, title: "Instalment reminders", detail: "9 UPI links, 3 already overdue", count: 9, tone: "late", module: "payments" },
    { at: 18.5, title: "Bali fill review", detail: "14 of 24 sold, 29 days out", tone: "info", module: "seats" },
  ],
  activity: [
    { time: "11:42 AM", text: "Sudeshna Ghosh paid ₹26,450 advance for BT1108 by UPI", tone: "ok" },
    { time: "11:15 AM", text: "Seat Watcher: BL1118 at 58%, below the fill curve", tone: "warn" },
    { time: "10:50 AM", text: "Docs Chaser received 4 PAN copies for the Dubai batch", tone: "ok" },
    { time: "10:22 AM", text: "UAE eVisa portal session expired, batch upload paused", tone: "late" },
    { time: "9:48 AM", text: "Joydeep Nag enquired for a 14-pax office trip to Darjeeling", tone: "info" },
    { time: "9:31 AM", text: "DJ1024 T-7 briefing sent to 38 travellers", tone: "neutral" },
  ],
  asks: [
    { q: "Which departures need selling this week?", a: "Two are below the fill curve.\n\n• BL1118 Bali (18 Nov): 14 of 24 sold, 29 days out. The curve says 19 by now. Ubud villas release in 11 days.\n• RJ1127 Rajasthan (27 Nov): 9 of 30 sold. Kakali Biswas's ladies group of 8 is at quote stage; closing it takes you to 17.\n\nSuggestion: a ₹4,000 early-bird on Bali to your 2023–24 Bali and Thailand travellers (212 contacts), and Mou calls Kakali today.", sources: ["Seat inventory", "Bookings board", "WhatsApp contacts"] },
    { q: "Which room blocks are about to release?", a: "Two in the next 30 hours:\n• Kanchenjunga Crest, Gangtok: 15 of 18 rooms used, releases in 28 h.\n• Yumthang Valley Lodge, Lachung: 15 of 18 used, releases in 30 h.\n\nSK1026 has 4 seats free and 2 holds. Release 2 rooms at each and keep 1 as buffer: saves ₹21,800 in retention.", sources: ["Hotels & vendors", "Seat inventory"] },
    { q: "How much money is due this week?", a: "₹6.1 L across 9 instalments. ₹3.9 L is already overdue: Rakesh Agarwal (₹2.36 L balance, Dubai, 2 days), Mithu Chakraborty (₹1.05 L, Kashmir, 3 days, pays cash) and Nilanjan Basu (₹44,200, Andaman, 5 days).\n\nOn the other side, ₹13.9 L of vendor payments wait for you; the IndiGo balance is the one with a hard deadline (fare lock ends Thursday).", sources: ["Payments", "Tally", "Airline group desk mail"] },
    { q: "Is the Dubai group ready for visas?", a: "Not yet. 26 travellers: 19 complete, 4 waiting on PAN copies, 3 on photos. Anirban Mitra's passport expires Feb 2027, fine for Dubai (6-month rule) but flag it for future trips. The UAE eVisa portal session expired this morning; Rupa needs to log in again before the 2 PM batch.", sources: ["Visas & documents", "Connections"] },
    { q: "Who is on the DJ1223 Christmas waitlist?", a: "11 people across 5 families. Oldest is Sutapa Bhowmik (2 pax, since 2 Oct). Options: ask Rhododendron Heights for 6 more rooms and open a second coach, or start a 30 Dec batch. Pritam Adhikari and Kingshuk Aich already said they'd move to 30 Dec.", sources: ["Seat inventory", "Waitlist"] },
    { q: "Draft a WhatsApp to the DJ1024 group", a: "Draft (not sent):\n\n“Namaskar! Your Darjeeling & Kalimpong tour leaves this Friday, 24 Oct. Please be at Sealdah platform 9A by 9:15 PM; Soumen da will be at the Hooghly Holidays banner. Nights are 8–9°C, so pack woollens, a cap and walking shoes. Carry one photo ID per person. Any questions, reply here. Shubho jatra! — Hooghly Holidays”", sources: ["DJ1024 pax list", "Weather"] },
  ],
  run: {
    label: "Runs every morning at 8. You can also run it now.",
    title: "Departure Watch",
    steps: [
      { text: "Read 10 departures, 251 seats sold and 18 holds", result: "2 departures below the fill curve" },
      { text: "Check room blocks against seats sold", result: "6 unused rooms in Gangtok and Lachung" },
      { text: "Scan documents for international groups", result: "7 travellers missing papers, 1 passport in renewal" },
      { text: "Match instalments against due dates", result: "3 overdue, ₹2.7 L" },
      { text: "Draft owner approvals and group messages", result: "5 vendor payments, 2 broadcasts" },
    ],
    outcome: "Release 2 rooms each in Gangtok and Lachung today, run an early-bird on Bali to past travellers and approve the IndiGo balance before the fare lock ends Thursday.",
    actions: ["Release 4 rooms in Sikkim", "Send Bali early-bird", "Approve IndiGo balance", "Remind 3 overdue instalments"],
  },
};

/* ============================================================
   Desk
   ============================================================ */

const regionLabel: Record<Region, string> = { Hills: "Hills", India: "India", Abroad: "Abroad" };

export default function ToursDesk() {
  const [deps, setDeps] = React.useState(seedDeps);
  const [leads, setLeads] = React.useState(seedLeads);
  const [wait, setWait] = React.useState(seedWait);
  const [blocks, setBlocks] = React.useState(seedBlocks);
  const [docs, setDocs] = React.useState(seedDocs);
  const [inst, setInst] = React.useState(seedInst);

  const openLeads = leads.filter((l) => l.stage !== "confirmed").length;
  const releasing = blocks.filter((b) => b.state === "Holding" && b.releaseH < 72).length;
  const docsMissing = travellers.filter((t) => (docs[t.id]?.length ?? 0) < docSets[t.dep].length).length;
  const overdue = inst.filter((i) => i.paid < i.total && i.dueIn < 0).length;

  const modules: DeskModule[] = [
    {
      id: "departures",
      label: "Departures",
      title: "Departures wall",
      blurb: "Every group leaving in the next 65 days, how full it is and what it still needs",
      icon: Plane,
      notes: ["Each line is a group departure. The tiles flip whenever something changes: a seat sold, a status, the tour leader.", "Click a line to see the passenger list, rooming and who still owes money.", "Filter Hills, India or Abroad; the wall re-flips."],
      render: () => <DeparturesHome deps={deps} setDeps={setDeps} leads={leads} />,
    },
    { id: "bookings", label: "Bookings", count: openLeads, title: "Bookings", blurb: "Enquiry to quote to advance to confirmed. Drag a card when the customer moves.", icon: Ticket, render: () => <BookingsTab leads={leads} setLeads={setLeads} deps={deps} setDeps={setDeps} /> },
    { id: "seats", label: "Seat inventory", count: wait.length, title: "Seat inventory", blurb: "Seats sold, held and free on every group, with the waitlist behind each", icon: Armchair, render: () => <SeatsTab deps={deps} setDeps={setDeps} wait={wait} setWait={setWait} /> },
    { id: "hotels", label: "Hotels & vendors", count: releasing, title: "Hotels & vendors", blurb: "Room blocks, release dates and the transport, permit and DMC partners", icon: BedDouble, render: () => <HotelsTab blocks={blocks} setBlocks={setBlocks} deps={deps} /> },
    { id: "visas", label: "Visas & documents", count: docsMissing, title: "Visas & documents", blurb: "Passport, photo, PAN, permits and visas for every traveller going abroad", icon: Stamp, render: () => <VisasTab docs={docs} setDocs={setDocs} /> },
    { id: "payments", label: "Payments", count: overdue, title: "Payments", blurb: "Traveller instalments coming in, vendor payments going out", icon: IndianRupee, render: () => <PaymentsTab inst={inst} setInst={setInst} /> },
    { id: "team", label: "People", title: "People", blurb: "Sales, operations, visas and tour managers: who is carrying what today", icon: Users, render: () => <PeopleModule members={team} /> },
    { id: "agents", label: "Agents", title: "Agents", blurb: "Six AI agents chasing seats, rooms, papers and payments", icon: Compass, render: () => <AgentsModule agents={agents} /> },
    { id: "independence", label: "Independence", title: "Owner independence", blurb: "How much of Hooghly Holidays runs without Debashis on the phone", icon: GaugeIcon, render: () => <IndependenceModule data={independence} /> },
    { id: "connections", label: "Connections", title: "Connections", blurb: "Tally, WhatsApp, UPI, lead ads, IRCTC and the visa portals", icon: Plug, render: () => <ConnectionsModule items={integrations} /> },
  ];

  return <DeskShell config={config} modules={modules} />;
}

/* ---------------- Split-flap tiles ---------------- */

const FLAP = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:-/.";
const flapCss = `
.hh-wall{background:radial-gradient(120% 140% at 0% 0%,#22325a 0%,#16213a 45%,#0e162a 100%);color:#f6e7cf}
.hh-tile{position:relative;display:inline-flex;align-items:center;justify-content:center;width:1.12em;height:1.6em;margin-right:2px;border-radius:3px;
background:linear-gradient(#24314f 0 49.5%,#0b1224 49.5% 50.5%,#1c2843 50.5%);font-family:var(--font-mono);font-weight:700;overflow:hidden;perspective:120px;
box-shadow:inset 0 1px 0 rgba(255,255,255,.06),0 1px 1px rgba(0,0,0,.45)}
.hh-tile>span{display:inline-block;transform-origin:50% 50%;animation:hh-flip 110ms cubic-bezier(.3,.7,.3,1) both}
@keyframes hh-flip{0%{transform:rotateX(-88deg);filter:brightness(.55)}100%{transform:rotateX(0);filter:none}}
.hh-led{animation:hh-led 1.4s ease-in-out infinite}
@keyframes hh-led{0%,100%{opacity:1}50%{opacity:.35}}
`;

function FlapCell({ ch, delay }: { ch: string; delay: number }) {
  const [shown, setShown] = React.useState(" ");
  const started = React.useRef(false);
  React.useEffect(() => {
    started.current = false;
  }, [ch]);
  React.useEffect(() => {
    if (shown === ch) return;
    const wait = started.current ? 36 : delay;
    const id = window.setTimeout(() => {
      started.current = true;
      setShown((cur) => {
        const target = FLAP.indexOf(ch);
        if (target < 0) return ch;
        const at = Math.max(0, FLAP.indexOf(cur));
        const dist = (target - at + FLAP.length) % FLAP.length;
        if (dist === 0) return ch;
        return dist > 7 ? FLAP[(target - 7 + FLAP.length) % FLAP.length] : FLAP[(at + 1) % FLAP.length];
      });
    }, wait);
    return () => window.clearTimeout(id);
  }, [ch, shown, delay]);
  return (
    <span className="hh-tile">
      <span key={shown}>{shown === " " ? " " : shown}</span>
    </span>
  );
}

function Flap({ text, len, delay = 0, color }: { text: string; len: number; delay?: number; color?: string }) {
  const padded = text.toUpperCase().slice(0, len).padEnd(len, " ");
  return (
    <span className="inline-flex whitespace-nowrap" style={{ color }}>
      {padded.split("").map((c, i) => (
        <FlapCell key={i} ch={c} delay={delay + i * 28} />
      ))}
    </span>
  );
}

const flapColor: Record<DepStatus, string> = { BOARDING: "#7fe0a8", "ON TIME": "#7fe0a8", FILLING: "#9cc4ff", "FEW LEFT": "#ffc56b", WAITLIST: "#ff8a7a", "DOCS DUE": "#ffc56b", CLOSED: "#a9b0c2" };

function SeatPips({ dep }: { dep: Departure }) {
  return (
    <span className="inline-grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${Math.ceil(dep.seats / 2)}, 5px)` }}>
      {Array.from({ length: dep.seats }, (_, i) => {
        const kind = i < dep.sold ? "sold" : i < dep.sold + dep.held ? "held" : "free";
        return <span key={i} className={kind === "held" ? "hh-led" : ""} style={{ width: 5, height: 5, borderRadius: 1, background: kind === "sold" ? "#e98a3c" : kind === "held" ? "#ffd07a" : "rgba(246,231,207,.16)" }} />;
      })}
    </span>
  );
}

function WallClock() {
  const now = useNow(1000);
  const text = now ? now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }) : "--:--";
  return <Flap text={text} len={5} />;
}

function DeparturesWall({ deps, onOpen }: { deps: Departure[]; onOpen: (d: Departure) => void }) {
  const [region, setRegion] = React.useState<"All" | Region>("All");
  const phase = useTicker(3, 6000);
  const shown = deps.filter((d) => region === "All" || d.region === region);
  const altLabel = ["VIA", "LEADER", "PRICE"][phase];
  return (
    <div className="hh-wall overflow-hidden rounded-[18px] shadow-[0_30px_70px_-40px_#16213a]">
      <style>{flapCss}</style>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d9782d] text-[#16213a]">
            <Plane className="h-4.5 w-4.5" strokeWidth={2} />
          </span>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#f6e7cf]/60">Hooghly Holidays · Lake Market</p>
            <p className="desk-h text-[20px] font-semibold tracking-wide text-[#f6e7cf]">Departures</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 rounded-full bg-white/5 p-1">
            {(["All", "Hills", "India", "Abroad"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRegion(r)}
                className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${region === r ? "bg-[#d9782d] text-[#16213a]" : "text-[#f6e7cf]/70 hover:text-[#f6e7cf]"}`}
              >
                {r === "All" ? "All" : regionLabel[r]}
              </button>
            ))}
          </div>
          <span className="text-[15px]">
            <WallClock />
          </span>
        </div>
      </div>
      <div className="desk-scroll overflow-x-auto px-3 pb-3 pt-2 sm:px-5">
        <table className="w-full min-w-[920px] border-separate border-spacing-y-[5px] text-[14px]">
          <thead>
            <tr className="text-left font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#f6e7cf]/50">
              <th className="px-2 font-normal">Date</th>
              <th className="px-2 font-normal">Destination</th>
              <th className="px-2 font-normal">Group</th>
              <th className="px-2 font-normal">
                <span key={altLabel} className="desk-rise inline-block">
                  {altLabel}
                </span>
              </th>
              <th className="px-2 font-normal">Seats</th>
              <th className="px-2 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((d, i) => {
              const alt = phase === 0 ? d.via : phase === 1 ? d.leader : `${Math.round(d.price / 1000)}K PP`;
              const ModeIcon = d.mode === "train" ? TrainFront : d.mode === "flight" ? Plane : BusFront;
              return (
                <tr key={d.id} onClick={() => onOpen(d)} className="group cursor-pointer">
                  <td className="rounded-l-[10px] bg-white/[0.03] px-2 py-1.5 transition-colors group-hover:bg-white/[0.08]">
                    <Flap text={d.date} len={6} delay={i * 60} />
                  </td>
                  <td className="bg-white/[0.03] px-2 py-1.5 transition-colors group-hover:bg-white/[0.08]">
                    <Flap text={d.board} len={15} delay={i * 60 + 80} />
                  </td>
                  <td className="bg-white/[0.03] px-2 py-1.5 transition-colors group-hover:bg-white/[0.08]">
                    <Flap text={d.code} len={6} delay={i * 60 + 120} color="#e98a3c" />
                  </td>
                  <td className="bg-white/[0.03] px-2 py-1.5 transition-colors group-hover:bg-white/[0.08]">
                    <span className="inline-flex items-center gap-1.5">
                      <ModeIcon className="h-3.5 w-3.5 text-[#f6e7cf]/50" />
                      <Flap text={alt} len={10} delay={i * 50} />
                    </span>
                  </td>
                  <td className="bg-white/[0.03] px-2 py-1.5 transition-colors group-hover:bg-white/[0.08]">
                    <span className="flex items-center gap-2.5">
                      <SeatPips dep={d} />
                      <span className="tnum font-mono text-[11.5px] text-[#f6e7cf]/75">
                        {d.sold}/{d.seats}
                      </span>
                    </span>
                  </td>
                  <td className="rounded-r-[10px] bg-white/[0.03] px-2 py-1.5 transition-colors group-hover:bg-white/[0.08]">
                    <span className="inline-flex items-center gap-2">
                      <span className="hh-led h-2 w-2 rounded-full" style={{ background: flapColor[d.status] }} />
                      <Flap text={d.status} len={8} delay={i * 60 + 160} color={flapColor[d.status]} />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-white/10 px-5 py-2.5 font-mono text-[11px] text-[#f6e7cf]/60">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-[1px] bg-[#e98a3c]" /> sold
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="hh-led h-2 w-2 rounded-[1px] bg-[#ffd07a]" /> held, no advance yet
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-[1px] bg-[#f6e7cf]/20" /> free
        </span>
        <span className="ml-auto">Click a line for the passenger list</span>
      </div>
    </div>
  );
}

/* ---------------- Home ---------------- */

function DeparturesHome({ deps, setDeps, leads }: { deps: Departure[]; setDeps: React.Dispatch<React.SetStateAction<Departure[]>>; leads: Lead[] }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<string | null>(null);
  const dep = deps.find((d) => d.id === open) ?? null;
  const sold = deps.reduce((a, d) => a + d.sold, 0);
  const seats = deps.reduce((a, d) => a + d.seats, 0);
  const enquiries = useDrift(23, 0.6, 3200);
  const next = [...deps].sort((a, b) => a.day - b.day)[0];
  const revenue = deps.reduce((a, d) => a + d.sold * d.price, 0);

  return (
    <div className="space-y-5">
      <DeparturesWall deps={deps} onOpen={(d) => setOpen(d.id)} />
      <div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Seats sold, open departures" value={`${sold} / ${seats}`} delta="+14" hint="this week" icon={Armchair} trend={[188, 201, 214, 222, 231, 240, 246, sold]} />
          <Stat label="Enquiries today" value={Math.round(enquiries)} delta="+31%" hint="Puja bonus season" icon={MessageCircle} tone="info" trend={[9, 12, 14, 11, 17, 19, 21, Math.round(enquiries)]} />
          <Stat label="Booked revenue" value={inr(revenue, { compact: true })} delta="+18%" hint="vs Oct last year" icon={IndianRupee} tone="ok" trend={[0.8, 0.9, 1.0, 1.05, 1.1, 1.18, 1.22, revenue / 1e7]} />
          <Stat label="Groups below fill curve" value={2} delta="+1" deltaGood={false} hint="Bali and Rajasthan" icon={AlertTriangle} tone="late" trend={[0, 1, 1, 1, 2, 1, 1, 2]} />
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.05fr_1fr_0.95fr]">
        <Panel icon={Hourglass} title="Next out of the door" sub={`${next.title} · ${next.sold} travellers`}>
          <div className="rounded-[14px] bg-d-sunk p-4">
            <p className="text-[12px] text-d-mute">Leaves {next.via.split(" ")[0] === "SDAH" ? "Sealdah" : next.via.split(" ")[0]} at {next.via.split(" ")[1]} in</p>
            <div className="mt-1">
              <Countdown inHours={next.day * 24 + 10} />
            </div>
          </div>
          <NextChecklist />
        </Panel>
        <Panel icon={Mountain} title="Fill by departure" sub="Sold against seats, nearest first" action={<Btn size="sm" variant="ghost" onClick={() => desk.goTab("seats")}>Seats</Btn>}>
          <HBars
            format={(v) => `${v}%`}
            max={100}
            data={deps.slice(0, 8).map((d) => {
              const p = Math.round((d.sold / d.seats) * 100);
              return { label: d.title.split(" · ")[0].split(" & ")[0], sub: d.date.toLowerCase(), value: p, tone: p >= 90 ? "ok" : p >= 65 ? "accent" : "late" };
            })}
          />
        </Panel>
        <Panel icon={Ticket} title="Where leads came from" sub="Last 30 days, 186 enquiries">
          <Donut
            size={140}
            center={leads.length}
            sub="in pipeline"
            segments={[
              { label: "WhatsApp", value: 64, tone: "ok" },
              { label: "Facebook ads", value: 48, tone: "info" },
              { label: "Referral", value: 37, tone: "accent" },
              { label: "Walk-in", value: 21, tone: "warn" },
              { label: "Website & phone", value: 16, tone: "neutral" },
            ]}
          />
        </Panel>
      </div>
      <DepSheet dep={dep} onClose={() => setOpen(null)} setDeps={setDeps} />
    </div>
  );
}

function NextChecklist() {
  const desk = useDesk();
  const [items, setItems] = React.useState([
    { id: "a", label: "T-7 briefing on WhatsApp", sub: "Sent to 38 travellers", done: true },
    { id: "b", label: "Tour kits printed (cap, bag, ID card)", sub: "Bablu, by Wednesday", done: false },
    { id: "c", label: "Rooming list to both hotels", sub: "Rhododendron Heights done, Teesta Bend pending", done: false },
    { id: "d", label: "NJP pickup: 2 Tempo Travellers", sub: "Teesta Travels, numbers awaited", done: false },
    { id: "e", label: "Two balances due before departure", sub: "₹18,400 total", done: false },
  ]);
  return (
    <div className="mt-3">
      <Checklist
        items={items}
        onToggle={(id) => {
          const it = items.find((x) => x.id === id);
          setItems((cur) => cur.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
          if (it && !it.done) desk.log(`DJ1024: ${it.label} done`, "ok");
        }}
      />
    </div>
  );
}

function DepSheet({ dep, onClose, setDeps }: { dep: Departure | null; onClose: () => void; setDeps: React.Dispatch<React.SetStateAction<Departure[]>> }) {
  const desk = useDesk();
  const pax = dep ? paxFor(dep) : [];
  const owing = pax.filter((p) => p.paid !== "Paid in full").length;
  return (
    <Sheet
      open={!!dep}
      onOpenChange={(o) => !o && onClose()}
      width={620}
      eyebrow={dep ? `${dep.code} · ${dep.date} · leader ${dep.leader.charAt(0)}${dep.leader.slice(1).toLowerCase()}` : ""}
      title={dep?.title ?? ""}
      sub={dep ? `${dep.sold} of ${dep.seats} seats sold · ${dep.held} held · ${inr(dep.price)} per person, twin sharing` : ""}
      footer={
        dep && (
          <>
            <Btn
              icon={Send}
              onClick={() => {
                toast.success("Briefing sent on WhatsApp", { description: `${dep.sold} travellers on ${dep.code}` });
                desk.log(`Group briefing sent to ${dep.code}`, "info");
              }}
            >
              WhatsApp the group
            </Btn>
            {dep.status === "CLOSED" ? (
              <Btn
                icon={Undo2}
                onClick={() => {
                  setDeps((cur) => cur.map((d) => (d.id === dep.id ? { ...d, status: d.sold >= d.seats ? "WAITLIST" : "FILLING" } : d)));
                  desk.log(`${dep.code} reopened for sale`);
                }}
              >
                Reopen sales
              </Btn>
            ) : (
              <Btn
                variant="solid"
                onClick={() => {
                  setDeps((cur) => cur.map((d) => (d.id === dep.id ? { ...d, status: "CLOSED", held: 0 } : d)));
                  toast.success(`${dep.code} closed for sale`, { description: "Holds released, the wall is updated." });
                  desk.log(`${dep.code} closed for sale`, "warn");
                  onClose();
                }}
              >
                Close sales
              </Btn>
            )}
          </>
        )
      }
    >
      {dep && (
        <div className="space-y-5">
          <KV
            cols={3}
            items={[
              { k: "Leaves", v: dep.via },
              { k: "Nights", v: dep.nights },
              { k: "Revenue", v: inr(dep.sold * dep.price, { compact: true }) },
              { k: "Waitlist", v: dep.waitlist },
              { k: "Owing money", v: <span className={owing ? "text-d-warn" : "text-d-ok"}>{owing} travellers</span> },
              { k: "Status", v: <Pill tone={statusTone[dep.status]}>{dep.status.toLowerCase()}</Pill> },
            ]}
          />
          <Meter value={dep.sold} max={dep.seats} tone={dep.sold / dep.seats > 0.85 ? "ok" : "accent"} height={8} />
          <div>
            <p className="mb-2 text-[12px] font-medium text-d-mute">Passenger list</p>
            <ul className="divide-y divide-d-line rounded-[12px] border border-d-line">
              {pax.map((p, i) => (
                <li key={`${p.name}-${i}`} className="flex items-center gap-3 px-3 py-2">
                  <span className="w-5 font-mono text-[11px] text-d-mute">{i + 1}</span>
                  <Avatar name={p.name} size={26} tone={p.paid === "Paid in full" ? "accent" : "warn"} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium">
                      {p.name} <span className="font-normal text-d-mute">· {p.age}</span>
                    </p>
                    <p className="truncate text-[11.5px] text-d-mute">
                      {p.from} · {p.room} · {p.diet}
                    </p>
                  </div>
                  {p.docs === "Pending" && <Pill tone="warn">docs</Pill>}
                  <Pill tone={p.paid === "Paid in full" ? "ok" : p.paid === "50% paid" ? "info" : "late"}>{p.paid}</Pill>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Sheet>
  );
}

/* ---------------- Bookings ---------------- */

const stageCols: { id: Stage; label: string; tone: Tone; hint: string }[] = [
  { id: "enquiry", label: "Enquiry", tone: "info", hint: "Reply within 30 minutes" },
  { id: "quote", label: "Quote sent", tone: "warn", hint: "Follow up on day 1 and day 3" },
  { id: "advance", label: "Advance paid", tone: "accent", hint: "25% advance holds the seat" },
  { id: "confirmed", label: "Confirmed", tone: "ok", hint: "Seats moved to sold" },
];

function BookingsTab({ leads, setLeads, deps, setDeps }: { leads: Lead[]; setLeads: React.Dispatch<React.SetStateAction<Lead[]>>; deps: Departure[]; setDeps: React.Dispatch<React.SetStateAction<Departure[]>> }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);
  const lead = leads.find((l) => l.id === open) ?? null;
  const by = (s: Stage) => leads.filter((l) => l.stage === s);
  const pipeline = leads.filter((l) => l.stage !== "confirmed").reduce((a, l) => a + l.value, 0);

  function move(id: string, to: Stage) {
    const l = leads.find((x) => x.id === id);
    if (!l || l.stage === to) return;
    setLeads((cur) => cur.map((x) => (x.id === id ? { ...x, stage: to } : x)));
    if (to === "confirmed" && l.dep) setDeps((cur) => cur.map((d) => (d.id === l.dep ? { ...d, sold: Math.min(d.seats, d.sold + l.pax) } : d)));
    toast.success(`${l.name} → ${stageCols.find((c) => c.id === to)?.label}`, { description: to === "confirmed" && l.dep ? `${l.pax} seats marked sold on ${deps.find((d) => d.id === l.dep)?.code}` : `${l.dest} · ${inr(l.value, { compact: true })}` });
    desk.log(`${l.name} moved to ${to}`, to === "confirmed" ? "ok" : "info");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open enquiries" value={by("enquiry").length} delta="+4" hint="since morning" icon={MessageCircle} tone="info" trend={[2, 3, 2, 4, 3, 5, by("enquiry").length]} />
        <Stat label="Quotes waiting" value={by("quote").length} hint="oldest 4 days" icon={Ticket} tone="warn" />
        <Stat label="Pipeline value" value={inr(pipeline, { compact: true })} delta="+22%" icon={IndianRupee} trend={[18, 21, 24, 22, 27, 29, pipeline / 1e5]} />
        <Stat label="Enquiry to booking" value="31%" delta="+3%" hint="last 90 days" icon={GaugeIcon} tone="ok" />
      </div>
      <Panel title="Booking pipeline" sub="Drag a card to the next column. Confirmed bookings move seats to sold on the wall." action={<Btn size="sm" variant="solid" icon={Plus} onClick={() => setAdding(true)}>New enquiry</Btn>}>
        <Board
          columns={stageCols.map((c) => ({ ...c, hint: c.hint }))}
          items={leads}
          itemKey={(l) => l.id}
          getColumn={(l) => l.stage}
          onMove={(k, c) => move(k, c as Stage)}
          renderCard={(l) => (
            <button type="button" onClick={() => setOpen(l.id)} className="block w-full text-left">
              <div className="flex items-start justify-between gap-2 pr-3">
                <p className="text-[13.5px] font-semibold leading-tight">{l.name}</p>
                <span className="font-mono text-[10.5px] text-d-mute">{l.age}</span>
              </div>
              <p className="mt-0.5 text-[12px] text-d-mute">{l.party}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Pill tone="accent">{l.dest}</Pill>
                <Pill>{l.pax} pax</Pill>
                <span className="ml-auto font-mono text-[12px] font-semibold">{inr(l.value, { compact: true })}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-[11.5px] leading-snug text-d-mute">{l.note}</p>
              <p className="mt-2 flex items-center justify-between text-[11px] text-d-mute">
                <span>{l.source}</span>
                <span>{l.owner}</span>
              </p>
            </button>
          )}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Funnel, last 30 days" sub="Where people drop off">
          <HBars data={[{ label: "Enquiries", value: 186, tone: "info" }, { label: "Quotes sent", value: 121, tone: "warn" }, { label: "Advance paid", value: 68, tone: "accent" }, { label: "Confirmed", value: 58, tone: "ok" }]} />
        </Panel>
        <Panel title="Enquiries by destination" sub="This month">
          <Bars height={170} data={[{ label: "Sikkim", value: 41 }, { label: "Darj.", value: 37 }, { label: "Kashmir", value: 28 }, { label: "Dubai", value: 22, tone: "info" }, { label: "Kerala", value: 19 }, { label: "Bali", value: 14, tone: "info" }, { label: "Bhutan", value: 13, tone: "info" }, { label: "Andaman", value: 12 }]} />
        </Panel>
      </div>
      <Sheet
        open={!!lead}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={lead ? `${lead.id} · ${lead.source} · ${lead.owner}` : ""}
        title={lead?.name ?? ""}
        sub={lead ? `${lead.party} · ${lead.dest}` : ""}
        footer={
          lead && (
            <>
              {lead.stage === "enquiry" && (
                <Btn variant="solid" icon={Send} onClick={() => { move(lead.id, "quote"); setOpen(null); }}>
                  Send quote on WhatsApp
                </Btn>
              )}
              {lead.stage === "quote" && (
                <Btn variant="solid" icon={Wallet} onClick={() => { move(lead.id, "advance"); setOpen(null); }}>
                  Send 25% advance link
                </Btn>
              )}
              {lead.stage === "advance" && (
                <Btn variant="solid" onClick={() => { move(lead.id, "confirmed"); setOpen(null); }}>
                  Confirm booking
                </Btn>
              )}
              {lead.stage === "confirmed" && <Pill tone="ok">Confirmed</Pill>}
            </>
          )
        }
      >
        {lead && (
          <div className="space-y-5">
            <KV items={[{ k: "Travellers", v: lead.pax }, { k: "Package value", v: inr(lead.value) }, { k: "Per person", v: inr(lead.value / lead.pax) }, { k: "Departure", v: deps.find((d) => d.id === lead.dep)?.code ?? "Custom dates" }]} />
            <div className="rounded-[12px] bg-d-sunk p-3 text-[13px] leading-relaxed">{lead.note}</div>
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Quote break-up</p>
              <ul className="space-y-1.5 text-[13px]">
                {[
                  { k: "Hotels & meals (MAP)", v: lead.value * 0.46 },
                  { k: lead.dest === "Dubai" || lead.dest === "Bali" || lead.dest === "Kashmir" || lead.dest === "Kerala" || lead.dest === "Andaman" ? "Group air fare" : "Train + cars", v: lead.value * 0.3 },
                  { k: "Sightseeing, permits, guide", v: lead.value * 0.1 },
                  { k: "Hooghly service + tour manager", v: lead.value * 0.094 },
                  { k: "GST 5% on package", v: lead.value * 0.046 },
                ].map((r) => (
                  <li key={r.k} className="flex justify-between border-b border-dashed border-d-line pb-1.5">
                    <span>{r.k}</span>
                    <span className="tnum font-mono">{inr(r.v)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Move to</p>
              <Segmented size="sm" options={stageCols.map((c) => ({ value: c.id, label: c.label }))} value={lead.stage} onChange={(v) => move(lead.id, v)} />
            </div>
          </div>
        )}
      </Sheet>
      <NewEnquiry
        open={adding}
        onOpenChange={setAdding}
        onAdd={(l) => {
          setLeads((cur) => [l, ...cur]);
          toast.success("Enquiry added", { description: `${l.name} · ${l.dest} · Quote Writer is drafting` });
          desk.log(`New enquiry: ${l.name} for ${l.dest}, ${l.pax} pax`, "info");
        }}
      />
    </div>
  );
}

function NewEnquiry({ open, onOpenChange, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (l: Lead) => void }) {
  const [name, setName] = React.useState("Abhishek Sarkar");
  const [dest, setDest] = React.useState("Sikkim");
  const [pax, setPax] = React.useState("4");
  const [source, setSource] = React.useState<Lead["source"]>("WhatsApp");
  const [count, setCount] = React.useState(3390);
  const pp: Record<string, number> = { Darjeeling: 21900, Sikkim: 32500, Kashmir: 46800, Kerala: 39400, Bhutan: 52900, Dubai: 78500, Bali: 84900, Andaman: 44200, Rajasthan: 36700 };
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="New enquiry" sub="Quote Writer drafts an itinerary as soon as you save.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const n = Number(pax) || 2;
          onAdd({ id: `EQ-${count}`, name, party: `${n} pax`, dest, pax: n, value: n * (pp[dest] ?? 30000), stage: "enquiry", source, age: "now", owner: "Mou", note: "New enquiry, details to be confirmed on call" });
          setCount((c) => c + 1);
          onOpenChange(false);
        }}
      >
        <Field label="Customer name">
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Destination">
            <select className={inputClass} value={dest} onChange={(e) => setDest(e.target.value)}>
              {Object.keys(pp).map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </Field>
          <Field label="Travellers">
            <input className={inputClass} inputMode="numeric" value={pax} onChange={(e) => setPax(e.target.value.replace(/\D/g, ""))} />
          </Field>
          <Field label="Source">
            <select className={inputClass} value={source} onChange={(e) => setSource(e.target.value as Lead["source"])}>
              {(["WhatsApp", "Walk-in", "Facebook ad", "Referral", "Website", "Phone"] as const).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>
        <p className="text-[12.5px] text-d-mute">Estimated value {inr((Number(pax) || 0) * (pp[dest] ?? 30000))} at the group price, twin sharing.</p>
        <div className="flex justify-end gap-2 pt-2">
          <Btn onClick={() => onOpenChange(false)}>Cancel</Btn>
          <Btn variant="solid" type="submit" icon={UserPlus}>
            Add enquiry
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Seat inventory ---------------- */

function SeatsTab({ deps, setDeps, wait, setWait }: { deps: Departure[]; setDeps: React.Dispatch<React.SetStateAction<Departure[]>>; wait: Waiter[]; setWait: React.Dispatch<React.SetStateAction<Waiter[]>> }) {
  const desk = useDesk();
  const [pick, setPick] = React.useState("SK26");
  const dep = deps.find((d) => d.id === pick) ?? deps[0];
  const free = dep.seats - dep.sold - dep.held;
  const totals = { sold: deps.reduce((a, d) => a + d.sold, 0), held: deps.reduce((a, d) => a + d.held, 0), seats: deps.reduce((a, d) => a + d.seats, 0) };

  function seatClick(i: number) {
    if (i < dep.sold) {
      toast(`Seat ${i + 1} is sold`, { description: "Cancel it from the booking, not here." });
      return;
    }
    const held = i < dep.sold + dep.held;
    setDeps((cur) => cur.map((d) => (d.id === dep.id ? { ...d, held: Math.max(0, d.held + (held ? -1 : 1)) } : d)));
    desk.log(`${dep.code}: seat ${held ? "hold released" : "held for 24 h"}`);
  }

  function promote(w: Waiter) {
    const d = deps.find((x) => x.id === w.dep);
    if (!d) return;
    const avail = d.seats - d.sold - d.held;
    if (avail < w.pax) {
      toast.error(`Only ${Math.max(0, avail)} free on ${d.code}`, { description: "Release a hold or ask the hotel for more rooms." });
      return;
    }
    setDeps((cur) => cur.map((x) => (x.id === d.id ? { ...x, sold: x.sold + w.pax, waitlist: Math.max(0, x.waitlist - w.pax) } : x)));
    setWait((cur) => cur.filter((x) => x.id !== w.id));
    toast.success(`${w.name} confirmed on ${d.code}`, { description: `${w.pax} seats. Advance link sent on WhatsApp.` });
    desk.log(`${w.name} promoted from waitlist to ${d.code}`, "ok");
  }

  const rows = Math.ceil(dep.seats / 4);
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Seats sold" value={`${totals.sold} / ${totals.seats}`} delta="+14" hint="this week" icon={Armchair} trend={[201, 214, 222, 231, 240, 246, totals.sold]} />
        <Stat label="Holds without advance" value={totals.held} hint="auto-release after 48 h" icon={Hourglass} tone="warn" />
        <Stat label="On waitlists" value={wait.reduce((a, w) => a + w.pax, 0)} delta="+5" deltaGood={false} hint="mostly Christmas Darjeeling" icon={ListChecks} tone="late" />
        <Stat label="Average fill" value={`${Math.round((totals.sold / totals.seats) * 100)}%`} delta="+4%" icon={GaugeIcon} tone="ok" trend={[61, 64, 66, 69, 70, 72, Math.round((totals.sold / totals.seats) * 100)]} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_1.1fr]">
        <Panel
          title={`Seat map · ${dep.code}`}
          sub={`${dep.title} · ${dep.sold} sold, ${dep.held} held, ${free} free. Click a free seat to hold it for 24 h.`}
          action={
            <select className={`${inputClass} h-8 w-[170px] text-[12.5px]`} value={pick} onChange={(e) => setPick(e.target.value)}>
              {deps.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} · {d.board.toLowerCase()}
                </option>
              ))}
            </select>
          }
        >
          <div className="mx-auto max-w-[340px] rounded-[28px] border-2 border-d-line bg-d-sunk/60 px-5 pb-5 pt-4">
            <div className="mb-3 flex items-center justify-between text-[11px] text-d-mute">
              <span className="inline-flex items-center gap-1">
                <BusFront className="h-3.5 w-3.5" /> Front · tour manager
              </span>
              <span className="font-mono">{dep.mode === "flight" ? "Group block" : dep.mode === "train" ? "3AC group quota" : "Coach"}</span>
            </div>
            <div className="space-y-1.5">
              {Array.from({ length: rows }, (_, r) => (
                <div key={r} className="flex items-center justify-center gap-1.5">
                  {[0, 1, -1, 2, 3].map((c) => {
                    if (c === -1) return <span key="aisle" className="w-6 text-center font-mono text-[9.5px] text-d-mute">{r + 1}</span>;
                    const i = r * 4 + c;
                    if (i >= dep.seats) return <span key={c} className="h-8 w-9" />;
                    const kind = i < dep.sold ? "sold" : i < dep.sold + dep.held ? "held" : "free";
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => seatClick(i)}
                        title={`Seat ${i + 1}: ${kind}`}
                        className={`h-8 w-9 rounded-t-[10px] rounded-b-[4px] border text-[10px] font-semibold transition-transform hover:scale-110 ${kind === "held" ? "desk-ping" : ""}`}
                        style={{
                          background: kind === "sold" ? "var(--d-accent)" : kind === "held" ? "color-mix(in oklab, var(--d-warn) 30%, var(--d-panel))" : "var(--d-panel)",
                          borderColor: kind === "sold" ? "var(--d-accent)" : kind === "held" ? "var(--d-warn)" : "var(--d-line)",
                          color: kind === "sold" ? "var(--d-accent-ink)" : "var(--d-ink)",
                        }}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-[12px] text-d-mute">
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-[3px] bg-d-accent" /> sold</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-[3px] border border-d-warn" style={{ background: "color-mix(in oklab, var(--d-warn) 30%, var(--d-panel))" }} /> held</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-[3px] border border-d-line bg-d-panel" /> free</span>
          </div>
        </Panel>
        <div className="space-y-5">
          <Panel title="Group fill" sub="Sold, held and free on every departure">
            <Bars
              height={180}
              showValues={false}
              data={deps.map((d) => ({ label: d.code, value: d.seats, note: d.title, stack: [{ name: "Sold", value: d.sold, tone: "accent" as const }, { name: "Held", value: d.held, tone: "warn" as const }, { name: "Free", value: Math.max(0, d.seats - d.sold - d.held), tone: "neutral" as const }] }))}
              onSelect={(label) => {
                const d = deps.find((x) => x.code === label);
                if (d) setPick(d.id);
              }}
              selected={dep.code}
            />
          </Panel>
          <Panel title="Fill curve, Bali BL1118" sub="Sold seats against where a good group should be">
            <AreaChart
              height={150}
              labels={["-60d", "-55", "-50", "-45", "-40", "-35", "-29d"]}
              series={[
                { name: "Sold", data: [2, 4, 6, 8, 10, 12, deps.find((d) => d.id === "BL18")?.sold ?? 14], tone: "accent" },
                { name: "Healthy curve", data: [3, 6, 9, 12, 14, 17, 19], tone: "neutral", dashed: true },
              ]}
            />
          </Panel>
        </div>
      </div>
      <Panel title="Waitlist" sub="Promote someone when a seat frees up. They get an advance link on WhatsApp.">
        <DataTable
          rows={wait}
          rowKey={(w) => w.id}
          search={(w) => `${w.name} ${w.dep} ${w.note}`}
          searchPlaceholder="Search waitlist"
          filter={{ get: (w) => deps.find((d) => d.id === w.dep)?.code ?? w.dep, options: Array.from(new Set(wait.map((w) => deps.find((d) => d.id === w.dep)?.code ?? w.dep))) }}
          onRow={(w) => setPick(w.dep)}
          columns={[
            { key: "name", label: "Name", render: (w) => <span className="font-medium">{w.name}</span>, sort: (w) => w.name },
            { key: "dep", label: "Departure", render: (w) => <span className="font-mono text-[12px]">{deps.find((d) => d.id === w.dep)?.code}</span> },
            { key: "pax", label: "Pax", align: "right", render: (w) => <span className="tnum font-mono">{w.pax}</span>, sort: (w) => w.pax },
            { key: "since", label: "Waiting since", render: (w) => <span className="text-d-mute">{w.since}</span> },
            { key: "phone", label: "Phone", render: (w) => <span className="font-mono text-[12px] text-d-mute">{w.phone}</span>, wide: true },
            { key: "note", label: "Note", render: (w) => <span className="text-d-mute">{w.note}</span>, wide: true },
            {
              key: "act",
              label: "",
              align: "right",
              render: (w) => (
                <Btn
                  size="sm"
                  variant="soft"
                  onClick={(e) => {
                    e.stopPropagation();
                    promote(w);
                  }}
                >
                  Promote
                </Btn>
              ),
            },
          ]}
        />
      </Panel>
    </div>
  );
}

/* ---------------- Hotels & vendors ---------------- */

const vendors = [
  { name: "Teesta Travels, Siliguri", kind: "Cars & Tempo Travellers", deps: "DJ1024, SK1026", rating: 4.6, payable: 118000, tone: "ok" as Tone },
  { name: "Dal Lake Cabs, Srinagar", kind: "Innovas, Gulmarg gondola tickets", deps: "KS1101", rating: 4.3, payable: 64000, tone: "ok" as Tone },
  { name: "Druk Path Agents, Phuentsholing", kind: "Bhutan permits, SDF, guide", deps: "BT1108", rating: 4.8, payable: 151200, tone: "warn" as Tone },
  { name: "Creekline Tourism DMC, Dubai", kind: "Hotels, transfers, safari", deps: "DX1112", rating: 4.4, payable: 571000, tone: "warn" as Tone },
  { name: "Nusa Journeys DMC, Bali", kind: "Villas, Penida boat, guide", deps: "BL1118", rating: 4.5, payable: 0, tone: "ok" as Tone },
  { name: "Malabar Kettuvallam Co, Alleppey", kind: "AC houseboats", deps: "KL1104", rating: 4.2, payable: 39200, tone: "ok" as Tone },
];

function HotelsTab({ blocks, setBlocks, deps }: { blocks: Block[]; setBlocks: React.Dispatch<React.SetStateAction<Block[]>>; deps: Departure[] }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<string | null>(null);
  const block = blocks.find((b) => b.id === open) ?? null;
  const code = (id: string) => deps.find((d) => d.id === id)?.code ?? id;
  const holding = blocks.filter((b) => b.state === "Holding");
  const unused = holding.reduce((a, b) => a + (b.rooms - b.used), 0);
  const soon = [...holding].filter((b) => b.releaseH > 0).sort((a, b) => a.releaseH - b.releaseH).slice(0, 3);

  function release(b: Block) {
    const spare = b.rooms - b.used;
    setBlocks((cur) => cur.map((x) => (x.id === b.id ? { ...x, rooms: x.used, state: "Released" } : x)));
    toast.success(`${spare} rooms released at ${b.hotel}`, { description: `Saves ${inr(spare * b.rate * b.nights)} in retention. Email sent to ${b.contact}.` });
    desk.log(`Released ${spare} rooms at ${b.hotel}, ${b.city}`, "ok");
  }
  function extend(b: Block) {
    setBlocks((cur) => cur.map((x) => (x.id === b.id ? { ...x, releaseH: x.releaseH + 72, state: "Extended" } : x)));
    toast.success(`Extension requested at ${b.hotel}`, { description: "3 more days asked for on WhatsApp." });
    desk.log(`Asked ${b.hotel} to extend release by 3 days`, "info");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Rooms blocked" value={blocks.reduce((a, b) => a + b.rooms, 0)} hint={`${blocks.length} hotels, 9 cities`} icon={BedDouble} />
        <Stat label="Unused in open blocks" value={unused} delta="-3" deltaGood hint="release or fill" icon={AlertTriangle} tone="warn" />
        <Stat label="Releasing in 72 h" value={holding.filter((b) => b.releaseH > 0 && b.releaseH < 72).length} hint="Gangtok and Lachung" icon={Hourglass} tone="late" />
        <Stat label="Vendor payables" value={inr(vendors.reduce((a, v) => a + v.payable, 0), { compact: true })} hint="6 partners" icon={Wallet} trend={[6.2, 7.1, 8.4, 8.9, 9.3, 9.4]} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {soon.map((b) => (
          <article key={b.id} className="desk-card desk-rise p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[14.5px] font-semibold">{b.hotel}</p>
                <p className="text-[12px] text-d-mute">
                  {b.city} · {code(b.dep)} · {b.rooms - b.used} unused
                </p>
              </div>
              <Pill tone={b.releaseH < 48 ? "late" : "warn"}>release</Pill>
            </div>
            <div className="mt-3">
              <Countdown inHours={b.releaseH} />
            </div>
            <Meter value={b.used} max={b.rooms} className="mt-3" tone={b.used / b.rooms > 0.85 ? "ok" : "warn"} />
            <div className="mt-3 flex gap-2">
              <Btn size="sm" variant="solid" onClick={() => release(b)}>
                Release {b.rooms - b.used}
              </Btn>
              <Btn size="sm" onClick={() => extend(b)}>
                Ask to extend
              </Btn>
            </div>
          </article>
        ))}
      </div>
      <Panel title="Room blocks" sub="Click a block for the rooming list and terms">
        <DataTable
          rows={blocks}
          rowKey={(b) => b.id}
          search={(b) => `${b.hotel} ${b.city} ${code(b.dep)}`}
          searchPlaceholder="Search hotel, city or group"
          filter={{ get: (b) => b.state, options: ["Holding", "Confirmed", "Extended", "Released"] }}
          onRow={(b) => setOpen(b.id)}
          bulk={[{ label: "Release unused rooms", run: (keys) => { blocks.filter((b) => keys.includes(b.id) && b.state !== "Released").forEach(release); } }]}
          columns={[
            { key: "hotel", label: "Hotel", render: (b) => <span className="font-medium">{b.hotel}</span>, sort: (b) => b.hotel },
            { key: "city", label: "City", render: (b) => <span className="text-d-mute">{b.city}</span>, sort: (b) => b.city },
            { key: "dep", label: "Group", render: (b) => <span className="font-mono text-[12px]">{code(b.dep)}</span> },
            { key: "use", label: "Used", render: (b) => <div className="flex min-w-[110px] items-center gap-2"><Meter value={b.used} max={b.rooms} tone={b.used / b.rooms > 0.85 ? "ok" : "warn"} /><span className="font-mono text-[11px] text-d-mute">{b.used}/{b.rooms}</span></div>, sort: (b) => b.used / b.rooms },
            { key: "rate", label: "Rate/night", align: "right", render: (b) => <span className="tnum font-mono">{inr(b.rate)}</span>, sort: (b) => b.rate, wide: true },
            { key: "rel", label: "Release in", render: (b) => (b.state === "Released" || b.releaseH < 0 ? <span className="text-d-mute">—</span> : <span className="text-[12px]"><Countdown compact inHours={b.releaseH} /></span>), sort: (b) => b.releaseH },
            { key: "st", label: "State", render: (b) => <Pill tone={b.state === "Confirmed" ? "ok" : b.state === "Released" ? "neutral" : b.state === "Extended" ? "info" : "warn"}>{b.state}</Pill> },
          ]}
        />
      </Panel>
      <Panel title="Transport, permit and DMC partners" sub="Who runs the ground for each group">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {vendors.map((v) => (
            <div key={v.name} className="flex items-start gap-3 rounded-[14px] border border-d-line p-3">
              <Avatar name={v.name} size={36} tone={v.tone} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-semibold">{v.name}</p>
                <p className="truncate text-[12px] text-d-mute">{v.kind}</p>
                <p className="mt-1 flex items-center justify-between text-[12px]">
                  <span className="font-mono text-d-mute">{v.deps}</span>
                  <span>★ {v.rating}</span>
                </p>
                <p className="mt-0.5 text-[12px]">{v.payable ? <span className="text-d-warn">{inr(v.payable)} payable</span> : <span className="text-d-ok">settled</span>}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Sheet
        open={!!block}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={block ? `${block.id} · ${code(block.dep)}` : ""}
        title={block?.hotel ?? ""}
        sub={block ? `${block.city} · ${block.nights} nights · contact ${block.contact}` : ""}
        footer={
          block && block.state !== "Released" ? (
            <>
              <Btn onClick={() => extend(block)}>Ask to extend</Btn>
              <Btn variant="solid" onClick={() => { release(block); setOpen(null); }}>
                Release {block.rooms - block.used} rooms
              </Btn>
            </>
          ) : (
            <Btn variant="solid" onClick={() => setOpen(null)}>Done</Btn>
          )
        }
      >
        {block && (
          <div className="space-y-5">
            <KV items={[{ k: "Rooms", v: `${block.used} used of ${block.rooms}` }, { k: "Rate", v: `${inr(block.rate)} / night, MAP` }, { k: "Block value", v: inr(block.rooms * block.rate * block.nights) }, { k: "Retention if not released", v: <span className="text-d-late">{inr((block.rooms - block.used) * block.rate * block.nights)}</span> }]} />
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Rooming list</p>
              <ul className="space-y-1 text-[13px]">
                {(() => {
                  const d = deps.find((x) => x.id === block.dep);
                  const pax = d ? paxFor(d) : [];
                  return Array.from({ length: block.used }, (_, r) => (
                    <li key={r} className="flex justify-between rounded-[8px] bg-d-sunk/70 px-3 py-1.5">
                      <span>{[pax[r * 2]?.name, pax[r * 2 + 1]?.name].filter(Boolean).join(" & ") || "Tour manager"}</span>
                      <span className="font-mono text-[11.5px] text-d-mute">{r < 2 ? "Deluxe" : "Standard"} · {r + 101}</span>
                    </li>
                  ));
                })()}
              </ul>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Visas & documents ---------------- */

function VisasTab({ docs, setDocs }: { docs: Record<string, string[]>; setDocs: React.Dispatch<React.SetStateAction<Record<string, string[]>>> }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<string | null>(null);
  const trav = travellers.find((t) => t.id === open) ?? null;
  const depCode: Record<string, string> = { DX12: "DX1112 Dubai", BL18: "BL1118 Bali", BT08: "BT1108 Bhutan" };
  const progress = (t: Traveller) => (docs[t.id]?.length ?? 0) / docSets[t.dep].length;
  const complete = travellers.filter((t) => progress(t) === 1).length;

  function toggle(t: Traveller, item: string) {
    const has = docs[t.id]?.includes(item);
    setDocs((cur) => ({ ...cur, [t.id]: has ? cur[t.id].filter((x) => x !== item) : [...(cur[t.id] ?? []), item] }));
    if (!has) desk.log(`${t.name}: ${item} received`, "ok");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Travellers abroad" value={travellers.length} hint="Dubai, Bali, Bhutan (sample of 68)" icon={Plane} />
        <Stat label="Files complete" value={`${complete} / ${travellers.length}`} delta="+4" hint="since yesterday" icon={ListChecks} tone="ok" trend={[1, 1, 2, 2, 3, 3, complete]} />
        <Stat label="Passport risks" value={travellers.filter((t) => t.expiryRisk).length} hint="validity or renewal" icon={AlertTriangle} tone="late" />
        <Stat label="Next visa cut-off" value="Dubai" hint={<Countdown compact inHours={4 * 24 + 6} />} icon={Stamp} tone="warn" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Panel title="Traveller files" sub="Click a traveller to tick documents as they arrive on WhatsApp">
          <DataTable
            rows={travellers}
            rowKey={(t) => t.id}
            search={(t) => `${t.name} ${t.passport}`}
            searchPlaceholder="Search traveller or passport"
            filter={{ get: (t) => depCode[t.dep], options: Object.values(depCode) }}
            onRow={(t) => setOpen(t.id)}
            bulk={[{ label: "Nudge on WhatsApp", run: (keys) => { toast.success(`${keys.length} travellers nudged`, { description: "Each gets a list of exactly what's missing." }); desk.log(`Docs Chaser nudged ${keys.length} travellers`); } }]}
            columns={[
              { key: "name", label: "Traveller", render: (t) => <span className="font-medium">{t.name}</span>, sort: (t) => t.name },
              { key: "dep", label: "Group", render: (t) => <span className="font-mono text-[12px]">{depCode[t.dep].split(" ")[0]}</span> },
              { key: "pp", label: "Passport", render: (t) => <span className="font-mono text-[12px]">{t.passport}</span>, wide: true },
              { key: "exp", label: "Expiry", render: (t) => <span className={t.expiryRisk ? "text-d-late" : "text-d-mute"}>{t.expiry}</span> },
              { key: "prog", label: "File", render: (t) => <div className="flex min-w-[120px] items-center gap-2"><Meter value={docs[t.id]?.length ?? 0} max={docSets[t.dep].length} tone={progress(t) === 1 ? "ok" : progress(t) > 0.6 ? "accent" : "late"} /><span className="font-mono text-[11px] text-d-mute">{docs[t.id]?.length ?? 0}/{docSets[t.dep].length}</span></div>, sort: (t) => progress(t) },
              { key: "miss", label: "Next missing", render: (t) => { const m = docSets[t.dep].find((x) => !docs[t.id]?.includes(x)); return m ? <span className="text-[12px] text-d-warn">{m}</span> : <Pill tone="ok">Ready</Pill>; }, wide: true },
            ]}
          />
        </Panel>
        <div className="space-y-5">
          <Panel title="By group" sub="Share of files complete">
            <div className="space-y-4">
              {Object.entries(depCode).map(([id, label]) => {
                const list = travellers.filter((t) => t.dep === id);
                const got = list.reduce((a, t) => a + (docs[t.id]?.length ?? 0), 0);
                const need = list.reduce((a, t) => a + docSets[t.dep].length, 0);
                return (
                  <div key={id}>
                    <p className="flex justify-between text-[13px]">
                      <span className="font-medium">{label}</span>
                      <span className="font-mono text-[12px] text-d-mute">{Math.round((got / need) * 100)}%</span>
                    </p>
                    <Meter value={got} max={need} className="mt-1.5" tone={got / need > 0.8 ? "ok" : "accent"} />
                  </div>
                );
              })}
            </div>
          </Panel>
          <Panel title="Portal status" sub="Embassies, eVisa and permit desks">
            <ul className="space-y-2.5 text-[13px]">
              {[
                { k: "UAE eVisa partner", v: "Session expired", t: "late" as Tone },
                { k: "Indonesia e-VoA", v: "Live, 2 day turnaround", t: "ok" as Tone },
                { k: "Bhutan permit desk", v: "Druk Path filing Friday", t: "info" as Tone },
                { k: "PSK Kolkata (Sayantan Dey)", v: "Slot 28 Oct", t: "warn" as Tone },
              ].map((p) => (
                <li key={p.k} className="flex items-center justify-between gap-2">
                  <span>{p.k}</span>
                  <Pill tone={p.t}>{p.v}</Pill>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
      <Sheet
        open={!!trav}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={trav ? depCode[trav.dep] : ""}
        title={trav?.name ?? ""}
        sub={trav ? `Passport ${trav.passport} · expiry ${trav.expiry}` : ""}
        footer={
          trav && (
            <Btn
              variant="solid"
              icon={MessageCircle}
              onClick={() => {
                const missing = docSets[trav.dep].filter((x) => !docs[trav.id]?.includes(x));
                toast.success("Reminder sent on WhatsApp", { description: missing.length ? `Asked for: ${missing.join(", ")}` : "Nothing missing, thanked them instead." });
                desk.log(`Docs reminder sent to ${trav.name}`);
              }}
            >
              Ask for what&apos;s missing
            </Btn>
          )
        }
      >
        {trav && (
          <div className="space-y-4">
            {trav.expiryRisk && (
              <div className="flex gap-2 rounded-[12px] border border-d-late/40 bg-d-late/5 p-3 text-[13px] text-d-late">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                Passport needs attention before travel. Most countries need 6 months validity from the return date.
              </div>
            )}
            <Meter value={docs[trav.id]?.length ?? 0} max={docSets[trav.dep].length} tone="accent" height={8} />
            <Checklist items={docSets[trav.dep].map((d) => ({ id: d, label: d, sub: docs[trav.id]?.includes(d) ? "Received on WhatsApp" : "Waiting", done: !!docs[trav.id]?.includes(d) }))} onToggle={(id) => toggle(trav, id)} />
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Payments ---------------- */

function PaymentsTab({ inst, setInst }: { inst: Instalment[]; setInst: React.Dispatch<React.SetStateAction<Instalment[]>> }) {
  const desk = useDesk();
  const [open, setOpen] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState<Set<string>>(new Set());
  const row = inst.find((i) => i.id === open) ?? null;
  const due = inst.filter((i) => i.paid < i.total);
  const bal = (i: Instalment) => i.total - i.paid;
  const bucket = (i: Instalment) => (i.paid >= i.total ? "Paid up" : i.dueIn < 0 ? "Overdue" : i.dueIn <= 7 ? "Due this week" : "Later");
  const totalDue = due.reduce((a, i) => a + bal(i), 0);
  const tcs = inst.reduce((a, i) => a + (i.tcs ?? 0), 0);

  function receive(i: Instalment) {
    const amt = Math.min(bal(i), Math.round(i.total * 0.25));
    setInst((cur) => cur.map((x) => (x.id === i.id ? { ...x, paid: x.paid + amt, dueIn: x.paid + amt >= x.total ? 99 : x.dueIn + 15, nextDue: x.paid + amt >= x.total ? "—" : x.nextDue } : x)));
    toast.success(`${inr(amt)} received from ${i.lead}`, { description: "Receipt posted to Tally and sent on WhatsApp." });
    desk.log(`${inr(amt)} received from ${i.lead}`, "ok");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Balance due from travellers" value={inr(totalDue, { compact: true })} hint={`${due.length} bookings`} icon={Wallet} tone="warn" trend={[14, 15.2, 16.1, 15.4, 14.9, 15.6, totalDue / 1e5]} />
        <Stat label="Overdue" value={inr(due.filter((i) => i.dueIn < 0).reduce((a, i) => a + bal(i), 0), { compact: true })} hint={`${due.filter((i) => i.dueIn < 0).length} travellers`} icon={AlertTriangle} tone="late" />
        <Stat label="Collected this month" value="₹38.6 L" delta="+21%" icon={IndianRupee} tone="ok" trend={[22, 26, 29, 31, 34, 36, 38.6]} />
        <Stat label="TCS collected (abroad)" value={inr(tcs, { compact: true })} hint="5% under 206C(1G), Form 27EQ" icon={Ticket} />
      </div>
      <Panel title="Instalments by due date" sub="25% to book, 50% at 30 days, balance 15 days before departure">
        <AgingBar
          buckets={(["Overdue", "Due this week", "Later", "Paid up"] as const).map((b) => ({ label: b, value: b === "Paid up" ? inst.filter((i) => bucket(i) === b).reduce((a, i) => a + i.total, 0) : inst.filter((i) => bucket(i) === b).reduce((a, i) => a + bal(i), 0), tone: ({ Overdue: "late", "Due this week": "warn", Later: "info", "Paid up": "ok" } as const)[b] }))}
          format={(v) => inr(v, { compact: true })}
        />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <Panel title="Traveller instalments" sub="Select rows to send UPI links in one go">
          <DataTable
            rows={inst}
            rowKey={(i) => i.id}
            search={(i) => `${i.id} ${i.lead} ${i.dep}`}
            searchPlaceholder="Search booking or traveller"
            filter={{ get: bucket, options: ["Overdue", "Due this week", "Later", "Paid up"] }}
            onRow={(i) => setOpen(i.id)}
            bulk={[{ label: "Send UPI links", run: (keys) => { setSent((s) => new Set([...s, ...keys])); toast.success(`${keys.length} UPI links sent`); desk.log(`${keys.length} instalment links sent on WhatsApp`); } }]}
            columns={[
              { key: "id", label: "Booking", render: (i) => <span className="font-mono text-[12px]">{i.id}</span> },
              { key: "lead", label: "Lead traveller", render: (i) => <span className="font-medium">{i.lead}</span>, sort: (i) => i.lead },
              { key: "paid", label: "Paid", render: (i) => <div className="flex min-w-[110px] items-center gap-2"><Meter value={i.paid} max={i.total} tone={i.paid >= i.total ? "ok" : i.dueIn < 0 ? "late" : "accent"} /><span className="font-mono text-[11px] text-d-mute">{Math.round((i.paid / i.total) * 100)}%</span></div>, sort: (i) => i.paid / i.total },
              { key: "bal", label: "Balance", align: "right", render: (i) => <span className="tnum font-mono">{bal(i) ? inr(bal(i)) : "—"}</span>, sort: bal },
              { key: "due", label: "Next due", render: (i) => <span className="font-mono text-[12px]" style={{ color: i.paid < i.total && i.dueIn < 0 ? "var(--d-late)" : undefined }}>{i.nextDue}</span>, sort: (i) => i.dueIn },
              { key: "mode", label: "Mode", render: (i) => <span className="text-d-mute">{i.mode}</span>, wide: true },
              { key: "st", label: "", render: (i) => (sent.has(i.id) ? <Pill tone="info">Link sent</Pill> : <Pill tone={i.paid >= i.total ? "ok" : i.dueIn < 0 ? "late" : "neutral"}>{bucket(i)}</Pill>) },
            ]}
          />
        </Panel>
        <Panel title="Cash in and out" sub="Next 8 weeks, ₹ lakh">
          <AreaChart
            height={330}
            labels={["W43", "W44", "W45", "W46", "W47", "W48", "W49", "W50"]}
            format={(v) => `₹${v} L`}
            series={[
              { name: "From travellers", data: [6.1, 9.4, 11.2, 8.6, 7.9, 5.2, 4.1, 6.8], tone: "ok" },
              { name: "To vendors", data: [13.9, 7.2, 9.8, 12.4, 6.1, 4.4, 3.2, 5.5], tone: "late" },
            ]}
          />
        </Panel>
      </div>
      <Panel icon={Hotel} title="Vendor payments waiting on Debashis" sub="Airline, DMC, hotel, transport and permits. Approved payments go to Tally and the bank file." action={<Pill tone="warn" mono>5 · {inr(payables.reduce((a, p) => a + p.amount, 0), { compact: true })}</Pill>}>
        <ApprovalQueue items={payables.map((p) => ({ id: p.id, title: p.title, sub: p.sub, amount: inr(p.amount), meta: p.meta }))} approveLabel="Pay" onDecide={(id, d) => d && desk.log(`${payables.find((p) => p.id === id)?.title}: ${d}`, d === "approved" ? "ok" : "warn")} />
      </Panel>
      <Sheet
        open={!!row}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={row?.id}
        title={row?.lead ?? ""}
        sub={row ? `${seedDeps.find((d) => d.id === row.dep)?.title} · ${inr(row.total)} total` : ""}
        footer={
          row && row.paid < row.total ? (
            <>
              <Btn icon={Send} onClick={() => { setSent((s) => new Set(s).add(row.id)); toast.success("UPI link sent", { description: row.lead }); desk.log(`UPI link sent to ${row.lead}`); }}>
                Send UPI link
              </Btn>
              <Btn variant="solid" onClick={() => receive(row)}>
                Mark next instalment received
              </Btn>
            </>
          ) : (
            <Pill tone="ok">Paid in full</Pill>
          )
        }
      >
        {row && (
          <div className="space-y-5">
            <KV items={[{ k: "Paid", v: inr(row.paid) }, { k: "Balance", v: inr(bal(row)) }, { k: "Mode", v: row.mode }, { k: "TCS", v: row.tcs ? inr(row.tcs) : "Not applicable" }]} />
            <ol className="space-y-2">
              {[
                { l: "Advance, 25%", a: row.total * 0.25 },
                { l: "Second, 50% at T-30", a: row.total * 0.5 },
                { l: "Balance at T-15", a: row.total * 0.25 },
              ].map((s, k, arr) => {
                const upto = arr.slice(0, k + 1).reduce((a, x) => a + x.a, 0);
                const done = row.paid >= upto - 1;
                return (
                  <li key={s.l} className="flex items-center gap-3 rounded-[12px] border border-d-line px-3 py-2.5">
                    <span className={`h-3 w-3 rounded-full ${done ? "bg-d-ok" : "border-2 border-d-line"}`} />
                    <span className="flex-1 text-[13.5px]">{s.l}</span>
                    <span className="tnum font-mono text-[12.5px]">{inr(s.a)}</span>
                    <Pill tone={done ? "ok" : "neutral"}>{done ? "Received" : "Pending"}</Pill>
                  </li>
                );
              })}
            </ol>
            <div className="rounded-[14px] bg-[#e7f6e9] p-4 text-[13.5px] leading-relaxed text-[#1d3b22]">
              Namaskar {row.lead.split(" ")[0]} ji, a gentle reminder from Hooghly Holidays. Your next instalment of {inr(Math.min(bal(row), row.total * 0.25))} for {seedDeps.find((d) => d.id === row.dep)?.title} is due on {row.nextDue}. Pay by UPI on the link below. Thank you! — Priyanka, Accounts
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
