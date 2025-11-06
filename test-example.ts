// Example test script demonstrating the token holder monitor

import app from "./dist/index.js";

async function runTests() {
  console.log("=".repeat(60));
  console.log("Token Holder Monitor - Test Suite");
  console.log("=".repeat(60));
  console.log();

  try {
    // Test 1: Health check
    console.log("Test 1: Health Check");
    console.log("-".repeat(60));

    const healthHandler = app.entrypoints.find(e => e.key === "health");
    if (healthHandler) {
      const healthResult = await healthHandler.handler({ input: {} });
      console.log("✓ Health check passed");
      console.log(JSON.stringify(healthResult.output, null, 2));
    }
    console.log();

    // Test 2: Analyze a token (using mock data)
    console.log("Test 2: Analyze Token Holders");
    console.log("-".repeat(60));

    const analyzeHandler = app.entrypoints.find(e => e.key === "analyze_holders");
    if (analyzeHandler) {
      const testInput = {
        token_address: "0x1234567890123456789012345678901234567890",
        chain: "ethereum",
        whale_threshold_usd: 100000,
        whale_threshold_percent: 1,
        top_holders_count: 100,
        alert_threshold_usd: 50000,
      };

      console.log("Input:", JSON.stringify(testInput, null, 2));
      console.log();

      const result = await analyzeHandler.handler({ input: testInput });

      console.log("✓ Analysis completed successfully");
      console.log();

      // Display key metrics
      const output = result.output;

      console.log("Token Information:");
      console.log(`  Name: ${output.token_info.name} (${output.token_info.symbol})`);
      console.log(`  Chain: ${output.token_info.chain}`);
      console.log(`  Price: $${output.token_info.current_price_usd}`);
      console.log(`  Market Cap: $${(output.token_info.market_cap_usd / 1_000_000).toFixed(2)}M`);
      console.log(`  Total Holders: ${output.token_info.total_holders.toLocaleString()}`);
      console.log();

      console.log("Centralization Metrics:");
      console.log(`  Risk Level: ${output.centralization_metrics.risk_level.toUpperCase()}`);
      console.log(`  Centralization Score: ${output.centralization_metrics.centralization_score.toFixed(2)}/100`);
      console.log(`  Gini Coefficient: ${output.centralization_metrics.gini_coefficient.toFixed(3)}`);
      console.log(`  Nakamoto Coefficient: ${output.centralization_metrics.nakamoto_coefficient}`);
      console.log(`  Top 10 Holders: ${output.centralization_metrics.top10_percentage.toFixed(2)}%`);
      console.log(`  Top 50 Holders: ${output.centralization_metrics.top50_percentage.toFixed(2)}%`);
      console.log(`  HHI: ${output.centralization_metrics.herfindahl_index}`);
      console.log();

      console.log("Whale Holders:");
      console.log(`  Total Whales: ${output.whale_holders.length}`);
      output.whale_holders.slice(0, 5).forEach((whale, i) => {
        const label = whale.label ? ` (${whale.label})` : "";
        console.log(`  ${i + 1}. ${whale.address}${label}`);
        console.log(`     Balance: ${whale.balance.toLocaleString()} (${whale.percentage_of_supply.toFixed(2)}%)`);
        console.log(`     USD Value: $${(whale.balance_usd / 1_000_000).toFixed(2)}M`);
      });
      console.log();

      console.log("Distribution Analysis:");
      console.log(`  Whales (>5%): ${output.distribution_analysis.whales.count} holders (${output.distribution_analysis.whales.total_percentage.toFixed(2)}%)`);
      console.log(`  Large (1-5%): ${output.distribution_analysis.large_holders.count} holders (${output.distribution_analysis.large_holders.total_percentage.toFixed(2)}%)`);
      console.log(`  Medium (0.1-1%): ${output.distribution_analysis.medium_holders.count} holders (${output.distribution_analysis.medium_holders.total_percentage.toFixed(2)}%)`);
      console.log(`  Small (0.01-0.1%): ${output.distribution_analysis.small_holders.count} holders (${output.distribution_analysis.small_holders.total_percentage.toFixed(2)}%)`);
      console.log(`  Retail (<0.01%): ${output.distribution_analysis.retail_holders.count} holders (${output.distribution_analysis.retail_holders.total_percentage.toFixed(2)}%)`);
      console.log();

      console.log("Recent Whale Activity:");
      console.log(`  Total Activities: ${output.recent_whale_activity.length}`);
      output.recent_whale_activity.slice(0, 3).forEach((activity, i) => {
        const date = new Date(activity.timestamp).toLocaleString();
        console.log(`  ${i + 1}. ${activity.type.toUpperCase()} - ${date}`);
        console.log(`     Amount: $${(activity.amount_usd / 1_000_000).toFixed(2)}M (${activity.percentage_of_supply.toFixed(2)}%)`);
        if (activity.exchange_detected) {
          console.log(`     Exchange: ${activity.exchange_detected}`);
        }
      });
      console.log();

      console.log("Alerts:");
      console.log(`  Total Alerts: ${output.alerts.length}`);
      output.alerts.forEach((alert, i) => {
        const severity = alert.severity.toUpperCase();
        const icon = alert.severity === "critical" ? "🔴" : alert.severity === "warning" ? "🟡" : "🔵";
        console.log(`  ${icon} [${severity}] ${alert.message}`);
      });
      console.log();

      console.log("Holder Trends:");
      console.log(`  24h Change: ${output.holder_trends.holder_count_change_24h > 0 ? "+" : ""}${output.holder_trends.holder_count_change_24h} holders`);
      console.log(`  7d Change: ${output.holder_trends.holder_count_change_7d > 0 ? "+" : ""}${output.holder_trends.holder_count_change_7d} holders`);
      console.log(`  Trend: ${output.holder_trends.whale_accumulation_trend}`);
      console.log(`  24h Net Flow: $${(output.holder_trends.net_flow_24h_usd / 1_000_000).toFixed(2)}M`);
      console.log();
    }

    console.log("=".repeat(60));
    console.log("All tests completed successfully! ✓");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

// Run tests
runTests().catch(console.error);
