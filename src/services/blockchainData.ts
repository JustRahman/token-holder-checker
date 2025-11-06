// Blockchain data service - Fetch token holders and info from APIs

import axios from "axios";
import { config, hasApiKeys } from "../config/index.js";
import { Holder, TokenInfo } from "../types.js";
import { apiCall } from "./apiUtils.js";
import { holderCache, tokenInfoCache, getOrSet, generateCacheKey } from "./cache.js";
import { getMockHolders, getMockTokenInfo } from "../mock-data.js";

/**
 * Moralis chain IDs
 */
const MORALIS_CHAIN_IDS: Record<string, string> = {
  ethereum: "0x1",
  base: "0x2105",
  arbitrum: "0xa4b1",
  optimism: "0xa",
  polygon: "0x89",
  bsc: "0x38",
};

/**
 * Fetch token holders using Moralis API
 */
async function fetchHoldersFromMoralis(
  tokenAddress: string,
  chain: string,
  limit: number = 100
): Promise<Holder[]> {
  if (!config.moralisApiKey) {
    throw new Error("Moralis API key not configured");
  }

  const chainId = MORALIS_CHAIN_IDS[chain.toLowerCase()];
  if (!chainId) {
    throw new Error(`Chain ${chain} not supported by Moralis`);
  }

  const holders: Holder[] = [];
  let cursor: string | null = null;
  let fetchedCount = 0;

  console.log(`[Moralis] Fetching holders for ${tokenAddress} on ${chain}...`);

  // Fetch holders with pagination
  while (fetchedCount < limit) {
    const url = `https://deep-index.moralis.io/api/v2.2/erc20/${tokenAddress}/owners`;
    const params: any = {
      chain: chainId,
      limit: Math.min(100, limit - fetchedCount), // Max 100 per request
    };

    if (cursor) {
      params.cursor = cursor;
    }

    const response = await apiCall(
      `moralis-holders-${tokenAddress}`,
      async () => {
        const res = await axios.get(url, {
          params,
          headers: {
            "X-API-Key": config.moralisApiKey,
          },
        });
        return res.data;
      }
    );

    if (response.result && Array.isArray(response.result)) {
      for (const holder of response.result) {
        holders.push({
          address: holder.owner_address,
          balance: parseFloat(holder.balance) / Math.pow(10, holder.token_decimals || 18),
          is_contract: holder.owner_address.length > 42, // Simplified check
        });
      }

      fetchedCount += response.result.length;
    }

    // Check if there are more results
    cursor = response.cursor || null;
    if (!cursor || fetchedCount >= limit) {
      break;
    }
  }

  console.log(`[Moralis] Fetched ${holders.length} holders`);
  return holders;
}

/**
 * Fetch token info using Moralis API
 */
async function fetchTokenInfoFromMoralis(
  tokenAddress: string,
  chain: string
): Promise<TokenInfo> {
  if (!config.moralisApiKey) {
    throw new Error("Moralis API key not configured");
  }

  const chainId = MORALIS_CHAIN_IDS[chain.toLowerCase()];
  if (!chainId) {
    throw new Error(`Chain ${chain} not supported by Moralis`);
  }

  console.log(`[Moralis] Fetching token info for ${tokenAddress} on ${chain}...`);

  const url = `https://deep-index.moralis.io/api/v2.2/erc20/metadata`;
  const response = await apiCall(
    `moralis-token-info-${tokenAddress}`,
    async () => {
      const res = await axios.get(url, {
        params: {
          chain: chainId,
          addresses: [tokenAddress],
        },
        headers: {
          "X-API-Key": config.moralisApiKey,
        },
      });
      return res.data;
    }
  );

  if (!response || !response[0]) {
    throw new Error("Token not found");
  }

  const token = response[0];

  return {
    name: token.name || "Unknown",
    symbol: token.symbol || "UNKNOWN",
    address: tokenAddress,
    chain: chain,
    total_supply: parseFloat(token.total_supply || "0") / Math.pow(10, token.decimals || 18),
    circulating_supply: parseFloat(token.total_supply || "0") / Math.pow(10, token.decimals || 18), // Moralis doesn't provide circulating supply
    current_price_usd: 0, // Will be fetched separately
    market_cap_usd: 0, // Will be calculated later
    total_holders: 0, // Will be updated from holders data
  };
}

/**
 * Fetch token holders (with fallback to mock data)
 */
export async function fetchTokenHolders(
  tokenAddress: string,
  chain: string,
  limit: number = 100
): Promise<Holder[]> {
  const cacheKey = generateCacheKey("holders", {
    token: tokenAddress.toLowerCase(),
    chain: chain.toLowerCase(),
    limit,
  });

  return getOrSet(
    holderCache,
    cacheKey,
    async () => {
      // Try to use real API if keys are available
      if (hasApiKeys()) {
        try {
          // Try Moralis first
          if (config.moralisApiKey) {
            return await fetchHoldersFromMoralis(tokenAddress, chain, limit);
          }

          // TODO: Add Alchemy fallback
          // if (config.alchemyApiKey) {
          //   return await fetchHoldersFromAlchemy(tokenAddress, chain, limit);
          // }
        } catch (error) {
          console.error(`[Blockchain Data] Error fetching holders:`, error);
          console.log("[Blockchain Data] Falling back to mock data");
        }
      } else {
        console.log("[Blockchain Data] No API keys configured, using mock data");
      }

      // Fallback to mock data
      return getMockHolders(limit, 1_000_000_000);
    }
  );
}

/**
 * Fetch token information (with fallback to mock data)
 */
export async function fetchTokenInfo(
  tokenAddress: string,
  chain: string
): Promise<TokenInfo> {
  const cacheKey = generateCacheKey("token-info", {
    token: tokenAddress.toLowerCase(),
    chain: chain.toLowerCase(),
  });

  return getOrSet(
    tokenInfoCache,
    cacheKey,
    async () => {
      // Try to use real API if keys are available
      if (hasApiKeys()) {
        try {
          // Try Moralis first
          if (config.moralisApiKey) {
            return await fetchTokenInfoFromMoralis(tokenAddress, chain);
          }

          // TODO: Add Alchemy fallback
          // if (config.alchemyApiKey) {
          //   return await fetchTokenInfoFromAlchemy(tokenAddress, chain);
          // }
        } catch (error) {
          console.error(`[Blockchain Data] Error fetching token info:`, error);
          console.log("[Blockchain Data] Falling back to mock data");
        }
      } else {
        console.log("[Blockchain Data] No API keys configured, using mock data");
      }

      // Fallback to mock data
      return getMockTokenInfo(tokenAddress, chain);
    }
  );
}

/**
 * Check if an address is a contract
 */
export async function isContract(
  address: string,
  _chain?: string
): Promise<boolean> {
  // This is a simplified check
  // In production, you'd call the blockchain to check if there's code at the address
  // For now, we'll return false for EOAs
  return address.length > 42; // Basic heuristic
}
