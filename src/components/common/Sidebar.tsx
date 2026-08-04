import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { PageView } from '../../types';
import {
  LayoutDashboard,
  Briefcase,
  PieChart,
  ListOrdered,
  TrendingUp,
  DollarSign,
  Layers,
  BarChart3,
  Settings,
  Database,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  Trash2,
  TrendingDown,
  Sparkles,
  Command,
} from 'lucide-react';
import { CompanyLogo } from './CompanyLogo';

export const Sidebar: React.FC = () => {
  const {
    activePage,
    setActivePage,
    settings,
    isSyncingSheet,
    syncError,
    transactions,
    quotes,
    setSelectedStockModal,
    addCustomWatchlist,
    deleteCustomWatchlist,
    toggleTickerInWatchlist,
    setIsCommandPaletteOpen,
  } = usePortfolio();

  // Default is ICON-ONLY mode as requested
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [newWatchlistName, setNewWatchlistName] = useState<string>('');
  const [showAddWatchlist, setShowAddWatchlist] = useState<boolean>(false);
  const [addingTickerToWl, setAddingTickerToWl] = useState<string | null>(null);
  const [tickerInput, setTickerInput] = useState<string>('');

  const navItems: {
    id: PageView;
    index: string;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: string;
  }[] = [
    { id: 'dashboard', index: '01', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'portfolio', index: '02', label: 'PORTFOLIO', icon: Briefcase },
    { id: 'holdings', index: '03', label: 'HOLDINGS', icon: PieChart },
    { id: 'transactions', index: '04', label: 'TRANSACTIONS', icon: ListOrdered, badge: String(transactions.length) },
    { id: 'performance', index: '05', label: 'PERFORMANCE', icon: TrendingUp },
    { id: 'dividends', index: '06', label: 'DIVIDENDS', icon: DollarSign },
    { id: 'allocation', index: '07', label: 'ALLOCATION', icon: Layers },
    { id: 'analytics', index: '08', label: 'ANALYTICS', icon: BarChart3 },
    { id: 'settings', index: '09', label: 'SETTINGS', icon: Settings },
  ];

  const handleCreateWatchlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWatchlistName.trim()) {
      addCustomWatchlist(newWatchlistName.trim());
      setNewWatchlistName('');
      setShowAddWatchlist(false);
    }
  };

  const handleAddTicker = (wlId: string) => {
    if (tickerInput.trim()) {
      toggleTickerInWatchlist(wlId, tickerInput.trim());
      setTickerInput('');
      setAddingTickerToWl(null);
    }
  };

  return (
    <aside
      className={`bg-[#0a0d14] border-r border-[#1e2638] flex flex-col justify-between shrink-0 select-none font-sans transition-all duration-300 z-30 ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Toggle Words / Collapse Button Header */}
        <div className="p-3 border-b border-[#1e2638] flex items-center justify-between bg-[#0e121e]">
          {isExpanded && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs  font-bold tracking-wider text-slate-100 uppercase">
                TERMINAL
              </span>
            </div>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse Navigation to Icons' : 'Expand Navigation to show words'}
            className="w-full flex items-center justify-center gap-2 py-1.5 px-2 rounded bg-[#161c2c] hover:bg-[#20293d] text-slate-300 border border-[#263148] transition-colors text-xs "
          >
            {isExpanded ? (
              <>
                <ChevronLeft className="w-4 h-4 text-emerald-400 shrink-0" />
              </>
            ) : (
              <div className="flex items-center gap-1">
                <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
            )}
          </button>
        </div>

        {/* Command Palette Trigger */}
        <div className="p-2 border-b border-[#1e2638]">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            title="Open Command Palette (Ctrl+J)"
            className={`w-full flex items-center justify-center gap-2 py-2 px-2.5 rounded-lg bg-[#141926] hover:bg-[#1d2538] border border-[#263148] text-slate-300 transition-colors text-xs ${
              isExpanded ? 'justify-between' : 'justify-center'
            }`}
          >
            <div className="flex items-center gap-2">
              <Command className="w-3.5 h-3.5 text-emerald-400" />
              {isExpanded && <span className="text-[11px]">Command (Ctrl+J)</span>}
            </div>
            {isExpanded && (
              <kbd className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-400">⌘J</kbd>
            )}
          </button>
        </div>

        {/* Nav Items */}
        <div className="p-2 space-y-1 overflow-y-auto no-scrollbar flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                title={item.label}
                className={`w-full flex items-center rounded-lg py-2.5 px-3 text-xs  transition-all ${
                  isExpanded ? 'justify-between' : 'justify-center'
                } ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:bg-[#141926] hover:text-slate-200 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  {isExpanded && <span className="truncate tracking-wide">{item.label}</span>}
                </div>

                {isExpanded && item.badge && (
                  <span
                    className={`px-1.5 py-0.2 text-[9px] rounded  font-bold ${
                      isActive
                        ? 'bg-emerald-500 text-black'
                        : 'bg-[#182030] text-slate-400 border border-[#263148]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Custom Watchlists Section */}
          <div className="pt-4 mt-2 border-t border-[#1e2638] ">
            {isExpanded ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    WATCHLISTS
                  </span>
                  <button
                    onClick={() => setShowAddWatchlist(!showAddWatchlist)}
                    className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-[#182030] transition-colors"
                    title="Add Custom Watchlist"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add Watchlist Form */}
                {showAddWatchlist && (
                  <form onSubmit={handleCreateWatchlist} className="space-y-2 p-2 bg-[#141926] rounded border border-[#263148]">
                    <input
                      type="text"
                      value={newWatchlistName}
                      onChange={(e) => setNewWatchlistName(e.target.value)}
                      placeholder="Watchlist Name (e.g. AI Stocks)"
                      className="w-full bg-[#0e121e] border border-[#263148] rounded px-2 py-1 text-[11px] text-slate-100 placeholder-slate-500 focus:outline-none"
                    />
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowAddWatchlist(false)}
                        className="px-2 py-0.5 rounded text-[10px] text-slate-400 hover:text-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-2 py-0.5 rounded text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                      >
                        Create
                      </button>
                    </div>
                  </form>
                )}

                {/* Custom Watchlists List */}
                <div className="space-y-3">
                  {(settings.watchlists || []).map((wl) => (
                    <div key={wl.id} className="p-2 rounded-lg bg-[#111624] border border-[#1e2638] space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                        <span className="truncate">{wl.name}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setAddingTickerToWl(addingTickerToWl === wl.id ? null : wl.id)}
                            className="p-0.5 text-slate-400 hover:text-emerald-400"
                            title="Add stock symbol to watchlist"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => deleteCustomWatchlist(wl.id)}
                            className="p-0.5 text-slate-500 hover:text-rose-400"
                            title="Delete watchlist"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Add Ticker input */}
                      {addingTickerToWl === wl.id && (
                        <div className="flex items-center gap-1 pt-1">
                          <input
                            type="text"
                            value={tickerInput}
                            onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTicker(wl.id)}
                            placeholder="Ticker (e.g. AAPL)"
                            className="w-full bg-[#0d101a] border border-[#263148] rounded px-1.5 py-0.5 text-[10px] text-slate-100 uppercase"
                          />
                          <button
                            onClick={() => handleAddTicker(wl.id)}
                            className="px-2 py-0.5 rounded text-[10px] bg-emerald-600 text-white font-bold"
                          >
                            Add
                          </button>
                        </div>
                      )}

                      {/* Tickers with Live Price Tracking */}
                      {wl.tickers.length === 0 ? (
                        <div className="text-[10px] text-slate-500 italic">No tickers added yet</div>
                      ) : (
                        <div className="space-y-1">
                          {wl.tickers.map((ticker) => {
                            const q = quotes[ticker];
                            const price = q ? q.price : 100;
                            const changePct = q ? q.changePercent : 0;
                            const isUp = changePct >= 0;

                            return (
                              <div
                                key={ticker}
                                onClick={() => setSelectedStockModal(ticker)}
                                className="flex items-center justify-between p-1.5 rounded bg-[#161c2d] hover:bg-[#1e263d] cursor-pointer transition-colors text-[11px]"
                              >
                                <div className="flex items-center gap-1.5">
                                  <CompanyLogo ticker={ticker} size="sm" />
                                  <span className="font-bold text-slate-200">{ticker}</span>
                                </div>
                                <div className="text-right ">
                                  <div className="text-slate-100 font-bold">${price.toFixed(2)}</div>
                                  <div className={`text-[9px] ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {isUp ? '+' : ''}{changePct.toFixed(2)}%
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Icon-only Watchlist quick trigger */
              <div className="flex flex-col items-center gap-2 py-2">
                <button
                  onClick={() => setIsExpanded(true)}
                  title="Expand Watchlists"
                  className="p-2 rounded-lg bg-[#141926] hover:bg-[#1d2538] border border-[#263148] text-amber-400 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Live System Feed */}
        <div className="p-2 border-t border-[#1e2638] bg-[#0a0d14] ">
          {isExpanded ? (
            <div className="p-2 rounded bg-[#121622] border border-[#1e2638] space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1 text-slate-400 font-bold uppercase">
                  <Database className="w-3 h-3 text-emerald-400" />
                  LIVE FEED
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ACTIVE
                </span>
              </div>
              {settings.lastSyncedTimestamp && (
                <p className="text-[9px] text-slate-500">Synced: {settings.lastSyncedTimestamp}</p>
              )}
            </div>
          ) : (
            <div className="flex justify-center py-1" title="Live Market Feed Active">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
