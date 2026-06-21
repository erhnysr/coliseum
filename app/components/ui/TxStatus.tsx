"use client";

type TxStatusProps = {
  hash?: `0x${string}`;
  isPending?: boolean;
  isConfirming?: boolean;
  isConfirmed?: boolean;
  error?: Error | null;
};

export default function TxStatus({
  hash,
  isPending,
  isConfirming,
  isConfirmed,
  error,
}: TxStatusProps) {
  if (!isPending && !isConfirming && !isConfirmed && !error) return null;

  const explorerUrl = hash
    ? `https://testnet.arcscan.app/tx/${hash}`
    : null;

  return (
    <div className="mt-3 rounded-xl border text-sm p-3">
      {isPending && (
        <div className="flex items-center gap-2 text-yellow-400 border-yellow-800/50 bg-yellow-900/20 rounded-lg p-3">
          <span className="animate-spin">⏳</span>
          <span>Waiting for wallet confirmation…</span>
        </div>
      )}
      {isConfirming && hash && (
        <div className="flex items-center gap-2 text-blue-400 border-blue-800/50 bg-blue-900/20 rounded-lg p-3">
          <span className="animate-pulse">🔄</span>
          <span>
            Transaction submitted.{" "}
            <a
              href={explorerUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-300"
            >
              View on Arcscan
            </a>
          </span>
        </div>
      )}
      {isConfirmed && hash && (
        <div className="flex items-center gap-2 text-green-400 border-green-800/50 bg-green-900/20 rounded-lg p-3">
          <span>✅</span>
          <span>
            Confirmed.{" "}
            <a
              href={explorerUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-green-300"
            >
              View on Arcscan
            </a>
          </span>
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 text-red-400 border-red-800/50 bg-red-900/20 rounded-lg p-3">
          <span>❌</span>
          <span className="break-all">
            {error.message.includes("User rejected")
              ? "Transaction rejected in wallet."
              : error.message.slice(0, 120)}
          </span>
        </div>
      )}
    </div>
  );
}
