export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const symbols = ['^NSEI', '^BSESN', 'GC=F', 'SI=F', '^GSPC', '^IXIC', 'INR=X', 'CL=F'];

  async function fetchYahoo(symbol) {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`;
      const r = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(8000)
      });
      if (!r.ok) return null;
      const data = await r.json();
      const result = data?.chart?.result?.[0];
      if (!result) return null;
      const meta = result.meta;
      const price = meta.regularMarketPrice ?? meta.previousClose;
      const prev = meta.chartPreviousClose ?? meta.previousClose;
      return {
        symbol,
        price,
        change: ((price - prev) / prev) * 100,
        changeAmt: price - prev,
      };
    } catch { return null; }
  }

  async function fetchCrypto() {
    try {
      const r = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,tether&vs_currencies=usd,inr&include_24hr_change=true',
        { signal: AbortSignal.timeout(8000) }
      );
      if (!r.ok) return null;
      return await r.json();
    } catch { return null; }
  }

  try {
    const [yahooResults, crypto] = await Promise.all([
      Promise.all(symbols.map(fetchYahoo)),
      fetchCrypto()
    ]);

    const yahoo = {};
    symbols.forEach((sym, i) => { yahoo[sym] = yahooResults[i]; });

    res.status(200).json({ yahoo, crypto, timestamp: Date.now() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
