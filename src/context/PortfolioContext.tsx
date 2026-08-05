import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Transaction,
  Holding,
  PortfolioSummary,
  Quote,
  StockMetadata,
  PerformanceMetrics,
  DividendEvent,
  AllocationNode,
  AnalyticsData,
  UserSettings,
  PageView,
  OverlapAnalysis,
  PriceAlert,
  CustomWatchlist,
} from '../types';
import { STOCK_METADATA_DATABASE } from '../data/mockPortfolio';
import { marketDataService } from '../services/marketData';
import {
  calculateHoldings,
  calculatePortfolioSummary,
  calculatePerformanceMetrics,
  generateDividendEvents,
  buildAllocationTree,
  calculateAnalytics,
} from '../services/calculations';
import { fetchTransactionsFromGoogleSheet, parseTransactionsCSV } from '../services/googleSheets';

interface PortfolioContextType {
  transactions: Transaction[];
  quotes: Record<string, Quote>;
  holdings: Holding[];
  summary: PortfolioSummary;
  performance: PerformanceMetrics;
  dividends: DividendEvent[];
  allocationTree: AllocationNode;
  analytics: AnalyticsData;
  overlapAnalysis: OverlapAnalysis;
  settings: UserSettings;
  activePage: PageView;
  searchQuery: string;
  selectedStockModal: string | null;
  isSyncingSheet: boolean;
  syncError: string | null;
  lastUpdatedTime: string;
  isCommandPaletteOpen: boolean;
  isTransactionModalOpen: boolean;
  
  // Actions
  setActivePage: (page: PageView) => void;
  setSearchQuery: (q: string) => void;
  setSelectedStockModal: (ticker: string | null) => void;
  setIsCommandPaletteOpen: (open: boolean) => void;
  setIsTransactionModalOpen: (open: boolean) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  editTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  syncGoogleSheets: (urlOrId?: string) => Promise<boolean>;
  importCSV: (csvText: string) => boolean;
  exportTransactionsCSV: () => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetData: () => void;
  refreshPricesNow: () => void;
  addPriceAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt'>) => void;
  deletePriceAlert: (id: string) => void;
  togglePriceAlert: (id: string) => void;
  addCustomWatchlist: (name: string) => void;
  deleteCustomWatchlist: (id: string) => void;
  toggleTickerInWatchlist: (watchlistId: string, ticker: string) => void;
}

const DEFAULT_PRICE_ALERTS: PriceAlert[] = [
  {
    id: 'alert-1',
    ticker: 'AAPL',
    condition: 'ABOVE',
    targetValue: 245.0,
    isActive: true,
    note: 'Trim profit target threshold',
    createdAt: '2026-08-01',
    triggered: false,
  },
  {
    id: 'alert-2',
    ticker: 'NVDA',
    condition: 'DAILY_CHANGE_PCT_ABOVE',
    targetValue: 3.5,
    isActive: true,
    note: 'Volatile upside momentum trigger',
    createdAt: '2026-08-02',
    triggered: true,
  },
  {
    id: 'alert-3',
    ticker: 'VOO',
    condition: 'BELOW',
    targetValue: 480.0,
    isActive: true,
    note: 'DCA buy signal alert',
    createdAt: '2026-08-03',
    triggered: false,
  },
];

const DEFAULT_WATCHLISTS: CustomWatchlist[] = [
  {
    id: 'wl-1',
    name: '🚀 Growth & AI',
    tickers: ['NVDA', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'PLTR'],
  },
  {
    id: 'wl-2',
    name: '🛡️ Broad Market Index',
    tickers: ['SPY', 'VOO', 'QQQ'],
  },
];

