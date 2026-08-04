import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import {
  Search,
  Plus,
  RefreshCw,
  Clock,
  Globe,
  Database,
  ExternalLink,
} from 'lucide-react';

interface HeaderProps {
  onOpenAddTransaction: () => void;
  onOpenAiIntel?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddTransaction, onOpenAiIntel }) => {
  const {
    activePage,
    settings,
    updateSettings,
    searchQuery,
    setSearchQuery,
    refreshPricesNow,
    isSyncingSheet,
    syncGoogleSheets,
    summary,
    lastUpdatedTime,
    setIsCommandPaletteOpen,
  } = usePortfolio();

  const [nzdTime, setNzdTime] = useState<string>('');
  const [audTime, setAudTime] = useState<string>('');
  const [edtTime, setEdtTime] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setNzdTime(
        now.toLocaleTimeString('en-US', {
          timeZone: 'Pacific/Auckland',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
        })
      );
      setAudTime(
        now.toLocaleTimeString('en-US', {
          timeZone: 'Australia/Sydney',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
        })
      );
      setEdtTime(
        now.toLocaleTimeString('en-US', {
          timeZone: 'America/New_York',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    refreshPricesNow();
    if (settings.googleSheetsUrl || settings.googleSheetsId) {
      syncGoogleSheets();
    }
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const pageTitles: Record<string, string> = {
    dashboard: 'PORTFOLIO DASHBOARD',
    portfolio: 'HOLDINGS & PORTFOLIO',
    holdings: 'HOLDINGS VISUALIZER',
    transactions: 'TRANSACTION LOG',
    performance: 'RETURNS & PERFORMANCE',
    dividends: 'DIVIDEND INTELLIGENCE',
    allocation: 'ALLOCATION DRILL-DOWN',
    analytics: 'ANALYTICS & RISK METRICS',
    settings: 'TERMINAL CONFIGURATION',
  };

  const isMarketOpen = (tz: string, openHour: number, openMin: number, closeHour: number) => {
    try {
      const d = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
      const day = d.getDay();
      if (day === 0 || day === 6) return false;
      const time = d.getHours() + d.getMinutes() / 60;
      return time >= (openHour + openMin / 60) && time < closeHour;
    } catch {
      return false;
    }
  };

  const nzxOpen = isMarketOpen('Pacific/Auckland', 10, 0, 16.75);
  const asxOpen = isMarketOpen('Australia/Sydney', 10, 0, 16);
  const nyseOpen = isMarketOpen('America/New_York', 9, 30, 16);

  return (
    <header className="bg-[#050505] border-b border-[#1f1f1f] px-5 py-3 flex items-center justify-between gap-4 sticky top-0 z-30 font-sans">
      {/* Title & Terminal Status */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-blue-500 flex items-center justify-center font-bold text-white text-sm shadow-sm">
            K
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-bold text-white tracking-widest uppercase">
                {pageTitles[activePage] || 'KINETIC PORTFOLIO'}
              </h1>
            </div>
            <p className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
              <span>BASE: {settings.baseCurrency} ({settings.currencySymbol})</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">
                {settings.currencySymbol}
                {summary.portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Center Search & Live Last Updated Status Indicator */}
      <div className="flex-1 max-w-2xl hidden md:flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH TICKER, COMPANY, SECTOR..."
            className="w-full bg-[#141414] border border-[#262626] rounded px-3 py-1.5 pl-8 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500  transition-all uppercase tracking-wider"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 text-xs text-gray-500 hover:text-gray-200"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Indicator showing last update time */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-[#141414] border border-[#262626] rounded text-[11px]  text-gray-400 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>UPDATED: <strong className="text-gray-200">{lastUpdatedTime}</strong></span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5 shrink-0 ">
        {/* Base Currency Select (NZD, AUD, USD) */}
        <div className="flex items-center bg-[#141414] border border-[#262626] rounded text-xs text-gray-300 px-2 py-1">
          <Globe className="w-3.5 h-3.5 mr-1.5 text-blue-400 shrink-0" />
          <select
            value={settings.baseCurrency}
            onChange={(e) => updateSettings({ baseCurrency: e.target.value as 'NZD' | 'AUD' | 'USD' })}
            className="bg-transparent text-gray-200 font-bold focus:outline-none cursor-pointer text-xs"
          >
            <option value="NZD" className="bg-[#141414]">NZD (NZ$)</option>
            <option value="AUD" className="bg-[#141414]">AUD (A$)</option>
            <option value="USD" className="bg-[#141414]">USD ($)</option>
          </select>
        </div>

        {/* Real-time AI Market Insights Button */}
        {onOpenAiIntel && (
          <button
            onClick={onOpenAiIntel}
            title="Real-Time AI Market Intelligence Grounded via Google Search"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border border-purple-500/40 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 font-bold transition-all shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            <span>AI MARKET INTEL</span>
          </button>
        )}

        {/* Permanent Google Sheet Link Button */}
        <a
          href={settings.googleSheetsUrl || 'https://docs.google.com/spreadsheets/d/1lYdil7tlArXgCCwj9SXXCJW-3yQ_o6gdrpvqh05LwYo/edit'}
          target="_blank"
          rel="noopener noreferrer"
          title="Open Permanent Master Google Sheet Database (Transactions)"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold transition-all"
        >
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span>MASTER SHEET</span>
          <ExternalLink className="w-3 h-3 text-emerald-400" />
        </a>

        {/* Manual 'Refresh Data' Button */}
        <button
          onClick={handleManualRefresh}
          title="Manual Re-fetch market quotes and portfolio data"
          className="flex items-center gap-1.5 bg-[#1a2333] hover:bg-[#222e45] border border-blue-500/30 hover:border-blue-500/60 text-blue-400 px-2.5 py-1 rounded text-xs font-bold transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">REFRESH</span>
        </button>

        {/* Add Transaction Button */}
        <button
          onClick={onOpenAddTransaction}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">NEW RECORD</span>
        </button>

        {/* Top-Right 3 Timezone Live Clocks: NZST, AEST, EST */}
        <div className="hidden xl:flex items-center gap-2.5 text-[11px] text-gray-400 pl-2.5 border-l border-[#262626]">
          <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-[#181818] border border-[#2e2e2e] rounded flex items-center gap-1.5">
              <span><strong className="text-blue-400">NZST</strong> {nzdTime}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${nzxOpen ? 'bg-emerald-500' : 'bg-gray-600'}`} title={nzxOpen ? 'Market Open' : 'Market Closed'} />
            </span>
            <span className="px-1.5 py-0.5 bg-[#181818] border border-[#2e2e2e] rounded flex items-center gap-1.5">
              <span><strong className="text-emerald-400">AEST</strong> {audTime}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${asxOpen ? 'bg-emerald-500' : 'bg-gray-600'}`} title={asxOpen ? 'Market Open' : 'Market Closed'} />
            </span>
            <span className="px-1.5 py-0.5 bg-[#181818] border border-[#2e2e2e] rounded flex items-center gap-1.5">
              <span><strong className="text-amber-400">EST</strong> {edtTime}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${nyseOpen ? 'bg-emerald-500' : 'bg-gray-600'}`} title={nyseOpen ? 'Market Open' : 'Market Closed'} />
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
