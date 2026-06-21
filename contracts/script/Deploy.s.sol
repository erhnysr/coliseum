// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/ReputationNFT.sol";
import "../src/ArenaFactory.sol";

contract DeployColiseum is Script {
    function run() external {
        vm.startBroadcast();
        address deployer = msg.sender;

        // 1. Deploy ReputationNFT (owner = deployer)
        ReputationNFT repNFT = new ReputationNFT(deployer);
        console.log("ReputationNFT deployed:", address(repNFT));

        // 2. Deploy ArenaFactory
        ArenaFactory factory = new ArenaFactory(address(repNFT));
        console.log("ArenaFactory deployed:", address(factory));

        // 3. Wire factory into ReputationNFT
        repNFT.setFactory(address(factory));
        console.log("Factory wired to ReputationNFT");

        vm.stopBroadcast();

        console.log("---");
        console.log("Arcscan ReputationNFT: https://testnet.arcscan.app/address/", address(repNFT));
        console.log("Arcscan ArenaFactory:  https://testnet.arcscan.app/address/", address(factory));
    }
}
