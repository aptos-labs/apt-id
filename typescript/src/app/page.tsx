"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { connected } = useWallet();
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#D8B4FE] to-[#818CF8] flex items-center justify-center">
      <div className="w-full max-w-[680px] mx-auto px-4">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-2xl font-bold text-white">Aptos Linktree</h1>
          <button
            onClick={() => router.push("/greg.apt")}
            className="px-4 py-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
          >
            View Demo Profile
          </button>
        </div>
      </div>
    </main>
  );
}

