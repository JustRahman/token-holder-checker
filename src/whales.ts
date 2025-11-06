// Whale detection and classification functions

import { Holder, WhaleHolder, TokenInfo, DistributionAnalysis } from "./types.js";

// Known exchange addresses (abbreviated list for demo)
const KNOWN_EXCHANGES: Record<string, string> = {
  "0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be": "Binance",
  "0xd551234ae421e3bcba99a0da6d736074f22192ff": "Binance",
  "0x564286362092d8e7936f0549571a803b203aaced": "Binance",
  "0x0681d8db095565fe8a346fa0277bffde9c0edbbf": "Binance",
  "0xfe9e8709d3215310075d67e3ed32a380ccf451c8": "Binance",
  "0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503": "Binance",
  "0x28c6c06298d514db089934071355e5743bf21d60": "Binance US",
  "0x21a31ee1afc51d94c2efccaa2092ad1028285549": "Binance DEX",
  "0x61edcdf5bb737adffe5043706e7c5bb1f1a56eea": "Binance DEX",
  "0xa910f92acdaf488fa6ef02174fb86208ad7722ba": "Coinbase",
  "0x503828976d22510aad0201ac7ec88293211d23da": "Coinbase",
  "0xddfabcdc4d8ffc6d5beaf154f18b778f892a0740": "Coinbase",
  "0x71660c4005ba85c37ccec55d0c4493e66fe775d3": "Coinbase",
  "0x267be1c1d684f78cb4f6a176c4911b741e4ffdc0": "Coinbase",
  "0x6b76f8b1e9e59913bfe758821887311ba1805cab": "Kraken",
  "0xae2d4617c862309a3d75a0ffb358c7a5009c673f": "Kraken",
  "0x53d284357ec70ce289d6d64134dfac8e511c8a3d": "Kraken",
  "0x89e51fa8ca5d66cd220baed62ed01e8951aa7c40": "Kraken",
  "0x0a869d79a7052c7f1b55a8ebabbea3420f0d1e13": "Kraken",
  "0xe853c56864a2ebe4576a807d26fdc4a0ada51919": "Kraken",
  "0x2910543af39aba0cd09dbb2d50200b3e800a63d2": "Kraken",
  "0x94a1b5cdb22c43faab4abeb5c74999895464ddaf": "Bitfinex",
  "0xcafb10ee663f465f9d10588ac44ed20ed608c11e": "Bitfinex",
  "0x742d35cc6634c0532925a3b844bc454e4438f44e": "Bitfinex",
  "0x876eabf441b2ee5b5b0554fd502a8e0600950cfa": "Bitfinex",
  "0x0eee3e3828a45f7601d5f54bf49bb01d1a9df5ea": "Bitfinex",
};

/**
 * Label an address if it's known (exchange, contract, etc.)
 */
export function labelAddress(address: string): string | undefined {
  const normalized = address.toLowerCase();
  return KNOWN_EXCHANGES[normalized];
}

/**
 * Get tags for an address
 */
export function getAddressTags(address: string): string[] {
  const tags: string[] = [];
  const label = labelAddress(address);

  if (label) {
    tags.push("exchange");
  }

  // Check if it's a contract (simplified - in reality would check on-chain)
  // For now, known exchanges are contracts
  if (label) {
    tags.push("contract");
  }

  return tags;
}

/**
 * Identify whale holders based on thresholds
 */
export function identifyWhales(
  holders: Holder[],
  usdThreshold: number,
  percentThreshold: number,
  tokenInfo: TokenInfo
): WhaleHolder[] {
  return holders
    .filter((holder) => {
      const usdValue = holder.balance * tokenInfo.current_price_usd;
      const percentOfSupply = (holder.balance / tokenInfo.total_supply) * 100;

      return usdValue >= usdThreshold || percentOfSupply >= percentThreshold;
    })
    .sort((a, b) => b.balance - a.balance) // Sort by balance descending
    .map((holder, index) => {
      const usdValue = holder.balance * tokenInfo.current_price_usd;
      const percentOfSupply = (holder.balance / tokenInfo.total_supply) * 100;

      return {
        address: holder.address,
        balance: holder.balance,
        balance_usd: usdValue,
        percentage_of_supply: Math.round(percentOfSupply * 100) / 100,
        rank: index + 1,
        label: labelAddress(holder.address),
        first_seen: holder.first_seen || Date.now(),
        last_activity: holder.last_activity || Date.now(),
        is_contract: holder.is_contract || false,
        tags: getAddressTags(holder.address),
      };
    });
}

/**
 * Analyze token distribution into different holder buckets
 */
export function analyzeDistribution(
  holders: Holder[],
  tokenInfo: TokenInfo
): DistributionAnalysis {
  const analysis: DistributionAnalysis = {
    retail_holders: { count: 0, total_percentage: 0 },
    small_holders: { count: 0, total_percentage: 0 },
    medium_holders: { count: 0, total_percentage: 0 },
    large_holders: { count: 0, total_percentage: 0 },
    whales: { count: 0, total_percentage: 0 },
  };

  let retailSum = 0;
  let smallSum = 0;
  let mediumSum = 0;
  let largeSum = 0;
  let whaleSum = 0;

  holders.forEach((holder) => {
    const percentOfSupply = (holder.balance / tokenInfo.total_supply) * 100;

    if (percentOfSupply < 0.01) {
      // < 0.01% - Retail
      analysis.retail_holders.count++;
      retailSum += holder.balance;
    } else if (percentOfSupply < 0.1) {
      // 0.01% - 0.1% - Small
      analysis.small_holders.count++;
      smallSum += holder.balance;
    } else if (percentOfSupply < 1) {
      // 0.1% - 1% - Medium
      analysis.medium_holders.count++;
      mediumSum += holder.balance;
    } else if (percentOfSupply < 5) {
      // 1% - 5% - Large
      analysis.large_holders.count++;
      largeSum += holder.balance;
    } else {
      // > 5% - Whales
      analysis.whales.count++;
      whaleSum += holder.balance;
    }
  });

  // Calculate percentages
  const totalSupply = tokenInfo.total_supply;
  analysis.retail_holders.total_percentage =
    Math.round((retailSum / totalSupply) * 10000) / 100;
  analysis.small_holders.total_percentage =
    Math.round((smallSum / totalSupply) * 10000) / 100;
  analysis.medium_holders.total_percentage =
    Math.round((mediumSum / totalSupply) * 10000) / 100;
  analysis.large_holders.total_percentage =
    Math.round((largeSum / totalSupply) * 10000) / 100;
  analysis.whales.total_percentage =
    Math.round((whaleSum / totalSupply) * 10000) / 100;

  return analysis;
}
