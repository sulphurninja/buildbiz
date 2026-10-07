import { NextResponse } from "next/server";

type Lead = {
  name: string;
  phone: string;
  email: string;
  business: string;
  teamSize: string;
  revenue: string;
  source: string;
  page: string;
};

/**
 * Lead capture endpoint for the "Reserve seat" form.
 * Wire this to your CRM / WhatsApp provider / sheet — it currently validates and logs.
 */
export async function POST(req: Request) {
  let body: Partial<Lead>;
  try {
    body = (await req.json()) as Partial<Lead>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const required: (keyof Lead)[] = ["name", "phone", "email", "business", "teamSize", "revenue"];
  const missing = required.filter((k) => !body[k] || String(body[k]).trim() === "");
  if (missing.length) {
    return NextResponse.json({ ok: false, error: `Missing: ${missing.join(", ")}` }, { status: 422 });
  }

  const lead: Lead = {
    name: String(body.name).slice(0, 120),
    phone: String(body.phone).slice(0, 32),
    email: String(body.email).slice(0, 160),
    business: String(body.business).slice(0, 160),
    teamSize: String(body.teamSize).slice(0, 16),
    revenue: String(body.revenue).slice(0, 16),
    source: String(body.source ?? "unknown").slice(0, 64),
    page: String(body.page ?? "").slice(0, 400),
  };

  // Forward to a webhook if configured (Zapier / Make / n8n / custom CRM).
  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lead, receivedAt: new Date().toISOString() }),
      });
    } catch (err) {
      console.error("[reserve] webhook failed", err);
    }
  } else {
    console.log("[reserve] lead", lead);
  }

  return NextResponse.json({ ok: true });
}
