"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  Briefcase,
  CalendarRange,
  CircleDollarSign,
  Clapperboard,
  Clock3,
  FileText,
  Flame,
  Gauge as GaugeIcon,
  HeartPulse,
  Image as ImageIcon,
  IndianRupee,
  Lightbulb,
  Mail,
  Megaphone,
  MessageCircle,
  Pause,
  Play,
  Plug,
  Plus,
  Presentation,
  Rocket,
  Send,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { DeskShell, useDesk } from "../shell";
import { AreaChart, Bars, Donut, HBars, HeatGrid } from "../charts";
import { AgingBar, ApprovalQueue, Board, Countdown, DataTable } from "../data";
import { AgentsModule, ConnectionsModule, IndependenceModule, PeopleModule } from "../common";
import { Avatar, Btn, Field, inputClass, inr, KV, Meter, Modal, Panel, Pill, Segmented, Sheet, Stat } from "../ui";
import { useDrift, useTicker } from "../hooks";
import type { DeskConfig, DeskModule, IndependenceData, Integration, TeamMember, Tone, WorkforceAgent } from "../types";

/* ============================================================
   Data — Andheri Growth Studio, Mumbai. Fictional performance and
   social agency with 22 retainer clients. Today is Tue 20 Oct 2026.
   Content week runs Mon 19 – Sun 25 Oct (index 0–6, today = 1).
   ============================================================ */

type Client = {
  id: string;
  name: string;
  short: string;
  category: string;
  area: string;
  mrr: number;
  am: string;
  services: string[];
  budget: number;
  spend: number;
  pacing: number;
  kpi: string;
  target: number;
  actual: number;
  sentiment: number;
  lastMsg: string;
  renewal: number;
  lastReport: string;
  tenure: number;
  hoursUsed: number;
  hoursAllowed: number;
  overdue: number;
};

const C = (
  id: string,
  name: string,
  short: string,
  category: string,
  area: string,
  mrr: number,
  am: string,
  services: string[],
  budget: number,
  pacing: number,
  kpi: string,
  target: number,
  actual: number,
  sentiment: number,
  lastMsg: string,
  renewal: number,
  lastReport: string,
  tenure: number,
  hoursUsed: number,
  overdue = 0,
): Client => ({ id, name, short, category, area, mrr, am, services, budget, spend: Math.round(budget * 0.63 * (pacing / 100)), pacing, kpi, target, actual, sentiment, lastMsg, renewal, lastReport, tenure, hoursUsed, hoursAllowed: Math.round(mrr / 1800), overdue });

const CLIENTS: Client[] = [
  C("kurla-kicks", "Kurla Kicks", "Kurla Kicks", "Sneaker D2C", "Kurla", 120000, "Zoya", ["Meta ads", "Google Shopping", "Creatives"], 900000, 131, "ROAS", 3.2, 2.1, 38, "\"ROAS is 2.1 for the second week. We need to talk about this.\"", 19, "12 Oct", 14, 84),
  C("thane-realty", "Thane Realty Partners", "Thane Realty", "Real estate", "Thane", 140000, "Aarav", ["Meta lead ads", "Google Search", "Landing pages"], 1200000, 72, "Site-visit leads", 420, 236, 52, "\"Leads are fine but sales says half don't pick up.\"", 33, "14 Oct", 22, 71),
  C("ledgerloop", "LedgerLoop (SaaS)", "LedgerLoop", "B2B SaaS", "Santacruz", 180000, "Aarav", ["LinkedIn ads", "Google Search", "SEO"], 800000, 104, "Demo bookings", 90, 61, 61, "\"Can we see pipeline, not just MQLs, in the next report?\"", 41, "15 Oct", 9, 118),
  C("colaba-brew", "Colaba Craft Brewery", "Colaba Brew", "F&B", "Colaba", 110000, "Zoya", ["Instagram", "Meta ads", "Influencers"], 350000, 96, "Table bookings", 1400, 1090, 66, "\"Loved the Oktoberfest reel. Diwali plan?\"", 12, "10 Oct", 18, 64),
  C("powai-prep", "Powai Prep Academy", "Powai Prep", "Education", "Powai", 95000, "Kabir", ["Meta lead ads", "YouTube"], 600000, 118, "Counselling leads", 900, 640, 64, "\"Leads are from outside Mumbai again.\"", 58, "13 Oct", 11, 58, 21),
  C("worli-wealth", "Worli Wealth Advisors", "Worli Wealth", "Financial advisory", "Worli", 150000, "Zoya", ["LinkedIn ads", "Google Search", "Content"], 500000, 99, "Qualified meetings", 40, 37, 82, "\"Good month. Pls share the webinar numbers.\"", 96, "16 Oct", 26, 79),
  C("ghatkopar-gold", "Ghatkopar Gold & Diamonds", "Ghatkopar Gold", "Jewellery", "Ghatkopar", 130000, "Kabir", ["Meta ads", "Google Search", "WhatsApp"], 700000, 88, "Store walk-ins", 620, 590, 79, "\"Dhanteras booking ad ready? Want it live by 1 Nov.\"", 74, "14 Oct", 30, 69),
  C("bandra-bites", "Bandra Bites Cloud Kitchen", "Bandra Bites", "Cloud kitchen", "Bandra", 85000, "Kabir", ["Meta ads", "Swiggy & Zomato ads"], 300000, 109, "Orders", 5200, 5480, 88, "\"Weekend orders are up! 🙌\"", 145, "13 Oct", 16, 41),
  C("lokhandwala-dental", "Lokhandwala Smiles Dental", "Lokhandwala Dental", "Healthcare", "Andheri W", 65000, "Priya", ["Google Search", "GMB", "Instagram"], 180000, 101, "Appointment calls", 260, 281, 91, "\"Front desk is busy, good problem.\"", 210, "11 Oct", 34, 33),
  C("malad-motors", "Malad Motors", "Malad Motors", "Used cars", "Malad", 75000, "Kabir", ["Meta lead ads", "OLX boosts"], 400000, 64, "Test-drive leads", 300, 212, 63, "\"Budget paused 3 days by your side?\"", 27, "12 Oct", 8, 47, 34),
  C("navi-interiors", "Navi Mumbai Interiors Co", "NM Interiors", "Interiors", "Vashi", 80000, "Aarav", ["Meta ads", "Pinterest", "Landing pages"], 350000, 93, "Design consults", 110, 104, 74, "\"Can we add a Diwali offer banner?\"", 88, "15 Oct", 12, 44),
  C("dadar-silk", "Dadar Silk House", "Dadar Silk", "Saree retail", "Dadar", 70000, "Priya", ["Instagram", "Meta ads", "WhatsApp catalogue"], 260000, 102, "WhatsApp enquiries", 1500, 1720, 86, "\"Paithani reel went viral in our family group 😄\"", 132, "10 Oct", 20, 39),
  C("saki-steel", "Saki Naka Steel Traders", "Saki Steel", "B2B trading", "Saki Naka", 90000, "Aarav", ["LinkedIn ads", "IndiaMART", "Google Search"], 250000, 85, "RFQs", 140, 118, 69, "\"RFQs ok. Quality from IndiaMART poor.\"", 64, "14 Oct", 15, 55),
  C("juhu-ayurveda", "Juhu Ayurveda Spa", "Juhu Spa", "Wellness", "Juhu", 55000, "Priya", ["Instagram", "Google Search", "GMB"], 160000, 97, "Bookings", 380, 352, 77, "\"Can we push couples packages for Diwali week?\"", 103, "11 Oct", 19, 31),
  C("versova-yoga", "Versova Yoga Retreats", "Versova Yoga", "Travel & wellness", "Versova", 60000, "Zoya", ["Meta ads", "YouTube", "Email"], 220000, 112, "Retreat bookings", 60, 44, 58, "\"Rishikesh batch only half full.\"", 22, "13 Oct", 7, 42),
  C("borivali-bridal", "Borivali Bridal Studio", "Borivali Bridal", "Bridal fashion", "Borivali", 65000, "Priya", ["Instagram", "Meta ads", "Influencers"], 240000, 95, "Trial bookings", 180, 171, 84, "\"Wedding season prep looks great!\"", 159, "12 Oct", 13, 37),
  C("goregaon-fit", "Goregaon Fit Studio", "Goregaon Fit", "Fitness", "Goregaon", 50000, "Kabir", ["Meta lead ads", "Instagram"], 150000, 103, "Trial sign-ups", 240, 226, 72, "\"Trainers asking for more reels with them.\"", 51, "10 Oct", 10, 30),
  C("vile-parle-sweets", "Parle Mithai Ghar", "Parle Mithai", "Sweets & namkeen", "Vile Parle", 45000, "Priya", ["Instagram", "Google Search", "GMB"], 180000, 106, "Diwali box orders", 900, 410, 80, "\"Corporate hamper enquiries started.\"", 118, "15 Oct", 28, 28),
  C("chembur-child", "Chembur Child Clinic", "Chembur Clinic", "Paediatrics", "Chembur", 40000, "Priya", ["Google Search", "GMB"], 90000, 98, "Appointment calls", 150, 162, 90, "\"Thank you team.\"", 187, "11 Oct", 24, 21),
  C("mulund-pets", "Mulund Pet Clinic", "Mulund Pets", "Veterinary", "Mulund", 35000, "Kabir", ["Google Search", "Instagram"], 80000, 91, "Appointment calls", 120, 109, 75, "\"Grooming slots full on weekends.\"", 79, "12 Oct", 6, 19),
  C("kandivali-kids", "Kandivali Kids Play School", "Kandivali Kids", "Pre-school", "Kandivali", 45000, "Zoya", ["Meta lead ads", "GMB"], 140000, 79, "Admission enquiries", 160, 98, 55, "\"Admissions open in Dec. Why are leads low?\"", 37, "10 Oct", 5, 34, 12),
  C("andheri-arena", "Andheri Arena Turf", "Andheri Arena", "Sports turf", "Andheri E", 30000, "Kabir", ["Instagram", "Google Search"], 60000, 100, "Slot bookings", 700, 744, 85, "\"Night slots sold out on Friday.\"", 66, "13 Oct", 4, 15),
];

const resultPct = (c: Client) => Math.round((c.actual / c.target) * 100);
function riskOf(c: Client) {
  const pace = Math.abs(c.pacing - 100) * 0.55;
  const res = Math.max(0, 100 - resultPct(c)) * 0.8;
  const mood = Math.max(0, 75 - c.sentiment) * 0.9;
  const renew = c.renewal < 45 ? 12 : 0;
  const due = c.overdue ? 8 : 0;
  return Math.round(pace + res + mood + renew + due);
}
const healthOf = (c: Client) => Math.max(8, Math.min(99, 100 - riskOf(c)));
const toneOfHealth = (h: number): Tone => (h < 45 ? "late" : h < 70 ? "warn" : "ok");

type Campaign = { id: string; client: string; name: string; platform: "Meta" | "Google Search" | "Performance Max" | "LinkedIn" | "YouTube" | "Swiggy"; daily: number; spend: number; results: number; cpr: number; target: number; status: "Active" | "Learning" | "Paused" | "Limited"; trend: number[] };
const SEED_CAMPAIGNS: Campaign[] = [
  { id: "CMP-301", client: "kurla-kicks", name: "Advantage+ shopping · Diwali drop", platform: "Meta", daily: 18000, spend: 342000, results: 2.1, cpr: 0, target: 3.2, status: "Active", trend: [3.4, 3.1, 2.8, 2.5, 2.3, 2.2, 2.1] },
  { id: "CMP-302", client: "kurla-kicks", name: "PMax · Jordans & retros", platform: "Performance Max", daily: 9000, spend: 168000, results: 2.9, cpr: 0, target: 3.2, status: "Active", trend: [2.4, 2.6, 2.7, 2.9, 2.8, 2.9, 2.9] },
  { id: "CMP-311", client: "thane-realty", name: "Lead form · 2 BHK Ghodbunder", platform: "Meta", daily: 14000, spend: 260000, results: 162, cpr: 1605, target: 1400, status: "Active", trend: [1320, 1380, 1450, 1510, 1560, 1590, 1605] },
  { id: "CMP-312", client: "thane-realty", name: "Search · 'flats in Thane west'", platform: "Google Search", daily: 8000, spend: 120000, results: 74, cpr: 1622, target: 1800, status: "Limited", trend: [1900, 1850, 1780, 1700, 1660, 1640, 1622] },
  { id: "CMP-321", client: "ledgerloop", name: "LinkedIn · CFOs 50–500 employees", platform: "LinkedIn", daily: 12000, spend: 246000, results: 38, cpr: 6474, target: 6000, status: "Active", trend: [7100, 6900, 6800, 6700, 6600, 6500, 6474] },
  { id: "CMP-322", client: "ledgerloop", name: "Search · 'GST reconciliation software'", platform: "Google Search", daily: 6000, spend: 118000, results: 23, cpr: 5130, target: 6000, status: "Active", trend: [5900, 5700, 5500, 5400, 5300, 5200, 5130] },
  { id: "CMP-331", client: "colaba-brew", name: "Reels · Oktoberfest weekends", platform: "Meta", daily: 5000, spend: 94000, results: 1090, cpr: 86, target: 90, status: "Active", trend: [110, 104, 98, 94, 90, 88, 86] },
  { id: "CMP-341", client: "powai-prep", name: "Lead form · JEE 2028 foundation", platform: "Meta", daily: 11000, spend: 224000, results: 640, cpr: 350, target: 280, status: "Active", trend: [260, 275, 300, 320, 334, 344, 350] },
  { id: "CMP-342", client: "powai-prep", name: "YouTube · topper testimonials", platform: "YouTube", daily: 4000, spend: 72000, results: 41000, cpr: 1.76, target: 2, status: "Learning", trend: [2.4, 2.2, 2.0, 1.9, 1.8, 1.8, 1.76] },
  { id: "CMP-351", client: "worli-wealth", name: "LinkedIn · HNI webinar sign-ups", platform: "LinkedIn", daily: 7000, spend: 138000, results: 37, cpr: 3730, target: 4000, status: "Active", trend: [4300, 4100, 3990, 3900, 3820, 3760, 3730] },
  { id: "CMP-361", client: "ghatkopar-gold", name: "Store visits · Dhanteras pre-booking", platform: "Meta", daily: 12000, spend: 196000, results: 590, cpr: 332, target: 350, status: "Active", trend: [380, 372, 360, 350, 344, 338, 332] },
  { id: "CMP-371", client: "bandra-bites", name: "Swiggy · Biryani carousel", platform: "Swiggy", daily: 4500, spend: 92000, results: 5480, cpr: 17, target: 20, status: "Active", trend: [22, 21, 20, 19, 18, 17, 17] },
  { id: "CMP-381", client: "malad-motors", name: "Lead form · certified SUVs", platform: "Meta", daily: 8000, spend: 102000, results: 212, cpr: 481, target: 420, status: "Paused", trend: [400, 410, 430, 455, 470, 480, 481] },
  { id: "CMP-391", client: "versova-yoga", name: "Rishikesh retreat · Nov batch", platform: "Meta", daily: 6000, spend: 112000, results: 44, cpr: 2545, target: 1800, status: "Active", trend: [1700, 1900, 2100, 2250, 2400, 2500, 2545] },
  { id: "CMP-401", client: "kandivali-kids", name: "Admissions 2027 · lead form", platform: "Meta", daily: 3500, spend: 49000, results: 98, cpr: 500, target: 350, status: "Learning", trend: [380, 410, 440, 470, 485, 495, 500] },
  { id: "CMP-411", client: "vile-parle-sweets", name: "Search · 'diwali sweets box mumbai'", platform: "Google Search", daily: 5000, spend: 56000, results: 410, cpr: 137, target: 150, status: "Active", trend: [180, 170, 160, 152, 146, 140, 137] },
];
const isRoas = (c: Campaign) => c.client === "kurla-kicks";
const clientOf = (id: string) => CLIENTS.find((c) => c.id === id)!;

