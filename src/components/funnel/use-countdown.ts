"use client";

import * as React from "react";

export type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
  ready: boolean;
};

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 1000);
  return () => window.clearInterval(id);
}

/** Current time in whole seconds — stable per tick so useSyncExternalStore doesn't loop. */
const getNowSeconds = () => Math.floor(Date.now() / 1000);
const getServerSnapshot = () => null;

export function useCountdown(targetIso: string): Countdown {
  const target = React.useMemo(() => Math.floor(new Date(targetIso).getTime() / 1000), [targetIso]);
  const now = React.useSyncExternalStore(subscribe, getNowSeconds, getServerSnapshot);

  if (now === null) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: false, ready: false };
  }

  const s = Math.max(0, target - now);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: s === 0,
    ready: true,
  };
}

export const pad = (n: number) => String(n).padStart(2, "0");
