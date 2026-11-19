---
name: verify
description: Verify an implementation against a Habit Tracker specification with repository gates, an independent read-only review, and real-browser acceptance checks. Route confirmed fixes through the Code skill and commit the final report.
---

# Verify

Use `$verify specs/<slug>.md` after implementation or to verify a fix. Verify checks, reports and coordinates. Use the [Code skill](../code/SKILL.md) for changes to tracked app, test or configuration files.

## Identify the target

- Read the whole spec. Use conversation or branch context to infer the spec only when it is unambiguous. Otherwise ask. Exclude verification reports from candidate specs.
- Record the integration branch, current HEAD, comparison base and working-tree status. Review the diff and log against the feature's actual base (use the merge base with local `main` when applicable). Include relevant working-tree changes in the evidence and identify them in the report.
- Identify the same checkout, SHA, base and relevant staged, unstaged and untracked content for both agents and the local build. If the implementation changes during the round, repeat affected checks against one consistent stand before using their evidence together.
- Use `specs/<slug>.verification.md` for the report. Read any previous report to recognize recurring findings. Preserve unrelated local edits. If the destination already has uncommitted edits from outside this run, retain findings separately and report the publishing blocker. A dirty implementation can be checked, but the Code skill's branch and worktree rules still apply to fixes.

## Run a verification round

1. Run each gate separately from the tested checkout with Node 22. Continue with the next gate even if one fails or is blocked.

   ```bash
   npm run lint
   npm run typecheck
   npm test
   CI=1 PORT=3110 E2E_PORT=3110 npm run test:e2e -- --retries=0
   ```

   For E2E, remove inherited `E2E_BASE_URL`, `E2E_SKIP_WEB_SERVER`, `E2E_WEB_SERVER` and conflicting app port overrides from the gate's environment. The repository's CI mode disables server reuse. The retry override keeps the first failure visible. Use the local build and preview for the tested checkout and both configured projects. Start with port 3110 free and serialize all work using it. If occupied, identify the listener. Stop it only if started and controlled by this run, record that recovery and confirm the port is free. With a foreign or unverified owner, record E2E as `blocked` and leave the listener alone. Set the variables using the shell's native syntax.

2. Record each command, duration, result (`green`, `red` or `blocked`), available test counts including skips, and the actionable failure or blocker. Keep the first failure visible even after it is fixed. Retry only after a concrete change to code or test conditions.
3. Map each AC and each Must to the actual source (`path:line`) and test (path, name, assertion and observed result). A Must can cite ACs that cover it in full. Inspect the relevant assertions and record any evidence gaps. Use `met` for complete, observed evidence, `partly met` for incomplete proof, and `not met` when the required behavior is absent or contradicted. A test skipped or stopped before the relevant assertion does not prove it. For a documentation-only requirement, cite the document and the observed check. Note changes outside spec scope.

### Independent review

- Spawn a new reviewer with a fresh context (`fork_turns: "none"` in Codex). Send the spec path, checkout, branch, SHA, comparison base, relevant working-tree state and review assignment. Keep the coordinator's conclusions, suspected defects and suggested fixes out of the handoff.
- Require a read-only review of the spec and diff, including relevant working-tree changes. Allow source and Git inspection. The reviewer leaves files, the Git index and branches untouched and runs no gates or servers. Ask for correctness, relevant ADRs, test coverage, edge cases and scope. Each finding names its severity (blocking or non-blocking), `path:line`, affected AC or Must, expected and observed behavior and impact. Record reviewed areas and any limits even when there are zero findings.
- Confirm findings against the tested stand. Route reproducible technical defects through the Fix list and record review availability or evidence gaps in Open checks. A missing independent review remains open.

### Browser walk

- Before clicking, write the click plan from the spec's ACs and verification plan. List each AC with user-visible behavior, including the visible parts of mixed ACs. Give each path its starting state, UI actions, expected result and expected state after reload at both **1280 × 800** and **390 × 844**. For an internal-only AC, document why a browser check is not applicable and cite the test or artifact that proves it. If every AC is internal-only, these entries complete the browser step.
- When at least one path requires a browser, the coordinator owns the local preview. Wait until the E2E gate releases port 3110, confirm it is free and start a preview of the checked checkout with `PORT=3110`. Reuse a build produced from this exact state in the current round or build it from the checked checkout. Verify that the listener belongs to the preview you started and that the local login route responds. Verify the build SHA from `/version.json` when served, or from the served build's local `.output/public/version.json` when available. For working-tree changes, verify the preview uses a build made from that recorded state. A foreign or unverified listener stays running and blocks the browser check. Close the browser sessions and stop only preview processes owned by this run when finished.
- Spawn a separate browser agent with the spec, same tested stand, local URL and click plan. It may run while the independent review is underway. Use a real browser with a fresh context per viewport and synthetic data created through the app or imported through Settings. Go through the visible login when the flow needs it. Follow the UI actions, observe the result, reload at the relevant step, and verify the spec's expected persisted or reset state. Exercise the mobile UI at the mobile viewport.
- If the browser agent is unavailable or cannot operate the browser, the coordinator may execute that same plan and must provide the same evidence. If a browser with a visible window is unavailable, use real headless Chromium through the checkout's existing Playwright dependency. For example, load `chromium` from `@playwright/test`, launch with `{ headless: true }` and create a fresh `newContext({ viewport: { width, height } })` per width, with touch and mobile options for the mobile run. Use page locators for visible UI clicks and inputs and `page.reload()` for the reload. Keep any one-off driver and artifacts outside the tracked tree and load the dependency from the checked checkout. The automated E2E suite supplies its own gate evidence.
- For each AC and viewport, record the role, browser mode, planned and executed steps, observed result before and after reload and status. On discrepancies, record a specific observation such as visible text, URL, console error or screenshot. If options are exhausted, record each affected AC, the options attempted and the concrete blocker in Open checks.

