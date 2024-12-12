"use client";
import { useQuery } from "@tanstack/react-query";
import { useGlobalState } from "./useAptosClient";
import { AccountAddress } from "@aptos-labs/ts-sdk";

export type Bio = {
  name: string;
  bio: string;
  avatar_url?: string;
  avatar_object?: string;
};

export function useName(name: string) {
  const state = useGlobalState();

  const result = useQuery<AccountAddress | undefined, Error>({
    queryKey: ["name", { name }, state.network],
    queryFn: () => {
      return state.client.ans.getTargetAddress({ name });
    },
    retry: false,
  });

  return result;
}
