"use client";
import { useState, useMemo } from "react";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppStore, type FullTransaction } from "@/lib/store";
import { useTransactions } from "@/hooks/useData";
import type { Wallet } from "@/lib/db/schema";
import type { CategoryWithSubs } from "@/hooks/useData";
import { TransactionRow } from "../ui/TransactionRow";
import { formatMonth, getMonthRange } from "@/lib/utils";

interface Props {
  wallets: Wallet[];
  categories: CategoryWithSubs[];
  onDataChange: () => void;
}

export function HistoryTab({ wallets, categories, onDataChange }: Props) {
  const { historyWalletFilter, setHistoryWalletFilter, historyMonth, setHistoryMonth, currency, setShowAddTransaction, setEditingTransaction, setPrefillTransaction } = useAppStore();
  const [search, setSearch] = useState("");

  const { start, end } = getMonthRange(historyMonth.year, historyMonth.month);
  const txParams = useMemo(() => ({
    walletId: historyWalletFilter || undefined,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    search: search || undefined,
  }), [historyWalletFilter, historyMonth.year, historyMonth.month, search]);

  const { transactions, loading, updateTransaction, deleteTransaction } = useTransactions(txParams);

  const goMonth = (dir: number) => {
    setHistoryMonth(prev => {
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
      type: t.type, amount: t.amount, description: t.description,
      categoryId: t.categoryId, subCategoryId: t.subCategoryId || undefined, walletId: t.walletId,
    } as any);
    setShowAddTransaction(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this transaction?")) return;
    await deleteTransaction(id);
    onDataChange();
  };

  // Group by date
  const grouped = useMemo(() => {
    const map: Record<string, FullTransaction[]> = {};
    for (const t of transactions) {
      const d = new Date(t.date).toDateString();
      if (!map[d]) map[d] = [];
      map[d].push(t);
    }
    return Object.entries(map).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [transactions]);

  return (
    <div className="px-4 py-4 space-y-3">
      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
        <input
          type="text"
          placeholder="Search transactions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-9 py-3 rounded-xl text-sm focus:outline-none"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <X size={14} style={{ color: "var(--text-3)" }} />
          </button>
        )}
      </div>

      {/* Month Nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => goMonth(-1)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--surface-2)" }}>
          <ChevronLeft size={15} style={{ color: "var(--text-2)" }} />
        </button>
        <p className="font-display font-bold text-sm" style={{ color: "var(--text)" }}>
          {formatMonth(new Date(historyMonth.year, historyMonth.month, 1))}
        </p>
        <button onClick={() => goMonth(1)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--surface-2)" }}>
          <ChevronRight size={15} style={{ color: "var(--text-2)" }} />
        </button>
      </div>

      {/* Wallet Filter Chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <button onClick={() => setHistoryWalletFilter(null)} className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
          style={{ background: !historyWalletFilter ? "var(--accent)" : "var(--surface-2)", color: !historyWalletFilter ? "white" : "var(--text-2)" }}>
          All
        </button>
        {wallets.map(w => (
          <button key={w.id} onClick={() => setHistoryWalletFilter(historyWalletFilter === w.id ? null : w.id)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: historyWalletFilter === w.id ? w.color + "22" : "var(--surface-2)",
              color: historyWalletFilter === w.id ? w.color : "var(--text-2)",
              border: `1.5px solid ${historyWalletFilter === w.id ? w.color : "transparent"}`,
            }}>
            <div className="w-2 h-2 rounded-full" style={{ background: w.color }} />
            {w.name}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex gap-3 items-center p-4 rounded-2xl" style={{ background: "var(--surface)" }}>
              <div className="skeleton w-10 h-10 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton h-3.5 w-36 rounded" />
                <div className="skeleton h-3 w-24 rounded" />
              </div>
              <div className="skeleton h-4 w-16 rounded" />
            </div>
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div className="text-center py-12">
          <p style={{ color: "var(--text-3)" }} className="text-sm">
            {search ? "No transactions match your search" : "No transactions this month"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {grouped.map(([date, txs]) => (
            <div key={date}>
              <p className="text-xs font-semibold mb-1.5 px-1" style={{ color: "var(--text-3)" }}>
                {new Date(date).toDateString() === new Date().toDateString() ? "Today" :
                 new Date(date).toDateString() === new Date(Date.now() - 86400000).toDateString() ? "Yesterday" :
                 new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(new Date(date))}
              </p>
              <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                {txs.map((t, i) => (
                  <div key={t.id} style={{ borderTop: i > 0 ? `1px solid var(--border)` : "none" }}>
                    <TransactionRow
                      transaction={t}
                      currency={currency}
                      onToggleFavourite={handleToggleFav}
                      onEdit={handleEdit}
                      onUseAgain={handleUseAgain}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
