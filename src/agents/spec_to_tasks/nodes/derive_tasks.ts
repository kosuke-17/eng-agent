import type {
  SpecToTasksStateInput,
  SpecToTasksStateUpdate,
  DerivedTask,
} from "../state";

const TASK_PREFIX = "TSK";

const pad = (value: number) => value.toString().padStart(3, "0");

const extractFunctionalRequirements = (content: string) =>
  Array.from(
    content.matchAll(/- (FR-\d{3}):\s*(?<title>[^-\n]*)/g)
  ).map((match) => ({
    id: match[1],
    title: match.groups?.title?.trim() ?? "",
  }));

const buildTasks = (frs: { id: string; title: string }[]): DerivedTask[] =>
  frs.map((fr, index) => ({
    id: `${TASK_PREFIX}-${pad(index + 1)}`,
    summary: fr.title
      ? `Implement requirement ${fr.id}: ${fr.title}`
      : `Implement requirement ${fr.id}`,
    type: "story",
    requirementId: fr.id,
  }));

export const deriveTasks = async (
  state: SpecToTasksStateInput
): Promise<SpecToTasksStateUpdate> => {
  const specContent = state.spec?.content;
  if (!specContent) {
    return {
      notes: ["仕様書が読み込めていないため、タスク生成をスキップしました。"],
    };
  }
  const frs = extractFunctionalRequirements(specContent);
  if (frs.length === 0) {
    return {
      notes: ["FR が見つからないため、タスクを生成できません。"],
    };
  }
  const tasks = buildTasks(frs);
  return {
    tasks,
    notes: [`${tasks.length} 件のタスクを生成しました。`],
  };
};
