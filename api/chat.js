const https = require('https');
module.exports = async function(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: 'No API key' });
  const b = req.body || {};
  const payload = JSON.stringify({ model: 'claude-sonnet-4-5-20251001', max_tokens: b.maxTokens || 1000, system: b.system || '', messages: [{ role: 'user', content: b.user || '' }] });
  return new Promise((resolve) => {
    const r = https.request({ hostname: 'api.anthropic.com', path: '/v1/messages', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload), 'x-api-key': key, 'anthropic-version': '2023-06-01' } }, (resp) => {
      let d = '';
      resp.on('data', c => d += c);
      resp.on('end', () => {
        try {
          const j = JSON.parse(d);
          if (resp.statusCode !== 200) { res.status(resp.statusCode).json({ error: j.error?.message || d }); }
          else { res.status(200).json({ text: j.content.filter(x => x.type === 'text').map(x => x.text).join('') }); }
        } catch(e) { res.status(500).json({ error: e.message }); }
        resolve();
      });
    });
    r.on('error', e => { res.status(500).json({ error: e.message }); resolve(); });
    r.write(payload);
    r.end();
  });
};
