# Merge-engine evals

Property-based scenarios for the `propagate` operation — the project's centerpiece.
Each scenario: a base resume item committed to main + a branch context → properties
the GPT-5.6 output MUST satisfy. Properties, not golden text: LLM wording varies,
properties don't.

Run all scenarios after every prompt change. Target: 100% pass, 10 consecutive runs,
before recording the demo.

## Scenario format

```yaml
name: <slug>
new_item: <the item being committed to main>
branch: <branch.yaml metadata — company, role, voice>
existing_resume: <path to fixture>
properties:
  - item_present: true|false        # should it appear in this branch at all?
  - id_stable: true                  # ids never rewritten
  - must_mention_any: [word, ...]    # branch-voice vocabulary
  - must_not_mention: [word, ...]    # wrong-voice vocabulary
  - max_bullets: N                   # tailoring means restraint
  - omission_reason_if_absent: true  # dropping silently is a failure
```

## Included scenarios

1. `propagate-data-branch.yaml` — ML project into a data-platform branch: must speak
   pipelines/modeling, not UI.
2. `propagate-frontend-branch.yaml` — same project into a frontend branch: must lead
   with dashboard/visualization, not regression math.
3. `propagate-irrelevant.yaml` — barista job into a quant-research branch: correct
   behavior is OMIT with a stated reason, not force-include.
4. `propagate-replace.yaml` — promotion at the same org: must UPDATE the existing
   item (same id), not duplicate it.