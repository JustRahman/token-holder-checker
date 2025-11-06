# Token Holder Monitor Agent - Production Ready

A **production-ready**, comprehensive agent for monitoring token holder distributions, tracking whale wallets, and generating alerts for centralization risks across multiple blockchain networks. Now with **real API integrations**, advanced risk scoring, and intelligent caching.

## 🚀 Key Features

### Core Analytics
- **Real-Time Token Data**: Integrates with Moralis API for live blockchain data
- **Live Price Feeds**: CoinGecko integration for real-time token prices
- **Whale Detection**: Identifies and tracks large holders based on USD value and % of supply
- **Centralization Metrics**: Gini coefficient, HHI, Nakamoto coefficient, and custom risk scores
- **Distribution Analysis**: Categorizes holders (retail, small, medium, large, whales)
- **Advanced Address Labeling**: Comprehensive database of 50+ known exchange addresses
- **Enhanced Risk Scoring**: Multi-factor risk assessment with warnings and recommendations

### Performance & Reliability
- **Intelligent Caching**: Multi-tier caching with configurable TTLs
- **Retry Logic**: Automatic retry with exponential backoff
- **Rate Limiting**: Built-in request queuing (5 req/sec)
- **Parallel API Calls**: Optimized data fetching
- **Graceful Fallbacks**: Automatic fallback to mock data if APIs fail

### Supported Chains
- ✅ Ethereum
- ✅ Base
- ✅ Arbitrum
- ✅ Optimism
- ✅ Polygon
- ✅ BSC (Binance Smart Chain)

## 📦 Installation

```bash
npm install
```

## ⚙️ Configuration

### 1. Set up environment variables

Copy the example file:
```bash
cp .env.example .env
```

### 2. Add your API keys to `.env`:

```bash
# Required for real data
MORALIS_API_KEY=your_moralis_api_key_here

# Optional (will use mock data if not provided)
ALCHEMY_API_KEY=your_alchemy_api_key_here
COINGECKO_API_KEY=your_coingecko_pro_key_here

# Block explorer API keys (optional, for future features)
ETHERSCAN_API_KEY=your_etherscan_key
POLYGONSCAN_API_KEY=your_polygonscan_key
# ... etc
```

### 3. Getting API Keys

- **Moralis** (Required): https://moralis.io - Free tier available
- **CoinGecko** (Optional): https://www.coingecko.com/en/api/pricing - Free tier works
- **Alchemy** (Optional): https://www.alchemy.com - Free tier available

## 🏃 Usage

### Build
```bash
npm run build
```

### Start the Agent
```bash
npm start
```

### Development Mode (with hot reload)
```bash
npm run dev
```

### Run Tests
```bash
npm run test:simple
```

## 📡 API Endpoints

### Analyze Token Holders

**Endpoint**: `analyze_holders`

**Input**:
```json
{
  "token_address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  "chain": "ethereum",
  "whale_threshold_usd": 100000,
  "whale_threshold_percent": 1,
  "top_holders_count": 100,
  "track_transfers": true,
  "alert_threshold_usd": 50000,
  "time_window": "24h"
}
```

**Output**:
```json
{
  "token_info": {
    "name": "USD Coin",
    "symbol": "USDC",
    "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    "chain": "ethereum",
    "total_supply": 25000000000,
    "current_price_usd": 1.0,
    "market_cap_usd": 25000000000,
    "total_holders": 100
  },
  "centralization_metrics": {
    "gini_coefficient": 0.75,
    "herfindahl_index": 450,
    "nakamoto_coefficient": 8,
    "top10_percentage": 45.5,
    "top50_percentage": 72.3,
    "top100_percentage": 85.2,
    "centralization_score": 52.3,
    "risk_level": "high"
  },
  "whale_holders": [...],
  "recent_whale_activity": [...],
  "distribution_analysis": {...},
  "alerts": [...],
  "holder_trends": {...},
  "enhanced_risk_score": {
    "overall_score": 58.3,
    "risk_level": "high",
    "breakdown": {
      "centralization_risk": {
        "score": 65.0,
        "weight": 0.40,
        "factors": [...]
      },
      "whale_behavior_risk": {...},
      "exchange_concentration_risk": {...},
      "transfer_pattern_risk": {...}
    },
    "warnings": [
      "⚠️ HIGH: Significant sell pressure risk from exchange holdings"
    ],
    "recommendations": [
      "Monitor exchange deposit/withdrawal activity closely"
    ]
  },
  "metadata": {
    "last_updated": 1699564800000,
    "block_height": 18500123,
    "data_sources": ["moralis", "coingecko"],
    "cache_ttl": 900
  }
}
```

### Health Check

**Endpoint**: `health`

**Input**: `{}`

**Output**:
```json
{
  "status": "ok",
  "version": "0.1.0",
  "timestamp": 1699564800000,
  "supported_chains": ["ethereum", "base", "arbitrum", "optimism", "polygon", "bsc"]
}
```

## 📊 Enhanced Risk Scoring

The enhanced risk scoring system provides a comprehensive assessment based on multiple factors:

### Risk Components

1. **Centralization Risk** (40% weight)
   - Gini coefficient analysis
   - Nakamoto coefficient evaluation
   - Top holder concentration
   - HHI market concentration

2. **Whale Behavior Risk** (30% weight)
   - Number of large holders
   - Recent selling activity
   - Large transfer detection
   - Exchange concentration

3. **Exchange Concentration Risk** (20% weight)
   - Total exchange holdings
   - Single exchange dominance
   - Sell pressure assessment

