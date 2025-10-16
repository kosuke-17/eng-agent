/**
 * ハイブリッド検索ツール
 */

import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { CodeRetriever } from "../../../retrievers/code-retriever.js";
import { DocumentRetriever } from "../../../retrievers/document-retriever.js";
import { VectorRetriever } from "../../../retrievers/vector-retriever.js";
import { ProcessedQuery, RawSearchResult } from "../../../types/search.js";

/**
 * ハイブリッド検索ツール（キーワード + セマンティック）
 */
export const hybridSearchTool = tool(
  async ({ query, sources, limit }) => {
    // ProcessedQueryを構築
    const processedQuery: ProcessedQuery = {
      original: query,
      normalized: query.toLowerCase(),
      expanded: [query],
      type: 'general',
    };
    
    const allResults: RawSearchResult[] = [];
    
    // 各ソースから検索
    const retrievers = [];
    if (sources.includes('code')) {
      retrievers.push(new CodeRetriever('./src'));
    }
    if (sources.includes('docs')) {
      retrievers.push(new DocumentRetriever('./docs'));
    }
    if (sources.includes('knowledge-base')) {
      retrievers.push(new VectorRetriever('knowledge-base'));
    }
    
    // 並列実行
    const promises = retrievers.map(retriever =>
      retriever.search(
        processedQuery,
        {
          methods: ['keyword', 'semantic'],
          weights: { keyword: 0.3, semantic: 0.7, hybrid: 0.0 },
          sources: ['code', 'docs', 'knowledge-base'],
        },
        { limit: Math.ceil(limit / retrievers.length) }
      )
    );
    
    const results = await Promise.all(promises);
    allResults.push(...results.flat());
    
    // スコアでソート
    allResults.sort((a, b) => b.score - a.score);
    
    // 上限適用
    const limited = allResults.slice(0, limit);
    
    return JSON.stringify({
      success: true,
      count: limited.length,
      totalCount: allResults.length,
      results: limited.map(r => ({
        source: r.source,
        title: r.title,
        path: r.location.filePath,
        score: r.score,
        excerpt: r.content.slice(0, 200),
      })),
    });
  },
  {
    name: "hybrid_search",
    description: "Perform hybrid search (keyword + semantic) across multiple sources",
    schema: z.object({
      query: z.string().describe("The search query"),
      sources: z.array(z.enum(['code', 'docs', 'knowledge-base']))
        .default(['code', 'docs'])
        .describe("The sources to search in"),
      limit: z.number().default(10).describe("Maximum number of results to return"),
    }),
  }
);
