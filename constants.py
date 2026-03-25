from enum import Enum

import yaml

from market_split import get_global_market_split


def load_config():
    with open("config.yaml", "r") as f:
        return yaml.safe_load(f)


def calculate_core_satellite_split(equities_tilts: list[float], target_tilt: float) -> tuple[list[float], float]:
    """
    Calculate split between core and satellite funds based on target value tilt. Find the closest match if a perfect
    solution is not possible. Returns the split for each equity and actual value tilt for the split.
    :param equities_tilts: The value tilts of the equities to split
    :param target_tilt: The target value tilt
    :return: Equities split and actual value tilt
    """
    if len(equities_tilts) == 0 or len(equities_tilts) > 2:
        raise ValueError("There must be exactly one or two equities to split.")

    if len(equities_tilts) == 1:
        return [1.0], equities_tilts[0]

    first_proportion = (target_tilt - equities_tilts[1]) / (equities_tilts[0] - equities_tilts[1])
    if first_proportion >= 1:
        return [1.0, 0.0], equities_tilts[0]
    if first_proportion <= 0:
        return [0.0, 1.0], equities_tilts[1]

    return (
        [first_proportion, 1 - first_proportion],
        equities_tilts[0] * first_proportion + equities_tilts[1] * (1 - first_proportion)
    )


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

TARGET_VALUE_TILTS = {
    Region[k]: v for k, v in config_data["target_value_tilts"].items()
}

# TODO: This should be systematically calculated based on the above
# Probably rename this to "target_regional_proportion" or something
TARGET_VALUE_FUND_SPLIT = {
    Region[k]: v for k, v in config_data["target_value_split"].items()
}

PORTFOLIO_DATA = config_data["current_portfolio"]
