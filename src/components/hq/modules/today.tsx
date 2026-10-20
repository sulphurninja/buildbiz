"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "cn";
import { ArrowRight, ArrowUpRight, Check, Clock, CornerDownLeft, Headphones, MessageSquareText, Phone, Plus, RotateCcw, Sparkles, Video, Wand2 } from "lucide-react";
import { useHQ } from "../store";
import { clientBuilds, personById, programById, revenueDaily, students, team, october } from "../data";
import { hqHref, hqModuleById } from "../nav";
import type { Lead, Person, Task } from "../types";
import { istParts, longDate, useNow } from "../../desk/hooks";
import { AIMark, AgentNote, Btn, HBars, Meter, Metric, PageHeader, Panel, PersonAvatar, Pill, SectionLabel, Sparkline, rupees } from "../kit";

/* ------------------------------------------------------------------ */
/* Local seed: agendas, team presence, overnight agent runs            */
/* ------------------------------------------------------------------ */

type AgendaItem = { id: string; start: number; mins: number; title: string; sub: string; kind: "call" | "meet" | "focus" | "live"; with?: string[] };

const agendaByRole: Record<Person["role"], AgendaItem[]> = {
  founder: [
    { id: "f1", start: 9, mins: 30, title: "Leadership stand-up", sub: "Rohan, Neha, Aditya · Zoom", kind: "meet", with: ["rohan", "neha", "aditya"] },
    { id: "f2", start: 11, mins: 30, title: "Close-rate drill (sit in)", sub: "Sales floor · new demo flow", kind: "meet", with: ["rohan", "sneha", "arjun"] },
    { id: "f3", start: 12.5, mins: 45, title: "Precision Auto Parts blueprint review", sub: "₹5.2 L build · flagged at risk", kind: "call", with: ["neha"] },
    { id: "f4", start: 15, mins: 60, title: "Record Agent Factory module 7", sub: "Studio · focus block", kind: "focus" },
    { id: "f5", start: 17, mins: 60, title: "Weekly leadership review", sub: "Revenue, delivery, hiring", kind: "meet", with: ["rohan", "neha", "aditya", "sahil"] },
    { id: "f6", start: 21, mins: 90, title: "Batch 15 content prep", sub: "Workshop slide refresh", kind: "live" },
  ],
  sales: [
    { id: "s1", start: 9.5, mins: 15, title: "Sales stand-up", sub: "Targets and today's queue", kind: "meet", with: ["rohan", "sneha", "arjun", "imran"] },
    { id: "s2", start: 10, mins: 90, title: "Power-dial block: Batch 14 hot leads", sub: "Queue sorted by AI score", kind: "focus" },
    { id: "s3", start: 11.5, mins: 30, title: "Close-rate drill", sub: "Industry desk in the first 5 minutes", kind: "meet", with: ["rohan"] },
    { id: "s4", start: 12.5, mins: 30, title: "Demo: Harish Patel, Kaveri Weaves", sub: "Textile desk · done-for-you interest", kind: "call" },
    { id: "s5", start: 16, mins: 30, title: "Partner call: Vivek Jain, Balaji", sub: "Partner joins · bring EMI plan", kind: "call" },
    { id: "s6", start: 19, mins: 10, title: "File sales day report", sub: "AI drafts it from your calls", kind: "focus" },
  ],
  delivery: [
    { id: "d1", start: 9.5, mins: 15, title: "Delivery stand-up", sub: "Builds and student health", kind: "meet", with: ["neha", "vikram", "priya"] },
    { id: "d2", start: 10.5, mins: 90, title: "Balaji Distributors UAT session", sub: "Collections + van stock flows", kind: "call", with: ["vikram"] },
    { id: "d3", start: 13, mins: 20, title: "Spice Route: Swiggy keys chase", sub: "Blocked 3 days on client", kind: "call" },
    { id: "d4", start: 15, mins: 60, title: "Batch 14 office hours", sub: "Blueprint Q&A · 86 registered", kind: "live" },
    { id: "d5", start: 17.5, mins: 45, title: "Precision Auto Parts blueprint", sub: "PPAP module scope", kind: "meet", with: ["amit"] },
  ],
  ops: [
    { id: "o1", start: 9.5, mins: 15, title: "Ops stand-up", sub: "Hiring, finance, ads", kind: "meet", with: ["aditya", "meera", "sahil"] },
    { id: "o2", start: 11, mins: 45, title: "Ad performance review", sub: "CPL, workshop seats, ROAS", kind: "meet", with: ["meera", "amit"] },
    { id: "o3", start: 14, mins: 45, title: "Interview: business advisor", sub: "Candidate 3 of 7", kind: "call" },
    { id: "o4", start: 16, mins: 60, title: "Razorpay reconciliation", sub: "October settlements", kind: "focus" },
    { id: "o5", start: 18.5, mins: 10, title: "File daily report", sub: "AI drafts it from your activity", kind: "focus" },
  ],
};

type Presence = { state: "call" | "online" | "focus" | "done" | "away"; label: string; since?: number };
const presence: Record<string, Presence> = {
  amit: { state: "focus", label: "Leadership review" },
  rohan: { state: "call", label: "Harish Patel", since: 7 * 60 + 12 },
  sneha: { state: "call", label: "Ritu Malhotra", since: 3 * 60 + 41 },
  arjun: { state: "online", label: "Dialling queue" },
  kavya: { state: "away", label: "On leave till Thu" },
  imran: { state: "call", label: "Qualifying", since: 52 },
  neha: { state: "focus", label: "Balaji UAT" },
  vikram: { state: "focus", label: "Swiggy sync fix" },
  priya: { state: "done", label: "Done at 6:40 PM" },
  aditya: { state: "online", label: "Online" },
  meera: { state: "online", label: "Ads manager" },
  sahil: { state: "done", label: "Done at 7:05 PM" },
};

