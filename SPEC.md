# resumeGit — git version control for your resume

**Track:** Apps for your life
**Pitch:** Your resume is the one document that needs branches. resumeGit gives every
application its own tailored branch, and when your life changes, one commit to `main`
propagates into every branch — rewritten in each branch's own voice by GPT-5.6.

## The problem (the 10-second story)

Students update their resume constantly: new project, new class, new internship. They
tailor a copy per application, end up with `resume_final_v3_GOOGLE.pdf`, forget which
version went where, and lose good bullets in dead copies. Version control solved this
for code 20 years ago.

## Core features (MVP — must all work on camera)

### 1. Real git under the hood
Each resume is an actual git repository. Content is structured YAML (`resume.yaml`),
rendered to a clean PDF/HTML. Commits, branches, log, and diff are literal git verbs,
not metaphors.

### 2. Branch per application
"Tailor for this job" + pasted JD → agent creates a branch named after the company,
re-orders and rewrites emphasis for the role, and records the JD in the branch. The
branch list IS your application tracker.

### 3. Semantic merge (the centerpiece)
Commit a new experience to `main` → agent propagates it into every live branch,
rewritten in that branch's voice (the data-engineering branch stresses pipelines, the
frontend branch stresses UI). Not a text merge — a meaning merge. Each propagation is
a real commit on that branch with a diff the user reviews.

### 4. Semantic diff
Diff view between any two versions in human terms: "Stripe branch leads with projects,
drops the retail job, tightens summary to fintech" — alongside the raw YAML diff.

### 5. Blame with receipts
Every bullet carries optional `evidence` (URL, repo, course). `blame` view shows when
each bullet was added, on which branch, and its evidence. Kills quiet resume inflation.

## Stretch (only if MVP is solid)

- **Outcome tracking:** mark each branch applied/interview/offer; surface stats like
  "project-led versions get 3× callbacks." Demo with seeded data.
- **Auto-commit from GitHub:** new public repo → agent drafts a bullet as a PR on main.
- **CLI** (`resumegit tailor`, `resumegit merge`) for the dev-judge flex.

## Explicitly NOT building

- A resume editor. Import from existing resume text/YAML; edit as YAML. Editing UIs
  are where hackathon weeks go to die.
- Auth/multi-user. One local user, one demo account for judges.
- Template gallery. One excellent render template.

## Judging map

| Criterion | Answer |
|---|---|
| Working project | Web app + seeded demo account judges can click |
| Wow by 0:40 | Live semantic merge propagating across 3 branches |
| GPT-5.6 usage | Semantic merge/diff/tailor = structured-output reasoning tasks |
| Codex usage | Entire core built in Codex sessions (see CODEX_PLAN.md) |
| Authentic story | Built by a student who applies to jobs weekly |
