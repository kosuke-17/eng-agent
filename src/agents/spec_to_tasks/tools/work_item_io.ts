import { promises as fs } from "fs";
import { dirname, resolve } from "path";
import type { DerivedTask } from "../state";

const DEFAULT_PLAN_JSON = "tasks/plan.json";
const DEFAULT_PLAN_MARKDOWN = "tasks/plan.md";

const ensureDir = async (path: string) => {
  await fs.mkdir(dirname(path), { recursive: true });
};

const resolvePath = (path: string) => resolve(process.cwd(), path);

export const writePlanJson = async (
  tasks: DerivedTask[],
  path: string = DEFAULT_PLAN_JSON
) => {
  const absolute = resolvePath(path);
  await ensureDir(absolute);
  const payload = {
    generatedAt: new Date().toISOString(),
    items: tasks,
  };
  await fs.writeFile(absolute, JSON.stringify(payload, null, 2), "utf8");
};

export const writePlanMarkdown = async (
  tasks: DerivedTask[],
  path: string = DEFAULT_PLAN_MARKDOWN
) => {
  const absolute = resolvePath(path);
  await ensureDir(absolute);
  const lines = [
    "# Implementation Plan",
    "",
    "| ID | Requirement | Summary | Type | Estimate (pts) | Dependencies |",
    "|----|-------------|---------|------|----------------|--------------|",
  ];
  for (const task of tasks) {
    lines.push(
      `| ${task.id} | ${task.requirementId ?? "-"} | ${task.summary} | ${
        task.type
      } | ${task.estimate ?? "-"} | ${
        task.dependencies?.join(", ") ?? "-"
      } |`
    );
  }
  await fs.writeFile(absolute, `${lines.join("\n")}\n`, "utf8");
};
