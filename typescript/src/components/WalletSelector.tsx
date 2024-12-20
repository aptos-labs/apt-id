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
import Image from "next/image";
import { useRouter } from 'next/navigation';

export function WalletSelector() {
  const { wallets, connect, account, connected, disconnect, wallet } = useWallet();
  const { ansName, loading } = useAptosName();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  if (connected && account) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Button 
          onClick={() => setIsOpen(true)}
          className="w-[200px] px-4 py-[14px] sm:py-4 text-[14px] sm:text-[16px] font-semibold 
                   text-center bg-white/90 hover:bg-white text-[#000000] rounded-[14px] 
                   transition-all duration-200 shadow-md hover:scale-[1.02]"
        >
          <div className="w-full flex items-center gap-2">
            <Image 
              src={wallet?.icon || '/favicon.ico'} 
              alt={`${wallet?.name} logo`}
              width={24}
              height={24}
              className="w-6 h-6"
            />
            {loading ? "Loading..." : ansName || `${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
          </div>
        </Button>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-[300px] sm:max-w-[350px]">
            <DialogHeader>
              <DialogTitle className="text-center">Wallet Options</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => {
                  router.replace('/');
                  setIsOpen(false);
                }}
                variant="outline"
                className="w-full"
              >
                Go to Editor
              </Button>
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

  // TODO: Sort wallets by usage
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
      <DialogContent className="max-w-[300px] sm:max-w-[350px]">
        <DialogHeader>
          <DialogTitle className="text-center">Choose your wallet</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {wallets?.filter((wallet) => wallet.name !== "Dev T wallet").map((wallet) => (
            <Button
              key={wallet.name}
              onClick={() => {
                connect(wallet.name);
                setIsOpen(false);
              }}
              className="w-full grid grid-cols-[24px_1fr] items-center gap-2"
            >
              <Image 
                src={wallet.icon} 
                alt={`${wallet.name} logo`}
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <span className="text-left pl-2">
                {wallet.name}
              </span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
