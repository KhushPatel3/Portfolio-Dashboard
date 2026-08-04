import React, { useState } from 'react';
import { motion } from 'motion/react';
import { usePortfolio } from '../../context/PortfolioContext';
import { marketDataService } from '../../services/marketData';
import { TimeFrame } from '../../types';
import { X, TrendingUp, TrendingDown, Building2, Target, Lightbulb, AlertTriangle, Award, Scale, Check } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface StockDetailModalProps {
  ticker: string | null;
  onClose: () => void;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({ ticker, onClose }) => {
  const { quotes, holdings, transactions, settings } = usePortfolio();

  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>('1M');
  const [enableComparison, setEnableComparison] = useState<boolean>(false);
  const [comparisonTicker, setComparisonTicker] = useState<string>('S&P 500 (^GSPC)');

  if (!ticker) return null;

  const quote = quotes[ticker] || {
    ticker,
    price: 150,
    change: 2.5,
    changePercent: 1.69,
    previousClose: 147.5,
    dayHigh: 152,
    dayLow: 146.5,
    volume: 12000000,
    lastUpdated: new Date().toISOString(),
  };

  const meta = marketDataService.getMetadata(ticker);
  const holding = holdings.find((h) => h.ticker === ticker);
  const stockTx = transactions.filter((t) => t.ticker === ticker);

  // Generate timeframe chart data dynamically
  const historicalData = marketDataService.getHistoricalDataForTimeFrame(ticker, selectedTimeframe);
  const comparisonData = marketDataService.getComparisonHistoricalData(
    ticker,
    comparisonTicker,
    selectedTimeframe
  );
  const outlook = marketDataService.getFutureOutlook(ticker);

  const isUp = quote.change >= 0;

  const timeframesList: TimeFrame[] = ['1D', '5D', '1M', '6M', '1Y', 'YTD', '3Y', '5Y', 'MAX'];
  const comparisonOptions = [
    { label: 'S&P 500 (^GSPC)', symbol: 'S&P 500' },
    { label: 'NASDAQ Composite (^IXIC)', symbol: 'NASDAQ' },
    { label: 'NZX 50 Index (^NZ50)', symbol: 'NZX 50' },
    { label: 'ASX 200 Index (^AXJO)', symbol: 'ASX 200' },
    { label: 'Apple Inc (AAPL)', symbol: 'AAPL' },
    { label: 'Tesla Inc (TSLA)', symbol: 'TSLA' },
    { label: 'Microsoft (MSFT)', symbol: 'MSFT' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="bg-[#121622] border border-[#262f42] rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl  text-slate-100 no-scrollbar"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#171c2b] border-b border-[#262f42] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <img
              src={meta.logo}
              alt={meta.name}
              className="w-10 h-10 rounded-lg object-contain bg-white/10 p-1 border border-slate-700 shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  `https://assets.parqet.com/logos/symbol/${ticker}?format=png`;
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{meta.name}</h2>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-xs border border-blue-500/30">
                  {meta.ticker}
                </span>
                <span className="text-xs text-slate-400">{meta.exchange}</span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{meta.sector}</span>
                <span>•</span>
                <span>{meta.industry}</span>
                <span>•</span>
                <span>{meta.country}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#232b3e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Price & Key Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-[#171c2b] rounded-lg border border-[#262f42]">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Live Market Price</span>
              <div className="text-xl font-bold text-slate-100 mt-0.5">
                {settings.currencySymbol}
                {quote.price.toFixed(2)}
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-bold mt-0.5 ${
                  isUp ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>
                  {isUp ? '+' : ''}
                  {quote.change.toFixed(2)} ({isUp ? '+' : ''}
                  {quote.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">52-Wk Range</span>
              <div className="text-xs font-bold text-slate-200 mt-1">
                ${meta.fiftyTwoWeekLow || (quote.price * 0.7).toFixed(2)} - ${meta.fiftyTwoWeekHigh || (quote.price * 1.3).toFixed(2)}
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: '68%' }}
                />
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Dividend Yield</span>
              <div className="text-sm font-bold text-amber-400 mt-1">
                {meta.dividendYield ? `${meta.dividendYield.toFixed(2)}%` : 'N/A'}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">{meta.dividendFrequency || 'None'}</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Market Cap</span>
              <div className="text-sm font-bold text-slate-200 mt-1">
                {meta.marketCap ? `$${(meta.marketCap / 1e9).toFixed(1)}B` : 'N/A'}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">P/E Ratio: {meta.peRatio || 'N/A'}</p>
            </div>
          </div>

          {/* Price Performance Chart with 9 Timeframes & Comparison Toggle */}
          <div className="p-4 bg-[#171c2b] rounded-lg border border-[#262f42] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#262f42] pb-3">
              <div className="flex items-center gap-3">
                <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wider">
                  Price Performance ({selectedTimeframe})
                </h3>

                {/* Comparison Mode Toggle */}
                <button
                  onClick={() => setEnableComparison(!enableComparison)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all border ${
                    enableComparison
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      : 'bg-[#121622] border-[#262f42] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>{enableComparison ? 'Comparison Active' : 'Compare Asset'}</span>
                </button>

                {enableComparison && (
                  <select
                    value={comparisonTicker}
                    onChange={(e) => setComparisonTicker(e.target.value)}
                    className="bg-[#121622] border border-amber-500/40 rounded px-2 py-1 text-xs text-amber-300 font-bold focus:outline-none cursor-pointer"
                  >
                    {comparisonOptions.map((opt) => (
                      <option key={opt.symbol} value={opt.label}>
                        vs {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Timeframe selector tabs */}
              <div className="flex flex-wrap items-center gap-1 bg-[#121622] p-1 rounded-lg border border-[#262f42]">
                {timeframesList.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                      selectedTimeframe === tf
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a2133]'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {enableComparison ? (
                  <LineChart data={comparisonData}>
                    <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} />
                    <YAxis
                      stroke="#475569"
                      fontSize={10}
                      tickLine={false}
                      unit="%"
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px' }}
                      labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
                      formatter={(val: any) => [`${Number(val).toFixed(2)}%`, '']}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line
                      type="monotone"
                      dataKey={ticker}
                      name={`${ticker} Return (%)`}
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="comparison"
                      name={`${comparisonTicker.split(' ')[0]} Return (%)`}
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </LineChart>
                ) : (
                  <AreaChart data={historicalData}>
                    <defs>
                      <linearGradient id="stockChartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isUp ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={isUp ? '#10b981' : '#ef4444'} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={10} domain={['auto', 'auto']} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px' }}
                      labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={isUp ? '#10b981' : '#ef4444'}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#stockChartGrad)"
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* FUTURE OUTLOOK & INVESTMENT DECISION SECTION */}
          <div className="p-5 bg-[#171c2b] border border-[#262f42] rounded-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#262f42] pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  FUTURE OUTLOOK & INVESTMENT ANALYSIS
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold uppercase">
                CONSENSUS: {outlook.consensus.toUpperCase()}
              </span>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#121622] rounded border border-[#262f42]">
                <span className="text-slate-400 text-[10px] uppercase block">12-Month Price Target</span>
                <span className="text-base font-bold text-white mt-0.5 block">${outlook.targetPrice.toFixed(2)}</span>
                <span className="text-emerald-400 font-bold text-[10px]">+{outlook.upsidePercent.toFixed(1)}% Implied Upside</span>
              </div>
              <div className="p-3 bg-[#121622] rounded border border-[#262f42]">
                <span className="text-slate-400 text-[10px] uppercase block">3-Year Projected CAGR</span>
                <span className="text-base font-bold text-blue-400 mt-0.5 block">+{outlook.growthForecast3YPct.toFixed(1)}% / yr</span>
                <span className="text-slate-400 text-[10px]">Analyst Compound Growth</span>
              </div>
              <div className="p-3 bg-[#121622] rounded border border-[#262f42]">
                <span className="text-slate-400 text-[10px] uppercase block">Analyst Rating Score</span>
                <span className="text-base font-bold text-amber-400 mt-0.5 block">{outlook.ratingScore} / 5.0</span>
                <span className="text-slate-400 text-[10px]">Market Sentiment: {outlook.sentiment}</span>
              </div>
            </div>

            {/* Investment Verdict Box */}
            <div className="p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs space-y-1">
              <span className="font-bold text-blue-400 flex items-center gap-1.5 uppercase text-[11px]">
                <Award className="w-4 h-4" /> AI Terminal Investment Verdict
              </span>
              <p className="text-slate-200 leading-relaxed font-sans text-xs">
                {outlook.verdict}
              </p>
            </div>

            {/* Catalysts & Risks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-[#121622] rounded border border-[#262f42] space-y-2">
                <span className="text-emerald-400 font-bold uppercase text-[11px] flex items-center gap-1">
                  <Lightbulb className="w-4 h-4" /> Growth Catalysts
                </span>
                <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                  {outlook.catalysts.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-[#121622] rounded border border-[#262f42] space-y-2">
                <span className="text-rose-400 font-bold uppercase text-[11px] flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> Risk Factors
                </span>
                <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                  {outlook.riskFactors.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* My Position Stats in this Stock */}
          {holding ? (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h3 className="text-xs font-bold uppercase text-blue-400 mb-3 tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Your Current Position Summary
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs ">
                <div>
                  <span className="text-slate-400">Shares Owned</span>
                  <p className="text-sm font-bold text-white mt-0.5">{holding.shares.toFixed(4)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Avg Cost</span>
                  <p className="text-sm font-bold text-white mt-0.5">${holding.avgCost.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Market Value</span>
                  <p className="text-sm font-bold text-white mt-0.5">${holding.marketValue.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Gain / Loss</span>
                  <p
                    className={`text-sm font-bold mt-0.5 ${
                      holding.unrealizedGain >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {holding.unrealizedGain >= 0 ? '+' : ''}${holding.unrealizedGain.toFixed(2)} (
                    {holding.unrealizedGainPercent.toFixed(2)}%)
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-[#171c2b] border border-[#262f42] rounded text-xs text-slate-400 text-center">
              You do not currently hold direct shares in this security.
            </div>
          )}

          {/* Transaction History for this stock */}
          <div className="p-4 bg-[#171c2b] rounded-lg border border-[#262f42]">
            <h3 className="text-xs font-bold uppercase text-slate-300 mb-3 tracking-wider">
              Transaction Log ({stockTx.length})
            </h3>
            {stockTx.length === 0 ? (
              <p className="text-xs text-slate-500">No recorded transactions for this asset.</p>
            ) : (
              <div className="space-y-2">
                {stockTx.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-2.5 bg-[#121622] rounded border border-[#222a3e] text-xs "
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 rounded font-bold uppercase ${
                          tx.type === 'BUY'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {tx.type}
                      </span>
                      <div>
                        <span className="font-bold text-white">
                          {tx.quantity} shares @ {tx.currency} {tx.price.toFixed(2)}
                        </span>
                        <p className="text-[10px] text-slate-400">{tx.date} • Fee: ${tx.tradingFee + tx.fxFee}</p>
                      </div>
                    </div>
                    <div className="text-right font-bold text-slate-200">
                      ${(tx.quantity * tx.price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
