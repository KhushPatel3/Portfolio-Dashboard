import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { AllocationNode } from '../../types';
import { ChevronRight, Layers, PieChart as PieIcon, ArrowLeft, RefreshCcw, ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export const AllocationPage: React.FC = () => {
  const { allocationTree, summary, setSelectedStockModal, overlapAnalysis, settings } = usePortfolio();

  // Navigation path stack for hierarchy drill-down
  const [path, setPath] = useState<AllocationNode[]>([allocationTree]);

  const currentNode = path[path.length - 1];

  const handleDrillDown = (node: AllocationNode) => {
    if (node.ticker) {
      // Stock level clicked
      setSelectedStockModal(node.ticker);
      return;
    }
    if (node.children && node.children.length > 0) {
      setPath((prev) => [...prev, node]);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    setPath((prev) => prev.slice(0, index + 1));
  };

  const handleReset = () => {
    setPath([allocationTree]);
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b', '#f97316'];

  const chartData = (currentNode.children || []).map((c) => ({
    name: c.name,
    value: c.value,
    percentage: c.percentage,
    node: c,
  }));

  return (
    <div className="space-y-6  text-slate-100 pb-12">
      {/* Title Bar */}
      <div className="p-4 bg-[#141824] border border-[#212738] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            INTERACTIVE ALLOCATION DRILL-DOWN & OVERLAP ANALYSIS
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Drill down: Portfolio → Region → Sector → Sub-Sector / Industry → Position
          </p>
        </div>

        {path.length > 1 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1f273b] hover:bg-[#28324a] text-xs font-bold text-slate-300 transition-colors self-start md:self-auto"
          >
            <RefreshCcw className="w-3.5 h-3.5 text-blue-400" />
            <span>RESET TOP-LEVEL VIEW</span>
          </button>
        )}
      </div>

      {/* Breadcrumb Navigation Trail */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-[#141824] border border-[#212738] rounded-xl text-xs ">
        <span className="text-slate-500 uppercase font-bold text-[10px]">CURRENT PATH:</span>
        {path.map((node, index) => {
          const isLast = index === path.length - 1;
          return (
            <React.Fragment key={index}>
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className={`px-2.5 py-1 rounded transition-colors font-bold ${
                  isLast
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-[#1e2638] text-slate-300 hover:text-white hover:bg-[#28334b]'
                }`}
              >
                {node.name}
              </button>
              {!isLast && <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Main Grid: Interactive Donut Chart + Sub-Category Drill List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Donut Chart */}
        <div className="p-5 bg-[#141824] border border-[#212738] rounded-xl space-y-4 flex flex-col justify-between">
          <div className="border-b border-[#212738] pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                {currentNode.name} Breakdown
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Valuation: {settings.currencySymbol}{currentNode.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <span className="text-[10px] bg-blue-500/10 border border-blue-500/30 text-blue-400 px-2 py-0.5 rounded font-bold">
              CLICK SLICE TO DRILL DOWN
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  onClick={(entry: any) => handleDrillDown(entry.node)}
                  className="cursor-pointer"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${settings.currencySymbol}${Number(val).toFixed(2)}`, 'Allocation']}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-[11px] text-slate-300 ">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Drill-Down Node Selector Cards */}
        <div className="p-5 bg-[#141824] border border-[#212738] rounded-xl space-y-3">
          <div className="border-b border-[#212738] pb-3 flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Sub-Sectors & Holdings ({currentNode.children?.length || 0})
            </h3>
            {path.length > 1 && (
              <button
                onClick={() => setPath((prev) => prev.slice(0, prev.length - 1))}
                className="flex items-center gap-1 text-xs text-blue-400 hover:underline font-bold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Step Back
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto no-scrollbar pr-1">
            {(!currentNode.children || currentNode.children.length === 0) ? (
              <div className="text-center py-10">
                <PieIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-bold">Deepest node level reached.</p>
                <p className="text-[11px] text-slate-500 mt-1">This position represents an individual asset.</p>
              </div>
            ) : (
              currentNode.children.map((child, index) => {
                const isClickable = (child.children && child.children.length > 0) || child.ticker;
                const percent = summary.portfolioValue > 0 ? (child.value / summary.portfolioValue) * 100 : 0;

                return (
                  <div
                    key={child.name}
                    onClick={() => handleDrillDown(child)}
                    className={`p-3 rounded-lg border transition-all flex items-center justify-between text-xs ${
                      isClickable
                        ? 'bg-[#181f30] hover:bg-[#202940] border-[#252f45] cursor-pointer hover:border-blue-500/50'
                        : 'bg-[#141824] border-[#212738]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div>
                        <span className="font-bold text-white">{child.name}</span>
                        {child.itemCount && (
                          <span className="text-[10px] text-slate-400 block">
                            {child.itemCount} sub-item(s)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-slate-100">
                        {settings.currencySymbol}{child.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <p className="text-[10px] text-emerald-400 font-bold">{percent.toFixed(2)}%</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* PORTFOLIO OVERLAP ANALYSIS SECTION */}
      <div className="p-5 bg-[#141824] border border-[#212738] rounded-xl space-y-4">
        <div className="border-b border-[#212738] pb-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                PORTFOLIO OVERLAP & DUPLICATION ANALYSIS
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Detects identical stocks held directly and indirectly inside ETF index holdings
              </p>
            </div>
          </div>
          <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400 text-xs font-bold self-start md:self-auto">
            {overlapAnalysis.duplicationWarningText}
          </div>
        </div>

        {/* Overlap Summary Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-[#181e2e] border border-[#283248] rounded-lg">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Overlapping Assets</span>
            <span className="text-lg font-bold text-amber-400">{overlapAnalysis.totalOverlappingAssetsCount} Ticker(s)</span>
          </div>
          <div className="p-3 bg-[#181e2e] border border-[#283248] rounded-lg">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Total ETF Allocation</span>
            <span className="text-lg font-bold text-blue-400">{overlapAnalysis.totalDirectEtfWeight.toFixed(2)}%</span>
          </div>
          <div className="p-3 bg-[#181e2e] border border-[#283248] rounded-lg">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Concentration Risk</span>
            <span className="text-lg font-bold text-emerald-400">
              {overlapAnalysis.topOverlappingHoldings.some(o => o.overlapStatus === 'HIGH') ? 'MODERATE-HIGH' : 'OPTIMAL'}
            </span>
          </div>
        </div>

        {/* Detailed Overlap Table */}
        {overlapAnalysis.topOverlappingHoldings.length === 0 ? (
          <div className="p-4 bg-[#181e2e] border border-[#283248] rounded-lg text-xs text-slate-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>No critical stock duplication detected between direct equity positions and ETF holdings.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs ">
              <thead className="bg-[#181e2e] text-slate-400 text-[10px] uppercase border-b border-[#283248]">
                <tr>
                  <th className="py-2.5 px-3">Ticker / Asset</th>
                  <th className="py-2.5 px-3">Direct Weight</th>
                  <th className="py-2.5 px-3">Indirect ETF Weight</th>
                  <th className="py-2.5 px-3">Combined Exposure</th>
                  <th className="py-2.5 px-3">ETF Sources</th>
                  <th className="py-2.5 px-3">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#212738]">
                {overlapAnalysis.topOverlappingHoldings.map((item) => (
                  <tr key={item.ticker} className="hover:bg-[#1c2438] transition-colors">
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => setSelectedStockModal(item.ticker)}
                        className="font-bold text-blue-400 hover:underline"
                      >
                        {item.ticker}
                      </button>
                      <span className="text-[10px] text-slate-400 block">{item.companyName}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-200 font-bold">
                      {item.directWeightInPortfolio.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-amber-400 font-bold">
                      +{item.indirectWeightFromEtfs.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold text-sm">
                      {item.totalCombinedExposure.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-[10px] text-slate-300">
                      {item.etfSources.map((s) => `${s.etfTicker} (${(s.weightContribution).toFixed(1)}%)`).join(', ')}
                    </td>
                    <td className="py-2.5 px-3">
                      {item.overlapStatus === 'HIGH' ? (
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" /> HIGH DUP
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 w-fit">
                          MODERATE
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
