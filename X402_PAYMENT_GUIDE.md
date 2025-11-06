# 💰 X402 Payment Integration Guide

## Overview

The Token Holder Monitor now includes **X402 payment protection** for all API calls. This ensures that users pay a small fee (default: $0.01 USDC) before accessing token holder analysis.

**✅ IMPORTANT**: All existing functionality remains unchanged - payment is a transparent wrapper around the agent!

---

## 🎯 How It Works

### Payment Flow

```
1. Client Request (without payment)
   ↓
2. Agent returns 402 Payment Required
   ↓
3. Client sends X-PAYMENT header
   ↓
4. Facilitator verifies payment
   ↓
5. Handler executes (your existing logic)
   ↓
6. Payment settled
   ↓
7. Results returned to client
```

### Key Points

- ✅ **No code changes needed** - payment is handled by middleware
- ✅ **Existing logic unchanged** - `analyze_holders` works exactly the same
- ✅ **Automatic verification** - facilitator handles blockchain checks
- ✅ **Secure** - handler only runs after payment verification

---

## 🔧 Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# X402 Payment Configuration
FACILITATOR_URL=https://facilitator.daydreams.systems
PAY_TO_WALLET=0x992920386E3D950BC260f99C81FDA12419eD4594
PAYMENT_NETWORK=base
PAYMENT_AMOUNT=0.01
```

### What Each Variable Means

| Variable | Description | Default |
|----------|-------------|---------|
| `FACILITATOR_URL` | Payment verification service | `https://facilitator.daydreams.systems` |
| `PAY_TO_WALLET` | Your wallet address that receives payments | `0x992920386E3D950BC260f99C81FDA12419eD4594` |
| `PAYMENT_NETWORK` | Blockchain network for payments | `base` |
| `PAYMENT_AMOUNT` | Price per API call in USDC | `0.01` ($0.01) |

### Supported Networks

- ✅ **base** (Coinbase L2) - Recommended, lowest fees
- ✅ **ethereum** - Ethereum mainnet
- ✅ **polygon** - Polygon PoS
- ✅ **arbitrum** - Arbitrum One
- ✅ **optimism** - Optimism

---

## 🚀 Using the Agent with Payments

### Option 1: Using Agent-Kit Client

```typescript
import { createAgentClient } from "@lucid-dreams/agent-kit";

const client = createAgentClient({
  agentUrl: "http://localhost:3000",
  wallet: yourWallet, // Web3 wallet for payments
});

// Call the agent - payment handled automatically
const result = await client.call("analyze_holders", {
  token_address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  chain: "ethereum",
  top_holders_count: 100
});
```

### Option 2: Manual HTTP Request

**Step 1: Get Payment Requirements**

```bash
curl -X POST http://localhost:3000/entrypoints/analyze_holders \
  -H "Content-Type: application/json" \
  -d '{
    "token_address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    "chain": "ethereum"
  }'
```

**Response (402 Payment Required):**
```json
{
  "error": "X-PAYMENT header is required",
  "accepts": {
    "payTo": "0x992920386E3D950BC260f99C81FDA12419eD4594",
    "network": "base",
    "amount": "0.01",
    "currency": "USDC"
  },
  "x402Version": 1
}
```

**Step 2: Send Request with Payment**

```bash
curl -X POST http://localhost:3000/entrypoints/analyze_holders \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: <payment-signature>" \
  -d '{
    "token_address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    "chain": "ethereum"
  }'
```

**Response (200 OK):**
```json
{
  "output": {
    "token_info": { /* ... */ },
    "centralization_metrics": { /* ... */ },
    "whale_holders": [ /* ... */ ],
    "enhanced_risk_score": { /* ... */ }
  }
}
```

Response includes `X-PAYMENT-RESPONSE` header with settlement details.

---

## 💳 Payment Details

### Pricing

| Endpoint | Default Price | Description |
|----------|---------------|-------------|
| `analyze_holders` | $0.01 USDC | Complete token holder analysis |
| `health` | Free | Health check endpoint |

### Payment Processing

1. **Verification**: Facilitator verifies payment is valid and matches requirements
2. **Execution**: Handler runs and performs analysis
3. **Settlement**: Payment is settled on-chain after successful execution

### Security

- ✅ **Pre-payment verification** - Handler only runs after payment check
- ✅ **Facilitator-managed** - No blockchain code in your agent
- ✅ **Non-refundable** - Payments settled after successful execution
- ✅ **Transparent** - All existing logic remains visible and unchanged

