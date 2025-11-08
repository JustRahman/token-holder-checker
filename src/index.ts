// Token Holder Monitor Agent
// Built with @lucid-dreams/agent-kit

import { z } from "zod";
import { createAgentApp } from "@lucid-dreams/agent-kit";
import {
  AnalysisOutput,
  Holder,
  WhaleHolder,
} from "./types.js";
import { calculateCentralizationMetrics } from "./metrics.js";
import { identifyWhales, analyzeDistribution } from "./whales.js";
import { generateAlerts } from "./alerts.js";
import { fetchTokenHolders, fetchTokenInfo } from "./services/blockchainData.js";
import { getTokenMarketData } from "./services/priceData.js";
// import { labelAddress } from "./services/addressLabeler.js"; // For future use
import { calculateEnhancedRiskScore } from "./services/riskScoring.js";
import { getCacheStats } from "./services/cache.js";
import {
  getMockWhaleActivity,
  getMockHolderTrends,
  getMockBlockHeight,
} from "./mock-data.js";

// Check if payments should be enabled
const paymentsEnabled = process.env.ENABLE_PAYMENTS === 'true';

// Create the agent app with optional X402 payment protection
const { app, addEntrypoint } = createAgentApp(
  {
    name: "token-holder-monitor",
    version: "0.1.0",
    description:
      "Monitor token holder distributions, track whale wallets, and generate alerts for centralization risks and large holder activity across multiple blockchain networks.",
  },
  paymentsEnabled ? {
    config: {
      payments: {
        facilitatorUrl: (process.env.FACILITATOR_URL || "https://facilitator.daydreams.systems") as `${string}://${string}`,
        payTo: (process.env.PAY_TO_WALLET || "0x992920386E3D950BC260f99C81FDA12419eD4594") as `0x${string}`,
        network: (process.env.PAYMENT_NETWORK || "base") as "base",
        defaultPrice: process.env.PAYMENT_AMOUNT || "0.01"  // $0.01 USDC per analysis
      }
    },
    useConfigPayments: true  // ✅ Enables X402 payment middleware
  } : {}
);

// Input schema validation
const InputSchema = z.object({
  token_address: z.string().describe("Token contract address"),
  chain: z
    .string()
    .describe("Blockchain network (ethereum, base, arbitrum, optimism, polygon, bsc)"),
  whale_threshold_usd: z
    .number()
    .optional()
    .describe("Minimum USD value to be considered a whale (default: $100k)"),
  whale_threshold_percent: z
    .number()
    .optional()
    .describe("Minimum % of supply to be considered a whale (default: 1%)"),
  top_holders_count: z
    .number()
    .optional()
    .describe("Number of top holders to analyze (default: 100)"),
  track_transfers: z
    .boolean()
    .optional()
    .describe("Monitor real-time transfers (default: true)"),
  alert_threshold_usd: z
    .number()
    .optional()
    .describe("Alert on transfers above this USD value (default: $50k)"),
  time_window: z
    .enum(["1h", "24h", "7d", "30d"])
    .optional()
    .describe("Time window for activity analysis (default: 24h)"),
});

