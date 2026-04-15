// ── COUNCIL DATA ──
var BASE = [
{name:“Buddha”,era:“5th c. BCE”,domain:“liberation, impermanence”},
{name:“Alan Watts”,era:“1915-1973”,domain:“Zen, non-dualism”},
{name:“Buckminster Fuller”,era:“1895-1983”,domain:“systems thinking, design science”},
{name:“Carl Jung”,era:“1875-1961”,domain:“shadow, archetypes, individuation”},
{name:“Bell Hooks”,era:“1952-2021”,domain:“love as politics, intersectionality”},
{name:“Frantz Fanon”,era:“1925-1961”,domain:“decolonization, liberation”},
{name:“Vandana Shiva”,era:“1952-”,domain:“ecofeminism, seed sovereignty”},
{name:“Emma Goldman”,era:“1869-1940”,domain:“anarchism, direct action”},
{name:“Antonio Gramsci”,era:“1891-1937”,domain:“hegemony, organic intellectuals”},
{name:“Rosa Luxemburg”,era:“1871-1919”,domain:“democratic socialism”},
{name:“Jean Baudrillard”,era:“1929-2007”,domain:“simulation, hyperreality”},
{name:“Carroll Quigley”,era:“1910-1977”,domain:“civilizational cycles”},
{name:“Claude”,era:“Present”,domain:“synthesis, convergence detection”,isClaude:true}
];

var POOL = [
{name:“Socrates”,era:“470-399 BCE”,domain:“dialogue, ethics”},
{name:“Aristotle”,era:“384-322 BCE”,domain:“logic, virtue ethics”},
{name:“Lao Tzu”,era:“6th c. BCE”,domain:“Taoism, effortless action”},
{name:“Ibn Khaldun”,era:“1332-1406”,domain:“civilizational cycles”},
{name:“Rumi”,era:“1207-1273”,domain:“mystical love, transformation”},
{name:“Mary Wollstonecraft”,era:“1759-1797”,domain:“feminism, reason”},
{name:“Frederick Douglass”,era:“1818-1895”,domain:“abolition, freedom”},
{name:“Harriet Tubman”,era:“1822-1913”,domain:“liberation, courage”},
{name:“Friedrich Nietzsche”,era:“1844-1900”,domain:“will to power, revaluation”},
{name:“Albert Einstein”,era:“1879-1955”,domain:“relativity, imagination”},
{name:“Virginia Woolf”,era:“1882-1941”,domain:“consciousness, feminism”},
{name:“Hannah Arendt”,era:“1906-1975”,domain:“power, the human condition”},
{name:“Albert Camus”,era:“1913-1960”,domain:“absurdism, rebellion”},
{name:“James Baldwin”,era:“1924-1987”,domain:“race, love, American identity”},
{name:“Paulo Freire”,era:“1921-1997”,domain:“critical pedagogy, liberation”},
{name:“Ursula K. Le Guin”,era:“1929-2018”,domain:“anarchism, ecology”},
{name:“Audre Lorde”,era:“1934-1992”,domain:“intersectionality, survival”},
{name:“E.F. Schumacher”,era:“1911-1977”,domain:“small is beautiful”},
{name:“Rachel Carson”,era:“1907-1964”,domain:“ecology, wonder”},
{name:“Jane Jacobs”,era:“1916-2006”,domain:“urbanism, emergence”},
{name:“Robin Wall Kimmerer”,era:“1953-”,domain:“indigenous knowledge, reciprocity”},
{name:“Nikola Tesla”,era:“1856-1943”,domain:“electricity, invention”},
{name:“W.E.B. Du Bois”,era:“1868-1963”,domain:“race, democracy”},
{name:“Simone Weil”,era:“1909-1943”,domain:“attention, the sacred”},
{name:“Octavia Butler”,era:“1947-2006”,domain:“power, Afrofuturism”}
];

