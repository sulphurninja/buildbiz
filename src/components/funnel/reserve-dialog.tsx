"use client";

import * as React from "react";
import { ArrowRight, Loader2, Lock, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { site } from "@/content/site";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const TEAM_SIZES = ["5–15", "16–50", "51–150", "150+"] as const;
const REVENUE = ["₹1–3 Cr", "₹3–10 Cr", "₹10–50 Cr", "₹50 Cr+"] as const;

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  source?: string;
};

export function ReserveDialog({ open, onOpenChange, source }: Props) {
  const [submitting, setSubmitting] = React.useState(false);
  const [team, setTeam] = React.useState<string>("");
  const [revenue, setRevenue] = React.useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      business: String(fd.get("business") ?? "").trim(),
      teamSize: team,
      revenue,
      source: source ?? "unknown",
      page: typeof window !== "undefined" ? window.location.href : "",
    };

    if (!team || !revenue) {
      toast.error("Please select your team size and revenue band.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");

      if (site.checkoutUrl) {
        toast.success("Seat held for 10 minutes. Taking you to secure checkout…");
        const url = new URL(site.checkoutUrl);
        url.searchParams.set("name", payload.name);
        url.searchParams.set("phone", payload.phone);
        url.searchParams.set("email", payload.email);
        window.location.assign(url.toString());
        return;
      }

      toast.success("Seat held. We've sent your checkout link on WhatsApp.", {
        description: `Check ${payload.phone} in the next 60 seconds.`,
      });
      onOpenChange(false);
      form.reset();
      setTeam("");
      setRevenue("");
    } catch {
      toast.error("Something went wrong. Please try again or WhatsApp us.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden rounded-3xl border-gold/25 bg-wine-2 p-0 text-cream shadow-deep sm:max-w-lg">
        <div className="border-b border-line bg-wine-deep px-6 pb-6 pt-7 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <span className="eyebrow text-gold">Reserve your seat</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[11px] font-semibold text-cream/70">
              <Lock className="size-3" /> Secure
            </span>
          </div>
          <DialogHeader className="mt-3 space-y-2 text-left">
            <DialogTitle className="font-display text-[2rem] font-bold leading-tight text-cream">
              2 nights. 6 systems. <em className="italic text-gold">₹{site.event.price}.</em>
            </DialogTitle>
            <DialogDescription className="text-[15px] text-cream/65">
              {site.event.dateLabel} · {site.event.timeLabel} · Live on {site.event.platform}. Both days included.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 px-6 py-6 sm:px-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" name="name" placeholder="Rajan Deshmukh" required autoComplete="name" />
            <Field label="WhatsApp number" name="phone" placeholder="+91 98XXX XXXXX" required type="tel" inputMode="tel" autoComplete="tel" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email" name="email" placeholder="you@company.in" required type="email" autoComplete="email" />
            <Field label="Business / industry" name="business" placeholder="Auto parts manufacturing" required />
          </div>

          <ChipGroup label="Team size" options={TEAM_SIZES} value={team} onChange={setTeam} />
          <ChipGroup label="Annual revenue" options={REVENUE} value={revenue} onChange={setRevenue} />

          <button
            type="submit"
            disabled={submitting}
            className="group inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-b from-[oklch(0.9_0.09_88)] via-gold to-gold-deep text-[15px] font-extrabold uppercase tracking-[0.04em] text-wine-deep glow-gold transition hover:brightness-105 disabled:opacity-70"
          >
            {submitting ? <Loader2 className="size-5 animate-spin" /> : null}
            <span>{submitting ? "Holding your seat…" : `Pay ₹${site.event.price} & reserve my seat`}</span>
            {!submitting && <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />}
          </button>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12.5px] text-cream/55">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="size-3.5" /> Secure checkout
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="size-3.5" /> WhatsApp confirmation instant
            </span>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, name, className, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  const id = React.useId();
  return (
    <label htmlFor={id} className={cn("block space-y-1.5", className)}>
      <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-cream/55">{label}</span>
      <input
        id={id}
        name={name}
        className="h-12 w-full rounded-xl border border-input bg-wine-deep/60 px-4 text-[15px] text-cream outline-none transition placeholder:text-cream/30 focus:border-gold focus:ring-[3px] focus:ring-gold/25"
        {...rest}
      />
    </label>
  );
}

function ChipGroup({ label, options, value, onChange }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void }) {
  return (
    <fieldset className="space-y-1.5">
      <legend className="text-[12px] font-bold uppercase tracking-[0.12em] text-cream/55">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = value === o;
          return (
            <button
              key={o}
              type="button"
              onClick={() => onChange(o)}
              aria-pressed={active}
              className={cn(
                "h-10 rounded-full border px-4 text-[13.5px] font-semibold transition-colors",
                active ? "border-gold bg-gold text-wine-deep" : "border-line bg-wine-deep/40 text-cream/80 hover:border-gold/50",
              )}
            >
              {o}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
