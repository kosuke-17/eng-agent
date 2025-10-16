# RE-Architect Agent 実装計画

## プロジェクト概要

**目的**: 要求要件を漏れなく抽出し、矛盾を指摘し、検証可能な形でまとめた仕様書（spec-as-source）を生成・更新する AI エージェントシステムを構築する。

**アーキテクチャ**: LangGraph × LangChain による 2 エージェント体制

- **RequirementsAgent**: 要求要件の抽出・質問生成・仕様書更新
- **SpecToTasksAgent**: 仕様書から実装タスクへの分解

---

## Phase 1: プロジェクトセットアップ

### 1.1 依存パッケージのインストール

- [ ] `package.json`の依存関係を確認・更新
  - [ ] `@langchain/core`
  - [ ] `@langchain/openai`
  - [ ] `@langchain/langgraph`
  - [ ] TypeScript 関連パッケージ
  - [ ] その他必要なツール（zod, dotenv 等）
- [ ] `.env.example`ファイルの作成（API キー等の環境変数テンプレート）
- [ ] `.env`ファイルの作成（gitignore に追加済みか確認）

### 1.2 ディレクトリ構造の作成

- [ ] `src/`ディレクトリの作成
- [ ] `src/agents/`ディレクトリの作成
- [ ] `src/agents/requirements/`ディレクトリの作成
- [ ] `src/agents/spec_to_tasks/`ディレクトリの作成
- [ ] `src/lib/`ディレクトリの作成
- [ ] `specs/`ディレクトリの作成（生成物置き場）
- [ ] `tasks/`ディレクトリの作成（タスク出力置き場）

### 1.3 TypeScript 設定

- [ ] `tsconfig.json`の作成・設定
- [ ] ビルド設定の確認
- [ ] パス alias 設定（`@/`等）

---

## Phase 2: 共通ライブラリの実装

### 2.1 LLM クライアントの設定

- [ ] `src/lib/llm.ts`の作成
  - [ ] ChatOpenAI インスタンスの初期化
  - [ ] モデル選択（gpt-4 等）
  - [ ] 温度・トークン数などのパラメータ設定
  - [ ] bindTools 用のヘルパー関数

### 2.2 StateGraph ヘルパー

- [ ] `src/lib/graph.ts`の作成
  - [ ] StateGraph 作成のヘルパー関数
  - [ ] 共通エッジ定義
  - [ ] チェックポインタ設定（初期は MemorySaver）

### 2.3 共通型定義

- [ ] `src/types/index.ts`の作成
  - [ ] SpecDoc 型
  - [ ] OpenQuestion 型
  - [ ] 共通エラー型

---

## Phase 3: RequirementsAgent の実装

### 3.1 状態設計

- [ ] `src/agents/requirements/state.ts`の作成
  - [ ] REState 型の定義
  - [ ] Annotation 定義（LangGraph 用）
  - [ ] Reducer 関数（messages 配列の結合など）

### 3.2 システムプロンプトの準備

- [ ] `src/agents/requirements/prompts/`ディレクトリの作成
- [ ] `src/agents/requirements/prompts/system.txt`の作成
  - [ ] AGENTS.md からシステムプロンプトをコピー
  - [ ] テンプレート変数の整備
  - [ ] 例文の追加（必要に応じて）

### 3.3 ツールの実装

#### 3.3.1 ファイル I/O ツール

- [ ] `src/agents/requirements/tools/file_io.ts`の作成
  - [ ] `read_spec`: 仕様書ファイルの読み込み
  - [ ] `write_spec`: 仕様書ファイルの書き込み（atomic 操作）
  - [ ] `append_changelog`: 変更履歴の追記
  - [ ] エラーハンドリング

#### 3.3.2 ID 発番ツール

- [ ] `src/agents/requirements/tools/id_gen.ts`の作成
  - [ ] FR-XXX 形式の ID 生成
  - [ ] NFR-XXX 形式の ID 生成
  - [ ] AC-XXX 形式の ID 生成
  - [ ] R-XXX 形式の ID 生成
  - [ ] 既存 ID との重複チェック

#### 3.3.3 バリデーションツール

- [ ] `src/agents/requirements/tools/validate.ts`の作成
  - [ ] Markdown 見出し構造のチェック
  - [ ] ID 重複検出
  - [ ] FR↔AC 参照整合性チェック
  - [ ] 必須セクションの存在確認
  - [ ] バリデーション結果のレポート生成

### 3.4 ノードの実装

#### 3.4.1 summarize ノード

