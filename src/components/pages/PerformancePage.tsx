import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { StatCard } from '../common/StatCard';
import { TrendingUp, DollarSign, Award, Percent, Layers, ShieldCheck } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export const PerformancePage: React.FC = () => {
  const { performance, summary, settings } = usePortfolio();

  // Portfolio Growth vs Invested Capital chart simulation
  const growthData = Array.from({ length: 12 }).map((_, i) => {
    const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i];
    const capitalProgress = summary.totalInvestedCapital * (0.5 + (i / 11) * 0.5);
    const valueProgress = summary.portfolioValue * (0.45 + (i / 11) * 0.55 + Math.sin(i * 0.5) * 0.05);

    return {
      month,
      investedCapital: Number(capitalProgress.toFixed(2)),
      portfolioValue: Number(valueProgress.toFixed(2)),
    };
  });

  return (
    <div className="space-y-6 font-mono text-slate-100 pb-12">
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

      {/* Portfolio Growth Chart */}
      <div className="p-5 bg-[#141824] border border-[#212738] rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#212738] pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Portfolio Growth vs Invested Capital Basis
          </h3>
          <span className="text-xs text-slate-400">12-Month Trailing View</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#475569"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="portfolioValue"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#valGrad)"
                name="Portfolio Value ($)"
              />
              <Area
                type="monotone"
                dataKey="investedCapital"
                stroke="#64748b"
                strokeWidth={2}
                strokeDasharray="4 4"
                fill="url(#costGrad)"
                name="Invested Capital ($)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
