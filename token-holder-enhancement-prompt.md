# Claude CLI Enhancement Prompt - Token Holder Monitor

## Context
I have a working Token Holder Monitor agent with mock data. I need to make it production-ready and highly competitive for a bounty competition. The project currently has basic centralization metrics and whale detection working with mock data, but needs real API integrations, performance optimization, and advanced features.

## Current Project Location
`/path/to/token-holder-checker`

## Your Mission
Transform this project into a **production-ready, competitive bounty submission** by:

1. **Integrating Real Blockchain Data**
2. **Implementing Real-Time Monitoring**
3. **Adding Advanced Address Labeling**
4. **Performance Optimization**
5. **Adding Unique Competitive Features**

---

## Phase 1: Real Blockchain Data Integration (CRITICAL)

### Task 1.1: Replace Mock Holder Data
Replace `src/mock-data.ts` functions with real API integrations:

#### Requirements:
1. **Use Moralis API** for token holder data:
   ```typescript
   // Example endpoint: Get top token holders
   GET https://deep-index.moralis.io/api/v2.2/erc20/{token_address}/owners
   ```

2. **Fallback to Alchemy API** if Moralis fails:
   ```typescript
   // Alchemy getTokenBalances for specific addresses
   ```

3. **Multi-chain support** - Create a unified interface that works for:
   - Ethereum (mainnet)
   - Base
   - Arbitrum
   - Optimism
   - Polygon
   - BSC

4. **Handle pagination** - Fetch all holders, not just first page

5. **Error handling** - Graceful degradation if API fails

#### Implementation Details:
- Create `src/services/blockchainData.ts` with:
  ```typescript
  export async function fetchTokenHolders(
    tokenAddress: string,
    chain: string,
    limit: number = 100
  ): Promise<TokenHolder[]>
  
  export async function fetchTokenInfo(
    tokenAddress: string,
    chain: string
  ): Promise<TokenInfo>
  ```

- Add API key management in `.env`:
  ```
  MORALIS_API_KEY=your_key_here
  ALCHEMY_API_KEY=your_key_here
  ETHERSCAN_API_KEY=your_key_here
  ```

- Implement retry logic with exponential backoff
- Add request rate limiting (max 5 requests/second)

### Task 1.2: Real Price Data
Replace mock prices with real-time data:

#### Requirements:
1. **CoinGecko API** for current prices
2. **Cache prices** (TTL: 60 seconds)
3. **Handle multiple tokens** in one request when possible
4. **Fallback to on-chain oracles** (Chainlink) if API fails

#### Implementation:
Create `src/services/priceData.ts`:
```typescript
export async function getCurrentPrice(
  tokenAddress: string,
  chain: string
): Promise<number>

export async function getHistoricalPrice(
  tokenAddress: string,
  chain: string,
  timestamp: number
): Promise<number>
```

---

## Phase 2: Real-Time Transfer Monitoring (HIGH IMPACT)

### Task 2.1: WebSocket Implementation
Add real-time monitoring for whale transfers:

#### Requirements:
1. **WebSocket connection** to blockchain node (Alchemy/Infura)
2. **Filter for Transfer events** on the token contract
3. **Detect large transfers** above threshold in real-time
4. **Identify destinations** (exchange deposits/withdrawals)
5. **Auto-reconnect** on connection drop

#### Implementation:
Create `src/services/realtimeMonitor.ts`:
```typescript
export class RealtimeMonitor {
  private ws: WebSocket;
  private tokenAddress: string;
  private chain: string;
  
  async start(): Promise<void>
  async stop(): Promise<void>
  
  onLargeTransfer(callback: (transfer: Transfer) => void): void
  onWhaleActivity(callback: (activity: Activity) => void): void
}
```

#### Features to Add:
- Event queue to handle bursts
- Transfer pattern detection:
  - Multiple transfers to same address (accumulation)
  - Multiple transfers from same address (distribution)
  - Circular transfers (wash trading detection)
- Alert generation for suspicious patterns

### Task 2.2: Historical Transfer Analysis
Analyze past whale activity:

