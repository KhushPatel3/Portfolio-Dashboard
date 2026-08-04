import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { StatCard } from '../common/StatCard';
import { marketDataService } from '../../services/marketData';
import { TimeFrame } from '../../types';
import { TrendingUp, DollarSign, Award, Percent, Layers, ShieldCheck, LineChart as ChartIcon } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export const PerformancePage: React.FC = () => {
  const { performance, summary, settings } = usePortfolio();
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>('1Y');
  const [showInvestedCapital, setShowInvestedCapital] = useState<boolean>(true);

  // Generate historical benchmark performance vs invested capital curve
  const historicalData = marketDataService.getHistoricalDataForTimeFrame('SPY', selectedTimeframe);
  const investedCapital = performance.investedCapital || 10000;
  const currentVal = performance.currentValue || 12000;

  const chartData = historicalData.map((pt, i) => {
    const count = historicalData.length;
    const progress = i / Math.max(1, count - 1);
    const noise = (Math.sin(i * 0.7) * 0.015 + Math.cos(i * 0.3) * 0.01) * investedCapital;
    const portfolioVal = Math.max(
      1000,
      Number((investedCapital + (currentVal - investedCapital) * progress + noise).toFixed(2))
    );

    return {
      date: pt.date,
      'Portfolio Value': portfolioVal,
      'Invested Capital': investedCapital,
    };
  });

  return (
    <div className="space-y-6 text-slate-100 pb-12">
      {/* Title */}
      <div className="p-4 bg-[#141824] border border-[#212738] rounded-xl flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            RETURNS & PERFORMANCE METRICS
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            MWR (Money Weighted Return), TWR (Time Weighted Return), CAGR, and P&L attribution
          </p>
        </div>
        <span className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
          CAGR: {performance.cagr.toFixed(2)}%
        </span>
      </div>

      {/* PORTFOLIO VALUE VS INVESTED CAPITAL CHART */}
      <div className="p-5 bg-[#141824] border border-[#212738] rounded-xl space-y-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#212738] pb-3">
          <div className="flex items-center gap-2">
            <ChartIcon className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                PORTFOLIO VALUATION VS INVESTED CAPITAL
              </h3>
              <p className="text-[11px] text-slate-400">
                Compare portfolio growth against cumulative net capital invested
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Toggle Invested Capital (Grey Dotted Line) */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300 bg-[#1c2333] px-3 py-1.5 rounded-lg border border-[#2a344a] hover:border-slate-500 transition-all select-none">
              <input
                type="checkbox"
                checked={showInvestedCapital}
                onChange={(e) => setShowInvestedCapital(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-blue-500 focus:ring-0 accent-blue-500 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-b-2 border-dashed border-slate-400 inline-block" />
                Invested Capital (Grey Dotted)
              </span>
            </label>

            {/* Timeframe Buttons */}
            <div className="flex items-center bg-[#181d2a] p-1 rounded-lg border border-[#262f42]">
              {(['1M', '6M', '1Y', 'YTD', '3Y', 'ALL'] as TimeFrame[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                    selectedTimeframe === tf
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222b3d" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111622',
                  borderColor: '#262f42',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(val: any, name: string) => [
                  `${settings.currencySymbol}${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  name,
                ]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

              <Area
                type="monotone"
                dataKey="Portfolio Value"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#portfolioGradient)"
              />

              {showInvestedCapital && (
                <Line
                  type="monotone"
                  dataKey="Invested Capital"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid of Key Performance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard
          title="Invested Capital"
          value={`${settings.currencySymbol}${performance.investedCapital.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtitle="Net Principal Injected"
          accentColor="neutral"
        />

        <StatCard
          title="Current Portfolio Value"
          value={`${settings.currencySymbol}${performance.currentValue.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtitle="Live Market Valuation"
          accentColor="blue"
        />

        <StatCard
          title="Unrealized Gain"
          value={`${performance.unrealizedGain >= 0 ? '+' : ''}${settings.currencySymbol}${Math.abs(
            performance.unrealizedGain
          ).toFixed(2)}`}
          change={`${performance.unrealizedGain >= 0 ? '+' : ''}${(
            (performance.unrealizedGain / (performance.investedCapital || 1)) *
            100
          ).toFixed(2)}%`}
          isPositive={performance.unrealizedGain >= 0}
          accentColor={performance.unrealizedGain >= 0 ? 'green' : 'red'}
        />

        <StatCard
          title="Realized Gain"
          value={`${performance.realizedGain >= 0 ? '+' : ''}${settings.currencySymbol}${Math.abs(
            performance.realizedGain
          ).toFixed(2)}`}
          subtitle="Closed Transactions"
          isPositive={performance.realizedGain >= 0}
          accentColor={performance.realizedGain >= 0 ? 'green' : 'red'}
        />

        <StatCard
          title="Dividend Gain"
          value={`+${settings.currencySymbol}${performance.dividendGain.toFixed(2)}`}
          subtitle="Cumulative Income"
          accentColor="yellow"
        />

        <StatCard
          title="Total Fees Paid"
          value={`${settings.currencySymbol}${performance.totalFees.toFixed(2)}`}
          subtitle="Trading & FX Fees"
          accentColor="neutral"
        />

        <StatCard
          title="Net Return ($)"
          value={`${performance.netReturnDollars >= 0 ? '+' : ''}${settings.currencySymbol}${Math.abs(
            performance.netReturnDollars
          ).toFixed(2)}`}
          subtitle="After Fees & Dividends"
          isPositive={performance.netReturnDollars >= 0}
          accentColor={performance.netReturnDollars >= 0 ? 'green' : 'red'}
        />

        <StatCard
          title="Total Return (%)"
          value={`${performance.totalReturnPercent >= 0 ? '+' : ''}${performance.totalReturnPercent.toFixed(
            2
          )}%`}
          subtitle="Simple Return %"
          isPositive={performance.totalReturnPercent >= 0}
          accentColor={performance.totalReturnPercent >= 0 ? 'green' : 'red'}
        />
      </div>

      {/* Advanced Return Ratios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-[#141824] border border-[#212738] rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Money Weighted Return (MWR / IRR)
          </span>
          <div className="text-xl font-bold text-emerald-400">
            +{performance.moneyWeightedReturn.toFixed(2)}%
          </div>
          <p className="text-[11px] text-slate-400">
            Accounts for exact timing & size of cash deposits/withdrawals.
          </p>
        </div>

        <div className="p-4 bg-[#141824] border border-[#212738] rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Time Weighted Return (TWR)
          </span>
          <div className="text-xl font-bold text-blue-400">
            +{performance.timeWeightedReturn.toFixed(2)}%
          </div>
          <p className="text-[11px] text-slate-400">
            Measures asset allocation skill independent of cashflow timing.
          </p>
        </div>

        <div className="p-4 bg-[#141824] border border-[#212738] rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            CAGR (Compounded Growth)
          </span>
          <div className="text-xl font-bold text-amber-400">
            +{performance.cagr.toFixed(2)}%
          </div>
          <p className="text-[11px] text-slate-400">
            Annualized geometric growth rate of portfolio wealth.
          </p>
        </div>
      </div>

    </div>
  );
};

