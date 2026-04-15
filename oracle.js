// ── ORACLE ──
// ── ORACLE EXTRAS ──
var oracleMode = ‘personal’;
var oracleDoc = null;
var oracleConvHistory = [];

var ORACLE_MODE_DESC = {
personal: ‘Bring your real questions — personal, professional, existential. Completely private.’,
global: ‘Ask about world events, civilizational questions, historical patterns, or geopolitical dynamics.’,
synthesis: ‘Upload a document or describe an idea. The council will analyze, challenge, and synthesize.’
};

function setOracleMode(mode) {
oracleMode = mode;
document.getElementById(‘oracleModeDesc’).textContent = ORACLE_MODE_DESC[mode];
var btns = { personal:‘oModePers’, global:‘oModeGlob’, synthesis:‘oModeSync’ };
Object.keys(btns).forEach(function(m) {
var btn = document.getElementById(btns[m]);
if (btn) {
btn.style.borderColor = m === mode ? ‘#1a1814’ : ‘’;
btn.style.color = m === mode ? ‘#1a1814’ : ‘’;
btn.style.fontWeight = m === mode ? ‘600’ : ‘’;
}
});
var placeholder = {
personal: ‘What is on your mind?’,
global: ‘What is happening in the world that you want to understand?’,
synthesis: ‘Describe what you want the council to analyze…’
};
var input = document.getElementById(‘oracleInput’);
if (input) input.placeholder = placeholder[mode] || placeholder.personal;
}

function handleOracleDoc(input) {
var file = input.files[0];
if (!file) return;
var reader = new FileReader();
reader.onload = function(e) {
oracleDoc = { name: file.name, text: e.target.result.substring(0, 8000) };
document.getElementById(‘oracleDocName’).textContent = file.name + ’ loaded’;
document.getElementById(‘oracleDocName’).style.display = ‘block’;
document.getElementById(‘oracleDocClear’).style.display = ‘inline-flex’;
document.getElementById(‘oracleDocLabel’).textContent = file.name;
};
reader.readAsText(file);
}

function clearOracleDoc() {
oracleDoc = null;
document.getElementById(‘oracleDocFile’).value = ‘’;
document.getElementById(‘oracleDocName’).style.display = ‘none’;
document.getElementById(‘oracleDocClear’).style.display = ‘none’;
document.getElementById(‘oracleDocLabel’).innerHTML = ‘📎 Attach a document (PDF or text)<input type="file" accept=".txt,.pdf,.md" id="oracleDocFile" style="display:none" onchange="handleOracleDoc(this)">’;
}

function oracleFollowUp() {
var input = document.getElementById(‘oracleFollowInput’);
if (!input || !input.value.trim()) return;
var q = input.value.trim();
input.value = ‘’;
// Append to oracle messages as a new user question
var msgs = document.getElementById(‘oracleMsgs’);
var userDiv = document.createElement(‘div’);
userDiv.className = ‘chat-msg-user’;
userDiv.style.cssText = ‘align-self:flex-end;max-width:85%;background:#1a1814;color:#fff;padding:8px 12px;border-radius:12px;font-size:14px;margin:4px 0’;
userDiv.textContent = q;
msgs.appendChild(userDiv);
msgs.scrollTop = msgs.scrollHeight;
// Re-run oracle with follow-up context
oracleConvHistory.push({ role:‘user’, content: q });
doOracleCall(q);
}

