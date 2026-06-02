"use client";
import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Wallet, ChevronLeft, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { useAppStore, type FullTransaction } from "@/lib/store";
import { useTransactions, useStats } from "@/hooks/useData";
import type { Wallet as WalletType } from "@/lib/db/schema";
import type { CategoryWithSubs } from "@/hooks/useData";
import { TransactionRow } from "../ui/TransactionRow";
import { formatCurrency, formatMonth, getMonthRange } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Props {
  wallets: WalletType[];
  categories: CategoryWithSubs[];
  onDataChange: () => void;
}

export function HomeTab({ wallets, categories, onDataChange }: Props) {
  const { activeWalletId, setActiveWalletId, setShowAddTransaction, setEditingTransaction, setPrefillTransaction, currency } = useAppStore();
  const [month, setMonth] = useState(() => { const n = new Date(); return { year: n.getFullYear(), month: n.getMonth() }; });

  const { start, end } = getMonthRange(month.year, month.month);
  const txParams = useMemo(() => ({
    walletId: activeWalletId || undefined,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    limit: 20,
  }), [activeWalletId, month.year, month.month]);

  const statsParams = useMemo(() => ({
    walletId: activeWalletId || undefined,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  }), [activeWalletId, month.year, month.month]);

  const { transactions, loading: txLoading, refetch: refetchTx, updateTransaction, deleteTransaction } = useTransactions(txParams);
  const { stats, loading: statsLoading } = useStats(statsParams);

  const goMonth = (dir: number) => {
    setMonth(prev => {
      let m = prev.month + dir;
      let y = prev.year;
      if (m < 0) { m = 11; y--; }
      if (m > 11) { m = 0; y++; }
      return { year: y, month: m };
    });
  };

  const handleToggleFav = async (id: string, val: boolean) => {
    await updateTransaction(id, { isFavourite: val });
  };

  const handleEdit = (t: FullTransaction) => {
    setEditingTransaction(t);
    setShowAddTransaction(true);
  };

  const handleUseAgain = (t: FullTransaction) => {
    setPrefillTransaction({
      type: t.type,
      amount: t.amount,
      description: t.description,
      categoryId: t.categoryId,
      subCategoryId: t.subCategoryId || undefined,
      walletId: t.walletId,
    } as any);
    setShowAddTransaction(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this transaction?")) return;
    await deleteTransaction(id);
    onDataChange();
  };

  const totalBalance = wallets.reduce((s, w) => s + parseFloat(w.balance?.toString() || "0"), 0);

  const chartData = (stats?.byCategory || []).slice(0, 6).map(c => ({
    name: c.name.length > 8 ? c.name.slice(0, 7) + "…" : c.name,
    amount: Math.round(c.amount),
    color: c.color,
  }));

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Total Balance Card */}
      <div
        className="p-5 rounded-2xl relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #15803d 0%, #22c55e 100%)" }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: "white", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10" style={{ background: "white", transform: "translate(-30%, 30%)" }} />
        <p className="text-white/70 text-xs font-medium mb-1">Total Balance</p>
        <p className="text-white font-display font-bold text-3xl">{formatCurrency(totalBalance, currency)}</p>
        <p className="text-white/60 text-xs mt-2">{wallets.length} wallet{wallets.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => goMonth(-1)} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all" style={{ background: "var(--surface-2)" }}>
          <ChevronLeft size={16} style={{ color: "var(--text-2)" }} />
        </button>
        <p className="font-display font-bold text-base" style={{ color: "var(--text)" }}>
          {formatMonth(new Date(month.year, month.month, 1))}
        </p>
        <button onClick={() => goMonth(1)} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all" style={{ background: "var(--surface-2)" }}>
          <ChevronRight size={16} style={{ color: "var(--text-2)" }} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#dcfce7" }}>
              <TrendingUp size={14} style={{ color: "#22c55e" }} />
            </div>
            <span className="text-xs font-medium" style={{ color: "var(--text-2)" }}>Income</span>
          </div>
          {statsLoading ? <div className="skeleton h-6 w-24" /> : (
            <p className="font-display font-bold text-lg text-income">{formatCurrency(stats?.income || 0, currency)}</p>
          )}
        </div>
        <div className="p-4 rounded-2xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#fee2e2" }}>
              <TrendingDown size={14} style={{ color: "#ef4444" }} />
            </div>
            <span className="text-xs font-medium" style={{ color: "var(--text-2)" }}>Expenses</span>
          </div>
          {statsLoading ? <div className="skeleton h-6 w-24" /> : (
            <p className="font-display font-bold text-lg text-expense">{formatCurrency(stats?.expense || 0, currency)}</p>
          )}
        </div>
      </div>

      {/* Net */}
      <div className="p-4 rounded-2xl flex items-center justify-between" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div>
          <p className="text-xs font-medium mb-0.5" style={{ color: "var(--text-2)" }}>Net Savings</p>
          {statsLoading ? <div className="skeleton h-7 w-28" /> : (
            <p className={cn("font-display font-bold text-2xl", (stats?.net || 0) >= 0 ? "text-income" : "text-expense")}>
              {(stats?.net || 0) >= 0 ? "+" : ""}{formatCurrency(stats?.net || 0, currency)}
            </p>
          )}
        </div>
        <p className="text-xs" style={{ color: "var(--text-3)" }}>{stats?.transactionCount || 0} transactions</p>
      </div>

      {/* Wallet Filter */}
      <div>
        <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-2)" }}>Filter by Wallet</p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setActiveWalletId(null)}
            className="flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: !activeWalletId ? "var(--accent)" : "var(--surface-2)",
              color: !activeWalletId ? "white" : "var(--text-2)",
            }}
          >
            All
          </button>
          {wallets.map(w => (
            <button
              key={w.id}
              onClick={() => setActiveWalletId(w.id)}
              className="flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: activeWalletId === w.id ? w.color + "22" : "var(--surface-2)",
                color: activeWalletId === w.id ? w.color : "var(--text-2)",
                border: `1.5px solid ${activeWalletId === w.id ? w.color : "transparent"}`,
              }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: w.color }} />
              {w.name}
            </button>
          ))}
        </div>
      </div>

      {/* Spending Breakdown Chart */}
      {chartData.length > 0 && (
        <div className="p-4 rounded-2xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="font-display font-bold text-sm mb-3" style={{ color: "var(--text)" }}>Spending Breakdown</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} barSize={28} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--text-3)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--text-3)" }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v: any) => [formatCurrency(v, currency), "Spent"]}
                contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: "var(--text)" }}
                cursor={{ fill: "var(--surface-2)" }}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="font-display font-bold text-sm" style={{ color: "var(--text)" }}>Recent Transactions</p>
          <span className="text-xs" style={{ color: "var(--text-3)" }}>{transactions.length} this month</span>
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          {txLoading ? (
            <div className="space-y-1 p-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3 items-center p-2">
                  <div className="skeleton w-10 h-10 rounded-xl" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3.5 w-32 rounded" />
                    <div className="skeleton h-3 w-20 rounded" />
                  </div>
                  <div className="skeleton h-4 w-16 rounded" />
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-10 text-center">
              <p style={{ color: "var(--text-3)" }} className="text-sm">No transactions this month</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {transactions.map(t => (
                <TransactionRow
                  key={t.id}
                  transaction={t}
                  currency={currency}
                  onToggleFavourite={handleToggleFav}
                  onEdit={handleEdit}
                  onUseAgain={handleUseAgain}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
