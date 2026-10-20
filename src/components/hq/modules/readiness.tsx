"use client";

import * as React from "react";
import { toast } from "sonner";
import { AlertOctagon, Check, Clock, Loader2, MessageCircle, RefreshCw, Send, ShieldCheck, Wand2, X } from "lucide-react";
import {
  AgentNote,
  AIMark,
  Btn,
  Checklist,
  Countdown,
  HBars,
  inputClass,
  Meter,
  Metric,
  PageHeader,
  Panel,
  PersonAvatar,
  PersonChip,
  Pill,
  SearchBox,
  SectionLabel,
  Segmented,
} from "../kit";
import type { Tone } from "../../desk/types";
import { useHQ } from "../store";
import { programById, students } from "../data";
import type { Student } from "../types";

type Item = keyof Student["access"];
type CellState = "granted" | "pending" | "failed" | "sending";

const ITEMS: { id: Item; label: string; short: string; via: string }[] = [
  { id: "zoom", label: "Zoom link", short: "Zoom", via: "Zoom webinar panel" },
  { id: "community", label: "Community", short: "Circle", via: "Circle invite" },
  { id: "portal", label: "Portal", short: "Portal", via: "Portal invite email" },
  { id: "blueprint", label: "Blueprint pack", short: "Blueprint", via: "Email + WhatsApp PDF" },
  { id: "whatsapp", label: "WhatsApp group", short: "WhatsApp", via: "Interakt group invite" },
];
const COHORTS = [
  { id: "Oct '26 · Batch 14", short: "Batch 14" },
  { id: "Sep '26 · Batch 13", short: "Batch 13" },
  { id: "Aug '26 · Batch 12", short: "Batch 12" },
  { id: "Jul '26 · Batch 11", short: "Batch 11" },
];
const NEXT_SESSION: Record<string, { title: string; when: string; inHours: number; host: string }> = {
  "Oct '26 · Batch 14": { title: "Implementation Clinic, live", when: "Wed 22 Oct · 7:00 PM IST", inHours: 46.2, host: "amit" },
  "Sep '26 · Batch 13": { title: "Week 6 · Hiring SOPs", when: "Wed 22 Oct · 8:00 PM IST", inHours: 47.2, host: "neha" },
  "Aug '26 · Batch 12": { title: "Demo day rehearsal", when: "Fri 24 Oct · 6:30 PM IST", inHours: 93.7, host: "vikram" },
  "Jul '26 · Batch 11": { title: "Alumni office hours", when: "Sat 25 Oct · 11:00 AM IST", inHours: 110.2, host: "priya" },
};