function doOracleCall(q) {
if (loading) return;
loading = true;
document.getElementById(‘oracleBtn’).disabled = true;
var msgs = document.getElementById(‘oracleMsgs’);

var think = document.createElement(‘div’);
think.className = ‘thinking’;
think.id = ‘think-oracle’;
think.innerHTML = ‘<span>The Council</span><div class="dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>’;
msgs.appendChild(think);
msgs.scrollTop = msgs.scrollHeight;

var docContext = oracleDoc ? ‘Document provided: “’ + oracleDoc.name + ‘”\n\n’ + oracleDoc.text.substring(0,3000) + ‘\n\n’ : ‘’;
var modeHint = {
personal: ‘This is a personal question. Be warm, specific, and practically useful.’,
global: ‘This is a question about world affairs. Draw on historical patterns and your unique perspective.’,
synthesis: ‘Analyze this carefully. Identify what is strong, what is missing, and what matters most.’
}[oracleMode] || ‘’;

var histContext = oracleConvHistory.slice(-4).map(function(m){
return (m.role === ‘user’ ? ’Person: ’ : ‘Council: ‘) + m.content;
}).join(’\n’);

var sys = ’You are facilitating wisdom from a council: ’ + getCouncilNames() + ‘.\n\n’ +
modeHint + ‘\n\n’ +
‘Select 3 most relevant voices. For each:\nSPEAKER: [name]\n[1-2 sentences]\n\nThen:\nCONSENSUS:\n[2-3 sentence synthesis]\n\n’ +
(histContext ? ‘Prior conversation:\n’ + histContext + ‘\n\n’ : ‘’) +
(docContext ? docContext : ‘’) +
‘Be specific and honest. No platitudes.’;

api(sys, q, 1200, function(text, err) {
loading = false;
document.getElementById(‘oracleBtn’).disabled = false;
var t = document.getElementById(‘think-oracle’);
if (t) t.parentNode.removeChild(t);
if (err) {
document.getElementById(‘oracleErr’).innerHTML = ‘<div class="error">’ + err + ‘</div>’;
return;
}
oracleConvHistory.push({ role:‘assistant’, content: text });
var parsed = tryParseOracle(text);
if (parsed) {
msgs.appendChild(parsed);
} else {
var div = document.createElement(‘div’);
div.className = ‘msg-consensus’;
div.innerHTML = ‘<div class="lbl">The Council</div><div class="txt">’ + text.split(’\n’).join(’<br>’) + ‘</div>’;
msgs.appendChild(div);
}
msgs.scrollTop = msgs.scrollHeight;
document.getElementById(‘oracleFollowUp’).style.display = ‘block’;
});
}

function oracleQuery() {
var q = document.getElementById(‘oracleInput’).value.trim();
if (!q || loading) return;
oracleConvHistory = [];
var msgs = document.getElementById(‘oracleMsgs’);
msgs.innerHTML = ‘’;
var userDiv = document.createElement(‘div’);
userDiv.className = ‘chat-msg-user’;
userDiv.style.cssText = ‘align-self:flex-end;background:#1a1814;color:#fff;padding:8px 12px;border-radius:12px;font-size:14px;margin-bottom:4px’;
userDiv.textContent = q;
msgs.appendChild(userDiv);
document.getElementById(‘oracleFollowUp’).style.display = ‘none’;
loading = false; // reset for doOracleCall
doOracleCall(q);
return; // rest of old code skipped
loading = true;
document.getElementById(‘oracleBtn’).disabled = true;
var msgs_el = document.getElementById(‘oracleMsgs’);
msgs_el.innerHTML = ‘<div class="msg-sys">You ask: “’ + q + ‘”</div><div class="thinking" id="think-oracle"><span>The Council</span><div class="dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div></div>’;

var sys = ’You are facilitating wisdom for someone with a real question. Council: ’ + getCouncilNames() + ‘.\n\nSelect 3 most relevant voices. For each write:\nSPEAKER: [name]\n[1-2 sentence perspective]\n\nThen:\nCONSENSUS:\n[2-3 sentence distilled wisdom]\n\nBe warm and specific.’;

api(sys, q, 1000, function(text, err) {
loading = false;
document.getElementById(‘oracleBtn’).disabled = false;
var think = document.getElementById(‘think-oracle’);
if (think) think.parentNode.removeChild(think);
if (err) {
document.getElementById(‘oracleErr’).innerHTML = ‘<div class="error">’ + err + ‘</div>’;
return;
}
// Try structured parse first, fallback to raw display
var parsed = tryParseOracle(text);
if (parsed) {
msgs_el.appendChild(parsed);
} else {
// Fallback: show raw response in consensus style
var div = document.createElement(‘div’);
div.className = ‘msg-consensus’;
div.innerHTML = ‘<div class="lbl">The Council</div><div class="txt">’ + text.replace(/\n/g,’<br>’) + ‘</div>’;
msgs_el.appendChild(div);
}
// Share button
var shareDiv = document.createElement(‘div’);
shareDiv.style.cssText = ‘padding:8px 20px;border-top:1px solid #e8e4dc’;
shareDiv.innerHTML = ‘<button class="btn btn-outline" style="font-size:12px;padding:6px 14px" onclick="shareOracleToGallery()">Share to Gallery</button>’;
msgs_el.parentNode.appendChild(shareDiv);
lastOracleQ = q;
lastOracleText = text;
});
}

var lastOracleQ = ‘’;
var lastOracleText = ‘’;

function shareOracleToGallery() {
shareToGallery(‘insight’, ’Oracle: ’ + lastOracleQ.substring(0,50), lastOracleText.substring(0,300));
}

