import { useConfigStore } from '../../store/configStore';

const tabs = [
  { id: 'holdings', label: 'Holdings & Regional' },
  { id: 'factors', label: 'Factors & Returns' },
  { id: 'targets', label: 'Portfolio Targets' },
  { id: 'rebalance', label: 'Rebalance Calculator' },
];

export const TabNav = () => {
  const { activeTab, setActiveTab } = useConfigStore();

  return (
    <div className="border-b border-slate-700">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm
              ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};
