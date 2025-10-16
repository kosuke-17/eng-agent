import { END, START } from "@langchain/langgraph";
import { createMemoryCheckpointer, createStateGraph } from "@/lib/graph";
import {
  SpecToTasksStateAnnotation,
  type SpecToTasksState,
  type SpecToTasksStateUpdate,
} from "./state";
import { readSpecNode } from "./nodes/read_spec";
import { deriveTasks } from "./nodes/derive_tasks";
import { estimateTasks } from "./nodes/estimate";
import { exportPlan } from "./nodes/export";

export const createSpecToTasksAgent = () => {
  const graph = createStateGraph(SpecToTasksStateAnnotation);
  graph.addNode("read_spec", readSpecNode);
  graph.addNode("derive_tasks", deriveTasks);
  graph.addNode("estimate_tasks", estimateTasks);
  graph.addNode("export_plan", exportPlan);

  graph.addEdge(START, "read_spec" as any);
  graph.addEdge("read_spec" as any, "derive_tasks" as any);
  graph.addEdge("derive_tasks" as any, "estimate_tasks" as any);
  graph.addEdge("estimate_tasks" as any, "export_plan" as any);
  graph.addEdge("export_plan" as any, END);

  return graph.compile({
    checkpointer: createMemoryCheckpointer(),
    name: "spec-to-tasks-agent",
  });
};
