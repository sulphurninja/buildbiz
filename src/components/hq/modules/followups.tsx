"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "cn";
import { AlarmClock, CalendarClock, Check, ClipboardList, Hourglass, MessageCircle, PhoneCall, Send, Sparkles, Trophy, X } from "lucide-react";
import { AgentNote, AIMark, Board, Btn, inputClass, Metric, Modal, PageHeader, PersonAvatar, Pill, rupees, SearchBox, SectionLabel, Sheet } from "../kit";
import { useHQ } from "../store";
import { personById, programById, programs, salesTeam } from "../data";
import type { Lead, LeadStage, ProgramId } from "../types";
import type { Tone } from "../../desk/types";

/* ============================================================
   Follow-up Board: every lead by stage, with what is overdue.
   ============================================================ */

const STAGES: { id: LeadStage; tone: Tone; p: number }[] = [
  { id: "New", tone: "info", p: 0.05 },
  { id: "Contacted", tone: "neutral", p: 0.1 },
  { id: "Qualified", tone: "accent", p: 0.2 },
  { id: "Call booked", tone: "warn", p: 0.35 },
  { id: "Proposal", tone: "warn", p: 0.55 },
  { id: "Won", tone: "ok", p: 1 },
  { id: "Lost", tone: "late", p: 0 },
];
const isOpen = (l: Lead) => l.stage !== "Won" && l.stage !== "Lost";
const idNum = (id: string) => Number(id.replace(/\D/g, "")) || 0;
const first = (n: string) => n.split(" ")[0];
/** Days the lead has sat in its current stage (seeded, stable). */
const daysInStage = (l: Lead) => (l.stage === "Proposal" ? [7, 9, 3, 12, 6, 4][idNum(l.id) % 6] : ((idNum(l.id) * 5) % 6) + 1);