#### Requirements:
1. Fetch last 1000 transfers for the token
2. Identify transfer patterns
3. Calculate transfer velocity (transfers per hour)
4. Detect accumulation/distribution trends

---

## Phase 3: Advanced Address Labeling (DIFFERENTIATOR)

### Task 3.1: Exchange Detection
Build a comprehensive exchange address database:

#### Requirements:
1. **Hardcode known exchanges**:
   - Binance (hot/cold wallets)
   - Coinbase
   - Kraken
   - OKX
   - Bybit
   - Gate.io
   - etc.

2. **Detect exchange patterns**:
   - High transaction volume
   - Many unique senders/receivers
   - Contract interaction patterns

3. **Label transfer direction**:
   - "Potential sell pressure" (transfer TO exchange)
   - "Potential accumulation" (transfer FROM exchange)

#### Implementation:
Create `src/services/addressLabeler.ts`:
```typescript
export class AddressLabeler {
  private knownAddresses: Map<string, AddressLabel>;
  
  async labelAddress(address: string, chain: string): Promise<AddressLabel>
  async isExchange(address: string): Promise<boolean>
  async isContract(address: string): Promise<boolean>
  async detectWalletType(address: string): Promise<WalletType>
}
```

### Task 3.2: Smart Address Detection
Add heuristics to identify address types:

1. **Team/Founder wallets**:
   - Look for vesting contract patterns
   - Check if address received large initial allocation
   - Low transfer frequency but large balances

2. **Bot wallets**:
   - High frequency trading
   - Small profit margins
   - Consistent patterns

3. **Multisig wallets**:
   - Check if address is multisig contract
   - Label as "Institutional" or "DAO Treasury"

4. **MEV bots**:
   - Sandwich attack patterns
   - Flashloan usage

---

## Phase 4: Performance Optimization (ESSENTIAL)

### Task 4.1: Caching Layer
Implement aggressive caching:

#### Requirements:
1. **In-memory cache** with TTL:
   - Holder data: 10 minutes
   - Centralization metrics: 15 minutes
   - Price data: 1 minute
   - Token info: 1 hour

2. **Cache invalidation**:
   - On large transfer detected
   - Manual refresh endpoint
   - Scheduled background refresh

#### Implementation:
```typescript
// Use node-cache or Redis
import NodeCache from 'node-cache';

const holderCache = new NodeCache({ stdTTL: 600 });
const priceCache = new NodeCache({ stdTTL: 60 });
```

### Task 4.2: Parallel API Calls
Optimize API calls:

#### Requirements:
1. Fetch holder data and price data in parallel
2. Batch price requests for multiple tokens
3. Use Promise.allSettled() for independent operations
4. Set timeout limits (30 seconds max)

### Task 4.3: Progressive Data Loading
For large holder lists:

#### Requirements:
1. Return top 100 holders immediately
2. Continue loading more holders in background
3. Update centralization metrics as more data arrives
4. Use streaming responses if possible

---

## Phase 5: Competitive Differentiators (MUST HAVE)

### Task 5.1: Whale Behavior Analysis
Add advanced whale tracking:

#### Requirements:
1. **Whale Cohort Analysis**:
   - Group whales by behavior patterns
   - "Accumulating" vs "Distributing" vs "HODLing"
   - Calculate each whale's average hold time

2. **Whale Tracking Score**:
   - Rate each whale's historical accuracy
   - Track if whale moves precede price moves
   - "Smart money" identification

3. **Whale Network Analysis**:
   - Detect coordinated whale movements
   - Identify connected wallets
   - Cluster analysis

#### Implementation:
Create `src/services/whaleAnalysis.ts`:
```typescript
export async function analyzeWhaleBehavior(
  whales: WhaleHolder[],
  historicalTransfers: Transfer[]
): Promise<WhaleBehaviorAnalysis>

export async function detectCoordination(
  whales: WhaleHolder[]
): Promise<CoordinationAlert[]>
```

### Task 5.2: Risk Score Dashboard
Create a comprehensive risk scoring system:

