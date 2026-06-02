"use client";
import { useState, useRef } from "react";
import { Heart, MoreVertical, Edit2, RotateCcw, Trash2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import { useAppStore, type FullTransaction } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Props {
  transaction: FullTransaction;
  currency?: string;
  onToggleFavourite: (id: string, value: boolean) => void;
  onEdit: (t: FullTransaction) => void;
  onUseAgain: (t: FullTransaction) => void;
  onDelete: (id: string) => void;
}

function DynamicIcon({ name, ...props }: { name: string } & any) {
  const iconName = name.split('-').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join('');
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.Tag;
  return <Icon {...props} />;
}

export function TransactionRow({ transaction: t, currency = "USD", onToggleFavourite, onEdit, onUseAgain, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isIncome = t.type === "income";
  const amount = parseFloat(t.amount?.toString() || "0");

  return (
    <div
      className="relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group"
      style={{ background: hovered ? "var(--surface-2)" : "transparent" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); }}
    >
      {/* Category Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: t.category?.color + "22" }}
      >
        <DynamicIcon
          name={t.category?.icon || "tag"}
          size={18}
          style={{ color: t.category?.color }}
          strokeWidth={1.8}
        />
      </div>

      {/* Description + Category */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>{t.description}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs" style={{ color: "var(--text-3)" }}>{t.category?.name}</span>
          {t.subCategory && (
            <>
              <span style={{ color: "var(--text-3)" }} className="text-xs">·</span>
              <span className="text-xs" style={{ color: "var(--text-3)" }}>{t.subCategory.name}</span>
            </>
          )}
        </div>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{formatShortDate(t.date)} · {t.wallet?.name}</p>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0 mr-1">
        <p className={cn("text-sm font-bold", isIncome ? "text-income" : "text-expense")}>
          {isIncome ? "+" : "-"}{formatCurrency(amount, currency)}
        </p>
      </div>

      {/* Fav + More buttons - visible on hover/touch */}
      <div className={cn("flex items-center gap-1 transition-all", hovered || menuOpen ? "opacity-100" : "opacity-0 pointer-events-none md:group-hover:opacity-100")}>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavourite(t.id, !t.isFavourite); }}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90"
          style={{ background: t.isFavourite ? "#fee2e2" : "var(--surface-3)" }}
        >
          <Heart
            size={14}
            strokeWidth={2}
            style={{ color: t.isFavourite ? "#ef4444" : "var(--text-3)" }}
            fill={t.isFavourite ? "#ef4444" : "none"}
          />
        </button>
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90"
            style={{ background: "var(--surface-3)" }}
          >
            <MoreVertical size={14} style={{ color: "var(--text-2)" }} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div
                className="absolute right-0 top-9 z-50 rounded-xl overflow-hidden animate-scale-in"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-lg)",
                  width: "160px",
                }}
              >
                <button
                  onClick={() => { setMenuOpen(false); onEdit(t); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-all"
                  style={{ color: "var(--text)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onUseAgain(t); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-all"
                  style={{ color: "var(--text)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <RotateCcw size={14} /> Use Again
                </button>
                <div style={{ borderTop: "1px solid var(--border)" }} />
                <button
                  onClick={() => { setMenuOpen(false); onDelete(t.id); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-all"
                  style={{ color: "#ef4444" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fee2e2")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
