"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { ARENA_ABI } from "@/lib/contracts";
import { arcTestnet } from "@/lib/chain";

export type VoteReason = {
  submissionId: number;
  voter: `0x${string}`;
  reason: string;
};

/**
 * Reads vote reasons off-chain from the Arena `Voted` event logs.
 * Reasons are event-only (never stored in contract state), so this is the
 * canonical way to surface them — an interim indexer until a dedicated one exists.
 */
export function useVoteReasons(arenaAddress: `0x${string}` | undefined) {
  const publicClient = usePublicClient({ chainId: arcTestnet.id });
  const [reasons, setReasons] = useState<VoteReason[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!arenaAddress || !publicClient) return;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const logs = await publicClient!.getContractEvents({
          address: arenaAddress,
          abi: ARENA_ABI,
          eventName: "Voted",
          fromBlock: 0n,
          toBlock: "latest",
        });

        const parsed: VoteReason[] = logs.map((log) => ({
          submissionId: Number(log.args.submissionId ?? 0n),
          voter: (log.args.voter ?? "0x") as `0x${string}`,
          reason: (log.args.reason ?? "") as string,
        }));

        if (!cancelled) setReasons(parsed);
      } catch {
        if (!cancelled) setReasons([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [arenaAddress, publicClient]);

  return { reasons, isLoading };
}
