"use client";

import * as React from "react";
import { cn } from "cn";

/* A miniature, always-moving version of each industry desk: same frame, palette
   and signature visual as the real dashboard, drawn at 640×400 and scaled to fit. */

type Frame = "atelier" | "ledger" | "control" | "inbox";
type Viz =
  | "tracks"
  | "conveyor"
  | "routes"
  | "sea"
  | "periodic"
  | "plates"
  | "stores"
  | "slabs"
  | "heartbeat"
  | "pulse"
  | "clocks"
  | "chairs"
  | "trays"
  | "mandala"
  | "plan"
  | "wave"
  | "flip"
  | "match"
  | "bento"
  | "register"
  | "kot"
  | "radar"
  | "sun";

export type PreviewSpec = {
  frame: Frame;
  viz: Viz;
  paper: string;
  panel: string;
  ink: string;
  mute: string;
  line: string;
  accent: string;
  alt: string;
  dark?: boolean;
  serif?: boolean;
  mono?: boolean;
  title: string;
  stats: [string, string][];
};

export const previewSpecs: Record<string, PreviewSpec> = {
  "job-shop": { frame: "inbox", viz: "conveyor", paper: "#f6f3ee", panel: "#ffffff", ink: "#24201c", mute: "#7c7268", line: "#e8e0d5", accent: "#b4532a", alt: "#2f5d8a", title: "Shop floor", stats: [["Open jobs", "18"], ["On time", "82%"], ["Rework", "3"]] },
  "stone-yard": { frame: "ledger", viz: "slabs", paper: "#faf5ec", panel: "#fffaf2", ink: "#2a211b", mute: "#85766a", line: "#e6dccc", accent: "#a4532c", alt: "#6b7a3a", title: "बकाया board", stats: [["बकाया", "₹44.1 L"], ["90+ days", "6"], ["Calls", "40"]] },
  "lab-supply": { frame: "atelier", viz: "periodic", paper: "#f2f6f5", panel: "#ffffff", ink: "#132a25", mute: "#5d736c", line: "#d8e5e0", accent: "#0f6b5c", alt: "#c48a2a", mono: true, title: "SKU wall", stats: [["SKUs", "1,284"], ["Near expiry", "37"], ["Reorder", "12"]] },
  textile: { frame: "atelier", viz: "tracks", paper: "#f5f6fa", panel: "#ffffff", ink: "#18203a", mute: "#666d88", line: "#e1e4ee", accent: "#3d5a99", alt: "#bd4a3c", title: "Style calendar", stats: [["On plan", "5/8"], ["Stitched", "1,842"], ["Late", "3"]] },
  "spice-export": { frame: "ledger", viz: "sea", paper: "#f7f1e3", panel: "#fbf6ea", ink: "#1f241c", mute: "#76705e", line: "#e3d9c2", accent: "#3f6b3a", alt: "#c08a2e", serif: true, title: "Shipment atlas", stats: [["At sea", "9"], ["LC due", "2"], ["Lab holds", "1"]] },
  "auto-parts": { frame: "control", viz: "match", paper: "#111418", panel: "#181c22", ink: "#e9edf2", mute: "#8a94a3", line: "#262c35", accent: "#ff7a1a", alt: "#3fb68b", dark: true, mono: true, title: "Part match", stats: [["RFQs", "14"], ["Lots", "6"], ["PPM", "38"]] },
  "fmcg-route": { frame: "atelier", viz: "routes", paper: "#f8f6ec", panel: "#ffffff", ink: "#1a2a1d", mute: "#6a735f", line: "#e5e2d2", accent: "#1d6b3a", alt: "#d08a1f", title: "Beat route", stats: [["Calls", "312"], ["Orders", "₹4.8 L"], ["Strike", "71%"]] },
  "industrial-supply": { frame: "control", viz: "clocks", paper: "#0f1724", panel: "#162133", ink: "#e6ebf3", mute: "#8796ad", line: "#22304a", accent: "#f2b233", alt: "#4fb3d9", dark: true, mono: true, title: "Quote wall", stats: [["RFQs", "27"], ["Due 1h", "5"], ["Won", "62%"]] },
  dental: { frame: "atelier", viz: "chairs", paper: "#f3f8f6", panel: "#ffffff", ink: "#16302a", mute: "#5f746d", line: "#d9e7e1", accent: "#1f7a64", alt: "#e0745a", title: "Chair map", stats: [["In chair", "4/5"], ["Waiting", "3"], ["Today", "38"]] },
  "electronics-retail": { frame: "inbox", viz: "stores", paper: "#f3f7f8", panel: "#ffffff", ink: "#12262b", mute: "#5b7178", line: "#dbe6e8", accent: "#0e7a7a", alt: "#e0a43a", title: "Store grid", stats: [["Sales", "₹18.2 L"], ["Footfall", "1,420"], ["EMI", "64"]] },
  jewellery: { frame: "ledger", viz: "trays", paper: "#f8f3ea", panel: "#fffaf1", ink: "#2a2118", mute: "#7d6d5a", line: "#e8dcc7", accent: "#9a7431", alt: "#6b2f4a", serif: true, title: "Tray tally", stats: [["22K", "₹6,940"], ["Trays", "42"], ["Gap", "1.2 g"]] },
  d2c: { frame: "inbox", viz: "heartbeat", paper: "#f8f4f6", panel: "#ffffff", ink: "#2a1a22", mute: "#7a6670", line: "#ecdfe5", accent: "#8a2f52", alt: "#e0a23b", title: "Order heartbeat", stats: [["Orders", "1,206"], ["RTO", "9.4%"], ["ROAS", "3.1x"]] },
  interiors: { frame: "atelier", viz: "plan", paper: "#f7f2eb", panel: "#fffdf9", ink: "#2f241c", mute: "#7a6a5c", line: "#e6dccd", accent: "#6b442c", alt: "#c9a27a", serif: true, title: "Room planner", stats: [["Quote", "₹6.8 L"], ["Sites", "11"], ["Installs", "4"]] },
  realty: { frame: "inbox", viz: "pulse", paper: "#faf6f2", panel: "#ffffff", ink: "#2a201b", mute: "#786a61", line: "#ece1d7", accent: "#b85a32", alt: "#2d4a6b", title: "Corridor match", stats: [["Buyers", "86"], ["Visits", "14"], ["Tokens", "3"]] },
  "design-studio": { frame: "ledger", viz: "register", paper: "#f6f5f0", panel: "#ffffff", ink: "#1a1a1a", mute: "#6d6d68", line: "#dedcd3", accent: "#1f1f1f", alt: "#e6cf4a", title: "Drawing register", stats: [["Sheets", "214"], ["For approval", "9"], ["IFC", "61"]] },
  agency: { frame: "inbox", viz: "bento", paper: "#f6f5fb", panel: "#ffffff", ink: "#141416", mute: "#6b6b78", line: "#e5e3ef", accent: "#6d4aff", alt: "#ff6b8a", title: "Client pulse", stats: [["Retainers", "22"], ["At risk", "3"], ["MRR", "₹31 L"]] },
  "print-shop": { frame: "control", viz: "conveyor", paper: "#0d0f12", panel: "#15181d", ink: "#eef1f4", mute: "#8b939e", line: "#242830", accent: "#22b8f0", alt: "#e5007e", dark: true, mono: true, title: "Press line", stats: [["Sq ft", "8,420"], ["Jobs", "31"], ["Proofs", "7"]] },
  advisory: { frame: "ledger", viz: "mandala", paper: "#f8f1e4", panel: "#fdf8ee", ink: "#2b1a14", mute: "#7d6655", line: "#e7d9c1", accent: "#8a2c1d", alt: "#c9a24a", serif: true, title: "Vastu mandala", stats: [["Audits", "6"], ["Cohort", "24"], ["Harmony", "72"]] },
  courier: { frame: "control", viz: "routes", paper: "#141414", panel: "#1c1c1c", ink: "#f2f2ee", mute: "#9a988f", line: "#2c2c2a", accent: "#f5c400", alt: "#ff6a3d", dark: true, mono: true, title: "Live routes", stats: [["Riders", "85"], ["Delivered", "2,914"], ["NDR", "4.1%"]] },
  fleet: { frame: "control", viz: "plates", paper: "#101614", panel: "#17201d", ink: "#e8efe9", mute: "#8a9a92", line: "#24302b", accent: "#b7d37a", alt: "#f5d76e", dark: true, mono: true, title: "Fleet matrix", stats: [["On trip", "41/60"], ["Diesel", "3.9 km/l"], ["Permits", "4"]] },
  "learning-kits": { frame: "inbox", viz: "wave", paper: "#f5f3e8", panel: "#ffffff", ink: "#1b2b20", mute: "#69705f", line: "#e4e0cc", accent: "#2c5e3f", alt: "#e0b84a", title: "Voice delegator", stats: [["Schools", "340"], ["Kits", "6,200"], ["Tenders", "3"]] },
  tours: { frame: "atelier", viz: "flip", paper: "#f6f2ea", panel: "#ffffff", ink: "#16213a", mute: "#6c6f80", line: "#e6e0d3", accent: "#d9782d", alt: "#16213a", title: "Departures", stats: [["Groups", "12"], ["Seats", "88%"], ["Visas", "19"]] },
  "dairy-fpo": { frame: "atelier", viz: "pulse", paper: "#f4f8f4", panel: "#ffffff", ink: "#16291d", mute: "#5f7365", line: "#dce8de", accent: "#2f7d4f", alt: "#3b5ba9", title: "Village milk pulse", stats: [["Litres", "41,860"], ["Fat", "4.6%"], ["Villages", "38"]] },
  restaurant: { frame: "control", viz: "kot", paper: "#14100d", panel: "#1d1814", ink: "#f4ece4", mute: "#a3958a", line: "#2e2620", accent: "#e85d2a", alt: "#f2b733", dark: true, mono: true, title: "Kitchen pass", stats: [["Live KOTs", "27"], ["Avg prep", "14m"], ["Breaches", "2"]] },
  "pharma-distribution": { frame: "inbox", viz: "radar", paper: "#f3f7fb", panel: "#ffffff", ink: "#132235", mute: "#5f6f82", line: "#dbe4ee", accent: "#1f6fb2", alt: "#d94f6b", title: "Expiry radar", stats: [["Batches", "3,412"], ["< 3 months", "46"], ["Claims", "₹6.2 L"]] },
  "solar-epc": { frame: "atelier", viz: "sun", paper: "#faf7ee", panel: "#ffffff", ink: "#1b2a22", mute: "#6b7364", line: "#ebe4d2", accent: "#1f4d3a", alt: "#f2a900", title: "Rooftop yield", stats: [["Live kW", "412"], ["Today", "2,860 kWh"], ["Installs", "31"]] },
};

