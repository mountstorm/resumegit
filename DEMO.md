# Demo video — script + filming guide (< 3:00, hard limit)

Judges watch dozens of these. The wow must land by 0:45; the required
Codex/GPT-5.6 audio must be explicit; a second over 3:00 risks disqualification.
Target 2:45 so an upload rounding error can't kill you.

## Before you record (30 min)

- Run in **real GPT-5.6 mode** (key in `.env`) — the mock's pass-through text
  guts the money moment. Do one full rehearsal run so responses are warm.
- Fresh seed: `rm -rf data && npm run seed && npm run dev`.
- Clean browser profile: no bookmarks bar, no extensions, hide the URL bar noise
  (⌘⇧F full screen), 100% zoom, light OR dark — pick one and stay.
- Have ready in a text file to paste live: one real JD (grab an actual posting,
  ~10 lines) and the new-experience fields (use resumeGit itself — org
  "resumeGit", one bullet about building it, tags `nextjs, llm, git`).
- Record the SAFETY TAKE first: one clean silent screen capture of the whole
  flow while everything works. If live narration takes fail, voice over this.

## The script

Format: [time] SCREEN — *what you do* — "what you say"

**[0:00–0:15] The hook — your downloads folder**
Show a folder with `resume_final_v2.pdf`, `resume_final_v3_GOOGLE.pdf`,
`resume_NEW_final.pdf` (stage it).
"This is real. I'm a CS student, I apply to internships every week, and I
tailor my resume for every one. I couldn't tell you which version any company
actually saw. Version control fixed this for code twenty years ago — so I
built git for resumes. This is resumeGit, and this is my actual resume."

**[0:15–0:45] THE MONEY MOMENT — Merge screen**
*Fill the form (paste prepared fields), click Preview merge. Cards appear.*
"I just shipped a new project, so I commit it to main — once. Watch what
happens to my branches. My OpenAI application rewrites it in ML-systems
language... and my Boston Dynamics application *declines it, with a reason* —
it knows a robotics recruiter doesn't care. I approve, and these land as real
git commits."
*Click commit. Show the success line.*

**[0:45–1:15] Branch per application — Branches screen**
*Paste the real JD into the form, create branch. New card appears.*
"Every application is a branch. I paste the actual job description — required —
and GPT-5.6 tailors within a fixed structure: same sections every time, it only
reorders and omits *within* them, and every omission gets a reason. And it
parses the JD into a skills match — green is what my resume proves, red is
what I'm missing. It told me the truth before the recruiter did."
*Point at the ✓/✗ chips.*

**[1:15–1:45] Receipts — Resume screen**
*Toolbar: switch "viewing" to a branch, set "compare vs" main.*
"Any two versions diff in plain English — drops this, rewords that — and below
it, the literal red-green git diff, because you shouldn't have to trust the
summary."
*Toggle blame on, hover a bullet.*
"Blame, for your resume: every bullet shows the commit that introduced it and a
link to the evidence. Nothing on this document is unsourced."

**[1:45–2:00] PDF out**
*Click download PDF on the branch. Open the file.*
"And any version — including the exact resume I sent a company last month —
downloads as a clean one-page PDF."

**[2:00–2:40] REQUIRED BEAT — how it was built (Codex + GPT-5.6)**
*Screen: the repo README, then evals running green, then BUILDLOG.md for 2s.*
"Under the hood every resume is a real git repository — git is the database.
The semantic operations — tailor, merge, diff — are GPT-5.6 with structured
outputs, constrained hard: stable ids, fixed structure, no invented facts. I
built the core in Codex: it wrote the git layer and its tests from my
architecture doc, and I iterated the merge prompt inside Codex against this
property-based eval suite until every scenario passed. My build log records
exactly where Codex saved me hours."

**[2:40–2:55] Close**
*Back to the timeline, commit graph visible.*
"resumeGit. Commit your life once — every application stays current, with
receipts. Built with Codex and GPT-5.6."
*End card: repo URL + live URL, 3 seconds.*

## Production notes

- **Audio beats video.** Record voiceover separately over the safety take if
  live narration stumbles. Quiet room, phone earbuds mic minimum, no music
  under the Codex section (judges listen for it).
- **One idea per shot.** Don't mouse-wander; move deliberately, pause after
  each click so viewers register the result.
- **Numbers on screen, names in audio.** Say "it declined it with a reason";
  let the card show the reason text.
- **Edit:** iMovie/CapCut is fine. Cut dead air between clicks. No zoom
  effects; a static 1080p screen with crisp audio reads as professional.
- **YouTube:** upload as Public (rules require public), title "resumeGit —
  OpenAI Build Week demo", check it plays at 1080p before submitting; captions
  auto-generate then fix the words "Codex" and "GPT-5.6" — judges may skim
  the transcript for them.
- **Timing check:** read the script aloud twice with a stopwatch BEFORE
  recording. If over 2:45, cut from section 3, never from 0:15–0:45 or the
  Codex beat.

## Submission checklist (Devpost form)

- [ ] Category: Apps for your life
- [ ] Description: paste from DEVPOST.md (fill VIDEO_URL, DEPLOY_URL, session id)
- [ ] Video: public YouTube link, < 3:00, audio covers Codex AND GPT-5.6
- [ ] Repo: github.com/mountstorm/resumegit (public, MIT, README quickstart)
- [ ] /feedback Codex session ID from the main build session
- [ ] Submit by noon PT on Jul 21 — not 4:59