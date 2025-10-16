/**
 * クエリ処理ノード
 */

import { KnowledgeSearchStateType } from "../state.js";
import { ProcessedQuery } from "../../../types/search.js";

/**
 * クエリを処理・正規化・拡張する
 */
export async function queryProcessorNode(
  state: KnowledgeSearchStateType
): Promise<Partial<KnowledgeSearchStateType>> {
  const { query, searchType, metadata } = state;
  
  console.log(`[QueryProcessor] Processing query: "${query}"`);
  
  try {
    // 1. クエリの正規化
    const normalizedQuery = normalizeQuery(query);
    
    // 2. クエリの拡張（同義語、関連語）
    const expandedTerms = expandQuery(normalizedQuery);
    
    // 3. クエリの分類（コード検索 or ドキュメント検索）
    const queryType = classifyQuery(normalizedQuery);
    
    // 4. トークン化
    const tokens = tokenize(normalizedQuery);
    
    const processedQuery: ProcessedQuery = {
      original: query,
      normalized: normalizedQuery,
      expanded: expandedTerms,
      type: queryType,
      tokens,
    };
    
    console.log(`[QueryProcessor] Query type: ${queryType}, expanded terms: ${expandedTerms.length}`);
    
    return {
      processedQuery,
      metadata: {
        ...metadata,
        nodeExecutionOrder: [...(metadata.nodeExecutionOrder || []), 'query_processor'],
      },
    };
  } catch (error) {
    console.error('[QueryProcessor] Error:', error);
    return {
      errors: [error as Error],
      metadata: {
        ...metadata,
        nodeExecutionOrder: [...(metadata.nodeExecutionOrder || []), 'query_processor'],
      },
    };
  }
}

/**
 * クエリを正規化
 */
function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // 複数スペースを1つに
    .replace(/[^\w\s-]/g, ''); // 特殊文字を除去（ハイフンは残す）
}

/**
 * クエリを拡張（同義語、関連語）
 */
function expandQuery(query: string): string[] {
  const expanded: string[] = [];
  
  // 基本的な同義語マッピング
  const synonyms: Record<string, string[]> = {
    'function': ['func', 'method', 'procedure'],
    'class': ['component', 'module'],
    'interface': ['contract', 'protocol'],
    'api': ['endpoint', 'service'],
    'database': ['db', 'datastore'],
    'authentication': ['auth', 'login'],
    'authorization': ['authz', 'permission'],
    'configuration': ['config', 'settings'],
    'documentation': ['docs', 'guide'],
    'error': ['exception', 'failure', 'bug'],
    'test': ['testing', 'spec', 'unittest'],
    'search': ['find', 'query', 'lookup'],
  };
  
  const words = query.split(' ');
  
  for (const word of words) {
    if (synonyms[word]) {
      expanded.push(...synonyms[word]);
    }
  }
  
  // クエリ自体も含める
  expanded.push(query);
  
  // 重複を除去
  return [...new Set(expanded)];
}

/**
 * クエリのタイプを分類
 */
function classifyQuery(query: string): 'code' | 'documentation' | 'general' {
  // コード関連のキーワード
  const codeKeywords = [
    'function', 'class', 'interface', 'type', 'method', 'variable',
    'const', 'let', 'import', 'export', 'async', 'await',
    'implement', 'extend', 'inherit', 'override',
  ];
  
  // ドキュメント関連のキーワード
  const docKeywords = [
    'how', 'what', 'why', 'when', 'where',
    'guide', 'tutorial', 'documentation', 'docs',
    'example', 'usage', 'reference',
  ];
  
  const words = query.split(' ');
  
  let codeScore = 0;
  let docScore = 0;
  
  for (const word of words) {
    if (codeKeywords.includes(word)) {
      codeScore++;
    }
    if (docKeywords.includes(word)) {
      docScore++;
    }
  }
  
  // キャメルケースやスネークケースが含まれる場合はコード検索
  if (/[a-z][A-Z]/.test(query) || /_[a-z]/.test(query)) {
    codeScore += 2;
  }
  
  if (codeScore > docScore) {
    return 'code';
  } else if (docScore > codeScore) {
    return 'documentation';
  }
  
  return 'general';
}

/**
 * クエリをトークン化
 */
function tokenize(query: string): string[] {
  return query
    .split(/\s+/)
    .filter(token => token.length > 0);
}
