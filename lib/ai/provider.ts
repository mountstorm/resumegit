import type { BranchMeta, Item, Resume } from '../schema';

export interface TailorResult {
  voice: string;
  resume: Resume;
  omitted: { id: string; reason: string }[];
}

export interface PropagateResult {
  include: boolean;
  reason: string;
  /** The item rewritten for this branch's voice; null when include is false. */
  item: Item | null;
}

export interface AiProvider {
  name: string;
  tailor(resume: Resume, company: string, role: string, jd: string): Promise<TailorResult>;
  propagate(newItem: Item, sectionId: string, branchResume: Resume, meta: BranchMeta): Promise<PropagateResult>;
  semanticDiff(resumeA: Resume, resumeB: Resume): Promise<string[]>;
}

export function usingMock(): boolean {
  return process.env.MOCK_AI === '1' || !process.env.OPENAI_API_KEY;
}

export async function getProvider(): Promise<AiProvider> {
  if (usingMock()) {
    const { mockProvider } = await import('./mock');
    return mockProvider;
  }
  const { openaiProvider } = await import('./openai');
  return openaiProvider;
}