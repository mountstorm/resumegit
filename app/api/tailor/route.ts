import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createTailoredBranch } from '@/lib/engine';

const Body = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  jd: z.string().default('')
});

export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  const { company, role, jd } = parsed.data;
  try {
    const result = await createTailoredBranch(company, role, jd);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}