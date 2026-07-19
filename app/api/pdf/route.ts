import { NextResponse } from 'next/server';
import { resumePdf } from '@/lib/pdf';
import { readResume, MAIN } from '@/lib/repo';

/** Streams any resume version as a downloadable PDF: GET /api/pdf?ref=<branch|commit>. */
export async function GET(request: Request) {
  const ref = new URL(request.url).searchParams.get('ref') ?? MAIN;
  try {
    const resume = await readResume(ref);
    const pdf = await resumePdf(resume);
    const safeRef = ref.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 24) || MAIN;
    const filename = `${resume.basics.name.replace(/\s+/g, '_')}_${safeRef}.pdf`;
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}