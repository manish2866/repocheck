import type { CheckResult, RepoContext } from "../types.js";

const RECOMMENDED_IGNORES = [
  { pattern: ".env", reason: "local secrets" },
  { pattern: "node_modules", reason: "dependencies" },
  { pattern: "dist", reason: "build output" },
  { pattern: "build", reason: "build output" },
  { pattern: ".DS_Store", reason: "OS metadata" },
];

export function checkGitignore(ctx: RepoContext): CheckResult {
  const gitignoreContent = ctx.readText(".gitignore");

  if (!gitignoreContent) {
    const relevant = RECOMMENDED_IGNORES.filter(({ pattern }) =>
      shouldRecommendIgnore(ctx, pattern)
    );

    if (relevant.length === 0) {
      return {
        id: "gitignore",
        title: ".gitignore",
        severity: "info",
        message: "No .gitignore file found",
        fix: "Add a .gitignore to avoid committing build artifacts and secrets",
      };
    }

    return {
      id: "gitignore",
      title: ".gitignore",
      severity: "warn",
      message: "No .gitignore file found",
      fix: "Add a .gitignore covering .env, node_modules, and build output",
    };
  }

  const lines = gitignoreContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  const missing = RECOMMENDED_IGNORES.filter(({ pattern }) => {
    if (!shouldRecommendIgnore(ctx, pattern)) {
      return false;
    }
    return !lines.some(
      (line) => line === pattern || line === `${pattern}/` || line.endsWith(`/${pattern}`)
    );
  });

  if (missing.length === 0) {
    return {
      id: "gitignore",
      title: ".gitignore",
      severity: "pass",
      message: ".gitignore covers common paths",
    };
  }

  const missingList = missing.map(({ pattern }) => pattern).join(", ");

  return {
    id: "gitignore",
    title: ".gitignore",
    severity: "warn",
    message: `.gitignore missing recommended entries: ${missingList}`,
    fix: `Add ${missingList} to .gitignore`,
  };
}

function shouldRecommendIgnore(ctx: RepoContext, pattern: string): boolean {
  switch (pattern) {
    case ".env":
      return ctx.files.some((file) => {
        const name = file.split("/").pop() ?? file;
        return name === ".env" || name.startsWith(".env.");
      });
    case "node_modules":
      return ctx.hasFile("package.json");
    case "dist":
    case "build":
      return (
        ctx.hasFile("package.json") ||
        ctx.hasFile("tsconfig.json") ||
        ctx.hasFile("vite.config.ts")
      );
    case ".DS_Store":
      return process.platform === "darwin";
    default:
      return true;
  }
}
