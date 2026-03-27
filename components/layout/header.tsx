"use client";

import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Your AI Fractional CMO",
    subtitle: "Strategy session",
  },
  "/chat": {
    title: "Strategy Session",
    subtitle: "Your fractional CMO, already informed",
  },
  "/workflows": {
    title: "Workflows",
    subtitle: "Recommended plays and content pipelines",
  },
  "/files": {
    title: "Brand Assets",
    subtitle: "Briefs, guidelines, and creative",
  },
};

export function Header() {
  const pathname = usePathname();
  const meta = PAGE_META[pathname] ?? {
    title: "Zeta Terminal",
    subtitle: "",
  };

  return (
    <header className="flex h-[52px] shrink-0 items-center border-b border-white/[0.06] bg-background px-8">
      <h1 className="text-sm font-semibold">{meta.title}</h1>
      {meta.subtitle && (
        <>
          <Separator orientation="vertical" className="mx-3 h-4 bg-white/[0.08]" />
          <p className="text-sm text-muted-foreground">{meta.subtitle}</p>
        </>
      )}
    </header>
  );
}
