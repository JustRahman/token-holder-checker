/**
 * Test with WETH - Shows whale detection with real data
 */

import { config } from "dotenv";
config();

import { fetchTokenInfo, fetchTokenHolders } from "./dist/services/blockchainData.js";
import { getTokenMarketData } from "./dist/services/priceData.js";
import { calculateCentralizationMetrics } from "./dist/metrics.js";
import { identifyWhales, analyzeDistribution } from "./dist/whales.js";
import { calculateEnhancedRiskScore } from "./dist/services/riskScoring.js";

async function testWETH() {
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║   TESTING WETH - Wrapped Ethereum (More Concentrated)         ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
  console.log();

  const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
  const CHAIN = "ethereum";

  try {
    console.log("🔍 Fetching WETH data...");

    const [tokenInfo, marketData] = await Promise.all([
      fetchTokenInfo(WETH_ADDRESS, CHAIN),
      getTokenMarketData(WETH_ADDRESS, CHAIN),
    ]);

    tokenInfo.current_price_usd = marketData.price;
    tokenInfo.market_cap_usd = marketData.marketCap;

    console.log(`✅ Token: ${tokenInfo.name} (${tokenInfo.symbol})`);
    console.log(`   Price: $${marketData.price.toFixed(2)}`);
    console.log(`   Market Cap: $${(marketData.marketCap / 1_000_000_000).toFixed(2)}B`);
    console.log();

    console.log("🐋 Fetching top 100 holders...");
    const holders = await fetchTokenHolders(WETH_ADDRESS, CHAIN, 100);
    console.log(`✅ Fetched ${holders.length} holders`);

    if (holders.length > 0 && holders[0].balance > 0) {
      const totalBalance = holders.reduce((sum, h) => sum + h.balance, 0);
      console.log(`   Total balance: ${(totalBalance / 1_000).toFixed(2)}K WETH`);
      console.log();

      console.log("🎯 Identifying whales...");
      tokenInfo.total_holders = holders.length;

      const whaleHolders = identifyWhales(
        holders,
        100_000, // $100k threshold
        0.1, // 0.1% of supply threshold (lower for WETH)
        tokenInfo
      );

      console.log(`✅ Found ${whaleHolders.length} whale holders`);
      console.log();

      if (whaleHolders.length > 0) {
        console.log("📊 Top 10 Whales:");
        whaleHolders.slice(0, 10).forEach((whale, i) => {
          const label = whale.label ? ` (${whale.label})` : "";
          console.log(`${i + 1}. ${whale.address}${label}`);
          console.log(`   Balance: $${(whale.balance_usd / 1_000_000).toFixed(2)}M (${whale.percentage_of_supply.toFixed(4)}%)`);
        });
        console.log();
      }

      const metrics = calculateCentralizationMetrics(
        holders,
        tokenInfo.total_supply,
        whaleHolders.length
      );

      console.log("📈 Centralization Analysis:");
      console.log(`   Gini: ${metrics.gini_coefficient.toFixed(3)}`);
      console.log(`   Nakamoto: ${metrics.nakamoto_coefficient}`);
      console.log(`   Top 10: ${metrics.top10_percentage.toFixed(2)}%`);
      console.log(`   Risk: ${metrics.risk_level.toUpperCase()}`);
      console.log();

      const riskScore = calculateEnhancedRiskScore(metrics, whaleHolders, []);
      console.log("⚠️  Enhanced Risk Score:");
      console.log(`   Overall: ${riskScore.overall_score.toFixed(1)}/100 (${riskScore.risk_level.toUpperCase()})`);
      console.log(`   Centralization: ${riskScore.breakdown.centralization_risk.score.toFixed(1)}/100`);
      console.log(`   Exchange Risk: ${riskScore.breakdown.exchange_concentration_risk.score.toFixed(1)}/100`);
    } else {
      console.log("⚠️  Holders have very small balances");
    }

    console.log();
    console.log("✅ WETH test completed!");

  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

testWETH();
