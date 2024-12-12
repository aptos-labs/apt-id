import {AccountAddress, Aptos, AptosConfig, NetworkToNetworkName } from "@aptos-labs/ts-sdk";
import ProfileClient from './ProfileClient';
import { Bio } from '@/types/profile';
import { MOCK_PROFILES } from '@/utils/mockData';

const CONTRACT_ADDRESS = "0x63049cd91619ebfdecdb7d02cfbe0804ee648f724082622196848f6a5c49687d";

async function getServerState() {
  const network = NetworkToNetworkName["devnet"];
  return {
    client: new Aptos(new AptosConfig({ network })),
    network,
  };
}

export async function generateStaticParams() {
  // TODO: This means pages have to generated ahead of time, rather than on-demand.  They should be on-demand.
  const userAddress = "0x0345c5ca835f8d967f72827e42aade056947eb211ca5d483ea80791631149319";
  
  // Return both mock profiles and the module address path
  return [
    ...Object.keys(MOCK_PROFILES).map((name) => ({
      name: name,
    })),
    {
      name: userAddress,
    }
  ];
}

export default async function ProfilePage({
  params
}: {
  params: { name: string }
}) {
  const state = await getServerState();
  
  // Server-side data fetching
  const address = await state.client.ans.getTargetAddress({name: params.name})
    .catch(() => AccountAddress.from(params.name));

  const bio = address ? await state.client.view<[Bio]>({
    payload: {
      function: `${CONTRACT_ADDRESS}::profile::view_bio`,
      functionArguments: [address]
    }
  }).then(([bio]) => bio).catch(() => undefined) : undefined;

  const links = address ? await state.client.view<[{data: {key: string, value: {"__variant__": "V1", "url": string}}[]}]>({
    payload: {
      function: `${CONTRACT_ADDRESS}::profile::view_links`,
      functionArguments: [address]
    }
  }).then(([data]) => data).catch(() => undefined) : undefined;

  // Convert links to Link[]
  const linkArray = links?.data?.map((link) => ({
    id: link.key,
    title: link.key,
    url: link.value.url
  })) ?? [];

  const profile = {
    owner: address?.toStringLong() ?? "",
    ansName: params.name,
    name: bio?.name ?? "",
    profilePicture: bio?.avatar_url ?? "",
    description: bio?.bio ?? "",
    title: bio?.name ?? "",
    links: linkArray,
  }

  console.log("address: ", address?.toStringLong());
  console.log("bio: ", JSON.stringify(bio, null, 2));
  console.log("links: ", JSON.stringify(links, null, 2));
  console.log("profile: ", JSON.stringify(profile, null, 2));

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#D8B4FE] to-[#818CF8] flex items-center justify-center">
        <div className="text-xl text-white">Profile not found</div>
      </div>
    );
  }

  return <ProfileClient profile={profile} />;
} 