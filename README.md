# resumeGit

**Git version control for your resume.** One branch per job application. Commit a new
experience once, and a GPT-5.6 semantic merge engine propagates it into every tailored
branch — rewritten in each branch's own voice.

Built for **OpenAI Build Week** · Track: *Apps for your life*

## Why

Students update their resume constantly and tailor a copy for every application. The
result is `resume_final_v3_GOOGLE.pdf`, forgotten variants, and lost bullets. Version
control solved this for code twenty years ago — resumes are the one document that
genuinely needs branches.

## What it does

| Feature | How |
|---|---|
| **Real git under the hood** | Every resume is an actual git repository (git *is* the database — no other storage). Content is structured YAML rendered to a clean, printable page. |
| **Branch per application** | Paste a job description → GPT-5.6 tailors a branch: reorders emphasis, rewrites bullets, records what it omitted and why. The branch list is your application tracker. |
| **Semantic merge** | Commit a new experience to `main` → the engine rewrites it for every live branch (the data-platform branch talks pipelines, the frontend branch talks interfaces), each landing as a reviewable commit. |
| **Semantic diff** | Any two versions compared in recruiter terms ("leads with projects, drops the retail job"), with the raw git diff one click away. |
| **Blame with receipts** | Every bullet traces to the commit that introduced it and an evidence link. No silent resume inflation. |

**No-fabrication rule:** every prompt hard-requires the model to only rephrase,
reorder, or omit — never invent facts. Stable item ids make this checkable.

## Quickstart

```bash
npm install
npm run seed     # demo resume + two tailored branches (deterministic, no AI needed)
npm run dev      # → http://localhost:3000
```

Works immediately with **no API key** (deterministic mock provider — full flow, no
prose rewriting). For real GPT-5.6 semantic operations:

```bash
cp .env.example .env   # set OPENAI_API_KEY (model defaults to gpt-5.6)
```

Reset the demo anytime: `rm -rf data && npm run seed`

### The 3-minute tour

1. **Branches** → paste any company/role/JD → *Tailor & create branch*
2. **Merge** → add a new experience → *Preview merge* → per-branch before/after cards → commit
3. **Timeline** → the commit graph across your whole career
4. **Resume** → rendered view of any ref · *show blame* · *diff vs main*

## How it's built

```
lib/
  schema.ts        Resume + branch metadata models (zod). Stable item/bullet ids are
                   the identity system the whole product hangs on.
  repo.ts          The git layer (simple-git): init, branch, commit, log, diff, and
                   bullet-level blame via `git log -S`. All ops serialized by a lock.
  engine.ts        Product logic: tailor → branch, preview/apply semantic merge.
  ai/provider.ts   The 3-operation AI interface (tailor, propagate, semanticDiff).
  ai/openai.ts     GPT-5.6 with structured outputs (JSON schema enforced by zod).
  ai/mock.ts       Deterministic no-key stand-in so the app always runs.
  prompts/*.md     Versioned system prompts — never inline strings.
app/
  page.tsx         Timeline — commit graph, per-branch colors
  branches/        Application branches + tailor form
  merge/           Merge review: the before/after approval screen
  resume/          Rendered resume (serif, print-ready), blame, diff views
  api/             tailor · propagate (preview) · propagate/apply · diff
evals/
  run.ts           Property-based eval runner for the merge engine
  scenarios/*.yaml 4 scenarios: voice rewrite ×2, correct omission, same-id update
scripts/seed.ts    Deterministic demo state for judges
```

### Design decisions

- **Git as the database.** History, branching, diffs, and blame come free and honest —
  the git verbs in the UI are literal, not a metaphor.
- **Stable ids, free wording.** Branches may rewrite any text but never an id. That's
  what makes semantic merges tractable and testable.
- **Properties over golden outputs.** LLM wording varies; the eval suite asserts
  properties (item present/omitted with reason, ids stable, voice vocabulary, bullet
  caps) instead of exact text.
- **Import, don't edit.** The resume arrives as YAML; the week went into the merge
  engine, not an editor.

## Testing

```bash
npm run evals            # merge-engine scenarios against the real model
npm run evals -- --mock  # plumbing checks only (language properties skipped)
npm run typecheck
```

## License

MIT — see [LICENSE](LICENSE).

## Hackathon docs

| Doc | Contents |
|---|---|
| [SPEC.md](SPEC.md) | Product spec, cutlines, judging map |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Full technical design |
| [CODEX_PLAN.md](CODEX_PLAN.md) | Build plan and submission checklist |
| [DEMO.md](DEMO.md) | The <3:00 demo video script |