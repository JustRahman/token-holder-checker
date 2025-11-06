// Simple test to verify core functionality

import { calculateCentralizationMetrics } from "./src/metrics.js";
import { identifyWhales, analyzeDistribution } from "./src/whales.js";
import { generateAlerts } from "./src/alerts.js";
import {
  getMockTokenInfo,
  getMockHolders,
  getMockWhaleActivity,
  getMockHolderTrends,
} from "./src/mock-data.js";

async function runSimpleTest() {
  console.log("=".repeat(60));
  console.log("Token Holder Monitor - Simple Test");
  console.log("=".repeat(60));
  console.log();

  try {
    // Setup test data
    const tokenAddress = "0x1234567890123456789012345678901234567890";
    const chain = "ethereum";

    console.log("1. Generating mock token info...");
    const tokenInfo = getMockTokenInfo(tokenAddress, chain);
    console.log(`   ✓ Token: ${tokenInfo.name} (${tokenInfo.symbol})`);
    console.log(`   ✓ Market Cap: $${(tokenInfo.market_cap_usd / 1_000_000).toFixed(2)}M`);
    console.log();

    console.log("2. Generating mock holders...");
    const holders = getMockHolders(100, tokenInfo.total_supply);
    console.log(`   ✓ Generated ${holders.length} holders`);
    console.log();

    console.log("3. Identifying whales...");
    const whaleHolders = identifyWhales(holders, 100_000, 1, tokenInfo);
    console.log(`   ✓ Found ${whaleHolders.length} whale holders`);
    console.log();

    console.log("4. Calculating centralization metrics...");
    const metrics = calculateCentralizationMetrics(
      holders,
      tokenInfo.total_supply,
      whaleHolders.length
    );
    console.log(`   ✓ Gini Coefficient: ${metrics.gini_coefficient.toFixed(3)}`);
    console.log(`   ✓ Nakamoto Coefficient: ${metrics.nakamoto_coefficient}`);
    console.log(`   ✓ Top 10%: ${metrics.top10_percentage.toFixed(2)}%`);
    console.log(`   ✓ Centralization Score: ${metrics.centralization_score.toFixed(2)}/100`);
    console.log(`   ✓ Risk Level: ${metrics.risk_level.toUpperCase()}`);
    console.log();

    console.log("5. Analyzing distribution...");
    const distribution = analyzeDistribution(holders, tokenInfo);
    console.log(`   ✓ Whales: ${distribution.whales.count} (${distribution.whales.total_percentage.toFixed(2)}%)`);
    console.log(`   ✓ Large: ${distribution.large_holders.count} (${distribution.large_holders.total_percentage.toFixed(2)}%)`);
    console.log(`   ✓ Medium: ${distribution.medium_holders.count} (${distribution.medium_holders.total_percentage.toFixed(2)}%)`);
    console.log();

    console.log("6. Generating mock whale activity...");
    const whaleActivity = getMockWhaleActivity(
      whaleHolders.map(w => w.address),
      tokenInfo.current_price_usd,
      tokenInfo.total_supply
    );
    console.log(`   ✓ Generated ${whaleActivity.length} activities`);
    console.log();

    console.log("7. Generating alerts...");
    const alerts = generateAlerts(metrics, whaleActivity, 50_000);
    console.log(`   ✓ Generated ${alerts.length} alerts`);
    alerts.forEach((alert, i) => {
      const icon = alert.severity === "critical" ? "🔴" : alert.severity === "warning" ? "🟡" : "🔵";
      console.log(`   ${icon} [${alert.severity.toUpperCase()}] ${alert.message}`);
    });
    console.log();

    console.log("8. Getting holder trends...");
    const trends = getMockHolderTrends();
    console.log(`   ✓ 24h Change: ${trends.holder_count_change_24h > 0 ? "+" : ""}${trends.holder_count_change_24h}`);
    console.log(`   ✓ Trend: ${trends.whale_accumulation_trend}`);
    console.log();

    console.log("=".repeat(60));
    console.log("Top 5 Whale Holders:");
    console.log("=".repeat(60));
    whaleHolders.slice(0, 5).forEach((whale, i) => {
      const label = whale.label ? ` (${whale.label})` : "";
      console.log(`${i + 1}. ${whale.address}${label}`);
      console.log(`   Balance: ${(whale.balance / 1_000_000).toFixed(2)}M tokens (${whale.percentage_of_supply.toFixed(2)}%)`);
      console.log(`   USD Value: $${(whale.balance_usd / 1_000_000).toFixed(2)}M`);
      console.log();
    });

    console.log("=".repeat(60));
    console.log("Recent Whale Activity (Top 3):");
    console.log("=".repeat(60));
    whaleActivity.slice(0, 3).forEach((activity, i) => {
      const date = new Date(activity.timestamp).toLocaleString();
      console.log(`${i + 1}. ${activity.type.toUpperCase()} - ${date}`);
      console.log(`   Amount: $${(activity.amount_usd / 1_000_000).toFixed(2)}M (${activity.percentage_of_supply.toFixed(2)}%)`);
      if (activity.exchange_detected) {
        console.log(`   Exchange: ${activity.exchange_detected}`);
      }
      console.log();
    });

    console.log("=".repeat(60));
    console.log("All tests passed successfully! ✓");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

// Run test
runSimpleTest().catch(console.error);
