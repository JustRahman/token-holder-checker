# Token Holder Monitor - Bounty Specification

## Purpose
Monitor token holder distributions, track whale wallet movements, and generate alerts for centralization risks and large holder activity across multiple blockchain networks.

## Overview
Build an agent that analyzes token holder distributions, identifies whale wallets, monitors their activities in real-time, and provides centralization metrics to assess token distribution health. This tool helps traders and investors identify risks and opportunities based on whale behavior and token concentration.

## Specification

### Job
Return comprehensive token holder analytics, whale tracking data, and centralization alerts for any ERC-20 token across supported chains.

### Inputs
```typescript
{
  token_address: string;           // Token contract address
  chain: string;                   // Blockchain network
  whale_threshold_usd?: number;    // Minimum USD value to be considered a whale (default: $100k)
  whale_threshold_percent?: number; // Minimum % of supply to be considered a whale (default: 1%)
  top_holders_count?: number;      // Number of top holders to analyze (default: 100)
  track_transfers?: boolean;       // Monitor real-time transfers (default: true)
  alert_threshold_usd?: number;    // Alert on transfers above this USD value (default: $50k)
  time_window?: string;            // "1h" | "24h" | "7d" | "30d" (for activity analysis)
}
```

### Returns
```typescript
{
  token_info: {
    name: string;
    symbol: string;
    address: string;
    chain: string;
    total_supply: number;
    circulating_supply: number;
    current_price_usd: number;
    market_cap_usd: number;
    total_holders: number;
  };
  
  centralization_metrics: {
    gini_coefficient: number;           // 0 = perfect equality, 1 = complete inequality
    herfindahl_index: number;           // Measure of concentration (0-10000)
    nakamoto_coefficient: number;       // Min holders needed to control >51% supply
    top10_percentage: number;           // % of supply held by top 10 holders
    top50_percentage: number;           // % of supply held by top 50 holders
    top100_percentage: number;          // % of supply held by top 100 holders
    centralization_score: number;       // Custom score (0-100, higher = more centralized)
    risk_level: "low" | "medium" | "high" | "critical";
  };
  
  whale_holders: Array<{
    address: string;
    balance: number;
    balance_usd: number;
    percentage_of_supply: number;
    rank: number;
    label?: string;                     // "Exchange", "Team", "Known Whale", etc.
    first_seen: number;                 // Timestamp
    last_activity: number;              // Timestamp
    is_contract: boolean;
    tags: string[];                     // ["exchange", "multisig", "vesting", etc.]
  }>;
  
  recent_whale_activity: Array<{
    tx_hash: string;
    timestamp: number;
    from_address: string;
    to_address: string;
    amount: number;
    amount_usd: number;
    percentage_of_supply: number;
    type: "buy" | "sell" | "transfer";
    from_label?: string;
    to_label?: string;
    exchange_detected?: string;         // If to/from exchange
    price_impact_estimated?: number;    // Estimated % price impact
  }>;
  
  distribution_analysis: {
    retail_holders: {                   // < 0.01% of supply
      count: number;
      total_percentage: number;
    };
    small_holders: {                    // 0.01% - 0.1% of supply
      count: number;
      total_percentage: number;
    };
    medium_holders: {                   // 0.1% - 1% of supply
      count: number;
      total_percentage: number;
    };
    large_holders: {                    // 1% - 5% of supply
      count: number;
      total_percentage: number;
    };
    whales: {                           // > 5% of supply
      count: number;
      total_percentage: number;
    };
  };
  
  alerts: Array<{
    severity: "info" | "warning" | "critical";
    type: "large_transfer" | "accumulation" | "distribution" | "new_whale" | "centralization_risk";
    message: string;
    timestamp: number;
    related_address?: string;
    data?: any;
  }>;
  
  holder_trends: {
    holder_count_change_24h: number;
    holder_count_change_7d: number;
    whale_accumulation_trend: "accumulating" | "distributing" | "stable";
    net_flow_24h_usd: number;           // Net inflow/outflow
  };
  
  metadata: {
    last_updated: number;
    block_height: number;
    data_sources: string[];
    cache_ttl: number;
  };
}
```

