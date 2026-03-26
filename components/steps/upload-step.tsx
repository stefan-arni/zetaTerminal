"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { FileUploadZone } from "@/components/files/file-upload-zone";
import { FileList } from "@/components/files/file-list";
import { useFiles } from "@/context/files-context";
import { useStepper } from "@/context/stepper-context";

export function UploadStep() {
  const { files } = useFiles();
  const { next } = useStepper();

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto px-8 py-8">
        <div className="mx-auto max-w-[800px] space-y-8">
          <FileUploadZone />

          {files.length > 0 && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-medium">
                  {files.length} file{files.length !== 1 ? "s" : ""} uploaded
                </p>
                <p className="text-xs text-muted-foreground">
                  These will be used to inform your strategy session
                </p>
              </div>
              <FileList />
            </div>
          )}

          {files.length === 0 && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Upload at least one file to give Zeta context, or skip ahead
                and describe your business in the strategy session.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex shrink-0 items-center justify-between border-t border-white/[0.06] px-8 py-4">
        <p className="text-xs text-muted-foreground">
          {files.length > 0
            ? `${files.length} file${files.length !== 1 ? "s" : ""} ready for analysis`
            : "You can skip this step"}
        </p>
        <Button
          onClick={next}
          className="gap-2 rounded-lg bg-brand px-5 text-sm font-medium text-white hover:bg-brand/80"
        >
          {files.length > 0 ? "Continue to strategy" : "Skip to strategy"}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
