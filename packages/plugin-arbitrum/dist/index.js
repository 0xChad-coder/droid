// src/actions/swap.ts
import {
  composeContext,
  elizaLogger,
  generateObjectDeprecated,
  ModelClass
} from "@elizaos/core";
import { executeRoute, getRoutes } from "@lifi/sdk";
import { parseEther } from "viem";

// src/providers/wallet.ts
import { EVM, createConfig, getToken } from "@lifi/sdk";
import {
  createPublicClient,
  createWalletClient,
  formatUnits,
  http,
  erc20Abi
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as viemChains from "viem/chains";
import { createWeb3Name } from "@web3-name-sdk/core";
var WalletProvider = class _WalletProvider {
  currentChain = "arbitrum";
  chains = { arbitrum: viemChains.arbitrum };
  account;
  constructor(privateKey, chains) {
    this.setAccount(privateKey);
    this.setChains(chains);
    if (chains && Object.keys(chains).length > 0) {
      this.setCurrentChain(Object.keys(chains)[0]);
    }
  }
  getAccount() {
    return this.account;
  }
  getAddress() {
    return this.account.address;
  }
  getCurrentChain() {
    return this.chains[this.currentChain];
  }
  getPublicClient(chainName) {
    const transport = this.createHttpTransport(chainName);
    const publicClient = createPublicClient({
      chain: this.chains[chainName],
      transport
    });
    return publicClient;
  }
  getWalletClient(chainName) {
    const transport = this.createHttpTransport(chainName);
    const walletClient = createWalletClient({
      chain: this.chains[chainName],
      transport,
      account: this.account
    });
    return walletClient;
  }
  getChainConfigs(chainName) {
    const chain = viemChains[chainName];
    if (!chain?.id) {
      throw new Error("Invalid chain name");
    }
    return chain;
  }
  configureLiFiSdk(chainName) {
    const chains = Object.values(this.chains);
    const walletClient = this.getWalletClient(chainName);
    createConfig({
      integrator: "eliza",
      providers: [
        EVM({
          getWalletClient: async () => walletClient,
          switchChain: async (chainId) => createWalletClient({
            account: this.account,
            chain: chains.find(
              (chain) => chain.id === chainId
            ),
            transport: http()
          })
        })
      ]
    });
  }
  async formatAddress(address) {
    if (!address || address.length === 0) {
      throw new Error("Empty address");
    }
    if (address.startsWith("0x") && address.length === 42) {
      return address;
    }
    const resolvedAddress = await this.resolveWeb3Name(address);
    if (resolvedAddress) {
      return resolvedAddress;
    }
    throw new Error("Invalid address");
  }
  async resolveWeb3Name(name) {
    const nameService = createWeb3Name();
    return await nameService.getAddress(name);
  }
  async checkERC20Allowance(chain, token, owner, spender) {
    const publicClient = this.getPublicClient(chain);
    return await publicClient.readContract({
      address: token,
      abi: erc20Abi,
      functionName: "allowance",
      args: [owner, spender]
    });
  }
  async approveERC20(chain, token, spender, amount) {
    const publicClient = this.getPublicClient(chain);
    const walletClient = this.getWalletClient(chain);
    const { request } = await publicClient.simulateContract({
      account: this.account,
      address: token,
      abi: erc20Abi,
      functionName: "approve",
      args: [spender, amount]
    });
    return await walletClient.writeContract(request);
  }
  async transfer(chain, toAddress, amount, options) {
    const walletClient = this.getWalletClient(chain);
    return await walletClient.sendTransaction({
      account: this.account,
      to: toAddress,
      value: amount,
      chain: this.getChainConfigs(chain),
      ...options
    });
  }
  async transferERC20(chain, tokenAddress, toAddress, amount, options) {
    const publicClient = this.getPublicClient(chain);
    const walletClient = this.getWalletClient(chain);
    const { request } = await publicClient.simulateContract({
      account: this.account,
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "transfer",
      args: [toAddress, amount],
      ...options
    });
    return await walletClient.writeContract(request);
  }
  async getBalance() {
    const client = this.getPublicClient(this.currentChain);
    const balance = await client.getBalance({
      address: this.account.address
    });
    return formatUnits(balance, 18);
  }
  async getTokenAddress(chainName, tokenSymbol) {
    const token = await getToken(
      this.getChainConfigs(chainName).id,
      tokenSymbol
    );
    return token.address;
  }
  addChain(chain) {
    this.setChains(chain);
  }
  switchChain(chainName, customRpcUrl) {
    if (!this.chains[chainName]) {
      const chain = _WalletProvider.genChainFromName(
        chainName,
        customRpcUrl
      );
      this.addChain({ [chainName]: chain });
    }
    this.setCurrentChain(chainName);
  }
  setAccount = (pk) => {
    this.account = privateKeyToAccount(pk);
  };
  setChains = (chains) => {
    if (!chains) {
      return;
    }
    for (const chain of Object.keys(chains)) {
      this.chains[chain] = chains[chain];
    }
  };
  setCurrentChain = (chain) => {
    this.currentChain = chain;
  };
  createHttpTransport = (chainName) => {
    const chain = this.chains[chainName];
    if (chain.rpcUrls.custom) {
      return http(chain.rpcUrls.custom.http[0]);
    }
    return http(chain.rpcUrls.default.http[0]);
  };
  static genChainFromName(chainName, customRpcUrl) {
    const baseChain = viemChains[chainName];
    if (!baseChain?.id) {
      throw new Error("Invalid chain name");
    }
    const viemChain = customRpcUrl ? {
      ...baseChain,
      rpcUrls: {
        ...baseChain.rpcUrls,
        custom: {
          http: [customRpcUrl]
        }
      }
    } : baseChain;
    return viemChain;
  }
};
var genChainsFromRuntime = (runtime) => {
  const chainNames = ["arbitrum", "arbitrumSepolia"];
  const chains = {};
  for (const chainName of chainNames) {
    const chain = WalletProvider.genChainFromName(chainName);
    chains[chainName] = chain;
  }
  const mainnet_rpcurl = runtime.getSetting("ARBITRUM_PROVIDER_URL");
  if (mainnet_rpcurl) {
    const chain = WalletProvider.genChainFromName("arbitrum", mainnet_rpcurl);
    chains["arbitrum"] = chain;
  }
  const testnet_rpcurl = runtime.getSetting("ARBITRUM_TESTNET_PROVIDER_URL");
  if (testnet_rpcurl) {
    const chain = WalletProvider.genChainFromName("arbitrumSepolia", testnet_rpcurl);
    chains["arbitrumSepolia"] = chain;
  }
  return chains;
};
var initWalletProvider = (runtime) => {
  const privateKey = runtime.getSetting("ARBITRUM_PRIVATE_KEY");
  if (!privateKey) {
    throw new Error("ARBITRUM_PRIVATE_KEY is missing");
  }
  const chains = genChainsFromRuntime(runtime);
  return new WalletProvider(privateKey, chains);
};
var arbitrumWalletProvider = {
  async get(runtime, _message, _state) {
    try {
      const walletProvider = initWalletProvider(runtime);
      const address = walletProvider.getAddress();
      const balance = await walletProvider.getBalance();
      const chain = walletProvider.getCurrentChain();
      return `Arbitrum chain Wallet Address: ${address}
Balance: ${balance} ${chain.nativeCurrency.symbol}
Chain ID: ${chain.id}, Name: ${chain.name}`;
    } catch (error) {
      console.error("Error in Arbitrum chain wallet provider:", error);
      return null;
    }
  }
};

// src/templates/index.ts
var getBalanceTemplate = `Given the recent messages and wallet information below:

{{recentMessages}}

{{walletInfo}}

Extract the following information about the requested check balance:
- Chain to execute on. Must be one of ["arbitrum", "arbitrumSepolia"]. Default is "arbitrum".
- Address to check balance for. Optional, must be a valid Ethereum address starting with "0x" or a web3 domain name. If not provided, use the Arbitrum chain Wallet Address.
- Token symbol or address. Could be a token symbol or address. If the address is provided, it must be a valid Ethereum address starting with "0x". Default is "Arbitrum".
If any field is not provided, use the default value. If no default value is specified, use null.

Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined:

\`\`\`json
{
    "chain": SUPPORTED_CHAINS,
    "address": string | null,
    "token": string
}
\`\`\`
`;
var transferTemplate = `Given the recent messages and wallet information below:

{{recentMessages}}

{{walletInfo}}

Extract the following information about the requested transfer:
- Chain to execute on. Must be one of ["arbitrum", "arbitrumSepolia"]. Default is "arbitrum".
- Token symbol or address(string starting with "0x"). Optional.
- Amount to transfer. Optional. Must be a string representing the amount in ether (only number without coin symbol, e.g., "0.1").
- Recipient address. Must be a valid Ethereum address starting with "0x" or a web3 domain name.
- Data. Optional, data to be included in the transaction.
If any field is not provided, use the default value. If no default value is specified, use null.

Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined:

\`\`\`json
{
    "chain": SUPPORTED_CHAINS,
    "token": string | null,
    "amount": string | null,
    "toAddress": string,
    "data": string | null
}
\`\`\`
`;
var swapTemplate = `Given the recent messages and wallet information below:

{{recentMessages}}

{{walletInfo}}

Extract the following information about the requested token swap:
- Chain to execute on. Must be one of ["arbitrum", "arbitrumSepolia"]. Default is "arbitrum".
- Input token symbol or address(string starting with "0x").
- Output token symbol or address(string starting with "0x").
- Amount to swap. Must be a string representing the amount in ether (only number without coin symbol, e.g., "0.1").
- Slippage. Optional, expressed as decimal proportion, 0.03 represents 3%.
If any field is not provided, use the default value. If no default value is specified, use null.

Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined:

\`\`\`json
{
    "chain": SUPPORTED_CHAINS,
    "inputToken": string | null,
    "outputToken": string | null,
    "amount": string | null,
    "slippage": number | null
}
\`\`\`
`;
var ercContractTemplate = `Given the recent messages and wallet information below:

{{recentMessages}}

{{walletInfo}}

When user wants to deploy any type of token contract (ERC20/721/1155), this will trigger the DEPLOY_TOKEN action.

Extract the following details for deploying a token contract:
- Chain to execute on. Must be one of ["arbitrum", "arbitrumSepolia"]. Default is "arbitrum".
- contractType: The type of token contract to deploy
  - For ERC20: Extract name, symbol, decimals, totalSupply
  - For ERC721: Extract name, symbol, baseURI
  - For ERC1155: Extract name, baseURI
- name: The name of the token.
- symbol: The token symbol (only for ERC20/721).
- decimals: Token decimals (only for ERC20). Default is 18.
- totalSupply: Total supply with decimals (only for ERC20). Default is "1000000000000000000".
- baseURI: Base URI for token metadata (only for ERC721/1155).
If any field is not provided, use the default value. If no default value is provided, use empty string.

Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined:

\`\`\`json
{
    "chain": SUPPORTED_CHAINS,
    "contractType": "ERC20" | "ERC721" | "ERC1155",
    "name": string,
    "symbol": string | null,
    "decimals": number | null,
    "totalSupply": string | null,
    "baseURI": string | null
}
\`\`\`
`;

// src/actions/swap.ts
var SwapAction = class {
  constructor(walletProvider) {
    this.walletProvider = walletProvider;
  }
  async swap(params) {
    elizaLogger.debug("Swap params:", params);
    this.validateAndNormalizeParams(params);
    elizaLogger.debug("Normalized swap params:", params);
    const fromAddress = this.walletProvider.getAddress();
    const chainId = this.walletProvider.getChainConfigs(params.chain).id;
    this.walletProvider.configureLiFiSdk(params.chain);
    const resp = {
      chain: params.chain,
      txHash: "0x",
      fromToken: params.fromToken,
      toToken: params.toToken,
      amount: params.amount
    };
    const routes = await getRoutes({
      fromChainId: chainId,
      toChainId: chainId,
      fromTokenAddress: params.fromToken,
      toTokenAddress: params.toToken,
      fromAmount: parseEther(params.amount).toString(),
      fromAddress,
      options: {
        slippage: params.slippage,
        order: "RECOMMENDED"
      }
    });
    if (!routes.routes.length) throw new Error("No routes found");
    const execution = await executeRoute(routes.routes[0]);
    const process = execution.steps[0]?.execution?.process[execution.steps[0]?.execution?.process.length - 1];
    if (!process?.status || process.status === "FAILED") {
      throw new Error("Transaction failed");
    }
    resp.txHash = process.txHash;
    return resp;
  }
  validateAndNormalizeParams(params) {
    if (params.chain !== "arbitrum") {
      throw new Error("Only Arbitrum mainnet is supported");
    }
  }
};
var swapAction = {
  name: "swap",
  description: "Swap tokens on the same chain",
  handler: async (runtime, message, state, _options, callback) => {
    elizaLogger.log("Starting swap action...");
    let currentState = state;
    if (!currentState) {
      currentState = await runtime.composeState(message);
    } else {
      currentState = await runtime.updateRecentMessageState(currentState);
    }
    state.walletInfo = await arbitrumWalletProvider.get(
      runtime,
      message,
      currentState
    );
    const swapContext = composeContext({
      state: currentState,
      template: swapTemplate
    });
    const content = await generateObjectDeprecated({
      runtime,
      context: swapContext,
      modelClass: ModelClass.LARGE
    });
    const walletProvider = initWalletProvider(runtime);
    const action = new SwapAction(walletProvider);
    const swapOptions = {
      chain: content.chain,
      fromToken: content.inputToken,
      toToken: content.outputToken,
      amount: content.amount,
      slippage: content.slippage
    };
    try {
      const swapResp = await action.swap(swapOptions);
      callback?.({
        text: `Successfully swap ${swapResp.amount} ${swapResp.fromToken} tokens to ${swapResp.toToken}
Transaction Hash: ${swapResp.txHash}`,
        content: { ...swapResp }
      });
      return true;
    } catch (error) {
      elizaLogger.error("Error during swap:", error.message);
      callback?.({
        text: `Swap failed: ${error.message}`,
        content: { error: error.message }
      });
      return false;
    }
  },
  template: swapTemplate,
  validate: async (runtime) => {
    const privateKey = runtime.getSetting("ARBITRUM_PRIVATE_KEY");
    return typeof privateKey === "string" && privateKey.startsWith("0x");
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Swap 1 ETH for USDC on Arbitrum"
        }
      },
      {
        user: "{{agent}}",
        content: {
          text: "I'll help you swap 1 ETH for USDC on Arbitrum",
          action: "SWAP",
          content: {
            chain: "arbitrum",
            inputToken: "ETH",
            outputToken: "USDC",
            amount: "1",
            slippage: void 0
          }
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Buy some token of 0x1234 using 1 USDC on Arbitrum. The slippage should be no more than 5%"
        }
      },
      {
        user: "{{agent}}",
        content: {
          text: "I'll help you swap 1 USDC for token 0x1234 on Arbitrum",
          action: "SWAP",
          content: {
            chain: "arbitrum",
            inputToken: "USDC",
            outputToken: "0x1234",
            amount: "1",
            slippage: 0.05
          }
        }
      }
    ]
  ],
  similes: ["SWAP", "TOKEN_SWAP", "EXCHANGE_TOKENS", "TRADE_TOKENS"]
};

