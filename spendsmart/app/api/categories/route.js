import { getCategories, createCategory, updateCategoryChildren } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cats = await getCategories();
    return NextResponse.json(cats);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const cat = await createCategory(body);
    return NextResponse.json(cat);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// PATCH: update children array when a new sub-category is added inline
export async function PATCH(req) {
  try {
    const { id, children } = await req.json();
    await updateCategoryChildren(id, children);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
