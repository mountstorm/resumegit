import { getProvider } from './ai/provider';
import {
  commitResume,
  createApplicationBranch,
  listApplicationBranches,
  readBranchMeta,
  readResume,
  MAIN
} from './repo';
import {
  enforceSectionOrder,
  parseResume,
  serializeBranchMeta,
  serializeResume,
  upsertItem,
  type Item,
  type Resume
} from './schema';

export interface Proposal {
  branch: string;
  company: string;
  include: boolean;
  reason: string;
  /** Bullets as committed to main, for the side-by-side view. */
  originalBullets: string[];
  /** Bullets rewritten in this branch's voice; empty when include is false. */
  rewrittenBullets: string[];
  /** Full prospective resume YAML for this branch — what apply will commit. */
  resumeYaml: string | null;
}

/** Run the semantic merge across every application branch. No commits — preview only. */
export async function previewPropagation(newItem: Item, sectionId: string): Promise<Proposal[]> {
  const provider = await getProvider();
  const proposals: Proposal[] = [];
  for (const branch of await listApplicationBranches()) {
    const meta = await readBranchMeta(branch);
    if (!meta) continue;
    const branchResume = await readResume(branch);
    const result = await provider.propagate(newItem, sectionId, branchResume, meta);
    const prospective =
      result.include && result.item ? upsertItem(branchResume, sectionId, result.item) : null;
    proposals.push({
      branch,
      company: meta.company,
      include: result.include,
      reason: result.reason,
      originalBullets: newItem.bullets.map((b) => b.text),
      rewrittenBullets: result.item?.bullets.map((b) => b.text) ?? [],
      resumeYaml: prospective ? serializeResume(prospective) : null
    });
  }
  return proposals;
}

/** Commit the new item to main, then land each approved proposal on its branch. */
export async function applyPropagation(
  newItem: Item,
  sectionId: string,
  approved: { branch: string; resumeYaml: string }[]
): Promise<{ mainCommit: string; branchCommits: Record<string, string> }> {
  const mainResume = await readResume(MAIN);
  const mainCommit = await commitResume(
    MAIN,
    upsertItem(mainResume, sectionId, newItem),
    `Add ${newItem.id} to ${sectionId}`
  );
  const branchCommits: Record<string, string> = {};
  for (const { branch, resumeYaml } of approved) {
    branchCommits[branch] = await commitResume(
      branch,
      parseResume(resumeYaml),
      `Merge ${newItem.id} from main (semantic)`
    );
  }
  return { mainCommit, branchCommits };
}

/** Tailor main for a JD and create the application branch. */
export async function createTailoredBranch(
  company: string,
  role: string,
  jd: string
): Promise<{ branch: string; voice: string; omitted: { id: string; reason: string }[] }> {
  const provider = await getProvider();
  const mainResume: Resume = await readResume(MAIN);
  const result = await provider.tailor(mainResume, company, role, jd);
  // Structure is non-negotiable: whatever the model returns, sections stay canonical.
  enforceSectionOrder(result.resume);
  const branch = company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const meta = serializeBranchMeta({
    company, role, jd,
    voice: result.voice,
    status: 'none',
    omitted: result.omitted
  });
  await createApplicationBranch(branch, result.resume, meta, `Tailor for ${company} — ${role}`);
  return { branch, voice: result.voice, omitted: result.omitted };
}