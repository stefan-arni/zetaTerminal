"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "@/components/chat/message-bubble";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import {
  CronSuggestionCard,
  type WorkflowSuggestion,
} from "@/components/chat/cron-suggestion-card";
import { useChat } from "@/context/chat-context";
import { useFiles } from "@/context/files-context";
import { useWorkflows } from "@/context/workflows-context";
import { useStepper } from "@/context/stepper-context";
import type { ChatMessage, CronConfig } from "@/lib/types";

interface SuggestionState {
  messageId: string;
  suggestion: WorkflowSuggestion;
  status: "pending" | "accepted" | "rejected";
}

export function StrategyStep() {
  const { messages, isStreaming, addMessage, setStreaming, updateLastAssistant } =
    useChat();
  const { files } = useFiles();
  const { workflows, addWorkflow } = useWorkflows();
  const { goTo } = useStepper();
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestionState[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasAutoStarted = useRef(false);
  const sessionNumber = parseInt(localStorage.getItem("zeta_session_count") ?? "1", 10);


  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, scrollToBottom]);


  useEffect(() => {
    if (hasAutoStarted.current || messages.length !== 0 || isStreaming) return;
    hasAutoStarted.current = true;

    const assistantMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
    };
    addMessage(assistantMsg);
    setStreaming(true);

    const run = async () => {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [], files, workflows, sessionNumber }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            (errData as { error?: string }).error ?? `HTTP ${res.status}`
          );
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";
        let fullText = "";
        const toolCalls: Record<number, { name: string; args: string }> = {};

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") {
              for (const tc of Object.values(toolCalls)) {
                if (tc.name === "suggest_workflow" && tc.args) {
                  try {
                    const suggestion = JSON.parse(tc.args) as WorkflowSuggestion;
                    setSuggestions((prev) => [
                      ...prev,
                      {
                        messageId: assistantMsg.id,
                        suggestion,
                        status: "pending",
                      },
                    ]);
                  } catch {
                    // invalid JSON
                  }
                }
              }
              break;
            }

            try {
              const chunk = JSON.parse(data) as {
                choices?: Array<{
                  delta?: {
                    content?: string | null;
                    tool_calls?: Array<{
                      index: number;
                      function?: { name?: string; arguments?: string };
                    }>;
                  };
                }>;
              };

              const delta = chunk.choices?.[0]?.delta;
              if (!delta) continue;

              if (delta.content) {
                fullText += delta.content;
                updateLastAssistant(fullText);
              }

              if (delta.tool_calls) {
                for (const tc of delta.tool_calls) {
                  if (!toolCalls[tc.index]) {
                    toolCalls[tc.index] = { name: "", args: "" };
                  }
                  if (tc.function?.name) {
                    toolCalls[tc.index].name = tc.function.name;
                  }
                  if (tc.function?.arguments) {
                    toolCalls[tc.index].args += tc.function.arguments;
                  }
                }
              }
            } catch {
              // parse error
            }
          }
        }
      } catch (err) {
        updateLastAssistant(
          `Sorry, I encountered an error: ${err instanceof Error ? err.message : "Unknown error"}. Please try again.`
        );
      } finally {
        setStreaming(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "user",
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };
      addMessage(userMsg);
      setInput("");
      setStreaming(true);

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
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
          body: JSON.stringify({ messages: apiMessages, files, workflows, sessionNumber }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            (errData as { error?: string }).error ?? `HTTP ${res.status}`
          );
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";
        let fullText = "";
        const toolCalls: Record<number, { name: string; args: string }> = {};

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") {
              for (const tc of Object.values(toolCalls)) {
                if (tc.name === "suggest_workflow" && tc.args) {
                  try {
                    const suggestion = JSON.parse(tc.args) as WorkflowSuggestion;
                    setSuggestions((prev) => [
                      ...prev,
                      {
                        messageId: assistantMsg.id,
                        suggestion,
                        status: "pending",
                      },
                    ]);
                  } catch {
                    // invalid JSON
                  }
                }
              }
              break;
            }

            try {
              const chunk = JSON.parse(data) as {
                choices?: Array<{
                  delta?: {
                    content?: string | null;
                    tool_calls?: Array<{
                      index: number;
                      function?: { name?: string; arguments?: string };
                    }>;
                  };
                }>;
              };

              const delta = chunk.choices?.[0]?.delta;
              if (!delta) continue;

              if (delta.content) {
                fullText += delta.content;
                updateLastAssistant(fullText);
              }

              if (delta.tool_calls) {
                for (const tc of delta.tool_calls) {
                  if (!toolCalls[tc.index]) {
                    toolCalls[tc.index] = { name: "", args: "" };
                  }
                  if (tc.function?.name) {
                    toolCalls[tc.index].name = tc.function.name;
                  }
                  if (tc.function?.arguments) {
                    toolCalls[tc.index].args += tc.function.arguments;
                  }
                }
              }
            } catch {
              // parse error
            }
          }
        }
      } catch (err) {
        updateLastAssistant(
          `Sorry, I encountered an error: ${err instanceof Error ? err.message : "Unknown error"}. Please try again.`
        );
      } finally {
        setStreaming(false);
      }
    },
    [messages, files, workflows, isStreaming, addMessage, setStreaming, updateLastAssistant]
  );

  const handleAcceptSuggestion = useCallback(
    (index: number) => {
      const s = suggestions[index];
      if (!s) return;

      const workflow: CronConfig = {
        id: `wf-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        name: s.suggestion.name,
        description: s.suggestion.description,
        type: s.suggestion.type as CronConfig["type"],
        schedule: {
          frequency: s.suggestion.frequency as CronConfig["schedule"]["frequency"],
          dayOfWeek: s.suggestion.dayOfWeek,
          timeOfDay: s.suggestion.timeOfDay,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        channel: (s.suggestion.channel ?? "discord") as CronConfig["channel"],
        contentBrief: s.suggestion.contentBrief,
        status: "draft",
        createdAt: new Date().toISOString(),
      };
      addWorkflow(workflow);

      setSuggestions((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, status: "accepted" } : item
        )
      );
    },
    [suggestions, addWorkflow]
  );

  const handleRejectSuggestion = useCallback(
    (index: number) => {
      setSuggestions((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, status: "rejected" } : item
        )
      );
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input);
      }
    },
    [input, sendMessage]
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="mx-auto max-w-[760px] px-8 py-10">
            {/* Opening statement — stays in box during streaming and after */}
            {(messages.length === 0 && isStreaming) || (messages.length === 1 && messages[0]?.role === "assistant") ? (
              <div className="mb-8 rounded-2xl border border-white/[0.08] bg-surface px-8 py-8">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50">
                  Your CMO reviewed your materials
                </p>
                {!messages[0]?.content ? (
                  <TypingIndicator />
                ) : (
                  <MessageBubble message={messages[0]} isOpening />
                )}
              </div>
            ) : null}

            <div className="space-y-5">
              {messages.map((msg, idx) => {
                // Skip the first message — always rendered in the opening box above
                if (idx === 0 && messages.length === 1 && msg.role === "assistant") return null;

                // Brief message — let it stream in naturally, then show the card below
                const isBrief =
                  msg.role === "assistant" &&
                  msg.content.includes("BRAND POSITIONING");

                // While streaming: show the transition sentence + a loading indicator
                // Don't show the raw brief text — it gets replaced by the card after done
                if (isBrief && isStreaming) {
                  const preBriefContent = msg.content
                    .split("**BRAND POSITIONING**")[0]
                    .replace(/^---\s*/, "")
                    .trim();

                  return (
                    <div key={msg.id} className="space-y-4">
                      {preBriefContent && (
                        <MessageBubble message={{ ...msg, content: preBriefContent }} />
                      )}
                      <div className="rounded-2xl border border-brand/20 bg-brand/[0.03] px-7 py-5">
                        <div className="flex items-center gap-3">
                          <Loader2 className="size-4 animate-spin text-brand opacity-60" />
                          <p className="text-sm text-muted-foreground">Generating your playbook…</p>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (isBrief) {
                  // Extract any conversational text before the brief divider
                  const preBriefContent = msg.content
                    .split("**BRAND POSITIONING**")[0]
                    .replace(/^---\s*/, "")
                    .trim();

                  return (
                    <div key={msg.id} className="space-y-4">
                      {preBriefContent && (
                        <MessageBubble message={{ ...msg, content: preBriefContent }} />
                      )}
                      <div className="rounded-2xl border border-brand/20 bg-brand/[0.03] px-7 py-5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Loader2 className="size-4 text-brand opacity-40" />
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                Your playbook is ready
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Review it when you&apos;re ready
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => goTo("brief")}
                            className="shrink-0 rounded-lg bg-brand hover:bg-brand/80 text-xs font-medium"
                          >
                            View Your Playbook
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id}>
                    <MessageBubble message={msg} />
                    {suggestions
                      .filter((s) => s.messageId === msg.id)
                      .map((s, i) => {
                        const globalIndex = suggestions.findIndex((gs) => gs === s);
                        return (
                          <div key={i} className="ml-12 mt-3">
                            <CronSuggestionCard
                              suggestion={s.suggestion}
                              onAccept={() => handleAcceptSuggestion(globalIndex)}
                              onReject={() => handleRejectSuggestion(globalIndex)}
                              accepted={s.status === "accepted"}
                              rejected={s.status === "rejected"}
                            />
                          </div>
                        );
                      })}
                  </div>
                );
              })}
              {isStreaming && messages[messages.length - 1]?.content === "" && messages.length > 1 && (
                <TypingIndicator />
              )}
            </div>

          </div>
        </ScrollArea>
      </div>

      {/* Input bar */}
      <div className="border-t border-white/[0.06] bg-surface/50 px-8 pb-4 pt-3">
        {messages.length <= 1 && !isStreaming && (
          <p className="mx-auto mb-2 max-w-[760px] text-xs text-muted-foreground/50">
            Answer a few questions — your playbook generates automatically.
          </p>
        )}
        <div className="mx-auto flex max-w-[760px] gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Talk to your CMO..."
            className="min-h-[48px] max-h-[140px] resize-none rounded-xl border-white/[0.08] bg-surface text-sm placeholder:text-muted-foreground/50 focus-visible:ring-brand/30"
            rows={1}
            disabled={isStreaming}
          />
          <Button
            size="icon-lg"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            aria-label="Send message"
            className="shrink-0 rounded-xl bg-brand hover:bg-brand/80"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>

    </div>
  );
}