---

## 🔍 Testing

### Test Without Payments (Development)

For development/testing, you can disable payments:

1. **Option 1**: Comment out payment config in `src/index.ts`:
```typescript
// Temporarily disable payments for testing
const { app, addEntrypoint } = createAgentApp(
  {
    name: "token-holder-monitor",
    version: "0.1.0",
    description: "..."
  }
  // Remove second parameter to disable payments
);
```

2. **Option 2**: Set `useConfigPayments: false`:
```typescript
const { app, addEntrypoint } = createAgentApp(
  { /* ... */ },
  {
    config: { payments: { /* ... */ } },
    useConfigPayments: false  // ❌ Disables payments
  }
);
```

### Test With Payments (Production)

```bash
# Start the agent
npm run start:prod

# In another terminal, test the endpoint
curl http://localhost:3000/entrypoints/analyze_holders

# Should return 402 with payment requirements
```

---

## 📋 Integration Checklist

### For Users

- [ ] Agent is running (`npm start`)
- [ ] Payment configuration is set in `.env`
- [ ] Wallet has USDC on the payment network (base)
- [ ] Using agent-kit client or manual X-PAYMENT headers

### For Developers

- [ ] `useConfigPayments: true` is set in `src/index.ts`
- [ ] Payment environment variables configured
- [ ] Wallet address (`PAY_TO_WALLET`) is your own
- [ ] Payment network matches your preference
- [ ] Price (`PAYMENT_AMOUNT`) is set correctly

---

## 🎯 What Changed in the Code

### Before (No Payments)

```typescript
const { app, addEntrypoint } = createAgentApp({
  name: "token-holder-monitor",
  version: "0.1.0",
  description: "..."
});
```

### After (With Payments)

```typescript
const { app, addEntrypoint } = createAgentApp(
  {
    name: "token-holder-monitor",
    version: "0.1.0",
    description: "..."
  },
  {
    config: {
      payments: {
        facilitatorUrl: process.env.FACILITATOR_URL || "https://facilitator.daydreams.systems",
        payTo: process.env.PAY_TO_WALLET || "0x992920386E3D950BC260f99C81FDA12419eD4594",
        network: process.env.PAYMENT_NETWORK || "base",
        defaultPrice: process.env.PAYMENT_AMOUNT || "0.01"
      }
    },
    useConfigPayments: true  // ✅ This enables payments
  }
);
```

**✅ ALL existing handler logic remains 100% unchanged!**

---

## 🆘 Troubleshooting

### "X-PAYMENT header is required"

**Solution**: This is expected! Send a request with the X-PAYMENT header or use the agent-kit client.

### "Unable to find matching payment requirements"

**Issue**: Payment doesn't match required amount/network.

**Solution**: Ensure payment is:
- On correct network (base)
- Correct amount (0.01 USDC)
- Sent to correct wallet address

### "Failed to verify payment"

**Issue**: Facilitator couldn't verify the payment.

**Solution**:
- Check facilitator URL is accessible
- Ensure payment is properly signed
- Verify network connectivity

### Payments Disabled for Testing

**Temporary Disable**:
```typescript
useConfigPayments: false  // Disables payment requirement
```

**Re-enable**:
```typescript
useConfigPayments: true   // Enables payment requirement
```

---

## 📚 Additional Resources

### Agent-Kit Documentation
- [X402 Protocol](https://docs.x402.org)
- [Agent-Kit Payments](https://github.com/lucid-dreams/agent-kit)

### Related Files
- `src/index.ts` - Payment configuration (lines 25-44)
- `.env` - Payment environment variables (lines 16-20)
- `X402_PAYMENT_FLOW_ANALYSIS.md` - Detailed technical flow

---

## ✅ Summary

**What Was Added:**
- ✅ X402 payment middleware (automatic)
- ✅ Payment configuration (4 environment variables)
- ✅ Facilitator integration (no blockchain code needed)

**What Stayed the Same:**
- ✅ All `analyze_holders` logic
- ✅ All whale detection algorithms
- ✅ All centralization metrics
- ✅ All risk scoring calculations
- ✅ All caching and API calls
- ✅ All test files and functionality

**Result:**
- 🎉 Production-ready agent with payment protection
- 💰 Monetize your token analysis service
- 🔒 Secure payment verification
- 🚀 Zero changes to existing business logic

---

**Status**: ✅ Payment Integration Complete

Your Token Holder Monitor is now a **paid API service** while maintaining 100% of its existing functionality!