function hash(n: number, salt = 7) {
  let t = Math.imul(n + 1, 0x9e3779b1) ^ Math.imul(salt + 3, 0x85ebca6b);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const idx = (s: Student) => Number(s.id.slice(2)) - 10421;

function seedCells() {
  const out: Record<string, Record<Item, CellState>> = {};
  for (const s of students) {
    const row = {} as Record<Item, CellState>;
    ITEMS.forEach((it, i) => {
      row[it.id] = s.access[it.id] ? "granted" : hash(idx(s) * 7 + i, 77) > 0.62 && it.id !== "blueprint" ? "failed" : "pending";
    });
    out[s.id] = row;
  }
  return out;
}

/** Why a delivery failed, what was attempted and what the agent suggests instead. */
function failure(s: Student, item: Item) {
  const user = s.email.split("@")[0];
  const domain = s.email.split("@")[1];
  const digits = s.phone.replace(/\D/g, "").slice(2);
  switch (item) {
    case "portal":
      return { reason: "Email bounced · 550 mailbox unavailable", tried: `${user}@${domain.replace(/\.in$/, ".com")}`, fix: s.email, source: "Razorpay receipt", kind: "email" as const };
    case "community":
      return { reason: "Circle invite bounced", tried: `${user.replace(".", "")}@gmial.com`, fix: s.email, source: "workshop registration form", kind: "email" as const };
    case "whatsapp":
      return { reason: "Wrong number · not on WhatsApp", tried: `+91 ${digits.slice(0, 9)}`, fix: s.phone, source: "CRM lead record", kind: "phone" as const };
    case "zoom":
      return { reason: "Duplicate Zoom registration, link not issued", tried: s.email, fix: s.email, source: "Zoom dedupe", kind: "email" as const };
    default:
      return { reason: "Attachment blocked (over 25 MB)", tried: s.email, fix: s.email, source: "send as Drive link", kind: "email" as const };
  }
}

const CELL_TONE: Record<CellState, Tone> = { granted: "ok", pending: "warn", failed: "late", sending: "info" };

export default function AccessReadiness() {
  const hq = useHQ();
  const [cohort, setCohort] = React.useState(COHORTS[0].id);
  const [cells, setCells] = React.useState(seedCells);
  const [picked, setPicked] = React.useState<Set<string>>(new Set());
  const [view, setView] = React.useState<"all" | "notready" | "failed">("all");
  const [q, setQ] = React.useState("");
  const [fixes, setFixes] = React.useState<Record<string, string>>({});
  const [checking, setChecking] = React.useState(false);
  const timers = React.useRef<number[]>([]);

  React.useEffect(() => {
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
  }, []);

  const roster = students.filter((s) => s.cohort === cohort);
  const ready = (s: Student) => ITEMS.every((it) => cells[s.id][it.id] === "granted");
  const rows = roster.filter((s) => {
    if (q && !`${s.name} ${s.business} ${s.phone} ${s.email}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (view === "notready") return !ready(s);
    if (view === "failed") return ITEMS.some((it) => cells[s.id][it.id] === "failed");
    return true;
  });

  const pct = (list: Student[], item?: Item) => {
    const its = item ? [item] : ITEMS.map((i) => i.id);
    const total = list.length * its.length;
    const ok = list.reduce((a, s) => a + its.filter((i) => cells[s.id][i] === "granted").length, 0);
    return total ? Math.round((ok / total) * 100) : 0;
  };
  const count = (list: Student[], state: CellState, item?: Item) => list.reduce((a, s) => a + (item ? (cells[s.id][item] === state ? 1 : 0) : ITEMS.filter((i) => cells[s.id][i.id] === state).length), 0);

  /** Deliver: cells flip to "sending", then land as granted a beat later. */
  function deliver(targets: { sid: string; item: Item }[], label: string) {
    if (!targets.length) {
      toast("Nothing to send", { description: "Everyone selected already has it." });
      return;
    }
    setCells((cur) => {
      const next = { ...cur };
      targets.forEach(({ sid, item }) => {
        next[sid] = { ...next[sid], [item]: "sending" };
      });
      return next;
    });
    const t = window.setTimeout(() => {
      setCells((cur) => {
        const next = { ...cur };
        targets.forEach(({ sid, item }) => {
          if (next[sid][item] === "sending") next[sid] = { ...next[sid], [item]: "granted" };
        });
        return next;
      });
      toast.success(label, { description: `${targets.length} deliveries confirmed` });
    }, 1300);
    timers.current.push(t);
    hq.log(`${label.toLowerCase()} (${targets.length})`, "ok");
  }

  function grantItem(item: Item, includeFailed = false) {
    const targets = roster.filter((s) => cells[s.id][item] === "pending" || (includeFailed && cells[s.id][item] === "failed")).map((s) => ({ sid: s.id, item }));
    deliver(targets, `${ITEMS.find((i) => i.id === item)?.label} sent`);
  }

  function bulk(mode: "grant" | "resend") {
    const ids = [...picked];
    const targets = ids.flatMap((sid) => ITEMS.filter((it) => (mode === "grant" ? cells[sid][it.id] === "pending" : cells[sid][it.id] !== "granted")).map((it) => ({ sid, item: it.id })));
    deliver(targets, mode === "grant" ? `Granted pending access for ${ids.length} students` : `Resent to ${ids.length} students`);
    setPicked(new Set());
  }

  function recheck() {
    setChecking(true);
    const t = window.setTimeout(() => {
      setChecking(false);
      toast("Readiness re-verified", { description: `Checked Zoom, Circle, portal, Interakt and the mail log for ${roster.length} students. No silent failures.` });
    }, 1500);
    timers.current.push(t);
  }

  const failures = roster.flatMap((s) => ITEMS.filter((it) => cells[s.id][it.id] === "failed").map((it) => ({ s, item: it, f: failure(s, it.id) })));
  const blueprintPending = count(roster, "pending", "blueprint");
  const allBlueprintPending = students.reduce((a, s) => a + (cells[s.id].blueprint === "pending" ? 1 : 0), 0);
  const session = NEXT_SESSION[cohort];
  const short = COHORTS.find((c) => c.id === cohort)?.short ?? "";
  const typoFixable = failures.filter((x) => (x.f.kind === "email" && x.f.tried !== x.f.fix) || x.f.kind === "phone");

  return (
    <div>
      <PageHeader
        kicker="Delivery"
        icon={ShieldCheck}
        title="Access Readiness"
        sub="Is every student set up before they walk into the next live session? Zoom link, Circle community, learning portal, blueprint pack and the cohort WhatsApp group, verified against each system."
        actions={
          <>
            <Btn icon={MessageCircle} onClick={() => hq.openAsk(`Who in ${short} still can't join the next session, and why?`)}>
              Ask
            </Btn>
            <Btn variant="solid" icon={checking ? Loader2 : RefreshCw} onClick={recheck} disabled={checking} className={checking ? "[&_svg]:animate-spin" : ""}>
              {checking ? "Verifying…" : "Re-verify all systems"}
            </Btn>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Segmented
          value={cohort}
          onChange={(v) => {
            setCohort(v);
            setPicked(new Set());
          }}
          options={COHORTS.map((c) => ({ value: c.id, label: c.short, count: pct(students.filter((s) => s.cohort === c.id)) }))}
        />
        <span className="text-[12px] text-d-mute">% ready per cohort</span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Metric label={`${short} readiness`} value={`${pct(roster)}%`} hint={`${roster.length} students × 5 items`} />
        <Metric label="Fully set up" value={`${roster.filter(ready).length}/${roster.length}`} hint="all five items granted" />
        <Metric label="Pending" value={count(roster, "pending")} hint="queued, not yet sent" />
        <Metric label="Failed" value={failures.length} delta={failures.length ? "needs a fix" : undefined} good={false} hint="bounced or wrong contact" onClick={() => setView("failed")} />
        <div className="desk-card min-w-0 px-4 py-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-d-mute">Next live session</p>
          <div className="mt-1.5 text-[22px] leading-none [&_span]:!text-[22px]">
            <Countdown key={cohort} inHours={session.inHours} compact />
          </div>
          <p className="mt-1.5 truncate text-[12px] text-d-mute">{session.when}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <AgentNote
          title={allBlueprintPending ? `${allBlueprintPending} blueprint packs pending${blueprintPending ? `, ${blueprintPending} in ${short}` : ""}. Send now?` : "Every blueprint pack is delivered"}
          action={
            allBlueprintPending ? (
              <>
                <Btn
                  size="sm"
                  variant="solid"
                  icon={Send}
                  onClick={() =>
                    deliver(
                      students.filter((s) => cells[s.id].blueprint === "pending").map((s) => ({ sid: s.id, item: "blueprint" as Item })),
                      "Blueprint packs sent",
                    )
                  }
                >
                  Send all {allBlueprintPending}
                </Btn>
                {blueprintPending > 0 && (
                  <Btn size="sm" onClick={() => grantItem("blueprint")}>
                    Only {short}
                  </Btn>
                )}
              </>
            ) : undefined
          }
        >
          {allBlueprintPending
            ? "The 48-page Business OS blueprint goes as a Drive link on email and a PDF on WhatsApp, personalised with each student's business name. Sending now lands before tonight's 11:30 PM cut-off Amit announced."
            : "All packs confirmed opened or downloaded."}
        </AgentNote>
        <AgentNote
          title={typoFixable.length ? `I can fix ${typoFixable.length} of ${failures.length} failures automatically` : "No failures I can fix automatically"}
          action={
            typoFixable.length ? (
              <Btn
                size="sm"
                variant="solid"
                icon={Wand2}
                onClick={() => {
                  deliver(
                    typoFixable.map((x) => ({ sid: x.s.id, item: x.item.id })),
                    "Corrected contacts and resent",
                  );
                }}
              >
                Fix and resend {typoFixable.length}
              </Btn>
            ) : undefined
          }
        >
          Matched each bounced address or wrong number against the Razorpay receipt, the workshop form and the CRM lead record. Corrections are logged on the student profile.
        </AgentNote>
      </div>

      <Panel className="mt-5" title="Readiness by item" sub={`${short} · grant everything pending in one click`}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {ITEMS.map((it) => {
            const p = pct(roster, it.id);
            const pend = count(roster, "pending", it.id);
            const fail = count(roster, "failed", it.id);
            return (
              <div key={it.id} className="rounded-[12px] border border-d-line p-3.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-[13px] font-semibold">{it.label}</span>
                  <span className="tnum font-serif text-[24px] leading-none">{p}%</span>
                </div>
                <Meter className="mt-2" value={p} tone={p >= 95 ? "ok" : p >= 80 ? "warn" : "late"} />
                <p className="mt-2 text-[11.5px] text-d-mute">
                  {pend} pending · {fail} failed · via {it.via}
                </p>
                <div className="mt-2.5 flex gap-1.5">
                  <Btn size="sm" variant={pend ? "solid" : "outline"} disabled={!pend} onClick={() => grantItem(it.id)}>
                    Grant {pend || ""}
                  </Btn>
                  <Btn size="sm" disabled={!fail} onClick={() => grantItem(it.id, true)}>
                    Resend
                  </Btn>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Access matrix"
          sub="Click a pending or failed cell to send it. Select rows for bulk actions."
          action={
            <Segmented
              size="sm"
              value={view}
              onChange={setView}
              options={[
                { value: "all", label: "All", count: roster.length },
                { value: "notready", label: "Not ready", count: roster.filter((s) => !ready(s)).length },
                { value: "failed", label: "Failed", count: roster.filter((s) => ITEMS.some((it) => cells[s.id][it.id] === "failed")).length },
              ]}
            />
          }
        >
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <SearchBox value={q} onChange={setQ} placeholder={`Search ${short}`} className="w-full sm:w-64" />
            <div className="ml-auto flex items-center gap-3 text-[11.5px] text-d-mute">
              {(["granted", "pending", "failed"] as const).map((st) => (
                <span key={st} className="inline-flex items-center gap-1.5">
                  <CellIcon state={st} small /> {st[0].toUpperCase() + st.slice(1)}
                </span>
              ))}
            </div>
          </div>
          {picked.size > 0 && (
            <div className="desk-rise mb-2 flex flex-wrap items-center gap-2 rounded-xl bg-d-soft px-3 py-2 text-[12.5px] text-d-accent">
              <span className="font-medium">{picked.size} selected</span>
              <Btn size="sm" variant="solid" onClick={() => bulk("grant")}>
                Grant pending
              </Btn>
              <Btn size="sm" variant="solid" onClick={() => bulk("resend")}>
                Resend all missing
              </Btn>
              <Btn size="sm" variant="ghost" onClick={() => setPicked(new Set())}>
                Clear
              </Btn>
            </div>
          )}
          <div className="desk-scroll -mx-5 max-h-[1010px] overflow-auto px-5">
            <table className="w-full min-w-[640px] border-collapse text-[13px]">
              <thead className="sticky top-0 z-[1] bg-d-panel">
                <tr className="border-b border-d-line text-left">
                  <th className="w-8 pb-2">
                    <input
                      type="checkbox"
                      aria-label="Select all"
                      checked={rows.length > 0 && rows.every((r) => picked.has(r.id))}
                      onChange={(e) => setPicked(e.target.checked ? new Set(rows.map((r) => r.id)) : new Set())}
                      className="h-4 w-4 accent-[var(--d-accent)]"
                    />
                  </th>
                  <th className="pb-2 text-[11.5px] font-medium text-d-mute">Student</th>
                  {ITEMS.map((it) => (
                    <th key={it.id} className="pb-2 text-center text-[11.5px] font-medium text-d-mute">
                      {it.short}
                      <span className="block font-mono text-[10.5px] font-normal">{pct(rows, it.id)}%</span>
                    </th>
                  ))}
                  <th className="pb-2 text-right text-[11.5px] font-medium text-d-mute">Ready</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => {
                  const done = ITEMS.filter((it) => cells[s.id][it.id] === "granted").length;
                  return (
                    <tr key={s.id} className={`border-b border-d-line/70 last:border-0 ${picked.has(s.id) ? "bg-d-soft/50" : "hover:bg-d-sunk/50"}`}>
                      <td className="py-2">
                        <input
                          type="checkbox"
                          aria-label={`Select ${s.name}`}
                          checked={picked.has(s.id)}
                          onChange={() =>
                            setPicked((cur) => {
                              const next = new Set(cur);
                              if (next.has(s.id)) next.delete(s.id);
                              else next.add(s.id);
                              return next;
                            })
                          }
                          className="h-4 w-4 accent-[var(--d-accent)]"
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <span className="flex items-center gap-2">
                          <PersonAvatar name={s.name} size={26} />
                          <span className="min-w-0">
                            <span className="block truncate text-[13px] font-medium">{s.name}</span>
                            <span className="block truncate text-[11px] text-d-mute">
                              {s.business} · {programById[s.program].short}
                            </span>
                          </span>
                        </span>
                      </td>
                      {ITEMS.map((it) => {
                        const st = cells[s.id][it.id];
                        const f = st === "failed" ? failure(s, it.id) : null;
                        return (
                          <td key={it.id} className="py-2 text-center">
                            <button
                              type="button"
                              disabled={st === "granted" || st === "sending"}
                              title={st === "granted" ? `${it.label}: granted` : st === "pending" ? `${it.label}: pending, click to send` : st === "failed" ? `${f?.reason}. Click to resend` : "Sending…"}
                              onClick={() => deliver([{ sid: s.id, item: it.id }], `${it.label} sent to ${s.name.split(" ")[0]}`)}
                              className="inline-flex rounded-md p-1 transition-transform enabled:hover:scale-110"
                            >
                              <CellIcon state={st} />
                            </button>
                          </td>
                        );
                      })}
                      <td className="py-2 text-right">
                        <span className={`tnum font-mono text-[12px] ${done === 5 ? "text-d-ok" : "text-d-mute"}`}>{done}/5</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-d-line">
                  <td />
                  <td className="pt-2 text-[11.5px] font-medium text-d-mute">Grant column</td>
                  {ITEMS.map((it) => (
                    <td key={it.id} className="pt-2 text-center">
                      <button type="button" onClick={() => grantItem(it.id)} className="rounded-full border border-d-line px-2 py-0.5 text-[11px] hover:border-d-accent disabled:opacity-40" disabled={!count(roster, "pending", it.id)}>
                        {count(roster, "pending", it.id)} →
                      </button>
                    </td>
                  ))}
                  <td />
                </tr>
              </tfoot>
            </table>
            {rows.length === 0 && <p className="py-10 text-center text-[13px] text-d-mute">Everyone in this view is set up.</p>}
          </div>
        </Panel>

        <div className="space-y-5">
          <PreSession key={cohort} cohort={cohort} roster={roster} readyPct={pct(roster)} failures={failures.length} />
          <Panel title="Readiness by cohort" sub="All five items">
            <HBars
              max={100}
              format={(v) => `${v}%`}
              onSelect={(l) => setCohort(COHORTS.find((c) => c.short === l)?.id ?? cohort)}
              data={COHORTS.map((c) => {
                const l = students.filter((s) => s.cohort === c.id);
                const p = pct(l);
                return { label: c.short, value: p, sub: `${l.filter(ready).length}/${l.length} fully set up`, tone: (p >= 90 ? "ok" : p >= 80 ? "warn" : "late") as Tone };
              })}
            />
            <SectionLabel className="mt-5">Batch 14 workshop · 1,248 registrants</SectionLabel>
            <HBars
              max={1248}
              format={(v) => v.toLocaleString("en-IN")}
              data={[
                { label: "Zoom link delivered", value: 1231, tone: "ok" },
                { label: "Joined WhatsApp group", value: 1176, tone: "ok" },
                { label: "Opened reminder (T-1h)", value: 1042, tone: "warn" },
                { label: "Blueprint downloaded", value: 688, tone: "warn" },
              ]}
            />
          </Panel>
        </div>
      </div>

      <Panel
        className="mt-5"
        title="Failures queue"
        sub={`${failures.length} deliveries in ${short} need a corrected contact or a resend`}
        icon={AlertOctagon}
        action={
          failures.length ? (
            <Btn size="sm" icon={Send} onClick={() => deliver(failures.map((x) => ({ sid: x.s.id, item: x.item.id })), "Failed deliveries resent")}>
              Resend all {failures.length}
            </Btn>
          ) : undefined
        }
      >
        {failures.length === 0 ? (
          <p className="rounded-xl border border-dashed border-d-line px-4 py-8 text-center text-[13px] text-d-mute">No failed deliveries in {short}.</p>
        ) : (
          <ul className="grid gap-2.5 lg:grid-cols-2">
            {failures.map(({ s, item, f }) => {
              const key = `${s.id}-${item.id}`;
              const value = fixes[key] ?? f.fix;
              return (
                <li key={key} className="rounded-[12px] border border-d-line p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block truncate text-[13.5px] font-semibold">
                        {s.name} <span className="font-normal text-d-mute">· {item.label}</span>
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-d-late">
                        <X className="h-3 w-3" /> {f.reason}
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-[11.5px] text-d-mute line-through">{f.tried}</span>
                    </span>
                    <Pill tone="late">Failed</Pill>
                  </div>
                  <div className="mt-2.5 flex items-center gap-2">
                    <input value={value} onChange={(e) => setFixes((cur) => ({ ...cur, [key]: e.target.value }))} className={`${inputClass} h-8 font-mono text-[12px]`} />
                    <Btn size="sm" variant="solid" onClick={() => deliver([{ sid: s.id, item: item.id }], `Fixed and resent to ${s.name.split(" ")[0]}`)}>
                      Fix & resend
                    </Btn>
                  </div>
                  {value === f.fix && f.tried !== f.fix && (
                    <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] text-d-mute">
                      <AIMark label="Suggested" /> from the {f.source}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function CellIcon({ state, small }: { state: CellState; small?: boolean }) {
  const size = small ? "h-4 w-4" : "h-6 w-6";
  const icon = small ? "h-2.5 w-2.5" : "h-3.5 w-3.5";
  const color = `var(--d-${CELL_TONE[state]})`;
  return (
    <span className={`inline-flex ${size} items-center justify-center rounded-full`} style={{ color, background: `color-mix(in oklab, ${color} 14%, transparent)` }}>
      {state === "granted" && <Check className={icon} strokeWidth={3} />}
      {state === "pending" && <Clock className={icon} strokeWidth={2.4} />}
      {state === "failed" && <X className={icon} strokeWidth={3} />}
      {state === "sending" && <Loader2 className={`${icon} animate-spin`} strokeWidth={2.4} />}
    </span>
  );
}

function PreSession({ cohort, roster, readyPct, failures }: { cohort: string; roster: Student[]; readyPct: number; failures: number }) {
  const hq = useHQ();
  const session = NEXT_SESSION[cohort];
  const [items, setItems] = React.useState(() => [
    { id: "c1", label: "Zoom webinar scheduled, practice session on", sub: "Webinar ID 864 2210 5531", done: true },
    { id: "c2", label: "Host and panelist links sent", sub: "Amit, Neha, Priya as co-hosts", done: true },
    { id: "c3", label: "T-24h WhatsApp reminder to the cohort", sub: "Interakt template ‘session_reminder_hi’", done: true },
    { id: "c4", label: "T-1h reminder with the join link", sub: "Scheduled 1 hour before start", done: false },
    { id: "c5", label: "Slides and worksheet uploaded to the portal", sub: "Implementation workbook v3", done: false },
    { id: "c6", label: "Cloud recording + auto-upload to portal", sub: "Zoom → portal in 2 hours", done: true },
    { id: "c7", label: "Hindi Q&A moderator assigned", sub: "Priya on chat, Imran on Q&A", done: false },
    { id: "c8", label: "Every student ready", sub: `${readyPct}% now · ${failures} failures open`, done: readyPct >= 98 },
  ]);
  const left = items.filter((i) => !i.done);
  return (
    <Panel title="Pre-session checklist" sub={`${session.title} · ${session.when}`} icon={Clock}>
      <div className="mb-3 flex items-center justify-between rounded-[12px] bg-d-sunk/70 px-3.5 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-d-mute">Starts in</p>
          <div className="mt-1 [&>span]:!text-[26px]">
            <Countdown inHours={session.inHours} />
          </div>
        </div>
        <PersonChip id={session.host} sub="Host" />
      </div>
      <Checklist items={items} onToggle={(id) => setItems((cur) => cur.map((i) => (i.id === id ? { ...i, done: !i.done } : i)))} />
      {left.length > 0 && (
        <AgentNote
          className="mt-3"
          title={`${left.length} left before go time`}
          action={
            <Btn
              size="sm"
              variant="solid"
              onClick={() => {
                left.forEach((i) => hq.addTask({ title: `${session.title}: ${i.label}`, owner: i.id === "c7" ? "priya" : "aditya", status: "Todo", priority: "P1", due: "Tomorrow", dueIn: 1, area: "Delivery", aiDrafted: true }));
                toast.success(`${left.length} tasks created`, { description: `Due before ${session.when}` });
              }}
            >
              Assign the rest
            </Btn>
          }
        >
          {left.map((i) => i.label.split(",")[0]).join("; ")}. {roster.length} students in this cohort.
        </AgentNote>
      )}
    </Panel>
  );
}
