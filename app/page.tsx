import { fullLog, listApplicationBranches, repoExists, MAIN } from '@/lib/repo';
import { TimelineView } from './timeline-view';

export const dynamic = 'force-dynamic';

export default async function TimelinePage() {
  if (!repoExists()) {
    return (
      <>
        <h1>Timeline</h1>
        <p className="lede">
          No resume repository yet. Run <code>npm run seed</code> to create the demo resume.
        </p>
      </>
    );
  }
  const [log, applicationBranches] = await Promise.all([fullLog(), listApplicationBranches()]);
  return (
    <>
      <h1>Career timeline</h1>
      <p className="lede">
        Every commit across every branch of your resume — main is your life, branches are your
        applications.
      </p>
      <TimelineView entries={log} branches={[MAIN, ...applicationBranches]} />
    </>
  );
}