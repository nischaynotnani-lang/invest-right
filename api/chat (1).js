export const config = { runtime: 'edge' };

export default async function handler(req) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: corsHeaders
    });
  }

  try {
    const body = await req.json();
    const { messages, max_tokens = 1024 } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'messages required' }), {
        status: 400, headers: corsHeaders
      });
    }

    const NVIDIA_KEY = process.env.NVIDIA_API_KEY;
    if (!NVIDIA_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500, headers: corsHeaders
      });
    }

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

    const data = await nvidiaRes.json();

    if (!nvidiaRes.ok) {
      console.error('NVIDIA error:', data);
      return new Response(JSON.stringify({ error: data.message || 'NVIDIA API error', detail: data }), {
        status: nvidiaRes.status, headers: corsHeaders
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200, headers: corsHeaders
    });

  } catch (err) {
    console.error('Handler error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), {
      status: 500, headers: corsHeaders
    });
  }
}
