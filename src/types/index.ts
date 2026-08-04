export type TransactionType = 'BUY' | 'SELL';

export interface Transaction {
  id: string;
  ticker: string;
  type: TransactionType;
  quantity: number;
  price: number; // in transaction currency
  currency: string;
  date: string; // YYYY-MM-DD
  tradingFee: number;
  fxFee: number;
  notes?: string;
  broker?: string;
}

export interface StockMetadata {
  ticker: string;
  name: string;
  logo: string;
  currency: string;
  exchange: string;
  country: string;
  region: string;
  sector: string;
  industry: string;
  assetType: 'Stock' | 'ETF' | 'REIT' | 'Crypto' | 'Bond';
  peRatio?: number;
  marketCap?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  dividendYield?: number; // annual percentage e.g. 2.5
  dividendFrequency?: 'Quarterly' | 'Monthly' | 'Semi-Annual' | 'Annual';
  nextExDividendDate?: string;
  nextPaymentDate?: string;
  dividendPerShare?: number;
}

export type TimeFrame = '1D' | '5D' | '1M' | '6M' | '1Y' | 'YTD' | '3Y' | '5Y' | 'MAX';

export interface FutureOutlook {
  ticker: string;
  targetPrice: number;
  upsidePercent: number;
  consensus: 'Strong Buy' | 'Buy' | 'Hold' | 'Underperform' | 'Sell';
  ratingScore: number; // 1 to 5
  growthForecast3YPct: number; // Annual revenue/earnings CAGR forecast
  verdict: string; // Actionable recommendation e.g. "Excellent DCA candidate on dips"
  catalysts: string[];
  riskFactors: string[];
  sentiment: 'Bullish' | 'Neutral' | 'Bearish';
}

export interface EtfConstituent {
  ticker: string;
  companyName: string;
  weightInEtf: number; // e.g. 6.8%
}

export interface OverlappingHolding {
  ticker: string;
  companyName: string;
  directWeightInPortfolio: number; // e.g. 12%
  indirectWeightFromEtfs: number; // e.g. 1.8%
  totalCombinedExposure: number; // e.g. 13.8%
  etfSources: { etfTicker: string; weightContribution: number }[];
  overlapStatus: 'HIGH' | 'MODERATE' | 'LOW';
}

export interface OverlapAnalysis {
  totalOverlappingAssetsCount: number;
  totalDirectEtfWeight: number;
  topOverlappingHoldings: OverlappingHolding[];
  duplicationWarningText: string;
}

export interface Quote {
  ticker: string;
  price: number;
  change: number; // $ change today
  changePercent: number; // % change today
  previousClose: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  lastUpdated: string;
}

export interface Holding {
  ticker: string;
  companyName: string;
  logo: string;
  assetType: 'Stock' | 'ETF' | 'REIT' | 'Crypto' | 'Bond';
  shares: number;
  avgCost: number;
  totalCost: number; // including fees or cost basis
  currentPrice: number;
  marketValue: number;
  unrealizedGain: number;
  unrealizedGainPercent: number;
  todayChange: number;
  todayChangePercent: number;
  dividendYield: number;
  annualDividendIncome: number;
  yieldOnCost: number;
  country: string;
  region: string;
  sector: string;
  industry: string;
  currency: string;
  exchange: string;
  portfolioWeight: number; // percentage e.g. 15.4
  realizedGain: number;
  tradingFeesPaid: number;
  fxFeesPaid: number;
}

export interface PortfolioSummary {
  portfolioValue: number;
  totalInvestedCapital: number;
  cashInvested: number;
  totalFeesPaid: number;
  tradingFeesPaid: number;
  fxFeesPaid: number;
  totalReturnDollars: number;
  totalReturnPercent: number;
  todayGainDollars: number;
  todayGainPercent: number;
  dividendIncomeTotal: number;
  annualDividendForecast: number;
  portfolioYield: number;
  bestPerformer?: Holding;
  worstPerformer?: Holding;
  totalHoldingsCount: number;
  realizedGainTotal: number;
  unrealizedGainTotal: number;
}

export interface PerformanceMetrics {
  investedCapital: number;
  currentValue: number;
  priceGain: number;
  dividendGain: number;
  realizedGain: number;
  unrealizedGain: number;
  totalFees: number;
  netReturnDollars: number;
  totalReturnPercent: number;
  moneyWeightedReturn: number; // MWR / IRR %
  timeWeightedReturn: number; // TWR %
  cagr: number; // Compound Annual Growth Rate %
  sharpeRatio: number;
  maxDrawdownPercent: number;
  volatilityPercent: number;
  beta: number;
}

export interface DividendEvent {
  id: string;
  ticker: string;
  companyName: string;
  logo: string;
  exDate: string;
  paymentDate: string;
  amountPerShare: number;
  sharesOwned: number;
  totalAmount: number;
  status: 'UPCOMING' | 'PAID' | 'PROJECTED';
  yield: number;
  type: string;
}

export interface AllocationNode {
  name: string;
  value: number;
  percentage: number;
  children?: AllocationNode[];
  ticker?: string;
  itemCount?: number;
}

export interface AnalyticsData {
  diversificationScore: number; // 0-100
  largestPositionPercent: number;
  largestPositionTicker: string;
  top5ConcentrationPercent: number;
  top10ConcentrationPercent: number;
  sectorExposure: { category: string; value: number; percent: number }[];
  countryExposure: { category: string; value: number; percent: number }[];
  currencyExposure: { category: string; value: number; percent: number }[];
  monthlyCashflow: { month: string; dividends: number; buys: number; sells: number }[];
  performanceAttribution: { asset: string; weight: number; returnPct: number; contributionPct: number }[];
}

export interface PriceAlert {
  id: string;
  ticker: string;
  condition: 'ABOVE' | 'BELOW' | 'DAILY_CHANGE_PCT_ABOVE' | 'DAILY_CHANGE_PCT_BELOW';
  targetValue: number;
  isActive: boolean;
  note?: string;
  triggered?: boolean;
  createdAt: string;
}

export interface WatchlistItem {
  id: string;
  ticker: string;
  companyName: string;
  addedAt: string;
}

export interface CustomWatchlist {
  id: string;
  name: string;
  tickers: string[];
}

export interface UserSettings {
  baseCurrency: 'NZD' | 'AUD' | 'USD';
  currencySymbol: string;
  refreshIntervalSeconds: number;
  themeStyle: 'terminal' | 'midnight' | 'obsidian';
  alphaVantageApiKey: string;
  finnhubApiKey: string;
  googleSheetsUrl: string;
  googleSheetsId: string;
  googleSheetsApiKey: string;
  enableLiveSimulatedTickers: boolean;
  autoSyncGoogleSheets: boolean;
  lastSyncedTimestamp: string | null;
  priceAlerts: PriceAlert[];
  watchlists: CustomWatchlist[];
}

export type PageView =
  | 'dashboard'
  | 'portfolio'
  | 'holdings'
  | 'transactions'
  | 'performance'
  | 'dividends'
  | 'allocation'
  | 'analytics'
  | 'settings';
