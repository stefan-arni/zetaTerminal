"use client";

import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  type ReactNode,
} from "react";
import type { ChatMessage } from "@/lib/types";

type WorkflowChatAction =
  | { type: "ADD_MESSAGE"; message: ChatMessage }
  | { type: "UPDATE_LAST_ASSISTANT"; content: string }
  | { type: "SET_STREAMING"; streaming: boolean }
  | { type: "CLEAR" };

interface WorkflowChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
}

interface WorkflowChatContextValue extends WorkflowChatState {
  addMessage: (message: ChatMessage) => void;
  updateLastAssistant: (content: string) => void;
  setStreaming: (streaming: boolean) => void;
  clear: () => void;
}

const WorkflowChatContext = createContext<WorkflowChatContextValue | null>(null);

function reducer(state: WorkflowChatState, action: WorkflowChatAction): WorkflowChatState {
  switch (action.type) {
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.message] };
    case "UPDATE_LAST_ASSISTANT": {
      const msgs = [...state.messages];
      const lastIdx = msgs.findLastIndex((m) => m.role === "assistant");
      if (lastIdx >= 0) {
        msgs[lastIdx] = { ...msgs[lastIdx], content: action.content };
      }
      return { ...state, messages: msgs };
    }
    case "SET_STREAMING":
      return { ...state, isStreaming: action.streaming };
    case "CLEAR":
      return { messages: [], isStreaming: false };
  }
}

export function WorkflowChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { messages: [], isStreaming: false });

  const addMessage = useCallback((message: ChatMessage) => {
    dispatch({ type: "ADD_MESSAGE", message });
  }, []);

  const updateLastAssistant = useCallback((content: string) => {
    dispatch({ type: "UPDATE_LAST_ASSISTANT", content });
  }, []);

  const setStreaming = useCallback((streaming: boolean) => {
    dispatch({ type: "SET_STREAMING", streaming });
  }, []);

  const clear = useCallback(() => {
    dispatch({ type: "CLEAR" });
  }, []);

  return (
    <WorkflowChatContext.Provider value={{ ...state, addMessage, updateLastAssistant, setStreaming, clear }}>
      {children}
    </WorkflowChatContext.Provider>
  );
}

export function useWorkflowChat() {
  const ctx = useContext(WorkflowChatContext);
  if (!ctx) throw new Error("useWorkflowChat must be used within WorkflowChatProvider");
  return ctx;
}
