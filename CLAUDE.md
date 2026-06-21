# Coliseum — Project Memory

## What this is
A public judging market protocol on Arc Testnet. Anyone opens an "arena" around a subjective topic, funds a USDC prize pool, others submit entries and vote with USDC stake. Top 3 entries split the pot 60/30/10. Winners get a soulbound Reputation NFT.

## Why Arc
A $0.05 vote stake is economically impossible anywhere else — Ethereum gas eats it, Stripe's $0.30 minimum kills it, Solana means holding price risk. Arc's USDC-as-gas + sub-cent fees make micro-stake voting viable for the first time.

## Deployed contracts (Arc Testnet, Chain ID 5042002)
- ArenaFactory: 0x13a38e7C2bA5AFA76a1AC21Eaef9f4DEA293FEBe
- ReputationNFT: 0x953f508CdC9DC4FaA17D898a5e65A91a262F6607
- USDC (ERC-20, 6 decimals): 0x3600000000000000000000000000000000000000
- RPC: https://rpc.testnet.arc.network
- Explorer: https://testnet.arcscan.app
- Deployer EOA: 0xD3467E00F6d7275C74e60fc7A1E5eD526893B29F
- Keystore alias: `deployer` (cast wallet — password never written in chat, code, or commits)

## CRITICAL: Arc decimal footgun
Arc has TWO USDCs with different decimals:
- Native gas USDC: 18 decimals
- ERC-20 USDC (used in contracts/transfers): 6 decimals
NEVER use `ether` units for USDC amounts. Always use `parseUnits(amount, 6)` on frontend and explicit `10**6` math in Solidity.

## Architecture
- contracts/ — Foundry, Solidity 0.8.28, OpenZeppelin 5.x
  - ArenaFactory.sol, Arena.sol, ReputationNFT.sol — 62 tests passing
- app/ — Next.js 14 App Router (no src/ dir), Tailwind, wagmi v2, viem, RainbowKit
  - Routes: /, /arenas, /arenas/[id], /create, /profile
  - Has its own app/CLAUDE.md and app/AGENTS.md for frontend-specific notes — read both when working in app/

## Live deployment
- Frontend: https://coliseum-arc.vercel.app
- Repo: https://github.com/erhnysr/coliseum (public)
- Vercel project name: coliseum

## Known gotchas already solved (don't re-debug these)
1. Forge `--no-commit` flag removed in v1.7.1 — use `--no-git` only
2. Arc's `isBlocklisted` precompile doesn't work in Foundry local simulation — use `--skip-simulation` or `cast send` directly
3. Footer/Navbar must render OUTSIDE ChainGuard wrapper, only `<main>` content goes inside ChainGuard
4. Vercel build needs `legacy-peer-deps=true` in app/.npmrc (RainbowKit 2.x vs wagmi 3.x peer conflict)
5. RPC "Failed to fetch" errors are usually VPN interference — check VPN first

## Security rules
- NEVER write private keys or keystore passwords in code, commits, or chat
- Use `cast wallet --account deployer` keystore for all signing
- .env.local is gitignored — never commit secrets

## External presence (context only)
- Twitter: @Erhnyasar
- Article: https://paragraph.com/@coliseum/the-18-vs-6-decimal-footgun-on-arc-what-nearly-killed-coliseum
- Arc Office Hours application submitted, awaiting response

## Git commit rules
- NEVER add "Co-Authored-By: Claude" or any Claude/Anthropic attribution to commit messages
- NEVER add "Generated with Claude Code" or similar signatures to commits
- Commit author must remain solely the user (erhnysr) — no co-author lines, no AI attribution of any kind, in any repo, ever
- This applies permanently across all future sessions and all future repos

## Working style
- User relays commands from a separate planning chat — be clear enough for them to report status back
- Always report build/test status before considering a task done
- Commit + push after verified working changes unless told otherwise
- Show a plan before coding non-trivial changes
