import { usePortfolio } from '../../hooks/usePortfolio';
import { useConfigStore } from '../../store/configStore';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export const Header = () => {
  const { useCache, setUseCache } = useConfigStore();
  const { data: portfolio, refetch, isRefetching } = usePortfolio(useCache);

  return (
    <div className="bg-slate-800 shadow-lg shadow-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl text-slate-100" style={{ fontFamily: "'Playfair Display', serif" }}>Factor Portfolio Analyzer</h1>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={useCache}
                onChange={(e) => setUseCache(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600 rounded"
              />
              Use Cached Data
            </label>
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isRefetching ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>
        {portfolio && (
          <div className="mt-2 flex gap-6 text-sm text-slate-300">
            <div>
              <span className="font-medium">Portfolio Value:</span>{' '}
              <span className="text-slate-100">{formatCurrency(portfolio.total_value)}</span>
            </div>
            <div>
              <span className="font-medium">Active Share:</span>{' '}
              <span className="text-slate-100">{formatPercent(portfolio.active_share)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
