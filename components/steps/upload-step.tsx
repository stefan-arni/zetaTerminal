"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Globe, FileText, Loader2, Plus, CheckCircle2, Zap } from "lucide-react";
import { FileUploadZone } from "@/components/files/file-upload-zone";
import { FileList } from "@/components/files/file-list";
import { useFiles } from "@/context/files-context";
import { useStepper } from "@/context/stepper-context";
import type { FileCategory, UploadedFile } from "@/lib/types";

interface UrlInput {
  id: string;
  label: string;
  placeholder: string;
  category: FileCategory;
}

const URL_INPUTS: UrlInput[] = [
  {
    id: "landing",
    label: "Your landing page",
    placeholder: "https://yourproduct.com",
    category: "landing-page",
  },
  {
    id: "competitor1",
    label: "Competitor",
    placeholder: "https://competitor.com",
    category: "competitor",
  },
];

function categoryLabel(category: UploadedFile["category"]): string {
  switch (category) {
    case "landing-page": return "your site";
    case "competitor": return "competitor";
    case "document": return "document";
    default: return category;
  }
}

// ── Zeta intro card ────────────────────────────────────────────────────────────

function ZetaIntro({ sessionCount }: { sessionCount: number }) {
  const isReturning = sessionCount > 0;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-surface px-7 py-6">
      <p className="text-sm font-semibold text-foreground">
        {isReturning
          ? "Good to see you back."
          : "Before we talk, I do my homework."}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {isReturning
          ? "Drop any updates — new pages, new docs, anything that's changed since last time. I'll read through it before your next session so we can pick up where we left off."
          : "Give me your site URL and a competitor or two. I'll read through everything before we sit down — so I walk in knowing your positioning, not asking about it. The more honest context you give me, the more specific I can be."}
      </p>
      {!isReturning && (
        <p className="mt-3 text-xs text-muted-foreground/60">
          No site yet? Skip ahead — you can describe everything in the session.
        </p>
      )}
    </div>
  );
}

// ── Zeta's read list ───────────────────────────────────────────────────────────

