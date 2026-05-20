import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeAssist",
  description:
    "Step through algorithms line-by-line, watch state mutate, and drill your predictions."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
