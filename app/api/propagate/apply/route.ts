import { NextResponse } from 'next/server';
import { z } from 'zod';
import { applyPropagation } from '@/lib/engine';
import { ItemSchema } from '@/lib/schema';

const Body = z.object({
  sectionId: z.string().min(1),
  item: ItemSchema,
  approved: z.array(z.object({ branch: z.string(), resumeYaml: z.string() }))
});

export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  const { item, sectionId, approved } = parsed.data;
  try {
    const result = await applyPropagation(item, sectionId, approved);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}