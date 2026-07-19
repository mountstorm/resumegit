'use client';

import Link from 'next/link';
import { useState } from 'react';
import { branchColor } from '@/lib/color';
import type { LogEntry } from '@/lib/repo';

/** Commit graph with clickable branch-filter chips. */
export function TimelineView({ entries, branches }: { entries: LogEntry[]; branches: string[] }) {
  const [filter, setFilter] = useState<string | null>(null);
  const visible = filter ? entries.filter((e) => e.branches.includes(filter)) : entries;

  return (
    <>
      <div className="filterbar">
        <button className={`toggle ${filter === null ? 'active' : ''}`} onClick={() => setFilter(null)}>
          all branches
        </button>
        {branches.map((branch) => (
          <button
            key={branch}
            className={`toggle ${filter === branch ? 'active' : ''}`}
            onClick={() => setFilter(filter === branch ? null : branch)}
          >
            <span className="dot" style={{ background: branchColor(branch) }} />
            {branch}
          </button>
        ))}
      </div>
      <div className="card graph">
        {visible.map((entry) => {
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
        {visible.length === 0 && <p className="skip">No commits on this branch yet.</p>}
      </div>
    </>
  );
}