import { getWallets, createWallet, deleteWallet } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const wallets = await getWallets();
    return NextResponse.json(wallets);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const wallet = await createWallet(body);
    return NextResponse.json(wallet);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    await deleteWallet(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
