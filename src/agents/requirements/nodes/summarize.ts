import { AIMessage } from "@langchain/core/messages";
import type {
  RequirementsStateInput,
  RequirementsStateUpdate,
} from "../state";
import { readSpec } from "../tools/file_io";

const countMatches = (content: string, pattern: RegExp) =>
  Array.from(content.matchAll(pattern)).length;

const buildSummary = (content: string): string => {
  const frCount = countMatches(content, /\bFR-\d{3}\b/g);
  const acCount = countMatches(content, /\bAC-\d{3}\b/g);
  const nfrCount = countMatches(content, /\bNFR-\d{3}\b/g);
  const unresolvedQuestions = countMatches(
    content,
    /\|\s*OQ-\d{3}\s*\|/g
  );
  return [
    `現行仕様の集計: FR=${frCount}, AC=${acCount}, NFR=${nfrCount}, OpenQuestions=${unresolvedQuestions}`,
    "不足やプレースホルダーは後続ノードで補完・質問化します。",
  ].join("\n");
};

export const summarize = async (
  _state: RequirementsStateInput
): Promise<RequirementsStateUpdate> => {
  const spec = await readSpec();
  const summary = buildSummary(spec.content);
  const message = new AIMessage({
    content: summary,
    name: "requirements_summarize",
  });
  return {
    spec,
    messages: [message],
  };
};
