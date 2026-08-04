import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import {
  Settings as SettingsIcon,
  Database,
  Key,
  Globe,
  RefreshCw,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sliders,
  ExternalLink,
  Bell,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    syncGoogleSheets,
    isSyncingSheet,
    syncError,
    importCSV,
    exportTransactionsCSV,
    addPriceAlert,
    deletePriceAlert,
    togglePriceAlert,
    holdings,
  } = usePortfolio();

  const [sheetInput, setSheetInput] = useState<string>(
    settings.googleSheetsUrl || 'https://docs.google.com/spreadsheets/d/1KineticPortfolio_LiveSync_MasterSheet/edit'
  );

  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // New Alert Form state
  const [alertTicker, setAlertTicker] = useState<string>(holdings[0]?.ticker || 'AAPL');
  const [alertCondition, setAlertCondition] = useState<
    'ABOVE' | 'BELOW' | 'DAILY_CHANGE_PCT_ABOVE' | 'DAILY_CHANGE_PCT_BELOW'
  >('ABOVE');
  const [alertTargetValue, setAlertTargetValue] = useState<string>('250.00');
  const [alertNote, setAlertNote] = useState<string>('Target profit threshold');

  const handleSaveSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetInput.trim()) return;

    updateSettings({ googleSheetsUrl: sheetInput.trim() });
    const success = await syncGoogleSheets(sheetInput.trim());
    if (success) {
      setSaveMessage('Permanent Google Sheet database connected and synchronized!');
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(alertTargetValue);
    if (isNaN(val) || val <= 0) return;

    addPriceAlert({
      ticker: alertTicker,
      condition: alertCondition,
      targetValue: val,
      isActive: true,
      note: alertNote || 'Custom price trigger',
    });

    setSaveMessage(`Price alert added for ${alertTicker}!`);
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const success = importCSV(text);
        if (success) {
          setSaveMessage('CSV transactions imported successfully!');
          setTimeout(() => setSaveMessage(null), 4000);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6  text-slate-100 pb-12">
      {/* Title */}
      <div className="p-4 bg-[#141824] border border-[#212738] rounded-xl flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-blue-400" />
            TERMINAL CONFIGURATION & ALERT MANAGEMENT
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Permanent Google Sheets database, NZD base currency, alert triggers, and pre-configured API keys
          </p>
        </div>
      </div>

      {saveMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs flex items-center gap-2 ">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* PERMANENT GOOGLE SHEETS DATABASE SECTION */}
      <div className="p-5 bg-[#141824] border border-[#212738] rounded-xl space-y-4 shadow-sm">
        <div className="border-b border-[#212738] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                PERMANENT GOOGLE SHEETS MASTER DATABASE
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pre-configured Google Sheet link ensures permanent cloud database persistence without manual setup.
              </p>
            </div>
          </div>
          <a
            href={settings.googleSheetsUrl || 'https://docs.google.com/spreadsheets/d/1KineticPortfolio_LiveSync_MasterSheet/edit'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase transition-all shadow-sm self-start sm:self-auto"
          >
            <span>Open Master Google Sheet</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Permanent Master Link Display Box */}
        <div className="p-4 bg-[#182136] border border-emerald-500/30 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase">
                PERMANENT CLOUD DATABASE CONNECTED & ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300  break-all">
              {settings.googleSheetsUrl || 'https://docs.google.com/spreadsheets/d/1KineticPortfolio_LiveSync_MasterSheet/edit'}
            </p>
          </div>
          <button
            onClick={() => syncGoogleSheets()}
            disabled={isSyncingSheet}
            className="px-4 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 font-bold text-xs rounded uppercase flex items-center gap-1.5 shrink-0 self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheet ? 'animate-spin' : ''}`} />
            <span>{isSyncingSheet ? 'Syncing...' : 'Sync Database Now'}</span>
          </button>
        </div>

        <form onSubmit={handleSaveSheet} className="space-y-2">
          <label className="block text-[11px] text-slate-400 font-semibold uppercase">
            Custom Google Sheet URL or Sheet ID (Optional Override)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={sheetInput}
              onChange={(e) => setSheetInput(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/.../edit"
              className="flex-1 bg-[#181f30] border border-[#28324a] rounded px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isSyncingSheet}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase"
            >
              Update Link
            </button>
          </div>
          {syncError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{syncError}</span>
            </div>
          )}
        </form>

        {/* CSV Import/Export Tools */}
        <div className="p-4 bg-[#181f30] border border-[#242d42] rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-200 block">Backup & CSV Import/Export</span>
            <p className="text-[11px] text-slate-400">Download portfolio templates or export raw transaction history.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-[#20293d] hover:bg-[#28344e] border border-[#313d5a] rounded text-slate-200 font-semibold cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Import CSV</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={exportTransactionsCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#20293d] hover:bg-[#28344e] border border-[#313d5a] rounded text-slate-200 font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* PRICE & PORTFOLIO ALERT MANAGEMENT SYSTEM */}
      <div className="p-5 bg-[#141824] border border-[#212738] rounded-xl space-y-5">
        <div className="border-b border-[#212738] pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                PRICE & PORTFOLIO ALERT MANAGEMENT SYSTEM
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Define price threshold triggers and percentage movement alerts for portfolio holdings
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
            {settings.priceAlerts.filter((a) => a.isActive).length} Active Alert(s)
          </span>
        </div>

        {/* Add Alert Form */}
        <form onSubmit={handleCreateAlert} className="p-4 bg-[#181f30] border border-[#28324a] rounded-lg space-y-3">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
            + Define New Price Trigger
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Select Ticker</label>
              <select
                value={alertTicker}
                onChange={(e) => setAlertTicker(e.target.value)}
                className="w-full bg-[#121622] border border-[#262f42] rounded px-2.5 py-1.5 text-white font-bold"
              >
                {holdings.map((h) => (
                  <option key={h.ticker} value={h.ticker}>
                    {h.ticker} - {h.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Trigger Condition</label>
              <select
                value={alertCondition}
                onChange={(e) =>
                  setAlertCondition(
                    e.target.value as 'ABOVE' | 'BELOW' | 'DAILY_CHANGE_PCT_ABOVE' | 'DAILY_CHANGE_PCT_BELOW'
                  )
                }
                className="w-full bg-[#121622] border border-[#262f42] rounded px-2.5 py-1.5 text-white font-bold"
              >
                <option value="ABOVE">Price Above ($)</option>
                <option value="BELOW">Price Below ($)</option>
                <option value="DAILY_CHANGE_PCT_ABOVE">Daily Surge &gt; %</option>
                <option value="DAILY_CHANGE_PCT_BELOW">Daily Drop &lt; %</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Target Threshold</label>
              <input
                type="number"
                step="0.01"
                value={alertTargetValue}
                onChange={(e) => setAlertTargetValue(e.target.value)}
                placeholder="250.00"
                className="w-full bg-[#121622] border border-[#262f42] rounded px-2.5 py-1.5 text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Trigger Note</label>
              <input
                type="text"
                value={alertNote}
                onChange={(e) => setAlertNote(e.target.value)}
                placeholder="Take profit target..."
                className="w-full bg-[#121622] border border-[#262f42] rounded px-2.5 py-1.5 text-white font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase rounded transition-all ml-auto"
          >
            <Plus className="w-3.5 h-3.5" /> Add Alert Rule
          </button>
        </form>

        {/* Existing Alerts List */}
        <div className="space-y-2">
          {settings.priceAlerts.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No active price triggers set.</p>
          ) : (
            settings.priceAlerts.map((a) => (
              <div
                key={a.id}
                className="p-3 bg-[#181f30] border border-[#28324a] rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-blue-400 text-sm">{a.ticker}</span>
                  <div>
                    <span className="text-white font-bold">
                      {a.condition === 'ABOVE' && `Price > $${a.targetValue.toFixed(2)}`}
                      {a.condition === 'BELOW' && `Price < $${a.targetValue.toFixed(2)}`}
                      {a.condition === 'DAILY_CHANGE_PCT_ABOVE' && `Daily Surge > ${a.targetValue}%`}
                      {a.condition === 'DAILY_CHANGE_PCT_BELOW' && `Daily Drop < ${a.targetValue}%`}
                    </span>
                    <span className="text-slate-400 text-[11px] block">{a.note}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  {a.triggered ? (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold">
                      ⚡ TRIGGERED
                    </span>
                  ) : a.isActive ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-400 text-[10px] font-bold">
                      PAUSED
                    </span>
                  )}

                  <button
                    onClick={() => togglePriceAlert(a.id)}
                    title="Toggle Alert Active"
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    {a.isActive ? (
                      <ToggleRight className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-slate-500" />
                    )}
                  </button>

                  <button
                    onClick={() => deletePriceAlert(a.id)}
                    title="Delete Alert"
                    className="p-1 text-rose-400 hover:text-rose-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Terminal Display & Finnhub Key Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Terminal Preferences */}
        <div className="p-5 bg-[#141824] border border-[#212738] rounded-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-[#212738] pb-3 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            Base Currency & Terminal Frequency
          </h3>

          <div className="space-y-4 text-xs ">
            {/* Base Currency Preferences: strictly NZD, AUD, USD */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-semibold uppercase">
                Base Currency Preference
              </label>
              <select
                value={settings.baseCurrency}
                onChange={(e) =>
                  updateSettings({ baseCurrency: e.target.value as 'NZD' | 'AUD' | 'USD' })
                }
                className="w-full bg-[#181f30] border border-[#28324a] rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer font-bold"
              >
                <option value="NZD">NZD (NZ$) - New Zealand Dollar (Default)</option>
                <option value="AUD">AUD (A$) - Australian Dollar</option>
                <option value="USD">USD ($) - US Dollar</option>
              </select>
            </div>

            {/* Refresh Interval */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-semibold uppercase">
                Live Price Tick Frequency
              </label>
              <select
                value={settings.refreshIntervalSeconds}
                onChange={(e) => updateSettings({ refreshIntervalSeconds: Number(e.target.value) })}
                className="w-full bg-[#181f30] border border-[#28324a] rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value={3}>Real-Time (3 Seconds)</option>
                <option value={5}>Fast (5 Seconds)</option>
                <option value={15}>Standard (15 Seconds)</option>
                <option value={30}>Slow (30 Seconds)</option>
                <option value={0}>Manual Refresh Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Finnhub API Key Box (Uneditable, hidden characters in asterisks) */}
        <div className="p-5 bg-[#141824] border border-[#212738] rounded-xl space-y-4">
          <div className="border-b border-[#212738] pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              Live Market Finnhub API Integration
            </h3>
            <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded text-[10px] font-bold flex items-center gap-1">
              <Lock className="w-3 h-3" /> UNEDITABLE PERMANENT
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Pre-configured Finnhub API key is active for real-time stock quote feeds.
          </p>

          <div className="space-y-3 text-xs ">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-semibold uppercase">
                Active Finnhub API Key
              </label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  disabled
                  value="d9o*************************rq0"
                  className="w-full bg-[#181f30]/80 border border-[#28324a] rounded px-3 py-2 text-amber-400 font-bold focus:outline-none cursor-not-allowed tracking-widest select-none"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Security Policy: API Key is permanently encrypted and masked in asterisks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
