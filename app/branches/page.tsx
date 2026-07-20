import Link from 'next/link';
import { branchColor } from '@/lib/color';
import { listApplicationBranches, readBranchMeta, repoExists } from '@/lib/repo';
import { TailorForm } from './tailor-form';

export const dynamic = 'force-dynamic';

export default async function BranchesPage() {
  if (!repoExists()) {
    return (
      <>
        <h1>Branches</h1>
        <p className="lede">Run <code>npm run seed</code> first.</p>
      </>
    );
  }
  const branches = await listApplicationBranches();
  const cards = await Promise.all(
    branches.map(async (branch) => ({ branch, meta: await readBranchMeta(branch) }))
  );
  return (
    <>
      <h1>Application branches</h1>
      <p className="lede">
        One branch per application. The list is your tracker: you always know exactly which
        resume went where.
      </p>
      <div className="stack">
        {cards.map(({ branch, meta }) => (
          <div className="card" key={branch}>
            <h2>
              {meta?.company ?? branch} — {meta?.role ?? ''}
            </h2>
            <div>
              <span className="chip">
                <span className="dot" style={{ background: branchColor(branch) }} />
                {branch}
              </span>
              <span className={`status ${meta?.status ?? 'none'}`}>{meta?.status ?? 'none'}</span>
            </div>
            {meta?.voice && <p className="lede" style={{ margin: '8px 0 0' }}>voice: {meta.voice}</p>}
            {meta && (meta.skills_matched.length > 0 || meta.skills_missing.length > 0) && (
              <p style={{ margin: '8px 0 0' }}>
                {meta.skills_matched.map((skill) => (
                  <span key={skill} className="skill match">✓ {skill}</span>
                ))}
                {meta.skills_missing.map((skill) => (
                  <span key={skill} className="skill miss">✗ {skill}</span>
                ))}
              </p>
            )}
            {meta && meta.omitted.length > 0 && (
              <p className="skip">
                omitted: {meta.omitted.map((o) => `${o.id} (${o.reason})`).join('; ')}
              </p>
            )}
            <p style={{ marginBottom: 0 }}>
              <Link className="chip" href={`/resume?ref=${branch}`}>view resume →</Link>
              <Link className="chip" href={`/resume?ref=${branch}&diff=main`}>diff vs main →</Link>
            </p>
          </div>
        ))}
        {cards.length === 0 && <p className="skip">No application branches yet — create one below.</p>}
      </div>
      <div className="card">
        <h2>New application</h2>
        <TailorForm />
      </div>
    </>
  );
}