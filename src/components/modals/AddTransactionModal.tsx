"use client";
import { useState, useEffect } from "react";
import { X, Plus, ChevronDown } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useAppStore } from "@/lib/store";
import type { Wallet } from "@/lib/db/schema";
import type { CategoryWithSubs } from "@/hooks/useData";
import { cn } from "@/lib/utils";

function DynamicIcon({ name, ...props }: { name: string } & any) {
  const iconName = name.split('-').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join('');
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.Tag;
  return <Icon {...props} />;
}

interface Props {
  wallets: Wallet[];
  categories: CategoryWithSubs[];
  onClose: () => void;
  onSuccess: () => void;
}

export function AddTransactionModal({ wallets, categories, onClose, onSuccess }: Props) {
  const { editingTransaction, prefillTransaction } = useAppStore();
  const isEditing = !!editingTransaction;

  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [walletId, setWalletId] = useState(wallets.find(w => w.isDefault)?.id || wallets[0]?.id || "");
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [newSubCatName, setNewSubCatName] = useState("");
  const [addingSubCat, setAddingSubCat] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filteredCategories = categories.filter(c => c.type === type);
  const selectedCategory = categories.find(c => c.id === categoryId);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(Math.abs(parseFloat(editingTransaction.amount?.toString() || "0")).toString());
      setDescription(editingTransaction.description || "");
      setNotes(editingTransaction.notes || "");
      setWalletId(editingTransaction.walletId);
      setCategoryId(editingTransaction.categoryId);
      setSubCategoryId(editingTransaction.subCategoryId || "");
      setDate(new Date(editingTransaction.date).toISOString().slice(0, 16));
    } else if (prefillTransaction) {
      setType(prefillTransaction.type || "expense");
      setAmount(Math.abs(parseFloat(prefillTransaction.amount?.toString() || "0")).toString() || "");
      setDescription(prefillTransaction.description || "");
      setCategoryId(prefillTransaction.categoryId || "");
      setSubCategoryId(prefillTransaction.subCategoryId || "");
      if (prefillTransaction.walletId) setWalletId(prefillTransaction.walletId);
    }
  }, [editingTransaction, prefillTransaction]);

  // Set first category of type when type changes
  useEffect(() => {
    if (!isEditing && !prefillTransaction?.categoryId) {
      const first = filteredCategories[0];
      if (first) setCategoryId(first.id);
    }
  }, [type]);

  const createSubCategory = async () => {
    if (!newSubCatName.trim() || !categoryId) return;
    const res = await fetch("/api/subcategories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, name: newSubCatName.trim() }),
    });
    if (res.ok) {
      const sc = await res.json();
      onSuccess();
      setSubCategoryId(sc.id);
      setNewSubCatName("");
      setAddingSubCat(false);
    }
  };

  const handleSubmit = async () => {
    if (!amount || !description || !walletId || !categoryId) {
      setError("Please fill all required fields");
      return;
    }
    if (parseFloat(amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        walletId, categoryId,
        subCategoryId: subCategoryId || null,
        type, amount: parseFloat(amount),
        description: description.trim(),
        notes: notes.trim() || null,
        date: new Date(date).toISOString(),
      };
      const url = isEditing ? `/api/transactions/${editingTransaction!.id}` : "/api/transactions";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Failed to save");
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 animate-fade-in"
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto animate-slide-up"
        style={{
          background: "var(--surface)",
          borderRadius: "24px 24px 0 0",
          maxHeight: "92vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--border)" }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="font-display font-bold text-xl" style={{ color: "var(--text)" }}>
            {isEditing ? "Edit Transaction" : "Add Transaction"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--surface-2)" }}>
            <X size={16} style={{ color: "var(--text-2)" }} />
          </button>
        </div>

        {/* Type Toggle */}
        <div className="px-5 mb-4">
          <div className="flex rounded-xl p-1 gap-1" style={{ background: "var(--surface-2)" }}>
            {(["expense", "income"] as const).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn("flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize")}
                style={{
                  background: type === t ? (t === "income" ? "#22c55e" : "#ef4444") : "transparent",
                  color: type === t ? "white" : "var(--text-2)",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-4">
          {/* Amount */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-2)" }}>Amount *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: "var(--text-3)" }}>$</span>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-xl text-sm font-semibold focus:outline-none transition-all"
                style={{
                  background: "var(--surface-2)",
                  color: "var(--text)",
                  border: "2px solid transparent",
                }}
                onFocus={e => e.currentTarget.style.borderColor = "var(--accent)"}
                onBlur={e => e.currentTarget.style.borderColor = "transparent"}
                min="0" step="0.01"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-2)" }}>Description *</label>
            <input
              type="text"
              placeholder="What was this for?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all"
              style={{ background: "var(--surface-2)", color: "var(--text)", border: "2px solid transparent" }}
              onFocus={e => e.currentTarget.style.borderColor = "var(--accent)"}
              onBlur={e => e.currentTarget.style.borderColor = "transparent"}
            />
          </div>

          {/* Wallet */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-2)" }}>Wallet *</label>
            <div className="relative">
              <select
                value={walletId}
                onChange={e => setWalletId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm appearance-none focus:outline-none transition-all"
                style={{ background: "var(--surface-2)", color: "var(--text)", border: "2px solid transparent" }}
                onFocus={e => e.currentTarget.style.borderColor = "var(--accent)"}
                onBlur={e => e.currentTarget.style.borderColor = "transparent"}
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-3)" }} />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-2)" }}>Category *</label>
            <div className="grid grid-cols-3 gap-2">
              {filteredCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setCategoryId(cat.id); setSubCategoryId(""); }}
                  className="flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all text-center"
                  style={{
                    background: categoryId === cat.id ? cat.color + "22" : "var(--surface-2)",
                    border: `2px solid ${categoryId === cat.id ? cat.color : "transparent"}`,
                  }}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: cat.color + "33" }}>
                    <DynamicIcon name={cat.icon} size={14} style={{ color: cat.color }} />
                  </div>
                  <span className="text-xs font-medium leading-tight truncate w-full" style={{ color: "var(--text)" }}>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sub-Category */}
          {selectedCategory && (
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-2)" }}>Sub-category <span style={{ color: "var(--text-3)" }}>(optional)</span></label>
              <div className="flex flex-wrap gap-2 mb-2">
                <button
                  onClick={() => setSubCategoryId("")}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: !subCategoryId ? "var(--accent)" : "var(--surface-2)",
                    color: !subCategoryId ? "white" : "var(--text-2)",
                  }}
                >
                  None
                </button>
                {selectedCategory.subCategories.map(sc => (
                  <button
                    key={sc.id}
                    onClick={() => setSubCategoryId(sc.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: subCategoryId === sc.id ? "var(--accent)" : "var(--surface-2)",
                      color: subCategoryId === sc.id ? "white" : "var(--text-2)",
                    }}
                  >
                    {sc.name}
                  </button>
                ))}
                <button
                  onClick={() => setAddingSubCat(!addingSubCat)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
                  style={{ background: "var(--surface-2)", color: "var(--text-3)" }}
                >
                  <Plus size={10} /> New
                </button>
              </div>
              {addingSubCat && (
                <div className="flex gap-2">
                  <input
                    value={newSubCatName}
                    onChange={e => setNewSubCatName(e.target.value)}
                    placeholder="Sub-category name"
                    className="flex-1 px-3 py-2 rounded-xl text-sm focus:outline-none"
                    style={{ background: "var(--surface-2)", color: "var(--text)", border: "2px solid var(--accent)" }}
                    onKeyDown={e => e.key === "Enter" && createSubCategory()}
                  />
                  <button
                    onClick={createSubCategory}
                    className="px-3 py-2 rounded-xl text-sm font-semibold"
                    style={{ background: "var(--accent)", color: "white" }}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Date */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-2)" }}>Date & Time</label>
            <input
              type="datetime-local"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all"
              style={{ background: "var(--surface-2)", color: "var(--text)", border: "2px solid transparent" }}
              onFocus={e => e.currentTarget.style.borderColor = "var(--accent)"}
              onBlur={e => e.currentTarget.style.borderColor = "transparent"}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-2)" }}>Notes <span style={{ color: "var(--text-3)" }}>(optional)</span></label>
            <textarea
              placeholder="Any additional notes..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none resize-none transition-all"
              style={{ background: "var(--surface-2)", color: "var(--text)", border: "2px solid transparent" }}
              onFocus={e => e.currentTarget.style.borderColor = "var(--accent)"}
              onBlur={e => e.currentTarget.style.borderColor = "transparent"}
            />
          </div>

          {error && (
            <p className="text-sm text-center px-4 py-2.5 rounded-xl" style={{ background: "#fee2e2", color: "#ef4444" }}>{error}</p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-98 disabled:opacity-60"
            style={{ background: "var(--accent)", color: "white" }}
          >
            {saving ? "Saving..." : isEditing ? "Update Transaction" : `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`}
          </button>
        </div>
      </div>
    </>
  );
}
