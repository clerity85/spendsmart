"use client";
import { Heart, Zap } from "lucide-react";
import { useAppStore, type FullTransaction } from "@/lib/store";
import { useTransactions } from "@/hooks/useData";
import type { Wallet } from "@/lib/db/schema";
import type { CategoryWithSubs } from "@/hooks/useData";
import { TransactionRow } from "../ui/TransactionRow";
import { formatCurrency } from "@/lib/utils";
import * as LucideIcons from "lucide-react";

function DynamicIcon({ name, ...props }: { name: string } & any) {
  const iconName = name.split('-').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join('');
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.Tag;
  return <Icon {...props} />;
}

interface Props {
  wallets: Wallet[];
  categories: CategoryWithSubs[];
  onDataChange: () => void;
}

export function FavouritesTab({ wallets, categories, onDataChange }: Props) {
  const { currency, setShowAddTransaction, setEditingTransaction, setPrefillTransaction } = useAppStore();
  const { transactions, loading, updateTransaction, deleteTransaction } = useTransactions({ favouritesOnly: true });

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

  const handleQuickUse = (t: FullTransaction) => {
    setPrefillTransaction({
      type: t.type, amount: t.amount, description: t.description,
      categoryId: t.categoryId, subCategoryId: t.subCategoryId || undefined, walletId: t.walletId,
    } as any);
    setShowAddTransaction(true);
  };

  if (loading) {
    return (
      <div className="px-4 py-4 space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-3 items-center p-4 rounded-2xl" style={{ background: "var(--surface)" }}>
            <div className="skeleton w-10 h-10 rounded-xl" />
            <div className="flex-1 space-y-1.5">
              <div className="skeleton h-3.5 w-32 rounded" />
              <div className="skeleton h-3 w-20 rounded" />
            </div>
            <div className="skeleton h-8 w-16 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#fee2e2" }}>
          <Heart size={24} style={{ color: "#ef4444" }} />
        </div>
        <h3 className="font-display font-bold text-lg mb-2" style={{ color: "var(--text)" }}>No Favourites Yet</h3>
        <p className="text-sm" style={{ color: "var(--text-3)" }}>
          Tap the ♡ icon on any transaction to save it here for quick reuse.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart size={16} fill="#ef4444" style={{ color: "#ef4444" }} />
          <p className="font-display font-bold text-sm" style={{ color: "var(--text)" }}>
            {transactions.length} Saved Transaction{transactions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <p className="text-xs" style={{ color: "var(--text-3)" }}>Tap ⚡ to use again</p>
      </div>

      {/* Quick Use Cards */}
      <div className="space-y-2">
        {transactions.map(t => (
          <div
            key={t.id}
            className="rounded-2xl overflow-hidden"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-3 px-4 pt-3 pb-2">
              {/* Category icon */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: t.category?.color + "22" }}>
                <DynamicIcon name={t.category?.icon || "tag"} size={18} style={{ color: t.category?.color }} strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>{t.description}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs" style={{ color: "var(--text-3)" }}>{t.category?.name}</span>
                  {t.subCategory && <><span style={{ color: "var(--text-3)" }}>·</span><span className="text-xs" style={{ color: "var(--text-3)" }}>{t.subCategory.name}</span></>}
                  <span style={{ color: "var(--text-3)" }}>·</span>
                  <span className="text-xs" style={{ color: "var(--text-3)" }}>{t.wallet?.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <p className={`text-sm font-bold ${t.type === "income" ? "text-income" : "text-expense"}`}>
                  {t.type === "income" ? "+" : "-"}{formatCurrency(parseFloat(t.amount?.toString() || "0"), currency)}
                </p>
              </div>
            </div>

            {/* Use Button */}
            <button
              onClick={() => handleQuickUse(t)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-all"
              style={{ borderTop: "1px solid var(--border)", color: t.category?.color || "var(--accent)" }}
            >
              <Zap size={12} fill="currentColor" />
              Use Again
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
