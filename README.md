# Spendmart 💰

A fully-featured, mobile-first expense tracker built with **Next.js 15**, **Tailwind CSS**, **Drizzle ORM**, and **Vercel Postgres (Neon)**.

---

## ✨ Features

- **5-Tab Navigation**: Home, Wallets, History, Favourites, Settings
- **Full Hierarchy**: User → Category → Sub-category → Transaction
- **Wallets**: Multiple wallets with per-wallet balance tracking and monthly breakdowns
- **Rich Transactions**: Income/expense, category, sub-category, wallet, date, notes, favourites
- **Spending Charts**: Bar chart breakdown by category
- **Favourites**: Heart-save any transaction and one-tap "Use Again"
- **Category Manager**: Full CRUD with color/icon picker; create sub-categories inline
- **Dark / Light Mode**: Persisted across sessions
- **Currency Switcher**: 10+ currencies supported
- **Mobile-First**: Sticky header/footer, bottom nav, swipe-friendly modals
- **PWA Ready**: Installable on mobile

---

## 🚀 Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial Spendmart commit"
gh repo create spendmart --public --push
```

### 2. Import into Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Vercel auto-detects Next.js — click **Deploy**

### 3. Add Vercel Postgres

1. In your Vercel project dashboard → **Storage** tab
2. Click **Create Database** → choose **Postgres (Neon)**
3. Name it `spendmart-db` → Create
4. Vercel automatically injects these env vars:
   - `POSTGRES_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`

### 4. Run Migrations

After deployment, open the Vercel **Functions** shell (or run locally with the prod env):

```bash
# Option A: Push schema directly (recommended for start)
npm run db:push

# Option B: Generate + run migration files
npm run db:generate
npm run db:migrate
```

### 5. Seed Demo Data

Hit the seed endpoint once after DB is ready:

```bash
curl -X POST https://your-app.vercel.app/api/seed
```

Or click **"Reload Demo Data"** in the app's Settings tab.

---

## 🛠 Local Development

```bash
# 1. Clone and install
git clone https://github.com/you/spendmart
cd spendmart
npm install

# 2. Set up env (copy from Vercel dashboard after adding Postgres)
cp .env.example .env.local
# Fill in POSTGRES_URL and POSTGRES_URL_NON_POOLING

# 3. Push DB schema
npm run db:push

# 4. Seed demo data
curl -X POST http://localhost:3000/api/seed

# 5. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🏗 Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── transactions/      # CRUD + balance management
│   │   ├── wallets/           # Wallet CRUD
│   │   ├── categories/        # Category CRUD
│   │   ├── subcategories/     # Sub-category creation
│   │   ├── stats/             # Aggregated stats for charts
│   │   ├── user/              # User preferences
│   │   └── seed/              # Demo data seeder
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/
│   │   ├── TopHeader.tsx      # Sticky top bar + Add button
│   │   └── BottomNav.tsx      # 5-tab bottom navigation
│   ├── modals/
│   │   └── AddTransactionModal.tsx
│   ├── tabs/
│   │   ├── HomeTab.tsx        # Summary cards, chart, recent tx
│   │   ├── WalletsTab.tsx     # Wallet cards with monthly breakdown
│   │   ├── HistoryTab.tsx     # Searchable, filterable history
│   │   ├── FavouritesTab.tsx  # Starred transactions + quick use
│   │   └── SettingsTab.tsx    # Theme, currency, category manager
│   ├── ui/
│   │   └── TransactionRow.tsx # Row with hover menu + fav toggle
│   └── SpendmartApp.tsx       # Root app shell
├── hooks/
│   └── useData.ts             # API hooks: wallets, categories, tx, stats
└── lib/
    ├── db/
    │   ├── schema.ts          # Drizzle schema (users, wallets, categories, tx)
    │   ├── index.ts           # Neon DB client
    │   ├── seed.ts            # Demo data seeder
    │   └── migrations/        # SQL migration files
    ├── store.ts               # Zustand global state
    └── utils.ts               # Formatting, constants
```

---

## 🗄 Database Schema

```
users
  └── wallets        (per-user, tracks balance)
  └── categories     (income | expense, color, icon)
       └── sub_categories
  └── transactions   (links wallet + category + sub-category)
```

---

## 📦 Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS + CSS Variables |
| UI Icons | Lucide React |
| Charts | Recharts |
| State | Zustand (persisted) |
| ORM | Drizzle ORM |
| Database | Vercel Postgres (Neon serverless) |
| Fonts | Syne (display) + DM Sans (body) |
| Deployment | Vercel |

---

## 📱 PWA Installation

On mobile browsers, tap **Share → Add to Home Screen** to install Spendmart as a native-like app.

---

*Made with ❤️ — track smarter, spend wiser.*
