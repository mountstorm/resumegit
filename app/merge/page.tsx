import { MergeReview } from './merge-review';

export const dynamic = 'force-dynamic';

export default function MergePage() {
  return (
    <>
      <h1>Commit &amp; merge</h1>
      <p className="lede">
        Commit a new experience to main once — the semantic merge engine rewrites it for
        every application branch in that branch&apos;s own voice. Review each rewrite, then land
        the commits.
      </p>
      <MergeReview />
    </>
  );
}