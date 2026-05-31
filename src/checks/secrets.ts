import { formatRelativePath } from "../scanner.js";
import type { CheckResult, RepoContext } from "../types.js";

const SECRET_PATTERNS: Array<{ name: string; regex: RegExp }> = [
  { name: "AWS access key", regex: /AKIA[0-9A-Z]{16}/ },
  { name: "GitHub token", regex: /ghp_[A-Za-z0-9]{20,}/ },
  { name: "GitHub fine-grained token", regex: /github_pat_[A-Za-z0-9_]{20,}/ },
  { name: "Stripe live key", regex: /sk_live_[A-Za-z0-9]{20,}/ },
  { name: "Stripe test key", regex: /sk_test_[A-Za-z0-9]{20,}/ },
  { name: "Slack token", regex: /xox[baprs]-[A-Za-z0-9-]{10,}/ },
  {
    name: "Generic secret assignment",
    regex: /(?:api[_-]?key|secret|password|token)\s*[:=]\s*['"][^'"\s]{12,}['"]/i,
  },
];

const FALSE_POSITIVE_PATHS = [
  /\.example$/,
  /\.sample$/,
  /\.template$/,
  /mock/i,
  /fixture/i,
  /test/i,
  /\.md$/,
];

export function checkSecrets(ctx: RepoContext): CheckResult {
  const findings: string[] = [];

  for (const file of ctx.files) {
    if (FALSE_POSITIVE_PATHS.some((pattern) => pattern.test(file))) {
      continue;
    }

    const content = ctx.readText(file);
    if (!content) {
      continue;
    }

    for (const { name, regex } of SECRET_PATTERNS) {
      if (regex.test(content)) {
        findings.push(`${formatRelativePath(ctx, file)} (${name})`);
        break;
      }
    }
  }

  if (findings.length === 0) {
    return {
      id: "secrets",
      title: "Secrets scan",
      severity: "pass",
      message: "No obvious secrets detected in tracked files",
    };
  }

  const preview = findings.slice(0, 3).join(", ");
  const suffix = findings.length > 3 ? ` (+${findings.length - 3} more)` : "";

  return {
    id: "secrets",
    title: "Secrets scan",
    severity: "error",
    message: `Possible secrets in: ${preview}${suffix}`,
    fix: "Rotate exposed credentials and move secrets to environment variables",
  };
}
