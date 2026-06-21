import Link from "next/link";
import ArenaList from "@/components/arena/ArenaList";

export default function ArenasPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-white">Arenas</h1>
        <Link
          href="/create"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          + Create
        </Link>
      </div>
      <ArenaList />
    </div>
  );
}
