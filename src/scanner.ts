import { existsSync, readFileSync, statSync } from "node:fs";
import { basename, join, relative } from "node:path";
import fg from "fast-glob";
import type { RepoContext } from "./types.js";

const IGNORED_DIRS = [
  "**/node_modules/**",
  "**/.git/**",
  "**/dist/**",
  "**/build/**",
  "**/.next/**",
  "**/coverage/**",
];

const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".yaml",
  ".yml",
  ".toml",
  ".env",
  ".env.example",
  ".md",
  ".txt",
  ".py",
  ".go",
  ".rs",
  ".sh",
  ".bash",
  ".zsh",
  ".cfg",
  ".ini",
  ".properties",
  ".xml",
  ".html",
  ".css",
  ".scss",
  ".sql",
]);

const MAX_TEXT_BYTES = 512 * 1024;

function isLikelyTextFile(relativePath: string): boolean {
  const name = basename(relativePath);
  if (
    name === ".gitignore" ||
    name === ".dockerignore" ||
    name === ".npmignore" ||
    name === "Dockerfile" ||
    name.startsWith(".env") ||
    name === "Makefile" ||
    !name.includes(".")
  ) {
    return true;
  }

  const ext = relativePath.slice(relativePath.lastIndexOf(".")).toLowerCase();
  return TEXT_EXTENSIONS.has(ext);
}

export async function createRepoContext(root: string): Promise<RepoContext> {
  const absoluteRoot = root;
  const name = basename(absoluteRoot) || "repo";

  const entries = await fg("**/*", {
    cwd: absoluteRoot,
    ignore: IGNORED_DIRS,
    dot: true,
    onlyFiles: true,
    followSymbolicLinks: false,
  });

  const files = entries.sort();
  const fileSizes = new Map<string, number>();

  for (const file of files) {
    try {
      const size = statSync(join(absoluteRoot, file)).size;
      fileSizes.set(file, size);
    } catch {
      // Skip unreadable files
    }
  }

  const fileSet = new Set(files);

  return {
    root: absoluteRoot,
    name,
    isGitRepo: existsSync(join(absoluteRoot, ".git")),
    files,
    fileSizes,
    hasFile(pattern) {
      if (typeof pattern === "string") {
        return fileSet.has(pattern);
      }
      return files.some((file) => pattern.test(file));
    },
    findFiles(pattern) {
      return files.filter((file) => {
        if (pattern.includes("*")) {
          const regex = new RegExp(
            "^" + pattern.replace(/\./g, "\\.").replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*") + "$"
          );
          return regex.test(file);
        }
        return file === pattern || file.endsWith("/" + pattern);
      });
    },
    readText(relativePath) {
      if (!fileSet.has(relativePath)) {
        return null;
      }
      if (!isLikelyTextFile(relativePath)) {
        return null;
      }
      const size = fileSizes.get(relativePath) ?? 0;
      if (size > MAX_TEXT_BYTES) {
        return null;
      }
      try {
        return readFileSync(join(absoluteRoot, relativePath), "utf8");
      } catch {
        return null;
      }
    },
  };
}

export function formatRelativePath(ctx: RepoContext, file: string): string {
  return relative(process.cwd(), join(ctx.root, file)) || file;
}