type Post = { id: string; client: string; title: string; format: "Reel" | "Carousel" | "Story" | "Static" | "Short" | "Blog"; day: number; status: "Draft" | "Client review" | "Approved" | "Scheduled" | "Posted"; owner: string };
const WEEK = ["Mon 19", "Tue 20", "Wed 21", "Thu 22", "Fri 23", "Sat 24", "Sun 25"];
const SEED_POSTS: Post[] = [
  { id: "P-01", client: "colaba-brew", title: "Oktoberfest last weekend · reel", format: "Reel", day: 0, status: "Posted", owner: "Rehan" },
  { id: "P-02", client: "dadar-silk", title: "Paithani drape in 60 seconds", format: "Reel", day: 0, status: "Posted", owner: "Ishita" },
  { id: "P-03", client: "ghatkopar-gold", title: "Dhanteras pre-booking: 0% making", format: "Carousel", day: 1, status: "Client review", owner: "Rehan" },
  { id: "P-04", client: "lokhandwala-dental", title: "Invisalign myths, 5 slides", format: "Carousel", day: 1, status: "Scheduled", owner: "Priya" },
  { id: "P-05", client: "bandra-bites", title: "Biryani Tuesday poll", format: "Story", day: 1, status: "Scheduled", owner: "Priya" },
  { id: "P-06", client: "kurla-kicks", title: "Jordan 4 retro unboxing", format: "Reel", day: 2, status: "Draft", owner: "Rehan" },
  { id: "P-07", client: "worli-wealth", title: "Gold vs SGB before Diwali", format: "Blog", day: 2, status: "Client review", owner: "Ishita" },
  { id: "P-08", client: "juhu-ayurveda", title: "Couples abhyanga, Diwali week", format: "Static", day: 2, status: "Approved", owner: "Rehan" },
  { id: "P-09", client: "vile-parle-sweets", title: "Corporate hamper lookbook", format: "Carousel", day: 3, status: "Approved", owner: "Ishita" },
  { id: "P-10", client: "goregaon-fit", title: "Trainer Rohit's 20-min HIIT", format: "Reel", day: 3, status: "Draft", owner: "Rehan" },
  { id: "P-11", client: "powai-prep", title: "Topper talk: AIR 412", format: "Short", day: 3, status: "Client review", owner: "Ishita" },
  { id: "P-12", client: "borivali-bridal", title: "Bride of the week: Sneha", format: "Reel", day: 4, status: "Approved", owner: "Priya" },
  { id: "P-13", client: "ledgerloop", title: "GSTR-2B reconciliation in 4 steps", format: "Carousel", day: 4, status: "Draft", owner: "Ishita" },
  { id: "P-14", client: "andheri-arena", title: "Friday night league highlights", format: "Reel", day: 4, status: "Scheduled", owner: "Priya" },
  { id: "P-15", client: "colaba-brew", title: "Diwali pairing menu teaser", format: "Static", day: 5, status: "Draft", owner: "Rehan" },
  { id: "P-16", client: "navi-interiors", title: "2 BHK makeover before/after", format: "Reel", day: 5, status: "Client review", owner: "Rehan" },
  { id: "P-17", client: "dadar-silk", title: "Diwali saree edit · WhatsApp catalogue", format: "Carousel", day: 6, status: "Approved", owner: "Ishita" },
  { id: "P-18", client: "mulund-pets", title: "Firecrackers & pets: 5 tips", format: "Static", day: 6, status: "Scheduled", owner: "Priya" },
];

type Prospect = { id: string; name: string; category: string; mrr: number; source: string; owner: string; stage: "lead" | "discovery" | "proposal" | "pitch" | "won"; next: string; prob: number };
const SEED_PROSPECTS: Prospect[] = [
  { id: "NB-41", name: "Marine Drive Hospitality Group", category: "Hotels, 3 properties", mrr: 220000, source: "Referral · Colaba Brew", owner: "Tanvi", stage: "pitch", next: "Pitch deck, Thu 4 PM", prob: 60 },
  { id: "NB-42", name: "Sion Diagnostics", category: "Pathology labs, 11 centres", mrr: 120000, source: "Inbound · website", owner: "Aarav", stage: "proposal", next: "Proposal sent 16 Oct, follow up", prob: 40 },
  { id: "NB-43", name: "Kalyan Kitchenware", category: "D2C cookware", mrr: 90000, source: "LinkedIn", owner: "Zoya", stage: "discovery", next: "Discovery call Wed 11 AM", prob: 25 },
  { id: "NB-44", name: "Wadala EV Scooters", category: "EV dealership", mrr: 75000, source: "Inbound · Instagram", owner: "Kabir", stage: "lead", next: "Qualify budget", prob: 10 },
  { id: "NB-45", name: "Bhiwandi Packaging Co", category: "B2B manufacturing", mrr: 80000, source: "Referral · Saki Steel", owner: "Aarav", stage: "discovery", next: "Plant visit Fri", prob: 30 },
  { id: "NB-46", name: "Matunga Music School", category: "Education", mrr: 40000, source: "Clutch", owner: "Priya", stage: "lead", next: "Send case study", prob: 10 },
  { id: "NB-47", name: "Fort Legal LLP", category: "Law firm", mrr: 100000, source: "Referral · Worli Wealth", owner: "Tanvi", stage: "proposal", next: "Revised scope, no paid ads", prob: 45 },
  { id: "NB-48", name: "Juhu Beach Cafe Chain", category: "F&B, 4 outlets", mrr: 70000, source: "Inbound · website", owner: "Zoya", stage: "won", next: "Kick-off Mon 26", prob: 100 },
  { id: "NB-49", name: "Goregaon Co-working", category: "Workspaces", mrr: 60000, source: "LinkedIn", owner: "Kabir", stage: "lead", next: "Intro call", prob: 10 },
  { id: "NB-50", name: "Bhayander Dental Chain", category: "Healthcare, 5 clinics", mrr: 85000, source: "Referral · Lokhandwala Dental", owner: "Priya", stage: "pitch", next: "Pitch Mon 26, 3 PM", prob: 55 },
];

type Report = { id: string; client: string; period: string; status: "Drafted" | "Needs review" | "Approved" | "Sent"; highlight: string; flag?: string; kpiDelta: number };
const SEED_REPORTS: Report[] = [
  { id: "R-1", client: "kurla-kicks", period: "Week 42", status: "Needs review", highlight: "ROAS 2.1 vs 3.2 target; CPMs up 38% in Diwali auction", flag: "Client sentiment low; Tanvi to call before sending", kpiDelta: -34 },
  { id: "R-2", client: "thane-realty", period: "Week 42", status: "Needs review", highlight: "236 leads, 56% of target; 41% not reachable on first call", flag: "Recommend WhatsApp-first lead form", kpiDelta: -18 },
  { id: "R-3", client: "worli-wealth", period: "Week 42", status: "Drafted", highlight: "37 qualified meetings, webinar 212 sign-ups", kpiDelta: 9 },
  { id: "R-4", client: "bandra-bites", period: "Week 42", status: "Drafted", highlight: "Orders +11% WoW, cost per order ₹17", kpiDelta: 11 },
  { id: "R-5", client: "dadar-silk", period: "Week 42", status: "Approved", highlight: "Paithani reel 1.2 L views, 1,720 WhatsApp enquiries", kpiDelta: 15 },
  { id: "R-6", client: "colaba-brew", period: "Week 42", status: "Drafted", highlight: "1,090 table bookings, ₹86 per booking", kpiDelta: 4 },
  { id: "R-7", client: "ledgerloop", period: "Week 42", status: "Needs review", highlight: "61 demos; client asked for pipeline value from HubSpot", flag: "HubSpot sync missing deal stages", kpiDelta: -6 },
  { id: "R-8", client: "ghatkopar-gold", period: "Week 42", status: "Approved", highlight: "590 walk-ins attributed; Dhanteras pre-bookings ₹38 L", kpiDelta: 7 },
  { id: "R-9", client: "lokhandwala-dental", period: "Week 42", status: "Sent", highlight: "281 calls, 108% of target", kpiDelta: 8 },
  { id: "R-10", client: "powai-prep", period: "Week 42", status: "Drafted", highlight: "640 leads but 38% outside Mumbai; geo fix applied Sunday", flag: "Explain geo leak honestly", kpiDelta: -12 },
  { id: "R-11", client: "malad-motors", period: "Week 42", status: "Needs review", highlight: "Campaign paused 3 days over invoice; leads −29%", flag: "Billing pause must be explained", kpiDelta: -29 },
  { id: "R-12", client: "chembur-child", period: "Week 42", status: "Sent", highlight: "162 calls, best week this year", kpiDelta: 6 },
  { id: "R-13", client: "juhu-ayurveda", period: "Week 42", status: "Drafted", highlight: "352 bookings; couples package CTR 3.4%", kpiDelta: 2 },
  { id: "R-14", client: "versova-yoga", period: "Week 42", status: "Drafted", highlight: "44 bookings of 60; cost per booking up 41%", flag: "Suggest a 10% early-bird", kpiDelta: -22 },
];

const team: TeamMember[] = [
  { name: "Tanvi Kulkarni", role: "Founder & strategy", status: "Busy", load: 93, focus: "Kurla Kicks rescue call and Marine Drive pitch", tasks: [{ title: "Call Kurla Kicks founder", due: "11:30" }, { title: "Marine Drive pitch deck review", due: "4:00" }, { title: "Approve October invoices", due: "6:00" }], week: [1, 1, 1, 1, 1, 1], since: "2018" },
  { name: "Aarav Shah", role: "Head of performance", status: "Busy", load: 89, focus: "Thane Realty lead quality; LedgerLoop pipeline report", tasks: [{ title: "WhatsApp-first lead form for Thane", due: "1:00" }, { title: "HubSpot deal-stage mapping", due: "Wed" }, { title: "Sion Diagnostics proposal follow-up", due: "5:00", done: true }], week: [1, 1, 1, 1, 1, 0], since: "2019" },
  { name: "Zoya Merchant", role: "Account director", status: "In field", load: 84, focus: "At Colaba Brew for the Diwali menu shoot", tasks: [{ title: "Colaba shoot, 6 reels", due: "2:00" }, { title: "Versova early-bird approval", due: "6:00" }], week: [1, 1, 1, 1, 1, 1], since: "2020" },
  { name: "Kabir Rao", role: "Performance executive", status: "On floor", load: 97, focus: "11 accounts, Malad Motors restart, Powai geo fix", tasks: [{ title: "Restart Malad Motors after payment", due: "now" }, { title: "Powai Prep geo exclusions", due: "12:00", done: true }, { title: "Ghatkopar Dhanteras ads to review", due: "3:00" }], week: [1, 1, 1, 1, 1, 1], since: "2022" },
  { name: "Ishita Nair", role: "Content lead", status: "On floor", load: 78, focus: "Diwali calendars for 9 clients", tasks: [{ title: "Worli Wealth blog to client", due: "11:00", done: true }, { title: "LedgerLoop carousel copy", due: "Thu" }], week: [1, 1, 1, 1, 0, 1], since: "2021" },
  { name: "Rehan Sheikh", role: "Designer & video editor", status: "Busy", load: 101, focus: "6 reels in edit; Kurla unboxing due tomorrow", tasks: [{ title: "Kurla Kicks unboxing edit", due: "Wed" }, { title: "Ghatkopar carousel revisions", due: "1:00" }, { title: "NM Interiors before/after", due: "Sat" }], week: [1, 1, 1, 1, 1, 1], since: "2021" },
  { name: "Priya Iyer", role: "Social media executive", status: "On floor", load: 72, focus: "Community replies and scheduling for 8 handles", tasks: [{ title: "Schedule Thursday posts", due: "5:00" }, { title: "GMB replies, 3 clinics", due: "today" }], week: [1, 1, 1, 1, 1, 0], since: "2023" },
  { name: "Meera Pillai", role: "Finance & operations", status: "Off", load: 40, focus: "Half day; October invoices queued for 6 PM", tasks: [{ title: "Chase Malad Motors ₹88.5k", due: "tomorrow" }, { title: "GSTR-1 for September", due: "Fri" }], week: [1, 1, 1, 1, 1, 0], since: "2022" },
];