function tryParseOracle(text) {
var lines = text.split(’\n’);
var hasSpeaker = false;
for (var li = 0; li < lines.length; li++) {
if (lines[li].trim().indexOf(‘SPEAKER:’) === 0) { hasSpeaker = true; break; }
}
if (!hasSpeaker) return null;

var frag = document.createDocumentFragment();
var i = 0;
while (i < lines.length) {
var line = lines[i].trim();
if (line.indexOf(‘SPEAKER:’) === 0) {
var name = line.replace(‘SPEAKER:’, ‘’).trim();
var buf = [];
i++;
while (i < lines.length && lines[i].trim().indexOf(‘SPEAKER:’) !== 0 && lines[i].trim().indexOf(‘CONSENSUS:’) !== 0) {
if (lines[i].trim()) buf.push(lines[i].trim());
i++;
}
if (buf.length) {
var div = document.createElement(‘div’);
div.className = ‘msg-speech’;
div.innerHTML = ‘<div class="spk">’ + name + ‘</div><div class="body">’ + buf.join(’ ‘) + ‘</div>’;
frag.appendChild(div);
}
} else if (line.indexOf(‘CONSENSUS:’) === 0) {
i++;
var cbuf = [];
while (i < lines.length) {
if (lines[i].trim()) cbuf.push(lines[i].trim());
i++;
}
if (cbuf.length) {
var cdiv = document.createElement(‘div’);
cdiv.className = ‘msg-consensus’;
cdiv.innerHTML = ‘<div class="lbl">Council Synthesis</div><div class="txt">’ + cbuf.join(’ ’) + ‘</div>’;
frag.appendChild(cdiv);
}
} else { i++; }
}
return frag;
}

// ── FORUM ──
function startDebate() {
var val = document.getElementById(‘forumInput’).value.trim();
if (!val) return;
problem = val;
msgs = [];
document.getElementById(‘forumSetup’).style.display = ‘none’;
document.getElementById(‘forumActive’).style.display = ‘block’;
document.getElementById(‘debateBanner’).textContent = val;
document.getElementById(‘forumMsgs’).innerHTML = ‘<div class="msg-sys">The council convenes</div>’;
nextTurn();
}

function resetForum() {
problem = ‘’;
msgs = [];
document.getElementById(‘forumSetup’).style.display = ‘block’;
document.getElementById(‘forumActive’).style.display = ‘none’;
document.getElementById(‘forumInput’).value = ‘’;
}

var lastIdx = -1;
function pickSpeaker() {
var available = [];
for (var i = 0; i < council.length; i++) {
if (i !== lastIdx) available.push(i);
}
var idx = available[Math.floor(Math.random() * available.length)];
lastIdx = idx;
return idx;
}

function nextTurn() {
if (loading) return;
loading = true;
document.getElementById(‘nextBtn’).disabled = true;

var idx = pickSpeaker();
var speaker = council[idx];
var hist = ‘’;
for (var i = 0; i < msgs.length && i < 6; i++) {
hist += msgs[i].name + ‘: “’ + msgs[i].text + ‘”\n’;
}

var sys = ‘You are ’ + speaker.name + ’ (’ + speaker.era + ’), known for: ’ + speaker.domain + ‘.\n\nCouncil debate on: “’ + problem + ’”.\nOther voices: ’ + getCouncilNames() + ‘.\n’ + (hist ? ‘Recent:\n’ + hist : ‘’) + ’\nSpeak as ’ + speaker.name + ‘. 2-4 sentences. Specific, provocative. No preamble.’;

var container = document.getElementById(‘forumMsgs’);
var think = document.createElement(‘div’);
think.className = ‘thinking’;
think.id = ‘think-forum’;
think.innerHTML = ‘<span>’ + speaker.name + ‘</span><div class="dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>’;
container.appendChild(think);
container.scrollTop = container.scrollHeight;

api(sys, ‘Continue the debate.’, 500, function(text, err) {
loading = false;
document.getElementById(‘nextBtn’).disabled = false;
var t = document.getElementById(‘think-forum’);
if (t) t.parentNode.removeChild(t);
if (err) {
document.getElementById(‘forumErr’).innerHTML = ‘<div class="error">’ + err + ‘</div>’;
return;
}
msgs.push({name: speaker.name, text: text});
var div = document.createElement(‘div’);
div.className = ‘msg-speech’;
div.innerHTML = ‘<div class="spk">’ + speaker.name + ‘</div><div class="body">’ + text + ‘</div>’;
container.appendChild(div);
container.scrollTop = container.scrollHeight;
});
}