// Main analysis entrypoint
addEntrypoint({
  key: "analyze_holders",
  description:
    "Analyze token holder distribution, identify whales, calculate centralization metrics, and generate alerts for risk assessment",
  input: InputSchema as any,
  async handler({ input }) {
    // Parse and set defaults
    const {
      token_address,
      chain,
      whale_threshold_usd = 100_000,
      whale_threshold_percent = 1,
      top_holders_count = 100,
      alert_threshold_usd = 50_000,
    } = input;

    // Note: track_transfers and time_window are parsed but not yet used in mock implementation
    // They will be used when real-time monitoring is implemented

    console.log(
      `[Token Holder Monitor] Analyzing ${token_address} on ${chain}...`
    );

    // Step 1: Fetch token information and price data in parallel
    const [tokenInfo, marketData] = await Promise.all([
      fetchTokenInfo(token_address, chain),
      getTokenMarketData(token_address, chain),
    ]);

    // Update token info with market data
    tokenInfo.current_price_usd = marketData.price;
    tokenInfo.market_cap_usd = marketData.marketCap;

    console.log(
      `[Token Holder Monitor] Token: ${tokenInfo.name} (${tokenInfo.symbol})`
    );
    console.log(
      `[Token Holder Monitor] Price: $${tokenInfo.current_price_usd.toFixed(4)}`
    );
    console.log(
      `[Token Holder Monitor] Market Cap: $${(
        tokenInfo.market_cap_usd / 1_000_000
      ).toFixed(2)}M`
    );

    // Step 2: Fetch top holders
    const holders: Holder[] = await fetchTokenHolders(
      token_address,
      chain,
      top_holders_count
    );

    // Update total holders
    tokenInfo.total_holders = holders.length;

    console.log(
      `[Token Holder Monitor] Fetched ${holders.length} top holders`
    );

    // Step 3: Identify whales
    const whaleHolders: WhaleHolder[] = identifyWhales(
      holders,
      whale_threshold_usd,
      whale_threshold_percent,
      tokenInfo
    );

    console.log(
      `[Token Holder Monitor] Identified ${whaleHolders.length} whale holders`
    );

    // Step 4: Calculate centralization metrics
    const centralizationMetrics = calculateCentralizationMetrics(
      holders,
      tokenInfo.total_supply,
      whaleHolders.length
    );

    console.log(
      `[Token Holder Monitor] Centralization Score: ${centralizationMetrics.centralization_score.toFixed(
        2
      )} (${centralizationMetrics.risk_level})`
    );
    console.log(
      `[Token Holder Monitor] Gini Coefficient: ${centralizationMetrics.gini_coefficient.toFixed(
        3
      )}`
    );
    console.log(
      `[Token Holder Monitor] Nakamoto Coefficient: ${centralizationMetrics.nakamoto_coefficient}`
    );

    // Step 5: Analyze distribution
    const distributionAnalysis = analyzeDistribution(holders, tokenInfo);

    // Step 6: Get recent whale activity
    // TODO: Replace with real blockchain event monitoring
    const whaleAddresses = whaleHolders.map((w) => w.address);
    const recentActivity = getMockWhaleActivity(
      whaleAddresses,
      tokenInfo.current_price_usd,
      tokenInfo.total_supply
    );

    console.log(
      `[Token Holder Monitor] Found ${recentActivity.length} recent whale activities`
    );

    // Step 7: Generate alerts
    const alerts = generateAlerts(
      centralizationMetrics,
      recentActivity,
      alert_threshold_usd
    );

    console.log(`[Token Holder Monitor] Generated ${alerts.length} alerts`);

    // Step 8: Calculate enhanced risk score
    const enhancedRiskScore = calculateEnhancedRiskScore(
      centralizationMetrics,
      whaleHolders,
      recentActivity
    );

    console.log(
      `[Token Holder Monitor] Enhanced Risk Score: ${enhancedRiskScore.overall_score.toFixed(1)}/100 (${enhancedRiskScore.risk_level.toUpperCase()})`
    );

    // Step 9: Calculate holder trends
    // TODO: Replace with real historical data analysis
    const holderTrends = getMockHolderTrends();

    // Step 10: Get current block height
    const blockHeight = getMockBlockHeight(chain);

    // Determine data sources
    const dataSources: string[] = [];
    if (tokenInfo.name !== "Mock Token") {
      dataSources.push("moralis");
    }
    if (marketData.price > 0 && marketData.price !== 1.5) {
      dataSources.push("coingecko");
    }
    if (dataSources.length === 0) {
      dataSources.push("mock-data");
    }

    // Get cache statistics
    const cacheStats = getCacheStats();
    console.log(
      `[Cache Stats] Holders: ${cacheStats.holderCache.keys} | Prices: ${cacheStats.priceCache.keys} | Tokens: ${cacheStats.tokenInfoCache.keys}`
    );

    // Build the output
    const output: AnalysisOutput = {
      token_info: tokenInfo,
      centralization_metrics: centralizationMetrics,
      whale_holders: whaleHolders,
      recent_whale_activity: recentActivity,
      distribution_analysis: distributionAnalysis,
      alerts,
      holder_trends: holderTrends,
      enhanced_risk_score: enhancedRiskScore,
      metadata: {
        last_updated: Date.now(),
        block_height: blockHeight,
        data_sources: dataSources,
        cache_ttl: 900, // 15 minutes
      },
    };

    console.log(
      `[Token Holder Monitor] Analysis complete for ${token_address}`
    );

    return {
      output,
      usage: { total_tokens: 2000 },
    };
  },
});

// Health check entrypoint
addEntrypoint({
  key: "health",
  description: "Check if the token holder monitor agent is running",
  input: z.object({}) as any,
  async handler() {
    return {
      output: {
        status: "ok",
        version: "0.1.0",
        timestamp: Date.now(),
        supported_chains: [
          "ethereum",
          "base",
          "arbitrum",
          "optimism",
          "polygon",
          "bsc",
        ],
      },
      usage: { total_tokens: 100 },
    };
  },
});

// Start the server
import { serve } from "@hono/node-server";

const port = parseInt(process.env.PORT || "3000", 10);

console.log(`🚀 Starting Token Holder Monitor on port ${port}...`);
if (paymentsEnabled) {
  console.log(`💰 Payment enabled: X402 protocol`);
  console.log(`   • Price: ${process.env.PAYMENT_AMOUNT || "0.01"} USDC per call`);
  console.log(`   • Network: ${process.env.PAYMENT_NETWORK || "base"}`);
  console.log(`   • Wallet: ${process.env.PAY_TO_WALLET || "0x992920386E3D950BC260f99C81FDA12419eD4594"}`);
} else {
  console.log(`🎁 FREE access mode (ENABLE_PAYMENTS=false)`);
}
console.log();

serve({
  fetch: app.fetch,
  port,
});

console.log(`✅ Server running at http://localhost:${port}`);
console.log(`📊 Entrypoints:`);
console.log(`   • POST /entrypoints/analyze_holders`);
console.log(`   • POST /entrypoints/health`);
console.log();

// Export the app
export default app;