- [ ] `src/agents/requirements/nodes/summarize.ts`の作成
  - [ ] 現状の仕様書を読み込み
  - [ ] ユーザー入力と既存情報の統合
  - [ ] 判明している情報の要約生成
  - [ ] State 更新

#### 3.4.2 ask_clarify ノード

- [ ] `src/agents/requirements/nodes/ask_clarify.ts`の作成
  - [ ] 不足情報の検出
  - [ ] 矛盾点の抽出
  - [ ] 優先度付き質問リストの生成（最大 5 件）
  - [ ] OpenQuestions への追加
  - [ ] ユーザーへの質問提示

#### 3.4.3 merge_spec ノード

- [ ] `src/agents/requirements/nodes/merge_spec.ts`の作成
  - [ ] ユーザー回答の解析
  - [ ] 既存仕様書との差分計算
  - [ ] テンプレートに基づく仕様書更新
  - [ ] 変更履歴の記録
  - [ ] バリデーション実行

#### 3.4.4 decide_done ノード

- [ ] `src/agents/requirements/nodes/decide_done.ts`の作成
  - [ ] 終了条件のチェック
    - [ ] OpenQuestions が 0 件または低優先度のみ
    - [ ] 全 FR に対応する AC が存在
    - [ ] NFR セクションに未記入なし
    - [ ] 矛盾の解消
  - [ ] decided フラグの設定
  - [ ] 次ノードへのルーティング判定

### 3.5 グラフの構築

- [ ] `src/agents/requirements/index.ts`の作成
  - [ ] StateGraph の定義
  - [ ] ノードの登録
  - [ ] エッジの定義（summarize → ask_clarify → merge_spec → decide_done）
  - [ ] 条件分岐エッジ（decide_done → END or ask_clarify）
  - [ ] チェックポインタの設定
  - [ ] コンパイル & エクスポート

### 3.6 テスト実装

- [ ] `src/agents/requirements/__tests__/`ディレクトリの作成
- [ ] ツールのユニットテスト
- [ ] ノードのユニットテスト
- [ ] エンドツーエンドテスト（簡易シナリオ）

---

## Phase 4: SpecToTasksAgent の実装

### 4.1 状態設計

- [ ] `src/agents/spec_to_tasks/state.ts`の作成
  - [ ] TasksState 型の定義
  - [ ] Task/Epic/Story 型の定義
  - [ ] Annotation 定義

### 4.2 ツールの実装

- [ ] `src/agents/spec_to_tasks/tools/work_item_io.ts`の作成
  - [ ] タスクファイルの読み書き
  - [ ] タスク ID 発番
  - [ ] トレーサビリティ情報の記録（FR/AC → Task 紐付け）

### 4.3 ノードの実装

#### 4.3.1 read_spec ノード

- [ ] `src/agents/spec_to_tasks/nodes/read_spec.ts`の作成
  - [ ] 仕様書ファイルの読み込み
  - [ ] FR/NFR/AC の抽出
  - [ ] パース処理

#### 4.3.2 derive_tasks ノード

- [ ] `src/agents/spec_to_tasks/nodes/derive_tasks.ts`の作成
  - [ ] FR から Epic/Story への分解
  - [ ] NFR から技術タスクの抽出
  - [ ] AC からテストタスクの導出
  - [ ] タスク優先度の設定
  - [ ] 依存関係の設定

#### 4.3.3 estimate ノード

- [ ] `src/agents/spec_to_tasks/nodes/estimate.ts`の作成
  - [ ] タスクサイズの見積もり（S/M/L/XL）
  - [ ] ストーリーポイントの算出（オプション）
  - [ ] 実装順序の提案

#### 4.3.4 export ノード

- [ ] `src/agents/spec_to_tasks/nodes/export.ts`の作成
  - [ ] Markdown フォーマットでの出力
  - [ ] トレーサビリティ表の生成
  - [ ] `tasks/`ディレクトリへの保存

### 4.4 グラフの構築

- [ ] `src/agents/spec_to_tasks/index.ts`の作成
  - [ ] StateGraph の定義
  - [ ] ノード・エッジの登録
  - [ ] コンパイル & エクスポート

### 4.5 テスト実装

- [ ] ツール・ノードのユニットテスト
- [ ] エンドツーエンドテスト

---

## Phase 5: 統合とエントリポイント

### 5.1 CLI インターフェース

- [ ] `src/cli.ts`の作成
  - [ ] コマンドラインパーサー（commander 等）
  - [ ] `requirements`サブコマンド
  - [ ] `tasks`サブコマンド
  - [ ] インタラクティブモード（質問 → 回答 → 更新のループ）
  - [ ] バッチモード（既存入力ファイルから一括生成）