## Hand off and verify fixes

- Write the working report with `State: in progress`, the target branch and SHA, current results (including review and browser evidence) and a numbered `## Fix list` of technical findings. Give each finding a stable ID, status, linked AC/Must or gate, location, expected and actual result, and a Red command and assertion, missing test case, or blocker cause. Combine symptoms with a common cause. Keep resolved entries and their evidence in subsequent rounds.
- Hand off only when `## Fix list` contains an open technical finding that Code can act on. Use the Code skill's verification fix path with the same approved spec and this report. If a separate skill invocation is unavailable, load its instructions and explicitly follow that phase. Pass the findings and evidence to Code workers. The coordinator retains control of integration, worktree isolation and shared resources. If Code creates a feature branch, continue checking that branch. Do not start implementation from a draft spec.
- Resolve in-scope local environment blockers when their cause and a reversible remedy are established. Delegate independent diagnosis or recovery when it can be isolated. Capture before and after evidence. Use the Code path for versioned remedies. Continue processing independent fixes if another finding is externally blocked.
- After integrating fixes or correcting the test environment, rerun all four gates, the evidence check and both agent checks against the resulting stand, applying the browser fallback when needed. Attach new evidence to that tested stand. Record the fix commits, Red and Green results, and environment remedies against their finding IDs. Continue while an authorized action can produce new evidence or resolve a finding. Stop when fully green or when remaining findings cannot be advanced. Compare recurring failures with prior rounds and stop repeated attempts that do not change the state or evidence.

## Finalize

Run the [DSGVO skill](../../../.agents/skills/dsgvo/SKILL.md) once against the last tested stand, after the technical rounds and before writing the final report. Include it when technical checks remain open. If a separate skill invocation is unavailable, load and follow its instructions. Limit the audit to the spec diff and affected data flows. Use a fresh browser profile and synthetic data for browser checks when the local preview is available. Document the completed checks, limits and reasons for omitted checks.

Record the results in `## DSGVO`. For each finding or coverage gap, use `WARN` and include the evidence, impact and a concrete suggested fix or follow-up. List open operator evidence separately. If the completed checks found no issue, state that for the tested scope. DSGVO findings, missing evidence and an unavailable audit are advisory. Keep them outside the technical verdict and the Fix list, and leave their follow-ups for human review. A separately substantiated technical defect follows the normal Fix list workflow.

Write `State: final` in the report and use this structure:

```markdown
# Verification: <spec title>

Spec: <path>
Checked: <branch> @ <SHA>, base <SHA>, <working-tree state>
State: final
Verdict: Pass | Issues found

## Gates
| Command | Result | Duration | Counts and evidence |
| --- | --- | --- | --- |

## Acceptance criteria and Must requirements
| ID | Source | Test and observed assertion | Result |
| --- | --- | --- | --- |

## Review findings
<Reviewer, context mode, tested stand, checked areas and any review limits>
| Severity | AC or Must | Source | Finding and impact | Coordinator confirmation |
| --- | --- | --- | --- | --- |

## Browser walk
<Tested stand and local URL>
| AC | Viewport | Role and browser mode | Starting state and click plan | Executed steps and result before and after reload | Status |
| --- | --- | --- | --- | --- | --- |
<For internal-only ACs, record why a browser check is not applicable and cite the alternate proof.>

## Fix list
1. <ID and final status> — <criterion or gate, location, expected and actual>
   <Red and Green evidence, fix commit or environment remedy, remaining blocker>

## Open checks
<Remaining technical gaps, scope findings and blockers, with causes>

## DSGVO
<Audit scope and checks performed, limits and open operator evidence>
- WARN ? <finding or coverage gap, evidence, impact, suggested fix or follow-up>
<If no findings, state the outcome for the tested scope>
```

Use `Pass` only when all four gates are green, all ACs and Musts are fully
evidenced, the independent review is complete with no open blocking findings,
all applicable browser paths passed, and no other blocking finding remains.
A fully evidenced browser fallback qualifies. Otherwise use `Issues found`. Commit
the final report alone as `docs(spec): add verification report for <slug>` with a
path-limited commit.
Keep the tested implementation SHA in the report. Show the verdict, fixed and
open findings, gate outcomes, review and browser results (including any fallback),
advisory DSGVO results and report path to the user.
