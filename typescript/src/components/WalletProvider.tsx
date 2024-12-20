"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { ReactNode } from "react";
import {RimoWallet} from "rimosafe-plugin-wallet-adapter";
import {OKXWallet} from "@okwallet/aptos-wallet-adapter";
import {TrustWallet} from "@trustwallet/aptos-wallet-adapter";
import {BitgetWallet} from "@bitget-wallet/aptos-wallet-adapter";
import {PontemWallet} from "@pontem/wallet-adapter-plugin"

export function WalletProvider({ children }: { children: ReactNode }) {
  const wallets = [
    new PetraWallet(),
    new PontemWallet(),
    new RimoWallet(),
    new OKXWallet(),
    new TrustWallet(),
    new BitgetWallet(),
  ];

  return (
    <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
      {children}
    </AptosWalletAdapterProvider>
  );
}
