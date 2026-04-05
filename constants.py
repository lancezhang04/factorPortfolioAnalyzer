from enum import Enum

import yaml

from market_split import get_global_market_split


def load_config():
    with open("config.yaml", "r") as f:
        return yaml.safe_load(f)


config_data = load_config()

EQUITIES_CONFIG = config_data["equities"]


class Region(Enum):
    US = "US"
    Developed = "Developed"
    Emerging = "Emerging"


print("Retrieving global market split...")
TARGET_REGIONAL_SPLIT = {
    Region[k]: v for k, v in get_global_market_split().items()
}

TARGET_VALUE_LOADINGS = {
    Region[k]: v for k, v in config_data["target_value_loadings"].items()
}

PORTFOLIO_DATA = config_data["current_portfolio"]
