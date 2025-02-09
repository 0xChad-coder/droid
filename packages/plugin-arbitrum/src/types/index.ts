import type { Address, Hash } from "viem";

export type SupportedChain = "arbitrum" | "arbitrumSepolia";
export type StakeAction = "deposit" | "withdraw" | "claim";

// Action parameters
export interface GetBalanceParams {
    chain: SupportedChain;
    address?: Address;
    token: string;
}

export interface TransferParams {
    chain: SupportedChain;
    token?: string;
    amount?: string;
    toAddress: Address;
    data?: `0x${string}`;
}

export interface SwapParams {
    chain: SupportedChain;
    fromToken: string;
    toToken: string;
    amount: string;
    slippage?: number;
}

export interface BridgeParams {
    fromChain: SupportedChain;
    toChain: SupportedChain;
    fromToken?: Address;
    toToken?: Address;
    amount: string;
    toAddress?: Address;
}

export interface StakeParams {
    chain: SupportedChain;
    action: StakeAction;
    amount?: string;
}

export interface FaucetParams {
    token?: string;
    toAddress?: Address;
}

// Action return types
export interface GetBalanceResponse {
    chain: SupportedChain;
    address: Address;
    balance?: { token: string; amount: string };
}

export interface TransferResponse {
    chain: SupportedChain;
    txHash: Hash;
    recipient: Address;
    amount: string;
    token: string;
    data?: `0x${string}`;
}

export interface SwapResponse {
    chain: SupportedChain;
    txHash: Hash;
    fromToken: string;
    toToken: string;
    amount: string;
}

export interface BridgeResponse {
    fromChain: SupportedChain;
    toChain: SupportedChain;
    txHash: Hash;
    recipient: Address;
    fromToken: string;
    toToken: string;
    amount: string;
}

export interface StakeResponse {
    response: string;
}

export interface FaucetResponse {
    token: string;
    recipient: Address;
    txHash: Hash;
}

export interface IDeployERC20Params {
    chain: SupportedChain;
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
}

export interface IDeployERC721Params {
    chain: SupportedChain;
    name: string;
    symbol: string;
    baseURI: string;
}

export interface IDeployERC1155Params {
    chain: SupportedChain;
    name: string;
    baseURI: string;
}

