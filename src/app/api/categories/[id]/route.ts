import { NextRequest, NextResponse } from "next/server";
import { db, categories } from "@/lib/db";
import { eq } from "drizzle-orm";
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; const body = await req.json();
    const [cat] = await db.update(categories).set(body).where(eq(categories.id, id)).returning();
    return NextResponse.json(cat);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(categories).where(eq(categories.id, id));
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
