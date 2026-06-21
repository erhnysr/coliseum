"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEventLogs } from "viem";
import { ARENA_FACTORY_ADDRESS, ARENA_FACTORY_ABI, ERC20_APPROVE_ABI } from "@/lib/contracts";
import { USDC_ADDRESS, parseUsdc, SUBMISSION_FEE } from "@/lib/usdc";
import TxStatus from "@/components/ui/TxStatus";

function toDatetimeLocal(offsetHours: number) {
  const d = new Date(Date.now() + offsetHours * 3600 * 1000);
  return d.toISOString().slice(0, 16);
}

function toUnixSeconds(datetimeLocal: string): bigint {
  return BigInt(Math.floor(new Date(datetimeLocal).getTime() / 1000));
}

type FormState = {
  topic: string;
  prizePool: string;
  subDeadline: string;
  voteDeadline: string;
};

type FieldError = Partial<Record<keyof FormState, string>>;

export default function CreateArenaForm() {
  const router = useRouter();
  const { address, isConnected } = useAccount();

  const [form, setForm] = useState<FormState>({
    topic: "",
    prizePool: "0",
    subDeadline: toDatetimeLocal(24),
    voteDeadline: toDatetimeLocal(48),
  });
  const [errors, setErrors] = useState<FieldError>({});
  const [step, setStep] = useState<"form" | "approve" | "create" | "done">("form");

  const prizePoolUsdc = parseUsdc(form.prizePool || "0");
  const needsApprove = prizePoolUsdc > 0n;

  // Approve tx
  const {
    writeContract: writeApprove,
    data: approveTxHash,
    isPending: approvePending,
    error: approveError,
    reset: resetApprove,
  } = useWriteContract();

  const { isLoading: approveConfirming, isSuccess: approveConfirmed } =
    useWaitForTransactionReceipt({ hash: approveTxHash });

  // CreateArena tx
  const {
    writeContract: writeCreate,
    data: createTxHash,
    isPending: createPending,
    error: createError,
    reset: resetCreate,
  } = useWriteContract();

  const {
    isLoading: createConfirming,
    isSuccess: createConfirmed,
    data: createReceipt,
  } = useWaitForTransactionReceipt({ hash: createTxHash });

  // After approve confirmed → auto-advance to create step
  useEffect(() => {
    if (approveConfirmed && step === "approve") {
      setStep("create");
    }
  }, [approveConfirmed, step]);

  // After create confirmed → extract arena address and redirect
  useEffect(() => {
    if (createConfirmed && createReceipt && step === "create") {
      try {
        const logs = parseEventLogs({
          abi: ARENA_FACTORY_ABI,
          eventName: "ArenaCreated",
          logs: createReceipt.logs as Parameters<typeof parseEventLogs>[0]["logs"],
        });
        const arenaAddress = (logs[0] as { args: { arena: `0x${string}` } }).args.arena;
        setStep("done");
        setTimeout(() => router.push(`/arenas/${arenaAddress}`), 1200);
      } catch {
        // fallback: just redirect to arenas list
        setStep("done");
        setTimeout(() => router.push("/arenas"), 1200);
      }
    }
  }, [createConfirmed, createReceipt, step, router]);

  function validate(): boolean {
    const next: FieldError = {};
    const subTs = toUnixSeconds(form.subDeadline);
    const voteTs = toUnixSeconds(form.voteDeadline);
    const now = BigInt(Math.floor(Date.now() / 1000));

    if (!form.topic.trim()) next.topic = "Topic is required.";
    if (form.topic.length > 120) next.topic = "Topic must be ≤ 120 characters.";

    const pool = parseFloat(form.prizePool || "0");
    if (isNaN(pool) || pool < 0) {
      next.prizePool = "Must be a positive number.";
    } else if (pool > 0 && parseUsdc(form.prizePool || "0") < SUBMISSION_FEE) {
      next.prizePool = "Minimum prize pool is 0.10 USDC.";
    }

    if (subTs <= now) next.subDeadline = "Submission deadline must be in the future.";
    if (voteTs <= subTs) next.voteDeadline = "Voting deadline must be after submission deadline.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (needsApprove) {
      setStep("approve");
      writeApprove({
        address: USDC_ADDRESS,
        abi: ERC20_APPROVE_ABI,
        functionName: "approve",
        args: [ARENA_FACTORY_ADDRESS, prizePoolUsdc],
      });
    } else {
      setStep("create");
      sendCreate();
    }
  }

  function sendCreate() {
    writeCreate({
      address: ARENA_FACTORY_ADDRESS,
      abi: ARENA_FACTORY_ABI,
      functionName: "createArena",
      args: [
        form.topic.trim(),
        prizePoolUsdc,
        toUnixSeconds(form.subDeadline),
        toUnixSeconds(form.voteDeadline),
      ],
    });
  }

  // Once approve confirmed (useEffect sets step="create"), trigger create
  useEffect(() => {
    if (step === "create" && !createTxHash && !createPending) {
      // Only auto-fire if we just came from approve step
      if (approveConfirmed && needsApprove) sendCreate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, approveConfirmed]);

  function set(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      setErrors((err) => ({ ...err, [key]: undefined }));
    };
  }

  const factoryReady = ARENA_FACTORY_ADDRESS.length > 2;
  const txError = approveError ?? createError;
  const anyPending = approvePending || approveConfirming || createPending || createConfirming;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Topic */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Contest topic <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={form.topic}
          onChange={set("topic")}
          placeholder="Best meme of the week, funniest caption, etc."
          maxLength={120}
          className={`w-full bg-gray-900 border text-white text-sm rounded-xl px-4 py-3 placeholder-gray-600 focus:outline-none focus:ring-1 transition-colors ${
            errors.topic ? "border-red-500 focus:ring-red-500" : "border-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
          }`}
        />
        <div className="flex justify-between mt-1">
          {errors.topic && <p className="text-red-400 text-xs">{errors.topic}</p>}
          <p className="text-gray-600 text-xs ml-auto">{form.topic.length}/120</p>
        </div>
      </div>

      {/* Prize pool */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Initial prize pool (USDC)
        </label>
        <div className="relative">
          <input
            type="number"
            value={form.prizePool}
            onChange={set("prizePool")}
            min="0"
            step="0.01"
            placeholder="0.00"
            className={`w-full bg-gray-900 border text-white text-sm rounded-xl px-4 py-3 pr-16 placeholder-gray-600 focus:outline-none focus:ring-1 transition-colors ${
              errors.prizePool ? "border-red-500 focus:ring-red-500" : "border-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
            }`}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">USDC</span>
        </div>
        {errors.prizePool && <p className="text-red-400 text-xs mt-1">{errors.prizePool}</p>}
        <p className="text-gray-600 text-xs mt-1">
          Submission fees (0.10 USDC each) are added to the pot automatically.
        </p>
      </div>

      {/* Deadlines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Submission deadline <span className="text-red-400">*</span>
          </label>
          <input
            type="datetime-local"
            value={form.subDeadline}
            onChange={set("subDeadline")}
            className={`w-full bg-gray-900 border text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-1 transition-colors ${
              errors.subDeadline ? "border-red-500 focus:ring-red-500" : "border-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
            }`}
          />
          {errors.subDeadline && <p className="text-red-400 text-xs mt-1">{errors.subDeadline}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Voting deadline <span className="text-red-400">*</span>
          </label>
          <input
            type="datetime-local"
            value={form.voteDeadline}
            onChange={set("voteDeadline")}
            className={`w-full bg-gray-900 border text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-1 transition-colors ${
              errors.voteDeadline ? "border-red-500 focus:ring-red-500" : "border-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
            }`}
          />
          {errors.voteDeadline && <p className="text-red-400 text-xs mt-1">{errors.voteDeadline}</p>}
        </div>
      </div>

      {/* Summary card */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-sm space-y-2">
        <div className="flex justify-between text-gray-400">
          <span>Initial prize pool</span>
          <span className="text-white">{form.prizePool || "0"} USDC</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Submission fee</span>
          <span className="text-white">0.10 USDC / entry</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Vote stake</span>
          <span className="text-white">0.05 USDC / vote</span>
        </div>
        <div className="flex justify-between text-gray-400 pt-2 border-t border-gray-800">
          <span>Prize split</span>
          <span className="text-white">60% / 30% / 10%</span>
        </div>
      </div>

      {/* CTA */}
      {!isConnected ? (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">Connect your wallet to create an arena.</p>
        </div>
      ) : !factoryReady ? (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">Contract not yet deployed to Arc Testnet.</p>
        </div>
      ) : step === "done" ? (
        <div className="bg-green-900/30 border border-green-800/50 rounded-xl p-4 text-center">
          <p className="text-green-400 font-semibold">Arena created! Redirecting…</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Step indicator when multi-step */}
          {needsApprove && (step === "approve" || step === "create") && (
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className={step === "approve" ? "text-yellow-400 font-semibold" : "text-green-400"}>
                {approveConfirmed ? "✓" : "1."} Approve USDC
              </span>
              <span className="text-gray-700">→</span>
              <span className={step === "create" ? "text-indigo-400 font-semibold" : ""}>
                2. Create Arena
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={anyPending || !address || step === "approve" || step === "create"}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
          >
            {anyPending
              ? step === "approve"
                ? "Approving USDC…"
                : "Creating Arena…"
              : needsApprove
              ? "Approve & Create Arena"
              : "Create Arena"}
          </button>

          <TxStatus
            hash={approveTxHash ?? createTxHash}
            isPending={approvePending || createPending}
            isConfirming={approveConfirming || createConfirming}
            isConfirmed={createConfirmed}
            error={txError}
          />
        </div>
      )}
    </form>
  );
}
