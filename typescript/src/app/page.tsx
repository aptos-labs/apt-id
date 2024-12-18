"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { TopBar } from "../components/TopBar";
import { useAptosName } from "../hooks/useAptosName";
import { ProfileEditor } from "../components/ProfileEditor";
import { useEffect, useState } from "react";
import { Profile } from "@/types";

export default function Home() {
  const { connected, account } = useWallet();
  const router = useRouter();
  const { ansName, loading: ansLoading } = useAptosName();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!account?.address) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching profile for address:', account.address.toString());
        
        // Fetch bio
        const bioResponse = await fetch(`/api/profile/bio?address=${account.address}`);
        const bio = await bioResponse.json();
        console.log('Fetched bio:', bio);

        // Fetch links
        const linksResponse = await fetch(`/api/profile/links?address=${account.address}`);
        const links = await linksResponse.json();
        console.log('Fetched links:', links);

        if (bio?.error) {
          console.log('Bio fetch error:', bio.error);
          setProfile(null);
          setLoading(false);
          return;
        }

        // Create profile object
        const profileData: Profile = {
          owner: account.address.toString(),
          ansName: ansName || account.address.toString(),
          name: bio?.name || "",
          profilePicture: bio?.avatar_url || "",
          description: bio?.bio || "",
          title: bio?.name || "",
          links: Array.isArray(links) ? links : []
        };

        console.log('Setting profile data:', profileData);
        setProfile(profileData);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    if (connected && account?.address) {
      fetchProfile().then(() => {});
    } else {
      setLoading(false);
    }
  }, [connected, account?.address, ansName]);

  const handleViewProfile = async () => {
    if (connected) {
      if (loading || ansLoading) {
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
              <h1 className="text-3xl font-bold text-white">Apt Id</h1>
              <div className="flex flex-col items-center gap-4">
                <p className="text-white/80 text-center">
                  Connect your wallet to create your profile
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <h1 className="text-3xl font-bold text-white text-center">Edit Your Profile</h1>
              {loading ? (
                <div className="text-white text-center">Loading profile...</div>
              ) : (
                <ProfileEditor 
                  profile={profile || undefined} 
                  onViewProfile={handleViewProfile} 
                  loading={ansLoading} 
                />
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

