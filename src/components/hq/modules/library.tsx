"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  BookOpen,
  Copy,
  FileText,
  FolderOpen,
  History,
  LayoutGrid,
  Lightbulb,
  List,
  Megaphone,
  MessageSquareQuote,
  Mic,
  Pin,
  PlayCircle,
  Presentation,
  ScrollText,
  Send,
  Share2,
  ShieldQuestion,
  Sparkles,
  Upload,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import {
  AgentNote,
  AIMark,
  Btn,
  Field,
  IconBtn,
  inputClass,
  KV,
  Metric,
  Modal,
  PageHeader,
  Panel,
  PersonAvatar,
  PersonChip,
  Pill,
  SearchBox,
  SectionLabel,
  Segmented,
  Sheet,
} from "../kit";
import { useHQ } from "../store";
import { personById } from "../data";

/* ============================================================
   Library content. Bodies use a tiny markup:
   "## " heading · "- " bullet · "A: "/"C: " script lines (advisor / customer)
   "[mm:ss] " recording chapter · "# n " slide · anything else is a paragraph.
   ============================================================ */

type RType = "Call script" | "Objection handling" | "SOP" | "Onboarding deck" | "Workshop recording" | "Proposal template" | "Case study" | "Ad creative" | "Blueprint";
type Team = "Sales" | "Delivery" | "Marketing" | "Ops" | "Founder";
type Resource = {
  id: string;
  title: string;
  type: RType;
  team: Team;
  owner: string;
  updated: string;
  /** days since update, for sorting */
  age: number;
  uses: number;
  version: number;
  pinned?: boolean;
  collections: string[];
  summary: string;
  meta?: string;
  body: string;
};

const TYPES: { id: RType; icon: LucideIcon }[] = [
  { id: "Call script", icon: Mic },
  { id: "Objection handling", icon: ShieldQuestion },
  { id: "SOP", icon: Workflow },
  { id: "Onboarding deck", icon: Presentation },
  { id: "Workshop recording", icon: PlayCircle },
  { id: "Proposal template", icon: FileText },
  { id: "Case study", icon: MessageSquareQuote },
  { id: "Ad creative", icon: Megaphone },
  { id: "Blueprint", icon: ScrollText },
];
const typeIcon = Object.fromEntries(TYPES.map((t) => [t.id, t.icon])) as Record<RType, LucideIcon>;
const TEAMS: Team[] = ["Sales", "Delivery", "Marketing", "Ops", "Founder"];
const COLLECTIONS = ["Closer's kit", "New-hire week 1", "Batch 15 launch", "Delivery playbook", "Founder's picks"];

