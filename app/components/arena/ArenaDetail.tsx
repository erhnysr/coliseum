"use client";

import { useArena, canSubmit, canVote } from "@/hooks/useArena";
import { ArenaPhase } from "@/lib/contracts";
import { formatUsdc, USDC_ADDRESS, SUBMISSION_FEE, VOTE_STAKE } from "@/lib/usdc";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ARENA_ABI, ERC20_APPROVE_ABI } from "@/lib/contracts";
import { useState } from "react";
import PhaseTimer from "./PhaseTimer";
import Leaderboard from "./Leaderboard";
import TxStatus from "@/components/ui/TxStatus";

type Props = { address: `0x${string}` };

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function resolvePhase(phase: ArenaPhase, subDeadline: bigint, voteDeadline: bigint): ArenaPhase {
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (phase === ArenaPhase.Submission && subDeadline > 0n && now >= subDeadline) {
    return voteDeadline > 0n && now >= voteDeadline ? ArenaPhase.Ended : ArenaPhase.Voting;
  }
  if (phase === ArenaPhase.Voting && voteDeadline > 0n && now >= voteDeadline) return ArenaPhase.Ended;
  return phase;
}

const PHASE_BADGE: Record<ArenaPhase, { label: string; cls: string }> = {
  [ArenaPhase.Submission]: { label: "Submissions Open", cls: "bg-emerald-900/40 text-emerald-400 border-emerald-800/50" },
  [ArenaPhase.Voting]:     { label: "Voting Live",       cls: "bg-indigo-900/40 text-indigo-400 border-indigo-800/50" },
  [ArenaPhase.Ended]:      { label: "Ended",             cls: "bg-gray-800/60 text-gray-500 border-gray-700/50" },
};

