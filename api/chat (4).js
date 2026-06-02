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

  // Convert OpenAI-style messages to Gemini format
  // Separate system prompt from conversation
  const systemMsg = messages.find(m => m.role === 'system');
  const conversationMsgs = messages.filter(m => m.role !== 'system');

  const geminiContents = conversationMsgs.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: systemMsg
            ? { parts: [{ text: systemMsg.content }] }
            : undefined,
          contents: geminiContents,
          generationConfig: {
            maxOutputTokens: max_tokens,
            temperature: 0.7,
          }
        })
      }
    );

    const rawText = await geminiRes.text();

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error('Gemini non-JSON:', rawText);
      return res.status(502).json({ error: 'AI service error', detail: rawText.substring(0, 300) });
    }

    if (!geminiRes.ok) {
      console.error('Gemini error:', data);
      return res.status(geminiRes.status).json({ error: data?.error?.message || 'AI API error' });
    }

    // Convert Gemini response back to OpenAI-style format (so chat.html doesn't need to change)
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(502).json({ error: 'Empty response from AI' });
    }

    return res.status(200).json({
      choices: [{ message: { role: 'assistant', content: text } }]
    });

  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
