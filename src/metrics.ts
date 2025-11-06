// Centralization metrics calculation functions

import { Holder, CentralizationMetrics } from "./types.js";

/**
 * Calculate Gini coefficient
 * Measures inequality in token distribution
 * Formula: G = (2 × Σ(i × y_i)) / (n × Σy_i) - (n + 1) / n
 * Scale: 0 (perfect equality) to 1 (complete inequality)
 */
export function calculateGiniCoefficient(holders: Holder[]): number {
  if (holders.length === 0) return 0;

  // Sort by balance ascending
  const sorted = [...holders].sort((a, b) => a.balance - b.balance);
  const n = sorted.length;

  let sumOfProducts = 0;
  let sumOfBalances = 0;

  sorted.forEach((holder, index) => {
    sumOfProducts += (index + 1) * holder.balance;
    sumOfBalances += holder.balance;
  });

  if (sumOfBalances === 0) return 0;

  const gini = (2 * sumOfProducts) / (n * sumOfBalances) - (n + 1) / n;
  return Math.round(gini * 1000) / 1000; // Round to 3 decimals
}

/**
 * Calculate Herfindahl-Hirschman Index (HHI)
 * Measures market concentration
 * Formula: HHI = Σ(s_i²) where s_i is % market share
 * Scale: 0 to 10,000
 * < 1,500: Unconcentrated
 * 1,500 - 2,500: Moderately concentrated
 * > 2,500: Highly concentrated
 */
export function calculateHHI(holders: Holder[], totalSupply: number): number {
  if (totalSupply === 0) return 0;

  let hhi = 0;

  holders.forEach((holder) => {
    const marketShare = (holder.balance / totalSupply) * 100;
    hhi += marketShare * marketShare;
  });

  return Math.round(hhi);
}

/**
 * Calculate Nakamoto Coefficient
 * Minimum entities needed to control >51% of supply
 */
export function calculateNakamotoCoefficient(
  holders: Holder[],
  totalSupply: number
): number {
  if (totalSupply === 0 || holders.length === 0) return 0;

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

/**
 * Calculate percentage held by top N holders
 */
export function calculateTopNPercentage(
  holders: Holder[],
  n: number,
  totalSupply: number
): number {
  if (totalSupply === 0 || holders.length === 0) return 0;

  const sorted = [...holders].sort((a, b) => b.balance - a.balance);
  const topN = sorted.slice(0, Math.min(n, sorted.length));

  const topNSum = topN.reduce((sum, holder) => sum + holder.balance, 0);
  const percentage = (topNSum / totalSupply) * 100;

  return Math.round(percentage * 100) / 100; // Round to 2 decimals
}

/**
 * Calculate custom centralization score (0-100, higher = more centralized)
 * Weighted combination of metrics:
 * - Top 10 concentration (30%)
 * - Gini coefficient (25%)
 * - Nakamoto coefficient (20%)
 * - Number of whales (15%)
 * - HHI (10%)
 */
export function calculateCentralizationScore(params: {
  gini: number;
  hhi: number;
  nakamoto: number;
  top10: number;
  whaleCount: number;
  totalHolders: number;
}): number {
  const { gini, hhi, nakamoto, top10, whaleCount, totalHolders } = params;

  // Normalize top10 concentration (0-100)
  const top10Score = Math.min(top10, 100);

  // Normalize Gini (0-1 to 0-100)
  const giniScore = gini * 100;

  // Normalize Nakamoto (inverse - lower is worse)
  // If nakamoto is 1-3, score is high (bad)
  // If nakamoto is > 50, score is low (good)
  const nakamotoScore = Math.max(0, 100 - nakamoto * 2);

  // Normalize whale percentage
  const whalePercentage = totalHolders > 0 ? (whaleCount / totalHolders) * 100 : 0;
  const whaleScore = Math.min(whalePercentage * 10, 100); // Multiply by 10 for sensitivity

  // Normalize HHI (0-10000 to 0-100)
  const hhiScore = Math.min((hhi / 10000) * 100, 100);

  // Weighted score
  const score =
    top10Score * 0.3 +
    giniScore * 0.25 +
    nakamotoScore * 0.2 +
    whaleScore * 0.15 +
    hhiScore * 0.1;

  return Math.round(score * 100) / 100;
}

/**
 * Determine risk level based on centralization score
 */
export function determineRiskLevel(
  score: number
): "low" | "medium" | "high" | "critical" {
  if (score >= 75) return "critical";
  if (score >= 50) return "high";
  if (score >= 25) return "medium";
  return "low";
}

/**
 * Calculate all centralization metrics
 */
export function calculateCentralizationMetrics(
  holders: Holder[],
  totalSupply: number,
  whaleCount: number
): CentralizationMetrics {
  const gini = calculateGiniCoefficient(holders);
  const hhi = calculateHHI(holders, totalSupply);
  const nakamoto = calculateNakamotoCoefficient(holders, totalSupply);
  const top10 = calculateTopNPercentage(holders, 10, totalSupply);
  const top50 = calculateTopNPercentage(holders, 50, totalSupply);
  const top100 = calculateTopNPercentage(holders, 100, totalSupply);

  const score = calculateCentralizationScore({
    gini,
    hhi,
    nakamoto,
    top10,
    whaleCount,
    totalHolders: holders.length,
  });

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