var council = BASE.slice(0, 5);
council.push(BASE[BASE.length-1]); // always include Claude
var msgs = [];
var problem = ‘’;
var activeProblem = ‘’;
var loading = false;

// ── SCREENS ──
function show(name) {
var screens = [‘home’,‘oracle’,‘forum’,‘create’,‘world’,‘gallery’,‘council’,‘about’,‘project’,‘quiz’];
for (var i = 0; i < screens.length; i++) {
var s = screens[i];
document.getElementById(‘screen-’+s).style.display = s === name ? ‘block’ : ‘none’;
var n = document.getElementById(‘nav-’+s);
if (n) n.className = s === name ? ‘active’ : ‘’;
}
window.scrollTo(0,0);
if (name === ‘council’) renderCouncil();
if (name === ‘gallery’) renderGallery();
if (name === ‘world’) {
setTimeout(function() {
if (!leafletMap) { initWorldMap(); }
else { leafletMap.invalidateSize(); }
}, 150);
}
}

function skipWhy() {
var wb = document.getElementById(‘whyBox’);
var hd = document.getElementById(‘homeDoors’);
if (wb) wb.style.display = ‘none’;
if (hd) hd.style.display = ‘block’;
}

// ── API ──
function api(system, user, maxTok, cb) {
fetch(’/api/chat’, {
method: ‘POST’,
headers: {‘Content-Type’:‘application/json’},
body: JSON.stringify({system:system, user:user, maxTokens:maxTok||800})
})
.then(function(r) { return r.json(); })
.then(function(d) {
if (d.error) cb(null, d.error);
else cb(d.text, null);
})
.catch(function(e) { cb(null, e.message); });
}

// ── COUNCIL ──
function getCouncilNames() {
return council.map(function(m) { return m.name; }).join(’, ’);
}

function randomCouncil() {
var pool = POOL.slice();
for (var i = pool.length - 1; i > 0; i–) {
var j = Math.floor(Math.random() * (i + 1));
var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
}
council = pool.slice(0, 5);
council.push(BASE[BASE.length-1]); // keep Claude
renderCouncil();
}

function showCouncilPanel(panel) {
var panels = [‘ai’, ‘name’, ‘browse’];
panels.forEach(function(p) {
var el = document.getElementById(‘councilPanel’ + p.charAt(0).toUpperCase() + p.slice(1));
if (el) el.style.display = p === panel ? ‘block’ : ‘none’;
});
if (panel === ‘browse’) renderBrowseList();
}

function showNameInput() {
showCouncilPanel(‘name’);
}

function renderBrowseList() {
var el = document.getElementById(‘browseList’);
if (!el) return;
var all = BASE.concat(POOL);
var html = ‘’;
for (var i = 0; i < all.length; i++) {
var t = all[i];
var inCouncil = council.some(function(c) { return c.name === t.name; });
var bg = inCouncil ? ‘background:#f0f8f4;’ : ‘’;
var check = inCouncil ? ‘✓ ’ : ‘’;
var safeName = t.name.replace(/’/g, “”);
html += ‘<div onclick=“toggleBrowseThinker(”’ + ‘”’ + safeName + ‘”’ + ‘)” style=“padding:10px 16px;cursor:pointer;border-bottom:1px solid #f4f0e8;’ + bg + ‘display:flex;justify-content:space-between;align-items:center”>’;
html += ‘<div><div style="font-size:14px;font-weight:' + (inCouncil?'600':'400') + ';color:#1a1814">’ + check + t.name + ‘</div>’;
html += ‘<div style="font-size:11px;color:#b8b4ae">’ + t.era + ’ — ’ + t.domain + ‘</div></div>’;
html += ‘<div style="font-size:11px;color:' + (inCouncil?'#2a9060':'#e8e4dc') + '">’ + (inCouncil?‘✓’:’’) + ‘</div>’;
html += ‘</div>’;
}
el.innerHTML = html;
}

