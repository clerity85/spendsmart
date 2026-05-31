import { runMigrations } from "@/lib/db";
import ExpenseTracker from "@/components/ExpenseTracker";

// Run migrations on every cold start (idempotent — safe to call repeatedly)
export default async function Page() {
  try {
    await runMigrations();
  } catch (e) {
    console.error("Migration error:", e);
  }
  return <ExpenseTracker />;
}
