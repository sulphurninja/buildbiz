import { site } from "@/content/site";

export function TrustStrip() {
  const items = [...site.industries, ...site.industries];
  return (
    <section className="border-y border-line bg-wine-deep/70">
      <div className="mx-auto max-w-7xl overflow-hidden px-4 py-5 mask-fade-x">
        <div className="marquee-track flex w-max animate-marquee items-center gap-10">
          {items.map((ind, i) => (
            <span key={`${ind}-${i}`} className="inline-flex items-center gap-4 whitespace-nowrap text-[13px] font-bold uppercase tracking-[0.2em] text-cream/55">
              {ind}
              <span className="size-1.5 rounded-full bg-gold/60" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
