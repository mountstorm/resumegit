import { DiffView } from '@/components/diff-view';
import { RefToolbar } from './ref-toolbar';
import { getProvider } from '@/lib/ai/provider';
import {
  bulletOrigin,
  diffRefs,
  listApplicationBranches,
  readResume,
  repoExists,
  MAIN
} from '@/lib/repo';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ ref?: string; diff?: string; blame?: string }>;
}

export default async function ResumePage({ searchParams }: Props) {
  const params = await searchParams;
  if (!repoExists()) {
    return (
      <>
        <h1>Resume</h1>
        <p className="lede">Run <code>npm run seed</code> first.</p>
      </>
    );
  }
  const ref = params.ref ?? MAIN;
  const showBlame = params.blame === '1';
  const resume = await readResume(ref);
  const refs = [MAIN, ...(await listApplicationBranches())];

  const origins = new Map<string, { date: string; message: string }>();
  if (showBlame) {
    for (const section of resume.sections) {
      for (const item of section.items) {
        for (const b of item.bullets) {
          const origin = await bulletOrigin(b.id);
          if (origin) origins.set(b.id, origin);
        }
      }
    }
  }

  let semanticDiff: string[] | null = null;
  let rawDiff: string | null = null;
  if (params.diff) {
    const provider = await getProvider();
    semanticDiff = await provider.semanticDiff(await readResume(params.diff), resume);
    rawDiff = await diffRefs(params.diff, ref);
  }

  return (
    <>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
        <h1>Resume</h1>
        <RefToolbar refs={refs} current={ref} diffAgainst={params.diff ?? ''} blame={showBlame} />
      </div>

      {semanticDiff && (
        <div className="card no-print">
          <h2>What changed vs {params.diff}</h2>
          <ul className="bullets">
            {semanticDiff.map((change, i) => (<li key={i}>{change}</li>))}
          </ul>
          {rawDiff && rawDiff.trim() && (
            <details open>
              <summary className="skip" style={{ cursor: 'pointer' }}>line diff</summary>
              <DiffView raw={rawDiff} />
            </details>
          )}
        </div>
      )}

      <div className="resume">
        <h1>{resume.basics.name}</h1>
        <div className="contact">
          {resume.basics.phone} · {resume.basics.email} · {resume.basics.location}
          {resume.basics.links.map((link) => (
            <span key={link}> · {link}</span>
          ))}
        </div>
        <p className="summary">{resume.summary}</p>
        {resume.sections.map((section) => (
          <section key={section.id}>
            <h3>{section.id}</h3>
            {section.items.map((item) => {
              // Jake's-resume convention: experience leads with the title.
              const [primary, secondary] =
                section.id === 'experience' ? [item.role, item.org] : [item.org, item.role];
              return (
              <div className="item" key={item.id}>
                <div className="item-head">
                  <span className="org">{primary}</span>
                  <span className="dates">{item.dates}</span>
                </div>
                <div className="role">{secondary}</div>
                <ul>
                  {item.bullets.map((bullet) => (
                    <li key={bullet.id}>
                      {bullet.text}
                      {showBlame && (
                        <span className="blame">
                          {origins.get(bullet.id)
                            ? `${new Date(origins.get(bullet.id)!.date).toLocaleDateString()} — ${origins.get(bullet.id)!.message}`
                            : 'origin unknown'}
                          {bullet.evidence && bullet.evidence.startsWith('http') && (
                            <>
                              {' · '}
                              <a href={bullet.evidence} target="_blank" rel="noopener noreferrer">evidence</a>
                            </>
                          )}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              );
            })}
          </section>
        ))}
        {resume.skills.length > 0 && (
          <section>
            <h3>Technical Skills</h3>
            {resume.skills.map((group) => (
              <div className="skills-row" key={group.category}>
                <b>{group.category}:</b> {group.items.join(', ')}
              </div>
            ))}
          </section>
        )}
      </div>
    </>
  );
}