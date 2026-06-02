import { NextRequest, NextResponse } from "next/server";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";
const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";
export async function GET() {
  try {
    const user = await db.query.users.findFirst({ where: eq(users.id, DEMO_USER_ID) });
    return NextResponse.json(user);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const [user] = await db.update(users).set({ ...body, updatedAt: new Date() }).where(eq(users.id, DEMO_USER_ID)).returning();
    return NextResponse.json(user);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
