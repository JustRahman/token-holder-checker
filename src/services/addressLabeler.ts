// Advanced address labeling service

export interface AddressLabel {
  label: string;
  type: "exchange" | "dex" | "bridge" | "team" | "treasury" | "vesting" | "multisig" | "bot" | "unknown";
  confidence: "high" | "medium" | "low";
  tags: string[];
}

/**
 * Comprehensive exchange address database
 * Updated with major exchanges across all chains
 */
const KNOWN_EXCHANGES: Record<string, { label: string; tags: string[] }> = {
  // Binance
  "0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be": { label: "Binance", tags: ["exchange", "cex", "binance"] },
  "0xd551234ae421e3bcba99a0da6d736074f22192ff": { label: "Binance", tags: ["exchange", "cex", "binance"] },
  "0x564286362092d8e7936f0549571a803b203aaced": { label: "Binance", tags: ["exchange", "cex", "binance"] },
  "0x0681d8db095565fe8a346fa0277bffde9c0edbbf": { label: "Binance", tags: ["exchange", "cex", "binance"] },
  "0xfe9e8709d3215310075d67e3ed32a380ccf451c8": { label: "Binance", tags: ["exchange", "cex", "binance"] },
  "0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503": { label: "Binance", tags: ["exchange", "cex", "binance"] },
  "0xbe0eb53f46cd790cd13851d5eff43d12404d33e8": { label: "Binance", tags: ["exchange", "cex", "binance"] },
  "0xf977814e90da44bfa03b6295a0616a897441acec": { label: "Binance", tags: ["exchange", "cex", "binance"] },
  "0x28c6c06298d514db089934071355e5743bf21d60": { label: "Binance US", tags: ["exchange", "cex", "binance"] },
  "0x21a31ee1afc51d94c2efccaa2092ad1028285549": { label: "Binance DEX", tags: ["exchange", "dex", "binance"] },

  // Coinbase
  "0xa910f92acdaf488fa6ef02174fb86208ad7722ba": { label: "Coinbase", tags: ["exchange", "cex", "coinbase"] },
  "0x503828976d22510aad0201ac7ec88293211d23da": { label: "Coinbase", tags: ["exchange", "cex", "coinbase"] },
  "0xddfabcdc4d8ffc6d5beaf154f18b778f892a0740": { label: "Coinbase", tags: ["exchange", "cex", "coinbase"] },
  "0x71660c4005ba85c37ccec55d0c4493e66fe775d3": { label: "Coinbase", tags: ["exchange", "cex", "coinbase"] },
  "0x267be1c1d684f78cb4f6a176c4911b741e4ffdc0": { label: "Coinbase", tags: ["exchange", "cex", "coinbase"] },
  "0xf6874c88757721a02f47592140905c4336dfbc61": { label: "Coinbase", tags: ["exchange", "cex", "coinbase"] },
  "0x7c195d981abfdc3ddecd2ca0fed0958430488e34": { label: "Coinbase", tags: ["exchange", "cex", "coinbase"] },

  // Kraken
  "0x6b76f8b1e9e59913bfe758821887311ba1805cab": { label: "Kraken", tags: ["exchange", "cex", "kraken"] },
  "0xae2d4617c862309a3d75a0ffb358c7a5009c673f": { label: "Kraken", tags: ["exchange", "cex", "kraken"] },
  "0x53d284357ec70ce289d6d64134dfac8e511c8a3d": { label: "Kraken", tags: ["exchange", "cex", "kraken"] },
  "0x89e51fa8ca5d66cd220baed62ed01e8951aa7c40": { label: "Kraken", tags: ["exchange", "cex", "kraken"] },
  "0x0a869d79a7052c7f1b55a8ebabbea3420f0d1e13": { label: "Kraken", tags: ["exchange", "cex", "kraken"] },
  "0xe853c56864a2ebe4576a807d26fdc4a0ada51919": { label: "Kraken", tags: ["exchange", "cex", "kraken"] },
  "0x2910543af39aba0cd09dbb2d50200b3e800a63d2": { label: "Kraken", tags: ["exchange", "cex", "kraken"] },

  // Bitfinex
  "0x94a1b5cdb22c43faab4abeb5c74999895464ddaf": { label: "Bitfinex", tags: ["exchange", "cex", "bitfinex"] },
  "0xcafb10ee663f465f9d10588ac44ed20ed608c11e": { label: "Bitfinex", tags: ["exchange", "cex", "bitfinex"] },
  "0x742d35cc6634c0532925a3b844bc454e4438f44e": { label: "Bitfinex", tags: ["exchange", "cex", "bitfinex"] },
  "0x876eabf441b2ee5b5b0554fd502a8e0600950cfa": { label: "Bitfinex", tags: ["exchange", "cex", "bitfinex"] },
  "0x0eee3e3828a45f7601d5f54bf49bb01d1a9df5ea": { label: "Bitfinex", tags: ["exchange", "cex", "bitfinex"] },

  // OKX
  "0x236f9f97e0e62388479bf9e5ba4889e46b0273c3": { label: "OKX", tags: ["exchange", "cex", "okx"] },
  "0xa7efae728d2936e78bda97dc267687568dd593f3": { label: "OKX", tags: ["exchange", "cex", "okx"] },
  "0x98ec059dc3adfbdd63429454aeb0c990fba4a128": { label: "OKX", tags: ["exchange", "cex", "okx"] },

  // Bybit
  "0xf89d7b9c864f589bbf53a82105107622b35eaa40": { label: "Bybit", tags: ["exchange", "cex", "bybit"] },
  "0xee5b5b923ffce93a870b3104b7ca09c3db80047a": { label: "Bybit", tags: ["exchange", "cex", "bybit"] },

  // Gate.io
  "0x0d0707963952f2fba59dd06f2b425ace40b492fe": { label: "Gate.io", tags: ["exchange", "cex", "gate"] },
  "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c": { label: "Gate.io", tags: ["exchange", "cex", "gate"] },

  // Huobi/HTX
  "0x5c985e89dde482efe97ea9f1950ad149eb73829b": { label: "Huobi", tags: ["exchange", "cex", "huobi"] },
  "0x6748f50f686bfbca6fe8ad62b22228b87f31ff2b": { label: "Huobi", tags: ["exchange", "cex", "huobi"] },
  "0xeee28d484628d41a82d01e21d12e2e78d69920da": { label: "Huobi", tags: ["exchange", "cex", "huobi"] },

  // KuCoin
  "0x2b5634c42055806a59e9107ed44d43c426e58258": { label: "KuCoin", tags: ["exchange", "cex", "kucoin"] },
  "0x689c56aef474df92d44a1b70850f808488f9769c": { label: "KuCoin", tags: ["exchange", "cex", "kucoin"] },
  "0xd6216fc19db775df9774a6e33526131da7d19a2c": { label: "KuCoin", tags: ["exchange", "cex", "kucoin"] },

  // Gemini
  "0x5f65f7b609678448494de4c87521cdf6cef1e932": { label: "Gemini", tags: ["exchange", "cex", "gemini"] },
  "0xd24400ae8bfebb18ca49be86258a3c749cf46853": { label: "Gemini", tags: ["exchange", "cex", "gemini"] },
  "0x61edcdf5bb737adffe5043706e7c5bb1f1a56eea": { label: "Gemini", tags: ["exchange", "cex", "gemini"] },

  // Uniswap
  "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45": { label: "Uniswap Router", tags: ["dex", "uniswap", "router"] },
  "0x7a250d5630b4cf539739df2c5dacb4c659f2488d": { label: "Uniswap V2 Router", tags: ["dex", "uniswap", "router"] },
  "0xe592427a0aece92de3edee1f18e0157c05861564": { label: "Uniswap V3 Router", tags: ["dex", "uniswap", "router"] },

  // Curve
  "0xbabe61887f1de2713c6f97e567623453d3c79f67": { label: "Curve", tags: ["dex", "curve", "pool"] },

  // Sushiswap
  "0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f": { label: "Sushiswap Router", tags: ["dex", "sushiswap", "router"] },
};

