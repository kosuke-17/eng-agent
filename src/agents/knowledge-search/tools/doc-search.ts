/**
 * ドキュメント検索ツール
 */

import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { DocumentRetriever } from "../../../retrievers/document-retriever.js";
import { ProcessedQuery } from "../../../types/search.js";

/**
 * ドキュメント検索ツール
 */
export const docSearchTool = tool(
  async ({ query, path, limit }) => {
    const retriever = new DocumentRetriever(path);
    
    // ProcessedQueryを構築
    const processedQuery: ProcessedQuery = {
      original: query,
      normalized: query.toLowerCase(),
      expanded: [query],
      type: 'documentation',
    };
    
    const results = await retriever.search(
      processedQuery,
      {
        methods: ['keyword'],
        weights: { keyword: 1.0, semantic: 0.0, hybrid: 0.0 },
        sources: ['docs'],
      },
      { limit }
    );
    
    return JSON.stringify({
      success: true,
      count: results.length,
      results: results.map(r => ({
        title: r.title,
        path: r.location.filePath,
        score: r.score,
        excerpt: r.content.slice(0, 200),
      })),
    });
  },
  {
    name: "doc_search",
    description: "Search for documentation, guides, and text files",
    schema: z.object({
      query: z.string().describe("The search query"),
      path: z.string().default("./docs").describe("The path to search in"),
      limit: z.number().default(10).describe("Maximum number of results to return"),
    }),
  }
);
