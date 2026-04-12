module.exports = async function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);

if (req.method === ‘OPTIONS’) return res.status(200).end();
if (req.method !== ‘POST’) return res.status(405).json({ error: ‘Method not allowed’ });

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) return res.status(500).json({ error: ‘ANTHROPIC_API_KEY not configured’ });

let body = req.body;
if (typeof body === ‘string’) {
try { body = JSON.parse(body); } catch(e) { return res.status(400).json({ error: ‘Invalid JSON’ }); }
}

const { system, user, maxTokens = 1000 } = body || {};
if (!user) return res.status(400).json({ error: ‘Missing user message’ });

try {
const payload = {
model: ‘claude-sonnet-4-5’,
max_tokens: parseInt(maxTokens) || 1000,
messages: [{ role: ‘user’, content: String(user) }],
};
if (system && String(system).trim()) {
payload.system = String(system);
}

```
const r = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify(payload),
});

const raw = await r.text();

if (!r.ok) {
  let msg = raw;
  try { msg = JSON.parse(raw).error?.message || raw; } catch(e) {}
  return res.status(r.status).json({ error: 'Anthropic ' + r.status + ': ' + msg });
}

const data = JSON.parse(raw);
const text = data.content.filter(function(b) { return b.type === 'text'; }).map(function(b) { return b.text; }).join('');
return res.status(200).json({ text: text });
```

} catch (err) {
return res.status(500).json({ error: ’Proxy error: ’ + (err.message || ‘unknown’) });
}
};
