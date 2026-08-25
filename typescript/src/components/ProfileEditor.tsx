'use client';

import { useState } from 'react';
import { Profile, ProfileLink } from '@/types';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Link as LinkIcon } from 'lucide-react';
import { CONTRACT_ADDRESS } from "@/constants.ts";
import Image from "next/image";
import { PrimarySocialIcon } from "./PrimarySocialIcon";
import {
  DISPLAY_NAME_MAX_LENGTH,
  formatAnsHandle,
  resolveNameToSave,
  stripAptSuffix,
} from "@/lib/displayName.ts";
import {
  SUPPORTED_PRIMARY_SOCIALS,
  buildPrimarySocialUpdates,
  extractPrimarySocialHandle,
  isPrimarySocialKey,
  splitProfileLinks,
  type PrimarySocialPlatform,
} from "@/lib/primarySocials.ts";

interface ProfileEditorProps {
  ansName: string;
  profile?: Profile;
  onViewProfile?: () => void;
  loading?: boolean;
}

function editorStateFromProfile(profile: Profile | undefined, ansName: string) {
  const split = splitProfileLinks(profile?.links || []);
  const urls = { ...split.primarySocials, ...(profile?.primarySocials || {}) };
  const handles: Record<string, string> = {};
  (Object.keys(SUPPORTED_PRIMARY_SOCIALS) as PrimarySocialPlatform[]).forEach((platform) => {
    handles[platform] = urls[platform] ? extractPrimarySocialHandle(platform, urls[platform]) : '';
  });
  Object.entries(urls).forEach(([platform, url]) => {
    if (!(platform in handles)) {
      handles[platform] = extractPrimarySocialHandle(platform, url);
    }
  });
  return {
    displayName: profile?.name?.trim() || stripAptSuffix(ansName),
    bio: profile?.description || '',
    avatar: profile?.profilePicture || '',
    links: split.regularLinks,
    handles,
  };
}

export function ProfileEditor({ ansName, profile, onViewProfile, loading = false }: ProfileEditorProps) {
  const { account, signAndSubmitTransaction } = useWallet();
  const initial = editorStateFromProfile(profile, ansName);
  const [displayName, setDisplayName] = useState<string>(initial.displayName);
  const [bio, setBio] = useState<string>(initial.bio);
  const [avatar, setAvatar] = useState<string>(initial.avatar);
  const [links, setLinks] = useState<ProfileLink[]>(initial.links);
  const [primarySocials, setPrimarySocials] = useState<Record<string, string>>(initial.handles);
  const [saving, setSaving] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [profileSnapshot, setProfileSnapshot] = useState(profile);

  if (profile !== profileSnapshot) {
    const next = editorStateFromProfile(profile, ansName);
    setProfileSnapshot(profile);
    setDisplayName(next.displayName);
    setBio(next.bio);
    setAvatar(next.avatar);
    setLinks(next.links);
    setPrimarySocials(next.handles);
  }

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
      const nameToSave = resolveNameToSave(displayName, ansName);
      const regularLinks = links.filter((link) => !isPrimarySocialKey(link.title) && !isPrimarySocialKey(link.id));
      const { toUpsert } = buildPrimarySocialUpdates(primarySocials);
      const names = [...regularLinks.map((link) => link.title), ...toUpsert.names];
      const urls = [...regularLinks.map((link) => link.url), ...toUpsert.urls];

      // create() updates an existing profile by replacing bio and the full LinkTree in one transaction
      await signAndSubmitTransaction({
        data: {
          function: `${CONTRACT_ADDRESS}::profile::create`,
          typeArguments: [],
          functionArguments: [
            nameToSave,           // name: String
            bio,                  // bio: String
            avatar,               // avatar_url: Option<String>
            undefined,            // avatar_nft: Option<Object<Token>> - always empty for now
            names,                // names: vector<String>
            urls,                 // links: vector<String>
          ],
        },
      });

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
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={stripAptSuffix(ansName) || "Display name"}
            maxLength={DISPLAY_NAME_MAX_LENGTH}
            aria-label="Display name"
            className="text-[20px] sm:text-[24px] font-semibold text-white bg-white/10
                     text-center w-full focus:outline-none focus:ring-1
                     focus:ring-white/20 rounded-lg px-4 py-2 mb-1
                     backdrop-blur-sm placeholder:text-white/40"
          />
          <p className="text-[13px] sm:text-[14px] text-white/60 mb-3">
            {formatAnsHandle(ansName)}
          </p>
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

      {/* Primary Socials */}
      <section className="space-y-3 mb-8 w-full max-w-[500px] mx-auto">
        <h2 className="text-white text-center text-[14px] sm:text-[16px] font-semibold">
          Primary socials
        </h2>
        <div className="space-y-3">
          {(Object.keys(SUPPORTED_PRIMARY_SOCIALS) as PrimarySocialPlatform[]).map((platform) => {
            const config = SUPPORTED_PRIMARY_SOCIALS[platform];
            return (
              <div key={platform} className="flex gap-2 items-center">
                <span
                  className="w-[52px] h-[52px] bg-white/90 rounded-[14px] shadow-md flex items-center justify-center text-black"
                  aria-hidden="true"
                >
                  <PrimarySocialIcon platform={platform} />
                </span>
                <input
                  type="text"
                  value={primarySocials[platform] ?? ''}
                  onChange={(e) => setPrimarySocials({ ...primarySocials, [platform]: e.target.value })}
                  placeholder={config.placeholder}
                  aria-label={config.name}
                  className="flex-1 px-4 py-[14px] sm:py-4 text-[14px] sm:text-[16px]
                           text-center bg-white/90 focus:bg-white
                           text-[#000000] rounded-[14px] transition-all
                           duration-200 backdrop-blur-sm shadow-md
                           focus:outline-none"
                />
              </div>
            );
          })}
        </div>
      </section>

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
