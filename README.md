# repocheck

Scan any git repo locally and get a colored report of common hygiene problems before they bite you in CI or production.

## Install

Clone the repo, install dependencies, and build:

```bash
git clone https://github.com/manish2866/repocheck.git
cd repocheck
npm install
npm run build
```

Optional: link it globally so you can run `repocheck` from anywhere:

```bash
npm link
```

## Usage

From the repocheck directory (after `npm run build`):

```bash
# Scan current directory
npm start -- .

# Scan another repo
npm start -- ../my-other-project

# Show fix suggestions
npm start -- . --fix-hints

# JSON output for scripts
npm start -- . --json

# Fail on warnings too (useful in CI)
npm start -- . --severity warn
```

If you ran `npm link`, you can use `repocheck` instead of `npm start --`:

```bash
repocheck . --fix-hints
```

## Example output

```
Repo Health Report — my-cool-app
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓  README
   Found README.md
✓  License
   Found LICENSE
⚠  .env.example
   .env file found but no .env.example template
✓  Secrets scan
   No obvious secrets detected in tracked files
⚠  Tests
   No test files or test configuration detected
ℹ  CI configuration
   No CI workflow configuration detected

Score: 7.5/11  |  2 warnings  1 info

Run with --fix-hints for suggestions
```

## Checks

| Check | Severity | What it looks for |
|-------|----------|-------------------|
| Git repository | warn | Missing `.git` directory |
| README | warn | Missing or very short README |
| License | info | Missing LICENSE file |
| .env.example | warn | `.env` without a template |
| Secrets scan | error | Obvious API keys and tokens in tracked files |
| Tests | warn | Missing test files or test config |
| Large files | warn | Tracked files over 1MB |
| node_modules | error | Committed dependency folder |
| Lockfile | warn | `package.json` without a lockfile |
| CI configuration | info | Missing GitHub Actions or other CI config |
| .gitignore | warn | Missing or incomplete `.gitignore` |

## CI

Add to GitHub Actions:

```yaml
name: Repo health

on:
  push:
    branches: [main]
  pull_request:

jobs:
  repocheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install repocheck
        run: |
          git clone --depth 1 https://github.com/manish2866/repocheck.git /tmp/repocheck
          cd /tmp/repocheck && npm ci && npm run build
      - run: node /tmp/repocheck/dist/cli.js . --severity error --fix-hints
```

## Development

```bash
npm install
npm run build
npm start -- .
```

For quick iteration during development:

```bash
npm run dev -- .
```

## Adding a check

1. Create `src/checks/my-check.ts` exporting a `CheckResult` function
2. Register it in `src/checks/index.ts`
3. Run `npm run dev -- .` to verify

## License

MIT
