"use client";

import { ArenaPhase, type ArenaSubmission } from "@/lib/contracts";
import { formatUsdc } from "@/lib/usdc";

type Props = {
  submissions: ArenaSubmission[];
  winners: readonly [bigint, bigint, bigint]; // 1-indexed IDs, 0 = no winner
  phase: ArenaPhase;
  pot: bigint;
};

const RANK_STYLE = [
  "text-yellow-400 bg-yellow-900/20 border-yellow-800/40",
  "text-gray-300 bg-gray-800/30 border-gray-700/40",
  "text-amber-600 bg-amber-900/20 border-amber-800/40",
];

const SPLIT = [60, 30, 10];

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function Leaderboard({ submissions, winners, phase, pot }: Props) {
  if (submissions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 text-sm">
        No entries yet.
      </div>
    );
  }

  // Sort by votes desc, tiebreak by index asc (matches contract logic)
  const sorted = [...submissions]
    .map((s, i) => ({ ...s, id: i }))
    .sort((a, b) => {
      const vDiff = Number(b.votes - a.votes);
      if (vDiff !== 0) return vDiff;
      return a.id - b.id;
    });

  const isFinalized = phase === ArenaPhase.Ended && winners[0] > 0n;

  return (
    <div className="space-y-3">
      {sorted.map((s, rank) => {
        const winnerSlot = isFinalized
          ? winners.findIndex((w) => w === BigInt(s.id + 1))
          : -1;
        const isWinner = winnerSlot !== -1;
        const prize = isWinner ? (pot * BigInt(SPLIT[winnerSlot])) / 10000n : null;

        return (
          <div
            key={s.id}
            className={`flex items-start gap-4 p-4 rounded-xl border ${
              isWinner ? RANK_STYLE[winnerSlot] : "border-gray-800 bg-gray-900/50"
            }`}
          >
            <div className="flex-shrink-0 w-8 text-center">
              {isWinner ? (
                <span className="font-black text-lg">
                  {winnerSlot === 0 ? "🥇" : winnerSlot === 1 ? "🥈" : "🥉"}
                </span>
              ) : (
                <span className="text-gray-600 text-sm font-mono">#{rank + 1}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-gray-400 text-xs font-mono mb-1">
                {shortAddr(s.submitter)}
              </p>
              <p className="text-white text-sm break-all leading-relaxed">
                {s.contentRef.startsWith("ipfs://") ? (
                  <span className="text-indigo-400 hover:underline">
                    {s.contentRef}
                  </span>
                ) : (
                  s.contentRef
                )}
              </p>
            </div>

            <div className="flex-shrink-0 text-right">
              <div className="text-white font-bold text-sm">
                {s.votes.toString()}
                <span className="text-gray-500 font-normal text-xs ml-1">
                  {s.votes === 1n ? "vote" : "votes"}
                </span>
              </div>
              {prize !== null && (
                <div className="text-xs text-green-400 mt-1">
                  +{formatUsdc(prize)} USDC
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
