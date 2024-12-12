"use client";
import { useQuery } from "@tanstack/react-query";
import { useGlobalState } from "./useAptosClient";
import { AccountAddressInput } from "@aptos-labs/ts-sdk";

export type Bio = {
  name: string;
  bio: string;
  avatar_url?: string;
  avatar_object?: string;
};

export function useBio(address: AccountAddressInput) {
  const state = useGlobalState();

  const result = useQuery<Bio, Error>({
    queryKey: ["bio", { address }, state.network],
    queryFn: () => {
      return state.client
        .view<[Bio]>({
          payload: {
            function: "0x1::profile::view_bio",
            functionArguments: [address],
          },
        })
        .then(([bio]) => bio);
    },
    retry: false,
  });

  return result;
}
