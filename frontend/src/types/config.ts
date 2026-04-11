import { Region } from './portfolio';

export interface FactorPremiums {
  rm_rf: number;
  hml: number;
  smb: number;
  rmw: number;
  cma: number;
  rf: number;
  inflation: number;
  vol: number;
}

export interface EquityConfig {
  market_loading: number;
  size_loading: number;
  value_loading: number;
  profitability_loading: number;
  investment_loading: number;
  region: Region;
  fractional: boolean;
}

export interface Config {
  factor_premiums: FactorPremiums;
  equities: Record<string, EquityConfig>;
  target_value_loadings: Record<Region, number>;
}

export interface TargetProportions {
  regional_split: Record<Region, number>;
  market_regional_split: Record<Region, number>;
  has_custom_split: boolean;
  fund_proportions_in_region: Record<string, number>;
  final_target_proportions: Record<string, number>;
}
