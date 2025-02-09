import { describe, it, expect, beforeAll } from "vitest";
import {
    Account,
    generatePrivateKey,
    privateKeyToAccount,
} from "viem/accounts";
import { arbitrum, arbitrumSepolia } from "viem/chains";

import { WalletProvider } from "../providers/wallet";

const customRpcUrls = {
    arbitrum: "custom-rpc.arbitrum.io",
    arbitrumSepolia: "custom-rpc.arbitrumSepolia.io",
};

describe("Wallet provider", () => {
    let pk: `0x${string}`;
    let account: Account;
    let walletProvider: WalletProvider;

    beforeAll(() => {
        pk = generatePrivateKey();
        account = privateKeyToAccount(pk);
        walletProvider = new WalletProvider(pk);
    });

    describe("Constructor", () => {
        it("get address", () => {
            const expectedAddress = account.address;

            expect(walletProvider.getAddress()).toEqual(expectedAddress);
        });
        it("get current chain", () => {
            expect(walletProvider.getCurrentChain().id).toEqual(arbitrum.id);
        });
        it("get chain configs", () => {
            expect(walletProvider.getChainConfigs("arbitrum").id).toEqual(arbitrum.id);
            expect(walletProvider.getChainConfigs("arbitrumSepolia").id).toEqual(
                arbitrumSepolia.id
            );
        });
    });
    describe("Clients", () => {
        it("generates public client", () => {
            const client = walletProvider.getPublicClient("arbitrum");
            expect(client.chain.id).toEqual(arbitrum.id);
            expect(client.transport.url).toEqual(arbitrum.rpcUrls.default.http[0]);
        });
        it("generates public client with custom rpcurl", () => {
            const chain = WalletProvider.genChainFromName(
                "arbitrum",
                customRpcUrls.arbitrum
            );
            const wp = new WalletProvider(pk, { ["arbitrum"]: chain });

            const client = wp.getPublicClient("arbitrum");
            expect(client.chain.id).toEqual(arbitrum.id);
            expect(client.chain.rpcUrls.default.http[0]).toEqual(
                arbitrum.rpcUrls.default.http[0]
            );
            expect(client.chain.rpcUrls.custom.http[0]).toEqual(
                customRpcUrls.arbitrum
            );
            expect(client.transport.url).toEqual(customRpcUrls.arbitrum);
        });
        it("generates wallet client", () => {
            const expectedAddress = account.address;

            const client = walletProvider.getWalletClient("arbitrum");

            expect(client.account?.address).toEqual(expectedAddress);
            expect(client.transport.url).toEqual(arbitrum.rpcUrls.default.http[0]);
        });
        it("generates wallet client with custom rpcurl", () => {
            const account = privateKeyToAccount(pk);
            const expectedAddress = account.address;
            const chain = WalletProvider.genChainFromName(
                "arbitrum",
                customRpcUrls.arbitrum
            );
            const wp = new WalletProvider(pk, { ["arbitrum"]: chain });

            const client = wp.getWalletClient("arbitrum");

            expect(client.account?.address).toEqual(expectedAddress);
            expect(client.chain?.id).toEqual(arbitrum.id);
            expect(client.chain?.rpcUrls.default.http[0]).toEqual(
                arbitrum.rpcUrls.default.http[0]
            );
            expect(client.chain?.rpcUrls.custom.http[0]).toEqual(
                customRpcUrls.arbitrum
            );
            expect(client.transport.url).toEqual(customRpcUrls.arbitrum);
        });
    });
});
