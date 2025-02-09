import { IAgentRuntime, Provider, Memory, State, HandlerCallback, Plugin } from '@elizaos/core';
import { Hash, Address, Chain, PrivateKeyAccount, PublicClient, HttpTransport, Account, WalletClient, Hex } from 'viem';

type SupportedChain = "arbitrum" | "arbitrumSepolia";
type StakeAction = "deposit" | "withdraw" | "claim";
interface GetBalanceParams {
    chain: SupportedChain;
    address?: Address;
    token: string;
}
interface TransferParams {
    chain: SupportedChain;
    token?: string;
    amount?: string;
    toAddress: Address;
    data?: `0x${string}`;
}
interface SwapParams {
    chain: SupportedChain;
    fromToken: string;
    toToken: string;
    amount: string;
    slippage?: number;
}
interface BridgeParams {
    fromChain: SupportedChain;
    toChain: SupportedChain;
    fromToken?: Address;
    toToken?: Address;
    amount: string;
    toAddress?: Address;
}
interface StakeParams {
    chain: SupportedChain;
    action: StakeAction;
    amount?: string;
}
interface FaucetParams {
    token?: string;
    toAddress?: Address;
}
interface GetBalanceResponse {
    chain: SupportedChain;
    address: Address;
    balance?: {
        token: string;
        amount: string;
    };
}
interface TransferResponse {
    chain: SupportedChain;
    txHash: Hash;
    recipient: Address;
    amount: string;
    token: string;
    data?: `0x${string}`;
}
interface SwapResponse {
    chain: SupportedChain;
    txHash: Hash;
    fromToken: string;
    toToken: string;
    amount: string;
}
interface BridgeResponse {
    fromChain: SupportedChain;
    toChain: SupportedChain;
    txHash: Hash;
    recipient: Address;
    fromToken: string;
    toToken: string;
    amount: string;
}
interface StakeResponse {
    response: string;
}
interface FaucetResponse {
    token: string;
    recipient: Address;
    txHash: Hash;
}
interface IDeployERC20Params {
    chain: SupportedChain;
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
}
interface IDeployERC721Params {
    chain: SupportedChain;
    name: string;
    symbol: string;
    baseURI: string;
}
interface IDeployERC1155Params {
    chain: SupportedChain;
    name: string;
    baseURI: string;
}
declare const L1StandardBridgeAbi: readonly [{
    readonly type: "constructor";
    readonly inputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "receive";
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "MESSENGER";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "contract CrossDomainMessenger";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "OTHER_BRIDGE";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "contract StandardBridge";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "bridgeERC20";
    readonly inputs: readonly [{
        readonly name: "_localToken";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_remoteToken";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_amount";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "_minGasLimit";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }, {
        readonly name: "_extraData";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "bridgeERC20To";
    readonly inputs: readonly [{
        readonly name: "_localToken";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_remoteToken";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_to";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_amount";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "_minGasLimit";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }, {
        readonly name: "_extraData";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "bridgeETH";
    readonly inputs: readonly [{
        readonly name: "_minGasLimit";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }, {
        readonly name: "_extraData";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "bridgeETHTo";
    readonly inputs: readonly [{
        readonly name: "_to";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_minGasLimit";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }, {
        readonly name: "_extraData";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "depositERC20";
    readonly inputs: readonly [{
        readonly name: "_l1Token";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_l2Token";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_amount";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "_minGasLimit";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }, {
        readonly name: "_extraData";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "depositERC20To";
    readonly inputs: readonly [{
        readonly name: "_l1Token";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_l2Token";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_to";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_amount";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "_minGasLimit";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }, {
        readonly name: "_extraData";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "depositETH";
    readonly inputs: readonly [{
        readonly name: "_minGasLimit";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }, {
        readonly name: "_extraData";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "depositETHTo";
    readonly inputs: readonly [{
        readonly name: "_to";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_minGasLimit";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }, {
        readonly name: "_extraData";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "deposits";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "finalizeBridgeERC20";
    readonly inputs: readonly [{
        readonly name: "_localToken";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_remoteToken";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_from";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_to";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_amount";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "_extraData";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "finalizeBridgeETH";
    readonly inputs: readonly [{
        readonly name: "_from";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_to";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_amount";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "_extraData";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "finalizeERC20Withdrawal";
    readonly inputs: readonly [{
        readonly name: "_l1Token";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_l2Token";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_from";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_to";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_amount";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "_extraData";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "finalizeETHWithdrawal";
    readonly inputs: readonly [{
        readonly name: "_from";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_to";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_amount";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "_extraData";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "initialize";
    readonly inputs: readonly [{
        readonly name: "_messenger";
        readonly type: "address";
        readonly internalType: "contract CrossDomainMessenger";
    }, {
        readonly name: "_superchainConfig";
        readonly type: "address";
        readonly internalType: "contract SuperchainConfig";
    }, {
        readonly name: "_systemConfig";
        readonly type: "address";
        readonly internalType: "contract SystemConfig";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "l2TokenBridge";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "messenger";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "contract CrossDomainMessenger";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "otherBridge";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "contract StandardBridge";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "paused";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "superchainConfig";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "contract SuperchainConfig";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "systemConfig";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "contract SystemConfig";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "version";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "string";
        readonly internalType: "string";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "event";
    readonly name: "ERC20BridgeFinalized";
    readonly inputs: readonly [{
        readonly name: "localToken";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "remoteToken";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "from";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "to";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "extraData";
        readonly type: "bytes";
        readonly indexed: false;
        readonly internalType: "bytes";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "ERC20BridgeInitiated";
    readonly inputs: readonly [{
        readonly name: "localToken";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "remoteToken";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "from";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "to";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "extraData";
        readonly type: "bytes";
        readonly indexed: false;
        readonly internalType: "bytes";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "ERC20DepositInitiated";
    readonly inputs: readonly [{
        readonly name: "l1Token";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "l2Token";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "from";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "to";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "extraData";
        readonly type: "bytes";
        readonly indexed: false;
        readonly internalType: "bytes";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "ERC20WithdrawalFinalized";
    readonly inputs: readonly [{
        readonly name: "l1Token";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "l2Token";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "from";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "to";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "extraData";
        readonly type: "bytes";
        readonly indexed: false;
        readonly internalType: "bytes";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "ETHBridgeFinalized";
    readonly inputs: readonly [{
        readonly name: "from";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "to";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "extraData";
        readonly type: "bytes";
        readonly indexed: false;
        readonly internalType: "bytes";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "ETHBridgeInitiated";
    readonly inputs: readonly [{
        readonly name: "from";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "to";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "extraData";
        readonly type: "bytes";
        readonly indexed: false;
        readonly internalType: "bytes";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "ETHDepositInitiated";
    readonly inputs: readonly [{
        readonly name: "from";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "to";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "extraData";
        readonly type: "bytes";
        readonly indexed: false;
        readonly internalType: "bytes";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "ETHWithdrawalFinalized";
    readonly inputs: readonly [{
        readonly name: "from";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "to";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "extraData";
        readonly type: "bytes";
        readonly indexed: false;
        readonly internalType: "bytes";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Initialized";
    readonly inputs: readonly [{
        readonly name: "version";
        readonly type: "uint8";
        readonly indexed: false;
        readonly internalType: "uint8";
    }];
    readonly anonymous: false;
}];
declare const L2StandardBridgeAbi: readonly [{
    readonly type: "constructor";
    readonly inputs: readonly [{
        readonly name: "_owner";
        readonly type: "address";
        readonly internalType: "address payable";
    }, {
        readonly name: "_delegationFee";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly name: "AddressEmptyCode";
    readonly type: "error";
    readonly inputs: readonly [{
        readonly name: "target";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly name: "AddressInsufficientBalance";
    readonly type: "error";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly name: "FailedInnerCall";
    readonly type: "error";
    readonly inputs: readonly [];
}, {
    readonly name: "OwnableInvalidOwner";
    readonly type: "error";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly name: "OwnableUnauthorizedAccount";
    readonly type: "error";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly name: "SafeERC20FailedOperation";
    readonly type: "error";
    readonly inputs: readonly [{
        readonly name: "token";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly name: "OwnershipTransferred";
    readonly type: "event";
    readonly inputs: readonly [{
        readonly name: "previousOwner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "newOwner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
    readonly signature: "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0";
}, {
    readonly name: "SetDelegationFee";
    readonly type: "event";
    readonly inputs: readonly [{
        readonly name: "_delegationFee";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
    readonly signature: "0x0322f3257c2afe5fe8da7ab561f0d3384148487412fe2751678f2188731c0815";
}, {
    readonly name: "WithdrawTo";
    readonly type: "event";
    readonly inputs: readonly [{
        readonly name: "from";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "l2Token";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "to";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "minGasLimit";
        readonly type: "uint32";
        readonly indexed: false;
        readonly internalType: "uint32";
    }, {
        readonly name: "extraData";
        readonly type: "bytes";
        readonly indexed: false;
        readonly internalType: "bytes";
    }];
    readonly anonymous: false;
    readonly signature: "0x56f66275d9ebc94b7d6895aa0d96a3783550d0183ba106408d387d19f2e877f1";
}, {
    readonly name: "L2_STANDARD_BRIDGE";
    readonly type: "function";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly value: "0x4200000000000000000000000000000000000010";
        readonly internalType: "contract IL2StandardBridge";
    }];
    readonly constant: true;
    readonly signature: "0x21d12763";
    readonly stateMutability: "view";
}, {
    readonly name: "L2_STANDARD_BRIDGE_ADDRESS";
    readonly type: "function";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly value: "0x4200000000000000000000000000000000000010";
        readonly internalType: "address";
    }];
    readonly constant: true;
    readonly signature: "0x2cb7cb06";
    readonly stateMutability: "view";
}, {
    readonly name: "delegationFee";
    readonly type: "function";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly value: "2000000000000000";
        readonly internalType: "uint256";
    }];
    readonly constant: true;
    readonly signature: "0xc5f0a58f";
    readonly stateMutability: "view";
}, {
    readonly name: "owner";
    readonly type: "function";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly value: "0xCe4750fDc02A07Eb0d99cA798CD5c170D8F8410A";
        readonly internalType: "address";
    }];
    readonly constant: true;
    readonly signature: "0x8da5cb5b";
    readonly stateMutability: "view";
}, {
    readonly name: "renounceOwnership";
    readonly type: "function";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly signature: "0x715018a6";
    readonly stateMutability: "nonpayable";
}, {
    readonly name: "setDelegationFee";
    readonly type: "function";
    readonly inputs: readonly [{
        readonly name: "_delegationFee";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [];
    readonly signature: "0x55bfc81c";
    readonly stateMutability: "nonpayable";
}, {
    readonly name: "transferOwnership";
    readonly type: "function";
    readonly inputs: readonly [{
        readonly name: "newOwner";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly signature: "0xf2fde38b";
    readonly stateMutability: "nonpayable";
}, {
    readonly name: "withdraw";
    readonly type: "function";
    readonly inputs: readonly [{
        readonly name: "_l2Token";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_amount";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "_minGasLimit";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }, {
        readonly name: "_extraData";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly payable: true;
    readonly signature: "0x32b7006d";
    readonly stateMutability: "payable";
}, {
    readonly name: "withdrawFee";
    readonly type: "function";
    readonly inputs: readonly [{
        readonly name: "_recipient";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly signature: "0x1ac3ddeb";
    readonly stateMutability: "nonpayable";
}, {
    readonly name: "withdrawFeeToL1";
    readonly type: "function";
    readonly inputs: readonly [{
        readonly name: "_recipient";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_minGasLimit";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }, {
        readonly name: "_extraData";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly signature: "0x244cafe0";
    readonly stateMutability: "nonpayable";
}, {
    readonly name: "withdrawTo";
    readonly type: "function";
    readonly inputs: readonly [{
        readonly name: "_l2Token";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_to";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_amount";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "_minGasLimit";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }, {
        readonly name: "_extraData";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly payable: true;
    readonly signature: "0xa3a79548";
    readonly stateMutability: "payable";
}];

declare class WalletProvider {
    private currentChain;
    chains: Record<string, Chain>;
    account: PrivateKeyAccount;
    constructor(privateKey: `0x${string}`, chains?: Record<string, Chain>);
    getAccount(): PrivateKeyAccount;
    getAddress(): Address;
    getCurrentChain(): Chain;
    getPublicClient(chainName: SupportedChain): PublicClient<HttpTransport, Chain, Account | undefined>;
    getWalletClient(chainName: SupportedChain): WalletClient;
    getChainConfigs(chainName: SupportedChain): Chain;
    configureLiFiSdk(chainName: SupportedChain): void;
    formatAddress(address: string): Promise<Address>;
    resolveWeb3Name(name: string): Promise<string | null>;
    checkERC20Allowance(chain: SupportedChain, token: Address, owner: Address, spender: Address): Promise<bigint>;
    approveERC20(chain: SupportedChain, token: Address, spender: Address, amount: bigint): Promise<Hex>;
    transfer(chain: SupportedChain, toAddress: Address, amount: bigint, options?: {
        gas?: bigint;
        gasPrice?: bigint;
        data?: Hex;
    }): Promise<Hex>;
    transferERC20(chain: SupportedChain, tokenAddress: Address, toAddress: Address, amount: bigint, options?: {
        gas?: bigint;
        gasPrice?: bigint;
    }): Promise<Hex>;
    getBalance(): Promise<string>;
    getTokenAddress(chainName: SupportedChain, tokenSymbol: string): Promise<string>;
    addChain(chain: Record<string, Chain>): void;
    switchChain(chainName: SupportedChain, customRpcUrl?: string): void;
    private setAccount;
    private setChains;
    private setCurrentChain;
    private createHttpTransport;
    static genChainFromName(chainName: string, customRpcUrl?: string | null): Chain;
}
declare const initWalletProvider: (runtime: IAgentRuntime) => WalletProvider;
declare const arbitrumWalletProvider: Provider;

declare const transferTemplate = "Given the recent messages and wallet information below:\n\n{{recentMessages}}\n\n{{walletInfo}}\n\nExtract the following information about the requested transfer:\n- Chain to execute on. Must be one of [\"arbitrum\", \"arbitrumSepolia\"]. Default is \"arbitrum\".\n- Token symbol or address(string starting with \"0x\"). Optional.\n- Amount to transfer. Optional. Must be a string representing the amount in ether (only number without coin symbol, e.g., \"0.1\").\n- Recipient address. Must be a valid Ethereum address starting with \"0x\" or a web3 domain name.\n- Data. Optional, data to be included in the transaction.\nIf any field is not provided, use the default value. If no default value is specified, use null.\n\nRespond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined:\n\n```json\n{\n    \"chain\": SUPPORTED_CHAINS,\n    \"token\": string | null,\n    \"amount\": string | null,\n    \"toAddress\": string,\n    \"data\": string | null\n}\n```\n";
declare const swapTemplate = "Given the recent messages and wallet information below:\n\n{{recentMessages}}\n\n{{walletInfo}}\n\nExtract the following information about the requested token swap:\n- Chain to execute on. Must be one of [\"arbitrum\", \"arbitrumSepolia\"]. Default is \"arbitrum\".\n- Input token symbol or address(string starting with \"0x\").\n- Output token symbol or address(string starting with \"0x\").\n- Amount to swap. Must be a string representing the amount in ether (only number without coin symbol, e.g., \"0.1\").\n- Slippage. Optional, expressed as decimal proportion, 0.03 represents 3%.\nIf any field is not provided, use the default value. If no default value is specified, use null.\n\nRespond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined:\n\n```json\n{\n    \"chain\": SUPPORTED_CHAINS,\n    \"inputToken\": string | null,\n    \"outputToken\": string | null,\n    \"amount\": string | null,\n    \"slippage\": number | null\n}\n```\n";

declare class SwapAction {
    private walletProvider;
    constructor(walletProvider: WalletProvider);
    swap(params: SwapParams): Promise<SwapResponse>;
    validateAndNormalizeParams(params: SwapParams): void;
}
declare const swapAction: {
    name: string;
    description: string;
    handler: (runtime: IAgentRuntime, message: Memory, state: State, _options: Record<string, unknown>, callback?: HandlerCallback) => Promise<boolean>;
    template: string;
    validate: (runtime: IAgentRuntime) => Promise<boolean>;
    examples: (({
        user: string;
        content: {
            text: string;
            action?: undefined;
            content?: undefined;
        };
    } | {
        user: string;
        content: {
            text: string;
            action: string;
            content: {
                chain: string;
                inputToken: string;
                outputToken: string;
                amount: string;
                slippage: undefined;
            };
        };
    })[] | ({
        user: string;
        content: {
            text: string;
            action?: undefined;
            content?: undefined;
        };
    } | {
        user: string;
        content: {
            text: string;
            action: string;
            content: {
                chain: string;
                inputToken: string;
                outputToken: string;
                amount: string;
                slippage: number;
            };
        };
    })[])[];
    similes: string[];
};

declare class TransferAction {
    private walletProvider;
    private readonly TRANSFER_GAS;
    private readonly DEFAULT_GAS_PRICE;
    constructor(walletProvider: WalletProvider);
    transfer(params: TransferParams): Promise<TransferResponse>;
    validateAndNormalizeParams(params: TransferParams): Promise<void>;
}
declare const transferAction: {
    name: string;
    description: string;
    handler: (runtime: IAgentRuntime, message: Memory, state: State, _options: Record<string, unknown>, callback?: HandlerCallback) => Promise<boolean>;
    template: string;
    validate: (runtime: IAgentRuntime) => Promise<boolean>;
    examples: ({
        user: string;
        content: {
            text: string;
            action?: undefined;
            content?: undefined;
        };
    } | {
        user: string;
        content: {
            text: string;
            action: string;
            content: {
                chain: string;
                token: string;
                amount: string;
                toAddress: string;
            };
        };
    })[][];
    similes: string[];
};

declare const arbitrumPlugin: Plugin;

export { type BridgeParams, type BridgeResponse, type FaucetParams, type FaucetResponse, type GetBalanceParams, type GetBalanceResponse, type IDeployERC1155Params, type IDeployERC20Params, type IDeployERC721Params, L1StandardBridgeAbi, L2StandardBridgeAbi, type StakeAction, type StakeParams, type StakeResponse, type SupportedChain, SwapAction, type SwapParams, type SwapResponse, TransferAction, type TransferParams, type TransferResponse, WalletProvider, arbitrumPlugin, arbitrumWalletProvider, arbitrumPlugin as default, initWalletProvider, swapAction, swapTemplate, transferAction, transferTemplate };
