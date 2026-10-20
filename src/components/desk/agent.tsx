"use client";

import * as React from "react";
import { cn } from "cn";
import { toast } from "sonner";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ArrowUp, Check, CircleDashed, FileText, Loader2, RotateCcw, Sparkles, X } from "lucide-react";
import type { AgentRun, AskPrompt } from "./types";
import { Btn, Sheet, useDeskRoot } from "./ui";

function score(prompt: AskPrompt, text: string) {
  const words = text.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
  const hay = `${prompt.q} ${prompt.a}`.toLowerCase();
  return words.reduce((acc, w) => acc + (hay.includes(w) ? (prompt.q.toLowerCase().includes(w) ? 3 : 1) : 0), 0);
}

type Turn = { q: string; a: string; sources?: string[]; done: boolean };

/** Copilot conversation that rises from the command bar. */
export function CopilotPanel({
  open,
  onOpenChange,
  brand,
  company,
  prompts,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: string;
  company: string;
  prompts: AskPrompt[];
  initial?: string;
}) {
  const root = useDeskRoot();
  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [draft, setDraft] = React.useState("");
  const [thinking, setThinking] = React.useState(false);
  const scroller = React.useRef<HTMLDivElement>(null);
  const timer = React.useRef<number | null>(null);
  const asked = React.useRef(false);

  const ask = React.useCallback(
    (text: string) => {
      const q = text.trim();
      if (!q) return;
      const exact = prompts.find((p) => p.q.toLowerCase() === q.toLowerCase());
      const best = exact ?? [...prompts].sort((a, b) => score(b, q) - score(a, q))[0];
      const matched = exact || (best && score(best, q) >= 3);
      const answer =
        matched && best
          ? best.a
          : `I went through ${company}'s records and can't answer that one confidently yet. The closest I can answer well is “${best?.q ?? "what needs you today"}”.`;
      setDraft("");
      setThinking(true);
      setTurns((t) => [...t, { q, a: "", sources: matched ? best?.sources : undefined, done: false }]);
      window.setTimeout(() => {
        setThinking(false);
        let i = 0;
        timer.current = window.setInterval(() => {
          i += 4;
          setTurns((t) => t.map((turn, idx) => (idx === t.length - 1 ? { ...turn, a: answer.slice(0, i), done: i >= answer.length } : turn)));
          if (i >= answer.length && timer.current) window.clearInterval(timer.current);
        }, 14);
      }, 600);
    },
    [prompts, company],
  );

  React.useEffect(() => {
    if (!open || !initial || asked.current) return;
    asked.current = true;
    const id = window.setTimeout(() => ask(initial), 120);
    return () => window.clearTimeout(id);
  }, [open, initial, ask]);

  React.useEffect(
    () => () => {
      if (timer.current) window.clearInterval(timer.current);
    },
    [],
  );

  React.useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal container={root}>
        <DialogPrimitive.Overlay className="bb-overlay fixed inset-0 z-[60] bg-[#2a1216]/25 backdrop-blur-[2px]" />
        <DialogPrimitive.Content className="desk-rise fixed bottom-3 left-1/2 z-[61] flex h-[min(680px,calc(100vh-90px))] w-[calc(100vw-24px)] max-w-[760px] -translate-x-1/2 flex-col overflow-hidden rounded-[24px] border border-d-line bg-d-paper text-d-ink shadow-[0_40px_120px_-30px_rgba(70,20,30,0.55)] outline-none lg:ml-[128px]">
          <header className="flex items-center gap-3 border-b border-d-line bg-d-panel px-5 py-3.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[var(--d-brand)] text-[var(--d-gold)]">
              <Sparkles className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <DialogPrimitive.Title className="desk-h text-[16px] font-semibold">BuildBiz copilot</DialogPrimitive.Title>
              <DialogPrimitive.Description className="truncate text-[12px] text-d-mute">Reads {brand}&apos;s live records. Nothing is sent until you act.</DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close className="rounded-full p-2 text-d-mute hover:bg-d-sunk hover:text-d-ink" aria-label="Close">
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </header>
          <div ref={scroller} className="desk-scroll flex-1 space-y-5 overflow-y-auto px-5 py-5">
            {turns.length === 0 && (
              <div>
                <p className="desk-serif text-[26px] leading-tight text-[var(--d-brand)]">What would you like to know?</p>
                <p className="mt-1 text-[13.5px] text-d-mute">I have read today&apos;s orders, money, people and machines, and I&apos;ll show the records I used.</p>
              </div>
            )}
            {turns.map((turn, i) => (
              <div key={i} className="space-y-3">
                <p className="desk-h text-[17px] font-semibold leading-snug">{turn.q}</p>
                <div className="rounded-[16px] border border-d-line bg-d-panel p-4">
                  {!turn.a && thinking && i === turns.length - 1 ? (
                    <p className="flex items-center gap-2 text-[13px] text-d-mute">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Reading records…
                    </p>
                  ) : (
                    <p className="whitespace-pre-wrap text-[14px] leading-relaxed">{turn.a}</p>
                  )}
                  {turn.done && turn.sources && (
                    <div className="desk-rise mt-3 flex flex-wrap items-center gap-1.5 border-t border-d-line pt-3">
                      <span className="text-[11px] font-medium text-d-mute">Sources</span>
                      {turn.sources.map((s) => (
                        <span key={s} className="inline-flex items-center gap-1 rounded-full bg-d-sunk px-2 py-0.5 text-[11px]">
                          <FileText className="h-3 w-3 text-d-mute" /> {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div className="flex flex-wrap gap-1.5">
              {prompts
                .filter((p) => !turns.some((t) => t.q === p.q))
                .map((p) => (
                  <button
                    key={p.q}
                    type="button"
                    onClick={() => ask(p.q)}
                    disabled={thinking}
                    className="rounded-full border border-d-line bg-d-panel px-3 py-1.5 text-left text-[12.5px] transition-colors hover:border-[var(--d-brand)] disabled:opacity-50"
                  >
                    {p.q}
                  </button>
                ))}
            </div>
          </div>
          <form
            className="flex items-center gap-2 border-t border-d-line bg-d-panel p-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!thinking) ask(draft);
            }}
          >
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Ask about ${brand}…`}
              className="h-10 flex-1 rounded-full border border-d-line bg-d-paper px-4 text-[13.5px] outline-none placeholder:text-d-mute focus:border-[var(--d-brand)]"
            />
            <button type="submit" aria-label="Send" disabled={!draft.trim() || thinking} className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--d-brand)] text-white disabled:opacity-40">
              <ArrowUp className="h-4 w-4" />
            </button>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export function RunAgentSheet({ open, onOpenChange, run, onFinished }: { open: boolean; onOpenChange: (open: boolean) => void; run: AgentRun; onFinished?: (text: string) => void }) {
  const [step, setStep] = React.useState(0);
  const [applied, setApplied] = React.useState<Set<string>>(new Set());
  const done = step >= run.steps.length;

  React.useEffect(() => {
    if (!open || step >= run.steps.length) return;
    const id = window.setTimeout(() => setStep((s) => s + 1), 900 + (step % 3) * 250);
    return () => window.clearTimeout(id);
  }, [open, step, run.steps.length]);

  React.useEffect(() => {
    if (done && open) onFinished?.(run.outcome);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const progress = Math.min(100, (step / run.steps.length) * 100);

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      eyebrow={done ? "Run complete" : "Agent working"}
      title={run.title}
      sub={run.label}
      width={500}
      footer={
        <>
          <Btn variant="ghost" icon={RotateCcw} onClick={() => setStep(0)} disabled={!done}>
            Run again
          </Btn>
          <Btn variant="solid" onClick={() => onOpenChange(false)}>
            {done ? "Done" : "Keep running in background"}
          </Btn>
        </>
      }
    >
      <div className="h-1.5 overflow-hidden rounded-full bg-d-sunk">
        <div className="h-full rounded-full bg-[var(--d-brand)] transition-[width] duration-700" style={{ width: `${progress}%` }} />
      </div>
      <ol className="mt-5 space-y-1">
        {run.steps.map((s, i) => {
          const state = i < step ? "done" : i === step ? "running" : "waiting";
          return (
            <li key={s.text} className={cn("flex gap-3 rounded-xl px-2 py-2.5 transition-colors", state === "running" && "bg-[color-mix(in_oklab,var(--d-gold)_12%,white)]")}>
              <span className="mt-0.5 shrink-0">
                {state === "done" && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-d-ok text-white">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                )}
                {state === "running" && <Loader2 className="h-5 w-5 animate-spin text-[var(--d-brand)]" />}
                {state === "waiting" && <CircleDashed className="h-5 w-5 text-d-mute/60" />}
              </span>
              <div className="min-w-0">
                <p className={cn("text-[13.5px]", state === "waiting" && "text-d-mute")}>{s.text}</p>
                {state === "done" && s.result && <p className="desk-rise mt-0.5 font-mono text-[11.5px] text-d-mute">{s.result}</p>}
              </div>
            </li>
          );
        })}
      </ol>
      {done && (
        <div className="desk-rise mt-5 rounded-2xl border border-d-line bg-d-paper p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-d-ok">What the agent recommends</p>
          <p className="mt-1.5 text-[14px] leading-relaxed">{run.outcome}</p>
          {run.actions && (
            <div className="mt-3 flex flex-wrap gap-2">
              {run.actions.map((a) => (
                <Btn
                  key={a}
                  size="sm"
                  variant={applied.has(a) ? "soft" : "outline"}
                  icon={applied.has(a) ? Check : undefined}
                  onClick={() => {
                    setApplied((cur) => new Set(cur).add(a));
                    toast.success(a, { description: "Queued. You can undo it from Activity." });
                  }}
                >
                  {a}
                </Btn>
              ))}
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}