const agents: WorkforceAgent[] = [
  { name: "Pacing Guard", role: "Watches every ad account's spend against its monthly plan", icon: GaugeIcon, status: "Needs you", runsToday: 26, hoursSaved: 6, accuracy: 94, last: "2 min ago", skills: ["Meta", "Google Ads", "LinkedIn", "Budgets"], schedule: "Every 30 min, 7 AM – midnight", inbox: [{ title: "Kurla Kicks is 31% ahead of pace", detail: "At this rate the October budget runs out on 24 Oct. Cut Advantage+ by 25% and move ₹3k/day to PMax?" }], log: ["Thane Realty 28% behind pace: Search limited by budget", "Paused 3 ad sets with frequency above 4", "Kurla Kicks overspend flagged"] },
  { name: "Report Writer", role: "Drafts weekly client reports from live data", icon: FileText, status: "Running", runsToday: 14, hoursSaved: 9, accuracy: 90, last: "20 min ago", skills: ["GA4", "Meta", "Google Ads", "Plain-English summaries"], schedule: "Mondays 7 AM, monthly on the 2nd", log: ["14 Week 42 drafts ready", "Flagged 5 for review: bad weeks need a human", "Added webinar numbers to Worli Wealth"] },
  { name: "Sentiment Reader", role: "Reads client WhatsApp groups and emails for mood", icon: HeartPulse, status: "Needs you", runsToday: 31, hoursSaved: 3, accuracy: 86, last: "6 min ago", skills: ["WhatsApp", "Gmail", "Tone"], schedule: "On every client message", inbox: [{ title: "Kurla Kicks founder sounds ready to leave", detail: "\"We need to talk about this\" plus two unanswered messages. Suggest Tanvi calls today." }], log: ["Kurla Kicks sentiment 38, down 21 in a week", "Dadar Silk 86, very happy", "Kandivali Kids asked 'why are leads low' twice"] },
  { name: "Creative Scout", role: "Finds fatigued ads and drafts new hooks", icon: Lightbulb, status: "Running", runsToday: 8, hoursSaved: 4, accuracy: 82, last: "1 h ago", skills: ["Ad library", "Frequency", "Hooks"], schedule: "Daily 9 AM", log: ["5 ads with CTR down 30%+", "Wrote 12 Diwali hooks for Ghatkopar Gold", "Found a competitor offer at Kurla's price point"] },
  { name: "Billing Clerk", role: "Raises retainer invoices and chases dues", icon: IndianRupee, status: "Running", runsToday: 3, hoursSaved: 3.5, accuracy: 97, last: "3 h ago", skills: ["Zoho Books", "GST", "UPI links"], schedule: "1st and 15th, reminders daily", log: ["3 invoices overdue, ₹2.39 L", "Malad Motors promised UPI today", "Drafted 22 November invoices"] },
  { name: "Lead Scorer", role: "Qualifies inbound new-business enquiries", icon: Target, status: "Idle", runsToday: 2, hoursSaved: 1, accuracy: 88, last: "Yesterday", skills: ["Website forms", "LinkedIn", "Budget check"], schedule: "On every enquiry", log: ["Wadala EV: ₹75k fit, needs budget call", "Rejected 2 enquiries under ₹25k", "Matunga Music: send case study"] },
];

const independence: IndependenceData = {
  score: 47,
  history: [30, 33, 36, 38, 41, 44, 47],
  quote: "Clients don't leave because of ROAS. They leave because nobody called them before the bad report.",
  pillars: [
    { name: "Client relationships", score: 39, note: "Five clients only escalate to Tanvi. AMs wait for her to call first on bad weeks.", fixes: [{ title: "AM owns the bad-week call", gain: 4 }, { title: "Sentiment alerts to AMs", gain: 2 }] },
    { name: "Campaign delivery", score: 63, note: "Aarav and Kabir run accounts well; pacing is checked by the agent, not by memory.", fixes: [{ title: "Budget rules per client", gain: 2 }] },
    { name: "Content & creative", score: 55, note: "Rehan is the only editor; anything video waits on him.", fixes: [{ title: "Freelance editor bench", gain: 3 }, { title: "Template library", gain: 2 }] },
    { name: "Reporting", score: 68, note: "Weekly reports are drafted automatically; the bad ones still need Tanvi's tone.", fixes: [{ title: "Bad-week script for AMs", gain: 2 }] },
    { name: "Billing & cash", score: 42, note: "Meera chases dues; pausing campaigns for non-payment needs the owner.", fixes: [{ title: "Written pause policy", gain: 3 }] },
    { name: "New business", score: 24, note: "Every pitch is written and presented by Tanvi.", fixes: [{ title: "Aarav leads two pitches a month", gain: 4 }, { title: "Pitch deck kit", gain: 2 }] },
    { name: "Owner time", score: 38, note: "Tanvi spends 16 hours a week on client calls and pitches.", fixes: [{ title: "Pitch only on Thursdays", gain: 2 }] },
  ],
  ownerHours: [
    { label: "Client calls", hours: 10 },
    { label: "Pitches", hours: 6 },
    { label: "Approvals", hours: 5 },
    { label: "Hiring", hours: 3 },
    { label: "Billing", hours: 2 },
    { label: "Creative review", hours: 4 },
    { label: "Strategy", hours: 2 },
  ],
};

const integrations: Integration[] = [
  { name: "Meta Business", category: "Ad platforms", status: "Connected", detail: "17 ad accounts, insights every 30 minutes.", synced: "2 min ago", records: "214 campaigns", mark: "M", color: "#1877f2" },
  { name: "Google Ads", category: "Ad platforms", status: "Connected", detail: "MCC with 14 client accounts.", synced: "4 min ago", records: "96 campaigns", mark: "G", color: "#34a853" },
  { name: "LinkedIn Campaign Manager", category: "Ad platforms", status: "Syncing", detail: "3 B2B accounts.", synced: "live", records: "18 campaigns", mark: "in", color: "#0a66c2" },
  { name: "Google Analytics 4", category: "Analytics", status: "Connected", detail: "22 properties for conversions and attribution.", synced: "15 min ago", records: "22 properties", mark: "GA", color: "#e37400" },
  { name: "WhatsApp Business", category: "Clients", status: "Connected", detail: "One group per client, read for sentiment.", synced: "just now", records: "22 groups", mark: "W", color: "#1f9d55" },
  { name: "Zoho Books", category: "Billing", status: "Connected", detail: "Retainer invoices, GST and payment links.", synced: "1 h ago", records: "264 invoices", mark: "Z", color: "#d63b2f" },
  { name: "HubSpot (LedgerLoop)", category: "Client CRM", status: "Error", detail: "Deal stages not mapped; pipeline value missing in reports.", synced: "3 days ago", records: "—", mark: "H", color: "#ff7a59" },
  { name: "Meta Business Suite planner", category: "Publishing", status: "Connected", detail: "Scheduled posts for 14 Instagram and Facebook handles.", synced: "8 min ago", records: "61 scheduled", mark: "P", color: "#c13584" },
  { name: "Google Business Profile", category: "Local", status: "Connected", detail: "Reviews and calls for 6 clinics and stores.", synced: "30 min ago", records: "6 listings", mark: "GB", color: "#4285f4" },
  { name: "Slack", category: "Team", status: "Available", detail: "Agent alerts into account channels.", synced: "—", records: "—", mark: "S", color: "#4a154b" },
];

/* ============================================================
   Config
   ============================================================ */

const mrrTotal = CLIENTS.reduce((a, c) => a + c.mrr, 0);

const baseConfig: DeskConfig = {
  slug: "agency",
  company: "Andheri Growth Studio",
  brand: "AGS",
  city: "Mumbai",
  state: "MH",
  icon: Megaphone,
  tagline: "Performance, social and content for 22 retainer clients · 8 people · Marol, Andheri East",
  owner: { name: "Tanvi Kulkarni", first: "Tanvi", initials: "TK", role: "Founder" },
  theme: {
    variant: "inbox",
    paper: "#f6f5fb",
    panel: "#ffffff",
    sunk: "#efeef7",
    ink: "#141416",
    mute: "#6a6a7b",
    line: "#e4e3ee",
    accent: "#6d4aff",
    accentInk: "#ffffff",
    soft: "#efebff",
    ok: "#0f9f78",
    warn: "#e09612",
    late: "#e5484d",
    info: "#2b7de9",
    heading: "sans",
    radius: 20,
  },
  brief:
    "Kurla Kicks is the account to save today: ROAS has slid to 2.1, they renew in 19 days and the founder is unhappy. Five weekly reports need a human before they go out, and ₹2.4 L of retainers is overdue, including Malad Motors whose ads are paused.",
  pulse: [
    { label: "Monthly retainers", value: inr(mrrTotal, { compact: true }), delta: "+6%", trend: [14.1, 14.9, 15.6, 16.2, 16.8, 17.4, mrrTotal / 1e5], module: "billing" },
    { label: "Clients at risk", value: String(CLIENTS.filter((c) => healthOf(c) < 45).length), delta: "+2", good: false, trend: [2, 2, 3, 3, 3, 4, 5], tone: "late", module: "campaigns" },
    { label: "Ad spend managed, Oct", value: "₹50.4 L", delta: "+12%", trend: [31, 34, 38, 41, 44, 47, 50], tone: "info", module: "campaigns" },
    { label: "Team utilisation", value: "86%", delta: "+5 pts", good: false, trend: [74, 77, 79, 81, 83, 84, 86], tone: "warn", module: "utilisation" },
    { label: "Pitch pipeline", value: "₹7.7 L/mo", delta: "+₹2.2 L", trend: [3.1, 3.8, 4.4, 5.0, 5.5, 6.9, 7.7], tone: "ok", module: "newbiz" },
  ],
  decisions: [
    { id: "a1", kind: "Risk", from: "Sentiment Reader", title: "Kurla Kicks is close to leaving: call the founder today", context: "ROAS 2.1 against 3.2 for two weeks, renewal in 19 days, two unanswered WhatsApps. ₹1.2 L a month.", recommendation: "Tanvi calls at 11:30 with a plan: cut Advantage+ 25%, shift to PMax retros, and a free creative sprint.", impact: "₹14.4 L/yr", module: "campaigns", approveLabel: "Book the call" },
    { id: "a2", kind: "Approve", from: "Pacing Guard", title: "Move ₹3,000/day from Kurla Advantage+ to PMax", context: "Advantage+ is 31% ahead of pace at ROAS 2.1; PMax is at 2.9 and limited by budget.", recommendation: "Approve. Projected blended ROAS 2.7 by Sunday, and October budget lasts to the 31st.", impact: "+0.6 ROAS", module: "campaigns", approveLabel: "Shift budget" },
    { id: "a3", kind: "Reply", from: "Ghatkopar Gold & Diamonds", title: "\"Dhanteras booking ad ready? Want it live by 1 Nov.\"", context: "The carousel is in client review since yesterday. Two copy options for 0% making charges.", recommendation: "Send both options with a 24-hour approval deadline; Kabir sets it live on 28 Oct for learning.", module: "calendar", approveLabel: "Send options" },
    { id: "a4", kind: "Money", from: "Billing Clerk", title: "Malad Motors owes ₹88,500 for 34 days; ads paused", context: "The pause cost them 29% of leads and they think we paused by mistake.", recommendation: "Restart today on their UPI promise, and send the written pause policy with the receipt.", impact: "₹88.5k", module: "billing", approveLabel: "Restart on promise" },
    { id: "a5", kind: "People", from: "Kabir Rao", title: "Rehan is at 101%: hire a freelance editor for Diwali", context: "6 reels in edit and 9 Diwali calendars. Two clients have already waited 3 days.", recommendation: "Approve a freelance editor for 3 weeks at ₹45,000. Bill Kurla's creative sprint against it.", impact: "₹45k", module: "utilisation", approveLabel: "Approve freelancer" },
    { id: "a6", kind: "Approve", from: "Report Writer", title: "Send 6 healthy Week 42 reports without review", context: "Worli Wealth, Bandra Bites, Colaba Brew, Juhu Spa, Dadar Silk, Ghatkopar Gold: all at or above target.", recommendation: "Send now. The 5 below target stay in the queue for a human note.", module: "reports", approveLabel: "Send 6" },
    { id: "a7", kind: "Money", from: "Aarav Shah", title: "Marine Drive Hospitality wants a 3-month pilot at ₹1.6 L", context: "Our proposal was ₹2.2 L a month for 3 hotels. They will sign a 12-month contract if the pilot works.", recommendation: "Accept ₹1.8 L with a 9-month lock-in and paid-media management at 10% above ₹15 L spend.", impact: "₹21.6 L/yr", module: "newbiz", approveLabel: "Counter at ₹1.8 L" },
  ],
  agenda: [
    { at: 10, title: "Stand-up", detail: "5 at-risk accounts, Diwali calendars", tone: "accent", module: "campaigns" },
    { at: 11.5, title: "Kurla Kicks founder call", detail: "ROAS plan + creative sprint", tone: "late", module: "campaigns" },
    { at: 13, title: "Report review", detail: "5 reports need a human note", count: 5, tone: "warn", module: "reports" },
    { at: 15, title: "Content approvals", detail: "4 posts waiting on clients", count: 4, tone: "info", module: "calendar" },
    { at: 16, title: "Marine Drive pitch rehearsal", detail: "Pitch on Thursday", tone: "ok", module: "newbiz" },
    { at: 18, title: "Billing run", detail: "3 overdue, November drafts", tone: "neutral", module: "billing" },
  ],
  activity: [
    { time: "11:20 AM", text: "Pacing Guard: Kurla Kicks 31% ahead of pace", tone: "late" },
    { time: "11:02 AM", text: "Worli Wealth approved the 'Gold vs SGB' blog", tone: "ok" },
    { time: "10:44 AM", text: "Powai Prep geo exclusions live; 6 districts removed", tone: "info" },
    { time: "10:15 AM", text: "Report Writer drafted 14 Week 42 reports", tone: "accent" },
    { time: "9:50 AM", text: "Malad Motors promised UPI payment by 6 PM", tone: "warn" },
    { time: "9:30 AM", text: "Juhu Beach Cafe signed: ₹70k/month from 26 Oct", tone: "ok" },
  ],
  asks: [
    { q: "Which clients might churn this quarter?", a: "Five, ranked by risk.\n\n• Kurla Kicks (₹1.2 L/mo): ROAS 2.1 vs 3.2, sentiment 38, renews in 19 days.\n• Thane Realty (₹1.4 L/mo): 56% of lead target, sales complains about reachability, renews in 33 days.\n• Versova Yoga (₹60k): retreat half full, renews in 22 days.\n• Kandivali Kids (₹45k): leads at 61% of target, invoice 12 days overdue.\n• Malad Motors (₹75k): ads paused over billing, 34 days overdue.\n\nTogether that's ₹4.4 L of MRR, 24% of the book.", sources: ["Client pulse wall", "Sentiment Reader", "Zoho Books"] },
    { q: "Where are we over-servicing?", a: "Three retainers cost more hours than they pay for (at ₹1,800/hour).\n\n• LedgerLoop: 118 h used vs 100 allowed, mostly report rework for HubSpot.\n• Kurla Kicks: 84 h vs 67, creative re-shoots.\n• Powai Prep: 58 h vs 53.\n\nThe HubSpot fix alone saves about 12 hours a month on LedgerLoop.", sources: ["Team utilisation", "Timesheets"] },
    { q: "How is ad spend pacing this month?", a: "₹50.4 L managed across 22 accounts, 63% of the month gone.\n\n• Ahead of pace: Kurla Kicks (+31%), Powai Prep (+18%), Versova Yoga (+12%).\n• Behind: Malad Motors (−36%, paused), Thane Realty (−28%, Search limited), Kandivali Kids (−21%).\n\nShifting ₹3k/day on Kurla and lifting Thane's Search cap fixes the two biggest gaps.", sources: ["Meta Business", "Google Ads", "Pacing Guard"] },
    { q: "What's due from clients?", a: "₹2.39 L overdue across 3 invoices (incl. 18% GST).\n\n• Malad Motors ₹88,500, 34 days, ads paused, UPI promised today.\n• Powai Prep ₹1,12,100, 21 days, cheque in the post.\n• Kandivali Kids ₹53,100, 12 days.\n\nNovember invoices for all 22 retainers are drafted for 1 Nov.", sources: ["Retainers & billing", "Zoho Books"] },
    { q: "How does the new-business pipeline look?", a: "₹7.7 L a month in active pitches, weighted ₹3.2 L.\n\n• Marine Drive Hospitality: ₹2.2 L, pitch Thursday, 60%.\n• Bhayander Dental Chain: ₹85k, pitch Monday, 55%.\n• Fort Legal: ₹1 L, revised scope, 45%.\n• Sion Diagnostics: ₹1.2 L, proposal out 4 days.\n\nJuhu Beach Cafe signed today at ₹70k, kick-off Monday.", sources: ["New business"] },
    { q: "Draft the Kurla Kicks call notes", a: "Talking points for 11:30 (not sent):\n\n1. Own it: ROAS fell from 3.4 to 2.1 in three weeks as Diwali CPMs rose 38%.\n2. Today: move ₹3k/day from Advantage+ to PMax retros (ROAS 2.9).\n3. This week: a free creative sprint, 6 new UGC reels, Rehan + freelancer.\n4. Ask: 10 days to get back to 2.8+, with a daily WhatsApp number.\n5. Renewal: hold the same fee, add a ROAS floor clause for December.", sources: ["Campaigns", "Sentiment Reader", "Creative Scout"] },
  ],
  run: {
    label: "Runs every morning at 8 and after every sync.",
    title: "Client Health Scan",
    steps: [
      { text: "Pull spend and results from 17 Meta, 14 Google and 3 LinkedIn accounts", result: "₹50.4 L spend, 34 accounts" },
      { text: "Compare pacing and results with each client's monthly plan", result: "6 off pace, 7 below target" },
      { text: "Read the last 7 days of client WhatsApp and email", result: "Sentiment down for 3 clients" },
      { text: "Check renewals, invoices and hours used", result: "4 renew in 30 days, 3 overdue" },
      { text: "Rank every client by risk and draft the owner's actions", result: "5 at risk, 7 actions drafted" },
    ],
    outcome: "Five clients carry ₹4.4 L of monthly retainer at risk. Kurla Kicks is the urgent one: a founder call today, a budget shift to PMax and a creative sprint should hold the renewal.",
    actions: ["Book Kurla Kicks call", "Shift ₹3k/day to PMax", "Lift Thane Search cap", "Send 6 healthy reports"],
  },
};

