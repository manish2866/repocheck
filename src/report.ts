import pc from "picocolors";
import type {
  CheckResult,
  ReportOptions,
  ReportSummary,
  Severity,
} from "./types.js";
import { meetsMinSeverity } from "./types.js";

const ICONS: Record<Severity, string> = {
  pass: pc.green("✓"),
  info: pc.blue("ℹ"),
  warn: pc.yellow("⚠"),
  error: pc.red("✗"),
};

export function summarizeResults(results: CheckResult[]): ReportSummary {
  const errors = results.filter((r) => r.severity === "error").length;
  const warnings = results.filter((r) => r.severity === "warn").length;
  const info = results.filter((r) => r.severity === "info").length;
  const passed = results.filter((r) => r.severity === "pass").length;
  const score = passed + info * 0.5;
  const maxScore = results.length;

  return {
    score: Math.round(score * 10) / 10,
    maxScore,
    errors,
    warnings,
    info,
    passed,
  };
}

export function printReport(
  repoName: string,
  results: CheckResult[],
  options: ReportOptions
): ReportSummary {
  const visible = results.filter((result) =>
    result.severity === "pass"
      ? !options.minSeverity || options.minSeverity === "pass"
      : meetsMinSeverity(result.severity, options.minSeverity)
  );

  if (options.json) {
    const summary = summarizeResults(results);
    console.log(
      JSON.stringify(
        {
          repo: repoName,
          summary,
          results,
        },
        null,
        2
      )
    );
    return summary;
  }

  console.log("");
  console.log(pc.bold(`Repo Health Report — ${repoName}`));
  console.log(pc.dim("━".repeat(40)));

  for (const result of results) {
    if (result.severity === "pass" && options.minSeverity !== "pass") {
      continue;
    }

    const icon = ICONS[result.severity];
    const label = pc.bold(result.title);
    console.log(`${icon}  ${label}`);
    console.log(`   ${result.message}`);

    if (options.fixHints && result.fix) {
      console.log(pc.dim(`   → ${result.fix}`));
    }
  }

  const summary = summarizeResults(results);
  console.log("");
  console.log(
    [
      pc.bold(`Score: ${summary.score}/${summary.maxScore}`),
      summary.errors ? pc.red(`${summary.errors} error${summary.errors === 1 ? "" : "s"}`) : null,
      summary.warnings
        ? pc.yellow(`${summary.warnings} warning${summary.warnings === 1 ? "" : "s"}`)
        : null,
      summary.info ? pc.blue(`${summary.info} info`) : null,
    ]
      .filter(Boolean)
      .join(pc.dim("  |  "))
  );

  if (!options.fixHints) {
    console.log(pc.dim("\nRun with --fix-hints for suggestions"));
  }

  console.log("");
  return summary;
}

export function getExitCode(
  results: CheckResult[],
  minSeverity: Severity
): number {
  const failed = results.some((result) =>
    meetsMinSeverity(result.severity, minSeverity) && result.severity !== "pass"
  );
  return failed ? 1 : 0;
}
