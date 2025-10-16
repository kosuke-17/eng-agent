/**
 * Knowledge Search Agent エントリーポイント
 */

import { createKnowledgeSearchGraph } from "./graph.js";
import { KnowledgeSearchStateType } from "./state.js";
import { SearchQuery, SearchResult } from "../../types/search.js";
import { DEFAULT_CONFIG } from "./config.js";
import { AgentConfig } from "../../types/agent.js";

export class KnowledgeSearchAgent {
  private graph: any;
  private config: AgentConfig;
  
  constructor(config?: Partial<AgentConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.graph = createKnowledgeSearchGraph();
  }
  
  /**
   * 検索を実行
   */
  async search(query: SearchQuery): Promise<SearchResult> {
    console.log(`\n[KnowledgeSearchAgent] Starting search for: "${query.query}"`);
    
    // 初期状態を構築
    const initialState: Partial<KnowledgeSearchStateType> = {
      query: query.query,
      searchType: query.searchType || this.config.search?.defaultSearchType || 'hybrid',
      sources: query.sources || this.config.search?.defaultSources || ['code', 'docs'],
      filters: {
        ...query.filters,
        limit: query.limit || this.config.search?.maxResults || 10,
      },
      metadata: {
        startTime: Date.now(),
        nodeExecutionOrder: [],
      },
    };
    
    try {
      // グラフを実行
      const result = await this.graph.invoke(initialState);
      
      // 結果を取得
      if (result.results) {
        console.log(`[KnowledgeSearchAgent] Search completed successfully`);
        console.log(`  - Total results: ${result.results.metadata.totalCount}`);
        console.log(`  - Returned results: ${result.results.results.length}`);
        console.log(`  - Search time: ${result.results.metadata.searchTime}ms`);
        console.log(`  - Sources: ${result.results.metadata.sources.join(', ')}`);
        
        return result.results;
      } else {
        throw new Error("No results returned from graph");
      }
    } catch (error) {
      console.error('[KnowledgeSearchAgent] Error during search:', error);
      
      // エラー時は空の結果を返す
      return {
        results: [],
        metadata: {
          totalCount: 0,
          searchTime: Date.now() - (initialState.metadata?.startTime || Date.now()),
          sources: [],
        },
        suggestions: ['An error occurred during search. Please try again.'],
      };
    }
  }
  
  /**
   * シンプルな検索（クエリ文字列のみ）
   */
  async simpleSearch(queryString: string, options?: {
    searchType?: 'keyword' | 'semantic' | 'hybrid';
    sources?: string[];
    limit?: number;
  }): Promise<SearchResult> {
    const query: SearchQuery = {
      query: queryString,
      searchType: options?.searchType || 'hybrid',
      sources: options?.sources,
      limit: options?.limit,
    };
    
    return this.search(query);
  }
  
  /**
   * 設定を取得
   */
  getConfig(): AgentConfig {
    return this.config;
  }
  
  /**
   * 設定を更新
   */
  updateConfig(config: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * デフォルトのAgentインスタンスを作成
 */
export function createKnowledgeSearchAgent(config?: Partial<AgentConfig>): KnowledgeSearchAgent {
  return new KnowledgeSearchAgent(config);
}

// 型とインターフェースをエクスポート
export { SearchQuery, SearchResult } from "../../types/search.js";
export { AgentConfig } from "../../types/agent.js";
export { KnowledgeSearchStateType } from "./state.js";
