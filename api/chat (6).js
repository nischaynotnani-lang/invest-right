export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) return res.status(500).json({ error: 'API key not configured' });

  const { messages, max_tokens = 1024 } = req.body || {};
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array required' });
  }

  const systemMsg = messages.find(m => m.role === 'system');
  const conversationMsgs = messages.filter(m => m.role !== 'system');

  // Gemini needs alternating user/model roles — ensure it starts with user
  const geminiContents = conversationMsgs.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const requestBody = {
    contents: geminiContents,
    generationConfig: {
      maxOutputTokens: max_tokens,
      temperature: 0.7,
    }
  };

  // Only add system instruction if exists
  if (systemMsg) {
    requestBody.systemInstruction = {
      parts: [{ text: systemMsg.content }]
    };
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

    const rawText = await geminiRes.text();
    console.log('Status:', geminiRes.status, '| Response:', rawText.substring(0, 800));

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      return res.status(502).json({ error: 'AI service error', detail: rawText.substring(0, 300) });
    }

    if (!geminiRes.ok) {
      return res.status(geminiRes.status).json({ error: data?.error?.message || 'AI API error' });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(502).json({ error: 'Empty response from AI' });
    }

    return res.status(200).json({
      choices: [{ message: { role: 'assistant', content: text } }]
    });

  } catch (err) {
    console.error('Fetch error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
