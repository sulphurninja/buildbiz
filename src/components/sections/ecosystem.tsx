import { Bot, Brain, Briefcase, Cog, GraduationCap, Rocket, TrendingUp } from "lucide-react";
import { cn } from "cn";
import { site } from "@/content/site";
import { Reveal } from "@/components/funnel/reveal";
import { Em, Section, SectionHeading } from "@/components/sections/section-heading";

const ICONS: Record<string, React.ElementType> = {
  rocket: Rocket,
  cog: Cog,
  brain: Brain,
  bot: Bot,
  trending: TrendingUp,
  academy: GraduationCap,
  briefcase: Briefcase,
};

export function Ecosystem() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Where this workshop sits"
        title={
          <>
            The front door to the <Em>BuildBiz ecosystem.</Em>
          </>
        }
        lead="The AI Business Launchpad is where you build the foundation. Everything after it only makes sense once the foundation runs."
      />

      <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {site.ecosystem.map((e, i) => {
          const Icon = ICONS[e.icon] ?? Rocket;
          const here = "tag" in e && !!e.tag;
          return (
            <Reveal
              key={e.name}
              delay={i * 50}
              className={cn("relative rounded-2xl border p-5 text-left", here ? "border-gold/50 bg-gold-soft" : "border-line bg-wine-2/60")}
            >
              {here && (
                <span className="absolute -top-2.5 left-5 rounded-full bg-gold px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-wine-deep">{e.tag}</span>
              )}
              <Icon className="size-5 text-gold" />
              <p className="mt-3 font-display text-[1.3rem] font-bold leading-tight text-cream">{e.name}</p>
              <p className="mt-1 text-[14px] text-cream/60">{e.line}</p>
            </Reveal>
          );
        })}
        <Reveal delay={360} className="flex flex-col justify-center rounded-2xl border border-dashed border-gold/30 p-5">
          <p className="font-display text-[1.3rem] font-bold text-cream">{site.brand.name}</p>
          <p className="font-display text-[1.1rem] italic text-gold">{site.brand.tagline}</p>
        </Reveal>
      </div>
    </Section>
  );
}
