# 環境変数設定ガイド

このファイルは `.env` ファイルの設定例です。

## 必須設定

### OpenAI API キー

```bash
OPENAI_API_KEY=sk-your-api-key-here
```

OpenAI API キーは [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys) から取得できます。

## オプション設定

### 使用するモデルの指定

```bash
# デフォルト: gpt-4o-mini
OPENAI_MODEL=gpt-4o
# または
OPENAI_MODEL=gpt-4o-mini
# または
OPENAI_MODEL=gpt-4-turbo
```

### 温度設定（ランダム性の調整）

```bash
# デフォルト: 0（決定論的）
OPENAI_TEMPERATURE=0
# 0.0〜2.0の範囲で設定可能
```

### 最大トークン数

```bash
# デフォルト: 2048
OPENAI_MAX_TOKENS=4096
```

### ファイルパス設定

```bash
# デフォルト: ./specs
SPECS_DIR=./specs

# デフォルト: ./tasks
TASKS_DIR=./tasks
```

## セットアップ手順

### 方法 1: 手動作成

```bash
# .envファイルを作成
cat > .env << 'EOF'
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL=gpt-4o-mini
EOF
```

### 方法 2: コマンド実行

```bash
echo "OPENAI_API_KEY=your-api-key-here" > .env
echo "OPENAI_MODEL=gpt-4o-mini" >> .env
```

### 方法 3: エディタで作成

プロジェクトルートに `.env` ファイルを作成し、以下の内容をコピー：

```
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL=gpt-4o-mini
```

## 注意事項

- **セキュリティ**: `.env` ファイルには機密情報（API キー）が含まれるため、Git にコミットしないでください
- **`.gitignore`**: `.env` ファイルは既に `.gitignore` に含まれています
- **チーム共有**: チームメンバーとは、このドキュメント（ENV_SETUP.md）を共有し、各自で `.env` を作成してもらいます

## トラブルシューティング

### エラー: "OPENAI_API_KEY is not set"

→ `.env` ファイルが正しく作成されているか確認してください

```bash
# .envファイルの確認
cat .env
```

### エラー: "Invalid API key"

→ API キーが正しいか、[OpenAI ダッシュボード](https://platform.openai.com/api-keys)で確認してください

### エラー: "Model not found"

→ `OPENAI_MODEL` の値が正しいか確認してください。利用可能なモデル：

- `gpt-4o`
- `gpt-4o-mini`
- `gpt-4-turbo`
- `gpt-4`
- `gpt-3.5-turbo`
