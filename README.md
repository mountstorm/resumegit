# resumeGit — OpenAI Build Week

Git version control for your resume: a branch per application, and a GPT-5.6 semantic
merge engine that propagates one life update into every tailored branch, each in its
own voice. Every resume is a real git repository — git is the database.

**Track:** Apps for your life

## Run it

```bash
npm install
npm run seed        # demo resume + two tailored branches (deterministic, no AI)
npm run dev         # http://localhost:3000
```

Without an `OPENAI_API_KEY` the app runs in **mock mode** (deterministic AI stand-in,
full flow works). For real GPT-5.6 semantic ops: `cp .env.example .env` and set
`OPENAI_API_KEY` (model defaults to `gpt-5.6`).

- **Timeline** — every commit on every branch of your career
- **Branches** — one per application; paste a JD to tailor a new one
- **Merge** — commit a new experience once, review the per-branch rewrites, land them
- **Resume** — rendered view of any ref, with blame (per-bullet origin + evidence)

```bash
npm run evals            # property-based checks on the semantic merge (real model)
npm run evals -- --mock  # plumbing checks only (language properties skipped)
npm run typecheck
```

To reset the demo: `rm -rf data && npm run seed`.

## Design docs

| File | What it is |
|---|---|
| `SPEC.md` | Product spec: features, cutlines, judging map |
| `ARCHITECTURE.md` | Stack, resume schema, the three GPT-5.6 ops, API, screens |
| `CODEX_PLAN.md` | Day-by-day Codex build plan + submission checklist |
| `DEMO.md` | The <3:00 video script, beat by beat |
| `evals/` | Property-based scenarios for the semantic merge engine |

The application code gets built during build week in Codex (per hackathon rules — the
majority of core functionality must come from a Codex session, whose `/feedback` ID
goes in the submission). Start at `CODEX_PLAN.md`, Session 0.