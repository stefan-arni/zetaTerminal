"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useStepper } from "@/context/stepper-context";
import { useFiles } from "@/context/files-context";
import { WorkflowChatProvider, useWorkflowChat } from "@/context/workflow-chat-context";
import type { ChatMessage } from "@/lib/types";
import type { WorkflowContext } from "@/lib/ai/system-prompt";

// ── Demo move data ─────────────────────────────────────────────────────────────
// In production: parse from the Marketing Brief messages.

export type MoveStatus = "not-started" | "in-progress" | "done";

export interface DemoMove {
  id: string;
  number: string;
  name: string;
  action: string;
  signal: string;
  status: MoveStatus;
}

const DEMO_MOVES: DemoMove[] = [
  {
    id: "reddit-seeding",
    number: "01",
    name: "Seed the Reddit Conversation",
    action:
      "Post 3 authentic questions in r/smallbusiness and r/freelance that surface what agency owners actually hate about project tracking. Don't pitch — ask. You're doing research in public.",
    signal: "5+ upvotes on at least one post. DMs asking when you launch.",
    status: "not-started",
  },
  {
    id: "cold-email",
    number: "02",
    name: "Cold Email 20 Agency Ops Leads",
    action:
      "3-email sequence to studio managers and ops leads at agencies of 5–20 people. Lead with the pain — 'Your Q1 retainer numbers don't match what your team reported.' One CTA per email.",
    signal: "30% open rate. At least 2 replies from your first batch of 20.",
    status: "in-progress",
  },
  {
    id: "landing-hero",
    number: "03",
    name: "Rewrite the Landing Page Hero",
    action:
      "Replace the feature-first hero with the single pain point your user interviews surfaced. Lead with the problem, not the solution. One CTA above the fold.",
    signal: "Bounce rate drops 10pts. CTA click rate above 4%.",
    status: "done",
  },
];

// ── Status helpers ─────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: MoveStatus }) {
  if (status === "in-progress") {
    return (
      <span className="relative flex size-2 shrink-0">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-amber-400" />
      </span>
    );
  }
  if (status === "done") {
    return <span className="size-2 shrink-0 rounded-full bg-emerald-400" />;
  }
  return <span className="size-2 shrink-0 rounded-full bg-white/20" />;
}

const STATUS_LABEL: Record<MoveStatus, string> = {
  "not-started": "Not Started",
  "in-progress": "In Progress",
  done: "Done",
};

// ── Move card ──────────────────────────────────────────────────────────────────

interface MoveCardProps {
  move: DemoMove;
  onSelect: (move: DemoMove) => void;
}

function MoveCard({ move, onSelect }: MoveCardProps) {
  const isDone = move.status === "done";
  const isInProgress = move.status === "in-progress";

  return (
    <div
      className={[
        "group flex flex-col rounded-2xl border p-6 transition-all duration-150",
        isDone
          ? "border-white/[0.05] bg-white/[0.02] opacity-60"
          : isInProgress
            ? "border-amber-400/20 bg-gradient-to-br from-card to-amber-400/[0.03]"
            : "border-white/[0.07] bg-card hover:border-white/[0.14] hover:shadow-[0_0_0_1px_oklch(0.65_0.18_270_/_0.2),0_8px_24px_oklch(0_0_0_/_0.3)]",
      ].join(" ")}
    >
      {/* Top accent bar */}
      <div
        className={[
          "mb-5 h-px w-full rounded-full",
          isInProgress
            ? "bg-amber-400/60"
            : isDone
              ? "bg-white/[0.06]"
              : "bg-brand/0 transition-all duration-150 group-hover:bg-brand/40",
        ].join(" ")}
      />

      <p className="mb-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground/25">
        Move {move.number}
      </p>

      <h3
        className={[
          "mb-3 text-[15px] font-semibold leading-snug",
          isDone ? "text-foreground/40 line-through decoration-foreground/20" : "text-foreground",
        ].join(" ")}
      >
        {move.name}
      </h3>

      <p className="mb-5 flex-1 text-[13px] leading-relaxed text-muted-foreground">
        {move.action}
      </p>

      <div className="mb-5 h-px bg-white/[0.06]" />

      <div className="mb-5 flex items-start gap-2.5">
        <span className="mt-0.5 shrink-0 font-mono text-[10px] font-semibold uppercase tracking-widest text-foreground/25">
          Signal
        </span>
        <p className="text-[12px] leading-relaxed text-muted-foreground">{move.signal}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusDot status={move.status} />
          <span className="text-[11px] font-medium text-muted-foreground">
            {STATUS_LABEL[move.status]}
          </span>
        </div>

        <button
          onClick={() => onSelect(move)}
          className={[
            "rounded-lg px-3.5 py-1.5 text-[12px] font-semibold transition-all duration-120",
            isDone
              ? "bg-white/[0.04] text-foreground/30 hover:bg-white/[0.06] hover:text-foreground/50"
              : "bg-brand/15 text-brand hover:bg-brand hover:text-white",
          ].join(" ")}
        >
          {isDone ? "Review →" : "Work on this →"}
        </button>
      </div>
    </div>
  );
}

// ── Workflow chat ──────────────────────────────────────────────────────────────

interface WorkflowChatProps {
  move: DemoMove;
  onBack: () => void;
}

