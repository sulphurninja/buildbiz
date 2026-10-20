"use client";

import * as React from "react";
import { toast } from "sonner";
import { ArrowRight, Calculator, Copy, FlaskConical, Pause, Play, RotateCcw, Sparkles, TrendingUp, Upload, Wand2 } from "lucide-react";
import {
  AgentNote,
  AIMark,
  Bars,
  Btn,
  DataTable,
  KV,
  Metric,
  PageHeader,
  Panel,
  Pill,
  Segmented,
  SectionLabel,
  Sheet,
  inputClass,
  rupees,
  type Column,
} from "../kit";
import { useHQ } from "../store";
import { adSpendDaily, programById } from "../data";
import type { ProgramId } from "../types";
import type { Tone } from "../../desk/types";

/* ============================================================
   Model
   ============================================================ */

const TICKET = 51;
const MIX_PROGRAMS: ProgramId[] = ["launchpad", "accelerator", "systems", "agents", "dfy"];
type Season = "Normal" | "Pre-Diwali rush" | "Diwali week" | "Post-Diwali";
const SEASON: Record<Season, { cpl: number; show: number; close: number; note: string }> = {
  Normal: { cpl: 1, show: 1, close: 1, note: "Baseline from Batches 11–14." },
  "Pre-Diwali rush": { cpl: 1.12, show: 0.95, close: 1.08, note: "Owners want systems live before the festive season; CPMs rise ~12%." },
  "Diwali week": { cpl: 1.38, show: 0.78, close: 0.7, note: "Auction is crowded by D2C brands and owners are busy with dealers; last year show-up fell 22%." },
  "Post-Diwali": { cpl: 0.88, show: 1.06, close: 1.04, note: "Cheapest inventory of Q3; owners plan next year and attend better." },
};

type Scenario = {
  daily: number;
  cpl: number;
  leadToSeat: number;
  showUp: number;
  toCall: number;
  close: number;
  upfront: number;
  mix: Record<ProgramId, number>;
  price: Record<ProgramId, number>;
  season: Season;
};
const basePrice = Object.fromEntries(MIX_PROGRAMS.map((p) => [p, programById[p].price])) as Record<ProgramId, number>;
const SCENARIO_A: Scenario = {
  daily: 46000,
  cpl: 40,
  leadToSeat: 9.2,
  showUp: 47,
  toCall: 32,
  close: 18,
  upfront: 68,
  mix: { workshop: 0, launchpad: 38, accelerator: 36, systems: 14, agents: 8, dfy: 4 },
  price: basePrice,
  season: "Normal",
};
const SCENARIO_B: Scenario = { ...SCENARIO_A, daily: 65000, cpl: 47, season: "Pre-Diwali rush" };

type Period = "Per day" | "Per batch" | "Per month";
const PERIOD_DAYS: Record<Period, number> = { "Per day": 1, "Per batch": 12, "Per month": 30 };

function run(s: Scenario, days: number) {
  const k = SEASON[s.season];
  const spend = s.daily * days;
  const cpl = s.cpl * k.cpl;
  const leads = spend / cpl;
  const seats = leads * (s.leadToSeat / 100);
  const attendees = seats * Math.min(1, (s.showUp / 100) * k.show);
  const calls = attendees * (s.toCall / 100);
  const sales = calls * Math.min(1, (s.close / 100) * k.close);
  const mixTotal = MIX_PROGRAMS.reduce((a, p) => a + s.mix[p], 0) || 1;
  const aov = MIX_PROGRAMS.reduce((a, p) => a + (s.mix[p] / mixTotal) * s.price[p], 0);
  const programRevenue = sales * aov;
  const ticket = seats * TICKET;
  const revenue = programRevenue + ticket;
  const roas = spend ? revenue / spend : 0;
  const cac = sales ? spend / sales : 0;
  const costPerSeat = seats ? spend / seats : 0;
  // Ads run 12 days, workshop 2 days, closes land ~7 days later. EMIs collect monthly over 3 months.
  const cash0 = programRevenue * (s.upfront / 100) + ticket;
  const emi = (programRevenue * (1 - s.upfront / 100)) / 3;
  const monthsNeeded = cash0 >= spend ? 0 : emi > 0 ? Math.ceil((spend - cash0) / emi) : 99;
  const payback = monthsNeeded === 0 ? 14 + Math.round(7 * (spend / Math.max(1, cash0))) : monthsNeeded <= 3 ? 21 + monthsNeeded * 30 : null;
  const maxCplAt3x = (revenue / 3 / spend) * cpl;
  return { spend, cpl, leads, seats, attendees, calls, sales, aov, revenue, ticket, roas, cac, costPerSeat, payback, cash0, maxCplAt3x };
}
type Result = ReturnType<typeof run>;

/* ============================================================
   Meta actuals, Batch 14 (ads ran 1–12 Oct, workshop 13–14 Oct)
   ============================================================ */

