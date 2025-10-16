/**
 * 検索戦略決定ノード
 */

import { KnowledgeSearchStateType } from "../state.js";
import { SearchStrategy, SearchSource } from "../../../types/search.js";

/**
 * 検索戦略を決定する
 */
export async function searchStrategyNode(
  state: KnowledgeSearchStateType
): Promise<Partial<KnowledgeSearchStateType>> {
  const { processedQuery, searchType, sources, metadata } = state;
  
  if (!processedQuery) {
    return {
      errors: [new Error("Processed query is missing")],
      metadata: {
        ...metadata,
        nodeExecutionOrder: [...(metadata.nodeExecutionOrder || []), 'search_strategy'],
      },
    };
  }
  
  console.log(`[SearchStrategy] Determining strategy for type: ${searchType}`);
  
  try {
    let strategy: SearchStrategy;
    
    // 検索タイプに基づいて戦略を決定
    if (searchType === 'hybrid') {
      strategy = {
        methods: ['keyword', 'semantic'],
        weights: {
          keyword: 0.3,
          semantic: 0.7,
          hybrid: 0.0,
        },
        sources: determineSearchSources(processedQuery.type, sources),
        parallelExecution: true,
      };
    } else if (searchType === 'semantic') {
      strategy = {
        methods: ['semantic'],
        weights: {
          keyword: 0.0,
          semantic: 1.0,
          hybrid: 0.0,
        },
        sources: determineSearchSources(processedQuery.type, sources),
        parallelExecution: false,
      };
    } else {
      // keyword
      strategy = {
        methods: ['keyword'],
        weights: {
          keyword: 1.0,
          semantic: 0.0,
          hybrid: 0.0,
        },
        sources: determineSearchSources(processedQuery.type, sources),
        parallelExecution: false,
      };
    }
    
    console.log(`[SearchStrategy] Strategy determined: methods=${strategy.methods.join(',')}, sources=${strategy.sources.join(',')}`);
    
    return {
      searchStrategy: strategy,
      metadata: {
        ...metadata,
        nodeExecutionOrder: [...(metadata.nodeExecutionOrder || []), 'search_strategy'],
      },
    };
  } catch (error) {
    console.error('[SearchStrategy] Error:', error);
    return {
      errors: [error as Error],
      metadata: {
        ...metadata,
        nodeExecutionOrder: [...(metadata.nodeExecutionOrder || []), 'search_strategy'],
      },
    };
  }
}

/**
 * クエリタイプに基づいて検索ソースを決定
 */
function determineSearchSources(
  queryType: 'code' | 'documentation' | 'general',
  requestedSources: string[]
): SearchSource[] {
  const availableSources: SearchSource[] = ['code', 'docs', 'knowledge-base'];
  
  // リクエストされたソースがある場合はそれを使用
  if (requestedSources && requestedSources.length > 0) {
    return requestedSources.filter(s => 
      availableSources.includes(s as SearchSource)
    ) as SearchSource[];
  }
  
  // クエリタイプに基づいてデフォルトのソースを選択
  switch (queryType) {
    case 'code':
      return ['code', 'docs'];
    case 'documentation':
      return ['docs', 'knowledge-base'];
    case 'general':
      return ['code', 'docs', 'knowledge-base'];
    default:
      return ['docs'];
  }
}
