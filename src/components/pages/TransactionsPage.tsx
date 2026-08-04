import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Transaction } from '../../types';
import { marketDataService } from '../../services/marketData';
import { CompanyLogo } from '../common/CompanyLogo';
import {
  Plus,
  Filter,
  Download,
  Trash2,
  Edit2,
  ListOrdered,
  Calendar,
  Receipt,
  Search,
} from 'lucide-react';

interface TransactionsPageProps {
  onOpenAddModal: () => void;
  onOpenEditModal: (tx: Transaction) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  onOpenAddModal,
  onOpenEditModal,
}) => {
  const {
    transactions,
    deleteTransaction,
    exportTransactionsCSV,
    searchQuery,
    setSearchQuery,
    settings,
  } = usePortfolio();

  const [typeFilter, setTypeFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');

  // Filter transactions
  const filteredTx = useMemo(() => {
    return transactions.filter((t) => {
      const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
      const matchesSearch =
        !searchQuery ||
        t.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.broker && t.broker.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesType && matchesSearch;
    });
  }, [transactions, typeFilter, searchQuery]);

  // Group by Month (e.g. "August 2026", "July 2026")
  const groupedByMonth = useMemo(() => {
    const map: Record<string, Transaction[]> = {};

    for (const tx of filteredTx) {
      const d = new Date(tx.date || new Date());
      const monthYear = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });

      if (!map[monthYear]) map[monthYear] = [];
      map[monthYear].push(tx);
    }

    // Sort months descending
    return Object.entries(map).sort((a, b) => {
      const dateA = new Date(a[1][0]?.date || 0).getTime();
      const dateB = new Date(b[1][0]?.date || 0).getTime();
      return dateB - dateA;
    });
  }, [filteredTx]);

  return (
    <div className="space-y-6 font-mono text-slate-100 pb-12">
      {/* Top Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#141824] border border-[#212738] rounded-xl">
        <div>
          <h2 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-blue-400" />
            TRANSACTION HISTORY LOG
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manual buy/sell records stored in Google Sheets database
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ticker, broker, notes..."
              className="bg-[#1a2030] border border-[#283144] rounded px-3 py-1.5 pl-9 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-[#1a2030] p-1 rounded border border-[#283144]">
            {(['ALL', 'BUY', 'SELL'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTypeFilter(tf)}
                className={`px-2.5 py-1 text-xs rounded font-bold transition-all ${
                  typeFilter === tf
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* CSV Export */}
          <button
            onClick={exportTransactionsCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a2030] hover:bg-[#222a3e] border border-[#283144] rounded text-xs text-slate-200 font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export CSV</span>
          </button>

          {/* New Record */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Timeline Grouped by Month */}
      {groupedByMonth.length === 0 ? (
        <div className="p-12 text-center bg-[#141824] border border-[#212738] rounded-xl text-slate-400 text-sm">
          No transactions match your search filter criteria.
        </div>
      ) : (
        groupedByMonth.map(([monthTitle, txList]) => (
          <div key={monthTitle} className="space-y-3">
            {/* Month Badge Header */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider px-1">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>{monthTitle}</span>
              <span className="text-[10px] text-slate-500 font-normal">
                ({txList.length} records)
              </span>
            </div>

            {/* Transaction Cards List */}
            <div className="space-y-2.5">
              {txList.map((tx) => {
                const meta = marketDataService.getMetadata(tx.ticker);
                const subtotal = tx.quantity * tx.price;
                const tradingFee = tx.tradingFee || 0;
                const fxFee = tx.fxFee || 0;
                const totalFees = tradingFee + fxFee;
                const totalAmount = tx.type === 'BUY' ? subtotal + totalFees : subtotal - totalFees;

                return (
                  <div
                    key={tx.id}
                    className="p-4 bg-[#141824] border border-[#212738] hover:border-slate-700 rounded-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                  >
                    {/* Left Info */}
                    <div className="flex items-center gap-3">
                      <CompanyLogo ticker={tx.ticker} name={meta.name} logoUrl={meta.logo} size="lg" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm flex items-center gap-1.5">
                            <span>{tx.type === 'BUY' ? '🟩' : '🟥'}</span>
                            <span>{meta.name}</span>
                          </span>
                          <span className="px-1.5 py-0.2 bg-slate-800 text-blue-400 rounded text-xs font-bold border border-slate-700">
                            {tx.ticker}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              tx.type === 'BUY'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </div>

                        {/* Quantity @ Price string */}
                        <p className="text-xs font-bold text-slate-200 mt-1">
                          {tx.type === 'BUY' ? 'Bought' : 'Sold'} {tx.quantity} shares @ {tx.currency}{' '}
                          {tx.price.toFixed(2)}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span>Date: {tx.date}</span>
                          {tx.notes && <span className="text-slate-300 italic">"{tx.notes}"</span>}
                        </div>
                      </div>
                    </div>

                    {/* Right Amount & Fees breakdown */}
                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-[#212738] pt-3 md:pt-0">
                      <div className="text-right text-xs">
                        <div className="text-slate-400 text-[10px]">Excl. Fees:</div>
                        <div className="font-semibold text-slate-300">
                          {tx.currency} {subtotal.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Fees (Trading: ${tradingFee} + FX: ${fxFee})
                        </div>
                        <div className="text-sm font-bold text-white mt-1">
                          Total: {tx.currency} {totalAmount.toFixed(2)}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onOpenEditModal(tx)}
                          title="Edit Transaction"
                          className="p-2 rounded bg-[#1b2233] hover:bg-[#232c42] text-slate-300 hover:text-white transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          title="Delete Record"
                          className="p-2 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
