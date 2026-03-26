"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import type { FileCategory, UploadedFile } from "@/lib/types";
import { STORAGE_KEYS } from "@/lib/constants";

type FilesAction =
  | { type: "SET_FILES"; files: UploadedFile[] }
  | { type: "ADD_FILE"; file: UploadedFile }
  | { type: "REMOVE_FILE"; id: string };

interface FilesState {
  files: UploadedFile[];
}

interface FilesContextValue extends FilesState {
  addFile: (file: File) => Promise<void>;
  removeFile: (id: string) => void;
}

const FilesContext = createContext<FilesContextValue | null>(null);

function filesReducer(state: FilesState, action: FilesAction): FilesState {
  switch (action.type) {
    case "SET_FILES":
      return { files: action.files };
    case "ADD_FILE":
      return { files: [...state.files, action.file] };
    case "REMOVE_FILE":
      return { files: state.files.filter((f) => f.id !== action.id) };
  }
}

function inferCategory(file: File): FileCategory {
  if (file.type.startsWith("image/")) return "design";
  if (file.type === "text/csv" || file.type === "application/json") return "data";
  if (
    file.name.includes("brand") ||
    file.name.includes("logo") ||
    file.name.includes("style")
  )
    return "brand";
  return "document";
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    if (file.type.startsWith("image/")) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  });
}

export function FilesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(filesReducer, { files: [] });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.files);
      if (stored) {
        dispatch({ type: "SET_FILES", files: JSON.parse(stored) });
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.files, JSON.stringify(state.files));
  }, [state.files]);

  const addFile = useCallback(async (file: File) => {
    const content = await readFileAsText(file);
    const uploaded: UploadedFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: file.name,
      type: file.type,
      size: file.size,
      content,
      uploadedAt: new Date().toISOString(),
      category: inferCategory(file),
    };
    dispatch({ type: "ADD_FILE", file: uploaded });
  }, []);

  const removeFile = useCallback((id: string) => {
    dispatch({ type: "REMOVE_FILE", id });
  }, []);

  return (
    <FilesContext.Provider value={{ ...state, addFile, removeFile }}>
      {children}
    </FilesContext.Provider>
  );
}

export function useFiles() {
  const ctx = useContext(FilesContext);
  if (!ctx) throw new Error("useFiles must be used within FilesProvider");
  return ctx;
}
