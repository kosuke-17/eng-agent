/**
 * ベクトル検索Retriever
 */

import { BaseRetriever } from "./base-retriever.js";
import {
  ProcessedQuery,
  SearchStrategy,
  RawSearchResult,
  SearchFilters,
} from "../types/search.js";
import { OpenAIEmbeddings } from "@langchain/openai";

// ChromaDBはオプショナル（インストールされていない場合はスキップ）
let ChromaClient: any;
try {
  const chromaModule = await import("chromadb");
  ChromaClient = chromaModule.ChromaClient;
} catch (error) {
  console.warn("chromadb not installed, VectorRetriever will be disabled");
}

export class VectorRetriever extends BaseRetriever {
  private embeddings: OpenAIEmbeddings;
  private collectionName: string;
  private client: any;
  
  constructor(collectionName: string = "knowledge-base") {
    super("VectorRetriever", "knowledge-base");
    this.collectionName = collectionName;
    this.embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-3-small",
    });
    
    if (ChromaClient) {
      this.client = new ChromaClient();
    }
  }
  
  async search(
    query: ProcessedQuery,
    strategy: SearchStrategy,
    filters?: SearchFilters
  ): Promise<RawSearchResult[]> {
    if (!this.client || !ChromaClient) {
      console.warn("ChromaDB not available, skipping vector search");
      return [];
    }
    
    try {
      // コレクションを取得
      const collection = await this.client.getOrCreateCollection({
        name: this.collectionName,
      });
      
      // クエリのEmbeddingを生成
      const queryEmbedding = await this.embeddings.embedQuery(query.normalized);
      
      // ベクトル検索を実行
      const k = filters?.limit || 10;
      const results = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: k,
      });
      
      // 結果を変換
      const searchResults: RawSearchResult[] = [];
      
      if (results.ids && results.ids[0] && results.documents && results.documents[0]) {
        for (let i = 0; i < results.ids[0].length; i++) {
          const id = results.ids[0][i];
          const document = results.documents[0][i];
          const distance = results.distances?.[0]?.[i] ?? 1.0;
          const metadata = results.metadatas?.[0]?.[i] ?? {};
          
          // distanceをscoreに変換（0-1の範囲、小さいほど類似）
          const score = 1 - Math.min(distance, 1.0);
          
          if (score > 0.3) { // 閾値
            searchResults.push({
              id: id as string,
              source: 'knowledge-base',
              title: metadata.title || id,
              content: document as string,
              score,
              location: {
                filePath: metadata.source,
                url: metadata.url,
              },
              metadata,
            });
          }
        }
      }
      
      return this.applyFilters(searchResults, filters);
    } catch (error) {
      console.error('VectorRetriever error:', error);
      return [];
    }
  }
  
  /**
   * ドキュメントをベクトルストアに追加
   */
  async addDocuments(documents: Array<{
    id: string;
    content: string;
    metadata?: Record<string, any>;
  }>): Promise<void> {
    if (!this.client || !ChromaClient) {
      console.warn("ChromaDB not available");
      return;
    }
    
    try {
      const collection = await this.client.getOrCreateCollection({
        name: this.collectionName,
      });
      
      const texts = documents.map(d => d.content);
      const embeddings = await this.embeddings.embedDocuments(texts);
      const ids = documents.map(d => d.id);
      const metadatas = documents.map(d => d.metadata || {});
      
      await collection.add({
        ids,
        embeddings,
        documents: texts,
        metadatas,
      });
      
      console.log(`Added ${documents.length} documents to vector store`);
    } catch (error) {
      console.error('Failed to add documents:', error);
      throw error;
    }
  }
  
  /**
   * コレクションをクリア
   */
  async clearCollection(): Promise<void> {
    if (!this.client || !ChromaClient) {
      return;
    }
    
    try {
      await this.client.deleteCollection({ name: this.collectionName });
      console.log(`Cleared collection: ${this.collectionName}`);
    } catch (error) {
      console.error('Failed to clear collection:', error);
    }
  }
}