4. **Transfer Pattern Risk** (10% weight)
   - Accumulation vs distribution patterns
   - Exchange deposit activity
   - Transfer velocity analysis

### Risk Levels

- **Low** (0-25): Well-distributed, low centralization
- **Medium** (25-50): Moderate centralization, manageable risk
- **High** (50-75): High centralization, significant risk factors
- **Critical** (75-100): Extreme centralization, major red flags

## 🏗️ Architecture

```
src/
├── config/
│   └── index.ts              # Configuration management
├── services/
│   ├── blockchainData.ts     # Moralis/Alchemy integration
│   ├── priceData.ts          # CoinGecko price feeds
│   ├── cache.ts              # Multi-tier caching
│   ├── apiUtils.ts           # Retry logic & rate limiting
│   ├── addressLabeler.ts     # Exchange detection (50+ addresses)
│   └── riskScoring.ts        # Enhanced risk assessment
├── metrics.ts                # Centralization calculations
├── whales.ts                 # Whale detection & classification
├── alerts.ts                 # Alert generation
├── types.ts                  # TypeScript definitions
└── index.ts                  # Main agent
```

## 🎯 Centralization Metrics Explained

### Gini Coefficient
- **Range**: 0 (perfect equality) to 1 (complete inequality)
- Measures how unequally tokens are distributed
- Higher values = more centralized

### Herfindahl-Hirschman Index (HHI)
- **Range**: 0 to 10,000
- < 1,500: Unconcentrated
- 1,500 - 2,500: Moderately concentrated
- \> 2,500: Highly concentrated

### Nakamoto Coefficient
- Minimum number of entities needed to control >51% of supply
- Lower = higher centralization risk
- < 3: Critical, < 5: High risk

### Custom Centralization Score
- Weighted combination of all metrics
- 0-100 scale (higher = more centralized)
- Includes top holder percentages

## ⚡ Performance Optimizations

### Caching Strategy
- **Holder Data**: 10 minutes TTL
- **Price Data**: 1 minute TTL
- **Token Info**: 1 hour TTL
- Automatic cache invalidation on large transfers

### API Optimizations
- Parallel data fetching
- Request queue with rate limiting
- Exponential backoff retry logic
- Graceful degradation

### Cache Statistics
Monitor cache performance:
```typescript
import { getCacheStats } from "./services/cache";
const stats = getCacheStats();
// Returns hit rates, key counts for all caches
```

## 🔍 Address Labeling

Comprehensive database of known addresses:

**Exchanges** (50+ addresses):
- Binance (10 wallets)
- Coinbase (7 wallets)
- Kraken (7 wallets)
- Bitfinex (5 wallets)
- OKX, Bybit, Gate.io, Huobi, KuCoin, Gemini

**DEX Protocols**:
- Uniswap V2/V3 Routers
- Sushiswap Router
- Curve Pools

## 🚨 Alert Types

- **large_transfer**: Transfers above USD threshold
- **accumulation**: Multiple large purchases detected
- **distribution**: Multiple large sales detected
- **new_whale**: New address crosses whale threshold
- **centralization_risk**: Metrics exceed danger thresholds

## 📈 Data Sources

- **Primary**: Moralis API (holder data, token info)
- **Fallback**: Alchemy API (future)
- **Prices**: CoinGecko API
- **Labels**: Built-in exchange database
- **Mock**: Automatic fallback if no API keys

## 🔐 Security & Privacy

- API keys stored in environment variables
- No sensitive data in codebase
- Rate limiting prevents abuse
- Secure API communication (HTTPS)

## 🧪 Testing

### Test with Mock Data
```bash
npm run test:simple
```

### Test with Real Tokens
Set API keys in `.env` and run:
```bash
# Example: Analyze USDC
npm run dev
# Then call analyze_holders with USDC address
```

### Recommended Test Tokens

**Well Distributed**:
- USDC: `0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48`
- WETH: `0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2`

**For Testing Edge Cases**:
- Tokens with < 100 holders
- New token launches (centralized)

## 📝 Development

### Adding New Chains
1. Update `MORALIS_CHAIN_IDS` in `blockchainData.ts`
2. Update `COINGECKO_PLATFORMS` in `priceData.ts`
3. Add chain config to `config/index.ts`

### Adding New Exchanges
Add to `KNOWN_EXCHANGES` in `addressLabeler.ts`:
```typescript
"0xaddress": { label: "Exchange Name", tags: ["exchange", "cex"] }
```

## 🔄 Roadmap

### Implemented ✅
- Real blockchain data integration (Moralis)
- Real-time price feeds (CoinGecko)
- Advanced address labeling
- Enhanced risk scoring system
- Intelligent caching
- Retry logic & error handling

### Coming Soon 🚧
- WebSocket real-time monitoring
- Historical tracking & trends
- Whale reputation system
- Telegram/Discord alerts
- More blockchain explorers (Etherscan, etc.)

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Additional API integrations (Alchemy, Etherscan)
- More exchange addresses
- Historical data tracking
- Real-time WebSocket monitoring
- Additional chains

## 📄 License

MIT

## 🙋 Support

For issues or questions:
- Check the `.env.example` for configuration
- Ensure API keys are valid
- Check console logs for errors
- Falls back to mock data automatically

---

**Built with**: TypeScript, @lucid-dreams/agent-kit, Moralis, CoinGecko, ethers.js, zod
**Version**: 0.1.0
**Status**: Production Ready 🚀
