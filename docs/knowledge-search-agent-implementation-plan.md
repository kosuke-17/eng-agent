# ナレッジ検索Agent 実装計画

## 1. プロジェクト概要

### 1.1 プロジェクト名
Knowledge Search Agent（ナレッジ検索Agent）

### 1.2 実装期間（想定）
- フェーズ1（MVP）: 2週間
- フェーズ2（機能拡張）: 3週間
- フェーズ3（最適化）: 1週間

### 1.3 技術スタック
- **言語**: TypeScript
- **フレームワーク**: LangChain, LangGraph
- **ランタイム**: Node.js
- **ベクトルDB**: Chroma（初期）→ Pinecone/Qdrant（本番）
- **検索エンジン**: カスタム実装 + ベクトル検索
- **Embedding**: OpenAI text-embedding-3-small
- **LLM**: OpenAI GPT-4o-mini（クエリ改善、要約用）

## 2. アーキテクチャ設計

### 2.1 システム構成図

```
┌─────────────────────────────────────────────────────────────┐
│                     Agent Orchestrator                       │
│                      (LangGraph)                            │
└────────────────┬────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
┌───────▼────────┐   ┌───▼──────────────┐
│ Requirements   │   │  System Design   │  ... (other agents)
│    Agent       │   │     Agent        │
└───────┬────────┘   └───┬──────────────┘
        │                │
        │                │
        └────────┬───────┘
                 │
        ┌────────▼─────────────────────────────────────────┐
        │      Knowledge Search Agent (New)                │
        │  ┌─────────────────────────────────────────┐    │
        │  │       Query Processing Module           │    │
        │  │  - Query Analysis                       │    │
        │  │  - Query Expansion                      │    │
        │  │  - Query Routing                        │    │
        │  └────────┬────────────────────────────────┘    │
        │           │                                      │
        │  ┌────────▼────────────────────────────────┐    │
        │  │       Search Strategy Module            │    │
        │  │  - Keyword Search                       │    │
        │  │  - Semantic Search                      │    │
        │  │  - Hybrid Search                        │    │
        │  └────────┬────────────────────────────────┘    │
        │           │                                      │
        │  ┌────────▼────────────────────────────────┐    │
        │  │      Retrieval Module                   │    │
        │  │  ┌──────────┐  ┌──────────┐  ┌───────┐ │    │
        │  │  │Code      │  │Document  │  │Vector │ │    │
        │  │  │Retriever │  │Retriever │  │Store  │ │    │
        │  │  └──────────┘  └──────────┘  └───────┘ │    │
        │  └────────┬────────────────────────────────┘    │
        │           │                                      │
        │  ┌────────▼────────────────────────────────┐    │
        │  │    Post-processing Module               │    │
        │  │  - Ranking & Filtering                  │    │
        │  │  - Context Extraction                   │    │
        │  │  - Summarization                        │    │
        │  └────────┬────────────────────────────────┘    │
        │           │                                      │
        │  ┌────────▼────────────────────────────────┐    │
        │  │      Response Formatting Module         │    │
        │  └─────────────────────────────────────────┘    │
        └──────────────────────────────────────────────────┘
                 │
        ┌────────▼────────┐
        │  Data Sources   │
        │  - Code Repos   │
        │  - Docs         │
        │  - Knowledge DB │
        └─────────────────┘
```

### 2.2 ディレクトリ構造

