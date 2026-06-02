import { NextRequest, NextResponse } from "next/server";
import { db, wallets } from "@/lib/db";
import { eq } from "drizzle-orm";
const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";
export async function GET() {
  try {
    const result = await db.query.wallets.findMany({ where: eq(wallets.userId, DEMO_USER_ID) });
    return NextResponse.json(result);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const [w] = await db.insert(wallets).values({ ...body, userId: DEMO_USER_ID, balance: body.balance?.toString() || "0" }).returning();
    return NextResponse.json(w);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
