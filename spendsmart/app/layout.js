import "./globals.css";

export const metadata = {
  title: "SpendSmart",
  description: "Personal expense tracker",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