```
project-root/
├── src/
│   ├── agents/
│   │   ├── knowledge-search/
│   │   │   ├── index.ts                    # Agent エントリーポイント
│   │   │   ├── graph.ts                    # LangGraph 定義
│   │   │   ├── state.ts                    # State 定義
│   │   │   ├── nodes/
│   │   │   │   ├── query-processor.ts      # クエリ処理ノード
│   │   │   │   ├── search-strategy.ts      # 検索戦略ノード
│   │   │   │   ├── retriever.ts            # 検索実行ノード
│   │   │   │   ├── post-processor.ts       # 後処理ノード
│   │   │   │   └── formatter.ts            # 整形ノード
│   │   │   ├── tools/
│   │   │   │   ├── code-search.ts          # コード検索ツール
│   │   │   │   ├── doc-search.ts           # ドキュメント検索ツール
│   │   │   │   ├── vector-search.ts        # ベクトル検索ツール
│   │   │   │   └── hybrid-search.ts        # ハイブリッド検索ツール
│   │   │   └── config.ts                   # Agent 設定
│   │   └── ... (other agents)
│   ├── retrievers/
│   │   ├── base-retriever.ts               # 基底Retrieverクラス
│   │   ├── code-retriever.ts               # コードRetriever
│   │   ├── document-retriever.ts           # ドキュメントRetriever
│   │   └── vector-retriever.ts             # ベクトルRetriever
│   ├── vectorstore/
│   │   ├── index.ts                        # VectorStore インターフェース
│   │   ├── chroma-store.ts                 # Chroma実装
│   │   └── embeddings.ts                   # Embedding生成
│   ├── indexing/
│   │   ├── indexer.ts                      # インデックス作成
│   │   ├── code-indexer.ts                 # コードインデックス
│   │   ├── doc-indexer.ts                  # ドキュメントインデックス
│   │   └── update-scheduler.ts             # 更新スケジューラー
│   ├── utils/
│   │   ├── file-utils.ts                   # ファイル操作
│   │   ├── text-utils.ts                   # テキスト処理
│   │   └── search-utils.ts                 # 検索ユーティリティ
│   ├── types/
│   │   ├── search.ts                       # 検索関連型定義
│   │   ├── agent.ts                        # Agent型定義
│   │   └── index.ts                        # 型エクスポート
│   └── main.ts                             # アプリケーションエントリー
├── tests/
│   ├── agents/
│   │   └── knowledge-search/
│   │       ├── query-processor.test.ts
│   │       ├── search-strategy.test.ts
│   │       └── integration.test.ts
│   ├── retrievers/
│   │   └── code-retriever.test.ts
│   └── fixtures/
│       ├── sample-code/
│       └── sample-docs/
├── data/
│   ├── vector-db/                          # ベクトルDBデータ
│   ├── index/                              # インデックスデータ
│   └── cache/                              # キャッシュデータ
├── docs/
│   ├── knowledge-search-agent-requirements.md
│   ├── knowledge-search-agent-implementation-plan.md
│   └── api-reference.md
├── package.json
└── tsconfig.json
```

## 3. 実装フェーズ

### フェーズ1: MVP実装（2週間）

#### Week 1: コア機能実装

**Day 1-2: プロジェクトセットアップ＆基礎実装**
- [x] ディレクトリ構造の作成
- [ ] TypeScript設定、依存パッケージのインストール
  ```bash
  npm install @langchain/community @langchain/core @langchain/langgraph @langchain/openai
  npm install chromadb dotenv
  npm install -D @types/node typescript ts-node jest @types/jest
  ```
- [ ] 型定義の作成 (`src/types/search.ts`)
- [ ] 基底クラス・インターフェース定義

**Day 3-4: ドキュメント検索機能**
- [ ] Document Retriever 実装
- [ ] ファイルローダー実装（Markdown, Text, JSON）
- [ ] キーワード検索の実装
- [ ] 基本的なテストケース作成

**Day 5-6: ベクトル検索機能**
- [ ] Chroma VectorStore セットアップ
- [ ] Embedding生成機能実装
- [ ] セマンティック検索実装
- [ ] ドキュメントのインデックス化

**Day 7: 統合とテスト**
- [ ] LangGraph による Agent 定義
- [ ] ノード間の状態管理実装
- [ ] 基本的な統合テスト
- [ ] デバッグとバグ修正

#### Week 2: コード検索＆Agent統合

**Day 8-9: コード検索機能**
- [ ] Code Retriever 実装
- [ ] ソースコードのパース（TypeScript, JavaScript, Python）
- [ ] 関数・クラス・インターフェース抽出
- [ ] コードインデックス作成

**Day 10-11: クエリ処理・ポストプロセッシング**
- [ ] Query Processor ノード実装
  - クエリ解析
  - クエリ拡張
