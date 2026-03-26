"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import type { CronConfig } from "@/lib/types";
import { STORAGE_KEYS } from "@/lib/constants";

type WorkflowsAction =
  | { type: "SET_WORKFLOWS"; workflows: CronConfig[] }
  | { type: "ADD_WORKFLOW"; workflow: CronConfig }
  | { type: "UPDATE_WORKFLOW"; id: string; changes: Partial<CronConfig> }
  | { type: "DELETE_WORKFLOW"; id: string }
  | { type: "TOGGLE_STATUS"; id: string };

interface WorkflowsState {
  workflows: CronConfig[];
}

interface WorkflowsContextValue extends WorkflowsState {
  addWorkflow: (workflow: CronConfig) => void;
  updateWorkflow: (id: string, changes: Partial<CronConfig>) => void;
  deleteWorkflow: (id: string) => void;
  toggleStatus: (id: string) => void;
}

const WorkflowsContext = createContext<WorkflowsContextValue | null>(null);

function workflowsReducer(
  state: WorkflowsState,
  action: WorkflowsAction
): WorkflowsState {
  switch (action.type) {
    case "SET_WORKFLOWS":
      return { workflows: action.workflows };
    case "ADD_WORKFLOW":
      return { workflows: [...state.workflows, action.workflow] };
    case "UPDATE_WORKFLOW":
      return {
        workflows: state.workflows.map((w) =>
          w.id === action.id ? { ...w, ...action.changes } : w
        ),
      };
    case "DELETE_WORKFLOW":
      return {
        workflows: state.workflows.filter((w) => w.id !== action.id),
      };
    case "TOGGLE_STATUS":
      return {
        workflows: state.workflows.map((w) =>
          w.id === action.id
            ? { ...w, status: w.status === "active" ? "paused" : "active" }
            : w
        ),
      };
  }
}

export function WorkflowsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workflowsReducer, { workflows: [] });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.workflows);
      if (stored) {
        dispatch({ type: "SET_WORKFLOWS", workflows: JSON.parse(stored) });
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.workflows,
      JSON.stringify(state.workflows)
    );
  }, [state.workflows]);

  const addWorkflow = useCallback((workflow: CronConfig) => {
    dispatch({ type: "ADD_WORKFLOW", workflow });
  }, []);

  const updateWorkflow = useCallback(
    (id: string, changes: Partial<CronConfig>) => {
      dispatch({ type: "UPDATE_WORKFLOW", id, changes });
    },
    []
  );

  const deleteWorkflow = useCallback((id: string) => {
    dispatch({ type: "DELETE_WORKFLOW", id });
  }, []);

  const toggleStatus = useCallback((id: string) => {
    dispatch({ type: "TOGGLE_STATUS", id });
  }, []);

  return (
    <WorkflowsContext.Provider
      value={{
        ...state,
        addWorkflow,
        updateWorkflow,
        deleteWorkflow,
        toggleStatus,
      }}
    >
      {children}
    </WorkflowsContext.Provider>
  );
}

export function useWorkflows() {
  const ctx = useContext(WorkflowsContext);
  if (!ctx)
    throw new Error("useWorkflows must be used within WorkflowsProvider");
  return ctx;
}
