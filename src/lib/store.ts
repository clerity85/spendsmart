"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Transaction, Wallet, Category, SubCategory, User } from "./db/schema";

export type FullTransaction = Transaction & {
  wallet: Wallet;
  category: Category;
  subCategory?: SubCategory | null;
};

interface AppState {
  // User
  user: User | null;
  setUser: (user: User) => void;

  // Active Tab
  activeTab: "home" | "wallets" | "history" | "favourites" | "settings";
  setActiveTab: (tab: AppState["activeTab"]) => void;

  // Active Wallet Filter
  activeWalletId: string | null;
  setActiveWalletId: (id: string | null) => void;

  // History filters
  historySearch: string;
  setHistorySearch: (s: string) => void;
  historyWalletFilter: string | null;
  setHistoryWalletFilter: (id: string | null) => void;
  historyMonth: { year: number; month: number };
  setHistoryMonth: (m: { year: number; month: number }) => void;

  // Add Transaction Modal
  showAddTransaction: boolean;
  setShowAddTransaction: (v: boolean) => void;
  editingTransaction: FullTransaction | null;
  setEditingTransaction: (t: FullTransaction | null) => void;
  prefillTransaction: Partial<FullTransaction> | null;
  setPrefillTransaction: (t: Partial<FullTransaction> | null) => void;

  // Theme
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;

  // Currency
  currency: string;
  setCurrency: (c: string) => void;
}

const now = new Date();

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),

      activeTab: "home",
      setActiveTab: (tab) => set({ activeTab: tab }),

      activeWalletId: null,
      setActiveWalletId: (id) => set({ activeWalletId: id }),

      historySearch: "",
      setHistorySearch: (historySearch) => set({ historySearch }),
      historyWalletFilter: null,
      setHistoryWalletFilter: (id) => set({ historyWalletFilter: id }),
      historyMonth: { year: now.getFullYear(), month: now.getMonth() },
      setHistoryMonth: (m) => set({ historyMonth: m }),

      showAddTransaction: false,
      setShowAddTransaction: (v) => set({ showAddTransaction: v }),
      editingTransaction: null,
      setEditingTransaction: (t) => set({ editingTransaction: t }),
      prefillTransaction: null,
      setPrefillTransaction: (t) => set({ prefillTransaction: t }),

      theme: "light",
      setTheme: (theme) => set({ theme }),

      currency: "USD",
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: "spendmart-ui",
      partialize: (state) => ({
        theme: state.theme,
        currency: state.currency,
        activeWalletId: state.activeWalletId,
      }),
    }
  )
);