function WorkflowChatInner({ move, onBack }: WorkflowChatProps) {
  const { messages, isStreaming, addMessage, setStreaming, updateLastAssistant } =
    useWorkflowChat();
  const { files } = useFiles();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, scrollToBottom]);

  const workflowContext: WorkflowContext = {
    name: move.name,
    action: move.action,
    signal: move.signal,
  };

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      const userMsg: ChatMessage = {
        id: `wf-msg-${Date.now()}`,
        role: "user",
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };
      addMessage(userMsg);
      setInput("");
      setStreaming(true);

      const assistantMsg: ChatMessage = {
        id: `wf-msg-${Date.now() + 1}`,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      };
      addMessage(assistantMsg);

      try {
        const apiMessages = [
          ...messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          { role: "user" as const, content: content.trim() },
        ];

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages,
            files,
            workflows: [],
            workflowContext,
          }),
        });

        if (!res.ok || !res.body) {
          throw new Error(`HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data) as {
                choices?: Array<{
                  delta?: { content?: string };
                  finish_reason?: string;
                }>;
                error?: string;
              };

              if (parsed.error) break;

              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                accumulated += delta;
                updateLastAssistant(accumulated);
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      } catch (err) {
        updateLastAssistant(
          err instanceof Error ? `Error: ${err.message}` : "Something went wrong."
        );
      } finally {
        setStreaming(false);
      }
    },
    [messages, isStreaming, files, workflowContext, addMessage, setStreaming, updateLastAssistant]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input);
      }
    },
    [input, sendMessage]
  );

  return (
    <div className="flex h-full flex-col">
      {/* Chat header */}
      <div className="flex shrink-0 items-center gap-4 border-b border-white/[0.06] px-6 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to workflows
        </button>
        <div className="h-4 w-px bg-white/[0.08]" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-foreground">{move.name}</p>
          <p className="text-[11px] text-muted-foreground">
            Move {move.number} · {STATUS_LABEL[move.status]} · Signal: {move.signal}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-[13px] font-medium text-foreground/60">
              Ready to execute.
            </p>
            <p className="mt-1 max-w-sm text-[12px] leading-relaxed text-muted-foreground">
              Tell me where you want to start — I&apos;ll draft the copy, write the email, or
              review whatever you&apos;ve got.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={["flex gap-3", msg.role === "user" ? "flex-row-reverse" : ""].join(" ")}
          >
            <div
              className={[
                "flex size-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold",
                msg.role === "assistant"
                  ? "border-brand/30 bg-brand/10 text-brand"
                  : "border-white/[0.08] bg-white/[0.04] text-muted-foreground",
              ].join(" ")}
            >
              {msg.role === "assistant" ? "Z" : "F"}
            </div>
            <div
              className={[
                "max-w-[85%] rounded-2xl border px-4 py-3 text-[13px] leading-relaxed",
                msg.role === "assistant"
                  ? "rounded-tl-sm border-white/[0.07] bg-card text-foreground"
                  : "rounded-tr-sm border-white/[0.06] bg-white/[0.04] text-muted-foreground",
              ].join(" ")}
            >
              {msg.content || (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="size-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                  <span className="size-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                  <span className="size-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-white/[0.06] px-4 py-3">
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell me where to start..."
            disabled={isStreaming}
            rows={1}
            className="min-h-[40px] flex-1 resize-none rounded-xl border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-[13px] placeholder:text-muted-foreground/50 focus-visible:ring-brand/50"
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            size="icon"
            className="size-10 shrink-0 rounded-xl bg-brand text-white hover:bg-brand/80 disabled:opacity-30"
          >
            <Send className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function WorkflowChat({ move, onBack }: WorkflowChatProps) {
  return (
    <WorkflowChatProvider>
      <WorkflowChatInner move={move} onBack={onBack} />
    </WorkflowChatProvider>
  );
}

// ── Dashboard step ─────────────────────────────────────────────────────────────

export function DashboardStep() {
  const { goTo } = useStepper();
  const [selectedMove, setSelectedMove] = useState<DemoMove | null>(null);

  const handleSelectMove = useCallback((move: DemoMove) => {
    setSelectedMove(move);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedMove(null);
  }, []);

  if (selectedMove) {
    return <WorkflowChat move={selectedMove} onBack={handleBack} />;
  }

  const weekLabel = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-4xl px-8 py-8">

        {/* Check-in banner */}
        <div className="mb-8 flex items-center justify-between gap-6 rounded-2xl border border-white/[0.07] bg-surface px-6 py-5"
          style={{ borderLeft: "3px solid oklch(0.65 0.18 270)" }}>
          <div>
            <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-widest text-brand">
              Week of {weekLabel}
            </p>
            <h2 className="text-[16px] font-semibold text-foreground">
              How are your moves landing?
            </h2>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              Update your CMO on what&apos;s working — get your next call to action.
            </p>
          </div>
          <Button
            onClick={() => goTo("strategy")}
            className="shrink-0 rounded-xl bg-brand px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-brand/80"
          >
            Start weekly check-in →
          </Button>
        </div>

        {/* Workflows header */}
        <div className="mb-5 flex items-baseline justify-between">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight text-foreground">
              Your Workflows This Week
            </h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              3 moves from your marketing brief
            </p>
          </div>
          <span className="font-mono text-[11px] text-foreground/25">
            {weekLabel}
          </span>
        </div>

        {/* Move cards */}
        <div className="grid gap-4 lg:grid-cols-3">
          {DEMO_MOVES.map((move) => (
            <MoveCard key={move.id} move={move} onSelect={handleSelectMove} />
          ))}
        </div>

      </div>
    </div>
  );
}
