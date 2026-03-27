"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Copy, Check as CheckIcon,
  Zap, Clock, TrendingUp,
} from "lucide-react";
import { useChat } from "@/context/chat-context";
import { useStepper } from "@/context/stepper-context";

// ── Utilities ──────────────────────────────────────────────────────────────────

function stripEmoji(text: string): string {
  return text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").trim();
}

// ── Section definitions ────────────────────────────────────────────────────────

const SECTIONS = [
  { id: "brand-positioning", keyword: "BRAND POSITIONING", label: "Brand Positioning" },
  { id: "first-audience",    keyword: "FIRST AUDIENCE",    label: "First Audience" },
  { id: "top-3-moves",       keyword: "TOP 3 MOVES",       label: "Top 3 Moves" },
  { id: "not-yet",           keyword: "NOT YET",           label: "Not Yet" },
  { id: "this-week",         keyword: "THIS WEEK",         label: "This Week" },
] as const;

function sectionIdForText(text: string): string | null {
  const upper = text.toUpperCase();
  for (const s of SECTIONS) {
    if (upper.includes(s.keyword)) return s.id;
  }
  return null;
}

// ── Inline markdown ────────────────────────────────────────────────────────────

function renderInline(text: string, key: string): React.ReactNode {
  const parts = stripEmoji(text).split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={`${key}-b${i}`} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={`${key}-i${i}`} className="italic text-foreground/70">{part.slice(1, -1)}</em>;
    return <span key={`${key}-t${i}`}>{part}</span>;
  });
}

// ── Standard content renderer ──────────────────────────────────────────────────

function SectionContent({ lines }: { lines: string[] }) {
  const elements: React.ReactNode[] = [];
  let listBuffer: string[] = [];
  let k = 0;

  function flushList() {
    if (listBuffer.length === 0) return;
    const items = listBuffer.slice();
    listBuffer = [];
    elements.push(
      <ul key={k++} className="my-3 space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-foreground/80">
            <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-brand/50" />
            <span>{renderInline(item, `li-${k}-${i}`)}</span>
          </li>
        ))}
      </ul>
    );
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^[-*] /.test(trimmed)) { listBuffer.push(trimmed.slice(2)); continue; }
    if (/^\d+\. /.test(trimmed)) { listBuffer.push(trimmed.replace(/^\d+\. /, "")); continue; }

    flushList();

    if (trimmed === "") { elements.push(<div key={k++} className="h-1.5" />); continue; }

    // Bold-label lines: **Label:**
    if (/^\*\*[^*]+:\*\*/.test(trimmed)) {
      elements.push(
        <div key={k++} className="mt-3 text-sm leading-relaxed text-foreground/90">
          {renderInline(trimmed, `lbl-${k}`)}
        </div>
      );
      continue;
    }

    // Bold sub-header (no colon) — e.g. move names
    if (/^\*\*[^*]+\*\*$/.test(trimmed)) {
      elements.push(
        <div key={k++} className="mt-3 text-sm font-semibold text-foreground">
          {renderInline(trimmed, `sh-${k}`)}
        </div>
      );
      continue;
    }

    elements.push(
      <p key={k++} className="text-sm leading-relaxed text-foreground/80">
        {renderInline(trimmed, `p-${k}`)}
      </p>
    );
  }

  flushList();
  return <>{elements}</>;
}

// ── Top 3 Moves renderer ───────────────────────────────────────────────────────

interface MoveBlock {
  type: "now" | "soon" | "later";
  header: string;
  lines: string[];
}

const MOVE_CONFIG = {
  now: {
    Icon: Zap,
    iconClass: "text-red-400",
    cardClass: "border-l-2 border-red-400/60 bg-red-500/[0.04] rounded-r-xl pl-5 py-4 pr-4",
  },
  soon: {
    Icon: Clock,
    iconClass: "text-yellow-400",
    cardClass: "border-l-2 border-yellow-400/60 bg-yellow-500/[0.04] rounded-r-xl pl-5 py-4 pr-4",
  },
  later: {
    Icon: TrendingUp,
    iconClass: "text-emerald-400",
    cardClass: "border-l-2 border-emerald-400/60 bg-emerald-500/[0.04] rounded-r-xl pl-5 py-4 pr-4",
  },
} as const;

function parseMoveBlocks(lines: string[]): MoveBlock[] {
  const blocks: MoveBlock[] = [];
  let current: MoveBlock | null = null;

  for (const line of lines) {
    const upper = line.toUpperCase();
    const type: MoveBlock["type"] | null =
      upper.includes("DO NOW") ? "now" :
      upper.includes("DO SOON") ? "soon" :
      upper.includes("BUILD TOWARD") ? "later" : null;

    if (type) {
      const header = stripEmoji(line.replace(/\*\*/g, "")).trim();
      current = { type, header, lines: [] };
      blocks.push(current);
    } else if (current) {
      current.lines.push(line);
    }
  }

  return blocks;
}

