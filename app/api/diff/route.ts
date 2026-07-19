import { NextResponse } from 'next/server';
import { getProvider } from '@/lib/ai/provider';
import { diffRefs, readResume } from '@/lib/repo';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const refA = url.searchParams.get('a');
  const refB = url.searchParams.get('b');
  if (!refA || !refB) {
    return NextResponse.json({ error: 'query params a and b are required' }, { status: 400 });
  }
  try {
    const provider = await getProvider();
    const [raw, resumeA, resumeB] = await Promise.all([
      diffRefs(refA, refB),
      readResume(refA),
      readResume(refB)
    ]);
    const semantic = await provider.semanticDiff(resumeA, resumeB);
    return NextResponse.json({ raw, semantic });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}