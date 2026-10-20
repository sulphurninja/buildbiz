"use client";

import * as React from "react";
import { cn } from "cn";
import { ArrowDown, ArrowUp, Ban, Building2, Check, CheckCheck, MapPin, MessageCircle, RotateCcw, Send, SlidersHorizontal, Sparkles, UserCheck, Users, Wand2, X } from "lucide-react";
import { AgentNote, AIMark, Btn, HBars, inputClass, Metric, Modal, PageHeader, PersonAvatar, Pill, rupees, SearchBox, SectionLabel, Segmented } from "../kit";
import { useHQ } from "../store";
import { personById, programById, salesTeam } from "../data";
import type { Lead, LeadSource, ProgramId } from "../types";
import type { Tone } from "../../desk/types";

/* ============================================================
   Lead Qualifier: AI triage of every inbound lead.
   ============================================================ */

type FactorId = "revenue" | "team" | "pain" | "workshop" | "source";
type Weights = Record<FactorId, number>;
const FACTORS: { id: FactorId; label: string; hint: string }[] = [
  { id: "revenue", label: "Revenue band", hint: "₹1 Cr floor; ₹10 Cr+ fits the bigger builds" },
  { id: "team", label: "Team size", hint: "More staff, more process pain" },
  { id: "pain", label: "Pain clarity", hint: "How specific the stated problem is" },
  { id: "workshop", label: "Workshop attendance", hint: "Batch 14, Day 1 and Day 2" },
  { id: "source", label: "Source quality", hint: "Historic close rate of the channel" },
];
const DEFAULT_W: Weights = { revenue: 30, team: 15, pain: 20, workshop: 20, source: 15 };

const bandRank: Record<string, number> = { "₹1-3 Cr": 0, "₹3-5 Cr": 1, "₹5-10 Cr": 2, "₹10-25 Cr": 3, "₹25-50 Cr": 4, "₹50 Cr+": 5 };
const REV_PTS = [36, 52, 68, 82, 92, 100];
const PAIN_PTS: Record<string, number> = {
  "Owner approves every purchase order; team waits": 88,
  "Leads come from 4 places and nobody tracks follow-ups": 93,
  "Sales team reports on WhatsApp, no single view of the pipeline": 78,
  "Collections slip because reminders depend on one accountant": 86,
  "Can't take a holiday without the business stalling": 66,
  "Inventory in Tally and Excel never match": 90,
  "Hiring more people but output isn't growing": 62,
  "No idea which ad campaign actually brings paying customers": 81,
};
const SOURCE_PTS: Record<LeadSource, number> = { Referral: 95, Workshop: 88, WhatsApp: 72, Website: 64, YouTube: 60, Instagram: 52, "Meta ads": 46 };
const idNum = (id: string) => Number(id.replace(/\D/g, "")) || 0;
const first = (n: string) => n.split(" ")[0];

function factors(l: Lead): Record<FactorId, number> {
  const ws = l.attendedWorkshop ? (idNum(l.id) % 3 === 0 ? 70 : 100) : l.source === "Workshop" ? 35 : 15;
  return {
    revenue: REV_PTS[bandRank[l.revenue] ?? 0],
    team: Math.round(Math.min(100, 25 + (Math.log(Math.max(5, l.teamSize) / 5) / Math.log(44)) * 75)),
    pain: PAIN_PTS[l.pain] ?? 70,
    workshop: ws,
    source: SOURCE_PTS[l.source] ?? 60,
  };
}
const weighted = (f: Record<FactorId, number>, w: Weights) => {
  const sum = FACTORS.reduce((a, x) => a + w[x.id], 0) || 1;
  return FACTORS.reduce((a, x) => a + f[x.id] * w[x.id], 0) / sum;
};
function scoreWith(l: Lead, w: Weights) {
  const f = factors(l);
  return Math.max(5, Math.min(99, Math.round(l.score + (weighted(f, w) - weighted(f, DEFAULT_W)) * 1.6)));
}

function recommend(l: Lead): ProgramId {
  const b = bandRank[l.revenue] ?? 0;
  if (b >= 4 && l.teamSize >= 80) return "dfy";
  if (b >= 3) return l.teamSize >= 120 ? "dfy" : "agents";
  if (b === 2) return "systems";
  if (b === 1) return l.teamSize > 40 ? "systems" : "accelerator";
  return l.teamSize > 25 ? "accelerator" : "launchpad";
}

