import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Holding } from '../../types';
import { CompanyLogo } from '../common/CompanyLogo';
import {
  Scale,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Plus,
  Minus,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  PieChart,
} from 'lucide-react';

export const RebalancingCalculator: React.FC = () => {
  const { holdings, summary, quotes, settings, addTransaction } = usePortfolio();

  const [cashInjection, setCashInjection] = useState<number>(1000);
  const [targetWeights, setTargetWeights] = useState<Record<string, number>>({});
  const [tradeSuccessMsg, setTradeSuccessMsg] = useState<string | null>(null);

  // Initialize equal target weights on load
  useEffect(() => {
    if (holdings.length > 0) {
      const equalWeight = Number((100 / holdings.length).toFixed(1));
      const initial: Record<string, number> = {};
      holdings.forEach((h) => {
        initial[h.ticker] = equalWeight;
      });
      setTargetWeights(initial);
    }
  }, [holdings]);

  const handleTargetWeightChange = (ticker: string, val: number) => {
    setTargetWeights((prev) => ({
      ...prev,
      [ticker]: Math.max(0, Math.min(100, val)),
    }));
  };

  const applyEqualWeights = () => {
    if (holdings.length === 0) return;
    const equalWeight = Number((100 / holdings.length).toFixed(1));
    const updated: Record<string, number> = {};
    holdings.forEach((h) => {
      updated[h.ticker] = equalWeight;
    });
    setTargetWeights(updated);
  };

  const applyCurrentWeights = () => {
    const updated: Record<string, number> = {};
    holdings.forEach((h) => {
      const weight = summary.portfolioValue > 0 ? (h.marketValue / summary.portfolioValue) * 100 : 0;
      updated[h.ticker] = Number(weight.toFixed(1));
    });
    setTargetWeights(updated);
  };

  const totalTargetWeight = Object.values(targetWeights).reduce((a: number, b: number) => a + b, 0);
  const totalPoolValue = summary.portfolioValue + Math.max(0, cashInjection);

  const rebalancePlan = holdings.map((h) => {
    const targetPct = targetWeights[h.ticker] || 0;
    const targetValue = totalPoolValue * (targetPct / 100);
    const driftValue = targetValue - h.marketValue;
    const currentPrice = quotes[h.ticker]?.price || h.currentPrice || 100;
    const sharesChange = currentPrice > 0 ? driftValue / currentPrice : 0;

    let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    if (driftValue > 5) action = 'BUY';
    else if (driftValue < -5) action = 'SELL';

    const currentWeight = summary.portfolioValue > 0 ? (h.marketValue / summary.portfolioValue) * 100 : 0;
    return {
      ticker: h.ticker,
      companyName: h.companyName,
      currentValue: h.marketValue,
      currentWeight: currentWeight,
      targetWeight: targetPct,
      targetValue,
      driftValue,
      sharesChange: Math.abs(sharesChange),
      currentPrice,
      action,
    };
  });

  const totalBuyDollar = rebalancePlan
    .filter((p) => p.action === 'BUY')
    .reduce((sum, p) => sum + p.driftValue, 0);

  const totalSellDollar = rebalancePlan
    .filter((p) => p.action === 'SELL')
    .reduce((sum, p) => sum + Math.abs(p.driftValue), 0);

  const handleExecuteRebalanceTrades = () => {
    const today = new Date().toISOString().split('T')[0];
    let executedCount = 0;

    rebalancePlan.forEach((plan) => {
      if (plan.action !== 'HOLD' && plan.sharesChange > 0.0001) {
        addTransaction({
          ticker: plan.ticker,
          type: plan.action === 'BUY' ? 'BUY' : 'SELL',
          quantity: Number(plan.sharesChange.toFixed(4)),
          price: Number(plan.currentPrice.toFixed(2)),
          currency: settings.baseCurrency,
          fee: 0,
          date: today,
          note: `Auto-rebalancing target trade (${plan.targetWeight}% target)`,
        });
        executedCount++;
      }
    });

    setTradeSuccessMsg(`Successfully recorded ${executedCount} rebalancing transactions to transaction log!`);
    setTimeout(() => setTradeSuccessMsg(null), 5000);
  };

  return (
    <div className="bg-[#121622] border border-[#262f42] rounded-xl p-6  space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#262f42] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider">
              Portfolio Rebalancing Calculator
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Set target percentage allocations and new cash to generate optimal buy/sell trade instructions
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold">Presets:</span>
          <button
            onClick={applyEqualWeights}
            className="px-2.5 py-1 rounded bg-[#1c2233] hover:bg-[#262f42] border border-[#2d3850] text-slate-300 hover:text-amber-300 transition-colors"
          >
            Equal Weights
          </button>
          <button
            onClick={applyCurrentWeights}
            className="px-2.5 py-1 rounded bg-[#1c2233] hover:bg-[#262f42] border border-[#2d3850] text-slate-300 hover:text-cyan-300 transition-colors"
          >
            Lock Current
          </button>
        </div>
      </div>

      {/* Control Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        {/* Total Portfolio Value */}
        <div className="p-3.5 rounded-lg bg-[#171c2b] border border-[#262f42]">
          <div className="text-slate-400 text-[11px] uppercase font-bold">Current Portfolio</div>
          <div className="text-lg font-bold text-slate-100 mt-1">
            {settings.currencySymbol}
            {summary.portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* New Cash Input */}
        <div className="p-3.5 rounded-lg bg-[#171c2b] border border-[#262f42]">
          <label className="text-amber-400 text-[11px] uppercase font-bold flex items-center justify-between">
            <span>Fresh Cash Injection</span>
            <DollarSign className="w-3.5 h-3.5" />
          </label>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-slate-400 font-bold">{settings.currencySymbol}</span>
            <input
              type="number"
              value={cashInjection}
              onChange={(e) => setCashInjection(Number(e.target.value))}
              placeholder="0"
              className="w-full bg-[#0e121e] border border-[#262f42] rounded px-2 py-1 text-sm text-slate-100 font-bold focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        {/* Rebalance Pool Total */}
        <div className="p-3.5 rounded-lg bg-[#171c2b] border border-[#262f42]">
          <div className="text-slate-400 text-[11px] uppercase font-bold">Target Rebalance Pool</div>
          <div className="text-lg font-bold text-amber-400 mt-1">
            {settings.currencySymbol}
            {totalPoolValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Target Weight Sum Indicator */}
        <div className="p-3.5 rounded-lg bg-[#171c2b] border border-[#262f42]">
          <div className="text-slate-400 text-[11px] uppercase font-bold">Total Target Weight</div>
          <div
            className={`text-lg font-bold mt-1 ${
              Math.abs(totalTargetWeight - 100) < 0.5 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {totalTargetWeight.toFixed(1)}% / 100%
          </div>
          {Math.abs(totalTargetWeight - 100) >= 0.5 && (
            <div className="text-[10px] text-rose-400 mt-0.5">
              Warning: Sum should equal 100%
            </div>
          )}
        </div>
      </div>

      {/* Success Banner */}
      {tradeSuccessMsg && (
        <div className="p-3.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-bold">{tradeSuccessMsg}</span>
        </div>
      )}

      {/* Rebalancing Matrix Table */}
      <div className="overflow-x-auto border border-[#262f42] rounded-lg">
        <table className="w-full text-xs text-left text-slate-300">
          <thead className="bg-[#171c2b] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#262f42]">
            <tr>
              <th className="px-4 py-3">Asset</th>
              <th className="px-4 py-3 text-right">Current Value</th>
              <th className="px-4 py-3 text-right">Current %</th>
              <th className="px-4 py-3 text-center">Target %</th>
              <th className="px-4 py-3 text-right">Target Value</th>
              <th className="px-4 py-3 text-center">Action</th>
              <th className="px-4 py-3 text-right">Suggested Trade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2638] bg-[#0e121e]">
            {rebalancePlan.map((plan) => (
              <tr key={plan.ticker} className="hover:bg-[#151b2a] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <CompanyLogo ticker={plan.ticker} size="sm" />
                    <div>
                      <div className="font-bold text-slate-100">{plan.ticker}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                        {plan.companyName}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3 text-right font-bold text-slate-200">
                  {settings.currencySymbol}
                  {plan.currentValue.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>

                <td className="px-4 py-3 text-right font-bold text-slate-400">
                  {plan.currentWeight.toFixed(1)}%
                </td>

                <td className="px-4 py-3 text-center">
                  <div className="inline-flex items-center gap-1 bg-[#171c2b] border border-[#262f42] rounded px-2 py-0.5">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={targetWeights[plan.ticker] ?? 0}
                      onChange={(e) => handleTargetWeightChange(plan.ticker, Number(e.target.value))}
                      className="w-12 bg-transparent text-center font-bold text-amber-300 focus:outline-none"
                    />
                    <span className="text-slate-500">%</span>
                  </div>
                </td>

                <td className="px-4 py-3 text-right font-bold text-amber-400">
                  {settings.currencySymbol}
                  {plan.targetValue.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>

                <td className="px-4 py-3 text-center">
                  {plan.action === 'BUY' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      <Plus className="w-3 h-3" /> BUY
                    </span>
                  ) : plan.action === 'SELL' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                      <Minus className="w-3 h-3" /> SELL
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
                      BALANCED
                    </span>
                  )}
                </td>

                <td className="px-4 py-3 text-right font-bold">
                  {plan.action === 'BUY' ? (
                    <span className="text-emerald-400">
                      +{plan.sharesChange.toFixed(3)} shares ({settings.currencySymbol}
                      {plan.driftValue.toFixed(2)})
                    </span>
                  ) : plan.action === 'SELL' ? (
                    <span className="text-rose-400">
                      -{plan.sharesChange.toFixed(3)} shares (-{settings.currencySymbol}
                      {Math.abs(plan.driftValue).toFixed(2)})
                    </span>
                  ) : (
                    <span className="text-slate-500">$0.00</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Execute Rebalance Trades Footer Action */}
      <div className="p-4 rounded-lg bg-[#171c2b] border border-[#262f42] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs space-y-0.5">
          <div className="font-bold text-slate-200">
            Total Buy Volume:{' '}
            <span className="text-emerald-400">
              {settings.currencySymbol}
              {totalBuyDollar.toFixed(2)}
            </span>{' '}
            | Total Sell Volume:{' '}
            <span className="text-rose-400">
              {settings.currencySymbol}
              {totalSellDollar.toFixed(2)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Clicking execute will create and save rebalance transactions automatically to your transactions log.
          </p>
        </div>

        <button
          onClick={handleExecuteRebalanceTrades}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs transition-colors shadow-lg shadow-amber-900/20 shrink-0 uppercase tracking-wider"
        >
          <Sparkles className="w-4 h-4" />
          <span>Execute Rebalance Plan</span>
        </button>
      </div>
    </div>
  );
};
