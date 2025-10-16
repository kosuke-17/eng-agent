/**
 * コード検索ツール
 */

import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { CodeRetriever } from "../../../retrievers/code-retriever.js";
import { ProcessedQuery } from "../../../types/search.js";

/**
 * コード検索ツール
 */
export const codeSearchTool = tool(
  async ({ query, path, limit }) => {
    const retriever = new CodeRetriever(path);
    
    // ProcessedQueryを構築
    const processedQuery: ProcessedQuery = {
      original: query,
      normalized: query.toLowerCase(),
      expanded: [query],
      type: 'code',
    };
    
    const results = await retriever.search(
      processedQuery,
      {
        methods: ['keyword'],
        weights: { keyword: 1.0, semantic: 0.0, hybrid: 0.0 },
        sources: ['code'],
      },
      { limit }
    );
    
    return JSON.stringify({
      success: true,
      count: results.length,
      results: results.map(r => ({
        name: r.title,
        path: r.location.filePath,
        line: r.location.lineNumber,
        score: r.score,
        type: r.metadata.type,
      })),
    });
  },
  {
    name: "code_search",
    description: "Search for code symbols (functions, classes, interfaces) in the codebase",
    schema: z.object({
      query: z.string().describe("The search query (function/class name or keyword)"),
      path: z.string().default("./src").describe("The path to search in"),
      limit: z.number().default(10).describe("Maximum number of results to return"),
    }),
  }
);
