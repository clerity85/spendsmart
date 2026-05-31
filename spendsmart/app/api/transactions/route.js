import {
  getTransactions,
  upsertTransaction,
  deleteTransaction,
  deleteAllTransactions,
} from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const txs = await getTransactions();
    return NextResponse.json(txs);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const tx = await upsertTransaction(body);
    return NextResponse.json(tx);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json();
    if (body.all) {
      await deleteAllTransactions();
    } else {
      await deleteTransaction(body.id);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
