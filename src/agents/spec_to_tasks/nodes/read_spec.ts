import { readSpec } from "@/agents/requirements/tools/file_io";
import type {
  SpecToTasksStateInput,
  SpecToTasksStateUpdate,
} from "../state";

export const readSpecNode = async (
  _state: SpecToTasksStateInput
): Promise<SpecToTasksStateUpdate> => {
  const spec = await readSpec();
  return { spec };
};