/**
 * DEX contract addresses
 */
const DEX_CONTRACTS: Set<string> = new Set([
  "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45", // Uniswap Router
  "0x7a250d5630b4cf539739df2c5dacb4c659f2488d", // Uniswap V2
  "0xe592427a0aece92de3edee1f18e0157c05861564", // Uniswap V3
  "0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f", // Sushiswap
  "0xbabe61887f1de2713c6f97e567623453d3c79f67", // Curve
]);

/**
 * Label an address
 */
export async function labelAddress(
  address: string,
  _chain?: string
): Promise<AddressLabel> {
  const normalized = address.toLowerCase();

  // Check known exchanges
  const knownExchange = KNOWN_EXCHANGES[normalized];
  if (knownExchange) {
    return {
      label: knownExchange.label,
      type: knownExchange.tags.includes("dex") ? "dex" : "exchange",
      confidence: "high",
      tags: knownExchange.tags,
    };
  }

  // Check if it's a DEX
  if (DEX_CONTRACTS.has(normalized)) {
    return {
      label: "DEX Contract",
      type: "dex",
      confidence: "high",
      tags: ["dex", "contract"],
    };
  }

  // Check if it's a contract (simplified check)
  const isContract = address.length > 42 || await checkIfContract(address);
  if (isContract) {
    return {
      label: "Contract",
      type: "unknown",
      confidence: "medium",
      tags: ["contract"],
    };
  }

  return {
    label: "Unknown",
    type: "unknown",
    confidence: "low",
    tags: [],
  };
}

/**
 * Check if address is an exchange
 */
export async function isExchange(address: string): Promise<boolean> {
  const normalized = address.toLowerCase();
  const known = KNOWN_EXCHANGES[normalized];
  return known !== undefined && known.tags.includes("exchange");
}

/**
 * Check if address is a DEX
 */
export async function isDEX(address: string): Promise<boolean> {
  const normalized = address.toLowerCase();
  return DEX_CONTRACTS.has(normalized);
}

/**
 * Check if address is a contract (simplified)
 */
async function checkIfContract(address: string): Promise<boolean> {
  // In production, you'd make an RPC call to check if there's code at the address
  // For now, we'll use a simple heuristic
  return address.length > 42;
}

/**
 * Detect wallet type based on heuristics
 */
export async function detectWalletType(
  _address: string,
  balance: number,
  totalSupply: number,
  _firstSeen?: number,
  transferCount?: number
): Promise<string> {
  const percentOfSupply = (balance / totalSupply) * 100;

  // Team/Founder wallet heuristics
  if (percentOfSupply > 10 && transferCount && transferCount < 5) {
    return "team_founder";
  }

  // Bot wallet heuristics (high transfer count)
  if (transferCount && transferCount > 1000) {
    return "bot";
  }

  // Whale
  if (percentOfSupply > 1) {
    return "whale";
  }

  // Large holder
  if (percentOfSupply > 0.1) {
    return "large_holder";
  }

  return "retail";
}

/**
 * Get all known exchange addresses
 */
export function getKnownExchanges(): string[] {
  return Object.keys(KNOWN_EXCHANGES);
}
