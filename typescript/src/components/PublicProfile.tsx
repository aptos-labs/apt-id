import React, { useState } from "react";
import { Profile } from '@/types';
import { TopBar } from "./TopBar";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import * as Popover from '@radix-ui/react-popover';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';
import { ShareIcon, Share2Icon } from "lucide-react";

interface PublicProfileProps {
  profile: Profile;
}

export default function PublicProfile({ profile }: PublicProfileProps) {
  const [copied, setCopied] = useState(false);
  const [shareText, setShareText] = useState("Share profile");
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
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link: ', err);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${username}'s Apt ID Profile`,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareText("Copied!");
        setTimeout(() => setShareText("Share profile"), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-gradient-to-b from-[#D8B4FE] to-[#818CF8] flex items-center justify-center pt-16">
        <div className="w-full max-w-[680px] mx-auto px-4 py-8 min-h-screen flex flex-col justify-center sm:min-h-0 sm:py-12">
          {/* Profile Header */}
          <header className="flex flex-col items-center mb-8">
            {/* Profile Picture with Dialog */}
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <button className="relative w-[96px] h-[96px] mb-4 sm:w-[120px] sm:h-[120px] rounded-full overflow-hidden hover:opacity-90 transition-opacity">
                  <Image
                    src={profile.profilePicture || "/favicon.ico"}
                    alt={`${username}'s profile picture`}
                    width={120}
                    height={120}
                    className="rounded-full object-cover border-2 border-white shadow-lg w-full h-full"
                  />
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
               <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                <Dialog.Title>PFP</Dialog.Title>
                  <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-[90vw] max-h-[90vh]">
                    <div className="relative">
                      <Image
                      src={profile.profilePicture || "/favicon.ico"}
                      alt={`${username}'s profile picture`}
                      width={500}
                      height={500}
                      className="rounded-lg object-contain max-h-[90vh]"
                    />
                    <Dialog.Close asChild>
                      <button
                        className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                        aria-label="Close"
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 15 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03157 3.2184C3.80702 2.99385 3.44295 2.99385 3.2184 3.2184C2.99385 3.44295 2.99385 3.80702 3.2184 4.03157L6.68682 7.50005L3.2184 10.9685C2.99385 11.193 2.99385 11.5571 3.2184 11.7816C3.44295 12.0062 3.80702 12.0062 4.03157 11.7816L7.50005 8.31328L10.9685 11.7816C11.193 12.0062 11.5571 12.0062 11.7816 11.7816C12.0062 11.5571 12.0062 11.193 11.7816 10.9685L8.31328 7.50005L11.7816 4.03157Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </Dialog.Close>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>

            {/* Profile Info */}
            <div className="text-center w-full max-w-[400px] mx-auto">
              <h1 className="text-[20px] sm:text-[24px] font-semibold text-white mb-2">
                {username}
              </h1>
              <div className="flex items-center justify-center gap-4 mb-4">
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <a
                        href={`https://explorer.aptoslabs.com/account/${profile.owner}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-white/70 hover:text-white"
                      >
                        <Image
                          src="/favicon.ico"
                          alt="View in Explorer"
                          width={16}
                          height={16}
                        />
                      </a>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="rounded-md bg-white px-3 py-2 text-sm text-gray-700 shadow-md"
                        sideOffset={5}
                      >
                        View in Explorer
                        <Tooltip.Arrow className="fill-white" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>

                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <button
                        onClick={handleShare}
                        className="inline-flex items-center text-white/70 hover:text-white"
                      >
                        <Share2Icon className="w-4 h-4" />
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="rounded-md bg-white px-3 py-2 text-sm text-gray-700 shadow-md"
                        sideOffset={5}
                      >
                        {shareText}
                        <Tooltip.Arrow className="fill-white" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </div>
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
                        <ShareIcon className="w-4 h-4" />
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