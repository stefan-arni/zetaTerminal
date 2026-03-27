"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle2, FileText, Loader2, Plus, X } from "lucide-react";
import { useFiles } from "@/context/files-context";
import { useStepper } from "@/context/stepper-context";
import type { FileCategory } from "@/lib/types";

// ── Url pill ───────────────────────────────────────────────────────────────────

function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// ── Main component ─────────────────────────────────────────────────────────────

export function UploadStep() {
  const { files, addUrl, addFile, removeFile } = useFiles();
  const { next } = useStepper();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [landingUrl, setLandingUrl] = useState("");
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [extraCompetitors, setExtraCompetitors] = useState<Array<{ id: string; value: string }>>([]);
  const [loadingUrls, setLoadingUrls] = useState<Record<string, boolean>>({});
  const [urlErrors, setUrlErrors] = useState<Record<string, string>>({});

  const landingFiles = files.filter((f) => f.category === "landing-page");
  const competitorFiles = files.filter((f) => f.category === "competitor");
  const docFiles = files.filter((f) => f.category === "document");

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files;
    if (!picked) return;
    for (const file of Array.from(picked)) {
      await addFile(file);
    }
    e.target.value = "";
  }

  async function handleScrape(inputId: string, url: string, category: FileCategory) {
    if (!url.trim()) return;
    let normalized = url.trim();
    if (!normalized.startsWith("http")) normalized = "https://" + normalized;

    setLoadingUrls((p) => ({ ...p, [inputId]: true }));
    setUrlErrors((p) => ({ ...p, [inputId]: "" }));

    try {
      await addUrl(normalized, category);
      // Clear the corresponding input
      if (inputId === "landing") setLandingUrl("");
      else if (inputId === "competitor") setCompetitorUrl("");
      else setExtraCompetitors((p) => p.map((c) => (c.id === inputId ? { ...c, value: "" } : c)));
    } catch (err) {
      setUrlErrors((p) => ({
        ...p,
        [inputId]: err instanceof Error ? err.message : "Failed to fetch",
      }));
    } finally {
      setLoadingUrls((p) => ({ ...p, [inputId]: false }));
    }
  }

  function handleNext() {
    localStorage.setItem("zeta_session_count", "1");
    next();
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-8 py-10">

        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-[26px] font-semibold tracking-tight text-foreground">
            Welcome to FirstCMO. Let&apos;s get your strategy set.
          </h1>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            Give me your site and a competitor — I&apos;ll read through everything before we talk.
          </p>
        </div>

        {/* Your Context card */}
        <div className="mb-8 rounded-2xl border border-white/[0.08] bg-surface px-7 py-6">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50">
            Your Context
          </p>

          {/* Your App */}
          <div className="mb-6">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-foreground/40">
              Your App
            </p>
            {landingFiles.map((f) => (
              <div key={f.id} className="mb-2 flex items-center gap-2">
                <CheckCircle2 className="size-3.5 shrink-0 text-brand/70" />
                <span className="min-w-0 flex-1 truncate text-[13px] text-foreground/80">
                  {domainFromUrl(f.sourceUrl ?? f.name)}
                </span>
                <button
                  onClick={() => removeFile(f.id)}
                  className="shrink-0 rounded p-0.5 text-muted-foreground/30 transition-colors hover:text-muted-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                value={landingUrl}
                onChange={(e) => setLandingUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleScrape("landing", landingUrl, "landing-page");
                }}
                placeholder="https://yourapp.com"
                className="h-9 rounded-lg border-white/[0.08] bg-background text-[13px] placeholder:text-muted-foreground/30 focus-visible:ring-brand/30"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleScrape("landing", landingUrl, "landing-page")}
                disabled={!landingUrl.trim() || loadingUrls["landing"]}
                className="h-9 shrink-0 rounded-lg border-white/[0.08] px-4 text-[12px]"
              >
                {loadingUrls["landing"] ? <Loader2 className="size-3.5 animate-spin" /> : "Add →"}
              </Button>
            </div>
            {urlErrors["landing"] && (
              <p className="mt-1.5 text-[11px] text-destructive">{urlErrors["landing"]}</p>
            )}
          </div>

          {/* Competitors */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-foreground/40">
              Competitors
            </p>
            {competitorFiles.map((f) => (
              <div key={f.id} className="mb-2 flex items-center gap-2">
                <CheckCircle2 className="size-3.5 shrink-0 text-muted-foreground/50" />
                <span className="min-w-0 flex-1 truncate text-[13px] text-foreground/80">
                  {domainFromUrl(f.sourceUrl ?? f.name)}
                </span>
                <button
                  onClick={() => removeFile(f.id)}
                  className="shrink-0 rounded p-0.5 text-muted-foreground/30 transition-colors hover:text-muted-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                value={competitorUrl}
                onChange={(e) => setCompetitorUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleScrape("competitor", competitorUrl, "competitor");
                }}
                placeholder="https://competitor.com"
                className="h-9 rounded-lg border-white/[0.08] bg-background text-[13px] placeholder:text-muted-foreground/30 focus-visible:ring-brand/30"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleScrape("competitor", competitorUrl, "competitor")}
                disabled={!competitorUrl.trim() || loadingUrls["competitor"]}
                className="h-9 shrink-0 rounded-lg border-white/[0.08] px-4 text-[12px]"
              >
                {loadingUrls["competitor"] ? <Loader2 className="size-3.5 animate-spin" /> : "Add →"}
              </Button>
            </div>
            {urlErrors["competitor"] && (
              <p className="mt-1.5 text-[11px] text-destructive">{urlErrors["competitor"]}</p>
            )}

            {/* Extra competitors */}
            {extraCompetitors.map((ec, i) => (
              <div key={ec.id} className="mt-3">
                <div className="flex gap-2">
                  <Input
                    value={ec.value}
                    onChange={(e) =>
                      setExtraCompetitors((p) =>
                        p.map((c) => (c.id === ec.id ? { ...c, value: e.target.value } : c))
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleScrape(ec.id, ec.value, "competitor");
                    }}
                    placeholder={`https://competitor${i + 2}.com`}
                    className="h-9 rounded-lg border-white/[0.08] bg-background text-[13px] placeholder:text-muted-foreground/30 focus-visible:ring-brand/30"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleScrape(ec.id, ec.value, "competitor")}
                    disabled={!ec.value.trim() || loadingUrls[ec.id]}
                    className="h-9 shrink-0 rounded-lg border-white/[0.08] px-4 text-[12px]"
                  >
                    {loadingUrls[ec.id] ? <Loader2 className="size-3.5 animate-spin" /> : "Add →"}
                  </Button>
                </div>
                {urlErrors[ec.id] && (
                  <p className="mt-1.5 text-[11px] text-destructive">{urlErrors[ec.id]}</p>
                )}
              </div>
            ))}

            <button
              onClick={() =>
                setExtraCompetitors((p) => [...p, { id: `extra-${Date.now()}`, value: "" }])
              }
              className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Plus className="size-3" />
              Add another competitor
            </button>
          </div>
        </div>

        {/* Notes & Files */}
        <div className="mb-8 rounded-2xl border border-white/[0.08] bg-surface px-7 py-6">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50">
            Notes &amp; Files
          </p>
          <p className="mb-5 text-[13px] text-muted-foreground">
            Positioning doc, pitch deck notes, anything else you want me to read.
          </p>

          {docFiles.length > 0 && (
            <div className="mb-4 space-y-2">
              {docFiles.map((f) => (
                <div key={f.id} className="flex items-center gap-2">
                  <FileText className="size-3.5 shrink-0 text-muted-foreground/50" />
                  <span className="min-w-0 flex-1 truncate text-[13px] text-foreground/80">
                    {f.name}
                  </span>
                  <button
                    onClick={() => removeFile(f.id)}
                    className="shrink-0 rounded p-0.5 text-muted-foreground/30 transition-colors hover:text-muted-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.txt,.pdf"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Plus className="size-3.5" />
            Add .md, .txt, or .pdf
          </button>
        </div>

        {/* CTA */}
        <div className="flex justify-end">
          <Button
            onClick={handleNext}
            className="gap-2 rounded-xl bg-brand px-6 py-2.5 text-[13px] font-semibold text-white hover:bg-brand/80"
          >
            Start strategy session
            <ArrowRight className="size-4" />
          </Button>
        </div>

      </div>
    </div>
  );
}