### 5.2 実行スクリプト

- [ ] `package.json`にスクリプト追加
  - [ ] `npm run agent:requirements` - RequirementsAgent の実行
  - [ ] `npm run agent:tasks` - SpecToTasksAgent の実行
  - [ ] `npm run agent:full` - フルフロー実行
  - [ ] `npm run build` - ビルド
  - [ ] `npm run test` - テスト実行

### 5.3 サンプルファイルの作成

- [ ] `specs/example_input.md` - サンプル入力
- [ ] `specs/example_output.md` - サンプル出力
- [ ] README.md の更新（使い方・サンプル実行方法）

---

## Phase 6: 高度な機能（優先度中）

### 6.1 Diff 最小化

- [ ] 仕様書の差分検出機能
- [ ] パッチ形式での更新
- [ ] 変更箇所のハイライト

### 6.2 厳格バリデーション強化

- [ ] 見出し必須チェック
- [ ] ID 重複検出の強化
- [ ] AC↔FR 参照整合性の厳密チェック
- [ ] NFR 空欄検出
- [ ] カスタムルールの追加機能

### 6.3 評価・メトリクス

- [ ] 仕様書の完成度スコア算出
  - [ ] OpenQuestions 数
  - [ ] AC 網羅率
  - [ ] NFR 充足率
- [ ] レビュー推奨度の判定
- [ ] メトリクスレポート出力

### 6.4 永続チェックポインタ

- [ ] SQLite ベースのチェックポインタ実装
- [ ] thread_id 管理
- [ ] 履歴の永続化
- [ ] セッション復旧機能

---

## Phase 7: 拡張機能（優先度低・将来対応）

### 7.1 外部連携（GitHub/Jira）

- [ ] GitHub Issues 作成 API 連携
- [ ] Jira 作成 API 連携
- [ ] `work_item_io.ts`の差し替え実装
- [ ] 認証・権限管理

### 7.2 Web インターフェース（Next.js）

- [ ] Next.js プロジェクトのセットアップ
- [ ] Route Handler 実装
- [ ] Server Actions 実装
- [ ] フロントエンド UI（質問フォーム、仕様書プレビュー）
- [ ] thread_id とセッション ID の紐付け

### 7.3 通知機能

- [ ] OpenQuestions の期限アラート
- [ ] 仕様書更新通知
- [ ] Slack/Discord 連携

### 7.4 AI 機能の拡張

- [ ] マルチモデル対応（Claude、Gemini 等）
- [ ] RAG 機能（過去の仕様書からの学習）
- [ ] 自動テストケース生成

---

## マイルストーン

### M1: MVP（Minimum Viable Product）

**目標**: 基本的な要求要件定義書の生成が可能

- Phase 1-3 完了
- CLI で基本実行可能
- **期限**: [設定してください]

### M2: フルフロー対応

**目標**: 仕様書からタスク分解まで一貫して実行可能

- Phase 4-5 完了
- 両エージェント連携動作
- **期限**: [設定してください]

### M3: プロダクション準備

**目標**: 実用レベルの品質と機能

- Phase 6 完了
- テストカバレッジ 80%以上
- ドキュメント整備
- **期限**: [設定してください]

### M4: 拡張機能

**目標**: 外部連携・UI 提供

- Phase 7（一部または全部）
- **期限**: [設定してください]

---

## 注意事項・制約

### 今回は対応しない項目

- ❌ Next.js 組込み（Phase 7）
- ❌ GitHub/Jira API 連携（Phase 7）
- ❌ Web インターフェース（Phase 7）

### 技術選定

- **言語**: TypeScript
- **AI フレームワーク**: LangChain + LangGraph
- **LLM**: OpenAI GPT-4（または指定モデル）
- **永続化**: 初期はファイルベース → 将来 SQLite/Redis
- **テスト**: Jest（または Vitest）

### 品質基準

- [ ] 全ツール・ノードにユニットテスト
- [ ] エンドツーエンドテストシナリオ
- [ ] TypeScript strict mode 有効
- [ ] ESLint/Prettier 設定
- [ ] エラーハンドリングの徹底

---

## 進捗管理

- [ ] Phase 1 完了
- [ ] Phase 2 完了
- [ ] Phase 3 完了
- [ ] Phase 4 完了
- [ ] Phase 5 完了
- [ ] Phase 6 完了
- [ ] Phase 7 完了

**最終更新**: 2025-10-16
