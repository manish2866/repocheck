#!/usr/bin/env node

import { resolve } from "node:path";
import { Command } from "commander";
import { ALL_CHECKS, runChecks } from "./checks/index.js";
import { checkSecrets } from "./checks/secrets.js";
import { getExitCode, printReport } from "./report.js";
import { createRepoContext } from "./scanner.js";
import type { Severity } from "./types.js";

const program = new Command();

program
  .name("repocheck")
  .description("Scan a git repo for common hygiene problems")
  .argument("[path]", "Path to repository", ".")
  .option("--json", "Output results as JSON")
  .option("--fix-hints", "Show fix suggestions for failed checks")
  .option(
    "--severity <level>",
    "Minimum severity that fails the run (error, warn, info, pass)",
    "error"
  )
  .option("--no-secrets", "Skip secret scanning")
  .action(async (path: string, options) => {
    const root = resolve(path);
    const minSeverity = options.severity as Severity;

    try {
      const ctx = await createRepoContext(root);
      const checksToRun =
        options.secrets === false
          ? ALL_CHECKS.filter((check) => check !== checkSecrets)
          : ALL_CHECKS;

      const results = await runChecks(ctx, checksToRun);
      printReport(ctx.name, results, {
        json: options.json,
        fixHints: options.fixHints,
        minSeverity,
      });

      const exitCode = getExitCode(results, minSeverity);
      if (exitCode !== 0 && !options.json) {
        process.exitCode = exitCode;
      } else if (options.json) {
        process.exitCode = exitCode;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`repocheck: ${message}`);
      process.exitCode = 1;
    }
  });

program.parse();
