import * as React from "react";
import { cn } from "cn";
import { Reveal } from "@/components/funnel/reveal";

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  className?: string;
};

export function SectionHeading({ eyebrow, title, lead, className }: Props) {
  return (
    <Reveal className={cn("mx-auto max-w-4xl text-center", className)}>
      <p className="eyebrow text-gold">{eyebrow}</p>
      <h2 className="mt-4 font-display text-[2.1rem] font-bold leading-[1.1] text-balance text-cream sm:text-[2.6rem] lg:text-[3.1rem]">{title}</h2>
      {lead ? <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-relaxed text-pretty text-cream/70 sm:text-[17px]">{lead}</p> : null}
    </Reveal>
  );
}

/** Gold italic serif emphasis inside headings. */
export function Em({ children, className }: { children: React.ReactNode; className?: string }) {
  return <em className={cn("font-accent italic text-gold [font-size:1.06em]", className)}>{children}</em>;
}

/** Page-width container used by every section. */
export function Section({
  id,
  className,
  children,
  tone = "default",
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
  tone?: "default" | "deep";
}) {
  return (
    <section id={id} className={cn(tone === "deep" && "bg-wine-deep/70", className)}>
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">{children}</div>
    </section>
  );
}
