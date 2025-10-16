import { StateGraph, type AnnotationRoot } from "@langchain/langgraph";
import { MemorySaver } from "@langchain/langgraph-checkpoint";

/**
 * Helper to instantiate a StateGraph from a predefined annotation.
 */
export const createStateGraph = <SD extends AnnotationRoot<any>>(annotation: SD) =>
  new StateGraph(annotation);

/**
 * Memory-based checkpointer. Suitable for local development.
 */
export const createMemoryCheckpointer = () => new MemorySaver();
