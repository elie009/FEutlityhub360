import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { QuickStats } from './QuickStats';
import { BalanceSection } from './BalanceSection';
import { FinancialGoals } from './FinancialGoals';
import { SpendingsChart } from './SpendingsChart';
import { CardsSection } from './CardsSection';
import { RecentTransactions } from './RecentTransactions';
import { TransactionLimit } from './TransactionLimit';
import { RecentActivity } from './RecentActivity';
import { LoanSchedules } from './LoanSchedules';

export function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <div className="flex-1 overflow-auto">
          <div className="flex gap-6 p-6">
            {/* Main Content */}
            <div className="flex-1 space-y-6">
              <QuickStats />
              <BalanceSection />
              
              <div className="grid lg:grid-cols-2 gap-6">
                <FinancialGoals />
                <SpendingsChart />
              </div>
              
              {/* New Section: Two Columns */}
              <div className="grid lg:grid-cols-2 gap-6">
                <RecentActivity />
                <LoanSchedules />
              </div>
            </div>
            
            {/* Right Sidebar */}
            <div className="w-80 space-y-6">
              <CardsSection />
              <RecentTransactions />
              <TransactionLimit />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}