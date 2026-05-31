export type Severity = "error" | "warn" | "info" | "pass";

export interface CheckResult {
  id: string;
  title: string;
  severity: Severity;
  message: string;
  fix?: string;
}

export interface RepoContext {
  root: string;
  name: string;
  isGitRepo: boolean;
  files: string[];
  fileSizes: Map<string, number>;
  hasFile: (pattern: string | RegExp) => boolean;
  findFiles: (pattern: string) => string[];
  readText: (relativePath: string) => string | null;
}

export type Check = (ctx: RepoContext) => CheckResult | Promise<CheckResult>;

export interface ReportOptions {
  json: boolean;
  fixHints: boolean;
  minSeverity: Severity;
}

export interface ReportSummary {
  score: number;
  maxScore: number;
  errors: number;
  warnings: number;
  info: number;
  passed: number;
}

export const SEVERITY_RANK: Record<Severity, number> = {
  pass: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export function meetsMinSeverity(
  severity: Severity,
  minSeverity: Severity
): boolean {
  return SEVERITY_RANK[severity] >= SEVERITY_RANK[minSeverity];
}
