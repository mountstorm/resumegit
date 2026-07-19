'use client';

import { useState } from 'react';

interface Proposal {
  branch: string;
  company: string;
  include: boolean;
  reason: string;
  originalBullets: string[];
  rewrittenBullets: string[];
  resumeYaml: string | null;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function MergeReview() {
  const [org, setOrg] = useState('');
  const [role, setRole] = useState('');
  const [dates, setDates] = useState('');
  const [bullet, setBullet] = useState('');
  const [evidence, setEvidence] = useState('');
  const [tags, setTags] = useState('');
  const [section, setSection] = useState('projects');
  const [proposals, setProposals] = useState<Proposal[] | null>(null);
  const [approved, setApproved] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  function buildItem() {
    const id = slugify(org);
    return {
      id,
      org,
      role,
      dates,
      bullets: [{ id: `${id}-1`, text: bullet, ...(evidence ? { evidence } : {}) }],
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean)
    };
  }

  async function preview(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setDone('');
    const response = await fetch('/api/propagate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectionId: section, item: buildItem() })
    });
    setBusy(false);
    if (!response.ok) {
      const body = await response.json().catch(() => ({ error: response.statusText }));
      setError(body.error ?? 'preview failed');
      return;
    }
    const body = await response.json();
    setProposals(body.proposals);
    setApproved(new Set(body.proposals.filter((p: Proposal) => p.include).map((p: Proposal) => p.branch)));
  }

  async function apply() {
    if (!proposals) return;
    setBusy(true);
    setError('');
    const payload = proposals
      .filter((p) => p.include && p.resumeYaml && approved.has(p.branch))
      .map((p) => ({ branch: p.branch, resumeYaml: p.resumeYaml as string }));
    const response = await fetch('/api/propagate/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectionId: section, item: buildItem(), approved: payload })
    });
    setBusy(false);
    if (!response.ok) {
      const body = await response.json().catch(() => ({ error: response.statusText }));
      setError(body.error ?? 'apply failed');
      return;
    }
    setDone(`Committed to main and ${payload.length} branch(es).`);
    setProposals(null);
  }

  function toggle(branch: string) {
    const next = new Set(approved);
    if (next.has(branch)) next.delete(branch);
    else next.add(branch);
    setApproved(next);
  }

  return (
    <div className="stack">
      <div className="card">
        <h2>New experience → main</h2>
        <form onSubmit={preview}>
          <label htmlFor="section">Section</label>
          <select id="section" value={section} onChange={(e) => setSection(e.target.value)}>
            <option value="projects">projects</option>
            <option value="experience">experience</option>
          </select>
          <label htmlFor="org">Organization / project name</label>
          <input id="org" value={org} onChange={(e) => setOrg(e.target.value)} required />
          <label htmlFor="mrole">Your role</label>
          <input id="mrole" value={role} onChange={(e) => setRole(e.target.value)} required />
          <label htmlFor="dates">Dates (e.g. 2026-07/2026-07)</label>
          <input id="dates" value={dates} onChange={(e) => setDates(e.target.value)} required />
          <label htmlFor="bullet">What you did (one strong bullet)</label>
          <textarea id="bullet" value={bullet} onChange={(e) => setBullet(e.target.value)} required />
          <label htmlFor="evidence">Evidence link (repo, site — optional)</label>
          <input id="evidence" value={evidence} onChange={(e) => setEvidence(e.target.value)} />
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
          <p>
            <button disabled={busy}>{busy ? 'Running semantic merge…' : 'Preview merge'}</button>
          </p>
        </form>
      </div>

      {error && <p className="error">{error}</p>}
      {done && <p className="ok">{done}</p>}

      {proposals && (
        <>
          {proposals.map((p) => (
            <div className="card" key={p.branch}>
              <h2>
                {p.company} <span className="chip">{p.branch}</span>
              </h2>
              {p.include ? (
                <>
                  <div className="pair">
                    <div className="before">
                      <span className="tag">MAIN</span>
                      <ul className="bullets">
                        {p.originalBullets.map((b, i) => (<li key={i}>{b}</li>))}
                      </ul>
                    </div>
                    <div className="after">
                      <span className="tag">REWRITTEN FOR {p.company.toUpperCase()}</span>
                      <ul className="bullets">
                        {p.rewrittenBullets.map((b, i) => (<li key={i}>{b}</li>))}
                      </ul>
                    </div>
                  </div>
                  <p className="skip">{p.reason}</p>
                  <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      style={{ width: 'auto' }}
                      checked={approved.has(p.branch)}
                      onChange={() => toggle(p.branch)}
                    />
                    include in merge
                  </label>
                </>
              ) : (
                <p className="skip">Skipped: {p.reason}</p>
              )}
            </div>
          ))}
          <p>
            <button onClick={apply} disabled={busy}>
              {busy ? 'Committing…' : `Commit to main + ${approved.size} branch(es)`}
            </button>
          </p>
        </>
      )}
    </div>
  );
}