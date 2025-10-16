import type { RequirementId, RequirementKind } from "@/types";

const ID_PATTERN = /\b(FR|NFR|AC|R)-(\d{3})\b/g;

const padIndex = (value: number) => value.toString().padStart(3, "0");

export const collectIds = (
  content: string,
  kind?: RequirementKind
): Set<RequirementId> => {
  const ids = new Set<RequirementId>();
  const pattern = kind ? new RegExp(`\\b${kind}-(\\d{3})\\b`, "g") : ID_PATTERN;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) {
    const prefix = (kind ?? (match[1] as RequirementKind)) as RequirementKind;
    const index = match[2];
    ids.add(`${prefix}-${index}` as RequirementId);
  }
  return ids;
};

export const nextRequirementId = (
  kind: RequirementKind,
  existing: Iterable<RequirementId>
): RequirementId => {
  let maxIndex = 0;
  for (const id of existing) {
    if (!id.startsWith(`${kind}-`)) continue;
    const [, numericPart] = id.split("-");
    const parsed = Number.parseInt(numericPart, 10);
    if (!Number.isNaN(parsed)) {
      maxIndex = Math.max(maxIndex, parsed);
    }
  }
  const nextIndex = maxIndex + 1;
  return `${kind}-${padIndex(nextIndex)}` as RequirementId;
};

export const ensureUniqueId = (
  candidate: RequirementId,
  existing: Iterable<RequirementId>
): RequirementId => {
  if (![...existing].includes(candidate)) {
    return candidate;
  }
  const [prefix] = candidate.split("-");
  return nextRequirementId(prefix as RequirementKind, existing);
};
