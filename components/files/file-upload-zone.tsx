"use client";

import { useCallback, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFiles } from "@/context/files-context";
import { MAX_FILE_SIZE } from "@/lib/constants";

export function FileUploadZone() {
  const { addFile } = useFiles();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (fileList: FileList) => {
      setError(null);
      for (const file of Array.from(fileList)) {
        if (file.size > MAX_FILE_SIZE) {
          setError(`${file.name} exceeds 10MB limit`);
          continue;
        }
        try {
          await addFile(file);
        } catch {
          setError(`Failed to read ${file.name}`);
        }
      }
    },
    [addFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 transition-all",
          isDragging
            ? "border-brand/40 bg-brand/[0.04]"
            : "border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.02]"
        )}
      >
        <div className="flex size-12 items-center justify-center rounded-xl bg-white/[0.05] transition-colors group-hover:bg-brand/10">
          <Upload className="size-5 text-muted-foreground transition-colors group-hover:text-brand" />
        </div>
        <p className="mt-4 text-sm font-medium">
          Drop files here or click to browse
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Brand guidelines, creative briefs, audience data, competitor research
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {error && (
        <p className="mt-3 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
