'use client';

import { Profile } from '../../types';
import PublicProfile from '../../components/PublicProfile';

export default function ProfileClient({ profile }: { profile: Profile }) {
  return <PublicProfile profile={profile} />;
} 