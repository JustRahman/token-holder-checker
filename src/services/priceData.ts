// Price data service - Fetch token prices from CoinGecko

import axios from "axios";
import { config } from "../config/index.js";
import { apiCall } from "./apiUtils.js";
import { priceCache, getOrSet, generateCacheKey } from "./cache.js";

/**
 * CoinGecko platform IDs for different chains
 */
const COINGECKO_PLATFORMS: Record<string, string> = {
  ethereum: "ethereum",
  base: "base",
  arbitrum: "arbitrum-one",
  optimism: "optimistic-ethereum",
  polygon: "polygon-pos",
  bsc: "binance-smart-chain",
};

/**
 * Fetch current token price from CoinGecko
 */
async function fetchPriceFromCoinGecko(
  tokenAddress: string,
  chain: string
): Promise<number> {
  const platform = COINGECKO_PLATFORMS[chain.toLowerCase()];
  if (!platform) {
    throw new Error(`Chain ${chain} not supported by CoinGecko`);
  }

  console.log(`[CoinGecko] Fetching price for ${tokenAddress} on ${chain}...`);

  const url = `https://api.coingecko.com/api/v3/simple/token_price/${platform}`;
  const params: any = {
    contract_addresses: tokenAddress.toLowerCase(),
    vs_currencies: "usd",
    include_market_cap: "true",
    include_24hr_vol: "true",
    include_24hr_change: "true",
  };

  // Add API key if available (for Pro tier)
  if (config.coingeckoApiKey) {
    params.x_cg_pro_api_key = config.coingeckoApiKey;
  }

  const response = await apiCall(
    `coingecko-price-${tokenAddress}`,
    async () => {
      const res = await axios.get(url, { params });
      return res.data;
    }
  );

  const tokenData = response[tokenAddress.toLowerCase()];
  if (!tokenData || !tokenData.usd) {
    throw new Error("Price not found on CoinGecko");
  }

  console.log(`[CoinGecko] Price: $${tokenData.usd}`);
  return tokenData.usd;
}

/**
 * Fetch token price with market data
 */
async function fetchTokenDataFromCoinGecko(
  tokenAddress: string,
  chain: string
): Promise<{
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
}> {
  const platform = COINGECKO_PLATFORMS[chain.toLowerCase()];
  if (!platform) {
    throw new Error(`Chain ${chain} not supported by CoinGecko`);
  }

  console.log(`[CoinGecko] Fetching full data for ${tokenAddress} on ${chain}...`);

  const url = `https://api.coingecko.com/api/v3/simple/token_price/${platform}`;
  const params: any = {
    contract_addresses: tokenAddress.toLowerCase(),
    vs_currencies: "usd",
    include_market_cap: "true",
    include_24hr_vol: "true",
    include_24hr_change: "true",
  };

  if (config.coingeckoApiKey) {
    params.x_cg_pro_api_key = config.coingeckoApiKey;
  }

  const response = await apiCall(
    `coingecko-data-${tokenAddress}`,
    async () => {
      const res = await axios.get(url, { params });
      return res.data;
    }
  );

  const tokenData = response[tokenAddress.toLowerCase()];
  if (!tokenData || !tokenData.usd) {
    throw new Error("Token data not found on CoinGecko");
  }

  return {
    price: tokenData.usd || 0,
    marketCap: tokenData.usd_market_cap || 0,
    volume24h: tokenData.usd_24h_vol || 0,
    priceChange24h: tokenData.usd_24h_change || 0,
  };
}

/**
 * Get current token price (cached)
 */
export async function getCurrentPrice(
  tokenAddress: string,
  chain: string
): Promise<number> {
  const cacheKey = generateCacheKey("price", {
    token: tokenAddress.toLowerCase(),
    chain: chain.toLowerCase(),
  });

  return getOrSet(
    priceCache,
    cacheKey,
    async () => {
      try {
        return await fetchPriceFromCoinGecko(tokenAddress, chain);
      } catch (error) {
        console.error(`[Price Data] Error fetching price:`, error);
        console.log("[Price Data] Falling back to mock price");
        // Fallback to mock price
        return 1.5;
      }
    }
  );
}

/**
 * Get token market data (cached)
 */
export async function getTokenMarketData(
  tokenAddress: string,
  chain: string
): Promise<{
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
}> {
  const cacheKey = generateCacheKey("market-data", {
    token: tokenAddress.toLowerCase(),
    chain: chain.toLowerCase(),
  });

  return getOrSet(
    priceCache,
    cacheKey,
    async () => {
      try {
        return await fetchTokenDataFromCoinGecko(tokenAddress, chain);
      } catch (error) {
        console.error(`[Price Data] Error fetching market data:`, error);
        console.log("[Price Data] Falling back to mock data");
        // Fallback to mock data
        return {
          price: 1.5,
          marketCap: 1_200_000_000,
          volume24h: 50_000_000,
          priceChange24h: 2.5,
        };
      }
    }
  );
}

/**
 * Get historical price (not implemented in free tier)
 */
export async function getHistoricalPrice(
  tokenAddress: string,
  chain: string,
  _timestamp?: number
): Promise<number> {
  // Historical prices require CoinGecko Pro API
  // For now, return current price as fallback
  console.log("[Price Data] Historical prices not implemented, returning current price");
  return getCurrentPrice(tokenAddress, chain);
}
