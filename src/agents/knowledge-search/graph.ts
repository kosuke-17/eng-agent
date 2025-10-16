/**
 * Knowledge Search Agent のLangGraphグラフ定義
 */

import { StateGraph, END } from "@langchain/langgraph";
import { KnowledgeSearchState } from "./state.js";
import { queryProcessorNode } from "./nodes/query-processor.js";
import { searchStrategyNode } from "./nodes/search-strategy.js";
import { retrieverNode } from "./nodes/retriever.js";
import { postProcessorNode } from "./nodes/post-processor.js";
import { formatterNode } from "./nodes/formatter.js";

/**
 * Knowledge Search Agent のグラフを作成
 */
export function createKnowledgeSearchGraph() {
  const workflow = new StateGraph(KnowledgeSearchState)
    // ノードの追加
    .addNode("query_processor", queryProcessorNode)
    .addNode("search_strategy", searchStrategyNode)
    .addNode("retriever", retrieverNode)
    .addNode("post_processor", postProcessorNode)
    .addNode("formatter", formatterNode)
    
    // エッジの定義（実行フロー）
    .addEdge("__start__", "query_processor")
    .addEdge("query_processor", "search_strategy")
    .addEdge("search_strategy", "retriever")
    .addEdge("retriever", "post_processor")
    .addEdge("post_processor", "formatter")
    .addEdge("formatter", END);
  
  return workflow.compile();
}
