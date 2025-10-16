import { END, START } from "@langchain/langgraph";
import { createMemoryCheckpointer, createStateGraph } from "@/lib/graph";
import {
  RequirementsStateAnnotation,
  type RequirementsState,
  type RequirementsStateUpdate,
} from "./state";
import { summarize } from "./nodes/summarize";
import { askClarify } from "./nodes/ask_clarify";
import { mergeSpec } from "./nodes/merge_spec";
import { decideDone } from "./nodes/decide_done";

export const createRequirementsAgent = () => {
  const graph = createStateGraph(RequirementsStateAnnotation);
  graph.addNode("summarize", summarize);
  graph.addNode("ask_clarify", askClarify);
  graph.addNode("merge_spec", mergeSpec);
  graph.addNode("decide_done", decideDone);

  graph.addEdge(START, "summarize" as any);
  graph.addEdge("summarize" as any, "ask_clarify" as any);
  graph.addEdge("ask_clarify" as any, "merge_spec" as any);
  graph.addEdge("merge_spec" as any, "decide_done" as any);
  graph.addConditionalEdges("decide_done" as any, (state: RequirementsState) =>
    state.decided ? END : ("ask_clarify" as any)
  );

  return graph.compile({
    checkpointer: createMemoryCheckpointer(),
    name: "requirements-agent",
  });
};
