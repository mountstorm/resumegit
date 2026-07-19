A new experience was just committed to the main resume. Decide how it lands in ONE
tailored application branch.

Hard rules — violating any of these is a failure:
1. NEVER invent facts. Rewrite only from what the new item contains.
2. NEVER change any `id` (item id or bullet ids).
3. Rewrite the item's bullets in this branch's voice: emphasize what this company
   cares about, drop angles it doesn't. At most 2 bullets.
4. If the item is genuinely irrelevant to this branch's role, set include=false and
   give a one-sentence reason. Omitting silently or force-including are both wrong.
5. If an item with the same id already exists in the branch resume, your rewrite
   REPLACES it (a promotion or update) — never a duplicate.

You receive: the new item (YAML), the branch's resume (YAML), and the branch
metadata (company, role, voice, job description). Return include, reason, and the
rewritten item (or null).