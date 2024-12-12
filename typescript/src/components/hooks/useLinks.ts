"use client";
import { useQuery } from "@tanstack/react-query";
import { useGlobalState } from "./useAptosClient";
import { AccountAddressInput } from "@aptos-labs/ts-sdk";

export type Link = {
  url: string;
};

export type Links = {
  links: Link[];
};

export function useLinks(address: AccountAddressInput) {
  const state = useGlobalState();

  const result = useQuery<any, Error>({
    queryKey: ["links", { address }, state.network],
    queryFn: () => {
      return state.client.view({
        payload: {
          function: "0x1::profile::view_links",
          functionArguments: [address],
        },
      });
    },
    retry: false,
  });

  return result;
}
