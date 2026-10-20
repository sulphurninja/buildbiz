import type { ComponentType } from "react";

/** One loader per built module; anything missing renders the placeholder. */
export const hqLoaders: Record<string, () => Promise<{ default: ComponentType }>> = {
  "tasks": () => import("./tasks"),
  "today": () => import("./today"),
  "builds": () => import("./builds"),
  "crm": () => import("./crm"),
  "revenue": () => import("./revenue"),
  "daily": () => import("./daily"),
  "accountability": () => import("./accountability"),
  "qualifier": () => import("./qualifier"),
  "roas": () => import("./roas"),
  "students": () => import("./students"),
  "history": () => import("./history"),
  "announcements": () => import("./announcements"),
  "followups": () => import("./followups"),
  "sales-reports": () => import("./sales-reports"),
  "readiness": () => import("./readiness"),
  "notifications": () => import("./notifications"),
  "rewards": () => import("./rewards"),
  "library": () => import("./library"),
  "agents": () => import("./agents"),
  // @modules-end (add one line above this marker per module, only after the file exists)
};
