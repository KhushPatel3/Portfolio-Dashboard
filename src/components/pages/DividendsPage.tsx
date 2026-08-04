import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { StatCard } from '../common/StatCard';
import { DollarSign, Calendar, TrendingUp, PieChart as PieIcon, Award } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const DividendsPage: React.FC = () => {
  const { summary, dividends, holdings, settings } = usePortfolio();

  const [activeTab, setActiveTab] = useState<'schedule' | 'history' | 'companies'>('schedule');

  // Dividend yield on cost calculation
  const yieldOnCost =
    summary.totalInvestedCapital > 0
      ? (summary.annualDividendForecast / summary.totalInvestedCapital) * 100
      : 0;

  // Monthly calendar bar data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = months.map((m) => ({
    month: m,
    amount: Number((summary.annualDividendForecast / 12 * (0.7 + Math.random() * 0.6)).toFixed(2)),
  }));

  // Dividend by company pie data
  const companyDivData = holdings
    .filter((h) => h.annualDividendIncome > 0)
    .map((h) => ({
      name: h.companyName,
      ticker: h.ticker,
      value: h.annualDividendIncome,
    }))
    .sort((a, b) => b.value - a.value);

  const COLORS = ['#eab308', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  const upcomingDivs = dividends.filter((d) => d.status === 'UPCOMING');
  const paidDivs = dividends.filter((d) => d.status === 'PAID');

  return (
    <div className="space-y-6 font-mono text-slate-100 pb-12">
      {/* Title */}
      <div className="p-4 bg-[#141824] border border-[#212738] rounded-xl flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-400" />
            DIVIDEND INTELLIGENCE & FORECAST
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cashflow schedules, yield on cost, ex-dividend calendars, and payout trends
          </p>
        </div>
        <span className="px-3 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold">
          Portfolio Yield: {summary.portfolioYield.toFixed(2)}%
        </span>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          title="Total Collected"
          value={`${settings.currencySymbol}${summary.dividendIncomeTotal.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtitle="Cumulative Payouts"
          accentColor="yellow"
        />

        <StatCard
          title="Annual Forecast"
          value={`${settings.currencySymbol}${summary.annualDividendForecast.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtitle={`Monthly: ~$${(summary.annualDividendForecast / 12).toFixed(2)}`}
          accentColor="yellow"
        />

        <StatCard
          title="Dividend Yield"
          value={`${summary.portfolioYield.toFixed(2)}%`}
          subtitle="On Market Value"
          accentColor="blue"
        />

        <StatCard
          title="Yield on Cost"
          value={`${yieldOnCost.toFixed(2)}%`}
          subtitle="On Cost Basis"
          accentColor="green"
        />

        <StatCard
          title="Dividend Growth"
          value="+8.4% YoY"
          subtitle="Dividend CAGR"
          accentColor="green"
        />
      </div>

      {/* Monthly Dividend Calendar & Company Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Calendar Bar Chart (2 cols) */}
        <div className="lg:col-span-2 p-5 bg-[#141824] border border-[#212738] rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#212738] pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              Monthly Dividend Calendar
            </h3>
            <span className="text-xs text-slate-400">Projected 12-Month Payouts</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Dividend Income']}
                />
                <Bar dataKey="amount" fill="#eab308" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dividends by Company Pie Chart */}
        <div className="p-5 bg-[#141824] border border-[#212738] rounded-xl flex flex-col justify-between space-y-4">
          <div className="border-b border-[#212738] pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Dividends by Company
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Income Distribution</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={companyDivData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {companyDivData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`$${Number(val).toFixed(2)}/yr`, 'Annual Income']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1 max-h-24 overflow-y-auto no-scrollbar text-xs">
            {companyDivData.map((item, i) => (
              <div key={item.ticker} className="flex justify-between text-slate-300">
                <span className="truncate">{item.name}</span>
                <span className="font-bold text-amber-400">${item.value.toFixed(2)}/yr</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs & Tables */}
      <div className="bg-[#141824] border border-[#212738] rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#212738] pb-3">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${
              activeTab === 'schedule'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Upcoming Schedule ({upcomingDivs.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dividend History ({paidDivs.length})
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${
              activeTab === 'companies'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Company Yield Matrix
          </button>
        </div>

        {activeTab === 'schedule' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#181e2e] text-slate-400 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-3">Company</th>
                  <th className="py-2.5 px-3">Ex-Date</th>
                  <th className="py-2.5 px-3">Pay Date</th>
                  <th className="py-2.5 px-3">Shares</th>
                  <th className="py-2.5 px-3">Payout / Share</th>
                  <th className="py-2.5 px-3">Yield</th>
                  <th className="py-2.5 px-3 text-right">Estimated Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2638]">
                {upcomingDivs.map((div) => (
                  <tr key={div.id} className="hover:bg-[#181f30]">
                    <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                      <img src={div.logo} alt={div.companyName} className="w-6 h-6 rounded object-cover" />
                      <span>
                        {div.companyName} ({div.ticker})
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{div.exDate}</td>
                    <td className="py-3 px-3 text-slate-300">{div.paymentDate}</td>
                    <td className="py-3 px-3 text-slate-200">{div.sharesOwned.toFixed(2)}</td>
                    <td className="py-3 px-3 text-slate-300">${div.amountPerShare.toFixed(2)}</td>
                    <td className="py-3 px-3 text-amber-400 font-bold">{div.yield.toFixed(2)}%</td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400">
                      +${div.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#181e2e] text-slate-400 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-3">Company</th>
                  <th className="py-2.5 px-3">Payment Date</th>
                  <th className="py-2.5 px-3">Shares Owned</th>
                  <th className="py-2.5 px-3">Per Share</th>
                  <th className="py-2.5 px-3 text-right">Amount Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2638]">
                {paidDivs.map((div) => (
                  <tr key={div.id} className="hover:bg-[#181f30]">
                    <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                      <img src={div.logo} alt={div.companyName} className="w-6 h-6 rounded object-cover" />
                      <span>
                        {div.companyName} ({div.ticker})
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{div.paymentDate}</td>
                    <td className="py-3 px-3 text-slate-200">{div.sharesOwned.toFixed(2)}</td>
                    <td className="py-3 px-3 text-slate-300">${div.amountPerShare.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400">
                      +${div.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'companies' && (
          <div className="space-y-3">
            {holdings.map((h) => (
              <div
                key={h.ticker}
                className="flex items-center justify-between p-3 bg-[#181e2e] rounded-lg border border-[#242d40] text-xs"
              >
                <div className="flex items-center gap-3">
                  <img src={h.logo} alt={h.companyName} className="w-7 h-7 rounded object-cover" />
                  <div>
                    <span className="font-bold text-white">{h.companyName} ({h.ticker})</span>
                    <p className="text-[10px] text-slate-400">Yield: {h.dividendYield}% • Yield on Cost: {h.yieldOnCost.toFixed(2)}%</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-amber-400">
                    +${h.annualDividendIncome.toFixed(2)}/yr
                  </span>
                  <p className="text-[10px] text-slate-400">
                    ~${(h.annualDividendIncome / 12).toFixed(2)}/mo
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
