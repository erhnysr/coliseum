import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-24 md:py-36">
        <div className="inline-flex items-center gap-2 bg-indigo-900/40 border border-indigo-700/50 text-indigo-300 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400" />
          </span>
          Live on Arc Testnet
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white max-w-3xl leading-none mb-6">
          The Arena Decides
          <span className="text-indigo-400">.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-xl mb-10 leading-relaxed">
          Create on-chain judging contests. Stake USDC. Vote for your favorite.
          Winners take the pot — and a soulbound reputation badge.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/arenas"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-sm"
          >
            Browse Arenas
          </Link>
          <Link
            href="/create"
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-sm"
          >
            Create Arena
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 py-16 w-full">
        <h2 className="text-2xl font-bold text-center text-white mb-12">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "Create",
              desc: "Launch a judging arena with a topic, prize pool, and deadlines.",
            },
            {
              step: "02",
              title: "Submit",
              desc: "Anyone can enter for 0.10 USDC — your content goes on-chain.",
            },
            {
              step: "03",
              title: "Vote",
              desc: "Stake 0.05 USDC on your favorite entry. One vote per arena.",
            },
            {
              step: "04",
              title: "Win",
              desc: "Top 3 split the pot 60/30/10. Voters on the winner get rebates.",
            },
          ].map(({ step, title, desc }) => (
            <div
              key={step}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
            >
              <div className="text-indigo-500 text-xs font-mono font-bold mb-3">
                {step}
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA faucet note */}
      <section className="text-center px-4 py-12">
        <p className="text-gray-500 text-sm">
          Need testnet USDC?{" "}
          <a
            href="https://faucet.circle.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 underline"
          >
            Get it from the Circle Faucet
          </a>
        </p>
      </section>
    </div>
  );
}
