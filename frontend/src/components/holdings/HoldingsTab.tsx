import { usePortfolio, useRegionalDistribution } from '../../hooks/usePortfolio';
import { HoldingsTable } from './HoldingsTable';
import { PortfolioOverview } from './RegionalChart';

export const HoldingsTab = () => {
  const { data: portfolio, isLoading: portfolioLoading } = usePortfolio();
  const { data: regionalDistribution, isLoading: regionalLoading } =
    useRegionalDistribution();

  if (portfolioLoading || regionalLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!portfolio || !regionalDistribution) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">Failed to load portfolio data</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 shadow-lg shadow-slate-900/50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-slate-100 mb-4">
          Current Holdings
        </h2>
        <HoldingsTable positions={portfolio.positions} />
      </div>

      <div className="bg-slate-800/80 shadow-lg shadow-slate-900/50 rounded-lg p-6">
        <PortfolioOverview distributions={regionalDistribution} portfolio={portfolio} />
      </div>
    </div>
  );
};
