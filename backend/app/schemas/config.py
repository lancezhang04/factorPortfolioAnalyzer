from typing import Dict, List, Optional, Any
from pydantic import BaseModel

from ..core.models import Region, EquityConfig, FactorPremiums


class ConfigResponse(BaseModel):
    factor_premiums: FactorPremiums
    equities: Dict[str, EquityConfig]
    target_value_loadings: Dict[Region, float]


class UpdateFactorPremiumsRequest(BaseModel):
    factor_premiums: FactorPremiums


class UpdateEquityConfigRequest(BaseModel):
    equity_config: EquityConfig


class UpdateTargetValueLoadingsRequest(BaseModel):
    target_value_loadings: Dict[Region, float]


class UpdateRegionalSplitRequest(BaseModel):
    regional_split: Dict[Region, float]


class TargetProportionsResponse(BaseModel):
    """Response showing how target proportions are calculated."""
    regional_split: Dict[Region, float]
    market_regional_split: Dict[Region, float]
    has_custom_split: bool
    fund_proportions_in_region: Dict[str, float]
    final_target_proportions: Dict[str, float]


class PortfolioHoldingItem(BaseModel):
    ticker: str
    shares: float


class UpdatePortfolioRequest(BaseModel):
    holdings: List[PortfolioHoldingItem]
    vol: Optional[float] = None


class PortfolioTemplateResponse(BaseModel):
    templates: Dict[str, Any]
    active_template: Optional[str]
    has_override: bool
    vol: float
