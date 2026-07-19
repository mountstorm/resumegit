import type { BranchMeta, Item, Resume } from '../schema';

/** Output of tailoring the main resume for one job application. */
export interface TailorResult {
  voice: string;
  resume: Resume;
  omitted: { id: string; reason: string }[];
}

/** Output of the semantic merge for a single branch: land it, or skip with a reason. */
export interface PropagateResult {
  include: boolean;
  reason: string;
  /** The item rewritten for this branch's voice; null when include is false. */
  item: Item | null;
}

/**
 * The three semantic operations resumeGit needs from a language model.
 * Two implementations: `openai` (GPT-5.6, structured outputs) and `mock`
 * (deterministic heuristics so the app runs with no API key).
 */
export interface AiProvider {
  name: string;
  tailor(resume: Resume, company: string, role: string, jd: string): Promise<TailorResult>;
  propagate(newItem: Item, sectionId: string, branchResume: Resume, meta: BranchMeta): Promise<PropagateResult>;
  semanticDiff(resumeA: Resume, resumeB: Resume): Promise<string[]>;
}

/** Mock mode is forced by MOCK_AI=1, or implied by a missing API key. */
export function usingMock(): boolean {
  return process.env.MOCK_AI === '1' || !process.env.OPENAI_API_KEY;
}

/** Selects the active provider. Imports lazily so mock mode never loads the SDK. */
export async function getProvider(): Promise<AiProvider> {
  if (usingMock()) {
    const { mockProvider } = await import('./mock');
    return mockProvider;
  }
  const { openaiProvider } = await import('./openai');
  return openaiProvider;
}