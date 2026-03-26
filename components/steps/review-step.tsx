"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Play, RotateCcw } from "lucide-react";
import { useWorkflows } from "@/context/workflows-context";
import { useFiles } from "@/context/files-context";
import { useChat } from "@/context/chat-context";
import { useStepper } from "@/context/stepper-context";
import {
  WORKFLOW_TYPE_LABELS,
  CHANNEL_LABELS,
  FREQUENCY_LABELS,
  DAY_LABELS,
} from "@/lib/constants";
import { useState } from "react";

export function ReviewStep() {
  const { workflows, updateWorkflow } = useWorkflows();
  const { files } = useFiles();
  const { clearChat } = useChat();
  const { back, goTo } = useStepper();
  const [launched, setLaunched] = useState(false);

  const activeCount = workflows.filter((w) => w.status === "active").length;
  const draftCount = workflows.filter((w) => w.status === "draft").length;

  const handleLaunch = () => {
    for (const w of workflows) {
      if (w.status === "draft") {
        updateWorkflow(w.id, { status: "active" });
      }
    }
    setLaunched(true);
  };

  const handleNewCampaign = () => {
    clearChat();
    goTo("upload");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto px-8 py-8">
        <div className="mx-auto max-w-[900px]">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-white/[0.06] bg-surface p-5">
              <p className="text-3xl font-semibold tracking-tight text-brand">
                {workflows.length}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Total automations
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-surface p-5">
              <p className="text-3xl font-semibold tracking-tight text-emerald-400">
                {activeCount}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Live</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-surface p-5">
              <p className="text-3xl font-semibold tracking-tight">
                {files.length}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Brand assets ingested
              </p>
            </div>
          </div>

          {/* Success state */}
          {launched && (
            <div className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.04] p-6 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-400/10">
                <Check className="size-6 text-emerald-400" />
              </div>
              <h3 className="mt-3 text-lg font-semibold">
                Campaign pipeline is live
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {workflows.length} automations are now scheduled and running. You&apos;ll see
                activity appear here as they execute.
              </p>
            </div>
          )}

          {/* Automation list */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold">Automation pipeline</h3>
            <div className="mt-4 divide-y divide-white/[0.04] rounded-xl border border-white/[0.06] bg-surface">
              {workflows.map((w) => {
                const schedule = [
                  FREQUENCY_LABELS[w.schedule.frequency],
                  w.schedule.dayOfWeek
                    ?.map((d) => DAY_LABELS[d])
                    .join(", "),
                  `at ${w.schedule.timeOfDay}`,
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <div
                    key={w.id}
                    className="flex items-center justify-between px-5 py-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`size-2 rounded-full ${
                            w.status === "active"
                              ? "bg-emerald-400"
                              : w.status === "draft"
                                ? "bg-brand/40"
                                : "bg-muted-foreground/30"
                          }`}
                        />
                        <p className="truncate text-sm font-medium">
                          {w.name}
                        </p>
                      </div>
                      <div className="ml-[18px] mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{WORKFLOW_TYPE_LABELS[w.type]}</span>
                        <span className="text-white/10">/</span>
                        <span>{CHANNEL_LABELS[w.channel]}</span>
                        <span className="text-white/10">/</span>
                        <span>{schedule}</span>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        w.status === "active"
                          ? "text-emerald-400"
                          : w.status === "draft"
                            ? "text-brand"
                            : "text-muted-foreground"
                      }`}
                    >
                      {w.status === "active"
                        ? "Live"
                        : w.status === "draft"
                          ? "Ready"
                          : "Paused"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-white/[0.06] px-8 py-4">
        <Button
          variant="ghost"
          onClick={back}
          className="gap-2 text-sm text-muted-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to schedule
        </Button>
        <div className="flex gap-3">
          {launched && (
            <Button
              variant="outline"
              onClick={handleNewCampaign}
              className="gap-2 rounded-lg text-sm"
            >
              <RotateCcw className="size-4" />
              New campaign
            </Button>
          )}
          {!launched && draftCount > 0 && (
            <Button
              onClick={handleLaunch}
              className="gap-2 rounded-lg bg-emerald-500 px-6 text-sm font-semibold text-white hover:bg-emerald-400"
            >
              <Play className="size-4" />
              Launch {draftCount} automation{draftCount !== 1 ? "s" : ""}
            </Button>
          )}
          {!launched && draftCount === 0 && activeCount > 0 && (
            <p className="flex items-center gap-2 text-sm text-emerald-400">
              <Check className="size-4" />
              All automations are live
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
