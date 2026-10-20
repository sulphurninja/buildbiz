"use client";

import * as React from "react";
import { toast } from "sonner";
import { cn } from "cn";
import { BellRing, CalendarDays, Check, CheckCheck, MessageCircle, Pin, PinOff, Plus, SmilePlus, Sparkles, Trash2, Wand2 } from "lucide-react";
import { useHQ } from "../store";
import { personById, team } from "../data";
import type { Announcement } from "../types";
import { AIMark, AgentNote, Btn, Field, Meter, Modal, PageHeader, Panel, PersonAvatar, PersonChip, Pill, SearchBox, SectionLabel, Segmented, Sheet, inputClass } from "../kit";

type Audience = Announcement["audience"];
const AUDIENCES: Audience[] = ["Everyone", "Sales", "Delivery", "Ops"];
const EMOJI = ["👍", "🔥", "👏", "🙏", "🚀", "🪔"];

const members = (a: Audience) => team.filter((p) => a === "Everyone" || (a === "Sales" && p.role === "sales") || (a === "Delivery" && p.role === "delivery") || (a === "Ops" && p.role === "ops")).map((p) => p.id);
const ackedBy = (a: Announcement) => members(a.audience).filter((id) => id === a.by || a.acks.includes(id));
const pendingFor = (a: Announcement) => members(a.audience).filter((id) => id !== a.by && !a.acks.includes(id));
const allBut = (...out: string[]) => team.map((p) => p.id).filter((id) => !out.includes(id));

/** Older posts so the feed has a real history; merged into the shared store once. */
const archive: Announcement[] = [
  { id: "A-h01", title: "Razorpay EMI now live on Accelerator", body: "Students can pay ₹74,999 as 3 × ₹25,000 via Razorpay EMI or UPI Autopay. Use the payment link from the CRM; don't share personal UPI IDs.", by: "sahil", at: "Mon, 10:20 AM", audience: "Sales", reactions: { "🙏": 4, "👍": 3 }, acks: ["rohan", "sneha", "arjun", "imran"] },
  { id: "A-h02", title: "Batch 14 Zoom links and host roster", body: "Day 1 host Amit, co-host Neha, chat moderators Priya and Imran. Waiting room on, recording to cloud. Backup link pinned in the WhatsApp group.", by: "aditya", at: "Sun, 7:30 PM", audience: "Everyone", reactions: { "👍": 8 }, acks: allBut("aditya", "kavya") },
  { id: "A-h03", title: "Care Dental case study is live", body: "Chair utilisation 61% → 84% in 6 weeks. Use it on every clinic and healthcare call. The deck is in the Resource Library under Case studies.", by: "meera", at: "Sat, 4:10 PM", audience: "Everyone", reactions: { "👏": 9, "🔥": 4 }, acks: allBut("meera", "vikram") },
  { id: "A-h04", title: "New objection script: “mujhe sochna padega”", body: "When an owner says they need to think, ask what specifically, and offer the 7-day blueprint call instead of a discount. Script v3 is in the library. Roleplay at Thursday's drill.", by: "rohan", at: "Fri, 6:45 PM", audience: "Sales", reactions: { "💪": 5 }, acks: ["sneha", "arjun", "kavya", "imran"] },
  { id: "A-h05", title: "Apollo Pharma expiry radar shipped", body: "Vikram shipped the expiry radar to production. The client flagged ₹3.4 L of near-expiry stock on day one. Great save for the account.", by: "neha", at: "Fri, 11:30 AM", audience: "Everyone", reactions: { "🚀": 10, "👏": 6 }, acks: allBut("neha") },
  { id: "A-h06", title: "GST invoices: new format from 1 Nov", body: "Every invoice must carry the HSN/SAC code 998314 and the student's GSTIN if they have one. Razorpay templates are updated; manual invoices go through Sahil.", by: "sahil", at: "Thu, 3:00 PM", audience: "Everyone", reactions: { "👍": 6 }, acks: allBut("sahil", "arjun", "meera") },
  { id: "A-h07", title: "Delivery SLA: client WhatsApp replies within 2 hours", body: "During working hours, every client message gets a human reply within 2 hours, even if it's 'checking, will revert by 5'. The build monitor will flag breaches.", by: "neha", at: "Thu, 9:15 AM", audience: "Delivery", reactions: { "👍": 2 }, acks: ["vikram", "priya"] },
  { id: "A-h08", title: "Ad budget for Batch 15 approved", body: "₹13.5 L for the 30-day window, ₹45k/day cap. CPL guardrail ₹55; anything above pauses automatically.", by: "amit", at: "Wed, 5:40 PM", audience: "Ops", reactions: { "📈": 3 }, acks: ["meera", "sahil", "aditya"] },
  { id: "A-h09", title: "Welcome Imran to the sales team", body: "Imran joins as our first lead qualifier (SDR). He'll own the first 15 minutes of every new Meta lead. Say hi in the sales group.", by: "rohan", at: "Tue, 10:00 AM", audience: "Everyone", reactions: { "👋": 11, "🎉": 7 }, acks: allBut("rohan") },
  { id: "A-h10", title: "Office closed for Dussehra", body: "Office closed on Dussehra. Agents run follow-ups as usual; on-call: Rohan for sales, Vikram for builds.", by: "aditya", at: "12 Oct", audience: "Everyone", reactions: { "🙏": 9 }, acks: allBut("aditya") },
  { id: "A-h11", title: "Monthly numbers: September", body: "₹1.84 Cr booked, ₹1.52 Cr collected, 2 builds live. Close rate 14.2%. Thank you all; October target is ₹2.1 Cr.", by: "amit", at: "1 Oct", audience: "Everyone", reactions: { "🔥": 12, "👏": 8 }, acks: allBut("amit") },
  { id: "A-h12", title: "Priya is our Coach of the Month", body: "92% of her Batch 12 students completed the blueprint. She ran 14 extra office hours. Gift voucher on its way.", by: "neha", at: "30 Sep", audience: "Everyone", reactions: { "👏": 12, "🏆": 6 }, acks: allBut("neha") },
];