type Campaign = {
  id: string;
  name: string;
  campaign: string;
  audience: string;
  creative: string;
  lang: string;
  budget: number;
  spend: number;
  leads: number;
  regs: number;
  attended: number;
  paid: number;
  paidRevenue: number;
  freq: number;
  ctr: number;
  status: "Active" | "Paused" | "Learning";
  tags: string[];
};
const seedCampaigns: Campaign[] = [
  { id: "23861104", name: "B14 | Owner Story Reel | 'Chhutti nahi milti' | 35-55 | T1+T2", campaign: "BOS_Workshop_B14_Conv", audience: "Business owners 35–55, Tier 1 + Tier 2, Advantage detailed", creative: "Reel 38s, Dr. Amit on stage + owner testimonial", lang: "Hinglish", budget: 8200, spend: 98400, leads: 2590, regs: 252, attended: 140, paid: 10, paidRevenue: 824990, freq: 2.1, ctr: 2.8, status: "Active", tags: [] },
  { id: "23861105", name: "B14 | Owner Story Reel | Hinglish | LAL 3% Buyers", campaign: "BOS_Workshop_B14_Conv", audience: "Lookalike 3% of paid students (Batches 9–13)", creative: "Reel 38s, same cut", lang: "Hinglish", budget: 3300, spend: 40000, leads: 1052, regs: 116, attended: 58, paid: 4, paidRevenue: 349996, freq: 1.8, ctr: 2.4, status: "Active", tags: [] },
  { id: "23861107", name: "B14 | Carousel | '12 systems jo business chalate hain' | LAL 3% Attendees", campaign: "BOS_Workshop_B14_Conv", audience: "Lookalike 3% of workshop attendees", creative: "10-card carousel, one system per card", lang: "English", budget: 6050, spend: 72600, leads: 1771, regs: 160, attended: 78, paid: 6, paidRevenue: 524994, freq: 2.4, ctr: 1.9, status: "Active", tags: [] },
  { id: "23861110", name: "B14 | Advantage+ | 60s Workshop Promo | Broad India", campaign: "BOS_Workshop_B14_AdvPlus", audience: "Advantage+ audience, India, 25–60", creative: "60s horizontal promo, subtitles", lang: "Hindi", budget: 7000, spend: 84200, leads: 2552, regs: 150, attended: 56, paid: 3, paidRevenue: 224997, freq: 1.6, ctr: 3.1, status: "Active", tags: [] },
  { id: "23861112", name: "B14 | RT | IG Engagers 30d | Testimonial Stack", campaign: "BOS_Workshop_B14_RT", audience: "Instagram engagers 30 days, excl. registrants", creative: "6 testimonials, 15s each, stacked Reel", lang: "Hinglish", budget: 2650, spend: 31800, leads: 1097, regs: 141, attended: 82, paid: 5, paidRevenue: 374995, freq: 3.4, ctr: 3.6, status: "Active", tags: [] },
  { id: "23861115", name: "B14 | Interest | Textile Owners | Surat-Tiruppur-Ludhiana | Gujarati", campaign: "BOS_Workshop_B14_Industry", audience: "Interests: textile, garment manufacturing; 3 cities", creative: "Static, Kaveri Weaves dashboard screenshot", lang: "Gujarati", budget: 2400, spend: 28900, leads: 556, regs: 58, attended: 31, paid: 2, paidRevenue: 174998, freq: 2.9, ctr: 1.4, status: "Active", tags: [] },
  { id: "23861118", name: "B14 | Static | '₹51 mein 2 din' | Broad 28-60", campaign: "BOS_Workshop_B14_Conv", audience: "Broad India, 28–60", creative: "Price-led static, yellow background", lang: "Hindi", budget: 3850, spend: 46300, leads: 526, regs: 49, attended: 14, paid: 0, paidRevenue: 0, freq: 2.2, ctr: 0.9, status: "Active", tags: [] },
  { id: "23861120", name: "B14 | Long Video | Dr. Amit 4-min | Manufacturing Owners", campaign: "BOS_Workshop_B14_Industry", audience: "Interests: manufacturing, MSME, Udyam; 30–60", creative: "4-min talking head, 'why your plant needs an OS'", lang: "Hindi", budget: 3100, spend: 37500, leads: 615, regs: 52, attended: 29, paid: 1, paidRevenue: 74999, freq: 1.7, ctr: 1.1, status: "Active", tags: [] },
  { id: "23861122", name: "B14 | CTWA | WhatsApp 'Seat book karo' | Distributors T2", campaign: "BOS_Workshop_B14_CTWA", audience: "Distributors and traders, Tier 2 cities", creative: "Click-to-WhatsApp, Interakt bot books seat", lang: "Hinglish", budget: 1850, spend: 22300, leads: 474, regs: 31, attended: 19, paid: 1, paidRevenue: 149999, freq: 2.0, ctr: 2.2, status: "Active", tags: [] },
  { id: "23861125", name: "B14 | Reel | 'Diwali se pehle system' | Retail Owners", campaign: "BOS_Workshop_B14_Festive", audience: "Retail and jewellery owners, 30–55", creative: "Reel 24s, festive rush pain, diya b-roll", lang: "Hinglish", budget: 1550, spend: 18600, leads: 412, regs: 44, attended: 23, paid: 1, paidRevenue: 24999, freq: 1.5, ctr: 2.6, status: "Learning", tags: [] },
  { id: "23861127", name: "B14 | Reel | Tamil Dub | Chennai-Coimbatore", campaign: "BOS_Workshop_B14_Regional", audience: "Business owners, Tamil Nadu", creative: "Owner Story Reel, Tamil voice-over", lang: "Tamil", budget: 1200, spend: 14200, leads: 318, regs: 29, attended: 16, paid: 1, paidRevenue: 74999, freq: 1.9, ctr: 2.0, status: "Active", tags: [] },
  { id: "23861128", name: "B14 | Reel | Marathi | Pune-Nagpur Owners", campaign: "BOS_Workshop_B14_Regional", audience: "Business owners, Maharashtra ex-Mumbai", creative: "Owner Story Reel, Marathi voice-over", lang: "Marathi", budget: 1050, spend: 12800, leads: 141, regs: 15, attended: 7, paid: 0, paidRevenue: 0, freq: 2.6, ctr: 0.8, status: "Paused", tags: ["Paused by Meera, CPL > ₹90"] },
  { id: "23861130", name: "B14 | RT | Website Visitors 14d | Founder Q&A", campaign: "BOS_Workshop_B14_RT", audience: "Landing page visitors 14 days, not registered", creative: "Founder Q&A clip, 'kya ye mere business ke liye hai?'", lang: "Hinglish", budget: 800, spend: 9600, leads: 288, regs: 37, attended: 24, paid: 2, paidRevenue: 149998, freq: 4.1, ctr: 4.2, status: "Active", tags: [] },
  { id: "23861132", name: "B14 | Story | Countdown 'Kal raat 9 baje' | RT Registrants", campaign: "BOS_Workshop_B14_ShowUp", audience: "Registrants of Batch 14 (show-up boost)", creative: "Story countdown sticker, 3 frames", lang: "Hinglish", budget: 550, spend: 6400, leads: 96, regs: 22, attended: 19, paid: 1, paidRevenue: 24999, freq: 5.2, ctr: 1.7, status: "Active", tags: [] },
  { id: "23861134", name: "B14 | Carousel | Clinics & Diagnostics | Doctors", campaign: "BOS_Workshop_B14_Industry", audience: "Doctors and clinic owners, Tier 1", creative: "Carousel, Care Dental chair-map results", lang: "English", budget: 1400, spend: 16900, leads: 341, regs: 33, attended: 17, paid: 1, paidRevenue: 249999, freq: 2.3, ctr: 1.6, status: "Active", tags: [] },
  { id: "23861136", name: "B14 | Advantage+ | Static | CA & Consultants | LAL 1%", campaign: "BOS_Workshop_B14_AdvPlus", audience: "Lookalike 1% of CA partners in CRM", creative: "Static, 'Your clients need this'", lang: "English", budget: 950, spend: 11500, leads: 120, regs: 9, attended: 3, paid: 0, paidRevenue: 0, freq: 3.0, ctr: 0.7, status: "Paused", tags: ["Paused by Meera, CPL > ₹90"] },
];
const revOf = (c: Campaign) => c.paidRevenue + c.regs * TICKET;
const roasOf = (c: Campaign) => (c.spend ? revOf(c) / c.spend : 0);
const cplOf = (c: Campaign) => (c.leads ? c.spend / c.leads : 0);

