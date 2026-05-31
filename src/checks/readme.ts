import type { CheckResult, RepoContext } from "../types.js";

const README_PATTERNS = [
  /^readme(\..+)?$/i,
  /^README(\..+)?$/,
];

export function checkReadme(ctx: RepoContext): CheckResult {
  const readme = ctx.files.find((file) => {
    const name = file.split("/").pop() ?? file;
    return README_PATTERNS.some((pattern) => pattern.test(name));
  });

  if (readme) {
    const content = ctx.readText(readme);
    if (content && content.trim().length < 40) {
      return {
        id: "readme",
        title: "README",
        severity: "warn",
        message: `${readme} exists but looks very short`,
        fix: "Add a project description, install steps, and usage examples",
      };
    }

    return {
      id: "readme",
      title: "README",
      severity: "pass",
      message: `Found ${readme}`,
    };
  }

  return {
    id: "readme",
    title: "README",
    severity: "warn",
    message: "No README file found",
    fix: "Add a README.md with project overview and setup instructions",
  };
}
