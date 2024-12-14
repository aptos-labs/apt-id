"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { TopBar } from "../components/TopBar";
import { useAptosName } from "../hooks/useAptosName";
import { ProfileEditor } from "../components/ProfileEditor";

export default function Home() {
  const { connected } = useWallet();
  const router = useRouter();
  const { ansName, loading } = useAptosName();

  const handleViewProfile = async () => {
    if (connected) {
      if (loading) {
        return;
      }
      if (ansName) {
        router.push(`/${ansName}`);
      } else {
        console.log("No ANS name found for this wallet");
      }
    }
  };

  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-gradient-to-b from-[#D8B4FE] to-[#818CF8] flex items-center justify-center pt-16">
        <div className="w-full max-w-[680px] mx-auto px-4">
          {!connected ? (
            <div className="flex flex-col items-center gap-6">
              <h1 className="text-3xl font-bold text-white">Aptos Profile</h1>
              <div className="flex flex-col items-center gap-4">
                <p className="text-white/80 text-center">
                  Connect your wallet to create your profile
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <h1 className="text-3xl font-bold text-white text-center">Edit Your Profile</h1>
              <ProfileEditor onViewProfile={handleViewProfile} loading={loading} />
            </div>
          )}
        </div>
      </main>
    </>
  );
}

