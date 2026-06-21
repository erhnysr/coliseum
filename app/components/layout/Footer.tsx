export default function Footer() {
  return (
    <footer className="border-t border-gray-800/60 mt-16 py-6 px-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
        <span>Coliseum — built on Arc Testnet · Solo built by @Erhnyasar</span>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/erhnysr/coliseum"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://x.com/Erhnyasar"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 transition-colors"
          >
            Twitter
          </a>
        </div>
      </div>
    </footer>
  );
}
