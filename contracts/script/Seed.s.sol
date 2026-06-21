// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../src/ArenaFactory.sol";
import "../src/Arena.sol";

/// @notice Creates 5 example arenas for demo purposes.
///         Run after Deploy.s.sol. Requires USDC balance for prize pools + submission fees.
contract SeedArenas is Script {
    address constant USDC = 0x3600000000000000000000000000000000000000;

    function run() external {
        address factory = vm.envAddress("ARENA_FACTORY_ADDRESS");

        vm.startBroadcast();

        _createArena(
            factory,
            "Best meme of the week",
            2_000_000, // 2 USDC prize pool
            block.timestamp + 3 days,
            block.timestamp + 5 days
        );

        _createArena(
            factory,
            "Funniest one-liner about crypto",
            1_000_000,
            block.timestamp + 2 days,
            block.timestamp + 4 days
        );

        _createArena(
            factory,
            "Best Base ecosystem project pitch (1 paragraph)",
            5_000_000, // 5 USDC
            block.timestamp + 7 days,
            block.timestamp + 10 days
        );

        _createArena(
            factory,
            "Worst financial advice (satire)",
            500_000,
            block.timestamp + 1 days,
            block.timestamp + 2 days
        );

        _createArena(
            factory,
            "Most creative use of on-chain data",
            3_000_000, // 3 USDC
            block.timestamp + 5 days,
            block.timestamp + 8 days
        );

        vm.stopBroadcast();
    }

    function _createArena(
        address factory,
        string memory topic,
        uint256 prizePool,
        uint256 subDeadline,
        uint256 voteDeadline
    ) internal {
        if (prizePool > 0) {
            IERC20(USDC).approve(factory, prizePool);
        }
        address arena = ArenaFactory(factory).createArena(topic, prizePool, subDeadline, voteDeadline);
        console.log("Arena:", arena, "-", topic);
    }
}
