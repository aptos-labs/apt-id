"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useEffect } from "react";
import { NETWORK } from "@/constants";

export function useAptosName() {
  const { account } = useWallet();
  const [ansName, setAnsName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchANS() {
      if (!account?.address) return;

      setLoading(true);
      try {
        // Use the NETWORK constant to determine which API endpoint to use
        // This makes it easy to switch between mainnet and testnet
        const response = await fetch(`https://www.aptosnames.com/api/${NETWORK}/v1/primary-name/${account.address}`);
        const data = await response.json();
        setAnsName(data.name);
      } catch (error) {
        console.error("Error fetching ANS name:", error);
        setAnsName(null);
      } finally {
        setLoading(false);
      }
    }

    fetchANS();
  }, [account?.address]);

  return { ansName, loading };
}
