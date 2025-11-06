// Enhanced risk scoring system

import { CentralizationMetrics, WhaleHolder, WhaleActivity } from "../types.js";

export interface EnhancedRiskScore {
  overall_score: number; // 0-100
  risk_level: "low" | "medium" | "high" | "critical";
  breakdown: {
    centralization_risk: {
      score: number;
      weight: number;
      factors: string[];
    };
    whale_behavior_risk: {
      score: number;
      weight: number;
      factors: string[];
    };
    exchange_concentration_risk: {
      score: number;
      weight: number;
      factors: string[];
    };
    transfer_pattern_risk: {
      score: number;
      weight: number;
      factors: string[];
    };
  };
  warnings: string[];
  recommendations: string[];
}

/**
 * Calculate centralization risk component
 */
function calculateCentralizationRisk(
  metrics: CentralizationMetrics
): { score: number; factors: string[] } {
  const factors: string[] = [];
  let score = 0;

  // Gini coefficient (0-30 points)
  if (metrics.gini_coefficient > 0.8) {
    score += 30;
    factors.push(`Extremely high Gini coefficient (${metrics.gini_coefficient.toFixed(3)})`);
  } else if (metrics.gini_coefficient > 0.6) {
    score += 20;
    factors.push(`High Gini coefficient (${metrics.gini_coefficient.toFixed(3)})`);
  } else if (metrics.gini_coefficient > 0.4) {
    score += 10;
    factors.push(`Moderate Gini coefficient (${metrics.gini_coefficient.toFixed(3)})`);
  }

  // Nakamoto coefficient (0-25 points)
  if (metrics.nakamoto_coefficient < 3) {
    score += 25;
    factors.push(`Very low Nakamoto coefficient (${metrics.nakamoto_coefficient})`);
  } else if (metrics.nakamoto_coefficient < 5) {
    score += 20;
    factors.push(`Low Nakamoto coefficient (${metrics.nakamoto_coefficient})`);
  } else if (metrics.nakamoto_coefficient < 10) {
    score += 10;
    factors.push(`Moderate Nakamoto coefficient (${metrics.nakamoto_coefficient})`);
  }

  // Top 10 concentration (0-25 points)
  if (metrics.top10_percentage > 80) {
    score += 25;
    factors.push(`Top 10 control ${metrics.top10_percentage.toFixed(1)}% of supply`);
  } else if (metrics.top10_percentage > 60) {
    score += 20;
    factors.push(`Top 10 control ${metrics.top10_percentage.toFixed(1)}% of supply`);
  } else if (metrics.top10_percentage > 40) {
    score += 10;
    factors.push(`Top 10 control ${metrics.top10_percentage.toFixed(1)}% of supply`);
  }

  // HHI (0-20 points)
  if (metrics.herfindahl_index > 2500) {
    score += 20;
    factors.push(`High market concentration (HHI: ${metrics.herfindahl_index})`);
  } else if (metrics.herfindahl_index > 1500) {
    score += 10;
    factors.push(`Moderate market concentration (HHI: ${metrics.herfindahl_index})`);
  }

  return { score: Math.min(score, 100), factors };
}

/**
 * Calculate whale behavior risk
 */
