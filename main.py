from portfolio import Position, Portfolio
from equity import Ticker, EQUITIES
from constants import PORTFOLIO_DATA, TARGET_REGIONAL_SPLIT

current_portfolio = Portfolio([
    Position(
        value=item['shares'] * EQUITIES[Ticker[item['ticker']]].share_price,
        equity=EQUITIES[Ticker[item['ticker']]]
    )
    for item in PORTFOLIO_DATA
])


if __name__ == "__main__":
    print()
    print(f"Current value loading: {current_portfolio.value_loading:.2%} ({current_portfolio.target_value_loading:.2%} target)")
    print(f"Current size loading: {current_portfolio.size_loading:.2%} ({current_portfolio.target_size_loading:.2%} target)")
    print(f"Current profitability loading: {current_portfolio.profitability_loading:.2%} "
          f"({current_portfolio.target_profitability_loading:.2%} target)")

    print()
    regional_dist = current_portfolio.regional_distribution()
    print("Regional distribution:")
    for region, proportion in regional_dist.items():
        print(f"\t{region} - {proportion:.2%} ({TARGET_REGIONAL_SPLIT[region]:.2%} target)")

    print()
    print(f"Active share: {current_portfolio.active_share:.2%}")
    current_portfolio.display()

    while True:
        infusion_value = float(input("\n\nEnter infusion value: "))
        current_portfolio.balance_with_infusion(infusion_value)
