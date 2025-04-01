import { Aptos, AptosConfig, Network as SdkNetwork } from "@aptos-labs/ts-sdk";

// NETWORK CONFIGURATION
// TODO: For production/mainnet deployment, change these values back to:
// export const NETWORK = "mainnet";
// network: SdkNetwork.MAINNET in the AptosConfig below
export const NETWORK = "testnet";

// CONTRACT ADDRESS
// TODO: Update with actual testnet contract address after deployment
// For mainnet, use: 0x631f344549b798ad70cb5ab1842565b082fdfe488b7c6d56a257220222f6a191
export const CONTRACT_ADDRESS = "0xaea5b834a6bcab2de9556051c200bd1dbc2f0c70f4eafced96f05ca0ff9af6dc";

export const APTOS_API_KEY = process.env.NEXT_PUBLIC_APTOS_API_KEY;
export const client = new Aptos(
  new AptosConfig({
    network: SdkNetwork.TESTNET,
    clientConfig: { API_KEY: APTOS_API_KEY },
  }),
);
