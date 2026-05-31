# SpendSmart — Expense Tracker

A mobile-first personal expense tracker built with Next.js 14 (App Router) and Vercel Postgres.

---

## Deploy to Vercel (recommended)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
gh repo create spendsmart --public --push
```

### 2. Create a Vercel Postgres database
1. Go to [vercel.com/storage](https://vercel.com/storage) → **Create** → **Postgres**
2. Name it (e.g. `spendsmart-db`) and create it

### 3. Import & deploy on Vercel
1. Go to [vercel.com/new](https://vercel.com/new) → Import your repo
2. In **Storage**, click **Connect** and link the Postgres database you just created
3. Click **Deploy**

Vercel auto-injects the `POSTGRES_*` env vars from the linked database.  
On first page load, the app calls `/api/migrate` which runs `CREATE TABLE IF NOT EXISTS` and seeds default data — no manual step needed.

---

## Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Link to your Vercel project to pull env vars
```bash
npx vercel link
npx vercel env pull .env.local
```

Or manually create `.env.local` from `.env.local.example` with values from the Vercel Postgres dashboard.

### 3. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
spendsmart/
├── app/
│   ├── api/
│   │   ├── migrate/route.js        # GET — runs CREATE TABLE IF NOT EXISTS + seeds
│   │   ├── wallets/route.js        # GET / POST / DELETE
│   │   ├── categories/route.js     # GET / POST / PATCH
│   │   └── transactions/route.js   # GET / POST / DELETE
│   ├── globals.css
│   ├── layout.js
│   └── page.js                     # Renders client component
├── components/
│   └── ExpenseTracker.jsx          # Full client-side app; calls /api/migrate on load
├── lib/
│   └── db.js                       # Vercel Postgres queries + schema definitions
├── vercel.json                     # Framework + build config for Vercel
├── jsconfig.json
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## Database Schema

| Table          | Key columns                                                                        |
|----------------|------------------------------------------------------------------------------------|
| `wallets`      | id, name, icon, color, balance                                                     |
| `categories`   | id, name, icon, color, children (TEXT[])                                           |
| `transactions` | id, wallet_id, type, amount, category_id, sub_category, note, date, favourite     |

All foreign keys cascade on delete. Schema is idempotent (`CREATE TABLE IF NOT EXISTS`).
