/* eslint-disable @next/next/no-img-element */
import { Em, SectionHeading } from "@/components/sections/section-heading";
import { Reveal } from "@/components/funnel/reveal";

type Shot = { src: string; alt: string };

const ROW_1: Shot[] = [
  { src: "/gallery/stage-1.jpeg", alt: "Dr. Amit Moga on stage at Likhega India Conclave" },
  { src: "/gallery/closeup-1.jpeg", alt: "Speaking at a conference" },
  { src: "/gallery/award-1.jpeg", alt: "CII Healthcare Innovation Awards 2024" },
  { src: "/gallery/speaking-2.jpeg", alt: "Speaking at a university auditorium" },
  { src: "/gallery/closeup-3.jpeg", alt: "Engaging the audience" },
];

const ROW_2: Shot[] = [
  { src: "/gallery/conclave-1.jpeg", alt: "Receiving an award at Likhega India Conclave" },
  { src: "/gallery/closeup-2.jpeg", alt: "On stage" },
  { src: "/gallery/audience-1.jpeg", alt: "Packed auditorium" },
  { src: "/gallery/closeup-4.jpeg", alt: "On stage, open arms" },
  { src: "/gallery/speaking-1.jpeg", alt: "Speaking on stage with presentation" },
];

export function Gallery() {
  return (
    <section className="overflow-hidden bg-wine-deep/70 py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Seen on stages across India"
          title={
            <>
              Stages. Awards. Packed houses. <Em>Now, your laptop.</Em>
            </>
          }
        />
      </div>

      <Reveal className="mt-12 space-y-4">
        <MarqueeRow shots={ROW_1} />
        <MarqueeRow shots={ROW_2} reverse />
      </Reveal>
    </section>
  );
}

function MarqueeRow({ shots, reverse }: { shots: Shot[]; reverse?: boolean }) {
  const items = [...shots, ...shots];
  return (
    <div className="mask-fade-x overflow-hidden">
      <div className={`marquee-track flex w-max items-center gap-4 animate-marquee ${reverse ? "[animation-direction:reverse]" : ""}`}>
        {items.map((s, i) => (
          <img
            key={`${s.src}-${i}`}
            src={s.src}
            alt={i < shots.length ? s.alt : ""}
            aria-hidden={i >= shots.length}
            loading="lazy"
            className="h-52 w-auto rounded-2xl border border-gold/20 object-cover shadow-deep sm:h-64"
          />
        ))}
      </div>
    </div>
  );
}
