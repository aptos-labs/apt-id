import type { Metadata } from "next";
import { WalletProvider } from "../components/WalletProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aptos Linktree",
  description: "Your Aptos Profile Links",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
