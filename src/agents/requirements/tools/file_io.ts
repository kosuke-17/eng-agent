import { promises as fs } from "fs";
import { dirname, resolve } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import type { ChangeLogEntry, SpecDoc } from "@/types";

const DEFAULT_SPEC_PATH = "specs/draft.md";
const CHANGELOG_PATH = "specs/changelog.log";
const SYSTEM_PROMPT_PATH = "src/agents/requirements/prompts/system.txt";

const safeResolve = (path: string) => resolve(process.cwd(), path);

const extractFrontMatterValue = (content: string, key: string): string | undefined => {
  const match = content.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  return match?.[1]?.trim();
};

export const readSpec = async (path: string = DEFAULT_SPEC_PATH): Promise<SpecDoc> => {
  const absolutePath = safeResolve(path);
  const content = await fs.readFile(absolutePath, "utf8");
  const version = extractFrontMatterValue(content, "version") ?? "0.0.0";
  const lastUpdated = extractFrontMatterValue(content, "last_updated");
  const status = extractFrontMatterValue(content, "status");
  const owner = extractFrontMatterValue(content, "owner");
  return {
    path: absolutePath,
    content,
    version,
    lastUpdated,
    status,
    owner,
  };
};

export const writeSpec = async (spec: SpecDoc): Promise<void> => {
  const absolutePath = safeResolve(spec.path || DEFAULT_SPEC_PATH);
  await fs.mkdir(dirname(absolutePath), { recursive: true });
  const tempFile = resolve(
    tmpdir(),
    `spec-${randomUUID()}.tmp`
  );
  await fs.writeFile(tempFile, spec.content, "utf8");
  await fs.rename(tempFile, absolutePath);
};

export const appendChangelog = async (
  entry: ChangeLogEntry,
  path: string = CHANGELOG_PATH
): Promise<void> => {
  const absolutePath = safeResolve(path);
  await fs.mkdir(dirname(absolutePath), { recursive: true });
  const line = `${entry.timestamp} ${entry.author}: ${entry.summary} (targets: ${entry.targets.join(",")})\n`;
  await fs.appendFile(absolutePath, line, "utf8");
};

export const readSystemPrompt = async (path: string = SYSTEM_PROMPT_PATH) => {
  const absolutePath = safeResolve(path);
  return fs.readFile(absolutePath, "utf8");
};