type AgentRun = { id: string; agent: string; at: string; text: string; impact: string; tone: "ok" | "warn" | "info" | "accent"; href: string; cta: string };
const overnightByRole: Record<Person["role"], AgentRun[]> = {
  founder: [
    { id: "r1", agent: "Lead Qualifier", at: "2:14 AM", text: "Scored 34 Meta leads from overnight and routed 9 hot ones to advisor queues.", impact: "9 hot · 3 to Rohan", tone: "accent", href: "/hq/qualifier", cta: "Review" },
    { id: "r2", agent: "Follow-up agent", at: "6:30 AM", text: "Sent 62 WhatsApp nudges to Batch 14 attendees who left before the Q&A.", impact: "11 replies", tone: "ok", href: "/hq/agents", cta: "See replies" },
    { id: "r3", agent: "Collections agent", at: "7:05 AM", text: "Reminded 6 students with EMI dues; 2 paid via Razorpay link.", impact: "₹49,998 in", tone: "ok", href: "/hq/revenue", cta: "Open" },
    { id: "r4", agent: "Ads watchdog", at: "7:40 AM", text: "Flagged 2 ad sets with CPL above ₹90. Meera paused them at 9:15.", impact: "₹6.2k/day saved", tone: "warn", href: "/hq/roas", cta: "Open ROAS" },
    { id: "r5", agent: "Report writer", at: "8:00 AM", text: "Compiled yesterday's sales day reports into a one-page leadership brief.", impact: "5 of 5 filed", tone: "info", href: "/hq/sales-reports", cta: "Read" },
  ],
  sales: [
    { id: "r1", agent: "Lead Qualifier", at: "2:14 AM", text: "Re-scored your queue with overnight WhatsApp replies. 3 leads moved into Hot.", impact: "+3 hot", tone: "accent", href: "/hq/qualifier", cta: "Review" },
    { id: "r2", agent: "Follow-up agent", at: "6:30 AM", text: "Sent workshop-recap nudges to 14 of your leads and booked 2 calls into your calendar.", impact: "2 calls booked", tone: "ok", href: "/hq/followups", cta: "See board" },
    { id: "r3", agent: "Call-prep agent", at: "7:10 AM", text: "Wrote one-page briefs for today's demo and partner call, with each lead's pain and objections.", impact: "2 briefs", tone: "info", href: "/hq/crm", cta: "Open CRM" },
    { id: "r4", agent: "Payments agent", at: "7:45 AM", text: "Generated Accelerator EMI links (3 × ₹25,000) for leads who asked about instalments.", impact: "4 links ready", tone: "accent", href: "/hq/revenue", cta: "Open" },
  ],
  delivery: [
    { id: "r1", agent: "Build monitor", at: "1:20 AM", text: "Ran nightly test suites across 6 client builds. Balaji passed 41/42; Spice Route sync still failing.", impact: "1 failing", tone: "warn", href: "/hq/builds", cta: "Open builds" },
    { id: "r2", agent: "Access agent", at: "5:50 AM", text: "Provisioned portal and community access for 212 Batch 14 students; 9 bounced emails.", impact: "9 need you", tone: "warn", href: "/hq/readiness", cta: "Fix" },
    { id: "r3", agent: "Student success agent", at: "6:45 AM", text: "Drafted a nudge sequence for 18 at-risk students in Batch 13. Waiting for approval.", impact: "18 students", tone: "accent", href: "/hq/students", cta: "Approve" },
    { id: "r4", agent: "Recording agent", at: "7:30 AM", text: "Cut Batch 14 day 2 into 11 chapters with captions and uploaded to the portal.", impact: "11 chapters", tone: "ok", href: "/hq/library", cta: "Open" },
  ],
  ops: [
    { id: "r1", agent: "Ads watchdog", at: "3:00 AM", text: "Owner-story Reel CPL held at ₹38 overnight; 2 ad sets crossed ₹90 and were flagged.", impact: "2 flagged", tone: "warn", href: "/hq/roas", cta: "Open ROAS" },
    { id: "r2", agent: "Finance agent", at: "6:00 AM", text: "Matched 148 of 152 Razorpay settlements to invoices. 4 need a manual look.", impact: "4 unmatched", tone: "warn", href: "/hq/revenue", cta: "Reconcile" },
    { id: "r3", agent: "Hiring agent", at: "7:15 AM", text: "Screened 38 applications for business advisor; shortlisted 7 and scheduled 3 interviews.", impact: "7 shortlisted", tone: "ok", href: "/hq/tasks", cta: "Shortlist" },
    { id: "r4", agent: "Report writer", at: "8:00 AM", text: "Pre-filled today's daily report from your activity. Review and submit by 7 PM.", impact: "Draft ready", tone: "info", href: "/hq/daily", cta: "Review" },
  ],
};

const callsToday: Record<string, { calls: number; connected: number; talk: number }> = {
  rohan: { calls: 38, connected: 17, talk: 142 },
  sneha: { calls: 44, connected: 21, talk: 168 },
  arjun: { calls: 51, connected: 19, talk: 121 },
  kavya: { calls: 0, connected: 0, talk: 0 },
  imran: { calls: 86, connected: 34, talk: 97 },
};
const bookedBase: Record<string, number> = { rohan: 1460000, sneha: 1180000, arjun: 690000, kavya: 540000, imran: 310000 };
const DAY_OF_MONTH = 20;
const DAYS_LEFT = 11;

const leadReason = (l: Lead) => {
  if (l.attendedWorkshop && l.score >= 85) return `Attended the workshop, ${l.revenue} ${l.industry.toLowerCase()}`;
  if (l.followUpIn < 0) return `Follow-up ${Math.abs(l.followUpIn)}h overdue · ${l.pain.toLowerCase()}`;
  if (l.tags.includes("Decision maker")) return `Decision maker · ${l.revenue} · ${l.teamSize} staff`;
  return l.pain;
};

/* ------------------------------------------------------------------ */

export default function Today() {
  const hq = useHQ();
  const { me } = hq;
  const now = useNow(30000);

  React.useEffect(() => {
    // deep link for demos: /hq?as=rohan opens the cockpit as that teammate
    const as = new URLSearchParams(window.location.search).get("as");
    if (as && personById[as]) {
      const id = window.setTimeout(() => hq.setMe(as), 0);
      return () => window.clearTimeout(id);
    }
  }, [hq]);

  const parts = now ? istParts(now) : null;
  const hour = parts?.hour ?? 9;
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const myTasks = hq.tasks.filter((t) => t.owner === me.id);
  const openTasks = myTasks.filter((t) => t.status !== "Done");

  return (
    <div>
      <PageHeader
        kicker="Workspace"
        title={
          <>
            {greeting}, {me.first}
          </>
        }
        sub={
          <>
            {now ? longDate(now) : "Tuesday, 20 October 2026"} · {me.title} · {openTasks.length} open tasks, {openTasks.filter((t) => t.dueIn <= 0).length} due today or late
          </>
        }
        actions={
          <>
            <Btn icon={MessageSquareText} onClick={() => hq.openAsk(me.role === "sales" ? "Which leads should I call first?" : "What needs my attention today?")}>
              Ask about my day
            </Btn>
            <Btn variant="solid" icon={Sparkles} onClick={() => hq.runAgent()}>
              Run morning operator
            </Btn>
          </>
        }
      />

      <TeamPulse now={now} />

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <MorningBrief me={me} />
        <Agenda me={me} decimal={parts?.decimal ?? null} />
      </div>

      <div className="mt-7">
        <SectionLabel action={<span className="font-mono text-[11px] text-d-mute">Month to date · day {DAY_OF_MONTH} of 31</span>}>Your numbers</SectionLabel>
        <Numbers me={me} />
      </div>

      <div className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-5">
          {me.role === "sales" ? <CallQueue me={me} /> : me.role === "delivery" ? <MyBuilds me={me} /> : me.role === "founder" ? <TeamBoard /> : <OpsDesk me={me} />}
          <MyTasks me={me} tasks={myTasks} />
        </div>
        <Overnight me={me} />
      </div>

      <div className="mt-7">
        <SectionLabel action={<span className="text-[12px] text-d-mute">Ordered for {me.role === "founder" ? "the founder" : `${me.role}`}</span>}>Quick access</SectionLabel>
        <QuickAccess me={me} />
      </div>
    </div>
  );
}

/* ---------------- Team pulse ---------------- */

