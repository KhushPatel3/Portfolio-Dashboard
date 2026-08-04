import { Quote, StockMetadata, TimeFrame, FutureOutlook, OverlapAnalysis, Holding, OverlappingHolding } from '../types';
import { INITIAL_QUOTES, STOCK_METADATA_DATABASE, FUTURE_OUTLOOK_DATABASE, ETF_CONSTITUENTS_DATABASE } from '../data/mockPortfolio';

class MarketDataService {
  private quotes: Record<string, Quote> = { ...INITIAL_QUOTES };
  private metadataMap: Record<string, StockMetadata> = { ...STOCK_METADATA_DATABASE };

  public getQuotes(): Record<string, Quote> {
    return { ...this.quotes };
  }

  public getQuote(ticker: string): Quote | undefined {
    return this.quotes[ticker];
  }

  public getMetadata(ticker: string): StockMetadata {
    if (this.metadataMap[ticker]) {
      return this.metadataMap[ticker];
    }
    // Fallback default metadata using official symbol logo
    return {
      ticker,
      name: `${ticker} Inc.`,
      logo: `https://assets.parqet.com/logos/symbol/${ticker}?format=png`,
      currency: 'USD',
      exchange: 'GLOBAL',
      country: 'USA',
      region: 'North America',
      sector: 'Technology',
      industry: 'Software',
      assetType: 'Stock',
      dividendYield: 1.2,
      dividendFrequency: 'Quarterly',
    };
  }

  public getAllMetadata(): Record<string, StockMetadata> {
    return { ...this.metadataMap };
  }

  public getFutureOutlook(ticker: string): FutureOutlook {
    if (FUTURE_OUTLOOK_DATABASE[ticker]) {
      return FUTURE_OUTLOOK_DATABASE[ticker];
    }
    const q = this.getQuote(ticker);
    const currPrice = q ? q.price : 100;
    return {
      ticker,
      targetPrice: Number((currPrice * 1.2).toFixed(2)),
      upsidePercent: 20.0,
      consensus: 'Buy',
      ratingScore: 4.3,
      growthForecast3YPct: 15.0,
      verdict: 'BUY — Solid cash flow fundamentals and long-term sector compounding trajectory.',
      catalysts: ['Product innovation pipeline expansion', 'Global TAM market penetration'],
      riskFactors: ['Macroeconomic interest rate sensitivity'],
      sentiment: 'Bullish',
    };
  }

