# Codex build plan

The rules require the majority of core functionality be built in Codex with GPT-5.6,
and the submission includes the `/feedback` session ID from that work. So: do the
build in ONE main Codex session (side sessions are fine for spikes, but keep the core
in the main one). Keep SPEC.md and ARCHITECTURE.md in the repo root — Codex reads
them for context, which is exactly the "how Codex accelerated you" story judges want.

## Session 0 — setup (30 min, before build week if allowed)

- `npx create-next-app@latest resumegit --ts --app`
- `npm i simple-git openai yaml zod`
- Copy SPEC.md, ARCHITECTURE.md, evals/ into the repo. Commit. This is the seed
  context that makes every Codex prompt 5× more effective.

## Day-by-day (solo pace, MVP by day 5)

**Day 1 — the git core.**
Prompt Codex: implement `lib/repo.ts` per ARCHITECTURE.md — init resume repo from
YAML, commit, branch, log, checkout file at ref, diff refs. Plus `lib/schema.ts`
(zod for resume.yaml). Ask Codex for unit tests against a temp dir. No UI, no AI yet.
*Definition of done: tests green on init/commit/branch/log/diff.*

**Day 2 — the three GPT-5.6 ops.**
Prompt Codex: implement `lib/ai.ts` — tailor, propagate, semantic_diff, each with a
JSON schema (structured outputs), prompts loaded from `lib/prompts/*.md`. Then wire
`evals/run.ts` to score propagate against the scenarios. Iterate the prompt in Codex
until all scenarios pass. **This day is the project.** Budget the whole day.

**Day 3 — API + merge review screen.**
Route handlers per ARCHITECTURE.md, then the Merge Review screen (screen 3) end to
end: commit item on main → propagate → per-branch diffs → approve → commits land.
*Definition of done: the demo's money moment works clicking through the UI.*

**Day 4 — the other three screens + render.**
Timeline, Branches, Resume view with blame toggle. HTML render template with print
CSS. Seed script: `npm run seed` builds the demo resume with 3 branches (use
evals fixtures) so judges get a working instance instantly.

**Day 5 — polish + reliability.**
Run the eval suite 10×; fix any flaky prompt behavior. Error states, loading states,
empty states. Deploy (Vercel/Fly with a persistent volume for repos, or Railway).
Record a fallback screen capture of the perfect run NOW, while it works.

**Day 6 — stretch, in strict order.**
1. Outcome tracking with seeded stats. 2. CLI wrapper. 3. GitHub auto-commit.
Stop the moment anything threatens Day 5 stability.

**Day 7 — submission.**
Demo video (see DEMO.md), README (setup + judge test account + sample data), Devpost
form, `/feedback` session ID from the main Codex session, repo access for
testing@devpost.com and build-week-event@openai.com.

## Notes for the "how you used Codex" section (collect as you go)

Keep a `BUILDLOG.md`, one honest line whenever Codex saves you real time, e.g.:
- "Codex wrote the whole simple-git layer + tests from ARCHITECTURE.md in one shot"
- "Iterated the propagate prompt 9 times against evals inside Codex; pass rate X→Y"
- "Codex caught the ref-vs-branch checkout bug from the failing test output"
Judges explicitly score this; a concrete log beats vague praise.

## Key decisions already made (say so in the submission — judges reward clarity)

- Real git as the database (no DB) — honesty of the metaphor + free history/diff.
- Stable item ids — what makes semantic merge tractable and testable.
- Property-based evals over golden outputs — LLM text varies; properties don't.
- Import-not-edit — the week goes into the merge engine, not an editor.