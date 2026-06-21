import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/ui/Providers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChainGuard from "@/components/ui/ChainGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coliseum — Public Judging Markets on Arc Testnet",
  description:
    "Submit, vote, and win in on-chain judging arenas. USDC-staked competitions on Arc Testnet.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-950 text-white">
        <Providers>
          <Navbar />
          <ChainGuard>
            <main className="flex-1">{children}</main>
          </ChainGuard>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