## Supported Chains (Minimum)
- Ethereum
- Base
- Arbitrum
- Optimism
- Polygon
- BSC (Binance Smart Chain)

## Technical Requirements

### 1. Token Holder Data Fetching
- Query token holder balances from blockchain
- Use multiple data sources:
  - Direct blockchain queries (RPC nodes)
  - Indexed APIs (Etherscan, Moralis, Alchemy)
  - On-chain contract calls (balanceOf for top holders)
- Handle pagination for large holder lists
- Filter out zero balances and burned tokens

### 2. Whale Detection & Classification
- Calculate whale thresholds dynamically:
  - By USD value (default: $100k+)
  - By % of supply (default: 1%+)
- Identify and label known addresses:
  - Exchanges (Binance, Coinbase, etc.)
  - Team/Founder wallets
  - Treasury addresses
  - Vesting contracts
  - Known whale addresses
- Detect contract vs. EOA (Externally Owned Account)
- Tag special addresses (multisig, governance, etc.)

### 3. Centralization Metrics Calculation

#### Gini Coefficient
- Measures inequality in token distribution
- Formula: `G = (2 × Σ(i × y_i)) / (n × Σy_i) - (n + 1) / n`
- Scale: 0 (perfect equality) to 1 (complete inequality)

#### Herfindahl-Hirschman Index (HHI)
- Measures market concentration
- Formula: `HHI = Σ(s_i)²` where s_i is % market share
- Scale: 0 to 10,000 (100² for monopoly)

#### Nakamoto Coefficient
- Minimum entities needed to control >51% of supply
- Iterate through top holders until sum > 51%

#### Custom Centralization Score
- Weighted combination of metrics:
  - Top 10 concentration (30%)
  - Gini coefficient (25%)
  - Nakamoto coefficient (20%)
  - Number of whales (15%)
  - Exchange concentration (10%)

### 4. Real-Time Activity Monitoring
- Monitor token transfer events:
  - Subscribe to transfer events via WebSocket
  - Poll recent blocks for transfers
  - Track transfers above threshold
- Identify transfer patterns:
  - Exchange deposits (potential sells)
  - Exchange withdrawals (potential accumulation)
  - Wallet-to-wallet transfers
  - Contract interactions (staking, lending)
- Calculate price impact estimates for large transfers

### 5. Alert Generation
- **Large Transfer Alerts**: Transfers above USD threshold
- **Accumulation Alerts**: Whale increasing position by >10% in 24h
- **Distribution Alerts**: Whale decreasing position by >10% in 24h
- **New Whale Alerts**: Address crosses whale threshold
- **Centralization Alerts**: Metrics exceed danger thresholds
  - Top 10 > 70% of supply
  - Nakamoto coefficient < 3
  - Gini coefficient > 0.8

### 6. Address Labeling System
- Build database of known addresses:
  - CEX wallets (hot/cold)
  - DEX contracts
  - Bridge contracts
  - Team/founder wallets
  - DAO treasuries
- Use public label APIs:
  - Etherscan labels
  - Arkham Intelligence
  - DeFiLlama protocols
- Allow custom labeling

### 7. Caching Strategy
- Cache holder snapshots (update every 10-15 minutes)
- Cache centralization metrics (update every 15-30 minutes)
- Real-time stream for transfers (no cache)
- Store historical snapshots for trend analysis

## Acceptance Criteria

✅ **Accurate Holder Data**: Holder counts and balances match blockchain explorers
- Test against Etherscan holder pages
- Margin of error < 0.5% for top 100 holders

✅ **Correct Centralization Metrics**: Mathematical accuracy of all metrics
- Verify Gini coefficient calculation
- Verify HHI calculation
- Verify Nakamoto coefficient
- Test against known centralized/decentralized tokens

✅ **Whale Detection**: Accurately identifies and classifies whale wallets
- Detect at least 90% of known exchange wallets
- Properly distinguish contracts from EOAs
- Apply correct labels from known databases

