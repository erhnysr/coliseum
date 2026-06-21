# Coliseum

## Live Demo

**https://coliseum-arc.vercel.app**

---

**Coliseum** is an on-chain judging platform built on Arc Testnet. Anyone can launch a contest, stake USDC as the prize pool, collect entries for 0.10 USDC each, and let the crowd vote — top 3 entries split the pot 60/30/10, voters on the winner get their stake rebated, and winners receive a soulbound Reputation NFT badge.

---

## Tech Stack

| Layer | Tools |
|-------|-------|
| Contracts | Solidity 0.8.28 · Foundry · OpenZeppelin 5.x |
| Frontend | Next.js 16 · wagmi v3 · viem · RainbowKit · TanStack Query |
| Network | Arc Testnet (Chain ID 5042002) · USDC native gas |
| Deploy | Vercel (frontend) · Foundry broadcast (contracts) |

---

## Contract Addresses (Arc Testnet)

| Contract | Address |
|----------|---------|
| ArenaFactory | `0x13a38e7C2bA5AFA76a1AC21Eaef9f4DEA293FEBe` |
| ReputationNFT | `0x953f508CdC9DC4FaA17D898a5e65A91a262F6607` |

### Seeded Arenas

| Topic | Address |
|-------|---------|
| Best Base ecosystem project pitch | `0xAb1709D84Ac0A7f9B58A3D83D60284256d4c5833` |
| Most creative use of on-chain data | `0x75E0F5a599503899746D2D1193da6C48642a8719` |
| Best meme of the week | `0x7890333D4857CD10CC5A27e5c9E8a22F85c94CA6` |
| Funniest one-liner about crypto | `0x1b959D8399E71eaE2e7EAA2AD0f61D1e8d42e949` |
| Worst financial advice (satire) | `0x368ccA9A50d7eb02364EE523BD6AD95d125a8e2D` |

---

## Why Arc

Arc's native gas token is USDC — no ETH bridging, no gas token speculation. Every economic interaction in Coliseum (submit fee, vote stake, prize payout) is denominated in the same asset users are competing for.

**The math:**
- Submission fee: **0.10 USDC** → goes directly into the prize pool
- Vote stake: **0.05 USDC** → rebated to voters who picked the winner
- With 10 entries and 20 voters: prize pool ≈ 3 USDC seed + 1 USDC fees = 4 USDC split 60/30/10
- Losing voters forfeit their 0.05 USDC stake to the pool, increasing winner payouts

This creates a self-reinforcing loop: more entries → bigger pot → more voters → higher quality signal.

---

## How It Works

```
1. Create   →  Set topic, prize pool, submission + voting deadlines
2. Submit   →  Pay 0.10 USDC, post content reference (IPFS hash / URL)
3. Vote     →  Stake 0.05 USDC on your favorite entry (one vote per arena)
4. Finalize →  Anyone calls finalize() after voting ends
5. Claim    →  Winners withdraw USDC; winner voters claim stake rebate; 
               top 3 receive soulbound Reputation NFT
```

---

## Local Development

### Prerequisites

```bash
# Foundry
curl -L https://foundry.paradigm.xyz | bash && foundryup

# Node 18+
node --version
```

### Contracts

```bash
cd contracts
cp .env.example .env        # fill PRIVATE_KEY and ARC_TESTNET_RPC_URL
forge install
forge test                  # 62 tests, ~93% coverage
forge script script/Deploy.s.sol --rpc-url arc_testnet --broadcast
```

### Frontend

```bash
cd app
cp .env.example .env.local  # fill NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
npm install
npm run dev                 # http://localhost:3001
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Optional | Get free at [cloud.walletconnect.com](https://cloud.walletconnect.com) — injected wallets (MetaMask) work without it |

All contract addresses and RPC config are hardcoded in `app/lib/` for Arc Testnet.

---

## Repository Structure

```
coliseum/
├── contracts/
│   ├── src/
│   │   ├── Arena.sol           # Per-contest logic: submit, vote, finalize, withdraw
│   │   ├── ArenaFactory.sol    # Deploys arenas, holds USDC during creation
│   │   └── ReputationNFT.sol   # Soulbound ERC-721 for top-3 winners
│   ├── test/                   # 62 Foundry tests
│   └── script/                 # Deploy + Seed scripts
└── app/                        # Next.js 16 frontend
    ├── app/                    # App Router pages
    ├── components/             # UI components
    ├── hooks/                  # wagmi data hooks
    └── lib/                    # Chain config, contract ABIs, USDC utils
```

---

## License

MIT
