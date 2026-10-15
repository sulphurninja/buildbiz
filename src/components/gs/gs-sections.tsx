/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import { site } from "@/content/site";
import { GsCta } from "@/components/gs/gs-chrome";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function Eyebrow({ children, onDark }: { children: React.ReactNode; onDark?: boolean }) {
  return (
    <p className={`text-[11px] font-bold uppercase tracking-[0.18em] ${onDark ? "text-white/50" : "text-black/45"}`}>
      {children}
    </p>
  );
}

function BlueChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-md bg-[#1e40af] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
      {children}
    </span>
  );
}

/* ---------- Timeline as GS-style big-number stat cards ---------- */
export function GsTimeline() {
  return (
    <section className="bg-[#fdf8ee] py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <h2 className="gs-head text-[26px] font-bold sm:text-[32px]">Every Tech Wave Had Its &ldquo;Not for Me&rdquo; People</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {site.timeline.map((t) => (
            <div
              key={t.year}
              className={`rounded-xl border bg-white p-5 ${t.now ? "border-[#1e40af]/50 ring-1 ring-[#1e40af]/30" : "border-black/10"}`}
            >
              <p className="gs-head text-3xl font-bold">{t.year}</p>
              <p className="mt-1 text-[13px] font-semibold">{t.tech}</p>
              <p className="mt-2 text-[13px] italic leading-relaxed text-black/55">{t.quote}</p>
              {t.now && <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-[#1e40af]">You are here</p>}
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-black/55">
          Agar aap WhatsApp chala sakte ho, <span className="font-semibold text-black">you can build every system in this workshop.</span>
        </p>
      </div>
    </section>
  );
}

/* ---------- Schedule ---------- */
const DAY_OUTCOMES = [
  "A working HR command center and team accountability engine — live before you log off.",
  "Your full Business OS live: sales pipeline, marketing engine, finance dashboard — running on their own.",
];

export function GsSchedule() {
  return (
    <section id="schedule" className="border-t border-dashed border-black/15 bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <Eyebrow>Your Schedule</Eyebrow>
            <h2 className="gs-head mt-2 text-[26px] font-bold sm:text-[32px]">
              6 Systems. 2 Live Nights. Your Business Operating System
            </h2>
            <p className="mt-2 text-sm text-black/55">
              Both nights live on {site.event.platform} · {site.event.timeLabel} · built by you, with us beside you.
            </p>
          </div>
          <Image
            src="/gs/photo-build.jpg"
            alt="Two founders building their system together at night"
            width={760}
            height={428}
            className="hidden w-full rounded-xl border border-black/10 lg:block"
          />
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {site.days.map((d, di) => (
            <div key={d.label} className="flex flex-col rounded-xl border border-black/10 bg-[#fdf8ee]">
              <div className="border-b border-black/10 px-6 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-black/45">
                  {d.label} · {d.date}
                </p>
                <h3 className="gs-head mt-1.5 text-xl font-bold">{d.theme}</h3>
              </div>
              <div className="flex-1 space-y-4 px-6 py-5">
                {d.modules.map((m) => (
                  <div key={m.n} className="flex gap-3.5">
                    <span className="gs-head mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-[#0b1120] text-[11px] font-bold text-white">
                      {m.n}
                    </span>
                    <div>
                      <p className="text-[15px] font-semibold leading-snug">{m.title}</p>
                      <p className="mt-0.5 text-[13px] leading-relaxed text-black/55">{m.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mx-6 mb-6 rounded-lg bg-white p-4 ring-1 ring-black/10">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1e40af]">By the end you get</p>
                <p className="mt-1 text-[13px] font-medium leading-relaxed">{DAY_OUTCOMES[di]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Framework (black "What You Will Build" section) ---------- */
export function GsFramework() {
  return (
    <section className="bg-[#0d0d0f] py-16 text-white lg:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <BlueChip>What you will build</BlueChip>
        <h2 className="gs-head mt-4 text-[26px] font-bold sm:text-[32px]">A Business That Runs Without You</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/55">
          The BUILD → AUTOMATE → SYSTEMIZE → SCALE method — the exact architecture, built live with you.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {site.framework.map((f) => (
            <div key={f.step} className="rounded-xl border border-white/10 bg-[#161619] p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">Step {f.step}</p>
              <h3 className="gs-head mt-2 text-xl font-bold">{f.name}</h3>
              <p className="mt-2 text-[14px] font-medium text-white/85">{f.headline}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-white/50">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Industries (GS tools-grid style) ---------- */
export function GsIndustries() {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-5 text-center sm:px-8">
        <Eyebrow>Works across industries</Eyebrow>
        <h2 className="gs-head mt-2 text-[26px] font-bold sm:text-[32px]">The Architecture Is Universal</h2>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {site.industries.map((ind) => (
            <div
              key={ind}
              className="flex h-16 items-center justify-center rounded-lg bg-[#0b1120] px-3 text-sm font-semibold text-white"
            >
              {ind}
            </div>
          ))}
          <div className="flex h-16 items-center justify-center rounded-lg border border-dashed border-black/25 px-3 text-sm font-semibold text-black/45">
            &amp; yours
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Testimonials ---------- */
export function GsTestimonials() {
  return (
    <section className="bg-[#fdf8ee] py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="text-center">
          <Eyebrow>From owners like you</Eyebrow>
          <h2 className="gs-head mt-2 text-[26px] font-bold sm:text-[32px]">They Stopped Being the System</h2>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {site.testimonials.map((t) => (
            <div key={t.name} className="flex flex-col rounded-xl border-2 border-[#143c34] bg-white p-6">
              <p className="gs-head text-lg font-bold leading-snug">&ldquo;{t.headline}&rdquo;</p>
              <p className="mt-2 flex-1 text-[13px] leading-relaxed text-black/60">{t.body}</p>
              <div className="mt-4 flex items-center gap-3 border-t border-black/10 pt-4">
                <span className="gs-head flex size-9 items-center justify-center rounded-full bg-[#0b1120] text-xs font-bold text-white">
                  {t.name.split(" ").map((w) => w[0]).join("")}
                </span>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-[12px] text-black/50">{t.meta}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Mentor + gallery ---------- */
const GALLERY = [
  "/gallery/stage-1.jpeg",
  "/gallery/closeup-1.jpeg",
  "/gallery/award-1.jpeg",
  "/gallery/conclave-1.jpeg",
  "/gallery/closeup-2.jpeg",
  "/gallery/audience-1.jpeg",
  "/gallery/closeup-4.jpeg",
  "/gallery/speaking-2.jpeg",
];

export function GsMentor() {
  const m = site.mentor;
  return (
    <section className="overflow-hidden bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Eyebrow>Expert-led building</Eyebrow>
        <h2 className="gs-head mt-2 text-[26px] font-bold sm:text-[32px]">Learn From the Architect</h2>

        <div className="mt-8 grid gap-6 rounded-xl border border-black/10 bg-[#fdf8ee] p-6 sm:p-8 lg:grid-cols-[260px_1fr]">
          <div className="relative aspect-square w-full max-w-[260px] overflow-hidden rounded-xl">
            <Image src="/gallery/amit-portrait.png" alt={m.name} fill sizes="260px" className="object-cover object-top" />
          </div>
          <div>
            <h3 className="gs-head text-2xl font-bold">{m.name}</h3>
            <p className="text-sm text-black/55">{m.role}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {m.credentials.map((c) => (
                <span key={c} className="rounded-md bg-[#0b1120] px-2.5 py-1 text-[11px] font-semibold text-white">
                  {c}
                </span>
              ))}
            </div>
            <p className="mt-4 border-l-2 border-[#1e40af] pl-4 text-[14px] italic leading-relaxed text-black/70">
              &ldquo;{m.quote}&rdquo;
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-black/55">{m.bio[0]}</p>
          </div>
        </div>
      </div>

      <div className="mask-fade-x mt-8 overflow-hidden">
        <div className="marquee-track flex w-max items-center gap-4 animate-marquee [animation-duration:50s]">
          {[...GALLERY, ...GALLERY].map((src, i) => (
            <img
              key={`${src}-${i}`}
              src={src}
              alt={i < GALLERY.length ? `${m.name} on stage` : ""}
              aria-hidden={i >= GALLERY.length}
              loading="lazy"
              className="h-44 w-auto rounded-lg object-cover sm:h-52"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Bonuses ---------- */
export function GsBonuses() {
  return (
    <section className="bg-[#fdf8ee] py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Eyebrow>Included with your ₹{site.event.price} seat</Eyebrow>
        <h2 className="gs-head mt-2 text-[26px] font-bold sm:text-[32px]">
          {inr(site.event.bonusValue)} of Build-Kit Goes Home With You
        </h2>
        <p className="mt-2 text-sm text-black/55">Everything you use in the room — blueprints, prompts, SOPs — is yours to keep.</p>

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {site.bonuses.map((b) => (
            <div key={b.name} className="overflow-hidden rounded-xl border border-black/10 bg-white">
              <div className="relative aspect-[4/3]">
                <Image src={b.image} alt={b.name} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" />
                <span className="absolute right-2 top-2 rounded-md bg-[#1e40af] px-2 py-0.5 text-[11px] font-bold text-white">
                  {inr(b.value)}
                </span>
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold leading-snug">{b.name}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-black/55">{b.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Pricing (black section) ---------- */
export function GsPricing() {
  return (
    <section className="bg-[#0d0d0f] py-16 text-white lg:py-20">
      <div className="mx-auto grid max-w-6xl items-start gap-10 px-5 sm:px-8 lg:grid-cols-2">
        <div>
          <h2 className="gs-head text-[28px] font-bold leading-tight sm:text-[36px]">
            Are you ready to build your Business Operating System?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/55">
            {site.event.dateLabel} · {site.event.timeLabel} · Live on {site.event.platform}. {site.event.audience}.
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">Register if</p>
              <ul className="mt-3 space-y-2">
                {site.registerIf.map((r) => (
                  <li key={r} className="flex gap-2 text-[13px] leading-relaxed text-white/75">
                    <span className="text-[#4ade80]">✓</span> {r}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">Don&apos;t register if</p>
              <ul className="mt-3 space-y-2">
                {site.dontRegisterIf.map((r) => (
                  <li key={r} className="flex gap-2 text-[13px] leading-relaxed text-white/50">
                    <span className="text-[#f87171]">✕</span> {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#161619] p-6 sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">What ₹{site.event.price} gets you</p>
          <ul className="mt-4 space-y-3">
            {[
              "All 6 systems — built live, by you, over 2 nights",
              "Both nights live on Zoom with Dr. Amit Moga",
              `${inr(site.event.bonusValue)} bonus pack: blueprints, prompts, SOPs, live Q&A`,
              "No code. No IT team. No vendor dependency.",
            ].map((x) => (
              <li key={x} className="flex gap-3 text-[14px] leading-relaxed text-white/85">
                <span className="text-[#4ade80]">✓</span> {x}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-baseline gap-3">
            <span className="gs-head text-3xl font-bold">{inr(site.event.price)}</span>
            <span className="text-white/40 line-through">{inr(site.event.priceOriginal)}</span>
            <span className="text-[11px] text-white/40">{site.event.gstNote}</span>
          </div>
          <GsCta source="gs-pricing" className="mt-4 w-full" arrow>
            Reserve Seat · ₹{site.event.price}
          </GsCta>
          <p className="mt-3 text-center text-[12px] text-white/45">
            You attend, you build, you decide what&apos;s next. No catch. No pressure.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- Why ₹51 ---------- */
export function GsWhyCheap() {
  return (
    <section className="bg-[#fdf8ee] py-16 lg:py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_280px]">
        <div>
          <Eyebrow>Why ₹{site.event.price}</Eyebrow>
          <h2 className="gs-head mt-2 text-[26px] font-bold sm:text-[32px]">Why Just ₹{site.event.price}? Simple.</h2>
          <p className="mt-5 text-[14px] leading-relaxed text-black/65">
            Free seats don&apos;t show up — and they never build. A tiny commitment fills both nights with owners who
            open the laptop and do the work. That&apos;s the room you want to build your system in.
          </p>
          <blockquote className="mt-5 border-l-4 border-[#1e40af] pl-5 text-[15px] font-medium italic leading-relaxed text-black/75">
            &ldquo;₹{site.event.price} filters out people who aren&apos;t serious. You attend, you build, you decide
            what&apos;s next. No catch. No pressure.&rdquo;
          </blockquote>
          <div className="mt-8 rounded-xl border border-black/10 bg-white p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-black/45">And the honest part</p>
            <p className="mt-3 text-[14px] leading-relaxed text-black/65">
              Inside the workshop we&apos;ll mention — once — that our team can build the full system for you
              (BuildBiz Automations). That&apos;s it. Everything on this page is included at ₹{site.event.price}, and
              if the workshop is all you ever take from us, we&apos;re glad you came.
            </p>
          </div>
        </div>
        <Image
          src="/gs/photo-serious.jpg"
          alt="Serious business owners building in a live workshop session"
          width={512}
          height={512}
          className="mx-auto hidden w-full max-w-[280px] rounded-xl border border-black/10 lg:block"
        />
      </div>
    </section>
  );
}
