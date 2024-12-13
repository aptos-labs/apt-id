"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useEffect } from "react";

export function useAptosName() {
  const { account } = useWallet();
  const [ansName, setAnsName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchANS() {
      if (!account?.address) return;

      setLoading(true);
      try {
        const response = await fetch(`https://www.aptosnames.com/api/mainnet/v1/primary-name/${account.address}`);
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
