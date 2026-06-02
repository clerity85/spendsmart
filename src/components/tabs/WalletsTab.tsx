"use client";
import { useState } from "react";
import { Plus, TrendingUp, TrendingDown, Calendar, Pencil, Trash2, X, Check } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { Wallet } from "@/lib/db/schema";
import { useTransactions, useStats } from "@/hooks/useData";
import { useAppStore } from "@/lib/store";
import { formatCurrency, formatMonth, getMonthRange, COLORS, WALLET_ICONS } from "@/lib/utils";

function DynamicIcon({ name, ...props }: { name: string } & any) {
  const iconName = name.split('-').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join('');
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.Wallet;
  return <Icon {...props} />;
}

interface Props {
  wallets: Wallet[];
  onDataChange: () => void;
}

interface WalletCardProps {
  wallet: Wallet;
  currency: string;
  onEdit: (w: Wallet) => void;
  onDelete: (id: string) => void;
  onAddTx: (walletId: string) => void;
}

function WalletCard({ wallet: w, currency, onEdit, onDelete, onAddTx }: WalletCardProps) {
  const [showMonths, setShowMonths] = useState(false);
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const [selectedMonth] = useState(months[0]);
  const { start, end } = getMonthRange(selectedMonth.year, selectedMonth.month);
  const { stats } = useStats({ walletId: w.id, startDate: start.toISOString(), endDate: end.toISOString() });

  const balance = parseFloat(w.balance?.toString() || "0");

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      {/* Card Header */}
      <div className="p-5 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${w.color}dd, ${w.color})` }}>
        <div className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-10" style={{ background: "white", transform: "translate(30%, -30%)" }} />
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
              <DynamicIcon name={w.icon} size={18} color="white" />
            </div>
            <div>
              <p className="text-white font-display font-bold">{w.name}</p>
              {w.isDefault && <span className="text-white/60 text-xs">Default</span>}
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={() => onEdit(w)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
              <Pencil size={12} color="white" />
            </button>
            <button onClick={() => onDelete(w.id)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
              <Trash2 size={12} color="white" />
            </button>
          </div>
        </div>
        <p className="text-white/70 text-xs mb-0.5">Current Balance</p>
        <p className="text-white font-display font-bold text-2xl">{formatCurrency(balance, currency)}</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 divide-x" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="p-3 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "#dcfce7" }}>
            <TrendingUp size={12} style={{ color: "#22c55e" }} />
          </div>
          <div>
            <p className="text-[10px]" style={{ color: "var(--text-3)" }}>Income</p>
            <p className="text-xs font-bold text-income">{formatCurrency(stats?.income || 0, currency)}</p>
          </div>
        </div>
        <div className="p-3 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "#fee2e2" }}>
            <TrendingDown size={12} style={{ color: "#ef4444" }} />
          </div>
          <div>
            <p className="text-[10px]" style={{ color: "var(--text-3)" }}>Expenses</p>
            <p className="text-xs font-bold text-expense">{formatCurrency(stats?.expense || 0, currency)}</p>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown Toggle */}
      <div style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
        <button
          onClick={() => setShowMonths(!showMonths)}
          className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold transition-all"
          style={{ color: "var(--text-2)" }}
        >
          <span className="flex items-center gap-1.5"><Calendar size={13} /> Monthly Breakdown</span>
          <span>{showMonths ? "−" : "+"}</span>
        </button>
        {showMonths && (
          <div className="px-4 pb-3 space-y-2">
            {months.map(m => (
              <MonthBreakdownRow key={`${m.year}-${m.month}`} walletId={w.id} year={m.year} month={m.month} currency={currency} />
            ))}
          </div>
        )}
      </div>

      {/* Add Transaction Button */}
      <div style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
        <button
          onClick={() => onAddTx(w.id)}
          className="w-full py-3 text-xs font-bold transition-all rounded-b-2xl flex items-center justify-center gap-1.5"
          style={{ color: w.color }}
        >
          <Plus size={13} /> Add Transaction
        </button>
      </div>
    </div>
  );
}

function MonthBreakdownRow({ walletId, year, month, currency }: { walletId: string; year: number; month: number; currency: string }) {
  const { setActiveWalletId, setHistoryMonth, setActiveTab } = useAppStore();
  const { start, end } = getMonthRange(year, month);
  const { stats } = useStats({ walletId, startDate: start.toISOString(), endDate: end.toISOString() });

  return (
    <button
      onClick={() => {
        setActiveWalletId(walletId);
        setHistoryMonth({ year, month });
        setActiveTab("history");
      }}
      className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg hover:opacity-80 transition-all"
      style={{ background: "var(--surface-2)" }}
    >
      <span className="text-xs" style={{ color: "var(--text-2)" }}>{formatMonth(new Date(year, month, 1))}</span>
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-income">+{formatCurrency(stats?.income || 0, currency)}</span>
        <span className="text-xs font-medium text-expense">-{formatCurrency(stats?.expense || 0, currency)}</span>
      </div>
    </button>
  );
}