const R: Resource[] = [
  {
    id: "R-01", title: "Workshop follow-up call · first 24 hours", type: "Call script", team: "Sales", owner: "rohan", updated: "18 Oct 2026", age: 2, uses: 412, version: 7, pinned: true, collections: ["Closer's kit", "New-hire week 1"],
    summary: "The call every attendee who stayed past Q&A gets within 24 hours. Opens with their own workshop answer, ends with a booked diagnosis.",
    body: `## Before you dial
- Open the attendee's Zoom poll answers and the 'biggest bottleneck' chat line
- Check the CRM score; above 80 goes to Sneha or Rohan
## Opening (first 30 seconds)
A: Namaste {name} ji, Rohan from BuildBiz. You were with us till the end of Day 2 last night, thank you for staying.
A: In the chat you wrote that {pain}. I wanted to understand that properly. Do you have 10 minutes?
C: Haan, boliye.
## Diagnosis
A: If you went on a 10-day holiday tomorrow, what would stop first in your {industry} business?
A: Who approves purchases today? How many WhatsApp groups does your team report in?
A: What does one lost week cost you, roughly, in rupees?
## Bridge
A: What we showed in the workshop is exactly what we build. Let me show you a live command center for a {industry} business like yours, two minutes.
## Close for the next step
A: The Accelerator is ₹74,999 or three EMIs of ₹26,000. Seats for Batch 15 close Friday. Shall I block one and send the payment link on WhatsApp?
- If not ready: book a 30-minute diagnosis with Sneha, same week
- Log outcome in the Calling CRM before the next dial`,
  },
  {
    id: "R-02", title: "Discovery call: Business OS diagnosis", type: "Call script", team: "Sales", owner: "sneha", updated: "15 Oct 2026", age: 5, uses: 238, version: 4, collections: ["Closer's kit"],
    summary: "45-minute diagnosis that maps the owner's bottlenecks to the five Business OS layers and qualifies for Systems or done-for-you.",
    body: `## Agenda (say it out loud)
A: {name} ji, in 45 minutes we'll map where your business depends on you, put a rupee number on it, and decide together if we're a fit.
## The five layers
- Leads: where do they come from, who follows up
- Sales: who closes, how is the pipeline reported
- Delivery: how work moves from order to dispatch
- Money: collections, approvals, cash visibility
- People: who decides when you are not there
## Quantify
A: You said follow-ups slip. Out of 100 enquiries, how many never get a second call?
A: At your average order of ₹{aov}, what is that a month?
## Fit
- Under ₹3 Cr revenue: Accelerator
- ₹3–25 Cr, wants to build in-house: Systems (₹1.5 L)
- ₹10 Cr+, wants it built: done-for-you, hand to Rohan`,
  },
  {
    id: "R-03", title: "Done-for-you build pitch (₹2.4–5.2 L)", type: "Call script", team: "Sales", owner: "rohan", updated: "12 Oct 2026", age: 8, uses: 96, version: 3, collections: ["Closer's kit", "Founder's picks"],
    summary: "How to show the industry demo desk in the first five minutes and walk from pain to milestone-based pricing.",
    body: `## Minute 0–5: show, don't tell
A: Before I explain anything, let me open a command center we built for a {industry} business. This is live.
- Open /industries/{desk} and share screen
- Point at the owner's morning brief and the AI decision queue
## Minute 5–20: their version
A: If this was yours, which three screens would you open every morning?
## Pricing
A: We build it in 6 to 8 weeks. 30% at kickoff, 30% at blueprint sign-off, 30% at UAT, 10% at go-live.
C: Itna budget nahi hai abhi.
A: Understood. Most owners start with the two modules that leak the most money and add the rest after go-live.`,
  },
  {
    id: "R-04", title: "No-show re-book call", type: "Call script", team: "Sales", owner: "imran", updated: "9 Oct 2026", age: 11, uses: 187, version: 2, collections: ["Batch 15 launch"],
    summary: "For registrants who paid ₹51 and never joined. Re-books them into the next batch without discounting.",
    body: `A: Hello {name} ji, Imran from BuildBiz. You'd registered for the Business OS workshop but we missed you on Zoom.
C: Haan, kaam aa gaya tha.
A: Totally understand, that's exactly why owners join. Batch 15 is on 10–11 Nov, 7 PM. Your ₹51 seat carries over. Shall I move it?
- If yes: move in Zoom, send WhatsApp confirmation
- If no: tag 'not now', nurture sequence B`,
  },
  {
    id: "R-05", title: "EMI conversation script", type: "Call script", team: "Sales", owner: "sneha", updated: "17 Oct 2026", age: 3, uses: 154, version: 5, collections: ["Closer's kit"],
    summary: "Offering 3 or 4 EMIs on Accelerator and Systems without making price the conversation.",
    body: `## When they ask about EMI
A: Yes, we do 3 EMIs on the Accelerator: ₹26,000 now, then the 5th of the next two months. No-cost via Razorpay.
A: For Systems it is 4 EMIs of ₹37,500.
## Before you send the link
- Confirm the PAN name matches the payer
- Tell them the auto-debit date out loud
A: The mandate will debit on the 5th. If a date is tight, tell Sahil a week before, we'll shift it.`,
  },
  {
    id: "R-06", title: "Hindi opener for Tier-2 owners", type: "Call script", team: "Sales", owner: "arjun", updated: "6 Oct 2026", age: 14, uses: 121, version: 2, collections: ["New-hire week 1"],
    summary: "A warmer Hindi-first opener that works better in Indore, Nagpur, Ludhiana and Rajkot.",
    body: `A: Namaskar {name} ji, main Arjun bol raha hoon BuildBiz se. Workshop mein aapne kaha tha ki business aapke bina nahi chalta. Sahi pakda?
C: Bilkul sahi.
A: Wahi samajhna tha. Do minute denge? Main aapko dikhata hoon ki {industry} business mein yeh kaise theek hota hai.`,
  },
  {
    id: "R-07", title: "'Price is too high': seven answers", type: "Objection handling", team: "Sales", owner: "rohan", updated: "19 Oct 2026", age: 1, uses: 503, version: 9, pinned: true, collections: ["Closer's kit", "New-hire week 1"],
    summary: "The seven responses that close best on qualified calls, ranked by close rate from the last 400 calls.",
    body: `## 1. Cost of one lost week (31% close)
A: You said one week of the owner away costs about ₹2 lakh. The Accelerator is ₹74,999. It pays back the first time you take a holiday.
## 2. Compare to a hire (24%)
A: An operations manager in your city is ₹45,000 a month. This is less than two months of one hire, and it keeps working.
## 3. EMI reframe (19%)
A: It's ₹26,000 a month for three months. Is the problem the total or the monthly?
## 4. Show a peer's numbers
- Open the Sunita Bansal case study, 14-hour days to 6
## 5. Shrink the first step
A: Start with Launchpad at ₹24,999; the full amount adjusts if you upgrade in 30 days.
## 6. Ask what 'high' means
A: High compared to what? A course, a consultant or doing nothing?
## 7. Walk away politely
A: Then let's not do it now. I'll check in after Diwali.`,
  },
  {
    id: "R-08", title: "'Let me talk to my partner'", type: "Objection handling", team: "Sales", owner: "sneha", updated: "14 Oct 2026", age: 6, uses: 211, version: 3, collections: ["Closer's kit"],
    summary: "Get the partner, brother or CA onto a second call instead of losing the deal to a WhatsApp forward.",
    body: `A: Of course. Who else decides with you, your brother, your CA?
A: Instead of you explaining it, can we do 20 minutes together tomorrow at 7 PM? I'll show the same demo desk.
- Send the calendar invite while still on the call
- Never send the brochure PDF as a substitute`,
  },
  {
    id: "R-09", title: "'My business is different'", type: "Objection handling", team: "Sales", owner: "arjun", updated: "10 Oct 2026", age: 10, uses: 167, version: 2, collections: ["Closer's kit"],
    summary: "Answer with the 26 industry desks: open theirs and let it do the talking.",
    body: `A: You're right, a {industry} business has its own rhythm. That's why we have a desk for each of 26 industries. Let me open yours.
- Pick the closest desk; textile, pharma, dental, realty, restaurant convert best
A: What on this screen doesn't match how you work? Let's note it; that's what we tailor.`,
  },
  {
    id: "R-10", title: "'My staff won't use AI'", type: "Objection handling", team: "Sales", owner: "kavya", updated: "8 Oct 2026", age: 12, uses: 88, version: 2, collections: [],
    summary: "Most staff never touch the AI; they use WhatsApp. Show the WhatsApp-first flow.",
    body: `A: Your team won't need to learn anything new. They keep using WhatsApp. The agents read those messages and update the dashboard for you.
- Show the 'reply YES to approve' trims PO flow from the textile desk`,
  },
  {
    id: "R-11", title: "'I've done courses before'", type: "Objection handling", team: "Sales", owner: "rohan", updated: "4 Oct 2026", age: 16, uses: 143, version: 3, collections: ["Closer's kit"],
    summary: "Separate BuildBiz from motivation courses: we leave a working system behind.",
    body: `A: What did you get from the last one? Notes or a system that runs on Monday morning?
A: At the end of the Accelerator you have a working command center for your business, not a certificate.`,
  },
  {
    id: "R-12", title: "SOP: Workshop day run-of-show", type: "SOP", team: "Ops", owner: "aditya", updated: "16 Oct 2026", age: 4, uses: 64, version: 11, pinned: true, collections: ["Batch 15 launch", "New-hire week 1"],
    summary: "Minute-by-minute for both workshop days: Zoom, moderators, polls, offers and the post-session calling sprint.",
    body: `## T-24 hours
- Zoom webinar practice session on; panelists Amit, Neha, Priya
- WhatsApp reminder template 'session_reminder_hi' to all registrants
## T-1 hour (6:00 PM IST)
- Reminder with join link, second blast at 6:45 PM
- Imran and Kavya on Q&A, Priya on chat in Hindi
## 7:00 PM start
- 7:05 poll 1: revenue band
- 8:10 poll 2: biggest bottleneck (feeds the Lead Qualifier)
- 9:15 offer, payment links pinned in chat
## After 9:45 PM
- Recording auto-uploads to portal by 11:30 PM
- Every attendee past Q&A gets a call within 24 hours
- Blueprint pack goes out at 11:30 PM`,
  },
  {
    id: "R-13", title: "SOP: Student onboarding in 24 hours", type: "SOP", team: "Delivery", owner: "priya", updated: "18 Oct 2026", age: 2, uses: 88, version: 6, pinned: true, collections: ["Delivery playbook", "New-hire week 1"],
    summary: "From Razorpay 'paid' to a student who can join the next live session: five access items, one welcome call.",
    body: `## Within 1 hour of payment
- Onboarding agent sends portal invite, Zoom link, Circle invite and cohort WhatsApp group
- Check Access Readiness: all five items green
## Within 24 hours
- Priya's 15-minute welcome call: goals, best session time, preferred language
- Blueprint pack (48 pages) by email and WhatsApp
## If anything fails
- Bounced email: match against the Razorpay receipt
- Wrong number: match against the CRM lead record
- Log every correction on the student profile`,
  },
  {
    id: "R-14", title: "SOP: Refunds and failed EMIs", type: "SOP", team: "Ops", owner: "sahil", updated: "11 Oct 2026", age: 9, uses: 41, version: 4, collections: [],
    summary: "7-day refund window, failed auto-debit handling and when to pause access.",
    body: `## Failed auto-debit
- Day 0: collections agent sends a Razorpay UPI link on WhatsApp
- Day 3: Sahil calls
- Day 10: access paused, coach informed
## Refunds
- Full refund within 7 days of the first live session
- Founder approval above ₹50,000`,
  },
  {
    id: "R-15", title: "SOP: Client build kickoff", type: "SOP", team: "Delivery", owner: "neha", updated: "13 Oct 2026", age: 7, uses: 23, version: 3, collections: ["Delivery playbook"],
    summary: "Kickoff checklist for done-for-you builds: contacts, data access, demo desk baseline and milestone 1 invoice.",
    body: `## Before the kickoff call
- Milestone 1 (30%) invoice paid
- Pick the baseline demo desk from /industries
## In the call
- Name the decision maker and one day-to-day owner
- Collect Tally export, WhatsApp group exports, price lists
## After
- Build channel created, client added
- Discovery summary sent within 48 hours`,
  },
  {
    id: "R-16", title: "SOP: UAT and go-live cut-over", type: "SOP", team: "Delivery", owner: "vikram", updated: "17 Oct 2026", age: 3, uses: 19, version: 5, collections: ["Delivery playbook"],
    summary: "Test cases, client sign-off, data freeze and the go-live morning, as run on Care Dental and Balaji.",
    body: `## UAT week
- Every module gets 3–6 test cases, client signs each one
- Train the client's staff in their language; record it
## T-1 day
- Data freeze 6 PM, final Tally sync
- Rollback plan written in the build channel
## Go-live morning
- 7 AM checks, 9 AM switch on
- Owner morning brief must arrive at 8 AM on day one
- Hypercare for 30 days`,
  },
  {
    id: "R-17", title: "SOP: Lead qualification and routing", type: "SOP", team: "Sales", owner: "imran", updated: "19 Oct 2026", age: 1, uses: 72, version: 8, collections: ["New-hire week 1"],
    summary: "How the Lead Qualifier scores leads and who gets what. Above 80 goes to a closer within 2 hours.",
    body: `- Score above 80: Rohan or Sneha within 2 hours
- 60–80: Arjun or Kavya same day
- Under 60: nurture sequence, Imran reviews weekly
- Workshop attendance adds 15 points, decision maker adds 10`,
  },
  {
    id: "R-18", title: "SOP: Daily report by 7 PM", type: "SOP", team: "Ops", owner: "aditya", updated: "1 Oct 2026", age: 19, uses: 310, version: 2, collections: ["New-hire week 1"],
    summary: "What goes into the daily report, the AI draft, and the 7 PM IST cut-off.",
    body: `- Open Daily Reporting; the AI drafts it from your calls, tasks and messages
- Edit the numbers, add one blocker and one win
- Submit by 7 PM IST; Amit reads them at 9 PM`,
  },
  {
    id: "R-19", title: "New business advisor: week 1", type: "Onboarding deck", team: "Sales", owner: "rohan", updated: "2 Oct 2026", age: 18, uses: 34, version: 3, collections: ["New-hire week 1"], meta: "24 slides",
    summary: "The offer ladder, the ICP, the calling CRM and the first five calls you shadow.",
    body: `# 1 Welcome to BuildBiz sales
# 2 Who we serve: Indian SME owners, ₹1–50 Cr
# 3 The offer ladder: ₹51 → ₹24,999 → ₹74,999 → ₹1.5 L → ₹2.5 L → done-for-you
# 4 Day 1: shadow Rohan, 20 calls
# 5 Day 3: your first 30 dials
# 6 What a good call sounds like (recording)`,
  },
  {
    id: "R-20", title: "Delivery team handbook", type: "Onboarding deck", team: "Delivery", owner: "neha", updated: "28 Sep 2026", age: 22, uses: 18, version: 2, collections: ["Delivery playbook"], meta: "31 slides",
    summary: "How we build client command centers: stages, hours, roles and the quality bar.",
    body: `# 1 Discovery → Blueprint → Build → UAT → Go-live → Live
# 2 Weekly hours per stage
# 3 Using the 26 industry desks as the baseline
# 4 Client communication rhythm: weekly WhatsApp update
# 5 What 'done' means`,
  },
  {
    id: "R-21", title: "Accelerator student welcome deck", type: "Onboarding deck", team: "Delivery", owner: "priya", updated: "14 Oct 2026", age: 6, uses: 140, version: 4, collections: ["Batch 15 launch"], meta: "18 slides",
    summary: "Shown on the first live session: how the 8 weeks run, where everything lives, how to get help.",
    body: `# 1 Namaste, Batch 14!
# 2 Wednesdays 8 PM IST, 8 weeks
# 3 Portal, Circle, WhatsApp group: what goes where
# 4 Your coach and office hours
# 5 Week 1 homework: the delegation map`,
  },
  {
    id: "R-22", title: "The BuildBiz story (Amit)", type: "Onboarding deck", team: "Founder", owner: "amit", updated: "20 Sep 2026", age: 30, uses: 61, version: 2, collections: ["Founder's picks", "New-hire week 1"], meta: "12 slides",
    summary: "Why Dr. Amit Moga started BuildBiz and what we will never do.",
    body: `# 1 From clinic to command centers
# 2 The owner who couldn't take a holiday
# 3 Our promise: a business that runs without you
# 4 What we will never do: sell motivation`,
  },
  {
    id: "R-23", title: "Batch 14 · Day 1 recording", type: "Workshop recording", team: "Founder", owner: "amit", updated: "13 Oct 2026", age: 7, uses: 1876, version: 1, pinned: true, collections: ["Batch 15 launch"], meta: "2h 41m · 1,248 registered",
    summary: "Business Operating System, Day 1. Strongest segment: the 10-day holiday test at 00:42.",
    body: `[00:00] Welcome and why we're here
[00:18] The owner trap: 14-hour days
[00:42] The 10-day holiday test
[01:05] The five layers of a Business OS
[01:48] Live: a textile command center
[02:20] Homework and Day 2 preview`,
  },
  {
    id: "R-24", title: "Batch 14 · Day 2 recording", type: "Workshop recording", team: "Founder", owner: "amit", updated: "14 Oct 2026", age: 6, uses: 1402, version: 1, collections: ["Batch 15 launch"], meta: "2h 58m",
    summary: "Day 2: delegation, AI agents, the offer. 61% stayed to the offer at 02:15.",
    body: `[00:00] Recap of the holiday test answers
[00:25] Delegation map, live
[01:10] AI agents that follow up for you
[01:52] Student stories: Sunita, Harish
[02:15] The programs and Batch 15
[02:40] Q&A`,
  },
  {
    id: "R-25", title: "Batch 13 · Q&A highlights", type: "Workshop recording", team: "Sales", owner: "rohan", updated: "22 Sep 2026", age: 28, uses: 233, version: 1, collections: ["Closer's kit"], meta: "24m",
    summary: "The twelve questions owners ask most, with Amit's answers. Great before your first calls.",
    body: `[00:00] 'Will this work for a family business?'
[03:40] 'My staff are not educated'
[08:15] 'What about Tally?'
[13:30] 'How is this different from a CRM?'
[19:05] 'Can I pay in EMI?'`,
  },
  {
    id: "R-26", title: "Keynote: 'A business that runs without you'", type: "Workshop recording", team: "Founder", owner: "amit", updated: "5 Sep 2026", age: 45, uses: 3120, version: 1, collections: ["Founder's picks"], meta: "38m · Mumbai SME Summit",
    summary: "Amit's stage keynote. Clips from it run in three of our best ads.",
    body: `[00:00] The question nobody asks owners
[06:20] Three businesses, one bottleneck
[18:45] What a command center looks like
[31:10] The holiday test`,
  },
  {
    id: "R-27", title: "Agent Factory · Module 3 live build", type: "Workshop recording", team: "Delivery", owner: "vikram", updated: "10 Oct 2026", age: 10, uses: 87, version: 1, collections: [], meta: "1h 52m",
    summary: "Vikram builds a payment follow-up agent end to end on WhatsApp.",
    body: `[00:00] What the agent should do
[14:30] Connecting WhatsApp (Interakt)
[48:00] Prompting for Hinglish replies
[1:20:00] Testing with real overdue invoices`,
  },
  {
    id: "R-28", title: "Delegation masterclass (Hindi)", type: "Workshop recording", team: "Delivery", owner: "priya", updated: "1 Oct 2026", age: 19, uses: 412, version: 1, collections: ["Batch 15 launch"], meta: "1h 05m",
    summary: "Hindi version of the delegation session for Tier-2 cohorts. Highest completion rate of any recording.",
    body: `[00:00] Kaam kisko dein?
[12:00] Delegation map banana
[35:00] Follow-up bina pooche
[52:00] Sawaal-jawaab`,
  },
  {
    id: "R-29", title: "Done-for-you proposal", type: "Proposal template", team: "Sales", owner: "rohan", updated: "16 Oct 2026", age: 4, uses: 41, version: 6, pinned: true, collections: ["Closer's kit"], meta: "Google Doc · 9 pages",
    summary: "Proposal for custom command center builds. Milestone-based, with the demo desk screenshots.",
    body: `## 1. What we heard
{client}'s owner spends most days approving, chasing and reporting.
## 2. What we'll build
- Module 1, 2, 3 tailored from the {industry} desk
## 3. Timeline
- 6 to 8 weeks, go-live date fixed at blueprint sign-off
## 4. Investment
- 30% kickoff · 30% blueprint · 30% UAT · 10% go-live, plus GST
## 5. After go-live
- 30 days hypercare, then optional support retainer`,
  },
  {
    id: "R-30", title: "AI Business Systems proposal (₹1.5 L)", type: "Proposal template", team: "Sales", owner: "sneha", updated: "9 Oct 2026", age: 11, uses: 57, version: 3, collections: ["Closer's kit"], meta: "Google Doc · 4 pages",
    summary: "For owners who want to build in-house with our coaching. Includes 4-EMI plan.",
    body: `## Program
- 12 weeks, live build sessions, coach per student
## Fee
- ₹1,49,999 or 4 EMIs of ₹37,500`,
  },
  {
    id: "R-31", title: "Corporate team workshop quote", type: "Proposal template", team: "Sales", owner: "rohan", updated: "26 Sep 2026", age: 24, uses: 12, version: 1, collections: [], meta: "1 page",
    summary: "In-person or Zoom workshop for a company's managers, 20–60 people.",
    body: `- Half-day: ₹1.2 L · full day: ₹2 L, plus travel outside Mumbai`,
  },
  {
    id: "R-32", title: "Change request estimate", type: "Proposal template", team: "Delivery", owner: "vikram", updated: "12 Oct 2026", age: 8, uses: 29, version: 2, collections: ["Delivery playbook"], meta: "Sheet",
    summary: "Hours × ₹2,000 standard rate, approval line for the client.",
    body: `- Describe the change in the client's words
- Hours estimate (AI suggests from past CRs)
- Cost = hours × ₹2,000 + GST
- Client approval on WhatsApp`,
  },
  {
    id: "R-33", title: "Care Dental: 41 patients back in 11 days", type: "Case study", team: "Marketing", owner: "meera", updated: "19 Oct 2026", age: 1, uses: 66, version: 2, collections: ["Closer's kit", "Founder's picks"],
    summary: "Recall reminders on the live chair map brought back ₹3.1 L of treatments within two weeks of go-live.",
    body: `## Problem
Dr. Swati Kulkarni's Pune clinic lost track of recalls; the front desk used a paper register.
## What we built
- Live chair map, recall reminders at 10 AM, billing
## Results
- 41 recalled patients in 11 days
- ₹3.1 L of treatments booked
- Front desk saves 2 hours a day`,
  },
  {
    id: "R-34", title: "Balaji Distributors: 23 salesmen on one beat map", type: "Case study", team: "Marketing", owner: "meera", updated: "8 Oct 2026", age: 12, uses: 38, version: 1, collections: [],
    summary: "Nagpur FMCG distributor replaced 11 WhatsApp groups with the beat route desk.",
    body: `## Problem
11 WhatsApp groups, no van stock view, collections chased by the owner.
## Results (UAT data)
- Van stock variance down from 4.2% to 0.6%
- Collections cycle 38 days → 26 days`,
  },
  {
    id: "R-35", title: "Kaveri Weaves: TNA calendar in Surat", type: "Case study", team: "Marketing", owner: "meera", updated: "3 Oct 2026", age: 17, uses: 27, version: 1, collections: [],
    summary: "Every style order against its buyer date. Late shipments down 60% in staging.",
    body: `- 46 styles tracked against buyer dates
- Trims POs approved from the owner's WhatsApp
- Late shipments down 60% in the first month`,
  },
  {
    id: "R-36", title: "Sunita Bansal: from 14-hour days to 6", type: "Case study", team: "Marketing", owner: "meera", updated: "17 Oct 2026", age: 3, uses: 194, version: 3, pinned: true, collections: ["Closer's kit", "Batch 15 launch"],
    summary: "Accelerator graduate, Jaipur garment unit. The story we use most on price objections.",
    body: `## Before
Sunita approved every purchase and every leave. 14-hour days, no holiday in 3 years.
## After the Accelerator
- Delegation map with two managers
- WhatsApp approvals under ₹25,000 handled by her manager
- Took a 9-day family holiday in August
## Quote
"Pehli baar business mere bina chala, aur better chala."`,
  },
  {
    id: "R-37", title: "Apollo Pharma: expiry radar saves ₹6.2 L", type: "Case study", team: "Marketing", owner: "meera", updated: "20 Oct 2026", age: 0, uses: 4, version: 1, collections: [],
    summary: "Draft. Indore pharma distributor; projected savings from 90-day expiry flags.",
    body: `- Draft pending go-live numbers (go-live 21 Oct)
- Projected ₹6.2 L/yr saved on expired stock returns`,
  },
  {
    id: "R-38", title: "'I can't take a holiday' owner video", type: "Ad creative", team: "Marketing", owner: "meera", updated: "13 Oct 2026", age: 7, uses: 24, version: 3, pinned: true, collections: ["Batch 15 launch"], meta: "Reel 9:16 · CPL ₹38 · CTR 2.9%",
    summary: "Best ad we've run. Owners 35–55, Tier 1 and 2. Scaling to ₹45k/day.",
    body: `## Hook (0–3s)
"Teen saal se maine chhutti nahi li."
## Body
Owner walks through his empty factory on a Sunday; phone keeps buzzing.
## Offer
2-day Business OS workshop, ₹51. Batch 15: 10–11 Nov, 7 PM IST.
## Results (last 14 days)
- Spend ₹4.1 L · 10,780 registrations · CPL ₹38
- Show-up rate 58%`,
  },
  {
    id: "R-39", title: "Carousel: 5 signs your business depends on you", type: "Ad creative", team: "Marketing", owner: "meera", updated: "2 Oct 2026", age: 18, uses: 24, version: 2, collections: [], meta: "Carousel · CPL ₹61",
    summary: "Good saves, weaker registrations. Use for retargeting.",
    body: `- 1. Every approval comes to you
- 2. Your phone is the CRM
- 3. Holiday = business stops
- 4. Staff wait instead of decide
- 5. You don't know today's cash`,
  },
  {
    id: "R-40", title: "Reel: Surat textile owner testimonial", type: "Ad creative", team: "Marketing", owner: "meera", updated: "9 Oct 2026", age: 11, uses: 9, version: 1, collections: [], meta: "Reel · CPL ₹44",
    summary: "Gujarati with Hindi subtitles; strong in Surat and Ahmedabad.",
    body: `## Hook
"Mara business ma have hu na hou toh pan kaam chale chhe."
## Results
- CPL ₹44 in Gujarat, ₹71 elsewhere`,
  },
  {
    id: "R-41", title: "Static: ₹51 workshop, 2 days", type: "Ad creative", team: "Marketing", owner: "meera", updated: "29 Sep 2026", age: 21, uses: 11, version: 4, collections: ["Batch 15 launch"], meta: "1:1 static · CPL ₹52",
    summary: "Evergreen static, cheap to run. Amit on stage, price and dates.",
    body: `- Headline: "Build a business that runs without you"
- ₹51 · 2 evenings · 7 PM IST
- CTA: Reserve your seat`,
  },
  {
    id: "R-42", title: "Business OS blueprint pack", type: "Blueprint", team: "Founder", owner: "amit", updated: "12 Oct 2026", age: 8, uses: 2240, version: 5, pinned: true, collections: ["Batch 15 launch", "Founder's picks"], meta: "PDF · 48 pages",
    summary: "The pack every workshop attendee gets at 11:30 PM after Day 2.",
    body: `## Contents
- The 10-day holiday test
- Five-layer Business OS map
- Delegation map worksheet
- 30 automations to start with
- Your command center sketch`,
  },
  {
    id: "R-43", title: "Distributor command center blueprint", type: "Blueprint", team: "Delivery", owner: "vikram", updated: "7 Oct 2026", age: 13, uses: 31, version: 3, collections: ["Delivery playbook"], meta: "Figma + doc",
    summary: "Baseline for FMCG and pharma distributor builds: beats, van stock, credit, schemes.",
    body: `- Screens: owner brief, beat route, van stock, collections, schemes
- Integrations: Tally, Interakt WhatsApp, Busy
- Agents: collections follow-up, stock reorder`,
  },
  {
    id: "R-44", title: "Clinic command center blueprint", type: "Blueprint", team: "Delivery", owner: "vikram", updated: "25 Sep 2026", age: 25, uses: 14, version: 2, collections: ["Delivery playbook"], meta: "Figma + doc",
    summary: "From the Care Dental build: chair map, recalls, billing, lab work.",
    body: `- Screens: chair map, recall queue, billing, lab tracker
- Agents: recall reminders, review requests`,
  },
  {
    id: "R-45", title: "Delegation map worksheet", type: "Blueprint", team: "Delivery", owner: "priya", updated: "11 Oct 2026", age: 9, uses: 980, version: 4, collections: ["Batch 15 launch", "New-hire week 1"], meta: "PDF · 3 pages",
    summary: "Week 1 homework. List every decision you make for a week; mark who could make it.",
    body: `## Step 1
List every decision you make for 5 days.
## Step 2
Mark each: only me / my manager could / a rule could.
## Step 3
Pick three to hand over this week.`,
  },
];

