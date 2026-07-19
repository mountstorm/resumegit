import { NextResponse } from 'next/server';
import { z } from 'zod';
import { previewPropagation } from '@/lib/engine';
import { ItemSchema } from '@/lib/schema';

const Body = z.object({
  sectionId: z.string().min(1),
  item: ItemSchema
});

export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  try {
    const proposals = await previewPropagation(parsed.data.item, parsed.data.sectionId);
    return NextResponse.json({ proposals });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}