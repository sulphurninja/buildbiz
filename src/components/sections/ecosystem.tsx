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
      />

      <Reveal className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-2.5">
        {site.ecosystem.map((e) => {
          const Icon = ICONS[e.icon] ?? Rocket;
          const here = "tag" in e && !!e.tag;
          return (
            <span
              key={e.name}
              className={cn(
                "inline-flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-[14px] font-semibold",
                here ? "border-gold bg-gold text-paper" : "border-line bg-wine-2/60 text-cream/85",
              )}
            >
              <Icon className="size-4" />
              {e.name}
              {here && <span className="rounded-full bg-wine-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-bright">You are here</span>}
            </span>
          );
        })}
      </Reveal>
      <p className="mt-6 text-center font-accent text-[1.3rem] italic text-cream/60">One method. Seven doors. Start at the first one.</p>
    </Section>
  );
}
