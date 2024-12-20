'use client';

import { useState, useEffect } from 'react';
import { Profile, ProfileLink } from '@/types';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Link as LinkIcon } from 'lucide-react';
import {CONTRACT_ADDRESS} from "@/constants.ts";
import Image from "next/image"; // Add LinkIcon

interface ProfileEditorProps {
  profile?: Profile;
  onViewProfile?: () => void;
  loading?: boolean;
}

export function ProfileEditor({ profile, onViewProfile, loading = false }: ProfileEditorProps) {
  const { account, signAndSubmitTransaction } = useWallet();
  const [bio, setBio] = useState<string>('');
  const [avatar, setAvatar] = useState<string>('');
  const [links, setLinks] = useState<ProfileLink[]>([]);
  const [saving, setSaving] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  // Initialize state with profile data when it becomes available
  useEffect(() => {
    console.log('Profile data received:', profile);
    if (profile) {
      setBio(profile.description || '');
      setAvatar(profile.profilePicture || '');
      setLinks(profile.links || []);
    }
  }, [profile]);

  const handleAddLink = () => {
    const newLink: ProfileLink = {
      id: Date.now().toString(),
      title: '',
      url: ''
    };
    setLinks([...links, newLink]);
    setEditingLinkId(newLink.id);
  };

  const handleUpdateLink = (id: string, field: 'title' | 'url', value: string) => {
    setLinks(links.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ));
  };

  const handleDeleteLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
    setEditingLinkId(null);
  };

  const handleSave = async () => {
    if (!account?.address) return;
    setSaving(true);

    try {
      // Check if profile exists using view function
      const response = await fetch(`/api/profile/exists?address=${account.address}`);
      let profileExists = false;

      // TODO: Verify that the profile API is working, and remove this check or handle 404 properly elsewhere
      if (response.status !== 404) {
        profileExists = await response.json();
      }

      if (!profileExists) {
        // Create profile if it doesn't exist
        await signAndSubmitTransaction({
          data: {
            function: `${CONTRACT_ADDRESS}::profile::create`,
            typeArguments: [],
            functionArguments: [
              profile?.ansName,     // name: String
              bio,                  // bio: String
              avatar,               // avatar_url: Option<String>
              undefined,            // avatar_nft: Option<Object<Token>> - always empty for now
              links.map(link => link.title),  // names: vector<String>
              links.map(link => link.url),    // links: vector<String>
            ],
          },
        });
      } else {
        // Update existing profile
        await signAndSubmitTransaction({
          data: {
            function: `${CONTRACT_ADDRESS}::profile::set_bio`,
            typeArguments: [],
            functionArguments: [
              profile?.ansName,     // name: String
              bio,                  // bio: String
              avatar,               // avatar_url: Option<String>
              undefined             // avatar_nft: Option<Object<Token>> - always empty for now
            ],
          },
        });

        // Then save links
        if (links.length > 0) {
          const names = links.map(link => link.title);
          const urls = links.map(link => link.url);

          await signAndSubmitTransaction({
            data: {
              function: `${CONTRACT_ADDRESS}::profile::add_links`,
              typeArguments: [],
              functionArguments: [
                names,     // names: vector<String>
                urls       // links: vector<String>
              ],
            },
          });
        }
      }

      console.log('Profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-[680px] mx-auto px-4 py-8 min-h-screen flex flex-col justify-center sm:min-h-0 sm:py-12">
      {/* Profile Header */}
      <header className="flex flex-col items-center mb-8 relative">
        {/* Profile Picture */}
        <div className="relative w-[96px] h-[96px] mb-4 sm:w-[120px] sm:h-[120px] group">
          <Image
            src={avatar || '/favicon.ico'}
            alt="Profile picture"
            width={120}
            height={120}
            className="rounded-full object-cover border-2 border-white shadow-lg w-full h-full"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="Avatar URL"
              className="w-3/4 px-2 py-1 text-sm bg-white/90 rounded"
            />
          </div>
        </div>
        
        {/* Profile Info */}
        <div className="text-center w-full max-w-[400px] mx-auto">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write something about yourself..."
            className="text-[16px] sm:text-[18px] text-white bg-white/10 
                     text-center w-full focus:outline-none focus:ring-1 
                     focus:ring-white/20 rounded-lg px-4 py-3 resize-none
                     min-h-[120px] backdrop-blur-sm placeholder:text-white/40"
            rows={4}
          />
        </div>
      </header>

      {/* Links Section */}
      <section className="space-y-3 mb-8 w-full max-w-[500px] mx-auto">
        <div className="space-y-4">
          {links.map((link) => (
            <div key={link.id} className="group">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) => handleUpdateLink(link.id, 'title', e.target.value)}
                    placeholder="Link Title"
                    className="flex-1 px-4 py-[14px] sm:py-4 text-[14px] sm:text-[16px] font-semibold 
                             text-center bg-white/90 group-hover:bg-white 
                             text-[#000000] rounded-[14px] transition-all 
                             duration-200 backdrop-blur-sm shadow-md
                             focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (editingLinkId === link.id) {
                        setEditingLinkId(null);
                      } else {
                        setEditingLinkId(link.id);
                      }
                    }}
                    className={`w-[52px] px-4 py-[14px] ${
                      editingLinkId === link.id 
                        ? 'bg-white text-black' 
                        : 'bg-white/90 hover:bg-white text-black'
                    } rounded-[14px] transition-all shadow-md flex items-center justify-center`}
                  >
                    <LinkIcon size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteLink(link.id)}
                    className="w-[52px] px-4 py-[14px] bg-red-500/90 hover:bg-red-500 text-white rounded-[14px] 
                             transition-all shadow-md flex items-center justify-center text-xl font-bold"
                  >
                    ×
                  </button>
                </div>
                {editingLinkId === link.id && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => handleUpdateLink(link.id, 'url', e.target.value)}
                      placeholder="Enter URL"
                      className="flex-1 px-4 py-[14px] sm:py-4 text-[14px] sm:text-[16px] 
                               text-center bg-white/90 focus:bg-white 
                               text-[#000000] rounded-[14px] transition-all 
                               duration-200 backdrop-blur-sm shadow-md
                               focus:outline-none"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 w-full max-w-[500px] mx-auto mt-8">
          <div className="flex gap-2">
            <button
              onClick={handleAddLink}
              className="flex-1 px-4 py-[14px] sm:py-4 text-[14px] sm:text-[16px] font-semibold 
                       text-center bg-white/30 hover:bg-white/40
                       text-white rounded-[14px] transition-all 
                       duration-200 backdrop-blur-sm shadow-md
                       hover:scale-[1.02]"
            >
              Add Link
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-[14px] sm:py-4 text-[14px] sm:text-[16px] font-semibold
                       text-center bg-white/90 hover:bg-white rounded-[14px] transition-all
                       text-black shadow-md hover:scale-[1.02]
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          <button
            onClick={onViewProfile}
            disabled={loading}
            className="w-full px-4 py-[14px] sm:py-4 text-[14px] sm:text-[16px] font-semibold
                     text-center bg-white/90 hover:bg-white rounded-[14px] transition-all
                     text-black shadow-md hover:scale-[1.02]
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "View Your Public Profile"}
          </button>
        </div>
      </section>
    </div>
  );
} 