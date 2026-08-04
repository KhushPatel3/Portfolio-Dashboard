import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePortfolio } from '../../context/PortfolioContext';
import {
  Sparkles,
  Search,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  BarChart2,
  X,
  Globe,
  Newspaper,
  Calendar,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import Markdown from 'react-markdown';

interface AiMarketIntelModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTicker?: string;
}

export const AiMarketIntelModal: React.FC<AiMarketIntelModalProps> = ({
  isOpen,
  onClose,
  defaultTicker,
}) => {
  const { holdings } = usePortfolio();

  const [query, setQuery] = useState(defaultTicker ? `${defaultTicker} stock earnings and market outlook` : '');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [sources, setSources] = useState<{ title: string; url: string }[]>([]);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);

  const fetchInsights = async (customQuery?: string) => {
    setLoading(true);
    setError(null);

    const holdingsList = holdings.map((h) => `${h.ticker} (${h.companyName})`).join(', ');
    const activeQuery = customQuery !== undefined ? customQuery : query;

    try {
      const res = await fetch('/api/market-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: activeQuery,
          holdingsList,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.details || data.error || 'Failed to generate market insights.');
      }

      setAnalysis(data.analysis);
      setSources(data.sources || []);
      setSearchQueries(data.searchQueries || []);
      setTimestamp(new Date(data.timestamp).toLocaleTimeString());
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Error connecting to Gemini Grounded Search API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !analysis && !loading) {
      fetchInsights();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-[#121622] border border-[#262f42] rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono text-slate-100"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#171c2b] border-b border-[#262f42] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-100 tracking-wider uppercase">
                  Real-Time AI Market Intelligence
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                  Google Search Grounded
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live Macro Drivers, Earnings Call Analysis, Market Factors & Forecasts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#262f42] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Custom Inquiry Bar */}
        <div className="p-4 bg-[#141926] border-b border-[#262f42]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchInsights();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask specific market inquiry e.g., 'Why did NVDA jump?', 'Fed interest rate cuts & S&P 500 impact'..."
                className="w-full bg-[#0d101a] border border-[#262f42] rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors disabled:opacity-50 shrink-0 shadow-lg shadow-emerald-900/30"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching Web...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze Market</span>
                </>
              )}
            </button>
          </form>

          {/* Preset Prompts */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-[11px]">
            <span className="text-slate-500 font-semibold">Quick Prompts:</span>
            {[
              'Current Market Performance & Drivers',
              'Tech Sector & AI Earnings Highlights',
              'Federal Reserve Rate Cut Impact',
              'NVDA & Semiconductor Outlook',
            ].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setQuery(preset);
                  fetchInsights(preset);
                }}
                className="px-2.5 py-1 rounded bg-[#1c2233] hover:bg-[#262f42] border border-[#2d3850] text-slate-300 hover:text-emerald-300 transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 no-scrollbar bg-[#0f131d]">
          {loading && (
            <div className="py-20 text-center space-y-4">
              <div className="inline-flex p-4 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
                <Globe className="w-8 h-8 animate-spin" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-200">
                  Grounding Live Search Data via Gemini AI...
                </p>
                <p className="text-xs text-slate-400">
                  Parsing real-time news, financial reports, earnings transcripts, and indices momentum.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Market Intelligence Error:</span>
                <p className="mt-1 text-slate-300">{error}</p>
                <p className="mt-2 text-[11px] text-slate-400">
                  Ensure GEMINI_API_KEY is configured in AI Studio Secrets menu.
                </p>
              </div>
            </div>
          )}

          {!loading && !error && analysis && (
            <div className="space-y-6">
              {/* Meta strip */}
              {timestamp && (
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-[#262f42] pb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Report Generated at {timestamp}</span>
                  </div>
                  {searchQueries.length > 0 && (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Newspaper className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Search Queries: {searchQueries.join(', ')}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Main Analysis Markdown */}
              <div className="prose prose-invert max-w-none text-xs leading-relaxed text-slate-200 space-y-4">
                <Markdown>{analysis}</Markdown>
              </div>

              {/* Grounded Sources */}
              {sources.length > 0 && (
                <div className="p-4 rounded-lg bg-[#141926] border border-[#262f42] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>Live Grounding Sources & Citations ({sources.length})</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2.5 rounded bg-[#1a2030] hover:bg-[#232b40] border border-[#2d3850] text-slate-300 hover:text-emerald-300 transition-colors text-xs group"
                      >
                        <span className="truncate pr-2 font-medium">{src.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
