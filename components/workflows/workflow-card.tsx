"use client";

import { Button } from "@/components/ui/button";
import { Pause, Play, Trash2 } from "lucide-react";
import type { CronConfig } from "@/lib/types";
import {
  WORKFLOW_TYPE_LABELS,
  CHANNEL_LABELS,
  FREQUENCY_LABELS,
  DAY_LABELS,
} from "@/lib/constants";
import { useWorkflows } from "@/context/workflows-context";

interface WorkflowCardProps {
  workflow: CronConfig;
}

export function WorkflowCard({ workflow }: WorkflowCardProps) {
  const { toggleStatus, deleteWorkflow } = useWorkflows();

  const schedule = [
    FREQUENCY_LABELS[workflow.schedule.frequency],
    workflow.schedule.dayOfWeek?.map((d) => DAY_LABELS[d]).join(", "),
    `at ${workflow.schedule.timeOfDay}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="group rounded-xl border border-white/[0.06] bg-surface p-5 transition-colors hover:bg-surface-hover">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h3 className="truncate text-sm font-semibold">{workflow.name}</h3>
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className={`size-1.5 rounded-full ${
                  workflow.status === "active"
                    ? "bg-emerald-400"
                    : "bg-muted-foreground/30"
                }`}
              />
              <span className="text-xs text-muted-foreground">
                {workflow.status === "active" ? "Live" : workflow.status}
              </span>
            </div>
          </div>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {workflow.description}
          </p>
        </div>
        <div className="ml-4 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => toggleStatus(workflow.id)}
            aria-label={
              workflow.status === "active"
                ? "Pause workflow"
                : "Resume workflow"
            }
          >
            {workflow.status === "active" ? (
              <Pause className="size-3.5" />
            ) : (
              <Play className="size-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => deleteWorkflow(workflow.id)}
            aria-label="Delete workflow"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          WORKFLOW_TYPE_LABELS[workflow.type],
          CHANNEL_LABELS[workflow.channel],
          schedule,
        ].map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-white/[0.05] px-2.5 py-1 text-xs text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>

      {workflow.contentBrief && (
        <div className="mt-4 rounded-lg bg-black/20 p-3">
          <p className="line-clamp-2 text-xs leading-relaxed text-foreground/60">
            {workflow.contentBrief}
          </p>
        </div>
      )}
    </div>
  );
}
