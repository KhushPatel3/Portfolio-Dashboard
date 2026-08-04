import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini AI Server Endpoint for Grounded Market Insights
  app.post('/api/market-insights', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: 'GEMINI_API_KEY environment variable is missing.',
          message: 'Please set your Gemini API key in AI Studio Secrets settings.',
        });
      }

      const { query, holdingsList } = req.body || {};

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const userPrompt = `
You are a senior Wall Street quantitative analyst and macro strategist.
Use real-time Google Search data to analyze the stock market, specific earnings calls, macroeconomic indicators, and stock catalysts right now.

${holdingsList ? `Context - User Portfolio Holdings: ${holdingsList}` : ''}
${query ? `User specific inquiry: "${query}"` : 'Perform a comprehensive real-time market report.'}

Please cover these three distinct structural dimensions in clear, professional detail:
1. PAST PERFORMANCE & WHY: How the market/stocks performed recently and the specific historical factors/macro reasons (why).
2. CURRENT DRIVERS & CATALYSTS: What the market/stocks are doing right now, today's earnings calls, Federal Reserve policy, inflation, and key catalysts driving price action.
3. FUTURE FORECAST & BOOMS/FALLS: What boom or fall is anticipated in the near-to-medium term, upcoming earnings events, AI mega-trends, risks, and strategic guidance.

Be concise, highly quantitative, professional, and actionable. Avoid disclaimer fluffs.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: userPrompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const analysisText = response.text || 'No market analysis content returned.';

      // Extract grounding metadata chunks and search queries
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const searchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

      const sources = chunks
        .filter((c: any) => c.web?.uri && c.web?.title)
        .map((c: any) => ({
          title: c.web.title,
          url: c.web.uri,
        }));

      return res.json({
        success: true,
        analysis: analysisText,
        sources,
        searchQueries,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Error generating market insights:', err);
      return res.status(500).json({
        error: 'Failed to generate market insights',
        details: err?.message || 'Internal server error',
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
