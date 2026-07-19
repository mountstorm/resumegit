/**
 * Property-based eval runner for the propagate (semantic merge) operation.
 * Usage: npm run evals            (real provider — needs OPENAI_API_KEY)
 *        npm run evals -- --mock  (deterministic mock; checks plumbing only)
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'yaml';
import { getProvider } from '../lib/ai/provider';
import {
  allIds,
  parseResume,
  BranchMetaSchema,
  ItemSchema,
  type Item
} from '../lib/schema';

interface Scenario {
  name: string;
  new_item: { section: string; item: unknown };
  branch: { company: string; role: string; voice: string };
  existing_resume: string;
  properties: Record<string, unknown>;
}

interface Failure {
  property: string;
  detail: string;
}

function itemText(item: Item): string {
  return [item.org, item.role, ...item.bullets.map((b) => b.text)].join(' ').toLowerCase();
}

async function runScenario(scenario: Scenario, dir: string): Promise<Failure[]> {
  const provider = await getProvider();
  const resumeYaml = await readFile(path.join(dir, scenario.existing_resume), 'utf8');
  const resume = parseResume(resumeYaml);
  const newItem = ItemSchema.parse(scenario.new_item.item);
  const meta = BranchMetaSchema.parse({ ...scenario.branch, jd: '', status: 'none', omitted: [] });

  const result = await provider.propagate(newItem, scenario.new_item.section, resume, meta);
  const failures: Failure[] = [];
  const p = scenario.properties;

  if (typeof p.item_present === 'boolean' && result.include !== p.item_present) {
    failures.push({ property: 'item_present', detail: `expected ${p.item_present}, got ${result.include}` });
  }
  if (p.omission_reason_if_absent && !result.include && !result.reason.trim()) {
    failures.push({ property: 'omission_reason_if_absent', detail: 'omitted with no reason' });
  }
  if (result.include && result.item) {
    const known = allIds(resume);
    known.add(newItem.id);
    for (const b of newItem.bullets) known.add(b.id);
    if (p.id_stable) {
      const outIds = [result.item.id, ...result.item.bullets.map((b) => b.id)];
      for (const id of outIds) {
        if (!known.has(id)) failures.push({ property: 'id_stable', detail: `invented id "${id}"` });
      }
    }
    if (typeof p.max_bullets === 'number' && result.item.bullets.length > p.max_bullets) {
      failures.push({ property: 'max_bullets', detail: `${result.item.bullets.length} > ${p.max_bullets}` });
    }
    // Language properties judge rewrite quality — only meaningful for the real model.
    const text = itemText(result.item);
    if (provider.name !== 'mock' && Array.isArray(p.must_mention_any)) {
      const hit = (p.must_mention_any as string[]).some((w) => text.includes(w.toLowerCase()));
      if (!hit) failures.push({ property: 'must_mention_any', detail: `none of [${p.must_mention_any}] present` });
    }
    if (provider.name !== 'mock' && Array.isArray(p.must_not_mention)) {
      for (const word of p.must_not_mention as string[]) {
        if (text.includes(word.toLowerCase())) {
          failures.push({ property: 'must_not_mention', detail: `contains "${word}"` });
        }
      }
    }
    if (p.no_duplicate_ids) {
      // Replacement semantics are enforced by upsert; here assert the model kept the id.
      if (result.item.id !== newItem.id) {
        failures.push({ property: 'no_duplicate_ids', detail: `id changed to "${result.item.id}"` });
      }
    }
  }
  return failures;
}

async function main() {
  if (process.argv.includes('--mock')) process.env.MOCK_AI = '1';
  const provider = await getProvider();
  console.log(`provider: ${provider.name}\n`);

  const dir = path.join(process.cwd(), 'evals');
  const files = (await readdir(path.join(dir, 'scenarios'))).filter((f) => f.endsWith('.yaml'));
  let failed = 0;
  for (const file of files.sort()) {
    const scenario = parse(await readFile(path.join(dir, 'scenarios', file), 'utf8')) as Scenario;
    try {
      const failures = await runScenario(scenario, dir);
      if (failures.length === 0) {
        console.log(`PASS  ${scenario.name}`);
      } else {
        failed++;
        console.log(`FAIL  ${scenario.name}`);
        for (const f of failures) console.log(`      ${f.property}: ${f.detail}`);
      }
    } catch (error) {
      failed++;
      console.log(`ERROR ${scenario.name}: ${error}`);
    }
  }
  console.log(`\n${files.length - failed}/${files.length} scenarios passed`);
  process.exit(failed === 0 ? 0 : 1);
}

main();