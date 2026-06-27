// api/news.js — InvestRight Live News API
// Uses NewsAPI.org free tier (1000 req/day)
// Set env var: NEWS_API_KEY in Vercel dashboard

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    // Return mock data if no API key configured yet
    return res.status(200).json({
      articles: getMockNews(),
      source: 'mock'
    });
  }

  try {
    // Query for Indian financial news
    // Using 'everything' endpoint with finance-focused queries
    const query = encodeURIComponent(
      'India stock market OR RBI OR Nifty OR Sensex OR mutual fund OR rupee OR economy India OR cryptocurrency India'
    );

    const url = `https://newsapi.org/v2/everything?` +
      `q=${query}` +
      `&language=en` +
      `&sortBy=publishedAt` +
      `&pageSize=30` +
      `&domains=economictimes.indiatimes.com,livemint.com,businesstoday.in,moneycontrol.com,financialexpress.com,reuters.com,bloomberg.com` +
      `&apiKey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'ok') {
      throw new Error(data.message || 'NewsAPI error');
    }

    return res.status(200).json({
      articles: data.articles || [],
      totalResults: data.totalResults,
      source: 'live'
    });

  } catch (err) {
    console.error('News API error:', err);

    // Fallback to mock on error
    return res.status(200).json({
      articles: getMockNews(),
      source: 'fallback',
      error_detail: err.message
    });
  }
}

// Mock news for when API key isn't set — realistic Indian finance headlines
function getMockNews() {
  return [
    {
      title: "RBI Keeps Repo Rate Unchanged at 6.5% — EMI Relief Nahi, Lekin Stability Milegi",
      description: "Reserve Bank of India ne Monetary Policy Committee meeting mein repo rate unchanged rakhne ka faisla kiya. Governor ne kaha ki inflation target range ke andar hai.",
      source: { name: "Economic Times" },
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      url: "https://economictimes.indiatimes.com"
    },
    {
      title: "Nifty 50 Hits New All-Time High of 25,400 — FII Buying Continues",
      description: "Foreign Institutional Investors ne is mahine ₹12,000 crore ki net buying ki. IT aur Banking stocks ne index ko upar push kiya.",
      source: { name: "Moneycontrol" },
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      url: "https://moneycontrol.com"
    },
    {
      title: "SBI Fixed Deposit Rates Revised Upward — Ab 7.5% Tak Return Mil Sakta Hai",
      description: "State Bank of India ne selected tenors pe FD rates 25 basis points badhaye hain. Senior citizens ko 0.5% additional benefit milega.",
      source: { name: "Business Today" },
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      url: "https://businesstoday.in"
    },
    {
      title: "Gold Prices Surge to ₹75,000 per 10g — Global Tensions Ke Wajah Se",
      description: "International tensions aur dollar weakness ke chalte gold ne new highs touch kiye. Sovereign Gold Bonds ka next tranche bhi announce hua.",
      source: { name: "LiveMint" },
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      url: "https://livemint.com"
    },
    {
      title: "Bitcoin Crosses $70,000 Again — Indian Investors Bhi Excited",
      description: "Bitcoin ne $70k milestone dobara cross kiya. Indian crypto exchanges pe trading volume 3x ho gayi. SEBI crypto regulation update expected.",
      source: { name: "Financial Express" },
      publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      url: "https://financialexpress.com"
    },
    {
      title: "Mutual Fund SIP Inflows Cross ₹21,000 Crore — Monthly Record",
      description: "AMFI data ke mutabik July 2025 mein SIP inflows ne monthly record toda. Retail investors ka confidence high hai.",
      source: { name: "Moneycontrol" },
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      url: "https://moneycontrol.com"
    },
    {
      title: "India GDP Growth 7.2% — Strong Manufacturing Data Pushes Numbers Up",
      description: "Q1 GDP data better-than-expected raha. Manufacturing sector ne 8.3% growth dikhayi. Services sector bhi robust rahi.",
      source: { name: "Reuters" },
      publishedAt: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
      url: "https://reuters.com"
    },
    {
      title: "US Federal Reserve Rate Cut Hints — India Pe Kya Hoga Asar?",
      description: "Fed Chair Powell ne rate cut signals diye hain. Emerging markets including India mein FII inflows badhne ki umeed.",
      source: { name: "Economic Times" },
      publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      url: "https://economictimes.indiatimes.com"
    }
  ];
}
