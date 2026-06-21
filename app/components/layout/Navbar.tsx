"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-black text-white tracking-tight">
            COLISEUM
          </span>
          <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full font-medium">
            Arc Testnet
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-400">
          <Link href="/arenas" className="hover:text-white transition-colors">
            Arenas
          </Link>
          <Link href="/create" className="hover:text-white transition-colors">
            Create
          </Link>
          <Link href="/profile" className="hover:text-white transition-colors">
            Profile
          </Link>
        </nav>

        <ConnectButton
          label="Connect"
          showBalance={false}
          chainStatus="icon"
        />
      </div>
    </header>
  );
}
