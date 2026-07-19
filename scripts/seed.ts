/**
 * Seeds the demo: the base resume on main plus two deliberately contrasting
 * application branches (AI engineering vs. robotics), so tailoring is visible
 * at a glance — different ordering, different inclusions, different voice.
 * Deterministic (no AI calls): judges get an identical instance every time.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { initRepo, createApplicationBranch, repoExists } from '../lib/repo';
import { parseResume, serializeBranchMeta, type BranchMeta, type Resume } from '../lib/schema';

interface BranchSpec {
  branch: string;
  meta: BranchMeta;
  /** Section ids in display order — order IS emphasis. */
  sectionOrder: string[];
  /** Item ids to keep, per section, in display order. Everything else must be in omissions. */
  keep: Record<string, string[]>;
  /** Bullet id -> replacement text, rewritten in this branch's voice (facts only). */
  rewrites: Record<string, string>;
}

function applyKeepOrder(resume: Resume, keep: Record<string, string[]>): void {
  for (const section of resume.sections) {
    const order = keep[section.id];
    if (!order) continue;
    section.items = order
      .map((id) => section.items.find((item) => item.id === id))
      .filter((item) => item !== undefined);
  }
}

function applySectionOrder(resume: Resume, order: string[]): void {
  resume.sections.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
}

function applyRewrites(resume: Resume, rewrites: Record<string, string>): void {
  for (const section of resume.sections) {
    for (const item of section.items) {
      for (const bullet of item.bullets) {
        if (rewrites[bullet.id]) bullet.text = rewrites[bullet.id];
      }
    }
  }
}

/** Builds one tailored branch resume from the base, per the spec. */
function buildBranch(base: Resume, spec: BranchSpec): Resume {
  const resume: Resume = structuredClone(base);
  applyKeepOrder(resume, spec.keep);
  applySectionOrder(resume, spec.sectionOrder);
  applyRewrites(resume, spec.rewrites);
  return resume;
}

const AI_ENGINEER: BranchSpec = {
  branch: 'openai',
  meta: {
    company: 'OpenAI',
    role: 'AI Engineer Intern',
    jd: 'Build and evaluate systems around large models: inference, tooling, and applied ML engineering.',
    voice: 'applied ML systems emphasis: model execution, inference, LLM tooling',
    status: 'applied',
    omitted: [
      { id: 'pharma-research-2024', reason: 'Hardware robotics work; out of scope for an applied AI role.' },
      { id: 'valuestop', reason: 'Retail routing app; weakest signal for AI systems work.' }
    ]
  },
  sectionOrder: ['experience', 'projects', 'education'],
  keep: {
    experience: ['distributed-ai-2026', 'cspire-2026', 'ta-2025'],
    projects: ['neurabash']
  },
  rewrites: {
    'dai-2':
      'Built a two-machine split-inference pipeline streaming intermediate tensors over a length-prefixed TCP protocol, with outputs verified against single-machine inference (max error under 1e-4).',
    'nb-1':
      'Built a terminal AI coding assistant that runs GPT-4 online and local models via Ollama fully offline, with prompt engineering driving repository analysis and code explanation.'
  }
};

const ROBOTICS: BranchSpec = {
  branch: 'boston-dynamics',
  meta: {
    company: 'Boston Dynamics',
    role: 'Robotics Software Intern',
    jd: 'Software for real robots: control, autonomy, and performance on constrained hardware.',
    voice: 'robotics and embedded emphasis: control, hardware constraints, real-time latency',
    status: 'interview',
    omitted: [
      { id: 'neurabash', reason: 'LLM developer tooling; not relevant to robotics software.' },
      { id: 'ta-2025', reason: 'Teaching role; least relevant to embedded robotics work.' }
    ]
  },
  sectionOrder: ['experience', 'projects', 'education'],
  keep: {
    experience: ['pharma-research-2024', 'distributed-ai-2026', 'cspire-2026'],
    projects: ['valuestop']
  },
  rewrites: {
    'pr-1':
      'Programmed Wlkata and Epson industrial robot arms in Python and C++ for autonomous pharmaceutical preparation, cutting contamination risk 85% through automated drug-delivery workflows.',
    'dai-1':
      'Partition deep neural network execution across device, edge, and cloud in PyTorch to run AI workloads on memory- and GPU-constrained hardware.',
    'dai-3':
      'Profiled all 22 AlexNet split points across WiFi, LTE, and backhaul links to find the latency-optimal partition for constrained edge devices.',
    'vs-1':
      'Built multi-stop route optimization over 150 products across 5 stores using A* pathfinding, with routes served through a live map interface.'
  }
};

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

  for (const spec of [AI_ENGINEER, ROBOTICS]) {
    await createApplicationBranch(
      spec.branch,
      buildBranch(base, spec),
      serializeBranchMeta(spec.meta),
      `Tailor for ${spec.meta.company} — ${spec.meta.role}`
    );
  }
  console.log(`Seeded: main + branches [${AI_ENGINEER.branch}, ${ROBOTICS.branch}]`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});