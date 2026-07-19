/**
 * Seeds the demo: the base resume on main plus two tailored application branches.
 * Deterministic (no AI calls) so judges get an identical instance every time.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { initRepo, createApplicationBranch, repoExists } from '../lib/repo';
import { parseResume, serializeBranchMeta, type Resume } from '../lib/schema';

function tailored(base: Resume, projectsFirst: boolean, rewrite: Record<string, string>): Resume {
  const copy: Resume = structuredClone(base);
  if (projectsFirst) {
    copy.sections.sort((a, b) => (a.id === 'projects' ? -1 : b.id === 'projects' ? 1 : 0));
  }
  for (const section of copy.sections) {
    for (const item of section.items) {
      for (const bullet of item.bullets) {
        if (rewrite[bullet.id]) bullet.text = rewrite[bullet.id];
      }
    }
  }
  return copy;
}

async function main() {
  if (repoExists()) {
    console.log('repo already exists — delete data/ to reseed');
    return;
  }
  const baseYaml = await readFile(
    path.join(process.cwd(), 'evals', 'fixtures', 'base-resume.yaml'),
    'utf8'
  );
  await initRepo(baseYaml);
  const base = parseResume(baseYaml);

  await createApplicationBranch(
    'stripe',
    tailored(base, false, {
      'dai-2':
        'Engineered a cross-machine tensor transport layer over a length-prefixed TCP protocol, keeping distributed inference bit-identical to single-machine output (max error under 1e-4).',
      'cs-1':
        'Hardened a production Perl billing flow against 100+ weekly zero-payment errors by routing invalid records to a rejection file, protecting batch throughput with zero manual intervention.'
    }),
    serializeBranchMeta({
      company: 'Stripe',
      role: 'Data Platform Intern',
      jd: 'Build and operate data pipelines and infrastructure powering financial products.',
      voice: 'data-infrastructure emphasis, quantified impact, systems language',
      status: 'applied',
      omitted: []
    }),
    'Tailor for Stripe — Data Platform Intern'
  );

  await createApplicationBranch(
    'vercel',
    tailored(base, true, {
      'vs-1':
        'Built an AI shopping navigator with live multi-store route optimization — Gemini API + A* pathfinding behind a fast React/Vite interface.',
      'nb-1':
        'Built a terminal AI coding assistant with online/offline modes (GPT-4 + Ollama), designed around instant-feedback repository exploration.'
    }),
    serializeBranchMeta({
      company: 'Vercel',
      role: 'Frontend Engineering Intern',
      jd: 'Build fast, polished web experiences with Next.js and React.',
      voice: 'product and interface emphasis, visualization craft, user-facing outcomes',
      status: 'interview',
      omitted: []
    }),
    'Tailor for Vercel — Frontend Engineering Intern'
  );

  console.log('Seeded: main + branches [stripe, vercel]');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});