✅ **Real-Time Monitoring**: Catches transfers within 1 minute of occurrence
- WebSocket or polling must work reliably
- No missed transfers above alert threshold

✅ **Multi-Chain Support**: Successfully tracks tokens on all 6 supported chains
- Handle chain-specific differences
- Proper decimal handling per token

✅ **Alert Quality**: Alerts are relevant and not spammy
- Alert threshold filtering works correctly
- No duplicate alerts
- Proper severity classification

✅ **Performance**: Response time < 15 seconds for full analysis
- Initial query may be slower (30s acceptable)
- Cached responses < 5 seconds

✅ **Deployment**: Must be deployed on a domain and reachable via x402 protocol

## Done When
Agent accurately monitors token holder distributions, identifies whale activity in real-time, calculates valid centralization metrics, and generates actionable alerts for risk assessment.

## Implementation Guide

### Phase 1: Setup & Data Layer (Est. 4-6 hours)
1. Initialize project with `@lucid-dreams/agent-kit`
2. Set up TypeScript configuration
3. Install dependencies:
   - Web3 libraries (ethers.js/viem)
   - Blockchain data APIs (Moralis, Alchemy, Etherscan)
   - WebSocket for real-time monitoring
4. Build holder data fetching layer
5. Implement caching system

### Phase 2: Holder Analysis Engine (Est. 5-7 hours)
1. Fetch and parse token holder data
2. Calculate holder distribution buckets
3. Identify top holders and whales
4. Implement address labeling system
5. Build whale classification logic

### Phase 3: Centralization Metrics (Est. 4-6 hours)
1. Implement Gini coefficient calculation
2. Implement HHI calculation
3. Implement Nakamoto coefficient
4. Build custom centralization score
5. Create risk level assessment

### Phase 4: Real-Time Monitoring (Est. 5-7 hours)
1. Set up WebSocket listeners or polling
2. Monitor token transfer events
3. Detect large transfers
4. Identify transfer patterns (to/from exchanges)
5. Build alert generation system

### Phase 5: Alert & Notification System (Est. 3-5 hours)
1. Implement alert rules engine
2. Create alert prioritization
3. Build alert history
4. Implement deduplication
5. Add severity classification

### Phase 6: Testing & Optimization (Est. 4-6 hours)
1. Test with various tokens (centralized, decentralized, etc.)
2. Verify metric calculations
3. Test real-time monitoring
4. Performance optimization
5. Edge case handling

### Phase 7: Deployment (Est. 2-3 hours)
1. Deploy to production environment
2. Configure x402 protocol access
3. Set up monitoring and logging
4. Documentation

**Total Estimated Time: 27-40 hours**

## Basic Example

