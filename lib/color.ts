/** Stable hue per branch name — color follows the branch, everywhere it appears. */
export function branchColor(name: string): string {
  if (name === 'main') return 'var(--accent)';
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const hue = hash % 360;
  return `hsl(${hue} 52% 44%)`;
}