'use client';

import { useEffect, useState } from 'react';
import PublicProfile from '../../components/PublicProfile';
import { Profile } from '@/types';

export default function ProfileClient({ profile }: { profile: Profile }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Any client-side initialization can go here
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#D8B4FE] to-[#818CF8] flex items-center justify-center">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  return <PublicProfile profile={profile} />;
} 