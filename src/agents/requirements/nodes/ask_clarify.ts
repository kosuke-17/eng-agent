import type {
  RequirementsStateInput,
  RequirementsStateUpdate,
} from "../state";
import type { OpenQuestion } from "@/types";

const MAX_QUESTIONS = 5;

const pad = (value: number) => value.toString().padStart(3, "0");

const extractPlaceholders = (specContent: string): string[] => {
  const matches = Array.from(
    specContent.matchAll(/^(?<key>[A-Za-z_]+):\s*<(?<placeholder>[^>]+)>/gm)
  );
  return matches.map(
    (match) =>
      `\`${match.groups?.key}\` の値 (<${match.groups?.placeholder}>) を確定してください。`
  );
};

const extractEmptyBullets = (specContent: string): string[] => {
  const matches = Array.from(
    specContent.matchAll(/^- (?<label>[^:\n]+):\s*$/gm)
  );
  return matches.map(
    (match) => `「${match.groups?.label}」の項目が空です。具体的な内容を教えてください。`
  );
};

const extractEmptyTables = (specContent: string): string[] => {
  const openQuestionSection = specContent.split(
    "# 9. オープンクエスチョン（未解決項目）"
  )[1];
  if (!openQuestionSection) return [];
  const hasDataRow = /\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|/.test(
    openQuestionSection
  );
  if (hasDataRow) return [];
  return [
    "オープンクエスチョン表に未記入です。優先して解消すべき質問を登録してください。",
  ];
};

const buildQuestionObjects = (
  baseId: number,
  questions: string[]
): OpenQuestion[] =>
  questions.map((text, index) => ({
    id: `OQ-${pad(baseId + index + 1)}`,
    text,
    priority: index === 0 ? "H" : "M",
  }));

export const askClarify = async (
  state: RequirementsStateInput
): Promise<RequirementsStateUpdate> => {
  const specContent = state.spec?.content;
  if (!specContent) {
    return { openQuestions: [] };
  }

  const candidates = [
    ...extractPlaceholders(specContent),
    ...extractEmptyBullets(specContent),
    ...extractEmptyTables(specContent),
  ].slice(0, MAX_QUESTIONS);

  if (candidates.length === 0) {
    return { openQuestions: [] };
  }

  const nextIndex = state.openQuestions.length;
  const openQuestions = buildQuestionObjects(nextIndex, candidates);

  return { openQuestions };
};