// src/actions/transfer.ts
import {
  composeContext as composeContext2,
  elizaLogger as elizaLogger2,
  generateObjectDeprecated as generateObjectDeprecated2,
  ModelClass as ModelClass2
} from "@elizaos/core";
import {
  formatEther,
  formatUnits as formatUnits2,
  parseEther as parseEther2,
  parseUnits,
  erc20Abi as erc20Abi2
} from "viem";
var TransferAction = class {
  // 3 Gwei
  constructor(walletProvider) {
    this.walletProvider = walletProvider;
  }
  TRANSFER_GAS = 21000n;
  DEFAULT_GAS_PRICE = 3000000000n;
  async transfer(params) {
    elizaLogger2.debug("Transfer params:", params);
    this.validateAndNormalizeParams(params);
    elizaLogger2.debug("Normalized transfer params:", params);
    const fromAddress = this.walletProvider.getAddress();
    this.walletProvider.switchChain(params.chain);
    const nativeToken = this.walletProvider.chains[params.chain].nativeCurrency.symbol;
    const resp = {
      chain: params.chain,
      txHash: "0x",
      recipient: params.toAddress,
      amount: "",
      token: params.token ?? nativeToken
    };
    if (!params.token || params.token === nativeToken) {
      const options = {
        data: params.data
      };
      let value;
      if (!params.amount) {
        const publicClient2 = this.walletProvider.getPublicClient(
          params.chain
        );
        const balance = await publicClient2.getBalance({
          address: fromAddress
        });
        value = balance - this.DEFAULT_GAS_PRICE * 21000n;
        options.gas = this.TRANSFER_GAS;
        options.gasPrice = this.DEFAULT_GAS_PRICE;
      } else {
        value = parseEther2(params.amount);
      }
      resp.amount = formatEther(value);
      resp.txHash = await this.walletProvider.transfer(
        params.chain,
        params.toAddress,
        value,
        options
      );
    } else {
      let tokenAddress = params.token;
      if (!params.token.startsWith("0x")) {
        tokenAddress = await this.walletProvider.getTokenAddress(
          params.chain,
          params.token
        );
      }
      const publicClient2 = this.walletProvider.getPublicClient(
        params.chain
      );
      const decimals = await publicClient2.readContract({
        address: tokenAddress,
        abi: erc20Abi2,
        functionName: "decimals"
      });
      let value;
      if (!params.amount) {
        value = await publicClient2.readContract({
          address: tokenAddress,
          abi: erc20Abi2,
          functionName: "balanceOf",
          args: [fromAddress]
        });
      } else {
        value = parseUnits(params.amount, decimals);
      }
      resp.amount = formatUnits2(value, decimals);
      resp.txHash = await this.walletProvider.transferERC20(
        params.chain,
        tokenAddress,
        params.toAddress,
        value
      );
    }
    if (!resp.txHash || resp.txHash === "0x") {
      throw new Error("Get transaction hash failed");
    }
    const publicClient = this.walletProvider.getPublicClient(params.chain);
    await publicClient.waitForTransactionReceipt({
      hash: resp.txHash
    });
    return resp;
  }
  async validateAndNormalizeParams(params) {
    if (!params.toAddress) {
      throw new Error("To address is required");
    }
    params.toAddress = await this.walletProvider.formatAddress(
      params.toAddress
    );
  }
};
var transferAction = {
  name: "transfer",
  description: "Transfer tokens between addresses on the same chain",
  handler: async (runtime, message, state, _options, callback) => {
    elizaLogger2.log("Starting transfer action...");
    if (!(message.content.source === "direct")) {
      callback?.({
        text: "I can't do that for you.",
        content: { error: "Transfer not allowed" }
      });
      return false;
    }
    let currentState = state;
    if (!currentState) {
      currentState = await runtime.composeState(message);
    } else {
      currentState = await runtime.updateRecentMessageState(currentState);
    }
    state.walletInfo = await arbitrumWalletProvider.get(
      runtime,
      message,
      currentState
    );
    const transferContext = composeContext2({
      state: currentState,
      template: transferTemplate
    });
    const content = await generateObjectDeprecated2({
      runtime,
      context: transferContext,
      modelClass: ModelClass2.LARGE
    });
    const walletProvider = initWalletProvider(runtime);
    const action = new TransferAction(walletProvider);
    const paramOptions = {
      chain: content.chain,
      token: content.token,
      amount: content.amount,
      toAddress: content.toAddress,
      data: content.data
    };
    try {
      const transferResp = await action.transfer(paramOptions);
      callback?.({
        text: `Successfully transferred ${transferResp.amount} ${transferResp.token} to ${transferResp.recipient}
Transaction Hash: ${transferResp.txHash}`,
        content: { ...transferResp }
      });
      return true;
    } catch (error) {
      elizaLogger2.error("Error during transfer:", error.message);
      callback?.({
        text: `Transfer failed: ${error.message}`,
        content: { error: error.message }
      });
      return false;
    }
  },
  template: transferTemplate,
  validate: async (runtime) => {
    const privateKey = runtime.getSetting("ARBITRUM_PRIVATE_KEY");
    return typeof privateKey === "string" && privateKey.startsWith("0x");
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Transfer 1 ETH to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
        }
      },
      {
        user: "{{agent}}",
        content: {
          text: "I'll help you transfer 1 ETH to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e on Arbitrum",
          action: "TRANSFER",
          content: {
            chain: "arbitrum",
            token: "ETH",
            amount: "1",
            toAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
          }
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Transfer 1 ETH to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e on Arbitrum Sepolia"
        }
      },
      {
        user: "{{agent}}",
        content: {
          text: "I'll help you transfer 1 ETH to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e on Arbitrum Sepolia",
          action: "TRANSFER",
          content: {
            chain: "arbitrumSepolia",
            token: "ETH",
            amount: "1",
            toAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
          }
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Transfer 1 token of 0x1234 to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
        }
      },
      {
        user: "{{agent}}",
        content: {
          text: "I'll help you transfer 1 token of 0x1234 to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e on Arbitrum",
          action: "TRANSFER",
          content: {
            chain: "arbitrum",
            token: "0x1234",
            amount: "1",
            toAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
          }
        }
      }
    ]
  ],
  similes: ["TRANSFER", "SEND_TOKENS", "TOKEN_TRANSFER", "MOVE_TOKENS"]
};

