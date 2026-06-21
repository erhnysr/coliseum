"use client";

import { useArenas } from "@/hooks/useArenas";
import { ArenaPhase } from "@/lib/contracts";
import ArenaCard from "./ArenaCard";
import { useState } from "react";

type Filter = "all" | "active" | "ended";

function SkeletonCard() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="h-6 w-28 bg-gray-800 rounded-full" />
        <div className="h-4 w-12 bg-gray-800 rounded" />
      </div>
      <div className="h-5 w-3/4 bg-gray-800 rounded mb-2" />
      <div className="h-4 w-1/2 bg-gray-800 rounded mb-6" />
      <div className="flex justify-between">
        <div className="h-8 w-24 bg-gray-800 rounded" />
        <div className="h-8 w-16 bg-gray-800 rounded" />
      </div>
    </div>
  );
}

export default function ArenaList() {
  const { arenas, isLoading, factoryReady, error } = useArenas();
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = arenas.filter((a) => {
    if (filter === "active") return a.phase !== ArenaPhase.Ended && !a.finalized;
    if (filter === "ended") return a.phase === ArenaPhase.Ended || a.finalized;
    return true;
  });

  // Sort: active first, then by votingDeadline desc
  const sorted = [...filtered].sort((a, b) => {
    if (a.phase !== ArenaPhase.Ended && b.phase === ArenaPhase.Ended) return -1;
    if (a.phase === ArenaPhase.Ended && b.phase !== ArenaPhase.Ended) return 1;
    return Number(b.votingDeadline - a.votingDeadline);
  });

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 text-sm font-mono">Error: {error.message}</p>
      </div>
    );
  }

  if (!factoryReady) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600 text-sm">
          Contract not deployed yet. Deploy to Arc Testnet to see arenas.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-8">
        {(["all", "active", "ended"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-sm font-medium px-4 py-2 rounded-xl border transition-colors capitalize ${
              filter === f
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:border-gray-600"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-600 text-sm">
            {filter === "all" ? "No arenas yet." : `No ${filter} arenas.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((arena) => (
            <ArenaCard key={arena.address} arena={arena} />
          ))}
        </div>
      )}
    </div>
  );
}