```typescript
import { z } from "zod";
import { createAgentApp } from "@lucid-dreams/agent-kit";
import { ethers } from "ethers";

const { app, addEntrypoint } = createAgentApp({
  name: "token-holder-monitor",
  version: "0.1.0",
  description: "Monitor token holders, whale tracking, and centralization alerts",
});

const InputSchema = z.object({
  token_address: z.string(),
  chain: z.string(),
  whale_threshold_usd: z.number().optional(),
  whale_threshold_percent: z.number().optional(),
  top_holders_count: z.number().optional(),
  track_transfers: z.boolean().optional(),
  alert_threshold_usd: z.number().optional(),
  time_window: z.enum(["1h", "24h", "7d", "30d"]).optional(),
});

addEntrypoint({
  key: "analyze_holders",
  description: "Analyze token holder distribution and whale activity",
  input: InputSchema,
  async handler({ input }) {
    const {
      token_address,
      chain,
      whale_threshold_usd = 100000,
      whale_threshold_percent = 1,
      top_holders_count = 100,
      track_transfers = true,
      alert_threshold_usd = 50000,
      time_window = "24h",
    } = input;

    // 1. Fetch token information
    const tokenInfo = await fetchTokenInfo(token_address, chain);

    // 2. Get all token holders (top N)
    const holders = await fetchTopHolders(
      token_address,
      chain,
      top_holders_count
    );

    // 3. Calculate centralization metrics
    const centralizationMetrics = calculateCentralizationMetrics(
      holders,
      tokenInfo.total_supply
    );

    // 4. Identify and classify whales
    const whaleHolders = identifyWhales(
      holders,
      whale_threshold_usd,
      whale_threshold_percent,
      tokenInfo
    );

    // 5. Analyze distribution
    const distributionAnalysis = analyzeDistribution(holders, tokenInfo);

    // 6. Get recent whale activity
    const recentActivity = await fetchRecentWhaleActivity(
      token_address,
      chain,
      whaleHolders.map(w => w.address),
      time_window
    );

    // 7. Generate alerts
    const alerts = generateAlerts(
      centralizationMetrics,
      recentActivity,
      alert_threshold_usd
    );

    // 8. Calculate holder trends
    const holderTrends = await calculateHolderTrends(
      token_address,
      chain,
      time_window
    );

    return {
      output: {
        token_info: tokenInfo,
        centralization_metrics: centralizationMetrics,
        whale_holders: whaleHolders,
        recent_whale_activity: recentActivity,
        distribution_analysis: distributionAnalysis,
        alerts,
        holder_trends: holderTrends,
        metadata: {
          last_updated: Date.now(),
          block_height: await getLatestBlockHeight(chain),
          data_sources: ["etherscan", "moralis", "alchemy"],
          cache_ttl: 900, // 15 minutes
        },
      },
      usage: { total_tokens: 2000 },
    };
  },
});

// Helper function examples

async function fetchTopHolders(
  tokenAddress: string,
  chain: string,
  count: number
) {
  // Implementation: Query blockchain for top holders
  // Can use Moralis, Alchemy, or direct contract queries
  return [];
}

function calculateCentralizationMetrics(holders: any[], totalSupply: number) {
  // Calculate Gini coefficient
  const gini = calculateGiniCoefficient(holders);
  
  // Calculate HHI
  const hhi = calculateHHI(holders, totalSupply);
  
  // Calculate Nakamoto coefficient
  const nakamoto = calculateNakamotoCoefficient(holders, totalSupply);
  
  // Calculate percentages
  const top10 = calculateTopNPercentage(holders, 10, totalSupply);
  const top50 = calculateTopNPercentage(holders, 50, totalSupply);
  const top100 = calculateTopNPercentage(holders, 100, totalSupply);
  
  // Custom centralization score (0-100)
  const score = calculateCentralizationScore({
    gini,
    hhi,
    nakamoto,
    top10,
  });
  
  // Risk level
  const risk = determineRiskLevel(score);
  
  return {
    gini_coefficient: gini,
    herfindahl_index: hhi,
    nakamoto_coefficient: nakamoto,
    top10_percentage: top10,
    top50_percentage: top50,
    top100_percentage: top100,
    centralization_score: score,
    risk_level: risk,
  };
}

function calculateGiniCoefficient(holders: any[]): number {
  // Sort by balance
  const sorted = [...holders].sort((a, b) => a.balance - b.balance);
  const n = sorted.length;
  
  let sumOfProducts = 0;
  let sumOfBalances = 0;
  
  sorted.forEach((holder, index) => {
    sumOfProducts += (index + 1) * holder.balance;
    sumOfBalances += holder.balance;
  });
  
  const gini = (2 * sumOfProducts) / (n * sumOfBalances) - (n + 1) / n;
  return Math.round(gini * 1000) / 1000; // Round to 3 decimals
}

function calculateHHI(holders: any[], totalSupply: number): number {
  let hhi = 0;
  
  holders.forEach(holder => {
    const marketShare = (holder.balance / totalSupply) * 100;
    hhi += marketShare * marketShare;
  });
  
  return Math.round(hhi);
}

function calculateNakamotoCoefficient(
  holders: any[],
  totalSupply: number
): number {
  const sorted = [...holders].sort((a, b) => b.balance - a.balance);
  const threshold = totalSupply * 0.51; // 51%
  
  let sum = 0;
  let count = 0;
  
  for (const holder of sorted) {
    sum += holder.balance;
    count++;
    if (sum >= threshold) break;
  }
  
  return count;
}

function identifyWhales(
  holders: any[],
  usdThreshold: number,
  percentThreshold: number,
  tokenInfo: any
) {
  return holders
    .filter(holder => {
      const usdValue = holder.balance * tokenInfo.current_price_usd;
      const percentOfSupply = (holder.balance / tokenInfo.total_supply) * 100;
      
      return usdValue >= usdThreshold || percentOfSupply >= percentThreshold;
    })
    .map((holder, index) => ({
      address: holder.address,
      balance: holder.balance,
      balance_usd: holder.balance * tokenInfo.current_price_usd,
      percentage_of_supply: (holder.balance / tokenInfo.total_supply) * 100,
      rank: index + 1,
      label: labelAddress(holder.address),
      first_seen: holder.first_seen || Date.now(),
      last_activity: holder.last_activity || Date.now(),
      is_contract: holder.is_contract || false,
      tags: getAddressTags(holder.address),
    }));
}

function generateAlerts(
  metrics: any,
  recentActivity: any[],
  threshold: number
): any[] {
  const alerts = [];
  
  // Centralization risk alerts
  if (metrics.top10_percentage > 70) {
    alerts.push({
      severity: "critical",
      type: "centralization_risk",
      message: `High centralization: Top 10 holders control ${metrics.top10_percentage.toFixed(1)}% of supply`,
      timestamp: Date.now(),
    });
  }
  
  if (metrics.nakamoto_coefficient < 3) {
    alerts.push({
      severity: "critical",
      type: "centralization_risk",
      message: `Extreme centralization: Only ${metrics.nakamoto_coefficient} holders needed for 51% control`,
      timestamp: Date.now(),
    });
  }
  
  // Large transfer alerts
  recentActivity
    .filter(tx => tx.amount_usd >= threshold)
    .forEach(tx => {
      alerts.push({
        severity: tx.amount_usd > threshold * 5 ? "critical" : "warning",
        type: "large_transfer",
        message: `Large ${tx.type}: ${formatUSD(tx.amount_usd)} (${tx.percentage_of_supply.toFixed(2)}% of supply)`,
        timestamp: tx.timestamp,
        related_address: tx.from_address,
        data: tx,
      });
    });
  
  return alerts;
}

// Real-time monitoring setup
async function setupRealtimeMonitoring(
  tokenAddress: string,
  chain: string,
  alertCallback: (alert: any) => void
) {
  const provider = new ethers.WebSocketProvider(getWebSocketRPC(chain));
  const tokenContract = new ethers.Contract(
    tokenAddress,
    ["event Transfer(address indexed from, address indexed to, uint256 value)"],
    provider
  );
  
  tokenContract.on("Transfer", async (from, to, value, event) => {
    const usdValue = await convertToUSD(value, tokenAddress);
    
    if (usdValue >= 50000) { // Alert threshold
      alertCallback({
        severity: "warning",
        type: "large_transfer",
        message: `Large transfer detected: ${formatUSD(usdValue)}`,
        timestamp: Date.now(),
        data: {
          from,
          to,
          value: value.toString(),
          tx_hash: event.log.transactionHash,
        },
      });
    }
  });
}

export default app;
```

