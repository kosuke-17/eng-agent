import type {
  SpecToTasksStateInput,
  SpecToTasksStateUpdate,
  DerivedTask,
} from "../state";

const defaultEstimateForType = (taskType: DerivedTask["type"]) => {
  switch (taskType) {
    case "epic":
      return 13;
    case "story":
      return 5;
    case "subtask":
    default:
      return 2;
  }
};

const estimateTask = (task: DerivedTask): DerivedTask => {
  if (typeof task.estimate === "number") {
    return task;
  }
  return {
    ...task,
    estimate: defaultEstimateForType(task.type),
  };
};

export const estimateTasks = async (
  state: SpecToTasksStateInput
): Promise<SpecToTasksStateUpdate> => {
  if (state.tasks.length === 0) {
    return {
      notes: ["見積もるタスクが存在しません。"],
    };
  }
  const tasks = state.tasks.map(estimateTask);
  return {
    tasks,
    notes: ["未見積タスクにデフォルト見積を設定しました。"],
  };
};
