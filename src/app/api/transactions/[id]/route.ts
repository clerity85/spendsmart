import { NextRequest, NextResponse } from "next/server";
import { db, transactions, wallets } from "@/lib/db";
import { eq } from "drizzle-orm";

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Get original transaction to reverse balance
    const original = await db.query.transactions.findFirst({
      where: eq(transactions.id, id),
      with: { wallet: true },
    });

    if (!original) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { walletId, categoryId, subCategoryId, type, amount, description, notes, date, isFavourite } = body;

    // Reverse original balance effect
    const origWallet = await db.query.wallets.findFirst({ where: eq(wallets.id, original.walletId) });
    if (origWallet) {
      const current = parseFloat(origWallet.balance.toString());
      const reversal = original.type === "income" ? -parseFloat(original.amount.toString()) : parseFloat(original.amount.toString());
      await db.update(wallets)
        .set({ balance: (current + reversal).toFixed(2), updatedAt: new Date() })
        .where(eq(wallets.id, original.walletId));
    }

    // Update transaction
    await db.update(transactions).set({
      walletId: walletId || original.walletId,
      categoryId: categoryId || original.categoryId,
      subCategoryId: subCategoryId || null,
      type: type || original.type,
      amount: amount ? amount.toString() : original.amount,
      description: description || original.description,
      notes: notes !== undefined ? notes : original.notes,
      date: date ? new Date(date) : original.date,
      isFavourite: isFavourite !== undefined ? isFavourite : original.isFavourite,
      updatedAt: new Date(),
    }).where(eq(transactions.id, id));

    // Apply new balance effect
    const newWalletId = walletId || original.walletId;
    const newType = type || original.type;
    const newAmount = parseFloat(amount || original.amount.toString());
    const targetWallet = await db.query.wallets.findFirst({ where: eq(wallets.id, newWalletId) });
    if (targetWallet) {
      const current = parseFloat(targetWallet.balance.toString());
      const delta = newType === "income" ? newAmount : -newAmount;
      await db.update(wallets)
        .set({ balance: (current + delta).toFixed(2), updatedAt: new Date() })
        .where(eq(wallets.id, newWalletId));
    }

    const full = await db.query.transactions.findFirst({
      where: eq(transactions.id, id),
      with: { wallet: true, category: true, subCategory: true },
    });

    return NextResponse.json(full);
  } catch (error) {
    console.error("PUT /api/transactions/[id] error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const tx = await db.query.transactions.findFirst({
      where: eq(transactions.id, id),
    });

    if (!tx) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Reverse wallet balance
    const wallet = await db.query.wallets.findFirst({ where: eq(wallets.id, tx.walletId) });
    if (wallet) {
      const current = parseFloat(wallet.balance.toString());
      const reversal = tx.type === "income" ? -parseFloat(tx.amount.toString()) : parseFloat(tx.amount.toString());
      await db.update(wallets)
        .set({ balance: (current + reversal).toFixed(2), updatedAt: new Date() })
        .where(eq(wallets.id, tx.walletId));
    }

    await db.delete(transactions).where(eq(transactions.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/transactions/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
