/**
 * BSC (Binance Smart Chain) Token Testing
 *
 * This demonstrates that the tool works on BSC, not just Ethereum!
 */

import { config } from "dotenv";
config();

import { fetchTokenInfo, fetchTokenHolders } from "./dist/services/blockchainData.js";
import { getTokenMarketData } from "./dist/services/priceData.js";
import { calculateCentralizationMetrics } from "./dist/metrics.js";
import { identifyWhales } from "./dist/whales.js";
import { calculateEnhancedRiskScore } from "./dist/services/riskScoring.js";

async function testBSCToken() {
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║   TESTING BSC (BINANCE SMART CHAIN) - NOT ETHEREUM!           ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
  console.log();

  // Test PancakeSwap (CAKE) on BSC
  const CAKE_ADDRESS = "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82";
  const CHAIN = "bsc";  // 👈 BSC, not ethereum!

  try {
    console.log("🥞 Testing PancakeSwap (CAKE) on BSC...");
    console.log(`   Address: ${CAKE_ADDRESS}`);
    console.log(`   Chain: ${CHAIN.toUpperCase()}`);
    console.log();

    // Fetch token info and market data
    console.log("📊 Fetching token data...");
    const [tokenInfo, marketData] = await Promise.all([
      fetchTokenInfo(CAKE_ADDRESS, CHAIN),
      getTokenMarketData(CAKE_ADDRESS, CHAIN),
    ]);

    tokenInfo.current_price_usd = marketData.price;
    tokenInfo.market_cap_usd = marketData.marketCap;

    console.log(`✅ Token: ${tokenInfo.name} (${tokenInfo.symbol})`);
    console.log(`   Price: $${marketData.price.toFixed(2)}`);
    console.log(`   Market Cap: $${(marketData.marketCap / 1_000_000).toFixed(2)}M`);
    console.log();

    // Fetch holders
    console.log("🐋 Fetching top 100 holders...");
    const holders = await fetchTokenHolders(CAKE_ADDRESS, CHAIN, 100);
    console.log(`✅ Fetched ${holders.length} holders on BSC`);
    console.log();

    if (holders.length > 0) {
      tokenInfo.total_holders = holders.length;

      // Identify whales
      const whaleHolders = identifyWhales(
        holders,
        100_000,
        1,
        tokenInfo
      );

      console.log(`🎯 Found ${whaleHolders.length} whale holders`);
      console.log();

      if (whaleHolders.length > 0) {
        console.log("📊 Top 5 Whales on BSC:");
        whaleHolders.slice(0, 5).forEach((whale, i) => {
          console.log(`${i + 1}. ${whale.address}`);
          console.log(`   Balance: $${(whale.balance_usd / 1_000_000).toFixed(2)}M (${whale.percentage_of_supply.toFixed(2)}%)`);
        });
        console.log();
      }

      // Calculate metrics
      const metrics = calculateCentralizationMetrics(
        holders,
        tokenInfo.total_supply,
        whaleHolders.length
      );

      console.log("📈 Centralization Analysis:");
      console.log(`   Gini: ${metrics.gini_coefficient.toFixed(3)}`);
      console.log(`   Nakamoto: ${metrics.nakamoto_coefficient}`);
      console.log(`   Risk: ${metrics.risk_level.toUpperCase()}`);
      console.log();

      const riskScore = calculateEnhancedRiskScore(metrics, whaleHolders, []);
      console.log("⚠️  Enhanced Risk Score:");
      console.log(`   Overall: ${riskScore.overall_score.toFixed(1)}/100 (${riskScore.risk_level.toUpperCase()})`);
    }

    console.log();
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("✅ BSC TOKEN TEST COMPLETED SUCCESSFULLY!");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log();
    console.log("🎉 This proves the tool works on BSC, not just Ethereum!");
    console.log();

  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

testBSCToken();
