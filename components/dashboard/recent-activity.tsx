"use client";

import { useWorkflows } from "@/context/workflows-context";
import { WORKFLOW_TYPE_LABELS, CHANNEL_LABELS } from "@/lib/constants";

export function RecentActivity() {
  const { workflows } = useWorkflows();

  const sorted = [...workflows]
    .filter((w) => w.lastRunAt)
    .sort(
      (a, b) =>
        new Date(b.lastRunAt!).getTime() - new Date(a.lastRunAt!).getTime()
    )
    .slice(0, 6);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-surface">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <h2 className="text-sm font-semibold">Recent executions</h2>
        <span className="text-xs text-muted-foreground">
          {sorted.length} runs
        </span>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {sorted.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No runs yet. Start a strategy session to build your first
              automation.
            </p>
          </div>
        ) : (
          sorted.map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-white/[0.02]"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{w.name}</p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{WORKFLOW_TYPE_LABELS[w.type]}</span>
                  <span className="text-white/10">/</span>
                  <span>{CHANNEL_LABELS[w.channel]}</span>
                </div>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <div
                  className={`size-1.5 rounded-full ${
                    w.status === "active" ? "bg-emerald-400" : "bg-muted-foreground/30"
                  }`}
                />
                <span className="text-xs text-muted-foreground">
                  {w.status === "active" ? "Live" : "Paused"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
