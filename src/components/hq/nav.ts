import {
  Award,
  BarChart3,
  Bell,
  Bot,
  BookOpen,
  Calculator,
  CalendarCheck,
  ClipboardCheck,
  FileClock,
  Filter,
  GraduationCap,
  Hammer,
  KanbanSquare,
  ListChecks,
  Megaphone,
  PhoneCall,
  ShieldCheck,
  Sun,
  Target,
  type LucideIcon,
} from "lucide-react";

export type HQModuleMeta = {
  id: string;
  label: string;
  group: "Workspace" | "Revenue" | "Delivery" | "Operations" | "Intelligence";
  icon: LucideIcon;
  /** one line used in the palette, page header and quick access */
  blurb: string;
};

/** Every module in the command center, in sidebar order. `today` lives at /hq. */
export const hqModules: HQModuleMeta[] = [
  { id: "today", label: "My Today", group: "Workspace", icon: Sun, blurb: "Your calls, tasks, numbers and what the agents did overnight" },
  { id: "accountability", label: "Accountability Board", group: "Workspace", icon: Target, blurb: "Who committed to what this week, and who delivered" },
  { id: "announcements", label: "Announcements", group: "Workspace", icon: Megaphone, blurb: "Company updates with acknowledgements" },
  { id: "notifications", label: "Notifications", group: "Workspace", icon: Bell, blurb: "Everything that needs your attention, in one inbox" },

  { id: "revenue", label: "Revenue Center", group: "Revenue", icon: BarChart3, blurb: "Bookings, collections, pipeline and forecast across every program" },
  { id: "crm", label: "Calling CRM", group: "Revenue", icon: PhoneCall, blurb: "Power-dial the queue, log outcomes, book the next step" },
  { id: "qualifier", label: "Lead Qualifier", group: "Revenue", icon: Filter, blurb: "AI scores every inbound lead and routes it to the right advisor" },
  { id: "followups", label: "Follow-up Board", group: "Revenue", icon: KanbanSquare, blurb: "Every lead by stage, with what is overdue" },
  { id: "sales-reports", label: "Sales Day Reports", group: "Revenue", icon: CalendarCheck, blurb: "Each advisor's end-of-day numbers and the AI summary" },
  { id: "roas", label: "ROAS Calculator", group: "Revenue", icon: Calculator, blurb: "Ad spend to workshop seats to paid programs, by campaign" },

  { id: "builds", label: "Client Builds", group: "Delivery", icon: Hammer, blurb: "Done-for-you command centers we are building for clients" },
  { id: "students", label: "Student Search", group: "Delivery", icon: GraduationCap, blurb: "Find any workshop attendee or program student in seconds" },
  { id: "readiness", label: "Access Readiness", group: "Delivery", icon: ShieldCheck, blurb: "Is every student set up with Zoom, portal, community and blueprints" },

  { id: "tasks", label: "Task Manager", group: "Operations", icon: ListChecks, blurb: "The team's work, by owner, priority and due date" },
  { id: "daily", label: "Daily Reporting", group: "Operations", icon: ClipboardCheck, blurb: "File today's report in two minutes; AI drafts it from your activity" },
  { id: "history", label: "Report History", group: "Operations", icon: FileClock, blurb: "Every daily report, searchable, with trends" },
  { id: "rewards", label: "Operations Rewards", group: "Operations", icon: Award, blurb: "Points, streaks and the leaderboard" },

  { id: "agents", label: "AI Agents", group: "Intelligence", icon: Bot, blurb: "The AI workforce running alongside the team" },
  { id: "library", label: "Resource Library", group: "Intelligence", icon: BookOpen, blurb: "Scripts, SOPs, decks and recordings" },
];

export const hqModuleById = Object.fromEntries(hqModules.map((m) => [m.id, m])) as Record<string, HQModuleMeta>;
export const hqHref = (id: string) => (id === "today" ? "/hq" : `/hq/${id}`);
