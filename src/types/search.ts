/**
 * 検索関連の型定義
 */

/**
 * 検索タイプ
 */
export type SearchType = 'keyword' | 'semantic' | 'hybrid';

/**
 * 検索ソース
 */
export type SearchSource = 'code' | 'docs' | 'knowledge-base';

/**
 * 検索フィルタ
 */
export interface SearchFilters {
  fileTypes?: string[];
  directories?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  tags?: string[];
  limit?: number;
}

/**
 * 検索クエリ
 */
export interface SearchQuery {
  query: string;
  searchType: SearchType;
  sources?: SearchSource[];
  filters?: SearchFilters;
  limit?: number;
  includeContext?: boolean;
}

/**
 * 処理済みクエリ
 */
export interface ProcessedQuery {
  original: string;
  normalized: string;
  expanded: string[];
  type: 'code' | 'documentation' | 'general';
  tokens?: string[];
}

/**
 * 検索戦略
 */
export interface SearchStrategy {
  methods: SearchType[];
  weights: Record<SearchType, number>;
  sources: SearchSource[];
  parallelExecution?: boolean;
}

/**
 * 検索結果の位置情報
 */
export interface SearchLocation {
  filePath?: string;
  lineNumber?: number;
  columnNumber?: number;
  url?: string;
}

/**
 * 検索結果のコンテキスト
 */
export interface SearchContext {
  before: string;
  after: string;
  relatedFiles?: string[];
}

/**
 * 生の検索結果
 */
export interface RawSearchResult {
  id: string;
  source: SearchSource;
  title: string;
  content: string;
  score: number;
  location: SearchLocation;
  highlights?: string[];
  context?: SearchContext;
  metadata: Record<string, any>;
}

/**
 * 整形済み検索結果アイテム
 */
export interface SearchItem {
  id: string;
  source: SearchSource;
  title: string;
  content: string;
  excerpt: string;
  score: number;
  location: SearchLocation;
  context?: SearchContext;
  metadata: Record<string, any>;
}

/**
 * 検索結果
 */
export interface SearchResult {
  results: SearchItem[];
  metadata: {
    totalCount: number;
    searchTime: number;
    sources: string[];
    query?: ProcessedQuery;
  };
  suggestions?: string[];
}

/**
 * コードシンボル
 */
export interface CodeSymbol {
  type: 'function' | 'class' | 'interface' | 'type' | 'variable' | 'const';
  name: string;
  code: string;
  line: number;
  column?: number;
  endLine?: number;
  docstring?: string;
  params?: Array<{ name: string; type?: string }>;
  returnType?: string;
}

/**
 * コードファイル
 */
export interface CodeFile {
  path: string;
  content: string;
  language: 'typescript' | 'javascript' | 'python' | 'java' | 'go' | 'rust' | 'other';
  size: number;
  lastModified: Date;
}

/**
 * ドキュメント
 */
export interface Document {
  id: string;
  content: string;
  metadata: {
    source?: string;
    title?: string;
    author?: string;
    createdAt?: Date;
    updatedAt?: Date;
    tags?: string[];
    [key: string]: any;
  };
}

/**
 * ベクトル検索結果
 */
export interface VectorSearchResult {
  id: string;
  document: string;
  metadata: Record<string, any>;
  distance: number;
  score: number;
}

/**
 * インデックス統計
 */
export interface IndexStats {
  totalDocuments: number;
  totalSize: number;
  lastUpdated: Date;
  sources: Record<SearchSource, number>;
}
