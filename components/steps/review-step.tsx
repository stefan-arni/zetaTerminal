"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Check,
  Play,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Zap,
} from "lucide-react";
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
import { generateMockPerformance, MOCK_WORKFLOWS } from "@/lib/mock-data";
import type { CronConfig, WorkflowPerformance } from "@/lib/types";

const TrendIcon = { up: TrendingUp, down: TrendingDown, flat: Minus };
const TrendColor = {
  up: "text-emerald-400",
  down: "text-red-400",
  flat: "text-muted-foreground",
};

export function ReviewStep() {
  const { workflows, updateWorkflow, addWorkflow } = useWorkflows();
  const { files } = useFiles();
  const { clearChat } = useChat();
  const { back, goTo } = useStepper();
  const [launched, setLaunched] = useState(false);
  const [debriefText, setDebriefText] = useState("");
  const [debriefLoading, setDebriefLoading] = useState(false);
  const [showDebrief, setShowDebrief] = useState(false);

  const activeCount = workflows.filter((w) => w.status === "active").length;
  const draftCount = workflows.filter((w) => w.status === "draft").length;

  const performance = useMemo(
    () => (launched ? generateMockPerformance(workflows) : []),
    [launched, workflows]
  );
  const perfMap = useMemo(
    () => new Map(performance.map((p) => [p.workflowId, p])),
    [performance]
  );

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

  const loadDemoData = () => {
    const demoWorkflows = MOCK_WORKFLOWS.map((w) => ({ ...w, status: "active" as const }));
    for (const w of demoWorkflows) {
      addWorkflow(w);
    }
    setLaunched(true);
    // Run debrief directly with demo data (don't wait for state)
    const demoPerf = generateMockPerformance(demoWorkflows);
    runDebriefWith(demoWorkflows, demoPerf);
  };

  const runDebriefWith = useCallback(
    async (wfs: CronConfig[], perf: WorkflowPerformance[]) => {
      setShowDebrief(true);
      setDebriefLoading(true);
      setDebriefText("");

      try {
        const res = await fetch("/api/debrief", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workflows: wfs, performance: perf }),
        });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;

          try {
            const chunk = JSON.parse(data) as {
              choices?: Array<{ delta?: { content?: string | null } }>;
            };
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setDebriefText(fullText);
            }
          } catch {
            // skip
          }
        }
      }
    } catch (err) {
      setDebriefText(
        `Error generating debrief: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setDebriefLoading(false);
    }
  }, []);

  const runDebrief = useCallback(() => {
    runDebriefWith(workflows, performance);
  }, [workflows, performance, runDebriefWith]);

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-[960px] px-8 py-8">
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
                Assets ingested
              </p>
            </div>
          </div>

          {/* Empty state — load demo */}
          {workflows.length === 0 && !launched && (
            <div className="mt-6 rounded-xl border border-dashed border-white/[0.08] py-14 text-center">
              <p className="text-sm font-medium">No automations in the pipeline</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Go through the strategy session, or load sample data to preview the debrief.
              </p>
              <Button
                onClick={loadDemoData}
                className="mt-5 gap-2 rounded-lg bg-brand px-5 text-sm font-medium text-white hover:bg-brand/80"
              >
                <BarChart3 className="size-4" />
                Load demo data &amp; run debrief
              </Button>
            </div>
          )}

          {/* Launch success */}
          {launched && !showDebrief && (
            <div className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.04] p-6 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-400/10">
                <Check className="size-6 text-emerald-400" />
              </div>
              <h3 className="mt-3 text-lg font-semibold">
                Campaign pipeline is live
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {workflows.length} automations are scheduled and running.
              </p>
              <Button
                onClick={runDebrief}
                className="mt-5 gap-2 rounded-lg bg-brand px-5 text-sm font-medium text-white hover:bg-brand/80"
              >
                <BarChart3 className="size-4" />
                Run weekly debrief
              </Button>
            </div>
          )}

          {/* Performance metrics + debrief */}
          {showDebrief && (
            <div className="mt-6 space-y-6">
              {/* Performance cards */}
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">
                    Week of Mar 19–26 performance
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    Simulated data for demo
                  </span>
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                  {workflows
                    .filter((w) => w.status === "active")
                    .map((w) => {
                      const p = perfMap.get(w.id);
                      if (!p) return null;
                      const Icon = TrendIcon[p.trend];
                      return (
                        <div
                          key={w.id}
                          className="rounded-xl border border-white/[0.06] bg-surface p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-semibold">{w.name}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {WORKFLOW_TYPE_LABELS[w.type]} /{" "}
                                {CHANNEL_LABELS[w.channel]}
                              </p>
                            </div>
                            <div className={`flex items-center gap-1 ${TrendColor[p.trend]}`}>
                              <Icon className="size-3.5" />
                              <span className="text-xs font-medium">
                                {p.trend === "up"
                                  ? "+40%"
                                  : p.trend === "down"
                                    ? "-25%"
                                    : "flat"}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 grid grid-cols-4 gap-3">
                            <div>
                              <p className="text-lg font-semibold">{p.runs}</p>
                              <p className="text-[10px] text-muted-foreground">
                                Runs
                              </p>
                            </div>
                            <div>
                              <p className="text-lg font-semibold">
                                {p.impressions}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                Reach
                              </p>
                            </div>
                            <div>
                              <p className="text-lg font-semibold">{p.clicks}</p>
                              <p className="text-[10px] text-muted-foreground">
                                Clicks
                              </p>
                            </div>
                            <div>
                              <p className="text-lg font-semibold">
                                {p.engagementRate}%
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                Eng. rate
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 rounded-lg bg-black/20 p-2.5">
                            <p className="text-xs leading-relaxed text-foreground/70">
                              {p.topContent}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* AI debrief */}
              <div className="rounded-xl border border-brand/20 bg-brand/[0.03]">
                <div className="flex items-center gap-2.5 border-b border-brand/10 px-5 py-4">
                  <div className="flex size-7 items-center justify-center rounded-md bg-brand/10">
                    <Zap className="size-3.5 text-brand" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Weekly Debrief</p>
                    <p className="text-xs text-muted-foreground">
                      AI analysis of this week&apos;s performance
                    </p>
                  </div>
                </div>
                <div className="px-5 py-5">
                  {debriefText ? (
                    <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                      {debriefText}
                    </div>
                  ) : debriefLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex gap-1">
                        <span className="size-1.5 animate-bounce rounded-full bg-brand/40 [animation-delay:0ms]" />
                        <span className="size-1.5 animate-bounce rounded-full bg-brand/40 [animation-delay:150ms]" />
                        <span className="size-1.5 animate-bounce rounded-full bg-brand/40 [animation-delay:300ms]" />
                      </div>
                      Analyzing your campaign data...
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {/* Pipeline list */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold">Automation pipeline</h3>
            <div className="mt-4 divide-y divide-white/[0.04] rounded-xl border border-white/[0.06] bg-surface">
              {workflows.map((w) => {
                const schedule = [
                  FREQUENCY_LABELS[w.schedule.frequency],
                  w.schedule.dayOfWeek?.map((d) => DAY_LABELS[d]).join(", "),
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
      </ScrollArea>

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
          {launched && !showDebrief && (
            <Button
              onClick={runDebrief}
              className="gap-2 rounded-lg bg-brand px-5 text-sm font-medium text-white hover:bg-brand/80"
            >
              <BarChart3 className="size-4" />
              Weekly debrief
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