const SPECIALTY: Record<string, string[]> = {
  rohan: ["Real estate", "Textile & garments"],
  sneha: ["Healthcare", "Services"],
  arjun: ["Manufacturing", "Distribution"],
  kavya: ["Retail", "Education", "Food & hospitality"],
  imran: [],
};
const CLOSE_RATE: Record<string, number> = { rohan: 27, sneha: 31, arjun: 22, kavya: 24, imran: 12 };

function pickAdvisor(l: Lead, prog: ProgramId, load: Record<string, number>) {
  const high = ["systems", "agents", "dfy"].includes(prog);
  const ranked = salesTeam
    .map((p) => {
      let s = 50;
      const why: string[] = [];
      if (high && (p.id === "sneha" || p.id === "rohan")) {
        s += prog === "dfy" && p.id === "rohan" ? 34 : 28;
        why.push(`closes ${CLOSE_RATE[p.id]}% of ${programById[prog].short} deals`);
      }
      if (!high && (p.id === "arjun" || p.id === "kavya")) {
        s += 24;
        why.push(`runs the ${programById[prog].short} desk`);
      }
      if (SPECIALTY[p.id]?.includes(l.industry)) {
        s += 14;
        why.push(`${l.industry.toLowerCase()} specialist`);
      }
      if (!p.online) {
        s -= 22;
        why.push("offline today");
      }
      if (p.id === "imran") s -= 10;
      s -= (load[p.id] ?? 0) * 1.6;
      return { id: p.id, s, load: load[p.id] ?? 0, why };
    })
    .sort((a, b) => b.s - a.s);
  return ranked;
}

function reasons(l: Lead, f: Record<FactorId, number>) {
  const out: { t: string; good: boolean }[] = [];
  out.push(f.revenue >= 68 ? { t: `${l.revenue} turnover is squarely in our buyer band.`, good: true } : { t: `${l.revenue} is at the lower edge; Launchpad or Accelerator fits.`, good: false });
  if (f.workshop >= 100) out.push({ t: "Stayed for both days of Batch 14, so intent is high.", good: true });
  else if (f.workshop >= 70) out.push({ t: "Joined Day 1 but dropped before the Day 2 blueprint.", good: false });
  else if (f.workshop >= 35) out.push({ t: "Paid ₹51 for Batch 14 but never joined the Zoom.", good: false });
  else out.push({ t: `Came in cold from ${l.source.toLowerCase()}, no workshop yet.`, good: false });
  out.push(f.pain >= 80 ? { t: `Pain is specific: "${l.pain}".`, good: true } : { t: `Pain is vague ("${l.pain}"); probe on the call.`, good: false });
  if (l.teamSize >= 60) out.push({ t: `${l.teamSize} staff: enough people for process pain to be expensive.`, good: true });
  return out.slice(0, 3);
}

const DQ_REASONS = ["Turnover below ₹1 Cr", "Job seeker / student", "Wrong or fake number", "Competitor or agency", "Not the decision maker", "Duplicate lead", "Only wanted free recording"];

function draftQuestion(l: Lead, weakest: FactorId, me: string) {
  const fn = first(l.name);
  const q: Record<FactorId, string> = {
    revenue: `Namaste ${fn} ji, ${me} from BuildBiz AI. Thank you for your interest! Ek chhota sa sawaal, taaki hum sahi program suggest karein: ${l.company} ka annual turnover roughly kitna hai? ₹1-5 Cr, ₹5-25 Cr, ya usse zyada?`,
    team: `Namaste ${fn} ji, ${me} from BuildBiz AI. ${l.company} mein abhi kitne log kaam karte hain, aur sales team kitni badi hai? That helps us show you the right examples.`,
    pain: `Namaste ${fn} ji, ${me} here from BuildBiz AI. Aapke business mein abhi sabse zyada time kahan jaata hai: follow-ups, collections, approvals, ya reporting? One line is enough 🙏`,
    workshop: `Namaste ${fn} ji, ${me} from BuildBiz AI. We missed you at the Batch 14 workshop! Kya main aapko Day 2 ki recording bhej doon? And what made you register: kaunsi problem solve karni thi?`,
    source: `Namaste ${fn} ji, ${me} from BuildBiz AI. Aapne humein kahan se dekha? And would a 10-minute call tomorrow evening work to understand ${l.company} better?`,
  };
  return q[weakest];
}