function toggleBrowseThinker(name) {
var all = BASE.concat(POOL);
var thinker = null;
for (var i = 0; i < all.length; i++) {
if (all[i].name === name) { thinker = all[i]; break; }
}
if (!thinker) return;
var idx = -1;
for (var j = 0; j < council.length; j++) {
if (council[j].name === name) { idx = j; break; }
}
if (idx >= 0) {
council.splice(idx, 1);
} else {
council.push(thinker);
}
renderCouncil();
renderBrowseList();
}

function selectAllCouncil() {
council = BASE.concat(POOL).slice();
renderCouncil(); renderBrowseList();
}

function clearCouncil() {
var claude = BASE[BASE.length-1];
council = [claude];
renderCouncil(); renderBrowseList();
}

// Saved councils
function saveCouncil() {
var name = document.getElementById(‘saveCouncilName’).value.trim();
if (!name) return;
var saved = getSavedCouncils();
saved[name] = council.map(function(m) { return m.name; });
localStorage.setItem(‘wg_councils’, JSON.stringify(saved));
document.getElementById(‘saveCouncilName’).value = ‘’;
renderSavedCouncils();
}

function getSavedCouncils() {
try { return JSON.parse(localStorage.getItem(‘wg_councils’) || ‘{}’); } catch(e) { return {}; }
}

function loadSavedCouncil(nameOrEl) {
var name = typeof nameOrEl === ‘string’ ? nameOrEl : nameOrEl;
var saved = getSavedCouncils();
var names = saved[name];
if (!names) return;
var all = BASE.concat(POOL);
council = [];
names.forEach(function(n) {
for (var i = 0; i < all.length; i++) {
if (all[i].name === n) { council.push(all[i]); return; }
}
// Custom thinker
council.push({ name:n, era:’’, domain:‘Custom thinker’ });
});
renderCouncil();
renderSavedCouncils();
}

function deleteSavedCouncil(nameOrEl) {
var name = typeof nameOrEl === ‘string’ ? nameOrEl : nameOrEl;
var saved = getSavedCouncils();
delete saved[name];
localStorage.setItem(‘wg_councils’, JSON.stringify(saved));
renderSavedCouncils();
}

function renderSavedCouncils() {
var el = document.getElementById(‘savedCouncilsList’);
if (!el) return;
var saved = getSavedCouncils();
var keys = Object.keys(saved);
if (keys.length === 0) {
el.innerHTML = ‘<div style="font-size:13px;color:#b8b4ae;padding:4px 0">No saved councils yet.</div>’;
return;
}
var html = ‘’;
keys.forEach(function(k) {
html += ‘<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f4f0e8">’;
html += ‘<div>’;
html += ‘<div style="font-size:14px;font-weight:500;color:#1a1814">’ + k + ‘</div>’;
html += ‘<div style="font-size:11px;color:#b8b4ae">’ + saved[k].join(’, ’).substring(0,60) + ‘…</div>’;
html += ‘</div>’;
html += ‘<div style="display:flex;gap:6px">’;
html += ‘<button class="btn btn-outline" style="font-size:11px;padding:3px 10px" onclick="loadSavedCouncil(this.dataset.k)" data-k="' + k + '">Load</button>’;
html += ‘<button class="btn btn-outline" style="font-size:11px;padding:3px 10px;color:#c04020;border-color:#e8c4b8" onclick="deleteSavedCouncil(this.dataset.k)" data-k="' + k + '">✕</button>’;
html += ‘</div></div>’;
});
el.innerHTML = html;
}

