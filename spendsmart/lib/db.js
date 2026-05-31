import { sql } from "@vercel/postgres";

// ─── Schema Migrations ───────────────────────────────────────────────────────
// Run once on first deploy (or via a /api/migrate endpoint).
export async function runMigrations() {
  await sql`
    CREATE TABLE IF NOT EXISTS wallets (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      icon        TEXT NOT NULL DEFAULT '💳',
      color       TEXT NOT NULL DEFAULT '#6366f1',
      balance     NUMERIC NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      icon        TEXT NOT NULL DEFAULT '📦',
      color       TEXT NOT NULL DEFAULT '#64748b',
      children    TEXT[] NOT NULL DEFAULT '{}',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS transactions (
      id           TEXT PRIMARY KEY,
      wallet_id    TEXT NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
      type         TEXT NOT NULL CHECK (type IN ('income','expense')),
      amount       NUMERIC NOT NULL,
      category_id  TEXT NOT NULL,
      sub_category TEXT NOT NULL DEFAULT '',
      note         TEXT NOT NULL DEFAULT '',
      date         DATE NOT NULL,
      favourite    BOOLEAN NOT NULL DEFAULT FALSE,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // Seed default wallets if empty
  const { rowCount: wCount } = await sql`SELECT 1 FROM wallets LIMIT 1`;
  if (wCount === 0) {
    await sql`
      INSERT INTO wallets (id, name, icon, color, balance) VALUES
        ('main', 'Main Wallet', '💳', '#6366f1', 0),
        ('cash', 'Cash',        '💵', '#22c55e', 0)
      ON CONFLICT DO NOTHING;
    `;
  }

  // Seed default categories if empty
  const { rowCount: cCount } = await sql`SELECT 1 FROM categories LIMIT 1`;
  if (cCount === 0) {
    const defaults = [
      { id: "food",      name: "Food & Drink",     icon: "🍔", color: "#f97316", children: ["Restaurants","Groceries","Cafe","Takeaway"] },
      { id: "transport", name: "Transport",         icon: "🚌", color: "#3b82f6", children: ["MRT/Bus","Taxi/Grab","Parking","Petrol"] },
      { id: "shopping",  name: "Shopping",          icon: "🛍️", color: "#a855f7", children: ["Clothing","Electronics","Home","Online"] },
      { id: "bills",     name: "Bills & Utilities", icon: "💡", color: "#eab308", children: ["Electricity","Water","Internet","Phone"] },
      { id: "health",    name: "Health",             icon: "💊", color: "#22c55e", children: ["Gym","Doctor","Pharmacy","Wellness"] },
      { id: "entertain", name: "Entertainment",      icon: "🎬", color: "#ec4899", children: ["Movies","Games","Streaming","Events"] },
      { id: "income",    name: "Income",             icon: "💰", color: "#10b981", children: ["Salary","Freelance","Investment","Others"] },
      { id: "others",    name: "Others",             icon: "📦", color: "#64748b", children: ["Misc","Gifts","Donations","Other"] },
    ];
    for (const c of defaults) {
      await sql`
        INSERT INTO categories (id, name, icon, color, children)
        VALUES (${c.id}, ${c.name}, ${c.icon}, ${c.color}, ${c.children})
        ON CONFLICT DO NOTHING;
      `;
    }
  }
}

// ─── Wallets ─────────────────────────────────────────────────────────────────
export async function getWallets() {
  const { rows } = await sql`SELECT * FROM wallets ORDER BY created_at`;
  return rows;
}

export async function createWallet({ id, name, icon, color }) {
  const { rows } = await sql`
    INSERT INTO wallets (id, name, icon, color, balance)
    VALUES (${id}, ${name}, ${icon}, ${color}, 0)
    RETURNING *;
  `;
  return rows[0];
}

export async function deleteWallet(id) {
  await sql`DELETE FROM wallets WHERE id = ${id}`;
}

// ─── Categories ──────────────────────────────────────────────────────────────
export async function getCategories() {
  const { rows } = await sql`SELECT * FROM categories ORDER BY created_at`;
  return rows.map(r => ({ ...r, children: r.children ?? [] }));
}

export async function createCategory({ id, name, icon, color, children }) {
  const { rows } = await sql`
    INSERT INTO categories (id, name, icon, color, children)
    VALUES (${id}, ${name}, ${icon}, ${color}, ${children})
    RETURNING *;
  `;
  return rows[0];
}

export async function updateCategoryChildren(id, children) {
  await sql`UPDATE categories SET children = ${children} WHERE id = ${id}`;
}

// ─── Transactions ─────────────────────────────────────────────────────────────
export async function getTransactions() {
  const { rows } = await sql`
    SELECT * FROM transactions ORDER BY date DESC, created_at DESC
  `;
  return rows.map(dbRowToTx);
}

export async function upsertTransaction(tx) {
  const { rows } = await sql`
    INSERT INTO transactions
      (id, wallet_id, type, amount, category_id, sub_category, note, date, favourite)
    VALUES
      (${tx.id}, ${tx.walletId}, ${tx.type}, ${tx.amount},
       ${tx.categoryId}, ${tx.subCategory ?? ""}, ${tx.note ?? ""},
       ${tx.date}, ${tx.favourite ?? false})
    ON CONFLICT (id) DO UPDATE SET
      wallet_id    = EXCLUDED.wallet_id,
      type         = EXCLUDED.type,
      amount       = EXCLUDED.amount,
      category_id  = EXCLUDED.category_id,
      sub_category = EXCLUDED.sub_category,
      note         = EXCLUDED.note,
      date         = EXCLUDED.date,
      favourite    = EXCLUDED.favourite
    RETURNING *;
  `;
  return dbRowToTx(rows[0]);
}

export async function deleteTransaction(id) {
  await sql`DELETE FROM transactions WHERE id = ${id}`;
}

export async function deleteAllTransactions() {
  await sql`DELETE FROM transactions`;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function dbRowToTx(row) {
  return {
    id:          row.id,
    walletId:    row.wallet_id,
    type:        row.type,
    amount:      parseFloat(row.amount),
    categoryId:  row.category_id,
    subCategory: row.sub_category,
    note:        row.note,
    date:        typeof row.date === "string" ? row.date.split("T")[0] : row.date?.toISOString().split("T")[0],
    favourite:   row.favourite,
  };
}
