import type { CheckResult, RepoContext } from "../types.js";

const LICENSE_NAMES = [
  "license",
  "license.md",
  "license.txt",
  "copying",
  "copying.md",
];

export function checkLicense(ctx: RepoContext): CheckResult {
  const license = ctx.files.find((file) => {
    const name = (file.split("/").pop() ?? file).toLowerCase();
    return LICENSE_NAMES.includes(name);
  });

  if (license) {
    return {
      id: "license",
      title: "License",
      severity: "pass",
      message: `Found ${license}`,
    };
  }

  return {
    id: "license",
    title: "License",
    severity: "info",
    message: "No LICENSE file found",
    fix: "Add a LICENSE file (MIT is common for open source)",
  };
}
