import { MOCK_PROFILES } from '../../utils/mockData';
import ProfileClient from './ProfileClient';

// This is a server component
export function generateStaticParams() {
  return Object.keys(MOCK_PROFILES).map((name) => ({
    name: name,
  }));
}

export default function ProfilePage({
  params
}: {
  params: { name: string }
}) {
  const profile = MOCK_PROFILES[params.name];

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#D8B4FE] to-[#818CF8] flex items-center justify-center">
        <div className="text-xl text-white">Profile not found</div>
      </div>
    );
  }

  return <ProfileClient profile={profile} />;
} 