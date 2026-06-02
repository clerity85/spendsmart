import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spendmart — Smart Expense Tracker",
  description: "Track your expenses, manage wallets, and take control of your finances with Spendmart.",
  manifest: "/manifest.json",
  themeColor: "#22c55e",
  appleWebApp: { capable: true, title: "Spendmart", statusBarStyle: "default" },
  viewport: { width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