interface WalletFormData {
  name: string;
  icon: string;
  color: string;
  balance: string;
  isDefault: boolean;
}

export function WalletsTab({ wallets, onDataChange }: Props) {
  const { currency, setShowAddTransaction, setPrefillTransaction } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editWallet, setEditWallet] = useState<Wallet | null>(null);
  const [form, setForm] = useState<WalletFormData>({ name: "", icon: "wallet", color: COLORS[5], balance: "0", isDefault: false });

  const openAdd = () => {
    setEditWallet(null);
    setForm({ name: "", icon: "wallet", color: COLORS[5], balance: "0", isDefault: false });
    setShowForm(true);
  };

  const openEdit = (w: Wallet) => {
    setEditWallet(w);
    setForm({ name: w.name, icon: w.icon, color: w.color, balance: w.balance?.toString() || "0", isDefault: w.isDefault });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete wallet? All transactions will also be deleted.")) return;
    await fetch(`/api/wallets/${id}`, { method: "DELETE" });
    onDataChange();
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    if (editWallet) {
      await fetch(`/api/wallets/${editWallet.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, balance: form.balance || "0" }),
      });
    } else {
      await fetch("/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, balance: form.balance || "0" }),
      });
    }
    onDataChange();
    setShowForm(false);
  };

  const handleAddTx = (walletId: string) => {
    setPrefillTransaction({ walletId } as any);
    setShowAddTransaction(true);
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <button
        onClick={openAdd}
        className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition-all active:scale-98"
        style={{ background: "var(--accent)", color: "white" }}
      >
        <Plus size={16} /> Add Wallet
      </button>

      {wallets.length === 0 ? (
        <div className="text-center py-12">
          <p style={{ color: "var(--text-3)" }} className="text-sm">No wallets yet. Add your first!</p>
        </div>
      ) : (
        wallets.map(w => (
          <WalletCard key={w.id} wallet={w} currency={currency} onEdit={openEdit} onDelete={handleDelete} onAddTx={handleAddTx} />
        ))
      )}

      {/* Wallet Form Modal */}
      {showForm && (
        <>
          <div className="fixed inset-0 z-50 animate-fade-in" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setShowForm(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto animate-slide-up rounded-t-3xl overflow-hidden" style={{ background: "var(--surface)", maxHeight: "85vh" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-display font-bold text-lg" style={{ color: "var(--text)" }}>{editWallet ? "Edit Wallet" : "New Wallet"}</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--surface-2)" }}>
                <X size={16} />
              </button>
            </div>
            <div className="overflow-y-auto p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-2)" }}>Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Main Account" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                  style={{ background: "var(--surface-2)", color: "var(--text)" }} />
              </div>
              {!editWallet && (
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-2)" }}>Initial Balance</label>
                  <input type="number" value={form.balance} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))}
                    placeholder="0.00" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                    style={{ background: "var(--surface-2)", color: "var(--text)" }} min="0" step="0.01" />
                </div>
              )}
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--text-2)" }}>Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                      style={{ background: c, transform: form.color === c ? "scale(1.2)" : "scale(1)" }}>
                      {form.color === c && <Check size={12} color="white" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--text-2)" }}>Icon</label>
                <div className="flex flex-wrap gap-2">
                  {WALLET_ICONS.map(icon => (
                    <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))}
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                      style={{ background: form.icon === icon ? form.color + "22" : "var(--surface-2)", border: `2px solid ${form.icon === icon ? form.color : "transparent"}` }}>
                      <DynamicIcon name={icon} size={16} style={{ color: form.icon === icon ? form.color : "var(--text-2)" }} />
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={form.isDefault} onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))} />
                  <div className="w-10 h-6 rounded-full transition-all" style={{ background: form.isDefault ? "var(--accent)" : "var(--surface-3)" }}>
                    <div className="w-4 h-4 rounded-full bg-white absolute top-1 transition-all" style={{ left: form.isDefault ? "22px" : "4px" }} />
                  </div>
                </div>
                <span className="text-sm" style={{ color: "var(--text)" }}>Set as default wallet</span>
              </label>
              <button onClick={handleSubmit} className="w-full py-3.5 rounded-xl font-bold text-sm" style={{ background: "var(--accent)", color: "white" }}>
                {editWallet ? "Save Changes" : "Create Wallet"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