function ZetaReadList({ files }: { files: UploadedFile[] }) {
  const landing = files.filter((f) => f.category === "landing-page");
  const competitors = files.filter((f) => f.category === "competitor");
  const docs = files.filter((f) => f.category === "document");

  return (
    <div className="rounded-2xl border border-brand/20 bg-brand/[0.03] px-7 py-6">
      <div className="mb-4 flex items-center gap-2">
        <Zap className="size-3.5 text-muted-foreground/70" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
          What I&apos;ve read
        </p>
      </div>

      <div className="space-y-2">
        {landing.map((f) => (
          <div key={f.id} className="flex items-center gap-2.5">
            <CheckCircle2 className="size-3.5 shrink-0 text-brand" />
            <span className="text-sm text-foreground/80 truncate">
              {f.sourceUrl ?? f.name}
            </span>
            <span className="ml-auto shrink-0 text-xs text-muted-foreground">your site</span>
          </div>
        ))}
        {competitors.map((f) => (
          <div key={f.id} className="flex items-center gap-2.5">
            <CheckCircle2 className="size-3.5 shrink-0 text-brand/60" />
            <span className="text-sm text-foreground/80 truncate">
              {f.sourceUrl ?? f.name}
            </span>
            <span className="ml-auto shrink-0 text-xs text-muted-foreground">competitor</span>
          </div>
        ))}
        {docs.map((f) => (
          <div key={f.id} className="flex items-center gap-2.5">
            <CheckCircle2 className="size-3.5 shrink-0 text-brand/60" />
            <span className="text-sm text-foreground/80 truncate">{f.name}</span>
            <span className="ml-auto shrink-0 text-xs text-muted-foreground">document</span>
          </div>
        ))}
      </div>

      <p className="mt-5 text-sm text-muted-foreground">
        {landing.length > 0
          ? `I've read through your site${competitors.length > 0 ? " and " + competitors.length + " competitor" + (competitors.length > 1 ? "s" : "") : ""}${docs.length > 0 ? " plus " + docs.length + " doc" + (docs.length > 1 ? "s" : "") : ""}. I'll have observations ready.`
          : `${files.length} file${files.length > 1 ? "s" : ""} ingested. I'll have this read before we talk.`}
      </p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function UploadStep() {
  const { files, addUrl } = useFiles();
  const { next } = useStepper();
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loadingUrls, setLoadingUrls] = useState<Record<string, boolean>>({});
  const [urlErrors, setUrlErrors] = useState<Record<string, string>>({});
  const [scrapedIds, setScrapedIds] = useState<string[]>([]);
  const [extraCompetitors, setExtraCompetitors] = useState<string[]>([]);
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    const count = parseInt(localStorage.getItem("zeta_session_count") ?? "0", 10);
    setSessionCount(count);
  }, []);

  const totalAssets = files.length;

  async function handleScrape(inputId: string, url: string, category: FileCategory) {
    if (!url.trim()) return;
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith("http")) normalizedUrl = "https://" + normalizedUrl;

    setLoadingUrls((p) => ({ ...p, [inputId]: true }));
    setUrlErrors((p) => ({ ...p, [inputId]: "" }));

    try {
      await addUrl(normalizedUrl, category);
      setUrls((p) => ({ ...p, [inputId]: "" }));
      setScrapedIds((p) => [...p, inputId]);
    } catch (err) {
      setUrlErrors((p) => ({
        ...p,
        [inputId]: err instanceof Error ? err.message : "Failed to fetch",
      }));
    } finally {
      setLoadingUrls((p) => ({ ...p, [inputId]: false }));
    }
  }

  function addCompetitorField() {
    setExtraCompetitors((p) => [...p, `extra-${Date.now()}`]);
  }

  function handleNext() {
    // Increment session count when starting a session
    const current = parseInt(localStorage.getItem("zeta_session_count") ?? "0", 10);
    localStorage.setItem("zeta_session_count", String(current + 1));
    next();
  }

  const allUrlInputs: UrlInput[] = [
    ...URL_INPUTS,
    ...extraCompetitors.map((id, i) => ({
      id,
      label: `Competitor ${i + 2}`,
      placeholder: "https://anothercompetitor.com",
      category: "competitor" as FileCategory,
    })),
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto px-8 py-10">
        <div className="mx-auto max-w-3xl space-y-4">

          {/* Zeta intro */}
          <ZetaIntro sessionCount={sessionCount} />

          {/* Live URLs card */}
          <div className="rounded-2xl border border-white/[0.08] bg-surface px-7 py-6">
            <div className="mb-1 flex items-center gap-2">
              <Globe className="size-3.5 text-muted-foreground/70" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
                Live URLs
              </p>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              Your site and competitors. I&apos;ll read these before we talk.
            </p>
            <div className="space-y-4">
              {allUrlInputs.map((input) => {
                const isScraped = scrapedIds.includes(input.id);
                return (
                  <div key={input.id}>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      {input.label}
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={urls[input.id] ?? ""}
                        onChange={(e) =>
                          setUrls((p) => ({ ...p, [input.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            handleScrape(input.id, urls[input.id] ?? "", input.category);
                        }}
                        placeholder={input.placeholder}
                        className="h-11 rounded-lg border-white/[0.08] bg-background text-sm placeholder:text-muted-foreground/40 focus-visible:ring-brand/30"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleScrape(input.id, urls[input.id] ?? "", input.category)
                        }
                        disabled={!urls[input.id]?.trim() || loadingUrls[input.id]}
                        className="h-11 shrink-0 rounded-lg border-white/[0.08] px-4 text-sm"
                      >
                        {loadingUrls[input.id] ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : isScraped && !urls[input.id]?.trim() ? (
                          <span className="flex items-center gap-1.5 text-brand">
                            <CheckCircle2 className="size-3.5" />
                            Read
                          </span>
                        ) : (
                          "Scrape"
                        )}
                      </Button>
                    </div>
                    {urlErrors[input.id] && (
                      <p className="mt-1.5 text-xs text-destructive">
                        {urlErrors[input.id]}
                      </p>
                    )}
                  </div>
                );
              })}
              <button
                onClick={addCompetitorField}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <Plus className="size-3" />
                Add another competitor
              </button>
            </div>
          </div>

          {/* Documents card */}
          <div className="rounded-2xl border border-white/[0.08] bg-surface px-7 py-6">
            <div className="mb-1 flex items-center gap-2">
              <FileText className="size-3.5 text-muted-foreground/70" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
                Documents &amp; Files
              </p>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              Pitch deck, GTM plans, customer conversations — anything that shows the real picture.
            </p>
            <FileUploadZone />
          </div>

          {/* Zeta's read list — replaces generic "assets ingested" */}
          {totalAssets > 0 && <ZetaReadList files={files} />}

          {/* Empty state */}
          {totalAssets === 0 && (
            <div className="rounded-2xl border border-dashed border-white/[0.06] py-10 text-center">
              <p className="text-sm text-muted-foreground/50">
                Nothing added yet — that&apos;s fine. You can describe everything in the session.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex shrink-0 items-center justify-between border-t border-white/[0.06] px-8 py-4">
        <p className="text-xs text-muted-foreground">
          {totalAssets > 0
            ? `${totalAssets} asset${totalAssets !== 1 ? "s" : ""} ready`
            : "You can skip this step"}
        </p>
        <Button
          onClick={handleNext}
          className="gap-2 rounded-lg bg-brand px-5 text-sm font-medium text-white hover:bg-brand/80"
        >
          {totalAssets > 0
            ? sessionCount > 0 ? "Start next session" : "Start strategy session"
            : "Start session"}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