- [ ] Post Processor ノード実装
  - スコアリング
  - ランキング
  - コンテキスト抽出

**Day 12-13: Agent統合**
- [ ] LangGraph グラフ定義の完成
- [ ] 他Agentとのインターフェース実装
- [ ] エンドツーエンドテスト
- [ ] デモ用サンプルコード作成

**Day 14: ドキュメント作成＆レビュー**
- [ ] API リファレンス作成
- [ ] 使用例ドキュメント作成
- [ ] コードレビュー
- [ ] リファクタリング

### フェーズ2: 機能拡張（3週間）

#### Week 3: ハイブリッド検索＆高度な検索機能

**Day 15-17: ハイブリッド検索**
- [ ] キーワード検索とセマンティック検索の統合
- [ ] スコアの正規化とマージ
- [ ] リランキング実装（Cross-Encoder使用）
- [ ] 検索精度の評価とチューニング

**Day 18-19: フィルタリング＆絞り込み**
- [ ] ファイルタイプフィルタ
- [ ] ディレクトリフィルタ
- [ ] 日付範囲フィルタ
- [ ] タグベースフィルタ

**Day 20-21: コンテキスト強化**
- [ ] 検索結果の前後コンテキスト取得
- [ ] 関連ファイル・セクションの特定
- [ ] 依存関係グラフの構築
- [ ] 参照情報の追跡

#### Week 4: 外部連携＆キャッシング

**Day 22-24: 外部システム連携**
- [ ] Git連携実装
  - コミット履歴検索
  - ブランチ情報取得
  - 差分検索
- [ ] GitHub API連携
  - Issue検索
  - PR検索
  - コードレビューコメント検索

**Day 25-26: キャッシング＆パフォーマンス最適化**
- [ ] クエリ結果のキャッシング
- [ ] Embeddingキャッシュ
- [ ] インデックスの最適化
- [ ] 並列検索の実装

**Day 27-28: エラーハンドリング＆ロギング**
- [ ] 包括的なエラーハンドリング
- [ ] ロギング機構実装
- [ ] メトリクス収集
- [ ] モニタリング機能

#### Week 5: 学習機能＆UI

**Day 29-30: フィードバック＆学習**
- [ ] 検索結果の評価機能
- [ ] フィードバックループ実装
- [ ] クエリ改善提案機能
- [ ] 検索パターン分析

**Day 31-32: CLI/API インターフェース**
- [ ] CLIツール実装
- [ ] RESTful API実装（Express）
- [ ] WebSocket サポート（リアルタイム検索）
- [ ] API ドキュメント生成（Swagger）

**Day 33-35: 統合テスト＆ドキュメント**
- [ ] 全機能の統合テスト
- [ ] パフォーマンステスト
- [ ] ユーザーガイド作成
- [ ] チュートリアル作成

### フェーズ3: 最適化＆本番準備（1週間）

#### Week 6: 最適化＆デプロイ準備

**Day 36-37: パフォーマンス最適化**
- [ ] プロファイリングとボトルネック特定
- [ ] メモリ使用量の最適化
- [ ] インデックスサイズの削減
- [ ] レスポンス時間の改善

**Day 38-39: セキュリティ強化**
- [ ] アクセス制御の実装
- [ ] 機密情報のフィルタリング
- [ ] セキュリティ監査
- [ ] 脆弱性スキャン

**Day 40-41: 本番環境準備**
- [ ] Docker化
- [ ] 環境変数管理
- [ ] CI/CDパイプライン構築
- [ ] デプロイメントスクリプト

**Day 42: 最終レビュー＆リリース**
- [ ] 最終コードレビュー
- [ ] ドキュメントの最終確認
- [ ] リリースノート作成
- [ ] バージョン1.0.0リリース

## 4. 実装詳細

### 4.1 LangGraph State定義

