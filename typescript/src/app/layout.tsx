import type { Metadata } from "next";
import { WalletProvider } from "../components/WalletProvider";
import "./globals.css";
import React from "react";

export const metadata: Metadata = {
  title: "Apt Id",
  description: "Your Profile into Aptos Identity",
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