function MovesSection({ lines }: { lines: string[] }) {
  const blocks = parseMoveBlocks(lines);
  if (blocks.length === 0) return <SectionContent lines={lines} />;

  return (
    <div className="mt-2 space-y-3">
      {blocks.map((block, i) => {
        const { Icon, iconClass, cardClass } = MOVE_CONFIG[block.type];
        return (
          <div key={i} className={cardClass}>
            <div className="mb-3 flex items-center gap-2">
              <Icon className={`size-4 ${iconClass}`} />
              <span className={`text-sm font-semibold ${iconClass}`}>{block.header}</span>
            </div>
            <SectionContent lines={block.lines} />
          </div>
        );
      })}
    </div>
  );
}

// ── Section parsing ────────────────────────────────────────────────────────────

interface ParsedSection {
  id: string;
  sectionKey: string | null;
  headerLine: string;
  contentLines: string[];
}

function parseSections(content: string): ParsedSection[] {
  const chunks = content.split(/\n[ \t]*---[ \t]*\n/);
  const result: ParsedSection[] = [];
  let counter = 0;

  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;

    const lines = trimmed.split("\n");
    const sectionKey = sectionIdForText(trimmed);
    if (!sectionKey) continue; // skip opener sentence and other non-section chunks

    // Find the header line and where content starts
    const sectionMeta = SECTIONS.find((s) => s.id === sectionKey);
    let headerLine = "";
    let contentStart = 0;

    for (let i = 0; i < lines.length; i++) {
      const l = lines[i].trim();
      if (l && sectionMeta && l.toUpperCase().includes(sectionMeta.keyword)) {
        headerLine = stripEmoji(l.replace(/\*\*/g, "")).trim();
        contentStart = i + 1;
        break;
      }
    }

    result.push({
      id: sectionKey ?? `section-${counter++}`,
      sectionKey,
      headerLine,
      contentLines: lines.slice(contentStart),
    });
  }

  return result;
}

// ── Section card ───────────────────────────────────────────────────────────────

function SectionCard({ section }: { section: ParsedSection }) {
  const isThisWeek = section.sectionKey === "this-week";
  const isNotYet = section.sectionKey === "not-yet";
  const isMoves = section.sectionKey === "top-3-moves";

  return (
    <div
      id={section.id}
      className={`scroll-mt-6 rounded-2xl border px-7 py-6 ${
        isThisWeek
          ? "border-brand/25 bg-brand/[0.03]"
          : isNotYet
          ? "border-amber-500/20 bg-amber-500/[0.02]"
          : "border-white/[0.08] bg-surface"
      }`}
    >
      {section.headerLine && (
        <div className="mb-5 border-b border-white/[0.06] pb-4 text-lg font-semibold tracking-tight text-foreground capitalize">
          {section.headerLine.toLowerCase()}
        </div>
      )}
      {isMoves ? (
        <MovesSection lines={section.contentLines} />
      ) : (
        <SectionContent lines={section.contentLines} />
      )}
    </div>
  );
}

// ── Workflow cards ─────────────────────────────────────────────────────────────

interface WorkflowCard {
  id: string;
  title: string;
  description: string;
  signal: string;
  moveType: MoveBlock["type"];
}

const TIER_CONFIG: Record<MoveBlock["type"], {
  label: string;
  textClass: string;
  borderClass: string;
  bgClass: string;
  tagBgClass: string;
}> = {
  now:   { label: "DO NOW",       textClass: "text-red-400",     borderClass: "border-red-400/60",     bgClass: "bg-red-500/[0.03]",     tagBgClass: "bg-red-500/10"     },
  soon:  { label: "DO SOON",      textClass: "text-yellow-400",  borderClass: "border-yellow-400/60",  bgClass: "bg-yellow-500/[0.03]",  tagBgClass: "bg-yellow-500/10"  },
  later: { label: "BUILD TOWARD", textClass: "text-emerald-400", borderClass: "border-emerald-400/60", bgClass: "bg-emerald-500/[0.03]", tagBgClass: "bg-emerald-500/10" },
};

const FALLBACK_WORKFLOWS: WorkflowCard[] = [
  { id: "move-workflow-0", title: "Community Listening",  description: "Monitor Reddit & Discord for your target keywords weekly.", signal: "You start seeing relevant conversations to join.", moveType: "now"   },
  { id: "move-workflow-1", title: "Beta Waitlist Email",  description: "Auto-send a welcome email when someone signs up for early access.", signal: "You receive replies or questions from new signups.", moveType: "soon"  },
  { id: "move-workflow-2", title: "Weekly Check-in",      description: "Monday reminder: post in one community, record one learning.", signal: "You have a consistent weekly presence in your target community.", moveType: "later" },
];

