from collections import defaultdict
from enum import Enum
from pydantic import BaseModel, ConfigDict

import yfinance as yf
from tqdm import tqdm

from constants import Region


class Ticker(Enum):
    DFUS = "DFUS"  # DFA U.S. index
    DFAI = "DFAI"  # DFA international (developed) index
    AVEM = "AVEM"  # Avantis emerging markets index
    AVUV = "AVUV"  # Avantis American small cap value
    AVDV = "AVDV"  # Avantis international small cap value
    AVES = "AVES"  # Avantis emerging markets value


class Equity(BaseModel):
    model_config = ConfigDict(frozen=True)

    ticker: Ticker
    fractional: bool = True
    share_price: float

    value_tilt: float
    size_tilt: float
    profitability_tilt: float
    region: Region


def calculate_core_satellite_split(
        equities_loadings: dict[str, float],
        target_loading: float
) -> tuple[dict[str, float], float]:
    """
    Calculate the split between core and satellite funds based on target value loading. Find the closest match if a
    perfect solution is not possible. Returns the split for each equity and actual value loading for the split.
    :param equities_loadings: The value loadings of the equities to split
    :param target_loading: The target value loading
    :return: Equities split and actual value loading
    """
    if len(equities_loadings) == 0 or len(equities_loadings) > 2:
        raise ValueError("There must be exactly one or two equities to split.")

    if len(equities_loadings) == 1:
        equity_name = list(equities_loadings.keys())[0]
        return {equity_name: 1.0}, equities_loadings[equity_name]

    equity1, equity2 = equities_loadings.keys()
    first_proportion = ((target_loading - equities_loadings[equity2]) /
                        (equities_loadings[equity1] - equities_loadings[equity2]))
    if first_proportion >= 1:
        return {equity1: 1.0, equity2: 0.0}, equities_loadings[equity1]
    if first_proportion <= 0:
        return {equity1: 0.0, equity2: 1.0}, equities_loadings[equity2]

    return (
        {equity1: first_proportion, equity2: 1 - first_proportion},
        equities_loadings[equity1] * first_proportion + equities_loadings[equity2] * (1 - first_proportion)
    )


# TODO: save retrieved data to cache
def load_equities():
    from constants import EQUITIES_CONFIG, TARGET_VALUE_LOADINGS

    loadings_by_region = defaultdict(dict)
    fund_proportion_in_region = dict()

    for ticker_str, data in EQUITIES_CONFIG.items():
        # TODO: need to rename all "value_tilt", etc. to "value_loading"
        loadings_by_region[Region(data["region"])][ticker_str] = data["value_tilt"]

    for region, fund_loadings in loadings_by_region.items():
        fund_proportion_in_region.update(calculate_core_satellite_split(
            equities_loadings=fund_loadings,
            target_loading=TARGET_VALUE_LOADINGS[region],
        )[0])

    equities = {}
    print("Loading equities...")
    for ticker_str, data in tqdm(EQUITIES_CONFIG.items(), ncols=80):
        if ticker_str not in Ticker.__members__:
            raise ValueError(f"Invalid ticker in config.yaml: {ticker_str}")

        ticker = Ticker[ticker_str]
        equities[ticker] = Equity(
            ticker=ticker,
            fractional=data.get("fractional", True),
            share_price=yf.Ticker(ticker_str).info["regularMarketPrice"],
            value_tilt=data["value_tilt"],
            size_tilt=data["size_tilt"],
            profitability_tilt=data["profitability_tilt"],
            region=Region[data["region"]],
        )
    return equities, fund_proportion_in_region

EQUITIES, TARGET_FUND_PROPORTION_IN_REGION = load_equities()
