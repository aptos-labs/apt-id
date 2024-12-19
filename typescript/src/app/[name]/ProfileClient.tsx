"use client";

import { useEffect, useState } from "react";
import PublicProfile from "../../components/PublicProfile";
import { Link, Profile } from "@/types";
import { CombinedBio, getBio, getLinks } from "@/app/api/util.ts";

export default function ProfileClient({ profile: initialProfile }: { profile: Profile }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile>(initialProfile);

  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const [bio, links]: [CombinedBio | undefined, Link[]] = await Promise.all<never>([
          getBio(profile.owner),
          getLinks(profile.owner),
        ]);

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

    fetchLatestProfile();
  }, [profile.owner, profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#D8B4FE] to-[#818CF8] flex items-center justify-center">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  return <PublicProfile profile={profile} />;
}
