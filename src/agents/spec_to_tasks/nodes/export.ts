import type {
  SpecToTasksStateInput,
  SpecToTasksStateUpdate,
} from "../state";
import {
  writePlanJson,
  writePlanMarkdown,
} from "../tools/work_item_io";

export const exportPlan = async (
  state: SpecToTasksStateInput
): Promise<SpecToTasksStateUpdate> => {
  if (state.tasks.length === 0) {
    return {
      notes: ["出力するタスクがないため、ファイル生成をスキップしました。"],
      decided: true,
    };
  }

  await writePlanJson(state.tasks);
  await writePlanMarkdown(state.tasks);

  return {
    notes: ["tasks/plan.json と tasks/plan.md を更新しました。"],
    decided: true,
  };
};
