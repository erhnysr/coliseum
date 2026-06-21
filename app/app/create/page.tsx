import Link from "next/link";
import CreateArenaForm from "@/components/create/CreateArenaForm";

export default function CreatePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/arenas" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
          ← Back to Arenas
        </Link>
      </div>
      <h1 className="text-3xl font-black text-white mb-2">Create Arena</h1>
      <p className="text-gray-400 text-sm mb-8">
        Launch a new on-chain judging contest. Stake USDC, get entries, let the crowd decide.
      </p>
      <CreateArenaForm />
    </div>
  );
}
