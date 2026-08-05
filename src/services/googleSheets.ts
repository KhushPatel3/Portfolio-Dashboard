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
      const rawDateStr = cols[dateIdx]?.trim();
      const dateStr = parseCleanDate(rawDateStr);

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
 * Robust date parser handling Excel ######## truncations, serial numbers, and standard date strings.
 */
function parseCleanDate(rawDate?: string): string {
  if (!rawDate || rawDate.includes('#')) {
    return new Date().toISOString().split('T')[0];
  }
  const trimmed = rawDate.trim();

  // Excel 5-digit serial date number (e.g. 45123)
  if (/^\d{5}$/.test(trimmed)) {
    const serial = parseInt(trimmed, 10);
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const targetDate = new Date(excelEpoch.getTime() + serial * 86400000);
    if (!isNaN(targetDate.getTime())) {
      return targetDate.toISOString().split('T')[0];
    }
  }

  // Standard date parsing
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1900 && parsed.getFullYear() < 2100) {
    return parsed.toISOString().split('T')[0];
  }

  return new Date().toISOString().split('T')[0];
}

/**
 * Fetches transactions directly from Google Sheets using public Published CSV URL or Sheet ID
 */
export async function fetchTransactionsFromGoogleSheet(
  sheetUrlOrId: string
): Promise<GoogleSheetsSyncResult> {
  let fetchUrl = sheetUrlOrId.trim();

  // Extract sheet ID and optional GID from Google Sheets URLs
  const sheetIdMatch = fetchUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
  const gidMatch = fetchUrl.match(/[?&]gid=([0-9]+)/);

  if (sheetIdMatch) {
    const sheetId = sheetIdMatch[1];
    const gid = gidMatch ? gidMatch[1] : null;
    fetchUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${
      gid ? `&gid=${gid}` : ''
    }`;
  } else if (!fetchUrl.startsWith('http')) {
    // If user entered a plain Sheet ID
    fetchUrl = `https://docs.google.com/spreadsheets/d/${fetchUrl}/export?format=csv`;
  } else if (fetchUrl.includes('/edit') || fetchUrl.includes('/view')) {
    fetchUrl = fetchUrl
      .replace(/\/edit.*$/, '/export?format=csv')
      .replace(/\/view.*$/, '/export?format=csv');
  }

  try {
    const res = await fetch(fetchUrl);
    if (!res.ok) {
      throw new Error(
        `HTTP Error ${res.status}: Could not fetch Google Sheet. Make sure the sheet is public or published to the web.`
      );
    }
    const csvText = await res.text();

    // Check if Google returned an HTML page (e.g. login redirect or permission prompt)
    if (csvText.trim().startsWith('<') || csvText.toLowerCase().includes('<!doctype html>')) {
      return {
        success: false,
        transactions: [],
        error:
          'Google Sheet is not publicly accessible. Please go to File -> Share -> Publish to web (or set sharing to "Anyone with link can view").',
      };
    }

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
