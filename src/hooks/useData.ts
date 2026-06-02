"use client";
import { useState, useEffect, useCallback } from "react";
import type { Wallet, Category, SubCategory } from "@/lib/db/schema";
import type { FullTransaction } from "@/lib/store";

export type CategoryWithSubs = Category & { subCategories: SubCategory[] };
export type Stats = { income: number; expense: number; net: number; transactionCount: number; byCategory: Array<{ name: string; color: string; icon: string; amount: number }> };

export function useWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/wallets");
      if (res.ok) setWallets(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const createWallet = async (data: Partial<Wallet>) => {
    const res = await fetch("/api/wallets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (res.ok) { await refetch(); return res.json(); }
  };

  const updateWallet = async (id: string, data: Partial<Wallet>) => {
    await fetch(`/api/wallets/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    await refetch();
  };

  const deleteWallet = async (id: string) => {
    await fetch(`/api/wallets/${id}`, { method: "DELETE" });
    await refetch();
  };

  return { wallets, loading, refetch, createWallet, updateWallet, deleteWallet };
}

export function useCategories() {
  const [categories, setCategories] = useState<CategoryWithSubs[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) setCategories(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const createCategory = async (data: any) => {
    const res = await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (res.ok) { await refetch(); return res.json(); }
  };

  const updateCategory = async (id: string, data: any) => {
    await fetch(`/api/categories/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    await refetch();
  };

  const deleteCategory = async (id: string) => {
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    await refetch();
  };

  const createSubCategory = async (data: { categoryId: string; name: string }) => {
    const res = await fetch("/api/subcategories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (res.ok) { await refetch(); return res.json(); }
  };

  return { categories, loading, refetch, createCategory, updateCategory, deleteCategory, createSubCategory };
}

export function useTransactions(params?: { walletId?: string; startDate?: string; endDate?: string; search?: string; limit?: number; favouritesOnly?: boolean }) {
  const [transactions, setTransactions] = useState<FullTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (params?.walletId) qs.set("walletId", params.walletId);
      if (params?.startDate) qs.set("startDate", params.startDate);
      if (params?.endDate) qs.set("endDate", params.endDate);
      if (params?.search) qs.set("search", params.search);
      if (params?.limit) qs.set("limit", params.limit.toString());
      const res = await fetch(`/api/transactions?${qs}`);
      if (res.ok) {
        let data = await res.json();
        if (params?.favouritesOnly) data = data.filter((t: FullTransaction) => t.isFavourite);
        setTransactions(data);
      }
    } finally { setLoading(false); }
  }, [JSON.stringify(params)]);

  useEffect(() => { refetch(); }, [refetch]);

  const createTransaction = async (data: any) => {
    const res = await fetch("/api/transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (res.ok) { await refetch(); return res.json(); }
  };

  const updateTransaction = async (id: string, data: any) => {
    const res = await fetch(`/api/transactions/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (res.ok) { await refetch(); return res.json(); }
  };

  const deleteTransaction = async (id: string) => {
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    await refetch();
  };

  return { transactions, loading, refetch, createTransaction, updateTransaction, deleteTransaction };
}

export function useStats(params?: { walletId?: string; startDate?: string; endDate?: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const qs = new URLSearchParams();
      if (params?.walletId) qs.set("walletId", params.walletId);
      if (params?.startDate) qs.set("startDate", params.startDate);
      if (params?.endDate) qs.set("endDate", params.endDate);
      const res = await fetch(`/api/stats?${qs}`);
      if (res.ok) setStats(await res.json());
    } finally { setLoading(false); }
  }, [JSON.stringify(params)]);

  useEffect(() => { refetch(); }, [refetch]);

  return { stats, loading, refetch };
}
