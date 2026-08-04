import { Transaction } from '../types';

export interface GoogleSheetsSyncResult {
  success: boolean;
  transactions: Transaction[];
  error?: string;
  rowCount?: number;
}

/**
 * Parses raw CSV content into Transaction records.
 * Supports flexible header names:
 * Ticker / Symbol
 * Type / Action (Buy, Sell, B, S)
 * Quantity / Shares / Qty
 * Price / Unit Price / Rate
 * Currency / Curr
 * Date / Transaction Date
 * Trading Fee / Commission / Fee
 * FX Fee / FX / Exchange Fee
 * Notes / Memo
 * Broker / Platform
 */
export function parseTransactionsCSV(csvText: string): GoogleSheetsSyncResult {
  try {
    const lines = csvText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length < 2) {
      return {
        success: false,
        transactions: [],
        error: 'CSV contains no transaction rows or headers.',
      };
    }

    const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

    const tickerIdx = headers.findIndex((h) => h.includes('ticker') || h.includes('symbol'));
    const typeIdx = headers.findIndex(
      (h) => h.includes('type') || h.includes('action') || h.includes('buysell')
    );
    const qtyIdx = headers.findIndex(
      (h) => h.includes('quantity') || h.includes('shares') || h.includes('qty')
    );
    const priceIdx = headers.findIndex(
      (h) => h.includes('price') || h.includes('rate') || h.includes('unit')
    );
    const dateIdx = headers.findIndex((h) => h.includes('date'));

    const currencyIdx = headers.findIndex((h) => h.includes('currency') || h.includes('curr'));
    const tradingFeeIdx = headers.findIndex(
      (h) => h.includes('tradingfee') || h.includes('fee') || h.includes('commission')
    );
    const fxFeeIdx = headers.findIndex(
      (h) => h.includes('fxfee') || h.includes('fx') || h.includes('exchangefee')
    );
    const notesIdx = headers.findIndex((h) => h.includes('note') || h.includes('memo'));
    const brokerIdx = headers.findIndex((h) => h.includes('broker') || h.includes('platform'));

    if (tickerIdx === -1 || qtyIdx === -1 || priceIdx === -1 || dateIdx === -1) {
      return {
        success: false,
        transactions: [],
        error:
          'Required columns missing in CSV. Please ensure Ticker, Quantity, Price, and Date columns exist.',
      };
    }

    const parsedTransactions: Transaction[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (!cols || cols.length === 0) continue;

      const ticker = cols[tickerIdx]?.toUpperCase().trim();
      if (!ticker) continue;

      const rawType = cols[typeIdx]?.toUpperCase().trim() || 'BUY';
      const type = rawType.includes('SELL') || rawType === 'S' ? 'SELL' : 'BUY';

      const quantity = parseFloat(cols[qtyIdx]?.replace(/[^0-9.-]/g, '') || '0');
      const price = parseFloat(cols[priceIdx]?.replace(/[^0-9.-]/g, '') || '0');
      const dateStr = cols[dateIdx]?.trim() || new Date().toISOString().split('T')[0];

      if (isNaN(quantity) || quantity <= 0 || isNaN(price) || price <= 0) {
        continue;
      }

      const currency = currencyIdx !== -1 ? cols[currencyIdx]?.trim().toUpperCase() || 'USD' : 'USD';
      const tradingFee =
        tradingFeeIdx !== -1 ? parseFloat(cols[tradingFeeIdx]?.replace(/[^0-9.-]/g, '') || '0') || 0 : 0;
      const fxFee =
        fxFeeIdx !== -1 ? parseFloat(cols[fxFeeIdx]?.replace(/[^0-9.-]/g, '') || '0') || 0 : 0;
      const notes = notesIdx !== -1 ? cols[notesIdx]?.trim() : undefined;
      const broker = brokerIdx !== -1 ? cols[brokerIdx]?.trim() : undefined;

      parsedTransactions.push({
        id: `gs-tx-${i}-${Date.now().toString(36)}`,
        ticker,
        type,
        quantity,
        price,
        currency,
        date: dateStr,
        tradingFee,
        fxFee,
        notes,
        broker,
      });
    }

    return {
      success: true,
      transactions: parsedTransactions,
      rowCount: parsedTransactions.length,
    };
  } catch (err) {
    return {
      success: false,
      transactions: [],
      error: err instanceof Error ? err.message : 'Failed to parse Google Sheets CSV.',
    };
  }
}

/**
 * Fetches transactions directly from Google Sheets using public Published CSV URL or Sheet ID
 */
export async function fetchTransactionsFromGoogleSheet(
  sheetUrlOrId: string
): Promise<GoogleSheetsSyncResult> {
  let fetchUrl = sheetUrlOrId.trim();

  // If user entered a plain Sheet ID (e.g., 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms)
  if (!fetchUrl.startsWith('http')) {
    fetchUrl = `https://docs.google.com/spreadsheets/d/${fetchUrl}/export?format=csv`;
  } else if (fetchUrl.includes('/edit') || fetchUrl.includes('/view')) {
    // Convert view URL to CSV export link
    fetchUrl = fetchUrl.replace(/\/edit.*$/, '/export?format=csv').replace(/\/view.*$/, '/export?format=csv');
  }

  try {
    const res = await fetch(fetchUrl);
    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: Could not fetch Google Sheet. Make sure the sheet is public or shared via link.`);
    }
    const csvText = await res.text();
    return parseTransactionsCSV(csvText);
  } catch (err) {
    return {
      success: false,
      transactions: [],
      error: err instanceof Error ? err.message : 'Network error connecting to Google Sheets.',
    };
  }
}

/**
 * Generates sample CSV template for Google Sheets
 */
export function generateGoogleSheetsTemplateCSV(): string {
  return [
    'Ticker,Type,Quantity,Price,Currency,Date,Trading Fee,FX Fee,Broker,Notes',
    'NVDA,BUY,120,48.50,USD,2023-03-15,1.99,0.50,Interactive Brokers,Initial AI play',
    'AAPL,BUY,50,175.20,USD,2023-05-12,2.50,1.20,Interactive Brokers,DCA',
    'MSFT,BUY,40,335.00,USD,2023-08-22,3.00,1.50,Interactive Brokers,Cloud growth',
    'AAPL,SELL,10,218.50,USD,2024-06-25,2.50,0.90,Interactive Brokers,Rebalance',
  ].join('\n');
}

function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}
