import json
from pathlib import Path
from typing import Dict
from collections import defaultdict

import requests as _requests

from ..core.models import Ticker, Equity, Region
from ..core.config import config_manager


# Cache directory in project root
CACHE_DIR = Path(__file__).parent.parent.parent.parent / ".cache"
STOCK_PRICES_CACHE = CACHE_DIR / "stock_prices.json"


def calculate_core_satellite_split(
    equities_loadings: Dict[str, float],
    target_loading: float
) -> tuple[Dict[str, float], float]:
    """
    Calculate the split between core and satellite funds based on target value loading.
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


def _fetch_price_yahoo_chart(ticker: str) -> float | None:
    """Fetch a single ticker's price via Yahoo Finance's chart API."""
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}"
    headers = {"User-Agent": "Mozilla/5.0"}
    params = {"range": "5d", "interval": "1d"}
    try:
        resp = _requests.get(url, headers=headers, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        meta = data["chart"]["result"][0]["meta"]
        return float(meta["regularMarketPrice"])
    except Exception:
        return None


def fetch_stock_prices(tickers: list[str]) -> Dict[str, float]:
    """Fetch stock prices via Yahoo Finance chart API (works on cloud servers)."""
    prices = {t: 0.0 for t in tickers}
    print(f"\n=== Fetching prices for {len(tickers)} tickers ===")

    for ticker_str in tickers:
        price = _fetch_price_yahoo_chart(ticker_str)
        if price is not None:
            prices[ticker_str] = price
            print(f"  {ticker_str}: ${price:.2f}")
        else:
            print(f"  {ticker_str}: Failed to fetch")

    return prices


def get_stock_prices(tickers: list[str], use_cache: bool = False) -> Dict[str, float]:
    """Get stock prices, optionally using cached data. Falls back to live fetch if cache missing."""
    if use_cache and STOCK_PRICES_CACHE.exists():
        with open(STOCK_PRICES_CACHE, 'r') as f:
            return json.load(f)
    elif use_cache:
        print("  Cache requested but no cache file exists — fetching live data")

    prices = fetch_stock_prices(tickers)

    # Only save to cache if we got valid prices (at least one non-zero)
    has_valid_prices = any(price > 0 for price in prices.values())
    if has_valid_prices:
        CACHE_DIR.mkdir(exist_ok=True)
        with open(STOCK_PRICES_CACHE, 'w') as f:
            json.dump(prices, f, indent=2)
        print(f"  Cached {len(prices)} prices")
    else:
        print(f"  WARNING: No valid prices fetched, not updating cache")
        # If cache exists, fall back to it
        if STOCK_PRICES_CACHE.exists():
            print(f"  Using existing cache instead")
            with open(STOCK_PRICES_CACHE, 'r') as f:
                prices = json.load(f)

    return prices


def get_equities(use_cache: bool = False) -> tuple[Dict[Ticker, Equity], Dict[str, float]]:
    """Load equities with optional caching."""
    equities_config = config_manager.get_equities_config()
    target_value_loadings = config_manager.get_target_value_loadings()

    loadings_by_region = defaultdict(dict)
    fund_proportion_in_region = dict()

    for ticker_str, data in equities_config.items():
        loadings_by_region[data.region][ticker_str] = data.value_loading

    for region, fund_loadings in loadings_by_region.items():
        fund_proportion_in_region.update(calculate_core_satellite_split(
            equities_loadings=fund_loadings,
            target_loading=target_value_loadings[region],
        )[0])

    tickers = list(equities_config.keys())
    stock_prices = get_stock_prices(tickers, use_cache=use_cache)

    equities = {}
    for ticker_str, data in equities_config.items():
        ticker = Ticker[ticker_str]
        equities[ticker] = Equity(
            ticker=ticker,
            fractional=data.fractional,
            share_price=stock_prices[ticker_str],
            market_loading=data.market_loading,
            size_loading=data.size_loading,
            value_loading=data.value_loading,
            profitability_loading=data.profitability_loading,
            investment_loading=data.investment_loading,
            region=data.region,
        )

    return equities, fund_proportion_in_region
