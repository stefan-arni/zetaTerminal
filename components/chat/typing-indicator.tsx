"use client";

import { Zap } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand">
        <Zap className="size-3.5" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl bg-surface px-5 py-3.5">
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/30 [animation-delay:0ms]" />
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/30 [animation-delay:150ms]" />
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/30 [animation-delay:300ms]" />
      </div>
    </div>
  );
}
