import { NextRequest, NextResponse } from "next/server";
import { db, categories } from "@/lib/db";
import { eq } from "drizzle-orm";
const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";
export async function GET() {
  try {
    const result = await db.query.categories.findMany({ where: eq(categories.userId, DEMO_USER_ID), with: { subCategories: true } });
    return NextResponse.json(result);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const [cat] = await db.insert(categories).values({ ...body, userId: DEMO_USER_ID }).returning();
    return NextResponse.json(cat);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
