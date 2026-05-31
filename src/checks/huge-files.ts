import { formatRelativePath } from "../scanner.js";
import type { CheckResult, RepoContext } from "../types.js";

const DEFAULT_MAX_BYTES = 1024 * 1024;

export function checkHugeFiles(ctx: RepoContext, maxBytes = DEFAULT_MAX_BYTES): CheckResult {
  const huge = ctx.files
    .filter((file) => (ctx.fileSizes.get(file) ?? 0) > maxBytes)
    .sort((a, b) => (ctx.fileSizes.get(b) ?? 0) - (ctx.fileSizes.get(a) ?? 0));

  if (huge.length === 0) {
    return {
      id: "huge-files",
      title: "Large files",
      severity: "pass",
      message: `No tracked files over ${formatSize(maxBytes)}`,
    };
  }

  const preview = huge
    .slice(0, 3)
    .map((file) => `${formatRelativePath(ctx, file)} (${formatSize(ctx.fileSizes.get(file) ?? 0)})`)
    .join(", ");
  const suffix = huge.length > 3 ? ` (+${huge.length - 3} more)` : "";

  return {
    id: "huge-files",
    title: "Large files",
    severity: "warn",
    message: `Large tracked files: ${preview}${suffix}`,
    fix: "Use Git LFS, move assets elsewhere, or add them to .gitignore",
  };
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)}KB`;
  }
  return `${bytes}B`;
}
