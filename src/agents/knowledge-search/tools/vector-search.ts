/**
 * ベクトル検索ツール
 */

import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { VectorRetriever } from "../../../retrievers/vector-retriever.js";
import { ProcessedQuery } from "../../../types/search.js";

/**
 * ベクトル検索ツール（セマンティック検索）
 */
export const vectorSearchTool = tool(
  async ({ query, collectionName, limit }) => {
    const retriever = new VectorRetriever(collectionName);
    
    // ProcessedQueryを構築
    const processedQuery: ProcessedQuery = {
      original: query,
      normalized: query.toLowerCase(),
      expanded: [query],
      type: 'general',
    };
    
    const results = await retriever.search(
      processedQuery,
      {
        methods: ['semantic'],
        weights: { keyword: 0.0, semantic: 1.0, hybrid: 0.0 },
        sources: ['knowledge-base'],
      },
      { limit }
    );
    
    return JSON.stringify({
      success: true,
      count: results.length,
      results: results.map(r => ({
        id: r.id,
        title: r.title,
        score: r.score,
        excerpt: r.content.slice(0, 200),
        metadata: r.metadata,
      })),
    });
  },
  {
    name: "vector_search",
    description: "Perform semantic search using vector embeddings in the knowledge base",
    schema: z.object({
      query: z.string().describe("The search query"),
      collectionName: z.string().default("knowledge-base").describe("The vector collection to search in"),
      limit: z.number().default(10).describe("Maximum number of results to return"),
    }),
  }
);
