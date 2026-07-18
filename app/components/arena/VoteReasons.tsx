"use client";

import { useVoteReasons } from "@/hooks/useVoteReasons";
import type { ArenaSubmission } from "@/lib/contracts";

type Props = {
  arenaAddress: `0x${string}`;
  submissions: ArenaSubmission[];
  submissionDeadline: bigint;
  votingDeadline: bigint;
};

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function VoteReasons({
  arenaAddress,
  submissions,
  submissionDeadline,
  votingDeadline,
}: Props) {
  const { reasons, isLoading } = useVoteReasons(
    arenaAddress,
    submissionDeadline,
    votingDeadline,
  );

  // Only reasons with actual text — empty (opt-out) votes are hidden here
  const withText = reasons.filter((r) => r.reason.trim().length > 0);

  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-white font-bold mb-4">Voter Notes</h2>
        <div className="h-16 bg-gray-800/60 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (withText.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-white font-bold mb-1">
        Voter Notes{" "}
        <span className="text-gray-500 font-normal text-sm">({withText.length})</span>
      </h2>
      <p className="text-gray-500 text-xs mb-4">
        Public reasoning attached to votes, read from on-chain event logs.
      </p>
      <div className="space-y-3">
        {withText.map((r, i) => {
          const target = submissions[r.submissionId];
          return (
            <div
              key={`${r.voter}-${i}`}
              className="p-4 rounded-xl border border-gray-800 bg-gray-900/50"
            >
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                <span className="font-mono text-gray-400">{shortAddr(r.voter)}</span>
                <span>→</span>
                <span className="text-indigo-400 break-all">
                  {target
                    ? target.contentRef
                    : `entry #${r.submissionId + 1}`}
                </span>
              </div>
              <p className="text-gray-200 text-sm leading-relaxed break-words">
                {r.reason}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
