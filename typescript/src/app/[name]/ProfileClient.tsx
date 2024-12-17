'use client';

import { useEffect, useState } from 'react';
import PublicProfile from '../../components/PublicProfile';
import { Profile } from '@/types';
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { CONTRACT_ADDRESS } from "@/constants.ts";

type ImageBio = { __variant__: "Image"; avatar_url: string; bio: string; name: string };
type NFTBio = { __variant__: "NFT"; nft_url: { inner: string }; bio: string; name: string };
type LinkTree = {
  __variant__: "SM";
  links: {
    data: {
      key: string;
      value: {
        __variant__: "UnorderedLink";
        url: string;
      };
    }[];
  };
};

export default function ProfileClient({ profile: initialProfile }: { profile: Profile }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile>(initialProfile);

  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const client = new Aptos(new AptosConfig({ network: Network.DEVNET }));
        
        // Fetch latest bio
        const bioResult = await client.view<[{ vec: [ImageBio | NFTBio] }]>({
          payload: {
            function: `${CONTRACT_ADDRESS}::profile::view_bio`,
            functionArguments: [profile.owner],
          },
        });
        
        const bio = bioResult[0].vec[0];
        const bioData = bio.__variant__ === "Image" 
          ? { name: bio.name, bio: bio.bio, avatar_url: bio.avatar_url }
          : { name: bio.name, bio: bio.bio, avatar_url: bio.nft_url.inner };

        // Fetch latest links
        const linksResult = await client.view<[LinkTree]>({
          payload: {
            function: `${CONTRACT_ADDRESS}::profile::view_links`,
            functionArguments: [profile.owner],
          },
        });

        const links = linksResult[0]?.links?.data?.map((link) => ({
          id: link.key,
          title: link.key,
          url: link.value.url,
        })) ?? [];

        // Update profile with latest data
        setProfile({
          ...profile,
          name: bioData.name,
          profilePicture: bioData.avatar_url || "",
          description: bioData.bio,
          title: bioData.name,
          links: links,
        });

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