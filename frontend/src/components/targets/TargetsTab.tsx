import { useState } from 'react';
import {
  useConfig,
  useTargetProportions,
  useUpdateEquityConfig,
  useUpdateTargetValueLoadings,
} from '../../hooks/useConfig';
import { useConfigStore } from '../../store/configStore';
import { EquityConfig } from '../../types/config';
import { Region } from '../../types/portfolio';
import { formatPercent } from '../../utils/formatters';

export const TargetsTab = () => {
  const { useCache } = useConfigStore();
  const { data: config } = useConfig();
  const { data: targetProportions } = useTargetProportions(useCache);
  const updateEquityMutation = useUpdateEquityConfig();
  const updateLoadingsMutation = useUpdateTargetValueLoadings();

  const [editedEquities, setEditedEquities] = useState<Record<string, EquityConfig>>({});
  const [editedLoadings, setEditedLoadings] = useState<Record<Region, number>>({});

  if (!config || !targetProportions) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  const handleEquityChange = (
    ticker: string,
    field: keyof EquityConfig,
    value: string | boolean
  ) => {
    const currentConfig = editedEquities[ticker] || config.equities[ticker];
    setEditedEquities({
      ...editedEquities,
      [ticker]: {
        ...currentConfig,
        [field]: typeof value === 'string' ? parseFloat(value) : value,
      },
    });
  };

  const handleLoadingChange = (region: Region, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setEditedLoadings({
        ...editedLoadings,
        [region]: numValue,
      });
    }
  };

  const handleSaveEquity = (ticker: string) => {
    if (editedEquities[ticker]) {
      updateEquityMutation.mutate({ ticker, config: editedEquities[ticker] });
      const newEdited = { ...editedEquities };
      delete newEdited[ticker];
      setEditedEquities(newEdited);
    }
  };

  const handleSaveLoadings = () => {
    const loadingsToSave = {
      ...config.target_value_loadings,
      ...editedLoadings,
    };
    updateLoadingsMutation.mutate(loadingsToSave);
    setEditedLoadings({});
  };

  const hasLoadingChanges = Object.keys(editedLoadings).length > 0;

  const REGION_COLORS: Record<string, string> = {
    US: '#3b82f6',
    Developed: '#10b981',
    Emerging: '#f59e0b',
  };

  const REGION_ORDER: string[] = ['US', 'Developed', 'Emerging'];

  // Group tickers by region
  const tickersByRegion: Record<string, [string, number][]> = {};
  for (const region of REGION_ORDER) {
    tickersByRegion[region] = [];
  }
  for (const [ticker, proportion] of Object.entries(targetProportions.final_target_proportions)) {
    const region = config.equities[ticker]?.region ?? '';
    if (tickersByRegion[region]) {
      tickersByRegion[region].push([ticker, proportion]);
    }
  }

  return (
    <div className="space-y-6">
      {/* Final Target Proportions - MOVED TO TOP */}
      <div className="bg-slate-800 shadow-lg shadow-slate-900/50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-slate-100 mb-4">
          Calculated Target Proportions
        </h2>
        <p className="text-sm text-slate-300 mb-4">
          These proportions are automatically calculated based on regional split × fund proportion within region
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {REGION_ORDER.map((region) => {
            const color = REGION_COLORS[region] ?? '#334155';
            return (
              <div key={region} className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs font-medium" style={{ color }}>{region}</span>
                </div>
                {tickersByRegion[region].map(([ticker, proportion]) => (
                  <div
                    key={ticker}
                    className="rounded-lg p-3"
                    style={{ border: `2px solid ${color}` }}
                  >
                    <div className="text-sm font-medium text-slate-200">{ticker}</div>
                    <div className="text-xl font-bold text-slate-100 mt-1">
                      {formatPercent(proportion)}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Value Loadings Section */}
      <div className="bg-slate-800 shadow-lg shadow-slate-900/50 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-100">
            Target Value Loadings by Region
          </h2>
          {hasLoadingChanges && (
            <button
              onClick={handleSaveLoadings}
              disabled={updateLoadingsMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {updateLoadingsMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(config.target_value_loadings).map(([region, loading]) => {
            const currentValue = editedLoadings[region as Region] ?? loading;
            return (
              <div key={region} className="border border-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-slate-200">
                    {region}
                  </label>
                  <span className="text-lg font-bold text-blue-400">
                    {currentValue.toFixed(3)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.025"
                  value={currentValue}
                  onChange={(e) => handleLoadingChange(region as Region, e.target.value)}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                  <span>0.0</span>
                  <span>0.5</span>
                  <span>1.0</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Regional Split Display */}
      <div className="bg-slate-800 shadow-lg shadow-slate-900/50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-slate-100 mb-4">
          Current Regional Split (from Market Data)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(targetProportions.regional_split).map(([region, proportion]) => (
            <div key={region} className="border border-slate-700 rounded-lg p-4">
              <div className="text-sm font-medium text-slate-200">{region}</div>
              <div className="text-2xl font-bold text-slate-100 mt-1">
                {formatPercent(proportion)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Equity Configurations */}
      <div className="bg-slate-800 shadow-lg shadow-slate-900/50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-slate-100 mb-4">
          Equity Factor Loadings
        </h2>
        <div className="space-y-6">
          {Object.entries(config.equities).map(([ticker, equityConfig]) => {
            const currentConfig = editedEquities[ticker] || equityConfig;
            const hasChanges = !!editedEquities[ticker];

            return (
              <div key={ticker} className="border border-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-slate-100" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{ticker}</h3>
                  {hasChanges && (
                    <button
                      onClick={() => handleSaveEquity(ticker)}
                      disabled={updateEquityMutation.isPending}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      Save
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-200 mb-1">
                      Market
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentConfig.market_loading}
                      onChange={(e) =>
                        handleEquityChange(ticker, 'market_loading', e.target.value)
                      }
                      className="w-full px-2 py-1 text-sm bg-slate-700 text-slate-100 border border-slate-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-200 mb-1">
                      Size
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentConfig.size_loading}
                      onChange={(e) =>
                        handleEquityChange(ticker, 'size_loading', e.target.value)
                      }
                      className="w-full px-2 py-1 text-sm bg-slate-700 text-slate-100 border border-slate-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-200 mb-1">
                      Value
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentConfig.value_loading}
                      onChange={(e) =>
                        handleEquityChange(ticker, 'value_loading', e.target.value)
                      }
                      className="w-full px-2 py-1 text-sm bg-slate-700 text-slate-100 border border-slate-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-200 mb-1">
                      Profitability
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentConfig.profitability_loading}
                      onChange={(e) =>
                        handleEquityChange(ticker, 'profitability_loading', e.target.value)
                      }
                      className="w-full px-2 py-1 text-sm bg-slate-700 text-slate-100 border border-slate-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-200 mb-1">
                      Investment
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentConfig.investment_loading}
                      onChange={(e) =>
                        handleEquityChange(ticker, 'investment_loading', e.target.value)
                      }
                      className="w-full px-2 py-1 text-sm bg-slate-700 text-slate-100 border border-slate-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-200 mb-1">
                      Fractional
                    </label>
                    <input
                      type="checkbox"
                      checked={currentConfig.fractional}
                      onChange={(e) =>
                        handleEquityChange(ticker, 'fractional', e.target.checked)
                      }
                      className="mt-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600 rounded"
                    />
                  </div>
                </div>

                <div className="mt-2 text-xs text-slate-400">
                  Region: {currentConfig.region} | Final Target: {formatPercent(targetProportions.final_target_proportions[ticker] || 0)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