function synthesize() {
if (loading || msgs.length < 2) return;
loading = true;
document.getElementById(‘synthBtn’).disabled = true;

var hist = ‘’;
for (var i = 0; i < msgs.length; i++) {
hist += msgs[i].name + ‘: “’ + msgs[i].text + ‘”\n’;
}

var sys = ‘You are Claude, synthesizer. Debate on: “’ + problem + ‘”.\n\nWrite a 2-3 sentence synthesis of the key insight from this debate. Then write one actionable next step.\n\nFormat:\nSYNTHESIS: [synthesis]\nACTION: [one concrete action]’;

var container = document.getElementById(‘forumMsgs’);
var think = document.createElement(‘div’);
think.className = ‘thinking’;
think.id = ‘think-synth’;
think.innerHTML = ‘<span>Claude synthesizing…</span><div class="dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>’;
container.appendChild(think);

api(sys, ‘Debate:\n’ + hist, 600, function(text, err) {
loading = false;
document.getElementById(‘synthBtn’).disabled = false;
var t = document.getElementById(‘think-synth’);
if (t) t.parentNode.removeChild(t);
if (err) return;
var div = document.createElement(‘div’);
div.className = ‘msg-consensus’;
div.innerHTML = ‘<div class="lbl">Synthesis</div><div class="txt">’ + text + ‘</div><div style="margin-top:10px"><button class="btn btn-outline" style="font-size:12px;padding:6px 14px" onclick="shareForumToGallery()">Share to Gallery</button></div>’;
container.appendChild(div);
container.scrollTop = container.scrollHeight;
lastSynthText = text;
});
}

// ── CREATE ──
function triggerCreate() {
var theme = document.getElementById(‘createTheme’).value.trim();
if (!theme || loading) return;
var form = document.getElementById(‘createForm’).value;
var tone = document.getElementById(‘createTone’).value.trim();
loading = true;
document.getElementById(‘createBtn’).disabled = true;

var container = document.getElementById(‘createMsgs’);
container.innerHTML = ‘<div class="msg-sys">The council writes: “’ + theme + ‘”</div>’;

var voices = council.slice(0, 3);
var idx = 0;
var pieces = [];

function nextVoice() {
if (idx >= voices.length) {
doSynthesis();
return;
}
var voice = voices[idx];
idx++;
var think = document.createElement(‘div’);
think.className = ‘thinking’;
think.id = ‘think-create’;
think.innerHTML = ‘<span>’ + voice.name + ‘</span><div class="dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>’;
container.appendChild(think);

```
var sys = 'You are ' + voice.name + ' (' + voice.era + '), known for: ' + voice.domain + '.\n\nWrite a ' + form + ' about: "' + theme + '"' + (tone ? ', tone: ' + tone : '') + '.\n\nWrite in your authentic voice. 6-16 lines. Only the ' + form + ', no title or preamble.';

api(sys, 'Write your ' + form, 500, function(text, err) {
  var t = document.getElementById('think-create');
  if (t) t.parentNode.removeChild(t);
  if (!err && text) {
    pieces.push({name: voice.name, text: text});
    var div = document.createElement('div');
    div.className = 'msg-speech';
    div.innerHTML = '<div class="spk">' + voice.name + '</div><div class="body" style="font-style:italic;white-space:pre-wrap">' + text + '</div>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }
  nextVoice();
});
```

}

function doSynthesis() {
if (pieces.length === 0) {
loading = false;
document.getElementById(‘createBtn’).disabled = false;
return;
}
var think = document.createElement(‘div’);
think.className = ‘thinking’;
think.id = ‘think-synth2’;
think.innerHTML = ‘<span>The council weaves…</span><div class="dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>’;
container.appendChild(think);

```
var all = '';
for (var i = 0; i < pieces.length; i++) {
  all += pieces[i].name + ':\n' + pieces[i].text + '\n\n';
}
var sys2 = 'Synthesize a collective ' + form + ' weaving these voices into one coherent piece. Not a summary. A new creation. Only the ' + form + '.';

api(sys2, all, 700, function(text, err) {
  loading = false;
  document.getElementById('createBtn').disabled = false;
  var t = document.getElementById('think-synth2');
  if (t) t.parentNode.removeChild(t);
  if (!err && text) {
    var div = document.createElement('div');
    div.className = 'msg-consensus';
    div.innerHTML = '<div class="lbl">The Council Writes as One</div><div class="txt" style="white-space:pre-wrap">' + text + '</div><div style="margin-top:10px"><button class="btn btn-outline" style="font-size:12px;padding:6px 14px" onclick="shareCreateToGallery()">Share to Gallery</button></div>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    lastCreateTheme = document.getElementById('createTheme').value;
    lastCreateText = text;
  }
});
```

}

nextVoice();
}
