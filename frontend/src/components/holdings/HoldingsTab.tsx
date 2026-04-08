import { usePortfolio, useRegionalDistribution } from '../../hooks/usePortfolio';
import { useConfigStore } from '../../store/configStore';
import { HoldingsTable } from './HoldingsTable';
import { RegionalChart } from './RegionalChart';

export const HoldingsTab = () => {
  const { useCache } = useConfigStore();
  const { data: portfolio, isLoading: portfolioLoading } = usePortfolio(useCache);
  const { data: regionalDistribution, isLoading: regionalLoading } =
    useRegionalDistribution(useCache);

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
      <div className="bg-slate-800 shadow-lg shadow-slate-900/50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-slate-100 mb-4">
          Current Holdings
        </h2>
        <HoldingsTable positions={portfolio.positions} />
      </div>

      <div className="bg-slate-800 shadow-lg shadow-slate-900/50 rounded-lg p-6">
        <RegionalChart distributions={regionalDistribution} />
      </div>
    </div>
  );
};