function calculateWhaleBehaviorRisk(
  whales: WhaleHolder[],
  recentActivity: WhaleActivity[]
): { score: number; factors: string[] } {
  const factors: string[] = [];
  let score = 0;

  // Number of whales (0-20 points)
  const topWhales = whales.filter(w => w.percentage_of_supply > 5).length;
  if (topWhales > 5) {
    score += 20;
    factors.push(`${topWhales} whales hold >5% each`);
  } else if (topWhales > 3) {
    score += 10;
    factors.push(`${topWhales} whales hold >5% each`);
  }

  // Recent selling activity (0-30 points)
  const recentSells = recentActivity.filter(a =>
    a.type === "sell" && Date.now() - a.timestamp < 24 * 60 * 60 * 1000
  );

  if (recentSells.length >= 5) {
    score += 30;
    factors.push(`${recentSells.length} large sells in last 24h`);
  } else if (recentSells.length >= 3) {
    score += 20;
    factors.push(`${recentSells.length} large sells in last 24h`);
  } else if (recentSells.length >= 1) {
    score += 10;
    factors.push(`${recentSells.length} large sell(s) in last 24h`);
  }

  // Large transfer size (0-25 points)
  const largeTransfers = recentActivity.filter(a => a.percentage_of_supply > 1);
  if (largeTransfers.length > 0) {
    const maxTransfer = Math.max(...largeTransfers.map(a => a.percentage_of_supply));
    if (maxTransfer > 5) {
      score += 25;
      factors.push(`Transfer of ${maxTransfer.toFixed(2)}% of supply detected`);
    } else if (maxTransfer > 2) {
      score += 15;
      factors.push(`Transfer of ${maxTransfer.toFixed(2)}% of supply detected`);
    }
  }

  // Exchange concentration (0-25 points)
  const exchangeHolders = whales.filter(w =>
    w.tags.includes("exchange") || w.tags.includes("cex")
  );
  const exchangePercentage = exchangeHolders.reduce((sum, w) => sum + w.percentage_of_supply, 0);

  if (exchangePercentage > 50) {
    score += 25;
    factors.push(`Exchanges hold ${exchangePercentage.toFixed(1)}% of supply`);
  } else if (exchangePercentage > 30) {
    score += 15;
    factors.push(`Exchanges hold ${exchangePercentage.toFixed(1)}% of supply`);
  }

  return { score: Math.min(score, 100), factors };
}

/**
 * Calculate exchange concentration risk
 */
function calculateExchangeRisk(
  whales: WhaleHolder[]
): { score: number; factors: string[] } {
  const factors: string[] = [];
  let score = 0;

  const exchangeHolders = whales.filter(w =>
    w.tags.includes("exchange") || w.tags.includes("cex")
  );

  if (exchangeHolders.length === 0) {
    factors.push("No major exchange holdings detected");
    return { score: 0, factors };
  }

  const totalExchangePercentage = exchangeHolders.reduce(
    (sum, w) => sum + w.percentage_of_supply,
    0
  );

  // Total exchange percentage (0-50 points)
  if (totalExchangePercentage > 60) {
    score += 50;
    factors.push(`${totalExchangePercentage.toFixed(1)}% held on exchanges - extreme sell pressure risk`);
  } else if (totalExchangePercentage > 40) {
    score += 35;
    factors.push(`${totalExchangePercentage.toFixed(1)}% held on exchanges - high sell pressure risk`);
  } else if (totalExchangePercentage > 20) {
    score += 20;
    factors.push(`${totalExchangePercentage.toFixed(1)}% held on exchanges - moderate sell pressure risk`);
  } else {
    score += 5;
    factors.push(`${totalExchangePercentage.toFixed(1)}% held on exchanges - low sell pressure risk`);
  }

  // Single exchange concentration (0-50 points)
  const largestExchange = exchangeHolders.reduce(
    (max, w) => (w.percentage_of_supply > max.percentage_of_supply ? w : max),
    exchangeHolders[0]
  );

  if (largestExchange && largestExchange.percentage_of_supply > 30) {
    score += 50;
    factors.push(`Single exchange (${largestExchange.label}) holds ${largestExchange.percentage_of_supply.toFixed(1)}%`);
  } else if (largestExchange && largestExchange.percentage_of_supply > 20) {
    score += 30;
    factors.push(`Largest exchange (${largestExchange.label}) holds ${largestExchange.percentage_of_supply.toFixed(1)}%`);
  } else if (largestExchange && largestExchange.percentage_of_supply > 10) {
    score += 15;
    factors.push(`Largest exchange (${largestExchange.label}) holds ${largestExchange.percentage_of_supply.toFixed(1)}%`);
  }

  return { score: Math.min(score, 100), factors };
}

/**
 * Calculate transfer pattern risk
 */
