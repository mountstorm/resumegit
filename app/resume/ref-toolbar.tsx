'use client';

import { useRouter } from 'next/navigation';

interface Props {
  refs: string[];
  current: string;
  diffAgainst: string;
  blame: boolean;
}

/** Branch switcher + compare picker + blame toggle for the resume view. */
export function RefToolbar({ refs, current, diffAgainst, blame }: Props) {
  const router = useRouter();

  function navigate(ref: string, diff: string, blameOn: boolean) {
    const query = new URLSearchParams({ ref });
    if (diff && diff !== ref) query.set('diff', diff);
    if (blameOn) query.set('blame', '1');
    router.push(`/resume?${query.toString()}`);
  }

  return (
    <div className="toolbar">
      <label>
        viewing
        <select value={current} onChange={(e) => navigate(e.target.value, diffAgainst, blame)}>
          {refs.map((r) => (<option key={r} value={r}>{r}</option>))}
        </select>
      </label>
      <label>
        compare vs
        <select value={diffAgainst} onChange={(e) => navigate(current, e.target.value, blame)}>
          <option value="">—</option>
          {refs.filter((r) => r !== current).map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </label>
      <button className="toggle" aria-pressed={blame} onClick={() => navigate(current, diffAgainst, !blame)}>
        {blame ? 'blame on' : 'blame off'}
      </button>
      <button className="toggle" onClick={() => window.print()}>print / PDF</button>
    </div>
  );
}