/* ============================================================
   Desk
   ============================================================ */

type Store = {
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  reports: Report[];
  setReports: React.Dispatch<React.SetStateAction<Report[]>>;
  openClient: (id: string | null) => void;
};

export default function AgencyDesk() {
  const [campaigns, setCampaigns] = React.useState(SEED_CAMPAIGNS);
  const [reports, setReports] = React.useState(SEED_REPORTS);
  const [client, setClient] = React.useState<string | null>(null);
  const store: Store = { campaigns, setCampaigns, reports, setReports, openClient: setClient };

  const config: DeskConfig = {
    ...baseConfig,
    signature: {
      title: "Client pulse wall",
      sub: "All 22 retainers, sorted by risk. Each pulse beats faster when pacing, results or mood slip.",
      module: "campaigns",
      render: () => (
        <>
          <PulseWall store={store} />
          <ClientSheet id={client} store={store} onClose={() => setClient(null)} />
        </>
      ),
    },
    homeExtras: () => <HomeExtras store={store} />,
  };

  const modules: DeskModule[] = [
    { id: "campaigns", group: "Delivery", label: "Campaigns", count: campaigns.filter((c) => c.status !== "Paused" && offTarget(c)).length, title: "Campaigns", blurb: "Spend against results for every live campaign, with pause and scale one click away", icon: Rocket, render: () => <CampaignsModule store={store} /> },
    { id: "calendar", group: "Delivery", label: "Content calendar", count: SEED_POSTS.filter((p) => p.status === "Client review").length, title: "Content calendar", blurb: "This week's posts across 14 handles. Drag a post to another day to reschedule it.", icon: CalendarRange, render: () => <CalendarModule /> },
    { id: "reports", group: "Delivery", label: "Reports", count: reports.filter((r) => r.status === "Needs review").length, title: "Reports", blurb: "Weekly client reports drafted from live data. Review the bad weeks, send the good ones.", icon: BarChart3, render: () => <ReportsModule store={store} /> },
    { id: "billing", group: "Money", label: "Retainers & billing", count: CLIENTS.filter((c) => c.overdue).length, title: "Retainers & billing", blurb: "Monthly retainers, renewals, GST invoices and who is late", icon: IndianRupee, render: () => <BillingModule store={store} /> },
    { id: "newbiz", group: "Money", label: "New business", count: SEED_PROSPECTS.filter((p) => p.stage === "pitch").length, title: "New business", blurb: "Every prospect from first enquiry to signed retainer. Drag to move a stage.", icon: Briefcase, render: () => <NewBizModule /> },
    { id: "utilisation", group: "Team", label: "Team utilisation", title: "Team utilisation", blurb: "Hours by person and client this month, against what each retainer pays for", icon: Timer, render: () => <UtilisationModule /> },
    { id: "team", group: "Team", label: "People", title: "People", blurb: "Strategy, performance, content and finance: who is carrying what today", icon: Users, render: () => <PeopleModule members={team} /> },
    { id: "agents", group: "Team", label: "Agents", title: "Agents", blurb: "Six AI agents pacing budgets, writing reports and reading client mood", icon: Bot, render: () => <AgentsModule agents={agents} /> },
    { id: "independence", group: "Studio", label: "Independence", title: "Owner independence", blurb: "How much of the studio runs without Tanvi on the call", icon: GaugeIcon, render: () => <IndependenceModule data={independence} /> },
    { id: "connections", group: "Studio", label: "Connections", title: "Connections", blurb: "Ad platforms, analytics, WhatsApp groups and Zoho Books", icon: Plug, render: () => <ConnectionsModule items={integrations} /> },
  ];

  return <DeskShell config={config} modules={modules} />;
}

function offTarget(c: Campaign) {
  return isRoas(c) ? c.results < c.target * 0.9 : c.cpr > c.target * 1.1;
}

/* ---------------- Signature: client pulse wall ---------------- */

const BEATS = {
  steady: "l14 0 l3 -6 l3 12 l3 -18 l3 22 l3 -10 l31 0",
  weak: "l12 0 l4 -3 l3 6 l4 -9 l3 10 l4 -4 l30 0",
  erratic: "l6 0 l3 -14 l3 20 l2 -26 l3 30 l3 -12 l6 0 l3 -8 l3 10 l3 -4 l25 0",
};

function Pulse({ tone, speed, kind, height = 34 }: { tone: Tone; speed: number; kind: keyof typeof BEATS; height?: number }) {
  const unit = BEATS[kind];
  const d = `M0 20 ${Array.from({ length: 8 }, () => unit).join(" ")}`;
  const color = tone === "late" ? "var(--d-late)" : tone === "warn" ? "var(--d-warn)" : "var(--d-ok)";
  return (
    <svg viewBox="0 0 240 40" preserveAspectRatio="none" className="block w-full" style={{ height }} aria-hidden>
      <defs>
        <linearGradient id={`fade-${tone}-${kind}`} x1="0" x2="1">
          <stop offset="0" stopColor={color} stopOpacity="0" />
          <stop offset="0.25" stopColor={color} stopOpacity="1" />
          <stop offset="1" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      <g>
        <path d={d} fill="none" stroke={`url(#fade-${tone}-${kind})`} strokeWidth="1.8" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <animateTransform attributeName="transform" type="translate" from="0 0" to="-60 0" dur={`${speed}s`} repeatCount="indefinite" />
      </g>
    </svg>
  );
}

function MiniBar({ label, value, tone }: { label: string; value: number; tone: Tone }) {
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-1 text-[10px] text-d-mute">
        <span className="truncate">{label}</span>
        <span className="tnum font-mono text-d-ink">{value}</span>
      </div>
      <Meter value={Math.min(100, value)} max={100} tone={tone} height={4} />
    </div>
  );
}