const fallback = previewSpecs.textile;

/* deterministic pseudo-random per slug */
function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  // integer-only mixing so server and browser produce identical numbers
  return (n: number) => {
    let t = (h + Math.imul(n + 1, 0x9e3779b1)) | 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return Math.round((((t ^ (t >>> 14)) >>> 0) / 4294967296) * 1000) / 1000;
  };
}

function useInView<T extends HTMLElement>() {
  const ref = React.useRef<T>(null);
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, inView };
}

function useTick(active: boolean, every = 1100) {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setTick((t) => t + 1), every);
    return () => window.clearInterval(id);
  }, [active, every]);
  return tick;
}

export function LivePreview({ slug, className, speed = 1100 }: { slug: string; className?: string; speed?: number }) {
  const spec = previewSpecs[slug] ?? fallback;
  const { ref, inView } = useInView<HTMLDivElement>();
  const [scale, setScale] = React.useState(0.5);
  const tick = useTick(inView, speed);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setScale((el.getBoundingClientRect().width || 320) / 640);
    const frame = window.requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      window.cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [ref]);

  return (
    <div ref={ref} className={cn("relative aspect-[16/10] w-full overflow-hidden", className)} style={{ background: spec.paper }}>
      <div
        key={slug}
        className={cn("lp lp-fade absolute left-0 top-0 h-[400px] w-[640px] origin-top-left", !inView && "lp-paused")}
        style={{ transform: `scale(${scale})`, color: spec.ink, fontFamily: spec.mono ? "var(--font-mono)" : "var(--font-sans)" }}
      >
        <Chrome spec={spec} tick={tick}>
          <VizView slug={slug} spec={spec} tick={tick} />
        </Chrome>
      </div>
    </div>
  );
}

/* ---------------- Frame chrome ---------------- */

