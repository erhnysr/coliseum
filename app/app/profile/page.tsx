"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useProfile } from "@/hooks/useProfile";
import { ArenaPhase } from "@/lib/contracts";
import { formatUsdc } from "@/lib/usdc";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { ProfileArena } from "@/hooks/useProfile";

const RANK_EMOJI = ["🥇", "🥈", "🥉"];
const RANK_COLOR = [
  "text-yellow-400 bg-yellow-900/20 border-yellow-800/40",
  "text-gray-300 bg-gray-800/30 border-gray-700/40",
  "text-amber-600 bg-amber-900/20 border-amber-800/40",
];

const PHASE_LABEL: Record<ArenaPhase, string> = {
  [ArenaPhase.Submission]: "Submissions",
  [ArenaPhase.Voting]: "Voting",
  [ArenaPhase.Ended]: "Ended",
};
const PHASE_DOT: Record<ArenaPhase, string> = {
  [ArenaPhase.Submission]: "bg-emerald-400",
  [ArenaPhase.Voting]: "bg-indigo-400",
  [ArenaPhase.Ended]: "bg-gray-600",
};

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function ArenaRow({ arena }: { arena: ProfileArena }) {
  return (
    <Link
      href={`/arenas/${arena.address}`}
      className="flex items-center justify-between gap-4 p-4 bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-2xl transition-colors group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className={`relative inline-flex rounded-full h-2 w-2 ${PHASE_DOT[arena.phase]}`} />
        </span>
        <div className="min-w-0">
          <p className="text-white font-medium text-sm truncate group-hover:text-indigo-300 transition-colors">
            {arena.topic}
          </p>
          <p className="text-gray-600 text-xs font-mono">{shortAddr(arena.address)}</p>
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="text-gray-400 text-xs">{PHASE_LABEL[arena.phase]}</p>
        <p className="text-white text-sm font-semibold">{formatUsdc(arena.pot)} USDC</p>
      </div>
    </Link>
  );
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { createdArenas, submittedArenas, winRecords, isLoading } = useProfile(address);

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center flex flex-col items-center gap-6">
        <p className="text-gray-400 text-lg">Connect your wallet to view your profile.</p>
        <ConnectButton />
      </div>
    );
  }

  const hasActivity = createdArenas.length > 0 || submittedArenas.length > 0 || winRecords.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Profile</h1>
          <p className="text-gray-500 text-sm font-mono">{address}</p>
        </div>
        <div className="flex gap-3 text-center">
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-3">
            <div className="text-2xl font-black text-white">{createdArenas.length}</div>
            <div className="text-gray-500 text-xs mt-0.5">Created</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-3">
            <div className="text-2xl font-black text-white">{submittedArenas.length}</div>
            <div className="text-gray-500 text-xs mt-0.5">Entered</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-3">
            <div className="text-2xl font-black text-white">{winRecords.length}</div>
            <div className="text-gray-500 text-xs mt-0.5">Wins</div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-900 rounded-2xl border border-gray-800" />
          ))}
        </div>
      ) : !hasActivity ? (
        <div className="text-center py-20 bg-gray-900/40 border border-gray-800 rounded-2xl">
          <p className="text-gray-400 text-base mb-2">You haven&apos;t created or submitted to any arenas yet.</p>
          <Link href="/arenas" className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
            Browse arenas to get started →
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Win Records */}
          {winRecords.length > 0 && (
            <section>
              <h2 className="text-white font-bold text-lg mb-4">
                Reputation Badges
                <span className="text-gray-500 font-normal text-sm ml-2">({winRecords.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[...winRecords]
                  .sort((a, b) => a.rank - b.rank)
                  .map((rec, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-4 p-4 rounded-xl border ${RANK_COLOR[rec.rank - 1]}`}
                    >
                      <span className="text-3xl">{RANK_EMOJI[rec.rank - 1]}</span>
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{rec.category}</p>
                        <Link
                          href={`/arenas/${rec.arena}`}
                          className="text-xs font-mono text-gray-400 hover:text-white transition-colors"
                        >
                          {shortAddr(rec.arena)}
                        </Link>
                        <p className="text-gray-600 text-xs mt-0.5">
                          {new Date(Number(rec.timestamp) * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Created Arenas */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">
                Created Arenas
                <span className="text-gray-500 font-normal text-sm ml-2">({createdArenas.length})</span>
              </h2>
              <Link href="/create" className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
                + New Arena
              </Link>
            </div>

            {createdArenas.length === 0 ? (
              <div className="text-center py-10 bg-gray-900/40 border border-gray-800 rounded-2xl">
                <p className="text-gray-600 text-sm mb-3">You haven&apos;t created any arenas yet.</p>
                <Link href="/create" className="text-indigo-400 hover:text-indigo-300 text-sm underline">
                  Create your first arena →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {createdArenas.map((arena) => <ArenaRow key={arena.address} arena={arena} />)}
              </div>
            )}
          </section>

          {/* Submitted Entries */}
          {submittedArenas.length > 0 && (
            <section>
              <h2 className="text-white font-bold text-lg mb-4">
                Entered Arenas
                <span className="text-gray-500 font-normal text-sm ml-2">({submittedArenas.length})</span>
              </h2>
              <div className="space-y-3">
                {submittedArenas.map((arena) => <ArenaRow key={arena.address} arena={arena} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
