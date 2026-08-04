import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { TrendingUp, TrendingDown, ShieldAlert, Award, Layers } from 'lucide-react';

export const HoldingsPage: React.FC = () => {
  const { holdings, summary, settings, setSelectedStockModal } = usePortfolio();

  return (
    <div className="space-y-6 font-mono text-slate-100 pb-12">
      {/* Page Title Bar */}
      <div className="flex items-center justify-between p-4 bg-[#141824] border border-[#212738] rounded-xl">
        <div>
          <h2 className="text-base font-bold uppercase tracking-wider text-white">
            HOLDINGS VISUALIZER GRID
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Visual card-based asset allocation, profit margins, and position weights
          </p>
        </div>
        <div className="text-right text-xs">
          <span className="text-slate-400">Total Holdings Value: </span>
          <span className="font-bold text-emerald-400">
            {settings.currencySymbol}
            {summary.portfolioValue.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>

      {/* Grid of Holdings Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {holdings.map((h) => {
          const isGain = h.unrealizedGain >= 0;
          const isTodayUp = h.todayChange >= 0;

          return (
            <div
              key={h.ticker}
              onClick={() => setSelectedStockModal(h.ticker)}
              className="p-4 bg-[#141824] border border-[#212738] hover:border-blue-500/50 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-lg relative overflow-hidden group"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={h.logo}
                    alt={h.companyName}
                    className="w-9 h-9 rounded object-cover bg-slate-800 border border-slate-700"
                  />
                  <div>
                    <h3 className="font-bold text-slate-100 group-hover:text-blue-400 text-sm truncate max-w-[120px]">
                      {h.companyName}
                    </h3>
                    <span className="text-[10px] text-slate-400 uppercase">
                      {h.ticker} • {h.sector}
                    </span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold text-xs border border-blue-500/20">
                  {h.portfolioWeight.toFixed(1)}%
                </span>
              </div>

              {/* Pricing & Market Value */}
              <div className="p-2.5 bg-[#181e2e] rounded-lg border border-[#232b3f] mb-3 space-y-1">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-400">Market Value</span>
                  <span className="font-bold text-white text-sm">
                    {settings.currencySymbol}
                    {h.marketValue.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Current Price:</span>
                  <span>
                    {settings.currencySymbol}
                    {h.currentPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Returns & Today's Performance */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div
                  className={`p-2 rounded border ${
                    isGain
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}
                >
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                    Total Gain
                  </span>
                  <span className="font-bold">
                    {isGain ? '+' : ''}${h.unrealizedGain.toFixed(2)}
                  </span>
                  <p className="text-[10px] font-bold">
                    {isGain ? '+' : ''}
                    {h.unrealizedGainPercent.toFixed(2)}%
                  </p>
                </div>

                <div
                  className={`p-2 rounded border ${
                    isTodayUp
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}
                >
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                    Today
                  </span>
                  <span className="font-bold">
                    {isTodayUp ? '+' : ''}${h.todayChange.toFixed(2)}
                  </span>
                  <p className="text-[10px] font-bold">
                    {isTodayUp ? '+' : ''}
                    {h.todayChangePercent.toFixed(2)}%
                  </p>
                </div>
              </div>

              {/* Progress bar of Weight */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Portfolio Weight</span>
                  <span>{h.shares.toFixed(2)} shares owned</span>
                </div>
                <div className="w-full bg-[#1e2638] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, h.portfolioWeight * 2.5)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
