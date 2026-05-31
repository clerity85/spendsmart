"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Sun, Moon, Wallet, Plus, Heart, Pencil, Trash2,
  ChevronRight, ChevronLeft, X, Settings, Home, List,
  Search, Copy, AlertCircle, TrendingUp, TrendingDown,
  PiggyBank, ChevronDown, RefreshCw, WifiOff,
} from "lucide-react";

// ─── helpers ─────────────────────────────────────────────────────────────────
const formatSGD = (n) =>
  new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD" }).format(n ?? 0);

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const today  = () => new Date().toISOString().split("T")[0];
const uid    = () => Math.random().toString(36).slice(2, 10);

// ─── API helpers ─────────────────────────────────────────────────────────────
const api = {
  get:    (url)       => fetch(url).then(r => r.json()),
  post:   (url, body) => fetch(url, { method: "POST",   headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
  patch:  (url, body) => fetch(url, { method: "PATCH",  headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
  delete: (url, body) => fetch(url, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
};

// ─── Persist dark-mode preference locally (UI-only, not DB data) ─────────────
function useDarkMode() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    try { const s = localStorage.getItem("et_dark"); if (s !== null) setDark(JSON.parse(s)); }
    catch {}
  }, []);
  const toggle = useCallback(() => {
    setDark(d => {
      const next = !d;
      try { localStorage.setItem("et_dark", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);
  return [dark, toggle];
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/90" />
      <div
        className="relative w-full bg-white border border-gray-100 rounded-t-3xl shadow-2xl overflow-hidden animate-slideUp"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: "92vh", overflowY: "auto" }}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Input / Select ───────────────────────────────────────────────────────────
function Input({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold uppercase tracking-wider text-gray-500">{label}</label>}
      <input
        {...props}
        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-base"
      />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold uppercase tracking-wider text-gray-500">{label}</label>}
      <select
        {...props}
        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-base appearance-none"
      >
        {children}
      </select>
    </div>
  );
}

// ─── Transaction Form ─────────────────────────────────────────────────────────
function TxForm({ wallets, categories, onSave, onClose, initial, onUpdateCategory }) {
  const [type,     setType]     = useState(initial?.type        ?? "expense");
  const [amount,   setAmount]   = useState(initial?.amount      ?? "");
  const [walletId, setWalletId] = useState(initial?.walletId    ?? wallets[0]?.id ?? "");
  const [catId,    setCatId]    = useState(initial?.categoryId  ?? "");
  const [subCat,   setSubCat]   = useState(initial?.subCategory ?? "");
  const [note,     setNote]     = useState(initial?.note        ?? "");
  const [date,     setDate]     = useState(initial?.date        ?? today());
  const [fav,      setFav]      = useState(initial?.favourite   ?? false);
  const [newSub,   setNewSub]   = useState("");
  const [saving,   setSaving]   = useState(false);

  const cat  = categories.find(c => c.id === catId);
  const subs = cat?.children ?? [];

  const addSubLocally = () => {
    if (!newSub.trim() || !cat) return;
    const updated = [...subs, newSub.trim()];
    onUpdateCategory(cat.id, updated); // persists to DB + updates local state
    setSubCat(newSub.trim());
    setNewSub("");
  };

  const handleSave = async () => {
    if (!amount || !catId || !walletId) return;
    setSaving(true);
    await onSave({
      id: initial?.id ?? uid(), type,
      amount: parseFloat(amount), walletId,
      categoryId: catId, subCategory: subCat,
      note, date, favourite: fav,
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex rounded-xl overflow-hidden border border-gray-200">
        {["expense","income"].map(t => (
          <button key={t} onClick={() => setType(t)}
            className={`flex-1 py-3 text-base font-semibold capitalize transition-all ${type===t ? (t==="expense" ? "bg-red-500 text-white" : "bg-emerald-500 text-white") : "bg-gray-50 text-gray-400"}`}>
            {t === "expense" ? "− Expense" : "+ Income"}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold uppercase tracking-wider text-gray-500">Amount (SGD)</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-base">$</span>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
            className="w-full pl-9 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-base" />
        </div>
      </div>

      <Select label="Wallet" value={walletId} onChange={e => setWalletId(e.target.value)}>
        {wallets.map(w => <option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}
      </Select>

      <Select label="Category" value={catId} onChange={e => { setCatId(e.target.value); setSubCat(""); }}>
        <option value="">Select category…</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
      </Select>

      {cat && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold uppercase tracking-wider text-gray-500">Sub-Category</label>
          <div className="flex flex-wrap gap-2">
            {subs.map(s => (
              <button key={s} onClick={() => setSubCat(s === subCat ? "" : s)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${subCat===s ? "text-white border-transparent" : "bg-gray-50 border-gray-200 text-gray-600"}`}
                style={subCat===s ? { backgroundColor: cat.color, borderColor: cat.color } : {}}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-1">
            <input value={newSub} onChange={e => setNewSub(e.target.value)} placeholder="Add new sub-category…"
              className="flex-1 px-3 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyDown={e => { if (e.key === "Enter") addSubLocally(); }}
            />
            <button onClick={addSubLocally}
              className="px-4 py-2.5 rounded-lg bg-indigo-500 text-white text-sm font-semibold">Add</button>
          </div>
        </div>
      )}

      <Input label="Note / Description" value={note} onChange={e => setNote(e.target.value)} placeholder="Optional note…" />
      <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} />

      <button onClick={() => setFav(!fav)}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all text-base font-semibold ${fav ? "bg-pink-50 border-pink-300 text-pink-600" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
        <Heart size={18} fill={fav ? "currentColor" : "none"} />
        {fav ? "Saved as Favourite" : "Save as Favourite"}
      </button>

      <div className="flex gap-3 pt-2">
        <button onClick={onClose} disabled={saving}
          className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-500 text-base font-semibold hover:bg-gray-50 transition">Cancel</button>
        <button onClick={handleSave} disabled={!amount || !catId || !walletId || saving}
          className="flex-1 py-3.5 rounded-xl bg-indigo-500 text-white text-base font-semibold hover:opacity-90 transition disabled:opacity-40 flex items-center justify-center gap-2">
          {saving ? <RefreshCw size={16} className="animate-spin" /> : null}
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

// ─── Transaction Row ──────────────────────────────────────────────────────────
function TxRow({ tx, categories, wallets, onEdit, onDelete, onToggleFav, onUseFav }) {
  const cat    = categories.find(c => c.id === tx.categoryId);
  const wallet = wallets.find(w => w.id === tx.walletId);
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--surface)] transition text-left"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: (cat?.color ?? "#64748b") + "22" }}>
          {cat?.icon ?? "📦"}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-base font-semibold text-[var(--text)]">{cat?.name ?? "Unknown"}</span>
            {tx.subCategory && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                style={{ backgroundColor: (cat?.color ?? "#64748b") + "22", color: cat?.color ?? "#64748b" }}>
                {tx.subCategory}
              </span>
            )}
          </div>
          {tx.note && <p className="text-sm text-[var(--muted)] mt-0.5 truncate">{tx.note}</p>}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-base font-bold ${tx.type === "income" ? "text-emerald-500" : "text-red-500"}`}>
            {tx.type === "income" ? "+" : "−"}{formatSGD(tx.amount)}
          </span>
          <ChevronDown size={16} className={`text-[var(--muted)] transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {expanded && (
        <div className="mx-4 mb-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <div className="px-4 py-3 flex flex-col gap-2">
            {[
              ["Date",   tx.date],
              ["Wallet", wallet ? `${wallet.icon} ${wallet.name}` : "—"],
              ["Type",   tx.type],
              ...(tx.note ? [["Note", tx.note]] : []),
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-start gap-4">
                <span className="text-sm text-[var(--muted)] font-medium">{k}</span>
                <span className={`text-sm font-semibold text-right ${k==="Type" ? (v==="income"?"text-emerald-500":"text-red-500") : "text-[var(--text)]"}`}>{v}</span>
              </div>
            ))}
          </div>
          <div className="flex border-t border-[var(--border)]">
            <button onClick={() => onToggleFav(tx.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold text-[var(--muted)] hover:bg-[var(--border)] transition">
              <Heart size={15} fill={tx.favourite ? "#ec4899" : "none"} className={tx.favourite ? "text-pink-500" : ""} />
              {tx.favourite ? "Unfave" : "Fave"}
            </button>
            {onUseFav && (
              <button onClick={() => onUseFav(tx)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold text-[var(--muted)] hover:bg-[var(--border)] transition border-l border-[var(--border)]">
                <Copy size={15} /> Use Again
              </button>
            )}
            <button onClick={() => onEdit(tx)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold text-[var(--muted)] hover:bg-[var(--border)] transition border-l border-[var(--border)]">
              <Pencil size={15} /> Edit
            </button>
            <button onClick={() => onDelete(tx.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition border-l border-[var(--border)]">
              <Trash2 size={15} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Wallet Card ──────────────────────────────────────────────────────────────
function WalletCard({ wallet, txs, selected, onClick }) {
  const balance = txs.reduce((s, t) =>
    t.walletId === wallet.id ? (t.type === "income" ? s + t.amount : s - t.amount) : s,
    wallet.balance ?? 0);
  return (
    <button onClick={onClick}
      className={`p-4 rounded-2xl border-2 transition-all text-left w-full ${selected ? "border-[var(--accent)] shadow-lg scale-[1.02]" : "border-[var(--border)]"}`}
      style={{ background: selected ? wallet.color + "18" : "var(--surface)" }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{wallet.icon}</span>
        <span className="text-sm font-semibold px-2 py-0.5 rounded-full"
          style={{ background: wallet.color + "22", color: wallet.color }}>{wallet.name}</span>
      </div>
      <div className="text-2xl font-black text-[var(--text)]">{formatSGD(balance)}</div>
      <div className="text-sm text-[var(--muted)] mt-1">
        {txs.filter(t => t.walletId === wallet.id).length} transactions
      </div>
    </button>
  );
}

// ─── Loading / Error states ───────────────────────────────────────────────────
function LoadingScreen({ dark }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4"
      style={{ background: dark ? "#0f1117" : "#f8fafc" }}>
      <RefreshCw size={32} className="animate-spin text-indigo-500" />
      <p className="text-sm font-medium" style={{ color: dark ? "#6b7280" : "#94a3b8" }}>Loading SpendSmart…</p>
    </div>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="mx-4 mt-4 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3">
      <WifiOff size={20} className="text-red-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-red-700">Connection error</p>
        <p className="text-xs text-red-500 truncate">{message}</p>
      </div>
      <button onClick={onRetry} className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold">
        Retry
      </button>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function ExpenseTracker() {
  const [dark, toggleDark] = useDarkMode();

  // DB state
  const [wallets,      setWallets]      = useState([]);
  const [categories,   setCategories]   = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  // UI state
  const [tab,            setTab]            = useState("home");
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [viewMonth,      setViewMonth]      = useState(new Date().getMonth());
  const [viewYear,       setViewYear]       = useState(new Date().getFullYear());
  const [search,         setSearch]         = useState("");
  const [txModal,        setTxModal]        = useState(false);
  const [editTx,         setEditTx]         = useState(null);
  const [walletModal,    setWalletModal]     = useState(false);
  const [catModal,       setCatModal]        = useState(false);
  const [newWallet,      setNewWallet]       = useState({ name: "", icon: "💳", color: "#6366f1" });
  const [newCat,         setNewCat]          = useState({ name: "", icon: "📦", color: "#64748b", child: "" });

  // ─── Load all data ──────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ws, cs, txs] = await Promise.all([
        api.get("/api/wallets"),
        api.get("/api/categories"),
        api.get("/api/transactions"),
      ]);
      if (ws.error || cs.error || txs.error)
        throw new Error(ws.error ?? cs.error ?? txs.error);
      setWallets(ws);
      setCategories(cs);
      setTransactions(txs);
    } catch (e) {
      setError(e.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ─── Derived state ──────────────────────────────────────────────────────────
  const favourites = useMemo(() => transactions.filter(t => t.favourite), [transactions]);

  const monthTxs = useMemo(() =>
    transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === viewMonth && d.getFullYear() === viewYear &&
        (!selectedWallet || t.walletId === selectedWallet);
    }), [transactions, viewMonth, viewYear, selectedWallet]);

  const searchTxs = useMemo(() => {
    if (!search) return monthTxs;
    const q = search.toLowerCase();
    return monthTxs.filter(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      return (cat?.name ?? "").toLowerCase().includes(q) ||
        (t.note ?? "").toLowerCase().includes(q) ||
        (t.subCategory ?? "").toLowerCase().includes(q);
    });
  }, [monthTxs, search, categories]);

  const totalIncome  = monthTxs.filter(t => t.type === "income").reduce((s,t) => s + t.amount, 0);
  const totalExpense = monthTxs.filter(t => t.type === "expense").reduce((s,t) => s + t.amount, 0);
  const netBalance   = totalIncome - totalExpense;

  const catSpend = useMemo(() => {
    const m = {};
    monthTxs.filter(t => t.type === "expense").forEach(t => { m[t.categoryId] = (m[t.categoryId] ?? 0) + t.amount; });
    return Object.entries(m)
      .map(([id, total]) => ({ id, total, cat: categories.find(c => c.id === id) }))
      .sort((a,b) => b.total - a.total);
  }, [monthTxs, categories]);

  // ─── CRUD actions ───────────────────────────────────────────────────────────
  const saveTx = async (tx) => {
    const saved = await api.post("/api/transactions", tx);
    setTransactions(prev => {
      const idx = prev.findIndex(t => t.id === saved.id);
      return idx >= 0 ? prev.map(t => t.id === saved.id ? saved : t) : [saved, ...prev];
    });
  };

  const deleteTx = async (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));   // optimistic
    await api.delete("/api/transactions", { id });
  };

  const toggleFav = async (id) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;
    const updated = { ...tx, favourite: !tx.favourite };
    setTransactions(prev => prev.map(t => t.id === id ? updated : t));  // optimistic
    await api.post("/api/transactions", updated);
  };

  const useFav = (tx) => {
    setEditTx({ ...tx, id: uid(), date: today(), favourite: false });
    setTxModal(true);
  };

  const updateCategoryChildren = async (catId, children) => {
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, children } : c));
    await api.patch("/api/categories", { id: catId, children });
  };

  const addWallet = async () => {
    if (!newWallet.name.trim()) return;
    const w = await api.post("/api/wallets", { ...newWallet, id: uid() });
    setWallets(prev => [...prev, w]);
    setNewWallet({ name: "", icon: "💳", color: "#6366f1" });
    setWalletModal(false);
  };

  const addCategory = async () => {
    if (!newCat.name.trim()) return;
    const c = await api.post("/api/categories", {
      id: uid(), name: newCat.name, icon: newCat.icon,
      color: newCat.color, children: newCat.child ? [newCat.child] : [],
    });
    setCategories(prev => [...prev, c]);
    setNewCat({ name: "", icon: "📦", color: "#64748b", child: "" });
    setCatModal(false);
  };

  const deleteWallet = async (id) => {
    setWallets(prev => prev.filter(w => w.id !== id));
    await api.delete("/api/wallets", { id });
  };

  const clearAll = async () => {
    if (!window.confirm("Clear ALL transactions? This cannot be undone.")) return;
    setTransactions([]);
    await api.delete("/api/transactions", { all: true });
  };

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y=>y-1); } else setViewMonth(m=>m-1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y=>y+1); } else setViewMonth(m=>m+1); };

  // ─── Theme ──────────────────────────────────────────────────────────────────
  const theme = {
    "--bg":      dark ? "#0f1117" : "#f8fafc",
    "--card":    dark ? "#1a1d27" : "#ffffff",
    "--surface": dark ? "#242736" : "#f1f5f9",
    "--border":  dark ? "#2e3347" : "#e2e8f0",
    "--text":    dark ? "#e8eaf0" : "#0f172a",
    "--muted":   dark ? "#6b7280" : "#94a3b8",
    "--accent":  "#6366f1",
  };

  const TABS = [
    { id: "home",       icon: Home,     label: "Home"       },
    { id: "wallets",    icon: Wallet,   label: "Wallets"    },
    { id: "txs",        icon: List,     label: "History"    },
    { id: "favourites", icon: Heart,    label: "Favourites" },
    { id: "settings",   icon: Settings, label: "Settings"   },
  ];

  if (loading) return <LoadingScreen dark={dark} />;

  const txFormProps = {
    wallets, categories,
    onSave: saveTx,
    onUpdateCategory: updateCategoryChildren,
  };

  return (
    <div style={{ ...theme, fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <style>{`
        input[type=date]::-webkit-calendar-picker-indicator { filter: ${dark ? "invert(1)" : "none"}; }
      `}</style>

      {/* ── Layout shell: flex column, full height ── */}
      <div className="max-w-xl mx-auto flex flex-col" style={{ minHeight: "100dvh" }}>

        {/* ══ STICKY HEADER ══════════════════════════════════════════════════ */}
        <header
          className="flex-shrink-0 sticky top-0 z-30 border-b border-[var(--border)] px-4 py-3 flex items-center justify-between"
          style={{ background: "var(--bg)" }}
        >
          <div>
            <div className="text-sm text-[var(--muted)] font-medium">{MONTHS[viewMonth]} {viewYear}</div>
            <h1 className="text-2xl font-black text-[var(--text)] tracking-tight">SpendSmart</h1>
          </div>
          <button onClick={toggleDark}
            className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] transition">
            {dark ? <Sun size={18}/> : <Moon size={18}/>}
          </button>
        </header>

        {/* ══ SCROLLABLE CONTENT ════════════════════════════════════════════ */}
        <main className="flex-1 overflow-y-auto">

          {error && <ErrorBanner message={error} onRetry={loadAll} />}

          {/* ── HOME ── */}
          {tab === "home" && (
            <div className="px-4 pt-4 pb-6 flex flex-col gap-5">
              {/* Month nav */}
              <div className="flex items-center justify-between">
                <button onClick={prevMonth} className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)] transition">
                  <ChevronLeft size={18} className="text-[var(--muted)]" />
                </button>
                <span className="text-base font-bold text-[var(--text)]">{MONTHS[viewMonth]} {viewYear}</span>
                <button onClick={nextMonth} className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)] transition">
                  <ChevronRight size={18} className="text-[var(--muted)]" />
                </button>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Income",  val: totalIncome,  icon: TrendingUp,   color: "#10b981" },
                  { label: "Expense", val: totalExpense, icon: TrendingDown, color: "#ef4444" },
                  { label: "Net",     val: netBalance,   icon: PiggyBank,    color: "#6366f1" },
                ].map(({ label, val, icon: Icon, color }) => (
                  <div key={label} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-3 flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <Icon size={14} style={{ color }} />
                      <span className="text-xs font-semibold text-[var(--muted)]">{label}</span>
                    </div>
                    <span className="text-sm font-black leading-tight"
                      style={{ color: label === "Net" ? (val >= 0 ? "#10b981" : "#ef4444") : color }}>
                      {formatSGD(val)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Wallets */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Wallets</span>
                  <button onClick={() => setSelectedWallet(null)} className="text-sm text-[var(--accent)] font-semibold">All</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {wallets.map(w => (
                    <WalletCard key={w.id} wallet={w} txs={transactions}
                      selected={selectedWallet === w.id}
                      onClick={() => setSelectedWallet(selectedWallet === w.id ? null : w.id)} />
                  ))}
                </div>
              </div>

              {/* Spending breakdown */}
              {catSpend.length > 0 && (
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
                  <div className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">Spending Breakdown</div>
                  <div className="flex flex-col gap-3">
                    {catSpend.slice(0,5).map(({ id, total, cat }) => {
                      const pct = totalExpense > 0 ? (total / totalExpense) * 100 : 0;
                      return (
                        <div key={id}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium text-[var(--text)] flex items-center gap-1.5">
                              <span>{cat?.icon ?? "📦"}</span>{cat?.name ?? id}
                            </span>
                            <span className="text-sm font-bold text-[var(--text)]">{formatSGD(total)}</span>
                          </div>
                          <div className="h-2 bg-[var(--surface)] rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, backgroundColor: cat?.color ?? "#64748b" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent Transactions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Recent Transactions</span>
                  <button onClick={() => setTab("txs")} className="text-sm text-[var(--accent)] font-semibold">See all</button>
                </div>
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
                  {searchTxs.length === 0 ? (
                    <div className="py-10 text-center text-[var(--muted)] text-base">No transactions this month</div>
                  ) : (
                    searchTxs.slice(0,5).map((tx, i) => (
                      <div key={tx.id}>
                        {i > 0 && <div className="h-px bg-[var(--border)] mx-4" />}
                        <TxRow tx={tx} categories={categories} wallets={wallets}
                          onEdit={t => { setEditTx(t); setTxModal(true); }}
                          onDelete={deleteTx} onToggleFav={toggleFav} onUseFav={useFav} />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add Transaction — full-width CTA */}
              <button
                onClick={() => { setEditTx(null); setTxModal(true); }}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white text-lg font-bold shadow-lg hover:opacity-90 active:scale-[0.98] transition-all"
                style={{ backgroundColor: "var(--accent)" }}
              >
                <Plus size={22} /> Add Transaction
              </button>
            </div>
          )}

          {/* ── WALLETS ── */}
          {tab === "wallets" && (
            <div className="px-4 pt-4 pb-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-[var(--text)]">My Wallets</h2>
                <button onClick={() => setWalletModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-white text-base font-semibold">
                  <Plus size={16}/> New
                </button>
              </div>

              {wallets.map(w => {
                const wTxs = transactions.filter(t => t.walletId === w.id);
                const inc  = wTxs.filter(t => t.type === "income").reduce((s,t) => s + t.amount, 0);
                const exp  = wTxs.filter(t => t.type === "expense").reduce((s,t) => s + t.amount, 0);
                const bal  = (w.balance ?? 0) + inc - exp;

                const monthly = {};
                wTxs.forEach(t => {
                  const d   = new Date(t.date);
                  const key = `${d.getFullYear()}-${d.getMonth()}`;
                  if (!monthly[key]) monthly[key] = { year: d.getFullYear(), month: d.getMonth(), income: 0, expense: 0 };
                  if (t.type === "income") monthly[key].income += t.amount;
                  else monthly[key].expense += t.amount;
                });
                const months = Object.values(monthly)
                  .sort((a,b) => (b.year * 12 + b.month) - (a.year * 12 + a.month))
                  .slice(0, 6);

                return (
                  <div key={w.id} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
                    <div className="p-4 flex items-center justify-between" style={{ background: w.color + "18" }}>
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl" style={{ background: w.color + "33" }}>{w.icon}</div>
                        <div>
                          <div className="text-base font-bold text-[var(--text)]">{w.name}</div>
                          <div className="text-sm text-[var(--muted)]">{wTxs.length} transactions</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black" style={{ color: w.color }}>{formatSGD(bal)}</div>
                        <div className="text-sm text-[var(--muted)]">Balance</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-[var(--border)] border-b border-[var(--border)]">
                      <div className="p-3 text-center">
                        <div className="text-sm text-emerald-500 font-semibold">Income</div>
                        <div className="text-base font-bold text-emerald-500">+{formatSGD(inc)}</div>
                      </div>
                      <div className="p-3 text-center">
                        <div className="text-sm text-red-500 font-semibold">Expense</div>
                        <div className="text-base font-bold text-red-500">−{formatSGD(exp)}</div>
                      </div>
                    </div>

                    {months.length > 0 && (
                      <div className="p-4">
                        <div className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">Monthly Summary</div>
                        <div className="flex flex-col gap-1.5">
                          {months.map(m => (
                            <div key={`${m.year}-${m.month}`}
                              className="flex items-center justify-between py-2 px-3 rounded-xl bg-[var(--surface)] hover:bg-[var(--border)] transition cursor-pointer"
                              onClick={() => { setViewMonth(m.month); setViewYear(m.year); setSelectedWallet(w.id); setTab("txs"); }}>
                              <span className="text-base font-semibold text-[var(--text)]">{MONTHS[m.month]} {m.year}</span>
                              <div className="flex items-center gap-3 text-sm">
                                <span className="text-emerald-500 font-medium">+{formatSGD(m.income)}</span>
                                <span className="text-red-500 font-medium">−{formatSGD(m.expense)}</span>
                                <ChevronRight size={14} className="text-[var(--muted)]" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="px-4 pb-4 flex gap-2">
                      <button onClick={() => { setSelectedWallet(w.id); setEditTx(null); setTxModal(true); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-white text-base font-semibold"
                        style={{ backgroundColor: w.color }}>
                        <Plus size={15}/> Add Transaction
                      </button>
                      <button onClick={() => deleteWallet(w.id)}
                        className="px-4 py-3 rounded-xl border border-red-300 text-red-500 hover:bg-red-50 transition">
                        <Trash2 size={15}/>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── HISTORY ── */}
          {tab === "txs" && (
            <div className="px-4 pt-4 pb-6 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <button onClick={prevMonth} className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)]"><ChevronLeft size={17}/></button>
                <span className="flex-1 text-center text-base font-bold">{MONTHS[viewMonth]} {viewYear}</span>
                <button onClick={nextMonth} className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)]"><ChevronRight size={17}/></button>
              </div>

              <div className="relative">
                <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions…"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-base" />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                <button onClick={() => setSelectedWallet(null)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold flex-shrink-0 border transition ${!selectedWallet ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "bg-[var(--surface)] border-[var(--border)] text-[var(--muted)]"}`}>
                  All Wallets
                </button>
                {wallets.map(w => (
                  <button key={w.id} onClick={() => setSelectedWallet(w.id === selectedWallet ? null : w.id)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold flex-shrink-0 border transition ${selectedWallet === w.id ? "text-white border-transparent" : "bg-[var(--surface)] border-[var(--border)] text-[var(--muted)]"}`}
                    style={selectedWallet === w.id ? { backgroundColor: w.color } : {}}>
                    {w.icon} {w.name}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5 text-center">
                  <div className="text-sm text-emerald-500 font-semibold">Income</div>
                  <div className="text-base font-black text-emerald-500">+{formatSGD(totalIncome)}</div>
                </div>
                <div className="flex-1 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 text-center">
                  <div className="text-sm text-red-500 font-semibold">Expense</div>
                  <div className="text-base font-black text-red-500">−{formatSGD(totalExpense)}</div>
                </div>
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
                {searchTxs.length === 0 ? (
                  <div className="py-12 text-center text-[var(--muted)] text-base flex flex-col items-center gap-2">
                    <AlertCircle size={36} className="text-[var(--border)]" />
                    No transactions found
                  </div>
                ) : (
                  searchTxs.map((tx, i) => (
                    <div key={tx.id}>
                      {i > 0 && <div className="h-px bg-[var(--border)] mx-4" />}
                      <TxRow tx={tx} categories={categories} wallets={wallets}
                        onEdit={t => { setEditTx(t); setTxModal(true); }}
                        onDelete={deleteTx} onToggleFav={toggleFav} onUseFav={useFav} />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── FAVOURITES ── */}
          {tab === "favourites" && (
            <div className="px-4 pt-4 pb-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-[var(--text)]">Favourites</h2>
                <span className="text-sm text-[var(--muted)]">{favourites.length} saved</span>
              </div>
              <p className="text-base text-[var(--muted)]">
                Tap <Heart size={14} className="inline text-pink-500" fill="currentColor" /> on any transaction to save it here for quick reuse.
              </p>

              {favourites.length === 0 ? (
                <div className="py-16 flex flex-col items-center gap-3 text-[var(--muted)]">
                  <Heart size={44} className="text-[var(--border)]" />
                  <span className="text-base">No favourites yet</span>
                </div>
              ) : (
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
                  {favourites.map((tx, i) => (
                    <div key={tx.id}>
                      {i > 0 && <div className="h-px bg-[var(--border)] mx-4" />}
                      <div className="flex items-center gap-2 pr-2">
                        <div className="flex-1">
                          <TxRow tx={tx} categories={categories} wallets={wallets}
                            onEdit={t => { setEditTx(t); setTxModal(true); }}
                            onDelete={deleteTx} onToggleFav={toggleFav} />
                        </div>
                        <button onClick={() => useFav(tx)}
                          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold">
                          <Copy size={14}/> Use
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SETTINGS ── */}
          {tab === "settings" && (
            <div className="px-4 pt-4 pb-6 flex flex-col gap-4">
              <h2 className="text-xl font-black text-[var(--text)]">Settings</h2>

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-4">
                <div className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Appearance</div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium text-[var(--text)]">Dark Mode</span>
                  <button onClick={toggleDark}
                    className="rounded-full transition-colors relative flex-shrink-0"
                    style={{ width: 52, height: 28, backgroundColor: dark ? "var(--accent)" : "var(--border)" }}>
                    <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${dark ? "left-7" : "left-1"}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium text-[var(--text)]">Currency</span>
                  <span className="text-base font-semibold text-[var(--accent)] bg-[var(--surface)] px-3 py-1 rounded-lg border border-[var(--border)]">SGD $</span>
                </div>
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                  <div className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Categories ({categories.length})</div>
                  <button onClick={() => setCatModal(true)}
                    className="flex items-center gap-1 text-sm text-[var(--accent)] font-semibold"><Plus size={14}/> Add</button>
                </div>
                {categories.map((cat, i) => (
                  <div key={cat.id}>
                    {i > 0 && <div className="h-px bg-[var(--border)] mx-4" />}
                    <div className="px-4 py-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: cat.color + "22" }}>{cat.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-semibold text-[var(--text)]">{cat.name}</div>
                        <div className="text-sm text-[var(--muted)] truncate">{(cat.children ?? []).join(" · ")}</div>
                      </div>
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-3">
                <div className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Data</div>
                {[
                  { label: "Total Transactions", val: transactions.length, cls: "text-[var(--accent)]" },
                  { label: "Wallets",            val: wallets.length,      cls: "text-[var(--accent)]" },
                  { label: "Favourites",         val: favourites.length,   cls: "text-pink-500" },
                ].map(({ label, val, cls }) => (
                  <div key={label} className="text-base text-[var(--text)] flex items-center justify-between">
                    <span>{label}</span>
                    <span className={`font-bold ${cls}`}>{val}</span>
                  </div>
                ))}
                <button onClick={clearAll}
                  className="mt-1 text-sm text-red-500 border border-red-300 rounded-xl px-4 py-2.5 hover:bg-red-50 transition font-semibold">
                  Clear All Transactions
                </button>
              </div>
            </div>
          )}
        </main>

        {/* ══ STICKY FOOTER NAV ═════════════════════════════════════════════ */}
        <nav
          className="flex-shrink-0 sticky bottom-0 z-30 border-t border-[var(--border)] flex"
          style={{ background: "var(--card)" }}
        >
          {TABS.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-all ${tab === id ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}>
              <div className={`p-1.5 rounded-xl transition-all ${tab === id ? "bg-[var(--accent)]/15 scale-110" : ""}`}>
                <Icon size={20} />
              </div>
              <span className={`text-xs font-semibold ${tab === id ? "text-[var(--accent)]" : ""}`}>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* ── TRANSACTION MODAL ── */}
      <Modal open={txModal} onClose={() => { setTxModal(false); setEditTx(null); }}
        title={editTx ? "Edit Transaction" : "New Transaction"}>
        <TxForm {...txFormProps}
          onClose={() => { setTxModal(false); setEditTx(null); }}
          initial={editTx ?? (selectedWallet ? { walletId: selectedWallet } : null)} />
      </Modal>

      {/* ── ADD WALLET MODAL ── */}
      <Modal open={walletModal} onClose={() => setWalletModal(false)} title="New Wallet">
        <div className="flex flex-col gap-4">
          <Input label="Wallet Name" value={newWallet.name} onChange={e => setNewWallet(p=>({...p, name: e.target.value}))} placeholder="e.g. DBS Account" />
          <div className="flex gap-3">
            <Input label="Icon (emoji)" value={newWallet.icon} onChange={e => setNewWallet(p=>({...p, icon: e.target.value}))} placeholder="💳" />
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm font-semibold uppercase tracking-wider text-gray-500">Color</label>
              <input type="color" value={newWallet.color} onChange={e => setNewWallet(p=>({...p, color: e.target.value}))}
                className="w-full h-12 rounded-xl border border-gray-200 cursor-pointer" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setWalletModal(false)} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-500 text-base font-semibold">Cancel</button>
            <button onClick={addWallet} className="flex-1 py-3.5 rounded-xl bg-indigo-500 text-white text-base font-semibold hover:opacity-90 transition">Create</button>
          </div>
        </div>
      </Modal>

      {/* ── ADD CATEGORY MODAL ── */}
      <Modal open={catModal} onClose={() => setCatModal(false)} title="New Category">
        <div className="flex flex-col gap-4">
          <Input label="Category Name" value={newCat.name} onChange={e => setNewCat(p=>({...p, name: e.target.value}))} placeholder="e.g. Travel" />
          <div className="flex gap-3">
            <Input label="Icon (emoji)" value={newCat.icon} onChange={e => setNewCat(p=>({...p, icon: e.target.value}))} placeholder="✈️" />
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm font-semibold uppercase tracking-wider text-gray-500">Color</label>
              <input type="color" value={newCat.color} onChange={e => setNewCat(p=>({...p, color: e.target.value}))}
                className="w-full h-12 rounded-xl border border-gray-200 cursor-pointer" />
            </div>
          </div>
          <Input label="First Sub-Category (optional)" value={newCat.child} onChange={e => setNewCat(p=>({...p, child: e.target.value}))} placeholder="e.g. Flights" />
          <div className="flex gap-3 pt-2">
            <button onClick={() => setCatModal(false)} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-500 text-base font-semibold">Cancel</button>
            <button onClick={addCategory} className="flex-1 py-3.5 rounded-xl bg-indigo-500 text-white text-base font-semibold hover:opacity-90 transition">Create</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
