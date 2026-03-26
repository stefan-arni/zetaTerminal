"use client";

import { useFiles } from "@/context/files-context";
import { FilePreviewCard } from "@/components/files/file-preview-card";

export function FileList() {
  const { files } = useFiles();

  if (files.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/[0.08] py-16 text-center">
        <p className="text-sm text-muted-foreground">
          No assets uploaded yet. Add your brand materials so Zeta can craft
          on-brand campaigns.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {files.map((file) => (
        <FilePreviewCard key={file.id} file={file} />
      ))}
    </div>
  );
}
