"use client";

import { createContext, useContext } from "react";
import { Aptos, AptosConfig, Network, NetworkToNetworkName } from "@aptos-labs/ts-sdk";

// TODO: add network?
interface GlobalState {
  client: Aptos;
  network: Network;
}

function initialGlobalState({ network_name }: { network_name: string } = { network_name: "testnet" }): GlobalState {
  const network = NetworkToNetworkName[network_name];
  return {
    client: new Aptos(new AptosConfig({ network })),
    network,
  };
}

export const GlobalStateContext = createContext(initialGlobalState());

export function useGlobalState() {
  return useContext(GlobalStateContext);
}