type Processed = { id: string; action: "Qualified" | "Disqualified" | "Asked"; detail: string; prevOwner: string; prevTags: string[] };

/* ============================================================ */

export default function LeadQualifier() {
  const hq = useHQ();
  const { leads, me } = hq;
  const [w, setW] = React.useState<Weights>(DEFAULT_W);
  const [sort, setSort] = React.useState<"score" | "revenue" | "workshop">("score");
  const [srcF, setSrcF] = React.useState<string | null>(null);
  const [q, setQ] = React.useState("");
  const [view, setView] = React.useState<"inbox" | "processed">("inbox");
  const [override, setOverride] = React.useState<Record<string, string>>({});
  const [processed, setProcessed] = React.useState<Processed[]>([]);
  const [asked, setAsked] = React.useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const [dq, setDq] = React.useState<{ id: string; reason: string; note: string } | null>(null);
  const [ask, setAsk] = React.useState<{ id: string; text: string } | null>(null);
  const [bulk, setBulk] = React.useState(false);

  const load = React.useMemo(() => {
    const m: Record<string, number> = {};
    leads.forEach((l) => {
      if (l.stage !== "Won" && l.stage !== "Lost" && l.stage !== "New") m[l.owner] = (m[l.owner] ?? 0) + 1;
    });
    return m;
  }, [leads]);

  const fresh = React.useMemo(() => leads.filter((l) => l.stage === "New"), [leads]);
  const rankDefault = React.useMemo(() => {
    const ids = [...fresh].sort((a, b) => scoreWith(b, DEFAULT_W) - scoreWith(a, DEFAULT_W)).map((l) => l.id);
    return Object.fromEntries(ids.map((id, i) => [id, i]));
  }, [fresh]);

  const rows = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    return fresh
      .filter((l) => !srcF || l.source === srcF)
      .filter((l) => !term || `${l.name} ${l.company} ${l.city} ${l.industry}`.toLowerCase().includes(term))
      .map((l) => {
        const f = factors(l);
        const score = scoreWith(l, w);
        const prog = recommend(l);
        const adv = pickAdvisor(l, prog, load);
        return { l, f, score, prog, adv };
      })
      .sort((a, b) => (sort === "score" ? b.score - a.score : sort === "revenue" ? b.f.revenue - a.f.revenue || b.score - a.score : b.f.workshop - a.f.workshop || b.score - a.score));
  }, [fresh, srcF, q, w, sort, load]);
  const rankNow = Object.fromEntries([...rows].sort((a, b) => b.score - a.score).map((r, i) => [r.l.id, i]));
  const hot = rows.filter((r) => r.score >= 80);

  /* ---------- source analytics (all leads) ---------- */
  const bySource = React.useMemo(() => {
    const m = new Map<string, { n: number; score: number; won: number; closed: number; fresh: number }>();
    leads.forEach((l) => {
      const e = m.get(l.source) ?? { n: 0, score: 0, won: 0, closed: 0, fresh: 0 };
      e.n += 1;
      e.score += l.score;
      if (l.stage === "Won") e.won += 1;
      if (l.stage === "Won" || l.stage === "Lost") e.closed += 1;
      if (l.stage === "New") e.fresh += 1;
      m.set(l.source, e);
    });
    return [...m.entries()].map(([s, e]) => ({ source: s as LeadSource, n: e.n, avg: Math.round(e.score / e.n), won: e.won, closed: e.closed, fresh: e.fresh })).sort((a, b) => b.n - a.n);
  }, [leads]);
  const total = leads.length;
  const sized = bySource.filter((s) => s.n >= 5);
  const best = [...sized].sort((a, b) => b.avg - a.avg)[0];
  const worst = [...sized].sort((a, b) => a.avg - b.avg)[0];
  const meta = bySource.find((s) => s.source === "Meta ads");

  /* ---------- actions ---------- */
  function qualify(r: (typeof rows)[number], silent = false) {
    const owner = override[r.l.id] ?? r.adv[0].id;
    const prog = programById[r.prog];
    hq.updateLead(r.l.id, (l) => ({ stage: "Qualified", owner, score: r.score, interest: r.prog, value: prog.price, followUpIn: 2, tags: l.tags.includes("AI qualified") ? l.tags : [...l.tags, "AI qualified"] }));
    hq.addTask({ title: `First call: ${r.l.name}, ${r.l.company} (${prog.short})`, owner, status: "Todo", priority: r.score >= 85 ? "P0" : r.score >= 70 ? "P1" : "P2", due: "Today, 2h", dueIn: 0, area: "Sales", linked: r.l.id, aiDrafted: true, subtasks: [{ title: "Call within 2 hours of assignment", done: false }, { title: `Pitch ${prog.short}`, done: false }] });
    setProcessed((p) => [{ id: r.l.id, action: "Qualified", detail: `${prog.short} · ${personById[owner]?.first}`, prevOwner: r.l.owner, prevTags: r.l.tags }, ...p]);
    if (!silent) {
      hq.log(`qualified ${r.l.name} (${r.l.company}) at ${r.score} and assigned ${personById[owner]?.first}`, "ok");
      hq.notify({ kind: "lead", title: `${r.l.name} assigned to ${personById[owner]?.first}`, body: `Score ${r.score} · ${prog.short} · call task due in 2h`, href: `/hq/crm?lead=${r.l.id}` });
    }
  }
  function runBulk() {
    hot.forEach((r) => qualify(r, true));
    hq.log(`auto-qualified ${hot.length} leads above 80 and routed them to advisors`, "accent");
    hq.notify({ kind: "agent", title: `Auto-qualified ${hot.length} leads`, body: hot.map((r) => `${first(r.l.name)} → ${personById[override[r.l.id] ?? r.adv[0].id]?.first}`).join(", "), href: "/hq/followups" });
    setBulk(false);
  }
  function confirmDq() {
    if (!dq) return;
    const l = leads.find((x) => x.id === dq.id);
    if (!l) return;
    hq.updateLead(l.id, (x) => ({ stage: "Lost", followUpIn: 0, tags: [...x.tags.filter((t) => !t.startsWith("DQ:")), `DQ: ${dq.reason}`] }));
    setProcessed((p) => [{ id: l.id, action: "Disqualified", detail: dq.reason, prevOwner: l.owner, prevTags: l.tags }, ...p]);
    hq.log(`disqualified ${l.name} (${l.company}): ${dq.reason.toLowerCase()}`, "late");
    setDq(null);
  }
  function openAskFor(r: (typeof rows)[number]) {
    const weakest = FACTORS.map((x) => x.id).sort((a, b) => r.f[a] - r.f[b])[0];
    setAsk({ id: r.l.id, text: draftQuestion(r.l, weakest, me.first) });
  }
  function sendAsk() {
    if (!ask) return;
    const l = leads.find((x) => x.id === ask.id);
    if (!l) return;
    hq.updateLead(l.id, (x) => ({ tags: x.tags.includes("Asked on WhatsApp") ? x.tags : [...x.tags, "Asked on WhatsApp"] }));
    setAsked((a) => ({ ...a, [l.id]: true }));
    setProcessed((p) => [{ id: l.id, action: "Asked", detail: "WhatsApp question sent", prevOwner: l.owner, prevTags: l.tags }, ...p]);
    hq.log(`asked ${l.name} a qualifying question on WhatsApp`, "info");
    hq.notify({ kind: "lead", title: `Question sent to ${l.name}`, body: "The qualifier will re-score when they reply" });
    setAsk(null);
    const name = l.name;
    const company = l.company;
    window.setTimeout(() => {
      hq.notify({ kind: "lead", title: `${first(name)} replied on WhatsApp`, body: `"Turnover approx ₹6-7 Cr, 38 log hain. Kal shaam 7 baje call kar lo." · ${company}`, href: "/hq/qualifier" });
    }, 6000);
  }
  function undo(p: Processed) {
    hq.updateLead(p.id, { stage: "New", owner: p.prevOwner, tags: p.prevTags });
    setProcessed((list) => list.filter((x) => x !== p));
    hq.log(`undid ${p.action.toLowerCase()} on ${leads.find((l) => l.id === p.id)?.name}`, "warn");
  }

  const weightSum = FACTORS.reduce((a, x) => a + w[x.id], 0) || 1;
  const changed = FACTORS.some((x) => w[x.id] !== DEFAULT_W[x.id]);
  const pipeline = rows.reduce((a, r) => a + programById[r.prog].price, 0);
  const avg = rows.length ? Math.round(rows.reduce((a, r) => a + r.score, 0) / rows.length) : 0;

  return (
    <div>
      <PageHeader
        kicker="Revenue"
        title="Lead Qualifier"
        sub="Every inbound lead scored on five signals, matched to a program and routed to the advisor with the best fit and the most room. Tune the rules and the queue re-ranks live."
        actions={
          <>
            <Btn icon={Sparkles} onClick={() => hq.openAsk("Which lead source brought the best-quality leads this month?")}>
              Ask copilot
            </Btn>
            <Btn variant="solid" icon={CheckCheck} disabled={hot.length === 0} onClick={() => setBulk(true)}>
              Auto-qualify 80+ ({hot.length})
            </Btn>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Metric label="Awaiting triage" value={fresh.length} hint="since 6 PM yesterday" />
        <Metric label="Hot (80+)" value={hot.length} hint="ready to assign now" onClick={() => setSort("score")} />
        <Metric label="Avg score" value={avg} delta={changed ? `${avg - (rows.length ? Math.round(rows.reduce((a, r) => a + scoreWith(r.l, DEFAULT_W), 0) / rows.length) : 0) >= 0 ? "+" : ""}${avg - (rows.length ? Math.round(rows.reduce((a, r) => a + scoreWith(r.l, DEFAULT_W), 0) / rows.length) : 0)} vs default` : undefined} hint="with current rules" />
        <Metric label="Pipeline if qualified" value={rupees(pipeline)} hint="at recommended programs" />
        <Metric label="Triaged this session" value={processed.length} hint={`${processed.filter((p) => p.action === "Qualified").length} qualified · ${processed.filter((p) => p.action === "Disqualified").length} DQ`} onClick={() => setView("processed")} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* ---------------- cards ---------------- */}
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Segmented size="sm" value={view} onChange={setView} options={[{ value: "inbox", label: "Inbox", count: rows.length }, { value: "processed", label: "Triaged", count: processed.length }]} />
            {view === "inbox" && (
              <>
                <Segmented size="sm" value={sort} onChange={setSort} options={[{ value: "score", label: "By score" }, { value: "revenue", label: "By revenue" }, { value: "workshop", label: "By workshop" }]} />
                {srcF && (
                  <button type="button" onClick={() => setSrcF(null)} className="inline-flex h-7 items-center gap-1 rounded-full bg-d-soft px-2.5 text-[12px] font-medium text-d-accent">
                    {srcF} <X className="h-3 w-3" />
                  </button>
                )}
                <SearchBox value={q} onChange={setQ} placeholder="Search leads" className="ml-auto w-[220px]" />
              </>
            )}
          </div>

          {view === "processed" ? (
            <section className="desk-card divide-y divide-d-line">
              {processed.length === 0 && <p className="px-5 py-12 text-center text-[13px] text-d-mute">Nothing triaged yet this session.</p>}
              {processed.map((p, i) => {
                const l = leads.find((x) => x.id === p.id);
                if (!l) return null;
                return (
                  <div key={`${p.id}-${i}`} className="flex items-center gap-3 px-5 py-3">
                    <PersonAvatar name={l.name} size={32} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-semibold">
                        {l.name} <span className="font-normal text-d-mute">· {l.company}</span>
                      </p>
                      <p className="text-[12px] text-d-mute">{p.detail}</p>
                    </div>
                    <Pill tone={p.action === "Qualified" ? "ok" : p.action === "Disqualified" ? "late" : "info"}>{p.action}</Pill>
                    {p.action !== "Asked" && (
                      <Btn size="sm" variant="ghost" icon={RotateCcw} onClick={() => undo(p)}>
                        Undo
                      </Btn>
                    )}
                  </div>
                );
              })}
            </section>
          ) : rows.length === 0 ? (
            <div className="desk-card flex min-h-[300px] flex-col items-center justify-center p-10 text-center">
              <Check className="h-8 w-8 text-d-ok" />
              <p className="mt-3 font-serif text-[24px]">Inbox zero</p>
              <p className="mt-1 text-[13.5px] text-d-mute">Every inbound lead has been triaged. New ones from tonight&apos;s ads land here by 9 AM.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((r) => {
                const l = r.l;
                const delta = (rankDefault[l.id] ?? 0) - (rankNow[l.id] ?? 0);
                const owner = override[l.id] ?? r.adv[0].id;
                const advInfo = r.adv.find((a) => a.id === owner) ?? r.adv[0];
                const prog = programById[r.prog];
                const open = expanded === l.id;
                const rs = reasons(l, r.f);
                return (
                  <article key={l.id} className="desk-card desk-rise overflow-hidden">
                    <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                      {/* identity + reasons */}
                      <div className="min-w-0">
                        <div className="flex items-start gap-3.5">
                          <div className="flex w-[54px] shrink-0 flex-col items-center">
                            <span className={cn("tnum font-serif text-[34px] font-medium leading-none", r.score >= 80 ? "text-d-ok" : r.score < 55 ? "text-d-late" : "")}>{r.score}</span>
                            <span className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-d-mute">score</span>
                            {delta !== 0 && (
                              <span className={cn("mt-1 inline-flex items-center font-mono text-[10.5px] font-semibold", delta > 0 ? "text-d-ok" : "text-d-late")}>
                                {delta > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                {Math.abs(delta)}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-serif text-[21px] font-medium leading-tight">{l.name}</h3>
                              {r.score >= 80 && <Pill tone="ok">Hot</Pill>}
                              {asked[l.id] && <Pill tone="info">Awaiting reply</Pill>}
                            </div>
                            <p className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[12.5px] text-d-mute">
                              <span className="inline-flex items-center gap-1 font-medium text-d-ink">
                                <Building2 className="h-3.5 w-3.5" /> {l.company}
                              </span>
                              <span>{l.industry}</span>
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {l.city}
                              </span>
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <Pill>{l.revenue}</Pill>
                              <Pill>
                                <Users className="h-3 w-3" /> {l.teamSize}
                              </Pill>
                              <Pill>{l.source}</Pill>
                              <Pill mono>{l.phone}</Pill>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 rounded-[12px] border border-[color-mix(in_oklab,var(--d-gold)_30%,var(--d-line))] bg-[color-mix(in_oklab,var(--d-gold)_6%,var(--d-panel))] p-3">
                          <p className="mb-1.5 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[color-mix(in_oklab,var(--d-gold)_75%,black)]">
                            <Sparkles className="h-3 w-3" /> Why this score
                          </p>
                          <ul className="space-y-1">
                            {rs.map((x) => (
                              <li key={x.t} className="flex items-start gap-2 text-[12.5px] leading-snug">
                                <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: x.good ? "var(--d-ok)" : "var(--d-warn)" }} />
                                {x.t}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* breakdown */}
                      <div className="min-w-0">
                        <SectionLabel action={<button type="button" onClick={() => setExpanded(open ? null : l.id)} className="text-[11.5px] font-medium text-d-accent hover:underline">{open ? "Hide maths" : "Show maths"}</button>}>Score breakdown</SectionLabel>
                        <ul className="space-y-2">
                          {FACTORS.map((fx) => {
                            const v = r.f[fx.id];
                            const tone: Tone = v >= 80 ? "ok" : v >= 55 ? "warn" : "late";
                            return (
                              <li key={fx.id}>
                                <div className="flex items-baseline justify-between text-[12px]">
                                  <span>{fx.label}</span>
                                  <span className="tnum font-mono text-[11.5px] text-d-mute">
                                    {open ? `${v} × ${Math.round((w[fx.id] / weightSum) * 100)}% = ${Math.round((v * w[fx.id]) / weightSum)}` : v}
                                  </span>
                                </div>
                                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-d-sunk">
                                  <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${v}%`, background: `var(--d-${tone})` }} />
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>

                    {/* routing + actions */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-d-line bg-d-sunk/40 px-5 py-3.5">
                      <div className="min-w-0">
                        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-d-mute">Program</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[13.5px] font-semibold">
                          {prog.short} <span className="tnum font-mono text-[12px] font-normal text-d-mute">{rupees(prog.price)}</span>
                          {r.prog !== l.interest && <span className="text-[11.5px] font-normal text-d-mute">(asked about {programById[l.interest].short})</span>}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-d-mute">
                          Advisor {!override[l.id] && <AIMark label="Matched" className="normal-case tracking-normal" />}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <PersonAvatar id={owner} size={22} />
                          <select aria-label="Advisor" value={owner} onChange={(e) => setOverride((o) => ({ ...o, [l.id]: e.target.value }))} className="h-7 rounded-md border border-d-line bg-d-panel px-1.5 text-[13px] font-semibold outline-none focus:border-d-accent">
                            {r.adv.map((a) => (
                              <option key={a.id} value={a.id}>
                                {personById[a.id]?.first} · {a.load} open
                              </option>
                            ))}
                          </select>
                        </div>
                        <p className="mt-0.5 max-w-[300px] truncate text-[11px] text-d-mute">{advInfo.why.join(", ") || `${advInfo.load} open leads, best capacity`}</p>
                      </div>
                      <div className="ml-auto flex flex-wrap gap-2">
                        <Btn size="sm" variant="ghost" icon={MessageCircle} onClick={() => openAskFor(r)}>
                          Ask a question
                        </Btn>
                        <Btn size="sm" icon={Ban} onClick={() => setDq({ id: l.id, reason: r.f.revenue < 40 && r.score < 55 ? DQ_REASONS[0] : DQ_REASONS[4], note: "" })}>
                          Disqualify
                        </Btn>
                        <Btn size="sm" variant="solid" icon={UserCheck} onClick={() => qualify(r)}>
                          Qualify &amp; assign
                        </Btn>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* ---------------- rail ---------------- */}
        <div className="min-w-0 space-y-4">
          <section className="desk-card p-5">
            <SectionLabel action={changed ? <Btn size="sm" variant="ghost" icon={RotateCcw} onClick={() => setW(DEFAULT_W)}>Reset</Btn> : <AIMark label="Learned weights" />}>
              <span className="inline-flex items-center gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5" /> Scoring rules
              </span>
            </SectionLabel>
            <ul className="space-y-3.5">
              {FACTORS.map((fx) => (
                <li key={fx.id}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[13px] font-medium">{fx.label}</span>
                    <span className="tnum font-mono text-[12px] font-semibold">{Math.round((w[fx.id] / weightSum) * 100)}%</span>
                  </div>
                  <input type="range" min={0} max={50} value={w[fx.id]} onChange={(e) => setW((cur) => ({ ...cur, [fx.id]: Number(e.target.value) }))} className="mt-1 w-full accent-[var(--d-accent)]" aria-label={`${fx.label} weight`} />
                  <p className="text-[11.5px] text-d-mute">{fx.hint}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-1.5 border-t border-d-line pt-3">
              {[
                { label: "Intent first", w: { revenue: 15, team: 10, pain: 25, workshop: 35, source: 15 } },
                { label: "Big tickets", w: { revenue: 45, team: 25, pain: 10, workshop: 10, source: 10 } },
                { label: "Referral heavy", w: { revenue: 20, team: 10, pain: 15, workshop: 15, source: 40 } },
              ].map((p) => (
                <button key={p.label} type="button" onClick={() => setW(p.w)} className="h-7 rounded-full border border-d-line px-2.5 text-[12px] font-medium hover:bg-d-sunk">
                  {p.label}
                </button>
              ))}
            </div>
          </section>

          <section className="desk-card p-5">
            <SectionLabel action={srcF ? <button type="button" onClick={() => setSrcF(null)} className="text-[11.5px] text-d-accent hover:underline">Clear</button> : <span className="text-[11.5px] text-d-mute">{total} leads · Oct</span>}>Source mix</SectionLabel>
            <div className="flex h-3 overflow-hidden rounded-full">
              {bySource.map((s, i) => (
                <button key={s.source} type="button" title={`${s.source}: ${s.n}`} onClick={() => setSrcF(srcF === s.source ? null : s.source)} className="h-full transition-opacity hover:opacity-80" style={{ width: `${(s.n / total) * 100}%`, background: `color-mix(in oklab, var(--d-ink) ${80 - i * 10}%, var(--d-panel))`, opacity: srcF && srcF !== s.source ? 0.25 : 1 }} />
              ))}
            </div>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
              {bySource.map((s, i) => (
                <li key={s.source}>
                  <button type="button" onClick={() => setSrcF(srcF === s.source ? null : s.source)} className={cn("flex w-full items-center justify-between gap-2 text-[12.5px]", srcF === s.source && "font-semibold")}>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: `color-mix(in oklab, var(--d-ink) ${80 - i * 10}%, var(--d-panel))` }} />
                      {s.source}
                    </span>
                    <span className="tnum font-mono text-[11.5px] text-d-mute">{Math.round((s.n / total) * 100)}%</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="desk-card p-5">
            <SectionLabel action={<span className="text-[11.5px] text-d-mute">avg AI score</span>}>Quality by source</SectionLabel>
            <HBars data={[...bySource].sort((a, b) => b.avg - a.avg).map((s) => ({ label: s.source, value: s.avg, sub: `${s.won} won of ${s.n}`, tone: (s.avg >= 70 ? "ok" : s.avg >= 60 ? "warn" : "late") as Tone }))} max={100} onSelect={(lab) => setSrcF(srcF === lab ? null : lab)} />
          </section>

          {best && worst && (
            <AgentNote
              title="Lead quality by source"
              action={
                <>
                  <Btn size="sm" icon={Send} onClick={() => hq.notify({ kind: "agent", title: "Sent to Meera", body: `Source quality brief: shift budget toward ${best.source} lookalikes and workshop retargeting` })}>
                    Send to Meera
                  </Btn>
                  <Btn size="sm" variant="ghost" icon={Wand2} onClick={() => setW({ revenue: 20, team: 10, pain: 15, workshop: 15, source: 40 })}>
                    Weight by source
                  </Btn>
                </>
              }
            >
              {best.source} leads average {best.avg}, {best.avg - worst.avg} points above {worst.source} ({worst.avg}).
              {meta && ` Meta ads bring ${Math.round((meta.n / total) * 100)}% of volume but average ${meta.avg}; most of their value comes once they attend the ₹51 workshop.`} Pushing Meta traffic into Batch 15 before a sales call should lift close rates more than raising ad spend.
            </AgentNote>
          )}
        </div>
      </div>

      {/* ---------------- modals ---------------- */}
      <Modal open={bulk} onOpenChange={setBulk} title={`Auto-qualify ${hot.length} leads`} sub="Each goes to Qualified, gets an owner and a call task due in 2 hours.">
        <ul className="desk-scroll max-h-[320px] divide-y divide-d-line overflow-y-auto rounded-[12px] border border-d-line">
          {hot.map((r) => {
            const owner = override[r.l.id] ?? r.adv[0].id;
            return (
              <li key={r.l.id} className="flex items-center gap-3 px-3.5 py-2.5">
                <span className="tnum w-7 font-serif text-[18px] text-d-ok">{r.score}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold">{r.l.name}</span>
                  <span className="block truncate text-[11.5px] text-d-mute">
                    {r.l.company} · {programById[r.prog].short}
                  </span>
                </span>
                <PersonAvatar id={owner} size={22} />
                <span className="text-[12.5px]">{personById[owner]?.first}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex justify-end gap-2">
          <Btn variant="ghost" onClick={() => setBulk(false)}>
            Cancel
          </Btn>
          <Btn variant="solid" icon={CheckCheck} onClick={runBulk}>
            Qualify all {hot.length}
          </Btn>
        </div>
      </Modal>

      <Modal open={!!dq} onOpenChange={(o) => !o && setDq(null)} title="Disqualify lead" sub={dq ? `${leads.find((l) => l.id === dq.id)?.name} · moves to Lost with the reason tagged` : undefined} width={520}>
        {dq && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-1.5">
              {DQ_REASONS.map((r) => (
                <button key={r} type="button" onClick={() => setDq({ ...dq, reason: r })} className={cn("h-8 rounded-full border px-3 text-[12.5px] font-medium", dq.reason === r ? "border-d-late bg-[color-mix(in_oklab,var(--d-late)_10%,var(--d-panel))] text-d-late" : "border-d-line hover:bg-d-sunk")}>
                  {r}
                </button>
              ))}
            </div>
            <textarea value={dq.note} onChange={(e) => setDq({ ...dq, note: e.target.value })} rows={2} placeholder="Optional note for the team" className={cn(inputClass, "h-auto py-2")} />
            <div className="flex justify-end gap-2">
              <Btn variant="ghost" onClick={() => setDq(null)}>
                Cancel
              </Btn>
              <Btn variant="danger" icon={Ban} onClick={confirmDq}>
                Disqualify
              </Btn>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!ask} onOpenChange={(o) => !o && setAsk(null)} title="Ask on WhatsApp" sub="The AI picked the question that fills this lead's weakest signal." width={540}>
        {ask && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <AIMark label="Drafted from weakest signal" />
              <span className="font-mono text-[11px] text-d-mute">{leads.find((l) => l.id === ask.id)?.phone}</span>
            </div>
            <textarea value={ask.text} onChange={(e) => setAsk({ ...ask, text: e.target.value })} rows={5} className={cn(inputClass, "h-auto py-2.5 leading-relaxed")} />
            <div className="flex justify-end gap-2">
              <Btn variant="ghost" onClick={() => setAsk(null)}>
                Cancel
              </Btn>
              <Btn variant="solid" icon={Send} onClick={sendAsk}>
                Send on WhatsApp
              </Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