function clock(sec: number) {
  const a = Math.abs(Math.round(sec));
  const d = Math.floor(a / 86400);
  const h = Math.floor((a % 86400) / 3600);
  const m = Math.floor((a % 3600) / 60);
  const s = a % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function nudge(l: Lead) {
  const fn = first(l.name);
  const by = personById[l.owner]?.first ?? "BuildBiz";
  const prog = programById[l.interest];
  const emi = rupees(Math.round(prog.price / 6 / 100) * 100);
  switch (l.stage) {
    case "New":
      return `Namaste ${fn} ji, ${by} from BuildBiz AI. Aapne ${l.company} ke liye enquiry ki thi. Kya aaj shaam 10 minute baat ho sakti hai? I'll keep it short 🙏`;
    case "Contacted":
      return `Namaste ${fn} ji, ${by} here from BuildBiz AI. Workshop ke baad aapka action plan discuss karna tha. Aaj 6 baje ya kal 11 baje, which is better?`;
    case "Qualified":
      return `Namaste ${fn} ji, ${prog.short} ka plan ${l.company} ke liye ready hai, focusing on "${l.pain.charAt(0).toLowerCase() + l.pain.slice(1)}". 20-minute call kal fix karein?`;
    case "Call booked":
      return `Namaste ${fn} ji, quick reminder about our strategy call. Partner bhi join kar sakein toh best rahega. Shall I send the Zoom link here?`;
    case "Proposal":
      return `Namaste ${fn} ji, proposal pe koi sawaal ho toh batayein. ${prog.short} 6 no-cost EMIs (${emi}/month) mein bhi available hai, aur GST invoice ${l.company} ke naam pe milega. November cohort ki seat Friday tak hold hai.`;
    default:
      return `Namaste ${fn} ji, ${by} from BuildBiz AI. Just checking in.`;
  }
}

function nextStep(l: Lead) {
  const prog = programById[l.interest];
  if (l.stage === "Proposal" && daysInStage(l) > 10) return { text: `${daysInStage(l)} days silent. Offer a 15-minute call with Dr. Amit and a Friday deadline on the November seat.`, task: `Founder call + Friday deadline: ${l.name}` };
  if (l.tags.includes("EMI ask")) return { text: `Send the 6-EMI plan (${rupees(Math.round(prog.price / 6 / 100) * 100)}/month) and a payment link; they asked about EMI.`, task: `Send EMI plan + payment link to ${l.name}` };
  if (!l.tags.includes("Decision maker")) return { text: "Decision maker never joined. Book a 3-way call with the partner this week.", task: `Book 3-way call with ${l.name}'s partner` };
  if (l.value >= 240000) return { text: `High-ticket (${rupees(l.value)}). Offer a 15-minute founder call with Dr. Amit.`, task: `Founder call: Dr. Amit with ${l.name}` };
  return { text: "Share the Batch 11 case study and ask for a yes/no by Friday.", task: `Send case study + Friday deadline to ${l.name}` };
}

export default function FollowupBoard() {
  const hq = useHQ();
  const { leads, me } = hq;
  const [ownerO, setOwnerO] = React.useState<string | null>(null);
  const owner = ownerO ?? (me.role === "sales" ? me.id : "All");
  const [overdueOnly, setOverdueOnly] = React.useState(false);
  const [prog, setProg] = React.useState<"All" | ProgramId>("All");
  const [q, setQ] = React.useState("");
  const [sheetId, setSheetId] = React.useState<string | null>(null);
  const [edit, setEdit] = React.useState<{ id: string; text: string } | null>(null);
  const [sent, setSent] = React.useState<Record<string, boolean>>({});
  const [tasked, setTasked] = React.useState<Record<string, boolean>>({});
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    const start = Date.now();
    const t = window.setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => window.clearInterval(t);
  }, []);
  const left = (l: Lead) => l.followUpIn * 3600 - elapsed;

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    return leads
      .filter((l) => owner === "All" || l.owner === owner)
      .filter((l) => prog === "All" || l.interest === prog)
      .filter((l) => !overdueOnly || (isOpen(l) && l.followUpIn < 0))
      .filter((l) => !term || `${l.name} ${l.company} ${l.city} ${l.id}`.toLowerCase().includes(term))
      .sort((a, b) => a.followUpIn - b.followUpIn);
  }, [leads, owner, prog, overdueOnly, q]);

  const overdue = filtered.filter((l) => isOpen(l) && l.followUpIn < 0 && !sent[l.id]).sort((a, b) => a.followUpIn - b.followUpIn);
  const stuck = filtered.filter((l) => l.stage === "Proposal" && daysInStage(l) > 5).sort((a, b) => daysInStage(b) - daysInStage(a));
  const open = filtered.filter(isOpen);
  const pipeline = open.reduce((a, l) => a + l.value, 0);
  const weighted = open.reduce((a, l) => a + l.value * (STAGES.find((s) => s.id === l.stage)?.p ?? 0), 0);
  const won = filtered.filter((l) => l.stage === "Won");
  const sheetLead = leads.find((l) => l.id === sheetId) ?? null;

  function move(id: string, stage: LeadStage) {
    const l = leads.find((x) => x.id === id);
    if (!l || l.stage === stage) return;
    hq.updateLead(id, { stage, followUpIn: stage === "Won" || stage === "Lost" ? 0 : Math.max(l.followUpIn, stage === "Proposal" ? 48 : 24) });
    hq.log(`moved ${l.name} (${l.company}) ${l.stage} → ${stage}`, stage === "Won" ? "ok" : stage === "Lost" ? "late" : "info");
    if (stage === "Won") hq.notify({ kind: "payment", title: `Won: ${l.name}`, body: `${l.company} · ${programById[l.interest].short} · ${rupees(l.value)}`, href: "/hq/revenue" });
  }
  function sendNudge(l: Lead, text?: string, quiet = false) {
    hq.updateLead(l.id, (x) => ({ followUpIn: 24, tags: x.tags.includes("Nudged") ? x.tags : [...x.tags, "Nudged"] }));
    setSent((s) => ({ ...s, [l.id]: true }));
    if (!quiet) {
      hq.log(`sent a WhatsApp nudge to ${l.name}`, "info");
      hq.notify({ kind: "lead", title: `Nudge sent to ${l.name}`, body: `${(text ?? nudge(l)).slice(0, 80)}… · next follow-up in 24h` });
    }
  }
  function nudgeAll() {
    overdue.forEach((l) => sendNudge(l, undefined, true));
    hq.log(`sent ${overdue.length} AI-drafted WhatsApp nudges to overdue leads`, "accent");
    hq.notify({ kind: "agent", title: `${overdue.length} nudges sent`, body: "Every overdue follow-up got a stage-aware WhatsApp; follow-ups moved to tomorrow" });
  }
  function taskFor(l: Lead) {
    const s = nextStep(l);
    hq.addTask({ title: s.task, owner: l.owner, status: "Todo", priority: daysInStage(l) > 8 ? "P0" : "P1", due: "Today", dueIn: 0, area: "Sales", linked: l.id, aiDrafted: true });
    setTasked((t) => ({ ...t, [l.id]: true }));
  }
  function tasksAll() {
    const todo = stuck.filter((l) => !tasked[l.id]);
    todo.forEach(taskFor);
    hq.notify({ kind: "agent", title: `${todo.length} stuck-deal tasks created`, body: todo.map((l) => `${first(l.name)} → ${personById[l.owner]?.first}`).join(", "), href: "/hq/tasks" });
    hq.log(`created ${todo.length} next-step tasks for deals stuck in Proposal`, "accent");
  }

  const columns = STAGES.map((s) => {
    const list = filtered.filter((l) => l.stage === s.id);
    const v = list.reduce((a, l) => a + l.value, 0);
    return { id: s.id, label: s.id, tone: s.tone, hint: `${rupees(v)}${s.p > 0 && s.p < 1 ? ` · ${rupees(v * s.p)} weighted` : ""}` };
  });

  return (
    <div>
      <PageHeader
        kicker="Revenue"
        title="Follow-up Board"
        sub="Every lead by stage with a live follow-up clock. Drag a card to move it; overdue leads get a WhatsApp nudge the AI has already written."
        actions={
          <>
            <Btn icon={Sparkles} onClick={() => hq.openAsk("Which deals are most likely to close this week?")}>
              Ask copilot
            </Btn>
            <Btn variant="solid" icon={Send} disabled={overdue.length === 0} onClick={nudgeAll}>
              Nudge all overdue ({overdue.length})
            </Btn>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Metric label="Open pipeline" value={rupees(pipeline)} hint={`${open.length} open leads`} />
        <Metric label="Weighted forecast" value={rupees(weighted)} hint="by stage probability" />
        <Metric label="Overdue" value={overdue.length} hint="follow-ups past due" onClick={() => setOverdueOnly((v) => !v)} className={overdueOnly ? "ring-2 ring-d-late/40" : undefined} />
        <Metric label="Stuck in proposal" value={stuck.length} hint="more than 5 days" />
        <Metric label="Won · October" value={rupees(won.reduce((a, l) => a + l.value, 0))} hint={`${won.length} deals`} />
      </div>

      {/* filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-[10px] border border-d-line bg-d-panel p-1">
          {[{ id: "All", label: "All" }, ...salesTeam.map((p) => ({ id: p.id, label: p.first }))].map((o) => (
            <button key={o.id} type="button" onClick={() => setOwnerO(o.id)} className={cn("inline-flex h-7 items-center gap-1.5 rounded-[7px] px-2 text-[12.5px] font-medium", owner === o.id ? "bg-d-accent text-d-accent-ink" : "hover:bg-d-sunk")}>
              {o.id !== "All" && <PersonAvatar id={o.id} size={18} />}
              {o.label}
            </button>
          ))}
        </div>
        <select aria-label="Program" value={prog} onChange={(e) => setProg(e.target.value as "All" | ProgramId)} className={cn(inputClass, "h-9 w-auto")}>
          <option value="All">All programs</option>
          {programs
            .filter((p) => p.id !== "workshop")
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.short}
              </option>
            ))}
        </select>
        <button type="button" onClick={() => setOverdueOnly((v) => !v)} className={cn("inline-flex h-9 items-center gap-1.5 rounded-[10px] border px-3 text-[13px] font-medium", overdueOnly ? "border-d-late bg-[color-mix(in_oklab,var(--d-late)_10%,var(--d-panel))] text-d-late" : "border-d-line bg-d-panel hover:bg-d-sunk")}>
          <AlarmClock className="h-4 w-4" /> Overdue only
        </button>
        <SearchBox value={q} onChange={setQ} placeholder="Search name, company, city" className="ml-auto w-[260px]" />
      </div>

      {/* overdue strip */}
      {overdue.length > 0 && (
        <section className="desk-card mb-4 p-4">
          <SectionLabel action={<span className="inline-flex items-center gap-2"><AIMark label="Nudges drafted" /><Btn size="sm" variant="ghost" onClick={nudgeAll}>Send all</Btn></span>}>
            <span className="text-d-late">Overdue today · {overdue.length}</span>
          </SectionLabel>
          <div className="desk-scroll -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
            {overdue.slice(0, 12).map((l) => (
              <div key={l.id} className="desk-rise flex w-[300px] shrink-0 flex-col rounded-[12px] border border-[color-mix(in_oklab,var(--d-late)_25%,var(--d-line))] bg-d-panel p-3">
                <div className="flex items-start gap-2">
                  <PersonAvatar id={l.owner} size={22} />
                  <button type="button" onClick={() => setSheetId(l.id)} className="min-w-0 flex-1 text-left">
                    <p className="truncate text-[13px] font-semibold">{l.name}</p>
                    <p className="truncate text-[11.5px] text-d-mute">
                      {l.company} · {l.stage}
                    </p>
                  </button>
                  <span className="tnum shrink-0 font-mono text-[11px] font-semibold text-d-late">{clock(left(l))} late</span>
                </div>
                <div className="mt-2 flex-1 rounded-[8px] bg-[#e7f5df] px-2.5 py-1.5 text-[12px] leading-snug text-[#1d1714]"><p className="line-clamp-3">{nudge(l)}</p></div>
                <div className="mt-2 flex gap-1.5">
                  <Btn size="sm" variant="ghost" onClick={() => setEdit({ id: l.id, text: nudge(l) })}>
                    Edit
                  </Btn>
                  <Btn size="sm" variant="solid" icon={Send} className="ml-auto" onClick={() => sendNudge(l)}>
                    Send nudge
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* stuck deals */}
      <div className="mb-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <AgentNote
          title={stuck.length ? `${stuck.length} deals stuck in Proposal for more than 5 days · ${rupees(stuck.reduce((a, l) => a + l.value, 0))}` : "No deals stuck in Proposal"}
          action={
            stuck.length > 0 ? (
              <Btn size="sm" variant="solid" icon={ClipboardList} onClick={tasksAll} disabled={stuck.every((l) => tasked[l.id])}>
                Create tasks for all
              </Btn>
            ) : undefined
          }
        >
          {stuck.length === 0 ? (
            "Every proposal has moved in the last 5 days."
          ) : (
            <ul className="mt-2 space-y-2">
              {stuck.map((l) => {
                const s = nextStep(l);
                return (
                  <li key={l.id} className="flex flex-wrap items-start gap-x-3 gap-y-1 rounded-[10px] bg-d-panel/70 p-2.5">
                    <button type="button" onClick={() => setSheetId(l.id)} className="min-w-0 flex-1 text-left">
                      <span className="text-[13px] font-semibold">{l.name}</span>
                      <span className="text-[12px] text-d-mute">
                        {" "}
                        · {l.company} · {rupees(l.value)} · <span className="font-semibold text-d-warn">{daysInStage(l)} days</span>
                      </span>
                      <span className="mt-0.5 block text-[12.5px] leading-snug">{s.text}</span>
                    </button>
                    <Btn size="sm" variant={tasked[l.id] ? "ghost" : "outline"} icon={tasked[l.id] ? Check : ClipboardList} disabled={tasked[l.id]} onClick={() => taskFor(l)}>
                      {tasked[l.id] ? "Task created" : "Create task"}
                    </Btn>
                  </li>
                );
              })}
            </ul>
          )}
        </AgentNote>
        <section className="desk-card p-5">
          <SectionLabel>Advisor follow-up discipline</SectionLabel>
          <ul className="space-y-2.5">
            {salesTeam.map((p) => {
              const mine = leads.filter((l) => l.owner === p.id && isOpen(l));
              const od = mine.filter((l) => l.followUpIn < 0).length;
              const pct = mine.length ? Math.round(((mine.length - od) / mine.length) * 100) : 100;
              return (
                <li key={p.id}>
                  <button type="button" onClick={() => setOwnerO(owner === p.id ? "All" : p.id)} className={cn("w-full rounded-[8px] px-1 py-0.5 text-left hover:bg-d-sunk", owner === p.id && "bg-d-soft")}>
                    <div className="flex items-center gap-2 text-[12.5px]">
                      <PersonAvatar id={p.id} size={20} />
                      <span className="font-medium">{p.first}</span>
                      <span className="text-d-mute">{mine.length} open</span>
                      <span className={cn("tnum ml-auto font-mono text-[11.5px] font-semibold", pct >= 70 ? "text-d-ok" : pct >= 50 ? "text-d-warn" : "text-d-late")}>{pct}% on time</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-d-sunk">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 70 ? "var(--d-ok)" : pct >= 50 ? "var(--d-warn)" : "var(--d-late)" }} />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* board */}
      <section className="desk-card p-5">
        <Board
          columns={columns}
          items={filtered}
          itemKey={(l) => l.id}
          getColumn={(l) => l.stage}
          onMove={(id, col) => move(id, col as LeadStage)}
          minColumnWidth={210}
          renderCard={(l) => {
            const sec = left(l);
            const late = isOpen(l) && sec < 0;
            const soon = isOpen(l) && sec >= 0 && sec < 4 * 3600;
            return (
              <button type="button" onClick={() => setSheetId(l.id)} className="block w-full text-left">
                <div className="flex items-start justify-between gap-2 pr-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold leading-tight">{l.name}</p>
                    <p className="mt-0.5 truncate text-[11.5px] text-d-mute">{l.company}</p>
                  </div>
                  <span className={cn("tnum shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold", l.score >= 80 ? "bg-[color-mix(in_oklab,var(--d-ok)_12%,transparent)] text-d-ok" : "bg-d-sunk text-d-mute")}>{l.score}</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between gap-2 text-[12px]">
                  <span className="truncate text-d-mute">{programById[l.interest].short}</span>
                  <span className="tnum font-mono font-semibold">{rupees(l.value)}</span>
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-d-line pt-2">
                  <PersonAvatar id={l.owner} size={20} />
                  {l.stage === "Proposal" && daysInStage(l) > 5 && (
                    <span className="inline-flex items-center gap-0.5 text-[10.5px] font-semibold text-d-warn">
                      <Hourglass className="h-3 w-3" />
                      {daysInStage(l)}d
                    </span>
                  )}
                  {isOpen(l) ? (
                    <span className={cn("tnum inline-flex items-center gap-1 font-mono text-[11px]", late ? "font-semibold text-d-late" : soon ? "font-semibold text-d-warn" : "text-d-mute")}>
                      <CalendarClock className="h-3 w-3" />
                      {late ? `-${clock(sec)}` : clock(sec)}
                    </span>
                  ) : (
                    <span className="text-[11px] text-d-mute">{l.stage === "Won" ? "Closed won" : l.tags.find((t) => t.startsWith("DQ:")) ?? "Closed lost"}</span>
                  )}
                </div>
              </button>
            );
          }}
        />
      </section>

      {/* nudge editor */}
      <Modal open={!!edit} onOpenChange={(o) => !o && setEdit(null)} title="Edit nudge" sub={edit ? `${leads.find((l) => l.id === edit.id)?.name} · WhatsApp` : undefined} width={520}>
        {edit && (
          <div className="space-y-3">
            <AIMark label="Drafted for this stage" />
            <textarea value={edit.text} onChange={(e) => setEdit({ ...edit, text: e.target.value })} rows={5} className={cn(inputClass, "h-auto py-2.5 leading-relaxed")} />
            <div className="flex justify-end gap-2">
              <Btn variant="ghost" onClick={() => setEdit(null)}>
                Cancel
              </Btn>
              <Btn
                variant="solid"
                icon={Send}
                onClick={() => {
                  const l = leads.find((x) => x.id === edit.id);
                  if (l) sendNudge(l, edit.text);
                  setEdit(null);
                }}
              >
                Send
              </Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* lead sheet */}
      <Sheet
        open={!!sheetLead}
        onOpenChange={(o) => !o && setSheetId(null)}
        eyebrow={sheetLead ? `${sheetLead.id} · ${sheetLead.source}` : undefined}
        title={sheetLead?.name ?? ""}
        sub={sheetLead ? `${sheetLead.company} · ${sheetLead.industry} · ${sheetLead.city}` : undefined}
        width={520}
        footer={
          sheetLead && (
            <>
              <Btn variant="ghost" icon={X} className="mr-auto" onClick={() => move(sheetLead.id, "Lost")} disabled={sheetLead.stage === "Lost"}>
                Mark lost
              </Btn>
              <Link href={`/hq/crm?lead=${sheetLead.id}`} className="inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-d-line bg-d-panel px-3.5 text-[13.5px] font-medium hover:bg-d-sunk">
                <PhoneCall className="h-4 w-4" /> Call in CRM
              </Link>
              <Btn variant="solid" icon={Trophy} onClick={() => move(sheetLead.id, "Won")} disabled={sheetLead.stage === "Won"}>
                Mark won
              </Btn>
            </>
          )
        }
      >
        {sheetLead && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              {[
                { k: "Score", v: sheetLead.score },
                { k: "Value", v: rupees(sheetLead.value) },
                { k: "Follow-up", v: isOpen(sheetLead) ? (left(sheetLead) < 0 ? `-${clock(left(sheetLead))}` : clock(left(sheetLead))) : "Closed" },
              ].map((x) => (
                <div key={x.k} className="rounded-[10px] border border-d-line p-2.5">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-d-mute">{x.k}</p>
                  <p className={cn("tnum mt-0.5 font-serif text-[22px] leading-none", x.k === "Follow-up" && isOpen(sheetLead) && left(sheetLead) < 0 && "text-d-late")}>{x.v}</p>
                </div>
              ))}
            </div>
            <AgentNote title="Deal summary">
              {sheetLead.revenue}, {sheetLead.teamSize} staff, {sheetLead.attendedWorkshop ? "attended Batch 14" : "no workshop yet"}. Pain: {sheetLead.pain.toLowerCase()}.{" "}
              {sheetLead.calls.length ? `${sheetLead.calls.length} calls so far; last: "${sheetLead.calls[sheetLead.calls.length - 1].note}".` : "Not called yet."} {isOpen(sheetLead) && `Next: ${nextStep(sheetLead).text}`}
            </AgentNote>
            <div>
              <SectionLabel>Stage</SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {STAGES.map((s) => (
                  <button key={s.id} type="button" onClick={() => move(sheetLead.id, s.id)} className={cn("h-8 rounded-full border px-3 text-[12.5px] font-medium", sheetLead.stage === s.id ? "border-d-accent bg-d-accent text-d-accent-ink" : "border-d-line hover:bg-d-sunk")}>
                    {s.id}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <SectionLabel>Quick actions</SectionLabel>
              <div className="flex flex-wrap gap-2">
                <Btn size="sm" icon={MessageCircle} onClick={() => setEdit({ id: sheetLead.id, text: nudge(sheetLead) })}>
                  WhatsApp nudge
                </Btn>
                {[
                  { label: "Snooze 4h", h: 4 },
                  { label: "Tomorrow", h: 24 },
                  { label: "Next week", h: 168 },
                ].map((s) => (
                  <Btn
                    key={s.label}
                    size="sm"
                    variant="ghost"
                    icon={AlarmClock}
                    onClick={() => {
                      hq.updateLead(sheetLead.id, { followUpIn: s.h + Math.round(elapsed / 3600) });
                      hq.log(`snoozed ${sheetLead.name}'s follow-up: ${s.label.toLowerCase()}`, "info");
                    }}
                  >
                    {s.label}
                  </Btn>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sheetLead.tags.map((t) => (
                <Pill key={t}>{t}</Pill>
              ))}
              <Pill tone="neutral" mono>
                {sheetLead.phone}
              </Pill>
              <span className="inline-flex items-center gap-1.5 text-[12px] text-d-mute">
                <PersonAvatar id={sheetLead.owner} size={18} /> {personById[sheetLead.owner]?.name}
              </span>
            </div>
            <div>
              <SectionLabel>History</SectionLabel>
              {sheetLead.calls.length === 0 ? (
                <p className="rounded-[10px] border border-dashed border-d-line px-3 py-5 text-center text-[12.5px] text-d-mute">No calls logged yet.</p>
              ) : (
                <ol className="relative space-y-3 before:absolute before:bottom-1 before:left-[5px] before:top-1 before:w-px before:bg-d-line">
                  {[...sheetLead.calls].reverse().map((c, i) => (
                    <li key={`${c.at}-${i}`} className="relative pl-6">
                      <span className="absolute left-0 top-1 h-[11px] w-[11px] rounded-full border-2 border-d-panel" style={{ background: c.outcome === "Booked" || c.outcome === "Connected" ? "var(--d-ok)" : c.outcome === "Not interested" ? "var(--d-late)" : c.outcome === "Busy" ? "var(--d-warn)" : "var(--d-mute)" }} />
                      <p className="flex items-center gap-1.5 text-[12px]">
                        <span className="font-semibold">{c.outcome}</span>
                        <span className="text-d-mute">
                          · {c.minutes} min · {personById[c.by]?.first ?? c.by}
                        </span>
                        <span className="ml-auto font-mono text-[10.5px] text-d-mute">{c.at}</span>
                      </p>
                      <p className="mt-0.5 text-[12.5px] leading-snug text-d-ink/80">{c.note}</p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
