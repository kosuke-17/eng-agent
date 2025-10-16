/**
 * Agent関連の型定義
 */

import { SearchQuery, SearchResult, ProcessedQuery, SearchStrategy, RawSearchResult } from './search.js';

/**
 * Knowledge Search Agent の状態
 */
export interface KnowledgeSearchAgentState {
  // 入力
  query: string;
  searchType: 'keyword' | 'semantic' | 'hybrid';
  sources: string[];
  filters: any;
  
  // 中間状態
  processedQuery?: ProcessedQuery;
  searchStrategy?: SearchStrategy;
  rawResults?: RawSearchResult[];
  
  // 出力
  results?: SearchResult;
  
  // メタデータ
  metadata: Record<string, any>;
  errors?: Error[];
}

/**
 * Agent設定
 */
export interface AgentConfig {
  name: string;
  version: string;
  description: string;
  
  // LLM設定
  llm?: {
    modelName: string;
    temperature: number;
    maxTokens?: number;
  };
  
  // 検索設定
  search?: {
    defaultSources: string[];
    defaultSearchType: 'keyword' | 'semantic' | 'hybrid';
    maxResults: number;
    enableCache: boolean;
  };
  
  // ベクトルストア設定
  vectorStore?: {
    provider: 'chroma' | 'pinecone' | 'qdrant';
    collectionName: string;
    embeddingModel: string;
  };
  
  // その他
  debug?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Retriever基底インターフェース
 */
export interface IRetriever {
  search(
    query: ProcessedQuery,
    strategy: SearchStrategy,
    filters?: any
  ): Promise<RawSearchResult[]>;
  
  getName(): string;
  getSource(): string;
}

/**
 * ツール実行結果
 */
export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime?: number;
}

/**
 * ノード実行結果
 */
export interface NodeResult {
  success: boolean;
  updates: Partial<KnowledgeSearchAgentState>;
  nextNode?: string;
  error?: Error;
}
