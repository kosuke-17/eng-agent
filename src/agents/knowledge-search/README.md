# Knowledge Search Agent

多機能ナレッジ検索エージェント - LangGraph + LangChainベースの統合検索システム

## 概要

Knowledge Search Agentは、コードベース、ドキュメント、ナレッジベースから関連情報を効率的に検索するAIエージェントです。キーワード検索、セマンティック検索、ハイブリッド検索をサポートし、複数のソースを横断的に検索できます。

## 特徴

- 🔍 **マルチソース検索**: コード、ドキュメント、ナレッジベースを統合的に検索
- 🧠 **セマンティック検索**: OpenAI Embeddingsを使用した意味ベースの検索
- 🔀 **ハイブリッド検索**: キーワードとセマンティックを組み合わせた高精度検索
- 📊 **スコアリング**: 関連度に基づいた結果のランキング
- 🎯 **コンテキスト抽出**: 検索結果の前後コンテキストを自動取得
- 🛠️ **拡張可能**: プラグイン機構で新しいRetrieverを追加可能
- ⚡ **並列処理**: 複数ソースからの並列検索で高速化

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│              Knowledge Search Agent                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Query Processor → Search Strategy → Retriever   │  │
│  │       ↓                                           │  │
│  │  Post Processor → Formatter                       │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
           ↓                ↓               ↓
    Code Retriever   Doc Retriever   Vector Retriever
```

## インストール

```bash
# 依存パッケージのインストール
npm install

# ベクトルストア用（オプション）
npm install chromadb
```

## 使用方法

### 基本的な使用

```typescript
import { createKnowledgeSearchAgent } from './agents/knowledge-search';

// Agentの作成
const agent = createKnowledgeSearchAgent();

// シンプルな検索
const result = await agent.simpleSearch('function authentication', {
  searchType: 'hybrid',
  sources: ['code', 'docs'],
  limit: 10,
});

console.log(`Found ${result.results.length} results`);
result.results.forEach(item => {
  console.log(`- ${item.title} (score: ${item.score.toFixed(2)})`);
  console.log(`  ${item.excerpt}`);
});
```

### 詳細な検索クエリ

```typescript
import { KnowledgeSearchAgent, SearchQuery } from './agents/knowledge-search';

const agent = new KnowledgeSearchAgent({
  search: {
    maxResults: 20,
    enableCache: true,
  },
});

const query: SearchQuery = {
  query: 'user authentication flow',
  searchType: 'hybrid',
  sources: ['code', 'docs', 'knowledge-base'],
  filters: {
    fileTypes: ['ts', 'md'],
    directories: ['src/auth', 'docs/guides'],
    limit: 15,
  },
  includeContext: true,
};

const result = await agent.search(query);
```

### 検索タイプ

#### 1. キーワード検索

```typescript
const result = await agent.simpleSearch('getUserById', {
  searchType: 'keyword',
  sources: ['code'],
});
```

#### 2. セマンティック検索

```typescript
const result = await agent.simpleSearch('how to implement authentication', {
  searchType: 'semantic',
  sources: ['docs', 'knowledge-base'],
});
```

#### 3. ハイブリッド検索（推奨）

```typescript
const result = await agent.simpleSearch('authentication middleware', {
  searchType: 'hybrid',  // デフォルト
  sources: ['code', 'docs'],
});
```

## 設定

### Agent設定

```typescript
const agent = new KnowledgeSearchAgent({
  name: "Custom Search Agent",
  search: {
    defaultSources: ['code', 'docs'],
    defaultSearchType: 'hybrid',
    maxResults: 15,
    enableCache: true,
  },
  vectorStore: {
    provider: 'chroma',
    collectionName: 'my-knowledge-base',
    embeddingModel: 'text-embedding-3-small',
  },
  debug: true,
  logLevel: 'info',
});
```

### 環境変数

```bash
# .env
OPENAI_API_KEY=your_api_key_here
```

## LangChainツールとしての使用

```typescript
import { codeSearchTool, docSearchTool, hybridSearchTool } from './agents/knowledge-search/tools';