const datebook = [
  { d: "25 Oct", label: "Diwali leave calendar closes", tone: "warn" as const },
  { d: "29 Oct", label: "Batch 15 registrations open", tone: "info" as const },
  { d: "6 Nov", label: "Dhanteras · jewellery clients peak day", tone: "accent" as const },
  { d: "8 Nov", label: "Diwali · office closed", tone: "ok" as const },
  { d: "10–11 Nov", label: "Bhai Dooj · skeleton crew", tone: "neutral" as const },
  { d: "14 Nov", label: "Batch 15 workshop, day 1", tone: "info" as const },
];

/* ---------------- AI helpers ---------------- */

function sentences(t: string) {
  return t.replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s+/).filter(Boolean);
}
function polish(title: string, body: string) {
  const fixes: [RegExp, string][] = [
    [/\bpls\b|\bplz\b/gi, "please"],
    [/\basap\b/gi, "by end of day"],
    [/\bguys\b/gi, "team"],
    [/\b(just|basically|actually|kindly)\s+/gi, ""],
    [/\bu\b/gi, "you"],
    [/\bur\b/gi, "your"],
    [/\bthx\b|\bthnx\b/gi, "thank you"],
    [/!{2,}/g, "!"],
  ];
  let clean = body;
  fixes.forEach(([r, s]) => (clean = clean.replace(r, s)));
  const parts = sentences(clean).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).map((s) => (/[.!?]$/.test(s) ? s : `${s}.`));
  const [lead, ...rest] = parts;
  const actions = rest.filter((s) => /\b(please|must|should|need|every|don't|do not|by|before|make sure)\b/i.test(s));
  const context = rest.filter((s) => !actions.includes(s));
  const out = [lead, ...context].filter(Boolean).join(" ");
  const newBody = actions.length ? `${out}\n\nWhat we need from you:\n${actions.map((a) => `• ${a}`).join("\n")}` : out;
  const newTitle = title.trim() || (lead ?? "Update").replace(/[.!?]$/, "").split(" ").slice(0, 9).join(" ");
  return { title: newTitle.charAt(0).toUpperCase() + newTitle.slice(1), body: newBody };
}
function tldr(a: Announcement) {
  const s = sentences(a.body);
  const action = s.find((x) => /\b(please|must|should|need|every|don't|by|gets|goes out|mark)\b/i.test(x));
  return { gist: s[0], action: action && action !== s[0] ? action : null };
}

/* ------------------------------------------------------------------ */

export default function Announcements() {
  const hq = useHQ();
  const { announcements, setAnnouncements, me } = hq;
  const [aud, setAud] = React.useState<"All" | Audience>("All");
  const [state, setState] = React.useState<"all" | "unread" | "pinned" | "low">("all");
  const [sort, setSort] = React.useState<"new" | "acks">("new");
  const [q, setQ] = React.useState("");
  const [compose, setCompose] = React.useState(false);
  const [roster, setRoster] = React.useState<string | null>(null);
  const [mine, setMine] = React.useState<Record<string, string[]>>({});
  const [nudged, setNudged] = React.useState<Record<string, string[]>>({});

  React.useEffect(() => {
    const id = window.setTimeout(() => setAnnouncements((cur) => (cur.some((a) => a.id === "A-h01") ? cur : [...cur, ...archive])), 0);
    return () => window.clearTimeout(id);
  }, [setAnnouncements]);

  const patch = (id: string, fn: (a: Announcement) => Partial<Announcement>) => setAnnouncements((cur) => cur.map((a) => (a.id === id ? { ...a, ...fn(a) } : a)));

  const ack = (a: Announcement) => {
    patch(a.id, (x) => ({ acks: x.acks.includes(me.id) ? x.acks : [...x.acks, me.id] }));
    hq.log(`acknowledged "${a.title}"`, "ok");
    toast.success("Acknowledged", { description: a.title });
  };
  const react = (a: Announcement, e: string) => {
    const has = (mine[a.id] ?? []).includes(e);
    setMine((m) => ({ ...m, [a.id]: has ? (m[a.id] ?? []).filter((x) => x !== e) : [...(m[a.id] ?? []), e] }));
    patch(a.id, (x) => ({ reactions: { ...x.reactions, [e]: Math.max(0, (x.reactions[e] ?? 0) + (has ? -1 : 1)) } }));
  };
  const nudge = (a: Announcement, ids: string[]) => {
    if (!ids.length) return;
    setNudged((n) => ({ ...n, [a.id]: [...(n[a.id] ?? []), ...ids] }));
    hq.notify({ kind: "announcement", title: `Reminder: please acknowledge "${a.title}"`, body: `Sent to ${ids.map((i) => personById[i]?.first).join(", ")}`, href: "/hq/announcements" }, { toast: false });
    hq.log(`nudged ${ids.length} teammate${ids.length > 1 ? "s" : ""} to read "${a.title}"`, "info");
    toast.success(`Nudged ${ids.length} on HQ and WhatsApp`, { description: ids.map((i) => personById[i]?.first).join(", ") });
  };
  const togglePin = (a: Announcement) => {
    patch(a.id, (x) => ({ pinned: !x.pinned }));
    hq.log(`${a.pinned ? "unpinned" : "pinned"} "${a.title}"`, "info");
    toast(a.pinned ? "Unpinned" : "Pinned to the top");
  };
  const remove = (a: Announcement) => {
    setAnnouncements((cur) => cur.filter((x) => x.id !== a.id));
    hq.log(`deleted the announcement "${a.title}"`, "warn");
    toast("Announcement deleted", { action: { label: "Undo", onClick: () => setAnnouncements((cur) => [a, ...cur]) } });
  };

  const rate = (a: Announcement) => ackedBy(a).length / (members(a.audience).length || 1);
  const visible = announcements
    .filter((a) => aud === "All" || a.audience === aud)
    .filter((a) => (state === "unread" ? members(a.audience).includes(me.id) && a.by !== me.id && !a.acks.includes(me.id) : state === "pinned" ? a.pinned : state === "low" ? rate(a) < 0.8 : true))
    .filter((a) => !q || `${a.title} ${a.body} ${personById[a.by]?.name}`.toLowerCase().includes(q.toLowerCase()));
  const order = (list: Announcement[]) => (sort === "acks" ? [...list].sort((x, y) => rate(x) - rate(y)) : list);
  const pinned = order(visible.filter((a) => a.pinned));
  const rest = order(visible.filter((a) => !a.pinned));

  const unreadMine = announcements.filter((a) => members(a.audience).includes(me.id) && a.by !== me.id && !a.acks.includes(me.id));
  const totalSlots = announcements.reduce((s, a) => s + members(a.audience).length, 0);
  const totalAck = announcements.reduce((s, a) => s + ackedBy(a).length, 0);
  const owe = team
    .map((p) => ({ p, list: announcements.filter((a) => pendingFor(a).includes(p.id)) }))
    .filter((x) => x.list.length)
    .sort((a, b) => b.list.length - a.list.length);
  const rosterA = announcements.find((a) => a.id === roster) ?? null;

  return (
    <div>
      <PageHeader
        kicker="Workspace"
        title="Announcements"
        sub="Company updates that need to be read, not just sent. Every post tracks who has acknowledged it."
        actions={
          <>
            {unreadMine.length > 0 && (
              <Btn
                icon={CheckCheck}
                onClick={() => {
                  setAnnouncements((cur) => cur.map((a) => (unreadMine.some((u) => u.id === a.id) ? { ...a, acks: [...a.acks, me.id] } : a)));
                  hq.log(`acknowledged ${unreadMine.length} announcements`, "ok");
                  toast.success(`Acknowledged ${unreadMine.length} posts`);
                }}
              >
                Acknowledge all ({unreadMine.length})
              </Btn>
            )}
            <Btn variant="solid" icon={Plus} onClick={() => setCompose(true)}>
              New announcement
            </Btn>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          size="sm"
          value={aud}
          onChange={setAud}
          options={[{ value: "All", label: "All", count: announcements.length }, ...AUDIENCES.map((a) => ({ value: a, label: a, count: announcements.filter((x) => x.audience === a).length }))]}
        />
        <Segmented
          size="sm"
          value={state}
          onChange={setState}
          options={[
            { value: "all", label: "Any" },
            { value: "unread", label: "Unread by me", count: unreadMine.length },
            { value: "pinned", label: "Pinned" },
            { value: "low", label: "Under 80% read" },
          ]}
        />
        <SearchBox value={q} onChange={setQ} placeholder="Search posts" className="w-full sm:w-56" />
        <div className="ml-auto">
          <Segmented size="sm" value={sort} onChange={setSort} options={[{ value: "new", label: "Newest" }, { value: "acks", label: "Least read" }]} />
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-4">
          {pinned.length > 0 && <SectionLabel>Pinned</SectionLabel>}
          {pinned.map((a) => (
            <Post key={a.id} a={a} mine={mine[a.id] ?? []} nudged={nudged[a.id] ?? []} onAck={ack} onReact={react} onPin={togglePin} onRemove={remove} onRoster={() => setRoster(a.id)} onNudge={nudge} />
          ))}
          {rest.length > 0 && <SectionLabel className="pt-2">{sort === "acks" ? "Least read first" : "Latest"}</SectionLabel>}
          {rest.map((a) => (
            <Post key={a.id} a={a} mine={mine[a.id] ?? []} nudged={nudged[a.id] ?? []} onAck={ack} onReact={react} onPin={togglePin} onRemove={remove} onRoster={() => setRoster(a.id)} onNudge={nudge} />
          ))}
          {visible.length === 0 && <div className="desk-card p-10 text-center text-[13px] text-d-mute">Nothing matches these filters.</div>}
        </div>

        <div className="min-w-0 space-y-5">
          <AgentNote title="This week in three lines" action={<Btn size="sm" variant="soft" icon={MessageCircle} onClick={() => hq.openAsk("Summarise this week's announcements and what each team needs to do")}>Ask a follow-up</Btn>}>
            <ol className="mt-1 list-decimal space-y-1 pl-4">
              <li>Batch 14 hit 1,248 seats; sales calls every Q&amp;A stayer within 24 hours.</li>
              <li>Sales target moves to 18% close rate with the industry-desk demo flow.</li>
              <li>Balaji goes live Friday; mark Diwali leave by 25 Oct.</li>
            </ol>
          </AgentNote>

          <Panel title="Read receipts" sub={`${Math.round((totalAck / (totalSlots || 1)) * 100)}% of all posts acknowledged`} icon={BellRing}>
            <Meter value={totalAck} max={totalSlots || 1} tone="ok" />
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-d-mute">Still owes a read</p>
            <ul className="mt-2 space-y-2">
              {owe.slice(0, 8).map(({ p, list }) => (
                <li key={p.id} className="flex items-center gap-2">
                  <PersonChip id={p.id} sub={list[0]?.title} />
                  <span className="ml-auto font-mono text-[12px] text-d-late">{list.length}</span>
                  <Btn size="sm" variant="ghost" onClick={() => list.forEach((a) => nudge(a, [p.id]))}>
                    Nudge
                  </Btn>
                </li>
              ))}
              {owe.length === 0 && <li className="text-[12.5px] text-d-mute">Everyone is up to date.</li>}
            </ul>
          </Panel>

          <Panel title="Company calendar" sub="Festive season, batches and deadlines" icon={CalendarDays}>
            <ul className="space-y-2.5">
              {datebook.map((d) => (
                <li key={d.d} className="flex items-center gap-3">
                  <span className="w-[74px] shrink-0 font-mono text-[11.5px] text-d-mute">{d.d}</span>
                  <span className="min-w-0 flex-1 truncate text-[13px]">{d.label}</span>
                  <Pill tone={d.tone}>{d.tone === "warn" ? "deadline" : d.tone === "ok" ? "holiday" : d.tone === "accent" ? "festival" : d.tone === "info" ? "batch" : "leave"}</Pill>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <RosterSheet a={rosterA} nudged={rosterA ? nudged[rosterA.id] ?? [] : []} onClose={() => setRoster(null)} onNudge={nudge} />
      <Composer
        open={compose}
        onOpenChange={setCompose}
        onPost={(a) => {
          setAnnouncements((cur) => [a, ...cur]);
          hq.log(`posted "${a.title}" to ${a.audience}`, "accent");
          hq.notify({ kind: "announcement", title: `${me.first} posted: ${a.title}`, body: `${a.pinned ? "Pinned for" : "To"} ${a.audience.toLowerCase()}`, href: "/hq/announcements" });
        }}
      />
    </div>
  );
}

/* ---------------- Post card ---------------- */

function Post({
  a,
  mine,
  nudged,
  onAck,
  onReact,
  onPin,
  onRemove,
  onRoster,
  onNudge,
}: {
  a: Announcement;
  mine: string[];
  nudged: string[];
  onAck: (a: Announcement) => void;
  onReact: (a: Announcement, e: string) => void;
  onPin: (a: Announcement) => void;
  onRemove: (a: Announcement) => void;
  onRoster: () => void;
  onNudge: (a: Announcement, ids: string[]) => void;
}) {
  const { me } = useHQ();
  const [picker, setPicker] = React.useState(false);
  const [sum, setSum] = React.useState(false);
  const all = members(a.audience);
  const read = ackedBy(a);
  const pending = pendingFor(a);
  const needsMe = all.includes(me.id) && a.by !== me.id && !a.acks.includes(me.id);
  const author = personById[a.by];
  const t = tldr(a);
  const canEdit = me.id === a.by || me.role === "founder";
  return (
    <article className={cn("desk-card desk-rise overflow-hidden", a.pinned && "border-[color-mix(in_oklab,var(--d-accent)_28%,var(--d-line))]")}>
      {needsMe && <div className="h-[3px] bg-d-accent" />}
      <div className="p-5">
        <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <PersonAvatar id={a.by} size={34} />
          <div className="min-w-0">
            <p className="text-[13.5px] font-semibold leading-tight">{author?.name}</p>
            <p className="text-[12px] text-d-mute">
              {author?.title} · {a.at}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            {a.pinned && (
              <Pill tone="accent">
                <Pin className="h-3 w-3" /> Pinned
              </Pill>
            )}
            <Pill>{a.audience}</Pill>
            {canEdit && (
              <>
                <button type="button" onClick={() => onPin(a)} className="rounded-md p-1.5 text-d-mute hover:bg-d-sunk hover:text-d-ink" title={a.pinned ? "Unpin" : "Pin"}>
                  {a.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                </button>
                <button type="button" onClick={() => onRemove(a)} className="rounded-md p-1.5 text-d-mute hover:bg-d-sunk hover:text-d-late" title="Delete">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </header>
        <h2 className="mt-3.5 font-serif text-[22px] font-medium leading-snug tracking-[-0.01em]">{a.title}</h2>
        <p className="mt-1.5 whitespace-pre-line text-[14px] leading-relaxed text-d-ink/85">{a.body}</p>

        {sum && (
          <div className="mt-3 rounded-[12px] border border-[color-mix(in_oklab,var(--d-gold)_35%,var(--d-line))] bg-[color-mix(in_oklab,var(--d-gold)_7%,var(--d-panel))] px-3.5 py-2.5 text-[13px]">
            <p className="flex items-center gap-1.5 font-semibold"><Sparkles className="h-3.5 w-3.5 text-(--d-gold)" /> TL;DR</p>
            <p className="mt-0.5">{t.gist}</p>
            {t.action && <p className="mt-1"><b>Your action:</b> {t.action}</p>}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {Object.entries(a.reactions)
            .filter(([, n]) => n > 0)
            .map(([e, n]) => (
              <button key={e} type="button" onClick={() => onReact(a, e)} className={cn("inline-flex h-7 items-center gap-1 rounded-full border px-2 text-[12.5px] transition-colors", mine.includes(e) ? "border-d-accent bg-d-soft" : "border-d-line hover:bg-d-sunk")}>
                <span>{e}</span>
                <span className="tnum font-mono text-[11px]">{n}</span>
              </button>
            ))}
          <div className="relative">
            <button type="button" onClick={() => setPicker((p) => !p)} className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-d-line text-d-mute hover:text-d-ink" aria-label="Add reaction">
              <SmilePlus className="h-3.5 w-3.5" />
            </button>
            {picker && (
              <div className="absolute left-0 top-full z-20 mt-1 flex gap-0.5 rounded-full border border-d-line bg-d-panel p-1 shadow-lg">
                {EMOJI.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => {
                      onReact(a, e);
                      setPicker(false);
                    }}
                    className="h-7 w-7 rounded-full text-[15px] hover:bg-d-sunk"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="button" onClick={() => setSum((s) => !s)} className="ml-1 inline-flex h-7 items-center gap-1 rounded-full px-2 text-[12px] font-medium text-[color-mix(in_oklab,var(--d-gold)_75%,black)] hover:bg-[color-mix(in_oklab,var(--d-gold)_10%,transparent)]">
            <Sparkles className="h-3.5 w-3.5" /> {sum ? "Hide summary" : "Summarise"}
          </button>
        </div>
      </div>

      <footer className="flex flex-wrap items-center gap-3 border-t border-d-line bg-d-sunk/40 px-5 py-3">
        <button type="button" onClick={onRoster} className="flex items-center gap-2.5 text-left">
          <span className="flex -space-x-1.5">
            {read.slice(0, 7).map((id) => (
              <PersonAvatar key={id} id={id} size={22} ring />
            ))}
          </span>
          <span className="text-[12.5px]">
            Read by <b className="tnum font-mono">{read.length}/{all.length}</b>
            {pending.length > 0 && <span className="text-d-mute"> · {pending.length} haven&apos;t acked</span>}
          </span>
        </button>
        <div className="w-24">
          <Meter value={read.length} max={all.length || 1} tone={read.length === all.length ? "ok" : read.length / all.length >= 0.6 ? "warn" : "late"} height={4} />
        </div>
        <div className="ml-auto flex gap-1.5">
          {pending.length > 0 && canEdit && (
            <Btn size="sm" variant="ghost" icon={BellRing} disabled={pending.every((p) => nudged.includes(p))} onClick={() => onNudge(a, pending.filter((p) => !nudged.includes(p)))}>
              {pending.every((p) => nudged.includes(p)) ? "Nudged" : `Nudge ${pending.length}`}
            </Btn>
          )}
          {needsMe ? (
            <Btn size="sm" variant="solid" icon={Check} onClick={() => onAck(a)}>
              Acknowledge
            </Btn>
          ) : all.includes(me.id) ? (
            <span className="inline-flex items-center gap-1 text-[12px] text-d-ok">
              <CheckCheck className="h-3.5 w-3.5" /> {a.by === me.id ? "Your post" : "You acked"}
            </span>
          ) : null}
        </div>
      </footer>
    </article>
  );
}

/* ---------------- Roster sheet ---------------- */

function RosterSheet({ a, nudged, onClose, onNudge }: { a: Announcement | null; nudged: string[]; onClose: () => void; onNudge: (a: Announcement, ids: string[]) => void }) {
  const all = a ? members(a.audience) : [];
  const pending = a ? pendingFor(a) : [];
  return (
    <Sheet
      open={!!a}
      onOpenChange={(o) => !o && onClose()}
      eyebrow={a ? `${a.audience} · ${a.at}` : ""}
      title={a?.title ?? ""}
      sub={a ? `${all.length - pending.length} of ${all.length} have acknowledged` : undefined}
      footer={a && pending.length > 0 ? <Btn variant="solid" icon={BellRing} onClick={() => onNudge(a, pending.filter((p) => !nudged.includes(p)))}>Nudge everyone pending</Btn> : undefined}
    >
      {a && (
        <>
          {pending.length > 0 && (
            <AgentNote title="Suggested reminder" className="mb-5">
              “{pending.map((p) => personById[p]?.first).join(", ")}, 30 seconds please: “{a.title}” needs your ack before today&apos;s stand-up. Padh ke ✅ kar dena.”
            </AgentNote>
          )}
          <SectionLabel>Not yet ({pending.length})</SectionLabel>
          <ul className="space-y-2">
            {pending.map((id) => (
              <li key={id} className="flex items-center justify-between rounded-[10px] border border-d-line px-3 py-2">
                <PersonChip id={id} sub={personById[id]?.online ? "Online now" : "Offline"} />
                <Btn size="sm" variant={nudged.includes(id) ? "ghost" : "outline"} disabled={nudged.includes(id)} onClick={() => onNudge(a, [id])}>
                  {nudged.includes(id) ? "Nudged" : "Nudge"}
                </Btn>
              </li>
            ))}
          </ul>
          <SectionLabel className="mt-6">Acknowledged ({all.length - pending.length})</SectionLabel>
          <ul className="grid grid-cols-2 gap-2">
            {all
              .filter((id) => !pending.includes(id))
              .map((id) => (
                <li key={id} className="flex items-center gap-2 rounded-[10px] bg-d-sunk/60 px-3 py-2">
                  <PersonChip id={id} sub={id === a.by ? "Author" : "Read"} />
                  <Check className="ml-auto h-3.5 w-3.5 text-d-ok" />
                </li>
              ))}
          </ul>
        </>
      )}
    </Sheet>
  );
}

/* ---------------- Composer ---------------- */

function Composer({ open, onOpenChange, onPost }: { open: boolean; onOpenChange: (o: boolean) => void; onPost: (a: Announcement) => void }) {
  const { me } = useHQ();
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [audience, setAudience] = React.useState<Audience>("Everyone");
  const [pin, setPin] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [draft, setDraft] = React.useState<{ title: string; body: string } | null>(null);
  const seq = React.useRef(0);

  const reset = () => {
    setTitle("");
    setBody("");
    setPin(false);
    setDraft(null);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="New announcement" sub="Posts land in the feed, notify the audience, and track acknowledgements." width={640}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim() || !body.trim()) return;
          seq.current += 1;
          onPost({ id: `A-new${seq.current}`, title: title.trim(), body: body.trim(), by: me.id, at: "Just now", audience, pinned: pin, reactions: {}, acks: [] });
          toast.success(`Posted to ${audience.toLowerCase()}`, { description: `${members(audience).length - 1} people will be asked to acknowledge` });
          reset();
          onOpenChange(false);
        }}
      >
        <Field label="Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's the headline?" className={inputClass} />
        </Field>
        <Field label="Message">
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} placeholder="guys pls make sure every batch 14 lead gets a call asap. new demo flow works really well. use the industry desk first" className={cn(inputClass, "h-auto py-2.5 leading-relaxed")} />
        </Field>

        <div className="flex flex-wrap items-center gap-2">
          <Btn
            size="sm"
            variant="soft"
            icon={Wand2}
            disabled={!body.trim() || busy}
            onClick={() => {
              setBusy(true);
              window.setTimeout(() => {
                setDraft(polish(title, body));
                setBusy(false);
              }, 750);
            }}
          >
            {busy ? "Polishing…" : "AI polish"}
          </Btn>
          <span className="text-[12px] text-d-mute">Rewrites for clarity: one headline, then exactly what each person must do.</span>
        </div>

        {draft && (
          <div className="rounded-[14px] border border-[color-mix(in_oklab,var(--d-gold)_35%,var(--d-line))] bg-[color-mix(in_oklab,var(--d-gold)_7%,var(--d-panel))] p-4">
            <div className="flex items-center justify-between">
              <AIMark label="Polished draft" />
              <span className="font-mono text-[11px] text-d-mute">
                {body.length} → {draft.body.length} chars
              </span>
            </div>
            <p className="mt-2 font-serif text-[18px] font-medium">{draft.title}</p>
            <p className="mt-1 whitespace-pre-line text-[13.5px] leading-relaxed">{draft.body}</p>
            <div className="mt-3 flex gap-2">
              <Btn
                size="sm"
                variant="solid"
                onClick={() => {
                  setTitle(draft.title);
                  setBody(draft.body);
                  setDraft(null);
                  toast("Polished version applied");
                }}
              >
                Use this
              </Btn>
              <Btn size="sm" variant="ghost" onClick={() => setDraft(null)}>
                Keep mine
              </Btn>
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <Field label={`Audience · ${members(audience).length} people`}>
            <Segmented size="sm" value={audience} onChange={setAudience} options={AUDIENCES} />
          </Field>
          <label className="flex h-9 cursor-pointer items-center gap-2 text-[13px]">
            <input type="checkbox" checked={pin} onChange={(e) => setPin(e.target.checked)} className="h-4 w-4 accent-(--d-accent)" />
            Pin to the top
          </label>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-d-line pt-4">
          <span className="flex -space-x-1.5">
            {members(audience)
              .slice(0, 12)
              .map((id) => (
                <PersonAvatar key={id} id={id} size={22} ring />
              ))}
          </span>
          <Btn type="submit" variant="solid" disabled={!title.trim() || !body.trim()}>
            Post announcement
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
