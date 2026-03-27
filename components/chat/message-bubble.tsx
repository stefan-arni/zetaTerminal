"use client";

import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";
import type { ChatMessage } from "@/lib/types";

interface MessageBubbleProps {
  message: ChatMessage;
}

function renderInline(text: string, keyPrefix: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-b${i}`} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={`${keyPrefix}-i${i}`} className="italic text-foreground/80">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <span key={`${keyPrefix}-t${i}`}>{part}</span>;
  });
}

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listBuffer: string[] = [];
  let key = 0;

  function flushList() {
    if (listBuffer.length === 0) return;
    const items = listBuffer.slice();
    listBuffer = [];
    elements.push(
      <ul key={key++} className="my-3 space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground/85">
            <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-brand/50" />
            <span>{renderInline(item, `li-${key}-${i}`)}</span>
          </li>
        ))}
      </ul>
    );
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Horizontal rule
    if (trimmed === "---") {
      flushList();
      elements.push(
        <hr key={key++} className="my-5 border-white/[0.07]" />
      );
      continue;
    }

    // List item (- or *)
    if (/^[-*] /.test(trimmed)) {
      listBuffer.push(trimmed.slice(2));
      continue;
    }

    // Numbered list (1. 2. etc)
    if (/^\d+\. /.test(trimmed)) {
      listBuffer.push(trimmed.replace(/^\d+\. /, ""));
      continue;
    }

    flushList();

    // Empty line — spacing
    if (trimmed === "") {
      elements.push(<div key={key++} className="h-1.5" />);
      continue;
    }

    // Section header: emoji + **ALL CAPS** or similar bold-only line
    // e.g. "🎯 **BRAND POSITIONING**" or "## Header"
    const isSectionHeader =
      /^[#]+\s/.test(trimmed) ||
      /^[\p{Emoji}\s]*\*\*[^a-z]+\*\*\s*$/u.test(trimmed);

    if (isSectionHeader) {
      const text = trimmed.replace(/^#+\s/, "");
      elements.push(
        <div key={key++} className="mb-2 mt-5 first:mt-0 text-sm font-semibold tracking-wide text-foreground">
          {renderInline(text, `h-${key}`)}
        </div>
      );
      continue;
    }

    // Sub-label line: starts with **Label:** (bold label followed by colon)
    const isLabel = /^\*\*[^*]+:\*\*/.test(trimmed);
    if (isLabel) {
      elements.push(
        <div key={key++} className="mt-2.5 text-sm leading-relaxed text-foreground/90">
          {renderInline(trimmed, `lbl-${key}`)}
        </div>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={key++} className="text-sm leading-relaxed text-foreground/85">
        {renderInline(trimmed, `p-${key}`)}
      </p>
    );
  }

  flushList();

  return <div>{elements}</div>;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          isUser ? "bg-white/[0.08] text-foreground" : "bg-brand/15 text-brand"
        )}
      >
        {isUser ? (
          <span className="text-xs font-semibold">Y</span>
        ) : (
          <Zap className="size-3.5" />
        )}
      </div>
      <div
        className={cn(
          "rounded-2xl px-4 py-3",
          isUser
            ? "max-w-[75%] bg-white/[0.09] text-foreground"
            : "w-full max-w-[88%] bg-surface"
        )}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </div>
        ) : (
          <MarkdownContent content={message.content} />
        )}
      </div>
    </div>
  );
}
