"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "cn";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ArrowRight, CornerDownLeft, LayoutGrid, Search } from "lucide-react";
import { industries } from "@/content/industries";
import { useDeskRoot } from "./ui";

type Item = { id: string; group: string; label: string; sub?: string; run: () => void };

export function CommandPalette({
  open,
  onOpenChange,
  slug,
  modules,
  onTab,
  actions,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
  modules: { id: string; label: string; blurb: string }[];
  onTab: (id: string) => void;
  actions: { label: string; hint: string; run: () => void }[];
}) {
  const router = useRouter();
  const root = useDeskRoot();
  const [query, setQuery] = React.useState("");
  const [cursor, setCursor] = React.useState(0);
  const list = React.useRef<HTMLDivElement>(null);

  const all: Item[] = [
    ...modules.map((m) => ({ id: `mod-${m.id}`, group: "Modules", label: m.label, sub: m.blurb, run: () => onTab(m.id) })),
    ...actions.map((a) => ({ id: `act-${a.label}`, group: "Actions", label: a.label, sub: a.hint, run: a.run })),
    ...industries
      .filter((i) => i.slug !== slug)
      .map((i) => ({ id: `ind-${i.slug}`, group: "Switch industry", label: i.name, sub: `${i.company} · ${i.city} · ${i.signature}`, run: () => router.push(`/industries/${i.slug}`) })),
    { id: "gallery", group: "Switch industry", label: "All industries", sub: "Back to the gallery", run: () => router.push("/#industries") },
  ];
  const needle = query.trim().toLowerCase();
  const shown = needle ? all.filter((item) => `${item.label} ${item.sub ?? ""} ${item.group}`.toLowerCase().includes(needle)) : all;
  const safe = Math.min(cursor, Math.max(0, shown.length - 1));

  function pick(item: Item | undefined) {
    if (!item) return;
    onOpenChange(false);
    item.run();
  }

  React.useEffect(() => {
    list.current?.querySelector(`[data-index="${safe}"]`)?.scrollIntoView({ block: "nearest" });
  }, [safe]);

  let lastGroup = "";
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal container={root}>
        <DialogPrimitive.Overlay className="bb-overlay fixed inset-0 z-[80] bg-black/40 backdrop-blur-[3px]" />
        <DialogPrimitive.Content className="desk-rise fixed left-1/2 top-[10vh] z-[81] w-[calc(100vw-32px)] max-w-[640px] -translate-x-1/2 overflow-hidden rounded-[18px] border border-d-line bg-d-panel text-d-ink shadow-[0_40px_120px_-30px_rgba(0,0,0,0.5)] outline-none">
          <DialogPrimitive.Title className="sr-only">Command palette</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">Jump to a tab, run an action or switch industry</DialogPrimitive.Description>
          <div className="flex items-center gap-3 border-b border-d-line px-4">
            <Search className="h-4 w-4 text-d-mute" />
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCursor(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setCursor((c) => Math.min(shown.length - 1, c + 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setCursor((c) => Math.max(0, c - 1));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  pick(shown[safe]);
                }
              }}
              placeholder="Jump to a tab, run an action, or switch industry…"
              className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-d-mute"
            />
            <kbd className="rounded border border-d-line px-1.5 py-0.5 font-mono text-[10.5px] text-d-mute">esc</kbd>
          </div>
          <div ref={list} className="desk-scroll max-h-[52vh] overflow-y-auto p-2">
            {shown.map((item, index) => {
              const header = item.group !== lastGroup ? item.group : null;
              lastGroup = item.group;
              return (
                <React.Fragment key={item.id}>
                  {header && <p className="px-3 pb-1 pt-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-d-mute">{header}</p>}
                  <button
                    type="button"
                    data-index={index}
                    onMouseMove={() => setCursor(index)}
                    onClick={() => pick(item)}
                    className={cn("flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left", index === safe ? "bg-d-soft" : "")}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-d-line bg-d-paper text-d-accent">
                      {item.group === "Switch industry" ? <LayoutGrid className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-medium">{item.label}</span>
                      {item.sub && <span className="block truncate text-[12px] text-d-mute">{item.sub}</span>}
                    </span>
                    {index === safe && <CornerDownLeft className="h-3.5 w-3.5 text-d-mute" />}
                  </button>
                </React.Fragment>
              );
            })}
            {shown.length === 0 && <p className="px-3 py-8 text-center text-[13px] text-d-mute">No match for “{query}”.</p>}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export const shortcuts = [
  { keys: ["⌘", "K"], label: "Search, jump to a module or switch business" },
  { keys: ["/"], label: "Ask the copilot" },
  { keys: ["1", "–", "9"], label: "Open a module by position (1 is the inbox)" },
  { keys: ["[", "]"], label: "Previous / next module" },
  { keys: [",", "."], label: "Previous / next business" },
  { keys: ["R"], label: "Run the agent" },
  { keys: ["T"], label: "Demo tour" },
  { keys: ["N"], label: "Talking points" },
  { keys: ["C"], label: "Calm mode" },
  { keys: ["F"], label: "Fullscreen" },
  { keys: ["?"], label: "This list" },
];
