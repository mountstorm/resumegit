# Demo video script (< 3:00)

One take, screen + voiceover. The wow must land by 0:40. Record the fallback capture
on Day 5 while everything works.

**0:00–0:15 — the hook (face or voiceover, show the folder).**
"This is my actual downloads folder: resume_final_v2, resume_final_v3_GOOGLE,
resume_NEW_final. I'm a CS student — I update my resume weekly and tailor it for
every application. Version control solved this for code 20 years ago. So I built
git for resumes."

**0:15–0:40 — THE MOMENT.**
Screen: Merge Review. "Last week I shipped a World Cup prediction model. Watch — I
commit it once to main…" (commit) "…and resumeGit propagates it into every tailored
branch I have open — rewritten for each one. My Stripe branch describes it as a
probabilistic modeling pipeline; my frontend branch leads with the dashboard. One
commit, every resume current, each in its own voice." (approve-all, commits land)

**0:40–1:10 — branch per application.**
Paste a real JD. "New application = new branch. GPT-5.6 reads the JD, reorders my
sections, rewrites emphasis, and records what it dropped and why. The branch list is
my application tracker — I always know exactly which resume went where."

**1:10–1:40 — diff, log, blame.**
Semantic diff between two branches ("leads with projects, drops retail job"). Career
timeline from git log. Blame toggle: hover a bullet → when it was added + evidence
link. "Every claim on my resume has a receipt."

**1:40–2:20 — how it's built: Codex + GPT-5.6 (required beat).**
Repo on screen. "Under the hood every resume is a real git repository — git is the
database. The semantic operations are GPT-5.6 with structured outputs, and the merge
engine is tested by a property-based eval suite. I built the core in Codex: it wrote
the git layer and its tests from my architecture doc in one shot, and I iterated the
propagation prompt against the evals inside Codex until it passed every scenario."
(Show BUILDLOG.md for 2 seconds, eval run going green.)

**2:20–2:50 — close.**
Stats screen if stretch landed ("project-led versions get 3× the callbacks") else the
rendered PDF. "resumeGit — commit your life once, every application stays current.
Built with Codex and GPT-5.6." URL on screen.

## Recording rules
- Seeded demo account, network-independent where possible; no live typing of prompts.
- Rehearse until the merge propagation is boring. If a live model call is risky,
  the fallback capture IS the video — judges never see the difference.
- Mic quality matters more than video quality.