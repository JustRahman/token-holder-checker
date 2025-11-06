# 🌐 Token Addresses by Chain

**IMPORTANT:** Each blockchain has DIFFERENT token addresses!

The same token (like USDC) has a different contract address on each chain.

## ⚠️ Common Mistake

```javascript
// ❌ WRONG - This will fail!
{
  address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",  // Ethereum UNI
  chain: "polygon"  // ❌ UNI doesn't exist at this address on Polygon!
}

// ✅ CORRECT - Use the right address for the chain
{
  address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",  // Polygon USDC
  chain: "polygon"  // ✅ This USDC address exists on Polygon
}
```

---

## 🔍 How to Find the Correct Address

### Method 1: Use Block Explorers
1. **Ethereum:** https://etherscan.io
2. **BSC:** https://bscscan.com
3. **Polygon:** https://polygonscan.com
4. **Arbitrum:** https://arbiscan.io
5. **Base:** https://basescan.org
6. **Optimism:** https://optimistic.etherscan.io

### Method 2: Use CoinGecko
1. Go to https://coingecko.com
2. Search for your token
3. Scroll down to "Contract" section
4. Click the chain you want
5. Copy the address

---

## 📋 Popular Token Addresses by Chain

### 💎 Ethereum Mainnet

| Token | Symbol | Address |
|-------|--------|---------|
| **Wrapped Ether** | WETH | `0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2` |
| **USD Coin** | USDC | `0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48` |
| **Tether** | USDT | `0xdac17f958d2ee523a2206206994597c13d831ec7` |
| **Uniswap** | UNI | `0x1f9840a85d5af5bf1d1762f925bdaddc4201f984` |
| **Pepe** | PEPE | `0x6982508145454ce325ddbe47a25d4ec3d2311933` |
| **Shiba Inu** | SHIB | `0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce` |
| **Chainlink** | LINK | `0x514910771af9ca656af840dff83e8264ecf986ca` |
| **Dai** | DAI | `0x6b175474e89094c44da98b954eedeac495271d0f` |

### 🟡 BSC (Binance Smart Chain)

| Token | Symbol | Address |
|-------|--------|---------|
| **Wrapped BNB** | WBNB | `0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c` |
| **PancakeSwap** | CAKE | `0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82` |
| **USD Coin** | USDC | `0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d` |
| **Tether** | USDT | `0x55d398326f99059ff775485246999027b3197955` |
| **Binance USD** | BUSD | `0xe9e7cea3dedca5984780bafc599bd69add087d56` |

### 🟣 Polygon (MATIC)

| Token | Symbol | Address |
|-------|--------|---------|
| **Wrapped MATIC** | WMATIC | `0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270` |
| **USD Coin** | USDC | `0x2791bca1f2de4661ed88a30c99a7a9449aa84174` |
| **Wrapped Ether** | WETH | `0x7ceb23fd6bc0add59e62ac25578270cff1b9f619` |
| **Tether** | USDT | `0xc2132d05d31c914a87c6611c10748aeb04b58e8f` |
| **Dai** | DAI | `0x8f3cf7ad23cd3cadbd9735aff958023239c6a063` |

### 🔵 Arbitrum One

| Token | Symbol | Address |
|-------|--------|---------|
| **Wrapped Ether** | WETH | `0x82af49447d8a07e3bd95bd0d56f35241523fbab1` |
| **USD Coin** | USDC | `0xaf88d065e77c8cc2239327c5edb3a432268e5831` |
| **Tether** | USDT | `0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9` |
| **Dai** | DAI | `0xda10009cbd5d07dd0cecc66161fc93d7c9000da1` |
| **Uniswap** | UNI | `0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0` |

### 🔵 Base (Coinbase L2)

| Token | Symbol | Address |
|-------|--------|---------|
| **USD Coin** | USDC | `0x833589fcd6edb6e08f4c7c32d4f71b54bda02913` |
| **Wrapped Ether** | WETH | `0x4200000000000000000000000000000000000006` |
| **Dai** | DAI | `0x50c5725949a6f0c72e6c4a641f24049a917db0cb` |

### 🔴 Optimism

| Token | Symbol | Address |
|-------|--------|---------|
| **Wrapped Ether** | WETH | `0x4200000000000000000000000000000000000006` |
| **USD Coin** | USDC | `0x7f5c764cbc14f9669b88837ca1490cca17c31607` |
| **Tether** | USDT | `0x94b008aa00579c1307b0ef2c499ad98a8ce58e58` |
| **Dai** | DAI | `0xda10009cbd5d07dd0cecc66161fc93d7c9000da1` |

---

## 🎯 Quick Test Examples

### Test USDC on Different Chains

**Ethereum:**
```typescript
{
  address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  chain: "ethereum",
  name: "USDC on Ethereum"
}
```

**Polygon:**
```typescript
{
  address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
  chain: "polygon",
  name: "USDC on Polygon"
}
```

**BSC:**
```typescript
{
  address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
  chain: "bsc",
  name: "USDC on BSC"
}
```

**Arbitrum:**
```typescript
{
  address: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
  chain: "arbitrum",
  name: "USDC on Arbitrum"
}
```

**Base:**
```typescript
{
  address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  chain: "base",
  name: "USDC on Base"
}
```

---

## 💡 Tips

### Verify Before Testing
1. **Check the blockchain explorer** for your chain
2. **Verify the token exists** at that address
3. **Confirm it's the right token** (check name/symbol)

### Common Issues
- ❌ "No holders found" = Wrong address for that chain
- ❌ "Token not found" = Token doesn't exist on that chain
- ✅ Use the pre-configured tokens in `test-custom-tokens.ts`

### Finding New Tokens
1. Visit the token's official website
2. Look for "Contract Address" or "Add to MetaMask"
3. Check which chains they list
4. Use the correct address for your chosen chain

---

## 🚀 Ready-to-Test Tokens

### Already in `test-custom-tokens.ts`:

**Ethereum:**
- `POPULAR_TOKENS.WETH` ✅
- `POPULAR_TOKENS.USDC` ✅
- `POPULAR_TOKENS.UNI` ✅
- `POPULAR_TOKENS.PEPE` ✅
- `POPULAR_TOKENS.SHIB` ✅

**BSC:**
- `POPULAR_TOKENS.BNB_BSC` ✅
- `POPULAR_TOKENS.CAKE` ✅

**Polygon:**
- `POPULAR_TOKENS.WMATIC` ✅
- `POPULAR_TOKENS.USDC_POLYGON` ✅
- `POPULAR_TOKENS.WETH_POLYGON` ✅

**Base:**
- `POPULAR_TOKENS.USDC_BASE` ✅

**Arbitrum:**
- `POPULAR_TOKENS.USDC_ARB` ✅

Just uncomment and test!

---

## ✅ Summary

**Rule #1:** Always use the correct address for your chain
**Rule #2:** Token addresses are NOT the same across chains
**Rule #3:** When in doubt, use the pre-configured tokens
**Rule #4:** Check block explorers to verify addresses

**Happy testing!** 🎉
