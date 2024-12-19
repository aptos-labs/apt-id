import { AccountAddressInput, parseTypeTag, TypeTagAddress } from "@aptos-labs/ts-sdk";
import { client, CONTRACT_ADDRESS } from "@/constants.ts";

export type ImageBio = { __variant__: "Image"; avatar_url: string; bio: string; name: string };
export type NFTBio = { __variant__: "NFT"; nft_url: { inner: string }; bio: string; name: string };
export type CombinedBio = { name: string; bio: string; avatar_url: string };
export type LinkTree = {
  __variant__: "SM";
  links: {
    data: {
      key: string;
      value: {
        __variant__: "UnorderedLink";
        url: string;
      };
    }[];
  };
};

const bioAbi = {
  typeParameters: [],
  parameters: [new TypeTagAddress()],
  returnTypes: [parseTypeTag(`${CONTRACT_ADDRESS}::profile::Bio`)],
};

export async function getBio(address: AccountAddressInput): Promise<CombinedBio | undefined> {
  return client
    .view<[{ vec: [ImageBio | NFTBio] }]>({
      payload: {
        function: `${CONTRACT_ADDRESS}::profile::view_bio`,
        functionArguments: [address],
        abi: bioAbi,
      },
    })
    .then(([data]) => {
      const bio = data.vec[0];
      if (!bio?.__variant__) {
        return undefined;
      } else if (bio.__variant__ === "Image") {
        return {
          name: bio.name,
          bio: bio.bio,
          avatar_url: bio.avatar_url,
        };
      } else {
        return {
          name: bio.name,
          bio: bio.bio,
          // TODO: Fix with proper URL resolution, NFT lookup and all
          avatar_url: bio.nft_url.inner,
        };
      }
    });
}

type Link = {
  id: string;
  title: string;
  url: string;
};

const linksAbi = {
  typeParameters: [],
  parameters: [new TypeTagAddress()],
  returnTypes: [parseTypeTag(`0x1::simple_map::SimpleMap`)],
};

export async function getLinks(address: AccountAddressInput): Promise<Link[]> {
  return client
    .view<[LinkTree]>({
      payload: {
        function: `${CONTRACT_ADDRESS}::profile::view_links`,
        functionArguments: [address],
        abi: linksAbi,
      },
    })
    .then(([data]) => {
      return (
        data?.links?.data?.map((link) => ({
          id: link.key,
          title: link.key,
          url: link.value.url,
        })) ?? []
      );
    });
}
