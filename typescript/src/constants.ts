import type { Network } from "@aptos-labs/wallet-adapter-react";

export const NETWORK: Network = (process.env.NEXT_PUBLIC_APP_NETWORK as Network) ?? "mainnet";
export const APTOS_API_KEY = process.env.NEXT_PUBLIC_APTOS_API_KEY;
export const CONTRACT_ADDRESS = "0x631f344549b798ad70cb5ab1842565b082fdfe488b7c6d56a257220222f6a191";
