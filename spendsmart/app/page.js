import ExpenseTracker from "@/components/ExpenseTracker";

// Migrations run via GET /api/migrate on first load from the client,
// or can be triggered manually at /api/migrate after deploy.
// Keeping this as a pure client render avoids DB calls at build time.
export default function Page() {
  return <ExpenseTracker />;
}