function TeamPulse({ now }: { now: Date | null }) {
  const hq = useHQ();
  const [start] = React.useState(() => now?.getTime() ?? 0);
  const elapsed = now && start ? Math.round((now.getTime() - start) / 1000) : 0;
  const counts = { call: 0, online: 0, focus: 0, done: 0, away: 0 };
  team.forEach((p) => {
    counts[presence[p.id]?.state ?? "online"] += 1;
  });
  const tone = (s: Presence["state"]) => (s === "call" ? "var(--d-accent)" : s === "online" ? "var(--d-ok)" : s === "focus" ? "var(--d-warn)" : "var(--d-mute)");
  const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
  return (
    <div className="desk-card flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
      <div className="flex shrink-0 items-center gap-4 border-d-line pr-2 md:border-r md:pr-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-d-mute">Team pulse</p>
        <div className="flex gap-3 font-mono text-[11.5px]">
          <span><b className="text-d-ink">{counts.online + counts.call + counts.focus}</b> <span className="text-d-mute">in</span></span>
          <span><b style={{ color: "var(--d-accent)" }}>{counts.call}</b> <span className="text-d-mute">on calls</span></span>
          <span><b className="text-d-mute">{counts.done + counts.away}</b> <span className="text-d-mute">out</span></span>
        </div>
      </div>
      <div className="desk-noscroll flex min-w-0 flex-1 gap-1 overflow-x-auto">
        {team.map((p) => {
          const pr = presence[p.id] ?? { state: "online", label: "Online" };
          const out = pr.state === "done" || pr.state === "away";
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => (p.id === hq.me.id ? toast("That's you") : toast(`${p.first}: ${pr.label}`, { description: pr.state === "call" ? "Ping them in HQ once the call ends." : p.title }))}
              className={cn("group flex shrink-0 items-center gap-2 rounded-full border border-transparent py-1 pl-1 pr-3 text-left transition-colors hover:border-d-line hover:bg-d-sunk", p.id === hq.me.id && "border-d-line bg-d-sunk/60", out && "opacity-60")}
            >
              <span className="relative">
                <PersonAvatar id={p.id} size={28} />
                <span className={cn("absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-d-panel", pr.state === "call" && "desk-ping")} style={{ background: tone(pr.state) }} />
              </span>
              <span className="leading-tight">
                <span className="block text-[12.5px] font-medium">{p.first}</span>
                <span className="block max-w-[120px] truncate text-[11px] text-d-mute">
                  {pr.state === "call" ? (
                    <>
                      <Phone className="mr-0.5 inline h-2.5 w-2.5" /> <span className="tnum font-mono">{fmt((pr.since ?? 0) + elapsed)}</span> · {pr.label}
                    </>
                  ) : (
                    pr.label
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- AI brief ---------------- */

type Suggestion = { title: string; priority: Task["priority"]; area: Task["area"] };

function useBrief(me: Person) {
  const hq = useHQ();
  return React.useMemo(() => {
    const open = (l: Lead) => l.stage !== "Won" && l.stage !== "Lost";
    if (me.role === "sales") {
      const mine = hq.leads.filter((l) => l.owner === me.id && open(l)).sort((a, b) => b.score - a.score);
      const hot = mine.filter((l) => l.score >= 80);
      const overdue = mine.filter((l) => l.followUpIn < 0);
      const won = hq.leads.filter((l) => l.owner === me.id && l.stage === "Won").reduce((a, l) => a + l.value, 0);
      const booked = (bookedBase[me.id] ?? 0) + won;
      const target = me.target ?? 1;
      const need = Math.max(0, target - booked);
      const top = mine[0];
      return {
        headline: `${hot.length} hot leads in your queue. Start with ${top ? `${top.name} (${top.score})` : "the top of the queue"}.`,
        bullets: [
          top ? `${top.name}, ${top.company}: ${leadReason(top)}. Pitch ${programById[top.interest].short} at ${rupees(top.value)}.` : "Your queue is clear.",
          `${overdue.length} follow-ups are overdue${overdue.length ? `, the oldest by ${Math.max(...overdue.map((l) => -l.followUpIn))}h` : ""}. Clear them before the 11:30 drill.`,
          `You are at ${Math.round((booked / target) * 100)}% of your ${rupees(target)} target. ${need > 0 ? `You need ${rupees(need / DAYS_LEFT)} a day for the next ${DAYS_LEFT} days, about one Accelerator every day.` : "Target is done; everything now is upside."}`,
        ],
        suggestions: [
          ...(top ? [{ title: `Call ${top.name} (${top.company}) before noon`, priority: "P0" as const, area: "Sales" as const }] : []),
          { title: `Clear ${overdue.length} overdue follow-ups`, priority: "P1", area: "Sales" },
          { title: "Send EMI plan to every lead tagged 'EMI ask'", priority: "P2", area: "Sales" },
        ] as Suggestion[],
      };
    }
    if (me.role === "delivery") {
      const builds = clientBuilds.filter((b) => b.lead === me.id || me.id === "neha");
      const risky = builds.filter((b) => b.health !== "On track");
      const nextLive = builds.filter((b) => b.stage !== "Live").sort((a, b) => a.goLiveIn - b.goLiveIn)[0];
      const coached = students.filter((s) => s.coach === me.id);
      const atRisk = coached.filter((s) => s.status === "At risk");
      return {
        headline: risky.length ? `${risky.length} build${risky.length > 1 ? "s" : ""} need you today; ${risky[0].client.split(",")[0]} is ${risky[0].health.toLowerCase()}.` : "All your builds are on track.",
        bullets: [
          nextLive ? `${nextLive.client} goes live in ${nextLive.goLiveIn} day${nextLive.goLiveIn === 1 ? "" : "s"} (${nextLive.progress}% done). Lock the cut-over checklist today.` : "No go-lives this week.",
          risky.length ? `${risky.map((b) => `${b.client.split(",")[0]} (${b.health.toLowerCase()})`).join(", ")}. Spice Route has waited 3 days for Swiggy API keys from the client.` : "No blockers reported overnight.",
          `${coached.length} students on your roster, ${atRisk.length} at risk on attendance. The student success agent has a nudge sequence waiting for approval.`,
        ],
        suggestions: [
          { title: "Escalate Swiggy API keys with Spice Route owner", priority: "P0", area: "Delivery" },
          ...(nextLive ? [{ title: `Cut-over checklist for ${nextLive.client.split(",")[0]}`, priority: "P1" as const, area: "Delivery" as const }] : []),
          { title: `Approve nudge sequence for ${atRisk.length} at-risk students`, priority: "P1", area: "Delivery" },
        ] as Suggestion[],
      };
    }
    if (me.role === "founder") {
      const mtd = october.booked;
      const target = october.target;
      const pace = october.forecast;
      const overdue = hq.tasks.filter((t) => t.dueIn < 0 && t.status !== "Done");
      const pipeline = hq.leads.filter(open).reduce((a, l) => a + l.value, 0);
      return {
        headline:
          pace >= target
            ? `October is pacing to ${rupees(pace)}, past the ${rupees(target)} target. Protect delivery capacity next.`
            : `October is pacing to ${rupees(pace)}, ${rupees(target - pace)} short of ${rupees(target)}. Six proposals close the gap before Diwali.`,
        bullets: [
          `${rupees(mtd)} booked in ${DAY_OF_MONTH} days. Sales has ${rupees(pipeline)} open; closing 18% of qualified calls covers the gap.`,
          `Batch 14 had 1,248 registrations and 61% show-up. 312 stayed past the Q&A and are in today's call queues.`,
          `Spice Route is blocked on the client and Precision Auto Parts is at risk. ${overdue.length} tasks are overdue across the team, including GST filing.`,
        ],
        suggestions: [
          { title: "Call Spice Route owner about Swiggy keys", priority: "P0", area: "Delivery" },
          { title: "Approve ₹45k/day budget on owner-story creative", priority: "P1", area: "Marketing" },
          { title: "Review overdue tasks in leadership review", priority: "P1", area: "Ops" },
        ] as Suggestion[],
      };
    }
    const mine = hq.tasks.filter((t) => t.owner === me.id && t.status !== "Done");
    const late = mine.filter((t) => t.dueIn < 0);
    const byId: Record<string, { headline: string; bullets: string[]; suggestions: Suggestion[] }> = {
      meera: {
        headline: "CPL held at ₹38 on the owner-story Reel. Scale it, kill the two ₹90 ad sets.",
        bullets: ["Spend yesterday ₹44.2k for 1,163 leads; 31% booked a workshop seat.", "Two ad sets crossed ₹90 CPL overnight; the watchdog flagged them.", "Batch 15 registrations open Thursday; creative refresh is due."],
        suggestions: [
          { title: "Scale owner-story Reel to ₹45k/day", priority: "P1", area: "Marketing" },
          { title: "Brief two new hooks for Batch 15 creatives", priority: "P2", area: "Marketing" },
        ],
      },
      sahil: {
        headline: `GST filing is overdue and 4 Razorpay settlements are unmatched.`,
        bullets: ["148 of 152 settlements matched overnight; 4 need a manual look.", "Skyline Realty milestone 2 (₹78,000) is 6 days past due.", "Six EMI students were reminded; two paid."],
        suggestions: [
          { title: "File September GST return", priority: "P0", area: "Finance" },
          { title: "Match 4 unmatched Razorpay settlements", priority: "P1", area: "Finance" },
        ],
      },
    };
    return (
      byId[me.id] ?? {
        headline: `${mine.length} open tasks, ${late.length} late. Hiring and the November Zoom licence are today's priorities.`,
        bullets: ["The hiring agent shortlisted 7 advisors and scheduled 3 interviews.", "Zoom seats hit 92% in Batch 14; the 3,000-seat licence must be booked before Batch 15.", "Diwali leave calendar closes on 25 Oct; 4 people haven't filled it."],
        suggestions: [
          { title: "Book 3,000-seat Zoom licence for Batch 15", priority: "P1", area: "Ops" },
          { title: "Remind 4 teammates to mark Diwali leave", priority: "P2", area: "Ops" },
        ],
      }
    );
  }, [me, hq.leads, hq.tasks]);
}

const sinceYesterday: Record<Person["role"], { k: string; v: string; d: string; good: boolean }[]> = {
  founder: [
    { k: "Bookings", v: "₹4.9 L", d: "+22%", good: true },
    { k: "UPI + cards", v: "₹3.1 L", d: "+₹0.8 L", good: true },
    { k: "Ad CPL", v: "₹38", d: "-₹6", good: true },
    { k: "Refund asks", v: "2", d: "+1", good: false },
  ],
  sales: [
    { k: "New leads", v: "11", d: "+3 hot", good: true },
    { k: "WhatsApp replies", v: "7", d: "+5", good: true },
    { k: "Calls booked", v: "2", d: "by agent", good: true },
    { k: "Went cold", v: "3", d: "48h idle", good: false },
  ],
  delivery: [
    { k: "Tests passing", v: "96%", d: "-2 pts", good: false },
    { k: "Access issued", v: "212", d: "+212", good: true },
    { k: "Bounced emails", v: "9", d: "+9", good: false },
    { k: "Tickets closed", v: "14", d: "+4", good: true },
  ],
  ops: [
    { k: "Settled", v: "₹6.8 L", d: "148/152", good: true },
    { k: "Applications", v: "38", d: "+12", good: true },
    { k: "GST due", v: "1", d: "2d late", good: false },
    { k: "Spend", v: "₹44.2k", d: "-3%", good: true },
  ],
};

const overnightQuote: Record<Person["role"], { label: string; text: string; who: string }> = {
  founder: { label: "Best WhatsApp reply overnight", text: "Sir workshop ke baad pehli baar laga ki business mere bina bhi chal sakta hai. Done-for-you ka quote bhej dijiye.", who: "Harish Patel · Kaveri Weaves, Surat · 11:48 PM" },
  sales: { label: "Lead reply waiting for you", text: "Haan ji, kal 12 baje call kar lijiye. Partner bhi join karenge, EMI option zaroor batana.", who: "Vivek Jain · Balaji Distributors, Nagpur · 10:12 PM" },
  delivery: { label: "Client message overnight", text: "Swiggy wale keys kal tak de denge bole hain. Aap Friday go-live pe hi chaliye, hum ready hain.", who: "Mahesh Reddy · Spice Route Restaurants, Hyderabad · 11:05 PM" },
  ops: { label: "Vendor message overnight", text: "Dhanteras se pehle invoice clear ho jaaye toh accha rahega. UPI pe bhi chalega.", who: "Interakt billing · 9:40 PM" },
};

function MorningBrief({ me }: { me: Person }) {
  const hq = useHQ();
  const brief = useBrief(me);
  const [applied, setApplied] = React.useState<string[]>([]);
  const [regen, setRegen] = React.useState(false);
  const add = (s: Suggestion) => {
    hq.addTask({ title: s.title, owner: me.id, priority: s.priority, area: s.area, status: "Todo", dueIn: 0, due: "Today", aiDrafted: true });
    setApplied((cur) => [...cur, s.title]);
    hq.log(`added "${s.title}" from the AI brief`, "accent");
    toast.success("Added to your tasks", { description: s.title });
  };
  const pending = brief.suggestions.filter((s) => !applied.includes(s.title));
  return (
    <section className="desk-card desk-rise relative flex min-w-0 flex-col overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--d-gold)_22%,transparent),transparent_70%)]" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AIMark label="Morning brief" />
          <span className="font-mono text-[11px] text-d-mute">written 7:58 AM from CRM, tasks, builds and ads</span>
        </div>
        <Btn
          size="sm"
          variant="ghost"
          icon={RotateCcw}
          onClick={() => {
            setRegen(true);
            window.setTimeout(() => {
              setRegen(false);
              toast("Brief refreshed with live numbers");
            }, 900);
          }}
        >
          {regen ? "Rewriting…" : "Refresh"}
        </Btn>
      </div>
      <h2 className={cn("mt-3 max-w-[760px] font-serif text-[24px] font-medium leading-snug tracking-[-0.01em] transition-opacity", regen && "opacity-40")}>{brief.headline}</h2>
      <ol className={cn("mt-4 space-y-2.5 transition-opacity", regen && "opacity-40")}>
        {brief.bullets.map((b, i) => (
          <li key={b} className="flex gap-3 text-[13.5px] leading-relaxed text-d-ink/85">
            <span className="mt-0.5 font-mono text-[11px] text-d-mute">0{i + 1}</span>
            <span>{b}</span>
          </li>
        ))}
      </ol>
      <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[12px] border border-d-line bg-d-line sm:grid-cols-4">
        {sinceYesterday[me.role].map((s) => (
          <button key={s.k} type="button" onClick={() => hq.openAsk(`Explain: ${s.k.toLowerCase()} ${s.v} since yesterday`)} className="bg-d-panel px-3 py-2.5 text-left transition-colors hover:bg-d-sunk" title="Ask HQ why">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-d-mute">{s.k}</p>
            <p className="mt-0.5 flex items-baseline gap-1.5">
              <span className="tnum font-serif text-[19px] font-medium leading-none">{s.v}</span>
              <span className="font-mono text-[10.5px]" style={{ color: s.good ? "var(--d-ok)" : "var(--d-late)" }}>{s.d}</span>
            </p>
          </button>
        ))}
      </div>
      <figure className="mt-4 rounded-[12px] bg-d-sunk/70 px-4 py-3">
        <p className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-d-mute">
          <MessageSquareText className="h-3 w-3" /> {overnightQuote[me.role].label}
        </p>
        <blockquote className="mt-1.5 font-serif text-[16px] italic leading-snug text-d-ink/90">“{overnightQuote[me.role].text}”</blockquote>
        <figcaption className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-[12px] text-d-mute">
          <span>{overnightQuote[me.role].who}</span>
          <button type="button" onClick={() => hq.openAsk(`Draft a reply to: ${overnightQuote[me.role].text}`)} className="inline-flex items-center gap-1 font-medium text-d-accent hover:underline">
            <Sparkles className="h-3 w-3" /> Draft reply
          </button>
        </figcaption>
      </figure>
      <div className="mt-auto border-t border-d-line pt-4">
        <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-d-mute">Suggested for today</p>
        <div className="flex flex-wrap gap-2">
          {brief.suggestions.map((s) => {
            const done = applied.includes(s.title);
            return (
              <button
                key={s.title}
                type="button"
                disabled={done}
                onClick={() => add(s)}
                className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12.5px] transition-colors", done ? "border-transparent bg-d-sunk text-d-mute" : "border-d-line bg-d-panel hover:border-[color-mix(in_oklab,var(--d-gold)_50%,var(--d-line))] hover:bg-[color-mix(in_oklab,var(--d-gold)_8%,var(--d-panel))]")}
              >
                {done ? <Check className="h-3.5 w-3.5 text-d-ok" /> : <Plus className="h-3.5 w-3.5 text-d-mute" />}
                {s.title}
                <span className="font-mono text-[10.5px] text-d-mute">{s.priority}</span>
              </button>
            );
          })}
          {pending.length > 1 && (
            <Btn size="sm" variant="soft" onClick={() => pending.forEach(add)}>
              Add all {pending.length}
            </Btn>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Agenda ---------------- */

const fmtHour = (h: number) => {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, "0")} ${hh < 12 ? "AM" : "PM"}`;
};
const kindIcon = { call: Phone, meet: Video, focus: Headphones, live: Video };

function Agenda({ me, decimal }: { me: Person; decimal: number | null }) {
  const hq = useHQ();
  const items = agendaByRole[me.role];
  const [joined, setJoined] = React.useState<string[]>([]);
  const nextIdx = decimal === null ? 0 : items.findIndex((it) => it.start + it.mins / 60 > decimal);
  const remaining = nextIdx === -1 ? 0 : items.length - nextIdx;
  return (
    <Panel title="Up next" sub={decimal === null ? `${items.length} on your calendar` : remaining ? `${remaining} of ${items.length} left today` : "Your calendar is clear for today"} action={<Pill mono>IST</Pill>} bodyClassName="pt-2">
      <ol className="relative">
        {items.map((it, i) => {
          const end = it.start + it.mins / 60;
          const past = decimal !== null && end <= decimal;
          const live = decimal !== null && it.start <= decimal && end > decimal;
          const next = i === nextIdx && !live;
          const Icon = kindIcon[it.kind];
          return (
            <li key={it.id} className={cn("relative flex gap-3 rounded-[12px] px-2.5 py-2.5", (live || next) && "bg-d-sunk/70", past && "opacity-55")}>
              <div className="w-[62px] shrink-0 pt-0.5 text-right">
                <p className="tnum font-mono text-[11.5px] font-medium">{fmtHour(it.start)}</p>
                <p className="font-mono text-[10.5px] text-d-mute">{it.mins}m</p>
              </div>
              <span className="relative mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-d-line bg-d-panel" style={live ? { borderColor: "var(--d-ok)", color: "var(--d-ok)" } : undefined}>
                {past ? <Check className="h-3 w-3 text-d-mute" /> : <Icon className="h-3 w-3" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn("truncate text-[13.5px] font-medium", past && "line-through decoration-d-mute/50")}>{it.title}</p>
                <p className="truncate text-[12px] text-d-mute">{it.sub}</p>
                {it.with && (
                  <div className="mt-1.5 flex -space-x-1.5">
                    {it.with.map((w) => (
                      <PersonAvatar key={w} id={w} size={20} ring />
                    ))}
                  </div>
                )}
              </div>
              {(live || next) && (
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {live ? <Pill tone="ok">Now</Pill> : <Pill tone="info">Next</Pill>}
                  {it.kind !== "focus" && (
                    <Btn
                      size="sm"
                      variant={joined.includes(it.id) ? "soft" : "outline"}
                      onClick={() => {
                        setJoined((c) => [...c, it.id]);
                        hq.log(`joined "${it.title}"`, "info");
                        toast(`Joining ${it.title}`, { description: "Zoom opens in a new tab." });
                      }}
                    >
                      {joined.includes(it.id) ? "Joined" : "Join"}
                    </Btn>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {remaining === 0 && decimal !== null && (
        <AgentNote className="mt-3" title="Tomorrow is already drafted">
          The operator has blocked 10 to 11:30 AM for {me.role === "sales" ? "your hottest call-backs" : "your top priority"} and moved two low-priority items to Thursday.
        </AgentNote>
      )}
    </Panel>
  );
}

/* ---------------- Numbers ---------------- */

function Numbers({ me }: { me: Person }) {
  const hq = useHQ();
  const open = (l: Lead) => l.stage !== "Won" && l.stage !== "Lost";
  if (me.role === "sales") {
    const c = callsToday[me.id] ?? { calls: 0, connected: 0, talk: 0 };
    const logged = hq.leads.reduce((a, l) => a + l.calls.filter((x) => x.by === me.id && /just|today|20 Oct/i.test(x.at)).length, 0);
    const won = hq.leads.filter((l) => l.owner === me.id && l.stage === "Won").reduce((a, l) => a + l.value, 0);
    const booked = (bookedBase[me.id] ?? 0) + won;
    const target = me.target ?? 1;
    const pct = Math.round((booked / target) * 100);
    const pacePct = Math.round((DAY_OF_MONTH / 31) * 100);
    const overdue = hq.leads.filter((l) => l.owner === me.id && open(l) && l.followUpIn < 0).length;
    const pipe = hq.leads.filter((l) => l.owner === me.id && open(l)).reduce((a, l) => a + l.value, 0);
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
        <div className="desk-card px-4 py-3.5 sm:col-span-2 xl:col-span-1">
          <div className="flex items-baseline justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-d-mute">Booked vs target</p>
            <span className="font-mono text-[11.5px] font-semibold" style={{ color: pct >= pacePct ? "var(--d-ok)" : "var(--d-warn)" }}>
              {pct >= pacePct ? "ahead" : "behind"} of pace
            </span>
          </div>
          <p className="mt-1.5 flex items-baseline gap-2">
            <span className="tnum font-serif text-[30px] font-medium leading-none">{rupees(booked)}</span>
            <span className="font-mono text-[12px] text-d-mute">/ {rupees(target)}</span>
          </p>
          <div className="relative mt-3">
            <Meter value={pct} tone={pct >= pacePct ? "ok" : "warn"} />
            <span className="absolute -top-1 h-[14px] w-px bg-d-ink" style={{ left: `${pacePct}%` }} title="Pace for today" />
          </div>
          <p className="mt-1.5 text-[11.5px] text-d-mute">
            {pct}% done · pace marker at {pacePct}%
          </p>
        </div>
        <Metric label="Calls today" value={c.calls + logged} delta={`+${Math.round(c.calls * 0.12)}`} hint={`${c.talk} min talk time`} />
        <Metric label="Connect rate" value={`${c.calls ? Math.round((c.connected / c.calls) * 100) : 0}%`} delta="+4 pts" hint={`${c.connected} conversations`} />
        <Metric label="Overdue follow-ups" value={overdue} delta={overdue > 3 ? `${overdue - 3} above norm` : "on track"} good={overdue <= 3} hint="Board sorted oldest first" onClick={() => toast("Open the Follow-up Board to clear them")} />
        <Metric label="My open pipeline" value={rupees(pipe)} hint={`${hq.leads.filter((l) => l.owner === me.id && open(l)).length} leads`} />
      </div>
    );
  }
  if (me.role === "delivery") {
    const builds = clientBuilds.filter((b) => (me.id === "neha" ? true : b.lead === me.id) && b.stage !== "Live");
    const coached = students.filter((s) => s.coach === me.id);
    const atRisk = coached.filter((s) => s.status === "At risk").length;
    const next = [...builds].sort((a, b) => a.goLiveIn - b.goLiveIn)[0];
    const avgAtt = Math.round(coached.reduce((a, s) => a + s.attendance, 0) / (coached.length || 1));
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label={me.id === "neha" ? "Builds in flight" : "Builds I lead"} value={builds.length} hint={rupees(builds.reduce((a, b) => a + b.value, 0)) + " contracted"} />
        <Metric label="Next go-live" value={next ? `${next.goLiveIn}d` : "—"} hint={next?.client} />
        <Metric label="Students coached" value={coached.length} delta="+38" hint="Batch 14 joined this week" />
        <Metric label="At risk" value={atRisk} delta={atRisk ? `${atRisk} flagged` : "none"} good={atRisk === 0} hint="Attendance under 45%" />
        <Metric label="Avg attendance" value={`${avgAtt}%`} delta="+3 pts" hint="Across your roster" />
      </div>
    );
  }
  if (me.role === "founder") {
    const mtd = october.booked;
    const pipe = hq.leads.filter(open).reduce((a, l) => a + l.value, 0);
    const inFlight = clientBuilds.filter((b) => b.stage !== "Live");
    const collected = clientBuilds.reduce((a, b) => a + b.paid, 0);
    const target = me.target ?? 1;
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
        <div className="desk-card px-4 py-3.5 sm:col-span-2 xl:col-span-1">
          <div className="flex items-baseline justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-d-mute">Company revenue, October</p>
            <span className="font-mono text-[11.5px] font-semibold text-d-ok">+18% vs Sep</span>
          </div>
          <p className="mt-1.5 flex items-baseline gap-2">
            <span className="tnum font-serif text-[30px] font-medium leading-none">{rupees(mtd)}</span>
            <span className="font-mono text-[12px] text-d-mute">/ {rupees(target)}</span>
          </p>
          <Sparkline data={revenueDaily.slice(-DAY_OF_MONTH)} height={34} tone="accent" className="mt-2" />
        </div>
        <Metric label="Open pipeline" value={rupees(pipe)} delta="+₹6.4 L" hint={`${hq.leads.filter(open).length} leads across 5 advisors`} />
        <Metric label="Batch 14 seats" value="1,248" delta="+31%" hint="61% show-up · 312 stayed for Q&A" />
        <Metric label="Builds in flight" value={inFlight.length} hint={`${inFlight.filter((b) => b.health !== "On track").length} need attention`} />
        <Metric label="Build cash collected" value={rupees(collected)} hint={`of ${rupees(clientBuilds.reduce((a, b) => a + b.value, 0))} contracted`} />
      </div>
    );
  }
  const mine = hq.tasks.filter((t) => t.owner === me.id);
  const done = mine.filter((t) => t.status === "Done").length;
  const extra: Record<string, { label: string; value: string; delta?: string; good?: boolean; hint: string }[]> = {
    meera: [
      { label: "CPL today", value: "₹38", delta: "-₹6", good: true, hint: "Owner-story Reel" },
      { label: "Ad spend today", value: "₹41.8k", hint: "of ₹45k cap" },
      { label: "Workshop seats", value: "212", delta: "+14%", hint: "Batch 15 so far" },
    ],
    sahil: [
      { label: "Collected MTD", value: "₹38.6 L", delta: "+9%", hint: "Razorpay + bank" },
      { label: "Receivables", value: "₹14.2 L", delta: "₹2.1 L late", good: false, hint: "6 invoices" },
      { label: "Unmatched", value: "4", hint: "Settlements to reconcile" },
    ],
  };
  const rows = extra[me.id] ?? [
    { label: "Advisors in hiring", value: "7", delta: "+3", hint: "3 interviews this week" },
    { label: "Zoom seats used", value: "92%", delta: "near cap", good: false, hint: "Batch 14 peak" },
    { label: "Vendors to renew", value: "3", hint: "Interakt, Zoom, Razorpay" },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <Metric label="Deliverables this month" value={`${done + 11}/${me.target ?? 20}`} hint="Closed tasks vs target" />
      <Metric label="Open tasks" value={mine.length - done} delta={`${mine.filter((t) => t.dueIn < 0 && t.status !== "Done").length} late`} good={false} hint="In Task Manager" />
      {rows.map((r) => (
        <Metric key={r.label} label={r.label} value={r.value} delta={r.delta} good={r.good} hint={r.hint} />
      ))}
    </div>
  );
}

/* ---------------- Role panels ---------------- */

function CallQueue({ me }: { me: Person }) {
  const hq = useHQ();
  const queue = hq.leads
    .filter((l) => l.owner === me.id && l.stage !== "Won" && l.stage !== "Lost")
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  return (
    <Panel
      title="My call queue"
      sub="Top 5 by AI score, with why each one is up"
      icon={Phone}
      action={
        <Link href={hqHref("crm")} className="inline-flex items-center gap-1 text-[12.5px] font-medium text-d-accent hover:underline">
          Open dialler <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
      bodyClassName="px-2 pb-2 pt-1"
    >
      <ul className="divide-y divide-d-line">
        {queue.map((l, i) => (
          <li key={l.id} className="flex items-center gap-3 px-3 py-3">
            <span className="w-4 font-mono text-[11px] text-d-mute">{i + 1}</span>
            <div
              className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-[10px] border font-mono"
              style={{ borderColor: `color-mix(in oklab, ${l.score >= 80 ? "var(--d-ok)" : "var(--d-warn)"} 40%, var(--d-line))` }}
              title="AI qualification score"
            >
              <span className="text-[14px] font-semibold leading-none">{l.score}</span>
              <span className="text-[8.5px] uppercase tracking-wider text-d-mute">score</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 truncate text-[13.5px] font-medium">
                {l.name}
                <span className="font-normal text-d-mute">· {l.company}, {l.city}</span>
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-d-mute">
                <Sparkles className="h-3 w-3 shrink-0 text-[var(--d-gold)]" />
                {leadReason(l)}
              </p>
            </div>
            <div className="hidden shrink-0 text-right md:block">
              <p className="tnum font-mono text-[12.5px] font-medium">{rupees(l.value)}</p>
              <p className="text-[11px] text-d-mute">{programById[l.interest].short}</p>
            </div>
            <span className="hidden w-[78px] shrink-0 text-right lg:block">
              {l.followUpIn < 0 ? <Pill tone="late">{-l.followUpIn}h late</Pill> : <Pill tone="neutral">{l.stage}</Pill>}
            </span>
            <Link
              href={`/hq/crm?lead=${l.id}`}
              onClick={() => hq.log(`started a call with ${l.name}, ${l.company}`, "info")}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[10px] bg-d-accent px-3 text-[12.5px] font-medium text-d-accent-ink hover:brightness-110"
            >
              <Phone className="h-3.5 w-3.5" /> Call
            </Link>
          </li>
        ))}
        {queue.length === 0 && <li className="px-3 py-8 text-center text-[13px] text-d-mute">Queue is clear. The qualifier will route new leads here.</li>}
      </ul>
    </Panel>
  );
}

function MyBuilds({ me }: { me: Person }) {
  const builds = clientBuilds.filter((b) => (me.id === "neha" ? true : b.lead === me.id) && b.stage !== "Live").sort((a, b) => a.goLiveIn - b.goLiveIn);
  const coached = students.filter((s) => s.coach === me.id && s.status === "At risk").slice(0, 4);
  return (
    <Panel
      title={me.id === "priya" ? "My students at risk" : "My builds"}
      sub={me.id === "priya" ? "Lowest attendance first" : "Sorted by go-live date"}
      action={
        <Link href={hqHref(me.id === "priya" ? "students" : "builds")} className="inline-flex items-center gap-1 text-[12.5px] font-medium text-d-accent hover:underline">
          Open <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      {me.id === "priya" ? (
        <ul className="divide-y divide-d-line">
          {coached.map((s) => (
            <li key={s.id} className="flex items-center gap-3 py-2.5">
              <PersonAvatar name={s.name} size={30} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium">{s.name} <span className="font-normal text-d-mute">· {s.business}</span></p>
                <p className="text-[12px] text-d-mute">{programById[s.program].short} · {s.cohort}</p>
              </div>
              <div className="w-28">
                <Meter value={s.attendance} tone="late" />
                <p className="mt-1 text-right font-mono text-[11px] text-d-mute">{s.attendance}% attended</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="space-y-3">
          {builds.map((b) => (
            <li key={b.id} className="grid grid-cols-[minmax(0,1fr)_120px_70px] items-center gap-4">
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-medium">{b.client}</p>
                <p className="truncate text-[12px] text-d-mute">{b.stage} · {b.modules.join(", ")}</p>
              </div>
              <div>
                <Meter value={b.progress} tone={b.health === "Blocked" ? "late" : b.health === "At risk" ? "warn" : "ok"} />
                <p className="mt-1 font-mono text-[11px] text-d-mute">{b.progress}% · live in {b.goLiveIn}d</p>
              </div>
              <span className="text-right">
                <Pill tone={b.health === "Blocked" ? "late" : b.health === "At risk" ? "warn" : "ok"}>{b.health}</Pill>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function TeamBoard() {
  const hq = useHQ();
  const sales = team.filter((p) => p.role === "sales");
  const data = sales.map((p) => {
    const won = hq.leads.filter((l) => l.owner === p.id && l.stage === "Won").reduce((a, l) => a + l.value, 0);
    const v = (bookedBase[p.id] ?? 0) + won;
    const pct = Math.round((v / (p.target ?? 1)) * 100);
    return { label: p.first, sub: `${pct}% of ${rupees(p.target ?? 0)}`, value: v, tone: pct >= 65 ? ("ok" as const) : pct >= 45 ? ("warn" as const) : ("late" as const) };
  });
  const decisions = [
    { id: "d1", title: "Discount request: Rajesh Agarwal, Systems", sub: "Rohan asks 12% off for upfront payment", amount: "₹1.32 L" },
    { id: "d2", title: "Ad budget increase to ₹45k/day", sub: "Meera · owner-story Reel at ₹38 CPL", amount: "+₹8k/day" },
    { id: "d3", title: "Refund: Batch 13 student (medical)", sub: "Sahil · Launchpad, 2 sessions attended", amount: "₹24,999" },
  ];
  const [decided, setDecided] = React.useState<Record<string, "ok" | "no">>({});
  return (
    <Panel title="Revenue by advisor" sub="Booked this month against each target" icon={ArrowUpRight} action={<Link href={hqHref("revenue")} className="text-[12.5px] font-medium text-d-accent hover:underline">Revenue Center</Link>}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <HBars data={data} format={rupees} />
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-d-mute">Waiting on you</p>
          <ul className="space-y-2">
            {decisions.map((d) => (
              <li key={d.id} className={cn("rounded-[12px] border border-d-line p-3", decided[d.id] && "opacity-55")}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium leading-snug">{d.title}</p>
                    <p className="text-[11.5px] text-d-mute">{d.sub}</p>
                  </div>
                  <span className="tnum shrink-0 font-mono text-[12px]">{d.amount}</span>
                </div>
                <div className="mt-2 flex gap-1.5">
                  {decided[d.id] ? (
                    <Pill tone={decided[d.id] === "ok" ? "ok" : "late"}>{decided[d.id] === "ok" ? "Approved" : "Declined"}</Pill>
                  ) : (
                    <>
                      <Btn
                        size="sm"
                        variant="solid"
                        onClick={() => {
                          setDecided((c) => ({ ...c, [d.id]: "ok" }));
                          hq.log(`approved ${d.title.toLowerCase()}`, "ok");
                          hq.notify({ kind: "system", title: `Approved: ${d.title}`, body: d.sub }, { toast: false });
                          toast.success("Approved", { description: d.title });
                        }}
                      >
                        Approve
                      </Btn>
                      <Btn
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setDecided((c) => ({ ...c, [d.id]: "no" }));
                          hq.log(`declined ${d.title.toLowerCase()}`, "warn");
                          toast("Declined", { description: d.title });
                        }}
                      >
                        Decline
                      </Btn>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  );
}

function OpsDesk({ me }: { me: Person }) {
  const hq = useHQ();
  const items: Record<string, { id: string; label: string; sub: string }[]> = {
    meera: [
      { id: "m1", label: "Pause ad set 'Lookalike 3% · Pune'", sub: "CPL ₹94 over 48h" },
      { id: "m2", label: "Duplicate owner-story Reel into Batch 15 campaign", sub: "Best CPL this quarter" },
      { id: "m3", label: "Upload 3 testimonial cuts from Batch 12", sub: "Priya collected them" },
    ],
    sahil: [
      { id: "s1", label: "File GSTR-3B for September", sub: "Overdue 2 days" },
      { id: "s2", label: "Chase Skyline Realty milestone 2", sub: "₹78,000 · 6 days late" },
      { id: "s3", label: "Match 4 Razorpay settlements", sub: "₹1.9 L unmatched" },
    ],
  };
  const list = items[me.id] ?? [
    { id: "a1", label: "Confirm 3 advisor interviews", sub: "Hiring agent scheduled them" },
    { id: "a2", label: "Book 3,000-seat Zoom licence", sub: "Before Batch 15 opens" },
    { id: "a3", label: "Renew Interakt WhatsApp plan", sub: "Expires 28 Oct" },
  ];
  const [done, setDone] = React.useState<string[]>([]);
  return (
    <Panel title="Desk checklist" sub="Prepared by the operator from overnight runs" action={<AIMark />}>
      <ul className="space-y-1">
        {list.map((it) => {
          const on = done.includes(it.id);
          return (
            <li key={it.id}>
              <button
                type="button"
                onClick={() => {
                  setDone((c) => (on ? c.filter((x) => x !== it.id) : [...c, it.id]));
                  if (!on) {
                    hq.log(`checked off "${it.label}"`, "ok");
                    toast.success(it.label);
                  }
                }}
                className="flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left hover:bg-d-sunk"
              >
                <span className={cn("mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border", on ? "border-d-accent bg-d-accent text-d-accent-ink" : "border-d-line")}>{on && <Check className="h-3 w-3" strokeWidth={3} />}</span>
                <span>
                  <span className={cn("block text-[13.5px]", on && "text-d-mute line-through")}>{it.label}</span>
                  <span className="block text-[12px] text-d-mute">{it.sub}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

/* ---------------- Tasks ---------------- */

const prioTone = { P0: "late", P1: "warn", P2: "info", P3: "neutral" } as const;

function MyTasks({ me, tasks }: { me: Person; tasks: Task[] }) {
  const hq = useHQ();
  const [draft, setDraft] = React.useState("");
  const [showDone, setShowDone] = React.useState(false);
  const sorted = [...tasks].sort((a, b) => Number(a.status === "Done") - Number(b.status === "Done") || a.dueIn - b.dueIn || a.priority.localeCompare(b.priority));
  const visible = showDone ? sorted : sorted.filter((t) => t.status !== "Done");
  const doneCount = tasks.filter((t) => t.status === "Done").length;

  const toggle = (t: Task) => {
    const next = t.status === "Done" ? "Todo" : "Done";
    hq.updateTask(t.id, { status: next });
    if (next === "Done") {
      hq.log(`completed "${t.title}"`, "ok");
      toast.success("Task done", { description: t.title, action: { label: "Undo", onClick: () => hq.updateTask(t.id, { status: t.status }) } });
    }
  };
  const add = () => {
    const title = draft.trim();
    if (!title) return;
    const p: Task["priority"] = /urgent|asap|today|!/i.test(title) ? "P0" : "P2";
    const area: Task["area"] = me.role === "sales" ? "Sales" : me.role === "delivery" ? "Delivery" : me.id === "meera" ? "Marketing" : me.id === "sahil" ? "Finance" : "Ops";
    hq.addTask({ title: title.replace(/!+$/, ""), owner: me.id, priority: p, area, status: "Todo", dueIn: 0, due: "Today" });
    hq.log(`added a task: ${title}`, "info");
    toast.success("Added to My tasks", { description: `${p} · due today · also in Task Manager` });
    setDraft("");
  };

  return (
    <Panel
      title="My tasks"
      sub={`${tasks.length - doneCount} open · ${doneCount} done`}
      action={
        <>
          <Btn size="sm" variant="ghost" onClick={() => setShowDone((s) => !s)}>
            {showDone ? "Hide done" : "Show done"}
          </Btn>
          <Link href={hqHref("tasks")} className="text-[12.5px] font-medium text-d-accent hover:underline">
            Task Manager
          </Link>
        </>
      }
      bodyClassName="px-3 pb-3 pt-2"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
        className="mx-2 mb-2 flex items-center gap-2 rounded-[12px] border border-dashed border-d-line px-3 focus-within:border-d-accent focus-within:border-solid"
      >
        <Plus className="h-4 w-4 shrink-0 text-d-mute" />
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a task for today… (end with ! for P0)" className="h-10 min-w-0 flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-d-mute" />
        {draft && (
          <span className="inline-flex items-center gap-1 font-mono text-[10.5px] text-d-mute">
            <CornerDownLeft className="h-3 w-3" /> add
          </span>
        )}
      </form>
      <ul>
        {visible.map((t) => {
          const done = t.status === "Done";
          return (
            <li key={t.id} className="group flex items-center gap-3 rounded-[10px] px-2 py-2 hover:bg-d-sunk/70">
              <button type="button" onClick={() => toggle(t)} aria-label={done ? "Mark not done" : "Mark done"} className={cn("flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors", done ? "border-d-accent bg-d-accent text-d-accent-ink" : "border-d-line bg-d-panel hover:border-d-accent")}>
                {done && <Check className="h-3 w-3" strokeWidth={3} />}
              </button>
              <span className={cn("min-w-0 flex-1 truncate text-[13.5px]", done && "text-d-mute line-through")}>{t.title}</span>
              {t.aiDrafted && <AIMark label="AI" />}
              {t.subtasks && (
                <span className="hidden font-mono text-[11px] text-d-mute sm:inline">
                  {t.subtasks.filter((s) => s.done).length}/{t.subtasks.length}
                </span>
              )}
              <Pill tone={prioTone[t.priority]} mono>
                {t.priority}
              </Pill>
              <span className={cn("hidden w-[86px] shrink-0 text-right font-mono text-[11.5px] sm:block", t.dueIn < 0 && !done ? "text-d-late" : "text-d-mute")}>
                <Clock className="mr-1 inline h-3 w-3" />
                {t.due}
              </span>
            </li>
          );
        })}
        {visible.length === 0 && <li className="px-2 py-6 text-center text-[13px] text-d-mute">Nothing open. Add one above or take a suggestion from the brief.</li>}
      </ul>
    </Panel>
  );
}

/* ---------------- Overnight agents ---------------- */

function Overnight({ me }: { me: Person }) {
  const hq = useHQ();
  const runs = overnightByRole[me.role];
  const [seen, setSeen] = React.useState<string[]>([]);
  return (
    <Panel title="What the agents did overnight" sub={`${runs.length} runs between 1 and 8 AM · ${hq.activity.filter((a) => a.who === "agent").length} more today`} action={<AIMark label="Agents" />} bodyClassName="pt-2">
      <ol className="relative space-y-1 before:absolute before:bottom-4 before:left-[13px] before:top-4 before:w-px before:bg-d-line">
        {runs.map((r) => (
          <li key={r.id} className={cn("relative flex gap-3 rounded-[12px] py-2.5 pr-2", seen.includes(r.id) && "opacity-60")}>
            <span className="relative z-[1] mt-0.5">
              <PersonAvatar id="agent" size={27} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-baseline gap-x-2 text-[12.5px]">
                <span className="font-semibold">{r.agent}</span>
                <span className="font-mono text-[11px] text-d-mute">{r.at}</span>
              </p>
              <p className="mt-0.5 text-[13px] leading-snug text-d-ink/85">{r.text}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <Pill tone={r.tone}>{r.impact}</Pill>
                <Link href={r.href} onClick={() => setSeen((c) => [...c, r.id])} className="inline-flex items-center gap-0.5 text-[12px] font-medium text-d-accent hover:underline">
                  {r.cta} <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex flex-wrap gap-2 border-t border-d-line pt-3">
        <Btn size="sm" variant="soft" icon={Wand2} onClick={() => hq.openAsk("Summarise what the agents did overnight and what needs a human")}>
          What needs a human?
        </Btn>
        <Btn
          size="sm"
          variant="ghost"
          onClick={() => {
            setSeen(runs.map((r) => r.id));
            toast("Marked all overnight runs as reviewed");
            hq.log("reviewed overnight agent runs", "info");
          }}
        >
          Mark reviewed
        </Btn>
      </div>
    </Panel>
  );
}

/* ---------------- Quick access ---------------- */

const orderByRole: Record<Person["role"], string[]> = {
  founder: ["revenue", "builds", "accountability", "sales-reports", "agents", "roas", "tasks", "announcements", "followups", "students", "history", "library"],
  sales: ["crm", "followups", "qualifier", "sales-reports", "daily", "revenue", "tasks", "library", "rewards", "accountability", "announcements", "notifications"],
  delivery: ["builds", "students", "readiness", "tasks", "daily", "library", "agents", "accountability", "announcements", "history", "rewards", "notifications"],
  ops: ["tasks", "daily", "roas", "revenue", "rewards", "history", "agents", "accountability", "announcements", "library", "students", "notifications"],
};

function QuickAccess({ me }: { me: Person }) {
  const hq = useHQ();
  const open = hq.leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost");
  const mtd = revenueDaily.slice(-DAY_OF_MONTH).reduce((a, b) => a + b, 0);
  const counts: Record<string, { v: string; hot?: boolean }> = {
    crm: { v: `${(me.role === "sales" ? open.filter((l) => l.owner === me.id) : open).length} in queue` },
    followups: { v: `${open.filter((l) => l.followUpIn < 0).length} overdue`, hot: true },
    qualifier: { v: `${hq.leads.filter((l) => l.stage === "New").length} to score` },
    "sales-reports": { v: "4 of 5 filed" },
    roas: { v: "3.8x blended" },
    revenue: { v: `${rupees(mtd)} MTD` },
    builds: { v: `${clientBuilds.filter((b) => b.stage !== "Live").length} in flight` },
    students: { v: `${students.length} on roster` },
    readiness: { v: `${students.filter((s) => !Object.values(s.access).every(Boolean)).length} gaps`, hot: true },
    tasks: { v: `${hq.tasks.filter((t) => t.owner === me.id && t.status !== "Done").length} mine open` },
    daily: { v: "Due 7 PM" },
    history: { v: "214 reports" },
    rewards: { v: "1,240 pts" },
    agents: { v: "6 running" },
    library: { v: "86 resources" },
    accountability: { v: "31 commitments" },
    announcements: { v: `${hq.announcements.filter((a) => !a.acks.includes(me.id) && a.by !== me.id).length} to read` },
    notifications: { v: `${hq.notifications.filter((n) => !n.read).length} unread`, hot: true },
  };
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {orderByRole[me.role].map((id) => {
        const m = hqModuleById[id];
        if (!m) return null;
        const Icon = m.icon;
        const c = counts[id];
        return (
          <Link key={id} href={hqHref(id)} className="desk-card group flex min-w-0 flex-col gap-3 p-3.5 transition-all hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--d-accent)_30%,var(--d-line))]">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-d-sunk text-d-ink/80 transition-colors group-hover:bg-d-soft group-hover:text-d-accent">
                <Icon className="h-4 w-4" strokeWidth={1.8} />
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 text-d-mute opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-medium">{m.label}</p>
              <p className={cn("mt-0.5 truncate font-mono text-[11.5px]", c?.hot ? "text-d-late" : "text-d-mute")}>{c?.v}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
