import type { CheckResult, RepoContext } from "../types.js";

export function checkGitRepo(ctx: RepoContext): CheckResult {
  if (ctx.isGitRepo) {
    return {
      id: "git-repo",
      title: "Git repository",
      severity: "pass",
      message: "Directory is a git repository",
    };
  }

  return {
    id: "git-repo",
    title: "Git repository",
    severity: "warn",
    message: "Not a git repository (.git missing)",
    fix: "Run `git init` if this should be version controlled",
  };
}
