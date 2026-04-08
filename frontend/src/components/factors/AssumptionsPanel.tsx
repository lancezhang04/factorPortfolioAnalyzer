import { useState } from 'react';
import { useConfig, useUpdateFactorPremiums } from '../../hooks/useConfig';
import { FactorPremiums } from '../../types/config';

export const AssumptionsPanel = () => {
  const { data: config } = useConfig();
  const updateMutation = useUpdateFactorPremiums();
  const [editedPremiums, setEditedPremiums] = useState<FactorPremiums | null>(null);

  if (!config) return null;

  const currentPremiums = editedPremiums || config.factor_premiums;

  const handleChange = (key: keyof FactorPremiums, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setEditedPremiums({
        ...(editedPremiums || config.factor_premiums),
        [key]: numValue,
      });
    }
  };

  const handleSave = () => {
    if (editedPremiums) {
      updateMutation.mutate(editedPremiums);
      setEditedPremiums(null);
    }
  };

  const handleReset = () => {
    setEditedPremiums(null);
  };

  const hasChanges = editedPremiums !== null;

  const premiumFields: Array<{ key: keyof FactorPremiums; label: string; description: string }> = [
    { key: 'rm_rf', label: 'Rm-Rf (Market Premium)', description: 'Expected market risk premium' },
    { key: 'hml', label: 'HML (Value Premium)', description: 'High minus low book-to-market premium' },
    { key: 'smb', label: 'SMB (Size Premium)', description: 'Small minus big market cap premium' },
    { key: 'rmw', label: 'RMW (Profitability Premium)', description: 'Robust minus weak profitability premium' },
    { key: 'cma', label: 'CMA (Investment Premium)', description: 'Conservative minus aggressive investment premium' },
    { key: 'rf', label: 'Rf (Risk-Free Rate)', description: 'Expected long-run risk-free real return' },
    { key: 'inflation', label: 'Inflation', description: 'Expected long-run inflation rate' },
    { key: 'vol', label: 'Volatility', description: 'Expected portfolio volatility (standard deviation)' },
  ];

  return (
    <div className="bg-slate-800 shadow-lg shadow-slate-900/50 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-100">Factor Assumptions</h2>
        {hasChanges && (
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1 text-sm bg-slate-700 text-slate-200 rounded hover:bg-slate-600"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {premiumFields.map(({ key, label, description }) => (
          <div key={key} className="border-b border-slate-700 pb-3">
            <label className="block text-sm font-medium text-slate-200 mb-1">
              {label}
            </label>
            <p className="text-xs text-slate-400 mb-2">{description}</p>
            <input
              type="number"
              step="0.001"
              value={currentPremiums[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-100 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
