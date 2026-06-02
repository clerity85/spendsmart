import { NextRequest, NextResponse } from "next/server";
import { db, transactions, wallets } from "@/lib/db";
import { eq, and, gte, lte, like, or, desc } from "drizzle-orm";

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const walletId = searchParams.get("walletId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit");

    let query = db.query.transactions.findMany({
      where: (t, { eq, and, gte, lte, like, or }) => {
        const conditions = [eq(t.userId, DEMO_USER_ID)];
        if (walletId) conditions.push(eq(t.walletId, walletId));
        if (startDate) conditions.push(gte(t.date, new Date(startDate)));
        if (endDate) conditions.push(lte(t.date, new Date(endDate)));
        return and(...conditions);
      },
      with: {
        wallet: true,
        category: true,
        subCategory: true,
      },
      orderBy: (t, { desc }) => [desc(t.date)],
      limit: limit ? parseInt(limit) : undefined,
    });

    const result = await query;

    // If search, filter in memory (simpler for demo)
    const filtered = search
      ? result.filter(t =>
          t.description.toLowerCase().includes(search.toLowerCase()) ||
          t.category.name.toLowerCase().includes(search.toLowerCase()) ||
          t.wallet.name.toLowerCase().includes(search.toLowerCase())
        )
      : result;

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletId, categoryId, subCategoryId, type, amount, description, notes, date } = body;

    const [tx] = await db.insert(transactions).values({
      userId: DEMO_USER_ID,
      walletId,
      categoryId,
      subCategoryId: subCategoryId || null,
      type,
      amount: amount.toString(),
      description,
      notes: notes || null,
      date: new Date(date),
      isFavourite: false,
    }).returning();

    // Update wallet balance
    const wallet = await db.query.wallets.findFirst({
      where: eq(wallets.id, walletId),
    });

    if (wallet) {
      const current = parseFloat(wallet.balance.toString());
      const delta = type === "income" ? parseFloat(amount) : -parseFloat(amount);
      await db.update(wallets)
        .set({ balance: (current + delta).toFixed(2), updatedAt: new Date() })
        .where(eq(wallets.id, walletId));
    }

    const full = await db.query.transactions.findFirst({
      where: eq(transactions.id, tx.id),
      with: { wallet: true, category: true, subCategory: true },
    });

    return NextResponse.json(full);
  } catch (error) {
    console.error("POST /api/transactions error:", error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
