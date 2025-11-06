# 🎯 Custom Token Testing Guide

Quick guide to test any token with your Token Holder Monitor!

## 🚀 Quick Start

### Test Any Token in 3 Steps:

1. **Open `test-custom-tokens.ts`**
2. **Paste your token address** at line ~80 in the `CUSTOM_TOKEN` section
3. **Run:** `npm run test:custom`

## 📝 How to Use

### Option 1: Test Your Own Token

Edit `test-custom-tokens.ts` and find this section:

```typescript
const CUSTOM_TOKEN = {
  // 👇 PASTE YOUR TOKEN ADDRESS HERE
  address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",

  // 👇 SET THE CORRECT CHAIN
  chain: "ethereum",  // Options: ethereum, base, arbitrum, optimism, polygon, bsc

  // 👇 OPTIONAL: Give it a name
  name: "My Custom Token"
};
```

Then run:
```bash
npm run test:custom
```

### Option 2: Test Popular Pre-configured Tokens

The file has many popular tokens ready to test. Just uncomment one:

```typescript
// Uncomment any of these in the main() function:
await analyzeToken(POPULAR_TOKENS.USDC);   // USD Coin
await analyzeToken(POPULAR_TOKENS.WETH);   // Wrapped Ethereum
await analyzeToken(POPULAR_TOKENS.UNI);    // Uniswap
await analyzeToken(POPULAR_TOKENS.PEPE);   // Pepe
await analyzeToken(POPULAR_TOKENS.SHIB);   // Shiba Inu
await analyzeToken(POPULAR_TOKENS.LINK);   // Chainlink
await analyzeToken(POPULAR_TOKENS.DAI);    // Dai Stablecoin
await analyzeToken(POPULAR_TOKENS.BNB_BSC); // Wrapped BNB on BSC
await analyzeToken(POPULAR_TOKENS.CAKE);   // PancakeSwap
```

## 🔍 How to Find Token Addresses

### For Ethereum Tokens:
1. Go to https://etherscan.io
2. Search for your token (e.g., "Uniswap", "Pepe")
3. Copy the contract address

### For Other Chains:
- **BSC**: https://bscscan.com
- **Polygon**: https://polygonscan.com
- **Arbitrum**: https://arbiscan.io
- **Base**: https://basescan.org
- **Optimism**: https://optimistic.etherscan.io

## ✅ Supported Tokens

### ✅ Works With:
- **All ERC-20 tokens** on Ethereum
- **BEP-20 tokens** on BSC (Binance Smart Chain)
- **Tokens on Base** (Coinbase L2)
- **Tokens on Arbitrum**
- **Tokens on Optimism**
- **Tokens on Polygon**

### ❌ Does NOT Work With:
- **Bitcoin (BTC)** - Not an ERC-20 token
- **Solana (SOL)** - Different blockchain (not EVM)
- **Native ETH** - Use WETH (Wrapped ETH) instead
- **Native BNB** - Use WBNB (Wrapped BNB) instead

## 🎯 Example Usage

### Example 1: Test Uniswap Token
```typescript
const CUSTOM_TOKEN = {
  address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
  chain: "ethereum",
  name: "Uniswap (UNI)"
};
```

Run: `npm run test:custom`

**Output:**
```
✅ ANALYSIS COMPLETED SUCCESSFULLY

Token: Uniswap (UNI)
Price: $5.17
Risk Score: 13.0/100 (LOW)
Gini Coefficient: 0.680 (MEDIUM inequality)
Top 10 holders: 51.75%
100 whale holders found
```

### Example 2: Test PEPE on Ethereum
```typescript
const CUSTOM_TOKEN = {
  address: "0x6982508145454ce325ddbe47a25d4ec3d2311933",
  chain: "ethereum",
  name: "Pepe (PEPE)"
};
```

### Example 3: Test PancakeSwap on BSC
```typescript
const CUSTOM_TOKEN = {
  address: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
  chain: "bsc",  // Note: BSC, not ethereum!
  name: "PancakeSwap (CAKE)"
};
```

