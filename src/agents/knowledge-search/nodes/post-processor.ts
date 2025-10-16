/**
 * 後処理ノード
 */

import { KnowledgeSearchStateType } from "../state.js";
import { RawSearchResult, SearchContext } from "../../../types/search.js";
import * as fs from "fs";

/**
 * 検索結果を後処理する（スコアリング、ランキング、コンテキスト抽出）
 */
export async function postProcessorNode(
  state: KnowledgeSearchStateType
): Promise<Partial<KnowledgeSearchStateType>> {
  const { rawResults, searchStrategy, metadata } = state;
  
  if (!rawResults || !searchStrategy) {
    return {
      errors: [new Error("Raw results or search strategy is missing")],
      metadata: {
        ...metadata,
        nodeExecutionOrder: [...(metadata.nodeExecutionOrder || []), 'post_processor'],
      },
    };
  }
  
  console.log(`[PostProcessor] Processing ${rawResults.length} raw results`);
  
  try {
    let processed = [...rawResults];
    
    // 1. スコアの正規化
    processed = normalizeScores(processed);
    
    // 2. ハイブリッド検索の場合は重み付けマージ
    if (searchStrategy.methods.length > 1) {
      processed = mergeResults(processed, searchStrategy.weights);
    }
    
    // 3. リランキング（スコアベース）
    processed = rerankResults(processed);
    
    // 4. 重複排除
    processed = deduplicateResults(processed);
    
    // 5. コンテキスト抽出
    processed = await extractContext(processed);
    
    console.log(`[PostProcessor] Processed to ${processed.length} results`);
    
    return {
      rawResults: processed,
      metadata: {
        ...metadata,
        nodeExecutionOrder: [...(metadata.nodeExecutionOrder || []), 'post_processor'],
        processedResultCount: processed.length,
      },
    };
  } catch (error) {
    console.error('[PostProcessor] Error:', error);
    return {
      errors: [error as Error],
      metadata: {
        ...metadata,
        nodeExecutionOrder: [...(metadata.nodeExecutionOrder || []), 'post_processor'],
      },
    };
  }
}

/**
 * スコアを正規化（0-1の範囲）
 */
function normalizeScores(results: RawSearchResult[]): RawSearchResult[] {
  if (results.length === 0) return results;
  
  const maxScore = Math.max(...results.map(r => r.score));
  const minScore = Math.min(...results.map(r => r.score));
  const range = maxScore - minScore;
  
  if (range === 0) return results;
  
  return results.map(result => ({
    ...result,
    score: (result.score - minScore) / range,
  }));
}

/**
 * 重み付けマージ（ハイブリッド検索用）
 */
function mergeResults(
  results: RawSearchResult[],
  weights: Record<string, number>
): RawSearchResult[] {
  // この実装では、既にマージされた結果に対してスコアを調整
  // 実際のハイブリッド検索では、各手法の結果を別々に取得してマージする
  return results.map(result => {
    // メタデータに検索手法が含まれている場合は重み付け
    const method = result.metadata.searchMethod as string;
    if (method && weights[method]) {
      return {
        ...result,
        score: result.score * weights[method],
      };
    }
    return result;
  });
}

/**
 * リランキング
 */
function rerankResults(results: RawSearchResult[]): RawSearchResult[] {
  // スコアでソート（降順）
  return results.sort((a, b) => b.score - a.score);
}

/**
 * 重複排除
 */
function deduplicateResults(results: RawSearchResult[]): RawSearchResult[] {
  const seen = new Set<string>();
  const deduplicated: RawSearchResult[] = [];
  
  for (const result of results) {
    // ファイルパスと行番号で重複判定
    const key = `${result.location.filePath}:${result.location.lineNumber || 0}`;
    
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(result);
    }
  }
  
  return deduplicated;
}

/**
 * コンテキストを抽出
 */
async function extractContext(results: RawSearchResult[]): Promise<RawSearchResult[]> {
  const withContext: RawSearchResult[] = [];
  
  for (const result of results) {
    let context: SearchContext | undefined;
    
    // ファイルパスと行番号がある場合、前後のコンテキストを取得
    if (result.location.filePath && result.location.lineNumber) {
      context = await getFileContext(
        result.location.filePath,
        result.location.lineNumber
      );
    }
    
    withContext.push({
      ...result,
      context,
    });
  }
  
  return withContext;
}

/**
 * ファイルから前後のコンテキストを取得
 */
async function getFileContext(
  filePath: string,
  lineNumber: number,
  contextLines: number = 3
): Promise<SearchContext | undefined> {
  try {
    if (!fs.existsSync(filePath)) {
      return undefined;
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    const startLine = Math.max(0, lineNumber - contextLines - 1);
    const endLine = Math.min(lines.length, lineNumber + contextLines);
    
    const before = lines.slice(startLine, lineNumber - 1).join('\n');
    const after = lines.slice(lineNumber, endLine).join('\n');
    
    return { before, after };
  } catch (error) {
    console.error(`Failed to get context for ${filePath}:${lineNumber}`, error);
    return undefined;
  }
}
