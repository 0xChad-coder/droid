export * from "./actions/swap";
export * from "./actions/transfer";
export * from "./providers/wallet";
export * from "./types";

import type { Plugin } from "@elizaos/core";
import { swapAction } from "./actions/swap";
import { transferAction } from "./actions/transfer";
import { arbitrumWalletProvider } from "./providers/wallet";
import { getBalanceAction } from "./actions/getBalance";
// import { bridgeAction } from "./actions/bridge";
// import { stakeAction } from "./actions/stake";
// import { faucetAction } from "./actions/faucet";
import { deployAction } from "./actions/deploy";

export const arbitrumPlugin: Plugin = {
    name: "arbitrum",
    description:
        "Arbitrum integration plugin supporting transfers, swaps, staking, bridging, and token deployments",
    providers: [arbitrumWalletProvider],
    evaluators: [],
    services: [],
    actions: [
        getBalanceAction,
        transferAction,
        swapAction,
        // bridgeAction,
        // stakeAction,
        // faucetAction,
        deployAction,
    ],
};

export default arbitrumPlugin;
