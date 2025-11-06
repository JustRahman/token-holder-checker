/**
 * Custom Token Testing
 *
 * Test any token by pasting its address!
 *
 * HOW TO USE:
 * 1. Find your token on Etherscan, BSCScan, etc.
 * 2. Copy the contract address
 * 3. Paste it in the CUSTOM_TOKEN section below
 * 4. Set the correct chain
 * 5. Run: npm run test:custom
 */

import { config } from "dotenv";
config();

import { fetchTokenInfo, fetchTokenHolders } from "./dist/services/blockchainData.js";
import { getTokenMarketData } from "./dist/services/priceData.js";
import { calculateCentralizationMetrics } from "./dist/metrics.js";
import { identifyWhales, analyzeDistribution } from "./dist/whales.js";
import { calculateEnhancedRiskScore } from "./dist/services/riskScoring.js";
import { generateAlerts } from "./dist/alerts.js";

// ═══════════════════════════════════════════════════════════════════
// 🎯 POPULAR TOKENS - Pre-configured
// ═══════════════════════════════════════════════════════════════════

const POPULAR_TOKENS = {
  // Ethereum Network
  WETH: {
    address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    chain: "ethereum",
    name: "Wrapped Ether (WETH)"
  },
  USDC: {
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    chain: "ethereum",
    name: "USD Coin (USDC)"
  },
  USDT: {
    address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    chain: "ethereum",
    name: "Tether (USDT)"
  },
  UNI: {
    address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    chain: "ethereum",
    name: "Uniswap (UNI)"
  },
  PEPE: {
    address: "0x6982508145454ce325ddbe47a25d4ec3d2311933",
    chain: "ethereum",
    name: "Pepe (PEPE)"
  },
  SHIB: {
    address: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
    chain: "ethereum",
    name: "Shiba Inu (SHIB)"
  },
  LINK: {
    address: "0x514910771af9ca656af840dff83e8264ecf986ca",
    chain: "ethereum",
    name: "Chainlink (LINK)"
  },
  DAI: {
    address: "0x6b175474e89094c44da98b954eedeac495271d0f",
    chain: "ethereum",
    name: "Dai Stablecoin (DAI)"
  },


  // Base Network
  USDC_BASE: {
    address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    chain: "base",
    name: "USD Coin on Base"
  },

  // Arbitrum Network
  USDC_ARB: {
    address: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    chain: "arbitrum",
    name: "USD Coin on Arbitrum"
  },

  // BSC Network
  BNB_BSC: {
    address: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
    chain: "bsc",
    name: "Wrapped BNB (WBNB)"
  },
  CAKE: {
    address: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
    chain: "bsc",
    name: "PancakeSwap (CAKE)"
  },

  // Polygon Network
  WMATIC: {
    address: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    chain: "polygon",
    name: "Wrapped MATIC"
  },
  USDC_POLYGON: {
    address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    chain: "polygon",
    name: "USD Coin (USDC) on Polygon"
  },
  WETH_POLYGON: {
    address: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
    chain: "polygon",
    name: "Wrapped Ether on Polygon"
  },
};

// ═══════════════════════════════════════════════════════════════════
// ✨ CUSTOM TOKEN - PASTE YOUR TOKEN HERE
// ═══════════════════════════════════════════════════════════════════

const CUSTOM_TOKEN = {
  // 👇 PASTE YOUR TOKEN ADDRESS HERE
  address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // Example: UNI token

  // 👇 SET THE CORRECT CHAIN
  // Options: "ethereum", "base", "arbitrum", "optimism", "polygon", "bsc"
  chain: "polygon",

  // 👇 OPTIONAL: Give it a name (for display)
  name: "My Custom Token"
};

