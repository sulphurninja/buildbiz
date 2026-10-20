"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "cn";
import {
  Archive,
  ArrowRight,
  Bell,
  Bot,
  Check,
  CheckCheck,
  Clock,
  GraduationCap,
  IndianRupee,
  ListChecks,
  Megaphone,
  MessageCircle,
  Moon,
  Phone,
  Settings2,
  Sparkles,
  UserRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useHQ } from "../store";
import { personById, programById } from "../data";
import type { Notification } from "../types";
import { AIMark, AgentNote, Btn, KV, Modal, PageHeader, Panel, PersonChip, Pill, SearchBox, SectionLabel, Segmented, rupees } from "../kit";

type Kind = Notification["kind"];
const KINDS: Kind[] = ["lead", "payment", "task", "agent", "student", "announcement", "system"];
const kindMeta: Record<Kind, { label: string; icon: LucideIcon; tone: "accent" | "ok" | "warn" | "info" | "neutral" | "late" }> = {
  lead: { label: "Leads", icon: UserRound, tone: "accent" },
  payment: { label: "Payments", icon: IndianRupee, tone: "ok" },
  task: { label: "Tasks", icon: ListChecks, tone: "warn" },
  agent: { label: "Agents", icon: Bot, tone: "info" },
  student: { label: "Students", icon: GraduationCap, tone: "info" },
  announcement: { label: "Announcements", icon: Megaphone, tone: "neutral" },
  system: { label: "System", icon: Wrench, tone: "neutral" },
};

/** Older inbox history, kept local so the store stays the source of truth for live alerts. */
const history: Notification[] = [
  { id: "H-01", kind: "payment", title: "₹24,999 received via UPI", body: "Ritu Malhotra, AI Business Launchpad. GPay UPI, auto-receipt sent on WhatsApp.", at: "3 h ago", read: false, href: "/hq/revenue" },
  { id: "H-02", kind: "lead", title: "Call back requested: Sunil Agarwal", body: "Om Engineering, Pune (₹25-50 Cr). “Shaam 6 ke baad call karna, partner bhi honge.”", at: "4 h ago", read: false, href: "/hq/crm" },
  { id: "H-03", kind: "agent", title: "Lead Qualifier routed 9 hot leads", body: "3 to Rohan, 3 to Sneha, 2 to Arjun, 1 to Imran. Average score 87.", at: "5 h ago", read: true, href: "/hq/qualifier" },
  { id: "H-04", kind: "task", title: "Due today: UAT sign-off with Balaji Distributors", body: "Neha · P0 · linked to build B-302.", at: "6 h ago", read: false, href: "/hq/tasks" },
  { id: "H-05", kind: "student", title: "Batch 14: 9 blueprint emails bounced", body: "Wrong addresses at sign-up. Access agent suggests sending the pack on WhatsApp instead.", at: "7 h ago", read: false, href: "/hq/readiness" },
  { id: "H-06", kind: "payment", title: "EMI 2 of 3 failed: Deepak Saxena", body: "Accelerator, ₹25,000. Razorpay retry scheduled for tomorrow 10 AM; card mandate expired.", at: "Yesterday", read: false, href: "/hq/revenue" },
  { id: "H-07", kind: "lead", title: "Lead went cold: Bhavna Desai", body: "Prime Interiors, Surat. No reply in 72h after proposal. Follow-up agent can send a Diwali offer nudge.", at: "Yesterday", read: true, href: "/hq/followups" },
  { id: "H-08", kind: "system", title: "Interakt WhatsApp plan renews 28 Oct", body: "₹18,400 + GST. Template quota at 81%.", at: "Yesterday", read: true, href: "/hq/tasks" },
  { id: "H-09", kind: "agent", title: "Collections agent reminded 6 EMI students", body: "2 paid within the hour (₹49,998). 4 opened the link.", at: "Yesterday", read: true, href: "/hq/agents" },
  { id: "H-10", kind: "announcement", title: "Rohan posted: New close-rate target 18%", body: "Sales audience. Drill at 11 AM.", at: "Yesterday", read: true, href: "/hq/announcements" },
  { id: "H-11", kind: "task", title: "Sneha completed: Send Accelerator EMI plan", body: "Harish Patel accepted 3 × ₹25,000.", at: "Yesterday", read: true, href: "/hq/tasks" },
  { id: "H-12", kind: "student", title: "Batch 12 graduate testimonial approved", body: "Manoj Kulkarni, Precision Auto Parts. Video ready for ads.", at: "Yesterday", read: true, href: "/hq/students" },
  { id: "H-13", kind: "payment", title: "₹1.5 L received: AI Business Systems", body: "Prakash Goyal, Royal Traders. NEFT, GST invoice INV-2026-1184 raised.", at: "Mon", read: true, href: "/hq/revenue" },
  { id: "H-14", kind: "lead", title: "Referral from Care Dental", body: "Dr. Shalini Menon refers LifeLine Diagnostics, Kochi. Warm intro on WhatsApp.", at: "Mon", read: true, href: "/hq/crm" },
  { id: "H-15", kind: "system", title: "Razorpay settlement: ₹6.8 L credited", body: "148 transactions matched. 4 need manual reconciliation.", at: "Mon", read: false, href: "/hq/revenue" },
  { id: "H-16", kind: "agent", title: "Ads watchdog paused 2 ad sets", body: "CPL above ₹90 for 48h on Lookalike 3% Pune and Interest: MSME Delhi.", at: "Mon", read: true, href: "/hq/roas" },
  { id: "H-17", kind: "task", title: "Overdue: Book Zoom 3,000-seat licence", body: "Aditya · due Mon. Needs finance approval.", at: "Mon", read: true, href: "/hq/tasks" },
  { id: "H-18", kind: "student", title: "Shree Fabrics completed the Launchpad", body: "Rajesh Agarwal finished all 8 modules. Upsell window open for Accelerator.", at: "Sun", read: true, href: "/hq/students" },
  { id: "H-19", kind: "system", title: "GST return due: GSTR-3B September", body: "Due 20 Oct. CA has the documents.", at: "Sun", read: true, href: "/hq/tasks" },
  { id: "H-20", kind: "announcement", title: "Aditya posted: Diwali leave calendar is open", body: "Mark leave by 25 Oct.", at: "Sun", read: true, href: "/hq/announcements" },
  { id: "H-21", kind: "lead", title: "Workshop no-show: 412 registrants", body: "Follow-up agent queued a recording + ₹51 credit offer for Batch 15.", at: "18 Oct", read: true, href: "/hq/followups" },
  { id: "H-22", kind: "payment", title: "Refund requested: ₹24,999", body: "Batch 13 student, medical reason. Needs founder approval.", at: "17 Oct", read: false, href: "/hq/revenue" },
];

