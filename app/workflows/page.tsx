"use client";

import { DemoDashboard } from "@/components/dashboard/demo-dashboard";

export default function WorkflowsPage() {
  return (
    <div className="flex h-full flex-col">
      {/* Page header */}
      <div className="shrink-0 border-b border-white/[0.06] px-8 py-5">
        <h1 className="text-2xl font-semibold tracking-tight">Your Workflows</h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <DemoDashboard />
      </div>
    </div>
  );
}
