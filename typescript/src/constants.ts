import type { Network } from "@aptos-labs/wallet-adapter-react";

export const NETWORK: Network = (process.env.NEXT_PUBLIC_APP_NETWORK as Network) ?? "testnet";
export const APTOS_API_KEY = process.env.NEXT_PUBLIC_APTOS_API_KEY;
export const CONTRACT_ADDRESS = "0xb11affd5c514bb969e988710ef57813d9556cc1e3fe6dc9aa6a82b56aee53d98";
