"use client";
import { Plus, Bell } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function TopHeader() {
  const { activeTab, setShowAddTransaction } = useAppStore();

  const titles: Record<string, string> = {
    home: "Spendmart",
    wallets: "Wallets",
    history: "History",
    favourites: "Favourites",
    settings: "Settings",
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 max-w-lg mx-auto"
      style={{
        height: "64px",
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--accent)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="white"/>
          </svg>
        </div>
        <h1 className="font-display font-bold text-lg" style={{ color: "var(--text)" }}>
          {titles[activeTab]}
        </h1>
      </div>
      {activeTab !== "settings" && (
        <button
          onClick={() => setShowAddTransaction(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-sm transition-all active:scale-95"
          style={{ background: "var(--accent)", color: "white" }}
        >
          <Plus size={15} strokeWidth={2.5} />
          Add
        </button>
      )}
    </header>
  );
}
