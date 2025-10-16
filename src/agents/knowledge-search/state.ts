/**
 * Knowledge Search Agent の状態定義
 */

import { Annotation } from "@langchain/langgraph";
import {
  ProcessedQuery,
  SearchStrategy,
  RawSearchResult,
  SearchResult,
  SearchFilters,
} from "../../types/search.js";

/**
 * Knowledge Search Agent State
 */
export const KnowledgeSearchState = Annotation.Root({
  // 入力
  query: Annotation<string>({
    reducer: (prev, next) => next ?? prev,
    default: () => "",
  }),
  
  searchType: Annotation<'keyword' | 'semantic' | 'hybrid'>({
    reducer: (prev, next) => next ?? prev,
    default: () => 'hybrid',
  }),
  
  sources: Annotation<string[]>({
    reducer: (prev, next) => next ?? prev,
    default: () => ['code', 'docs', 'knowledge-base'],
  }),
  
  filters: Annotation<SearchFilters>({
    reducer: (prev, next) => next ?? prev,
    default: () => ({}),
  }),
  
  // 中間状態
  processedQuery: Annotation<ProcessedQuery | undefined>({
    reducer: (prev, next) => next ?? prev,
    default: () => undefined,
  }),
  
  searchStrategy: Annotation<SearchStrategy | undefined>({
    reducer: (prev, next) => next ?? prev,
    default: () => undefined,
  }),
  
  rawResults: Annotation<RawSearchResult[]>({
    reducer: (prev, next) => next ?? prev,
    default: () => [],
  }),
  
  // 出力
  results: Annotation<SearchResult | undefined>({
    reducer: (prev, next) => next ?? prev,
    default: () => undefined,
  }),
  
  // メタデータ
  metadata: Annotation<Record<string, any>>({
    reducer: (prev, next) => ({ ...prev, ...next }),
    default: () => ({
      startTime: Date.now(),
      nodeExecutionOrder: [] as string[],
    }),
  }),
  
  errors: Annotation<Error[]>({
    reducer: (prev, next) => [...(prev ?? []), ...(next ?? [])],
    default: () => [],
  }),
});

export type KnowledgeSearchStateType = typeof KnowledgeSearchState.State;
