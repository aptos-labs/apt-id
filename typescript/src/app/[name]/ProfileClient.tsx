"use client";

import { useEffect, useState } from "react";
import PublicProfile from "../../components/PublicProfile";
import { Profile } from "@/types";
import { fetchBioAndLinks } from "@/app/api/util.ts";
import { splitProfileLinks } from "@/lib/primarySocials.ts";

export default function ProfileClient({ profile: initialProfile }: { profile: Profile }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile>(initialProfile);

  useEffect(() => {
    let cancelled = false;

    const fetchLatestProfile = async () => {
      try {
        const [bio, links] = await fetchBioAndLinks(initialProfile.owner);

        if (cancelled || !bio) {
          return;
        }

        const { regularLinks, primarySocials } = splitProfileLinks(Array.isArray(links) ? links : []);
        setProfile({
          ...initialProfile,
          name: bio.name,
          profilePicture: bio.avatar_url || "", // TODO: Make a default
          description: bio.bio,
          title: bio.name,
          links: regularLinks,
          primarySocials,
        });
      } catch (error) {
        console.error("Error fetching latest profile:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchLatestProfile();
    return () => {
      cancelled = true;
    };
  }, [initialProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#D8B4FE] to-[#818CF8] flex items-center justify-center">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  return <PublicProfile profile={profile} />;
}