type Verdict = { kind: "Scale" | "Pause" | "Test" | "Hold"; why: string; impact: string };
function verdictOf(c: Campaign): Verdict {
  const r = roasOf(c);
  const showRate = c.regs ? c.attended / c.regs : 0;
  if (c.status === "Paused") return { kind: "Hold", why: "Already paused.", impact: "-" };
  if (r >= 6.5 && c.freq < 3) return { kind: "Scale", why: `ROAS ${r.toFixed(1)}× with frequency ${c.freq}; room before fatigue.`, impact: `+20% budget ≈ +${rupees(Math.round(c.spend * 0.2 * r * 0.82))} at a ~9% higher CPL` };
  if (r < 1.2) return { kind: "Pause", why: `${rupees(c.spend)} spent for ${c.paid} paid student${c.paid === 1 ? "" : "s"}; ${Math.round(showRate * 100)}% show-up.`, impact: `Saves ${rupees(Math.round(c.spend / 12))}/day for the next batch` };
  if (cplOf(c) < 36 && showRate < 0.42) return { kind: "Test", why: `Cheapest leads (₹${Math.round(cplOf(c))}) but only ${Math.round(showRate * 100)}% turn up. Leads are curious, not committed.`, impact: "A/B a 'workshop is for ₹1 Cr+ owners' qualifier hook" };
  if (r < 3 && c.ctr < 1.3) return { kind: "Test", why: `CTR ${c.ctr}% is below the 1.8% account average; the hook is not landing.`, impact: "Test the Owner Story opening 5 seconds on this audience" };
  if (c.freq >= 4) return { kind: "Hold", why: `Frequency ${c.freq}: retargeting pool is saturated.`, impact: "Keep budget flat; refresh creative next batch" };
  return { kind: "Hold", why: `ROAS ${r.toFixed(1)}×, steady.`, impact: "No change" };
}
const VERDICT_TONE: Record<Verdict["kind"], Tone> = { Scale: "ok", Pause: "late", Test: "info", Hold: "neutral" };

/* Daily spend for the chart (last 30 days, ends 20 Oct) */
const SPEND_LABELS = Array.from({ length: 30 }, (_, i) => {
  const d = i - 9; // index 9 = 1 Oct
  return d <= 0 ? `${30 + d} Sep` : `${d} Oct`;
});

/* ============================================================ */

