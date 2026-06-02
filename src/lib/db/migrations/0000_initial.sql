-- Spendmart Initial Migration
-- Run via: npm run db:push or drizzle-kit migrate

CREATE TYPE "transaction_type" AS ENUM ('income', 'expense');

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL DEFAULT 'User',
  "email" text UNIQUE,
  "currency" text NOT NULL DEFAULT 'USD',
  "theme" text NOT NULL DEFAULT 'light',
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "wallets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "icon" text NOT NULL DEFAULT 'wallet',
  "color" text NOT NULL DEFAULT '#22c55e',
  "balance" numeric(15, 2) NOT NULL DEFAULT '0',
  "is_default" boolean NOT NULL DEFAULT false,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "icon" text NOT NULL DEFAULT 'tag',
  "color" text NOT NULL DEFAULT '#22c55e',
  "type" "transaction_type" NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "sub_categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "category_id" uuid NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "transactions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "wallet_id" uuid NOT NULL REFERENCES "wallets"("id") ON DELETE CASCADE,
  "category_id" uuid NOT NULL REFERENCES "categories"("id"),
  "sub_category_id" uuid REFERENCES "sub_categories"("id"),
  "type" "transaction_type" NOT NULL,
  "amount" numeric(15, 2) NOT NULL,
  "description" text NOT NULL,
  "notes" text,
  "date" timestamp NOT NULL,
  "is_favourite" boolean NOT NULL DEFAULT false,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
