import { NextRequest, NextResponse } from "next/server";
import { db, subCategories } from "@/lib/db";
const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const [sc] = await db.insert(subCategories).values({ ...body, userId: DEMO_USER_ID }).returning();
    return NextResponse.json(sc);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
