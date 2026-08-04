import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { StatCard } from '../common/StatCard';
import { RebalancingCalculator } from '../analytics/RebalancingCalculator';
import { BarChart3, ShieldCheck, AlertTriangle, Activity, DollarSign, Layers } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { analytics, performance, holdings, settings, setSelectedStockModal } = usePortfolio();

  return (
    <div className="space-y-6 font-mono text-slate-100 pb-12">
      {/* Title */}
      <div className="p-4 bg-[#141824] border border-[#212738] rounded-xl flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            PORTFOLIO ANALYTICS & RISK ENGINE
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Diversification Score, Heatmap, Risk Exposure, Cashflow Projection, and Performance Attribution
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded text-xs text-emerald-400 font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Diversification Score: {analytics.diversificationScore}/100</span>
        </div>
      </div>

      {/* Top Risk & Concentration Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          title="Diversification"
          value={`${analytics.diversificationScore} / 100`}
          subtitle="Herfindahl Index Rating"
          accentColor={analytics.diversificationScore >= 70 ? 'green' : 'yellow'}
        />

        <StatCard
          title="Largest Position"
          value={`${analytics.largestPositionPercent.toFixed(1)}%`}
          subtitle={`Ticker: ${analytics.largestPositionTicker}`}
          accentColor="blue"
        />

        <StatCard
          title="Top 5 Concentration"
          value={`${analytics.top5ConcentrationPercent.toFixed(1)}%`}
          subtitle="Top 5 Assets %"
          accentColor="neutral"
        />

        <StatCard
          title="Top 10 Concentration"
          value={`${analytics.top10ConcentrationPercent.toFixed(1)}%`}
          subtitle="Top 10 Assets %"
          accentColor="neutral"
        />

        <StatCard
          title="Beta (S&P 500)"
          value={`${performance.beta.toFixed(2)}`}
          subtitle="Systematic Risk"
          accentColor="neutral"
        />
      </div>

      {/* Target Portfolio Rebalancing Calculator */}
      <RebalancingCalculator />

      {/* Portfolio Heatmap Visualizer */}
      <div className="p-5 bg-[#141824] border border-[#212738] rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#212738] pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Portfolio Performance Heatmap
          </h3>
          <p className="text-xs text-slate-400">Tile Size = Market Value Basis | Color = Gain / Loss</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {holdings.map((h) => {
            const isGain = h.unrealizedGain >= 0;
            const intensity = Math.min(100, Math.abs(h.unrealizedGainPercent) * 3);

            return (
              <div
                key={h.ticker}
                onClick={() => setSelectedStockModal(h.ticker)}
                className={`p-3 rounded-lg border flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] shadow ${
                  isGain
                    ? 'bg-emerald-950/40 border-emerald-500/40 hover:border-emerald-400 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 hover:border-rose-400 text-rose-300'
                }`}
                style={{
                  minHeight: '85px',
                }}
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">{h.ticker}</span>
                  <span className="text-[10px] text-slate-300">{h.portfolioWeight.toFixed(1)}%</span>
                </div>

                <div className="mt-2 text-right">
                  <div className="text-xs font-bold">
                    {isGain ? '+' : ''}
                    {h.unrealizedGainPercent.toFixed(2)}%
                  </div>
                  <div className="text-[10px] opacity-80">${h.marketValue.toFixed(0)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Risk Metrics & Exposure Matrices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Metrics Card */}
        <div className="p-5 bg-[#141824] border border-[#212738] rounded-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-[#212738] pb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            Statistical Risk Profile
          </h3>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between p-2.5 bg-[#181e2e] rounded border border-[#232b3f]">
              <span className="text-slate-400">Sharpe Ratio (Risk-Adjusted Return)</span>
              <span className="font-bold text-emerald-400">{performance.sharpeRatio} (Strong)</span>
            </div>

            <div className="flex justify-between p-2.5 bg-[#181e2e] rounded border border-[#232b3f]">
              <span className="text-slate-400">Annualized Volatility (Std Dev)</span>
              <span className="font-bold text-slate-200">{performance.volatilityPercent}%</span>
            </div>

            <div className="flex justify-between p-2.5 bg-[#181e2e] rounded border border-[#232b3f]">
              <span className="text-slate-400">Max Historical Drawdown</span>
              <span className="font-bold text-rose-400">{performance.maxDrawdownPercent}%</span>
            </div>

            <div className="flex justify-between p-2.5 bg-[#181e2e] rounded border border-[#232b3f]">
              <span className="text-slate-400">Value at Risk (VaR 95% 1-Day)</span>
              <span className="font-bold text-amber-400">-$1,840.00</span>
            </div>
          </div>
        </div>

        {/* Monthly Cashflow Projection Chart */}
        <div className="p-5 bg-[#141824] border border-[#212738] rounded-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-[#212738] pb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            Monthly Cashflow Projections
          </h3>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.monthlyCashflow}>
                <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="dividends" fill="#eab308" name="Dividends ($)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance Attribution Table */}
      <div className="p-5 bg-[#141824] border border-[#212738] rounded-xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-[#212738] pb-3">
          Performance Attribution (Top Assets)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#181e2e] text-slate-400 font-semibold uppercase text-[11px]">
                <th className="py-2.5 px-3">Asset</th>
                <th className="py-2.5 px-3">Weight</th>
                <th className="py-2.5 px-3">Asset Return</th>
                <th className="py-2.5 px-3 text-right">Portfolio Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2638]">
              {analytics.performanceAttribution.map((attr) => (
                <tr key={attr.asset} className="hover:bg-[#181f30]">
                  <td className="py-3 px-3 font-bold text-white">{attr.asset}</td>
                  <td className="py-3 px-3 text-slate-300">{attr.weight.toFixed(2)}%</td>
                  <td
                    className={`py-3 px-3 font-bold ${
                      attr.returnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {attr.returnPct >= 0 ? '+' : ''}
                    {attr.returnPct.toFixed(2)}%
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-bold ${
                      attr.contributionPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {attr.contributionPct >= 0 ? '+' : ''}
                    {attr.contributionPct.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