#### Requirements:
1. **Token Risk Score (0-100)**:
   - Centralization risk: 40%
   - Whale behavior: 30%
   - Exchange concentration: 20%
   - Transfer patterns: 10%

2. **Visual Risk Indicators**:
   - 0-25: Low risk (Green)
   - 26-50: Medium risk (Yellow)
   - 51-75: High risk (Orange)
   - 76-100: Critical risk (Red)

3. **Risk Breakdown**:
   - Explain each risk component
   - Show historical risk trend
   - Compare to similar tokens

### Task 5.3: Comparison Feature
Add token comparison:

#### Requirements:
1. Compare up to 3 tokens side-by-side
2. Show relative centralization
3. Highlight key differences
4. Suggest which is "safer" based on metrics

### Task 5.4: Historical Tracking
Add time-series data:

#### Requirements:
1. Store daily snapshots of centralization metrics
2. Show trends over time (7d, 30d, 90d)
3. Detect if centralization increasing/decreasing
4. Alert on significant changes

#### Implementation:
Create `src/services/historicalData.ts`:
```typescript
export async function saveSnapshot(
  tokenAddress: string,
  chain: string,
  data: HolderAnalysis
): Promise<void>

export async function getHistoricalTrend(
  tokenAddress: string,
  chain: string,
  days: number
): Promise<TrendData>
```

---

## Phase 6: Advanced Alert System

### Task 6.1: Smart Alert Filtering
Improve alert quality:

#### Requirements:
1. **Alert cooldown**: Don't spam same alert type
2. **Alert aggregation**: Combine related alerts
3. **Severity calculation**:
   - Critical: >$1M transfers, new whale >5% supply
   - Warning: $100K-$1M transfers, centralization increase
   - Info: Regular large transfers, new medium holder

4. **Alert context**: Include relevant historical data

### Task 6.2: Alert Webhooks (Optional)
Add notification support:

#### Requirements:
1. Webhook support for external notifications
2. Discord/Telegram bot integration hooks
3. Email alert option
4. Alert subscription system

---

## Phase 7: API Documentation & Testing

### Task 7.1: Comprehensive Testing
Add thorough test coverage:

#### Requirements:
1. **Unit tests** for all calculations:
   - Gini coefficient
   - HHI
   - Nakamoto coefficient
   - Risk scores

2. **Integration tests**:
   - Real API calls (with rate limiting)
   - WebSocket connection
   - Cache behavior

3. **Test with real tokens**:
   - Highly centralized: Small cap meme coins
   - Well distributed: ETH, USDC
   - Edge cases: Low holder count

#### Test Cases:
```typescript
describe('Token Holder Monitor', () => {
  it('should correctly calculate Gini coefficient', () => {})
  it('should identify known exchange addresses', () => {})
  it('should detect large transfers in real-time', () => {})
  it('should handle API failures gracefully', () => {})
  it('should cache results appropriately', () => {})
})
```

### Task 7.2: API Documentation
Create comprehensive docs:

#### Requirements:
1. OpenAPI/Swagger documentation
2. Example requests for each endpoint
3. Response schemas with examples
4. Error codes and handling
5. Rate limiting information

---

## Phase 8: Production Deployment

### Task 8.1: Environment Setup
Prepare for deployment:

#### Requirements:
1. **Environment variables**:
   ```
   NODE_ENV=production
   PORT=3000
   MORALIS_API_KEY=
   ALCHEMY_API_KEY=
   REDIS_URL=
   DATABASE_URL= (optional for historical data)
   ```

2. **Docker setup**:
   - Create Dockerfile
   - Docker Compose for local testing
   - Production-ready image

3. **Health checks**:
   - /health endpoint
   - /metrics endpoint (Prometheus format)
   - Logging with structured format

### Task 8.2: Deploy with x402
Set up x402 protocol payment:

#### Requirements:
1. Replace mock x402 with real implementation
2. Payment verification
3. Rate limiting per API key
4. Usage tracking

### Task 8.3: Monitoring & Logging
Production observability:

#### Requirements:
1. **Logging**:
   - Winston or Pino for structured logs
   - Log levels: error, warn, info, debug
   - Request/response logging

