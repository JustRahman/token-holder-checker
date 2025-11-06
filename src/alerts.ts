// Alert generation functions

import { Alert, CentralizationMetrics, WhaleActivity } from "./types.js";

/**
 * Format USD value for display
 */
function formatUSD(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  } else if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}

/**
 * Generate alerts based on centralization metrics and whale activity
 */
export function generateAlerts(
  metrics: CentralizationMetrics,
  recentActivity: WhaleActivity[],
  alertThreshold: number
): Alert[] {
  const alerts: Alert[] = [];
  const now = Date.now();

  // Centralization risk alerts
  if (metrics.top10_percentage > 70) {
    alerts.push({
      severity: "critical",
      type: "centralization_risk",
      message: `High centralization: Top 10 holders control ${metrics.top10_percentage.toFixed(
        1
      )}% of supply`,
      timestamp: now,
    });
  } else if (metrics.top10_percentage > 50) {
    alerts.push({
      severity: "warning",
      type: "centralization_risk",
      message: `Moderate centralization: Top 10 holders control ${metrics.top10_percentage.toFixed(
        1
      )}% of supply`,
      timestamp: now,
    });
  }

  if (metrics.nakamoto_coefficient < 3) {
    alerts.push({
      severity: "critical",
      type: "centralization_risk",
      message: `Extreme centralization: Only ${metrics.nakamoto_coefficient} holder(s) needed for 51% control`,
      timestamp: now,
    });
  } else if (metrics.nakamoto_coefficient < 5) {
    alerts.push({
      severity: "warning",
      type: "centralization_risk",
      message: `High centralization risk: ${metrics.nakamoto_coefficient} holders needed for 51% control`,
      timestamp: now,
    });
  }

  if (metrics.gini_coefficient > 0.8) {
    alerts.push({
      severity: "critical",
      type: "centralization_risk",
      message: `Very high inequality: Gini coefficient of ${metrics.gini_coefficient.toFixed(
        3
      )}`,
      timestamp: now,
    });
  } else if (metrics.gini_coefficient > 0.6) {
    alerts.push({
      severity: "warning",
      type: "centralization_risk",
      message: `High inequality: Gini coefficient of ${metrics.gini_coefficient.toFixed(
        3
      )}`,
      timestamp: now,
    });
  }

  // Large transfer alerts
  recentActivity
    .filter((tx) => tx.amount_usd >= alertThreshold)
    .forEach((tx) => {
      const severity = tx.amount_usd > alertThreshold * 5 ? "critical" : "warning";
      const typeLabel =
        tx.type === "buy" ? "Purchase" : tx.type === "sell" ? "Sale" : "Transfer";

      let message = `Large ${typeLabel}: ${formatUSD(
        tx.amount_usd
      )} (${tx.percentage_of_supply.toFixed(2)}% of supply)`;

      if (tx.exchange_detected) {
        message += ` ${tx.type === "sell" ? "to" : "from"} ${tx.exchange_detected}`;
      }

      alerts.push({
        severity,
        type: "large_transfer",
        message,
        timestamp: tx.timestamp,
        related_address: tx.from_address,
        data: tx,
      });
    });

  // Detect accumulation patterns (multiple large buys within 24h)
  const recentBuys = recentActivity.filter(
    (tx) => tx.type === "buy" && Date.now() - tx.timestamp < 24 * 60 * 60 * 1000
  );

  if (recentBuys.length >= 3) {
    const totalBought = recentBuys.reduce((sum, tx) => sum + tx.amount_usd, 0);
    alerts.push({
      severity: "info",
      type: "accumulation",
      message: `Accumulation detected: ${
        recentBuys.length
      } large purchases totaling ${formatUSD(totalBought)} in 24h`,
      timestamp: now,
    });
  }

  // Detect distribution patterns (multiple large sells within 24h)
  const recentSells = recentActivity.filter(
    (tx) => tx.type === "sell" && Date.now() - tx.timestamp < 24 * 60 * 60 * 1000
  );

  if (recentSells.length >= 3) {
    const totalSold = recentSells.reduce((sum, tx) => sum + tx.amount_usd, 0);
    alerts.push({
      severity: "warning",
      type: "distribution",
      message: `Distribution detected: ${
        recentSells.length
      } large sales totaling ${formatUSD(totalSold)} in 24h`,
      timestamp: now,
    });
  }

  // Sort alerts by severity and timestamp
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => {
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return b.timestamp - a.timestamp;
  });

  return alerts;
}
