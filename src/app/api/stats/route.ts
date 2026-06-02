import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { transactions } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const walletId = searchParams.get("walletId");
    const all = await db.query.transactions.findMany({
      where: (t, { eq: e, and: a, gte: g, lte: l }) => {
        const conds: any[] = [e(t.userId, DEMO_USER_ID)];
        if (walletId) conds.push(e(t.walletId, walletId));
        if (startDate) conds.push(g(t.date, new Date(startDate)));
        if (endDate) conds.push(l(t.date, new Date(endDate)));
        return a(...conds);
      },
      with: { category: true },
    });
    const income = all.filter(t => t.type === "income").reduce((s, t) => s + parseFloat(t.amount.toString()), 0);
    const expense = all.filter(t => t.type === "expense").reduce((s, t) => s + parseFloat(t.amount.toString()), 0);
    const byCategory: Record<string, any> = {};
    for (const t of all.filter(t => t.type === "expense")) {
      const id = t.category.id;
      if (!byCategory[id]) byCategory[id] = { name: t.category.name, color: t.category.color, icon: t.category.icon, amount: 0 };
      byCategory[id].amount += parseFloat(t.amount.toString());
    }
    return NextResponse.json({ income, expense, net: income - expense, transactionCount: all.length, byCategory: Object.values(byCategory).sort((a, b) => b.amount - a.amount) });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
