import { parseUnifiedDiff } from '@/lib/diff';

/** Colored line diff — green additions, red deletions, like a code-review pane. */
export function DiffView({ raw }: { raw: string }) {
  const lines = parseUnifiedDiff(raw);
  if (lines.length === 0) return null;
  return (
    <div className="diffview" role="figure" aria-label="line diff">
      {lines.map((line, i) => (
        <div key={i} className={`dl ${line.kind}`}>
          <span className="gutter">
            {line.kind === 'add' ? '+' : line.kind === 'del' ? '−' : ''}
          </span>
          <span className="text">{line.text}</span>
        </div>
      ))}
    </div>
  );
}