const groupOf = (at: string) => (/just|min|h ago|today/i.test(at) ? "Today" : /yesterday/i.test(at) ? "Yesterday" : "Earlier");
const amountIn = (s: string) => {
  const m = s.match(/₹\s?([\d,.]+)\s?(L|Cr)?/);
  if (!m) return 0;
  const n = Number(m[1].replace(/,/g, ""));
  return m[2] === "L" ? n * 1e5 : m[2] === "Cr" ? n * 1e7 : n;
};

/** AI urgency: how much this needs a human right now, with the reason. */
function triage(n: Notification) {
  const t = `${n.title} ${n.body}`.toLowerCase();
  let score = { lead: 60, payment: 40, task: 50, agent: 25, student: 45, announcement: 15, system: 30 }[n.kind];
  let why = "FYI";
  if (/hot lead|score 9|call back/.test(t)) { score += 30; why = "Hot lead, reply speed decides the close"; }
  if (/overdue|due today|due 20 oct/.test(t)) { score += 28; why = "Past or at deadline"; }
  if (/failed|refund|approval/.test(t)) { score += 32; why = "Money at stake and needs a decision"; }
  if (/at risk|bounced/.test(t)) { score += 18; why = "Students blocked without a human"; }
  if (/received|credited|completed|posted/.test(t)) { score -= 25; why = "Good news, no action needed"; }
  if (n.read) score -= 30;
  if (groupOf(n.at) === "Earlier") score -= 10;
  return { score: Math.max(0, Math.min(99, score)), why };
}

/* ------------------------------------------------------------------ */

