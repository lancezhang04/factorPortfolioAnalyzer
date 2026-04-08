import { Header } from './Header';
import { TabNav } from './TabNav';
import { useConfigStore } from '../../store/configStore';
import { HoldingsTab } from '../holdings/HoldingsTab';
import { FactorsTab } from '../factors/FactorsTab';
import { TargetsTab } from '../targets/TargetsTab';
import { RebalanceTab } from '../rebalance/RebalanceTab';

export const Dashboard = () => {
  const { activeTab } = useConfigStore();

  const renderTab = () => {
    switch (activeTab) {
      case 'holdings':
        return <HoldingsTab />;
      case 'factors':
        return <FactorsTab />;
      case 'targets':
        return <TargetsTab />;
      case 'rebalance':
        return <RebalanceTab />;
      default:
        return <HoldingsTab />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <TabNav />
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {renderTab()}
      </main>
    </div>
  );
};
