# `@ai16z/plugin-arbitrum`

This plugin enables interaction with the Arbitrum Chain ecosystem, providing support for Arbitrum and Arbitrum Sepolia networks.

---

## Configuration

### Default Setup

By default, **plugin-arbitrum** is not enabled. To use it, simply add your private key and/or public key to the `.env` file. If private key is not provided, some actions will be disabled.

**Security Note:** Your private key grants full access to your associated funds. Store it securely and never share it with anyone. Do not commit or upload your `.env` file to version control systems like Git.

```env
ARBITRUM_PRIVATE_KEY=your-private-key-here
ARBITRUM_PUBLIC_KEY=your-public-key-here
```

### Custom RPC URLs

By default, the RPC URL is inferred from the `viem/chains` config. To use custom RPC URLs, add the following to your `.env` file:

```env
ARBITRUM_PROVIDER_URL=https://your-custom-arbitrum-rpc-url
ARBITRUM_SEPOLIA_PROVIDER_URL=https://your-custom-arbitrum-sepolia-rpc-url
```

## Provider

The **Wallet Provider** initializes with Arbitrum as the default. It:

- Provides the **context** of the currently connected address and its balance.
- Creates **Public** and **Wallet clients** to interact with the supported chains.

---

## Actions

### Get Balance

Get the balance of an address on Arbitrum. Just specify the:

- **Chain**
- **Address**
- **Token**

**Example usage:**

```bash
Get the USDC balance of 0x1234567890 on Arbitrum.
```

### Transfer

Transfer tokens from one address to another on Arbitrum/Arbitrum Sepolia. Just specify the:

- **Chain**
- **Token**
- **Amount**
- **Recipient Address**
- **Data**(Optional)

**Example usage:**

```bash
Transfer 1 ETH to 0xRecipient on Arbitrum.
```

### Swap

Swap tokens from one address to another on Arbitrum. Just specify the:

- **Chain**(Only Arbitrum is supported for now)
- **Input Token**
- **Output Token**
- **Amount**
- **Slippage**(Optional)

**Example usage:**

```bash
Swap 1 ARB to USDC on Arbitrum.
```

### Bridge

Bridge tokens from one chain to another on Arbitrum/Arbitrum Sepolia. Just specify the:

- **From Chain**
- **To Chain**
- **From Token**
- **To Token**
- **Amount**
- **Recipient Address**(Optional)

**Example usage:**

```bash
Bridge 1 ETH from Arbitrum to Ethereum.
```

### Stake

Perform staking operations on Arbitrum

### Faucet

Request testnet tokens from the faucet. You could request any of the supported tokens(ARB, BTC, BUSD, DAI, ETH, USDC). Just specify the:

- **Token**(Optional)
- **Recipient Address**

The faucet is rate-limited. One claim is allowed per IP address within a 24-hour period. And the recipient address must maintain a minimum balance of 0.001 ETH on Arbitrum Mainnet to qualify.

**Example usage:**

```bash
Get some testnet USDC from the faucet.
```

---

## Contribution

The plugin contains tests. Whether you're using **TDD** or not, please make sure to run the tests before submitting a PR.

### Running Tests

Navigate to the `plugin-arbitrum` directory and run:

```bash
pnpm test
```