  /**
   * Generates realistic historical chart data for timeframes
   */
  public getHistoricalDataForTimeFrame(ticker: string, timeframe: TimeFrame) {
    const q = this.getQuote(ticker);
    const currentPrice = q ? q.price : 100;

    let pointsCount = 30;
    let labelFormat: (i: number, total: number) => string;
    let baseMultiplier = 0.85;

    switch (timeframe) {
      case '1D':
        pointsCount = 12;
        labelFormat = (i) => {
          const hour = 9 + Math.floor(i * 0.6);
          const min = (i % 2) * 30;
          return `${hour > 12 ? hour - 12 : hour}:${min === 0 ? '00' : min} ${hour >= 12 ? 'PM' : 'AM'}`;
        };
        baseMultiplier = 0.985;
        break;
      case '5D':
        pointsCount = 10;
        labelFormat = (i) => {
          const d = new Date();
          d.setDate(d.getDate() - Math.round((9 - i) * 0.5));
          return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
        };
        baseMultiplier = 0.96;
        break;
      case '1M':
        pointsCount = 15;
        labelFormat = (i) => {
          const d = new Date();
          d.setDate(d.getDate() - Math.round((14 - i) * 2));
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        };
        baseMultiplier = 0.92;
        break;
      case '6M':
        pointsCount = 12;
        labelFormat = (i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - Math.round((11 - i) * 0.5));
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        };
        baseMultiplier = 0.82;
        break;
      case '1Y':
        pointsCount = 12;
        labelFormat = (i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - (11 - i));
          return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        };
        baseMultiplier = 0.72;
        break;
      case 'YTD':
      case '3Y':
      case '5Y':
      case 'MAX':
        pointsCount = 12;
        labelFormat = (i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - (11 - i) * 3);
          return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        };
        baseMultiplier = 0.55;
        break;
      default:
        pointsCount = 15;
        labelFormat = (i) => {
          const d = new Date();
          d.setDate(d.getDate() - Math.round((14 - i) * 2));
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        };
        baseMultiplier = 0.90;
    }

    const startPrice = currentPrice * baseMultiplier;
    const priceRange = currentPrice - startPrice;

    return Array.from({ length: pointsCount }).map((_, i) => {
      const progress = i / (pointsCount - 1);
      // Sine wave plus upward trend noise
      const noise = (Math.sin(i * 0.7) * 0.08 + Math.cos(i * 1.3) * 0.05) * startPrice;
      const calcPrice = Math.max(0.01, startPrice + progress * priceRange + noise);

      return {
        date: labelFormat(i, pointsCount),
        price: Number((i === pointsCount - 1 ? currentPrice : calcPrice).toFixed(2)),
      };
    });
  }

  /**
   * Generates normalized percentage returns (% change since start) comparing two assets
   */
  public getComparisonHistoricalData(ticker1: string, ticker2: string, timeframe: TimeFrame) {
    const data1 = this.getHistoricalDataForTimeFrame(ticker1, timeframe);
    const data2 = this.getHistoricalDataForTimeFrame(ticker2, timeframe);

    if (data1.length === 0) return [];

    const startPrice1 = data1[0].price || 1;
    const startPrice2 = data2[0]?.price || 1;

    return data1.map((pt1, i) => {
      const pt2 = data2[i] || data2[data2.length - 1] || { price: startPrice2 };
      const pctReturn1 = Number((((pt1.price - startPrice1) / startPrice1) * 100).toFixed(2));
      const pctReturn2 = Number((((pt2.price - startPrice2) / startPrice2) * 100).toFixed(2));

      return {
        date: pt1.date,
        price1: pt1.price,
        price2: pt2.price,
        pctReturn1,
        pctReturn2,
      };
    });
  }

  /**
   * Calculates ETF vs Direct Holding Overlaps
   */
  public calculateOverlapAnalysis(holdings: Holding[]): OverlapAnalysis {
    let totalPortfolioVal = 0;
    for (const h of holdings) totalPortfolioVal += h.marketValue;

    if (totalPortfolioVal <= 0) {
      return {
        totalOverlappingAssetsCount: 0,
        totalDirectEtfWeight: 0,
        topOverlappingHoldings: [],
        duplicationWarningText: 'No current holdings to evaluate overlap.',
      };
    }

    // Identify direct ETF holdings in portfolio
    const etfHoldings = holdings.filter((h) => h.assetType === 'ETF');
    const totalDirectEtfWeight = etfHoldings.reduce((sum, h) => sum + h.portfolioWeight, 0);

    // Map ticker -> overlap info
    const overlapMap: Record<string, OverlappingHolding> = {};

    for (const h of holdings) {
      overlapMap[h.ticker] = {
        ticker: h.ticker,
        companyName: h.companyName,
        directWeightInPortfolio: h.portfolioWeight,
        indirectWeightFromEtfs: 0,
        totalCombinedExposure: h.portfolioWeight,
        etfSources: [],
        overlapStatus: 'LOW',
      };
    }

    // Process ETF constituents
    for (const etf of etfHoldings) {
      const constituents = ETF_CONSTITUENTS_DATABASE[etf.ticker] || [];
      const etfPortfolioWeight = etf.portfolioWeight;

      for (const consti of constituents) {
        // indirect weight = (consti.weightInEtf / 100) * etfPortfolioWeight
        const indirectContribution = (consti.weightInEtf / 100) * etfPortfolioWeight;

        if (!overlapMap[consti.ticker]) {
          overlapMap[consti.ticker] = {
            ticker: consti.ticker,
            companyName: consti.companyName,
            directWeightInPortfolio: 0,
            indirectWeightFromEtfs: 0,
            totalCombinedExposure: 0,
            etfSources: [],
            overlapStatus: 'LOW',
          };
        }

        const target = overlapMap[consti.ticker];
        target.indirectWeightFromEtfs += indirectContribution;
        target.etfSources.push({
          etfTicker: etf.ticker,
          weightContribution: indirectContribution,
        });
      }
    }

    const allOverlaps: OverlappingHolding[] = [];
    for (const item of Object.values(overlapMap)) {
      item.totalCombinedExposure = Number(
        (item.directWeightInPortfolio + item.indirectWeightFromEtfs).toFixed(2)
      );

      // Only include items that have both direct holdings & ETF indirect contribution, or substantial combined exposure
      if (item.etfSources.length > 0 && item.directWeightInPortfolio > 0) {
        if (item.totalCombinedExposure > 15) {
          item.overlapStatus = 'HIGH';
        } else if (item.totalCombinedExposure > 8) {
          item.overlapStatus = 'MODERATE';
        } else {
          item.overlapStatus = 'LOW';
        }
        allOverlaps.push(item);
      }
    }

    allOverlaps.sort((a, b) => b.totalCombinedExposure - a.totalCombinedExposure);

    const highRiskCount = allOverlaps.filter((o) => o.overlapStatus === 'HIGH').length;
    let warning = 'Portfolio overlap is well-balanced across direct stocks and index ETFs.';
    if (highRiskCount > 0) {
      warning = `Warning: ${highRiskCount} asset(s) have significant exposure overlapping between direct positions and ETF holdings.`;
    }

    return {
      totalOverlappingAssetsCount: allOverlaps.length,
      totalDirectEtfWeight: Number(totalDirectEtfWeight.toFixed(2)),
      topOverlappingHoldings: allOverlaps,
      duplicationWarningText: warning,
    };
  }

  /**
   * Simulates real-time price ticks (Terminal live price updates)
   */
  public simulatePriceTick(): Record<string, Quote> {
    const updated: Record<string, Quote> = { ...this.quotes };

    for (const ticker of Object.keys(updated)) {
      const q = updated[ticker];
      // Small random fluctuation between -0.4% and +0.4%
      const deltaPct = (Math.random() - 0.49) * 0.8;
      const priceDelta = (q.price * deltaPct) / 100;

      const newPrice = Math.max(0.01, Number((q.price + priceDelta).toFixed(2)));
      const newChange = Number((q.change + priceDelta).toFixed(2));
      const newChangePct = Number(
        (((newPrice - q.previousClose) / q.previousClose) * 100).toFixed(2)
      );

      updated[ticker] = {
        ...q,
        price: newPrice,
        change: newChange,
        changePercent: newChangePct,
        dayHigh: Math.max(q.dayHigh, newPrice),
        dayLow: Math.min(q.dayLow, newPrice),
        lastUpdated: new Date().toISOString(),
      };
    }

    this.quotes = updated;
    return updated;
  }

  /**
   * Manual price override or stock addition
   */
  public updatePrice(ticker: string, price: number): Quote {
    const prev = this.quotes[ticker] || {
      ticker,
      price,
      change: 0,
      changePercent: 0,
      previousClose: price,
      dayHigh: price,
      dayLow: price,
      volume: 1000000,
      lastUpdated: new Date().toISOString(),
    };

    const change = price - prev.previousClose;
    const changePercent = (change / prev.previousClose) * 100;

    const newQuote: Quote = {
      ...prev,
      price,
      change,
      changePercent,
      lastUpdated: new Date().toISOString(),
    };

    this.quotes[ticker] = newQuote;
    return newQuote;
  }

  /**
   * Ticker Search & Autocomplete
   */
  public searchTickers(query: string): StockMetadata[] {
    const q = query.trim().toUpperCase();
    if (!q) return Object.values(this.metadataMap);

    return Object.values(this.metadataMap).filter(
      (m) =>
        m.ticker.includes(q) ||
        m.name.toUpperCase().includes(q) ||
        m.sector.toUpperCase().includes(q)
    );
  }
}

export const marketDataService = new MarketDataService();
