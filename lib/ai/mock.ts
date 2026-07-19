import type { BranchMeta, Item, Resume } from '../schema';
import type { AiProvider, PropagateResult, TailorResult } from './provider';

/**
 * Deterministic stand-in for GPT-5.6 so the app runs end-to-end with no API key.
 * Heuristics are intentionally simple: real semantic quality comes from the real
 * provider; the mock only has to be sensible and stable.
 */

const TECH_WORDS = ['python', 'data', 'pipeline', 'model', 'react', 'nextjs', 'sqlite', 'sklearn', 'automation'];

function voiceFor(role: string): string {
  const r = role.toLowerCase();
  if (r.includes('front')) return 'product and interface emphasis, user-facing outcomes';
  if (r.includes('data') || r.includes('quant')) return 'data-infrastructure emphasis, quantified impact';
  return 'impact-first, concise, technical';
}

function relevant(item: Item, meta: BranchMeta): boolean {
  const haystack = `${meta.role} ${meta.voice} ${meta.jd}`.toLowerCase();
  if (item.tags.some((t) => haystack.includes(t.toLowerCase()))) return true;
  return item.tags.some((t) => TECH_WORDS.includes(t.toLowerCase()));
}

export const mockProvider: AiProvider = {
  name: 'mock',

  async tailor(resume: Resume, _company: string, role: string, _jd: string): Promise<TailorResult> {
    const copy: Resume = structuredClone(resume);
    const r = role.toLowerCase();
    // Emphasis = order: technical roles lead with projects.
    if (r.includes('engineer') || r.includes('data') || r.includes('front')) {
      copy.sections.sort((a, b) => (a.id === 'projects' ? -1 : b.id === 'projects' ? 1 : 0));
    }
    for (const section of copy.sections) {
      for (const item of section.items) item.bullets = item.bullets.slice(0, 2);
    }
    return { voice: voiceFor(role), resume: copy, omitted: [] };
  },

  async propagate(
    newItem: Item, _sectionId: string, _branchResume: Resume, meta: BranchMeta
  ): Promise<PropagateResult> {
    if (!relevant(newItem, meta)) {
      return {
        include: false,
        reason: `Not relevant to a ${meta.role} application at ${meta.company}.`,
        item: null
      };
    }
    const rewritten: Item = structuredClone(newItem);
    rewritten.bullets = rewritten.bullets.slice(0, 2);
    return {
      include: true,
      reason: `Fits the ${meta.voice || voiceFor(meta.role)} focus of this branch.`,
      item: rewritten
    };
  },

  async semanticDiff(resumeA: Resume, resumeB: Resume): Promise<string[]> {
    const changes: string[] = [];
    const orderA = resumeA.sections.map((s) => s.id).join(' → ');
    const orderB = resumeB.sections.map((s) => s.id).join(' → ');
    if (orderA !== orderB) changes.push(`Section emphasis changed: ${orderA} vs ${orderB}`);

    const itemsA = new Map(resumeA.sections.flatMap((s) => s.items.map((i) => [i.id, i] as const)));
    const itemsB = new Map(resumeB.sections.flatMap((s) => s.items.map((i) => [i.id, i] as const)));
    for (const [id, item] of itemsB) if (!itemsA.has(id)) changes.push(`Adds ${item.org} — ${item.role}`);
    for (const [id, item] of itemsA) if (!itemsB.has(id)) changes.push(`Drops ${item.org} — ${item.role}`);

    // Name exactly which entries were reworded, bullet by bullet.
    for (const [id, itemB] of itemsB) {
      const itemA = itemsA.get(id);
      if (!itemA) continue;
      const textsA = new Map(itemA.bullets.map((b) => [b.id, b.text]));
      const reworded = itemB.bullets.filter((b) => textsA.has(b.id) && textsA.get(b.id) !== b.text);
      if (reworded.length > 0) {
        changes.push(`Rewords ${itemA.org} (${reworded.length} bullet${reworded.length > 1 ? 's' : ''})`);
      }
    }
    if (changes.length === 0) changes.push('No differences between these versions');
    return changes.slice(0, 5);
  }
};