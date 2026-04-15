// ── PLACE PROJECTS ──
var currentProject = null;
var savedProjects = [];

// Policy definitions - each has name, unit, baseline key, cost per point, impact weights
var POLICIES = [
{
id:‘energy’, name:‘Renewable Energy Transition’, unit:’%’,
desc:‘Build solar, wind, and grid infrastructure’,
costPerPoint: 0.8, // $B per percentage point
timeYears: 10,
impacts: { flourishing:0.3, ecological:0.5, stability:0.2 }
},
{
id:‘water’, name:‘Clean Water Infrastructure’, unit:’%’,
desc:‘Pipelines, treatment plants, access programs’,
costPerPoint: 0.5,
timeYears: 7,
impacts: { flourishing:0.5, ecological:0.2, stability:0.3 }
},
{
id:‘food’, name:‘Food Security Programs’, unit:’%’,
desc:‘Agricultural investment, distribution networks, nutrition programs’,
costPerPoint: 0.4,
timeYears: 5,
impacts: { flourishing:0.5, ecological:0.1, stability:0.4 }
},
{
id:‘land’, name:‘Protected Land Expansion’, unit:’%’,
desc:‘National parks, marine reserves, conservation corridors’,
costPerPoint: 0.3,
timeYears: 8,
impacts: { flourishing:0.1, ecological:0.7, stability:0.2 }
},
{
id:‘wealth’, name:‘Wealth Distribution Reform’, unit:‘pts’,
desc:‘Tax policy, social programs, public services investment’,
costPerPoint: 1.2,
timeYears: 15,
impacts: { flourishing:0.4, ecological:0.1, stability:0.5 }
},
{
id:‘conflict’, name:‘Conflict Reduction and Governance’, unit:‘pts’,
desc:‘Justice system, anti-corruption, civil society programs’,
costPerPoint: 0.6,
timeYears: 12,
impacts: { flourishing:0.3, ecological:0.1, stability:0.6 }
}
];

var projectSliders = {}; // policy id -> current delta value

function startProject(placeName, baselineData, dataSource) {
currentProject = {
place: placeName,
baseline: baselineData,
dataSource: dataSource || ‘World Bank’,
policies: {},
created: new Date().toLocaleDateString()
};

// Reset sliders
projectSliders = {};
POLICIES.forEach(function(p) { projectSliders[p.id] = 0; });

// Update header
document.getElementById(‘projectPlaceName’).textContent = placeName;
document.getElementById(‘projectDataSource’).textContent = dataSource || ‘World Bank’;

// Set baseline metrics
var fl = baselineData.flourishing || 50;
var ec = baselineData.ecological || 50;
var st = baselineData.stability || 50;
document.getElementById(‘projMetFl’).textContent = fl;
document.getElementById(‘projMetEc’).textContent = ec;
document.getElementById(‘projMetSt’).textContent = st;

// Render policy sliders
renderProjectPolicies(baselineData);
updateProjectOutcomes();

// Clear previous debate
var debateMsgs = document.getElementById(‘projectDebateMessages’);
debateMsgs.innerHTML = ‘’;
debateMsgs.style.display = ‘none’;
document.getElementById(‘projectSaveMsg’).style.display = ‘none’;

show(‘project’);
}

function renderProjectPolicies(baseline) {
var container = document.getElementById(‘projectPolicies’);
if (!container) return;
var html = ‘’;
POLICIES.forEach(function(policy) {
var baseVal = baseline[policy.id] || 0;
var delta = projectSliders[policy.id] || 0;
var cost = Math.round(delta * policy.costPerPoint * 10) / 10;
html += ‘<div class="card" style="padding:14px 16px">’;
html += ‘<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">’;
html += ‘<div style="flex:1">’;
html += ‘<div style="font-size:14px;font-weight:600;color:#1a1814;margin-bottom:2px">’ + policy.name + ‘</div>’;
html += ‘<div style="font-size:12px;color:#8a8580">’ + policy.desc + ‘</div>’;
html += ‘</div>’;
html += ‘<div style="text-align:right;flex-shrink:0;margin-left:12px">’;
html += ‘<div style="font-size:13px;font-weight:600;color:#b8922a" id="pv-' + policy.id + '">+’ + delta + policy.unit + ‘</div>’;
html += ‘<div style="font-size:11px;color:#b8b4ae" id="pc-' + policy.id + '">’ + (cost > 0 ? ‘$’ + cost + ‘B’ : ‘no cost’) + ‘</div>’;
html += ‘</div></div>’;
html += ‘<div style="display:flex;align-items:center;gap:10px">’;
html += ’<span style="font-size:11px;color:#b8b4ae;flex-shrink:0">Baseline: ’ + baseVal + policy.unit + ‘</span>’;
html += ‘<input type=“range” min=“0” max=”’ + Math.max(20, 100 - baseVal) + ‘” value=”’ + delta + ’” ’;
html += ’style=“flex:1;accent-color:#d4aa44” ’;
html += ‘oninput=“updatePolicySlider('’ + policy.id + ‘',this.value)”>’;
html += ‘<span style="font-size:11px;color:#1a1814;flex-shrink:0;min-width:40px;text-align:right">+’ + delta + ‘</span>’;
html += ‘</div>’;
html += ‘</div>’;
});
container.innerHTML = html;
}

