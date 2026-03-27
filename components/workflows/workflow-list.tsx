"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useWorkflows } from "@/context/workflows-context";
import { WorkflowCard } from "@/components/workflows/workflow-card";

export function WorkflowList() {
  const { workflows } = useWorkflows();

  if (workflows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] py-20 text-center">
        <p className="text-sm font-medium">No workflows configured</p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Start a strategy session to build your campaign pipeline.
        </p>
        <Link href="/chat" className="mt-5">
          <Button className="gap-2 rounded-lg bg-brand text-sm font-medium text-white hover:bg-brand/80">
            <Plus className="size-4" />
            New workflow
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {workflows.length} workflow{workflows.length !== 1 ? "s" : ""} &middot;{" "}
          {workflows.filter((w) => w.status === "active").length} live
        </p>
        <Link href="/chat">
          <Button
            size="sm"
            className="gap-2 rounded-lg bg-brand text-xs font-medium text-white hover:bg-brand/80"
          >
            <Plus className="size-3.5" />
            New workflow
          </Button>
        </Link>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {workflows.map((w) => (
          <WorkflowCard key={w.id} workflow={w} />
        ))}
      </div>
    </div>
  );
}
