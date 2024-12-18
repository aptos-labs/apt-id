import { Aptos, AptosConfig, Network as SdkNetwork } from "@aptos-labs/ts-sdk";

export const NETWORK = "mainnet";
export const CONTRACT_ADDRESS = "0x631f344549b798ad70cb5ab1842565b082fdfe488b7c6d56a257220222f6a191";

export const APTOS_API_KEY = process.env.NEXT_PUBLIC_APTOS_API_KEY;
export const client = new Aptos(
  new AptosConfig({
    network: SdkNetwork.MAINNET,
    clientConfig: { API_KEY: APTOS_API_KEY },
  }),
);
