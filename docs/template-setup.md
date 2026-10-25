# Using this repository as a template

This repository is the private template. Each assignment is a new **public** repository created
from it. This guide covers the order to do that in, what to strip before the assignment goes
public, and the settings GitHub does not copy. Every step is in the GitHub UI. The optional
command-line equivalents assume the `gh` CLI is signed in.

## 0. Finish the template first

The template stays public until it is finished. Going private is the last step before it
becomes a template, not the first.

1. Merge everything the template should contain into `main`. A new repository gets whatever is
   on `main` at the moment you click **Use this template**.
2. Confirm `main` is green:

   ```bash
   git switch main && git pull
   npm ci && npm run verify        # lint, format, types, unit tests, build
   ```

## 1. Make this repository private

1. **Settings > General**, scroll to **Danger Zone**, then **Change repository visibility**.
2. Choose **Make private** and confirm.

Command line: `gh repo edit <owner>/<repo> --visibility private --accept-visibility-change-consequences`.

Going private hides the code, the pull requests and their discussions. Anyone who already cloned
or forked the public repository keeps their copy.

On GitHub Free, rulesets on a private repository are kept but **not enforced**. Enforcement on
private repositories needs GitHub Pro, Team or Enterprise. That is acceptable for a template
nobody builds in, but it means `main` here is no longer protected. Public repositories enforce
rulesets on every plan, so the assignment repository is protected either way.

## 2. Mark it as a template

1. **Settings > General**. Under the repository name, tick **Template repository**.
2. A **Use this template** button now appears on the repository home page.

Command line: `gh api -X PATCH repos/<owner>/<repo> -f is_template=true`.

## 3. Create the assignment repository, private at first

1. On the template's home page, click **Use this template**, then **Create a new repository**.
2. Owner: your account. Name: whatever the brief calls for.
3. Leave **Include all branches** unticked. Only `main` is wanted.
4. Visibility: **Private** for now. It becomes public in step 5, after the clean-up.
5. Click **Create repository**.

Command line: `gh repo create <name> --template <owner>/<repo> --private --clone`.

As the owner, you can create a repository from your own private template. GitHub gives the new
repository a single "Initial commit" with the template's files. The template's history, branches,
pull requests and tags are not copied.

**Why private first:** everything in that initial commit is public the moment the repository is.
Deleting a file in a later commit does not remove it from history. Clean up while it is private,
then publish.

## 4. Strip what should not be public

Work in a clone of the new repository. These files are in the template for your own use and are
not meant for the people reading the assignment:

| Path                                     | What it is                                               | Do                                     |
| ---------------------------------------- | -------------------------------------------------------- | -------------------------------------- |
| `docs/template-setup.md`                 | This guide                                               | Delete                                 |
| `docs/quick-start.md`                    | Prep notes for a timed build ("a prototype in one hour") | Delete                                 |
| `.github/rulesets/main-pr-green-ci.json` | Ruleset export used in step 6                            | Keep until step 6, then either is fine |
| `README.md`                              | A skeleton with placeholders in angle brackets           | Fill in with the assignment            |

`docs/architecture-example.md` describes the template's architecture and contains nothing
private. Replace it with the assignment's own diagram, or keep it and edit it.

Keep, and list under "Prepared beforehand" in the README: `CLAUDE.md`, `docs/timebox.md`,
`docs/prompts/`, `docs/template-guide.md`, `docs/adr/TEMPLATE.md`, the example
`docs/adr/000-ADR-Accessibility.md`, the PR template, CI and all tests.

Then rename the placeholder app name `Assignment18` in `index.html`, `src/App.tsx`,
`src/App.test.tsx`, `e2e/screen-reader.spec.ts` and `package.json`. The unit test and the
screen-reader snapshot both assert the `h1`, so change them together. Run `npm run verify`.

Finally, replace the history with one clean commit, so the removed files are not in it. This is
safe only now, while the repository is new, private and has no ruleset:

```bash
git checkout --orphan fresh
git add -A
git commit -m "Initial commit"
git branch -M fresh main
git push --force origin main
git log --oneline               # exactly one commit
```

## 5. Make the assignment repository public

