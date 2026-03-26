"use client";

import { Button } from "@/components/ui/button";
import { FileText, Image, Table, X } from "lucide-react";
import type { UploadedFile } from "@/lib/types";
import { FILE_CATEGORY_LABELS } from "@/lib/constants";
import { useFiles } from "@/context/files-context";

interface FilePreviewCardProps {
  file: UploadedFile;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return Image;
  if (type === "text/csv") return Table;
  return FileText;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FilePreviewCard({ file }: FilePreviewCardProps) {
  const { removeFile } = useFiles();
  const Icon = getFileIcon(file.type);

  return (
    <div className="group flex items-center gap-4 rounded-xl border border-white/[0.06] bg-surface p-4 transition-colors hover:bg-surface-hover">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
        <Icon className="size-[18px] text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatSize(file.size)} &middot;{" "}
          {FILE_CATEGORY_LABELS[file.category]}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        className="opacity-0 transition-opacity group-hover:opacity-100"
        onClick={() => removeFile(file.id)}
        aria-label={`Remove ${file.name}`}
      >
        <X className="size-3.5 text-muted-foreground" />
      </Button>
    </div>
  );
}
