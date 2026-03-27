"use client";

import Link from "next/link";
import { MessageSquare, Upload, Workflow, ArrowUpRight } from "lucide-react";

const ACTIONS = [
  {
    icon: MessageSquare,
    label: "Start strategy session",
    description: "Brief FirstCMO on your growth goals",
    href: "/chat",
  },
  {
    icon: Upload,
    label: "Upload brand assets",
    description: "Add briefs, guides, and data",
    href: "/files",
  },
  {
    icon: Workflow,
    label: "Manage workflows",
    description: "Review recommended plays",
    href: "/workflows",
  },
];

export function QuickActions() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-surface">
      <div className="border-b border-white/[0.06] px-5 py-4">
        <h2 className="text-sm font-semibold">Quick actions</h2>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02]"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.04]">
              <action.icon className="size-[18px] text-muted-foreground transition-colors group-hover:text-brand" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{action.label}</p>
              <p className="text-xs text-muted-foreground">
                {action.description}
              </p>
            </div>
            <ArrowUpRight className="size-4 text-muted-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