function Chrome({ spec, tick, children }: { spec: PreviewSpec; tick: number; children: React.ReactNode }) {
  const statRow = (
    <div className="flex gap-2">
      {spec.stats.map(([label, value], i) => (
        <div key={label} className="flex-1 rounded-[8px] px-2.5 py-1.5" style={{ background: spec.panel, border: `1px solid ${spec.line}` }}>
          <p className="text-[9px]" style={{ color: spec.mute }}>
            {label}
          </p>
          <p className="text-[15px] font-semibold leading-tight tabular-nums" style={{ fontFamily: spec.serif ? "var(--font-serif)" : undefined }}>
            {i === 1 && tick % 4 === 3 ? <span className="lp-flash">{value}</span> : value}
          </p>
        </div>
      ))}
    </div>
  );

  if (spec.frame === "ledger") {
    return (
      <div className="flex h-full">
        <div className="w-[120px] shrink-0 border-r px-3 pt-4" style={{ borderColor: spec.line }}>
          <div className="h-5 w-5 border-2" style={{ borderColor: spec.ink }} />
          <p className="mt-2 text-[8px] font-semibold uppercase tracking-[0.2em]" style={{ color: spec.mute }}>
            Contents
          </p>
          {[64, 48, 56, 40, 52, 44, 36].map((w, i) => (
            <div key={i} className="mt-2 flex items-center gap-1">
              <span className="h-[5px] rounded-full" style={{ width: w, background: i === tick % 7 ? spec.accent : `${spec.ink}55` }} />
              <span className="h-px flex-1 border-b border-dotted" style={{ borderColor: `${spec.mute}88` }} />
            </div>
          ))}
        </div>
        <div className="min-w-0 flex-1 px-5 pt-4" style={{ backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 19px, ${spec.line}aa 19px 20px)` }}>
          <div className="border-b pb-1.5 text-[8px] font-semibold uppercase tracking-[0.2em]" style={{ borderColor: spec.ink, color: spec.mute }}>
            Today · live
          </div>
          <p className="mt-2 text-[30px] font-semibold leading-none" style={{ fontFamily: "var(--font-serif)" }}>
            {spec.title}
          </p>
          <div className="mt-3" style={{ borderTop: `2px solid ${spec.ink}` }} />
          <div className="mt-2 h-[205px]">{children}</div>
          <div className="mt-2">{statRow}</div>
        </div>
      </div>
    );
  }

  if (spec.frame === "control") {
    return (
      <div className="flex h-full" style={{ background: spec.paper }}>
        <div className="flex w-[44px] shrink-0 flex-col items-center gap-2.5 border-r pt-3" style={{ borderColor: spec.line, background: spec.panel }}>
          <span className="h-6 w-6 rounded-[6px]" style={{ background: spec.accent }} />
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i} className="h-4 w-4 rounded-[4px]" style={{ background: i === tick % 7 ? `${spec.accent}55` : spec.line }} />
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between border-b px-4 py-1.5 text-[8px] uppercase tracking-[0.16em]" style={{ borderColor: spec.line, color: spec.mute }}>
            <span className="flex items-center gap-1.5">
              <span className="lp-ping h-1.5 w-1.5 rounded-full" style={{ background: "#3fb68b" }} /> online / {spec.title}
            </span>
            <span className="tabular-nums">{`${String(9 + (tick % 3)).padStart(2, "0")}:${String((tick * 7) % 60).padStart(2, "0")}:${String((tick * 13) % 60).padStart(2, "0")}`}</span>
          </div>
          <div className="flex border-b" style={{ borderColor: spec.line }}>
            {spec.stats.map(([label, value]) => (
              <div key={label} className="flex-1 border-r px-3 py-1.5 last:border-r-0" style={{ borderColor: spec.line }}>
                <p className="text-[7.5px] uppercase tracking-[0.12em]" style={{ color: spec.mute }}>
                  {label}
                </p>
                <p className="text-[14px] font-semibold tabular-nums">{value}</p>
              </div>
            ))}
          </div>
          <div className="lp-scan h-[318px] p-3">{children}</div>
        </div>
      </div>
    );
  }

  if (spec.frame === "inbox") {
    return (
      <div className="flex h-full">
        <div className="w-[110px] shrink-0 border-r px-2.5 pt-3" style={{ borderColor: spec.line, background: spec.panel }}>
          <div className="flex items-center gap-1.5">
            <span className="h-5 w-5 rounded-[6px]" style={{ background: spec.accent }} />
            <span className="h-[5px] w-12 rounded-full" style={{ background: `${spec.ink}66` }} />
          </div>
          <div className="mt-3 flex items-center justify-between rounded-[6px] px-1.5 py-1" style={{ background: `${spec.accent}18` }}>
            <span className="h-[5px] w-9 rounded-full" style={{ background: spec.accent }} />
            <span className="rounded-full px-1 text-[7px] font-bold text-white" style={{ background: spec.accent }}>
              {7 - (tick % 4)}
            </span>
          </div>
          {[50, 62, 44, 56, 40, 48].map((w, i) => (
            <span key={i} className="mt-2.5 block h-[5px] rounded-full" style={{ width: w, background: `${spec.ink}30` }} />
          ))}
        </div>
        <div className="min-w-0 flex-1 px-4 pt-3">
          <p className="text-[19px] font-semibold leading-none" style={{ fontFamily: "var(--font-display)" }}>
            Good morning, <span style={{ color: spec.accent }}>owner</span>.
          </p>
          <div className="mt-1.5 h-[5px] w-[70%] rounded-full" style={{ background: `${spec.ink}22` }} />
          <div className="mt-3 flex gap-3">
            <div className="w-[150px] shrink-0 space-y-2">
              {[0, 1, 2].map((i) => {
                const n = (tick + i) % 5;
                return (
                  <div key={`${i}-${Math.floor((tick + i) / 5)}`} className="lp-in rounded-[8px] p-2" style={{ background: spec.panel, border: `1px solid ${spec.line}` }}>
                    <span className="rounded-full px-1.5 text-[7px] font-semibold" style={{ color: [spec.accent, spec.alt, "#b3412f", "#2f7d5b", spec.accent][n], background: `${[spec.accent, spec.alt, "#b3412f", "#2f7d5b", spec.accent][n]}1f` }}>
                      {["Approval", "Money", "Risk", "People", "Reply"][n]}
                    </span>
                    <span className="mt-1.5 block h-[5px] w-[90%] rounded-full" style={{ background: `${spec.ink}55` }} />
                    <span className="mt-1 block h-[4px] w-[70%] rounded-full" style={{ background: `${spec.ink}25` }} />
                    <span className="mt-1.5 inline-block h-[10px] w-10 rounded-full" style={{ background: spec.accent }} />
                  </div>
                );
              })}
            </div>
            <div className="min-w-0 flex-1 rounded-[10px] p-2" style={{ background: spec.panel, border: `1px solid ${spec.line}` }}>
              <p className="flex items-center gap-1 text-[8px] font-semibold uppercase tracking-[0.12em]" style={{ color: spec.accent }}>
                <span className="lp-ping h-1.5 w-1.5 rounded-full" style={{ background: spec.accent }} /> live · {spec.title}
              </p>
              <div className="mt-1 h-[250px]">{children}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // atelier
  return (
    <div className="flex h-full flex-col px-5 pt-4">
      <div className="flex items-center gap-2.5">
        <span className="h-8 w-8 rounded-[10px]" style={{ background: spec.accent }} />
        <div>
          <p className="text-[15px] font-semibold leading-tight" style={{ fontFamily: spec.serif ? "var(--font-serif)" : "var(--font-display)" }}>
            {spec.title}
          </p>
          <span className="block h-[4px] w-28 rounded-full" style={{ background: `${spec.ink}25` }} />
        </div>
        <span className="ml-auto h-5 w-16 rounded-full" style={{ background: spec.accent }} />
      </div>
      <div className="relative mt-3 h-[22px] rounded-[10px] px-3" style={{ background: spec.panel, border: `1px solid ${spec.line}` }}>
        <span className="absolute left-3 right-3 top-[9px] h-[3px] rounded-full" style={{ background: `${spec.ink}14` }} />
        <span className="lp-day absolute left-3 top-[9px] h-[3px] rounded-full" style={{ background: spec.accent }} />
        {[0.12, 0.28, 0.45, 0.62, 0.8].map((x) => (
          <span key={x} className="absolute top-[6px] h-[9px] w-[9px] rounded-full border-2" style={{ left: `calc(12px + ${x} * (100% - 24px))`, borderColor: spec.panel, background: spec.accent, boxShadow: `0 0 0 1px ${spec.accent}` }} />
        ))}
      </div>
      <div className="mt-2 flex gap-1 rounded-full p-0.5" style={{ background: `${spec.ink}0d` }}>
        {[46, 54, 40, 50, 44, 38].map((w, i) => (
          <span key={i} className="h-[14px] rounded-full" style={{ width: w + 12, background: i === tick % 6 ? spec.panel : "transparent", boxShadow: i === tick % 6 ? "0 1px 4px rgba(0,0,0,.12)" : undefined }} />
        ))}
      </div>
      <div className="mt-2">{statRow}</div>
      <div className="mt-2 flex-1 rounded-[12px] p-2.5" style={{ background: spec.panel, border: `1px solid ${spec.line}` }}>
        <div className="h-[218px]">{children}</div>
      </div>
    </div>
  );
}

/* ---------------- Signature visuals ---------------- */

function VizView({ slug, spec, tick }: { slug: string; spec: PreviewSpec; tick: number }) {
  const r = React.useMemo(() => seeded(slug), [slug]);
  const a = spec.accent;
  const b = spec.alt;
  const ink = spec.ink;
  const soft = `${ink}14`;
  switch (spec.viz) {
    case "tracks":
      return (
        <svg viewBox="0 0 400 218" className="h-full w-full">
          <line x1={120 + (tick % 20) * 0} x2={120} y1="0" y2="218" stroke={ink} strokeOpacity=".5" />
          {Array.from({ length: 7 }, (_, i) => {
            const start = 10 + r(i) * 40;
            const len = 180 + r(i + 9) * 150;
            const late = i === 1 || i === 2 || i === 5;
            return (
              <g key={i} transform={`translate(0 ${12 + i * 29})`}>
                <circle cx="10" cy="8" r="7" fill={i % 2 ? b : a} opacity=".75" />
                {Array.from({ length: 5 }, (_, s) => {
                  const x = start + (len / 5) * s + 24;
                  const done = x < 120 + (tick % 8) * 6;
                  return <rect key={s} x={x} y="3" width={len / 5 - 4} height="10" rx="5" fill={late && s === 2 ? "#bd4a3c" : done ? a : `${a}2e`} className="lp-grow" style={{ animationDelay: `${(i * 5 + s) * 30}ms` }} />;
                })}
                <rect x={start + len + 26} y="-2" width="2.5" height="20" rx="1" fill="#6e2b36" />
                {late && <rect x={start + len + 32} y="2" width="22" height="12" rx="6" fill="#bd4a3c" />}
              </g>
            );
          })}
        </svg>
      );
    case "conveyor":
      return (
        <div className="relative h-full">
          <div className="grid h-[34px] grid-cols-6 gap-1.5">
            {["Art", "Cut", "Make", "Fit", "Test", "Ship"].map((s, i) => (
              <div key={s} className="flex flex-col justify-center rounded-[6px] px-1.5" style={{ background: soft }}>
                <span className="text-[8px] font-semibold">{s}</span>
                <span className="text-[7px]" style={{ color: spec.mute }}>
                  {3 + ((tick + i) % 4)} jobs
                </span>
              </div>
            ))}
          </div>
          {[0, 1, 2].map((row) => (
            <div key={row} className="relative mt-4 h-[46px] overflow-hidden rounded-[8px]" style={{ background: soft }}>
              <div className="lp-belt absolute inset-x-0 bottom-0 h-[6px]" style={{ backgroundImage: `repeating-linear-gradient(90deg, ${ink}33 0 3px, transparent 3px 14px)` }} />
              {Array.from({ length: 4 }, (_, k) => (
                <div
                  key={k}
                  className="lp-ride absolute top-[6px] h-[30px] w-[70px] rounded-[6px] px-1.5 py-1"
                  style={{ animationDelay: `${-(k * 2.4 + row * 1.1)}s`, animationDuration: `${9 + row}s`, background: spec.panel, border: `1px solid ${k === 1 && row === 1 ? b : spec.line}`, boxShadow: "0 3px 8px rgba(0,0,0,.12)" }}
                >
                  <span className="block h-[4px] w-10 rounded-full" style={{ background: k === 1 && row === 1 ? b : a }} />
                  <span className="mt-1 block h-[3px] w-12 rounded-full" style={{ background: `${ink}33` }} />
                  <span className="mt-1 block h-[3px] w-8 rounded-full" style={{ background: `${ink}22` }} />
                </div>
              ))}
            </div>
          ))}
          {spec.dark && (
            <div className="mt-3 flex gap-2">
              {["#22b8f0", "#e5007e", "#f5d400", "#9aa0a6"].map((c, i) => (
                <div key={c} className="flex-1">
                  <div className="h-[6px] overflow-hidden rounded-full" style={{ background: soft }}>
                    <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${40 + ((tick * 7 + i * 17) % 55)}%`, background: c }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    case "routes":
    case "sea": {
      const sea = spec.viz === "sea";
      const nodes = Array.from({ length: sea ? 6 : 9 }, (_, i) => ({ x: 30 + r(i) * 340, y: 20 + r(i + 30) * 170 }));
      const hub = sea ? { x: 250, y: 150 } : { x: 200, y: 110 };
      return (
        <svg viewBox="0 0 400 218" className="h-full w-full">
          {sea ? (
            <path d="M0 160 C 60 120, 120 190, 180 150 S 300 120, 400 160 L400 218 L0 218 Z" fill={`${b}22`} />
          ) : (
            Array.from({ length: 8 }, (_, i) => <line key={i} x1="0" x2="400" y1={i * 30} y2={i * 30 + (r(i) - 0.5) * 30} stroke={soft} strokeWidth="6" />)
          )}
          {nodes.map((n, i) => (
            <g key={i}>
              <path d={`M${hub.x} ${hub.y} Q ${(hub.x + n.x) / 2 + 30} ${(hub.y + n.y) / 2 - 40} ${n.x} ${n.y}`} fill="none" stroke={i % 3 === 0 ? b : a} strokeWidth="1.8" strokeDasharray="5 5" className="lp-flow" opacity=".85" />
              <circle cx={n.x} cy={n.y} r={4} fill={spec.panel} stroke={i % 3 === 0 ? b : a} strokeWidth="2" />
              {i === tick % nodes.length && <circle cx={n.x} cy={n.y} r="10" fill="none" stroke={a} className="lp-ring" />}
            </g>
          ))}
          <circle cx={hub.x} cy={hub.y} r="8" fill={a} />
          <circle cx={hub.x} cy={hub.y} r="14" fill="none" stroke={a} className="lp-ring" />
          {nodes.slice(0, 4).map((n, i) => (
            <circle key={`m${i}`} r="3.5" fill={b}>
              <animateMotion dur={`${6 + i * 1.5}s`} repeatCount="indefinite" path={`M${hub.x} ${hub.y} Q ${(hub.x + n.x) / 2 + 30} ${(hub.y + n.y) / 2 - 40} ${n.x} ${n.y}`} />
            </circle>
          ))}
        </svg>
      );
    }
    case "periodic":
      return (
        <div className="grid h-full grid-cols-9 gap-1">
          {["HCl", "ACN", "MeOH", "NaOH", "H₂SO₄", "IPA", "DMSO", "KBr", "EtOH", "THF", "DCM", "HNO₃", "NH₃", "KOH", "Hex", "TEA", "AcOH", "NaCl", "Tol", "DMF", "EDTA", "Na₂CO₃", "CHCl₃", "Acetone", "BaCl₂", "AgNO₃", "KI"].map((sym, i) => {
            const state = (i * 7 + tick) % 11 === 0 ? "late" : (i * 3) % 8 === 0 ? "warn" : "ok";
            const c = state === "late" ? "#bd4a3c" : state === "warn" ? b : a;
            return (
              <div key={sym} className="flex flex-col justify-between rounded-[5px] p-1 transition-colors duration-500" style={{ background: `${c}${state === "ok" ? "1a" : "33"}`, border: `1px solid ${c}55` }}>
                <span className="text-[6px]" style={{ color: spec.mute }}>
                  {i + 1}
                </span>
                <span className="text-center text-[10px] font-bold leading-none" style={{ color: c }}>
                  {sym}
                </span>
                <span className="text-right text-[6px]" style={{ color: spec.mute }}>
                  {["AR", "HPLC", "GR"][i % 3]}
                </span>
              </div>
            );
          })}
        </div>
      );
    case "plates":
      return (
        <div className="grid h-full grid-cols-5 gap-1.5">
          {Array.from({ length: 20 }, (_, i) => {
            const st = (i * 5 + tick) % 13;
            const c = st < 7 ? a : st < 10 ? "#4fb3d9" : st < 12 ? b : "#e05a4a";
            return (
              <div key={i} className="flex flex-col justify-between rounded-[6px] p-1.5" style={{ background: spec.panel, border: `1px solid ${spec.line}`, boxShadow: `inset 3px 0 0 ${c}` }}>
                <span className="rounded-[3px] px-1 text-center text-[8px] font-bold text-black" style={{ background: "#f5d76e" }}>
                  TN 28 {String(1000 + i * 137).slice(0, 4)}
                </span>
                <span className="text-[7px]" style={{ color: spec.mute }}>
                  {["On trip", "On trip", "Loading", "Idle", "Workshop"][st % 5]}
                </span>
                <span className="text-[8px] tabular-nums">{(12000 + i * 731 + tick * 3).toLocaleString("en-IN")} km</span>
              </div>
            );
          })}
        </div>
      );
    case "stores":
      return (
        <div className="grid h-full grid-cols-4 gap-1.5">
          {["Rajkot 1", "Rajkot 2", "Rajkot 3", "Jamnagar", "Junagadh", "Bhavnagar", "Morbi", "Gondal", "Porbandar", "Amreli", "Surendra.", "Online"].map((s, i) => {
            const v = 40 + ((i * 13 + tick * 5) % 55);
            return (
              <div key={s} className="flex flex-col justify-between rounded-[7px] p-1.5" style={{ background: `${a}${v > 75 ? "26" : "10"}`, border: `1px solid ${spec.line}` }}>
                <span className="flex items-center justify-between text-[8px] font-semibold">
                  {s}
                  {i === tick % 12 && <span className="lp-ping h-1.5 w-1.5 rounded-full" style={{ background: a }} />}
                </span>
                <span className="text-[11px] font-semibold tabular-nums">₹{(v / 30).toFixed(1)} L</span>
                <span className="h-[4px] overflow-hidden rounded-full" style={{ background: soft }}>
                  <span className="block h-full rounded-full transition-[width] duration-700" style={{ width: `${v}%`, background: v > 80 ? b : a }} />
                </span>
              </div>
            );
          })}
        </div>
      );
    case "slabs":
      return (
        <svg viewBox="0 0 400 205" className="h-full w-full">
          {Array.from({ length: 10 }, (_, i) => {
            const h = 50 + r(i) * 120;
            const x = 10 + i * 38;
            return (
              <g key={i}>
                {[0.25, 0.25, 0.25, 0.25].map((f, k) => (
                  <rect key={k} x={x} y={195 - h + h * f * k} width="30" height={h * f - 2} rx="2" fill={[`${b}55`, `${b}99`, `${a}bb`, a][k]} className="lp-grow" style={{ animationDelay: `${i * 60}ms` }} />
                ))}
                {r(i + 4) > 0.6 && <text x={x + 15} y={188 - h} textAnchor="middle" fontSize="10" fill="#b3412f">▲</text>}
              </g>
            );
          })}
          <rect x={10 + (tick % 10) * 38 - 3} y="0" width="36" height="200" fill="none" stroke={ink} strokeDasharray="3 3" opacity=".4" />
        </svg>
      );
    case "heartbeat": {
      const pts = Array.from({ length: 60 }, (_, i) => {
        const k = i + tick * 2;
        const spike = k % 23 === 0 ? 70 : k % 23 === 1 ? -40 : 0;
        return `${i * 6.7},${120 - (20 + ((k * 37) % 30) + spike)}`;
      });
      return (
        <svg viewBox="0 0 400 218" className="h-full w-full">
          {Array.from({ length: 8 }, (_, i) => (
            <line key={i} x1="0" x2="400" y1={i * 30} y2={i * 30} stroke={soft} />
          ))}
          <polyline points={pts.join(" ")} fill="none" stroke={a} strokeWidth="2.2" strokeLinejoin="round" />
          <circle cx="395" cy={pts[59].split(",")[1]} r="4" fill={a} className="lp-ping-svg" />
          {Array.from({ length: 4 }, (_, i) => (
            <g key={`${tick}-${i}`} className="lp-in" transform={`translate(${20 + i * 95} 165)`}>
              <rect width="85" height="38" rx="6" fill={spec.panel} stroke={spec.line} />
              <text x="7" y="15" fontSize="9" fontWeight="600" fill={ink}>
                {["Pune", "Indore", "Kochi", "Jaipur", "Surat", "Mysuru"][(tick + i) % 6]}
              </text>
              <text x="7" y="29" fontSize="8" fill={(tick + i) % 3 ? a : b}>
                {(tick + i) % 3 ? "Prepaid" : "COD"} · ₹{499 + ((tick + i) * 113) % 900}
              </text>
            </g>
          ))}
        </svg>
      );
    }
    case "pulse": {
      const nodes = Array.from({ length: 16 }, (_, i) => ({ x: 25 + r(i) * 350, y: 15 + r(i + 50) * 185 }));
      return (
        <svg viewBox="0 0 400 218" className="h-full w-full">
          <path d="M0 120 C 90 90, 160 150, 240 110 S 360 80, 400 100" fill="none" stroke={`${b}44`} strokeWidth="12" strokeLinecap="round" />
          {nodes.map((n, i) => {
            const hot = (i + tick) % 5 === 0;
            return (
              <g key={i}>
                {i % 4 === 0 && <line x1={n.x} y1={n.y} x2={nodes[(i + 5) % 16].x} y2={nodes[(i + 5) % 16].y} stroke={a} strokeWidth="1.2" strokeDasharray="4 4" className="lp-flow" opacity=".7" />}
                <circle cx={n.x} cy={n.y} r={4 + r(i + 3) * 5} fill={hot ? a : `${a}66`} className="transition-all duration-500" />
                {hot && <circle cx={n.x} cy={n.y} r="9" fill="none" stroke={a} className="lp-ring" />}
              </g>
            );
          })}
          <text x="390" y="210" textAnchor="end" fontSize="13" fontWeight="700" fill={ink} className="tabular-nums">
            {(41860 + tick * 37).toLocaleString("en-IN")}
          </text>
        </svg>
      );
    }
    case "clocks":
      return (
        <div className="grid h-full grid-cols-4 gap-2">
          {Array.from({ length: 8 }, (_, i) => {
            const left = (1 - (((tick * 3 + i * 11) % 100) / 100)) * 100;
            const c = left < 25 ? "#e05a4a" : left < 50 ? a : "#4fb3d9";
            return (
              <div key={i} className="flex flex-col items-center justify-center rounded-[8px] p-1.5" style={{ background: spec.panel, border: `1px solid ${spec.line}` }}>
                <svg viewBox="0 0 40 40" className="h-[54px] w-[54px] -rotate-90">
                  <circle cx="20" cy="20" r="16" fill="none" stroke={spec.line} strokeWidth="4" />
                  <circle cx="20" cy="20" r="16" fill="none" stroke={c} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(left / 100) * 100.5} 100.5`} style={{ transition: "stroke-dasharray .9s linear" }} />
                </svg>
                <span className="mt-1 text-[8px] font-semibold">RFQ-{4120 + i}</span>
                <span className="text-[7px] tabular-nums" style={{ color: spec.mute }}>
                  {Math.round(left * 0.6)}m left
                </span>
              </div>
            );
          })}
        </div>
      );
    case "chairs":
      return (
        <svg viewBox="0 0 400 218" className="h-full w-full">
          <rect x="4" y="4" width="392" height="210" rx="10" fill="none" stroke={spec.line} strokeWidth="2" />
          {Array.from({ length: 5 }, (_, i) => {
            const x = 40 + i * 78;
            const p = ((tick * 4 + i * 23) % 100) / 100;
            const free = i === 3 && tick % 6 < 2;
            return (
              <g key={i} transform={`translate(${x} 70)`}>
                <rect x="-24" y="-40" width="48" height="96" rx="10" fill={free ? `${a}10` : `${a}1f`} stroke={free ? spec.line : a} strokeDasharray={free ? "4 4" : undefined} />
                <ellipse cx="0" cy="8" rx="12" ry="22" fill={free ? spec.line : a} opacity=".75" />
                <circle cx="0" cy="-22" r="13" fill="none" stroke={spec.line} strokeWidth="3" />
                {!free && <circle cx="0" cy="-22" r="13" fill="none" stroke={b} strokeWidth="3" strokeDasharray={`${p * 81.7} 81.7`} transform="rotate(-90 0 -22)" style={{ transition: "stroke-dasharray .9s linear" }} />}
                <text y="74" textAnchor="middle" fontSize="9" fontWeight="600" fill={ink}>
                  Chair {i + 1}
                </text>
              </g>
            );
          })}
          {Array.from({ length: 3 }, (_, i) => (
            <circle key={i} cx={30 + i * 18} cy="196" r="6" fill={b} opacity={0.5 + i * 0.15} />
          ))}
        </svg>
      );
    case "trays":
      return (
        <div className="grid h-full grid-cols-5 gap-2">
          {["Bangles", "Chains", "Necklace", "Earrings", "Rings"].map((t, i) => {
            const exp = 380 + i * 95;
            const counted = Math.min(exp, Math.round(exp * (((tick * 9 + i * 20) % 100) / 100)));
            const gap = i === 2 && counted >= exp - 4;
            return (
              <div key={t} className="flex flex-col rounded-[6px] p-1.5" style={{ background: `linear-gradient(180deg, ${a}22, transparent)`, border: `1px solid ${gap ? "#b3412f" : `${a}55`}` }}>
                <span className="text-[9px] font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
                  {t}
                </span>
                <div className="mt-1 flex flex-1 flex-wrap content-start gap-[3px]">
                  {Array.from({ length: 12 }, (_, k) => (
                    <span key={k} className="h-[9px] w-[9px] rounded-full" style={{ background: k / 12 < counted / exp ? a : `${a}2a`, boxShadow: `inset 0 0 0 1.5px ${a}` }} />
                  ))}
                </div>
                <span className="text-[10px] font-semibold tabular-nums">{counted} g</span>
                <span className="text-[7px]" style={{ color: gap ? "#b3412f" : spec.mute }}>
                  {gap ? "1.2 g short" : `of ${exp} g`}
                </span>
              </div>
            );
          })}
        </div>
      );
    case "mandala":
      return (
        <div className="flex h-full items-center justify-center">
          <div className="grid aspect-square h-full grid-cols-9 gap-[2px] p-1" style={{ background: `${a}22` }}>
            {Array.from({ length: 81 }, (_, i) => {
              const row = Math.floor(i / 9);
              const col = i % 9;
              const centre = row >= 3 && row <= 5 && col >= 3 && col <= 5;
              const issue = (i * 7 + tick * 3) % 29 === 0 || i === 8 || i === 72;
              return <span key={i} className="transition-colors duration-500" style={{ background: centre ? `${b}88` : issue ? a : (row + col) % 2 ? `${spec.panel}` : `${a}12` }} />;
            })}
          </div>
        </div>
      );
    case "plan":
      return (
        <svg viewBox="0 0 400 218" className="h-full w-full">
          <g fill="none" stroke={ink} strokeWidth="3">
            <rect x="10" y="10" width="380" height="198" />
            <line x1="170" y1="10" x2="170" y2="130" />
            <line x1="10" y1="130" x2="260" y2="130" />
            <line x1="260" y1="10" x2="260" y2="208" />
          </g>
          {[
            { x: 14, y: 14, w: 152, h: 112, l: "Bedroom" },
            { x: 174, y: 14, w: 82, h: 112, l: "Bath" },
            { x: 264, y: 14, w: 122, h: 190, l: "Living" },
            { x: 14, y: 134, w: 242, h: 70, l: "Kitchen" },
          ].map((room, i) => (
            <g key={room.l}>
              <rect x={room.x} y={room.y} width={room.w} height={room.h} fill={i === tick % 4 ? `${a}22` : "transparent"} className="transition-all duration-500" />
              <text x={room.x + 8} y={room.y + 16} fontSize="10" fill={spec.mute} fontFamily="var(--font-serif)">
                {room.l}
              </text>
            </g>
          ))}
          <rect x={30 + (tick % 3) * 8} y="80" width="70" height="18" rx="2" fill={b} opacity=".85" />
          <rect x="20" y="160" width="140" height="14" rx="2" fill={a} opacity=".7" />
          <line x1={300} y1="10" x2={350} y2="10" stroke={b} strokeWidth="6" />
          <line x1="390" y1={70} x2="390" y2={130} stroke={b} strokeWidth="6" />
          <g transform="translate(278 168)">
            <rect width="100" height="30" rx="6" fill={spec.panel} stroke={spec.line} />
            <text x="8" y="19" fontSize="12" fontWeight="700" fill={a}>
              ₹{(6.4 + (tick % 5) * 0.12).toFixed(2)} L
            </text>
          </g>
        </svg>
      );
    case "wave":
      return (
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2 rounded-[10px] p-2" style={{ background: `${a}12` }}>
            <span className="lp-ping flex h-7 w-7 items-center justify-center rounded-full" style={{ background: "#c4472f" }}>
              <span className="h-2.5 w-2.5 rounded-full bg-white" />
            </span>
            <div className="flex h-8 flex-1 items-center gap-[3px]">
              {Array.from({ length: 40 }, (_, i) => (
                <span key={i} className="w-[3px] rounded-full transition-[height] duration-300" style={{ height: `${15 + ((i * 17 + tick * 23) % 80)}%`, background: a }} />
              ))}
            </div>
          </div>
          <p className="mt-2 text-[9.5px] leading-snug" style={{ color: spec.mute }}>
            “Rakesh, Gaya wale school ka order kal tak dispatch karo, aur Neha trainer visit Friday ko…”
          </p>
          <div className="mt-2 grid flex-1 grid-cols-2 gap-1.5">
            {["Dispatch Gaya order", "Trainer visit Friday", "Call DEO Nalanda", "Tender docs ready"].map((t, i) => (
              <div key={t} className={cn("rounded-[7px] p-1.5", i <= tick % 5 ? "lp-in" : "opacity-0")} style={{ background: spec.panel, border: `1px solid ${spec.line}` }}>
                <span className="text-[9px] font-semibold">{t}</span>
                <span className="mt-1 flex items-center gap-1 text-[7.5px]" style={{ color: spec.mute }}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: i % 2 ? b : a }} />
                  {["Rakesh", "Neha", "Owner", "Sunil"][i]} · {["tomorrow", "Fri", "today", "Mon"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    case "flip": {
      const rows = ["DARJEELING", "SIKKIM", "KASHMIR", "KERALA", "BHUTAN", "DUBAI"];
      return (
        <div className="h-full rounded-[8px] p-2" style={{ background: "#16213a" }}>
          {rows.map((place, i) => (
            <div key={place} className="mb-1.5 flex items-center gap-2">
              <span className="flex gap-[2px]">
                {place.padEnd(10).split("").map((ch, k) => (
                  <span key={k} className={cn("flex h-[20px] w-[13px] items-center justify-center rounded-[2px] font-mono text-[10px] font-bold text-[#f6d98a]", (tick + i) % 6 === 0 && k < 3 && "lp-flip")} style={{ background: "#0d1529", boxShadow: "inset 0 -1px 0 rgba(255,255,255,.08)" }}>
                    {ch}
                  </span>
                ))}
              </span>
              <span className="font-mono text-[9px] text-white/70">{`${12 + i * 3} OCT`}</span>
              <span className="h-[5px] flex-1 overflow-hidden rounded-full bg-white/10">
                <span className="block h-full rounded-full" style={{ width: `${55 + ((i * 9 + tick) % 40)}%`, background: a }} />
              </span>
              <span className="w-[42px] text-right font-mono text-[8px]" style={{ color: i === 1 ? "#ff8a6a" : "#9be3b5" }}>
                {i === 1 ? "WAITLIST" : "ON TIME"}
              </span>
            </div>
          ))}
        </div>
      );
    }
    case "match": {
      const typed = "SAC-4821-K".slice(0, Math.min(10, (tick % 14) + 1));
      return (
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2 rounded-[6px] px-2 py-1.5" style={{ background: spec.panel, border: `1px solid ${a}` }}>
            <span className="text-[9px]" style={{ color: spec.mute }}>
              OEM #
            </span>
            <span className="text-[12px] font-bold">{typed}</span>
            <span className="bb-blink h-3 w-[2px]" style={{ background: a }} />
          </div>
          <div className="mt-2 grid flex-1 grid-cols-3 gap-2">
            {["OEM", "Aftermarket", "Sutlej"].map((col, c) => (
              <div key={col} className="rounded-[6px] p-1.5" style={{ background: spec.panel, border: `1px solid ${spec.line}` }}>
                <p className="text-[8px] uppercase tracking-wider" style={{ color: spec.mute }}>
                  {col}
                </p>
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className={cn("mt-1.5 rounded-[4px] px-1.5 py-1", (tick % 14) > 4 + c * 2 ? "lp-in" : "opacity-20")} style={{ background: c === 2 && i === 0 ? `${a}33` : soft }}>
                    <span className="text-[8.5px] font-semibold">{["SAC-4821-K", "GKN 77-410", "SA-HUB-2214", "TRW 3302"][(i + c) % 4]}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[9px]" style={{ color: spec.mute }}>
              match
            </span>
            <span className="h-[6px] flex-1 overflow-hidden rounded-full" style={{ background: soft }}>
              <span className="block h-full rounded-full transition-[width] duration-700" style={{ width: `${Math.min(97, (tick % 14) * 8)}%`, background: b }} />
            </span>
            <span className="text-[11px] font-bold" style={{ color: b }}>
              {Math.min(97, (tick % 14) * 8)}%
            </span>
          </div>
        </div>
      );
    }
    case "bento":
      return (
        <div className="grid h-full grid-cols-4 grid-rows-3 gap-1.5">
          {Array.from({ length: 10 }, (_, i) => {
            const risk = (i * 3 + tick) % 9 === 0;
            const big = i === 0 || i === 5;
            return (
              <div key={i} className={cn("flex flex-col justify-between rounded-[8px] p-1.5", big && "col-span-2")} style={{ background: risk ? `${b}22` : `${a}${10 + ((i * 7) % 20)}`, border: `1px solid ${risk ? b : spec.line}` }}>
                <span className="text-[8px] font-semibold">{["Kaveri Foods", "Mehta Tiles", "Urban Spa", "Zest Cafe", "Nova Dental", "Shree Jewels", "Peak Gym", "Arya Homes", "Lumen Eye", "Craft Brew"][i]}</span>
                <svg viewBox="0 0 60 16" className="h-4 w-full">
                  <polyline points={Array.from({ length: 12 }, (_, k) => `${(k * 5.4).toFixed(1)},${(8 + Math.sin((k + tick + i) * 0.9) * (risk ? 6 : 3)).toFixed(2)}`).join(" ")} fill="none" stroke={risk ? b : a} strokeWidth="1.5" />
                </svg>
              </div>
            );
          })}
        </div>
      );
    case "register":
      return (
        <div className="grid h-full grid-cols-6 gap-1">
          {Array.from({ length: 30 }, (_, i) => {
            const st = (i * 5 + tick) % 9;
            const label = st < 4 ? "IFC" : st < 6 ? "APPR" : st < 8 ? "WIP" : "SUP";
            return (
              <div key={i} className="flex flex-col justify-between rounded-[3px] p-1" style={{ background: st >= 4 && st < 6 ? b : spec.panel, border: `1px solid ${ink}33` }}>
                <span className="font-mono text-[8px] font-bold">{["A", "S", "E", "P"][i % 4]}-{101 + i * 3}</span>
                <span className="flex items-center justify-between font-mono text-[7px]" style={{ color: spec.mute }}>
                  R{(i * 3 + tick) % 4}
                  <span style={{ color: label === "SUP" ? "#b3412f" : ink }}>{label}</span>
                </span>
              </div>
            );
          })}
        </div>
      );
    case "kot":
      return (
        <div className="grid h-full grid-cols-5 gap-1.5">
          {["Tandoor", "Curry", "Biryani", "Chinese", "Bar"].map((station, c) => (
            <div key={station} className="flex flex-col gap-1.5 rounded-[6px] p-1" style={{ background: soft }}>
              <span className="px-0.5 text-[8px] font-semibold uppercase tracking-wider" style={{ color: spec.mute }}>
                {station}
              </span>
              {Array.from({ length: 3 }, (_, k) => {
                const age = (tick * 2 + c * 5 + k * 7) % 22;
                const tone = age > 16 ? "#e05a4a" : age > 11 ? b : "#3fb68b";
                return (
                  <div key={`${k}-${Math.floor((tick + c + k) / 6)}`} className="lp-in rounded-[5px] p-1" style={{ background: spec.panel, borderTop: `2px solid ${tone}` }}>
                    <span className="flex items-center justify-between text-[7.5px] font-bold">
                      #{410 + c * 9 + k}
                      <span style={{ color: k % 2 ? "#fc8019" : "#e23744" }}>{k % 2 ? "SWG" : "ZMT"}</span>
                    </span>
                    <span className="mt-0.5 block h-[3px] w-[80%] rounded-full" style={{ background: `${ink}44` }} />
                    <span className="mt-1 block text-[8px] font-bold tabular-nums" style={{ color: tone }}>
                      {age}:{String((tick * 13 + k * 7) % 60).padStart(2, "0")}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      );
    case "radar": {
      const blips = Array.from({ length: 22 }, (_, i) => {
        const ring = 1 + Math.floor(r(i) * 5);
        const ang = r(i + 40) * 360;
        return { ring, ang, size: 2.5 + r(i + 80) * 4, hot: ring <= 2 };
      });
      return (
        <svg viewBox="0 0 400 218" className="h-full w-full">
          <g transform="translate(200 112)">
            {[1, 2, 3, 4, 5].map((k) => (
              <circle key={k} r={k * 19} fill="none" stroke={k <= 2 ? `${b}66` : spec.line} strokeDasharray={k === 1 ? "3 3" : undefined} />
            ))}
            <line x1="-100" x2="100" y1="0" y2="0" stroke={spec.line} />
            <line x1="0" x2="0" y1="-100" y2="100" stroke={spec.line} />
            <g style={{ transform: `rotate(${tick * 30}deg)`, transition: "transform 1.1s linear" }}>
              <path d="M0 0 L95 0 A95 95 0 0 0 82.27 -47.5 Z" fill={a} opacity=".18" />
            </g>
            {blips.map((bl, i) => (
              <g key={i} transform={`rotate(${Math.round(bl.ang)}) translate(${bl.ring * 19 - 9} 0)`}>
                <circle r={bl.size} fill={bl.hot ? b : a} opacity={bl.hot ? 0.9 : 0.55} />
                {bl.hot && i % 3 === tick % 3 && <circle r={bl.size + 5} fill="none" stroke={b} className="lp-ring" />}
              </g>
            ))}
          </g>
          {["Expired", "< 3m", "3-6m", "6-12m", "> 12m"].map((l, k) => (
            <text key={l} x="316" y={30 + k * 16} fontSize="9" fill={k < 2 ? b : spec.mute} fontWeight={k < 2 ? 700 : 400}>
              {l}
            </text>
          ))}
        </svg>
      );
    }
    case "sun": {
      const t = (tick % 40) / 40;
      const ang = Math.PI * (1 - t);
      const sx = Math.round((200 + Math.cos(ang) * 150) * 100) / 100;
      const sy = Math.round((120 - Math.sin(ang) * 90) * 100) / 100;
      const glow = Math.round(Math.sin(Math.PI * t) * 100) / 100;
      return (
        <svg viewBox="0 0 400 218" className="h-full w-full">
          <path d="M50 120 A150 90 0 0 1 350 120" fill="none" stroke={`${b}66`} strokeDasharray="4 5" />
          <circle cx={sx} cy={sy} r="13" fill={b} />
          <circle cx={sx} cy={sy} r="22" fill={b} opacity=".2" />
          <path d="M60 205 L120 140 L280 140 L340 205 Z" fill={`${ink}12`} stroke={`${ink}33`} />
          {Array.from({ length: 12 }, (_, i) => {
            const col = i % 6;
            const row = Math.floor(i / 6);
            const flag = i === 8 && tick % 6 < 3;
            return (
              <rect
                key={i}
                x={120 + col * 27 - row * 10}
                y={150 + row * 24}
                width="24"
                height="20"
                rx="2"
                fill={flag ? "#d9534f" : a}
                opacity={flag ? 0.85 : 0.35 + glow * 0.6}
                stroke={spec.panel}
              />
            );
          })}
          <g transform="translate(18 18)">
            <rect width="104" height="40" rx="7" fill={spec.panel} stroke={spec.line} />
            <text x="8" y="16" fontSize="9" fill={spec.mute}>Live output</text>
            <text x="8" y="32" fontSize="14" fontWeight="700" fill={a}>{Math.round(glow * 48.6 * 10) / 10} kW</text>
          </g>
        </svg>
      );
    }
    default:
      return null;
  }
}
