'use client';

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useState } from "react";
import { useAptosName } from "../hooks/useAptosName";

export function WalletSelector() {
  const { wallets, connect, account, connected, disconnect } = useWallet();
  const { ansName, loading } = useAptosName();
  const [isOpen, setIsOpen] = useState(false);

  if (connected && account) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Button 
          onClick={() => setIsOpen(true)}
          className="w-[200px] px-4 py-[14px] sm:py-4 text-[14px] sm:text-[16px] font-semibold 
                   text-center bg-white/90 hover:bg-white text-[#000000] rounded-[14px] 
                   transition-all duration-200 shadow-md hover:scale-[1.02]"
        >
          {loading ? "Loading..." : ansName || `${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
        </Button>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Wallet Options</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => {
                  disconnect();
                  setIsOpen(false);
                }}
                variant="outline"
                className="w-full"
              >
                Disconnect
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="w-[200px] px-4 py-[14px] sm:py-4 text-[14px] sm:text-[16px] 
                   font-semibold text-center bg-white/90 hover:bg-white text-[#000000] 
                   rounded-[14px] transition-all duration-200 shadow-md hover:scale-[1.02]"
        >
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {wallets?.filter((wallet) => wallet.name !== "Dev T wallet").map((wallet) => (
            <Button
              key={wallet.name}
              onClick={() => {
                connect(wallet.name);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 relative"
            >
              <img 
                src={wallet.icon} 
                alt={`${wallet.name} logo`}
                className="w-6 h-6 absolute left-3"
              />
              <span className="flex-1 text-center">
                {wallet.name}
              </span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