const DEFAULT_SETTINGS: UserSettings = {
  baseCurrency: 'NZD',
  currencySymbol: '$',
  refreshIntervalSeconds: 5,
  themeStyle: 'terminal',
  alphaVantageApiKey: '',
  finnhubApiKey: 'd9ospnhr01qou11oprpgd9ospnhr01qou11oprq0',
  googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/1lYdil7tlArXgCCwj9SXXCJW-3yQ_o6gdrpvqh05LwYo/edit',
  googleSheetsId: '1lYdil7tlArXgCCwj9SXXCJW-3yQ_o6gdrpvqh05LwYo',
  googleSheetsApiKey: 'AIzaSy_Kinetic_PermanentSync_Key',
  enableLiveSimulatedTickers: true,
  autoSyncGoogleSheets: true,
  lastSyncedTimestamp: new Date().toLocaleTimeString(),
  priceAlerts: DEFAULT_PRICE_ALERTS,
  watchlists: DEFAULT_WATCHLISTS,
};

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

const LOCAL_STORAGE_TX_KEY = 'terminal_portfolio_transactions_v1';
const LOCAL_STORAGE_SETTINGS_KEY = 'terminal_portfolio_settings_v1';
const LOCAL_STORAGE_DELETED_TX_KEY = 'terminal_portfolio_deleted_tx_signatures_v1';