const VERSIONS = (r: Resource) =>
  Array.from({ length: Math.min(4, r.version) }, (_, i) => ({
    v: r.version - i,
    when: i === 0 ? r.updated : `${Math.max(1, 28 - i * 6 - (r.age % 5))} ${i > 1 ? "Aug" : "Sep"} 2026`,
    by: i % 2 === 0 ? r.owner : "aditya",
    note: ["Tightened the close; added EMI line", "New numbers from last 400 calls", "Hindi version added", "First version"][i] ?? "Edits",
  }));

/* ---------------- ask the library ---------------- */

type Answer = { q: string; parts: { text: string; cite?: string }[]; cites: string[]; missing?: boolean };

const CANNED: { match: RegExp; q: string; parts: Answer["parts"] }[] = [
  {
    match: /price|expensive|costly|mehenga|too high/i,
    q: "How do I answer 'price is too high' on the Accelerator?",
    parts: [
      { text: "Lead with the cost of one lost week: if the owner says a week away costs ₹2 lakh, ₹74,999 pays back on the first holiday. It closes 31% of the time.", cite: "R-07" },
      { text: " If the monthly number is the worry, reframe to 3 no-cost EMIs of ₹26,000 and confirm the 5th-of-month debit date out loud.", cite: "R-05" },
      { text: " Then show a peer: Sunita Bansal went from 14-hour days to 6 and took a 9-day holiday.", cite: "R-36" },
    ],
  },
  {
    match: /onboard|after (someone|they) pay|paid|welcome/i,
    q: "What happens after a student pays?",
    parts: [
      { text: "Within an hour the onboarding agent sends the portal invite, Zoom link, Circle invite and cohort WhatsApp group; all five items must be green in Access Readiness.", cite: "R-13" },
      { text: " Priya does a 15-minute welcome call within 24 hours and the first session opens with the welcome deck.", cite: "R-21" },
      { text: " Week 1 homework is the delegation map.", cite: "R-45" },
    ],
  },
  {
    match: /\b(ads?|creatives?|cpl|campaigns?)\b/i,
    q: "Which ad creative has the lowest CPL?",
    parts: [
      { text: "The 'I can't take a holiday' owner reel: ₹38 CPL, 2.9% CTR, 10,780 registrations on ₹4.1 L in 14 days.", cite: "R-38" },
      { text: " The Surat testimonial reel is next at ₹44 but only inside Gujarat.", cite: "R-40" },
      { text: " The ₹51 static is the cheapest evergreen at ₹52.", cite: "R-41" },
    ],
  },
  {
    match: /go-?live|cut-?over|uat|launch a client/i,
    q: "How do we run a client go-live?",
    parts: [
      { text: "UAT week: 3–6 signed test cases per module and staff training in their language. T-1: data freeze at 6 PM and a written rollback plan. Go-live: 7 AM checks, 9 AM switch-on, owner brief must land at 8 AM on day one.", cite: "R-16" },
      { text: " Every build starts from its industry desk baseline set at kickoff.", cite: "R-15" },
    ],
  },
];

