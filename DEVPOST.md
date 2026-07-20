# Devpost submission — paste-ready draft

> Fill in before submitting: [VIDEO_URL], [DEPLOY_URL], [CODEX_SESSION_ID], and
> adjust any workflow numbers to what actually happened in your Codex sessions.

**Project name:** resumeGit
**Tagline:** Git version control for your resume — one branch per application, one
commit to update them all.
**Category:** Apps for your life

---

## Inspiration

I'm a CS student at Ole Miss, and I apply to internships constantly. Every
application means tailoring my resume — and every tailoring means another file:
`resume_final_v2.pdf`, `resume_final_v3_GOOGLE.pdf`, `resume_NEW_final.pdf`. Last
month I couldn't answer a simple question in an interview: *which version of my
resume did this company actually see?*

I'm also a TA, a research assistant, and an intern — my resume changes monthly.
Every change has to be re-applied by hand to every tailored copy, and good bullets
die in forgotten files. Version control solved exactly this problem for code twenty
years ago. My resume is the one document in my life that genuinely needs branches.
So during Build Week, I gave it branches.

## What it does

resumeGit stores your resume as structured YAML in a **real git repository** — git
is the database, not a metaphor.

- **Branch per application.** Paste a job description (required — the app parses
  it) and GPT-5.6 tailors a branch: reorders and rewrites within a fixed
  Jake's-resume structure, omits items *with recorded reasons*, and derives a
  "voice" for the branch. It also extracts the skills the JD demands and shows
  **matched vs. missing** as green/red chips — honest gap analysis before you apply.
- **Semantic merge — the centerpiece.** Commit a new experience to main once, and
  the engine propagates it into every open branch, rewritten in each branch's own
  voice. My AI-engineering branch describes my new project as inference and
  simulation work; my robotics branch skips it with a stated reason. Every
  propagation is a reviewable before/after card that lands as a real git commit.
- **Diffs and blame with receipts.** Any two versions compare in recruiter terms
  ("drops NeuraBash, rewords the robotics research") next to a red/green line diff.
  Every bullet traces to the commit that introduced it and an evidence link — no
  silent resume inflation.
- **PDF out.** Any version — current or historical — downloads as a one-page
  LaTeX-style PDF, so "the exact resume I sent Boston Dynamics three weeks ago" is
  one click.

A hard **no-fabrication rule** runs through every AI operation: the model may
rephrase, reorder, or omit — never invent. Stable item ids make that checkable.

## How I built it (Codex + GPT-5.6)

I wrote the spec, architecture, and a property-based eval suite first, then built
the core in Codex with those docs in the repo as context — Codex session:
[CODEX_SESSION_ID].

- **Codex** built the git layer (`simple-git` repos with branch/commit/log/diff and
  bullet-level blame via `git log -S`) and its tests from my architecture doc,
  scaffolded the API routes and screens, and — most importantly — ran my
  prompt-iteration loop: I built `evals/` with scenarios like "propagate an ML
  project into a robotics branch" (correct answer: omit, with a reason) and
  iterated the propagation prompt inside Codex against those evals until every
  scenario passed repeatedly. My BUILDLOG.md in the repo records where Codex saved
  real time, entry by entry.
- **GPT-5.6** powers the three semantic operations — tailor, propagate, semantic
  diff — all via structured outputs (zod JSON schemas), so every response is
  schema-valid by construction. The interesting engineering was constraint design:
  stable ids the model may never change, a fixed section structure it may never
  reorder, omissions that must carry reasons, and a skills match extracted strictly
  from the JD text.

Key decisions: git as the only database (history, diffs, and blame come free and
honest); properties over golden outputs for LLM testing; import-don't-edit (the
week went into the merge engine, not a resume editor); and a deterministic mock
provider so judges can run the full app with zero config — add an OpenAI key and
the same interface switches to GPT-5.6.

## Challenges

- **Making an LLM merge trustworthy.** Free-text rewriting is easy; rewriting that
  provably preserves identity (ids), structure (section order), and truth (no new
  facts) took an eval suite and many prompt iterations — that loop, run inside
  Codex, was most of the real work.
- **Judging what to omit.** The model force-including everything was the early
  failure mode; "omit with a stated reason" turned out to need its own eval
  scenario before it behaved.

## What I'm proud of

The demo is my actual resume. The branches shown are real applications of the exact
tool I'll keep using after the hackathon — and the omission reasons it gives me are
honest enough to sting.

## What's next

Outcome tracking per branch (which resume versions get callbacks — A/B testing your
resume), auto-commit from GitHub activity, and a CLI (`resumegit tailor`).

## Try it

- Repo: https://github.com/mountstorm/resumegit (MIT; README has a 3-command
  quickstart that works with no API key)
- Live instance: [DEPLOY_URL]
- Demo video: [VIDEO_URL]

**Built with:** Next.js 15 · TypeScript · simple-git · OpenAI GPT-5.6 (structured
outputs) · Codex · @react-pdf/renderer · zod