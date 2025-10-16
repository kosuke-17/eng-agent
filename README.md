# RE-Architect: AI 要件エンジニアリングエージェント

**プロジェクトの要求や要件を漏れなく抽出し、矛盾を指摘し、検証可能な形でまとめた仕様書（spec-as-source）を生成・更新する AI エージェントシステム**

---

## 🎉 MVP 完成！

**✅ 基本的なエージェントシステムが完成しました**

現在、以下の機能が実装済みで、すぐに使用可能な状態です：

- ✅ RequirementsAgent: 要求要件の抽出と仕様書生成
- ✅ SpecToTasksAgent: 仕様書からタスクへの分解
- ✅ CLI: コマンドラインでの操作が可能
- ✅ インタラクティブモード: 質問に答えながら仕様書を改善
- ✅ サンプルファイル: すぐに試用可能な入出力例

---

## 🎯 プロジェクト概要

RE-Architect（Requirements Engineering Architect）は、LangGraph × LangChain を活用した 2 エージェント体制のシステムです。

### 主要エージェント

1. **RequirementsAgent（要求要件定義エージェント）**

   - 要求要件の抽出と質問生成
   - 矛盾・抜け漏れの検出
   - 構造化された仕様書の生成・更新
   - オープンクエスチョンの管理

2. **SpecToTasksAgent（タスク分解エージェント）**
   - 仕様書から実装タスクへの分解
   - Epic/Story/Subtask の生成
   - トレーサビリティ情報の付与
   - 見積もりと優先順位付け

## ✨ 主な機能

### 要求要件定義の自動化

- ✅ **構造化 Markdown 形式**の仕様書生成（PR にそのまま配置可能）
- ✅ **一意な ID**（FR-XXX, NFR-XXX, AC-XXX）の自動採番
- ✅ **Given/When/Then 形式**の受け入れ基準（Acceptance Criteria）
- ✅ 優先度・依存関係付きの**オープンクエスチョン**管理
- ✅ 変更履歴の自動記録（append-only 形式）
- ✅ **トレーサビリティ表**（FR ↔ AC ↔ テスト観点）

### 抜け漏れチェック機能

システムが自動的に以下の観点をチェックし、不足があれば質問を生成します：

**機能要件（FR）:**

- 認証・認可（ロール・権限マトリクス、監査ログ）
- CRUD・一括操作（再実行性・冪等性）
- 検索・ソート・ページング（N+1 回避、キャッシュ戦略）
- 通知機能（チャネル・頻度・ユーザ設定）
- バッチ処理（スケジュール・リトライ・DLQ）
- インポート／エクスポート（フォーマット・整合性）
- 管理機能（設定・ロールアウト・機能フラグ）
- 多言語／通貨／タイムゾーン対応

**非機能要件（NFR）:**

- パフォーマンス（p95/p99 目標値）
- 可用性（SLO・エラーバジェット）
- セキュリティ（暗号化・アクセス制御・監査）
- コンプライアンス（法令遵守・データ保持）
- 可観測性（ログ・トレース・メトリクス）
- アクセシビリティ（WCAG 2.x AA）
- デプロイ戦略（Blue/Green, Canary）
- バージョニング（API・イベントスキーマ方針）

### 対話型の仕様書改善サイクル

```
1. 現時点で判明している情報を要約
2. 不明点・矛盾点に対して、最大5件の重要質問を提示（優先度付き）
3. リスクやトレードオフに対して、解決案を2～3通り提案
4. 仕様書を更新し、変更点を変更履歴に追記（差分最小）
```

## 🏗️ アーキテクチャ

### 技術スタック

- **言語**: TypeScript
- **AI フレームワーク**: LangChain + LangGraph
- **LLM**: OpenAI GPT-4（または指定モデル）
- **永続化**: ファイルベース（将来的に SQLite/Redis 対応予定）
- **テスト**: Jest / Vitest

### システム構成

