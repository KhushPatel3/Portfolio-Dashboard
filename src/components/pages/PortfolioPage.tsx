import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Holding } from '../../types';
import { CompanyLogo } from '../common/CompanyLogo';
import {
  ArrowUpDown,
  Search,
  Filter,
  Download,
  Plus,
  TrendingUp,
  TrendingDown,
  Building2,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Power,
  SlidersHorizontal,
} from 'lucide-react';

export const PortfolioPage: React.FC = () => {
  const {
    holdings,
    settings,
    setSelectedStockModal,
    searchQuery,
    setSearchQuery,
    addPriceAlert,
    deletePriceAlert,
    togglePriceAlert,
  } = usePortfolio();

  const [sectorFilter, setSectorFilter] = useState<string>('ALL');
  const [countryFilter, setCountryFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<keyof Holding>('marketValue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // New Alert State
  const [showAddAlert, setShowAddAlert] = useState<boolean>(false);
  const [alertTicker, setAlertTicker] = useState<string>('AAPL');
  const [alertCondition, setAlertCondition] = useState<'ABOVE' | 'BELOW' | 'DAILY_CHANGE_PCT_ABOVE' | 'DAILY_CHANGE_PCT_BELOW'>('ABOVE');
  const [alertTargetValue, setAlertTargetValue] = useState<number>(250);
  const [alertNote, setAlertNote] = useState<string>('');

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTicker.trim() || alertTargetValue <= 0) return;
    addPriceAlert({
      ticker: alertTicker.trim().toUpperCase(),
      condition: alertCondition,
      targetValue: alertTargetValue,
      isActive: true,
      note: alertNote || 'Custom price trigger',
    });
    setAlertNote('');
    setShowAddAlert(false);
  };

  // Unique sector & country lists for filter dropdowns
  const sectors = useMemo(() => {
    const set = new Set<string>();
    holdings.forEach((h) => set.add(h.sector));
    return Array.from(set);
  }, [holdings]);

  const countries = useMemo(() => {
    const set = new Set<string>();
    holdings.forEach((h) => set.add(h.country));
    return Array.from(set);
  }, [holdings]);

  // Filter & Sort
  const filteredHoldings = useMemo(() => {
    return holdings.filter((h) => {
      const matchQuery =
        !searchQuery ||
        h.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.country.toLowerCase().includes(searchQuery.toLowerCase());

      const matchSector = sectorFilter === 'ALL' || h.sector === sectorFilter;
      const matchCountry = countryFilter === 'ALL' || h.country === countryFilter;

      return matchQuery && matchSector && matchCountry;
    });
  }, [holdings, searchQuery, sectorFilter, countryFilter]);

  const sortedHoldings = useMemo(() => {
    return [...filteredHoldings].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return 0;
    });
  }, [filteredHoldings, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedHoldings.length / pageSize) || 1;
  const paginatedHoldings = sortedHoldings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field: keyof Holding) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="space-y-6  text-slate-100 pb-12">
      {/* Page Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#141824] border border-[#212738] rounded-xl">
        <div>
          <h2 className="text-base font-bold uppercase tracking-wider text-white">
            PORTFOLIO HOLDINGS ({holdings.length})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Active positions, cost basis, unrealized gain/loss, and market pricing
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ticker or company..."
              className="bg-[#1a2030] border border-[#283144] rounded px-3 py-1.5 pl-9 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Sector Filter */}
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="bg-[#1a2030] border border-[#283144] rounded px-3 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Sectors</option>
            {sectors.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Country Filter */}
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="bg-[#1a2030] border border-[#283144] rounded px-3 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-[#141824] border border-[#212738] rounded-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#181e2e] border-b border-[#242d40] text-slate-400 font-semibold uppercase text-[11px]">
                <th className="py-3 px-4">Company</th>
                <th
                  onClick={() => handleSort('shares')}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Shares</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('avgCost')}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Avg Cost</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('currentPrice')}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Current Price</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('marketValue')}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Market Value</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('unrealizedGain')}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Gain / Loss</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('todayChange')}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Today's Change</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('dividendYield')}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Div Yield</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Sector</th>
                <th className="py-3 px-3">Country</th>
                <th className="py-3 px-3">Exchange</th>
                <th
                  onClick={() => handleSort('portfolioWeight')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Weight</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2638]">
              {paginatedHoldings.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-500">
                    No holdings matched your search filters.
                  </td>
                </tr>
              ) : (
                paginatedHoldings.map((h) => {
                  const isGain = h.unrealizedGain >= 0;
                  const isTodayUp = h.todayChange >= 0;

                  return (
                    <tr
                      key={h.ticker}
                      onClick={() => setSelectedStockModal(h.ticker)}
                      className="hover:bg-[#181f30] transition-colors cursor-pointer group"
                    >
                      {/* Company Name & Ticker */}
                      <td className="py-3 px-4 font-bold text-slate-100 flex items-center gap-2.5">
                        <img
                          src={h.logo}
                          alt={h.companyName}
                          className="w-7 h-7 rounded object-cover bg-slate-800 border border-slate-700"
                        />
                        <div>
                          <div className="text-slate-100 group-hover:text-blue-400 font-bold">
                            {h.companyName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {h.ticker} • {h.currency}
                          </div>
                        </div>
                      </td>

                      {/* Shares */}
                      <td className="py-3 px-3 text-slate-200">{h.shares.toFixed(2)}</td>

                      {/* Avg Cost */}
                      <td className="py-3 px-3 text-slate-300">
                        {settings.currencySymbol}
                        {h.avgCost.toFixed(2)}
                      </td>

                      {/* Current Price */}
                      <td className="py-3 px-3 font-bold text-white">
                        {settings.currencySymbol}
                        {h.currentPrice.toFixed(2)}
                      </td>

                      {/* Market Value */}
                      <td className="py-3 px-3 font-bold text-slate-100">
                        {settings.currencySymbol}
                        {h.marketValue.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      {/* Gain / Loss */}
                      <td className="py-3 px-3 font-bold">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] ${
                            isGain
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isGain ? '+' : ''}
                          {settings.currencySymbol}
                          {h.unrealizedGain.toFixed(2)} ({isGain ? '+' : ''}
                          {h.unrealizedGainPercent.toFixed(2)}%)
                        </span>
                      </td>

                      {/* Today's Change */}
                      <td className="py-3 px-3 font-bold">
                        <span
                          className={`flex items-center gap-1 ${
                            isTodayUp ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isTodayUp ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {isTodayUp ? '+' : ''}
                          {h.todayChangePercent.toFixed(2)}%
                        </span>
                      </td>

                      {/* Div Yield */}
                      <td className="py-3 px-3 text-amber-400 font-bold">
                        {h.dividendYield ? `${h.dividendYield.toFixed(2)}%` : '—'}
                      </td>

                      {/* Sector */}
                      <td className="py-3 px-3 text-slate-300 text-[11px]">{h.sector}</td>

                      {/* Country */}
                      <td className="py-3 px-3 text-slate-300 text-[11px]">{h.country}</td>

                      {/* Exchange */}
                      <td className="py-3 px-3 text-slate-400 text-[10px]">{h.exchange}</td>

                      {/* Weight */}
                      <td className="py-3 px-4 text-right font-bold text-blue-400">
                        {h.portfolioWeight.toFixed(2)}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-3 bg-[#181e2e] border-t border-[#242d40] flex items-center justify-between text-xs text-slate-400 ">
          <span>
            Showing page {currentPage} of {totalPages} ({sortedHoldings.length} holdings)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-[#1f273b] hover:bg-[#28324a] disabled:opacity-40 text-slate-200"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-[#1f273b] hover:bg-[#28324a] disabled:opacity-40 text-slate-200"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Price & Portfolio Alerts Manager */}
      <div className="p-5 bg-[#141824] border border-[#212738] rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#212738] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span>PRICE & PORTFOLIO ALERTS</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  {settings.priceAlerts.length} Configured
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Define price triggers and percentage change notifications for target tickers in your portfolio
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddAlert(!showAddAlert)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Alert</span>
          </button>
        </div>

        {/* Add Alert Form */}
        {showAddAlert && (
          <form onSubmit={handleCreateAlert} className="p-4 rounded-lg bg-[#181e2e] border border-[#263148] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 font-bold uppercase">Ticker Symbol</label>
                <input
                  type="text"
                  value={alertTicker}
                  onChange={(e) => setAlertTicker(e.target.value.toUpperCase())}
                  placeholder="e.g. NVDA"
                  className="w-full mt-1 bg-[#0d101a] border border-[#263148] rounded px-3 py-1.5 text-xs text-slate-100 font-bold uppercase focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-bold uppercase">Condition</label>
                <select
                  value={alertCondition}
                  onChange={(e) => setAlertCondition(e.target.value as any)}
                  className="w-full mt-1 bg-[#0d101a] border border-[#263148] rounded px-3 py-1.5 text-xs text-slate-100 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="ABOVE">Price Above ($)</option>
                  <option value="BELOW">Price Below ($)</option>
                  <option value="DAILY_CHANGE_PCT_ABOVE">Daily Change Above (%)</option>
                  <option value="DAILY_CHANGE_PCT_BELOW">Daily Change Below (%)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-bold uppercase">Target Threshold Value</label>
                <input
                  type="number"
                  step="0.1"
                  value={alertTargetValue}
                  onChange={(e) => setAlertTargetValue(Number(e.target.value))}
                  placeholder="250.00"
                  className="w-full mt-1 bg-[#0d101a] border border-[#263148] rounded px-3 py-1.5 text-xs text-slate-100 font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-bold uppercase">Alert Note / Strategy</label>
                <input
                  type="text"
                  value={alertNote}
                  onChange={(e) => setAlertNote(e.target.value)}
                  placeholder="e.g. DCA buy target"
                  className="w-full mt-1 bg-[#0d101a] border border-[#263148] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#263148]">
              <button
                type="button"
                onClick={() => setShowAddAlert(false)}
                className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
              >
                Save Trigger Alert
              </button>
            </div>
          </form>
        )}

        {/* Alerts Table */}
        <div className="overflow-x-auto border border-[#212738] rounded-lg">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#181e2e] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#212738]">
              <tr>
                <th className="px-4 py-3">Ticker</th>
                <th className="px-4 py-3">Condition Trigger</th>
                <th className="px-4 py-3">Target Value</th>
                <th className="px-4 py-3">Strategy Note</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2638] bg-[#0e121e]">
              {settings.priceAlerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                    No active price alerts configured yet.
                  </td>
                </tr>
              ) : (
                settings.priceAlerts.map((a) => (
                  <tr key={a.id} className="hover:bg-[#151b2a] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <CompanyLogo ticker={a.ticker} size="sm" />
                        <span className="font-bold text-slate-100">{a.ticker}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-semibold text-indigo-300">
                      {a.condition.replace(/_/g, ' ')}
                    </td>

                    <td className="px-4 py-3 font-bold text-slate-100">
                      {a.condition.includes('PCT') ? `${a.targetValue}%` : `${settings.currencySymbol}${a.targetValue}`}
                    </td>

                    <td className="px-4 py-3 text-slate-400 italic">
                      {a.note || '—'}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => togglePriceAlert(a.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                          a.isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{a.isActive ? 'ACTIVE' : 'MUTED'}</span>
                      </button>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => deletePriceAlert(a.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Alert"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
