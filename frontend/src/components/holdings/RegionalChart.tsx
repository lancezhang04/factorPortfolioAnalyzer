import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { RegionalDistribution } from '../../types/portfolio';
import { formatPercent } from '../../utils/formatters';

interface RegionalChartProps {
  distributions: RegionalDistribution[];
}

const COLORS: Record<string, string> = {
  US: '#3b82f6',
  Developed: '#10b981',
  Emerging: '#f59e0b',
};

export const RegionalChart = ({ distributions }: RegionalChartProps) => {
  const chartData = distributions.map((dist) => ({
    name: dist.region,
    current: dist.current * 100,
    target: dist.target * 100,
  }));

  return (
    <div>
      <h3 className="text-lg font-medium text-slate-100 mb-4">
        Regional Distribution
      </h3>
      <div className="flex items-center gap-8">
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="current"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `${value.toFixed(2)}%`}
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#e2e8f0' }}
                labelStyle={{ color: '#e2e8f0' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-64 space-y-3">
          <h4 className="text-sm font-medium text-slate-200 mb-3">Current vs Target</h4>
          {distributions.map((dist) => (
            <div key={dist.region} className="space-y-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: COLORS[dist.region] }}
                />
                <span className="text-slate-200 font-medium">{dist.region}</span>
              </div>
              <div className="text-sm text-slate-100 ml-5">
                <div>Current: <span className="font-semibold">{formatPercent(dist.current)}</span></div>
                <div className="text-slate-400">Target: {formatPercent(dist.target)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