// ── Submit flow ──────────────────────────────────────────────────
function SubmitPanel({ arenaAddress, detail }: { arenaAddress: `0x${string}`; detail: NonNullable<ReturnType<typeof useArena>["detail"]> }) {
  const { isConnected } = useAccount();
  const [contentRef, setContentRef] = useState("");
  const { ok, reason } = canSubmit(detail, isConnected);

  const { writeContract: approve, data: approveTxHash, isPending: approvePending } = useWriteContract();
  const { writeContract: submit, data: submitTxHash, isPending: submitPending } = useWriteContract();

  const { isLoading: approveConfirming, isSuccess: approveConfirmed } =
    useWaitForTransactionReceipt({ hash: approveTxHash });
  const { isLoading: submitConfirming, isSuccess: submitConfirmed } =
    useWaitForTransactionReceipt({ hash: submitTxHash });

  const needsApprove = detail.usdcAllowance < SUBMISSION_FEE;

  function handleApprove() {
    approve({
      address: USDC_ADDRESS,
      abi: ERC20_APPROVE_ABI,
      functionName: "approve",
      args: [arenaAddress, SUBMISSION_FEE],
    });
  }

  function handleSubmit() {
    if (!contentRef.trim()) return;
    submit({
      address: arenaAddress,
      abi: ARENA_ABI,
      functionName: "submit",
      args: [contentRef.trim()],
    });
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <h3 className="text-white font-bold mb-4">Submit Entry</h3>
      {!ok ? (
        <p className="text-gray-500 text-sm">{reason}</p>
      ) : (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="IPFS hash or URL (e.g. ipfs://Qm…)"
            value={contentRef}
            onChange={(e) => setContentRef(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl px-4 py-3 placeholder-gray-600 focus:outline-none focus:border-indigo-500"
          />
          <p className="text-gray-500 text-xs">Fee: 0.10 USDC → added to prize pool</p>

          {needsApprove && !approveConfirmed ? (
            <button
              onClick={handleApprove}
              disabled={approvePending || approveConfirming}
              className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              {approvePending || approveConfirming ? "Approving…" : "1. Approve 0.10 USDC"}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitPending || submitConfirming || !contentRef.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              {submitPending || submitConfirming ? "Submitting…" : "Submit Entry"}
            </button>
          )}

          <TxStatus
            hash={approveTxHash ?? submitTxHash}
            isPending={approvePending || submitPending}
            isConfirming={approveConfirming || submitConfirming}
            isConfirmed={submitConfirmed}
          />
        </div>
      )}
    </div>
  );
}

// ── Vote flow ────────────────────────────────────────────────────
function VotePanel({ arenaAddress, detail }: { arenaAddress: `0x${string}`; detail: NonNullable<ReturnType<typeof useArena>["detail"]> }) {
  const { isConnected } = useAccount();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { ok, reason } = canVote(detail, isConnected);

  const { writeContract: approve, data: approveTxHash, isPending: approvePending } = useWriteContract();
  const { writeContract: vote, data: voteTxHash, isPending: votePending } = useWriteContract();

  const { isLoading: approveConfirming, isSuccess: approveConfirmed } =
    useWaitForTransactionReceipt({ hash: approveTxHash });
  const { isLoading: voteConfirming, isSuccess: voteConfirmed } =
    useWaitForTransactionReceipt({ hash: voteTxHash });

  const needsApprove = detail.usdcAllowance < VOTE_STAKE;

  function handleApprove() {
    approve({
      address: USDC_ADDRESS,
      abi: ERC20_APPROVE_ABI,
      functionName: "approve",
      args: [arenaAddress, VOTE_STAKE],
    });
  }

  function handleVote() {
    if (selectedId === null) return;
    vote({
      address: arenaAddress,
      abi: ARENA_ABI,
      functionName: "vote",
      args: [BigInt(selectedId)],
    });
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <h3 className="text-white font-bold mb-4">Cast Your Vote</h3>
      {!ok ? (
        <p className="text-gray-500 text-sm">{reason}</p>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {detail.submissions.map((s, i) => (
              <label
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  selectedId === i
                    ? "border-indigo-500 bg-indigo-900/20"
                    : "border-gray-700 hover:border-gray-600"
                }`}
              >
                <input
                  type="radio"
                  name="vote"
                  checked={selectedId === i}
                  onChange={() => setSelectedId(i)}
                  className="mt-0.5 accent-indigo-500"
                />
                <div className="min-w-0">
                  <p className="text-gray-400 text-xs font-mono">{shortAddr(s.submitter)}</p>
                  <p className="text-white text-sm break-all">{s.contentRef}</p>
                </div>
              </label>
            ))}
          </div>

          <p className="text-gray-500 text-xs">Stake: 0.05 USDC — rebated if winner</p>

          {needsApprove && !approveConfirmed ? (
            <button
              onClick={handleApprove}
              disabled={approvePending || approveConfirming}
              className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              {approvePending || approveConfirming ? "Approving…" : "1. Approve 0.05 USDC"}
            </button>
          ) : (
            <button
              onClick={handleVote}
              disabled={votePending || voteConfirming || selectedId === null}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              {votePending || voteConfirming ? "Voting…" : "Cast Vote"}
            </button>
          )}

          <TxStatus
            hash={approveTxHash ?? voteTxHash}
            isPending={approvePending || votePending}
            isConfirming={approveConfirming || voteConfirming}
            isConfirmed={voteConfirmed}
          />
        </div>
      )}
    </div>
  );
}

// ── Finalize + Withdraw ──────────────────────────────────────────
function ActionPanel({ arenaAddress, detail }: { arenaAddress: `0x${string}`; detail: NonNullable<ReturnType<typeof useArena>["detail"]> }) {
  const { isConnected } = useAccount();
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: confirming, isSuccess: confirmed } = useWaitForTransactionReceipt({ hash: txHash });

  const canFinalize = detail.phase === ArenaPhase.Ended && !detail.finalized && isConnected;
  const canWithdraw = detail.finalized && detail.pendingWithdraw > 0n && isConnected;

  if (!canFinalize && !canWithdraw) return null;

  function handleFinalize() {
    writeContract({ address: arenaAddress, abi: ARENA_ABI, functionName: "finalize" });
  }

  function handleWithdraw() {
    writeContract({ address: arenaAddress, abi: ARENA_ABI, functionName: "withdraw" });
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      {canWithdraw && (
        <>
          <h3 className="text-white font-bold mb-1">Claim Winnings</h3>
          <p className="text-gray-400 text-sm mb-4">
            You have <span className="text-green-400 font-semibold">{formatUsdc(detail.pendingWithdraw)} USDC</span> pending.
          </p>
          <button
            onClick={handleWithdraw}
            disabled={isPending || confirming}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            {isPending || confirming ? "Withdrawing…" : "Withdraw"}
          </button>
        </>
      )}
      {canFinalize && (
        <>
          <h3 className="text-white font-bold mb-2">Finalize Arena</h3>
          <p className="text-gray-400 text-sm mb-4">
            Voting ended. Finalize to distribute prizes and mint NFTs.
          </p>
          <button
            onClick={handleFinalize}
            disabled={isPending || confirming}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            {isPending || confirming ? "Finalizing…" : "Finalize Arena"}
          </button>
        </>
      )}
      <TxStatus hash={txHash} isPending={isPending} isConfirming={confirming} isConfirmed={confirmed} />
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────
export default function ArenaDetail({ address }: Props) {
  const { detail, isLoading } = useArena(address);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 w-2/3 bg-gray-800 rounded-xl" />
        <div className="h-32 bg-gray-800 rounded-2xl" />
        <div className="h-64 bg-gray-800 rounded-2xl" />
      </div>
    );
  }

  if (!detail) {
    return <p className="text-gray-500 text-sm">Arena not found or not yet deployed.</p>;
  }

  const phase = resolvePhase(detail.phase, detail.submissionDeadline, detail.votingDeadline);
  const badge = PHASE_BADGE[phase];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border mb-3 ${badge.cls}`}>
          {phase === ArenaPhase.Voting && (
            <span className="relative flex h-1.5 w-1.5 mr-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-400" />
            </span>
          )}
          {badge.label}
        </span>
        <h1 className="text-4xl font-black text-white leading-tight mb-2">{detail.topic}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
          <span>By <span className="font-mono text-gray-300">{shortAddr(detail.creator)}</span></span>
          <span>Pot: <span className="text-white font-semibold">{formatUsdc(detail.pot)} USDC</span></span>
          <span>{detail.submissionCount.toString()} entries</span>
        </div>
      </div>

      {/* Timer */}
      <PhaseTimer
        phase={detail.phase}
        submissionDeadline={detail.submissionDeadline}
        votingDeadline={detail.votingDeadline}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submissions */}
        <div className="lg:col-span-2">
          <h2 className="text-white font-bold mb-4">
            {detail.finalized ? "Results" : "Entries"}{" "}
            <span className="text-gray-500 font-normal text-sm">
              ({detail.submissionCount.toString()})
            </span>
          </h2>
          <Leaderboard
            submissions={detail.submissions}
            winners={detail.winners}
            phase={detail.phase}
            pot={detail.pot}
          />
        </div>

        {/* Action sidebar */}
        <div className="space-y-4">
          {detail.phase === ArenaPhase.Submission && (
            <SubmitPanel arenaAddress={address} detail={detail} />
          )}
          {detail.phase === ArenaPhase.Voting && (
            <VotePanel arenaAddress={address} detail={detail} />
          )}
          <ActionPanel arenaAddress={address} detail={detail} />
        </div>
      </div>
    </div>
  );
}
