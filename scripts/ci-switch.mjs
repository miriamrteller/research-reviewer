/**
 * Switches the GitHub Actions CI off or on for a repository made from the template.
 * CI is on by default. For a timeboxed build where CI should not run or block anything,
 * `npm run ci:off` parks the workflow in ci/, where GitHub does not run it.
 * `npm run ci:on` moves it back. One copy of the workflow exists at a time, so it never drifts.
 */
import { existsSync, mkdirSync, renameSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const active = join(root, '.github', 'workflows', 'ci.yml')
const parked = join(root, 'ci', 'ci.yml')
const mode = process.argv[2]

if (mode !== 'on' && mode !== 'off') {
  console.error('Usage: node scripts/ci-switch.mjs on|off (or npm run ci:on / npm run ci:off)')
  process.exit(1)
}

const [from, to] = mode === 'off' ? [active, parked] : [parked, active]

if (!existsSync(from)) {
  console.log(
    existsSync(to)
      ? `CI is already ${mode}.`
      : 'No CI workflow found in .github/workflows/ or ci/.',
  )
  process.exit(existsSync(to) ? 0 : 1)
}

mkdirSync(dirname(to), { recursive: true })
renameSync(from, to)

console.log(
  mode === 'off'
    ? `CI is off: moved .github/workflows/ci.yml to ci/ci.yml. Commit it.
Keep the main ruleset off too (docs/template-setup.md, step 6), or PRs wait for checks that never run.
Local gate: npm run verify, then CI=1 npm run test:e2e.`
    : `CI is on: moved ci/ci.yml back to .github/workflows/ci.yml. Commit it on a branch and open a PR.
To require the checks on main, import .github/rulesets/main-pr-green-ci.json (docs/template-setup.md, step 6).`,
)
