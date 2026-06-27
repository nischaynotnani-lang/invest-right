// api/news-impact.js — InvestRight News Impact AI API
// Uses OpenRouter (same as chat.js)

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

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://myinvestright.vercel.app',
        'X-Title': 'InvestRight'
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        max_tokens: 600,
        messages: [
          {
            role: 'system',
            content: `Tu InvestRight ka financial advisor hai jo Hinglish mein baat karta hai — jaise ek smart dost.
Jab koi financial news aaye, tujhe EXACTLY yeh format mein respond karna hai (JSON only, koi extra text nahi, no markdown backticks):
{"summary":"2-3 line mein seedha baat — is khabar ka aam investor pe kya matlab hai","impacts":[{"label":"FD / Bank Deposits","direction":"up","reason":"Short 1 line Hindi-English mix"},{"label":"Stocks / Equity","direction":"down","reason":"Short 1 line"},{"label":"Gold","direction":"neutral","reason":"Short 1 line"},{"label":"Mutual Funds","direction":"up","reason":"Short 1 line"}],"advice":"Ek line mein kya karna chahiye ya nahi karna chahiye"}
direction field mein sirf "up", "down", ya "neutral" likho.
Tone: casual, friendly, Hinglish. Simple words. No jargon.`
          },
          {
            role: 'user',
            content: `Yeh news ka impact bata:\n\nHeadline: ${title}\nDescription: ${description || 'N/A'}\nSource: ${source || 'Unknown'}`
          }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'OpenRouter API error');
    }

    const raw = data.choices?.[0]?.message?.content || '';

    let parsed;
    try {
      const clean = raw.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      return res.status(200).json({ 
        summary: raw, 
        impacts: [], 
        advice: '' 
      });
    }

    return res.status(200).json(parsed);

  } catch (err) {
    console.error('Impact API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
