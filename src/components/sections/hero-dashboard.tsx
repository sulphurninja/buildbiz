import { Check, ChartColumn, ClipboardCheck, Target, Wallet } from "lucide-react";
import { cn } from "cn";

const BARS = [38, 52, 44, 61, 58, 72, 84];

/** CSS-only mock of the "command center" the attendee builds. */
export function HeroDashboard() {
  return (
    <div className="overflow-hidden rounded-3xl border border-gold/20 bg-wine-deep shadow-deep">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex gap-1.5">
            <i className="size-2.5 rounded-full bg-cream/15" />
            <i className="size-2.5 rounded-full bg-cream/15" />
            <i className="size-2.5 rounded-full bg-cream/15" />
          </span>
          <span className="ml-1 text-[11px] font-bold uppercase tracking-[0.2em] text-cream/55">BuildBiz Command Center</span>
        </div>
        <span className="rounded-full border border-line bg-wine-2 px-3 py-1 text-[11px] font-semibold text-cream/75">Mon · 07:00 AM</span>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-6 sm:p-5">
        <Panel className="sm:col-span-3">
          <PanelHead icon={ClipboardCheck} title="Daily reports" meta="6 / 6 received" tone="mint" />
          <ul className="mt-3 space-y-2">
            {[
              ["Floor Manager", "06:52", "Production · 1,240 units · 0 rejections"],
              ["Sales Head", "06:58", "14 follow-ups done · 3 closed"],
              ["Accounts", "07:00", "Collections ₹6.8L"],
            ].map(([who, t, what]) => (
              <li key={who} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-wine/60 px-3.5 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-bold text-cream">{who}</p>
                  <p className="truncate text-[12.5px] text-cream/55">{what}</p>
                </div>
                <span className="flex shrink-0 items-center gap-1.5 text-[12px] font-semibold text-mint">
                  <Check className="size-4" strokeWidth={3} /> {t}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="sm:col-span-3">
          <PanelHead icon={Target} title="Sales pipeline" meta="0 overdue follow-ups" tone="mint" />
          <div className="mt-3 space-y-3">
            {[
              ["New leads", 42, 100],
              ["Qualified", 27, 64],
              ["Proposal sent", 11, 26],
              ["Won this week", 6, 14],
            ].map(([label, n, w]) => (
              <div key={label as string}>
                <div className="flex justify-between text-[13px] text-cream/70">
                  <span>{label}</span>
                  <span className="font-bold text-cream tabular-nums">{n}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-cream/10">
                  <div className="h-full rounded-full bg-gold" style={{ width: `${w}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="sm:col-span-2">
          <PanelHead icon={Wallet} title="Cash position" meta="+12% WoW" tone="mint" />
          <p className="mt-4 font-display text-[2.6rem] font-bold leading-none text-gold">₹18.4L</p>
          <p className="mt-2 text-[13px] text-cream/55">Receivables due this week · ₹4.2L</p>
        </Panel>

        <Panel className="sm:col-span-4">
          <PanelHead icon={ChartColumn} title="Team output — this week" meta="Auto-generated" />
          <div className="mt-4 flex h-24 items-end gap-2.5">
            {BARS.map((h, i) => (
              <div
                key={i}
                className={cn("flex-1 origin-bottom rounded-t-lg animate-grow-bar", i === BARS.length - 1 ? "bg-gold" : "bg-cream/20")}
                style={{ height: `${h}%`, animationDelay: `${300 + i * 90}ms` }}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[11px] font-semibold text-cream/35">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-2xl border border-line bg-wine-2/70 p-4", className)}>{children}</div>;
}

function PanelHead({ icon: Icon, title, meta, tone = "muted" }: { icon: React.ElementType; title: string; meta: string; tone?: "muted" | "mint" }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="inline-flex items-center gap-2 text-[14px] font-bold text-cream">
        <Icon className="size-4 text-gold" />
        {title}
      </span>
      <span className={cn("text-[11.5px] font-semibold", tone === "mint" ? "text-mint" : "text-cream/50")}>{meta}</span>
    </div>
  );
}
