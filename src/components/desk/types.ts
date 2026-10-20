import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type Tone = "ok" | "warn" | "late" | "info" | "neutral" | "accent";

/**
 * Each industry picks a frame, so desks differ in structure, not just colour.
 * atelier – light studio: header, horizontal day ribbon, pill tabs
 * ledger  – book-like: contents index on the left, serif type, ruled paper
 * control – dark operations room: icon rail, mono vitals strip
 * inbox   – owner workspace: module sidebar and an AI decision queue as home
 */
export type DeskVariant = "atelier" | "ledger" | "control" | "inbox";

export type DeskTheme = {
  variant: DeskVariant;
  paper: string;
  panel: string;
  sunk: string;
  ink: string;
  mute: string;
  line: string;
  accent: string;
  accentInk: string;
  soft: string;
  ok: string;
  warn: string;
  late: string;
  info: string;
  heading?: "sans" | "display" | "serif" | "mono";
  radius?: number;
};

export type AgendaItem = {
  /** 24h clock, fractional allowed: 9.5 = 9:30 */
  at: number;
  title: string;
  detail?: string;
  tone?: Tone;
  count?: number;
  module?: string;
};

export type Decision = {
  id: string;
  kind: "Approve" | "Risk" | "Money" | "Reply" | "People";
  title: string;
  context: string;
  recommendation: string;
  impact?: string;
  tone?: Tone;
  from: string;
  module?: string;
  approveLabel?: string;
};

export type PulseMetric = { label: string; value: string; delta?: string; good?: boolean; trend?: number[]; tone?: Tone; module?: string };

export type AskPrompt = { q: string; a: string; sources?: string[] };

export type AgentRun = {
  label: string;
  title: string;
  steps: { text: string; result?: string }[];
  outcome: string;
  actions?: string[];
};

export type DeskModule = {
  id: string;
  label: string;
  /** used by frames that group their navigation (inbox, ledger) */
  group?: string;
  title: string;
  blurb: string;
  icon: LucideIcon;
  count?: number;
  notes?: string[];
  render: () => ReactNode;
};

export type DeskConfig = {
  slug: string;
  company: string;
  brand: string;
  city: string;
  state: string;
  icon: LucideIcon;
  theme: DeskTheme;
  tagline: string;
  owner: { name: string; first: string; initials: string; role: string };
  agenda: AgendaItem[];
  activity: { time: string; text: string; tone?: Tone }[];
  asks: AskPrompt[];
  run: AgentRun;
  /** vitals shown in the header strip (control, inbox) */
  pulse?: PulseMetric[];
  /** inbox frame only */
  brief?: string;
  decisions?: Decision[];
  signature?: { title: string; sub: string; module?: string; render: () => ReactNode };
  homeExtras?: () => ReactNode;
};

/* Shared module data */

export type TeamMember = {
  name: string;
  role: string;
  status: "On floor" | "In field" | "Busy" | "On leave" | "Off";
  load: number;
  focus: string;
  phone?: string;
  since?: string;
  tasks: { title: string; due: string; done?: boolean }[];
  week?: number[];
};

export type WorkforceAgent = {
  name: string;
  role: string;
  icon: LucideIcon;
  status: "Running" | "Idle" | "Needs you";
  runsToday: number;
  hoursSaved: number;
  accuracy: number;
  last: string;
  skills: string[];
  schedule: string;
  inbox?: { title: string; detail: string }[];
  log: string[];
};

export type IndependencePillar = { name: string; score: number; note: string; fixes: { title: string; gain: number }[] };

export type IndependenceData = {
  score: number;
  history: number[];
  pillars: IndependencePillar[];
  ownerHours: { label: string; hours: number }[];
  quote: string;
};

export type Integration = {
  name: string;
  category: string;
  status: "Connected" | "Syncing" | "Available" | "Error";
  detail: string;
  synced: string;
  records: string;
  mark: string;
  color: string;
};
