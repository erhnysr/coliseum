// Next.js 16: params is a Promise — must be awaited
import Link from "next/link";
import ArenaDetail from "@/components/arena/ArenaDetail";

export default async function ArenaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Basic address validation before passing to client component
  const isValidAddress = /^0x[0-9a-fA-F]{40}$/.test(id);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link
          href="/arenas"
          className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
        >
          ← Back to Arenas
        </Link>
      </div>

      {isValidAddress ? (
        <ArenaDetail address={id as `0x${string}`} />
      ) : (
        <p className="text-red-400 text-sm">
          Invalid arena address: <code>{id}</code>
        </p>
      )}
    </div>
  );
}
