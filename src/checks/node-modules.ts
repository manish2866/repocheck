import type { CheckResult, RepoContext } from "../types.js";

export function checkNodeModules(ctx: RepoContext): CheckResult {
  const committed = ctx.files.filter(
    (file) => file === "node_modules" || file.startsWith("node_modules/")
  );

  if (committed.length === 0) {
    return {
      id: "node-modules",
      title: "node_modules",
      severity: "pass",
      message: "node_modules is not tracked",
    };
  }

  return {
    id: "node-modules",
    title: "node_modules",
    severity: "error",
    message: `${committed.length} file(s) under node_modules/ appear tracked`,
    fix: "Remove node_modules from git and add it to .gitignore",
  };
}