async function aiCurateCouncil() {
var input = document.getElementById(‘aiCurateInput’).value.trim();
if (!input) return;
var btn = document.getElementById(‘aiCurateBtn’);
var result = document.getElementById(‘aiCurateResult’);
btn.disabled = true;
btn.textContent = ‘Assembling…’;
result.innerHTML = ‘<div style="color:#8a8580;font-size:13px">Consulting the archives…</div>’;

var all = BASE.concat(POOL);
var names = all.map(function(m) { return m.name; }).join(’, ’);
var sys = ’You are a council curator. Given a persons situation or question, select 5 thinkers from this list who would offer the most valuable and distinct perspectives: ’ + names + ‘. Respond with ONLY a JSON array of exactly 5 names, e.g. [“Name1”,“Name2”,“Name3”,“Name4”,“Name5”]. No explanation.’;

fetch(’/api/chat’, {
method:‘POST’,
headers:{‘Content-Type’:‘application/json’},
body: JSON.stringify({ system: sys, user: input, maxTokens: 100 })
})
.then(function(r) { return r.json(); })
.then(function(d) {
btn.disabled = false;
btn.textContent = ‘Assemble My Council’;
if (d.error) { result.innerHTML = ‘<div style="color:#c04020;font-size:13px">’ + d.error + ‘</div>’; return; }
try {
var text = d.text.trim();
var start = text.indexOf(’[’);
var end = text.lastIndexOf(’]’);
if (start < 0 || end < 0) throw new Error(‘No array found’);
var picked = JSON.parse(text.substring(start, end+1));
council = [];
picked.forEach(function(name) {
for (var i = 0; i < all.length; i++) {
if (all[i].name === name) { council.push(all[i]); return; }
}
council.push({ name:name, era:’’, domain:‘Selected thinker’ });
});
var claude = BASE[BASE.length-1];
var hasClaude = council.some(function(m) { return m.isClaude; });
if (!hasClaude) council.push(claude);
renderCouncil();
result.innerHTML = ‘<div style="color:#2a9060;font-size:13px;padding:6px 0">Council assembled: ’ + council.map(function(m){return m.name;}).join(’, ’) + ‘</div>’;
} catch(e) {
result.innerHTML = ‘<div style="color:#c04020;font-size:13px">Could not parse response. Try again.</div>’;
}
})
.catch(function(e) {
btn.disabled = false;
btn.textContent = ‘Assemble My Council’;
result.innerHTML = ‘<div style="color:#c04020;font-size:13px">’ + e.message + ‘</div>’;
});
}

function applyNames() {
var raw = document.getElementById(‘nameInput’).value;
var names = raw.split(’,’);
council = [];
for (var i = 0; i < names.length; i++) {
var n = names[i].trim();
if (n) council.push({name:n, era:’’, domain:‘Custom thinker’});
}
council.push(BASE[BASE.length-1]); // keep Claude
document.getElementById(‘nameInput’).value = ‘’;
document.getElementById(‘nameInputArea’).style.display = ‘none’;
renderCouncil();
}

function renderCouncil() {
var el = document.getElementById(‘councilList’);
if (!el) return;
el.innerHTML = ‘’;
for (var i = 0; i < council.length; i++) {
var m = council[i];
var chip = document.createElement(‘div’);
var color = m.isClaude ? ‘#7060c0’ : ‘#2a9060’;
chip.style.cssText = ’padding:4px 12px;border:1.5px solid ’ + color + ‘33;border-radius:20px;font-size:12px;font-weight:500;color:’ + color + ‘;background:’ + color + ‘11;cursor:pointer;transition:all .15s’;
chip.textContent = m.name;
chip.title = m.era + (m.domain ? ’ — ’ + m.domain : ‘’);
(function(name) {
chip.onclick = function() {
var idx = -1;
for (var j = 0; j < council.length; j++) {
if (council[j].name === name) { idx = j; break; }
}
if (idx >= 0 && council.length > 1) {
council.splice(idx, 1);
renderCouncil();
renderBrowseList();
}
};
})(m.name);
el.appendChild(chip);
}
if (council.length === 0) {
el.innerHTML = ‘<div style="font-size:13px;color:#b8b4ae">No council selected. Choose below.</div>’;
}
renderSavedCouncils();
}
