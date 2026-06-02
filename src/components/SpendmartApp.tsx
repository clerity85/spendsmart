"use client";
import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { HomeTab } from "./tabs/HomeTab";
import { WalletsTab } from "./tabs/WalletsTab";
import { HistoryTab } from "./tabs/HistoryTab";
import { FavouritesTab } from "./tabs/FavouritesTab";
import { SettingsTab } from "./tabs/SettingsTab";
import { BottomNav } from "./layout/BottomNav";
import { TopHeader } from "./layout/TopHeader";
import { AddTransactionModal } from "./modals/AddTransactionModal";
import { useWallets, useCategories } from "@/hooks/useData";

export function SpendmartApp() {
  const {
    activeTab, theme, showAddTransaction,
    setShowAddTransaction, setEditingTransaction, setPrefillTransaction,
  } = useAppStore();
  const { wallets, refetch: refetchWallets } = useWallets();
  const { categories, refetch: refetchCategories } = useCategories();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/user").then(r => r.json()).then(user => {
      if (!user || !user.id) {
        fetch("/api/seed", { method: "POST" }).then(() => {
          refetchWallets();
          refetchCategories();
        });
      }
    }).catch(() => {
      // DB not connected yet — still render app
    });
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme, mounted]);

  const handleCloseModal = useCallback(() => {
    setShowAddTransaction(false);
    setEditingTransaction(null);
    setPrefillTransaction(null);
  }, [setShowAddTransaction, setEditingTransaction, setPrefillTransaction]);

  const handleSuccess = useCallback(() => {
    refetchWallets();
    refetchCategories();
  }, [refetchWallets, refetchCategories]);

  if (!mounted) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "#22c55e" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="white"/>
          </svg>
        </div>
        <p className="font-display text-lg font-bold" style={{ color: "#22c55e" }}>Spendmart</p>
      </div>
    </div>
  );

  const tabContent: Record<string, React.ReactNode> = {
    home: <HomeTab wallets={wallets} categories={categories} onDataChange={refetchWallets} />,
    wallets: <WalletsTab wallets={wallets} onDataChange={refetchWallets} />,
    history: <HistoryTab wallets={wallets} categories={categories} onDataChange={refetchWallets} />,
    favourites: <FavouritesTab wallets={wallets} categories={categories} onDataChange={refetchWallets} />,
    settings: <SettingsTab categories={categories} onCategoryChange={refetchCategories} />,
  };

  return (
    <div
      className="flex flex-col min-h-screen max-w-lg mx-auto relative"
      style={{ background: "var(--bg)" }}
    >
      <TopHeader />
      <main
        className="flex-1 overflow-y-auto"
        style={{ paddingTop: "64px", paddingBottom: "80px" }}
      >
        {tabContent[activeTab]}
      </main>
      <BottomNav />
      {showAddTransaction && (
        <AddTransactionModal
          wallets={wallets}
          categories={categories}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
