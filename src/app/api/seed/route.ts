import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/db/seed";
export async function POST() {
  try { await seedDatabase(); return NextResponse.json({ success: true }); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
