/**
 * ドキュメント検索Retriever
 */

import { BaseRetriever } from "./base-retriever.js";
import {
  ProcessedQuery,
  SearchStrategy,
  RawSearchResult,
  SearchFilters,
  Document,
} from "../types/search.js";
import * as fs from "fs";
import * as path from "path";

export class DocumentRetriever extends BaseRetriever {
  private documentsPath: string;
  
  constructor(documentsPath: string = "./docs") {
    super("DocumentRetriever", "docs");
    this.documentsPath = documentsPath;
  }
  
  async search(
    query: ProcessedQuery,
    strategy: SearchStrategy,
    filters?: SearchFilters
  ): Promise<RawSearchResult[]> {
    try {
      // ドキュメントファイルを取得
      const documents = await this.loadDocuments(filters);
      const results: RawSearchResult[] = [];
      
      // 各ドキュメントをスコアリング
      for (const doc of documents) {
        const score = this.calculateTextScore(query, doc.content);
        
        if (score > 0.3) { // 閾値
          const highlights = this.generateHighlights(doc.content, query);
          
          results.push({
            id: doc.id,
            source: 'docs',
            title: doc.metadata.title || path.basename(doc.id),
            content: doc.content,
            score,
            location: {
              filePath: doc.id,
            },
            highlights,
            metadata: doc.metadata,
          });
        }
      }
      
      // スコアでソート
      results.sort((a, b) => b.score - a.score);
      
      return this.applyFilters(results, filters);
    } catch (error) {
      console.error('DocumentRetriever error:', error);
      return [];
    }
  }
  
  /**
   * ドキュメントを読み込む
   */
  private async loadDocuments(filters?: SearchFilters): Promise<Document[]> {
    const documents: Document[] = [];
    
    if (!fs.existsSync(this.documentsPath)) {
      return documents;
    }
    
    const files = this.getFilesRecursively(this.documentsPath);
    
    for (const file of files) {
      // ファイルタイプフィルタを適用
      if (filters?.fileTypes && filters.fileTypes.length > 0) {
        const ext = path.extname(file).slice(1);
        if (!filters.fileTypes.includes(ext) && !filters.fileTypes.includes(path.extname(file))) {
          continue;
        }
      }
      
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const stats = fs.statSync(file);
        
        documents.push({
          id: file,
          content,
          metadata: {
            source: file,
            title: path.basename(file, path.extname(file)),
            createdAt: stats.birthtime,
            updatedAt: stats.mtime,
          },
        });
      } catch (error) {
        console.error(`Failed to load document: ${file}`, error);
      }
    }
    
    return documents;
  }
  
  /**
   * ディレクトリを再帰的に探索してファイルを取得
   */
  private getFilesRecursively(dir: string): string[] {
    const files: string[] = [];
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // ディレクトリは再帰的に探索
        files.push(...this.getFilesRecursively(fullPath));
      } else if (stat.isFile()) {
        // テキストファイルのみ
        const ext = path.extname(item);
        if (['.md', '.txt', '.json', '.yaml', '.yml'].includes(ext)) {
          files.push(fullPath);
        }
      }
    }
    
    return files;
  }
}
