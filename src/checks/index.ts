import type { Check, CheckResult, RepoContext } from "../types.js";
import { checkCi } from "./ci.js";
import { checkEnvExample } from "./env-example.js";
import { checkGitignore } from "./gitignore.js";
import { checkGitRepo } from "./git-repo.js";
import { checkHugeFiles } from "./huge-files.js";
import { checkLicense } from "./license.js";
import { checkLockfile } from "./lockfile.js";
import { checkNodeModules } from "./node-modules.js";
import { checkReadme } from "./readme.js";
import { checkSecrets } from "./secrets.js";
import { checkTests } from "./tests.js";

export const ALL_CHECKS: Check[] = [
  checkGitRepo,
  checkReadme,
  checkLicense,
  checkEnvExample,
  checkSecrets,
  checkTests,
  checkHugeFiles,
  checkNodeModules,
  checkLockfile,
  checkCi,
  checkGitignore,
];

export async function runChecks(
  ctx: RepoContext,
  checks: Check[] = ALL_CHECKS
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  for (const check of checks) {
    results.push(await check(ctx));
  }
  return results;
}