// LangChainのAgentやチェーンで使用可能
const tools = [codeSearchTool, docSearchTool, hybridSearchTool];
```

## ディレクトリ構造

```
src/agents/knowledge-search/
├── index.ts                    # エントリーポイント
├── graph.ts                    # LangGraphグラフ定義
├── state.ts                    # State定義
├── config.ts                   # Agent設定
├── nodes/                      # 処理ノード
│   ├── query-processor.ts      # クエリ処理
│   ├── search-strategy.ts      # 検索戦略
│   ├── retriever.ts            # 検索実行
│   ├── post-processor.ts       # 後処理
│   └── formatter.ts            # 結果整形
└── tools/                      # LangChainツール
    ├── code-search.ts
    ├── doc-search.ts
    ├── vector-search.ts
    └── hybrid-search.ts

src/retrievers/                 # Retriever実装
├── base-retriever.ts           # 基底クラス
├── code-retriever.ts           # コード検索
├── document-retriever.ts       # ドキュメント検索
└── vector-retriever.ts         # ベクトル検索
```

## 検索結果の構造

```typescript
interface SearchResult {
  results: SearchItem[];          // 検索結果アイテム
  metadata: {
    totalCount: number;           // 総件数
    searchTime: number;           // 検索時間(ms)
    sources: string[];            // 使用したソース
    query?: ProcessedQuery;       // 処理済みクエリ
  };
  suggestions?: string[];         // クエリ改善提案
}

interface SearchItem {
  id: string;
  source: 'code' | 'docs' | 'knowledge-base';
  title: string;
  content: string;
  excerpt: string;                // ハイライトされた抜粋
  score: number;                  // 関連度スコア(0-1)
  location: {
    filePath?: string;
    lineNumber?: number;
    url?: string;
  };
  context?: {                     // 前後のコンテキスト
    before: string;
    after: string;
  };
  metadata: Record<string, any>;
}
```

## テスト

```bash
# すべてのテストを実行
npm test

# 統合テスト
npm test -- tests/agents/knowledge-search/integration.test.ts

# カバレッジ付き
npm test -- --coverage
```

## パフォーマンス

- **検索速度**: 平均 200-500ms（キャッシュなし）
- **並列処理**: 複数ソースを並列検索して高速化
- **スケーラビリティ**: 10万ファイル以上のコードベースに対応

## ベクトルストアの初期化

```typescript
import { VectorRetriever } from './retrievers/vector-retriever';

const retriever = new VectorRetriever('knowledge-base');

// ドキュメントを追加
await retriever.addDocuments([
  {
    id: 'doc-1',
    content: 'Authentication is the process of verifying identity...',
    metadata: {
      title: 'Authentication Guide',
      source: 'docs/auth.md',
      tags: ['security', 'auth'],
    },
  },
  // ... more documents
]);
```

## トラブルシューティング

### ChromaDBのエラー

```bash
# ChromaDBが見つからない場合
npm install chromadb

# またはベクトル検索を無効化
const result = await agent.simpleSearch('query', {
  sources: ['code', 'docs'],  // 'knowledge-base'を除外
});
```

### パース エラー

TypeScript/JavaScriptファイルのパースエラーが発生する場合、そのファイルはスキップされます。ログを確認してください。

## 今後の拡張

- [ ] 複数言語のコードサポート（Python, Java, Go等）
- [ ] リアルタイムインデックス更新
- [ ] クエリキャッシング
- [ ] カスタムスコアリングロジック
- [ ] GraphQL/REST APIサーバー
- [ ] Web UIダッシュボード

## 参考資料

- [LangChain Documentation](https://js.langchain.com/docs/)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraphjs/)
- [ChromaDB Documentation](https://docs.trychroma.com/)

## ライセンス

ISC

## 作成者

Knowledge Search Agent Development Team