// ═══════════════════════════════════════════════════════════════════
// 📝 NOTES:
// ═══════════════════════════════════════════════════════════════════
//
// ✅ SUPPORTED CHAINS:
//    - ethereum (Ethereum Mainnet)
//    - base (Base)
//    - arbitrum (Arbitrum One)
//    - optimism (Optimism)
//    - polygon (Polygon PoS)
//    - bsc (BNB Smart Chain)
//
// ❌ NOT SUPPORTED (would need different APIs):
//    - Bitcoin (BTC) - Not an ERC-20 token
//    - Solana (SOL) - Different blockchain (not EVM)
//    - Native ETH - Use WETH instead (Wrapped ETH)
//    - Native BNB - Use WBNB instead (Wrapped BNB)
//
// 💡 HOW TO FIND TOKEN ADDRESS:
//    1. Ethereum: https://etherscan.io
//    2. BSC: https://bscscan.com
//    3. Polygon: https://polygonscan.com
//    4. Arbitrum: https://arbiscan.io
//    5. Base: https://basescan.org
//    6. Optimism: https://optimistic.etherscan.io
//
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// 🚀 TESTING FUNCTION
// ═══════════════════════════════════════════════════════════════════

async function analyzeToken(tokenConfig: typeof CUSTOM_TOKEN) {
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log(`║   Analyzing: ${tokenConfig.name.padEnd(50)} ║`);
  console.log("╚════════════════════════════════════════════════════════════════╝");
  console.log();
  console.log(`📍 Token Address: ${tokenConfig.address}`);
  console.log(`⛓️  Chain: ${tokenConfig.chain.toUpperCase()}`);
  console.log();

  try {
    // Step 1: Fetch token info and market data
    console.log("📊 [1/7] Fetching token information and market data...");
    const startTime = Date.now();

    const [tokenInfo, marketData] = await Promise.all([
      fetchTokenInfo(tokenConfig.address, tokenConfig.chain),
      getTokenMarketData(tokenConfig.address, tokenConfig.chain),
    ]);

    tokenInfo.current_price_usd = marketData.price;
    tokenInfo.market_cap_usd = marketData.marketCap;

    console.log(`   ✓ Completed in ${Date.now() - startTime}ms`);
    console.log();
    console.log("   Token Details:");
    console.log(`   • Name: ${tokenInfo.name}`);
    console.log(`   • Symbol: ${tokenInfo.symbol}`);
    console.log(`   • Price: $${marketData.price.toFixed(marketData.price < 0.01 ? 6 : 2)}`);
    console.log(`   • Market Cap: $${(marketData.marketCap / 1_000_000_000).toFixed(2)}B`);
    console.log(`   • 24h Volume: $${(marketData.volume24h / 1_000_000).toFixed(2)}M`);
    console.log(`   • 24h Change: ${marketData.priceChange24h >= 0 ? '+' : ''}${marketData.priceChange24h.toFixed(2)}%`);
    console.log();

    // Step 2: Fetch holders
    console.log("🐋 [2/7] Fetching top 100 token holders...");
    const holdersStartTime = Date.now();
    const holders = await fetchTokenHolders(tokenConfig.address, tokenConfig.chain, 100);
    console.log(`   ✓ Completed in ${Date.now() - holdersStartTime}ms`);
    console.log(`   • Total holders fetched: ${holders.length}`);

    if (holders.length === 0) {
      console.log("   ⚠️  No holders found. This might be an invalid token address.");
      return;
    }

    const totalBalance = holders.reduce((sum, h) => sum + h.balance, 0);
    console.log(`   • Total balance of top holders: ${(totalBalance / 1_000_000).toFixed(2)}M tokens`);
    console.log();

    // Step 3: Identify whales
    console.log("🎯 [3/7] Identifying whale holders...");
    tokenInfo.total_holders = holders.length;

    const whaleHolders = identifyWhales(
      holders,
      100_000, // $100k threshold
      1, // 1% of supply threshold
      tokenInfo
    );

    console.log(`   ✓ Found ${whaleHolders.length} whale holders`);
    console.log();

    if (whaleHolders.length > 0) {
      console.log("   Top 10 Whales:");
      whaleHolders.slice(0, 10).forEach((whale, i) => {
        const label = whale.label ? ` (${whale.label})` : "";
        console.log(`   ${i + 1}. ${whale.address}${label}`);
        console.log(`      Balance: $${(whale.balance_usd / 1_000_000).toFixed(2)}M (${whale.percentage_of_supply.toFixed(4)}%)`);
      });
      console.log();
    }

    // Step 4: Calculate centralization metrics
    console.log("📈 [4/7] Calculating centralization metrics...");
    const metrics = calculateCentralizationMetrics(
      holders,
      tokenInfo.total_supply,
      whaleHolders.length
    );

    console.log("   ✓ Analysis complete");
    console.log();
    console.log("   Centralization Metrics:");
    console.log(`   • Gini Coefficient: ${metrics.gini_coefficient.toFixed(3)} (${metrics.gini_coefficient > 0.7 ? 'HIGH' : metrics.gini_coefficient > 0.5 ? 'MEDIUM' : 'LOW'} inequality)`);
    if (metrics.hhi !== undefined) {
      console.log(`   • HHI: ${metrics.hhi.toFixed(0)} (${metrics.hhi > 2500 ? 'HIGHLY' : metrics.hhi > 1500 ? 'MODERATELY' : 'NOT'} concentrated)`);
    }
    console.log(`   • Nakamoto Coefficient: ${metrics.nakamoto_coefficient} holders for 51% control`);
    if (metrics.top10_percentage !== undefined) {
      console.log(`   • Top 10 holders: ${metrics.top10_percentage.toFixed(2)}%`);
    }
    if (metrics.top20_percentage !== undefined) {
      console.log(`   • Top 20 holders: ${metrics.top20_percentage.toFixed(2)}%`);
    }
    console.log(`   • Centralization Score: ${metrics.centralization_score.toFixed(1)}/100`);
    console.log(`   • Risk Level: ${metrics.risk_level.toUpperCase()}`);
    console.log();

    // Step 5: Distribution analysis
    console.log("📊 [5/7] Analyzing distribution...");
    const distribution = analyzeDistribution(holders, tokenInfo);
    console.log("   ✓ Distribution analyzed");
    console.log();
    console.log("   Holder Distribution:");
    console.log(`   • Whales (>1% supply):     ${distribution.whale_count || 0} holders (${(distribution.whale_percentage || 0).toFixed(2)}%)`);
    console.log(`   • Large (0.1-1%):          ${distribution.large_holder_count || 0} holders (${(distribution.large_holder_percentage || 0).toFixed(2)}%)`);
    console.log(`   • Medium (0.01-0.1%):      ${distribution.medium_holder_count || 0} holders (${(distribution.medium_holder_percentage || 0).toFixed(2)}%)`);
    console.log(`   • Small (<0.01%):          ${distribution.small_holder_count || 0} holders (${(distribution.small_holder_percentage || 0).toFixed(2)}%)`);
    console.log();

    // Step 6: Enhanced risk score
    console.log("⚠️  [6/7] Calculating enhanced risk score...");
    const riskScore = calculateEnhancedRiskScore(metrics, whaleHolders, []);
    console.log("   ✓ Risk assessment complete");
    console.log();
    console.log("   Enhanced Risk Score:");
    console.log(`   • Overall Score: ${riskScore.overall_score.toFixed(1)}/100`);
    console.log(`   • Risk Level: ${riskScore.risk_level.toUpperCase()}`);
    console.log();
    console.log("   Risk Breakdown:");
    console.log(`   • Centralization Risk:    ${riskScore.breakdown.centralization_risk.score.toFixed(1)}/100 (weight: 40%)`);
    console.log(`   • Whale Behavior Risk:    ${riskScore.breakdown.whale_behavior_risk.score.toFixed(1)}/100 (weight: 30%)`);
    console.log(`   • Exchange Risk:          ${riskScore.breakdown.exchange_concentration_risk.score.toFixed(1)}/100 (weight: 20%)`);
    console.log(`   • Transfer Pattern Risk:  ${riskScore.breakdown.transfer_pattern_risk.score.toFixed(1)}/100 (weight: 10%)`);
    console.log();

    // Step 7: Generate alerts
    console.log("🚨 [7/7] Generating alerts...");
    const alerts = generateAlerts(metrics, [], 50_000);
    console.log(`   ✓ Generated ${alerts.length} alerts`);

    if (alerts.length > 0) {
      console.log();
      console.log("   Active Alerts:");
      alerts.forEach((alert, i) => {
        const emoji = alert.severity === "critical" ? "🔴" : alert.severity === "high" ? "🟠" : alert.severity === "medium" ? "🟡" : "🟢";
        console.log(`   ${i + 1}. ${emoji} [${alert.severity.toUpperCase()}] ${alert.message}`);
      });
    }

    console.log();
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("✅ ANALYSIS COMPLETED SUCCESSFULLY");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log();

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.log();
    console.log("💡 Troubleshooting:");
    console.log("   • Verify the token address is correct");
    console.log("   • Ensure the chain is correct for this token");
    console.log("   • Check if MORALIS_API_KEY is set in .env");
    console.log("   • Try running with a known token first (like USDC)");
    console.log();
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🎮 MAIN FUNCTION - Choose what to test
// ═══════════════════════════════════════════════════════════════════

async function main() {
  console.log();
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║                                                                ║");
  console.log("║           TOKEN HOLDER ANALYZER - CUSTOM TOKENS                ║");
  console.log("║                                                                ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
  console.log();

  // Check API keys
  const hasApiKey = process.env.MORALIS_API_KEY && process.env.MORALIS_API_KEY.length > 10;
  if (!hasApiKey) {
    console.log("⚠️  WARNING: No Moralis API key detected");
    console.log("   The test will use mock data as fallback.");
    console.log("   To use real data, add MORALIS_API_KEY to .env file");
    console.log();
  } else {
    console.log("✅ API keys detected - using real blockchain data");
    console.log();
  }

  // ═══════════════════════════════════════════════════════════════════
  // 🎯 CHOOSE WHAT TO TEST
  // ═══════════════════════════════════════════════════════════════════

  // OPTION 1: Test your custom token
  // 👇 Uncomment this to test the CUSTOM_TOKEN you defined above
  await analyzeToken(CUSTOM_TOKEN);

  // OPTION 2: Test a popular token
  // 👇 Uncomment any of these to test popular tokens
  // await analyzeToken(POPULAR_TOKENS.USDC);
  // await analyzeToken(POPULAR_TOKENS.WETH);
  // await analyzeToken(POPULAR_TOKENS.UNI);
  // await analyzeToken(POPULAR_TOKENS.PEPE);
  // await analyzeToken(POPULAR_TOKENS.SHIB);
  // await analyzeToken(POPULAR_TOKENS.LINK);
  // await analyzeToken(POPULAR_TOKENS.DAI);
  // await analyzeToken(POPULAR_TOKENS.BNB_BSC);
  // await analyzeToken(POPULAR_TOKENS.CAKE);

  // OPTION 3: Test multiple tokens
  // 👇 Uncomment this to test multiple tokens at once
  /*
  console.log("Testing multiple tokens...");
  console.log();

  for (const [key, token] of Object.entries(POPULAR_TOKENS)) {
    await analyzeToken(token);
    console.log();
    console.log("─────────────────────────────────────────────────────────────");
    console.log();
  }
  */

  // OPTION 4: Quick test - Just paste address directly here
  // 👇 Uncomment and modify this for quick tests
  /*
  await analyzeToken({
    address: "0x YOUR_TOKEN_ADDRESS_HERE",
    chain: "ethereum", // or "bsc", "polygon", etc.
    name: "Quick Test Token"
  });
  */

  console.log();
  console.log("🎉 All tests completed!");
  console.log();
}

// Run the tests
main().catch(console.error);
