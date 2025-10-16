/**
 * 基底Retrieverクラス
 */

import {
  ProcessedQuery,
  SearchStrategy,
  RawSearchResult,
  SearchFilters,
  SearchSource,
} from "../types/search.js";
import { IRetriever } from "../types/agent.js";

export abstract class BaseRetriever implements IRetriever {
  protected name: string;
  protected source: SearchSource;
  
  constructor(name: string, source: SearchSource) {
    this.name = name;
    this.source = source;
  }
  
  /**
   * 検索を実行する（サブクラスで実装）
   */
  abstract search(
    query: ProcessedQuery,
    strategy: SearchStrategy,
    filters?: SearchFilters
  ): Promise<RawSearchResult[]>;
  
  /**
   * Retrieverの名前を取得
   */
  getName(): string {
    return this.name;
  }
  
  /**
   * 検索ソースを取得
   */
  getSource(): string {
    return this.source;
  }
  
  /**
   * クエリとテキストの類似度スコアを計算（基本実装）
   */
  protected calculateTextScore(query: ProcessedQuery, text: string): number {
    const normalizedText = text.toLowerCase();
    const queryTerms = [
      query.normalized.toLowerCase(),
      ...query.expanded.map(t => t.toLowerCase()),
    ];
    
    let score = 0;
    let matchCount = 0;
    
    for (const term of queryTerms) {
      if (normalizedText.includes(term)) {
        matchCount++;
        // 完全一致の場合はより高いスコア
        if (normalizedText === term) {
          score += 1.0;
        } else {
          score += 0.5;
        }
      }
    }
    
    // 正規化（0-1の範囲）
    if (queryTerms.length > 0) {
      score = score / queryTerms.length;
    }
    
    return Math.min(score, 1.0);
  }
  
  /**
   * フィルタを適用
   */
  protected applyFilters(
    results: RawSearchResult[],
    filters?: SearchFilters
  ): RawSearchResult[] {
    if (!filters) {
      return results;
    }
    
    let filtered = results;
    
    // ファイルタイプフィルタ
    if (filters.fileTypes && filters.fileTypes.length > 0) {
      filtered = filtered.filter(result => {
        const filePath = result.location.filePath;
        if (!filePath) return true;
        
        return filters.fileTypes!.some(ext => 
          filePath.endsWith(ext) || filePath.endsWith('.' + ext)
        );
      });
    }
    
    // ディレクトリフィルタ
    if (filters.directories && filters.directories.length > 0) {
      filtered = filtered.filter(result => {
        const filePath = result.location.filePath;
        if (!filePath) return true;
        
        return filters.directories!.some(dir => 
          filePath.startsWith(dir)
        );
      });
    }
    
    // 件数制限
    if (filters.limit) {
      filtered = filtered.slice(0, filters.limit);
    }
    
    return filtered;
  }
  
  /**
   * ハイライトを生成
   */
  protected generateHighlights(
    text: string,
    query: ProcessedQuery,
    maxHighlights: number = 3
  ): string[] {
    const highlights: string[] = [];
    const terms = [query.normalized, ...query.expanded];
    const lines = text.split('\n');
    
    for (const line of lines) {
      for (const term of terms) {
        if (line.toLowerCase().includes(term.toLowerCase())) {
          highlights.push(line.trim());
          if (highlights.length >= maxHighlights) {
            return highlights;
          }
          break;
        }
      }
    }
    
    return highlights;
  }
}