export default function Notifications() {
  const hq = useHQ();
  const [localRead, setLocalRead] = React.useState<Record<string, boolean>>(() => Object.fromEntries(history.map((h) => [h.id, h.read])));
  const [unreadAgain, setUnreadAgain] = React.useState<string[]>([]);
  const [archived, setArchived] = React.useState<string[]>([]);
  const [kind, setKind] = React.useState<"all" | Kind>("all");
  const [state, setState] = React.useState<"all" | "unread" | "read">("all");
  const [q, setQ] = React.useState("");
  const [picked, setPicked] = React.useState<string[]>([]);
  const [sel, setSel] = React.useState<string | null>(null);
  const [prefsOpen, setPrefsOpen] = React.useState(false);
  const [prefs, setPrefs] = React.useState<Record<Kind, { inbox: boolean; whatsapp: boolean; email: boolean }>>(() =>
    Object.fromEntries(KINDS.map((k) => [k, { inbox: true, whatsapp: k === "lead" || k === "payment", email: k === "system" || k === "announcement" }])) as Record<Kind, { inbox: boolean; whatsapp: boolean; email: boolean }>,
  );
  const [quiet, setQuiet] = React.useState(true);

  const storeIds = new Set(hq.notifications.map((n) => n.id));
  const all: Notification[] = [
    ...hq.notifications.map((n) => ({ ...n, read: n.read && !unreadAgain.includes(n.id) })),
    ...history.map((h) => ({ ...h, read: localRead[h.id] ?? h.read })),
  ].filter((n) => !archived.includes(n.id));
  const muted = all.filter((n) => !prefs[n.kind].inbox);
  const inbox = all.filter((n) => prefs[n.kind].inbox);

  const setRead = (ids: string[], read: boolean) => {
    ids.forEach((id) => {
      if (storeIds.has(id)) {
        if (read) hq.markRead(id);
      } else setLocalRead((m) => ({ ...m, [id]: read }));
    });
    setUnreadAgain((cur) => (read ? cur.filter((x) => !ids.includes(x)) : [...cur, ...ids.filter((id) => storeIds.has(id) && !cur.includes(id))]));
  };
  const markAll = () => {
    hq.markRead();
    setUnreadAgain([]);
    setLocalRead(Object.fromEntries(history.map((h) => [h.id, true])));
    hq.log("cleared the notification inbox", "info");
    toast.success("All caught up");
  };

  const visible = inbox
    .filter((n) => kind === "all" || n.kind === kind)
    .filter((n) => (state === "unread" ? !n.read : state === "read" ? n.read : true))
    .filter((n) => !q || `${n.title} ${n.body}`.toLowerCase().includes(q.toLowerCase()));
  const groups = (["Today", "Yesterday", "Earlier"] as const).map((g) => ({ g, list: visible.filter((n) => groupOf(n.at) === g) })).filter((x) => x.list.length);

  const ranked = inbox
    .filter((n) => !n.read)
    .map((n) => ({ n, ...triage(n) }))
    .sort((a, b) => b.score - a.score);
  const now = ranked.filter((r) => r.score >= 60).slice(0, 3);
  const fyi = ranked.filter((r) => r.score < 45);
  const unread = inbox.filter((n) => !n.read).length;
  const current = all.find((n) => n.id === sel) ?? visible[0] ?? null;

  const open = (n: Notification) => {
    setSel(n.id);
    if (!n.read) setRead([n.id], true);
  };
  const allPicked = visible.length > 0 && visible.every((n) => picked.includes(n.id));

  return (
    <div>
      <PageHeader
        kicker="Workspace"
        title="Notifications"
        sub={`${unread} unread across leads, payments, tasks and agents. Triage ranks what needs a human; the rest can wait.`}
        actions={
          <>
            <Btn icon={Settings2} onClick={() => setPrefsOpen(true)}>
              Preferences
            </Btn>
            <Btn variant="solid" icon={CheckCheck} disabled={!unread} onClick={markAll}>
              Mark all read
            </Btn>
          </>
        }
      />

      {/* AI triage */}
      <section className="desk-card desk-rise overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-d-line px-5 py-3.5">
          <div className="flex items-center gap-3">
            <AIMark label="Triage" />
            <p className="font-serif text-[19px] font-medium">
              {now.length ? `${now.length} need you now` : "Nothing urgent"}
              <span className="ml-2 font-sans text-[13px] text-d-mute">
                · {Math.max(0, ranked.length - now.length)} can wait · {fyi.length} are FYI
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <Btn
              size="sm"
              variant="soft"
              disabled={!fyi.length}
              onClick={() => {
                setRead(
                  fyi.map((r) => r.n.id),
                  true,
                );
                hq.log(`let the triage agent clear ${fyi.length} FYI notifications`, "accent");
                toast.success(`Marked ${fyi.length} FYI items read`, { description: "Payments received, completed tasks and posts you've seen." });
              }}
            >
              Clear {fyi.length} FYI
            </Btn>
            <Btn size="sm" variant="ghost" icon={MessageCircle} onClick={() => hq.openAsk("Summarise my unread notifications and tell me what to do first")}>
              Summarise the rest
            </Btn>
          </div>
        </div>
        <div className="grid gap-px bg-d-line md:grid-cols-3">
          {now.map(({ n, score, why }, i) => {
            const M = kindMeta[n.kind];
            return (
              <div key={n.id} className="flex flex-col bg-d-panel p-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-d-mute">0{i + 1}</span>
                  <Pill tone={M.tone}>
                    <M.icon className="h-3 w-3" /> {M.label}
                  </Pill>
                  <span className="ml-auto font-mono text-[11px]" style={{ color: score >= 80 ? "var(--d-late)" : "var(--d-warn)" }}>
                    urgency {score}
                  </span>
                </div>
                <button type="button" onClick={() => open(n)} className="mt-2 text-left">
                  <p className="text-[14px] font-medium leading-snug hover:underline">{n.title}</p>
                  <p className="mt-1 line-clamp-2 text-[12.5px] text-d-mute">{n.body}</p>
                </button>
                <p className="mt-2 flex items-center gap-1.5 text-[12px] text-[color-mix(in_oklab,var(--d-gold)_75%,black)]">
                  <Sparkles className="h-3 w-3" /> {why}
                </p>
                <div className="mt-auto pt-3">
                  <QuickAction n={n} onDone={() => setRead([n.id], true)} />
                </div>
              </div>
            );
          })}
          {now.length === 0 && <p className="bg-d-panel p-6 text-[13px] text-d-mute md:col-span-3">The inbox is calm. New hot leads, failed payments and overdue P0s will surface here first.</p>}
        </div>
      </section>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Segmented
          size="sm"
          value={kind}
          onChange={setKind}
          options={[
            { value: "all", label: "All", count: inbox.length },
            ...KINDS.filter((k) => prefs[k].inbox).map((k) => ({ value: k, label: kindMeta[k].label, count: inbox.filter((n) => n.kind === k && !n.read).length || undefined })),
          ]}
        />
        <Segmented size="sm" value={state} onChange={setState} options={[{ value: "all", label: "All" }, { value: "unread", label: "Unread", count: unread }, { value: "read", label: "Read" }]} />
        <SearchBox value={q} onChange={setQ} placeholder="Search notifications" className="w-full sm:w-60" />
      </div>

      <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="desk-card min-w-0 overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b border-d-line px-4 py-2.5">
            <Box on={allPicked} onClick={() => setPicked(allPicked ? [] : visible.map((n) => n.id))} label="Select all" />
            <span className="text-[12.5px] text-d-mute">{picked.length ? `${picked.length} selected` : `${visible.length} notifications`}</span>
            {picked.length > 0 && (
              <div className="ml-auto flex gap-1.5">
                <Btn size="sm" variant="ghost" icon={Check} onClick={() => { setRead(picked, true); toast(`Marked ${picked.length} read`); setPicked([]); }}>
                  Mark read
                </Btn>
                <Btn size="sm" variant="ghost" icon={Bell} onClick={() => { setRead(picked, false); toast(`Marked ${picked.length} unread`); setPicked([]); }}>
                  Mark unread
                </Btn>
                <Btn
                  size="sm"
                  variant="ghost"
                  icon={Archive}
                  onClick={() => {
                    const ids = picked;
                    setArchived((a) => [...a, ...ids]);
                    setPicked([]);
                    hq.log(`archived ${ids.length} notifications`, "info");
                    toast(`Archived ${ids.length}`, { action: { label: "Undo", onClick: () => setArchived((a) => a.filter((x) => !ids.includes(x))) } });
                  }}
                >
                  Archive
                </Btn>
              </div>
            )}
          </div>
          {groups.map(({ g, list }) => (
            <div key={g}>
              <p className="border-b border-d-line bg-d-sunk/70 px-4 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-d-mute backdrop-blur">
                {g} <span className="ml-1 font-mono tracking-normal">{list.length}</span>
              </p>
              <ul className="divide-y divide-d-line">
                {list.map((n) => {
                  const M = kindMeta[n.kind];
                  const t = triage(n);
                  return (
                    <li key={n.id} className={cn("group flex items-start gap-3 px-4 py-3 transition-colors", current?.id === n.id ? "bg-d-soft/60" : "hover:bg-d-sunk/60")}>
                      <span className="pt-1">
                        <Box on={picked.includes(n.id)} onClick={() => setPicked((p) => (p.includes(n.id) ? p.filter((x) => x !== n.id) : [...p, n.id]))} label="Select" />
                      </span>
                      <button type="button" onClick={() => open(n)} className="flex min-w-0 flex-1 items-start gap-3 text-left">
                        <span className="relative mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-d-sunk text-d-ink/75">
                          <M.icon className="h-4 w-4" strokeWidth={1.8} />
                          {!n.read && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-d-panel bg-d-accent" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={cn("block truncate text-[13.5px]", n.read ? "text-d-ink/75" : "font-semibold")}>{n.title}</span>
                          <span className="block truncate text-[12.5px] text-d-mute">{n.body}</span>
                        </span>
                        <span className="flex shrink-0 flex-col items-end gap-1">
                          <span className="font-mono text-[11px] text-d-mute">{n.at}</span>
                          {!n.read && t.score >= 60 && <span className="font-mono text-[10.5px] text-d-late">urgent</span>}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          {visible.length === 0 && <p className="px-4 py-12 text-center text-[13px] text-d-mute">Nothing here. {muted.length ? `${muted.length} muted by your preferences.` : ""}</p>}
          {muted.length > 0 && visible.length > 0 && (
            <button type="button" onClick={() => setPrefsOpen(true)} className="w-full border-t border-d-line px-4 py-2.5 text-left text-[12px] text-d-mute hover:bg-d-sunk">
              {muted.length} notifications hidden by your preferences · change
            </button>
          )}
        </div>

        <div className="min-w-0">
          <div className="xl:sticky xl:top-[84px]">{current ? <Detail n={current} onRead={(r) => setRead([current.id], r)} onArchive={() => { setArchived((a) => [...a, current.id]); setSel(null); toast("Archived"); }} /> : <Panel title="Nothing selected"><p className="text-[13px] text-d-mute">Pick a notification to see details.</p></Panel>}</div>
        </div>
      </div>

      <Modal open={prefsOpen} onOpenChange={setPrefsOpen} title="Notification preferences" sub={`For ${hq.me.name}. Channels per kind; turning off Inbox hides that kind here.`} width={620}>
        <div className="overflow-hidden rounded-[12px] border border-d-line">
          <div className="grid grid-cols-[1fr_72px_86px_72px] items-center gap-2 bg-d-sunk px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-d-mute">
            <span>Kind</span>
            <span className="text-center">Inbox</span>
            <span className="text-center">WhatsApp</span>
            <span className="text-center">Email</span>
          </div>
          {KINDS.map((k) => {
            const M = kindMeta[k];
            return (
              <div key={k} className="grid grid-cols-[1fr_72px_86px_72px] items-center gap-2 border-t border-d-line px-3 py-2.5">
                <span className="flex items-center gap-2 text-[13.5px]">
                  <M.icon className="h-4 w-4 text-d-mute" /> {M.label}
                  <span className="font-mono text-[11px] text-d-mute">{all.filter((n) => n.kind === k).length}</span>
                </span>
                {(["inbox", "whatsapp", "email"] as const).map((ch) => (
                  <span key={ch} className="flex justify-center">
                    <Switch
                      on={prefs[k][ch]}
                      onChange={(v) => {
                        setPrefs((p) => ({ ...p, [k]: { ...p[k], [ch]: v } }));
                        toast(`${M.label} ${ch === "inbox" ? "in inbox" : `on ${ch === "whatsapp" ? "WhatsApp" : "email"}`}: ${v ? "on" : "off"}`);
                      }}
                    />
                  </span>
                ))}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 rounded-[12px] border border-d-line px-3 py-2.5">
          <span className="flex items-center gap-2 text-[13.5px]">
            <Moon className="h-4 w-4 text-d-mute" /> Quiet hours 10 PM to 8 AM IST
            <span className="text-[12px] text-d-mute">(hot leads and failed payments still come through)</span>
          </span>
          <Switch on={quiet} onChange={setQuiet} />
        </div>
        <AgentNote className="mt-4" title="Suggested from how you work" action={<Btn size="sm" variant="soft" onClick={() => { setPrefs((p) => ({ ...p, announcement: { ...p.announcement, whatsapp: false, email: true }, agent: { ...p.agent, whatsapp: false, email: true } })); toast.success("Applied: agents and announcements go to the evening email digest"); }}>Apply</Btn>}>
          You open agent and announcement alerts 4× less than lead and payment alerts. Move them to a 7 PM email digest and keep WhatsApp for money and hot leads.
        </AgentNote>
      </Modal>
    </div>
  );
}

/* ---------------- Detail ---------------- */

function Detail({ n, onRead, onArchive }: { n: Notification; onRead: (read: boolean) => void; onArchive: () => void }) {
  const hq = useHQ();
  const M = kindMeta[n.kind];
  const t = triage(n);
  const text = `${n.title} ${n.body}`;
  const lead =
    n.kind === "lead"
      ? hq.leads.find((l) => text.includes(l.name))
      : undefined;
  const task = n.kind === "task" || n.kind === "system" ? hq.tasks.find((x) => text.toLowerCase().includes(x.title.toLowerCase().slice(0, 18))) : undefined;
  const amount = amountIn(text);
  const next: Record<Kind, string> = {
    lead: lead ? `Call ${lead.name.split(" ")[0]} within 15 minutes. Open with their pain (“${lead.pain.toLowerCase()}”) and show the ${lead.industry.toLowerCase()} desk live.` : "Call within 15 minutes; reply speed is the biggest lever on close rate.",
    payment: /failed/i.test(text) ? "Send a fresh UPI Autopay link on WhatsApp and pause course access only after the second retry fails." : /refund/i.test(text) ? "Approve: medical reason and under 2 sessions attended fits the refund policy. Offer a Batch 15 seat first." : "No action. Receipt and GST invoice went out automatically; thank them on WhatsApp.",
    task: task ? `${personById[task.owner]?.first} owns this. ${task.dueIn < 0 ? "Ask for a new date today or reassign." : "On track; check in at stand-up."}` : "Check the owner has what they need.",
    agent: "Review a sample of 5 outputs, then let it keep running.",
    student: "Approve the WhatsApp sequence; Priya follows up personally with anyone who doesn't reply in 24h.",
    announcement: "Acknowledge it so the author's read receipt is complete.",
    system: "Turn this into a task with an owner and a date so it doesn't slip.",
  };

  return (
    <section className="desk-card desk-rise overflow-hidden">
      <header className="border-b border-d-line px-5 py-4">
        <div className="flex items-center gap-2">
          <Pill tone={M.tone}>
            <M.icon className="h-3 w-3" /> {M.label}
          </Pill>
          <span className="font-mono text-[11px] text-d-mute">
            {n.id} · {n.at}
          </span>
          <span className="ml-auto flex gap-1">
            <button type="button" onClick={() => onRead(!n.read)} className="rounded-md px-2 py-1 text-[12px] text-d-mute hover:bg-d-sunk hover:text-d-ink">
              {n.read ? "Mark unread" : "Mark read"}
            </button>
            <button type="button" onClick={onArchive} className="rounded-md p-1.5 text-d-mute hover:bg-d-sunk hover:text-d-ink" title="Archive">
              <Archive className="h-3.5 w-3.5" />
            </button>
          </span>
        </div>
        <h2 className="mt-2.5 font-serif text-[22px] font-medium leading-snug">{n.title}</h2>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-d-ink/85">{n.body}</p>
      </header>

      <div className="space-y-5 px-5 py-4">
        <AgentNote title={<span className="flex items-center gap-2">Suggested next step <span className="font-mono text-[11px] font-normal text-d-mute">urgency {t.score}</span></span>}>
          {next[n.kind]}
        </AgentNote>

        {lead && (
          <div>
            <SectionLabel>Related lead</SectionLabel>
            <div className="rounded-[12px] border border-d-line p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[14px] font-medium">{lead.name}</p>
                  <p className="text-[12px] text-d-mute">
                    {lead.company}, {lead.city} · {lead.revenue} · {lead.teamSize} staff
                  </p>
                </div>
                <span className="rounded-[8px] border border-d-line px-2 py-1 text-center font-mono text-[13px] font-semibold">{lead.score}</span>
              </div>
              <div className="mt-3">
                <KV items={[{ k: "Stage", v: lead.stage }, { k: "Owner", v: personById[lead.owner]?.first }, { k: "Interest", v: `${programById[lead.interest].short} · ${rupees(lead.value)}` }, { k: "Follow-up", v: lead.followUpIn < 0 ? `${-lead.followUpIn}h overdue` : `in ${lead.followUpIn}h` }]} />
              </div>
              <div className="mt-3 flex gap-2">
                <Link href={`/hq/crm?lead=${lead.id}`} onClick={() => hq.log(`opened ${lead.name} from a notification`, "info")} className="inline-flex h-8 items-center gap-1.5 rounded-[10px] bg-d-accent px-3 text-[12.5px] font-medium text-d-accent-ink hover:brightness-110">
                  <Phone className="h-3.5 w-3.5" /> Open lead
                </Link>
                {lead.owner !== hq.me.id && (
                  <Btn
                    size="sm"
                    onClick={() => {
                      hq.updateLead(lead.id, { owner: hq.me.id });
                      hq.log(`took ownership of ${lead.name}`, "info");
                      toast.success(`${lead.name} is now yours`);
                    }}
                  >
                    Assign to me
                  </Btn>
                )}
              </div>
            </div>
          </div>
        )}

        {n.kind === "lead" && !lead && (
          <div>
            <SectionLabel>Related lead</SectionLabel>
            <div className="flex items-center justify-between gap-3 rounded-[12px] border border-dashed border-d-line p-3.5">
              <p className="text-[12.5px] text-d-mute">Not matched to a CRM record yet. The qualifier will attach it on the next run, or open the queue now.</p>
              <Link href="/hq/crm" className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[10px] bg-d-accent px-3 text-[12.5px] font-medium text-d-accent-ink hover:brightness-110">
                <Phone className="h-3.5 w-3.5" /> Open CRM
              </Link>
            </div>
          </div>
        )}

        {task && (
          <div>
            <SectionLabel>Related task</SectionLabel>
            <div className="rounded-[12px] border border-d-line p-3.5">
              <p className="text-[14px] font-medium">{task.title}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <PersonChip id={task.owner} />
                <Pill tone={task.status === "Done" ? "ok" : task.dueIn < 0 ? "late" : "neutral"}>{task.status}</Pill>
                <Pill mono>{task.priority}</Pill>
                <span className="font-mono text-[11.5px] text-d-mute">
                  <Clock className="mr-1 inline h-3 w-3" />
                  {task.due}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <Link href="/hq/tasks" className="inline-flex h-8 items-center gap-1.5 rounded-[10px] border border-d-line px-3 text-[12.5px] font-medium hover:bg-d-sunk">
                  Open task <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                {task.status !== "Done" && (
                  <Btn
                    size="sm"
                    variant="solid"
                    onClick={() => {
                      hq.updateTask(task.id, { status: "Done" });
                      hq.log(`completed "${task.title}" from notifications`, "ok");
                      toast.success("Task marked done");
                    }}
                  >
                    Mark done
                  </Btn>
                )}
              </div>
            </div>
          </div>
        )}

        {n.kind === "payment" && amount > 0 && (
          <div>
            <SectionLabel>Payment</SectionLabel>
            <div className="rounded-[12px] border border-d-line p-3.5">
              <KV
                items={[
                  { k: "Amount", v: `₹${Math.round(amount).toLocaleString("en-IN")}` },
                  { k: "Taxable value", v: `₹${Math.round(amount / 1.18).toLocaleString("en-IN")}` },
                  { k: "GST 18%", v: `₹${Math.round(amount - amount / 1.18).toLocaleString("en-IN")}` },
                  { k: "Rail", v: /upi/i.test(text) ? "UPI" : /neft/i.test(text) ? "NEFT" : "Razorpay" },
                ]}
              />
              <div className="mt-3 flex gap-2">
                <Btn size="sm" onClick={() => { hq.log(`resent GST invoice for ${rupees(amount)}`, "info"); toast.success("GST invoice sent on WhatsApp and email"); }}>
                  Resend invoice
                </Btn>
                <Link href="/hq/revenue" className="inline-flex h-8 items-center gap-1 rounded-[10px] px-2 text-[12.5px] font-medium text-d-accent hover:underline">
                  Revenue Center <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-t border-d-line pt-4">
          <QuickAction n={n} onDone={() => onRead(true)} />
          {n.href && (
            <Link href={n.href} className="inline-flex h-8 items-center gap-1 rounded-[10px] border border-d-line px-3 text-[12.5px] font-medium hover:bg-d-sunk">
              Open source <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
          <Btn size="sm" variant="ghost" icon={Sparkles} onClick={() => hq.openAsk(`About this notification: ${n.title}. What should I do?`)}>
            Ask HQ
          </Btn>
        </div>
      </div>
    </section>
  );
}

/* ---------------- One-click actions ---------------- */

function QuickAction({ n, onDone }: { n: Notification; onDone: () => void }) {
  const hq = useHQ();
  const [done, setDone] = React.useState(false);
  const t = `${n.title} ${n.body}`;
  const spec: { label: string; icon: LucideIcon; run: () => void } =
    n.kind === "lead"
      ? { label: "Add call to my tasks", icon: Phone, run: () => hq.addTask({ title: `Call: ${n.title.replace(/^.*?:\s*/, "")}`, owner: hq.me.id, priority: "P0", area: "Sales", status: "Todo", dueIn: 0, due: "Today", aiDrafted: true }) }
      : n.kind === "payment" && /refund/i.test(t)
        ? { label: "Approve refund", icon: Check, run: () => hq.notify({ kind: "payment", title: "Refund approved: ₹24,999", body: "Sahil will process via Razorpay in 5–7 working days." }, { toast: false }) }
        : n.kind === "payment" && /failed/i.test(t)
          ? { label: "Send UPI Autopay link", icon: MessageCircle, run: () => undefined }
          : n.kind === "student"
            ? { label: "Approve WhatsApp sequence", icon: MessageCircle, run: () => undefined }
            : n.kind === "task" || n.kind === "system"
              ? { label: "Nudge the owner", icon: Bell, run: () => undefined }
              : n.kind === "announcement"
                ? { label: "Acknowledge", icon: Check, run: () => undefined }
                : { label: "Looks good", icon: Check, run: () => undefined };
  return (
    <Btn
      size="sm"
      variant={done ? "ghost" : "outline"}
      icon={done ? CheckCheck : spec.icon}
      disabled={done}
      onClick={() => {
        spec.run();
        setDone(true);
        onDone();
        hq.log(`${spec.label.toLowerCase()} · ${n.title}`, "ok");
        toast.success(spec.label, { description: n.title });
      }}
    >
      {done ? "Done" : spec.label}
    </Btn>
  );
}

/* ---------------- Bits ---------------- */

function Box({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors", on ? "border-d-accent bg-d-accent text-d-accent-ink" : "border-d-line bg-d-panel hover:border-d-accent")}>
      {on && <Check className="h-3 w-3" strokeWidth={3} />}
    </button>
  );
}

function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors", on ? "bg-d-accent" : "bg-d-line")}>
      <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-[left]", on ? "left-[18px]" : "left-0.5")} />
    </button>
  );
}

