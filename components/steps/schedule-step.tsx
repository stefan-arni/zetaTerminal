"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Clock } from "lucide-react";
import { useWorkflows } from "@/context/workflows-context";
import { useStepper } from "@/context/stepper-context";
import {
  WORKFLOW_TYPE_LABELS,
  CHANNEL_LABELS,
  FREQUENCY_LABELS,
  DAY_LABELS,
} from "@/lib/constants";
import type { CronConfig } from "@/lib/types";

const FREQUENCIES = ["daily", "weekly", "biweekly", "monthly"] as const;
const DAYS = [0, 1, 2, 3, 4, 5, 6];
const TIMES = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
  "20:00", "21:00",
];

function ScheduleCard({ workflow }: { workflow: CronConfig }) {
  const { updateWorkflow } = useWorkflows();

  return (
    <div className="rounded-xl border border-white/[0.06] bg-surface p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold">{workflow.name}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{WORKFLOW_TYPE_LABELS[workflow.type]}</span>
            <span className="text-white/10">/</span>
            <span>{CHANNEL_LABELS[workflow.channel]}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="size-3.5 text-brand" />
          <span className="text-xs font-medium text-brand">
            {workflow.schedule.timeOfDay}
          </span>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {workflow.description}
      </p>

      {/* Frequency */}
      <div className="mt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/50">
          Frequency
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {FREQUENCIES.map((f) => (
            <button
              key={f}
              onClick={() =>
                updateWorkflow(workflow.id, {
                  schedule: { ...workflow.schedule, frequency: f },
                })
              }
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                workflow.schedule.frequency === f
                  ? "bg-brand/15 text-brand ring-1 ring-brand/30"
                  : "bg-white/[0.04] text-muted-foreground hover:bg-white/[0.06]"
              }`}
            >
              {FREQUENCY_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Days */}
      {workflow.schedule.frequency !== "daily" && (
        <div className="mt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/50">
            Days
          </p>
          <div className="mt-2 flex gap-1.5">
            {DAYS.map((d) => {
              const isSelected = workflow.schedule.dayOfWeek?.includes(d);
              return (
                <button
                  key={d}
                  onClick={() => {
                    const current = workflow.schedule.dayOfWeek ?? [];
                    const updated = isSelected
                      ? current.filter((x) => x !== d)
                      : [...current, d].sort();
                    updateWorkflow(workflow.id, {
                      schedule: { ...workflow.schedule, dayOfWeek: updated },
                    });
                  }}
                  className={`flex size-9 items-center justify-center rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-brand/15 text-brand ring-1 ring-brand/30"
                      : "bg-white/[0.04] text-muted-foreground hover:bg-white/[0.06]"
                  }`}
                >
                  {DAY_LABELS[d]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Time */}
      <div className="mt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/50">
          Time
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {TIMES.map((t) => (
            <button
              key={t}
              onClick={() =>
                updateWorkflow(workflow.id, {
                  schedule: { ...workflow.schedule, timeOfDay: t },
                })
              }
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                workflow.schedule.timeOfDay === t
                  ? "bg-brand/15 text-brand ring-1 ring-brand/30"
                  : "bg-white/[0.04] text-muted-foreground hover:bg-white/[0.06]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ScheduleStep() {
  const { workflows } = useWorkflows();
  const { next, back } = useStepper();

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto px-8 py-8">
        <div className="mx-auto max-w-[900px]">
          {workflows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-sm text-muted-foreground">
                No automations queued. Go back and accept some suggestions from
                your strategy session.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {workflows.map((w) => (
                <ScheduleCard key={w.id} workflow={w} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-white/[0.06] px-8 py-4">
        <Button
          variant="ghost"
          onClick={back}
          className="gap-2 text-sm text-muted-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to strategy
        </Button>
        <p className="text-xs text-muted-foreground">
          {workflows.length} automation{workflows.length !== 1 ? "s" : ""} configured
        </p>
        <Button
          onClick={next}
          disabled={workflows.length === 0}
          className="gap-2 rounded-lg bg-brand px-5 text-sm font-medium text-white hover:bg-brand/80 disabled:opacity-40"
        >
          Review &amp; launch
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
