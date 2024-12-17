import React from 'react';
import { Profile } from '@/types';
import { TopBar } from "./TopBar";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useRouter } from 'next/navigation';
import Image from "next/image";

interface PublicProfileProps {
  profile: Profile;
}

export default function PublicProfile({ profile }: PublicProfileProps) {
  const { account } = useWallet();
  const router = useRouter();
  // Extract the username from ANS name (remove .apt)
  const username = profile.ansName.replace('.apt', '');
  
  // Check if the current user is the profile owner
  const isOwner = account?.address?.toString() === profile.owner;

  const handleEdit = () => {
    router.push('/');
  };

  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-gradient-to-b from-[#D8B4FE] to-[#818CF8] flex items-center justify-center pt-16">
        <div className="w-full max-w-[680px] mx-auto px-4 py-8 min-h-screen flex flex-col justify-center sm:min-h-0 sm:py-12">
          {/* Profile Header */}
          <header className="flex flex-col items-center mb-8">
            {/* Profile Picture */}
            <div className="relative w-[96px] h-[96px] mb-4 sm:w-[120px] sm:h-[120px]">
              <Image
                src={profile.profilePicture || '/default-avatar.png'}
                alt={`${username}'s profile picture`}
                width={120}
                height={120}
                className="rounded-full object-cover border-2 border-white shadow-lg w-full h-full"
              />
            </div>
            
            {/* Profile Info */}
            <div className="text-center w-full max-w-[400px] mx-auto">
              <h1 className="text-[20px] sm:text-[24px] font-semibold text-white mb-2">
                {username}
              </h1>
              <p className="text-[16px] sm:text-[18px] text-white/80 mb-8">
                {profile.description}
              </p>
            </div>
          </header>

          {/* Links Section */}
          <section className="space-y-3 mb-8 w-full max-w-[500px] mx-auto">
            {profile.links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block w-full"
              >
                <div className="px-4 py-[14px] sm:py-4 text-[14px] sm:text-[16px] font-semibold 
                              text-center bg-white/90 group-hover:bg-white 
                              text-[#000000] rounded-[14px] transition-all 
                              duration-200 backdrop-blur-sm shadow-md
                              group-hover:scale-[1.02]"
                >
                  {link.title}
                </div>
              </a>
            ))}
          </section>

          {/* Edit Button (only shown to profile owner) */}
          {isOwner && (
            <div className="w-full max-w-[500px] mx-auto mb-8">
              <button
                onClick={handleEdit}
                className="w-full px-4 py-[14px] sm:py-4 text-[14px] sm:text-[16px] font-semibold
                         text-center bg-white/30 hover:bg-white/40 
                         text-white rounded-[14px] transition-all 
                         duration-200 backdrop-blur-sm shadow-md
                         hover:scale-[1.02]"
              >
                Edit Profile
              </button>
            </div>
          )}

          {/* Footer */}
          <footer className="text-center mt-auto">
            <a
              href="https://aptoslabs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-[14px] sm:text-[16px] text-white/80 
                       hover:text-white transition-colors duration-200"
            >
              Made with Aptos Profile
            </a>
          </footer>
        </div>
      </main>
    </>
  );
} 