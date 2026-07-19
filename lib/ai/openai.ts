import { readFile } from 'node:fs/promises';
import path from 'node:path';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { stringify as stringifyYaml } from 'yaml';
import { z } from 'zod';
import { ItemSchema, ResumeSchema, serializeResume, type BranchMeta, type Item, type Resume } from '../schema';
import type { AiProvider, PropagateResult, TailorResult } from './provider';

const MODEL = process.env.OPENAI_MODEL || 'gpt-5.6';

const client = new OpenAI();

async function prompt(name: string): Promise<string> {
  return readFile(path.join(process.cwd(), 'lib', 'prompts', `${name}.md`), 'utf8');
}

const TailorOutput = z.object({
  voice: z.string(),
  resume: ResumeSchema,
  omitted: z.array(z.object({ id: z.string(), reason: z.string() }))
});

const PropagateOutput = z.object({
  include: z.boolean(),
  reason: z.string(),
  item: ItemSchema.nullable()
});

const DiffOutput = z.object({ changes: z.array(z.string()).min(3).max(5) });

async function structured<T>(
  system: string,
  user: string,
  format: ReturnType<typeof zodResponseFormat>
): Promise<T> {
  const completion = await client.beta.chat.completions.parse({
    model: MODEL,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    response_format: format
  });
  const parsed = completion.choices[0]?.message.parsed;
  if (!parsed) throw new Error('model returned no parsed output');
  return parsed as T;
}

export const openaiProvider: AiProvider = {
  name: `openai:${MODEL}`,

  async tailor(resume: Resume, company: string, role: string, jd: string): Promise<TailorResult> {
    const user = [
      `Company: ${company}`, `Role: ${role}`, `Job description:\n${jd}`,
      `Resume (YAML):\n${serializeResume(resume)}`
    ].join('\n\n');
    return structured<TailorResult>(await prompt('tailor'), user, zodResponseFormat(TailorOutput, 'tailor'));
  },

  async propagate(
    newItem: Item, sectionId: string, branchResume: Resume, meta: BranchMeta
  ): Promise<PropagateResult> {
    const user = [
      `Branch: ${meta.company} — ${meta.role}`, `Voice: ${meta.voice}`,
      `Job description:\n${meta.jd}`, `Target section: ${sectionId}`,
      `New item (YAML):\n${stringifyYaml(newItem)}`,
      `Branch resume (YAML):\n${serializeResume(branchResume)}`
    ].join('\n\n');
    return structured<PropagateResult>(
      await prompt('propagate'), user, zodResponseFormat(PropagateOutput, 'propagate')
    );
  },

  async semanticDiff(resumeA: Resume, resumeB: Resume): Promise<string[]> {
    const user = [
      `Version A (YAML):\n${serializeResume(resumeA)}`,
      `Version B (YAML):\n${serializeResume(resumeB)}`
    ].join('\n\n');
    const out = await structured<z.infer<typeof DiffOutput>>(
      await prompt('diff'), user, zodResponseFormat(DiffOutput, 'diff')
    );
    return out.changes;
  }
};