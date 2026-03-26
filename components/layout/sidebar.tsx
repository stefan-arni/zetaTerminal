"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Workflow,
  FolderOpen,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";

const ICON_MAP = {
  LayoutDashboard,
  MessageSquare,
  Workflow,
  FolderOpen,
} as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-white/[0.06] bg-sidebar">
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-brand">
          <Zap className="size-4 text-white" />
        </div>
        <div>
          <span className="text-[15px] font-semibold tracking-[-0.01em]">
            Zeta
          </span>
          <span className="ml-1 text-[15px] font-light tracking-[-0.01em] text-muted-foreground">
            Terminal
          </span>
        </div>
      </div>

      <div className="mt-2 px-4">
        <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/50">
          Navigation
        </p>
      </div>

      <nav className="mt-2 flex flex-1 flex-col gap-0.5 px-3">
        {NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon];
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all",
                isActive
                  ? "bg-brand/10 text-brand shadow-[inset_0_0_0_1px_rgba(139,92,246,0.15)]"
                  : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mx-4 mb-4 rounded-xl bg-brand/[0.06] p-4">
        <p className="text-[12px] font-medium text-foreground/80">
          Strategy mode
        </p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
          Brief Zeta on your business to generate automations.
        </p>
        <Link
          href="/chat"
          className="mt-3 flex items-center gap-2 text-[12px] font-medium text-brand transition-colors hover:text-brand/80"
        >
          Start session
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </aside>
  );
}
