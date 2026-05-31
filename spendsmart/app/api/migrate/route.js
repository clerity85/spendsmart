import { runMigrations } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await runMigrations();
    return NextResponse.json({ ok: true, message: "Migrations complete" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
