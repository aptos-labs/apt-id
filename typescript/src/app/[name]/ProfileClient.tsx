"use client";

import { useEffect, useState } from "react";
import PublicProfile from "../../components/PublicProfile";
import { Profile } from "@/types";
import { fetchBioAndLinks } from "@/app/api/util.ts";

export default function ProfileClient({ profile: initialProfile }: { profile: Profile }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile>(initialProfile);

  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const [bio, links] = await fetchBioAndLinks(profile.owner)

        if (bio) {
          // Update profile with latest data
          setProfile({
            ...profile,
            name: bio.name,
            profilePicture: bio.avatar_url || "", // TODO: Make a default
            description: bio.bio,
            title: bio.name,
            links: links,
          });
        }
      } catch (error) {
        console.error("Error fetching latest profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (loading) {
      fetchLatestProfile();
    } else {
      setLoading(false);
    }

  }, [profile.owner, profile, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#D8B4FE] to-[#818CF8] flex items-center justify-center">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  return <PublicProfile profile={profile} />;
}
