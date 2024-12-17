import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import ProfileClient from "./ProfileClient";
import { CONTRACT_ADDRESS } from "@/constants.ts";
import { redirect } from 'next/navigation';
import NotFound from "@/app/not-found.tsx";

type ImageBio = { __variant__: "Image"; avatar_url: string; bio: string; name: string };
type NFTBio = { __variant__: "NFT"; nft_url: { inner: string }; bio: string; name: string };
type LinkTree = {
  __variant__: "SM";
  links: { data: { key: string; value: { __variant__: "UnorderedLink"; url: string } }[] };
};

async function getServerState() {
  const network = Network.DEVNET;
  return {
    mainnetClient: new Aptos(new AptosConfig({ network: Network.MAINNET })),
    client: new Aptos(new AptosConfig({ network })),
    network,
  };
}

export async function generateStaticParams() {
  return [];
}

interface PageProps {
  params: Promise<{ name: string }>;
}

export default async function ProfilePage(props: PageProps) {
  const params = await props.params;
  if (!params?.name) {
    return <NotFound />;
  }

  // Redirect .apt URLs to base name
  if (params.name.endsWith('.apt')) {
    redirect(`/${params.name.slice(0, -4)}`);
  }

  const state = await getServerState();

  // Always add .apt for ANS lookup
  const lookupName = `${params.name}.apt`;
  
  // Server-side data fetching
  const address = await state.mainnetClient.ans.getTargetAddress({ name: lookupName })
    .catch(() => undefined);

  const bio = address
    ? await state.client
        .view<[{ vec: [ImageBio | NFTBio] }]>({
          payload: {
            function: `${CONTRACT_ADDRESS}::profile::view_bio`,
            functionArguments: [address],
          },
        })
        .then(([data]) => {
          const bio = data.vec[0];
          // TODO: Lookup avatar_url for NFT
          if (bio.__variant__ === "Image") {
            return {
              name: bio.name,
              bio: bio.bio,
              avatar_url: bio.avatar_url ?? "NFT Image",
            };
          } else {
            return {
              name: bio.name,
              bio: bio.bio,
              avatar_url: "NFT Image",
            };
          }
        })
        .catch(() => undefined)
    : undefined;

  const links = address
    ? await state.client
        .view<[LinkTree]>({
          payload: {
            function: `${CONTRACT_ADDRESS}::profile::view_links`,
            functionArguments: [address],
          },
        })
        .then(([data]) => {
          const inner =
            data?.links?.data?.map((link) => ({
              id: link.key,
              title: link.key,
              url: link.value.url,
            })) ?? [];

          return inner;
        })
        .catch(() => undefined)
    : undefined;

  // Create a profile using the URL parameter as the ANS name
  const profile = {
    owner: address?.toStringLong() ?? "",
    ansName: lookupName,
    name: bio?.name ?? "",
    profilePicture: bio?.avatar_url ?? "",
    description: bio?.bio ?? "",
    title: bio?.name ?? "",
    links: links ?? [],
  };

  if (!profile.owner) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#D8B4FE] to-[#818CF8] flex items-center justify-center">
        <div className="text-xl text-white">Profile not found</div>
      </div>
    );
  }

  return <ProfileClient profile={profile} />;
}
