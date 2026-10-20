"use client";

import * as React from "react";
import { Menu, X } from "lucide-react";
import { cn } from "cn";
import { Logo } from "@/components/funnel/logo";

const links = [
  { href: "#industries", label: "Industries" },
  { href: "#how", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

export function PlatformNav() {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[#f7f2ea]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-5">
        <a href="#top" className="flex items-center gap-3" aria-label="BuildBizAI home">
          <Logo className="size-9 shadow-[0_8px_18px_-8px_rgba(150,100,30,0.7)]" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-[19px] font-bold tracking-tight text-[#1c1917]">
              BuildBiz<span className="text-[#6e2b36]">AI</span>
            </span>
            <span className="mt-1 hidden text-[9.5px] font-bold uppercase tracking-[0.22em] text-[#9a7431] sm:block">Industry software you own</span>
          </span>
        </a>
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="text-[13px] text-[#5c564e] transition-colors hover:text-[#1c1917]">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="#industries"
            className="hidden h-9 items-center rounded-full bg-[#6e2b36] px-4 text-[13px] font-semibold text-white md:inline-flex"
          >
            Open a desk
          </a>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#1c1917] md:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <div className={cn("border-t border-black/5 px-5 py-3 md:hidden", !open && "hidden")}>
        <div className="flex flex-col gap-1">
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-lg px-2 py-2.5 text-[14px] text-[#1c1917]">
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