```typescript
// src/agents/knowledge-search/state.ts
import { Annotation } from "@langchain/langgraph";

export const KnowledgeSearchState = Annotation.Root({
  // 入力
  query: Annotation<string>,
  searchType: Annotation<'keyword' | 'semantic' | 'hybrid'>,
  sources: Annotation<string[]>,
  filters: Annotation<SearchFilters>,
  
  // 中間状態
  processedQuery: Annotation<ProcessedQuery>,
  searchStrategy: Annotation<SearchStrategy>,
  rawResults: Annotation<RawSearchResult[]>,
  
  // 出力
  results: Annotation<SearchResult>,
  
  // メタデータ
  metadata: Annotation<Record<string, any>>,
  errors: Annotation<Error[]>,
});

export type KnowledgeSearchStateType = typeof KnowledgeSearchState.State;
```

### 4.2 LangGraph グラフ定義

```typescript
// src/agents/knowledge-search/graph.ts
import { StateGraph, END } from "@langchain/langgraph";
import { KnowledgeSearchState } from "./state";
import { queryProcessorNode } from "./nodes/query-processor";
import { searchStrategyNode } from "./nodes/search-strategy";
import { retrieverNode } from "./nodes/retriever";
import { postProcessorNode } from "./nodes/post-processor";
import { formatterNode } from "./nodes/formatter";

export function createKnowledgeSearchGraph() {
  const workflow = new StateGraph(KnowledgeSearchState)
    // ノードの追加
    .addNode("query_processor", queryProcessorNode)
    .addNode("search_strategy", searchStrategyNode)
    .addNode("retriever", retrieverNode)
    .addNode("post_processor", postProcessorNode)
    .addNode("formatter", formatterNode)
    
    // エッジの定義
    .addEdge("__start__", "query_processor")
    .addEdge("query_processor", "search_strategy")
    .addEdge("search_strategy", "retriever")
    .addEdge("retriever", "post_processor")
    .addEdge("post_processor", "formatter")
    .addEdge("formatter", END);
  
  return workflow.compile();
}
```

### 4.3 各ノードの責務

#### Query Processor Node
```typescript
// src/agents/knowledge-search/nodes/query-processor.ts
export async function queryProcessorNode(
  state: KnowledgeSearchStateType
): Promise<Partial<KnowledgeSearchStateType>> {
  const { query, searchType } = state;
  
  // 1. クエリの正規化
  const normalizedQuery = normalizeQuery(query);
  
  // 2. クエリの拡張（同義語、関連語）
  const expandedTerms = await expandQuery(normalizedQuery);
  
  // 3. クエリの分類（コード検索 or ドキュメント検索）
  const queryType = classifyQuery(normalizedQuery);
  
  return {
    processedQuery: {
      original: query,
      normalized: normalizedQuery,
      expanded: expandedTerms,
      type: queryType,
    },
  };
}
```

#### Search Strategy Node
```typescript
// src/agents/knowledge-search/nodes/search-strategy.ts
export async function searchStrategyNode(
  state: KnowledgeSearchStateType
): Promise<Partial<KnowledgeSearchStateType>> {
  const { processedQuery, searchType, sources } = state;
  
  // 検索戦略の決定
  let strategy: SearchStrategy;
  
  if (searchType === 'hybrid') {
    strategy = {
      methods: ['keyword', 'semantic'],
      weights: { keyword: 0.3, semantic: 0.7 },
      sources: sources || ['code', 'docs', 'knowledge-base'],
    };
  } else {
    strategy = {
      methods: [searchType],
      weights: { [searchType]: 1.0 },
      sources: sources || ['code', 'docs'],
    };
  }
  
  return { searchStrategy: strategy };
}
```

#### Retriever Node
```typescript
// src/agents/knowledge-search/nodes/retriever.ts
export async function retrieverNode(
  state: KnowledgeSearchStateType
): Promise<Partial<KnowledgeSearchStateType>> {
  const { processedQuery, searchStrategy, filters } = state;
  
  const rawResults: RawSearchResult[] = [];
  
  // 各ソースから検索
  for (const source of searchStrategy.sources) {
    const retriever = getRetriever(source);
    const results = await retriever.search(
      processedQuery,
      searchStrategy,
      filters
    );
    rawResults.push(...results);
  }
  
  return { rawResults };
}
```

