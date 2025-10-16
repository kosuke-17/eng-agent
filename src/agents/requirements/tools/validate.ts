import type { RequirementId, ValidationIssue, ValidationResult } from "@/types";

const REQUIRED_SECTION_HEADINGS = [
  "# 0. エグゼクティブサマリー",
  "# 1. コンテキストとスコープ",
  "# 2. ユーザーとジョブ",
  "# 3. 機能要件（Functional Requirements）",
  "# 4. 非機能要件（Non-Functional Requirements）",
  "# 5. インターフェース仕様",
  "# 6. データモデル",
  "# 7. 受け入れ基準（Acceptance Criteria）",
  "# 8. リスクと対策",
  "# 9. オープンクエスチョン（未解決項目）",
  "# 10. 変更履歴（Change Log）",
];

const FRONT_MATTER_BOUNDARY = /^---$/m;

const REQUIRED_FRONT_MATTER_KEYS = [
  "id",
  "project",
  "version",
  "last_updated",
  "status",
  "owner",
];

const hasFrontMatter = (content: string) => {
  const matches = content.match(FRONT_MATTER_BOUNDARY);
  return matches !== null && matches.length >= 2;
};

const checkFrontMatter = (content: string, issues: ValidationIssue[]) => {
  if (!hasFrontMatter(content)) {
    issues.push({
      severity: "error",
      message: "Front matter が見つかりません。`---` で囲まれたメタ情報を先頭に追加してください。",
      section: "front_matter",
    });
    return;
  }
  const [, frontMatter] = content.split(FRONT_MATTER_BOUNDARY);
  for (const key of REQUIRED_FRONT_MATTER_KEYS) {
    const pattern = new RegExp(`^${key}:\\s*.+$`, "m");
    if (!pattern.test(frontMatter)) {
      issues.push({
        severity: "warning",
        message: `front matter に \`${key}\` が定義されていません。`,
        section: "front_matter",
      });
    }
  }
};

const checkSections = (content: string, issues: ValidationIssue[]) => {
  for (const heading of REQUIRED_SECTION_HEADINGS) {
    if (!content.includes(heading)) {
      issues.push({
        severity: "error",
        message: `必須セクション \`${heading}\` が見つかりません。`,
        section: "structure",
      });
    }
  }
};

const checkDuplicateIds = (content: string, issues: ValidationIssue[]) => {
  const matches = Array.from(
    content.matchAll(/\b(FR|NFR|AC|R)-(\d{3})\b/g)
  ).map((match) => match[0] as RequirementId);
  const counts = new Map<RequirementId, number>();
  for (const id of matches) {
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  for (const [id, count] of counts.entries()) {
    if (count > 1) {
      issues.push({
        severity: "error",
        message: `要件ID \`${id}\` が重複しています。`,
        referenceId: id,
        section: "ids",
      });
    }
  }
};

const checkAcceptanceCoverage = (content: string, issues: ValidationIssue[]) => {
  const frMatches = Array.from(content.matchAll(/\b(FR-\d{3})\b/g)).map((m) => m[1]);
  const acMatches = Array.from(content.matchAll(/\b(AC-\d{3})\b/g)).map((m) => m[1]);
  const referencedByAc = new Set<string>();
  const acToFr = Array.from(content.matchAll(/AC-\d{3}（(FR-\d{3})に対応）/g));
  for (const match of acToFr) {
    referencedByAc.add(match[1]);
  }

  for (const fr of frMatches) {
    if (!referencedByAc.has(fr)) {
      issues.push({
        severity: "warning",
        message: `機能要件 ${fr} に紐づく受け入れ基準が見つかりません。`,
        referenceId: fr as RequirementId,
        section: "acceptance",
      });
    }
  }

  if (acMatches.length === 0 && frMatches.length > 0) {
    issues.push({
      severity: "warning",
      message: "少なくとも1件の受け入れ基準（AC）が必要です。",
      section: "acceptance",
    });
  }
};

export const validateSpec = (content: string): ValidationResult => {
  const issues: ValidationIssue[] = [];

  checkFrontMatter(content, issues);
  checkSections(content, issues);
  checkDuplicateIds(content, issues);
  checkAcceptanceCoverage(content, issues);

  return {
    valid: issues.every((issue) => issue.severity !== "error"),
    issues,
  };
};
