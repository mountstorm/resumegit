# Architecture

## Stack

- **Next.js 15 (App Router, TypeScript)** — UI + API routes in one deployable.
- **Real git** via `simple-git` (shells to system git) — repos live in `data/repos/<resume-id>/`.
- **OpenAI SDK** with **GPT-5.6**, structured outputs (JSON schema) for every semantic op.
- **Render:** `resume.yaml` → HTML template → print-CSS PDF (browser print / Playwright for export).
- No database. Git is the database. Branch metadata lives in `.resumegit/` inside the repo.

## Resume schema (`resume.yaml`)

```yaml
basics: { name, email, location, links: [] }
summary: string
sections:                 # ordered; order IS emphasis
  - id: experience
    items:
      - id: cspire-2025   # stable id — CRITICAL for semantic merge identity
        org: C Spire
        role: Software Engineering Intern
        dates: 2025-05/2025-08
        bullets:
          - id: dar-1
            text: "Built a Python pipeline that ..."
            evidence: "https://github.com/..."   # optional — powers blame
        tags: [python, data]
  - id: projects
    items: [...]
  - id: education
    items: [...]
```

Stable `id`s let branches rewrite `text` freely while the merge engine still knows
"this is the same item." Tailoring changes order, emphasis, wording, inclusion —
never ids.

## Branch metadata (`.resumegit/branch.yaml`, committed per branch)

```yaml
company: Stripe
role: Data Platform Intern
jd: |
  <pasted job description>
voice: "fintech, data-infrastructure emphasis, quantified impact"
status: applied          # none|applied|interview|offer|rejected  (stretch)
```

## The three GPT-5.6 operations (all JSON-schema structured outputs)

1. **tailor(main resume, JD)** → new branch: reordered sections, rewritten bullets,
   dropped irrelevant items (recorded as `omitted: [ids]`), derived `voice`.
2. **propagate(new item, branch resume, branch metadata)** → the new item rewritten
   in this branch's voice + where to insert it + whether to omit (with reason).
   Run once per live branch; each result = one commit on that branch.
3. **semantic_diff(version A, version B)** → 3-5 human-readable change statements.

Prompts live in `lib/prompts/` as versioned files, never inline. Every op logs
request/response to `data/logs/` — judge-visible transparency and debugging.

## API surface (Next.js route handlers)

- `POST /api/resume` — import YAML/text → init repo, first commit
- `GET  /api/resume/:id/log` — git log across branches (the "career log" view)
- `POST /api/resume/:id/tailor` — body: {company, role, jd} → branch + commit
- `POST /api/resume/:id/commit` — body: new/edited item on main → commit
- `POST /api/resume/:id/propagate` — run merge engine across live branches → commits
- `GET  /api/resume/:id/diff?a=&b=` — raw + semantic diff
- `GET  /api/resume/:id/render?ref=` — HTML render of any ref

## UI (4 screens, no more)

1. **Timeline** — git log visualized as a career timeline; branch chips per commit.
2. **Branches** — card per application branch (company, role, status, last sync).
3. **Merge review** — the money screen: new item on the left, per-branch rewritten
   diffs on the right, approve-all or per-branch. THIS is the demo screen.
4. **Resume view** — rendered resume for any ref, with blame toggle (hover a bullet →
   when added, which branch, evidence link).

## Testing the centerpiece

`evals/` holds merge scenarios (see `evals/README.md`): input resume + branch + new
item → expected properties (item present, voice words used, ids stable, omissions
justified). A small runner script scores GPT-5.6 outputs against properties, not exact
text. Run it every time the prompt changes. This is what makes the demo reliable.