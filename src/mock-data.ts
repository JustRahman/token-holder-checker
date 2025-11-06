// Mock data for testing the token holder monitor

import { Holder, TokenInfo, WhaleActivity, HolderTrends } from "./types.js";

/**
 * Generate mock token information
 */
export function getMockTokenInfo(
  tokenAddress: string,
  chain: string
): TokenInfo {
  return {
    name: "Mock Token",
    symbol: "MOCK",
    address: tokenAddress,
    chain: chain,
    total_supply: 1_000_000_000, // 1 billion tokens
    circulating_supply: 800_000_000, // 800 million circulating
    current_price_usd: 1.5, // $1.50 per token
    market_cap_usd: 1_200_000_000, // $1.2B market cap
    total_holders: 15000,
  };
}

/**
 * Generate mock holder data with realistic distribution
 * Creates a mix of whales, large holders, medium holders, and retail
 */
export function getMockHolders(count: number, totalSupply: number): Holder[] {
  const holders: Holder[] = [];
  const now = Date.now();

  // Known exchange addresses
  const exchanges = [
    { address: "0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be", label: "Binance" },
    { address: "0xa910f92acdaf488fa6ef02174fb86208ad7722ba", label: "Coinbase" },
    { address: "0x6b76f8b1e9e59913bfe758821887311ba1805cab", label: "Kraken" },
  ];

  // Generate top whales (3 exchanges holding significant amounts)
  exchanges.forEach((exchange, i) => {
    holders.push({
      address: exchange.address,
      balance: totalSupply * (0.08 - i * 0.02), // 8%, 6%, 4%
      first_seen: now - 365 * 24 * 60 * 60 * 1000, // 1 year ago
      last_activity: now - Math.random() * 7 * 24 * 60 * 60 * 1000,
      is_contract: true,
    });
  });

  // Generate 7 more whale holders (1-5% each)
  for (let i = 0; i < 7; i++) {
    holders.push({
      address: `0x${Math.random().toString(16).substr(2, 40)}`,
      balance: totalSupply * (0.04 - i * 0.005), // 4% down to 1%
      first_seen: now - Math.random() * 365 * 24 * 60 * 60 * 1000,
      last_activity: now - Math.random() * 30 * 24 * 60 * 60 * 1000,
      is_contract: Math.random() > 0.7,
    });
  }

  // Generate remaining holders with decreasing balances
  const remainingCount = count - holders.length;
  let remainingSupply = totalSupply * 0.62; // 62% for remaining holders

  for (let i = 0; i < remainingCount; i++) {
    // Exponential decay for realistic distribution
    const portion = Math.pow(0.95, i);
    const balance = (remainingSupply * portion) / remainingCount;

    holders.push({
      address: `0x${Math.random().toString(16).substr(2, 40)}`,
      balance: balance,
      first_seen: now - Math.random() * 365 * 24 * 60 * 60 * 1000,
      last_activity: now - Math.random() * 90 * 24 * 60 * 60 * 1000,
      is_contract: Math.random() > 0.9,
    });
  }

  return holders;
}

/**
 * Generate mock whale activity (recent transfers)
 */
export function getMockWhaleActivity(
  whaleAddresses: string[],
  tokenPrice: number,
  totalSupply: number
): WhaleActivity[] {
  const activities: WhaleActivity[] = [];
  const now = Date.now();

  const exchanges = [
    "0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be", // Binance
    "0xa910f92acdaf488fa6ef02174fb86208ad7722ba", // Coinbase
  ];

  // Generate 5-10 recent activities
  const activityCount = 5 + Math.floor(Math.random() * 5);

  for (let i = 0; i < activityCount; i++) {
    const amount = 500_000 + Math.random() * 2_000_000; // 500K - 2.5M tokens
    const amountUsd = amount * tokenPrice;
    const percentOfSupply = (amount / totalSupply) * 100;

    // Random activity type
    const rand = Math.random();
    let type: "buy" | "sell" | "transfer";
    let fromAddress: string;
    let toAddress: string;
    let fromLabel: string | undefined;
    let toLabel: string | undefined;
    let exchangeDetected: string | undefined;

    if (rand < 0.4) {
      // Sell to exchange
      type = "sell";
      fromAddress = whaleAddresses[Math.floor(Math.random() * whaleAddresses.length)];
      toAddress = exchanges[Math.floor(Math.random() * exchanges.length)];
      toLabel = toAddress === exchanges[0] ? "Binance" : "Coinbase";
      exchangeDetected = toLabel;
    } else if (rand < 0.7) {
      // Buy from exchange
      type = "buy";
      fromAddress = exchanges[Math.floor(Math.random() * exchanges.length)];
      toAddress = whaleAddresses[Math.floor(Math.random() * whaleAddresses.length)];
      fromLabel = fromAddress === exchanges[0] ? "Binance" : "Coinbase";
      exchangeDetected = fromLabel;
    } else {
      // Wallet to wallet transfer
      type = "transfer";
      fromAddress = whaleAddresses[Math.floor(Math.random() * whaleAddresses.length)];
      toAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
    }

    activities.push({
      tx_hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      timestamp: now - Math.random() * 24 * 60 * 60 * 1000, // Within last 24h
      from_address: fromAddress,
      to_address: toAddress,
      amount,
      amount_usd: amountUsd,
      percentage_of_supply: Math.round(percentOfSupply * 100) / 100,
      type,
      from_label: fromLabel,
      to_label: toLabel,
      exchange_detected: exchangeDetected,
      price_impact_estimated: percentOfSupply > 0.5 ? percentOfSupply * 0.3 : undefined,
    });
  }

  // Sort by timestamp (most recent first)
  activities.sort((a, b) => b.timestamp - a.timestamp);

  return activities;
}

/**
 * Generate mock holder trends
 */
export function getMockHolderTrends(): HolderTrends {
  return {
    holder_count_change_24h: Math.floor(Math.random() * 100) - 50, // -50 to +50
    holder_count_change_7d: Math.floor(Math.random() * 500) - 250, // -250 to +250
    whale_accumulation_trend: Math.random() > 0.5 ? "accumulating" : "distributing",
    net_flow_24h_usd: (Math.random() - 0.5) * 10_000_000, // -5M to +5M
  };
}

/**
 * Get latest block height (mock)
 */
export function getMockBlockHeight(chain: string): number {
  const baseHeights: Record<string, number> = {
    ethereum: 18_500_000,
    base: 5_000_000,
    arbitrum: 150_000_000,
    optimism: 110_000_000,
    polygon: 50_000_000,
    bsc: 35_000_000,
  };

  const base = baseHeights[chain.toLowerCase()] || 18_500_000;
  return base + Math.floor(Math.random() * 1000);
}
