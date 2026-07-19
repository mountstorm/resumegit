import Link from 'next/link';
import { branchColor } from '@/lib/color';
import { fullLog, repoExists } from '@/lib/repo';

export const dynamic = 'force-dynamic';

export default async function TimelinePage() {
  if (!repoExists()) {
    return (
      <>
        <h1>Timeline</h1>
        <p className="lede">
          No resume repository yet. Run <code>npm run seed</code> to create the demo resume.
        </p>
      </>
    );
  }
  const log = await fullLog();
  return (
    <>
      <h1>Career timeline</h1>
      <p className="lede">
        Every commit across every branch of your resume — main is your life, branches are your
        applications.
      </p>
      <div className="card graph">
        {log.map((entry) => {
          const primary = entry.branches[entry.branches.length - 1] ?? 'main';
          return (
            <div className="commit" key={entry.hash}>
              <span className="node" style={{ background: branchColor(primary) }} />
              <div>
                <div className="msg">{entry.message}</div>
                <div className="meta">
                  <span className="date">
                    {new Date(entry.date).toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </span>
                  {entry.branches.map((branch) => (
                    <span key={branch} className="chip">
                      <span className="dot" style={{ background: branchColor(branch) }} />
                      {branch}
                    </span>
                  ))}
                  <Link className="chip link" href={`/resume?ref=${entry.hash}`}>
                    view →
                  </Link>
                </div>
              </div>
              <span className="hash">{entry.hash.slice(0, 7)}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}