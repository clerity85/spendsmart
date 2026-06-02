import { NextRequest, NextResponse } from "next/server";
import { db, wallets } from "@/lib/db";
import { eq } from "drizzle-orm";
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; const body = await req.json();
    const [w] = await db.update(wallets).set({ ...body, updatedAt: new Date() }).where(eq(wallets.id, id)).returning();
    return NextResponse.json(w);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(wallets).where(eq(wallets.id, id));
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
