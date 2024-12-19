import React, { useState } from "react";
import { Profile } from '@/types';
import { TopBar } from "./TopBar";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import * as Popover from '@radix-ui/react-popover';

interface PublicProfileProps {
  profile: Profile;
}

export default function PublicProfile({ profile }: PublicProfileProps) {
  const [copied, setCopied] = useState(false);
  const { account } = useWallet();
  const router = useRouter();
  // Extract the username from ANS name (remove .apt)
  const username = profile.ansName?.replace('.apt', '') ?? "N/A";
  
  // Check if the current user is the profile owner
  const isOwner = account?.address?.toString() === profile.owner;

  const handleEdit = () => {
    router.push('/');
  };

  const handleCopy = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch (err) {
      console.error('Failed to copy link: ', err);
    }
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
                src={profile.profilePicture || "/favicon.ico"}
                alt={`${username}'s profile picture`}
                width={120}
                height={120}
                className="rounded-full object-cover border-2 border-white shadow-lg w-full h-full"
              />
            </div>

            {/* Profile Info */}
            <div className="text-center w-full max-w-[400px] mx-auto">
              <h1 className="text-[20px] sm:text-[24px] font-semibold text-white mb-2">{username} {}</h1>
              <p className="text-[16px] sm:text-[18px] text-white/80 mb-8">{profile.description}</p>
            </div>
          </header>

          {/* Links Section */}
          <section className="space-y-3 mb-8 w-full max-w-[500px] mx-auto">
            {profile.links.map((link) => (
              <div key={link.id} className="relative group flex items-center gap-2">
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="block w-full">
                  <div
                    className="px-4 py-[14px] sm:py-4 text-[14px] sm:text-[16px] font-semibold
                              text-center bg-white/90 group-hover:bg-white 
                              text-[#000000] rounded-[14px] transition-all 
                              duration-200 backdrop-blur-sm shadow-md
                              group-hover:scale-[1.02]"
                  >
                    {link.title}
                  </div>
                </a>
                <Popover.Root>
                  <Popover.Trigger asChild>
                    <button
                      className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity
                               bg-white/90 p-2 rounded-full hover:bg-white"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.5 5.5C4.32843 5.5 5 4.82843 5 4C5 3.17157 4.32843 2.5 3.5 2.5C2.67157 2.5 2 3.17157 2 4C2 4.82843 2.67157 5.5 3.5 5.5ZM7.5 5.5C8.32843 5.5 9 4.82843 9 4C9 3.17157 8.32843 2.5 7.5 2.5C6.67157 2.5 6 3.17157 6 4C6 4.82843 6.67157 5.5 7.5 5.5ZM11.5 5.5C12.3284 5.5 13 4.82843 13 4C13 3.17157 12.3284 2.5 11.5 2.5C10.6716 2.5 10 3.17157 10 4C10 4.82843 10.6716 5.5 11.5 5.5Z"
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content
                      className="rounded-lg p-2 bg-white shadow-lg"
                      sideOffset={5}
                    >
                      <button
                        onClick={() => handleCopy(link.url)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md w-full"
                      >
                        {copied ? 'Copied!' : 'Copy link'}
                      </button>
                      <Popover.Arrow className="fill-white" />
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
              </div>
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
              href="https://aptid.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-[14px] sm:text-[16px] text-white/80 
                       hover:text-white transition-colors duration-200"
            >
              Made with Apt Id
            </a>
          </footer>
        </div>
      </main>
    </>
  );
} 