import { useFactorAnalysis } from '../../hooks/usePortfolio';
import { useConfigStore } from '../../store/configStore';
import { FactorLoadingsTable } from './FactorLoadingsTable';
import { ExpectedReturnsTable } from './ExpectedReturnsTable';
import { AssumptionsPanel } from './AssumptionsPanel';

export const FactorsTab = () => {
  const { useCache } = useConfigStore();
  const { data: factorAnalysis, isLoading } = useFactorAnalysis(useCache);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!factorAnalysis) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">Failed to load factor analysis</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2">
        <AssumptionsPanel />
      </div>

      <div className="lg:col-span-3 space-y-6">
        <div className="bg-slate-800 shadow-lg shadow-slate-900/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-slate-100 mb-4">
            Estimated Portfolio Factor Loadings
          </h2>
          <FactorLoadingsTable
            loadings={factorAnalysis.loadings}
            excessPremium={factorAnalysis.excess_premium}
          />
        </div>

        <div className="bg-slate-800 shadow-lg shadow-slate-900/50 rounded-lg p-6">
          <ExpectedReturnsTable expectedReturns={factorAnalysis.expected_returns} />
        </div>
      </div>
    </div>
  );
};
