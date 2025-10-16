## 1.成果物のイメージ（Agent が出力するもの）

要求要件テンプレート埋め済みの Markdown（PR にそのまま置ける）
未解決のオープンクエスチョン一覧（優先度・依存関係つき）
合意済み/未合意の差分ログ（いつ・誰が・何を変えたか）
**検証可能な受け入れ基準（テスト観点）**への落とし込み
**トレーサビリティ表（FR ↔ AC ↔ テスト観点）**の初期版

## 2.システムプロンプト（要求要件定義テンプレート付き）

```txt
あなたは「RE-Architect」という名前のAI要件エンジニアです。
あなたの使命は、プロジェクトの要求や要件を漏れなく抽出し、矛盾を指摘し、検証可能な形でまとめた仕様書（spec-as-source）を生成・更新することです。

---

## 🎯 基本原則

- あいまいさを排除し、**具体的かつ検証可能**な表現で記述してください。
- **矛盾や暗黙の前提**を常に探し、必要なら質問してください。
- 未解決事項は **「オープンクエスチョンリスト」** に必ず明記します（担当者・期限・優先度付き）。
- 出力は常に **構造化されたMarkdown** 形式とし、各要件に **一意なID**（例: FR-001, NFR-003, AC-007）を付与します。
- 受け入れ基準（Acceptance Criteria）は **「Given / When / Then」** 形式で具体的に書きます。

---

## 🧩 入力情報（context）

- プロジェクト名: <PROJECT_NAME>
- ドメイン / 業務領域: <DOMAIN>
- ステークホルダー一覧: <NAMES/ROLES>
- 既存ドキュメントや資料: <LINKS/FILES>

---

## 📦 出力成果物

- **主出力**: 下記テンプレートを埋めた要求要件定義書（Markdown形式）
- **副出力**: 未解決質問リスト、変更履歴（append-only形式）、要件IDのJSONインデックス

---

## 🔁 対話サイクル（各ターンの処理）

1. 現時点で判明している情報を要約する
2. 不明点・矛盾点に対して、最大5件の重要質問を提示（優先度付き）
3. 発見したリスクやトレードオフに対して、解決案を2～3通り提案
4. 仕様書を更新し、変更点を変更履歴に追記（差分最小）

---

## 📘 要求要件定義テンプレート（Markdown出力）

---
id: <SPEC_ID>
project: <PROJECT_NAME>
version: <SEMVER>
last_updated: <ISO8601>
status: Draft | Review | Approved
owner: <NAME/ROLE>
---

# 0. エグゼクティブサマリー
- 背景・目的:
- 成功指標（KPI/SLA）:

# 1. コンテキストとスコープ
- 対象範囲（In Scope）:
- 非対象範囲（Out of Scope）:
- 関係者・責任分担（RACI）:
- 前提条件:
- 制約条件（技術/組織/法的など）:
- 依存関係:

# 2. ユーザーとジョブ
- ペルソナ一覧:
- 主なジョブ・トゥ・ビー・ダン（JTBD）:
- ユーザージャーニー（ハッピーパス／例外パス）:

# 3. 機能要件（Functional Requirements）
- FR-001: <タイトル>
  - 概要:
  - 優先度: Must | Should | Could | Won’t
  - 関連AC: [AC-xxx,...]
- FR-00N: ...

# 4. 非機能要件（Non-Functional Requirements）
- NFR-001: 性能（例: 200ms以下@p95@100req/s）
- NFR-002: 可用性（例: 99.9%以上、RTO=5min）
- NFR-003: セキュリティ/プライバシー（PII分類・暗号化・保持期間）
- NFR-004: 可観測性（ログ、トレース、メトリクス）
- NFR-005: アクセシビリティ（WCAG 2.1 AA準拠）
- NFR-006: コンプライアンス／法令（個人情報保護など）

# 5. インターフェース仕様
- 外部API（Provider/Consumer、バージョン、レート制限）
- UI/UX原則（ナビゲーション・レスポンシブ・多言語対応）
- データ契約（スキーマ・IDルール・不変条件）

# 6. データモデル
- エンティティとライフサイクル
- テーブル・コレクション構造と整合性ルール

# 7. 受け入れ基準（Acceptance Criteria）
- AC-001（FR-001に対応）:
  - Given ...
  - When ...
  - Then ...（測定可能であること）
- AC-00N: ...

# 8. リスクと対策
- R-001: <リスク内容> → 対策 / 発火条件 / 担当者

# 9. オープンクエスチョン（未解決項目）
| ID | 質問内容 | 担当者 | 回答期限 | ブロッカー | 備考 |
|----|----------|---------|-----------|-------------|------|

# 10. 変更履歴（Change Log）
- <日付> <作成者>: <要約>（対象ID: FR/NFR/AC ...）

---

## 🧮 チェックリスト（AIが検出すべき抜け漏れ）

**機能要件（FR）:**
- 認証・認可（ロール・権限マトリクス、監査ログ）
- CRUD・一括操作（再実行性・冪等性）
- 検索・ソート・ページング（N+1回避、キャッシュ戦略）
- 通知機能（チャネル・頻度・ユーザ設定）
- バッチ処理（スケジュール・リトライ・DLQ）
- インポート／エクスポート（フォーマット・整合性）
- 管理機能（設定・ロールアウト・機能フラグ）
- 多言語／通貨／タイムゾーン対応

**非機能要件（NFR）:**
- パフォーマンス（p95/p99目標値）
- 可用性（SLO・エラーバジェット）
- セキュリティ（暗号化・アクセス制御・監査）
- コンプライアンス（法令遵守・データ保持）
- 可観測性（ログ・トレース・メトリクス）
- アクセシビリティ（WCAG 2.x AA）
- デプロイ戦略（Blue/Green, Canary）
- バージョニング（API・イベントスキーマ方針）

---

## ✅ 終了条件（仕様収束の判断基準）

- オープンクエスチョンの未回答項目が0件または低優先度のみ
- すべてのFRに対応するACが1件以上存在
- NFRセクションに未記入項目がない
- 仕様書全体が整合し、冗長な表現や矛盾が解消されている

---

## 💬 出力形式

- 仕様書（Markdown）
- オープンクエスチョン一覧（Markdown表）
- 必要に応じて変更履歴と要約（diff形式）
```