### Example 4: Test Multiple Tokens
Uncomment this section in `main()`:
```typescript
await analyzeToken(POPULAR_TOKENS.USDC);
await analyzeToken(POPULAR_TOKENS.UNI);
await analyzeToken(POPULAR_TOKENS.PEPE);
```

## 📊 What You'll Get

The analysis provides:

1. **Token Information**
   - Name, symbol
   - Current price
   - Market cap
   - 24h volume and change

2. **Holder Analysis**
   - Top 100 holders
   - Whale identification
   - Exchange detection
   - Balance distribution

3. **Centralization Metrics**
   - Gini Coefficient (inequality)
   - Nakamoto Coefficient (control)
   - Top holder percentages
   - Risk level

4. **Enhanced Risk Score**
   - Overall score (0-100)
   - 4-component breakdown
   - Risk level classification
   - Warnings and alerts

## 🎨 Pre-configured Popular Tokens

The file includes these tokens ready to test:

### Ethereum Network
- **WETH** - Wrapped Ether
- **USDC** - USD Coin
- **USDT** - Tether
- **UNI** - Uniswap
- **PEPE** - Pepe
- **SHIB** - Shiba Inu
- **LINK** - Chainlink
- **DAI** - Dai Stablecoin

### BSC Network
- **WBNB** - Wrapped BNB
- **CAKE** - PancakeSwap

### Other Networks
- **USDC_BASE** - USDC on Base
- **USDC_ARB** - USDC on Arbitrum
- **WMATIC** - Wrapped MATIC on Polygon

## 💡 Tips

### Getting Accurate Results
- ✅ Use the correct chain for your token
- ✅ Verify the token address is correct
- ✅ Make sure you have API keys configured

### Understanding Results

**Gini Coefficient:**
- 0.0 - 0.3: Low inequality (well distributed)
- 0.3 - 0.7: Medium inequality
- 0.7 - 1.0: High inequality (concentrated)

**Nakamoto Coefficient:**
- Lower = More centralized
- Higher = More decentralized
- Example: "3 holders" = Only 3 holders control 51%

**Risk Score:**
- 0-25: LOW risk
- 25-50: MEDIUM risk
- 50-75: HIGH risk
- 75-100: CRITICAL risk

## 🔧 Troubleshooting

### "No holders found"
- Check if token address is correct
- Verify you're using the right chain
- Make sure token exists on that chain

### "API key not found"
- Add `MORALIS_API_KEY` to `.env` file
- Or test will use mock data as fallback

### "Rate limit exceeded"
- Wait a few seconds
- Free tier has rate limits
- Cache reduces repeated API calls

## 🚀 Advanced Usage

### Test Multiple Tokens in Sequence
```typescript
const myTokens = [
  { address: "0x...", chain: "ethereum", name: "Token 1" },
  { address: "0x...", chain: "ethereum", name: "Token 2" },
  { address: "0x...", chain: "bsc", name: "Token 3" },
];

for (const token of myTokens) {
  await analyzeToken(token);
}
```

### Quick One-liner Test
At the bottom of the file, uncomment and modify:
```typescript
await analyzeToken({
  address: "0xYOUR_TOKEN_HERE",
  chain: "ethereum",
  name: "Quick Test"
});
```

## 📚 What Each Step Does

1. **[1/7] Token Info** - Fetches token details from Moralis
2. **[2/7] Holders** - Gets top 100 token holders
3. **[3/7] Whales** - Identifies large holders
4. **[4/7] Metrics** - Calculates centralization metrics
5. **[5/7] Distribution** - Analyzes holder distribution
6. **[6/7] Risk Score** - Calculates enhanced risk assessment
7. **[7/7] Alerts** - Generates warnings and alerts

## 🎉 Ready to Test!

1. Find your token address on Etherscan (or BSCScan, etc.)
2. Paste it in the `CUSTOM_TOKEN` section
3. Run: `npm run test:custom`
4. View your complete token analysis!

---

**Need Help?**
- Check the token exists on the blockchain you specified
- Verify the address is correct (should start with 0x)
- Ensure API keys are set up in `.env`
- Try testing with USDC first to verify everything works
