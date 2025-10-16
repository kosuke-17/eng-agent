import { Annotation } from "@langchain/langgraph";
import type { SpecDoc } from "@/types";

export type WorkItemType = "epic" | "story" | "subtask";

export interface DerivedTask {
  id: string;
  summary: string;
  type: WorkItemType;
  requirementId?: string;
  estimate?: number;
  dependencies?: string[];
}

export interface SpecToTasksState {
  spec?: SpecDoc;
  tasks: DerivedTask[];
  notes: string[];
  decided: boolean;
}

const mergeTasks = (
  existing: DerivedTask[],
  updates: DerivedTask | DerivedTask[]
): DerivedTask[] => {
  const incoming = Array.isArray(updates) ? updates : [updates];
  const byId = new Map(existing.map((task) => [task.id, task]));
  for (const task of incoming) {
    const current = byId.get(task.id);
    if (current) {
      byId.set(task.id, { ...current, ...task });
    } else {
      byId.set(task.id, task);
    }
  }
  return Array.from(byId.values());
};

const mergeNotes = (existing: string[], updates: string | string[]) => {
  const incoming = Array.isArray(updates) ? updates : [updates];
  return existing.concat(incoming);
};

export const SpecToTasksStateAnnotation = Annotation.Root({
  spec: Annotation<SpecDoc | undefined>({
    reducer: (_left, right) => right,
    default: () => undefined,
  }),
  tasks: Annotation<DerivedTask[]>({
    reducer: mergeTasks,
    default: () => [],
  }),
  notes: Annotation<string[]>({
    reducer: mergeNotes,
    default: () => [],
  }),
  decided: Annotation<boolean>({
    reducer: (_left, right) => Boolean(right),
    default: () => false,
  }),
});

export type SpecToTasksStateInput = typeof SpecToTasksStateAnnotation.State;
export type SpecToTasksStateUpdate = typeof SpecToTasksStateAnnotation.Update;
