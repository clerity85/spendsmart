"use client";
import { Home, Wallet, History, Heart, Settings } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "home", icon: Home, label: "Home" },
  { id: "wallets", icon: Wallet, label: "Wallets" },
  { id: "history", icon: History, label: "History" },
  { id: "favourites", icon: Heart, label: "Saved" },
  { id: "settings", icon: Settings, label: "Settings" },
] as const;

export function BottomNav() {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 max-w-lg mx-auto"
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-center justify-around h-[64px]">
        {tabs.map(({ id, icon: Icon, label }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all",
                active ? "opacity-100" : "opacity-50 hover:opacity-70"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-xl transition-all",
                  active && "bg-[color:var(--accent-dim)]"
                )}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2.5 : 1.8}
                  style={{ color: active ? "var(--accent)" : "var(--text-2)" }}
                />
              </div>
              <span
                className={cn("text-[10px] font-medium transition-all", active ? "font-semibold" : "")}
                style={{ color: active ? "var(--accent)" : "var(--text-3)", fontFamily: "'DM Sans', sans-serif" }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
