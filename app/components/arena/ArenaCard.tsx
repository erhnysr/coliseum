"use client";

import Link from "next/link";
import { ArenaPhase } from "@/lib/contracts";
import { formatUsdc } from "@/lib/usdc";
import { useCountdown } from "@/hooks/useCountdown";
import type { ArenaInfo } from "@/hooks/useArenas";

// Derive phase from current time when on-chain data is stale (wagmi cache lag)
function effectivePhase(phase: ArenaPhase, subDeadline: bigint, voteDeadline: bigint): ArenaPhase {
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (phase === ArenaPhase.Submission && subDeadline > 0n && now >= subDeadline) {
    return voteDeadline > 0n && now >= voteDeadline ? ArenaPhase.Ended : ArenaPhase.Voting;
  }
  if (phase === ArenaPhase.Voting && voteDeadline > 0n && now >= voteDeadline) {
    return ArenaPhase.Ended;
  }
  return phase;
}

const PHASE_LABEL: Record<ArenaPhase, string> = {
  [ArenaPhase.Submission]: "Submissions Open",
  [ArenaPhase.Voting]: "Voting Live",
  [ArenaPhase.Ended]: "Ended",
};

const PHASE_COLORS: Record<ArenaPhase, string> = {
  [ArenaPhase.Submission]: "bg-emerald-900/40 text-emerald-400 border-emerald-800/50",
  [ArenaPhase.Voting]: "bg-indigo-900/40 text-indigo-400 border-indigo-800/50",
  [ArenaPhase.Ended]: "bg-gray-800/60 text-gray-500 border-gray-700/50",
};

function Countdown({ deadline, phase }: { deadline: bigint; phase: ArenaPhase }) {
  const nextDeadline =
    phase === ArenaPhase.Submission ? deadline : deadline; // submissionDeadline or votingDeadline passed in
  const { label, expired } = useCountdown(nextDeadline);

  if (expired) return <span className="text-gray-500 text-xs">—</span>;
  return <span className="text-gray-300 text-xs tabular-nums">{label}</span>;
}

export default function ArenaCard({ arena }: { arena: ArenaInfo }) {
  const phase = effectivePhase(arena.phase, arena.submissionDeadline, arena.votingDeadline);
  const phaseDeadline =
    phase === ArenaPhase.Submission ? arena.submissionDeadline : arena.votingDeadline;

  return (
    <Link
      href={`/arenas/${arena.address}`}
      className="block bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-2xl p-5 transition-colors group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${PHASE_COLORS[phase]}`}
        >
          {phase === ArenaPhase.Voting && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-400" />
            </span>
          )}
          {PHASE_LABEL[phase]}
        </span>

        <Countdown deadline={phaseDeadline} phase={phase} />
      </div>

      <h3 className="text-white font-bold text-base leading-snug mb-4 group-hover:text-indigo-300 transition-colors line-clamp-2">
        {arena.topic}
      </h3>

      <div className="flex items-center justify-between text-sm">
        <div>
          <div className="text-gray-500 text-xs mb-0.5">Prize pool</div>
          <div className="text-white font-semibold">
            {formatUsdc(arena.pot)} USDC
          </div>
        </div>
        <div className="text-right">
          <div className="text-gray-500 text-xs mb-0.5">Entries</div>
          <div className="text-white font-semibold">
            {arena.submissionCount.toString()}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800">
        <p className="text-gray-600 text-xs font-mono truncate">{arena.address}</p>
      </div>
    </Link>
  );
}
