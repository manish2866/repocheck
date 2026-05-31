import type { CheckResult, RepoContext } from "../types.js";

const TEST_DIR_PATTERNS = [
  /^tests?\//,
  /^__tests__\//,
  /^test\//,
  /\.test\.[jt]sx?$/,
  /\.spec\.[jt]sx?$/,
  /^spec\//,
];

const TEST_CONFIG_FILES = [
  "jest.config.js",
  "jest.config.ts",
  "jest.config.mjs",
  "vitest.config.ts",
  "vitest.config.js",
  "pytest.ini",
  "pyproject.toml",
  "go.test",
];

export function checkTests(ctx: RepoContext): CheckResult {
  const hasTestFiles = ctx.files.some((file) =>
    TEST_DIR_PATTERNS.some((pattern) => pattern.test(file))
  );

  const hasTestConfig = ctx.files.some((file) =>
    TEST_CONFIG_FILES.includes(file.split("/").pop() ?? file)
  );

  if (hasTestFiles || hasTestConfig) {
    return {
      id: "tests",
      title: "Tests",
      severity: "pass",
      message: "Test files or test configuration detected",
    };
  }

  const isNodeProject = ctx.hasFile("package.json");
  const isPythonProject = ctx.hasFile("pyproject.toml") || ctx.hasFile("setup.py");
  const isGoProject = ctx.hasFile("go.mod");

  if (!isNodeProject && !isPythonProject && !isGoProject) {
    return {
      id: "tests",
      title: "Tests",
      severity: "info",
      message: "No test files detected (project type unclear)",
      fix: "Add a tests/ directory or test files for your stack",
    };
  }

  return {
    id: "tests",
    title: "Tests",
    severity: "warn",
    message: "No test files or test configuration detected",
    fix: "Add unit tests to improve maintainability and catch regressions",
  };
}
