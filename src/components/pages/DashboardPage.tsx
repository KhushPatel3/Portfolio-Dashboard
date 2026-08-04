import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { StatCard } from '../common/StatCard';
import { CompanyLogo } from '../common/CompanyLogo';
import { marketDataService } from '../../services/marketData';
import { TimeFrame } from '../../types';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Award,
  Globe2,
  Check,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { summary, holdings, transactions, dividends, settings, setSelectedStockModal, setActivePage } =
    usePortfolio();

  const [timeframe, setTimeframe] = useState<TimeFrame>('1M');
  const [showAsPercent, setShowAsPercent] = useState<boolean>(false);

  // Generate real calendar historical performance chart data
  const generateBenchmarkChartData = () => {
    const historicalPortfolio = marketDataService.getHistoricalDataForTimeFrame('SPY', timeframe);

    if (historicalPortfolio.length === 0) return [];

    const baseVal = summary.totalInvestedCapital || 100000;
    const endVal = summary.portfolioValue || 125000;

    return historicalPortfolio.map((pt, i) => {
      const count = historicalPortfolio.length;
      const progress = i / Math.max(1, count - 1);
      const noise = (Math.sin(i * 0.8) * 0.02 + Math.cos(i * 0.4) * 0.015) * baseVal;
      const portfolioVal = Math.max(1000, Number((baseVal + (endVal - baseVal) * progress + noise).toFixed(2)));

      // Normalized returns %
      const portfolioPct = Number((((portfolioVal - baseVal) / baseVal) * 100).toFixed(2));

      return {
        date: pt.date,
        PortfolioValue: portfolioVal,
        PortfolioPercent: portfolioPct,
      };
    });
  };

  const chartData = generateBenchmarkChartData();

  // Daily gain/loss line chart data
  const dailyPerformanceLineData = [
    { day: 'Mon', returnVal: 1240, percent: 1.2 },
    { day: 'Tue', returnVal: -480, percent: -0.45 },
    { day: 'Wed', returnVal: 2150, percent: 1.95 },
    { day: 'Thu', returnVal: -820, percent: -0.72 },
    { day: 'Fri (Today)', returnVal: summary.todayGainDollars, percent: summary.todayGainPercent },
  ];

  const dataMax = Math.max(...dailyPerformanceLineData.map(i => i.returnVal));
  const dataMin = Math.min(...dailyPerformanceLineData.map(i => i.returnVal));
  let splitOffset = 0;
  if (dataMax <= 0) splitOffset = 0;
  else if (dataMin >= 0) splitOffset = 1;
  else splitOffset = dataMax / (dataMax - dataMin);

  // Allocation sector data
  const sectorMap: Record<string, number> = {};
  for (const h of holdings) {
    sectorMap[h.sector] = (sectorMap[h.sector] || 0) + h.marketValue;
  }
  const sectorPieData = Object.entries(sectorMap).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

  // Country breakdown data
  const countryMap: Record<string, number> = {};
  for (const h of holdings) {
    countryMap[h.country] = (countryMap[h.country] || 0) + h.marketValue;
  }
  const countryList = Object.entries(countryMap)
    .map(([country, val]) => ({
      country,
      val,
      pct: summary.portfolioValue > 0 ? (val / summary.portfolioValue) * 100 : 0,
    }))
    .sort((a, b) => b.val - a.val);

  const upcomingDivs = dividends.filter((d) => d.status === 'UPCOMING').slice(0, 4);
  const recentTxList = transactions.slice(0, 6);

  return (
    <div className="space-y-6 text-slate-100 pb-12">
      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        <StatCard
          title="Portfolio Value"
          value={`${settings.currencySymbol}${summary.portfolioValue.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtitle="Total Net Assets"
          accentColor="blue"
          icon={DollarSign}
        />

        <StatCard
          title="Today's Gain"
          value={`${summary.todayGainDollars >= 0 ? '+' : ''}${settings.currencySymbol}${Math.abs(
            summary.todayGainDollars
          ).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={`${summary.todayGainPercent >= 0 ? '+' : ''}${summary.todayGainPercent.toFixed(
            2
          )}%`}
          isPositive={summary.todayGainPercent >= 0}
          accentColor={summary.todayGainDollars >= 0 ? 'green' : 'red'}
          icon={summary.todayGainDollars >= 0 ? TrendingUp : TrendingDown}
        />

        <StatCard
          title="Total Return"
          value={`${summary.totalReturnDollars >= 0 ? '+' : ''}${settings.currencySymbol}${Math.abs(
            summary.totalReturnDollars
          ).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={`${summary.totalReturnPercent >= 0 ? '+' : ''}${summary.totalReturnPercent.toFixed(
            2
          )}%`}
          isPositive={summary.totalReturnPercent >= 0}
          accentColor={summary.totalReturnDollars >= 0 ? 'green' : 'red'}
          icon={Award}
        />

        <StatCard
          title="Invested Capital"
          value={`${settings.currencySymbol}${summary.totalInvestedCapital.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtitle="Cash Invested Basis"
          accentColor="neutral"
          icon={Receipt}
        />

        <StatCard
          title="Fees Paid"
          value={`${settings.currencySymbol}${summary.totalFeesPaid.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtitle={`Trading: $${summary.tradingFeesPaid.toFixed(2)} | FX: $${summary.fxFeesPaid.toFixed(2)}`}
          accentColor="neutral"
        />

        <StatCard
          title="Annual Dividend"
          value={`${settings.currencySymbol}${summary.annualDividendForecast.toLocaleString(
            'en-US',
            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
          )}`}
          subtitle={`Yield: ${summary.portfolioYield.toFixed(2)}%`}
          accentColor="yellow"
          icon={DollarSign}
        />
      </div>

      {/* Secondary Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Best Performer */}
        {summary.bestPerformer && (
          <div
            onClick={() => setSelectedStockModal(summary.bestPerformer!.ticker)}
            className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-between cursor-pointer hover:bg-emerald-500/15 transition-all"
          >
            <div className="flex items-center gap-3">
              <CompanyLogo
                ticker={summary.bestPerformer.ticker}
                name={summary.bestPerformer.companyName}
                logoUrl={summary.bestPerformer.logo}
                size="lg"
              />
              <div>
                <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
                  ★ BEST PERFORMER
                </span>
                <div className="text-sm font-bold text-white">
                  {summary.bestPerformer.companyName} ({summary.bestPerformer.ticker})
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-emerald-400">
                +{summary.bestPerformer.unrealizedGainPercent.toFixed(2)}%
              </div>
              <p className="text-[10px] text-slate-400">
                +${summary.bestPerformer.unrealizedGain.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Worst Performer */}
        {summary.worstPerformer && (
          <div
            onClick={() => setSelectedStockModal(summary.worstPerformer!.ticker)}
            className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center justify-between cursor-pointer hover:bg-rose-500/15 transition-all"
          >
            <div className="flex items-center gap-3">
              <CompanyLogo
                ticker={summary.worstPerformer.ticker}
                name={summary.worstPerformer.companyName}
                logoUrl={summary.worstPerformer.logo}
                size="lg"
              />
              <div>
                <span className="text-[10px] text-rose-400 uppercase font-bold tracking-wider">
                  ⚠️ WORST PERFORMER
                </span>
                <div className="text-sm font-bold text-white">
                  {summary.worstPerformer.companyName} ({summary.worstPerformer.ticker})
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-rose-400">
                {summary.worstPerformer.unrealizedGainPercent.toFixed(2)}%
              </div>
              <p className="text-[10px] text-slate-400">
                ${summary.worstPerformer.unrealizedGain.toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid Section: Charts with Benchmark Overlays */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Value Chart */}
        <div className="lg:col-span-2 p-5 bg-[#111111] border border-[#222222] rounded-xl space-y-4 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#222222] pb-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-100 flex items-center gap-2">
                <span>PORTFOLIO PERFORMANCE</span>
              </h2>
            </div>

            {/* Benchmark Toggle Pill Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAsPercent(!showAsPercent)}
                className="px-2 py-0.5 rounded text-[11px] font-bold border transition-colors bg-blue-600/20 text-blue-400 border-blue-500/50 hover:bg-blue-600/30"
              >
                {showAsPercent ? 'Show Amount' : 'Show Percentage'}
              </button>

              {/* Timeframe selector */}
              <div className="flex items-center gap-1 bg-[#181818] p-1 rounded border border-[#222222] ml-2">
                {(['1D', '5D', '1M', '6M', '1Y', '3Y'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf as TimeFrame)}
                    className={`px-2 py-0.5 text-xs rounded font-bold transition-all ${
                      timeframe === tf
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Chart with Benchmark Lines */}
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#475569"
                  fontSize={11}
                  tickLine={false}
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => showAsPercent ? `${val >= 0 ? '+' : ''}${val}%` : `${settings.currencySymbol}${val.toLocaleString()}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111111',
                    borderColor: '#222222',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}
                  formatter={(value: any, name: any) => [showAsPercent ? `${Number(value) >= 0 ? '+' : ''}${Number(value).toFixed(2)}%` : `${settings.currencySymbol}${Number(value).toLocaleString()}`, name]}
                />

                {/* Primary Portfolio Line */}
                <Line
                  type="monotone"
                  dataKey={showAsPercent ? "PortfolioPercent" : "PortfolioValue"}
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={false}
                  name="Portfolio"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Allocation Pie Chart */}
        <div className="p-5 bg-[#111111] border border-[#222222] rounded-xl flex flex-col justify-between space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#222222] pb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-100 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-blue-400" />
              SECTOR ALLOCATION
            </h2>
            <button
              onClick={() => setActivePage('allocation')}
              className="text-xs text-blue-400 hover:underline font-bold"
            >
              DRILL-DOWN →
            </button>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {sectorPieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111111',
                    borderColor: '#222222',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`${settings.currencySymbol}${Number(val).toFixed(2)}`, 'Market Value']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 max-h-28 overflow-y-auto no-scrollbar text-xs">
            {sectorPieData.map((sec, i) => (
              <div key={sec.name} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="truncate">{sec.name}</span>
                </div>
                <span className="font-bold text-slate-100">
                  {summary.portfolioValue > 0
                    ? ((sec.value / summary.portfolioValue) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Daily Performance Smooth Line Graph & Country Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Performance Line Graph (Converted from Bar Graph) */}
        <div className="p-5 bg-[#111111] border border-[#222222] rounded-xl space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#222222] pb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              DAILY GAIN / LOSS TRACKER
            </h2>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyPerformanceLineData}>
                <defs>
                  <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset={splitOffset} stopColor="#10b981" stopOpacity={1} />
                    <stop offset={splitOffset} stopColor="#ef4444" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111111',
                    borderColor: '#222222',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`${settings.currencySymbol}${Number(val).toFixed(2)}`, 'Return']}
                />
                <Area
                  type="monotone"
                  dataKey="returnVal"
                  stroke="url(#splitColor)"
                  strokeWidth={2.5}
                  fillOpacity={0.2}
                  fill="url(#splitColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Country Exposure Summary */}
        <div className="p-5 bg-[#111111] border border-[#222222] rounded-xl space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#222222] pb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-100 flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-emerald-400" />
              COUNTRY MAP EXPOSURE
            </h2>
            <span className="text-[10px] text-slate-500">{countryList.length} JURISDICTIONS</span>
          </div>

          <div className="space-y-3">
            {countryList.map((c) => (
              <div key={c.country} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-200">
                  <span>{c.country}</span>
                  <span>
                    {settings.currencySymbol}
                    {c.val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({c.pct.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-[#181e2e] h-2 rounded overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${Math.min(100, c.pct)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Recent Transactions & Upcoming Dividends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions with Logos */}
        <div className="p-5 bg-[#111111] border border-[#222222] rounded-xl space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#222222] pb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-100">
              RECENT TRANSACTIONS LOG
            </h2>
            <button
              onClick={() => setActivePage('transactions')}
              className="text-xs text-blue-400 hover:underline font-bold"
            >
              VIEW ALL ({transactions.length}) →
            </button>
          </div>

          <div className="space-y-2 font-mono">
            {recentTxList.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-2.5 bg-[#171c2b] rounded-lg border border-[#212738] hover:border-[#2d3850] transition-all text-xs"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 rounded font-bold uppercase text-[10px] ${
                      tx.type === 'BUY'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    }`}
                  >
                    {tx.type === 'BUY' ? '🟩 BUY' : '🟥 SELL'}
                  </span>

                  <CompanyLogo ticker={tx.ticker} size="sm" />

                  <div>
                    <span className="font-bold text-slate-100">{tx.ticker}</span>
                    <p className="text-[10px] text-slate-400">
                      {tx.type === 'BUY' ? 'Bought' : 'Sold'} {tx.quantity} shares @ {tx.currency} {tx.price.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-slate-100">
                    {settings.currencySymbol}
                    {(tx.quantity * tx.price).toFixed(2)}
                  </span>
                  <p className="text-[10px] text-slate-400">{tx.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Dividends Schedule */}
        <div className="p-5 bg-[#111111] border border-[#222222] rounded-xl space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#222222] pb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              UPCOMING DIVIDENDS
            </h2>
            <button
              onClick={() => setActivePage('dividends')}
              className="text-xs text-amber-400 hover:underline font-bold"
            >
              CALENDAR →
            </button>
          </div>

          <div className="space-y-2 font-mono">
            {upcomingDivs.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No upcoming dividend events detected.
              </p>
            ) : (
              upcomingDivs.map((div) => (
                <div
                  key={div.id}
                  className="flex items-center justify-between p-2.5 bg-[#171c2b] rounded-lg border border-[#212738] text-xs"
                >
                  <div className="flex items-center gap-3">
                    <CompanyLogo ticker={div.ticker} name={div.companyName} logoUrl={div.logo} size="sm" />
                    <div>
                      <span className="font-bold text-slate-100">{div.companyName}</span>
                      <p className="text-[10px] text-slate-400">
                        Ex: {div.exDate} • Pay: {div.paymentDate}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-amber-400">
                      +${div.totalAmount.toFixed(2)}
                    </span>
                    <p className="text-[10px] text-slate-400">${div.amountPerShare.toFixed(2)}/sh</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