```
RequirementsAgent のフロー:
summarize → ask_clarify → merge_spec → decide_done
    ↑                                        |
    |__________ (未完了の場合) _______________|

SpecToTasksAgent のフロー:
read_spec → derive_tasks → estimate → export
```

## 📁 プロジェクト構成

```
src/
  agents/
    requirements/          # 要求要件定義エージェント
      index.ts
      state.ts
      prompts/
        system.txt        # システムプロンプト
      nodes/              # グラフノード
        summarize.ts
        ask_clarify.ts
        merge_spec.ts
        decide_done.ts
      tools/              # ツール実装
        file_io.ts
        id_gen.ts
        validate.ts
    spec_to_tasks/        # タスク分解エージェント
      index.ts
      nodes/
      tools/
  lib/                    # 共通ライブラリ
    llm.ts
    graph.ts
  types/                  # 型定義
specs/                    # 生成された仕様書
tasks/                    # 生成されたタスク
```

## 🚀 セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env`ファイルを作成し、OpenAI API キーを設定します：

```bash
# .envファイルを作成
echo "OPENAI_API_KEY=your_api_key_here" > .env

# オプション: 使用するモデルを指定（デフォルト: gpt-4o-mini）
# echo "OPENAI_MODEL=gpt-4o" >> .env
```

詳細な環境変数設定については [ENV_SETUP.md](./ENV_SETUP.md) を参照してください。

### 3. ビルド

```bash
npm run build
```

### 4. 初期化（オプション）

サンプルファイルを確認したい場合：

```bash
npm run agent:init
```

これにより`specs/example_input.md`などのサンプルファイルが生成されます。

---

## 💻 使用方法

### Requirements Agent（要求要件定義）

#### インタラクティブモード（推奨）

```bash
npm run agent:requirements
```

対話形式で要件を入力し、エージェントが質問しながら仕様書を完成させます。

**オプション：**

```bash
# 入力ファイルを指定
npm run agent:requirements -- -i specs/example_input.md

# 出力先を指定
npm run agent:requirements -- -o specs/my_spec.md

# スレッドIDを指定して前回の続きから
npm run agent:requirements -- --thread-id thread_123456
```

#### バッチモード

```bash
npm run agent:requirements -- -i specs/example_input.md --mode batch
```

入力ファイルから一括で仕様書を生成します（対話なし）。

---

### SpecToTasks Agent（タスク分解）

```bash
npm run agent:tasks
```

生成された仕様書（`specs/draft.md`）から実装タスクを自動生成します。

**オプション：**

```bash
# 入力する仕様書を指定
npm run agent:tasks -- -i specs/my_spec.md

# タスクの出力先を指定
npm run agent:tasks -- -o tasks/my_tasks/
```

---

### フルフロー実行

```bash
npm run agent:full -- -i specs/example_input.md
```

要求要件定義からタスク分解まで一貫して実行します。

---

## 📖 使用例

### 基本的なワークフロー

```bash
# 1. プロジェクトを初期化
npm run agent:init

# 2. 環境変数を設定（.envにOPENAI_API_KEYを追加）

# 3. サンプル入力から仕様書を生成
npm run agent:requirements -- -i specs/example_input.md

# 4. インタラクティブモードでエージェントと対話
# エージェントの質問に答えながら仕様書を改善

# 5. 仕様書が完成したらタスクを生成
npm run agent:tasks

# 6. 生成されたファイルを確認
# - specs/draft.md：要求要件定義書
# - tasks/：実装タスク一覧
```

### カスタムプロジェクトの場合

```bash
# 1. 要件ファイルを作成
cat > specs/my_project_input.md << 'EOF'
# プロジェクト要件

## プロジェクト名
...（あなたのプロジェクトの内容）
EOF

# 2. インタラクティブモードで仕様書を作成
npm run agent:requirements -- -i specs/my_project_input.md -o specs/my_project.md

# 3. タスクを生成
npm run agent:tasks -- -i specs/my_project.md -o tasks/my_project/
```

## 📋 開発ロードマップ

詳細な実装計画は [TODO.md](./TODO.md) を参照してください。