export default function RoasCalculator() {
  const hq = useHQ();
  const [period, setPeriod] = React.useState<Period>("Per batch");
  const [scenarios, setScenarios] = React.useState<{ A: Scenario; B: Scenario }>({ A: SCENARIO_A, B: SCENARIO_B });
  const [editing, setEditing] = React.useState<"A" | "B">("A");
  const [campaigns, setCampaigns] = React.useState(seedCampaigns);
  const [open, setOpen] = React.useState<Campaign | null>(null);
  const [applied, setApplied] = React.useState<Record<string, string>>({});

  const days = PERIOD_DAYS[period];
  const s = scenarios[editing];
  const ra = run(scenarios.A, days);
  const rb = run(scenarios.B, days);
  const r = editing === "A" ? ra : rb;

  const set = <K extends keyof Scenario>(key: K, value: Scenario[K]) => setScenarios((cur) => ({ ...cur, [editing]: { ...cur[editing], [key]: value } }));
  const setMix = (p: ProgramId, v: number) => setScenarios((cur) => ({ ...cur, [editing]: { ...cur[editing], mix: { ...cur[editing].mix, [p]: v } } }));
  const setPrice = (p: ProgramId, v: number) => setScenarios((cur) => ({ ...cur, [editing]: { ...cur[editing], price: { ...cur[editing].price, [p]: v } } }));

  /* totals for the actuals */
  const live = campaigns;
  const tot = live.reduce(
    (a, c) => ({ spend: a.spend + c.spend, leads: a.leads + c.leads, regs: a.regs + c.regs, attended: a.attended + c.attended, paid: a.paid + c.paid, rev: a.rev + revOf(c) }),
    { spend: 0, leads: 0, regs: 0, attended: 0, paid: 0, rev: 0 },
  );

  /* levers: realistic improvements on the scenario being edited */
  const levers = [
    { id: "showUp", label: "Show-up +5 pts", how: "3-step WhatsApp reminder + day-of IVR call", next: { ...s, showUp: s.showUp + 5 } },
    { id: "toCall", label: "Workshop → call +5 pts", how: "Calendly slot inside the Zoom chat at the Q&A", next: { ...s, toCall: s.toCall + 5 } },
    { id: "close", label: "Close rate +2 pts", how: "Show the prospect's industry desk live in minute 5", next: { ...s, close: s.close + 2 } },
    { id: "cpl", label: "CPL −₹5", how: "Shift 20% budget from statics to Owner Story Reels", next: { ...s, cpl: Math.max(10, s.cpl - 5) } },
    { id: "mix", label: "Mix +4 pts to Systems", how: "Lead with Systems for ₹10 Cr+ owners", next: { ...s, mix: { ...s.mix, systems: s.mix.systems + 4, launchpad: Math.max(0, s.mix.launchpad - 4) } } },
  ]
    .map((l) => ({ ...l, gain: run(l.next, days).revenue - r.revenue }))
    .sort((a, b) => b.gain - a.gain);

  function applyLever(l: (typeof levers)[number]) {
    setScenarios((cur) => ({ ...cur, [editing]: l.next }));
    hq.log(`applied "${l.label}" to ROAS scenario ${editing} (+${rupees(Math.round(l.gain))}/${period.replace("Per ", "")})`, "accent");
    toast.success(`Scenario ${editing} updated`, { description: `${l.label}: +${rupees(Math.round(l.gain))} revenue ${period.toLowerCase()}.` });
  }

  function applyVerdict(c: Campaign, v: Verdict, silent = false) {
    if (v.kind === "Hold") return;
    setCampaigns((cur) =>
      cur.map((x) =>
        x.id !== c.id
          ? x
          : v.kind === "Scale"
            ? { ...x, budget: Math.round(x.budget * 1.2), tags: [...x.tags, "Budget +20% (AI)"] }
            : v.kind === "Pause"
              ? { ...x, status: "Paused", tags: [...x.tags, "Paused by AI rule"] }
              : { ...x, status: "Learning", tags: [...x.tags, "A/B hook test running"] },
      ),
    );
    setApplied((cur) => ({ ...cur, [c.id]: v.kind }));
    const short = c.name.split(" | ").slice(1, 3).join(" · ");
    hq.log(`${v.kind === "Scale" ? "scaled" : v.kind === "Pause" ? "paused" : "started an A/B test on"} Meta ad set "${short}"`, v.kind === "Pause" ? "warn" : "accent");
    if (!silent)
      hq.notify({
        kind: "agent",
        title: `${v.kind}: ${short}`,
        body: v.kind === "Scale" ? `Daily budget ₹${c.budget.toLocaleString("en-IN")} → ₹${Math.round(c.budget * 1.2).toLocaleString("en-IN")}. ${v.impact}.` : v.kind === "Pause" ? `Paused in Ads Manager. ${v.impact}.` : `Duplicated with a new hook at 50/50 split. Meera gets the readout after 3 days.`,
        href: "/hq/roas",
      });
  }
  const pending = campaigns.map((c) => ({ c, v: verdictOf(c) })).filter((x) => x.v.kind !== "Hold" && !applied[x.c.id]);

  function loadCampaign(c: Campaign) {
    const next: Scenario = {
      ...scenarios[editing],
      daily: c.budget,
      cpl: Math.round(cplOf(c)),
      leadToSeat: Math.round((c.regs / c.leads) * 1000) / 10,
      showUp: Math.round((c.attended / Math.max(1, c.regs)) * 100),
      season: "Normal",
    };
    setScenarios((cur) => ({ ...cur, [editing]: next }));
    setOpen(null);
    hq.log(`loaded Meta ad set ${c.id} actuals into ROAS scenario ${editing}`, "info");
    toast.success(`Loaded into scenario ${editing}`, { description: "CPL, lead-to-seat and show-up now match this ad set." });
  }

  const cols: Column<Campaign>[] = [
    {
      key: "name",
      label: "Ad set",
      sort: (c) => c.name,
      render: (c) => (
        <span className="block max-w-[320px] min-w-[220px]">
          <span className="block truncate text-[12.5px] font-medium" title={c.name}>{c.name.replace(/^B14 \| /, "")}</span>
          <span className="flex items-center gap-1.5 text-[11px] text-d-mute">
            <span className="font-mono">{c.id}</span> · {c.lang}
            {c.status !== "Active" && <Pill tone={c.status === "Paused" ? "late" : "info"} className="px-1.5! py-0! text-[10.5px]!">{c.status}</Pill>}
          </span>
        </span>
      ),
    },
    { key: "spend", label: "Spend", align: "right", sort: (c) => c.spend, render: (c) => <Num>{rupees(c.spend)}</Num> },
    { key: "cpl", label: "CPL", align: "right", sort: (c) => cplOf(c), render: (c) => <Num tone={cplOf(c) > 80 ? "late" : cplOf(c) < 36 ? "ok" : undefined}>₹{Math.round(cplOf(c))}</Num> },
    { key: "regs", label: "Seats", align: "right", sort: (c) => c.regs, render: (c) => <Num>{c.regs}</Num> },
    { key: "att", label: "Attended", align: "right", sort: (c) => c.attended, render: (c) => <Num>{c.attended}<span className="ml-1 text-[10.5px] text-d-mute">{Math.round((c.attended / Math.max(1, c.regs)) * 100)}%</span></Num> },
    { key: "paid", label: "Paid", align: "right", sort: (c) => c.paid, render: (c) => <Num>{c.paid}</Num> },
    { key: "rev", label: "Revenue", align: "right", sort: (c) => revOf(c), render: (c) => <Num>{rupees(revOf(c))}</Num> },
    { key: "roas", label: "ROAS", align: "right", sort: (c) => roasOf(c), render: (c) => <Num tone={roasOf(c) >= 6 ? "ok" : roasOf(c) < 1.5 ? "late" : roasOf(c) < 3 ? "warn" : undefined} strong>{roasOf(c).toFixed(1)}×</Num> },
    { key: "ai", label: "AI call", render: (c) => { const v = verdictOf(c); return applied[c.id] ? <Pill tone="neutral">Applied</Pill> : <Pill tone={VERDICT_TONE[v.kind]}>{v.kind}</Pill>; } },
  ];

  const funnel = [
    { label: "Ad spend", value: r.spend, fmt: rupees(r.spend), sub: `${rupees(s.daily)}/day × ${days}d` },
    { label: "Leads", value: r.leads, fmt: Math.round(r.leads).toLocaleString("en-IN"), sub: `at ₹${Math.round(r.cpl)} CPL` },
    { label: "Paid seats (₹51)", value: r.seats, fmt: Math.round(r.seats).toLocaleString("en-IN"), sub: `${s.leadToSeat}% of leads · ${rupees(Math.round(r.costPerSeat))}/seat` },
    { label: "Attended live", value: r.attendees, fmt: Math.round(r.attendees).toLocaleString("en-IN"), sub: `${Math.round((r.attendees / Math.max(1, r.seats)) * 100)}% show-up` },
    { label: "Consultation calls", value: r.calls, fmt: Math.round(r.calls).toLocaleString("en-IN"), sub: `${s.toCall}% of attendees` },
    { label: "Paid students", value: r.sales, fmt: r.sales.toFixed(1), sub: `${Math.round((r.sales / Math.max(0.01, r.calls)) * 100)}% close` },
  ];
  const fMax = Math.max(1, r.leads);

  const spendBars = adSpendDaily.map((v, i) => {
    const regs = SPEND_LABELS[i].endsWith("Oct") && Number(SPEND_LABELS[i].split(" ")[0]) <= 12 ? Math.round(v / 470) : Math.round(v / 520);
    return { label: i % 5 === 0 || i === 29 ? SPEND_LABELS[i] : "", value: v, tone: (SPEND_LABELS[i] === "13 Oct" || SPEND_LABELS[i] === "14 Oct" ? "accent" : "info") as Tone, note: `${SPEND_LABELS[i]} · ${regs} seats · ₹${Math.round(v / regs)}/seat` };
  });

  return (
    <div>
      <PageHeader
        kicker="Revenue"
        icon={Calculator}
        title="ROAS Calculator"
        sub="Ad spend to workshop seats to paid programs. Model a batch, compare two plans, then check it against what Meta actually delivered for Batch 14."
        actions={
          <>
            <Segmented options={["Per day", "Per batch", "Per month"] as const} value={period} onChange={setPeriod} />
            <Btn icon={Upload} onClick={() => { const c = campaigns.reduce((best, x) => (roasOf(x) > roasOf(best) && x.status === "Active" ? x : best), campaigns[0]); setScenarios((cur) => ({ ...cur, [editing]: { ...cur[editing], cpl: Math.round(tot.spend / tot.leads), leadToSeat: Math.round((tot.regs / tot.leads) * 1000) / 10, showUp: Math.round((tot.attended / tot.regs) * 100), daily: Math.round(tot.spend / 12) } })); hq.log(`loaded Batch 14 blended actuals into scenario ${editing} (best ad set ${c.id})`, "info"); toast.success("Batch 14 actuals loaded", { description: `Scenario ${editing} now uses blended CPL, lead-to-seat and show-up.` }); }}>Load Batch 14 actuals</Btn>
            <Btn variant="solid" icon={Sparkles} onClick={() => hq.openAsk("What daily ad spend maximises profit for Batch 15 given Diwali on 8 Nov?")}>Ask about spend</Btn>
          </>
        }
      />

      {/* Scenario switch + hero outputs */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Segmented
          options={[
            { value: "A" as const, label: `Scenario A · ${rupees(ra.revenue)}` },
            { value: "B" as const, label: `Scenario B · ${rupees(rb.revenue)}` },
          ]}
          value={editing}
          onChange={setEditing}
        />
        <Btn size="sm" variant="ghost" icon={Copy} onClick={() => { setScenarios((cur) => ({ ...cur, [editing === "A" ? "B" : "A"]: cur[editing] })); toast(`Copied ${editing} to ${editing === "A" ? "B" : "A"}`); }}>Copy {editing} to {editing === "A" ? "B" : "A"}</Btn>
        <Btn size="sm" variant="ghost" icon={RotateCcw} onClick={() => setScenarios((cur) => ({ ...cur, [editing]: editing === "A" ? SCENARIO_A : SCENARIO_B }))}>Reset {editing}</Btn>
        <span className="ml-auto text-[12px] text-d-mute">Editing scenario <b className="text-d-ink">{editing}</b> · {period.toLowerCase()} ({days} day{days > 1 ? "s" : ""} of ads)</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <Metric label="Revenue" value={rupees(r.revenue)} hint={`incl. ${rupees(r.ticket)} in ₹51 tickets`} />
        <Metric label="ROAS" value={`${r.roas.toFixed(1)}×`} delta={r.roas >= 3 ? "above 3× floor" : "below 3× floor"} good={r.roas >= 3} hint="revenue ÷ ad spend" />
        <Metric label="CAC" value={rupees(Math.round(r.cac))} hint={`${Math.round((r.cac / r.aov) * 100)}% of avg order`} />
        <Metric label="Payback" value={r.payback ? `${r.payback}d` : "90d+"} hint={r.payback && r.payback <= 21 ? "days from first rupee spent" : "needs EMI collections"} />
        <Metric label="Avg order" value={rupees(Math.round(r.aov))} hint="from program mix" />
        <Metric label="Profit after ads" value={rupees(Math.round(r.revenue - r.spend))} hint={`${Math.round(((r.revenue - r.spend) / Math.max(1, r.revenue)) * 100)}% margin before delivery`} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]">
        {/* Inputs */}
        <Panel title={`Inputs · scenario ${editing}`} sub="Drag or type. Everything recalculates as you go.">
          <div className="space-y-4">
            <Slider label="Daily ad spend" value={s.daily} min={5000} max={150000} step={1000} fmt={(v) => `₹${v.toLocaleString("en-IN")}`} onChange={(v) => set("daily", v)} />
            <Slider label="Cost per lead (Meta)" value={s.cpl} min={15} max={150} step={1} fmt={(v) => `₹${v}`} onChange={(v) => set("cpl", v)} />
            <Slider label="Lead → paid ₹51 seat" value={s.leadToSeat} min={2} max={25} step={0.1} fmt={(v) => `${v}%`} onChange={(v) => set("leadToSeat", v)} />
            <Slider label="Show-up rate (attended day 1)" value={s.showUp} min={15} max={80} step={1} fmt={(v) => `${v}%`} onChange={(v) => set("showUp", v)} />
            <Slider label="Workshop → consultation call" value={s.toCall} min={5} max={60} step={1} fmt={(v) => `${v}%`} onChange={(v) => set("toCall", v)} />
            <Slider label="Close rate on calls" value={s.close} min={4} max={40} step={0.5} fmt={(v) => `${v}%`} onChange={(v) => set("close", v)} />
            <Slider label="Paid upfront (rest on 3-month EMI)" value={s.upfront} min={20} max={100} step={1} fmt={(v) => `${v}%`} onChange={(v) => set("upfront", v)} />
            <div>
              <SectionLabel>Season</SectionLabel>
              <Segmented size="sm" options={Object.keys(SEASON) as Season[]} value={s.season} onChange={(v) => set("season", v)} />
              <p className="mt-1.5 text-[12px] text-d-mute">{SEASON[s.season].note}</p>
            </div>
            <div>
              <SectionLabel action={<span className="font-mono text-[11.5px] text-d-mute">AOV {rupees(Math.round(r.aov))}</span>}>Program mix and price</SectionLabel>
              <div className="space-y-2">
                {MIX_PROGRAMS.map((p) => (
                  <div key={p} className="grid grid-cols-[96px_minmax(0,1fr)_44px_92px] items-center gap-2 text-[12.5px]">
                    <span className="flex items-center gap-1.5 truncate"><span className="h-2 w-2 shrink-0 rounded-[2px]" style={{ background: programById[p].color }} />{programById[p].short}</span>
                    <input type="range" min={0} max={70} value={s.mix[p]} onChange={(e) => setMix(p, Number(e.target.value))} className="w-full accent-[var(--d-accent)]" aria-label={`${programById[p].short} share`} />
                    <span className="tnum text-right font-mono text-[11.5px]">{s.mix[p]}%</span>
                    <input type="number" value={s.price[p]} step={1000} onChange={(e) => setPrice(p, Math.max(0, Number(e.target.value) || 0))} className={`${inputClass} h-8! px-2! text-right font-mono text-[12px]!`} aria-label={`${programById[p].short} price`} />
                  </div>
                ))}
              </div>
              <p className="mt-1.5 text-[11.5px] text-d-mute">Shares are normalised; total {MIX_PROGRAMS.reduce((a, p) => a + s.mix[p], 0)}%.</p>
            </div>
          </div>
        </Panel>

        {/* Funnel */}
        <div className="space-y-4">
          <Panel title="Live funnel" sub={`Scenario ${editing}, ${period.toLowerCase()}${s.season !== "Normal" ? ` · ${s.season} adjusted` : ""}`}>
            <ol className="space-y-1.5">
              {funnel.map((f, i) => {
                const w = i === 0 ? 100 : Math.max(12, Math.sqrt(f.value / fMax) * 100);
                return (
                  <li key={f.label} className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-3">
                    <span className="min-w-0">
                      <span className="block text-[12.5px] font-medium">{f.label}</span>
                      <span className="block truncate text-[11px] text-d-mute">{f.sub}</span>
                    </span>
                    <span className="flex justify-center">
                      <span
                        className="desk-growx flex h-9 items-center justify-center rounded-md font-mono text-[12.5px] font-semibold transition-[width] duration-500"
                        style={{ width: `${w}%`, background: i === 0 ? "var(--d-ink)" : `color-mix(in oklab, var(--d-accent) ${30 + i * 13}%, var(--d-panel))`, color: i === 0 || i >= 3 ? "var(--d-accent-ink)" : "var(--d-ink)" }}
                      >
                        {f.fmt}
                      </span>
                    </span>
                  </li>
                );
              })}
              <li className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-3 pt-1">
                <span className="text-[12.5px] font-semibold">Revenue</span>
                <span className="flex h-11 items-center justify-between rounded-md border border-[color-mix(in_oklab,var(--d-ok)_40%,var(--d-line))] bg-[color-mix(in_oklab,var(--d-ok)_10%,var(--d-panel))] px-3">
                  <span className="font-serif text-[22px] font-medium">{rupees(r.revenue)}</span>
                  <span className="font-mono text-[12.5px] font-semibold" style={{ color: r.roas >= 3 ? "var(--d-ok)" : "var(--d-late)" }}>{r.roas.toFixed(2)}× ROAS</span>
                </span>
              </li>
            </ol>
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-d-line pt-3 text-[12px]">
              <Mini label="Cost per seat" value={rupees(Math.round(r.costPerSeat))} />
              <Mini label="Cash in on close" value={rupees(Math.round(r.cash0))} />
              <Mini label="Max CPL for 3× ROAS" value={`₹${Math.round(r.maxCplAt3x)}`} />
            </div>
          </Panel>

          <Panel title="Biggest levers" sub={`What moves scenario ${editing}'s revenue most, ${period.toLowerCase()}`} action={<AIMark label="Ranked by AI" />}>
            <ul className="space-y-2">
              {levers.map((l, i) => (
                <li key={l.id} className="flex items-center gap-3 rounded-xl border border-d-line px-3 py-2">
                  <span className="tnum w-4 font-mono text-[11.5px] text-d-mute">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium">{l.label}</span>
                    <span className="block truncate text-[11.5px] text-d-mute">{l.how}</span>
                  </span>
                  <span className="tnum font-mono text-[12.5px] text-d-ok">+{rupees(Math.round(l.gain))}</span>
                  <Btn size="sm" variant="soft" onClick={() => applyLever(l)}>Apply</Btn>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      {/* Compare */}
      <Panel className="mt-4" title="Scenario A vs B" sub={`${period}. A: ${rupees(scenarios.A.daily)}/day, ${scenarios.A.season}. B: ${rupees(scenarios.B.daily)}/day, ${scenarios.B.season}.`}>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="desk-scroll overflow-x-auto">
            <table className="w-full min-w-[480px] text-[13px]">
              <thead>
                <tr className="border-b border-d-line text-left text-[11.5px] text-d-mute">
                  <th className="pb-2 font-medium">Metric</th>
                  <th className="pb-2 text-right font-medium">A</th>
                  <th className="pb-2 text-right font-medium">B</th>
                  <th className="pb-2 text-right font-medium">B vs A</th>
                </tr>
              </thead>
              <tbody>
                {compareRows(ra, rb).map((row) => (
                  <tr key={row.k} className="border-b border-d-line/70 last:border-0">
                    <td className="py-2">{row.k}</td>
                    <td className="tnum py-2 text-right font-mono">{row.a}</td>
                    <td className="tnum py-2 text-right font-mono">{row.b}</td>
                    <td className="tnum py-2 text-right font-mono text-[12px]" style={{ color: row.d === 0 ? "var(--d-mute)" : (row.d > 0) === row.upGood ? "var(--d-ok)" : "var(--d-late)" }}>
                      {row.d === 0 ? "=" : `${row.d > 0 ? "+" : ""}${(row.d * 100).toFixed(1)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AgentNote
            title={rb.revenue - rb.spend > ra.revenue - ra.spend ? "B makes more money, at a lower ROAS" : "A is the better plan"}
            action={
              <>
                <Btn size="sm" variant="solid" icon={ArrowRight} onClick={() => { const pick = rb.revenue - rb.spend > ra.revenue - ra.spend ? "B" : "A"; const sc = scenarios[pick]; hq.addTask({ title: `Set Batch 15 Meta budget to ₹${sc.daily.toLocaleString("en-IN")}/day (scenario ${pick})`, owner: "meera", status: "Todo", priority: "P1", due: "Tomorrow", dueIn: 1, area: "Marketing", aiDrafted: true }); hq.notify({ kind: "task", title: `Meera: Batch 15 budget plan ${pick}`, body: `₹${sc.daily.toLocaleString("en-IN")}/day, expected ROAS ${(pick === "A" ? ra : rb).roas.toFixed(1)}×.`, href: "/hq/tasks" }); hq.log(`sent ROAS scenario ${pick} to Meera as the Batch 15 budget plan`, "accent"); }}>Send winner to Meera</Btn>
                <Btn size="sm" variant="ghost" onClick={() => hq.openAsk("Compare ROAS scenario A and B for Batch 15 and tell me the risk in each")}>Ask HQ</Btn>
              </>
            }
          >
            {(() => {
              const dp = rb.revenue - rb.spend - (ra.revenue - ra.spend);
              const extraSpend = rb.spend - ra.spend;
              return (
                <>
                  B spends {rupees(Math.abs(Math.round(extraSpend)))} {extraSpend >= 0 ? "more" : "less"} and returns {rupees(Math.abs(Math.round(rb.revenue - ra.revenue)))} {rb.revenue >= ra.revenue ? "more" : "less"} revenue, so profit after ads moves {dp >= 0 ? "up" : "down"} {rupees(Math.abs(Math.round(dp)))}. Marginal ROAS on the extra spend is{" "}
                  <b>{extraSpend ? ((rb.revenue - ra.revenue) / extraSpend).toFixed(1) : "0"}×</b>. Advisors can take about 260 consultations a batch; B needs {Math.round((rb.calls / days) * 12)} per batch{(rb.calls / days) * 12 > 260 ? ", so hire or add an SDR before scaling" : ", within capacity"}.
                </>
              );
            })()}
          </AgentNote>
        </div>
      </Panel>

      {/* Actuals */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <Metric label="B14 spend" value={rupees(tot.spend)} hint="1–12 Oct, 16 ad sets" />
        <Metric label="Blended CPL" value={`₹${Math.round(tot.spend / tot.leads)}`} hint={`${tot.leads.toLocaleString("en-IN")} leads`} />
        <Metric label="Seats from Meta" value={tot.regs.toLocaleString("en-IN")} hint="of 1,248 total" />
        <Metric label="Show-up" value={`${Math.round((tot.attended / tot.regs) * 100)}%`} hint={`${tot.attended} attended live`} />
        <Metric label="Paid students" value={String(tot.paid)} hint={`CAC ${rupees(Math.round(tot.spend / Math.max(1, tot.paid)))}`} />
        <Metric label="Batch ROAS" value={`${(tot.rev / tot.spend).toFixed(1)}×`} hint={`${rupees(tot.rev)} attributed, 7-day close`} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <Panel title="Meta campaign actuals · Batch 14" sub="Synced from Ads Manager 6:00 AM IST. Paid students matched by phone number from Razorpay." live>
          <DataTable
            rows={campaigns}
            columns={cols}
            rowKey={(c) => c.id}
            search={(c) => `${c.name} ${c.id} ${c.audience} ${c.lang}`}
            searchPlaceholder="Ad set, language, audience"
            filter={{ get: (c) => c.status, options: ["Active", "Learning", "Paused"] }}
            onRow={setOpen}
            pageSize={16}
            dense
            bulk={[
              { label: "Pause", run: (ids) => { setCampaigns((cur) => cur.map((c) => (ids.includes(c.id) ? { ...c, status: "Paused" } : c))); hq.log(`paused ${ids.length} Meta ad sets from the ROAS calculator`, "warn"); hq.notify({ kind: "system", title: `${ids.length} ad sets paused`, body: "Change pushed to Ads Manager.", href: "/hq/roas" }); } },
              { label: "Resume", run: (ids) => { setCampaigns((cur) => cur.map((c) => (ids.includes(c.id) ? { ...c, status: "Active" } : c))); hq.log(`resumed ${ids.length} Meta ad sets`, "info"); toast.success(`${ids.length} ad sets resumed`); } },
            ]}
          />
        </Panel>

        <div className="space-y-4">
          <Panel title="AI recommendations" sub={`${pending.length} changes for Batch 15`} action={pending.length > 0 ? <Btn size="sm" variant="solid" icon={Wand2} onClick={() => { pending.forEach((x) => applyVerdict(x.c, x.v, true)); hq.notify({ kind: "agent", title: `Applied ${pending.length} ad recommendations`, body: `${pending.filter((x) => x.v.kind === "Scale").length} scaled, ${pending.filter((x) => x.v.kind === "Pause").length} paused, ${pending.filter((x) => x.v.kind === "Test").length} A/B tests started.`, href: "/hq/roas" }); }}>Apply all</Btn> : undefined}>
            <ul className="space-y-2.5">
              {campaigns.map((c) => ({ c, v: verdictOf(c) })).filter((x) => x.v.kind !== "Hold").map(({ c, v }) => (
                <li key={c.id} className="rounded-xl border border-d-line p-3">
                  <div className="flex items-start gap-2">
                    <Pill tone={VERDICT_TONE[v.kind]}>{v.kind}</Pill>
                    <button type="button" onClick={() => setOpen(c)} className="min-w-0 flex-1 truncate text-left text-[12.5px] font-medium hover:underline">{c.name.replace(/^B14 \| /, "")}</button>
                  </div>
                  <p className="mt-1.5 text-[12px] leading-snug text-d-mute">{v.why} {v.impact}.</p>
                  <div className="mt-2 flex gap-2">
                    {applied[c.id] ? (
                      <Pill tone="ok">Applied · logged to Meera</Pill>
                    ) : (
                      <>
                        <Btn size="sm" variant="soft" icon={v.kind === "Scale" ? TrendingUp : v.kind === "Pause" ? Pause : FlaskConical} onClick={() => applyVerdict(c, v)}>{v.kind === "Scale" ? "Scale +20%" : v.kind === "Pause" ? "Pause ad set" : "Start A/B test"}</Btn>
                        <Btn size="sm" variant="ghost" onClick={() => { setApplied((cur) => ({ ...cur, [c.id]: "Dismissed" })); toast("Recommendation dismissed"); }}>Dismiss</Btn>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Daily spend, last 30 days" sub="Batch 14 workshop days highlighted. Hover for seats and cost per seat.">
            <Bars data={spendBars} height={150} showValues={false} format={(v) => rupees(v)} />
          </Panel>
        </div>
      </div>

      <Sheet
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        eyebrow={open ? `Ad set ${open.id} · ${open.campaign}` : ""}
        title={open?.name.replace(/^B14 \| /, "") ?? ""}
        sub={open?.audience}
        width={540}
        footer={
          open && (
            <>
              <Btn icon={open.status === "Paused" ? Play : Pause} onClick={() => { const next = open.status === "Paused" ? "Active" : "Paused"; setCampaigns((cur) => cur.map((c) => (c.id === open.id ? { ...c, status: next } : c))); setOpen({ ...open, status: next }); hq.log(`${next === "Paused" ? "paused" : "resumed"} Meta ad set ${open.id}`, next === "Paused" ? "warn" : "info"); toast.success(`Ad set ${next === "Paused" ? "paused" : "resumed"}`); }}>{open.status === "Paused" ? "Resume" : "Pause"}</Btn>
              <Btn variant="solid" icon={Upload} onClick={() => loadCampaign(open)}>Load into scenario {editing}</Btn>
            </>
          )
        }
      >
        {open && (() => {
          const c = campaigns.find((x) => x.id === open.id) ?? open;
          const v = verdictOf(c);
          return (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <Pill tone={c.status === "Active" ? "ok" : c.status === "Paused" ? "late" : "info"}>{c.status}</Pill>
                <Pill>{c.lang}</Pill>
                {c.tags.map((t) => <Pill key={t} tone="neutral">{t}</Pill>)}
              </div>
              <KV cols={3} items={[{ k: "Daily budget", v: `₹${c.budget.toLocaleString("en-IN")}` }, { k: "Spend", v: rupees(c.spend) }, { k: "CPL", v: `₹${Math.round(cplOf(c))}` }, { k: "CTR", v: `${c.ctr}%` }, { k: "Frequency", v: c.freq }, { k: "Cost per seat", v: rupees(Math.round(c.spend / Math.max(1, c.regs))) }, { k: "Revenue", v: rupees(revOf(c)) }, { k: "ROAS", v: `${roasOf(c).toFixed(2)}×` }, { k: "CAC", v: c.paid ? rupees(Math.round(c.spend / c.paid)) : "-" }]} />
              <div>
                <SectionLabel>Funnel</SectionLabel>
                {[["Leads", c.leads], ["Seats", c.regs], ["Attended", c.attended], ["Paid", c.paid]].map(([k, val], i) => (
                  <div key={k as string} className="mb-1.5 flex items-center gap-3 text-[12.5px]">
                    <span className="w-16 text-d-mute">{k}</span>
                    <span className="h-5 rounded" style={{ width: `${Math.max(2, Math.sqrt((val as number) / c.leads) * 100)}%`, background: `color-mix(in oklab, var(--d-accent) ${25 + i * 20}%, var(--d-panel))` }} />
                    <span className="tnum font-mono">{(val as number).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
              <div>
                <SectionLabel>Creative</SectionLabel>
                <p className="text-[13px]">{c.creative}</p>
              </div>
              <AgentNote title={`AI call: ${v.kind}`} action={v.kind !== "Hold" && !applied[c.id] ? <Btn size="sm" variant="solid" onClick={() => applyVerdict(c, v)}>Apply</Btn> : undefined}>
                {v.why} {v.impact !== "-" && `${v.impact}.`}
              </AgentNote>
            </div>
          );
        })()}
      </Sheet>
    </div>
  );
}

/* ============================================================ */

function compareRows(a: Result, b: Result) {
  const d = (x: number, y: number) => (x ? (y - x) / x : 0);
  return [
    { k: "Ad spend", a: rupees(a.spend), b: rupees(b.spend), d: d(a.spend, b.spend), upGood: false },
    { k: "Leads", a: Math.round(a.leads).toLocaleString("en-IN"), b: Math.round(b.leads).toLocaleString("en-IN"), d: d(a.leads, b.leads), upGood: true },
    { k: "Paid seats", a: Math.round(a.seats).toLocaleString("en-IN"), b: Math.round(b.seats).toLocaleString("en-IN"), d: d(a.seats, b.seats), upGood: true },
    { k: "Attendees", a: Math.round(a.attendees).toLocaleString("en-IN"), b: Math.round(b.attendees).toLocaleString("en-IN"), d: d(a.attendees, b.attendees), upGood: true },
    { k: "Consultations", a: Math.round(a.calls).toLocaleString("en-IN"), b: Math.round(b.calls).toLocaleString("en-IN"), d: d(a.calls, b.calls), upGood: true },
    { k: "Paid students", a: a.sales.toFixed(1), b: b.sales.toFixed(1), d: d(a.sales, b.sales), upGood: true },
    { k: "Revenue", a: rupees(a.revenue), b: rupees(b.revenue), d: d(a.revenue, b.revenue), upGood: true },
    { k: "ROAS", a: `${a.roas.toFixed(2)}×`, b: `${b.roas.toFixed(2)}×`, d: d(a.roas, b.roas), upGood: true },
    { k: "CAC", a: rupees(Math.round(a.cac)), b: rupees(Math.round(b.cac)), d: d(a.cac, b.cac), upGood: false },
    { k: "Profit after ads", a: rupees(Math.round(a.revenue - a.spend)), b: rupees(Math.round(b.revenue - b.spend)), d: d(a.revenue - a.spend, b.revenue - b.spend), upGood: true },
  ];
}

function Slider({ label, value, min, max, step, fmt, onChange }: { label: string; value: number; min: number; max: number; step: number; fmt: (v: number) => string; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12.5px] font-medium">{label}</span>
        <input
          type="number"
          value={value}
          step={step}
          min={min}
          max={max}
          onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || min)))}
          className="h-7 w-24 rounded-md border border-d-line bg-d-panel px-2 text-right font-mono text-[12px] outline-none focus:border-d-accent"
          aria-label={label}
        />
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1.5 w-full accent-[var(--d-accent)]" aria-label={`${label} slider`} />
      <div className="flex justify-between font-mono text-[10.5px] text-d-mute">
        <span>{fmt(min)}</span>
        <span className="text-d-ink">{fmt(value)}</span>
        <span>{fmt(max)}</span>
      </div>
    </div>
  );
}

function Num({ children, tone, strong }: { children: React.ReactNode; tone?: Tone; strong?: boolean }) {
  return (
    <span className={`tnum whitespace-nowrap font-mono text-[12.5px] ${strong ? "font-semibold" : ""}`} style={tone ? { color: `var(--d-${tone})` } : undefined}>
      {children}
    </span>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-d-mute">{label}</p>
      <p className="tnum mt-0.5 font-serif text-[19px] font-medium">{value}</p>
    </div>
  );
}
