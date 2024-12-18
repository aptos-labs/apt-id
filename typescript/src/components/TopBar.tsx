'use client';

import { WalletSelector } from "./WalletSelector";
import Link from "next/link";

export function TopBar() {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-[1200px] mx-auto px-4 py-4 flex justify-between items-center">
        <Link 
          href="/" 
          className="text-white font-semibold hover:text-white/80 transition-colors"
        >
          Apt Id
        </Link>
        <WalletSelector />
      </div>
    </div>
  );
} 