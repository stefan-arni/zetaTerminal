"use client";

import { useFiles } from "@/context/files-context";
import { useWorkflows } from "@/context/workflows-context";

export function StatsOverview() {
  const { files } = useFiles();
  const { workflows } = useWorkflows();

  const active = workflows.filter((w) => w.status === "active").length;
  const touchpoints = active * 3;

  const stats = [
    { value: active, label: "Live campaigns", accent: true },
    { value: workflows.length, label: "Total automations", accent: false },
    { value: files.length, label: "Brand assets", accent: false },
    { value: touchpoints, label: "Touchpoints / wk", accent: false },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`rounded-xl border p-5 transition-colors ${
            s.accent
              ? "border-brand/20 bg-brand/[0.04]"
              : "border-white/[0.06] bg-surface"
          }`}
        >
          <p
            className={`text-3xl font-semibold tracking-tight ${
              s.accent ? "text-brand" : "text-foreground"
            }`}
          >
            {s.value}
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
