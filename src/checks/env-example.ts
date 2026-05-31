import type { CheckResult, RepoContext } from "../types.js";

function hasEnvFile(ctx: RepoContext): boolean {
  return ctx.files.some((file) => {
    const name = file.split("/").pop() ?? file;
    return name === ".env" || (name.startsWith(".env.") && name !== ".env.example");
  });
}

function hasEnvExample(ctx: RepoContext): boolean {
  return ctx.files.some((file) => {
    const name = file.split("/").pop() ?? file;
    return name === ".env.example" || name === ".env.sample" || name === ".env.template";
  });
}

export function checkEnvExample(ctx: RepoContext): CheckResult {
  const envExists = hasEnvFile(ctx);
  const exampleExists = hasEnvExample(ctx);

  if (!envExists && !exampleExists) {
    return {
      id: "env-example",
      title: ".env.example",
      severity: "info",
      message: "No .env or .env.example found",
      fix: "If the project uses secrets, add .env.example with placeholder keys",
    };
  }

  if (envExists && !exampleExists) {
    return {
      id: "env-example",
      title: ".env.example",
      severity: "warn",
      message: ".env file found but no .env.example template",
      fix: "Create .env.example with the same keys but placeholder values",
    };
  }

  if (exampleExists) {
    return {
      id: "env-example",
      title: ".env.example",
      severity: "pass",
      message: "Environment template present",
    };
  }

  return {
    id: "env-example",
    title: ".env.example",
    severity: "pass",
    message: "No .env file detected",
  };
}