1. In the new repository: **Settings > General > Danger Zone > Change repository visibility**.
2. Choose **Make public** and confirm.

Command line: `gh repo edit <owner>/<new-repo> --visibility public --accept-visibility-change-consequences`.

## 6. Recreate the `main` ruleset

**Timeboxed build where CI should not run or block anything:** skip this step and run
`npm run ci:off`, then commit. That parks the workflow in `ci/`, where GitHub does not run it.
`npm run ci:on` puts it back; recreate the ruleset only after that, or every pull request waits for
checks that never report.

Do this after step 5. The ruleset blocks force pushes, so it has to come after the history
rewrite in step 4.

The ruleset is what makes CI an enforcement point rather than a hint. Nothing reaches `main`
except through a pull request whose four checks are green. The exact definition is in
[`.github/rulesets/main-pr-green-ci.json`](../.github/rulesets/main-pr-green-ci.json).

**Import it** (fastest):

1. In the new repository: **Settings > Rules > Rulesets**.
2. Open the **New ruleset** dropdown and choose **Import a ruleset**.
3. Select `.github/rulesets/main-pr-green-ci.json` from your clone.
4. Check that **Enforcement status** reads **Active**, then **Create**.

Command line, from the clone of the new repository:

```bash
gh api -X POST repos/<owner>/<new-repo>/rulesets --input .github/rulesets/main-pr-green-ci.json
```

The file names no repository, so the same JSON works in any repository. Its status checks point
at the GitHub Actions app (id `15368`), which is the same in every repository. On a public
repository it is enforced on every plan, including Free.

**Or build it by hand** with these values:

| Setting                       | Value                                                                                                                              |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Ruleset name                  | `main — PR + green CI`                                                                                                             |
| Enforcement status            | Active                                                                                                                             |
| Bypass list                   | Empty (nobody, including the owner, can push around it)                                                                            |
| Target branches               | Include by pattern: **Default branch**                                                                                             |
| Restrict deletions            | On                                                                                                                                 |
| Block force pushes            | On                                                                                                                                 |
| Require a pull request        | On. Required approvals: 0. Dismiss stale approvals on push: on. Allowed merge methods: merge, squash, rebase. Everything else off. |
| Require status checks to pass | On. Require branches to be up to date before merging: on. Checks: `quality`, `unit`, `build`, `e2e`, each from GitHub Actions.     |

The four check names come from the `name:` of each job in
[`.github/workflows/ci.yml`](../.github/workflows/ci.yml). If you rename a job, rename it in the
ruleset too, or merging blocks forever.

When you add checks by hand, GitHub's search box only lists checks that have already reported
on that repository. Importing the JSON avoids that limitation.

## 7. Other settings GitHub does not copy

| Not copied                               | Needed?                                             | Where                              |
| ---------------------------------------- | --------------------------------------------------- | ---------------------------------- |
| Rulesets and branch protection           | Yes, step 6                                         | Settings > Rules > Rulesets        |
| Visibility                               | Chosen at creation, changed in step 5               | Settings > General > Danger Zone   |
| Actions secrets and variables            | No, CI uses none                                    |                                    |
| Actions permissions                      | The default (allow all actions) is enough           | Settings > Actions > General       |
| Repository description and topics        | Write one for the assignment                        | Home page, gear icon next to About |
| Merge button and branch-deletion options | Optional: tick "Automatically delete head branches" | Settings > General > Pull Requests |
| Collaborators, webhooks, deploy keys     | None are used                                       |                                    |
| Issues, pull requests, wiki, releases    | Not wanted in a fresh repository                    |                                    |

Git hooks (`.husky/`) are files, so they are copied. `npm ci` installs them.

## 8. First pull request

1. Push a branch and open a pull request. Confirm the four checks report green. On a pull
   request that only changes Markdown or `docs/`, `unit`, `build` and `e2e` show as skipped,
   which the ruleset counts as passing.
2. Merge. From now on `main` is protected and every change goes through a pull request.

The project-summary form in `src/App.tsx` is a placeholder screen. You can add the new screen
beside it or replace it. The e2e keyboard and screen-reader specs target the form, so replacing
it means updating those specs in the same pull request. For each new decision, copy
`docs/adr/TEMPLATE.md`.
