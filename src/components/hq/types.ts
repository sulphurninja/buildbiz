/* BuildBiz HQ: the command center BuildBiz runs its own business on. */

export type Role = "founder" | "sales" | "delivery" | "ops";

export type Person = {
  id: string;
  name: string;
  first: string;
  initials: string;
  role: Role;
  title: string;
  /** hex used for avatar ring and charts */
  color: string;
  online: boolean;
  /** monthly target in ₹ (sales) or deliverables (delivery/ops) */
  target?: number;
};

/** Offer ladder, cheapest to most expensive. */
export type ProgramId = "workshop" | "launchpad" | "accelerator" | "systems" | "agents" | "dfy";

export type Program = { id: ProgramId; name: string; price: number; short: string; color: string };

export type LeadStage = "New" | "Contacted" | "Qualified" | "Call booked" | "Proposal" | "Won" | "Lost";
export type LeadSource = "Meta ads" | "Workshop" | "Instagram" | "YouTube" | "Referral" | "Website" | "WhatsApp";

export type CallLog = { at: string; by: string; outcome: "Connected" | "No answer" | "Busy" | "Call back" | "Not interested" | "Booked"; minutes: number; note: string };

export type Lead = {
  id: string;
  name: string;
  company: string;
  industry: string;
  city: string;
  phone: string;
  revenue: string;
  teamSize: number;
  source: LeadSource;
  stage: LeadStage;
  owner: string;
  /** AI qualification score 0-100 */
  score: number;
  interest: ProgramId;
  value: number;
  /** hours from "now" (negative = overdue) */
  followUpIn: number;
  attendedWorkshop: boolean;
  pain: string;
  calls: CallLog[];
  tags: string[];
};

export type TaskStatus = "Todo" | "In progress" | "Review" | "Done";
export type Task = {
  id: string;
  title: string;
  owner: string;
  status: TaskStatus;
  priority: "P0" | "P1" | "P2" | "P3";
  due: string;
  /** days from today, negative = overdue */
  dueIn: number;
  area: "Sales" | "Delivery" | "Marketing" | "Ops" | "Finance";
  linked?: string;
  subtasks?: { title: string; done: boolean }[];
  aiDrafted?: boolean;
};

export type Notification = {
  id: string;
  kind: "lead" | "payment" | "task" | "agent" | "announcement" | "student" | "system";
  title: string;
  body: string;
  at: string;
  read: boolean;
  href?: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  by: string;
  at: string;
  pinned?: boolean;
  audience: "Everyone" | "Sales" | "Delivery" | "Ops";
  reactions: Record<string, number>;
  acks: string[];
};

export type Student = {
  id: string;
  name: string;
  business: string;
  industry: string;
  city: string;
  phone: string;
  email: string;
  program: ProgramId;
  cohort: string;
  joined: string;
  attendance: number;
  progress: number;
  paid: number;
  due: number;
  status: "Active" | "At risk" | "Completed" | "Paused";
  coach: string;
  access: { zoom: boolean; community: boolean; portal: boolean; blueprint: boolean; whatsapp: boolean };
};

export type ClientBuild = {
  id: string;
  client: string;
  industry: string;
  /** slug of the matching industry desk, if any */
  desk?: string;
  value: number;
  paid: number;
  stage: "Discovery" | "Blueprint" | "Build" | "UAT" | "Go-live" | "Live";
  lead: string;
  progress: number;
  goLiveIn: number;
  health: "On track" | "At risk" | "Blocked";
  modules: string[];
};

export type ActivityItem = { id: string; at: string; who: string; text: string; tone?: "ok" | "warn" | "late" | "info" | "accent" };
