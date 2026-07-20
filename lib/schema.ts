import { parse, stringify } from 'yaml';
import { z } from 'zod';

export const BulletSchema = z.object({
  id: z.string(),
  text: z.string(),
  evidence: z.string().optional()
});

// No zod defaults here: these schemas double as OpenAI structured-output formats,
// where strict mode requires every property present.
export const ItemSchema = z.object({
  id: z.string(),
  org: z.string(),
  role: z.string(),
  dates: z.string(),
  bullets: z.array(BulletSchema),
  tags: z.array(z.string())
});

export const SectionSchema = z.object({
  id: z.string(),
  items: z.array(ItemSchema)
});

export const SkillGroupSchema = z.object({
  category: z.string(),
  items: z.array(z.string())
});

export const ResumeSchema = z.object({
  basics: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    links: z.array(z.string())
  }),
  summary: z.string(),
  sections: z.array(SectionSchema),
  skills: z.array(SkillGroupSchema)
});

export const BranchMetaSchema = z.object({
  company: z.string(),
  role: z.string(),
  jd: z.string().default(''),
  voice: z.string().default(''),
  status: z.enum(['none', 'applied', 'interview', 'offer', 'rejected']).default('none'),
  omitted: z.array(z.object({ id: z.string(), reason: z.string() })).default([]),
  /** Parsed from the JD at tailor time: what it asks for vs. what the resume shows. */
  skills_matched: z.array(z.string()).default([]),
  skills_missing: z.array(z.string()).default([])
});

export type Bullet = z.infer<typeof BulletSchema>;
export type Item = z.infer<typeof ItemSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type Resume = z.infer<typeof ResumeSchema>;
export type BranchMeta = z.infer<typeof BranchMetaSchema>;

/** Parses and validates resume YAML; throws with a precise path on schema violations. */
export function parseResume(yamlText: string): Resume {
  return ResumeSchema.parse(parse(yamlText));
}

/** Serializes a resume to the canonical YAML stored in git. */
export function serializeResume(resume: Resume): string {
  return stringify(resume, { lineWidth: 100 });
}

/** Parses and validates a branch's application metadata YAML. */
export function parseBranchMeta(yamlText: string): BranchMeta {
  return BranchMetaSchema.parse(parse(yamlText));
}

/** Serializes branch metadata to the YAML stored in `.resumegit/branch.yaml`. */
export function serializeBranchMeta(meta: BranchMeta): string {
  return stringify(meta, { lineWidth: 100 });
}

/** All item and bullet ids in a resume — the identity set semantic ops must preserve. */
export function allIds(resume: Resume): Set<string> {
  const ids = new Set<string>();
  for (const section of resume.sections) {
    for (const item of section.items) {
      ids.add(item.id);
      for (const bullet of item.bullets) ids.add(bullet.id);
    }
  }
  return ids;
}

/** The fixed section structure (Jake's-resume convention); skills always render last. */
export const SECTION_ORDER = ['education', 'experience', 'projects'] as const;

/**
 * Restores the canonical section order in place. Sections are structural and
 * never a tailoring decision — emphasis lives in item order and inclusion.
 */
export function enforceSectionOrder(resume: Resume): Resume {
  const rank = (id: string) => {
    const index = SECTION_ORDER.indexOf(id as (typeof SECTION_ORDER)[number]);
    return index === -1 ? SECTION_ORDER.length : index;
  };
  resume.sections.sort((a, b) => rank(a.id) - rank(b.id));
  return resume;
}

/** Insert or replace an item (matched by id) in the given section. Returns a new resume. */
export function upsertItem(resume: Resume, sectionId: string, item: Item): Resume {
  const copy: Resume = structuredClone(resume);
  let section = copy.sections.find((s) => s.id === sectionId);
  if (!section) {
    section = { id: sectionId, items: [] };
    copy.sections.push(section);
  }
  for (const s of copy.sections) {
    s.items = s.items.filter((i) => i.id !== item.id);
  }
  section.items.unshift(item);
  return copy;
}