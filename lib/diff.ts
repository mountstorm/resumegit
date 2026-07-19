/** One rendered line of a unified diff. */
export interface DiffLine {
  kind: 'add' | 'del' | 'context' | 'hunk';
  text: string;
}

/**
 * Parses unified diff output into renderable lines.
 * File headers (---, +++, diff, index) are dropped; hunk markers are kept as
 * separators so the reader sees where jumps happen.
 */
export function parseUnifiedDiff(raw: string): DiffLine[] {
  const lines: DiffLine[] = [];
  for (const line of raw.split('\n')) {
    if (
      line.startsWith('diff ') || line.startsWith('index ') ||
      line.startsWith('--- ') || line.startsWith('+++ ') || line === ''
    ) {
      continue;
    }
    if (line.startsWith('@@')) lines.push({ kind: 'hunk', text: line });
    else if (line.startsWith('+')) lines.push({ kind: 'add', text: line.slice(1) });
    else if (line.startsWith('-')) lines.push({ kind: 'del', text: line.slice(1) });
    else lines.push({ kind: 'context', text: line.slice(1) });
  }
  return lines;
}
