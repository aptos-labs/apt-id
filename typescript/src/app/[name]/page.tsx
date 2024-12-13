import {Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import ProfileClient from './ProfileClient';

const CONTRACT_ADDRESS = "0x082a4da7681abcd717a387f97da7c929157dcc585011fee6e8d4a749db9590d7";

type ImageBio = {__variant__: "Image", avatar_url: string, bio:string, name: string}
type NFTBio = {__variant__: "NFT", nft_url: {inner: string}, bio: string, name: string}
type LinkTree = { __variant__: 'SM', links: {data:{key: string, value: {"__variant__": "UnorderedLink", "url": string}}[]}}

async function getServerState() {
  const network = Network.DEVNET;
  return {
    mainnetClient: new Aptos(new AptosConfig({ network: Network.MAINNET })),
    client: new Aptos(new AptosConfig({ network })),
    network,
  };
}

export async function generateStaticParams() {
  // TODO: This means pages have to generated ahead of time, rather than on-demand.  They should be on-demand.
  const userAddress = "0x0345c5ca835f8d967f72827e42aade056947eb211ca5d483ea80791631149319";
  
  // Return both mock profiles and the module address path
  return [
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
  const address = await state.mainnetClient.ans.getTargetAddress({name: params.name})
    .catch(() => undefined);

  const bio = address ? await state.client.view<[{vec:[ImageBio | NFTBio]}]>({
    payload: {
      function: `${CONTRACT_ADDRESS}::profile::view_bio`,
      functionArguments: [address]
    }
  }).then(([data]) => {
    const bio = data.vec[0];
    // TODO: Lookup avatar_url for NFT
    if (bio.__variant__ === "Image") {
      return {
        name: bio.name,
      bio: bio.bio,
      avatar_url: bio.avatar_url ?? "NFT Image",
      }
    } else {
      return {
        name: bio.name,
        bio: bio.bio,
        avatar_url:  "NFT Image",
      }
    }
  }).catch(() => undefined) : undefined;

  const links = address ? await state.client.view<[LinkTree]>({
    payload: {
      function: `${CONTRACT_ADDRESS}::profile::view_links`,
      functionArguments: [address]
    }
  }).then(([data]) => {
    const inner = data?.links?.data?.map((link) => ({
      id: link.key,
      title: link.key,
      url: link.value.url
    })) ?? [];

    console.log("DATA", inner);
    return inner 
}).catch(() => undefined) : undefined;

  // Add .apt suffix if it's missing
  const ansName = params.name.endsWith('.apt') ? params.name : `${params.name}.apt`;
  console.log(JSON.stringify(bio, null, 2));
  console.log(JSON.stringify(links, null, 2));

  // Create a profile using the URL parameter as the ANS name
  const profile = {
    owner: address?.toStringLong() ?? "",
    ansName,
    name: bio?.name ?? "",
    profilePicture: bio?.avatar_url ?? "",
    description: bio?.bio ?? "",
    title: bio?.name ?? "",
    links: links ?? [],
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#D8B4FE] to-[#818CF8] flex items-center justify-center">
        <div className="text-xl text-white">Profile not found</div>
      </div>
    );
  }
  
  return <ProfileClient profile={profile} />;
} 