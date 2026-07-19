import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { simpleGit, type SimpleGit } from 'simple-git';
import {
  parseBranchMeta,
  parseResume,
  serializeResume,
  type BranchMeta,
  type Resume
} from './schema';

const REPO_DIR = process.env.RESUMEGIT_DATA || path.join(process.cwd(), 'data', 'repo');
const RESUME_FILE = 'resume.yaml';
const META_FILE = '.resumegit/branch.yaml';
export const MAIN = 'main';

/** Serializes all repo operations — git checkouts must never interleave. */
let queue: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const next = queue.then(fn, fn);
  queue = next.catch(() => undefined);
  return next;
}

function git(): SimpleGit {
  return simpleGit(REPO_DIR);
}

/** Whether the resume repository has been initialized (seed has run). */
export function repoExists(): boolean {
  return existsSync(path.join(REPO_DIR, '.git'));
}

/**
 * Creates the resume repository with an initial commit on main.
 *
 * @param resumeYaml Resume content; validated against the schema before writing.
 * @throws If a repository already exists at the data directory.
 */
export async function initRepo(resumeYaml: string): Promise<void> {
  return withLock(async () => {
    if (repoExists()) throw new Error(`repo already exists at ${REPO_DIR}`);
    parseResume(resumeYaml);
    await mkdir(REPO_DIR, { recursive: true });
    const g = git();
    await g.init(['-b', MAIN]);
    await g.addConfig('user.name', 'resumeGit');
    await g.addConfig('user.email', 'resumegit@local');
    await writeFile(path.join(REPO_DIR, RESUME_FILE), resumeYaml);
    await g.add(RESUME_FILE);
    await g.commit('Initial resume');
  });
}

async function showFile(ref: string, file: string): Promise<string> {
  return git().show([`${ref}:${file}`]);
}

/** Reads the resume as of any ref (branch name or commit hash). */
export async function readResume(ref: string = MAIN): Promise<Resume> {
  return parseResume(await showFile(ref, RESUME_FILE));
}

/** Reads a branch's application metadata; null for refs without one (e.g. main). */
export async function readBranchMeta(branch: string): Promise<BranchMeta | null> {
  try {
    return parseBranchMeta(await showFile(branch, META_FILE));
  } catch {
    return null;
  }
}

/** All application branches — every local branch except main. */
export async function listApplicationBranches(): Promise<string[]> {
  const branches = await git().branchLocal();
  return branches.all.filter((b) => b !== MAIN);
}

/** One commit in the cross-branch history, with the branches that contain it. */
export interface LogEntry {
  hash: string;
  date: string;
  message: string;
  refs: string;
  branches: string[];
}

/** Commit history across all branches, newest first — the career timeline. */
export async function fullLog(): Promise<LogEntry[]> {
  const raw = await git().raw([
    'log', '--all', '--date=iso-strict', '--pretty=format:%H%x1f%ad%x1f%s%x1f%D'
  ]);
  const entries = raw.split('\n').filter(Boolean).map((line) => {
    const [hash, date, message, refs] = line.split('\x1f');
    return { hash, date, message, refs: refs ?? '', branches: [] as string[] };
  });
  // Which branches contain each commit — lets the timeline chip commits per branch.
  const branches = [MAIN, ...(await listApplicationBranches())];
  for (const branch of branches) {
    const inBranch = await git().raw(['rev-list', branch]);
    const set = new Set(inBranch.split('\n').filter(Boolean));
    for (const entry of entries) {
      if (set.has(entry.hash)) entry.branches.push(branch);
    }
  }
  return entries;
}

async function commitFiles(
  branch: string,
  files: Record<string, string>,
  message: string,
  createFrom?: string
): Promise<string> {
  const g = git();
  if (createFrom) {
    await g.checkout(['-b', branch, createFrom]);
  } else {
    await g.checkout(branch);
  }
  try {
    for (const [file, content] of Object.entries(files)) {
      const target = path.join(REPO_DIR, file);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, content);
      await g.add(file);
    }
    const result = await g.commit(message);
    return result.commit;
  } finally {
    await g.checkout(MAIN);
  }
}

/**
 * Branches off main with a tailored resume and its application metadata.
 *
 * @returns The commit hash of the branch's first commit.
 */
export async function createApplicationBranch(
  branch: string,
  resume: Resume,
  metaYaml: string,
  message: string
): Promise<string> {
  return withLock(() =>
    commitFiles(branch, { [RESUME_FILE]: serializeResume(resume), [META_FILE]: metaYaml }, message, MAIN)
  );
}

/** Commits a new resume version on an existing branch; returns the commit hash. */
export async function commitResume(branch: string, resume: Resume, message: string): Promise<string> {
  return withLock(() => commitFiles(branch, { [RESUME_FILE]: serializeResume(resume) }, message));
}

/** Raw unified diff of the resume between two refs. */
export async function diffRefs(refA: string, refB: string): Promise<string> {
  return git().diff([refA, refB, '--', RESUME_FILE]);
}

/** The commit that first introduced a bullet — when, and under what message. */
export interface BulletOrigin {
  hash: string;
  date: string;
  message: string;
}

/** First commit anywhere that introduced this bullet id — powers the blame view. */
export async function bulletOrigin(bulletId: string): Promise<BulletOrigin | null> {
  const raw = await git().raw([
    'log', '--all', '--reverse', '-S', `id: ${bulletId}`,
    '--date=iso-strict', '--pretty=format:%H%x1f%ad%x1f%s'
  ]);
  const first = raw.split('\n').filter(Boolean)[0];
  if (!first) return null;
  const [hash, date, message] = first.split('\x1f');
  return { hash, date, message };
}