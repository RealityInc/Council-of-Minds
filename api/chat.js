const https = require(‘https’);

module.exports = async function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);

if (req.method === ‘OPTIONS’) return res.status(200).end();
if (req.method !== ‘POST’) return res.status(405).json({ error: ‘Method not allowed’ });

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) return res.status(500).json({ error: ‘ANTHROPIC_API_KEY not set’ });

let body = req.body;
if (typeof body === ‘string’) {
try { body = JSON.parse(body); } catch(e) { return res.status(400).json({ error: ‘Invalid JSON’ }); }
}

const { system, user, maxTokens = 1000 } = body || {};
if (!user) return res.status(400).json({ error: ‘Missing user message’ });

const payload = JSON.stringify({
model: ‘claude-sonnet-4-5’,
max_tokens: parseInt(maxTokens) || 1000,
system: (system && system.trim()) ? system : undefined,
messages: [{ role: ‘user’, content: String(user) }],
});

return new Promise((resolve) => {
const options = {
hostname: ‘api.anthropic.com’,
path: ‘/v1/messages’,
method: ‘POST’,
headers: {
‘Content-Type’: ‘application/json’,
‘Content-Length’: Buffer.byteLength(payload),
‘x-api-key’: apiKey,
‘anthropic-version’: ‘2023-06-01’,
},
};

```
const req2 = https.request(options, (r) => {
  let data = '';
  r.on('data', (chunk) => { data += chunk; });
  r.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if (r.statusCode !== 200) {
        res.status(r.statusCode).json({ error: parsed.error?.message || data });
      } else {
        const text = parsed.content.filter(b => b.type === 'text').map(b => b.text).join('');
        res.status(200).json({ text });
      }
    } catch(e) {
      res.status(500).json({ error: 'Parse error: ' + e.message });
    }
    resolve();
  });
});

req2.on('error', (e) => {
  res.status(500).json({ error: 'Request error: ' + e.message });
  resolve();
});

req2.write(payload);
req2.end();
```

});
};