### マイルストーン

- **M1: MVP** - 基本的な要求要件定義書の生成が可能
- **M2: フルフロー対応** - 仕様書からタスク分解まで一貫して実行可能
- **M3: プロダクション準備** - 実用レベルの品質と機能
- **M4: 拡張機能** - 外部連携・UI 提供（GitHub/Jira 連携、Next.js UI）

### 現在の開発フェーズ

- [x] 設計完了（AGENTS.md）
- [x] 実装計画作成（TODO.md）
- [x] Phase 1: プロジェクトセットアップ ✅
- [x] Phase 2: 共通ライブラリの実装 ✅
- [x] Phase 3: RequirementsAgent の実装 ✅（テスト以外）
- [x] Phase 4: SpecToTasksAgent の実装 ✅（テスト以外）
- [x] Phase 5: 統合とエントリポイント ✅
- [ ] Phase 6: 高度な機能（次のステップ）

**🎉 MVP 完成！** エージェントが動作可能な状態になりました。

## 📚 関連ドキュメント

- [AGENTS.md](./AGENTS.md) - エージェントの詳細設計・システムプロンプト
- [TODO.md](./TODO.md) - 実装計画とタスクリスト

---

## 🔮 将来の展望：エンジニアリング AI エージェント群

RE-Architect は、エンジニアリングワークフロー全体をカバーする AI エージェント群の第一歩です。

### 計画中のエージェント

#### 要求要件定義 Agent ✅（現在開発中）

- RE-Architect（本プロジェクト）

#### システムデザイン Agent（予定）

- アーキテクチャ設計の提案
- システム構成図の生成
- 技術選定の支援

#### 実行計画(タスク)作成 Agent ✅（現在開発中）

- SpecToTasksAgent（本プロジェクトに含まれる）

#### 実装 Agent（予定）

- コード生成
- リファクタリング提案
- コードレビュー支援

#### QA Agent（予定）

- テストケース生成
- テスト自動化
- 品質メトリクス分析

## まずは以下の本を見ながらインプット

- 現場で活用するための AI エージェント実践入門 (KS 情報科学専門書)

### ツールについて

tool にはレストラン予約や飛行機予約などの高レイヤーな行動、ボタンクリックや画面繊維などの低レイヤーな行動がある

- took の粒度や汎用性が様々であるということ

- 高レイヤー

  - 汎用性が低い
  - 組み合わせが単純化されるため、タスク達成率が上がる

- 低レイヤー
  - 汎用性が高い
  - 組み合わせが複雑になり、タスク達成率が下がる

人間が道具を使う時の認知プロセスを参考にする

- 手続き的記憶
  - 道具を利用するための技術的な推論
  - 魚のおろし方、出刃包丁の使い方など
- 宣言的記憶

  - 事実や出来事を言葉で説明する知識
  - 出刃包丁は魚の太い骨などを断ち切る際に使用する刃物

- osiurak and heinke: looking for intoolligence

  - この論文で intoolligence が定義されている

### 計画(Planning)について

問題解決のために 2 つの計画に分類して、計画を進める

- タスク計画

  - 大きな問題を小さな問題に分割する方針だて
  - 問題解決までの道のりが長い場合は、サブゴールという中間ポイントを設ける
  - サブタスクを独立して対処できるように別タスクとして扱う

- 行動計画
  - タスクを解決するまでの実行可能な一連のステップ
  - AIP 呼び出し、ボタン操作、移動など
  - ステップ間の依存関係の考慮が必要か
    - 例:カレーを作るときに鍋に水を入れ、煮込むという順序が必ずある
  - ステップの実行途中で行動計画の変更が必要か
    - 計画を進めて柔軟に変更することが求められる場合がある
    - 将棋は次に指す手を相手が指した後に考える必要がある
  - 実行可能な手順に必要な制約条件はあるか
    - 旅行計画を立てる時に、ホテルの予算やグレード、行きたい先が決まっているのであれば、その条件に合う計画を考える必要がある
