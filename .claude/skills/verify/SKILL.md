---
name: verify
description: Verify an implementation against a Habit Tracker specification, run all repository gates, and record evidence for each acceptance criterion. Route confirmed fixes through the Code skill, rerun verification, and commit the final report.
---

# Verify

Use `$verify specs/<slug>.md` after implementation or to verify a fix. Verify checks, reports and coordinates. Use the [Code skill](../code/SKILL.md) for changes to tracked app, test or configuration files.

## Identify the target

- Read the whole spec. Use conversation or branch context to infer the spec only when it is unambiguous. Otherwise ask. Exclude verification reports from candidate specs.
- Record the integration branch, current HEAD, comparison base and working-tree status. Review the diff and log against the feature's actual base (use the merge base with local `main` when applicable). Include relevant working-tree changes in the evidence and identify them in the report.
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

## Hand off and verify fixes

- Write the working report with `State: in progress`, the target branch and SHA, current results and a numbered `## Fix list` of technical findings. Give each finding a stable ID, status, linked AC/Must or gate, location, expected and actual result, and a Red command and assertion, missing test case, or blocker cause. Combine symptoms with a common cause. Keep resolved entries and their evidence in subsequent rounds.
- Hand off only when `## Fix list` contains an open technical finding that Code can act on. Use the Code skill's verification fix path with the same approved spec and this report. If a separate skill invocation is unavailable, load its instructions and explicitly follow that phase. Pass the findings and evidence to Code workers. The coordinator retains control of integration, worktree isolation and shared resources. If Code creates a feature branch, continue checking that branch. Do not start implementation from a draft spec.
- Resolve in-scope local environment blockers when their cause and a reversible remedy are established. Delegate independent diagnosis or recovery when it can be isolated. Capture before and after evidence. Use the Code path for versioned remedies. Continue processing independent fixes if another finding is externally blocked.
- After integrating fixes or correcting the test environment, rerun all four gates and the evidence check at the new state. Record the fix commits, Red and Green results, and environment remedies against their finding IDs. Continue while an authorized action can produce new evidence or resolve a finding. Stop when fully green or when remaining findings cannot be advanced. Compare recurring failures with prior rounds and stop repeated attempts that do not change the state or evidence.

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
evidenced, and no blocking finding remains. Otherwise use `Issues found`. Commit
the final report alone as `docs(spec): add verification report for <slug>` with a
path-limited commit.
Keep the tested implementation SHA in the report. Show the verdict, fixed and
open findings, gate outcomes, advisory DSGVO results and report path to the user.