## Resources

### APIs & Services

#### Blockchain Data
- **Moralis API**: https://moralis.io/api/
  - Excellent for token holder data
  - Supports multiple chains
  - Fast and reliable

- **Alchemy API**: https://www.alchemy.com/
  - Token holder endpoints
  - WebSocket support for real-time
  - getTokenBalances API

- **Etherscan/Polygonscan/BSCscan APIs**:
  - Token holder lists
  - Transaction history
  - Contract verification

- **Covalent API**: https://www.covalenthq.com/
  - Historical holder data
  - Multi-chain support

#### Address Labeling
- **Etherscan Labels**: Built-in labels for known addresses
- **Arkham Intelligence**: https://platform.arkhamintelligence.com/
- **DeBank**: Token holder labels
- **DeFiLlama**: Protocol addresses

#### Price Data
- **CoinGecko API**: Real-time prices
- **DeFiLlama**: DEX prices
- **Chainlink Oracles**: On-chain price feeds

### Libraries
```json
{
  "dependencies": {
    "@lucid-dreams/agent-kit": "latest",
    "ethers": "^6.x",
    "axios": "^1.x",
    "node-cache": "^5.x",
    "zod": "^3.x",
    "ws": "^8.x",
    "bignumber.js": "^9.x"
  }
}
```

