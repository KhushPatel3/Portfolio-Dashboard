import React, { useState } from 'react';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { TickerTape } from './components/common/TickerTape';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { TransactionModal } from './components/common/TransactionModal';
import { StockDetailModal } from './components/common/StockDetailModal';
import { CommandPaletteModal } from './components/common/CommandPaletteModal';

import { DashboardPage } from './components/pages/DashboardPage';
import { PortfolioPage } from './components/pages/PortfolioPage';
import { HoldingsPage } from './components/pages/HoldingsPage';
import { TransactionsPage } from './components/pages/TransactionsPage';
import { PerformancePage } from './components/pages/PerformancePage';
import { DividendsPage } from './components/pages/DividendsPage';
import { AllocationPage } from './components/pages/AllocationPage';
import { AnalyticsPage } from './components/pages/AnalyticsPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { Transaction } from './types';

const MainAppContent: React.FC = () => {
  const { activePage, selectedStockModal, setSelectedStockModal } = usePortfolio();

  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState<boolean>(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const handleOpenEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setIsAddTxModalOpen(true);
  };

  const handleCloseTxModal = () => {
    setIsAddTxModalOpen(false);
    setEditingTx(null);
  };

  return (
    <div className="h-screen overflow-hidden bg-[#0a0a0a] text-[#e5e5e5] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Ticker Tape */}
      <TickerTape />

      {/* Main Terminal Header */}
      <Header onOpenAddTransaction={() => setIsAddTxModalOpen(true)} />

      {/* Body Layout: Sidebar + Main Scrollable Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Page Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#0a0a0a]">
          <div className="w-full max-w-[1600px] mx-auto">
            {activePage === 'dashboard' && <DashboardPage />}
            {activePage === 'portfolio' && <PortfolioPage />}
            {activePage === 'holdings' && <HoldingsPage />}
            {activePage === 'transactions' && (
              <TransactionsPage
                onOpenAddModal={() => setIsAddTxModalOpen(true)}
                onOpenEditModal={handleOpenEditTx}
              />
            )}
            {activePage === 'performance' && <PerformancePage />}
            {activePage === 'dividends' && <DividendsPage />}
            {activePage === 'allocation' && <AllocationPage />}
            {activePage === 'analytics' && <AnalyticsPage />}
            {activePage === 'settings' && <SettingsPage />}
          </div>
        </main>
      </div>

      {/* Global Transaction Modal */}
      <TransactionModal
        isOpen={isAddTxModalOpen}
        onClose={handleCloseTxModal}
        editTx={editingTx}
      />

      {/* Global Stock Detail Modal */}
      <StockDetailModal
        ticker={selectedStockModal}
        onClose={() => setSelectedStockModal(null)}
      />

      {/* Command Palette Modal */}
      <CommandPaletteModal />
    </div>
  );
};

export default function App() {
  return (
    <PortfolioProvider>
      <MainAppContent />
    </PortfolioProvider>
  );
}
