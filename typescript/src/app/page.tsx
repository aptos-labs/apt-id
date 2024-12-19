"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { TopBar } from "../components/TopBar";
import { useAptosName } from "../hooks/useAptosName";
import { ProfileEditor } from "../components/ProfileEditor";
import { useEffect, useState } from "react";
import { Profile } from "@/types";
import { fetchBioAndLinks } from "@/app/api/util.ts";
import Link from "next/link";

export default function Home() {
  const { connected, account } = useWallet();
  const router = useRouter();
  const { ansName, loading: ansLoading } = useAptosName();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!account?.address) {
        setLoaded(false);
        setLoading(false);
        return;
      }

      if (!loaded) {
        setLoading(true);
      }
      try {
        const [bio, links] = await fetchBioAndLinks(account.address);

        if (bio?.error || !bio) {
          console.log("Bio fetch error:", bio.error);
          setProfile(null);
          setLoading(false);
          return;
        }

        // Create profile object
        const profileData: Profile = {
          owner: account.address.toString(),
          ansName: ansName,
          name: bio.name || ansName!,
          profilePicture: bio.avatar_url || "",
          description: bio.bio || "",
          title: bio.name || "",
          links: Array.isArray(links) ? links : [],
        };

        setProfile(profileData);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setProfile(null);
      } finally {
        setLoaded(true);
        setLoading(false);
      }
    };
    if (connected && account?.address) {
      fetchProfile().then(() => {
      });
    } else {
      setLoaded(true);
      setLoading(false);
    }
  }, [connected, account?.address, ansName, loaded]);

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

  const handleLoading = () => {
    if (loading || ansLoading) {
      return <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-white text-center">Loading profile...</h1>;
      </div>;
    }

    if (ansName === null || ansName === undefined) {
      return (
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-bold text-white text-center">Get an Aptos Name</h1>
          <div className="text-white text-center">
            Profiles can only be created with ANS Names, please grab a Petra name or another name at{" "}
            <Link href={"https://aptosnames.com"}>Aptos Names</Link>
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-white text-center">Edit Your Profile</h1>
        <ProfileEditor profile={profile || undefined} onViewProfile={handleViewProfile}
                       loading={loading || ansLoading} />
      </div>
    );
  };

  return (
    <>
      <TopBar />
      <main
        className="min-h-screen bg-gradient-to-b from-[#D8B4FE] to-[#818CF8] flex items-center justify-center pt-16">
        <div className="w-full max-w-[680px] mx-auto px-4">
          {!connected ? (
            <div className="flex flex-col items-center gap-6">
              <h1 className="text-3xl font-bold text-white">Apt Id</h1>
              <div className="flex flex-col items-center gap-4">
                <p className="text-white/80 text-center">Connect your wallet to create your profile</p>
              </div>
            </div>
          ) : (
          handleLoading()
            )}
        </div>
      </main>
    </>
  );
}
