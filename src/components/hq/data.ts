import type { Announcement, ClientBuild, Lead, LeadSource, LeadStage, Notification, Person, Program, ProgramId, Student, Task } from "./types";

/* Integer hash so generated data is identical on the server and in the browser. */
function hash(n: number, salt = 7) {
  let t = Math.imul(n + 1, 0x9e3779b1) ^ Math.imul(salt + 3, 0x85ebca6b);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const pick = <T,>(list: readonly T[], n: number, salt = 1) => list[Math.floor(hash(n, salt) * list.length)];
const between = (min: number, max: number, n: number, salt = 2) => Math.round(min + hash(n, salt) * (max - min));

export const programs: Program[] = [
  { id: "workshop", name: "Business OS Workshop", short: "Workshop", price: 51, color: "#c9a24a" },
  { id: "launchpad", name: "AI Business Launchpad", short: "Launchpad", price: 24999, color: "#8a6a2f" },
  { id: "accelerator", name: "AI Automation Accelerator", short: "Accelerator", price: 74999, color: "#6e2b36" },
  { id: "systems", name: "AI Business Systems", short: "Systems", price: 149999, color: "#2f5d8a" },
  { id: "agents", name: "AI Agent Factory", short: "Agent Factory", price: 249999, color: "#3f6b4a" },
  { id: "dfy", name: "BuildBiz Automations (done for you)", short: "Done for you", price: 450000, color: "#1d1714" },
];
export const programById = Object.fromEntries(programs.map((p) => [p.id, p])) as Record<ProgramId, Program>;

export const team: Person[] = [
  { id: "amit", name: "Dr. Amit Moga", first: "Amit", initials: "AM", role: "founder", title: "Founder & CEO", color: "#6e2b36", online: true, target: 6000000 },
  { id: "rohan", name: "Rohan Kapoor", first: "Rohan", initials: "RK", role: "sales", title: "Head of Sales", color: "#b8862f", online: true, target: 2200000 },
  { id: "sneha", name: "Sneha Iyer", first: "Sneha", initials: "SI", role: "sales", title: "Senior Closer", color: "#2f5d8a", online: true, target: 1600000 },
  { id: "arjun", name: "Arjun Mehta", first: "Arjun", initials: "AR", role: "sales", title: "Business Advisor", color: "#3f6b4a", online: true, target: 1200000 },
  { id: "kavya", name: "Kavya Nair", first: "Kavya", initials: "KN", role: "sales", title: "Business Advisor", color: "#a4532c", online: false, target: 1200000 },
  { id: "imran", name: "Imran Sheikh", first: "Imran", initials: "IS", role: "sales", title: "Lead Qualifier (SDR)", color: "#5b4a8a", online: true, target: 800000 },
  { id: "neha", name: "Neha Gupta", first: "Neha", initials: "NG", role: "delivery", title: "Head of Delivery", color: "#1f6b5a", online: true, target: 6 },
  { id: "vikram", name: "Vikram Rao", first: "Vikram", initials: "VR", role: "delivery", title: "Solutions Architect", color: "#c4472f", online: true, target: 4 },
  { id: "priya", name: "Priya Shah", first: "Priya", initials: "PS", role: "delivery", title: "Student Success Coach", color: "#8a2f52", online: false, target: 40 },
  { id: "aditya", name: "Aditya Joshi", first: "Aditya", initials: "AJ", role: "ops", title: "Operations Manager", color: "#4a5560", online: true, target: 20 },
  { id: "meera", name: "Meera Pillai", first: "Meera", initials: "MP", role: "ops", title: "Performance Marketer", color: "#d08a1f", online: true, target: 30 },
  { id: "sahil", name: "Sahil Verma", first: "Sahil", initials: "SV", role: "ops", title: "Finance & Admin", color: "#2c4a6b", online: false, target: 15 },
];
export const personById = Object.fromEntries(team.map((p) => [p.id, p])) as Record<string, Person>;
export const salesTeam = team.filter((p) => p.role === "sales");

const firstNames = ["Rajesh", "Sunita", "Manoj", "Anita", "Harish", "Pooja", "Deepak", "Kiran", "Suresh", "Meenakshi", "Vivek", "Ritu", "Prakash", "Shalini", "Nitin", "Geeta", "Ashok", "Lata", "Sanjay", "Rekha", "Mahesh", "Neelam", "Gaurav", "Swati", "Ramesh", "Divya", "Alok", "Bhavna", "Tarun", "Payal"];
const lastNames = ["Agarwal", "Bansal", "Reddy", "Patel", "Jain", "Kulkarni", "Menon", "Chopra", "Saxena", "Goyal", "Shetty", "Malhotra", "Bhatt", "Desai", "Sinha", "Khanna", "Rathi", "Pandey", "Naidu", "Gill"];
const businesses: { industry: string; names: string[] }[] = [
  { industry: "Textile & garments", names: ["Shree Fabrics", "Kaveri Weaves", "Laxmi Garments", "Nandini Textiles"] },
  { industry: "Manufacturing", names: ["Precision Auto Parts", "Unique Castings", "Om Engineering", "Sai Polymers"] },
  { industry: "Distribution", names: ["Ganesh Agencies", "Balaji Distributors", "Royal Traders", "Surya Enterprises"] },
  { industry: "Healthcare", names: ["Care Dental Clinic", "LifeLine Diagnostics", "Apollo Pharma Agency", "Sanjeevani Hospital"] },
  { industry: "Real estate", names: ["Skyline Realty", "Urban Nest Builders", "Gokul Properties"] },
  { industry: "Education", names: ["Bright Minds Academy", "Excel Coaching", "Vidya Learning"] },
  { industry: "Retail", names: ["Fashion Hub", "Mobile World", "Kitchen Kart", "Shubh Jewellers"] },
  { industry: "Services", names: ["Pixel Media", "CA Partners & Co", "Swift Logistics", "Prime Interiors"] },
  { industry: "Food & hospitality", names: ["Spice Route Restaurants", "Annapurna Caterers", "Hotel Green Park"] },
];
const cities = ["Mumbai", "Pune", "Ahmedabad", "Surat", "Jaipur", "Indore", "Delhi", "Ludhiana", "Hyderabad", "Bengaluru", "Chennai", "Coimbatore", "Nagpur", "Lucknow", "Kochi", "Rajkot"];
const pains = [
  "Owner approves every purchase order; team waits",
  "Leads come from 4 places and nobody tracks follow-ups",
  "Sales team reports on WhatsApp, no single view of the pipeline",
  "Collections slip because reminders depend on one accountant",
  "Can't take a holiday without the business stalling",
  "Inventory in Tally and Excel never match",
  "Hiring more people but output isn't growing",
  "No idea which ad campaign actually brings paying customers",
];
const stages: LeadStage[] = ["New", "New", "Contacted", "Contacted", "Qualified", "Qualified", "Call booked", "Proposal", "Won", "Lost"];
const sources: LeadSource[] = ["Meta ads", "Meta ads", "Workshop", "Workshop", "Workshop", "Instagram", "YouTube", "Referral", "Website", "WhatsApp"];
const revenueBands = ["₹1-3 Cr", "₹3-5 Cr", "₹5-10 Cr", "₹10-25 Cr", "₹25-50 Cr", "₹50 Cr+"];
const outcomes = ["Connected", "No answer", "Busy", "Call back", "Connected", "Booked"] as const;
const callNotes = [
  "Interested in automating follow-ups for 12-person sales team",
  "Wants a demo of the distributor desk before deciding",
  "Asked about EMI on Accelerator; send payment plan",
  "Partner needs to join the next call",
  "Didn't pick up, try after 6 PM",
  "Busy with GST filing, call back Monday",
  "Very keen; budget approved for done-for-you build",
];

export const leads: Lead[] = Array.from({ length: 56 }, (_, i) => {
  const biz = pick(businesses, i, 3);
  const stage = pick(stages, i, 5);
  const interest = pick<ProgramId>(["launchpad", "accelerator", "accelerator", "systems", "agents", "dfy"], i, 6);
  const score = stage === "Lost" ? between(12, 40, i, 8) : between(38, 97, i, 8);
  const callsCount = stage === "New" ? 0 : between(1, 4, i, 9);
  const owner = pick(salesTeam, i, 4).id;
  const first = pick(firstNames, i, 11);
  return {
    id: `L-${2401 + i}`,
    name: `${first} ${pick(lastNames, i, 12)}`,
    company: pick(biz.names, i, 13),
    industry: biz.industry,
    city: pick(cities, i, 14),
    phone: `+91 9${between(100000000, 999999999, i, 15)}`,
    revenue: pick(revenueBands, i, 16),
    teamSize: between(6, 220, i, 17),
    source: pick(sources, i, 18),
    stage,
    owner,
    score,
    interest,
    value: programById[interest].price,
    followUpIn: between(-30, 72, i, 19),
    attendedWorkshop: hash(i, 20) > 0.35,
    pain: pick(pains, i, 21),
    calls: Array.from({ length: callsCount }, (_, k) => ({
      at: `${between(1, 9, i * 7 + k, 22)} Oct, ${between(10, 19, i * 7 + k, 23)}:${String(between(0, 59, i * 7 + k, 24)).padStart(2, "0")}`,
      by: owner,
      outcome: pick(outcomes, i * 7 + k, 25),
      minutes: between(1, 24, i * 7 + k, 26),
      note: pick(callNotes, i * 7 + k, 27),
    })),
    tags: [score > 80 ? "Hot" : score > 60 ? "Warm" : "Cold", ...(hash(i, 28) > 0.7 ? ["Decision maker"] : []), ...(hash(i, 29) > 0.8 ? ["EMI ask"] : [])],
  };
});

const cohorts = ["Oct '26 · Batch 14", "Sep '26 · Batch 13", "Aug '26 · Batch 12", "Jul '26 · Batch 11"];
export const students: Student[] = Array.from({ length: 140 }, (_, i) => {
  const biz = pick(businesses, i, 31);
  const program = pick<ProgramId>(["workshop", "workshop", "workshop", "launchpad", "launchpad", "accelerator", "accelerator", "systems", "agents"], i, 32);
  const price = programById[program].price;
  const paid = program === "workshop" ? price : Math.round(price * pick([0.3, 0.5, 1, 1, 1], i, 33));
  const progress = between(5, 100, i, 34);
  const attendance = between(30, 100, i, 35);
  const first = pick(firstNames, i, 36);
  const last = pick(lastNames, i, 37);
  return {
    id: `S-${10421 + i}`,
    name: `${first} ${last}`,
    business: pick(biz.names, i, 38),
    industry: biz.industry,
    city: pick(cities, i, 39),
    phone: `+91 9${between(100000000, 999999999, i, 40)}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@${pick(biz.names, i, 38).toLowerCase().replace(/[^a-z]/g, "").slice(0, 12)}.in`,
    program,
    cohort: pick(cohorts, i, 41),
    joined: `${between(1, 28, i, 42)} ${pick(["Jul", "Aug", "Sep", "Oct"], i, 43)} 2026`,
    attendance,
    progress,
    paid,
    due: price - paid,
    status: attendance < 45 ? "At risk" : progress >= 100 ? "Completed" : hash(i, 44) > 0.93 ? "Paused" : "Active",
    coach: pick(["priya", "neha", "vikram"], i, 45),
    access: { zoom: hash(i, 46) > 0.06, community: hash(i, 47) > 0.12, portal: hash(i, 48) > 0.18, blueprint: hash(i, 49) > 0.25, whatsapp: hash(i, 50) > 0.08 },
  };
});

export const clientBuilds: ClientBuild[] = [
  { id: "B-301", client: "Kaveri Weaves, Surat", industry: "Textile & garments", desk: "textile", value: 450000, paid: 315000, stage: "Build", lead: "vikram", progress: 62, goLiveIn: 12, health: "On track", modules: ["Style calendar", "Trims POs", "Line efficiency", "Dues"] },
  { id: "B-302", client: "Balaji Distributors, Nagpur", industry: "FMCG distribution", desk: "fmcg-route", value: 380000, paid: 190000, stage: "UAT", lead: "neha", progress: 84, goLiveIn: 4, health: "On track", modules: ["Beat route", "Van stock", "Collections"] },
  { id: "B-303", client: "Care Dental Clinic, Pune", industry: "Dental clinic", desk: "dental", value: 240000, paid: 240000, stage: "Live", lead: "vikram", progress: 100, goLiveIn: 0, health: "On track", modules: ["Chair map", "Recalls", "Billing"] },
  { id: "B-304", client: "Precision Auto Parts, Ludhiana", industry: "Auto parts export", desk: "auto-parts", value: 520000, paid: 156000, stage: "Blueprint", lead: "neha", progress: 28, goLiveIn: 31, health: "At risk", modules: ["Part match", "Export lots", "PPAP"] },
  { id: "B-305", client: "Shubh Jewellers, Thrissur", industry: "Jewellery showroom", desk: "jewellery", value: 310000, paid: 93000, stage: "Discovery", lead: "vikram", progress: 10, goLiveIn: 44, health: "On track", modules: ["Tray tally", "Schemes", "Karigar orders"] },
  { id: "B-306", client: "Spice Route Restaurants, Hyderabad", industry: "Restaurant & cloud kitchen", desk: "restaurant", value: 290000, paid: 203000, stage: "Build", lead: "neha", progress: 55, goLiveIn: 16, health: "Blocked", modules: ["Kitchen pass", "Aggregators", "Wastage"] },
  { id: "B-307", client: "Apollo Pharma Agency, Indore", industry: "Pharma distributor", desk: "pharma-distribution", value: 410000, paid: 410000, stage: "Go-live", lead: "vikram", progress: 96, goLiveIn: 1, health: "On track", modules: ["Expiry radar", "Chemist credit", "Cold chain"] },
  { id: "B-308", client: "Skyline Realty, Noida", industry: "Real estate brokerage", desk: "realty", value: 260000, paid: 78000, stage: "Blueprint", lead: "neha", progress: 22, goLiveIn: 27, health: "On track", modules: ["Corridor match", "Site visits", "Commissions"] },
];

const taskSeeds: [string, string, Task["area"], Task["priority"]][] = [
  ["Call back 9 hot leads from Tuesday's workshop", "rohan", "Sales", "P0"],
  ["Send Accelerator EMI plan to Harish Patel", "sneha", "Sales", "P1"],
  ["Prepare demo of distributor desk for Balaji call", "arjun", "Sales", "P1"],
  ["Qualify 34 new Meta leads before 1 PM", "imran", "Sales", "P0"],
  ["UAT sign-off with Balaji Distributors", "neha", "Delivery", "P0"],
  ["Fix Swiggy sync on Spice Route build", "vikram", "Delivery", "P0"],
  ["Blueprint workshop with Precision Auto Parts", "neha", "Delivery", "P1"],
  ["Share Batch 14 recordings and blueprint pack", "priya", "Delivery", "P1"],
  ["Nudge 18 at-risk students who missed day 2", "priya", "Delivery", "P1"],
  ["Scale winning ad set (Reels, owners 35-55) by 20%", "meera", "Marketing", "P1"],
  ["New creative: 'Your business runs without you'", "meera", "Marketing", "P2"],
  ["Book Zoom webinar licence for November batch", "aditya", "Ops", "P2"],
  ["Reconcile Razorpay settlements for October", "sahil", "Finance", "P1"],
  ["GST filing for September", "sahil", "Finance", "P0"],
  ["Weekly leadership review deck", "amit", "Ops", "P1"],
  ["Record new module for Agent Factory", "amit", "Delivery", "P2"],
  ["Update sales script with new objection handling", "rohan", "Sales", "P2"],
  ["Collect testimonials from Batch 12 graduates", "priya", "Marketing", "P2"],
  ["Hire 2 business advisors: shortlist", "aditya", "Ops", "P1"],
  ["Proposal for Shubh Jewellers done-for-you build", "rohan", "Sales", "P1"],
  ["Renew Interakt WhatsApp API plan", "aditya", "Ops", "P3"],
  ["Case study: Care Dental chair-map results", "meera", "Marketing", "P2"],
  ["Payment follow-up: Skyline Realty milestone 2", "sahil", "Finance", "P1"],
  ["Workshop slide refresh for Batch 15", "amit", "Marketing", "P2"],
];
const statuses: Task["status"][] = ["Todo", "Todo", "In progress", "In progress", "Review", "Done"];
export const tasks: Task[] = taskSeeds.map(([title, owner, area, priority], i) => {
  const dueIn = between(-3, 9, i, 61);
  return {
    id: `T-${880 + i}`,
    title,
    owner,
    area,
    priority,
    status: pick(statuses, i, 62),
    dueIn,
    due: dueIn === 0 ? "Today" : dueIn === 1 ? "Tomorrow" : dueIn < 0 ? `${-dueIn}d overdue` : `in ${dueIn}d`,
    aiDrafted: hash(i, 63) > 0.7,
    subtasks: hash(i, 64) > 0.5 ? [{ title: "Draft", done: true }, { title: "Review with lead", done: hash(i, 65) > 0.5 }, { title: "Ship", done: false }] : undefined,
  };
});

export const announcements: Announcement[] = [
  { id: "A-1", title: "Batch 14 crossed 1,240 registrations", body: "Biggest workshop yet. Day 2 starts 9 PM tonight. Sales: every attendee who stays past the Q&A gets a call within 24 hours. Delivery: blueprint pack goes out at 11:30 PM.", by: "amit", at: "Today, 9:05 AM", pinned: true, audience: "Everyone", reactions: { "🔥": 9, "👏": 6 }, acks: ["rohan", "neha", "sneha", "meera", "aditya"] },
  { id: "A-2", title: "New close-rate target: 18% on qualified calls", body: "We closed 14.2% last month. With the new demo flow (show their industry desk live in the first 5 minutes) we should hit 18%. Rohan is running a 30-minute drill at 11.", by: "rohan", at: "Today, 8:40 AM", audience: "Sales", reactions: { "💪": 4 }, acks: ["sneha", "arjun"] },
  { id: "A-3", title: "Balaji Distributors goes live Friday", body: "UAT is 84% done. Vikram and Neha own the cut-over. Please don't book Vikram for anything Thursday.", by: "neha", at: "Yesterday, 6:15 PM", audience: "Delivery", reactions: { "🚀": 5 }, acks: ["vikram", "priya"] },
  { id: "A-4", title: "Diwali leave calendar is open", body: "Mark your leave by 25 Oct. We run a skeleton crew 1–3 Nov; the agents cover first-line follow-ups.", by: "aditya", at: "Mon, 11:00 AM", audience: "Everyone", reactions: { "🪔": 11 }, acks: ["amit", "rohan", "sneha", "arjun", "kavya", "imran", "neha", "vikram", "priya", "meera", "sahil"] },
  { id: "A-5", title: "Ads: CPL down to ₹38 on the owner-story creative", body: "The 'I can't take a holiday' video is our best ad ever. Scaling budget to ₹45k/day from tomorrow.", by: "meera", at: "Mon, 4:30 PM", audience: "Everyone", reactions: { "📈": 7 }, acks: ["amit", "rohan"] },
];

const hottest = [...leads].filter((l) => l.stage !== "Won" && l.stage !== "Lost").sort((a, b) => b.score - a.score)[0];

export const notifications: Notification[] = [
  { id: "N-1", kind: "lead", title: `Hot lead: ${hottest.name} (score ${hottest.score})`, body: `${hottest.company}, ${hottest.city} · ${hottest.revenue} · ${hottest.attendedWorkshop ? "attended the workshop" : "came in from " + hottest.source}. Interested in ${programById[hottest.interest].short}.`, at: "2 min ago", read: false, href: `/hq/crm?lead=${hottest.id}` },
  { id: "N-2", kind: "payment", title: "₹74,999 received", body: "Sunita Bansal, AI Automation Accelerator, paid in full via Razorpay.", at: "14 min ago", read: false, href: "/hq/revenue" },
  { id: "N-3", kind: "agent", title: "Follow-up agent sent 62 WhatsApp nudges", body: "To workshop attendees who left before the Q&A. 11 replied so far.", at: "22 min ago", read: false, href: "/hq/agents" },
  { id: "N-4", kind: "task", title: "Overdue: GST filing for September", body: "Assigned to Sahil, due 2 days ago.", at: "1 h ago", read: false, href: "/hq/tasks" },
  { id: "N-5", kind: "student", title: "18 students at risk in Batch 13", body: "Attendance under 45%. Priya has a nudge sequence ready.", at: "1 h ago", read: true, href: "/hq/students" },
  { id: "N-6", kind: "announcement", title: "Amit posted: Batch 14 crossed 1,240 registrations", body: "Pinned for everyone.", at: "3 h ago", read: true, href: "/hq/announcements" },
  { id: "N-7", kind: "system", title: "Zoom webinar seats at 92%", body: "Upgrade to the 3,000 seat licence before Batch 15.", at: "Yesterday", read: true, href: "/hq/tasks" },
  { id: "N-8", kind: "lead", title: "34 new leads from Meta overnight", body: "Imran's qualifier queue. 9 auto-scored above 80.", at: "Yesterday", read: true, href: "/hq/qualifier" },
];

/**
 * Company-wide October numbers. Every module that shows month totals reads these,
 * so the Revenue Center, My Today and the copilot always agree.
 */
export const october = { day: 20, days: 31, booked: 4130000, collected: 3640000, outstanding: 1710000, forecast: 5480000, target: 6000000 };

/** Daily bookings for the last 30 days in ₹; the last 20 days sum exactly to october.booked. */
const rawDaily = Array.from({ length: 30 }, (_, i) => 90000 + hash(i, 71) * 260000 + (i % 7 === 2 ? 380000 : 0) + i * 4200);
const rawMtd = rawDaily.slice(-october.day).reduce((a, b) => a + b, 0);
export const revenueDaily = rawDaily.map((v, i) => (i < 30 - october.day ? Math.round(v * 0.82) : Math.round((v * october.booked) / rawMtd)));
const drift = october.booked - revenueDaily.slice(-october.day).reduce((a, b) => a + b, 0);
revenueDaily[revenueDaily.length - 1] += drift;
/** Ad spend for the last 30 days in ₹ */
export const adSpendDaily = Array.from({ length: 30 }, (_, i) => Math.round(32000 + hash(i, 72) * 14000 + i * 300));
