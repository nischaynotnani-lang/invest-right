// api/news-impact.js — InvestRight News Impact AI API
// Proxies Anthropic API call server-side to avoid CORS

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, description, source } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'News title required' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: `Tu InvestRight ka financial advisor hai jo Hinglish mein baat karta hai — jaise ek smart dost.
Jab koi financial news aaye, tujhe EXACTLY yeh format mein respond karna hai (JSON only, koi extra text nahi, no markdown backticks):
{"summary":"2-3 line mein seedha baat — is khabar ka aam investor pe kya matlab hai","impacts":[{"label":"FD / Bank Deposits","direction":"up|down|neutral","reason":"Short 1 line Hindi-English mix"},{"label":"Stocks / Equity","direction":"up|down|neutral","reason":"Short 1 line"},{"label":"Gold","direction":"up|down|neutral","reason":"Short 1 line"},{"label":"Mutual Funds","direction":"up|down|neutral","reason":"Short 1 line"}],"advice":"Ek line mein kya karna chahiye ya nahi karna chahiye"}
Tone: casual, friendly, Hinglish. Simple words. No jargon.`,
        messages: [{
          role: 'user',
          content: `Yeh news ka impact bata:\n\nHeadline: ${title}\nDescription: ${description || 'N/A'}\nSource: ${source || 'Unknown'}`
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Anthropic API error');
    }

    const raw = data.content?.[0]?.text || '';

    let parsed;
    try {
      const clean = raw.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      return res.status(200).json({ raw });
    }

    return res.status(200).json(parsed);

  } catch (err) {
    console.error('Impact API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
