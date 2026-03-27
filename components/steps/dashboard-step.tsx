"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useStepper } from "@/context/stepper-context";
import { useFiles } from "@/context/files-context";
import { useChat } from "@/context/chat-context";
import { WorkflowChatProvider, useWorkflowChat } from "@/context/workflow-chat-context";
import type { ChatMessage } from "@/lib/types";
import type { WorkflowContext } from "@/lib/ai/system-prompt";

// ── Types ──────────────────────────────────────────────────────────────────────

export type MoveStatus = "not-started" | "in-progress" | "done";

export interface DemoMove {
  id: string;
  number: string;
  name: string;
  action: string;
  signal: string;
  status: MoveStatus;
}

// ── Playbook parser ────────────────────────────────────────────────────────────

function stripEmoji(text: string): string {
  return text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").trim();
}

function parseMovesFromBrief(content: string): DemoMove[] {
  // Split into --- separated chunks (same as brief-step.tsx)
  const chunks = content.split(/\n[ \t]*---[ \t]*\n/);
  const movesChunk = chunks.find((c) => c.toUpperCase().includes("TOP 3 MOVES"));
  if (!movesChunk) return [];

  const lines = movesChunk.split("\n");
  const tierNumbers: Record<string, string> = { now: "01", soon: "02", later: "03" };

  type TierKey = "now" | "soon" | "later";
  const blocks: Array<{ tier: TierKey; lines: string[] }> = [];
  let current: { tier: TierKey; lines: string[] } | null = null;

  for (const line of lines) {
    const upper = line.toUpperCase();
    const tier: TierKey | null =
      upper.includes("DO NOW") ? "now" :
      upper.includes("DO SOON") ? "soon" :
      upper.includes("BUILD TOWARD") ? "later" : null;

    if (tier) {
      current = { tier, lines: [] };
      blocks.push(current);
    } else if (current) {
      current.lines.push(line);
    }
  }

  const moves: DemoMove[] = [];

  for (const block of blocks) {
    let name = "";
    let action = "";
    let signal = "";

    for (const line of block.lines) {
      const trimmed = line.trim();

      // Move name: first **...** line not matching tier keywords
      if (!name && /^\*\*[^*]+\*\*$/.test(trimmed)) {
        const candidate = stripEmoji(trimmed.replace(/\*\*/g, "")).trim();
        const upper = candidate.toUpperCase();
        if (!upper.includes("DO NOW") && !upper.includes("DO SOON") && !upper.includes("BUILD TOWARD")) {
          name = candidate;
        }
        continue;
      }

      // Action: "- What: ..."
      if (!action && /^-\s*what:/i.test(trimmed)) {
        action = trimmed.replace(/^-\s*what:\s*/i, "").trim();
        continue;
      }

      // Signal: "- You'll know it worked when: ..."
      if (!signal && /^-\s*you'?ll know it worked when:/i.test(trimmed)) {
        signal = trimmed.replace(/^-\s*you'?ll know it worked when:\s*/i, "").trim();
        continue;
      }
    }

    if (!name && !action) continue; // skip empty blocks

    moves.push({
      id: `move-${block.tier}-${Date.now()}-${Math.random()}`,
      number: tierNumbers[block.tier],
      name: name || "Untitled move",
      action: action || "",
      signal: signal || "",
      status: "not-started",
    });
  }

  return moves;
}

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
        "group flex flex-col rounded-2xl border-[1.5px] border-t-2 p-6 transition-all duration-150",
        isDone
          ? "border-white/[0.05] border-t-white/[0.08] bg-white/[0.02]"
          : isInProgress
            ? "border-amber-400/20 border-t-amber-400/60 bg-gradient-to-br from-card to-amber-400/[0.03]"
            : "border-white/[0.07] border-t-white/[0.07] bg-card hover:border-white/[0.12] hover:border-t-brand/50 hover:shadow-[0_0_0_1px_oklch(0.65_0.18_270_/_0.2),0_8px_24px_oklch(0_0_0_/_0.3)]",
      ].join(" ")}
    >

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
  const { messages } = useChat();
  const [selectedMove, setSelectedMove] = useState<DemoMove | null>(null);

  const briefMessage = messages.find(
    (m) => m.role === "assistant" && m.content.includes("BRAND POSITIONING")
  );

  const moves: DemoMove[] = briefMessage ? parseMovesFromBrief(briefMessage.content) : [];

  const handleSelectMove = useCallback((move: DemoMove) => {
    setSelectedMove(move);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedMove(null);
  }, []);

  if (selectedMove) {
    return <WorkflowChat move={selectedMove} onBack={handleBack} />;
  }

  // Empty state — no playbook yet
  if (moves.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="text-[15px] font-semibold text-foreground">
          Your active plays will appear here
        </p>
        <p className="max-w-sm text-[13px] leading-relaxed text-muted-foreground">
          Complete your Strategy Session to see your Top 3 Moves as executable workflow cards.
        </p>
        <Button
          onClick={() => goTo("strategy")}
          className="mt-2 rounded-xl bg-brand px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-brand/80"
        >
          Go to Strategy Session →
        </Button>
      </div>
    );
  }

  const weekLabel = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-4xl px-8 py-8">

        {/* Check-in banner */}
        <div className="mb-8 flex items-center justify-between gap-6 rounded-2xl border border-white/[0.07] border-l-[3px] border-l-brand bg-surface px-6 py-5">
          <div>
            <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-widest text-brand">
              Next weekly check-in · {weekLabel}
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
            Check in now →
          </Button>
        </div>

        {/* Workflows header */}
        <div className="mb-5 flex items-baseline justify-between">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight text-foreground">
              Your Active Plays
            </h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {moves.length} move{moves.length !== 1 ? "s" : ""} from your marketing playbook
            </p>
          </div>
          <span className="font-mono text-[11px] text-foreground/25">
            {weekLabel}
          </span>
        </div>

        {/* Move cards */}
        <div className="grid gap-4 lg:grid-cols-3">
          {moves.map((move) => (
            <MoveCard key={move.id} move={move} onSelect={handleSelectMove} />
          ))}
        </div>

      </div>
    </div>
  );
}
