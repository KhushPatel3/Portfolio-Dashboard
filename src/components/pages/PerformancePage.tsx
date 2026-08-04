import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { StatCard } from '../common/StatCard';
import { TrendingUp, DollarSign, Award, Percent, Layers, ShieldCheck } from 'lucide-react';
import {
  ResponsiveContainer,


  XAxis,
  YAxis,
  Tooltip,

} from 'recharts';

export const PerformancePage: React.FC = () => {
  const { performance, summary, settings } = usePortfolio();

  return (
    <div className="space-y-6  text-slate-100 pb-12">
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

    </div>
  );
};

