"use client";
import { useState } from "react";
import { Moon, Sun, DollarSign, Tag, Plus, Trash2, Pencil, X, Check, ChevronDown, ChevronRight, Database, RefreshCw } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useAppStore } from "@/lib/store";
import type { CategoryWithSubs } from "@/hooks/useData";
import { COLORS, CATEGORY_ICONS, CURRENCY_OPTIONS } from "@/lib/utils";
import { cn } from "@/lib/utils";

function DynamicIcon({ name, ...props }: { name: string } & any) {
  const n = name.split('-').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join('');
  const Icon = (LucideIcons as any)[n] || LucideIcons.Tag;
  return <Icon {...props} />;
}

interface Props {
  categories: CategoryWithSubs[];
  onCategoryChange: () => void;
}

type CatType = "expense" | "income";

interface CatForm {
  name: string;
  icon: string;
  color: string;
  type: CatType;
}

export function SettingsTab({ categories, onCategoryChange }: Props) {
  const { theme, setTheme, currency, setCurrency } = useAppStore();
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [catType, setCatType] = useState<CatType>("expense");
  const [showCatForm, setShowCatForm] = useState(false);
  const [editCat, setEditCat] = useState<CategoryWithSubs | null>(null);
  const [catForm, setCatForm] = useState<CatForm>({ name: "", icon: "tag", color: COLORS[0], type: "expense" });
  const [expandedCatId, setExpandedCatId] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState<Record<string, string>>({});
  const [addingSubFor, setAddingSubFor] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");

  const filtered = categories.filter(c => c.type === catType);

  const openAddCat = () => {
    setEditCat(null);
    setCatForm({ name: "", icon: "tag", color: COLORS[0], type: catType });
    setShowCatForm(true);
  };

  const openEditCat = (cat: CategoryWithSubs) => {
    setEditCat(cat);
    setCatForm({ name: cat.name, icon: cat.icon, color: cat.color, type: cat.type as CatType });
    setShowCatForm(true);
  };

  const submitCat = async () => {
    if (!catForm.name.trim()) return;
    if (editCat) {
      await fetch(`/api/categories/${editCat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(catForm),
      });
    } else {
      await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...catForm, type: catType }),
      });
    }
    onCategoryChange();
    setShowCatForm(false);
  };

  const deleteCat = async (id: string) => {
    if (!confirm("Delete category? Transactions using it may be affected.")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    onCategoryChange();
  };

  const addSubCat = async (catId: string) => {
    const name = newSubName[catId]?.trim();
    if (!name) return;
    await fetch("/api/subcategories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: catId, name }),
    });
    setNewSubName(prev => ({ ...prev, [catId]: "" }));
    setAddingSubFor(null);
    onCategoryChange();
  };

  const handleReseed = async () => {
    setSeeding(true);
    setSeedMsg("");
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      setSeedMsg(res.ok ? "✅ Demo data loaded!" : "❌ Seeding failed");
      onCategoryChange();
    } catch {
      setSeedMsg("❌ Error occurred");
    } finally {
      setSeeding(false);
    }
  };

  const selectedCurrency = CURRENCY_OPTIONS.find(c => c.code === currency) || CURRENCY_OPTIONS[0];

  return (
    <div className="px-4 py-4 space-y-4">

      {/* Appearance */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <p className="font-display font-bold text-sm" style={{ color: "var(--text)" }}>Appearance</p>
        </div>
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--surface-2)" }}>
              {theme === "dark" ? <Moon size={18} style={{ color: "var(--text-2)" }} /> : <Sun size={18} style={{ color: "#f59e0b" }} />}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                {theme === "dark" ? "Dark Mode" : "Light Mode"}
              </p>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>Toggle appearance theme</p>
            </div>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative w-12 h-6 rounded-full transition-all flex-shrink-0"
            style={{ background: theme === "dark" ? "var(--accent)" : "var(--surface-3)" }}
          >
            <div
              className="absolute w-5 h-5 rounded-full bg-white top-0.5 transition-all shadow-sm"
              style={{ left: theme === "dark" ? "26px" : "2px" }}
            />
          </button>
        </div>
      </div>

      {/* Currency */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <p className="font-display font-bold text-sm" style={{ color: "var(--text)" }}>Currency</p>
        </div>
        <button
          onClick={() => setShowCurrencyPicker(!showCurrencyPicker)}
          className="w-full px-4 py-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--surface-2)" }}>
              <DollarSign size={18} style={{ color: "var(--text-2)" }} />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                {selectedCurrency.symbol} {selectedCurrency.code}
              </p>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>{selectedCurrency.name}</p>
            </div>
          </div>
          <ChevronDown size={16} style={{ color: "var(--text-3)", transform: showCurrencyPicker ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </button>
        {showCurrencyPicker && (
          <div style={{ borderTop: "1px solid var(--border)" }}>
            {CURRENCY_OPTIONS.map(opt => (
              <button
                key={opt.code}
                onClick={() => { setCurrency(opt.code); setShowCurrencyPicker(false); }}
                className="w-full flex items-center justify-between px-4 py-3 text-left transition-all"
                style={{ background: currency === opt.code ? "var(--surface-2)" : "transparent" }}
              >
                <div>
                  <span className="text-sm font-medium mr-2" style={{ color: "var(--text)" }}>{opt.symbol}</span>
                  <span className="text-sm" style={{ color: "var(--text)" }}>{opt.code}</span>
                  <span className="text-xs ml-2" style={{ color: "var(--text-3)" }}>{opt.name}</span>
                </div>
                {currency === opt.code && <Check size={14} style={{ color: "var(--accent)" }} />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category Manager */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
          <p className="font-display font-bold text-sm" style={{ color: "var(--text)" }}>Categories</p>
          <button
            onClick={openAddCat}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: "var(--accent)", color: "white" }}
          >
            <Plus size={11} /> Add
          </button>
        </div>

        {/* Type Toggle */}
        <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex rounded-xl p-1 gap-1" style={{ background: "var(--surface-2)" }}>
            {(["expense", "income"] as CatType[]).map(t => (
              <button
                key={t}
                onClick={() => setCatType(t)}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize"
                style={{
                  background: catType === t ? (t === "income" ? "#22c55e" : "#ef4444") : "transparent",
                  color: catType === t ? "white" : "var(--text-2)",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Category List */}
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {filtered.length === 0 ? (
            <p className="text-xs text-center py-6" style={{ color: "var(--text-3)" }}>No {catType} categories yet</p>
          ) : filtered.map(cat => (
            <div key={cat.id}>
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cat.color + "22" }}>
                  <DynamicIcon name={cat.icon} size={15} style={{ color: cat.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{cat.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-3)" }}>{cat.subCategories.length} sub-categories</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setExpandedCatId(expandedCatId === cat.id ? null : cat.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: "var(--surface-2)" }}
                  >
                    <ChevronRight size={12} style={{ color: "var(--text-3)", transform: expandedCatId === cat.id ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
                  </button>
                  <button onClick={() => openEditCat(cat)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--surface-2)" }}>
                    <Pencil size={12} style={{ color: "var(--text-2)" }} />
                  </button>
                  <button onClick={() => deleteCat(cat.id)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#fee2e2" }}>
                    <Trash2 size={12} style={{ color: "#ef4444" }} />
                  </button>
                </div>
              </div>

              {/* Sub-categories */}
              {expandedCatId === cat.id && (
                <div className="px-4 pb-3 pl-14 space-y-1.5">
                  {cat.subCategories.map(sc => (
                    <div key={sc.id} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: "var(--surface-2)" }}>
                      <span className="text-xs font-medium" style={{ color: "var(--text-2)" }}>{sc.name}</span>
                    </div>
                  ))}
                  {addingSubFor === cat.id ? (
                    <div className="flex gap-2 mt-1">
                      <input
                        value={newSubName[cat.id] || ""}
                        onChange={e => setNewSubName(prev => ({ ...prev, [cat.id]: e.target.value }))}
                        placeholder="Sub-category name"
                        className="flex-1 px-3 py-1.5 rounded-lg text-xs focus:outline-none"
                        style={{ background: "var(--surface-2)", color: "var(--text)", border: "2px solid var(--accent)" }}
                        onKeyDown={e => e.key === "Enter" && addSubCat(cat.id)}
                        autoFocus
                      />
                      <button onClick={() => addSubCat(cat.id)} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "var(--accent)", color: "white" }}>Add</button>
                      <button onClick={() => setAddingSubFor(null)} className="px-2.5 py-1.5 rounded-lg text-xs" style={{ background: "var(--surface-2)", color: "var(--text-2)" }}>✕</button>
                    </div>
                  ) : (
                    <button onClick={() => setAddingSubFor(cat.id)} className="flex items-center gap-1 text-xs font-medium mt-1" style={{ color: cat.color }}>
                      <Plus size={11} /> Add sub-category
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Data Stats */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <p className="font-display font-bold text-sm" style={{ color: "var(--text)" }}>Data</p>
        </div>
        <div className="px-4 py-3 grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl" style={{ background: "var(--surface-2)" }}>
            <p className="text-xs" style={{ color: "var(--text-3)" }}>Categories</p>
            <p className="text-xl font-display font-bold" style={{ color: "var(--text)" }}>{categories.length}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: "var(--surface-2)" }}>
            <p className="text-xs" style={{ color: "var(--text-3)" }}>Sub-categories</p>
            <p className="text-xl font-display font-bold" style={{ color: "var(--text)" }}>
              {categories.reduce((s, c) => s + c.subCategories.length, 0)}
            </p>
          </div>
        </div>
        <div className="px-4 pb-4">
          <button
            onClick={handleReseed}
            disabled={seeding}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
            style={{ background: "var(--surface-2)", color: "var(--text-2)" }}
          >
            <RefreshCw size={14} className={seeding ? "animate-spin" : ""} />
            {seeding ? "Loading..." : "Reload Demo Data"}
          </button>
          {seedMsg && <p className="text-xs text-center mt-2" style={{ color: "var(--text-3)" }}>{seedMsg}</p>}
        </div>
      </div>

      {/* App Info */}
      <div className="text-center py-4 space-y-1">
        <p className="font-display font-bold text-sm" style={{ color: "var(--accent)" }}>Spendmart</p>
        <p className="text-xs" style={{ color: "var(--text-3)" }}>v1.0.0 — Built for Vercel + Postgres</p>
        <p className="text-xs" style={{ color: "var(--text-3)" }}>User → Category → Sub-category → Transaction</p>
      </div>

      {/* Category Form Modal */}
      {showCatForm && (
        <>
          <div className="fixed inset-0 z-50 animate-fade-in" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setShowCatForm(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto animate-slide-up rounded-t-3xl overflow-hidden" style={{ background: "var(--surface)", maxHeight: "85vh" }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <h3 className="font-display font-bold text-lg" style={{ color: "var(--text)" }}>
                {editCat ? "Edit Category" : "New Category"}
              </h3>
              <button onClick={() => setShowCatForm(false)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--surface-2)" }}>
                <X size={16} />
              </button>
            </div>
            <div className="overflow-y-auto p-5 space-y-4">
              {!editCat && (
                <div className="flex rounded-xl p-1 gap-1" style={{ background: "var(--surface-2)" }}>
                  {(["expense", "income"] as CatType[]).map(t => (
                    <button key={t} onClick={() => setCatForm(f => ({ ...f, type: t }))}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all"
                      style={{ background: catForm.type === t ? (t === "income" ? "#22c55e" : "#ef4444") : "transparent", color: catForm.type === t ? "white" : "var(--text-2)" }}>
                      {t}
                    </button>
                  ))}
                </div>
              )}
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-2)" }}>Name</label>
                <input value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Category name" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                  style={{ background: "var(--surface-2)", color: "var(--text)" }} />
              </div>
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--text-2)" }}>Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setCatForm(f => ({ ...f, color: c }))}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                      style={{ background: c, transform: catForm.color === c ? "scale(1.2)" : "scale(1)" }}>
                      {catForm.color === c && <Check size={12} color="white" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--text-2)" }}>Icon</label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {CATEGORY_ICONS.map(icon => (
                    <button key={icon} onClick={() => setCatForm(f => ({ ...f, icon }))}
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                      style={{
                        background: catForm.icon === icon ? catForm.color + "22" : "var(--surface-2)",
                        border: `2px solid ${catForm.icon === icon ? catForm.color : "transparent"}`,
                      }}>
                      <DynamicIcon name={icon} size={16} style={{ color: catForm.icon === icon ? catForm.color : "var(--text-2)" }} />
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={submitCat} className="w-full py-3.5 rounded-xl font-bold text-sm" style={{ background: "var(--accent)", color: "white" }}>
                {editCat ? "Save Changes" : "Create Category"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
