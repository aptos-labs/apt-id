'use client';

import { WalletSelector } from "./WalletSelector";

export function TopBar() {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-[1200px] mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-white font-semibold">
          Aptos Profile
        </div>
        <WalletSelector />
      </div>
    </div>
  );
} 