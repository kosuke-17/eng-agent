import { Annotation } from "@langchain/langgraph";
import type { BaseMessage } from "@langchain/core/messages";
import type { OpenQuestion, SpecDoc } from "@/types";

export interface RequirementsState {
  messages: BaseMessage[];
  spec?: SpecDoc;
  openQuestions: OpenQuestion[];
  decided: boolean;
}

const mergeMessages = (
  left: BaseMessage[],
  right: BaseMessage | BaseMessage[]
): BaseMessage[] => {
  if (Array.isArray(right)) {
    return left.concat(right);
  }
  return left.concat([right]);
};

const mergeOpenQuestions = (
  existing: OpenQuestion[],
  incoming: OpenQuestion | OpenQuestion[]
): OpenQuestion[] => {
  const updates = Array.isArray(incoming) ? incoming : [incoming];
  const byId = new Map(existing.map((item) => [item.id, item]));
  for (const update of updates) {
    const current = byId.get(update.id);
    if (!current) {
      byId.set(update.id, update);
      continue;
    }
    byId.set(update.id, { ...current, ...update });
  }
  return Array.from(byId.values());
};

export const RequirementsStateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: mergeMessages,
    default: () => [],
  }),
  spec: Annotation<SpecDoc | undefined>({
    reducer: (_left, right) => right,
    default: () => undefined,
  }),
  openQuestions: Annotation<OpenQuestion[]>({
    reducer: mergeOpenQuestions,
    default: () => [],
  }),
  decided: Annotation<boolean>({
    reducer: (_left, right) => Boolean(right),
    default: () => false,
  }),
});

export type RequirementsStateInput = typeof RequirementsStateAnnotation.State;
export type RequirementsStateUpdate = typeof RequirementsStateAnnotation.Update;