function updatePolicySlider(policyId, val) {
projectSliders[policyId] = parseInt(val) || 0;
var policy = POLICIES.find(function(p) { return p.id === policyId; });
if (!policy) return;
var delta = projectSliders[policyId];
var cost = Math.round(delta * policy.costPerPoint * 10) / 10;
var pvEl = document.getElementById(‘pv-’ + policyId);
var pcEl = document.getElementById(‘pc-’ + policyId);
if (pvEl) pvEl.textContent = ‘+’ + delta + policy.unit;
if (pcEl) pcEl.textContent = cost > 0 ? ‘$’ + cost + ‘B’ : ‘no cost’;
updateProjectOutcomes();
}

function updateProjectOutcomes() {
if (!currentProject) return;
var baseline = currentProject.baseline;
var baseFl = baseline.flourishing || 50;
var baseEc = baseline.ecological || 50;
var baseSt = baseline.stability || 50;

var deltaFl = 0, deltaEc = 0, deltaSt = 0;
var totalCost = 0;
var maxYears = 0;

POLICIES.forEach(function(policy) {
var delta = projectSliders[policy.id] || 0;
if (delta === 0) return;
var weight = delta / 20; // normalize
deltaFl += policy.impacts.flourishing * weight * 8;
deltaEc += policy.impacts.ecological * weight * 8;
deltaSt += policy.impacts.stability * weight * 8;
totalCost += delta * policy.costPerPoint;
if (delta > 0) maxYears = Math.max(maxYears, policy.timeYears);
});

var newFl = Math.min(100, Math.round(baseFl + deltaFl));
var newEc = Math.min(100, Math.round(baseEc + deltaEc));
var newSt = Math.min(100, Math.round(baseSt + deltaSt));

document.getElementById(‘projOutFl’).textContent = newFl;
document.getElementById(‘projOutEc’).textContent = newEc;
document.getElementById(‘projOutSt’).textContent = newSt;

function delta(orig, updated) {
var d = updated - orig;
return d > 0 ? ‘<span style="color:#2a9060">+’ + d + ‘</span>’ :
d < 0 ? ‘<span style="color:#c04020">’ + d + ‘</span>’ : ‘’;
}
document.getElementById(‘projOutFlDelta’).innerHTML = delta(baseFl, newFl);
document.getElementById(‘projOutEcDelta’).innerHTML = delta(baseEc, newEc);
document.getElementById(‘projOutStDelta’).innerHTML = delta(baseSt, newSt);

document.getElementById(‘projTotalCost’).textContent = totalCost > 0 ? ‘$’ + Math.round(totalCost * 10) / 10 + ‘B’ : ‘$0’;
document.getElementById(‘projTimeline’).textContent = maxYears > 0 ? maxYears + ’ years’ : ‘No interventions yet’;
}