function PulseWall({ store }: { store: Store }) {
  const [view, setView] = React.useState<"All" | "At risk" | "Renewing" | "Mine">("All");
  const sorted = [...CLIENTS].sort((a, b) => riskOf(b) - riskOf(a));
  const shown = sorted.filter((c) => (view === "At risk" ? healthOf(c) < 45 : view === "Renewing" ? c.renewal <= 45 : view === "Mine" ? c.am === "Zoya" : true));
  const beat = useTicker(shown.length || 1, 1800);
  const pace = useDrift(131, 0.6, 2200);
  const atRisk = CLIENTS.filter((c) => healthOf(c) < 45);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Segmented size="sm" options={[{ value: "All", label: "All", count: CLIENTS.length }, { value: "At risk", label: "At risk", count: atRisk.length }, { value: "Renewing", label: "Renewing ≤ 45d", count: CLIENTS.filter((c) => c.renewal <= 45).length }, { value: "Mine", label: "Zoya's" }] as const} value={view} onChange={setView} />
        <span className="ml-auto inline-flex items-center gap-2 text-[12px] text-d-mute">
          <span className="desk-ping h-2 w-2 rounded-full bg-d-late" />
          <span className="tnum font-mono">{inr(atRisk.reduce((a, c) => a + c.mrr, 0), { compact: true })}/mo at risk</span>
        </span>
      </div>
      <div className="grid grid-flow-dense grid-cols-2 gap-2.5 sm:grid-cols-4" style={{ gridAutoRows: "minmax(104px, auto)" }}>
        {shown.map((c, i) => {
          const h = healthOf(c);
          const tone = toneOfHealth(h);
          const size = i < 2 ? "xl" : i < 6 ? "md" : "sm";
          const res = resultPct(c);
          const pacing = c.id === "kurla-kicks" ? Math.round(pace) : c.pacing;
          const live = beat === i;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => store.openClient(c.id)}
              className={`desk-rise group relative flex min-w-0 flex-col overflow-hidden rounded-[16px] border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-26px_rgba(0,0,0,0.5)] ${size === "xl" ? "col-span-2 row-span-2" : size === "md" ? "col-span-2" : ""}`}
              style={{
                animationDelay: `${i * 25}ms`,
                borderColor: live ? "var(--d-accent)" : `color-mix(in oklab, ${tone === "ok" ? "var(--d-line)" : `var(--d-${tone})`} ${tone === "ok" ? 100 : 40}%, var(--d-line))`,
                background: `linear-gradient(160deg, color-mix(in oklab, var(--d-${tone}) ${tone === "ok" ? 4 : 10}%, var(--d-panel)), var(--d-panel) 70%)`,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className={`flex items-center gap-1.5 font-semibold leading-tight ${size === "xl" ? "text-[16px]" : "text-[13px]"}`}>
                    <span className="truncate">{size === "sm" ? c.short : c.name}</span>
                    {live && <span className="desk-ping h-1.5 w-1.5 shrink-0 rounded-full bg-d-accent" title="Just synced" />}
                  </p>
                  <p className="truncate text-[11px] text-d-mute">
                    {c.category}
                    {size !== "sm" && ` · ${inr(c.mrr, { compact: true })}/mo · ${c.am}`}
                  </p>
                </div>
                <span className={`tnum shrink-0 font-mono font-bold leading-none ${size === "xl" ? "text-[30px]" : "text-[18px]"}`} style={{ color: `var(--d-${tone})` }}>
                  {h}
                </span>
              </div>
              <div className="my-1.5">
                <Pulse tone={tone} speed={tone === "late" ? 0.9 : tone === "warn" ? 1.5 : 2.6} kind={tone === "late" ? "erratic" : tone === "warn" ? "weak" : "steady"} height={size === "xl" ? 56 : 28} />
              </div>
              {size === "sm" ? (
                <div className="mt-auto flex items-center gap-1.5 text-[10.5px] text-d-mute">
                  <span className="tnum font-mono text-d-ink">{res}%</span> of goal
                  {c.renewal <= 45 && <span className="ml-auto rounded-full bg-d-sunk px-1.5 font-mono">{c.renewal}d</span>}
                </div>
              ) : (
                <div className="mt-auto space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <MiniBar label="Pacing" value={pacing} tone={Math.abs(pacing - 100) > 15 ? "late" : Math.abs(pacing - 100) > 7 ? "warn" : "ok"} />
                    <MiniBar label="Results" value={res} tone={res < 70 ? "late" : res < 90 ? "warn" : "ok"} />
                    <MiniBar label="Mood" value={c.sentiment} tone={c.sentiment < 50 ? "late" : c.sentiment < 70 ? "warn" : "ok"} />
                  </div>
                  {size === "xl" && (
                    <>
                      <p className="line-clamp-2 rounded-[10px] bg-d-sunk/70 px-2.5 py-1.5 text-[12px] italic leading-snug text-d-ink/80">{c.lastMsg}</p>
                      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-d-mute">
                        <span>
                          {c.kpi}: <b className="tnum font-mono text-d-ink">{c.kpi === "ROAS" ? c.actual.toFixed(1) : c.actual.toLocaleString("en-IN")}</b> / {c.kpi === "ROAS" ? c.target.toFixed(1) : c.target.toLocaleString("en-IN")}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-3 w-3" /> renews in {c.renewal}d
                        </span>
                      </p>
                    </>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-[11.5px] text-d-mute">
        <span className="inline-flex items-center gap-1.5">
          <HeartPulse className="h-3.5 w-3.5 text-d-ok" /> steady, healthy
        </span>
        <span className="inline-flex items-center gap-1.5">
          <HeartPulse className="h-3.5 w-3.5 text-d-warn" /> weak, watch
        </span>
        <span className="inline-flex items-center gap-1.5">
          <HeartPulse className="h-3.5 w-3.5 text-d-late" /> erratic, act today
        </span>
        <span className="ml-auto">Health = pacing + results vs target + client mood + renewal and dues</span>
      </div>
    </div>
  );
}

function ClientSheet({ id, store, onClose }: { id: string | null; store: Store; onClose: () => void }) {
  const desk = useDesk();
  const c = id ? clientOf(id) : null;
  const list = c ? store.campaigns.filter((x) => x.client === c.id) : [];
  const report = c ? store.reports.find((r) => r.client === c.id) : undefined;
  const h = c ? healthOf(c) : 0;
  return (
    <Sheet
      open={!!c}
      onOpenChange={(o) => !o && onClose()}
      width={540}
      eyebrow={c ? `${c.category} · ${c.area} · client for ${c.tenure} months` : ""}
      title={c?.name ?? ""}
      sub={c ? `${inr(c.mrr)}/month · AM ${c.am} · ${c.services.join(", ")}` : ""}
      footer={
        c && (
          <>
            <Btn
              icon={Presentation}
              onClick={() => {
                toast.success("QBR booked", { description: `${c.name} · Fri 23 Oct, 4 PM with ${c.am} and Tanvi` });
                desk.log(`QBR booked with ${c.name}`, "info");
              }}
            >
              Book QBR
            </Btn>
            <Btn
              variant="solid"
              icon={MessageCircle}
              onClick={() => {
                toast.success("Check-in sent on WhatsApp", { description: `${c.am} posted this week's numbers and a plan in the ${c.short} group` });
                desk.log(`Check-in sent to ${c.name}`, "ok");
                onClose();
              }}
            >
              Send check-in
            </Btn>
          </>
        )
      }
    >
      {c && (
        <div className="space-y-5">
          <div className="flex items-center gap-4 rounded-[16px] border border-d-line p-3">
            <div className="text-center">
              <p className="tnum font-mono text-[34px] font-bold leading-none" style={{ color: `var(--d-${toneOfHealth(h)})` }}>
                {h}
              </p>
              <p className="text-[10.5px] text-d-mute">health</p>
            </div>
            <div className="min-w-0 flex-1">
              <Pulse tone={toneOfHealth(h)} speed={h < 45 ? 0.9 : h < 70 ? 1.5 : 2.6} kind={h < 45 ? "erratic" : h < 70 ? "weak" : "steady"} height={40} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <MiniBar label="Spend pacing" value={c.pacing} tone={Math.abs(c.pacing - 100) > 15 ? "late" : "ok"} />
            <MiniBar label={`${c.kpi} vs target`} value={resultPct(c)} tone={resultPct(c) < 80 ? "late" : "ok"} />
            <MiniBar label="Client mood" value={c.sentiment} tone={c.sentiment < 55 ? "late" : "ok"} />
          </div>
          <p className="rounded-[12px] bg-d-sunk/70 px-3 py-2 text-[13px] italic">{c.lastMsg}</p>
          <KV items={[{ k: "Ad budget, October", v: inr(c.budget, { compact: true }) }, { k: "Spent so far", v: inr(c.spend, { compact: true }) }, { k: c.kpi, v: `${c.kpi === "ROAS" ? c.actual.toFixed(1) : c.actual.toLocaleString("en-IN")} of ${c.kpi === "ROAS" ? c.target.toFixed(1) : c.target.toLocaleString("en-IN")}` }, { k: "Hours this month", v: `${c.hoursUsed} of ${c.hoursAllowed}` }]} />
          <div>
            <p className="mb-2 text-[12px] font-medium text-d-mute">Campaigns</p>
            {list.length ? (
              <ul className="space-y-1.5">
                {list.map((x) => (
                  <li key={x.id} className="flex items-center gap-3 rounded-[12px] border border-d-line px-3 py-2 text-[12.5px]">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{x.name}</span>
                      <span className="text-[11px] text-d-mute">
                        {x.platform} · {inr(x.daily)}/day
                      </span>
                    </span>
                    <span className="tnum font-mono">{isRoas(x) ? `${x.results.toFixed(1)}x` : `₹${num0(x.cpr)}`}</span>
                    <Pill tone={x.status === "Paused" ? "neutral" : offTarget(x) ? "late" : "ok"}>{x.status}</Pill>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-[12px] border border-dashed border-d-line px-3 py-4 text-center text-[12.5px] text-d-mute">Organic and local only: {c.services.join(", ")}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[12px] border border-d-line p-3">
              <p className="text-[11.5px] text-d-mute">Last report</p>
              <p className="text-[13px] font-semibold">{report ? `${report.period} · ${report.status}` : `Monthly · ${c.lastReport}`}</p>
              <p className="mt-0.5 text-[12px] leading-snug text-d-mute">{report?.highlight ?? "On target; sent automatically."}</p>
            </div>
            <div className="rounded-[12px] border border-d-line p-3">
              <p className="text-[11.5px] text-d-mute">Renewal</p>
              <p className="text-[13px] font-semibold">
                <Countdown compact inHours={c.renewal * 24} />
              </p>
              <p className="mt-0.5 text-[12px] text-d-mute">{c.renewal <= 30 ? "Inside the 30-day notice window" : "12-month retainer"}</p>
            </div>
          </div>
        </div>
      )}
    </Sheet>
  );
}

function num0(v: number) {
  return v < 10 ? v.toFixed(2) : Math.round(v).toLocaleString("en-IN");
}

/* ---------------- Home extras ---------------- */

function HomeExtras({ store }: { store: Store }) {
  const renewals = CLIENTS.filter((c) => c.renewal <= 60).sort((a, b) => a.renewal - b.renewal);
  const lanes = renewals.reduce<{ c: Client; lane: number; at: number }[]>((acc, c) => {
    const at = (c.renewal / 60) * 100;
    const lane = [0, 2, 1, 3].find((l) => !acc.some((x) => x.lane === l && Math.abs(x.at - at) < 19)) ?? 3;
    return [...acc, { c, lane, at }];
  }, []);
  const platforms = ["Meta", "Google Search", "Performance Max", "LinkedIn", "YouTube", "Swiggy"] as const;
  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <Panel icon={CalendarRange} title="Renewals, next 60 days" sub={`${renewals.length} retainers · ${inr(renewals.reduce((a, c) => a + c.mrr, 0), { compact: true })}/mo`}>
        <div className="relative mb-2 mt-2 h-[128px]">
          <div className="absolute left-0 right-0 top-[62px] h-[3px] rounded-full bg-d-sunk" />
          <div className="absolute left-0 top-[62px] h-[3px] rounded-full bg-d-late/50" style={{ width: "50%" }} />
          {[0, 15, 30, 45, 60].map((d) => (
            <span key={d} className="absolute top-[68px] -translate-x-1/2 font-mono text-[10px] text-d-mute" style={{ left: `${Math.max(3, (d / 60) * 100)}%` }}>
              {d === 0 ? "today" : `${d}d`}
            </span>
          ))}
          {lanes.map(({ c, lane }) => {
            const h = healthOf(c);
            const up = lane < 2;
            const top = [0, 26, 76, 102][lane];
            return (
              <button key={c.id} type="button" onClick={() => store.openClient(c.id)} className="group absolute -translate-x-1/2" style={{ left: `${Math.max(4, Math.min(96, (c.renewal / 60) * 100))}%`, top }} title={`${c.name} · ${c.renewal} days`}>
                <span className="whitespace-nowrap rounded-full border border-d-line bg-d-panel px-2 py-0.5 text-[10.5px] font-medium shadow-sm group-hover:border-d-accent">
                  <span className="mr-1 inline-block h-2 w-2 rounded-full align-middle" style={{ background: `var(--d-${toneOfHealth(h)})` }} />
                  {c.short}
                </span>
                <span className="absolute left-1/2 w-px bg-d-line" style={up ? { top: 20, height: 62 - top - 20 } : { bottom: 20, height: top - 62 - 2 }} />
              </button>
            );
          })}
        </div>
        <ul className="mt-3 divide-y divide-d-line">
          {renewals.slice(0, 4).map((c) => (
            <li key={c.id} className="flex items-center gap-3 py-2 text-[12.5px]">
              <span className="h-2 w-2 rounded-full" style={{ background: `var(--d-${toneOfHealth(healthOf(c))})` }} />
              <button type="button" onClick={() => store.openClient(c.id)} className="min-w-0 flex-1 truncate text-left font-medium hover:text-d-accent">
                {c.name}
              </button>
              <span className="tnum font-mono text-d-mute">{inr(c.mrr, { compact: true })}</span>
              <span className="w-12 text-right font-mono text-[11.5px]">{c.renewal}d</span>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel icon={Activity} title="Spend by platform" sub="October to date vs plan">
        <Bars
          height={180}
          format={(v) => `₹${v.toFixed(1)}L`}
          data={platforms.map((p) => {
            const list = store.campaigns.filter((x) => x.platform === p);
            const spent = list.reduce((a, x) => a + x.spend, 0) / 1e5;
            const planned = list.reduce((a, x) => a + x.daily * 20, 0) / 1e5;
            return { label: p === "Performance Max" ? "PMax" : p === "Google Search" ? "Search" : p, value: spent, stack: [{ name: "Spent", value: Math.min(spent, planned), tone: "accent" as const }, { name: "Over plan", value: Math.max(0, spent - planned), tone: "late" as const }, { name: "Left in plan", value: Math.max(0, planned - spent), tone: "neutral" as const }] };
          })}
        />
      </Panel>
    </div>
  );
}

/* ---------------- Campaigns ---------------- */

function CampaignsModule({ store }: { store: Store }) {
  const desk = useDesk();
  const { campaigns, setCampaigns } = store;
  const [open, setOpen] = React.useState<string | null>(null);
  const [applied, setApplied] = React.useState<Set<string>>(new Set());
  const camp = campaigns.find((c) => c.id === open) ?? null;
  const live = useDrift(504, 0.25, 2000);
  const spend = campaigns.reduce((a, c) => a + c.spend, 0);

  function act(c: Campaign, kind: "pause" | "resume" | "up" | "down") {
    setCampaigns((cur) => cur.map((x) => (x.id !== c.id ? x : kind === "pause" ? { ...x, status: "Paused" } : kind === "resume" ? { ...x, status: "Active" } : { ...x, daily: Math.round(x.daily * (kind === "up" ? 1.2 : 0.8)) })));
    const label = kind === "pause" ? "paused" : kind === "resume" ? "resumed" : kind === "up" ? "scaled +20%" : "cut −20%";
    toast.success(`${c.name} ${label}`, { description: `${clientOf(c.client).name} · pushed to ${c.platform}` });
    desk.log(`${clientOf(c.client).short}: ${c.name} ${label}`, kind === "pause" || kind === "down" ? "warn" : "ok");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Ad spend managed, Oct" value={`₹${(live / 10).toFixed(1)} L`} delta="+12%" hint="all 22 clients" icon={CircleDollarSign} trend={[31, 34, 38, 41, 44, 47, 50]} />
        <Stat label="Live campaigns" value={campaigns.filter((c) => c.status !== "Paused").length} hint={`${campaigns.filter((c) => c.status === "Learning").length} still learning`} icon={Play} tone="info" />
        <Stat label="Off target" value={campaigns.filter((c) => c.status !== "Paused" && offTarget(c)).length} delta="+2" deltaGood={false} hint="cost per result > 110% of goal" icon={AlertTriangle} tone="late" />
        <Stat label="Spend in key campaigns" value={inr(spend, { compact: true })} hint="16 key campaigns" icon={TrendingUp} tone="ok" />
      </div>
      <Panel title="Key campaigns" sub="Click a row for daily trend and actions. Changes push straight to the ad platform.">
        <DataTable
          rows={campaigns}
          rowKey={(c) => c.id}
          search={(c) => `${c.name} ${clientOf(c.client).name} ${c.platform}`}
          searchPlaceholder="Search campaign, client or platform"
          filter={{ get: (c) => (c.status === "Paused" ? "Paused" : offTarget(c) ? "Off target" : "On target"), options: ["Off target", "On target", "Paused"] }}
          onRow={(c) => setOpen(c.id)}
          bulk={[{ label: "Pause selected", run: (k) => { setCampaigns((cur) => cur.map((x) => (k.includes(x.id) ? { ...x, status: "Paused" } : x))); toast.success(`${k.length} campaigns paused`); desk.log(`${k.length} campaigns paused in bulk`, "warn"); } }]}
          columns={[
            { key: "client", label: "Client", render: (c) => <span className="font-medium">{clientOf(c.client).short}</span>, sort: (c) => clientOf(c.client).short },
            { key: "name", label: "Campaign", render: (c) => <span className="text-d-mute">{c.name}</span>, wide: true },
            { key: "pl", label: "Platform", render: (c) => <Pill tone={c.platform === "Meta" ? "info" : c.platform === "LinkedIn" ? "accent" : "neutral"}>{c.platform}</Pill> },
            { key: "daily", label: "₹/day", align: "right", render: (c) => <span className="tnum font-mono">{c.daily.toLocaleString("en-IN")}</span>, sort: (c) => c.daily },
            { key: "spend", label: "Spent", align: "right", render: (c) => <span className="tnum font-mono">{inr(c.spend, { compact: true })}</span>, sort: (c) => c.spend },
            { key: "res", label: "Result", align: "right", render: (c) => <span className="tnum font-mono" style={{ color: offTarget(c) ? "var(--d-late)" : "var(--d-ok)" }}>{isRoas(c) ? `${c.results.toFixed(1)}x` : `₹${num0(c.cpr)}`}</span>, sort: (c) => (isRoas(c) ? c.results / c.target : c.target / c.cpr) },
            { key: "tgt", label: "Goal", align: "right", render: (c) => <span className="tnum font-mono text-d-mute">{isRoas(c) ? `${c.target.toFixed(1)}x` : `₹${num0(c.target)}`}</span> },
            {
              key: "act",
              label: "",
              align: "right",
              render: (c) => (
                <span className="inline-flex gap-1" onClick={(e) => e.stopPropagation()}>
                  {c.status === "Paused" ? (
                    <Btn size="sm" variant="soft" icon={Play} onClick={() => act(c, "resume")}>
                      Resume
                    </Btn>
                  ) : (
                    <>
                      <Btn size="sm" icon={Pause} aria-label="Pause" onClick={() => act(c, "pause")} />
                      <Btn size="sm" variant="soft" icon={Zap} onClick={() => act(c, offTarget(c) ? "down" : "up")}>
                        {offTarget(c) ? "−20%" : "+20%"}
                      </Btn>
                    </>
                  )}
                </span>
              ),
            },
          ]}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Panel icon={Sparkles} title="Suggested by Pacing Guard" sub="Apply pushes the change; it can be undone from the campaign">
          <ul className="space-y-2.5">
            {[
              { id: "s1", t: "Kurla Kicks: move ₹3,000/day Advantage+ → PMax", d: "Blended ROAS 2.1 → ~2.7 by Sunday", tone: "late" as const },
              { id: "s2", t: "Thane Realty: lift Search cap to ₹11,000/day", d: "Search CPL ₹1,622 vs Meta ₹1,605 with better reachability", tone: "warn" as const },
              { id: "s3", t: "Powai Prep: exclude 6 districts outside MMR", d: "38% of leads were outside Mumbai last week", tone: "warn" as const },
              { id: "s4", t: "Colaba Brew: scale Reels +20%", d: "₹86 per booking vs ₹90 goal, frequency 1.8", tone: "ok" as const },
              { id: "s5", t: "Versova Yoga: add 10% early-bird to ad copy", d: "Cost per booking up 41% in 3 weeks", tone: "late" as const },
            ].map((s) => (
              <li key={s.id} className="flex items-start gap-3 rounded-[14px] border border-d-line p-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: `var(--d-${s.tone})` }} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold">{s.t}</p>
                  <p className="text-[12px] text-d-mute">{s.d}</p>
                </div>
                {applied.has(s.id) ? (
                  <Pill tone="ok">Applied</Pill>
                ) : (
                  <Btn
                    size="sm"
                    variant="solid"
                    onClick={() => {
                      setApplied((a) => new Set(a).add(s.id));
                      toast.success("Change applied", { description: s.t });
                      desk.log(`Applied: ${s.t}`, "ok");
                    }}
                  >
                    Apply
                  </Btn>
                )}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Results vs target by client" sub="Share of this month's goal achieved so far (63% of the month gone)">
          <HBars
            format={(v) => `${v}%`}
            data={[...CLIENTS]
              .sort((a, b) => resultPct(a) - resultPct(b))
              .slice(0, 9)
              .map((c) => ({ label: c.short, value: resultPct(c), tone: resultPct(c) < 70 ? ("late" as const) : resultPct(c) < 90 ? ("warn" as const) : ("ok" as const) }))}
          />
        </Panel>
      </div>
      <Sheet
        open={!!camp}
        onOpenChange={(o) => !o && setOpen(null)}
        width={520}
        eyebrow={camp ? `${camp.id} · ${camp.platform} · ${camp.status}` : ""}
        title={camp?.name ?? ""}
        sub={camp ? `${clientOf(camp.client).name} · ${inr(camp.daily)}/day · ${inr(camp.spend, { compact: true })} spent` : ""}
        footer={
          camp && (
            <>
              {camp.status === "Paused" ? (
                <Btn icon={Play} onClick={() => act(camp, "resume")}>
                  Resume
                </Btn>
              ) : (
                <Btn icon={Pause} onClick={() => act(camp, "pause")}>
                  Pause
                </Btn>
              )}
              <Btn onClick={() => act(camp, "down")}>Cut 20%</Btn>
              <Btn variant="solid" icon={Zap} onClick={() => act(camp, "up")}>
                Scale 20%
              </Btn>
            </>
          )
        }
      >
        {camp && (
          <div className="space-y-5">
            <AreaChart
              labels={["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"]}
              series={[
                { name: isRoas(camp) ? "ROAS" : "Cost per result", data: camp.trend, tone: offTarget(camp) ? "late" : "accent" },
                { name: "Goal", data: camp.trend.map(() => camp.target), tone: "neutral", dashed: true },
              ]}
              format={(v) => (isRoas(camp) ? `${v.toFixed(1)}x` : `₹${num0(v)}`)}
              height={170}
            />
            <KV items={[{ k: "Results", v: isRoas(camp) ? `${camp.results.toFixed(1)}x ROAS` : camp.results.toLocaleString("en-IN") }, { k: "Goal", v: isRoas(camp) ? `${camp.target}x` : `₹${num0(camp.target)} per result` }, { k: "Daily budget", v: inr(camp.daily) }, { k: "Client AM", v: clientOf(camp.client).am }]} />
            <p className="rounded-[12px] bg-d-soft px-3 py-2 text-[12.5px]">
              <Sparkles className="mr-1 inline h-3.5 w-3.5 text-d-accent" />
              {offTarget(camp) ? "Trending away from goal for 5 days. Cut budget 20% and refresh the top two creatives before scaling again." : "On goal with room to grow. Scale 20% every 3 days while frequency stays under 2.5."}
            </p>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Content calendar ---------------- */

const formatIcon: Record<Post["format"], typeof Clapperboard> = { Reel: Clapperboard, Carousel: ImageIcon, Story: Flame, Static: ImageIcon, Short: Clapperboard, Blog: FileText };
const postTone: Record<Post["status"], Tone> = { Draft: "neutral", "Client review": "warn", Approved: "info", Scheduled: "accent", Posted: "ok" };

function CalendarModule() {
  const desk = useDesk();
  const [posts, setPosts] = React.useState(SEED_POSTS);
  const [who, setWho] = React.useState<"All" | "Rehan" | "Ishita" | "Priya">("All");
  const [open, setOpen] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);
  const post = posts.find((p) => p.id === open) ?? null;
  const shown = posts.filter((p) => who === "All" || p.owner === who);
  const review = posts.filter((p) => p.status === "Client review");
  const formats = (["Reel", "Carousel", "Story", "Static", "Short", "Blog"] as const).map((f, i) => ({ label: f, value: posts.filter((p) => p.format === f).length, tone: (["accent", "info", "warn", "ok", "late", "neutral"] as const)[i] }));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Posts this week" value={posts.length} hint="14 handles" icon={CalendarRange} />
        <Stat label="Waiting on clients" value={review.length} hint="oldest 2 days" icon={Clock3} tone="warn" />
        <Stat label="Scheduled or posted" value={posts.filter((p) => p.status === "Scheduled" || p.status === "Posted").length} icon={Send} tone="ok" />
        <Stat label="Diwali posts planned" value="46" delta="+12" hint="for 9 clients, till 9 Nov" icon={Sparkles} trend={[8, 15, 21, 28, 34, 40, 46]} />
      </div>
      <Panel
        title="Week of 19 October"
        sub="Drag a post between days. Status moves with a click on the card."
        action={
          <>
            <Segmented size="sm" options={["All", "Rehan", "Ishita", "Priya"] as const} value={who} onChange={setWho} />
            <Btn size="sm" variant="solid" icon={Plus} onClick={() => setAdding(true)}>
              New post
            </Btn>
          </>
        }
      >
        <Board
          columns={WEEK.map((d, i) => ({ id: String(i), label: i === 1 ? `${d} · today` : d, tone: i === 1 ? ("accent" as const) : i < 1 ? ("ok" as const) : ("neutral" as const) }))}
          items={shown}
          itemKey={(p) => p.id}
          getColumn={(p) => String(p.day)}
          minColumnWidth={158}
          onMove={(id, col) => {
            const p = posts.find((x) => x.id === id);
            if (!p || String(p.day) === col) return;
            setPosts((cur) => cur.map((x) => (x.id === id ? { ...x, day: Number(col) } : x)));
            toast.success(`Moved to ${WEEK[Number(col)]}`, { description: `${clientOf(p.client).short} · ${p.title}` });
            desk.log(`${clientOf(p.client).short} post moved to ${WEEK[Number(col)]}`, "info");
          }}
          renderCard={(p) => {
            const Icon = formatIcon[p.format];
            return (
              <button type="button" onClick={() => setOpen(p.id)} className="block w-full text-left">
                <span className="flex items-center gap-1.5 pr-3 text-[10.5px] font-semibold uppercase tracking-wide text-d-accent">
                  <Icon className="h-3 w-3" /> {p.format}
                </span>
                <span className="mt-1 block text-[12.5px] font-semibold leading-snug">{p.title}</span>
                <span className="block truncate text-[11px] text-d-mute">{clientOf(p.client).short}</span>
                <span className="mt-1.5 flex items-center gap-1.5">
                  <Pill tone={postTone[p.status]}>{p.status}</Pill>
                  <span className="ml-auto">
                    <Avatar name={p.owner} size={18} />
                  </span>
                </span>
              </button>
            );
          }}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel icon={Clock3} title="Waiting on client approval" sub="Approve on the client's behalf only with written OK on WhatsApp">
          <ApprovalQueue
            approveLabel="Mark approved"
            holdLabel="Nudge"
            items={review.map((p) => ({ id: p.id, title: `${clientOf(p.client).short} · ${p.title}`, sub: `${p.format} · due ${WEEK[p.day]} · ${p.owner}`, meta: p.day <= 2 ? "due soon" : undefined, tone: "late" as const }))}
            onDecide={(id, d) => {
              if (d === "approved") setPosts((cur) => cur.map((x) => (x.id === id ? { ...x, status: "Approved" } : x)));
              if (d === "held") desk.log(`Nudged client on ${id}`, "info");
              if (d === "approved") desk.log(`Post ${id} approved`, "ok");
            }}
          />
        </Panel>
        <Panel title="Format mix" sub="This week across all clients">
          <Donut size={150} center={posts.length} sub="posts" segments={formats} />
        </Panel>
      </div>
      <Sheet
        open={!!post}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={post ? `${post.id} · ${post.format} · ${WEEK[post.day]}` : ""}
        title={post?.title ?? ""}
        sub={post ? `${clientOf(post.client).name} · ${post.owner}` : ""}
        footer={<Btn variant="solid" onClick={() => setOpen(null)}>Done</Btn>}
      >
        {post && (
          <div className="space-y-4">
            <div className="flex aspect-[4/5] max-h-[260px] w-full items-center justify-center rounded-[16px] text-d-accent-ink" style={{ background: "linear-gradient(140deg, var(--d-accent), color-mix(in oklab, var(--d-accent) 40%, var(--d-info)))" }}>
              <div className="px-6 text-center">
                <p className="text-[11px] uppercase tracking-[0.2em] opacity-80">{clientOf(post.client).short}</p>
                <p className="mt-2 text-[20px] font-bold leading-tight">{post.title}</p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Status</p>
              <Segmented
                size="sm"
                options={(["Draft", "Client review", "Approved", "Scheduled", "Posted"] as const).map((s) => ({ value: s, label: s }))}
                value={post.status}
                onChange={(v) => {
                  setPosts((cur) => cur.map((x) => (x.id === post.id ? { ...x, status: v } : x)));
                  toast.success(`${post.title}: ${v}`);
                  desk.log(`${clientOf(post.client).short} post → ${v}`);
                }}
              />
            </div>
            <Field label="Caption">
              <textarea className={`${inputClass} h-24 py-2`} defaultValue={`${post.title}. ✨ Book now, link in bio. #Mumbai #${clientOf(post.client).area.replace(/\s/g, "")}`} />
            </Field>
          </div>
        )}
      </Sheet>
      <NewPost
        open={adding}
        onOpenChange={setAdding}
        onAdd={(p) => {
          setPosts((cur) => [...cur, p]);
          toast.success("Post added", { description: `${clientOf(p.client).short} · ${WEEK[p.day]}` });
          desk.log(`New ${p.format.toLowerCase()} planned for ${clientOf(p.client).short}`, "info");
        }}
        nextId={`P-${posts.length + 1}`}
      />
    </div>
  );
}

function NewPost({ open, onOpenChange, onAdd, nextId }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (p: Post) => void; nextId: string }) {
  const [client, setClient] = React.useState("ghatkopar-gold");
  const [title, setTitle] = React.useState("Dhanteras countdown: 7 days");
  const [format, setFormat] = React.useState<Post["format"]>("Reel");
  const [day, setDay] = React.useState("3");
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Plan a post" sub="It lands as a draft with the content lead; the client sees it once it's in review.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onAdd({ id: nextId, client, title, format, day: Number(day), status: "Draft", owner: format === "Reel" || format === "Short" ? "Rehan" : "Ishita" });
          onOpenChange(false);
        }}
      >
        <Field label="Client">
          <select className={inputClass} value={client} onChange={(e) => setClient(e.target.value)}>
            {CLIENTS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Idea">
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Format">
            <select className={inputClass} value={format} onChange={(e) => setFormat(e.target.value as Post["format"])}>
              {["Reel", "Carousel", "Story", "Static", "Short", "Blog"].map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </Field>
          <Field label="Day">
            <select className={inputClass} value={day} onChange={(e) => setDay(e.target.value)}>
              {WEEK.map((d, i) => (
                <option key={d} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Btn onClick={() => onOpenChange(false)}>Cancel</Btn>
          <Btn variant="solid" type="submit" icon={Plus}>
            Add to calendar
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Reports ---------------- */

const reportTone: Record<Report["status"], Tone> = { Drafted: "info", "Needs review": "warn", Approved: "accent", Sent: "ok" };

function ReportsModule({ store }: { store: Store }) {
  const desk = useDesk();
  const { reports, setReports } = store;
  const [open, setOpen] = React.useState<string | null>(null);
  const r = reports.find((x) => x.id === open) ?? null;
  const send = (ids: string[], via: string) => {
    setReports((cur) => cur.map((x) => (ids.includes(x.id) ? { ...x, status: "Sent" } : x)));
    toast.success(`${ids.length} report${ids.length > 1 ? "s" : ""} sent`, { description: `${via} · PDF and live dashboard link` });
    desk.log(`${ids.length} Week 42 report${ids.length > 1 ? "s" : ""} sent on ${via}`, "ok");
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Week 42 drafts" value={reports.length} hint="written by Report Writer at 7 AM" icon={FileText} />
        <Stat label="Need a human note" value={reports.filter((x) => x.status === "Needs review").length} hint="below target or touchy" icon={AlertTriangle} tone="warn" />
        <Stat label="Sent" value={reports.filter((x) => x.status === "Sent").length} icon={Send} tone="ok" />
        <Stat label="Hours saved this month" value="31 h" delta="+9 h" hint="vs manual decks" icon={Timer} trend={[12, 16, 19, 22, 26, 28, 31]} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Panel title="Report queue" sub="Tick the healthy ones and send in one go. Click to read and edit.">
          <DataTable
            rows={reports}
            rowKey={(x) => x.id}
            search={(x) => `${clientOf(x.client).name} ${x.highlight}`}
            searchPlaceholder="Search client or highlight"
            filter={{ get: (x) => x.status, options: ["Needs review", "Drafted", "Approved", "Sent"] }}
            onRow={(x) => setOpen(x.id)}
            bulk={[
              { label: "Send on WhatsApp", run: (k) => send(k, "WhatsApp") },
              { label: "Send by email", run: (k) => send(k, "Email") },
            ]}
            columns={[
              { key: "c", label: "Client", render: (x) => <span className="font-medium">{clientOf(x.client).short}</span>, sort: (x) => clientOf(x.client).short },
              { key: "h", label: "Highlight", render: (x) => <span className="text-d-mute">{x.highlight}</span>, wide: true },
              { key: "d", label: "vs target", align: "right", render: (x) => <span className="tnum font-mono" style={{ color: x.kpiDelta < 0 ? "var(--d-late)" : "var(--d-ok)" }}>{x.kpiDelta > 0 ? "+" : ""}{x.kpiDelta}%</span>, sort: (x) => x.kpiDelta },
              { key: "s", label: "Status", render: (x) => <Pill tone={reportTone[x.status]}>{x.status}</Pill> },
            ]}
          />
        </Panel>
        <Panel title="Week 42 at a glance" sub="KPI vs target, all reports">
          <Bars
            height={190}
            format={(v) => `${v}`}
            data={[
              { label: "> +10%", value: reports.filter((x) => x.kpiDelta > 10).length, tone: "ok" },
              { label: "0 to 10%", value: reports.filter((x) => x.kpiDelta >= 0 && x.kpiDelta <= 10).length, tone: "accent" },
              { label: "−10 to 0", value: reports.filter((x) => x.kpiDelta < 0 && x.kpiDelta >= -10).length, tone: "warn" },
              { label: "< −10%", value: reports.filter((x) => x.kpiDelta < -10).length, tone: "late" },
            ]}
          />
          <p className="mt-3 text-[12px] leading-relaxed text-d-mute">Reports below −10% never send automatically. The AM adds a plan before it goes.</p>
        </Panel>
      </div>
      <Sheet
        open={!!r}
        onOpenChange={(o) => !o && setOpen(null)}
        width={540}
        eyebrow={r ? `${r.period} · ${r.status}` : ""}
        title={r ? `${clientOf(r.client).name}` : ""}
        sub={r ? `Prepared for the ${clientOf(r.client).short} WhatsApp group · AM ${clientOf(r.client).am}` : ""}
        footer={
          r && (
            <>
              <Btn icon={Mail} onClick={() => { send([r.id], "Email"); setOpen(null); }}>
                Email
              </Btn>
              <Btn variant="solid" icon={MessageCircle} onClick={() => { send([r.id], "WhatsApp"); setOpen(null); }}>
                Send on WhatsApp
              </Btn>
            </>
          )
        }
      >
        {r && (
          <div className="space-y-4">
            {r.flag && (
              <p className="flex gap-2 rounded-[12px] border border-d-warn/40 bg-[color-mix(in_oklab,var(--d-warn)_10%,var(--d-panel))] px-3 py-2 text-[12.5px]">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-d-warn" /> {r.flag}
              </p>
            )}
            <div className="grid grid-cols-3 gap-2">
              {(() => {
                const c = clientOf(r.client);
                return [
                  { k: c.kpi, v: c.kpi === "ROAS" ? `${c.actual.toFixed(1)}x` : c.actual.toLocaleString("en-IN") },
                  { k: "vs target", v: `${r.kpiDelta > 0 ? "+" : ""}${r.kpiDelta}%` },
                  { k: "Spend", v: inr(c.spend, { compact: true }) },
                ].map((t) => (
                  <div key={t.k} className="rounded-[12px] bg-d-sunk/70 p-2.5">
                    <p className="truncate text-[11px] text-d-mute">{t.k}</p>
                    <p className="tnum font-mono text-[17px] font-semibold">{t.v}</p>
                  </div>
                ));
              })()}
            </div>
            <Field label="Summary (edit before sending)">
              <textarea
                className={`${inputClass} h-36 py-2 leading-relaxed`}
                defaultValue={`Hi team, here's Week 42.\n\n${r.highlight}.\n\n${r.kpiDelta < 0 ? "What we're changing this week: budget shifted to the best-performing ad sets, two new creatives going live Thursday, and a daily update from us until we're back on target." : "What's next: we'll scale the winners 20% and test two new hooks for Diwali."}\n\n— ${clientOf(r.client).am}, Andheri Growth Studio`}
              />
            </Field>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Retainers & billing ---------------- */

function BillingModule({ store }: { store: Store }) {
  const desk = useDesk();
  const [paid, setPaid] = React.useState<Set<string>>(new Set());
  const [open, setOpen] = React.useState<string | null>(null);
  const [raised, setRaised] = React.useState(false);
  const c = open ? clientOf(open) : null;
  const rows = CLIENTS.map((x, i) => ({ ...x, inv: `AGS/26-27/${String(181 + i).padStart(3, "0")}`, gross: Math.round(x.mrr * 1.18), state: paid.has(x.id) ? "Paid" : x.overdue ? "Overdue" : i % 3 === 0 ? "Sent" : "Paid" }));
  const overdue = rows.filter((r) => r.state === "Overdue");
  const buckets = [
    { label: "Not due", value: rows.filter((r) => r.state === "Sent").reduce((a, r) => a + r.gross, 0), tone: "ok" as const },
    { label: "1–15 days", value: overdue.filter((r) => r.overdue <= 15).reduce((a, r) => a + r.gross, 0), tone: "warn" as const },
    { label: "16–30 days", value: overdue.filter((r) => r.overdue > 15 && r.overdue <= 30).reduce((a, r) => a + r.gross, 0), tone: "late" as const },
    { label: "30+ days", value: overdue.filter((r) => r.overdue > 30).reduce((a, r) => a + r.gross, 0), tone: "late" as const },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Monthly retainers" value={inr(mrrTotal, { compact: true })} delta="+6%" hint="22 clients, before GST" icon={IndianRupee} trend={[14.1, 14.9, 15.6, 16.2, 16.8, 17.4, mrrTotal / 1e5]} />
        <Stat label="Overdue" value={inr(overdue.reduce((a, r) => a + r.gross, 0), { compact: true })} hint={`${overdue.length} invoices incl. GST`} icon={AlertTriangle} tone="late" />
        <Stat label="Renewing in 45 days" value={CLIENTS.filter((x) => x.renewal <= 45).length} hint={inr(CLIENTS.filter((x) => x.renewal <= 45).reduce((a, x) => a + x.mrr, 0), { compact: true }) + "/mo"} icon={CalendarRange} tone="warn" />
        <Stat label="Net revenue retention" value="104%" delta="+3 pts" hint="trailing 12 months" icon={TrendingUp} tone="ok" />
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Retainer revenue" sub="Monthly, before GST, ₹ lakh">
          <AreaChart labels={["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"]} series={[{ name: "MRR", data: [11.2, 11.6, 12.4, 12.9, 13.5, 14.1, 14.9, 15.6, 16.2, 16.8, 17.4, mrrTotal / 1e5], tone: "accent" }, { name: "Churned", data: [0.4, 0, 0.6, 0.3, 0, 0.5, 0, 0.45, 0, 0.3, 0, 0], tone: "late" }]} format={(v) => `₹${v.toFixed(1)}L`} height={190} />
        </Panel>
        <Panel title="Receivables" sub="Zoho Books, incl. 18% GST">
          <AgingBar buckets={buckets} format={(v) => inr(v, { compact: true })} />
          <div className="mt-5 rounded-[14px] bg-d-sunk/70 p-3">
            <p className="text-[13px] font-semibold">November invoices</p>
            <p className="text-[12px] text-d-mute">22 drafts · {inr(Math.round(mrrTotal * 1.18), { compact: true })} incl. GST · go out 1 Nov</p>
            <Btn
              size="sm"
              variant={raised ? "soft" : "solid"}
              icon={Send}
              className="mt-2"
              disabled={raised}
              onClick={() => {
                setRaised(true);
                toast.success("22 invoices scheduled", { description: "Zoho Books will email them with UPI links on 1 Nov, 9 AM" });
                desk.log("November retainer invoices scheduled", "ok");
              }}
            >
              {raised ? "Scheduled for 1 Nov" : "Approve & schedule"}
            </Btn>
          </div>
        </Panel>
      </div>
      <Panel title="All retainers" sub="Click a client for the contract and renewal">
        <DataTable
          rows={rows}
          rowKey={(r) => r.id}
          search={(r) => `${r.name} ${r.inv} ${r.am}`}
          searchPlaceholder="Search client, invoice or AM"
          filter={{ get: (r) => r.state, options: ["Overdue", "Sent", "Paid"] }}
          onRow={(r) => setOpen(r.id)}
          pageSize={10}
          bulk={[{ label: "Send reminders", run: (k) => { toast.success(`${k.length} reminders sent`, { description: "WhatsApp + email with the UPI link" }); desk.log(`${k.length} retainer reminders sent`); } }]}
          columns={[
            { key: "n", label: "Client", render: (r) => <span className="font-medium">{r.name}</span>, sort: (r) => r.name },
            { key: "am", label: "AM", render: (r) => <span className="text-d-mute">{r.am}</span>, wide: true },
            { key: "mrr", label: "Retainer", align: "right", render: (r) => <span className="tnum font-mono">{inr(r.mrr, { compact: true })}</span>, sort: (r) => r.mrr },
            { key: "inv", label: "Oct invoice", render: (r) => <span className="font-mono text-[12px]">{r.inv}</span>, wide: true },
            { key: "st", label: "Status", render: (r) => <Pill tone={r.state === "Overdue" ? "late" : r.state === "Sent" ? "info" : "ok"}>{r.state === "Overdue" ? `Overdue ${r.overdue}d` : r.state}</Pill> },
            { key: "ren", label: "Renews", align: "right", render: (r) => <span className="tnum font-mono" style={{ color: r.renewal <= 30 ? "var(--d-late)" : undefined }}>{r.renewal}d</span>, sort: (r) => r.renewal },
            { key: "h", label: "Health", align: "right", render: (r) => <span className="tnum font-mono font-semibold" style={{ color: `var(--d-${toneOfHealth(healthOf(r))})` }}>{healthOf(r)}</span>, sort: (r) => healthOf(r) },
          ]}
        />
      </Panel>
      <Sheet
        open={!!c}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={c ? `Retainer · ${c.tenure} months` : ""}
        title={c?.name ?? ""}
        sub={c ? `${inr(c.mrr)}/month + GST · AM ${c.am}` : ""}
        footer={
          c && (
            <>
              <Btn icon={HeartPulse} onClick={() => { store.openClient(c.id); setOpen(null); }}>
                Client pulse
              </Btn>
              {c.overdue > 0 && !paid.has(c.id) ? (
                <Btn variant="solid" icon={IndianRupee} onClick={() => { setPaid((s) => new Set(s).add(c.id)); toast.success("Payment recorded", { description: `${c.name} · ${inr(Math.round(c.mrr * 1.18))} via UPI` }); desk.log(`${c.name} paid ${inr(Math.round(c.mrr * 1.18))}`, "ok"); setOpen(null); }}>
                  Mark paid
                </Btn>
              ) : (
                <Btn variant="solid" icon={Send} onClick={() => { toast.success("Renewal proposal sent", { description: `${c.name} · same fee, 12 months, ROAS floor clause` }); desk.log(`Renewal proposal sent to ${c.name}`, "info"); setOpen(null); }}>
                  Send renewal
                </Btn>
              )}
            </>
          )
        }
      >
        {c && (
          <div className="space-y-4">
            <KV items={[{ k: "Retainer", v: inr(c.mrr) }, { k: "GST 18%", v: inr(c.mrr * 0.18) }, { k: "Scope", v: c.services.join(", ") }, { k: "Hours included", v: `${c.hoursAllowed} h/month` }, { k: "Renews in", v: <Countdown compact inHours={c.renewal * 24} /> }, { k: "Overdue", v: c.overdue && !paid.has(c.id) ? `${c.overdue} days` : "No" }]} />
            <div>
              <p className="mb-1.5 text-[12px] font-medium text-d-mute">Hours used this month</p>
              <Meter value={c.hoursUsed} max={Math.max(c.hoursAllowed, c.hoursUsed)} tone={c.hoursUsed > c.hoursAllowed ? "late" : "accent"} />
              <p className="mt-1 font-mono text-[11.5px] text-d-mute">
                {c.hoursUsed} of {c.hoursAllowed} h {c.hoursUsed > c.hoursAllowed ? "· over-servicing" : ""}
              </p>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ---------------- Team utilisation ---------------- */

const PEOPLE = ["Aarav", "Zoya", "Kabir", "Ishita", "Rehan", "Priya", "Tanvi"];
const UCLIENTS = ["ledgerloop", "worli-wealth", "thane-realty", "ghatkopar-gold", "kurla-kicks", "colaba-brew", "powai-prep", "saki-steel", "bandra-bites", "navi-interiors"];
const HOURS = [
  [42, 6, 30, 4, 8, 0, 6, 22, 2, 12],
  [6, 24, 4, 2, 22, 26, 2, 0, 2, 4],
  [10, 4, 12, 26, 18, 6, 24, 4, 20, 6],
  [22, 22, 6, 10, 8, 12, 8, 6, 4, 6],
  [8, 6, 8, 18, 22, 16, 10, 2, 8, 12],
  [2, 6, 4, 6, 4, 10, 4, 2, 4, 2],
  [28, 11, 7, 3, 2, 4, 4, 19, 1, 2],
];

function UtilisationModule() {
  const desk = useDesk();
  const [person, setPerson] = React.useState<number | null>(null);
  const totals = PEOPLE.map((_, i) => HOURS[i].reduce((a, h) => a + h, 0) + [36, 32, 44, 30, 46, 58, 40][i]);
  const capacity = 160;
  const perClient = UCLIENTS.map((id, j) => ({ c: clientOf(id), used: HOURS.reduce((a, row) => a + row[j], 0) }));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Team utilisation" value="86%" delta="+5 pts" deltaGood={false} hint="target 75–80%" icon={Timer} tone="warn" trend={[74, 77, 79, 81, 83, 84, 86]} />
        <Stat label="Billable share" value="71%" hint="of logged hours" icon={CircleDollarSign} tone="ok" />
        <Stat label="Over-serviced clients" value={perClient.filter((p) => p.used > p.c.hoursAllowed).length} hint="hours above retainer" icon={AlertTriangle} tone="late" />
        <Stat label="Effective rate" value="₹1,640/h" delta="−₹160" deltaGood={false} hint="target ₹1,800/h" icon={IndianRupee} />
      </div>
      <Panel title="Hours by person and client, October" sub="Top 10 retainers. Click a cell to see what the hours went into.">
        <HeatGrid
          rows={PEOPLE}
          cols={UCLIENTS.map((id) => clientOf(id).short)}
          values={HOURS}
          format={(v) => (v ? String(v) : "·")}
          onCell={(r, c) => {
            setPerson(r);
            toast(`${PEOPLE[r]} on ${clientOf(UCLIENTS[c]).short}`, { description: `${HOURS[r][c]} h this month · ${["reporting", "creative", "campaign ops", "client calls"][(r + c) % 4]} took most of it` });
          }}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Panel title="Capacity this month" sub={`${capacity} working hours each`}>
          <ul className="space-y-3">
            {PEOPLE.map((p, i) => {
              const pct = Math.round((totals[i] / capacity) * 100);
              return (
                <li key={p}>
                  <button type="button" onClick={() => setPerson(i)} className={`w-full rounded-[12px] px-2 py-1.5 text-left ${person === i ? "bg-d-soft" : "hover:bg-d-sunk"}`}>
                    <span className="flex items-center gap-2 text-[13px]">
                      <Avatar name={p} size={24} tone={pct > 100 ? "late" : pct > 90 ? "warn" : "accent"} />
                      <span className="flex-1 font-medium">{p}</span>
                      <span className="tnum font-mono text-[12px]" style={{ color: pct > 100 ? "var(--d-late)" : undefined }}>
                        {totals[i]} h · {pct}%
                      </span>
                    </span>
                    <Meter value={Math.min(totals[i], capacity)} max={capacity} tone={pct > 100 ? "late" : pct > 90 ? "warn" : "accent"} className="mt-1.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>
        <Panel title="Hours used vs retainer allowance" sub="At ₹1,800/h. Red means we are giving hours away.">
          <DataTable
            rows={perClient}
            rowKey={(p) => p.c.id}
            dense
            columns={[
              { key: "c", label: "Client", render: (p) => <span className="font-medium">{p.c.short}</span>, sort: (p) => p.c.short },
              { key: "u", label: "Used", align: "right", render: (p) => <span className="tnum font-mono">{p.used} h</span>, sort: (p) => p.used },
              { key: "a", label: "Paid for", align: "right", render: (p) => <span className="tnum font-mono text-d-mute">{p.c.hoursAllowed} h</span> },
              { key: "r", label: "Effective ₹/h", align: "right", render: (p) => <span className="tnum font-mono" style={{ color: p.c.mrr / p.used < 1800 ? "var(--d-late)" : "var(--d-ok)" }}>{Math.round(p.c.mrr / p.used).toLocaleString("en-IN")}</span>, sort: (p) => p.c.mrr / p.used },
              {
                key: "x",
                label: "",
                align: "right",
                render: (p) =>
                  p.used > p.c.hoursAllowed ? (
                    <Btn size="sm" variant="soft" onClick={() => { toast.success("Scope note drafted", { description: `${p.c.short}: ${p.used - p.c.hoursAllowed} extra hours, add-on at ₹1,800/h` }); desk.log(`Scope note drafted for ${p.c.short}`, "warn"); }}>
                      Scope note
                    </Btn>
                  ) : null,
              },
            ]}
          />
        </Panel>
      </div>
    </div>
  );
}

/* ---------------- New business ---------------- */

const NB_COLS: { id: Prospect["stage"]; label: string; tone: Tone }[] = [
  { id: "lead", label: "Enquiry", tone: "neutral" },
  { id: "discovery", label: "Discovery", tone: "info" },
  { id: "proposal", label: "Proposal", tone: "warn" },
  { id: "pitch", label: "Pitch", tone: "accent" },
  { id: "won", label: "Won", tone: "ok" },
];

function NewBizModule() {
  const desk = useDesk();
  const [items, setItems] = React.useState(SEED_PROSPECTS);
  const [open, setOpen] = React.useState<string | null>(null);
  const p = items.find((x) => x.id === open) ?? null;
  const active = items.filter((x) => x.stage !== "won");
  const weighted = active.reduce((a, x) => a + (x.mrr * x.prob) / 100, 0);
  const probFor: Record<Prospect["stage"], number> = { lead: 10, discovery: 25, proposal: 40, pitch: 55, won: 100 };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open pipeline" value={`${inr(active.reduce((a, x) => a + x.mrr, 0), { compact: true })}/mo`} hint={`${active.length} prospects`} icon={Briefcase} />
        <Stat label="Weighted" value={`${inr(weighted, { compact: true })}/mo`} icon={Target} tone="info" />
        <Stat label="Won this quarter" value={items.filter((x) => x.stage === "won").length + 2} hint="₹2.15 L/mo added" icon={Trophy} tone="ok" />
        <Stat label="Pitch win rate" value="38%" delta="+6 pts" hint="last 12 pitches" icon={TrendingUp} trend={[25, 28, 30, 31, 33, 36, 38]} />
      </div>
      <Panel title="Pipeline" sub="Drag a prospect to move it. Probability updates with the stage.">
        <Board
          columns={NB_COLS}
          items={items}
          itemKey={(x) => x.id}
          getColumn={(x) => x.stage}
          minColumnWidth={200}
          onMove={(id, col) => {
            const x = items.find((i) => i.id === id);
            if (!x || x.stage === col) return;
            const stage = col as Prospect["stage"];
            setItems((cur) => cur.map((i) => (i.id === id ? { ...i, stage, prob: probFor[stage] } : i)));
            if (stage === "won") toast.success(`${x.name} signed`, { description: `${inr(x.mrr, { compact: true })}/month · kick-off checklist created` });
            else toast.success(`${x.name} → ${NB_COLS.find((c) => c.id === stage)?.label}`);
            desk.log(`${x.name} moved to ${NB_COLS.find((c) => c.id === stage)?.label}`, stage === "won" ? "ok" : "info");
          }}
          renderCard={(x) => (
            <button type="button" onClick={() => setOpen(x.id)} className="block w-full text-left">
              <span className="block pr-3 text-[13px] font-semibold leading-snug">{x.name}</span>
              <span className="block text-[11.5px] text-d-mute">{x.category}</span>
              <span className="mt-2 flex items-center gap-1.5">
                <span className="tnum font-mono text-[12px] font-semibold">{inr(x.mrr, { compact: true })}/mo</span>
                <span className="ml-auto font-mono text-[11px] text-d-mute">{x.prob}%</span>
                <Avatar name={x.owner} size={20} />
              </span>
              <span className="mt-1.5 block truncate text-[11px] text-d-accent">→ {x.next}</span>
            </button>
          )}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Where new clients come from" sub="Signed retainers, last 24 months">
          <HBars
            data={[
              { label: "Client referrals", value: 11, tone: "accent" },
              { label: "Inbound website", value: 5, tone: "info" },
              { label: "LinkedIn (Tanvi's posts)", value: 4, tone: "ok" },
              { label: "Clutch & directories", value: 1, tone: "warn" },
              { label: "Cold outreach", value: 1, tone: "neutral" },
            ]}
          />
        </Panel>
        <Panel icon={Lightbulb} title="Referral asks this month" sub="Happy clients who haven't referred anyone yet">
          <ul className="divide-y divide-d-line">
            {CLIENTS.filter((c) => c.sentiment >= 85)
              .slice(0, 5)
              .map((c) => (
                <li key={c.id} className="flex items-center gap-3 py-2.5">
                  <Avatar name={c.short} size={28} tone="ok" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium">{c.name}</p>
                    <p className="truncate text-[11.5px] text-d-mute">Mood {c.sentiment} · {c.tenure} months with us</p>
                  </div>
                  <Btn size="sm" variant="soft" onClick={() => { toast.success("Referral ask sent", { description: `${c.am} asked ${c.short} for two intros` }); desk.log(`Referral ask sent to ${c.name}`); }}>
                    Ask
                  </Btn>
                </li>
              ))}
          </ul>
        </Panel>
      </div>
      <Sheet
        open={!!p}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={p ? `${p.id} · ${p.source}` : ""}
        title={p?.name ?? ""}
        sub={p ? `${p.category} · owner ${p.owner}` : ""}
        footer={
          p && (
            <Btn variant="solid" icon={Send} onClick={() => { toast.success("Proposal sent", { description: `${p.name} · ${inr(p.mrr, { compact: true })}/month, 3 options` }); desk.log(`Proposal sent to ${p.name}`, "info"); setOpen(null); }}>
              Send proposal
            </Btn>
          )
        }
      >
        {p && (
          <div className="space-y-4">
            <KV items={[{ k: "Retainer", v: `${inr(p.mrr)}/month` }, { k: "Probability", v: `${p.prob}%` }, { k: "Stage", v: NB_COLS.find((c) => c.id === p.stage)?.label }, { k: "Next step", v: p.next }]} />
            <div>
              <p className="mb-2 text-[12px] font-medium text-d-mute">Proposal options</p>
              <ul className="space-y-1.5">
                {[
                  { n: "Starter", s: "Social + 1 ad platform", f: 0.7 },
                  { n: "Growth", s: "Social, Meta + Google, monthly report", f: 1 },
                  { n: "Scale", s: "Everything + creative sprints + CRO", f: 1.45 },
                ].map((o) => (
                  <li key={o.n} className="flex items-center gap-3 rounded-[12px] border border-d-line px-3 py-2 text-[12.5px]">
                    <span className="w-16 font-semibold">{o.n}</span>
                    <span className="flex-1 text-d-mute">{o.s}</span>
                    <span className="tnum font-mono">{inr(Math.round((p.mrr * o.f) / 1000) * 1000, { compact: true })}</span>
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
