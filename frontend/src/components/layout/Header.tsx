import { usePortfolio } from '../../hooks/usePortfolio';
import { useConfigStore } from '../../store/configStore';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export const Header = () => {
  const { useCache, setUseCache } = useConfigStore();
  const { data: portfolio, refetch, isRefetching } = usePortfolio(useCache);

  return (
    <div className="bg-slate-800 shadow-lg shadow-slate-900/50">
      <div className="px-6 py-4 sm:px-10 lg:px-16">
        <h1 className="text-slate-100 flex items-end gap-2">
          <img src="/lances-logo.svg" alt="Lance's" className="inline-block" style={{ height: '3.2rem' }} />
          <span className="text-3xl">Factor Portfolio Analyzer</span>
        </h1>
        <div className="mt-2 flex justify-between items-center">
          <div className="flex gap-6 text-sm text-slate-300">
            {portfolio && (
              <>
                <div>
                  <span className="font-medium">Portfolio Value:</span>{' '}
                  <span className="text-slate-100">{formatCurrency(portfolio.total_value)}</span>
                </div>
                <div>
                  <span className="font-medium">Active Share:</span>{' '}
                  <span className="text-slate-100">{formatPercent(portfolio.active_share)}</span>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={useCache}
                onChange={(e) => setUseCache(e.target.checked)}
                className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-slate-600 rounded"
              />
              Use Cached Data
            </label>
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="px-2 py-0.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isRefetching ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