#### Post Processor Node
```typescript
// src/agents/knowledge-search/nodes/post-processor.ts
export async function postProcessorNode(
  state: KnowledgeSearchStateType
): Promise<Partial<KnowledgeSearchStateType>> {
  const { rawResults, searchStrategy } = state;
  
  // 1. スコアの正規化
  const normalized = normalizeScores(rawResults);
  
  // 2. 重み付けマージ（ハイブリッド検索の場合）
  const merged = mergeResults(normalized, searchStrategy.weights);
  
  // 3. リランキング
  const reranked = await rerankResults(merged);
  
  // 4. 重複排除
  const deduplicated = deduplicateResults(reranked);
  
  // 5. コンテキスト抽出
  const withContext = await extractContext(deduplicated);
  
  return { rawResults: withContext };
}
```

#### Formatter Node
```typescript
// src/agents/knowledge-search/nodes/formatter.ts
export async function formatterNode(
  state: KnowledgeSearchStateType
): Promise<Partial<KnowledgeSearchStateType>> {
  const { rawResults, filters } = state;
  
  // 検索結果の整形
  const formattedResults = rawResults.map(result => ({
    id: result.id,
    source: result.source,
    title: result.title,
    content: result.content,
    excerpt: generateExcerpt(result.content, result.highlights),
    score: result.score,
    location: result.location,
    context: result.context,
    metadata: result.metadata,
  }));
  
  // 上限適用
  const limited = formattedResults.slice(0, filters?.limit || 10);
  
  const searchResult: SearchResult = {
    results: limited,
    metadata: {
      totalCount: rawResults.length,
      searchTime: Date.now() - state.metadata.startTime,
      sources: [...new Set(rawResults.map(r => r.source))],
    },
  };
  
  return { results: searchResult };
}
```

### 4.4 Retriever実装例

#### Code Retriever
```typescript
// src/retrievers/code-retriever.ts
import { BaseRetriever } from "./base-retriever";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";

export class CodeRetriever extends BaseRetriever {
  async search(
    query: ProcessedQuery,
    strategy: SearchStrategy,
    filters?: SearchFilters
  ): Promise<RawSearchResult[]> {
    const results: RawSearchResult[] = [];
    
    // 1. コードファイルの取得
    const codeFiles = await this.getCodeFiles(filters);
    
    // 2. 各ファイルを解析
    for (const file of codeFiles) {
      const ast = this.parseFile(file);
      const symbols = this.extractSymbols(ast);
      
      // 3. クエリとマッチング
      for (const symbol of symbols) {
        const score = this.calculateScore(query, symbol);
        if (score > 0.5) {
          results.push({
            id: `${file.path}:${symbol.name}`,
            source: 'code',
            title: symbol.name,
            content: symbol.code,
            score,
            location: {
              filePath: file.path,
              lineNumber: symbol.line,
            },
            metadata: {
              type: symbol.type, // 'function' | 'class' | 'interface'
              language: file.language,
            },
          });
        }
      }
    }
    
    return results;
  }
  
  private parseFile(file: CodeFile) {
    return parser.parse(file.content, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
    });
  }
  
  private extractSymbols(ast: any): CodeSymbol[] {
    const symbols: CodeSymbol[] = [];
    
    traverse(ast, {
      FunctionDeclaration(path) {
        symbols.push({
          type: 'function',
          name: path.node.id.name,
          code: path.toString(),
          line: path.node.loc.start.line,
        });
      },
      ClassDeclaration(path) {
        symbols.push({
          type: 'class',
          name: path.node.id.name,
          code: path.toString(),
          line: path.node.loc.start.line,
        });
      },
      // ... その他のノードタイプ
    });
    
    return symbols;
  }
}
```

### 4.5 Vector Store実装

