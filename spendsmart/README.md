# SpendSmart — Expense Tracker

A mobile-first personal expense tracker built with Next.js 14 (App Router) and Vercel Postgres.

---

## Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Create a Vercel Postgres database
1. Go to [vercel.com/storage](https://vercel.com/storage) → **Create** → **Postgres**
2. Name it (e.g. `spendsmart-db`) and create it
3. In the database dashboard click **`.env.local`** tab and copy all env vars

### 3. Add environment variables
Create a `.env.local` file in the project root and paste the copied vars. They look like:
```
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."
```

### 4. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).  
The app automatically runs migrations and seeds default data on first load.

---

## Deploying to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
gh repo create spendsmart --public --push
```

### 2. Import on Vercel
1. Go to [vercel.com/new](https://vercel.com/new) → Import your repo
2. In **Storage**, link the Postgres database you created earlier
3. Click **Deploy** — Vercel injects the `POSTGRES_*` env vars automatically

That's it. No manual migration step needed — the app runs `CREATE TABLE IF NOT EXISTS` on every cold start.

---

## Project Structure

```
spendsmart/
├── app/
│   ├── api/
│   │   ├── migrate/route.js        # GET /api/migrate — run migrations manually
│   │   ├── wallets/route.js        # GET / POST / DELETE
│   │   ├── categories/route.js     # GET / POST / PATCH
│   │   └── transactions/route.js   # GET / POST / DELETE
│   ├── globals.css
│   ├── layout.js
│   └── page.js                     # Server component — runs migrations, renders app
├── components/
│   └── ExpenseTracker.jsx          # Full client-side app
├── lib/
│   └── db.js                       # Vercel Postgres queries + schema
├── jsconfig.json
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## Database Schema

| Table          | Key columns                                                              |
|----------------|--------------------------------------------------------------------------|
| `wallets`      | id, name, icon, color, balance                                           |
| `categories`   | id, name, icon, color, children (TEXT[])                                 |
| `transactions` | id, wallet_id, type, amount, category_id, sub_category, note, date, favourite |

All foreign keys cascade on delete. The schema is idempotent (`CREATE TABLE IF NOT EXISTS`).
