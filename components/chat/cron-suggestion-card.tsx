"use client";

import { Button } from "@/components/ui/button";
import { Check, X, Zap } from "lucide-react";
import {
  WORKFLOW_TYPE_LABELS,
  CHANNEL_LABELS,
  FREQUENCY_LABELS,
  DAY_LABELS,
} from "@/lib/constants";

export interface WorkflowSuggestion {
  name: string;
  description: string;
  type: string;
  channel: string;
  frequency: string;
  dayOfWeek?: number[];
  timeOfDay: string;
  contentBrief: string;
}

interface CronSuggestionCardProps {
  suggestion: WorkflowSuggestion;
  onAccept: () => void;
  onReject: () => void;
  accepted?: boolean;
  rejected?: boolean;
}

export function CronSuggestionCard({
  suggestion,
  onAccept,
  onReject,
  accepted,
  rejected,
}: CronSuggestionCardProps) {
  const resolved = accepted || rejected;

  const schedule = [
    FREQUENCY_LABELS[suggestion.frequency] ?? suggestion.frequency,
    suggestion.dayOfWeek?.map((d) => DAY_LABELS[d]).join(", "),
    `at ${suggestion.timeOfDay}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="rounded-xl border border-brand/20 bg-brand/[0.03] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-brand/10">
            <Zap className="size-3.5 text-brand" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-brand">
              Recommended play
            </p>
            <p className="mt-0.5 text-sm font-medium">{suggestion.name}</p>
          </div>
        </div>
        {!resolved && (
          <div className="flex gap-1.5">
            <Button
              size="sm"
              onClick={onAccept}
              className="gap-1.5 rounded-lg bg-brand text-xs font-medium text-white hover:bg-brand/80"
            >
              <Check className="size-3" />
              Deploy
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onReject}
              className="gap-1.5 rounded-lg text-xs"
            >
              <X className="size-3" />
              Skip
            </Button>
          </div>
        )}
        {accepted && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
            <div className="size-1.5 rounded-full bg-emerald-400" />
            Deployed
          </span>
        )}
        {rejected && (
          <span className="text-xs text-muted-foreground">Skipped</span>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {suggestion.description}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {[
          WORKFLOW_TYPE_LABELS[suggestion.type] ?? suggestion.type,
          CHANNEL_LABELS[suggestion.channel] ?? suggestion.channel,
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

      <div className="mt-3 rounded-lg bg-black/20 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60">
          Content brief
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-foreground/80">
          {suggestion.contentBrief}
        </p>
      </div>
    </div>
  );
}
