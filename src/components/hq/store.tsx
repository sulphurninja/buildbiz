"use client";

import * as React from "react";
import { toast } from "sonner";
import type { ActivityItem, Announcement, Lead, Notification, Person, Task } from "./types";
import { announcements as seedAnnouncements, leads as seedLeads, notifications as seedNotifications, personById, tasks as seedTasks, team } from "./data";

/**
 * One in-memory store for the whole command center, so a call logged in the CRM
 * moves the lead on the Follow-up Board, a task created anywhere lands in Task
 * Manager, and so on. Everything resets on reload; this is a live demo.
 */
type HQStore = {
  me: Person;
  setMe: (id: string) => void;
  leads: Lead[];
  updateLead: (id: string, patch: Partial<Lead> | ((lead: Lead) => Partial<Lead>)) => void;
  tasks: Task[];
  addTask: (task: Omit<Task, "id">) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  notifications: Notification[];
  notify: (n: Omit<Notification, "id" | "at" | "read">, opts?: { toast?: boolean }) => void;
  markRead: (id?: string) => void;
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  activity: ActivityItem[];
  /** record something that happened; shows in activity feeds */
  log: (text: string, tone?: ActivityItem["tone"]) => void;
  /** open the copilot, optionally with a question */
  openAsk: (q?: string) => void;
  runAgent: (id?: string) => void;
};

const Ctx = React.createContext<HQStore | null>(null);

export function useHQ() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useHQ must be used inside the HQ shell");
  return ctx;
}

function stamp() {
  return new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });
}

export function HQProvider({ children, openAsk, runAgent }: { children: React.ReactNode; openAsk: (q?: string) => void; runAgent: (id?: string) => void }) {
  const [meId, setMeId] = React.useState("amit");
  const [leads, setLeads] = React.useState(seedLeads);
  const [tasks, setTasks] = React.useState(seedTasks);
  const [notifications, setNotifications] = React.useState(seedNotifications);
  const [announcements, setAnnouncements] = React.useState(seedAnnouncements);
  const [activity, setActivity] = React.useState<ActivityItem[]>([
    { id: "a1", at: "9:52 AM", who: "sneha", text: "closed Sunita Bansal on the Accelerator, ₹74,999", tone: "ok" },
    { id: "a2", at: "9:40 AM", who: "agent", text: "Lead Qualifier scored 34 overnight leads; 9 hot", tone: "accent" },
    { id: "a3", at: "9:31 AM", who: "vikram", text: "pushed the Swiggy sync fix to Spice Route staging", tone: "info" },
    { id: "a4", at: "9:15 AM", who: "meera", text: "paused 2 ad sets with CPL above ₹90", tone: "warn" },
    { id: "a5", at: "9:02 AM", who: "rohan", text: "submitted yesterday's sales day report", tone: "info" },
  ]);
  const seq = React.useRef(0);
  const nextId = (prefix: string) => {
    seq.current += 1;
    return `${prefix}-n${seq.current}`;
  };

  const log = React.useCallback(
    (text: string, tone?: ActivityItem["tone"]) => {
      seq.current += 1;
      const id = `act-${seq.current}`;
      setActivity((cur) => [{ id, at: stamp(), who: meId, text, tone }, ...cur].slice(0, 60));
    },
    [meId],
  );

  const notify = React.useCallback((n: Omit<Notification, "id" | "at" | "read">, opts?: { toast?: boolean }) => {
    seq.current += 1;
    const id = `N-n${seq.current}`;
    setNotifications((cur) => [{ ...n, id, at: "just now", read: false }, ...cur]);
    if (opts?.toast !== false) toast(n.title, { description: n.body });
  }, []);

  const value = React.useMemo<HQStore>(
    () => ({
      me: personById[meId] ?? team[0],
      setMe: setMeId,
      leads,
      updateLead: (id, patch) => setLeads((cur) => cur.map((l) => (l.id === id ? { ...l, ...(typeof patch === "function" ? patch(l) : patch) } : l))),
      tasks,
      addTask: (task) => {
        const created = { ...task, id: nextId("T") };
        setTasks((cur) => [created, ...cur]);
        return created;
      },
      updateTask: (id, patch) => setTasks((cur) => cur.map((t) => (t.id === id ? { ...t, ...patch } : t))),
      notifications,
      notify,
      markRead: (id) => setNotifications((cur) => cur.map((n) => (!id || n.id === id ? { ...n, read: true } : n))),
      announcements,
      setAnnouncements,
      activity,
      log,
      openAsk,
      runAgent,
    }),
    [meId, leads, tasks, notifications, announcements, activity, log, notify, openAsk, runAgent],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
