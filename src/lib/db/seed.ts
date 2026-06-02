import { db } from ".";
import { users, wallets, categories, subCategories } from "./schema";

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function seedDatabase() {
  // Create demo user
  await db.insert(users).values({
    id: DEMO_USER_ID,
    name: "Alex Johnson",
    email: "alex@spendmart.app",
    currency: "USD",
    theme: "light",
  }).onConflictDoNothing();

  // Create wallets
  const walletData = [
    { id: "w1", userId: DEMO_USER_ID, name: "Main Account", icon: "landmark", color: "#22c55e", balance: "5240.50", isDefault: true },
    { id: "w2", userId: DEMO_USER_ID, name: "Savings", icon: "piggy-bank", color: "#3b82f6", balance: "12800.00", isDefault: false },
    { id: "w3", userId: DEMO_USER_ID, name: "Cash", icon: "banknotes", color: "#f59e0b", balance: "320.00", isDefault: false },
  ];

  for (const w of walletData) {
    await db.insert(wallets).values(w as any).onConflictDoNothing();
  }

  // Create categories
  const catData = [
    { id: "c1", userId: DEMO_USER_ID, name: "Food & Dining", icon: "utensils", color: "#ef4444", type: "expense" as const },
    { id: "c2", userId: DEMO_USER_ID, name: "Transport", icon: "car", color: "#3b82f6", type: "expense" as const },
    { id: "c3", userId: DEMO_USER_ID, name: "Shopping", icon: "shopping-bag", color: "#8b5cf6", type: "expense" as const },
    { id: "c4", userId: DEMO_USER_ID, name: "Entertainment", icon: "film", color: "#f59e0b", type: "expense" as const },
    { id: "c5", userId: DEMO_USER_ID, name: "Health", icon: "heart-pulse", color: "#ec4899", type: "expense" as const },
    { id: "c6", userId: DEMO_USER_ID, name: "Utilities", icon: "zap", color: "#06b6d4", type: "expense" as const },
    { id: "c7", userId: DEMO_USER_ID, name: "Salary", icon: "briefcase", color: "#22c55e", type: "income" as const },
    { id: "c8", userId: DEMO_USER_ID, name: "Freelance", icon: "laptop", color: "#10b981", type: "income" as const },
    { id: "c9", userId: DEMO_USER_ID, name: "Investment", icon: "trending-up", color: "#0ea5e9", type: "income" as const },
  ];

  for (const c of catData) {
    await db.insert(categories).values(c).onConflictDoNothing();
  }

  // Sub-categories
  const subCatData = [
    { id: "sc1", categoryId: "c1", userId: DEMO_USER_ID, name: "Groceries" },
    { id: "sc2", categoryId: "c1", userId: DEMO_USER_ID, name: "Restaurants" },
    { id: "sc3", categoryId: "c1", userId: DEMO_USER_ID, name: "Coffee" },
    { id: "sc4", categoryId: "c2", userId: DEMO_USER_ID, name: "Fuel" },
    { id: "sc5", categoryId: "c2", userId: DEMO_USER_ID, name: "Public Transit" },
    { id: "sc6", categoryId: "c3", userId: DEMO_USER_ID, name: "Clothing" },
    { id: "sc7", categoryId: "c3", userId: DEMO_USER_ID, name: "Electronics" },
  ];

  for (const sc of subCatData) {
    await db.insert(subCategories).values(sc).onConflictDoNothing();
  }

  console.log("✅ Database seeded successfully");
}
