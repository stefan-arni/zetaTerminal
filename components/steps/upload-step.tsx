"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Globe, Loader2, Plus, X } from "lucide-react";
import { FileUploadZone } from "@/components/files/file-upload-zone";
import { FileList } from "@/components/files/file-list";
import { useFiles } from "@/context/files-context";
import { useStepper } from "@/context/stepper-context";
import type { FileCategory } from "@/lib/types";

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

export function UploadStep() {
  const { files, addUrl } = useFiles();
  const { next } = useStepper();
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loadingUrls, setLoadingUrls] = useState<Record<string, boolean>>({});
  const [urlErrors, setUrlErrors] = useState<Record<string, string>>({});
  const [extraCompetitors, setExtraCompetitors] = useState<string[]>([]);

  const totalAssets = files.length;

  async function handleScrape(inputId: string, url: string, category: FileCategory) {
    if (!url.trim()) return;

    // Auto-prepend https if missing
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith("http")) {
      normalizedUrl = "https://" + normalizedUrl;
    }

    setLoadingUrls((p) => ({ ...p, [inputId]: true }));
    setUrlErrors((p) => ({ ...p, [inputId]: "" }));

    try {
      await addUrl(normalizedUrl, category);
      setUrls((p) => ({ ...p, [inputId]: "" }));
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
    setExtraCompetitors((p) => [
      ...p,
      `extra-${Date.now()}`,
    ]);
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
      <div className="flex-1 overflow-auto px-8 py-8">
        <div className="mx-auto max-w-[800px] space-y-10">
          {/* URLs section */}
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Globe className="size-4 text-brand" />
              <h3 className="text-sm font-semibold">Live URLs</h3>
            </div>
            <p className="mb-5 text-sm text-muted-foreground">
              We&apos;ll scrape these to understand how you&apos;re actually positioning
              yourself — and how your competitors are.
            </p>
            <div className="space-y-3">
              {allUrlInputs.map((input) => (
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
                        if (e.key === "Enter") {
                          handleScrape(input.id, urls[input.id] ?? "", input.category);
                        }
                      }}
                      placeholder={input.placeholder}
                      className="rounded-lg border-white/[0.08] bg-surface text-sm placeholder:text-muted-foreground/40"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleScrape(input.id, urls[input.id] ?? "", input.category)
                      }
                      disabled={!urls[input.id]?.trim() || loadingUrls[input.id]}
                      className="shrink-0 rounded-lg px-4"
                    >
                      {loadingUrls[input.id] ? (
                        <Loader2 className="size-3.5 animate-spin" />
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
              ))}
              <button
                onClick={addCompetitorField}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <Plus className="size-3" />
                Add another competitor
              </button>
            </div>
          </div>

          {/* File upload section */}
          <div>
            <h3 className="mb-1 text-sm font-semibold">Documents &amp; files</h3>
            <p className="mb-5 text-sm text-muted-foreground">
              Pitch deck, investor updates, GTM plans, customer conversations,
              brand assets — anything that helps us understand the real picture.
            </p>
            <FileUploadZone />
          </div>

          {/* Uploaded assets */}
          {totalAssets > 0 && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  {totalAssets} asset{totalAssets !== 1 ? "s" : ""} ingested
                </h3>
                <p className="text-xs text-muted-foreground">
                  The AI will analyze all of these before your strategy session
                </p>
              </div>
              <FileList />
            </div>
          )}

          {totalAssets === 0 && (
            <div className="rounded-xl border border-dashed border-white/[0.08] py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No assets yet. Add at least a URL or a file so Zeta can
                audit your brand — or skip ahead and describe everything
                in the strategy session.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex shrink-0 items-center justify-between border-t border-white/[0.06] px-8 py-4">
        <p className="text-xs text-muted-foreground">
          {totalAssets > 0
            ? `${totalAssets} asset${totalAssets !== 1 ? "s" : ""} ready for brand audit`
            : "You can skip this step"}
        </p>
        <Button
          onClick={next}
          className="gap-2 rounded-lg bg-brand px-5 text-sm font-medium text-white hover:bg-brand/80"
        >
          {totalAssets > 0 ? "Start brand audit" : "Skip to strategy"}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