function tokens(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9₹ ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !["the", "and", "for", "how", "what", "who", "our", "with", "does", "when", "should", "this", "that", "from", "are", "you"].includes(w));
}

function answer(q: string, lib: Resource[]): Answer {
  const canned = CANNED.find((c) => c.match.test(q));
  if (canned) return { q, parts: canned.parts, cites: [...new Set(canned.parts.map((p) => p.cite).filter(Boolean) as string[])] };
  const words = tokens(q);
  const scored = lib
    .map((r) => {
      const hay = `${r.title} ${r.summary} ${r.body}`.toLowerCase();
      const score = words.reduce((a, w) => a + (r.title.toLowerCase().includes(w) ? 3 : 0) + (hay.includes(w) ? 1 : 0), 0);
      return { r, score };
    })
    .filter((x) => x.score > 1)
    .sort((a, b) => b.score - a.score || b.r.uses - a.r.uses)
    .slice(0, 3);
  if (!scored.length) return { q, parts: [{ text: "Nothing in the library covers that yet." }], cites: [], missing: true };
  const parts = scored.map(({ r }, i) => {
    const line =
      r.body
        .split("\n")
        .map((l) => l.replace(/^(## |- |A: |C: |\[[\d:]+\] |# \d+ )/, "").trim())
        .find((l) => words.some((w) => l.toLowerCase().includes(w)) && l.length > 20) ?? r.summary;
    return { text: `${i === 0 ? "" : " "}${line.endsWith(".") ? line : `${line}.`}`, cite: r.id };
  });
  return { q, parts, cites: scored.map((x) => x.r.id) };
}

/* ============================================================ */

export default function ResourceLibrary() {
  const hq = useHQ();
  const [lib, setLib] = React.useState<Resource[]>(R);
  const [q, setQ] = React.useState("");
  const [type, setType] = React.useState<RType | "All">("All");
  const [team, setTeam] = React.useState<Team | "All">("All");
  const [collection, setCollection] = React.useState<string | null>(null);
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [sort, setSort] = React.useState<"used" | "recent">("used");
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [upload, setUpload] = React.useState(false);

  React.useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("open");
    if (!id) return;
    const t = window.setTimeout(() => setOpenId(id), 0);
    return () => window.clearTimeout(t);
  }, []);

  const needle = q.trim().toLowerCase();
  const shown = lib
    .filter((r) => (type === "All" || r.type === type) && (team === "All" || r.team === team) && (!collection || (collection === "Pinned" ? r.pinned : r.collections.includes(collection))))
    .filter((r) => !needle || `${r.title} ${r.summary} ${r.body} ${r.type} ${personById[r.owner]?.name}`.toLowerCase().includes(needle))
    .sort((a, b) => (sort === "used" ? b.uses - a.uses : a.age - b.age));
  const open = lib.find((r) => r.id === openId) ?? null;
  const pinned = lib.filter((r) => r.pinned);

  function togglePin(id: string) {
    setLib((cur) => cur.map((r) => (r.id === id ? { ...r, pinned: !r.pinned } : r)));
  }
  function toggleCollection(id: string, c: string) {
    setLib((cur) => cur.map((r) => (r.id === id ? { ...r, collections: r.collections.includes(c) ? r.collections.filter((x) => x !== c) : [...r.collections, c] } : r)));
  }

  return (
    <div>
      <PageHeader
        kicker="Intelligence"
        icon={BookOpen}
        title="Resource Library"
        sub="Scripts, objection handling, SOPs, decks, workshop recordings, proposals, case studies, ad creatives and blueprints. Ask it a question and it answers from what we've written, with sources."
        actions={
          <>
            <Btn icon={Share2} onClick={() => toast.success("Library link copied", { description: "Team members with HQ access can open it" })}>
              Share
            </Btn>
            <Btn variant="solid" icon={Upload} onClick={() => setUpload(true)}>
              Upload
            </Btn>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label="Resources" value={lib.length} hint={`${TYPES.length} types · ${TEAMS.length} teams`} />
        <Metric label="Opened this week" value="1,384" delta="+22%" hint="Batch 14 week" />
        <Metric label="Most used" value={[...lib].sort((a, b) => b.uses - a.uses)[0].uses.toLocaleString("en-IN")} hint={[...lib].sort((a, b) => b.uses - a.uses)[0].title} />
        <Metric label="Stale (60d+)" value={0} hint="Agent flags anything not updated in 60 days" />
      </div>

      <AskLibrary lib={lib} onOpen={setOpenId} />

      <div className="mt-5 grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <Panel title="Pinned" icon={Pin} bodyClassName="p-3 pt-2">
            <ul>
              {pinned.map((r) => {
                const Icon = typeIcon[r.type];
                return (
                  <li key={r.id}>
                    <button type="button" onClick={() => setOpenId(r.id)} className="flex w-full items-center gap-2 rounded-[8px] px-2 py-1.5 text-left text-[12.5px] hover:bg-d-sunk">
                      <Icon className="h-3.5 w-3.5 shrink-0 text-d-mute" />
                      <span className="truncate">{r.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Panel>
          <Panel title="Collections" icon={FolderOpen} bodyClassName="p-3 pt-2">
            <ul>
              {["Pinned", ...COLLECTIONS].map((c) => {
                const n = c === "Pinned" ? pinned.length : lib.filter((r) => r.collections.includes(c)).length;
                const on = collection === c;
                return (
                  <li key={c}>
                    <button type="button" onClick={() => setCollection(on ? null : c)} className={`flex w-full items-center justify-between rounded-[8px] px-2 py-1.5 text-left text-[12.5px] ${on ? "bg-d-accent text-d-accent-ink" : "hover:bg-d-sunk"}`}>
                      <span className="truncate">{c}</span>
                      <span className={`font-mono text-[11px] ${on ? "opacity-80" : "text-d-mute"}`}>{n}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Panel>
          <Panel title="By team" bodyClassName="p-3 pt-2">
            <ul>
              {TEAMS.map((t) => (
                <li key={t}>
                  <button type="button" onClick={() => setTeam(team === t ? "All" : t)} className={`flex w-full items-center justify-between rounded-[8px] px-2 py-1.5 text-left text-[12.5px] ${team === t ? "bg-d-soft font-semibold text-d-accent" : "hover:bg-d-sunk"}`}>
                    {t}
                    <span className="font-mono text-[11px] text-d-mute">{lib.filter((r) => r.team === t).length}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <SearchBox value={q} onChange={setQ} placeholder="Search titles, scripts and SOP text" className="w-full sm:w-80" />
            <Segmented size="sm" value={team} onChange={setTeam} options={["All", ...TEAMS] as const} />
            <div className="ml-auto flex items-center gap-2">
              <Segmented size="sm" value={sort} onChange={setSort} options={[{ value: "used", label: "Most used" }, { value: "recent", label: "Recent" }]} />
              <IconBtn icon={LayoutGrid} label="Grid view" active={view === "grid"} onClick={() => setView("grid")} />
              <IconBtn icon={List} label="List view" active={view === "list"} onClick={() => setView("list")} />
            </div>
          </div>
          <div className="desk-noscroll mt-3 flex gap-1.5 overflow-x-auto pb-1">
            {(["All", ...TYPES.map((t) => t.id)] as const).map((t) => {
              const on = type === t;
              const Icon = t === "All" ? BookOpen : typeIcon[t];
              const n = t === "All" ? lib.length : lib.filter((r) => r.type === t).length;
              return (
                <button key={t} type="button" onClick={() => setType(t)} className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[12.5px] ${on ? "border-d-accent bg-d-accent text-d-accent-ink" : "border-d-line bg-d-panel hover:bg-d-sunk"}`}>
                  <Icon className="h-3.5 w-3.5" />
                  {t}
                  <span className={`font-mono text-[11px] ${on ? "opacity-80" : "text-d-mute"}`}>{n}</span>
                </button>
              );
            })}
          </div>
          <p className="mb-3 mt-3 text-[12px] text-d-mute">
            {shown.length} resource{shown.length === 1 ? "" : "s"}
            {collection && ` in ${collection}`}
            {(collection || type !== "All" || team !== "All" || q) && (
              <button
                type="button"
                className="ml-2 font-medium text-d-accent hover:underline"
                onClick={() => {
                  setCollection(null);
                  setType("All");
                  setTeam("All");
                  setQ("");
                }}
              >
                Clear filters
              </button>
            )}
          </p>

          {shown.length === 0 && <p className="rounded-xl border border-dashed border-d-line px-4 py-10 text-center text-[13px] text-d-mute">Nothing matches. Try asking the library instead.</p>}

          {view === "grid" ? (
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
              {shown.map((r) => {
                const Icon = typeIcon[r.type];
                return (
                  <div key={r.id} className="desk-card desk-rise group relative flex flex-col p-4">
                    <button type="button" onClick={() => togglePin(r.id)} aria-label={r.pinned ? "Unpin" : "Pin"} className={`absolute right-3 top-3 rounded-md p-1 ${r.pinned ? "text-[var(--d-gold)]" : "text-d-mute opacity-0 group-hover:opacity-100"} hover:bg-d-sunk`}>
                      <Pin className="h-3.5 w-3.5" fill={r.pinned ? "currentColor" : "none"} />
                    </button>
                    <button type="button" onClick={() => setOpenId(r.id)} className="flex flex-1 flex-col text-left">
                      <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-d-mute">
                        <Icon className="h-3.5 w-3.5 text-d-accent" />
                        {r.type}
                      </span>
                      <span className="mt-2 pr-5 font-serif text-[17.5px] font-medium leading-snug">{r.title}</span>
                      <span className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-d-mute">{r.summary}</span>
                      {r.meta && <span className="mt-2 font-mono text-[11px] text-d-mute">{r.meta}</span>}
                      <span className="mt-auto flex items-center justify-between pt-3 text-[11.5px] text-d-mute">
                        <span className="inline-flex items-center gap-1.5">
                          <PersonAvatar id={r.owner} size={20} /> {personById[r.owner]?.first} · {r.updated}
                        </span>
                        <span className="tnum font-mono">{r.uses.toLocaleString("en-IN")} uses</span>
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="desk-card overflow-x-auto px-5 py-2">
              <table className="w-full min-w-[720px] text-[13px]">
                <thead>
                  <tr className="border-b border-d-line text-left text-[11.5px] text-d-mute">
                    <th className="py-2 font-medium">Title</th>
                    <th className="py-2 font-medium">Type</th>
                    <th className="py-2 font-medium">Team</th>
                    <th className="py-2 font-medium">Owner</th>
                    <th className="py-2 font-medium">Updated</th>
                    <th className="py-2 text-right font-medium">Uses</th>
                    <th className="py-2 text-right font-medium">Ver.</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {shown.map((r) => (
                    <tr key={r.id} onClick={() => setOpenId(r.id)} className="cursor-pointer border-b border-d-line/70 last:border-0 hover:bg-d-sunk/60">
                      <td className="py-2.5 pr-3 font-medium">{r.title}</td>
                      <td className="py-2.5 pr-3 text-d-mute">{r.type}</td>
                      <td className="py-2.5 pr-3">
                        <Pill>{r.team}</Pill>
                      </td>
                      <td className="py-2.5 pr-3">
                        <PersonAvatar id={r.owner} size={22} />
                      </td>
                      <td className="whitespace-nowrap py-2.5 pr-3 text-d-mute">{r.updated}</td>
                      <td className="tnum py-2.5 text-right font-mono">{r.uses.toLocaleString("en-IN")}</td>
                      <td className="tnum py-2.5 text-right font-mono text-d-mute">v{r.version}</td>
                      <td className="py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <button type="button" onClick={() => togglePin(r.id)} aria-label="Pin" className={r.pinned ? "text-[var(--d-gold)]" : "text-d-mute"}>
                          <Pin className="h-3.5 w-3.5" fill={r.pinned ? "currentColor" : "none"} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Preview resource={open} onClose={() => setOpenId(null)} onPin={togglePin} onCollection={toggleCollection} onOpen={setOpenId} lib={lib} />

      <Modal open={upload} onOpenChange={setUpload} title="Upload to the library" sub="The librarian agent reads the file, suggests type, team and collections, and indexes it for Ask." width={560}>
        <UploadForm
          onDone={(r) => {
            setLib((cur) => [r, ...cur]);
            setUpload(false);
            hq.log(`uploaded “${r.title}” to the resource library`, "info");
            toast.success("Uploaded and indexed", { description: `${r.title} · ${r.type}` });
            setOpenId(r.id);
          }}
        />
      </Modal>
    </div>
  );
}

/* ---------------- Ask box ---------------- */

function AskLibrary({ lib, onOpen }: { lib: Resource[]; onOpen: (id: string) => void }) {
  const hq = useHQ();
  const [q, setQ] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [ans, setAns] = React.useState<Answer | null>(null);
  const [step, setStep] = React.useState(0);

  function ask(question: string) {
    if (!question.trim()) return;
    setQ(question);
    setBusy(true);
    setAns(null);
    setStep(1);
    window.setTimeout(() => setStep(2), 450);
    window.setTimeout(() => {
      setAns(answer(question, lib));
      setBusy(false);
      setStep(0);
    }, 1000);
  }

  const cite = (id: string) => (ans ? ans.cites.indexOf(id) + 1 : 0);
  return (
    <section className="desk-card mt-5 overflow-hidden border-[color-mix(in_oklab,var(--d-gold)_35%,var(--d-line))]">
      <div className="bg-[color-mix(in_oklab,var(--d-gold)_7%,var(--d-panel))] p-5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1d1714] text-[#e4c27a]">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <h3 className="font-serif text-[19px] font-medium">Ask the library</h3>
          <AIMark label={`Answers from ${lib.length} resources`} />
        </div>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            ask(q);
          }}
        >
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. How do I handle 'price is too high' on the Accelerator?" className={`${inputClass} h-11 text-[14.5px]`} />
          <Btn variant="solid" type="submit" icon={Send} className="h-11" disabled={busy}>
            Ask
          </Btn>
        </form>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {CANNED.map((c) => (
            <button key={c.q} type="button" onClick={() => ask(c.q)} className="rounded-full border border-d-line bg-d-panel px-2.5 py-1 text-[12px] hover:border-[var(--d-gold)]">
              {c.q}
            </button>
          ))}
        </div>
      </div>
      {(busy || ans) && (
        <div className="border-t border-d-line p-5">
          {busy ? (
            <ul className="space-y-1.5 text-[12.5px] text-d-mute">
              <li className="desk-rise">✓ Understood the question</li>
              {step >= 2 && <li className="desk-rise">✓ Searched {lib.length} resources, scripts and transcripts</li>}
              <li className="desk-rise animate-pulse">Writing the answer…</li>
            </ul>
          ) : (
            ans && (
              <div className="desk-rise">
                <p className="text-[12px] text-d-mute">“{ans.q}”</p>
                <p className="mt-1.5 max-w-[880px] text-[14.5px] leading-relaxed">
                  {ans.parts.map((p, i) => (
                    <React.Fragment key={i}>
                      {p.text}
                      {p.cite && (
                        <button type="button" onClick={() => onOpen(p.cite as string)} className="mx-0.5 inline-flex h-[18px] min-w-[18px] -translate-y-px items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--d-gold)_22%,var(--d-panel))] px-1 align-middle font-mono text-[10.5px] font-semibold hover:bg-[var(--d-gold)] hover:text-white">
                          {cite(p.cite)}
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                </p>
                {ans.missing ? (
                  <Btn
                    className="mt-3"
                    size="sm"
                    icon={Lightbulb}
                    onClick={() => {
                      hq.addTask({ title: `Write a library resource: ${ans.q}`, owner: "aditya", status: "Todo", priority: "P2", due: "in 5d", dueIn: 5, area: "Ops", aiDrafted: true });
                      toast.success("Gap logged as a task", { description: "Aditya will commission it" });
                    }}
                  >
                    Request this resource
                  </Btn>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {ans.cites.map((id, i) => {
                      const r = lib.find((x) => x.id === id);
                      if (!r) return null;
                      const Icon = typeIcon[r.type];
                      return (
                        <button key={id} type="button" onClick={() => onOpen(id)} className="inline-flex items-center gap-2 rounded-[10px] border border-d-line bg-d-panel px-2.5 py-1.5 text-left text-[12px] hover:border-d-accent">
                          <span className="font-mono text-[10.5px] font-semibold text-d-mute">{i + 1}</span>
                          <Icon className="h-3.5 w-3.5 text-d-accent" />
                          <span className="max-w-[260px] truncate font-medium">{r.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}

/* ---------------- preview sheet ---------------- */

const FILLS: Record<string, Record<string, string>> = {
  Textile: { industry: "textile", desk: "textile", name: "Hitesh", pain: "trims POs wait two days for your approval", aov: "1,80,000", client: "Kaveri Weaves" },
  Pharma: { industry: "pharma distribution", desk: "pharma-distribution", name: "Sanjay", pain: "expired stock comes back every month", aov: "45,000", client: "Apollo Pharma Agency" },
  Dental: { industry: "dental clinic", desk: "dental", name: "Dr. Swati", pain: "patients never come back for recalls", aov: "8,500", client: "Care Dental Clinic" },
  Restaurant: { industry: "restaurant", desk: "restaurant", name: "Farhan", pain: "Swiggy and Zomato orders are tracked on paper", aov: "650", client: "Spice Route Restaurants" },
};

function Body({ text, fill }: { text: string; fill: Record<string, string> | null }) {
  const render = (s: string) => {
    const parts = s.split(/(\{[a-z]+\})/g);
    return parts.map((p, i) => {
      const m = p.match(/^\{([a-z]+)\}$/);
      if (!m) return <React.Fragment key={i}>{p}</React.Fragment>;
      const v = fill?.[m[1]];
      return (
        <span key={i} className={v ? "rounded-[3px] bg-[color-mix(in_oklab,var(--d-gold)_22%,transparent)] px-0.5" : "rounded-[3px] bg-d-sunk px-1 font-mono text-[11.5px] text-d-mute"}>
          {v ?? m[1]}
        </span>
      );
    });
  };
  return (
    <div className="space-y-2 text-[13.5px] leading-relaxed">
      {text.split("\n").map((line, i) => {
        if (line.startsWith("## ")) return <h4 key={i} className="pt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-d-mute">{line.slice(3)}</h4>;
        if (line.startsWith("- ")) return <p key={i} className="flex gap-2 pl-1"><span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-d-ink/50" />{render(line.slice(2))}</p>;
        if (/^[AC]: /.test(line)) {
          const adv = line.startsWith("A");
          return (
            <p key={i} className={`flex gap-3 rounded-[10px] px-3 py-2 ${adv ? "bg-d-sunk/60" : "ml-8 border border-d-line"}`}>
              <span className={`w-16 shrink-0 text-[11px] font-semibold uppercase tracking-wider ${adv ? "text-d-accent" : "text-d-mute"}`}>{adv ? "Advisor" : "Owner"}</span>
              <span>{render(line.slice(3))}</span>
            </p>
          );
        }
        const ch = line.match(/^\[([\d:]+)\] (.*)$/);
        if (ch) return <p key={i} className="flex items-center gap-3"><button type="button" onClick={() => toast(`Playing from ${ch[1]}`)} className="rounded-full bg-d-soft px-2 py-0.5 font-mono text-[11px] text-d-accent hover:brightness-95">{ch[1]}</button>{ch[2]}</p>;
        const sl = line.match(/^# (\d+) (.*)$/);
        if (sl) return <p key={i} className="flex items-center gap-3 rounded-[10px] border border-d-line px-3 py-2"><span className="flex h-7 w-10 shrink-0 items-center justify-center rounded-[5px] bg-d-sunk font-mono text-[11px] text-d-mute">{sl[1]}</span>{sl[2]}</p>;
        if (!line.trim()) return null;
        return <p key={i}>{render(line)}</p>;
      })}
    </div>
  );
}

function Preview({ resource, onClose, onPin, onCollection, onOpen, lib }: { resource: Resource | null; onClose: () => void; onPin: (id: string) => void; onCollection: (id: string, c: string) => void; onOpen: (id: string) => void; lib: Resource[] }) {
  return (
    <Sheet
      open={!!resource}
      onOpenChange={(v) => !v && onClose()}
      width={640}
      eyebrow={resource ? `${resource.id} · ${resource.type} · v${resource.version}` : ""}
      title={resource?.title ?? ""}
      sub={resource?.summary}
    >
      {resource && <PreviewBody key={resource.id} r={resource} onPin={onPin} onCollection={onCollection} onOpen={onOpen} lib={lib} />}
    </Sheet>
  );
}

function PreviewBody({ r, onPin, onCollection, onOpen, lib }: { r: Resource; onPin: (id: string) => void; onCollection: (id: string, c: string) => void; onOpen: (id: string) => void; lib: Resource[] }) {
  const hq = useHQ();
  const [fillKey, setFillKey] = React.useState<string>("None");
  const [tab, setTab] = React.useState<"Content" | "Versions">("Content");
  const [summary, setSummary] = React.useState<string | null>(null);
  const fill = fillKey === "None" ? null : FILLS[fillKey];
  const hasTokens = /\{[a-z]+\}/.test(r.body);
  const related = lib.filter((x) => x.id !== r.id && (x.type === r.type || x.collections.some((c) => r.collections.includes(c)))).sort((a, b) => b.uses - a.uses).slice(0, 3);
  const plain = fill ? r.body.replace(/\{([a-z]+)\}/g, (_, k: string) => fill[k] ?? k) : r.body;

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${r.title}\n\n${plain.replace(/^## /gm, "").replace(/^A: /gm, "Advisor: ").replace(/^C: /gm, "Owner: ")}`);
      toast.success("Copied to clipboard", { description: fill ? `Filled for ${fillKey}` : "Plain text, ready for WhatsApp" });
    } catch {
      toast.error("Clipboard blocked by the browser");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Btn size="sm" variant="solid" icon={Copy} onClick={copy}>
          Copy
        </Btn>
        <Btn size="sm" icon={Pin} onClick={() => onPin(r.id)}>
          {r.pinned ? "Unpin" : "Pin"}
        </Btn>
        <Btn
          size="sm"
          icon={Send}
          onClick={() => {
            hq.log(`shared “${r.title}” to the sales WhatsApp group`, "info");
            toast.success("Shared to #sales-team on WhatsApp");
          }}
        >
          Share
        </Btn>
        <Btn
          size="sm"
          icon={Sparkles}
          onClick={() => setSummary(`${r.summary} Key points: ${r.body.split("\n").filter((l) => l.startsWith("## ") || l.startsWith("# ")).map((l) => l.replace(/^#+ (\d+ )?/, "")).slice(0, 4).join(" · ") || r.body.split("\n")[0].replace(/^[-A-Z]+:? /, "")}.`)}
        >
          Summarise
        </Btn>
      </div>

      {summary && (
        <AgentNote className="mt-3" title="30-second version">
          {summary}
        </AgentNote>
      )}

      <div className="mt-4 rounded-[12px] border border-d-line p-3.5">
        <KV
          cols={3}
          items={[
            { k: "Owner", v: <PersonChip id={r.owner} /> },
            { k: "Updated", v: r.updated },
            { k: "Used", v: `${r.uses.toLocaleString("en-IN")} times` },
            { k: "Team", v: r.team },
            { k: "Version", v: `v${r.version}` },
            { k: "Format", v: r.meta ?? "Text" },
          ]}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <Segmented size="sm" value={tab} onChange={setTab} options={["Content", "Versions"] as const} />
        {hasTokens && tab === "Content" && (
          <label className="inline-flex items-center gap-2 text-[12px] text-d-mute">
            <AIMark label="Tailor for" />
            <select value={fillKey} onChange={(e) => setFillKey(e.target.value)} className="h-8 rounded-[8px] border border-d-line bg-d-panel px-2 text-[12.5px] text-d-ink outline-none">
              {["None", ...Object.keys(FILLS)].map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      {tab === "Content" ? (
        <div className="mt-3 rounded-[12px] border border-d-line bg-d-panel p-4">
          <Body text={r.body} fill={fill} />
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-d-line">
          {VERSIONS(r).map((v, i) => (
            <li key={v.v} className="flex items-center gap-3 py-2.5">
              <History className="h-4 w-4 text-d-mute" />
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium">
                  v{v.v} · {v.note}
                </span>
                <span className="text-[11.5px] text-d-mute">
                  {personById[v.by]?.first} · {v.when}
                </span>
              </span>
              {i === 0 ? (
                <Pill tone="ok">Current</Pill>
              ) : (
                <Btn size="sm" onClick={() => toast.success(`Restored v${v.v} as a new draft`, { description: "The current version stays live until you publish" })}>
                  Restore
                </Btn>
              )}
            </li>
          ))}
        </ul>
      )}

      <SectionLabel className="mt-5">Collections</SectionLabel>
      <div className="flex flex-wrap gap-1.5">
        {COLLECTIONS.map((c) => {
          const on = r.collections.includes(c);
          return (
            <button key={c} type="button" onClick={() => onCollection(r.id, c)} className={`rounded-full border px-2.5 py-1 text-[12px] ${on ? "border-d-accent bg-d-soft text-d-accent" : "border-d-line text-d-mute hover:text-d-ink"}`}>
              {on ? "✓ " : "+ "}
              {c}
            </button>
          );
        })}
      </div>

      {related.length > 0 && (
        <>
          <SectionLabel className="mt-5">Often used together</SectionLabel>
          <ul className="space-y-1.5">
            {related.map((x) => {
              const Icon = typeIcon[x.type];
              return (
                <li key={x.id}>
                  <button type="button" onClick={() => onOpen(x.id)} className="flex w-full items-center gap-2.5 rounded-[10px] border border-d-line px-3 py-2 text-left text-[12.5px] hover:border-d-accent">
                    <Icon className="h-3.5 w-3.5 text-d-accent" />
                    <span className="flex-1 truncate font-medium">{x.title}</span>
                    <span className="font-mono text-[11px] text-d-mute">{x.uses.toLocaleString("en-IN")}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

/* ---------------- upload ---------------- */

function classify(name: string): { type: RType; team: Team; collections: string[] } {
  const n = name.toLowerCase();
  if (/script|call|pitch/.test(n)) return { type: "Call script", team: "Sales", collections: ["Closer's kit"] };
  if (/objection|faq/.test(n)) return { type: "Objection handling", team: "Sales", collections: ["Closer's kit"] };
  if (/sop|process|checklist/.test(n)) return { type: "SOP", team: "Ops", collections: ["New-hire week 1"] };
  if (/\.(mp4|mov)$|recording|zoom/.test(n)) return { type: "Workshop recording", team: "Founder", collections: ["Batch 15 launch"] };
  if (/proposal|quote/.test(n)) return { type: "Proposal template", team: "Sales", collections: ["Closer's kit"] };
  if (/case|story|testimonial/.test(n)) return { type: "Case study", team: "Marketing", collections: [] };
  if (/ad|creative|reel|\.(png|jpg)$/.test(n)) return { type: "Ad creative", team: "Marketing", collections: ["Batch 15 launch"] };
  if (/blueprint|worksheet/.test(n)) return { type: "Blueprint", team: "Delivery", collections: ["Delivery playbook"] };
  if (/\.(pptx|key)$|deck/.test(n)) return { type: "Onboarding deck", team: "Delivery", collections: ["New-hire week 1"] };
  return { type: "SOP", team: "Ops", collections: [] };
}

function UploadForm({ onDone }: { onDone: (r: Resource) => void }) {
  const hq = useHQ();
  const [file, setFile] = React.useState<string>("");
  const [title, setTitle] = React.useState("");
  const [type, setType] = React.useState<RType>("SOP");
  const [team, setTeam] = React.useState<Team>("Ops");
  const [cols, setCols] = React.useState<string[]>([]);
  const [reading, setReading] = React.useState(false);
  const [drag, setDrag] = React.useState(false);
  const seq = React.useRef(0);

  function take(name: string) {
    setFile(name);
    setReading(true);
    window.setTimeout(() => {
      const c = classify(name);
      setType(c.type);
      setTeam(c.team);
      setCols(c.collections);
      setTitle(
        name
          .replace(/\.[a-z0-9]+$/i, "")
          .replace(/[-_]+/g, " ")
          .replace(/\b\w/g, (m) => m.toUpperCase()),
      );
      setReading(false);
    }, 900);
  }

  return (
    <div className="space-y-3">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files[0];
          if (f) take(f.name);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-[14px] border-2 border-dashed px-4 py-7 text-center transition-colors ${drag ? "border-d-accent bg-d-soft" : "border-d-line hover:bg-d-sunk/60"}`}
      >
        <Upload className="h-6 w-6 text-d-mute" />
        <span className="mt-2 text-[13.5px] font-medium">{file || "Drop a file or click to choose"}</span>
        <span className="mt-0.5 text-[12px] text-d-mute">PDF, DOCX, PPTX, MP4, PNG · up to 2 GB</span>
        <input type="file" className="sr-only" onChange={(e) => e.target.files?.[0] && take(e.target.files[0].name)} />
      </label>
      {!file && (
        <div className="flex flex-wrap gap-1.5 text-[12px]">
          <span className="text-d-mute">Try:</span>
          {["objection-handling-diwali-offer.docx", "batch14-implementation-clinic.mp4", "sop-zoom-cohost-setup.pdf"].map((f) => (
            <button key={f} type="button" onClick={() => take(f)} className="rounded-full border border-d-line px-2 py-0.5 font-mono text-[11px] hover:border-d-accent">
              {f}
            </button>
          ))}
        </div>
      )}
      {reading && (
        <p className="inline-flex animate-pulse items-center gap-2 text-[12.5px] text-d-mute">
          <Sparkles className="h-3.5 w-3.5 text-[var(--d-gold)]" /> Reading the file and suggesting where it belongs…
        </p>
      )}
      {file && !reading && (
        <div className="desk-rise space-y-3">
          <Field label="Title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <select value={type} onChange={(e) => setType(e.target.value as RType)} className={inputClass}>
                {TYPES.map((t) => (
                  <option key={t.id}>{t.id}</option>
                ))}
              </select>
            </Field>
            <Field label="Team">
              <select value={team} onChange={(e) => setTeam(e.target.value as Team)} className={inputClass}>
                {TEAMS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
          </div>
          <div>
            <span className="text-[12px] font-medium text-d-mute">Collections</span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {COLLECTIONS.map((c) => {
                const on = cols.includes(c);
                return (
                  <button key={c} type="button" onClick={() => setCols(on ? cols.filter((x) => x !== c) : [...cols, c])} className={`rounded-full border px-2.5 py-1 text-[12px] ${on ? "border-d-accent bg-d-soft text-d-accent" : "border-d-line text-d-mute"}`}>
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
          <p className="inline-flex items-center gap-1.5 text-[11.5px] text-d-mute">
            <AIMark label="Suggested" /> type, team and collections from the file name and first pages
          </p>
          <div className="flex justify-end">
            <Btn
              variant="solid"
              icon={Upload}
              disabled={!title.trim()}
              onClick={() => {
                seq.current += 1;
                onDone({
                  id: `R-U${seq.current}`,
                  title: title.trim(),
                  type,
                  team,
                  owner: hq.me.id,
                  updated: "20 Oct 2026",
                  age: 0,
                  uses: 0,
                  version: 1,
                  collections: cols,
                  meta: file,
                  summary: `Uploaded by ${hq.me.first} today. Indexed for Ask the library.`,
                  body: `## Indexed\n- ${file}\n- Full text extracted and searchable\n- Owner: ${hq.me.name}`,
                });
              }}
            >
              Upload and index
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}
