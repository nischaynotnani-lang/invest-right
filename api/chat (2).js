module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const NVIDIA_KEY = process.env.NVIDIA_API_KEY;
  if (!NVIDIA_KEY) return res.status(500).json({ error: 'API key not configured on server' });

  const { messages, max_tokens = 1024 } = req.body || {};
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array required' });
  }

  try {
    const nvidiaRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta/llama-4-maverick',
        messages,
        max_tokens,
        temperature: 0.7,
        stream: false,
      }),
    });

    // Read as text first — never crash on non-JSON responses
    const rawText = await nvidiaRes.text();

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      // NVIDIA returned non-JSON (e.g. "Host not in allowlist")
      console.error('NVIDIA non-JSON response:', rawText);
      return res.status(502).json({ error: 'AI service unavailable', detail: rawText.substring(0, 200) });
    }

    if (!nvidiaRes.ok) {
      console.error('NVIDIA error:', data);
      return res.status(nvidiaRes.status).json({ error: data?.message || data?.detail || 'AI API error', detail: data });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error('Fetch error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