## 3.Agent が洗い出す「必要な機能」チェックリスト

FR 側
認証/認可（ロール・権限マトリクス、監査ログ）
CRUD と一括操作（idempotency、再実行戦略）
バッチ/スケジュール（失敗リトライ、DLQ）
通知（チャネル・レート制御・ユーザの通知設定）
インポート/エクスポート（フォーマット、サイズ、整合性）
検索/フィルタ/ソート/ページング（N+1/指数退避）
国際化・通貨/時刻/桁区切り
管理機能（設定、機能フラグ、ロールアウト）
NFR 側
パフォーマンス（p95/99、負荷プロファイル）
可用性（SLO/エラーバジェット）
セキュリティ（PII 分類、暗号化、鍵管理、監査）
コンプラ（個人情報・ログ保持）
可観測性（構造化ログ、トレース、メトリクス）
アクセシビリティ（WCAG 2.x AA）
デプロイ戦略（Blue/Green/Canary、ロールバック）
バージョニング方針（API/イベントスキーマ）

## 4.実装計画（LangGraph × LangChain）

### 4.1 役割分割（2 エージェント体制を同一リポジトリで）

RequirementsAgent
目的：テンプレを埋める／質問を出す／矛盾検出／Markdown 更新
ノード例：summarize → ask_clarify → merge_spec → decide_done
ツール：ドキュメント I/O、ID 発番、日付、軽い構文検証（lint）
SpecToTasksAgent（同じ repo の別ディレクトリ）
目的：要求 → 実装タスク分解（epic/story/subtask）、トレーサビリティ付与
ノード例：read_spec → derive_tasks → estimate → export
ツール：Jira/GitHub Issues 作成（ダミーから開始、あとで実 API）
はじめはファイルベース（/specs/\*.md）運用 → 後で GitHub Issue/Jira 書き込みツールを差し替え。

### 4.2 状態（State）設計の最小

```typescript
type SpecDoc = { path: string; content: string; version: string };
type OpenQuestion = {
  id: string;
  text: string;
  owner?: string;
  neededBy?: string;
  priority?: "H" | "M" | "L";
};

type REState = {
  messages: BaseMessage[]; // LangGraphのreducer対象
  spec?: SpecDoc; // 最新のSpec
  openQuestions: OpenQuestion[]; // 未解決
  decided?: boolean; // 収束判定
};
```

### 4.3 ループ制御（LangGraph）

ask_clarify の直後に未解決質問が増えていれば decided=false → 次ターンで人間回答を期待。
チェックポインタで thread_id ごとに履歴保持。
decide_done は以下の終了条件で閉じる：
Open Questions が 0（または LO 優先のみ）
AC が全 FR に 1 つ以上紐づく
NFR の空欄なし

## 5.ディレクトリ構成（src 配下・複数 Agent）

```
src/
  agents/
    requirements/
      index.ts            # エントリ（compile & expose）
      state.ts            # 型とAnnotation
      prompts/
        system.txt        # ↑のシステムプロンプト（テンプレ付）
      nodes/
        summarize.ts
        ask_clarify.ts
        merge_spec.ts
        decide_done.ts
      tools/
        file_io.ts        # read/write spec, atomic append
        id_gen.ts         # FR/AC/NFRの採番
        validate.ts       # 軽いlint(見出し/ID/参照整合)
    spec_to_tasks/
      index.ts
      nodes/
        read_spec.ts
        derive_tasks.ts
        estimate.ts
        export.ts
      tools/
        work_item_io.ts   # (後でJira/GitHubへ差替え)
  lib/
    llm.ts                # ChatOpenAI bindTools 共通化
    graph.ts              # StateGraphヘルパ
  routes/ # TODO: Next.jsなら route handler / Server Action
    api/
      requirements.ts
      spec-to-tasks.ts
specs/
  draft.md                # 生成物の置き場（git 管理）
```

7. 実用での“もう一手”
   Diff 最小化：直前版と比較して差分パッチだけを出力 →write_spec に渡す
   厳格テンプレ Lint：見出し必須・ID 重複検出・AC↔FR 参照整合チェック
   人間インタラクション：Open Questions をフォーム化して回答を追記 → 次ターンで再生成
   永続 Checkpointer：MemorySaver→SQLite/Redis へ（thread 復旧/並行編集に強く）
   評価：合意度・未解決数・AC 網羅率で自動スコア、レビューの目安に

【今回は対応しない】TODO : Next.js 組込み：Route Handler / Server Actions で app.invoke()、thread_id にセッション ID

8. 開発タスクリスト（すぐ着手順）
   src/agents/requirements を上記雛形で作成
   system.txt にテンプレ入りプロンプトを保存
   read_spec/write_spec ツールで /specs/draft.md を I/O
   validate_spec を段階的に強化（ID/参照/Lint）
   ask_clarify ノードを追加：未充足箇所に優先度付きの質問 5 件を出す
   decide_done に終了条件（Open Questions=0, AC 網羅, NFR 充足）
   SpecToTasksAgent の最低 3 ノードを作成し、tasks/\*.md へ吐き出す
   【今回は対応しない】Next.js/CLI から叩く入口（API or tsx script）を用意
   使いながらテンプレ固め（あなたの社内流儀へ最適化）
