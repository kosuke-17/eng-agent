import { AIMessage } from "@langchain/core/messages";
import type {
  RequirementsStateInput,
  RequirementsStateUpdate,
} from "../state";
import { validateSpec } from "../tools/validate";

const formatValidationSummary = (content: string): string => {
  const { valid, issues } = validateSpec(content);
  if (issues.length === 0) {
    return "バリデーション: 問題ありません。";
  }
  const lines = issues.map(
    (issue) =>
      `- ${issue.severity.toUpperCase()}: ${issue.message}${
        issue.referenceId ? ` (${issue.referenceId})` : ""
      }`
  );
  const status = valid ? "警告あり" : "エラーあり";
  return [`バリデーション結果: ${status}`, ...lines].join("\n");
};

export const mergeSpec = async (
  state: RequirementsStateInput
): Promise<RequirementsStateUpdate> => {
  if (!state.spec) {
    return {};
  }
  const validationMessage = formatValidationSummary(state.spec.content);
  const message = new AIMessage({
    content: validationMessage,
    name: "requirements_validate",
  });
  return {
    spec: state.spec,
    messages: [message],
  };
};
