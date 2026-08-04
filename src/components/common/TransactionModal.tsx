import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Transaction, TransactionType } from '../../types';
import { marketDataService } from '../../services/marketData';
import { X, Save, AlertCircle } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTx?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  editTx,
}) => {
  const { addTransaction, editTransaction, settings } = usePortfolio();

  const [ticker, setTicker] = useState<string>('NVDA');
  const [type, setType] = useState<TransactionType>('BUY');
  const [quantity, setQuantity] = useState<string>('10');
  const [price, setPrice] = useState<string>('128.50');
  const [currency, setCurrency] = useState<string>('NZD');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [tradingFee, setTradingFee] = useState<string>('1.99');
  const [fxFee, setFxFee] = useState<string>('0.50');
  const [broker, setBroker] = useState<string>('Interactive Brokers');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editTx) {
      setTicker(editTx.ticker);
      setType(editTx.type);
      setQuantity(String(editTx.quantity));
      setPrice(String(editTx.price));
      setCurrency(editTx.currency || 'NZD');
      setDate(editTx.date || new Date().toISOString().split('T')[0]);
      setTradingFee(String(editTx.tradingFee || 0));
      setFxFee(String(editTx.fxFee || 0));
      setBroker(editTx.broker || 'Interactive Brokers');
      setNotes(editTx.notes || '');
    } else {
      // Auto-fill price from live quote if available
      const q = marketDataService.getQuote(ticker);
      if (q) setPrice(String(q.price));
    }
  }, [editTx, isOpen]);

  if (!isOpen) return null;

  const handleTickerChange = (val: string) => {
    const uppercaseTicker = val.toUpperCase();
    setTicker(uppercaseTicker);
    const quote = marketDataService.getQuote(uppercaseTicker);
    if (quote) {
      setPrice(String(quote.price));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numQty = parseFloat(quantity);
    const numPrice = parseFloat(price);
    const numTradingFee = parseFloat(tradingFee) || 0;
    const numFxFee = parseFloat(fxFee) || 0;

    if (!ticker.trim()) {
      setError('Please enter a valid stock ticker symbol.');
      return;
    }
    if (isNaN(numQty) || numQty <= 0) {
      setError('Quantity must be a positive number.');
      return;
    }
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Price per share must be a positive number.');
      return;
    }

    if (editTx) {
      editTransaction(editTx.id, {
        ticker: ticker.trim().toUpperCase(),
        type,
        quantity: numQty,
        price: numPrice,
        currency,
        date,
        tradingFee: numTradingFee,
        fxFee: numFxFee,
        broker,
        notes,
      });
    } else {
      addTransaction({
        ticker: ticker.trim().toUpperCase(),
        type,
        quantity: numQty,
        price: numPrice,
        currency,
        date,
        tradingFee: numTradingFee,
        fxFee: numFxFee,
        broker,
        notes,
      });
    }

    onClose();
  };

  const qtyVal = parseFloat(quantity) || 0;
  const priceVal = parseFloat(price) || 0;
  const feeTradingVal = parseFloat(tradingFee) || 0;
  const feeFxVal = parseFloat(fxFee) || 0;

  const subtotal = qtyVal * priceVal;
  const totalAmount = type === 'BUY' ? subtotal + feeTradingVal + feeFxVal : subtotal - feeTradingVal - feeFxVal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="bg-[#141824] border border-[#283144] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden  text-slate-100"
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-[#181d2c] border-b border-[#283144] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <h2 className="text-sm font-bold tracking-wider uppercase">
              {editTx ? 'EDIT TRANSACTION RECORD' : 'LOG NEW TRANSACTION'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#222a3d] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Toggle: BUY vs SELL */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#1a2030] rounded-lg border border-[#283144]">
            <button
              type="button"
              onClick={() => setType('BUY')}
              className={`py-2 rounded font-bold text-xs uppercase tracking-wider transition-all ${
                type === 'BUY'
                  ? 'bg-emerald-500 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              BUY POSITION
            </button>
            <button
              type="button"
              onClick={() => setType('SELL')}
              className={`py-2 rounded font-bold text-xs uppercase tracking-wider transition-all ${
                type === 'SELL'
                  ? 'bg-rose-500 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              SELL POSITION
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Ticker */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 uppercase font-semibold">
                Ticker Symbol
              </label>
              <input
                type="text"
                value={ticker}
                onChange={(e) => handleTickerChange(e.target.value)}
                placeholder="NVDA, AAPL, MSFT"
                className="w-full bg-[#1b2233] border border-[#2e394f] rounded px-3 py-1.5 text-sm uppercase text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 uppercase font-semibold">
                Transaction Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#1b2233] border border-[#2e394f] rounded px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Quantity */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 uppercase font-semibold">
                Quantity
              </label>
              <input
                type="number"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#1b2233] border border-[#2e394f] rounded px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 uppercase font-semibold">
                Price ({currency})
              </label>
              <input
                type="number"
                step="any"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#1b2233] border border-[#2e394f] rounded px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Currency */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 uppercase font-semibold">
                Transaction Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-[#1b2233] border border-[#2e394f] rounded px-3 py-1.5 text-sm text-slate-100 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="NZD">NZD (NZ$)</option>
                <option value="AUD">AUD (A$)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>

          {/* Fees Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 uppercase font-semibold">
                Trading Fee ({currency})
              </label>
              <input
                type="number"
                step="any"
                value={tradingFee}
                onChange={(e) => setTradingFee(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#1b2233] border border-[#2e394f] rounded px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1 uppercase font-semibold">
                FX Fee ({currency})
              </label>
              <input
                type="number"
                step="any"
                value={fxFee}
                onChange={(e) => setFxFee(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#1b2233] border border-[#2e394f] rounded px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Broker & Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 uppercase font-semibold">
                Broker
              </label>
              <input
                type="text"
                value={broker}
                onChange={(e) => setBroker(e.target.value)}
                placeholder="Interactive Brokers, Schwab"
                className="w-full bg-[#1b2233] border border-[#2e394f] rounded px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 uppercase font-semibold">
                Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Earnings play, DCA..."
                className="w-full bg-[#1b2233] border border-[#2e394f] rounded px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Calculation Preview */}
          <div className="p-3 bg-[#192030] border border-[#283144] rounded-lg text-xs space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal (Excl. fees):</span>
              <span>{currency} {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Total Fees (Trading + FX):</span>
              <span>{currency} {(feeTradingVal + feeFxVal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-100 pt-1 border-t border-[#2e394f]">
              <span>Total Amount (Incl. fees):</span>
              <span className={type === 'BUY' ? 'text-blue-400' : 'text-emerald-400'}>
                {currency} {totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#222a3d] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>{editTx ? 'Update Record' : 'Save Transaction'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
