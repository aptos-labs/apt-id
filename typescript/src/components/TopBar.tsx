'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WalletSelector } from './WalletSelector';
import Image from 'next/image';
import Link from 'next/link';
import { SearchIcon } from 'lucide-react';

export function TopBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Remove .apt if it's included in the search
      const cleanQuery = searchQuery.trim().toLowerCase().replace('.apt', '');
      router.push(`/${cleanQuery}`);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 relative">
          <Image
            src="/favicon.ico"
            alt="Apt ID"
            width={32}
            height={32}
          />
          <span className="font-semibold text-gray-800">Apt ID</span>
          <span className="absolute -top-2 -right-12 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full transform rotate-12 font-bold">
            BETA
          </span>
        </Link>

        {/* Search Bar */}
        <form 
          onSubmit={handleSearch}
          className="max-w-md w-full ml-12 relative group"
        >
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search profiles..."
              className="w-full px-4 py-2 pl-10 bg-gray-100 border border-transparent
                       rounded-lg focus:bg-white focus:border-purple-400 focus:outline-none
                       transition-all duration-200"
            />
            <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </form>

        {/* Wallet Selector */}
        <WalletSelector />
      </div>
    </div>
  );
} 