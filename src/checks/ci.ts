import type { CheckResult, RepoContext } from "../types.js";

const CI_PATHS = [
  ".github/workflows",
  ".gitlab-ci.yml",
  "azure-pipelines.yml",
  ".circleci/config.yml",
  "Jenkinsfile",
  ".travis.yml",
  "bitbucket-pipelines.yml",
];

export function checkCi(ctx: RepoContext): CheckResult {
  const found = CI_PATHS.filter((path) => {
    if (path.includes("/")) {
      return ctx.files.some((file) => file.startsWith(path + "/") || file === path);
    }
    return ctx.hasFile(path);
  });

  if (found.length > 0) {
    return {
      id: "ci",
      title: "CI configuration",
      severity: "pass",
      message: `Found ${found[0]}`,
    };
  }

  return {
    id: "ci",
    title: "CI configuration",
    severity: "info",
    message: "No CI workflow configuration detected",
    fix: "Add a GitHub Actions workflow or CI config to automate tests and checks",
  };
}
