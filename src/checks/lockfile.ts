import type { CheckResult, RepoContext } from "../types.js";

const LOCKFILES = [
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lockb",
  "bun.lock",
];

export function checkLockfile(ctx: RepoContext): CheckResult {
  if (!ctx.hasFile("package.json")) {
    return {
      id: "lockfile",
      title: "Lockfile",
      severity: "pass",
      message: "Not a Node.js project",
    };
  }

  const lockfile = LOCKFILES.find((name) => ctx.hasFile(name));

  if (!lockfile) {
    return {
      id: "lockfile",
      title: "Lockfile",
      severity: "warn",
      message: "package.json found but no lockfile detected",
      fix: "Run npm install, yarn, or pnpm install and commit the lockfile",
    };
  }

  return {
    id: "lockfile",
    title: "Lockfile",
    severity: "pass",
    message: `Found ${lockfile}`,
  };
}
