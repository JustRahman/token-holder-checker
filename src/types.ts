// Type definitions for the Token Holder Monitor

export interface TokenInfo {
  name: string;
  symbol: string;
  address: string;
  chain: string;
  total_supply: number;
  circulating_supply: number;
  current_price_usd: number;
  market_cap_usd: number;
  total_holders: number;
}

export interface CentralizationMetrics {
  gini_coefficient: number;
  herfindahl_index: number;
  nakamoto_coefficient: number;
  top10_percentage: number;
  top50_percentage: number;
  top100_percentage: number;
  centralization_score: number;
  risk_level: "low" | "medium" | "high" | "critical";
}

export interface WhaleHolder {
  address: string;
  balance: number;
  balance_usd: number;
  percentage_of_supply: number;
  rank: number;
  label?: string;
  first_seen: number;
  last_activity: number;
  is_contract: boolean;
  tags: string[];
}

export interface WhaleActivity {
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
  exchange_detected?: string;
  price_impact_estimated?: number;
}

export interface DistributionAnalysis {
  retail_holders: {
    count: number;
    total_percentage: number;
  };
  small_holders: {
    count: number;
    total_percentage: number;
  };
  medium_holders: {
    count: number;
    total_percentage: number;
  };
  large_holders: {
    count: number;
    total_percentage: number;
  };
  whales: {
    count: number;
    total_percentage: number;
  };
}

export interface Alert {
  severity: "info" | "warning" | "critical";
  type: "large_transfer" | "accumulation" | "distribution" | "new_whale" | "centralization_risk";
  message: string;
  timestamp: number;
  related_address?: string;
  data?: any;
}

export interface HolderTrends {
  holder_count_change_24h: number;
  holder_count_change_7d: number;
  whale_accumulation_trend: "accumulating" | "distributing" | "stable";
  net_flow_24h_usd: number;
}

export interface Metadata {
  last_updated: number;
  block_height: number;
  data_sources: string[];
  cache_ttl: number;
}

export interface Holder {
  address: string;
  balance: number;
  first_seen?: number;
  last_activity?: number;
  is_contract?: boolean;
}

export interface AnalysisInput {
  token_address: string;
  chain: string;
  whale_threshold_usd?: number;
  whale_threshold_percent?: number;
  top_holders_count?: number;
  track_transfers?: boolean;
  alert_threshold_usd?: number;
  time_window?: "1h" | "24h" | "7d" | "30d";
}

export interface EnhancedRiskScore {
  overall_score: number;
  risk_level: "low" | "medium" | "high" | "critical";
  breakdown: any;
  warnings: string[];
  recommendations: string[];
}

export interface AnalysisOutput {
  token_info: TokenInfo;
  centralization_metrics: CentralizationMetrics;
  whale_holders: WhaleHolder[];
  recent_whale_activity: WhaleActivity[];
  distribution_analysis: DistributionAnalysis;
  alerts: Alert[];
  holder_trends: HolderTrends;
  enhanced_risk_score?: EnhancedRiskScore;
  metadata: Metadata;
}
