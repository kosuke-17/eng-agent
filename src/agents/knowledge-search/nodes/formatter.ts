/**
 * 結果整形ノード
 */

import { KnowledgeSearchStateType } from "../state.js";
import { SearchResult, SearchItem } from "../../../types/search.js";

/**
 * 検索結果を整形する
 */
export async function formatterNode(
  state: KnowledgeSearchStateType
): Promise<Partial<KnowledgeSearchStateType>> {
  const { rawResults, filters, processedQuery, metadata } = state;
  
  if (!rawResults) {
    return {
      errors: [new Error("Raw results are missing")],
      metadata: {
        ...metadata,
        nodeExecutionOrder: [...(metadata.nodeExecutionOrder || []), 'formatter'],
      },
    };
  }
  
  console.log(`[Formatter] Formatting ${rawResults.length} results`);
  
  try {
    // 検索結果を整形
    const formattedResults: SearchItem[] = rawResults.map(result => ({
      id: result.id,
      source: result.source,
      title: result.title,
      content: result.content,
      excerpt: generateExcerpt(result.content, result.highlights),
      score: result.score,
      location: result.location,
      context: result.context,
      metadata: result.metadata,
    }));
    
    // 上限適用
    const limit = filters?.limit || 10;
    const limited = formattedResults.slice(0, limit);
    
    // 検索時間を計算
    const searchTime = Date.now() - (metadata.startTime || Date.now());
    
    // ソース一覧を取得
    const sources = [...new Set(rawResults.map(r => r.source))];
    
    const searchResult: SearchResult = {
      results: limited,
      metadata: {
        totalCount: rawResults.length,
        searchTime,
        sources,
        query: processedQuery,
      },
      suggestions: generateQuerySuggestions(processedQuery, rawResults),
    };
    
    console.log(`[Formatter] Formatted ${limited.length}/${rawResults.length} results, search time: ${searchTime}ms`);
    
    return {
      results: searchResult,
      metadata: {
        ...metadata,
        nodeExecutionOrder: [...(metadata.nodeExecutionOrder || []), 'formatter'],
        finalResultCount: limited.length,
      },
    };
  } catch (error) {
    console.error('[Formatter] Error:', error);
    return {
      errors: [error as Error],
      metadata: {
        ...metadata,
        nodeExecutionOrder: [...(metadata.nodeExecutionOrder || []), 'formatter'],
      },
    };
  }
}

/**
 * 抜粋を生成
 */
function generateExcerpt(
  content: string,
  highlights?: string[],
  maxLength: number = 200
): string {
  if (highlights && highlights.length > 0) {
    // ハイライトがある場合は最初のハイライトを使用
    const highlight = highlights[0];
    if (highlight.length <= maxLength) {
      return highlight;
    }
    return highlight.slice(0, maxLength) + '...';
  }
  
  // ハイライトがない場合は先頭から
  if (content.length <= maxLength) {
    return content;
  }
  
  return content.slice(0, maxLength) + '...';
}

/**
 * クエリの改善提案を生成
 */
function generateQuerySuggestions(
  processedQuery: any,
  results: any[]
): string[] {
  const suggestions: string[] = [];
  
  // 結果が少ない場合の提案
  if (results.length < 3) {
    suggestions.push('Try using more general terms');
    suggestions.push('Check for spelling errors');
    
    if (processedQuery?.expanded && processedQuery.expanded.length > 0) {
      suggestions.push(`Try: ${processedQuery.expanded[0]}`);
    }
  }
  
  // 結果が多すぎる場合の提案
  if (results.length > 50) {
    suggestions.push('Add more specific keywords to narrow down results');
    suggestions.push('Use filters to refine your search');
  }
  
  return suggestions.slice(0, 3); // 最大3件
}