// src/types/index.ts
var L1StandardBridgeAbi = [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "receive",
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "MESSENGER",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract CrossDomainMessenger"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "OTHER_BRIDGE",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract StandardBridge"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "bridgeERC20",
    inputs: [
      {
        name: "_localToken",
        type: "address",
        internalType: "address"
      },
      {
        name: "_remoteToken",
        type: "address",
        internalType: "address"
      },
      {
        name: "_amount",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "_minGasLimit",
        type: "uint32",
        internalType: "uint32"
      },
      {
        name: "_extraData",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "bridgeERC20To",
    inputs: [
      {
        name: "_localToken",
        type: "address",
        internalType: "address"
      },
      {
        name: "_remoteToken",
        type: "address",
        internalType: "address"
      },
      {
        name: "_to",
        type: "address",
        internalType: "address"
      },
      {
        name: "_amount",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "_minGasLimit",
        type: "uint32",
        internalType: "uint32"
      },
      {
        name: "_extraData",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "bridgeETH",
    inputs: [
      {
        name: "_minGasLimit",
        type: "uint32",
        internalType: "uint32"
      },
      {
        name: "_extraData",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "bridgeETHTo",
    inputs: [
      {
        name: "_to",
        type: "address",
        internalType: "address"
      },
      {
        name: "_minGasLimit",
        type: "uint32",
        internalType: "uint32"
      },
      {
        name: "_extraData",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "depositERC20",
    inputs: [
      {
        name: "_l1Token",
        type: "address",
        internalType: "address"
      },
      {
        name: "_l2Token",
        type: "address",
        internalType: "address"
      },
      {
        name: "_amount",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "_minGasLimit",
        type: "uint32",
        internalType: "uint32"
      },
      {
        name: "_extraData",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "depositERC20To",
    inputs: [
      {
        name: "_l1Token",
        type: "address",
        internalType: "address"
      },
      {
        name: "_l2Token",
        type: "address",
        internalType: "address"
      },
      {
        name: "_to",
        type: "address",
        internalType: "address"
      },
      {
        name: "_amount",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "_minGasLimit",
        type: "uint32",
        internalType: "uint32"
      },
      {
        name: "_extraData",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "depositETH",
    inputs: [
      {
        name: "_minGasLimit",
        type: "uint32",
        internalType: "uint32"
      },
      {
        name: "_extraData",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "depositETHTo",
    inputs: [
      {
        name: "_to",
        type: "address",
        internalType: "address"
      },
      {
        name: "_minGasLimit",
        type: "uint32",
        internalType: "uint32"
      },
      {
        name: "_extraData",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "deposits",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      },
      {
        name: "",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "finalizeBridgeERC20",
    inputs: [
      {
        name: "_localToken",
        type: "address",
        internalType: "address"
      },
      {
        name: "_remoteToken",
        type: "address",
        internalType: "address"
      },
      {
        name: "_from",
        type: "address",
        internalType: "address"
      },
      {
        name: "_to",
        type: "address",
        internalType: "address"
      },
      {
        name: "_amount",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "_extraData",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "finalizeBridgeETH",
    inputs: [
      {
        name: "_from",
        type: "address",
        internalType: "address"
      },
      {
        name: "_to",
        type: "address",
        internalType: "address"
      },
      {
        name: "_amount",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "_extraData",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "finalizeERC20Withdrawal",
    inputs: [
      {
        name: "_l1Token",
        type: "address",
        internalType: "address"
      },
      {
        name: "_l2Token",
        type: "address",
        internalType: "address"
      },
      {
        name: "_from",
        type: "address",
        internalType: "address"
      },
      {
        name: "_to",
        type: "address",
        internalType: "address"
      },
      {
        name: "_amount",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "_extraData",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "finalizeETHWithdrawal",
    inputs: [
      {
        name: "_from",
        type: "address",
        internalType: "address"
      },
      {
        name: "_to",
        type: "address",
        internalType: "address"
      },
      {
        name: "_amount",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "_extraData",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "initialize",
    inputs: [
      {
        name: "_messenger",
        type: "address",
        internalType: "contract CrossDomainMessenger"
      },
      {
        name: "_superchainConfig",
        type: "address",
        internalType: "contract SuperchainConfig"
      },
      {
        name: "_systemConfig",
        type: "address",
        internalType: "contract SystemConfig"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "l2TokenBridge",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "messenger",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract CrossDomainMessenger"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "otherBridge",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract StandardBridge"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "paused",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "superchainConfig",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract SuperchainConfig"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "systemConfig",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract SystemConfig"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "version",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "event",
    name: "ERC20BridgeFinalized",
    inputs: [
      {
        name: "localToken",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "remoteToken",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "from",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "to",
        type: "address",
        indexed: false,
        internalType: "address"
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "extraData",
        type: "bytes",
        indexed: false,
        internalType: "bytes"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "ERC20BridgeInitiated",
    inputs: [
      {
        name: "localToken",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "remoteToken",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "from",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "to",
        type: "address",
        indexed: false,
        internalType: "address"
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "extraData",
        type: "bytes",
        indexed: false,
        internalType: "bytes"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "ERC20DepositInitiated",
    inputs: [
      {
        name: "l1Token",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "l2Token",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "from",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "to",
        type: "address",
        indexed: false,
        internalType: "address"
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "extraData",
        type: "bytes",
        indexed: false,
        internalType: "bytes"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "ERC20WithdrawalFinalized",
    inputs: [
      {
        name: "l1Token",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "l2Token",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "from",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "to",
        type: "address",
        indexed: false,
        internalType: "address"
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "extraData",
        type: "bytes",
        indexed: false,
        internalType: "bytes"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "ETHBridgeFinalized",
    inputs: [
      {
        name: "from",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "to",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "extraData",
        type: "bytes",
        indexed: false,
        internalType: "bytes"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "ETHBridgeInitiated",
    inputs: [
      {
        name: "from",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "to",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "extraData",
        type: "bytes",
        indexed: false,
        internalType: "bytes"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "ETHDepositInitiated",
    inputs: [
      {
        name: "from",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "to",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "extraData",
        type: "bytes",
        indexed: false,
        internalType: "bytes"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "ETHWithdrawalFinalized",
    inputs: [
      {
        name: "from",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "to",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "extraData",
        type: "bytes",
        indexed: false,
        internalType: "bytes"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "Initialized",
    inputs: [
      {
        name: "version",
        type: "uint8",
        indexed: false,
        internalType: "uint8"
      }
    ],
    anonymous: false
  }
];
var L2StandardBridgeAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_owner",
        type: "address",
        internalType: "address payable"
      },
      {
        name: "_delegationFee",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "nonpayable"
  },
  {
    name: "AddressEmptyCode",
    type: "error",
    inputs: [{ name: "target", type: "address", internalType: "address" }]
  },
  {
    name: "AddressInsufficientBalance",
    type: "error",
    inputs: [{ name: "account", type: "address", internalType: "address" }]
  },
  { name: "FailedInnerCall", type: "error", inputs: [] },
  {
    name: "OwnableInvalidOwner",
    type: "error",
    inputs: [{ name: "owner", type: "address", internalType: "address" }]
  },
  {
    name: "OwnableUnauthorizedAccount",
    type: "error",
    inputs: [{ name: "account", type: "address", internalType: "address" }]
  },
  {
    name: "SafeERC20FailedOperation",
    type: "error",
    inputs: [{ name: "token", type: "address", internalType: "address" }]
  },
  {
    name: "OwnershipTransferred",
    type: "event",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address"
      }
    ],
    anonymous: false,
    signature: "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0"
  },
  {
    name: "SetDelegationFee",
    type: "event",
    inputs: [
      {
        name: "_delegationFee",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      }
    ],
    anonymous: false,
    signature: "0x0322f3257c2afe5fe8da7ab561f0d3384148487412fe2751678f2188731c0815"
  },
  {
    name: "WithdrawTo",
    type: "event",
    inputs: [
      {
        name: "from",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "l2Token",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "to",
        type: "address",
        indexed: false,
        internalType: "address"
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "minGasLimit",
        type: "uint32",
        indexed: false,
        internalType: "uint32"
      },
      {
        name: "extraData",
        type: "bytes",
        indexed: false,
        internalType: "bytes"
      }
    ],
    anonymous: false,
    signature: "0x56f66275d9ebc94b7d6895aa0d96a3783550d0183ba106408d387d19f2e877f1"
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
        internalType: "contract IL2StandardBridge"
      }
    ],
    constant: true,
    signature: "0x21d12763",
    stateMutability: "view"
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
        internalType: "address"
      }
    ],
    constant: true,
    signature: "0x2cb7cb06",
    stateMutability: "view"
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
        internalType: "uint256"
      }
    ],
    constant: true,
    signature: "0xc5f0a58f",
    stateMutability: "view"
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
        internalType: "address"
      }
    ],
    constant: true,
    signature: "0x8da5cb5b",
    stateMutability: "view"
  },
  {
    name: "renounceOwnership",
    type: "function",
    inputs: [],
    outputs: [],
    signature: "0x715018a6",
    stateMutability: "nonpayable"
  },
  {
    name: "setDelegationFee",
    type: "function",
    inputs: [
      {
        name: "_delegationFee",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [],
    signature: "0x55bfc81c",
    stateMutability: "nonpayable"
  },
  {
    name: "transferOwnership",
    type: "function",
    inputs: [
      { name: "newOwner", type: "address", internalType: "address" }
    ],
    outputs: [],
    signature: "0xf2fde38b",
    stateMutability: "nonpayable"
  },
  {
    name: "withdraw",
    type: "function",
    inputs: [
      { name: "_l2Token", type: "address", internalType: "address" },
      { name: "_amount", type: "uint256", internalType: "uint256" },
      { name: "_minGasLimit", type: "uint32", internalType: "uint32" },
      { name: "_extraData", type: "bytes", internalType: "bytes" }
    ],
    outputs: [],
    payable: true,
    signature: "0x32b7006d",
    stateMutability: "payable"
  },
  {
    name: "withdrawFee",
    type: "function",
    inputs: [
      { name: "_recipient", type: "address", internalType: "address" }
    ],
    outputs: [],
    signature: "0x1ac3ddeb",
    stateMutability: "nonpayable"
  },
  {
    name: "withdrawFeeToL1",
    type: "function",
    inputs: [
      { name: "_recipient", type: "address", internalType: "address" },
      { name: "_minGasLimit", type: "uint32", internalType: "uint32" },
      { name: "_extraData", type: "bytes", internalType: "bytes" }
    ],
    outputs: [],
    signature: "0x244cafe0",
    stateMutability: "nonpayable"
  },
  {
    name: "withdrawTo",
    type: "function",
    inputs: [
      { name: "_l2Token", type: "address", internalType: "address" },
      { name: "_to", type: "address", internalType: "address" },
      { name: "_amount", type: "uint256", internalType: "uint256" },
      { name: "_minGasLimit", type: "uint32", internalType: "uint32" },
      { name: "_extraData", type: "bytes", internalType: "bytes" }
    ],
    outputs: [],
    payable: true,
    signature: "0xa3a79548",
    stateMutability: "payable"
  }
];

// src/actions/getBalance.ts
import {
  composeContext as composeContext3,
  elizaLogger as elizaLogger3,
  generateObjectDeprecated as generateObjectDeprecated3,
  ModelClass as ModelClass3
} from "@elizaos/core";
import { getToken as getToken2 } from "@lifi/sdk";
import { erc20Abi as erc20Abi3, formatEther as formatEther2, formatUnits as formatUnits3 } from "viem";
var GetBalanceAction = class {
  constructor(walletProvider) {
    this.walletProvider = walletProvider;
  }
  async getBalance(params) {
    elizaLogger3.debug("Get balance params:", params);
    await this.validateAndNormalizeParams(params);
    elizaLogger3.debug("Normalized get balance params:", params);
    const { chain, address, token } = params;
    if (!address) {
      throw new Error("Address is required for getting balance");
    }
    this.walletProvider.switchChain(chain);
    const nativeSymbol = this.walletProvider.getChainConfigs(chain).nativeCurrency.symbol;
    const chainId = this.walletProvider.getChainConfigs(chain).id;
    let queryNativeToken = false;
    if (!token || token === "" || token.toLowerCase() === "eth") {
      queryNativeToken = true;
    }
    const resp = {
      chain,
      address
    };
    if (!queryNativeToken) {
      let amount;
      if (token.startsWith("0x")) {
        amount = await this.getERC20TokenBalance(
          chain,
          address,
          token
        );
      } else {
        if (chainId !== 42161) {
          throw new Error(
            "Only Arbitrum mainnet is supported for querying balance by token symbol"
          );
        }
        this.walletProvider.configureLiFiSdk(chain);
        const tokenInfo = await getToken2(chainId, token);
        amount = await this.getERC20TokenBalance(
          chain,
          address,
          tokenInfo.address
        );
      }
      resp.balance = { token, amount };
    } else {
      const nativeBalanceWei = await this.walletProvider.getPublicClient(chain).getBalance({ address });
      resp.balance = {
        token: nativeSymbol,
        amount: formatEther2(nativeBalanceWei)
      };
    }
    return resp;
  }
  async getERC20TokenBalance(chain, address, tokenAddress) {
    const publicClient = this.walletProvider.getPublicClient(chain);
    const balance = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi3,
      functionName: "balanceOf",
      args: [address]
    });
    const decimals = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi3,
      functionName: "decimals"
    });
    return formatUnits3(balance, decimals);
  }
  async validateAndNormalizeParams(params) {
    if (!params.address) {
      params.address = this.walletProvider.getAddress();
    } else {
      params.address = await this.walletProvider.formatAddress(
        params.address
      );
    }
  }
};
var getBalanceAction = {
  name: "getBalance",
  description: "Get balance of a token or all tokens for the given address",
  handler: async (runtime, message, state, _options, callback) => {
    elizaLogger3.log("Starting getBalance action...");
    let currentState = state;
    if (!currentState) {
      currentState = await runtime.composeState(message);
    } else {
      currentState = await runtime.updateRecentMessageState(currentState);
    }
    state.walletInfo = await arbitrumWalletProvider.get(
      runtime,
      message,
      currentState
    );
    const getBalanceContext = composeContext3({
      state: currentState,
      template: getBalanceTemplate
    });
    const content = await generateObjectDeprecated3({
      runtime,
      context: getBalanceContext,
      modelClass: ModelClass3.LARGE
    });
    const walletProvider = initWalletProvider(runtime);
    const action = new GetBalanceAction(walletProvider);
    const getBalanceOptions = {
      chain: content.chain,
      address: content.address,
      token: content.token
    };
    try {
      const getBalanceResp = await action.getBalance(getBalanceOptions);
      if (callback) {
        let text = `No balance found for ${getBalanceOptions.address} on ${getBalanceOptions.chain}`;
        if (getBalanceResp.balance) {
          text = `Balance of ${getBalanceResp.address} on ${getBalanceResp.chain}:
${getBalanceResp.balance.token}: ${getBalanceResp.balance.amount}`;
        }
        callback({
          text,
          content: { ...getBalanceResp }
        });
      }
      return true;
    } catch (error) {
      elizaLogger3.error("Error during get balance:", error.message);
      callback?.({
        text: `Get balance failed: ${error.message}`,
        content: { error: error.message }
      });
      return false;
    }
  },
  template: getBalanceTemplate,
  validate: async (_runtime) => {
    return true;
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Check my balance of USDC"
        }
      },
      {
        user: "{{agent}}",
        content: {
          text: "I'll help you check your balance of USDC",
          action: "GET_BALANCE",
          content: {
            chain: "arbitrum",
            address: "{{walletAddress}}",
            token: "USDC"
          }
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Check my balance of token 0x1234"
        }
      },
      {
        user: "{{agent}}",
        content: {
          text: "I'll help you check your balance of token 0x1234",
          action: "GET_BALANCE",
          content: {
            chain: "arbitrum",
            address: "{{walletAddress}}",
            token: "0x1234"
          }
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Get USDC balance of 0x1234"
        }
      },
      {
        user: "{{agent}}",
        content: {
          text: "I'll help you check USDC balance of 0x1234",
          action: "GET_BALANCE",
          content: {
            chain: "arbitrum",
            address: "0x1234",
            token: "USDC"
          }
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Check my wallet balance on Arbitrum"
        }
      },
      {
        user: "{{agent}}",
        content: {
          text: "I'll help you check your wallet balance on Arbitrum",
          action: "GET_BALANCE",
          content: {
            chain: "arbitrum",
            address: "{{walletAddress}}",
            token: void 0
          }
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Check my wallet balance on Arbitrum Sepolia"
        }
      },
      {
        user: "{{agent}}",
        content: {
          text: "I'll help you check your wallet balance on Arbitrum Sepolia",
          action: "GET_BALANCE",
          content: {
            chain: "arbitrumSepolia",
            address: "{{walletAddress}}",
            token: void 0
          }
        }
      }
    ]
  ],
  similes: ["GET_BALANCE", "CHECK_BALANCE"]
};

// src/actions/deploy.ts
import {
  composeContext as composeContext4,
  elizaLogger as elizaLogger5,
  generateObjectDeprecated as generateObjectDeprecated4,
  ModelClass as ModelClass4
} from "@elizaos/core";
import solc2 from "solc";
import { parseUnits as parseUnits2 } from "viem";

// src/utils/contracts.ts
import { elizaLogger as elizaLogger4 } from "@elizaos/core";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import solc from "solc";
var require2 = createRequire(import.meta.url);
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var baseDir = path.resolve(__dirname, "../../plugin-arbitrum/src/contracts");
function getContractSource(contractPath) {
  return fs.readFileSync(contractPath, "utf8");
}
function findImports(importPath) {
  try {
    if (importPath.startsWith("@openzeppelin/")) {
      const modPath = require2.resolve(importPath);
      return { contents: fs.readFileSync(modPath, "utf8") };
    }
    const localPath = path.resolve("./contracts", importPath);
    if (fs.existsSync(localPath)) {
      return { contents: fs.readFileSync(localPath, "utf8") };
    }
    return { error: "File not found" };
  } catch {
    return { error: `File not found: ${importPath}` };
  }
}
async function compileSolidity(contractFileName) {
  const contractPath = path.join(baseDir, `${contractFileName}.sol`);
  const source = getContractSource(contractPath);
  const input = {
    language: "Solidity",
    sources: {
      [contractFileName]: {
        content: source
      }
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      outputSelection: {
        "*": {
          "*": ["*"]
        }
      }
    }
  };
  elizaLogger4.debug("Compiling contract...");
  try {
    const output = JSON.parse(
      solc.compile(JSON.stringify(input), { import: findImports })
    );
    if (output.errors) {
      const hasError = output.errors.some(
        (error) => error.type === "Error"
      );
      if (hasError) {
        throw new Error(
          `Compilation errors: ${JSON.stringify(output.errors, null, 2)}`
        );
      }
      elizaLogger4.warn("Compilation warnings:", output.errors);
    }
    const contractName = path.basename(contractFileName, ".sol");
    const contract = output.contracts[contractFileName][contractName];
    if (!contract) {
      throw new Error("Contract compilation result is empty");
    }
    elizaLogger4.debug("Contract compiled successfully");
    return {
      abi: contract.abi,
      bytecode: contract.evm.bytecode.object
    };
  } catch (error) {
    elizaLogger4.error("Compilation failed:", error.message);
    throw error;
  }
}

// src/actions/deploy.ts
var DeployAction = class {
  constructor(walletProvider) {
    this.walletProvider = walletProvider;
  }
  async compileSolidity(contractName, source) {
    const solName = `${contractName}.sol`;
    const input = {
      language: "Solidity",
      sources: {
        [solName]: {
          content: source
        }
      },
      settings: {
        outputSelection: {
          "*": {
            "*": ["*"]
          }
        }
      }
    };
    elizaLogger5.debug("Compiling contract...");
    const output = JSON.parse(solc2.compile(JSON.stringify(input)));
    if (output.errors) {
      const hasError = output.errors.some(
        (error) => error.type === "Error"
      );
      if (hasError) {
        elizaLogger5.error(
          `Compilation errors: ${JSON.stringify(output.errors, null, 2)}`
        );
      }
    }
    const contract = output.contracts[solName][contractName];
    if (!contract) {
      elizaLogger5.error("Compilation result is empty");
    }
    elizaLogger5.debug("Contract compiled successfully");
    return {
      abi: contract.abi,
      bytecode: contract.evm.bytecode.object
    };
  }
  async deployERC20(deployTokenParams) {
    elizaLogger5.debug("deployTokenParams", deployTokenParams);
    const { name, symbol, decimals, totalSupply, chain } = deployTokenParams;
    if (!name || name === "") {
      throw new Error("Token name is required");
    }
    if (!symbol || symbol === "") {
      throw new Error("Token symbol is required");
    }
    if (!decimals || decimals === 0) {
      throw new Error("Token decimals is required");
    }
    if (!totalSupply || totalSupply === "") {
      throw new Error("Token total supply is required");
    }
    try {
      const totalSupplyWithDecimals = parseUnits2(totalSupply, decimals);
      const args = [name, symbol, decimals, totalSupplyWithDecimals];
      const contractAddress = await this.deployContract(
        chain,
        "ERC20Contract",
        args
      );
      return {
        address: contractAddress
      };
    } catch (error) {
      elizaLogger5.error("Deploy ERC20 failed:", error.message);
      throw error;
    }
  }
  async deployERC721(deployNftParams) {
    elizaLogger5.debug("deployNftParams", deployNftParams);
    const { baseURI, name, symbol, chain } = deployNftParams;
    if (!name || name === "") {
      throw new Error("Token name is required");
    }
    if (!symbol || symbol === "") {
      throw new Error("Token symbol is required");
    }
    if (!baseURI || baseURI === "") {
      throw new Error("Token baseURI is required");
    }
    try {
      const args = [name, symbol, baseURI];
      const contractAddress = await this.deployContract(
        chain,
        "ERC721Contract",
        args
      );
      return {
        address: contractAddress
      };
    } catch (error) {
      elizaLogger5.error("Deploy ERC721 failed:", error.message);
      throw error;
    }
  }
  async deployERC1155(deploy1155Params) {
    elizaLogger5.debug("deploy1155Params", deploy1155Params);
    const { baseURI, name, chain } = deploy1155Params;
    if (!name || name === "") {
      throw new Error("Token name is required");
    }
    if (!baseURI || baseURI === "") {
      throw new Error("Token baseURI is required");
    }
    try {
      const args = [name, baseURI];
      const contractAddress = await this.deployContract(
        chain,
        "ERC1155Contract",
        args
      );
      return {
        address: contractAddress
      };
    } catch (error) {
      elizaLogger5.error("Deploy ERC1155 failed:", error.message);
      throw error;
    }
  }
  async deployContract(chain, contractName, args) {
    const { abi, bytecode } = await compileSolidity(contractName);
    if (!bytecode) {
      throw new Error("Bytecode is empty after compilation");
    }
    this.walletProvider.switchChain(chain);
    const chainConfig = this.walletProvider.getChainConfigs(chain);
    const walletClient = this.walletProvider.getWalletClient(chain);
    const hash = await walletClient.deployContract({
      account: this.walletProvider.getAccount(),
      abi,
      bytecode,
      args,
      chain: chainConfig
    });
    elizaLogger5.debug("Waiting for deployment transaction...", hash);
    const publicClient = this.walletProvider.getPublicClient(chain);
    const receipt = await publicClient.waitForTransactionReceipt({
      hash
    });
    elizaLogger5.debug("Contract deployed successfully!");
    return receipt.contractAddress;
  }
};
var deployAction = {
  name: "DEPLOY_TOKEN",
  description: "Deploy token contracts (ERC20/721/1155) based on user specifications",
  handler: async (runtime, message, state, _options, callback) => {
    elizaLogger5.log("Starting deploy action...");
    let currentState = state;
    if (!currentState) {
      currentState = await runtime.composeState(message);
    } else {
      currentState = await runtime.updateRecentMessageState(currentState);
    }
    state.walletInfo = await arbitrumWalletProvider.get(runtime, message, currentState);
    const context = composeContext4({
      state: currentState,
      template: ercContractTemplate
    });
    const content = await generateObjectDeprecated4({
      runtime,
      context,
      modelClass: ModelClass4.LARGE
    });
    const walletProvider = initWalletProvider(runtime);
    const action = new DeployAction(walletProvider);
    try {
      const contractType = content.contractType;
      let result;
      switch (contractType.toLocaleLowerCase()) {
        case "erc20":
          result = await action.deployERC20({
            chain: content.chain,
            decimals: content.decimals,
            symbol: content.symbol,
            name: content.name,
            totalSupply: content.totalSupply
          });
          break;
        case "erc721":
          result = await action.deployERC721({
            chain: content.chain,
            name: content.name,
            symbol: content.symbol,
            baseURI: content.baseURI
          });
          break;
        case "erc1155":
          result = await action.deployERC1155({
            chain: content.chain,
            name: content.name,
            baseURI: content.baseURI
          });
          break;
      }
      if (result) {
        callback?.({
          text: `Successfully create contract - ${result?.address}`,
          content: { ...result }
        });
      } else {
        callback?.({
          text: "Unsuccessfully create contract",
          content: { ...result }
        });
      }
      return true;
    } catch (error) {
      elizaLogger5.error("Error during deploy:", error.message);
      callback?.({
        text: `Deploy failed: ${error.message}`,
        content: { error: error.message }
      });
      return false;
    }
  },
  template: ercContractTemplate,
  validate: async (_runtime) => {
    return true;
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "deploy an ERC20 token with name 'MyToken', symbol 'MTK', decimals 18, total supply 10000",
          action: "DEPLOY_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Deploy an ERC721 NFT contract with name 'MyNFT', symbol 'MNFT', baseURI 'https://my-nft-base-uri.com'",
          action: "DEPLOY_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Deploy an ERC1155 contract with name 'My1155', baseURI 'https://my-1155-base-uri.com'",
          action: "DEPLOY_TOKEN"
        }
      }
    ]
  ],
  similes: [
    "DEPLOY_ERC20",
    "DEPLOY_ERC721",
    "DEPLOY_ERC1155",
    "CREATE_TOKEN",
    "CREATE_NFT",
    "CREATE_1155"
  ]
};

// src/index.ts
var arbitrumPlugin = {
  name: "arbitrum",
  description: "Arbitrum integration plugin supporting transfers, swaps, staking, bridging, and token deployments",
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
    deployAction
  ]
};
var index_default = arbitrumPlugin;
export {
  L1StandardBridgeAbi,
  L2StandardBridgeAbi,
  SwapAction,
  TransferAction,
  WalletProvider,
  arbitrumPlugin,
  arbitrumWalletProvider,
  index_default as default,
  initWalletProvider,
  swapAction,
  swapTemplate,
  transferAction,
  transferTemplate
};
//# sourceMappingURL=index.js.map