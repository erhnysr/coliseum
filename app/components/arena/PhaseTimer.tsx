"use client";

import { useCountdown } from "@/hooks/useCountdown";
import { ArenaPhase } from "@/lib/contracts";

type Props = {
  phase: ArenaPhase;
  submissionDeadline: bigint;
  votingDeadline: bigint;
};

function resolvePhase(phase: ArenaPhase, subDeadline: bigint, voteDeadline: bigint): ArenaPhase {
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (phase === ArenaPhase.Submission && subDeadline > 0n && now >= subDeadline) {
    return voteDeadline > 0n && now >= voteDeadline ? ArenaPhase.Ended : ArenaPhase.Voting;
  }
  if (phase === ArenaPhase.Voting && voteDeadline > 0n && now >= voteDeadline) {
    return ArenaPhase.Ended;
  }
  return phase;
}

export default function PhaseTimer({ phase, submissionDeadline, votingDeadline }: Props) {
  const subCountdown = useCountdown(submissionDeadline);
  const voteCountdown = useCountdown(votingDeadline);

  const resolvedPhase = resolvePhase(phase, submissionDeadline, votingDeadline);

  if (resolvedPhase === ArenaPhase.Ended) {
    return (
      <div className="bg-gray-800/40 border border-gray-700/60 rounded-2xl p-5 text-center">
        <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest">Voting Closed</p>
        <p className="text-gray-600 text-xs mt-1">Awaiting finalization</p>
      </div>
    );
  }

  const isSubmission = resolvedPhase === ArenaPhase.Submission;
  const countdown = isSubmission ? subCountdown : voteCountdown;
  const { label, days, hours, minutes, seconds } = countdown;

  const blocks = [
    { val: days, unit: "D" },
    { val: hours, unit: "H" },
    { val: minutes, unit: "M" },
    { val: seconds, unit: "S" },
  ];

  return (
    <div
      className={`border rounded-2xl p-6 text-center ${
        isSubmission
          ? "bg-emerald-950/30 border-emerald-800/40"
          : "bg-indigo-950/30 border-indigo-800/40"
      }`}
    >
      <p
        className={`text-sm font-semibold uppercase tracking-widest mb-1 ${
          isSubmission ? "text-emerald-400" : "text-indigo-400"
        }`}
      >
        {isSubmission ? "Submissions close in" : "Voting Open"}
      </p>
      {!isSubmission && (
        <p className="text-gray-600 text-xs mb-4">
          Submissions closed · {label} left to vote
        </p>
      )}
      <div className={`flex justify-center gap-5 ${isSubmission ? "mt-4" : ""}`}>
        {blocks.map(({ val, unit }) => (
          <div key={unit} className="text-center">
            <div className="text-5xl font-black text-white tabular-nums w-14">
              {String(val).padStart(2, "0")}
            </div>
            <div
              className={`text-xs mt-1 ${
                isSubmission ? "text-emerald-500/70" : "text-indigo-500/70"
              }`}
            >
              {unit}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
