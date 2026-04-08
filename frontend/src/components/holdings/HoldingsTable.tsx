import { Position } from '../../types/portfolio';
import { formatCurrency, formatPercent, formatNumber } from '../../utils/formatters';

interface HoldingsTableProps {
  positions: Position[];
}

export const HoldingsTable = ({ positions }: HoldingsTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-700">
        <thead className="bg-slate-700">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
              Ticker
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
              Price
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
              Shares
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
              Value
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
              Current %
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
              Target %
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
              Drift
            </th>
          </tr>
        </thead>
        <tbody className="bg-slate-800 divide-y divide-slate-700">
          {positions.map((position) => (
            <tr key={position.ticker} className="hover:bg-slate-700">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-100">
                {position.ticker}{!position.equity.fractional && '*'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-100 text-right">
                {formatCurrency(position.equity.share_price)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-100 text-right">
                {formatNumber(position.shares)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-100 text-right">
                {formatCurrency(position.value)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-100 text-right">
                {formatPercent(position.current_proportion)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-100 text-right">
                {formatPercent(position.target_proportion)}
              </td>
              <td
                className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${
                  position.drift > 0
                    ? 'text-red-600'
                    : position.drift < 0
                    ? 'text-green-600'
                    : 'text-slate-100'
                }`}
              >
                {formatPercent(position.drift)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-slate-400">* No fractional shares</p>
    </div>
  );
};
