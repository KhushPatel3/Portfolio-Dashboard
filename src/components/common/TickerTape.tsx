import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Quote } from '../../types';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { marketDataService } from '../../services/marketData';

export const TickerTape: React.FC = () => {
  const { quotes, settings, setSelectedStockModal, holdings } = usePortfolio();
  
  // Use only current holdings for the market feed
  const activeQuoteList = holdings.map(h => quotes[h.ticker]).filter(Boolean);
  
  // If no holdings, fallback to a few defaults so the feed isn't empty, or just show empty?
  // User requested: "Market feed should include only current holdings."
  const quoteList: Quote[] = activeQuoteList.length > 0 ? activeQuoteList : [];

  // Duplicate quotes list for seamless infinite marquee scroll
  const duplicatedList = [...quoteList, ...quoteList, ...quoteList, ...quoteList];

  if (quoteList.length === 0) return null;

  return (
    <div className="w-full bg-[#080808] border-b border-[#262626] overflow-hidden py-1 px-3 text-xs select-none flex items-center relative z-40">
      <div className="flex items-center gap-2 pr-3.5 border-r border-[#262626] text-gray-500 font-semibold shrink-0 bg-[#080808] z-10 shadow-r">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[10px] tracking-widest uppercase text-emerald-400 font-bold">MARKET FEED</span>
      </div>

      {/* Ticker marquee container */}
      <div className="flex-1 overflow-hidden relative flex">
        <div 
          className="flex items-center animate-ticker hover:[animation-play-state:paused]"
          style={{ willChange: 'transform' }}
        >
          {duplicatedList.map((q, idx) => {
            const isUp = q.change >= 0;
            const meta = marketDataService.getMetadata(q.ticker);
            return (
              <button
                key={`${q.ticker}-${idx}`}
                onClick={() => setSelectedStockModal(q.ticker)}
                className="flex items-center gap-2 hover:bg-[#1a1a1a] px-4 py-0.5 transition-colors text-left shrink-0"
              >
                {meta?.logo && (
                  <img
                    src={meta.logo}
                    alt={q.ticker}
                    className="w-3.5 h-3.5 rounded-full object-cover bg-white/10 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                )}
                <span className="font-bold text-gray-200 hover:text-blue-400  shrink-0">{q.ticker}</span>
                <span className="text-gray-300  shrink-0">
                  {settings.currencySymbol}
                  {q.price.toFixed(2)}
                </span>
                <span
                  className={`flex items-center gap-0.5 font-bold text-[11px] shrink-0 ${
                    isUp ? 'text-emerald-400' : 'text-rose-500'
                  }`}
                >
                  {isUp ? <TrendingUp className="w-3 h-3 shrink-0" /> : <TrendingDown className="w-3 h-3 shrink-0" />}
                  {isUp ? '+' : ''}
                  {q.changePercent.toFixed(2)}%
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