function calculateTransferPatternRisk(
  recentActivity: WhaleActivity[]
): { score: number; factors: string[] } {
  const factors: string[] = [];
  let score = 0;

  if (recentActivity.length === 0) {
    factors.push("No recent whale activity");
    return { score: 0, factors };
  }

  // Accumulation vs distribution
  const recentTime = Date.now() - 24 * 60 * 60 * 1000;
  const recent24h = recentActivity.filter(a => a.timestamp > recentTime);

  const buys = recent24h.filter(a => a.type === "buy").length;
  const sells = recent24h.filter(a => a.type === "sell").length;

  if (sells > buys * 2) {
    score += 30;
    factors.push(`Distribution pattern: ${sells} sells vs ${buys} buys in 24h`);
  } else if (sells > buys) {
    score += 15;
    factors.push(`Mild distribution: ${sells} sells vs ${buys} buys in 24h`);
  } else if (buys > sells * 2) {
    score -= 10; // Negative risk for accumulation
    factors.push(`Accumulation pattern: ${buys} buys vs ${sells} sells in 24h`);
  }

  // Exchange deposits (potential sell pressure)
  const exchangeDeposits = recent24h.filter(
    a => a.type === "sell" && a.exchange_detected
  ).length;

  if (exchangeDeposits > 5) {
    score += 25;
    factors.push(`${exchangeDeposits} large exchange deposits in 24h`);
  } else if (exchangeDeposits > 2) {
    score += 15;
    factors.push(`${exchangeDeposits} exchange deposits in 24h`);
  }

  // Transfer velocity
  if (recent24h.length > 20) {
    score += 20;
    factors.push(`High transfer velocity: ${recent24h.length} large transfers in 24h`);
  } else if (recent24h.length > 10) {
    score += 10;
    factors.push(`Moderate transfer velocity: ${recent24h.length} large transfers in 24h`);
  }

  return { score: Math.max(score, 0), factors };
}

/**
 * Calculate enhanced risk score
 */
export function calculateEnhancedRiskScore(
  metrics: CentralizationMetrics,
  whales: WhaleHolder[],
  recentActivity: WhaleActivity[]
): EnhancedRiskScore {
  // Calculate component scores
  const centralization = calculateCentralizationRisk(metrics);
  const whaleBehavior = calculateWhaleBehaviorRisk(whales, recentActivity);
  const exchangeConcentration = calculateExchangeRisk(whales);
  const transferPattern = calculateTransferPatternRisk(recentActivity);

  // Weights
  const weights = {
    centralization: 0.40,
    whale_behavior: 0.30,
    exchange: 0.20,
    transfer: 0.10,
  };

  // Calculate overall score
  const overallScore =
    centralization.score * weights.centralization +
    whaleBehavior.score * weights.whale_behavior +
    exchangeConcentration.score * weights.exchange +
    transferPattern.score * weights.transfer;

  // Determine risk level
  let riskLevel: "low" | "medium" | "high" | "critical";
  if (overallScore >= 75) riskLevel = "critical";
  else if (overallScore >= 50) riskLevel = "high";
  else if (overallScore >= 25) riskLevel = "medium";
  else riskLevel = "low";

  // Generate warnings
  const warnings: string[] = [];
  if (centralization.score > 75) {
    warnings.push("⚠️ CRITICAL: Extremely centralized token distribution");
  }
  if (metrics.nakamoto_coefficient < 3) {
    warnings.push("⚠️ CRITICAL: Very few holders can control majority of supply");
  }
  if (exchangeConcentration.score > 60) {
    warnings.push("⚠️ HIGH: Significant sell pressure risk from exchange holdings");
  }
  if (whaleBehavior.score > 70) {
    warnings.push("⚠️ HIGH: Concerning whale behavior patterns detected");
  }

  // Generate recommendations
  const recommendations: string[] = [];
  if (overallScore > 50) {
    recommendations.push("Consider waiting for better distribution before investing");
  }
  if (exchangeConcentration.score > 40) {
    recommendations.push("Monitor exchange deposit/withdrawal activity closely");
  }
  if (metrics.nakamoto_coefficient < 5) {
    recommendations.push("High centralization risk - diversify holdings");
  }
  if (transferPattern.score > 30) {
    recommendations.push("Recent distribution pattern suggests caution");
  }

  return {
    overall_score: Math.round(overallScore * 10) / 10,
    risk_level: riskLevel,
    breakdown: {
      centralization_risk: {
        score: Math.round(centralization.score * 10) / 10,
        weight: weights.centralization,
        factors: centralization.factors,
      },
      whale_behavior_risk: {
        score: Math.round(whaleBehavior.score * 10) / 10,
        weight: weights.whale_behavior,
        factors: whaleBehavior.factors,
      },
      exchange_concentration_risk: {
        score: Math.round(exchangeConcentration.score * 10) / 10,
        weight: weights.exchange,
        factors: exchangeConcentration.factors,
      },
      transfer_pattern_risk: {
        score: Math.round(transferPattern.score * 10) / 10,
        weight: weights.transfer,
        factors: transferPattern.factors,
      },
    },
    warnings,
    recommendations,
  };
}