// Contract ABIs
export const L1StandardBridgeAbi = [
    {
        type: "constructor",
        inputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "receive",
        stateMutability: "payable",
    },
    {
        type: "function",
        name: "MESSENGER",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "address",
                internalType: "contract CrossDomainMessenger",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "OTHER_BRIDGE",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "address",
                internalType: "contract StandardBridge",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "bridgeERC20",
        inputs: [
            {
                name: "_localToken",
                type: "address",
                internalType: "address",
            },
            {
                name: "_remoteToken",
                type: "address",
                internalType: "address",
            },
            {
                name: "_amount",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "_minGasLimit",
                type: "uint32",
                internalType: "uint32",
            },
            {
                name: "_extraData",
                type: "bytes",
                internalType: "bytes",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "bridgeERC20To",
        inputs: [
            {
                name: "_localToken",
                type: "address",
                internalType: "address",
            },
            {
                name: "_remoteToken",
                type: "address",
                internalType: "address",
            },
            {
                name: "_to",
                type: "address",
                internalType: "address",
            },
            {
                name: "_amount",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "_minGasLimit",
                type: "uint32",
                internalType: "uint32",
            },
            {
                name: "_extraData",
                type: "bytes",
                internalType: "bytes",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "bridgeETH",
        inputs: [
            {
                name: "_minGasLimit",
                type: "uint32",
                internalType: "uint32",
            },
            {
                name: "_extraData",
                type: "bytes",
                internalType: "bytes",
            },
        ],
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        name: "bridgeETHTo",
        inputs: [
            {
                name: "_to",
                type: "address",
                internalType: "address",
            },
            {
                name: "_minGasLimit",
                type: "uint32",
                internalType: "uint32",
            },
            {
                name: "_extraData",
                type: "bytes",
                internalType: "bytes",
            },
        ],
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        name: "depositERC20",
        inputs: [
            {
                name: "_l1Token",
                type: "address",
                internalType: "address",
            },
            {
                name: "_l2Token",
                type: "address",
                internalType: "address",
            },
            {
                name: "_amount",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "_minGasLimit",
                type: "uint32",
                internalType: "uint32",
            },
            {
                name: "_extraData",
                type: "bytes",
                internalType: "bytes",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "depositERC20To",
        inputs: [
            {
                name: "_l1Token",
                type: "address",
                internalType: "address",
            },
            {
                name: "_l2Token",
                type: "address",
                internalType: "address",
            },
            {
                name: "_to",
                type: "address",
                internalType: "address",
            },
            {
                name: "_amount",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "_minGasLimit",
                type: "uint32",
                internalType: "uint32",
            },
            {
                name: "_extraData",
                type: "bytes",
                internalType: "bytes",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "depositETH",
        inputs: [
            {
                name: "_minGasLimit",
                type: "uint32",
                internalType: "uint32",
            },
            {
                name: "_extraData",
                type: "bytes",
                internalType: "bytes",
            },
        ],
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        name: "depositETHTo",
        inputs: [
            {
                name: "_to",
                type: "address",
                internalType: "address",
            },
            {
                name: "_minGasLimit",
                type: "uint32",
                internalType: "uint32",
            },
            {
                name: "_extraData",
                type: "bytes",
                internalType: "bytes",
            },
        ],
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        name: "deposits",
        inputs: [
            {
                name: "",
                type: "address",
                internalType: "address",
            },
            {
                name: "",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [
            {
                name: "",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "finalizeBridgeERC20",
        inputs: [
            {
                name: "_localToken",
                type: "address",
                internalType: "address",
            },
            {
                name: "_remoteToken",
                type: "address",
                internalType: "address",
            },
            {
                name: "_from",
                type: "address",
                internalType: "address",
            },
            {
                name: "_to",
                type: "address",
                internalType: "address",
            },
            {
                name: "_amount",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "_extraData",
                type: "bytes",
                internalType: "bytes",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "finalizeBridgeETH",
        inputs: [
            {
                name: "_from",
                type: "address",
                internalType: "address",
            },
            {
                name: "_to",
                type: "address",
                internalType: "address",
            },
            {
                name: "_amount",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "_extraData",
                type: "bytes",
                internalType: "bytes",
            },
        ],
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        name: "finalizeERC20Withdrawal",
        inputs: [
            {
                name: "_l1Token",
                type: "address",
                internalType: "address",
            },
            {
                name: "_l2Token",
                type: "address",
                internalType: "address",
            },
            {
                name: "_from",
                type: "address",
                internalType: "address",
            },
            {
                name: "_to",
                type: "address",
                internalType: "address",
            },
            {
                name: "_amount",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "_extraData",
                type: "bytes",
                internalType: "bytes",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "finalizeETHWithdrawal",
        inputs: [
            {
                name: "_from",
                type: "address",
                internalType: "address",
            },
            {
                name: "_to",
                type: "address",
                internalType: "address",
            },
            {
                name: "_amount",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "_extraData",
                type: "bytes",
                internalType: "bytes",
            },
        ],
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        name: "initialize",
        inputs: [
            {
                name: "_messenger",
                type: "address",
                internalType: "contract CrossDomainMessenger",
            },
            {
                name: "_superchainConfig",
                type: "address",
                internalType: "contract SuperchainConfig",
            },
            {
                name: "_systemConfig",
                type: "address",
                internalType: "contract SystemConfig",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "l2TokenBridge",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "address",
                internalType: "address",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "messenger",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "address",
                internalType: "contract CrossDomainMessenger",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "otherBridge",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "address",
                internalType: "contract StandardBridge",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "paused",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "bool",
                internalType: "bool",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "superchainConfig",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "address",
                internalType: "contract SuperchainConfig",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "systemConfig",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "address",
                internalType: "contract SystemConfig",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "version",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "string",
                internalType: "string",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "event",
        name: "ERC20BridgeFinalized",
        inputs: [
            {
                name: "localToken",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "remoteToken",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "from",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "to",
                type: "address",
                indexed: false,
                internalType: "address",
            },
            {
                name: "amount",
                type: "uint256",
                indexed: false,
                internalType: "uint256",
            },
            {
                name: "extraData",
                type: "bytes",
                indexed: false,
                internalType: "bytes",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "ERC20BridgeInitiated",
        inputs: [
            {
                name: "localToken",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "remoteToken",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "from",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "to",
                type: "address",
                indexed: false,
                internalType: "address",
            },
            {
                name: "amount",
                type: "uint256",
                indexed: false,
                internalType: "uint256",
            },
            {
                name: "extraData",
                type: "bytes",
                indexed: false,
                internalType: "bytes",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "ERC20DepositInitiated",
        inputs: [
            {
                name: "l1Token",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "l2Token",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "from",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "to",
                type: "address",
                indexed: false,
                internalType: "address",
            },
            {
                name: "amount",
                type: "uint256",
                indexed: false,
                internalType: "uint256",
            },
            {
                name: "extraData",
                type: "bytes",
                indexed: false,
                internalType: "bytes",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "ERC20WithdrawalFinalized",
        inputs: [
            {
                name: "l1Token",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "l2Token",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "from",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "to",
                type: "address",
                indexed: false,
                internalType: "address",
            },
            {
                name: "amount",
                type: "uint256",
                indexed: false,
                internalType: "uint256",
            },
            {
                name: "extraData",
                type: "bytes",
                indexed: false,
                internalType: "bytes",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "ETHBridgeFinalized",
        inputs: [
            {
                name: "from",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "to",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "amount",
                type: "uint256",
                indexed: false,
                internalType: "uint256",
            },
            {
                name: "extraData",
                type: "bytes",
                indexed: false,
                internalType: "bytes",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "ETHBridgeInitiated",
        inputs: [
            {
                name: "from",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "to",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "amount",
                type: "uint256",
                indexed: false,
                internalType: "uint256",
            },
            {
                name: "extraData",
                type: "bytes",
                indexed: false,
                internalType: "bytes",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "ETHDepositInitiated",
        inputs: [
            {
                name: "from",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "to",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "amount",
                type: "uint256",
                indexed: false,
                internalType: "uint256",
            },
            {
                name: "extraData",
                type: "bytes",
                indexed: false,
                internalType: "bytes",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "ETHWithdrawalFinalized",
        inputs: [
            {
                name: "from",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "to",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "amount",
                type: "uint256",
                indexed: false,
                internalType: "uint256",
            },
            {
                name: "extraData",
                type: "bytes",
                indexed: false,
                internalType: "bytes",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "Initialized",
        inputs: [
            {
                name: "version",
                type: "uint8",
                indexed: false,
                internalType: "uint8",
            },
        ],
        anonymous: false,
    },
] as const;

export const L2StandardBridgeAbi = [
    {
        type: "constructor",
        inputs: [
            {
                name: "_owner",
                type: "address",
                internalType: "address payable",
            },
            {
                name: "_delegationFee",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        stateMutability: "nonpayable",
    },
    {
        name: "AddressEmptyCode",
        type: "error",
        inputs: [{ name: "target", type: "address", internalType: "address" }],
    },
    {
        name: "AddressInsufficientBalance",
        type: "error",
        inputs: [{ name: "account", type: "address", internalType: "address" }],
    },
    { name: "FailedInnerCall", type: "error", inputs: [] },
    {
        name: "OwnableInvalidOwner",
        type: "error",
        inputs: [{ name: "owner", type: "address", internalType: "address" }],
    },
    {
        name: "OwnableUnauthorizedAccount",
        type: "error",
        inputs: [{ name: "account", type: "address", internalType: "address" }],
    },
    {
        name: "SafeERC20FailedOperation",
        type: "error",
        inputs: [{ name: "token", type: "address", internalType: "address" }],
    },
    {
        name: "OwnershipTransferred",
        type: "event",
        inputs: [
            {
                name: "previousOwner",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "newOwner",
                type: "address",
                indexed: true,
                internalType: "address",
            },
        ],
        anonymous: false,
        signature:
            "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0",
    },
    {
        name: "SetDelegationFee",
        type: "event",
        inputs: [
            {
                name: "_delegationFee",
                type: "uint256",
                indexed: false,
                internalType: "uint256",
            },
        ],
        anonymous: false,
        signature:
            "0x0322f3257c2afe5fe8da7ab561f0d3384148487412fe2751678f2188731c0815",
    },
    {
        name: "WithdrawTo",
        type: "event",
        inputs: [
            {
                name: "from",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "l2Token",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "to",
                type: "address",
                indexed: false,
                internalType: "address",
            },
            {
                name: "amount",
                type: "uint256",
                indexed: false,
                internalType: "uint256",
            },
            {
                name: "minGasLimit",
                type: "uint32",
                indexed: false,
                internalType: "uint32",
            },
            {
                name: "extraData",
                type: "bytes",
                indexed: false,
                internalType: "bytes",
            },
        ],
        anonymous: false,
        signature:
            "0x56f66275d9ebc94b7d6895aa0d96a3783550d0183ba106408d387d19f2e877f1",
    },
    {
        name: "L2_STANDARD_BRIDGE",
        type: "function",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "address",
                value: "0x4200000000000000000000000000000000000010",
                internalType: "contract IL2StandardBridge",
            },
        ],
        constant: true,
        signature: "0x21d12763",
        stateMutability: "view",
    },
    {
        name: "L2_STANDARD_BRIDGE_ADDRESS",
        type: "function",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "address",
                value: "0x4200000000000000000000000000000000000010",
                internalType: "address",
            },
        ],
        constant: true,
        signature: "0x2cb7cb06",
        stateMutability: "view",
    },
    {
        name: "delegationFee",
        type: "function",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "uint256",
                value: "2000000000000000",
                internalType: "uint256",
            },
        ],
        constant: true,
        signature: "0xc5f0a58f",
        stateMutability: "view",
    },
    {
        name: "owner",
        type: "function",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "address",
                value: "0xCe4750fDc02A07Eb0d99cA798CD5c170D8F8410A",
                internalType: "address",
            },
        ],
        constant: true,
        signature: "0x8da5cb5b",
        stateMutability: "view",
    },
    {
        name: "renounceOwnership",
        type: "function",
        inputs: [],
        outputs: [],
        signature: "0x715018a6",
        stateMutability: "nonpayable",
    },
    {
        name: "setDelegationFee",
        type: "function",
        inputs: [
            {
                name: "_delegationFee",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [],
        signature: "0x55bfc81c",
        stateMutability: "nonpayable",
    },
    {
        name: "transferOwnership",
        type: "function",
        inputs: [
            { name: "newOwner", type: "address", internalType: "address" },
        ],
        outputs: [],
        signature: "0xf2fde38b",
        stateMutability: "nonpayable",
    },
    {
        name: "withdraw",
        type: "function",
        inputs: [
            { name: "_l2Token", type: "address", internalType: "address" },
            { name: "_amount", type: "uint256", internalType: "uint256" },
            { name: "_minGasLimit", type: "uint32", internalType: "uint32" },
            { name: "_extraData", type: "bytes", internalType: "bytes" },
        ],
        outputs: [],
        payable: true,
        signature: "0x32b7006d",
        stateMutability: "payable",
    },
    {
        name: "withdrawFee",
        type: "function",
        inputs: [
            { name: "_recipient", type: "address", internalType: "address" },
        ],
        outputs: [],
        signature: "0x1ac3ddeb",
        stateMutability: "nonpayable",
    },
    {
        name: "withdrawFeeToL1",
        type: "function",
        inputs: [
            { name: "_recipient", type: "address", internalType: "address" },
            { name: "_minGasLimit", type: "uint32", internalType: "uint32" },
            { name: "_extraData", type: "bytes", internalType: "bytes" },
        ],
        outputs: [],
        signature: "0x244cafe0",
        stateMutability: "nonpayable",
    },
    {
        name: "withdrawTo",
        type: "function",
        inputs: [
            { name: "_l2Token", type: "address", internalType: "address" },
            { name: "_to", type: "address", internalType: "address" },
            { name: "_amount", type: "uint256", internalType: "uint256" },
            { name: "_minGasLimit", type: "uint32", internalType: "uint32" },
            { name: "_extraData", type: "bytes", internalType: "bytes" },
        ],
        outputs: [],
        payable: true,
        signature: "0xa3a79548",
        stateMutability: "payable",
    },
] as const;
