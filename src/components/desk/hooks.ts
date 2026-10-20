"use client";

import * as React from "react";

/** Current time, updated every `every` ms. Null until mounted so server and client markup match. */
export function useNow(every = 1000) {
  const [now, setNow] = React.useState<Date | null>(null);
  React.useEffect(() => {
    const first = window.setTimeout(() => setNow(new Date()), 0);
    const id = window.setInterval(() => setNow(new Date()), every);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [every]);
  return now;
}

/** Wall clock parts in IST regardless of the viewer's zone. */
export function istParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const hour = Number(get("hour")) % 24;
  const minute = Number(get("minute"));
  const second = Number(get("second"));
  return {
    hour,
    minute,
    second,
    decimal: hour + minute / 60 + second / 3600,
    weekday: get("weekday"),
    day: get("day"),
    month: get("month"),
    year: get("year"),
  };
}

export function clockLabel(date: Date, seconds = false) {
  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    second: seconds ? "2-digit" : undefined,
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).toUpperCase();
}

/** Value that drifts randomly within bounds, for live-looking counters. */
export function useDrift(base: number, spread: number, every = 2500) {
  const [value, setValue] = React.useState(base);
  React.useEffect(() => {
    const id = window.setInterval(() => {
      setValue((v) => {
        const next = v + (Math.random() - 0.45) * spread;
        return Math.max(base - spread * 4, Math.min(base + spread * 6, next));
      });
    }, every);
    return () => window.clearInterval(id);
  }, [base, spread, every]);
  return value;
}

/** Index that advances on an interval, for simulated live feeds. */
export function useTicker(length: number, every = 4000) {
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    if (length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % length), every);
    return () => window.clearInterval(id);
  }, [length, every]);
  return index;
}

/** "Tuesday, 20 October 2026" in IST */
export function longDate(date: Date) {
  const parts = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long", year: "numeric" }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("weekday")}, ${get("day")} ${get("month")} ${get("year")}`;
}
