import { AIMessage } from "@langchain/core/messages";
import type {
  RequirementsStateInput,
  RequirementsStateUpdate,
} from "../state";
import { validateSpec } from "../tools/validate";

const hasBlockingQuestions = (state: RequirementsStateInput) =>
  state.openQuestions.some((item) => item.priority !== "L");

export const decideDone = async (
  state: RequirementsStateInput
): Promise<RequirementsStateUpdate> => {
  const specContent = state.spec?.content ?? "";
  const { valid, issues } = validateSpec(specContent);
  const blocked = hasBlockingQuestions(state);
  const done = Boolean(state.spec) && valid && !blocked;
  const reason = done
    ? "終了条件を満たしました。"
    : `継続が必要です (valid=${valid}, blockingQuestions=${blocked})。`;
  const detailLines = issues
    .filter((issue) => issue.severity === "error")
    .map((issue) => `- ${issue.message}`);
  const message = new AIMessage({
    content: [reason, ...detailLines].join("\n"),
    name: "requirements_decide_done",
  });
  return {
    decided: done,
    messages: [message],
  };
};