### Useful Formulas

#### Gini Coefficient
```
G = (2 × Σ(i × y_i)) / (n × Σy_i) - (n + 1) / n

Where:
- i = rank (1 to n)
- y_i = balance of holder i
- n = total number of holders
```

#### Herfindahl-Hirschman Index
```
HHI = Σ(s_i²)

Where:
- s_i = percentage market share of holder i
- Range: 0 to 10,000
- < 1,500: Unconcentrated
- 1,500 - 2,500: Moderately concentrated
- > 2,500: Highly concentrated
```

#### Nakamoto Coefficient
```
Minimum number of entities to reach >51% of total supply
```

## Bounty Value
**$1,200**

## Submission
Submission is a PR into the agent-bounties repo linking this issue - first in, first served if the bounty has been completed and meets all acceptance criteria.

## Testing Checklist
- [ ] Test with highly centralized token (e.g., small cap with team holdings)
- [ ] Test with decentralized token (e.g., ETH, major DeFi tokens)
- [ ] Verify Gini coefficient against manual calculation
- [ ] Verify HHI against manual calculation
- [ ] Verify Nakamoto coefficient manually
- [ ] Test whale detection at various thresholds
- [ ] Verify address labeling works for known exchanges
- [ ] Test real-time monitoring catches transfers
- [ ] Test alert generation triggers correctly
- [ ] Test all 6 supported chains
- [ ] Performance test with high-holder tokens (10k+ holders)
- [ ] Test x402 protocol accessibility
- [ ] Verify no false positive alerts

## Edge Cases to Handle
1. **Tokens with Burned Supply**: Exclude 0x0 address from calculations
2. **Wrapped Tokens**: Handle correctly (WETH, WBTC)
3. **Rebasing Tokens**: May have special handling needs
4. **Locked/Vesting Tokens**: Should be identified and labeled
5. **LP Tokens**: Different distribution patterns
6. **Multi-Chain Tokens**: Same token on different chains
7. **Contract Holders**: DEX pools, staking contracts, etc.
8. **Exchange Cold/Hot Wallets**: Should be grouped
9. **Dead/Inactive Wallets**: Filter or mark appropriately
10. **Flash Loan Attacks**: Temporary large holdings

## Advanced Features (Optional Enhancements)
- **Historical Tracking**: Store snapshots over time
- **Trend Analysis**: Centralization increasing/decreasing
- **Whale Cohort Analysis**: Group whales by behavior
- **Smart Money Tracking**: Track wallets with good performance
- **Correlation Analysis**: Whale moves vs. price action
- **Export Functionality**: CSV/JSON export of data
- **Webhook Alerts**: Push notifications for alerts
- **Dashboard UI**: Visual representation of data

## Known Test Tokens

### Highly Centralized (for testing)
- Many small cap tokens
- New token launches
- Team-heavy allocations

### Well Distributed (for testing)
- WETH (Wrapped Ethereum)
- USDC/USDT (widely distributed stablecoins)
- Major DeFi tokens (UNI, AAVE, COMP)

### Edge Cases
- Rebasing tokens (AMPL)
- Wrapped tokens (WBTC)
- LP tokens (UNI-V2)

## Performance Targets
- Initial query: < 30 seconds (cold cache)
- Cached query: < 5 seconds
- Real-time transfer detection: < 60 seconds
- Supports tokens with up to 100k holders
- Concurrent requests: Handle 10+ simultaneous requests

## Notes
- Focus on ERC-20 tokens initially
- Consider rate limiting API calls
- Implement proper error handling for failed RPC calls
- Cache aggressively but update critical data frequently
- Consider using GraphQL subgraphs for historical data
- WebSocket connections should auto-reconnect on failure