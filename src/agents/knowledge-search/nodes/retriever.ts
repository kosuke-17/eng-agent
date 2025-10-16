/**
 * 検索実行ノード
 */

import { KnowledgeSearchStateType } from "../state.js";
import { RawSearchResult } from "../../../types/search.js";
import { CodeRetriever } from "../../../retrievers/code-retriever.js";
import { DocumentRetriever } from "../../../retrievers/document-retriever.js";
import { VectorRetriever } from "../../../retrievers/vector-retriever.js";
import { IRetriever } from "../../../types/agent.js";

/**
 * 検索を実行する
 */
export async function retrieverNode(
  state: KnowledgeSearchStateType
): Promise<Partial<KnowledgeSearchStateType>> {
  const { processedQuery, searchStrategy, filters, metadata } = state;
  
  if (!processedQuery || !searchStrategy) {
    return {
      errors: [new Error("Processed query or search strategy is missing")],
      metadata: {
        ...metadata,
        nodeExecutionOrder: [...(metadata.nodeExecutionOrder || []), 'retriever'],
      },
    };
  }
  
  console.log(`[Retriever] Executing search across sources: ${searchStrategy.sources.join(', ')}`);
  
  try {
    const rawResults: RawSearchResult[] = [];
    
    // 各ソースから検索
    const retrievers = getRetrievers(searchStrategy.sources);
    
    if (searchStrategy.parallelExecution) {
      // 並列実行
      const promises = retrievers.map(retriever =>
        retriever.search(processedQuery, searchStrategy, filters)
          .catch(error => {
            console.error(`[Retriever] Error in ${retriever.getName()}:`, error);
            return [];
          })
      );
      
      const results = await Promise.all(promises);
      rawResults.push(...results.flat());
    } else {
      // 順次実行
      for (const retriever of retrievers) {
        try {
          const results = await retriever.search(processedQuery, searchStrategy, filters);
          rawResults.push(...results);
        } catch (error) {
          console.error(`[Retriever] Error in ${retriever.getName()}:`, error);
        }
      }
    }
    
    console.log(`[Retriever] Retrieved ${rawResults.length} raw results`);
    
    return {
      rawResults,
      metadata: {
        ...metadata,
        nodeExecutionOrder: [...(metadata.nodeExecutionOrder || []), 'retriever'],
        rawResultCount: rawResults.length,
      },
    };
  } catch (error) {
    console.error('[Retriever] Error:', error);
    return {
      errors: [error as Error],
      rawResults: [],
      metadata: {
        ...metadata,
        nodeExecutionOrder: [...(metadata.nodeExecutionOrder || []), 'retriever'],
      },
    };
  }
}

/**
 * ソースに基づいてRetrieverを取得
 */
function getRetrievers(sources: string[]): IRetriever[] {
  const retrievers: IRetriever[] = [];
  
  for (const source of sources) {
    switch (source) {
      case 'code':
        retrievers.push(new CodeRetriever('./src'));
        break;
      case 'docs':
        retrievers.push(new DocumentRetriever('./docs'));
        break;
      case 'knowledge-base':
        retrievers.push(new VectorRetriever('knowledge-base'));
        break;
      default:
        console.warn(`[Retriever] Unknown source: ${source}`);
    }
  }
  
  return retrievers;
}
