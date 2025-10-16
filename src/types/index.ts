export type RequirementKind = "FR" | "NFR" | "AC" | "R";

export type RequirementId = `${RequirementKind}-${string}`;

export interface SpecDoc {
  path: string;
  content: string;
  version: string;
  lastUpdated?: string;
  status?: string;
  owner?: string;
}

export type QuestionPriority = "H" | "M" | "L";

export interface OpenQuestion {
  id: string;
  text: string;
  owner?: string;
  neededBy?: string;
  priority?: QuestionPriority;
  blockedBy?: string[];
  notes?: string;
}

export interface ChangeLogEntry {
  timestamp: string;
  author: string;
  summary: string;
  targets: RequirementId[];
}

export interface ValidationIssue {
  severity: "error" | "warning";
  message: string;
  referenceId?: RequirementId;
  section?: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}