function workflowsFromMoves(sections: ParsedSection[]): WorkflowCard[] | null {
  const movesSection = sections.find((s) => s.sectionKey === "top-3-moves");
  if (!movesSection) return null;

  const blocks = parseMoveBlocks(movesSection.contentLines);
  if (blocks.length === 0) return null;

  return blocks.map((block, i) => {
    const nameLine = block.lines.find((l) => /^\*\*[^*:]+\*\*$/.test(l.trim()));
    const name = nameLine ? stripEmoji(nameLine.replace(/\*\*/g, "")).trim() : `Move ${i + 1}`;
    const whatLine = block.lines.find((l) => /^[-–]\s*what:/i.test(l.trim()));
    const action = whatLine ? whatLine.replace(/^[-–]\s*what:\s*/i, "").trim() : "";
    const signalLine = block.lines.find((l) => /worked when/i.test(l));
    const signal = signalLine ? signalLine.replace(/^[-–]\s*you'll know it worked when:\s*/i, "").trim() : "";
    return {
      id: `move-workflow-${i}`,
      title: name,
      description: action || name,
      signal,
      moveType: block.type,
    };
  });
}

// ── Main component ─────────────────────────────────────────────────────────────

export function BriefStep() {
  const { messages } = useChat();
  const { goTo } = useStepper();
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0].id);
  const scrollRef = useRef<HTMLDivElement>(null);

  const briefMessage = messages.find(
    (m) => m.role === "assistant" && m.content.includes("BRAND POSITIONING")
  );

  const copyConversation = useCallback(async () => {
    const payload = JSON.stringify(
      messages.map((m) => ({ role: m.role, content: m.content })),
      null,
      2
    );
    await navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [messages]);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const el = scrollRef.current?.querySelector(`#${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!briefMessage) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">Your playbook isn&apos;t ready yet.</p>
        <button
          onClick={() => goTo("strategy")}
          className="text-sm font-medium text-brand hover:text-brand/80 transition-colors"
        >
          ← Back to strategy session
        </button>
      </div>
    );
  }

  const sections = parseSections(briefMessage.content);
  const availableSections = SECTIONS.filter((s) =>
    sections.some((ps) => ps.id === s.id)
  );
  const workflowCards = workflowsFromMoves(sections) ?? FALLBACK_WORKFLOWS;

  return (
    <div className="flex h-full overflow-hidden">

      {/* TOC sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-white/[0.06] px-5 py-8 md:flex">
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50">
          Contents
        </p>
        <nav className="space-y-0.5">
          {availableSections.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`w-full rounded-r-md px-3 py-2.5 text-left text-sm transition-colors ${
                activeSection === s.id
                  ? "border-l-2 border-brand bg-brand/10 font-medium text-brand"
                  : "border-l-2 border-transparent text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-6">
          <button
            onClick={copyConversation}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
          >
            {copied ? <CheckIcon className="size-3.5 text-brand" /> : <Copy className="size-3.5" />}
            {copied ? "Copied!" : "Export"}
          </button>
        </div>
      </aside>

      {/* Scrollable document */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="px-8 py-10">

          {/* Document header */}
          <div className="mb-8 border-b border-white/[0.06] pb-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50">
              Marketing Playbook
            </p>
            <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-foreground">
              Your strategic brief
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>

          {/* Section cards */}
          <div className="space-y-4">
            {sections.map((section) => (
              <SectionCard key={section.id} section={section} />
            ))}
          </div>

          {/* Workflow cards */}
          <div className="mt-10">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50">
              Ready to execute
            </p>
            <p className="mb-5 text-sm text-muted-foreground">
              Your 3 moves. Pick one and start.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {workflowCards.map(({ id, title, description, signal, moveType }) => {
                const tier = TIER_CONFIG[moveType];
                return (
                  <div
                    key={id}
                    className={`flex flex-col rounded-xl border-l-2 px-4 py-4 ${tier.borderClass} ${tier.bgClass} border border-white/[0.06]`}
                  >
                    <span className={`self-start rounded-md px-2 py-0.5 text-[10px] font-semibold ${tier.tagBgClass} ${tier.textClass}`}>
                      {tier.label}
                    </span>
                    <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
                    <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                    {signal && (
                      <p className="mt-3 border-t border-white/[0.06] pt-3 text-[11px] leading-relaxed text-muted-foreground/60">
                        <span className="font-medium text-muted-foreground/80">Signal: </span>
                        {signal}
                      </p>
                    )}
                    <Button
                      size="sm"
                      onClick={() => goTo("dashboard")}
                      className="mt-4 w-full rounded-lg border border-brand/40 bg-transparent text-xs font-medium text-brand hover:bg-brand/10"
                    >
                      Start this →
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dashboard CTA */}
          <div className="mt-8 pb-10">
            <div className="rounded-2xl border border-brand/20 bg-brand/[0.06] px-6 py-5">
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-brand/60">
                Your game plan is set
              </p>
              <p className="mb-4 text-[15px] font-semibold text-foreground">
                Start executing your Top 3 Moves
              </p>
              <p className="mb-5 text-[13px] leading-relaxed text-muted-foreground">
                Your dashboard tracks each move, surfaces the right signal to watch, and lets you get
                tactical — draft the post, write the email, review the copy — in a focused chat.
              </p>
              <Button
                onClick={() => goTo("dashboard")}
                className="rounded-xl bg-brand px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-brand/80"
              >
                Go to your dashboard →
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
