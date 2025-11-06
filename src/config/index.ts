// Configuration management
import { config as dotenvConfig } from "dotenv";

// Load environment variables
dotenvConfig();

export interface ChainConfig {
  name: string;
  rpcUrl?: string;
  wsUrl?: string;
  explorerApiUrl: string;
  explorerApiKey?: string;
}

export const config = {
  // API Keys
  moralisApiKey: process.env.MORALIS_API_KEY || "",
  alchemyApiKey: process.env.ALCHEMY_API_KEY || "",
  coingeckoApiKey: process.env.COINGECKO_API_KEY || "",

  // Environment
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),

  // Cache TTL (in seconds)
  cache: {
    holderData: parseInt(process.env.CACHE_TTL_HOLDER_DATA || "600", 10),
    priceData: parseInt(process.env.CACHE_TTL_PRICE_DATA || "60", 10),
    tokenInfo: parseInt(process.env.CACHE_TTL_TOKEN_INFO || "3600", 10),
  },

  // Rate Limiting
  apiRateLimit: parseInt(process.env.API_RATE_LIMIT || "5", 10),

  // x402 Configuration
  x402: {
    enabled: process.env.X402_ENABLED === "true",
    paymentAddress: process.env.X402_PAYMENT_ADDRESS || "",
  },

  // Chain configurations
  chains: {
    ethereum: {
      name: "Ethereum",
      rpcUrl: process.env.ETHEREUM_RPC_URL,
      wsUrl: process.env.ETHEREUM_WS_URL,
      explorerApiUrl: "https://api.etherscan.io/api",
      explorerApiKey: process.env.ETHERSCAN_API_KEY,
    },
    base: {
      name: "Base",
      rpcUrl: process.env.BASE_RPC_URL,
      wsUrl: process.env.BASE_WS_URL,
      explorerApiUrl: "https://api.basescan.org/api",
      explorerApiKey: process.env.BASESCAN_API_KEY,
    },
    arbitrum: {
      name: "Arbitrum",
      rpcUrl: process.env.ARBITRUM_RPC_URL,
      wsUrl: process.env.ARBITRUM_WS_URL,
      explorerApiUrl: "https://api.arbiscan.io/api",
      explorerApiKey: process.env.ARBISCAN_API_KEY,
    },
    optimism: {
      name: "Optimism",
      rpcUrl: process.env.OPTIMISM_RPC_URL,
      wsUrl: process.env.OPTIMISM_WS_URL,
      explorerApiUrl: "https://api-optimistic.etherscan.io/api",
      explorerApiKey: process.env.OPTIMISTIC_ETHERSCAN_API_KEY,
    },
    polygon: {
      name: "Polygon",
      rpcUrl: process.env.POLYGON_RPC_URL,
      wsUrl: process.env.POLYGON_WS_URL,
      explorerApiUrl: "https://api.polygonscan.com/api",
      explorerApiKey: process.env.POLYGONSCAN_API_KEY,
    },
    bsc: {
      name: "BSC",
      rpcUrl: process.env.BSC_RPC_URL,
      wsUrl: process.env.BSC_WS_URL,
      explorerApiUrl: "https://api.bscscan.com/api",
      explorerApiKey: process.env.BSCSCAN_API_KEY,
    },
  } as Record<string, ChainConfig>,
};

/**
 * Get chain configuration
 */
export function getChainConfig(chain: string): ChainConfig {
  const chainLower = chain.toLowerCase();
  const chainConfig = config.chains[chainLower];

  if (!chainConfig) {
    throw new Error(`Unsupported chain: ${chain}`);
  }

  return chainConfig;
}

/**
 * Check if production mode
 */
export function isProduction(): boolean {
  return config.nodeEnv === "production";
}

/**
 * Check if API keys are configured
 */
export function hasApiKeys(): boolean {
  return !!(config.moralisApiKey || config.alchemyApiKey);
}
