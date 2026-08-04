import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePortfolio } from '../../context/PortfolioContext';
import { PageView } from '../../types';
import {
  Search,
  Command,
  LayoutDashboard,
  Briefcase,
  PieChart,
  History,
  TrendingUp,
  DollarSign,
  BarChart3,
  SlidersHorizontal,
  Settings,
  Plus,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Bell,
  Scale,
  Building2,
  X,
} from 'lucide-react';
import { CompanyLogo } from './CompanyLogo';

interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Actions' | 'Stocks';
  icon: React.ReactNode;
  subtitle?: string;
  ticker?: string;
  action: () => void;
}

export const CommandPaletteModal: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setActivePage,
    setIsTransactionModalOpen,
    setSelectedStockModal,
    refreshPricesNow,
    settings,
    updateSettings,
    quotes,
  } = usePortfolio();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener for Ctrl+J or Cmd+J
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const navigateTo = (page: PageView) => {
    setActivePage(page);
    setIsCommandPaletteOpen(false);
  };

  const navCommands: CommandItem[] = [
    {
      id: 'nav-dashboard',
      title: 'Dashboard Overview',
      category: 'Navigation',
      icon: <LayoutDashboard className="w-4 h-4 text-emerald-400" />,
      subtitle: 'Main terminal, quick metrics & market performance',
      action: () => navigateTo('dashboard'),
    },
    {
      id: 'nav-portfolio',
      title: 'Portfolio & Price Alerts',
      category: 'Navigation',
      icon: <Briefcase className="w-4 h-4 text-cyan-400" />,
      subtitle: 'Holdings summary, price alerts & risk indicators',
      action: () => navigateTo('portfolio'),
    },
    {
      id: 'nav-holdings',
      title: 'Holdings Breakdown',
      category: 'Navigation',
      icon: <PieChart className="w-4 h-4 text-indigo-400" />,
      subtitle: 'Individual stock positions, cost basis & P&L',
      action: () => navigateTo('holdings'),
    },
    {
      id: 'nav-transactions',
      title: 'Transactions Log',
      category: 'Navigation',
      icon: <History className="w-4 h-4 text-amber-400" />,
      subtitle: 'Google Sheets sync, trade history & notes',
      action: () => navigateTo('transactions'),
    },
    {
      id: 'nav-analytics',
      title: 'Analytics & Rebalancing',
      category: 'Navigation',
      icon: <SlidersHorizontal className="w-4 h-4 text-rose-400" />,
      subtitle: 'Target portfolio rebalancing calculator & exposure',
      action: () => navigateTo('analytics'),
    },
    {
      id: 'nav-performance',
      title: 'Performance & Benchmarks',
      category: 'Navigation',
      icon: <TrendingUp className="w-4 h-4 text-purple-400" />,
      subtitle: 'Time-weighted returns, CAGR & market benchmarks',
      action: () => navigateTo('performance'),
    },
    {
      id: 'nav-dividends',
      title: 'Dividends Calendar',
      category: 'Navigation',
      icon: <DollarSign className="w-4 h-4 text-emerald-300" />,
      subtitle: 'Upcoming cash flows, ex-dates & yield income',
      action: () => navigateTo('dividends'),
    },
    {
      id: 'nav-allocation',
      title: 'Asset Allocation',
      category: 'Navigation',
      icon: <BarChart3 className="w-4 h-4 text-teal-400" />,
      subtitle: 'Sector, regional & currency tree map',
      action: () => navigateTo('allocation'),
    },
    {
      id: 'nav-settings',
      title: 'Settings & Master Sheet',
      category: 'Navigation',
      icon: <Settings className="w-4 h-4 text-slate-400" />,
      subtitle: 'Terminal config, Google Sheets lock & currency',
      action: () => navigateTo('settings'),
    },
  ];

  const actionCommands: CommandItem[] = [
    {
      id: 'act-new-tx',
      title: 'Record New Transaction',
      category: 'Actions',
      icon: <Plus className="w-4 h-4 text-emerald-400" />,
      subtitle: 'Add buy or sell trade to portfolio',
      action: () => {
        setIsCommandPaletteOpen(false);
        setIsTransactionModalOpen(true);
      },
    },
    {
      id: 'act-rebalance',
      title: 'Open Portfolio Rebalancing Calculator',
      category: 'Actions',
      icon: <Scale className="w-4 h-4 text-amber-400" />,
      subtitle: 'Calculate trades needed for target asset weights',
      action: () => navigateTo('analytics'),
    },
    {
      id: 'act-refresh',
      title: 'Refresh Live Market Prices Now',
      category: 'Actions',
      icon: <RefreshCw className="w-4 h-4 text-cyan-400" />,
      subtitle: 'Trigger instant price update across all tickers',
      action: () => {
        refreshPricesNow();
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'act-toggle-curr',
      title: `Switch Currency (Current: ${settings.baseCurrency})`,
      category: 'Actions',
      icon: <DollarSign className="w-4 h-4 text-amber-300" />,
      subtitle: 'Cycle between NZD, AUD, and USD',
      action: () => {
        const nextCurr =
          settings.baseCurrency === 'NZD'
            ? 'AUD'
            : settings.baseCurrency === 'AUD'
            ? 'USD'
            : 'NZD';
        const nextSymbol = nextCurr === 'NZD' ? 'NZ$' : nextCurr === 'AUD' ? 'A$' : '$';
        updateSettings({ baseCurrency: nextCurr, currencySymbol: nextSymbol });
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'act-google-sheet',
      title: 'Open Master Google Sheet (Transactions)',
      category: 'Actions',
      icon: <ExternalLink className="w-4 h-4 text-emerald-400" />,
      subtitle: 'View locked live transactions spreadsheet',
      action: () => {
        window.open(settings.googleSheetsUrl, '_blank');
        setIsCommandPaletteOpen(false);
      },
    },
  ];

  // Stock Ticker quick search items
  const stockCommands: CommandItem[] = Object.keys(quotes).map((ticker) => {
    const q = quotes[ticker];
    return {
      id: `stock-${ticker}`,
      title: `${ticker} Stock Analysis`,
      category: 'Stocks',
      ticker,
      icon: <CompanyLogo ticker={ticker} size="sm" />,
      subtitle: `$${q.price.toFixed(2)} (${q.change >= 0 ? '+' : ''}${q.changePercent.toFixed(2)}%)`,
      action: () => {
        setIsCommandPaletteOpen(false);
        setSelectedStockModal(ticker);
      },
    };
  });

  const allItems = [...navCommands, ...actionCommands, ...stockCommands];

  const filteredItems = allItems.filter((item) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      (item.ticker && item.ticker.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDownList = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsCommandPaletteOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 px-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="bg-[#121622] border border-[#262f42] rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden  text-slate-100 flex flex-col max-h-[80vh]"
      >
        {/* Search Header */}
        <div className="px-4 py-3.5 bg-[#171c2b] border-b border-[#262f42] flex items-center gap-3">
          <Search className="w-5 h-5 text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownList}
            placeholder="Type a command, page, or ticker (e.g. 'rebalance', 'NVDA', 'transactions')..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none "
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-[#262f42] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-2 overflow-y-auto space-y-1 divide-y divide-[#1e2638] no-scrollbar flex-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No matching commands or tickers found for &quot;{query}&quot;
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                      : 'text-slate-300 hover:bg-[#1a2030] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0">{item.icon}</div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold flex items-center gap-2">
                        <span>{item.title}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                          {item.category}
                        </span>
                      </div>
                      {item.subtitle && (
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500  shrink-0 ml-2">
                    {isSelected ? '⏎ Enter' : ''}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 bg-[#0f131c] border-t border-[#262f42] flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                ↑
              </kbd>{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                ↓
              </kbd>{' '}
              Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                ⏎
              </kbd>{' '}
              Select
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                Esc
              </kbd>{' '}
              Close
            </span>
          </div>
          <div className="flex items-center gap-1 font-bold text-emerald-400">
            <Command className="w-3 h-3" />
            <span>Terminal Command Palette</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