2. **Metrics**:
   - API response times
   - Cache hit rates
   - Error rates
   - Active WebSocket connections

3. **Alerts**:
   - High error rate
   - API key quota exceeded
   - WebSocket disconnections

---

## Unique Features That Will Win (Pick 2-3)

### Option A: "Whale Reputation System"
Track whale wallets across time and rate their "track record":
- Do their moves predict price changes?
- Are they early to trends?
- "Trust score" for each whale

### Option B: "Social Sentiment Integration"
Correlate whale moves with social media:
- Did whale move cause Twitter buzz?
- Track if moves align with influencer calls
- Detect insider trading patterns

### Option C: "DEX Pool Impact Calculator"
For each large transfer:
- Calculate exact price impact on major DEXes
- Show which pools would be affected
- Estimate slippage for market orders

### Option D: "Whale Alert Bot"
Twitter/Discord bot that posts alerts:
- Automatic tweets for large transfers
- Formatted with charts and context
- Tag relevant crypto influencers

### Option E: "Historical Backtest"
Let users backtest strategies:
- "What if I bought when top whale accumulated?"
- Show historical performance
- Generate trading signals

---

## Success Criteria

Your enhanced project should:

✅ **Work with real tokens**: Test with at least 5 different tokens  
✅ **Real-time monitoring**: Detect transfers within 60 seconds  
✅ **Accurate metrics**: Match other tools (DeBank, Etherscan) within 1%  
✅ **Fast response**: < 5 seconds for cached, < 15 seconds for fresh  
✅ **Good UX**: Clear, actionable alerts with context  
✅ **Production ready**: Deployed, monitored, and stable  
✅ **Unique feature**: At least 1 feature competitors don't have  

---

## Development Priorities

### Must Have (Do First):
1. ✅ Real blockchain data integration
2. ✅ Real price data
3. ✅ Address labeling (exchanges)
4. ✅ Caching layer
5. ✅ Real-time monitoring

### Should Have (Do Second):
6. ✅ Whale behavior analysis
7. ✅ Risk scoring system
8. ✅ Historical tracking
9. ✅ Comprehensive testing

### Nice to Have (If Time):
10. ⚠️ One unique competitive feature
11. ⚠️ Webhook alerts
12. ⚠️ API documentation
13. ⚠️ Advanced analytics

---

## Estimated Timeline

- **Phase 1-2** (Real data + Real-time): 8-12 hours
- **Phase 3** (Address labeling): 4-6 hours
- **Phase 4** (Performance): 3-4 hours
- **Phase 5** (Differentiators): 6-8 hours
- **Phase 6-8** (Alerts, Testing, Deploy): 6-8 hours

**Total: 27-38 hours** to make it highly competitive

---

## Testing Checklist Before Submission

- [ ] Test with USDC (well distributed, many holders)
- [ ] Test with small cap token (centralized)
- [ ] Test with ETH (large holder count)
- [ ] Verify Gini calculation matches known values
- [ ] Real-time monitoring catches actual transfers
- [ ] All 6 chains work correctly
- [ ] API keys are secure (not in code)
- [ ] Error handling works (bad token address, API down)
- [ ] Cache invalidation works correctly
- [ ] Performance meets targets (<15s)
- [ ] Documentation is complete
- [ ] Deployed and accessible via x402

---

## Example Tokens for Testing

**Well Distributed:**
- USDC (Ethereum): 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
- WETH (Ethereum): 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2

**Centralized:**
- Find new low-cap tokens on Etherscan
- Check team holdings are high

**Edge Cases:**
- Token with <100 holders
- Token with >100k holders
- Rebasing tokens (AMPL)

---

## Final Notes

Focus on **quality over features**. It's better to have:
- Real data that works perfectly
- Fast, cached responses
- Accurate calculations
- One unique killer feature

Than to have:
- Many features that don't work well
- Slow performance
- Unreliable data
- Nothing that stands out

**Good luck! Make it production-ready and add at least ONE feature that makes judges say "wow, that's clever!"**