function getTxSignature(tx: { ticker: string; type: string; quantity: number; price: number; date: string }): string {
  return `${tx.ticker.toUpperCase().trim()}|${tx.type.toUpperCase().trim()}|${Number(tx.quantity)}|${Number(tx.price)}|${tx.date.trim()}`;
}

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Deleted transaction signatures tracker
  const [deletedTxSignatures, setDeletedTxSignatures] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_DELETED_TX_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [];
  });

  // Load transactions from localStorage or fallback to mock
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_TX_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback
    }
    return [];
  });

  // Load settings
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // Fallback
    }
    return DEFAULT_SETTINGS;
  });

  const [quotes, setQuotes] = useState<Record<string, Quote>>(() => marketDataService.getQuotes());
  const [activePage, setActivePage] = useState<PageView>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStockModal, setSelectedStockModal] = useState<string | null>(null);
  const [isSyncingSheet, setIsSyncingSheet] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(() => new Date().toLocaleTimeString());
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false);

  // Persist transactions
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_TX_KEY, JSON.stringify(transactions));
    } catch {
      // Ignore storage errors
    }
  }, [transactions]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage errors
    }
  }, [settings]);

  // Live price tick loop
  useEffect(() => {
    if (!settings.enableLiveSimulatedTickers || settings.refreshIntervalSeconds <= 0) return;

    const intervalMs = Math.max(2, settings.refreshIntervalSeconds) * 1000;
    const timer = setInterval(() => {
      const updatedQuotes = marketDataService.simulatePriceTick();
      setQuotes({ ...updatedQuotes });
      setLastUpdatedTime(new Date().toLocaleTimeString());
    }, intervalMs);

    return () => clearInterval(timer);
  }, [settings.enableLiveSimulatedTickers, settings.refreshIntervalSeconds]);

  // Compute holdings & portfolio views reactively
  const holdings = useMemo(() => {
    return calculateHoldings(transactions, quotes, STOCK_METADATA_DATABASE);
  }, [transactions, quotes]);

  const summary = useMemo(() => {
    return calculatePortfolioSummary(holdings, transactions);
  }, [holdings, transactions]);

  const performance = useMemo(() => {
    return calculatePerformanceMetrics(summary, transactions);
  }, [summary, transactions]);

  const dividends = useMemo(() => {
    return generateDividendEvents(holdings, STOCK_METADATA_DATABASE);
  }, [holdings]);

  const allocationTree = useMemo(() => {
    return buildAllocationTree(holdings);
  }, [holdings]);

  const analytics = useMemo(() => {
    return calculateAnalytics(holdings);
  }, [holdings]);

  const overlapAnalysis = useMemo(() => {
    return marketDataService.calculateOverlapAnalysis(holdings);
  }, [holdings]);

  // Actions
  const refreshPricesNow = useCallback(() => {
    const updated = marketDataService.simulatePriceTick();
    setQuotes({ ...updated });
    const nowStr = new Date().toLocaleTimeString();
    setLastUpdatedTime(nowStr);
    setSettings((prev) => ({
      ...prev,
      lastSyncedTimestamp: nowStr,
    }));
  }, []);

  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzoEIhOVjpOefV8RDyEAmgxf_BCki3LmuECjK7LyU82WOKJ9pggEnD9VjRzLbyOdERuRA/exec';

  const saveToGoogleSheets = useCallback(async (txs: Transaction[]) => {
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions: txs }),
      });
    } catch (error) {
      console.error('Error syncing transactions to Google Sheets:', error);
    }
  }, []);

  const addTransaction = useCallback((txData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    if (!marketDataService.getQuote(txData.ticker)) {
      marketDataService.updatePrice(txData.ticker, txData.price);
    }

    setTransactions((prev) => {
      const next = [newTx, ...prev];
      saveToGoogleSheets(next);
      return next;
    });
    const nowStr = new Date().toLocaleTimeString();
    setLastUpdatedTime(nowStr);
    setSettings((prev) => ({
      ...prev,
      lastSyncedTimestamp: nowStr,
    }));
  }, [saveToGoogleSheets]);

  const editTransaction = useCallback((id: string, txData: Partial<Transaction>) => {
    setTransactions((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...txData } : t));
      saveToGoogleSheets(next);
      return next;
    });
    const nowStr = new Date().toLocaleTimeString();
    setLastUpdatedTime(nowStr);
    setSettings((prev) => ({
      ...prev,
      lastSyncedTimestamp: nowStr,
    }));
  }, [saveToGoogleSheets]);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => {
      const targetTx = prev.find((t) => t.id === id);
      if (targetTx) {
        const sig = getTxSignature(targetTx);
        setDeletedTxSignatures((prevSigs) => {
          const nextSigs = Array.from(new Set([...prevSigs, sig, id]));
          try {
            localStorage.setItem(LOCAL_STORAGE_DELETED_TX_KEY, JSON.stringify(nextSigs));
          } catch {
            // Ignore
          }
          return nextSigs;
        });
      }
      const next = prev.filter((t) => t.id !== id);
      saveToGoogleSheets(next);
      return next;
    });
    const nowStr = new Date().toLocaleTimeString();
    setLastUpdatedTime(nowStr);
    setSettings((prev) => ({
      ...prev,
      lastSyncedTimestamp: nowStr,
    }));
  }, [saveToGoogleSheets]);


  const syncGoogleSheets = useCallback(
    async (urlOrId?: string): Promise<boolean> => {
      const target = urlOrId || settings.googleSheetsUrl || settings.googleSheetsId;
      if (!target) {
        setSyncError('Please provide a Google Sheets URL or Sheet ID in Settings.');
        return false;
      }

      setIsSyncingSheet(true);
      setSyncError(null);

      const res = await fetchTransactionsFromGoogleSheet(target);
      setIsSyncingSheet(false);

      if (res.success) {
        const deletedSet = new Set(deletedTxSignatures);
        const filteredSynced = res.transactions.filter((t) => {
          const sig = getTxSignature(t);
          return !deletedSet.has(sig) && !deletedSet.has(t.id);
        });

        setTransactions(filteredSynced);
        setSettings((prev) => ({
          ...prev,
          lastSyncedTimestamp: new Date().toLocaleTimeString(),
          googleSheetsUrl: target,
        }));
        return true;
      } else {
        setSyncError(res.error || 'Failed to sync Google Sheets.');
        return false;
      }
    },
    [settings.googleSheetsUrl, settings.googleSheetsId, deletedTxSignatures]
  );

  const importCSV = useCallback((csvText: string): boolean => {
    const res = parseTransactionsCSV(csvText);
    if (res.success && res.transactions.length > 0) {
      setTransactions(res.transactions);
      return true;
    } else {
      setSyncError(res.error || 'Failed to parse CSV file.');
      return false;
    }
  }, []);

  const exportTransactionsCSV = useCallback(() => {
    const headers = 'Ticker,Type,Quantity,Price,Currency,Date,Trading Fee,FX Fee,Broker,Notes';
    const rows = transactions.map(
      (t) =>
        `"${t.ticker}","${t.type}",${t.quantity},${t.price},"${t.currency}","${t.date}",${t.tradingFee},${t.fxFee},"${t.broker || ''}","${t.notes || ''}"`
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `portfolio_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [transactions]);

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      // Map currency symbols strictly for NZD, AUD, USD
      if (newSettings.baseCurrency) {
        const symbolMap: Record<string, string> = {
          NZD: '$',
          AUD: '$',
          USD: '$',
        };
        updated.currencySymbol = symbolMap[newSettings.baseCurrency] || '$';
      }
      return updated;
    });
  }, []);

  const addPriceAlert = useCallback((alertData: Omit<PriceAlert, 'id' | 'createdAt'>) => {
    const newAlert: PriceAlert = {
      ...alertData,
      id: `alert-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      triggered: false,
    };
    setSettings((prev) => ({
      ...prev,
      priceAlerts: [newAlert, ...prev.priceAlerts],
    }));
  }, []);

  const deletePriceAlert = useCallback((id: string) => {
    setSettings((prev) => ({
      ...prev,
      priceAlerts: prev.priceAlerts.filter((a) => a.id !== id),
    }));
  }, []);

  const togglePriceAlert = useCallback((id: string) => {
    setSettings((prev) => ({
      ...prev,
      priceAlerts: prev.priceAlerts.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a)),
    }));
  }, []);

  const addCustomWatchlist = useCallback((name: string) => {
    if (!name.trim()) return;
    const newWl: CustomWatchlist = {
      id: `wl-${Date.now()}`,
      name: name.trim(),
      tickers: [],
    };
    setSettings((prev) => ({
      ...prev,
      watchlists: [...(prev.watchlists || []), newWl],
    }));
  }, []);

  const deleteCustomWatchlist = useCallback((id: string) => {
    setSettings((prev) => ({
      ...prev,
      watchlists: (prev.watchlists || []).filter((wl) => wl.id !== id),
    }));
  }, []);

  const toggleTickerInWatchlist = useCallback((watchlistId: string, ticker: string) => {
    const cleanTicker = ticker.trim().toUpperCase();
    if (!cleanTicker) return;

    setSettings((prev) => ({
      ...prev,
      watchlists: (prev.watchlists || []).map((wl) => {
        if (wl.id !== watchlistId) return wl;
        const exists = wl.tickers.includes(cleanTicker);
        return {
          ...wl,
          tickers: exists ? wl.tickers.filter((t) => t !== cleanTicker) : [...wl.tickers, cleanTicker],
        };
      }),
    }));
  }, []);

  const resetData = useCallback(() => {
    setTransactions([]);
    setDeletedTxSignatures([]);
    setSettings(DEFAULT_SETTINGS);
    setSyncError(null);
    localStorage.removeItem(LOCAL_STORAGE_TX_KEY);
    localStorage.removeItem(LOCAL_STORAGE_SETTINGS_KEY);
    localStorage.removeItem(LOCAL_STORAGE_DELETED_TX_KEY);
  }, []);

  return (
    <PortfolioContext.Provider
      value={{
        transactions,
        quotes,
        holdings,
        summary,
        performance,
        dividends,
        allocationTree,
        analytics,
        overlapAnalysis,
        settings,
        activePage,
        searchQuery,
        selectedStockModal,
        isSyncingSheet,
        syncError,
        lastUpdatedTime,
        isCommandPaletteOpen,
        isTransactionModalOpen,
        setActivePage,
        setSearchQuery,
        setSelectedStockModal,
        setIsCommandPaletteOpen,
        setIsTransactionModalOpen,
        addTransaction,
        editTransaction,
        deleteTransaction,
        syncGoogleSheets,
        importCSV,
        exportTransactionsCSV,
        updateSettings,
        resetData,
        refreshPricesNow,
        addPriceAlert,
        deletePriceAlert,
        togglePriceAlert,
        addCustomWatchlist,
        deleteCustomWatchlist,
        toggleTickerInWatchlist,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}