```typescript
// src/vectorstore/chroma-store.ts
import { ChromaClient } from "chromadb";
import { OpenAIEmbeddings } from "@langchain/openai";

export class ChromaVectorStore {
  private client: ChromaClient;
  private embeddings: OpenAIEmbeddings;
  private collectionName: string;
  
  constructor(collectionName: string = "knowledge-base") {
    this.client = new ChromaClient();
    this.embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-3-small",
    });
    this.collectionName = collectionName;
  }
  
  async addDocuments(documents: Document[]) {
    const collection = await this.client.getOrCreateCollection({
      name: this.collectionName,
    });
    
    const texts = documents.map(d => d.content);
    const embeddings = await this.embeddings.embedDocuments(texts);
    const ids = documents.map(d => d.id);
    const metadatas = documents.map(d => d.metadata);
    
    await collection.add({
      ids,
      embeddings,
      documents: texts,
      metadatas,
    });
  }
  
  async search(query: string, k: number = 10) {
    const collection = await this.client.getCollection({
      name: this.collectionName,
    });
    
    const queryEmbedding = await this.embeddings.embedQuery(query);
    
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: k,
    });
    
    return results;
  }
}
```

## 5. テスト戦略

### 5.1 ユニットテスト
- 各ノードの単体テスト
- Retrieverの単体テスト
- ユーティリティ関数のテスト

### 5.2 統合テスト
- LangGraphのエンドツーエンドテスト
- 複数Retrieverの統合テスト
- Agent間連携テスト

### 5.3 パフォーマンステスト
- 大規模データセットでの検索速度
- 並列検索のパフォーマンス
- メモリ使用量の計測

### 5.4 評価メトリクス
- Precision@K: 上位K件の精度
- Recall@K: 上位K件の再現率
- MRR (Mean Reciprocal Rank): 平均逆順位
- NDCG (Normalized Discounted Cumulative Gain): 正規化割引累積利得

## 6. マイルストーン

### Milestone 1: MVP完成（Week 2終了時）
- ✅ 基本的なドキュメント検索
- ✅ ベクトル検索
- ✅ コード検索（基本）
- ✅ LangGraph統合

### Milestone 2: 機能完成（Week 5終了時）
- ✅ ハイブリッド検索
- ✅ 外部連携（Git, GitHub）
- ✅ キャッシング
- ✅ CLI/API

### Milestone 3: 本番リリース（Week 6終了時）
- ✅ パフォーマンス最適化
- ✅ セキュリティ強化
- ✅ ドキュメント完備
- ✅ デプロイ準備完了

## 7. リスク管理

### 高リスク項目
1. **ベクトル検索の精度**
   - リスク: Embeddingモデルの選択ミスによる精度低下
   - 対策: 複数モデルの評価、ファインチューニングの検討

2. **大規模コードベースでのパフォーマンス**
   - リスク: インデックスサイズの肥大化、検索速度の低下
   - 対策: 段階的インデックス、キャッシング、並列化

3. **LangChain/LangGraphのバージョン依存**
   - リスク: API変更による動作不良
   - 対策: バージョン固定、継続的なアップデート対応

### 中リスク項目
1. **外部API（OpenAI）のコスト**
   - 対策: Embeddingキャッシュ、ローカルモデルの検討

2. **多様なファイル形式への対応**
   - 対策: 段階的対応、プラグイン機構の検討

## 8. 次のステップ

### 実装開始前の準備
1. [ ] 開発環境のセットアップ
2. [ ] テストデータの準備（サンプルコード、ドキュメント）
3. [ ] OpenAI APIキーの取得
4. [ ] プロジェクトリポジトリのセットアップ

### 実装開始
1. [ ] ディレクトリ構造の作成
2. [ ] package.jsonの更新
3. [ ] TypeScript設定
4. [ ] Day 1タスクの開始

## 9. 参考資料

### ドキュメント
- [LangChain Documentation](https://js.langchain.com/docs/)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraphjs/)
- [Chroma Documentation](https://docs.trychroma.com/)

### コード例
- LangChain Retrieval Examples
- RAG Implementation Patterns
- Multi-Query Retriever

### 論文・記事
- "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
- "Dense Passage Retrieval for Open-Domain Question Answering"
- "ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction over BERT"

---

**作成日**: 2025-10-16  
**バージョン**: 1.0  
**作成者**: Knowledge Search Agent Planning Team