async function debateProject() {
if (!currentProject) return;
var btn = document.getElementById(‘projectDebateBtn’);
var msgs = document.getElementById(‘projectDebateMessages’);
btn.disabled = true;
btn.textContent = ‘Convening…’;
msgs.style.display = ‘block’;
msgs.innerHTML = ‘’;

// Build summary of active policies
var activePolicies = [];
POLICIES.forEach(function(p) {
var d = projectSliders[p.id] || 0;
if (d > 0) {
activePolicies.push(p.name + ’ (+’ + d + p.unit + ‘, $’ + Math.round(d * p.costPerPoint * 10)/10 + ‘B)’);
}
});

var place = currentProject.place;
var baseline = currentProject.baseline;
var summary = activePolicies.length > 0
? activePolicies.join(’, ’)
: ‘No specific interventions selected yet’;

var totalCost = 0;
POLICIES.forEach(function(p) { totalCost += (projectSliders[p.id]||0) * p.costPerPoint; });

var problemStatement = ’Place Project for ’ + place + ’. ’ +
’Baseline: Flourishing ’ + (baseline.flourishing||50) + ’/100, ’ +
’Ecological ’ + (baseline.ecological||50) + ’/100, ’ +
’Stability ’ + (baseline.stability||50) + ’/100. ’ +
’Proposed interventions: ’ + summary + ’. ’ +
‘Total investment: $’ + Math.round(totalCost*10)/10 + ’B. ’ +
‘What are the philosophical implications, likely unintended consequences, historical precedents, and most important considerations for this plan?’;

// Get 3 council voices
var voices = council.slice(0, 3);
var allPieces = [];

// Add header
var hdr = document.createElement(‘div’);
hdr.style.cssText = ‘padding:14px 16px;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#b8922a;border-bottom:1px solid #f4f0e8’;
hdr.textContent = ’Council Analysis — ’ + place;
msgs.appendChild(hdr);

for (var i = 0; i < voices.length; i++) {
var voice = voices[i];
var thinking = document.createElement(‘div’);
thinking.style.cssText = ‘padding:12px 16px;display:flex;align-items:center;gap:8px;color:#8a8580;font-size:13px’;
thinking.id = ‘proj-think-’ + i;
thinking.innerHTML = ‘<span>’ + voice.name + ‘</span><div class="dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>’;
msgs.appendChild(thinking);
msgs.scrollIntoView({ behavior:‘smooth’, block:‘end’ });

```
var sys = 'You are ' + voice.name + ' (' + voice.era + '), known for: ' + voice.domain + '. ' +
  'A person is designing a policy intervention for a real place. Respond in your authentic voice. ' +
  'Be specific, provocative, and historically grounded. 3-4 sentences. No preamble.';

try {
  var response = await new Promise(function(resolve, reject) {
    fetch('/api/chat', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ system:sys, user:problemStatement, maxTokens:400 })
    })
    .then(function(r){ return r.json(); })
    .then(function(d){ resolve(d.text || d.error); })
    .catch(reject);
  });

  var t = document.getElementById('proj-think-' + i);
  if (t) t.parentNode.removeChild(t);

  var div = document.createElement('div');
  div.style.cssText = 'padding:14px 16px;border-bottom:1px solid #f4f0e8';
  div.innerHTML = '<div style="font-size:11px;font-weight:600;color:#b8922a;margin-bottom:5px;letter-spacing:.5px">' + voice.name.toUpperCase() + '</div>' +
    '<div style="font-size:14px;line-height:1.7;color:#4a4640">' + response + '</div>';
  msgs.appendChild(div);
  allPieces.push(voice.name + ': ' + response);
} catch(e) {
  var t2 = document.getElementById('proj-think-' + i);
  if (t2) t2.parentNode.removeChild(t2);
}
```

}

// Synthesis
if (allPieces.length > 0) {
var synthThink = document.createElement(‘div’);
synthThink.style.cssText = ‘padding:12px 16px;display:flex;align-items:center;gap:8px;color:#8a8580;font-size:13px’;
synthThink.id = ‘proj-synth-think’;
synthThink.innerHTML = ‘<span>Synthesizing…</span><div class="dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>’;
msgs.appendChild(synthThink);

```
try {
  var synthSys = 'You are Claude, synthesizing a council debate about a policy plan for ' + place + '. ' +
    'Distill the key insight in 2-3 sentences. What is the single most important thing this person should know?';
  var synthResponse = await new Promise(function(resolve, reject) {
    fetch('/api/chat', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ system:synthSys, user:allPieces.join('\n\n'), maxTokens:300 })
    })
    .then(function(r){ return r.json(); })
    .then(function(d){ resolve(d.text || ''); })
    .catch(reject);
  });
  var st2 = document.getElementById('proj-synth-think');
  if (st2) st2.parentNode.removeChild(st2);
  var synthDiv = document.createElement('div');
  synthDiv.style.cssText = 'padding:14px 16px;background:#fdf8ee;border-top:2px solid #f0cc70';
  synthDiv.innerHTML = '<div style="font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#b8922a;margin-bottom:6px">Council Synthesis</div>' +
    '<div style="font-size:14px;line-height:1.7;color:#1a1814;font-style:italic">' + synthResponse + '</div>';
  msgs.appendChild(synthDiv);
} catch(e) {
  var st3 = document.getElementById('proj-synth-think');
  if (st3) st3.parentNode.removeChild(st3);
}
```

}

btn.disabled = false;
btn.textContent = ‘Convene the Council Again’;
}

function saveProject() {
if (!currentProject) return;
var title = document.getElementById(‘projectTitle’).value.trim();
if (!title) { title = currentProject.place + ’ Project’; }

var activePolicies = [];
POLICIES.forEach(function(p) {
var d = projectSliders[p.id] || 0;
if (d > 0) activePolicies.push({ name:p.name, delta:d, unit:p.unit });
});

var saved = {
title: title,
place: currentProject.place,
baseline: currentProject.baseline,
policies: activePolicies,
date: new Date().toLocaleDateString(),
projectedFl: document.getElementById(‘projOutFl’).textContent,
projectedEc: document.getElementById(‘projOutEc’).textContent,
projectedSt: document.getElementById(‘projOutSt’).textContent
};

try {
var existing = JSON.parse(localStorage.getItem(‘wg_projects’) || ‘[]’);
existing.unshift(saved);
localStorage.setItem(‘wg_projects’, JSON.stringify(existing));
} catch(e) {}

// Also share summary to gallery
var summary = ‘Place project for ’ + currentProject.place + ‘: ’ +
activePolicies.map(function(p){ return p.name + ’ +’ + p.delta + p.unit; }).join(’, ’) + ’. ’ +
’Projected flourishing: ’ + document.getElementById(‘projOutFl’).textContent + ‘/100.’;
shareToGallery(‘scenario’, title, summary);

var msg = document.getElementById(‘projectSaveMsg’);
msg.textContent = ‘Project saved and shared to Gallery.’;
msg.style.display = ‘block’;
document.getElementById(‘projectTitle’).value = ‘’;
}